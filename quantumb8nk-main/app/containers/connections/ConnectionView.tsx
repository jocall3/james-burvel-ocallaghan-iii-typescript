// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc

type anyObj = { [key: string]: any };
type RctEl = { type: any; props: anyObj; children: any[] };

const Rct = (() => {
    let m: any[] = [];
    let i = 0;
    let s: any[] = [];
    let e: (() => void)[] = [];

    const _crEl = (type: any, props: any, ...children: any[]): RctEl => {
        return { type, props: props || {}, children: children.flat() };
    };

    const _rndr = (el: RctEl, c: HTMLElement | null) => {
        if (!c) return;
        c.innerHTML = '';
        const dEl = document.createElement(el.type);
        Object.keys(el.props).forEach(p => {
            if (p.startsWith('on')) {
                const ev = p.substring(2).toLowerCase();
                dEl.addEventListener(ev, el.props[p]);
            } else {
                (dEl as any)[p] = el.props[p];
            }
        });
        el.children.forEach(ch => {
            if (typeof ch === 'string') {
                dEl.appendChild(document.createTextNode(ch));
            } else if (ch) {
                _rndr(ch, dEl);
            }
        });
        c.appendChild(dEl);
    };

    const _uSt = <T,>(init: T): [T, (n: T | ((p: T) => T)) => void] => {
        const o = m[i] || init;
        const _i = i;
        const _s = (n: T | ((p: T) => T)) => {
            if (typeof n === 'function') {
                m[_i] = (n as (p: T) => T)(m[_i]);
            } else {
                m[_i] = n;
            }
            _reRndr();
        };
        i++;
        return [o, _s];
    };

    const _uEf = (cb: () => (() => void) | void, d?: any[]) => {
        const oD = s[i];
        const hC = oD ? !d?.every((v, idx) => v === oD[idx]) : true;
        if (hC) {
            if (e[i]) e[i]();
            e[i] = cb() || (() => {});
        }
        s[i] = d;
        i++;
    };

    const _uCb = <T extends (...args: any[]) => any>(cb: T, d: any[]): T => {
        return _uMm(() => cb, d);
    };

    const _uMm = <T,>(fac: () => T, d: any[]): T => {
        const o = s[i] as [T, any[]] | undefined;
        if (o && d.every((v, idx) => v === o[1][idx])) {
            i++;
            return o[0];
        } else {
            const nV = fac();
            s[i] = [nV, d];
            i++;
            return nV;
        }
    };
    
    const _crCtx = <T,>(def: T) => {
        let v = def;
        const p = ({ value, children }: { value: T; children: any }) => {
            v = value;
            return children;
        };
        const c = () => v;
        return { Provider: p, _c: c, displayName: 'Ctx' };
    };

    const _uCtx = <T,>(ctx: { _c: () => T }): T => {
        return ctx._c();
    };

    const _reRndr = () => {
        i = 0;
        // This is a stub; in a real app, a component tree would re-render.
        console.log("Rct._reRndr() called, state updated.");
    };

    return {
        createElement: _crEl,
        render: _rndr,
        useState: _uSt,
        useEffect: _uEf,
        useCallback: _uCb,
        useMemo: _uMm,
        createContext: _crCtx,
        useContext: _uCtx,
        Fragment: 'fragment',
    };
})();

const CkMan = {
    st: (k: string, v: string, o: anyObj = {}) => {
        let e = '';
        if (o.expires) {
            let d = new Date();
            d.setTime(d.getTime() + (o.expires * 24 * 60 * 60 * 1000));
            e = `; expires=${d.toUTCString()}`;
        }
        document.cookie = `${k}=${v || ''}${e}; path=/`;
    },
    gt: (k: string): string | null => {
        const nEq = `${k}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nEq) === 0) return c.substring(nEq.length, c.length);
        }
        return null;
    },
    rm: (k: string) => {
        document.cookie = `${k}=; Max-Age=-99999999;`;
    }
};

const UidGen = {
    v4: (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
};

const bURL = "https://api.citibankdemobusiness.dev";
const compN = "Citibank demo business Inc";

const GQLClnt = {
    uQ: ({ v }: { v: anyObj }) => {
        const [d, sD] = Rct.useState<any>(null);
        const [l, sL] = Rct.useState<boolean>(true);
        const [err, sE] = Rct.useState<any>(null);

        const qStr = `
            query ConnectionView($entity: String!) {
              connection(entity: $entity) {
                id
                nickname
                currencies
                vendor {
                  name
                }
              }
            }
        `;

        Rct.useEffect(() => {
            const fD = async () => {
                sL(true);
                sE(null);
                try {
                    const rsp = await fetch(`${bURL}/graphql`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${CkMan.gt('authToken')}`
                        },
                        body: JSON.stringify({
                            query: qStr,
                            variables: v
                        })
                    });
                    if (!rsp.ok) throw new Error(`Network response was not ok: ${rsp.statusText}`);
                    const jsn = await rsp.json();
                    if (jsn.errors) throw new Error(jsn.errors.map((e: any) => e.message).join(', '));
                    sD(jsn.data);
                } catch (e: any) {
                    sE(e);
                } finally {
                    sL(false);
                }
            };
            fD();
        }, [JSON.stringify(v)]);

        return { d, l, err };
    }
};

