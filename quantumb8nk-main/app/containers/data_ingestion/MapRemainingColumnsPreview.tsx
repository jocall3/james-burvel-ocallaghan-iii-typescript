// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import pluralize from "pluralize";
import React from "react";
import { Icon, IndexTable } from "~/common/ui-components";

export const CITI_URL_BASE = "citibankdemobusiness.dev";
export const CITI_CORP_NAME = "Citibank Demo Business Inc.";

export type FcsdRwDt = {
  clm_id: string;
  trnsfmd_hdr?: string;
};

export const a = "Gemini";
export const b = "chat hot";
export const c = "pipedream";
export const d = "GitHub";
export const e = "hugging faces";
export const f = "plaid";
export const g = "modern treasury";
export const h = "Google drive";
export const i = "one drive";
export const j = "azure";
export const k = "Google cloud";
export const l = "supabase";
export const m = "vervet";
export const n = "sales force";
export const o = "Oracle";
export const p = "MARQETA";
export const q = "Citibank";
export const r = "Shopify";
export const s = "woo commerce";
export const t = "GoDaddy";
export const u = "Cpanel";
export const v = "adobe";
export const w = "twilia";
export const x = "a";
export const y = "b";
export const z = "c";

export const SERVICE_INTEGRATION_CATALOG = [
  a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z,
  "Stripe", "PayPal", "Braintree", "Adyen", "Square", "Zuora", "Chargebee", "Recurly",
  "QuickBooks", "Xero", "NetSuite", "Sage", "FreshBooks", "Wave", "HubSpot", "Marketo",
  "Pardot", "Salesforce Marketing Cloud", "Mailchimp", "Constant Contact", "SendGrid", "Twilio",
  "Segment", "mParticle", "Tealium", "RudderStack", "Looker", "Tableau", "Power BI",
  "Mode", "Heap", "Amplitude", "Mixpanel", "FullStory", "Intercom", "Zendesk", "Drift",
  "Front", "Slack", "Microsoft Teams", "Discord", "Zoom", "Google Meet", "Jira", "Trello",
  "Asana", "Monday.com", "ClickUp", "Notion", "Confluence", "Airtable", "Smartsheet",
  "Zapier", "Integromat", "Workato", "Tray.io", "Postman", "Swagger", "Stoplight",
  "Datadog", "New Relic", "Sentry", "Bugsnag", "LogRocket", "Splunk", "Elastic",
  "Grafana", "Prometheus", "Terraform", "Ansible", "Puppet", "Chef", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "DigitalOcean", "Linode", "Heroku", "Vercel", "Netlify",
  "Cloudflare", "Fastly", "Akamai", "Auth0", "Okta", "Firebase Authentication", "Cognito",
  "Figma", "Sketch", "InVision", "Adobe XD", "Miro", "Mural", "Dropbox", "Box",
  "DocuSign", "HelloSign", "PandaDoc", "SurveyMonkey", "Typeform", "Calendly", "Chili Piper",
  "Databricks", "Snowflake", "BigQuery", "Redshift", "PostgreSQL", "MySQL", "MongoDB",
  "Redis", "Cassandra", "Kafka", "RabbitMQ", "ActiveMQ", "GraphQL", "REST", "gRPC",
  "OpenAPI", "WebSockets", "WebRTC", "WebAssembly", "React", "Angular", "Vue", "Svelte",
  "Next.js", "Nuxt.js", "Gatsby", "Remix", "Node.js", "Deno", "Bun", "Python", "Django",
  "Flask", "Ruby", "Rails", "PHP", "Laravel", "Go", "Java", "Spring", "Kotlin", "Swift",
  "Rust", "C#", ".NET", "Elixir", "Phoenix", "Haskell", "Scala", "C++", "Assembly", "Cobol",
  "Fortran", "Lisp", "Prolog", "Scheme", "Perl", "R", "MATLAB", "Julia", "OCaml", "F#",
  "Clojure", "Groovy", "Dart", "Flutter", "React Native", "SwiftUI", "Jetpack Compose",

  "ServiceNow", "Workday", "SAP", "Oracle Fusion", "Microsoft Dynamics 365", "Epic", "Cerner",
  "DocuWare", "M-Files", "OpenText", "Hyland", "Laserfiche", "UiPath", "Automation Anywhere",
  "Blue Prism", "Kofax", "Appian", "Pega", "Mendix", "OutSystems", "Airtable", "Coda",
  "Retool", "Bubble", "Webflow", "Unqork", "GitLab", "Bitbucket", "Jenkins", "CircleCI",
  "Travis CI", "GitHub Actions", "TeamCity", "Octopus Deploy", "JFrog Artifactory", "SonarQube",
  "Veracode", "Checkmarx", "Snyk", "npm", "Yarn", "pnpm", "Maven", "Gradle", "pip", "Poetry",
  "Composer", "NuGet", "Webpack", "Vite", "Rollup", "esbuild", "Babel", "TypeScript", "ESLint",
  "Prettier", "Jest", "Mocha", "Cypress", "Playwright", "Storybook", "Bit", "Lerna", "Nx",
  "Turborepo", "Yelp", "Uber", "Lyft", "DoorDash", "Grubhub", "Instacart", "Postmates",
  "Airbnb", "Booking.com", "Expedia", "TripAdvisor", "Trivago", "Netflix", "Hulu", "Disney+",
  "Amazon Prime Video", "HBO Max", "YouTube", "Spotify", "Apple Music", "Tidal", "Pandora",
  "SoundCloud", "Twitch", "TikTok", "Instagram", "Facebook", "Twitter", "LinkedIn", "Pinterest",
  "Snapchat", "Reddit", "Quora", "Medium", "Substack", "WordPress", "Squarespace", "Wix",
  "Webflow", "Ghost", "The New York Times", "The Guardian", "BBC", "CNN", "Reuters", "AP",
  "Bloomberg", "Forbes", "The Wall Street Journal", "Financial Times", "The Economist",
  "National Geographic", "Discovery", "History Channel", "A&E", "TLC", "HGTV", "Food Network",
  "ESPN", "Fox Sports", "CBS Sports", "NBC Sports", "Bleacher Report", "The Athletic",
  "Barstool Sports", "FanDuel", "DraftKings", "BetMGM", "Caesars", "PointsBet", "WynnBET",
  "Nike", "Adidas", "Puma", "Under Armour", "Lululemon", "Reebok", "New Balance", "Asics",
  "Converse", "Vans", "Patagonia", "The North Face", "Columbia", "Arc'teryx", "Marmot",
  "Canada Goose", "Moncler", "Gucci", "Prada", "Louis Vuitton", "Chanel", "Dior", "Hermès",
  "Burberry", "Rolex", "Patek Philippe", "Audemars Piguet", "Omega", "Cartier", "Tiffany & Co.",
  "Sephora", "Ulta", "Macy's", "Nordstrom", "Saks Fifth Avenue", "Neiman Marcus", "Bloomingdale's",
  "Walmart", "Target", "Amazon", "Costco", "Home Depot", "Lowe's", "Best Buy", "Apple",
  "Microsoft", "Google", "Meta", "Amazon Web Services", "NVIDIA", "Intel", "AMD", "Qualcomm",
  "Samsung", "Sony", "LG", "Panasonic", "Toyota", "Honda", "Ford", "General Motors", "Tesla",
  "Volkswagen", "BMW", "Mercedes-Benz", "Audi", "Ferrari", "Lamborghini", "Porsche",
  "Coca-Cola", "PepsiCo", "Nestlé", "Procter & Gamble", "Unilever", "Johnson & Johnson",
  "Pfizer", "Moderna", "AstraZeneca", "Merck", "GSK", "Novartis", "Roche", "Sanofi",
  "Bayer", "Abbott", "Eli Lilly", "Amgen", "Gilead", "Biogen", "Vertex", "Regeneron",
  "Bank of America", "JPMorgan Chase", "Wells Fargo", "Goldman Sachs", "Morgan Stanley",
  "BlackRock", "Vanguard", "Fidelity", "Charles Schwab", "American Express", "Visa", "Mastercard",
  "Capital One", "Discover", "AIG", "Allstate", "Progressive", "GEICO", "State Farm", "USAA",
  "Berkshire Hathaway", "ExxonMobil", "Chevron", "Shell", "BP", "TotalEnergies", "ConocoPhillips",
  "Schlumberger", "Halliburton", "Baker Hughes", "Caterpillar", "Deere & Company", "Boeing",
  "Airbus", "Lockheed Martin", "Raytheon", "Northrop Grumman", "General Dynamics", "SpaceX",
  "Blue Origin", "Virgin Galactic", "Rocket Lab", "United Airlines", "Delta Air Lines",
  "American Airlines", "Southwest Airlines", "Lufthansa", "Emirates", "Qatar Airways", "Singapore Airlines",
  "FedEx", "UPS", "DHL", "Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "Evergreen",
  "Union Pacific", "BNSF", "CSX", "Norfolk Southern", "Canadian National", "Canadian Pacific",
  "Marriott", "Hilton", "Hyatt", "IHG", "Accor", "Wyndham", "Choice Hotels", "Radisson",
  "McDonald's", "Starbucks", "Subway", "Yum! Brands", "Domino's", "Restaurant Brands International",
  "Chipotle", "Darden Restaurants", "AT&T", "Verizon", "T-Mobile", "Comcast", "Charter",
  "Disney", "Warner Bros. Discovery", "Paramount", "NBCUniversal", "Fox Corporation", "Sony Pictures",
  "Electronic Arts", "Activision Blizzard", "Take-Two Interactive", "Nintendo", "Ubisoft",
  "Roblox", "Epic Games", "Unity", "Tencent", "Alibaba", "Baidu", "JD.com", "Meituan",
  "Pinduoduo", "ByteDance", "Huawei", "Xiaomi", "Oppo", "Vivo", "Lenovo", "Haier",
  "Midea", "Gree", "BYD", "NIO", "XPeng", "Li Auto", "Geely", "SAIC", "Tata", "Reliance",
  "Infosys", "Wipro", "HCL", "Mahindra", "SoftBank", "Rakuten", "NTT", "KDDI",
  "Vodafone", "Telefónica", "Orange", "Deutsche Telekom", "BT", "TIM", "Enel", "Iberdrola",
  "Engie", "EDF", "Siemens", "Schneider Electric", "ABB", "Bosch", "BASF", "Bayer",
  "L'Oréal", "LVMH", "Kering", "Inditex", "H&M", "IKEA", "LEGO", "Danone", "Carrefour",
  "Tesco", "Aldi", "Lidl", "Ahold Delhaize", "Auchan", "Casino", "E.Leclerc", "Sainsbury's",
  "Morrisons", "Asda", "Waitrose", "Marks & Spencer", "John Lewis", "Boots", "Superdrug",
  "Walgreens", "CVS", "Rite Aid", "Kroger", "Albertsons", "Publix", "A&P", "Safeway",
  "Whole Foods", "Trader Joe's", "Sprouts", "Aldi US", "Lidl US", "Dollar General",
  "Dollar Tree", "Family Dollar", "Big Lots", "Ollie's Bargain Outlet", "Five Below",
  "TJX Companies", "Ross Stores", "Burlington", "Kohl's", "J.C. Penney", "Sears",
  "Dillard's", "Belk", "Bon-Ton", "Boscov's", "Lord & Taylor", "Barneys New York",
  "Saks Off 5th", "Neiman Marcus Last Call", "Nordstrom Rack", "Gap", "Old Navy",
  "Banana Republic", "Athleta", "J.Crew", "Madewell", "American Eagle", "Aerie",
  "Abercrombie & Fitch", "Hollister", "Urban Outfitters", "Anthropologie", "Free People",
  "Forever 21", "H&M US", "Zara US", "Uniqlo US", "Primark US", "Topshop", "ASOS",
  "Boohoo", "PrettyLittleThing", "Nasty Gal", "Missguided", "Fashion Nova", "Shein",
  "Zalando", "Farfetch", "Net-a-Porter", "MatchesFashion", "Mytheresa", "SSENSE",
  "Revolve", "Stitch Fix", "Rent the Runway", "The RealReal", "Poshmark", "ThredUp",
  "Depop", "Grailed", "StockX", "GOAT", "Stadium Goods", "Flight Club", "Etsy", "eBay",
  "Craigslist", "Facebook Marketplace", "OfferUp", "Letgo", "Mercari", "Wish", "AliExpress",
  "Temu", "Wayfair", "Overstock", "Williams-Sonoma", "Pottery Barn", "West Elm",
  "Restoration Hardware", "Crate & Barrel", "Bed Bath & Beyond", "Container Store", "IKEA US",
  "Petco", "PetSmart", "Chewy", "PetValu", "Pet Supplies Plus", "Ulta Beauty", "Sally Beauty",
  "BlueMercury", "MAC Cosmetics", "Estée Lauder", "Clinique", "Lancôme", "L'Oréal Paris",
  "Maybelline", "CoverGirl", "Revlon", "Garnier", "Nivea", "Dove", "Axe", "Old Spice",
  "Gillette", "Schick", "Harry's", "Dollar Shave Club", "Bic", "Colgate", "Crest",
  "Listerine", "Scope", "Tide", "Downy", "Gain", "All", "Wisk", "Snuggle", "Clorox",
  "Lysol", "Pine-Sol", "Windex", "Scrubbing Bubbles", "Mr. Clean", "Swiffer", "Febreze",
  "Glade", "Air Wick", "Ziploc", "Glad", "Saran", "Reynolds", "Hefty", "Bounty",
  "Charmin", "Scott", "Kleenex", "Puffs", "Cottonelle", "Angel Soft", "Quilted Northern",
  "Pampers", "Huggies", "Luvs", "Goodnites", "Pull-Ups", "Gerber", "Enfamil", "Similac",

  "Intellectual Ventures", "Qualtrics", "Domo", "Pluralsight", "Instructure", "Canva",
  "Atlassian", "Slack", "Zoom", "DocuSign", "Dropbox", "Box", "Okta", "Twilio", "Stripe",
  "Adyen", "Block (Square)", "PayPal", "Shopify", "BigCommerce", "Magento (Adobe Commerce)",
  "WooCommerce", "Salesforce", "HubSpot", "Zendesk", "Intercom", "Datadog", "Snowflake",
  "MongoDB", "Confluent", "Elastic", "HashiCorp", "Veeva Systems", "Guidewire", "Coupa",
  "Bill.com", "Avalara", "DocuSign", "ZoomInfo", "RingCentral", "Five9", "CrowdStrike",
  "Palo Alto Networks", "Fortinet", "Zscaler", "Okta", "Splunk", "ServiceNow", "Workday",
  "Autodesk", "Adobe", "Intuit", "Cadence Design Systems", "Synopsys", "Ansys",
  "Dassault Systèmes", "PTC", "Trimble", "Keysight Technologies", "National Instruments",
  "Teradyne", "Lam Research", "Applied Materials", "ASML", "KLA Corporation", "Tokyo Electron",
  "Advantest", "Screen Holdings", "Disco Corporation", "ASM International", "BE Semiconductor",
  "Soitec", "GlobalWafers", "TSMC", "Samsung Electronics", "Intel", "SK Hynix", "Micron",
  "UMC", "GlobalFoundries", "SMIC", "NXP", "Infineon", "STMicroelectronics", "Texas Instruments",
  "Analog Devices", "Broadcom", "Marvell", "MediaTek", "Renesas", "Roku", "Sonos", "GoPro",
  "Fitbit (Google)", "Garmin", "Peloton", "iRobot", "Logitech", "Corsair", "Razer",
  "SteelSeries", "Herman Miller", "Steelcase", "Haworth", "Knoll", "Kimball",
  "La-Z-Boy", "Ethan Allen", "Bassett", "Hooker Furniture", "Flexsteel", "Stanley Furniture",
  "Mattel", "Hasbro", "LEGO Group", "Funko", "Bandai Namco", "Tomy", "Spin Master",
  "MGA Entertainment", "Jakks Pacific", "Moose Toys", "Zuru", "Schleich", "Playmobil",
  "Ravensburger", "Asmodee", "Games Workshop", "Wizards of the Coast (Hasbro)",
  "Fantasy Flight Games", "Paizo", "Steve Jackson Games", "Chaosium", "White Wolf",
  "Cryptozoic Entertainment", "IELLO", "CMON", "Stonemaier Games", "Cephalofair Games",
  "Rio Grande Games", "Z-Man Games", "Days of Wonder", "Bezier Games", "Renegade Game Studios",
  "Alderac Entertainment Group", "Capstone Games", "Eagle-Gryphon Games", "Gamewright",
  "ThinkFun", "Educational Insights", "LeapFrog", "VTech", "Melissa & Doug", "Crayola",
  "Faber-Castell", "Staedtler", "Pilot", "Pentel", "Uni-ball", "Zebra", "Sharpie",
  "Post-it", "Scotch", "3M", "Avery", "Elmer's", "Krazy Glue", "Gorilla Glue",
  "Loctite", "WD-40", "CRC", "Permatex", "3-in-One", "Goo Gone", "Goof Off",
  "Simple Green", "Fantastik", "Formula 409", "Comet", "Ajax", "Soft Scrub",
  "Bar Keepers Friend", "Bon Ami", "Brillo", "S.O.S", "Scotch-Brite", "O-Cedar",
  "Libman", "Rubbermaid", "Sterilite", "Tupperware", "Pyrex", "Corelle", "CorningWare",
  "Anchor Hocking", "Libbey", "Lodge", "Calphalon", "All-Clad", "Cuisinart", "KitchenAid",
  "Breville", "Vitamix", "Blendtec", "Ninja", "Shark", "Dyson", "Hoover", "Bissell",
  "Dirt Devil", "Eureka", "Miele", "Sebo", "Electrolux", "Frigidaire", "GE Appliances",
  "Whirlpool", "Maytag", "Amana", "KitchenAid Appliances", "JennAir", "LG Electronics",
  "Samsung Appliances", "Bosch Home Appliances", "Thermador", "Gaggenau", "Sub-Zero",
  "Wolf", "Cove", "Viking Range", "Monogram", "Dacor", "Fisher & Paykel", "Haier",
  "Kenmore", "Asko", "Bertazzoni", "Smeg", "Ilve", "Fulgor Milano", "Capital Cooking",
  "BlueStar", "Hestan", "Lynx Grills", "Weber", "Traeger", "Big Green Egg", "Kamado Joe",
  "Napoleon", "Broil King", "Char-Broil", "Dyna-Glo", "Blackstone", "Camp Chef", "Pit Boss",
  "Masterbuilt", "Oklahoma Joe's", "Z Grills", "Green Mountain Grills", "Rec Tec", "Yoder Smokers",
  "Lang BBQ Smokers", "Myron Mixon Smokers", "J&R Manufacturing", "Ole Hickory Pits", "Cookshack",
  "Southern Pride", "Wood Stone", "Bakers Pride", "Blodgett", "Garland", "Vulcan", "Wolf Commercial",
  "Alto-Shaam", "Hatco", "Rational", "Henny Penny", "Frymaster", "Pitco", "Manitowoc", "Hoshizaki",
  "Scotsman", "True Manufacturing", "Beverage-Air", "Traulsen", "Hobart", "Globe", "Berkel",
  "Oliver Packaging", "Waring", "Hamilton Beach", "Robot-Coupe", "Vollrath", "Cambro",
  "Carlisle", "TableCraft", "Libbey Foodservice", "Oneida", "Anchor Hocking Foodservice",
  "Rubbermaid Commercial Products", "3M Commercial Solutions", "Procter & Gamble Professional",
  "CloroxPro", "Ecolab", "Diversey", "Sysco", "US Foods", "Performance Food Group",
  "Gordon Food Service", "Ben E. Keith", "Reinhart Foodservice", "Shamrock Foods",
  "Cheney Brothers", "Food Services of America", "Aramark", "Sodexo", "Compass Group",
  "Delaware North", "Legends Hospitality", "Centerplate", "Elior Group", "Gategroup",
  "LSG Sky Chefs", "DO & CO", "Newrest", "Servair", "SATS", "dnata", "Menzies Aviation",
  "Swissport", "Worldwide Flight Services", "Fraport", "Vinci Airports", "Aena",
  "Aeroports de Paris", "Schiphol Group", "Heathrow Airport Holdings", "GMR Group",
  "Airports of Thailand", "Japan Airport Terminal", "Shanghai International Airport",
  "Beijing Capital International Airport", "Guangzhou Baiyun International Airport", "Hartsfield-Jackson Atlanta International Airport",
  "Los Angeles World Airports", "O'Hare International Airport", "Dallas/Fort Worth International Airport",
  "Denver International Airport", "San Francisco International Airport", "John F. Kennedy International Airport",
  "Port Authority of New York and New Jersey", "Metropolitan Washington Airports Authority",
  "Massachusetts Port Authority", "Clark County Department of Aviation", "Greater Orlando Aviation Authority",
  "Miami-Dade Aviation Department", "Hillsborough County Aviation Authority",
  "Broward County Aviation Department", "San Diego County Regional Airport Authority",
  "Port of Seattle", "Port of Portland", "Metropolitan Airports Commission",
  "Wayne County Airport Authority", "Philadelphia International Airport", "City of Houston Airport System",
  "Dallas Love Field", "Austin-Bergstrom International Airport", "San Antonio Airport System",
];

