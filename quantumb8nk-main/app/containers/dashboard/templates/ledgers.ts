export type SzU = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'pt';
export type ElemW = `1/${'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'11'|'12'}` | 'full' | 'auto' | 'min' | 'max';
export type ElemH = 'full' | 'auto' | 'screen' | string;
export type Coords = { x_axis: number; y_axis: number; z_axis?: number };
export type Dims = { w: string | number; h: string | number };
export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
export type AuthScheme = 'oauth2' | 'apikey' | 'jwt' | 'basic' | 'saml' | 'openid' | 'mtls' | 'none';
export type CacheStrat = 'lru' | 'fifo' | 'lifo' | 'mru' | 'random';
export type WidgetFamily = 'chart' | 'grid' | 'statistic' | 'geospatial' | 'prose' | 'interaction' | 'custom' | 'indicator' | 'pivot';
export type SourceSystem = 'api' | 'websocket' | 'database' | 'localstorage' | 'eventstream' | 'file' | 'grpc';
export type DatabaseDialect = 'postgresql' | 'mysql' | 'mssql' | 'oracle' | 'sqlite' | 'mariadb' | 'snowflake' | 'redshift' | 'bigquery' | 'mongodb';
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter' | 'gantt' | 'candlestick';
export type TransformationEngine = 'javascript' | 'python' | 'wasm' | 'jsonata';

export interface AuthenticationProfile {
  ath_scheme: AuthScheme;
  ath_cred?: { api_k?: string; api_s?: string; bearer_t?: string; usr?: string; pwd?: string; };
  ath_ep?: { auth_url: string; tkn_url:string; refresh_url?: string; revoke_url?: string; };
  ath_scopes?: string[];
  ath_metadata?: Record<string, any>;
}

export interface EndpointDescriptor {
  ep_url: string;
  ep_verb: HttpVerb;
  ep_headers?: Record<string, string>;
  ep_body_schema?: object;
  ep_resp_schema?: object;
  ep_rate_limit?: { req_per_min: number; burst: number; };
}

export interface WebSocketLink {
  ws_url: string;
  ws_protocols?: string[];
  ws_auto_reconnect?: boolean;
}

export interface DatabaseConnector {
  db_dialect: DatabaseDialect;
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  db_pass_ref: string;
  db_ssl_mode: 'require' | 'prefer' | 'allow' | 'disable';
  db_query: string;
}

export interface GrpcConnector {
  grpc_url: string;
  grpc_proto_definition: string;
  grpc_service: string;
  grpc_method: string;
}

export interface EventStreamConnector {
  es_type: 'kafka' | 'pulsar' | 'rabbitmq';
  es_brokers: string[];
  es_topic: string;
  es_consumer_group: string;
}

export interface LocalDataPayload {
  ld_payload: any[];
  ld_schema: object;
}

export interface DataFeed {
  df_id: string;
  df_src_type: SourceSystem;
  df_connection: EndpointDescriptor | WebSocketLink | DatabaseConnector | LocalDataPayload | EventStreamConnector | GrpcConnector;
  df_auth_profile?: AuthenticationProfile;
  df_transform?: { engine: TransformationEngine, script: string };
  df_cache_policy?: { ttl_seconds: number; strategy: CacheStrat };
}

export interface WidgetInteraction {
  evt: 'click' | 'hover' | 'drag' | 'select';
  act: 'filter' | 'navigate' | 'drilldown' | 'custom_event';
  tgt_id: string;
  payload_map: string;
}

export interface WidgetSpec {
  wid: string;
  w_fam: WidgetFamily;
  w_title: string;
  w_data_feed_id: string;
  w_opts?: Record<string, any>;
  w_interactions?: WidgetInteraction[];
}

export interface ComponentPod {
  pod_id: string;
  pod_width: ElemW;
  pod_height?: ElemH;
  pod_widgets: WidgetSpec[];
  pod_config?: Record<string, any>;
}

export interface LayoutFrame {
  frame_containers: ComponentPod[];
}

export interface LayoutSection {
  sec_columns: LayoutFrame[];
}

export interface DisplayCanvas {
  can_items: LayoutSection[];
  can_width: 'full' | 'contained';
  can_path: string;
}

export interface FinancialMatrixConfiguration {
  fm_schema_ver: string;
  fm_base_uri: string;
  fm_corp_id: { corp_name: string; corp_legal_name: string; corp_contact: string; };
  fm_data_feeds: DataFeed[];
  fm_display_canvases: Record<string, DisplayCanvas>;
  fm_global_functions?: Record<string, string>;
}

