function initGovMap() {
    govmap.createMap('map', {
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        layers: ["GASSTATIONS", "SUB_GUSH_ALL", "PARCEL_ALL", 'layer_207126', 'layer_207127'],
        visibleLayers: [ 'layer_207126'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
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
            width: 10,
            color: [0, 255, 0, 1], // green
        },
        symbols: [
            // { url: 'https://avatars.githubusercontent.com/u/196661916?v=4&size=64', width: 50, height: 50 },
        ],
        clearExisting: true,
        data: {
            // tooltips: [tooltip1, ' כלשהו טקסט נוסף'],
            labels: ['תווית עם מספר מילים', 'bazzzz'],
            headers: ['שווארמה'],
            // bubbles: ['%D7%A9%D7%95%D7%95%D7%90%D7%A8%D7%9E%D7%94', 'פלאפל'],
            // bubbleUrl: 'https://he.wikipedia.org/wiki/',
            // bubbleHTML: bubbleContent,
            // bubbleHTMLParameters: [['מצולע 1', 'מידע נוסף...'], ['מצולע 2', 'מידע נוסף...']],
        },
    }
    govmap.displayGeometries(data).then(function (response) {
        console.log(response);
    });
}