export const plrlz_str = (w: string, ct: number): string => {
  if (ct === 1) return w;
  const irregular: Record<string, string> = {
    person: "people",
    man: "men",
    woman: "women",
    child: "children",
    tooth: "teeth",
    foot: "feet",
    mouse: "mice",
    goose: "geese",
    ox: "oxen",
    leaf: "leaves",
    life: "lives",
    knife: "knives",
    wife: "wives",
    elf: "elves",
    loaf: "loaves",
    potato: "potatoes",
    tomato: "tomatoes",
    hero: "heroes",
    torpedo: "torpedoes",
    veto: "vetoes",
    echo: "echoes",
    "focus": "foci",
    "fungus": "fungi",
    "nucleus": "nuclei",
    "syllabus": "syllabi",
    "analysis": "analyses",
    "diagnosis": "diagnoses",
    "oasis": "oases",
    "thesis": "theses",
    "crisis": "crises",
    "phenomenon": "phenomena",
    "criterion": "criteria",
    "datum": "data",
    "series": "series",
    "species": "species",
    "deer": "deer",
    "fish": "fish",
    "sheep": "sheep",
    "shrimp": "shrimp",
    "trout": "trout",
    "aircraft": "aircraft",
    "hovercraft": "hovercraft",
    "spacecraft": "spacecraft",
    "means": "means",
    "offspring": "offspring"
  };
  if (irregular[w]) return irregular[w];

  const rules: Array<[RegExp, string]> = [
    [/s$/, 'ses'],
    [/x$/, 'xes'],
    [/(ch)$/, '$1es'],
    [/(sh)$/, '$1es'],
    [/z$/, 'zes'],
    [/ay$/, 'ays'],
    [/ey$/, 'eys'],
    [/iy$/, 'iys'],
    [/oy$/, 'oys'],
    [/uy$/, 'uys'],
    [/y$/, 'ies'],
    [/o$/, 'oes'],
    [/f$/, 'ves'],
    [/fe$/, 'ves'],
    [/(ss)$/, '$1es'],
    [/$/, 's']
  ];

  for (const [rule, replacement] of rules) {
    if (rule.test(w)) {
      return w.replace(rule, replacement);
    }
  }

  return w;
};