export function generate_api_endpoint(base: string, path: string, verb: HttpVerb, id: string): DataFeed {
  return {
    df_id: `${id}_${path.replace(/\//g, '_')}`,
    df_src_type: 'api',
    df_connection: {
      ep_url: `https://${base}/${path}`,
      ep_verb: verb,
      ep_headers: { 'X-App-Name': 'Citibank-Demo-Business-Inc-Platform', 'Content-Type': 'application/json' },
      ep_rate_limit: { req_per_min: 60, burst: 10 },
    },
    df_auth_profile: {
      ath_scheme: 'oauth2',
      ath_ep: {
        auth_url: `https://auth.${base}/authorize`,
        tkn_url: `https://auth.${base}/token`,
      },
      ath_scopes: ['read:all', 'write:some'],
    },
  };
}

const c_list = [
  'Gemini', 'ChatGPT', 'Pipedream', 'GitHub', 'HuggingFace', 'Plaid', 'ModernTreasury', 'GoogleDrive',
  'OneDrive', 'Azure', 'GoogleCloud', 'Supabase', 'Vercel', 'Salesforce', 'Oracle', 'MARQETA',
  'Citibank', 'Shopify', 'WooCommerce', 'GoDaddy', 'Cpanel', 'Adobe', 'Twilio', 'Stripe', 'PayPal',
  'Square', 'QuickBooks', 'Xero', 'Gusto', 'Brex', 'Ramp', 'Airtable', 'Notion', 'Slack', 'Zoom',
  'MicrosoftTeams', 'Asana', 'Trello', 'Jira', 'Confluence', 'Dropbox', 'Box', 'DocuSign',
  'HubSpot', 'Marketo', 'Mailchimp', 'SendGrid', 'Segment', 'Datadog', 'NewRelic', 'Sentry',
  'Splunk', 'Snowflake', 'Databricks', 'Redshift', 'BigQuery', 'MongoDB', 'Redis', 'PostgreSQL',
  'MySQL', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CircleCI', 'GitLab',
  'Bitbucket', 'Figma', 'Sketch', 'InVision', 'Zendesk', 'Intercom', 'Freshdesk', 'ServiceNow',
  'Workday', 'SAP', 'NetSuite', 'EpicSystems', 'Cerner', 'Auth0', 'Okta', 'Cloudflare', 'Fastly',
  'Akamai', 'TwilioFlex', 'Agora', 'Vonage', 'Braintree', 'Adyen', 'Worldpay', 'Cybersource',
  'BillCom', 'Expensify', 'Carta', 'AngelList', 'Crunchbase', 'AWS_S3', 'AWS_EC2', 'AWS_Lambda',
  'AWS_RDS', 'Looker', 'Tableau', 'PowerBI', 'Algolia', 'Elastic', 'Contentful', 'Strapi',
  'SanityIO', 'Docusign', 'Avalara', 'Vertex', 'Intuit', 'Yodlee', 'Finicity', 'Akoya',
  'MX', 'Unit21', 'Alloy', 'ComplyAdvantage', 'Chainalysis', 'Elliptic', 'Coinbase', 'Binance',

  'Kraken', 'KuCoin', 'Bitstamp', 'Bitfinex', 'Huobi', 'OKX', 'CryptoCom', 'FTX_Legacy',
  'BlockFi_Legacy', 'Celsius_Legacy', 'Voyager_Legacy', 'Genesis_Legacy', 'ThreeArrows_Legacy',
  'Alameda_Legacy', 'MetaMask', 'Ledger', 'Trezor', 'Phantom', 'Solflare', 'Etherscan',
  'Polygonscan', 'BscScan', 'Solscan', 'Arbiscan', 'OptimismExplorer', 'Uniswap', 'Sushiswap',
  'Pancakeswap', 'Curve', 'Aave', 'Compound', 'MakerDAO', 'Lido', 'RocketPool', 'YearnFinance',
  'Balancer', 'Synthetix', 'TheGraph', 'Chainlink', 'Infura', 'Alchemy', 'Moralis',
  'QuickNode', 'Tatum', 'Fireblocks', 'Anchorage', 'Copper', 'BitGo', 'Paxos', 'Circle',
  'Tether', 'Visa', 'Mastercard', 'AmericanExpress', 'Discover', 'JPMorganChase',
  'BankOfAmerica', 'WellsFargo', 'GoldmanSachs', 'MorganStanley', 'BlackRock', 'Fidelity',
  'Vanguard', 'CharlesSchwab', 'StateStreet', 'BNYMellon', 'NorthernTrust',
  'CapitalOne', 'USBank', 'PNC', 'Truist', 'TD_Bank', 'FifthThirdBank', 'CitizensBank',
  'AllyBank', 'Synchrony', 'Barclays', 'HSBC', 'DeutscheBank', 'UBS', 'CreditSuisse',
  'BNP_Paribas', 'SocieteGenerale', 'Santander', 'BBVA', 'ING', 'Rabobank', 'Nomura',
  'Mizuho', 'SMBC', 'MUFG', 'RBC', 'TD_Canada', 'Scotiabank', 'BMO', 'CIBC',
  'NationalBankOfCanada', 'ANZ', 'NAB', 'CommonwealthBank', 'Westpac', 'Macquarie',
  'StandardChartered', 'DBS', 'OCBC', 'UOB', 'ICBC', 'ChinaConstructionBank',
  'AgriculturalBankOfChina', 'BankOfChina', 'SoftBank', 'Tencent', 'Alibaba',
  'Baidu', 'JDcom', 'Meituan', 'Pinduoduo', 'ByteDance', 'Huawei', 'Xiaomi', 'Oppo',
  'Vivo', 'Samsung', 'LG', 'Sony', 'Panasonic', 'Hitachi', 'Toshiba', 'NEC', 'Fujitsu',
  'Toyota', 'Honda', 'Nissan', 'Volkswagen', 'BMW', 'MercedesBenz', 'Ford', 'GM',
  'Tesla', 'Nvidia', 'Intel', 'AMD', 'Qualcomm', 'Broadcom', 'TexasInstruments',
  'Micron', 'TSMC', 'ASML', 'Apple', 'Google', 'Microsoft', 'Amazon', 'Meta',
  'Netflix', 'Spotify', 'Disney', 'Comcast', 'ATT', 'Verizon', 'T-Mobile',
  'Walmart', 'Target', 'Costco', 'HomeDepot', 'Lowes', 'CVS', 'Walgreens',
  'UnitedHealth', 'Cigna', 'Anthem', 'Humana', 'Aetna', 'Pfizer', 'JohnsonAndJohnson',
  'Moderna', 'Merck', 'BristolMyersSquibb', 'AbbVie', 'EliLilly', 'Gilead', 'Amgen',
  'Biogen', 'Regeneron', 'VertexPharma', 'ExxonMobil', 'Chevron', 'Shell', 'BP',
  'TotalEnergies', 'ConocoPhillips', 'Schlumberger', 'Halliburton', 'BakerHughes',
  'Boeing', 'Airbus', 'LockheedMartin', 'Raytheon', 'NorthropGrumman', 'GeneralDynamics',
  'SpaceX', 'BlueOrigin', 'VirginGalactic', 'RocketLab', 'Astra', 'PlanetLabs',
  'Blackstone', 'KKR', 'Carlyle', 'Apollo', 'BainCapital', 'TPG', 'Ares',
  'BerkshireHathaway', 'RenaissanceTechnologies', 'Bridgewater', 'Citadel',
  'Point72', 'Millennium', 'DE_Shaw', 'TwoSigma', 'JaneStreet', 'Virtu',
  'FlowTraders', 'JumpTrading', 'DRW', 'Optiver', 'IMC', 'Akuna',
  'Susquehanna', 'Wolverine', 'Simplex', 'XR_Trading', 'CME_Group', 'ICE',
  'Nasdaq', 'CBOE', 'LSEG', 'DeutscheBorse', 'Euronext', 'HKEX', 'SGX', 'ASX',
  'TMX', 'JSG', 'KRX', 'B3', 'MOEX', 'Tadawul', 'NSE_India', 'BSE_India',
  'S&P_Global', 'Moody', 'Fitch', 'MSCI', 'FTSE_Russell', 'Bloomberg',
  'Reuters', 'DowJones', 'FactSet', 'Morningstar', 'BlackKnight', 'CoreLogic',
  'Zillow', 'Redfin', 'Compass', 'Opendoor', 'CoStar', 'RealtorCom',
  'CBRE', 'JLL', 'CushmanWakefield', 'KnightFrank', 'Savills', 'Colliers',
  'Prologis', 'SimonProperty', 'DigitalRealty', 'Equinix', 'AmericanTower',
  'CrownCastle', 'SBA_Communications', 'IronMountain', 'PublicStorage',
  'ExtraSpaceStorage', 'Welltower', 'Ventas', 'HCP', 'RealtyIncome',
  'WP_Carey', 'VICI_Properties', 'GLPI', 'MGM_Growth', 'Brookfield',
  'BlackstoneRealEstate', 'StarwoodCapital', 'Hines', 'TishmanSpeyer',
  'RelatedCompanies', 'Vornado', 'BostonProperties', 'SL_Green', 'Emaar',
  'Nakheel', 'Damac', 'Aldar', 'Swire', 'SunHungKai', 'HendersonLand',
  'CK_Asset', 'CapitaLand', 'LinkREIT', 'GLP', 'MitsuiFudosan', 'MitsubishiEstate',
  'SumitomoRealty', 'TokyuLand', 'NomuraRealty', 'DaiwaHouse', 'SekisuiHouse',
  'IidaGroup', 'HajimeConstruction', 'OpenHouse', 'Lennar', 'DR_Horton',
  'PulteGroup', 'NVR', 'TollBrothers', 'KB_Home', 'TaylorMorrison', 'MeritageHomes',
  'ClaytonHomes', 'LGI_Homes', 'CenturyCommunities', 'MDC_Holdings', 'BeazerHomes',
  'Hovnanian', 'TriPointe', 'MI_Homes', 'TopBuild', 'InstalledBuildingProducts',
  'BuildersFirstSource', 'BeaconRoofing', 'Masco', 'MohawkIndustries', 'SherwinWilliams',
  'PPG', 'RPM_International', 'Carlisle', 'OwensCorning', 'JamesHardie',
  'Carrier', 'Trane', 'Lennox', 'JohnsonControls', 'Honeywell', 'Siemens',
  'SchneiderElectric', 'ABB', 'Emerson', 'Rockwell', 'Eaton', 'ParkerHannifin',
  'IllinoisToolWorks', '3M', 'GeneralElectric', 'Caterpillar', 'Deere', 'Cummins',
  'Paccar', 'Danaher', 'ThermoFisher', 'Agilent', 'Waters', 'PerkinElmer',
  'MettlerToledo', 'Illumina', 'PacificBiosciences', 'OxfordNanopore', '10xGenomics',
  'BectonDickinson', 'Stryker', 'Medtronic', 'BostonScientific', 'Abbott',
  'IntuitiveSurgical', 'EdwardsLifesciences', 'ZimmerBiomet', 'Baxter',
  'Danaher', 'Hologic', 'IDEXX', 'ResMed', 'AlignTechnology', 'Teleflex',
  'CooperCompanies', 'Insulet', 'Dexcom', 'Masimo', 'Steris', 'DentsplySirona',
  'Envista', 'HenrySchein', 'Patterson', 'McKesson', 'AmerisourceBergen',
  'CardinalHealth', 'FedEx', 'UPS', 'DHL', 'XPO_Logistics', 'JB_Hunt', 'KnightSwift',
  'OldDominion', 'Saia', 'ArcBest', 'CH_Robinson', 'Expeditors', 'KuehneNagel',
  'DSV', 'DB_Schenker', 'NipponExpress', 'Maersk', 'MSC', 'CMA_CGM', 'COSCO',
  'HapagLloyd', 'Evergreen', 'ONE', 'YangMing', 'HMM', 'ZIM', 'BNSF', 'UnionPacific',
  'NorfolkSouthern', 'CSX', 'CanadianNational', 'CanadianPacific', 'KansasCitySouthern',
  'Delta', 'AmericanAirlines', 'UnitedAirlines', 'Southwest', 'Lufthansa',
  'AirFranceKLM', 'IAG', 'Ryanair', 'EasyJet', 'Emirates', 'QatarAirways',
  'SingaporeAirlines', 'CathayPacific', 'Qantas', 'ANA', 'JAL', 'KoreanAir',
  'ChinaSouthern', 'ChinaEastern', 'AirChina', 'TurkishAirlines', 'Aeroflot',
  'Marriott', 'Hilton', 'IHG', 'Hyatt', 'Accor', 'Wyndham', 'ChoiceHotels',
  'BestWestern', 'Radisson', 'Airbnb', 'BookingHoldings', 'Expedia', 'TripAdvisor',
  'Trivago', 'Sabre', 'Amadeus', 'Travelport', 'Hertz', 'Avis', 'Enterprise',
 'Uber', 'Lyft', 'Didi', 'Grab', 'Ola', 'Bolt', 'GoJek', 'DoorDash',
  'UberEats', 'Grubhub', 'Instacart', 'Deliveroo', 'JustEatTakeaway', 'DeliveryHero',
  'Zomato', 'Swiggy', 'MeituanWaimai', 'Eleme', 'Rappi', 'iFood', 'Glovo',
  'Wolt', 'Postmates', 'Caviar', 'Seamless', 'Waitr', 'BiteSquad',
  'McDonalds', 'Starbucks', 'Subway', 'YumBrands', 'RestaurantBrands', 'Chipotle',
  'Dominos', 'Darden', 'BloominBrands', 'Brinker', 'TexasRoadhouse', 'CheesecakeFactory',
  'ShakeShack', 'Wendys', 'BurgerKing', 'TacoBell', 'KFC', 'PizzaHut',
  'PapaJohns', 'LittleCaesars', 'Dunkin', 'TimHortons', 'KrispyKreme',
  'CocaCola', 'PepsiCo', 'KeurigDrPepper', 'MonsterBeverage', 'ConstellationBrands',
  'AnheuserBusch', 'MolsonCoors', 'Heineken', 'Carlsberg', 'Diageo',
  'PernodRicard', 'BrownForman', 'BeamSuntory', 'Campari', 'RemyCointreau',
  'LVMH', 'Kering', 'Richemont', 'Hermes', 'Chanel', 'Loreal', 'EsteeLauder',
  'Coty', 'Shiseido', 'Kao', 'Unilever', 'ProcterGamble', 'ColgatePalmolive',
  'KimberlyClark', 'Reckitt', 'Henkel', 'Beiersdorf', 'JohnsonAndJohnsonConsumer',
  'Nestle', 'Danone', 'KraftHeinz', 'Mondelez', 'GeneralMills', 'Kellogg',
  'Conagra', 'CampbellSoup', 'Hormel', 'TysonFoods', 'JBS', 'Marfrig',
  'Cargill', 'ADM', 'Bunge', 'LouisDreyfus', 'Olam', 'Wilmar',
  'Syngenta', 'Bayer', 'BASF', 'Corteva', 'FMC', 'Nutrien',
  'Mosaic', 'CF_Industries', 'Yara', 'ICL', 'K+S',
  'RioTinto', 'BHP', 'Vale', 'Glencore', 'AngloAmerican', 'NorilskNickel',
  'FreeportMcMoRan', 'Newmont', 'BarrickGold', 'AgnicoEagle', 'Kinross',
  'Polyus', 'Polymetal', 'Alcoa', 'NorskHydro', 'Rusal', 'Chalco',
  'ArcelorMittal', 'NipponSteel', 'POSCO', 'Baosteel', 'TataSteel',
  'JSW_Steel', 'SteelDynamics', 'Nucor', 'US_Steel', 'ClevelandCliffs',
  'Nike', 'Adidas', 'Puma', 'UnderArmour', 'Lululemon', 'Anta', 'LiNing',
  'VF_Corp', 'PVH', 'CapriHoldings', 'Tapestry', 'RalphLauren', 'LeviStrauss',

  'Gap', 'Inditex', 'H&M', 'FastRetailing', 'AssociatedBritishFoods', 'TJX',
  'RossStores', 'Burlington', 'Nordstrom', 'Macys', 'Kohls', 'Dillards',
  'FootLocker', 'Dick_sSportingGoods', 'BestBuy', 'GameStop', 'BedBathAndBeyond',
  'WilliamsSonoma', 'RestorationHardware', 'Wayfair', 'Etsy', 'eBay', 'Rakuten',
  'MercadoLibre', 'SeaLtd', 'Allegro', 'Coupang', 'Flipkart', 'Snapdeal',
  'Jumia', 'Takealot', 'Noon', 'Souq', 'Lazada', 'Tokopedia', 'Bukalapak',
  'Blibli', 'Ozon', 'Wildberries', 'Avito', 'OLX', 'Quikr', 'Craigslist',
  'FacebookMarketplace', 'Nextdoor', 'Thumbtack', 'TaskRabbit', 'Angi',
  'Yelp', 'Foursquare', 'TripadvisorExperiences', 'Viator', 'GetYourGuide',
 'Klook', 'Tiqets', 'StubHub', 'Ticketmaster', 'LiveNation', 'AXS', 'SeatGeek',
  'VividSeats', 'Gametime', 'Dice', 'ResidentAdvisor', 'Bandsintown',
  'Patreon', 'Kickstarter', 'Indiegogo', 'GoFundMe', 'Cameo', 'Substack',
  'Medium', 'WordPress', 'Squarespace', 'Wix', 'Weebly', 'Webflow',
  'Bubble', 'Adalo', 'Glide', 'Unqork', 'Mendix', 'OutSystems', 'Appian',
  'Pegasystems', 'SalesforcePlatform', 'ServiceNowPlatform', 'OracleAPEX',
  'MicrosoftPowerApps', 'GoogleAppSheet', 'AirtableApps', 'Zapier', 'IFTTT',
  'Make', 'n8n', 'TrayIO', 'Workato', 'Boomi', 'MuleSoft', 'TIBCO',
  'SAP_PI_PO', 'OracleIntegrationCloud', 'AzureLogicApps', 'GoogleCloudWorkflows',
  'AWS_StepFunctions', 'IBM_AppConnect', 'Postman', 'Insomnia', 'Stoplight',
  'Swagger', 'Apiary', 'MuleSoftAnypoint', 'Apigee', 'Kong', 'Tyk',
  'AWS_APIGateway', 'AzureAPIManagement', 'ExpressGateway', 'KrakenD',
  'Auth0', 'Okta', 'PingIdentity', 'ForgeRock', 'OneLogin', 'Duo',
  'CyberArk', 'BeyondTrust', 'SailPoint', 'CrowdStrike', 'SentinelOne',
  'PaloAltoNetworks', 'Fortinet', 'CheckPoint', 'Zscaler', 'Netskope',
  'Proofpoint', 'Mimecast', 'Rapid7', 'Tenable', 'Qualys', 'F5', 'Citrix',
  'VMware', 'Nutanix', 'Veeam', 'Zerto', 'Rubrik', 'Cohesity', 'Commvault',
  'NetApp', 'DellEMC', 'HPE', 'IBM_Storage', 'PureStorage', 'HitachiVantara',
  'Cisco', 'Juniper', 'Arista', 'HPE_Aruba', 'ExtremeNetworks', 'Nokia',
  'Ericsson', 'SamsungNetworks', 'HuaweiNetworks', 'ZTE', 'Corning',
  'CommScope', 'Belden', 'Panduit', 'Legrand', 'Vertiv', 'EatonPower',
  'SchneiderElectricUPS', 'Generac', 'CaterpillarPower', 'CumminsPower',
  'RollsRoycePower', 'Wartsila', 'MAN_Energy', 'SolarWinds', 'PRTG',
  'ManageEngine', 'LogicMonitor', 'Auvik', 'Nagios', 'Zabbix', 'Prometheus',
  'Grafana', 'InfluxData', 'TimescaleDB', 'Elasticsearch', 'OpenSearch', 'Solr',
  'SplunkObservability', 'DatadogObservability', 'NewRelicObservability',
  'Dynatrace', 'AppDynamics', 'HoneyComb', 'Lightstep', 'SentryIO',
  'Bugsnag', 'Rollbar', 'Airbrake', 'Raygun', 'LogRocket', 'FullStory',
  'Heap', 'Amplitude', 'Mixpanel', 'Pendo', 'Gainsight', 'WalkMe', 'Whatfix',
  'UserTesting', 'OptimalWorkshop', 'Maze', 'Lookback', 'Hotjar', 'CrazyEgg',
  'VWO', 'Optimizely', 'LaunchDarkly', 'SplitIO', 'Flagsmith',
  'Unleash', 'AdobeTarget', 'GoogleOptimize', 'Evernote', 'OneNote',
  'Bear', 'Ulysses', 'Scrivener', 'FinalDraft', 'Celtx', 'Grammarly',
  'ProWritingAid', 'Hemingway', 'LanguageTool', 'Canva', 'Crello',
  'Piktochart', 'Visme', 'Prezi', 'Miro', 'Mural', 'Lucidchart',
  'drawIO', 'Gliffy', 'OmniGraffle', 'Balsamiq', 'ProtoIO', 'Framer',
  'Principle', 'OrigamiStudio', 'Axure', 'Zeplin', 'Abstract', 'Avocode',
  'Lingo', 'AdobeXD', 'AffinityDesigner', 'CorelDRAW', 'Blender', 'Maya',
  '3dsMax', 'Cinema4D', 'ZBrush', 'Substance', 'Houdini', 'Nuke',
  'DaVinciResolve', 'FinalCutPro', 'AdobePremiere', 'Avid', 'Audacity',
  'Ableton', 'FL_Studio', 'LogicPro', 'ProTools', 'Reason', 'Bitwig',
  'Unity', 'UnrealEngine', 'Godot', 'CryEngine', 'Lumberyard', 'Roblox',
  'Minecraft', 'Fortnite', 'LeagueOfLegends', 'Valorant', 'CSGO',
  'Dota2', 'Overwatch', 'ApexLegends', 'CallOfDuty', 'Battlefield',
  'FIFA', 'Madden', 'NBA2K', 'TheSims', 'AnimalCrossing', 'Zelda',
  'Mario', 'Pokemon', 'FinalFantasy', 'ElderScrolls', 'Fallout',
  'GrandTheftAuto', 'RedDeadRedemption', 'Witcher', 'Cyberpunk2077',
  'WorldOfWarcraft', 'GuildWars2', 'EveOnline', 'StarCitizen', 'EliteDangerous',
  'Steam', 'EpicGamesStore', 'GOG', 'ItchIO', 'HumbleBundle', 'UbisoftConnect',
  'EA_App', 'BattleNet', 'Discord', 'TeamSpeak', 'Mumble', 'Ventrilo',
  'Twitch', 'YouTubeGaming', 'FacebookGaming', 'Kick', 'Rumble', 'DLive',
  'ThetaTV', 'Netflix', 'AmazonPrimeVideo', 'DisneyPlus', 'Hulu', 'HBOMax',
  'AppleTVPlus', 'ParamountPlus', 'Peacock', 'YouTubeTV', 'SlingTV', 'FuboTV',
  'Philo', 'PlutoTV', 'Tubi', 'Roku', 'AmazonFireTV', 'AppleTV', 'GoogleTV',
  'NvidiaShield', 'Sonos', 'Bose', 'Sennheiser', 'SonyAudio', 'JBL', 'HarmanKardon',
  'BangOlufsen', 'BowersWilkins', 'Klipsch', 'KEF', 'PolkAudio', 'DefinitiveTechnology',
  'Denon', 'Marantz', 'YamahaAV', 'Onkyo', 'Pioneer', 'NAD', 'Rotel', 'McIntosh',
  'AudioResearch', 'PassLabs', 'MarkLevinson', 'Krell', 'Classe', 'dCS', 'Nagra',
  'GoHighLevel', 'ClickFunnels', 'Kajabi', 'Teachable', 'Thinkific', 'Podia',
  'Udemy', 'Coursera', 'edX', 'Udacity', 'LinkedInLearning', 'Skillshare'
];

