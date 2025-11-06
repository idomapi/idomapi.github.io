function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ['PARCEL_ALL', 'GASSTATIONS', '210126', '218193', '211923'],
        visibleLayers: [],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        center: { x: 191919, y: 666569 },
        extent: {
            xmax: 199530,
            xmin: 185395,
            ymax: 670534,
            ymin: 662376
        },
        level: 8,
        onLoad: function () {},
    });
}