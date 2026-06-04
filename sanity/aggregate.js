function initAggregate() {
    populateAggregationOperationTypes();
    populateAggregationSrids();
    populateAggregationEnumSelects();
    setupAggregatePanel();
    setupOperationTypeToggle();
    setupViewModeToggle();
    setupClearLog();
    setupOperationFieldsPicker();
}

const AGGREGATE_OPERATION_TYPES = new Set([
    'count',
    'sum',
    'avg',
    'min',
    'max',
    'range',
    'histogram',
    'timeseries',
    'table'
]);

const OPERATION_TYPES_REQUIRING_FIELD = new Set([
    'sum',
    'avg',
    'min',
    'max',
    'range',
    'histogram'
]);

const NUMERIC_FIELD_OPERATION_TYPES = new Set([
    'sum',
    'avg',
    'min',
    'max',
    'range',
    'histogram'
]);

const LAYER_FILTER_FIELD_ARRAY_KEYS = [
    'fields',
    'Fields',
    'filterFields',
    'filter_fields',
    'layerFields',
    'LayerFields',
    'results',
    'result',
    'data',
    'items'
];

const FIELD_TYPE_ENUM_NAMES = [
    'fieldType',
    'FieldType',
    'layerFieldType',
    'LayerFieldType',
    'layerFilterFields',
    'LayerFilterFields',
    'aggFieldType',
    'AggFieldType'
];

const NUMERIC_FIELD_TYPE_CODES = new Set(['2']);

const NUMERIC_FIELD_TYPE_TOKENS = [
    'number',
    'numeric',
    'integer',
    'int',
    'short',
    'long',
    'double',
    'single',
    'float',
    'decimal',
    'smallint',
    'bigint',
    'oid'
];

let supportedAggregationOperationTypes = new Set(AGGREGATE_OPERATION_TYPES);
let supportedTimeseriesIntervals = new Set(['hour', 'day', 'week', 'month', 'year']);
let supportedTimeseriesAggregations = new Set(['count', 'sum', 'avg', 'min', 'max']);
let operationFieldsLayer = '';
let operationLayerFields = [];

function normalizeOperationType(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeTimeseriesAggregation(value) {
    const normalized = String(value || '').trim().toLowerCase();

    if (!normalized) {
        return '';
    }

    for (const aggregation of supportedTimeseriesAggregations) {

        if (normalized === aggregation || normalized.startsWith(aggregation)) {
            return aggregation;
        }
    }

    return normalized;
}

function operationTypeRequiresField(operationType, timeseriesAggregation) {

    if (OPERATION_TYPES_REQUIRING_FIELD.has(operationType)) {
        return true;
    }

    if (operationType !== 'timeseries') {
        return false;
    }

    return Boolean(timeseriesAggregation && timeseriesAggregation !== 'count');
}

function operationTypeRequiresNumericField(operationType, timeseriesAggregation) {
    if (NUMERIC_FIELD_OPERATION_TYPES.has(operationType)) {
        return true;
    }

    return Boolean(operationType === 'timeseries' && timeseriesAggregation && timeseriesAggregation !== 'count');
}

function populateAggregationOperationTypes() {
    const sel = document.getElementById('aggOperationType');

    if (!sel || typeof govmap === 'undefined' || !govmap.aggOperationType) {
        return;
    }

    const map = govmap.aggOperationType;
    const previous = sel.value;

    sel.replaceChildren();

    for (const [label, value] of Object.entries(map)) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;

        sel.appendChild(opt);
    }

    supportedAggregationOperationTypes = new Set(
        [...sel.options].map((option) => normalizeOperationType(option.value)).filter(Boolean)
    );

    if (previous && [...sel.options].some((o) => o.value === previous)) {
        sel.value = previous;
    }
}

function populateSelectFromGovmapEnum(selectId, enumName, withEmptyOption) {
    const select = document.getElementById(selectId);
    const enumMap = typeof govmap === 'undefined' ? null : govmap[enumName];

    if (!select || !enumMap || typeof enumMap !== 'object') {
        return;
    }

    const previous = String(select.value || '').trim();
    const previousEmptyOption = select.querySelector('option[value=""]');
    const emptyLabel = previousEmptyOption ? previousEmptyOption.textContent : '';

    select.replaceChildren();

    if (withEmptyOption) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = emptyLabel || '(ללא)';

        select.appendChild(emptyOption);
    }

    for (const [label, value] of Object.entries(enumMap)) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = label;

        select.appendChild(option);
    }

    if (previous && [...select.options].some((option) => option.value === previous)) {
        select.value = previous;
    }
}

