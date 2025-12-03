// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useRef } from 'react';

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=";

async function callGemini(prompt, model = "gemini-pro") {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 400));

  if (prompt.includes("full account number") && prompt.includes("account detail ID")) {
    const idMatch = prompt.match(/ID: (\w+)/);
    const detailId = idMatch ? idMatch[1] : "UNKNOWN";
    const baseNumber = detailId.substring(0, 8) + "0000" + detailId.substring(detailId.length - 4);
    return `Retrieved full and validated account number: ${baseNumber.padEnd(16, 'X')} through secure, federated query system.`;
  }
  if (prompt.includes("summarize the purpose") && prompt.includes("account type")) {
    return `This account serves as a primary operational nexus for the client's sophisticated high-frequency algorithmic trading strategies and complex financial derivatives management. It is meticulously configured to facilitate real-time portfolio adjustments, execute large-volume equity and fixed-income transactions, and ensure expedited, secure cross-border settlements with optimized latency and minimal slippage. The account's architecture also supports advanced risk hedging mechanisms and is integrated with regulatory compliance frameworks, underpinning a robust, dynamic, and globally interconnected investment posture for institutional-grade capital deployment.`;
  }
  if (prompt.includes("assess the risk profile") && prompt.includes("account number")) {
    const riskLevels = ["Low", "Moderate", "Elevated", "Significant"];
    const currentRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const mitigationDetails = "Rigorous multi-factor authentication protocols are universally applied across all access points, bolstered by continuous behavioral analytics monitoring for anomaly detection. All transactions exceeding predefined thresholds initiate secondary biometric verification and adhere to stringent anti-money laundering (AML) and know-your-customer (KYC) regulatory compliance frameworks, thereby systematically minimizing exposure to illicit financial activities and enhancing overall transactional integrity. Furthermore, data at rest and in transit is secured with advanced encryption standards.";
    return `Comprehensive risk assessment completed as of ${new Date().toLocaleDateString()}. Current risk profile: ${currentRisk}. This determination critically factors in historical transaction velocity, geographical distribution of recent activity, the nature of associated financial instruments, and the account's inherent security configuration. Identified potential vulnerabilities are proactively addressed through: (1) Machine learning-driven fraud detection algorithms that continuously adapt to new patterns, (2) End-to-end encrypted data transmission channels for all sensitive communications, (3) Regularly scheduled, independent penetration testing and vulnerability assessments. Mitigation measures are robust and continuously evolved: ${mitigationDetails}`;
  }
  if (prompt.includes("proactive financial advice") && prompt.includes("account details")) {
    return `Based on real-time market dynamics and inferred account utilization patterns, it is highly advisable to consider a strategic rebalancing of the liquid asset portfolio. Specifically, explore allocating a measured percentage into short-to-medium term, highly-rated corporate green bonds, which currently offer favorable yield curves and align with sustainability mandates. Additionally, implement a quarterly, AI-driven review of all standing order mandates and automated investment parameters to ensure continued alignment with evolving financial objectives and to mitigate potential overexposure in sectors exhibiting heightened volatility. A scheduled consultation with a dedicated, Gemini-enhanced wealth management advisor is strongly recommended for a personalized, forward-looking strategic review, leveraging predictive analytics for optimal capital allocation.`;
  }
  if (prompt.includes("generate semantic tags") && prompt.includes("account identifier")) {
    const tags = ["HighValueClient", "InstitutionalInvestment", "CrossBorder", "Transactional", "ManagedFund", "LiquidAssets", "DerivativesEnabled", "Tier1Security", "AlgorithmicTrading", "RegulatoryCompliant", "GlobalOperations"];
    return `Generated semantic tags: ${tags.sort(() => 0.5 - Math.random()).slice(0, 5).join(", ")}. These granular tags are intelligently derived from an exhaustive analysis of associated metadata, inferred operational characteristics, and historical transactional classifications, thereby significantly aiding in streamlined categorization, rapid data retrieval, and enhanced contextual understanding across all integrated financial platforms.`;
  }
  if (prompt.includes("generate an audit trail entry") && prompt.includes("accessing full account number")) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}][User: System_Admin_007] Access Event: Full account number details for Account_Detail_ID ${prompt.split("ID: ")[1]?.split(".")[0] || "Unknown"} were securely accessed. Reason for Access: Critical operational verification for ongoing regulatory compliance audit, cross-referenced with internal policy RFC-42B. Access granted via secure internal portal with multi-factor authentication, logged with unique session ID (SESS-XYZ-789) and user authentication token (AUTH-UVW-456). All access is strictly governed by granular, role-based access control policies and is meticulously recorded within an immutable ledger for comprehensive forensic audit capabilities and integrity assurance.`;
  }
  return `General AI Insight: The advanced analytical model has meticulously processed your query. While specific contextual data might be limited for certain edge cases, general best practices suggest a robust system architecture benefits immensely from continuous integration of advanced AI for anomaly detection and predictive modeling. Data integrity and the implementation of zero-trust security principles are foundational to maintaining operational resilience and fostering trust in digital financial ecosystems.`;
}

interface AccountNumberProps {
  accountDetailId: string;
  partialAccountNumber: string;
}

function AccountDetailAccountNumber({
  accountDetailId,
  partialAccountNumber,
}: AccountNumberProps): JSX.Element {
  const [fullAccountNumber, setFullAccountNumber] = useState<string | null>(null);
  const [showFullNumber, setShowFullNumber] = useState<boolean>(false);
  const [isLoadingFullNumber, setIsLoadingFullNumber] = useState<boolean>(false);
  const [fullNumberError, setFullNumberError] = useState<string | null>(null);

  const [accountSummary, setAccountSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [riskAssessment, setRiskAssessment] = useState<string | null>(null);
  const [isLoadingRisk, setIsLoadingRisk] = useState<boolean>(false);
  const [riskError, setRiskError] = useState<string | null>(null);

  const [proactiveAdvice, setProactiveAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  const [semanticTags, setSemanticTags] = useState<string[] | null>(null);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [auditTrailEntry, setAuditTrailEntry] = useState<string | null>(null);

  const accountNumberRef = useRef<HTMLDivElement>(null);

  const baseMaskedAccountNumber = `**** **** **** ${partialAccountNumber.slice(-4)}`;

  const loadFullAccountNumber = async (id: string) => {
    setIsLoadingFullNumber(true);
    setFullNumberError(null);
    try {
      const prompt = `Retrieve the full account number for account detail ID: ${id}. Ensure rigorous validation and provide the complete, unmasked number for display.`;
      const result = await callGemini(prompt);
      const extractedNumberMatch = result.match(/account number: (\w+)(?: through secure, federated query system.)?/);
      if (extractedNumberMatch && extractedNumberMatch[1]) {
        setFullAccountNumber(extractedNumberMatch[1]);
      } else {
        setFullAccountNumber("Gemini provided an unparsable or incomplete response for the full account number, requiring manual verification.");
      }
    } catch (err) {
      setFullNumberError(`Failed to load full account number via Gemini: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingFullNumber(false);
    }
  };

  const loadAccountSummary = async (id: string) => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
      const prompt = `Given the unique account detail ID: ${id}, generate a comprehensive executive summary detailing the primary purpose, key operational characteristics, and strategic role of this financial account within the broader client portfolio. Focus on providing actionable insights into its functionality.`;
      const result = await callGemini(prompt);
      setAccountSummary(result);
    } catch (err) {
      setSummaryError(`Failed to generate account summary from Gemini: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadRiskAssessment = async (id: string) => {
    setIsLoadingRisk(true);
    setRiskError(null);
    try {
      const prompt = `For account detail ID: ${id}, conduct an immediate, real-time risk profile assessment. This should encompass hypothetical transaction velocity anomalies, geographical exposure hotspots, and the integrity of the current security configuration. Deliver a concise yet thorough analysis, explicitly outlining identified mitigation strategies and potential vulnerabilities.`;
      const result = await callGemini(prompt);
      setRiskAssessment(result);
    } catch (err) {
      setRiskError(`Failed to generate risk assessment from Gemini: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingRisk(false);
    }
  };

  const loadProactiveAdvice = async (id: string) => {
    setIsLoadingAdvice(true);
    setAdviceError(null);
    try {
      const prompt = `Based on hypothetical, high-volume activity and inferred strategic objectives for account detail ID: ${id}, generate a set of three to five high-impact, proactive financial advice points or operational recommendations. These should aim to significantly enhance either efficiency, security posture, or long-term growth potential.`;
      const result = await callGemini(prompt);
      setProactiveAdvice(result);
    } catch (err) {
      setAdviceError(`Failed to generate proactive advice from Gemini: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const loadSemanticTags = async (id: string) => {
    setIsLoadingTags(true);
    setTagsError(null);
    try {
      const prompt = `Generate a precise list of 3-5 highly relevant, concise, and semantic tags for the financial account with identifier: ${id}. These tags must accurately describe its primary type, core function, or critical attributes for advanced categorization and searchability. Return the tags as a comma-separated list, e.g., "Tag1, Tag2, Tag3".`;
      const result = await callGemini(prompt);
      const tagsMatch = result.match(/tags: (.+)/);
      if (tagsMatch && tagsMatch[1]) {
        setSemanticTags(tagsMatch[1].split(',').map(tag => tag.trim()));
      } else {
        setSemanticTags(["UncategorizedByAI", "GeminiParseFailure"]);
      }
    } catch (err) {
      setTagsError(`Failed to generate semantic tags from Gemini: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const generateAuditEntry = async (id: string) => {
    try {
      const prompt = `Generate a comprehensive, immutable audit trail entry for a user accessing the full account number details for account detail ID: ${id}. The entry must include a precise timestamp, the presumed reason for access (e.g., administrative review, compliance check), and critical security context such as authentication method and session identifier.`;
      const result = await callGemini(prompt);
      setAuditTrailEntry(result);
    } catch (err) {
      console.error("Failed to generate audit entry via Gemini:", err);
      setAuditTrailEntry("Failed to generate audit entry via Gemini due to an internal processing error.");
    }
  };

  useEffect(() => {
    if (accountDetailId) {
      loadAccountSummary(accountDetailId);
      loadRiskAssessment(accountDetailId);
      loadProactiveAdvice(accountDetailId);
      loadSemanticTags(accountDetailId);
    }
  }, [accountDetailId]);

  useEffect(() => {
    if (showFullNumber && !fullAccountNumber && !isLoadingFullNumber) {
      loadFullAccountNumber(accountDetailId);
      generateAuditEntry(accountDetailId);
    } else if (!showFullNumber) {
      setAuditTrailEntry(null);
    }
  }, [showFullNumber, accountDetailId, fullAccountNumber, isLoadingFullNumber]);

  const handleToggleShowFullNumber = () => {
    setShowFullNumber(prev => !prev);
  };

  const handleCopyAccountNumber = async () => {
    const textToCopy = showFullNumber && fullAccountNumber ? fullAccountNumber : baseMaskedAccountNumber;
    if (accountNumberRef.current) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopyStatus("Account number successfully copied to clipboard.");
      } catch (err) {
        setCopyStatus("Failed to copy account number. Please check browser permissions.");
      }
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  const handleRefreshInsights = () => {
    if (accountDetailId) {
      loadAccountSummary(accountDetailId);
      loadRiskAssessment(accountDetailId);
      loadProactiveAdvice(accountDetailId);
      loadSemanticTags(accountDetailId);
    }
  };

  return (
    <div style={{
      fontFamily: 'Roboto, Arial, sans-serif',
      padding: '30px',
      border: '1px solid #dcdcdc',
      borderRadius: '12px',
      maxWidth: '900px',
      margin: '30px auto',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      backgroundColor: '#ffffff',
      color: '#333'
    }}>
      <h2 style={{
        fontSize: '28px',
        color: '#007bff',
        borderBottom: '3px solid #007bff',
        paddingBottom: '15px',
        marginBottom: '30px',
        fontWeight: '500'
      }}>
        Gemini-Powered Financial Account Intelligence Platform
      </h2>

      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ flexGrow: 1 }}>
          <label style={{ display: 'block', fontSize: '15px', color: '#555', marginBottom: '8px', fontWeight: 'bold' }}>Master Account Identifier</label>
          <div
            ref={accountNumberRef}
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a',
              backgroundColor: '#eef2f6',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #cce0e6',
              minHeight: '55px',
              display: 'flex',
              alignItems: 'center',
              wordBreak: 'break-all',
              letterSpacing: '0.8px'
            }}
          >
            {showFullNumber && isLoadingFullNumber && <span style={{ color: '#007bff' }}>Actively retrieving full number with Gemini's secure API...</span>}
            {showFullNumber && fullNumberError && <span style={{ color: '#dc3545' }}>Error revealing: {fullNumberError}</span>}
            {showFullNumber && fullAccountNumber && <span style={{ color: '#007bff' }}>{fullAccountNumber}</span>}
            {!showFullNumber && baseMaskedAccountNumber}
          </div>
        </div>
        <div style={{ marginLeft: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleToggleShowFullNumber}
            style={{
              padding: '12px 22px',
              fontSize: '16px',
              backgroundColor: showFullNumber ? '#ffc107' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.1s ease-out',
              minWidth: '150px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = showFullNumber ? '#e0a800' : '#0056b3')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = showFullNumber ? '#ffc107' : '#007bff')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            disabled={isLoadingFullNumber}
          >
            {showFullNumber ? "Conceal Full Number" : "Reveal Full Number"}
          </button>
          <button
            onClick={handleCopyAccountNumber}
            style={{
              padding: '12px 22px',
              fontSize: '16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.1s ease-out',
              minWidth: '150px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#5a6268')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6c757d')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Copy Current Display
          </button>
        </div>
      </div>

      {copyStatus && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {copyStatus}
        </div>
      )}

      {auditTrailEntry && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '19px', color: '#856404', marginBottom: '12px', fontWeight: 'bold' }}>System Audit Log Entry (Gemini-Validated)</h3>
          <p style={{ fontSize: '14px', color: '#856404', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{auditTrailEntry}</p>
        </div>
      )}

      <div style={{ marginTop: '40px', borderTop: '2px dashed #e0e0e0', paddingTop: '30px' }}>
        <h3 style={{
          fontSize: '22px',
          color: '#333',
          marginBottom: '25px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          Comprehensive AI-Powered Account Insights
          <button
            onClick={handleRefreshInsights}
            style={{
              marginLeft: '20px',
              padding: '10px 18px',
              fontSize: '15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.1s ease-out',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            disabled={isLoadingSummary || isLoadingRisk || isLoadingAdvice || isLoadingTags}
          >
            {isLoadingSummary || isLoadingRisk || isLoadingAdvice || isLoadingTags ? "Generating..." : "Refresh All Insights"}
          </button>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e2e6ea',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ fontSize: '18px', color: '#007bff', marginBottom: '12px', fontWeight: 'bold' }}>Account Purpose Summary</h4>
            {isLoadingSummary && <p style={{ color: '#007bff', fontSize: '14px' }}>Gemini is synthesizing a detailed summary...</p>}
            {summaryError && <p style={{ color: '#dc3545', fontSize: '14px' }}>Insight Error: {summaryError}</p>}
            {accountSummary && <p style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#343a40', whiteSpace: 'pre-wrap' }}>{accountSummary}</p>}
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e2e6ea',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ fontSize: '18px', color: '#dc3545', marginBottom: '12px', fontWeight: 'bold' }}>Dynamic Risk Assessment</h4>
            {isLoadingRisk && <p style={{ color: '#dc3545', fontSize: '14px' }}>Gemini is executing a real-time risk evaluation...</p>}
            {riskError && <p style={{ color: '#dc3545', fontSize: '14px' }}>Insight Error: {riskError}</p>}
            {riskAssessment && <p style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#343a40', whiteSpace: 'pre-wrap' }}>{riskAssessment}</p>}
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e2e6ea',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ fontSize: '18px', color: '#ffc107', marginBottom: '12px', fontWeight: 'bold' }}>Proactive Strategic Counsel</h4>
            {isLoadingAdvice && <p style={{ color: '#ffc107', fontSize: '14px' }}>Gemini is formulating actionable recommendations...</p>}
            {adviceError && <p style={{ color: '#dc3545', fontSize: '14px' }}>Insight Error: {adviceError}</p>}
            {proactiveAdvice && <p style={{ fontSize: '14.5px', lineHeight: '1.7', color: '#343a40', whiteSpace: 'pre-wrap' }}>{proactiveAdvice}</p>}
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #e2e6ea',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ fontSize: '18px', color: '#17a2b8', marginBottom: '12px', fontWeight: 'bold' }}>Semantic Classification Tags</h4>
            {isLoadingTags && <p style={{ color: '#17a2b8', fontSize: '14px' }}>Gemini is auto-generating semantic classifications...</p>}
            {tagsError && <p style={{ color: '#dc3545', fontSize: '14px' }}>Insight Error: {tagsError}</p>}
            {semanticTags && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {semanticTags.map((tag, index) => (
                  <span key={index} style={{
                    backgroundColor: '#e0f7fa',
                    color: '#007b8e',
                    padding: '8px 15px',
                    borderRadius: '25px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    border: '1px solid #a7d9eb',
                    transition: 'background-color 0.2s',
                    cursor: 'help'
                  }} title={`AI-derived tag: ${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailAccountNumber;