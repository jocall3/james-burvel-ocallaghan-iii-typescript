import React, { useState, useCallback, useEffect } from "react";
import { CellValueUnion } from "@flatfile/api/api";
import {
  useBulkCreateAccountAchSettingsMutation,
  useBulkValidateAccountAchSettingsMutation,
} from "~/generated/dashboard/graphqlSchema";
import FlatfileBulkUploadButton, {
  BulkResourceType,
} from "~/app/components/FlatfileBulkUploadButton";
import {
  accountACHSettingBlueprint,
  accountACHSettingBlueprintFields,
} from "./bulk_imports/blueprints/accountACHSettingBlueprint";

// --- EXTERNAL AI & COMPLIANCE SERVICES ---

// Simulated Gemini AI Service (enhanced)
const geminiAIService = {
  analyzeDataForAccountAchSettings: async (
    rawData,
    blueprintFields,
    connectionId,
  ) => {
    console.log("Gemini AI: Analyzing data for connection", connectionId);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const analysisReport = {
      overallStatus: "Analysis Complete",
      issuesFound: [],
      suggestedTransformations: [],
      dataQualityScore: 92,
      insights: "Identified potential for address standardization and bank code validation.",
    };

    if (rawData.some(row => !row.bankAccountNumber || (typeof row.bankAccountNumber === 'string' && row.bankAccountNumber.length < 5))) {
        analysisReport.issuesFound.push({
            type: "MissingOrShortBankAccount",
            description: "Some bank account numbers are missing or too short. Recommend review.",
            severity: "High"
        });
        analysisReport.suggestedTransformations.push({
            field: "bankAccountNumber",
            action: "Standardize to minimum length 10, pad with leading zeros if applicable."
        });
    }

    if (rawData.some(row => !row.bankRoutingNumber || (typeof row.bankRoutingNumber === 'string' && row.bankRoutingNumber.length !== 9))) {
        analysisReport.issuesFound.push({
            type: "InvalidRoutingNumber",
            description: "Some bank routing numbers are not 9 digits. Recommend validation.",
            severity: "High"
        });
        analysisReport.suggestedTransformations.push({
            field: "bankRoutingNumber",
            action: "Validate against a known routing number database and flag non-compliant."
        });
    }

    if (rawData.some(row => typeof row.beneficiaryName === 'string' && row.beneficiaryName.includes("LLC"))) {
        analysisReport.insights += " Many beneficiary names contain 'LLC', suggesting corporate accounts. Consider corporate entity verification.";
    }

    // Proactive suggestion for OFAC and Address verification based on data presence
    if (rawData.some(row => row.beneficiaryName)) {
        analysisReport.suggestedNextSteps = analysisReport.suggestedNextSteps || [];
        analysisReport.suggestedNextSteps.push("Perform OFAC sanctions screening for beneficiary names.");
    }
    if (rawData.some(row => row.beneficiaryAddress1 || row.beneficiaryCity || row.beneficiaryState || row.beneficiaryPostalCode)) {
        analysisReport.suggestedNextSteps = analysisReport.suggestedNextSteps || [];
        analysisReport.suggestedNextSteps.push("Run Address Verification for enhanced data quality.");
    }


    console.log("Gemini AI: Analysis Report generated:", analysisReport);
    return analysisReport;
  },

  applyTransformations: async (rawData, transformations) => {
    console.log("Gemini AI: Applying transformations...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let transformedData = rawData.map(row => ({ ...row }));

    transformations.forEach(t => {
        if (t.action.includes("Standardize to minimum length 10, pad with leading zeros") && t.field === "bankAccountNumber") {
            transformedData = transformedData.map(row => {
                if (row.bankAccountNumber && typeof row.bankAccountNumber === 'string' && row.bankAccountNumber.length < 10) {
                    return { ...row, bankAccountNumber: row.bankAccountNumber.padStart(10, '0') };
                }
                return row;
            });
        }
    });

    console.log("Gemini AI: Transformations applied.");
    return transformedData;
  },

  enrichDataWithExternalSources: async (data, connectionId) => {
    console.log("Gemini AI: Enriching data for connection", connectionId);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const enrichedData = data.map(row => {
        const newRow = { ...row };
        if (row.bankRoutingNumber && typeof row.bankRoutingNumber === 'string') {
            const routingNumberString = row.bankRoutingNumber;
            // More sophisticated bank lookups could involve a real API
            if (routingNumberString.startsWith("01")) {
                newRow.bankName = "First National Bank Gemini";
                newRow.bankCity = "New York City";
                newRow.bankCountry = "US";
            } else if (routingNumberString.startsWith("02")) {
                newRow.bankName = "Second State Bank AI";
                newRow.bankCity = "Los Angeles Metro";
                newRow.bankCountry = "US";
            } else {
                newRow.bankName = "Gemini Unidentified Bank";
                newRow.bankCity = "AI Unidentified Location";
                newRow.bankCountry = "US";
            }
        }
        newRow.geminiEnriched = true;
        return newRow;
    });

    console.log("Gemini AI: Data enrichment complete.");
    return enrichedData;
  },

  generateSubmissionSummary: async (data, analysisReport, ofacReport, addressReport) => {
    console.log("Gemini AI: Generating submission summary...");
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const totalRecords = data.length;
    const enrichedRecords = data.filter(row => row.geminiEnriched).length;
    const errorsFromAnalysis = analysisReport?.issuesFound?.length || 0;
    const ofacFlags = ofacReport?.flaggedRecords?.length || 0;
    const addressUnverified = addressReport?.unverifiedCount || 0;
    const transformationsApplied = analysisReport?.suggestedTransformations?.length > 0;

    let insightsSummary = analysisReport?.insights || 'No specific AI insights provided.';
    if (ofacFlags > 0) insightsSummary += ` Critical: ${ofacFlags} potential OFAC matches identified.`;
    if (addressUnverified > 0) insightsSummary += ` Warning: ${addressUnverified} addresses could not be fully verified.`;
    if (transformationsApplied) insightsSummary += ` Data quality significantly improved by AI transformations.`;


    const summaryText = `
      🌟 Gemini AI Powered Financial Data Ops Summary 🌟
      --------------------------------------------------
      Total Records Processed: ${totalRecords}
      Records Enriched by Gemini: ${enrichedRecords}
      AI-Identified Potential Issues: ${errorsFromAnalysis}
      OFAC Sanctions Flags: ${ofacFlags} (Critical Action Required!)
      Unverified Addresses: ${addressUnverified} (Review Recommended)
      Overall Data Quality Score (AI Estimate): ${analysisReport?.dataQualityScore || 'N/A'}

      ✨ AI Insights & Recommendations:
      ${insightsSummary}

      💡 Next Steps: Review all flagged records, confirm OFAC status, and proceed to final submission.
    `;
    return summaryText;
  },

  chatWithAI: async (prompt, currentContext) => {
    console.log("Gemini AI Chat: Processing prompt", prompt, "with context", currentContext);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("help")) {
      return "Hello! I am your Gemini AI Assistant, your co-pilot for ACH data excellence. How can I help you navigate your data upload, analysis, and compliance journey today?";
    } else if (lowerPrompt.includes("status")) {
      if (currentContext.uploadedDataLength === 0) {
        return "Current status: Awaiting your initial data upload via Flatfile. Let's get started!";
      } else if (!currentContext.geminiAnalysisReport) {
        return `Data uploaded (${currentContext.uploadedDataLength} records). Ready for AI analysis to uncover insights.`;
      } else if (currentContext.ofacResults?.flaggedRecords?.length > 0) {
        return `Warning: ${currentContext.ofacResults.flaggedRecords.length} potential OFAC matches found. Urgent review recommended before proceeding.`;
      } else if (currentContext.submissionSummary) {
        return `All AI-driven steps complete! Review the final submission summary and prepare for deployment.`;
      }
      return "Current status: Data is being meticulously processed through the AI-driven workflow. What specific step are you curious about?";
    } else if (lowerPrompt.includes("transform")) {
      return "To apply transformations, ensure you've run 'AI Data Analysis' first. Gemini will then present suggested transformations to cleanse your data.";
    } else if (lowerPrompt.includes("ofac")) {
      return "The OFAC Sanctions Screening module helps ensure your beneficiaries aren't on prohibited lists. It's a crucial compliance step.";
    } else if (lowerPrompt.includes("address")) {
      return "Our Address Verification service standardizes and validates addresses, reducing mail returns and ensuring accurate records.";
    }
    return `Gemini AI: I am a specialized assistant for financial data operations. You asked: '${prompt}'. Perhaps you'd like to know about data analysis, enrichment, or compliance checks?`;
  }
};


