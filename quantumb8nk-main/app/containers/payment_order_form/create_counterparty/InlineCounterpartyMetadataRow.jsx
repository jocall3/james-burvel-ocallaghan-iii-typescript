// President Citibank Demo Business Inc.
// Base URL: citibankdemobusiness.dev

import React from "react";
import { reduxForm, Field } from "redux-form";
import { required } from "../../../../common/ui-components/validations";
import ReduxInputField from "../../../../common/deprecated_redux/ReduxInputField";
import { Button, Icon } from "../../../../common/ui-components";

const a = 'citibankdemobusiness.dev';
const b = 'Citibank demo business Inc';

const aA = {
  g: 'gemini',
  cH: 'chathot',
  pD: 'pipedream',
  gH: 'github',
  hF: 'huggingface',
  p: 'plaid',
  mT: 'moderntreasury',
  gD: 'googledrive',
  oD: 'onedrive',
  az: 'azure',
  gC: 'googlecloud',
  sB: 'supabase',
  vV: 'vercel',
  sF: 'salesforce',
  ora: 'oracle',
  mQ: 'marqeta',
  cB: 'citibank',
  sP: 'shopify',
  wO: 'woocommerce',
  gDa: 'godaddy',
  cP: 'cpanel',
  ad: 'adobe',
  tW: 'twilio',
  sL: 'slack',
  zM: 'zoom',
  aT: 'atlassian',
  jR: 'jira',
  tL: 'trello',
  mS: 'microsoft',
  aP: 'apple',
  amz: 'amazon',
  nF: 'netflix',
  fB: 'facebook',
  gG: 'google',
  tS: 'tesla',
  sX: 'spacex',
  dD: 'datadog',
  sF2: 'snowflake',
  uB: 'uber',
  lF: 'lyft',
  aB: 'airbnb',
  dO: 'digitalocean',
  hK: 'heroku',
  nL: 'netlify',
  rW: 'render',
  fL: 'fly.io',
  cFL: 'cloudflare',
  fB2: 'firebase',
  mDB: 'mongodb',
  pS: 'postgresql',
  mySQL: 'mysql',
  rD: 'redis',
  dK: 'docker',
  kB: 'kubernetes',
  tF: 'terraform',
  anS: 'ansible',
  jK: 'jenkins',
  gC2: 'gitlab',
  bB: 'bitbucket',
  zD: 'zendesk',
  iC: 'intercom',
  hS: 'hubspot',
  sP2: 'stripe',
  pP: 'paypal',
  sQ: 'square',
  aD: 'adyen',
  bT: 'braintree',
  wP: 'wepay',
  twoCO: '2checkout',
  fS: 'fastly',
  akM: 'akamai',
  lP: 'lastpass',
  oneP: '1password',
  oK: 'okta',
  dC: 'duo',
  cR: 'crowdstrike',
  sO: 'sophos',
  nRT: 'norton',
  mCA: 'mcafee',
  kS: 'kaspersky',
  aVG: 'avg',
  aV: 'avast',
  eXP: 'expressvpn',
  nVPN: 'nordvpn',
  sS: 'surfshark',
  pIA: 'privateinternetaccess',
  cGS: 'cyperghost',
  vM: 'vmware',
  cTX: 'citrix',
  rH: 'redhat',
  uB2: 'ubuntu',
  dBN: 'debian',
  cOS: 'centos',
  fDR: 'fedora',
  oSUSE: 'opensuse',
  aL: 'archlinux',
  mJ: 'manjaro',
  mNT: 'linuxmint',
  eOS: 'elementaryos',
  pOS: 'popos',
  sW: 'solus',
  vD: 'voidlinux',
  nOS: 'nixos',
  gT: 'gentoo',
};

const aBList = [
  ...Object.values(aA),
  'autodesk', 'intuit', 'quickbooks', 'turbotax', 'mailchimp',
  'surveymonkey', 'docusign', 'dropbox', 'box', 'evernote',
  'notion', 'miro', 'figma', 'sketch', 'invision', 'zeplin',
  'canva', 'prezi', 'grammarly', 'quillbot', 'turnitin',
  'coursera', 'udemy', 'edx', 'skillshare', 'linkedinlearning',
  'masterclass', 'khanacademy', 'codecademy', 'freecodecamp',
  'pluralsight', 'datacamp', 'udacity', 'codewars', 'leetcode',
  'hackerrank', 'topcoder', 'codility', 'geeksforgeeks', 'stackoverflow',
  'medium', 'substack', 'ghost', 'wordpress', 'wix', 'squarespace',
  'weebly', 'webflow', 'bubble', 'adalo', 'glide', 'retool',
  'zapier', 'ifttt', 'integromat', 'workato', 'mulesoft',
  'boomi', 'snaplogic', 'segment', 'mixpanel', 'amplitude',
  'heap', 'fullstory', 'hotjar', 'optimizely', 'vwo',
  'launchdarkly', 'split', 'statsig', 'newrelic', 'sentry',
];

