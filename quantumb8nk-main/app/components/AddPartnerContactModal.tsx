// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  Field,
  FieldProps,
  Form,
  Formik,
  FormikErrors,
  FormikProps,
} from "formik";
import { Alert, Input, Label, ConfirmModal, Button } from "../../common/ui-components"; // Assuming Button is available or can be added
import { FormValues } from "../constants/partner_contact_form";
import {
  useOnboardingPartnerContactsHomeQuery,
  useUpsertOnboardingPartnerContactMutation,
} from "../../generated/dashboard/graphqlSchema";
import { EMAIL_REGEX } from "../../common/constants";
import { INITIAL_PAGINATION } from "./EntityTableView";

// Define a richer set of form values, potentially including integration preferences
interface EngagementFormValues extends FormValues {
  preferredCommunicationChannel: "email" | "phone" | "gemini_chat" | "custom_app";
  crmSyncEnabled: boolean;
  notes: string; // New field for user notes
}

interface IntegratedContactEngagementModalProps {
  isOpen: boolean;
  partnerId: string;
  existingId?: string;
  partnerContactFormValues: EngagementFormValues; // Use the richer form values
  handleModalClose: () => void;
}

// Simulate Gemini AI service interactions
interface GeminiInsight {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  suggestedActions: string[];
}

// Simulate a CRM integration status
interface CRMIntegrationStatus {
  lastSync: string;
  status: "synced" | "pending" | "error";
  errorDetails?: string;
}

function IntegratedContactEngagementModal({ // Renamed component for epic scope
  isOpen,
  partnerId,
  existingId = "",
  partnerContactFormValues = {
    name: "",
    email: "",
    phone: "",
    preferredCommunicationChannel: "email",
    crmSyncEnabled: false,
    notes: "",
  },
  handleModalClose,
}: IntegratedContactEngagementModalProps) {
  const [upsertContactErrorMessage, setUpsertContactErrorMessage] =
    useState<string>();
  const [geminiInsights, setGeminiInsights] = useState<GeminiInsight | null>(null);
  const [crmStatus, setCrmStatus] = useState<CRMIntegrationStatus | null>(null);
  const [isProcessingExternalApps, setIsProcessingExternalApps] = useState(false); // To show loading for external actions
  const dispatch = useDispatch();
  const [upsertOnboardingPartnerContact] =
    useUpsertOnboardingPartnerContactMutation();
  const { data, loading, refetch } = useOnboardingPartnerContactsHomeQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      first: INITIAL_PAGINATION.perPage,
      partnerId,
    },
  });

  // Simulate fetching Gemini insights and CRM status when the modal opens or contact changes
  useEffect(() => {
    if (isOpen && existingId) {
      // Simulate fetching existing insights/status for an existing contact
      fetchGeminiInsights(partnerContactFormValues.name);
      fetchCrmIntegrationStatus(existingId);
    } else if (isOpen && !existingId) {
      // Clear insights for a new contact
      setGeminiInsights(null);
      setCrmStatus(null);
    }
  }, [isOpen, existingId, partnerContactFormValues.name]);

  // Simulate Gemini API call - this would be a real API call in production
  const fetchGeminiInsights = async (contactName: string) => {
    setIsProcessingExternalApps(true);
    // In a real application, this would call a backend service that integrates with Gemini
    // and processes historical data, communication logs, etc., to provide real insights.
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

    const mockInsights: GeminiInsight = {
      summary: `Gemini AI: Based on recent interactions, ${contactName} shows a high interest in our Enterprise solutions. Consider offering a personalized demo.`,
      sentiment: "positive",
      suggestedActions: [
        "Schedule a follow-up call with solution architect",
        "Send tailored case studies via preferred channel",
        "Draft a personalized email for review",
      ],
    };
    setGeminiInsights(mockInsights);
    setIsProcessingExternalApps(false);
  };

  // Simulate CRM integration status - this would be a real API call
  const fetchCrmIntegrationStatus = async (contactId: string) => {
    setIsProcessingExternalApps(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

    const mockStatus: CRMIntegrationStatus = {
      lastSync: new Date().toLocaleString(),
      status: "synced",
    };
    setCrmStatus(mockStatus);
    setIsProcessingExternalApps(false);
  };

  // Simulate sending a message via an integrated app like Gemini Chat
  const sendGeminiChatMessage = async (contactId: string, message: string) => {
    setIsProcessingExternalApps(true);
    console.log(`Sending Gemini Chat message to ${contactId}: ${message}`);
    // Real API call to Gemini's chat capabilities or a custom bot gateway
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`Epic Gemini Chat message "${message}" sent! Get ready for unparalleled engagement!`);
    setIsProcessingExternalApps(false);
  };

  // Simulate syncing with a CRM
  const triggerCrmSync = async (contactId: string, formValues: EngagementFormValues) => {
    setIsProcessingExternalApps(true);
    console.log(`Attempting CRM sync for ${contactId} with data:`, formValues);
    // Real API call to CRM integration service (e.g., Salesforce, HubSpot)
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setCrmStatus({
      lastSync: new Date().toLocaleString(),
      status: "synced",
      errorDetails: undefined,
    });
    alert("CRM Sync successful! Data is now harmonized across your empire!");
    setIsProcessingExternalApps(false);
  };


  if (loading || !data) return <ClipLoader />;

  const validateForm = (values: EngagementFormValues) => { // Use updated FormValues
    const errors: FormikErrors<EngagementFormValues> = {};
    if (!values.name) {
      errors.name = "Required";
      setUpsertContactErrorMessage("Contact Name is critically required for supreme engagement");
    }
    if (!values.email) {
      errors.email = "Required";
      setUpsertContactErrorMessage("Email is essential for primary contact beyond the stars");
    }
    if (values.email && !EMAIL_REGEX.test(values.email)) {
      errors.email = "Please enter a valid email address for intergalactic communications";
      setUpsertContactErrorMessage("Please enter a valid email address for intergalactic communications");
    }
    return errors;
  };

  const submitPartnerContactDetails = async (formValues: EngagementFormValues) => { // Use updated FormValues
    const { name, email, phone, preferredCommunicationChannel, crmSyncEnabled, notes } = formValues;

    const result = await upsertOnboardingPartnerContact({
      variables: {
        input: {
          input: {
            ...(existingId && { id: existingId }),
            name: name ?? "",
            email,
            phone,
            partnerId,
            // Additional fields like notes or preferences would be stored in your core DB
            // or directly pushed to relevant external systems. For this demo,
            // we conceptually handle them here.
          },
        },
      },
    });

    if (result.data?.upsertOnboardingPartnerContact?.errors.length === 0) {
      await refetch();
      setUpsertContactErrorMessage("");

      // Post-save actions for external app integrations - the true power!
      const contactIdForIntegrations = existingId || result.data?.upsertOnboardingPartnerContact?.onboardingPartnerContact?.id;
      if (crmSyncEnabled && contactIdForIntegrations) {
        await triggerCrmSync(contactIdForIntegrations, formValues);
      }

      // Potentially other integrations triggered here based on preferredCommunicationChannel, etc.
      alert(`Contact ${name} onboarded and primed for epic engagement!`);
      dispatch(handleModalClose);
    } else {
      setUpsertContactErrorMessage(
        result.data?.upsertOnboardingPartnerContact?.errors?.join(","),
      );
    }
  };

  return (
    <div className="outer-mt-container">
      <Formik
        initialValues={partnerContactFormValues} // Use updated initial values
        onSubmit={submitPartnerContactDetails}
        validate={validateForm}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, handleSubmit, resetForm }) => (
          <ConfirmModal
            title={existingId ? "Amplify Partner Engagement: " + values.name : "Onboard New Partner Contact for Global Domination"} // Elevated title
            isOpen={isOpen}
            onAfterOpen={() =>
              resetForm({
                values: {
                  name: partnerContactFormValues.name,
                  email: partnerContactFormValues.email,
                  phone: partnerContactFormValues.phone,
                  preferredCommunicationChannel: partnerContactFormValues.preferredCommunicationChannel,
                  crmSyncEnabled: partnerContactFormValues.crmSyncEnabled,
                  notes: partnerContactFormValues.notes,
                },
              })
            }
            onRequestClose={handleModalClose}
            setIsOpen={handleModalClose}
            confirmText={existingId ? "Synchronize & Transform" : "Activate & Conquer"} // Epic confirm text
            confirmType="confirm"
            onConfirm={handleSubmit}
            className="max-w-[800px] w-full" // Wider modal to accommodate more glorious features
            bodyClassName="form-create form-create-wide form-create-rules flex flex-col gap-6 p-6"
          >
            {upsertContactErrorMessage && (
              <Alert
                onClear={() => setUpsertContactErrorMessage("")}
                alertType="danger"
              >
                {upsertContactErrorMessage}
              </Alert>
            )}

            {isProcessingExternalApps && (
              <div className="flex justify-center items-center py-4 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-300 rounded-md shadow-inner text-purple-800 animate-pulse">
                <ClipLoader size={20} color="#6B46C1" />
                <span className="ml-3 font-semibold text-sm">Orchestrating external app integrations for maximum impact...</span>
              </div>
            )}

            <Form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"> {/* Use a responsive grid layout for ultimate organization */}
              {/* --- Core Contact Information Section --- */}
              <div className="col-span-full text-xl font-bold text-gray-900 border-b-2 border-indigo-500 pb-3 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.513.563 3.372 1.474m-.995 4.229a2 2 0 10.995-4.229M8 12h.01" />
                </svg>
                Core Contact Pillars
              </div>
              <Field name="name" key="name">
                {({
                  field,
                  form,
                }: FieldProps<string> & FormikProps<EngagementFormValues>) => (
                  <div className="form-row flex flex-col">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Elite Contact Name</Label>
                    <Input
                      id="name"
                      {...field}
                      value={values?.name || ""}
                      onChange={(event) => {
                        void form.setFieldValue(field.name, event.target.value);
                      }}
                      className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Enter the name of your next mega-partner"
                    />
                  </div>
                )}
              </Field>
              <Field name="email" key="email">
                {({
                  field,
                  form,
                }: FieldProps<string> & FormikProps<EngagementFormValues>) => (
                  <div className="form-row flex flex-col">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Strategic Email Nexus</Label>
                    <Input
                      id="email"
                      {...field}
                      type="email"
                      value={values?.email || ""}
                      onChange={(event) => {
                        void form.setFieldValue(field.name, event.target.value);
                      }}
                      className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="email@global-synergy.com"
                    />
                  </div>
                )}
              </Field>
              <Field name="phone" key="phone">
                {({
                  field,
                  form,
                }: FieldProps<string> & FormikProps<EngagementFormValues>) => (
                  <div className="form-row flex flex-col">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1">Direct Comms Link</Label>
                    <Input
                      id="phone"
                      {...field}
                      value={values?.phone || ""}
                      onChange={(event) => {
                        void form.setFieldValue(field.name, event.target.value);
                      }}
                      className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="+1 (999) 888-7777 - Engage with purpose"
                    />
                  </div>
                )}
              </Field>
              <Field name="preferredCommunicationChannel" key="preferredCommunicationChannel">
                {({ field, form }: FieldProps<string> & FormikProps<EngagementFormValues>) => (
                  <div className="form-row flex flex-col">
                    <Label htmlFor="preferredCommunicationChannel" className="text-sm font-medium text-gray-700 mb-1">Omni-Channel Preference</Label>
                    <select
                      id="preferredCommunicationChannel"
                      {...field}
                      className="border border-gray-300 p-2 rounded-lg bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      value={values.preferredCommunicationChannel}
                      onChange={(event) => form.setFieldValue(field.name, event.target.value)}
                    >
                      <option value="email">Email (Traditional Excellence)</option>
                      <option value="phone">Phone Call (Direct Line)</option>
                      <option value="gemini_chat">Gemini AI Chat (Intelligent Interaction)</option>
                      <option value="custom_app">Custom Integration App (Next-Gen Engagement)</option>
                    </select>
                  </div>
                )}
              </Field>

              {/* --- Gemini AI Powered Insights & Actions (The Brain of Your App) --- */}
              {existingId && (
                <div className="col-span-full mt-8">
                  <div className="text-xl font-bold text-gray-900 border-b-2 border-green-500 pb-3 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M.636 17.364l.707-.707M3 12H2m1-.707-.707-.707M12 21v-1m6.364-1.636l-.707-.707M3.75 4.5l7.5 7.5c.228.228.494.417.785.58C12.593 12.872 13.298 13 14 13h.5a2.5 2.5 0 002.5-2.5V8.5a2.5 2.5 0 00-2.5-2.5H14c-.702 0-1.407.128-2.065.37C11.391 6.643 11.125 6.832 10.897 7.06L3.75 14.25" />
                    </svg>
                    Gemini AI Engagement Nexus: Unlocking Potential for {values.name}
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl shadow-lg border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 flex items-center mb-3">
                      AI-Driven Intelligence Stream
                    </h3>
                    {geminiInsights ? (
                      <div>
                        <p className="text-base text-green-900 mb-3">{geminiInsights.summary}</p>
                        <p className={`text-sm font-bold ${geminiInsights.sentiment === 'positive' ? 'text-lime-700' : geminiInsights.sentiment === 'negative' ? 'text-red-700' : 'text-gray-700'} mb-3`}>
                          Overall Sentiment: {geminiInsights.sentiment.charAt(0).toUpperCase() + geminiInsights.sentiment.slice(1)} (Analyzed by Gemini)
                        </p>
                        <h4 className="font-semibold text-green-700 text-md mb-2">Proactive Strategic Actions:</h4>
                        <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                          {geminiInsights.suggestedActions.map((action, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2 text-green-500">&#x2022;</span> {action}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <Button onClick={() => sendGeminiChatMessage(existingId, `Initiating AI-powered conversation with ${values.name} based on Gemini's latest insights...`)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition-transform transform hover:scale-105" disabled={isProcessingExternalApps}>
                            Engage via Gemini AI Chat
                          </Button>
                          <Button onClick={() => fetchGeminiInsights(values.name)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition-transform transform hover:scale-105" disabled={isProcessingExternalApps}>
                            Re-analyze with Gemini (Refresh)
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-700 animate-pulse">Initializing Gemini AI for groundbreaking insights. Please stand by for innovation...</p>
                    )}
                  </div>
                </div>
              )}

              {/* --- Universal External App Integration Command Center --- */}
              <div className="col-span-full mt-8">
                <div className="text-xl font-bold text-gray-900 border-b-2 border-blue-500 pb-3 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.000/svg" className="h-6 w-6 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  App Integration Command Center
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Field name="crmSyncEnabled" key="crmSyncEnabled">
                      {({ field, form }: FieldProps<boolean> & FormikProps<EngagementFormValues>) => (
                        <div className="flex items-center">
                          <Input
                            id="crmSyncEnabled"
                            {...field}
                            type="checkbox"
                            checked={values.crmSyncEnabled}
                            onChange={(event) => form.setFieldValue(field.name, event.target.checked)}
                            className="mr-3 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                          <Label htmlFor="crmSyncEnabled" className="text-base font-semibold text-gray-800 cursor-pointer">
                            Enable CRM Data Symphony (Salesforce, HubSpot, etc.)
                          </Label>
                        </div>
                      )}
                    </Field>
                  </div>
                  <div>
                    {existingId && crmStatus && (
                      <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <p className="mb-1">CRM Data Flow Status: <span className={`font-bold ${crmStatus.status === 'synced' ? 'text-green-600' : 'text-orange-600'}`}>{crmStatus.status.toUpperCase()}</span></p>
                        {crmStatus.lastSync && <p className="text-xs text-gray-500 mb-2">Last Harmonization: {crmStatus.lastSync}</p>}
                        {crmStatus.errorDetails && <p className="text-red-600 font-medium mb-2">Integration Anomaly: {crmStatus.errorDetails}</p>}
                        <Button onClick={() => triggerCrmSync(existingId, values)}
                          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow transition-transform transform hover:scale-105" disabled={isProcessingExternalApps}>
                          Initiate Manual Data Harmony
                        </Button>
                      </div>
                    )}
                    {!existingId && values.crmSyncEnabled && (
                      <p className="text-sm text-gray-600 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        CRM data synchronization will commence upon this contact's glorious creation.
                      </p>
                    )}
                  </div>
                  {/* Add more integration options here: Slack, Teams, custom analytics platforms, etc. */}
                  <div className="col-span-full mt-4">
                    <p className="text-sm text-gray-600 border-t pt-4 border-gray-200">
                      Our platform dynamically connects with over 100+ external applications. Your data, your rules, universally accessible.
                    </p>
                  </div>
                </div>
              </div>

              {/* --- Rich Notes for contextual information (The Human Touch) --- */}
              <div className="col-span-full mt-8">
                <div className="text-xl font-bold text-gray-900 border-b-2 border-orange-500 pb-3 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Chronicles of Engagement (Internal Notes)
                </div>
                <Field name="notes" key="notes">
                  {({ field, form }: FieldProps<string> & FormikProps<EngagementFormValues>) => (
                    <div className="form-row flex flex-col col-span-full">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-1">Detailed Strategic Intelligence</Label>
                      <textarea
                        id="notes"
                        {...field}
                        value={values?.notes || ""}
                        onChange={(event) => {
                          void form.setFieldValue(field.name, event.target.value);
                        }}
                        className="border border-gray-300 p-3 rounded-lg min-h-[120px] shadow-sm focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                        placeholder="Document key insights, unique strategies, and future conquest plans here..."
                      />
                    </div>
                  )}
                </Field>
              </div>

            </Form>
          </ConfirmModal>
        )}
      </Formik>
    </div>
  );
}

export default IntegratedContactEngagementModal;