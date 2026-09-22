// Test suite for aggregate API
let testResults = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let pendingTests = 0;
let subGroupCalibrationData = null;

// Validators for histogram and jenks percentage calculations
// Server returns percentages rounded to 2 decimal places
// Validates that:
// 1. Sum of counts is correct
// 2. Individual percentages are mathematically accurate (within rounding tolerance)
// 3. Percentages sum to exactly 100%
function validatePercentages(response) {
    if (!response.data || !Array.isArray(response.data)) {
        return { valid: false, message: 'Response data is not an array' };
    }

    const issues = [];

    // Calculate total count: Σ count_i
    const totalCount = response.data.reduce((sum, item) => sum + (item.count || 0), 0);

    if (totalCount === 0) {
        return { valid: false, message: 'Total count is 0' };
    }

    let percentageSum = 0;

    response.data.forEach((item, index) => {
        const count = item.count || 0;
        const givenPercentage = item.percentage;

        // Calculate exact percentage: (count_i / total_count) × 100
        const exactPercentage = (count / totalCount) * 100;

        // Calculate expected rounded percentage (2 decimal places)
        const roundedPercentage = Math.round(exactPercentage * 100) / 100;

        // Validate percentage accuracy
        // Condition A: Standard rounding match
        if (Math.abs(givenPercentage - roundedPercentage) < 0.001) {
            // Pass: Standard rounding (includes valid 0% for very small counts)
        }
        // Condition B: Constrained rounding exception (±0.01% tolerance)
        // Server may adjust by ±0.01% to ensure sum equals 100%
        else if (Math.abs(givenPercentage - exactPercentage) <= 0.01) {
            // Pass: Within constrained rounding tolerance
        }
        else {
            const diff = Math.abs(givenPercentage - exactPercentage);
            issues.push(
                `Bucket ${index}: percentage=${givenPercentage}%, ` +
                `exact=${exactPercentage.toFixed(4)}%, ` +
                `rounded=${roundedPercentage.toFixed(2)}%, ` +
                `diff=${diff.toFixed(4)}% (exceeds ±0.01% tolerance)`
            );
        }

        percentageSum += givenPercentage;
    });

    // Verify percentage sum equals 100%: Σ percentage_i == 100.0
    // Allow micro floating-point variance (±0.01)
    const percentageDiff = Math.abs(percentageSum - 100);
    if (percentageDiff > 0.01) {
        issues.push(`Percentage sum is ${percentageSum.toFixed(2)}%, expected 100.00%`);
    }

    if (issues.length > 0) {
        return { valid: false, message: issues.join('; ') };
    }

    return { valid: true };
}

// Test case definition
function createTestCase(name, category, requestBody, expectedStatus, shouldPass, validator) {
    return {
        name: name,
        category: category,
        requestBody: requestBody,
        expectedStatus: expectedStatus,
        shouldPass: shouldPass,
        validator: validator || null
    };
}

