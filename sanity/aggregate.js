function initAggregate() {
    populateAggregationOperationTypes();
    populateAggregationSrids();
    populateAggregationEnumSelects();
    setupAggregatePanel();
    setupOperationTypeToggle();
    setupViewModeToggle();
    setupClearLog();
}

const AGGREGATE_OPERATION_TYPES = new Set([
    'count',
    'sum',
    'avg',
    'min',
    'max',
    'range',
    'histogram',
    'timeseries',
    'table'
]);

const OPERATION_TYPES_REQUIRING_FIELD = new Set([
    'sum',
    'avg',
    'min',
    'max',
    'range',
    'histogram'
]);

let supportedAggregationOperationTypes = new Set(AGGREGATE_OPERATION_TYPES);
let supportedTimeseriesAggregations = new Set(['count', 'sum', 'avg', 'min', 'max']);

function normalizeOperationType(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeTimeseriesAggregation(value) {
    const normalized = String(value || '').trim().toLowerCase();

    if (!normalized) {
        return '';
    }

    for (const aggregation of supportedTimeseriesAggregations) {

        if (normalized === aggregation || normalized.startsWith(aggregation)) {
            return aggregation;
        }
    }

    return normalized;
}

function operationTypeRequiresField(operationType, timeseriesAggregation) {

    if (OPERATION_TYPES_REQUIRING_FIELD.has(operationType)) {
        return true;
    }

    if (operationType !== 'timeseries') {
        return false;
    }

    return true;
}

function populateAggregationOperationTypes() {
    const sel = document.getElementById('aggOperationType');

    if (!sel || typeof govmap === 'undefined' || !govmap.aggOperationType) {
        return;
    }

    const map = govmap.aggOperationType;
    const previous = sel.value;

    sel.replaceChildren();

    for (const [label, value] of Object.entries(map)) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;

        sel.appendChild(opt);
    }

    supportedAggregationOperationTypes = new Set(
        [...sel.options].map((option) => normalizeOperationType(option.value)).filter(Boolean)
    );

    if (previous && [...sel.options].some((o) => o.value === previous)) {
        sel.value = previous;
    }
}

function populateSelectFromGovmapEnum(selectId, enumName, withEmptyOption) {
    const select = document.getElementById(selectId);
    const enumMap = typeof govmap === 'undefined' ? null : govmap[enumName];

    if (!select || !enumMap || typeof enumMap !== 'object') {
        return;
    }

    const previous = String(select.value || '').trim();
    const previousEmptyOption = select.querySelector('option[value=""]');
    const emptyLabel = previousEmptyOption ? previousEmptyOption.textContent : '';

    select.replaceChildren();

    if (withEmptyOption) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = emptyLabel || '(ללא)';

        select.appendChild(emptyOption);
    }

    for (const [label, value] of Object.entries(enumMap)) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = label;

        select.appendChild(option);
    }

    if (previous && [...select.options].some((option) => option.value === previous)) {
        select.value = previous;
    }
}

function populateAggregationEnumSelects() {
    populateSelectFromGovmapEnum('aggTimeseriesInterval', 'aggTimeseriesInterval', false);
    populateSelectFromGovmapEnum('aggTimeseriesAggregation', 'aggTimeseriesAggregation', false);
    populateSelectFromGovmapEnum('aggFilterViewMode', 'aggViewMode', false);
    populateSelectFromGovmapEnum('aggSpatialFilterRelation', 'aggSpatialRelation', true);
    populateSelectFromGovmapEnum('aggSpatialFilterLogic', 'aggSpatialLogic', true);
    populateSelectFromGovmapEnum('aggCompareTo', 'aggCompareTo', true);
    populateSelectFromGovmapEnum('aggOutputSortType', 'aggSortType', true);
    populateSelectFromGovmapEnum('aggOutputSortOrder', 'aggSortOrder', true);
    populateSelectFromGovmapEnum('aggOutputDisplayFormat', 'aggDisplayFormat', true);
    populateSelectFromGovmapEnum('aggOutputNullHandling', 'aggNullHandling', false);

    const timeseriesAggregationEl = document.getElementById('aggTimeseriesAggregation');

    if (!timeseriesAggregationEl) {
        return;
    }

    supportedTimeseriesAggregations = new Set(
        [...timeseriesAggregationEl.options].map((option) => normalizeTimeseriesAggregation(option.value)).filter(Boolean)
    );
}

