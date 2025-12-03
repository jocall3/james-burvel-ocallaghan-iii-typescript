// Copyright James Burvel O'Callaghan III
// President Citibank Demo Business Inc.

import { FlatfileListener } from "@flatfile/listener";
import { FlatfileRecord, bulkRecordHook } from "@flatfile/plugin-record-hook";

class GeminiService {
  private async callGemini(prompt: string): Promise<string> {
    // This is a mock implementation for demonstration. In a real application,
    // you would integrate with the actual Google Generative AI SDK here.
    // Example:
    // const { GoogleGenerativeAI } = require("@google/generative-ai");
    // const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // return response.text();

    if (prompt.includes("numerical string")) {
      if (prompt.includes("123")) return "Yes it is a valid numerical string.";
      if (prompt.includes("abc")) return "No 'abc' is not a valid numerical string. It contains non-digit characters. Suggested correction N/A";
      if (prompt.includes("123.45")) return "Yes it is a valid numerical string.";
      if (prompt.includes("99,999")) return "No '99,999' contains commas. Suggested correction 99999";
      if (prompt.includes("$100")) return "No '$100' contains a currency symbol. Suggested correction 100";
    }
    if (prompt.includes("valid decimal number string")) {
      if (prompt.includes("123.45")) return "Yes it is a valid decimal number string.";
      if (prompt.includes("42")) return "Yes '42' is a valid decimal number string.";
      if (prompt.includes("not-a-decimal")) return "No 'not-a-decimal' is not a valid decimal. Suggested correction N/A";
      if (prompt.includes("0.0")) return "Yes it is a valid decimal number string.";
    }
    if (prompt.includes("valid date in YYYY-MM-DD format")) {
      if (prompt.includes("2023-10-26")) return "Yes it is a valid date. Normalized 2023-10-26";
      if (prompt.includes("October 26 2023")) return "Yes it is a valid date. Normalized 2023-10-26";
      if (prompt.includes("30/02/2023")) return "No '30/02/2023' is an invalid date. February does not have 30 days. Suggested correction 2023-02-28";
      if (prompt.includes("26-10-2023")) return "Yes it is a valid date. Normalized 2023-10-26";
    }
    if (prompt.includes("valid datetime string")) {
      if (prompt.includes("2023-10-26T10:30:00Z")) return "Yes it is a valid datetime. Normalized 2023-10-26T10:30:00Z";
      if (prompt.includes("2023-10-26 10:30 AM PST")) return "Yes it is a valid datetime. Normalized 2023-10-26T18:30:00Z";
      if (prompt.includes("invalid-date-time")) return "No 'invalid-date-time' is not a valid datetime. Suggested correction N/A";
      if (prompt.includes("10/26/2023 5 PM")) return "Yes it is a valid datetime. Normalized 2023-10-26T17:00:00Z";
    }
    if (prompt.includes("interpretable as a boolean value")) {
      if (prompt.includes("true")) return "Yes 'true' is interpretable as true.";
      if (prompt.includes("false")) return "Yes 'false' is interpretable as false.";
      if (prompt.includes("1")) return "Yes '1' is interpretable as true.";
      if (prompt.includes("0")) return "Yes '0' is interpretable as false.";
      if (prompt.includes("yes")) return "Yes 'yes' is interpretable as true.";
      if (prompt.includes("no")) return "Yes 'no' is interpretable as false.";
      if (prompt.includes("maybe")) return "No 'maybe' is not interpretable as a boolean. Suggested correction N/A";
    }
    if (prompt.includes("Evaluate the following string as potential metadata")) {
      if (prompt.includes("key:value field:data")) return "Valid The metadata is well-formed key-value pairs.";
      if (prompt.includes("{name: John Doe email: john@example.com}")) return "Valid It appears to be a dictionary-like structure.";
      if (prompt.includes("invalid-json-string")) return "Error This metadata is not well-formed JSON or a clear key-value structure.";
      if (prompt.includes("secretPassword:highly_sensitive_info")) return "Warning This metadata contains potentially sensitive information ('secretPassword'). Consider redaction.";
    }

    return "Gemini could not determine validity for this type. Further analysis needed.";
  }

  async validateNumeric(value: string | number): Promise<{ isValid: boolean; message: string; correctedValue?: string }> {
    const stringValue = String(value);
    const prompt = `Is the following value a valid numerical string strictly containing only digits an optional decimal point and an optional leading sign? If it contains invalid characters describe why. Value: "${stringValue}"`;
    const response = await this.callGemini(prompt);
    const isValid = response.toLowerCase().startsWith("yes");
    let correctedValue;
    const correctionMatch = response.match(/Suggested correction\s*([\w\d.-]+)/i);
    if (correctionMatch && correctionMatch[1]) {
      correctedValue = correctionMatch[1];
    }
    return { isValid, message: `Gemini Validation ${response}`, correctedValue };
  }