function populateAggregationEnumSelects() {
    populateSelectFromGovmapEnum('aggTimeseriesInterval', 'aggTimeseriesInterval', true);
    populateSelectFromGovmapEnum('aggTimeseriesAggregation', 'aggTimeseriesAggregation', true);
    populateSelectFromGovmapEnum('aggFilterViewMode', 'aggViewMode', true);
    populateSelectFromGovmapEnum('aggSpatialFilterRelation', 'aggSpatialRelation', true);
    populateSelectFromGovmapEnum('aggSpatialFilterLogic', 'aggSpatialLogic', true);
    populateSelectFromGovmapEnum('aggCompareTo', 'aggCompareTo', true);
    populateSelectFromGovmapEnum('aggOutputSortType', 'aggSortType', true);
    populateSelectFromGovmapEnum('aggOutputSortOrder', 'aggSortOrder', true);
    populateSelectFromGovmapEnum('aggOutputDisplayFormat', 'aggDisplayFormat', true);
    populateSelectFromGovmapEnum('aggOutputNullHandling', 'aggNullHandling', true);

    const timeseriesIntervalEl = document.getElementById('aggTimeseriesInterval');
    const timeseriesAggregationEl = document.getElementById('aggTimeseriesAggregation');

    if (!timeseriesIntervalEl || !timeseriesAggregationEl) {
        return;
    }

    const intervalValues = [...timeseriesIntervalEl.options].map((option) => option.value).filter(Boolean);
    const aggregationValues = [...timeseriesAggregationEl.options]
        .map((option) => normalizeTimeseriesAggregation(option.value))
        .filter(Boolean);

    if (intervalValues.length > 0) {
        supportedTimeseriesIntervals = new Set(intervalValues);
    }

    if (aggregationValues.length > 0) {
        supportedTimeseriesAggregations = new Set(aggregationValues);
    }
}

function populateAggregationSrids() {
    const sel = document.getElementById('aggSourceSrid');

    if (!sel || typeof govmap === 'undefined' || !govmap.aggSrid) {
        return;
    }

    const map = govmap.aggSrid;
    const previous = sel.value;
    const aggSridKeys = ['Wgs84', 'WebMercator', 'Itm'];
    const defaultSrid = map.Wgs84;
    let defaultHint = '';

    if (defaultSrid !== undefined) {
        defaultHint = ` — ברירת מחדל Wgs84 / ${defaultSrid}`;
    }

    sel.replaceChildren();

    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = `(השאר ריק${defaultHint})`;

    sel.appendChild(emptyOpt);

    for (const label of aggSridKeys) {
        const value = map[label];

        if (value === undefined) {
            continue;
        }

        const opt = document.createElement('option');
        opt.value = String(value);
        opt.textContent = `${label} (${value})`;

        sel.appendChild(opt);
    }

    if (previous && [...sel.options].some((o) => o.value === previous)) {
        sel.value = previous;
    }
}

