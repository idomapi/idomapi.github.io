function initGovMap() {
    govmap.createMap('map', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ["GASSTATIONS", "SUB_GUSH_ALL", 'bus_stops', '154006'],
        visibleLayers: ['PARCEL_ALL'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {
            displayGeometries();
        }
    });
}

function displayGeometries() {
    var bubbleContent = "<div style='border: 1px solid #525252; margin: 10px;padding: 10px;'><div style='background-color: yellow;'>{0}</div><div               style='background-color: blue;'>{1}</div></div>";
    var data = {
        wkts: ["POLYGON((151612.40 534674.88, 215112.52 538643.64, 98431.04 445774.70, 74618.49 521974.85, 80968.50 552931.17, 151612.40 533881.13,151612.40 534674.88))",
            "POLYGON((196062.48 621458.39, 196591.65 622516.72, 197649.99 659293.88, 229929.22 665379.31, 243423.00 632306.33, 196062.48 621458.39))"],
        names: ['p1', 'p2'],
        geometryType: govmap.geometryType.POLYGON,
        defaultSymbol:
        {
            outlineColor: [0, 80, 255, 1],
            outlineWidth: 1,
            fillColor: [138, 43, 226, 0.5]
        },
        symbols: [],
        clearExisting: true,
        data: {
            tooltips: ['רֶמֶז צָץ מצולע 1', 'רֶמֶז צָץ מצולע 2'],
            headers: ['מצולע 1 כותרת', 'מצולע 2 כותרת'],
            bubbleHTML: bubbleContent,
            bubbleHTMLParameters: [['מצולע 1', 'מידע נוסף...'], ['מצולע 2', 'מידע נוסף...']],
            labels: ['label1', 'label2'],
            fontLabel: {
                font: 'Arial',
                fontSize: 40,
                fill: 'yellow',
                stroke: 'blue',
            },
        }
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });
}