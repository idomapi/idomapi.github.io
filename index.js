function initGovMap() {
    govmap.createMap('map', {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: ["GASSTATIONS", "211923", "212703", "PARCEL_ALL", "SUB_GUSH_ALL", '156'],
        visibleLayers: ["215212"],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        bgButton: true,
        background: "0",
        layersMode: 1,
        // zoomButtons: false,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function (e) {
            // filterLayersOnLoad();
            populateDropdown();
        },
    });
}

function filterLayersOnLoad() {
    var params = {
        layerName: '215212',
        whereClause: "nta_infra_ in (221112222)",
        // whereClause: "id in (61)",
        zoomToExtent: true
    };
    govmap.filterLayers(params);
}

function populateDropdown() {
    const select = document.getElementById('drawType');
    for (let type in govmap.drawType) {
        const option = document.createElement('option');
        option.value = govmap.drawType[type];
        option.text = type;
        select.appendChild(option);
    }
    generateDrawFunction();
}

function generateDrawFunction() {
    window.draw = function () {
        const select = document.getElementById('drawType');
        const selectedValue = select.value;
        govmap.draw(selectedValue).then(response => {
            console.log('Drawn:', response);
            document.getElementById('data-display').innerText = JSON.stringify(response);
        });
    }
}

function editDrawing() {
    govmap.editDrawing();
}

function clearDrawings() {
    govmap.clearDrawings();
}

function clearFilterLayers() {
    var params = {
        layerName: '211923',
        whereClause: "1 = 1",
        zoomToExtent: false
    };
    govmap.filterLayers(params);
}

function selectFeaturesOnMap(company) {
    var params = {
        continous: false,
        drawType: govmap.drawType.Polygon,
        filterLayer: true,
        isZoomToExtent: true,
        layers: ['GASSTATIONS'],
        returnFields: {
            'GASSTATIONS': ['objectid', 'company', 'name', 'address']
        },
        selectOnMap: false,
        whereClause: {
            'GASSTATIONS': `(company = ${company})`
        },
    }
    govmap.selectFeaturesOnMap(params).then(function (response) {
        console.log(response);
        document.getElementById('data-display').innerText = JSON.stringify(response);
    });
}

function selectFeaturesOnMapParcel() {
    var params = {
        continous: false,
        drawType: govmap.drawType.Polygon,
        filterLayer: false,
        isZoomToExtent: true,
        layers: ['SUB_GUSH_ALL', '211923'],
        returnFields: {
            'SUB_GUSH_ALL': ['objectid', 'gush_num', 'status_text'],
            '211923': ['value0', 'value1']
        },
        selectOnMap: true,
        whereClause: {
            'SUB_GUSH_ALL': "(gush_num IN(7103, 7101))",
            '211923': "(value1 >= 18)"
        },
    }
    govmap.selectFeaturesOnMap(params).then(function (response) {
        console.log(response);
        document.getElementById('data-display').innerText = JSON.stringify(response);
    });
}

function displayGeometries() {
    const bubbleHTML = '<div id="foo" style="border:1px solid #ccc;padding:10px;background:white;box-shadow:0 0 10px rgba(0,0,0,0.2);font-family:sans-serif;direction:rtl;"><div style="display:flex;justify-content:space-between;font-weight:bold;"><span>לשכת האושר מס\' {0}</span></div><div style="margin-top:10px;line-height:1.6;"><div>שעות פעילות: 24/7</div><div>כניסה: א\'</div><div>קואורדינטות ארציות – X: {1}</div><div>קואורדינטות ארציות – Y: {2}</div></div></div>';
    var data = {
        wkts: ['POINT(179714.32 663772.17)', "POINT(179621.05 663704.57)", "POINT(179376.26 663907.7)"],
        names: ['p1', 'p2', 'p3'],
        geometryType: govmap.geometryType.POINT,
        defaultSymbol:
        {
            url: 'https://avatars.githubusercontent.com/u/39527795?s=48&v=4',
            width: 50,
            height: 50
        },
        symbols: [
            { url: 'https://avatars.githubusercontent.com/u/39507795?s=48&v=4', width: 15, height: 15 },
            { url: 'https://avatars.githubusercontent.com/u/39225795?s=48&v=4', width: 15, height: 15 },
        ],
        clearExisting: true,
        data: {
            tooltips: ['0404 חדשות', '0404 כלכלה', '0404 בארץ'],
            headers: ['חדשות', 'כלכלה', 'בארץ'],
            bubbleHTML,
            bubbleHTMLParameters: [[71, 188608, 674362], [72, 18800, 674000], [73, 288608, 775362], [74, 10000, 2000]],
            bubbles: [
                'categories/1',
                'categories/78',
                'categories/132'
            ],
            // bubbleUrl: 'https://www.0404.co.il/',
            labels: ['ראשון', 'שני', 'שלישי'],
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
                    stroke: '#b45f06',
                },
            ]
        }
    };
    govmap.displayGeometries(data).then(function (response) {
        console.log(response.data);
        document.getElementById('data-display').innerText = JSON.stringify(response);
    });

}