function setupOperationFieldsPicker() {
    const sourceLayerEl = document.getElementById('aggSourceLayer');
    const fieldInput = document.getElementById('aggOperationField');
    const fieldSelect = document.getElementById('aggOperationFieldSelect');
    const btnLoadField = document.getElementById('btnLoadOperationField');
    const fieldActions = document.getElementById('aggOperationFieldActions');
    const fieldHint = document.getElementById('aggOperationFieldHint');
    const fieldTypeHint = document.getElementById('aggOperationFieldTypeHint');
    const select = document.getElementById('aggOperationFieldsSelect');
    const btnLoad = document.getElementById('btnLoadOperationFields');
    const btnSelectAll = document.getElementById('btnSelectAllOperationFields');
    const btnDeselectAll = document.getElementById('btnDeselectAllOperationFields');
    const actions = document.getElementById('aggOperationFieldsActions');
    const hint = document.getElementById('aggOperationFieldsHint');
    const selectHint = document.getElementById('aggOperationFieldsSelectHint');
    const groupByInput = document.getElementById('aggGroupBy');
    const groupBySelect = document.getElementById('aggGroupBySelect');
    const btnLoadGroupByFields = document.getElementById('btnLoadGroupByFields');
    const groupByActions = document.getElementById('aggGroupByActions');

    if (
        !sourceLayerEl
        || !fieldInput
        || !fieldSelect
        || !btnLoadField
        || !fieldActions
        || !fieldHint
        || !fieldTypeHint
        || !select
        || !btnLoad
        || !btnSelectAll
        || !btnDeselectAll
        || !actions
        || !selectHint
        || !groupByInput
        || !groupBySelect
        || !btnLoadGroupByFields
        || !groupByActions
    ) {
        return;
    }

    const setHint = (lines) => {
        if (hint) {
            hint.textContent = lines.join('\n');
        }
    };

    const setPickerDisabled = (disabled) => {
        fieldSelect.disabled = disabled;
        btnLoadField.disabled = disabled;
        select.disabled = disabled;
        btnLoad.disabled = disabled;
        btnSelectAll.disabled = disabled;
        btnDeselectAll.disabled = disabled;
        groupBySelect.disabled = disabled;
        btnLoadGroupByFields.disabled = disabled;
    };

    let loadSequence = 0;

    const loadFields = (logResponse) => {
        const requestId = loadSequence + 1;
        const layer = sourceLayerEl.value.trim();

        loadSequence = requestId;

        if (!layer) {
            operationFieldsLayer = '';
            operationLayerFields = [];
            select.replaceChildren();
            clearLayerFieldPickers();
            setPickerDisabled(false);
            setHint(['יש להזין params.source.layer כדי לטעון שדות.']);

            return;
        }

        if (typeof govmap === 'undefined' || typeof govmap.getLayerFilterFields !== 'function') {
            setPickerDisabled(false);
            setHint(['govmap.getLayerFilterFields אינו זמין בסביבה הנוכחית.']);

            return;
        }

        operationFieldsLayer = layer;
        operationLayerFields = [];
        select.replaceChildren();
        clearLayerFieldPickers();
        setPickerDisabled(true);
        setHint(['טוען שדות...']);

        govmap.getLayerFilterFields(layer, GOVMAP_TOKEN, 'he').then((response) => {
            if (requestId !== loadSequence) {
                return;
            }

            const fields = extractLayerFilterFields(response);

            operationLayerFields = fields;
            refreshOperationFieldPickerForOperation();
            populateOperationFieldsSelect(select, fields);
            populateGroupBySelect(fields);

            if (fields.length > 0) {
                setHint([
                    `נטענו ${fields.length} שדות עבור`,
                    layer,
                    'אפשר לשלב בחירה מרובה עם הרשימה הידנית.'
                ]);
            } else {
                setHint([
                    'לא נמצאו שדות עבור',
                    layer,
                    'עליך לפרסם את השכבה ב-API.',
                    'אפשר עדיין להזין שדות ידנית.'
                ]);
            }

            if (logResponse) {
                logEvent('getLayerFilterFields', response);
            }
        }).catch((err) => {
            if (requestId !== loadSequence) {
                return;
            }

            const message = String((err && err.message) || err);

            setHint(['טעינת שדות נכשלה:', message]);
            logEvent('getLayerFilterFields error', { message });
        }).finally(() => {
            if (requestId !== loadSequence) {
                return;
            }

            setPickerDisabled(false);
        });
    };

    btnLoad.addEventListener('click', () => {
        loadFields(true);
    });

    btnLoadField.addEventListener('click', () => {
        loadFields(true);
    });

    btnLoadGroupByFields.addEventListener('click', () => {
        loadFields(true);
    });

    sourceLayerEl.addEventListener('change', () => {
        loadFields(false);
    });

    sourceLayerEl.addEventListener('blur', () => {
        if (sourceLayerEl.value.trim() === operationFieldsLayer) {
            return;
        }

        loadFields(false);
    });

    btnSelectAll.addEventListener('click', () => {
        setAllOperationFieldSelections(select, true);
    });

    btnDeselectAll.addEventListener('click', () => {
        setAllOperationFieldSelections(select, false);
    });

    fieldSelect.addEventListener('change', () => {
        fieldInput.value = fieldSelect.value;
    });

    groupBySelect.addEventListener('change', () => {
        groupByInput.value = groupBySelect.value;
    });

    loadFields(false);
}

function clearLayerFieldPickers() {
    const fieldSelect = document.getElementById('aggOperationFieldSelect');
    const fieldActions = document.getElementById('aggOperationFieldActions');
    const fieldHint = document.getElementById('aggOperationFieldHint');
    const fieldTypeHint = document.getElementById('aggOperationFieldTypeHint');
    const fieldsSelect = document.getElementById('aggOperationFieldsSelect');
    const fieldsActions = document.getElementById('aggOperationFieldsActions');
    const fieldsSelectHint = document.getElementById('aggOperationFieldsSelectHint');
    const groupBySelect = document.getElementById('aggGroupBySelect');
    const groupByActions = document.getElementById('aggGroupByActions');

    if (fieldSelect) {
        fieldSelect.replaceChildren();
        fieldSelect.classList.add('hidden');
    }

    if (fieldActions) {
        fieldActions.classList.add('hidden');
    }

    if (fieldHint) {
        fieldHint.textContent = '';
        fieldHint.classList.add('hidden');
    }

    if (fieldTypeHint) {
        fieldTypeHint.classList.add('hidden');
    }

    if (fieldsSelect) {
        fieldsSelect.replaceChildren();
        fieldsSelect.classList.add('hidden');
    }

    if (fieldsActions) {
        fieldsActions.classList.add('hidden');
    }

    if (fieldsSelectHint) {
        fieldsSelectHint.classList.add('hidden');
    }

    if (groupBySelect) {
        groupBySelect.replaceChildren();
        groupBySelect.classList.add('hidden');
    }

    if (groupByActions) {
        groupByActions.classList.add('hidden');
    }
}

function refreshOperationFieldPickerForOperation() {
    const typeEl = document.getElementById('aggOperationType');
    const timeseriesAggregationEl = document.getElementById('aggTimeseriesAggregation');
    const select = document.getElementById('aggOperationFieldSelect');
    const actions = document.getElementById('aggOperationFieldActions');
    const hint = document.getElementById('aggOperationFieldHint');
    const typeHint = document.getElementById('aggOperationFieldTypeHint');

    if (!typeEl || !timeseriesAggregationEl || !select || !actions || !hint || !typeHint) {
        return;
    }

    const operationType = normalizeOperationType(typeEl.value);
    const timeseriesAggregation = normalizeTimeseriesAggregation(timeseriesAggregationEl.value);
    const needsField = operationTypeRequiresField(operationType, timeseriesAggregation);
    const numericOnly = operationTypeRequiresNumericField(operationType, timeseriesAggregation);

    typeHint.classList.toggle('hidden', !needsField || !numericOnly);

    if (!needsField) {
        populateOperationFieldSelect(select, []);
        hint.textContent = '';
        hint.classList.add('hidden');

        return;
    }

    const fields = numericOnly ? operationLayerFields.filter((field) => isNumericLayerField(field)) : operationLayerFields;

    populateOperationFieldSelect(select, fields);

    if (operationLayerFields.length === 0) {
        hint.textContent = '';
        hint.classList.add('hidden');

        return;
    }

    if (fields.length === 0 && numericOnly) {
        hint.textContent = 'לא נמצאו שדות מסוג מספר בשכבה.';
        hint.classList.remove('hidden');

        return;
    }

    hint.textContent = '';
    hint.classList.add('hidden');
}

function populateOperationFieldSelect(select, fields) {
    const actions = document.getElementById('aggOperationFieldActions');
    const input = document.getElementById('aggOperationField');

    populateSingleLayerFieldSelect(select, input, actions, fields, '(בחר שדה)');
}

function populateGroupBySelect(fields) {
    const select = document.getElementById('aggGroupBySelect');
    const input = document.getElementById('aggGroupBy');
    const actions = document.getElementById('aggGroupByActions');

    if (!select) {
        return;
    }

    populateSingleLayerFieldSelect(select, input, actions, fields, '(בחר שדה לקיבוץ)');
}

function populateSingleLayerFieldSelect(select, input, actions, fields, emptyLabel) {
    const previous = input ? input.value.trim() : select.value;
    const hasFields = fields.length > 0;

    select.replaceChildren();
    select.classList.toggle('hidden', !hasFields);

    if (actions) {
        actions.classList.toggle('hidden', !hasFields);
    }

    if (!hasFields) {
        return;
    }

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = emptyLabel;

    select.appendChild(emptyOption);

    for (const field of fields) {
        const option = document.createElement('option');

        option.value = field.value;
        option.textContent = formatLayerFieldOptionText(field);
        option.selected = field.value === previous;

        select.appendChild(option);
    }
}

function setAllOperationFieldSelections(select, isSelected) {
    for (const option of select.options) {
        option.selected = isSelected;
    }
}

function populateOperationFieldsSelect(select, fields) {
    const actions = document.getElementById('aggOperationFieldsActions');
    const selectHint = document.getElementById('aggOperationFieldsSelectHint');
    const selectedValues = new Set([...select.selectedOptions].map((option) => option.value));
    const hasFields = fields.length > 0;

    select.replaceChildren();
    select.classList.toggle('hidden', !hasFields);

    if (actions) {
        actions.classList.toggle('hidden', !hasFields);
    }

    if (selectHint) {
        selectHint.classList.toggle('hidden', !hasFields);
    }

    for (const field of fields) {
        const option = document.createElement('option');

        option.value = field.value;
        option.textContent = formatLayerFieldOptionText(field);
        option.selected = selectedValues.has(field.value);

        select.appendChild(option);
    }
}

function formatLayerFieldOptionText(field) {
    const label = String(field.label || '').trim();

    if (label && label !== field.value) {
        return `${field.value} (${label})`;
    }

    return field.value;
}

