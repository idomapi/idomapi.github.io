const maps = ['map1', 'map2', 'map3', 'map4'];
const centers = [
    { x: 195123, y: 714229 },
    { x: 205362, y: 712448 },
    { x: 201462, y: 693344 },
    { x: 193897, y: 685822 }
];

async function initGovMap() {
    let canProcceed = false;

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
            canProcceed = !canProcceed;
        }
    });
    return;

    while (!canProcceed) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    canProcceed = !canProcceed;

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
            canProcceed = !canProcceed;
        }
    });

    while (!canProcceed) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    canProcceed = !canProcceed;

    govmap.createMap('map3', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["PARCEL_ALL"],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: centers[2],
        level: 9,
        onLoad: function () {
            canProcceed = !canProcceed;
        }
    });

    while (!canProcceed) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    canProcceed = !canProcceed;

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
            canProcceed = !canProcceed;
        }
    });
}

function onClickBinding(map) {
        govmap.onEvent(govmap.events.CLICK, map).progress(e => console.log("click event " + map));
}

function unBindClick(map) {
    govmap.unbindEvent(govmap.events.CLICK, map);
}

function bindClickNoId() {
    govmap.onEvent(govmap.events.CLICK).progress(e => console.log("click event no id"));
}

function unBindClickNoId() {
    govmap.unbindEvent(govmap.events.CLICK);
}