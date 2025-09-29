// govmap functions

function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        visibleLayers: [],
        layers: ['kids_g', 'school', 'bus_stops', 'PARCEL_ALL', 'SUB_GUSH_ALL'],
        layersMode: 2,
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: true
    });
}

// general functions

function createMap() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'background', value: '', type: 'number', isOptional: false },
        { label: 'center', value: {x: '', y: ''}, type: 'object', isOptional: true },
        { label: 'setMapMarker', value: '', type: 'boolean', isOptional: true },
        { label: 'visibleLayers', value: '', type: 'string[]', isOptional: true },
        { label: 'layers', value: '', type: 'string[]', isOptional: false },
        { label: 'layersMode', value: '', type: 'number', isOptional: false },
        { label: 'level', value: '', type: 'number', isOptional: true },
        { label: 'showXY', value: '', type: 'boolean', isOptional: false },
        { label: 'identifyOnClick', value: '', type: 'boolean', isOptional: false },
        { label: 'bgButton', value: '', type: 'boolean', isOptional: true },
        { label: 'isEmbeddedToggle', value: '', type: 'boolean', isOptional: false },
        { label: 'zoomButtons', value: '', type: 'boolean', isOptional: true },
        { label: 'extent', value: {xmin: '', ymin: '', xmax: '', ymax: ''}, type: 'object', isOptional: true },
    ]).then(values => {
        if (!values) return;
        const params = {
            token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
            background: values[0],
            center: values[1],
            setMapMarker: values[2],
            visibleLayers: values[3],
            layers: values[4],
            layersMode: values[5],
            level: values[6],
            showXY: values[7],
            identifyOnClick: values[8],
            bgButton: values[9],
            isEmbeddedToggle: values[10],
            zoomButtons: values[11],
            extent: values[12],
        };
        govmap.createMap('map', params);
    });
}

function zoomToXY() {
    toggleParentDropdown();
    openModal([
        { label: 'X', value: '', type: 'number', isOptional: false },
        { label: 'Y', value: '', type: 'number', isOptional: false },
        { label: 'level', value: '', type: 'number', isOptional: true },
        { label: 'marker', value: '', type: 'boolean', isOptional: true },
    ]).then(values => {
        if (!values) return;
        const x = parseFloat(values[0]);
        const y = parseFloat(values[1]);
        const levelVal = parseFloat(values[2]);
        const level = isFinite(levelVal) ? levelVal : 10;
        const marker = (values[3] == null || values[3] === '') ? true : (values[3] === 'true');
        if (isFinite(x) && isFinite(y)) {
            // Show what is being requested as feedback
            renderResponse({ action: 'zoomToXY', params: { x, y, level, marker } });
            govmap.zoomToXY({ x, y, level, marker });
        }
    });
}

function closeBubble() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.closeBubble();
}

function onEvent(eventName) {
    renderResponse({ action: 'onEvent', event: eventName });
    govmap.onEvent(eventName).progress((payload) => {
        renderResponse({ event: eventName, payload });
    });
    closeSubMenus();
}

function unbindEvent(eventName) {
    govmap.unbindEvent(eventName);
    closeSubMenus();
}

function getBackground() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.getBackground().then(response => {
        renderResponse(response);
    });
}

function setBackground() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'מזהה מפת רקע',
            value: 0,
            options: [
            { 
                value: 0,
                label: 'רחובות ומבנים' 
            },
            { 
                value: 1,
                label: 'תצלום אוויר 2023' 
            },
            { 
                value: 2,
                label: 'משולב' 
            },
            { 
                value: 3,
                label: 'CIR' 
            },
            { 
                value: 5,
                label: 'מפה היסטורית תל אביב 1930' 
            },
            { 
                value: 6,
                label: 'מפה היסטורית ירושלים 1926' 
            },
            { 
                value: 8,
                label: 'מפה היסטורית חיפה 1919' 
            },
            { 
                value: 9,
                label: 'מפה טופוגרפית' 
            },
            { 
                value: 11,
                label: 'ללא רקע' 
            },
            { 
                value: 16,
                label: 'תצלום אוויר 2003' 
            },
            { 
                value: 17,
                label: 'תצלום אוויר 2004' 
            },
            { 
                value: 20,
                label: 'תצלום אוויר 2005' 
            },
            { 
                value: 18,
                label: 'תצלום אוויר 2006' 
            },
            { 
                value: 21,
                label: 'תצלום אוויר 2008' 
            },
            { 
                value: 19,
                label: 'תצלום אוויר 2013' 
            },
            { 
                value: 24,
                label: 'תצלום אוויר 2019' 
            },
            { 
                value: 32,
                label: 'תצלום אוויר 2021' 
            },
            { 
                value: 27,
                label: 'תצלום אוויר 2022' 
            },
        ],
        isOptional: false },
    ]).then(values => {
        if (!values) return;
        const params = {
            background: values[0]
        };
        govmap.setBackground(params);
    });
}

