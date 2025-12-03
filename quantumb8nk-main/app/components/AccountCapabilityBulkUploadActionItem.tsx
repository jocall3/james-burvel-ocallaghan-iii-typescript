// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from "react";
import {
  useBulkCreateAccountCapabilitiesMutation,
  useBulkValidateAccountCapabilitiesMutation,
} from "~/generated/dashboard/graphqlSchema";
// Removed Flatfile imports as we're shifting focus from raw CSV bulk upload to AI-driven integration
// import { CellValueUnion } from "@flatfile/api/api";
// import FlatfileBulkUploadButton, { BulkResourceType } from "~/app/components/FlatfileBulkUploadButton";
// import { accountCapabilityBlueprint, accountCapabilityBlueprintFields } from "./bulk_imports/blueprints/accountCapabilityBlueprint";

// Define the expected structure for our account capabilities, matching GraphQL mutation input
interface AccountCapabilityInput {
  name: string;
  description?: string | null;
  isEnabled: boolean;
  // Add other relevant fields if they exist in your GraphQL schema for AccountCapabilityInput,
  // e.g., externalId: string; priority: number; sourceApp: string;
}

// ACCOUNT_CAPABILITY_CSV_HEADERS is no longer relevant for this new AI-first approach
// export const ACCOUNT_CAPABILITY_CSV_HEADERS = accountCapabilityBlueprintFields.map((field) => field.key);

interface EpicCapabilityStudioProps {
  connectionId: string;
}

// --- Internal Mocking for Gemini-like functionality ---
// This function simulates an advanced AI (like Gemini) taking natural language input
// or data from external apps, and intelligently converting it into structured
// account capabilities. In a real application, this would involve secure
// API calls to a large language model or a specialized AI service.
const mockGeminiGenerateCapabilities = async (
  naturalLanguageInput: string,
  integrationSource: "natural_language" | "google_workspace" | "salesforce" | "smart_csv",
): Promise<AccountCapabilityInput[]> => {
  console.log(`🧠 AI processing input from ${integrationSource}: "${naturalLanguageInput}"`);
  // Simulate AI processing time with a delay
  await new Promise(resolve => setTimeout(resolve, 1800));

  // This is where Gemini's complex intelligence would analyze, synthesize, and infer.
  // For this executable mock, we'll parse keywords and provide dynamic examples.
  const capabilities: AccountCapabilityInput[] = [];

  const lowerInput = naturalLanguageInput.toLowerCase();

  if (lowerInput.includes("lending") || lowerInput.includes("loan")) {
    capabilities.push({
      name: "AI-Powered Lending Platform",
      description: "Automated loan origination with real-time credit scoring and adaptive interest rates.",
      isEnabled: true,
    });
  }
  if (lowerInput.includes("payments") || lowerInput.includes("transaction")) {
    capabilities.push({
      name: "Quantum-Secure Instant Payments",
      description: "Next-gen payment rails for lightning-fast and ultra-secure global transactions.",
      isEnabled: true,
    });
  }
  if (lowerInput.includes("fraud") || lowerInput.includes("risk")) {
    capabilities.push({
      name: "Predictive Fraud & Risk Intelligence",
      description: "Proactive, multi-modal fraud detection and anomaly analysis using deep learning.",
      isEnabled: true,
    });
  }
  if (lowerInput.includes("customer service") || lowerInput.includes("support")) {
    capabilities.push({
      name: "Omni-Channel Conversational AI Agent",
      description: "24/7 personalized customer support across all touchpoints with sentient AI agents.",
      isEnabled: true,
    });
  }
  if (lowerInput.includes("compliance") || lowerInput.includes("regulatory")) {
    capabilities.push({
      name: "Dynamic Regulatory Compliance Engine",
      description: "Real-time monitoring and automated adaptation to evolving financial regulations.",
      isEnabled: true,
    });
  }

  // If no specific keywords are matched, or for general input, provide a more generic set based on source
  if (capabilities.length === 0) {
    switch (integrationSource) {
      case "natural_language":
        capabilities.push({
          name: "Innovative Financial Gateway",
          description: `AI-generated foundational capability based on broad request: "${naturalLanguageInput.substring(0, 70)}${naturalLanguageInput.length > 70 ? '...' : ''}"`,
          isEnabled: true,
        });
        break;
      case "google_workspace":
        capabilities.push({
          name: "Workspace-Optimized Collaboration Hub",
          description: "Capabilities intelligently extracted from your Google Docs, Sheets, and communication patterns for enhanced productivity.",
          isEnabled: true,
        }, {
          name: "AI-Driven Document Analysis",
          description: "Automated insights from financial reports and contracts stored in Google Drive.",
          isEnabled: true,
        });
        break;
      case "salesforce":
        capabilities.push({
          name: "CRM-Synergized Client Engagement",
          description: "Capabilities tailored by AI from Salesforce customer profiles, interaction history, and sales analytics.",
          isEnabled: true,
        }, {
          name: "Proactive Churn Prediction & Retention",
          description: "Machine learning model predicting customer churn and suggesting retention strategies.",
          isEnabled: true,
        });
        break;
      case "smart_csv": // For a "smart" CSV upload, AI could enrich, correct, and expand data
          capabilities.push({
            name: "Hyper-Personalized Product Offerings",
            description: "Capabilities derived from intelligently enriched CSV data, identifying niche market segments and product gaps.",
            isEnabled: true,
          }, {
            name: "Automated Data Governance & Quality",
            description: "AI-enhanced data cleansing, validation, and governance from uploaded datasets.",
            isEnabled: true,
          });
          break;
    }
  }

  // Ensure unique names for simplicity and avoid mock duplicates
  const uniqueCapabilities = Array.from(new Map(capabilities.map(cap => [cap.name, cap])).values());

  return uniqueCapabilities.length > 0 ? uniqueCapabilities : [{
    name: "Universal Core Banking Service",
    description: "A foundational and highly adaptable banking capability, generated by AI's baseline understanding.",
    isEnabled: true,
  }];
};
// --- End of Mocking ---


