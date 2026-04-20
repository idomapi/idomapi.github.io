const env = 'stage';

const ENV_CONFIG = {
    prod: {
        token: '8afbb7f6-f247-4b73-9366-635aaa7c9b1f',
        apiUrl: 'https://www.govmap.gov.il/govmap/api/govmap.api.js',
        pageTitle: 'prod'
    },
    stage: {
        token: 'ce39f4d4-93ac-4f6f-bb70-9618a4c6b657',
        apiUrl: 'https://stage.govmap.gov.il/govmap/api/govmap.api.js',
        pageTitle: 'test'
    },
    dev: {
        token: '8c430f7f-1e21-4434-b256-c5e91fac4005',
        apiUrl: 'https://dev.govmap.gov.il/govmap/api/govmap.api.js',
        pageTitle: 'dev'
    }
};

const activeEnvConfig = ENV_CONFIG[env] || ENV_CONFIG.stage;

const GOVMAP_TOKEN = activeEnvConfig.token;
const GOVMAP_API_URL = activeEnvConfig.apiUrl;
const SANITY_PAGE_TITLE = activeEnvConfig.pageTitle;

/** Long tooltip sample (same as test/index.js tooltip1) for displayGeometries demos */
const tooltip1 = `iNet; 11-953-37 : מספר רישוי ואז אוה עדל שלה משה נמר נמר עד מתי כמה הודים כן לא אולי לא יודע אלפרד מה שלומך
Driver's name : GPS

תאריך: 2025-08-17
שעה: \r\n 16:30:51

סטטוס: ACC ;
פועל: מהירות:

65: קילומטראז': 5.97 ק"מ; אות:

19; סוללה: 100% רמת דלק: 0%
`;