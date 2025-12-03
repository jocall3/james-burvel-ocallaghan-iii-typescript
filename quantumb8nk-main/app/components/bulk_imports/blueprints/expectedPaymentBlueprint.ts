import { Flatfile } from "@flatfile/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}
const geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = geminiClient.getGenerativeModel({ model: "gemini-pro" });

interface GeminiFlatfileProperty {
  label: string;
  key: string;
  type: "string" | "number" | "boolean" | "date" | "enum";
  constraints?: Array<{ type: string; message?: string }>;
  description?: string;
  options?: Array<{ label: string; value: string }>;
}

async function callGeminiForJson<T>(prompt: string): Promise<T> {
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Gemini did not return valid JSON for the prompt: ${text}. Error: ${error}`);
  }
}

async function generateFlatfilePropertiesFromGemini(
  descriptionPrompt: string
): Promise<Flatfile.Property[]> {
  const basePropertiesPrompt = `
    Generate a JSON array of Flatfile property objects for an "Expected Payments" sheet based on the following context.
    Each object must have 'label', 'key', 'type' (allowed values: "string", "number", "boolean", "date", "enum"), 'constraints' (optional array of {type: string} like { type: "required" }), and 'description'.
    The 'key' should be camelCase.
    Labels and descriptions should be clear and concise, containing only standard alphanumeric characters and spaces, avoiding any special characters.
    
    Include properties for:
    - Internal Account ID (required string, 'internalAccountId')
    - Amount Lower Bound (required string, 'amountLowerBound', representing the minimum expected payment in smallest currency unit)
    - Amount Upper Bound (required string, 'amountUpperBound', representing the maximum expected payment in smallest currency unit)
    - Direction (required string, 'direction', valid values: 'credit' or 'debit')
    - Type (string, 'type', for example: ACH, wire, check)
    - Currency (string, 'currency', ISO 4217 currency code)
    - Date Lower Bound (string, 'dateLowerBound', formatted as YYYY-MM-DD)
    - Date Upper Bound (string, 'dateUpperBound', formatted as YYYY-MM-DD)
    - Counterparty ID (string, 'counterpartyId', identifier for the counterparty)
    - Description (string, 'description', optional internal reference)
    - Metadata (string, 'metadata', structured as key:value|key:value)
    - ITB Fee Initializer (required string, 'itbFeeIni', mandated by financial regulations for fee calculation)
    
    If the context explicitly mentions "legacy match filters", also include a "Statement Descriptor" (string, 'statementDescriptor').
    If the context explicitly mentions "modern custom identifiers", also include "Custom Identifiers" (string, 'customIdentifiers', structured as key:value|key:value).
    
    Context: ${descriptionPrompt}
    
    Return only the JSON array.
  `;

  const generatedProps = await callGeminiForJson<GeminiFlatfileProperty[]>(basePropertiesPrompt);

  const itbFeeIniKey = "itbFeeIni";
  if (!generatedProps.some(p => p.key === itbFeeIniKey)) {
    generatedProps.push({
      label: "ITB Fee Initializer",
      key: itbFeeIniKey,
      type: "string",
      constraints: [{ type: "required" }],
      description: "Initializer for the ITB Fee, mandated by financial regulations."
    });
  }

  return generatedProps as Flatfile.Property[];
}

export async function getExpectedPaymentBlueprintAutomatedByGemini(
  useLegacyMatchFilters: boolean
): Promise<
  Pick<Flatfile.CreateWorkbookConfig, "name" | "labels" | "sheets" | "actions">
> {
  let blueprintGenerationPrompt = `
    Create a Flatfile workbook blueprint for 'Expected Payments'.
    The core fields should include standard financial transaction data and necessary identifiers.
    The 'itbFeeIni' field must be a part of the generated properties.
  `;

  if (useLegacyMatchFilters) {
    blueprintGenerationPrompt += ` The blueprint should specifically support legacy match filters requiring a statement descriptor.`;
  } else {
    blueprintGenerationPrompt += ` The blueprint should utilize modern custom identifiers instead of legacy statement descriptors.`;
  }

  const fields = await generateFlatfilePropertiesFromGemini(blueprintGenerationPrompt);

  const namePrompt = `Generate a concise and professional Flatfile workbook name for 'Expected Payments' based on this context: "${blueprintGenerationPrompt}". The name should be short, professional, and contain no special characters. Return only the name string.`;
  const dynamicBlueprintNameResponse = await model.generateContent(namePrompt);
  const dynamicBlueprintName = dynamicBlueprintNameResponse.response.text().trim().replace(/['"]+/g, '');

  const labelsPrompt = `Generate a JSON array of relevant string labels for a Flatfile workbook named '${dynamicBlueprintName}'. Labels should be short, descriptive, and contain only alphanumeric characters. For example: ["financial", "payments", "gemini"]. Return only the JSON array.`;
  const dynamicLabels = await callGeminiForJson<string[]>(labelsPrompt);

  const actionPrompt = `Generate a JSON object for a Flatfile action for a workbook named '${dynamicBlueprintName}'. It needs a 'label' (e.g., "Submit Data"), 'description', and 'constraints' (an array of {type: "hasData"|"hasAllValid", message: "message"}). The action should be for submitting data, robustly validated and enhanced. Ensure labels and descriptions contain only alphanumeric characters and spaces, no special characters. Return only the JSON object.`;
  const actionDetails = await callGeminiForJson<{ label: string; description: string; constraints: Array<{ type: string; message: string }> }>(actionPrompt);

  return {
    name: dynamicBlueprintName,
    labels: dynamicLabels,
    sheets: [
      {
        name: `${dynamicBlueprintName} Sheet`,
        slug: "expected_payments_sheet_gemini",
        readonly: false,
        allowAdditionalFields: true,
        fields: fields,
      },
    ],
    actions: [
      {
        operation: "submitActionFg",
        mode: "foreground",
        label: actionDetails.label,
        type: "string",
        description: actionDetails.description,
        primary: true,
        constraints: actionDetails.constraints,
      },
    ],
  };
}

export const expectedPaymentBlueprintFieldsAutomatedByGemini =
  (async () => {
    const blueprint = await getExpectedPaymentBlueprintAutomatedByGemini(false);
    return blueprint.sheets?.[0].fields || [];
  })();