function getCenter() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.getCenter().then(response => {
        renderResponse(response);
    });
}

function getMapUrl() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.getMapUrl().then(response => {
        renderResponse(response);
    });
}

function getXY() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.getXY().then(response => {
        renderResponse(response);
    });
}

function getLayerRenderer() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: '', value: {LayerNames: []}, type: 'object', isOptional: false },
    ]).then(values => {
        if (!values) return;
        govmap.getLayerRenderer(values[0]).then(response => {
            renderResponse(response);
        });
    });
}

function zoomIn() {
    govmap.zoomIn();
}

function zoomOut() {
    govmap.zoomOut();
}

function getZoomLevel() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.getZoomLevel().then(response => {
        renderResponse(response);
    });
}

function getMapTolerance() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.getMapTolerance().then(response => {
        renderResponse(response);
    });
}

function setLayerOpacity() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: '', value: {layerName: '', opacity: 1}, type: 'object', isOptional: false },
    ]).then(values => {
        if (!values) return;
        govmap.setLayerOpacity(values[0]);
    });
}

function setMapCursor() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: '', value: govmap.cursorType.DEFAULT, options: [
            { value: govmap.cursorType.DEFAULT, label: 'DEFAULT' },
            { value: govmap.cursorType.TARGET, label: 'TARGET' },
            { value: govmap.cursorType.POLYGON, label: 'POLYGON' },
            { value: govmap.cursorType.CIRCLE, label: 'CIRCLE' },
            { value: govmap.cursorType.RECTANGLE, label: 'RECTANGLE' },
            { value: govmap.cursorType.SELECT_FEATURES, label: 'SELECT_FEATURES' },
        ], isOptional: false },
    ]).then(values => {
        if (!values) return;
        govmap.setMapCursor(Number(values[0]));
    });
}

function setDefaultTool() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.setDefaultTool();
}

function showPrint() {
    govmap.showPrint();
}

function closePrint() {
    govmap.closePrint();
}

function showExportMap() {
    govmap.showExportMap();
}

function closeExportMap() {
    govmap.closeExportMap();
}

function showMeasure() {
    govmap.showMeasure();
}

function closeMeasure() {
    govmap.closeMeasure();
}

function closeOpenApps() {
    govmap.closeOpenApps();
}

function getGPSLocation() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.getGPSLocation().then(response => {
        renderResponse(response);
    });
}

function gpsOn() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.gpsOn();
}

function gpsOff() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.gpsOff();
}

function setGpsMarker() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: '', value: {x: 222259, y: 631530, accuracy: 500}, type: 'object', isOptional: false },
    ]).then(values => {
        if (!values) return;
        govmap.setGpsMarker(values[0]);
    });
}

function removeGPSMarker() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.removeGPSMarker();
}


function setVisibleLayers() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'שכבות להדלקה', value: '', type: 'string[]', isOptional: false },
        { label: 'שכבות לכיבוי', value: '', type: 'string[]', isOptional: false },
    ]).then(values => {
        if (!values) return;
        govmap.setVisibleLayers(values[0]);
    });
}

// search functions

function searchAndLocate() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { 
            label: 'type',
            options: [
                { 
                    value: govmap.locateType.lotParcelToAddress,
                    label: 'govmap.locateType.lotParcelToAddress' 
                },
                { 
                    value: govmap.locateType.addressToLotParcel,
                    label: 'govmap.locateType.addressToLotParcel' 
                }
            ],
            isOptional: false,
            value: govmap.locateType.lotParcelToAddress
         },
        { label: 'address', value: '', type: 'string', isOptional: true },
        { label: 'lot', value: '', type: 'number', isOptional: true },
        { label: 'parcel', value: '', type: 'number', isOptional: true },
    ]).then(values => {
        if (!values) return;
        const params = Number(values[0]) === govmap.locateType.addressToLotParcel ? {
            lot: Number(values[2]),
            parcel: Number(values[3]),
            } : {
                address: values[1]
            };
        govmap.searchAndLocate({type: Number(values[0]), ...params})
            .then(response => {
                renderResponse(response);
            });
    });
}

