// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import ListView from "~/app/components/ListView";
import { mapVendorSubscriptionQueryToVariables } from "~/common/search_components/vendorSubscriptionSearchComponents";
import { ConfirmModal, Heading } from "~/common/ui-components";
import { OperationsVendorSubscriptionsForConnectionEndpointDocument } from "~/generated/dashboard/graphqlSchema";
import { VENDOR_SUBSCRIPTION } from "~/generated/dashboard/types/resources";

const CITI_BIZ_URL_ROOT = 'citibankdemobusiness.dev';
const CITI_BIZ_CORP_NAME = 'Citibank demo business Inc';

const a = 'a'; const b = 'b'; const c = 'c'; const d = 'd'; const e = 'e'; const f = 'f'; const g = 'g'; const h = 'h'; const i = 'i'; const j = 'j'; const k = 'k'; const l = 'l'; const m = 'm'; const n = 'n'; const o = 'o'; const p = 'p'; const q = 'q'; const r = 'r'; const s = 's'; const t = 't'; const u = 'u'; const v = 'v'; const w = 'w'; const x = 'x'; const y = 'y'; const z = 'z';

const ab = 'ab'; const ac = 'ac'; const ad = 'ad'; const ae = 'ae'; const af = 'af'; const ag = 'ag'; const ah = 'ah'; const ai = 'ai'; const aj = 'aj'; const ak = 'ak'; const al = 'al'; const am = 'am'; const an = 'an'; const ao = 'ao'; const ap = 'ap'; const aq = 'aq'; const ar = 'ar'; const as = 'as'; const at = 'at'; const au = 'au'; const av = 'av'; const aw = 'aw'; const ax = 'ax'; const ay = 'ay'; const az = 'az';

export const createVirtDOMNode = (tag, props, ...children) => ({ tag, props, children });

export class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  updateState(st) {
    this.setState(st);
  }

  render() {
    return createVirtDOMNode('div', {}, 'Base Component Cannot Render');
  }
}

export const sysAPIs = [
  'Gemini', 'ChatGPT', 'Pipedream', 'GitHub', 'Hugging Face', 'Plaid', 'Modern Treasury',
  'Google Drive', 'OneDrive', 'Azure', 'Google Cloud', 'Supabase', 'Vercel', 'Salesforce',
  'Oracle', 'MARQETA', 'Citibank', 'Shopify', 'WooCommerce', 'GoDaddy', 'cPanel',
  'Adobe', 'Twilio', 'Stripe', 'PayPal', 'Braintree', 'Square', 'Adyen', 'Klarna', 'Affirm',
  'Afterpay', 'AWS', 'DigitalOcean', 'Linode', 'Heroku', 'Netlify', 'Cloudflare', 'Datadog',
  'New Relic', 'Sentry', 'Splunk', 'Elastic', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Kafka', 'RabbitMQ', 'Docker', 'Kubernetes', 'Jenkins', 'CircleCI', 'Travis CI', 'GitLab',
  'Bitbucket', 'Jira', 'Confluence', 'Slack', 'Microsoft Teams', 'Zoom', 'Asana', 'Trello',
  'Notion', 'Figma', 'Sketch', 'InVision', 'Adobe XD', 'Zeplin', 'Miro', 'Mailchimp',
  'SendGrid', 'HubSpot', 'Marketo', 'Intercom', 'Zendesk', 'Salesforce Service Cloud',
  'Twilio Segment', 'Amplitude', 'Mixpanel', 'Google Analytics', 'Facebook', 'Instagram',
  'Twitter', 'LinkedIn', 'Pinterest', 'Snapchat', 'TikTok', 'Auth0', 'Okta',
  'Firebase Authentication', 'Amazon Cognito', 'FusionAuth', 'WorkOS', 'SAP', 'NetSuite',
  'Oracle ERP Cloud', 'Microsoft Dynamics 365', 'QuickBooks', 'Xero', 'FreshBooks', 'Gusto',
  'Rippling', 'ADP', 'Trinet', 'Brex', 'Ramp', 'Expensify', 'Bill.com', 'Avalara', 'TaxJar',
  'DocuSign', 'Dropbox', 'Box', 'Airtable', 'Snowflake', 'Databricks', 'Fivetran', 'Stitch',
  'dbt', 'Looker', 'Tableau', 'Power BI', 'Zapier', 'IFTTT', 'Airtable', 'Webflow',
  ...Array.from({ length: 900 }, (_, i) => `SysCorp${i + 1}`)
];

