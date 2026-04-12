function initGovMap() {
    createMap();
    setupEventPanel();
    setupZoomPanel();
    setupMapStateLayersPanel();
    setupLayerDataFilterPanel();
    setupUserLayerSavePanel();
    setupIdentifyPanel();
    setupBackgroundToolsPanel();
    setupGpsPanel();
    setupDrawAndGeometryPanel();
    setupLogPanel();
}

function createMap() {
    govmap.createMap('map1', {
        token: GOVMAP_TOKEN,
        layers: ['GASSTATIONS', 'SUB_GUSH_ALL', 'PARCEL_ALL', 'layer_228867', 'bus_stops'],
        visibleLayers: ['204093'],
        showXY: true,
        isEmbeddedToggle: false,
        background: '0',
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {},
    });
}

function setupEventPanel() {
    const select = document.getElementById('eventSelect');
    const btnRegister = document.getElementById('btnRegister');
    const btnUnbind = document.getElementById('btnUnbind');

    if (!select || !btnRegister || !btnUnbind) {
        return;
    }

    btnRegister.addEventListener('click', () => {
        const eventKey = select.value;
        registerMapEvent(eventKey);
    });

    btnUnbind.addEventListener('click', () => {
        const eventKey = select.value;
        unbindMapEvent(eventKey);
    });
}

function setupZoomPanel() {
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnGetZoomLevel = document.getElementById('btnGetZoomLevel');
    const btnGetMapTolerance = document.getElementById('btnGetMapTolerance');

    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            govmap.zoomIn();
            logEvent('zoomIn', { called: true });
        });
    }

    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            govmap.zoomOut();
            logEvent('zoomOut', { called: true });
        });
    }

    if (btnGetZoomLevel) {
        btnGetZoomLevel.addEventListener('click', () => {
            govmap.getZoomLevel().then((response) => {
                logEvent('getZoomLevel', response);
            });
        });
    }

    if (btnGetMapTolerance) {
        btnGetMapTolerance.addEventListener('click', () => {
            govmap.getMapTolerance().then((result) => {
                logEvent('getMapTolerance', result);
            });
        });
    }
}

