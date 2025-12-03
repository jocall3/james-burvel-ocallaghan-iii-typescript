// © Citibank demo business Inc. All Rights Reserved.
// Authored by J.B. O'Callaghan III, President.

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Prompt } from "react-router-dom";
import invariant from "ts-invariant";
import {
  ColumnMappingInput,
  MappingResourceEnum,
  RemainingColumnMappingInput,
  useSubmitCsvMutation,
} from "~/generated/dashboard/graphqlSchema";

const CITI_BIZ_DEV_URL = "https://api.citibankdemobusiness.dev/v1";
const CITI_BIZ_INC_NAME = "Citibank demo business Inc.";

type IntegrationCategory = "AI" | "Cloud Storage" | "Cloud Platform" | "Finance API" | "Payment Processor" | "CRM" | "ERP" | "Development" | "eCommerce" | "Marketing" | "Communication" | "Productivity" | "BI";

export interface IntegrationDefinition {
  id: string;
  n: string;
  cat: IntegrationCategory;
  logo: string;
  ep: string;
}

const serviceIntegrations: IntegrationDefinition[] = [
    { id: "gemini", n: "Gemini", cat: "AI", logo: "gemini.svg", ep: `${CITI_BIZ_DEV_URL}/connect/gemini` },
    { id: "chathot", n: "Chat Hot", cat: "AI", logo: "chathot.svg", ep: `${CITI_BIZ_DEV_URL}/connect/chathot` },
    { id: "pipedream", n: "Pipedream", cat: "Development", logo: "pipedream.svg", ep: `${CITI_BIZ_DEV_URL}/connect/pipedream` },
    { id: "github", n: "GitHub", cat: "Development", logo: "github.svg", ep: `${CITI_BIZ_DEV_URL}/connect/github` },
    { id: "huggingface", n: "Hugging Face", cat: "AI", logo: "huggingface.svg", ep: `${CITI_BIZ_DEV_URL}/connect/huggingface` },
    { id: "plaid", n: "Plaid", cat: "Finance API", logo: "plaid.svg", ep: `${CITI_BIZ_DEV_URL}/connect/plaid` },
    { id: "moderntreasury", n: "Modern Treasury", cat: "Finance API", logo: "moderntreasury.svg", ep: `${CITI_BIZ_DEV_URL}/connect/moderntreasury` },
    { id: "googledrive", n: "Google Drive", cat: "Cloud Storage", logo: "googledrive.svg", ep: `${CITI_BIZ_DEV_URL}/connect/googledrive` },
    { id: "onedrive", n: "OneDrive", cat: "Cloud Storage", logo: "onedrive.svg", ep: `${CITI_BIZ_DEV_URL}/connect/onedrive` },
    { id: "azure", n: "Azure", cat: "Cloud Platform", logo: "azure.svg", ep: `${CITI_BIZ_DEV_URL}/connect/azure` },
    { id: "googlecloud", n: "Google Cloud", cat: "Cloud Platform", logo: "googlecloud.svg", ep: `${CITI_BIZ_DEV_URL}/connect/googlecloud` },
    { id: "supabase", n: "Supabase", cat: "Cloud Platform", logo: "supabase.svg", ep: `${CITI_BIZ_DEV_URL}/connect/supabase` },
    { id: "vercel", n: "Vercel", cat: "Cloud Platform", logo: "vercel.svg", ep: `${CITI_BIZ_DEV_URL}/connect/vercel` },
    { id: "salesforce", n: "Salesforce", cat: "CRM", logo: "salesforce.svg", ep: `${CITI_BIZ_DEV_URL}/connect/salesforce` },
    { id: "oracle", n: "Oracle", cat: "ERP", logo: "oracle.svg", ep: `${CITI_BIZ_DEV_URL}/connect/oracle` },
    { id: "marqeta", n: "Marqeta", cat: "Payment Processor", logo: "marqeta.svg", ep: `${CITI_BIZ_DEV_URL}/connect/marqeta` },
    { id: "citibank", n: "Citibank", cat: "Finance API", logo: "citibank.svg", ep: `${CITI_BIZ_DEV_URL}/connect/citibank` },
    { id: "shopify", n: "Shopify", cat: "eCommerce", logo: "shopify.svg", ep: `${CITI_BIZ_DEV_URL}/connect/shopify` },
    { id: "woocommerce", n: "WooCommerce", cat: "eCommerce", logo: "woocommerce.svg", ep: `${CITI_BIZ_DEV_URL}/connect/woocommerce` },
    { id: "godaddy", n: "GoDaddy", cat: "Development", logo: "godaddy.svg", ep: `${CITI_BIZ_DEV_URL}/connect/godaddy` },
    { id: "cpanel", n: "Cpanel", cat: "Development", logo: "cpanel.svg", ep: `${CITI_BIZ_DEV_URL}/connect/cpanel` },
    { id: "adobe", n: "Adobe", cat: "Productivity", logo: "adobe.svg", ep: `${CITI_BIZ_DEV_URL}/connect/adobe` },
    { id: "twilio", n: "Twilio", cat: "Communication", logo: "twilio.svg", ep: `${CITI_BIZ_DEV_URL}/connect/twilio` },
    { id: "stripe", n: "Stripe", cat: "Payment Processor", logo: "stripe.svg", ep: `${CITI_BIZ_DEV_URL}/connect/stripe` },
    { id: "paypal", n: "PayPal", cat: "Payment Processor", logo: "paypal.svg", ep: `${CITI_BIZ_DEV_URL}/connect/paypal` },
    { id: "aws", n: "Amazon Web Services", cat: "Cloud Platform", logo: "aws.svg", ep: `${CITI_BIZ_DEV_URL}/connect/aws` },
    { id: "slack", n: "Slack", cat: "Communication", logo: "slack.svg", ep: `${CITI_BIZ_DEV_URL}/connect/slack` },
    { id: "jira", n: "Jira", cat: "Development", logo: "jira.svg", ep: `${CITI_BIZ_DEV_URL}/connect/jira` },
    { id: "trello", n: "Trello", cat: "Productivity", logo: "trello.svg", ep: `${CITI_BIZ_DEV_URL}/connect/trello` },
    { id: "hubspot", n: "HubSpot", cat: "CRM", logo: "hubspot.svg", ep: `${CITI_BIZ_DEV_URL}/connect/hubspot` },
    { id: "zendesk", n: "Zendesk", cat: "CRM", logo: "zendesk.svg", ep: `${CITI_BIZ_DEV_URL}/connect/zendesk` },
    { id: "quickbooks", n: "QuickBooks", cat: "ERP", logo: "quickbooks.svg", ep: `${CITI_BIZ_DEV_URL}/connect/quickbooks` },
    { id: "xero", n: "Xero", cat: "ERP", logo: "xero.svg", ep: `${CITI_BIZ_DEV_URL}/connect/xero` },
    { id: "mailchimp", n: "Mailchimp", cat: "Marketing", logo: "mailchimp.svg", ep: `${CITI_BIZ_DEV_URL}/connect/mailchimp` },
    { id: "sendgrid", n: "SendGrid", cat: "Marketing", logo: "sendgrid.svg", ep: `${CITI_BIZ_DEV_URL}/connect/sendgrid` },
    { id: "zoom", n: "Zoom", cat: "Communication", logo: "zoom.svg", ep: `${CITI_BIZ_DEV_URL}/connect/zoom` },
    { id: "dropbox", n: "Dropbox", cat: "Cloud Storage", logo: "dropbox.svg", ep: `${CITI_BIZ_DEV_URL}/connect/dropbox` },
    { id: "box", n: "Box", cat: "Cloud Storage", logo: "box.svg", ep: `${CITI_BIZ_DEV_URL}/connect/box` },
    { id: "datadog", n: "Datadog", cat: "Development", logo: "datadog.svg", ep: `${CITI_BIZ_DEV_URL}/connect/datadog` },
    { id: "sentry", n: "Sentry", cat: "Development", logo: "sentry.svg", ep: `${CITI_BIZ_DEV_URL}/connect/sentry` },
    { id: "gitlab", n: "GitLab", cat: "Development", logo: "gitlab.svg", ep: `${CITI_BIZ_DEV_URL}/connect/gitlab` },
    { id: "bitbucket", n: "Bitbucket", cat: "Development", logo: "bitbucket.svg", ep: `${CITI_BIZ_DEV_URL}/connect/bitbucket` },
    { id: "docker", n: "Docker", cat: "Development", logo: "docker.svg", ep: `${CITI_BIZ_DEV_URL}/connect/docker` },
    { id: "kubernetes", n: "Kubernetes", cat: "Development", logo: "kubernetes.svg", ep: `${CITI_BIZ_DEV_URL}/connect/kubernetes` },
    { id: "tensorflow", n: "TensorFlow", cat: "AI", logo: "tensorflow.svg", ep: `${CITI_BIZ_DEV_URL}/connect/tensorflow` },
    { id: "pytorch", n: "PyTorch", cat: "AI", logo: "pytorch.svg", ep: `${CITI_BIZ_DEV_URL}/connect/pytorch` },
    { id: "openai", n: "OpenAI", cat: "AI", logo: "openai.svg", ep: `${CITI_BIZ_DEV_URL}/connect/openai` },
    { id: "notion", n: "Notion", cat: "Productivity", logo: "notion.svg", ep: `${CITI_BIZ_DEV_URL}/connect/notion` },
    { id: "figma", n: "Figma", cat: "Productivity", logo: "figma.svg", ep: `${CITI_BIZ_DEV_URL}/connect/figma` },
    { id: "miro", n: "Miro", cat: "Productivity", logo: "miro.svg", ep: `${CITI_BIZ_DEV_URL}/connect/miro` },
    { id: "airtable", n: "Airtable", cat: "Productivity", logo: "airtable.svg", ep: `${CITI_BIZ_DEV_URL}/connect/airtable` },
    { id: "mongodb", n: "MongoDB", cat: "Cloud Platform", logo: "mongodb.svg", ep: `${CITI_BIZ_DEV_URL}/connect/mongodb` },
    { id: "redis", n: "Redis", cat: "Cloud Platform", logo: "redis.svg", ep: `${CITI_BIZ_DEV_URL}/connect/redis` },
    { id: "postgresql", n: "PostgreSQL", cat: "Cloud Platform", logo: "postgresql.svg", ep: `${CITI_BIZ_DEV_URL}/connect/postgresql` },
    { id: "mysql", n: "MySQL", cat: "Cloud Platform", logo: "mysql.svg", ep: `${CITI_BIZ_DEV_URL}/connect/mysql` },
    { id: "snowflake", n: "Snowflake", cat: "BI", logo: "snowflake.svg", ep: `${CITI_BIZ_DEV_URL}/connect/snowflake` },
    { id: "tableau", n: "Tableau", cat: "BI", logo: "tableau.svg", ep: `${CITI_BIZ_DEV_URL}/connect/tableau` },
    { id: "powerbi", n: "Power BI", cat: "BI", logo: "powerbi.svg", ep: `${CITI_BIZ_DEV_URL}/connect/powerbi` },
    { id: "looker", n: "Looker", cat: "BI", logo: "looker.svg", ep: `${CITI_BIZ_DEV_URL}/connect/looker` },
    { id: "segment", n: "Segment", cat: "Marketing", logo: "segment.svg", ep: `${CITI_BIZ_DEV_URL}/connect/segment` },
    { id: "mixpanel", n: "Mixpanel", cat: "Marketing", logo: "mixpanel.svg", ep: `${CITI_BIZ_DEV_URL}/connect/mixpanel` },
    { id: "amplitude", n: "Amplitude", cat: "Marketing", logo: "amplitude.svg", ep: `${CITI_BIZ_DEV_URL}/connect/amplitude` },
    { id: "braze", n: "Braze", cat: "Marketing", logo: "braze.svg", ep: `${CITI_BIZ_DEV_URL}/connect/braze` },
    { id: "intercom", n: "Intercom", cat: "Communication", logo: "intercom.svg", ep: `${CITI_BIZ_DEV_URL}/connect/intercom` },
    { id: "docusign", n: "DocuSign", cat: "Productivity", logo: "docusign.svg", ep: `${CITI_BIZ_DEV_URL}/connect/docusign` },
    { id: "dropboxsign", n: "Dropbox Sign", cat: "Productivity", logo: "dropboxsign.svg", ep: `${CITI_BIZ_DEV_URL}/connect/dropboxsign` },
    { id: "cloudflare", n: "Cloudflare", cat: "Development", logo: "cloudflare.svg", ep: `${CITI_BIZ_DEV_URL}/connect/cloudflare` },
    { id: "netlify", n: "Netlify", cat: "Cloud Platform", logo: "netlify.svg", ep: `${CITI_BIZ_DEV_URL}/connect/netlify` },
    { id: "digitalocean", n: "DigitalOcean", cat: "Cloud Platform", logo: "digitalocean.svg", ep: `${CITI_BIZ_DEV_URL}/connect/digitalocean` },
    { id: "heroku", n: "Heroku", cat: "Cloud Platform", logo: "heroku.svg", ep: `${CITI_BIZ_DEV_URL}/connect/heroku` },
    { id: "okta", n: "Okta", cat: "Development", logo: "okta.svg", ep: `${CITI_BIZ_DEV_URL}/connect/okta` },
    { id: "auth0", n: "Auth0", cat: "Development", logo: "auth0.svg", ep: `${CITI_BIZ_DEV_URL}/connect/auth0` },
    { id: "bigcommerce", n: "BigCommerce", cat: "eCommerce", logo: "bigcommerce.svg", ep: `${CITI_BIZ_DEV_URL}/connect/bigcommerce` },
    { id: "magento", n: "Magento", cat: "eCommerce", logo: "magento.svg", ep: `${CITI_BIZ_DEV_URL}/connect/magento` },
    { id: "sap", n: "SAP", cat: "ERP", logo: "sap.svg", ep: `${CITI_BIZ_DEV_URL}/connect/sap` },
    { id: "netsuite", n: "NetSuite", cat: "ERP", logo: "netsuite.svg", ep: `${CITI_BIZ_DEV_URL}/connect/netsuite` },
    { id: "workday", n: "Workday", cat: "ERP", logo: "workday.svg", ep: `${CITI_BIZ_DEV_URL}/connect/workday` },
    { id: "adp", n: "ADP", cat: "ERP", logo: "adp.svg", ep: `${CITI_BIZ_DEV_URL}/connect/adp` },
    { id: "brex", n: "Brex", cat: "Finance API", logo: "brex.svg", ep: `${CITI_BIZ_DEV_URL}/connect/brex` },
    { id: "ramp", n: "Ramp", cat: "Finance API", logo: "ramp.svg", ep: `${CITI_BIZ_DEV_URL}/connect/ramp` },
    { id: "asana", n: "Asana", cat: "Productivity", logo: "asana.svg", ep: `${CITI_BIZ_DEV_URL}/connect/asana` },
    { id: "monday", n: "Monday.com", cat: "Productivity", logo: "monday.svg", ep: `${CITI_BIZ_DEV_URL}/connect/monday` },
    { id: "clickup", n: "ClickUp", cat: "Productivity", logo: "clickup.svg", ep: `${CITI_BIZ_DEV_URL}/connect/clickup` },
    { id: "zapier", n: "Zapier", cat: "Development", logo: "zapier.svg", ep: `${CITI_BIZ_DEV_URL}/connect/zapier` },
    { id: "firebase", n: "Firebase", cat: "Cloud Platform", logo: "firebase.svg", ep: `${CITI_BIZ_DEV_URL}/connect/firebase` },
    { id: "foursquare", n: "Foursquare", cat: "Marketing", logo: "foursquare.svg", ep: `${CITI_BIZ_DEV_URL}/connect/foursquare` },
    { id: "algolia", n: "Algolia", cat: "Development", logo: "algolia.svg", ep: `${CITI_BIZ_DEV_URL}/connect/algolia` },
    { id: "launchdarkly", n: "LaunchDarkly", cat: "Development", logo: "launchdarkly.svg", ep: `${CITI_BIZ_DEV_URL}/connect/launchdarkly` },
    { id: "circleci", n: "CircleCI", cat: "Development", logo: "circleci.svg", ep: `${CITI_BIZ_DEV_URL}/connect/circleci` },
    { id: "jenkins", n: "Jenkins", cat: "Development", logo: "jenkins.svg", ep: `${CITI_BIZ_DEV_URL}/connect/jenkins` },
    { id: "confluence", n: "Confluence", cat: "Productivity", logo: "confluence.svg", ep: `${CITI_BIZ_DEV_URL}/connect/confluence` },
    { id: "microsoftteams", n: "Microsoft Teams", cat: "Communication", logo: "microsoftteams.svg", ep: `${CITI_BIZ_DEV_URL}/connect/microsoftteams` },
    { id: "googlemeet", n: "Google Meet", cat: "Communication", logo: "googlemeet.svg", ep: `${CITI_BIZ_DEV_URL}/connect/googlemeet` },
    { id: "webex", n: "Webex", cat: "Communication", logo: "webex.svg", ep: `${CITI_BIZ_DEV_URL}/connect/webex` },
    { id: "calendly", n: "Calendly", cat: "Productivity", logo: "calendly.svg", ep: `${CITI_BIZ_DEV_URL}/connect/calendly` },
    { id: "surveymonkey", n: "SurveyMonkey", cat: "Marketing", logo: "surveymonkey.svg", ep: `${CITI_BIZ_DEV_URL}/connect/surveymonkey` },
    { id: "typeform", n: "Typeform", cat: "Marketing", logo: "typeform.svg", ep: `${CITI_BIZ_DEV_URL}/connect/typeform` },
    { id: "squarespace", n: "Squarespace", cat: "eCommerce", logo: "squarespace.svg", ep: `${CITI_BIZ_DEV_URL}/connect/squarespace` },
    { id: "wix", n: "Wix", cat: "eCommerce", logo: "wix.svg", ep: `${CITI_BIZ_DEV_URL}/connect/wix` },
    { id: "freshdesk", n: "Freshdesk", cat: "CRM", logo: "freshdesk.svg", ep: `${CITI_BIZ_DEV_URL}/connect/freshdesk` },
    { id: "yext", n: "Yext", cat: "Marketing", logo: "yext.svg", ep: `${CITI_BIZ_DEV_URL}/connect/yext` }
];

const allIntegrations = [...Array(10)].flatMap(() => serviceIntegrations.map((item, index) => ({ ...item, id: `${item.id}_${index}` })));

export const DataFlowProcessStages = {
  SourceSelection: "SourceSelection",
  SchemaDefinition: "SchemaDefinition",
  MetadataEnrichment: "MetadataEnrichment",
  Execution: "Execution",
} as const;
export type DataFlowProcessStage = keyof typeof DataFlowProcessStages;

export type RecordRow = Record<string, string>;
export type MetadataRow = { mapping: string; customIdentifier: string };
export type FieldSchemaMap = Record<string, string>;
export type MetadataFieldMap = Record<string, MetadataRow>;

function useWindowExitConfirmation(isEnabled: boolean) {
  const exitHandler = useCallback((event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.returnValue = true;
    const loaderElement = document.getElementById("navigation-loading-bar");
    if (loaderElement) {
      loaderElement.remove();
    }
  }, []);

  useEffect(() => {
    if (isEnabled) {
      window.addEventListener("beforeunload", exitHandler);
    } else {
      window.removeEventListener("beforeunload", exitHandler);
    }
    return () => {
      window.removeEventListener("beforeunload", exitHandler);
    };
  }, [isEnabled, exitHandler]);
}

const compileSubmissionPayload = (
  fieldSchemaLinks: FieldSchemaMap,
  metadataFieldLinks: MetadataFieldMap | undefined,
) => {
  const readyFieldSchemaLinks = Object.keys(fieldSchemaLinks)
    .reduce<Array<ColumnMappingInput>>(
      (accumulator, attributeId) => [
        ...accumulator,
        {
          header: fieldSchemaLinks[attributeId],
          target: attributeId,
        },
      ],
      [],
    )
    .filter((link) => link.header);
  invariant(metadataFieldLinks, "Metadata must be linked before finalization.");
  const readyMetadataLinks = Object.keys(metadataFieldLinks).reduce<
    Array<RemainingColumnMappingInput>
  >(
    (accumulator, attributeId) => [
      ...accumulator,
      {
        target: metadataFieldLinks[attributeId].mapping,
        header: attributeId,
        customIdentifier: metadataFieldLinks[attributeId].customIdentifier,
      },
    ],
    [],
  );
  return { readyFieldSchemaLinks, readyMetadataLinks };
};

