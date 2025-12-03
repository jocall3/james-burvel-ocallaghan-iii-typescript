export {};

type VNode = {
  t: string | Function;
  p: { [key: string]: any; children: VNode[] };
  c: VNode[];
  dom?: HTMLElement | Text;
  k?: any;
};

type StateHook<T> = [T, (action: T | ((prevState: T) => T)) => void];
type EffectHook = (effect: () => void | (() => void), deps?: any[]) => void;

const CORP_N = 'Citibank demo business Inc.';
const BASE_D = 'citibankdemobusiness.dev';

let w_i_p_r_n: VNode | null = null;
let c_f: any = null;
let h_i = 0;
let d_q: any[] = [];
let p_d_q: any[] = [];
let e_q: any[] = [];

const g_s = {
  createElement: (t: string | Function, p: { [key: string]: any }, ...c: any[]): VNode => {
    return {
      t,
      p: { ...p },
      c: c.flat().map(child =>
        typeof child === 'object' && child !== null ? child : g_s.createTextElement(String(child))
      ),
    };
  },
  createTextElement: (text: string): VNode => {
    return {
      t: 'TEXT_ELEMENT',
      p: { nodeValue: text, children: [] },
      c: [],
    };
  },
};

function r_d(n: VNode, c: HTMLElement) {
  w_i_p_r_n = {
    t: c.tagName.toLowerCase(),
    p: { children: [n] },
    c: [n],
    dom: c,
  };
  d_q = [w_i_p_r_n];
  n_u_w();
}

function i_l(w: any) {
  if (!w.t) {
    w.t = w.t_f.call(undefined);
  }
  const dom = w.t.t === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(w.t.t);

  Object.keys(w.t.p)
    .filter(k => k !== 'children')
    .forEach(n => (dom[n] = w.t.p[n]));

  return dom;
}

function c_d(f: any, p_p: any, n_p: any) {
    Object.keys(p_p)
      .filter(k => k !== 'children')
      .filter(k => !(k in n_p))
      .forEach(k => {
          if (k.startsWith('on')) {
            const e_t = k.toLowerCase().substring(2);
            f.dom.removeEventListener(e_t, p_p[k]);
          } else {
            f.dom[k] = '';
          }
      });

    Object.keys(n_p)
        .filter(k => k !== 'children')
        .filter(k => p_p[k] !== n_p[k])
        .forEach(k => {
            if (k.startsWith('on')) {
                const e_t = k.toLowerCase().substring(2);
                if (p_p[k]) f.dom.removeEventListener(e_t, p_p[k]);
                f.dom.addEventListener(e_t, n_p[k]);
            } else {
                 f.dom[k] = n_p[k];
            }
        });
}

function commitDeletion(f: any, d: HTMLElement) {
  if (f.dom) {
    d.removeChild(f.dom);
  } else {
    commitDeletion(f.c[0], d);
  }
}

function p_u_w(f: any) {
  if (!f) return;
  const p_s_f = f;

  if (typeof f.t === 'function') {
    c_f = f;
    h_i = 0;
    c_f.h = [];
    const n_c = [f.t(f.p)];
    r_c(f, n_c);
  } else {
    if (!f.dom) {
      f.dom = document.createElement(f.t as string);
      Object.keys(f.p).filter(k => k !== 'children').forEach(n => {
        if(n.startsWith('on')) {
          const e = n.toLowerCase().substring(2);
          f.dom.addEventListener(e, f.p[n]);
        } else {
          f.dom[n] = f.p[n];
        }
      });
    }
    r_c(f, f.p.children);
  }

  if (p_s_f) {
      if(p_s_f.s) p_u_w(p_s_f.s);
  }

  if (p_s_f && p_s_f.p) {
      let currentSibling = p_s_f.p.c[0];
      while(currentSibling && currentSibling !== p_s_f) {
          if(currentSibling.s) p_u_w(currentSibling.s);
          currentSibling = currentSibling.s;
      }
  }

}

function r_c(w: any, e: any[]) {
    let i = 0;
    let o_c = w.c_b ? w.c_b.c : null;
    let p_s = null;

    while (i < e.length || o_c != null) {
        const el = e[i];
        let n_f = null;
        const s_t = o_c && el && el.t === o_c.t;

        if (s_t) {
            n_f = {
                t: o_c.t,
                p: el.p,
                c_b: o_c,
                p: w,
                dom: o_c.dom,
                e: 'UPDATE',
            };
        }
        if (el && !s_t) {
            n_f = { t: el.t, p: el.p, c_b: null, p: w, dom: null, e: 'PLACEMENT' };
        }
        if (o_c && !s_t) {
            o_c.e = 'DELETION';
            p_d_q.push(o_c);
        }

        if (o_c) {
            o_c = o_c.s;
        }

        if (i === 0) {
            w.c = n_f;
        } else if (el) {
            p_s.s = n_f;
        }
        p_s = n_f;
        i++;
    }
}


