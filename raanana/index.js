const BUSINESS_LAYER = 'Asakim_Raanana';

const FILTER_FIELD_MAP = {
    sug: 'value1',
    kvuza: 'value7',
    thum: 'value10'
};

const SEARCH_FIELD_MAP = {
    name: 'value0',
    address: 'value2'
};

const FEATURE_FIELD_MAP = {
    value0: 'שם העסק',
    value1: 'סוג',
    value2: 'כתובת',
    value5: 'שעות',
    value6: 'טלפון',
    value7: 'קבוצה',
    value8: 'כשרות',
    value9: 'פירוט',
    value10: 'תחום',
    // cnt_geocod: 'כמות עסקים לכתובת'
};

const FEATURE_FIELD_ORDER = [
    'value0',
    'value1',
    'value2',
    'value5',
    'value6',
    'value7',
    'value8',
    'value9',
    'value10',
    // 'cnt_geocod'
];

let categories = null;

let currentMode = 'search-name';
let selectedFilters = {
    thum: [],
    kvuza: [],
    sug: []
};

const IDENTIFY_MAX_PER_WINDOW = 10;
const IDENTIFY_WINDOW_MS = 60000;

const SEARCH_DEBOUNCE_MS = 600;
const SEARCH_MIN_CHARS = 2;
const SEARCH_RESULT_FIELDS = ['value0', 'value2', 'objectid'];
const RAANANA_SEARCH_WKT = 'POLYGON((185282.06 678676.6, 189479.69 678716.98, 189949.16 676891.25, 189828.1 676086.64, 190177.03 675446.98, 187656.27 675325.75, 186799.66 675800.76, 185830.08 676356.7, 185282.45 677992.5, 185282.06 678676.6))';

let mapClickBound = false;
let identifyRequestId = 0;
let identifyInFlight = false;
let pendingMapClick = null;
let identifyCallTimes = [];
let bubbleFeatures = [];

let searchDebounceTimer = null;
let searchRequestId = 0;
let searchSuggestionResults = [];
let activeSearchIndex = -1;

function initGovMap() {
    govmap.createMap('map', {
        center: {
            x: 187798.19,
            y: 677212.55,
        },
        extent: {
            xmin: 180012,
            ymin: 673087,
            xmax: 195579,
            ymax: 681343
        },
        level: 7,
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        visibleLayers: [BUSINESS_LAYER],
        background: '0',
        layersMode: 4,
        zoomButtons: true,
        identifyOnClick: false,
        showXY: true,
        onLoad: () => {
            govmap.setVisibleLayers([BUSINESS_LAYER]);
            bindMapClickIdentify();
        }
    });
}

function bindMapClickIdentify() {
    if (mapClickBound) {
        return;
    }

    mapClickBound = true;

    govmap.onEvent(govmap.events.CLICK).progress((event) => {
        handleMapClick(event);
    });
}

function pruneIdentifyCallTimes(now) {
    identifyCallTimes = identifyCallTimes.filter((time) => now - time < IDENTIFY_WINDOW_MS);
}

function hasIdentifyQuota(now) {
    pruneIdentifyCallTimes(now);
    return identifyCallTimes.length < IDENTIFY_MAX_PER_WINDOW;
}

function handleMapClick(event) {
    if (!event || !event.mapPoint) {
        return;
    }

    if (identifyInFlight) {
        pendingMapClick = event;
        return;
    }

    if (!hasIdentifyQuota(Date.now())) {
        return;
    }

    startIdentify(event);
}

function flushPendingMapClick() {
    const pending = pendingMapClick;
    pendingMapClick = null;

    if (!pending) {
        return;
    }

    handleMapClick(pending);
}

