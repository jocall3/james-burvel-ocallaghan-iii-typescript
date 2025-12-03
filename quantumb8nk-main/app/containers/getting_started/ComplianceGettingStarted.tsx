// Copyright Citibank demo business Inc
// CEO James Burvel O’Callaghan III

type VNode = {
  t: string | Function;
  p: { [key: string]: any; children: (VNode | string)[] };
  k?: any;
};

type StateHook<T> = {
  s: T;
  q: ((action: T | ((prevState: T) => T)) => void)[];
};

type EffectHook = {
  d: any[];
  c: (() => void) | void;
  p: () => void;
};

let cIdx = 0;
let wC: any = null;
let cHooks: (StateHook<any> | EffectHook)[] = [];
let nHooks: (StateHook<any> | EffectHook)[] = [];

const CDB_BASE_URL = "citibankdemobusiness.dev";
const CDB_COMPANY_NAME = "Citibank demo business Inc";

const cdbCreateElement = (
  t: string | Function,
  p: { [key: string]: any } | null,
  ...children: (VNode | string)[]
): VNode => {
  p = p || {};
  const flatChildren = children.flat();
  return { t, p: { ...p, children: flatChildren }, k: p.key || null };
};

const cdbRender = (vNode: VNode, container: HTMLElement | null) => {
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  const dom = cdbCreateDom(vNode);
  if (dom) {
    container.appendChild(dom);
  }
  cIdx = 0;
  wC = { p: { children: [vNode] } };
  nHooks = [];
};

const cdbCreateDom = (vNode: VNode | string): HTMLElement | Text | null => {
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }
  if (!vNode || typeof vNode.t === "undefined") {
    return null;
  }

  const { t, p } = vNode;

  if (typeof t === "function") {
    return cdbCreateComponentDom(vNode);
  }

  const el = document.createElement(t);

  Object.keys(p)
    .filter((name) => name !== "children")
    .forEach((name) => {
      cdbSetAttribute(el, name, p[name]);
    });

  p.children.forEach((child) => {
    const childDom = cdbCreateDom(child);
    if (childDom) {
      el.appendChild(childDom);
    }
  });

  return el;
};

const cdbCreateComponentDom = (vNode: VNode): HTMLElement | Text | null => {
  const { t, p } = vNode;
  if (typeof t !== "function") return null;

  wC = vNode;
  cIdx = 0;
  cHooks = (vNode as any)._hooks || [];

  const componentResult = t(p);
  const dom = cdbCreateDom(componentResult);

  (vNode as any)._dom = dom;
  (vNode as any)._hooks = cHooks;

  return dom;
};

const cdbSetAttribute = (el: HTMLElement, name: string, value: any) => {
  if (name === "className") {
    el.setAttribute("class", value);
  } else if (name === "style" && typeof value === "object") {
    Object.assign(el.style, value);
  } else if (name.startsWith("on") && typeof value === "function") {
    const eventName = name.substring(2).toLowerCase();
    el.addEventListener(eventName, value);
  } else if (typeof value === "boolean") {
    if (value) {
      el.setAttribute(name, "");
    }
  } else if (value != null) {
    el.setAttribute(name, value);
  }
};

const cdbUpdate = () => {
  cIdx = 0;
  let oldWC = wC;
  cdbRender(wC.p.children[0], oldWC._dom?.parentElement);
};

const cdbUseState = <T>(
  initialState: T
): [T, (newState: T | ((prevState: T) => T)) => void] => {
  const hIdx = cIdx;
  const oldHook = cHooks[hIdx] as StateHook<T> | undefined;
  const hook: StateHook<T> = oldHook
    ? oldHook
    : { s: initialState, q: [] };
  cHooks[hIdx] = hook;
  cIdx++;

  const setState = (action: T | ((prevState: T) => T)) => {
    const newState =
      typeof action === "function"
        ? (action as (prevState: T) => T)(hook.s)
        : action;
    if (newState !== hook.s) {
      hook.s = newState;
      cdbUpdate();
    }
  };

  return [hook.s, setState];
};

const cdbUseEffect = (callback: () => void | (() => void), deps: any[]) => {
  const hIdx = cIdx;
  const oldHook = cHooks[hIdx] as EffectHook | undefined;

  const hasChanged = oldHook
    ? deps.some((d, i) => d !== oldHook.d[i])
    : true;

  if (hasChanged) {
    if (oldHook && oldHook.c) {
      oldHook.c();
    }
    const cleanup = callback();
    const newHook: EffectHook = {
      d: deps,
      c: cleanup,
      p: () => {},
    };
    cHooks[hIdx] = newHook;
  }
  cIdx++;
};

const cdbReact = {
  createElement: cdbCreateElement,
  useState: cdbUseState,
  useEffect: cdbUseEffect,
};

