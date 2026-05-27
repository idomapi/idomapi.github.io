function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ['230860', '230859'],
        visibleLayers: ['230860', '230859', 'layer_234077'],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        center: { x: 159530, y: 620516 },
        level: 7,
        onLoad: function () {
            // getLayerData();
        },
    });
}

async function searchInLayer() {
    const rikuzim = {
        layerName: 'layer_230860',
        fieldName: 'kalpi',
        fieldValues: ['115', '43'],
    }
    govmap.searchInLayer({
        layerName: rikuzim.layerName,
        fieldName: rikuzim.fieldName,
        fieldValues: rikuzim.fieldValues,
        highlight: true,
        fillColor: [255, 0, 0, 0.5],
        outLineColor: [0, 255, 0, 1]
    });

    const ashkelon = {
        layerName: 'layer_234077',
        fieldName: 'value0',
        fieldValues: ['1', '3'],
    }
    govmap.searchInLayer({
        layerName: ashkelon.layerName,
        fieldName: ashkelon.fieldName,
        fieldValues: ashkelon.fieldValues,
        highlight: true,
        fillColor: [255, 0, 0, 0.5],
        outLineColor: [128, 0, 128, 1]
   
    });

    const kalpi = {
        layerName: 'layer_230859',
        fieldName: 'kalpi',
        fieldValues: ['206', '97'],
    }

    govmap.searchInLayer({
        layerName: kalpi.layerName,
        fieldName: kalpi.fieldName,
        fieldValues: kalpi.fieldValues,
        highlight: true,
        fillColor: [255, 0, 0, 0.5],
        outLineColor: [128, 0, 128, 1]
    });
}

function selectFeaturesOnMap() {
    const params = {
        continous: false,
        // drawType: govmap.drawType.Point,
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
function displayGeometries() {
    // Peer had: command/params/geometries wrapper, geometryType: "circle",
    // and defaultSymbol { color, outline: { color, width } } — all wrong for this API.
    var data = {
        circleGeometries: [{ x: 180904, y: 664928, radius: 10000 }],
        names: ['search_area'],
        geometryType: govmap.geometryType.CIRCLE,
        defaultSymbol: {
            fillColor: [0, 120, 255, 30 / 255],
            outlineColor: [0, 120, 255, 180 / 255],
            outlineWidth: 2
        },
        clearExisting: true,
        showBubble: false,
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });

    // Previous POINT demo (correct shape, different geometry):
    // var data = {
    //     wkts: ['POINT(179290 664338)', 'POINT(179588 665177)'],
    //     names: ['p1'],
    //     geometryType: govmap.geometryType.POINT,
    //     defaultSymbol: {
    //         outlineColor: [0, 0, 255, 1],
    //         outlineWidth: 1,
    //         fillColor: [0, 255, 0, 0.5]
    //     },
    //     symbols: [],
    //     clearExisting: true,
    //     showBubble: false,
    //     data: {},
    // };
}

function intersectFeatures() {
    var params = {
        geometry: "POLYGON((178913.45 662158.23, 183817.6 662139.91, 183831.7 666172.6, 178929.49 666190.93, 178913.45 662158.23))",
        layerName: "GASSTATIONS",
        fields: ['value1', 'value2', 'value3'],
        whereClause: "(value1 LIKE %ד%) AND (value2 LIKE %אבי%)"
    };
    govmap.intersectFeatures(params).then(function (response) {
        console.log(response);
    });
}