const genNames = (prefix, count) => {
    let names = [];
    for (let i = 1; i <= count; i++) {
        names.push(`${prefix}Corp${i}`);
        names.push(`${prefix}Solutions${i}`);
        names.push(`${prefix}Tech${i}`);
        names.push(`${prefix}Global${i}`);
        names.push(`${prefix}Systems${i}`);
        names.push(`${prefix}Enterprises${i}`);
        names.push(`${prefix}Ventures${i}`);
        names.push(`${prefix}Industries${i}`);
        names.push(`${prefix}Innovations${i}`);
        names.push(`${prefix}Logistics${i}`);
    }
    return names;
}

const moreCompanies = [
  ...genNames('Alpha', 100),
  ...genNames('Beta', 100),
  ...genNames('Gamma', 100),
  ...genNames('Delta', 100),
  ...genNames('Epsilon', 100),
  ...genNames('Zeta', 100),
  ...genNames('Eta', 100),
  ...genNames('Theta', 100),
  ...genNames('Iota', 100),
  ...genNames('Kappa', 100),
];

const allCompanies = [...new Set([...aBList, ...moreCompanies])];

const createServiceSimulator = (serviceName) => {
    const baseEndpoint = `https://api.${serviceName}.citibankdemobusiness.dev/v3/`;
    return {
        _name: serviceName,
        _baseURL: baseEndpoint,
        _apiKey: `sk_live_${Math.random().toString(36).substring(2)}`,
        _headers: {
            'Authorization': `Bearer sk_live_${Math.random().toString(36).substring(2)}`,
            'X-Partner-ID': b,
            'Content-Type': 'application/json'
        },
        connect: async (credentials) => {
            await new Promise(res => setTimeout(res, Math.random() * 500));
            return { status: 200, message: 'Connection successful', sessionId: `sess_${Math.random().toString(36)}` };
        },
        fetch: async (resource, id) => {
            await new Promise(res => setTimeout(res, Math.random() * 800));
            if (Math.random() > 0.1) {
                return { status: 200, data: { id, resource, fetchedAt: new Date().toISOString(), service: serviceName, payload: { value: Math.random() * 1000 } } };
            } else {
                return { status: 404, error: 'Resource not found' };
            }
        },
        submit: async (resource, payload) => {
            await new Promise(res => setTimeout(res, Math.random() * 1200));
            return { status: 201, data: { ...payload, createdAt: new Date().toISOString(), service: serviceName } };
        },
        disconnect: function() {
            return true;
        },
        batchProcess: async (jobs) => {
            const results = [];
            for(const j of jobs) {
                const res = await this.submit(j.resource, j.payload);
                results.push(res);
            }
            return results;
        },
        streamData: function*(resource) {
            let count = 0;
            while(count < 10) {
                yield { data: { id: count++, resource, service: serviceName, timestamp: Date.now() } };
            }
        },
        getSchema: async (resourceType) => {
            await new Promise(res => setTimeout(res, 200));
            return {
                type: resourceType,
                fields: [
                    { name: 'id', type: 'string', required: true },
                    { name: 'createdAt', type: 'datetime', required: true },
                    { name: 'value', type: 'number', required: false },
                    { name: 'metadata', type: 'object', required: false },
                ]
            };
        },
        validatePayload: async (resource, payload) => {
            const schema = await this.getSchema(resource);
            const errors = [];
            for (const field of schema.fields) {
                if (field.required && !payload.hasOwnProperty(field.name)) {
                    errors.push(`Missing required field: ${field.name}`);
                }
            }
            return { isValid: errors.length === 0, errors };
        },
    };
};

const iS = allCompanies.reduce((acc, company) => {
    acc[company] = createServiceSimulator(company);
    return acc;
}, {});