function startIdentify(event) {
    const x = event.mapPoint.x;
    const y = event.mapPoint.y;
    const screenPoint = event.screenPoint || { x: 0, y: 0 };
    const requestId = ++identifyRequestId;

    identifyInFlight = true;
    identifyCallTimes.push(Date.now());

    // identifyByXY returns empty while filterLayers is active, so use getLayerData
    // and keep only businesses that match the current search/category filter.
    const tolerancePromise = (typeof govmap.getMapTolerance === 'function')
        ? govmap.getMapTolerance()
        : Promise.resolve(40);

    tolerancePromise.then((tolerance) => {
        const radius = Math.max(Number(tolerance) || 40, 20);

        return govmap.getLayerData({
            LayerName: BUSINESS_LAYER,
            Point: { x, y },
            Radius: radius
        });
    }).then((result) => {
        if (requestId !== identifyRequestId) {
            return;
        }

        const features = collectLayerDataFeatures(result);

        if (features.length === 0) {
            closeFeatureBubble();
            return;
        }

        openFeatureBubble(features, screenPoint);
    }, () => {
        if (requestId === identifyRequestId) {
            closeFeatureBubble();
        }
    }).finally(() => {
        identifyInFlight = false;
        flushPendingMapClick();
    });
}

function isStrictlyEnglishLetters(text) {
    return /^[A-Za-z]+$/.test(text);
}

function getSearchQueryVariants(query) {
    if (!query) {
        return [];
    }

    if (currentMode !== 'search-name' || !isStrictlyEnglishLetters(query)) {
        return [query];
    }

    const variants = [
        query,
        query.toLowerCase(),
        query.toUpperCase(),
        query.charAt(0).toUpperCase() + query.slice(1).toLowerCase()
    ];

    return Array.from(new Set(variants));
}

function featureMatchesActiveFilters(entity) {
    if (isTextSearchMode()) {
        const query = document.getElementById('search-input').value.trim();

        if (!query) {
            return true;
        }

        const fieldKey = getActiveSearchFieldKey();
        const fieldValue = String(getEntityFieldValue(entity, fieldKey, FEATURE_FIELD_MAP[fieldKey]));
        const variants = getSearchQueryVariants(query);
        return variants.some((variant) => fieldValue.includes(variant));
    }

    const hasThum = selectedFilters.thum.length > 0;
    const hasKvuza = selectedFilters.kvuza.length > 0;
    const hasSug = selectedFilters.sug.length > 0;

    if (!hasThum && !hasKvuza && !hasSug) {
        return true;
    }

    const thum = String(getEntityFieldValue(entity, 'value10', FEATURE_FIELD_MAP.value10));
    const kvuza = String(getEntityFieldValue(entity, 'value7', FEATURE_FIELD_MAP.value7));
    const sug = String(getEntityFieldValue(entity, 'value1', FEATURE_FIELD_MAP.value1));

    if (hasThum && !selectedFilters.thum.includes(thum)) {
        return false;
    }

    if (hasKvuza && !selectedFilters.kvuza.includes(kvuza)) {
        return false;
    }

    if (hasSug && !selectedFilters.sug.includes(sug)) {
        return false;
    }

    return true;
}

function collectLayerDataFeatures(result) {
    const entities = (result && Array.isArray(result.data)) ? result.data : [];
    const matched = entities.filter((entity) => featureMatchesActiveFilters(entity));

    if (matched.length === 0) {
        return [];
    }

    const minDistance = Math.min(...matched.map((entity) => Number(entity.distance) || 0));
    return matched.filter((entity) => (Number(entity.distance) || 0) <= minDistance + 1.5);
}

function getEntityFieldValue(entity, fieldKey, hebrewLabel) {
    if (!entity) {
        return '';
    }

    const aliases = [fieldKey, hebrewLabel];
    const directSources = [entity, entity.attributes, entity.Values, entity.values];

    for (let i = 0; i < directSources.length; i++) {
        const source = directSources[i];

        if (!source || typeof source !== 'object' || Array.isArray(source)) {
            continue;
        }

        for (let j = 0; j < aliases.length; j++) {
            const value = source[aliases[j]];

            if (value != null && value !== '') {
                return value;
            }
        }
    }

    const fields = entity.fields || entity.Fields;

    if (!Array.isArray(fields)) {
        return '';
    }

    const match = fields.find((field) => {
        const name = String(field.fieldName || field.FieldName || '');
        const display = String(field.fieldDisplay || field.Caption || '');
        return name === fieldKey
            || name === hebrewLabel
            || display === hebrewLabel
            || display === fieldKey;
    });

    if (!match) {
        return '';
    }

    const value = match.fieldValue != null ? match.fieldValue : match.Value;
    return value == null ? '' : value;
}

