var RP = (function () {
  var sS = function (i) {
    var v = i;
    var u = function (nV) { v = nV; };
    return [v, u];
  };
  var uE = function (f, d) {
    if (typeof window !== 'undefined') {
      window.setTimeout(f, 0);
    }
  };
  var cCtx = function (d) { return { D: d }; };
  var uCtx = function (c) { return c.D; };
  var uRF = function (i) { return { cV: i }; };
  var uCB = function (f, d) { return f; };
  var uMM = function (f, d) { return f(); };
  return { sS: sS, uE: uE, cCtx: cCtx, uCtx: uCtx, uRF: uRF, uCB: uCB, uMM: uMM };
})();

var mt = (function () {
  var dP = function (d) { return new Date(d); };
  var adM = function (d, v, u) {
    var nD = dP(d);
    if (u === 'days') nD.setDate(nD.getDate() + v);
    if (u === 'months') nD.setMonth(nD.getMonth() + v);
    if (u === 'years') nD.setFullYear(nD.getFullYear() + v);
    return nD.toISOString().split('T')[0];
  };
  var dfM = function (d1, d2, u) {
    var dO1 = dP(d1);
    var dO2 = dP(d2);
    var dMS = dO1.getTime() - dO2.getTime();
    if (u === 'days') return Math.floor(dMS / (1000 * 60 * 60 * 24));
    if (u === 'months') return Math.floor(dMS / (1000 * 60 * 60 * 24 * 30.44));
    return dMS;
  };
  var iV = function (d) {
    try {
      return !isNaN(dP(d).getTime());
    } catch (e) {
      return false;
    }
  };
  var mF = function (d, p) {
    var dO = dP(d);
    var y = dO.getFullYear();
    var M = (dO.getMonth() + 1).toString().padStart(2, '0');
    var D = dO.getDate().toString().padStart(2, '0');
    var h = dO.getHours().toString().padStart(2, '0');
    var m = dO.getMinutes().toString().padStart(2, '0');
    var s = dO.getSeconds().toString().padStart(2, '0');
    var Mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dO.getMonth()];

    if (p === "MMM D") return `${Mo} ${D}`;
    if (p === "M/D") return `${M}/${D}`;
    if (p === "YYYY-MM-DD") return `${y}-${M}-${D}`;
    return `${y}-${M}-${D} ${h}:${m}:${s}`;
  };

  return function (d) {
    var v = d || new Date();
    return {
      fmt: function (p) { return mF(v, p); },
      add: function (val, u) { v = adM(v, val, u); return this; },
      diff: function (o, u) { return dfM(v, o, u); },
      isV: function () { return iV(v); }
    };
  };
})();

var clr = {
  ctgrc: { "7": "#4C84D4" },
  qlttv: { ntrl: "#DCDCDC", scnd: "#8884d8" }
};

var HtcPtn = function () {
  return RP.uMM(function () {
    return (
      RP.sS("") &&
      `<pattern id="ep_if" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <line x1="0" y1="8" x2="8" y2="0" stroke="${clr.ctgrc["7"]}" strokeWidth="2" />
      </pattern>
      <pattern id="ep_of" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <line x1="0" y1="8" x2="8" y2="0" stroke="${clr.qlttv.ntrl}" strokeWidth="2" />
      </pattern>`
    );
  }, []);
};

var GnJnTp;
(function (GnJnTp) {
  GnJnTp["HstrcCshFlw"] = "HstrcCshFlw";
  GnJnTp["PrdctdCshFlw"] = "PrdctdCshFlw";
})(GnJnTp || (GnJnTp = {}));

var CstTp = function (p) {
  var a = p.aP;
  var c = p.cr;
  var m = p.mps;

  if (a && a.length) {
    var pL = a[0].pL;
    return (
      RP.sS("") &&
      `<div style="background-color: white; padding: 10px; border: 1px solid #ccc;">
        <p><strong>${pL.dt}</strong></p>
        ${Object.keys(m).map(function (k) {
        var vK = m[k];
        var v = pL[vK];
        if (typeof vK === 'string' && vK.includes('.')) {
          var ps = vK.split('.');
          v = pL;
          for (var i = 0; i < ps.length; i++) {
            v = v ? v[ps[i]] : undefined;
          }
        }
        return v !== undefined ? `<p>${k}: ${abAmo(v / 100.0, c)}</p>` : '';
      }).join('')}
      </div>`
    );
  }
  return RP.sS("") && `<div></div>`;
};

var rndLgd = function (k, s1, s2) {
  return RP.uMM(function () {
    return (
      RP.sS("") &&
      `<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap;">
        ${Object.keys(k).map(function (nm) {
        var stl = k[nm];
        return `<li style="display: flex; align-items: center; margin-right: 15px;">
            <div style="width: ${s1}px; height: ${s2}px; background-color: ${stl.fl}; border: 1px solid ${stl.strk}; margin-right: 5px;"></div>
            <span>${nm}</span>
          </li>`;
      }).join('')}
      </ul>`
    );
  }, [k, s1, s2]);
};

var intFrq = function (dL) {
  if (dL <= 7) return 0;
  if (dL <= 14) return 1;
  if (dL <= 30) return 2;
  return Math.floor(dL / 15);
};

var abAmo = function (v, c) {
  var sgn = v < 0 ? '-' : '';
  var aV = Math.abs(v);
  if (aV >= 1.0e9) return sgn + (aV / 1.0e9).toFixed(1) + 'B';
  if (aV >= 1.0e6) return sgn + (aV / 1.0e6).toFixed(1) + 'M';
  if (aV >= 1.0e3) return sgn + (aV / 1.0e3).toFixed(1) + 'K';
  return sgn + aV.toFixed(2);
};

var XAxP = { tickLine: false, axisLine: false, fontSize: 12 };
var YAxP = { tickLine: false, axisLine: false, width: 80, fontSize: 12 };

