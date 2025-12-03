// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import isEmpty from "lodash/isEmpty";
import { FieldGroup, Label, SelectField, Spinner, Button, Card, Text } from "../../common/ui-components"; // Assuming these exist, adding Card, Text, Spinner, Button
// Assume these actions are defined in your Redux setup, e.g., in `../../redux/actions/aiIntegrationActions`
import { fetchGeminiInsights, fetchExternalAppIntegrationStatus } from "../../redux/actions/aiIntegrationActions"; 

// --- Mock Gemini and External App Services ---
// In a real commercial application, these would be separate API client modules,
// configured with actual API keys and endpoints. For "executable code," we simulate them.

const mockGeminiService = {
  getFinancialInsights: async (subsidiaryId, subsidiaryData) => {
    console.log(`[Gemini Mock] Requesting insights for Subsidiary ID: ${subsidiaryId}`);
    await new Promise(resolve => setTimeout(Math.random() * 1500 + 500, resolve)); // Simulate API delay

    if (subsidiaryId === "sub_error_123") { // Example for error handling
      throw new Error("Gemini AI encountered a critical error for this subsidiary. Please check data integrity.");
    }

    const insightsPool = [
      `AI-powered prediction: ${subsidiaryData?.name || 'this entity'} is projected to increase revenue by 15% next quarter due to identified market shifts. Action: Explore new regional markets.`,
      `Compliance Alert: ${subsidiaryData?.name || 'this entity'} requires a review of local tax regulations in Q4 to avoid potential penalties. Priority: High.`,
      `Optimization Suggestion: Reallocate 10% of marketing budget from digital ads to strategic partnerships for ${subsidiaryData?.name || 'this entity'} for better ROI.`,
      `KPI Analysis: ${subsidiaryData?.name || 'this entity'}'s debt-to-equity ratio improved by 5% this quarter, indicating strong financial health. Consider expansion.`,
      `Risk Assessment: Supply chain vulnerabilities identified for ${subsidiaryData?.name || 'this entity'}. Recommendation: Diversify suppliers by 20% in the next 6 months.`,
      `Growth Opportunity: Unutilized capital of $2.5M in ${subsidiaryData?.name || 'this entity'} can be deployed into high-yield short-term investments.`,
    ];

    const specificInsightIndex = Math.floor(Math.random() * insightsPool.length);
    const specificInsight = insightsPool[specificInsightIndex];
    const sentiment = specificInsightIndex % 2 === 0 ? "positive" : (specificInsightIndex % 3 === 0 ? "neutral" : "alert");
    const riskLevel = Math.random() > 0.7 ? "high" : (Math.random() > 0.4 ? "medium" : "low");

    return {
      id: `gemini_insight_${Date.now()}`,
      subsidiaryId,
      summary: specificInsight,
      details: "Leverage the 'Deep Dive' button for comprehensive, interactive dashboards and scenario modeling powered by Gemini.",
      sentiment,
      riskLevel,
      generatedAt: new Date().toISOString(),
      actionableRecommendations: [
        "Review market expansion strategy",
        "Consult with tax compliance team",
        "Evaluate marketing budget allocation",
        "Explore investment options",
      ].filter(() => Math.random() > 0.5), // Randomly add recommendations
    };
  },
};

const mockExternalAppService = {
  getIntegrationStatus: async (subsidiaryId, appName) => {
    console.log(`[External App Mock] Checking status for ${appName} for Subsidiary ID: ${subsidiaryId}`);
    await new Promise(resolve => setTimeout(Math.random() * 800 + 200, resolve));

    const statusMap = {
      "ComplianceEngine": { isIntegrated: true, lastSync: "2023-10-26T10:00:00Z", health: "healthy" },
      "PredictiveAnalyticsPro": { isIntegrated: Math.random() > 0.3, lastSync: "2023-10-25T14:30:00Z", health: "needs_attention" },
      "GlobalTaxWizard": { isIntegrated: true, lastSync: "2023-10-26T09:15:00Z", health: "healthy" },
      "SpendOptimizationAI": { isIntegrated: Math.random() > 0.5, lastSync: "2023-10-26T11:00:00Z", health: "healthy" },
    };
    return statusMap[appName] || { isIntegrated: false, health: "unknown" };
  },
  triggerAction: async (subsidiaryId, actionType, payload) => {
    console.log(`[External App Mock] Triggering ${actionType} for Subsidiary ID: ${subsidiaryId} with payload:`, payload);
    await new Promise(resolve => setTimeout(Math.random() * 1000 + 300, resolve));
    if (Math.random() > 0.9) { // Simulate occasional failure
      throw new Error(`Failed to initiate ${actionType} due to external service timeout.`);
    }
    return { success: true, message: `Action '${actionType}' successfully initiated for subsidiary ${subsidiaryId}. Status will update shortly.` };
  }
};

