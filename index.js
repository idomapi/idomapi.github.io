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
        center: { x: 163868, y: 578293 }, // { x: 179487, y: 663941 },
        level: 4,
        onLoad: function () {},
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
        fillColor: [200, 0, 0, 150]
    };

    govmap.searchInLayer(params);
}

changeBackground() {
    govmap.setBackground(40);
}