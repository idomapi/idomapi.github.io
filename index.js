function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ['statistic_areas_2011'],
        visibleLayers: [],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        center: { x: 179543, y: 664414 },
        level: 7,
        onLoad: function () {
            // getLayerData();
        },
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
    var data = {
        // circleGeometries: [{ x: 179290, y: 664338, radius: 500 }, {x: 179588, y: 665177, radius: 500}],
        wkts: ['POINT(179290 664338)', 'POINT(179588 665177)'],
        names: ['p1'],
        geometryType: govmap.geometryType.CIRCLE,
        defaultSymbol:
        {
            outlineColor: [0, 0, 255, 1],
            outlineWidth: 1,
            fillColor: [0, 255, 0, 0.5]
        },
        symbols: [],
        clearExisting: true,
        data: {
            tooltips: ['סודות מאכל הפלאפל הלאומי','bazinga'],
            headers: ['פלאפל','bazinga1'],
            // labels: ['lbael','lbael2'],
            bubbles: ['',''],
            bubbleUrl: 'https://he.wikipedia.org/wiki/%D7%A4%D7%9C%D7%90%D7%A4%D7%9C'
        }
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });
}