const DEFAULT_ENV = 'stage';

const SEARCH_IN_LAYER_STYLE = {
    highlight: true,
    showBubble: false,
    outLineColor: [0, 255, 0, 1],
    fillColor: [255, 0, 0, 0.5],
};

const ENV_CONFIG = {
    cloudfront: {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        apiUrl: 'https://d1tj85vqlmrpm.cloudfront.net/govmap/api/govmap.api.js',
        pageTitle: 'CloudFront',
        filterLayerName: '162879',
        layersOn: '162879',
        layersOff: '162881',
        intersectLayers: [
            { layerName: '162879', radius: 20 },
            { layerName: '162881', radius: 25 },
        ],
        searchInLayerPresets: {
            layer_163074: {
                layerName: 'layer_163074',
                fieldName: 'value0',
                fieldValues: ['ג'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            layer_162879: {
                layerName: 'layer_162879',
                fieldName: 'value0',
                fieldValues: ['ג'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            layer_163153: {
                layerName: 'layer_163153',
                fieldName: 'value0',
                fieldValues: ['a'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            ies: {
                layerName: 'ies',
                fieldName: 'name',
                fieldValues: ['הרצליה'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            layer_155046: {
                layerName: 'layer_155046',
                fieldName: 'value1',
                fieldValues: ['ב'],
                ...SEARCH_IN_LAYER_STYLE,
            },
        },
    },
    stage: {
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        apiUrl: 'https://stage.govmap.gov.il/govmap/api/govmap.api.js',
        pageTitle: 'stage',
        filterLayerName: '211279',
        layersOn: '211279',
        layersOff: '211278',
        // intersectLayers: [
        //     { layerName: '211279', radius: 20 },
        //     { layerName: '211278', radius: 25 },
        // ],
        intersectLayers: [ // permissions
            { layerName: '211275', radius: 20 },
            { layerName: '211316', radius: 25 },
        ],
        searchInLayerPresets: {
            ies: {
                layerName: 'ies',
                fieldName: 'name',
                fieldValues: ['הרצליה'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            קו: {
                layerName: 'layer_211272',
                fieldName: 'value1',
                fieldValues: ['3'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            עיגול: {
                layerName: 'layer_211273',
                fieldName: 'value0',
                fieldValues: ['a'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            עיגול1: {
                layerName: 'layer_211273',
                fieldName: 'value0',
                fieldValues: ['B'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            מצולע: {
                layerName: 'layer_211275',
                fieldName: 'value0',
                fieldValues: ['c'],
                ...SEARCH_IN_LAYER_STYLE,
            },
            'משותפת עם הרשאות חלקיות': {
                layerName: '211316',
                fieldName: 'value1',
                fieldValues: ['סוד1'],
                ...SEARCH_IN_LAYER_STYLE,
            },
        },
    },
    prod: {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        apiUrl: 'https://www.govmap.gov.il/govmap/api/govmap.api.js',
        pageTitle: 'prod',
        filterLayerName: '',
        layersOn: '',
        layersOff: '',
        intersectLayers: [],
        searchInLayerPresets: {},
    },
};

function resolveCfEnv() {
    if (typeof window === 'undefined' || !window.location) {
        return DEFAULT_ENV;
    }

    try {
        const params = new URLSearchParams(window.location.search);
        const fromUrl = params.get('env');

        if (fromUrl && ENV_CONFIG[fromUrl]) {
            try {
                sessionStorage.setItem('cfEnv', fromUrl);
            } catch (e) {
                /* ignore */
            }

            return fromUrl;
        }

        const fromStorage = sessionStorage.getItem('cfEnv');

        if (fromStorage && ENV_CONFIG[fromStorage]) {
            return fromStorage;
        }
    } catch (e) {
        /* ignore */
    }

    return DEFAULT_ENV;
}

const env = resolveCfEnv();

const activeEnvConfig = ENV_CONFIG[env] || ENV_CONFIG[DEFAULT_ENV];

const GOVMAP_TOKEN = activeEnvConfig.token;
const GOVMAP_API_URL = activeEnvConfig.apiUrl;
const CF_PAGE_TITLE = activeEnvConfig.pageTitle;
const SEARCH_IN_LAYER_PRESETS = activeEnvConfig.searchInLayerPresets || {};
const FILTER_LAYER_NAME = activeEnvConfig.filterLayerName || '';
const LAYERS_ON = activeEnvConfig.layersOn || '';
const LAYERS_OFF = activeEnvConfig.layersOff || '';
const INTERSECT_LAYERS = activeEnvConfig.intersectLayers || [];