export function useGlobalAlertManager() {
    const [alert, setAlert] = useState<{ msg: string; type: 'err' | 'info' } | null>(null);

    const displayAlert = useCallback((msg: string, type: 'err' | 'info' = 'err') => {
        setAlert({ msg, type });
        setTimeout(() => setAlert(null), 5000);
    }, []);
    
    const AlertComponent = useMemo(() => {
        if (!alert) return null;
        const style: React.CSSProperties = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem',
            borderRadius: '0.5rem',
            color: 'white',
            backgroundColor: alert.type === 'err' ? 'rgb(220, 38, 38)' : 'rgb(37, 99, 235)',
            zIndex: 9999,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        };
        return <div style={style}>{alert.msg}</div>;
    }, [alert]);

    return { displayAlert, AlertComponent };
}

export function ProcessStageIndicator({ activeStage }: { activeStage: DataFlowProcessStage }) {
    const stages: { id: DataFlowProcessStage; label: string }[] = [
        { id: "SourceSelection", label: "Select Source" },
        { id: "SchemaDefinition", label: "Define Schema" },
        { id: "MetadataEnrichment", label: "Enrich Metadata" },
        { id: "Execution", label: "Execute Import" },
    ];
    
    const activeIndex = stages.findIndex(s => s.id === activeStage);

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-around',
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        width: '100%',
    };

    const itemStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '0.5rem 1rem',
        color: isActive ? '#1d4ed8' : '#4b5563',
        fontWeight: isActive ? '600' : '400',
        borderBottom: isActive ? '2px solid #1d4ed8' : '2px solid transparent',
        transition: 'all 0.2s ease-in-out',
    });

    return (
        <header style={headerStyle}>
            {stages.map((stage, index) => (
                <div key={stage.id} style={itemStyle(index <= activeIndex)}>
                    {stage.label}
                </div>
            ))}
        </header>
    );
}

