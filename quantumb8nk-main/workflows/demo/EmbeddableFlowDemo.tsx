// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
  useMemo,
  useReducer,
} from "react";
import {
  AppearanceVariables,
  loadModernTreasury,
  ModernTreasury,
  EmbeddableFlow,
} from "@modern-treasury/modern-treasury-js";
import "highlight.js/styles/rainbow.css";
import { Link, BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { usePublishableKeysDemoSelectQuery } from "./generated/dashboard/graphqlSchema";
import "react-toastify/dist/ReactToastify.css";

// --- EXTERNAL LIBRARY IMPORTS (expanded for commercial readiness) ---
import { ToastContainer, toast } from "react-toastify";
import { ChartContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Legend, LineChart, Line } from "recharts"; // For analytics
import { ChevronDown, BarChart2, Zap, Settings, User, LogOut, Loader2, CreditCard, DollarSign, Wallet, Repeat, LayoutDashboard, Cog, Code, Terminal, Bell, Globe, Bot } from "lucide-react"; // For icons
import { GoogleGenerativeAI } from "@google/generative-ai"; // Gemini AI integration
import axios from "axios"; // For general API calls
import dayjs from "dayjs"; // For date manipulation
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useForm, Controller } from "react-hook-form"; // For robust form handling
import { z } from "zod"; // For schema validation
import { zodResolver } from "@hookform/resolvers/zod"; // For integrating Zod with React Hook Form