function setupMapStateLayersPanel() {
    const btnGetBackground = document.getElementById('btnGetBackground');
    const btnGetCenter = document.getElementById('btnGetCenter');
    const btnGetMapUrl = document.getElementById('btnGetMapUrl');
    const btnGetXY = document.getElementById('btnGetXY');
    const btnGetLayerRenderer = document.getElementById('btnGetLayerRenderer');
    const btnGeocode = document.getElementById('btnGeocode');
    const btnSetVisibleLayers = document.getElementById('btnSetVisibleLayers');
    const btnSetHeatLayer = document.getElementById('btnSetHeatLayer');
    const btnRemoveHeatLayer = document.getElementById('btnRemoveHeatLayer');
    const btnChangeHeatLayerValueField = document.getElementById('btnChangeHeatLayerValueField');

    if (btnGetBackground) {
        btnGetBackground.addEventListener('click', () => {
            govmap.getBackground().then((response) => {
                logEvent('getBackground', response);
            });
        });
    }

    if (btnGetCenter) {
        btnGetCenter.addEventListener('click', () => {
            govmap.getCenter().then((response) => {
                logEvent('getCenter', response);
            });
        });
    }

    if (btnGetMapUrl) {
        btnGetMapUrl.addEventListener('click', () => {
            govmap.getMapUrl().then((response) => {
                logEvent('getMapUrl', response);
            });
        });
    }

    if (btnGetXY) {
        btnGetXY.addEventListener('click', () => {
            govmap.getXY().progress((response) => {
                logEvent('getXY', response);
            });
        });
    }

    if (btnGetLayerRenderer) {
        btnGetLayerRenderer.addEventListener('click', () => {
            const namesStr = document.getElementById('layerNames').value.trim();
            const LayerNames = namesStr ? namesStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            govmap.getLayerRenderer({ LayerNames }).then((response) => {
                logEvent('getLayerRenderer', response);
            });
        });
    }

    if (btnGeocode) {
        btnGeocode.addEventListener('click', () => {
            const keyword = document.getElementById('geocodeKeyword').value.trim();
            const typeValue = document.getElementById('geocodeType').value;
            const typeEnum = govmap.geocodeType && (govmap.geocodeType[typeValue] || govmap.geocodeType.AccuracyOnly);
            if (!typeEnum) {
                logEvent('geocode error', { message: 'Unknown geocodeType' });
                return;
            }
            govmap.geocode({ keyword, type: typeEnum }).then((response) => {
                logEvent('geocode', response);
            });
        });
    }

    if (btnSetVisibleLayers) {
        btnSetVisibleLayers.addEventListener('click', () => {
            const onStr = document.getElementById('layersOn').value.trim();
            const offStr = document.getElementById('layersOff').value.trim();
            const layersOn = onStr ? onStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            const layersOff = offStr ? offStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            govmap.setVisibleLayers(layersOn, layersOff);
            logEvent('setVisibleLayers', { layersOn, layersOff });
        });
    }

    if (btnSetHeatLayer) {
        btnSetHeatLayer.addEventListener('click', () => {
            const params = {
                points: [
                    { point: { x: 100000, y: 200000 }, attributes: { val1: 50, val2: 800 } },
                    { point: { x: 200000, y: 400000 }, attributes: { val1: 100, val2: 700 } },
                    { point: { x: 200100, y: 400000 }, attributes: { val1: 200, val2: 600 } },
                    { point: { x: 200200, y: 400000 }, attributes: { val1: 300, val2: 500 } },
                    { point: { x: 200300, y: 400000 }, attributes: { val1: 400, val2: 400 } },
                    { point: { x: 200400, y: 400000 }, attributes: { val1: 500, val2: 300 } },
                    { point: { x: 200500, y: 400000 }, attributes: { val1: 600, val2: 200 } },
                    { point: { x: 200600, y: 400000 }, attributes: { val1: 700, val2: 100 } },
                    { point: { x: 300000, y: 400000 }, attributes: { val1: 800, val2: 50 } }
                ],
                options: { valueField: 'val1' }
            };
            govmap.setHeatLayer(params);
            logEvent('setHeatLayer', { called: true });
        });
    }

    if (btnRemoveHeatLayer) {
        btnRemoveHeatLayer.addEventListener('click', () => {
            govmap.removeHeatLayer();
            logEvent('removeHeatLayer', { called: true });
        });
    }

    if (btnChangeHeatLayerValueField) {
        btnChangeHeatLayerValueField.addEventListener('click', () => {
            const valueField = document.getElementById('heatValueField').value.trim();
            govmap.changeHeatLayerValueField(valueField);
            logEvent('changeHeatLayerValueField', { valueField });
        });
    }
}