function EpicCapabilityStudio({
  connectionId,
}: EpicCapabilityStudioProps) {
  const [bulkValidateAccountCapabilities] =
    useBulkValidateAccountCapabilitiesMutation();
  const [bulkCreateAccountCapabilities] =
    useBulkCreateAccountCapabilitiesMutation();

  const [integrationMode, setIntegrationMode] = useState<"natural_language" | "google_workspace" | "salesforce" | "smart_csv" | null>(null);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>("");
  const [generatedCapabilities, setGeneratedCapabilities] = useState<AccountCapabilityInput[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(null);
  const [submissionPath, setSubmissionPath] = useState<string | null>(null);

  const resetStateForNewIntegration = useCallback(() => {
    setNaturalLanguageInput("");
    setGeneratedCapabilities([]);
    setErrors([]);
    setSubmissionSuccess(null);
    setSubmissionPath(null);
  }, []);

  const handleModeChange = useCallback((mode: typeof integrationMode) => {
    setIntegrationMode(mode);
    resetStateForNewIntegration();
  }, [resetStateForNewIntegration]);

  const handleGenerateCapabilities = useCallback(async () => {
    setErrors([]);
    setSubmissionSuccess(null);
    setSubmissionPath(null);
    if (!integrationMode) {
      setErrors(["Please select an integration superpower."]);
      return;
    }
    if (integrationMode === "natural_language" && !naturalLanguageInput.trim()) {
      setErrors(["Please describe your desired capabilities for the AI to process."]);
      return;
    }

    setIsLoading(true);
    try {
      // The AI (mockGeminiGenerateCapabilities) takes the helm here.
      // In a full implementation, `naturalLanguageInput` might be enriched with
      // data pulled directly from Google Workspace, Salesforce APIs, or parsed
      // from a "smart" CSV upload, all orchestrated by a backend service.
      const capabilities = await mockGeminiGenerateCapabilities(
        naturalLanguageInput || `Generic request initiated from ${integrationMode} integration mode.`,
        integrationMode
      );
      setGeneratedCapabilities(capabilities);

      // Proactive AI-driven validation: After generation, immediately validate against backend rules
      const validationErrors = await validate(capabilities);
      if (validationErrors && validationErrors.length > 0) {
        setErrors(validationErrors.map(err => `Validation Error for record ${err?.recordId || 'N/A'}: ${err?.errors?.map(e => e.message).join(", ")}`));
      } else {
        setErrors([]); // Clear previous validation errors if this validation passes
      }
    } catch (error) {
      console.error("Critical error during AI capability generation:", error);
      setErrors(["Unforeseen error during capability generation. Please contact support."]);
    } finally {
      setIsLoading(false);
    }
  }, [naturalLanguageInput, integrationMode, validate]);


  // Adapted validate function: now validates our internally generated structured capabilities
  const validate = useCallback(async (
    capabilitiesToValidate: Array<AccountCapabilityInput>,
  ) => {
    if (capabilitiesToValidate.length === 0) {
      return [{ recordId: "N/A", errors: [{ message: "No capabilities identified for validation." }] }];
    }
    try {
      const response = await bulkValidateAccountCapabilities({
        variables: {
          input: {
            connectionId,
            accountCapabilities: capabilitiesToValidate.map(cap => ({
              // Ensure these keys match your GraphQL schema for AccountCapabilityInput fields
              name: cap.name,
              description: cap.description,
              isEnabled: cap.isEnabled,
              // Map any other generated fields here
            })),
          },
        },
      });
      return response.data?.bulkValidateAccountCapabilities?.recordErrors;
    } catch (error) {
      console.error("Server-side validation failed unexpectedly:", error);
      setErrors(prev => [...prev, "Critical server-side validation error."]);
      return [{ recordId: "N/A", errors: [{ message: "Server-side validation failed." }] }];
    }
  }, [bulkValidateAccountCapabilities, connectionId]);


  // Adapted submit function: submits our internally generated structured capabilities
  const handleSubmit = useCallback(async () => {
    setErrors([]);
    setSubmissionSuccess(null);
    setSubmissionPath(null);
    if (generatedCapabilities.length === 0) {
      setErrors(["No epic capabilities have been generated for deployment."]);
      return;
    }

    setIsLoading(true);
    try {
      // Re-validate just before submission for ultimate robustness
      const validationErrors = await validate(generatedCapabilities);
      if (validationErrors && validationErrors.length > 0) {
        setErrors(validationErrors.map(err => `Pre-deployment Validation Error for record ${err?.recordId || 'N/A'}: ${err?.errors?.map(e => e.message).join(", ")}`));
        setIsLoading(false);
        return;
      }

      // flatfileSheetId and flatfileSpaceId are no longer relevant in this new AI-driven flow.
      // Assuming the GraphQL mutation input type for `accountCapabilities` is now flexible or
      // these fields are optional/removed from the mutation.
      const { data } = await bulkCreateAccountCapabilities({
        variables: {
          input: {
            connectionId,
            // flatfileSheetId: null, // Removed as data no longer comes from Flatfile
            // flatfileSpaceId: null, // Removed as data no longer comes from Flatfile
            accountCapabilities: generatedCapabilities.map(cap => ({
              name: cap.name,
              description: cap.description,
              isEnabled: cap.isEnabled,
              // Ensure all required fields for your AccountCapabilityInput are present
            })),
          },
        },
      });

      const { id } =
        data?.bulkCreateAccountCapabilities?.connectionBulkImport ?? {};
      if (id) {
        setSubmissionSuccess(true);
        setSubmissionPath(`/operations/connection_bulk_imports/${id}`);
      } else {
        setSubmissionSuccess(false);
        setErrors(["Deployment failed: No connectionBulkImport ID returned from the backend."]);
      }
    } catch (error) {
      console.error("Capability deployment failed:", error);
      setSubmissionSuccess(false);
      setErrors(prev => [...prev, `Failed to deploy capabilities: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsLoading(false);
    }
  }, [generatedCapabilities, connectionId, bulkCreateAccountCapabilities, validate]);


  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto', fontFamily: 'Segoe UI, Arial, sans-serif', backgroundColor: '#f9fbfd', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#0A66C2', textAlign: 'center', fontSize: '2.5em', marginBottom: '15px' }}>🚀 Epic Capability Studio: Powering Future Finance 🚀</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#555', lineHeight: '1.6' }}>
        Unleash unparalleled potential by intelligently synthesizing and integrating account capabilities.
        Leverage cutting-edge AI (like Gemini) and seamless external app connectors to craft transformative solutions.
        This is not just an app; it's the future of financial innovation.
      </p>

      <div style={{ border: '1px solid #e0e7ee', borderRadius: '10px', padding: '25px', margin: '30px 0', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#333', fontSize: '1.8em', marginBottom: '20px', textAlign: 'center' }}>Choose Your Integration Superpower:</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', justifyContent: 'center', margin: '20px 0' }}>
          <button
            onClick={() => handleModeChange("natural_language")}
            style={{
              padding: '15px 25px', borderRadius: '30px', border: integrationMode === "natural_language" ? '3px solid #0A66C2' : '1px solid #ccc',
              backgroundColor: integrationMode === "natural_language" ? '#e6f7ff' : '#fff', cursor: 'pointer', fontSize: '1.1em',
              fontWeight: 'bold', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', transition: 'all 0.3s ease',
              transform: integrationMode === "natural_language" ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            ✍️ Natural Language AI Composer
          </button>
          <button
            onClick={() => handleModeChange("google_workspace")}
            style={{
              padding: '15px 25px', borderRadius: '30px', border: integrationMode === "google_workspace" ? '3px solid #0A66C2' : '1px solid #ccc',
              backgroundColor: integrationMode === "google_workspace" ? '#e6f7ff' : '#fff', cursor: 'pointer', fontSize: '1.1em',
              fontWeight: 'bold', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', transition: 'all 0.3s ease',
              transform: integrationMode === "google_workspace" ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            ☁️ Google Workspace Intelligence (Conceptual)
          </button>
          <button
            onClick={() => handleModeChange("salesforce")}
            style={{
              padding: '15px 25px', borderRadius: '30px', border: integrationMode === "salesforce" ? '3px solid #0A66C2' : '1px solid #ccc',
              backgroundColor: integrationMode === "salesforce" ? '#e6f7ff' : '#fff', cursor: 'pointer', fontSize: '1.1em',
              fontWeight: 'bold', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', transition: 'all 0.3s ease',
              transform: integrationMode === "salesforce" ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            💼 Salesforce Deep-Dive Analytics (Conceptual)
          </button>
          <button
            onClick={() => handleModeChange("smart_csv")}
            style={{
              padding: '15px 25px', borderRadius: '30px', border: integrationMode === "smart_csv" ? '3px solid #0A66C2' : '1px solid #ccc',
              backgroundColor: integrationMode === "smart_csv" ? '#e6f7ff' : '#fff', cursor: 'pointer', fontSize: '1.1em',
              fontWeight: 'bold', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', transition: 'all 0.3s ease',
              transform: integrationMode === "smart_csv" ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            💡 Smart CSV Processor (AI-Enhanced)
          </button>
        </div>

        {integrationMode === "natural_language" && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>Describe your future capabilities:</h3>
            <textarea
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="e.g., 'I need a comprehensive platform for intelligent lending, robust real-time fraud detection, and an AI-driven customer support system.'"
              rows={6}
              style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #a0a0a0', fontSize: '1.1em', resize: 'vertical' }}
              disabled={isLoading}
            />
          </div>
        )}

        {(integrationMode === "google_workspace" || integrationMode === "salesforce" || integrationMode === "smart_csv") && (
          <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed #0A66C2', borderRadius: '10px', backgroundColor: '#f0f8ff', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1em', color: '#444', lineHeight: '1.5' }}>
              {integrationMode === "google_workspace" && "This module would securely integrate with your Google Workspace to analyze strategic documents, emails, and collaborative data. Our AI would then infer and propose high-impact account capabilities tailored to your organizational goals. Imagine AI parsing your strategic docs and automatically generating business features!"}
              {integrationMode === "salesforce" && "Connect directly to Salesforce to perform deep-dive analytics on your CRM data. Our AI will identify customer pain points, emerging market trends, and unmet needs, automatically proposing new, highly targeted capabilities that drive growth. Customer-centric innovation, redefined!"}
              {integrationMode === "smart_csv" && "Upload a 'smart' CSV here. Beyond basic parsing, our advanced AI intelligently enriches, corrects, and expands your raw data. It suggests related capabilities, identifies data anomalies, and ensures data integrity far beyond traditional methods, turning raw data into strategic assets!"}
            </p>
            <button
              onClick={() => setNaturalLanguageInput(`Simulated data stream from ${integrationMode} integration source.`)} // Provide conceptual input for mock AI
              style={{
                padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: '#6c757d',
                color: '#fff', cursor: 'pointer', fontSize: '1em', marginTop: '20px', fontWeight: 'bold',
                transition: 'background-color 0.3s ease',
                opacity: isLoading ? 0.7 : 1
              }}
              disabled={isLoading}
            >
              Simulate {integrationMode === "smart_csv" ? "AI-Enhanced Upload" : "Data Integration"}
            </button>
          </div>
        )}

        <button
          onClick={handleGenerateCapabilities}
          disabled={isLoading || !integrationMode || (integrationMode === "natural_language" && !naturalLanguageInput.trim())}
          style={{
            marginTop: '30px', width: '100%', padding: '18px', borderRadius: '10px',
            backgroundColor: '#28a745', color: '#fff', fontSize: '1.4em', fontWeight: 'bold',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
            opacity: isLoading || !integrationMode || (integrationMode === "natural_language" && !naturalLanguageInput.trim()) ? 0.6 : 1,
            boxShadow: '0 6px 15px rgba(40,167,69,0.3)'
          }}
        >
          {isLoading ? '🧠 AI Forging Capabilities...' : '✨ Generate Epic Capabilities with AI'}
        </button>
      </div>

      {errors.length > 0 && (
        <div style={{ backgroundColor: '#fdeded', color: '#a31f2c', padding: '15px', borderRadius: '8px', margin: '25px 0', border: '1px solid #f4c0c0', boxShadow: '0 2px 8px rgba(244,192,192,0.2)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>🚫 Critical Errors Detected:</h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
            {errors.map((error, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {generatedCapabilities.length > 0 && (
        <div style={{ border: '1px solid #0A66C2', borderRadius: '10px', padding: '25px', margin: '30px 0', backgroundColor: '#e6f7ff', boxShadow: '0 8px 20px rgba(10,102,194,0.2)' }}>
          <h2 style={{ color: '#0A66C2', fontSize: '1.8em', marginBottom: '20px', textAlign: 'center' }}>🔥 AI-Generated Capabilities: Ready for Deployment 🔥</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {generatedCapabilities.map((cap, index) => (
              <li key={index} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '5px solid #0A66C2', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <strong style={{ fontSize: '1.2em', color: '#333' }}>{cap.name}</strong>: <span style={{ color: '#555' }}>{cap.description}</span> (<span style={{ fontWeight: 'bold', color: cap.isEnabled ? '#28a745' : '#dc3545' }}>{cap.isEnabled ? 'Enabled' : 'Disabled'}</span>)
              </li>
            ))}
          </ul>
          <button
            onClick={handleSubmit}
            disabled={isLoading || errors.length > 0}
            style={{
              marginTop: '30px', width: '100%', padding: '18px', borderRadius: '10px',
              backgroundColor: '#0A66C2', color: '#fff', fontSize: '1.4em', fontWeight: 'bold',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
              opacity: isLoading || errors.length > 0 ? 0.6 : 1,
              boxShadow: '0 6px 15px rgba(10,102,194,0.3)'
            }}
          >
            {isLoading ? '💾 Deploying Capabilities...' : '🚀 Deploy These Epic Capabilities Now!'}
          </button>
        </div>
      )}

      {submissionSuccess !== null && (
        <div style={{
          backgroundColor: submissionSuccess ? '#d4edda' : '#f8d7da',
          color: submissionSuccess ? '#155724' : '#721c24',
          padding: '20px', borderRadius: '8px', margin: '25px 0',
          border: submissionSuccess ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {submissionSuccess ? (
            <>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5em' }}>🎉 Success! Capabilities Deployed with Stellar Precision!</h3>
              <p style={{ fontSize: '1.1em' }}>Your innovative capabilities have been seamlessly integrated. View the deployment status <a href={submissionPath || '#'} style={{ color: submissionSuccess ? '#155724' : '#721c24', fontWeight: 'bold', textDecoration: 'underline' }}>here</a>.</p>
            </>
          ) : (
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5em' }}>❌ Deployment Failed. Critical Error Encountered.</h3>
          )}
        </div>
      )}
    </div>
  );
}

export default EpicCapabilityStudio;