function extractLayerFilterFields(response) {
    const candidates = getLayerFilterFieldArrayCandidates(response);
    let bestFields = [];

    for (const candidate of candidates) {
        const fields = normalizeLayerFilterFieldEntries(candidate);

        if (fields.length > bestFields.length) {
            bestFields = fields;
        }
    }

    return bestFields;
}

function getLayerFilterFieldArrayCandidates(value) {
    const candidates = [];
    const seenArrays = new Set();

    const addCandidate = (candidate) => {
        if (seenArrays.has(candidate)) {
            return;
        }

        seenArrays.add(candidate);
        candidates.push(candidate);
    };

    const visit = (item, depth) => {
        if (depth > 3 || item === null || item === undefined) {
            return;
        }

        if (Array.isArray(item)) {
            addCandidate(item);

            return;
        }

        if (typeof item !== 'object') {
            return;
        }

        for (const key of LAYER_FILTER_FIELD_ARRAY_KEYS) {
            const child = item[key];

            if (Array.isArray(child)) {
                addCandidate(child);
            }
        }

        for (const child of Object.values(item)) {

            if (child && typeof child === 'object') {
                visit(child, depth + 1);
            }
        }
    };

    visit(value, 0);

    return candidates;
}

function normalizeLayerFilterFieldEntries(entries) {
    const fields = [];
    const seen = new Set();

    for (const entry of entries) {
        const value = getLayerFilterFieldValue(entry);

        if (!value || seen.has(value)) {
            continue;
        }

        seen.add(value);
        fields.push({
            value,
            label: getLayerFilterFieldLabel(entry, value),
            type: getLayerFilterFieldType(entry)
        });
    }

    return fields;
}

function getLayerFilterFieldValue(entry) {
    if (typeof entry === 'string') {
        return entry.trim();
    }

    if (!entry || typeof entry !== 'object') {
        return '';
    }

    const fieldNameKeys = ['fieldName', 'FieldName', 'field_name', 'name', 'Name', 'field', 'Field', 'id', 'Id', 'key', 'Key'];

    for (const key of fieldNameKeys) {
        const value = entry[key];

        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return '';
}

function getLayerFilterFieldLabel(entry, fallbackValue) {
    if (!entry || typeof entry !== 'object') {
        return fallbackValue;
    }

    const labelKeys = [
        'caption',
        'Caption',
        'alias',
        'Alias',
        'label',
        'Label',
        'title',
        'Title',
        'text',
        'Text',
        'displayName',
        'DisplayName',
        'display_name',
        'description',
        'Description'
    ];

    for (const key of labelKeys) {
        const value = entry[key];

        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return fallbackValue;
}

function getLayerFilterFieldType(entry) {
    if (!entry || typeof entry !== 'object') {
        return '';
    }

    const typeKeys = [
        'fieldType',
        'FieldType',
        'field_type',
        'type',
        'Type',
        'dataType',
        'DataType',
        'data_type'
    ];

    for (const key of typeKeys) {
        const value = entry[key];

        if ((typeof value === 'string' || typeof value === 'number') && String(value).trim()) {
            return String(value).trim();
        }
    }

    return '';
}

function isNumericLayerField(field) {
    const normalizedType = normalizeFieldTypeValue(field && field.type);

    if (!normalizedType) {
        return false;
    }

    if (NUMERIC_FIELD_TYPE_CODES.has(normalizedType)) {
        return true;
    }

    if (fieldTypeValueHasNumericToken(normalizedType)) {
        return true;
    }

    return getNumericFieldTypeEnumValues().has(normalizedType);
}

function getNumericFieldTypeEnumValues() {
    const values = new Set();

    if (typeof govmap === 'undefined') {
        return values;
    }

    for (const enumName of FIELD_TYPE_ENUM_NAMES) {
        const enumMap = govmap[enumName];

        if (!enumMap || typeof enumMap !== 'object') {
            continue;
        }

        for (const [label, value] of Object.entries(enumMap)) {
            const normalizedLabel = normalizeFieldTypeValue(label);
            const normalizedValue = normalizeFieldTypeValue(value);

            if (fieldTypeValueHasNumericToken(normalizedLabel) || fieldTypeValueHasNumericToken(normalizedValue)) {
                values.add(normalizedLabel);
                values.add(normalizedValue);
            }
        }
    }

    return values;
}

function normalizeFieldTypeValue(value) {
    return String(value || '').trim().toLowerCase();
}

function fieldTypeValueHasNumericToken(value) {
    return NUMERIC_FIELD_TYPE_TOKENS.some((token) => value.includes(token));
}

function setupOperationTypeToggle() {
    const typeEl = document.getElementById('aggOperationType');
    const fieldBlock = document.getElementById('aggBlockOperationField');
    const fieldsBlock = document.getElementById('aggBlockOperationFields');
    const histogramBlock = document.getElementById('aggBlockHistogram');
    const timeseriesBlock = document.getElementById('aggBlockTimeseries');
    const timeseriesAggregationEl = document.getElementById('aggTimeseriesAggregation');

    if (!typeEl || !fieldBlock || !fieldsBlock || !histogramBlock || !timeseriesBlock || !timeseriesAggregationEl) {
        return;
    }

    const apply = () => {
        const operationType = normalizeOperationType(typeEl.value);
        const timeseriesAggregation = normalizeTimeseriesAggregation(timeseriesAggregationEl.value);
        const needsField = operationTypeRequiresField(operationType, timeseriesAggregation);

        fieldBlock.classList.toggle('hidden', !needsField);
        fieldsBlock.classList.toggle('hidden', operationType !== 'table');
        histogramBlock.classList.toggle('hidden', operationType !== 'histogram');
        timeseriesBlock.classList.toggle('hidden', operationType !== 'timeseries');

        refreshOperationFieldPickerForOperation();
    };

    typeEl.addEventListener('change', apply);
    timeseriesAggregationEl.addEventListener('change', apply);
    apply();
}

function setupViewModeToggle() {
    const viewModeEl = document.getElementById('aggFilterViewMode');
    const minX = document.getElementById('aggBboxMinX');
    const minY = document.getElementById('aggBboxMinY');
    const maxX = document.getElementById('aggBboxMaxX');
    const maxY = document.getElementById('aggBboxMaxY');

    if (!viewModeEl || !minX || !minY || !maxX || !maxY) {
        return;
    }

    const bboxInputs = [minX, minY, maxX, maxY];

    const apply = () => {
        const isExtent = viewModeEl.value === 'extent';

        for (const el of bboxInputs) {
            el.disabled = !isExtent;
        }
    };

    viewModeEl.addEventListener('change', apply);
    apply();
}

function setupClearLog() {
    const btnClearLog = document.getElementById('btnClearLog');
    const eventLog = document.getElementById('eventLog');

    if (!btnClearLog || !eventLog) {
        return;
    }

    btnClearLog.addEventListener('click', () => {
        eventLog.textContent = '';
    });
}

function setupAggregatePanel() {
    const btn = document.getElementById('btnAggregate');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', () => {
        const built = buildAggregateParams();

        if (built.error) {
            logEvent('aggregate error', { message: built.error });

            return;
        }

        const params = built.params;

        logEvent('aggregate request', params);

        govmap.aggregate(params).then((response) => {
            const apiError = extractAggregateApiError(response);

            if (apiError) {
                logEvent('aggregate error', { message: apiError, response });

                return;
            }

            logEvent('aggregate', response);
        }).catch((err) => {
            const apiError = extractAggregateTransportError(err);
            const fallbackError = String((err && err.message) || err);
            const message = apiError || fallbackError;

            logEvent('aggregate error', { message });
        });
    });
}