function openFeatureBubble(features, screenPoint) {
    bubbleFeatures = features;
    renderFeatureBubble();
    showFeatureBubble(screenPoint);
}

function closeFeatureBubble() {
    const bubble = document.getElementById('feature-bubble');
    bubble.classList.add('is-hidden');
    bubble.hidden = true;
    bubbleFeatures = [];

    if (typeof govmap !== 'undefined' && typeof govmap.closeBubble === 'function') {
        govmap.closeBubble();
    }
}

function showFeatureBubble(screenPoint) {
    const bubble = document.getElementById('feature-bubble');
    const map = document.getElementById('map');

    bubble.classList.remove('is-hidden');
    bubble.hidden = false;

    const mapWidth = map.clientWidth;
    const mapHeight = map.clientHeight;
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    const clickX = Number(screenPoint.x) || mapWidth / 2;
    const clickY = Number(screenPoint.y) || mapHeight / 2;

    let left = clickX - bubbleWidth / 2;
    let top = clickY - bubbleHeight - 20;

    if (top < 88) {
        top = clickY + 20;
    }

    left = Math.max(8, Math.min(left, mapWidth - bubbleWidth - 8));
    top = Math.max(8, Math.min(top, mapHeight - bubbleHeight - 8));

    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';
}

function createFeatureFieldRow(fieldKey, value) {
    const row = document.createElement('div');
    row.className = 'feature-bubble-row';

    const dt = document.createElement('div');
    dt.className = 'feature-bubble-label';
    dt.textContent = FEATURE_FIELD_MAP[fieldKey];

    const dd = document.createElement('div');
    dd.className = 'feature-bubble-value';

    if (fieldKey === 'value6') {
        const link = document.createElement('a');
        link.href = 'tel:' + String(value).replace(/[^\d+]/g, '');
        link.textContent = String(value);
        dd.appendChild(link);
    } else {
        dd.textContent = String(value);
    }

    row.appendChild(dt);
    row.appendChild(dd);
    return row;
}

function createFeatureItem(feature, showHeading) {
    const item = document.createElement('article');
    item.className = 'feature-bubble-item';

    const businessName = getEntityFieldValue(feature, 'value0', FEATURE_FIELD_MAP.value0);

    if (showHeading && businessName) {
        const heading = document.createElement('h3');
        heading.className = 'feature-bubble-item-title';
        heading.textContent = businessName;
        item.appendChild(heading);
    }

    FEATURE_FIELD_ORDER.forEach((fieldKey) => {
        if (showHeading && fieldKey === 'value0') {
            return;
        }

        const label = FEATURE_FIELD_MAP[fieldKey];
        const value = getEntityFieldValue(feature, fieldKey, label);

        if (value === '' || value == null) {
            return;
        }

        item.appendChild(createFeatureFieldRow(fieldKey, value));
    });

    return item;
}

function renderFeatureBubble() {
    const total = bubbleFeatures.length;
    const titleEl = document.getElementById('feature-bubble-title');
    const bodyEl = document.getElementById('feature-bubble-body');
    const firstName = getEntityFieldValue(
        bubbleFeatures[0],
        'value0',
        FEATURE_FIELD_MAP.value0
    );

    titleEl.textContent = total > 1
        ? total + ' עסקים נבחרו'
        : (firstName || 'פרטי עסק');

    bodyEl.innerHTML = '';
    bodyEl.scrollTop = 0;

    bubbleFeatures.forEach((feature) => {
        bodyEl.appendChild(createFeatureItem(feature, total > 1));
    });
}

