/**
 * Multi-maps page: create 4 Govmap maps sequentially.
 * Each map is created only after the previous one has fired onLoad.
 * Uses govmap.onEvent(EVENT).progress(CALLBACK) per map (see Govmap on-event API).
 */

const MAP_IDS = ['map1', 'map2', 'map3', 'map4'];

function isOnClickEnabled() {
    const el = document.getElementById('enableOnClick');
    return el ? el.checked : false;
}

function getEventEnum(eventKey) {
    if (!govmap.events || !(eventKey in govmap.events)) {
        return null;
    }

    const val = govmap.events[eventKey];

    if (val === undefined || val === null) {
        return null;
    }

    return val;
}

function logClick(mapDivId, e) {
    const msg = 'onClick [' + mapDivId + '] ' + JSON.stringify(e);
    const logEl = document.getElementById('eventLog');
    if (logEl) {
        logEl.textContent += msg + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }
}

function logEvent(eventKey, mapDivId, e) {
    const msg = '[' + eventKey + '] [' + mapDivId + '] ' + JSON.stringify(e);
    const logEl = document.getElementById('eventLog');

    if (logEl) {
        logEl.textContent += msg + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }
}

function getSelectedMapIds() {
    const allCb = document.getElementById('eventMapsAll');

    if (allCb && allCb.checked) {
        return MAP_IDS.slice();
    }

    const checked = document.querySelectorAll('input[name="eventMap"]:checked');

    return Array.from(checked).map((el) => el.value);
}

function createNextMap(index) {
    if (index >= MAP_IDS.length) {
        return;
    }

    const mapDivId = MAP_IDS[index];
    const nextIndex = index + 1;

    const settings = {
        token: typeof GOVMAP_TOKEN !== 'undefined' ? GOVMAP_TOKEN : '',
        layers: ['GASSTATIONS', 'PARCEL_ALL'],
        visibleLayers: [],
        showXY: true,
        isEmbeddedToggle: false,
        background: '0',
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {
            if (nextIndex < MAP_IDS.length) {
                createNextMap(nextIndex);
            } else {
                setupEventPanel();
            }
        },
    };

    if (isOnClickEnabled()) {
        settings.onClick = ((id) => {
            return (e) => {
                logClick(id, e);
            };
        })(mapDivId);
    }

    govmap.createMap(mapDivId, settings);
}

function setupEventPanel() {
    const select = document.getElementById('eventSelect');
    const btnRegister = document.getElementById('btnRegisterEvent');
    const btnUnbind = document.getElementById('btnUnbindEvent');

    if (!select || !btnRegister || !btnUnbind) {
        return;
    }

    btnRegister.addEventListener('click', () => {
        const eventKey = select.value;
        const eventEnum = getEventEnum(eventKey);

        if (eventEnum == null) {
            logEvent('error', '', { message: 'Unknown event: ' + eventKey });
            return;
        }

        const mapIds = getSelectedMapIds();

        if (mapIds.length === 0) {
            logEvent('error', '', { message: 'בחר לפחות מפה אחת' });
            return;
        }

        mapIds.forEach((mapDivId) => {
            const cb = ((evKey, id) => {
                return (e) => {
                    logEvent(evKey, id, e);
                };
            })(eventKey, mapDivId);

            let evApi;
            try {
                evApi = govmap.onEvent(eventEnum, mapDivId);
            } catch (err) {
                evApi = govmap.onEvent(eventEnum);
            }

            if (evApi !== undefined && evApi !== null && typeof evApi.progress === 'function') {
                evApi.progress(cb);
            }
        });

        logEvent('registered', '', { event: eventKey, maps: mapIds });
    });

    btnUnbind.addEventListener('click', () => {
        const eventKey = select.value;
        const eventEnum = getEventEnum(eventKey);

        if (eventEnum == null) {
            logEvent('error', '', { message: 'Unknown event: ' + eventKey });
            return;
        }

        const mapIds = getSelectedMapIds();

        if (mapIds.length === 0) {
            logEvent('error', '', { message: 'בחר לפחות מפה אחת' });
            return;
        }

        mapIds.forEach((mapDivId) => {
            try {
                if (typeof govmap.unbindEvent === 'function') {
                    govmap.unbindEvent(eventEnum, mapDivId);
                } else {
                    govmap.unbindEvent(eventEnum);
                }
            } catch (err) {
                govmap.unbindEvent(eventEnum);
            }
        });

        logEvent('unbound', '', { event: eventKey, maps: mapIds });
    });

    setupEventPanelMapCheckboxes();
}

function setupEventPanelMapCheckboxes() {
    const allCb = document.getElementById('eventMapsAll');
    const individualCbs = document.querySelectorAll('input[name="eventMap"]');

    if (!allCb || !individualCbs.length) {
        return;
    }

    if (allCb.checked) {
        individualCbs.forEach((cb) => {
            cb.checked = true;
        });
    }

    allCb.addEventListener('change', () => {
        const checked = allCb.checked;
        individualCbs.forEach((cb) => {
            cb.checked = checked;
        });
    });

    individualCbs.forEach((cb) => {
        cb.addEventListener('change', () => {
            const total = individualCbs.length;
            const checkedCount = document.querySelectorAll('input[name="eventMap"]:checked').length;
            allCb.checked = checkedCount === total;
        });
    });
}

function setupClearLog() {
    const btnClear = document.getElementById('btnClearLog');
    const logEl = document.getElementById('eventLog');

    if (btnClear && logEl) {
        btnClear.addEventListener('click', () => {
            logEl.textContent = '';
        });
    }
}

function setupCreateMapsButton() {
    const btn = document.getElementById('btnCreateMaps');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', () => {
        if (typeof govmap === 'undefined' || !govmap.createMap) {
            return;
        }

        createNextMap(0);
    });
}

function initGovMap() {
    if (typeof govmap === 'undefined' || !govmap.createMap) {
        return;
    }

    setupClearLog();
    setupCreateMapsButton();
}
