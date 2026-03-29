async function initGovMap() {
    govmap.createMap('map', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["statistic_areas_2011"],
        visibleLayers: ["statistic_areas_2011"],
        showXY: true,
        isEmbeddedToggle: false,
        background: 0,
        layersMode: 4,
        center: { x: 179479, y: 663973 },
        level: 10,
    });
}

function selectFeaturesOnMap() {
    const params = {
        continous: false,
        // drawType: govmap.drawType.Point,
        wkt: 'POINT(199390 624673)',
        // radius: 100,
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