function extractAggregateApiError(response) {

    if (!response || typeof response !== 'object') {
        return '';
    }

    if (!Object.prototype.hasOwnProperty.call(response, 'error')) {
        return '';
    }

    if (typeof response.error === 'string') {
        return response.error;
    }

    if (response.error && typeof response.error === 'object' && typeof response.error.message === 'string') {
        return response.error.message;
    }

    return '';
}

function extractAggregateTransportError(err) {
    const candidates = [
        err && err.response && err.response.data,
        tryParseJson(err && err.request && err.request.responseText),
        tryParseJson(err && err.request && err.request.response),
        err && err.data
    ];

    for (const candidate of candidates) {
        const candidateError = extractAggregateApiError(candidate);

        if (candidateError) {
            return candidateError;
        }
    }

    return '';
}

function tryParseJson(value) {

    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch (_parseError) {
        return null;
    }
}

function collectOperationField() {
    const fieldInput = document.getElementById('aggOperationField');
    const fieldSelect = document.getElementById('aggOperationFieldSelect');
    const typedField = fieldInput ? fieldInput.value.trim() : '';
    const selectedField = fieldSelect ? fieldSelect.value.trim() : '';

    return typedField || selectedField;
}

function collectOperationFields() {
    const fieldsInput = document.getElementById('aggOperationFields');
    const typedFields = splitCommaSeparatedFields(fieldsInput ? fieldsInput.value : '');
    const selectedFields = getSelectedOperationFields();

    return uniqueFields([...typedFields, ...selectedFields]);
}

function getSelectedOperationFields() {
    const select = document.getElementById('aggOperationFieldsSelect');

    if (!select) {
        return [];
    }

    return [...select.selectedOptions].map((option) => option.value.trim()).filter(Boolean);
}