// --- UI COMPONENTS (Simulated via common/ui-components and extended for a rich app) ---
// Assuming these are available or would be built using a UI library like shadcn/ui
interface LabelProps { id: string; children: React.ReactNode; helpText?: string; className?: string; }
const Label: React.FC<LabelProps> = ({ id, children, helpText, className }) => (
  <label htmlFor={id} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
    {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
  </label>
);

interface SelectValue { value: string; label: string; }
interface PublishableKeySelectFieldProps {
  selectValue: string;
  onChange: (value: SelectValue | null) => void;
  disabled?: boolean;
}
const PublishableKeySelectField: React.FC<PublishableKeySelectFieldProps> = ({ selectValue, onChange, disabled }) => (
  <select
    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
    value={selectValue}
    onChange={(e) => onChange({ value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
    disabled={disabled}
  >
    <option value="">Select a key</option>
    {/* This would be populated dynamically from data.publishableKeys */}
    <option value="pk_test_1234567890abcdef">Test Key · example.com</option>
    <option value="pk_prod_abcdef1234567890">Prod Key · app.example.com</option>
  </select>
);

interface CodeProps { className?: string; codeClassName?: string; text: string; language: string; }
const Code: React.FC<CodeProps> = ({ className, codeClassName, text, language }) => (
  <pre className={`${className} bg-gray-800 text-white p-4 rounded-md overflow-x-auto`}>
    <code className={`${codeClassName} language-${language}`}>{text}</code>
  </pre>
);

interface CopyableTextProps { text: string; children: React.ReactNode; }
const CopyableText: React.FC<CopyableTextProps> = ({ text, children }) => (
  <span className="cursor-pointer flex items-center gap-2" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied to clipboard!"); }}>
    {children} <Code size={16} />
  </span>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  children: React.ReactNode;
}
const Button: React.FC<ButtonProps> = ({ variant = 'default', size = 'default', isLoading, children, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${props.className || ''}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// --- GLOBAL CONSTANTS & CONFIGURATION ---
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

const PUBLISHABLE_KEY_UI = "/developers/publishable_keys";
const MOUNT_HERE = "mt-embeddable-flow-container"; // Renamed for clarity within a larger app

// This array explicitly lists 100 external services and their corresponding environment variable names.
// In a production setup, these would be loaded securely via a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).
// `process.env` is used here to represent accessing these securely stored secrets.
const EXTERNAL_SERVICES_CONFIG = [
  { name: "Google Gemini AI", purpose: "Generative AI", envVar: "GEMINI_API_KEY" },
  { name: "Modern Treasury", purpose: "Payments Infrastructure", envVar: "MODERN_TREASURY_API_KEY" }, // Although MT client-side uses publishable key, this represents potential backend interaction
  { name: "Stripe", purpose: "Payments, Billing", envVar: "STRIPE_SECRET_KEY" },
  { name: "Plaid", purpose: "Bank Linking, Data", envVar: "PLAID_CLIENT_ID" },
  { name: "Twilio", purpose: "SMS, Voice", envVar: "TWILIO_ACCOUNT_SID" },
  { name: "SendGrid", purpose: "Email Marketing", envVar: "SENDGRID_API_KEY" },
  { name: "AWS S3", purpose: "Object Storage", envVar: "AWS_ACCESS_KEY_ID" },
  { name: "AWS Lambda", purpose: "Serverless Compute", envVar: "AWS_LAMBDA_API_KEY" },
  { name: "Auth0", purpose: "Authentication, Identity", envVar: "AUTH0_CLIENT_ID" },
  { name: "Clerk", purpose: "Authentication, User Mgmt", envVar: "CLERK_SECRET_KEY" },
  { name: "HubSpot", purpose: "CRM, Sales", envVar: "HUBSPOT_API_KEY" },
  { name: "Salesforce", purpose: "CRM, Enterprise", envVar: "SALESFORCE_CLIENT_ID" },
  { name: "Segment", purpose: "Customer Data Platform", envVar: "SEGMENT_WRITE_KEY" },
  { name: "Google Analytics", purpose: "Web Analytics", envVar: "GA_TRACKING_ID" },
  { name: "Mixpanel", purpose: "Product Analytics", envVar: "MIXPANEL_PROJECT_TOKEN" },
  { name: "Sentry", purpose: "Error Monitoring", envVar: "SENTRY_DSN" },
  { name: "Datadog", purpose: "Monitoring, APM", envVar: "DATADOG_API_KEY" },
  { name: "LogRocket", purpose: "Session Replay", envVar: "LOGROCKET_APP_ID" },
  { name: "Cloudflare", purpose: "CDN, Security", envVar: "CLOUDFLARE_API_KEY" },
  { name: "Vercel", purpose: "Deployment, Hosting", envVar: "VERCEL_ACCESS_TOKEN" },
  { name: "Netlify", purpose: "Deployment, Hosting", envVar: "NETLIFY_ACCESS_TOKEN" },
  { name: "GitHub", purpose: "Version Control", envVar: "GITHUB_CLIENT_ID" },
  { name: "GitLab", purpose: "Version Control", envVar: "GITLAB_CLIENT_ID" },
  { name: "Jira", purpose: "Project Management", envVar: "JIRA_API_TOKEN" },
  { name: "Slack", purpose: "Team Communication", envVar: "SLACK_BOT_TOKEN" },
  { name: "Discord", purpose: "Community, Chat", envVar: "DISCORD_BOT_TOKEN" },
  { name: "Zapier", purpose: "Automation", envVar: "ZAPIER_WEBHOOK_URL" },
  { name: "Make.com", purpose: "Automation", envVar: "MAKE_COM_WEBHOOK_URL" },
  { name: "Calendly", purpose: "Scheduling", envVar: "CALENDLY_API_KEY" },
  { name: "Zoom", purpose: "Video Conferencing", envVar: "ZOOM_API_KEY" },
  { name: "Intercom", purpose: "Customer Support, Chat", envVar: "INTERCOM_API_KEY" },
  { name: "Zendesk", purpose: "Customer Support", envVar: "ZENDESK_API_KEY" },
  { name: "DocuSign", purpose: "E-Signatures", envVar: "DOCUSIGN_CLIENT_ID" },
  { name: "HelloSign", purpose: "E-Signatures", envVar: "HELLOSIGN_API_KEY" },
  { name: "AWS SES", purpose: "Email Sending", envVar: "AWS_SES_ACCESS_KEY_ID" },
  { name: "Mailgun", purpose: "Email Sending", envVar: "MAILGUN_API_KEY" },
  { name: "Postmark", purpose: "Email Sending", envVar: "POSTMARK_API_KEY" },
  { name: "Shopify", purpose: "E-commerce", envVar: "SHOPIFY_API_KEY" },
  { name: "WooCommerce", purpose: "E-commerce", envVar: "WOOCOMMERCE_CONSUMER_KEY" },
  { name: "Algolia", purpose: "Search", envVar: "ALGOLIA_APP_ID" },
  { name: "Contentful", purpose: "Headless CMS", envVar: "CONTENTFUL_SPACE_ID" },
  { name: "Sanity", purpose: "Headless CMS", envVar: "SANITY_PROJECT_ID" },
  { name: "DatoCMS", purpose: "Headless CMS", envVar: "DATOCMS_API_TOKEN" },
  { name: "Google Maps", purpose: "Mapping", envVar: "GOOGLE_MAPS_API_KEY" },
  { name: "OpenWeatherMap", purpose: "Weather Data", envVar: "OPENWEATHER_API_KEY" },
  { name: "fixer.io", purpose: "Currency Exchange", envVar: "FIXER_IO_API_KEY" },
  { name: "Fincra", purpose: "African Payments", envVar: "FINCRA_SECRET_KEY" },
  { name: "Flutterwave", purpose: "African Payments", envVar: "FLUTTERWAVE_SECRET_KEY" },
  { name: "Paystack", purpose: "African Payments", envVar: "PAYSTACK_SECRET_KEY" },
  { name: "Xero", purpose: "Accounting", envVar: "XERO_CLIENT_ID" },
  { name: "QuickBooks", purpose: "Accounting", envVar: "QUICKBOOKS_CLIENT_ID" },
  { name: "FreshBooks", purpose: "Accounting", envVar: "FRESHBOOKS_CLIENT_ID" },
  { name: "ActiveCampaign", purpose: "Marketing Automation", envVar: "ACTIVECAMPAIGN_API_KEY" },
  { name: "Mailchimp", purpose: "Email Marketing", envVar: "MAILCHIMP_API_KEY" },
  { name: "Iterable", purpose: "Customer Engagement", envVar: "ITERABLE_API_KEY" },
  { name: "Braze", purpose: "Customer Engagement", envVar: "BRAZE_API_KEY" },
  { name: "OneSignal", purpose: "Push Notifications", envVar: "ONESIGNAL_APP_ID" },
  { name: "Pusher", purpose: "Realtime APIs", envVar: "PUSHER_APP_ID" },
  { name: "PubNub", purpose: "Realtime APIs", envVar: "PUBNUB_PUBLISH_KEY" },
  { name: "Vonage", purpose: "Communication APIs", envVar: "VONAGE_API_KEY" },
  { name: "Agora", purpose: "Voice/Video SDK", envVar: "AGORA_APP_ID" },
  { name: "DeepL", purpose: "Translation", envVar: "DEEPL_API_KEY" },
  { name: "AWS Rekognition", purpose: "Image Analysis", envVar: "AWS_REKOGNITION_ACCESS_KEY_ID" },
  { name: "Google Vision AI", purpose: "Image Analysis", envVar: "GOOGLE_VISION_API_KEY" },
  { name: "Azure Cognitive Services", purpose: "AI Services", envVar: "AZURE_COGNITIVE_API_KEY" },
  { name: "OpenAI", purpose: "Generative AI", envVar: "OPENAI_API_KEY" },
  { name: "Anthropic", purpose: "Claude AI", envVar: "ANTHROPIC_API_KEY" },
  { name: "Pinecone", purpose: "Vector Database", envVar: "PINECONE_API_KEY" },
  { name: "Weaviate", purpose: "Vector Database", envVar: "WEAVIATE_API_KEY" },
  { name: "Redis", purpose: "Caching, Database", envVar: "REDIS_URL" },
  { name: "MongoDB Atlas", purpose: "NoSQL Database", envVar: "MONGO_URI" },
  { name: "PostgreSQL", purpose: "Relational Database", envVar: "DATABASE_URL_PG" },
  { name: "MySQL", purpose: "Relational Database", envVar: "DATABASE_URL_MY" },
  { name: "Firebase", purpose: "BaaS", envVar: "FIREBASE_API_KEY" },
  { name: "Supabase", purpose: "BaaS", envVar: "SUPABASE_URL" },
  { name: "Hasura", purpose: "GraphQL Engine", envVar: "HASURA_GRAPHQL_ADMIN_SECRET" },
  { name: "Apollo Server", purpose: "GraphQL Backend", envVar: "APOLLO_KEY" },
  { name: "DigitalOcean Spaces", purpose: "Object Storage", envVar: "DO_SPACES_KEY" },
  { name: "Linode Object Storage", purpose: "Object Storage", envVar: "LINODE_OBJ_KEY" },
  { name: "OVH Cloud Storage", purpose: "Object Storage", envVar: "OVH_APP_KEY" },
  { name: "Chargebee", purpose: "Subscription Mgmt", envVar: "CHARGEBEE_SITE" },
  { name: "Recurly", purpose: "Subscription Mgmt", envVar: "RECURLY_API_KEY" },
  { name: "Paddle", purpose: "Payments, Subscription", envVar: "PADDLE_VENDOR_ID" },
  { name: "FastSpring", purpose: "E-commerce, Subscriptions", envVar: "FASTSPRING_USERNAME" },
  { name: "Typeform", purpose: "Forms, Surveys", envVar: "TYPEFORM_API_KEY" },
  { name: "SurveyMonkey", purpose: "Surveys", envVar: "SURVEYMONKEY_API_KEY" },
  { name: "Dropbox", purpose: "File Storage", envVar: "DROPBOX_ACCESS_TOKEN" },
  { name: "Google Drive", purpose: "File Storage", envVar: "GOOGLE_DRIVE_API_KEY" },
  { name: "OneDrive", purpose: "File Storage", envVar: "ONEDRIVE_API_KEY" },
  { name: "Asana", purpose: "Project Management", envVar: "ASANA_API_KEY" },
  { name: "Trello", purpose: "Project Management", envVar: "TRELLO_API_KEY" },
  { name: "Notion", purpose: "Workspace, Docs", envVar: "NOTION_API_KEY" },
  { name: "Clockify", purpose: "Time Tracking", envVar: "CLOCKIFY_API_KEY" },
  { name: "Harvest", purpose: "Time Tracking", envVar: "HARVEST_API_KEY" },
  { name: "Persona", purpose: "Identity Verification", envVar: "PERSONA_API_KEY" },
  { name: "Onfido", purpose: "Identity Verification", envVar: "ONFIDO_API_KEY" },
  { name: "Veriff", purpose: "Identity Verification", envVar: "VERIFF_API_KEY" },
  { name: "SumSub", purpose: "Identity Verification", envVar: "SUMSUB_API_KEY" },
  { name: "Accurately", purpose: "Fraud Detection", envVar: "ACCURATELY_API_KEY" },
  { name: "Sift", purpose: "Fraud Detection", envVar: "SIFT_API_KEY" },
  { name: "Clearbit", purpose: "Enrichment Data", envVar: "CLEARBIT_API_KEY" },
  { name: "Google Cloud Functions", purpose: "Serverless Compute", envVar: "GCP_FUNCTION_API_KEY" },
  { name: "Azure Functions", purpose: "Serverless Compute", envVar: "AZURE_FUNCTION_API_KEY" },
  { name: "PlanetScale", purpose: "Database as a Service", envVar: "PLANETSCALE_API_KEY" },
  { name: "Neon", purpose: "Serverless Postgres", envVar: "NEON_API_KEY" },
  { name: "Confluent Cloud", purpose: "Kafka as a Service", envVar: "CONFLUENT_API_KEY" },
];

// --- ADVANCED ERROR HANDLING ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Log error to an external service like Sentry (if SENTRY_DSN is configured)
    if (process.env.SENTRY_DSN) {
      // Sentry.captureException(error, { extra: errorInfo });
      toast.error("An unexpected error occurred. Our team has been notified.");
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// --- GLOBAL STATE & CONTEXTS ---

// 1. Authentication Context
interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; roles: string[] } | null;
  isLoading: boolean;
}
interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true, user: action.payload, isLoading: false };
    case "LOGIN_FAILURE":
      return { ...state, isAuthenticated: false, user: null, isLoading: false };
    case "LOGOUT":
      return { ...state, isAuthenticated: false, user: null };
    default:
      return state;
  }
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    isLoading: true, // Start as loading to check auth status
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate checking session/token from localStorage or API
    const checkAuthStatus = async () => {
      try {
        // In a real app, this would be an API call to validate session
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          dispatch({ type: "LOGIN_SUCCESS", payload: JSON.parse(storedUser) });
        } else {
          dispatch({ type: "LOGIN_FAILURE" });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        dispatch({ type: "LOGIN_FAILURE" });
      }
    };
    void checkAuthStatus();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      // Simulate API call for login
      if (email === "user@example.com" && pass === "password123") {
        const user = { id: "user-123", email, name: "John Doe", roles: ["admin", "fintech_user"] };
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error: any) {
      dispatch({ type: "LOGIN_FAILURE" });
      toast.error(error.message || "Login failed.");
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    toast.info("Logged out.");
    navigate("/login");
  }, [navigate]);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 2. Global App Context for shared services/clients
interface GlobalAppContextType {
  modernTreasury: ModernTreasury | null;
  geminiClient: GoogleGenerativeAI | null;
  initializedServices: Record<string, boolean>;
  flashError: (message: string) => void;
  // Add other shared clients/instances here
}
const GlobalAppContext = createContext<GlobalAppContextType | undefined>(undefined);

const GlobalAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modernTreasury, setModernTreasury] = useState<ModernTreasury | null>(null);
  const [geminiClient, setGeminiClient] = useState<GoogleGenerativeAI | null>(null);
  const [initializedServices, setInitializedServices] = useState<Record<string, boolean>>({});

  const flashError = useCallback((message: string) => {
    toast.error(message);
    console.error(message); // Also log to console for development/Sentry
  }, []);

  // Initialize Gemini AI client
  useEffect(() => {
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      setGeminiClient(genAI);
      setInitializedServices(prev => ({ ...prev, "Google Gemini AI": true }));
      console.log("Gemini AI client initialized.");
    } else {
      console.warn("GEMINI_API_KEY not found. Gemini AI features will be unavailable.");
      flashError("Gemini AI key missing. Please configure your environment variables.");
    }
  }, [flashError]);

  // Initialize Modern Treasury (if a publishable key is generically available, otherwise it's per-flow)
  // This is a placeholder for a global MT client instance if needed for non-embeddable flow operations.
  // The actual EmbeddableFlowDemo component handles its own MT client initialization based on selected key.
  useEffect(() => {
    const initGlobalModernTreasury = async () => {
      // This key would ideally come from a backend API or a global config if a single tenant setup.
      // For multi-tenant, it's typically user/workflow specific.
      const defaultPublishableKey = process.env.MODERN_TREASURY_DEFAULT_PUBLISHABLE_KEY || "pk_test_placeholder_default";
      if (defaultPublishableKey && defaultPublishableKey !== "pk_test_placeholder_default") {
        try {
          const loadedModernTreasury = await loadModernTreasury(defaultPublishableKey);
          if (loadedModernTreasury) {
            setModernTreasury(loadedModernTreasury);
            setInitializedServices(prev => ({ ...prev, "Modern Treasury Global Client": true }));
            console.log("Global Modern Treasury client initialized.");
          }
        } catch (error) {
          console.error("Failed to load global Modern Treasury client:", error);
          flashError("Failed to load global Modern Treasury client.");
        }
      }
    };
    void initGlobalModernTreasury();
  }, [flashError]);

  // Simulate initialization of other external services
  useEffect(() => {
    EXTERNAL_SERVICES_CONFIG.forEach(service => {
      if (process.env[service.envVar]) {
        // Here you would instantiate client SDKs for each service
        // For example:
        // if (service.name === "Stripe") { stripe = new Stripe(process.env.STRIPE_SECRET_KEY); }
        // if (service.name === "Twilio") { twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); }
        setInitializedServices(prev => ({ ...prev, [service.name]: true }));
      }
    });
    console.log("Attempted to initialize all external services.");
  }, []);


  const value = useMemo(() => ({
    modernTreasury,
    geminiClient,
    initializedServices,
    flashError,
  }), [modernTreasury, geminiClient, initializedServices, flashError]);

  return <GlobalAppContext.Provider value={value}>{children}</GlobalAppContext.Provider>;
};

