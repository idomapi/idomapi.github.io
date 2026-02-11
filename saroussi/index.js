function initGovMap() {
    createMap();
}

function createMap() {
    govmap.createMap('map', {
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        background: "1",
        layersMode: 1,
        zoomButtons: false,
    });
}

function displayGeometriesPolygon() {
    var data = {
        wkts: ["POLYGON((151612.40 534674.88, 215112.52 538643.64, 98431.04 445774.70, 74618.49 521974.85, 80968.50 552931.17, 151612.40 533881.13,151612.40 534674.88))"],
        names: ['p1'],
        geometryType: govmap.geometryType.POLYGON,
        defaultSymbol:
        {
            outlineColor: [0, 80, 255, 1],
            outlineWidth: 1,
            fillColor: [138, 43, 226, 0.5]
        },
        symbols: [],
        clearExisting: false,
        data: {
            tooltips: ['רֶמֶז צָץ מצולע 1'],
            labels: ['label1'],
            fontLabel: [{
                font: 'Arial',
                fontSize: 40,
                fill: 'yellow',
                stroke: 'blue',
            }],
            headers: ['מצולע'],
            bubbles: ['מצולע'],
            bubbleUrl: 'https://he.wikipedia.org/wiki/%D7%A9%D7%95%D7%95%D7%90%D7%A8%D7%9E%D7%94'
        }
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });
}

function displayGeometriesPoint() {
    var data = {
        wkts: ["POINT(151612.40 534674.88)"],
        names: ['p2'],
        geometryType: govmap.geometryType.POINT,
        defaultSymbol:
        {
            url: 'https://avatars.githubusercontent.com/u/196661916?v=4&size=64',
            width: 45,
            height: 45
        },
        symbols: [
            { url: 'https://avatars.githubusercontent.com/u/196661916?v=4&size=64', width: 45, height: 45 },
        ],
        clearExisting: false,
        data: {
            tooltips: ['נקודה 2'],
            headers: ['נקודה'],
            bubbles: ['נקודה'],
            bubbleUrl: 'https://he.wikipedia.org/wiki/%D7%A4%D7%9C%D7%90%D7%A4%D7%9C'
        }
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });
}
function displayGeometriesCircle() {
    var data = {
        circleGeometries: [{ x: 151612.40, y: 534674.88, radius: 1500 }],
        names: ['p3'],
        geometryType: govmap.geometryType.CIRCLE,
        defaultSymbol:
        {
            outlineColor: [0, 0, 255, 1],
            outlineWidth: 1,
            fillColor: [0, 255, 0, 0.5]
        },
        symbols: [],
        clearExisting: false,
        data: {
            headers: ['מעגל'],
            bubbles: ['מעגל'],
            bubbleUrl: 'https://he.wikipedia.org/wiki/%D7%A1%D7%91%D7%99%D7%97'
        }
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });
}