function intersectFeatures() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'layerName', value: '', type: 'string', isOptional: false },
        { label: 'fields', value: '', type: 'string[]', isOptional: false },
        { label: 'address', value: '', type: 'string', isOptional: true },
        { label: 'geometry', value: '', type: 'string', isOptional: true },
        { label: 'whereClause', value: '', type: 'string', isOptional: true },
        { label: 'getShapes', value: '', type: 'boolean', isOptional: true },
    ]).then(values => {
        if (!values) return;
        const params = {
            layerName: values[0],
            fields: values[1],
            address: values[2],
            geometry: values[3],
            whereClause: values[4],
            getShapes: values[5]
        };
        govmap.intersectFeatures(params)
            .then(response => {
                renderResponse(response);
            });
    });
}

function geocode() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'keyword', value: '', type: 'string', isOptional: false },
        { 
            label: 'type',
            options: [
                { 
                    value: govmap.geocodeType.FullResult,
                    label: 'govmap.geocodeType.FullResult' 
                },
                { 
                    value: govmap.geocodeType.AccuracyOnly,
                    label: 'govmap.geocodeType.AccuracyOnly' 
                }
            ],
            isOptional: false,
            value: govmap.geocodeType.AccuracyOnly
         }
    ])
    .then(values => {
        if (!values) return;
        const params = {
            keyword: values[0],
            type: values[1]
        };
        govmap.geocode(params)
            .then(response => {
                renderResponse(response);
            });
    });
}

function searchInLayer() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'layerName', value: '', type: 'string', isOptional: false },
        { label: 'fieldName', value: '', type: 'string', isOptional: false },
        { label: 'fieldValues', value: '', type: 'string[]', isOptional: false },
        { label: 'highlight', value: '', type: 'boolean', isOptional: true },
        { label: 'showBubble', value: '', type: 'boolean', isOptional: true },
        { label: 'outLineColor', value: '', type: 'number[]', isOptional: true },
        { label: 'fillColor', value: '', type: 'number[]', isOptional: true },
    ]).then(values => {
        if (!values) return;
        const params = {
            layerName: values[0],
            fieldName: values[1],
            fieldValues: values[2],
            highlight: values[3],
            showBubble: values[4],
            outLineColor: values[5],
            fillColor: values[6]
        };
        govmap.searchInLayer(params);
    });
}

function filterLayers() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'layerName', value: '', type: 'string', isOptional: false },
        { label: 'whereClause', value: '', type: 'string', isOptional: false },
        { label: 'zoomToExtent', value: '', type: 'boolean', isOptional: true },
    ]).then(values => {
        if (!values) return;
        const params = {
            layerName: values[0],
            whereClause: values[1],
            zoomToExtent: values[2]
        };
        govmap.filterLayers(params)
            .then(response => {
                renderResponse(response);
            });
    });
}

function getLayerData() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'LayerName', value: '', type: 'string', isOptional: false },
        { label: 'Point', value: {x: '', y: ''}, type: 'object', isOptional: false },
        { label: 'Radius', value: '', type: 'number', isOptional: false },
    ]).then(values => {
        if (!values) return;
        const params = {
            LayerName: values[0],
            Point: values[1],
            Radius: values[2]
        };
        govmap.getLayerData(params)
            .then(response => {
                renderResponse(response);
            });
        });
}

function identifyByXY() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'x', value: 179681, type: 'number', isOptional: false },
        { label: 'y', value: 664037, type: 'number', isOptional: false },
    ]).then(values => {
        if (!values) return;
        govmap.identifyByXY(values[0], values[1])
            .then(response => {
                renderResponse(response);
            });
    });
}

function identifyByXYAndLayer() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'x', value: 179681, type: 'number', isOptional: false },
        { label: 'y', value: 664037, type: 'number', isOptional: false },
        { label: 'layers', value: ['gasstations'], type: 'string[]', isOptional: false },
    ]).then(values => {
        if (!values) return;
        govmap.identifyByXYAndLayer(values[0], values[1], values[2])
            .then(response => {
                renderResponse(response);
            });
    });
}