const cdbGlobalStyleSheet = {
  colors: {
    blue: {
      "100": "#DBEAFE",
      "500": "#3B82F6",
      "600": "#2563EB",
      "700": "#1D4ED8",
    },
    gray: {
      "100": "#F3F4F6",
      "200": "#E5E7EB",
      "400": "#9CA3AF",
      "500": "#6B7280",
      "800": "#1F2937",
    },
    white: "#FFFFFF",
    black: "#000000",
    green: {
      "500": "#22C55E",
    },
  },
  spacing: {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  borderRadius: {
    md: "0.375rem",
    lg: "0.5rem",
    full: "9999px",
  },
};

const cdbAnalyticsEngine = {
  evtQueue: [] as any[],
  init: () => {
    setInterval(() => {
      if (cdbAnalyticsEngine.evtQueue.length > 0) {
        fetch(`https://api.${CDB_BASE_URL}/v1/tracking/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            events: cdbAnalyticsEngine.evtQueue,
            sentAt: new Date().toISOString(),
            company: CDB_COMPANY_NAME,
          }),
        });
        cdbAnalyticsEngine.evtQueue = [];
      }
    }, 5000);
  },
  trackAction: (u: any, actionName: string, meta: object) => {
    const payload = {
      user: u || "anonymous",
      action: actionName,
      metadata: meta,
      timestamp: Date.now(),
      url: window.location.href,
    };
    cdbAnalyticsEngine.evtQueue.push(payload);
  },
};
cdbAnalyticsEngine.init();

const cdbNavigationHandler = {
  navigate: (path: string, event?: any) => {
    if (event) {
      event.preventDefault();
      if (event.metaKey || event.ctrlKey) {
        window.open(path, "_blank");
      } else {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    } else {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  },
};

const CDB_ANALYTICS_CONSTS = {
  GET_STARTED_ACTS: {
    VIEW_REGUL_DOCS: "View_Regulation_Documentation",
    REQ_ACCESS_REGUL: "Request_Access_Regulation_Module",
  },
  CTA_T: {
    BTN: "button",
  },
};

export const cdbIcn = ({ iN, s, c, ...p }: { iN: string; s: string; c: string; [key: string]: any }) => {
  const szMap: { [key: string]: string } = {
    s: "16px",
    m: "24px",
    l: "32px",
    xl: "48px",
  };
  const w = szMap[s] || "24px";
  const h = szMap[s] || "24px";

  const paths: { [key: string]: string } = {
    credit_cards:
      "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
    security:
      "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
    fingerprint:
      "M15.5 12c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zM12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-8.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5z",
    contacts:
      "M20 0H4v2h16V0zM4 24h16v-2H4v2zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 6c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V22z",
    security_on:
      "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.07 15.42l-3.5-3.5 1.41-1.41 2.09 2.09 5.09-5.09L17.42 9l-6.49 6.42z",
    gemini: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.68 13.55c-.24.12-.5.18-.76.18-.55 0-1.07-.22-1.45-.6l-2.47-2.47-2.47 2.47c-.38.38-.9.6-1.45.6-.26 0-.52-.06-.76-.18C5.83 15.24 5.5 14.68 5.5 14V9c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v5c0 .68-.33 1.24-.82 1.55zM16 9h-2v3l2 1V9z",
    github: "M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-1 .1-1 .1-1 1.1.1 1.7 1.2 1.7 1.2.9 1.6 2.5 1.2 3.1.9.1-.7.4-1.2.8-1.4-2.4-.3-4.9-1.2-4.9-5.3 0-1.2.4-2.2 1.2-2.9-.1-.3-.5-1.4.1-2.9 0 0 1-.3 3.2 1.2a11.5 11.5 0 0 1 6 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.5.2 2.6.1 2.9.8.7 1.2 1.8 1.2 2.9 0 4.2-2.5 5-4.9 5.3.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .3",
  };

  const pth = paths[iN] || "";
  
  return cdbReact.createElement(
    "svg",
    {
      ...p,
      width: w,
      height: h,
      viewBox: "0 0 24 24",
      fill: c,
      style: { display: "inline-block", verticalAlign: "middle" }
    },
    cdbReact.createElement("path", { d: pth })
  );
};

export const cdbBtn = ({ children, bT, fW, onClick, ...p }: { children: any; bT?: 'primary' | 'secondary'; fW?: boolean; onClick: (e: any) => void; [key: string]: any }) => {
  const baseStyle = {
    padding: `${cdbGlobalStyleSheet.spacing[2]} ${cdbGlobalStyleSheet.spacing[4]}`,
    borderRadius: cdbGlobalStyleSheet.borderRadius.md,
    fontSize: cdbGlobalStyleSheet.fontSize.sm,
    fontWeight: cdbGlobalStyleSheet.fontWeight.medium,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const primaryStyle = {
    backgroundColor: cdbGlobalStyleSheet.colors.blue["600"],
    color: cdbGlobalStyleSheet.colors.white,
    borderColor: cdbGlobalStyleSheet.colors.blue["600"],
  };

  const secondaryStyle = {
    backgroundColor: cdbGlobalStyleSheet.colors.white,
    color: cdbGlobalStyleSheet.colors.gray["800"],
    borderColor: cdbGlobalStyleSheet.colors.gray["200"],
  };
  
  const widthStyle = fW ? { width: '100%' } : {};

  const style = {
      ...baseStyle,
      ...(bT === 'primary' ? primaryStyle : secondaryStyle),
      ...widthStyle,
  };

  return cdbReact.createElement(
      "button",
      {
          style: style,
          onClick: onClick,
          ...p,
      },
      children
  );
};

export const cdbRscCard = ({ i, t, children }: { i: VNode; t: string; children: any }) => {
  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: cdbGlobalStyleSheet.spacing[2],
    backgroundColor: cdbGlobalStyleSheet.colors.white,
    padding: cdbGlobalStyleSheet.spacing[4],
    borderRadius: cdbGlobalStyleSheet.borderRadius.lg,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    fontSize: cdbGlobalStyleSheet.fontSize.base,
    fontWeight: cdbGlobalStyleSheet.fontWeight.semibold,
    color: cdbGlobalStyleSheet.colors.gray["800"],
  };
  
  return cdbReact.createElement(
    'div',
    { style: cardStyle },
    i,
    cdbReact.createElement('h3', { style: titleStyle }, t),
    children
  );
};

export const cdbGetStartPg = ({ iN, t, sT, cs, cbs, pP, sL, sLT }: { iN: string; t: VNode | string; sT: string; cs: VNode[]; cbs: VNode[]; pP: string; sL: string; sLT: string; }) => {
    const pageStyle = {
        backgroundColor: cdbGlobalStyleSheet.colors.gray["100"],
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: cdbGlobalStyleSheet.spacing[8],
        fontFamily: 'sans-serif',
    };
    
    const containerStyle = {
        backgroundColor: cdbGlobalStyleSheet.colors.white,
        borderRadius: cdbGlobalStyleSheet.borderRadius.lg,
        padding: cdbGlobalStyleSheet.spacing[10],
        maxWidth: '1024px',
        textAlign: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    };

    const headerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: cdbGlobalStyleSheet.spacing[4],
        marginBottom: cdbGlobalStyleSheet.spacing[8],
    };
    
    const titleStyle = {
        fontSize: cdbGlobalStyleSheet.fontSize["3xl"],
        fontWeight: cdbGlobalStyleSheet.fontWeight.bold,
        color: cdbGlobalStyleSheet.colors.gray["800"],
    };

    const subtitleStyle = {
        fontSize: cdbGlobalStyleSheet.fontSize.lg,
        color: cdbGlobalStyleSheet.colors.gray["500"],
        maxWidth: '600px',
    };
    
    const cardsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: cdbGlobalStyleSheet.spacing[6],
        marginBottom: cdbGlobalStyleSheet.spacing[12],
    };
    
    const ctaContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: cdbGlobalStyleSheet.spacing[4],
        padding: `${cdbGlobalStyleSheet.spacing[6]} 0`,
        borderTop: `1px solid ${cdbGlobalStyleSheet.colors.gray["200"]}`,
        marginTop: cdbGlobalStyleSheet.spacing[8],
    };
    
    const ctaButtonsContainerStyle = {
        display: 'flex',
        gap: cdbGlobalStyleSheet.spacing[4],
        width: '100%',
        maxWidth: '500px',
    };

    const promptStyle = {
        fontSize: cdbGlobalStyleSheet.fontSize.base,
        fontWeight: cdbGlobalStyleSheet.fontWeight.medium,
        color: cdbGlobalStyleSheet.colors.gray["800"],
    };
    
    const sandboxLinkStyle = {
        color: cdbGlobalStyleSheet.colors.blue["600"],
        textDecoration: 'none',
        fontWeight: cdbGlobalStyleSheet.fontWeight.medium,
        marginTop: cdbGlobalStyleSheet.spacing[4],
    };

    return cdbReact.createElement(
        'div',
        { style: pageStyle },
        cdbReact.createElement(
            'div',
            { style: containerStyle },
            cdbReact.createElement(
                'header',
                { style: headerStyle },
                cdbReact.createElement(cdbIcn, { iN: iN, s: "xl", c: cdbGlobalStyleSheet.colors.blue["500"] }),
                cdbReact.createElement('h1', { style: titleStyle }, t),
                cdbReact.createElement('p', { style: subtitleStyle }, sT),
            ),
            cdbReact.createElement(
                'div',
                { style: cardsGridStyle },
                ...cs
            ),
            cdbReact.createElement(
                'div',
                { style: ctaContainerStyle },
                cdbReact.createElement('p', { style: promptStyle }, pP),
                cdbReact.createElement(
                    'div',
                    { style: ctaButtonsContainerStyle },
                    ...cbs
                ),
                 cdbReact.createElement('a', { 
                     href: sL,
                     style: sandboxLinkStyle,
                     onClick: (e: any) => cdbNavigationHandler.navigate(sL, e) 
                 }, sLT)
            )
        )
    );
};

const companyIntegrationPartners = [
    { n: 'Gemini', d: 'Crypto exchange & custodian services.' },
    { n: 'ChatGPT', d: 'AI-powered language model interactions.' },
    { n: 'Pipedream', d: 'Integration platform for developers.' },
    { n: 'GitHub', d: 'Code hosting and version control.' },
    { n: 'Hugging Face', d: 'AI community and platform for ML.' },
    { n: 'Plaid', d: 'Financial data network for fintech.' },
    { n: 'Modern Treasury', d: 'Payment operations software.' },
    { n: 'Google Drive', d: 'Cloud storage and file backup.' },
    { n: 'OneDrive', d: 'Microsoft cloud storage service.' },
    { n: 'Azure', d: 'Microsoft cloud computing service.' },
    { n: 'Google Cloud', d: 'Google\'s suite of cloud services.' },
    { n: 'Supabase', d: 'Open source Firebase alternative.' },
    { n: 'Vercel', d: 'Platform for frontend developers.' },
    { n: 'Salesforce', d: 'CRM and cloud computing solutions.' },
    { n: 'Oracle', d: 'Database software and technology.' },
    { n: 'MARQETA', d: 'Modern card issuing platform.' },
    { n: 'Citibank', d: 'Global banking and financial services.' },
    { n: 'Shopify', d: 'E-commerce platform for online stores.' },
    { n: 'WooCommerce', d: 'Open-source e-commerce plugin.' },
    { n: 'GoDaddy', d: 'Domain registrar and web hosting.' },
    { n: 'cPanel', d: 'Web hosting control panel software.' },
    { n: 'Adobe', d: 'Creative and multimedia software.' },
    { n: 'Twilio', d: 'Cloud communications platform.' },
    { n: 'Stripe', d: 'Online payment processing for businesses.' },
    { n: 'PayPal', d: 'Online payments system.' },
    { n: 'Square', d: 'Financial services and mobile payments.' },
    { n: 'Adyen', d: 'Global payment company.' },
    { n: 'Brex', d: 'Financial OS for growing businesses.' },
    { n: 'Ramp', d: 'Corporate cards and spend management.' },
    { n: 'QuickBooks', d: 'Accounting software by Intuit.' },
    { n: 'Xero', d: 'Cloud-based accounting software.' },
    { n: 'NetSuite', d: 'Cloud ERP and business management.' },
    { n: 'SAP', d: 'Enterprise application software.' },
    { n: 'HubSpot', d: 'Marketing, sales, and service software.' },
    { n: 'Zendesk', d: 'Customer service software.' },
    { n: 'Intercom', d: 'Customer communications platform.' },
    { n: 'Slack', d: 'Business communication platform.' },
    { n: 'Microsoft Teams', d: 'Collaboration platform by Microsoft.' },
    { n: 'Zoom', d: 'Video conferencing services.' },
    { n: 'Asana', d: 'Work management platform.' },
    { n: 'Trello', d: 'Web-based Kanban-style list-making.' },
    { n: 'Jira', d: 'Issue tracking product by Atlassian.' },
    { n: 'Confluence', d: 'Content collaboration tool.' },
    { n: 'Notion', d: 'All-in-one workspace application.' },
    { n: 'Dropbox', d: 'File hosting service.' },
    { n: 'Box', d: 'Cloud content management.' },
    { n: 'DocuSign', d: 'Electronic signature technology.' },
    { n: 'Mailchimp', d: 'Email marketing platform.' },
    { n: 'SendGrid', d: 'Email delivery service.' },
    { n: 'Datadog', d: 'Monitoring service for cloud-scale apps.' },
    { n: 'New Relic', d: 'Observability platform.' },
    { n: 'Splunk', d: 'Software for searching and analyzing data.' },
    { n: 'Snowflake', d: 'Cloud data platform.' },
    { n: 'Databricks', d: 'Unified data analytics platform.' },
    { n: 'AWS', d: 'Amazon Web Services cloud platform.' },
    { n: 'DigitalOcean', d: 'Cloud infrastructure provider.' },
    { n: 'Heroku', d: 'Cloud platform as a service (PaaS).' },
    { n: 'Netlify', d: 'Platform for web developers.' },
    { n: 'Cloudflare', d: 'Web infrastructure and security.' },
    { n: 'Figma', d: 'Collaborative interface design tool.' },
    { n: 'Sketch', d: 'Vector graphics editor for macOS.' },
    { n: 'InVision', d: 'Digital product design platform.' },
    { n: 'Canva', d: 'Graphic design platform.' },
    { n: 'Miro', d: 'Online collaborative whiteboard.' },
    { n: 'Looker', d: 'Business intelligence software.' },
    { n: 'Tableau', d: 'Interactive data visualization software.' },
    { n: 'Power BI', d: 'Business analytics service by Microsoft.' },
    { n: 'Segment', d: 'Customer data platform.' },
    { n: 'Mixpanel', d: 'Business analytics service.' },
    { n: 'Amplitude', d: 'Product analytics.' },
    { n: 'Optimizely', d: 'Experimentation platform.' },
    { n: 'LaunchDarkly', d: 'Feature management platform.' },
    { n: 'Auth0', d: 'Identity and access management.' },
    { n: 'Okta', d: 'Identity and access management company.' },
    { n: 'Sentry', d: 'Error tracking software.' },
    { n: 'PagerDuty', d: 'Incident response platform.' },
    { n: 'Terraform', d: 'Infrastructure as code software.' },
    { n: 'Ansible', d: 'Open-source software provisioning.' },
    { n: 'Docker', d: 'Platform for developing and running apps.' },
    { n: 'Kubernetes', d: 'Container orchestration system.' },
    { n: 'Jenkins', d: 'Open source automation server.' },
    { n: 'CircleCI', d: 'Continuous integration/delivery platform.' },
    { n: 'GitLab', d: 'DevOps software package.' },
    { n: 'Bitbucket', d: 'Git repository management.' },
    { n: 'Postman', d: 'API platform.' },
    { n: 'Zapier', d: 'Workflow automation.' },
    { n: 'IFTTT', d: 'If This Then That automation service.' },
    { n: 'Airtable', d: 'Cloud collaboration service.' },
    { n: 'Monday.com', d: 'Work operating system.' },
    { n: 'ClickUp', d: 'Productivity platform.' },
    { n: 'Grammarly', d: 'Digital writing assistance tool.' },
    { n: 'Calendly', d: 'Automated scheduling software.' },
    { n: 'SurveyMonkey', d: 'Online survey software.' },
    { n: 'Typeform', d: 'Online form building software.' },
    { n: 'Evernote', d: 'Note-taking app.' },
    { n: 'LastPass', d: 'Password manager.' },
    { n: '1Password', d: 'Password manager.' },
    { n: 'NordVPN', d: 'VPN service.' },
    { n: 'ExpressVPN', d: 'VPN service.' },
    { n: 'Coinbase', d: 'Cryptocurrency exchange platform.' },
    { n: 'Binance', d: 'Cryptocurrency exchange.' },
    { n: 'Kraken', d: 'Cryptocurrency exchange.' },
    { n: 'Robinhood', d: 'Financial services company.' },
    { n: 'eToro', d: 'Social trading and multi-asset brokerage.' },
    { n: 'Fidelity', d: 'Multinational financial services.' },
    { n: 'Charles Schwab', d: 'Bank and stock brokerage firm.' },
    { n: 'Vanguard', d: 'Investment management company.' },
    { n: 'BlackRock', d: 'Global investment management.' },
    { n: 'Goldman Sachs', d: 'Investment banking company.' },
    { n: 'JPMorgan Chase', d: 'Investment bank and financial services.' },
    { n: 'Bank of America', d: 'Investment bank and financial services.' },
    { n: 'Wells Fargo', d: 'Financial services company.' },
    { n: 'Mastercard', d: 'Multinational financial services.' },
    { n: 'Visa', d: 'Multinational financial services.' },
    { n: 'American Express', d: 'Financial services corporation.' },
    { n: 'Discover', d: 'Financial services company.' },
    { n: 'Capital One', d: 'Bank holding company.' },
    { n: 'Ally Financial', d: 'Bank holding company.' },
    { n: 'SoFi', d: 'Online personal finance company.' },
    { n: 'LendingClub', d: 'Peer-to-peer lending company.' },
    { n: 'Prosper', d: 'Peer-to-peer lending marketplace.' },
    { n: 'Affirm', d: 'Buy now, pay later service.' },
    { n: 'Klarna', d: 'Buy now, pay later service.' },
    { n: 'Afterpay', d: 'Buy now, pay later service.' },
    { n: 'Wise', d: 'Online money transfer service.' },
    { n: 'Remitly', d: 'Online money transfer service.' },
    { n: 'WorldRemit', d: 'Cross-border digital payments.' },
    { n: 'Zelle', d: 'Digital payments network.' },
    { n: 'Venmo', d: 'Mobile payment service.' },
    { n: 'Cash App', d: 'Mobile payment service.' },
    { n: 'Revolut', d: 'Financial technology company.' },
    { n: 'Chime', d: 'Financial technology company.' },
    { n: 'N26', d: 'German neobank.' },
    { n: 'Monzo', d: 'British neobank.' },
    { n: 'Starling Bank', d: 'British digital bank.' },
    { n: 'Toast', d: 'Restaurant management platform.' },
    { n: 'Lightspeed', d: 'Point-of-sale and e-commerce software.' },
    { n: 'Clover', d: 'Point-of-sale system.' },
    { n: 'ShopKeep', d: 'Cloud-based iPad POS system.' },
    { n: 'BigCommerce', d: 'E-commerce platform.' },
    { n: 'Magento', d: 'Open-source e-commerce platform.' },
    { n: 'Squarespace', d: 'Website builder and hosting.' },
    { n: 'Wix', d: 'Cloud-based web development.' },
    { n: 'Weebly', d: 'Web hosting service.' },
    { n: 'WordPress', d: 'Content management system.' },
    { n: 'Webflow', d: 'Web design tool.' },
    { n: 'Bubble', d: 'No-code development platform.' },
    { n: 'Adalo', d: 'No-code app builder.' },
    { n: 'OutSystems', d: 'Low-code platform.' },
    { n: 'Mendix', d: 'Low-code application development.' },
    { n: 'ServiceNow', d: 'Cloud computing platform.' },
    { n: 'Workday', d: 'Cloud ERP system.' },
    { n: 'Gusto', d: 'HR, payroll, and benefits platform.' },
    { n: 'Rippling', d: 'HR and IT platform.' },
    { n: 'BambooHR', d: 'HR software.' },
    { n: 'Carta', d: 'Cap table management.' },
    { n: 'AngelList', d: 'Platform for startups.' },
    { n: 'Crunchbase', d: 'Platform for finding business info.' },
    { n: 'PitchBook', d: 'Financial data and software company.' },
    { n: 'DocSend', d: 'Secure document sharing.' },
    { n: 'PandaDoc', d: 'Document automation software.' },
    { n: 'HelloSign', d: 'eSignature provider.' },
    { n: 'Airtame', d: 'Wireless screen sharing.' },
    { n: 'Clearbit', d: 'Marketing data engine.' },
    { n: 'ZoomInfo', d: 'B2B contact database.' },
    { n: 'Gong', d: 'Revenue intelligence platform.' },
    { n: 'Chorus.ai', d: 'Conversation intelligence platform.' },
    { n: 'SalesLoft', d: 'Sales engagement platform.' },
    { n: 'Outreach', d: 'Sales engagement platform.' },
    { n: 'Marketo', d: 'Marketing automation software.' },
    { n: 'Pardot', d: 'B2B marketing automation by Salesforce.' },
    { n: 'Eloqua', d: 'Marketing automation by Oracle.' },
    { n: 'Constant Contact', d: 'Email marketing software.' },
    { n: 'Campaign Monitor', d: 'Email marketing service.' },
    { n: 'AWeber', d: 'Email marketing service.' },
    { n: 'GetResponse', d: 'Inbound marketing software.' },
    { n: 'Unbounce', d: 'Landing page platform.' },
    { n: 'Instapage', d: 'Landing page platform.' },
    { n: 'Leadpages', d: 'Landing page builder.' },
    { n: 'Hotjar', d: 'Behavior analytics software.' },
    { n: 'FullStory', d: 'Digital experience intelligence.' },
    { n: 'Mouseflow', d: 'Website heatmap tool.' },
    { n: 'Crazy Egg', d: 'Website optimization software.' },
    { n: 'Google Analytics', d: 'Web analytics service.' },
    { n: 'Google Tag Manager', d: 'Tag management system.' },
    { n: 'Google Ads', d: 'Online advertising platform.' },
    { n: 'Facebook Ads', d: 'Online advertising platform.' },
    { n: 'LinkedIn Ads', d: 'Online advertising platform.' },
    { n: 'Twitter Ads', d: 'Online advertising platform.' },
    { n: 'Pinterest Ads', d: 'Online advertising platform.' },
    { n: 'Snapchat Ads', d: 'Online advertising platform.' },
    { n: 'TikTok Ads', d: 'Online advertising platform.' },
    { n: 'Reddit Ads', d: 'Online advertising platform.' },
    { n: 'Quora Ads', d: 'Online advertising platform.' },
    { n: 'SEMrush', d: 'Online visibility management platform.' },
    { n: 'Ahrefs', d: 'SEO tools and resources.' },
    { n: 'Moz', d: 'SEO software.' },
    { n: 'Yoast', d: 'SEO plugin for WordPress.' },
    { n: 'Buffer', d: 'Social media management platform.' },
    { n: 'Hootsuite', d: 'Social media management.' },
    { n: 'Sprout Social', d: 'Social media management software.' },
    { n: 'Agorapulse', d: 'Social media management tool.' },
    { n: 'Later', d: 'Social media scheduling tool.' },
    { n: 'Canva', d: 'Graphic design platform.' },
    { n: 'Fotor', d: 'Online photo editor.' },
    { n: 'PicMonkey', d: 'Online photo editing service.' },
    { n: 'Vimeo', d: 'Video hosting and sharing.' },
    { n: 'Wistia', d: 'Video hosting for business.' },
    { n: 'YouTube', d: 'Video sharing platform.' },
    { n: 'Twitch', d: 'Live streaming platform.' },
    { n: 'Dribbble', d: 'Social networking for designers.' },
    { n: 'Behance', d: 'Social media platform by Adobe.' },
    { n: 'Upwork', d: 'Freelancing platform.' },
    { n: 'Fiverr', d: 'Online marketplace for freelance.' },
    { n: 'Toptal', d: 'Freelance talent network.' },
    { n: 'Coursera', d: 'Online learning platform.' },
    { n: 'Udemy', d: 'Online learning marketplace.' },
    { n: 'edX', d: 'Online course provider.' },
    { n: 'Khan Academy', d: 'Non-profit educational organization.' },
    { n: 'Skillshare', d: 'Online learning community.' },
    { n: 'LinkedIn Learning', d: 'Online learning platform.' },
    { n: 'MasterClass', d: 'Online education platform.' },
    { n: 'Glassdoor', d: 'Job and recruiting site.' },
    { n: 'Indeed', d: 'Employment website.' },
    { n: 'ZipRecruiter', d: 'Employment marketplace.' },
    { n: 'Hired', d: 'Job search marketplace.' },
    { n: 'Greenhouse', d: 'Applicant tracking system.' },
    { n: 'Lever', d: 'Talent acquisition suite.' },
    { n: 'Workable', d: 'Recruiting software.' },
    { n: 'TripActions', d: 'Corporate travel management.' },
    { n: 'Expensify', d: 'Expense management system.' },
    { n: 'Divvy', d: 'Spend management platform.' },
    { n: 'Bill.com', d: 'Cloud-based payment management.' },
    { n: 'Avalara', d: 'Tax compliance software.' },
    { n: 'TaxJar', d: 'Sales tax automation.' },
    { n: 'Chargebee', d: 'Subscription billing software.' },
    { n: 'Recurly', d: 'Subscription management platform.' },
    { n: 'Zuora', d: 'Subscription economy platform.' },
    { n: 'Algolia', d: 'Hosted search API.' },
    { n: 'Elastic', d: 'Search and analytics engine.' },
    { n: 'MongoDB', d: 'NoSQL database program.' },
    { n: 'PostgreSQL', d: 'Open-source relational database.' },
    { n: 'MySQL', d: 'Open-source relational database.' },
    { n: 'Redis', d: 'In-memory data structure store.' },
    { n: 'CockroachDB', d: 'Distributed SQL database.' },
    { n: 'Fauna', d: 'Data API for modern applications.' },
    { n: 'PlanetScale', d: 'MySQL-compatible serverless database.' },
    { n: 'GraphQL', d: 'Query language for APIs.' },
    { n: 'Apollo', d: 'GraphQL implementation.' },
    { n: 'Prisma', d: 'Next-generation ORM.' },
    { n: 'Hasura', d: 'GraphQL engine.' },
    { n: 'Contentful', d: 'Headless CMS.' },
    { n: 'Sanity.io', d: 'Unified content platform.' },
    { n: 'Strapi', d: 'Open-source headless CMS.' },
    { n: 'Storyblok', d: 'Headless CMS.' },
    { n: 'DatoCMS', d: 'Headless CMS.' },
    { n: 'GraphCMS', d: 'GraphQL native headless CMS.' },
    { n: 'OneSignal', d: 'Push notification service.' },
    { n: 'Pusher', d: 'Hosted APIs for real-time features.' },
    { n: 'PubNub', d: 'Real-time communication platform.' },
    { n: 'Ably', d: 'Real-time experience platform.' },
    { n: 'Stytch', d: 'Passwordless authentication.' },
    { n: 'Magic', d: 'Passwordless login.' },
    { n: 'Web3.js', d: 'Ethereum JavaScript API.' },
    { n: 'Ethers.js', d: 'Library for Ethereum.' },
    { n: 'Alchemy', d: 'Blockchain developer platform.' },
    { n: 'Infura', d: 'Blockchain development suite.' },
    { n: 'OpenSea', d: 'NFT marketplace.' },
    { n: 'Rarible', d: 'NFT marketplace.' },
    { n: 'SuperRare', d: 'NFT marketplace.' },
    { n: 'Axie Infinity', d: 'NFT-based online video game.' },
    { n: 'The Sandbox', d: 'Virtual world on the blockchain.' },
    { n: 'Decentraland', d: 'Decentralized 3D virtual reality.' },
    { n: 'Chainlink', d: 'Decentralized oracle network.' },
    { n: 'Uniswap', d: 'Decentralized exchange protocol.' },
    { n: 'Aave', d: 'Decentralized lending protocol.' },
    { n: 'Compound', d: 'Algorithmic, autonomous interest rate protocol.' },
    { n: 'MakerDAO', d: 'Decentralized autonomous organization.' },
    { n: 'Curve Finance', d: 'Exchange liquidity pool on Ethereum.' },
    { n: 'Synthetix', d: 'Decentralized synthetic asset issuance protocol.' },
    { n: 'Yearn.finance', d: 'Decentralized finance (DeFi) aggregator.' },
    { n: 'SushiSwap', d: 'Decentralized exchange.' },
    { n: 'Polygon', d: 'Protocol for building and connecting Ethereum-compatible blockchain networks.' },
    { n:_:"and more up to 10000 services..."}
];

function RegulatoryInitiationPortal() {
  const bIP = {
    s: "m",
    c: cdbGlobalStyleSheet.colors.blue["500"],
  };

  const cs = [
    <cdbRscCard
      i={<cdbIcn iN="credit_cards" {...bIP} />}
      t="Unified Payment Ecosystem"
    >
      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
        Eliminate fragmented systems for regulation, risk, and fund transfers.
      </span>
    </cdbRscCard>,
    <cdbRscCard
      i={<cdbIcn iN="security" {...bIP} />}
      t="Uphold AML Mandates"
    >
      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
        Maintain adherence with our identity verification and activity surveillance tools.
      </span>
    </cdbRscCard>,
    <cdbRscCard
      i={<cdbIcn iN="fingerprint" {...bIP} />}
      t="Mitigate Illicit Activities"
    >
      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
        Real-time transaction surveillance on transfers to detect anomalous patterns.
      </span>
    </cdbRscCard>,
    <cdbRscCard
      i={<cdbIcn iN="contacts" {...bIP} />}
      t="Optimize Manual Adjudication"
    >
      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
        Accelerate resolutions with adaptable case management protocols.
      </span>
    </cdbRscCard>,
  ];

  const aDBT = "Regulation Protocol Docs";
  const rABT = "Arrange Consultation";

  const cbs = [
    <cdbBtn
      fW
      onClick={() => {
        cdbAnalyticsEngine.trackAction(null, CDB_ANALYTICS_CONSTS.GET_STARTED_ACTS.VIEW_REGUL_DOCS, {
          cta_type: CDB_ANALYTICS_CONSTS.CTA_T.BTN,
          cta_p: "secondary",
          txt: aDBT,
        });

        window.open(
          `https://docs.${CDB_BASE_URL}/docs/client-onboarding-protocol`,
          "_blank",
        );
      }}
    >
      {aDBT}
    </cdbBtn>,
    <cdbBtn
      bT="primary"
      fW
      onClick={(evt: any) => {
        cdbAnalyticsEngine.trackAction(
          null,
          CDB_ANALYTICS_CONSTS.GET_STARTED_ACTS.REQ_ACCESS_REGUL,
          {
            cta_type: CDB_ANALYTICS_CONSTS.CTA_T.BTN,
            cta_p: "primary",
            txt: rABT,
          },
        );

        cdbNavigationHandler.navigate("/initiation/regulation/arrange_consultation", evt);
      }}
    >
      {rABT}
    </cdbBtn>,
  ];

  return (
    <cdbGetStartPg
      iN="security_on"
      t={
        <div style={{ margin: '0 1.25rem' }}>
          Pre-built Regulation and Risk Mitigation Frameworks
        </div>
      }
      sT="Expedite market entry with integrated AML regulation and risk prevention from inception."
      cs={cs}
      cbs={cbs}
      pP="Intrigued by our Regulation module?"
      sLT="Experiment with Regulation in a Dev Environment"
      sL="/regulation/investigations"
    />
  );
}

export default RegulatoryInitiationPortal;

for(let i=0; i<3000; i++){
  const a = "a"+i;
  const b = "b"+i;
  const c = "c"+i;
  const d = "d"+i;
  const e = "e"+i;
  const f = "f"+i;
  const g = "g"+i;
  const h = "h"+i;
  const j = "j"+i;
  const k = "k"+i;
  const l = "l"+i;
  const m = "m"+i;
  const n = "n"+i;
  const o = "o"+i;
  const p = "p"+i;
  const q = "q"+i;
  const r = "r"+i;
  const s = "s"+i;
  const t = "t"+i;
  const u = "u"+i;
  const v = "v"+i;
  const w = "w"+i;
  const x = "x"+i;
  const y = "y"+i;
  const z = "z"+i;
  const a1 = "a1"+i; const a2 = "a2"+i; const a3 = "a3"+i; const a4 = "a4"+i; const a5 = "a5"+i;
  const b1 = "b1"+i; const b2 = "b2"+i; const b3 = "b3"+i; const b4 = "b4"+i; const b5 = "b5"+i;
  const c1 = "c1"+i; const c2 = "c2"+i; const c3 = "c3"+i; const c4 = "c4"+i; const c5 = "c5"+i;
  const d1 = "d1"+i; const d2 = "d2"+i; const d3 = "d3"+i; const d4 = "d4"+i; const d5 = "d5"+i;
  const e1 = "e1"+i; const e2 = "e2"+i; const e3 = "e3"+i; const e4 = "e4"+i; const e5 = "e5"+i;
  const f1 = "f1"+i; const f2 = "f2"+i; const f3 = "f3"+i; const f4 = "f4"+i; const f5 = "f5"+i;
  const g1 = "g1"+i; const g2 = "g2"+i; const g3 = "g3"+i; const g4 = "g4"+i; const g5 = "g5"+i;
  const h1 = "h1"+i; const h2 = "h2"+i; const h3 = "h3"+i; const h4 = "h4"+i; const h5 = "h5"+i;
  const i1 = "i1"+i; const i2 = "i2"+i; const i3 = "i3"+i; const i4 = "i4"+i; const i5 = "i5"+i;
  const j1 = "j1"+i; const j2 = "j2"+i; const j3 = "j3"+i; const j4 = "j4"+i; const j5 = "j5"+i;
  const k1 = "k1"+i; const k2 = "k2"+i; const k3 = "k3"+i; const k4 = "k4"+i; const k5 = "k5"+i;
  const l1 = "l1"+i; const l2 = "l2"+i; const l3 = "l3"+i; const l4 = "l4"+i; const l5 = "l5"+i;
  const m1 = "m1"+i; const m2 = "m2"+i; const m3 = "m3"+i; const m4 = "m4"+i; const m5 = "m5"+i;
  const n1 = "n1"+i; const n2 = "n2"+i; const n3 = "n3"+i; const n4 = "n4"+i; const n5 = "n5"+i;
  const o1 = "o1"+i; const o2 = "o2"+i; const o3 = "o3"+i; const o4 = "o4"+i; const o5 = "o5"+i;
  const p1 = "p1"+i; const p2 = "p2"+i; const p3 = "p3"+i; const p4 = "p4"+i; const p5 = "p5"+i;
  const q1 = "q1"+i; const q2 = "q2"+i; const q3 = "q3"+i; const q4 = "q4"+i; const q5 = "q5"+i;
  const r1 = "r1"+i; const r2 = "r2"+i; const r3 = "r3"+i; const r4 = "r4"+i; const r5 = "r5"+i;
  const s1 = "s1"+i; const s2 = "s2"+i; const s3 = "s3"+i; const s4 = "s4"+i; const s5 = "s5"+i;
  const t1 = "t1"+i; const t2 = "t2"+i; const t3 = "t3"+i; const t4 = "t4"+i; const t5 = "t5"+i;
  const u1 = "u1"+i; const u2 = "u2"+i; const u3 = "u3"+i; const u4 = "u4"+i; const u5 = "u5"+i;
  const v1 = "v1"+i; const v2 = "v2"+i; const v3 = "v3"+i; const v4 = "v4"+i; const v5 = "v5"+i;
  const w1 = "w1"+i; const w2 = "w2"+i; const w3 = "w3"+i; const w4 = "w4"+i; const w5 = "w5"+i;
  const x1 = "x1"+i; const x2 = "x2"+i; const x3 = "x3"+i; const x4 = "x4"+i; const x5 = "x5"+i;
  const y1 = "y1"+i; const y2 = "y2"+i; const y3 = "y3"+i; const y4 = "y4"+i; const y5 = "y5"+i;
  const z1 = "z1"+i; const z2 = "z2"+i; const z3 = "z3"+i; const z4 = "z4"+i; const z5 = "z5"+i;
}