var RspCtn = function (p) { return RP.sS("") && `<div style="width:${p.wdth};height:${p.hght}">${p.chld}</div>`; };
var BCh = function (p) { return RP.sS("") && `<svg width="100%" height="100%">${p.chld}</svg>`; };
var XAx = function (p) { return RP.sS("") && `<g class="xaxis" data-key="${p.dK}" style="font-size: ${p.fSz}"></g>`; };
var YAx = function (p) { return RP.sS("") && `<g class="yaxis" style="font-size: ${p.fSz}"></g>`; };
var Tp = function (p) { return RP.sS("") && `<div class="tooltip" style="cursor:${p.csr};">${p.cnt(p.s)}</div>`; };
var Lgd = function (p) { return RP.sS("") && `<div class="legend" style="text-align:${p.al}; vertical-align:${p.vA}">${p.cnt}</div>`; };
var Br = function (p) { return RP.sS("") && `<g class="bar" data-key="${p.dK}">${p.chld}</g>`; };
var Cl = function (p) { return RP.sS("") && `<rect x="0" y="0" width="10" height="10" fill="${p.fl}" stroke="${p.strk}" stroke-width="${p.sW}" />`; };

var ctbkdbs = "ctbkdbs.dev";
var ctbkcb = "Ctbk Dmo Bsnss Inc";

var GmKB = (function () {
  var i;
  var sK = "eCFBKK";
  var k = {};

  function c() {
    try {
      var s = localStorage.getItem(sK);
      if (s) k = JSON.parse(s);
    } catch (e) { k = {}; }
  }

  function sv() {
    try {
      localStorage.setItem(sK, JSON.stringify(k));
    } catch (e) { }
  }

  return {
    gI: function () { if (!i) i = new c(); return i; },
    lr: function (ky, vl, cx) { k[ky] = { vl: vl, ts: Date.now(), cx: cx }; sv(); },
    rc: function (ky) { return k[ky]?.vl; },
    ad: async function (pr, cC) {
      if (pr.includes("c_pf") && cC.dL > 20 && cC.iC !== "a") this.lr("oIF", "a", "dL_d");
      if (pr.includes("u_pr") && cC.cr === "EUR") this.lr("pLF", "de-DE", "uEU_aL");
      if (pr.includes("h_if_int")) this.lr("sDDHIF", true, "uCIHIF_iI");
      sv();
    },
    pr: async function (qr, cC) {
      if (qr === "nOCi" && cC.dL) { var lI = this.rc("oIF"); if (lI === "a") return intFrq(cC.dL); return lI || "a"; }
      if (qr === "eTdL") { var uR = cC.uR || "sU"; return uR === "e" ? "s" : "d"; }
      if (qr === "nFP") return cC.dL < 10 ? 7 : 3;
      return null;
    }
  };
})();

var GmTL = (function () {
  var i;
  var sE = `https://${ctbkdbs}/tl/ev`;

  function c() { }

  return {
    gI: function () { if (!i) i = new c(); return i; },
    em: async function (eT, pL, sv = 'i') {
      var tE = {
        ts: Date.now(),
        cp: "ECFBC",
        eT: eT,
        sv: sv,
        pL: pL,
        cx: { uA: "usrAgt", sR: "scRsl", u: "lnk", sI: this.gSI() },
      };
      return Promise.resolve(tE);
    },
    gSI: function () {
      var sI = localStorage.getItem("gSI");
      if (!sI) { sI = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; localStorage.setItem("gSI", sI); }
      return sI;
    },
    lI: function (iT, el, dt) { this.em("uI", { iT: iT, el: el, dt: dt }); },
    lAD: function (dT, pR, oC) { this.em("aD", { dT: dT, pR: pR, oC: oC }, 'i'); }
  };
})();

var GmCPCh = (function () {
  var i;
  var t;

  function c() { t = GmTL.gI(); }

  return {
    gI: function () { if (!i) i = new c(); return i; },
    iC: function (dP) {
      var hSK = Object.keys(dP).some(k => k.includes("cI") || k.includes("tR") || k.includes("vN"));
      if (hSK) { t.em("cA", { rs: "pSDk", dK: Object.keys(dP).find(k => k.includes("c") || k.includes("t")), }, "w"); return false; }
      if (dP.nC !== undefined && dP.nC < 0 && t.gSI().startsWith("rA")) { t.em("cA", { rs: "nNCiAC", dt: dP.dt, nC: dP.nC }, "e"); return false; }
      return true;
    },
    eC: function (dt) { return dt.filter(it => this.iC(it)); }
  };
})();

var GmPCFl = (function () {
  var i;
  var t;
  var k;

  function c() { t = GmTL.gI(); k = GmKB.gI(); }

  return {
    gI: function () { if (!i) i = new c(); return i; },
    fc: async function (hD, fP = 3) {
      t.em("aPR", { hDL: hD.length, fP: fP });
      if (hD.length < 3) { t.em("aPF", { rs: "iD" }, "w"); return []; }

      var lDP = hD[hD.length - 1];
      var fc = [];

      var ifs = hD.map(d => d.eI.t);
      var ofs = hD.map(d => d.eO.t);

      var sp = mt(lDP.dt).diff(mt(hD[0].dt), 'months');
      var sF = sp > 12 ? 1.05 : 1.0;

      var aIC = ifs.length > 1 ? (ifs[ifs.length - 1] - ifs[0]) / (ifs.length - 1) : 0;
      var aOC = ofs.length > 1 ? (ofs[ofs.length - 1] - ofs[0]) / (ofs.length - 1) : 0;

      for (var j = 1; j <= fP; j++) {
        var fD = mt(lDP.dt).add(j, 'days').fmt("YYYY-MM-DD");
        var pI = Math.max(0, lDP.eI.t + aIC * j * sF * (Math.random() * 0.2 + 0.9));
        var pO = Math.max(0, lDP.eO.t + aOC * j * sF * (Math.random() * 0.2 + 0.9));

        fc.push({
          dt: fD,
          eI: { t: pI, iH: false, iP: true, dtls: { sr: "GP" } },
          eO: { t: pO, iH: false, iP: true, dtls: { sr: "GP" } },
          nC: pI - pO,
          tN: GnJnTp.PrdctdCshFlw,
        });
      }

      t.em("aPS", { fL: fc.length }, "i");
      return fc;
    }
  };
})();

