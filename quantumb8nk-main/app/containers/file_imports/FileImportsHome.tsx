// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from "react";
import { PageHeader } from "../../../common/ui-components";
import BankFileImports from "./BankFileImports";

const BREADCRUMB_TRAIL = [
  { label: "Ledgers", destination: "/accounts" },
  { label: "Data Source Integrations" },
];

const API_BASE_URL = "https://api.citibankdemobusiness.dev/v1/data-nexus";

const COMPANY_NAME = "Citibank Demo Business Inc.";

type IntegrationStatus = "connected" | "disconnected" | "pending" | "error";

interface IDataSource {
  id: string;
  name: string;
  category: string;
  authMethod: "oauth2" | "apikey" | "basic";
  logo: string;
  description: string;
  docUrl: string;
}

const integrationCatalog: IDataSource[] = [
    { id: "gemini", name: "Gemini", category: "AI/ML", authMethod: "apikey", logo: "gemini.svg", description: "Google's advanced AI model for multimodal reasoning.", docUrl: "https://ai.google.dev/docs" },
    { id: "chathot", name: "ChatHot", category: "AI/ML", authMethod: "oauth2", logo: "chathot.svg", description: "A fictional cutting-edge conversational AI platform.", docUrl: "https://docs.chathot.io" },
    { id: "pipedream", name: "Pipedream", category: "Automation", authMethod: "oauth2", logo: "pipedream.svg", description: "Integration platform for developers to build and run workflows.", docUrl: "https://pipedream.com/docs" },
    { id: "github", name: "GitHub", category: "DevOps", authMethod: "oauth2", logo: "github.svg", description: "Source code hosting and version control.", docUrl: "https://docs.github.com" },
    { id: "huggingface", name: "Hugging Face", category: "AI/ML", authMethod: "apikey", logo: "huggingface.svg", description: "The AI community building the future.", docUrl: "https://huggingface.co/docs" },
    { id: "plaid", name: "Plaid", category: "FinTech", authMethod: "oauth2", logo: "plaid.svg", description: "Connect users to their bank accounts.", docUrl: "https://plaid.com/docs/" },
    { id: "moderntreasury", name: "Modern Treasury", category: "FinTech", authMethod: "apikey", logo: "moderntreasury.svg", description: "The operating system for money movement.", docUrl: "https://docs.moderntreasury.com/" },
    { id: "googledrive", name: "Google Drive", category: "Storage", authMethod: "oauth2", logo: "googledrive.svg", description: "Cloud storage and file backup.", docUrl: "https://developers.google.com/drive" },
    { id: "onedrive", name: "OneDrive", category: "Storage", authMethod: "oauth2", logo: "onedrive.svg", description: "Microsoft's cloud storage service.", docUrl: "https://docs.microsoft.com/en-us/onedrive/developer/" },
    { id: "azure", name: "Azure", category: "Cloud", authMethod: "oauth2", logo: "azure.svg", description: "Microsoft's cloud computing platform.", docUrl: "https://docs.microsoft.com/en-us/azure/" },
    { id: "googlecloud", name: "Google Cloud", category: "Cloud", authMethod: "oauth2", logo: "googlecloud.svg", description: "Google's suite of cloud computing services.", docUrl: "https://cloud.google.com/docs" },
    { id: "supabase", name: "Supabase", category: "Backend", authMethod: "apikey", logo: "supabase.svg", description: "The open source Firebase alternative.", docUrl: "https://supabase.io/docs" },
    { id: "vercel", name: "Vercel", category: "Deployment", authMethod: "oauth2", logo: "vercel.svg", description: "Frontend cloud for developers.", docUrl: "https://vercel.com/docs" },
    { id: "salesforce", name: "Salesforce", category: "CRM", authMethod: "oauth2", logo: "salesforce.svg", description: "Customer Relationship Management (CRM) platform.", docUrl: "https://developer.salesforce.com/docs/" },
    { id: "oracle", name: "Oracle", category: "Database", authMethod: "basic", logo: "oracle.svg", description: "Database technology and systems.", docUrl: "https://docs.oracle.com/" },
    { id: "marqeta", name: "Marqeta", category: "FinTech", authMethod: "apikey", logo: "marqeta.svg", description: "Modern card issuing platform.", docUrl: "https://www.marqeta.com/docs" },
    { id: "citibank", name: "Citibank", category: "Banking", authMethod: "oauth2", logo: "citibank.svg", description: "Global banking and financial services.", docUrl: "https://developer.citi.com/" },
    { id: "shopify", name: "Shopify", category: "eCommerce", authMethod: "oauth2", logo: "shopify.svg", description: "eCommerce platform for online stores.", docUrl: "https://shopify.dev/docs" },
    { id: "woocommerce", name: "WooCommerce", category: "eCommerce", authMethod: "oauth2", logo: "woocommerce.svg", description: "Open-source eCommerce plugin for WordPress.", docUrl: "https://woocommerce.com/document/" },
    { id: "godaddy", name: "GoDaddy", category: "Web Hosting", authMethod: "apikey", logo: "godaddy.svg", description: "Domain registrar and web hosting company.", docUrl: "https://developer.godaddy.com/" },
    { id: "cpanel", name: "cPanel", category: "Web Hosting", authMethod: "basic", logo: "cpanel.svg", description: "Web hosting control panel software.", docUrl: "https://docs.cpanel.net/" },
    { id: "adobe", name: "Adobe", category: "Creative", authMethod: "oauth2", logo: "adobe.svg", description: "Creative Cloud and document solutions.", docUrl: "https://developer.adobe.com/" },
    { id: "twilio", name: "Twilio", category: "Communication", authMethod: "apikey", logo: "twilio.svg", description: "Communication APIs for SMS, voice, video, and auth.", docUrl: "https://www.twilio.com/docs" },
    { id: "aws", name: "Amazon Web Services", category: "Cloud", authMethod: "apikey", logo: "aws.svg", description: "Comprehensive cloud platform.", docUrl: "https://docs.aws.amazon.com/" },
    { id: "stripe", name: "Stripe", category: "FinTech", authMethod: "apikey", logo: "stripe.svg", description: "Online payment processing for internet businesses.", docUrl: "https://stripe.com/docs" },
    { id: "paypal", name: "PayPal", category: "FinTech", authMethod: "oauth2", logo: "paypal.svg", description: "Online payments system.", docUrl: "https://developer.paypal.com/" },
    { id: "slack", name: "Slack", category: "Communication", authMethod: "oauth2", logo: "slack.svg", description: "Collaboration hub for work.", docUrl: "https://api.slack.com/" },
    { id: "jira", name: "Jira", category: "Productivity", authMethod: "oauth2", logo: "jira.svg", description: "Project management software for agile teams.", docUrl: "https://developer.atlassian.com/server/jira/platform/rest-apis/" },
    { id: "trello", name: "Trello", category: "Productivity", authMethod: "oauth2", logo: "trello.svg", description: "Visual collaboration tool for work.", docUrl: "https://developer.atlassian.com/cloud/trello/" },
    { id: "notion", name: "Notion", category: "Productivity", authMethod: "oauth2", logo: "notion.svg", description: "The all-in-one workspace for your notes, tasks, wikis, and databases.", docUrl: "https://developers.notion.com/" },
    { id: "dropbox", name: "Dropbox", category: "Storage", authMethod: "oauth2", logo: "dropbox.svg", description: "File hosting service that offers cloud storage.", docUrl: "https://www.dropbox.com/developers/documentation" },
    { id: "box", name: "Box", category: "Storage", authMethod: "oauth2", logo: "box.svg", description: "Cloud content management and file sharing service for businesses.", docUrl: "https://developer.box.com/" },
    { id: "zoom", name: "Zoom", category: "Communication", authMethod: "oauth2", logo: "zoom.svg", description: "Video conferencing, web conferencing, webinars.", docUrl: "https://marketplace.zoom.us/docs/api-reference/zoom-api" },
    { id: "discord", name: "Discord", category: "Communication", authMethod: "oauth2", logo: "discord.svg", description: "Voice, video, and text communication service.", docUrl: "https://discord.com/developers/docs/intro" },
    { id: "hubspot", name: "HubSpot", category: "CRM", authMethod: "oauth2", logo: "hubspot.svg", description: "Inbound marketing, sales, and service software.", docUrl: "https://developers.hubspot.com/docs/api/overview" },
    { id: "zendesk", name: "Zendesk", category: "CRM", authMethod: "oauth2", logo: "zendesk.svg", description: "Customer service software & sales CRM.", docUrl: "https://developer.zendesk.com/api-reference/" },
    { id: "intercom", name: "Intercom", category: "CRM", authMethod: "oauth2", logo: "intercom.svg", description: "Customer Communications Platform.", docUrl: "https://developers.intercom.com/intercom-api-reference/v2.9/" },
    { id: "mailchimp", name: "Mailchimp", category: "Marketing", authMethod: "oauth2", logo: "mailchimp.svg", description: "All-in-one marketing platform for small businesses.", docUrl: "https://mailchimp.com/developer/marketing/api/" },
    { id: "sendgrid", name: "SendGrid", category: "Marketing", authMethod: "apikey", logo: "sendgrid.svg", description: "Email delivery service.", docUrl: "https://docs.sendgrid.com/api-reference/" },
    { id: "docusign", name: "DocuSign", category: "Productivity", authMethod: "oauth2", logo: "docusign.svg", description: "eSignature and agreement cloud.", docUrl: "https://developers.docusign.com/docs/esign-rest-api/reference/" },
    { id: "kubernetes", name: "Kubernetes", category: "DevOps", authMethod: "basic", logo: "kubernetes.svg", description: "Open-source container orchestration system.", docUrl: "https://kubernetes.io/docs/reference/kubernetes-api/" },
    { id: "docker", name: "Docker", category: "DevOps", authMethod: "basic", logo: "docker.svg", description: "Containerization platform.", docUrl: "https://docs.docker.com/engine/api/" },
    { id: "datadog", name: "Datadog", category: "DevOps", authMethod: "apikey", logo: "datadog.svg", description: "Monitoring service for cloud-scale applications.", docUrl: "https://docs.datadoghq.com/api/latest/" },
    { id: "newrelic", name: "New Relic", category: "DevOps", authMethod: "apikey", logo: "newrelic.svg", description: "Observability platform built to help engineers create more perfect software.", docUrl: "https://docs.newrelic.com/docs/apis/" },
    { id: "sentry", name: "Sentry", category: "DevOps", authMethod: "oauth2", logo: "sentry.svg", description: "Application monitoring and error tracking software.", docUrl: "https://docs.sentry.io/api/" },
    { id: "figma", name: "Figma", category: "Creative", authMethod: "oauth2", logo: "figma.svg", description: "Collaborative interface design tool.", docUrl: "https://www.figma.com/developers/api" },
    { id: "miro", name: "Miro", category: "Creative", authMethod: "oauth2", logo: "miro.svg", description: "Online collaborative whiteboard platform.", docUrl: "https://developers.miro.com/" },
    { id: "asana", name: "Asana", category: "Productivity", authMethod: "oauth2", logo: "asana.svg", description: "Work management platform teams use to stay focused.", docUrl: "https://developers.asana.com/docs" },
    { id: "mongodb", name: "MongoDB", category: "Database", authMethod: "basic", logo: "mongodb.svg", description: "Source-available cross-platform document-oriented database program.", docUrl: "https://www.mongodb.com/docs/atlas/api/" },
    { id: "postgresql", name: "PostgreSQL", category: "Database", authMethod: "basic", logo: "postgresql.svg", description: "Free and open-source relational database management system.", docUrl: "https://www.postgresql.org/docs/current/protocol.html" },
    { id: "redis", name: "Redis", category: "Database", authMethod: "basic", logo: "redis.svg", description: "In-memory data structure store, used as a database, cache, and message broker.", docUrl: "https://redis.io/commands" },
    { id: "kafka", name: "Apache Kafka", category: "Backend", authMethod: "basic", logo: "kafka.svg", description: "Open-source stream-processing software platform.", docUrl: "https://kafka.apache.org/documentation/" },
    { id: "rabbitmq", name: "RabbitMQ", category: "Backend", authMethod: "basic", logo: "rabbitmq.svg", description: "Open-source message-broker software.", docUrl: "https://www.rabbitmq.com/documentation.html" },
    { id: "tableau", name: "Tableau", category: "BI", authMethod: "oauth2", logo: "tableau.svg", description: "Visual analytics platform transforming the way we use data to solve problems.", docUrl: "https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm" },
    { id: "powerbi", name: "Power BI", category: "BI", authMethod: "oauth2", logo: "powerbi.svg", description: "Business analytics service by Microsoft.", docUrl: "https://docs.microsoft.com/en-us/power-bi/developer/embedded/rest-api-overview" },
    { id: "looker", name: "Looker", category: "BI", authMethod: "oauth2", logo: "looker.svg", description: "Business intelligence software and big data analytics platform.", docUrl: "https://docs.looker.com/reference/api-and-sdk" },
    { id: "quickbooks", name: "QuickBooks", category: "Accounting", authMethod: "oauth2", logo: "quickbooks.svg", description: "Accounting software package developed by Intuit.", docUrl: "https://developer.intuit.com/app/developer/qbo/docs/api" },
    { id: "xero", name: "Xero", category: "Accounting", authMethod: "oauth2", logo: "xero.svg", description: "Cloud-based accounting software platform.", docUrl: "https://developer.xero.com/documentation/api/accounting/" },
    { id: "freshbooks", name: "FreshBooks", category: "Accounting", authMethod: "oauth2", logo: "freshbooks.svg", description: "Accounting software operated by 2ndSite Inc.", docUrl: "https://www.freshbooks.com/api/docs" },
    //... continue adding more, up to 1000 if needed.
];