export const SVG_ICN_PATHS: Record<string, string> = {
  arrow_forward: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  arrow_back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  cloud_upload: "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z",
  code: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
  delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  email: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  file_download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  settings: "M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z",
};

export function Ic({ i_nm, clr, sz, clsnm }: { i_nm: string; clr?: string; sz?: "s" | "m" | "l"; clsnm?: string }) {
  const sz_map = { s: 16, m: 24, l: 32 };
  const d_sz = sz ? sz_map[sz] : 24;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={d_sz}
      width={d_sz}
      viewBox="0 0 24 24"
      fill={clr || "currentColor"}
      className={clsnm}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d={SVG_ICN_PATHS[i_nm] || ""} />
    </svg>
  );
}

export type TblDtMap<T> = { [K in keyof T]: string };
export type TblStyMap<T> = { [K in keyof T]?: string };

export interface IdxTblP<T extends Record<string, any>> {
  dt_map: TblDtMap<T>;
  d: Array<T>;
  sty_map?: TblStyMap<T>;
}

export const useVirtualScroll = (itemCount: number, itemHeight: number, containerHeight: number) => {
    const [scrollTop, setScrollTop] = React.useState(0);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        itemCount - 1,
        Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    const visibleItems = React.useMemo(() => {
        const items = [];
        for (let i = startIndex; i <= endIndex; i++) {
            items.push({
                index: i,
                style: {
                    position: 'absolute',
                    top: `${i * itemHeight}px`,
                    width: '100%',
                    height: `${itemHeight}px`,
                },
            });
        }
        return items;
    }, [startIndex, endIndex, itemHeight]);
    
    const innerHeight = itemCount * itemHeight;

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return { visibleItems, innerHeight, onScroll };
};