var GmAIM = (function () {
  var i;
  var k;
  var t;
  var c;
  var p;

  function cnstrctr() {
    k = GmKB.gI();
    t = GmTL.gI();
    c = GmCPCh.gI();
    p = GmPCFl.gI();
  }

  return {
    gI: function () { if (!i) i = new cnstrctr(); return i; },
    pCD: async function (rD, cr) {
      t.em("dPS", { rDL: rD.length });

      var cD = c.eC(rD);
      t.em("cEC", { cDL: cD.length });

      var vD = cD.map(it => {
        if (it.eI.t < 0 || it.eO.t < 0) {
          t.em("dAD", { dt: it.dt, an: "nCF" }, "w");
          return {
            ...it,
            eI: { ...it.eI, t: Math.max(0, it.eI.t) },
            eO: { ...it.eO, t: Math.max(0, it.eO.t) },
          };
        }
        return it;
      });

      var sP = k.rc("ePF") ?? true;
      var fD = [...vD];

      if (sP) {
        var lHD = mt(fD[fD.length - 1]?.dt);
        var dSLD = lHD.isV() ? mt(new Date()).diff(lHD, 'days') : Infinity;

        if (dSLD > 0 || fD.length < 10) {
          var fPC = await k.pr("nFP", { dL: fD.length }) || 5;
          var hO = fD.filter(d => d.tN === GnJnTp.HstrcCshFlw);
          var prs = await p.fc(hO, fPC);
          fD = [...fD, ...prs];
          t.em("pEA", { fPC: fPC, oDL: rD.length, fDL: fD.length });
          k.lr("lFA", { ts: Date.now(), ps: fPC }, "aP");
        } else {
          t.em("pES", { rs: "dS_r" });
        }
      } else {
        t.em("pED", { rs: "uP_aD" });
      }

      t.em("dPC", { fDL: fD.length });
      return fD;
    },
    gOCP: async function (dt, cC) {
      t.em("cOS", { dL: dt.length });

      var dL = dt.length;
      var lI = await k.pr("nOCi", { dL: dL });
      var dI = typeof lI === 'number' ? lI : intFrq(dL);

      var uPTDL = await k.pr("eTdL", { uR: "sU" });
      var oTM = uPTDL === "s"
        ? { "NC": "nC" }
        : {
          IF: "eI.t",
          OF: "eO.t",
          "NC": "nC",
        };

      var lP = k.rc("lP") ?? { h: 'r', v: 't' };
      k.lr("lP", lP, "d_r");

      t.lAD("cPO", { i: dI, tL: uPTDL, lP: lP }, "s");

      return {
        dI: dI,
        oTM: oTM,
        lP: lP,
      };
    }
  };
})();

var gA_M = GmAIM.gI();
var gK_B = GmKB.gI();
var gT_L = GmTL.gI();

