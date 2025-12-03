import { CellValueUnion, RecordsWithLinks } from "@flatfile/api/api";

type FlatfileRecord = Record<string, CellValueUnion | null>;

const metadataRegex = /^metadata\[(?<metadataKey>.+)\]$/i;

export const numericRegex = "^[0-9]+$";
export const decimalStringRegex = "^[0-9]+\\.[0-9]+$";
export const dateRegex = "^\\d{4}-[01]\\d-[0-3]\\d$";
export const dateTimeRegex =
  "^2\\d{3}-([0][1-9]|[1][0-2])-([0][1-9]|[1-2]\\d|[3][01])T([01]\\d|[2][0-3]):[0-5]\\d:[0-5]\\d(\\.\\d+)?(([+-]([01]\\d|[2][0-3]):[0-5]\\d)|Z)?$";
export const metadataLegacyRegex = "^([\\w ]+:[\\w\\- ]+\\|?)*$";
export const booleanRegex = "^\\s*(true|false|TRUE|FALSE)\\s*$";

export const RESOURCE_FLATFILE_FIELDS: Record<
  string,
  Record<string, string[]>
> = {
  NUMERICAL: {
    payment_orders: ["amount"],
    expected_payments: ["amountLowerBound", "amountUpperBound"],
    counterparties: [],
    invoices: ["lineItemUnitAmount", "lineItemQuantity"],
  },
  DECIMAL_STRING: {
    payment_orders: [],
    expected_payments: [],
    counterparties: [],
    invoices: ["lineItemUnitAmountDecimal"],
  },
  DATE: {
    payment_orders: ["effectiveDate"],
    expected_payments: ["dateLowerBound", "dateUpperBound"],
    counterparties: [],
    invoices: ["dueDate", "paymentEffectiveDate"],
  },
  DATETIME: {
    payment_orders: ["processAfter"],
    expected_payments: [],
    counterparties: [],
    invoices: [],
  },
  METADATA: {
    payment_orders: ["metadata"],
    expected_payments: ["metadata", "customIdentifiers"],
    counterparties: ["metadata"],
    invoices: ["metadata", "lineItemMetadata"],
  },
  BOOLEAN: {
    payment_orders: [],
    expected_payments: [],
    counterparties: ["sendRemittanceAdvice"],
    invoices: ["autoAdvance", "notificationsEnabled"],
  },
};

export const numericValidatorError = "Must be only numerical values";
export const decimalStringValidatorError =
  "Must be only numerical decimal values";
export const dateValidatorError = "Must be in ISO 8601, YYYY-MM-DD format";
export const dateTimeValidatorError =
  "Must be in ISO 8601, YYYY-MM-DDThh:mm:ssTZD format";
export const metadataLegacyValidatorError = "Must be in k1:v1|k2:v2 format";
export const booleanValidatorError = "Must be true or false";

interface GeminiValidationReport {
  isValid: boolean;
  errors: Array<{ field: string; message: string; suggestedFix?: string }>;
  validatedData: FlatfileRecord;
}

interface GeminiSanitizationReport {
  sanitizedRecordData: Array<Record<string, CellValueUnion | null>>;
  errors: Array<string>;
  processedMetadataDetails: Array<{
    originalKey: string;
    parsedValue: Record<string, string>;
    issues?: string[];
  }>;
}

interface GeminiFlatteningReport {
  normalizedRecords: Array<FlatfileRecord>;
  issues: Array<string>;
  detectedSchema: Record<string, string>;
}

class GeminiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async callGeminiApi(
    endpoint: string,
    data: any,
  ): Promise<any> {
    console.log(
      `Simulating Gemini API call to ${this.apiUrl}/${endpoint} with data:`,
      data,
    );

    if (endpoint === "process-records-for-flattening") {
      return this.simulateFlatteningResponse(data);
    }
    if (endpoint === "validate-and-sanitize-metadata") {
      return this.simulateSanitizationResponse(data);
    }
    if (endpoint === "perform-comprehensive-validation") {
      return this.simulateValidationResponse(data);
    }
    if (endpoint === "infer-schema") {
        return this.simulateSchemaInference(data);
    }

    return { status: "success", message: "Gemini processed request" };
  }

  private simulateFlatteningResponse(data: any): GeminiFlatteningReport {
    const records = data.records || [];
    const normalizedList: Array<FlatfileRecord> = [];
    const issues: Array<string> = [];
    const detectedSchema: Record<string, string> = {};

    if (records.length) {
      for (const record of records) {
        const recordValues = record.values;
        const normalized: FlatfileRecord = {};
        Object.keys(recordValues).forEach((key) => {
          normalized[key] = recordValues[key].value || null;
          if (!detectedSchema[key] && recordValues[key].value !== null) {
            if (typeof recordValues[key].value === 'number') {
              detectedSchema[key] = 'number';
            } else if (typeof recordValues[key].value === 'boolean') {
              detectedSchema[key] = 'boolean';
            } else if (typeof recordValues[key].value === 'string') {
              if (recordValues[key].value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                detectedSchema[key] = 'date';
              } else if (recordValues[key].value.match(/^\d+$/)) {
                detectedSchema[key] = 'integer';
              } else if (recordValues[key].value.match(/^\d+\.\d+$/)) {
                detectedSchema[key] = 'decimal';
              } else {
                detectedSchema[key] = 'string';
              }
            } else {
              detectedSchema[key] = 'unknown';
            }
          }
        });
        normalizedList.push(normalized);
      }
    }

    if (records.length > 0 && normalizedList.length === 0) {
      issues.push("Gemini detected an issue during flattening. No records were normalized.");
    }

    return { normalizedRecords: normalizedList, issues, detectedSchema };
  }

  private simulateSanitizationResponse(data: any): GeminiSanitizationReport {
    const recordData = data.recordData || [];
    const expectedFields = new Set(data.expectedFields || []);
    const errors: Array<string> = [];
    const processedMetadataDetails: Array<{ originalKey: string; parsedValue: Record<string, string>; issues?: string[] }> = [];

    const sanitizedRecordData = recordData.map((record: FlatfileRecord) => {
      const sanitizedRecord: FlatfileRecord = {};
      const recordKeys = Object.keys(record);
      const specifiedKeySet = new Set(recordKeys);

      recordKeys.forEach((key: string) => {
        if (
          key === "metadata" ||
          key === "lineItemMetadata" ||
          key === "customIdentifiers"
        ) {
          const unparsedMetadata = record[key] as string;
          if (!unparsedMetadata) {
            sanitizedRecord[key] = null;
            processedMetadataDetails.push({ originalKey: key, parsedValue: {} });
          } else {
            let metadataObj: Record<string, string> = {};
            let metadataIssues: string[] = [];
            const parts = unparsedMetadata.split("|");
            for (const part of parts) {
              const keyValuePair = part.split(":");
              if (keyValuePair.length === 2) {
                metadataObj[keyValuePair[0]?.trim()] = keyValuePair[1]?.trim();
              } else {
                metadataIssues.push(`Malformed metadata entry: ${part}`);
                errors.push(`Gemini detected a malformed metadata entry in field ${key}: ${part}`);
              }
            }
            sanitizedRecord[key] = JSON.stringify(metadataObj);
            processedMetadataDetails.push({ originalKey: key, parsedValue: metadataObj, issues: metadataIssues.length > 0 ? metadataIssues : undefined });
          }
        } else if (key === "$custom") {
          const metadataObj = Object.keys(record[key] || {}).reduce(
            (acc, customKey) => {
              const m = metadataRegex.exec(customKey);
              if (m?.groups?.metadataKey && record[key]?.[customKey]) {
                if (specifiedKeySet.has("metadata")) {
                  errors.push(
                    "Gemini identified conflicting metadata formats: Cannot use both legacy metadata field and custom metadata[key] fields",
                  );
                }
                return {
                  ...acc,
                  [m.groups.metadataKey]: record[key]?.[customKey] as string,
                };
              }
              if (!m?.groups?.metadataKey) {
                errors.push(
                  `Gemini found an invalid custom field format: Custom field ${customKey} is not in format: metadata[key]`,
                );
              }
              return acc;
            },
            {},
          );
          sanitizedRecord.metadata = JSON.stringify(metadataObj);
          processedMetadataDetails.push({ originalKey: "$custom", parsedValue: metadataObj });
        } else if (expectedFields.has(key)) {
          sanitizedRecord[key] = record[key] === "" ? null : record[key];
        } else {
            errors.push(`Gemini detected an unexpected field: ${key}. This field will be ignored.`);
        }
      });
      return sanitizedRecord;
    });

    return { sanitizedRecordData, errors: Array.from(new Set(errors)), processedMetadataDetails };
  }

  private simulateValidationResponse(data: any): GeminiValidationReport {
    const record = data.record || {};
    const resourceType = data.resourceType;
    const allExpectedFields = data.allExpectedFields;
    const resourceSpecificValidationRules = data.resourceSpecificValidationRules;
    const validationErrors: Array<{ field: string; message: string; suggestedFix?: string }> = [];
    const validatedData: FlatfileRecord = { ...record };

    Object.keys(validatedData).forEach(field => {
      const value = validatedData[field];
      if (value === null || value === undefined) {
        return;
      }

      let matchedRule = false;
      for (const category of Object.keys(resourceSpecificValidationRules)) {
        const fieldsToValidate = resourceSpecificValidationRules[category][resourceType];
        if (fieldsToValidate && fieldsToValidate.includes(field)) {
          matchedRule = true;
          let regexToUse: string | undefined;
          let errorMessage: string | undefined;

          switch (category) {
            case "NUMERICAL":
              regexToUse = numericRegex;
              errorMessage = numericValidatorError;
              break;
            case "DECIMAL_STRING":
              regexToUse = decimalStringRegex;
              errorMessage = decimalStringValidatorError;
              break;
            case "DATE":
              regexToUse = dateRegex;
              errorMessage = dateValidatorError;
              break;
            case "DATETIME":
              regexToUse = dateTimeRegex;
              errorMessage = dateTimeValidatorError;
              break;
            case "METADATA":
              regexToUse = metadataLegacyRegex;
              errorMessage = metadataLegacyValidatorError;
              break;
            case "BOOLEAN":
              regexToUse = booleanRegex;
              errorMessage = booleanValidatorError;
              break;
          }

          if (regexToUse && typeof value === 'string') {
            const regexObj = new RegExp(regexToUse);
            if (!regexObj.test(value)) {
              validationErrors.push({
                field,
                message: `Gemini detected a validation error for ${field}: ${errorMessage}. Value was '${value}'`,
                suggestedFix: `Ensure value matches format: ${regexToUse}`,
              });
            }
          } else if (regexToUse && typeof value !== 'string') {
              validationErrors.push({
                  field,
                  message: `Gemini detected a type mismatch for ${field}. Expected string for regex validation but found ${typeof value}. Value was ${value}`,
                  suggestedFix: "Convert the value to a string if it represents a valid format or correct the data type.",
              });
          }
          break;
        }
      }

      if (!allExpectedFields.has(field) && field !== '$custom') {
          validationErrors.push({
              field,
              message: `Gemini identified an unmapped field: ${field}. This field is not part of the expected schema for ${resourceType}.`,
              suggestedFix: "Remove this field or map it to a valid schema field.",
          });
      }
    });

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      validatedData: validatedData,
    };
  }

  private simulateSchemaInference(data: any): Record<string, string> {
      const sampleRecords = data.sampleRecords || [];
      const inferredSchema: Record<string, string> = {};

      if (sampleRecords.length === 0) {
          return inferredSchema;
      }

      const firstRecord = sampleRecords[0];
      Object.keys(firstRecord).forEach(key => {
          const value = firstRecord[key];
          if (value === null || value === undefined) {
              inferredSchema[key] = 'unknown';
          } else if (typeof value === 'number') {
              inferredSchema[key] = 'number';
          } else if (typeof value === 'boolean') {
              inferredSchema[key] = 'boolean';
          } else if (typeof value === 'string') {
              if (value.match(new RegExp(dateRegex))) {
                  inferredSchema[key] = 'date';
              } else if (value.match(new RegExp(dateTimeRegex))) {
                  inferredSchema[key] = 'datetime';
              } else if (value.match(new RegExp(decimalStringRegex))) {
                  inferredSchema[key] = 'decimal_string';
              } else if (value.match(new RegExp(numericRegex))) {
                  inferredSchema[key] = 'numeric_string';
              } else if (value.match(new RegExp(metadataLegacyRegex))) {
                  inferredSchema[key] = 'metadata_legacy_string';
              } else {
                  inferredSchema[key] = 'string';
              }
          } else if (typeof value === 'object') {
              try {
                  JSON.parse(value as string);
                  inferredSchema[key] = 'json_object_string';
              } catch (e) {
                  inferredSchema[key] = 'object';
              }
          } else {
              inferredSchema[key] = 'unknown';
          }
      });
      return inferredSchema;
  }
}