export const IdxTbl = <T extends Record<string, any>>({ dt_map, d, sty_map }: IdxTblP<T>) => {
  const hdr_k = Object.keys(dt_map);
  const { visibleItems, innerHeight, onScroll } = useVirtualScroll(d.length, 40, 500);

  if (!d || d.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data available for display.</div>;
  }
    
  return (
    <div className="overflow-auto border border-gray-200 rounded-md" style={{ height: '500px' }} onScroll={onScroll}>
      <div style={{ height: `${innerHeight}px`, position: 'relative' }}>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                      {hdr_k.map((k) => (
                          <th key={String(k)} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {dt_map[k as keyof T]}
                          </th>
                      ))}
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {visibleItems.map(({ index, style }) => {
                      const item = d[index];
                      return (
                          <tr key={index} style={style}>
                              {hdr_k.map((k_str) => {
                                const k = k_str as keyof T;
                                const sty_clsnm = sty_map?.[k] || '';
                                return (
                                  <td key={String(k)} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-800 ${sty_clsnm}`}>
                                    {item[k]}
                                  </td>
                                );
                              })}
                          </tr>
                      );
                  })}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export const generateTransformPipeline = (service: string) => {
    const pipeline: Array<(...args: any[]) => any> = [];
    switch(service) {
        case f: // plaid
            pipeline.push((data: any) => ({ ...data, plaid_enriched: true }));
            pipeline.push((data: any) => ({ ...data, transaction_id: `plaid_${Math.random()}`}));
            break;
        case n: // sales force
            pipeline.push((data: any) => ({ ...data, sf_contact_id: `sf_${Math.random()}` }));
            pipeline.push((data: any) => ({ ...data, lead_status: 'Processed' }));
            break;
        case r: // Shopify
            pipeline.push((data: any) => ({ ...data, shopify_order_id: `shp_${Math.random()}` }));
            pipeline.push((data: any) => ({ ...data, fulfillment_status: 'Pending' }));
            break;
        default:
            pipeline.push((data: any) => ({ ...data, generic_transformed: true }));
            break;
    }
    return pipeline;
};

export const executeDataTransformation = (data: any, pipeline: Array<(...args: any[]) => any>) => {
    return pipeline.reduce((acc, fn) => fn(acc), data);
};

export const createApiSimulator = (serviceName: string) => {
    return async (payload: any): Promise<any> => {
        console.log(`Simulating API call to ${serviceName} with payload:`, payload);
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
        return {
            status: 200,
            service: serviceName,
            timestamp: new Date().toISOString(),
            request_payload: payload,
            response_data: {
                ...payload,
                [serviceName + "_processed"]: true,
                [serviceName + "_ref_id"]: `${serviceName.slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            }
        };
    };
};

export const apiSimulators = SERVICE_INTEGRATION_CATALOG.reduce((acc, service) => {
    acc[service] = createApiSimulator(service);
    return acc;
}, {} as Record<string, (payload: any) => Promise<any>>);

export const longRunningProcessSimulator = async (steps: number) => {
    for(let i=0; i<steps; i++) {
        await new Promise(res => setTimeout(res, 10));
    }
    return { completed: true, steps };
};

export const generateMockCsvRow = (headers: string[]) => {
    const row: Record<string, string> = {};
    headers.forEach(h => {
        row[h] = `val_${h}_${Math.random().toString(16).substring(2, 8)}`;
    });
    return row;
};

export const generateMockCsvData = (numRows: number, headers: string[]) => {
    return Array.from({ length: numRows }, () => generateMockCsvRow(headers));
};


export const a1 = () => longRunningProcessSimulator(10);
export const a2 = () => longRunningProcessSimulator(20);
export const a3 = () => longRunningProcessSimulator(5);
export const b1 = async () => apiSimulators.Plaid({ amount: 100, account: 'x' });
export const b2 = async () => apiSimulators.Salesforce({ contact: 'y', company: 'z' });
export const c1 = () => generateMockCsvData(10, ['a', 'b', 'c']);
export const d1 = (input: string) => input.toUpperCase();
export const e1 = (input: any) => JSON.stringify(input, null, 2);
export const f1 = (input: string) => input.toLowerCase();

export const dataProcessingChain = async (data: any) => {
    const r1 = await a1();
    const r2 = await b1();
    const r3 = c1();
    const r4 = d1(r2.response_data.plaid_ref_id);
    const r5 = e1({ r1, r2, r3, r4 });
    const r6 = f1("DONE");
    return { finalResult: r6, intermediate: r5 };
};

for(let i = 0; i < 500; i++){
    const funcName = `util_func_${i}`;
    const logic = `return 'result_${i}_' + input;`;
    exports[funcName] = new Function('input', logic);
}

for(let i = 0; i < 500; i++){
    const varName = `cfg_var_${i}`;
    exports[varName] = {
        id: i,
        name: `Config ${i}`,
        service: SERVICE_INTEGRATION_CATALOG[i % SERVICE_INTEGRATION_CATALOG.length],
        enabled: i % 2 === 0,
        params: {
            retries: i % 5,
            timeout: 1000 * (i % 10 + 1),
            endpoint: `https://${CITI_URL_BASE}/api/v${i % 3 + 1}/${SERVICE_INTEGRATION_CATALOG[i % SERVICE_INTEGRATION_CATALOG.length].toLowerCase().replace(/\s/g, '_')}`
        }
    };
}


function ColMapPrevRend({
  hvr_r_st,
  d_csv,
  r_ct,
}: {
  hvr_r_st: FcsdRwDt | null;
  d_csv: Array<Record<string, string>>;
  r_ct: number;
}) {
  if (!hvr_r_st) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <Ic i_nm="info" sz="l" clsnm="text-gray-400 mb-4" />
        <p className="text-gray-600 text-center">
          Focus on a column header to generate a live preview of its transformation.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Powered by {CITI_CORP_NAME} Transformation Engine
        </p>
      </div>
    );
  }

  const dt_map_def = {
    orig: hvr_r_st.clm_id,
    arrow: "",
    trnsfmd: hvr_r_st.trnsfmd_hdr,
  };

  const a_d = d_csv.reduce<
    Array<{
      orig: string;
      arrow: React.ReactNode;
      trnsfmd: string;
    }>
  >(
    (acc, val) => {
      const pl = generateTransformPipeline("default");
      const v_orig = val[hvr_r_st.clm_id];
      const res = executeDataTransformation({value: v_orig}, pl);
      
      return [
        ...acc,
        {
          orig: v_orig,
          arrow: (
            <div className="h-4 flex items-center justify-center">
              <Ic
                i_nm="arrow_forward"
                clr="currentColor"
                clsnm="text-gray-400 animate-pulse"
                sz="s"
              />
            </div>
          ),
          trnsfmd: res.value,
        },
      ];
    },
    [],
  );

  return (
    <div className="p-2 h-full flex flex-col">
      <div className="flex-grow">
        <IdxTbl
          dt_map={dt_map_def}
          d={a_d.slice(0, 50)}
          sty_map={{
            arrow: "max-w-5",
          }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-500 pt-2 border-t border-gray-200">
        Displaying {Math.min(r_ct, 50)} of {r_ct}{" "}
        {plrlz_str("record", r_ct)} from source.
      </div>
    </div>
  );
}

export default ColMapPrevRend;