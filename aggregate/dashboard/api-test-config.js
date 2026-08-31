// api-test-config.js — environment bootstrap for dashboard/api-test.html.
// Self-contained: does not touch env.js, so the main dashboard app is unaffected.
// Reads ?env=DEV|STAGE|PROD from the URL (default DEV) and defines the LAYER_*/
// API_TOKEN globals api-test.js expects. Loaded before the GovMap SDK script tag
// so api-test.html can point the SDK at the matching host.

const API_TEST_ENVIRONMENTS = {
    DEV: {
        sdkUrl: 'https://dev.govmap.gov.il/govmap/api/govmap.api.js',
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: {
            cellular: 'layer_160238',
            tlvParcels: 'layer_160308',
            agricParcels: 'layer_160297',
            buildingPermitsTlv: 'layer_160776',
            revaha: 'layer_162015'
        },
        // DEV's revaha layer uses shortened field names, unlike STAGE's.
        revahaFields: ['serviceid', 'servicetyp', 'fulladdres']
    },
    STAGE: {
        sdkUrl: 'https://stage.govmap.gov.il/govmap/api/govmap.api.js',
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        layers: {
            cellular: '208272',
            tlvParcels: 'layer_209309',
            revaha: 'layer_208599',
            agricParcels: 'layer_209311',
            buildingPermitsTlv: 'layer_209321',
        },
        revahaFields: ['serviceid', 'servicetypename', 'fulladdress']
    },
    PROD: {
        sdkUrl: 'https://www.govmap.gov.il/govmap/api/govmap.api.js',
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: {
            cellular: 'layer_234365',
            tlvParcels: 'layer_235027'
        }
    }
};

function getApiTestEnvKey() {
    const param = new URLSearchParams(location.search).get('env');
    return API_TEST_ENVIRONMENTS[param] ? param : 'DEV';
}

const API_TEST_ENV_KEY = getApiTestEnvKey();
const apiTestEnv = API_TEST_ENVIRONMENTS[API_TEST_ENV_KEY];

// document.write during initial parse inserts this script synchronously right
// here, before the HTML parser reaches api-test.js — so the SDK is ready in time
// for api-test.js's top-level (non-deferred) agg() calls.
document.write(`<script src="${apiTestEnv.sdkUrl}"></script>`);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('envSelect').value = API_TEST_ENV_KEY;
});

const API_TOKEN = apiTestEnv.token;
const LAYER_CELLULAR = apiTestEnv.layers.cellular;
const LAYER_TLV_PARCELS = apiTestEnv.layers.tlvParcels;
const LAYER_AGRIC_PARCELS = apiTestEnv.layers.agricParcels || null;
const LAYER_AGRIC = LAYER_AGRIC_PARCELS;
const LAYER_BUILDING_PERMITS_TLV = apiTestEnv.layers.buildingPermitsTlv || null;
const LAYER_REVAHA = apiTestEnv.layers.revaha || null;
const LAYER_NEIGHBORHOODS = '22';

// Pagination-exhaustion target — revaha's server-side keyset cursor bug (comparing
// serviceid as text) is fixed on DEV but still present on STAGE; cellular is the
// fallback on PROD, which has no revaha layer yet.
// idField is the layer's true unique column, used to dedupe rows across pages —
// display fields alone (servicetyp/fulladdres, company/city) are shared by many
// distinct rows and would produce false-positive duplicates if used as the key.
const API_TEST_PAGINATION_TARGET = LAYER_REVAHA
    ? {
        label: 'Revaha (global)',
        layer: LAYER_REVAHA,
        fields: apiTestEnv.revahaFields,
        idField: 'serviceid',
        filter: { view_mode: 'global' }
    }
    : {
        label: 'Cellular (global)',
        layer: LAYER_CELLULAR,
        fields: ['company', 'city'],
        filter: { view_mode: 'global' }
    };
