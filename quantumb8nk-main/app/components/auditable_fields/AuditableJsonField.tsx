// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";

async function callGeminiAPI(variables: object, fieldName: string): Promise<{ data: string | undefined }> {
  const entityId = (variables as any)?.id || "default_entity";

  const mockGeminiData = {
    "default_entity": {
      "sensitiveField": JSON.stringify({
        recordId: entityId,
        dataValue: "HighlyConfidentialData",
        generatedBy: "Gemini",
        timestamp: new Date().toISOString()
      }),
      "auditLog": JSON.stringify({
        logId: "LOG-001",
        event: "Access",
        user: "System",
        detail: "Field accessed by auditor",
        timestamp: new Date().toISOString()
      }),
      "otherField": JSON.stringify({
        category: "General",
        info: "This is some general information."
      })
    },
    "user_profile_123": {
      "sensitiveField": JSON.stringify({
        userId: "user_profile_123",
        userName: "Jane Doe",
        emailAddress: "jane.doe@example.com",
        encryptedData: "aj23k4j23h4j23h4j23h4",
        piiStatus: "Protected"
      })
    }
  };

  await new Promise(resolve => setTimeout(resolve, 700));

  const entitySpecificData = mockGeminiData[entityId];
  if (entitySpecificData && entitySpecificData[fieldName]) {
    return { data: entitySpecificData[fieldName] };
  } else {
    return { data: "{}" };
  }
}

interface AuditableJsonFieldProps {
  queryVariables: object;
  fieldName: string;
}

function AuditableJsonField({
  queryVariables,
  fieldName,
}: AuditableJsonFieldProps) {
  const [showFullField, setShowFullField] = useState<boolean>(false);
  const [displayedFullField, setDisplayedFullField] = useState<string>("");

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (showFullField) {
      setDisplayedFullField("");
    } else {
      try {
        const result = await callGeminiAPI(queryVariables, fieldName);
        setDisplayedFullField(result.data || "{}");
      } catch (error) {
        setDisplayedFullField("{}");
      }
    }
    setShowFullField(!showFullField);
  }

  const renderJson = (jsonString: string) => {
    try {
      const parsedJson = JSON.parse(jsonString);
      return (
        <pre style={{
          backgroundColor: '#f6f8fa',
          padding: '10px',
          borderRadius: '4px',
          overflowX: 'auto',
          fontSize: '0.85em',
          lineHeight: '1.4',
          fontFamily: 'monospace, monospace',
          color: '#333'
        }}>
          <code>
            {JSON.stringify(parsedJson, null, 2)}
          </code>
        </pre>
      );
    } catch (e) {
      return (
        <div style={{
          color: 'red',
          backgroundColor: '#ffebeb',
          padding: '10px',
          borderRadius: '4px',
          fontFamily: 'sans-serif'
        }}>
          Error: Invalid JSON data received.
        </div>
      );
    }
  };

  return (
    <>
      {showFullField && displayedFullField ? (
        renderJson(displayedFullField)
      ) : (
        <>
          <div style={{ marginRight: '8px', display: 'inline-block', color: '#666' }}>[Hidden Data]</div>
          <button
            onClick={(e) => {
              handleClick(e).catch(() => {});
            }}
            id="show-pii-field-btn"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#10B981',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0',
              font: 'inherit',
              outline: 'none',
              display: 'inline-block',
              transition: 'color 0.15s ease-in-out'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#059669'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#10B981'; }}
            onFocus={(e) => { e.currentTarget.style.color = '#059669'; }}
            onBlur={(e) => { e.currentTarget.style.color = '#10B981'; }}
          >
            <span>
              {showFullField ? "Hide" : "Show"}
            </span>
          </button>
        </>
      )}
    </>
  );
}

export default AuditableJsonField;