function splitCommaSeparatedFields(value) {
    return String(value || '').split(',').map((field) => field.trim()).filter(Boolean);
}

function uniqueFields(fields) {
    const unique = [];
    const seen = new Set();

    for (const field of fields) {

        if (seen.has(field)) {
            continue;
        }

        seen.add(field);
        unique.push(field);
    }

    return unique;
}

/**
 * @returns {{ params: object } | { error: string }}
 */
function buildAggregateParams() {
    const layer = document.getElementById('aggSourceLayer').value.trim();

    if (!layer) {
        return { error: 'source.layer is required' };
    }

    const operationType = normalizeOperationType(document.getElementById('aggOperationType').value);
    const operation = { type: operationType };
    const timeseriesAggregation = normalizeTimeseriesAggregation(document.getElementById('aggTimeseriesAggregation').value);

    if (!supportedAggregationOperationTypes.has(operationType)) {
        return { error: 'operation.type is invalid: ' + operationType };
    }

    if (operationTypeRequiresField(operationType, timeseriesAggregation)) {
        const field = collectOperationField();

        if (!field) {
            return { error: 'operation.field is required for operation type ' + operationType };
        }

        operation.field = field;
    }

    if (operationType === 'histogram') {
        const buckets = Number(document.getElementById('aggHistogramBuckets').value);

        if (!Number.isFinite(buckets) || buckets < 2 || buckets > 50) {
            return { error: 'histogram.buckets must be a number between 2 and 50' };
        }

        operation.histogram = { buckets };
    }

    if (operationType === 'timeseries') {
        const dateField = document.getElementById('aggTimeseriesDateField').value.trim();
        const interval = document.getElementById('aggTimeseriesInterval').value;
        const aggregation = timeseriesAggregation;

        if (!dateField) {
            return { error: 'timeseries.date_field is required' };
        }

        if (!interval) {
            return { error: 'timeseries.interval is required' };
        }

        if (!supportedTimeseriesIntervals.has(interval)) {
            return { error: 'timeseries.interval is invalid: ' + interval };
        }

        if (aggregation && !supportedTimeseriesAggregations.has(aggregation)) {
            return { error: 'timeseries.aggregation is invalid: ' + aggregation };
        }

        operation.timeseries = { date_field: dateField, interval };

        if (aggregation && aggregation !== 'count') {
            operation.timeseries.aggregation = aggregation;
        }
    }

    if (operationType === 'table') {
        const fields = collectOperationFields();

        if (fields.length === 0) {
            return { error: 'operation.fields is required for table (type fields, select fields, or both)' };
        }

        operation.fields = fields;
    }

    const source = { layer };
    const sridRaw = document.getElementById('aggSourceSrid').value.trim();

    if (sridRaw) {
        const srid = Number(sridRaw);

        if (!Number.isFinite(srid)) {
            return { error: 'source.srid must be a number' };
        }

        source.srid = srid;
    }

    const filterBuilt = buildAggregateFilter();

    if (filterBuilt.error) {
        return { error: filterBuilt.error };
    }

    const groupingBuilt = buildAggregateGrouping();

    if (groupingBuilt.error) {
        return { error: groupingBuilt.error };
    }

    const params = {
        apiKey: GOVMAP_TOKEN,
        source,
        operation
    };

    if (filterBuilt.filter) {
        params.filter = filterBuilt.filter;
    }

    const hasActiveGrouping = Boolean(groupingBuilt.grouping && operationType !== 'table');

    if (hasActiveGrouping) {
        params.grouping = groupingBuilt.grouping;
    }

    const comparison = buildAggregateComparison(operationType);

    if (comparison.error) {
        return { error: comparison.error };
    }

    if (comparison.comparison) {
        params.comparison = comparison.comparison;
    }

    const outputBuilt = buildAggregateOutput(operationType, hasActiveGrouping);

    if (outputBuilt.error) {
        return { error: outputBuilt.error };
    }

    if (outputBuilt.output) {
        params.output = outputBuilt.output;
    }

    return { params };
}

function buildAggregateComparison(operationType) {
    const compareTo = document.getElementById('aggCompareTo').value;

    if (compareTo !== 'global' && compareTo !== 'prev_period') {
        return {};
    }

    if (operationType === 'table') {
        return {};
    }

    return { comparison: { compare_to: compareTo } };
}

/**
 * @returns {{ filter?: object, error?: string }}
 */
