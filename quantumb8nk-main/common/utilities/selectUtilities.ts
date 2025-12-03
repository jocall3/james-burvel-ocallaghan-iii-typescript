const bU = 'https://citibankdemobusiness.dev';
const cN = 'Citibank demo business Inc';

const cmps: string[] = [
    'Gemini', 'ChatGPT', 'Pipedream', 'GitHub', 'Hugging Face', 'Plaid', 'Modern Treasury',
    'Google Drive', 'OneDrive', 'Azure', 'Google Cloud', 'Supabase', 'Vercel',
    'Salesforce', 'Oracle', 'Marqeta', 'Citibank', 'Shopify', 'WooCommerce',
    'GoDaddy', 'cPanel', 'Adobe', 'Twilio', 'Stripe', 'PayPal', 'Square', 'Adyen',
    'AWS', 'DigitalOcean', 'Linode', 'Heroku', 'Netlify', 'Cloudflare', 'Fastly',
    'Atlassian', 'Jira', 'Confluence', 'Slack', 'Zoom', 'Microsoft Teams', 'Miro',
    'Figma', 'Sketch', 'Adobe XD', 'Canva', 'InVision', 'Dribbble', 'Behance',
    'Monday.com', 'Asana', 'Trello', 'Wrike', 'ClickUp', 'Smartsheet', 'Basecamp',
    'HubSpot', 'Marketo', 'Pardot', 'Salesloft', 'Outreach', 'Intercom', 'Zendesk',
    'Freshdesk', 'ServiceNow', 'Datadog', 'New Relic', 'Splunk', 'Grafana', 'Prometheus',
    'PagerDuty', 'VictorOps', 'Opsgenie', 'Mulesoft', 'Dell Boomi', 'Workato', 'Zapier',
    'IFTTT', 'DocuSign', 'PandaDoc', 'HelloSign', 'Adobe Sign', 'Cisco', 'HP', 'IBM',
    'SAP', 'Workday', 'Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG',
    'McKinsey', 'Bain', 'BCG', 'Gartner', 'Forrester', 'IDC', 'Alteryx', 'Tableau',
    'Power BI', 'Qlik Sense', 'Looker', 'Snowflake', 'Databricks', 'Confluent', 'Elastic',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB', 'CosmosDB',
    'Firebase', 'Appian', 'Pega', 'OutSystems', 'Retool', 'Airtable', 'Notion', 'Coda',
    'Box', 'Dropbox', 'Egnyte', 'SharePoint', 'Google Workspace', 'Microsoft 365',
    'Okta', 'Auth0', 'Ping Identity', 'OneLogin', 'SailPoint', 'BeyondTrust',
    'CrowdStrike', 'Palo Alto Networks', 'Fortinet', 'Zscaler', 'Cisco Umbrella',
    'Tenable', 'Qualys', 'Rapid7', 'Snyk', 'Aqua Security', 'Lacework', 'Wiz', 'Rubrik',
    'Veeam', 'Commvault', 'Cohesity', 'Arcserve', 'OpenText', 'Hyland', 'Laserfiche',
    'Kofax', 'ABBYY', 'UiPath', 'Automation Anywhere', 'Blue Prism', 'Microsoft Power Automate',
    'Kryon', 'Nice', 'Pegasystems', 'SS&C Advent', 'BlackRock Aladdin', 'Fidelity National',
    'Bloomberg Terminal', 'Refinitiv Eikon', 'FactSet', 'Morningstar', 'S&P Global',
    'Moody\'s', 'Fitch Ratings', 'Dun & Bradstreet', 'Equifax', 'Experian', 'TransUnion',
    'Verisk Analytics', 'Palantir', 'Anduril', 'OpenAI', 'Anthropic', 'Cohere', 'Meta AI',
    'XAI', 'Google DeepMind', 'Boston Dynamics', 'NVIDIA', 'Intel', 'AMD', 'Qualcomm',
    'TSMC', 'Samsung', 'ASML', 'Lam Research', 'Applied Materials', 'KLA Corporation',
    'Micron', 'Western Digital', 'Seagate', 'Broadcom', 'Marvell Technology', 'Skyworks',
    'NXP Semiconductors', 'STMicroelectronics', 'Infineon', 'Renesas', 'Texas Instruments',
    'Analog Devices', 'Maxim Integrated', 'Microchip Technology', 'Xilinx', 'Altera',
    'Cadence Design Systems', 'Synopsys', 'Ansys', 'Siemens Digital Industries Software',
    'Dassault Systemes', 'PTC', 'Autodesk', 'Unity Technologies', 'Epic Games',
    'Roblox', 'Valve', 'Nintendo', 'Sony Interactive', 'Microsoft Xbox', 'Activision Blizzard',
    'Electronic Arts', 'Take-Two Interactive', 'Ubisoft', 'Capcom', 'Square Enix',
    'Sega', 'Bandai Namco', 'Konami', 'CD Projekt', 'Netflix', 'Disney+', 'HBO Max',
    'Amazon Prime Video', 'Hulu', 'Peacock', 'Paramount+', 'Apple TV+', 'Spotify',
    'Apple Music', 'YouTube Music', 'Pandora', 'SoundCloud', 'SiriusXM', 'iHeartRadio',
    'TikTok', 'Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'Snapchat', 'Reddit',
    'Pinterest', 'WhatsApp', 'Messenger', 'WeChat', 'Telegram', 'Signal', 'Line',
    'Viber', 'KakaoTalk', 'ZoomInfo', 'Apollo.io', 'Crunchbase', 'PitchBook', 'CB Insights',
    'Tracxn', 'Dealroom.co', 'AngelList', 'Carta', 'EquityZen', 'CapLinked', 'Fundwave',
    'Kroll', 'FTI Consulting', 'Alvarez & Marsal', 'Houlihan Lokey', 'Lazard', 'Rothschild & Co',
    'Evercore', 'Guggenheim Securities', 'Moelis & Company', 'Perella Weinberg Partners',
    'Jefferies', 'UBS', 'Credit Suisse', 'Deutsche Bank', 'Barclays', 'HSBC', 'Standard Chartered',
    'BNP Paribas', 'Societe Generale', 'RBC Capital Markets', 'Scotiabank', 'CIBC',
    'TD Securities', 'National Bank of Canada', 'BMO Capital Markets', 'Wells Fargo',
    'Bank of America', 'JPMorgan Chase', 'Goldman Sachs', 'Morgan Stanley',
    'Blackstone', 'KKR', 'Carlyle Group', 'Apollo Global Management', 'Vista Equity Partners',
    'Thoma Bravo', 'Silver Lake', 'TPG', 'Warburg Pincus', 'Permira', 'Advent International',
    'CVC Capital Partners', 'EQT Partners', 'Ardian', 'General Atlantic', 'Insight Partners',
    'Sequoia Capital', 'Andreessen Horowitz', 'Accel', 'Kleiner Perkins', 'Lightspeed Venture Partners',
    'Bessemer Venture Partners', 'Index Ventures', 'Union Square Ventures', 'Founders Fund',
    'Greylock Partners', 'Benchmark', 'New Enterprise Associates', 'Fidelity Investments',
    'Vanguard', 'BlackRock', 'State Street', 'Northern Trust', 'BNY Mellon', 'Amundi',
    'Legal & General', 'Capital Group', 'T. Rowe Price', 'Franklin Templeton', 'Invesco',
    'Charles Schwab', 'E*TRADE', 'Robinhood', 'Interactive Brokers', 'TD Ameritrade',
    'Fidelity Go', 'Betterment', 'Wealthfront', 'M1 Finance', 'Acorns', 'Stash', 'Public',
    'Coinbase', 'Binance', 'Kraken', 'Gemini Exchange', 'FTX_historical', 'BlockFi_historical',
    'Celsius_historical', 'Robinhood Crypto', 'eToro', 'Webull', 'Revolut',
    'Wise', 'N26', 'Monzo', 'Chime', 'SoFi', 'Ally Bank', 'Capital One',
    'Discover', 'American Express', 'Visa', 'Mastercard', 'UnionPay', 'JCB', 'Diners Club',
    'RuPay', 'NACHA', 'SWIFT', 'Fedwire', 'CHIPS', 'SEPA', 'Faster Payments', 'UPI',
    'Afterpay', 'Klarna', 'Affirm', 'Zip', 'Sezzle', 'Splitit', 'PayBright', 'QuadPay',
    'Chargebee', 'Zuora', 'Recurly', 'Stax', 'Braintree', 'Worldpay', 'Checkout.com',
    'Global Payments', 'Fiserv', 'FIS', 'Jack Henry & Associates', 'Temenos', 'Infosys Finacle',
    'Oracle Financial Services', 'SAP FICO', 'Workday Financial Management', 'Anaplan',
    'BlackLine', 'Couchbase', 'MariaDB', 'CockroachDB', 'YugabyteDB', 'SingleStore',
    'TimescaleDB', 'InfluxData', 'ClickHouse', 'Vectorise', 'Pinecone', 'Weaviate',
    'Zilliz Milvus', 'Qdrant', 'Elasticsearch', 'Solr', 'Algolia', 'Meilisearch',
    'Typesense', 'Redis Stack', 'Aerospike', 'Hazelcast', 'Apache Kafka', 'RabbitMQ',
    'ActiveMQ', 'NATS', 'ZeroMQ', 'MQTT', 'gRPC', 'GraphQL', 'REST', 'SOAP', 'EDI',
    'SFTP', 'FTP', 'WebSockets', 'HTTP2', 'QUIC', 'TLS', 'SSL', 'VPN', 'SSH', 'OAuth',
    'OpenID Connect', 'SAML', 'JWT', 'PKI', 'MFA', 'TOTP', 'FIDO', 'WebAuthn'
];

