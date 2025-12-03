// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Form, Formik, FormikProps, Field } from "formik";
import * as yup from "yup";
import {
  useCreateUserOnboardingFlowMutation,
  useUpdateUserOnboardingFlowMutation,
  useGetUserOnboardingFlowQuery,
  UserOnboardingFlow,
  // Assuming more user data and enums are available from GraphQL schema
  // User,
  // UserRole,
} from "../../../generated/dashboard/graphqlSchema"; // Expanded GraphQL schema
import {
  Button,
  FieldGroup,
  Label,
  Input,
  Select,
  Textarea,
  Checkbox,
  LoadingSpinner,
  ErrorAlert,
  SuccessToast,
  ProgressBar,
  Tab,
  Tabs,
  Accordion,
  AccordionItem,
  Switch,
  Badge,
} from "../../../common/ui-components"; // Assuming a richer UI library
import { FormikErrorMessage } from "../../../common/formik";
import FormikCounterpartyAsyncSelect, {
  CounterpartyOption,
} from "../../../common/formik/FormikCounterpartyAsyncSelect";
import FormikFlowAliasAsyncSelect, {
  FlowAliasOption,
} from "../../../common/formik/FormikFlowAliasAsyncSelect";
import FormikUserAsyncSelect, {
  UserOption,
} from "../../../common/formik/FormikUserAsyncSelect"; // New for assigning users
import useErrorBanner from "../../../common/utilities/useErrorBanner";
import useSuccessToast from "../../../common/utilities/useSuccessToast";
import { GoogleGenerativeAI } from "@google/generative-ai"; // For Gemini AI integration
import { logAuditEvent } from "../../../common/utilities/auditLogger"; // For robust audit logging
import { sendNotification } from "../../../common/utilities/notificationService"; // Centralized notification service
import { trackEvent } from "../../../common/utilities/analyticsTracker"; // Centralized analytics tracker
import { useFeatureFlag } from "../../../common/utilities/featureFlags"; // Feature flag management
import { i18n } from "../../../common/utilities/i18n"; // Internationalization utility
import { validateSchemaAgainstPolicy } from "../../../common/utilities/securityPolicyEngine"; // Security policy engine

// --- Centralized Configuration for External Services & Secrets ---
// This object explicitly lists the environment variables required for each integrated service.
// In a real-world scenario, these would be managed by a Secrets Manager (e.g., AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault)
// and exposed to the application build process as environment variables (e.g., prefixed with NEXT_PUBLIC_ for client-side).
const externalServicesConfig = {
  ai: {
    gemini: {
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "", // Using NEXT_PUBLIC_ for client-side access in Next.js/similar environments
      modelName: "gemini-pro",
      projectId: process.env.GEMINI_PROJECT_ID || "",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      organizationId: process.env.OPENAI_ORG_ID || "",
    },
    awsRekognition: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      region: process.env.AWS_REGION || "us-east-1",
    },
    azureCognitiveServices: {
      apiKey: process.env.AZURE_COGNITIVE_SERVICE_KEY || "",
      endpoint: process.env.AZURE_COGNITIVE_SERVICE_ENDPOINT || "",
    },
  },
  crm: {
    salesforce: {
      clientId: process.env.SALESFORCE_CLIENT_ID || "",
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET || "",
      redirectUri: process.env.SALESFORCE_REDIRECT_URI || "",
      instanceUrl: process.env.SALESFORCE_INSTANCE_URL || "",
      securityToken: process.env.SALESFORCE_SECURITY_TOKEN || "",
    },
    hubspot: {
      apiKey: process.env.HUBSPOT_API_KEY || "",
      portalId: process.env.HUBSPOT_PORTAL_ID || "",
    },
    zohoCrm: {
      clientId: process.env.ZOHO_CLIENT_ID || "",
      clientSecret: process.env.ZOHO_CLIENT_SECRET || "",
      redirectUri: process.env.ZOHO_REDIRECT_URI || "",
    },
  },
  erp: {
    sap: {
      apiKey: process.env.SAP_API_KEY || "",
      systemId: process.env.SAP_SYSTEM_ID || "",
      baseUrl: process.env.SAP_BASE_URL || "",
    },
    netsuite: {
      consumerKey: process.env.NETSUITE_CONSUMER_KEY || "",
      consumerSecret: process.env.NETSUITE_CONSUMER_SECRET || "",
      tokenId: process.env.NETSUITE_TOKEN_ID || "",
      tokenSecret: process.env.NETSUITE_TOKEN_SECRET || "",
      accountId: process.env.NETSUITE_ACCOUNT_ID || "",
    },
  },
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || "",
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
      webhookSecret: process.env.PAYPAL_WEBHOOK_SECRET || "",
    },
    braintree: {
      merchantId: process.env.BRAINTREE_MERCHANT_ID || "",
      publicKey: process.env.BRAINTREE_PUBLIC_KEY || "",
      privateKey: process.env.BRAINTREE_PRIVATE_KEY || "",
      environment: process.env.BRAINTREE_ENVIRONMENT || "sandbox",
    },
    paddle: {
      apiKey: process.env.PADDLE_API_KEY || "",
      vendorId: process.env.PADDLE_VENDOR_ID || "",
      publicKey: process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY || "",
    },
  },
  communication: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || "",
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || "",
    },
    mailchimp: {
      apiKey: process.env.MAILCHIMP_API_KEY || "",
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX || "", // e.g., us1.api.mailchimp.com
      audienceId: process.env.MAILCHIMP_AUDIENCE_ID || "",
    },
    slack: {
      botToken: process.env.SLACK_BOT_TOKEN || "",
      signingSecret: process.env.SLACK_SIGNING_SECRET || "",
      appId: process.env.SLACK_APP_ID || "",
      clientId: process.env.SLACK_CLIENT_ID || "",
      clientSecret: process.env.SLACK_CLIENT_SECRET || "",
    },
    intercom: {
      accessToken: process.env.INTERCOM_ACCESS_TOKEN || "",
      appId: process.env.INTERCOM_APP_ID || "",
    },
    whatsAppBusiness: {
      token: process.env.WHATSAPP_BUSINESS_TOKEN || "",
      phoneId: process.env.WHATSAPP_PHONE_ID || "",
      accountId: process.env.WHATSAPP_ACCOUNT_ID || "",
    },
  },
  cloudStorage: {
    awsS3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "", // Shared with Rekognition example
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "", // Shared
      region: process.env.AWS_REGION || "us-east-1", // Shared
      bucketName: process.env.AWS_S3_BUCKET_NAME || "",
      cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN || "",
    },
    googleCloudStorage: {
      projectId: process.env.GCP_PROJECT_ID || "",
      bucketName: process.env.GCP_BUCKET_NAME || "",
      serviceAccountKeyPath: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH || "", // Path to JSON key file
      clientEmail: process.env.GCP_CLIENT_EMAIL || "",
      privateKey: process.env.GCP_PRIVATE_KEY || "",
    },
    azureBlobStorage: {
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || "",
      accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || "",
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || "",
    },
  },
  identityAuth: {
    auth0: {
      domain: process.env.AUTH0_DOMAIN || "",
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
      audience: process.env.AUTH0_AUDIENCE || "",
      callbackUrl: process.env.AUTH0_CALLBACK_URL || "",
    },
    okta: {
      orgUrl: process.env.OKTA_ORG_URL || "",
      apiToken: process.env.OKTA_API_TOKEN || "",
      clientId: process.env.OKTA_CLIENT_ID || "",
      clientSecret: process.env.OKTA_CLIENT_SECRET || "",
    },
    firebaseAuth: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
    },
    azureAd: {
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
      authority: process.env.AZURE_AD_AUTHORITY || "",
    },
  },
  analyticsMonitoring: {
    googleAnalytics4: {
      measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
      apiSecret: process.env.GA4_API_SECRET || "",
    },
    mixpanel: {
      projectToken: process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN || "",
      apiSecret: process.env.MIXPANEL_API_SECRET || "",
    },
    amplitude: {
      apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || "",
      secretKey: process.env.AMPLITUDE_SECRET_KEY || "",
    },
    datadog: {
      apiKey: process.env.DATADOG_API_KEY || "",
      appKey: process.env.DATADOG_APP_KEY || "",
      site: process.env.DATADOG_SITE || "datadoghq.com",
    },
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "production",
    },
    logrocket: {
      appId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || "",
    },
    newRelic: {
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY || "",
      appName: process.env.NEW_RELIC_APP_NAME || "",
      browserAgent: process.env.NEXT_PUBLIC_NEW_RELIC_BROWSER_AGENT || "",
    },
  },
  database: { // Typically backend controlled, but client might need connection info for dev tools or specific queries
    postgresql: {
      host: process.env.DB_HOST || "",
      port: process.env.DB_PORT || "5432",
      user: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "",
      ssl: process.env.DB_SSL === "true",
    },
    mongodbAtlas: {
      uri: process.env.MONGODB_URI || "",
      database: process.env.MONGODB_DATABASE || "",
    },
    redis: {
      host: process.env.REDIS_HOST || "",
      port: process.env.REDIS_PORT || "6379",
      password: process.env.REDIS_PASSWORD || "",
      tls: process.env.REDIS_TLS === "true",
    },
  },
  documentManagement: {
    googleDrive: {
      apiKey: process.env.GOOGLE_DRIVE_API_KEY || "",
      clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI || "",
    },
    microsoftOneDrive: {
      clientId: process.env.ONEDRIVE_CLIENT_ID || "",
      clientSecret: process.env.ONEDRIVE_CLIENT_SECRET || "",
      redirectUri: process.env.ONEDRIVE_REDIRECT_URI || "",
    },
    docusign: {
      integratorKey: process.env.DOCUSIGN_INTEGRATOR_KEY || "",
      userId: process.env.DOCUSIGN_USER_ID || "",
      privateKey: process.env.DOCUSIGN_PRIVATE_KEY || "", // Can be file path or actual key string
      baseUrl: process.env.DOCUSIGN_BASE_URL || "https://demo.docusign.net/restapi",
    },
  },
  geospatial: {
    googleMaps: {
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    },
    mapbox: {
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
      styleUrl: process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/streets-v11",
    },
  },
  devopsCICD: { // Primarily backend/CI/CD, but secrets might be stored or used by related client tools
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      accessToken: process.env.GITHUB_ACCESS_TOKEN || "", // For API calls
    },
    jira: {
      apiToken: process.env.JIRA_API_TOKEN || "",
      host: process.env.JIRA_HOST || "",
      userEmail: process.env.JIRA_USER_EMAIL || "",
    },
    gitlab: {
      privateToken: process.env.GITLAB_PRIVATE_TOKEN || "",
      baseUrl: process.env.GITLAB_BASE_URL || "",
    },
  },
  webhooksIntegrations: {
    zapier: {
      webhookSecret: process.env.ZAPIER_WEBHOOK_SECRET || "",
    },
    makeCom: { // formerly Integromat
      webhookSecret: process.env.MAKE_WEBHOOK_SECRET || "",
      apiKey: process.env.MAKE_API_KEY || "",
    },
  },
  security: {
    hashicorpVault: {
      address: process.env.VAULT_ADDR || "",
      token: process.env.VAULT_TOKEN || "", // Often short-lived, fetched dynamically
      roleId: process.env.VAULT_ROLE_ID || "",
      secretId: process.env.VAULT_SECRET_ID || "",
    },
    awsSecretsManager: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      region: process.env.AWS_REGION || "us-east-1",
      secretId: process.env.AWS_SECRETS_MANAGER_SECRET_ID || "",
    },
    googleSecretManager: {
      projectId: process.env.GCP_PROJECT_ID || "",
      serviceAccountKeyPath: process.env.GCP_SERVICE_ACCOUNT_KEY_PATH || "",
      secretName: process.env.GCP_SECRET_MANAGER_SECRET_NAME || "",
    },
    duoSecurity: {
      integrationKey: process.env.DUO_IKEY || "",
      secretKey: process.env.DUO_SKEY || "",
      apiHost: process.env.DUO_HOST || "",
    },
    cloudflare: {
      apiKey: process.env.CLOUDFLARE_API_KEY || "",
      email: process.env.CLOUDFLARE_EMAIL || "",
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
      zoneId: process.env.CLOUDFLARE_ZONE_ID || "",
    },
    onelogin: {
      clientId: process.env.ONELOGIN_CLIENT_ID || "",
      clientSecret: process.env.ONELOGIN_CLIENT_SECRET || "",
      subdomain: process.env.ONELOGIN_SUBDOMAIN || "",
    },
  },
  eCommerce: {
    shopify: {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || "",
      storeName: process.env.SHOPIFY_STORE_NAME || "", // e.g., mystore.myshopify.com
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
    },
    magento: {
      consumerKey: process.env.MAGENTO_CONSUMER_KEY || "",
      consumerSecret: process.env.MAGENTO_CONSUMER_SECRET || "",
      accessToken: process.env.MAGENTO_ACCESS_TOKEN || "",
      accessTokenSecret: process.env.MAGENTO_ACCESS_TOKEN_SECRET || "",
      baseUrl: process.env.MAGENTO_BASE_URL || "",
    },
  },
  videoConferencing: {
    zoom: {
      apiKey: process.env.ZOOM_API_KEY || "",
      apiSecret: process.env.ZOOM_API_SECRET || "",
      jwtToken: process.env.ZOOM_JWT_TOKEN || "", // For older API versions
      oauthClientId: process.env.ZOOM_OAUTH_CLIENT_ID || "",
      oauthClientSecret: process.env.ZOOM_OAUTH_CLIENT_SECRET || "",
    },
    googleMeet: {
      apiKey: process.env.GOOGLE_MEET_API_KEY || "", // Uses Google Calendar API
      clientId: process.env.GOOGLE_MEET_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_MEET_CLIENT_SECRET || "",
    },
    microsoftTeams: {
      clientId: process.env.TEAMS_CLIENT_ID || "",
      clientSecret: process.env.TEAMS_CLIENT_SECRET || "",
      tenantId: process.env.TEAMS_TENANT_ID || "",
    },
  },
  crmMarketingAutomation: {
    pardot: {
      clientKey: process.env.PARDOT_CLIENT_KEY || "",
      clientSecret: process.env.PARDOT_CLIENT_SECRET || "",
      businessUnitId: process.env.PARDOT_BUSINESS_UNIT_ID || "",
    },
    activeCampaign: {
      apiKey: process.env.ACTIVECAMPAIGN_API_KEY || "",
      apiUrl: process.env.ACTIVECAMPAIGN_API_URL || "",
    },
  },
  // This structure can easily extend to hundreds of services by adding more categories and services.
  // The goal is to demonstrate the pattern of integration and secret management.
};