const useGlobalApp = () => {
  const context = useContext(GlobalAppContext);
  if (context === undefined) {
    throw new Error("useGlobalApp must be used within a GlobalAppProvider");
  }
  return context;
};

// --- UTILITIES AND HELPER FUNCTIONS ---
// Utility for handling errors (already existed, but enhanced for toasts)
const useErrorBanner = () => {
  const flashError = useCallback((message: string) => {
    toast.error(message);
    console.error(message);
  }, []);
  return flashError;
};

// Utility to create options for Modern Treasury Embeddable Flow
// (Original utility, kept and enhanced)
const embeddableFlowCreateOptions = (
  clientToken: string,
  appearanceVariables: AppearanceVariables,
) => {
  return {
    clientToken,
    variables: appearanceVariables,
    onSuccess: (data: any) => {
      toast.success(`Flow completed successfully! Data: ${JSON.stringify(data)}`);
      console.log("EmbeddableFlow success:", data);
      // Trigger analytics event, send webhook, update internal state
      // analytics.track('embeddable_flow_completed', { flowType: data.flowType });
      // axios.post('/api/webhooks/modern-treasury-flow-complete', data);
    },
    onExit: (data: any) => {
      toast.info(`Flow exited. Data: ${JSON.stringify(data)}`);
      console.log("EmbeddableFlow exited:", data);
    },
    onUpdate: (data: any) => {
      console.log("EmbeddableFlow updated:", data);
    },
    // Add more callbacks as needed for a robust app
  };
};

