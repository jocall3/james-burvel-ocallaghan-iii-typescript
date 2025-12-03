import React, { useState, useEffect, useContext, createContext, useCallback } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect, useHistory, Link, NavLink, useLocation } from "react-router-dom";

// This is the conceptual `apiConfig.js` or `secrets.js` file, containing all environment variables
// In a real application, these would be managed by a robust secrets manager (e.g., AWS Secrets Manager, Google Secret Manager, HashiCorp Vault)
// and injected into the environment securely, not hardcoded.
// For demonstration, we list many popular services and their conceptual environment variables.
const API_CONFIG = {
  // --- Core AI Services ---
  GOOGLE_GEMINI_API_KEY: process.env.REACT_APP_GOOGLE_GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
  AWS_REKOGNITION_ACCESS_KEY_ID: process.env.REACT_APP_AWS_REKOGNITION_ACCESS_KEY_ID,
  AWS_REKOGNITION_SECRET_ACCESS_KEY: process.env.REACT_APP_AWS_REKOGNITION_SECRET_ACCESS_KEY,
  AZURE_COGNITIVE_SERVICES_KEY: process.env.REACT_APP_AZURE_COGNITIVE_SERVICES_KEY,

  // --- Authentication & User Management ---
  AUTH0_DOMAIN: process.env.REACT_APP_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.REACT_APP_AUTH0_CLIENT_ID,
  FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  OKTA_ORG_URL: process.env.REACT_APP_OKTA_ORG_URL,
  OKTA_CLIENT_ID: process.env.REACT_APP_OKTA_CLIENT_ID,
  CLERK_PUBLISHABLE_KEY: process.env.REACT_APP_CLERK_PUBLISHABLE_KEY,
  GOOGLE_OAUTH_CLIENT_ID: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
  APPLE_ID_CLIENT_ID: process.env.REACT_APP_APPLE_ID_CLIENT_ID,
  MICROSOFT_AAD_B2C_TENANT_ID: process.env.REACT_APP_MICROSOFT_AAD_B2C_TENANT_ID,

  // --- Database & Storage ---
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  MONGO_DB_ATLAS_URI: process.env.REACT_APP_MONGO_DB_ATLAS_URI,
  REDIS_UPSTASH_URL: process.env.REACT_APP_REDIS_UPSTASH_URL,
  AWS_S3_BUCKET_NAME: process.env.REACT_APP_AWS_S3_BUCKET_NAME,
  AWS_S3_REGION: process.env.REACT_APP_AWS_S3_REGION,
  AWS_S3_ACCESS_KEY_ID: process.env.REACT_APP_AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY: process.env.REACT_APP_AWS_S3_SECRET_ACCESS_KEY,
  GCS_PROJECT_ID: process.env.REACT_APP_GCS_PROJECT_ID,
  GCS_BUCKET_NAME: process.env.REACT_APP_GCS_BUCKET_NAME,
  AZURE_BLOB_STORAGE_CONNECTION_STRING: process.env.REACT_APP_AZURE_BLOB_STORAGE_CONNECTION_STRING,
  CLOUDFLARE_R2_ACCOUNT_ID: process.env.REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID,
  CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY,

  // --- Payment Gateways & Billing ---
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
  STRIPE_SECRET_KEY: process.env.REACT_APP_STRIPE_SECRET_KEY, // Backend only
  PAYPAL_CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.REACT_APP_PAYPAL_CLIENT_SECRET, // Backend only
  SQUARE_APPLICATION_ID: process.env.REACT_APP_SQUARE_APPLICATION_ID,
  SQUARE_ACCESS_TOKEN: process.env.REACT_APP_SQUARE_ACCESS_TOKEN, // Backend only
  BRAINTREE_MERCHANT_ID: process.env.REACT_APP_BRAINTREE_MERCHANT_ID,
  BRAINTREE_PUBLIC_KEY: process.env.REACT_APP_BRAINTREE_PUBLIC_KEY,
  BRAINTREE_PRIVATE_KEY: process.env.REACT_APP_BRAINTREE_PRIVATE_KEY, // Backend only
  CHARGEBEE_SITE_NAME: process.env.REACT_APP_CHARGEBEE_SITE_NAME,
  CHARGEBEE_PUBLISHABLE_KEY: process.env.REACT_APP_CHARGEBEE_PUBLISHABLE_KEY,

  // --- Communication & Notifications ---
  SENDGRID_API_KEY: process.env.REACT_APP_SENDGRID_API_KEY,
  TWILIO_ACCOUNT_SID: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.REACT_APP_TWILIO_PHONE_NUMBER,
  MAILGUN_API_KEY: process.env.REACT_APP_MAILGUN_API_KEY,
  MAILGUN_DOMAIN: process.env.REACT_APP_MAILGUN_DOMAIN,
  AWS_SES_ACCESS_KEY_ID: process.env.REACT_APP_AWS_SES_ACCESS_KEY_ID,
  AWS_SES_SECRET_ACCESS_KEY: process.env.REACT_APP_AWS_SES_SECRET_ACCESS_KEY,
  ONESIGNAL_APP_ID: process.env.REACT_APP_ONESIGNAL_APP_ID,
  ONESIGNAL_API_KEY: process.env.REACT_APP_ONESIGNAL_API_KEY,
  BRAZE_API_KEY: process.env.REACT_APP_BRAZE_API_KEY,
  PUSHER_APP_ID: process.env.REACT_APP_PUSHER_APP_ID,
  PUSHER_APP_KEY: process.env.REACT_APP_PUSHER_APP_KEY,
  PUSHER_APP_SECRET: process.env.REACT_APP_PUSHER_APP_SECRET, // Backend only
  ABLY_API_KEY: process.env.REACT_APP_ABLY_API_KEY,

  // --- Analytics & Monitoring ---
  GA4_MEASUREMENT_ID: process.env.REACT_APP_GA4_MEASUREMENT_ID,
  MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN,
  AMPLITUDE_API_KEY: process.env.REACT_APP_AMPLITUDE_API_KEY,
  SEGMENT_WRITE_KEY: process.env.REACT_APP_SEGMENT_WRITE_KEY,
  POSTHOG_API_KEY: process.env.REACT_APP_POSTHOG_API_KEY,
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  LOGROCKET_APP_ID: process.env.REACT_APP_LOGROCKET_APP_ID,
  DATADOG_CLIENT_TOKEN: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
  NEWRELIC_LICENSE_KEY: process.env.REACT_APP_NEWRELIC_LICENSE_KEY,

  // --- CDN & Performance ---
  CLOUDFLARE_ZONE_ID: process.env.REACT_APP_CLOUDFLARE_ZONE_ID,
  CLOUDFLARE_API_KEY: process.env.REACT_APP_CLOUDFLARE_API_KEY,
  AKAMAI_CLIENT_TOKEN: process.env.REACT_APP_AKAMAI_CLIENT_TOKEN,
  FASTLY_API_KEY: process.env.REACT_APP_FASTLY_API_KEY,

  // --- CRM & Marketing Automation ---
  SALESFORCE_CLIENT_ID: process.env.REACT_APP_SALESFORCE_CLIENT_ID,
  SALESFORCE_CLIENT_SECRET: process.env.REACT_APP_SALESFORCE_CLIENT_SECRET, // Backend only
  HUBSPOT_API_KEY: process.env.REACT_APP_HUBSPOT_API_KEY,
  ZOHO_CRM_CLIENT_ID: process.env.REACT_APP_ZOHO_CRM_CLIENT_ID,
  ZOHO_CRM_CLIENT_SECRET: process.env.REACT_APP_ZOHO_CRM_CLIENT_SECRET, // Backend only
  MAILCHIMP_API_KEY: process.env.REACT_APP_MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER_PREFIX: process.env.REACT_APP_MAILCHIMP_SERVER_PREFIX,
  ACTIVECAMPAIGN_API_KEY: process.env.REACT_APP_ACTIVECAMPAIGN_API_KEY,
  ACTIVECAMPAIGN_API_URL: process.env.REACT_APP_ACTIVECAMPAIGN_API_URL,

  // --- Headless CMS & Content Management ---
  CONTENTFUL_SPACE_ID: process.env.REACT_APP_CONTENTFUL_SPACE_ID,
  CONTENTFUL_DELIVERY_TOKEN: process.env.REACT_APP_CONTENTFUL_DELIVERY_TOKEN,
  SANITY_PROJECT_ID: process.env.REACT_APP_SANITY_PROJECT_ID,
  SANITY_DATASET: process.env.REACT_APP_SANITY_DATASET,
  STRAPI_API_URL: process.env.REACT_APP_STRAPI_API_URL,
  DIRECTUS_API_URL: process.env.REACT_APP_DIRECTUS_API_URL,

  // --- Customer Support & Helpdesk ---
  INTERCOM_APP_ID: process.env.REACT_APP_INTERCOM_APP_ID,
  ZENDESK_SUBDOMAIN: process.env.REACT_APP_ZENDESK_SUBDOMAIN,
  ZENDESK_CLIENT_ID: process.env.REACT_APP_ZENDESK_CLIENT_ID,
  FRESHDESK_DOMAIN: process.env.REACT_APP_FRESHDESK_DOMAIN,
  FRESHDESK_API_KEY: process.env.REACT_APP_FRESHDESK_API_KEY,

  // --- Search ---
  ALGOLIA_APP_ID: process.env.REACT_APP_ALGOLIA_APP_ID,
  ALGOLIA_SEARCH_API_KEY: process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY,
  ELASTICSEARCH_CLOUD_ID: process.env.REACT_APP_ELASTICSEARCH_CLOUD_ID,
  ELASTICSEARCH_API_KEY: process.env.REACT_APP_ELASTICSEARCH_API_KEY,

  // --- Feature Flags & A/B Testing ---
  LAUNCHDARKLY_CLIENT_SIDE_ID: process.env.REACT_APP_LAUNCHDARKLY_CLIENT_SIDE_ID,
  SPLIT_IO_API_KEY: process.env.REACT_APP_SPLIT_IO_API_KEY,
  OPTIMIZELY_SDK_KEY: process.env.REACT_APP_OPTIMIZELY_SDK_KEY,

  // --- Geospatial ---
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  MAPBOX_ACCESS_TOKEN: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,

  // --- Document Processing ---
  ADOBE_PDF_SERVICES_CLIENT_ID: process.env.REACT_APP_ADOBE_PDF_SERVICES_CLIENT_ID,
  GOOGLE_DOCS_API_KEY: process.env.REACT_APP_GOOGLE_DOCS_API_KEY,

  // --- Webhooks & Automation ---
  ZAPIER_WEBHOOK_URL: process.env.REACT_APP_ZAPIER_WEBHOOK_URL,
  MAKE_WEBHOOK_URL: process.env.REACT_APP_MAKE_WEBHOOK_URL,

  // --- Vector Database ---
  PINECONE_API_KEY: process.env.REACT_APP_PINECONE_API_KEY,
  PINECONE_ENVIRONMENT: process.env.REACT_APP_PINECONE_ENVIRONMENT,
  WEAVIATE_CLUSTER_URL: process.env.REACT_APP_WEAVIATE_CLUSTER_URL,
  WEAVIATE_API_KEY: process.env.REACT_APP_WEAVIATE_API_KEY,

  // --- Blockchain / Web3 (if applicable) ---
  ETHEREUM_INFURA_PROJECT_ID: process.env.REACT_APP_ETHEREUM_INFURA_PROJECT_ID,
  SOLANA_RPC_URL: process.env.REACT_APP_SOLANA_RPC_URL,

  // --- API Gateway / Serverless Backend (for backend services, but mentioned here for completeness) ---
  API_GATEWAY_URL: process.env.REACT_APP_API_GATEWAY_URL, // e.g., for AWS API Gateway, GCP API Gateway
  VERCEL_FUNCTION_URL: process.env.REACT_APP_VERCEL_FUNCTION_URL,
  AWS_LAMBDA_API_URL: process.env.REACT_APP_AWS_LAMBDA_API_URL,

  // --- Other useful utilities ---
  RECAPTCHA_SITE_KEY: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
  VERIDIAN_ANTI_FRAUD_API_KEY: process.env.REACT_APP_VERIDIAN_ANTI_FRAUD_API_KEY,
  KYC_ONBOARDING_API_KEY: process.env.REACT_APP_KYC_ONBOARDING_API_KEY,
  DOCUSIGN_CLIENT_ID: process.env.REACT_APP_DOCUSIGN_CLIENT_ID,
  HELLO_SIGN_API_KEY: process.env.REACT_APP_HELLO_SIGN_API_KEY,
  PLAID_CLIENT_ID: process.env.REACT_APP_PLAID_CLIENT_ID,
  PLAID_SECRET: process.env.REACT_APP_PLAID_SECRET, // Backend only
  LOQATE_API_KEY: process.env.REACT_APP_LOQATE_API_KEY, // Address validation
  ZUORA_TENANT_ID: process.env.REACT_APP_ZUORA_TENANT_ID, // Subscription management
  ZUORA_CLIENT_ID: process.env.REACT_APP_ZUORA_CLIENT_ID,
  ZUORA_CLIENT_SECRET: process.env.REACT_APP_ZUORA_CLIENT_SECRET, // Backend only
  ADOBE_ANALYTICS_REPORT_SUITE_ID: process.env.REACT_APP_ADOBE_ANALYTICS_REPORT_SUITE_ID,
  GTM_ID: process.env.REACT_APP_GTM_ID, // Google Tag Manager
  WEBFLOW_API_KEY: process.env.REACT_APP_WEBFLOW_API_KEY, // CMS integration
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_DOMAIN: process.env.REACT_APP_SHOPIFY_DOMAIN,
  WORDPRESS_API_URL: process.env.REACT_APP_WORDPRESS_API_URL,
  HOTJAR_SITE_ID: process.env.REACT_APP_HOTJAR_SITE_ID,
  FULLSTORY_ORG_ID: process.env.REACT_APP_FULLSTORY_ORG_ID,
  PAGELY_API_KEY: process.env.REACT_APP_PAGELY_API_KEY, // Managed WordPress hosting API
  DATADOG_APPLICATION_ID: process.env.REACT_APP_DATADOG_APPLICATION_ID,
  FRESHSERVICE_API_KEY: process.env.REACT_APP_FRESHSERVICE_API_KEY, // IT Service Management
  DYNATRACE_TENANT_URL: process.env.REACT_APP_DYNATRACE_TENANT_URL, // APM
  DYNATRACE_API_TOKEN: process.env.REACT_APP_DYNATRACE_API_TOKEN,
  SPLUNK_HEC_URL: process.env.REACT_APP_SPLUNK_HEC_URL, // Log Management
  SPLUNK_HEC_TOKEN: process.env.REACT_APP_SPLUNK_HEC_TOKEN,
  TRELLO_API_KEY: process.env.REACT_APP_TRELLO_API_KEY, // Project Management Integration
  JIRA_API_KEY: process.env.REACT_APP_JIRA_API_KEY, // Project Management Integration
  GITHUB_API_TOKEN: process.env.REACT_APP_GITHUB_API_TOKEN, // Developer Tooling
  GITLAB_API_TOKEN: process.env.REACT_APP_GITLAB_API_TOKEN,
  BITBUCKET_API_TOKEN: process.env.REACT_APP_BITBUCKET_API_TOKEN,
  SLACK_WEBHOOK_URL: process.env.REACT_APP_SLACK_WEBHOOK_URL, // Internal Communications
  MICROSOFT_TEAMS_WEBHOOK_URL: process.env.REACT_APP_MICROSOFT_TEAMS_WEBHOOK_URL,
  CLICKUP_API_KEY: process.env.REACT_APP_CLICKUP_API_KEY, // Project Management
  ASANA_ACCESS_TOKEN: process.env.REACT_APP_ASANA_ACCESS_TOKEN,
  MONDAY_COM_API_KEY: process.env.REACT_APP_MONDAY_COM_API_KEY,
  SMARTSHEET_API_KEY: process.env.REACT_APP_SMARTSHEET_API_KEY,
  SALESLOFT_API_KEY: process.env.REACT_APP_SALESLOFT_API_KEY, // Sales Engagement Platform
  OUTREACH_API_KEY: process.env.REACT_APP_OUTREACH_API_KEY,
  DRIFT_CHAT_EMBED_ID: process.env.REACT_APP_DRIFT_CHAT_EMBED_ID, // Conversational Marketing
  PARDOT_API_KEY: process.env.REACT_APP_PARDOT_API_KEY,
  ELOQUA_API_KEY: process.env.REACT_APP_ELOQUA_API_KEY,
  MARKETO_CLIENT_ID: process.env.REACT_APP_MARKETO_CLIENT_ID,
  MARKETO_CLIENT_SECRET: process.env.REACT_APP_MARKETO_CLIENT_SECRET,
  VWO_ACCOUNT_ID: process.env.REACT_APP_VWO_ACCOUNT_ID, // A/B Testing
  ADOBE_TARGET_CLIENT_CODE: process.env.REACT_APP_ADOBE_TARGET_CLIENT_CODE,
  SPRINKLR_CLIENT_ID: process.env.REACT_APP_SPRINKLR_CLIENT_ID, // Social Media Management
  HOOTSUITE_CLIENT_ID: process.env.REACT_APP_HOOTSUITE_CLIENT_ID,
  BUFFER_CLIENT_ID: process.env.REACT_APP_BUFFER_CLIENT_ID,
  KAGGLE_API_KEY: process.env.REACT_APP_KAGGLE_API_KEY, // Data Science Platform
  HUGGINGFACE_API_TOKEN: process.env.REACT_APP_HUGGINGFACE_API_TOKEN, // NLP Models
  OPENSTREETMAP_API_KEY: process.env.REACT_APP_OPENSTREETMAP_API_KEY,
  HERE_MAPS_API_KEY: process.env.REACT_APP_HERE_MAPS_API_KEY,
  TOMTOM_MAPS_API_KEY: process.env.REACT_APP_TOMTOM_MAPS_API_KEY,
  CLOUDFARE_TURNSTILE_SITE_KEY: process.env.REACT_APP_CLOUDFARE_TURNSTILE_SITE_KEY,
  IMAGINE_API_KEY: process.env.REACT_APP_IMAGINE_API_KEY, // Image generation
  RUNWAY_ML_API_KEY: process.env.REACT_APP_RUNWAY_ML_API_KEY, // Video generation
  DEEP_L_API_KEY: process.env.REACT_APP_DEEP_L_API_KEY, // Translation
  GOOGLE_TRANSLATE_API_KEY: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY,
  MURAL_API_KEY: process.env.REACT_APP_MURAL_API_KEY, // Collaborative Whiteboard
  FIGMA_API_KEY: process.env.REACT_APP_FIGMA_API_KEY, // Design Integration
  CANVA_API_KEY: process.env.REACT_APP_CANVA_API_KEY, // Design Integration
  TYPEFORM_API_KEY: process.env.REACT_APP_TYPEFORM_API_KEY, // Form & Survey Builder
  SURVEYMONKEY_API_KEY: process.env.REACT_APP_SURVEYMONKEY_API_KEY,
  QUALTRICS_API_KEY: process.env.REACT_APP_QUALTRICS_API_KEY,
  CALENDLY_API_KEY: process.env.REACT_APP_CALENDLY_API_KEY, // Scheduling Integration
  ZILLOW_API_KEY: process.env.REACT_APP_ZILLOW_API_KEY, // Real Estate Data
  CRUNCHBASE_API_KEY: process.env.REACT_APP_CRUNCHBASE_API_KEY, // Business Data
  LINKEDIN_API_KEY: process.env.REACT_APP_LINKEDIN_API_KEY, // Professional Network Integration
  TWITTER_API_KEY: process.env.REACT_APP_TWITTER_API_KEY, // Social Media Integration
  FACEBOOK_GRAPH_API_KEY: process.env.REACT_APP_FACEBOOK_GRAPH_API_KEY,
  INSTAGRAM_GRAPH_API_KEY: process.env.REACT_APP_INSTAGRAM_GRAPH_API_KEY,
  TIKTOK_API_KEY: process.env.REACT_APP_TIKTOK_API_KEY,
  PINTEREST_API_KEY: process.env.REACT_APP_PINTEREST_API_KEY,
  SNAPCHAT_API_KEY: process.env.REACT_APP_SNAPCHAT_API_KEY,
  YOUTUBE_API_KEY: process.env.REACT_APP_YOUTUBE_API_KEY, // Video Content Integration
  VIMEO_API_KEY: process.env.REACT_APP_VIMEO_API_KEY,
  WISTIA_API_KEY: process.env.REACT_APP_WISTIA_API_KEY,
  DAILY_CO_API_KEY: process.env.REACT_APP_DAILY_CO_API_KEY, // Video Conferencing
  AGORA_IO_APP_ID: process.env.REACT_APP_AGORA_IO_APP_ID,
  JITSI_MEET_API_KEY: process.env.REACT_APP_JITSI_MEET_API_KEY,
};