function quoteSqlValue(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

function buildFieldClause(fieldName, values) {
    if (values.length === 0) {
        return '';
    }

    if (values.length === 1) {
        return `${fieldName} = ${quoteSqlValue(values[0])}`;
    }

    const quoted = values.map((value) => quoteSqlValue(value)).join(', ');
    return `${fieldName} IN (${quoted})`;
}

function wrapOrGroups(groups) {
    if (groups.length === 0) {
        return '';
    }

    if (groups.length === 1) {
        return groups[0];
    }

    return groups.map((group) => `(${group})`).join(' OR ');
}

function getSelectedKvuzaForThum(thum) {
    if (!categories[thum]) {
        return [];
    }

    return Object.keys(categories[thum]).filter((kvuza) => {
        return selectedFilters.kvuza.includes(kvuza);
    });
}

function getSelectedSugForThumKvuza(thum, kvuza) {
    if (!categories[thum] || !categories[thum][kvuza]) {
        return [];
    }

    return categories[thum][kvuza].filter((sug) => {
        return selectedFilters.sug.includes(sug);
    });
}

function buildThumGroupClause(thum) {
    const thumClause = buildFieldClause(FILTER_FIELD_MAP.thum, [thum]);
    const relatedKvuza = getSelectedKvuzaForThum(thum);

    // No קבוצה picked for this תחום → show the whole תחום
    if (relatedKvuza.length === 0) {
        return thumClause;
    }

    const kvuzaGroups = relatedKvuza.map((kvuza) => {
        const parts = [
            thumClause,
            buildFieldClause(FILTER_FIELD_MAP.kvuza, [kvuza])
        ];
        const relatedSug = getSelectedSugForThumKvuza(thum, kvuza);

        // No סוג picked for this קבוצה → show the whole קבוצה
        if (relatedSug.length > 0) {
            parts.push(buildFieldClause(FILTER_FIELD_MAP.sug, relatedSug));
        }

        return parts.join(' AND ');
    });

    return wrapOrGroups(kvuzaGroups);
}

function buildWhereClause() {
    const hasThum = selectedFilters.thum.length > 0;
    const hasKvuza = selectedFilters.kvuza.length > 0;
    const hasSug = selectedFilters.sug.length > 0;

    if (!hasThum && !hasKvuza && !hasSug) {
        return '';
    }

    // Build one group per selected תחום so a קבוצה from תחום A
    // does not hide features from תחום B.
    if (hasThum) {
        const groups = selectedFilters.thum
            .filter((thum) => categories[thum])
            .map((thum) => buildThumGroupClause(thum));

        return wrapOrGroups(groups);
    }

    if (hasKvuza) {
        const groups = selectedFilters.kvuza.map((kvuza) => {
            const parts = [buildFieldClause(FILTER_FIELD_MAP.kvuza, [kvuza])];
            const relatedSug = [];

            Object.keys(categories).forEach((thum) => {
                relatedSug.push(...getSelectedSugForThumKvuza(thum, kvuza));
            });

            const uniqueSug = Array.from(new Set(relatedSug));

            if (uniqueSug.length > 0) {
                parts.push(buildFieldClause(FILTER_FIELD_MAP.sug, uniqueSug));
            }

            return parts.join(' AND ');
        });

        return wrapOrGroups(groups);
    }

    return buildFieldClause(FILTER_FIELD_MAP.sug, selectedFilters.sug);
}

function isTextSearchMode() {
    return currentMode === 'search-name' || currentMode === 'search-address';
}

function getActiveSearchFieldKey() {
    return currentMode === 'search-address'
        ? SEARCH_FIELD_MAP.address
        : SEARCH_FIELD_MAP.name;
}

function getSearchInputPlaceholder() {
    return currentMode === 'search-address'
        ? 'הקלידו כתובת...'
        : 'הקלידו שם עסק...';
}

function buildLikeClause(fieldName, query) {
    return `${fieldName} LIKE ${quoteSqlValue('%' + query + '%')}`;
}

// One field only — OR across name+address makes intersectFeatures return empty.
function buildSearchWhereClause(query) {
    if (!query) {
        return '';
    }

    const fieldName = getActiveSearchFieldKey();
    const clauses = getSearchQueryVariants(query).map((variant) => {
        return buildLikeClause(fieldName, variant);
    });

    return `(${clauses.join(' OR ')})`;
}

function applyLayerFilter(whereClause) {
    if (typeof govmap === 'undefined' || typeof govmap.filterLayers !== 'function') {
        return;
    }

    govmap.filterLayers({
        layerName: BUSINESS_LAYER,
        whereClause: whereClause,
        zoomToExtent: true
    });
}

function applyCategoryLayerFilter() {
    applyLayerFilter(buildWhereClause());
}

function applySearchLayerFilter(query) {
    applyLayerFilter(buildSearchWhereClause(query));
}

function getIntersectFieldValue(feature, fieldName, fieldIndex) {
    if (!feature) {
        return '';
    }

    if (Array.isArray(feature.Values)) {
        const value = feature.Values[fieldIndex];
        return value == null ? '' : value;
    }

    if (feature.Values && typeof feature.Values === 'object') {
        const value = feature.Values[fieldName];

        if (value != null && value !== '') {
            return value;
        }
    }

    return getEntityFieldValue(feature, fieldName, FEATURE_FIELD_MAP[fieldName] || fieldName);
}

function normalizeSearchSuggestions(result) {
    const rows = (result && Array.isArray(result.data))
        ? result.data
        : (Array.isArray(result) ? result : []);

    const suggestions = [];
    const seen = new Set();

    rows.forEach((row) => {
        const name = String(getIntersectFieldValue(row, 'value0', 0) || '').replace(/\s+/g, ' ').trim();
        const address = String(getIntersectFieldValue(row, 'value2', 1) || '').replace(/\s+/g, ' ').trim();
        const objectId = row.ObjectId != null
            ? row.ObjectId
            : getIntersectFieldValue(row, 'objectid', 2);

        if (!name && !address) {
            return;
        }

        const key = name + '|' + address + '|' + String(objectId || '');

        if (seen.has(key)) {
            return;
        }

        seen.add(key);
        suggestions.push({ name, address });
    });

    return suggestions;
}

// Separate from map filterLayers: query businesses inside Raanana for the dropdown.
// intersectFeatures returns empty when whereClause uses OR, so English case
// variants are queried one-by-one and then merged.
function searchBusinessSuggestions(query) {
    const variants = getSearchQueryVariants(query);

    if (variants.length === 0) {
        return Promise.resolve([]);
    }

    if (typeof govmap === 'undefined' || typeof govmap.intersectFeatures !== 'function') {
        return Promise.resolve([]);
    }

    const fieldName = getActiveSearchFieldKey();
    const requests = variants.map((variant) => {
        return govmap.intersectFeatures({
            geometry: RAANANA_SEARCH_WKT,
            layerName: BUSINESS_LAYER,
            fields: SEARCH_RESULT_FIELDS,
            whereClause: `(${buildLikeClause(fieldName, variant)})`,
            radius: 0
        }).then((result) => normalizeSearchSuggestions(result), () => []);
    });

    return Promise.all(requests).then((groups) => {
        const suggestions = [];
        const seen = new Set();

        groups.forEach((group) => {
            group.forEach((item) => {
                const key = item.name + '|' + item.address;

                if (seen.has(key)) {
                    return;
                }

                seen.add(key);
                suggestions.push(item);
            });
        });

        return suggestions;
    });
}

function getSearchResultsEl() {
    return document.getElementById('search-results');
}

function setSearchExpanded(isExpanded) {
    document.getElementById('search-input').setAttribute('aria-expanded', String(isExpanded));
}

function hideSearchSuggestions() {
    const resultsEl = getSearchResultsEl();
    resultsEl.hidden = true;
    resultsEl.innerHTML = '';
    searchSuggestionResults = [];
    activeSearchIndex = -1;
    setSearchExpanded(false);
}

function showSearchStatus(message) {
    const resultsEl = getSearchResultsEl();
    resultsEl.innerHTML = '';

    const status = document.createElement('div');
    status.className = 'search-results-status';
    status.textContent = message;
    resultsEl.appendChild(status);
    resultsEl.hidden = false;
    setSearchExpanded(true);
    searchSuggestionResults = [];
    activeSearchIndex = -1;
}

function updateActiveSearchItem() {
    const resultsEl = getSearchResultsEl();
    const items = resultsEl.querySelectorAll('.search-results-item');

    items.forEach((item, index) => {
        item.classList.toggle('is-active', index === activeSearchIndex);
    });

    if (activeSearchIndex >= 0 && items[activeSearchIndex]) {
        items[activeSearchIndex].scrollIntoView({ block: 'nearest' });
    }
}

function renderSearchSuggestions(suggestions) {
    const resultsEl = getSearchResultsEl();
    resultsEl.innerHTML = '';
    searchSuggestionResults = suggestions;
    activeSearchIndex = suggestions.length > 0 ? 0 : -1;

    if (suggestions.length === 0) {
        showSearchStatus('לא נמצאו תוצאות');
        return;
    }

    suggestions.forEach((suggestion, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'search-results-item' + (index === 0 ? ' is-active' : '');
        button.setAttribute('role', 'option');
        button.dataset.index = String(index);

        const nameEl = document.createElement('span');
        nameEl.className = 'search-results-name';
        nameEl.textContent = suggestion.name;
        button.appendChild(nameEl);

        if (suggestion.address) {
            const addressEl = document.createElement('span');
            addressEl.className = 'search-results-address';
            addressEl.textContent = suggestion.address;
            button.appendChild(addressEl);
        }

        button.addEventListener('mouseenter', () => {
            activeSearchIndex = index;
            updateActiveSearchItem();
        });

        button.addEventListener('click', () => {
            selectSearchSuggestion(index);
        });

        resultsEl.appendChild(button);
    });

    resultsEl.hidden = false;
    setSearchExpanded(true);
}

function selectSearchSuggestion(index) {
    const suggestion = searchSuggestionResults[index];

    if (!suggestion) {
        return;
    }

    const input = document.getElementById('search-input');
    const selectedValue = currentMode === 'search-address'
        ? (suggestion.address || suggestion.name)
        : (suggestion.name || suggestion.address);

    input.value = selectedValue;
    hideSearchSuggestions();
    applySearchLayerFilter(selectedValue);
}

function runDebouncedBusinessSearch() {
    if (!isTextSearchMode()) {
        return;
    }

    const query = document.getElementById('search-input').value.trim();

    if (query.length < SEARCH_MIN_CHARS) {
        hideSearchSuggestions();

        if (!query) {
            applySearchLayerFilter('');
        }

        return;
    }

    const requestId = ++searchRequestId;
    showSearchStatus('מחפש...');

    searchBusinessSuggestions(query).then((suggestions) => {
        if (requestId !== searchRequestId || !isTextSearchMode()) {
            return;
        }

        renderSearchSuggestions(suggestions);
    });
}

function scheduleBusinessSearch() {
    if (searchDebounceTimer !== null) {
        clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
        searchDebounceTimer = null;
        runDebouncedBusinessSearch();
    }, SEARCH_DEBOUNCE_MS);
}