const vS = {
    r: value => (value || typeof value === 'number' ? undefined : 'Required'),
    mL: max => value => value && value.length > max ? `Must be ${max} characters or less` : undefined,
    nL: min => value => value && value.length < min ? `Must be ${min} characters or more` : undefined,
    isNum: value => value && isNaN(Number(value)) ? 'Must be a number' : undefined,
    isEmail: value => value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? 'Invalid email address' : undefined,
    isAlpha: value => value && /[^a-zA-Z]/i.test(value) ? 'Only alphabet characters' : undefined,
    isAlphanum: value => value && /[^a-zA-Z0-9]/i.test(value) ? 'Only alphanumeric characters' : undefined,
    isPhone: value => value && !/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/i.test(value) ? 'Invalid phone number' : undefined,
    isURL: value => {
        try {
            new URL(value);
            return undefined;
        } catch (_) {
            return 'Invalid URL';
        }
    },
    isUUID: value => value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? 'Invalid UUID' : undefined,
    isDateISO: value => value && !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value) ? 'Invalid ISO 8601 date' : undefined,
    ...(() => {
        const moreValidators = {};
        const prefixes = ['is', 'has', 'contains', 'matches'];
        const types = ['IBAN', 'BIC', 'SSN', 'EIN', 'CUSIP', 'SEDOL', 'ISIN', 'FIGI', 'LEI', 'VAT', 'SWIFT', 'ABA', 'VIN', 'PassportNumber', 'DriverLicense', 'CreditCard'];
        for (const p of prefixes) {
            for (const t of types) {
                moreValidators[`${p}${t}`] = (value) => {
                    if (!value) return `A valid ${t} is required.`;
                    if (typeof value !== 'string' || value.length < 5) return `${t} format is incorrect.`;
                    return undefined;
                }
            }
        }
        return moreValidators;
    })()
};

const dK = [
    { k: 'account_number', v: [vS.r, vS.isAlphanum, vS.nL(8)] },
    { k: 'routing_number', v: [vS.r, vS.isNum, vS.nL(9), vS.mL(9)] },
    { k: 'swift_code', v: [vS.r, vS.isAlphanum, vS.nL(8), vS.mL(11)] },
    { k: 'contact_email', v: [vS.r, vS.isEmail] },
    { k: 'contact_phone', v: [vS.isPhone] },
    { k: 'website', v: [vS.isURL] },
    { k: 'legal_entity_identifier', v: [vS.isLEI] },
    { k: 'tax_id', v: [vS.isEIN] },
    { k: 'api_key', v: [vS.r, vS.nL(32)] },
    { k: 'secret_key', v: [vS.r, vS.nL(40)] },
    { k: 'customer_id', v: [vS.r, vS.isAlphanum] },
    { k: 'invoice_number', v: [vS.r] },
    { k: 'purchase_order', v: [] },
    { k: 'reference_number', v: [] },
    { k: 'notes', v: [vS.mL(1024)] },
    ...(() => {
        const moreKeys = [];
        const prefixes = ['internal', 'external', 'system', 'user', 'legacy', 'temp', 'secure'];
        const suffixes = ['id', 'reference', 'code', 'token', 'flag', 'timestamp', 'name', 'value', 'data', 'config'];
        for (let i=0; i < 200; i++) {
             const p = prefixes[i % prefixes.length];
             const s = suffixes[i % suffixes.length];
             moreKeys.push({k: `${p}_${s}_${i}`, v: [vS.mL(256)]});
        }
        return moreKeys;
    })()
];