function setupLayerDataFilterPanel() {
    const btnGetLayerData = document.getElementById('btnGetLayerData');
    const btnFilterLayers = document.getElementById('btnFilterLayers');
    const btnSelectFeaturesOnMap = document.getElementById('btnSelectFeaturesOnMap');
    const btnCloseBubble = document.getElementById('btnCloseBubble');
    const btnSearchInLayer = document.getElementById('btnSearchInLayer');
    const btnGetLayerEntities = document.getElementById('btnGetLayerEntities');

    if (btnGetLayerData) {
        btnGetLayerData.addEventListener('click', () => {
            const LayerName = document.getElementById('layerDataLayerName').value.trim();
            const x = Number(document.getElementById('layerDataX').value);
            const y = Number(document.getElementById('layerDataY').value);
            const Radius = Number(document.getElementById('layerDataRadius').value);
            govmap.getLayerData({ LayerName, Point: { x, y }, Radius }).then((response) => {
                logEvent('getLayerData', response);
            });
        });
    }

    if (btnFilterLayers) {
        btnFilterLayers.addEventListener('click', () => {
            const layerName = document.getElementById('filterLayerName').value.trim();
            const whereClause = document.getElementById('filterWhereClause').value.trim();
            const zoomToExtent = document.getElementById('filterZoomToExtent').checked;
            govmap.filterLayers({ layerName, whereClause, zoomToExtent });
            logEvent('filterLayers', { layerName, whereClause, zoomToExtent });
        });
    }

    if (btnSelectFeaturesOnMap) {
        btnSelectFeaturesOnMap.addEventListener('click', () => {
            const params = {
                continous: false,
                // wkt: 'POINT(179593 663941)',
                // radius: 100,
                drawType: getDrawTypeEnum('Polygon'),
                filterLayer: false,
                isZoomToExtent: true,
                layers: ['gasstations'],
                // returnFields: { gasstations: ['value0', 'value1', 'value2', 'value3'] },
                returnFields: { gasstations: ['name', 'address', 'company'] },
                // whereClause: {
                //     'gasstations': "(name = 'רשף')"
                // },
                selectOnMap: true,
            };
            govmap.selectFeaturesOnMap(params).then((response) => {
                logEvent('selectFeaturesOnMap', response);
            });
        });
    }

    if (btnCloseBubble) {
        btnCloseBubble.addEventListener('click', () => {
            govmap.closeBubble();
            logEvent('closeBubble', { called: true });
        });
    }

    if (btnSearchInLayer) {
        btnSearchInLayer.addEventListener('click', () => {
            const layerName = document.getElementById('searchInLayerName').value.trim();
            const fieldName = document.getElementById('searchInFieldName').value.trim();
            const fieldValuesStr = document.getElementById('searchInFieldValues').value.trim();
            const fieldValues = fieldValuesStr ? fieldValuesStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            const highlight = document.getElementById('searchInHighlight').checked;
            govmap.searchInLayer({
                layerName,
                fieldName,
                fieldValues,
                highlight,
                fillColor: [255, 0, 0, 0.5],
                outLineColor: [0, 255, 0, 1]
            });
            logEvent('searchInLayer', { layerName, fieldName, fieldValues, highlight });
        });
    }

    if (btnGetLayerEntities) {
        btnGetLayerEntities.addEventListener('click', () => {
            const layerName = document.getElementById('layerEntitiesName').value.trim();
            if (!layerName) {
                logEvent('getLayerEntities error', { message: 'Missing layerName' });
                return;
            }
            govmap.getLayerEntities({ layerName, token: GOVMAP_TOKEN }).then((response) => {
                logEvent('getLayerEntities', response);
            });
        });
    }
}

function setupUserLayerSavePanel() {
    const btnGetAddEntitiesSample = document.getElementById('btnGetAddEntitiesSample');
    const btnSaveLayerNew = document.getElementById('btnSaveLayerNew');
    const btnSaveLayerUpdate = document.getElementById('btnSaveLayerUpdate');
    const btnSaveLayerDelete = document.getElementById('btnSaveLayerDelete');

    if (btnGetAddEntitiesSample) {
        btnGetAddEntitiesSample.addEventListener('click', () => {
            const layerName = document.getElementById('addEntitiesSampleLayerName').value.trim();
            if (!layerName) {
                logEvent('getAddEntitiesSample error', { message: 'Missing layerName' });
                return;
            }
            govmap.getAddEntitiesSample({ layerName, token: GOVMAP_TOKEN }).then((response) => {
                logEvent('getAddEntitiesSample', response);
            });
        });
    }

    if (btnSaveLayerNew) {
        btnSaveLayerNew.addEventListener('click', () => {
            const layerName = document.getElementById('saveLayerName').value.trim();
            if (!layerName) {
                logEvent('saveLayerEntities error', { message: 'Missing layerName' });
                return;
            }
            const data = {
                action: govmap.saveAction.New,
                layerName: layerName,
                token: GOVMAP_TOKEN,
                entities: [
                    {
                        fields: {
                            Field2Value: '12',
                            Field3Value: '1697',
                            Field4Value: '1699',
                            Field5Value: 'link',
                            Field6Value: 'linklink',
                            Field8Value: 'abcd',
                            Field1Value: '25/06/2017',
                            SHAPE: 'POINT(196062.48 621458.39)'
                        }
                    },
                    {
                        fields: {
                            Field2Value: '1',
                            Field3Value: '1696',
                            Field4Value: '1699',
                            Field5Value: 'link',
                            Field6Value: 'linklink',
                            Field8Value: 'abcd',
                            Field1Value: '25/06/2017',
                            SHAPE: 'POINT(196062.48 600000.39)'
                        }
                    }
                ]
            };
            govmap.saveLayerEntities(data).then((result) => {
                logEvent('saveLayerEntities (New)', result);
            });
        });
    }

    if (btnSaveLayerUpdate) {
        btnSaveLayerUpdate.addEventListener('click', () => {
            const layerName = document.getElementById('saveLayerName').value.trim();
            const entityID = document.getElementById('saveUpdateEntityId').value.trim();
            const fieldName = document.getElementById('saveUpdateField').value.trim();
            const fieldValue = document.getElementById('saveUpdateValue').value;
            if (!layerName || !entityID || !fieldName) {
                logEvent('saveLayerEntities error', { message: 'Missing layerName, entityID or field' });
                return;
            }
            const data = {
                action: govmap.saveAction.Update,
                layerName: layerName,
                token: GOVMAP_TOKEN,
                entities: [{
                    entityID: entityID,
                    fields: {
                        [fieldName]: fieldValue
                    }
                }]
            };
            govmap.saveLayerEntities(data).then((result) => {
                logEvent('saveLayerEntities (Update)', result);
            });
        });
    }

    if (btnSaveLayerDelete) {
        btnSaveLayerDelete.addEventListener('click', () => {
            const layerName = document.getElementById('saveLayerName').value.trim();
            const idsStr = document.getElementById('saveDeleteEntityIds').value.trim();
            const entityIds = idsStr ? idsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            if (!layerName || entityIds.length === 0) {
                logEvent('saveLayerEntities error', { message: 'Missing layerName or entityIDs' });
                return;
            }
            const data = {
                action: govmap.saveAction.Delete,
                layerName: layerName,
                token: GOVMAP_TOKEN,
                entities: entityIds.map((id) => ({ entityID: id }))
            };
            govmap.saveLayerEntities(data).then((result) => {
                logEvent('saveLayerEntities (Delete)', result);
            });
        });
    }
}