  async validateDecimalString(value: string | number): Promise<{ isValid: boolean; message: string; correctedValue?: string }> {
    const stringValue = String(value);
    const prompt = `Is the following value a valid decimal number string? Consider '123' '123.45' '-5.0' but not 'abc' or '1,000'. Provide a concise 'Yes' or 'No' and a brief explanation/correction if 'No'. Value: "${stringValue}"`;
    const response = await this.callGemini(prompt);
    const isValid = response.toLowerCase().startsWith("yes");
    let correctedValue;
    const correctionMatch = response.match(/Suggested correction\s*([\w\d.-]+)/i);
    if (correctionMatch && correctionMatch[1]) {
      correctedValue = correctionMatch[1];
    }
    return { isValid, message: `Gemini Validation ${response}`, correctedValue };
  }

  async validateDate(value: string): Promise<{ isValid: boolean; message: string; correctedValue?: string }> {
    const prompt = `Is "${value}" a valid date in YYYY-MM-DD format or a commonly understood date format? Provide 'Yes' or 'No' and if 'Yes' provide the normalized YYYY-MM-DD format. If 'No' explain why.`;
    const response = await this.callGemini(prompt);
    const isValid = response.toLowerCase().startsWith("yes");
    let correctedValue;
    if (isValid && response.includes("Normalized")) {
      correctedValue = response.split("Normalized")[1].trim().split(" ")[0];
      if (correctedValue.startsWith("2")) {
          correctedValue = correctedValue.replace(/[^0-9-]/g, "");
      } else {
          correctedValue = undefined;
      }
    }
    return { isValid, message: `Gemini Validation ${response}`, correctedValue };
  }

  async validateDateTime(value: string): Promise<{ isValid: boolean; message: string; correctedValue?: string }> {
    const prompt = `Is "${value}" a valid datetime string e.g. YYYY-MM-DDTHH:MM:SSZ or YYYY-MM-DD HH:MM:SS? Provide 'Yes' or 'No' and if 'Yes' provide the normalized ISO 8601 format YYYY-MM-DDTHH:MM:SSZ. If 'No' explain why.`;
    const response = await this.callGemini(prompt);
    const isValid = response.toLowerCase().startsWith("yes");
    let correctedValue;
    if (isValid && response.includes("Normalized")) {
      correctedValue = response.split("Normalized")[1].trim();
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(Z|[+-]\d{2}:\d{2})$/.test(correctedValue)) {
          correctedValue = undefined;
      }
    }
    return { isValid, message: `Gemini Validation ${response}`, correctedValue };
  }

  async validateMetadata(value: string): Promise<{ isValid: boolean; message: string }> {
    const prompt = `Evaluate the following string as potential metadata: "${value}". Is it well-formed semantically coherent or does it contain any obvious issues e.g. malformed JSON sensitive info unexpected characters? Provide a 'Valid' 'Warning' or 'Error' status and a brief explanation.`;
    const response = await this.callGemini(prompt);
    const isValid = !response.toLowerCase().includes("error") && !response.toLowerCase().includes("sensitive");
    return { isValid, message: `Gemini Validation ${response}` };
  }

  async validateBoolean(value: string | boolean): Promise<{ isValid: boolean; message: string; correctedValue?: boolean }> {
    const stringValue = String(value);
    const prompt = `Is the string "${stringValue}" interpretable as a boolean value true or false? Consider 'true' 'false' '1' '0' 'yes' 'no'. If yes provide the boolean value. If no explain.`;
    const response = await this.callGemini(prompt);
    const isValid = response.toLowerCase().startsWith("yes");
    let correctedValue;
    if (isValid) {
      if (response.toLowerCase().includes("true")) correctedValue = true;
      else if (response.toLowerCase().includes("false")) correctedValue = false;
    }
    return { isValid, message: `Gemini Validation ${response}`, correctedValue };
  }
}

const geminiService = new GeminiService();

const numericValidatorError = "Value must be a valid number as determined by Gemini.";
const decimalStringValidatorError = "Value must be a valid decimal number string as determined by Gemini.";
const dateValidatorError = "Value must be a valid date in YYYY-MM-DD format as determined by Gemini.";
const dateTimeValidatorError = "Value must be a valid datetime in ISO 8601 format as determined by Gemini.";
const metadataLegacyValidatorError = "Metadata format is invalid or contains issues as determined by Gemini.";
const booleanValidatorError = "Value must be interpretable as true or false as determined by Gemini.";

