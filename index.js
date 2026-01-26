function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ['PARCEL_ALL', 'GASSTATIONS', '210126', '218193', '211923', '143'],
        visibleLayers: [],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 4,
        onLoad: function () {},
    });
}