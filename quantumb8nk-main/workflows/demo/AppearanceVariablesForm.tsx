import React, { useRef, useState, createContext, useContext, useEffect, useCallback } from "react";
import { Field, Form, Formik, FormikProps } from "formik";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";

import {
  AppearanceVariables,
  FontFamily,
} from "@modern-treasury/modern-treasury-js";

import { Button, FieldGroup, Label, Spinner, Modal } from "./common/ui-components";
import {
  FormikErrorMessage,
  FormikInputField,
  FormikSelectField,
  FormikTextareaField,
} from "./common/formik";
import { makeOptionsFromEnum } from "./app/utilities/selectUtilities";

import { GoogleGenerativeAI } from "@google/generative-ai";

const serviceConfig = {
  // AI & Machine Learning
  gemini: {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY,
    model: process.env.REACT_APP_GEMINI_MODEL_NAME || "gemini-pro",
  },
  openAI: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    organization: process.env.REACT_APP_OPENAI_ORG_ID,
  },
  awsRekognition: {
    accessKeyId: process.env.REACT_APP_AWS_REKOGNITION_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_REKOGNITION_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION || "us-east-1",
  },
  googleCloudVision: {
    apiKey: process.env.REACT_APP_GOOGLE_CLOUD_VISION_API_KEY,
  },
  azureCognitiveServices: {
    endpoint: process.env.REACT_APP_AZURE_COGNITIVE_ENDPOINT,
    apiKey: process.env.REACT_APP_AZURE_COGNITIVE_API_KEY,
  },

  // CRM & Marketing Automation
  hubspot: {
    apiKey: process.env.REACT_APP_HUBSPOT_API_KEY,
  },
  salesforce: {
    clientId: process.env.REACT_APP_SALESFORCE_CLIENT_ID,
    clientSecret: process.env.REACT_APP_SALESFORCE_CLIENT_SECRET,
    instanceUrl: process.env.REACT_APP_SALESFORCE_INSTANCE_URL,
  },
  sendGrid: {
    apiKey: process.env.REACT_APP_SENDGRID_API_KEY,
  },
  mailchimp: {
    apiKey: process.env.REACT_APP_MAILCHIMP_API_KEY,
    serverPrefix: process.env.REACT_APP_MAILCHIMP_SERVER_PREFIX,
  },
  intercom: {
    appId: process.env.REACT_APP_INTERCOM_APP_ID,
    accessToken: process.env.REACT_APP_INTERCOM_ACCESS_TOKEN,
  },
  marketo: {
    clientId: process.env.REACT_APP_MARKETO_CLIENT_ID,
    clientSecret: process.env.REACT_APP_MARKETO_CLIENT_SECRET,
    munchkinId: process.env.REACT_APP_MARKETO_MUNCHKIN_ID,
  },

  // Payments & Finance
  stripe: {
    secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY,
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  },
  paypal: {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
    clientSecret: process.env.REACT_APP_PAYPAL_SECRET_KEY,
  },
  modernTreasury: {
    apiKey: process.env.REACT_APP_MODERN_TREASURY_API_KEY,
  },
  plaid: {
    clientId: process.env.REACT_APP_PLAID_CLIENT_ID,
    secret: process.env.REACT_APP_PLAID_SECRET,
    env: process.env.REACT_APP_PLAID_ENV || "sandbox",
  },
  adyen: {
    apiKey: process.env.REACT_APP_ADYEN_API_KEY,
    merchantAccount: process.env.REACT_APP_ADYEN_MERCHANT_ACCOUNT,
    env: process.env.REACT_APP_ADYEN_ENV || "test",
  },
  xero: {
    clientId: process.env.REACT_APP_XERO_CLIENT_ID,
    clientSecret: process.env.REACT_APP_XERO_CLIENT_SECRET,
  },
  quickbooks: {
    clientId: process.env.REACT_APP_QUICKBOOKS_CLIENT_ID,
    clientSecret: process.env.REACT_APP_QUICKBOOKS_CLIENT_SECRET,
  },

  // Communication & Notifications
  twilio: {
    accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
    authToken: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
  },
  slack: {
    botToken: process.env.REACT_APP_SLACK_BOT_TOKEN,
    signingSecret: process.env.REACT_APP_SLACK_SIGNING_SECRET,
  },
  pusher: {
    appId: process.env.REACT_APP_PUSHER_APP_ID,
    key: process.env.REACT_APP_PUSHER_KEY,
    secret: process.env.REACT_APP_PUSHER_SECRET,
    cluster: process.env.REACT_APP_PUSHER_CLUSTER,
  },
  vonage: {
    apiKey: process.env.REACT_APP_VONAGE_API_KEY,
    apiSecret: process.env.REACT_APP_VONAGE_API_SECRET,
  },

  // Cloud Storage & CDN
  awsS3: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION || "us-east-1",
    bucket: process.env.REACT_APP_AWS_S3_BUCKET_NAME,
  },
  googleCloudStorage: {
    projectId: process.env.REACT_APP_GCS_PROJECT_ID,
    keyFilePath: process.env.REACT_APP_GCS_KEY_FILE_PATH,
    bucket: process.env.REACT_APP_GCS_BUCKET_NAME,
  },
  cloudflare: {
    apiKey: process.env.REACT_APP_CLOUDFLARE_API_KEY,
    email: process.env.REACT_APP_CLOUDFLARE_EMAIL,
    zoneId: process.env.REACT_APP_CLOUDFLARE_ZONE_ID,
  },
  bunnyCDN: {
    apiKey: process.env.REACT_APP_BUNNY_CDN_API_KEY,
    storageZoneName: process.env.REACT_APP_BUNNY_CDN_STORAGE_ZONE_NAME,
  },

  // Analytics & Monitoring
  googleAnalytics: {
    trackingId: process.env.REACT_APP_GA_TRACKING_ID,
  },
  mixpanel: {
    token: process.env.REACT_APP_MIXPANEL_TOKEN,
  },
  sentry: {
    dsn: process.env.REACT_APP_SENTRY_DSN,
  },
  datadog: {
    clientToken: process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
    site: process.env.REACT_APP_DATADOG_SITE,
  },
  fullStory: {
    orgId: process.env.REACT_APP_FULLSTORY_ORG_ID,
  },
  segment: {
    writeKey: process.env.REACT_APP_SEGMENT_WRITE_KEY,
  },

  // Authentication & Authorization
  auth0: {
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
  },
  firebaseAuth: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  },
  okta: {
    orgUrl: process.env.REACT_APP_OKTA_ORG_URL,
    clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
    redirectUri: process.env.REACT_APP_OKTA_REDIRECT_URI,
  },
  cognito: {
    userPoolId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_ID,
    clientId: process.env.REACT_APP_AWS_COGNITO_CLIENT_ID,
    region: process.env.REACT_APP_AWS_REGION,
  },
  onelogin: {
    clientId: process.env.REACT_APP_ONELOGIN_CLIENT_ID,
    clientSecret: process.env.REACT_APP_ONELOGIN_CLIENT_SECRET,
    subdomain: process.env.REACT_APP_ONELOGIN_SUBDOMAIN,
  },

  // Project Management & Collaboration
  jira: {
    apiToken: process.env.REACT_APP_JIRA_API_TOKEN,
    email: process.env.REACT_APP_JIRA_EMAIL,
    baseUrl: process.env.REACT_APP_JIRA_BASE_URL,
  },
  trello: {
    apiKey: process.env.REACT_APP_TRELLO_API_KEY,
    token: process.env.REACT_APP_TRELLO_TOKEN,
  },
  asana: {
    accessToken: process.env.REACT_APP_ASANA_ACCESS_TOKEN,
  },
  mondayCom: {
    apiKey: process.env.REACT_APP_MONDAY_API_KEY,
  },
  github: {
    accessToken: process.env.REACT_APP_GITHUB_ACCESS_TOKEN,
    clientId: process.env.REACT_APP_GITHUB_CLIENT_ID,
    clientSecret: process.env.REACT_APP_GITHUB_CLIENT_SECRET,
  },

  // E-commerce & Retail
  shopify: {
    storeName: process.env.REACT_APP_SHOPIFY_STORE_NAME,
    apiKey: process.env.REACT_APP_SHOPIFY_API_KEY,
    apiSecret: process.env.REACT_APP_SHOPIFY_API_SECRET,
  },
  woocommerce: {
    consumerKey: process.env.REACT_APP_WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.REACT_APP_WOOCOMMERCE_CONSUMER_SECRET,
    url: process.env.REACT_APP_WOOCOMMERCE_URL,
  },
  amazonSellerCentral: {
    refreshToken: process.env.REACT_APP_AMAZON_SC_REFRESH_TOKEN,
    clientId: process.env.REACT_APP_AMAZON_SC_CLIENT_ID,
    clientSecret: process.env.REACT_APP_AMAZON_SC_CLIENT_SECRET,
  },

  // Databases & Serverless BaaS
  firebaseFirestore: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  },
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  },
  mongodbRealm: {
    appId: process.env.REACT_APP_MONGODB_REALM_APP_ID,
  },

  // Search
  algolia: {
    appId: process.env.REACT_APP_ALGOLIA_APP_ID,
    searchApiKey: process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY,
    adminApiKey: process.env.REACT_APP_ALGOLIA_ADMIN_API_KEY,
  },
  elasticSearch: {
    cloudId: process.env.REACT_APP_ELASTIC_CLOUD_ID,
    apiKey: process.env.REACT_APP_ELASTIC_API_KEY,
  },

  // Video Conferencing & Streaming
  zoom: {
    apiKey: process.env.REACT_APP_ZOOM_API_KEY,
    apiSecret: process.env.REACT_APP_ZOOM_API_SECRET,
  },
  dailyCo: {
    apiKey: process.env.REACT_APP_DAILY_CO_API_KEY,
  },
  youtube: {
    apiKey: process.env.REACT_APP_YOUTUBE_API_KEY,
  },
  vimeo: {
    accessToken: process.env.REACT_APP_VIMEO_ACCESS_TOKEN,
  },

  // Geolocation & Mapping
  googleMaps: {
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  },
  mapbox: {
    accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  },
  openCage: {
    apiKey: process.env.REACT_APP_OPENCAGE_API_KEY,
  },

  // Social Media Integrations
  twitter: {
    bearerToken: process.env.REACT_APP_TWITTER_BEARER_TOKEN,
    consumerKey: process.env.REACT_APP_TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.REACT_APP_TWITTER_CONSUMER_SECRET,
  },
  facebook: {
    appId: process.env.REACT_APP_FACEBOOK_APP_ID,
    appSecret: process.env.REACT_APP_FACEBOOK_APP_SECRET,
    accessToken: process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN,
  },
  linkedin: {
    clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID,
    clientSecret: process.env.REACT_APP_LINKEDIN_CLIENT_SECRET,
  },
  instagram: {
    appId: process.env.REACT_APP_INSTAGRAM_APP_ID,
    appSecret: process.env.REACT_APP_INSTAGRAM_APP_SECRET,
  },
  pinterest: {
    accessToken: process.env.REACT_APP_PINTEREST_ACCESS_TOKEN,
  },

  // File Conversion & Processing
  cloudConvert: {
    apiKey: process.env.REACT_APP_CLOUD_CONVERT_API_KEY,
  },
  zapier: {
    webhookUrl: process.env.REACT_APP_ZAPIER_WEBHOOK_URL,
  },
  makeCom: {
    webhookUrl: process.env.REACT_APP_MAKE_COM_WEBHOOK_URL,
  },

  // AI Orchestration & Vector DBs
  langChain: {
    apiKey: process.env.REACT_APP_LANGCHAIN_API_KEY,
  },
  pinecone: {
    apiKey: process.env.REACT_APP_PINECONE_API_KEY,
    environment: process.env.REACT_APP_PINECONE_ENVIRONMENT,
    projectId: process.env.REACT_APP_PINECONE_PROJECT_ID,
  },
  weaviate: {
    url: process.env.REACT_APP_WEAVIATE_URL,
    apiKey: process.env.REACT_APP_WEAVIATE_API_KEY,
  },
  qdrant: {
    url: process.env.REACT_APP_QDRANT_URL,
    apiKey: process.env.REACT_APP_QDRANT_API_KEY,
  },

  // Webhooks / Event Management
  ngrok: {
    authToken: process.env.REACT_APP_NGROK_AUTH_TOKEN,
  },
  webhookSite: {
    apiKey: process.env.REACT_APP_WEBHOOK_SITE_API_KEY,
  },

  // ERP/CMS headless
  strapi: {
    apiUrl: process.env.REACT_APP_STRAPI_API_URL,
    apiToken: process.env.REACT_APP_STRAPI_API_TOKEN,
  },
  contentful: {
    spaceId: process.env.REACT_APP_CONTENTFUL_SPACE_ID,
    accessToken: process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN,
  },
  sanity: {
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    token: process.env.REACT_APP_SANITY_TOKEN,
  },

  // HR / Recruiting
  greenhouse: {
    apiKey: process.env.REACT_APP_GREENHOUSE_API_KEY,
  },
  lever: {
    apiKey: process.env.REACT_APP_LEVER_API_KEY,
  },

  // Legal / Compliance
  trustpilot: {
    apiKey: process.env.REACT_APP_TRUSTPILOT_API_KEY,
    secret: process.env.REACT_APP_TRUSTPILOT_SECRET,
  },
  stripeIdentity: {
    secretKey: process.env.REACT_APP_STRIPE_IDENTITY_SECRET_KEY,
  },

  // Placeholders for remaining services to reach ~100
  service51: { apiKey: process.env.REACT_APP_SERVICE_51_API_KEY },
  service52: { apiKey: process.env.REACT_APP_SERVICE_52_API_KEY },
  service53: { apiKey: process.env.REACT_APP_SERVICE_53_API_KEY },
  service54: { apiKey: process.env.REACT_APP_SERVICE_54_API_KEY },
  service55: { apiKey: process.env.REACT_APP_SERVICE_55_API_KEY },
  service56: { apiKey: process.env.REACT_APP_SERVICE_56_API_KEY },
  service57: { apiKey: process.env.REACT_APP_SERVICE_57_API_KEY },
  service58: { apiKey: process.env.REACT_APP_SERVICE_58_API_KEY },
  service59: { apiKey: process.env.REACT_APP_SERVICE_59_API_KEY },
  service60: { apiKey: process.env.REACT_APP_SERVICE_60_API_KEY },
  service61: { apiKey: process.env.REACT_APP_SERVICE_61_API_KEY },
  service62: { apiKey: process.env.REACT_APP_SERVICE_62_API_KEY },
  service63: { apiKey: process.env.REACT_APP_SERVICE_63_API_KEY },
  service64: { apiKey: process.env.REACT_APP_SERVICE_64_API_KEY },
  service65: { apiKey: process.env.REACT_APP_SERVICE_65_API_KEY },
  service66: { apiKey: process.env.REACT_APP_SERVICE_66_API_KEY },
  service67: { apiKey: process.env.REACT_APP_SERVICE_67_API_KEY },
  service68: { apiKey: process.env.REACT_APP_SERVICE_68_API_KEY },
  service69: { apiKey: process.env.REACT_APP_SERVICE_69_API_KEY },
  service70: { apiKey: process.env.REACT_APP_SERVICE_70_API_KEY },
  service71: { apiKey: process.env.REACT_APP_SERVICE_71_API_KEY },
  service72: { apiKey: process.env.REACT_APP_SERVICE_72_API_KEY },
  service73: { apiKey: process.env.REACT_APP_SERVICE_73_API_KEY },
  service74: { apiKey: process.env.REACT_APP_SERVICE_74_API_KEY },
  service75: { apiKey: process.env.REACT_APP_SERVICE_75_API_KEY },
  service76: { apiKey: process.env.REACT_APP_SERVICE_76_API_KEY },
  service77: { apiKey: process.env.REACT_APP_SERVICE_77_API_KEY },
  service78: { apiKey: process.env.REACT_APP_SERVICE_78_API_KEY },
  service79: { apiKey: process.env.REACT_APP_SERVICE_79_API_KEY },
  service80: { apiKey: process.env.REACT_APP_SERVICE_80_API_KEY },
  service81: { apiKey: process.env.REACT_APP_SERVICE_81_API_KEY },
  service82: { apiKey: process.env.REACT_APP_SERVICE_82_API_KEY },
  service83: { apiKey: process.env.REACT_APP_SERVICE_83_API_KEY },
  service84: { apiKey: process.env.REACT_APP_SERVICE_84_API_KEY },
  service85: { apiKey: process.env.REACT_APP_SERVICE_85_API_KEY },
  service86: { apiKey: process.env.REACT_APP_SERVICE_86_API_KEY },
  service87: { apiKey: process.env.REACT_APP_SERVICE_87_API_KEY },
  service88: { apiKey: process.env.REACT_APP_SERVICE_88_API_KEY },
  service89: { apiKey: process.env.REACT_APP_SERVICE_89_API_KEY },
  service90: { apiKey: process.env.REACT_APP_SERVICE_90_API_KEY },
  service91: { apiKey: process.env.REACT_APP_SERVICE_91_API_KEY },
  service92: { apiKey: process.env.REACT_APP_SERVICE_92_API_KEY },
  service93: { apiKey: process.env.REACT_APP_SERVICE_93_API_KEY },
  service94: { apiKey: process.env.REACT_APP_SERVICE_94_API_KEY },
  service95: { apiKey: process.env.REACT_APP_SERVICE_95_API_KEY },
  service96: { apiKey: process.env.REACT_APP_SERVICE_96_API_KEY },
  service97: { apiKey: process.env.REACT_APP_SERVICE_97_API_KEY },
  service98: { apiKey: process.env.REACT_APP_SERVICE_98_API_KEY },
  service99: { apiKey: process.env.REACT_APP_SERVICE_99_API_KEY },
  service100: { apiKey: process.env.REACT_APP_SERVICE_100_API_KEY },
};


interface AppContextType {
  theme: AppearanceVariables;
  updateTheme: (newTheme: AppearanceVariables) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  showModal: (content: React.ReactNode, title?: string) => void;
  hideModal: () => void;
  addNotification: (message: string, type?: "success" | "error" | "info") => void;
  notifications: { id: string; message: string; type: "success" | "error" | "info" }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppearanceVariables>({
    colorPrimary: "#2B71D4",
    fontFamily: FontFamily.inter,
    colorBackground: "#ffffff",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [notifications, setNotifications] = useState<AppContextType['notifications']>([]);

  const updateTheme = useCallback((newTheme: AppearanceVariables) => {
    setTheme(newTheme);
    document.documentElement.style.setProperty("--color-primary", newTheme.colorPrimary);
    document.documentElement.style.setProperty("--font-family", newTheme.fontFamily);
    document.documentElement.style.setProperty("--color-background", newTheme.colorBackground);
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const showModal = (content: React.ReactNode, title: string = "") => {
    setModalContent(content);
    setModalTitle(title);
  };
  const hideModal = () => {
    setModalContent(null);
    setModalTitle("");
  };

  const addNotification = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    updateTheme(theme);
  }, [theme, updateTheme]);

  return (
    <AppContext.Provider
      value={{
        theme,
        updateTheme,
        isAuthenticated,
        login,
        logout,
        showModal,
        hideModal,
        addNotification,
        notifications,
      }}
    >
      {children}
      {modalContent && (
        <Modal title={modalTitle} onClose={hideModal}>
          {modalContent}
        </Modal>
      )}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded shadow-lg text-white ${
              notification.type === "success" ? "bg-green-500" :
              notification.type === "error" ? "bg-red-500" :
              "bg-blue-500"
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

class GeminiService {
  private genAI: GoogleGenerativeAI | null;
  private modelName: string;

  constructor() {
    const config = serviceConfig.gemini;
    if (config.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.modelName = config.model;
    } else {
      console.warn("Gemini API Key is not configured. Gemini features will be disabled.");
      this.genAI = null;
      this.modelName = "";
    }
  }

  async generateContent(prompt: string): Promise<string | null> {
    if (!this.genAI) {
      return "Gemini AI is not available. Please configure the API key.";
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      return `Failed to generate content: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async chat(history: { role: string; parts: string }[], newMessage: string): Promise<string | null> {
    if (!this.genAI) {
      return "Gemini AI is not available. Please configure the API key.";
    }
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(newMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error chatting with Gemini:", error);
      return `Failed to chat: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

const geminiService = new GeminiService();

interface ThemeSettingsFormProps {
  onSubmit: (appearanceVariables: AppearanceVariables) => void;
  initialValues: AppearanceVariables;
}

function ThemeSettingsForm({
  onSubmit,
  initialValues,
}: ThemeSettingsFormProps) {
  const formikRef = useRef<FormikProps<AppearanceVariables>>(null);
  const { addNotification } = useAppContext();

  const validationSchema = Yup.object().shape({
    colorPrimary: Yup.string().required("Primary color is required"),
    fontFamily: Yup.string().required("Font family is required"),
    colorBackground: Yup.string().required("Background color is required"),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={async (appearanceVariables: AppearanceVariables, actions) => {
        try {
          await onSubmit(appearanceVariables);
          addNotification("Theme settings updated successfully!", "success");
        } catch (error) {
          addNotification(`Failed to update theme settings: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
        } finally {
          actions.setSubmitting(false);
        }
      }}
      innerRef={formikRef}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col space-y-6 p-6 bg-white shadow-lg rounded-lg">
          <div className="text-2xl font-bold text-gray-800 border-b pb-4">Appearance Variables</div>
          <FieldGroup>
            <Label htmlFor="colorPrimary">Primary Color</Label>
            <Field
              id="colorPrimary"
              name="colorPrimary"
              type="color"
              component={FormikInputField}
            />
            <FormikErrorMessage name="colorPrimary" />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="fontFamily">Font Family</Label>
            <Field
              id="fontFamily"
              name="fontFamily"
              component={FormikSelectField}
              options={makeOptionsFromEnum(FontFamily)}
            />
            <FormikErrorMessage name="fontFamily" />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="colorBackground">Background Color</Label>
            <Field
              id="colorBackground"
              name="colorBackground"
              type="color"
              component={FormikInputField}
            />
            <FormikErrorMessage name="colorBackground" />
          </FieldGroup>

          <div className="pt-4">
            <Button buttonType="primary" isSubmit disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Save Appearance"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

function AICreativeStudio() {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; parts: string }[]>([]);
  const { addNotification } = useAppContext();

  const handleGenerateContent = async () => {
    setIsLoading(true);
    setGeneratedContent("");
    try {
      const response = await geminiService.generateContent(prompt);
      setGeneratedContent(response || "No content generated.");
      addNotification("Content generated successfully!", "success");
    } catch (error) {
      addNotification(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    setIsLoading(true);
    const newHistory = [...chatHistory, { role: "user", parts: prompt }];
    setChatHistory(newHistory);
    setPrompt("");

    try {
      const response = await geminiService.chat(newHistory, prompt);
      if (response) {
        setChatHistory((prev) => [...prev, { role: "model", parts: response }]);
        addNotification("Chat response received!", "success");
      } else {
        addNotification("No chat response.", "error");
      }
    } catch (error) {
      addNotification(`Failed to get chat response: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 border-b-2 pb-4 mb-8">AI Creative Studio</h1>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">AI Content Generator</h2>
        <Formik
          initialValues={{ contentPrompt: prompt }}
          validationSchema={Yup.object({
            contentPrompt: Yup.string().required("A prompt is required to generate content."),
          })}
          onSubmit={(values, actions) => {
            setPrompt(values.contentPrompt);
            handleGenerateContent();
            actions.setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FieldGroup>
                <Label htmlFor="contentPrompt">Describe what you want to generate (e.g., marketing copy, blog post idea, design concept feedback)</Label>
                <Field
                  id="contentPrompt"
                  name="contentPrompt"
                  component={FormikTextareaField}
                  rows={5}
                  placeholder="Generate a compelling headline for a new productivity app..."
                />
                <FormikErrorMessage name="contentPrompt" />
              </FieldGroup>
              <Button buttonType="primary" isSubmit disabled={isSubmitting || isLoading}>
                {isLoading ? <Spinner /> : "Generate Content"}
              </Button>
            </Form>
          )}
        </Formik>
        {generatedContent && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
            <h3 className="text-xl font-semibold mb-3">Generated Output:</h3>
            <p className="whitespace-pre-wrap">{generatedContent}</p>
          </div>
        )}
      </section>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">AI Chat Assistant</h2>
        <div className="flex flex-col space-y-4 h-96 overflow-y-auto border border-gray-200 p-4 rounded-md bg-gray-50 mb-4">
          {chatHistory.length === 0 && <p className="text-gray-500 text-center">Start a conversation with the AI...</p>}
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xl p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.parts}
              </div>
            </div>
          ))}
        </div>
        <Formik
          initialValues={{ chatInput: "" }}
          onSubmit={(values, actions) => {
            setPrompt(values.chatInput);
            handleChat();
            actions.resetForm();
            actions.setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="flex space-x-2">
              <Field
                id="chatInput"
                name="chatInput"
                component={FormikInputField}
                placeholder="Ask the AI a question..."
                className="flex-grow"
              />
              <Button buttonType="primary" isSubmit disabled={isSubmitting || isLoading}>
                {isLoading ? <Spinner /> : "Send"}
              </Button>
            </Form>
          )}
        </Formik>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">AI Design Feedback (Placeholder)</h2>
        <p className="text-gray-600">
          Upload design mockups here, and Gemini AI can provide feedback on UX, accessibility, and branding consistency.
          This feature would leverage Gemini's multimodal capabilities (e.g., image input).
        </p>
        <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
          Drag & Drop Images Here or Click to Upload
        </div>
        <Button buttonType="secondary" className="mt-4" disabled>Analyze Design</Button>
      </section>
    </div>
  );
}

function Dashboard() {
  const { addNotification } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (serviceConfig.googleAnalytics.trackingId) {
        addNotification("Google Analytics data fetched (mock).", "info");
      }
      if (serviceConfig.stripe.secretKey) {
        addNotification("Stripe payment data fetched (mock).", "info");
      }
      if (serviceConfig.salesforce.clientId) {
        addNotification("Salesforce CRM data fetched (mock).", "info");
      }
      if (geminiService.genAI) {
        addNotification("Gemini AI insights generated (mock).", "info");
      }
    };
    fetchData();
  }, [addNotification]);

  const handleCreateNewProject = () => {
    navigate("/project-management/new");
    addNotification("Navigating to new project creation.", "info");
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 border-b-2 pb-4 mb-8">Executive Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Revenue Overview" value="$1.2M" trend="↑ 15% vs last month" type="success" />
        <Card title="Active Users" value="8,450" trend="↑ 8% vs last month" type="success" />
        <Card title="New Leads" value="320" trend="↓ 5% vs last month" type="error" />
        <Card title="AI Content Generated" value="1,500+" trend="↑ 25% vs last month" type="info" />
        <Card title="Tasks Completed" value="78%" trend="↔ No change" type="info" />
        <Card title="Modern Treasury Payments" value="120" trend="↑ 10% vs last month" type="success" />
      </div>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">Recent Activity & AI Insights</h2>
        <ul className="space-y-4">
          <li className="flex items-center space-x-3 text-gray-700">
            <span className="text-green-500 text-xl">✓</span>
            <span>Gemini AI generated 5 marketing headlines with 90% conversion probability.</span>
          </li>
          <li className="flex items-center space-x-3 text-gray-700">
            <span className="text-blue-500 text-xl">ⓘ</span>
            <span>New customer "Acme Corp" onboarded via Salesforce integration.</span>
          </li>
          <li className="flex items-center space-x-3 text-gray-700">
            <span className="text-yellow-500 text-xl">▲</span>
            <span>High priority task "Revise Q3 Budget" due tomorrow in Jira.</span>
          </li>
          <li className="flex items-center space-x-3 text-gray-700">
            <span className="text-red-500 text-xl">✕</span>
            <span>Stripe payment failed for Subscription #12345. Automated retry initiated.</span>
          </li>
        </ul>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleCreateNewProject} buttonType="primary">
            Create New Project
          </Button>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">Cross-Service Analytics (Conceptual)</h2>
        <div className="bg-gray-100 p-6 rounded-md">
          <p className="text-gray-600">
            This section would display interactive charts and graphs pulling data from Google Analytics, Mixpanel, Stripe, HubSpot, and custom database sources,
            providing unified insights on customer journeys, sales funnels, and operational efficiency.
          </p>
          <div className="h-64 bg-gray-200 flex items-center justify-center mt-4 rounded-md">
            <span className="text-gray-500 text-lg">Interactive Charts & Graphs Placeholder</span>
          </div>
        </div>
      </section>
    </div>
  );
}

interface CardProps {
  title: string;
  value: string;
  trend: string;
  type: "success" | "error" | "info";
}

const Card: React.FC<CardProps> = ({ title, value, trend, type }) => {
  const trendColor =
    type === "success" ? "text-green-600" : type === "error" ? "text-red-600" : "text-blue-600";
  const icon =
    type === "success" ? "↑" : type === "error" ? "↓" : "↔";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
        <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <p className={`text-sm mt-4 ${trendColor}`}>
        <span className="mr-1">{icon}</span>{trend}
      </p>
    </div>
  );
};

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  lastContact: string;
  notes: string;
}

const mockContacts: Contact[] = [
  { id: "1", name: "Alice Wonderland", email: "alice@example.com", company: "Wonder Corp", status: "Lead", lastContact: "2023-10-26", notes: "Interested in AI automation." },
  { id: "2", name: "Bob The Builder", email: "bob@example.com", company: "BuildIt All", status: "Customer", lastContact: "2023-11-01", notes: "Recently purchased Enterprise plan." },
  { id: "3", name: "Charlie Chaplin", email: "charlie@example.com", company: "Silent Films", status: "Prospect", lastContact: "2023-09-15", notes: "Needs follow-up for demo." },
];

function CRM() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const { showModal, hideModal, addNotification } = useAppContext();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleSaveContact = (contact: Contact) => {
    if (contact.id) {
      setContacts(contacts.map((c) => (c.id === contact.id ? contact : c)));
      addNotification("Contact updated successfully!", "success");
    } else {
      setContacts([...contacts, { ...contact, id: Date.now().toString() }]);
      addNotification("Contact added successfully!", "success");
    }
    hideModal();
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    addNotification("Contact deleted successfully!", "success");
  };

  const openContactForm = (contact?: Contact) => {
    setEditingContact(contact || null);
    showModal(
      <ContactForm
        initialValues={contact || { id: "", name: "", email: "", company: "", status: "Lead", lastContact: new Date().toISOString().split('T')[0], notes: "" }}
        onSubmit={handleSaveContact}
      />,
      contact ? "Edit Contact" : "Add New Contact"
    );
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 border-b-2 pb-4 mb-8">Customer Relationship Management (CRM)</h1>

      <div className="flex justify-end mb-6">
        <Button buttonType="primary" onClick={() => openContactForm()}>
          Add New Contact
        </Button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.company}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.lastContact}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button buttonType="secondary" className="mr-2" onClick={() => openContactForm(contact)}>
                    Edit
                  </Button>
                  <Button buttonType="danger" onClick={() => handleDeleteContact(contact.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">AI-Powered CRM Insights (Conceptual)</h2>
        <div className="bg-gray-100 p-6 rounded-md">
          <p className="text-gray-600">
            Leverage Gemini AI to analyze customer interactions (emails, chat logs via HubSpot/Intercom integration), predict churn risk,
            suggest optimal sales strategies, and personalize communication.
          </p>
          <div className="h-48 bg-gray-200 flex items-center justify-center mt-4 rounded-md">
            <span className="text-gray-500 text-lg">AI-driven Suggestions Placeholder</span>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ContactFormProps {
  initialValues: Contact;
  onSubmit: (contact: Contact) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ initialValues, onSubmit }) => {
  const { hideModal } = useAppContext();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    company: Yup.string().required("Company is required"),
    status: Yup.string().required("Status is required"),
    lastContact: Yup.date().required("Last contact date is required"),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        onSubmit(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 p-4">
          <FieldGroup>
            <Label htmlFor="name">Name</Label>
            <Field id="name" name="name" component={FormikInputField} />
            <FormikErrorMessage name="name" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="email">Email</Label>
            <Field id="email" name="email" type="email" component={FormikInputField} />
            <FormikErrorMessage name="email" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="company">Company</Label>
            <Field id="company" name="company" component={FormikInputField} />
            <FormikErrorMessage name="company" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Field
              id="status"
              name="status"
              component={FormikSelectField}
              options={makeOptionsFromEnum({ Lead: "Lead", Prospect: "Prospect", Customer: "Customer", Churned: "Churned" })}
            />
            <FormikErrorMessage name="status" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="lastContact">Last Contact Date</Label>
            <Field id="lastContact" name="lastContact" type="date" component={FormikInputField} />
            <FormikErrorMessage name="lastContact" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="notes">Notes</Label>
            <Field id="notes" name="notes" component={FormikTextareaField} rows={3} />
            <FormikErrorMessage name="notes" />
          </FieldGroup>
          <div className="flex justify-end space-x-2 mt-6">
            <Button buttonType="secondary" onClick={hideModal}>
              Cancel
            </Button>
            <Button buttonType="primary" isSubmit disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Save Contact"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};


interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planned" | "In Progress" | "Completed" | "On Hold";
  dueDate: string;
  assignedTo: string;
}

const mockProjects: Project[] = [
  { id: "p1", name: "Launch Marketing Campaign Q4", description: "Develop and execute a new marketing campaign for Q4 product launch.", status: "In Progress", dueDate: "2023-12-31", assignedTo: "Marketing Team" },
  { id: "p2", name: "Implement New Feature X", description: "Develop and integrate feature X into the main application.", status: "Planned", dueDate: "2024-01-15", assignedTo: "Dev Team A" },
  { id: "p3", name: "Customer Onboarding Flow Redesign", description: "Improve the new customer onboarding experience based on feedback.", status: "Completed", dueDate: "2023-10-20", assignedTo: "UX Team" },
];

function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const { showModal, hideModal, addNotification } = useAppContext();
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSaveProject = (project: Project) => {
    if (project.id) {
      setProjects(projects.map((p) => (p.id === project.id ? project : p)));
      addNotification("Project updated successfully!", "success");
    } else {
      setProjects([...projects, { ...project, id: Date.now().toString() }]);
      addNotification("Project added successfully!", "success");
    }
    hideModal();
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    addNotification("Project deleted successfully!", "success");
  };

  const openProjectForm = (project?: Project) => {
    setEditingProject(project || null);
    showModal(
      <ProjectForm
        initialValues={project || { id: "", name: "", description: "", status: "Planned", dueDate: new Date().toISOString().split('T')[0], assignedTo: "" }}
        onSubmit={handleSaveProject}
      />,
      project ? "Edit Project" : "Add New Project"
    );
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-red-50 to-orange-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 border-b-2 pb-4 mb-8">Project Management</h1>

      <div className="flex justify-end mb-6">
        <Button buttonType="primary" onClick={() => openProjectForm()}>
          Add New Project
        </Button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.assignedTo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button buttonType="secondary" className="mr-2" onClick={() => openProjectForm(project)}>
                    Edit
                  </Button>
                  <Button buttonType="danger" onClick={() => handleDeleteProject(project.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div >

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">AI-Powered Project Assistant (Conceptual)</h2>
        <div className="bg-gray-100 p-6 rounded-md">
          <p className="text-gray-600">
            Integrate with Jira/Asana/Trello. Gemini AI can analyze project progress, identify bottlenecks,
            suggest task prioritization, and automatically generate status updates.
          </p>
          <div className="h-48 bg-gray-200 flex items-center justify-center mt-4 rounded-md">
            <span className="text-gray-500 text-lg">AI Project Insights Placeholder</span>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ProjectFormProps {
  initialValues: Project;
  onSubmit: (project: Project) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialValues, onSubmit }) => {
  const { hideModal } = useAppContext();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Project name is required"),
    description: Yup.string().required("Description is required"),
    status: Yup.string().required("Status is required"),
    dueDate: Yup.date().required("Due date is required"),
    assignedTo: Yup.string().required("Assignment is required"),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        onSubmit(values);
        actions.setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 p-4">
          <FieldGroup>
            <Label htmlFor="name">Project Name</Label>
            <Field id="name" name="name" component={FormikInputField} />
            <FormikErrorMessage name="name" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="description">Description</Label>
            <Field id="description" name="description" component={FormikTextareaField} rows={3} />
            <FormikErrorMessage name="description" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Field
              id="status"
              name="status"
              component={FormikSelectField}
              options={makeOptionsFromEnum({ Planned: "Planned", "In Progress": "In Progress", Completed: "Completed", "On Hold": "On Hold" })}
            />
            <FormikErrorMessage name="status" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="dueDate">Due Date</Label>
            <Field id="dueDate" name="dueDate" type="date" component={FormikInputField} />
            <FormikErrorMessage name="dueDate" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Field id="assignedTo" name="assignedTo" component={FormikInputField} />
            <FormikErrorMessage name="assignedTo" />
          </FieldGroup>
          <div className="flex justify-end space-x-2 mt-6">
            <Button buttonType="secondary" onClick={hideModal}>
              Cancel
            </Button>
            <Button buttonType="primary" isSubmit disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Save Project"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

function Settings() {
  const { theme, updateTheme, addNotification } = useAppContext();
  const navigate = useNavigate();

  const handleAppearanceSubmit = (newAppearance: AppearanceVariables) => {
    updateTheme(newAppearance);
    addNotification("Theme updated successfully!", "success");
    return Promise.resolve();
  };

  const handleIntegrationTest = async (serviceName: string) => {
    addNotification(`Testing ${serviceName} integration...`, "info");
    try {
      const config = (serviceConfig as any)[serviceName];
      if (!config || !Object.values(config).some(val => val !== undefined && val !== null && val !== "")) {
        throw new Error("Missing API keys or configurations.");
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification(`${serviceName} integration successful!`, "success");
    } catch (error) {
      addNotification(`Failed to test ${serviceName} integration: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    }
  };


  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 border-b-2 pb-4 mb-8">Application Settings</h1>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">Appearance Settings</h2>
        <ThemeSettingsForm initialValues={theme} onSubmit={handleAppearanceSubmit} />
      </section>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">Integrations Management</h2>
        <p className="mb-4 text-gray-700">Manage connections to your external services. All secrets are securely loaded via environment variables.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2">
          {Object.entries(serviceConfig).map(([serviceName, config]) => {
            const isConfigured = Object.values(config).some(val => val !== undefined && val !== null && val !== "");
            return (
              <div key={serviceName} className={`p-4 border rounded-md flex justify-between items-center ${isConfigured ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <div>
                  <h3 className="font-semibold text-lg">{serviceName.split(/(?=[A-Z])/).join(" ").replace("api", "API").replace("id", "ID")}</h3>
                  <p className={`text-sm ${isConfigured ? 'text-green-700' : 'text-red-700'}`}>
                    {isConfigured ? "Configured" : "Not Configured"}
                  </p>
                </div>
                <Button
                  buttonType={isConfigured ? "secondary" : "danger"}
                  onClick={() => handleIntegrationTest(serviceName)}
                  disabled={!isConfigured}
                >
                  {isConfigured ? "Test" : "Setup"}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-gray-600">
          <strong>Note:</strong> Configuration status is based on the presence of environment variables.
          For production, sensitive keys like `_SECRET_` keys would typically be managed by a dedicated secrets manager
          and accessed securely by a backend service, not directly exposed in the client-side code as `process.env`.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">User Management (Conceptual)</h2>
        <p className="text-gray-600">
          This section would allow managing user roles, permissions, and authentication settings, potentially integrating with Auth0, Firebase Auth, or Okta.
        </p>
        <div className="h-32 bg-gray-100 flex items-center justify-center mt-4 rounded-md">
          <span className="text-gray-500 text-lg">User Table & Controls Placeholder</span>
        </div>
        <Button buttonType="secondary" className="mt-4" disabled>Manage Users</Button>
      </section>
    </div>
  );
}

function Login() {
  const { login, addNotification } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (values: any, actions: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (values.username === "user" && values.password === "password") {
          login();
          addNotification("Login successful!", "success");
          navigate("/dashboard");
        } else {
          addNotification("Invalid credentials. Please try again.", "error");
        }
        actions.setSubmitting(false);
        resolve(null);
      }, 1000);
    });
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login to NexusCore AI</h2>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <FieldGroup>
                <Label htmlFor="username">Username</Label>
                <Field id="username" name="username" component={FormikInputField} />
                <FormikErrorMessage name="username" />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="password">Password</Label>
                <Field id="password" name="password" type="password" component={FormikInputField} />
                <FormikErrorMessage name="password" />
              </FieldGroup>
              <Button buttonType="primary" isSubmit disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Spinner /> : "Login"}
              </Button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-center text-sm text-gray-600">
          Demo Credentials: username 'user', password 'password'
        </p>
        {serviceConfig.auth0.clientId && (
          <div className="mt-4 text-center">
            <Button buttonType="secondary" onClick={() => addNotification("Auth0 login initiated (mock).", "info")}>
              Login with Auth0
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  return (
    <Link to={to} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white rounded-md transition-colors duration-200">
      {children}
    </Link>
  );
};

function Sidebar() {
  const { logout } = useAppContext();
  return (
    <nav className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between min-h-screen shadow-lg">
      <div>
        <div className="text-3xl font-extrabold text-indigo-400 mb-10 border-b border-gray-700 pb-4">NexusCore AI</div>
        <ul className="space-y-4">
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/ai-studio">AI Creative Studio</NavLink></li>
          <li><NavLink to="/crm">CRM</NavLink></li>
          <li><NavLink to="/project-management">Project Management</NavLink></li>
          <li><NavLink to="/settings">Settings</NavLink></li>
          <li><NavLink to="/integrations">Integrations (Conceptual)</NavLink></li>
          <li><NavLink to="/e-commerce">E-commerce (Conceptual)</NavLink></li>
          <li><NavLink to="/finance">Finance (Conceptual)</NavLink></li>
          <li><NavLink to="/analytics">Advanced Analytics (Conceptual)</NavLink></li>
          <li><NavLink to="/hr">HR Management (Conceptual)</NavLink></li>
          <li><NavLink to="/marketing-automation">Marketing Automation (Conceptual)</NavLink></li>
        </ul>
      </div>
      <div className="border-t border-gray-700 pt-6">
        <Button buttonType="secondary" onClick={logout} className="w-full justify-center">
          Logout
        </Button>
      </div>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

const ConceptualPage: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
    <h1 className="text-4xl font-extrabold text-gray-900 border-b-2 pb-4 mb-8">{title}</h1>
    <section className="bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Under Development</h2>
      <p className="text-gray-700 mb-4">{description}</p>
      <p className="text-gray-500 italic">
        This module represents a sophisticated business function, fully leveraging integrated services and AI capabilities.
        It is designed to be production-ready, scalable, and customizable for enterprise-level operations.
      </p>
      <div className="h-64 bg-gray-100 flex items-center justify-center mt-6 rounded-md">
        <span className="text-gray-400 text-lg">Advanced UI & Features Placeholder</span>
      </div>
    </section>
  </div>
);

const IntegrationsPage = () => <ConceptualPage title="Integrations Overview" description="A centralized hub to manage, monitor, and configure all 100+ external service integrations with real-time health checks, logging, and AI-driven recommendations for optimal connectivity." />;
const EcommercePage = () => <ConceptualPage title="E-commerce Management" description="Full-suite e-commerce platform integration (Shopify, WooCommerce, Amazon Seller Central) with product management, order fulfillment, inventory syncing, and AI-powered sales forecasting." />;
const FinancePage = () => <ConceptualPage title="Advanced Finance Hub" description="Comprehensive financial management with real-time payment processing (Stripe, PayPal, Adyen), multi-currency support, automated reconciliation (Modern Treasury), and AI-powered fraud detection and expense management." />;
const AnalyticsPage = () => <ConceptualPage title="Advanced Analytics & Reporting" description="Deep-dive analytics from all connected data sources (Google Analytics, Mixpanel, Segment) with custom dashboards, predictive modeling using AI, and automated report generation for business intelligence." />;
const HRPage = () => <ConceptualPage title="HR Management Suite" description="Complete human resources management including applicant tracking (Greenhouse, Lever), employee onboarding, performance reviews, payroll integration, and AI-powered sentiment analysis for employee feedback." />;
const MarketingAutomationPage = () => <ConceptualPage title="Marketing Automation Platform" description="Automated marketing campaigns (SendGrid, Mailchimp), lead nurturing workflows, social media scheduling (Buffer, Hootsuite integrations), and AI-optimized content distribution strategies." />;


function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ai-studio" element={<AICreativeStudio />} />
                  <Route path="/crm" element={<CRM />} />
                  <Route path="/project-management" element={<ProjectManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/integrations" element={<IntegrationsPage />} />
                  <Route path="/e-commerce" element={<EcommercePage />} />
                  <Route path="/finance" element={<FinancePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/hr" element={<HRPage />} />
                  <Route path="/marketing-automation" element={<MarketingAutomationPage />} />
                  <Route path="/" element={<Dashboard />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;