interface IConnectionState {
    [key: string]: {
        status: IntegrationStatus;
        lastSync: number | null;
        error: string | null;
    };
}

interface ILogEntry {
    id: string;
    timestamp: number;
    source: string;
    level: "info" | "warn" | "error";
    message: string;
}

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const fakeApiCall = (svcId: string, action: "connect" | "disconnect" | "sync"): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        const delay = Math.random() * 1500 + 500;
        setTimeout(() => {
            const isSuccess = Math.random() > 0.15; // 85% success rate
            if (isSuccess) {
                resolve({ success: true, message: `Successfully executed ${action} for ${svcId}.` });
            } else {
                resolve({ success: false, message: `Failed to ${action} ${svcId}. Simulated network error.` });
            }
        }, delay);
    });
};

const ConnectionStatusIndicator: React.FC<{ s: IntegrationStatus }> = ({ s }) => {
    const statusMap = {
        connected: { c: "bg-green-500", t: "Connected" },
        disconnected: { c: "bg-gray-400", t: "Disconnected" },
        pending: { c: "bg-yellow-400 animate-pulse", t: "Pending..." },
        error: { c: "bg-red-500", t: "Error" },
    };
    const { c, t } = statusMap[s];
    return (
        <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${c}`}></div>
            <span className="text-sm font-medium">{t}</span>
        </div>
    );
};

const IntegrationCard: React.FC<{ 
    cfg: IDataSource; 
    cState: { status: IntegrationStatus; lastSync: number | null; error: string | null; };
    onConnect: (id: string) => void;
    onDisconnect: (id: string) => void;
    onSync: (id: string) => void;
}> = ({ cfg, cState, onConnect, onDisconnect, onSync }) => {
    return (
        <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
            <div>
                <div className="flex items-center mb-3">
                    <img src={`/logos/${cfg.logo}`} alt={`${cfg.name} Logo`} className="w-8 h-8 mr-3"/>
                    <h3 className="text-lg font-semibold text-gray-800">{cfg.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 h-16">{cfg.description}</p>
                <ConnectionStatusIndicator s={cState.status} />
                {cState.lastSync && (
                    <p className="text-xs text-gray-500 mt-1">Last Sync: {new Date(cState.lastSync).toLocaleString()}</p>
                )}
                 {cState.status === 'error' && cState.error && (
                    <p className="text-xs text-red-500 mt-1 truncate" title={cState.error}>{cState.error}</p>
                )}
            </div>
            <div className="mt-4 pt-4 border-t flex space-x-2">
                {cState.status === 'disconnected' || cState.status === 'error' ? (
                     <button onClick={() => onConnect(cfg.id)} className="w-full text-sm bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors">Connect</button>
                ) : (
                    <>
                    <button onClick={() => onSync(cfg.id)} className="w-full text-sm bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-colors" disabled={cState.status === 'pending'}>Sync</button>
                    <button onClick={() => onDisconnect(cfg.id)} className="w-full text-sm bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors" disabled={cState.status === 'pending'}>Disconnect</button>
                    </>
                )}
            </div>
        </div>
    );
};

const LogStreamPanel: React.FC<{ logs: ILogEntry[] }> = ({ logs }) => {
    const logRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if(logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    const levelColor = {
        info: "text-blue-400",
        warn: "text-yellow-400",
        error: "text-red-400",
    };

    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-inner h-64">
            <h4 className="text-lg font-semibold mb-2 text-gray-300">Live Activity Log</h4>
            <div ref={logRef} className="h-full overflow-y-auto font-mono text-xs pr-2">
                {logs.map(l => (
                    <div key={l.id} className="flex items-start">
                        <span className="text-gray-500 mr-3">{new Date(l.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-bold w-16 mr-2 ${levelColor[l.level]}`}>[{l.source.toUpperCase()}]</span>
                        <p className="flex-1 whitespace-pre-wrap">{l.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function CorporateDataNexus() {
    const [connections, setConnections] = React.useState<IConnectionState>({});
    const [logs, setLogs] = React.useState<ILogEntry[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterCategory, setFilterCategory] = React.useState("All");

    React.useEffect(() => {
        const initialStates: IConnectionState = {};
        integrationCatalog.forEach(i => {
            initialStates[i.id] = { status: 'disconnected', lastSync: null, error: null };
        });
        setConnections(initialStates);
        addLog("system", "info", "Data Nexus initialized. Ready for connections.");
    }, []);

    const addLog = (src: string, lvl: "info" | "warn" | "error", msg: string) => {
        setLogs(prev => [...prev.slice(-200), { id: generateUUID(), timestamp: Date.now(), source: src, level: lvl, message: msg }]);
    };

    const updateConnectionStatus = (id: string, status: IntegrationStatus, error: string | null = null) => {
        setConnections(prev => ({
            ...prev,
            [id]: { ...prev[id], status, error: error, lastSync: status === 'connected' ? Date.now() : prev[id].lastSync },
        }));
    };
    
    const handleConnect = async (id: string) => {
        addLog(id, "info", `Initiating connection...`);
        updateConnectionStatus(id, "pending");
        const res = await fakeApiCall(id, "connect");
        if(res.success){
            updateConnectionStatus(id, "connected");
            addLog(id, "info", res.message);
        } else {
            updateConnectionStatus(id, "error", res.message);
            addLog(id, "error", res.message);
        }
    };

    const handleDisconnect = async (id: string) => {
        addLog(id, "info", `Disconnecting...`);
        updateConnectionStatus(id, "pending");
        const res = await fakeApiCall(id, "disconnect");
        if(res.success){
            updateConnectionStatus(id, "disconnected");
            addLog(id, "warn", res.message);
        } else {
            // Revert to connected on failure, as it wasn't disconnected
            updateConnectionStatus(id, "connected", res.message);
            addLog(id, "error", `Failed to disconnect: ${res.message}`);
        }
    };
    
    const handleSync = async (id: string) => {
        addLog(id, "info", `Starting data synchronization...`);
        setConnections(prev => ({ ...prev, [id]: { ...prev[id], status: 'pending' }}));
        const res = await fakeApiCall(id, "sync");
        const finalStatus = res.success ? 'connected' : 'error';
        setConnections(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                status: finalStatus,
                lastSync: res.success ? Date.now() : prev[id].lastSync,
                error: res.success ? null : res.message,
            }
        }));
        addLog(id, res.success ? 'info' : 'error', res.message);
    };

    const categories = ["All", ...Array.from(new Set(integrationCatalog.map(i => i.category)))];

    const filteredIntegrations = integrationCatalog.filter(i => {
        const matchesCategory = filterCategory === "All" || i.category === filterCategory;
        const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-gray-50 p-6 min-h-screen">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Integration Marketplace</h2>
                <p className="text-gray-600">Connect your tools and services to the {COMPANY_NAME} platform.</p>
            </header>

            <div className="mb-6">
                <LogStreamPanel logs={logs} />
            </div>

            <div className="flex items-center space-x-4 mb-6 p-4 bg-white rounded-lg border">
                <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border rounded-md"
                />
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 border rounded-md bg-white"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-sm text-gray-600">{filteredIntegrations.length} results</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredIntegrations.map(cfg => (
                     <IntegrationCard 
                        key={cfg.id}
                        cfg={cfg}
                        cState={connections[cfg.id] || { status: 'disconnected', lastSync: null, error: null }}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                        onSync={handleSync}
                    />
                ))}
            </div>

            <footer className="mt-12 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All integrations are subject to third-party terms.</p>
                <p>Base API Endpoint: {API_BASE_URL}</p>
            </footer>
        </div>
    );
}


export default function DataAssimilationHub() {
  const crumbs = BREADCRUMB_TRAIL.map(c => ({ name: c.label, path: c.destination }));
  
  return (
    <div style={{ backgroundColor: '#f9fafb' }}>
      <PageHeader title="Data Source Integrations" crumbs={crumbs}>
        <CorporateDataNexus />
      </PageHeader>
    </div>
  );
}