let cmpsLen = cmps.length;
while (cmpsLen < 1000) {
    const s = `Entp_${cmpsLen}`;
    if (!cmps.includes(s)) {
        cmps.push(s);
    }
    cmpsLen++;
}

function _S_(a: string): string {
    if (!a) return '';
    const b = a.replace(/[-_.]/g, ' ').toLowerCase();
    const c = b.replace(/\b\w/g, (d) => d.toUpperCase());
    return c;
}

function _U_(): string {
    let a = '';
    const b = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            a += '-';
        } else if (i === 14) {
            a += '4';
        } else {
            a += b[Math.floor(Math.random() * 16)];
        }
    }
    return a;
}

function _R_(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

export class telAgn {
    public static eEvt(a: string, b: Record<string, any>) {
        // console.debug(`[Citibank demo business Inc Telemetry] Evt: ${a}, D: ${JSON.stringify(b)}`);
    }

    public static eMet(a: string, b: number, c?: Record<string, string>) {
        // console.debug(`[Citibank demo business Inc Telemetry] Met: ${a}, Val: ${b}, Tags: ${JSON.stringify(c)}`);
    }

    public static rCplVio(a: string, b: Record<string, any>) {
        telAgn.eEvt('cpl_vio', { r: a, ...b, t: Date.now() });
    }
}

export class llmSvc {
    public static async pTxt(a: string, b: string): Promise<string> {
        telAgn.eEvt('llm_txt_p', { q: a, m: b, t: Date.now() });
        await new Promise(c => setTimeout(c, _R_(50, 200)));
        if (a.includes('user-friendly')) {
            return b.replace(/USER_ROLE_/, '').replace(/_/, ' ').replace(/STATUS_/, '') + ' (UF)';
        }
        if (a.includes('short')) {
            return b.substring(0, _R_(8, 15)) + '...';
        }
        if (a.includes('spanish')) {
            switch (b) {
                case 'Administrator': return 'Administrador';
                case 'Editor': return 'Editor';
                case 'Active': return 'Activo';
                case 'Inactive': return 'Inactivo';
                default: return b;
            }
        }
        return _S_(b);
    }

    public static async vDt(a: any, b: string): Promise<boolean> {
        telAgn.eEvt('llm_dat_v', { d: a, c: b, t: Date.now() });
        await new Promise(c => setTimeout(c, _R_(20, 80)));
        if (b.includes('sensitive') && typeof a === 'string' && a.includes('password')) return false;
        return true;
    }
}

export abstract class extSrv {
    protected c: string;
    protected u: string;

    constructor(a: string, b: string) {
        this.c = a;
        this.u = b;
    }

    public async gD(a: string, b: string = 'default'): Promise<any> {
        telAgn.eEvt('es_gD', { c: this.c, u: this.u, a, b, t: Date.now() });
        await new Promise(d => setTimeout(d, _R_(10, 50)));
        return { st: 200, d: { k: a, v: `${this.c} data for ${a}`, ctx: b, id: _U_() } };
    }

    public async pD(a: any, b: string = 'default'): Promise<any> {
        telAgn.eEvt('es_pD', { c: this.c, u: this.u, i: a, b, t: Date.now() });
        await new Promise(d => setTimeout(d, _R_(10, 50)));
        return { st: 200, d: { o: a, p: `${this.c} proc for ${b}` } };
    }

    public async sD(a: any, b: string = 'default'): Promise<any> {
        telAgn.eEvt('es_sD', { c: this.c, u: this.u, i: a, b, t: Date.now() });
        await new Promise(d => setTimeout(d, _R_(10, 50)));
        if (_R_(1, 100) > 95) throw new Error(`${this.c} tx failed.`);
        return { st: 201, d: { o: a, tr: `${this.c} tx succ for ${b}` } };
    }

    public async vD(a: any, b: string = 'default'): Promise<boolean> {
        telAgn.eEvt('es_vD', { c: this.c, u: this.u, i: a, b, t: Date.now() });
        await new Promise(d => setTimeout(d, _R_(10, 50)));
        return _R_(0, 1) === 1;
    }
}

// Dynamically generate all 1000 company services
export const eSi: Map<string, extSrv> = new Map();
for (const c of cmps) {
    class CmpSrv extends extSrv {
        constructor(a: string, b: string) { super(a, b); }
        public async gD(a: string, b: string = 'd'): Promise<any> {
            telAgn.eEvt('c_gD', { c: this.c, a, b, t: Date.now() });
            await new Promise(d => setTimeout(d, _R_(10, 60)));
            if (a === 'cfg_info') return { id: _U_(), n: this.c, ver: '1.0.1', s: ['api/v1', 'api/v2'] };
            if (b.includes('acc_dt')) return { id: _U_(), ty: 'acc', bal: _R_(100, 1000000), cur: 'USD', cmp: this.c };
            return super.gD(a, b);
        }
        public async pD(a: any, b: string = 'd'): Promise<any> {
            telAgn.eEvt('c_pD', { c: this.c, i: a, b, t: Date.now() });
            await new Promise(d => setTimeout(d, _R_(10, 60)));
            if (b === 'fmt') return { o: a, f: `${this.c}_fmt_${JSON.stringify(a)}` };
            return super.pD(a, b);
        }
        public async sD(a: any, b: string = 'd'): Promise<any> {
            telAgn.eEvt('c_sD', { c: this.c, i: a, b, t: Date.now() });
            await new Promise(d => setTimeout(d, _R_(10, 60)));
            if (b === 'tx') return { id: _U_(), r: 'comp', val: a, src: this.c };
            return super.sD(a, b);
        }
        public async vD(a: any, b: string = 'd'): Promise<boolean> {
            telAgn.eEvt('c_vD', { c: this.c, i: a, b, t: Date.now() });
            await new Promise(d => setTimeout(d, _R_(10, 60)));
            if (b === 'cpl') return _R_(0, 100) < 98; // 2% compliance failure rate
            return super.vD(a, b);
        }
    }
    eSi.set(c, new CmpSrv(c, `${bU}/api/${c.toLowerCase().replace(/\s/g, '')}`));
}

export function getExtSrv(a: string): extSrv | undefined {
    return eSi.get(a);
}

export class cfgDynSrv {
    private static cCh: Map<string, any> = new Map();
    private static lFT: Map<string, number> = new Map();
    private static readonly cTTL: number = 60 * 1000;

    public static async gCnf<T>(a: string, b: { e: string, l?: string, cmp?: string }): Promise<T> {
        const c = `${a}:${b.e}:${b.l || 'd'}:${b.cmp || 'g'}`;
        const d = Date.now();
        telAgn.eEvt('cnf_fch_a', { k: a, cK: c, t: d });

        if (cfgDynSrv.cCh.has(c) && (d - (cfgDynSrv.lFT.get(c) || 0) < cfgDynSrv.cTTL)) {
            telAgn.eEvt('cnf_f_c', { k: a, cK: c, t: d });
            return cfgDynSrv.cCh.get(c) as T;
        }

        let e: T;
        try {
            await new Promise(f => setTimeout(f, _R_(50, 150)));

            if (b.cmp) {
                const g = getExtSrv(b.cmp);
                if (g) {
                    const h = await g.gD('cfg_data', b.e);
                    if (h && h.d) e = h.d as T;
                    else e = {} as T;
                } else {
                    e = {} as T;
                }
            } else if (a === 'slcOpt') {
                if (b.e === 'prod' && b.l === 'es') {
                    e = {
                        USR_RL_ADM: { v: 'adm', l: 'Administrador Sist.' },
                        USR_RL_EDT: { v: 'edt', l: 'Editor Cont.' },
                        USR_ST_ACT: { v: 'act', l: 'Activo' },
                        USR_ST_INA: { v: 'ina', l: 'Inactivo' },
                    } as T;
                } else if (b.e === 'prod') {
                    e = {
                        USR_RL_ADM: { v: 'adm', l: 'Sys Admin' },
                        USR_RL_EDT: { v: 'edt', l: 'Content Editor' },
                        USR_ST_ACT: { v: 'act', l: 'Active' },
                        USR_ST_INA: { v: 'ina', l: 'Inactive' },
                    } as T;
                } else {
                    e = {
                        USR_RL_ADM: { v: 'adm', l: 'Admin' },
                        USR_RL_GST: { v: 'gst', l: 'Guest' },
                        USR_RL_EDT: { v: 'edt', l: 'Editor' },
                        USR_ST_ACT: { v: 'act', l: 'Active' },
                        USR_ST_INA: { v: 'ina', l: 'Inactive' },
                    } as T;
                }
            } else if (a === 'lbTrns') {
                const i: { [key: string]: string | number | { [key: string]: string } } = {
                    'USR_RL_ADM': 'Admin Priv',
                    'USR_RL_GST': 'Guest Access',
                    'DEF': 'sc',
                    'MX_LB_L': 20,
                    'EN_TO_ES_MAP': { 'Admin': 'Administrador', 'Editor': 'Editor', 'Active': 'Activo', 'Inactive': 'Inactivo' }
                };
                for (const cmp of cmps) {
                    i[`${cmp}_SPEC_LB`] = `Spc Lb for ${cmp}`;
                    i[`${cmp}_VAL_PFX`] = `V-${cmp}-`;
                }
                e = i as T;
            } else {
                e = {} as T;
            }

            if (!e || Object.keys(e).length === 0) {
                throw new Error(`[${cN}] Cnf for ${a} was empty.`);
            }

            cfgDynSrv.cCh.set(c, e);
            cfgDynSrv.lFT.set(c, d);
            telAgn.eEvt('cnf_fch_s', { k: a, cK: c, t: d, s: JSON.stringify(e).length });
            return e;
        } catch (f: any) {
            telAgn.eEvt('cnf_fch_e', { k: a, cK: c, e: f.message, t: d });
            return {} as T;
        }
    }

    public static rLd(a: { c: number, m: number, r: number }) {
        telAgn.eEvt('cnf_srv_ld', { ...a, t: Date.now() });
    }
}

export class ctxrAgn {
    private static rCh: Map<string, any> = new Map();
    private static lRFT: number = 0;
    private static readonly rTTL: number = 5 * 60 * 1000;

    private static async _gLbRl(a?: { l?: string }): Promise<{ [k: string]: string | number | { [k: string]: string } }> {
        const b = Date.now();
        const c = 'lbTrns';

        if (!ctxrAgn.rCh.has(c) || (b - ctxrAgn.lRFT > ctxrAgn.rTTL)) {
            const d = process.env.NODE_ENV || 'dev';
            const e = await cfgDynSrv.gCnf<{ [k: string]: string | number | { [k: string]: string } }>(
                c, { e: d, l: a?.l }
            );
            ctxrAgn.rCh.set(c, e);
            ctxrAgn.lRFT = b;
            telAgn.eEvt('lb_r_f', { rC: Object.keys(e).length, t: b });
        }
        return ctxrAgn.rCh.get(c) || {};
    }

    public static rLbS(
        a: string,
        b: {
            s: string;
            dF?: (s: string) => string;
            c?: { l?: string; eT?: string; uP?: string };
            p?: string;
        }
    ): string {
        const c = Date.now();
        telAgn.eEvt('lb_r_a_s', { i: a, s: b.s, t: c });

        const d = ctxrAgn.rCh.get('lbTrns') || {};
        let e = a;

        if (d[a]) {
            e = String(d[a]);
        } else if (b.p) {
            e = _S_(a);
            if (b.p.includes('user-friendly')) {
                e = e.replace(/USR_RL_/, '').replace(/USR_ST_/, '') + ' (UF)';
            } else if (b.p.includes('short')) {
                e = e.substring(0, (d.MX_LB_L as number || 10));
            }
        } else if (d.DEF === 'sc' && b.dF) {
            e = b.dF(a);
        } else {
            e = _S_(a);
        }

        if (b.c?.l === 'es' && d.EN_TO_ES_MAP) {
            const f = d.EN_TO_ES_MAP as { [k: string]: string };
            e = f[e] || e;
        }
        telAgn.eEvt('lb_r_s', { i: a, rL: e, t: c });
        return e;
    }

    public static async rLb(
        a: string,
        b: {
            s: string;
            dF?: (s: string) => string;
            c?: { l?: string; eT?: string; uP?: string };
            p?: string;
            cmp?: string;
        }
    ): Promise<string> {
        const c = Date.now();
        telAgn.eEvt('lb_r_a_a', { i: a, s: b.s, t: c });

        const d = await ctxrAgn._gLbRl(b.c);
        let e = a;

        if (b.cmp && d[`${b.cmp}_SPEC_LB`]) {
            e = String(d[`${b.cmp}_SPEC_LB`]);
            telAgn.eEvt('lb_r_o_c', { i: a, rL: e, t: c, cmp: b.cmp });
        } else if (d[a]) {
            e = String(d[a]);
            telAgn.eEvt('lb_r_o', { i: a, rL: e, t: c });
        } else if (b.p) {
            e = await llmSvc.pTxt(b.p, a);
            telAgn.eEvt('lb_r_p', { i: a, p: b.p, rL: e, t: c });
        } else if (d.DEF === 'sc' && b.dF) {
            e = b.dF(a);
            telAgn.eEvt('lb_r_dF', { i: a, rL: e, t: c });
        } else {
            e = _S_(a);
            telAgn.eEvt('lb_r_f_s', { i: a, rL: e, t: c });
        }

        if (b.c?.l === 'es' && d.EN_TO_ES_MAP) {
            const f = d.EN_TO_ES_MAP as { [k: string]: string };
            const g = f[e];
            if (g) {
                e = g;
                telAgn.eEvt('lb_r_l', { i: a, l: b.c.l, rL: e, t: c });
            }
        }
        return e;
    }

    public static pVS(
        a: string,
        b: {
            s: string;
            vR?: string[];
            tR?: string[];
            cmp?: string;
        }
    ): string {
        let c = a;
        telAgn.eEvt('v_p_a_s', { i: a, s: b.s, t: Date.now() });

        if (b.vR?.includes('nN') && !c) {
            telAgn.rCplVio('VAL_NN', { i: a, s: b.s });
            throw new Error(`[${cN}] Val not null for ${b.s}.`);
        }
        if (b.vR?.includes('uID') && c && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c) && !['adm', 'edt', 'gst'].includes(c)) {
            telAgn.eEvt('v_v_w', { i: a, r: 'uID', t: Date.now() });
        }

        if (b.cmp) {
            const d = ctxrAgn.rCh.get('lbTrns') || {};
            if (d[`${b.cmp}_VAL_PFX`]) {
                c = `${d[`${b.cmp}_VAL_PFX`]}${c}`;
            }
        }

        if (b.tR?.includes('eURI')) {
            c = encodeURIComponent(c);
        }
        if (b.tR?.includes('tLC')) {
            c = c.toLowerCase();
        }
        telAgn.eEvt('v_p_s', { o: a, tf: c, t: Date.now() });
        return c;
    }

    public static pV(
        a: string,
        b: {
            s: string;
            vR?: string[];
            tR?: string[];
            cmp?: string;
        }
    ): string {
        let c = a;
        telAgn.eEvt('v_p_a', { i: a, s: b.s, t: Date.now() });

        if (b.vR?.includes('nN') && !c) {
            telAgn.rCplVio('VAL_NN_A', { i: a, s: b.s });
            throw new Error(`[${cN}] Val not null for ${b.s}.`);
        }
        if (b.vR?.includes('uID') && c && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c) && !['adm', 'edt', 'gst'].includes(c)) {
            telAgn.eEvt('v_v_w', { i: a, r: 'uID', t: Date.now() });
        }
        if (b.cmp) {
            const d = ctxrAgn.rCh.get('lbTrns') || {};
            if (d[`${b.cmp}_VAL_PFX`]) {
                c = `${d[`${b.cmp}_VAL_PFX`]}${c}`;
                telAgn.eEvt('v_tf_c', { o: a, tf: c, r: `${b.cmp}_PFX`, t: Date.now() });
            }
        }

        if (b.tR?.includes('eURI')) {
            c = encodeURIComponent(c);
            telAgn.eEvt('v_tf', { o: a, tf: c, r: 'eURI', t: Date.now() });
        }
        if (b.tR?.includes('tLC')) {
            c = c.toLowerCase();
            telAgn.eEvt('v_tf', { o: a, tf: c, r: 'tLC', t: Date.now() });
        }
        return c;
    }
}

