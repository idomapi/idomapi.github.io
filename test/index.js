function initGovMap() {
    govmap.createMap('map', {
        onLoad: function (e) {
            populateDropdownAndCityList();
            populateDropdown();
        },
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        layers: ["GASSTATIONS", "SUB_GUSH_ALL", "201923", "PARCEL_ALL", "202113"],
        visibleLayers: ['201923'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function () {
            // extentAllFeatures();
        }
    });
}

function extentAllFeatures() {
    var params = {
        layerName: '201923',
        whereClause: "objectid IS NOT NULL",
        zoomToExtent: true
    };
    govmap.filterLayers(params);
}

function selectFeaturesOnMap() {
    var params = {
        continous: false,
        drawType: govmap.drawType.Polygon,
        filterLayer: false,
        isZoomToExtent: false,
        layers: ['201923'],
        returnFields: {
            '201923': ['value0', 'value1']
        },
        selectOnMap: true,
        whereClause: {
            '201923': "(value0 >= 4)"
        },
    }
    govmap.selectFeaturesOnMap(params).then(function (response) {
        console.log(response);
    });
}

function displayGeometries() {
    var data = {
        wkts: ['POINT(181611 665679)', "POINT(181388 665731)", "POINT(181564 665568)"],
        names: ['p1', 'p2', 'p3'],
        geometryType: govmap.geometryType.POINT,
        defaultSymbol:
        {
            url: 'https://avatars.githubusercontent.com/u/39527795?s=48&v=4',
            width: 35,
            height: 35
        },
        symbols: [
            { url: 'https://idomapi.github.io/demo/falafel.jpg', width: 65, height: 65 },
            { url: 'https://idomapi.github.io/demo/shawarma.jpg', width: 50, height: 50 }
        ],
        clearExisting: true,
        data: {
            tooltips: ['פלאפל כדורי', 'סטקיית סבינו'],
            headers: ['פלאפל', 'שווארמה', 'אחר'],
            bubbles: [
                '8848208',
                '8817869',
                '26464151'
            ],
            bubbleUrl: 'https://easy.co.il/page/',
            labels: ['צמחוני', 'בשרי'],
            fontLabel: [
                {
                    font: 'Arial',
                    size: 12,
                    fill: 'yellow',
                    stroke: 'green',
                },
                {
                    font: 'Arial',
                    size: 16,
                    fill: '#a64d79',
                    stroke: '#f1c232',
                },
            ]
        }
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });
}

function closeBubble() {
    govmap.closeBubble();
}

function clearFilterLayers() {
    var params = {
        layerName: '201923',
        whereClause: "1 = 1",
        zoomToExtent: false
    };
    govmap.filterLayers(params);
}

function clearDrawings() {
    govmap.clearDrawings();
}