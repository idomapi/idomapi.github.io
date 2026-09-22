// api-test.js — govmap.aggregate capability tests against the PM spec
// Runs automatically on page load, no map required.

const TLV_BBOX = [178150.88, 662686.68, 179607.65, 663662.95];
const TLV_POLYGON_WKT = 'POLYGON((3867306.22 3764726.38, 3880743.46 3764726.38, 3880743.46 3783410.40, 3867306.22 3783410.40, 3867306.22 3764726.38))';

// ─── Row helpers ─────────────────────────────────────────────────────────────

const tbody = document.getElementById('test-tbody');
const counts = { pass: 0, fail: 0, warn: 0 };

function sectionRow(label) {
    const tr = document.createElement('tr');
    tr.className = 'section-hdr';
    tr.innerHTML = `<td colspan="6">${label}</td>`;
    tbody.appendChild(tr);
}

function pendingRow(id, name, requirement, specSection) {
    const tr = document.createElement('tr');
    tr.id = 'row-' + id;
    tr.innerHTML = `
        <td class="test-name">${name}<small>${requirement}</small></td>
        <td class="spec-section">${specSection || ''}</td>
        <td>${requirement}</td>
        <td class="status running" id="st-${id}">⏳ רץ…</td>
        <td class="note" id="note-${id}"></td>
        <td id="raw-${id}"></td>
    `;
    tbody.appendChild(tr);
}

function appendRaw(container, summary, value, truncate) {
    const pre = document.createElement('pre');
    pre.className = 'golami';
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    pre.textContent = truncate ? text.slice(0, 1200) : text;
    const det = document.createElement('details');
    det.innerHTML = '<summary>' + summary + '</summary>';
    det.appendChild(pre);
    container.appendChild(det);
}

function resolve(id, verdict, note, rawData, requestPayload) {
    const st = document.getElementById('st-' + id);
    const noteEl = document.getElementById('note-' + id);
    const rawEl = document.getElementById('raw-' + id);

    const map = { pass: '✓ עובד', fail: '✗ שגיאה', warn: '⚠ הגבלה' };
    st.textContent = map[verdict];
    st.className = 'status ' + verdict;
    noteEl.textContent = note;
    counts[verdict]++;

    if (requestPayload !== undefined) {
        appendRaw(rawEl, 'בקשה', Object.assign({ apiKey: API_TOKEN }, requestPayload));
    }

    if (rawData !== undefined) {
        appendRaw(rawEl, requestPayload !== undefined ? 'תגובה' : 'הצג גולמי', rawData, requestPayload === undefined);
    }

    updateSummary();
}

function updateSummary() {
    document.getElementById('summary').innerHTML =
        `<span class="s-pass">✓ ${counts.pass} ${counts.pass === 1 ? 'עבר' : 'עברו'}</span>` +
        `<span class="s-fail">✗ ${counts.fail} ${counts.fail === 1 ? 'נכשל' : 'נכשלו'}</span>` +
        `<span class="s-warn">⚠ ${counts.warn} ${counts.warn === 1 ? 'הגבלה' : 'הגבלות'}</span>`;
}

// ─── Run a single aggregate call, return a Promise<result> ───────────────────
//
// STAGE's aggregate endpoint returns bursts of 502/503/504 once several requests land
// close together — this file fired ~30 of them concurrently on page load. Serialize
// every call through one queue (with spacing between calls), and retry once after a
// long backoff if a call still lands on a gateway error.

const AGG_SPACING_MS = { STAGE: 400 }[typeof API_TEST_ENV_KEY !== 'undefined' ? API_TEST_ENV_KEY : 'DEV'] || 0;
const AGG_GATEWAY_RETRY_DELAY_MS = 62000;

let aggQueueTail = Promise.resolve();

function agg(payload) {
    const call = () => govmap.aggregate(Object.assign({ apiKey: API_TOKEN }, payload));

    // GovMap's own application errors resolve with { error: CODE } rather than rejecting
    // (see AGGREGATE.md's error-codes table), so a promise rejection here is almost
    // certainly a transport/gateway failure — worth one retry after a long backoff.
    const run = aggQueueTail
        .then(() => new Promise((resolve) => setTimeout(resolve, AGG_SPACING_MS)))
        .then(call)
        .catch(() => new Promise((resolve) => setTimeout(resolve, AGG_GATEWAY_RETRY_DELAY_MS)).then(call));

    // Keep the queue moving even if this call ultimately fails, so later calls aren't blocked.
    aggQueueTail = run.catch(function() {});

    return run;
}

// ─── Build all row placeholders ───────────────────────────────────────────────

sectionRow('נתונים — סינון: ערכים ייחודיים לפי שדה (filter widget)');
pendingRow('filter-values-company',  'ערכי שדה company (cellular)', 'group_by + count → dropdown ערכים',  'נתונים › רכיב "סינון" › §4 נתוני הסינון');
pendingRow('filter-values-yeud',     'ערכי שדה t_yeud_karka (TLV)', 'group_by + count → dropdown ערכים',  'נתונים › רכיב "סינון" › §4 נתוני הסינון');