function handleSearchInputKeydown(event) {
    const resultsEl = getSearchResultsEl();
    const isOpen = !resultsEl.hidden;

    if (event.key === 'ArrowDown' && isOpen && searchSuggestionResults.length > 0) {
        event.preventDefault();
        activeSearchIndex = (activeSearchIndex + 1) % searchSuggestionResults.length;
        updateActiveSearchItem();
        return;
    }

    if (event.key === 'ArrowUp' && isOpen && searchSuggestionResults.length > 0) {
        event.preventDefault();
        activeSearchIndex = activeSearchIndex <= 0
            ? searchSuggestionResults.length - 1
            : activeSearchIndex - 1;
        updateActiveSearchItem();
        return;
    }

    if (event.key === 'Enter') {
        event.preventDefault();

        if (isOpen && activeSearchIndex >= 0) {
            selectSearchSuggestion(activeSearchIndex);
            return;
        }

        if (searchDebounceTimer !== null) {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = null;
        }

        runDebouncedBusinessSearch();
        return;
    }

    if (event.key === 'Escape') {
        hideSearchSuggestions();
    }
}

async function loadCategories() {
    if (categories) {
        return;
    }

    const response = await fetch('business-categories.json');
    categories = await response.json();
}

function updateToggleCount(filterKey) {
    const root = document.querySelector(`.multi-select[data-filter="${filterKey}"]`);
    const countEl = root.querySelector('.multi-select-count');
    const count = selectedFilters[filterKey].length;

    countEl.textContent = String(count);
    countEl.classList.toggle('is-hidden', count === 0);
}