function geocode(isAccuracyOnly) {
    var keyword = document.getElementById('searchInput').value;

    if (!keyword) {
        alert('יש להזין ערך לחיפוש');
        return;
    }

    govmap.geocode({ keyword: keyword, type: isAccuracyOnly ? govmap.geocodeType.AccuracyOnly : govmap.geocodeType.FullResult })
        .then(function (response) {
            console.log(response)
            document.getElementById('data-display').innerText = JSON.stringify(response);
        });
}

function closeBubble() {
    govmap.closeBubble();
}

function filterLayers() {
    var params = {
        layerName: '211923',
        whereClause: "value1 >= 10",
        zoomToExtent: true
    };
    govmap.filterLayers(params);
}

function searchAndLocate(isLotParcelToAddress) {
    var params = isLotParcelToAddress
        ? {
            type: govmap.locateType.lotParcelToAddress,
            address: 'וילסון 10, תל אביב'
        }
        : {
            type: govmap.locateType.addressToLotParcel,
            lot: 7103,
            parcel: 90
        };
    govmap.searchAndLocate(params).then(function (response) {
        console.log(response);
        document.getElementById('data-display').innerText = JSON.stringify(response);
    });
}

function getLayerData() {
    var params = {
        LayerName: '211923',
        Point: { x: 180143, y: 664332 },
        Radius: 20
    };
    govmap.getLayerData(params).then(function (response) {
        console.log(response);
        document.getElementById('data-display').innerText = JSON.stringify(response);
    });
}

function intersectFeatures(isWrongAddress) {
    var params = {
        address: `סעדיה הגאון ${isWrongAddress ? 26 : 24} תל אביב`,
        layerName: "GASSTATIONS",
        fields: ['company', 'name', 'address'],
    }
    govmap.intersectFeatures(params).then(function (response) {
        console.log(response);
    });
}

function intersectFeatures2() {
    var params = {
        address: `לינקולן 3 תל אביב`,
        layerName: "211923",
        fields: ['value0'],
    }

    govmap.intersectFeatures(params).then(function (response) {
        console.log(response);
    });
}

function intersectFeatures3() {
    var params = {
        address: `הרב אויערבך משה 6,פתח תקווה`,
        layerName: "neta_segment",
        fields: ['code'],
    }

    govmap.intersectFeatures(params).then(function (response) {
        console.log(response);
    });
}
function intersectFeatures4() {
    var params = {
        address: `קרליבך 5 תל אביב-יפו`,
        layerName: "neta_segment",
        fields: ['code'],
    }

    govmap.intersectFeatures(params).then(function (response) {
        console.log(response);
    });
}


function searchInLayer() {
    var params = {
        layerName: '211923',
        fieldName: 'value0',
        fieldValues: ['הכרמל', 'שרונה'],
        showBubble: false,
        highlight: true,
        fillColor: ['180', '0', '255'],
        outLineColor: ['255', '136', '0']
    };
    govmap.searchInLayer(params);
}