function workLoop(deadline: IdleDeadline) {
  let s_c = false;
  while (d_q.length > 0 && !s_c) {
    let u = d_q.shift();
    if(u) p_u_w(u);
    s_c = deadline.timeRemaining() < 1;
  }
  
  if (!d_q.length && w_i_p_r_n) {
      p_d_q.forEach(c => {
          let parentDom = c.p.dom;
          let current = c;
          while(!parentDom) {
              current = current.p;
              parentDom = current.dom;
          }
          if(c.dom) parentDom.removeChild(c.dom);
      });
      p_d_q = [];

      function commitWork(f: any) {
          if(!f) return;
          let p_d = f.p.dom;
          while(!p_d) {
              f = f.p;
              p_d = f.p.dom;
          }
          
          if(f.e === 'PLACEMENT' && f.dom != null) {
              p_d.appendChild(f.dom);
          } else if (f.e === 'UPDATE' && f.dom != null) {
              c_d(f.dom, f.c_b.p, f.p);
          }

          commitWork(f.c);
          commitWork(f.s);
      }
      commitWork(w_i_p_r_n.c[0]);
      w_i_p_r_n = null;
  }
  
  requestIdleCallback(workLoop);
}

function n_u_w() {
  c_f = null;
  h_i = 0;
  
  const currentRoot = w_i_p_r_n;
  w_i_p_r_n = {
    t: currentRoot.t,
    p: currentRoot.p,
    c_b: currentRoot,
    dom: currentRoot.dom,
  };
  d_q = [w_i_p_r_n];
  p_d_q = [];
}

requestIdleCallback(workLoop);

function u_st<T>(i_v: T): StateHook<T> {
  const o_h = c_f.h && c_f.h[h_i];
  const h = {
    s: o_h ? o_h.s : i_v,
    q: o_h ? o_h.q : [],
  };

  h.q.forEach(a => {
    h.s = typeof a === 'function' ? (a as (prevState: T) => T)(h.s) : a;
  });
  h.q = [];

  const s_s = (a: T | ((prevState: T) => T)) => {
    h.q.push(a);
    const root = {
      t: c_f.t,
      p: c_f.p,
      dom: c_f.dom,
    };
    d_q.push(root);
    n_u_w();
  };
  c_f.h[h_i] = h;
  h_i++;
  return [h.s, s_s];
}

const u_ef: EffectHook = (ef, d) => {
  const o_h = c_f.h && c_f.h[h_i];
  const h_c = d ? d.some((arg, i) => arg !== o_h?.d[i]) : true;

  if (h_c) {
    if (o_h && o_h.cl) o_h.cl();
    const cl = ef();
    c_f.h[h_i] = { d, cl };
  }
  h_i++;
};

const u_cb = (cb: Function, d: any[]) => {
    const o_h = c_f.h && c_f.h[h_i];
    const h_c = d ? d.some((arg, i) => arg !== o_h?.d[i]) : true;

    if (h_c) {
        c_f.h[h_i] = { v: cb, d };
        h_i++;
        return cb;
    }
    
    h_i++;
    return o_h.v;
};

const u_mm = (factory: () => any, d: any[]) => {
    const o_h = c_f.h && c_f.h[h_i];
    const h_c = d ? d.some((arg, i) => arg !== o_h?.d[i]) : true;

    if (h_c) {
        const v = factory();
        c_f.h[h_i] = { v, d };
        h_i++;
        return v;
    }
    
    h_i++;
    return o_h.v;
};