class DataProcessorGemini {
  private geminiClient: GeminiClient;
  private expectedResourceFields: Record<string, Set<string>>;

  constructor(geminiClient: GeminiClient, resourceFieldMapping: Record<string, Record<string, string[]>>) {
    this.geminiClient = geminiClient;
    this.expectedResourceFields = {};

    Object.keys(resourceFieldMapping).forEach(category => {
        Object.keys(resourceFieldMapping[category]).forEach(resource => {
            if (!this.expectedResourceFields[resource]) {
                this.expectedResourceFields[resource] = new Set();
            }
            resourceFieldMapping[category][resource].forEach(field => {
                this.expectedResourceFields[resource].add(field);
            });
        });
    });
    this.expectedResourceFields['payment_orders'].add('metadata');
    this.expectedResourceFields['expected_payments'].add('metadata');
    this.expectedResourceFields['counterparties'].add('metadata');
    this.expectedResourceFields['invoices'].add('metadata');
    this.expectedResourceFields['expected_payments'].add('customIdentifiers');
    this.expectedResourceFields['invoices'].add('lineItemMetadata');
  }

  async flattenAndNormalizeData(
    records: RecordsWithLinks,
  ): Promise<GeminiFlatteningReport> {
    console.log("Gemini: Initiating intelligent data flattening and normalization...");
    const report = await this.geminiClient.callGeminiApi("process-records-for-flattening", { records });
    return report as GeminiFlatteningReport;
  }