// Simulated OFAC Compliance Service (New external app)
const ofacComplianceService = {
  checkSanctionsList: async (data) => {
    console.log("OFAC Compliance Service: Checking sanctions list...");
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate API call

    const flaggedRecords = [];
    const keywords = ["evilcorp", "terror", "sanctioned", "badactor", "darkmoney"]; // Simplified for demo

    data.forEach((row, index) => {
      const beneficiaryName = typeof row.beneficiaryName === 'string' ? row.beneficiaryName.toLowerCase() : '';
      if (keywords.some(keyword => beneficiaryName.includes(keyword))) {
        flaggedRecords.push({
          recordIndex: index,
          originalName: row.beneficiaryName,
          reason: "Potential OFAC keyword match in beneficiary name.",
          severity: "Critical",
        });
      }
      // Add more sophisticated checks, e.g., address, bank, etc.
    });

    // Simulate adding a flag to the data for visual feedback/downstream processing
    const dataWithOfacFlags = data.map((row, index) => {
        const newRow = { ...row };
        const flag = flaggedRecords.find(f => f.recordIndex === index);
        if (flag) {
            newRow.ofacFlag = true;
            newRow.ofacReason = flag.reason;
        }
        return newRow;
    });

    console.log("OFAC Compliance Service: Sanctions check complete.");
    return {
      totalRecords: data.length,
      flaggedRecords: flaggedRecords,
      overallStatus: flaggedRecords.length > 0 ? "Potential Matches Found" : "No Direct Matches Found",
      transformedData: dataWithOfacFlags, // Return data with flags applied
    };
  },
};

