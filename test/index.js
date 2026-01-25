const maps = ['map1', 'map2', 'map3', 'map4'];
let mapIndex = 0;

function initGovMap() {
    createMap(maps[mapIndex]);
}

function createMap(map) {
    govmap.createMap(map, {
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        layers: ["GASSTATIONS", "SUB_GUSH_ALL", "PARCEL_ALL", "202845"],
        visibleLayers: ['202845'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {
            console.log(`Map ${map} loaded`);
            mapIndex++;

            if (mapIndex < maps.length) {
                createMap(maps[mapIndex]);
            }
        },
        // onClick: function (e) {
        //     console.log("click event in map", map);
        // }
    });
}

function bindEvent(map) {
    govmap.onEvent(govmap.events.CLICK, map).progress(e => console.log("click event in map", map));
}

function unBindEvent(map) {
    govmap.unbindEvent(govmap.events.CLICK, map);
}