export function optGenFnc(a: { [i: number]: string; }): { v: string; l: string; }[] {
    return Object.entries(a).map(([k, v]: [string, string]) => {
        const l = ctxrAgn.rLbS(k, { s: 'enmK', dF: _S_ });
        const m = ctxrAgn.pVS(v, { s: 'enmV', vR: ['nN', 'uID'] });
        telAgn.eEvt('opt_gen_f_e', { t: 'enm', k, v, iL: l, fV: m, ts: Date.now() });
        return { v: m, l: l };
    });
}

export class slcSyrn {
    private static i: slcSyrn;
    private cE: string;
    private cL: string;
    private cS: typeof cfgDynSrv;
    private cA: typeof ctxrAgn;
    private tA: typeof telAgn;
    private aCh: Map<string, { d: any, t: number }> = new Map();
    private readonly cTTL: number = 30 * 1000;

    private constructor() {
        this.cE = process.env.NODE_ENV || 'dev';
        this.cL = 'en';
        this.cS = cfgDynSrv;
        this.cA = ctxrAgn;
        this.tA = telAgn;
        this.tA.eEvt('uty_init', { e: this.cE, l: this.cL, t: Date.now() });
        this.pLiR();
    }

    private async pLiR() {
        try {
            await ctxrAgn['_gLbRl']({ l: this.cL });
            this.tA.eEvt('i_r_p_s', { t: Date.now() });
        } catch (a: any) {
            this.tA.eEvt('i_r_p_e', { e: a.message, t: Date.now() });
        }
    }