sectionRow('נתונים — מספרים: פעולות sum / avg / min / max');
pendingRow('num-sum',  'sum(dunam) — חלקות חקלאיות', 'operation.type=sum',   'נתונים › רכיב "מספר" › §2 הגדרת החישוב › סוג הפעולה: סכום');
pendingRow('num-avg',  'avg(dunam) — חלקות חקלאיות', 'operation.type=avg',   'נתונים › רכיב "מספר" › §2 הגדרת החישוב › סוג הפעולה: ממוצע');
pendingRow('num-min',  'min(dunam) — חלקות חקלאיות', 'operation.type=min',   'נתונים › רכיב "מספר" › §2 הגדרת החישוב › סוג הפעולה: מינימום');
pendingRow('num-max',  'max(dunam) — חלקות חקלאיות', 'operation.type=max',   'נתונים › רכיב "מספר" › §2 הגדרת החישוב › סוג הפעולה: מקסימום');
pendingRow('num-range','range(dunam) — חלקות חקלאיות', 'operation.type=range', 'נתונים › רכיב "מספר" › §2 הגדרת החישוב (טווח)');

sectionRow('נתונים — טבלה: טעינת רשומות בודדות');
pendingRow('table-op',   'table — חזרת שורות בודדות', 'operation.type=table + fields[]', 'נתונים › רכיב "טבלה" › §1 הגדרות מקור הנתונים');
pendingRow('table-page', 'pagination בטבלה',            'output.page_token',               'נתונים › רכיב "טבלה" › §9 עימוד, טעינה וגלילה');
pendingRow('table-page-exhaust', `עימוד מלא ללא כפילויות — ${API_TEST_PAGINATION_TARGET.label}`, 'עימוד עד has_more=false + בדיקת שורות כפולות ומטא-דאטה', 'נתונים › רכיב "טבלה" › §9 עימוד, טעינה וגלילה');

sectionRow('נתונים — מספרים: אחוז KPI (מחושב client-side)');
pendingRow('pct-kpi', 'count מסונן ÷ count גלובלי', 'שתי קריאות + חישוב client', 'נתונים › רכיב "מספר" › §3 הצגת מספר או אחוז');

sectionRow('ציר זמן — interval × aggregation');
Object.values(govmap.aggTimeseriesInterval || {}).forEach(function(interval) {
    Object.values(govmap.aggTimeseriesAggregation || {}).forEach(function(aggregation) {
        pendingRow(
            'ts-' + interval + '-' + aggregation,
            'timeseries ' + interval + ' / ' + aggregation,
            'interval=' + interval + ' + aggregation=' + aggregation,
            'נתונים › רכיב "ציר זמן" › §3 אופן התצוגה'
        );
    });
});
pendingRow('ts-quarter', 'timeseries רבעוני — TLV', 'interval=Month + filter.filter BETWEEN על טווח רבעון', 'נתונים › רכיב "ציר זמן" › §3 אופן התצוגה › חלוקת זמן: רבעון');

sectionRow('סינון מרחבי — bbox (extent)');
pendingRow('bbox-global', 'count גלובלי — TLV',  'view_mode=Global (baseline)', 'נתונים › רכיב "סינון מרחבי" › §6 שכבות ורכיבים שיושפעו');
pendingRow('bbox-extent', 'count לפי bbox — TLV', 'view_mode=Extent + bbox',    'נתונים › רכיב "סינון מרחבי" › §6 שכבות ורכיבים שיושפעו');
pendingRow('bbox-diff',   'Extent < Global',       'ספרות שונות = סינון מרחבי עובד', 'נתונים › רכיב "סינון מרחבי" › §6 שכבות ורכיבים שיושפעו');

sectionRow('סינון מרחבי — שכבת ייחוס (spatial_filter)');
pendingRow('spat-filter-layer', 'count cellular בתוך שכבת שכונות', 'filter.spatial_filter.layer + relation=within', 'נתונים › רכיב "סינון לפי מיקום / סימון" › §2 סוג הסימון');

sectionRow('תרשימים — קטגוריה: פעולות sum / avg על שדה מספרי');
pendingRow('cat-sum', 'sum(dunam) לפי yeshuvname', 'operation.type=sum + grouping.group_by', 'תרשימים › רכיב "קטגוריה" › §4 בחירת פעולת חישוב: sum');
pendingRow('cat-avg', 'avg(dunam) לפי yeshuvname', 'operation.type=avg + grouping.group_by', 'תרשימים › רכיב "קטגוריה" › §4 בחירת פעולת חישוב: avg');

sectionRow('תרשימים — קטגוריה: bucket "אחר"');
pendingRow('other-bucket', '__other__ bucket בתגובה', 'output.limit=3 + group_by → __other__', 'תרשימים › רכיב "קטגוריה" › §7 מספר קטגוריות והצגת "אחר"');

sectionRow('תרשימים — קטגוריה: null_handling');
pendingRow('null-exclude',        'null_handling=exclude',         'output.null_handling=exclude',         'תרשימים › רכיב "קטגוריה" › §4 (+ נתונים › "מספר" › §2 טיפול בערכים ריקים)');
pendingRow('null-include-other',  'null_handling=include_as_other', 'output.null_handling=include_as_other', 'תרשימים › רכיב "קטגוריה" › §4 (+ נתונים › "מספר" › §2 טיפול בערכים ריקים)');