function populateAggregationSrids() {
    const sel = document.getElementById('aggSourceSrid');

    if (!sel || typeof govmap === 'undefined' || !govmap.aggSrid) {
        return;
    }

    const map = govmap.aggSrid;
    const previous = sel.value;
    const aggSridKeys = ['Wgs84', 'WebMercator', 'Itm'];
    const defaultSrid = map.Wgs84;
    let defaultHint = '';

    if (defaultSrid !== undefined) {
        defaultHint = ` — ברירת מחדל Wgs84 / ${defaultSrid}`;
    }

    sel.replaceChildren();

    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = `(השאר ריק${defaultHint})`;

    sel.appendChild(emptyOpt);

    for (const label of aggSridKeys) {
        const value = map[label];

        if (value === undefined) {
            continue;
        }

        const opt = document.createElement('option');
        opt.value = String(value);
        opt.textContent = `${label} (${value})`;

        sel.appendChild(opt);
    }

    if (previous && [...sel.options].some((o) => o.value === previous)) {
        sel.value = previous;
    }
}

function setupOperationTypeToggle() {
    const typeEl = document.getElementById('aggOperationType');
    const fieldBlock = document.getElementById('aggBlockOperationField');
    const fieldsBlock = document.getElementById('aggBlockOperationFields');
    const histogramBlock = document.getElementById('aggBlockHistogram');
    const timeseriesBlock = document.getElementById('aggBlockTimeseries');
    const timeseriesAggregationEl = document.getElementById('aggTimeseriesAggregation');

    if (!typeEl || !fieldBlock || !fieldsBlock || !histogramBlock || !timeseriesBlock || !timeseriesAggregationEl) {
        return;
    }

    const apply = () => {
        const operationType = normalizeOperationType(typeEl.value);
        const timeseriesAggregation = normalizeTimeseriesAggregation(timeseriesAggregationEl.value);
        const needsField = operationTypeRequiresField(operationType, timeseriesAggregation);

        fieldBlock.classList.toggle('hidden', !needsField);
        fieldsBlock.classList.toggle('hidden', operationType !== 'table');
        histogramBlock.classList.toggle('hidden', operationType !== 'histogram');
        timeseriesBlock.classList.toggle('hidden', operationType !== 'timeseries');
    };

    typeEl.addEventListener('change', apply);
    timeseriesAggregationEl.addEventListener('change', apply);
    apply();
}

function setupViewModeToggle() {
    const viewModeEl = document.getElementById('aggFilterViewMode');
    const minX = document.getElementById('aggBboxMinX');
    const minY = document.getElementById('aggBboxMinY');
    const maxX = document.getElementById('aggBboxMaxX');
    const maxY = document.getElementById('aggBboxMaxY');

    if (!viewModeEl || !minX || !minY || !maxX || !maxY) {
        return;
    }

    const bboxInputs = [minX, minY, maxX, maxY];

    const apply = () => {
        const isExtent = viewModeEl.value === 'extent';

        for (const el of bboxInputs) {
            el.disabled = !isExtent;
        }
    };

    viewModeEl.addEventListener('change', apply);
    apply();
}

function setupClearLog() {
    const btnClearLog = document.getElementById('btnClearLog');
    const eventLog = document.getElementById('eventLog');

    if (!btnClearLog || !eventLog) {
        return;
    }

    btnClearLog.addEventListener('click', () => {
        eventLog.textContent = '';
    });
}

function setupAggregatePanel() {
    const btn = document.getElementById('btnAggregate');

    if (!btn) {
        return;
    }

    btn.addEventListener('click', () => {
        const built = buildAggregateParams();

        if (built.error) {
            logEvent('aggregate error', { message: built.error });

            return;
        }

        const params = built.params;

        logEvent('aggregate request', params);

        govmap.aggregate(params).then((response) => {
            const apiError = extractAggregateApiError(response);

            if (apiError) {
                logEvent('aggregate error', { message: apiError, response });

                return;
            }

            logEvent('aggregate', response);
        }).catch((err) => {
            const apiError = extractAggregateTransportError(err);
            const fallbackError = String((err && err.message) || err);
            const message = apiError || fallbackError;

            logEvent('aggregate error', { message });
        });
    });
}

function extractAggregateApiError(response) {

    if (!response || typeof response !== 'object') {
        return '';
    }

    if (!Object.prototype.hasOwnProperty.call(response, 'error')) {
        return '';
    }

    if (typeof response.error === 'string') {
        return response.error;
    }

    if (response.error && typeof response.error === 'object' && typeof response.error.message === 'string') {
        return response.error.message;
    }

    return '';
}

