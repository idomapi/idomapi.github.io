const maps = ['map1', 'map2', 'map3', 'map4'];
const centers = [
    { x: 195123, y: 714229 },
    { x: 205362, y: 712448 },
    { x: 201462, y: 693344 },
    { x: 193897, y: 685822 }
];

function initGovMap() {
    govmap.createMap('map1', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["layer_153830", 'ra_gvulot_rm'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: centers[0],
        level: 9,
        onLoad: function () {
        }
    });
    govmap.createMap('map2', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["bus_stops"],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: centers[1],
        level: 9,
        onLoad: function () {
        }
    });
    govmap.createMap('map3', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["PARCEL_HOKS"],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: centers[2],
        level: 9,
        onLoad: function () {
        }
    });
    govmap.createMap('map4', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["GASSTATIONS"],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: centers[3],
        level: 9,
        onLoad: function () {
        }
    });
}

function onClickBinding() {
    govmap.onEvent(govmap.events.CLICK, "map1").progress(e => console.log("click event map1"));
    govmap.onEvent(govmap.events.CLICK, "map2").progress(e => console.log("click event map2"));
    govmap.onEvent(govmap.events.CLICK, "map3").progress(e => console.log("click event map3"));
    govmap.onEvent(govmap.events.CLICK, "map4").progress(e => console.log("click event map4"));
}

function unBindClick(map) {
    govmap.unbindEvent(govmap.events.CLICK, map);
}