function createCheckboxItems(items, filterKey) {
    const menu = document.getElementById(`${filterKey}-menu`);
    menu.innerHTML = '';

    if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'multi-select-empty';
        empty.textContent = 'אין אפשרויות';
        menu.appendChild(empty);
        updateToggleCount(filterKey);
        return;
    }

    items.forEach((item) => {
        const wrapper = document.createElement('label');
        wrapper.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = item;
        checkbox.checked = selectedFilters[filterKey].includes(item);
        checkbox.dataset.filter = filterKey;

        const text = document.createElement('span');
        text.textContent = item;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(text);
        menu.appendChild(wrapper);
    });

    updateToggleCount(filterKey);
}

function getAllKvuza() {
    const kvuzaSet = new Set();

    Object.keys(categories).forEach((thum) => {
        Object.keys(categories[thum]).forEach((kvuza) => {
            kvuzaSet.add(kvuza);
        });
    });

    return kvuzaSet;
}

function getAllSug() {
    const sugSet = new Set();

    Object.keys(categories).forEach((thum) => {
        Object.keys(categories[thum]).forEach((kvuza) => {
            categories[thum][kvuza].forEach((sug) => {
                sugSet.add(sug);
            });
        });
    });

    return sugSet;
}

function getKvuzaForSelectedThum() {
    // Initial state: show every קבוצה
    if (selectedFilters.thum.length === 0) {
        return getAllKvuza();
    }

    const kvuzaSet = new Set();

    selectedFilters.thum.forEach((thum) => {
        if (!categories[thum]) {
            return;
        }

        Object.keys(categories[thum]).forEach((kvuza) => {
            kvuzaSet.add(kvuza);
        });
    });

    return kvuzaSet;
}