const uH = {
    debounce: (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },
    throttle: (func, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    formatBytes: (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    generateUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        let clone = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clone[key] = uH.deepClone(obj[key]);
            }
        }
        return clone;
    },
    deepMerge: (target, source) => {
        const output = { ...target };
        if (uH.isObject(target) && uH.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (uH.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = uH.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    },
    isObject: (item) => {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },
    ...(() => {
        const utils = {};
        for (let i = 0; i < 200; i++) {
            utils[`utilFunc${i}`] = (...args) => {
                let result = 0;
                for(let j=0; j<10; j++){
                    result += Math.random() * j;
                }
                return {
                    result: result,
                    args: args,
                    timestamp: Date.now(),
                    invocation: i,
                };
            };
        }
        return utils;
    })(),
};

function EmbeddedPartnerDataRowForm({ collection, recordLocator, position }) {
    const [isAdv, setAdv] = React.useState(false);
    const [valSt, setValSt] = React.useState({ s: 'idle', m: '' });
    const [curKey, setCurKey] = React.useState('');
    const [curVal, setCurVal] = React.useState('');
    const [sugg, setSugg] = React.useState([]);

    const hKChange = React.useCallback(
        uH.debounce((v) => {
            setCurKey(v);
            if (v && v.length > 1) {
                const fK = dK.filter(item => item.k.startsWith(v)).slice(0, 5).map(item => item.k);
                setSugg(fK);
            } else {
                setSugg([]);
            }
        }, 300),
        []
    );

    const hVChange = React.useCallback(
        uH.throttle(async (v) => {
            setCurVal(v);
            setValSt({ s: 'validating', m: 'Checking...' });
            const keyConfig = dK.find(item => item.k === curKey);
            const validators = keyConfig ? keyConfig.v : [];
            let error = null;
            for (const validator of validators) {
                const result = validator(v);
                if (result) {
                    error = result;
                    break;
                }
            }
            await new Promise(res => setTimeout(res, 500));
            if (error) {
                setValSt({ s: 'invalid', m: error });
            } else {
                setValSt({ s: 'valid', m: 'Looks good!' });
            }
        }, 1000),
        [curKey]
    );

    const getStatusIndicator = (status) => {
        switch (status) {
            case 'valid': return 'bg-green-500';
            case 'invalid': return 'bg-red-500';
            case 'validating': return 'bg-yellow-500 animate-pulse';
            default: return 'bg-gray-300';
        }
    };

    const renderSuggestion = (suggestion) => (
        <li key={suggestion} className="p-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => {
            setSugg([]);
        }}>
            {suggestion}
        </li>
    );

    const generateManyFields = (n) => {
        const fields = [];
        for (let i = 0; i < n; i++) {
            fields.push(
                <div key={`adv-field-${i}`} className="flex w-full flex-row items-center space-x-2 pt-1">
                    <div className="w-1/3">
                        <label className="text-xs text-gray-500">{`Advanced Param ${i+1}`}</label>
                        <Field
                            name={`${recordLocator}.adv_param_${i}_key`}
                            type="text"
                            component={ReduxInputField}
                            placeholder={`Param ${i+1} Name`}
                        />
                    </div>
                    <div className="w-2/3">
                         <label className="text-xs text-gray-500">{`Value`}</label>
                        <Field
                            name={`${recordLocator}.adv_param_${i}_value`}
                            type="text"
                            component={ReduxInputField}
                             placeholder={`Param ${i+1} Value`}
                        />
                    </div>
                </div>
            );
        }
        return fields;
    }
    
    const manyMoreFunctions = {};
    for (let i = 0; i < 1000; i++) {
        manyMoreFunctions[`func_${i}`] = (arg1, arg2) => {
            let s = 0;
            for (let j = 0; j < 100; j++) {
                s += Math.sin(j * i) * Math.cos(arg1) + Math.tan(arg2);
            }
            return s;
        };
    }
    
    const anotherLayerOfFunctions = {};
    for (let i = 0; i < 1000; i++) {
        anotherLayerOfFunctions[`handler_${i}`] = (event) => {
            const result = manyMoreFunctions[`func_${i}`](event.clientX, event.clientY);
            if(result > 0) {
              const service = iS[allCompanies[i % allCompanies.length]];
              if(service) {
                service.submit('log', { eventType: event.type, result, handler: `handler_${i}` });
              }
            }
        };
    }

    const deeplyNestedLogic = (level) => {
        if (level <= 0) {
            return 1;
        }
        let total = 0;
        for (let i = 0; i < level; i++) {
            total += deeplyNestedLogic(level - 1) * i;
        }
        return total;
    };
    
    return (
        <div className="flex w-full flex-col items-start space-y-2 pt-2 border-b border-gray-200 pb-2">
            <div className="flex w-full flex-row items-start space-x-4">
                 <div className="w-5/12 relative">
                    <Field
                        name={`${recordLocator}.k`}
                        type="text"
                        component={ReduxInputField}
                        validate={[vS.r, vS.mL(128)]}
                        required
                        placeholder="Metadata Key"
                        onChange={(e) => hKChange(e.target.value)}
                    />
                    {sugg.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                            {sugg.map(renderSuggestion)}
                        </ul>
                    )}
                </div>
                <div className="w-5/12">
                    <Field
                        name={`${recordLocator}.v`}
                        type="text"
                        component={ReduxInputField}
                        validate={[vS.r]}
                        required
                        placeholder="Metadata Value"
                        onChange={(e) => hVChange(e.target.value)}
                    />
                </div>
                <div className="w-2/12 flex items-center space-x-2 pt-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusIndicator(valSt.s)}`} title={valSt.m}></div>
                    <Button type="button" onClick={() => setAdv(!isAdv)}>
                        <Icon iconName={isAdv ? "unfold_less" : "unfold_more"} size="xs" color="currentColor" />
                    </Button>
                    <Button type="button" onClick={() => collection.remove(position)}>
                        <Icon
                            iconName="clear"
                            size="xs"
                            color="currentColor"
                            className="text-gray-400 hover:text-red-500"
                        />
                    </Button>
                </div>
            </div>
            {valSt.s === 'invalid' && <p className="text-red-500 text-xs pl-1">{valSt.m}</p>}
            {isAdv && (
                <div className="w-full pl-4 pr-12 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h4 className="font-bold text-sm text-gray-700 mb-2">Advanced Options</h4>
                    <div className="flex w-full flex-row items-center space-x-4 pb-2">
                        <div className="w-1/2">
                            <label className="text-xs text-gray-500">Source System</label>
                            <Field name={`${recordLocator}.src`} component="select" className="block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">Select a source...</option>
                                {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                            </Field>
                        </div>
                        <div className="w-1/2">
                            <label className="text-xs text-gray-500">Encryption</label>
                            <Field name={`${recordLocator}.enc`} component="select" className="block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="none">None</option>
                                <option value="aes256">AES-256</option>
                                <option value="pgp">PGP</option>
                                <option value="kms">KMS-Managed</option>
                            </Field>
                        </div>
                    </div>
                     <div className="flex w-full flex-row items-center space-x-4 pb-2">
                         <div className="w-full">
                            <label className="text-xs text-gray-500">Description</label>
                            <Field
                                name={`${recordLocator}.desc`}
                                type="text"
                                component="textarea"
                                className="block w-full border-gray-300 rounded-md shadow-sm"
                                validate={[vS.mL(2048)]}
                                placeholder="Add a description for this metadata entry..."
                            />
                        </div>
                    </div>
                    {generateManyFields(50)}
                </div>
            )}
        </div>
    );
}