const all_data_feeds_generated: DataFeed[] = [];
const all_widgets_generated: WidgetSpec[] = [];

c_list.forEach((c) => {
  const c_l = c.toLowerCase();
  const domain = `${c_l}.citibankdemobusiness.dev`;
  const endpoints = ['/v1/accounts', '/v1/transactions', '/v1/balances', '/v1/users', '/v1/payments', '/v1/ledgers', '/v2/reports', '/v2/analytics', '/v2/webhooks', '/v3/streams'];
  
  endpoints.forEach((ep) => {
    const verb: HttpVerb = ep.includes('analytics') || ep.includes('reports') || ep.includes('balances') || ep.includes('accounts') ? 'GET' : 'POST';
    const df = generate_api_endpoint(domain, ep, verb, c_l);
    all_data_feeds_generated.push(df);

    if (verb === 'GET') {
      const widget: WidgetSpec = {
        wid: `widget_${df.df_id}`,
        w_fam: ep.includes('analytics') ? 'chart' : 'grid',
        w_title: `${c} ${ep.split('/')[2].charAt(0).toUpperCase() + ep.split('/')[2].slice(1)}`,
        w_data_feed_id: df.df_id,
        w_opts: {
          chartType: ep.includes('balances') ? 'bar' : 'line',
          columns: [
            { id: 'col_id', label: 'ID' },
            { id: 'col_date', label: 'Date' },
            { id: 'col_amount', label: 'Amount' },
            { id: 'col_status', label: 'Status' }
          ],
          showLegend: true,
          colorScheme: 'citibank_blue',
        },
      };
      all_widgets_generated.push(widget);
    } else {
      const widget: WidgetSpec = {
        wid: `widget_form_${df.df_id}`,
        w_fam: 'interaction',
        w_title: `Create ${c} ${ep.split('/')[2].charAt(0).toUpperCase() + ep.split('/')[2].slice(1)}`,
        w_data_feed_id: df.df_id,
        w_opts: {
          formFields: [
            { id: 'field_amount', type: 'number', label: 'Amount' },
            { id: 'field_recipient', type: 'text', label: 'Recipient' },
            { id: 'field_memo', type: 'textarea', label: 'Memo' }
          ],
          submitButtonText: 'Submit',
        },
      };
      all_widgets_generated.push(widget);
    }
  });

  const db_id = `${c_l}_db_source`;
  const db_source: DataFeed = {
    df_id: db_id,
    df_src_type: 'database',
    df_connection: {
      db_dialect: 'postgresql',
      db_host: `db.${domain}`,
      db_port: 5432,
      db_name: `${c_l}_prod`,
      db_user: 'reporter',
      db_pass_ref: `${c_l}_DB_PASSWORD`,
      db_ssl_mode: 'require',
      db_query: 'SELECT * FROM financial_summary_view WHERE report_date = CURRENT_DATE;',
    },
  };
  all_data_feeds_generated.push(db_source);

  const db_widget: WidgetSpec = {
    wid: `widget_${db_id}`,
    w_fam: 'grid',
    w_title: `${c} Database Financial Summary`,
    w_data_feed_id: db_id,
    w_opts: {
      isPaginated: true,
      rowsPerPage: 50,
    },
  };
  all_widgets_generated.push(db_widget);
  
  const ws_id = `${c_l}_ws_source`;
  const ws_source: DataFeed = {
      df_id: ws_id,
      df_src_type: 'websocket',
      df_connection: {
          ws_url: `wss://ws.${domain}/realtime/transactions`,
          ws_protocols: ['json', 'wamp'],
          ws_auto_reconnect: true,
      },
  };
  all_data_feeds_generated.push(ws_source);

  const ws_widget: WidgetSpec = {
      wid: `widget_${ws_id}`,
      w_fam: 'indicator',
      w_title: `${c} Real-Time Transaction Feed`,
      w_data_feed_id: ws_id,
      w_opts: {
          indicatorStyle: 'blinking_light',
          positiveColor: '#28a745',
          negativeColor: '#dc3545',
          neutralColor: '#ffc107',
          valuePath: 'data.amount',
      },
  };
  all_widgets_generated.push(ws_widget);
});

