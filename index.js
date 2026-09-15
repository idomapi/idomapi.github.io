const gvulLayer = '237479';
const migrashimLayer = '237473';

function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        // layers: [gvulLayer, migrashimLayer],
        visibleLayers: ['241981'],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        center: { x: 182036, y: 666148 },
        // center: { x: 159530, y: 620516 },
        level: 7,
        onLoad: function () {
        },
    });
}

function findParcel() {
    govmap.setVisibleLayers(["PARCEL_ALL", "SUB_GUSH_ALL"]);
    var params = {
        layerName: 'PARCEL_ALL',
        fieldName: 'name',
        fieldValues: ["60/100231/3"],
        highlight: true,
        fillColor: [173, 216, 230, 0.3],
        outlineColor: [0, 0, 255, 1],
    };
    govmap.searchInLayer(params);
}

async function searchInLayer() {
    var params = {
        layerName: '234077',
        fieldName: 'value0',
        fieldValues: ['3'],
        highlight: true,
        showBubble: false,
        outLineColor: [0, 255, 0, 1],
        fillColor: [255, 0, 0, 0.5],
    };
    govmap.searchInLayer(params);
}

function selectFeaturesOnMap() {
    const params = {
        continous: false,
        // drawType: govmap.drawType.Point,
        wkt: 'POINT(199390 624673)',
        radius: 100,
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
const GEOMETRY_DISPLAY_ITEMS = [
    {
        wkt: 'MULTIPOLYGON(((179506.75 663857.06, 179511.48 663865.08, 179517.34 663872.53, 179518.67 663873.97, 179535.84 663863.97, 179519.84 663836.26, 179501.56 663846.9, 179506.75 663857.06)))',
        tooltip: 'חישוב מרחק הליכה15',
        name: 'p1',
        bubble: '5',
        symbol: {
            outlineColor: [255, 0, 0, 0.8],
            outlineWidth: 2,
            fillColor: [255, 0, 0, 0.8]
        }
    },
    {
        wkt: 'POLYGON((179417.24 664350.27, 179176.41 663907.61, 179701.97 663586.94, 179983.7 664130.29, 179417.24 664350.27))',
        tooltip: 'חישוב מרחק הליכה10',
        name: 'p2',
        bubble: '10',
        symbol: {
            outlineColor: [144, 238, 144, 0.5],
            outlineWidth: 2,
            fillColor: [144, 238, 144, 0.5]
        }
    },
    {
        wkt: 'POLYGON((179377.93 664656.9, 178388.23 663406.63, 180222.3 662951.73, 180673.01 664240.56, 179377.93 664656.9))',
        tooltip: 'חישוב מרחק הליכה5',
        name: 'p3',
        bubble: '15',
        symbol: {
            outlineColor: [29, 21, 255, 0.2],
            outlineWidth: 2,
            fillColor: [29, 21, 255, 0.2]
        }
    }
];


function displayGeometries() {
    const REVERSE_GEOMETRY_ORDER = true;
    const items = REVERSE_GEOMETRY_ORDER
        ? [...GEOMETRY_DISPLAY_ITEMS].reverse()
        : GEOMETRY_DISPLAY_ITEMS;

    var data =
    {
        wkts: items.map((item) => item.wkt),
        showBubble: false,
        geomData: items.map((_, i) => `Index: ${i}`),
        names: items.map((item) => item.name),
        geometryType: govmap.drawType.Polygon,
        defaultSymbol:
        {
            outlineColor: [255, 255, 0, 0.5],
            outlineWidth: 2,
            fillColor: [255, 255, 0, 0.5]
        },
        symbols: items.map((item) => item.symbol),
        clearExisting: true,
        data: {
            tooltips: items.map((item) => item.tooltip),
        }
    };

    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
    });
}

async function intersectFeatures() {
    var params = {
        geometry: "POLYGON((178913.45 662158.23, 183817.6 662139.91, 183831.7 666172.6, 178929.49 666190.93, 178913.45 662158.23))",
        layerName: "GASSTATIONS",
        fields: ['value1', 'value2', 'value3'],
        whereClause: "(value1 LIKE %ד%) AND (value2 LIKE %אבי%)"
    };
    try {
        const response = await govmap.intersectFeatures(params);
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

// function filterLayer() {
//     const ma = 2056235;
//     govmap.filterLayers({ 'layerName': migrashimLayer, 'whereClause': "MISHASAVA =" + ma, 'zoomToExtent': false });
//     govmap.filterLayers({ 'layerName': gvulLayer, 'whereClause': "MISHASAVA =" + ma, 'zoomToExtent': true });
// }

function filterLayer() {
    var params = {
        layerName: '241981',
        whereClause: "(serviceid IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210)) AND (airisktype LIKE '%ניתוק חברתי%' OR airisktype LIKE '%ירידה חושית%')",
        zoomToExtent: true
    };
    govmap.filterLayers(params);
}