// Generate all test cases
function generateTestCases() {
    const tests = [];

    // ===== VALID TESTS - COUNT OPERATIONS FOR ALL LAYERS =====

    // Cellular - Count by company
    tests.push(createTestCase(
        'Count - Cellular antennas by company',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.CELLULAR.id, srid: 2039 },
            operation: { type: 'count' },
            grouping: { group_by: 'company' },
            output: { include_percentage: true, limit: 100 },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        (response) => {
            return response.data && Array.isArray(response.data) && response.data.length > 0;
        }
    ));

    // TLV Parcels - Count by land use
    tests.push(createTestCase(
        'Count - TLV parcels by land use',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: { type: 'count' },
            grouping: { group_by: 't_yeud_karka' },
            output: { include_percentage: true, limit: 100 },
            filter: { view_mode: 'extent', bbox: CONFIG.BBOX_SAMPLES[2] }
        },
        200,
        true,
        (response) => {
            return response.data && Array.isArray(response.data) && response.data.length > 0;
        }
    ));

    // Agricultural - Count by settlement
    tests.push(createTestCase(
        'Count - Agricultural parcels by settlement',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: { type: 'count' },
            grouping: { group_by: 'yeshuvname' },
            output: { include_percentage: true, limit: 100 },
            filter: { view_mode: 'extent', bbox: CONFIG.BBOX_SAMPLES[0] }
        },
        200,
        true,
        (response) => {
            return response.data && Array.isArray(response.data) && response.data.length > 0;
        }
    ));

    // ===== VALID TESTS - output.null_handling (govmap.aggNullHandling) =====
    // null_handling applies to operations with a field (sum, avg, histogram, jenks)
    // - exclude: WHERE field IS NOT NULL (skip rows where the field is null)
    // - include_as_other: include all rows (nulls won't contribute to numeric aggregates)
    // Using AGRIC_PARCELS / dunam (null values set on DEV for testing; test skipped if layer unavailable)
    nullHandlingExcludeData = {};

    const agric = CONFIG.LAYERS.AGRIC_PARCELS;

    if (agric && agric.id) {
        const field = 'dunam';

        tests.push(createTestCase(
            'aggNullHandling.Exclude - AGRIC_PARCELS avg(dunam) WHERE dunam IS NOT NULL',
            'valid',
            {
                source: { layer: agric.id, srid: 2039 },
                operation: { type: 'avg', field: field },
                output: {
                    null_handling: 'exclude'
                },
                filter: { view_mode: 'global' }
            },
            200,
            true,
            ((response) => {
                if (!response.data) {
                    return { valid: false, message: 'Response data is null' };
                }

                const value = response.data.value;
                const count = response.data.count;

                if (typeof value !== 'number' || value < 0) {
                    return { valid: false, message: `Expected non-negative avg, got: ${value}` };
                }

                nullHandlingExcludeData[field] = { value: value, count: count };

                return true;
            })
        ));

        tests.push(createTestCase(
            'aggNullHandling.IncludeAsOther - AGRIC_PARCELS avg(dunam) (all rows, nulls excluded from avg)',
            'valid',
            {
                source: { layer: agric.id, srid: 2039 },
                operation: { type: 'avg', field: field },
                output: {
                    null_handling: 'include_as_other'
                },
                filter: { view_mode: 'global' }
            },
            200,
            true,
            ((response) => {
                if (!response.data) {
                    return { valid: false, message: 'Response data is null' };
                }

                const value = response.data.value;
                const count = response.data.count;
                const exclude = nullHandlingExcludeData[field];

                if (typeof value !== 'number' || value < 0) {
                    return { valid: false, message: `Expected non-negative avg, got: ${value}` };
                }

                // IncludeAsOther count should be HIGHER (includes rows with null dunam, even though they don't affect the avg)
                if (exclude && count <= exclude.count) {
                    return {
                        valid: false,
                        message: `IncludeAsOther count (${count}) should be > Exclude count (${exclude.count}). ` +
                            `null_handling: include_as_other should count all rows (including those with null dunam). ` +
                            `Exclude count: ${exclude.count}, Include count: ${count}.`
                    };
                }

                return true;
            })
        ));
    }

    // ===== VALID TESTS - HISTOGRAM FOR LAYERS WITH NUMERIC FIELDS =====

    // TLV Parcels - Histogram on ms_shetach_rashum (10 buckets)
    tests.push(createTestCase(
        'Histogram - TLV parcels area (10 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 10 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // TLV Parcels - Histogram minimum buckets (2)
    tests.push(createTestCase(
        'Histogram - TLV parcels area (2 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 2 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // TLV Parcels - Histogram maximum buckets (50)
    tests.push(createTestCase(
        'Histogram - TLV parcels area (50 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 50 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // Agricultural - Histogram on dunam (10 buckets)
    tests.push(createTestCase(
        'Histogram - Agricultural parcels dunam (10 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: 10 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // Agricultural - Histogram minimum buckets (2)
    tests.push(createTestCase(
        'Histogram - Agricultural parcels dunam (2 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: 2 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // Agricultural - Histogram maximum buckets (50)
    tests.push(createTestCase(
        'Histogram - Agricultural parcels dunam (50 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: 50 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // ===== VALID TESTS - JENKS FOR LAYERS WITH NUMERIC FIELDS =====

    // TLV Parcels - Jenks with include_percentage
    tests.push(createTestCase(
        'Jenks - TLV parcels area (5 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 5 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (2 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 2 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (20 buckets)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 20 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // TLV Parcels - Jenks without include_percentage
    tests.push(createTestCase(
        'Jenks - TLV parcels area (5 buckets) without include_percentage',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 5 }
            },
            filter: { view_mode: 'global' }
        },
        200,
        true
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (2 buckets) without include_percentage',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 2 }
            },
            filter: { view_mode: 'global' }
        },
        200,
        true
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (20 buckets) without include_percentage',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 20 }
            },
            filter: { view_mode: 'global' }
        },
        200,
        true
    ));

    // TLV parcels - Jenks with include_percentage (Agricultural swapped out: its
    // ~197,750 records exceed the 50,000-record jenks ceiling; TLV Parcels has
    // 46,440 and stays under it)
    tests.push(createTestCase(
        'Jenks - TLV parcels area (5 buckets), via agricultural-limit swap',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 5 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (2 buckets), via agricultural-limit swap',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 2 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (20 buckets), via agricultural-limit swap',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 20 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        200,
        true,
        validatePercentages
    ));

    // Agricultural - Jenks over the documented 50,000-record ceiling.
    // This layer has ~197,750 records globally, well past the ceiling, so the
    // server rejects it with 400 RECORD_LIMIT_EXCEEDED. Regression guard for
    // that enforcement.
    tests.push(createTestCase(
        'Jenks - Agricultural parcels dunam rejected over 50,000-record ceiling',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'dunam',
                jenks: { buckets: 5 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        true
    ));

    // TLV parcels - Jenks without include_percentage (same swap as above)
    tests.push(createTestCase(
        'Jenks - TLV parcels area (5 buckets) without include_percentage, via agricultural-limit swap',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 5 }
            },
            filter: { view_mode: 'global' }
        },
        200,
        true
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (2 buckets) without include_percentage, via agricultural-limit swap',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 2 }
            },
            filter: { view_mode: 'global' }
        },
        200,
        true
    ));

    tests.push(createTestCase(
        'Jenks - TLV parcels area (20 buckets) without include_percentage, via agricultural-limit swap',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 20 }
            },
            filter: { view_mode: 'global' }
        },
        200,
        true
    ));

    // ===== INVALID TESTS - HISTOGRAM =====

    // Histogram with string buckets (TLV layer)
    tests.push(createTestCase(
        'Histogram - Invalid string buckets (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 'ten' }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with string buckets (Agricultural layer)
    tests.push(createTestCase(
        'Histogram - Invalid string buckets (Agricultural)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: 'ten' }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with buckets < 2 (TLV layer)
    tests.push(createTestCase(
        'Histogram - Invalid buckets < 2, value: 1 (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 1 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with buckets < 2 (Agricultural layer)
    tests.push(createTestCase(
        'Histogram - Invalid buckets < 2, value: 1 (Agricultural)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: 1 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with buckets = 0 (TLV)
    tests.push(createTestCase(
        'Histogram - Invalid buckets = 0 (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 0 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with negative buckets (Agricultural)
    tests.push(createTestCase(
        'Histogram - Invalid negative buckets (Agricultural)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: -5 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with buckets > 50 (TLV)
    tests.push(createTestCase(
        'Histogram - Invalid buckets > 50, value: 51 (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 51 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with buckets > 50 (Agricultural)
    tests.push(createTestCase(
        'Histogram - Invalid buckets > 50, value: 100 (Agricultural)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: 100 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Histogram with decimal buckets (TLV)
    tests.push(createTestCase(
        'Histogram - Invalid decimal buckets (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'ms_shetach_rashum',
                histogram: { buckets: 10.5 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // ===== INVALID TESTS - JENKS =====

    // Jenks with string buckets (TLV)
    tests.push(createTestCase(
        'Jenks - Invalid string buckets (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 'five' }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Jenks with string buckets (Agricultural)
    tests.push(createTestCase(
        'Jenks - Invalid string buckets (Agricultural)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'dunam',
                jenks: { buckets: 'five' }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Jenks with buckets < 2 (TLV)
    tests.push(createTestCase(
        'Jenks - Invalid buckets < 2, value: 1 (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 1 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Jenks with buckets < 2 (Agricultural)
    tests.push(createTestCase(
        'Jenks - Invalid buckets < 2, value: 1 (Agricultural)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'dunam',
                jenks: { buckets: 1 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Jenks with buckets > 20 (TLV)
    tests.push(createTestCase(
        'Jenks - Invalid buckets > 20, value: 21 (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: 21 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Jenks with buckets > 20 (Agricultural)
    tests.push(createTestCase(
        'Jenks - Invalid buckets > 20, value: 50 (Agricultural)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'dunam',
                jenks: { buckets: 50 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Jenks with negative buckets (TLV)
    tests.push(createTestCase(
        'Jenks - Invalid negative buckets (TLV)',
        'invalid',
        {
            source: { layer: CONFIG.LAYERS.TLV_PARCELS.id, srid: 2039 },
            operation: {
                type: 'jenks',
                field: 'ms_shetach_rashum',
                jenks: { buckets: -3 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // ===== EDGE CASES =====

    // Missing field for histogram
    tests.push(createTestCase(
        'Edge Case - Histogram without field',
        'edge',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                histogram: { buckets: 10 }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Missing histogram config
    tests.push(createTestCase(
        'Edge Case - Histogram without histogram config',
        'edge',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam'
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Invalid layer
    tests.push(createTestCase(
        'Edge Case - Invalid layer ID',
        'edge',
        {
            source: { layer: 'layer_999999', srid: 2039 },
            operation: { type: 'count' },
            grouping: { group_by: 'yeshuvname' },
            output: { include_percentage: true, limit: 100 },
            filter: { view_mode: 'global' }
        },
        404,
        false
    ));

    // Invalid field name
    tests.push(createTestCase(
        'Edge Case - Invalid field name',
        'edge',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: { type: 'count' },
            grouping: { group_by: 'nonexistent_field' },
            output: { include_percentage: true, limit: 100 },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Null buckets value
    tests.push(createTestCase(
        'Edge Case - Histogram with null buckets',
        'edge',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: { buckets: null }
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // Missing buckets key
    tests.push(createTestCase(
        'Edge Case - Histogram with empty histogram object',
        'edge',
        {
            source: { layer: CONFIG.LAYERS.AGRIC_PARCELS.id, srid: 2039 },
            operation: {
                type: 'histogram',
                field: 'dunam',
                histogram: {}
            },
            output: { include_percentage: true },
            filter: { view_mode: 'global' }
        },
        400,
        false
    ));

    // ===== SUB-GROUP / SPATIAL FILTER =====

    // Step 1: calibration — full distribution of company × fname
    tests.push(createTestCase(
        'Sub-group calibration - Cellular company × fname (global)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.CELLULAR.id, srid: 2039 },
            operation: { type: 'count' },
            filter: {
                spatial_filter: { layer: '22', relation: 'within', logic: 'centroid' },
                view_mode: 'global'
            },
            grouping: {
                group_by: 'company',
                group_limit: 10,
                sub_group_by: 'fname',
                sub_group_by_source: 'spatial_filter',
                sub_group_limit: 10
            }
        },
        200,
        true,
        (response) => {
            if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                return { valid: false, message: 'No data returned from calibration query' };
            }

            subGroupCalibrationData = response.data;

            return true;
        }
    ));

    // Step 2: edge case — group_limit=1 / sub_group_limit=1
    // The OTHER bucket's top sub-group should be the (company, fname) pair with the
    // highest count among ALL companies ranked 2+, not necessarily rank-2's neighborhood.
    tests.push(createTestCase(
        'Sub-group edge case - group_limit=1 sub_group_limit=1 (OTHER bucket sub-group is global max, not rank-2)',
        'valid',
        {
            source: { layer: CONFIG.LAYERS.CELLULAR.id, srid: 2039 },
            operation: { type: 'count' },
            filter: {
                spatial_filter: { layer: '22', relation: 'within', logic: 'centroid' },
                view_mode: 'global'
            },
            grouping: {
                group_by: 'company',
                group_limit: 1,
                sub_group_by: 'fname',
                sub_group_by_source: 'spatial_filter',
                sub_group_limit: 1
            }
        },
        200,
        true,
        (response) => {
            if (!response.data || !Array.isArray(response.data)) {
                return { valid: false, message: 'No data returned' };
            }

            if (!subGroupCalibrationData) {
                return { valid: false, message: 'Calibration data missing — run calibration test first' };
            }

            const OTHER = 'אחר';
            const isOther = (v) => v === OTHER || v === '__other__' || v === 'Other';

            // Flat rows: { company, fname, count }
            // Rank-1 company = highest sum of counts across all its fname rows
            const totals = {};

            subGroupCalibrationData.forEach((row) => {
                if (!isOther(row.company)) {
                    totals[row.company] = (totals[row.company] || 0) + (row.count || 0);
                }
            });

            const rank1Company = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];

            // Among non-rank-1, non-other (company, fname) pairs — find the highest named-fname count
            const nonRank1Named = subGroupCalibrationData.filter(
                (row) => !isOther(row.company) && row.company !== rank1Company && !isOther(row.fname)
            );

            if (nonRank1Named.length === 0) {
                return { valid: false, message: 'No non-rank-1 named (company, fname) pairs in calibration data' };
            }

            const expectedMax = nonRank1Named.sort((a, b) => (b.count || 0) - (a.count || 0))[0];

            // In the edge-case response, find OTHER company rows with a named fname
            const otherNamedRows = response.data.filter(
                (row) => isOther(row.company) && !isOther(row.fname)
            );

            if (otherNamedRows.length === 0) {
                return {
                    valid: false,
                    message: `No OTHER+named-fname rows in result. Rows: ${JSON.stringify(response.data)}`
                };
            }

            const topOtherRow = otherNamedRows.sort((a, b) => (b.count || 0) - (a.count || 0))[0];

            if (topOtherRow.fname !== expectedMax.fname) {
                return {
                    valid: false,
                    message:
                        `OTHER's top named sub-group is "${topOtherRow.fname}" (count=${topOtherRow.count}), ` +
                        `but calibration shows cross-company max is "${expectedMax.fname}" ` +
                        `(company="${expectedMax.company}", count=${expectedMax.count}). ` +
                        `Server is likely returning rank-2 company's neighborhood instead of the true maximum.`
                };
            }

            return true;
        }
    ));

    // Layers like AGRIC_PARCELS / BUILDING_PERMITS_TLV are DEV-only ({ id: null }
    // on STAGE/PROD) — drop any test that resolved to a null layer id instead of
    // sending a request that can only 404.
    return tests.filter((test) => test.requestBody.source.layer !== null);
}

// Nudge one random bbox edge by a random value in (-100, 100) exclusive
function applyRandomBbox(requestBody) {
    if (!requestBody.filter || !requestBody.filter.bbox) {
        return requestBody;
    }

    const bbox = requestBody.filter.bbox.slice();
    const idx = Math.floor(Math.random() * 4);
    const delta = (Math.random() * 199.999) - 99.9995;

    bbox[idx] = bbox[idx] + delta;

    return Object.assign({}, requestBody, { filter: Object.assign({}, requestBody.filter, { bbox }) });
}

// Page through CONFIG.PAGINATION_TARGET to exhaustion (has_more: false), checking:
// 1. No row reappears across pages, keyed on target.idField (the layer's true unique
//    column) when given — a composite of all requested fields is NOT reliable, since
//    display fields like company/city are shared by many distinct rows.
// 2. offset_start/offset_end advance contiguously and never exceed total_records_found
// 3. total_records_found stays constant across every page
// Returns a test-result-shaped object so it can reuse renderTestResult/updateStatistics.
async function runPaginationTestCase() {
    const target = CONFIG.PAGINATION_TARGET;
    const startTime = Date.now();
    const seenKeys = new Set();
    const duplicates = [];
    const metadataIssues = [];

    let pageToken = null;
    let pageCount = 0;
    let totalRowsSeen = 0;
    let expectedTotal = null;
    let lastOffsetEnd = 0;
    let lastResponse = null;

    const spacing = REQUEST_SPACING_MS[CONFIG.ENVIRONMENT] || 0;

    try {
        do {
            pageCount++;

            if (spacing && pageCount > 1) {
                await sleep(spacing);
            }

            const requestBody = {
                source: { layer: target.layer, srid: 2039 },
                operation: { type: 'table', fields: target.fields },
                filter: target.filter,
                output: pageToken
                    ? { limit: target.pageSize, page_token: pageToken }
                    : { limit: target.pageSize }
            };

            let response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-token': CONFIG.API_TOKEN },
                body: JSON.stringify(requestBody)
            });

            // The backend fails whole bursts with 502/503/504 — give it time to recover
            // and retry this same page once before giving up on the run.
            if (isGatewayError(response.status)) {
                await sleep(GATEWAY_RETRY_DELAY_MS);
                response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-token': CONFIG.API_TOKEN },
                    body: JSON.stringify(requestBody)
                });
            }

            const data = await response.json();
            lastResponse = data;

            if (!response.ok) {
                throw new Error(`Page ${pageCount}: HTTP ${response.status} — ${JSON.stringify(data).slice(0, 200)}`);
            }

            const rows = data.data || [];
            const meta = data.metadata || {};

            const keyFields = target.idField ? [target.idField] : target.fields;

            rows.forEach((row) => {
                const key = keyFields.map((f) => row[f]).join('|');
                if (seenKeys.has(key)) {
                    duplicates.push({ page: pageCount, key });
                } else {
                    seenKeys.add(key);
                }
            });
            totalRowsSeen += rows.length;

            if (expectedTotal === null) {
                expectedTotal = meta.total_records_found;
            } else if (meta.total_records_found !== expectedTotal) {
                metadataIssues.push(
                    `Page ${pageCount}: total_records_found changed ${expectedTotal} → ${meta.total_records_found}`
                );
            }

            if (meta.offset_start !== lastOffsetEnd + 1) {
                metadataIssues.push(
                    `Page ${pageCount}: offset_start=${meta.offset_start} is not contiguous with previous offset_end=${lastOffsetEnd}`
                );
            }
            if (meta.offset_end > expectedTotal) {
                metadataIssues.push(`Page ${pageCount}: offset_end=${meta.offset_end} exceeds total_records_found=${expectedTotal}`);
            }
            lastOffsetEnd = meta.offset_end;

            pageToken = data.paging && data.paging.has_more ? data.paging.next_page_token : null;

            if (data.paging && data.paging.has_more && !pageToken) {
                metadataIssues.push(`Page ${pageCount}: has_more=true but next_page_token is missing`);
                break;
            }
        } while (pageToken);

        const issues = [...metadataIssues];
        if (duplicates.length > 0) {
            issues.push(`${duplicates.length} duplicate row(s) across pages: ${JSON.stringify(duplicates.slice(0, 5))}`);
        }
        if (totalRowsSeen !== expectedTotal) {
            issues.push(`Total rows returned (${totalRowsSeen}) ≠ total_records_found (${expectedTotal})`);
        }

        return {
            name: `Pagination exhaustion — ${target.label} [${CONFIG.ENVIRONMENT}]`,
            category: 'pagination',
            passed: issues.length === 0,
            expectedStatus: 200,
            actualStatus: 200,
            duration: Date.now() - startTime,
            request: { layer: target.layer, fields: target.fields, filter: target.filter, pages: pageCount },
            response: { pages: pageCount, totalRowsSeen, expectedTotal, duplicates: duplicates.length, lastPage: lastResponse },
            error: issues.length > 0 ? issues.join('; ') : null,
            shouldPass: true
        };
    } catch (error) {
        return {
            name: `Pagination exhaustion — ${target.label} [${CONFIG.ENVIRONMENT}]`,
            category: 'pagination',
            passed: false,
            expectedStatus: 200,
            actualStatus: 'ERROR',
            duration: Date.now() - startTime,
            request: { layer: target.layer, fields: target.fields, filter: target.filter, pagesCompleted: pageCount },
            response: lastResponse,
            error: error.message,
            shouldPass: true
        };
    }
}

// Run the pagination-exhaustion test on its own, outside the main suite filters.
async function runPaginationTest() {
    const btn = document.getElementById('runPaginationBtn');
    btn.disabled = true;
    btn.textContent = 'רץ עימוד...';

    const resultsContainer = document.getElementById('results');
    const result = await runPaginationTestCase();
    const resultId = 'result_pagination_' + Date.now();
    result.resultId = resultId;
    testResults.push(result);

    totalTests++;
    if (result.passed) {
        passedTests++;
    } else {
        failedTests++;
    }

    updateStatistics();
    updateSlowPanel();
    resultsContainer.appendChild(renderTestResult(result, resultId));

    btn.disabled = false;
    btn.textContent = 'הרץ בדיקת עימוד מלאה';
}

// STAGE's aggregate endpoint returns bursts of 502/503/504 under sustained load (an
// upstream CloudFront/gateway failure — the request never reaches the app) — pace
// requests and, if one still lands on a gateway error, retry it once after the whole
// run drains and the backend has had time to recover. 429 is the app's own documented
// rate-limit response (see aggregate.contract.ts) — same "back off and retry" shape.
const REQUEST_SPACING_MS = { STAGE: 400 };
const GATEWAY_RETRY_DELAY_MS = 62000;
const isGatewayError = (status) => status === 429 || status === 502 || status === 503 || status === 504;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Execute a single test
async function executeTest(testCase) {
    const startTime = Date.now();

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-token': CONFIG.API_TOKEN
            },
            body: JSON.stringify(testCase.requestBody)
        });

        const responseData = await response.json();
        const duration = Date.now() - startTime;

        const actualStatus = response.status;
        const statusMatches = actualStatus === testCase.expectedStatus;

        let validatorPass = true;
        let validatorMessage = '';

        if (statusMatches && testCase.validator && response.ok) {
            try {
                const result = testCase.validator(responseData);
                if (typeof result === 'boolean') {
                    validatorPass = result;
                    validatorMessage = result ? '' : 'Validator failed';
                } else {
                    validatorPass = result.valid;
                    validatorMessage = result.valid ? '' : result.message;
                }
            } catch (e) {
                validatorPass = false;
                validatorMessage = 'Validator error: ' + e.message;
            }
        }

        const passed = statusMatches && validatorPass;

        return {
            name: testCase.name,
            category: testCase.category,
            passed: passed,
            expectedStatus: testCase.expectedStatus,
            actualStatus: actualStatus,
            duration: duration,
            request: testCase.requestBody,
            response: responseData,
            error: passed ? null : (validatorMessage || `Status mismatch: expected ${testCase.expectedStatus}, got ${actualStatus}`),
            shouldPass: testCase.shouldPass
        };
    } catch (error) {
        const duration = Date.now() - startTime;

        return {
            name: testCase.name,
            category: testCase.category,
            passed: false,
            expectedStatus: testCase.expectedStatus,
            actualStatus: 'ERROR',
            duration: duration,
            request: testCase.requestBody,
            response: null,
            error: error.message,
            shouldPass: testCase.shouldPass
        };
    }
}

// Store requests for copy functionality
const requestStore = new Map();

// Copy request to clipboard (with fallback for non-HTTPS environments)
function copyRequest(requestId, buttonElement) {
    const requestJson = requestStore.get(requestId);
    if (!requestJson) {
        alert('לא נמצא נתון לקופי');
        return;
    }

    const jsonString = JSON.stringify(requestJson, null, 2);

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonString).then(() => {
            showCopySuccess(buttonElement);
        }).catch((err) => {
            console.error('Clipboard API failed:', err);
            fallbackCopy(jsonString, buttonElement);
        });
    } else {
        // Fallback for non-HTTPS or older browsers
        fallbackCopy(jsonString, buttonElement);
    }
}

// Fallback copy method using textarea
function fallbackCopy(text, buttonElement) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(buttonElement);
        } else {
            alert('העתקה נכשלה');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('העתקה נכשלה: ' + err.message);
    }

    document.body.removeChild(textarea);
}

// Show copy success feedback
function showCopySuccess(buttonElement) {
    const originalHTML = buttonElement.innerHTML;
    buttonElement.innerHTML = '✓';
    buttonElement.style.color = '#4CAF50';
    setTimeout(() => {
        buttonElement.innerHTML = originalHTML;
        buttonElement.style.color = '';
    }, 1500);
}

// Copy response to clipboard
function copyResponse(responseId, buttonElement) {
    const responseJson = requestStore.get(responseId);
    if (!responseJson) {
        alert('לא נמצא נתון לקופי');
        return;
    }

    const jsonString = JSON.stringify(responseJson, null, 2);

    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonString).then(() => {
            showCopySuccess(buttonElement);
        }).catch((err) => {
            console.error('Clipboard API failed:', err);
            fallbackCopy(jsonString, buttonElement);
        });
    } else {
        // Fallback for non-HTTPS or older browsers
        fallbackCopy(jsonString, buttonElement);
    }
}

// Make functions globally accessible
window.copyRequest = copyRequest;
window.copyResponse = copyResponse;

// Render a single test result
function renderTestResult(result, resultId) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item';
    resultDiv.id = resultId;

    const statusClass = result.passed ? 'passed' : 'failed';
    const statusText = result.passed ? 'עבר' : 'נכשל';

    // Extract API error if present
    let apiError = '';
    if (result.response && result.response.error) {
        apiError = `
        <div class="result-api-error">
            <strong>שגיאת API:</strong> ${result.response.error}
        </div>
        `;
    }

    const requestId = 'req_' + Math.random().toString(36).substring(2, 11);
    const responseId = 'res_' + Math.random().toString(36).substring(2, 11);
    requestStore.set(requestId, result.request);
    if (result.response) {
        requestStore.set(responseId, result.response);
    }

    resultDiv.innerHTML = `
        <div class="result-header">
            <div class="result-title">${result.name}</div>
            <div class="result-status ${statusClass}">${statusText}</div>
        </div>
        <div class="result-details">
            קטגוריה: ${result.category} |
            סטטוס צפוי: ${result.expectedStatus} |
            סטטוס בפועל: ${result.actualStatus} |
            זמן: ${result.duration}ms
        </div>
        ${apiError}
        <details>
            <summary style="cursor: pointer; margin-bottom: 8px;">בקשה</summary>
            <div style="position: relative;">
                <button class="copy-btn" onclick="copyRequest('${requestId}', this)" title="העתק בקשה">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <div class="result-request">${JSON.stringify(result.request, null, 2)}</div>
            </div>
        </details>
        ${result.response ? `
        <details>
            <summary style="cursor: pointer; margin-bottom: 8px;">תגובה</summary>
            <div style="position: relative;">
                <button class="copy-btn" onclick="copyResponse('${responseId}', this)" title="העתק תגובה">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <div class="result-response">${JSON.stringify(result.response, null, 2)}</div>
            </div>
        </details>
        ` : ''}
        ${result.error && !apiError ? `
        <div class="result-error">שגיאה: ${result.error}</div>
        ` : ''}
    `;

    return resultDiv;
}

const SLOW_THRESHOLD_MS = 5000;

// Rebuild the slow-requests panel from testResults (with their resultIds)
function updateSlowPanel() {
    const slow = testResults
        .filter((r) => r.duration >= SLOW_THRESHOLD_MS)
        .sort((a, b) => b.duration - a.duration);

    const panel = document.getElementById('slowPanel');
    const list = document.getElementById('slowList');

    if (slow.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = '';
    const maxDuration = slow[0].duration;

    list.innerHTML = slow.map((r, i) => {
        const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
        const badgeClass = r.passed ? 'passed' : 'failed';
        const badgeText = r.passed ? 'עבר' : 'נכשל';
        const barWidth = Math.round((r.duration / maxDuration) * 100);
        const secs = (r.duration / 1000).toFixed(2) + 's';

        return `<div class="slow-row" onclick="scrollToResult('${r.resultId}')">
            <div class="slow-rank ${rankClass}">#${i + 1}</div>
            <div class="slow-duration">${secs}</div>
            <div class="slow-bar-wrap">
                <div class="slow-name">${r.name}</div>
                <div class="slow-bar-bg"><div class="slow-bar-fill" style="width:${barWidth}%"></div></div>
            </div>
            <div class="slow-badge ${badgeClass}">${badgeText}</div>
        </div>`;
    }).join('');
}

function scrollToResult(resultId) {
    const el = document.getElementById(resultId);
    if (!el) { return; }

    el.classList.remove('highlight');
    // force reflow so re-adding the class re-triggers the animation
    void el.offsetWidth;
    el.classList.add('highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.scrollToResult = scrollToResult;

// Update statistics display
function updateStatistics() {
    document.getElementById('totalTests').textContent = totalTests;
    document.getElementById('pendingTests').textContent = pendingTests;
    document.getElementById('passedTests').textContent = passedTests;
    document.getElementById('failedTests').textContent = failedTests;

    const completed = passedTests + failedTests;
    const successRate = completed > 0 ? ((passedTests / completed) * 100).toFixed(1) : 0;
    const successRateEl = document.getElementById('successRate');
    successRateEl.textContent = successRate + '%';

    if (successRate >= 90) {
        successRateEl.className = 'status-value passed';
    } else if (successRate >= 70) {
        successRateEl.className = 'status-value';
        successRateEl.style.color = '#ff9800';
    } else {
        successRateEl.className = 'status-value failed';
    }
}

// Update progress bar
function updateProgress(current, total) {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    document.getElementById('progressBar').style.width = percentage + '%';
}

// Run all tests
async function runAllTests() {
    const runBtn = document.getElementById('runAllBtn');
    runBtn.disabled = true;
    runBtn.textContent = 'מריץ בדיקות...';

    const filterValid = document.getElementById('filterValid').checked;
    const filterInvalid = document.getElementById('filterInvalid').checked;
    const filterEdgeCases = document.getElementById('filterEdgeCases').checked;

    clearResults();

    const allTests = generateTestCases();

    // Filter tests based on category
    const filteredTests = allTests.filter((test) => {
        if (test.category === 'valid' && !filterValid) return false;
        if (test.category === 'invalid' && !filterInvalid) return false;
        if (test.category === 'edge' && !filterEdgeCases) return false;
        return true;
    });

    const useRandomBbox = document.getElementById('randomBbox').checked;

    totalTests = filteredTests.length;
    pendingTests = filteredTests.length;
    updateStatistics();

    const resultsContainer = document.getElementById('results');
    const spacing = REQUEST_SPACING_MS[CONFIG.ENVIRONMENT] || 0;
    const gatewayRetries = []; // { index, test, resultId } for results hit by a 502/503/504

    for (let i = 0; i < filteredTests.length; i++) {
        let test = filteredTests[i];

        if (useRandomBbox && test.requestBody.filter && test.requestBody.filter.bbox) {
            test = Object.assign({}, test, { requestBody: applyRandomBbox(test.requestBody) });
        }

        updateProgress(i, filteredTests.length);

        if (spacing && i > 0) {
            await sleep(spacing);
        }

        const result = await executeTest(test);
        const resultId = 'result_' + i;
        result.resultId = resultId;
        testResults.push(result);

        if (isGatewayError(result.actualStatus)) {
            gatewayRetries.push({ index: i, test: test, resultId: resultId });
        }

        pendingTests--;
        if (result.passed) {
            passedTests++;
        } else {
            failedTests++;
        }

        updateStatistics();
        updateSlowPanel();
        resultsContainer.appendChild(renderTestResult(result, resultId));
    }

    updateProgress(filteredTests.length, filteredTests.length);

    // The backend has a habit of failing whole bursts with 502/503/504 — wait for it to
    // recover, then retry just the requests that hit a gateway error, in place.
    if (gatewayRetries.length > 0) {
        runBtn.textContent = `מחכה ${GATEWAY_RETRY_DELAY_MS / 1000}s לפני ניסיון חזרה על ${gatewayRetries.length} בקשות...`;
        await sleep(GATEWAY_RETRY_DELAY_MS);

        for (const { index, test, resultId } of gatewayRetries) {
            runBtn.textContent = `מנסה שוב...`;

            const wasPassed = testResults[index].passed;
            const retryResult = await executeTest(test);
            retryResult.resultId = resultId;
            testResults[index] = retryResult;

            if (retryResult.passed !== wasPassed) {
                if (retryResult.passed) {
                    passedTests++;
                    failedTests--;
                } else {
                    passedTests--;
                    failedTests++;
                }
            }

            updateStatistics();
            updateSlowPanel();
            document.getElementById(resultId).replaceWith(renderTestResult(retryResult, resultId));
        }
    }

    runBtn.disabled = false;
    runBtn.textContent = 'הרץ את כל הבדיקות';
}

// Run only null_handling tests
async function runNullHandlingTests() {
    const btn = document.getElementById('runNullHandlingBtn');
    btn.disabled = true;
    btn.textContent = 'רץ בדיקות aggNullHandling...';

    clearResults();

    const allTests = generateTestCases();
    const nullHandlingTests = allTests.filter((test) => test.name.includes('aggNullHandling'));

    if (nullHandlingTests.length === 0) {
        btn.textContent = 'לא נמצאו בדיקות aggNullHandling';
        btn.disabled = false;
        return;
    }

    totalTests = nullHandlingTests.length;
    pendingTests = nullHandlingTests.length;
    updateStatistics();

    const resultsContainer = document.getElementById('results');

    for (let i = 0; i < nullHandlingTests.length; i++) {
        const test = nullHandlingTests[i];
        updateProgress(i, nullHandlingTests.length);

        const result = await executeTest(test);
        const resultId = 'result_null_' + i;
        result.resultId = resultId;
        testResults.push(result);

        pendingTests--;

        if (result.passed) {
            passedTests++;
        } else {
            failedTests++;
        }

        updateStatistics();
        updateSlowPanel();
        resultsContainer.appendChild(renderTestResult(result, resultId));
    }

    updateProgress(nullHandlingTests.length, nullHandlingTests.length);
    btn.disabled = false;
    btn.textContent = 'הרץ בדיקות aggNullHandling';
}

// Clear all results
function clearResults() {
    testResults = [];
    totalTests = 0;
    passedTests = 0;
    failedTests = 0;
    pendingTests = 0;
    subGroupCalibrationData = null;
    requestStore.clear();

    document.getElementById('results').innerHTML = '';
    document.getElementById('slowList').innerHTML = '';
    document.getElementById('slowPanel').style.display = 'none';
    updateStatistics();
    updateProgress(0, 1);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateStatistics();
    console.log('Test harness loaded. Click "הרץ את כל הבדיקות" to start.');
});
