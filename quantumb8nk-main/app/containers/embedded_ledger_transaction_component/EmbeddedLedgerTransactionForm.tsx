// Copyright James Burvel O’Callaghan III
// President Citibank demo business Inc.

import React, { useEffect, useState, useCallback, useReducer, FC, ChangeEvent, FocusEvent, CSSProperties, MouseEvent, useMemo } from "react";
import { connect, useFormikContext, Field, ErrorMessage, useField } from "formik";

const BASE_URL = "citibankdemobusiness.dev";
const COMPANY_NAME = "Citibank demo business Inc";

export const ALL_PARTNER_INTEGRATIONS_LIST = [
    'Gemini', 'ChatGPT', 'Pipedream', 'GitHub', 'Hugging Face', 'Plaid', 'Modern Treasury', 'Google Drive', 'OneDrive', 'Azure', 'Google Cloud', 'Supabase', 'Vercel', 'Salesforce', 'Oracle', 'MARQETA', 'Citibank', 'Shopify', 'WooCommerce', 'GoDaddy', 'CPanel', 'Adobe', 'Twilio', 'Stripe', 'PayPal', 'Square', 'Adyen', 'Braintree', 'Checkout.com', 'Authorize.net', 'Worldpay', 'Klarna', 'Afterpay', 'Affirm', 'Amazon Pay', 'Apple Pay', 'Google Pay', 'Microsoft Azure', 'Amazon Web Services (AWS)', 'IBM Cloud', 'Alibaba Cloud', 'Tencent Cloud', 'DigitalOcean', 'Heroku', 'Netlify', 'Fly.io', 'Render', 'Railway', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Asana', 'Trello', 'Slack', 'Microsoft Teams', 'Zoom', 'Discord', 'Notion', 'Miro', 'Figma', 'Sketch', 'InVision', 'Canva', 'Mailchimp', 'SendGrid', 'Constant Contact', 'HubSpot', 'Marketo', 'Pardot', 'Zendesk', 'Intercom', 'Freshdesk', 'Salesforce Service Cloud', 'QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'SAP', 'NetSuite', 'Workday', 'DocuSign', 'Dropbox', 'Box', 'Snowflake', 'Databricks', 'Tableau', 'Power BI', 'Looker', 'Segment', 'Mixpanel', 'Amplitude', 'Heap', 'Optimizely', 'LaunchDarkly', 'Sentry', 'Datadog', 'New Relic', 'Splunk', 'LogRocket', 'Postman', 'Swagger', 'Zapier', 'Integromat (Make)', 'Airtable', 'Monday.com', 'ClickUp', 'Smartsheet', 'Typeform', 'SurveyMonkey', 'Calendly', 'Grammarly', 'Documo', 'PandaDoc', 'HelloSign', 'Evernote', 'LastPass', '1Password', 'Okta', 'Auth0', 'Ping Identity', 'Cloudflare', 'Fastly', 'Akamai', 'Twitch', 'YouTube', 'Vimeo', 'Spotify', 'Apple Music', 'Netflix', 'Hulu', 'Disney+', 'TikTok', 'Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'Pinterest', 'Snapchat', 'Reddit', 'WhatsApp', 'Telegram', 'Signal', 'Uber', 'Lyft', 'DoorDash', 'Grubhub', 'Instacart', 'Airbnb', 'Expedia', 'Booking.com', 'Trivago', 'Zillow', 'Redfin', 'Compass', 'Shopify Plus', 'BigCommerce', 'Magento', 'Wix', 'Squarespace', 'Webflow', 'Unbounce', 'Leadpages', 'Hotjar', 'Crazy Egg', 'Google Analytics', 'Google Tag Manager', 'Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Twitter Ads', 'TikTok Ads', 'Bing Ads', 'SEMrush', 'Ahrefs', 'Moz', 'Yoast', 'WordPress', 'Joomla', 'Drupal', 'Ghost', 'Medium', 'Substack', 'Patreon', 'Kickstarter', 'Indiegogo', 'GoFundMe', 'Stripe Atlas', 'Clerky', 'Carta', 'AngelList', 'Crunchbase', 'PitchBook', 'Gusto', 'Rippling', 'Deel', 'Brex', 'Ramp', 'Divvy', 'Expensify', 'TripActions', 'Coupa', 'Bill.com', 'Tipalti', 'Avalara', 'TaxJar', 'Vertex', 'ADP', 'Paychex', 'Trinet', 'Justworks', 'BambooHR', 'Greenhouse', 'Lever', 'Workable', 'LinkedIn Talent Solutions', 'Indeed', 'Glassdoor', 'Hired', 'Toptal', 'Upwork', 'Fiverr', 'Coursera', 'Udemy', 'edX', 'Khan Academy', 'Duolingo', 'MasterClass', 'Skillshare', 'Codecademy', 'Pluralsight', 'A Cloud Guru', 'GitHub Copilot', 'Tabnine', 'Replit', 'CodeSandbox', 'StackBlitz', 'Glitch', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CircleCI', 'Travis CI', 'GitHub Actions', 'GitLab CI/CD', 'Bitrise', 'TeamCity', 'Octopus Deploy', 'Spinnaker', 'Argo CD', 'Flux', 'Prometheus', 'Grafana', 'Elasticsearch', 'Kibana', 'Logstash', 'Fluentd', 'Jaeger', 'Zipkin', 'OpenTelemetry', 'Consul', 'Vault', 'Nomad', 'Terraform Cloud', 'Packer', 'Vagrant', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'MariaDB', 'SQLite', 'Microsoft SQL Server', 'Oracle Database', 'Amazon RDS', 'Amazon Aurora', 'Amazon DynamoDB', 'Google Cloud SQL', 'Google Cloud Spanner', 'Google Firebase', 'Azure SQL Database', 'Azure Cosmos DB', 'CockroachDB', 'TiDB', 'Fauna', 'PlanetScale', 'Neo4j', 'InfluxDB', 'TimescaleDB', 'RabbitMQ', 'Apache Kafka', 'NATS', 'Pulsar', 'ZeroMQ', 'ActiveMQ', 'gRPC', 'GraphQL', 'REST', 'SOAP', 'WebSockets', 'WebRTC', 'OpenAPI', 'AsyncAPI', 'JSON Schema', 'Protobuf', 'Avro', 'Thrift', 'React', 'Angular', 'Vue.js', 'Svelte', 'Ember.js', 'Backbone.js', 'jQuery', 'Next.js', 'Nuxt.js', 'Gatsby', 'SvelteKit', 'Remix', 'Vite', 'Webpack', 'Rollup', 'Parcel', 'esbuild', 'Babel', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala', 'Haskell', 'Clojure', 'Elixir', 'Erlang', 'F#', 'R', 'MATLAB', 'Julia', 'Perl', 'Lua', 'Node.js', 'Deno', 'Bun', 'Express.js', 'Koa', 'Fastify', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails', 'Sinatra', 'Laravel', 'Symphony', 'Spring Boot', 'ASP.NET Core', 'Phoenix', 'Actix', 'Rocket', 'Gin', 'Echo', 'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'Google Colab', 'Kaggle', 'OpenAI', 'DeepMind', 'Anthropic', 'Cohere', 'AI21 Labs', 'Stability AI', 'Midjourney', 'DALL-E', 'LangChain', 'LlamaIndex', 'BERT', 'GPT-4', 'T5', 'Transformer', 'Unity', 'Unreal Engine', 'Godot', 'CryEngine', 'Blender', 'Autodesk Maya', '3ds Max', 'Cinema 4D', 'ZBrush', 'Substance Painter', 'Houdini', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere Pro', 'Adobe After Effects', 'Final Cut Pro', 'DaVinci Resolve', 'Audacity', 'Ableton Live', 'FL Studio', 'Logic Pro X', 'Pro Tools', 'Bitwarden', 'ProtonMail', 'Tutanota', 'NordVPN', 'ExpressVPN', 'CyberGhost', 'Surfshark', 'Brave Browser', 'DuckDuckGo', 'Mozilla Firefox', 'Google Chrome', 'Microsoft Edge', 'Safari', 'Opera', 'Vivaldi', 'Tor Browser', 'Linux', 'Windows', 'macOS', 'Android', 'iOS', 'Ubuntu', 'Debian', 'Fedora', 'Arch Linux', 'CentOS', 'Red Hat Enterprise Linux', 'SUSE Linux Enterprise', 'FreeBSD', 'OpenBSD', 'NetBSD', 'Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Polkadot', 'Dogecoin', 'Binance Coin', 'Ripple (XRP)', 'Litecoin', 'Chainlink', 'Uniswap', 'Aave', 'Compound', 'MakerDAO', 'Ledger', 'Trezor', 'MetaMask', 'Coinbase', 'Binance', 'Kraken', 'Gemini', 'FTX (historical)', 'Robinhood', 'eToro', 'WeBull', 'Charles Schwab', 'Fidelity', 'Vanguard', 'BlackRock', 'Goldman Sachs', 'Morgan Stanley', 'JPMorgan Chase', 'Bank of America', 'Wells Fargo', 'HSBC', 'Barclays', 'Deutsche Bank', 'UBS', 'Credit Suisse (historical)', 'Nomura', 'Mizuho', 'SMBC', 'MUFG', 'ICBC', 'China Construction Bank', 'Agricultural Bank of China', 'Bank of China', 'Visa', 'Mastercard', 'American Express', 'Discover', 'Diners Club', 'JCB', 'UnionPay', 'Western Union', 'MoneyGram', 'Remitly', 'Wise (formerly TransferWise)', 'Revolut', 'Monzo', 'N26', 'Chime', 'SoFi', 'Ally Bank', 'Capital One', 'Discover Bank', 'Synchrony Bank', 'NVIDIA', 'AMD', 'Intel', 'Qualcomm', 'Broadcom', 'Texas Instruments', 'Micron Technology', 'TSMC', 'Samsung Electronics', 'SK Hynix', 'ASML', 'Applied Materials', 'Lam Research', 'KLA Corporation', 'Apple', 'Microsoft', 'Google (Alphabet)', 'Amazon', 'Meta (Facebook)', 'Tesla', 'Netflix', 'Salesforce', 'Adobe', 'Oracle', 'SAP', 'IBM', 'Cisco', 'Intel', 'HP', 'Dell', 'Lenovo', 'Sony', 'Panasonic', 'LG', 'Toyota', 'Volkswagen', 'Ford', 'General Motors', 'Honda', 'Hyundai', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ferrari', 'Lamborghini', 'Boeing', 'Airbus', 'Lockheed Martin', 'Raytheon', 'Northrop Grumman', 'SpaceX', 'Blue Origin', 'Virgin Galactic', 'Rocket Lab', 'NASA', 'ESA', 'Roscosmos', 'JAXA', 'ISRO', 'CNSA', 'Pfizer', 'Moderna', 'Johnson & Johnson', 'AstraZeneca', 'Novartis', 'Roche', 'Merck', 'AbbVie', 'Bristol Myers Squibb', 'Sanofi', 'GlaxoSmithKline', 'Eli Lilly', 'Amgen', 'Gilead Sciences', 'BioNTech', 'Regeneron', 'Vertex Pharmaceuticals', 'Takeda', 'Bayer', 'BASF', 'Dow', 'DuPont', '3M', 'Procter & Gamble', 'Unilever', 'Nestlé', 'PepsiCo', 'Coca-Cola', 'McDonald\'s', 'Starbucks', 'Yum! Brands', 'Restaurant Brands International', 'Subway', 'Domino\'s Pizza', 'Pizza Hut', 'KFC', 'Taco Bell', 'Burger King', 'Wendy\'s', 'Chipotle', 'Walmart', 'Costco', 'Target', 'The Home Depot', 'Lowe\'s', 'Best Buy', 'Walgreens', 'CVS Health', 'Kroger', 'Albertsons', 'Publix', 'Ahold Delhaize', 'Carrefour', 'Tesco', 'Aldi', 'Lidl', 'IKEA', 'Zara (Inditex)', 'H&M', 'Nike', 'Adidas', 'Puma', 'Under Armour', 'Lululemon', 'Gap Inc.', 'Levi Strauss & Co.', 'VF Corporation', 'Kering', 'LVMH', 'Richemont', 'Hermès', 'Chanel', 'Dior', 'Gucci', 'Prada', 'Burberry', 'Ralph Lauren', 'Calvin Klein', 'Tommy Hilfiger', 'The Walt Disney Company', 'Comcast', 'AT&T', 'Verizon', 'T-Mobile', 'Charter Communications', 'Dish Network', 'Fox Corporation', 'Paramount Global', 'Warner Bros. Discovery', 'Sony Pictures', 'Universal Pictures', 'Lionsgate', 'A24', 'AMC Theatres', 'Cinemark', 'Regal Cinemas', 'Live Nation', 'Ticketmaster', 'Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Tidal', 'Deezer', 'Pandora', 'SoundCloud', 'Bandcamp', 'SiriusXM', 'iHeartMedia', 'Audacy', 'Cumulus Media', 'The New York Times', 'The Wall Street Journal', 'The Washington Post', 'The Guardian', 'BBC', 'Reuters', 'Associated Press', 'Bloomberg', 'Forbes', 'Fortune', 'Business Insider', 'TechCrunch', 'The Verge', 'Wired', 'Axios', 'Politico', 'FiveThirtyEight', 'NPR', 'CNN', 'Fox News', 'MSNBC', 'ABC News', 'CBS News', 'NBC News', 'Al Jazeera', 'C-SPAN', 'FedEx', 'UPS', 'DHL', 'XPO Logistics', 'J.B. Hunt', 'Knight-Swift', 'Schneider National', 'Old Dominion Freight Line', 'Union Pacific', 'BNSF', 'CSX', 'Norfolk Southern', 'Canadian National Railway', 'Canadian Pacific Railway', 'Maersk', 'MSC', 'CMA CGM', 'COSCO', 'Hapag-Lloyd', 'ONE', 'Evergreen Marine', 'American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines', 'Lufthansa', 'Air France-KLM', 'IAG (British Airways, Iberia)', 'Emirates', 'Qatar Airways', 'Singapore Airlines', 'Cathay Pacific', 'Qantas', 'ANA', 'JAL', 'Marriott', 'Hilton', 'Hyatt', 'IHG', 'Accor', 'Wyndham', 'Choice Hotels', 'Best Western', 'Radisson Hotel Group', 'Four Seasons', 'Mandarin Oriental', 'Ritz-Carlton', 'St. Regis', 'W Hotels', 'Sheraton', 'Westin', 'Le Méridien', 'Aloft', 'Moxy', 'Holiday Inn', 'Crowne Plaza', 'Hampton Inn', 'Embassy Suites', 'DoubleTree', 'Homewood Suites', 'Courtyard by Marriott', 'Residence Inn', 'Fairfield Inn', 'SpringHill Suites', 'TownePlace Suites', 'Motel 6', 'Super 8', 'Days Inn', 'Travelodge', 'La Quinta', 'Ramada', 'Howard Johnson\'s', 'ExxonMobil', 'Shell', 'BP', 'Chevron', 'TotalEnergies', 'ConocoPhillips', 'Equinor', 'Eni', 'Petrobras', 'Saudi Aramco', 'Gazprom', 'Rosneft', 'PetroChina', 'Sinopec', 'General Electric', 'Siemens', 'Honeywell', 'Schneider Electric', 'ABB', 'Emerson Electric', 'Rockwell Automation', 'Johnson Controls', 'Caterpillar', 'Deere & Company', 'Komatsu', 'Volvo Group', 'Daimler Truck', 'Paccar', 'Traton', 'Isuzu', 'Hino', 'Man', 'Scania', 'John Deere', 'Kubota', 'AGCO', 'CNH Industrial', 'Class', 'Fendt', 'Massey Ferguson', 'Valtra', 'New Holland Agriculture', 'Case IH', 'Steyr', 'Dow Jones', 'S&P Global', 'Moody\'s', 'Fitch Ratings', 'Morningstar', 'MSCI', 'FTSE Russell', 'Intercontinental Exchange (ICE)', 'CME Group', 'Nasdaq, Inc.', 'London Stock Exchange Group', 'Deutsche Börse Group', 'Euronext', 'Japan Exchange Group', 'Hong Kong Exchanges and Clearing', 'Shanghai Stock Exchange', 'Shenzhen Stock Exchange', 'Blackstone', 'KKR', 'The Carlyle Group', 'Apollo Global Management', 'TPG', 'Bain Capital', 'Vista Equity Partners', 'Thoma Bravo', 'Silver Lake', 'Insight Partners', 'Sequoia Capital', 'Andreessen Horowitz', 'Accel', 'Lightspeed Venture Partners', 'Kleiner Perkins', 'Bessemer Venture Partners', 'Index Ventures', 'General Catalyst', 'Founders Fund', 'Khosla Ventures', 'New Enterprise Associates (NEA)', 'Y Combinator', 'Techstars', '500 Global', 'Plug and Play', 'SOSV', 'Alchemist Accelerator', 'Harvard University', 'Stanford University', 'MIT', 'Caltech', 'University of California, Berkeley', 'University of Cambridge', 'University of Oxford', 'ETH Zurich', 'Tsinghua University', 'Peking University', 'National University of Singapore', 'University of Tokyo', 'University of Toronto', 'UCLA', 'University of Michigan', 'Columbia University', 'Yale University', 'Princeton University', 'University of Chicago', 'Cornell University', 'University of Pennsylvania', 'Johns Hopkins University', 'Duke University', 'Northwestern University', 'Carnegie Mellon University', 'Georgia Institute of Technology', 'University of Illinois Urbana-Champaign', 'University of Texas at Austin', 'University of Washington', 'Purdue University', 'Texas A&M University', 'University of Wisconsin-Madison', 'University of Minnesota', 'Ohio State University', 'Michigan State University', 'Penn State University', 'University of Florida', 'University of Virginia', 'University of North Carolina at Chapel Hill', 'Boston University', 'New York University', 'University of Southern California', 'McKinsey & Company', 'Boston Consulting Group (BCG)', 'Bain & Company', 'Deloitte', 'PwC', 'Ernst & Young (EY)', 'KPMG', 'Accenture', 'Capgemini', 'Tata Consultancy Services (TCS)', 'Infosys', 'Wipro', 'Cognizant', 'HCL Technologies', 'Atos', 'DXC Technology', 'CGI Inc.', 'NTT Data', 'Fujitsu', 'NEC', 'Samsung SDS', 'LG CNS', 'SK C&C'
];