// Geometric functions
function draw(type) {
    const subContainer = document.getElementById('general-functions-dropdown');
    closeAllDropdowns();
    renderResponse(null);
    
    // Clear the current trigger and active states
    if (subContainer) {
        delete subContainer.dataset.currentTrigger;
        closeSubMenus();
    }
    
    // Execute the draw action
    govmap.draw(type)
        .then(response => {
            renderResponse(response);
        });
}

function editDrawing() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.editDrawing();
}

function zoomToDrawing() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.zoomToDrawing();
}

function clearDrawings() {
    toggleParentDropdown();
    renderResponse(null);
    govmap.clearDrawings();
}

function displayGeometries() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'wkts', value: '', type: 'string[]', isOptional: true },
        { label: 'circleGeometries', value: [{x: '', y: '', radius: ''}], type: 'object[]', isOptional: true },
        { label: 'names', value: '', type: 'string[]', isOptional: false },
        { 
            label: 'geometryType',
            options: [
                { 
                    value: govmap.geometryType.POINT,
                    label: 'govmap.geometryType.POINT' 
                },
                { 
                    value: govmap.geometryType.POLYLINE,
                    label: 'govmap.geometryType.POLYLINE' 
                },
                { 
                    value: govmap.geometryType.POLYGON,
                    label: 'govmap.geometryType.POLYGON' 
                },
                { 
                    value: govmap.geometryType.LINE,
                    label: 'govmap.geometryType.LINE' 
                },
                { 
                    value: govmap.geometryType.CIRCLE,
                    label: 'govmap.geometryType.CIRCLE' 
                },
            ],
            isOptional: false,
            value: govmap.geometryType.POINT
        },
        { label: 'defaultSymbol', value: '', type: 'object', isOptional: true },
        { label: 'symbols', value: '', type: 'object[]', isOptional: true },
        { label: 'clearExistings', value: false, type: 'boolean', isOptional: true },
        { label: 'data',
            value: {
            tooltips: [],
            headers: [],
            bubbleUrl: '',
            bubbles: [],
            bubbleHTML: '',
            bubbleHTMLParameters: [[]],
            labels: [],
            fontLabel: [{ font: 'Arial', size: 12, fill: '#000000', stroke: '#FFFFFF'}]
            },
            type: 'object', isOptional: true },
    ]).then(values => {
        if (!values) return;
        const params = {
            wkts: values[0],
            circleGeometries: values[1],
            names: values[2],
            geometryType: values[3],
            defaultSymbol: values[4],
            symbols: values[5],
            clearExistings: values[6],
            data: values[7]
        };
        govmap.displayGeometries(params);
    })
}

function clearGeometriesByName() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'geometries names', value: '', type: 'string[]', isOptional: false },
    ]).then(values => {
        if (!values) return;
        const params = {
            names: values[0]
        };
        govmap.clearGeometriesByName(params);
    });
}

function clearGeometriesById() {
    toggleParentDropdown();
    renderResponse(null);
    openModal([
        { label: 'geometries ids', value: '', type: 'string[]', isOptional: false },
    ]).then(values => {
        if (!values) return;
        const params = {
            ids: values[0]
        };
        govmap.clearGeometriesById(params);
    });
}

// Utils

// Unified renderer: pretty-prints an object/string into #response and toggles #response-section
function renderResponse(data) {
    // Close any open menus; do NOT toggle-open them here
    closeAllDropdowns();
    const out = document.getElementById('response');
    const section = document.getElementById('response-section');
    if (!out || !section) return;
    // Hide by default
    section.style.display = 'none';
    out.innerHTML = '';
    if (data == null) return;
    const pre = document.createElement('pre');
    pre.style.margin = '0.5rem 0';
    pre.style.direction = 'ltr';
    pre.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    out.appendChild(pre);
    if (out.textContent.trim()) section.style.display = 'block';
}