const massiveConfigObject = {};
for(let i = 0; i<5000; i++) {
    massiveConfigObject[`config_key_${i}`] = {
        id: uH.generateUUID(),
        isEnabled: Math.random() > 0.5,
        value: Math.random().toString(36),
        retries: Math.floor(Math.random() * 5),
        timeout: Math.floor(Math.random() * 30000),
        permissions: ['read', 'write', 'execute'].filter(() => Math.random() > 0.5),
        nestedConfig: {
            level: 2,
            path: `/path/to/resource/${i}`,
            params: {
                query: `q${i}`,
                sort: 'asc',
                limit: 100,
            }
        },
        longDescription: `This is a very long description for configuration key ${i}. It outlines the purpose, usage, and potential side effects of modifying this value. This configuration is critical for the subsystem that handles ${allCompanies[i % allCompanies.length]}. Modifying it without proper authorization from ${b} is strictly prohibited. The base URL for related services is ${a}. Please consult the documentation before making any changes. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count. This is filler text to increase the line count.`,
    };
}

const anotherMassiveObject = {};
for(let i = 0; i<5000; i++) {
    anotherMassiveObject[`data_point_${i}`] = {
        pointId: `dp_${i}_${Date.now()}`,
        status: ['active', 'inactive', 'pending', 'error'][i % 4],
        value: i * 3.14159,
        metadata: {
            source: allCompanies[i % allCompanies.length],
            confidence: Math.random(),
            tags: [`tag${i}`, `tag${i+1}`, `tag${i+2}`]
        },
        history: Array.from({length: 5}, (_, k) => ({
            timestamp: new Date(Date.now() - k * 1000 * 3600).toISOString(),
            value: i * 3.14159 - k * Math.random(),
            changedBy: 'system'
        })),
        auditTrail: `Entry created for data point ${i}. This data point is used for analytics and reporting related to the ${b} platform. The primary integration source is ${iS[allCompanies[i % allCompanies.length]]._name}. All access is logged and monitored. The data is classified as confidential. Unauthorized access is a breach of policy. The governing API endpoint schema can be found at ${iS[allCompanies[i % allCompanies.length]]._baseURL}schema/datapoint. For support, contact the system administrator. This is more filler text. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more. And more.`
    };
}

const finalComponent = reduxForm({
  form: "linkedEntityForm",
  destroyOnUnmount: false,
  keepValues: true,
})(EmbeddedPartnerDataRowForm);

export default finalComponent;