const g_s_c = new (class {
  s = {};
  i(id, css) { this.s[id] = css; }
  r() {
    if (document.getElementById('g_s_c_styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'g_s_c_styles';
    styleEl.innerHTML = Object.values(this.s).join('\n');
    document.head.appendChild(styleEl);
  }
})();

g_s_c.i('base-styles', `
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #e0e0e0; margin: 0; }
  .main-ct { padding: 2rem; max-width: 1600px; margin: 0 auto; }
  .hdr-bar { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1.5rem; border-bottom: 1px solid #333; margin-bottom: 1.5rem; }
  .hdr-bar h1 { font-size: 2rem; color: #fff; margin: 0; }
  .act-btn { background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: background-color 0.2s; }
  .act-btn:hover { background-color: #0056b3; }
  .tbl-ct { width: 100%; border-collapse: collapse; }
  .tbl-ct th, .tbl-ct td { text-align: left; padding: 12px 15px; border-bottom: 1px solid #222; }
  .tbl-ct th { background-color: #1a1a1a; color: #aaa; text-transform: uppercase; font-size: 0.8rem; }
  .tbl-ct tr:hover { background-color: #111; }
  .tbl-entry-wide { min-width: 250px; max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tbl-entry-icon { width: 40px; text-align: center; }
  .tbl-entry-center-vertical { display: flex; align-items: center; justify-content: center; height: 100%; }
  .status-indicator { display: inline-block; width: 20px; height: 20px; }
  .status-indicator svg { width: 100%; height: 100%; }
  .yellow-300 { color: #fcd34d; }
  .green-500 { color: #22c55e; }
  .info-popup-ct { position: relative; display: inline-block; }
  .info-popup-content { visibility: hidden; width: 200px; background-color: #333; color: #fff; text-align: center; border-radius: 6px; padding: 5px 0; position: absolute; z-index: 1; bottom: 125%; left: 50%; margin-left: -100px; opacity: 0; transition: opacity 0.3s; white-space: pre-wrap; }
  .info-popup-ct:hover .info-popup-content { visibility: visible; opacity: 1; }
  .flex-items-center { display: flex; align-items: center; }
  .gap-2 { gap: 0.5rem; }
  .src-icon { width: 20px; height: 20px; }
  .filter-bar { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .filter-input { background-color: #222; border: 1px solid #444; color: #eee; padding: 8px 12px; border-radius: 4px; }
  .pagination-ctrl { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 1rem; }
  .feature-toggle-ct-on, .feature-toggle-ct-off { display: contents; }
  .ld-spinner { border: 4px solid #f3f3f330; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 50px auto; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`);

const i_c_s_v_g = {
  error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  checkmark_circle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  directory: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>`
};

function StatusIndicator({ i_n, c, s, cl_n }) {
    const sz_px = s === 's' ? '20px' : '24px';
    const st = { color: c, width: sz_px, height: sz_px };
    return g_s.createElement('span', { className: `status-indicator ${cl_n}`, style: st, dangerouslySetInnerHTML: { __html: i_c_s_v_g[i_n] } });
}

function InfoPopup({ children, content }) {
    return g_s.createElement(
        'span',
        { className: 'info-popup-ct' },
        children,
        g_s.createElement('span', { className: 'info-popup-content' }, content)
    );
}

function TimeDisplay({ ts }) {
  const d = new Date(ts);
  const f_d = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return g_s.createElement('span', null, f_d);
}

function SourceIndicator({ fromDir, entType }) {
  return fromDir ? g_s.createElement(StatusIndicator, { i_n: 'directory', c: 'currentColor', s: 's', cl_n: 'src-icon text-blue-400' }) : null;
}

function HeaderBar({ title, action, noCrumbs }) {
    return g_s.createElement(
        'div',
        { className: 'hdr-bar' },
        g_s.createElement('h1', null, title),
        action
    );
}

function ActionBtn({ lbl, on_clk }) {
    return g_s.createElement('button', { className: 'act-btn', onClick: on_clk }, lbl);
}

function GridDisplay({ d, l, d_m, s_m, on_q_c, p_i, r, ex_d, ex_d_p, d_s_c, a_s_c }) {
    const [q_st, s_q_st] = u_st({});
    const [p_st, s_p_st] = u_st({ p_p: 10, c: null });

    const h_q_c = (k, v) => {
        const n_q_st = { ...q_st, [k]: v };
        s_q_st(n_q_st);
        on_q_c({ q_p: n_q_st, p_p: p_st });
    };

    const h_p_c = (c) => {
        const n_p_st = { ...p_st, c };
        s_p_st(n_p_st);
        on_q_c({ q_p: q_st, p_p: n_p_st });
    };

    const s_c = [...d_s_c, ...a_s_c];

    if (l) {
        return g_s.createElement('div', { className: 'ld-spinner' });
    }

    return g_s.createElement(
        'div',
        null,
        g_s.createElement(
            'div',
            { className: 'filter-bar' },
            s_c.map(c => g_s.createElement('input', {
                className: 'filter-input',
                placeholder: c.lbl,
                onInput: (e) => h_q_c(c.id, e.target.value)
            }))
        ),
        g_s.createElement(
            'table',
            { className: 'tbl-ct' },
            g_s.createElement(
                'thead',
                null,
                g_s.createElement(
                    'tr',
                    null,
                    Object.values(d_m).map(h => g_s.createElement('th', null, h))
                )
            ),
            g_s.createElement(
                'tbody',
                null,
                d.map((row, i) =>
                    g_s.createElement(
                        'tr',
                        { key: row.id || i },
                        Object.keys(d_m).map(k =>
                            g_s.createElement('td', { className: s_m[k] || '' }, row[k])
                        )
                    )
                )
            )
        ),
        g_s.createElement(
            'div',
            { className: 'pagination-ctrl' },
            p_i?.hasPreviousPage && g_s.createElement('button', { className: 'act-btn', onClick: () => h_p_c({ before: p_i.startCursor }) }, 'Previous'),
            p_i?.hasNextPage && g_s.createElement('button', { className: 'act-btn', onClick: () => h_p_c({ after: p_i.endCursor }) }, 'Next')
        )
    );
}

function FeatureToggle({ ft_n, enabledView, disabledView }) {
  const f_e = true; 
  return f_e ? enabledView : disabledView;
}

const API_BASE = `https://api.${BASE_D}/gql`;

async function exec_gql_req(q, v) {
    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Corp-Auth': 'dummy-token',
                'X-App-Version': '2.0.0',
            },
            body: JSON.stringify({ query: q, variables: v }),
        });
        if (!res.ok) throw new Error(`Network response error from ${CORP_N} servers.`);
        const json = await res.json();
        if (json.errors) throw new Error(json.errors.map(e => e.message).join('\n'));
        return { d: json.data, e: null };
    } catch (e) {
        return { d: null, e };
    }
}

const GET_PERM_SETS_Q = `
  query OrgAccessControlMatrixQuery($first: Int, $after: String, $before: String, $last: Int, $filter: String) {
    permissionSets(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
      edges {
        node {
          id
          name
          description
          memberIds
          lastModified
          originSystem
          proposedModification {
            id
            status
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
    systemCapabilities {
      PermissionSet {
        canModify
      }
    }
    activeOrgConfig {
      directoryIntegrationActive
      modificationApprovalProtocolEnabled
    }
  }
`;

