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
        center: { x: 179487, y: 663941 },
        level: 4,
        onLoad: function () {
            searchAndLocateWrapperFn();
        },
    });
}

function searchAndLocateWrapperFn() {
    var params = {
        type: govmap.locateType.lotParcelToAddress,
        address: 'הירקון 99 תל אביב יפו',
    }
    govmap.searchAndLocate(params).then(function (response) {
        console.log('searchAndLocate', response);
    });
}