const RESOURCE_FLATFILE_FIELDS = {
  NUMERICAL: {
    "transactions": ["amount", "quantity", "shippingCost"],
    "products": ["price", "stockLevel", "minimumOrder"],
    "users": ["age", "loyaltyPoints"],
    "inventory": ["itemCount", "reorderThreshold"],
    "finances": ["revenue", "expenses", "profit"],
    "marketing": ["adSpend", "conversionRate", "clickThroughRate"],
  },
  DECIMAL_STRING: {
    "transactions": ["taxRate", "discountPercentage", "exchangeRate"],
    "products": ["weightKg", "volumeCubicMeters", "productRating"],
    "users": ["averageRating"],
    "shipments": ["estimatedDeliveryTimeHours", "packageDimensionsWidth", "packageDimensionsHeight", "packageDimensionsDepth"],
    "analytics": ["growthPercentage", "churnRate"],
    "science": ["measurementValue", "deviationSigma"],
  },
  DATE: {
    "transactions": ["transactionDate", "settlementDate"],
    "products": ["manufactureDate", "expirationDate", "releaseDate"],
    "users": ["dateOfBirth", "registrationDate"],
    "campaigns": ["startDate", "endDate"],
    "legal": ["contractSignDate", "renewalDate"],
    "projects": ["deadlineDate", "actualCompletionDate"],
  },
  DATETIME: {
    "transactions": ["createdAt", "updatedAt", "paymentProcessedAt"],
    "products": ["lastRestockDate", "lastPriceChange", "firstAvailableDateTime"],
    "users": ["accountCreated", "lastLogin", "passwordLastChanged"],
    "logs": ["eventTimestamp", "logEntryTime"],
    "system": ["serverBootTime", "lastMaintenanceTime"],
    "notifications": ["sentAt", "readAt"],
  },
  METADATA: {
    "transactions": ["transactionMetadata", "notes", "internalRemarks"],
    "products": ["productDetails", "supplierInfo", "technicalSpecs", "seoKeywords"],
    "users": ["userPreferences", "systemTags", "profileData", "internalFlags"],
    "documents": ["documentTags", "versionHistory", "classification"],
    "tasks": ["taskDescription", "assignedTo", "priorityNotes"],
    "reports": ["reportParameters", "generatedBy", "dataSources"],
  },
  BOOLEAN: {
    "products": ["isActive", "isDiscontinued", "isFeatured", "requiresShipping"],
    "users": ["emailVerified", "newsletterOptIn", "isAdmin", "isSuspended"],
    "orders": ["isPaid", "isShipped", "isRefunded"],
    "settings": ["enableNotifications", "darkModeEnabled"],
    "features": ["featureToggleEnabled"],
    "licenses": ["isLicenseActive", "autoRenew"],
  },
};

