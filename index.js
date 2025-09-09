function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ['PARCEL_ALL'],
        visibleLayers: [],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 2,
        onLoad: function () {},
    });
}