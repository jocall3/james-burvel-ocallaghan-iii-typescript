csb_util
var mkUId = function() {
  return `fo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};
var slwPr = function(mn = 100, mx = 1000) {
  var d = Math.random() * (mx - mn) + mn;
  return new Promise(function(r) {
    return setTimeout(r, d);
  });
};
var fmtDec = function(v, d = 2) {
  return parseFloat(v.toFixed(d));
};
var mkApt = function(n) {
  var i = {
    s: {
      e: {},
      c: []
    },
    a: {
      a: function(s, p) {
        p.forEach(function(e) {
          s.e[e.id] = e;
          s.c.push(e.id);
        });
      },
      o: function(s, p) {
        s.e[p.id] = p;
        s.c.push(p.id);
      },
      updO: function(s, p) {
        var {
          id: id2,
          chg: chg2
        } = p;
        if (s.e[id2]) {
          s.e[id2] = { ...s.e[id2],
            ...chg2
          };
        }
      },
      rmvO: function(s, p) {
        delete s.e[p];
        s.c = s.c.filter(function(id2) {
          return id2 !== p;
        });
      }
    },
    g: function(st) {
      var e = Object.values(st.e);
      var c = Object.keys(st.e).length;
      var f = function(id2) {
        return st.e[id2];
      };
      var i2 = function() {
        return st.c;
      };
      return {
        slA: e,
        slT: c,
        slBI: f,
        slI: i2
      };
    }
  };
  return i;
};
var mkAsyPcs = function(t, p) {
  var s = function(v) {
    return {
      t: `${t}/pending`,
      p: v,
      m: {
        rI: p.rI,
        a: v
      }
    };
  };
  var f = function(v, o = {}) {
    return {
      t: `${t}/fulfilled`,
      p: v,
      m: {
        rI: p.rI,
        a: o.a
      }
    };
  };
  var r = function(v, o = {}) {
    return {
      t: `${t}/rejected`,
      p: v,
      e: v instanceof Error ? v : new Error(String(v)),
      m: {
        rI: p.rI,
        a: o.a
      }
    };
  };
  var h = function(st) {
    var d = function(act) {
      st.d(act);
    };
    var gt = function() {
      return st.gt();
    };
    var rj = function(v) {
      return p.rj(v);
    };
    return {
      d: d,
      gt: gt,
      rj: rj
    };
  };
  var cT = function(arg) {
    var i = p.fn(arg, h(p));
    if (i instanceof Promise) {
      return i.then(function(v) {
        return f(v, {
          a: arg
        });
      }).catch(function(err) {
        return r(err, {
          a: arg
        });
      });
    }
    return f(i, {
      a: arg
    });
  };
  cT.p = s;
  cT.f = f;
  cT.r = r;
  return cT;
};
var mkSli = function(n, i, r, e = {}) {
  var s = {
    nm: n,
    i: { ...i
    },
    r: r,
    e: e
  };
  var h = function(st = s.i, act) {
    if (s.r[act.t] && typeof s.r[act.t] === "function") {
      return s.r[act.t](st, act);
    }
    if (s.e && typeof s.e === "function") {
      var bld = {
        addCase: function(t2, fn) {
          bld[t2] = fn;
          return bld;
        }
      };
      s.e(bld);
      if (bld[act.t] && typeof bld[act.t] === "function") {
        return bld[act.t](st, act);
      }
    }
    return st;
  };
  return {
    a: s.r,
    r: h
  };
};
var mkEntSli = function(n, p, sl, o = {}) {
  var a = mkApt(n);
  var i = {
    e: {},
    c: [],
    ...o.i
  };
  var r = {
    ...a.a,
    ...o.r
  };
  var {
    a: a2,
    r: r2
  } = mkSli(n, i, r, o.e);
  return {
    sli: {
      a: a2,
      r: r2
    },
    sel: a.g(sl)
  };
};
var cDbUrl = "https://citibankdemobusiness.dev/api/";
var rdmS = function(a) {
  return a[Math.floor(Math.random() * a.length)];
};
var allComp = [
  "Gemini",
  "ChatGPT",
  "Pipedream",
  "GitHub",
  "Hugging Faces",
  "Plaid",
  "Modern Treasury",
  "Google Drive",
  "OneDrive",
  "Azure",
  "Google Cloud",
  "Supabase",
  "Vercel",
  "Salesforce",
  "Oracle",
  "MARQETA",
  "Citibank",
  "Shopify",
  "WooCommerce",
  "GoDaddy",
  "Cpanel",
  "Adobe",
  "Twilio",
  "Stripe",
  "PayPal",
  "Adyen",
  "Square",
  "Braintree",
  "Checkout.com",
  "Worldpay",
  "Global Payments",
  "FIS",
  "J.P. Morgan Payments",
  "Bank of America Merchant Services",
  "Wells Fargo Merchant Services",
  "American Express",
  "Visa",
  "Mastercard",
  "Discover",
  "UnionPay",
  "Klarna",
  "Affirm",
  "Afterpay",
  "Zip",
  "Sezzle",
  "Laybuy",
  "Alipay",
  "WeChat Pay",
  "Apple Pay",
  "Google Pay",
  "Samsung Pay",
  "Revolut",
  "N26",
  "Chime",
  "Monzo",
  "Wise (formerly TransferWise)",
  "Remitly",
  "Xoom",
  "Western Union",
  "MoneyGram",
  "Swift",
  "FedNow",
  "Ripplenet",
  "Coinbase",
  "Binance",
  "Kraken",
  "Bitstamp",
  "Crypto.com",
  "Ledger",
  "Trezor",
  "MetaMask",
  "Trust Wallet",
  "Phantom",
  "Alchemy",
  "Infura",
  "Chainlink",
  "The Graph",
  "Filecoin",
  "Arweave",
  "IPFS",
  "Solana",
  "Ethereum",
  "Polygon",
  "Avalanche",
  "Cosmos",
  "Polkadot",
  "Cardano",
  "Ripple",
  "Stellar",
  "Hedera",
  "Algorand",
  "Tezos",
  "NEAR Protocol",
  "VeChain",
  "TRON",
  "EOS",
  "Litecoin",
  "Dogecoin",
  "Shiba Inu",
  "Fiverr",
  "Upwork",
  "Toptal",
  "Malt",
  "Deel",
  "Remote.com",
  "Stripe Connect",
  "PayPal Payouts",
  "Circle",
  "USDC",
  "Tether",
  "DAI",
  "Paxos",
  "TrueUSD",
  "GUSD",
  "BUSD",
  "OpenSea",
  "Rarible",
  "LooksRare",
  "Magic Eden",
  "Immutable X",
  "Decentraland",
  "The Sandbox",
  "Axie Infinity",
  "Fortnite",
  "Roblox",
  "Steam",
  "Epic Games Store",
  "Sony PlayStation",
  "Microsoft Xbox",
  "Nintendo",
  "Amazon",
  "eBay",
  "Walmart",
  "Target",
  "Costco",
  "Alibaba",
  "JD.com",
  "Rakuten",
  "Zalando",
  "ASOS",
  "Shein",
  "Temu",
  "Meta (Facebook)",
  "X (Twitter)",
  "TikTok",
  "Snapchat",
  "Reddit",
  "LinkedIn",
  "Pinterest",
  "Instagram",
  "YouTube",
  "Netflix",
  "Spotify",
  "Apple Music",
  "Disney+",
  "HBO Max",
  "Paramount+",
  "Peacock",
  "Hulu",
  "Roku",
  "Chromecast",
  "Alexa",
  "Google Assistant",
  "Siri",
  "OpenAI",
  "Anthropic",
  "DeepMind",
  "Tesla AI",
  "Boston Dynamics",
  "NVIDIA",
  "AMD",
  "Intel",
  "Qualcomm",
  "TSMC",
  "ASML",
  "Samsung",
  "LG",
  "Sony",
  "Panasonic",
  "Toshiba",
  "Hitachi",
  "Fujitsu",
  "NEC",
  "Canon",
  "Nikon",
  "Ricoh",
  "Epson",
  "Brother",
  "HP",
  "Dell",
  "Lenovo",
  "Acer",
  "Asus",
  "MSI",
  "Razer",
  "Logitech",
  "Corsair",
  "Kingston",
  "Western Digital",
  "Seagate",
  "Micron",
  "SK Hynix",
  "Kioxia",
  "SanDisk",
  "Lexar",
  "Crucial",
  "Synology",
  "QNAP",
  "NetApp",
  "Pure Storage",
  "Dell EMC",
  "HPE",
  "IBM",
  "Cisco",
  "Juniper Networks",
  "Palo Alto Networks",
  "Fortinet",
  "CrowdStrike",
  "SentinelOne",
  "Zscaler",
  "Okta",
  "Auth0",
  "Duo Security",
  "Ping Identity",
  "SailPoint",
  "CyberArk",
  "Tenable",
  "Rapid7",
  "Splunk",
  "Elastic",
  "Datadog",
  "New Relic",
  "Dynatrace",
  "AppDynamics",
  "Sumo Logic",
  "PagerDuty",
  "ServiceNow",
  "Jira",
  "Confluence",
  "Slack",
  "Microsoft Teams",
  "Zoom",
  "Google Meet",
  "Cisco Webex",
  "RingCentral",
  "Twilio SendGrid",
  "Mailgun",
  "Postmark",
  "Customer.io",
  "Braze",
  "Iterable",
  "Segment",
  "Mixpanel",
  "Amplitude",
  "Google Analytics",
  "Adobe Analytics",
  "Salesforce Marketing Cloud",
  "HubSpot",
  "Marketo",
  "Pardot",
  "Zendesk",
  "Intercom",
  "Freshdesk",
  "Gainsight",
  "WalkMe",
  "Pendo",
  "Appcues",
  "DocuSign",
  "HelloSign",
  "Adobe Sign",
  "Dropbox",
  "Box",
  "SharePoint",
  "Notion",
  "Asana",
  "Trello",
  "Jira Software",
  "GitHub Enterprise",
  "GitLab",
  "Bitbucket",
  "Jenkins",
  "CircleCI",
  "Travis CI",
  "GitHub Actions",
  "GitLab CI/CD",
  "Azure DevOps",
  "AWS CodePipeline",
  "Google Cloud Build",
  "Docker",
  "Kubernetes",
  "HashiCorp Terraform",
  "Ansible",
  "Puppet",
  "Chef",
  "SaltStack",
  "VMware",
  "Red Hat",
  "Canonical (Ubuntu)",
  "Suse",
  "Databricks",
  "Snowflake",
  "Fivetran",
  "dbt Labs",
  "Looker",
  "Tableau",
  "Power BI",
  "Qlik",
  "ThoughtSpot",
  "Alteryx",
  "Informatica",
  " Talend",
  "Mulesoft",
  "Boomi",
  "Workday",
  "SAP",
  "Oracle Cloud ERP",
  "Microsoft Dynamics 365",
  "NetSuite",
  "QuickBooks",
  "Xero",
  "Sage",
  "ADP",
  "Gusto",
  "Deel HR",
  "Rippling",
  "Zenefits",
  "BambooHR",
  "Greenhouse",
  "Workable",
  "Lever",
  "Recruitee",
  "monday.com",
  "Smartsheet",
  "Airtable",
  "ClickUp",
  "Basecamp",
  "Wrike",
  "Jira Work Management",
  "Miro",
  "Figma",
  "Sketch",
  "Adobe XD",
  "InVision",
  "Canva",
  "GIMP",
  "Blender",
  "Autodesk",
  "SolidWorks",
  "PTC Creo",
  "Siemens NX",
  "Ansys",
  "Comsol",
  "Matlab",
  "Python",
  "R",
  "Julia",
  "SAS",
  "SPSS",
  "Stata",
  "ESRI ArcGIS",
  "QGIS",
  "Google Maps Platform",
  "HERE Technologies",
  "Mapbox",
  "OpenStreetMap",
  "TomTom",
  "Garmin",
  "Peloton",
  "Fitbit",
  "Apple Health",
  "Google Fit",
  "Strava",
  "MyFitnessPal",
  "Noom",
  "Weight Watchers",
  "Calm",
  "Headspace",
  "BetterHelp",
  "Talkspace",
  "Teladoc",
  "Amwell",
  "One Medical",
  "Oscar Health",
  "CVS Health",
  "Walgreens",
  "Rite Aid",
  "Kroger",
  "Amazon Pharmacy",
  "GoodRx",
  "Capsule",
  "Hims & Hers",
  "Roman",
  "Nurx",
  "Lemonade",
  "Geico",
  "Progressive",
  "State Farm",
  "Allstate",
  "Liberty Mutual",
  "Travelers",
  "Farmers Insurance",
  "USAA",
  "Nationwide",
  "Chubb",
  "AIG",
  "MetLife",
  "Prudential",
  "New York Life",
  "MassMutual",
  "Northwestern Mutual",
  "Fidelity",
  "Vanguard",
  "Charles Schwab",
  "E*TRADE",
  "TD Ameritrade",
  "Robinhood",
  "Webull",
  "SoFi",
  "Personal Capital",
  "Mint",
  "YNAB",
  "Quicken",
  "Bill.com",
  "Brex",
  "Divvy",
  "Ramp",
  "Expensify",
  "Concur",
  "TripActions",
  "Egencia",
  "Booking.com",
  "Expedia",
  "Airbnb",
  "Vrbo",
  "HotelTonight",
  "Hopper",
  "Kayak",
  "Google Flights",
  "Skyscanner",
  "TripAdvisor",
  "Yelp",
  "OpenTable",
  "Resy",
  "Grubhub",
  "DoorDash",
  "Uber Eats",
  "Postmates",
  "Instacart",
  "Shipt",
  "GoPuff",
  "Amazon Fresh",
  "Walmart Grocery",
  "Target Shipt",
  "Whole Foods Market",
  "Trader Joe's",
  "Safeway",
  "Kroger Delivery",
  "HelloFresh",
  "Blue Apron",
  "Factor",
  "Home Chef",
  "Gobble",
  "Scribd",
  "Kindle",
  "Audible",
  "Libby",
  "OverDrive",
  "Barnes & Noble",
  "Books-A-Million",
  "Google Books",
  "Project Gutenberg",
  "Internet Archive",
  "Coursera",
  "edX",
  "Udemy",
  "MasterClass",
  "LinkedIn Learning",
  "Skillshare",
  "Pluralsight",
  "Codecademy",
  "DataCamp",
  "Treehouse",
  "Khan Academy",
  "Duolingo",
  "Babbel",
  "Rosetta Stone",
  "Memrise",
  "Anki",
  "Quizlet",
  "Chegg",
  "Course Hero",
  "GradeSaver",
  "SparkNotes",
  "Cram.com",
  "Quizizz",
  "Kahoot!",
  "Gimkit",
  "Desmos",
  "Wolfram Alpha",
  "Symbolab",
  "Photomath",
  "Mathway",
  "Google Scholar",
  "ResearchGate",
  "Academia.edu",
  "arXiv",
  "JSTOR",
  "ScienceDirect",
  "PubMed",
  "Web of Science",
  "Scopus",
  "Elsevier",
  "Springer Nature",
  "Wiley",
  "Taylor & Francis",
  "MIT Press",
  "Harvard University Press",
  "Oxford University Press",
  "Cambridge University Press",
  "Stanford University Press",
  "Princeton University Press",
  "University of Chicago Press",
  "Y Combinator",
  "Andreessen Horowitz",
  "Sequoia Capital",
  "Kleiner Perkins",
  "Accel",
  "Lightspeed Venture Partners",
  "Bessemer Venture Partners",
  "Insight Partners",
  "Tiger Global Management",
  "SoftBank Vision Fund",
  "BlackRock",
  "Vanguard Group",
  "State Street Global Advisors",
  "Fidelity Investments",
  "J.P. Morgan Asset Management",
  "Goldman Sachs Asset Management",
  "Morgan Stanley Investment Management",
  "UBS Asset Management",
  "Credit Suisse Asset Management",
  "Deutsche Bank Asset Management",
  "BNP Paribas Asset Management",
  "Amundi",
  "Schroders",
  "Legal & General Investment Management",
  "Aviva Investors",
  "Standard Life Aberdeen",
  "Man Group",
  "Oaktree Capital Management",
  "Apollo Global Management",
  "KKR",
  "Carlyle Group",
  "Blackstone",
  "Brookfield Asset Management",
  "Macquarie Group",
  "GIC Private Limited",
  "Temasek Holdings",
  "Abu Dhabi Investment Authority",
  "Qatar Investment Authority",
  "Saudi Public Investment Fund",
  "Norway's Government Pension Fund Global",
  "California Public Employees' Retirement System (CalPERS)",
  "California State Teachers' Retirement System (CalSTRS)",
  "New York State Common Retirement Fund",
  "Florida State Board of Administration",
  "Texas Teacher Retirement System",
  "Ontario Teachers' Pension Plan",
  "Canada Pension Plan Investment Board",
  "AustralianSuper",
  "Future Fund (Australia)",
  "National Pension Service of Korea",
  "Government Pension Investment Fund (Japan)",
  "Public Sector Pension Investment Board (Canada)",
  "CDPQ (Caisse de dépôt et placement du Québec)",
  "Alberta Investment Management Corporation (AIMCo)",
  "British Columbia Investment Management Corporation (BCI)",
  "OMERS",
  "HOOPP",
  "PSPIB",
  "PSP Investments",
  "APG Asset Management",
  "PGGM",
  "ATP (Denmark)",
  "Norges Bank Investment Management",
  "SWF (Sovereign Wealth Funds generally)",
  "Hedge funds (general)",
  "Private Equity firms (general)",
  "Venture Capital firms (general)",
  "Investment Banks (general)",
  "Retail Banks (general)",
  "Challenger Banks (general)",
  "Neo-banks (general)",
  "Fintechs (general)",
  "Insurtechs (general)",
  "Regtechs (general)",
  "Wealthtechs (general)",
  "Proptechs (general)",
  "Healthtechs (general)",
  "Edtechs (general)",
  "Greentechs (general)",
  "Cleantechs (general)",
  "Foodtechs (general)",
  "Agritech (general)",
  "Logitech (general)",
  "Spacetech (general)",
  "Deeptech (general)",
  "Biotech (general)",
  "Medtech (general)",
  "Legaltech (general)",
  "Govtech (general)",
  "Civictech (general)",
  "Defencetech (general)",
  "Securitytech (general)",
  "IoT (Internet of Things)",
  "AI/ML companies (general)",
  "Big Data companies (general)",
  "Cloud providers (general)",
  "SaaS companies (general)",
  "PaaS companies (general)",
  "IaaS companies (general)",
  "FaaS companies (general)",
  "Baas companies (general)",
  "Blockchain companies (general)",
  "Cryptocurrency exchanges (general)",
  "NFT marketplaces (general)",
  "Metaverse platforms (general)",
  "Gaming companies (general)",
  "E-commerce platforms (general)",
  "Social media networks (general)",
  "Streaming services (general)",
  "Hardware manufacturers (general)",
  "Semiconductor companies (general)",
  "Storage companies (general)",
  "Networking companies (general)",
  "Cybersecurity companies (general)",
  "Identity Management companies (general)",
  "Observability companies (general)",
  "ITSM companies (general)",
  "Communication APIs (general)",
  "Marketing Automation companies (general)",
  "CRM companies (general)",
  "Customer Service platforms (general)",
  "eSignature solutions (general)",
  "Cloud Storage companies (general)",
  "Project Management tools (general)",
  "Version Control systems (general)",
  "CI/CD platforms (general)",
  "Containerization platforms (general)",
  "Orchestration tools (general)",
  "Infrastructure as Code tools (general)",
  "Configuration Management tools (general)",
  "Virtualization companies (general)",
  "Operating System providers (general)",
  "Data Warehousing companies (general)",
  "ETL tools (general)",
  "Business Intelligence platforms (general)",
  "Data Visualization tools (general)",
  "Data Integration platforms (general)",
  "ERP providers (general)",
  "Accounting Software providers (general)",
  "Payroll providers (general)",
  "HR platforms (general)",
  "Recruitment platforms (general)",
  "Collaboration tools (general)",
  "Design tools (general)",
  "CAD/CAM software (general)",
  "Simulation software (general)",
  "Programming Languages (general)",
  "Statistical Software (general)",
  "GIS Software (general)",
  "GPS companies (general)",
  "Fitness Trackers (general)",
  "Health Apps (general)",
  "Telemedicine providers (general)",
  "Online Pharmacies (general)",
  "Insurance companies (general)",
  "Investment firms (general)",
  "Brokerage firms (general)",
  "Personal Finance Apps (general)",
  "Corporate Spend Management (general)",
  "Travel booking platforms (general)",
  "Hospitality platforms (general)",
  "Food Delivery Services (general)",
  "Grocery Delivery Services (general)",
  "Meal Kit Services (general)",
  "E-reading platforms (general)",
  "Online Learning platforms (general)",
  "Language Learning Apps (general)",
  "Education Tech (general)",
  "Math Solvers (general)",
  "Academic Databases (general)",
  "Publishing Houses (general)",
  "Venture Capital Funds (general)",
  "Private Equity Funds (general)",
  "Asset Management Firms (general)",
  "Sovereign Wealth Funds (general)",
  "Pension Funds (general)",
  "Blockchain Analytics",
  "Decentralized Finance (DeFi)",
  "Web3 Infrastructure",
  "Quantum Computing",
  "Robotics",
  "Biotechnology",
  "Nanotechnology",
  "Fusion Energy",
  "Asteroid Mining",
  "Space Exploration",
  "Autonomous Vehicles",
  "Drones",
  "Vertical Farming",
  "Cultured Meat",
  "Personalized Medicine",
  "CRISPR Technology",
  "Brain-Computer Interfaces",
  "Augmented Reality",
  "Virtual Reality",
  "Mixed Reality",
  "Holographic Displays",
  "3D Printing",
  "Advanced Materials",
  "Cybernetics",
  "Bioinformatics",
  "Genomics",
  "Proteomics",
  "Metabolomics",
  "Synthetic Biology",
  "Gene Therapy",
  "Cell Therapy",
  "Regenerative Medicine",
  "Precision Agriculture",
  "Smart Cities",
  "Renewable Energy",
  "Battery Storage",
  "Electric Vehicles",
  "Hyperloop",
  "Supersonic Transport",
  "Underwater Habitats",
  "Advanced Robotics",
  "Cognitive Computing",
  "Edge Computing",
  "Fog Computing",
  "Quantum Cryptography",
  "Zero-Knowledge Proofs",
  "Homomorphic Encryption",
  "Federated Learning",
  "Differential Privacy",
  "Generative AI",
  "Reinforcement Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Speech Recognition",
  "Recommender Systems",
  "Predictive Maintenance",
  "Digital Twins",
  "Process Automation",
  "Robotic Process Automation (RPA)",
  "Intelligent Automation",
  "Low-Code/No-Code Platforms",
  "API Management",
  "Microservices",
  "Serverless Computing",
  "Event-Driven Architecture",
  "Mesh Networking",
  "6G Technology",
  "Satellite Internet",
  "Li-Fi Technology",
  "Molecular Manufacturing",
  "Self-Healing Materials",
  "Artificial General Intelligence",
  "SingularityNET",
  "Numerai",
  "Ocean Protocol",
  "Fetch.ai",
  "Cortex",
  "DeepBrain Chain",
  "Matrix AI Network",
  "Phala Network",
  "Akash Network",
  "RenderToken",
  "Basic Attention Token",
  "Synthetix",
  "Aave",
  "Compound",
  "MakerDAO",
  "Uniswap",
  "Sushiswap",
  "Pancakeswap",
  "Curve Finance",
  "Yearn Finance",
  "Avalanche (DeFi)",
  "Solana (DeFi)",
  "Polygon (DeFi)",
  "Cosmos (DeFi)",
  "Polkadot (DeFi)",
  "Arbitrum",
  "Optimism",
  "ZkSync",
  "StarkWare",
  "ConsenSys",
  "Web3Auth",
  "Moralis",
  "QuickNode",
  "Tatum",
  "Blockdaemon",
  "Coin Metrics",
  "Nansen",
  "Dune Analytics",
  "Glassnode",
  "IntoTheBlock",
  "Kaiko",
  "Messari",
  "Chainalysis",
  "Elliptic",
  "TRM Labs",
  "Coindesk",
  "Cointelegraph",
  "Decrypt",
  "The Block",
  "DL News",
  "Blockworks",
  "Forkast.News",
  "CryptoSlate",
  "Daily Hodl",
  "U.Today",
  "BeInCrypto",
  "CoinGape",
  "Watcher.Guru",
  "Bitcoin Magazine",
  "Ethereum Foundation",
  "Hyperledger",
  "Enterprise Ethereum Alliance",
  "Blockchain Association",
  "Coin Center",
  "Digital Currency Group",
  "Grayscale Investments",
  "Pantera Capital",
  "a16z Crypto",
  "Paradigm",
  "Polychain Capital",
  "Multicoin Capital",
  "Dragonfly Capital",
  "Three Arrows Capital (defunct but influential)",
  "Alameda Research (defunct but influential)",
  "FTX (defunct but influential)",
  "BlockFi (defunct but influential)",
  "Genesis (defunct but influential)",
  "Celsius Network (defunct but influential)",
  "Voyager Digital (defunct but influential)",
  "3Commas",
  "Coinigy",
  "TradingView",
  "BlockFi",
  "Robinhood Crypto",
  "eToro",
  "Plus500",
  "IG",
  "CMC Markets",
  "FXCM",
  "OANDA",
  "Interactive Brokers",
  "Charles Schwab Crypto",
  "Fidelity Digital Assets",
  "State Street Digital",
  "BNY Mellon Digital Assets",
  "Mastercard Crypto",
  "Visa Crypto",
  "PayPal Crypto",
  "Stripe Crypto",
  "Google Cloud Blockchain",
  "AWS Blockchain",
  "IBM Blockchain",
  "Microsoft Azure Blockchain",
  "Alibaba Cloud Blockchain",
  "Tencent Cloud Blockchain",
  "Baidu Blockchain",
  "Huawei Blockchain",
  "SAP Blockchain",
  "Oracle Blockchain",
  "Accenture Blockchain",
  "Deloitte Blockchain",
  "EY Blockchain",
  "KPMG Blockchain",
  "PwC Blockchain",
  "Capgemini Blockchain",
  "Infosys Blockchain",
  "TCS Blockchain",
  "Wipro Blockchain",
  "HCLTech Blockchain",
  "Cognizant Blockchain",
  "DXC Technology Blockchain",
  "Kyndryl Blockchain",
  "Tata Communications Blockchain",
  "NTT DATA Blockchain",
  "Atos Blockchain",
  "World Wide Technology Blockchain",
  "CDW Blockchain",
  "Insight Enterprises Blockchain",
  "Presidio Blockchain",
  "SHI International Blockchain",
  "Softchoice Blockchain",
  "ePlus Blockchain",
  "Trace3 Blockchain",
  "Optiv Blockchain",
  "Rackspace Technology Blockchain",
  "DataDog Blockchain",
  "Splunk Blockchain",
  "New Relic Blockchain",
  "Dynatrace Blockchain",
  "Sumo Logic Blockchain",
  "Elastic Blockchain",
  "Grafana Labs Blockchain",
  "Prometheus Blockchain",
  "Jaeger Blockchain",
  "Zipkin Blockchain",
  "OpenTelemetry Blockchain",
  "Logz.io Blockchain",
  "SolarWinds Blockchain",
  "ManageEngine Blockchain",
  "Opsgenie Blockchain",
  "VictorOps Blockchain",
  "BigPanda Blockchain",
  "Moogsoft Blockchain",
  "ScienceLogic Blockchain",
  "VMware Blockchain",
  "Red Hat Blockchain",
  "SUSE Blockchain",
  "Canonical Blockchain",
  "Mirantis Blockchain",
  "OpenStack Blockchain",
  "Cloud Foundry Blockchain",
  "Kubernetes Blockchain",
  "Docker Blockchain",
  "HashiCorp Blockchain",
  "Ansible Blockchain",
  "Puppet Blockchain",
  "Chef Blockchain",
  "SaltStack Blockchain",
  "Azure DevOps Blockchain",
  "AWS CodeCommit Blockchain",
  "Google Cloud Source Repositories Blockchain",
  "GitHub Blockchain",
  "GitLab Blockchain",
  "Bitbucket Blockchain",
  "Jenkins Blockchain",
  "CircleCI Blockchain",
  "Travis CI Blockchain",
  "GitHub Actions Blockchain",
  "GitLab CI/CD Blockchain",
  "AWS CodeBuild Blockchain",
  "Google Cloud Build Blockchain",
  "Jira Software Blockchain",
  "Confluence Blockchain",
  "Slack Blockchain",
  "Microsoft Teams Blockchain",
  "Zoom Blockchain",
  "Google Meet Blockchain",
  "Cisco Webex Blockchain",
  "RingCentral Blockchain",
  "Twilio Blockchain",
  "SendGrid Blockchain",
  "Mailgun Blockchain",
  "Postmark Blockchain",
  "Customer.io Blockchain",
  "Braze Blockchain",
  "Iterable Blockchain",
  "Segment Blockchain",
  "Mixpanel Blockchain",
  "Amplitude Blockchain",
  "Google Analytics Blockchain",
  "Adobe Analytics Blockchain",
  "Salesforce Blockchain",
  "HubSpot Blockchain",
  "Marketo Blockchain",
  "Pardot Blockchain",
  "Zendesk Blockchain",
  "Intercom Blockchain",
  "Freshdesk Blockchain",
  "Gainsight Blockchain",
  "WalkMe Blockchain",
  "Pendo Blockchain",
  "Appcues Blockchain",
  "DocuSign Blockchain",
  "HelloSign Blockchain",
  "Adobe Sign Blockchain",
  "Dropbox Blockchain",
  "Box Blockchain",
  "SharePoint Blockchain",
  "Notion Blockchain",
  "Asana Blockchain",
  "Trello Blockchain",
  "ClickUp Blockchain",
  "monday.com Blockchain",
  "Smartsheet Blockchain",
  "Airtable Blockchain",
  "Wrike Blockchain",
  "Basecamp Blockchain",
  "Miro Blockchain",
  "Figma Blockchain",
  "Sketch Blockchain",
  "Adobe XD Blockchain",
  "InVision Blockchain",
  "Canva Blockchain",
  "GIMP Blockchain",
  "Blender Blockchain",
  "Autodesk Blockchain",
  "SolidWorks Blockchain",
  "PTC Creo Blockchain",
  "Siemens NX Blockchain",
  "Ansys Blockchain",
  "COMSOL Blockchain",
  "MATLAB Blockchain",
  "Python Blockchain",
  "R Blockchain",
  "Julia Blockchain",
  "SAS Blockchain",
  "SPSS Blockchain",
  "Stata Blockchain",
  "ESRI ArcGIS Blockchain",
  "QGIS Blockchain",
  "Google Maps Blockchain",
  "HERE Technologies Blockchain",
  "Mapbox Blockchain",
  "OpenStreetMap Blockchain",
  "TomTom Blockchain",
  "Garmin Blockchain",
  "Peloton Blockchain",
  "Fitbit Blockchain",
  "Apple Health Blockchain",
  "Google Fit Blockchain",
  "Strava Blockchain",
  "MyFitnessPal Blockchain",
  "Noom Blockchain",
  "Weight Watchers Blockchain",
  "Calm Blockchain",
  "Headspace Blockchain",
  "BetterHelp Blockchain",
  "Talkspace Blockchain",
  "Teladoc Blockchain",
  "Amwell Blockchain",
  "One Medical Blockchain",
  "Oscar Health Blockchain",
  "CVS Health Blockchain",
  "Walgreens Blockchain",
  "Rite Aid Blockchain",
  "Kroger Blockchain",
  "Amazon Pharmacy Blockchain",
  "GoodRx Blockchain",
  "Capsule Blockchain",
  "Hims & Hers Blockchain",
  "Roman Blockchain",
  "Nurx Blockchain",
  "Lemonade Blockchain",
  "Geico Blockchain",
  "Progressive Blockchain",
  "State Farm Blockchain",
  "Allstate Blockchain",
  "Liberty Mutual Blockchain",
  "Travelers Blockchain",
  "Farmers Insurance Blockchain",
  "USAA Blockchain",
  "Nationwide Blockchain",
  "Chubb Blockchain",
  "AIG Blockchain",
  "MetLife Blockchain",
  "Prudential Blockchain",
  "New York Life Blockchain",
  "MassMutual Blockchain",
  "Northwestern Mutual Blockchain",
  "Fidelity Blockchain",
  "Vanguard Blockchain",
  "Charles Schwab Blockchain",
  "E*TRADE Blockchain",
  "TD Ameritrade Blockchain",
  "Robinhood Blockchain",
  "Webull Blockchain",
  "SoFi Blockchain",
  "Personal Capital Blockchain",
  "Mint Blockchain",
  "YNAB Blockchain",
  "Quicken Blockchain",
  "Bill.com Blockchain",
  "Brex Blockchain",
  "Divvy Blockchain",
  "Ramp Blockchain",
  "Expensify Blockchain",
  "Concur Blockchain",
  "TripActions Blockchain",
  "Egencia Blockchain",
  "Booking.com Blockchain",
  "Expedia Blockchain",
  "Airbnb Blockchain",
  "Vrbo Blockchain",
  "HotelTonight Blockchain",
  "Hopper Blockchain",
  "Kayak Blockchain",
  "Google Flights Blockchain",
  "Skyscanner Blockchain",
  "TripAdvisor Blockchain",
  "Yelp Blockchain",
  "OpenTable Blockchain",
  "Resy Blockchain",
  "Grubhub Blockchain",
  "DoorDash Blockchain",
  "Uber Eats Blockchain",
  "Postmates Blockchain",
  "Instacart Blockchain",
  "Shipt Blockchain",
  "GoPuff Blockchain",
  "Amazon Fresh Blockchain",
  "Walmart Grocery Blockchain",
  "Target Shipt Blockchain",
  "Whole Foods Market Blockchain",
  "Trader Joe's Blockchain",
  "Safeway Blockchain",
  "Kroger Delivery Blockchain",
  "HelloFresh Blockchain",
  "Blue Apron Blockchain",
  "Factor Blockchain",
  "Home Chef Blockchain",
  "Gobble Blockchain",
  "Scribd Blockchain",
  "Kindle Blockchain",
  "Audible Blockchain",
  "Libby Blockchain",
  "OverDrive Blockchain",
  "Barnes & Noble Blockchain",
  "Books-A-Million Blockchain",
  "Google Books Blockchain",
  "Project Gutenberg Blockchain",
  "Internet Archive Blockchain",
  "Coursera Blockchain",
  "edX Blockchain",
  "Udemy Blockchain",
  "MasterClass Blockchain",
  "LinkedIn Learning Blockchain",
  "Skillshare Blockchain",
  "Pluralsight Blockchain",
  "Codecademy Blockchain",
  "DataCamp Blockchain",
  "Treehouse Blockchain",
  "Khan Academy Blockchain",
  "Duolingo Blockchain",
  "Babbel Blockchain",
  "Rosetta Stone Blockchain",
  "Memrise Blockchain",
  "Anki Blockchain",
  "Quizlet Blockchain",
  "Chegg Blockchain",
  "Course Hero Blockchain",
  "GradeSaver Blockchain",
  "SparkNotes Blockchain",
  "Cram.com Blockchain",
  "Quizizz Blockchain",
  "Kahoot! Blockchain",
  "Gimkit Blockchain",
  "Desmos Blockchain",
  "Wolfram Alpha Blockchain",
  "Symbolab Blockchain",
  "Photomath Blockchain",
  "Mathway Blockchain",
  "Google Scholar Blockchain",
  "ResearchGate Blockchain",
  "Academia.edu Blockchain",
  "arXiv Blockchain",
  "JSTOR Blockchain",
  "ScienceDirect Blockchain",
  "PubMed Blockchain",
  "Web of Science Blockchain",
  "Scopus Blockchain",
  "Elsevier Blockchain",
  "Springer Nature Blockchain",
  "Wiley Blockchain",
  "Taylor & Francis Blockchain",
  "MIT Press Blockchain",
  "Harvard University Press Blockchain",
  "Oxford University Press Blockchain",
  "Cambridge University Press Blockchain",
  "Stanford University Press Blockchain",
  "Princeton University Press Blockchain",
  "University of Chicago Press Blockchain"
];
for (var i = allComp.length; i < 1000; i++) {
  allComp.push(`Generic Corp ${i}`);
}
var gmn = mkUId();
var CITIBANK_DEMO_BUSINESS_INC = "Citibank demo business Inc";
var FRSck = {
  HI: 80,
  SUSP: 50,
  RVU: 30
};
var CHRsk = {
  CRIT: 85,
  HI: 60,
  MED: 35
};
var PMTt = 30000;
var AIMnLt = 100;
var AIMxLt = 1000;
var MKdPMTsrs = {
  p_alp: {
    id: "p_alp",
    nm: "AlphaPay Gateway Solutions",
    fr: 0.015,
    tLtMs: 500,
    sRt: 0.98,
    sCur: ["USD", "EUR", "GBP", "CAD"],
    sMtd: ["c_crd", "d_crd", "ap_pay"],
    mxDlVl: 5e6
  },
  p_bet: {
    id: "p_bet",
    nm: "Beta Global Bank Transfers",
    fr: 0.008,
    tLtMs: 1200,
    sRt: 0.992,
    sCur: ["USD", "EUR", "JPY", "AUD", "SGD"],
    sMtd: ["b_trf", "sepa", "ach"],
    mxDlVl: 1e7
  },
  p_gam: {
    id: "p_gam",
    nm: "Gamma Crypto & Web3 Payments",
    fr: 0.001,
    tLtMs: 3e3,
    sRt: 0.95,
    sCur: ["BTC", "ETH", "USDT", "SOL"],
    sMtd: ["c_wlt", "w3_gtw"],
    mxDlVl: 2e6
  },
  p_del: {
    id: "p_del",
    nm: "Delta Mobile Wallet Integrations",
    fr: 0.02,
    tLtMs: 200,
    sRt: 0.975,
    sCur: ["USD", "CAD", "MXN"],
    sMtd: ["m_wlt", "qr_pay"],
    mxDlVl: 3e6
  },
  p_eps: {
    id: "p_eps",
    nm: "Epsilon High-Volume Processing",
    fr: 0.01,
    tLtMs: 700,
    sRt: 0.988,
    sCur: ["USD", "EUR"],
    sMtd: ["c_crd", "b_trf"],
    mxDlVl: 15e6
  }
};
var GMN_AI_EP = "/api/gmn-ai";
var HttpCli = function() {
  var p = {
    g: async function(url, q = {}) {
      var u = new URL(url);
      Object.keys(q).forEach(function(k) {
        return u.searchParams.append(k, q[k]);
      });
      return await p.x("GET", u.toString());
    },
    ps: async function(u, b) {
      return await p.x("POST", u, b);
    },
    pt: async function(u, b) {
      return await p.x("PUT", u, b);
    },
    d: async function(u) {
      return await p.x("DELETE", u);
    },
    x: async function(m, u, b = null) {
      await slwPr(AIMnLt, AIMxLt);
      var hd = {
        "Content-Type": "application/json",
        "X-Req-Id": mkUId(),
        "X-Comp-Nm": CITIBANK_DEMO_BUSINESS_INC,
        "X-Ptnr-Nm": rdmS(allComp)
      };
      var o = {
        method: m,
        headers: hd
      };
      if (b) {
        o.body = JSON.stringify(b);
      }
      var r = await fetch(u, o);
      if (!r.ok) {
        var eD = await r.json();
        throw {
          m: eD.m || "Net issue",
          c: eD.c || "NET_ERR",
          s: r.status,
          d: eD.d
        };
      }
      return await r.json();
    }
  };
  return p;
};
var hTtp = HttpCli();
var GMN_AI_Srv = function() {
  var i = this;
  console.log(`\u{1F680} GMN_AI_Srv is LIVE for ${CITIBANK_DEMO_BUSINESS_INC}.`);
  i.frdCk = async function(oD) {
    console.log(`[AI-Core] \u{1F575}\u{FE0F}\u200D\u2642\uFE0F Initializing deep frd analysis for ord: ${oD.id}`);
    try {
      await slwPr(200, 1e3);
      var s = 0;
      var f = [];
      if (oD.amt > 15e3 && oD.cur === "USD") {
        s += 35;
        f.push("hv_trns_abv_th");
      }
      if (oD.uId.includes("nw_usr") && oD.amt > 1e3) {
        s += 25;
        f.push("unusl_frst_trns_val");
      }
      if (oD.dtls && oD.dtls.bnkActHsh === "unvrfd_id_hsh") {
        s += 30;
        f.push("unvrfd_bnfy_info");
      }
      if (oD.mtd === "crypto" && oD.amt > 5e3 && Math.random() < 0.4) {
        s += 45;
        f.push("lrg_cryp_trns_rsk");
      }
      if (Math.random() < 0.1) {
        s += 20;
        f.push("bhv_anm_det");
      }
      s = Math.min(s + Math.floor(Math.random() * 20), 100);
      var st = "cln";
      var rec = "aprv";
      if (s >= FRSck.HI) {
        st = "hi_rsk";
        rec = "dn";
      } else if (s >= FRSck.SUSP) {
        st = "susp";
        rec = "rvu_mnl";
      } else if (s >= FRSck.RVU) {
        st = "rvu_rq";
        rec = "rvu_mnl";
      }
      var r = {
        oId: oD.id,
        s: s,
        st: st,
        f: f,
        rec: rec
      };
      console.log(`[AI-Core] \u{2705} Frd analysis comp for ${oD.id}. Stat: ${r.st}`);
      return r;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err during frd analysis for ${oD.id}:`, e);
      throw new Error(`AI frd analysis fail: ${e.m || "Unkn err"}`);
    }
  };
  i.pstPc = async function(oD) {
    console.log(`[AI-Core] \u{1F501} Foreseeing outcome and lat for ord: ${oD.id}`);
    try {
      await slwPr(300, 800);
      var bT = 1e3;
      var bS = 0.99;
      switch (oD.mtd) {
        case "b_trf":
          bT = 5e3;
          bS = 0.97;
          break;
        case "c_wlt":
          bT = 15e3;
          bS = 0.93;
          break;
        case "m_wlt":
          bT = 300;
          bS = 0.995;
          break;
        case "c_crd":
        default:
          bT = 700;
          bS = 0.985;
      }
      if (oD.amt > 1e4) {
        bT *= 1.8;
        bS -= 0.03;
      }
      var nF = Math.random() * 0.2 + 0.9;
      var pCtMs = Math.floor(bT * nF + Math.random() * 1e3);
      var sPb = fmtDec(Math.min(1, Math.max(0.7, bS + (Math.random() * 0.05 - 0.025))), 4);
      var r = {
        oId: oD.id,
        pCtMs: pCtMs,
        sPb: sPb,
        f: {
          m: oD.mtd,
          amtT: oD.amt > 1e4 ? "hi_val" : "stnd",
          nCgEst: fmtDec(nF, 2)
        }
      };
      console.log(`[AI-Core] \u{2705} Outcome prediction comp for ${oD.id}: ${r.sPb * 100}% suc in ${r.pCtMs}ms.`);
      return r;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err during outcome prediction for ${oD.id}:`, e);
      throw new Error(`AI outcome prediction fail: ${e.m || "Unkn err"}`);
    }
  };
  i.bstPrcsr = async function(oD, aP) {
    console.log(`[AI-Core] \u{1F516} Sug opt pcr for ord: ${oD.id}`);
    try {
      await slwPr(400, 900);
      var bPR = null;
      var hS = -Infinity;
      var eP = Object.values(aP).filter(function(p) {
        return p.sCur.includes(oD.cur) && p.sMtd.includes(oD.mtd);
      });
      if (eP.length === 0) {
        throw new Error("No elig pcr for this fnct mtd or cur cbn.");
      }
      for (var p of eP) {
        var eC = oD.amt * p.fr;
        var eLMs = p.tLtMs;
        var eSRt = p.sRt;
        var cS = eSRt * 1e3 - eC / oD.amt * 500 - eLMs / 200 + Math.random() * 5;
        if (cS > hS) {
          hS = cS;
          bPR = {
            oId: oD.id,
            pId: p.id,
            pNm: p.nm,
            eC: fmtDec(eC, 2),
            eLMs: eLMs,
            eSRt: eSRt,
            r: {
              cmS: fmtDec(cS, 2),
              f: {
                fr: p.fr,
                sRt: p.sRt,
                lt: p.tLtMs,
                cLdEst: Math.random()
              }
            }
          };
        }
      }
      if (!bPR) {
        throw new Error("AI could not dtrm opt pcr rte due to intl scor iss.");
      }
      console.log(`[AI-Core] \u{2705} Opt pcr sug for ${oD.id}: ${bPR.pNm}`);
      return bPR;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err during pcr sug for ${oD.id}:`, e);
      throw new Error(`AI pcr sug fail: ${e.m || "Unkn err"}`);
    }
  };
  i.spclDsc = async function(uId, cO) {
    console.log(`[AI-Core] \u{1F381} Gnr spcl o for usr ${uId}, ord ${cO.id}`);
    try {
      await slwPr(150, 600);
      if (uId.startsWith("usr_lyt_tr_") && cO.amt >= 500) {
        var t = uId.split("_").pop();
        if (t === "gold" && cO.amt >= 750) {
          return {
            id: mkUId(),
            nm: "Elte Gld Lylt Bns",
            d: "Exclsve 7.5% dsc for Gld Tr mem on lrg trns.",
            t: "pct_dsc",
            v: 0.075,
            c: cO.cur,
            eAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1e3),
            tUsrSg: ["gold_tr_usrs", "hi_val_spndrs"]
          };
        } else if (t === "silver" && cO.amt >= 500) {
          return {
            id: mkUId(),
            nm: "Slvr Tr Lylt Rwd",
            d: "Enjy a 3% dsc as a Slvr Tr mem.",
            t: "pct_dsc",
            v: 0.03,
            c: cO.cur,
            eAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            tUsrSg: ["slvr_tr_usrs"]
          };
        }
      }
      if (cO.mtd === "c_wlt" && cO.amt > 100 && Math.random() < 0.25) {
        return {
          id: mkUId(),
          nm: "Cryp PMT Adpt Incent",
          d: `Get ${cO.cur === "USD" ? "$15" : "a sgnfcnt amt"} off your cryp pmt.`,
          t: "fx_dsc",
          v: cO.cur === "USD" ? 15 : 10,
          c: cO.cur,
          eAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3),
          tUsrSg: ["cryp_nw_adptrs"]
        };
      }
      if (cO.amt > 2e3 && Math.random() < 0.1) {
        return {
          id: mkUId(),
          nm: "Prm Trns Ins",
          d: "Cmply trns ins for hi-val ords.",
          t: "fr_shp",
          v: 0,
          c: cO.cur,
          eAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3),
          tUsrSg: ["hi_val_trns_actrs"]
        };
      }
      console.log(`[AI-Core] \u{1F6AB} No spcl o gnr for usr ${uId} for ord ${cO.id}.`);
      return null;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err gnr spcl o for ${uId}:`, e);
      throw new Error(`AI o gnr fail: ${e.m || "Unkn err"}`);
    }
  };
  i.rclRsn = async function(oD, eD) {
    console.log(`[AI-Core] \u{1F978} Rec rcl for fl ord ${oD.id}, err: ${eD.c}`);
    try {
      await slwPr(100, 400);
      if (eD.c === "INSUFFICIENT_FUNDS") {
        return "Sug usr to top-up acnt or swt to a dfrnt pmt mtd with sfc bal.";
      } else if (eD.c === "CARD_DECLINED" || eD.c === "CARD_EXPIRED") {
        return "Adv usr to upd crd dtls, vrfy with bnk, or use an alt crd.";
      } else if (eD.c === "PROCESSOR_TEMPORARY_UNAVAILABLE" || eD.s === 503) {
        var aP = await i.bstPrcsr(oD, MKdPMTsrs);
        return `Prim pcr is tmp unav. Rec rtry aft 5-10 min, or cons usg ${aP.pNm} as an alt.`;
      } else if (eD.c.startsWith("FRAUD")) {
        return "Ord flg for ptnl frd. Esc to frd rvu tm for imm mnl inv. Usr notif pend.";
      } else if (eD.c === "3D_SECURE_FAILED") {
        return "Sug usr rtry the trns and ens cor 3D Sec auth, or cnt their bnk.";
      }
      return "Cnt cstmr sptr with trns ID for spcl ast. Err cd: " + eD.c;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err rec rcl for ${oD.id}:`, e);
      throw new Error(`AI rcl rec fail: ${e.m || "Unkn err"}`);
    }
  };
  i.flgAnm = async function(trns) {
    console.log(`[AI-Core] \u{1F6A8} Det anm in a bth of ${trns.length} trns.`);
    try {
      await slwPr(500, 1500);
      var aOId = [];
      trns.forEach(function(o) {
        var iAS = o.amt > 1e5 || o.amt < 5 && o.amt > 0;
        var iMR = Math.random() < 0.05 && !o.uId.includes("xplr");
        var iHFLV = o.amt < 100 && Math.random() < 0.03;
        if (iAS || iMR || iHFLV) {
          aOId.push(o.id);
        }
      });
      console.log(`[AI-Core] \u{2705} Det ${aOId.length} anm.`);
      return aOId;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err det anm:`, e);
      throw new Error(`AI anm det fail: ${e.m || "Unkn err"}`);
    }
  };
  i.grpBth = async function(pOs, oG = "c_rdc") {
    console.log(`[AI-Core] \u{1F4CA} Opt bth of ${pOs.length} ords for ${oG}.`);
    try {
      await slwPr(700, 2e3);
      if (pOs.length < 2) {
        return {
          oBId: [],
          eS: 0,
          oS: "no_bth_ndd"
        };
      }
      var oBId = [];
      var eS = 0;
      var gO = pOs.reduce(function(a, o) {
        var k = `${o.pRt || "unkn_pcr"}-${o.cur}`;
        if (!a[k]) a[k] = [];
        a[k].push(o);
        return a;
      }, {});
      for (var k in gO) {
        var g = gO[k];
        if (g.length > 1) {
          eS += Math.random() * 5 * g.length;
          g.forEach(function(o) {
            return oBId.push(o.id);
          });
        } else if (oG === "s_pry") {
          oBId.push(g[0].id);
        }
      }
      console.log(`[AI-Core] \u{2705} Bth opt comp. Opt ${oBId.length} ords.`);
      return {
        oBId: oBId,
        eS: fmtDec(eS, 2),
        oS: oG
      };
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err during bth opt:`, e);
      throw new Error(`AI bth opt fail: ${e.m || "Unkn err"}`);
    }
  };
  i.usrExLvl = async function(uId, uRO) {
    console.log(`[AI-Core] \u{1F4C9} Prc chn rsk for usr: ${uId}`);
    try {
      await slwPr(250, 800);
      var cS = 0;
      var f = [];
      var fO = uRO.filter(function(o) {
        return o.st === "fl" || o.st === "dn_frd";
      });
      if (fO.length > 2) {
        cS += 40;
        f.push("mlt_rcnt_pmt_fl");
      } else if (fO.length > 0) {
        cS += 20;
        f.push("rcnt_pmt_fl");
      }
      var hVO = uRO.filter(function(o) {
        return o.amt > 1e4;
      });
      if (hVO.length === 0 && uRO.length > 5) {
        cS += 10;
        f.push("no_rcnt_hv_trns");
      }
      if (uRO.length === 0) {
        cS += 50;
        f.push("no_rcnt_pmt_act");
      }
      if (Math.random() < 0.15) {
        cS += 15;
        f.push("unusl_lgn_ptns");
      }
      cS = Math.min(cS + Math.floor(Math.random() * 10), 100);
      var rL = "lw";
      var rA = "mntr_bhv";
      if (cS >= CHRsk.CRIT) {
        rL = "crit";
        rA = "pr_ps_outrch_hv_ofr";
      } else if (cS >= CHRsk.HI) {
        rL = "hi";
        rA = "s_targ_rtn_ofr";
      } else if (cS >= CHRsk.MED) {
        rL = "med";
        rA = "s_eng_ndg";
      }
      var r = {
        uId: uId,
        cS: cS,
        rL: rL,
        f: f,
        rA: rA
      };
      console.log(`[AI-Core] \u{2705} Chn rsk prcn for ${uId}: ${r.rL} (${r.cS})`);
      return r;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err prc chn rsk for ${uId}:`, e);
      throw new Error(`AI chn prcn fail: ${e.m || "Unkn err"}`);
    }
  };
  i.rptCmpl = async function(trns, sD, eD) {
    console.log(`[AI-Core] \u{1F4DC} Gnr AI-pwr cmp rpt for ${sD.toISOString()} to ${eD.toISOString()}`);
    try {
      await slwPr(1e3, 3e3);
      var iC = {
        "hi_rsk_trns_flg": 0,
        "unusl_act_cntry": 0,
        "msng_kyc_lrg_trf": 0,
        "pcr_fe_dsc": 0,
        "ptnl_aml_ptn": 0,
        "ge_loc_mism": 0,
        "trns_out_of_hrs": 0,
        "susp_mchnt_id": 0,
        "src_of_fnd_uncl": 0,
        "id_vrf_fail": 0
      };
      var fT = [];
      trns.forEach(function(o) {
        if (o.fD && o.fD.st === "hi_rsk") {
          iC.hi_rsk_trns_flg++;
          fT.push({
            id: o.id,
            rs: "Hi frd rsk"
          });
        }
        if (o.amt > 5e4 && !o.uId.includes("vrfd_kyc")) {
          iC.msng_kyc_lrg_trf++;
          fT.push({
            id: o.id,
            rs: "Ptnl KYC viol for lrg amt"
          });
        }
        if (o.cur === "BTC" && o.amt > 1e3 && Math.random() < 0.02) {
          iC.ptnl_aml_ptn++;
          fT.push({
            id: o.id,
            rs: "Ptnl AML ptn idf"
          });
        }
        if (Math.random() < 0.01) {
          iC.ge_loc_mism++;
          fT.push({
            id: o.id,
            rs: "Geoloc mismatch susp"
          });
        }
        if (new Date(o.cAt).getHours() < 6 && new Date(o.cAt).getHours() > 22 && Math.random() < 0.03) {
          iC.trns_out_of_hrs++;
          fT.push({
            id: o.id,
            rs: "Trns outside std biz hrs"
          });
        }
      });
      var sM = `AI analysis det ${Object.values(iC).reduce(function(a2, b) {
        return a2 + b;
      }, 0)} ptnl cmp iss across ${trns.length} trns btn ${sD.toDateString()} and ${eD.toDateString()}. Key for rvu inc hi-rsk trns and ptnl KYC gps.`;
      var r = {
        rId: mkUId(),
        gAt: new Date(),
        sm: sM,
        iC: iC,
        fT: fT.slice(0, 10),
        sD: sD,
        eD: eD
      };
      console.log(`[AI-Core] \u{2705} Cmp rpt gnr for per. Tot iss: ${Object.values(iC).reduce(function(a2, b) {
        return a2 + b;
      }, 0)}`);
      return r;
    } catch (e) {
      console.error(`[AI-Core] \u{274C} Err gnr cmp rpt:`, e);
      throw new Error(`AI cmp rpt gnr fail: ${e.m || "Unkn err"}`);
    }
  };
  i.trnsGphAnls = async function(oD) {
    console.log(`[AI-Core] \u{1F50E} Exec trns gph anls for ord: ${oD.id}`);
    await slwPr(300, 1200);
    var gR = Math.random();
    var fP = [];
    if (gR < 0.2) {
      fP.push("susp_conn_net");
    }
    if (gR > 0.8) {
      fP.push("cln_conn_net");
    }
    return {
      oId: oD.id,
      gSn: fmtDec(gR, 3),
      fP: fP
    };
  };
  i.devFgp = async function(oD) {
    console.log(`[AI-Core] \u{1F4BB} Perfrm dev fgp for ord: ${oD.id}`);
    await slwPr(100, 500);
    var fgpHsh = mkUId();
    var c = rdmS(["mobile", "desktop", "tablet"]);
    var oS = rdmS(["iOS", "Android", "Windows", "MacOS", "Linux"]);
    var brw = rdmS(["Chrome", "Firefox", "Safari", "Edge"]);
    var iP = rdmS(["192.168.1.1", "10.0.0.5", "172.16.0.10"]);
    var vS = Math.random() < 0.05 ? "hi_rsk" : "cln";
    return {
      oId: oD.id,
      fgpHsh: fgpHsh,
      c: c,
      oS: oS,
      brw: brw,
      iP: iP,
      vS: vS
    };
  };
  i.cusLftmVal = async function(uId) {
    console.log(`[AI-Core] \u{1F4B8} Prc cus lftm val for usr: ${uId}`);
    await slwPr(200, 700);
    var pCLV = fmtDec(Math.random() * 5000 + 100, 2);
    var seg = rdmS(["hi_val", "med_val", "lw_val", "new_usr"]);
    var r = {
      uId: uId,
      pCLV: pCLV,
      seg: seg,
      c: Math.random() < 0.1 ? "at_rsk" : "stbl"
    };
    return r;
  };
  i.sntmtAnlFdbk = async function(uId, fbk) {
    console.log(`[AI-Core] \u{1F60D} Anl sntmt for usr: ${uId} fdbk: "${fbk.substring(0, 20)}..."`);
    await slwPr(150, 600);
    var s = Math.random();
    var p = s > 0.7 ? "ps" : s < 0.3 ? "ng" : "nt";
    return {
      uId: uId,
      fbk: fbk,
      s: s,
      p: p
    };
  };
  i.prsnRecEng = async function(uId, ctg) {
    console.log(`[AI-Core] \u{1F389} Gnr prsn recs for usr: ${uId} in ctg: ${ctg}`);
    await slwPr(200, 800);
    var rI = [];
    for (var j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
      rI.push(`RecItem_${mkUId().substring(0, 8)}`);
    }
    return {
      uId: uId,
      ctg: ctg,
      rI: rI,
      c: rdmS(allComp)
    };
  };
  i.frdPtnEvlTrkr = async function() {
    console.log(`[AI-Core] \u{1F50D} Trk frd ptn evl.`);
    await slwPr(1e3, 3e3);
    var nPtn = [];
    for (var j = 0; j < Math.floor(Math.random() * 3); j++) {
      nPtn.push(`Frd_${mkUId().substring(0, 8)}`);
    }
    return {
      lstDt: new Date(),
      nPtn: nPtn,
      lvl: rdmS(["low", "med", "hi"])
    };
  };
  i.regChgImpAnlzr = async function(rc) {
    console.log(`[AI-Core] \u{1F4CA} Anl reg chg imp for: ${rc}`);
    await slwPr(500, 1500);
    var impLvl = rdmS(["low", "med", "hi", "crit"]);
    var afA = [];
    if (impLvl === "hi" || impLvl === "crit") {
      afA.push(`PmtsSlice-${rc.substring(0, 5)}`);
    }
    return {
      rc: rc,
      impLvl: impLvl,
      afA: afA,
      recAc: `RvCmpPol for ${impLvl} imp.`
    };
  };
  i.intAgtRtg = async function(tI) {
    console.log(`[AI-Core] \u{1F500} Int agt rtg for tkt ${tI.id}`);
    await slwPr(100, 400);
    var rtg = rdmS(["Frd_Team", "Cmp_Dept", "Tech_Spt", "Gen_Inq"]);
    var estRs = Math.floor(Math.random() * 10) + 1;
    return {
      tId: tI.id,
      rtg: rtg,
      estRs: `${estRs} min`
    };
  };
  i.mltiRskEval = async function(oD, uC) {
    console.log(`[AI-Core] \u{1F52C} Mlti-rsk eval for ord: ${oD.id} and usr: ${uC.uId}`);
    await slwPr(400, 1500);
    var fR = await i.frdCk(oD);
    var cR = await i.usrExLvl(uC.uId, uC.uRO);
    var cS = (fR.s + cR.cS) / 2;
    var ovrR = "lw";
    if (cS > 70) ovrR = "hi";
    else if (cS > 40) ovrR = "med";
    return {
      oId: oD.id,
      uId: uC.uId,
      fR: fR,
      cR: cR,
      ovrS: cS,
      ovrR: ovrR,
      comp: rdmS(allComp)
    };
  };
  i.dynmicPrcOpt = async function(pId, bPrc, vol) {
    console.log(`[AI-Core] \u{1F4B0} Dynmc prc opt for pId: ${pId}, basePrc: ${bPrc}, vol: ${vol}`);
    await slwPr(300, 800);
    var pChg = Math.random() * 0.1 - 0.05;
    var nPrc = fmtDec(bPrc * (1 + pChg), 2);
    return {
      pId: pId,
      oPrc: bPrc,
      nPrc: nPrc,
      r: pChg > 0 ? "inc_mrg" : "inc_vol",
      part: rdmS(allComp)
    };
  };
};
var gmnAI = new GMN_AI_Srv();
var fnctOrds = mkEntSli(
  "fnct_ords",
  "/fnct_ords",
  function(st) {
    return st.fnctOrds;
  }, {
    i: {
      usrChnSk: {},
      isAnmDetLdg: false,
      anmDetErr: null,
      isBthOptLdg: false,
      bthOptErr: null,
      cmpRptLdg: false,
      cmpRptErr: null,
      ltstCmpRpt: null,
      aiPerfMet: {
        frdAcc: 0.95,
        rtgEff: 0.98,
        ofrCnv: 0.1,
        lstUpd: new Date().toISOString()
      },
      extSysSts: {
        plaid: "oprt",
        sfrc: "oprt",
        ora: "maint"
      }
    },
    e: function(b) {
      b.addCase(strtFnctPrs.p, function(st, a) {
        var tOId = a.m.a.id || mkUId();
        st.e[tOId] = {
          ...a.m.a,
          id: tOId,
          st: "p_ai_rvu",
          cAt: new Date().toISOString(),
          uAt: new Date().toISOString(),
          isLdg: true,
          err: null
        };
        st.c.push(tOId);
      }).addCase(strtFnctPrs.f, function(st, a) {
        var {
          oId: oId2,
          uO: uO2
        } = a.p;
        if (st.e[oId2]) {
          st.e[oId2] = { ...st.e[oId2],
            ...uO2,
            isLdg: false,
            err: null
          };
        } else {
          st.e[oId2] = { ...uO2,
            isLdg: false,
            err: null
          };
        }
      }).addCase(strtFnctPrs.r, function(st, a) {
        var oId2 = a.m.a.id;
        if (st.e[oId2]) {
          st.e[oId2].st = "fl";
          st.e[oId2].isLdg = false;
          st.e[oId2].err = a.e.m || "Fl to strt AI-pwr pmt.";
        }
        console.error("Crit: strtFnctPrs rj, but ord not fnd to upd st:", oId2, a.e);
      }).addCase(chkFrd.p, function(st, a) {
        var oId2 = a.m.a;
        if (st.e[oId2]) {
          st.e[oId2].fD = {
            st: "chck",
            s: 0,
            f: []
          };
          st.e[oId2].isLdg = true;
          st.e[oId2].err = null;
        }
      }).addCase(chkFrd.f, function(st, a) {
        var {
          oId: oId2,
          r: r2
        } = a.p;
        if (st.e[oId2]) {
          st.e[oId2].fD = r2;
          if (r2.st === "hi_rsk" || r2.st === "susp" || r2.st === "rvu_rq") {
            st.e[oId2].st = "frd_rvu";
          }
          st.e[oId2].isLdg = false;
          st.e[oId2].err = null;
        }
      }).addCase(chkFrd.r, function(st, a) {
        var oId2 = a.m.a;
        if (st.e[oId2]) {
          st.e[oId2].fD = {
            st: "err",
            s: 0,
            f: ["ai_err"]
          };
          st.e[oId2].isLdg = false;
          st.e[oId2].err = a.e.m || "Frd det fl.";
        }
      }).addCase(foreseeFnct.p, function(st, a) {
        var oId2 = a.m.a;
        if (st.e[oId2]) {
          st.e[oId2].pD = {
            ldg: true
          };
          st.e[oId2].err = null;
        }
      }).addCase(foreseeFnct.f, function(st, a) {
        var {
          oId: oId2,
          r: r2
        } = a.p;
        if (st.e[oId2]) {
          st.e[oId2].pD = { ...r2,
            ldg: false
          };
          st.e[oId2].err = null;
        }
      }).addCase(foreseeFnct.r, function(st, a) {
        var oId2 = a.m.a;
        if (st.e[oId2]) {
          st.e[oId2].pD = {
            err: a.e.m,
            ldg: false
          };
          st.e[oId2].err = a.e.m || "Fl to prc pmt dt.";
        }
      }).addCase(adptPrc.p, function(st, a) {
        var oId2 = a.m.a.oId;
        if (st.e[oId2]) {
          st.e[oId2].aO = {
            ldg: true
          };
          st.e[oId2].err = null;
        }
      }).addCase(adptPrc.f, function(st, a) {
        var {
          oId: oId2,
          o: o2
        } = a.p;
        if (st.e[oId2]) {
          st.e[oId2].aO = o2 ? { ...o2,
            ldg: false
          } : null;
          if (o2) {
            var nA = st.e[oId2].amt;
            if (o2.t === "pct_dsc") {
              nA -= nA * o2.v;
            } else if (o2.t === "fx_dsc") {
              nA -= o2.v;
            }
            st.e[oId2].amt = fmtDec(nA, 2);
          }
          st.e[oId2].err = null;
        }
      }).addCase(adptPrc.r, function(st, a) {
        var oId2 = a.m.a.oId;
        if (st.e[oId2]) {
          st.e[oId2].aO = {
            err: a.e.m,
            ldg: false
          };
          st.e[oId2].err = a.e.m || "Fl to apl dyn p.";
        }
      }).addCase(hndlFnctFl.p, function(st, a) {
        var oId2 = a.m.a.oId;
        if (st.e[oId2]) {
          st.e[oId2].isLdg = true;
          st.e[oId2].err = null;
        }
      }).addCase(hndlFnctFl.f, function(st, a) {
        var {
          oId: oId2,
          rec: rec2
        } = a.p;
        if (st.e[oId2]) {
          st.e[oId2].st = "fl_ai_rvd";
          st.e[oId2].aIFlRec = rec2;
          st.e[oId2].isLdg = false;
          st.e[oId2].err = null;
        }
      }).addCase(hndlFnctFl.r, function(st, a) {
        var oId2 = a.m.a.oId;
        if (st.e[oId2]) {
          st.e[oId2].isLdg = false;
          st.e[oId2].err = a.e.m || "Fl to gt AI rcl rec.";
        }
      }).addCase(chkUnusl.p, function(st) {
        st.isAnmDetLdg = true;
        st.anmDetErr = null;
      }).addCase(chkUnusl.f, function(st, a) {
        var {
          aOId: aOId2
        } = a.p;
        aOId2.forEach(function(oId2) {
          if (st.e[oId2]) {
            st.e[oId2].st = "anm_det";
            st.e[oId2].fD = {
              st: "anm_det",
              s: 99,
              f: ["pmt_anm_det_by_ai"]
            };
            console.warn(`\u{1F6A8} Anm det and flg for ord: ${oId2}`);
          }
        });
        st.isAnmDetLdg = false;
        st.anmDetErr = null;
      }).addCase(chkUnusl.r, function(st, a) {
        st.isAnmDetLdg = false;
        st.anmDetErr = a.e.m || "Bth anm det fl.";
      }).addCase(maxBth.p, function(st) {
        st.isBthOptLdg = true;
        st.bthOptErr = null;
      }).addCase(maxBth.f, function(st, a) {
        var {
          oBId: oBId2,
          eS: eS2,
          oS: oS2
        } = a.p;
        console.log(`[Rdcr] Bth opt apl. Est sav: $${eS2}`);
        oBId2.forEach(function(oId2) {
          if (st.e[oId2]) {
            st.e[oId2].st = "bth_for_prs";
            st.e[oId2].bI = {
              s: oS2,
              sv: fmtDec(eS2 / oBId2.length, 2)
            };
          }
        });
        st.isBthOptLdg = false;
        st.bthOptErr = null;
      }).addCase(maxBth.r, function(st, a) {
        st.isBthOptLdg = false;
        st.bthOptErr = a.e.m || "Bth opt fl.";
      }).addCase(evalUsrEx.p, function(st, a) {
        var uId = a.m.a.uId;
        st.usrChnSk = {
          ...st.usrChnSk,
          [uId]: { ...(st.usrChnSk[uId] || {}),
            isLdg: true,
            err: null
          }
        };
      }).addCase(evalUsrEx.f, function(st, a) {
        var {
          uId: uId2,
          r: r2
        } = a.p;
        st.usrChnSk = { ...st.usrChnSk,
          [uId2]: { ...r2,
            isLdg: false,
            err: null
          }
        };
      }).addCase(evalUsrEx.r, function(st, a) {
        var uId = a.m.a.uId;
        st.usrChnSk = {
          ...st.usrChnSk,
          [uId]: { ...(st.usrChnSk[uId] || {}),
            isLdg: false,
            err: a.e.m || "Fl to eval chn rsk."
          }
        };
      }).addCase(genCmpRpt.p, function(st) {
        st.cmpRptLdg = true;
        st.cmpRptErr = null;
        st.ltstCmpRpt = null;
      }).addCase(genCmpRpt.f, function(st, a) {
        st.ltstCmpRpt = a.p;
        st.cmpRptLdg = false;
        st.cmpRptErr = null;
      }).addCase(genCmpRpt.r, function(st, a) {
        st.cmpRptLdg = false;
        st.cmpRptErr = a.e.m || "Fl to gnr AI cmp rpt.";
      }).addCase(trnsGphAnls.p, function(st, a) {
        var oId2 = a.m.a;
        if (st.e[oId2]) {
          st.e[oId2].gD = {
            ldg: true
          };
        }
      }).addCase(trnsGphAnls.f, function(st, a) {
        var {
          oId: oId2,
          gSn,
          fP
        } = a.p;
        if (st.e[oId2]) {
          st.e[oId2].gD = {
            gSn,
            fP,
            ldg: false
          };
        }
      }).addCase(devFgp.p, function(st, a) {
        var oId2 = a.m.a;
        if (st.e[oId2]) {
          st.e[oId2].devMeta = {
            ldg: true
          };
        }
      }).addCase(devFgp.f, function(st, a) {
        var {
          oId: oId2,
          fgpHsh,
          c,
          oS,
          brw,
          iP,
          vS
        } = a.p;
        if (st.e[oId2]) {
          st.e[oId2].devMeta = {
            fgpHsh,
            c,
            oS,
            brw,
            iP,
            vS,
            ldg: false
          };
          if (vS === "hi_rsk") {
            st.e[oId2].st = "frd_rvu";
            st.e[oId2].fD = {
              st: "hi_rsk",
              s: 90,
              f: ["dev_fgp_hi_rsk"]
            };
          }
        }
      }).addCase(cusLftmVal.p, function(st, a) {
        var uId = a.m.a;
        st.usrChnSk = {
          ...st.usrChnSk,
          [uId]: { ...(st.usrChnSk[uId] || {}),
            isLdgCLV: true
          }
        };
      }).addCase(cusLftmVal.f, function(st, a) {
        var {
          uId: uId2,
          pCLV,
          seg,
          c
        } = a.p;
        st.usrChnSk = {
          ...st.usrChnSk,
          [uId2]: { ...(st.usrChnSk[uId2] || {}),
            pCLV,
            seg,
            c,
            isLdgCLV: false
          }
        };
      }).addCase(sntmtAnlFdbk.p, function(st, a) {
        var {
          uId,
          fbk
        } = a.m.a;
        st.usrSntmt = { ...(st.usrSntmt || {}),
          [uId]: {
            fbk,
            ldg: true
          }
        };
      }).addCase(sntmtAnlFdbk.f, function(st, a) {
        var {
          uId,
          fbk,
          s,
          p
        } = a.p;
        st.usrSntmt = { ...(st.usrSntmt || {}),
          [uId]: {
            fbk,
            s,
            p,
            ldg: false
          }
        };
      }).addCase(prsnRecEng.p, function(st, a) {
        var {
          uId,
          ctg
        } = a.m.a;
        st.usrRec = { ...(st.usrRec || {}),
          [uId]: {
            ctg,
            ldg: true
          }
        };
      }).addCase(prsnRecEng.f, function(st, a) {
        var {
          uId,
          ctg,
          rI,
          c
        } = a.p;
        st.usrRec = { ...(st.usrRec || {}),
          [uId]: {
            ctg,
            rI,
            c,
            ldg: false
          }
        };
      }).addCase(frdPtnEvlTrkr.p, function(st) {
        st.aiPerfMet.frdTrkLdg = true;
      }).addCase(frdPtnEvlTrkr.f, function(st, a) {
        var {
          lstDt,
          nPtn,
          lvl
        } = a.p;
        st.aiPerfMet.frdTrk = {
          lstDt,
          nPtn,
          lvl
        };
        st.aiPerfMet.frdTrkLdg = false;
      }).addCase(regChgImpAnlzr.p, function(st, a) {
        var rc = a.m.a;
        st.cmpRegImp = { ...(st.cmpRegImp || {}),
          [rc]: {
            ldg: true
          }
        };
      }).addCase(regChgImpAnlzr.f, function(st, a) {
        var {
          rc,
          impLvl,
          afA,
          recAc
        } = a.p;
        st.cmpRegImp = { ...(st.cmpRegImp || {}),
          [rc]: {
            impLvl,
            afA,
            recAc,
            ldg: false
          }
        };
      }).addCase(intAgtRtg.p, function(st, a) {
        var tId = a.m.a.id;
        st.agtRtg = { ...(st.agtRtg || {}),
          [tId]: {
            ldg: true
          }
        };
      }).addCase(intAgtRtg.f, function(st, a) {
        var {
          tId,
          rtg,
          estRs
        } = a.p;
        st.agtRtg = { ...(st.agtRtg || {}),
          [tId]: {
            rtg,
            estRs,
            ldg: false
          }
        };
      }).addCase(mltiRskEval.p, function(st, a) {
        var {
          oD,
          uC
        } = a.m.a;
        st.mltRSk = { ...(st.mltRSk || {}),
          [`${oD.id}-${uC.uId}`]: {
            ldg: true
          }
        };
      }).addCase(mltiRskEval.f, function(st, a) {
        var {
          oId: oId2,
          uId: uId2,
          fR,
          cR,
          ovrS,
          ovrR,
          comp
        } = a.p;
        st.mltRSk = { ...(st.mltRSk || {}),
          [`${oId2}-${uId2}`]: {
            fR,
            cR,
            ovrS,
            ovrR,
            comp,
            ldg: false
          }
        };
      }).addCase(dynmicPrcOpt.p, function(st, a) {
        var {
          pId
        } = a.m.a;
        st.dynPrc = { ...(st.dynPrc || {}),
          [pId]: {
            ldg: true
          }
        };
      }).addCase(dynmicPrcOpt.f, function(st, a) {
        var {
          pId,
          oPrc,
          nPrc,
          r,
          part
        } = a.p;
        st.dynPrc = { ...(st.dynPrc || {}),
          [pId]: {
            oPrc,
            nPrc,
            r,
            part,
            ldg: false
          }
        };
      });
    }
  }
);
var strtFnctPrs = mkAsyPcs(
  "fnctOrds/strtFnctPrs", {
    fn: async function(nOD, {
      d,
      gt,
      rj
    }) {
      try {
        var oId = nOD.id || mkUId();
        var o = {
          ...nOD,
          id: oId,
          st: "p_ai_rvu",
          cAt: new Date().toISOString(),
          uAt: new Date().toISOString(),
          fD: null,
          pRt: null,
          aO: null,
          pD: null,
          isLdg: true,
          err: null
        };
        console.log(`[Flow] \u{1F680} Strting AI-pwr prs for nw ord: ${o.id}`);
        var fR = await gmnAI.frdCk(o);
        o.fD = fR;
        o.uAt = new Date().toISOString();
        if (fR.rec === "dn" || fR.st === "hi_rsk") {
          o.st = "dn_frd";
          d(fnctOrds.sli.a.updO({
            id: o.id,
            chg: o
          }));
          console.warn(`[Flow] Ord ${o.id} DN due to hi frd rsk.`);
          throw rj({
            m: "Pmt dn due to hi frd rsk det by AI.",
            c: "FRD_DN",
            s: 403,
            d: fR
          });
        } else if (fR.rec === "rvu_mnl" || fR.st === "susp" || fR.st === "rvu_rq") {
          o.st = "frd_rvu";
          d(fnctOrds.sli.a.updO({
            id: o.id,
            chg: o
          }));
          console.warn(`[Flow] Ord ${o.id} flg for mnl frd rvu. Pcd with ctn.`);
        }
        var pR = await gmnAI.bstPrcsr(o, MKdPMTsrs);
        o.pRt = pR.pId;
        o.uAt = new Date().toISOString();
        console.log(`[Flow] Ord ${o.id} rtd to pcr: ${o.pRt}`);
        var pO = await gmnAI.spclDsc(o.uId, o);
        if (pO) {
          o.aO = pO;
          if (pO.t === "pct_dsc") {
            o.amt -= o.amt * pO.v;
          } else if (pO.t === "fx_dsc") {
            o.amt -= pO.v;
          }
          o.amt = fmtDec(o.amt, 2);
          console.log(`[Flow] Apl spcl o to ord ${o.id}. Nw amt: ${o.amt} ${o.cur}`);
        }
        o.uAt = new Date().toISOString();
        var p = await gmnAI.pstPc(o);
        o.pD = p;
        o.uAt = new Date().toISOString();
        console.log(`[Flow] Ord ${o.id} prc: ${p.sPb * 100}% suc in ${p.pCtMs}ms.`);
        o.st = "prs";
        d(fnctOrds.sli.a.updO({
          id: o.id,
          chg: o
        }));
        console.log(`[Flow] Sim act pmt via ${o.pRt} for ord ${o.id}...`);
        await new Promise(function(r) {
          return setTimeout(r, p.pCtMs);
        });
        if (Math.random() < p.sPb) {
          o.st = "comp";
          console.log(`[Flow] Pmt for ord ${o.id} COMP suc.`);
        } else {
          o.st = "fl";
          console.error(`[Flow] Sim pmt for ord ${o.id} FL.`);
          throw rj({
            m: "Sim pmt prs fl aft AI opt.",
            c: "SIM_PRS_FL",
            s: 500
          });
        }
        o.uAt = new Date().toISOString();
        d(fnctOrds.sli.a.updO({
          id: o.id,
          chg: o
        }));
        console.log(`[Flow] Fin st of pmt ord ${o.id} aft ful AI int:`, o.st);
        return {
          oId: o.id,
          uO: o
        };
      } catch (e) {
        console.error(`[Flow] \u{274C} Crit fl in AI-pwr pmt prs for ord ${nOD.id}:`, e);
        var aE = e.m ? {
          m: e.m,
          c: e.c || "UNKN_AI_FLOW_ERR",
          s: e.s || 500,
          d: e.d
        } : {
          m: "An unxp err occ during AI pmt prs.",
          c: "UNXP_ERR",
          s: 500
        };
        var oTUId = nOD.id || e.m && e.m.a && e.m.a.id;
        if (oTUId && d && fnctOrds.sli.a.updO) {
          d(fnctOrds.sli.a.updO({
            id: oTUId,
            chg: {
              st: "fl",
              err: aE.m,
              isLdg: false,
              uAt: new Date().toISOString()
            }
          }));
        }
        return rj(aE);
      }
    },
    rI: gmn
  }
);
var chkFrd = mkAsyPcs(
  "fnctOrds/chkFrd", {
    fn: async function(oId, {
      gt,
      rj
    }) {
      try {
        var st = gt();
        var o = fnctOrdsSl.slBI(st, oId);
        if (!o) {
          throw new Error(`Ord with ID ${oId} not fnd for frd det.`);
        }
        var fR = await gmnAI.frdCk(o);
        return {
          oId: oId,
          r: fR
        };
      } catch (e) {
        console.error(`[Thk] \u{274C} Frd det fl for ord ${oId}:`, e);
        return rj(e.m || "Fl to per frd det.");
      }
    },
    rI: gmn
  }
);
var foreseeFnct = mkAsyPcs(
  "fnctOrds/foreseeFnct", {
    fn: async function(oId, {
      gt,
      rj
    }) {
      try {
        var st = gt();
        var o = fnctOrdsSl.slBI(st, oId);
        if (!o) {
          throw new Error(`Ord with ID ${oId} not fnd for prcn.`);
        }
        var pR = await gmnAI.pstPc(o);
        return {
          oId: oId,
          r: pR
        };
      } catch (e) {
        console.error(`[Thk] \u{274C} Pmt dt prcn fl for ord ${oId}:`, e);
        return rj(e.m || "Fl to prc pmt dt.");
      }
    },
    rI: gmn
  }
);
var adptPrc = mkAsyPcs(
  "fnctOrds/adptPrc", {
    fn: async function({
      oId,
      uId
    }, {
      gt,
      rj
    }) {
      try {
        var st = gt();
        var o = fnctOrdsSl.slBI(st, oId);
        if (!o) {
          throw new Error(`Ord with ID ${oId} not fnd for dyn p.`);
        }
        var o2 = await gmnAI.spclDsc(uId, o);
        return {
          oId: oId,
          o: o2
        };
      } catch (e) {
        console.error(`[Thk] \u{274C} Dyn p apl fl for ord ${oId}:`, e);
        return rj(e.m || "Fl to apl dyn p.");
      }
    },
    rI: gmn
  }
);
var hndlFnctFl = mkAsyPcs(
  "fnctOrds/hndlFnctFl", {
    fn: async function({
      oId,
      eD
    }, {
      gt,
      rj
    }) {
      try {
        var st = gt();
        var o = fnctOrdsSl.slBI(st, oId);
        if (!o) {
          throw new Error(`Ord with ID ${oId} not fnd for AI fl anls.`);
        }
        var r = await gmnAI.rclRsn(o, eD);
        return {
          oId: oId,
          rec: r
        };
      } catch (e) {
        console.error(`[Thk] \u{274C} AI rcl rec fl for ord ${oId}:`, e);
        return rj(e.m || "Fl to gt AI rcl rec.");
      }
    },
    rI: gmn
  }
);
var chkUnusl = mkAsyPcs(
  "fnctOrds/chkUnusl", {
    fn: async function(_, {
      gt,
      rj
    }) {
      try {
        var st = gt();
        var aO = fnctOrdsSl.slA(st);
        if (aO.length === 0) {
          console.log("[Thk] No pmt ords avl to chk for anm.");
          return {
            aOId: []
          };
        }
        var aOId = await gmnAI.flgAnm(aO);
        return {
          aOId: aOId
        };
      } catch (e) {
        console.error(`[Thk] \u{274C} Bth anm det fl:`, e);
        return rj(e.m || "Fl to det anm pmts.");
      }
    },
    rI: gmn
  }
);
var maxBth = mkAsyPcs(
  "fnctOrds/maxBth", {
    fn: async function({
      pOs,
      oG
    }, {
      rj
    }) {
      try {
        if (!pOs || pOs.length === 0) {
          return {
            oBId: [],
            eS: 0,
            oS: "no_bth_ndd"
          };
        }
        var r = await gmnAI.grpBth(pOs, oG);
        return r;
      } catch (e) {
        console.error(`[Thk] \u{274C} Fl to opt pend pmts:`, e);
        return rj(e.m || "Fl to opt pend pmts.");
      }
    },
    rI: gmn
  }
);
var evalUsrEx = mkAsyPcs(
  "fnctOrds/evalUsrEx", {
    fn: async function({
      uId,
      uRO
    }, {
      rj
    }) {
      try {
        var r = await gmnAI.usrExLvl(uId, uRO);
        return {
          uId: uId,
          r: r
        };
      } catch (e) {
        console.error(`[Thk] \u{274C} Fl to eval usr chn rsk for ${uId}:`, e);
        return rj(e.m || "Fl to eval usr chn rsk.");
      }
    },
    rI: gmn
  }
);
var genCmpRpt = mkAsyPcs(
  "fnctOrds/genCmpRpt", {
    fn: async function({
      trns,
      sD,
      eD
    }, {
      rj
    }) {
      try {
        var r = await gmnAI.rptCmpl(trns, sD, eD);
        return r;
      } catch (e) {
        console.error(`[Thk] \u{274C} Fl to gnr AI cmp rpt:`, e);
        return rj(e.m || "Fl to gnr AI cmp rpt.");
      }
    },
    rI: gmn
  }
);
var trnsGphAnls = mkAsyPcs(
  "fnctOrds/trnsGphAnls", {
    fn: async function(oId, {
      gt,
      rj
    }) {
      try {
        var st = gt();
        var o = fnctOrdsSl.slBI(st, oId);
        if (!o) throw new Error(`Ord ${oId} not fnd for gph anls.`);
        var r = await gmnAI.trnsGphAnls(o);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to per gph anls.");
      }
    },
    rI: gmn
  }
);
var devFgp = mkAsyPcs(
  "fnctOrds/devFgp", {
    fn: async function(oId, {
      gt,
      rj
    }) {
      try {
        var st = gt();
        var o = fnctOrdsSl.slBI(st, oId);
        if (!o) throw new Error(`Ord ${oId} not fnd for dev fgp.`);
        var r = await gmnAI.devFgp(o);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to per dev fgp.");
      }
    },
    rI: gmn
  }
);
var cusLftmVal = mkAsyPcs(
  "fnctOrds/cusLftmVal", {
    fn: async function(uId, {
      rj
    }) {
      try {
        var r = await gmnAI.cusLftmVal(uId);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to prc cus lftm val.");
      }
    },
    rI: gmn
  }
);
var sntmtAnlFdbk = mkAsyPcs(
  "fnctOrds/sntmtAnlFdbk", {
    fn: async function({
      uId,
      fbk
    }, {
      rj
    }) {
      try {
        var r = await gmnAI.sntmtAnlFdbk(uId, fbk);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to anl sntmt fdbk.");
      }
    },
    rI: gmn
  }
);
var prsnRecEng = mkAsyPcs(
  "fnctOrds/prsnRecEng", {
    fn: async function({
      uId,
      ctg
    }, {
      rj
    }) {
      try {
        var r = await gmnAI.prsnRecEng(uId, ctg);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to gnr prsn recs.");
      }
    },
    rI: gmn
  }
);
var frdPtnEvlTrkr = mkAsyPcs(
  "fnctOrds/frdPtnEvlTrkr", {
    fn: async function(_, {
      rj
    }) {
      try {
        var r = await gmnAI.frdPtnEvlTrkr();
        return r;
      } catch (e) {
        return rj(e.m || "Fl to trk frd ptn evl.");
      }
    },
    rI: gmn
  }
);
var regChgImpAnlzr = mkAsyPcs(
  "fnctOrds/regChgImpAnlzr", {
    fn: async function(rc, {
      rj
    }) {
      try {
        var r = await gmnAI.regChgImpAnlzr(rc);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to anl reg chg imp.");
      }
    },
    rI: gmn
  }
);
var intAgtRtg = mkAsyPcs(
  "fnctOrds/intAgtRtg", {
    fn: async function(tI, {
      rj
    }) {
      try {
        var r = await gmnAI.intAgtRtg(tI);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to per int agt rtg.");
      }
    },
    rI: gmn
  }
);
var mltiRskEval = mkAsyPcs(
  "fnctOrds/mltiRskEval", {
    fn: async function({
      oD,
      uC
    }, {
      rj
    }) {
      try {
        var r = await gmnAI.mltiRskEval(oD, uC);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to per mlti-rsk eval.");
      }
    },
    rI: gmn
  }
);
var dynmicPrcOpt = mkAsyPcs(
  "fnctOrds/dynmicPrcOpt", {
    fn: async function({
      pId,
      bPrc,
      vol
    }, {
      rj
    }) {
      try {
        var r = await gmnAI.dynmicPrcOpt(pId, bPrc, vol);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to per dynmc prc opt.");
      }
    },
    rI: gmn
  }
);
var fnctOrdsSl = {
  ...fnctOrds.sel,
  slFrdRvuOrds: function(st) {
    return fnctOrds.sel.slA(st).filter(function(o) {
      return o.st === "frd_rvu";
    });
  },
  slDnFrdOrds: function(st) {
    return fnctOrds.sel.slA(st).filter(function(o) {
      return o.st === "dn_frd";
    });
  },
  slFlOrdsAI: function(st) {
    return fnctOrds.sel.slA(st).filter(function(o) {
      return o.st === "fl_ai_rvd" && o.aIFlRec;
    });
  },
  slLwSucPbOrds: function(st, t = 0.9) {
    return fnctOrds.sel.slA(st).filter(function(o) {
      return o.pD && o.pD.sPb < t;
    });
  },
  slOrdsAplOfrs: function(st) {
    return fnctOrds.sel.slA(st).filter(function(o) {
      return o.aO && !o.aO.ldg;
    });
  },
  slPmtStSmry: function(st) {
    var aO = fnctOrds.sel.slA(st);
    return aO.reduce(function(sm, o) {
      sm[o.st] = (sm[o.st] || 0) + 1;
      return sm;
    }, {});
  },
  slTotCmpAmtByCur: function(st, c) {
    return fmtDec(fnctOrds.sel.slA(st).filter(function(o) {
      return o.st === "comp" && o.cur === c;
    }).reduce(function(tot, o) {
      return tot + o.amt;
    }, 0), 2);
  },
  slAvgFrdS: function(st) {
    var oWFS = fnctOrds.sel.slA(st).filter(function(o) {
      return o.fD && o.fD.s !== void 0 && o.fD.st !== "err" && o.fD.st !== "chck";
    });
    if (oWFS.length === 0) return null;
    var tS = oWFS.reduce(function(sm, o) {
      return sm + o.fD.s;
    }, 0);
    return fmtDec(tS / oWFS.length, 2);
  },
  slOrdsNdgAttn: function(st) {
    return fnctOrds.sel.slA(st).filter(function(o) {
      return o.st === "frd_rvu" || o.st === "dn_frd" || o.st === "anm_det" || o.st === "fl" && !o.aIFlRec;
    });
  },
  slBthdOrds: function(st) {
    return fnctOrds.sel.slA(st).filter(function(o) {
      return o.st === "bth_for_prs";
    });
  },
  slUsrChnSks: function(st) {
    return st.fnctOrds.usrChnSk || {};
  },
  slLtstCmpRpt: function(st) {
    return st.fnctOrds.ltstCmpRpt || null;
  }
};
var fnctOrdsAct = fnctOrds.sli.a;
var fnctOrdsRdcr = fnctOrds.sli.r;
var DFLT_AI_PRFL = {
  v: "GMN-2024-05",
  aRt: 98.7,
  cTg: ["e-com", "fin-srv", "bnk"],
  ldAvg: 0.35,
  hS: false,
  updAt: new Date().toISOString()
};
var GMN_AI_PRFL = {
  v: "GMN-2024-05-Pro",
  aRt: 99.1,
  cTg: ["e-com", "fin-srv", "bnk", "mlti-crncy"],
  ldAvg: 0.28,
  hS: false,
  updAt: new Date().toISOString(),
  extMod: [{
    nm: "FrdDet-X",
    v: "1.2",
    pvd: "Citadel AI",
    st: "act"
  }, {
    nm: "PrcRtg-G",
    v: "2.1",
    pvd: "QuantumRoute",
    st: "act"
  }]
};
var FNCT_SYS_HLTH_MON = function() {
  var i = this;
  i.chkExtPtnrs = async function() {
    console.log(`[SysMon] \u{1F4C8} Chk ext ptnrs health for ${CITIBANK_DEMO_BUSINESS_INC}...`);
    await slwPr(500, 2e3);
    var hR = {};
    for (var j = 0; j < Math.floor(Math.random() * allComp.length / 100) + 1; j++) {
      var c = rdmS(allComp);
      hR[c] = Math.random() < 0.95 ? "oprt" : "degrd";
    }
    return hR;
  };
  i.updAIPrfl = async function(pId, nPrfl) {
    console.log(`[SysMon] \u{1F514} Upd AI prfl for ${pId}`);
    await slwPr(200, 800);
    return {
      pId: pId,
      old: DFLT_AI_PRFL,
      new: nPrfl,
      st: "ok",
      updAt: new Date().toISOString()
    };
  };
  i.optCfgTnr = async function(cfg, goal) {
    console.log(`[SysMon] \u{1F50A} Opt cfg tnr for ${goal}`);
    await slwPr(400, 1500);
    var oC = {
      ...cfg,
      thdAdj: Math.random() * 0.1 - 0.05,
      newPrm: mkUId().substring(0, 8)
    };
    return {
      oC: oC,
      g: goal,
      ef: fmtDec(Math.random() * 0.2 + 0.8, 3)
    };
  };
};
var sysMon = new FNCT_SYS_HLTH_MON();
var fnctSysHlth = mkAsyPcs(
  "fnctOrds/fnctSysHlth", {
    fn: async function(_, {
      rj
    }) {
      try {
        var pR = await sysMon.chkExtPtnrs();
        return pR;
      } catch (e) {
        return rj(e.m || "Fl to chk sys hlth.");
      }
    },
    rI: mkUId()
  }
);
var upGmnAIPrfl = mkAsyPcs(
  "fnctOrds/upGmnAIPrfl", {
    fn: async function(nPrfl, {
      rj
    }) {
      try {
        var r = await sysMon.updAIPrfl("main-gmn-ai", nPrfl);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to upd GMN AI prfl.");
      }
    },
    rI: mkUId()
  }
);
var optFnctCfg = mkAsyPcs(
  "fnctOrds/optFnctCfg", {
    fn: async function({
      cfg,
      goal
    }, {
      rj
    }) {
      try {
        var r = await sysMon.optCfgTnr(cfg, goal);
        return r;
      } catch (e) {
        return rj(e.m || "Fl to opt fnct cfg.");
      }
    },
    rI: mkUId()
  }
);
var MckBcknd = function() {
  var d = {
    usrs: {},
    pdt: {},
    inv: {}
  };
  for (var i = 0; i < 50; i++) {
    var uId = `usr_${mkUId().substring(0, 8)}`;
    d.usrs[uId] = {
      id: uId,
      nm: `Test User ${i}`,
      em: `${uId}@email.com`,
      cAt: new Date().toISOString(),
      lvl: rdmS(["gold", "silver", "bronze", "new_usr"])
    };
  }
  for (var i = 0; i < 100; i++) {
    var pId = `pdt_${mkUId().substring(0, 8)}`;
    d.pdt[pId] = {
      id: pId,
      nm: `Item ${i}`,
      pr: fmtDec(Math.random() * 1000 + 10, 2),
      ct: rdmS(["elec", "cloth", "bk", "foo"]),
      stk: Math.floor(Math.random() * 500)
    };
  }
  var i = this;
  i.gtUsr = async function(uId) {
    await slwPr(50, 200);
    return d.usrs[uId] || null;
  };
  i.gtPdt = async function(pId) {
    await slwPr(50, 200);
    return d.pdt[pId] || null;
  };
  i.updStk = async function(pId, q) {
    await slwPr(100, 300);
    if (d.pdt[pId]) {
      d.pdt[pId].stk -= q;
      return d.pdt[pId];
    }
    throw new Error("Pdt not fnd");
  };
};
var mckBknd = new MckBcknd();
var fchUsrInfo = mkAsyPcs(
