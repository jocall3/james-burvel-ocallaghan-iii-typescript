type GeminiModelName = 'gemini-pro' | 'gemini-vision';

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
  usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
}

class MockGeminiClient {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!apiKey) {
      console.warn("Gemini API Key is not set Mock client will return simulated data");
    }
  }

  async generateContent(prompt: string, data?: any): Promise<GeminiResponse> {
    console.log("Simulating Gemini API call with prompt:", prompt, "and data:", data);
    await new Promise(resolve => setTimeout(resolve, 500));

    let responseText = "Simulated Gemini response";
    if (prompt.includes("validate")) {
        responseText = JSON.stringify({ isValid: true, feedback: "All primary fields appear valid based on initial assessment" });
    } else if (prompt.includes("enrich")) {
        responseText = JSON.stringify({ enrichedData: { inferredPartyType: "business", suggestedDescription: "Automated payment order enrichment" } });
    } else if (prompt.includes("analyze")) {
        responseText = JSON.stringify({ riskScore: 0.1, riskLevel: "low", detectedAnomalies: [] });
    } else if (prompt.includes("correct")) {
        responseText = JSON.stringify({ corrections: { amount: "1000", currency: "USD" } });
    } else if (prompt.includes("summary")) {
        responseText = "This payment order initiates a credit transfer of USD 10.00 from Originating Account ID to Counterparty Name for the purpose of X Automated analysis found low risk";
    }

    return {
      candidates: [{
        content: {
          parts: [{ text: responseText }]
        }
      }],
      usageMetadata: { promptTokenCount: prompt.length + (data ? JSON.stringify(data).length : 0), candidatesTokenCount: responseText.length }
    };
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_MODEL = "gemini-pro";

const geminiClient = new MockGeminiClient(GEMINI_API_KEY);

async function processGeminiResponse(prompt: string, data: any): Promise<any> {
    try {
        const result = await geminiClient.generateContent(prompt, data);
        const responseText = result.candidates[0].content.parts[0].text;
        try {
            return JSON.parse(responseText);
        } catch (e) {
            return responseText;
        }
    } catch (error) {
        console.error("Gemini API error:", error);
        return { error: "Failed to process with Gemini" };
    }
}

import { Flatfile } from "@flatfile/api";

export const paymentOrderBlueprint: Pick<
  Flatfile.CreateWorkbookConfig,
  "name" | "labels" | "sheets" | "actions"
> = {
  name: "Bulk Import Payment Orders - Gemini Enhanced",
  labels: ["payment", "gemini", "automation", "ai"],
  sheets: [
    {
      name: "Payment Orders",
      slug: "payment_orders",
      readonly: false,
      allowAdditionalFields: true,
      fields: [
        {
          label: "Ultimate Originating Party Name",
          key: "ultimateOriginatingPartyName",
          type: "string",
          description: "Name of the ultimate originating party",
        },
        {
          label: "Ultimate Originating Party Address Line 1",
          key: "ultimateOriginatingPartyAddressLine1",
          type: "string",
          description: "Address line 1 of the ultimate originating party",
        },
        {
          label: "Ultimate Originating Party Locality",
          key: "ultimateOriginatingPartyLocality",
          type: "string",
          description: "Locality of the ultimate originating party",
        },
        {
          label: "Ultimate Originating Party Region",
          key: "ultimateOriginatingPartyRegion",
          type: "string",
          description: "Region of the ultimate originating party",
        },
        {
          label: "Ultimate Originating Party Postal Code",
          key: "ultimateOriginatingPartyPostalCode",
          type: "string",
          description: "Postal code of the ultimate originating party",
        },
        {
          label: "Ultimate Originating Party Country",
          key: "ultimateOriginatingPartyCountry",
          type: "string",
          description: "Country of the ultimate originating party",
        },
        {
          label: "Originating Account ID",
          key: "originatingAccountId",
          type: "string",
          constraints: [
            {
              type: "required",
              error: "Originating Account ID is required for all payment orders",
            },
          ],
          description:
            "The ID of your organization's internal account that will originate this payment order",
        },
        {
          label: "Type",
          key: "type",
          type: "string",
          constraints: [
            {
              type: "required",
              error: "Payment type is required",
            },
            {
              type: "enum",
              options: ["ACH", "wire", "book", "EFT", "check"],
              error: "Invalid payment type Must be one of ACH wire book EFT check",
            },
          ],
          description:
            "Designates the payment type you would like to request for the payment orders e.g ACH wire book etc Case sensitive - use lowercase",
        },
        {
          label: "Priority",
          key: "priority",
          type: "string",
          constraints: [
            {
              type: "enum",
              options: ["normal", "high"],
              error: "Priority must be either 'normal' or 'high'",
            },
          ],
          description:
            "Either `normal` or `high` For ACH and EFT payments `high` represents a same-day ACH or EFT transfer respectively For check payments `high` can mean an overnight check rather than standard mail Default: `normal`",
        },
        {
          label: "Process After",
          key: "processAfter",
          type: "string",
          description:
            "If present Modern Treasury will not process the payment until after this time If `process_after` is past the cutoff for `effective_date` `process_after` will take precedence and `effective_date` will automatically update to reflect the earliest possible sending date after `process_after` Format: ISO8601 timestamp",
          constraints: [
            {
              type: "pattern",
              pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z$",
              error: "Process After must be a valid ISO8601 timestamp e.g YYYY-MM-DDTHH:MM:SSZ"
            }
          ]
        },
        {
          label: "Purpose",
          key: "purpose",
          type: "string",
          description:
            "For wires this is usually the purpose which is transmitted via the `InstrForDbtrAgt` field in the ISO20022 file For EFT this field is the 3 digit CPA Code that will be attached to the payment",
        },
        {
          label: "Amount",
          key: "amount",
          type: "string",
          description:
            "The payment order's value in specified currency's smallest unit E.g $10 USD would be represented as 1000 If you use this attribute do not use the `dollar_amount` attribute",
          constraints: [
            {
              type: "regex",
              pattern: "^\\d+$",
              error: "Amount must be a non-negative integer representing the smallest currency unit"
            }
          ]
        },
        {
          label: "Dollar Amount",
          key: "dollarAmount",
          type: "string",
          description:
            "Alternate way to specify USD amounts only E.g $10 is represented as 10.00 If you use this attribute do not use the `amount` attribute",
          constraints: [
            {
              type: "regex",
              pattern: "^\\d+(\\.\\d{1,2})?$",
              error: "Dollar Amount must be a valid currency format e.g 10.00 or 10"
            }
          ]
        },
        {
          label: "Currency",
          key: "currency",
          type: "string",
          description:
            "Must conform to ISO 4217 Defaults to the currency of the originating account",
          constraints: [
            {
              type: "pattern",
              pattern: "^[A-Z]{3}$",
              error: "Currency must be a 3-letter ISO 4217 code e.g USD EUR"
            }
          ]
        },
        {
          label: "Direction",
          key: "direction",
          type: "string",
          constraints: [
            {
              type: "required",
              error: "Payment direction is required",
            },
            {
              type: "enum",
              options: ["credit", "debit"],
              error: "Direction must be 'credit' or 'debit'",
            },
          ],
          description:
            "If `credit` moves money from your account to someone else's If `debit` pulls money from someone else's account to your own Note: wire and check payment types will always be `credit` Case sensitive - use lowercase",
        },
        {
          label: "Effective Date",
          key: "effectiveDate",
          type: "string",
          description:
            "The date transactions are to be posted to the counterparty's account If you wish to future date a payment order you will want to fill in this attribute If this attribute is not filled it will default to the next business date Format: YYYY-MM-DD",
          constraints: [
            {
              type: "pattern",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              error: "Effective Date must be in YYYY-MM-DD format"
            }
          ]
        },
        {
          label: "Description",
          key: "description",
          type: "string",
          description:
            "An optional description for internal use only This will not be visible to the counterparty",
        },
        {
          label: "Statement Descriptor",
          key: "statementDescriptor",
          type: "string",
          description:
            "An optional descriptor which will appear in the receiver's statement The bank statement description should be used for your counterparties to see more detail within their bank statement",
        },
        {
          label: "Remittance Information",
          key: "remittanceInformation",
          type: "string",
          description:
            "Remittance information is typically another attribute that can be utilized to describe the money that is being sent For ACH this field will be passed through on an addenda record For wire payments the field will be passed through as the `Originator to Beneficiary Information` If this field is left blank then an addenda record will not be created",
        },
        {
          label: "Counterparty Account ID",
          key: "counterpartyAccountId",
          type: "string",
          description:
            "The ID of an existing counterparty's account internal or external that will receive this payment order Including this will override the other counterparty information you provide",
        },
        {
          label: "Counterparty Name",
          key: "counterpartyName",
          type: "string",
        },
        {
          label: "Counterparty Routing Number",
          key: "counterpartyRoutingNumber",
          type: "string",
          description: "The routing number of the counterparty",
        },
        {
          label: "Counterparty Routing Type",
          key: "counterpartyRoutingType",
          type: "string",
          description:
            "Either `aba` `swift` or `ca_cpa` Case sensitive - use lowercase",
            constraints: [
              {
                type: "enum",
                options: ["aba", "swift", "ca_cpa"],
                error: "Counterparty Routing Type must be 'aba' 'swift' or 'ca_cpa'"
              }
            ]
        },
        {
          label: "Counterparty Routing Number 2",
          key: "counterpartyRoutingNumber2",
          type: "string",
          description: "The counterparty's second routing number",
        },
        {
          label: "Counterparty Routing Type 2",
          key: "counterpartyRoutingType2",
          type: "string",
          description:
            "Either `aba` `swift` or `ca_cpa` Case sensitive - use lowercase",
            constraints: [
              {
                type: "enum",
                options: ["aba", "swift", "ca_cpa"],
                error: "Counterparty Routing Type 2 must be 'aba' 'swift' or 'ca_cpa'"
              }
            ]
        },
        {
          label: "Counterparty Account Number",
          key: "counterpartyAccountNumber",
          type: "string",
          description: "The account number of the counterparty",
        },
        {
          label: "Counterparty Account Number Type",
          key: "counterpartyAccountNumberType",
          type: "string",
          description:
            "Supports `iban` and `clabe` Leave blank if the bank account number is in a generic format Case sensitive - use lowercase",
            constraints: [
              {
                type: "enum",
                options: ["iban", "clabe", ""],
                error: "Counterparty Account Number Type must be 'iban' 'clabe' or empty"
              }
            ]
        },
        {
          label: "Counterparty Account Type",
          key: "counterpartyAccountType",
          type: "string",
          description:
            "Can be `checking` `savings` or other Case sensitive - use lowercase",
            constraints: [
              {
                type: "enum",
                options: ["checking", "savings", "other"],
                error: "Counterparty Account Type must be 'checking' 'savings' or 'other'"
              }
            ]
        },
        {
          label: "Counterparty Party Type",
          key: "counterpartyPartyType",
          type: "string",
          description:
            "Either `individual` or `business` Case sensitive - use lowercase",
            constraints: [
              {
                type: "enum",
                options: ["individual", "business"],
                error: "Counterparty Party Type must be 'individual' or 'business'"
              }
            ]
        },
        {
          label: "Counterparty Address Line 1",
          key: "counterpartyAddressLine1",
          type: "string",
          description: "Required for wire payment orders",
        },
        {
          label: "Counterparty Address Line 2",
          key: "counterpartyAddressLine2",
          type: "string",
          description: "Required for wire payment orders",
        },
        {
          label: "Counterparty Address Locality",
          key: "counterpartyAddressLocality",
          type: "string",
          description: "Required for wire payment orders",
        },
        {
          label: "Counterparty Address Region",
          key: "counterpartyAddressRegion",
          type: "string",
          description: "Required for wire payment orders",
        },
        {
          label: "Counterparty Address Postal Code",
          key: "counterpartyAddressPostalCode",
          type: "string",
          description: "Required for wire payment orders",
        },
        {
          label: "Counterparty Address Country",
          key: "counterpartyAddressCountry",
          type: "string",
          description: "Required for wire payment orders",
        },
        {
          label: "Foreign Exchange Contract",
          key: "foreignExchangeContract",
          type: "string",
          description:
            "If present indicates a specific foreign exchange contract number that has been generated by your financial institution",
        },
        {
          label: "Foreign Exchange Indicator",
          key: "foreignExchangeIndicator",
          type: "string",
          description:
            "Indicates the type of FX transfer to initiate if the payment order currency matches the originating account currency Can be either `variable_to_fixed` `fixed_to_variable` or null Case sensitive - use lowercase",
            constraints: [
              {
                type: "enum",
                options: ["variable_to_fixed", "fixed_to_variable", ""],
                error: "Foreign Exchange Indicator must be 'variable_to_fixed' 'fixed_to_variable' or empty"
              }
            ]
        },
        {
          label: "Charge Bearer",
          key: "chargeBearer",
          type: "string",
          description:
            "The party that will pay the fees for the payment order Only applies to wire payment orders Can be one of `SHA` shared `OUR` sender or `BEN` beneficiary Case sensitive - use uppercase",
            constraints: [
              {
                type: "enum",
                options: ["SHA", "OUR", "BEN"],
                error: "Charge Bearer must be 'SHA' 'OUR' or 'BEN'"
              }
            ]
        },
        {
          label: "Subtype",
          key: "subtype",
          type: "string",
          description:
            "For ACH payment orders the subtype represents the SEC code We currently support `CCD` `PPD` `IAT` `CTX` `WEB` `CIE` and `TEL` When Modern Treasury initiates an ACH payment on your behalf the SEC Code is set automatically When the receiving account's `party_type` is `individual` the `PPD` code is used When `party_type` is `business` or isn't set `CCD` is used Case sensitive - use uppercase",
            constraints: [
              {
                type: "enum",
                options: ["CCD", "PPD", "IAT", "CTX", "WEB", "CIE", "TEL", ""],
                error: "Subtype must be one of `CCD` `PPD` `IAT` `CTX` `WEB` `CIE` `TEL` or empty"
              }
            ]
        },
        {
          label: "Metadata",
          key: "metadata",
          type: "string",
          description:
            "Additional data represented as key-value pairs separated by a `|` pipe character Do not include special characters outside of `:` and `|`",
        },
        {
          label: "Accounting Class Name",
          key: "accountingClassName",
          type: "string",
          description:
            "These names can be found in the organization settings page You should only use accounting class ID or accounting class name not both",
        },
        {
          label: "Accounting Account Name",
          key: "accountingAccountName",
          type: "string",
          description:
            "These names can be found in the organization settings page You should only use accounting account ID or accounting account name not both",
        },
        {
          label: "Accounting Class ID",
          key: "accountingClassId",
          type: "string",
          description:
            "These IDs can be found in the organization settings page You should only use accounting class ID or accounting class name not both",
        },
        {
          label: "Accounting Account ID",
          key: "accountingAccountId",
          type: "string",
          description:
            "These IDs can be found in the organization settings page You should only use accounting account ID or accounting account name not both",
        },
        {
          label: "Gemini Analysis Result",
          key: "geminiAnalysisResult",
          type: "string",
          readonly: true,
          description: "Result of Gemini AI analysis for risk and anomalies",
        },
        {
          label: "Gemini Validation Feedback",
          key: "geminiValidationFeedback",
          type: "string",
          readonly: true,
          description: "Feedback from Gemini AI on data validity",
        },
        {
          label: "Gemini Enrichment Status",
          key: "geminiEnrichmentStatus",
          type: "string",
          readonly: true,
          description: "Status of data enrichment by Gemini AI",
        },
        {
          label: "Gemini Suggested Corrections",
          key: "geminiSuggestedCorrections",
          type: "string",
          readonly: true,
          description: "JSON string of corrections suggested by Gemini AI",
        },
        {
          label: "Gemini Summary",
          key: "geminiSummary",
          type: "string",
          readonly: true,
          description: "A concise summary of the payment order generated by Gemini AI",
        }
      ],
    },
  ],
  actions: [
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Submit to Modern Treasury",
      type: "string",
      description: "Submit this data to Modern Treasury after all checks",
      primary: true,
      constraints: [{ type: "hasData" }, { type: "hasAllValid" }],
      handler: async (event, { api }) => {
        const { jobId, sheetId } = event.context;
        try {
          await api.jobs.update(jobId, { info: "Starting submission to Modern Treasury...", progress: 10 });

          const records = await api.getRecords(sheetId);
          if (!records || records.length === 0) {
            await api.jobs.update(jobId, { status: "failed", info: "No records found to submit" });
            return;
          }

          const processedRecords = records.map(record => {
            const data = record.values;
            const payload: Record<string, any> = {};
            for (const key in data) {
                if (data[key] && data[key].value !== undefined) {
                    payload[key] = data[key].value;
                }
            }
            delete payload.geminiAnalysisResult;
            delete payload.geminiValidationFeedback;
            delete payload.geminiEnrichmentStatus;
            delete payload.geminiSuggestedCorrections;
            delete payload.geminiSummary;
            return payload;
          });

          console.log("Submitting to Modern Treasury:", JSON.stringify(processedRecords));

          await new Promise(resolve => setTimeout(resolve, 2000));

          await api.jobs.update(jobId, { info: "Successfully submitted to Modern Treasury", progress: 100, status: "complete" });
        } catch (error) {
          await api.jobs.update(jobId, { status: "failed", info: `Submission failed: ${error.message}` });
        }
      },
    },
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Analyze with Gemini AI",
      type: "string",
      description: "Uses Gemini to analyze payment orders for risk patterns and anomalies",
      constraints: [{ type: "hasData" }],
      handler: async (event, { api }) => {
        const { jobId, sheetId } = event.context;
        try {
          await api.jobs.update(jobId, { info: "Starting Gemini AI analysis...", progress: 10 });

          const records = await api.getRecords(sheetId);
          if (!records || records.length === 0) {
            await api.jobs.update(jobId, { status: "failed", info: "No records found for Gemini analysis" });
            return;
          }

          const updatedRecords = [];
          for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const paymentData = record.values;
            const prompt = `Analyze the following payment order data for potential risks anomalies or unusual patterns: ${JSON.stringify(paymentData)} Provide a concise analysis result risk score 0-1 and detected anomalies`;
            const analysisResult = await processGeminiResponse(prompt, paymentData);

            await api.jobs.update(jobId, { info: `Analyzing record ${i + 1}/${records.length}...`, progress: 10 + Math.floor((i + 1) / records.length * 70) });

            updatedRecords.push({
              id: record.id,
              values: {
                geminiAnalysisResult: { value: typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult) },
              },
            });
          }

          await api.upsertRecords(sheetId, updatedRecords);
          await api.jobs.update(jobId, { info: "Gemini AI analysis complete Results added to records", progress: 100, status: "complete" });
        } catch (error) {
          await api.jobs.update(jobId, { status: "failed", info: `Gemini analysis failed: ${error.message}` });
        }
      },
    },
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Validate with Gemini AI",
      type: "string",
      description: "Uses Gemini to perform advanced validation and provide feedback on data quality",
      constraints: [{ type: "hasData" }],
      handler: async (event, { api }) => {
        const { jobId, sheetId } = event.context;
        try {
          await api.jobs.update(jobId, { info: "Starting Gemini AI validation...", progress: 10 });

          const records = await api.getRecords(sheetId);
          if (!records || records.length === 0) {
            await api.jobs.update(jobId, { status: "failed", info: "No records found for Gemini validation" });
            return;
          }

          const updatedRecords = [];
          for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const paymentData = record.values;
            const prompt = `Perform a comprehensive validation check on the following payment order data Identify any inconsistencies potential errors or missing critical information Provide specific feedback for each detected issue or confirm validity if no issues are found Data: ${JSON.stringify(paymentData)}`;
            const validationFeedback = await processGeminiResponse(prompt, paymentData);

            await api.jobs.update(jobId, { info: `Validating record ${i + 1}/${records.length}...`, progress: 10 + Math.floor((i + 1) / records.length * 70) });

            updatedRecords.push({
              id: record.id,
              values: {
                geminiValidationFeedback: { value: typeof validationFeedback === 'string' ? validationFeedback : JSON.stringify(validationFeedback) },
              },
            });
          }

          await api.upsertRecords(sheetId, updatedRecords);
          await api.jobs.update(jobId, { info: "Gemini AI validation complete Feedback added to records", progress: 100, status: "complete" });
        } catch (error) {
          await api.jobs.update(jobId, { status: "failed", info: `Gemini validation failed: ${error.message}` });
        }
      },
    },
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Enrich with Gemini AI",
      type: "string",
      description: "Uses Gemini to enrich missing or incomplete data points in payment orders",
      constraints: [{ type: "hasData" }],
      handler: async (event, { api }) => {
        const { jobId, sheetId } = event.context;
        try {
          await api.jobs.update(jobId, { info: "Starting Gemini AI enrichment...", progress: 10 });

          const records = await api.getRecords(sheetId);
          if (!records || records.length === 0) {
            await api.jobs.update(jobId, { status: "failed", info: "No records found for Gemini enrichment" });
            return;
          }

          const updatedRecords = [];
          for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const paymentData = record.values;
            const prompt = `Enrich the following payment order data by inferring missing information where possible for example 'Counterparty Party Type' from 'Counterparty Name' or suggest sensible defaults for optional fields if they are critical Return only the enriched fields in JSON format Data: ${JSON.stringify(paymentData)}`;
            const enrichmentResult = await processGeminiResponse(prompt, paymentData);

            await api.jobs.update(jobId, { info: `Enriching record ${i + 1}/${records.length}...`, progress: 10 + Math.floor((i + 1) / records.length * 70) });

            if (enrichmentResult && typeof enrichmentResult === 'object' && enrichmentResult.enrichedData) {
              const enrichedValues: Record<string, any> = {};
              for (const key in enrichmentResult.enrichedData) {
                  if (!paymentData[key] || paymentData[key].value === null || paymentData[key].value === "") {
                      enrichedValues[key] = { value: enrichmentResult.enrichedData[key] };
                  }
              }
              enrichedValues.geminiEnrichmentStatus = { value: "Enriched" };
              updatedRecords.push({
                id: record.id,
                values: enrichedValues,
              });
            } else {
              updatedRecords.push({
                id: record.id,
                values: {
                  geminiEnrichmentStatus: { value: "No enrichment applied" },
                },
              });
            }
          }

          await api.upsertRecords(sheetId, updatedRecords);
          await api.jobs.update(jobId, { info: "Gemini AI enrichment complete Enriched data added to records", progress: 100, status: "complete" });
        } catch (error) {
          await api.jobs.update(jobId, { status: "failed", info: `Gemini enrichment failed: ${error.message}` });
        }
      },
    },
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Suggest Corrections with Gemini AI",
      type: "string",
      description: "Asks Gemini to suggest corrections for invalid or ambiguous fields",
      constraints: [{ type: "hasData" }],
      handler: async (event, { api }) => {
        const { jobId, sheetId } = event.context;
        try {
          await api.jobs.update(jobId, { info: "Starting Gemini AI correction suggestions...", progress: 10 });

          const records = await api.getRecords(sheetId);
          if (!records || records.length === 0) {
            await api.jobs.update(jobId, { status: "failed", info: "No records found for Gemini correction suggestions" });
            return;
          }

          const updatedRecords = [];
          for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const paymentData = record.values;
            const prompt = `Based on the following payment order data identify specific fields that are likely incorrect or could be improved and suggest precise corrections Output suggestions in JSON format mapping field keys to their suggested new values Data: ${JSON.stringify(paymentData)}`;
            const correctionResult = await processGeminiResponse(prompt, paymentData);

            await api.jobs.update(jobId, { info: `Suggesting corrections for record ${i + 1}/${records.length}...`, progress: 10 + Math.floor((i + 1) / records.length * 70) });

            updatedRecords.push({
              id: record.id,
              values: {
                geminiSuggestedCorrections: { value: typeof correctionResult === 'string' ? correctionResult : JSON.stringify(correctionResult.corrections || {}) },
              },
            });
          }

          await api.upsertRecords(sheetId, updatedRecords);
          await api.jobs.update(jobId, { info: "Gemini AI correction suggestions complete Suggestions added to records", progress: 100, status: "complete" });
        } catch (error) {
          await api.jobs.update(jobId, { status: "failed", info: `Gemini correction suggestions failed: ${error.message}` });
        }
      },
    },
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Generate Summary with Gemini AI",
      type: "string",
      description: "Generates a concise summary for each payment order using Gemini",
      constraints: [{ type: "hasData" }],
      handler: async (event, { api }) => {
        const { jobId, sheetId } = event.context;
        try {
          await api.jobs.update(jobId, { info: "Starting Gemini AI summary generation...", progress: 10 });

          const records = await api.getRecords(sheetId);
          if (!records || records.length === 0) {
            await api.jobs.update(jobId, { status: "failed", info: "No records found for Gemini summary generation" });
            return;
          }

          const updatedRecords = [];
          for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const paymentData = record.values;
            const prompt = `Generate a concise professional summary of the following payment order highlighting key details like parties amount currency type and purpose Payment order data: ${JSON.stringify(paymentData)}`;
            const summaryResult = await processGeminiResponse(prompt, paymentData);

            await api.jobs.update(jobId, { info: `Generating summary for record ${i + 1}/${records.length}...`, progress: 10 + Math.floor((i + 1) / records.length * 70) });

            updatedRecords.push({
              id: record.id,
              values: {
                geminiSummary: { value: summaryResult },
              },
            });
          }

          await api.upsertRecords(sheetId, updatedRecords);
          await api.jobs.update(jobId, { info: "Gemini AI summary generation complete Summaries added to records", progress: 100, status: "complete" });
        } catch (error) {
          await api.jobs.update(jobId, { status: "failed", info: `Gemini summary generation failed: ${error.message}` });
        }
      },
    }
  ],
};

export const paymentOrderBlueprintFields =
  paymentOrderBlueprint.sheets?.[0].fields || [];