function getSugForCurrentSelection() {
    // Initial state: show every סוג
    if (selectedFilters.thum.length === 0 && selectedFilters.kvuza.length === 0) {
        return getAllSug();
    }

    const sugSet = new Set();
    const thumim = selectedFilters.thum.length > 0
        ? selectedFilters.thum
        : Object.keys(categories);

    thumim.forEach((thum) => {
        if (!categories[thum]) {
            return;
        }

        const kvuzot = selectedFilters.kvuza.length > 0
            ? selectedFilters.kvuza
            : Object.keys(categories[thum]);

        kvuzot.forEach((kvuza) => {
            if (!categories[thum][kvuza]) {
                return;
            }

            categories[thum][kvuza].forEach((sug) => {
                sugSet.add(sug);
            });
        });
    });

    return sugSet;
}

function fillThumOptions() {
    const thumList = Object.keys(categories).sort();
    createCheckboxItems(thumList, 'thum');
    updateKvuzaAndSug();
}

function updateKvuzaAndSug() {
    const kvuzaSet = getKvuzaForSelectedThum();
    const kvuzaList = Array.from(kvuzaSet).sort();

    selectedFilters.kvuza = selectedFilters.kvuza.filter((item) => kvuzaSet.has(item));
    createCheckboxItems(kvuzaList, 'kvuza');
    updateSugOptions();
}

function updateSugOptions() {
    const sugSet = getSugForCurrentSelection();
    const sugList = Array.from(sugSet).sort();

    selectedFilters.sug = selectedFilters.sug.filter((item) => sugSet.has(item));
    createCheckboxItems(sugList, 'sug');
}