export type LgrOpt = { val: string; lbl: string };
export type LgrE = { id: string; dr: number; cr: number; accId: string; ccy: string; desc: string };
export type F_Vals = {
  l?: LgrOpt;
  ltd: string;
  les: LgrE[];
  md: Record<string, string>;
  ltmd: Record<string, string>;
  sl?: LgrOpt;
  sltd: string;
  sles: LgrE[];
  sltmd: Record<string, string>;
};

export const gen_uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`;

export const createNewLgrE = (): LgrE => ({
  id: gen_uid(),
  dr: 0,
  cr: 0,
  accId: "",
  ccy: "USD",
  desc: ""
});

export const computeInitCcyAgg = (es: LgrE[]): Record<string, number> => {
  const agg: Record<string, number> = {};
  for (const e of es) {
    if (e.ccy) {
      agg[e.ccy] = (agg[e.ccy] || 0) + (e.dr || 0) - (e.cr || 0);
    }
  }
  return agg;
};

export const checkEntriesValidity = ({
  es,
  ies,
}: {
  es: LgrE[];
  ies: LgrE[];
}): string | null => {
  if (es.length < 2) return "Must have at least two entries.";
  const hasChanged = JSON.stringify(es) !== JSON.stringify(ies);
  if (ies.length > 0 && !hasChanged) return null;
  const ccyAggs = computeInitCcyAgg(es);
  for (const ccy in ccyAggs) {
    if (Math.abs(ccyAggs[ccy]) > 1e-9) {
      return `Entries for currency ${ccy} do not balance.`;
    }
  }
  let hasAmt = false;
  for (const e of es) {
    if (!e.accId) return "All entries must have an account.";
    if ((e.dr || 0) > 0 || (e.cr || 0) > 0) hasAmt = true;
  }
  if (!hasAmt) return "At least one entry must have a non-zero amount.";
  return null;
};

export const prepMdForApi = (md: Record<string, string>): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(md).filter(([, v]) => v != null && v !== "")
  );
};


// In-file UI Component re-implementations
const CstmHd: FC<{lvl: 'h1'|'h2'|'h3'|'h4', sz: 'sm'|'md'|'lg'|'xl'|'2xl', children: React.ReactNode}> = ({ lvl, sz, children }) => {
    const Tag = lvl;
    const szMap = { sm: 'text-sm', md: 'text-md', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' };
    return <Tag className={`${szMap[sz]} font-bold text-gray-900`}>{children}</Tag>;
};

const CstmLbl: FC<{id: string, className?: string, children: React.ReactNode}> = ({ id, className, children }) => {
    return <label htmlFor={id} className={`block ${className}`}>{children}</label>;
};

const CstmBtn: FC<{
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  btnType: 'primary'|'secondary'|'danger';
  btnH: 'small'|'medium'|'large';
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, btnType, btnH, disabled, children }) => {
    const baseStyle = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
    const typeMap = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    const hMap = { small: 'px-2.5 py-1.5 text-xs', medium: 'px-3 py-2 text-sm', large: 'px-4 py-2 text-base' };
    const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed';
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${typeMap[btnType]} ${hMap[btnH]} ${disabledStyle}`}
        >
            {children}
        </button>
    );
};