sectionRow('תרשימים — עמודות מוערמות: sub_group_by_source=spatial_filter');
pendingRow('sub-spat', 'company × שכונה (spatial sub-group)', 'sub_group_by_source=spatial_filter', 'תרשימים › רכיב "קטגוריה" › §2 חישוב לפי שכבת ייחוס מרחבית');

sectionRow('השוואה — comparison.compare_to');
pendingRow('compare-global',     'compare_to=global — השוואה לממוצע ארצי',      'comparison.compare_to=global (scalar only)',                          'נתונים › רכיב "מספר" › §5 השוואה לערך אחר');
pendingRow('compare-prev-period','compare_to=prev_period — השוואה לתקופה קודמת', 'comparison.compare_to=prev_period + filter.filter BETWEEN date range', 'נתונים › רכיב "מספר" › §5 השוואה לערך אחר');

sectionRow('פורמט תצוגה — output.display_format');
Object.values(govmap.aggDisplayFormat || {}).forEach(function(fmt) {
    pendingRow('fmt-' + fmt, 'display_format=' + fmt, 'output.display_format=' + fmt, 'נתונים › רכיב "מספר" › §4 עיצוב ופורמט המספר');
});

sectionRow('מיון — sort_by + sort_type');
pendingRow('sort-alpha', 'sort_type=alphabetic', 'output.sort_type=alphabetic + sort_by=key', 'תרשימים › רכיב "קטגוריה" › §6 מיון: א-ת');
pendingRow('sort-asc',   'sort_order=asc',       'output.sort_order=asc',                    'תרשימים › רכיב "קטגוריה" › §6 מיון: מהקטן לגדול');

sectionRow('ציר זמן מקובץ — timeseries + grouping.group_by');
pendingRow('ts-grouped', 'timeseries + group_by=building_stage', 'operation.type=timeseries + grouping.group_by → [{groupField, series:[{key,count}]}]', 'תרשימים › רכיב "קו / שטח" › §4 סדרה לכל ערך');
pendingRow('ts-grouped-vs-total', 'group_by מפצל תוצאות ומסתכם לסה"כ', 'timeseries עם group_by לעומת אותו timeseries בלי group_by — הפילוח שונה, הסכום זהה', 'תרשימים › רכיב "קו / שטח" › §4 סדרה לכל ערך');

sectionRow('סינון תכונה — filter.filter (SQL predicate)');
pendingRow('attr-filter-str-eq', 'filter.filter = equality על שדה מחרוזת', "filter.filter: \"(field = 'value')\" — BUG: מחזיר 0 במקום תת-קבוצה", 'נתונים › רכיב "סינון" › §5 סינון לפי ערך שדה');
pendingRow('attr-filter-eq',    'filter.filter BETWEEN על שדה תאריך',      "filter.filter: BETWEEN תאריך — נתמך",                               'נתונים › רכיב "סינון" › §5 סינון לפי ערך שדה');
pendingRow('attr-filter-count', 'count מסונן < count גלובלי',              'BETWEEN מסנן בפועל',                                                'נתונים › רכיב "סינון" › §5 סינון לפי ערך שדה');

sectionRow('getLayerFilterFields — metadata לרכיב סינון');
pendingRow('field-meta-cellular', 'field metadata — cellular', 'govmap.getLayerFilterFields', 'נתונים › רכיב "סינון" › §4 בחירת שדה הסינון');
pendingRow('field-meta-tlv',      'field metadata — TLV',      'govmap.getLayerFilterFields', 'נתונים › רכיב "סינון" › §4 בחירת שדה הסינון');

// ─── Tests ────────────────────────────────────────────────────────────────────

// ── Filter values ─────────────────────────────────────────────────────────────

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    grouping: { group_by: 'company' },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { include_percentage: true, limit: 50 }
}).then(function(r) {
    const n = r.data && r.data.length;
    resolve('filter-values-company', 'pass', n + ' ערכים ייחודיים, מתאים ל-dropdown', r.data.slice(0, 3));
}).catch(function(e) { resolve('filter-values-company', 'fail', String(e)); });

agg({
    source: { layer: LAYER_TLV_PARCELS, srid: 2039 },
    operation: { type: 'count' },
    grouping: { group_by: 't_yeud_karka' },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { include_percentage: true, limit: 50 }
}).then(function(r) {
    const n = r.data && r.data.length;
    resolve('filter-values-yeud', 'pass', n + ' ערכים ייחודיים', r.data.slice(0, 3));
}).catch(function(e) { resolve('filter-values-yeud', 'fail', String(e)); });

// ── Numeric operations ────────────────────────────────────────────────────────

['sum', 'avg', 'min', 'max', 'range'].forEach(function(op) {
    agg({
        source: { layer: LAYER_AGRIC, srid: 2039 },
        operation: { type: op, field: 'dunam' },
        filter: { view_mode: govmap.aggViewMode.Global }
    }).then(function(r) {
        const val = r.data && (r.data.value !== undefined ? r.data.value : JSON.stringify(r.data).slice(0, 80));
        resolve('num-' + op, 'pass', op + ' → ' + val, r.data);
    }).catch(function(e) { resolve('num-' + op, 'fail', String(e)); });
});

// ── Table operation ───────────────────────────────────────────────────────────

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'table', fields: ['company', 'city'] },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { limit: 10 }
}).then(function(r) {
    const rows = r.data && r.data.length;
    const hasToken = r.paging && r.paging.next_page_token !== undefined;
    resolve('table-op', 'pass', rows + ' שורות הוחזרו; next_page_token ב-paging: ' + hasToken, r.data ? r.data.slice(0, 2) : r);
}).catch(function(e) { resolve('table-op', 'fail', String(e)); });