// --- Dummy UI Components (for demonstrating structure) ---
const Heading = ({ level, children }) => {
  const Tag = level || 'h1';
  return <Tag style={{ margin: '1rem 0', color: '#333' }}>{children}</Tag>;
};

const Button = ({ children, onClick, variant = 'primary', ...props }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      backgroundColor: variant === 'primary' ? '#007bff' : '#6c757d',
      color: 'white',
      margin: '0.5rem',
      ...props.style,
    }}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ label, type = 'text', value, onChange, ...props }) => (
  <div style={{ marginBottom: '1rem' }}>
    {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, ...props }) => (
  <div style={{ marginBottom: '1rem' }}>
    {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>}
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const Textarea = ({ label, value, onChange, rows = 5, ...props }) => (
  <div style={{ marginBottom: '1rem' }}>
    {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
      }}
      {...props}
    />
  </div>
);

const Card = ({ children, title, footer, style }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      ...style,
    }}
  >
    {title && <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#007bff' }}>{title}</h3>}
    {children}
    {footer && <div style={{ paddingTop: '1rem', borderTop: '1px solid #eee', marginTop: '1rem' }}>{footer}</div>}
  </div>
);

const Alert = ({ message, type = 'info' }) => {
  let backgroundColor = '#e7f3ff';
  let color = '#0056b3';
  if (type === 'error') {
    backgroundColor = '#f8d7da';
    color = '#721c24';
  } else if (type === 'success') {
    backgroundColor = '#d4edda';
    color = '#155724';
  }
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '4px',
        backgroundColor,
        color,
        marginBottom: '1rem',
        border: `1px solid ${color}`,
      }}
    >
      {message}
    </div>
  );
};