function setupIdentifyPanel() {
    const btnIdentifyByXY = document.getElementById('btnIdentifyByXY');
    const btnIdentifyByXYAndLayer = document.getElementById('btnIdentifyByXYAndLayer');
    const btnIntersectFeatures = document.getElementById('btnIntersectFeatures');
    const btnSearchAndLocate = document.getElementById('btnSearchAndLocate');
    const locateType = document.getElementById('locateType');
    const locateAddressWrap = document.getElementById('locateAddressWrap');
    const locateLotParcelWrap = document.getElementById('locateLotParcelWrap');

    if (locateType && locateAddressWrap && locateLotParcelWrap) {
        const toggleLocateInputs = () => {
            const isAddress = locateType.value === 'lotParcelToAddress';
            locateAddressWrap.classList.toggle('hidden', !isAddress);
            locateLotParcelWrap.classList.toggle('hidden', isAddress);
        };
        locateType.addEventListener('change', toggleLocateInputs);
        toggleLocateInputs();
    }

    if (btnIdentifyByXY) {
        btnIdentifyByXY.addEventListener('click', () => {
            const x = Number(document.getElementById('identifyX').value);
            const y = Number(document.getElementById('identifyY').value);
            govmap.identifyByXY(x, y).then((response) => {
                logEvent('identifyByXY', response);
            });
        });
    }

    if (btnIdentifyByXYAndLayer) {
        btnIdentifyByXYAndLayer.addEventListener('click', () => {
            const x = Number(document.getElementById('identifyLayerX').value);
            const y = Number(document.getElementById('identifyLayerY').value);
            const layersStr = document.getElementById('identifyLayers').value.trim();
            const layers = layersStr ? layersStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            govmap.identifyByXYAndLayer(x, y, layers).then((response) => {
                logEvent('identifyByXYAndLayer', response);
            });
        });
    }

    if (btnIntersectFeatures) {
        btnIntersectFeatures.addEventListener('click', () => {
            const address = document.getElementById('intersectAddress').value.trim();
            const layerName = document.getElementById('intersectLayerName').value.trim();
            const fieldsStr = document.getElementById('intersectFields').value.trim();
            const fields = fieldsStr ? fieldsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            const whereClause = document.getElementById('intersectWhere').value.trim();
            const radius = Number(document.getElementById('intersectRadius').value);
            const getShapes = document.getElementById('intersectGetShapes').checked;
            const params = { address, layerName, fields, getShapes, radius };

            if (whereClause) {
                params.whereClause = whereClause;
            }
            govmap.intersectFeatures(params).then((response) => {
                logEvent('intersectFeatures', response);
            });
        });
    }

    if (btnSearchAndLocate) {
        btnSearchAndLocate.addEventListener('click', () => {
            if (typeof govmap === 'undefined' || typeof govmap.searchAndLocate !== 'function') {
                logEvent('searchAndLocate error', { message: 'govmap.searchAndLocate is not available' });
                return;
            }

            if (!govmap.locateType) {
                logEvent('searchAndLocate error', { message: 'govmap.locateType is not available' });
                return;
            }

            const typeValue = document.getElementById('locateType').value;
            const typeEnum = typeValue === 'lotParcelToAddress'
                ? govmap.locateType.lotParcelToAddress
                : typeValue === 'addressToLotParcel'
                    ? govmap.locateType.addressToLotParcel
                    : null;

            if (typeEnum == null) {
                logEvent('searchAndLocate error', { message: 'Unknown locateType: ' + typeValue });
                return;
            }

            const params = { type: typeEnum };

            if (typeValue === 'lotParcelToAddress') {
                params.address = document.getElementById('locateAddress').value.trim();
            } else {
                params.lot = Number(document.getElementById('locateLot').value);
                params.parcel = Number(document.getElementById('locateParcel').value);
            }

            govmap.searchAndLocate(params).then((response) => {
                logEvent('searchAndLocate', response);
            });
        });
    }
}

function setupBackgroundToolsPanel() {
    const btnSetBackground = document.getElementById('btnSetBackground');
    const btnSetLayerOpacity = document.getElementById('btnSetLayerOpacity');
    const btnSetMapCursor = document.getElementById('btnSetMapCursor');
    const btnSetDefaultTool = document.getElementById('btnSetDefaultTool');
    const btnShowPrint = document.getElementById('btnShowPrint');
    const btnClosePrint = document.getElementById('btnClosePrint');
    const btnShowExportMap = document.getElementById('btnShowExportMap');
    const btnCloseExportMap = document.getElementById('btnCloseExportMap');
    const btnShowMeasure = document.getElementById('btnShowMeasure');
    const btnCloseMeasure = document.getElementById('btnCloseMeasure');
    const btnCloseOpenApps = document.getElementById('btnCloseOpenApps');

    if (btnSetBackground) {
        btnSetBackground.addEventListener('click', () => {
            const id = Number(document.getElementById('backgroundId').value);
            govmap.setBackground(id);
            logEvent('setBackground', { backroundTypeID: id });
        });
    }

    if (btnSetLayerOpacity) {
        btnSetLayerOpacity.addEventListener('click', () => {
            const layerName = document.getElementById('opacityLayerName').value.trim();
            const opacity = Number(document.getElementById('opacityValue').value);
            govmap.setLayerOpacity({ layerName, opacity });
            logEvent('setLayerOpacity', { layerName, opacity });
        });
    }

    if (btnSetMapCursor) {
        btnSetMapCursor.addEventListener('click', () => {
            const key = document.getElementById('cursorType').value;
            const cursorEnum = govmap.cursorType && govmap.cursorType[key];
            if (!cursorEnum) {
                logEvent('setMapCursor error', { message: 'Unknown cursor: ' + key });
                return;
            }
            govmap.setMapCursor(cursorEnum);
            logEvent('setMapCursor', { cursorType: key });
        });
    }

    if (btnSetDefaultTool) {
        btnSetDefaultTool.addEventListener('click', () => {
            govmap.setDefaultTool();
            logEvent('setDefaultTool', { called: true });
        });
    }

    if (btnShowPrint) {
        btnShowPrint.addEventListener('click', () => {
            govmap.showPrint();
            logEvent('showPrint', { called: true });
        });
    }
    if (btnClosePrint) {
        btnClosePrint.addEventListener('click', () => {
            govmap.closePrint();
            logEvent('closePrint', { called: true });
        });
    }

    if (btnShowExportMap) {
        btnShowExportMap.addEventListener('click', () => {
            govmap.showExportMap();
            logEvent('showExportMap', { called: true });
        });
    }
    if (btnCloseExportMap) {
        btnCloseExportMap.addEventListener('click', () => {
            govmap.closeExportMap();
            logEvent('closeExportMap', { called: true });
        });
    }

    if (btnShowMeasure) {
        btnShowMeasure.addEventListener('click', () => {
            govmap.showMeasure();
            logEvent('showMeasure', { called: true });
        });
    }
    if (btnCloseMeasure) {
        btnCloseMeasure.addEventListener('click', () => {
            govmap.closeMeasure();
            logEvent('closeMeasure', { called: true });
        });
    }

    if (btnCloseOpenApps) {
        btnCloseOpenApps.addEventListener('click', () => {
            govmap.closeOpenApps();
            logEvent('closeOpenApps', { called: true });
        });
    }
}