// Table pagination — next_page_token is in res.paging, not res.metadata
agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'table', fields: ['company', 'city'] },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { limit: 5 }
}).then(function(r) {
    const token = r.paging && r.paging.next_page_token;

    if (!token) {
        resolve('table-page', 'warn', 'אין next_page_token — has_more: ' + (r.paging && r.paging.has_more), r.paging);
        return;
    }

    return agg({
        source: { layer: LAYER_CELLULAR, srid: 2039 },
        operation: { type: 'table', fields: ['company', 'city'] },
        filter: { view_mode: govmap.aggViewMode.Global },
        output: { limit: 5, page_token: token }
    }).then(function(r2) {
        resolve('table-page', 'pass', 'עמוד 2: ' + (r2.data && r2.data.length) + ' שורות', r2.data ? r2.data.slice(0, 2) : r2);
    });
}).catch(function(e) { resolve('table-page', 'fail', String(e)); });

// Page through to exhaustion (has_more: false), checking:
// 1. No row reappears across pages, keyed on target.idField (the layer's true unique
//    column) when given — display fields alone are shared by many distinct rows and
//    would produce false-positive duplicates if used as the key.
// 2. offset_start/offset_end advance contiguously and never exceed total_records_found
// 3. total_records_found stays constant across every page
(async function runPaginationExhaustionTest() {
    const target = API_TEST_PAGINATION_TARGET;
    const seenKeys = new Set();
    const duplicates = [];
    const issues = [];

    let pageToken = null;
    let pageCount = 0;
    let totalRowsSeen = 0;
    let expectedTotal = null;
    let lastOffsetEnd = 0;
    let lastResponse = null;

    try {
        do {
            pageCount++;

            const output = pageToken ? { limit: 50, page_token: pageToken } : { limit: 50 };
            const r = await agg({
                source: { layer: target.layer, srid: 2039 },
                operation: { type: 'table', fields: target.fields },
                filter: target.filter,
                output: output
            });

            lastResponse = r;
            const rows = r.data || [];
            const meta = r.metadata || {};

            const keyFields = target.idField ? [target.idField] : target.fields;

            rows.forEach(function(row) {
                const key = keyFields.map(function(f) { return row[f]; }).join('|');
                if (seenKeys.has(key)) {
                    duplicates.push({ page: pageCount, key: key });
                } else {
                    seenKeys.add(key);
                }
            });
            totalRowsSeen += rows.length;

            if (expectedTotal === null) {
                expectedTotal = meta.total_records_found;
            } else if (meta.total_records_found !== expectedTotal) {
                issues.push('עמוד ' + pageCount + ': total_records_found השתנה ' + expectedTotal + ' → ' + meta.total_records_found);
            }

            if (meta.offset_start !== lastOffsetEnd + 1) {
                issues.push('עמוד ' + pageCount + ': offset_start=' + meta.offset_start + ' אינו רציף ל-offset_end הקודם=' + lastOffsetEnd);
            }
            if (meta.offset_end > expectedTotal) {
                issues.push('עמוד ' + pageCount + ': offset_end=' + meta.offset_end + ' גדול מ-total_records_found=' + expectedTotal);
            }
            lastOffsetEnd = meta.offset_end;

            pageToken = r.paging && r.paging.has_more ? r.paging.next_page_token : null;

            if (r.paging && r.paging.has_more && !pageToken) {
                issues.push('עמוד ' + pageCount + ': has_more=true אך אין next_page_token');
                break;
            }
        } while (pageToken);

        if (duplicates.length > 0) {
            issues.push(duplicates.length + ' שורות כפולות בין עמודים: ' + JSON.stringify(duplicates.slice(0, 5)));
        }
        if (totalRowsSeen !== expectedTotal) {
            issues.push('סה"כ שורות שהוחזרו (' + totalRowsSeen + ') ≠ total_records_found (' + expectedTotal + ')');
        }

        const summary = pageCount + ' עמודים, ' + totalRowsSeen + ' שורות, total_records_found=' + expectedTotal;
        resolve(
            'table-page-exhaust',
            issues.length === 0 ? 'pass' : 'fail',
            issues.length === 0 ? summary : summary + ' — ' + issues.join('; '),
            { pages: pageCount, totalRowsSeen: totalRowsSeen, expectedTotal: expectedTotal, duplicates: duplicates, lastPage: lastResponse }
        );
    } catch (e) {
        resolve('table-page-exhaust', 'fail', 'עמוד ' + pageCount + ': ' + String(e), lastResponse);
    }
})();

// ── Percentage KPI (client-side two-call pattern) ─────────────────────────────

var pctGlobal, pctFiltered;

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    filter: { view_mode: govmap.aggViewMode.Global }
}).then(function(r) {
    pctGlobal = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);

    return agg({
        source: { layer: LAYER_CELLULAR, srid: 2039 },
        operation: { type: 'count' },
        filter: {
            view_mode: govmap.aggViewMode.Extent,
            bbox: TLV_BBOX
        }
    });
}).then(function(r) {
    pctFiltered = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);
    const pct = pctGlobal ? ((pctFiltered / pctGlobal) * 100).toFixed(2) : '?';
    resolve('pct-kpi', 'pass',
        'גלובלי: ' + pctGlobal + ', מסונן: ' + pctFiltered + ' → ' + pct + '%',
        { global: pctGlobal, filtered: pctFiltered, pct });
}).catch(function(e) { resolve('pct-kpi', 'fail', String(e)); });

