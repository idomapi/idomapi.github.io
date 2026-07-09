const gvulLayer = '237479';
const migrashimLayer = '237473';

function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: [gvulLayer, migrashimLayer],
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
            filterLayer();
        },
    });
}

async function searchInLayer() {
    const rikuzim = {
        layerName: 'layer_230860',
        fieldName: 'kalpi',
        fieldValues: ['115', '43'],
    }
    govmap.searchInLayer({
        layerName: rikuzim.layerName,
        fieldName: rikuzim.fieldName,
        fieldValues: rikuzim.fieldValues,
        highlight: true,
        fillColor: [255, 0, 0, 0.5],
        outLineColor: [0, 255, 0, 1]
    });

    const ashkelon = {
        layerName: 'layer_234077',
        fieldName: 'value0',
        fieldValues: ['1', '3'],
    }
    govmap.searchInLayer({
        layerName: ashkelon.layerName,
        fieldName: ashkelon.fieldName,
        fieldValues: ashkelon.fieldValues,
        highlight: true,
        fillColor: [255, 0, 0, 0.5],
        outLineColor: [128, 0, 128, 1]

    });

    const kalpi = {
        layerName: 'layer_230859',
        fieldName: 'kalpi',
        fieldValues: ['206', '97'],
    }

    govmap.searchInLayer({
        layerName: kalpi.layerName,
        fieldName: kalpi.fieldName,
        fieldValues: kalpi.fieldValues,
        highlight: true,
        fillColor: [255, 0, 0, 0.5],
        outLineColor: [128, 0, 128, 1]
    });
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

function filterLayer() {
    const ma = 2056235;
    govmap.filterLayers({ 'layerName': migrashimLayer, 'whereClause': "MISHASAVA =" + ma, 'zoomToExtent': false });
    govmap.filterLayers({ 'layerName': gvulLayer, 'whereClause': "MISHASAVA =" + ma, 'zoomToExtent': true });
}