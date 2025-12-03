// Copyright James Burvel O'Callaghan III
// President Citibank Demo Business Inc.
// Enhanced by Gemini AI for automated counterparty processing

import { CreateWorkbookConfig } from "@flatfile/api/api";

export const geminiAutomatedCounterpartyBlueprint: Pick<
  CreateWorkbookConfig,
  "name" | "labels" | "sheets" | "actions"
> = {
  name: "Gemini AI Automated Counterparty Data Processing",
  labels: ["gemini-ai-automation", "data-enrichment"],
  sheets: [
    {
      name: "Counterparties Gemini AI Enhanced",
      slug: "counterparties-gemini-ai",
      readonly: false,
      allowAdditionalFields: true, // Allow Gemini AI to add or enrich fields
      fields: [
        {
          label: "Counterparty Legal Name",
          key: "name",
          type: "string",
          constraints: [
            {
              type: "required",
            },
          ],
          description:
            "The legal name attached to the counterparty's bank account. Gemini AI will validate and standardize this name.",
        },
        {
          label: "Email Address",
          key: "email",
          type: "string",
          description: "The counterparty's email address. Gemini AI can verify format and identify common errors.",
        },
        {
          label: "Bank Account Number",
          key: "accountNumber",
          type: "string",
          description:
            "The account number for the bank account. Gemini AI will assist in formatting, validation, and identifying the correct type.",
        },
        {
          label: "Account Number Type Gemini Inferred",
          key: "accountNumberType",
          type: "string",
          description:
            "One of `iban`, `clabe`, `wallet_address`, `hk_number`, `nz_number` or `other`. Gemini AI will infer and verify this type based on the provided account number.",
        },
        {
          label: "Bank Routing Number",
          key: "routingNumber",
          type: "string",
          description: "The routing number of the bank. Gemini AI can help identify, standardize, and correct if needed.",
        },
        {
          label: "Routing Number Type Gemini Inferred",
          key: "routingNumberType",
          type: "string",
          description:
            "Should be one of `aba`, `swift`, `ca_cpa`, `au_bsb`, `gb_sort_code`, `in_ifsc`. Gemini AI will infer if missing or validate if provided.",
        },
        {
          label: "Second Routing Number for International",
          key: "routingNumber2",
          type: "string",
          description:
            "Some international bank accounts require two routing numbers. Gemini AI will assist in determining if this is required.",
        },
        {
          label: "Second Routing Type Gemini Inferred",
          key: "routingNumberType2",
          type: "string",
          description: "The type of the second routing number. Gemini AI for inference and validation.",
        },
        {
          label: "Account Type Gemini Classified",
          key: "accountType",
          type: "string",
          description: "Can be `checking`, `savings` or other. Gemini AI will categorize the account type.",
        },
        {
          label: "Party Full Name",
          key: "partyName",
          type: "string",
          description: "Full legal name of the party. Gemini AI will standardize and resolve discrepancies.",
        },
        {
          label: "Party Entity Type Gemini Classified",
          key: "partyType",
          type: "string",
          description:
            "Either `individual` or `business`. Gemini AI will classify the party type based on provided data and context.",
        },
        {
          label: "Address Line 1 Gemini Verified",
          key: "addressLine1",
          type: "string",
          description: "Required for wire payment orders. Gemini AI will standardize and validate the address.",
        },
        {
          label: "Address Line 2 Gemini Verified",
          key: "addressLine2",
          type: "string",
          description: "Required for wire payment orders. Gemini AI for standardization.",
        },
        {
          label: "Address Locality Gemini Verified",
          key: "addressLocality",
          type: "string",
          description: "Required for wire payment orders. Gemini AI for standardization and geocoding.",
        },
        {
          label: "Address Region Gemini Verified",
          key: "addressRegion",
          type: "string",
          description: "Required for wire payment orders. Gemini AI for standardization.",
        },
        {
          label: "Address Postal Code Gemini Verified",
          key: "addressPostalCode",
          type: "string",
          description: "Required for wire payment orders. Gemini AI for standardization and validation.",
        },
        {
          label: "Address Country Gemini Verified",
          key: "addressCountry",
          type: "string",
          description: "Required for wire payment orders. Gemini AI will map to ISO country codes and validate.",
        },
        {
          label: "Gemini AI Generated Metadata",
          key: "metadata",
          type: "string",
          description:
            "Additional data represented as key-value pairs generated or enriched by Gemini AI. No special characters outside of : and | expected.",
        },
        {
          label: "Send Remittance Advice Gemini Determined",
          key: "sendRemittanceAdvice",
          type: "string",
          description:
            "If `true`, Modern Treasury will send an email. Gemini AI can determine this flag based on counterparty profile.",
        },
        {
          label: "Gemini AI Processing Status",
          key: "geminiProcessingStatus",
          type: "string",
          description: "The processing status of the record by Gemini AI: 'processed', 'pending review', 'error'.",
          constraints: [{ type: "required" }],
        },
        {
          label: "Gemini AI Confidence Score",
          key: "geminiConfidenceScore",
          type: "number",
          description: "A confidence score (0-100) generated by Gemini AI indicating the reliability of the processed data.",
          constraints: [{ type: "required" }],
        },
      ],
    },
  ],
  actions: [
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Process Data with Gemini AI",
      type: "string",
      description: "Send uploaded counterparty data to Gemini AI for automated validation, enrichment, and categorization.",
      primary: true,
      constraints: [{ type: "hasData" }, { type: "hasAllValid" }],
    },
    {
      operation: "runHook",
      mode: "background",
      label: "Trigger Gemini AI Manual Review",
      type: "string",
      description: "Initiate a manual review process for records flagged by Gemini AI or requiring human oversight.",
      primary: false,
      constraints: [{ type: "hasData" }],
    },
  ],
};

export const geminiAutomatedCounterpartyBlueprintFields =
  geminiAutomatedCounterpartyBlueprint.sheets?.[0].fields || [];