function extractAggregateTransportError(err) {
    const candidates = [
        err && err.response && err.response.data,
        tryParseJson(err && err.request && err.request.responseText),
        tryParseJson(err && err.request && err.request.response),
        err && err.data
    ];

    for (const candidate of candidates) {
        const candidateError = extractAggregateApiError(candidate);

        if (candidateError) {
            return candidateError;
        }
    }

    return '';
}

function tryParseJson(value) {

    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch (_parseError) {
        return null;
    }
}

/**
 * @returns {{ params: object } | { error: string }}
 */
function buildAggregateParams() {
    const layer = document.getElementById('aggSourceLayer').value.trim();

    if (!layer) {
        return { error: 'source.layer is required' };
    }

    const operationType = normalizeOperationType(document.getElementById('aggOperationType').value);
    const operation = { type: operationType };
    const timeseriesAggregation = normalizeTimeseriesAggregation(document.getElementById('aggTimeseriesAggregation').value);

    if (!supportedAggregationOperationTypes.has(operationType)) {
        return { error: 'operation.type is invalid: ' + operationType };
    }

    if (operationTypeRequiresField(operationType, timeseriesAggregation)) {
        const field = document.getElementById('aggOperationField').value.trim();

        if (!field) {
            return { error: 'operation.field is required for operation type ' + operationType };
        }

        operation.field = field;
    }

    if (operationType === 'histogram') {
        const buckets = Number(document.getElementById('aggHistogramBuckets').value);

        if (!Number.isFinite(buckets) || buckets < 2 || buckets > 50) {
            return { error: 'histogram.buckets must be a number between 2 and 50' };
        }

        operation.histogram = { buckets };
    }

    if (operationType === 'timeseries') {
        const dateField = document.getElementById('aggTimeseriesDateField').value.trim();
        const interval = document.getElementById('aggTimeseriesInterval').value;
        const aggregation = timeseriesAggregation;

        if (!dateField) {
            return { error: 'timeseries.date_field is required' };
        }

        if (!supportedTimeseriesAggregations.has(aggregation)) {
            return { error: 'timeseries.aggregation is invalid: ' + aggregation };
        }

        operation.timeseries = { date_field: dateField, interval };

        if (aggregation && aggregation !== 'count') {
            operation.timeseries.aggregation = aggregation;
        }
    }

    if (operationType === 'table') {
        const fieldsRaw = document.getElementById('aggOperationFields').value.trim();
        const fields = fieldsRaw.split(',').map((s) => s.trim()).filter(Boolean);

        if (fields.length === 0) {
            return { error: 'operation.fields is required for table (comma-separated)' };
        }

        operation.fields = fields;
    }

    const source = { layer };
    const sridRaw = document.getElementById('aggSourceSrid').value.trim();

    if (sridRaw) {
        const srid = Number(sridRaw);

        if (!Number.isFinite(srid)) {
            return { error: 'source.srid must be a number' };
        }

        source.srid = srid;
    }

    const filterBuilt = buildAggregateFilter();

    if (filterBuilt.error) {
        return { error: filterBuilt.error };
    }

    const groupingBuilt = buildAggregateGrouping();

    if (groupingBuilt.error) {
        return { error: groupingBuilt.error };
    }

    const params = {
        apiKey: GOVMAP_TOKEN,
        source,
        operation
    };

    if (filterBuilt.filter) {
        params.filter = filterBuilt.filter;
    }

    if (groupingBuilt.grouping) {
        params.grouping = groupingBuilt.grouping;
    }

    const comparison = buildAggregateComparison();

    if (comparison) {
        params.comparison = comparison;
    }

    const outputBuilt = buildAggregateOutput();

    if (outputBuilt.error) {
        return { error: outputBuilt.error };
    }

    if (outputBuilt.output) {
        params.output = outputBuilt.output;
    }

    return { params };
}

/**
 * @returns {{ filter?: object, error?: string }}
 */