function buildAggregateFilter() {
    const filterText = document.getElementById('aggFilterExpression').value.trim();
    const viewMode = document.getElementById('aggFilterViewMode').value;
    const minX = Number(document.getElementById('aggBboxMinX').value);
    const minY = Number(document.getElementById('aggBboxMinY').value);
    const maxX = Number(document.getElementById('aggBboxMaxX').value);
    const maxY = Number(document.getElementById('aggBboxMaxY').value);

    const spatialLayer = document.getElementById('aggSpatialFilterLayer').value.trim();
    const spatialRelation = document.getElementById('aggSpatialFilterRelation').value.trim();
    const spatialBufferRaw = document.getElementById('aggSpatialFilterBuffer').value.trim();
    const spatialLogic = document.getElementById('aggSpatialFilterLogic').value.trim();

    const filterObj = {};

    if (filterText) {
        filterObj.filter = filterText;
    }

    if (viewMode === 'extent') {
        filterObj.view_mode = 'extent';

        if (![minX, minY, maxX, maxY].every((n) => Number.isFinite(n))) {
            return { error: 'view_mode=extent requires four valid numeric bbox values' };
        }

        filterObj.bbox = [minX, minY, maxX, maxY];
    }

    const hasSpatialInput = Boolean(spatialLayer || spatialRelation || spatialBufferRaw || spatialLogic);

    if (hasSpatialInput) {

        if (!spatialLayer || !spatialRelation) {
            return { error: 'spatial_filter requires both layer and relation when any spatial filter field is set' };
        }

        const spatial_filter = { layer: spatialLayer, relation: spatialRelation };

        if (spatialBufferRaw) {
            const buffer = Number(spatialBufferRaw);

            if (!Number.isFinite(buffer) || buffer < 0) {
                return { error: 'spatial_filter.buffer must be a number >= 0' };
            }

            spatial_filter.buffer = buffer;
        }

        if (spatialLogic === 'centroid' || spatialLogic === 'proportion') {
            spatial_filter.logic = spatialLogic;
        }

        filterObj.spatial_filter = spatial_filter;
    }

    if (Object.keys(filterObj).length === 0) {
        return {};
    }

    return { filter: filterObj };
}

/**
 * @returns {{ grouping?: object, error?: string }}
 */
function buildAggregateGrouping() {
    const groupBy = document.getElementById('aggGroupBy').value.trim();
    const subGroupBy = document.getElementById('aggSubGroupBy').value.trim();

    if (!groupBy && !subGroupBy) {
        return {};
    }

    const grouping = {};

    if (groupBy) {
        grouping.group_by = groupBy;
    }

    if (subGroupBy) {
        grouping.sub_group_by = subGroupBy;
    }

    if (subGroupBy && !groupBy) {
        return { error: 'sub_group_by requires group_by' };
    }

    if (subGroupBy === groupBy) {
        return { error: 'sub_group_by must be different from group_by' };
    }

    return { grouping };
}

/**
 * @returns {{ output: object | null, error?: string }}
 */
function buildAggregateOutput(operationType, hasGrouping) {
    const limitRaw = document.getElementById('aggOutputLimit').value.trim();
    const includePercentage = document.getElementById('aggOutputIncludePercentage').checked;
    const sortBy = document.getElementById('aggOutputSortBy').value.trim();
    const sortType = document.getElementById('aggOutputSortType').value;
    const sortOrder = document.getElementById('aggOutputSortOrder').value;
    const displayFormat = document.getElementById('aggOutputDisplayFormat').value;
    const nullHandling = document.getElementById('aggOutputNullHandling').value;
    const pageToken = document.getElementById('aggOutputPageToken').value.trim();

    const output = {};

    if (limitRaw) {
        const limit = Number(limitRaw);

        if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
            return { output: null, error: 'output.limit must be an integer between 1 and 1000' };
        }

        output.limit = limit;
    }

    if (includePercentage && hasGrouping) {
        output.include_percentage = true;
    }

    if (sortBy) {
        output.sort_by = sortBy;
    }

    if (sortType === 'numeric' || sortType === 'alphabetic') {
        output.sort_type = sortType;
    }

    if (sortOrder === 'asc' || sortOrder === 'desc') {
        output.sort_order = sortOrder;
    }

    if (displayFormat) {
        output.display_format = displayFormat;
    }

    if (nullHandling === 'exclude') {
        output.null_handling = 'exclude';
    }

    if (pageToken && operationType === 'table') {
        output.page_token = pageToken;
    }

    if (Object.keys(output).length === 0) {
        return { output: null };
    }

    return { output };
}

function logEvent(name, data) {
    const el = document.getElementById('eventLog');

    if (!el) {
        return;
    }

    const line = '[' + new Date().toISOString() + '] ' + name + ': ' + JSON.stringify(data, null, 2);
    el.textContent = (el.textContent ? el.textContent + '\n\n' : '') + line;
    el.scrollTop = el.scrollHeight;
}
