// ─── Single environment switch for both apps in this project ───────────────────
// DEFAULT_ENVIRONMENT is used when the URL has no ?env= param.
// The envSelect dropdown (index.html + dashboard/index.html) reloads with ?env=.
//
// Valid values: 'DEV', 'STAGE', 'PROD', 'govmap.gov.il', 'dev.govmap.gov.il'

const DEFAULT_ENVIRONMENT = 'STAGE';

const ENVIRONMENTS = {
    'govmap.gov.il': {
        sdkUrl: 'https://www.govmap.gov.il/govmap/api/govmap.api.js',
        token: '0fff9694-a045-4ede-b997-ee9927b0d56c',
        layers: {
            cellular: 'layer_234950',
            tlvParcels: 'layer_235227'
        }
    },
    'dev.govmap.gov.il': {
        sdkUrl: 'https://dev.govmap.gov.il/govmap/api/govmap.api.js',
        token: '9d920b21-227a-4b1d-b5ce-d01971dbf9ec',
        layers: {
            cellular: 'cell_active',
            tlvParcels: 'layer_160308',
            agricParcels: 'layer_160297',
            buildingPermitsTlv: 'layer_160776'
        }
    },
    'PROD': {
        sdkUrl: 'https://www.govmap.gov.il/govmap/api/govmap.api.js',
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        layers: {
            cellular: 'layer_234365',
            tlvParcels: 'layer_235027'
        }
    },
    'STAGE': {
        sdkUrl: 'https://stage.govmap.gov.il/govmap/api/govmap.api.js',
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        layers: {
            cellular: '208272',
            tlvParcels: 'layer_209309',
            revaha: 'layer_208599',
            agricParcels: 'layer_209311',
            buildingPermitsTlv: 'layer_209321',
        }
    },
    'DEV': {
        sdkUrl: 'https://dev.govmap.gov.il/govmap/api/govmap.api.js',
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        layers: {
            cellular: 'layer_160238',
            tlvParcels: 'layer_160308',
            agricParcels: 'layer_160297',
            buildingPermitsTlv: 'layer_160776',
            revaha: 'layer_162015'
        }
    }
};

function resolveEnvironment() {
    const param = new URLSearchParams(location.search).get('env');

    if (ENVIRONMENTS[param]) {
        return param;
    }

    return ENVIRONMENTS[DEFAULT_ENVIRONMENT] ? DEFAULT_ENVIRONMENT : 'DEV';
}

function setEnvironment(envKey) {
    const key = ENVIRONMENTS[envKey] ? envKey : DEFAULT_ENVIRONMENT;
    location.search = '?env=' + key;
}

const ENVIRONMENT = resolveEnvironment();
const currentEnv = ENVIRONMENTS[ENVIRONMENT];

// Inserted during parse, before app.js, so govmap is defined when the app starts.
document.write('<script src="' + currentEnv.sdkUrl + '"><\/script>');

document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('envSelect');

    if (select) {
        select.value = ENVIRONMENT;
    }
});

const API_TOKEN        = currentEnv.token;
const LAYER_CELLULAR   = currentEnv.layers.cellular;
const LAYER_TLV_PARCELS = currentEnv.layers.tlvParcels;
const LAYER_AGRIC_PARCELS = currentEnv.layers.agricParcels || null;
const LAYER_AGRIC      = LAYER_AGRIC_PARCELS; // alias used by the dashboard
const LAYER_BUILDING_PERMITS_TLV = currentEnv.layers.buildingPermitsTlv || null;
const LAYER_NEIGHBORHOODS = '22';