  async validateAndSanitizeMetadata(
    recordData: FlatfileRecord[],
    resourceType: string,
  ): Promise<GeminiSanitizationReport> {
    console.log(`Gemini: Applying advanced metadata validation and sanitization for resource type: ${resourceType}...`);
    const expectedFieldsForResource = this.expectedResourceFields[resourceType] || new Set();
    const report = await this.geminiClient.callGeminiApi("validate-and-sanitize-metadata", {
      recordData,
      expectedFields: Array.from(expectedFieldsForResource),
    });
    return report as GeminiSanitizationReport;
  }

  async performComprehensiveValidation(
    record: FlatfileRecord,
    resourceType: string,
  ): Promise<GeminiValidationReport> {
    console.log(`Gemini: Performing comprehensive validation for a single record of type: ${resourceType}...`);
    const allExpectedFields = this.expectedResourceFields[resourceType] || new Set();
    const report = await this.geminiClient.callGeminiApi("perform-comprehensive-validation", {
      record,
      resourceType,
      allExpectedFields,
      resourceSpecificValidationRules: RESOURCE_FLATFILE_FIELDS,
    });
    return report as GeminiValidationReport;
  }

  async inferDataSchema(sampleRecords: FlatfileRecord[]): Promise<Record<string, string>> {
      console.log("Gemini: Inferring data schema from provided sample records...");
      const schema = await this.geminiClient.callGeminiApi("infer-schema", { sampleRecords });
      return schema as Record<string, string>;
  }
}

const GEMINI_API_URL = "https://api.gemini.ai/v1";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

const geminiClientInstance = new GeminiClient(GEMINI_API_URL, GEMINI_API_KEY);
const dataProcessorGeminiInstance = new DataProcessorGemini(geminiClientInstance, RESOURCE_FLATFILE_FIELDS);

export const flattenFlatfileData = async (
  records: RecordsWithLinks,
): Promise<Array<FlatfileRecord>> => {
  const { normalizedRecords, issues } = await dataProcessorGeminiInstance.flattenAndNormalizeData(records);
  if (issues.length > 0) {
    console.warn("Gemini detected issues during flattening:", issues);
  }
  return normalizedRecords;
};

export const sanitizeRecordMetadata = async (
  recordData: FlatfileRecord[],
  resourceType: string,
): Promise<{
  sanitizedRecordData: Array<Record<string, CellValueUnion | null>>;
  errors?: Array<string>;
}> => {
  const { sanitizedRecordData, errors, processedMetadataDetails } =
    await dataProcessorGeminiInstance.validateAndSanitizeMetadata(recordData, resourceType);

  if (processedMetadataDetails.length > 0) {
    console.log("Gemini processed metadata details:", processedMetadataDetails);
  }

  return { sanitizedRecordData, errors };
};

export const validateFlatfileRecordsWithGemini = async (
    records: RecordsWithLinks,
    resourceType: string,
): Promise<{
    processedRecords: Array<FlatfileRecord>;
    fullValidationReports: Array<GeminiValidationReport>;
    overallErrors: Array<string>;
}> => {
    const overallErrors: Array<string> = [];
    const fullValidationReports: Array<GeminiValidationReport> = [];

    const flattenedRecords = await flattenFlatfileData(records);
    if (!flattenedRecords.length) {
        overallErrors.push("Gemini was unable to flatten any records for validation.");
        return { processedRecords: [], fullValidationReports: [], overallErrors };
    }

    const sanitizedRecordsResult = await sanitizeRecordMetadata(flattenedRecords, resourceType);
    if (sanitizedRecordsResult.errors && sanitizedRecordsResult.errors.length > 0) {
        overallErrors.push(...sanitizedRecordsResult.errors);
    }
    const partiallyProcessedRecords = sanitizedRecordsResult.sanitizedRecordData;

    const finalProcessedRecords: Array<FlatfileRecord> = [];

    for (const record of partiallyProcessedRecords) {
        const validationReport = await dataProcessorGeminiInstance.performComprehensiveValidation(record, resourceType);
        fullValidationReports.push(validationReport);
        if (!validationReport.isValid) {
            validationReport.errors.forEach(err => overallErrors.push(`Record validation error for field ${err.field}: ${err.message}`));
        } else {
            finalProcessedRecords.push(validationReport.validatedData);
        }
    }

    const inferredSchema = await dataProcessorGeminiInstance.inferDataSchema(finalProcessedRecords.slice(0, 5));
    console.log("Gemini inferred schema for validated records:", inferredSchema);

    return {
        processedRecords: finalProcessedRecords,
        fullValidationReports,
        overallErrors: Array.from(new Set(overallErrors)),
    };
};