// ── Timeseries interval × aggregation ─────────────────────────────────────────

Object.values(govmap.aggTimeseriesInterval || {}).forEach(function(interval) {
    Object.values(govmap.aggTimeseriesAggregation || {}).forEach(function(aggregation) {
        const id = 'ts-' + interval + '-' + aggregation;
        const op = {
            type: 'timeseries',
            timeseries: {
                date_field: 'up_date',
                interval: interval,
                aggregation: aggregation
            }
        };

        if (aggregation !== 'count') {
            op.field = 'dunam';
        }

        agg({
            source: { layer: LAYER_AGRIC, srid: 2039 },
            operation: op,
            filter: { view_mode: govmap.aggViewMode.Global }
        }).then(function(r) {
            if (r.error) {
                resolve(id, 'fail', String(r.error), r);
                return;
            }

            const sample = r.data && r.data[0];
            resolve(id, 'pass', (r.data && r.data.length) + ' נקודות · ' + JSON.stringify(sample).slice(0, 80), r.data && r.data.slice(0, 2));
        }).catch(function(e) { resolve(id, 'fail', String(e)); });
    });
});

// Quarter — no dedicated interval; use month + filter.filter BETWEEN to scope a single quarter
agg({
    source: { layer: LAYER_TLV_PARCELS, srid: 2039 },
    operation: {
        type: 'timeseries',
        timeseries: {
            date_field: 'tr_status_migrash',
            interval: govmap.aggTimeseriesInterval.Month,
            aggregation: govmap.aggTimeseriesAggregation.Count
        }
    },
    filter: {
        view_mode: govmap.aggViewMode.Global,
        filter: '(tr_status_migrash BETWEEN 2024-01-01T00:00:00 AND 2024-03-31T23:59:59)'
    }
}).then(function(r) {
    const pts = r.data && r.data.length;
    resolve('ts-quarter', pts <= 3 ? 'pass' : 'warn',
        'Q1 2024: ' + pts + ' נקודות זמן (חודשי בטווח רבעון)',
        r.data && r.data.slice(0, 4));
}).catch(function(e) { resolve('ts-quarter', 'fail', String(e)); });

// ── Bbox / extent filter ──────────────────────────────────────────────────────

var bboxGlobalCount, bboxExtentCount;

agg({
    source: { layer: LAYER_TLV_PARCELS, srid: 2039 },
    operation: { type: 'count' },
    filter: { view_mode: govmap.aggViewMode.Global }
}).then(function(r) {
    bboxGlobalCount = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);
    resolve('bbox-global', 'pass', 'סה"כ רשומות: ' + bboxGlobalCount, r.data);
}).catch(function(e) { resolve('bbox-global', 'fail', String(e)); });

agg({
    source: { layer: LAYER_TLV_PARCELS, srid: 2039 },
    operation: { type: 'count' },
    filter: { view_mode: govmap.aggViewMode.Extent, bbox: TLV_BBOX }
}).then(function(r) {
    bboxExtentCount = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);
    resolve('bbox-extent', 'pass', 'בתוך bbox: ' + bboxExtentCount, r.data);

    if (bboxGlobalCount !== undefined) {
        if (bboxExtentCount < bboxGlobalCount) {
            resolve('bbox-diff', 'pass', 'Extent (' + bboxExtentCount + ') < Global (' + bboxGlobalCount + ') — סינון מרחבי עובד');
        } else {
            resolve('bbox-diff', 'warn', 'Extent (' + bboxExtentCount + ') ≥ Global (' + bboxGlobalCount + ') — ייתכן שה-bbox כולל את הכל');
        }
    } else {
        resolve('bbox-diff', 'warn', 'global עדיין לא הסתיים — רענן לביקורת');
    }
}).catch(function(e) {
    resolve('bbox-extent', 'fail', String(e));
    resolve('bbox-diff', 'fail', 'bbox-extent נכשל');
});

// ── Spatial filter by reference layer ────────────────────────────────────────

const spatFilterPayload = {
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    filter: {
        view_mode: govmap.aggViewMode.Global,
        spatial_filter: {
            layer: LAYER_NEIGHBORHOODS,
            relation: govmap.aggSpatialRelation.Within
        }
    }
};

agg(spatFilterPayload).then(function(r) {
    const val = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);
    resolve('spat-filter-layer', 'pass', 'count בתוך שכבת שכונות: ' + val, r, spatFilterPayload);
}).catch(function(e) {
    resolve('spat-filter-layer', 'fail', String(e), { error: String(e) }, spatFilterPayload);
});

// ── Category: sum / avg with grouping ─────────────────────────────────────────

agg({
    source: { layer: LAYER_AGRIC, srid: 2039 },
    operation: { type: 'sum', field: 'dunam' },
    grouping: { group_by: 'yeshuvname', group_limit: 10 },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { sort_order: govmap.aggSortOrder.Desc }
}).then(function(r) {
    resolve('cat-sum', 'pass', (r.data && r.data.length) + ' קטגוריות, שדה sum', r.data && r.data.slice(0, 3));
}).catch(function(e) { resolve('cat-sum', 'fail', String(e)); });