function buildAggregateFilter() {
    const filterText = document.getElementById('aggFilterExpression').value.trim();
    const viewMode = document.getElementById('aggFilterViewMode').value;
    const minX = Number(document.getElementById('aggBboxMinX').value);
    const minY = Number(document.getElementById('aggBboxMinY').value);
    const maxX = Number(document.getElementById('aggBboxMaxX').value);
    const maxY = Number(document.getElementById('aggBboxMaxY').value);

    const spatialLayer = document.getElementById('aggSpatialFilterLayer').value.trim();
    const spatialRelation = document.getElementById('aggSpatialFilterRelation').value.trim();
    const spatialBufferRaw = document.getElementById('aggSpatialFilterBuffer').value.trim();
    const spatialLogic = document.getElementById('aggSpatialFilterLogic').value.trim();

    const filterObj = {};

    if (filterText) {
        filterObj.filter = filterText;
    }

    if (viewMode === 'extent') {
        filterObj.view_mode = 'extent';

        if (![minX, minY, maxX, maxY].every((n) => Number.isFinite(n))) {
            return { error: 'view_mode=extent requires four valid numeric bbox values' };
        }

        filterObj.bbox = [minX, minY, maxX, maxY];
    }

    const hasSpatialInput = Boolean(spatialLayer || spatialRelation || spatialBufferRaw || spatialLogic);

    if (hasSpatialInput) {

        if (!spatialLayer || !spatialRelation) {
            return { error: 'spatial_filter requires both layer and relation when any spatial filter field is set' };
        }

        const spatial_filter = { layer: spatialLayer, relation: spatialRelation };

        if (spatialBufferRaw) {
            const buffer = Number(spatialBufferRaw);

            if (!Number.isFinite(buffer) || buffer < 0) {
                return { error: 'spatial_filter.buffer must be a number >= 0' };
            }

            spatial_filter.buffer = buffer;
        }

        if (spatialLogic === 'centroid' || spatialLogic === 'proportion') {
            spatial_filter.logic = spatialLogic;
        }

        filterObj.spatial_filter = spatial_filter;
    }

    if (Object.keys(filterObj).length === 0) {
        return {};
    }

    return { filter: filterObj };
}

/**
 * @returns {{ grouping?: object, error?: string }}
 */
function buildAggregateGrouping() {
    const groupBy = document.getElementById('aggGroupBy').value.trim();
    const subGroupBy = document.getElementById('aggSubGroupBy').value.trim();

    if (!groupBy && !subGroupBy) {
        return {};
    }

    const grouping = {};

    if (groupBy) {
        grouping.group_by = groupBy;
    }

    if (subGroupBy) {
        grouping.sub_group_by = subGroupBy;
    }

    if (subGroupBy && !groupBy) {
        return { error: 'sub_group_by requires group_by' };
    }

    return { grouping };
}

function buildAggregateComparison() {
    const compareTo = document.getElementById('aggCompareTo').value;

    if (compareTo !== 'global' && compareTo !== 'prev_period') {
        return null;
    }

    return { compare_to: compareTo };
}

/**
 * @returns {{ output: object | null, error?: string }}
 */
function buildAggregateOutput() {
    const limitRaw = document.getElementById('aggOutputLimit').value.trim();
    const includePercentage = document.getElementById('aggOutputIncludePercentage').checked;
    const sortBy = document.getElementById('aggOutputSortBy').value.trim();
    const sortType = document.getElementById('aggOutputSortType').value;
    const sortOrder = document.getElementById('aggOutputSortOrder').value;
    const displayFormat = document.getElementById('aggOutputDisplayFormat').value;
    const nullHandling = document.getElementById('aggOutputNullHandling').value;
    const pageToken = document.getElementById('aggOutputPageToken').value.trim();

    const output = {};

    if (limitRaw) {
        const limit = Number(limitRaw);

        if (!Number.isFinite(limit)) {
            return { output: null, error: 'output.limit must be a finite number' };
        }

        output.limit = limit;
    }

    if (includePercentage) {
        output.include_percentage = true;
    }

    if (sortBy) {
        output.sort_by = sortBy;
    }

    if (sortType === 'numeric' || sortType === 'alphabetic') {
        output.sort_type = sortType;
    }

    if (sortOrder === 'asc' || sortOrder === 'desc') {
        output.sort_order = sortOrder;
    }

    if (displayFormat) {
        output.display_format = displayFormat;
    }

    if (nullHandling === 'exclude') {
        output.null_handling = 'exclude';
    }

    if (pageToken) {
        output.page_token = pageToken;
    }

    if (Object.keys(output).length === 0) {
        return { output: null };
    }

    return { output };
}

function logEvent(name, data) {
    const el = document.getElementById('eventLog');

    if (!el) {
        return;
    }

    const line = '[' + new Date().toISOString() + '] ' + name + ': ' + JSON.stringify(data, null, 2);
    el.textContent = (el.textContent ? el.textContent + '\n\n' : '') + line;
    el.scrollTop = el.scrollHeight;
}