function closeAllMenus() {
    document.querySelectorAll('.multi-select').forEach((root) => {
        root.classList.remove('is-open');
        root.querySelector('.multi-select-toggle').setAttribute('aria-expanded', 'false');
        root.querySelector('.multi-select-menu').hidden = true;
    });
}

function toggleMenu(filterKey) {
    const root = document.querySelector(`.multi-select[data-filter="${filterKey}"]`);
    const isOpen = root.classList.contains('is-open');

    closeAllMenus();

    if (isOpen) {
        return;
    }

    root.classList.add('is-open');
    root.querySelector('.multi-select-toggle').setAttribute('aria-expanded', 'true');
    root.querySelector('.multi-select-menu').hidden = false;
}

function setMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.mode-btn').forEach((button) => {
        const isActive = button.dataset.mode === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    document.querySelectorAll('[data-panel]').forEach((panel) => {
        const panelName = panel.dataset.panel;
        const showPanel = panelName === 'category'
            ? mode === 'category'
            : isTextSearchMode();

        panel.classList.toggle('is-hidden', !showPanel);
    });

    closeAllMenus();
    hideSearchSuggestions();

    if (mode === 'category') {
        handleSearch();
        document.querySelector('.multi-select[data-filter="thum"] .multi-select-toggle').focus();
        return;
    }

    const searchInput = document.getElementById('search-input');
    searchInput.placeholder = getSearchInputPlaceholder();
    const query = searchInput.value.trim();
    applySearchLayerFilter(query);

    if (query.length >= SEARCH_MIN_CHARS) {
        scheduleBusinessSearch();
    }

    searchInput.focus();
}

function handleSearch() {
    if (currentMode === 'category') {
        applyCategoryLayerFilter();
        return;
    }

    const query = document.getElementById('search-input').value.trim();
    applySearchLayerFilter(query);
}

function handleCheckboxChange(event) {
    const checkbox = event.target;
    const filterKey = checkbox.dataset.filter;
    const value = checkbox.value;

    if (!filterKey) {
        return;
    }

    if (checkbox.checked) {
        if (!selectedFilters[filterKey].includes(value)) {
            selectedFilters[filterKey].push(value);
        }
    } else {
        selectedFilters[filterKey] = selectedFilters[filterKey].filter((item) => item !== value);
    }

    updateToggleCount(filterKey);

    if (filterKey === 'thum') {
        // Selecting תחום refreshes both קבוצה and סוג
        updateKvuzaAndSug();
    } else if (filterKey === 'kvuza') {
        // Selecting קבוצה refreshes סוג
        updateSugOptions();
    }

    handleSearch();
}

function handleReset() {
    selectedFilters = {
        thum: [],
        kvuza: [],
        sug: []
    };

    closeAllMenus();
    fillThumOptions();
    applyCategoryLayerFilter();
}

async function initSearchBar() {
    await loadCategories();
    fillThumOptions();

    document.querySelectorAll('.mode-btn').forEach((button) => {
        button.addEventListener('click', () => {
            setMode(button.dataset.mode);
        });
    });

    document.querySelectorAll('.multi-select-toggle').forEach((button) => {
        button.addEventListener('click', () => {
            const filterKey = button.closest('.multi-select').dataset.filter;
            toggleMenu(filterKey);
        });
    });

    const searchInput = document.getElementById('search-input');

    searchInput.addEventListener('input', () => {
        scheduleBusinessSearch();
    });

    searchInput.addEventListener('keydown', handleSearchInputKeydown);

    document.getElementById('reset-btn').addEventListener('click', handleReset);

    document.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox' && event.target.dataset.filter) {
            handleCheckboxChange(event);
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.multi-select')) {
            closeAllMenus();
        }

        if (!event.target.closest('[data-panel="search"]')) {
            hideSearchSuggestions();
        }
    });
}

function initFeatureBubble() {
    document.getElementById('feature-bubble-close').addEventListener('click', () => {
        closeFeatureBubble();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideSearchSuggestions();
            closeFeatureBubble();
        }
    });
}

initSearchBar();
initFeatureBubble();
initGovMap();
