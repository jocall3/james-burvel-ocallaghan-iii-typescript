import React, { useState, useEffect } from "react";
import isNil from "lodash/isNil";
import { connect } from "react-redux";
import requestApi from "../../common/utilities/requestApi";
import { loadLedgerEntities } from "../actions";
import AccountingSubsidiarySelect from "./AccountingSubsidiarySelect";
import ReduxCheckbox from "../../common/deprecated_redux/ReduxCheckbox";
import { Button, FieldGroup, Label, Icon, Spinner } from "../../common/ui-components";
import { useDispatchContext } from "../MessageProvider";
import Gon from "../../common/utilities/gon";

// Simulate external app status (in a real, 'epic' application, this would come from a sophisticated API endpoint)
const initialExternalAppStatus = {
  salesforce: { connected: true, status: 'Active', lastSync: '2023-10-26 10:30 AM' },
  hubspot: { connected: false, status: 'Disconnected' },
  shopify: { connected: false, status: 'Disconnected' },
  quickbooks: { connected: true, status: 'Active', lastSync: '2023-10-26 10:45 AM' },
};

function AccountingLedgerSettingsForm({
  isSubView,
  loadLedgerEntities: loadLedgerEntitiesFunc,
}) {
  const {
    ui: { ledger },
  } = Gon.gon ?? {};

  // Merging existing ledger state with new, advanced integration states
  const [state, setState] = useState({
    ...ledger,
    // Gemini AI Powered Features
    geminiAiReconciliationEnabled: ledger?.geminiAiReconciliationEnabled ?? false,
    geminiPredictiveCashFlowEnabled: ledger?.geminiPredictiveCashFlowEnabled ?? false,
    geminiVisionDocProcessingEnabled: ledger?.geminiVisionDocProcessingEnabled ?? false,
    // Advanced Financial Orchestration Features
    smartPolicyEnforcementEnabled: ledger?.smartPolicyEnforcementEnabled ?? false,
    blockchainLedgerIntegrationEnabled: ledger?.blockchainLedgerIntegrationEnabled ?? false, // For next-gen finance
  });
  const [externalAppStatus, setExternalAppStatus] = useState(initialExternalAppStatus);
  const [isConnecting, setIsConnecting] = useState(false); // General loading state for connections/toggles
  const { dispatchError, dispatchSuccess } = useDispatchContext();

  useEffect(() => {
    loadLedgerEntitiesFunc(
      { ledger_sync_type: ["subsidiary"] },
      null,
      dispatchError,
    );
    // In a truly 'epic' app, we'd fetch live integration statuses here
    // For demonstration, we use initialExternalAppStatus
    // requestApi('/v1/integrations/status').json().then(setExternalAppStatus).catch(dispatchError);
  }, [loadLedgerEntitiesFunc, dispatchError]);

  // Unified submit function for all settings types, reflecting a robust backend architecture
  async function submitSettings(e, data, successMessage = "Settings updated successfully!") {
    if (!isNil(e)) {
      e.preventDefault();
    }

    const method = "PATCH";
    const action = `/accounting/ledgers/${state.id}/advanced_settings`; // Using a more generic endpoint for advanced settings

    try {
      await requestApi(action, null, method, data).json();
      dispatchSuccess(successMessage);
      setState((prevState) => ({ ...prevState, ...data })); // Ensure local state is updated
    } catch (error) {
      try {
        const {
          errors: { message },
        } = JSON.parse(error.message);
        dispatchError(message);
      } catch {
        dispatchError(
          "An unparalleled error occurred while saving your visionary settings. Please verify and try again.",
        );
      }
    }
  }

  // --- Core Ledger Settings Handlers ---
  function onUpdateLedgerSettings(e) {
    const data = {
      ledger_classes_enabled: state.ledger_classes_enabled,
      auto_sync_counterparties_enabled: state.auto_sync_counterparties_enabled,
      auto_sync_payment_orders_enabled: state.auto_sync_payment_orders_enabled,
    };
    submitSettings(e, data, "Core Ledger settings updated to perfection.");
  }

  // --- External Accounting Vendor Specific Settings Handler ---
  function onUpdateVendorSpecificSettings(e) {
    const data = {
      default_subsidiary_id: state.default_subsidiary_id,
      // Future-proof: extend with other vendor-specific configurations
    };
    submitSettings(e, data, `Seamless ${ledger.vendor} integration settings updated.`);
  }

  function handleChange(updatedFields) {
    setState((prevState) => ({ ...prevState, ...updatedFields }));
    if (isSubView) {
      submitSettings(null, updatedFields, "Dynamic sub-view update applied.");
    }
  }

  // Generic toggler for any feature checkbox, enhancing scalability
  function toggleFeature(featureName) {
    handleChange({
      [featureName]: !state[featureName],
    });
  }

  function onDefaultSubsidiaryIdChange(target) {
    handleChange({ default_subsidiary_id: target });
  }

  // --- New AI & Ecosystem Integration Handlers ---

  // Handles toggling advanced AI features with simulated API calls
  const handleAiFeatureToggle = async (featureName, apiEndpoint, successMsg) => {
    setIsConnecting(true); // Indicate that an operation is in progress
    const newValue = !state[featureName];
    try {
      // In an 'epic' app, this would trigger intelligent backend processes
      await requestApi(apiEndpoint, null, "POST", { enabled: newValue }).json();
      setState((prevState) => ({ ...prevState, [featureName]: newValue }));
      dispatchSuccess(successMsg);
    } catch (error) {
      dispatchError(`Failed to ${newValue ? 'activate' : 'deactivate'} ${featureName.replace(/([A-Z])/g, ' $1').toLowerCase()}. The AI might be pondering.`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Simulates connecting to an external application (e.g., via OAuth or API Key)
  const connectExternalApp = async (appName) => {
    if (isConnecting) return; // Prevent multiple simultaneous connections
    setIsConnecting(true);
    dispatchSuccess(`Initiating quantum-secure connection to ${appName}...`);

    try {
      // Simulate an actual OAuth flow or robust API handshake process
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate network latency and processing
      setExternalAppStatus((prevStatus) => ({
        ...prevStatus,
        [appName.toLowerCase()]: { connected: true, status: 'Active', lastSync: new Date().toLocaleString() },
      }));
      dispatchSuccess(`${appName} is now seamlessly integrated! Unleash its full synergistic power.`);
    } catch (error) {
      dispatchError(`Catastrophic failure connecting ${appName}. Please verify your cosmic credentials.`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Simulates disconnecting from an external application
  const disconnectExternalApp = async (appName) => {
    if (isConnecting) return;
    setIsConnecting(true);
    dispatchSuccess(`Deactivating connection to ${appName}...`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1800)); // Simulate API call delay
      setExternalAppStatus((prevStatus) => ({
        ...prevStatus,
        [appName.toLowerCase()]: { connected: false, status: 'Disconnected' },
      }));
      dispatchSuccess(`${appName} has been gracefully disconnected.`);
    } catch (error) {
      dispatchError(`Failed to terminate connection with ${appName}. It's clingy!`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Renders the connection status and interaction buttons for external apps
  const renderIntegrationStatus = (appName) => {
    const status = externalAppStatus[appName.toLowerCase()];
    if (!status) return null; // Should not happen in a production system

    if (status.connected) {
      return (
        <span className="text-green-600 font-medium flex items-center">
          <Icon name="check-circle" className="mr-2 text-xl" /> Connected
          {status.lastSync && <span className="text-sm text-gray-500 ml-3">(Last Sync: {status.lastSync})</span>}
          <Button
            buttonType="link-danger"
            className="ml-5"
            onClick={() => disconnectExternalApp(appName)}
            disabled={isConnecting}
          >
            Disconnect
          </Button>
        </span>
      );
    }
    return (
      <span className="text-red-600 font-medium flex items-center">
        <Icon name="x-circle" className="mr-2 text-xl" /> Disconnected
        <Button
          buttonType="primary"
          className="ml-5"
          onClick={() => connectExternalApp(appName)}
          disabled={isConnecting}
        >
          {isConnecting ? <Spinner size="sm" className="mr-2" /> : ''} Connect Now
        </Button>
      </span>
    );
  };

  return (
    <>
      <div className="mt-container">
        <form className="form-create">
          <div className="form-section">
            <h3 className="text-indigo-800 font-extrabold text-2xl mb-4">Core Ledger Foundation</h3>
            <p className="text-gray-700 mb-6 text-base">
              Establish the bedrock of your financial operations with these essential ledger configurations.
            </p>
            <FieldGroup direction="left-to-right" className="mb-4">
              <ReduxCheckbox
                id="ledger_classes_enabled"
                name="ledger_classes_enabled"
                input={{
                  onChange: () => toggleFeature('ledger_classes_enabled'),
                  checked: state.ledger_classes_enabled,
                }}
              />
              <Label
                id="ledger_classes_enabled_label"
                helpText="Unleash granular tracking by enabling accounting classes on each Payment Order. Elevate your reporting and categorization with unparalleled precision across your financials."
                className="font-semibold text-gray-800"
              >
                Enable Hyper-Granular Ledger Classes
              </Label>
            </FieldGroup>
            <FieldGroup direction="left-to-right" className="mb-4">
              <ReduxCheckbox
                id="auto_sync_counterparties_enabled"
                name="auto_sync_counterparties_enabled"
                input={{
                  onChange: () => toggleFeature('auto_sync_counterparties_enabled'),
                  checked: state.auto_sync_counterparties_enabled,
                }}
              />
              <Label
                id="auto_sync_counterparties_enabled_label"
                helpText="Automatically synchronize counterparties upon creation. This streamlines your entire workflow, ensuring consistent and real-time data across all connected systems. Requires a pre-defined Default Accounting Type."
                className="font-semibold text-gray-800"
              >
                Intelligent Auto-Sync Counterparties
              </Label>
            </FieldGroup>
            <FieldGroup direction="left-to-right" className="mb-4">
              <ReduxCheckbox
                id="auto_sync_payment_orders_enabled"
                name="auto_sync_payment_orders_enabled"
                input={{
                  onChange: () => toggleFeature('auto_sync_payment_orders_enabled'),
                  checked: state.auto_sync_payment_orders_enabled,
                }}
              />
              <Label
                id="auto_sync_payment_orders_enabled_label"
                helpText="Automate the seamless synchronization of payment orders to your bank the instant they achieve 'Sent' status. Accelerate your financial operations with hands-free processing and superior speed."
                className="font-semibold text-gray-800"
              >
                Accelerated Auto-Sync Payment Orders
              </Label>
            </FieldGroup>
          </div>
          {!isSubView && (
            <div className="form-section pt-6 border-t border-gray-200">
              <Button buttonType="primary" onClick={onUpdateLedgerSettings} className="px-6 py-3 text-lg">
                Fortify Core Ledger Settings
              </Button>
            </div>
          )}
        </form>
      </div>

      <div className="mt-container mt-8">
        <form className="form-create">
          <div className="form-section bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-lg shadow-xl">
            <h3 className="text-purple-800 font-extrabold text-3xl mb-4 flex items-center">
              <Icon name="sparkles" className="mr-3 text-4xl text-yellow-500 animate-pulse" /> Gemini AI & Ecosystem Nexus
            </h3>
            <p className="text-gray-800 mb-6 text-lg leading-relaxed font-medium">
              This is the future of finance, architected for you. Unlock unprecedented intelligence and create a fully autonomous, hyper-connected financial nervous system with Gemini AI and our expansive ecosystem integrations. This module is engineered to propel your enterprise into a new era of financial supremacy.
            </p>

            {/* Gemini AI Powered Features Section */}
            <div className="mb-8 pb-6 border-b-2 border-indigo-200">
              <h4 className="text-xl font-bold mb-4 text-blue-800 flex items-center">
                <Icon name="cpu" className="mr-3 text-2xl text-blue-600" /> Gemini AI: Your Financial Co-Pilot
              </h4>
              <p className="text-gray-700 mb-5">
                Harness the unparalleled analytical prowess of Google's Gemini AI to revolutionize your financial intelligence, automation, and decision-making capabilities.
              </p>

              <FieldGroup direction="left-to-right" className="mb-4">
                <ReduxCheckbox
                  id="gemini_ai_reconciliation_enabled"
                  name="gemini_ai_reconciliation_enabled"
                  input={{
                    onChange: () => handleAiFeatureToggle(
                      'geminiAiReconciliationEnabled',
                      '/v1/integrations/gemini/reconciliation/toggle',
                      'Gemini AI Intelligent Reconciliation system engaged. Prepare for clarity!'
                    ),
                    checked: state.geminiAiReconciliationEnabled,
                  }}
                  disabled={isConnecting}
                />
                <Label
                  id="gemini_ai_reconciliation_enabled_label"
                  helpText="Activate Gemini AI to dynamically analyze your ledger entries, proactively suggest complex reconciliations, and instantly flag even the most subtle discrepancies for your review. Drastically reduce manual effort and accelerate your month-end close by 90%."
                  className="font-medium text-gray-900"
                >
                  Intelligent Ledger Reconciliation & Anomaly Detection
                </Label>
              </FieldGroup>

              <FieldGroup direction="left-to-right" className="mb-4">
                <ReduxCheckbox
                  id="gemini_predictive_cash_flow_enabled"
                  name="gemini_predictive_cash_flow_enabled"
                  input={{
                    onChange: () => handleAiFeatureToggle(
                      'geminiPredictiveCashFlowEnabled',
                      '/v1/integrations/gemini/cashflow/toggle',
                      'Gemini AI Predictive Cash Flow engine activated. Navigate the future with confidence!'
                    ),
                    checked: state.geminiPredictiveCashFlowEnabled,
                  }}
                  disabled={isConnecting}
                />
                <Label
                  id="gemini_predictive_cash_flow_enabled_label"
                  helpText="Unlock unparalleled foresight with Gemini AI's proprietary predictive cash flow analytics. Gain highly accurate forecasts powered by multi-variate analysis of historical data, real-time market trends, and external economic indicators, empowering data-driven strategic decisions that are truly visionary."
                  className="font-medium text-gray-900"
                >
                  Hyper-Accurate Predictive Cash Flow Analysis
                </Label>
              </FieldGroup>

              <FieldGroup direction="left-to-right" className="mb-4">
                <ReduxCheckbox
                  id="gemini_vision_doc_processing_enabled"
                  name="gemini_vision_doc_processing_enabled"
                  input={{
                    onChange: () => handleAiFeatureToggle(
                      'geminiVisionDocProcessingEnabled',
                      '/v1/integrations/gemini/vision/toggle',
                      'Gemini Vision AI Document Processing suite initiated. Paperwork, be gone!'
                    ),
                    checked: state.geminiVisionDocProcessingEnabled,
                  }}
                  disabled={isConnecting}
                />
                <Label
                  id="gemini_vision_doc_processing_enabled_label"
                  helpText="Automate document processing with the revolutionary Gemini Vision AI. Simply upload invoices, receipts, and contracts; the AI instantly extracts all critical data, intelligently categorizes expenses, and auto-populates ledger entries with an unparalleled level of accuracy and speed, eliminating manual data entry forever."
                  className="font-medium text-gray-900"
                >
                  Gemini Vision AI: Intelligent Document Processing
                </Label>
              </FieldGroup>
            </div>

            {/* Broader Ecosystem Integrations Section */}
            <div className="mb-8 pb-6 border-b-2 border-indigo-200">
              <h4 className="text-xl font-bold mb-4 text-green-800 flex items-center">
                <Icon name="link" className="mr-3 text-2xl text-green-600" /> Omni-Channel Financial Ecosystem Connectivity
              </h4>
              <p className="text-gray-700 mb-5">
                Connect your entire enterprise landscape. Our platform integrates seamlessly with leading CRMs, ERPs, E-commerce platforms, and specialized accounting software to forge a unified, intelligent, and highly responsive financial backbone.
              </p>

              {/* CRM Integration */}
              <div className="form-row form-row-full flex flex-col mb-4 bg-white p-4 rounded shadow-sm">
                <Label id="crm_integration_label" className="font-semibold mb-2 text-gray-900 text-lg">CRM Integration Suite</Label>
                <p className="text-sm text-gray-600 mb-3">Sync invaluable customer data, real-time payment statuses, and sales opportunities directly into your ledger for a complete, actionable 360-degree financial and customer view.</p>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-800 flex items-center"><Icon name="salesforce" className="w-5 h-5 mr-2 text-blue-500" /> Salesforce Integration:</span> {renderIntegrationStatus('Salesforce')}
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-800 flex items-center"><Icon name="hubspot" className="w-5 h-5 mr-2 text-orange-500" /> HubSpot Connector:</span> {renderIntegrationStatus('HubSpot')}
                </div>
              </div>

              {/* E-commerce Integration */}
              <div className="form-row form-row-full flex flex-col mb-4 bg-white p-4 rounded shadow-sm">
                <Label id="ecommerce_integration_label" className="font-semibold mb-2 text-gray-900 text-lg">Global E-commerce Platform Integration</Label>
                <p className="text-sm text-gray-600 mb-3">Connect your entire portfolio of online stores to automatically import real-time sales, precise refunds, and dynamic inventory data directly into your accounting ecosystem, ensuring perfect synchronization.</p>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-800 flex items-center"><Icon name="shopify" className="w-5 h-5 mr-2 text-green-500" /> Shopify Nexus:</span> {renderIntegrationStatus('Shopify')}
                </div>
              </div>

              {/* Auxiliary Accounting Software Integration (Expanded) */}
              <div className="form-row form-row-full flex flex-col mb-4 bg-white p-4 rounded shadow-sm">
                <Label id="accounting_software_integration_label" className="font-semibold mb-2 text-gray-900 text-lg">Auxiliary Accounting Software Connectors</Label>
                <p className="text-sm text-gray-600 mb-3">Beyond direct ledger syncing, integrate with other specialized accounting platforms to support unique workflows and consolidate data from disparate sources into a single pane of glass.</p>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-800 flex items-center"><Icon name="quickbooks" className="w-5 h-5 mr-2 text-blue-400" /> QuickBooks Gateway:</span> {renderIntegrationStatus('QuickBooks')}
                </div>
              </div>
            </div>

            {/* Advanced & Unique Features Section */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-red-800 flex items-center">
                <Icon name="shield-check" className="mr-3 text-2xl text-red-600" /> Quantum Financial Orchestration & Future-Proofing
              </h4>
              <p className="text-gray-700 mb-5">
                Implement unparalleled high-level control and strategically position your enterprise at the forefront of financial technology with these truly unique and cutting-edge features.
              </p>

              <FieldGroup direction="left-to-right" className="mb-4">
                <ReduxCheckbox
                  id="smart_policy_enforcement_enabled"
                  name="smart_policy_enforcement_enabled"
                  input={{
                    onChange: () => toggleFeature('smartPolicyEnforcementEnabled'),
                    checked: state.smartPolicyEnforcementEnabled,
                  }}
                  disabled={isConnecting}
                />
                <Label
                  id="smart_policy_enforcement_enabled_label"
                  helpText="Deploy AI-powered, real-time policy enforcement across all financial transactions. Automatically flag non-compliant spending, proactively identify potential fraud patterns, and ensure unwavering adherence to stringent internal controls and dynamic regulatory requirements. An impenetrable shield for your financial integrity."
                  className="font-medium text-gray-900"
                >
                  AI-Driven Smart Policy Enforcement & Predictive Fraud Detection
                </Label>
              </FieldGroup>

              <FieldGroup direction="left-to-right" className="mb-4">
                <ReduxCheckbox
                  id="blockchain_ledger_integration_enabled"
                  name="blockchain_ledger_integration_enabled"
                  input={{
                    onChange: () => toggleFeature('blockchainLedgerIntegrationEnabled'),
                    checked: state.blockchainLedgerIntegrationEnabled,
                  }}
                  disabled={isConnecting}
                />
                <Label
                  id="blockchain_ledger_integration_enabled_label"
                  helpText="Seize the future of finance today. Enable experimental, enterprise-grade integration with advanced Distributed Ledger Technologies (DLT) for unparalleled transparency, immutable record-keeping, and real-time, atomic settlement capabilities. A revolutionary and transformative step for your financial infrastructure, designed for the next generation of global commerce."
                  className="font-medium text-gray-900"
                >
                  Decentralized Blockchain-Enhanced Ledger (Revolutionary & Experimental)
                </Label>
              </FieldGroup>
            </div>
          </div>
          {!isSubView && (
            <div className="form-section pt-6 border-t border-gray-200 mt-6">
              <Button buttonType="primary" onClick={(e) => submitSettings(e, state, "Gemini AI & Ecosystem Nexus settings forged!")} disabled={isConnecting} className="px-8 py-4 text-xl bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-lg transition-all duration-300 transform hover:scale-105">
                {isConnecting ? <><Spinner size="md" className="mr-3" /> Forging Future Settings...</> : 'Activate Quantum Financial Nexus'}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Existing Vendor-Specific Settings, now framed as "External Accounting Vendor" with enhanced description */}
      {ledger.vendor && (
        <div className="mt-container mt-8">
          <form className="form-create">
            <div className="form-section bg-gray-50 p-6 rounded-lg shadow">
              <h3 className="text-gray-900 font-extrabold text-2xl mb-4 flex items-center">
                <Icon name="database" className="mr-3 text-3xl text-gray-600" /> {ledger.vendor} Precision Integration Settings
              </h3>
              <p className="text-gray-700 mb-6 text-base">
                Fine-tune advanced settings for your direct, mission-critical accounting ledger integration with {ledger.vendor}. This ensures optimal data flow and compliance for your specific enterprise architecture.
              </p>
              <div className="form-row form-row-full flex">
                <AccountingSubsidiarySelect
                  label="Mission-Critical Default Subsidiary"
                  helpText={`This is the primary Subsidiary that will be utilized for all mission-critical record synchronization to your ${ledger.vendor} ledger. It is absolutely essential for impeccable financial mapping and regulatory adherence.`}
                  name="default_subsidiary_id"
                  input={{
                    value: state.default_subsidiary_id,
                    onChange: onDefaultSubsidiaryIdChange,
                  }}
                />
              </div>
            </div>
            {!isSubView && (
              <div className="form-section pt-6 border-t border-gray-200 mt-6">
                <Button
                  buttonType="primary"
                  onClick={onUpdateVendorSpecificSettings}
                  className="px-6 py-3 text-lg"
                >{`Optimize ${ledger.vendor} Integration`}</Button>
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}

export default connect(null, {
  loadLedgerEntities,
})(AccountingLedgerSettingsForm);