function setupGpsPanel() {
    const btnGetGPSLocation = document.getElementById('btnGetGPSLocation');
    const btnGpsOn = document.getElementById('btnGpsOn');
    const btnGpsOff = document.getElementById('btnGpsOff');
    const btnSetGpsMarker = document.getElementById('btnSetGpsMarker');
    const btnRemoveGpsMarker = document.getElementById('btnRemoveGpsMarker');

    if (btnGetGPSLocation) {
        btnGetGPSLocation.addEventListener('click', () => {
            govmap.getGPSLocation().then((response) => {
                logEvent('getGPSLocation', response);
            });
        });
    }

    if (btnGpsOn) {
        btnGpsOn.addEventListener('click', () => {
            govmap.gpsOn();
            logEvent('gpsOn', { called: true });
        });
    }

    if (btnGpsOff) {
        btnGpsOff.addEventListener('click', () => {
            govmap.gpsOff();
            logEvent('gpsOff', { called: true });
        });
    }

    if (btnSetGpsMarker) {
        btnSetGpsMarker.addEventListener('click', () => {
            const x = Number(document.getElementById('gpsMarkerX').value);
            const y = Number(document.getElementById('gpsMarkerY').value);
            const accuracy = Number(document.getElementById('gpsMarkerAccuracy').value);
            govmap.setGpsMarker({ x, y, accuracy });
            logEvent('setGpsMarker', { x, y, accuracy });
        });
    }

    if (btnRemoveGpsMarker) {
        btnRemoveGpsMarker.addEventListener('click', () => {
            govmap.removeGPSMarker();
            logEvent('removeGPSMarker', { called: true });
        });
    }
}