function copy() {
    const response = document.getElementById('response');
    const section = document.getElementById('response-section');
    if (!response) return;
    const text = (response.textContent || '').trim();
    if (!text) return;

    const showTooltip = (msg) => {
        if (!section) return;
        // Remove existing tooltip if present
        const old = document.getElementById('copy-tooltip');
        if (old) old.remove();
        const tip = document.createElement('div');
        tip.id = 'copy-tooltip';
        tip.textContent = msg;
        tip.style.cssText = [
            'position:absolute',
            'top:8px',
            'right:80px',
            'background:rgba(31,41,55,0.95)',
            'color:#fff',
            'padding:4px 8px',
            'border-radius:6px',
            'font-size:12px',
            'box-shadow:0 2px 6px rgba(0,0,0,0.2)',
            'z-index: 30'
        ].join(';');
        section.appendChild(tip);
        setTimeout(() => tip.remove(), 2000);
    };

    const doCopy = (str) => navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(str)
        : new Promise((resolve, reject) => {
            try {
                const ta = document.createElement('textarea');
                ta.value = str;
                ta.style.position = 'fixed';
                ta.style.top = '-1000px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? resolve() : reject(new Error('copy failed'));
            } catch (e) { reject(e); }
        });

    doCopy(text)
        .then(() => showTooltip('הועתק'))
        .catch(() => showTooltip('שגיאה בהעתקה'));
}

function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.trim();

    govmap.geocode({ keyword: searchTerm, type: govmap.geocodeType.AccuracyOnly })
        .then(function (response) {
            if (response.data && response.data.length > 0) {
                const firstResult = response.data[0];
                zoomToXY(firstResult.X, firstResult.Y);
            } else {
                console.warn('לא נמצאו תוצאות');
            }
        });
}

