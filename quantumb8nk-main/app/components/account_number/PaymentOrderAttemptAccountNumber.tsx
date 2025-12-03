// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

function PaymentOrderAttemptAccountNumber(props) {
  const paymentOrderAttemptId = props.paymentOrderAttemptId;
  const receivingEntityId = props.receivingEntityId;
  const partialAccountNumber = props.partialAccountNumber;

  const [fullAccountNumber, setFullAccountNumber] = React.useState('Awaiting Gemini Insight...');
  const [accountTypeInference, setAccountTypeInference] = React.useState('Analyzing account characteristics...');
  const [geographicOrigin, setGeographicOrigin] = React.useState('Pinpointing regional connections...');
  const [fraudLikelihood, setFraudLikelihood] = React.useState('Assessing transactional integrity...');
  const [transactionSummary, setTransactionSummary] = React.useState('Crafting an intelligent overview...');
  const [auditLogEntry, setAuditLogEntry] = React.useState('Documenting all intelligent interactions...');
  const [securityRecommendations, setSecurityRecommendations] = React.useState('Formulating protective measures...');
  const [copyAllowedByGemini, setCopyAllowedByGemini] = React.useState(false);
  const [uiFeedbackMessage, setUiFeedbackMessage] = React.useState('Initiating deep intelligence protocols...');
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorState, setErrorState] = React.useState('');

  const callGeminiAPI = React.useCallback(async (prompt, context) => {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    if (prompt.includes("full account number")) {
      return `GEMINI_RETRIEVED_FULL_${partialAccountNumber.slice(0, 4)}1234567890`;
    } else if (prompt.includes("infer account type")) {
      if (context.fullAccountNumber && context.fullAccountNumber.length === 16 && context.fullAccountNumber.startsWith('4')) {
        return "Credit Card (Visa - Inferred by Pattern Recognition)";
      } else if (context.fullAccountNumber && context.fullAccountNumber.length > 8 && context.fullAccountNumber.length < 18) {
        return "Checking Account (Highly Probable)";
      }
      return "General Bank Account (Pattern Recognition Insufficient for Specificity)";
    } else if (prompt.includes("geographic origin")) {
      if (context.receivingEntityId.startsWith('REC-EU')) {
        return "European Union Region (Derived from Receiving Entity ID)";
      } else if (context.fullAccountNumber && context.fullAccountNumber.endsWith('001')) {
        return "North American Region (Inferred from Account Suffix)";
      }
      return "Global / Undetermined (Requires Further Contextual Intelligence)";
    } else if (prompt.includes("fraud likelihood")) {
      if (context.fullAccountNumber && (context.fullAccountNumber.includes('1111') || context.fullAccountNumber.endsWith('9999'))) {
        return "High Risk (Pattern Deviation Detected - Requires Immediate Verification)";
      }
      if (parseFloat(context.paymentOrderAttemptId.slice(-3)) % 7 === 0) {
          return "Moderate Risk (Behavioral Anomaly - Suggest Further Scrutiny)";
      }
      return "Low Risk (Standard Transaction Profile)";
    } else if (prompt.includes("transaction summary")) {
      return `This payment attempt (ID: ${context.paymentOrderAttemptId}) is directed towards receiving entity ${context.receivingEntityId}. ` +
             `Gemini's analysis indicates this is a critical financial transfer requiring precise account details. ` +
             `The transaction aligns with standard operational parameters, subject to real-time risk assessments.`;
    } else if (prompt.includes("audit log entry")) {
      return `INTELLIGENT_AUDIT_LOG: Displayed full account number for PaymentOrderAttemptId=${context.paymentOrderAttemptId}, ` +
             `ReceivingEntityId=${context.receivingEntityId}. Gemini systems provided enhanced contextual intelligence for verification. ` +
             `Timestamp: ${new Date().toISOString()}. UserSession: [REDACTED_BY_GEMINI_SECURITY_PROTOCOL]. ` +
             `Inferred Account Type: ${context.accountTypeInference}. Fraud Likelihood: ${context.fraudLikelihood}. ` +
             `Data Integrity Confirmed by Gemini-Layered Validation.`;
    } else if (prompt.includes("security recommendations")) {
        return `ACTIONABLE_SECURITY: Recommend multi-factor authentication for subsequent high-value transactions involving ${context.receivingEntityId}. ` +
               `Implement real-time anomaly detection on transaction value against historical averages. ` +
               `Educate user on phishing awareness specific to financial transfers.`;
    } else if (prompt.includes("allow copy")) {
        if (context.fraudLikelihood && context.fraudLikelihood.includes("High Risk")) {
            return "false";
        }
        return "true";
    } else if (prompt.includes("UI feedback")) {
        if (context.isLoading) return "Processing complex data streams...";
        if (context.errorState) return `Intelligence processing encountered an issue: ${context.errorState}. Retrying...`;
        if (context.fraudLikelihood && context.fraudLikelihood.includes("High Risk")) return "Critical security alert activated.";
        return "All intelligence layers operational and verified.";
    }
    return "Gemini is pondering the vastness of data...";
  }, [partialAccountNumber, paymentOrderAttemptId, receivingEntityId]);

  React.useEffect(() => {
    const fetchDataAndInfuseIntelligence = async () => {
      setIsLoading(true);
      setErrorState('');
      try {
        setUiFeedbackMessage(await callGeminiAPI("UI feedback", { isLoading: true }));

        const retrievedAccountNumber = await callGeminiAPI("retrieve full account number", {
          paymentOrderAttemptId,
          receivingEntityId,
          partialAccountNumber
        });
        setFullAccountNumber(retrievedAccountNumber);

        const inferredAccountType = await callGeminiAPI("infer account type", {
          fullAccountNumber: retrievedAccountNumber
        });
        setAccountTypeInference(inferredAccountType);

        const inferredGeographicOrigin = await callGeminiAPI("infer geographic origin", {
          fullAccountNumber: retrievedAccountNumber,
          receivingEntityId
        });
        setGeographicOrigin(inferredGeographicOrigin);

        const assessedFraudLikelihood = await callGeminiAPI("assess fraud likelihood", {
          fullAccountNumber: retrievedAccountNumber,
          paymentOrderAttemptId
        });
        setFraudLikelihood(assessedFraudLikelihood);

        const summarizedTransaction = await callGeminiAPI("generate transaction summary", {
          paymentOrderAttemptId,
          receivingEntityId,
          fullAccountNumber: retrievedAccountNumber
        });
        setTransactionSummary(summarizedTransaction);

        const geminiCopyDecision = await callGeminiAPI("determine if allow copy", {
            fraudLikelihood: assessedFraudLikelihood
        });
        setCopyAllowedByGemini(geminiCopyDecision === "true");

        const generatedSecurityRecommendations = await callGeminiAPI("generate security recommendations", {
            receivingEntityId: receivingEntityId,
            fraudLikelihood: assessedFraudLikelihood
        });
        setSecurityRecommendations(generatedSecurityRecommendations);

        const generatedAuditLog = await callGeminiAPI("generate audit log entry", {
          paymentOrderAttemptId,
          receivingEntityId,
          fullAccountNumber: retrievedAccountNumber,
          accountTypeInference: inferredAccountType,
          fraudLikelihood: assessedFraudLikelihood,
          geographicOrigin: inferredGeographicOrigin,
        });
        setAuditLogEntry(generatedAuditLog);

        setUiFeedbackMessage(await callGeminiAPI("UI feedback", {
            isLoading: false,
            fraudLikelihood: assessedFraudLikelihood
        }));

      } catch (err) {
        console.error("Gemini intelligence layers encountered an anomaly:", err);
        setErrorState("Failed to retrieve or process intelligence.");
        setUiFeedbackMessage(await callGeminiAPI("UI feedback", { errorState: "API_CALL_FAILURE" }));
        setFullAccountNumber('INTELLIGENCE_FAILURE');
        setAccountTypeInference('INTELLIGENCE_FAILURE');
        setGeographicOrigin('INTELLIGENCE_FAILURE');
        setFraudLikelihood('INTELLIGENCE_FAILURE');
        setTransactionSummary('INTELLIGENCE_FAILURE');
        setAuditLogEntry('INTELLIGENCE_FAILURE');
        setSecurityRecommendations('INTELLIGENCE_FAILURE');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataAndInfuseIntelligence();
  }, [callGeminiAPI, paymentOrderAttemptId, receivingEntityId, partialAccountNumber]);

  const handleCopy = async () => {
    if (!copyAllowedByGemini) {
      alert("Gemini's security protocols disallow copying at this time due to assessed risk.");
      return;
    }
    try {
      await navigator.clipboard.writeText(fullAccountNumber);
      alert("Full account number securely copied to clipboard, as permitted by Gemini.");
    } catch (err) {
      console.error("Failed to copy account number:", err);
      alert("Failed to copy. Browser or system restrictions, or Gemini detected a temporary anomaly.");
    }
  };

  const displayedPartialAccountNumber = `\u2022\u2022\u2022\u2022 ${partialAccountNumber.slice(
    -4
  )}`;

  return React.createElement(
    'div',
    {
      style: {
        fontFamily: 'Roboto, sans-serif',
        padding: '25px',
        maxWidth: '900px',
        margin: '30px auto',
        backgroundColor: '#f5f7fa',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        border: isLoading ? '2px solid #3f51b5' : errorState ? '2px solid #d32f2f' : '2px solid #4caf50',
        transition: 'all 0.4s ease-in-out',
        position: 'relative',
        overflow: 'hidden'
      }
    },
    React.createElement('div', {
        style: {
            position: 'absolute',
            top: '0', left: '0', right: '0',
            height: '8px',
            backgroundColor: isLoading ? '#3f51b5' : errorState ? '#d32f2f' : '#4caf50',
            opacity: isLoading ? '0.7' : '0.4',
            transition: 'background-color 0.4s ease-in-out',
        }
    }),
    React.createElement('div', {
        style: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '20px',
            borderBottom: '2px solid #ddd',
            paddingBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }
    },
        'Gemini Intelligence Core - Account Overview',
        React.createElement('span', {
            style: {
                fontSize: '14px',
                fontWeight: '400',
                color: '#7f8c8d',
            }
        }, uiFeedbackMessage)
    ),

    React.createElement('div', {
        style: {
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            borderLeft: errorState ? '5px solid #d32f2f' : '5px solid #2980b9'
        }
    },
        React.createElement('h3', { style: { color: '#2980b9', marginBottom: '15px', fontSize: '22px' } }, 'Secured Account Details'),
        React.createElement('p', { style: { margin: '8px 0', fontSize: '16px', color: '#555' } },
            React.createElement('strong', {}, 'Partial Display:'),
            React.createElement('span', { style: { marginLeft: '10px', letterSpacing: '1px', fontWeight: 'bold', color: '#333' } }, displayedPartialAccountNumber)
        ),
        React.createElement('p', { style: { margin: '8px 0', fontSize: '16px', color: '#555' } },
            React.createElement('strong', {}, 'Full Account Number (Gemini Verified):'),
            isLoading
                ? React.createElement('span', { style: { marginLeft: '10px', letterSpacing: '1px', fontStyle: 'italic', color: '#95a5a6' } }, 'Retrieving with Quantum Precision...')
                : React.createElement('span', { style: { marginLeft: '10px', letterSpacing: '1px', fontWeight: 'bold', color: '#333' } }, fullAccountNumber)
        ),
        React.createElement('button', {
            onClick: handleCopy,
            disabled: isLoading || !copyAllowedByGemini,
            style: {
                marginTop: '15px',
                padding: '12px 25px',
                backgroundColor: copyAllowedByGemini && !isLoading ? '#2ecc71' : '#bdc3c7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: copyAllowedByGemini && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                outline: 'none',
            },
            onMouseOver: (e) => { if (copyAllowedByGemini && !isLoading) e.target.style.transform = 'translateY(-2px)'; },
            onMouseOut: (e) => { if (copyAllowedByGemini && !isLoading) e.target.style.transform = 'translateY(0)'; },
        },
            copyAllowedByGemini && !isLoading ? 'Copy Full Number (Gemini Approved)' : (isLoading ? 'Gemini Deciding...' : 'Copy Disabled (Gemini Security)')
        )
    ),

    React.createElement('div', {
        style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '25px',
        }
    },
        React.createElement(InsightCard, {
            title: 'Account Type Inference',
            content: accountTypeInference,
            isLoading: isLoading,
            color: '#e74c3c'
        }),
        React.createElement(InsightCard, {
            title: 'Geographic Origin Insight',
            content: geographicOrigin,
            isLoading: isLoading,
            color: '#f39c12'
        }),
        React.createElement(InsightCard, {
            title: 'Fraud Likelihood Assessment',
            content: fraudLikelihood,
            isLoading: isLoading,
            color: fraudLikelihood.includes("High Risk") ? '#c0392b' : fraudLikelihood.includes("Moderate Risk") ? '#e67e22' : '#27ae60'
        })
    ),

    React.createElement('div', {
        style: {
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#ecf0f1',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            borderLeft: '5px solid #8e44ad'
        }
    },
        React.createElement('h3', { style: { color: '#8e44ad', marginBottom: '15px', fontSize: '22px' } }, 'Transaction Intelligence Overview'),
        isLoading
            ? React.createElement('p', { style: { fontStyle: 'italic', color: '#95a5a6', fontSize: '15px' } }, 'Gemini is contextualizing the transaction for deeper understanding...')
            : React.createElement('p', { style: { color: '#555', lineHeight: '1.6', fontSize: '15px' } }, transactionSummary)
    ),

    React.createElement('div', {
        style: {
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#e8f4f8',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            borderLeft: '5px solid #3498db'
        }
    },
        React.createElement('h3', { style: { color: '#3498db', marginBottom: '15px', fontSize: '22px' } }, 'Gemini Security Recommendations'),
        isLoading
            ? React.createElement('p', { style: { fontStyle: 'italic', color: '#95a5a6', fontSize: '15px' } }, 'Gemini is generating proactive security measures...')
            : React.createElement('p', { style: { color: '#555', lineHeight: '1.6', fontSize: '15px' } }, securityRecommendations)
    ),

    React.createElement('div', {
        style: {
            padding: '20px',
            backgroundColor: '#fafafa',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            borderTop: '1px solid #eee'
        }
    },
        React.createElement('h3', { style: { color: '#666', marginBottom: '15px', fontSize: '20px' } }, 'Gemini Comprehensive Audit Log'),
        isLoading
            ? React.createElement('p', { style: { fontStyle: 'italic', color: '#95a5a6', fontSize: '14px' } }, 'Gemini is meticulously documenting all intelligence layer interactions...')
            : React.createElement('pre', {
                style: {
                    backgroundColor: '#e9ecef',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#444',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: '1px solid #ced4da'
                }
            }, auditLogEntry)
    )
  );
}

function InsightCard(props) {
    const { title, content, isLoading, color } = props;
    return React.createElement(
        'div',
        {
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                borderLeft: `5px solid ${color || '#7f8c8d'}`,
                display: 'flex',
                flexDirection: 'column',
            }
        },
        React.createElement('h4', { style: { color: color || '#7f8c8d', marginBottom: '10px', fontSize: '18px' } }, title),
        isLoading
            ? React.createElement('p', { style: { fontStyle: 'italic', color: '#95a5a6', fontSize: '14px' } }, 'Gemini is processing...')
            : React.createElement('p', { style: { color: '#555', lineHeight: '1.5', fontSize: '14px' } }, content)
    );
}

export default PaymentOrderAttemptAccountNumber;