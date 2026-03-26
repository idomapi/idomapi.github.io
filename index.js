function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ['statistic_areas_2011'],
        visibleLayers: ['statistic_areas_2011'],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        center: { x: 190063, y: 673099 },
        level: 9,
        onLoad: function () {
            // getLayerData();
        },
    });
}

function searchInLayer(values) {
    var params = {
        layerName: '143',
        fieldName: 'lotidint',
        fieldValues: values,
        highlight: true,
        showBubble: false,
        outLineColor: [100, 0, 0, 50],
        fillColor: [200, 0, 0, 0.7]
    };

    govmap.searchInLayer(params);
}

function changeBackground() {
    govmap.setBackground(40);
}

function selectFeaturesOnMap() {
    var params = {
        continous: false,
        // drawType: govmap.drawType.Point,
        // wkt: 'POINT(197615.95 628616.18)',
        wkt: 'POINT(199390 624673)',
        radius: 100,
        filterLayer: false,
        isZoomToExtent: false,
        layers: ['statistic_areas_2011'],
        returnFields: {
            'statistic_areas_2011': ['objectid']
        },
        selectOnMap: true,
    }
    govmap.selectFeaturesOnMap(params).then(function (response) {
        console.log(response);
    });
}

function getLayerData() {
    const startedAtMs = Date.now();
    const params = {
        LayerName: 'school',
        Point: { x: 190063, y: 673099 },
        Radius: 105
    };

    govmap.getLayerData(params).then(function (response) {

        if (response.data.length === 0) return;

        getEntityIds(response.data, startedAtMs);
    });
}

function getEntityIds(entities, startedAtMs) {
    const params = {
        geometry: 'POINT(190063 673099)',
        layerName: 'school',
        fields: ['shem_misgeret'],
        radius: 105
    };

    govmap.intersectFeatures(params).then(function (response) {

        if (response.data.length === 0) return;

        addObjectIdToEntities(entities, response.data, startedAtMs);
    });
}

function addObjectIdToEntities(entities, entitiesWithObjectId, startedAtMs) {
    const definition = { caption: 'שם מוסד', field: 'shem_misgeret' };
    entities.forEach((entity) => {
        const field = entity.Fields.find((field) => field.FieldName === definition.caption);

        if (field) {
            entity.objectId = entitiesWithObjectId.find((e) => e.Values[0] === field.Value).ObjectId;
        }
    });

    const elapsedMs = Date.now() - startedAtMs;
    const elapsedSeconds = elapsedMs / 1000;

    console.log('END', entities);
    console.log(`getLayerData: ${elapsedSeconds.toFixed(3)}s (${elapsedMs}ms)`);
}