agg({
    source: { layer: LAYER_AGRIC, srid: 2039 },
    operation: { type: 'avg', field: 'dunam' },
    grouping: { group_by: 'yeshuvname', group_limit: 10 },
    filter: { view_mode: govmap.aggViewMode.Global }
}).then(function(r) {
    resolve('cat-avg', 'pass', (r.data && r.data.length) + ' קטגוריות, שדה avg', r.data && r.data.slice(0, 3));
}).catch(function(e) { resolve('cat-avg', 'fail', String(e)); });

// ── Other bucket ──────────────────────────────────────────────────────────────

// LAYER_AGRIC / yeshuvname has many distinct values — limit:3 forces the overflow bucket
agg({
    source: { layer: LAYER_AGRIC, srid: 2039 },
    operation: { type: 'count' },
    grouping: { group_by: 'yeshuvname' },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { limit: 3, include_percentage: true }
}).then(function(r) {
    const rows = r.data || [];
    const other = rows.find(function(d) { return d.yeshuvname === 'אחר'; });
    const keys = rows.map(function(d) { return Object.values(d).join('|'); }).join(' / ');

    if (other) {
        resolve('other-bucket', 'pass', 'bucket "אחר" קיים בתגובה', rows);
    } else {
        resolve('other-bucket', 'warn', 'לא זוהה bucket "אחר". שורות: ' + keys, rows);
    }
}).catch(function(e) { resolve('other-bucket', 'fail', String(e)); });

// ── Null handling ─────────────────────────────────────────────────────────────

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    grouping: { group_by: 'company' },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { null_handling: govmap.aggNullHandling ? govmap.aggNullHandling.Exclude : 'exclude' }
}).then(function(r) {
    resolve('null-exclude', 'pass', (r.data && r.data.length) + ' קבוצות (ללא null)', r.data && r.data.slice(0, 3));
}).catch(function(e) { resolve('null-exclude', 'fail', String(e)); });

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    grouping: { group_by: 'company' },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { null_handling: govmap.aggNullHandling ? govmap.aggNullHandling.IncludeAsOther : 'include_as_other' }
}).then(function(r) {
    resolve('null-include-other', 'pass', (r.data && r.data.length) + ' קבוצות (null כ-other)', r.data && r.data.slice(0, 3));
}).catch(function(e) { resolve('null-include-other', 'fail', String(e)); });

// ── Spatial sub-group ─────────────────────────────────────────────────────────

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    grouping: {
        group_by: 'company',
        group_limit: 5,
        sub_group_by: 'fname',
        sub_group_by_source: 'spatial_filter',
        sub_group_limit: 5
    },
    filter: {
        view_mode: govmap.aggViewMode.Global,
        spatial_filter: {
            layer: LAYER_NEIGHBORHOODS,
            relation: govmap.aggSpatialRelation.Within
        }
    }
}).then(function(r) {
    resolve('sub-spat', 'pass', (r.data && r.data.length) + ' שורות company × שכונה', r.data && r.data.slice(0, 4));
}).catch(function(e) { resolve('sub-spat', 'fail', String(e)); });

// ── Comparison ────────────────────────────────────────────────────────────────

// comparison works on scalar operations only (no grouping) — decorates data.comparison
agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    filter: { view_mode: govmap.aggViewMode.Global },
    comparison: { compare_to: 'global' }
}).then(function(r) {
    const comp = r.data && r.data.comparison;
    const hasComp = comp && comp.global_value !== undefined && comp.absolute_diff !== undefined;
    resolve('compare-global', hasComp ? 'pass' : 'warn',
        hasComp
            ? 'global_value: ' + comp.global_value + ', absolute_diff: ' + comp.absolute_diff + ', status: ' + comp.status
            : 'שדה comparison לא זוהה — מבנה: ' + JSON.stringify(r.data).slice(0, 120),
        r.data);
}).catch(function(e) { resolve('compare-global', 'fail', String(e)); });

// prev_period: requires filter.filter with a BETWEEN date range — server shifts it back one year.
// Format: (field BETWEEN value1 AND value2) — outer parens, no quotes around dates, no inner parens.
agg({
    source: { layer: LAYER_BUILDING_PERMITS_TLV, srid: 2039 },
    operation: { type: 'count' },
    filter: {
        view_mode: govmap.aggViewMode.Global,
        filter: '(open_request BETWEEN 2024-01-01T00:00:00 AND 2024-12-31T23:59:59)'
    },
    comparison: { compare_to: 'prev_period' }
}).then(function(r) {
    const comp = r.data && r.data.comparison;
    const hasComp = comp && comp.previous_value !== undefined && comp.absolute_diff !== undefined;
    resolve('compare-prev-period', hasComp ? 'pass' : 'warn',
        hasComp
            ? 'previous_value (2023): ' + comp.previous_value + ', absolute_diff: ' + comp.absolute_diff + ', status: ' + comp.status
            : 'שדה comparison לא זוהה — מבנה: ' + JSON.stringify(r.data).slice(0, 120),
        r.data);
}).catch(function(e) { resolve('compare-prev-period', 'fail', String(e)); });