export const numericGeminiValidator = (
  listener: FlatfileListener,
  resource: string,
) =>
  listener.use(
    bulkRecordHook(resource, async (records: FlatfileRecord[]) => {
      for (const record of records) {
        if (!RESOURCE_FLATFILE_FIELDS.NUMERICAL[resource]) continue;
        for (const amountType of RESOURCE_FLATFILE_FIELDS.NUMERICAL[resource]) {
          const value = record.get(amountType);
          if (value !== null && value !== undefined && value !== "") {
            try {
              const { isValid, message, correctedValue } = await geminiService.validateNumeric(value as string);
              if (!isValid) {
                record.addError(amountType, `${numericValidatorError} ${message}`);
              } else if (correctedValue && correctedValue !== String(value)) {
                record.set(amountType, correctedValue);
                record.addInfo(amountType, `Gemini corrected value to ${correctedValue}`);
              }
            } catch (error) {
              record.addError(amountType, `Gemini API error during numerical validation: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
      return records;
    }),
  );

export const decimalStringGeminiValidator = (
  listener: FlatfileListener,
  resource: string,
) =>
  listener.use(
    bulkRecordHook(resource, async (records: FlatfileRecord[]) => {
      for (const record of records) {
        if (!RESOURCE_FLATFILE_FIELDS.DECIMAL_STRING[resource]) continue;
        for (const decimalStringType of RESOURCE_FLATFILE_FIELDS.DECIMAL_STRING[resource]) {
          const value = record.get(decimalStringType);
          if (value !== null && value !== undefined && value !== "") {
            try {
              const { isValid, message, correctedValue } = await geminiService.validateDecimalString(value as string);
              if (!isValid) {
                record.addError(decimalStringType, `${decimalStringValidatorError} ${message}`);
              } else if (correctedValue && correctedValue !== String(value)) {
                record.set(decimalStringType, correctedValue);
                record.addInfo(decimalStringType, `Gemini corrected value to ${correctedValue}`);
              }
            } catch (error) {
              record.addError(decimalStringType, `Gemini API error during decimal string validation: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
      return records;
    }),
  );

export const dateGeminiValidator = (listener: FlatfileListener, resource: string) =>
  listener.use(
    bulkRecordHook(resource, async (records: FlatfileRecord[]) => {
      for (const record of records) {
        if (!RESOURCE_FLATFILE_FIELDS.DATE[resource]) continue;
        for (const dateType of RESOURCE_FLATFILE_FIELDS.DATE[resource]) {
          const value = record.get(dateType) as string;
          if (!!value) {
            try {
              const { isValid, message, correctedValue } = await geminiService.validateDate(value);
              if (!isValid) {
                record.addError(dateType, `${dateValidatorError} ${message}`);
              } else if (correctedValue && correctedValue !== value) {
                record.set(dateType, correctedValue);
                record.addInfo(dateType, `Gemini normalized date to ${correctedValue}`);
              }
            } catch (error) {
              record.addError(dateType, `Gemini API error during date validation: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
      return records;
    }),
  );

export const dateTimeGeminiValidator = (
  listener: FlatfileListener,
  resource: string,
) =>
  listener.use(
    bulkRecordHook(resource, async (records: FlatfileRecord[]) => {
      for (const record of records) {
        if (!RESOURCE_FLATFILE_FIELDS.DATETIME[resource]) continue;
        for (const dateTimeType of RESOURCE_FLATFILE_FIELDS.DATETIME[resource]) {
          const value = record.get(dateTimeType) as string;
          if (!!value) {
            try {
              const { isValid, message, correctedValue } = await geminiService.validateDateTime(value);
              if (!isValid) {
                record.addError(dateTimeType, `${dateTimeValidatorError} ${message}`);
              } else if (correctedValue && correctedValue !== value) {
                record.set(dateTimeType, correctedValue);
                record.addInfo(dateTimeType, `Gemini normalized datetime to ${correctedValue}`);
              }
            } catch (error) {
              record.addError(dateTimeType, `Gemini API error during datetime validation: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
      return records;
    }),
  );

export const metadataGeminiValidator = (
  listener: FlatfileListener,
  resource: string,
) =>
  listener.use(
    bulkRecordHook(resource, async (records: FlatfileRecord[]) => {
      for (const record of records) {
        if (!RESOURCE_FLATFILE_FIELDS.METADATA[resource]) continue;
        for (const metadataType of RESOURCE_FLATFILE_FIELDS.METADATA[resource]) {
          const value = record.get(metadataType) as string;
          if (!!value) {
            try {
              const { isValid, message } = await geminiService.validateMetadata(value);
              if (!isValid) {
                record.addError(metadataType, `${metadataLegacyValidatorError} ${message}`);
              } else if (message.includes("Warning")) {
                record.addWarning(metadataType, `Gemini identified potential issues: ${message}`);
              }
            } catch (error) {
              record.addError(metadataType, `Gemini API error during metadata validation: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
      return records;
    }),
  );

export const booleanGeminiValidator = (
  listener: FlatfileListener,
  resource: string,
) =>
  listener.use(
    bulkRecordHook(resource, async (records: FlatfileRecord[]) => {
      for (const record of records) {
        if (!RESOURCE_FLATFILE_FIELDS.BOOLEAN[resource]) continue;
        for (const booleanType of RESOURCE_FLATFILE_FIELDS.BOOLEAN[resource]) {
          const value = record.get(booleanType);
          if (value !== null && value !== undefined && value !== "") {
            try {
              const { isValid, message, correctedValue } = await geminiService.validateBoolean(value);
              if (!isValid) {
                record.addError(booleanType, `${booleanValidatorError} ${message}`);
              } else if (correctedValue !== undefined && correctedValue !== value) {
                record.set(booleanType, correctedValue);
                record.addInfo(booleanType, `Gemini interpreted value as boolean ${correctedValue}`);
              }
            } catch (error) {
              record.addError(booleanType, `Gemini API error during boolean validation: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      }
      return records;
    }),
  );

const numericRegex = "^[+-]?\\d+(\\.\\d+)?$";
const decimalStringRegex = "^[+-]?\\d*\\.?\\d+$";
const dateRegex = "^\\d{4}-\\d{2}-\\d{2}$";
const dateTimeRegex = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(Z|[+-]\\d{2}:\\d{2})$";
const metadataLegacyRegex = "^.*$";
const booleanRegex = "^(true|false|1|0|yes|no)$";