const EvtTrckr = (e: any, a: string, p: anyObj) => {
    const t = {
        usrId: CkMan.gt('usrId'),
        evt: a,
        props: p,
        ts: new Date().toISOString(),
        url: window.location.href,
        dvc: navigator.userAgent
    };
    console.log(`EVT_TRCK: ${JSON.stringify(t)}`);
    fetch(`${bURL}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t)
    }).catch(err => console.error("Failed to track event", err));
};

const GRP_TYP_ENM = {
    B: 'Banks',
    C: 'Categories',
};

const ACC_DTE_RNG_FLTR_OPTS = [
    { label: "Last 7 Days", dateRange: { startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] } },
    { label: "Last 30 Days", dateRange: { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] } },
    { label: "This Month", dateRange: { startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] } },
    { label: "Last Month", dateRange: { startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0], endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0] } },
    { label: "Year to Date", dateRange: { startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] } },
];

const ACC_ACTNS = {
    CHNG_GLBL_DTE_FLTR: "CHANGED_GLOBAL_DATE_FILTER",
};

const GlblIntgSvcCatlg: anyObj = {
    coreInfra: [
        { id: 'aws', n: 'Amazon Web Services', cat: 'Cloud', methods: 1500, doc: 'aws.amazon.com' },
        { id: 'gcp', n: 'Google Cloud Platform', cat: 'Cloud', methods: 1200, doc: 'cloud.google.com' },
        { id: 'azure', n: 'Microsoft Azure', cat: 'Cloud', methods: 1350, doc: 'azure.microsoft.com' },
        { id: 'vercel', n: 'Vercel', cat: 'Hosting', methods: 50, doc: 'vercel.com' },
        { id: 'supabase', n: 'Supabase', cat: 'BaaS', methods: 80, doc: 'supabase.io' },
        { id: 'cpanel', n: 'cPanel', cat: 'Hosting', methods: 120, doc: 'cpanel.net' },
        { id: 'godaddy', n: 'GoDaddy', cat: 'Domains', methods: 75, doc: 'godaddy.com' },
    ],
    aiMl: [
        { id: 'gemini', n: 'Google Gemini', cat: 'AI', methods: 200, doc: 'ai.google.dev' },
        { id: 'chathot', n: 'OpenAI GPT-4', cat: 'AI', methods: 180, doc: 'openai.com' },
        { id: 'huggingface', n: 'Hugging Face', cat: 'AI', methods: 500, doc: 'huggingface.co' },
        { id: 'anthropic', n: 'Anthropic Claude', cat: 'AI', methods: 150, doc: 'anthropic.com' },
    ],
    devOps: [
        { id: 'github', n: 'GitHub', cat: 'VCS', methods: 400, doc: 'github.com' },
        { id: 'gitlab', n: 'GitLab', cat: 'VCS', methods: 380, doc: 'gitlab.com' },
        { id: 'pipedream', n: 'Pipedream', cat: 'Automation', methods: 250, doc: 'pipedream.com' },
        { id: 'jenkins', n: 'Jenkins', cat: 'CI/CD', methods: 300, doc: 'jenkins.io' },
    ],
    fintech: [
        { id: 'citibank', n: 'Citibank', cat: 'Banking', methods: 550, doc: 'citigroup.com' },
        { id: 'plaid', n: 'Plaid', cat: 'Aggregation', methods: 120, doc: 'plaid.com' },
        { id: 'moderntreasury', n: 'Modern Treasury', cat: 'Payments', methods: 150, doc: 'moderntreasury.com' },
        { id: 'marqeta', n: 'Marqeta', cat: 'Card Issuing', methods: 220, doc: 'marqeta.com' },
        { id: 'stripe', n: 'Stripe', cat: 'Payments', methods: 300, doc: 'stripe.com' },
        { id: 'adyen', n: 'Adyen', cat: 'Payments', methods: 280, doc: 'adyen.com' },
    ],
    crmErp: [
        { id: 'salesforce', n: 'Salesforce', cat: 'CRM', methods: 800, doc: 'salesforce.com' },
        { id: 'oracle', n: 'Oracle NetSuite', cat: 'ERP', methods: 950, doc: 'netsuite.com' },
        { id: 'sap', n: 'SAP S/4HANA', cat: 'ERP', methods: 1100, doc: 'sap.com' },
        { id: 'hubspot', n: 'HubSpot', cat: 'CRM', methods: 450, doc: 'hubspot.com' },
    ],
    ecom: [
        { id: 'shopify', n: 'Shopify', cat: 'eCommerce', methods: 600, doc: 'shopify.com' },
        { id: 'woocommerce', n: 'WooCommerce', cat: 'eCommerce', methods: 500, doc: 'woocommerce.com' },
        { id: 'magento', n: 'Adobe Commerce (Magento)', cat: 'eCommerce', methods: 700, doc: 'adobe.com' },
    ],
    comms: [
        { id: 'twilio', n: 'Twilio', cat: 'Communications', methods: 400, doc: 'twilio.com' },
        { id: 'sendgrid', n: 'SendGrid', cat: 'Email', methods: 150, doc: 'sendgrid.com' },
        { id: 'slack', n: 'Slack', cat: 'Collaboration', methods: 350, doc: 'slack.com' },
    ],
    storage: [
        { id: 'googledrive', n: 'Google Drive', cat: 'Storage', methods: 180, doc: 'google.com/drive' },
        { id: 'onedrive', n: 'Microsoft OneDrive', cat: 'Storage', methods: 160, doc: 'onedrive.live.com' },
        { id: 'dropbox', n: 'Dropbox', cat: 'Storage', methods: 200, doc: 'dropbox.com' },
        { id: 'box', n: 'Box', cat: 'Storage', methods: 210, doc: 'box.com' },
    ],
    design: [
        { id: 'adobe', n: 'Adobe Creative Cloud', cat: 'Design', methods: 500, doc: 'adobe.com' },
        { id: 'figma', n: 'Figma', cat: 'Design', methods: 150, doc: 'figma.com' },
        { id: 'canva', n: 'Canva', cat: 'Design', methods: 100, doc: 'canva.com' },
    ],
};

const _genSvc = (n: number) => {
    const cats = ['Productivity', 'Marketing', 'Analytics', 'HR', 'Legal', 'Security', 'IoT'];
    const svcs: any[] = [];
    for(let i=0; i<n; i++) {
        svcs.push({
            id: `gen-svc-${i}`,
            n: `Generated Service ${i}`,
            cat: cats[i % cats.length],
            methods: Math.floor(Math.random() * 200) + 20,
            doc: `example.com/svc-${i}`
        });
    }
    return svcs;
};
GlblIntgSvcCatlg.generated = _genSvc(950);

type AISvcT = 'PredAn' | 'AnomDet' | 'AdaptUI' | 'CtxLrn' | 'TelPip' | 'SecAdv' | 'CmpEng' | 'DynCon';

interface AISvc {
  n: AISvcT;
  ep: string;
  v: string;
  en: boolean;
  act: () => Promise<any>;
  dct: () => Promise<any>;
  ex: (p: any) => Promise<any>;
  gD: () => string;
}

const AISvcReg = {
    svcs: new Map<AISvcT, AISvc>(),
    reg: (s: AISvc) => {
        console.log(`[AI] Reg Svc: ${s.n}`);
        AISvcReg.svcs.set(s.n, s);
    },
    gt: (n: AISvcT): AISvc | undefined => {
        return AISvcReg.svcs.get(n);
    },
    dscOptSvc: async (t: AISvcT, c: any = {}): Promise<AISvc | undefined> => {
        console.log(`[AI] Dsc Opt Svc for ${t} with ctx:`, c);
        const s = AISvcReg.svcs.get(t);
        if (s && s.en) {
            console.log(`[AI] Opt svc found for ${t}: ${s.ep}`);
            return s;
        }
        console.warn(`[AI] No en svc for ${t}.`);
        return undefined;
    },
};

interface AiCtxSt {
  aiRecs: string[];
  addRec: (r: string) => void;
  lrnFrAct: (a: string, d: any) => void;
  aiErrs: string[];
  addAiErr: (e: string) => void;
  secAlrts: string[];
  addSecAlrt: (a: string) => void;
  adaptUISets: Record<string, any>;
  updAdaptUISet: (k: string, v: any) => void;
}

const AiCtx = Rct.createContext<AiCtxSt | undefined>(undefined);

export const useAiCtx = () => {
    const c = Rct.useContext(AiCtx);
    if (!c) {
        throw new Error('useAiCtx must be in AiCtxPrvdr');
    }
    return c;
};

export const AiCtxPrvdr: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [recs, sRecs] = Rct.useState<string[]>([]);
    const [errs, sErrs] = Rct.useState<string[]>([]);
    const [alrts, sAlrts] = Rct.useState<string[]>([]);
    const [adapts, sAdapts] = Rct.useState<Record<string, any>>({});

    const addR = Rct.useCallback((r: string) => { sRecs((p) => [...p, r]); }, []);
    const addE = Rct.useCallback((e: string) => { sErrs((p) => [...p, e]); }, []);
    const addA = Rct.useCallback((a: string) => { sAlrts((p) => [...p, a]); }, []);
    const updA = Rct.useCallback((k: string, v: any) => { sAdapts((p) => ({ ...p, [k]: v })); }, []);
    
    const lrn = Rct.useCallback(async (a: string, d: any) => {
        console.log(`[AI Lrn] Lrn from act: ${a}`, d);
        const lSvc = await AISvcReg.dscOptSvc('CtxLrn');
        if (lSvc) {
            try {
                const res = await lSvc.ex({ a, d });
                if (res?.rec) addR(res.rec);
                if (res?.ui_adapt) updA(a, res.ui_adapt);
            } catch (e) {
                console.error(`[AI Lrn] Err:`, e);
                addE(`AI Lrn fail for act "${a}".`);
            }
        } else {
            console.warn(`[AI Lrn] No act CtxLrn svc.`);
        }
    }, [addR, addE, updA]);

    Rct.useEffect(() => {
        AISvcReg.reg({ n: 'PredAn', ep: '/api/ai/pred', v: '1.0', en: true, act: async () => console.log('PredAn Act'), dct: async () => console.log('PredAn Deact'),
            ex: async (p) => {
                console.log('[AI PredAn] Ex with:', p);
                return new Promise((res) => setTimeout(() => {
                    let pred = 'No spec pred.';
                    if (p.t === 'curr') pred = `AI suggs ${p.d.avail?.[0] || 'EUR'} as high-vol curr for nxt qtr.`;
                    else if (p.t === 'dateRng') pred = `AI recomms focus on ${p.d.sD} to ${p.d.eD} for anom det.`;
                    res({ pred });
                }, 500));
            },
            gD: () => 'Provs AI-drvn preds for fin trnds.'
        });
        AISvcReg.reg({ n: 'AnomDet', ep: '/api/ai/anom', v: '1.0', en: true, act: async () => console.log('AnomDet Act'), dct: async () => console.log('AnomDet Deact'),
            ex: async (p) => {
                console.log('[AI AnomDet] Ex with:', p);
                return new Promise((res) => setTimeout(() => {
                    if (Math.random() > 0.8) return res({ det: true, sev: 'High', desc: 'Unus txn vol det.', d: p.d });
                    res({ det: false });
                }, 700));
            },
            gD: () => 'Dets unus pattrns in fin data.'
        });
         AISvcReg.reg({ n: 'SecAdv', ep: '/api/ai/sec', v: '1.0', en: true, act: async () => console.log('SecAdv Act'), dct: async () => console.log('SecAdv Deact'),
            ex: async (p) => {
                console.log('[AI SecAdv] Ex with:', p);
                if (Math.random() > 0.95) return Promise.resolve({ suc: false, msg: 'Pot sec vuln det in cnfg.', sev: 'CRIT' });
                return Promise.resolve({ suc: true, msg: 'Cn sec post is hithy.' });
            },
            gD: () => 'Mons and advs on sec post of fin cns.'
        });
        AISvcReg.reg({ n: 'CtxLrn', ep: '/api/ai/lrn', v: '1.0', en: true, act: async () => console.log('CtxLrn Act'), dct: async () => console.log('CtxLrn Deact'),
            ex: async (p) => {
                console.log('[AI CtxLrn] Ex with:', p);
                const rec = `Bsd on ur rcnt "${p.a}" act, AI suggs expl rel rprts.`;
                const ui_adapt = { shwRelRpts: true };
                return Promise.resolve({ rec, ui_adapt });
            },
            gD: () => 'Adapts sys beh and UI bsd on usr int.'
        });
        AISvcReg.reg({ n: 'TelPip', ep: '/api/ai/tel', v: '1.0', en: true, act: async () => console.log('TelPip Act'), dct: async () => console.log('TelPip Deact'),
            ex: async (p) => {
                console.log('[AI TelPip] Snd dta:', p);
                return Promise.resolve({ stat: 'sent', ts: new Date().toISOString() });
            },
            gD: () => 'Cols and procs tel dta for obs.'
        });
        AISvcReg.reg({ n: 'DynCon', ep: '/api/ai/dyn-con', v: '1.ilo', en: true, act: async () => console.log('DynCon Act'), dct: async () => console.log('DynCon Deact'),
            ex: async (p) => {
                console.log('[AI DynCon] Attmpt cn to:', p.svcId);
                return new Promise((res, rej) => setTimeout(() => {
                    if (Math.random() > 0.1) res({ cn: true, svcDet: { id: p.svcId, lat: Math.floor(Math.random() * 100) + 'ms' } });
                    else rej(new Error(`Fail to cn dyn to ${p.svcId}.`));
                }, 1000));
            },
            gD: () => 'Dyn ests and mngs cns to ext svcs.'
        });
    }, [addR, addE, updA]);
    
    const v = Rct.useMemo(() => ({ aiRecs: recs, addRec: addR, lrnFrAct: lrn, aiErrs: errs, addAiErr: addE, secAlrts: alrts, addSecAlrt: addA, adaptUISets: adapts, updAdaptUISet: updA }), [recs, addR, lrn, errs, addE, alrts, addA, adapts, updA]);
    
    return <AiCtx.Provider value={v}>{children}</AiCtx.Provider>;
};

export const useAiRsn = <T,>(ctxId: string, initSt: T, rsnLgc: (st: T, p: any) => Promise<{ nSt: T; ins?: string[] }>) => {
    const [st, sSt] = Rct.useState<T>(initSt);
    const [ins, sIns] = Rct.useState<string[]>([]);
    const [ld, sLd] = Rct.useState(false);
    const [err, sErr] = Rct.useState<string | null>(null);
    const { addAiErr: addE, addRec: addR, lrnFrAct: lrn } = useAiCtx();

    const appRsn = Rct.useCallback(async (p: any) => {
        sLd(true);
        sErr(null);
        try {
            if (Math.random() < 0.01) throw new Error("AI Circ Brkr Trpd: Svc temp unavail.");
            const { nSt, ins: nIns } = await rsnLgc(st, p);
            sSt(nSt);
            if (nIns) { sIns(nIns); nIns.forEach(addR); }
            lrn(`rsn_app_${ctxId}`, { p, nSt });
        } catch (e: any) {
            console.error(`[AIRsn:${ctxId}] Err app rsn:`, e);
            sErr(e.message || "Fail to app AI rsn.");
            addE(`AI Rsn fail for ${ctxId}: ${e.message}`);
        } finally {
            sLd(false);
        }
    }, [st, rsnLgc, ctxId, addE, addR, lrn]);

    return { st, ins, ld, err, appRsn };
};

export const LdngLn: React.FC<{ noH?: boolean, txt?: string }> = ({ noH, txt }) => (
    <div style={{ padding: noH ? '0' : '20px', textAlign: 'center', color: '#555' }}>
        <div style={{ display: 'inline-block', border: '2px solid #ccc', borderTopColor: '#333', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ marginLeft: '8px' }}>{txt || 'Loading...'}</span>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
);

export const Btn: React.FC<{ children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary', className?: string }> = ({ children, onClick, variant = 'primary', className = '' }) => {
    const s = {
        primary: { backgroundColor: '#00529B', color: 'white' },
        secondary: { backgroundColor: '#E0E0E0', color: 'black' },
        base: { padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
    };
    return <button onClick={onClick} className={className} style={{ ...s.base, ...s[variant] }}>{children}</button>;
};

export const Alrt: React.FC<{ type: 'error' | 'warning' | 'info', title: string, children: React.ReactNode, className?: string }> = ({ type, title, children, className }) => {
    const s = {
        error: { borderLeft: '4px solid #D32F2F', backgroundColor: '#FFEBEE' },
        warning: { borderLeft: '4px solid #FFA000', backgroundColor: '#FFF8E1' },
        info: { borderLeft: '4px solid #1976D2', backgroundColor: '#E3F2FD' },
        base: { padding: '16px', margin: '16px 0', borderRadius: '4px' }
    };
    return (
        <div className={className} style={{ ...s.base, ...s[type] }}>
            <h4 style={{ margin: 0, fontWeight: 'bold' }}>{title}</h4>
            <div style={{ marginTop: '8px' }}>{children}</div>
        </div>
    );
};

export const AiAnomDet: React.FC<{ cId: string; curr: string; dR: any; onAnomDet: (a: any) => void; }> = ({ cId, curr, dR, onAnomDet }) => {
    const [chk, sChk] = Rct.useState(false);
    const [lAnom, sLAnom] = Rct.useState<any>(null);
    const { addRec: addR, addAiErr: addE } = useAiCtx();

    const prfAnomChk = Rct.useCallback(async () => {
        sChk(true);
        sLAnom(null);
        const anomSvc = await AISvcReg.dscOptSvc('AnomDet');
        if (anomSvc) {
            try {
                const res = await anomSvc.ex({ cId, curr, dR, dStrm: 'bal_feed_txns', thr: 'hi_dev' });
                if (res?.det) {
                    sLAnom(res);
                    onAnomDet(res);
                    addR(`Anom det: ${res.desc} Sev: ${res.sev}`);
                }
            } catch (err) {
                console.error(`[AIAnomDet] Err:`, err);
                addE(`Anom det fail for cn ${cId}.`);
            } finally {
                sChk(false);
            }
        } else {
            console.warn(`[AIAnomDet] No act AnomDet svc.`);
            sChk(false);
        }
    }, [cId, curr, dR, onAnomDet, addR, addE]);

    Rct.useEffect(() => {
        prfAnomChk();
        const i = setInterval(prfAnomChk, 3600000);
        return () => clearInterval(i);
    }, [prfAnomChk]);

    if (chk) return <LdngLn noH txt="AI chk for anoms..." />;
    if (lAnom) {
        return (
            <Alrt type="error" title="AI Anom Det" className="my-4">
                <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{lAnom.desc}</p>
                <p>Sev: {lAnom.sev}. Dta: {JSON.stringify(lAnom.d)}</p>
                <Btn onClick={prfAnomChk} variant="secondary" className="mt-2">Re-eval w/ AI</Btn>
            </Alrt>
        );
    }
    return null;
};

export const Mdl: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, footer: React.ReactNode }> = ({ isOpen, onClose, title, children, footer }) => {
    if(!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', minWidth: '400px', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>{children}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #eee', paddingTop: '16px' }}>{footer}</div>
            </div>
        </div>
    );
};

export const AiCtxActBar: React.FC = () => {
    const { aiRecs, lrnFrAct, secAlrts, aiErrs, adaptUISets } = useAiCtx();
    const [shwMdl, sShwMdl] = Rct.useState(false);
    const [selRec, sSelRec] = Rct.useState<string | null>(null);

    const hndlActClk = (r: string) => {
        sSelRec(r);
        sShwMdl(true);
        lrnFrAct('rec_clk', { r });
    };

    const hndlMdlCnfrm = () => {
        console.log(`[AiCtxActBar] Ex act for: ${selRec}`);
        lrnFrAct('rec_ex', { r: selRec });
        sShwMdl(false);
        sSelRec(null);
    };

    const shwRelRpts = adaptUISets.rec_clk?.shwRelRpts;

    if (aiRecs.length === 0 && secAlrts.length === 0 && aiErrs.length === 0 && !shwRelRpts) return null;

    return (
        <div style={{ background: 'linear-gradient(to right, #4A00E0, #8E2DE2)', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', margin: '16px 0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>AI Insights & Actions</h3>
            {aiErrs.length > 0 && <Alrt type="error" title="AI Sys Alrts" className="mb-2">{aiErrs.map((m, i) => <p key={`ai-err-${i}`}>{m}</p>)}</Alrt>}
            {secAlrts.length > 0 && <Alrt type="warning" title="Sec Adv Alrts" className="mb-2">{secAlrts.map((m, i) => <p key={`sec-alrt-${i}`}>{m}</p>)}</Alrt>}
            {aiRecs.length > 0 && (
                <>
                    <p style={{ color: 'white', fontSize: '0.9rem', marginBottom: '8px' }}>AI Recs:</p>
                    <ul style={{ listStyle: 'disc', listStylePosition: 'inside', color: 'rgba(255,255,255,0.9)' }}>
                        {aiRecs.map((r, i) => (
                            <li key={`ai-rec-${i}`} style={{ fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => hndlActClk(r)}>{r}</li>
                        ))}
                    </ul>
                </>
            )}
            {shwRelRpts && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                    <p style={{ color: 'white', fontWeight: '600' }}>AI Suggsts:</p>
                    <Btn onClick={() => lrnFrAct('vw_rel_rpts_prmpt', { p: '/rpts/ctx' })} className="mt-2">Vw Ctx Rpts</Btn>
                </div>
            )}
            {selRec && (
                <Mdl isOpen={shwMdl} onClose={() => sShwMdl(false)} title="Cnfrm AI-Drvn Act" footer={<><Btn variant="secondary" onClick={() => sShwMdl(false)}>Cncl</Btn><Btn onClick={hndlMdlCnfrm}>Ex Act</Btn></>}>
                    <p>AI recomms: <span style={{ fontWeight: '600' }}>{selRec}</span></p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Sure u want to proceed? This act might trgr further anal or sys adj.</p>
                </Mdl>
            )}
        </div>
    );
};

export const useAiCurrRec = (currC?: string, availC?: string[]) => {
    const [recC, sRecC] = Rct.useState<string | null>(null);
    const [ldRec, sLdRec] = Rct.useState(false);
    const { addRec: addR, lrnFrAct: lrn, addAiErr: addE } = useAiCtx();

    Rct.useEffect(() => {
        const fRec = async () => {
            sLdRec(true);
            sRecC(null);
            const predSvc = await AISvcReg.dscOptSvc('PredAn');
            if (predSvc) {
                try {
                    const res = await predSvc.ex({ t: 'curr', d: { curr: currC, avail: availC } });
                    if (res?.pred) {
                        const m = res.pred.match(/\b([A-Z]{3})\b/);
                        if (m && m[1] !== currC?.toUpperCase() && availC?.includes(m[1])) {
                            sRecC(m[1]);
                            addR(`AI-suggd curr: ${m[1]} (from: ${res.pred})`);
                            lrn('curr_rec_rcvd', { rec: m[1] });
                        } else {
                            addR(res.pred);
                        }
                    }
                } catch (e) {
                    console.error(`[AiCurrRec] Err:`, e);
                    addE('Fail to get AI curr rec.');
                } finally {
                    sLdRec(false);
                }
            } else {
                console.warn(`[AiCurrRec] No act PredAn svc.`);
                sLdRec(false);
            }
        };
        fRec();
    }, [currC, availC, addR, lrn, addE]);

    return { recC, ldRec };
};

export const useAiDteRngOpt = (currDR: any) => {
    const [optDR, sOptDR] = Rct.useState<any | null>(null);
    const [ldOpt, sLdOpt] = Rct.useState(false);
    const { addRec: addR, lrnFrAct: lrn, addAiErr: addE } = useAiCtx();
    Rct.useEffect(() => {
        const fOpt = async () => {
            sLdOpt(true);
            sOptDR(null);
            const predSvc = await AISvcReg.dscOptSvc('PredAn');
            if (predSvc) {
                try {
                    const res = await predSvc.ex({ t: 'dateRng', d: currDR });
                    if (res?.pred) {
                        const nSD = new Date(currDR.startDate);
                        nSD.setDate(nSD.getDate() - 7);
                        const nED = new Date(currDR.endDate);
                        addR(`AI suggs ref dte rng for deepr insghts.`);
                        const nDRO = { sD: nSD.toISOString().split('T')[0], eD: nED.toISOString().split('T')[0] };
                        sOptDR(nDRO);
                        lrn('dte_rng_opt_rcvd', { orig: currDR, opt: nDRO });
                    }
                } catch (e) {
                    console.error(`[AiDteRngOpt] Err:`, e);
                    addE('Fail to get AI dte rng opt.');
                } finally {
                    sLdOpt(false);
                }
            } else {
                console.warn(`[AiDteRngOpt] No act PredAn svc.`);
                sLdOpt(false);
            }
        };
        fOpt();
    }, [currDR, addR, lrn, addE]);
    return { optDR, ldOpt };
};

export const useAiTel = (evN: string, d: Record<string, any>) => {
    const { addAiErr: addE } = useAiCtx();
    Rct.useEffect(() => {
        const sTel = async () => {
            const telSvc = await AISvcReg.dscOptSvc('TelPip');
            if (telSvc) {
                try {
                    await telSvc.ex({ evN, ts: new Date().toISOString(), ...d });
                } catch (err) {
                    console.error(`[AiTel] Fail to snd tel for ${evN}:`, err);
                    addE(`Tel for "${evN}" fail.`);
                }
            }
        };
        sTel();
    }, [evN, d, addE]);
};

type RtrPrps = { m: { p: { e: string; c?: string; }; }; };
const defCrmbs = [{ name: "Csh Mngmt", path: "/accs" }];

const PgHdr: React.FC<{ title: string, loading: boolean, crumbs: any[], right: React.ReactNode, children: React.ReactNode }> = ({ title, loading, crumbs, right, children }) => (
    <div style={{ padding: '24px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #ddd', paddingBottom: '16px' }}>
            <div>
                <nav style={{ fontSize: '0.9rem', color: '#555' }}>{crumbs.map((c, i) => <span key={i}>{i > 0 ? ' / ' : ''}<a href={c.path} style={{ textDecoration: 'none', color: 'inherit' }}>{c.name}</a></span>)}</nav>
                <h1 style={{ margin: '8px 0 0 0' }}>{title}</h1>
            </div>
            <div>{right}</div>
        </header>
        {loading && <LdngLn />}
        <div>{children}</div>
    </div>
);

const Lyt: React.FC<{ primaryContent: React.ReactNode }> = ({ primaryContent }) => <div style={{ marginTop: '24px' }}>{primaryContent}</div>;
const MvMnyDrpdwn: React.FC = () => <Btn>Mv Mny</Btn>;
const CrrncyDrpdwn: React.FC<{ currencies: string[], selectedCurrency: string, setSelectedCurrency: (c: string) => void, setGlobalDateFilterLabel: any }> = ({ currencies, selectedCurrency, setSelectedCurrency }) => (
    <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)} style={{ padding: '8px', borderRadius: '4px' }}>
        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
);
const DteSrch: React.FC<any> = ({ query, updateQuery, options, defaultLabel }) => (
    <select onChange={e => updateQuery({ dateRange: JSON.parse(e.target.value) })} style={{ padding: '8px', borderRadius: '4px' }} defaultValue={JSON.stringify(query.dateRange)}>
        {options.map((o: any) => <option key={o.label} value={JSON.stringify(o.dateRange)}>{o.label}</option>)}
        {defaultLabel && <option>{defaultLabel}</option>}
    </select>
);
const AccsOvrvwBar: React.FC<any> = (props) => <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>Accs Ovrvw Bar: {props.entityId} - {props.currency}</div>;
const HstBlChrtFrGrps: React.FC<any> = (props) => <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px', minHeight: '300px' }}>Hst Bl Chrt: {props.currency}</div>;
const SrchblBlFd: React.FC<any> = (props) => <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>Srchbl Bl Fd: {props.connectionId}</div>;

export default function CnVw({ m: { p: { e, c } } }: RtrPrps) {
    return (
        <AiCtxPrvdr>
            <CnVwIntrnl m={{ p: { e, c } }} />
        </AiCtxPrvdr>
    );
}

function CnVwIntrnl({ m: { p: { e, c } } }: RtrPrps) {
    const [selC, sSelC] = Rct.useState<string | undefined>(c);
    const [q, sQ] = Rct.useState(() => {
        const sDR = CkMan.gt("glblDteRng");
        if (sDR) return { dR: JSON.parse(sDR) };
        return { dR: ACC_DTE_RNG_FLTR_OPTS[1].dateRange };
    });
    const [dRLbl, sDRLbl] = Rct.useState("");
    const { lrnFrAct: lrn, addSecAlrt: addA, addAiErr: addE, adaptUISets: aUIS } = useAiCtx();
    const { optDR, ldOpt } = useAiDteRngOpt(q.dR);

    Rct.useEffect(() => {
        if (optDR && !ldOpt) {
            console.log("[AI] AI suggd opt dte rng:", optDR);
        }
    }, [optDR, ldOpt, lrn]);

    const sGlblDtFltrLbl = () => { sDRLbl("Mxd"); lrn('s_mxd_dte_lbl', { e, c, dR: q.dR }); };

    const hndlSelCChng = Rct.useCallback(async (nC: string | null) => {
        if (nC === null) return;
        const cRsn = await AISvcReg.dscOptSvc('PredAn');
        if (cRsn) {
            try {
                const prd = await cRsn.ex({ t: 'c_chng_impct', curr: selC, n: nC });
                console.log(`[AI Rsn] Impct prd for c chng to ${nC}:`, prd);
                lrn('c_chng_prd', { selC, nC, prd });
            } catch (ex) {
                console.error("[AI Rsn] Err dur c chng prd:", ex);
                addE(`AI fail to prd impct for c chng to ${nC}.`);
            }
        }
        sSelC(nC);
        const nU = `${window.location.origin}/accs/cns/${e}/${nC.toLowerCase()}`;
        window.history.replaceState({}, "", nU);
        lrn('c_chngd', { e, c: nC });
    }, [selC, e, lrn, addE]);

    const [ttl, sTtl] = Rct.useState<string | undefined>("");
    const [crmbs, sCrmbs] = Rct.useState<{ name: string; path?: string }[]>(defCrmbs);
    const [crrncs, sCrrncs] = Rct.useState<string[]>([]);
    const { d, l, err: qErr } = GQLClnt.uQ({ v: { entity: e } });
    
    Rct.useEffect(() => {
        const rSecChk = async () => {
            const secSvc = await AISvcReg.dscOptSvc('SecAdv');
            if (secSvc) {
                try {
                    const res = await secSvc.ex({ cId: d?.connection?.id, eId: e, cnT: 'vw' });
                    if (!res.suc) { addA(res.msg); addE(`Sec Adv flag iss: ${res.msg}`); }
                } catch (err) {
                    console.error(`[AI SecAdv] Err:`, err);
                    addE('Fail to rn AI sec chk for cn.');
                }
            }
        };
        if (d?.connection?.id) { rSecChk(); lrn('cn_d_ldd', { cId: d.connection.id }); }
    }, [d?.connection?.id, e, addA, addE, lrn]);
    
    Rct.useEffect(() => {
        if (qErr) {
            console.error("[AI Slf-Awr] GQL q err det:", qErr);
            addE(`Fail to ld cn dta: ${qErr.message}. AI suggs rev net conn or API gw logs.`);
            lrn('gql_q_err', { e, errM: qErr.message });
        }
    }, [qErr, addE, lrn, e]);

    Rct.useEffect(() => {
        if (!d?.connection) return;
        const vN = d?.connection?.nickname || d.connection?.vendor?.name;
        if (vN) {
            const nT = `${vN} (${selC?.toUpperCase()})`;
            sCrmbs([...defCrmbs, { name: nT }]);
            sTtl(nT);
            lrn('ttl_updd', { vN, selC });
        }
    }, [d?.connection, selC, lrn]);

    Rct.useEffect(() => {
        if (!d?.connection) return;
        if (selC) {
            const nU = `${window.location.origin}/accs/cns/${e}/${selC.toLowerCase()}`;
            window.history.replaceState({}, "", nU);
        }
    }, [selC, c, d?.connection, e]);

    Rct.useEffect(() => {
        if (!d?.connection) return;
        const vN = d?.connection?.nickname || d.connection?.vendor?.name;
        if (vN) {
            const cnCrrs = d?.connection?.currencies;
            sCrrncs(cnCrrs);
            if (selC === undefined && crrncs && crrncs.length > 0) {
                sSelC(crrncs[0].toUpperCase());
                lrn('def_c_set', { c: crrncs[0].toUpperCase() });
            }
            if (selC) sTtl(`${vN} (${selC?.toUpperCase()})`);
        }
    }, [d?.connection, selC, crrncs, lrn]);

    const bC = selC ?? c ?? "USD";
    const cId = d?.connection?.id;
    const { recC, ldRec } = useAiCurrRec(bC, crrncs);
    useAiTel('CnVwRndrd', { e, c: selC, cId, dR: q.dR, uId: CkMan.gt('uId') || 'anon' });
    const shwAIBtn = aUIS.cn_d_ldd?.shwRelRpts || false;

    return (
        <PgHdr title={ttl as string} loading={l} crumbs={crmbs} right={<MvMnyDrpdwn />}>
            <>
                {l && <LdngLn noH />}
                <AiCtxActBar />
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
                    <DteSrch key={UidGen.v4()} query={q} field="dR" options={ACC_DTE_RNG_FLTR_OPTS} updateQuery={(i: Record<string, any>) => {
                            CkMan.st("glblDteRng", JSON.stringify(i.dateRange), { expires: 7 });
                            sDRLbl("");
                            sQ({ dR: i.dateRange });
                            EvtTrckr(null, ACC_ACTNS.CHNG_GLBL_DTE_FLTR, { path: window.location.pathname });
                            lrn('dte_fltr_chngd', { nDR: i.dateRange });
                        }}
                        defaultLabel={dRLbl !== "" ? dRLbl : undefined}
                    />
                    <CrrncyDrpdwn currencies={crrncs} selectedCurrency={selC?.toUpperCase() as string} setSelectedCurrency={(nC) => { hndlSelCChng(nC); lrn('man_c_sel', { c: nC }); }}
                        setGlobalDateFilterLabel={() => sDRLbl("")}
                    />
                    {ldRec ? (<LdngLn noH txt="AI rec c..." />) : (recC && recC !== selC?.toUpperCase() && (
                        <Btn variant="primary" onClick={() => hndlSelCChng(recC)} className="ml-2" style={{ background: '#2563EB', hover: { background: '#1D4ED8' }, color: 'white' }}>
                            AI Suggsts: {recC}
                        </Btn>
                    ))}
                </div>
                {selC && cId && q.dR && (
                    <>
                        <AccsOvrvwBar entityId={cId} entityType="Connection" currency={selC.toUpperCase()} dateRange={q.dR} setGlobalDateFilterLabel={sGlblDtFltrLbl} />
                        <AiAnomDet cId={cId} curr={selC.toUpperCase()} dR={q.dR} onAnomDet={(anom) => { console.warn("AI Anom det in CnVw:", anom); }} />
                        <Lyt primaryContent={
                                <HstBlChrtFrGrps currency={bC.toUpperCase()} defaultEntityId={cId} dateRange={q.dR} setGlobalDateFilterLabel={sGlblDtFltrLbl} defaultGroupBy={GRP_TYP_ENM.B} showGroupByDropdown={false} showEntitySelectorDropdown={false} />
                            }
                        />
                    </>
                )}
                {selC && cId && <SrchblBlFd connectionId={cId} currencies={[selC.toUpperCase()]} hideFilters />}
            </>
        </PgHdr>
    );
}