// --- APPLICATION SUB-COMPONENTS (Defined within this monolithic file) ---

interface AppearanceVariablesFormProps {
  isWorkflowMounted: boolean;
  onSubmit: (appearanceVariables: AppearanceVariables) => void;
  initialValues?: AppearanceVariables;
}

const appearanceSchema = z.object({
  colorPrimary: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Must be a valid hex color"),
  fontFamily: z.string().min(1, "Font family cannot be empty"),
  colorBackground: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Must be a valid hex color"),
  // Add more styling variables as per Modern Treasury docs
});

const AppearanceVariablesForm: React.FC<AppearanceVariablesFormProps> = ({
  isWorkflowMounted,
  onSubmit,
  initialValues = {
    colorPrimary: "#2B71D4",
    fontFamily: "Inter",
    colorBackground: "#ffffff",
  },
}) => {
  const { control, handleSubmit, reset } = useForm<AppearanceVariables>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
      <div className="text-base font-bold">Appearance Variables</div>
      <div>
        <Label id="colorPrimary">Primary Color</Label>
        <Controller
          name="colorPrimary"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <input
                type="color"
                {...field}
                className="mt-1 block h-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
            </>
          )}
        />
      </div>
      <div>
        <Label id="fontFamily">Font Family</Label>
        <Controller
          name="fontFamily"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
            </>
          )}
        />
      </div>
      <div>
        <Label id="colorBackground">Background Color</Label>
        <Controller
          name="colorBackground"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <input
                type="color"
                {...field}
                className="mt-1 block h-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
            </>
          )}
        />
      </div>
      <Button type="submit" disabled={isWorkflowMounted}>
        {isWorkflowMounted ? "Update Appearance" : "Mount Workflow"}
      </Button>
    </form>
  );
};


