function initGovMap() {
    createMap();
    setupIntersectLayersPanel();
    setupFilterLayersPanel();
    setupSetVisibleLayersPanel();
    setupShowMeasurePanel();
    setupSearchInLayerPanel();
    setupLogPanel();
}

function createMap() {
    govmap.createMap('map1', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        visibleLayers: ['162879', 'ies', 'layer_163153'],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: '0',
        layersMode: 2,
        center: { x: 182036, y: 666148 },
        level: 7,
        onLoad: function () {
        },
    });
}

function setupIntersectLayersPanel() {
    const rowsContainer = document.getElementById('intersectLayersRows');
    const btnAdd = document.getElementById('btnAddIntersectLayer');
    const btnRun = document.getElementById('btnIntersectLayers');
    const inputType = document.getElementById('intersectInputType');
    const addressWrap = document.getElementById('intersectAddressWrap');
    const geometryWrap = document.getElementById('intersectGeometryWrap');

    if (!rowsContainer || !btnAdd || !btnRun || !inputType || !addressWrap || !geometryWrap) {
        return;
    }

    addIntersectLayerRow({ layerName: '162879', radius: 20 });
    addIntersectLayerRow({ layerName: '162881', radius: 25 });

    btnAdd.addEventListener('click', () => {
        addIntersectLayerRow();
    });

    rowsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btnRemoveIntersectLayer');

        if (!btn) {
            return;
        }

        btn.closest('.intersect-layer-row').remove();
    });

    inputType.addEventListener('change', () => {
        const isAddress = inputType.value === 'address';

        addressWrap.classList.toggle('hidden', !isAddress);
        geometryWrap.classList.toggle('hidden', isAddress);
    });

    btnRun.addEventListener('click', () => {
        const layers = [...rowsContainer.querySelectorAll('.intersect-layer-row')]
            .map(readIntersectLayerRow)
            .filter(Boolean);

        if (layers.length === 0) {
            logEvent('intersectLayers error', { message: 'At least one layer with a layerName is required' });
            return;
        }

        const fields = document.getElementById('intersectFieldsInput').value
            .split(',').map((s) => s.trim()).filter(Boolean);
        const intersectLayersObject = { layers, fields };

        if (inputType.value === 'address') {
            intersectLayersObject.address = document.getElementById('intersectAddressInput').value.trim();
        } else {
            intersectLayersObject.geometry = document.getElementById('intersectGeometryInput').value.trim();
        }

        logEvent('intersectLayers parameters', intersectLayersObject);

        govmap.intersectLayers(intersectLayersObject).then((response) => {
            logEvent('intersectLayers', response);
        }).catch((err) => {
            logEvent('intersectLayers error', { message: String(err && err.message || err) });
        });
    });
}

function addIntersectLayerRow(defaults) {
    defaults = defaults || {};
    const rowsContainer = document.getElementById('intersectLayersRows');
    const row = document.createElement('div');

    row.className = 'intersect-layer-row';
    row.innerHTML = `
        <label>layerName:</label>
        <input type="text" class="il-layerName" value="${defaults.layerName || ''}" placeholder="162879">
        <label>whereClause:</label>
        <input type="text" class="il-whereClause" placeholder="value0 = 'x' OR value0 = 'y'">
        <label><input type="checkbox" class="il-useCurrentFilter"> useCurrentFilter</label>
        <label>radius (m):</label>
        <input type="number" class="il-radius" min="0" step="any" value="${defaults.radius != null ? defaults.radius : ''}" placeholder="0">
        <button type="button" class="btnRemoveIntersectLayer">✕</button>
    `;

    rowsContainer.appendChild(row);
}

function readIntersectLayerRow(row) {
    const layerName = row.querySelector('.il-layerName').value.trim();

    if (!layerName) {
        return null;
    }

    const layer = { layerName };
    const whereClause = row.querySelector('.il-whereClause').value.trim();
    const radiusRaw = row.querySelector('.il-radius').value.trim();

    if (whereClause) {
        layer.whereClause = whereClause;
    }

    if (row.querySelector('.il-useCurrentFilter').checked) {
        layer.useCurrentFilter = true;
    }

    if (radiusRaw) {
        layer.radius = Number(radiusRaw);
    }

    return layer;
}

function setupFilterLayersPanel() {
    const btn = document.getElementById('btnFilterLayers');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', () => {
        const layerName = document.getElementById('filterLayerName').value.trim();
        const whereClause = document.getElementById('filterWhereClause').value.trim();
        const zoomToExtent = document.getElementById('filterZoomToExtent').checked;

        govmap.filterLayers({ layerName, whereClause, zoomToExtent });
        logEvent('filterLayers', { layerName, whereClause, zoomToExtent });
    });
}

function setupSetVisibleLayersPanel() {
    const btn = document.getElementById('btnSetVisibleLayers');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', () => {
        const onStr = document.getElementById('layersOn').value.trim();
        const offStr = document.getElementById('layersOff').value.trim();
        const layersOn = onStr ? onStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
        const layersOff = offStr ? offStr.split(',').map((s) => s.trim()).filter(Boolean) : [];

        govmap.setVisibleLayers(layersOn, layersOff);
        logEvent('setVisibleLayers', { layersOn, layersOff });
    });
}

function setupShowMeasurePanel() {
    const btnShow = document.getElementById('btnShowMeasure');
    const btnClose = document.getElementById('btnCloseMeasure');

    if (btnShow) {
        btnShow.addEventListener('click', () => {
            govmap.showMeasure();
            logEvent('showMeasure', { called: true });
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            govmap.closeMeasure();
            logEvent('closeMeasure', { called: true });
        });
    }
}

function setupSearchInLayerPanel() {
    const btn = document.getElementById('btnSearchInLayer');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', searchInLayer);
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

const SEARCH_IN_LAYER_PRESETS = {
    layer_162879: {
        layerName: 'layer_162879',
        fieldName: 'value0',
        fieldValues: ['ג'],
        highlight: true,
        showBubble: false,
        outLineColor: [0, 255, 0, 1],
        fillColor: [255, 0, 0, 0.5],
    },
    layer_163153: {
        layerName: 'layer_163153',
        fieldName: 'value0',
        fieldValues: ['a'],
        highlight: true,
        showBubble: false,
        outLineColor: [0, 255, 0, 1],
        fillColor: [255, 0, 0, 0.5],
    },
    ies: {
        layerName: 'ies',
        fieldName: 'name',
        fieldValues: ['הרצליה'],
        highlight: true,
        showBubble: false,
        outLineColor: [0, 255, 0, 1],
        fillColor: [255, 0, 0, 0.5],
    },
};

function searchInLayer() {
    const key = document.getElementById('searchInLayerPreset').value;
    const params = SEARCH_IN_LAYER_PRESETS[key];

    govmap.searchInLayer(params);
    logEvent('searchInLayer', params);
}