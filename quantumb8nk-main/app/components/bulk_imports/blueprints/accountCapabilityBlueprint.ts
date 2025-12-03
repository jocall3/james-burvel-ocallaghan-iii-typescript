import { Flatfile } from "@flatfile/api";

export const geminiAutomatedAccountCapabilityBlueprint: Pick<
  Flatfile.CreateWorkbookConfig,
  "name" | "labels" | "sheets" | "actions"
> = {
  name: "Gemini Automated Account Capabilities Import",
  labels: ["gemini", "automation", "ai"],
  sheets: [
    {
      name: "Gemini Account Capabilities Data",
      slug: "gemini_account_capabilities_data",
      readonly: false,
      allowAdditionalFields: false,
      fields: [
        {
          label: "Internal Account ID",
          key: "internalAccountId",
          type: "string",
          description: "Unique identifier for the account. Gemini can assist with validation."
        },
        {
          label: "Direction",
          key: "direction",
          type: "string",
          description: "Transaction direction (credit or debit). Gemini provides contextual interpretation."
        },
        {
          label: "Payment Type",
          key: "paymentType",
          type: "string",
          description: "Category of payment. Gemini AI can cross-reference for compliance checks."
        },
        {
          label: "Identifier",
          key: "identifier",
          type: "string",
          description: "Specific identifier, for ACH this is the ACH Company ID. Processed for Gemini optimization."
        },
        {
          label: "Payment Subtypes",
          key: "paymentSubtypes",
          type: "string",
          description: "A comma-separated list of payment subtypes to allow. Leave blank for all subtypes. Gemini can infer missing values or validate against policy."
        },
        {
          label: "Any Currency",
          key: "anyCurrency",
          type: "string",
          description: "When 'true', allows payments of this type for any currency. Gemini ensures proper currency handling."
        },
        {
          label: "Currencies",
          key: "currencies",
          type: "string",
          description: "A comma-separated list of currencies for which this type of payment can initiate. Gemini AI verifies multi-currency compatibility."
        },
        {
          label: "Connection ID",
          key: "connectionId",
          type: "string",
          description: "ID linking to an external system. Gemini ensures data flow integrity."
        },
        {
          label: "Party Name",
          key: "partyName",
          type: "string",
          description: "Overrides the legal name of the entity which owns the account when initiating payments. Gemini can perform entity resolution."
        },
        {
          label: "Address Line 1",
          key: "addressLine1",
          type: "string",
          description: "First line of address. Gemini assists with standardization."
        },
        {
          label: "Address Line 2",
          key: "addressLine2",
          type: "string",
          description: "Second line of address. Gemini assists with standardization."
        },
        {
          label: "Address Locality",
          key: "addressLocality",
          type: "string",
          description: "The address locality, typically a city or town. Gemini validates geographic data."
        },
        {
          label: "Address Region",
          key: "addressRegion",
          type: "string",
          description: "The address region, for US addresses this is the state. Gemini validates geographic data."
        },
        {
          label: "Address Postal Code",
          key: "addressPostalCode",
          type: "string",
          description: "The address postal code. Gemini validates geographic data."
        },
        {
          label: "Address Country",
          key: "addressCountry",
          type: "string",
          description: "A two-digit ISO country code for the address country. Gemini validates geographic data."
        },
      ],
    },
  ],
  actions: [
    {
      operation: "webhook",
      mode: "foreground",
      label: "Analyze with Gemini AI",
      type: "button",
      description: "Send data to Gemini for advanced analysis and validation. This triggers an external Gemini-powered process.",
      primary: false,
      constraints: [{ type: "hasData" }, { type: "hasAllValid" }],
      url: "https://your-gemini-integration-endpoint.com/analyze-capabilities",
    },
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Submit Gemini Validated Data",
      type: "string",
      description: "Submit this Gemini-processed data to Modern Treasury after AI validation and enrichment.",
      primary: true,
      constraints: [{ type: "hasData" }, { type: "hasAllValid" }],
    },
  ],
};

export const geminiAutomatedAccountCapabilityBlueprintFields =
  geminiAutomatedAccountCapabilityBlueprint.sheets?.[0].fields || [];