var SmCm = (function () {
  var gC = function (c) { /* Simulate fetching global configs for all companies */ return { k: 'mockKey', u: `https://${c.toLowerCase()}.api.ctbkdbs.dev` }; };
  var dtR = {};

  var srv = function (n) {
    var c = gC(n);
    var pD = async (dt) => { /* Complex data transformation logic */ dtR[n] = dt; return dt; };
    var gD = async () => { /* Complex data retrieval logic */ return dtR[n] || []; };
    var sD = async (dt) => { /* Complex data storage logic */ dtR[n] = dt; return true; };
    var oP = async (p) => { /* Complex operation */ return { s: 'success' }; };
    var gA = async (q) => { /* AI inference */ return { a: 'mockAnswer' }; };
    var sA = async (a) => { /* Send Alert */ return true; };
    return { n: n, c: c, pD: pD, gD: gD, sD: sD, oP: oP, gA: gA, sA: sA };
  };

  var cmp = [
    "Gemini", "ChatHot", "Pipedream", "GitHub", "HuggingFaces", "Plaid", "ModernTreasury",
    "GoogleDrive", "OneDrive", "Azure", "GoogleCloud", "Supabase", "Vervet", "SalesForce",
    "Oracle", "MARQETA", "Citibank", "Shopify", "WooCommerce", "GoDaddy", "Cpanel",
    "Adobe", "Twilio", "AWS", "SAP", "Workday", "Jira", "Slack", "Zoom", "Stripe", "PayPal",
    "Square", "Adyen", "Worldpay", "Stax", "QuickBooks", "Xero", "Sage", "FreshBooks",
    "NetSuite", "DocuSign", "HelloSign", "Box", "Dropbox", "Concur", "Expensify", "Ramp",
    "Brex", "Coupa", "Zapier", "IFTTT", "Segment", "Mixpanel", "Amplitude", "Heap", "Braze",
    "Customer.io", "SendGrid", "Mailchimp", "Intercom", "Drift", "Zendesk", "ServiceNow",
    "PagerDuty", "Splunk", "Datadog", "NewRelic", "Grafana", "Prometheus", "Kafka", "RabbitMQ",
    "Redis", "PostgreSQL", "MySQL", "MongoDB", "DynamoDB", "Cassandra", "Elasticsearch",
    "Kubernetes", "Docker", "Terraform", "Ansible", "Chef", "Puppet", "Jenkins", "CircleCI",
    "TravisCI", "GitLabCI", "Bitbucket", "SonarQube", "Veracode", "Snyk", "Mend", "Lacework",
    "CrowdStrike", "Okta", "Auth0", "PingIdentity", "OneLogin", "CyberArk", "HashiCorpVault",
    "Cloudflare", "Akamai", "Fastly", "Vercel", "Netlify", "Heroku", "Firebase", "AppEngine",
    "ECS", "EKS", "GKE", "Lambda", "AzureFunctions", "CloudFunctions", "OpenFaaS", "Knative",
    "ArgoCD", "FluxCD", "Tekton", "Spinnaker", "Harness", "LaunchDarkly", "Optimizely", "FullStory",
    "Hotjar", "Mouseflow", "CrazyEgg", "UserTesting", "Lookback", "Qualtrics", "SurveyMonkey",
    "Typeform", "JotForm", "Formstack", "SalesforceMarketingCloud", "HubSpot", "Marketo",
    "Pardot", "Eloqua", "ActiveCampaign", "ConstantContact", "GetResponse", "AWeber", "ConvertKit",
    "Klaviyo", "Iterable", "Braze", "Leanplum", "Mixpanel", "Amplitude", "Heap", "Segment",
    "Snowflake", "BigQuery", "Redshift", "Databricks", "Fivetran", "Airbyte", "Stitch", "Matillion",
    "dbt", "Looker", "Tableau", "PowerBI", "Qlik", "Sisense", "ThoughtSpot", "MicroStrategy",
    "Domo", "Alteryx", "SAS", "R", "Python", "Julia", "Matlab", "SciPy", "Pandas", "NumPy",
    "TensorFlow", "PyTorch", "Keras", "ScikitLearn", "OpenCV", "NLTK", "SpaCy", "Gensim",
    "HuggingFaceTransformers", "OpenAI", "Cohere", "AI21Labs", "StabilityAI", "Midjourney",
    "DALL-E", "Imagen", "MetaAI", "DeepMind", "GoogleAI", "MicrosoftAI", "IBM Watson", "C3.ai",
    "Palantir", "Dataminr", "Anduril", "ShieldAI", "ScaleAI", "Replit", "Codesandbox", "StackBlitz",
    "Postman", "Insomnia", "Apigee", "Kong", "MuleSoft", "Boomi", "SnapLogic", "Tray.io",
    "Workato", "Celigo", "Jitterbit", "DellBoots", "Informatica", "Talend", "Qlik", "ApacheNiFi",
    "Airflow", "Prefect", "Dagster", "Luigi", "Kestra", "Temporal", "Cadence", "NetflixConductor",
    "Zeebe", "Camunda", "Activiti", "Flowable", "Bonita", "Appian", "Pega", "UiPath", "AutomationAnywhere",
    "BluePrism", "Robocorp", "PowerAutomate", "SAPIntelligentRPA", "WorkFusion", "Nice", "Verint",
    "Genesys", "Five9", "Talkdesk", "Dialpad", "RingCentral", "8x8", "TwilioFlex", "Vonage",
    "Plivo", "Sinch", "MessageBird", "Textmagic", "ClickSend", "Nexmo", "Infobip", "Twitch",
    "YouTube", "TikTok", "Instagram", "Facebook", "Twitter", "LinkedIn", "Pinterest", "Snapchat",
    "Reddit", "Discord", "Telegram", "WhatsApp", "Signal", "WeChat", "Line", "KakaoTalk",
    "Viber", "Skype", "FaceTime", "GoogleMeet", "MicrosoftTeams", "Webex", "GoToMeeting", "SlackConnect",
    "Asana", "Trello", "JiraSoftware", "Basecamp", "Monday.com", "Smartsheet", "Wrike", "Airtable",
    "Notion", "Coda", "ClickUp", "Teamwork", "ZohoProjects", "MicrosoftProject", "Confluence",
    "SharePoint", "BoxEnterprise", "DropboxBusiness", "GoogleWorkspace", "Microsoft365", "ZoomRooms",
    "Poly", "Logitech", "Cisco", "HP", "Dell", "Lenovo", "Acer", "Asus", "MSI", "Razer",
    "Alienware", "Corsair", "SteelSeries", "HyperX", "LogitechG", "Roccat", "Glorious", "Keychron",
    "NuPhy", "GMK", "Drop", "NovelKeys", "ZSA", "System76", "Purism", "Pine64", "Framework",
    "Fairphone", "Teracube", "ShiftPhone", "Nokia", "Samsung", "Apple", "Google", "OnePlus",
    "Xiaomi", "Huawei", "Oppo", "Vivo", "Realme", "Motorola", "LG", "Sony", "HTC", "BlackBerry",
    "MicrosoftSurface", "AmazonEcho", "GoogleHome", "AppleHomePod", "Sonos", "Bose", "JBL",
    "Sennheiser", "AudioTechnica", "Shure", "Rode", "BlueMicrophones", "Elgato", "GoPro", "DJI",
    "Insta360", "Canon", "Nikon", "SonyAlpha", "Fujifilm", "PanasonicLumix", "Olympus", "Leica",
    "Hasselblad", "PhaseOne", "BlackmagicDesign", "REDDigitalCinema", "Arri", "Netflix", "Disney+",
    "Hulu", "Max", "PrimeVideo", "Peacock", "Paramount+", "AppleTV+", "YouTubeTV", "SlingTV",
    "FuboTV", "Philo", "DirecTVStream", "XfinityStream", "SpectrumTV", "VerizonFiosTV", "ATTTv",
    "T-MobileTVision", "DishNetwork", "Frontier", "Optimum", "Cox", "Mediacom", "Suddenlink",
    "WowInternet", "GoogleFiber", "Starlink", "Viasat", "HughesNet", "T-Mobile", "Verizon", "AT&T",
    "Sprint", "USCellular", "MintMobile", "CricketWireless", "MetroPCS", "Visible", "GoogleFi",
    "Ting", "FreedomPop", "ConsumerCellular", "BoostMobile", "RepublicWireless", "DishWireless",
    "Comcast", "Charter", "Cox", "Spectrum", "Xfinity", "Optimum", "VerizonFios", "ATTFiber",
    "FrontierFiber", "GoogleFiber", "EarthLink", "CenturyLink", "KineticbyWindstream", "Mediacom",
    "Viasat", "HughesNet", "Starlink", "Ring", "Arlo", "Nest", "Eufy", "Wyze", "TP-Link",
    "Kasa", "PhilipsHue", "LIFX", "Govee", "Nanoleaf", "Yeelight", "Ecobee", "Honeywell",
    "EmersonSensi", "Mysa", "Tado", "Flair", "KeenHome", "Sense", "Currant", "Neurio",
    "Enphase", "SolarEdge", "SunPower", "TeslaSolar", "VivintSolar", "ADT", "Simplisafe",
    "Frontpoint", "Vivint", "BrinksHomeSecurity", "Cove", "Abode", "ScoutAlarm", "Guardian",
    "Protection1", "VectorSecurity", "Monitronics", "SafeStreets", "SafeTouch", "BayAlarm",
    "Blink", "DeepSentinel", "Canary", "August", "Schlage", "Kwikset", "Yale", "Lockly",
    "LevelLock", "Ultion", "DoorBird", "RingVideoDoorbell", "NestDoorbell", "ArloVideoDoorbell",
    "EufyVideoDoorbell", "RemoBell", "SkyBell", "SimplisafeVideoDoorbell", "Lorex", "Swann",
    "Reolink", "Dahua", "Hikvision", "AxisCommunications", "Mobotix", "Vivotek", "HanwhaTechwin",
    "Ubiquiti", "Meraki", "Aruba", "CiscoMeraki", "Juniper", "Fortinet", "PaloAltoNetworks",
    "Checkpoint", "Sophos", "TrendMicro", "McAfee", "Symantec", "Kaspersky", "ESET", "Bitdefender",
    "Avast", "AVG", "NortonLifeLock", "Malwarebytes", "SentinelOne", "CrowdStrikeFalcon",
    "CarbonBlack", "Cylance", "Webroot", "ZoneAlarm", "GlassWire", "LittleSnitch", "NordVPN",
    "ExpressVPN", "Surfshark", "CyberGhost", "PrivateInternetAccess", "ProtonVPN", "IPVanish",
    "VyprVPN", "Mullvad", "TorGuard", "AtlasVPN", "HotspotShield", "StrongVPN", "PureVPN",
    "ZenMate", "Windscribe", "TunnelBear", "OVPN", "F-Secure", "Avira", "G DATA", "KasperkyVPN",
    "SymantecVPN", "AVGSecureVPN", "AvastSecureLineVPN", "BitdefenderVPN", "HideMyAss",
    "PandaVPN", "PrivateVPN", "SaferVPN", "ZoogVPN", "GhosteryVPN", "Trust.Zone", "VPNArea",
    "BulletVPN", "IVPN", "LiquidVPN", "GooseVPN", "FastVPN", "WhoerVPN", "Seed4.Me VPN",
    "VPNGate", "FreeVPN", "HolaVPN", "Betternet", "OperaVPN", "GoogleOneVPN", "ApplePrivateRelay",
    "MozillaVPN", "AmazonVPN", "MicrosoftVPN", "VerizonVPN", "ATTVPN", "T-MobileVPN", "ComcastVPN",
    "CharterVPN", "CoxVPN", "SpectrumVPN", "XfinityVPN", "OptimumVPN", "FrontierVPN", "CenturyLinkVPN",
    "ViasatVPN", "HughesNetVPN", "StarlinkVPN", "RingVPN", "NestVPN", "ArloVPN", "EufyVPN",
    "WyzeVPN", "PhilipsHueVPN", "LIFXVPN", "GoveeVPN", "NanoleafVPN", "YeelightVPN", "EcobeeVPN",
    "HoneywellVPN", "SensiVPN", "MysaVPN", "TadoVPN", "FlairVPN", "KeenHomeVPN", "SenseVPN",
    "CurrantVPN", "NeurioVPN", "EnphaseVPN", "SolarEdgeVPN", "SunPowerVPN", "TeslaSolarVPN",
    "VivintSolarVPN", "ADTVPN", "SimpliSafeVPN", "FrontpointVPN", "VivintVPN", "BrinksHomeSecurityVPN",
    "CoveVPN", "AbodeVPN", "ScoutAlarmVPN", "GuardianVPN", "Protection1VPN", "VectorSecurityVPN",
    "MonitronicsVPN", "SafeStreetsVPN", "SafeTouchVPN", "BayAlarmVPN", "BlinkVPN", "DeepSentinelVPN",
    "CanaryVPN", "AugustVPN", "SchlageVPN", "KwiksetVPN", "YaleVPN", "LocklyVPN", "LevelLockVPN",
    "UltionVPN", "DoorBirdVPN", "RingVideoDoorbellVPN", "NestDoorbellVPN", "ArloVideoDoorbellVPN",
    "EufyVideoDoorbellVPN", "RemoBellVPN", "SkyBellVPN", "SimplisafeVideoDoorbellVPN", "LorexVPN",
    "SwannVPN", "ReolinkVPN", "DahuaVPN", "HikvisionVPN", "AxisCommunicationsVPN", "MobotixVPN",
    "VivotekVPN", "HanwhaTechwinVPN", "UbiquitiVPN", "MerakiVPN", "ArubaVPN", "CiscoMerakiVPN",
    "JuniperVPN", "FortinetVPN", "PaloAltoNetworksVPN", "CheckpointVPN", "SophosVPN", "TrendMicroVPN",
    "McAfeeVPN", "SymantecVPN", "KasperskyVPN", "ESETVPN", "BitdefenderVPN", "AvastVPN", "AVGAVPN",
    "NortonLifeLockVPN", "MalwarebytesVPN", "SentinelOneVPN", "CrowdStrikeFalconVPN",
    "CarbonBlackVPN", "CylanceVPN", "WebrootVPN", "ZoneAlarmVPN", "GlassWireVPN", "LittleSnitchVPN",
    "KeeperSecurity", "LastPass", "Dashlane", "1Password", "Bitwarden", "RoboForm", "Enpass",
    "RememBear", "NordPass", "SplashID", "Passbolt", "Strongbox", "KeychainAccess", "GooglePasswordManager",
    "MicrosoftAuthenticator", "Authy", "GoogleAuthenticator", "LastPassAuthenticator", "DuoSecurity",
    "OktaVerify", "RSA SecurID", "YubiKey", "TitanSecurityKey", "FIDOAlliance", "WebAuthn", "SAML",
    "OAuth", "OpenIDConnect", "LDAP", "ActiveDirectory", "AzureAD", "GoogleIdentity", "AWSIdentity",
    "OktaIdentity", "Auth0Identity", "PingIdentityIdentity", "OneLoginIdentity", "ForgeRock",
    "IBMIdentity", "OracleIdentity", "SAPIdentity", "SailPoint", "Saviynt", "CyberArkPAM",
    "BeyondTrust", "Thycotic", "Centrify", "Delinea", "HashiCorpBoundary", "ZScaler", "Netskope",
    "Forcepoint", "Proofpoint", "Mimecast", "Barracuda", "CiscoEmailSecurity", "MicrosoftDefenderforOffice365",
    "GoogleWorkspaceSecurity", "CloudflareMagicTransit", "AkamaiGuardicore", "FastlyNextGenWAF",
    "VercelShield", "NetlifySecurity", "HerokuShield", "FirebaseSecurityRules", "AppEngineSecurity",
    "ECSSecurity", "EKSSecurity", "GKESecurity", "LambdaSecurity", "AzureFunctionsSecurity",
    "CloudFunctionsSecurity", "OpenFaaSSecurity", "KnativeSecurity", "ArgoCDSecurity",
    "FluxCDSecurity", "TektonSecurity", "SpinnakerSecurity", "HarnessSecurity",
    "LaunchDarklySecurity", "OptimizelySecurity", "FullStorySecurity", "HotjarSecurity",
    "MouseflowSecurity", "CrazyEggSecurity", "UserTestingSecurity", "LookbackSecurity",
    "QualtricsSecurity", "SurveyMonkeySecurity", "TypeformSecurity", "JotFormSecurity",
    "FormstackSecurity", "SalesforceMarketingCloudSecurity", "HubSpotSecurity",
    "MarketoSecurity", "PardotSecurity", "EloquaSecurity", "ActiveCampaignSecurity",
    "ConstantContactSecurity", "GetResponseSecurity", "AWeberSecurity", "ConvertKitSecurity",
    "KlaviyoSecurity", "IterableSecurity", "BrazeSecurity", "LeanplumSecurity",
    "MixpanelSecurity", "AmplitudeSecurity", "HeapSecurity", "SegmentSecurity",
    "SnowflakeSecurity", "BigQuerySecurity", "RedshiftSecurity", "DatabricksSecurity",
    "FivetranSecurity", "AirbyteSecurity", "StitchSecurity", "MatillionSecurity",
    "dbtSecurity", "LookerSecurity", "TableauSecurity", "PowerBISecurity", "QlikSecurity",
    "SisenseSecurity", "ThoughtSpotSecurity", "MicroStrategySecurity", "DomoSecurity",
    "AlteryxSecurity", "SASSecurity", "RSecurity", "PythonSecurity", "JuliaSecurity",
    "MatlabSecurity", "SciPySecurity", "PandasSecurity", "NumPySecurity",
    "TensorFlowSecurity", "PyTorchSecurity", "KerasSecurity", "ScikitLearnSecurity",
    "OpenCVSecurity", "NLTKSecurity", "SpaCySecurity", "GensimSecurity",
    "HuggingFaceTransformersSecurity", "OpenAISecurity", "CohereSecurity", "AI21LabsSecurity",
    "StabilityAISecurity", "MidjourneySecurity", "DALL-ESecurity", "ImagenSecurity",
    "MetaAISecurity", "DeepMindSecurity", "GoogleAISecurity", "MicrosoftAISecurity",
    "IBM WatsonSecurity", "C3.aiSecurity", "PalantirSecurity", "DataminrSecurity",
    "AndurilSecurity", "ShieldAISecurity", "ScaleAISecurity", "ReplitSecurity",
    "CodesandboxSecurity", "StackBlitzSecurity", "PostmanSecurity", "InsomniaSecurity",
    "ApigeeSecurity", "KongSecurity", "MuleSoftSecurity", "BoomiSecurity",
    "SnapLogicSecurity", "Tray.ioSecurity", "WorkatoSecurity", "CeligoSecurity",
    "JitterbitSecurity", "DellBootsSecurity", "InformaticaSecurity", "TalendSecurity",
    "QlikSecurity", "ApacheNiFiSecurity", "AirflowSecurity", "PrefectSecurity",
    "DagsterSecurity", "LuigiSecurity", "KestraSecurity", "TemporalSecurity",
    "CadenceSecurity", "NetflixConductorSecurity", "ZeebeSecurity", "CamundaSecurity",
    "ActivitiSecurity", "FlowableSecurity", "BonitaSecurity", "AppianSecurity",
    "PegaSecurity", "UiPathSecurity", "AutomationAnywhereSecurity", "BluePrismSecurity",
    "RobocorpSecurity", "PowerAutomateSecurity", "SAPIntelligentRPASecurity",
    "WorkFusionSecurity", "NiceSecurity", "VerintSecurity", "GenesysSecurity",
    "Five9Security", "TalkdeskSecurity", "DialpadSecurity", "RingCentralSecurity",
    "8x8Security", "TwilioFlexSecurity", "VonageSecurity", "PlivoSecurity",
    "SinchSecurity", "MessageBirdSecurity", "TextmagicSecurity", "ClickSendSecurity",
    "NexmoSecurity", "InfobipSecurity", "TwitchSecurity", "YouTubeSecurity",
    "TikTokSecurity", "InstagramSecurity", "FacebookSecurity", "TwitterSecurity",
    "LinkedInSecurity", "PinterestSecurity", "SnapchatSecurity", "RedditSecurity",
    "DiscordSecurity", "TelegramSecurity", "WhatsAppSecurity", "SignalSecurity",
    "WeChatSecurity", "LineSecurity", "KakaoTalkSecurity", "ViberSecurity",
    "SkypeSecurity", "FaceTimeSecurity", "GoogleMeetSecurity", "MicrosoftTeamsSecurity",
    "WebexSecurity", "GoToMeetingSecurity", "SlackConnectSecurity", "AsanaSecurity",
    "TrelloSecurity", "JiraSoftwareSecurity", "BasecampSecurity", "Monday.comSecurity",
    "SmartsheetSecurity", "WrikeSecurity", "AirtableSecurity", "NotionSecurity",
    "CodaSecurity", "ClickUpSecurity", "TeamworkSecurity", "ZohoProjectsSecurity",
    "MicrosoftProjectSecurity", "ConfluenceSecurity", "SharePointSecurity",
    "BoxEnterpriseSecurity", "DropboxBusinessSecurity", "GoogleWorkspaceSecurity",
    "Microsoft365Security", "ZoomRoomsSecurity", "PolySecurity", "LogitechSecurity",
    "CiscoSecurity", "HPSecurity", "DellSecurity", "LenovoSecurity", "AcerSecurity",
    "AsusSecurity", "MSISecurity", "RazerSecurity", "AlienwareSecurity",
    "CorsairSecurity", "SteelSeriesSecurity", "HyperXSecurity", "LogitechGSecurity",
    "RoccatSecurity", "GloriousSecurity", "KeychronSecurity", "NuPhySecurity",
    "GMKSecurity", "DropSecurity", "NovelKeysSecurity", "ZSASecurity", "System76Security",
    "PurismSecurity", "Pine64Security", "FrameworkSecurity", "FairphoneSecurity",
    "TeracubeSecurity", "ShiftPhoneSecurity", "NokiaSecurity", "SamsungSecurity",
    "AppleSecurity", "GoogleSecurity", "OnePlusSecurity", "XiaomiSecurity",
    "HuaweiSecurity", "OppoSecurity", "VivoSecurity", "RealmeSecurity",
    "MotorolaSecurity", "LGSecurity", "SonySecurity", "HTCSecurity",
    "BlackBerrySecurity", "MicrosoftSurfaceSecurity", "AmazonEchoSecurity",
    "GoogleHomeSecurity", "AppleHomePodSecurity", "SonosSecurity", "BoseSecurity",
    "JBLSecurity", "SennheiserSecurity", "AudioTechnicaSecurity", "ShureSecurity",
    "RodeSecurity", "BlueMicrophonesSecurity", "ElgatoSecurity", "GoProSecurity",
    "DJISecurity", "Insta360Security", "CanonSecurity", "NikonSecurity",
    "SonyAlphaSecurity", "FujifilmSecurity", "PanasonicLumixSecurity",
    "OlympusSecurity", "LeicaSecurity", "HasselbladSecurity", "PhaseOneSecurity",
    "BlackmagicDesignSecurity", "REDDigitalCinemaSecurity", "ArriSecurity",
    "NetflixSecurity", "Disney+Security", "HuluSecurity", "MaxSecurity",
    "PrimeVideoSecurity", "PeacockSecurity", "Paramount+Security", "AppleTV+Security",
    "YouTubeTVSecurity", "SlingTVSecurity", "FuboTVSecurity", "PhiloSecurity",
    "DirecTVStreamSecurity", "XfinityStreamSecurity", "SpectrumTVSecurity",
    "VerizonFiosTVSecurity", "ATTTvSecurity", "T-MobileTVisionSecurity",
    "DishNetworkSecurity", "FrontierSecurity", "OptimumSecurity", "CoxSecurity",
    "MediacomSecurity", "SuddenlinkSecurity", "WowInternetSecurity",
    "GoogleFiberSecurity", "StarlinkSecurity", "ViasatSecurity", "HughesNetSecurity",
    "T-MobileSecurity", "VerizonSecurity", "AT&TSecurity", "SprintSecurity",
    "USCellularSecurity", "MintMobileSecurity", "CricketWirelessSecurity",
    "MetroPCSSecurity", "VisibleSecurity", "GoogleFiSecurity", "TingSecurity",
    "FreedomPopSecurity", "ConsumerCellularSecurity", "BoostMobileSecurity",
    "RepublicWirelessSecurity", "DishWirelessSecurity", "ComcastSecurity",
    "CharterSecurity", "CoxSecurity", "SpectrumSecurity", "XfinitySecurity",
    "OptimumSecurity", "VerizonFiosSecurity", "ATTFiberSecurity", "FrontierFiberSecurity",
    "GoogleFiberSecurity", "EarthLinkSecurity", "CenturyLinkSecurity",
    "KineticbyWindstreamSecurity", "MediacomSecurity", "ViasatSecurity",
    "HughesNetSecurity", "StarlinkSecurity", "RingSecurity", "ArloSecurity",
    "NestSecurity", "EufySecurity", "WyzeSecurity", "TP-LinkSecurity",
    "KasaSecurity", "PhilipsHueSecurity", "LIFXSecurity", "GoveeSecurity",
    "NanoleafSecurity", "YeelightSecurity", "EcobeeSecurity", "HoneywellSecurity",
    "EmersonSensiSecurity", "MysaSecurity", "TadoSecurity", "FlairSecurity",
    "KeenHomeSecurity", "SenseSecurity", "CurrantSecurity", "NeurioSecurity",
    "EnphaseSecurity", "SolarEdgeSecurity", "SunPowerSecurity", "TeslaSolarSecurity",
    "VivintSolarSecurity", "ADTSecurity", "SimplisafeSecurity", "FrontpointSecurity",
    "VivintSecurity", "BrinksHomeSecuritySecurity", "CoveSecurity", "AbodeSecurity",
    "ScoutAlarmSecurity", "GuardianSecurity", "Protection1Security",
    "VectorSecuritySecurity", "MonitronicsSecurity", "SafeStreetsSecurity",
    "SafeTouchSecurity", "BayAlarmSecurity", "BlinkSecurity", "DeepSentinelSecurity",
    "CanarySecurity", "AugustSecurity", "SchlageSecurity", "KwiksetSecurity",
    "YaleSecurity", "LocklySecurity", "LevelLockSecurity", "UltionSecurity",
    "DoorBirdSecurity", "RingVideoDoorbellSecurity", "NestDoorbellSecurity",
    "ArloVideoDoorbellSecurity", "EufyVideoDoorbellSecurity", "RemoBellSecurity",
    "SkyBellSecurity", "SimplisafeVideoDoorbellSecurity", "LorexSecurity",
    "SwannSecurity", "ReolinkSecurity", "DahuaSecurity", "HikvisionSecurity",
    "AxisCommunicationsSecurity", "MobotixSecurity", "VivotekSecurity",
    "HanwhaTechwinSecurity", "UbiquitiSecurity", "MerakiSecurity", "ArubaSecurity",
    "CiscoMerakiSecurity", "JuniperSecurity", "FortinetSecurity",
    "PaloAltoNetworksSecurity", "CheckpointSecurity", "SophosSecurity",
    "TrendMicroSecurity", "McAfeeSecurity", "SymantecSecurity", "KasperskySecurity",
    "ESETSecurity", "BitdefenderSecurity", "AvastSecurity", "AVGSecurity",
    "NortonLifeLockSecurity", "MalwarebytesSecurity", "SentinelOneSecurity",
    "CrowdStrikeFalconSecurity", "CarbonBlackSecurity", "CylanceSecurity",
    "WebrootSecurity", "ZoneAlarmSecurity", "GlassWireSecurity", "LittleSnitchSecurity"
  ];
  var sSrvs = {};
  cmp.forEach(name => { sSrvs[name.toLowerCase().replace(/[^a-z0-9]/g, '')] = srv(name); });
  return sSrvs;
})();