function setupDrawAndGeometryPanel() {
    const btnDraw = document.getElementById('btnDraw');
    const btnEditDrawing = document.getElementById('btnEditDrawing');
    const btnZoomToDrawing = document.getElementById('btnZoomToDrawing');
    const btnClearDrawings = document.getElementById('btnClearDrawings');
    const btnDisplayPoints = document.getElementById('btnDisplayPoints');
    const btnDisplayCircle = document.getElementById('btnDisplayCircle');
    const btnDisplayPolygon = document.getElementById('btnDisplayPolygon');
    const btnDisplayPolyline = document.getElementById('btnDisplayPolyline');
    const btnClearGeometriesByName = document.getElementById('btnClearGeometriesByName');
    const btnClearGeometriesById = document.getElementById('btnClearGeometriesById');
    const btnZoomToXY = document.getElementById('btnZoomToXY');
    const btnSetMapMarker = document.getElementById('btnSetMapMarker');
    const btnClearMapMarker = document.getElementById('btnClearMapMarker');

    if (btnDraw) {
        btnDraw.addEventListener('click', () => {
            const key = document.getElementById('drawType').value;
            const drawEnum = getDrawTypeEnum(key);
            if (drawEnum == null) {
                logEvent('draw error', { message: 'Unknown drawType: ' + key });
                return;
            }
            govmap.draw(drawEnum).progress((response) => {
                logEvent('draw', response);
            });
            logEvent('draw started', { drawType: key });
        });
    }

    if (btnEditDrawing) {
        btnEditDrawing.addEventListener('click', () => {
            govmap.editDrawing().progress((response) => {
                logEvent('editDrawing', response);
            });
        });
    }

    if (btnZoomToDrawing) {
        btnZoomToDrawing.addEventListener('click', () => {
            govmap.zoomToDrawing();
            logEvent('zoomToDrawing', { called: true });
        });
    }

    if (btnClearDrawings) {
        btnClearDrawings.addEventListener('click', () => {
            govmap.clearDrawings();
            logEvent('clearDrawings', { called: true });
        });
    }

    if (btnDisplayPoints) {
        btnDisplayPoints.addEventListener('click', () => {
            const geometryData = {
                headers: ['חדשות', 'כלכלה', 'בארץ'],
                bubbles: ['categories/1', 'categories/78', 'categories/132'],
                bubbleUrl: 'https://www.0404.co.il/'
            };

            if (document.getElementById('displayPointsIncludeTooltips').checked) {
                geometryData.tooltips = [tooltip1, '0404 כלכלה', '0404 בארץ'];
            }

            if (document.getElementById('displayPointsIncludeLabels').checked) {
                geometryData.labels = ['p1', 'p2', 'p3'];
            }

            const data = {
                wkts: ['POINT(179714.32 663772.17)', 'POINT(179621.05 663704.57)', 'POINT(179376.26 663907.7)'],
                names: ['p1', 'p2', 'p3'],
                geometryType: govmap.geometryType.POINT,
                defaultSymbol: {
                    fillColor: [0, 255, 0, 0.5], // green
                    outlineColor: [0, 0, 255, 1], // blue
                    outlineWidth: 1,
                    width: 15,
                    height: 15
                },
                symbols: [
                    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/%D0%91%D0%BE%D1%80%D1%89.JPG/250px-%D0%91%D0%BE%D1%80%D1%89.JPG', width: 15, height: 15 },
                    { url: 'https://upload.wikimedia.org/wikipedia/he/a/a3/Mapai.png', width: 35, height: 35 },
                ],
                clearExisting: true,
                data: geometryData
            };
            govmap.displayGeometries(data).then((response) => {
                logEvent('displayGeometries (3 points)', response);
            });
        });
    }

    if (btnDisplayCircle) {
        btnDisplayCircle.addEventListener('click', () => {
            const geometryData = {
                headers: ['פלאפל'],
                bubbles: [''],
                bubbleUrl: 'https://he.wikipedia.org/wiki/%D7%A4%D7%9C%D7%90%D7%A4%D7%9C'
            };

            if (document.getElementById('displayCircleIncludeTooltips').checked) {
                geometryData.tooltips = [tooltip1];
            }

            if (document.getElementById('displayCircleIncludeLabels').checked) {
                geometryData.labels = ['פלאפל'];
            }

            const data = {
                circleGeometries: [{ x: 179290, y: 664338, radius: 250 }],
                names: ['p1'],
                geometryType: govmap.geometryType.CIRCLE,
                defaultSymbol: {
                    outlineColor: [0, 0, 255, 1],
                    outlineWidth: 1,
                    fillColor: [0, 255, 0, 0.5]
                },
                symbols: [],
                clearExisting: true,
                data: geometryData
            };
            govmap.displayGeometries(data).then((response) => {
                logEvent('displayGeometries (circle)', response);
            });
        });
    }

    if (btnDisplayPolygon) {
        btnDisplayPolygon.addEventListener('click', () => {
            const bubbleContent = "<div style='border: 1px solid #525252; margin: 10px;padding: 10px;'><div style='background-color: yellow;'>{0}</div><div style='background-color: blue;'>{1}</div></div>";
            const geometryData = {
                headers: ['מצולע 1 כותרת', 'מצולע 2 כותרת'],
                bubbleHTML: bubbleContent,
                bubbleHTMLParameters: [['מצולע 1', 'מידע נוסף...'], ['מצולע 2', 'מידע נוסף...']],
                fontLabel: [{
                    font: 'Arial',
                    fontSize: 40,
                    fill: 'yellow',
                    stroke: 'blue'
                }]
            };

            if (document.getElementById('displayPolygonIncludeTooltips').checked) {
                geometryData.tooltips = [tooltip1, 'רֶמֶז צָץ מצולע 2'];
            }

            if (document.getElementById('displayPolygonIncludeLabels').checked) {
                geometryData.labels = ['label1', 'label2'];
            }

            const data = {
                wkts: [
                    'POLYGON((179423.65 664011.49, 179382.8 663928.97, 179427.27 663901.58, 179527.55 663897.15, 179423.65 664011.49))',
                    'POLYGON((179300.38 664094.64, 179249.12 663941.6, 179212.74 663963.92, 179239.6 664094.88, 179300.38 664094.64))'
                ],
                names: ['p1', 'p2'],
                geometryType: govmap.geometryType.POLYGON,
                defaultSymbol: {
                    outlineColor: [0, 80, 255, 1],
                    outlineWidth: 1,
                    fillColor: [138, 43, 226, 0.5]
                },
                symbols: [],
                clearExisting: true,
                data: geometryData
            };
            govmap.displayGeometries(data).then((response) => {
                logEvent('displayGeometries (polygon)', response);
            });
        });
    }

    if (btnDisplayPolyline) {
        btnDisplayPolyline.addEventListener('click', () => {
            const geometryData = {
                headers: ['שווארמה'],
                bubbles: ['%D7%A9%D7%95%D7%95%D7%90%D7%A8%D7%9E%D7%94'],
                bubbleUrl: 'https://he.wikipedia.org/wiki/'
            };

            if (document.getElementById('displayPolylineIncludeTooltips').checked) {
                geometryData.tooltips = [tooltip1];
            }

            if (document.getElementById('displayPolylineIncludeLabels').checked) {
                geometryData.labels = ['שווארמה'];
            }

            const data = {
                wkts: ['LINESTRING(179458.3 664063.78, 179366.41 663882.66, 179222.48 663865.08, 179228.26 663790.45)'],
                names: ['p1'],
                geometryType: govmap.geometryType.POLYLINE,
                defaultSymbol: {
                    color: [255, 0, 80, 1],
                    width: 10
                },
                symbols: [],
                clearExisting: true,
                data: geometryData
            };
            govmap.displayGeometries(data).then((response) => {
                logEvent('displayGeometries (polyline)', response);
            });
        });
    }

    if (btnClearGeometriesByName) {
        btnClearGeometriesByName.addEventListener('click', () => {
            const namesStr = document.getElementById('clearNames').value.trim();
            const names = namesStr ? namesStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
            govmap.clearGeometriesByName(names);
            logEvent('clearGeometriesByName', { names });
        });
    }

    if (btnClearGeometriesById) {
        btnClearGeometriesById.addEventListener('click', () => {
            const idsStr = document.getElementById('clearIds').value.trim();
            const ids = idsStr ? idsStr.split(',').map((s) => {
                const t = s.trim();
                if (!t) return null;
                const num = parseInt(t, 10);
                return (!isNaN(num) && String(num) === t) ? num : t;
            }).filter((x) => x != null) : [];
            govmap.clearGeometriesById(ids);
            logEvent('clearGeometriesById', { ids });
        });
    }

    if (btnZoomToXY) {
        btnZoomToXY.addEventListener('click', () => {
            const x = Number(document.getElementById('zoomToX').value);
            const y = Number(document.getElementById('zoomToY').value);
            const level = Number(document.getElementById('zoomToLevel').value);
            const marker = document.getElementById('zoomToMarker').checked;
            govmap.zoomToXY({ x, y, level, marker });
            logEvent('zoomToXY', { x, y, level, marker });
        });
    }

    if (btnSetMapMarker) {
        btnSetMapMarker.addEventListener('click', () => {
            const x = Number(document.getElementById('markerX').value);
            const y = Number(document.getElementById('markerY').value);
            govmap.setMapMarker({ x, y });
            logEvent('setMapMarker', { x, y });
        });
    }

    if (btnClearMapMarker) {
        btnClearMapMarker.addEventListener('click', () => {
            govmap.clearMapMarker();
            logEvent('clearMapMarker', { called: true });
        });
    }
}