// --- AccountingSubsidiarySelect Component (Now a Smart Financial Command Center) ---
function AccountingSubsidiarySelect({
  label,
  helpText,
  ledgerEntities,
  input: { value: selectValue, onChange: handleChange },
  geminiInsights, // From Redux state via mapStateToProps
  externalAppStatus, // From Redux state via mapStateToProps
  fetchGeminiInsights, // Redux action via mapDispatchToProps
  fetchExternalAppIntegrationStatus, // Redux action via mapDispatchToProps
}) {
  const [selectedSubsidiaryData, setSelectedSubsidiaryData] = useState(null);
  const [isTriggeringAction, setIsTriggeringAction] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const subsidiaryOptions = useMemo(() => {
    const options = [];
    ledgerEntities.allIds.forEach((id) => {
      const ledgerEntity = ledgerEntities.byId[id];
      if (ledgerEntity.ledger_sync_type === "subsidiary") {
        const { ledger_resource_id: value, data: { name } } = ledgerEntity;
        options.push({ value, label: name, data: ledgerEntity.data }); // Store full data for AI context
      }
    });
    return options;
  }, [ledgerEntities.allIds, ledgerEntities.byId]);

  // Update selected subsidiary data when selectValue changes
  useEffect(() => {
    const currentSelectedOption = subsidiaryOptions.find(opt => opt.value === selectValue);
    setSelectedSubsidiaryData(currentSelectedOption ? ledgerEntities.byId[selectValue] : null);
  }, [selectValue, subsidiaryOptions, ledgerEntities.byId]);

  // Fetch AI insights and external app statuses when a new subsidiary is selected
  useEffect(() => {
    if (selectValue && selectedSubsidiaryData) {
      // Fetch Gemini insights
      fetchGeminiInsights(selectValue, selectedSubsidiaryData.data);
      // Fetch status for a set of hypothetical external apps
      fetchExternalAppIntegrationStatus(selectValue, "ComplianceEngine");
      fetchExternalAppIntegrationStatus(selectValue, "PredictiveAnalyticsPro");
      fetchExternalAppIntegrationStatus(selectValue, "GlobalTaxWizard");
      fetchExternalAppIntegrationStatus(selectValue, "SpendOptimizationAI");
    }
  }, [selectValue, selectedSubsidiaryData, fetchGeminiInsights, fetchExternalAppIntegrationStatus]);

  const handleSubsidiaryChange = useCallback((event) => {
    handleChange(event);
    setActionMessage(""); // Clear previous action messages on new selection
    setActionError("");
  }, [handleChange]);

  // Access current AI data from Redux state
  const currentGeminiInsight = geminiInsights[selectValue];
  const externalAppsToDisplay = useMemo(() => [
    { name: "Compliance Engine", key: "ComplianceEngine", action: "RunComplianceCheck", buttonText: "Run Check", icon: "⚖️" },
    { name: "Predictive Analytics Pro", key: "PredictiveAnalyticsPro", action: "OptimizeForecasting", buttonText: "Optimize", icon: "📊" },
    { name: "Global Tax Wizard", key: "GlobalTaxWizard", action: "FileTaxDeclarations", buttonText: "File Taxes", icon: "💰" },
    { name: "Spend Optimization AI", key: "SpendOptimizationAI", action: "AnalyzeSpendPatterns", buttonText: "Analyze Spend", icon: "💸" },
  ], []);

  const triggerAdvancedAction = async (appName, actionType) => {
    if (!selectedSubsidiaryData) return;
    setIsTriggeringAction(true);
    setActionMessage("");
    setActionError("");
    try {
      const result = await mockExternalAppService.triggerAction(
        selectValue,
        actionType,
        {
          appName: appName,
          subsidiaryName: selectedSubsidiaryData.data.name,
          triggeredBy: "UI_User",
          timestamp: new Date().toISOString()
        }
      );
      setActionMessage(result.message);
      // Refetch status for the specific app after an action
      fetchExternalAppIntegrationStatus(selectValue, appName);
    } catch (error) {
      setActionError(`Failed to trigger action for ${appName}: ${error.message}`);
    } finally {
      setIsTriggeringAction(false);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "healthy": return "text-green-400";
      case "needs_attention": return "text-yellow-400";
      case "unknown": return "text-gray-400";
      default: return "text-red-400"; // not_integrated or error
    }
  };

  return (
    <FieldGroup direction="top-to-bottom" className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl text-white font-sans max-w-4xl mx-auto">
      <Label id="accountingSubsidiarySelect" className="text-3xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        {label || "AI-Powered Global Financial Command Center"}
      </Label>
      <Text className="text-lg text-indigo-200 mb-6 text-center">
        {helpText || "Leverage Gemini AI and seamlessly integrate external apps to unlock unparalleled insights and orchestrate global financial operations with precision."}
      </Text>

      <SelectField
        selectValue={selectValue}
        helpText="Select a subsidiary to reveal its hidden potential and AI-driven recommendations."
        disabled={isEmpty(ledgerEntities.allIds) || isTriggeringAction}
        options={subsidiaryOptions}
        handleChange={handleSubsidiaryChange}
        name="accountingSubsidiarySelect"
        className="mb-8 p-3 bg-indigo-800 border border-indigo-600 rounded-lg text-white placeholder-indigo-300 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300 w-full"
      />

      {selectValue && selectedSubsidiaryData ? (
        <div className="space-y-6">
          <Card className="bg-indigo-800/70 backdrop-blur-sm p-6 rounded-xl border border-indigo-700 shadow-lg">
            <h3 className="text-2xl font-bold text-teal-300 mb-4 flex items-center">
              <span className="mr-2 text-3xl">✨</span> Gemini AI Intelligence for {selectedSubsidiaryData.data.name}
            </h3>
            {currentGeminiInsight?.loading && <Spinner size="lg" className="text-teal-400 mx-auto" />}
            {currentGeminiInsight?.error && (
              <Text className="text-red-400 font-medium italic">
                AI Service Error: {currentGeminiInsight.error}
                <br /> Please retry or contact support.
              </Text>
            )}
            {currentGeminiInsight?.data && (
              <div className="space-y-3">
                <Text className={`text-lg leading-relaxed ${currentGeminiInsight.data.sentiment === 'alert' ? 'text-orange-300' : currentGeminiInsight.data.sentiment === 'positive' ? 'text-green-300' : 'text-indigo-300'}`}>
                  "{currentGeminiInsight.data.summary}"
                </Text>
                <Text className="text-sm text-indigo-200">
                  Risk Level: <span className={currentGeminiInsight.data.riskLevel === 'high' ? 'text-red-300 font-bold' : currentGeminiInsight.data.riskLevel === 'medium' ? 'text-yellow-300' : 'text-green-300'}>{currentGeminiInsight.data.riskLevel.toUpperCase()}</span>
                </Text>
                {currentGeminiInsight.data.actionableRecommendations && currentGeminiInsight.data.actionableRecommendations.length > 0 && (
                  <div className="mt-2">
                    <Text className="text-sm font-semibold text-indigo-300">Actionable Recommendations:</Text>
                    <ul className="list-disc list-inside text-indigo-200 text-sm pl-2">
                      {currentGeminiInsight.data.actionableRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Text className="text-xs text-indigo-400 italic">
                  Generated: {new Date(currentGeminiInsight.data.generatedAt).toLocaleString()}
                </Text>
                <Button
                  onClick={() => triggerAdvancedAction("GeminiAI", "GenerateDeepDiveReport")}
                  disabled={isTriggeringAction}
                  className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 focus:ring-teal-400 text-white font-semibold rounded-lg shadow-md transition duration-300 flex items-center justify-center"
                >
                  {isTriggeringAction ? <Spinner size="sm" className="mr-2" /> : <span className="mr-2 text-xl">🚀</span>}
                  {isTriggeringAction ? "Generating Deep Dive..." : "Access Deep Dive Dashboard"}
                </Button>
              </div>
            )}
            {!currentGeminiInsight?.loading && !currentGeminiInsight?.error && !currentGeminiInsight?.data && (
                <Text className="text-indigo-300 italic text-center">Loading AI insights for this subsidiary...</Text>
            )}
          </Card>

          <Card className="bg-indigo-800/70 backdrop-blur-sm p-6 rounded-xl border border-indigo-700 shadow-lg">
            <h3 className="text-2xl font-bold text-blue-300 mb-4 flex items-center">
              <span className="mr-2 text-3xl">🔗</span> Hyper-Integrated External Apps
            </h3>
            <div className="space-y-4">
              {externalAppsToDisplay.map((app) => {
                const appStatus = externalAppStatus[selectValue]?.[app.key];
                const isAppIntegrated = appStatus?.data?.isIntegrated;
                const appHealth = appStatus?.data?.health || "unknown";

                return (
                  <div key={app.key} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-700/50 p-4 rounded-lg">
                    <div className="mb-2 sm:mb-0">
                        <Text className="text-lg font-medium text-blue-200 flex items-center">
                            <span className="mr-2 text-xl">{app.icon}</span> {app.name}
                        </Text>
                        {appStatus?.loading && <Spinner size="sm" className="text-blue-400 mt-1" />}
                        {appStatus?.error && <Text className="text-red-400 text-sm">Error: {appStatus.error}</Text>}
                        {appStatus?.data && (
                            <Text className={`text-sm font-semibold mt-1 ${getStatusColorClass(appHealth)}`}>
                                Status: {appHealth.replace(/_/g, ' ')} ({isAppIntegrated ? "Integrated" : "Not Integrated"})
                            </Text>
                        )}
                    </div>
                    <Button
                      onClick={() => triggerAdvancedAction(app.key, app.action)}
                      disabled={isTriggeringAction || !isAppIntegrated}
                      className={`px-4 py-2 ${isAppIntegrated ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400' : 'bg-gray-600 cursor-not-allowed'} text-white font-semibold rounded-lg transition duration-300 flex items-center justify-center`}
                    >
                      {isTriggeringAction ? <Spinner size="sm" className="mr-2" /> : <span className="mr-2">⚙️</span>}
                      {isTriggeringAction ? "Processing..." : app.buttonText}
                    </Button>
                  </div>
                );
              })}
            </div>
            {actionMessage && <Text className="mt-4 text-green-300 italic text-center">{actionMessage}</Text>}
            {actionError && <Text className="mt-4 text-red-400 italic text-center">{actionError}</Text>}
          </Card>

          <div className="text-center text-indigo-400 pt-8 text-sm">
            <Text className="text-lg mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-bold">
              The Future of Finance, Powered by You.
            </Text>
            <Text className="text-xs">
              © {new Date().getFullYear()} Citibank Demo Business Inc. All rights reserved. Pioneering intelligent financial orchestration.
            </Text>
          </div>
        </div>
      ) : (
        <Card className="bg-indigo-800/70 backdrop-blur-sm p-6 rounded-xl border border-indigo-700 shadow-lg text-center">
            <h3 className="text-2xl font-bold text-teal-300 mb-4">Select a Subsidiary to Unleash AI Power</h3>
            <Text className="text-lg text-indigo-200">
                Choose from the dropdown above to instantly load AI-driven insights and discover
                smart integration points for your selected financial entity. Experience the future of financial management.
            </Text>
        </Card>
      )}
    </FieldGroup>
  );
}

// Redux mapStateToProps: Connects Redux state to component props
const mapStateToProps = (state) => ({
  ledgerEntities: state.ledgerEntities,
  // Assuming 'aiIntegration' is a key in your root reducer for the AI-related state
  geminiInsights: state.aiIntegration?.geminiInsights || {}, 
  externalAppStatus: state.aiIntegration?.externalAppStatus || {},
});

// Redux mapDispatchToProps: Connects Redux actions to component props
const mapDispatchToProps = {
  fetchGeminiInsights,
  fetchExternalAppIntegrationStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountingSubsidiarySelect);