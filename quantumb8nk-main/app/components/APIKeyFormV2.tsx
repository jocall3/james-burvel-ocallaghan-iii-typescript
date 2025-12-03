// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { Field, Form, Formik, FormikProps } from "formik";
import React, { useRef } from "react";
import * as Yup from "yup";
import {
  FormikInputField,
  FormikErrorMessage,
  FormikSelectField,
  FormikCheckboxField,
} from "../../common/formik"; // Assuming FormikCheckboxField is available or can be added
import { Button, Label } from "../../common/ui-components";
import { cn } from "~/common/utilities/cn";

export interface CosmicIntegrationFormValues {
  integrationName: string;
  integrationType: "GEMINI_AI" | "SALESFORCE_CRM" | "CUSTOM_API";
  // Gemini specific
  geminiApiKey?: string;
  geminiModel?: "gemini-pro" | "gemini-vision" | "gemini-ultra";
  geminiAdvancedPrompt?: string;
  geminiAIPoweredContentGenerationEnabled?: boolean;
  // Salesforce specific
  salesforceConsumerKey?: string;
  salesforceConsumerSecret?: string;
  salesforceIntegrationFlowId?: string;
  // Custom API specific
  customApiEndpoint?: string;
  customApiAuthToken?: string;
  customApiHeaders?: string; // Storing as JSON string
  // Universal advanced features
  realtimeSyncOrchestrationEnabled: boolean;
  monetizationStrategy: "SUBSCRIPTION" | "USAGE_BASED" | "FREEMIUM" | "ENTERPRISE_CUSTOM";
}

interface CosmicIntegrationFormProps {
  initialValues: CosmicIntegrationFormValues;
  submitMutation: (values: CosmicIntegrationFormValues) => void;
  isUpdating?: boolean;
}

function CosmicIntegrationHub({
  initialValues,
  submitMutation,
  isUpdating,
}: CosmicIntegrationFormProps) {
  const formikRef = useRef<FormikProps<CosmicIntegrationFormValues>>(null);

  const validate = () =>
    Yup.object().shape({
      integrationName: Yup.string()
        .required("A unique cosmic integration name is required.")
        .min(3, "Must be at least 3 characters.")
        .max(50, "Cannot exceed 50 characters."),
      integrationType: Yup.string()
        .oneOf(["GEMINI_AI", "SALESFORCE_CRM", "CUSTOM_API"])
        .required("Please select an integration type."),
      geminiApiKey: Yup.string().when("integrationType", {
        is: "GEMINI_AI",
        then: Yup.string().required("Gemini API Key is essential for AI magic."),
      }),
      geminiModel: Yup.string().when("integrationType", {
        is: "GEMINI_AI",
        then: Yup.string().required("Choose a Gemini model to unleash its power."),
      }),
      geminiAdvancedPrompt: Yup.string().when("integrationType", {
        is: "GEMINI_AI",
        then: Yup.string().max(2000, "Prompt too long for cosmic clarity."),
      }),
      salesforceConsumerKey: Yup.string().when("integrationType", {
        is: "SALESFORCE_CRM",
        then: Yup.string().required("Salesforce Consumer Key is required."),
      }),
      salesforceConsumerSecret: Yup.string().when("integrationType", {
        is: "SALESFORCE_CRM",
        then: Yup.string().required("Salesforce Consumer Secret is required."),
      }),
      customApiEndpoint: Yup.string().when("integrationType", {
        is: "CUSTOM_API",
        then: Yup.string().url("Must be a valid URL for your custom endpoint.").required("Custom API Endpoint is required."),
      }),
      customApiAuthToken: Yup.string().when("integrationType", {
        is: "CUSTOM_API",
        then: Yup.string().min(5, "Auth token too short for secure transmission."),
      }),
      customApiHeaders: Yup.string().when("integrationType", {
        is: "CUSTOM_API",
        then: Yup.string().test(
          "is-json",
          "Headers must be a valid JSON string (e.g., {'Content-Type': 'application/json'})",
          (value) => {
            if (!value) return true;
            try {
              JSON.parse(value);
              return true;
            } catch (e) {
              return false;
            }
          }
        ),
      }),
      monetizationStrategy: Yup.string()
        .oneOf(["SUBSCRIPTION", "USAGE_BASED", "FREEMIUM", "ENTERPRISE_CUSTOM"])
        .required("Define your monetization strategy for millions!"),
      realtimeSyncOrchestrationEnabled: Yup.boolean(),
      geminiAIPoweredContentGenerationEnabled: Yup.boolean(),
    });

  const integrationTypeOptions = [
    { label: "Gemini AI: The Brain of the Universe", value: "GEMINI_AI" },
    { label: "Salesforce CRM: Your Customer Constellation", value: "SALESFORCE_CRM" },
    { label: "Custom API: Forge Your Own Destiny", value: "CUSTOM_API" },
  ];

  const geminiModelOptions = [
    { label: "Gemini Pro (Text & Image)", value: "gemini-pro" },
    { label: "Gemini Vision (Image & Video Focus)", value: "gemini-vision" },
    { label: "Gemini Ultra (Ultimate Power)", value: "gemini-ultra" },
  ];

  const monetizationStrategyOptions = [
    { label: "Subscription Tiers", value: "SUBSCRIPTION" },
    { label: "Usage-Based Billing", value: "USAGE_BASED" },
    { label: "Freemium Model", value: "FREEMIUM" },
    { label: "Enterprise Custom Agreements", value: "ENTERPRISE_CUSTOM" },
  ];

  return (
    <div className="form-create form-create-wide">
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => submitMutation(values)}
        innerRef={formikRef as React.RefObject<FormikProps<CosmicIntegrationFormValues>>}
        validationSchema={validate}
        enableReinitialize // Important for conditional validation after initialValues change
      >
        {({ values, setFieldValue }: FormikProps<CosmicIntegrationFormValues>) => (
          <Form>
            <div className="w-full space-y-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {isUpdating ? "Refine" : "Launch"} Your Cosmic Integration
              </h1>

              <div>
                <Label htmlFor="integrationName">Integration Name</Label>
                <Field
                  id="integrationName"
                  name="integrationName"
                  component={FormikInputField}
                  placeholder="e.g., 'Aether Marketing Engine', 'Chronos Data Nexus'"
                />
                <FormikErrorMessage name="integrationName" />
                <p className="text-sm text-gray-500 mt-1">Give your epic integration a legendary name.</p>
              </div>

              <div>
                <Label htmlFor="integrationType">Integration Type</Label>
                <Field
                  formikRef={formikRef}
                  id="integrationType"
                  options={integrationTypeOptions}
                  name="integrationType"
                  type="select"
                  placeholder="Select the core of your integration"
                  component={FormikSelectField}
                  onChange={(value: { value: string; label: string }) => {
                    void setFieldValue("integrationType", value ? value.value : null);
                    // Reset specific fields when integration type changes to avoid stale data
                    void setFieldValue("geminiApiKey", "");
                    void setFieldValue("geminiModel", "");
                    void setFieldValue("geminiAdvancedPrompt", "");
                    void setFieldValue("geminiAIPoweredContentGenerationEnabled", false);
                    void setFieldValue("salesforceConsumerKey", "");
                    void setFieldValue("salesforceConsumerSecret", "");
                    void setFieldValue("salesforceIntegrationFlowId", "");
                    void setFieldValue("customApiEndpoint", "");
                    void setFieldValue("customApiAuthToken", "");
                    void setFieldValue("customApiHeaders", "");
                  }}
                  className={cn(
                    "h-10 w-full rounded-md border border-border-default px-3 py-2 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                  )}
                />
                <FormikErrorMessage name="integrationType" />
                <p className="text-sm text-gray-500 mt-1">Choose the external app that fuels your vision.</p>
              </div>

              {values.integrationType === "GEMINI_AI" && (
                <div className="integration-section p-6 border rounded-md bg-blue-50/50 space-y-4">
                  <h2 className="text-xl font-semibold text-blue-800">Gemini AI Configuration: Unleash Cognition</h2>
                  <div>
                    <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                    <Field
                      id="geminiApiKey"
                      name="geminiApiKey"
                      component={FormikInputField}
                      type="password"
                      placeholder="Enter your top-secret Gemini key"
                    />
                    <FormikErrorMessage name="geminiApiKey" />
                    <p className="text-sm text-gray-500 mt-1">The key to unlock Gemini's vast intelligence.</p>
                  </div>
                  <div>
                    <Label htmlFor="geminiModel">Gemini Model Selection</Label>
                    <Field
                      formikRef={formikRef}
                      id="geminiModel"
                      options={geminiModelOptions}
                      name="geminiModel"
                      type="select"
                      placeholder="Choose your AI's specialized skillset"
                      component={FormikSelectField}
                      className={cn(
                        "h-10 w-full rounded-md border border-border-default px-3 py-2 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                      )}
                    />
                    <FormikErrorMessage name="geminiModel" />
                    <p className="text-sm text-gray-500 mt-1">Select the perfect Gemini model for your cosmic tasks.</p>
                  </div>
                  <div>
                    <Label htmlFor="geminiAdvancedPrompt">Advanced AI Directive (Initial Prompt)</Label>
                    <Field
                      id="geminiAdvancedPrompt"
                      name="geminiAdvancedPrompt"
                      component={FormikInputField}
                      as="textarea"
                      rows={4}
                      placeholder="Craft a powerful prompt to guide Gemini's brilliance (e.g., 'Act as a visionary product designer...')"
                    />
                    <FormikErrorMessage name="geminiAdvancedPrompt" />
                    <p className="text-sm text-gray-500 mt-1">Sculpt Gemini's initial thought processes for optimal results.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Field
                      id="geminiAIPoweredContentGenerationEnabled"
                      name="geminiAIPoweredContentGenerationEnabled"
                      component={FormikCheckboxField}
                    />
                    <Label htmlFor="geminiAIPoweredContentGenerationEnabled" className="text-base cursor-pointer">
                      Enable AI-Powered Content Generation (Auto-Drafting)
                    </Label>
                  </div>
                </div>
              )}

              {values.integrationType === "SALESFORCE_CRM" && (
                <div className="integration-section p-6 border rounded-md bg-green-50/50 space-y-4">
                  <h2 className="text-xl font-semibold text-green-800">Salesforce CRM: Customer Constellation Mapping</h2>
                  <div>
                    <Label htmlFor="salesforceConsumerKey">Salesforce Consumer Key</Label>
                    <Field
                      id="salesforceConsumerKey"
                      name="salesforceConsumerKey"
                      component={FormikInputField}
                      type="password"
                      placeholder="Your Salesforce Connected App Consumer Key"
                    />
                    <FormikErrorMessage name="salesforceConsumerKey" />
                  </div>
                  <div>
                    <Label htmlFor="salesforceConsumerSecret">Salesforce Consumer Secret</Label>
                    <Field
                      id="salesforceConsumerSecret"
                      name="salesforceConsumerSecret"
                      component={FormikInputField}
                      type="password"
                      placeholder="Your Salesforce Connected App Consumer Secret"
                    />
                    <FormikErrorMessage name="salesforceConsumerSecret" />
                  </div>
                  <div>
                    <Label htmlFor="salesforceIntegrationFlowId">Integration Flow ID (Optional)</Label>
                    <Field
                      id="salesforceIntegrationFlowId"
                      name="salesforceIntegrationFlowId"
                      component={FormikInputField}
                      placeholder="Reference to your pre-defined Salesforce flow"
                    />
                    <FormikErrorMessage name="salesforceIntegrationFlowId" />
                    <p className="text-sm text-gray-500 mt-1">Integrate with existing Salesforce automation flows for seamless operations.</p>
                  </div>
                </div>
              )}

              {values.integrationType === "CUSTOM_API" && (
                <div className="integration-section p-6 border rounded-md bg-purple-50/50 space-y-4">
                  <h2 className="text-xl font-semibold text-purple-800">Custom API: Forge Your Own Destiny</h2>
                  <div>
                    <Label htmlFor="customApiEndpoint">Custom API Endpoint URL</Label>
                    <Field
                      id="customApiEndpoint"
                      name="customApiEndpoint"
                      component={FormikInputField}
                      placeholder="https://your-custom-api.com/v1/data"
                    />
                    <FormikErrorMessage name="customApiEndpoint" />
                    <p className="text-sm text-gray-500 mt-1">The cosmic address for your bespoke backend.</p>
                  </div>
                  <div>
                    <Label htmlFor="customApiAuthToken">Authentication Token (Bearer/API Key)</Label>
                    <Field
                      id="customApiAuthToken"
                      name="customApiAuthToken"
                      component={FormikInputField}
                      type="password"
                      placeholder="Your custom API's authentication token"
                    />
                    <FormikErrorMessage name="customApiAuthToken" />
                    <p className="text-sm text-gray-500 mt-1">Secure the transmission of your valuable data.</p>
                  </div>
                  <div>
                    <Label htmlFor="customApiHeaders">Custom Request Headers (JSON)</Label>
                    <Field
                      id="customApiHeaders"
                      name="customApiHeaders"
                      component={FormikInputField}
                      as="textarea"
                      rows={3}
                      placeholder='{"Content-Type": "application/json", "X-Custom-Header": "Value"}'
                    />
                    <FormikErrorMessage name="customApiHeaders" />
                    <p className="text-sm text-gray-500 mt-1">Define bespoke HTTP headers for advanced API interactions.</p>
                  </div>
                </div>
              )}

              <div className="advanced-features p-6 border rounded-md bg-gray-50 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Universal Cosmic Enhancements</h2>
                <div className="flex items-center space-x-2">
                  <Field
                    id="realtimeSyncOrchestrationEnabled"
                    name="realtimeSyncOrchestrationEnabled"
                    component={FormikCheckboxField}
                  />
                  <Label htmlFor="realtimeSyncOrchestrationEnabled" className="text-base cursor-pointer">
                    Enable Real-time Sync Orchestration (Instant Data Flow)
                  </Label>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-6">Maintain perfect harmony across all integrated systems with immediate data synchronization.</p>
              </div>

              <div>
                <Label htmlFor="monetizationStrategy">Monetization Strategy: Blueprint for Millions</Label>
                <Field
                  formikRef={formikRef}
                  id="monetizationStrategy"
                  options={monetizationStrategyOptions}
                  name="monetizationStrategy"
                  type="select"
                  placeholder="How will this epic integration generate revenue?"
                  component={FormikSelectField}
                  className={cn(
                    "h-10 w-full rounded-md border border-border-default px-3 py-2 text-sm placeholder-gray-500 outline-none hover:border-gray-300 focus:border-blue-500 disabled:bg-gray-100",
                  )}
                />
                <FormikErrorMessage name="monetizationStrategy" />
                <p className="text-sm text-gray-500 mt-1">Strategize how your groundbreaking integration will captivate markets and earn millions.</p>
              </div>

            </div>
            <div className="flex flex-row space-x-4 pt-8">
              <Button isSubmit buttonType="primary">
                {isUpdating ? "Update Cosmic Blueprint" : "Launch Cosmic Integration"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default CosmicIntegrationHub;