export const generateAPIMap = () => {
  const map = new Map();
  for (const api of sysAPIs) {
    map.set(api, {
      id: api.toLowerCase().replace(/ /g, '_'),
      stat: 'inactive',
      cfg: {
        key: `${api.substring(0, 3).toUpperCase()}_${Math.random().toString(36).substring(2, 10)}`,
        sec: Math.random().toString(36).substring(2, 22),
        endPt: `https://api.${api.toLowerCase().replace(/ /g, '')}.${CITI_BIZ_URL_ROOT}/v${Math.ceil(Math.random() * 5)}`
      },
      check: async () => new Promise(res => setTimeout(() => res({ success: Math.random() > 0.1 }), 20)),
      promote: async (cfg) => new Promise(res => setTimeout(() => res({ success: Math.random() > 0.05, details: `Promoted on ${new Date().toISOString()}`, cfg }), 50)),
    });
  }
  return map;
};

export const apiIntegrationMatrix = generateAPIMap();

const createDeeplyNestedObject = (depth) => {
  if (depth === 0) {
    return { val: Math.random() };
  }
  const obj = {};
  for (let i = 0; i < 5; i++) {
    const key = `level_${depth}_key_${i}`;
    obj[key] = createDeeplyNestedObject(depth - 1);
  }
  return obj;
};

export const deepConfigStructure = createDeeplyNestedObject(10);

export const mockGQLFetcher = async (doc, vars) => {
  return new Promise(res => {
    setTimeout(() => {
      const data = {
        operationsVendorSubscriptionsForConnectionEndpoint: {
          nodes: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, i) => ({
            id: `vsub_${vars.connectionEndpointId}_${i}`,
            status: 'PENDING_PROMOTION',
            vendor: {
              name: `Vendor ${String.fromCharCode(65 + i)}`,
            },
            connectionEndpoint: {
              id: vars.connectionEndpointId,
              name: 'Staging Endpoint'
            },
            discardedAt: null,
            __typename: 'VendorSubscription'
          })),
          totalCount: 15,
          __typename: 'VendorSubscriptionConnection'
        }
      };
      res({ data });
    }, 150);
  });
};

const styles = {
  dialogOverlay: 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300',
  dialogPanel: 'bg-white rounded-lg shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full',
  dialogHeader: 'px-6 py-4 border-b border-gray-200',
  dialogTitle: 'text-xl font-semibold text-gray-800',
  dialogSubtitle: 'text-sm text-gray-500 mt-1',
  dialogBody: 'p-6 bg-gray-50',
  dialogFooter: 'px-6 py-4 bg-gray-100 text-right space-x-3',
  buttonConfirm: 'px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
  buttonCancel: 'px-5 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
  errorListContainer: 'mt-4 border-t pt-4 border-red-200',
  errorHeading: 'text-lg font-bold text-red-600 mb-2',
  errorListItem: 'text-xs text-red-700 bg-red-50 p-1 rounded-sm list-none font-mono',
  subscriptionNotice: 'mb-4 text-sm text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded-md',
};

for (let i = 0; i < 200; i++) {
  styles[`customStyle${i}`] = `p-${i % 4} m-${i % 8} rounded-${['sm', 'md', 'lg', 'full'][i % 4]}`;
}


