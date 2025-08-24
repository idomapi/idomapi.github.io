function initGovMap() {
    govmap.createMap('map', {
        onLoad: function (e) {
            populateDropdownAndCityList();
            populateDropdown();
        },
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        layers: ["GASSTATIONS", "SUB_GUSH_ALL", 'bus_stops'],
        visibleLayers: [],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {
        }
    });
}