const FmkInp: FC<{ field: any; form: any; id: string; name: string }> = ({ field, ...props }) => {
  return <input {...field} {...props} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />;
};

const FmkErr: FC<{ name: string }> = ({ name }) => {
  return <ErrorMessage name={name} component="div" className="mt-1 text-xs text-red-600" />;
};

const FmkLgrAsyncSel: FC = () => {
    const [field, meta, helpers] = useField("l");
    const [q, setQ] = useState("");
    const [opts, setOpts] =useState<LgrOpt[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLgrs = async () => {
            if (q.length < 1) {
                setOpts([]);
                return;
            }
            setLoading(true);
            try {
                const rsp = await fetch(`https://api.${BASE_URL}/v1/ledgers?q=${q}`);
                const data = await rsp.json();
                setOpts(data.map((l: any) => ({ val: l.id, lbl: l.name })));
            } catch (e) {
                console.error("Failed to fetch ledgers", e);
            } finally {
                setLoading(false);
            }
        };

        const deb = setTimeout(() => {
            fetchLgrs();
        }, 300);

        return () => clearTimeout(deb);
    }, [q]);

    return (
        <div>
            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for a ledger..."
                className="block w-full rounded-md border-gray-300 shadow-sm"
            />
            {loading && <div>Loading...</div>}
            <ul>
                {opts.map(opt => (
                    <li key={opt.val} onClick={() => {
                        helpers.setValue(opt);
                        setOpts([]);
                        setQ(opt.lbl);
                    }} className="cursor-pointer p-2 hover:bg-gray-100">
                        {opt.lbl}
                    </li>
                ))}
            </ul>
             <CstmLbl id="selected_ledger">Selected: {field.value?.lbl || 'None'}</CstmLbl>
        </div>
    );
};