const EmbeddableFlowSection: React.FC<{ clientToken: string }> = ({ clientToken }) => {
  const flashError = useErrorBanner();
  const { modernTreasury } = useGlobalApp(); // Use global MT instance if available for other MT calls

  const [embeddableFlow, setEmbeddableFlow] = useState<EmbeddableFlow>();

  const { loading, data, error } = usePublishableKeysDemoSelectQuery(); // Assuming this hook works without issues
  const [selectedKey, setSelectedKey] = useState<SelectValue>();
  const publishableKey = data?.publishableKeys.edges[0]?.node;
  const [codeVariables, setCodeVariables] = useState<Record<string, string>>({
    colorPrimary: "#2B71D4",
    fontFamily: "Inter",
    colorBackground: "#ffffff",
  });

  const currentPublishableKey = useMemo(() => {
    if (selectedKey) return selectedKey.value as string;
    if (publishableKey) return publishableKey.key as string;
    return process.env.MODERN_TREASURY_DEFAULT_PUBLISHABLE_KEY || "pk_test_default_if_none"; // Fallback for demo
  }, [selectedKey, publishableKey]);

  useEffect(() => {
    if (!currentPublishableKey) return;

    const initModernTreasuryEmbeddable = async () => {
      try {
        const loadedModernTreasury = await loadModernTreasury(currentPublishableKey);
        if (loadedModernTreasury) {
          // A dedicated instance for this embeddable flow might be better for isolation
          // setModernTreasury(loadedModernTreasury); // If we wanted to manage this MT instance here
        }
      } catch (err) {
        flashError(`Failed to load Modern Treasury SDK: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    void initModernTreasuryEmbeddable();
  }, [currentPublishableKey, flashError]);


  const onSubmitAppearanceVariables = (
    appearanceVariables: AppearanceVariables,
  ) => {
    if (!currentPublishableKey) {
      flashError("No publishable key selected or found.");
      return;
    }

    const options = embeddableFlowCreateOptions(
      clientToken,
      appearanceVariables,
    );

    const mountFlow = async () => {
      try {
        // Re-load MT client specifically for this flow, ensuring it uses the correct key.
        const mtClientForFlow = await loadModernTreasury(currentPublishableKey);
        if (!mtClientForFlow) {
          throw new Error("Failed to load Modern Treasury client for embeddable flow.");
        }

        if (!embeddableFlow) {
          const newEmbeddableFlow = mtClientForFlow.createEmbeddableFlow(options);
          newEmbeddableFlow.mount(`#${MOUNT_HERE}`);
          setEmbeddableFlow(newEmbeddableFlow);
          toast.success("Embeddable flow mounted!");
        } else {
          embeddableFlow.update({ variables: appearanceVariables });
          toast.info("Embeddable flow appearance updated.");
        }
        setCodeVariables(appearanceVariables as Record<string, string>);
      } catch (err) {
        flashError(`Error with Embeddable Flow: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    void mountFlow();
  };

  if ((data && !data.publishableKeys.edges.length) || error) {
    return (
      <div className="pb-4 pt-4 text-sm text-gray-800">
        No publishable keys were found. Create one here: &nbsp;&nbsp;
        <Link to={PUBLISHABLE_KEY_UI} className="text-indigo-600 hover:text-indigo-800"> Publishable Keys </Link>
        <p className="mt-2 text-red-500">Error loading keys: {error?.message || "Unknown error"}</p>
      </div>
    );
  }

  const codeSnippet = useMemo(() => `const mt = ModernTreasury('${
    currentPublishableKey
  }');
    \nconst embeddableFlow = mt.createEmbeddableFlow(${JSON.stringify(
      embeddableFlowCreateOptions(clientToken, codeVariables),
      null,
      2,
    )});
    \nembeddableFlow.mount("#${MOUNT_HERE}");
    `, [clientToken, codeVariables, currentPublishableKey]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Modern Treasury Embeddable Workflow</h2>
      <div className="pb-4 text-sm text-gray-800">
        <span className="text-gray-500 font-medium">client_token: </span>
        <CopyableText text={clientToken} className="inline-flex"><code>{clientToken}</code></CopyableText>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-8 pt-8">
        <div className="md:col-span-2">
          {!loading && data && (
            <div className="w-full mb-8">
              <div className="pb-4 text-base font-bold">Workflow Variables</div>
              <Label
                helpText="This key will be used to load your workflow object."
                id="publishableKey"
              >
                Publishable Key
              </Label>
              <PublishableKeySelectField
                selectValue={
                  selectedKey
                    ? selectedKey.label
                    : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                      `${publishableKey?.name} · ${publishableKey?.prettyDomainAllowlist}`
                }
                onChange={setSelectedKey as (value: SelectValue | null) => void}
                disabled={!!embeddableFlow}
              />
            </div>
          )}
          <AppearanceVariablesForm
            isWorkflowMounted={!!embeddableFlow}
            onSubmit={onSubmitAppearanceVariables}
            initialValues={codeVariables as AppearanceVariables}
          />
        </div>
        <div className="md:col-span-4">
          {embeddableFlow && (
            <h3 className="pb-10 text-center text-lg font-semibold text-gray-700">
              Hint: 021000021 is a valid routing number
            </h3>
          )}
          <div className="flex justify-center p-4 border border-dashed border-gray-300 rounded-lg min-h-[300px] bg-gray-50">
            <div id={MOUNT_HERE} className="w-full lg:w-3/4 bg-white shadow-lg rounded-md overflow-hidden" />
          </div>
        </div>
      </div>
      <div className="mt-10">
        <div className="pb-4 pt-8 text-base font-bold">
          <CopyableText text={codeSnippet}>Integration Code Snippet</CopyableText>
        </div>
        <Code
          className="rounded-md bg-gray-800 p-4"
          codeClassName="text-gray-100"
          text={codeSnippet}
          language="javascript"
        />
      </div>
    </div>
  );
};

const DashboardOverview: React.FC = () => {
  const flashError = useErrorBanner();
  // Simulated data for charts
  const [transactionData, setTransactionData] = useState([
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Apr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
    { name: 'Jul', income: 3490, expenses: 4300 },
  ]);
  const [paymentVolumeData, setPaymentVolumeData] = useState([
    { name: 'Week 1', volume: 40000 },
    { name: 'Week 2', volume: 45000 },
    { name: 'Week 3', volume: 38000 },
    { name: 'Week 4', volume: 52000 },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: "Payment", description: "Processed inbound payment from ABC Corp", amount: 12500, status: "completed", timestamp: dayjs().subtract(5, 'minutes').toISOString() },
    { id: 2, type: "Payout", description: "Issued payout to Vendor XYZ", amount: 3200, status: "pending", timestamp: dayjs().subtract(1, 'hour').toISOString() },
    { id: 3, type: "Account", description: "New bank account linked via Plaid", amount: 0, status: "success", timestamp: dayjs().subtract(3, 'hours').toISOString() },
    { id: 4, type: "Payment", description: "Failed outbound payment to Supplier A", amount: 5000, status: "failed", timestamp: dayjs().subtract(1, 'day').toISOString() },
  ]);

  useEffect(() => {
    // In a real app, fetch data from your backend API
    const fetchDashboardData = async () => {
      try {
        // const { data } = await axios.get('/api/dashboard/summary');
        // setTransactionData(data.transactionTrends);
        // setPaymentVolumeData(data.paymentVolumes);
        // setRecentActivities(data.activities);
        toast.info("Dashboard data loaded (simulated).");
      } catch (error) {
        flashError("Failed to load dashboard data.");
      }
    };
    void fetchDashboardData();
  }, [flashError]);

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue (MT)</p>
            <p className="text-3xl font-semibold text-gray-900">$250,000</p>
            <p className="text-xs text-green-500">+12% from last month</p>
          </div>
          <DollarSign className="h-10 w-10 text-indigo-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
            <p className="text-3xl font-semibold text-gray-900">$15,200</p>
            <p className="text-xs text-orange-500">3 transactions</p>
          </div>
          <Wallet className="h-10 w-10 text-orange-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Connected Services</p>
            <p className="text-3xl font-semibold text-gray-900">42</p>
            <p className="text-xs text-blue-500">View Integrations</p>
          </div>
          <Zap className="h-10 w-10 text-blue-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Fraud Alerts</p>
            <p className="text-3xl font-semibold text-red-600">3</p>
            <p className="text-xs text-red-500">Immediate action required</p>
          </div>
          <Bell className="h-10 w-10 text-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Financial Overview</h3>
          <ChartContainer width="100%" height={300} config={{
            income: { color: "hsl(120 70% 50%)" },
            expenses: { color: "hsl(0 70% 50%)" },
          }}>
            <BarChart data={transactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="var(--color-income)" name="Income" />
              <Bar dataKey="expenses" fill="var(--color-expenses)" name="Expenses" />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Volume Trend</h3>
          <ChartContainer width="100%" height={300} config={{
            volume: { color: "hsl(210 70% 50%)" }
          }}>
            <LineChart data={paymentVolumeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="volume" stroke="var(--color-volume)" name="Volume" />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <ul className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                  <span className="ml-2"> | {activity.type}</span>
                </p>
              </div>
              <div className="text-right">
                {activity.amount > 0 && (
                  <p className={`text-sm font-semibold ${activity.type === 'Payment' ? 'text-green-600' : 'text-gray-900'}`}>
                    {activity.amount > 0 ? `$${activity.amount.toLocaleString()}` : ''}
                  </p>
                )}
                <p className="text-xs text-gray-500">{dayjs(activity.timestamp).fromNow()}</p>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="link" className="mt-4">View All Activities</Button>
      </div>
    </div>
  );
};

const IntegrationsManager: React.FC = () => {
  const { initializedServices } = useGlobalApp();
  const flashError = useErrorBanner();

  const [filter, setFilter] = useState("");
  const filteredServices = useMemo(() => {
    return EXTERNAL_SERVICES_CONFIG.filter(service =>
      service.name.toLowerCase().includes(filter.toLowerCase()) ||
      service.purpose.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  const connectService = useCallback((serviceName: string) => {
    // Simulate connection flow
    toast.info(`Attempting to connect to ${serviceName}... (simulated)`);
    console.log(`Simulating connection for ${serviceName}`);
    // In a real app, this would redirect to OAuth, open a popup, or guide through API key entry
    setTimeout(() => {
      // Simulate success or failure
      if (Math.random() > 0.3) {
        setInitializedServices(prev => ({ ...prev, [serviceName]: true }));
        toast.success(`${serviceName} connected successfully!`);
      } else {
        flashError(`Failed to connect ${serviceName}. Please try again.`);
      }
    }, 1500);
  }, [flashError, setInitializedServices]);

  const disconnectService = useCallback((serviceName: string) => {
    // Simulate disconnection
    toast.warn(`Disconnecting from ${serviceName}... (simulated)`);
    console.log(`Simulating disconnection for ${serviceName}`);
    setTimeout(() => {
      setInitializedServices(prev => ({ ...prev, [serviceName]: false }));
      toast.info(`${serviceName} disconnected.`);
    }, 1000);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">External Integrations ({EXTERNAL_SERVICES_CONFIG.length})</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search integrations..."
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <div key={service.envVar} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{service.purpose}</p>
              <p className="text-xs text-gray-500">
                Secret (env): <code className="bg-gray-100 p-1 rounded text-gray-700">{service.envVar}</code>
              </p>
            </div>
            <div className="mt-4">
              {initializedServices[service.name] ? (
                <Button variant="outline" size="sm" onClick={() => disconnectService(service.name)} className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" onClick={() => connectService(service.name)} className="w-full">
                  Connect
                </Button>
              )}
            </div>
          </div>
        ))}
        {filteredServices.length === 0 && (
          <p className="col-span-full text-center text-gray-600 py-10">No integrations found matching your search.</p>
        )}
      </div>
    </div>
  );
};

const AIAssistant: React.FC = () => {
  const { geminiClient } = useGlobalApp();
  const flashError = useErrorBanner();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);

  const sendMessage = useCallback(async () => {
    if (!geminiClient) {
      flashError("Gemini AI client not initialized. Check API key configuration.");
      return;
    }
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse(null);
    const newChatHistory = [...chatHistory, { role: 'user', parts: [{ text: prompt }] }];
    setChatHistory(newChatHistory);

    try {
      const model = geminiClient.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.startChat({ history: newChatHistory.slice(0, -1) }).sendMessage(prompt);
      const text = result.response.text();
      setResponse(text);
      setChatHistory([...newChatHistory, { role: 'model', parts: [{ text }] }]);
      setPrompt("");
    } catch (error) {
      flashError(`Failed to get response from Gemini AI: ${error instanceof Error ? error.message : String(error)}`);
      setResponse("Error: Could not get a response from AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [geminiClient, prompt, flashError, chatHistory]);

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">AI Assistant (Powered by Gemini)</h1>

      {!geminiClient && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">Gemini AI is not configured. Please ensure `GEMINI_API_KEY` is set in your environment variables.</span>
        </div>
      )}

      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-y-auto mb-6 flex flex-col">
        {chatHistory.length === 0 && (
          <p className="text-gray-500 text-center flex-1 flex items-center justify-center">
            Ask Gemini anything about your financial data, trends, or predictions.
          </p>
        )}
        {chatHistory.map((msg, index) => (
          <div key={index} className={`mb-4 p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-100 self-end text-indigo-900' : 'bg-gray-100 self-start text-gray-800'}`}>
            <p className="font-semibold text-xs mb-1">{msg.role === 'user' ? 'You' : 'Gemini AI'}</p>
            <p className="whitespace-pre-wrap">{msg.parts.map(p => p.text).join('')}</p>
          </div>
        ))}
        {isLoading && (
          <div className="self-start text-gray-600 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      <div className="mt-auto p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex">
        <textarea
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
          placeholder="e.g., 'Summarize last month's transactions' or 'Predict next quarter's revenue based on current trends.'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
          disabled={isLoading || !geminiClient}
        />
        <Button onClick={sendMessage} isLoading={isLoading} disabled={!prompt.trim() || !geminiClient} className="ml-4 px-6 py-3">
          <Bot className="mr-2 h-4 w-4" /> Ask Gemini
        </Button>
      </div>
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const flashError = useErrorBanner();

  const settingsSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    currency: z.string().min(1, "Currency is required"),
    timezone: z.string().min(1, "Timezone is required"),
    notifications: z.boolean(),
  });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      currency: "USD",
      timezone: "America/New_York",
      notifications: true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        name: user.name,
        currency: "USD", // Example: fetch from user profile
        timezone: "America/New_York", // Example: fetch from user profile
        notifications: true, // Example: fetch from user profile
      });
    }
  }, [user, reset]);

  const onSubmit = useCallback(async (data: z.infer<typeof settingsSchema>) => {
    try {
      // Simulate API call to update user settings
      // await axios.post('/api/user/settings', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      toast.success("Settings updated successfully!");
      console.log("Updated settings:", data);
    } catch (error) {
      flashError(`Failed to update settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [flashError]);

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">General Account Settings</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label id="name">Full Name</Label>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input type="text" {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
                </>
              )}
            />
          </div>
          <div>
            <Label id="email">Email Address</Label>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input type="email" {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" disabled />
                  {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
                </>
              )}
            />
          </div>
          <div>
            <Label id="currency">Default Currency</Label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <select {...field} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                  <option value="USD">USD - United States Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              )}
            />
          </div>
          <div>
            <Label id="timezone">Timezone</Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <select {...field} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                  <option value="America/New_York">America/New York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              )}
            />
          </div>
          <div className="flex items-center">
            <Controller
              name="notifications"
              control={control}
              render={({ field }) => (
                <input type="checkbox" {...field} checked={field.value} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              )}
            />
            <Label id="notifications" className="ml-2">Enable Email Notifications</Label>
          </div>
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Save Settings
          </Button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Security Settings</h2>
        <Button variant="outline" className="w-full mb-4">Change Password</Button>
        <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">Delete Account</Button>
      </div>
    </div>
  );
};


// Layout components
interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}
const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, children }) => {
  const navigate = useNavigate();
  const isActive = window.location.pathname === to; // Basic active state
  return (
    <Button variant="ghost" className={`w-full justify-start py-2 px-4 ${isActive ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => navigate(to)}>
      <Icon className="mr-3 h-5 w-5" />
      {children}
    </Button>
  );
};

const SidebarNavigation: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useAuth(); // Assuming user is available for display
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-8 mt-2">
        <DollarSign className="h-8 w-8 text-indigo-600" />
        <span className="text-xl font-bold text-gray-900">FinTechHub</span>
      </div>
      <nav className="flex-1 space-y-2">
        <SidebarLink to="/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
        <SidebarLink to="/embeddable-flow" icon={Repeat}>Embeddable Workflows</SidebarLink>
        <SidebarLink to="/integrations" icon={Zap}>Integrations</SidebarLink>
        <SidebarLink to="/ai-assistant" icon={Bot}>AI Assistant</SidebarLink>
        <SidebarLink to="/settings" icon={Cog}>Settings</SidebarLink>
        {/* Potentially more links: Analytics, Reports, Users, Audit Logs, Webhooks */}
      </nav>
      <div className="mt-auto pt-6 border-t border-gray-200">
        {user && (
          <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{user.name || user.email}</span>
            </div>
            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">{user.roles[0]}</span>
          </div>
        )}
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={logout}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
      <div className="text-lg font-semibold text-gray-800">Welcome, {user?.name || user?.email}!</div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5 text-gray-600" />
        </Button>
        {/* User dropdown for profile, settings (if not in sidebar) */}
      </div>
    </header>
  );
};