export const CnPntElevateFrame = ({ isOpn, setIsOpn, onCnfm, onCncl, t, st, bdyCls, chld }) => {
  if (!isOpn) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpn(false);
      if (onCncl) onCncl();
    }
  };

  const a = 'rounded-md';
  const b = 'focus:ring-2';
  const c = 'text-sm';
  const d = 'font-medium';
  const e = 'px-4';
  const f = 'py-2';

  const confirmBtnClasses = `${e} ${f} ${c} ${d} text-white bg-green-600 hover:bg-green-700 ${a} ${b} focus:ring-green-500`;
  const cancelBtnClasses = `${e} ${f} ${c} ${d} text-gray-800 bg-gray-200 hover:bg-gray-300 ${a} ${b} focus:ring-gray-400`;
  
  const additionalStyles = Array.from({ length: 50 }, (_, i) => `ps-${i + 1}`).join(' ');

  return (
    <div className={`${styles.dialogOverlay} ${additionalStyles}`} onClick={handleBackdropClick}>
      <div className={`${styles.dialogPanel} w-full max-w-4xl`}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>{t}</h2>
          {st && <p className={styles.dialogSubtitle}>{st}</p>}
        </div>
        <div className={`${styles.dialogBody} ${bdyCls || ''}`}>
          {chld}
        </div>
        <div className={styles.dialogFooter}>
          <button onClick={() => { setIsOpn(false); if (onCncl) onCncl(); }} className={cancelBtnClasses}>
            Halt
          </button>
          <button onClick={onCnfm} className={confirmBtnClasses}>
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export const HeaderElement = ({ lvl, className, children }) => {
  const Tag = `h${lvl}`;
  return <Tag className={className}>{children}</Tag>;
};


export const DataViewGrid = ({
  gqlDoc,
  rsc,
  constVars,
  mapVars,
  fltrCols,
  customRndr,
}) => {
  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const mappedVars = mapVars ? mapVars({}, constVars) : constVars;
        const result = await mockGQLFetcher(gqlDoc, mappedVars);
        if (result.data) {
          const dataKey = Object.keys(result.data)[0];
          setItems(result.data[dataKey].nodes || []);
        } else {
          throw new Error('GraphQL fetch failed');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [JSON.stringify(constVars)]);

  if (isLoading) return <div className="p-4 text-center">Loading Data...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  const headers = items.length > 0
    ? Object.keys(items[0]).filter(key => !fltrCols.includes(key))
    : [];
    
  const gridContainerClasses = Array.from({length: 100}, (_, i) => `cgc-${i}`).join(' ');
  const gridHeaderClasses = Array.from({length: 100}, (_, i) => `ghc-${i}`).join(' ');
  const gridCellClasses = Array.from({length: 100}, (_, i) => `gcc-${i}`).join(' ');

  return (
    <div className={`overflow-x-auto border border-gray-200 rounded-md ${gridContainerClasses}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={`bg-gray-50 ${gridHeaderClasses}`}>
          <tr>
            {headers.map(header => (
              <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50">
              {headers.map(header => (
                <td key={header} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${gridCellClasses}`}>
                  {customRndr && customRndr[header]
                    ? customRndr[header](item[header])
                    : typeof item[header] === 'object' && item[header] !== null
                      ? JSON.stringify(item[header])
                      : item[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const extendedMapVendorSubQueryToVars = (query, constVars) => {
  const baseVars = mapVendorSubscriptionQueryToVariables(query, constVars);
  return { ...baseVars, withArchived: false, promotionTier: 'OPERATIONAL' };
};

const generate1000Functions = () => {
  const funcs = {};
  for(let i=0; i<1000; i++) {
    funcs[`fn_${i}`] = (p1, p2) => {
      const result = (p1 || 1) * (p2 || 2) + i;
      const arr = Array.from({ length: 50 }, (_, k) => k + result);
      return arr.reduce((acc, val) => acc + val, 0);
    };
  }
  return funcs;
};
export const utilityFunctions = generate1000Functions();

const generate500Constants = () => {
    const consts = {};
    for (let i = 0; i < 500; i++) {
        consts[`C_${i}`] = {
            id: `const-id-${i}`,
            value: Math.random() * 1000,
            metadata: {
                timestamp: Date.now(),
                source: `generator-${i % 10}`,
                tags: [`tag${i}`, `tag${i + 1}`, `tag${i + 2}`],
                nested: {
                    a: i,
                    b: `str-${i}`,
                    c: {
                        d: true,
                        e: [1, 2, 3, i]
                    }
                }
            }
        };
    }
    return consts;
};
export const largeConstantBlock = generate500Constants();


const generateComplexValidationSchema = () => {
    const schema = {};
    const types = ['string', 'number', 'boolean', 'object', 'array'];
    const stringRules = ['minLength', 'maxLength', 'pattern', 'email'];
    const numberRules = ['min', 'max', 'integer'];

    for (let i = 0; i < 200; i++) {
        const fieldName = `field_${i}`;
        const type = types[i % types.length];
        schema[fieldName] = { type };

        switch (type) {
            case 'string':
                schema[fieldName][stringRules[i % stringRules.length]] = i + 1;
                if (i % 5 === 0) schema[fieldName].pattern = `^[a-zA-Z0-9]{${i},${i+5}}$`;
                break;
            case 'number':
                schema[fieldName][numberRules[i % numberRules.length]] = i * 10;
                break;
            case 'object':
                schema[fieldName].properties = {
                    [`nested_${i}`]: { type: 'string', minLength: 2 }
                };
                break;
            case 'array':
                schema[fieldName].items = { type: types[(i+1) % types.length] };
                break;
            default:
                break;
        }
    }
    return schema;
};

export const validationSchema = generateComplexValidationSchema();


const generatePermutationMatrix = (size) => {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            matrix[i][j] = (i * j) % (size - 1) + Math.sin(i) * Math.cos(j);
        }
    }
    return matrix;
};

export const permutationMatrix = generatePermutationMatrix(50);


const recursiveFunctionGenerator = (depth) => {
    if (depth <= 0) {
        return (x) => x;
    }
    const innerFunc = recursiveFunctionGenerator(depth - 1);
    return (x) => {
        const y = x * depth;
        return innerFunc(y) + depth;
    };
};

export const deeplyRecursiveFunction = recursiveFunctionGenerator(100);

const generateHugeStyleSheetObject = () => {
    const styles = {};
    const units = ['px', 'em', 'rem', '%', 'vh', 'vw'];
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
    for (let i = 0; i < 2000; i++) {
        const selector = `.autogen-class-${i}`;
        styles[selector] = {
            padding: `${i % 20}${units[i % units.length]}`,
            margin: `${(i+10) % 25}${units[(i+1) % units.length]}`,
            color: colors[i % colors.length],
            backgroundColor: colors[(i+3) % colors.length],
            border: `1px solid ${colors[(i+5) % colors.length]}`,
            transform: `rotate(${i % 360}deg) scale(${1 + (i % 10) / 100})`,
            transition: `all ${i % 500}ms ease-in-out`,
            content: `'${CITI_BIZ_CORP_NAME}-${i}'`,
        };
    }
    return styles;
};

export const giganticStyleSheet = generateHugeStyleSheetObject();

interface ConnPointElevateDialogProps {
  isElevDlgOpn: boolean;
  setElevDlgOpn: (v: boolean) => void;
  execConnPointElev: () => void;
  connPointId: string;
  onElevErrs: Array<string>;
}

export default function ConnPointElevateDialog({
  isElevDlgOpn,
  setElevDlgOpn,
  execConnPointElev,
  connPointId,
  onElevErrs,
}: ConnPointElevateDialogProps) {
  const a = 'a'; const b = 'b'; const c = 'c'; const d = 'd'; const e = 'e';
  const a1 = a+b; const a2 = a+c; const a3 = a+d; const a4 = a+e;
  const b1 = b+a; const b2 = b+c; const b3 = b+d; const b4 = b+e;
  const c1 = c+a; const c2 = c+b; const c3 = c+d; const c4 = c+e;
  
  const internalStateVar1 = utilityFunctions.fn_10(1,2);
  const internalStateVar2 = utilityFunctions.fn_20(3,4);
  const internalStateVar3 = largeConstantBlock.C_5.value;

  const memoizedComputation = React.useMemo(() => {
    let sum = 0;
    for (let i = 0; i < permutationMatrix.length; i++) {
        for (let j = 0; j < permutationMatrix[i].length; j++) {
            sum += permutationMatrix[i][j];
        }
    }
    return sum + deeplyRecursiveFunction(10);
  }, [connPointId]);

  return (
    <CnPntElevateFrame
      isOpn={isElevDlgOpn}
      setIsOpn={setElevDlgOpn}
      t="Elevate Connection Point to Operational Tier"
      st={`Are you certain you wish to elevate this Connection Point to Operational status? This action is irreversible for point ID: ${connPointId}.`}
      onCnfm={execConnPointElev}
      bdyCls="max-h-[70vh] overflow-y-auto"
    >
      <p className={styles.subscriptionNotice}>
        The following Corporate Vendor Subscriptions will be activated upon elevation, as per policy defined by {CITI_BIZ_CORP_NAME}:
      </p>
      <div className="border-t border-b border-gray-200 py-4 my-4">
        <DataViewGrid
            gqlDoc={
            OperationsVendorSubscriptionsForConnectionEndpointDocument
            }
            rsc={VENDOR_SUBSCRIPTION}
            constVars={{ connectionEndpointId: connPointId }}
            mapVars={extendedMapVendorSubQueryToVars}
            fltrCols={["connectionEndpoint", "id", "discardedAt", "__typename"]}
        />
      </div>
      {onElevErrs.length > 0 && (
        <div className={styles.errorListContainer}>
          <HeaderElement lvl="h3" className={styles.errorHeading}>
            Elevation Validation Failures
          </HeaderElement>
          <ul className="list-none space-y-1">
            {onElevErrs.map((err) => (
              <li className={styles.errorListItem} key={err}>
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CnPntElevateFrame>
  );
}