export const ledgerFinancialMatrixBlueprint: FinancialMatrixConfiguration = {
  fm_schema_ver: '3.1.4',
  fm_base_uri: 'citibankdemobusiness.dev',
  fm_corp_id: {
    corp_name: 'Citibank Demo Business Inc',
    corp_legal_name: 'Citibank Demo Business Incorporated',
    corp_contact: 'support@citibankdemobusiness.dev',
  },
  fm_data_feeds: all_data_feeds_generated,
  fm_display_canvases: {
    'ledgers_main': {
      can_path: '/ledgers',
      can_width: 'full',
      can_items: [
        {
          sec_columns: [
            {
              frame_containers: [
                { pod_id: 'ledger_summary_stats', pod_width: '1/2', pod_widgets: [all_widgets_generated[5], all_widgets_generated[16], all_widgets_generated[27]] },
                { pod_id: 'ledger_live_transactions', pod_width: '1/2', pod_widgets: [all_widgets_generated[1], all_widgets_generated[12], all_widgets_generated[23]] },
              ],
            },
          ],
        },
        {
          sec_columns: [
            {
              frame_containers: [
                { pod_id: 'ledger_account_details', pod_width: 'full', pod_widgets: [all_widgets_generated[0], all_widgets_generated[11], all_widgets_generated[22], all_widgets_generated[33], all_widgets_generated[44]] },
              ],
            },
          ],
        },
        {
          sec_columns: [
            {
              frame_containers: [
                { pod_id: 'integration_exploration_zone', pod_width: 'full', pod_widgets: all_widgets_generated.slice(50, 100) },
              ],
            },
          ],
        },
      ],
    },
    'deep_analytics': {
        can_path: '/analytics',
        can_width: 'full',
        can_items: [
            {
                sec_columns: [
                    {
                        frame_containers: [
                            { pod_id: 'analytics_plaid_deep_dive', pod_width: '1/3', pod_widgets: all_widgets_generated.filter(w => w.wid.includes('plaid')) },
                            { pod_id: 'analytics_stripe_deep_dive', pod_width: '1/3', pod_widgets: all_widgets_generated.filter(w => w.wid.includes('stripe')) },
                            { pod_id: 'analytics_salesforce_deep_dive', pod_width: '1/3', pod_widgets: all_widgets_generated.filter(w => w.wid.includes('salesforce')) },
                        ]
                    },
                    {
                        frame_containers: [
                            { pod_id: 'analytics_database_summaries', pod_width: 'full', pod_widgets: all_widgets_generated.filter(w => w.wid.includes('db_source')) }
                        ]
                    }
                ]
            }
        ]
    }
  },
  fm_global_functions: {
    'formatUSD': `(v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)`,
    'parseDate': `(d) => new Date(d).toLocaleDateString('en-US')`,
  }
};