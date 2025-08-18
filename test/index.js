function initGovMap() {
    govmap.createMap('map', {
        onLoad: function (e) {
            populateDropdownAndCityList();
            populateDropdown();
        },
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        layers: ["GASSTATIONS", "SUB_GUSH_ALL", "201923", "PARCEL_ALL", "SUB_GUSH_ALL", "202113"],
        visibleLayers: ['201923'],
        showXY: true,
        isEmbeddedToggle: false,
        background: "0",
        layersMode: 1,
        center: { x: 179487, y: 663941 },
        level: 9,
        onLoad: function (e) {
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
        });
    }
}

function searchInLayer(address) {
    var params = {
        layerName: '211923',
        fieldName: 'value3',
        fieldValues: [address],
        showBubble: true,
        highlight: false,
    };
    govmap.searchInLayer(params);
    setTimeout(() => clearFilterLayers(), 250);
}

function filterLayers() {
    var params = {
        layerName: '211923',
        whereClause: "value2 = 'רמת-גן'",
        zoomToExtent: false
    };
    govmap.filterLayers(params);
}

var hashalomTrainStation = { x: 180620, y: 664501 };

function zoomToXY() {
    govmap.zoomToXY({ ...hashalomTrainStation, level: 10, marker: true });
}

function getLayerData() {
    var params = {
        LayerName: '211923',
        Point: hashalomTrainStation,
        Radius: 500
    };
    govmap.getLayerData(params).then(function (response) {
        console.log(response);
    });
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

// Page Setup

// Hardcoded city data
const cityData = [
  { name: 'שרונה', city: 'תל-אביב', address: 'דרך בגין 125', id: 1, area: 'נפת גוש דן' },
  { name: 'מפ/"י', city: 'תל-אביב', address: 'לינקולן 3', id: 2, area: 'נפת גוש דן' },
  { name: 'שרקוטרי', city: 'תל-אביב', address: 'וילסון 10', id: 3, area: 'נפת גוש דן' },
  { name: 'נחמני', city: 'תל-אביב', address: 'שדרות רוטשילד 80', id: 4, area: 'נפת גוש דן' },
  { name: 'הכרמל', city: 'תל-אביב', address: 'אלנבי 58', id: 5, area: 'נפת גוש דן' },
  { name: 'הבורסה', city: 'רמת-גן', address: 'דרך אבא הלל 1', id: 6, area: 'נפת גוש דן' },
];

function populateDropdownAndCityList() {
  const $dropdown = $('#cityDropdown');
  const $cityList = $('#cityList');

  const $placeholder = $('<option>', {
    value: -1,
    text: 'בחר כתובת',
    selected: true,
    disabled: false
  });

  $dropdown.append($placeholder);
  cityData.forEach(function(item) {
    $dropdown.append(
      $('<option>', { value: item.id, text: item.address })
    );
  });
  setTimeout(() => $dropdown.val("-1"), 0);

  // Remove placeholder on first interaction
  $dropdown.one('change', function() {
    $dropdown.find('option[value="-1"]').prop('disabled', true);
  });


  // Populate city list
  cityData.forEach(function(item) {
    $cityList.append(
      $('<li>', {
        class: 'city-item',
        'data-id': item.id,
        tabindex: 0,
        html: `<strong>${item.city}</strong>: ${item.address} <span style="color:#888;font-size:0.95em">(${item.area})</span>`
      })
    );
  });

  // On city list item click or keyboard enter
  $cityList.on('click', '.city-item', function() {
    const id = $(this).data('id');
    selectCityById(id);
  });
  $cityList.on('keydown', '.city-item', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const id = $(this).data('id');
      selectCityById(id);
    }
  });

  // Unified selection logic for dropdown and sidebar
  function selectCityById(id) {
    // Highlight correct city in sidebar
    $cityList.children().removeClass('selected');
    $cityList.children(`[data-id="${id}"]`).addClass('selected');
    // Set dropdown value by id
    $dropdown.val(id);
    // For demo: log selection
    const city = cityData.find(c => c.id == id);
    if (city) {
      console.log(`Selected: ${city.city} (${city.address}, ${city.area})`);
      searchInLayer(city.address);
    }
  }
  // On dropdown change (select)
  $dropdown.on('change', function() {
    const id = $(this).val();
    selectCityById(id);
  });

  // Initial selection (first city)
  if (cityData.length > 0) {
    selectCityById(cityData[0].id);
  }
}
