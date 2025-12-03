// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from "react";
import { compose } from "redux";
import { reduxForm, formValueSelector, Field, change } from "redux-form";
import { connect } from "react-redux";
import { ClipLoader } from "react-spinners";
import CounterpartyDetailsForm from "./CounterpartyDetailsForm";
import CounterpartyAccountFormSection from "./CounterpartyAccountFormSection";
import DocumentUploadContainer from "../containers/DocumentUploadContainer";
import { Button, Alert } from "../../common/ui-components"; // Assuming Alert is available
import { COUNTERPARTY } from "../../generated/dashboard/types/resources";
import MetadataInput from "./MetadataInput";

/**
 * Component to simulate Gemini AI data enrichment for counterparty details.
 * It provides intelligent suggestions based on existing form data.
 */
const GeminiAIEnrichment = ({ currentName, currentAddress, onApplySuggestions, isLoadingForm }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState(null);

  const generateAISuggestions = async () => {
    setLoadingAI(true);
    setErrorAI(null);
    setSuggestions(null);
    try {
      // Simulate an API call to a backend service that integrates with Gemini AI.
      // In a commercial application, this would involve secure API keys and
      // robust error handling, potentially a serverless function or microservice.
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate AI processing time

      if (!currentName) {
        throw new Error("Counterparty Name is essential for AI enrichment. Please enter a name first.");
      }

      // Simulate highly detailed and context-aware AI-generated data
      const aiGeneratedDetails = {
        name: `${currentName} Global Synergy Corp.`,
        address: currentAddress || "42 Quantum Lane, Innovation City, CA 90210",
        industry: "Global FinTech & AI Innovation",
        description: `Leveraging cutting-edge Gemini AI, ${currentName} Global Synergy Corp. is revolutionizing enterprise solutions with predictive analytics, hyper-personalized client experiences, and robust regulatory compliance through intelligent automation. Their proprietary AI models deliver unparalleled insights, driving strategic growth and operational excellence across a diverse portfolio.`,
        tags: ["AI-Powered", "FinTech", "Global Markets", "Predictive Analytics", "Regulatory Tech", "Scalable Solutions"],
        foundedYear: 2023,
        ceoName: "Dr. Ava Turing",
      };

      setSuggestions(aiGeneratedDetails);
    } catch (err) {
      setErrorAI(err.message || "Failed to generate AI suggestions. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="form-section ai-enrichment-section">
      <h3 className="section-title">
        <span>✨ Gemini AI Copilot</span>
        <span className="addendum">Revolutionary Data Enrichment</span>
      </h3>
      {errorAI && <Alert type="error" message={errorAI} />}
      <p className="section-description">
        Unleash the power of Gemini AI to auto-populate and enrich counterparty details with
        intelligent, context-aware suggestions. Accelerate data entry and enhance accuracy to
        an unprecedented level.
      </p>
      <div className="form-group ai-action-group">
        <Button
          buttonType="secondary"
          onClick={generateAISuggestions}
          disabled={loadingAI || isLoadingForm}
        >
          {loadingAI ? (
            <>
              <ClipLoader size={16} color={"#fff"} /> Analyzing and Generating...
            </>
          ) : (
            "🚀 Ignite with Gemini AI Suggestions"
          )}
        </Button>
      </div>

      {suggestions && (
        <div className="ai-suggestions-preview card mt-3 p-3 shadow-sm">
          <h4 className="card-title">AI-Powered Suggestions:</h4>
          <ul className="list-unstyled">
            {Object.entries(suggestions).map(([key, value]) => (
              <li key={key} className="mb-1">
                <strong className="text-primary">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>{" "}
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </li>
            ))}
          </ul>
          <Button
            buttonType="primary"
            onClick={() => onApplySuggestions(suggestions)}
            className="mt-3 w-100"
          >
            ✅ Integrate AI Suggestions into Form
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Component to simulate seamless integration with various external enterprise applications.
 * Allows importing critical data from CRMs, ERPs, or accounting systems.
 */
const ExternalAppIntegration = ({ onImportData, isLoadingForm }) => {
  const [loadingApp, setLoadingApp] = useState(null); // Tracks which app is loading
  const [errorExternal, setErrorExternal] = useState(null);

  const importFromExternalApp = async (appName, simulatedData) => {
    setLoadingApp(appName);
    setErrorExternal(null);
    try {
      // Simulate a secure API call to a backend proxy that connects to external systems.
      // This would involve OAuth, API keys, and robust data mapping/transformation.
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call delay
      onImportData(simulatedData);
    } catch (err) {
      setErrorExternal(`Failed to import from ${appName}. Please check connection.`);
    } finally {
      setLoadingApp(null);
    }
  };

  return (
    <div className="form-section external-app-integration-section">
      <h3 className="section-title">
        <span>🌐 Universal Data Interlink</span>
        <span className="addendum">Seamless Enterprise Ecosystem Sync</span>
      </h3>
      {errorExternal && <Alert type="error" message={errorExternal} />}
      <p className="section-description">
        Connect to your vital enterprise applications to automatically synchronize and
        populate counterparty data. Eliminate manual entry, reduce errors, and ensure
        data consistency across your entire business ecosystem.
      </p>
      <div className="form-group d-flex flex-wrap gap-2">
        <Button
          buttonType="tertiary"
          onClick={() => importFromExternalApp("Salesforce", {
            name: "Salesforce Cloud Innovators Inc.",
            address: "1 Salesforce Tower, San Francisco, CA 94105",
            taxId: "SFCRM987654",
            industry: "Cloud CRM & Platform",
            description: "The global leader in cloud-based customer relationship management, empowering businesses to connect with customers in a whole new way.",
            contactPerson: "Marc Benioff",
          })}
          disabled={isLoadingForm || loadingApp !== null}
        >
          {loadingApp === 'Salesforce' ? (
            <>
              <ClipLoader size={16} color={"#fff"} /> Syncing Salesforce...
            </>
          ) : (
            "☁️ Sync from Salesforce CRM"
          )}
        </Button>
        <Button
          buttonType="tertiary"
          onClick={() => importFromExternalApp("QuickBooks", {
            name: "Intuit QuickBooks Accounting Solutions LLC",
            address: "2700 Coast Ave, Mountain View, CA 94043",
            taxId: "QBACC123456",
            industry: "Financial Software & Services",
            description: "Provider of industry-leading accounting software and financial management solutions for small to medium-sized businesses worldwide.",
            accountNumber: "QBI-987654321",
          })}
          disabled={isLoadingForm || loadingApp !== null}
        >
          {loadingApp === 'QuickBooks' ? (
            <>
              <ClipLoader size={16} color={"#fff"} /> Importing QuickBooks...
            </>
          ) : (
            "💰 Import from QuickBooks ERP"
          )}
        </Button>
        <Button
          buttonType="tertiary"
          onClick={() => importFromExternalApp("SAP", {
            name: "SAP Global Enterprise Systems SE",
            address: "Dietmar-Hopp-Allee 16, 69190 Walldorf, Germany",
            taxId: "SAPDE00123456789",
            industry: "Enterprise Resource Planning",
            description: "Market leader in enterprise application software, helping companies of all sizes and industries run at their best.",
            legalEntity: "SAP SE",
          })}
          disabled={isLoadingForm || loadingApp !== null}
        >
          {loadingApp === 'SAP' ? (
            <>
              <ClipLoader size={16} color={"#fff"} /> Connecting SAP...
            </>
          ) : (
            "💼 Connect to SAP S/4HANA"
          )}
        </Button>
      </div>
    </div>
  );
};


/**
 * The main Counterparty Onboarding Form, now supercharged with Gemini AI and
 * advanced external application integrations. Renamed to reflect its epic capabilities.
 */
function EpicCounterpartyOnboardingForm({
  handleSubmit,
  submitting,
  accounts,
  name,
  address, // Passed from Redux Form selector for AI input
  onPendingDocumentChange,
  change: reduxChange, // Renamed 'change' to 'reduxChange' for clarity within the component
}) {

  // Handler for applying AI suggestions to Redux Form fields
  const handleApplyAISuggestions = (suggestions) => {
    if (suggestions.name) reduxChange("name", suggestions.name);
    if (suggestions.address) reduxChange("address", suggestions.address);
    if (suggestions.industry) reduxChange("industry", suggestions.industry);
    if (suggestions.description) reduxChange("description", suggestions.description);
    if (suggestions.tags) reduxChange("tags", suggestions.tags);
    if (suggestions.foundedYear) reduxChange("founded_year", suggestions.foundedYear); // Assuming field 'founded_year'
    if (suggestions.ceoName) reduxChange("ceo_name", suggestions.ceoName); // Assuming field 'ceo_name'
  };

  // Handler for importing data from external apps to Redux Form fields
  const handleImportExternalData = (data) => {
    if (data.name) reduxChange("name", data.name);
    if (data.address) reduxChange("address", data.address);
    if (data.taxId) reduxChange("tax_id", data.taxId); // Assuming a 'tax_id' field
    if (data.industry) reduxChange("industry", data.industry);
    if (data.description) reduxChange("description", data.description);
    if (data.contactPerson) reduxChange("contact_person", data.contactPerson); // Assuming 'contact_person'
    if (data.accountNumber) reduxChange("account_number", data.accountNumber); // Assuming 'account_number'
    if (data.legalEntity) reduxChange("legal_entity", data.legalEntity); // Assuming 'legal_entity'
  };

  return (
    <form autoComplete="off" className="form-create">
      <h1 className="text-center mb-5 display-4 text-primary">
        🚀 The Epic Counterparty Onboarding Nexus 🚀
      </h1>

      {/* NEW: Prominent Gemini AI Integration Section */}
      <GeminiAIEnrichment
        currentName={name}
        currentAddress={address}
        onApplySuggestions={handleApplyAISuggestions}
        isLoadingForm={submitting} // Pass submitting state to disable AI actions during form submission
      />

      {/* NEW: Prominent External App Integration Section */}
      <ExternalAppIntegration
        onImportData={handleImportExternalData}
        isLoadingForm={submitting} // Pass submitting state to disable external app actions
      />

      {/* Existing Counterparty Details Form, now potentially pre-filled by AI or external apps */}
      <CounterpartyDetailsForm
        newCounterpartyForm
        onPendingDocumentChange={onPendingDocumentChange}
      />

      <div className="form-section">
        <h3>
          <span>Bank Accounts</span>
          <span className="addendum">OPTIONAL: Secure Financial Links</span>
        </h3>
        <CounterpartyAccountFormSection
          counterpartyName={name}
          accounts={accounts}
          formName="counterparty"
        />
      </div>

      <div className="form-section">
        <h3>
          <span>Counterparty Metadata</span>
          <span className="addendum">OPTIONAL: Advanced Categorization</span>
        </h3>
        <Field
          name="receiving_entity_metadata"
          component={MetadataInput}
          props={{
            resource: COUNTERPARTY,
            onChange: (metadata) => {
              reduxChange("receiving_entity_metadata", {
                ...metadata,
              });
            },
          }}
        />
      </div>

      <div className="form-section">
        <h3>
          <span>Documents</span>
          <span className="addendum">OPTIONAL: Compliance & Verification Engine</span>
        </h3>
        <DocumentUploadContainer
          skipInitialFetch
          enableSave={false}
          documentable_type="Counterparty"
          onPendingDocumentChange={onPendingDocumentChange}
        />
      </div>

      <div className="form-group submit-group mt-5">
        <Button
          buttonType="primary"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-lg w-100"
        >
          {submitting ? (
            <>
              <ClipLoader size={20} color={"#fff"} /> Orchestrating Creation...
            </>
          ) : (
            "✨ Launch Counterparty with AI & Integrated Power ✨"
          )}
        </Button>
        {submitting ? (
          <p className="text-center mt-3 text-muted">Processing your epic request...</p>
        ) : undefined}
      </div>
    </form>
  );
}

const selector = formValueSelector("counterparty");
function mapStateToProps(state) {
  return {
    accounts: selector(state, "accounts"),
    name: selector(state, "name"),
    address: selector(state, "address"), // Added address to selector for AI input
    // Assuming 'address' is a field in the counterparty form.
    // If nested (e.g., `counterpartyDetails.address`), adjust selector accordingly.
  };
}

export default compose(
  connect(mapStateToProps, { change }),
  reduxForm({ form: "counterparty" }),
)(EpicCounterpartyOnboardingForm);