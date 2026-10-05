function initGovMap() {
    createMap();
    setupGetEntitiesGeometryPanel();
    setupIntersectLayersPanel();
    setupSelectFeaturesOnMapPanel();
    setupFilterLayersPanel();
    setupSetVisibleLayersPanel();
    setupShowMeasurePanel();
    setupSearchInLayerPanel();
    setupLogPanel();
}

function createMap() {
    govmap.createMap('map1', {
        token: GOVMAP_TOKEN,
        visibleLayers: ['211316', '211275'],
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

function setupGetEntitiesGeometryPanel() {
    const btn = document.getElementById('btnGetEntitiesGeometry');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', () => {
        if (typeof govmap.getEntitiesGeometry !== 'function') {
            logEvent('getEntitiesGeometry error', { message: 'govmap.getEntitiesGeometry is not available' });
            return;
        }

        const layerId = document.getElementById('entitiesGeometryLayerId').value.trim();
        const objectIds = document.getElementById('entitiesGeometryObjectIds').value
            .split(',').map((s) => s.trim()).filter(Boolean);

        if (!layerId || objectIds.length === 0) {
            logEvent('getEntitiesGeometry error', { message: 'layerId and at least one objectId are required' });
            return;
        }

        const params = { layerId, objectIds };

        logEvent('getEntitiesGeometry parameters', params);

        govmap.getEntitiesGeometry(params).then((response) => {
            logEvent('getEntitiesGeometry', response);
        }).catch((err) => {
            logEvent('getEntitiesGeometry error', { message: String(err && err.message || err) });
        });
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

    for (const layer of INTERSECT_LAYERS) {
        addIntersectLayerRow(layer);
    }

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
        <input type="text" class="il-layerName" value="${defaults.layerName || ''}" placeholder="layerName">
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

function setupSelectFeaturesOnMapPanel() {
    const btn = document.getElementById('btnSelectFeaturesOnMap');
    const layersInput = document.getElementById('selectFeaturesLayers');
    const geomMode = document.getElementById('selectFeaturesGeomMode');
    const drawTypeWrap = document.getElementById('selectFeaturesDrawTypeWrap');
    const wktWrap = document.getElementById('selectFeaturesWktWrap');

    if (!btn || !layersInput || !geomMode || !drawTypeWrap || !wktWrap) {
        return;
    }

    layersInput.value = INTERSECT_LAYERS.map((layer) => layer.layerName).join(', ');
    layersInput.placeholder = layersInput.value || 'layerId';

    geomMode.addEventListener('change', () => {
        const isDraw = geomMode.value === 'drawType';

        drawTypeWrap.classList.toggle('hidden', !isDraw);
        wktWrap.classList.toggle('hidden', isDraw);
    });

    btn.addEventListener('click', () => {
        if (typeof govmap.selectFeaturesOnMap !== 'function') {
            logEvent('selectFeaturesOnMap error', { message: 'govmap.selectFeaturesOnMap is not available' });
            return;
        }

        const layers = layersInput.value.split(',').map((s) => s.trim()).filter(Boolean);

        if (layers.length === 0) {
            logEvent('selectFeaturesOnMap error', { message: 'At least one layer is required' });
            return;
        }

        const fields = document.getElementById('selectFeaturesFields').value
            .split(',').map((s) => s.trim()).filter(Boolean);
        const whereClauseRaw = document.getElementById('selectFeaturesWhereClause').value.trim();
        const returnFields = {};
        const whereClause = {};

        for (const layerName of layers) {
            returnFields[layerName] = fields.slice();

            if (whereClauseRaw) {
                whereClause[layerName] = whereClauseRaw;
            }
        }

        const params = {
            continous: document.getElementById('selectFeaturesContinous').checked,
            filterLayer: document.getElementById('selectFeaturesFilterLayer').checked,
            isZoomToExtent: document.getElementById('selectFeaturesZoomToExtent').checked,
            selectOnMap: document.getElementById('selectFeaturesSelectOnMap').checked,
            getWkt: document.getElementById('selectFeaturesGetWkt').checked,
            layers,
            returnFields,
        };

        if (Object.keys(whereClause).length > 0) {
            params.whereClause = whereClause;
        }

        if (geomMode.value === 'wkt') {
            params.wkt = document.getElementById('selectFeaturesWktInput').value.trim();
            params.radius = Number(document.getElementById('selectFeaturesRadius').value) || 0;
        } else {
            const drawTypeName = document.getElementById('selectFeaturesDrawType').value;

            params.drawType = govmap.drawType[drawTypeName];
        }

        logEvent('selectFeaturesOnMap parameters', params);

        govmap.selectFeaturesOnMap(params).then((response) => {
            logEvent('selectFeaturesOnMap', response);
        }).catch((err) => {
            logEvent('selectFeaturesOnMap error', { message: String(err && err.message || err) });
        });
    });
}

function setupFilterLayersPanel() {
    const btn = document.getElementById('btnFilterLayers');
    const layerNameInput = document.getElementById('filterLayerName');

    if (!btn) {
        return;
    }

    if (layerNameInput) {
        layerNameInput.value = FILTER_LAYER_NAME;
        layerNameInput.placeholder = FILTER_LAYER_NAME || 'layerName';
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
    const layersOnInput = document.getElementById('layersOn');
    const layersOffInput = document.getElementById('layersOff');

    if (!btn) {
        return;
    }

    if (layersOnInput) {
        layersOnInput.value = LAYERS_ON;
        layersOnInput.placeholder = LAYERS_ON || 'layerId';
    }

    if (layersOffInput) {
        layersOffInput.value = LAYERS_OFF;
        layersOffInput.placeholder = LAYERS_OFF || 'layerId';
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
    const select = document.getElementById('searchInLayerPreset');

    if (!btn || !select) {
        return;
    }

    for (const [key, preset] of Object.entries(SEARCH_IN_LAYER_PRESETS)) {
        const option = document.createElement('option');

        option.value = key;
        option.textContent = [preset.layerName, preset.fieldName, (preset.fieldValues || []).join(', ')].join(' / ');
        select.appendChild(option);
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

function searchInLayer() {
    const key = document.getElementById('searchInLayerPreset').value;
    const params = SEARCH_IN_LAYER_PRESETS[key];

    if (!params) {
        logEvent('searchInLayer error', { message: 'Unknown preset: ' + key });
        return;
    }

    govmap.searchInLayer(params);
    logEvent('searchInLayer', params);
}