// Opens a generic modal with dynamic fields and confirm.
// fields: Array of { label: string, value: string|number, type: 'string'|'number' }
// Returns a Promise that resolves to an array of values (strings) on OK, or null on cancel/dismiss.
function openModal(fields) {
    // Prevent multiple modals
    const existing = document.getElementById('generic-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'generic-modal-overlay';
    overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'background:rgba(0,0,0,0.4)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'z-index: 2000'
    ].join(';');

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.style.cssText = [
        'background:#fff',
        'min-width:320px',
        'max-width:90vw',
        'border-radius:8px',
        'box-shadow:0 10px 25px rgba(0,0,0,0.2)',
        'padding:16px',
        'direction: rtl',
        'font-family: inherit',
        'max-height: 90vh',
        'overflow-y: auto'
    ].join(';');

    dialog.innerHTML = `
        <div style="margin-bottom:8px;font-weight:600;color:#1f2937;">קלט</div>
        <div id="modal-fields" style="display:flex;flex-direction:column;gap:8px;"></div>
        <div style="display:flex;gap:8px;justify-content:space-between;margin-top:12px;">
            <button id="modal-cancel" style="padding:0.4rem 0.8rem;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;cursor:pointer;">ביטול</button>
            <button id="modal-ok" class="btn" style="padding:0.4rem 0.8rem;">אישור</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Render dynamic fields
    const fieldsContainer = dialog.querySelector('#modal-fields');
    const inputs = [];
    (fields || []).forEach((f, idx) => {
        const wrapper = document.createElement('label');
        wrapper.style.cssText = 'display:flex;align-items:center;gap:8px;';

        const span = document.createElement('span');
        span.style.minWidth = '80px';
        span.textContent = f.label ?? `Field ${idx + 1}`;
        
        let input;
        
        if (Array.isArray(f.options)) {
            // Create dropdown for array options
            input = document.createElement('select');
            input.style.cssText = 'flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;';
            
            // Add empty option if field is optional
            if (f.isOptional) {
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '-- Select --';
                input.appendChild(emptyOption);
            }
            
            // Add provided options
            f.options.forEach(option => {
                const optionEl = document.createElement('option');
                optionEl.value = option.value ?? option;
                optionEl.textContent = option.label ?? option;
                optionEl.selected = (f.value !== undefined && (option.value === f.value || option === f.value));
                input.appendChild(optionEl);
            });
        } else if (f.type === 'string[]' || f.type === 'number[]') {
            const isNumberArray = f.type === 'number[]';
            // Create container for array items
            const container = document.createElement('div');
            container.style.flex = '1';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '8px';
            
            // Parse initial values
            const values = Array.isArray(f.value) ? f.value : 
                         (f.value ? String(f.value).split(',').map(s => s.trim()) : ['']);
            
            // Function to create an item row
            const createItemRow = (value = '') => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.gap = '4px';
                row.style.alignItems = 'center';
                
                const itemInput = document.createElement('input');
                itemInput.type = isNumberArray ? 'number' : 'text';
                if (isNumberArray) {
                    itemInput.step = 'any';
                    // Only allow numbers, minus, decimal point, and control keys
                    itemInput.onkeydown = (e) => {
                        if (!/^[0-9\-.]$/.test(e.key) && 
                            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                            e.preventDefault();
                        }
                    };
                }
                itemInput.value = value;
                itemInput.style.flex = '1';
                itemInput.style.padding = '6px 8px';
                itemInput.style.border = '1px solid #e5e7eb';
                itemInput.style.borderRadius = '4px';
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.textContent = '×';
                removeBtn.style.cssText = 'width:24px;height:24px;padding:0;border:none;background:none;cursor:pointer;color:#6b7280;font-size:18px;';
                removeBtn.onclick = () => {
                    if (container.querySelectorAll('.array-item').length > 1) {
                        container.removeChild(row);
                    } else {
                        itemInput.value = '';
                    }
                };
                
                row.appendChild(itemInput);
                row.appendChild(removeBtn);
                row.classList.add('array-item');
                
                return row;
            };
            
            // Add initial items
            values.forEach(value => {
                container.appendChild(createItemRow(value));
            });
            
            // Add button to add new item
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.textContent = '+ הוסף פריט';
            addBtn.style.cssText = 'margin-top:4px;padding:4px 8px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:4px;cursor:pointer;font-size:12px;align-self:flex-start;';
            addBtn.onclick = () => {
                const newRow = createItemRow();
                container.insertBefore(newRow, addBtn);
                newRow.querySelector('input').focus();
            };
            
            container.appendChild(addBtn);
            input = container;
        } else if (f.type === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.style.cssText = 'flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;';
            input.value = (f.value ?? '').toString();
        } else if (f.type === 'object' || f.type === 'object[]') {
            input = document.createElement('div');
            input.style.cssText = 'display:flex;flex-direction:column;gap:8px;direction: ltr;';
            
            const textarea = document.createElement('textarea');
            textarea.style.cssText = 'min-height:100px;padding:8px;border:1px solid #e5e7eb;border-radius:4px;font-family:monospace;';
            
            if (f.type === 'object') {
                textarea.placeholder = 'Enter valid JSON object (e.g., {\"key\": \"value\"})';
                try {
                    textarea.value = JSON.stringify(f.value || {}, null, 2);
                } catch (e) {
                    textarea.value = '{}';
                    console.error('Error stringifying object:', e);
                }
            } else { // object[]
                textarea.placeholder = 'Enter valid JSON array of objects (e.g., [{\"key\": \"value\"}])';
                try {
                    textarea.value = Array.isArray(f.value) ? JSON.stringify(f.value, null, 2) : '[]';
                } catch (e) {
                    textarea.value = '[]';
                    console.error('Error stringifying object array:', e);
                }
            }
            
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = 'color:#ef4444;font-size:12px;min-height:16px;';
            
            const validateJson = () => {
                try {
                    const parsed = JSON.parse(textarea.value);
                    if (f.type === 'object' && (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))) {
                        throw new Error('Must be a valid JSON object');
                    }
                    if (f.type === 'object[]' && !Array.isArray(parsed)) {
                        throw new Error('Must be a valid JSON array');
                    }
                    if (f.type === 'object[]' && parsed.some(item => typeof item !== 'object' || item === null)) {
                        throw new Error('Array must contain only objects');
                    }
                    input.dataset.objectData = JSON.stringify(parsed);
                    errorMsg.textContent = `✓ Valid ${f.type}`;
                    errorMsg.style.color = '#10b981';
                    return true;
                } catch (e) {
                    errorMsg.textContent = e.message || 'Invalid JSON';
                    errorMsg.style.color = '#ef4444';
                    return false;
                }
            };
            
            textarea.addEventListener('input', validateJson);
            // Initial validation
            validateJson();
            
            input.appendChild(textarea);
            input.appendChild(errorMsg);
        } else if (f.type === 'boolean') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.style.cssText = 'width:auto;height:auto;';
            const v = f.value;
            input.checked = v === true || v === 'true' || v === 1 || v === '1';
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.style.cssText = 'flex:1;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;';
            input.value = (f.value ?? '').toString();
        }

        wrapper.appendChild(span);
        wrapper.appendChild(input);

        if (f.isOptional) {
            const optional = document.createElement('span');
            optional.textContent = 'לא חובה';
            optional.style.cssText = 'color:#6b7280;font-size:0.85rem;';
            wrapper.appendChild(optional);
        }

        fieldsContainer.appendChild(wrapper);
        inputs.push(input);
    });

    // Focus first input
    setTimeout(() => { if (inputs[0]) inputs[0].focus(); }, 0);

    return new Promise(resolve => {
        const cleanup = () => {
            document.removeEventListener('keydown', onKeyDown);
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        const submit = () => {
            // Validate all object/object[] fields before submission
            const validationPromises = fields.map((field, idx) => {
                if (field.type === 'object' || field.type === 'object[]') {
                    try {
                        const data = inputs[idx].dataset.objectData || (field.type === 'object' ? '{}' : '[]');
                        const parsed = JSON.parse(data);
                        
                        if (field.type === 'object' && (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))) {
                            return Promise.reject(new Error(`Field "${field.label}" must be a valid object`));
                        }
                        if (field.type === 'object[]' && !Array.isArray(parsed)) {
                            return Promise.reject(new Error(`Field "${field.label}" must be a valid array`));
                        }
                        if (field.type === 'object[]' && parsed.some(item => typeof item !== 'object' || item === null)) {
                            return Promise.reject(new Error(`Field "${field.label}" array must contain only objects`));
                        }
                    } catch (e) {
                        return Promise.reject(new Error(`Invalid JSON in field "${field.label}": ${e.message}`));
                    }
                }
                return Promise.resolve();
            });

            return Promise.all(validationPromises).then(() => {
                const result = inputs.map((inp, idx) => {
                const field = fields[idx];
                if (field.type === 'boolean') {
                    return inp.checked ? 'true' : 'false';
                } else if (field.type === 'string[]' || field.type === 'number[]') {
                    // Collect all non-empty values from array inputs
                    const items = [];
                    const itemInputs = inp.querySelectorAll('input[type="text"], input[type="number"]');
                    itemInputs.forEach(itemInput => {
                        const val = itemInput.value.trim();
                        if (val) {
                            if (field.type === 'number[]') {
                                const num = parseFloat(val);
                                if (!isNaN(num)) {
                                    items.push(num);
                                }
                            } else {
                                items.push(val);
                            }
                        }
                    });
                    return items;
                } else if ((field.type === 'object' || field.type === 'object[]') && inp.dataset.objectData) {
                    // For object/object[] types, we store the JSON string in data attribute
                    try {
                        return JSON.parse(inp.dataset.objectData);
                    } catch (e) {
                        console.error('Error parsing object data:', e);
                        return field.type === 'object' ? {} : [];
                    }
                }
                return inp.value;
            });
                cleanup();
                return result;
            }).then(result => {
                resolve(result);
            }).catch(error => {
                alert(error.message);
                return null;
            });
        };

        const cancel = () => {
            cleanup();
            resolve(null);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
            } else if (e.key === 'Enter') {
                // Allow enter to confirm if focus is in inputs
                if (inputs.includes(document.activeElement)) {
                    submit();
                }
            }
        };

        document.addEventListener('keydown', onKeyDown);

        // Overlay click closes only if clicking outside the dialog
        overlay.addEventListener('click', cancel);
        dialog.addEventListener('click', (e) => e.stopPropagation());

        dialog.querySelector('#modal-ok').addEventListener('click', submit);
        dialog.querySelector('#modal-cancel').addEventListener('click', cancel);
    });
}

// Generic submenu toggle by trigger id (e.g., 'draw-link', 'onevent-link')
function toggleGeneralFunctionsSubMenu(triggerId, event) {
    event.stopPropagation();
    
    const subContainer = document.getElementById('general-functions-dropdown');
    const trigger = document.getElementById(triggerId);
    if (!subContainer || !trigger) return;

    // Get the target menu type based on the trigger
    const menuTypeMap = {
        'draw-link': 'draw-link',
        'onevent-link': 'onevent-link',
        'unbindevent-link': 'onevent-link'
    };
    
    const menuType = menuTypeMap[triggerId] || triggerId;
    const targetMenu = subContainer.querySelector(`.${menuType}`);
    
    if (!targetMenu) return;

    // Check if the same menu is already open
    const isSameMenuOpen = subContainer.classList.contains('active') && 
                          targetMenu.classList.contains('active');

    // Close all dropdowns first
    closeAllDropdowns();
    
    // If clicking the same menu that's already open, don't reopen it
    if (isSameMenuOpen) {
        return;
    }

    // Position the submenu next to the trigger
    const rect = trigger.getBoundingClientRect();
    subContainer.style.top = `${rect.bottom}px`;
    subContainer.style.left = `${rect.left}px`;

    // Set the current trigger for action handling
    subContainer.dataset.currentTrigger = triggerId;

    // Show the submenu and highlight the trigger
    subContainer.classList.add('active');
    targetMenu.classList.add('active');
    trigger.classList.add('active');
    
    // Add active class to parent dropdown
    const parentDropdown = trigger.closest('.dropdown-parent');
    if (parentDropdown) {
        parentDropdown.classList.add('active');
    }
}

// Use the currentTrigger stored on the submenu container to decide whether to bind or unbind
function handleEventAction(eventName) {
    const subContainer = document.getElementById('general-functions-dropdown');
    const from = subContainer?.dataset?.currentTrigger;
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    // Clear any previous response
    renderResponse(null);
    
    // Handle the action
    if (from === 'unbindevent-link') {
        unbindEvent(eventName);
        renderResponse({ action: 'unbindEvent', event: eventName });
    } else if (from === 'onevent-link') {
        onEvent(eventName);
        renderResponse({ action: 'onEvent', event: eventName });
    }
    
    // Clear the current trigger and active states
    if (subContainer) {
        delete subContainer.dataset.currentTrigger;
        // Remove active class from parent menu items
        closeSubMenus();
    }
    
    // Prevent event from bubbling up to document click handler
    event.stopPropagation();
    
    // Return false to prevent default action
    return false;
}

function toggleParentDropdown(id, event) {
    if (event) event.stopPropagation();
    
    const dropdown = document.getElementById(id);
    if (!dropdown) return;
    
    // Check if the dropdown is already open
    const isAlreadyOpen = dropdown.classList.contains('active');
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    // If the clicked dropdown wasn't open, open it
    if (!isAlreadyOpen) {
        dropdown.classList.add('active');
    }
}

function closeSubMenus() {
    const subContainer = document.getElementById('general-functions-dropdown');
    if (subContainer) {
        subContainer.classList.remove('active');
        subContainer.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    }
    
    // Remove active class from all dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
}

function closeAllDropdowns() {
    // Close all dropdown parents
    document.querySelectorAll('.dropdown-parent').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
    
    // Close all submenus
    closeSubMenus();
    
    // Clear any current trigger
    const subContainer = document.getElementById('general-functions-dropdown');
    if (subContainer) {
        delete subContainer.dataset.currentTrigger;
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (event) {
    const dropdownParents = document.querySelectorAll('.dropdown-parent');
    const subContainers = document.querySelectorAll('.sub-dropdown');
    
    // Check if click is on a dropdown item that should keep the menu open
    const isDropdownItem = event.target.closest('.dropdown-item') && 
                         !event.target.closest('.dropdown-item[onclick^="handleEventAction"]');
    
    // Check if click is inside any dropdown or submenu
    const isInsideDropdown = Array.from(dropdownParents).some(parent => 
        parent.contains(event.target)
    ) || Array.from(subContainers).some(container => 
        container.contains(event.target)
    );
    
    // Only close if clicking outside all dropdowns and not on a dropdown item
    if (!isInsideDropdown && !isDropdownItem) {
        closeAllDropdowns();
    } else {
        // If clicking inside a dropdown, prevent it from closing
        event.stopPropagation();
    }
});
const searchInput = document.querySelector('.search-input');
const searchBtn = document.getElementById('searchBtn');
function updateSearchBtn() {
    searchBtn.disabled = searchInput.value.trim() === '';
}
searchInput.addEventListener('input', updateSearchBtn);
// Initial state
updateSearchBtn();

// Handle Enter key in search input
searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && !searchBtn.disabled) {
        handleSearch();
    }
});