// Initialize Gemini AI (client-side for direct integration, but often proxied via backend for security)
const genAI = externalServicesConfig.ai.gemini.apiKey
  ? new GoogleGenerativeAI(externalServicesConfig.ai.gemini.apiKey)
  : null;
const geminiModel = genAI
  ? genAI.getGenerativeModel({ model: externalServicesConfig.ai.gemini.modelName })
  : null;

// --- Interface Definitions for Expanded Form and Data ---
interface FormValues {
  userOnboardingFlowId?: string; // For editing existing flows
  flowAlias?: FlowAliasOption;
  counterparty?: CounterpartyOption;
  assignedUser?: UserOption; // Who is responsible for this onboarding
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate: string;
  endDate?: string;
  description?: string;
  autoApproveSteps: boolean;
  requiredDocuments: string[]; // e.g., ["KYC", "NDA", "TermsOfService"]
  // AI-generated suggestions
  aiSuggestedSteps?: string[];
  aiSentiment?: string;
  // Audit and workflow related fields
  integrationPayload?: object; // For custom integration data
  tags: string[];
}

interface UniversalOnboardingPlatformProps {
  initialOnboardingFlowId?: string; // Optional ID to load an existing flow for editing
  onSuccess: (userOnboardingFlow: UserOnboardingFlow) => void;
  onCancel?: () => void;
}