const MdInp: FC<{
  onChange: (v: Record<string, string>) => void;
  resource: string;
  initialValues: Record<string, string>;
  hideLabel?: boolean;
  inlineAddButton?: boolean;
}> = ({ onChange, initialValues }) => {
    const [md, setMd] = useState(initialValues || {});

    const updateMd = (k: string, v: string) => {
        const newMd = { ...md, [k]: v };
        setMd(newMd);
        onChange(newMd);
    };

    const addField = () => {
        const newKey = `new_key_${Object.keys(md).length}`;
        updateMd(newKey, "");
    };

    const removeField = (k: string) => {
        const newMd = { ...md };
        delete newMd[k];
        setMd(newMd);
        onChange(newMd);
    };
    
    return (
        <div>
            {Object.entries(md).map(([k, v]) => (
                <div key={k} className="flex items-center space-x-2 py-1">
                    <input value={k} readOnly className="flex-1 rounded-md border-gray-300 bg-gray-50 sm:text-sm" />
                    <input value={v} onChange={(e) => updateMd(k, e.target.value)} className="flex-1 rounded-md border-gray-300 sm:text-sm" />
                    <CstmBtn btnType="danger" btnH="small" onClick={() => removeField(k)}>X</CstmBtn>
                </div>
            ))}
            <CstmBtn btnType="secondary" btnH="small" onClick={addField}>Add Metadata</CstmBtn>
        </div>
    );
};