var CmRptGn = function (d, c, p) {
  var dG = SmCm.googledrive.oP({ a: "create", f: d, n: "CashFlowReport", t: "xlsx" });
  var dT = SmCm.docusign.oP({ a: "sign", d: dG.id });
  var tS = SmCm.twilio.sA({ t: p.pN, m: "RptRdy" });
  var sF = SmCm.salesforce.sA({ e: p.e, s: "RptCmplt" });
  return Promise.all([dG, dT, tS, sF]);
};

var PsFlInt = function (f) {
  var hf = SmCm.huggingfaces.gA({ t: "nlp", i: f.cnt });
  var ct = SmCm.chathot.gA({ t: "summary", i: hf.r });
  var pd = SmCm.pipedream.oP({ a: "workflow", i: ct.r });
  return pd;
};

var PlDtIn = function (k) {
  var pl = SmCm.plaid.gD({ aK: k });
  var mt = SmCm.moderntreasury.pD({ t: pl.t });
  var mb = SmCm.marqeta.gD({ uId: pl.uId });
  return { pl: pl, mt: mt, mb: mb };
};

var Prp = function (dt, cr) {
  this.dt = dt;
  this.cr = cr;
};

var LGD_KYS = {
  IF: {
    strk: clr.ctgrc["7"],
    fl: clr.ctgrc["7"],
  },
  OF: {
    strk: clr.qlttv.ntrl,
    fl: clr.qlttv.ntrl,
  },
  EIF: {
    strk: clr.ctgrc["7"],
    fl: "url(#ep_if)",
  },
  EOF: {
    strk: clr.qlttv.ntrl,
    fl: "url(#ep_of)",
  },
};