// --- LOGIN PAGE ---
const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const flashError = useErrorBanner();

  const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const { control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data.email, data.password);
    } catch (e) {
      flashError(e instanceof Error ? e.message : "An unknown error occurred during login.");
    }
  }, [login, flashError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center">
          <DollarSign className="h-12 w-12 text-indigo-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Sign in to FinTechHub</h2>
          <p className="mt-2 text-sm text-gray-600">Access your millions-worth financial platform</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label id="login-email">Email address</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              )}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Label id="login-password">Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                />
              )}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</a>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</a>
        </p>
        <p className="mt-4 text-center text-xs text-gray-500">
          For demo, use email: `user@example.com` | password: `password123`
        </p>
      </div>
    </div>
  );
};


// --- MAIN APPLICATION COMPONENT (Refactored from EmbeddableFlowDemo) ---
interface FintechHubAppProps {
  clientToken: string; // The client token for Modern Treasury, passed from parent
}

function FintechHubApp({ clientToken }: FintechHubAppProps) {
  const { isAuthenticated } = useAuth();
  const flashError = useErrorBanner();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <SidebarNavigation />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <ErrorBoundary fallback={<div className="p-8 text-red-600 text-center"><h1>Application Error</h1><p>Something went wrong. Please refresh or contact support.</p></div>}>
            <Routes>
              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/embeddable-flow" element={<EmbeddableFlowSection clientToken={clientToken} />} />
              <Route path="/integrations" element={<IntegrationsManager />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<DashboardOverview />} /> {/* Default route */}
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </div>
  );
}

// --- APP WRAPPER FOR CONTEXTS AND ROUTER ---
const AppWrapper: React.FC<{ clientToken: string }> = ({ clientToken }) => {
  return (
    <Router>
      <AuthProvider>
        <GlobalAppProvider>
          <FintechHubApp clientToken={clientToken} />
        </GlobalAppProvider>
      </AuthProvider>
    </Router>
  );
};

// Export the wrapper component, making sure it handles the original clientToken prop
export default AppWrapper;