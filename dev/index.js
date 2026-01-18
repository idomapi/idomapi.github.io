const map1 = 'map';
const map2 = 'map2';

function initGovMap() {
    govmap.createMap(map1, {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["layer_153830", 'ra_gvulot_rm'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {
            listener(map1);
        }
    });
    govmap.createMap(map2, {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ['23','152617'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {
            listener(map2);
        }
    });
}

function listener(map) {
    govmap.onEvent(govmap.events.CLICK, map).progress(e => console.log(map, 'listener - CLICK', e));
}