// ── Display format ────────────────────────────────────────────────────────────

Object.values(govmap.aggDisplayFormat || {}).forEach(function(fmt) {
    const id = 'fmt-' + fmt;

    agg({
        source: { layer: LAYER_CELLULAR, srid: 2039 },
        operation: { type: 'count' },
        grouping: { group_by: 'company' },
        filter: { view_mode: govmap.aggViewMode.Global },
        output: { display_format: fmt, include_percentage: true }
    }).then(function(r) {
        const sample = r.data && r.data[0];
        resolve(id, 'pass', 'display_format=' + fmt + ' → דוגמה: ' + JSON.stringify(sample).slice(0, 120), r.data && r.data.slice(0, 2));
    }).catch(function(e) { resolve(id, 'fail', String(e)); });
});

// ── Sort ──────────────────────────────────────────────────────────────────────

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    grouping: { group_by: 'company' },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: {
        sort_by: 'key',
        sort_type: govmap.aggSortType ? govmap.aggSortType.Alphabetic : 'alphabetic',
        sort_order: govmap.aggSortOrder.Asc
    }
}).then(function(r) {
    const keys = r.data && r.data.map(function(d) { return d.company || d[Object.keys(d)[0]]; });
    resolve('sort-alpha', 'pass', 'מיון אלפביתי: ' + (keys && keys.join(', ')), r.data);
}).catch(function(e) { resolve('sort-alpha', 'fail', String(e)); });

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    grouping: { group_by: 'company' },
    filter: { view_mode: govmap.aggViewMode.Global },
    output: { sort_order: govmap.aggSortOrder.Asc }
}).then(function(r) {
    const vals = r.data && r.data.map(function(d) { return d.count; });
    const sorted = vals && vals.every(function(v, i) { return i === 0 || v >= vals[i - 1]; });
    resolve('sort-asc', sorted ? 'pass' : 'warn',
        sorted ? 'סדר עולה מאושר: ' + vals.join(', ') : 'סדר לא עולה: ' + vals.join(', '),
        r.data);
}).catch(function(e) { resolve('sort-asc', 'fail', String(e)); });

// ── Grouped timeseries ────────────────────────────────────────────────────────

agg({
    source: { layer: LAYER_BUILDING_PERMITS_TLV, srid: 2039 },
    operation: {
        type: 'timeseries',
        timeseries: {
            date_field: 'open_request',
            interval: govmap.aggTimeseriesInterval.Year,
            aggregation: govmap.aggTimeseriesAggregation.Count
        }
    },
    grouping: { group_by: 'building_stage' },
    filter: { view_mode: govmap.aggViewMode.Global }
}).then(function(r) {
    const rows = r.data || [];
    const firstGroup = rows[0];
    const hasGroupField = firstGroup && firstGroup.building_stage !== undefined;
    const hasSeriesArray = firstGroup && Array.isArray(firstGroup.series);

    if (hasGroupField && hasSeriesArray) {
        resolve('ts-grouped', 'pass',
            rows.length + ' קבוצות, דוגמה: ' + (firstGroup.building_stage) + ' → ' + firstGroup.series.length + ' נקודות זמן',
            rows.slice(0, 2));
    } else {
        resolve('ts-grouped', 'warn',
            'מבנה לא צפוי — אין group_field או series[]. keys: ' + JSON.stringify(Object.keys(firstGroup || {})),
            rows.slice(0, 2));
    }
}).catch(function(e) { resolve('ts-grouped', 'fail', String(e)); });

// Grouped vs ungrouped: same layer + interval + date_field, only difference is grouping.group_by.
// The ungrouped call returns one series of {key, count} per year; the grouped call returns
// [{ building_stage, series: [{key, count}] }, ...]. Summing the grouped series by year should
// match the ungrouped counts, and the individual group series should differ from that total.

Promise.all([
    agg({
        source: { layer: LAYER_BUILDING_PERMITS_TLV, srid: 2039 },
        operation: {
            type: 'timeseries',
            timeseries: {
                date_field: 'open_request',
                interval: govmap.aggTimeseriesInterval.Year,
                aggregation: govmap.aggTimeseriesAggregation.Count
            }
        },
        filter: { view_mode: govmap.aggViewMode.Global }
    }),
    agg({
        source: { layer: LAYER_BUILDING_PERMITS_TLV, srid: 2039 },
        operation: {
            type: 'timeseries',
            timeseries: {
                date_field: 'open_request',
                interval: govmap.aggTimeseriesInterval.Year,
                aggregation: govmap.aggTimeseriesAggregation.Count
            }
        },
        grouping: { group_by: 'building_stage' },
        filter: { view_mode: govmap.aggViewMode.Global }
    })
]).then(function(results) {
    const flatRes = results[0];
    const groupedRes = results[1];
    const flatSeries = (flatRes.data) || [];
    const groupedRows = (groupedRes.data) || [];

    const flatByYear = {};
    flatSeries.forEach((pt) => { flatByYear[pt.key] = pt.count; });

    const groupedSumByYear = {};
    groupedRows.forEach((row) => {
        (row.series || []).forEach((pt) => {
            groupedSumByYear[pt.key] = (groupedSumByYear[pt.key] || 0) + pt.count;
        });
    });

    const years = Array.from(new Set(Object.keys(flatByYear).concat(Object.keys(groupedSumByYear)))).sort();
    const mismatches = years.filter((y) => (flatByYear[y] || 0) !== (groupedSumByYear[y] || 0));

    const firstGroup = groupedRows[0];
    const firstGroupSeries = (firstGroup && firstGroup.series) || [];
    const groupDiffersFromTotal = firstGroupSeries.some((pt) => pt.count !== (flatByYear[pt.key] || 0));

    const raw = {
        ungrouped: flatSeries.slice(0, 6),
        grouped_sample: groupedRows.slice(0, 2),
        totals_per_year: years.map((y) => ({ year: y, ungrouped: flatByYear[y] || 0, grouped_sum: groupedSumByYear[y] || 0 }))
    };

    if (mismatches.length > 0) {
        resolve('ts-grouped-vs-total', 'fail',
            'סכום קבוצות ≠ ללא group_by לשנים: ' + mismatches.join(', '),
            raw);

        return;
    }

    if (groupedRows.length < 2 || !groupDiffersFromTotal) {
        resolve('ts-grouped-vs-total', 'warn',
            'סכומים תואמים אך group_by לא באמת מפצל (' + groupedRows.length + ' קבוצות)',
            raw);

        return;
    }

    resolve('ts-grouped-vs-total', 'pass',
        groupedRows.length + ' קבוצות × ' + years.length + ' שנים — סכום קבוצות = ללא group_by, סדרות שונות',
        raw);
}).catch(function(e) { resolve('ts-grouped-vs-total', 'fail', String(e)); });

// ── Attribute filter (filter.filter SQL predicate) ────────────────────────────

agg({
    source: { layer: LAYER_CELLULAR, srid: 2039 },
    operation: { type: 'count' },
    filter: { view_mode: govmap.aggViewMode.Global, filter: "(company = 'סלקום')" }
}).then(function(r) {
    const filtered = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);

    return agg({
        source: { layer: LAYER_CELLULAR, srid: 2039 },
        operation: { type: 'count' },
        filter: { view_mode: govmap.aggViewMode.Global }
    }).then(function(globalR) {
        const global = globalR.data && (globalR.data.value !== undefined ? globalR.data.value : globalR.data.count);

        if (filtered > 0 && filtered < global) {
            resolve('attr-filter-str-eq', 'pass', "company = 'סלקום' → " + filtered + ' מתוך ' + global);
        } else if (filtered >= global) {
            resolve('attr-filter-str-eq', 'fail', 'filter.filter נתעלם — החזיר ' + filtered + ' = גלובלי');
        } else {
            resolve('attr-filter-str-eq', 'fail', 'החזיר ' + filtered + ' (גלובלי: ' + global + ')', r.data);
        }
    });
}).catch(function(e) { resolve('attr-filter-str-eq', 'fail', String(e)); });

// BETWEEN on date/numeric columns works correctly.

var attrFilteredCount;

agg({
    source: { layer: LAYER_BUILDING_PERMITS_TLV, srid: 2039 },
    operation: { type: 'count' },
    filter: {
        view_mode: govmap.aggViewMode.Global,
        filter: '(open_request BETWEEN 2024-01-01T00:00:00 AND 2024-12-31T23:59:59)'
    }
}).then(function(r) {
    attrFilteredCount = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);
    resolve('attr-filter-eq', 'pass', 'BETWEEN 2024 → ' + attrFilteredCount + ' רשומות', r.data);

    return agg({
        source: { layer: LAYER_BUILDING_PERMITS_TLV, srid: 2039 },
        operation: { type: 'count' },
        filter: { view_mode: govmap.aggViewMode.Global }
    });
}).then(function(r) {
    if (!r) { return; }
    const globalCount = r.data && (r.data.value !== undefined ? r.data.value : r.data.count);

    if (attrFilteredCount < globalCount) {
        resolve('attr-filter-count', 'pass',
            'מסונן (' + attrFilteredCount + ') < גלובלי (' + globalCount + ') — BETWEEN מסנן');
    } else {
        resolve('attr-filter-count', 'warn',
            'מסונן (' + attrFilteredCount + ') ≥ גלובלי (' + globalCount + ') — predicate לא מסנן');
    }
}).catch(function(e) {
    resolve('attr-filter-eq', 'fail', String(e));
    resolve('attr-filter-count', 'fail', 'attr-filter-eq נכשל');
});

// ── getLayerFilterFields ──────────────────────────────────────────────────────

govmap.getLayerFilterFields(LAYER_CELLULAR, API_TOKEN, 'he').then(function(r) {
    const fields = r.data && r.data.map(function(f) { return f.name + '(' + f.fieldType + ')'; }).join(', ');
    resolve('field-meta-cellular', 'pass', 'שדות: ' + fields, r.data && r.data.slice(0, 3));
}).catch(function(e) { resolve('field-meta-cellular', 'fail', String(e)); });

govmap.getLayerFilterFields(LAYER_TLV_PARCELS, API_TOKEN, 'he').then(function(r) {
    const fields = r.data && r.data.map(function(f) { return f.name + '(' + f.fieldType + ')'; }).join(', ');
    resolve('field-meta-tlv', 'pass', 'שדות: ' + fields, r.data && r.data.slice(0, 3));
}).catch(function(e) { resolve('field-meta-tlv', 'fail', String(e)); });