// --- Authentication Context & Hook ---
const AuthContext = createContext(null);

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate authentication check
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, validate token with backend
      setIsAuthenticated(true);
      setUser({ id: 'user123', name: 'John Doe', email: 'john.doe@example.com', role: 'admin' });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'demo@example.com' && password === 'password') {
          localStorage.setItem('authToken', 'mock-jwt-token');
          setIsAuthenticated(true);
          setUser({ id: 'user123', name: 'John Doe', email: 'john.doe@example.com', role: 'admin' });
          resolve({ success: true, message: 'Login successful' });
        } else {
          resolve({ success: false, message: 'Invalid credentials' });
        }
        setLoading(false);
      }, 1000);
    });
  };

  const register = async (name, email, password) => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would create a user in a backend DB
        localStorage.setItem('authToken', 'mock-new-user-jwt-token');
        setIsAuthenticated(true);
        setUser({ id: 'newuser', name, email, role: 'user' });
        resolve({ success: true, message: 'Registration successful' });
        setLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Core Services (Conceptual Implementations) ---

// Gemini AI Service
const geminiService = {
  apiKey: API_CONFIG.GOOGLE_GEMINI_API_KEY,
  async chat(prompt, history = []) {
    if (!this.apiKey) {
      console.error('Gemini API Key not configured.');
      return { error: 'Gemini API Key is missing.' };
    }
    console.log(`[Gemini Service] Sending prompt: "${prompt}" with history:`, history);
    // Simulate API call to Gemini
    return new Promise((resolve) => {
      setTimeout(() => {
        const response = `AI Response to "${prompt}" (powered by Gemini).`;
        resolve({ success: true, text: response });
      }, 1500);
    });
  },
  async generateContent(topic) {
    if (!this.apiKey) {
      console.error('Gemini API Key not configured.');
      return { error: 'Gemini API Key is missing.' };
    }
    console.log(`[Gemini Service] Generating content for topic: "${topic}"`);
    // Simulate API call to Gemini
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = `Here's some expertly crafted content about "${topic}" generated by advanced AI:
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
        resolve({ success: true, content });
      }, 2000);
    });
  }
};

// Payment Service (Stripe)
const paymentService = {
  publicKey: API_CONFIG.STRIPE_PUBLIC_KEY,
  async processPayment(amount, currency, cardDetails) {
    if (!this.publicKey) {
      console.error('Stripe Public Key not configured.');
      return { error: 'Stripe Public Key is missing.' };
    }
    console.log(`[Payment Service] Processing payment of ${amount} ${currency} using Stripe Public Key: ${this.publicKey}`);
    // Simulate Stripe API call (tokenization, then backend charge)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (cardDetails && cardDetails.cardNumber && cardDetails.cardNumber.startsWith('4')) { // Simple mock validation
          resolve({ success: true, transactionId: `txn_${Date.now()}`, amount, currency });
        } else {
          resolve({ success: false, message: 'Payment failed (mock error: invalid card).' });
        }
      }, 2000);
    });
  },
  async subscribe(planId, customerId) {
    if (!this.publicKey) {
      console.error('Stripe Public Key not configured.');
      return { error: 'Stripe Public Key is missing.' };
    }
    console.log(`[Payment Service] Subscribing customer ${customerId} to plan ${planId}`);
    // Simulate backend call to Stripe Subscriptions
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, subscriptionId: `sub_${Date.now()}`, planId });
      }, 1500);
    });
  }
};

// Notification Service (Twilio/SendGrid)
const notificationService = {
  sendgridApiKey: API_CONFIG.SENDGRID_API_KEY,
  twilioAccountSid: API_CONFIG.TWILIO_ACCOUNT_SID,
  twilioAuthToken: API_CONFIG.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: API_CONFIG.TWILIO_PHONE_NUMBER,

  async sendEmail(to, subject, body) {
    if (!this.sendgridApiKey) {
      console.error('SendGrid API Key not configured.');
      return { error: 'SendGrid API Key is missing.' };
    }
    console.log(`[Notification Service] Sending email to ${to} with subject "${subject}" using SendGrid API Key: ${this.sendgridApiKey}`);
    // Simulate SendGrid API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Email sent successfully.' });
      }, 1000);
    });
  },

  async sendSms(to, message) {
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      console.error('Twilio credentials not fully configured.');
      return { error: 'Twilio credentials missing.' };
    }
    console.log(`[Notification Service] Sending SMS to ${to} from ${this.twilioPhoneNumber} with message "${message}" using Twilio Account SID: ${this.twilioAccountSid}`);
    // Simulate Twilio API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'SMS sent successfully.' });
      }, 1000);
    });
  }
};

// Cloud Storage Service (AWS S3)
const storageService = {
  s3BucketName: API_CONFIG.AWS_S3_BUCKET_NAME,
  s3Region: API_CONFIG.AWS_S3_REGION,
  s3AccessKeyId: API_CONFIG.AWS_S3_ACCESS_KEY_ID,
  s3SecretAccessKey: API_CONFIG.AWS_S3_SECRET_ACCESS_KEY,

  async uploadFile(file, folder = 'uploads') {
    if (!this.s3BucketName || !this.s3AccessKeyId) {
      console.error('S3 credentials not fully configured.');
      return { error: 'S3 credentials missing.' };
    }
    console.log(`[Storage Service] Uploading file "${file.name}" to S3 bucket "${this.s3BucketName}" in folder "${folder}"`);
    // Simulate AWS S3 upload (e.g., via pre-signed URL generated by backend)
    return new Promise((resolve) => {
      setTimeout(() => {
        const fileUrl = `https://${this.s3BucketName}.s3.${this.s3Region}.amazonaws.com/${folder}/${file.name}`;
        resolve({ success: true, fileUrl, fileName: file.name });
      }, 2000);
    });
  },
  async getFileUrl(fileName, folder = 'uploads') {
    if (!this.s3BucketName) {
      console.error('S3 bucket name not configured.');
      return { error: 'S3 bucket name missing.' };
    }
    console.log(`[Storage Service] Getting URL for file "${fileName}" from S3 bucket "${this.s3BucketName}"`);
    return `https://${this.s3BucketName}.s3.${this.s3Region}.amazonaws.com/${folder}/${fileName}`;
  }
};

// CRM Integration (HubSpot)
const crmService = {
  hubspotApiKey: API_CONFIG.HUBSPOT_API_KEY,
  async createContact(contactData) {
    if (!this.hubspotApiKey) {
      console.error('HubSpot API Key not configured.');
      return { error: 'HubSpot API Key is missing.' };
    }
    console.log(`[CRM Service] Creating HubSpot contact:`, contactData);
    // Simulate HubSpot API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, contactId: `hubspot_contact_${Date.now()}`, contactData });
      }, 1200);
    });
  }
};

// Analytics Service (Google Analytics 4)
const analyticsService = {
  ga4MeasurementId: API_CONFIG.GA4_MEASUREMENT_ID,
  async trackEvent(eventName, eventParams = {}) {
    if (!this.ga4MeasurementId) {
      console.error('GA4 Measurement ID not configured.');
      return { error: 'GA4 Measurement ID is missing.' };
    }
    console.log(`[Analytics Service] Tracking GA4 event: ${eventName}`, eventParams);
    // In a real app, use gtag('event', ...) or React GA library
    return Promise.resolve({ success: true });
  },
  async trackPageView(path) {
    if (!this.ga4MeasurementId) {
      console.error('GA4 Measurement ID not configured.');
      return { error: 'GA4 Measurement ID is missing.' };
    }
    console.log(`[Analytics Service] Tracking GA4 page view: ${path}`);
    return Promise.resolve({ success: true });
  }
};

// Error Logging Service (Sentry)
const errorLoggingService = {
  sentryDsn: API_CONFIG.SENTRY_DSN,
  init() {
    if (this.sentryDsn) {
      // In a real app, initialize Sentry SDK
      console.log(`[Error Logging Service] Sentry initialized with DSN: ${this.sentryDsn}`);
    } else {
      console.warn('Sentry DSN not configured. Error logging disabled.');
    }
  },
  captureException(error, context = {}) {
    if (this.sentryDsn) {
      console.error(`[Error Logging Service] Capturing exception:`, error, context);
      // In a real app, use Sentry.captureException(error, context)
    } else {
      console.error(`[Error Logging Service] Uncaught exception (Sentry not active):`, error, context);
    }
  },
  captureMessage(message, level = 'info', context = {}) {
    if (this.sentryDsn) {
      console.log(`[Error Logging Service] Capturing message (${level}):`, message, context);
      // In a real app, use Sentry.captureMessage(message, level, context)
    } else {
      console.log(`[Error Logging Service] Log message (Sentry not active - ${level}):`, message, context);
    }
  }
};

// Initialize Sentry on app start (conceptual)
errorLoggingService.init();


// --- Layout Components ---

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
    }}>
      <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ textDecoration: 'none', color: '#007bff', fontSize: '1.5rem', fontWeight: 'bold' }}>
        AI-Powered Platform
      </Link>
      <nav>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '1rem' }}>Welcome, {user?.name || 'User'}!</span>
            <Button onClick={handleLogout} variant="secondary">Logout</Button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ textDecoration: 'none', marginRight: '1rem' }}><Button>Login</Button></Link>
            <Link to="/register" style={{ textDecoration: 'none' }}><Button variant="secondary">Register</Button></Link>
          </div>
        )}
      </nav>
    </header>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/profile", icon: "👤", label: "Profile" },
    { path: "/ai-assistant", icon: "🧠", label: "AI Assistant" },
    { path: "/onboarding-workflows", icon: "🚀", label: "Onboarding Flows" },
    { path: "/integrations", icon: "🔌", label: "Integrations" },
    { path: "/analytics", icon: "📈", label: "Analytics" },
    { path: "/billing", icon: "💳", label: "Billing" },
    { path: "/settings", icon: "⚙️", label: "Settings" },
    { path: "/admin", icon: "👑", label: "Admin" },
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#343a40',
      color: '#ffffff',
      padding: '2rem 0',
      height: 'calc(100vh - 70px)', // Adjust for header height
      overflowY: 'auto',
    }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 2rem',
                textDecoration: 'none',
                color: '#adb5bd',
                transition: 'background-color 0.2s',
              }}
              activeStyle={{
                backgroundColor: '#007bff',
                color: 'white',
              }}
            >
              <span style={{ marginRight: '1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f4f7f6' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const AuthLayout = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
    }}>
      <Card style={{ minWidth: '400px', maxWidth: '90%' }}>
        {children}
      </Card>
    </div>
  );
};

// --- Page Components (Enhanced from original) ---

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <Heading level="h1">Welcome to the Ultimate AI-Powered User Lifecycle Management Platform</Heading>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>
        Revolutionize your user engagement with intelligent onboarding, personalized experiences, and powerful analytics.
      </p>
      <div style={{ marginTop: '2rem' }}>
        {isAuthenticated ? (
          <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
        ) : (
          <>
            <Link to="/register"><Button>Get Started - Free Trial</Button></Link>
            <Link to="/login"><Button variant="secondary">Already have an account? Login</Button></Link>
          </>
        )}
      </div>
      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <Card title="Intelligent Onboarding">
          <p>AI-driven personalized onboarding flows to maximize activation.</p>
        </Card>
        <Card title="Smart Engagement">
          <p>Automated, AI-optimized communication across multiple channels.</p>
        </Card>
        <Card title="Predictive Analytics">
          <p>Understand user behavior, predict churn, and optimize for growth.</p>
        </Card>
        <Card title="Seamless Integrations">
          <p>Connect with hundreds of services for a unified ecosystem.</p>
        </Card>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const { from } = location.state || { from: { pathname: "/dashboard" } };
      history.replace(from);
    }
  }, [isAuthenticated, history, location.state]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = await login(email, password);
    if (result.success) {
      setSuccess(result.message);
      // Redirect handled by useEffect
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <Heading level="h2">Login to Your Account</Heading>
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}
      <form onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, loading, isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const { from } = location.state || { from: { pathname: "/dashboard" } };
      history.replace(from);
    }
  }, [isAuthenticated, history, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = await register(name, email, password);
    if (result.success) {
      setSuccess(result.message);
      // Redirect handled by useEffect
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <Heading level="h2">Create Your Account</Heading>
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}
      <form onSubmit={handleSubmit}>
        <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('Loading personalized insights...');

  useEffect(() => {
    // Simulate fetching personalized data / AI insights
    const fetchInsights = async () => {
      // Example of using Gemini for a personalized greeting or summary
      const result = await geminiService.chat(`Generate a short, engaging dashboard welcome message for a user named ${user.name} for an advanced user lifecycle management platform. Also, suggest one key action they should take today.`);
      if (result.success) {
        setWelcomeMessage(result.text);
      } else {
        setWelcomeMessage('Welcome to your Dashboard! Explore your user data and tools.');
        errorLoggingService.captureException(new Error("Failed to get Gemini welcome message"), { user: user.id });
      }

      // Track page view
      analyticsService.trackPageView('/dashboard');
    };
    fetchInsights();
  }, [user]);


  return (
    <div>
      <Heading level="h1">Dashboard</Heading>
      <Alert type="info" message={welcomeMessage} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <Card title="Quick Stats">
          <p><strong>Active Users:</strong> 1,234</p>
          <p><strong>New Users Today:</strong> 45</p>
          <p><strong>Conversion Rate:</strong> 12.3%</p>
        </Card>
        <Card title="Latest User Activity">
          <ul>
            <li>User Jane Doe completed onboarding.</li>
            <li>User Mark Smith viewed pricing page.</li>
            <li>User Emily White updated profile.</li>
          </ul>
        </Card>
        <Card title="Actionable Insights" footer={<Button onClick={() => analyticsService.trackEvent('view_full_analytics')}>View Full Analytics</Button>}>
          <p><strong>Churn Risk Alert:</strong> 15% of users in cohort A show early signs of churn.</p>
          <p><strong>Engagement Opportunity:</strong> Users who complete the 'Advanced Features' tutorial have 2x retention.</p>
        </Card>
        <Card title="Integrations Status">
          <p>Stripe: Connected</p>
          <p>SendGrid: Connected</p>
          <p>HubSpot: Connected</p>
          <Link to="/integrations"><Button variant="secondary">Manage Integrations</Button></Link>
        </Card>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', avatarUrl: '' });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user && !authLoading) {
      setProfile({
        name: user.name,
        email: user.email,
        bio: 'A passionate user of the AI-powered platform.',
        avatarUrl: storageService.getFileUrl('default_avatar.png'), // Example static URL or from user object
      });
      analyticsService.trackPageView('/profile');
    }
  }, [user, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      setMessage({ type: 'info', text: 'Uploading avatar...' });
      try {
        const uploadResult = await storageService.uploadFile(file, `avatars/${user.id}`);
        if (uploadResult.success) {
          setProfile((prev) => ({ ...prev, avatarUrl: uploadResult.fileUrl }));
          setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
          analyticsService.trackEvent('user_avatar_updated');
        } else {
          setMessage({ type: 'error', text: uploadResult.error || 'Failed to upload avatar.' });
          errorLoggingService.captureMessage('Avatar upload failed', 'warning', { userId: user.id, error: uploadResult.error });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'An error occurred during upload.' });
        errorLoggingService.captureException(error, { userId: user.id, action: 'avatar_upload' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Saving profile...' });
    try {
      // Simulate API call to update user profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real app, integrate with a backend API that updates user data
      // For this demo, just update local state conceptually
      // setUser(prev => ({ ...prev, name: profile.name, email: profile.email })); // If AuthContext had update method
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      analyticsService.trackEvent('user_profile_updated');
      crmService.createContact({ email: profile.email, name: profile.name, lastActivity: 'Profile Update' }); // Update CRM
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save profile.' });
      errorLoggingService.captureException(error, { userId: user.id, action: 'profile_save' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <p>Loading user profile...</p>;
  }

  return (
    <div>
      <Heading level="h1">User Profile: {user.name}</Heading>
      {message.text && <Alert type={message.type} message={message.text} />}

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <img src={profile.avatarUrl} alt="User Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginRight: '1.5rem' }} />
          <div>
            <Input
              type="file"
              label="Change Avatar"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: 'none' }}
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload">
              <Button as="span" variant="secondary" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload New Avatar'}
              </Button>
            </label>
          </div>
        </div>

        {!editMode ? (
          <div>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
            <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
            <Button variant="secondary" style={{ marginLeft: '1rem' }}>Change Password</Button>
          </div>
        ) : (
          <div>
            <Input label="Name" name="name" value={profile.name} onChange={handleInputChange} />
            <Input label="Email" name="email" type="email" value={profile.email} onChange={handleInputChange} disabled /> {/* Email often not editable directly */}
            <Textarea label="Bio" name="bio" value={profile.bio} onChange={handleInputChange} />
            <Button onClick={handleSaveProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            <Button variant="secondary" onClick={() => setEditMode(false)} disabled={loading} style={{ marginLeft: '1rem' }}>Cancel</Button>
          </div>
        )}
      </Card>

      <Card title="Account Security">
        <p>Two-Factor Authentication: <span style={{ color: 'green', fontWeight: 'bold' }}>Enabled</span></p>
        <p>Last Login: 2023-10-27 10:30 AM from London, UK</p>
        <Button variant="secondary">View Activity Log</Button>
      </Card>
    </div>
  );
};

const GeminiAssistantPage = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentTopic, setContentTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    analyticsService.trackPageView('/ai-assistant');
  }, []);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError('');
    setLoading(true);
    const newChatHistory = [...chatHistory, { role: 'user', text: prompt }];
    setChatHistory(newChatHistory);
    setPrompt('');

    try {
      const result = await geminiService.chat(prompt, newChatHistory);
      if (result.success) {
        setResponse(result.text);
        setChatHistory([...newChatHistory, { role: 'ai', text: result.text }]);
        analyticsService.trackEvent('gemini_chat_interaction', { prompt: prompt.substring(0, 50) });
      } else {
        setError(result.error || 'Failed to get response from AI.');
        errorLoggingService.captureMessage('Gemini chat failed', 'error', { prompt: prompt, error: result.error });
      }
    } catch (err) {
      setError('An unexpected error occurred with the AI assistant.');
      errorLoggingService.captureException(err, { prompt: prompt, feature: 'gemini_chat' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async (e) => {
    e.preventDefault();
    if (!contentTopic.trim()) return;

    setError('');
    setContentLoading(true);
    setGeneratedContent('');

    try {
      const result = await geminiService.generateContent(contentTopic);
      if (result.success) {
        setGeneratedContent(result.content);
        analyticsService.trackEvent('gemini_content_generation', { topic: contentTopic.substring(0, 50) });
        notificationService.sendEmail('admin@example.com', 'Content Generated', `New content generated for topic: ${contentTopic}`);
      } else {
        setError(result.error || 'Failed to generate content.');
        errorLoggingService.captureMessage('Gemini content generation failed', 'error', { topic: contentTopic, error: result.error });
      }
    } catch (err) {
      setError('An unexpected error occurred during content generation.');
      errorLoggingService.captureException(err, { topic: contentTopic, feature: 'gemini_content_gen' });
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div>
      <Heading level="h1">AI Assistant - Powered by Gemini</Heading>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>Leverage cutting-edge AI for support, content creation, and insights.</p>
      {error && <Alert type="error" message={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <Card title="AI Chatbot" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', padding: '1rem', marginBottom: '1rem', minHeight: '300px' }}>
            {chatHistory.length === 0 && <p style={{ color: '#888' }}>Start a conversation with your AI assistant.</p>}
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ marginBottom: '0.75rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    borderRadius: '15px',
                    backgroundColor: msg.role === 'user' ? '#007bff' : '#f0f0f0',
                    color: msg.role === 'user' ? 'white' : '#333',
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <p style={{ color: '#888' }}>AI is thinking...</p>}
          </div>
          <form onSubmit={handleChatSubmit} style={{ display: 'flex' }}>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask the AI anything..."
              style={{ flexGrow: 1, marginRight: '0.5rem' }}
              label=""
            />
            <Button type="submit" disabled={loading}>Send</Button>
          </form>
        </Card>

        <Card title="AI Content Generator" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <form onSubmit={handleGenerateContent} style={{ marginBottom: '1rem' }}>
            <Input
              label="Content Topic"
              value={contentTopic}
              onChange={(e) => setContentTopic(e.target.value)}
              placeholder="e.g., 'Blog post about user retention strategies'"
            />
            <Button type="submit" disabled={contentLoading} style={{ width: '100%' }}>
              {contentLoading ? 'Generating...' : 'Generate Content'}
            </Button>
          </form>
          {generatedContent && (
            <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '1rem', backgroundColor: '#f9f9f9', flexGrow: 1, overflowY: 'auto' }}>
              <Heading level="h4">Generated Content Preview:</Heading>
              <Textarea value={generatedContent} readOnly rows={15} />
              <Button style={{ marginTop: '1rem' }} onClick={() => navigator.clipboard.writeText(generatedContent)}>Copy Content</Button>
            </div>
          )}
          {contentLoading && <p style={{ color: '#888', textAlign: 'center' }}>Generating content, please wait...</p>}
        </Card>
      </div>
    </div>
  );
};

const IntegrationsPage = () => {
  const integrationStatus = {
    Stripe: { connected: true, envVar: API_CONFIG.STRIPE_PUBLIC_KEY ? "Configured" : "Not Configured" },
    SendGrid: { connected: true, envVar: API_CONFIG.SENDGRID_API_KEY ? "Configured" : "Not Configured" },
    Twilio: { connected: true, envVar: API_CONFIG.TWILIO_ACCOUNT_SID ? "Configured" : "Not Configured" },
    'AWS S3': { connected: true, envVar: API_CONFIG.AWS_S3_BUCKET_NAME ? "Configured" : "Not Configured" },
    HubSpot: { connected: true, envVar: API_CONFIG.HUBSPOT_API_KEY ? "Configured" : "Not Configured" },
    'Google Analytics 4': { connected: true, envVar: API_CONFIG.GA4_MEASUREMENT_ID ? "Configured" : "Not Configured" },
    Sentry: { connected: true, envVar: API_CONFIG.SENTRY_DSN ? "Configured" : "Not Configured" },
    Auth0: { connected: false, envVar: API_CONFIG.AUTH0_DOMAIN ? "Configured" : "Not Configured" },
    'Google Gemini': { connected: true, envVar: API_CONFIG.GOOGLE_GEMINI_API_KEY ? "Configured" : "Not Configured" },
    OpenAI: { connected: false, envVar: API_CONFIG.OPENAI_API_KEY ? "Configured" : "Not Configured" },
    Mailchimp: { connected: false, envVar: API_CONFIG.MAILCHIMP_API_KEY ? "Configured" : "Not Configured" },
    Contentful: { connected: false, envVar: API_CONFIG.CONTENTFUL_SPACE_ID ? "Configured" : "Not Configured" },
    Intercom: { connected: false, envVar: API_CONFIG.INTERCOM_APP_ID ? "Configured" : "Not Configured" },
    Algolia: { connected: false, envVar: API_CONFIG.ALGOLIA_APP_ID ? "Configured" : "Not Configured" },
    LaunchDarkly: { connected: false, envVar: API_CONFIG.LAUNCHDARKLY_CLIENT_SIDE_ID ? "Configured" : "Not Configured" },
    'Google Maps': { connected: false, envVar: API_CONFIG.GOOGLE_MAPS_API_KEY ? "Configured" : "Not Configured" },
    Pinecone: { connected: false, envVar: API_CONFIG.PINECONE_API_KEY ? "Configured" : "Not Configured" },
    Plaid: { connected: false, envVar: API_CONFIG.PLAID_CLIENT_ID ? "Configured" : "Not Configured" },
    Zuora: { connected: false, envVar: API_CONFIG.ZUORA_TENANT_ID ? "Configured" : "Not Configured" },
    Zendesk: { connected: false, envVar: API_CONFIG.ZENDESK_SUBDOMAIN ? "Configured" : "Not Configured" },
    Salesforce: { connected: false, envVar: API_CONFIG.SALESFORCE_CLIENT_ID ? "Configured" : "Not Configured" },
    Hotjar: { connected: false, envVar: API_CONFIG.HOTJAR_SITE_ID ? "Configured" : "Not Configured" },
    Slack: { connected: false, envVar: API_CONFIG.SLACK_WEBHOOK_URL ? "Configured" : "Not Configured" },
    Calendly: { connected: false, envVar: API_CONFIG.CALENDLY_API_KEY ? "Configured" : "Not Configured" },
    Typeform: { connected: false, envVar: API_CONFIG.TYPEFORM_API_KEY ? "Configured" : "Not Configured" },
    YouTube: { connected: false, envVar: API_CONFIG.YOUTUBE_API_KEY ? "Configured" : "Not Configured" },
    DocuSign: { connected: false, envVar: API_CONFIG.DOCUSIGN_CLIENT_ID ? "Configured" : "Not Configured" },
    GitHub: { connected: false, envVar: API_CONFIG.GITHUB_API_TOKEN ? "Configured" : "Not Configured" },
  };

  const handleConnectIntegration = (serviceName) => {
    alert(`Attempting to connect to ${serviceName}. In a real app, this would initiate an OAuth flow or ask for API keys.`);
    analyticsService.trackEvent('integration_connect_attempt', { service: serviceName });
  };

  useEffect(() => {
    analyticsService.trackPageView('/integrations');
  }, []);

  return (
    <div>
      <Heading level="h1">Integrations & Connectors</Heading>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Extend the power of your platform by seamlessly connecting with your favorite tools.
        Over 100 popular services available for deeper insights and automation.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {Object.entries(integrationStatus).map(([service, status]) => (
          <Card key={service} title={service}>
            <p>Status: <strong style={{ color: status.connected ? 'green' : 'orange' }}>{status.connected ? 'Connected' : 'Not Connected'}</strong></p>
            <p>Environment Variable: <span style={{ color: status.envVar === "Configured" ? 'green' : 'red' }}>{status.envVar}</span></p>
            <Button
              onClick={() => handleConnectIntegration(service)}
              disabled={status.connected || status.envVar !== "Configured"}
              variant={status.connected ? 'secondary' : 'primary'}
            >
              {status.connected ? 'Manage' : (status.envVar === "Configured" ? 'Connect Now' : 'Configure ENV')}
            </Button>
            {status.envVar !== "Configured" && (
              <p style={{ fontSize: '0.85rem', color: '#dc3545', marginTop: '0.5rem' }}>
                <em>Missing required environment variable for {service}.</em>
              </p>
            )}
          </Card>
        ))}
        <Card title="More Integrations Coming Soon!">
          <p>We're continuously expanding our library of integrations to help you grow.</p>
          <Button onClick={() => notificationService.sendEmail('feedback@example.com', 'Integration Request', 'I request a new integration.')}>Request New Integration</Button>
        </Card>
      </div>
    </div>
  );
};

const BillingPage = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState('Free Trial');
  const [nextBillDate, setNextBillDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useAuth();

  useEffect(() => {
    // Simulate fetching billing info
    setLoading(true);
    setTimeout(() => {
      setSubscriptionStatus('Pro Plan');
      setNextBillDate('2024-01-15');
      setLoading(false);
      analyticsService.trackPageView('/billing');
    }, 1000);
  }, []);

  const handleUpgradePlan = async (planId) => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Processing upgrade...' });
    try {
      const result = await paymentService.subscribe(planId, user.id);
      if (result.success) {
        setSubscriptionStatus(planId === 'pro_monthly' ? 'Pro Plan' : 'Enterprise Plan');
        setNextBillDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setMessage({ type: 'success', text: `Successfully upgraded to ${planId.replace('_', ' ')}!` });
        analyticsService.trackEvent('subscription_upgrade', { plan: planId });
        notificationService.sendEmail(user.email, 'Subscription Upgrade', `Your plan has been upgraded to ${planId}`);
        crmService.createContact({ email: user.email, name: user.name, plan: planId }); // Update CRM
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to upgrade plan.' });
        errorLoggingService.captureMessage('Subscription upgrade failed', 'error', { userId: user.id, planId, error: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      errorLoggingService.captureException(error, { userId: user.id, action: 'upgrade_plan' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Heading level="h1">Billing & Subscriptions</Heading>
      {message.text && <Alert type={message.type} message={message.text} />}
      <Card title="Current Plan Details">
        {loading ? (
          <p>Loading billing information...</p>
        ) : (
          <>
            <p><strong>Current Plan:</strong> {subscriptionStatus}</p>
            <p><strong>Next Billing Date:</strong> {nextBillDate}</p>
            <p><strong>Payment Method:</strong> Visa **** 1234</p>
            <div style={{ marginTop: '1rem' }}>
              <Button>Update Payment Method</Button>
              <Button variant="secondary" style={{ marginLeft: '1rem' }}>View Invoices</Button>
            </div>
          </>
        )}
      </Card>

      <Heading level="h2">Upgrade Your Plan</Heading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <Card title="Basic Plan" footer={<Button onClick={() => handleUpgradePlan('basic_monthly')} disabled={loading}>Current Plan</Button>}>
          <p><strong>$19/month</strong></p>
          <ul>
            <li>Basic AI Features</li>
            <li>5000 Active Users</li>
            <li>Standard Support</li>
          </ul>
        </p>
        </Card>
        <Card title="Pro Plan" footer={<Button onClick={() => handleUpgradePlan('pro_monthly')} disabled={loading}>Upgrade to Pro</Button>}>
          <p><strong>$99/month</strong></p>
          <ul>
            <li>Advanced AI Features</li>
            <li>Unlimited Active Users</li>
            <li>Priority Support</li>
            <li>Custom Integrations</li>
          </ul>
        </p>
        </Card>
        <Card title="Enterprise Plan" footer={<Button onClick={() => alert('Contact sales for Enterprise plan')} disabled={loading}>Contact Sales</Button>}>
          <p><strong>Custom Pricing</strong></p>
          <ul>
            <li>Dedicated Account Manager</li>
            <li>On-Premise Deployment Options</li>
            <li>SLA & Compliance</li>
            <li>Full Customization</li>
          </ul>
        </p>
        </Card>
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const [selectedReport, setSelectedReport] = useState('user_engagement');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const reportOptions = [
    { value: 'user_engagement', label: 'User Engagement' },
    { value: 'onboarding_funnel', label: 'Onboarding Funnel' },
    { value: 'churn_prediction', label: 'Churn Prediction' },
    { value: 'conversion_rates', label: 'Conversion Rates' },
    { value: 'feature_adoption', label: 'Feature Adoption' },
    { value: 'ai_impact', label: 'AI Impact Analysis' },
  ];

  const fetchReportData = useCallback(async (reportType) => {
    setLoading(true);
    setReportData(null);
    try {
      // Simulate fetching complex analytics data from a backend service (e.g., connected to BigQuery/Snowflake)
      await new Promise(resolve => setTimeout(resolve, 1500));
      let data = {};
      switch (reportType) {
        case 'user_engagement':
          data = {
            title: "User Engagement Overview",
            metrics: {
              DAU: 789,
              WAU: 3200,
              MAU: 9800,
              avgSessionDuration: '15 min',
              bounceRate: '35%',
            },
            chart: "Line chart showing daily active users over time."
          };
          break;
        case 'onboarding_funnel':
          data = {
            title: "Onboarding Funnel Performance",
            steps: [
              { name: "Signed Up", count: 1000 },
              { name: "Email Verified", count: 950 },
              { name: "Profile Completed", count: 800 },
              { name: "First Action Taken", count: 700 },
              { name: "Onboarding Complete", count: 650 },
            ],
            chart: "Funnel visualization of user progression."
          };
          break;
        case 'churn_prediction':
          // Integrate with AI for predictive analytics
          const aiPrediction = await geminiService.chat(`Generate a brief summary of churn prediction for a user. Identify top 3 factors for churn risks and suggest 1 mitigation strategy. User's role: ${user.role}`);
          data = {
            title: "Churn Prediction & Mitigation",
            riskScore: 'High (70%)',
            factors: ['Low Feature Usage', 'Declining Session Time', 'Unresponsive to Emails'],
            recommendation: aiPrediction.success ? aiPrediction.text : 'Engage users with personalized content based on their last activity.',
            chart: "Cohort analysis showing churn over time."
          };
          break;
        case 'ai_impact':
          data = {
            title: "AI Feature Impact Analysis",
            metrics: {
              'AI Chatbot Usage': '2,500 interactions/day',
              'Content Generation Usage': '500 documents/day',
              'AI-Driven Feature Adoption Increase': '20%',
              'User Satisfaction (AI)': '4.5/5',
            },
            chart: "Bar chart comparing user retention with and without AI feature usage."
          };
          break;
        default:
          data = { message: "Select a report to view data." };
      }
      setReportData(data);
      analyticsService.trackEvent('analytics_report_viewed', { report: reportType });
    } catch (error) {
      setReportData({ error: "Failed to load report data." });
      errorLoggingService.captureException(error, { reportType, feature: 'analytics' });
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    analyticsService.trackPageView('/analytics');
    fetchReportData(selectedReport);
  }, [selectedReport, fetchReportData]);

  return (
    <div>
      <Heading level="h1">Advanced Analytics & Insights</Heading>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Dive deep into your user data with AI-powered insights and customizable reports.
      </p>

      <Card>
        <Select
          label="Select Report"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          options={reportOptions}
        />
      </Card>

      <Card title={reportData?.title || "Report Data"}>
        {loading ? (
          <p>Loading report data...</p>
        ) : reportData?.error ? (
          <Alert type="error" message={reportData.error} />
        ) : (
          <div>
            {reportData?.message && <p>{reportData.message}</p>}
            {reportData?.metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(reportData.metrics).map(([key, value]) => (
                  <div key={key} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fdfdfd' }}>
                    <strong>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</strong> {value}
                  </div>
                ))}
              </div>
            )}
            {reportData?.steps && (
              <div style={{ marginBottom: '1.5rem' }}>
                <Heading level="h4">Onboarding Funnel</Heading>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {reportData.steps.map((step, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem', borderLeft: '3px solid #007bff', paddingLeft: '1rem' }}>
                      <strong>{step.name}:</strong> {step.count} users
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {reportData?.riskScore && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p><strong>Overall Churn Risk:</strong> <span style={{ color: reportData.riskScore.includes('High') ? 'red' : 'green', fontWeight: 'bold' }}>{reportData.riskScore}</span></p>
                <p><strong>Top Churn Factors:</strong> {reportData.factors.join(', ')}</p>
                <p><strong>AI Recommendation:</strong> {reportData.recommendation}</p>
              </div>
            )}
            {reportData?.chart && <div style={{ border: '1px dashed #ccc', padding: '2rem', textAlign: 'center', minHeight: '200px' }}>{reportData.chart} (Graphical representation would be here)</div>}
          </div>
        )}
      </Card>
      <Card footer={<Button onClick={() => analyticsService.trackEvent('export_report', { report: selectedReport })}>Export Report</Button>}>
        <Button variant="secondary" onClick={() => analyticsService.trackEvent('configure_custom_report')}>Configure Custom Report</Button>
      </Card>
    </div>
  );
};

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'AI-Powered Platform',
    timezone: 'America/New_York',
    emailNotifications: true,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    productUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Simulate fetching settings from API
    setTimeout(() => {
      // In a real app, populate with actual user settings
      analyticsService.trackPageView('/settings');
    }, 500);
  }, []);

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const saveSettings = async (type) => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Saving settings...' });
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: `${type} settings saved successfully!` });
      analyticsService.trackEvent('settings_saved', { category: type });
      notificationService.sendEmail('support@example.com', 'Settings Changed', `User updated ${type} settings.`);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save ${type} settings.` });
      errorLoggingService.captureException(error, { settingsType: type });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Heading level="h1">Platform Settings</Heading>
      {message.text && <Alert type={message.type} message={message.text} />}

      <Card title="General Settings">
        <Input
          label="App Name (read-only for demo)"
          name="appName"
          value={generalSettings.appName}
          onChange={handleGeneralChange}
          disabled
        />
        <Select
          label="Timezone"
          name="timezone"
          value={generalSettings.timezone}
          onChange={handleGeneralChange}
          options={[
            { value: 'America/New_York', label: 'Eastern Time (America/New_York)' },
            { value: 'Europe/London', label: 'London (Europe/London)' },
            { value: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo)' },
          ]}
        />
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
          <input
            type="checkbox"
            name="emailNotifications"
            checked={generalSettings.emailNotifications}
            onChange={handleGeneralChange}
            style={{ marginRight: '0.5rem' }}
          />
          Enable all email notifications
        </label>
        <Button onClick={() => saveSettings('general')} disabled={loading}>
          {loading ? 'Saving...' : 'Save General Settings'}
        </Button>
      </Card>

      <Card title="Notification Preferences">
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            name="productUpdates"
            checked={notificationSettings.productUpdates}
            onChange={handleNotificationChange}
            style={{ marginRight: '0.5rem' }}
          />
          Receive Product Updates
        </label>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            name="marketingEmails"
            checked={notificationSettings.marketingEmails}
            onChange={handleNotificationChange}
            style={{ marginRight: '0.5rem' }}
          />
          Receive Marketing & Promotional Emails
        </label>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            name="securityAlerts"
            checked={notificationSettings.securityAlerts}
            onChange={handleNotificationChange}
            style={{ marginRight: '0.5rem' }}
          />
          Receive Critical Security Alerts (Recommended)
        </label>
        <Button onClick={() => saveSettings('notification')} disabled={loading}>
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </Card>
      <Card title="Data Privacy">
        <p>Manage your data, consent, and GDPR compliance settings.</p>
        <Button onClick={() => analyticsService.trackEvent('data_export_requested')}>Request Data Export</Button>
        <Button variant="secondary" style={{ marginLeft: '1rem' }} onClick={() => analyticsService.trackEvent('account_deletion_initiated')}>Delete Account</Button>
      </Card>
    </div>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    analyticsService.trackPageView('/admin');
    if (user?.role !== 'admin') {
      setMessage({ type: 'error', text: 'Access Denied: You do not have administrator privileges.' });
      errorLoggingService.captureMessage('Unauthorized admin access attempt', 'warning', { userId: user?.id });
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      // Simulate API call to fetch users (backend-only for this sensitive data)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockUsers = [
        { id: 'user1', name: 'John Doe', email: 'john.doe@example.com', role: 'admin', status: 'active' },
        { id: 'user2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', status: 'active' },
        { id: 'user3', name: 'Alice Brown', email: 'alice.brown@example.com', role: 'user', status: 'inactive' },
        { id: 'user4', name: 'Bob White', email: 'bob.white@example.com', role: 'contributor', status: 'active' },
      ];
      setUsers(mockUsers);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch users.' });
      errorLoggingService.captureException(error, { feature: 'admin_user_management' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setMessage({ type: 'info', text: `Updating role for ${userId}...` });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: 'success', text: `Role for ${userId} updated to ${newRole}.` });
      analyticsService.trackEvent('admin_role_updated', { targetUserId: userId, newRole });
      notificationService.sendEmail('admin@example.com', 'User Role Changed', `Role for ${userId} changed to ${newRole}`);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user role.' });
      errorLoggingService.captureException(error, { userId, newRole });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) return;
    setMessage({ type: 'info', text: `Deleting user ${userId}...` });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(users.filter(u => u.id !== userId));
      setMessage({ type: 'success', text: `User ${userId} deleted.` });
      analyticsService.trackEvent('admin_user_deleted', { targetUserId: userId });
      notificationService.sendSms('+1234567890', `User ${userId} deleted by admin ${user.name}`);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user.' });
      errorLoggingService.captureException(error, { userId, action: 'delete_user' });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div>
        <Heading level="h1">Admin Panel</Heading>
        {message.text && <Alert type={message.type} message={message.text} />}
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  return (
    <div>
      <Heading level="h1">Admin Panel</Heading>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Manage platform users, roles, and system-wide configurations.
      </p>
      {message.text && <Alert type={message.type} message={message.text} />}

      <Card title="User Management">
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Select
            label="Filter by Role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
              { value: 'contributor', label: 'Contributor' },
            ]}
          />
          <Button onClick={fetchUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Refreshing...' : 'Refresh Users'}
          </Button>
        </div>

        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{u.id}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      options={[
                        { value: 'admin', label: 'Admin' },
                        { value: 'user', label: 'User' },
                        { value: 'contributor', label: 'Contributor' },
                      ]}
                      style={{ width: 'auto', padding: '0.25rem' }}
                      label=""
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <span style={{ color: u.status === 'active' ? 'green' : 'red' }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <Button onClick={() => handleDeleteUser(u.id)} variant="secondary" style={{ backgroundColor: '#dc3545', color: 'white', padding: '0.5rem 1rem' }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="System Health & Logs">
        <p>Monitor application performance, API usage, and access detailed logs.</p>
        <Button>View Logs (Sentry, Datadog)</Button>
        <Button variant="secondary" style={{ marginLeft: '1rem' }}>View API Usage</Button>
      </Card>
    </div>
  );
};


// Original component, now integrated into the larger app
function CreateOrFindUserOnboardingFlow() {
  const [flowType, setFlowType] = useState('create'); // 'create' or 'find'
  const [flowName, setFlowName] = useState('');
  const [flowId, setFlowId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const history = useHistory();

  useEffect(() => {
    analyticsService.trackPageView('/onboarding-workflows');
  }, []);

  const handleCreateFlow = async () => {
    if (!flowName.trim()) {
      setMessage({ type: 'error', text: 'Flow name cannot be empty.' });
      return;
    }
    setLoading(true);
    setMessage({ type: 'info', text: 'Creating onboarding flow...' });
    try {
      // Simulate API call to create a new flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newFlowId = `flow_${Date.now()}`;
      setMessage({ type: 'success', text: `Flow "${flowName}" created with ID: ${newFlowId}` });
      analyticsService.trackEvent('onboarding_flow_created', { flowName, flowId: newFlowId });
      history.push(`/onboarding-workflows/${newFlowId}`);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create onboarding flow.' });
      errorLoggingService.captureException(error, { action: 'create_onboarding_flow' });
    } finally {
      setLoading(false);
    }
  };

  const handleFindFlow = () => {
    if (!flowId.trim()) {
      setMessage({ type: 'error', text: 'Flow ID cannot be empty.' });
      return;
    }
    // Simulate checking if flow exists, then redirect
    // In a real app, you'd fetch flow details from backend
    setLoading(true);
    setMessage({ type: 'info', text: 'Finding onboarding flow...' });
    setTimeout(() => {
      if (flowId === 'flow_123' || flowId.startsWith('flow_')) { // Mock logic
        setMessage({ type: 'success', text: `Found flow with ID: ${flowId}` });
        analyticsService.trackEvent('onboarding_flow_found', { flowId });
        history.push(`/onboarding-workflows/${flowId}`);
      } else {
        setMessage({ type: 'error', text: 'Onboarding flow not found.' });
        errorLoggingService.captureMessage('Onboarding flow not found', 'warning', { flowId });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <Heading level="h1">Intelligent User Onboarding Flow Management</Heading>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Create dynamic, AI-optimized onboarding experiences or manage existing ones.
      </p>
      {message.text && <Alert type={message.type} message={message.text} />}

      <Card title="Manage Onboarding Flows">
        <div style={{ marginBottom: '1rem' }}>
          <Button
            onClick={() => setFlowType('create')}
            variant={flowType === 'create' ? 'primary' : 'secondary'}
            disabled={loading}
          >
            Create New Flow
          </Button>
          <Button
            onClick={() => setFlowType('find')}
            variant={flowType === 'find' ? 'primary' : 'secondary'}
            disabled={loading}
            style={{ marginLeft: '1rem' }}
          >
            Find Existing Flow
          </Button>
        </div>

        {flowType === 'create' ? (
          <div>
            <Input
              label="New Onboarding Flow Name"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="e.g., 'Premium User Onboarding'"
              disabled={loading}
            />
            <Button onClick={handleCreateFlow} disabled={loading}>
              {loading ? 'Creating...' : 'Create Flow'}
            </Button>
          </div>
        ) : (
          <div>
            <Input
              label="Onboarding Flow ID"
              value={flowId}
              onChange={(e) => setFlowId(e.target.value)}
              placeholder="e.g., 'flow_123'"
              disabled={loading}
            />
            <Button onClick={handleFindFlow} disabled={loading}>
              {loading ? 'Finding...' : 'Find Flow'}
            </Button>
          </div>
        )}
      </Card>

      <Card title="AI-Powered Onboarding Design">
        <p>Utilize Gemini AI to suggest personalized onboarding steps, content, and segmentation rules based on user profiles.</p>
        <Button onClick={() => geminiService.chat('Suggest AI-powered onboarding improvements for SaaS platform.')}>Get AI Suggestions</Button>
      </Card>

      <Card title="Onboarding Templates">
        <p>Access a library of pre-built templates for various industries and user types.</p>
        <Button variant="secondary">Browse Templates</Button>
      </Card>
    </div>
  );
}

function UserOnboardingEmbeddableFlowDemo() {
  const { id } = useParams(); // Using `useParams` for route parameters
  const [flowDetails, setFlowDetails] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const mockFlows = {
    'flow_123': {
      name: 'Default SaaS Onboarding',
      steps: [
        { id: 'welcome', title: 'Welcome to the Platform!', type: 'info', content: 'Let\'s get you set up and ready to go.' },
        { id: 'profile', title: 'Complete Your Profile', type: 'form', fields: [{ name: 'company', label: 'Company Name' }, { name: 'role', label: 'Your Role' }] },
        { id: 'integrate', title: 'Connect Your First Integration', type: 'action', content: 'Connect Stripe or HubSpot to get started with payment/CRM management.' },
        { id: 'tutorial', title: 'Interactive Tutorial', type: 'link', content: 'Watch our quick start video or explore key features.' },
        { id: 'finish', title: 'Onboarding Complete!', type: 'info', content: 'You are all set. Enjoy the platform!' },
      ]
    },
    'flow_new': {
      name: 'AI-Enhanced Developer Onboarding',
      steps: [
        { id: 'welcome_dev', title: 'Hello, Developer!', type: 'info', content: 'Welcome to the developer-centric platform. Let\'s optimize your workflow.' },
        { id: 'configure_api', title: 'Configure Your API Access', type: 'form', fields: [{ name: 'apiKey', label: 'Generate API Key' }, { name: 'webhookUrl', label: 'Webhook Endpoint (Optional)' }] },
        { id: 'ai_tooling', title: 'Explore AI Tooling', type: 'action', content: 'Discover AI code suggestions and deployment automations.' },
        { id: 'docs', title: 'Read API Documentation', type: 'link', content: 'Dive into our comprehensive API docs for seamless integration.' },
        { id: 'support', title: 'Get Developer Support', type: 'info', content: 'Our dedicated dev support team is here to help.' },
        { id: 'finish_dev', title: 'Onboarding Complete!', type: 'info', content: 'You\'re ready to build amazing things with AI!' },
      ]
    }
  };

  useEffect(() => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Loading onboarding flow...' });
    setTimeout(() => {
      const flow = mockFlows[id] || mockFlows['flow_123']; // Fallback to a default flow
      if (flow) {
        setFlowDetails(flow);
        analyticsService.trackPageView(`/onboarding-workflows/${id}`);
        analyticsService.trackEvent('onboarding_flow_started', { flowId: id, flowName: flow.name });
        setMessage({ type: 'success', text: `Loaded onboarding flow: "${flow.name}"` });
      } else {
        setMessage({ type: 'error', text: `Flow with ID "${id}" not found.` });
        errorLoggingService.captureMessage('Onboarding flow details not found', 'error', { flowId: id });
      }
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleNextStep = async () => {
    if (currentStep < flowDetails.steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      analyticsService.trackEvent('onboarding_step_completed', { flowId: id, step: flowDetails.steps[currentStep].id });

      // Simulate AI-driven personalization after a step
      if (flowDetails.steps[currentStep].id === 'profile') {
        const aiInsight = await geminiService.chat(`Based on a user completing their profile, suggest a personalized next action for onboarding flow "${flowDetails.name}".`);
        if (aiInsight.success) {
          setMessage({ type: 'info', text: `AI Suggestion for next step: ${aiInsight.text}` });
        }
      }

    } else {
      setMessage({ type: 'success', text: 'Onboarding complete! Redirecting to dashboard...' });
      analyticsService.trackEvent('onboarding_flow_completed', { flowId: id, flowName: flowDetails.name });
      notificationService.sendEmail('admin@example.com', 'User Completed Onboarding', `User completed flow ${flowDetails.name} (${id}).`);
      // In a real app, redirect to dashboard
      setTimeout(() => history.push('/dashboard'), 2000);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < flowDetails.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      analyticsService.trackEvent('onboarding_step_skipped', { flowId: id, step: flowDetails.steps[currentStep].id });
      setMessage({ type: 'info', text: 'Step skipped.' });
    }
  };

  if (loading || !flowDetails) {
    return (
      <div>
        <Heading level="h1">Loading Onboarding Flow...</Heading>
        {message.text && <Alert type={message.type} message={message.text} />}
        <p>Please wait while we prepare your personalized onboarding experience.</p>
      </div>
    );
  }

  const currentFlowStep = flowDetails.steps[currentStep];

  return (
    <div>
      <Heading level="h1">{flowDetails.name}</Heading>
      <Heading level="h2">Step {currentStep + 1} of {flowDetails.steps.length}: {currentFlowStep.title}</Heading>
      {message.text && <Alert type={message.type} message={message.text} />}

      <Card>
        {currentFlowStep.type === 'info' && (
          <p>{currentFlowStep.content}</p>
        )}
        {currentFlowStep.type === 'form' && (
          <form>
            {currentFlowStep.fields.map((field) => (
              <Input key={field.name} label={field.label} placeholder={`Enter ${field.label.toLowerCase()}`} />
            ))}
            <p style={{ fontSize: '0.9em', color: '#888', marginTop: '1rem' }}>
              <em>AI-powered intelligent field validation and autofill capabilities can be integrated here.</em>
            </p>
          </form>
        )}
        {currentFlowStep.type === 'action' && (
          <div>
            <p>{currentFlowStep.content}</p>
            <Button onClick={() => analyticsService.trackEvent('onboarding_action_taken', { action: currentFlowStep.id })}>
              Take Action
            </Button>
            <p style={{ fontSize: '0.9em', color: '#888', marginTop: '1rem' }}>
              <em>This action can trigger backend automations or launch external service UIs seamlessly.</em>
            </p>
          </div>
        )}
        {currentFlowStep.type === 'link' && (
          <div>
            <p>{currentFlowStep.content}</p>
            <Button onClick={() => window.open('https://example.com/tutorial', '_blank')}>
              Go to Link
            </Button>
            <p style={{ fontSize: '0.9em', color: '#888', marginTop: '1rem' }}>
              <em>Dynamic links and embedded content from CMS (Contentful, Sanity) for personalized tutorials.</em>
            </p>
          </div>
        )}

        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 && (
            <Button variant="secondary" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </Button>
          )}
          <Button onClick={handleNextStep} style={{ marginLeft: 'auto' }}>
            {currentStep === flowDetails.steps.length - 1 ? 'Finish Onboarding' : 'Next Step'}
          </Button>
          {currentStep < flowDetails.steps.length - 1 && (
            <Button variant="secondary" onClick={handleSkipStep} style={{ marginLeft: '1rem' }}>
              Skip Step
            </Button>
          )}
        </div>
      </Card>
      <Card title="Flow Metrics">
        <p>Completion Rate for this flow: <strong>78%</strong></p>
        <p>Average time to complete: <strong>5 min 30 sec</strong></p>
        <p style={{ fontSize: '0.9em', color: '#888', marginTop: '1rem' }}>
          <em>These metrics are updated in real-time via analytics service (GA4, Mixpanel, Segment).</em>
        </p>
      </Card>
    </div>
  );
}


const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();
  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <p>Loading application...</p>
        ) : isAuthenticated ? (
          <DashboardLayout><Component {...props} /></DashboardLayout>
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
};

const PublicRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => <Component {...props} />}
    />
  );
};

const AuthRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();
  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <p>Loading authentication...</p>
        ) : isAuthenticated ? (
          <Redirect to="/dashboard" />
        ) : (
          <AuthLayout><Component {...props} /></AuthLayout>
        )
      }
    />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <PublicRoute exact path="/" component={HomePage} />
          <AuthRoute path="/login" component={LoginPage} />
          <AuthRoute path="/register" component={RegisterPage} />

          <PrivateRoute path="/dashboard" component={DashboardPage} />
          <PrivateRoute path="/profile" component={UserProfilePage} />
          <PrivateRoute path="/ai-assistant" component={GeminiAssistantPage} />
          <PrivateRoute exact path="/onboarding-workflows" component={CreateOrFindUserOnboardingFlow} />
          <PrivateRoute path="/onboarding-workflows/:id" component={UserOnboardingEmbeddableFlowDemo} />
          <PrivateRoute path="/integrations" component={IntegrationsPage} />
          <PrivateRoute path="/analytics" component={AnalyticsPage} />
          <PrivateRoute path="/billing" component={BillingPage} />
          <PrivateRoute path="/settings" component={SettingsPage} />
          <PrivateRoute path="/admin" component={AdminPage} />

          <Route render={() => <Redirect to="/" />} /> {/* Fallback for unknown routes */}
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;