/** @type { Array<{ id: string; text: string; type: string; score: number; shape: string; data: object }> } */
let lastSearchResults = [];

function initNoMap() {
    setupSearchPanel();
    setupGetSearchResultDataPanel();
    setupGetLayerFeaturesByLocationPanel();
    setupLogPanel();
}

function setupSearchPanel() {
    const btnSearch = document.getElementById('btnSearch');

    if (!btnSearch) {
        return;
    }

    btnSearch.addEventListener('click', () => {
        const searchText = document.getElementById('searchText').value.trim();
        const language = document.getElementById('searchLanguage').value;
        const maxResults = Number(document.getElementById('searchMaxResults').value) || 5;
        const isAccurate = document.getElementById('searchIsAccurate').checked;

        if (!searchText) {
            logEvent('search error', { message: 'searchText is required' });
            return;
        }

        const params = {
            apiKey: GOVMAP_TOKEN,
            searchText,
            language: language === 'en' ? 'en' : 'he',
            maxResults,
            isAccurate
        };

        govmap.search(params).then((response) => {
            lastSearchResults = response.results || [];
            logEvent('search', response);
        }).catch((err) => {
            logEvent('search error', { message: String(err && err.message || err) });
        });
    });
}

function setupGetSearchResultDataPanel() {
    const btnGetSearchResultData = document.getElementById('btnGetSearchResultData');

    if (!btnGetSearchResultData) {
        return;
    }

    btnGetSearchResultData.addEventListener('click', () => {
        const indexEl = document.getElementById('searchResultIndex');
        const index = indexEl ? Number(indexEl.value) : 0;

        if (lastSearchResults.length === 0) {
            logEvent('getSearchResultData error', { message: 'No search results. Run search first.' });
            return;
        }

        const result = lastSearchResults[index];

        if (!result) {
            logEvent('getSearchResultData error', { message: 'Invalid result index: ' + index });
            return;
        }

        govmap.getSearchResultData(result, GOVMAP_TOKEN).then((response) => {
            logEvent('getSearchResultData', response);
        }).catch((err) => {
            logEvent('getSearchResultData error', { message: String(err && err.message || err) });
        });
    });
}

function setupGetLayerFeaturesByLocationPanel() {
    const btnGetLayerFeaturesByLocation = document.getElementById('btnGetLayerFeaturesByLocation');

    if (!btnGetLayerFeaturesByLocation) {
        return;
    }

    btnGetLayerFeaturesByLocation.addEventListener('click', () => {
        const geometry = document.getElementById('locationGeometry').value.trim();
        const radius = Number(document.getElementById('locationRadius').value);
        const layersText = document.getElementById('locationLayers').value.trim();

        if (!geometry) {
            logEvent('getLayerFeaturesByLocation error', { message: 'geometry (WKT) is required' });
            return;
        }

        const layers = [];

        if (layersText) {
            const lines = layersText.split('\n');

            for (const line of lines) {
                const t = line.trim();
                if (!t) continue;
                const colon = t.indexOf(':');
                if (colon === -1) {
                    layers.push({ name: t, fields: [] });
                } else {
                    const name = t.slice(0, colon).trim();
                    const fieldsStr = t.slice(colon + 1).trim();
                    const fields = fieldsStr ? fieldsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
                    layers.push({ name, fields });
                }
            }
        }

        if (layers.length === 0) {
            logEvent('getLayerFeaturesByLocation error', { message: 'At least one layer (name:fields) is required' });
            return;
        }

        const payload = {
            geometry,
            radius: Number.isFinite(radius) ? radius : 100,
            layers
        };

        govmap.getLayerFeaturesByLocation(payload, GOVMAP_TOKEN).then((response) => {
            logEvent('getLayerFeaturesByLocation', response);
        }).catch((err) => {
            logEvent('getLayerFeaturesByLocation error', { message: String(err && err.message || err) });
        });
    });
}

function setupLogPanel() {
    const btnClearLog = document.getElementById('btnClearLog');
    const eventLog = document.getElementById('eventLog');

    if (btnClearLog && eventLog) {
        btnClearLog.addEventListener('click', () => {
            eventLog.textContent = '';
        });
    }
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