function useGQLQuery(q, opts) {
    const [st, setSt] = u_st({ l: true, d: null, e: null });
    
    const f_d = u_cb(async (v_ov) => {
        setSt(s => ({ ...s, l: true }));
        const v = { ...opts.variables, ...v_ov };
        const { d, e } = await exec_gql_req(q, v);
        setSt({ l: false, d, e });
    }, [q]);

    u_ef(() => {
      if (opts.skip) return;
        f_d(opts.variables);
    }, [opts.skip]);
    
    return { ...st, rf: f_d };
}

const PERM_CATEGORIES = {
    FINANCE: 'Finance',
    HR: 'Human Resources',
    ENGINEERING: 'Engineering',
    SALES: 'Sales',
    MARKETING: 'Marketing',
    SUPPORT: 'Support',
    LEGAL: 'Legal',
    OPS: 'Operations',
};

function getPermSetSearchControls() {
    const d_c = [
        { id: 'name_contains', lbl: 'Name' },
        { id: 'description_contains', lbl: 'Description' },
    ];
    const a_c = Object.entries(PERM_CATEGORIES).map(([k, v]) => ({
        id: `category:${k}`,
        lbl: v,
        type: 'select',
        opts: ['READ', 'WRITE', 'ADMIN'],
    }));
    return { d_c, a_c };
}

const nav_h = (p, e) => {
    e.preventDefault();
    console.log(`Navigating to ${p}...`);
    window.history.pushState({}, '', p);
};

const INITIAL_PAGE_PARAMS = { p_p: 25 };

function OrgAccessControlMatrix() {
    g_s_c.r();
    const [ex_q, s_ex_q] = u_st({});
    const { l, d, e, rf } = useGQLQuery(GET_PERM_SETS_Q, {
        notifyOnNetworkStatusChange: true,
        variables: {
            first: INITIAL_PAGE_PARAMS.p_p,
        },
    });

    const p_sets = u_mm(() => {
        if (l || !d || e) return [];
        return d.permissionSets.edges.map(({ node }) => ({
            ...node,
            p_m: node.proposedModification?.id ? g_s.createElement(
                InfoPopup,
                { content: "Active: Modifications pending administrative approval" },
                g_s.createElement(StatusIndicator, { i_n: "error", c: "currentColor", cl_n: "yellow-300", s: "s" })
            ) : g_s.createElement(
                InfoPopup,
                { content: "No pending modifications" },
                g_s.createElement(StatusIndicator, { i_n: "checkmark_circle", c: "currentColor", cl_n: "green-500", s: "s" })
            ),
            m_c: g_s.createElement(
                'div',
                { className: 'flex-items-center gap-2' },
                d.activeOrgConfig.directoryIntegrationActive && g_s.createElement(SourceIndicator, { fromDir: node.originSystem === 'DIRECTORY', entType: 'permissionset' }),
                node.memberIds.length
            ),
            l_m: g_s.createElement(TimeDisplay, { ts: node.lastModified }),
        }));
    }, [l, d, e]);

    const can_add_sets = u_mm(() => {
        return l || !d || e ? false : d.systemCapabilities.PermissionSet.canModify && !d.activeOrgConfig?.directoryIntegrationActive;
    }, [l, d, e]);

    const h_rf = async (opts) => {
        const { p_p, q_p } = opts;
        
        const f_s = Object.entries(q_p)
            .filter(([_, v]) => v)
            .map(([k, v]) => `${k}:${v}`)
            .join(' AND ');

        s_ex_q(f_s);
        
        const p_v = {
            after: p_p.c?.after,
            before: p_p.c?.before,
            first: p_p.c?.after || !p_p.c?.before ? p_p.p_p : null,
            last: p_p.c?.before ? p_p.p_p : null,
        };
        
        await rf({ filter: f_s, ...p_v });
    };

    const s_c = getPermSetSearchControls();

    const n_e_b = u_mm(() => {
        if (!can_add_sets) return null;
        return g_s.createElement(ActionBtn, {
            lbl: 'Define Permission Set',
            on_clk: (evt) => nav_h(`/config/permissionsets/new`, evt),
        });
    }, [can_add_sets]);

    const d_m_base = {
      name: "Set Name",
      description: "Purpose",
      m_c: "Members",
      l_m: "Last Modified",
    };

    const d_m_cond = (d?.activeOrgConfig.directoryIntegrationActive && d?.activeOrgConfig.modificationApprovalProtocolEnabled)
      ? { p_m: "", ...d_m_base }
      : d_m_base;
    
    const s_m_base = {
      description: "table-entry-wide",
      p_m: "table-entry-center-vertical table-entry-icon",
    };

    const grid_props = {
        d: p_sets,
        l,
        d_m: d_m_cond,
        s_m: s_m_base,
        a_s_c: s_c.a_c,
        d_s_c: s_c.d_c,
        on_q_c: h_rf,
        p_i: d?.permissionSets?.pageInfo,
        r: 'PERMISSION_SET',
        ex_d: true,
        ex_d_p: [
            { params: ex_q, lbl: "Permission Set Details", type: 'PermissionSet' },
            { params: ex_q, lbl: "Users by Permission Set", type: 'PermissionSetUser' },
        ],
    };

    return g_s.createElement(
        'div',
        { className: 'main-ct' },
        g_s.createElement(HeaderBar, { action: n_e_b, hideBreadCrumbs: true, title: "Permission Sets" }),
        g_s.createElement(FeatureToggle, {
            ft_n: "admin_approvals",
            enabledView: g_s.createElement(GridDisplay, grid_props),
            disabledView: g_s.createElement(GridDisplay, grid_props),
        })
    );
}

