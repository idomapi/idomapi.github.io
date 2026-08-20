function initMOT() {
    createMap();
    setupMOTPanel();
    setupLogPanel();
}

function createMap() {
    govmap.createMap('map1', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        visibleLayers: ['MUNI', 'LRT_LINE'],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: '0',
        layersMode: 2,
        center: { x: 182036, y: 666148 },
        level: 7
    });
}

function setupMOTPanel() {
    const btn = document.getElementById('btnRunMOTTest');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', () => {
        runMOTTest();
    });
}

function runMOTTest() {
    const israelExtentPolygonGeo = 'POLYGON((129897.85 818015.41, 287854.42 818015.41, 287854.42 376689.53, 129897.85 376689.53, 129897.85 818015.41))';
    const request = {
        layers: [
            {
                layerName: 'MUNI',
                whereClause: 'OBJECTID = 129', // bat yam polygon id 
                useCurrentFilter: false,
                radius: 0
            },
            {
                layerName: 'LRT_LINE',
                // whereClause: '',
                useCurrentFilter: false,
                radius: 0
            }
        ],
        fields: ['name'],
        geometry: israelExtentPolygonGeo
    };

    logEvent('runMOTTest parameters', request);

    govmap.intersectLayers(request).then((response) => {
        logEvent('runMOTTest result', response);
    }).catch((err) => {
        logEvent('runMOTTest error', { message: String(err && err.message || err) });
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