// Simulated Address Verification Service (New external app)
const addressVerificationService = {
  verifyAddresses: async (data) => {
    console.log("Address Verification Service: Verifying and standardizing addresses...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

    let verifiedCount = 0;
    let unverifiedCount = 0;
    const transformedData = data.map(row => {
      const newRow = { ...row };
      const address1 = typeof row.beneficiaryAddress1 === 'string' ? row.beneficiaryAddress1.trim() : '';
      const city = typeof row.beneficiaryCity === 'string' ? row.beneficiaryCity.trim() : '';
      const state = typeof row.beneficiaryState === 'string' ? row.beneficiaryState.trim() : '';
      const postalCode = typeof row.beneficiaryPostalCode === 'string' ? row.beneficiaryPostalCode.trim() : '';

      // Simplified verification logic
      if (address1 && city && state && postalCode && postalCode.length >= 5) {
        newRow.beneficiaryAddress1 = address1.replace(/\b(st|street)\b/gi, 'St.');
        newRow.beneficiaryCity = city.replace(/\b(ft|fort)\b/gi, 'Fort');
        newRow.addressVerified = true;
        verifiedCount++;
      } else {
        newRow.addressVerified = false;
        unverifiedCount++;
      }
      return newRow;
    });

    console.log("Address Verification Service: Addresses processed.");
    return {
      transformedData: transformedData,
      verifiedCount: verifiedCount,
      unverifiedCount: unverifiedCount,
      overallStatus: unverifiedCount > 0 ? "Partial Verification" : "All Addresses Verified (or attempted)",
    };
  },
};


export const ACCOUNT_ACH_SETTING_CSV_HEADERS =
  accountACHSettingBlueprintFields.map((field) => field.key);

interface AccountCapabilityBulkUploadActionItemProps {
  connectionId: string;
}

function AccountCapabilityBulkUploadActionItem({
  connectionId,
}: AccountCapabilityBulkUploadActionItemProps) {
  const [bulkValidateAccountAchSettings] =
    useBulkValidateAccountAchSettingsMutation();
  const [bulkCreateAccountAchSettings] =
    useBulkCreateAccountAchSettingsMutation();

  const [uploadedData, setUploadedData] = useState([]);
  const [isGeminiAnalyzing, setIsGeminiAnalyzing] = useState(false);
  const [geminiAnalysisReport, setGeminiAnalysisReport] = useState(null);
  const [transformedData, setTransformedData] = useState([]);
  const [enrichedData, setEnrichedData] = useState([]);

  // New states for OFAC and Address Verification
  const [isCheckingOFAC, setIsCheckingOFAC] = useState(false);
  const [ofacResults, setOfacResults] = useState(null);
  const [isVerifyingAddresses, setIsVerifyingAddresses] = useState(false);
  const [addressVerificationReport, setAddressVerificationReport] = useState(null);
  const [finalProcessedData, setFinalProcessedData] = useState([]); // Data after all steps, ready for Flatfile validate/submit

  const [aiChatResponse, setAiChatResponse] = useState("Hello! I am your AI co-pilot, ready to optimize your ACH data. How can I assist you?");
  const [aiChatPrompt, setAiChatPrompt] = useState("");
  const [isApplyingTransformations, setIsApplyingTransformations] = useState(false);
  const [isEnrichingData, setIsEnrichingData] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showDataOpsHub, setShowDataOpsHub] = useState(false); // Renamed from showGeminiPanel

  // Unified data state for processing pipeline
  useEffect(() => {
    // This effect ensures finalProcessedData is updated whenever
    // enrichedData, ofacResults (transformed data), or addressVerificationReport (transformed data) changes.
    // It should prioritize the most recently processed data.
    let currentData = [...uploadedData];

    if (enrichedData.length > 0 && enrichedData !== uploadedData) { // Check for actual changes beyond initial
      currentData = enrichedData;
    }
    // Prioritize data that has gone through subsequent steps
    if (ofacResults && ofacResults.transformedData) {
        currentData = ofacResults.transformedData;
    }
    if (addressVerificationReport && addressVerificationReport.transformedData) {
        currentData = addressVerificationReport.transformedData;
    }
    setFinalProcessedData(currentData);
  }, [uploadedData, enrichedData, ofacResults, addressVerificationReport]);


  const handleFlatfileUploadComplete = useCallback(
    (resultsData) => {
      console.log("Flatfile upload complete, data received:", resultsData);
      setUploadedData(resultsData);
      setTransformedData(resultsData); // Start transformation from uploaded
      setEnrichedData(resultsData); // Start enrichment from transformed
      setFinalProcessedData(resultsData); // Initial final data
      setGeminiAnalysisReport(null);
      setOfacResults(null);
      setAddressVerificationReport(null);
      setSubmissionSummary("");
      setShowDataOpsHub(true);
      setAiChatResponse(`Excellent! ${resultsData.length} records loaded. Now, let's unleash Gemini AI for deep analysis.`);
    },
    [],
  );

  const handleAnalyzeWithGemini = useCallback(async () => {
    if (uploadedData.length === 0) {
      setAiChatResponse("Please upload data via Flatfile first before analysis.");
      return;
    }
    setIsGeminiAnalyzing(true);
    setAiChatResponse("Initiating Gemini AI's deep dive: Analyzing your ACH data for patterns, issues, and opportunities...");
    try {
      const report = await geminiAIService.analyzeDataForAccountAchSettings(
        uploadedData,
        accountACHSettingBlueprintFields,
        connectionId,
      );
      setGeminiAnalysisReport(report);
      let chatMessage = `Gemini AI Analysis Complete! Data Quality Score: ${report.dataQualityScore}. ${report.insights}`;
      if (report.suggestedNextSteps?.length > 0) {
        chatMessage += ` I also recommend: ${report.suggestedNextSteps.join(', ')}.`;
      }
      setAiChatResponse(chatMessage);
    } catch (error) {
      console.error("Error during Gemini analysis:", error);
      setAiChatResponse("Critical Error during Gemini analysis. Please check system logs.");
    } finally {
      setIsGeminiAnalyzing(false);
    }
  }, [uploadedData, connectionId]);

  const handleApplyGeminiTransformations = useCallback(async () => {
    if (!geminiAnalysisReport || geminiAnalysisReport.suggestedTransformations.length === 0) {
      setAiChatResponse("No AI suggested transformations to apply or analysis not yet performed.");
      return;
    }
    setIsApplyingTransformations(true);
    setAiChatResponse("Gemini AI is executing crucial transformations to cleanse and standardize your data...");
    try {
      const newTransformedData = await geminiAIService.applyTransformations(
        uploadedData, // Use original uploaded data as base for transformations
        geminiAnalysisReport.suggestedTransformations,
      );
      setTransformedData(newTransformedData);
      setEnrichedData(newTransformedData); // Reset enriched data based on newly transformed
      setFinalProcessedData(newTransformedData); // Update final processed data
      setAiChatResponse("Gemini AI transformations applied successfully! Your data is now significantly cleaner and more compliant.");
    } catch (error) {
      console.error("Error applying Gemini transformations:", error);
      setAiChatResponse("Error applying Gemini transformations. Manual review is highly recommended.");
    } finally {
      setIsApplyingTransformations(false);
    }
  }, [uploadedData, geminiAnalysisReport]);

  const handleEnrichDataWithGemini = useCallback(async () => {
    if (transformedData.length === 0) {
      setAiChatResponse("No transformed data available for enrichment. Please analyze and transform first.");
      return;
    }
    setIsEnrichingData(true);
    setAiChatResponse("Gemini AI is expanding your data's intelligence: Enriching with valuable external context...");
    try {
      const newEnrichedData = await geminiAIService.enrichDataWithExternalSources(
        transformedData,
        connectionId,
      );
      setEnrichedData(newEnrichedData);
      setFinalProcessedData(newEnrichedData); // Update final processed data
      setAiChatResponse("Gemini AI data enrichment complete! More contextual information added, boosting your data's value.");
    } catch (error) {
      console.error("Error enriching data with Gemini:", error);
      setAiChatResponse("Error during Gemini data enrichment. Data may be incomplete or lack crucial context.");
    } finally {
      setIsEnrichingData(false);
    }
  }, [transformedData, connectionId]);

  // New handler for OFAC
  const handleCheckOFAC = useCallback(async () => {
    if (enrichedData.length === 0) {
      setAiChatResponse("Please ensure data is enriched before performing OFAC checks.");
      return;
    }
    setIsCheckingOFAC(true);
    setAiChatResponse("Engaging OFAC Sanctions Screening module: Verifying beneficiaries against critical watchlists. This is crucial for compliance!");
    try {
      const results = await ofacComplianceService.checkSanctionsList(enrichedData);
      setOfacResults(results); // Store results, including transformed data
      setFinalProcessedData(results.transformedData); // Update final processed data with OFAC flags
      let chatMessage = `OFAC Screening Complete! Status: ${results.overallStatus}.`;
      if (results.flaggedRecords.length > 0) {
        chatMessage += ` ${results.flaggedRecords.length} potential matches require immediate review. Your compliance is our priority!`;
      } else {
        chatMessage += ` No direct OFAC matches found.`;
      }
      setAiChatResponse(chatMessage);
    } catch (error) {
      console.error("Error checking OFAC:", error);
      setAiChatResponse("Critical Error during OFAC sanctions screening. Please consult compliance team.");
    } finally {
      setIsCheckingOFAC(false);
    }
  }, [enrichedData]);

  // New handler for Address Verification
  const handleVerifyAddresses = useCallback(async () => {
    if (ofacResults === null && enrichedData.length === 0) { // Can run on enriched or OFAC processed data
      setAiChatResponse("Please ensure data is at least enriched before performing address verification.");
      return;
    }
    setIsVerifyingAddresses(true);
    const dataToVerify = ofacResults?.transformedData || enrichedData; // Use OFAC processed data if available
    setAiChatResponse("Activating Address Verification Service: Standardizing and validating beneficiary addresses for enhanced deliverability and fraud prevention...");
    try {
      const results = await addressVerificationService.verifyAddresses(dataToVerify);
      setAddressVerificationReport(results);
      setFinalProcessedData(results.transformedData); // Update final processed data with verified addresses
      let chatMessage = `Address Verification Complete! Status: ${results.overallStatus}.`;
      if (results.unverifiedCount > 0) {
        chatMessage += ` ${results.unverifiedCount} addresses could not be fully verified. Manual review advised.`;
      } else {
        chatMessage += ` All provided addresses successfully verified/standardized!`;
      }
      setAiChatResponse(chatMessage);
    } catch (error) {
      console.error("Error verifying addresses:", error);
      setAiChatResponse("Error during Address Verification. Data integrity might be compromised.");
    } finally {
      setIsVerifyingAddresses(false);
    }
  }, [enrichedData, ofacResults]);


  const handleChatSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!aiChatPrompt.trim()) return;
    setAiChatResponse("Gemini AI is analyzing your query...");

    // Provide context to the AI chat
    const chatContext = {
      uploadedDataLength: uploadedData.length,
      geminiAnalysisReport: geminiAnalysisReport,
      ofacResults: ofacResults,
      addressVerificationReport: addressVerificationReport,
      submissionSummary: submissionSummary,
    };

    const response = await geminiAIService.chatWithAI(aiChatPrompt, chatContext);
    setAiChatResponse(response);
    setAiChatPrompt("");
  }, [aiChatPrompt, uploadedData, geminiAnalysisReport, ofacResults, addressVerificationReport, submissionSummary]);

  const handleGenerateAISubmissionSummary = useCallback(async () => {
    if (finalProcessedData.length === 0) {
      setAiChatResponse("No processed data available to generate a summary. Please complete data processing first.");
      return;
    }
    setIsGeneratingSummary(true);
    setAiChatResponse("Gemini AI is compiling your ultimate submission readiness report, highlighting risks and opportunities...");
    try {
      const summary = await geminiAIService.generateSubmissionSummary(
        finalProcessedData,
        geminiAnalysisReport,
        ofacResults,
        addressVerificationReport
      );
      setSubmissionSummary(summary);
      setAiChatResponse("Gemini AI has prepared the final submission summary. Review and conquer!");
    } catch (error) {
      console.error("Error generating AI submission summary:", error);
      setAiChatResponse("Catastrophic Error generating AI submission summary. System logs needed.");
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [finalProcessedData, geminiAnalysisReport, ofacResults, addressVerificationReport]);


  const validate = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
  ) => {
    console.log("Pre Flatfile validation with AI-finalized data:", finalProcessedData);
    // Flatfile validation should happen on the most processed data
    const dataToValidate = finalProcessedData.length > 0 ? finalProcessedData : resultsData;

    setAiChatResponse("Executing final system validation against processed data. One last check before launch!");
    const response = await bulkValidateAccountAchSettings({
      variables: {
        input: {
          connectionId,
          accountAchSettings: dataToValidate,
        },
      },
    });
    if (response.data?.bulkValidateAccountAchSettings?.recordErrors.length > 0) {
      setAiChatResponse("Flatfile found validation errors post-AI processing. Gemini AI can assist in reviewing these if you analyze again or need help interpreting.");
    } else {
      setAiChatResponse("Flatfile validation passed! Your data is pristine and ready for mission success. Generate your AI summary and submit!");
    }
    return response.data?.bulkValidateAccountAchSettings?.recordErrors;
  };

  const submit = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
  ) => {
    console.log("Submitting AI-enriched and compliance-checked data:", finalProcessedData);
    if (finalProcessedData.length === 0) {
        setAiChatResponse("Error: No data processed by the AI Ops Hub for submission. Please ensure all steps are completed.");
        return { success: false, path: "/" };
    }

    if (ofacResults?.flaggedRecords.length > 0) {
        setAiChatResponse("Submission blocked: Critical OFAC flags detected. Please resolve all compliance issues before attempting submission.");
        return { success: false, path: "/" }; // Prevent submission if OFAC issues exist
    }

    setAiChatResponse("Initiating final submission of your meticulously processed, AI-verified, and compliance-checked data. Mission Critical: Launching!");
    const { data } = await bulkCreateAccountAchSettings({
      variables: {
        input: {
          connectionId,
          flatfileSheetId,
          flatfileSpaceId,
          accountAchSettings: finalProcessedData,
        },
      },
    });

    const { id } =
      data?.bulkCreateAccountAchSettings?.connectionBulkImport ?? {};
    if (id) {
      setAiChatResponse("Gemini AI Ops Hub: Mission Accomplished! Bulk import successful, ID: " + id + ". Your data, perfected.");
      return {
        success: true,
        path: `/operations/connection_bulk_imports/${id}`,
      };
    }
    setAiChatResponse("Gemini AI Ops Hub: Submission failed. An unknown error occurred. Please consult system diagnostics.");
    return { success: false, path: "/" };
  };

  const buttonStyle = {
    padding: '12px 18px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff', // Deep blue
    color: 'white',
    ':hover': {
      backgroundColor: '#0056b3',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
    ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
  };

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745', // Green
    color: 'white',
    ':hover': {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
    ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
  };

  const warningButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ffc107', // Yellow
    color: '#333',
    ':hover': {
      backgroundColor: '#e0a800',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
    ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545', // Red
    color: 'white',
    ':hover': {
      backgroundColor: '#c82333',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
    ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d', // Gray
    color: 'white',
    ':hover': {
      backgroundColor: '#5a6268',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
    },
    ':disabled': {
        backgroundColor: '#cccccc',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
  };

  const aiChatInputStyle = {
    flexGrow: 1,
    padding: '10px',
    border: '1px solid #007bff',
    borderRadius: '6px 0 0 6px',
    outline: 'none',
    fontSize: '14px',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
  };

  const aiChatSendButtonStyle = {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '0 6px 6px 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
  };


  const stepCardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  };

  const headerStyle = {
    color: '#007bff',
    marginBottom: '25px',
    fontSize: '28px',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
      padding: '30px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#343a40'
    }}>
      <h2 style={headerStyle}>🚀 Financial Data Ops Hub: ACH Settings Mastery powered by AI & Integrations 🚀</h2>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 45%', minWidth: '350px', ...stepCardStyle }}>
          <h3 style={{ color: '#007bff', marginBottom: '15px' }}>1. Data Ingestion: Flatfile Precision 📤</h3>
          <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
            Seamlessly upload your raw ACH settings data using Flatfile. Once ingested, our AI-powered hub springs into action, ready to transform and enhance your information.
          </p>
          <FlatfileBulkUploadButton
            resource={BulkResourceType.AccountACHSettings}
            blueprint={accountACHSettingBlueprint}
            expectedFields={accountACHSettingBlueprintFields}
            onValidate={validate}
            onSubmit={submit}
            launchFromActionsList
            onComplete={handleFlatfileUploadComplete}
          />
          {uploadedData.length > 0 && (
            <p style={{ marginTop: '15px', color: '#28a745', fontWeight: 'bold' }}>
              <span role="img" aria-label="Checkmark">✅</span> Data uploaded: <span style={{ color: '#007bff' }}>{uploadedData.length} records</span> ready for AI orchestration.
            </p>
          )}
        </div>

        {showDataOpsHub && (
          <div style={{ flex: '2 1 45%', minWidth: '450px', ...stepCardStyle, borderColor: '#007bff', backgroundColor: '#eef6ff' }}>
            <h3 style={{ color: '#007bff', marginBottom: '20px', textAlign: 'center' }}>
              ✨ AI & Integrations Orchestration Pipeline ✨
            </h3>
            <p style={{ color: '#007bff', marginBottom: '25px', textAlign: 'center', fontSize: '15px', fontWeight: 'normal' }}>
              Our unique multi-stage process leverages Gemini AI and specialized external services for unparalleled data quality and compliance.
            </p>

            {/* Stage 1: Gemini AI Data Analysis */}
            <div style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', backgroundColor: '#f0faff', borderLeft: '4px solid #4285F4' }}>
              <h4 style={{ color: '#4285F4', marginBottom: '10px' }}>
                <span role="img" aria-label="Gemini">♊</span> 2. Gemini AI Deep Analysis
              </h4>
              <p style={{ marginBottom: '15px' }}>Let Gemini AI uncover hidden patterns, data inconsistencies, and offer intelligent recommendations for your ACH records.</p>
              <button
                onClick={handleAnalyzeWithGemini}
                disabled={isGeminiAnalyzing || uploadedData.length === 0}
                style={{ ...primaryButtonStyle, backgroundColor: '#4285F4' }}
              >
                {isGeminiAnalyzing ? "Analyzing with Gemini..." : "Analyze Data with Gemini"}
              </button>
              {geminiAnalysisReport && (
                <div style={{ marginTop: '15px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #d0e7ff', boxShadow: '0 1px 5px rgba(0,0,0,0.05)' }}>
                  <strong>AI Report Summary:</strong>
                  <p>Status: <span style={{ color: geminiAnalysisReport.overallStatus.includes('Complete') ? '#28a745' : '#ffc107' }}>{geminiAnalysisReport.overallStatus}</span></p>
                  <p>Quality Score: <span style={{ color: '#007bff' }}>{geminiAnalysisReport.dataQualityScore}%</span></p>
                  <p>Insights: <em>{geminiAnalysisReport.insights}</em></p>
                  {geminiAnalysisReport.issuesFound.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Identified Issues ({geminiAnalysisReport.issuesFound.length}):</strong>
                      <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        {geminiAnalysisReport.issuesFound.map((issue, index) => (
                          <li key={index} style={{ color: issue.severity === 'High' ? '#dc3545' : '#ffc107' }}>
                            <strong>[{issue.severity}]</strong> {issue.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stage 2: Gemini AI Transformations */}
            <div style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', backgroundColor: '#f0fff4', borderLeft: '4px solid #34A853' }}>
              <h4 style={{ color: '#34A853', marginBottom: '10px' }}>
                <span role="img" aria-label="Wrench">🔧</span> 3. Apply Gemini AI Transformations
              </h4>
              <p style={{ marginBottom: '15px' }}>Execute Gemini's intelligent suggestions to clean, standardize, and format your data automatically.</p>
              <button
                onClick={handleApplyGeminiTransformations}
                disabled={isApplyingTransformations || !geminiAnalysisReport || geminiAnalysisReport.suggestedTransformations.length === 0}
                style={{ ...successButtonStyle, backgroundColor: '#34A853' }}
              >
                {isApplyingTransformations ? "Applying AI Transformations..." : "Apply AI Transformations"}
              </button>
              {geminiAnalysisReport?.suggestedTransformations.length > 0 && !isApplyingTransformations && (
                <p style={{ marginTop: '10px', color: '#34A853', fontWeight: 'bold' }}>
                    <span role="img" aria-label="Robot">🤖</span> Gemini has {geminiAnalysisReport.suggestedTransformations.length} crucial transformations pending.
                </p>
              )}
               {transformedData.length > 0 && transformedData.length !== uploadedData.length && (
                 <p style={{ marginTop: '5px', color: '#34A853', fontWeight: 'bold' }}>
                    <span role="img" aria-label="Chart">📈</span> Data transformed. Records: {transformedData.length}. Ready for enrichment.
                 </p>
               )}
            </div>

            {/* Stage 3: Gemini AI Data Enrichment */}
            <div style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', backgroundColor: '#fffbe6', borderLeft: '4px solid #FBBC05' }}>
              <h4 style={{ color: '#FBBC05', marginBottom: '10px' }}>
                <span role="img" aria-label="Sparkle">✨</span> 4. Gemini AI Data Enrichment
              </h4>
              <p style={{ marginBottom: '15px' }}>Enhance your ACH records with valuable external context, such as bank names and locations, powered by Gemini.</p>
              <button
                onClick={handleEnrichDataWithGemini}
                disabled={isEnrichingData || transformedData.length === 0}
                style={{ ...warningButtonStyle, backgroundColor: '#FBBC05', color: '#333' }}
              >
                {isEnrichingData ? "Enriching with Gemini..." : "Enrich Data with Gemini"}
              </button>
              {enrichedData.length > 0 && enrichedData.some(row => row.geminiEnriched) && (
                <p style={{ marginTop: '10px', color: '#FBBC05', fontWeight: 'bold' }}>
                    <span role="img" aria-label="Diamond">💎</span> {enrichedData.filter(row => row.geminiEnriched).length} records enriched by Gemini AI.
                </p>
              )}
            </div>

            {/* Stage 4: OFAC Compliance Screening */}
            <div style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', backgroundColor: '#fff0f0', borderLeft: '4px solid #dc3545' }}>
              <h4 style={{ color: '#dc3545', marginBottom: '10px' }}>
                <span role="img" aria-label="Shield">🛡️</span> 5. OFAC Sanctions Compliance Screening
              </h4>
              <p style={{ marginBottom: '15px' }}>Crucial for financial compliance. Automatically screen beneficiary names against the OFAC sanctions list to mitigate risk.</p>
              <button
                onClick={handleCheckOFAC}
                disabled={isCheckingOFAC || enrichedData.length === 0}
                style={{ ...dangerButtonStyle, backgroundColor: '#dc3545' }}
              >
                {isCheckingOFAC ? "Checking OFAC List..." : "Perform OFAC Check"}
              </button>
              {ofacResults && (
                <div style={{ marginTop: '15px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #ffcccc', boxShadow: '0 1px 5px rgba(0,0,0,0.05)' }}>
                  <strong>OFAC Report:</strong>
                  <p>Status: <span style={{ color: ofacResults.flaggedRecords.length > 0 ? '#dc3545' : '#28a745' }}>{ofacResults.overallStatus}</span></p>
                  {ofacResults.flaggedRecords.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Critical Flags ({ofacResults.flaggedRecords.length}):</strong>
                      <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        {ofacResults.flaggedRecords.slice(0, 3).map((flag, index) => ( // Show first 3 flags
                          <li key={index} style={{ color: '#dc3545' }}>
                            <strong>Record {flag.recordIndex + 1}:</strong> {flag.reason} (<em>{flag.originalName}</em>)
                          </li>
                        ))}
                         {ofacResults.flaggedRecords.length > 3 && <li>...and {ofacResults.flaggedRecords.length - 3} more.</li>}
                      </ul>
                      <p style={{fontWeight: 'bold', color: '#dc3545'}}>🚨 IMMEDIATE ACTION REQUIRED: Review these flagged records before proceeding!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stage 5: Address Verification */}
            <div style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', backgroundColor: '#e9f7ef', borderLeft: '4px solid #6c757d' }}>
              <h4 style={{ color: '#6c757d', marginBottom: '10px' }}>
                <span role="img" aria-label="Location Pin">📍</span> 6. Address Verification & Standardization
              </h4>
              <p style={{ marginBottom: '15px' }}>Ensure deliverability and reduce errors by standardizing and validating beneficiary addresses using our integrated service.</p>
              <button
                onClick={handleVerifyAddresses}
                disabled={isVerifyingAddresses || finalProcessedData.length === 0 || ofacResults === null}
                style={{ ...secondaryButtonStyle, backgroundColor: '#6c757d' }}
              >
                {isVerifyingAddresses ? "Verifying Addresses..." : "Verify Addresses"}
              </button>
              {addressVerificationReport && (
                <div style={{ marginTop: '15px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #e0e0e0', boxShadow: '0 1px 5px rgba(0,0,0,0.05)' }}>
                  <strong>Address Verification Report:</strong>
                  <p>Status: <span style={{ color: addressVerificationReport.unverifiedCount > 0 ? '#ffc107' : '#28a745' }}>{addressVerificationReport.overallStatus}</span></p>
                  <p>Verified: <span style={{ color: '#28a745' }}>{addressVerificationReport.verifiedCount}</span> | Unverified: <span style={{ color: addressVerificationReport.unverifiedCount > 0 ? '#ffc107' : '#28a745' }}>{addressVerificationReport.unverifiedCount}</span></p>
                  {addressVerificationReport.unverifiedCount > 0 &&
                    <p style={{fontWeight: 'bold', color: '#ffc107'}}>🟡 Some addresses require manual review for full verification.</p>
                  }
                </div>
              )}
            </div>

            {/* Stage 6: AI Submission Summary */}
            <div style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', backgroundColor: '#f0faff', borderLeft: '4px solid #007bff' }}>
              <h4 style={{ color: '#007bff', marginBottom: '10px' }}>
                <span role="img" aria-label="Document">📄</span> 7. Generate AI Submission Summary
              </h4>
              <p style={{ marginBottom: '15px' }}>Get a comprehensive, AI-generated summary of all data quality, enrichment, and compliance checks before final submission.</p>
              <button
                onClick={handleGenerateAISubmissionSummary}
                disabled={isGeneratingSummary || finalProcessedData.length === 0 || ofacResults === null || addressVerificationReport === null}
                style={primaryButtonStyle}
              >
                {isGeneratingSummary ? "Generating Summary..." : "Generate AI Submission Summary"}
              </button>
              {submissionSummary && (
                <pre style={{
                  marginTop: '15px',
                  backgroundColor: '#ffffff',
                  padding: '15px',
                  borderRadius: '6px',
                  border: '1px solid #d0e7ff',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  fontFamily: 'monospace'
                }}>
                  {submissionSummary}
                </pre>
              )}
            </div>

            {/* AI Assistant Chat */}
            <div style={{ borderTop: '2px solid #007bff', paddingTop: '25px', marginTop: '30px', backgroundColor: '#eef6ff', borderRadius: '0 0 10px 10px', paddingBottom: '15px', margin: '-15px -15px -15px -15px', paddingLeft: '15px', paddingRight: '15px' }}>
              <h4 style={{ color: '#007bff', marginBottom: '15px', textAlign: 'center' }}>
                <span role="img" aria-label="Robot Head">🤖</span> Gemini AI Assistant: Your Co-pilot
              </h4>
              <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', minHeight: '80px', marginBottom: '15px', whiteSpace: 'pre-wrap', border: '1px solid #d0e7ff', boxShadow: '0 1px 5px rgba(0,0,0,0.05)' }}>
                <strong>AI:</strong> <span style={{ color: '#333' }}>{aiChatResponse}</span>
              </div>
              <form onSubmit={handleChatSubmit} style={{ display: 'flex' }}>
                <input
                  type="text"
                  value={aiChatPrompt}
                  onChange={(e) => setAiChatPrompt(e.target.value)}
                  placeholder="Ask Gemini AI for insights or help with your data operations..."
                  style={aiChatInputStyle}
                />
                <button type="submit" style={aiChatSendButtonStyle}>
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountCapabilityBulkUploadActionItem;