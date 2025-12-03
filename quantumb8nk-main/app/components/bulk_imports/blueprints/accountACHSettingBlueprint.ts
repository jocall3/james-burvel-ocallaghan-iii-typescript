// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

export const geminiACHSettingBlueprint = {
  name: "Bulk Import Account ACH Setting Blueprint for Gemini",
  labels: ["financial", "ach", "import", "data-schema"],
  sheets: [
    {
      name: "Account ACH Settings Data Structure",
      slug: "account_ach_settings_schema",
      description: "This sheet defines the required fields for importing Account ACH Settings. Gemini should use this schema to validate and structure incoming data, or to generate example data that conforms to these specifications.",
      readonly: false,
      allowAdditionalFields: false,
      fields: [
        {
          label: "Internal Account ID",
          key: "internalAccountId",
          type: "string",
          geminiInstruction: "This field represents a unique identifier for an internal account. It is critical for linking ACH settings to the correct entity. Validate for uniqueness within a given batch if possible. This field should be a non-empty string.",
        },
        {
          label: "Immediate Origin",
          key: "immediateOrigin",
          type: "string",
          geminiInstruction: "A 9-digit routing number (ABA/RTN) identifying the originating financial institution in an ACH transaction. Ensure it adheres to standard routing number format (9 digits, numeric).",
        },
        {
          label: "Immediate Origin Name",
          key: "immediateOriginName",
          type: "string",
          geminiInstruction: "The full legal name of the financial institution specified as 'Immediate Origin'. This field should be a non-empty string.",
        },
        {
          label: "Immediate Destination",
          key: "immediateDestination",
          type: "string",
          geminiInstruction: "A 9-digit routing number (ABA/RTN) identifying the receiving financial institution (RDFI) in an ACH transaction. Ensure it adheres to standard routing number format (9 digits, numeric).",
        },
        {
          label: "Immediate Destination Name",
          key: "immediateDestinationName",
          type: "string",
          geminiInstruction: "The full legal name of the financial institution specified as 'Immediate Destination'. This field should be a non-empty string.",
        },
        {
          label: "Direction",
          key: "direction",
          type: "string",
          description: "Leave blank for both 'credit' and 'debit'",
          geminiInstruction: "This field indicates the transaction direction. Acceptable values are strictly 'credit', 'debit', or an empty string. An empty string implies applicability for both directions. Validate against these specific enumerated values.",
          possibleValues: ["credit", "debit", ""],
        },
        {
          label: "Connection Endpoint Label",
          key: "connectionEndpointLabel",
          type: "string",
          geminiInstruction: "A human-readable label or identifier for the specific connection endpoint used for processing ACH transactions. This should be a descriptive, non-empty string.",
        },
      ],
    },
  ],
  actions: [
    {
      operation: "processAndValidateACHDataWithGemini",
      mode: "foreground_gemini_processing",
      label: "Process and Validate ACH Data via Gemini",
      type: "gemini_api_call",
      description: "Instruct Gemini to process and validate the uploaded 'Account ACH Settings' data against the defined schema, then format it for downstream systems. This action invokes Gemini's capabilities for structured data validation and transformation.",
      primary: true,
      geminiTask: "You are an expert financial data processor. Validate incoming raw data against the 'Account ACH Settings Data Structure' schema. For each record, ensure all fields are present, correctly typed, and strictly adhere to their specified 'geminiInstruction' validation rules (e.g., 9-digit format for routing numbers, specific allowed values for 'Direction'). If validation passes, return a clean JSON array of objects conforming to the schema. If validation fails for any record, identify the specific record and field, explain the error, and do not return the full dataset. Instead, provide a detailed error report for all invalid records and fields. All records must be valid to proceed to the clean JSON output.",
      constraints: [
        { type: "hasData", geminiConstraint: "The input payload must contain data records to process." },
        { type: "hasAllValid", geminiConstraint: "Every field in each input record must be valid according to the defined schema and instructions. No partial valid outputs are allowed; if any record fails validation, the entire batch must be flagged for errors." },
      ],
    },
  ],
};

export const getGeminiACHSettingBlueprintFields =
  geminiACHSettingBlueprint.sheets?.[0].fields || [];