// --- Main Application Component: Universal Onboarding & Lifecycle Management Platform (EOLMP) ---
function UniversalOnboardingPlatform({
  initialOnboardingFlowId,
  onSuccess,
  onCancel,
}: UniversalOnboardingPlatformProps) {
  const flashError = useErrorBanner();
  const showSuccessToast = useSuccessToast();
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(!!initialOnboardingFlowId);
  const [onboardingFlowData, setOnboardingFlowData] = useState<UserOnboardingFlow | null>(null);

  // GraphQL Mutations and Queries
  const [createUserOnboardingFlowMutation, { loading: createLoading }] =
    useCreateUserOnboardingFlowMutation();
  const [updateUserOnboardingFlowMutation, { loading: updateLoading }] =
    useUpdateUserOnboardingFlowMutation();

  const { data: queryData, loading: queryLoading, error: queryError } = useGetUserOnboardingFlowQuery({
    variables: { id: initialOnboardingFlowId! },
    skip: !initialOnboardingFlowId,
    fetchPolicy: "network-only", // Always get fresh data
    onCompleted: (data) => {
      if (data.userOnboardingFlow) {
        setOnboardingFlowData(data.userOnboardingFlow);
        formikRef.current?.setValues({
          userOnboardingFlowId: data.userOnboardingFlow.id,
          flowAlias: { label: data.userOnboardingFlow.flowAlias, value: data.userOnboardingFlow.flowAlias },
          // The next two lines are placeholders. In a real app, these would fetch full objects
          // based on `counterpartyId` and `assignedToUserId` to populate the async select components.
          counterparty: data.userOnboardingFlow.counterpartyId ? { label: `Counterparty ${data.userOnboardingFlow.counterpartyId}`, value: data.userOnboardingFlow.counterpartyId } : undefined,
          assignedUser: data.userOnboardingFlow.assignedToUserId ? { label: `User ${data.userOnboardingFlow.assignedToUserId}`, value: data.userOnboardingFlow.assignedToUserId } : undefined,
          status: data.userOnboardingFlow.status as FormValues["status"],
          priority: data.userOnboardingFlow.priority as FormValues["priority"],
          startDate: new Date(data.userOnboardingFlow.startDate).toISOString().split('T')[0],
          endDate: data.userOnboardingFlow.endDate ? new Date(data.userOnboardingFlow.endDate).toISOString().split('T')[0] : undefined,
          description: data.userOnboardingFlow.description || "",
          autoApproveSteps: data.userOnboardingFlow.autoApproveSteps || false,
          requiredDocuments: data.userOnboardingFlow.requiredDocuments || [],
          tags: data.userOnboardingFlow.tags || [],
          aiSuggestedSteps: data.userOnboardingFlow.aiSuggestedSteps || [],
          aiSentiment: data.userOnboardingFlow.aiSentiment || "",
          integrationPayload: {}, // Assuming this is not loaded or handled elsewhere for security
        }, false);
      }
    },
    onError: (err) => {
      flashError(i18n.t("errors.failedToLoadOnboardingFlow", { error: err.message }));
      logAuditEvent("ERROR", "Failed to load onboarding flow for editing", { id: initialOnboardingFlowId, error: err.message });
    },
  });

  // Feature Flags for modularity
  const enableAISuggestions = useFeatureFlag("enableAISuggestions");
  const enableWorkflowBuilder = useFeatureFlag("enableWorkflowBuilder");
  const enableAdvancedAnalytics = useFeatureFlag("enableAdvancedAnalytics");
  const enableMultiLanguageSupport = useFeatureFlag("enableMultiLanguageSupport"); // Placeholder, assumed active via i18n utility

  useEffect(() => {
    if (initialOnboardingFlowId) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      formikRef.current?.resetForm();
    }
  }, [initialOnboardingFlowId]);

  const initialValues: FormValues = {
    flowAlias: undefined,
    counterparty: undefined,
    assignedUser: undefined,
    status: "PENDING",
    priority: "MEDIUM",
    startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    endDate: undefined,
    description: "",
    autoApproveSteps: false,
    requiredDocuments: ["KYC", "NDA"],
    tags: [],
    aiSuggestedSteps: [],
    aiSentiment: "",
    integrationPayload: {}, // Default empty object for integrations
  };

  const validationSchema = yup.object().shape({
    flowAlias: yup.object().required(i18n.t("validation.flowAliasRequired")),
    counterparty: yup.object().nullable(),
    assignedUser: yup.object().nullable(),
    status: yup.string().oneOf(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"]).required(i18n.t("validation.statusRequired")),
    priority: yup.string().oneOf(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).required(i18n.t("validation.priorityRequired")),
    startDate: yup.date().required(i18n.t("validation.startDateRequired")),
    endDate: yup.date().nullable().min(yup.ref('startDate'), i18n.t("validation.endDateAfterStartDate")),
    description: yup.string().nullable().max(1000, i18n.t("validation.descriptionTooLong")),
    autoApproveSteps: yup.boolean().required(),
    requiredDocuments: yup.array().of(yup.string()).min(1, i18n.t("validation.minOneDocument")),
    tags: yup.array().of(yup.string()).nullable(),
  });

  // Gemini AI Integration for Onboarding Step Suggestions
  const getGeminiSuggestions = useCallback(async (currentDescription: string, flowAliasLabel?: string) => {
    if (!geminiModel) {
      flashError(i18n.t("errors.geminiNotConfigured"));
      return;
    }
    setGeminiLoading(true);
    setAiSuggestions([]);
    try {
      const prompt = `Based on the following onboarding flow alias "${flowAliasLabel || "General"}" and description: "${currentDescription || "A new user onboarding process."}", suggest 3-5 key steps or tasks to ensure a smooth and comprehensive enterprise-level onboarding experience. Focus on compliance, security, and integration with external systems. Format as a comma-separated list of short phrases.`;
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const suggestions = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
      setAiSuggestions(suggestions);
      formikRef.current?.setFieldValue('aiSuggestedSteps', suggestions); // Update formik state
      logAuditEvent("INFO", "Gemini AI generated onboarding suggestions", { prompt, suggestions });
      trackEvent("AI_Suggestions_Generated", { flowAlias: flowAliasLabel });
    } catch (error: any) {
      flashError(i18n.t("errors.geminiSuggestionFailed", { error: error.message }));
      logAuditEvent("ERROR", "Gemini AI suggestion failed", { error: error.message });
    } finally {
      setGeminiLoading(false);
    }
  }, [flashError]);

  const handleSubmit = async (formValues: FormValues) => {
    // 1. Pre-submission Security and Compliance Checks
    const policyCheckResult = validateSchemaAgainstPolicy("UserOnboardingFlow", formValues);
    if (!policyCheckResult.isValid) {
      flashError(i18n.t("errors.securityPolicyViolation", { reasons: policyCheckResult.reasons.join(", ") }));
      logAuditEvent("SECURITY_ALERT", "Onboarding flow creation/update blocked due to policy violation", { formValues, reasons: policyCheckResult.reasons });
      return;
    }

    const { flowAlias, counterparty, assignedUser, ...rest } = formValues;

    if (!flowAlias) {
      flashError(i18n.t("validation.flowAliasRequired"));
      return;
    }

    try {
      if (isEditMode && formValues.userOnboardingFlowId) {
        // Update existing flow
        await updateUserOnboardingFlowMutation({
          variables: {
            input: {
              id: formValues.userOnboardingFlowId,
              input: {
                flowAlias: flowAlias.value,
                counterpartyId: counterparty?.value,
                assignedToUserId: assignedUser?.value,
                ...rest,
                aiSuggestedSteps: aiSuggestions, // Persist AI suggestions
              },
            },
          },
          onCompleted: (data) => {
            const userOnboardingFlow = data.updateUserOnboardingFlow?.userOnboardingFlow;
            if (!userOnboardingFlow) {
              const errorMsg = data.updateUserOnboardingFlow?.errors.join(",");
              flashError(errorMsg || i18n.t("errors.failedToUpdateFlow"));
              logAuditEvent("ERROR", "Failed to update user onboarding flow", { id: formValues.userOnboardingFlowId, errors: errorMsg });
            } else {
              onSuccess(userOnboardingFlow);
              showSuccessToast(i18n.t("success.flowUpdated"));
              logAuditEvent("INFO", "User onboarding flow updated", { flowId: userOnboardingFlow.id });
              sendNotification("admin", i18n.t("notifications.flowUpdated", { id: userOnboardingFlow.id }));
              trackEvent("Onboarding_Flow_Updated", { flowId: userOnboardingFlow.id, status: userOnboardingFlow.status });
            }
          },
          onError: (err) => {
            flashError(i18n.t("errors.graphQLError", { error: err.message }));
            logAuditEvent("ERROR", "GraphQL error updating flow", { error: err.message });
          },
        });
      } else {
        // Create new flow
        await createUserOnboardingFlowMutation({
          variables: {
            input: {
              input: {
                flowAlias: flowAlias.value,
                counterpartyId: counterparty?.value,
                assignedToUserId: assignedUser?.value,
                ...rest,
                aiSuggestedSteps: aiSuggestions, // Persist AI suggestions
              },
            },
          },
          onCompleted: (data) => {
            const userOnboardingFlow = data.createUserOnboardingFlow?.userOnboardingFlow;
            if (!userOnboardingFlow) {
              const errorMsg = data.createUserOnboardingFlow?.errors.join(",");
              flashError(errorMsg || i18n.t("errors.failedToCreateFlow"));
              logAuditEvent("ERROR", "Failed to create user onboarding flow", { errors: errorMsg });
            } else {
              onSuccess(userOnboardingFlow);
              showSuccessToast(i18n.t("success.flowCreated"));
              logAuditEvent("INFO", "User onboarding flow created", { flowId: userOnboardingFlow.id });
              sendNotification("admin", i18n.t("notifications.flowCreated", { id: userOnboardingFlow.id }));
              trackEvent("Onboarding_Flow_Created", { flowId: userOnboardingFlow.id, status: userOnboardingFlow.status });

              // Trigger external integrations post-creation
              triggerPostCreationIntegrations(userOnboardingFlow);
            }
          },
          onError: (err) => {
            flashError(i18n.t("errors.graphQLError", { error: err.message }));
            logAuditEvent("ERROR", "GraphQL error creating flow", { error: err.message });
          },
        });
      }
    } catch (error: any) {
      flashError(error.message || i18n.t("errors.unexpectedError"));
      logAuditEvent("ERROR", "Unexpected error during flow submission", { error: error.message });
    }
  };

  const triggerPostCreationIntegrations = async (flow: UserOnboardingFlow) => {
    // Example: Trigger a Slack notification (this would typically be a serverless function or backend API call)
    try {
      await fetch('/api/integrations/slack-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: '#onboarding-alerts',
          message: `New Onboarding Flow Created: *${flow.flowAlias}* for Counterparty ID: *${flow.counterpartyId}*. Status: *${flow.status}*. View: ${window.location.origin}/dashboard/onboarding/${flow.id}`,
        }),
      });
      logAuditEvent("INFO", "Slack notification sent for new flow", { flowId: flow.id });
    } catch (error) {
      logAuditEvent("ERROR", "Failed to send Slack notification", { flowId: flow.id, error });
    }

    // Example: Create a task in Jira (also a backend API call)
    try {
      await fetch('/api/integrations/jira-create-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: `Onboard ${flow.flowAlias} - ${flow.counterpartyId}`,
          description: `New onboarding flow requires attention. Details: ${window.location.origin}/dashboard/onboarding/${flow.id}`,
          priority: flow.priority === "CRITICAL" ? "Highest" : "Medium",
          assignee: flow.assignedToUserId, // Map to Jira user ID from our system
        }),
      });
      logAuditEvent("INFO", "Jira task created for new flow", { flowId: flow.id });
    } catch (error) {
      logAuditEvent("ERROR", "Failed to create Jira task", { flowId: flow.id, error });
    }

    // Other integrations (CRM update, document generation via DocuSign, payment gateway initiation for setup fees, etc.)
    // would follow a similar pattern, often orchestrated by a robust backend service or a dedicated workflow engine.
  };

  if (isEditMode && queryLoading) {
    return <LoadingSpinner message={i18n.t("loading.loadingOnboardingFlow")} />;
  }

  if (isEditMode && queryError) {
    return <ErrorAlert message={i18n.t("errors.failedToLoadOnboardingFlow", { error: queryError.message })} />;
  }

  const isLoading = createLoading || updateLoading || geminiLoading;

  return (
    <Formik
      initialValues={onboardingFlowData ? { // If editing, use loaded data for initial values
        userOnboardingFlowId: onboardingFlowData.id,
        flowAlias: { label: onboardingFlowData.flowAlias, value: onboardingFlowData.flowAlias },
        // These will be correctly populated by the onCompleted handler
        counterparty: onboardingFlowData.counterpartyId ? { label: `Counterparty ${onboardingFlowData.counterpartyId}`, value: onboardingFlowData.counterpartyId } : undefined,
        assignedUser: onboardingFlowData.assignedToUserId ? { label: `User ${onboardingFlowData.assignedToUserId}`, value: onboardingFlowData.assignedToUserId } : undefined,
        status: onboardingFlowData.status as FormValues["status"],
        priority: onboardingFlowData.priority as FormValues["priority"],
        startDate: new Date(onboardingFlowData.startDate).toISOString().split('T')[0],
        endDate: onboardingFlowData.endDate ? new Date(onboardingFlowData.endDate).toISOString().split('T')[0] : undefined,
        description: onboardingFlowData.description || "",
        autoApproveSteps: onboardingFlowData.autoApproveSteps || false,
        requiredDocuments: onboardingFlowData.requiredDocuments || [],
        tags: onboardingFlowData.tags || [],
        aiSuggestedSteps: onboardingFlowData.aiSuggestedSteps || [],
        aiSentiment: onboardingFlowData.aiSentiment || "",
        integrationPayload: {}, // Assuming this is not loaded or handled elsewhere for security
      } : initialValues}
      validateOnMount
      onSubmit={handleSubmit}
      innerRef={formikRef}
      validationSchema={validationSchema}
      enableReinitialize={true} // Important for edit mode to update form when data loads
    >
      {({ isSubmitting, isValid, values, setFieldValue }) => (
        <Form className="flex flex-col space-y-8 p-8 bg-white shadow-xl rounded-lg max-w-7xl mx-auto my-8">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {isEditMode ? i18n.t("titles.editOnboardingFlow", { id: initialOnboardingFlowId }) : i18n.t("titles.createNewOnboardingFlow")}
            </h1>
            <div className="flex space-x-2">
              <Button buttonType="secondary" onClick={onCancel} disabled={isSubmitting}>
                {i18n.t("actions.cancel")}
              </Button>
              <Button
                buttonType="primary"
                isSubmit
                disabled={!isValid || isSubmitting || isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : (isEditMode ? i18n.t("actions.updateFlow") : i18n.t("actions.createFlow"))}
              </Button>
            </div>
          </div>

          <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
            <Tab id="overview" label={i18n.t("tabs.overview")} />
            <Tab id="ai-insights" label={i18n.t("tabs.aiInsights")} disabled={!enableAISuggestions} />
            <Tab id="workflow" label={i18n.t("tabs.workflow")} disabled={!enableWorkflowBuilder} />
            <Tab id="analytics" label={i18n.t("tabs.analytics")} disabled={!enableAdvancedAnalytics} />
            <Tab id="integrations" label={i18n.t("tabs.integrations")} />
            <Tab id="settings" label={i18n.t("tabs.settings")} />
          </Tabs>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldGroup>
                <Label htmlFor="flowAlias">{i18n.t("labels.flowAlias")}</Label>
                <FormikFlowAliasAsyncSelect name="flowAlias" id="flowAlias" placeholder={i18n.t("placeholders.selectFlowAlias")} />
                <FormikErrorMessage name="flowAlias" />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="counterparty">{i18n.t("labels.counterparty")}</Label>
                <FormikCounterpartyAsyncSelect name="counterparty" id="counterparty" placeholder={i18n.t("placeholders.selectCounterparty")} />
                <FormikErrorMessage name="counterparty" />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="assignedUser">{i18n.t("labels.assignedUser")}</Label>
                <FormikUserAsyncSelect name="assignedUser" id="assignedUser" placeholder={i18n.t("placeholders.assignUser")} />
                <FormikErrorMessage name="assignedUser" />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="status">{i18n.t("labels.status")}</Label>
                <Field as={Select} name="status" id="status" className="form-select mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                  <option value="PENDING">{i18n.t("statuses.pending")}</option>
                  <option value="IN_PROGRESS">{i18n.t("statuses.inProgress")}</option>
                  <option value="COMPLETED">{i18n.t("statuses.completed")}</option>
                  <option value="BLOCKED">{i18n.t("statuses.blocked")}</option>
                  <option value="CANCELLED">{i18n.t("statuses.cancelled")}</option>
                </Field>
                <FormikErrorMessage name="status" />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="priority">{i18n.t("labels.priority")}</Label>
                <Field as={Select} name="priority" id="priority" className="form-select mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                  <option value="LOW">{i18n.t("priorities.low")}</option>
                  <option value="MEDIUM">{i18n.t("priorities.medium")}</option>
                  <option value="HIGH">{i18n.t("priorities.high")}</option>
                  <option value="CRITICAL">{i18n.t("priorities.critical")}</option>
                </Field>
                <FormikErrorMessage name="priority" />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="startDate">{i18n.t("labels.startDate")}</Label>
                <Field as={Input} type="date" name="startDate" id="startDate" className="form-input mt-1 block w-full" />
                <FormikErrorMessage name="startDate" />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="endDate">{i18n.t("labels.endDate")}</Label>
                <Field as={Input} type="date" name="endDate" id="endDate" className="form-input mt-1 block w-full" />
                <FormikErrorMessage name="endDate" />
              </FieldGroup>

              <FieldGroup className="md:col-span-2">
                <Label htmlFor="description">{i18n.t("labels.description")}</Label>
                <Field as={Textarea} name="description" id="description" rows={4} placeholder={i18n.t("placeholders.flowDescription")} className="form-textarea mt-1 block w-full" />
                <FormikErrorMessage name="description" />
              </FieldGroup>

              <FieldGroup className="md:col-span-2">
                <Label htmlFor="requiredDocuments">{i18n.t("labels.requiredDocuments")}</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["KYC", "NDA", "TermsOfService", "BusinessLicense", "FinancialStatements"].map(doc => (
                    <label key={doc} className="inline-flex items-center">
                      <Field type="checkbox" name="requiredDocuments" value={doc} as={Checkbox} />
                      <span className="ml-2 text-sm text-gray-700">{doc}</span>
                    </label>
                  ))}
                </div>
                <FormikErrorMessage name="requiredDocuments" />
              </FieldGroup>

              <FieldGroup className="md:col-span-2">
                <Label htmlFor="tags">{i18n.t("labels.tags")}</Label>
                <Field
                  name="tags"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ? field.value.join(", ") : ""}
                      onChange={(e) => setFieldValue("tags", e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0))}
                      placeholder={i18n.t("placeholders.enterTags")}
                      className="form-input mt-1 block w-full"
                    />
                  )}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {values.tags?.map(tag => (
                    <Badge key={tag} className="bg-blue-100 text-blue-800">{tag}</Badge>
                  ))}
                </div>
                <FormikErrorMessage name="tags" />
              </FieldGroup>
            </div>
          )}

          {enableAISuggestions && activeTab === "ai-insights" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">{i18n.t("aiInsights.title")}</h2>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  onClick={() => getGeminiSuggestions(values.description || "", values.flowAlias?.label)}
                  disabled={geminiLoading || !geminiModel || !values.flowAlias?.value}
                  buttonType="secondary"
                >
                  {geminiLoading ? <LoadingSpinner size="sm" /> : i18n.t("aiInsights.generateSuggestions")}
                </Button>
                {!geminiModel && <ErrorAlert message={i18n.t("aiInsights.geminiDisabled")} />}
              </div>

              {geminiLoading && <ProgressBar value={50} label={i18n.t("aiInsights.generating")} />}
              {aiSuggestions.length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-blue-800">{i18n.t("aiInsights.suggestedSteps")}</h3>
                  <ul className="list-disc list-inside mt-2 text-blue-700">
                    {aiSuggestions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-blue-600">{i18n.t("aiInsights.aiDisclaimer")}</p>
                </div>
              )}

              <FieldGroup>
                <Label htmlFor="aiSentiment">{i18n.t("labels.aiSentiment")}</Label>
                <Field as={Input} name="aiSentiment" id="aiSentiment" readOnly className="form-input mt-1 block w-full bg-gray-50 cursor-not-allowed" />
                <p className="text-sm text-gray-500 mt-1">{i18n.t("aiInsights.sentimentAnalysisNote")}</p>
              </FieldGroup>
            </div>
          )}

          {enableWorkflowBuilder && activeTab === "workflow" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">{i18n.t("workflow.title")}</h2>
              <p className="text-gray-600">{i18n.t("workflow.description")}</p>
              <Accordion>
                <AccordionItem title={i18n.t("workflow.stepAutomation")}>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <FieldGroup>
                      <Label htmlFor="autoApproveSteps" className="flex items-center cursor-pointer">
                        <Field as={Switch} name="autoApproveSteps" id="autoApproveSteps" />
                        <span className="ml-2 text-sm font-medium text-gray-900">{i18n.t("workflow.autoApproveLabel")}</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{i18n.t("workflow.autoApproveHint")}</p>
                    </FieldGroup>

                    <h3 className="text-md font-medium text-gray-700 mt-4">{i18n.t("workflow.conditionalLogic")}</h3>
                    <p className="text-sm text-gray-500">{i18n.t("workflow.conditionalLogicHint")}</p>
                    {/* Placeholder for a visual workflow builder */}
                    <div className="border border-dashed border-gray-300 p-6 rounded-md mt-4 text-center text-gray-500 h-48 flex items-center justify-center">
                      {i18n.t("workflow.dragDropBuilderPlaceholder")}
                    </div>
                  </div>
                </AccordionItem>
                <AccordionItem title={i18n.t("workflow.externalTriggers")}>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-600 mb-4">{i18n.t("workflow.externalTriggersDescription")}</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>{i18n.t("workflow.slackNotification")}</li>
                      <li>{i18n.t("workflow.crmUpdate")}</li>
                      <li>{i18n.t("workflow.docuSignAgreement")}</li>
                      <li>{i18n.t("workflow.jiraTicket")}</li>
                    </ul>
                    <Button buttonType="link" className="mt-4">{i18n.t("workflow.manageWebhooks")}</Button>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {enableAdvancedAnalytics && activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">{i18n.t("analytics.title")}</h2>
              <p className="text-gray-600">{i18n.t("analytics.description")}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-700">{i18n.t("analytics.completionRate")}</h3>
                  <div className="text-4xl font-bold text-green-600 mt-2">85%</div>
                  <p className="text-sm text-gray-500">{i18n.t("analytics.averageTime")}: 3 {i18n.t("timeUnits.days")}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-700">{i18n.t("analytics.bottlenecks")}</h3>
                  <ul className="list-disc list-inside mt-2 text-red-600">
                    <li>{i18n.t("analytics.documentReview")}</li>
                    <li>{i18n.t("analytics.paymentVerification")}</li>
                  </ul>
                  <Button buttonType="link" className="mt-4">{i18n.t("analytics.viewFullDashboard")}</Button>
                </div>
              </div>
              <div className="border border-dashed border-gray-300 p-6 rounded-md mt-4 text-center text-gray-500 h-64 flex items-center justify-center">
                {i18n.t("analytics.interactiveChartsPlaceholder")}
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">{i18n.t("integrations.title")}</h2>
              <p className="text-gray-600">{i18n.t("integrations.description")}</p>
              <Accordion>
                {Object.entries(externalServicesConfig).map(([category, services]) => (
                  <AccordionItem key={category} title={i18n.t(`integrations.categories.${category}`)}>
                    <div className="p-4 bg-gray-50 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(services).map(([serviceName, serviceConfig]) => (
                        <div key={serviceName} className="border p-3 rounded-md bg-white shadow-sm">
                          <h4 className="font-semibold text-gray-800 capitalize">{serviceName.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <p className="text-sm text-gray-600">{i18n.t(`integrations.servicePurpose.${serviceName}`, `Purpose for ${serviceName}`)}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <strong>{i18n.t("integrations.requiredSecrets")}:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              {Object.keys(serviceConfig).map(key => (
                                <li key={`${serviceName}-${key}`}>{key} (<code>{`process.env.${key.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '').replace(/(\.)/g, '_').replace(/([A-Z][a-z])/g, '_$1').toUpperCase()}`}</code>)</li>
                              ))}
                            </ul>
                            <Badge className={`mt-2 ${Object.values(serviceConfig).every(val => !!val) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {Object.values(serviceConfig).every(val => !!val) ? i18n.t("integrations.status.configured") : i18n.t("integrations.status.missingConfig")}
                            </Badge>
                          </div>
                          <Button buttonType="link" className="mt-3">{i18n.t("integrations.manageConnection")}</Button>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">{i18n.t("settings.title")}</h2>
              <Accordion>
                <AccordionItem title={i18n.t("settings.securityAndCompliance")}>
                  <div className="p-4 bg-gray-50 rounded-md space-y-4">
                    <FieldGroup>
                      <Label htmlFor="twoFactorAuth" className="flex items-center cursor-pointer">
                        <Switch name="twoFactorAuth" id="twoFactorAuth" checked={true} readOnly disabled />
                        <span className="ml-2 text-sm font-medium text-gray-900">{i18n.t("settings.twoFactorAuth")}</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{i18n.t("settings.twoFactorAuthDescription")}</p>
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor="auditLogs" className="flex items-center cursor-pointer">
                        <Switch name="auditLogs" id="auditLogs" checked={true} readOnly disabled />
                        <span className="ml-2 text-sm font-medium text-gray-900">{i18n.t("settings.auditLogs")}</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{i18n.t("settings.auditLogsDescription")}</p>
                      <Button buttonType="link" className="mt-2">{i18n.t("settings.viewAuditLogs")}</Button>
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor="gdprCompliance" className="flex items-center cursor-pointer">
                        <Switch name="gdprCompliance" id="gdprCompliance" checked={true} readOnly disabled />
                        <span className="ml-2 text-sm font-medium text-gray-900">{i18n.t("settings.gdprCompliance")}</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{i18n.t("settings.gdprComplianceDescription")}</p>
                    </FieldGroup>
                  </div>
                </AccordionItem>
                <AccordionItem title={i18n.t("settings.localizationAndLanguage")}>
                  <div className="p-4 bg-gray-50 rounded-md space-y-4">
                    <FieldGroup>
                      <Label htmlFor="appLanguage">{i18n.t("settings.appLanguage")}</Label>
                      <Field as={Select} name="appLanguage" id="appLanguage" className="form-select mt-1 block w-full">
                        <option value="en">{i18n.t("languages.english")}</option>
                        <option value="es">{i18n.t("languages.spanish")}</option>
                        <option value="fr">{i18n.t("languages.french")}</option>
                        {/* More languages can be added */}
                      </Field>
                      <p className="text-sm text-gray-500 mt-1">{i18n.t("settings.appLanguageHint")}</p>
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor="timezone">{i18n.t("settings.timezone")}</Label>
                      <Field as={Select} name="timezone" id="timezone" className="form-select mt-1 block w-full">
                        <option value="UTC">{i18n.t("timezones.utc")}</option>
                        <option value="America/New_York">{i18n.t("timezones.newYork")}</option>
                        <option value="Europe/London">{i18n.t("timezones.london")}</option>
                        {/* More timezones */}
                      </Field>
                    </FieldGroup>
                  </div>
                </AccordionItem>
                <AccordionItem title={i18n.t("settings.featureManagement")}>
                  <div className="p-4 bg-gray-50 rounded-md space-y-4">
                    <p className="text-gray-600 mb-4">{i18n.t("settings.featureManagementDescription")}</p>
                    <FieldGroup>
                      <Label htmlFor="featureAISuggestions" className="flex items-center cursor-pointer">
                        <Switch name="featureAISuggestions" id="featureAISuggestions" checked={enableAISuggestions} readOnly disabled />
                        <span className="ml-2 text-sm font-medium text-gray-900">{i18n.t("settings.aiSuggestions")}</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{i18n.t("settings.aiSuggestionsHint")}</p>
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor="featureWorkflowBuilder" className="flex items-center cursor-pointer">
                        <Switch name="featureWorkflowBuilder" id="featureWorkflowBuilder" checked={enableWorkflowBuilder} readOnly disabled />
                        <span className="ml-2 text-sm font-medium text-gray-900">{i18n.t("settings.workflowBuilder")}</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{i18n.t("settings.workflowBuilderHint")}</p>
                    </FieldGroup>
                    {/* Add more feature toggles as needed */}
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}

export default UniversalOnboardingPlatform;

// --- Mock Implementations for assumed external/common utilities and components ---
// In a real application, these would be proper imports from shared libraries or services.
// These mocks enable the code to be syntactically correct and demonstrate functionality conceptually.

// Mock UI Components (to make the JSX valid for the purpose of this demo)
interface MockButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: "primary" | "secondary" | "link";
  isSubmit?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
const Button: React.FC<MockButtonProps> = ({ children, buttonType = "primary", isSubmit, ...props }) => (
  <button
    type={isSubmit ? "submit" : "button"}
    className={`px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      buttonType === "primary"
        ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
        : buttonType === "secondary"
        ? "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500"
        : "text-blue-600 hover:underline"
    } ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    {...props}
  >
    {children}
  </button>
);

const FieldGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
  <label {...props} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="form-input block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" />
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className="form-textarea block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
);
const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input type="checkbox" {...props} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
);

const LoadingSpinner: React.FC<{ message?: string, size?: "sm" | "md" | "lg" }> = ({ message = "Loading...", size = "md" }) => (
  <div className="flex items-center justify-center">
    <svg className={`animate-spin h-5 w-5 mr-3 text-blue-500 ${size === "sm" ? "h-3 w-3" : size === "lg" ? "h-7 w-7" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {message && <span className="text-gray-700 text-sm">{message}</span>}
  </div>
);

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold">Error!</strong>
    <span className="block sm:inline ml-2">{message}</span>
  </div>
);
const SuccessToast: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-up">
    {message}
  </div>
);

const ProgressBar: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
    {label && <p className="text-xs text-gray-500 mt-1 text-center">{label}</p>}
  </div>
);

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
}

interface TabProps {
  id: string;
  label: string;
  disabled?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, children }) => {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.props.id}
            onClick={() => !tab.props.disabled && onTabChange(tab.props.id)}
            className={`${
              tab.props.id === activeTab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } ${tab.props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            aria-current={tab.props.id === activeTab ? 'page' : undefined}
            disabled={tab.props.disabled}
          >
            {tab.props.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
const Tab: React.FC<TabProps> = () => null; // This is a dummy component used only for type checking children of Tabs.

interface AccordionProps {
  children: React.ReactElement<AccordionItemProps> | React.ReactElement<AccordionItemProps>[];
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ children }) => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const items = React.Children.toArray(children) as React.ReactElement<AccordionItemProps>[];

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <div key={index}>
          <h2 id={`accordion-heading-${index}`}>
            <button
              type="button"
              className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-900 bg-gray-50 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200"
              onClick={() => setOpenItem(openItem === `item-${index}` ? null : `item-${index}`)}
              aria-expanded={openItem === `item-${index}`}
              aria-controls={`accordion-body-${index}`}
            >
              <span>{item.props.title}</span>
              <svg
                className={`w-6 h-6 transform ${openItem === `item-${index}` ? 'rotate-180' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </h2>
          <div
            id={`accordion-body-${index}`}
            className={`transition-all duration-300 ease-in-out overflow-hidden ${openItem === `item-${index}` ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
            aria-labelledby={`accordion-heading-${index}`}
          >
            {item.props.children}
          </div>
        </div>
      ))}
    </div>
  );
};
const AccordionItem: React.FC<AccordionItemProps> = () => null;

const Switch: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ checked, onChange, name, id, ...props }) => (
  <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} className="sr-only peer" {...props} />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  </label>
);