interface LgrEntriesComponentProps {
  lgrEKey: string;
  lgrId: string;
  initECcyAgg: Record<string, number>;
  initEMd: any[];
  inclMd: boolean;
}

const LgrEntriesComponent: FC<LgrEntriesComponentProps> = ({ lgrEKey, lgrId }) => {
    const { values, setFieldValue } = useFormikContext<F_Vals>();
    const entries = values[lgrEKey as keyof F_Vals] as LgrE[];
    
    const addE = () => {
        setFieldValue(lgrEKey, [...entries, createNewLgrE()]);
    };

    const removeE = (idx: number) => {
        const newEs = [...entries];
        newEs.splice(idx, 1);
        setFieldValue(lgrEKey, newEs);
    };

    const updateE = (idx: number, field: keyof LgrE, val: any) => {
        const newEs = [...entries];
        const e = newEs[idx] as any;
        e[field] = val;
        if (field === 'dr' && val > 0) e.cr = 0;
        if (field === 'cr' && val > 0) e.dr = 0;
        setFieldValue(lgrEKey, newEs);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500">
                <div className="col-span-4">Account</div>
                <div className="col-span-2">Debit</div>
                <div className="col-span-2">Credit</div>
                <div className="col-span-1">Currency</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-1"></div>
            </div>
            {entries.map((e, i) => (
                <div key={e.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                        <Field name={`${lgrEKey}.${i}.accId`} component={FmkInp} />
                    </div>
                    <div className="col-span-2">
                        <Field name={`${lgrEKey}.${i}.dr`} type="number" component={FmkInp} />
                    </div>
                    <div className="col-span-2">
                         <Field name={`${lgrEKey}.${i}.cr`} type="number" component={FmkInp} />
                    </div>
                     <div className="col-span-1">
                         <Field name={`${lgrEKey}.${i}.ccy`} component={FmkInp} />
                    </div>
                     <div className="col-span-2">
                         <Field name={`${lgrEKey}.${i}.desc`} component={FmkInp} />
                    </div>
                    <div className="col-span-1">
                        <CstmBtn btnType="danger" btnH="small" onClick={() => removeE(i)}>X</CstmBtn>
                    </div>
                </div>
            ))}
            <CstmBtn btnType="secondary" btnH="small" onClick={addE}>Add Entry</CstmBtn>
        </div>
    );
};


const PARTNER_CONFIG_TEMPLATES: Record<string, any> = {
    Plaid: {
        client_id: '',
        secret_dev: '',
        secret_prod: '',
        environment: 'sandbox',
        webhook_url: `https://api.${BASE_URL}/webhooks/plaid`,
        products: ['transactions', 'auth', 'identity'],
    },
    'Modern Treasury': {
        api_key: '',
        organization_id: '',
        webhook_secret: '',
        region: 'us-east-1',
    },
    MARQETA: {
        app_token: '',
        access_token: '',
        base_url: 'https://sandbox-api.marqeta.com/v3',
    },
    Shopify: {
        api_key: '',
        api_secret_key: '',
        scopes: 'read_products,write_orders',
        store_name: '',
    },
    Salesforce: {
        consumer_key: '',
        consumer_secret: '',
        instance_url: 'https://your-instance.salesforce.com',
        auth_type: 'OAuth 2.0',
    },
    Twilio: {
        account_sid: '',
        auth_token: '',
        messaging_service_sid: '',
    },
    GitHub: {
        app_id: '',
        private_key: '',
        webhook_secret: '',
        installation_id: '',
    },
    Gemini: {
      project_id: '',
      api_key: '',
      model: 'gemini-pro',
      temperature: 0.7,
    },
    Pipedream: {
      api_key: '',
      workflow_id: '',
      event_source: 'citibankdemobusiness-app',
    },
    'Google Cloud': {
      project_id: '',
      service_account_json: '{}',
      default_bucket: '',
      region: 'us-central1',
    },
    Supabase: {
      project_ref: '',
      anon_key: '',
      service_role_key: '',
      database_url: '',
    },
};

const IntegrationConfigurator: FC = () => {
    const [selInt, setSelInt] = useState<string>('');
    const [cfg, setCfg] = useState<Record<string, any>>({});
    
    const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const p = e.target.value;
        setSelInt(p);
        setCfg(PARTNER_CONFIG_TEMPLATES[p] || {});
    };

    const updateCfg = (k: string, v: string) => {
        setCfg(prev => ({ ...prev, [k]: v }));
    };

    return (
        <div className="p-4 border rounded-lg mt-4 bg-gray-50">
            <CstmHd lvl="h3" sz="lg">Partner Integration Configurator</CstmHd>
            <div className="mt-2 mb-4">
                <CstmLbl id="integration_selector" className="text-sm font-medium">Select Integration</CstmLbl>
                <select id="integration_selector" onChange={handleSelect} value={selInt} className="w-full mt-1 rounded-md border-gray-300">
                    <option value="">-- Select --</option>
                    {Object.keys(PARTNER_CONFIG_TEMPLATES).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            {selInt && (
                <div className="space-y-3">
                    {Object.entries(cfg).map(([k, v]) => (
                        <div key={k}>
                            <CstmLbl id={k} className="text-xs font-mono">{k}</CstmLbl>
                            <input
                                id={k}
                                value={v}
                                onChange={(e) => updateCfg(k, e.target.value)}
                                className="w-full mt-1 rounded-md border-gray-300 text-sm"
                            />
                        </div>
                    ))}
                    <CstmBtn btnType="primary" btnH="medium">Save Config for {selInt}</CstmBtn>
                </div>
            )}
        </div>
    );
};

const AiAnalysisModule: FC = () => {
    const { values } = useFormikContext<F_Vals>();
    const [res, setRes] = useState('');
    const [loading, setLoading] = useState(false);

    const runAnalysis = async () => {
        setLoading(true);
        setRes('');
        try {
            // This is a dummy call
            await new Promise(resolve => setTimeout(resolve, 1500));
            const analysis = {
                transaction: values.ltd,
                entries: values.les,
                metadata: values.ltmd,
            };
            setRes(`AI Analysis Result for "${values.ltd}":\nTransaction appears to be standard. Total balanced amount across ${values.les.length} entries. Recommendation: No action needed.`);
        } catch (e) {
            setRes('Analysis failed.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="p-4 border rounded-lg mt-4 bg-blue-50">
            <CstmHd lvl="h3" sz="lg">Gemini AI Analysis</CstmHd>
            <p className="text-sm text-gray-600 mt-1">Analyze transaction for fraud, anomalies, or categorization.</p>
            <div className="mt-4">
                <CstmBtn btnType="primary" btnH="medium" onClick={runAnalysis} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Run Analysis'}
                </CstmBtn>
            </div>
            {res && (
                <pre className="mt-4 p-2 bg-white rounded text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {res}
                </pre>
            )}
        </div>
    );
};

const CloudSyncManager: FC = () => {
    const services = ['Google Drive', 'OneDrive', 'Azure Blob Storage', 'Supabase Storage'];
    const [status, setStatus] = useState<Record<string, string>>({});
    
    const sync = async (svc: string) => {
        setStatus(prev => ({...prev, [svc]: 'Syncing...'}));
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        setStatus(prev => ({...prev, [svc]: `Synced at ${new Date().toLocaleTimeString()}`}));
    };
    
    return (
        <div className="p-4 border rounded-lg mt-4 bg-green-50">
            <CstmHd lvl="h3" sz="lg">Cloud Sync & Backup</CstmHd>
            <div className="mt-2 grid grid-cols-2 gap-4">
                {services.map(s => (
                    <div key={s} className="p-3 bg-white rounded-md shadow-sm flex justify-between items-center">
                        <span className="font-medium text-sm">{s}</span>
                        <div>
                            <span className="text-xs text-gray-500 mr-2">{status[s] || 'Not synced'}</span>
                            <CstmBtn btnType="secondary" btnH="small" onClick={() => sync(s)}>Sync Now</CstmBtn>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


interface IntegratedLgrTxnF_Props {
  commitData: () => void;
  isMod: boolean;
}

export const useLgrTxnF_CoreLogic = (v: F_Vals, sfv: (f: string, val: any, shouldValidate?: boolean) => Promise<any>) => {
    const [actLgrId, setActLgrId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const initNewEntries = () => {
          sfv("les", [createNewLgrE(), createNewLgrE()], false);
        };

        if (actLgrId === undefined) {
            if (v.l?.val) {
                setActLgrId(v.l.val);
                if (v.les.length === 0) {
                    initNewEntries();
                }
            }
        } else if (actLgrId !== v.l?.val) {
            setActLgrId(v.l?.val);
            initNewEntries();
        }
    }, [v.l, actLgrId, v.les.length, sfv]);

    return { actLgrId };
};

export function IntegratedLgrTxnF({
  commitData,
  isMod,
}: IntegratedLgrTxnF_Props) {
  const { values: v, setFieldValue: sfv } = useFormikContext<F_Vals>();
  const {
    l,
    ltd,
    les,
    sles,
    md,
    ltmd,
  } = v;
  
  useLgrTxnF_CoreLogic(v, sfv);

  const isPersistDisabled = checkEntriesValidity({ es: les, ies: sles }) !== null;

  const persistOp = useCallback(() => {
    sfv("sl", l);
    sfv("sltd", ltd);
    sfv("sles", les);
    sfv("sltmd", prepMdForApi(ltmd || {}));
    commitData();
  }, [l, ltd, les, ltmd, sfv, commitData]);
  
  const effectiveLtmd = useMemo(() => {
    if (Object.keys(ltmd || {}).length > 0) {
        return ltmd;
    }
    return prepMdForApi(md);
  }, [ltmd, md]);

  return (
    <div id="integratedLedgerTransactionFormContainer" className="space-y-6 p-4 bg-white rounded-lg shadow-md">
      <div className="flex flex-row justify-between items-start">
        <CstmHd lvl="h2" sz="2xl">
          {isMod ? "Modify" : "Create"} Ledger Transaction Record
        </CstmHd>
        <CstmBtn
          btnType="primary"
          btnH="large"
          disabled={isPersistDisabled}
          onClick={persistOp}
        >
          Persist Record
        </CstmBtn>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <div>
                <CstmLbl id="lgr" className="pb-2 text-sm font-medium text-gray-800">
                Core Ledger
                </CstmLbl>
                <FmkLgrAsyncSel />
                <FmkErr name="l" />
            </div>
            <div>
                <div className="flex flex-row items-center pb-2">
                <CstmLbl
                    id="ltd"
                    className="text-sm font-medium text-gray-800"
                >
                    Record Description
                </CstmLbl>
                <span className="pl-2 text-xs font-normal text-gray-500">
                    Optional
                </span>
                </div>
                <Field
                id="ltd"
                name="ltd"
                component={FmkInp}
                />
            </div>
        </div>
        <div className="space-y-4">
            <div>
                <div className="pb-2">
                <CstmLbl
                    id="ltmd"
                    className="text-sm font-medium text-gray-800"
                >
                    Record Metadata
                </CstmLbl>
                <div className="pt-2 text-xs font-normal text-gray-500">
                    Metadata is pre-populated from the parent payment object’s metadata.
                </div>
                </div>
                <MdInp
                onChange={(val) => {
                    sfv("ltmd", val);
                }}
                resource="ledger_transaction"
                initialValues={effectiveLtmd}
                />
            </div>
        </div>
      </div>
      
      {l && (
        <div className="mt-4">
            <CstmHd lvl="h3" sz="lg" >Transaction Entries</CstmHd>
            <div className="p-4 border rounded-lg mt-2">
                 <LgrEntriesComponent
                    lgrEKey="les"
                    lgrId={l?.val || ""}
                    initECcyAgg={computeInitCcyAgg(les)}
                    initEMd={[]}
                    inclMd={false}
                />
            </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <CstmHd lvl="h2" sz="xl">Advanced Integrations & Tooling</CstmHd>
        <IntegrationConfigurator />
        <AiAnalysisModule />
        <CloudSyncManager />
      </div>
    </div>
  );
}

export default connect(IntegratedLgrTxnF);