const gvulLayer = '162207';
const migrashimLayer = '162206'; 

async function initGovMap() {
    govmap.createMap('map', {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: ['163451'],
        visibleLayers: ['layer_211257'],
        showXY: true,
        isEmbeddedToggle: false,
        background: 0,
        layersMode: 1,
        center: { x: 179479, y: 663973 },
        level: 8,
    });
}

function searchInLayer() {
    var params = {
        layerName: 'layer_160223',
        fieldName: 'value0',
        fieldValues: ['a'],
        highlight: true,
        outLineColor: [255, 0, 0, 1],
        fillColor: [128, 0, 128, 0.5],
    };
    govmap.searchInLayer(params);
}

function selectFeaturesOnMap() {
    const params = {
        continous: false,
        // drawType: govmap.drawType.Point,
        wkt: 'POINT(199390 624673)',
        filterLayer: false,
        isZoomToExtent: false,
        layers: ['statistic_areas_2011'],
        returnFields: {
            'statistic_areas_2011': ['objectid']
        },
        selectOnMap: true,
    }
    govmap.selectFeaturesOnMap(params).then(function (response) {
        console.log(response);
    });
}

function displayGeometries() {
    const bubbleContent = "<div style='border: 1px solid #525252; margin: 10px;padding: 10px;'><div style='background-color: yellow;'>{0}</div><div               style='background-color: blue;'>{1}</div></div>";

    const tooltip1 = `iNet; 11-953-37 : מספר רישוי ואז אוה עדל שלה משה נמר נמר עד מתי כמה הודים כן לא אולי לא יודע אלפרד מה שלומך
Driver's name : GPS

תאריך: 2025-08-17
שעה: \r\n 16:30:51

סטטוס: ACC ;
פועל: מהירות:

65: קילומטראז': 5.97 ק"מ; אות:

19; סוללה: 100% רמת דלק: 0%
`;
    const data = {
        // wkts: ['POLYGON((179375.26 665827.78, 180208.52 665469.71, 179930.5 664825.6, 179475 664399.92, 179375.26 665827.78))', 'POLYGON((179170.9 666660.26, 179663.58 666671.22, 179383.25 666266.11, 178429.3 666005.55, 179170.9 666660.26))'],
        circleGeometries: [{ x: 179290, y: 664338, radius: 500 }, { x: 180276.9, y: 666030.51, radius: 1000 }],
        // wkts: ['POINT(179290 664338)', 'POINT(180309.32 666030.39)'],
        // wkts: ['LINESTRING(179375.26 665827.78, 180208.52 665469.71, 179930.5 664825.6, 179475 664399.92)', 'LINESTRING(180219.7 665483.45, 180253.69 665892.77, 180121.42 666054.48, 180300.15 666176.31, 180452.05 666062.88, 180357.34 665876.26)'],
        names: ['p1', 'p2'],
        geometryType: govmap.geometryType.CIRCLE,
        defaultSymbol:
        {
            // outlineColor: [255, 67, 0, 1], // red
            // outlineWidth: 25,
            // fillColor: [36, 48, 205, 0.58], // blue
            width: 5,
            color: [0, 255, 0, 1], // green
        },
        symbols: [
            {
                // outlineColor: [139, 119, 103, 1], // brown
                // outlineWidth: 25,
                // fillColor: [245, 245, 220, 1], // beige
                width: 45,
                color: [255, 255, 0, 1], // yellow
            },
            // { url: 'https://avatars.githubusercontent.com/u/196661916?v=4&size=64', width: 50, height: 50 },
        ],
        clearExisting: true,
        data: {
            tooltips: [tooltip1, ' כלשהו טקסט נוסף'],
            labels: ['תווית עם מספר מילים', 'bazzzz'],
            headers: ['שווארמה'],
            bubbles: ['%D7%A9%D7%95%D7%95%D7%90%D7%A8%D7%9E%D7%94', 'פלאפל'],
            bubbleUrl: 'https://he.wikipedia.org/wiki/',
            // bubbleHTML: bubbleContent,
            // bubbleHTMLParameters: [['מצולע 1', 'מידע נוסף...'], ['מצולע 2', 'מידע נוסף...']],
        },
    }
    govmap.displayGeometries(data).then(function (response) {
        console.log(response);
    });
}

// function filterLayer() {
//     const ma = 2056235;
//     govmap.filterLayers({ 'layerName': migrashimLayer, 'whereClause': "MISHASAVA =" + ma, 'zoomToExtent': false });
//     govmap.filterLayers({ 'layerName': gvulLayer, 'whereClause': "MISHASAVA =" + ma, 'zoomToExtent': true });
// }

function filterLayer() {
    // var params = {
    //     layerName: '163451',
    //     whereClause: "(serviceid IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210) AND (airisktype LIKE '%ניתוק חברתי%' OR airisktype LIKE '%ירידה חושית%'))",
    //     zoomToExtent: true,
    // };
    // govmap.filterLayers(params);
    const params = {
        "geometry": "POINT (179322 665224)",
        "layerName": "163451",
        "fields": [
            "servicenam",
            "fulladdres",
            "servicedes",
            "targetpopu",
            "requirespa",
            "requires_1",
            "servicepro",
            "language",
            "airisktype",
            "accessibil",
            "providerna",
            "gisx",
            "gisy"
        ],
        "radius": 150,
        "whereClause": "(serviceid IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210, 237) AND airisktype LIKE '%ירידה חושית%')"
    };
    govmap.intersectFeatures(params)
        .then((response) => {console.log('intersectFeatures response', response);});
}