const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, className, ...props }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`} {...props}>
    {children}
  </span>
);

// Mock utility hooks/services
const useSuccessToast = () => {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  return (msg: string) => setMessage(msg);
};

const FormikErrorMessage: React.FC<{ name: string }> = ({ name }) => (
  <Field name={name}>
    {({ meta }: { meta: { touched: boolean; error?: string } }) =>
      meta.touched && meta.error ? (
        <div className="text-red-600 text-sm mt-1">{meta.error}</div>
      ) : null
    }
  </Field>
);

// Mock GraphQL generated components
const useCreateUserOnboardingFlowMutation = () => ([() => Promise.resolve({ data: { createUserOnboardingFlow: { userOnboardingFlow: { id: "new-flow-123", flowAlias: "Default Flow", status: "PENDING", startDate: new Date().toISOString(), tags: [], aiSuggestedSteps: [], counterpartyId: "CUST-MOCK", assignedToUserId: "USER-MOCK", autoApproveSteps: false, requiredDocuments: ["KYC"] }, errors: [] } } }), { loading: false }]);
const useUpdateUserOnboardingFlowMutation = () => ([() => Promise.resolve({ data: { updateUserOnboardingFlow: { userOnboardingFlow: { id: "updated-flow-123", flowAlias: "Updated Flow", status: "IN_PROGRESS", startDate: new Date().toISOString(), tags: [], aiSuggestedSteps: [], counterpartyId: "CUST-MOCK", assignedToUserId: "USER-MOCK", autoApproveSteps: false, requiredDocuments: ["KYC"] }, errors: [] } } }), { loading: false }]);
const useGetUserOnboardingFlowQuery = ({ id, skip }: { id: string; skip: boolean; fetchPolicy?: string; onCompleted?: (data: any) => void; onError?: (error: any) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!skip && id && !data) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setData({
          userOnboardingFlow: {
            id: id,
            flowAlias: "Existing Customer Onboarding",
            counterpartyId: "CUST-001",
            assignedToUserId: "USER-101",
            status: "IN_PROGRESS",
            priority: "HIGH",
            startDate: "2023-10-01",
            endDate: null,
            description: "Onboarding flow for a key enterprise customer, involves custom integrations.",
            autoApproveSteps: false,
            requiredDocuments: ["KYC", "NDA", "CreditCheck"],
            tags: ["enterprise", "critical", "VIP"],
            aiSuggestedSteps: ["Review custom integration requirements", "Schedule welcome call with CSM", "Configure SSO for client"],
            aiSentiment: "Positive",
          },
        });
        setLoading(false);
        // Call the onCompleted callback if provided
        if (id === "existing-flow-456" && !skip) { // Simplified logic for demo
            if (typeof arguments[0].onCompleted === 'function') {
                arguments[0].onCompleted({ userOnboardingFlow: {
                  id: id,
                  flowAlias: "Existing Customer Onboarding",
                  counterpartyId: "CUST-001",
                  assignedToUserId: "USER-101",
                  status: "IN_PROGRESS",
                  priority: "HIGH",
                  startDate: "2023-10-01",
                  endDate: null,
                  description: "Onboarding flow for a key enterprise customer, involves custom integrations.",
                  autoApproveSteps: false,
                  requiredDocuments: ["KYC", "NDA", "CreditCheck"],
                  tags: ["enterprise", "critical", "VIP"],
                  aiSuggestedSteps: ["Review custom integration requirements", "Schedule welcome call with CSM", "Configure SSO for client"],
                  aiSentiment: "Positive",
                }});
            }
        }
      }, 1000);
    }
  }, [id, skip, data]); // Added `id` to dependency array to re-run when initialOnboardingFlowId changes

  return { data, loading, error };
};


// Mock Formik Async Select components
interface MockSelectProps { name: string; id: string; placeholder: string; }
const FormikCounterpartyAsyncSelect: React.FC<MockSelectProps> = ({ name, ...props }) => (
  <Field name={name}>
    {({ field, form }: { field: any; form: any }) => (
      <Select
        {...props}
        value={field.value?.value || ""}
        onChange={(e) => form.setFieldValue(name, { label: e.target.value, value: e.target.value })}
        className="form-select mt-1 block w-full"
      >
        <option value="">{props.placeholder}</option>
        <option value="CitibankCorp">Citibank Corp</option>
        <option value="GlobalFintech">Global Fintech Ltd</option>
      </Select>
    )}
  </Field>
);
const FormikFlowAliasAsyncSelect: React.FC<MockSelectProps> = ({ name, ...props }) => (
  <Field name={name}>
    {({ field, form }: { field: any; form: any }) => (
      <Select
        {...props}
        value={field.value?.value || ""}
        onChange={(e) => form.setFieldValue(name, { label: e.target.value, value: e.target.value })}
        className="form-select mt-1 block w-full"
      >
        <option value="">{props.placeholder}</option>
        <option value="Standard Onboarding">Standard Onboarding</option>
        <option value="VIP Client Onboarding">VIP Client Onboarding</option>
        <option value="Partnership Integration">Partnership Integration</option>
      </Select>
    )}
  </Field>
);
const FormikUserAsyncSelect: React.FC<MockSelectProps> = ({ name, ...props }) => (
  <Field name={name}>
    {({ field, form }: { field: any; form: any }) => (
      <Select
        {...props}
        value={field.value?.value || ""}
        onChange={(e) => form.setFieldValue(name, { label: e.target.value, value: e.target.value })}
        className="form-select mt-1 block w-full"
      >
        <option value="">{props.placeholder}</option>
        <option value="user-jdoe">John Doe</option>
        <option value="user-asmith">Alice Smith</option>
      </Select>
    )}
  </Field>
);

// Mock utility hooks/services
const useErrorBanner = () => (message: string) => {
  console.error("Error Banner:", message);
  // In a real app, this would show a prominent error message at the top of the page.
};

const logAuditEvent = (level: "INFO" | "WARNING" | "ERROR" | "SECURITY_ALERT", message: string, details: object) => {
  console.log(`[AUDIT - ${level}] ${message}`, details);
  // In a real app, this would send data to a dedicated logging/SIEM service (e.g., Splunk, ELK, Datadog Logs).
};

const sendNotification = (recipient: string, message: string) => {
  console.log(`[NOTIFICATION to ${recipient}] ${message}`);
  // In a real app, this would use Twilio, SendGrid, Slack APIs etc.
};

const trackEvent = (eventName: string, properties: object) => {
  console.log(`[ANALYTICS] Event: ${eventName}`, properties);
  // In a real app, this would send data to Mixpanel, Amplitude, Google Analytics etc.
};

const useFeatureFlag = (flagName: string) => {
  // In a real app, this would fetch from a feature flag service (e.g., LaunchDarkly, Optimizely, or a simple backend config).
  // For demonstration, hardcode some flags.
  const flags: { [key: string]: boolean } = {
    enableAISuggestions: true,
    enableWorkflowBuilder: true,
    enableAdvancedAnalytics: true,
    enableMultiLanguageSupport: true,
  };
  return flags[flagName] || false;
};

// Mock i18n utility
const i18n = {
  t: (key: string, options?: { [key: string]: string }) => {
    const translations: { [key: string]: string } = {
      "errors.failedToLoadOnboardingFlow": "Failed to load onboarding flow: {{error}}",
      "errors.geminiNotConfigured": "Gemini AI is not configured. Please check API key.",
      "errors.geminiSuggestionFailed": "Failed to get AI suggestions: {{error}}",
      "errors.securityPolicyViolation": "Security policy violation: {{reasons}}",
      "errors.failedToUpdateFlow": "Error updating User Onboarding Flow.",
      "errors.graphQLError": "A GraphQL error occurred: {{error}}",
      "errors.failedToCreateFlow": "Error creating User Onboarding Flow.",
      "errors.unexpectedError": "An unexpected error occurred. Please try again.",
      "validation.flowAliasRequired": "Flow alias must be selected",
      "validation.statusRequired": "Status is required",
      "validation.priorityRequired": "Priority is required",
      "validation.startDateRequired": "Start date is required",
      "validation.endDateAfterStartDate": "End date must be after start date",
      "validation.descriptionTooLong": "Description cannot exceed 1000 characters",
      "validation.minOneDocument": "At least one required document must be selected",
      "loading.loadingOnboardingFlow": "Loading Onboarding Flow...",
      "success.flowCreated": "User Onboarding Flow created successfully!",
      "success.flowUpdated": "User Onboarding Flow updated successfully!",
      "notifications.flowCreated": "New Onboarding Flow {{id}} has been created.",
      "notifications.flowUpdated": "Onboarding Flow {{id}} has been updated.",
      "titles.editOnboardingFlow": "Edit Onboarding Flow: {{id}}",
      "titles.createNewOnboardingFlow": "Create New User Onboarding Flow",
      "actions.cancel": "Cancel",
      "actions.updateFlow": "Update Onboarding Flow",
      "actions.createFlow": "Create User Onboarding Flow",
      "tabs.overview": "Overview",
      "tabs.aiInsights": "AI Insights",
      "tabs.workflow": "Workflow Automation",
      "tabs.analytics": "Analytics & Reporting",
      "tabs.integrations": "Integrations",
      "tabs.settings": "Settings",
      "labels.flowAlias": "Flow Alias",
      "labels.counterparty": "Counterparty",
      "labels.assignedUser": "Assigned User",
      "labels.status": "Status",
      "labels.priority": "Priority",
      "labels.startDate": "Start Date",
      "labels.endDate": "End Date",
      "labels.description": "Description",
      "labels.requiredDocuments": "Required Documents",
      "labels.tags": "Tags",
      "labels.aiSentiment": "AI Sentiment Analysis",
      "placeholders.selectFlowAlias": "Select flow alias",
      "placeholders.selectCounterparty": "Select counterparty",
      "placeholders.assignUser": "Assign user",
      "placeholders.flowDescription": "Provide a detailed description for the onboarding process...",
      "placeholders.enterTags": "Enter tags (comma-separated)",
      "statuses.pending": "Pending",
      "statuses.inProgress": "In Progress",
      "statuses.completed": "Completed",
      "statuses.blocked": "Blocked",
      "statuses.cancelled": "Cancelled",
      "priorities.low": "Low",
      "priorities.medium": "Medium",
      "priorities.high": "High",
      "priorities.critical": "Critical",
      "aiInsights.title": "AI-Powered Onboarding Insights",
      "aiInsights.generateSuggestions": "Generate AI Suggestions",
      "aiInsights.geminiDisabled": "Gemini AI is currently disabled or not configured.",
      "aiInsights.generating": "Generating AI suggestions...",
      "aiInsights.suggestedSteps": "Suggested Onboarding Steps (by Gemini AI):",
      "aiInsights.aiDisclaimer": "These suggestions are AI-generated and should be reviewed by a human.",
      "aiInsights.sentimentAnalysisNote": "AI sentiment analysis provides insights into user feedback and communication.",
      "workflow.title": "Workflow Automation",
      "workflow.description": "Automate repetitive tasks and integrate with your existing business processes.",
      "workflow.stepAutomation": "Step Automation & Conditional Logic",
      "workflow.autoApproveLabel": "Auto-approve initial steps based on predefined criteria",
      "workflow.autoApproveHint": "Automatically move new users through initial onboarding stages if they meet criteria (e.g., verified email, non-high-risk counterparty).",
      "workflow.conditionalLogic": "Conditional Logic Rules",
      "workflow.conditionalLogicHint": "Define rules to dynamically assign tasks or trigger actions based on user input or external data (e.g., 'If Counterparty is VIP, then assign priority: Critical').",
      "workflow.dragDropBuilderPlaceholder": "Drag & Drop Workflow Builder (Future Enhancement)",
      "workflow.externalTriggers": "External System Triggers",
      "workflow.externalTriggersDescription": "Configure triggers to interact with external services upon certain onboarding events.",
      "workflow.slackNotification": "Send Slack notifications to relevant teams upon flow creation or status changes.",
      "workflow.crmUpdate": "Automatically update CRM records (e.g., Salesforce, HubSpot) with onboarding progress.",
      "workflow.docuSignAgreement": "Initiate DocuSign requests for legal agreements as part of the onboarding flow.",
      "workflow.jiraTicket": "Create Jira tickets for internal teams to track onboarding-related tasks.",
      "workflow.manageWebhooks": "Manage Webhooks & Integrations",
      "analytics.title": "Onboarding Performance Analytics",
      "analytics.description": "Gain deep insights into your onboarding flows to identify bottlenecks and optimize conversion.",
      "analytics.completionRate": "Average Completion Rate",
      "analytics.averageTime": "Average Completion Time",
      "timeUnits.days": "days",
      "analytics.bottlenecks": "Top Bottlenecks",
      "analytics.documentReview": "Document Review Delays",
      "analytics.paymentVerification": "Payment Verification Holds",
      "analytics.viewFullDashboard": "View Full Analytics Dashboard",
      "analytics.interactiveChartsPlaceholder": "Interactive Charts & Customizable Reports (Powered by Datadog, Google Analytics, Mixpanel)",
      "integrations.title": "External Service Integrations",
      "integrations.description": "Connect seamlessly with your essential business tools to create a unified platform.",
      "integrations.categories.ai": "AI & Machine Learning",
      "integrations.categories.crm": "Customer Relationship Management",
      "integrations.categories.erp": "Enterprise Resource Planning",
      "integrations.categories.payment": "Payment & Billing",
      "integrations.categories.communication": "Communication & Messaging",
      "integrations.categories.cloudStorage": "Cloud Storage & Document Management",
      "integrations.categories.identityAuth": "Identity & Authentication",
      "integrations.categories.analyticsMonitoring": "Analytics & Monitoring",
      "integrations.categories.database": "Database Services",
      "integrations.categories.documentManagement": "Document Management & e-Signature",
      "integrations.categories.geospatial": "Geospatial Services",
      "integrations.categories.devopsCICD": "DevOps & Project Management",
      "integrations.categories.webhooksIntegrations": "Webhook & Automation Platforms",
      "integrations.categories.security": "Security & Compliance",
      "integrations.categories.eCommerce": "E-commerce Platforms",
      "integrations.categories.videoConferencing": "Video Conferencing",
      "integrations.categories.crmMarketingAutomation": "CRM & Marketing Automation",
      "integrations.requiredSecrets": "Required Secrets",
      "integrations.status.configured": "Configured",
      "integrations.status.missingConfig": "Missing Configuration",
      "integrations.manageConnection": "Manage Connection",
      "integrations.servicePurpose.gemini": "AI-powered content generation, suggestions, and advanced analytics.",
      "integrations.servicePurpose.openai": "Advanced natural language processing and generation.",
      "integrations.servicePurpose.awsRekognition": "Image and video analysis for identity verification and content moderation.",
      "integrations.servicePurpose.azureCognitiveServices": "Suite of AI services including vision, speech, language.",
      "integrations.servicePurpose.salesforce": "Centralized customer data and sales pipeline management.",
      "integrations.servicePurpose.hubspot": "Marketing, sales, service, and CRM platform.",
      "integrations.servicePurpose.zohoCrm": "Comprehensive CRM for sales, marketing, and customer support.",
      "integrations.servicePurpose.sap": "Enterprise resource planning for business operations.",
      "integrations.servicePurpose.netsuite": "Cloud ERP for financial management, CRM, and e-commerce.",
      "integrations.servicePurpose.stripe": "Online payment processing and financial services.",
      "integrations.servicePurpose.paypal": "Secure online payment solutions.",
      "integrations.servicePurpose.braintree": "Payment gateway for mobile and web apps.",
      "integrations.servicePurpose.paddle": "All-in-one platform for software sales, billing, and analytics.",
      "integrations.servicePurpose.twilio": "SMS, voice, and video communication APIs.",
      "integrations.servicePurpose.sendgrid": "Email delivery and marketing platform.",
      "integrations.servicePurpose.mailchimp": "Email marketing and automation platform.",
      "integrations.servicePurpose.slack": "Team communication and collaboration.",
      "integrations.servicePurpose.intercom": "Customer messaging platform for sales, marketing, and support.",
      "integrations.servicePurpose.whatsAppBusiness": "Engage with customers on WhatsApp.",
      "integrations.servicePurpose.awsS3": "Scalable object storage for files and data.",
      "integrations.servicePurpose.googleCloudStorage": "Unified object storage for various data types.",
      "integrations.servicePurpose.azureBlobStorage": "Optimized cloud object storage for massive unstructured data.",
      "integrations.servicePurpose.auth0": "Identity management platform for authentication and authorization.",
      "integrations.servicePurpose.okta": "Enterprise identity and access management.",
      "integrations.servicePurpose.firebaseAuth": "Google's authentication service for app users.",
      "integrations.servicePurpose.azureAd": "Microsoft's cloud-based identity and access management service.",
      "integrations.servicePurpose.googleAnalytics4": "Web and app analytics for user behavior insights.",
      "integrations.servicePurpose.mixpanel": "Product analytics for understanding user engagement.",
      "integrations.servicePurpose.amplitude": "Product intelligence platform for data-driven decisions.",
      "integrations.servicePurpose.datadog": "Monitoring, security, and analytics platform for cloud applications.",
      "integrations.servicePurpose.sentry": "Real-time error monitoring and performance tracking.",
      "integrations.servicePurpose.logrocket": "Session replay, error tracking, and performance monitoring.",
      "integrations.servicePurpose.newRelic": "Full-stack observability platform for performance monitoring.",
      "integrations.servicePurpose.postgresql": "Powerful, open source object-relational database system.",
      "integrations.servicePurpose.mongodbAtlas": "Cloud-hosted MongoDB service.",
      "integrations.servicePurpose.redis": "In-memory data store for caching and real-time operations.",
      "integrations.servicePurpose.googleDrive": "Cloud storage and file synchronization service.",
      "integrations.servicePurpose.microsoftOneDrive": "Personal cloud storage service from Microsoft.",
      "integrations.servicePurpose.docusign": "Electronic signature and digital transaction management.",
      "integrations.servicePurpose.googleMaps": "Geospatial data and mapping services.",
      "integrations.servicePurpose.mapbox": "Custom maps for web and mobile applications.",
      "integrations.servicePurpose.github": "Code hosting platform for version control and collaboration.",
      "integrations.servicePurpose.jira": "Issue tracking and project management for software development.",
      "integrations.servicePurpose.gitlab": "Complete DevOps platform.",
      "integrations.servicePurpose.zapier": "Automation platform connecting apps and services.",
      "integrations.servicePurpose.makeCom": "Visual platform for automating workflows.",
      "integrations.servicePurpose.hashicorpVault": "Secret management and data encryption.",
      "integrations.servicePurpose.awsSecretsManager": "Secure storage and management of secrets.",
      "integrations.servicePurpose.googleSecretManager": "Centralized global storage for secrets.",
      "integrations.servicePurpose.duoSecurity": "Multi-factor authentication (MFA) and access security.",
      "integrations.servicePurpose.cloudflare": "CDN, DNS, and security services.",
      "integrations.servicePurpose.onelogin": "Unified access management for cloud and on-premise apps.",
      "integrations.servicePurpose.shopify": "E-commerce platform for online stores.",
      "integrations.servicePurpose.magento": "Open-source e-commerce platform.",
      "integrations.servicePurpose.zoom": "Video conferencing and webinar platform.",
      "integrations.servicePurpose.googleMeet": "Secure video conferencing for teams.",
      "integrations.servicePurpose.microsoftTeams": "Chat, meetings, calls, and collaboration.",
      "integrations.servicePurpose.pardot": "Marketing automation for Salesforce.",
      "integrations.servicePurpose.activeCampaign": "Customer experience automation platform.",
      "settings.title": "Platform Settings",
      "settings.securityAndCompliance": "Security & Compliance",
      "settings.twoFactorAuth": "Two-Factor Authentication (MFA)",
      "settings.twoFactorAuthDescription": "Enhanced security by requiring a second form of verification for all users.",
      "settings.auditLogs": "Comprehensive Audit Logs",
      "settings.auditLogsDescription": "Track every action taken within the platform for accountability and compliance.",
      "settings.viewAuditLogs": "View Audit Logs",
      "settings.gdprCompliance": "GDPR Compliance",
      "settings.gdprComplianceDescription": "Ensures data privacy and protection for users in the European Union.",
      "settings.localizationAndLanguage": "Localization & Language",
      "settings.appLanguage": "Application Language",
      "settings.appLanguageHint": "Select the default language for the user interface.",
      "settings.timezone": "Default Timezone",
      "languages.english": "English",
      "languages.spanish": "Spanish",
      "languages.french": "French",
      "timezones.utc": "UTC",
      "timezones.newYork": "America/New_York",
      "timezones.london": "Europe/London",
      "settings.featureManagement": "Feature Management",
      "settings.featureManagementDescription": "Enable or disable platform features based on your business needs or subscription plan.",
      "settings.aiSuggestions": "AI Onboarding Suggestions",
      "settings.aiSuggestionsHint": "Enable Gemini AI to generate smart onboarding steps and insights.",
      "settings.workflowBuilder": "Workflow Automation Builder",
      "settings.workflowBuilderHint": "Enable the visual builder for designing custom onboarding workflows.",
    };

    let translated = translations[key] || key;
    if (options) {
      for (const [optionKey, optionValue] of Object.entries(options)) {
        translated = translated.replace(new RegExp(`{{${optionKey}}}`, 'g'), optionValue);
      }
    }
    return translated;
  },
};

// Mock security policy engine
const validateSchemaAgainstPolicy = (schemaName: string, data: any) => {
  // In a real app, this would be a sophisticated policy engine checking against predefined rules.
  // For demonstration, a simple mock check.
  const reasons: string[] = [];
  if (schemaName === "UserOnboardingFlow") {
    if (data.priority === "CRITICAL" && !data.description) {
      reasons.push("Critical priority flows must have a description.");
    }
    // Add more complex rules here, e.g., checking data sanitization, PII handling, etc.
  }
  return { isValid: reasons.length === 0, reasons };
};

// Mock Next.js API route endpoints for integrations
// In a production app, these would be proper server-side API routes that securely
// interact with external services using their respective SDKs and stored secrets.
// fetch('/api/integrations/slack-notify', ...) and fetch('/api/integrations/jira-create-task', ...)
// are placeholders for such calls.