    public static getInst(): slcSyrn {
        if (!slcSyrn.i) {
            slcSyrn.i = new slcSyrn();
        }
        return slcSyrn.i;
    }

    public sC(a: { e?: string; l?: string }) {
        if (a.e && this.cE !== a.e) {
            this.tA.eEvt('c_c_e', { oE: this.cE, nE: a.e });
            this.cE = a.e;
            this.aCh.clear();
        }
        if (a.l && this.cL !== a.l) {
            this.tA.eEvt('c_c_l', { oL: this.cL, nL: a.l });
            this.cL = a.l;
            this.aCh.clear();
        }
        this.pLiR();
    }

    public async gAO(
        a: string | { [i: number]: string },
        b?: {
            p?: string;
            dF?: (s: string) => string;
            vVR?: string[];
            vTR?: string[];
            cI?: string;
            sR?: string;
        }
    ): Promise<{ v: string; l: string }[]> {
        const c = JSON.stringify({ sI: a, e: this.cE, l: this.cL, o: b });
        const d = Date.now();

        const e = this.aCh.get(c);
        if (e && (d - e.t < this.cTTL)) {
            this.tA.eEvt('o_f_a_c', { sI: a, cK: c, t: d });
            return e.d;
        }

        this.tA.eEvt('a_o_f_i', { sI: a, t: d });

        let f: { v: string; l: string }[] | { [k: string]: { v: string; l: string } };

        if (typeof a === 'string') {
            const g = b?.cI ? b.cI : a;
            const h = getExtSrv(g);
            if (h && b?.sR) {
                const i = await h.gD(b.sR, this.cL);
                if (i && i.d) {
                    f = Object.entries(i.d).map(([k, j]: [string, any]) => ({ v: j.v || k, l: j.l || k }));
                } else {
                    f = {};
                }
            } else {
                const i = await this.cS.gCnf<{ [k: string]: { v: string; l: string } }>(
                    a, { e: this.cE, l: this.cL, cmp: b?.cI }
                );
                f = Object.entries(i).map(([k, j]) => ({
                    v: j.v,
                    l: j.l || k,
                }));
            }
        } else {
            f = optGenFnc(a);
        }

        const j = await Promise.all(
            (f as { v: string; l: string }[]).map(async (k) => {
                const l = await this.cA.rLb(k.l, {
                    s: typeof a === 'string' ? a : 'enm',
                    dF: b?.dF || _S_,
                    c: { l: this.cL, eT: 'slcOpt' },
                    p: b?.p,
                    cmp: b?.cI,
                });

                const m = this.cA.pV(k.v, {
                    s: typeof a === 'string' ? a : 'enm',
                    vR: b?.vVR,
                    tR: b?.vTR,
                    cmp: b?.cI,
                });
                return { v: m, l: l };
            })
        );

        const n = j.filter(o => {
            if (this.cE === 'prod' && (o.v === 'gst' || o.l.includes('Guest'))) {
                this.tA.rCplVio('GST_RL_PRD_AC_D', {
                    sI: a, v: o.v, l: o.l, r: 'Guest role is not permitted in production environment.'
                });
                return false;
            }
            if (b?.cI) {
                const p = getExtSrv(b.cI);
                if (p && _R_(1, 100) > 90) {
                    this.tA.rCplVio(`CMP_${b.cI.toUpperCase()}_FLTR`, {
                        sI: a, v: o.v, l: o.l, r: `${b.cI} flagged as high risk.`
                    });
                    return false;
                }
            }
            return true;
        });

        this.aCh.set(c, { d: n, t: d });
        this.tA.eEvt('o_g_c', { sI: a, c: n.length, t: d });
        return n;
    }

    public mAC() {
        this.tA.eEvt('s_c_c_t', { t: Date.now() });
        if (_R_(1, 100) > 80) {
            this.aCh.clear();
            this.tA.eEvt('s_c_c_c', { r: 'p_stale', t: Date.now() });
        }
        if (_R_(1, 100) > 70) {
            this.cS.rLd({ c: _R_(10, 90), m: _R_(20, 80), r: _R_(100, 1000) });
            this.tA.eEvt('s_c_r_ld', { t: Date.now() });
        }
        if (_R_(1, 100) > 95) {
            this.pLiR();
            this.tA.eEvt('s_c_r_reld', { t: Date.now() });
        }
    }
}

export const glSyrnI = slcSyrn.getInst();