/**
 * PROD
const API_TOKEN = '8afbb7f6-f247-4b73-9366-635aaa7c9b1f';
const LAYER_NAME = 'layer_234365';
*/

const API_TOKEN = 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657';
const LAYER_NAME = '208272';


/**
 * DEV
const API_TOKEN = '8c430f7f-1e21-4434-b256-c5e91fac4005';
const LAYER_NAME = 'layer_160238';
*/

/**
 * govmap.gov.il
const API_TOKEN = '9d920b21-227a-4b1d-b5ce-d01971dbf9ec';
const LAYER_NAME = 'layer_208278';
*/

let useSpatialFilter = false;
let currentBbox = null;

function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

let currentData = null;

function exportToExcel() {
    if (!currentData || !Array.isArray(currentData)) {
        alert('אין נתונים לייצוא');
        return;
    }

    let csv = '﻿חברה,כמות,אחוז\n';

    currentData.forEach((item) => {
        csv += `"${item.company || 'לא ידוע'}",${item.count},${item.percentage.toFixed(1)}%\n`;
    });

    const totalCount = currentData.reduce((sum, item) => sum + (item.count || 0), 0);
    csv += `"סה""כ",${totalCount},100.0%\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `aggregate_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function updateAggregateTable(response) {
    const tableWrapper = document.querySelector('.table-wrapper');

    if (!response || !response.data) {
        tableWrapper.innerHTML = '<div class="error">אין נתונים להצגה</div>';
        currentData = null;
        return;
    }

    if (response.data.value !== undefined) {
        tableWrapper.innerHTML = `
            <div class="table-container">
                <h2>ספירת רשומות</h2>
                <p class="count-result">סה"כ רשומות במפה: <strong>${response.data.value.toLocaleString('he-IL')}</strong></p>
            </div>
        `;
        currentData = null;
        return;
    }

    if (!Array.isArray(response.data)) {
        tableWrapper.innerHTML = '<div class="error">פורמט נתונים לא מוכר</div>';
        currentData = null;
        return;
    }

    currentData = response.data;

    const rowCount = response.data.length;
    const totalCount = response.data.reduce((sum, item) => sum + (item.count || 0), 0);
    const summaryLabel = useSpatialFilter ? 'סה״כ אנטנות בתצוגה הנוכחית' : 'סה״כ אנטנות (ארצי)';

    let tableHTML = `
        <div class="results-summary">
            <p>${summaryLabel}: <strong>${totalCount.toLocaleString('he-IL')}</strong></p>
        </div>
        <div class="table-container">
            <div class="table-header">
                <h2>תוצאות לפי חברה</h2>
                <button class="export-btn" onclick="exportToExcel()" title="ייצוא נתונים לאקסל">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>חברה</th>
                        <th>כמות</th>
                        <th>אחוז</th>
                    </tr>
                </thead>
                <tbody>
    `;

    response.data.forEach((item) => {
        tableHTML += `
                    <tr>
                        <td>${item.company || 'לא ידוע'}</td>
                        <td>${item.count.toLocaleString('he-IL')}</td>
                        <td>${item.percentage.toFixed(1)}%</td>
                    </tr>
        `;
    });

    tableHTML += `
                    <tr class="sum-row">
                        <td>סה"כ</td>
                        <td>${totalCount.toLocaleString('he-IL')}</td>
                        <td>100.0%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    tableWrapper.innerHTML = tableHTML;
}

function fetchAggregateData(bbox) {
    const params = {
        apiKey: API_TOKEN,
        source: {
            layer: LAYER_NAME,
            srid: 2039
        },
        operation: {
            type: 'count'
        },
        grouping: {
            group_by: 'company'
        },
        output: {
            include_percentage: true,
            limit: 100
        }
    };

    if (useSpatialFilter && bbox) {
        params.filter = {
            view_mode: govmap.aggViewMode.Extent,
            bbox: [bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax]
        };
    } else {
        params.filter = {
            view_mode: govmap.aggViewMode.Global
        };
    }

    console.log('Aggregate request details:', {
        spatialFilter: useSpatialFilter,
        hasBbox: !!bbox,
        bboxValues: bbox,
        requestStructure: JSON.stringify(params, null, 2)
    });

    govmap.aggregate(params).then(function(result) {
        console.log('Aggregate result:', result);

        if (result && result.error) {
            console.error('API error:', result.error);
            const tableWrapper = document.querySelector('.table-wrapper');
            tableWrapper.innerHTML = `<div class="error">שגיאת API: ${result.error}</div>`;

            return;
        }

        updateAggregateTable(result);
    }).catch(function(error) {
        console.error('Error fetching aggregate data:', error);
        console.error('Error response:', error.response);

        const errorMsg = error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : (error.message || 'Unknown error');

        console.error('Parsed error:', errorMsg);

        if (useSpatialFilter && params.filter) {
            console.warn('Spatial filtering failed (500 error), disabling spatial filter');
            useSpatialFilter = false;
            document.getElementById('spatialFilterToggle').checked = false;

            const tableWrapper = document.querySelector('.table-wrapper');
            tableWrapper.innerHTML = `<div class="error">סינון מרחבי נכשל: ${errorMsg}<br/>מציג את כל הנתונים</div>`;

            setTimeout(() => {
                fetchAggregateData(currentBbox);
            }, 1000);

            return;
        }

        const tableWrapper = document.querySelector('.table-wrapper');
        tableWrapper.innerHTML = `<div class="error">שגיאה בטעינת נתונים: ${errorMsg}</div>`;
    });
}

const debouncedFetchAggregateData = debounce(fetchAggregateData, 500);

function handleExtentChange(event) {
    console.log('Extent change event:', event);

    if (event && event.extent) {
        currentBbox = {
            xmin: event.extent.xmin,
            ymin: event.extent.ymin,
            xmax: event.extent.xmax,
            ymax: event.extent.ymax
        };

        console.log('Extracted bbox:', currentBbox);

        if (useSpatialFilter) {
            debouncedFetchAggregateData(currentBbox);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('spatialFilterToggle');

    toggle.addEventListener('change', (event) => {
        useSpatialFilter = event.target.checked;
        console.log('Spatial filter toggled:', useSpatialFilter);

        fetchAggregateData(currentBbox);
    });

    govmap.createMap('map', {
        token: API_TOKEN,
        visibleLayers: [LAYER_NAME],
        showXY: true,
        identifyOnClick: true,
        isEmbeddedToggle: false,
        background: '0',
        layersMode: 1,
        zoomButtons: true,
        onLoad: () => {
            govmap.onEvent(govmap.events.EXTENT_CHANGE).progress(handleExtentChange);

            // Fetch initial global data when spatial filter is OFF
            setTimeout(() => {
                fetchAggregateData(null);
            }, 100);
        }
    });
});