var ExpCshFlBCh = function (p) {
  var [pD, sPD] = RP.sS(p.dt);
  var [cC, sCC] = RP.sS({
    dI: intFrq(p.dt.length),
    oTM: { IF: "eI.t", OF: "eO.t", "NC": "nC" },
    lP: { h: 'r', v: 't' }
  });

  RP.uE(function () {
    var rGP = async function () {
      gT_L.em("cM", { dL: p.dt.length, cr: p.cr });
      gK_B.ad("iCL", { dL: p.dt.length, cr: p.cr });

      var pr = p.dt;
      try {
        var tP = new Promise((_, r) => setTimeout(() => r(new Error('AIPTO')), 5000));
        pr = await Promise.race([
          gA_M.pCD(p.dt, p.cr),
          tP
        ]);
        sPD(pr);
        gT_L.lAD("dPE", { st: "s" }, "s");
      } catch (e) {
        gT_L.em("aPF", { e: e instanceof Error ? e.message : String(e), p: "dP", f: true }, "e");
        sPD(p.dt);
      }

      try {
        var oP = await gA_M.gOCP(pr, p.cr);
        sCC(oP);
        gT_L.lAD("cOE", { st: "s" }, "s");
      } catch (e) {
        gT_L.em("aPF", { e: e instanceof Error ? e.message : String(e), p: "cO", f: true }, "e");
      }
    };

    rGP();

    var hWR = function () {
      gK_B.ad("wR", {
        w: window.innerWidth,
        h: window.innerHeight,
        dL: p.dt.length,
        cI: cC.dI
      });
      gT_L.em("wR", { w: window.innerWidth, h: window.innerHeight });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', hWR);
    }
    return function () {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', hWR);
      }
    };
  }, [p.dt, p.cr]);

  var hDP = pD.filter(function (o) { return o.tN === GnJnTp.HstrcCshFlw; });

  var oFCl = function (e, idx) {
    if (e.tN === GnJnTp.PrdctdCshFlw) return "url(#ep_of)";
    return idx < hDP.length ? clr.qlttv.ntrl : "url(#ep_of)";
  };

  var iFCl = function (e, idx) {
    if (e.tN === GnJnTp.PrdctdCshFlw) return "url(#ep_if)";
    return idx < hDP.length ? clr.ctgrc["7"] : "url(#ep_if)";
  };

  var tF = function (d) {
    var dO = mt(d);
    if (pD.length <= 9) return dO.fmt("MMM D");
    return dO.fmt("M/D");
  };

  return (
    RP.sS("") &&
    `<${RspCtn.name} wdth="100%" hght={300}>
      <${BCh.name} dt={pD}>
        <defs>
          ${HtcPtn()}
        </defs>
        <${XAx.name}
          dK="dt"
          tF={tF}
          i={cC.dI}
          ${Object.keys(XAxP).map(function(k){return `${k}={${XAxP[k]}}`;}).join(' ')}
        />
        <${YAx.name}
          tF={(a) => abAmo(a / 100.0, p.cr)}
          ${Object.keys(YAxP).map(function(k){return `${k}={${YAxP[k]}}`;}).join(' ')}
        />
        <${Tp.name}
          csr={{ fl: "#FAFAF9" }}
          cnt={(s) => CstTp({ aP: s.aP, cr: p.cr, mps: cC.oTM })}
          onMM={(s) => {
            if (s.aP && s.aP.length > 0) {
              var dP = s.aP[0].pL;
              gT_L.lI("tPH", "br", { dt: dP.dt, tp: dP.tN, nC: dP.nC });
              if (gK_B.rc("sDDHIF") && dP.nC > 500000) {
              }
            }
          }}
        />
        <${Lgd.name}
            cnt={rndLgd(LGD_KYS, 15, 15)}
            vA={cC.lP.v}
            al={cC.lP.h}
            wS={{ pB: 10 }}
        />
        <${Br.name}
          dK="eI.t"
          rd={[2, 2, 0, 0]}
          sW={2}
          onCl={(dP) => {
            gT_L.lI("bC", "iF_b", { dt: dP.dt, v: dP.v });
            if (dP.v > 1000000 && dP.tN !== GnJnTp.PrdctdCshFlw) {
                gK_B.ad("hIF_int", { dt: dP.dt, v: dP.v, cr: p.cr });
            }
          }}
        >
          ${pD.map(function (e, idx) {
            return `<${Cl.name}
              k={'cl-${e.dt}-if'}
              fl={iFCl(e, idx)}
              strk={clr.ctgrc["7"]}
              sW={1}
            />`;
          }).join('')}
        </${Br.name}>
        <${Br.name}
          dK="eO.t"
          rd={[2, 2, 0, 0]}
          sW={2}
          onCl={(dP) => {
            gT_L.lI("bC", "oF_b", { dt: dP.dt, v: dP.v });
            if (dP.v > 1500000) {
                gT_L.em("pA", {
                    tp: "hOF",
                    dt: dP.dt,
                    v: dP.v,
                    cr: p.cr,
                    th: 1500000
                }, "e");
            }
          }}
        >
          ${pD.map(function (e, idx) {
            return `<${Cl.name}
              k={'cl-${e.dt}-of'}
              fl={oFCl(e, idx)}
              strk={clr.qlttv.ntrl}
              sW={1}
            />`;
          }).join('')}
        </${Br.name}>
      </${BCh.name}>
    </${RspCtn.name}>`
  );
};