function getDrawTypeEnum(key) {
    if (!govmap.drawType) {
        return null;
    }
    switch (key) {
        case 'Point': return govmap.drawType.Point;
        case 'Polyline': return govmap.drawType.Polyline;
        case 'Polygon': return govmap.drawType.Polygon;
        case 'Circle': return govmap.drawType.Circle;
        case 'Rectangle': return govmap.drawType.Rectangle;
        case 'FreehandPolygon': return govmap.drawType.FreehandPolygon;
        default: return null;
    }
}

function getEventEnum(eventKey) {
    if (!govmap.events || !govmap.events[eventKey]) {
        return null;
    }

    return govmap.events[eventKey];
}

function registerMapEvent(eventKey) {
    const eventEnum = getEventEnum(eventKey);

    if (!eventEnum) {
        logEvent('error', { message: 'Unknown event: ' + eventKey });
        return;
    }

    govmap.onEvent(eventEnum).progress((e) => {
        logEvent(eventKey, e);
    });

    logEvent('registered', { event: eventKey });
}

function unbindMapEvent(eventKey) {
    const eventEnum = getEventEnum(eventKey);

    if (!eventEnum) {
        logEvent('error', { message: 'Unknown event: ' + eventKey });
        return;
    }

    govmap.unbindEvent(eventEnum);
    logEvent('unbound', { event: eventKey });
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