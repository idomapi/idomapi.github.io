function initGovMap() {
    govmap.createMap('map', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["GASSTATIONS", "SUB_GUSH_ALL", 'bus_stops', 'ra_gvulot_rm'],
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