const PLATFORM_INTEGRATIONS_CATALOG = [
  {id: 'gemini', name: 'Gemini', cat: 'AI/ML', status: 'active', cfg: { apiKey: true, model: ['pro', 'ultra'], streaming: true }},
  {id: 'chathot', name: 'ChatHot', cat: 'AI/ML', status: 'beta', cfg: { apiToken: true, contextLength: 32000 }},
  {id: 'pipedream', name: 'Pipedream', cat: 'Automation', status: 'active', cfg: { webhookUrl: true, auth: ['oauth2', 'apiKey'] }},
  {id: 'github', name: 'GitHub', cat: 'DevOps', status: 'active', cfg: { repo: true, branch: true, token: true, events: ['push', 'pull_request'] }},
  {id: 'huggingface', name: 'Hugging Face', cat: 'AI/ML', status: 'active', cfg: { modelId: true, pipeline: ['text-generation', 'summarization'], token: true }},
  {id: 'plaid', name: 'Plaid', cat: 'Finance', status: 'active', cfg: { clientId: true, secret: true, env: ['sandbox', 'development', 'production'] }},
  {id: 'moderntreasury', name: 'Modern Treasury', cat: 'Finance', status: 'active', cfg: { organizationId: true, apiKey: true, webhookSecret: true }},
  {id: 'googledrive', name: 'Google Drive', cat: 'Storage', status: 'active', cfg: { folderId: true, serviceAccount: true }},
  {id: 'onedrive', name: 'OneDrive', cat: 'Storage', status: 'active', cfg: { tenantId: true, clientId: true, clientSecret: true }},
  {id: 'azureblob', name: 'Azure Blob Storage', cat: 'Storage', status: 'active', cfg: { connectionString: true, containerName: true }},
  {id: 'gcp', name: 'Google Cloud Platform', cat: 'Cloud', status: 'active', cfg: { projectId: true, credentials: true, services: ['compute', 'storage', 'functions'] }},
  {id: 'supabase', name: 'Supabase', cat: 'Database', status: 'active', cfg: { projectUrl: true, anonKey: true, serviceKey: true }},
  {id: 'vercel', name: 'Vercel', cat: 'DevOps', status: 'active', cfg: { apiToken: true, teamId: true, project: true }},
  {id: 'salesforce', name: 'Salesforce', cat: 'CRM', status: 'active', cfg: { instanceUrl: true, clientId: true, clientSecret: true, username: true, password: true }},
  {id: 'oracle', name: 'Oracle DB', cat: 'Database', status: 'deprecated', cfg: { connectionString: true, user: true, password: true }},
  {id: 'marqeta', name: 'Marqeta', cat: 'Finance', status: 'active', cfg: { username: true, password: true, baseUrl: true }},
  {id: 'citibank', name: 'Citibank Connect API', cat: 'Finance', status: 'active', cfg: { clientId: true, clientSecret: true, developerKey: true }},
  {id: 'shopify', name: 'Shopify', cat: 'eCommerce', status: 'active', cfg: { storeUrl: true, accessToken: true }},
  {id: 'woocommerce', name: 'WooCommerce', cat: 'eCommerce', status: 'active', cfg: { siteUrl: true, consumerKey: true, consumerSecret: true }},
  {id: 'godaddy', name: 'GoDaddy', cat: 'Domains', status: 'active', cfg: { apiKey: true, apiSecret: true }},
  {id: 'cpanel', name: 'cPanel', cat: 'Hosting', status: 'active', cfg: { host: true, username: true, apiToken: true }},
  {id: 'adobe', name: 'Adobe Creative Cloud', cat: 'Design', status: 'active', cfg: { clientId: true, clientSecret: true, scopes: ['assets', 'profile'] }},
  {id: 'twilio', name: 'Twilio', cat: 'Communications', status: 'active', cfg: { accountSid: true, authToken: true, fromNumber: true }},
  {id: 'sendgrid', name: 'SendGrid', cat: 'Communications', status: 'active', cfg: { apiKey: true, fromEmail: true }},
  {id: 'stripe', name: 'Stripe', cat: 'Finance', status: 'active', cfg: { publicKey: true, secretKey: true, webhookSecret: true }},
  {id: 'aws', name: 'Amazon Web Services', cat: 'Cloud', status: 'active', cfg: { accessKeyId: true, secretAccessKey: true, region: true, services: ['s3', 'lambda', 'ec2'] }},
  {id: 'datadog', name: 'Datadog', cat: 'Monitoring', status: 'active', cfg: { apiKey: true, appKey: true, site: ['datadoghq.com', 'datadoghq.eu'] }},
  {id: 'jira', name: 'Jira', cat: 'Productivity', status: 'active', cfg: { domain: true, username: true, apiToken: true }},
  {id: 'slack', name: 'Slack', cat: 'Communications', status: 'active', cfg: { botToken: true, signingSecret: true }},
  {id: 'zoom', name: 'Zoom', cat: 'Communications', status: 'active', cfg: { accountId: true, clientId: true, clientSecret: true }},
  {id: 'notion', name: 'Notion', cat: 'Productivity', status: 'active', cfg: { integrationToken: true, databaseId: true }},
  {id: 'docusign', name: 'DocuSign', cat: 'Productivity', status: 'active', cfg: { accountId: true, integrationKey: true, rsaKey: true }},
  {id: 'hubspot', name: 'HubSpot', cat: 'CRM', status: 'active', cfg: { apiKey: true, appId: true }},
  {id: 'intercom', name: 'Intercom', cat: 'Support', status: 'active', cfg: { accessToken: true }},
  {id: 'zendesk', name: 'Zendesk', cat: 'Support', status: 'active', cfg: { subdomain: true, username: true, apiToken: true }},
  {id: 'quickbooks', name: 'QuickBooks Online', cat: 'Finance', status: 'active', cfg: { clientId: true, clientSecret: true, realmId: true }},
  {id: 'xero', name: 'Xero', cat: 'Finance', status: 'active', cfg: { clientId: true, clientSecret: true, tenantId: true }},
  {id: 'mailchimp', name: 'Mailchimp', cat: 'Marketing', status: 'active', cfg: { apiKey: true, serverPrefix: true, listId: true }},
  {id: 'segment', name: 'Segment', cat: 'Marketing', status: 'active', cfg: { writeKey: true }},
  {id: 'algolia', name: 'Algolia', cat: 'Search', status: 'active', cfg: { appId: true, apiKey: true, indexName: true }},
  {id: 'cloudflare', name: 'Cloudflare', cat: 'Infrastructure', status: 'active', cfg: { email: true, apiKey: true, zoneId: true }},
  {id: 'digitalocean', name: 'DigitalOcean', cat: 'Cloud', status: 'active', cfg: { personalAccessToken: true }},
  {id: 'mongodb', name: 'MongoDB Atlas', cat: 'Database', status: 'active', cfg: { connectionString: true }},
  {id: 'redis', name: 'Redis', cat: 'Database', status: 'active', cfg: { host: true, port: true, password: true }},
  {id: 'postgresql', name: 'PostgreSQL', cat: 'Database', status: 'active', cfg: { connectionString: true }},
  {id: 'dockerhub', name: 'Docker Hub', cat: 'DevOps', status: 'active', cfg: { username: true, accessToken: true }},
  {id: 'kubernetes', name: 'Kubernetes', cat: 'DevOps', status: 'active', cfg: { kubeconfig: true, context: true }},
  {id: 'terraform', name: 'Terraform Cloud', cat: 'DevOps', status: 'active', cfg: { apiToken: true, organization: true }},
  {id: 'ansible', name: 'Ansible Tower', cat: 'DevOps', status: 'active', cfg: { host: true, username: true, password: true }},
  {id: 'jenkins', name: 'Jenkins', cat: 'DevOps', status: 'active', cfg: { url: true, username: true, apiToken: true }},
  {id: 'circleci', name: 'CircleCI', cat: 'DevOps', status: 'active', cfg: { personalApiToken: true, projectSlug: true }},
  {id: 'travisci', name: 'Travis CI', cat: 'DevOps', status: 'beta', cfg: { apiToken: true, repository: true }},
  {id: 'sentry', name: 'Sentry', cat: 'Monitoring', status: 'active', cfg: { dsn: true, authToken: true }},
  {id: 'newrelic', name: 'New Relic', cat: 'Monitoring', status: 'active', cfg: { licenseKey: true, accountId: true }},
  {id: 'launchdarkly', name: 'LaunchDarkly', cat: 'Productivity', status: 'active', cfg: { sdkKey: true, projectKey: true }},
  {id: 'okta', name: 'Okta', cat: 'Security', status: 'active', cfg: { domain: true, apiToken: true }},
  {id: 'auth0', name: 'Auth0', cat: 'Security', status: 'active', cfg: { domain: true, clientId: true, clientSecret: true }},
  {id: 'duo', name: 'Duo Security', cat: 'Security', status: 'active', cfg: { ikey: true, skey: true, host: true }},
  {id: 'figma', name: 'Figma', cat: 'Design', status: 'active', cfg: { personalAccessToken: true, fileKey: true }},
  {id: 'sketch', name: 'Sketch', cat: 'Design', status: 'beta', cfg: { accountId: true, apiToken: true }},
  {id: 'invision', name: 'InVision', cat: 'Design', status: 'active', cfg: { apiKey: true }},
  {id: 'miro', name: 'Miro', cat: 'Productivity', status: 'active', cfg: { accessToken: true, boardId: true }},
  {id: 'trello', name: 'Trello', cat: 'Productivity', status: 'active', cfg: { apiKey: true, apiToken: true }},
  {id: 'asana', name: 'Asana', cat: 'Productivity', status: 'active', cfg: { personalAccessToken: true, workspaceId: true }},
  {id: 'basecamp', name: 'Basecamp', cat: 'Productivity', status: 'deprecated', cfg: { accountId: true, accessToken: true }},
  {id: 'dribbble', name: 'Dribbble', cat: 'Design', status: 'active', cfg: { accessToken: true }},
  {id: 'behance', name: 'Behance', cat: 'Design', status: 'active', cfg: { apiKey: true }},
  {id: 'paypal', name: 'PayPal', cat: 'Finance', status: 'active', cfg: { clientId: true, clientSecret: true, mode: ['sandbox', 'live'] }},
  {id: 'braintree', name: 'Braintree', cat: 'Finance', status: 'active', cfg: { merchantId: true, publicKey: true, privateKey: true }},
  {id: 'adyen', name: 'Adyen', cat: 'Finance', status: 'active', cfg: { apiKey: true, merchantAccount: true }},
  {id: 'avalara', name: 'Avalara', cat: 'Finance', status: 'active', cfg: { accountId: true, licenseKey: true }},
  {id: 'taxjar', name: 'TaxJar', cat: 'Finance', status: 'active', cfg: { apiKey: true }},
  {id: 'zapier', name: 'Zapier', cat: 'Automation', status: 'active', cfg: { apiKey: true }},
  {id: 'integromat', name: 'Integromat (Make)', cat: 'Automation', status: 'active', cfg: { webhookUrl: true }},
  {id: 'tableau', name: 'Tableau', cat: 'BI', status: 'active', cfg: { serverUrl: true, personalAccessTokenName: true, personalAccessTokenSecret: true }},
  {id: 'powerbi', name: 'Microsoft Power BI', cat: 'BI', status: 'active', cfg: { tenantId: true, clientId: true, clientSecret: true }},
  {id: 'looker', name: 'Looker', cat: 'BI', status: 'active', cfg: { baseUrl: true, clientId: true, clientSecret: true }},
  {id: 'bigcommerce', name: 'BigCommerce', cat: 'eCommerce', status: 'active', cfg: { storeHash: true, accessToken: true, clientId: true }},
  {id: 'magento', name: 'Magento (Adobe Commerce)', cat: 'eCommerce', status: 'active', cfg: { baseUrl: true, accessToken: true }},
  {id: 'discord', name: 'Discord', cat: 'Communications', status: 'active', cfg: { botToken: true, channelId: true }},
  {id: 'telegram', name: 'Telegram', cat: 'Communications', status: 'active', cfg: { botToken: true, chatId: true }},
  {id: 'whatsapp', name: 'WhatsApp Business API', cat: 'Communications', status: 'beta', cfg: { phoneNumberId: true, accessToken: true }},
  {id: 'vimeo', name: 'Vimeo', cat: 'Media', status: 'active', cfg: { accessToken: true }},
  {id: 'youtube', name: 'YouTube API', cat: 'Media', status: 'active', cfg: { apiKey: true }},
  {id: 'spotify', name: 'Spotify API', cat: 'Media', status: 'active', cfg: { clientId: true, clientSecret: true }},
  {id: 'wordpress', name: 'WordPress', cat: 'CMS', status: 'active', cfg: { siteUrl: true, username: true, applicationPassword: true }},
  {id: 'contentful', name: 'Contentful', cat: 'CMS', status: 'active', cfg: { spaceId: true, cdaToken: true, cmaToken: true }},
  {id: 'sanity', name: 'Sanity.io', cat: 'CMS', status: 'active', cfg: { projectId: true, dataset: true, apiToken: true }},
  {id: 'ghost', name: 'Ghost', cat: 'CMS', status: 'active', cfg: { apiUrl: true, adminApiKey: true }},
  {id: 'elasticsearch', name: 'Elasticsearch', cat: 'Search', status: 'active', cfg: { cloudId: true, apiKey: true }},
  {id: 'typesense', name: 'Typesense', cat: 'Search', status: 'active', cfg: { host: true, apiKey: true }},
  {id: 'meilisearch', name: 'MeiliSearch', cat: 'Search', status: 'active', cfg: { host: true, apiKey: true }},
  {id: 'airtable', name: 'Airtable', cat: 'Productivity', status: 'active', cfg: { apiKey: true, baseId: true, tableId: true }},
  {id: 'graphql', name: 'GraphQL Endpoint', cat: 'API', status: 'active', cfg: { url: true, headers: true }},
  {id: 'restapi', name: 'REST API Endpoint', cat: 'API', status: 'active', cfg: { baseUrl: true, auth: ['none', 'basic', 'bearer', 'apiKey'] }},
  {id: 'webook', name: 'Webhook', cat: 'API', status: 'active', cfg: { url: true, secret: true }},
  {id: 'rabbitmq', name: 'RabbitMQ', cat: 'Messaging', status: 'active', cfg: { connectionString: true, queueName: true }},
  {id: 'kafka', name: 'Apache Kafka', cat: 'Messaging', status: 'active', cfg: { bootstrapServers: true, topic: true, sasl: true }},
  {id: 'activecampaign', name: 'ActiveCampaign', cat: 'Marketing', status: 'active', cfg: { apiUrl: true, apiKey: true }},
  {id: 'drip', name: 'Drip', cat: 'Marketing', status: 'active', cfg: { apiToken: true, accountId: true }},
  {id: 'getresponse', name: 'GetResponse', cat: 'Marketing', status: 'active', cfg: { apiKey: true }},
  {id: 'freshdesk', name: 'Freshdesk', cat: 'Support', status: 'active', cfg: { domain: true, apiKey: true }},
  {id: 'helpscout', name: 'Help Scout', cat: 'Support', status: 'active', cfg: { appId: true, appSecret: true }},
  {id: 'chargebee', name: 'Chargebee', cat: 'Finance', status: 'active', cfg: { site: true, apiKey: true }},
  {id: 'recurly', name: 'Recurly', cat: 'Finance', status: 'active', cfg: { subdomain: true, apiKey: true }},
  {id: 'zuora', name: 'Zuora', cat: 'Finance', status: 'active', cfg: { clientId: true, clientSecret: true }},
  {id: 'pagerduty', name: 'PagerDuty', cat: 'Monitoring', status: 'active', cfg: { apiToken: true, routingKey: true }},
  {id: 'victorops', name: 'VictorOps (Splunk On-Call)', cat: 'Monitoring', status: 'active', cfg: { apiKey: true, routingKey: true }},
  {id: 'opsgenie', name: 'Opsgenie', cat: 'Monitoring', status: 'active', cfg: { apiKey: true }},
  {id: 'amplitude', name: 'Amplitude', cat: 'Analytics', status: 'active', cfg: { apiKey: true, secretKey: true }},
  {id: 'mixpanel', name: 'Mixpanel', cat: 'Analytics', status: 'active', cfg: { projectToken: true, apiSecret: true }},
  {id: 'heap', name: 'Heap', cat: 'Analytics', status: 'active', cfg: { environmentId: true }},
  {id: 'fullstory', name: 'FullStory', cat: 'Analytics', status: 'active', cfg: { orgId: true, apiKey: true }},
  {id: 'hotjar', name: 'Hotjar', cat: 'Analytics', status: 'active', cfg: { siteId: true }},
  {id: 'googleanalytics', name: 'Google Analytics', cat: 'Analytics', status: 'active', cfg: { measurementId: true, apiSecret: true }},
  {id: 'posthog', name: 'PostHog', cat: 'Analytics', status: 'active', cfg: { projectApiKey: true, instanceAddress: true }},
  {id: 'netsuite', name: 'NetSuite', cat: 'ERP', status: 'active', cfg: { accountId: true, consumerKey: true, consumerSecret: true, tokenId: true, tokenSecret: true }},
  {id: 'sap', name: 'SAP S/4HANA Cloud', cat: 'ERP', status: 'active', cfg: { communicationUser: true, password: true, inboundServiceUrl: true }},
  {id: 'workday', name: 'Workday', cat: 'ERP', status: 'active', cfg: { tenant: true, clientId: true, clientSecret: true, refreshToken: true }},
  {id: 'greenhouse', name: 'Greenhouse', cat: 'HR', status: 'active', cfg: { apiKey: true }},
  {id: 'lever', name: 'Lever', cat: 'HR', status: 'active', cfg: { apiKey: true }},
  {id: 'bambooHR', name: 'BambooHR', cat: 'HR', status: 'active', cfg: { subdomain: true, apiKey: true }},
  {id: 'gong', name: 'Gong.io', cat: 'Sales', status: 'active', cfg: { accessKey: true, accessKeySecret: true }},
  {id: 'outreach', name: 'Outreach', cat: 'Sales', status: 'active', cfg: { clientId: true, clientSecret: true }},
  {id: 'salesloft', name: 'SalesLoft', cat: 'Sales', status: 'active', cfg: { apiKey: true }},
  {id: 'apollo', name: 'Apollo.io', cat: 'Sales', status: 'active', cfg: { apiKey: true }},
  {id: 'clearbit', name: 'Clearbit', cat: 'Sales', status: 'active', cfg: { apiKey: true }},
  {id: 'zoominfo', name: 'ZoomInfo', cat: 'Sales', status: 'active', cfg: { username: true, password: true }},
  {id: 'box', name: 'Box', cat: 'Storage', status: 'active', cfg: { clientId: true, clientSecret: true, developerToken: true }},
  {id: 'dropbox', name: 'Dropbox', cat: 'Storage', status: 'active', cfg: { appKey: true, appSecret: true, accessToken: true }},
  {id: 'gitlab', name: 'GitLab', cat: 'DevOps', status: 'active', cfg: { host: true, privateToken: true }},
  {id: 'bitbucket', name: 'Bitbucket', cat: 'DevOps', status: 'active', cfg: { username: true, appPassword: true }},
  {id: 'sonarqube', name: 'SonarQube', cat: 'DevOps', status: 'active', cfg: { host: true, login: true }},
  {id: 'artifactory', name: 'JFrog Artifactory', cat: 'DevOps', status: 'active', cfg: { url: true, apiKey: true }},
];

export default OrgAccessControlMatrix;