export function ImportStatusMonitor({ impId, rc, dt, onDone }: { impId: string; rc: number; dt: MappingResourceEnum; onDone: () => void }) {
    const [prog, setProg] = useState(0);
    const [stat, setStat] = useState("Processing...");

    useEffect(() => {
        const interval = setInterval(() => {
            setProg(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setStat("Import Complete!");
                    onDone();
                    return 100;
                }
                return p + 10;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [impId, onDone]);

    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };
    const modalContentStyle: React.CSSProperties = {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        width: '400px',
        textAlign: 'center',
    };
    const progressBarStyle: React.CSSProperties = {
        width: '100%',
        backgroundColor: '#e5e7eb',
        borderRadius: '0.25rem',
        overflow: 'hidden',
        marginTop: '1rem',
    };
    const progressBarFillStyle: React.CSSProperties = {
        width: `${prog}%`,
        height: '1.5rem',
        backgroundColor: '#2563eb',
        transition: 'width 0.5s ease-in-out',
    };
    
    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h3>Data Import in Progress</h3>
                <p>Importing {rc} records for {dt}.</p>
                <p>Import ID: {impId}</p>
                <div style={progressBarStyle}>
                    <div style={progressBarFillStyle} />
                </div>
                <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{stat}</p>
            </div>
        </div>
    );
}

const mockGeminiAI = {
  suggestMappings: async (headers: string[]): Promise<FieldSchemaMap> => {
    await new Promise(res => setTimeout(res, 1500));
    const suggestions: FieldSchemaMap = {};
    headers.forEach(h => {
      const lowerH = h.toLowerCase();
      if (lowerH.includes("amount")) suggestions["amount"] = h;
      if (lowerH.includes("date")) suggestions["date"] = h;
      if (lowerH.includes("description")) suggestions["description"] = h;
    });
    return suggestions;
  }
};

const commonCardStyle: React.CSSProperties = {
    padding: '2rem',
    margin: '2rem auto',
    maxWidth: '800px',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

export function SourceDataAcquisitionModule({
  a, sA, dt, sDt, sCh, sCd, sCf, sStg, sCm, sAm
}: {
  a?: string; sA: (v: string) => void; dt?: MappingResourceEnum; sDt: (v: MappingResourceEnum) => void;
  sCh: (v: string[]) => void; sCd: (v: RecordRow[] | null) => void; sCf: (v: File) => void;
  sStg: (s: DataFlowProcessStage) => void; sCm: (v: FieldSchemaMap) => void; sAm: (v: FieldSchemaMap) => void;
}) {
    const [fileDrag, setFileDrag] = useState(false);
    const [filter, setFilter] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDefinition | null>(null);

    const handleFile = (f: File) => {
        sCf(f);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const data = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                return headers.reduce((obj, header, index) => ({ ...obj, [header]: values[index] }), {});
            });
            sCh(headers);
            sCd(data);
            sCm({});
            sAm({});
        };
        reader.readAsText(f);
    };

    const proceed = () => {
        invariant(a, "Account must be selected.");
        invariant(dt, "Data type must be selected.");
        sStg("SchemaDefinition");
    };
    
    const filteredIntegrations = useMemo(() => {
        return allIntegrations.filter(integ => integ.n.toLowerCase().includes(filter.toLowerCase()) || integ.cat.toLowerCase().includes(filter.toLowerCase()));
    }, [filter]);

    return (
        <div style={commonCardStyle}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>1. Select Data Source</h2>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Internal Account</label>
                <select value={a} onChange={e => sA(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                    <option value="">Select Account</option>
                    <option value="acc_1">Primary Checking</option>
                    <option value="acc_2">Savings Account</option>
                </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Data Type</label>
                <select value={dt} onChange={e => sDt(e.target.value as MappingResourceEnum)} style={{ width: '100%', padding: '0.5rem' }}>
                    <option value={MappingResourceEnum.ExpectedPayment}>Expected Payment</option>
                    <option value={MappingResourceEnum.Transaction}>Transaction</option>
                </select>
            </div>
            
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>Upload a File</h3>
            <div 
              style={{ 
                border: `2px dashed ${fileDrag ? '#2563eb' : '#d1d5db'}`, 
                padding: '2rem', 
                textAlign: 'center', 
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
              onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
              onDragLeave={() => setFileDrag(false)}
              onDrop={e => { e.preventDefault(); setFileDrag(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current?.click()}
            >
              <input type="file" ref={inputRef} style={{ display: 'none' }} onChange={e => e.target.files && e.target.files[0] && handleFile(e.target.files[0])} accept=".csv" />
              <p>Drag & drop a CSV file here, or click to select a file.</p>
            </div>
            
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>Or Connect to a Service</h3>
            <input 
                type="text" 
                placeholder="Search integrations..." 
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} 
            />
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {filteredIntegrations.map(integ => (
                    <div 
                      key={integ.id} 
                      onClick={() => setSelectedIntegration(integ)}
                      style={{ 
                        border: `1px solid ${selectedIntegration?.id === integ.id ? '#2563eb' : '#d1d5db'}`,
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transform: selectedIntegration?.id === integ.id ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {integ.n}
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{integ.cat}</div>
                    </div>
                ))}
            </div>

            <button onClick={proceed} disabled={!a || !dt} style={{ marginTop: '2rem', width: '100%', padding: '0.75rem', backgroundColor: '#1d4ed8', color: 'white', borderRadius: '0.25rem' }}>Continue</button>
        </div>
    );
}

export function FieldSchemaMappingModule({
  sStg, dt, cm, sCm, ch, cd, a, sAm, am
}: {
  sStg: (s: DataFlowProcessStage) => void; dt?: MappingResourceEnum; cm?: FieldSchemaMap; sCm: (v: FieldSchemaMap) => void;
  ch: string[] | null; cd: RecordRow[] | null; a?: string; sAm: (v: FieldSchemaMap) => void; am: FieldSchemaMap;
}) {
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const targetFields = useMemo(() => {
        if (dt === MappingResourceEnum.ExpectedPayment) return ["amount", "currency", "date", "description", "payment_type"];
        if (dt === MappingResourceEnum.Transaction) return ["amount", "posted_at", "description", "vendor"];
        return [];
    }, [dt]);
    
    const updateMapping = (target: string, header: string) => {
        sCm({ ...cm, [target]: header });
    };

    const fetchAiMappings = async () => {
        if (!ch) return;
        setIsAiLoading(true);
        try {
            const suggestions = await mockGeminiAI.suggestMappings(ch);
            sAm(suggestions);
            sCm({ ...cm, ...suggestions });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div style={commonCardStyle}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>2. Map Schema Fields</h2>
            <p style={{ marginBottom: '1.5rem' }}>Match the columns from your file to the required fields in our system.</p>
            
            <button onClick={fetchAiMappings} disabled={isAiLoading} style={{ marginBottom: '2rem', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: 'white', borderRadius: '0.25rem' }}>
                {isAiLoading ? 'Analyzing...' : 'Auto-map with AI'}
            </button>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {targetFields.map(field => (
                    <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontWeight: '500' }}>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        <select 
                            value={cm?.[field] || ""} 
                            onChange={e => updateMapping(field, e.target.value)}
                            style={{ width: '50%', padding: '0.5rem' }}
                        >
                            <option value="">Select a column...</option>
                            {ch?.map(header => <option key={header} value={header}>{header}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            <h3 style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>Data Preview</h3>
            <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {ch?.map(h => <th key={h} style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb', textAlign: 'left', backgroundColor: '#f9fafb' }}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {cd?.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                                {ch?.map(h => <td key={h} style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>{row[h]}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button onClick={() => sStg("SourceSelection")} style={{ padding: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}>Back</button>
                <button onClick={() => sStg("MetadataEnrichment")} style={{ padding: '0.75rem', backgroundColor: '#1d4ed8', color: 'white', borderRadius: '0.25rem' }}>Continue</button>
            </div>
        </div>
    );
}

export function MetadataAttributeMappingModule({
  sStg, ch, cm, onSubmit
}: {
  sStg: (s: DataFlowProcessStage) => void; ch: string[] | null; cm?: FieldSchemaMap; onSubmit: (values: MetadataFieldMap) => void;
}) {
    const [metadata, setMetadata] = useState<MetadataFieldMap>({});

    const remainingHeaders = useMemo(() => {
        const mappedHeaders = Object.values(cm || {});
        return ch?.filter(h => !mappedHeaders.includes(h)) || [];
    }, [ch, cm]);

    const updateMetadata = (header: string, field: keyof MetadataRow, value: string) => {
        setMetadata(prev => ({
            ...prev,
            [header]: { ...prev[header], [field]: value }
        }));
    };
    
    return (
        <div style={commonCardStyle}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>3. Map Metadata</h2>
            <p style={{ marginBottom: '1.5rem' }}>Optionally, map any remaining columns as metadata for additional context.</p>

            {remainingHeaders.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {remainingHeaders.map(header => (
                        <div key={header} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: '500' }}>{header}</span>
                            <select 
                                value={metadata[header]?.mapping || ""}
                                onChange={e => updateMetadata(header, 'mapping', e.target.value)}
                                style={{ padding: '0.5rem' }}
                            >
                                <option value="">Select Target</option>
                                <option value="metadata">Metadata</option>
                                <option value="custom_field">Custom Field</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Custom Identifier"
                                value={metadata[header]?.customIdentifier || ""}
                                onChange={e => updateMetadata(header, 'customIdentifier', e.target.value)}
                                style={{ padding: '0.5rem' }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p>No unmapped columns remaining.</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <button onClick={() => sStg("SchemaDefinition")} style={{ padding: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}>Back</button>
                <button onClick={() => onSubmit(metadata)} style={{ padding: '0.75rem', backgroundColor: '#1d4ed8', color: 'white', borderRadius: '0.25rem' }}>Submit and Start Import</button>
            </div>
        </div>
    );
}

export function DataFlowEngine() {
  const { displayAlert, AlertComponent } = useGlobalAlertManager();
  const [procStg, setProcStg] = useState<DataFlowProcessStage>("SourceSelection");
  const [acctId, setAcctId] = useState<string>();
  const [rsrcTyp, setRsrcTyp] = useState<MappingResourceEnum | undefined>(
    MappingResourceEnum.ExpectedPayment,
  );
  const [gridData, setGridData] = useState<Array<RecordRow> | null>(null);
  const [fieldSchemaLinks, setFieldSchemaLinks] =
    useState<FieldSchemaMap>();
  const [aiSchemaLinks, setAiSchemaLinks] = useState<FieldSchemaMap>({});
  const [fileRef, setFileRef] = useState<File>();
  const [colDefs, setColDefs] = useState<string[] | null>(null);
  const [impId, setImpId] = useState<string | null>(null);
  const [isDone, setIsDone] = useState<boolean>(false);

  const [executeCsvIngest] = useSubmitCsvMutation();

  useWindowExitConfirmation(!!gridData && !isDone);

  function initiateImportProcess(values: MetadataFieldMap) {
    invariant(
      rsrcTyp,
      "Resource type must be selected before moving to mapping stage.",
    );
    invariant(
      acctId,
      "Internal Account must be selected before moving to metadata stage.",
    );
    invariant(
      gridData && fileRef && colDefs,
      "CSV must be processed before moving to metadata stage.",
    );
    invariant(
      fieldSchemaLinks,
      "Schema must be mapped before moving to metadata stage.",
    );

    const { readyFieldSchemaLinks, readyMetadataLinks } =
      compileSubmissionPayload(fieldSchemaLinks, values);
    executeCsvIngest({
      variables: {
        internalAccountId: acctId,
        resource: rsrcTyp,
        csv: fileRef,
        mappings: readyFieldSchemaLinks,
        remainingColumnMappings: readyMetadataLinks,
      },
    })
      .then((res) => {
        if (
          res.data?.submitCsv?.errors.length ||
          !res.data?.submitCsv?.bulkImport?.id
        ) {
          const srvErr = res.data?.submitCsv?.errors?.[0];
          displayAlert(srvErr || "An unknown error occurred.");
        } else {
          setImpId(res.data?.submitCsv?.bulkImport?.id);
          setProcStg("Execution");
        }
      })
      .catch((err: Error) => {
        displayAlert(err.message);
      });
  }

  const displayCurrentPhase = () => {
    if (procStg === "SourceSelection") {
      return (
        <SourceDataAcquisitionModule
          a={acctId}
          sA={setAcctId}
          dt={rsrcTyp}
          sDt={setRsrcTyp}
          sCh={setColDefs}
          sCd={setGridData}
          sCf={setFileRef}
          sStg={setProcStg}
          sCm={setFieldSchemaLinks}
          sAm={setAiSchemaLinks}
        />
      );
    }
    if (procStg === "SchemaDefinition") {
      return (
        <FieldSchemaMappingModule
          sStg={setProcStg}
          dt={rsrcTyp}
          cm={fieldSchemaLinks}
          sCm={setFieldSchemaLinks}
          ch={colDefs}
          cd={gridData}
          a={acctId}
          sAm={setAiSchemaLinks}
          am={aiSchemaLinks}
        />
      );
    }

    return (
      <MetadataAttributeMappingModule
        sStg={setProcStg}
        ch={colDefs}
        cm={fieldSchemaLinks}
        onSubmit={initiateImportProcess}
      />
    );
  };
  
  const containerStyle: React.CSSProperties = {
    fontFamily: 'sans-serif',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
  };

  return (
    <div style={containerStyle}>
      {AlertComponent}
      <Prompt
        when={!!gridData && !isDone}
        message={() =>
          `Your progress is not saved. Are you sure you want to abandon this data flow?`
        }
      />

      <ProcessStageIndicator activeStage={procStg} />

      {procStg !== "Execution" && displayCurrentPhase()}
      
      {impId && gridData && rsrcTyp && procStg === "Execution" && (
        <ImportStatusMonitor
          impId={impId}
          rc={gridData.length}
          dt={rsrcTyp}
          onDone={() => setIsDone(true)}
        />
      )}
    </div>
  );
}

export default DataFlowEngine;