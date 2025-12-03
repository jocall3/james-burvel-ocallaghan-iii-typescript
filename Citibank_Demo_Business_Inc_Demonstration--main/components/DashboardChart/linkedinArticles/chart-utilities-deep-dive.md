/**
 * This module implements a comprehensive, enterprise-grade analytical framework for financial data,
 * providing advanced utilities for data transformation, validation, anomaly detection, predictive forecasting,
 * and versatile export. Business value: This framework is the bedrock for agile, data-driven decision-making in finance.
 * It automates the complex journey from raw transactional data to actionable executive insights,
 * drastically reducing manual effort and human error, accelerating market response times, and ensuring regulatory compliance.
 * By unifying these critical capabilities, it enables financial institutions to unlock new revenue streams,
 * optimize capital allocation, proactively manage risk, and establish a robust, auditable foundation for
 * sustained competitive advantage. Its configurable and extensible design ensures future-proofing against evolving market
 * dynamics and analytical needs, saving millions in development and maintenance costs while delivering unparalleled
 * strategic clarity.
 */

/**
 * Helper function for deep cloning to ensure immutability in transformations.
 * @param obj The object to deep clone.
 * @returns A new, deeply cloned object.
 */
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Provides robust utilities for transforming financial datasets, enabling executives
 * to sculpt raw data into precise, actionable insights.
 * Business Value: This class dramatically enhances analytical agility, allowing financial
 * institutions to rapidly adapt to market changes, optimize capital deployment, and streamline
 * regulatory reporting. It turns complex data into strategic assets, enabling new revenue models
 * and significant operational efficiencies by automating data preparation that previously
 * required extensive manual intervention, saving millions in analyst time and improving decision velocity.
 */
export class DataTransformationUtility {
  /**
   * Filters a dataset based on specified criteria, supporting multiple field comparisons.
   * @param data The array of data items to filter.
   * @param criteria An object where keys are field names and values are the required match.
   * @returns A new array containing only items that match all criteria.
   */
  public static filter<T extends Record<string, any>>(data: T[], criteria: Partial<T>): T[] {
    return deepClone(data).filter(item =>
      Object.entries(criteria).every(([key, value]) => item[key] === value)
    );
  }

  /**
   * Sorts a dataset by a specified field in ascending or descending order.
   * @param data The array of data items to sort.
   * @param key The field name to sort by.
   * @param order The sort order ('asc' for ascending, 'desc' for descending).
   * @returns A new array with the sorted data.
   */
  public static sort<T extends Record<string, any>>(data: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return deepClone(data).sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return order === 'asc' ? valA - valB : valB - valA;
      }
      return 0; // Fallback for other types, might need more specific handling
    });
  }

  /**
   * Groups a dataset by a specified key and applies aggregation functions to each group.
   * Supports common aggregations like sum, average, min, max, count, and distinct count.
   * @param data The array of data items to group.
   * @param key The field name to group by.
   * @param aggregations An object defining aggregation functions to apply (e.g., `{ totalValue: 'sum', avgPrice: 'avg' }`).
   * @returns An array of aggregated group objects.
   * @throws {Error} If an unsupported aggregation type is provided.
   */
  public static groupBy<T extends Record<string, any>>(
    data: T[],
    key: keyof T,
    aggregations: { [newFieldName: string]: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct' | ((items: T[]) => any) }
  ): Record<string, any>[] {
    const grouped: Record<string, T[]> = deepClone(data).reduce((acc, item) => {
      const groupKey = String(item[key]);
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, T[]>);

    return Object.entries(grouped).map(([groupKeyValue, items]) => {
      const result: Record<string, any> = { [key]: groupKeyValue };

      for (const [newFieldName, aggTypeOrFn] of Object.entries(aggregations)) {
        if (typeof aggTypeOrFn === 'function') {
          result[newFieldName] = aggTypeOrFn(items);
          continue;
        }

        switch (aggTypeOrFn) {
          case 'sum':
            result[newFieldName] = items.reduce((sum, item) => sum + (typeof item[newFieldName] === 'number' ? item[newFieldName] : 0), 0);
            break;
          case 'avg':
            const sum = items.reduce((s, item) => s + (typeof item[newFieldName] === 'number' ? item[newFieldName] : 0), 0);
            result[newFieldName] = items.length > 0 ? sum / items.length : 0;
            break;
          case 'min':
            result[newFieldName] = Math.min(...items.map(item => typeof item[newFieldName] === 'number' ? item[newFieldName] : Infinity));
            break;
          case 'max':
            result[newFieldName] = Math.max(...items.map(item => typeof item[newFieldName] === 'number' ? item[newFieldName] : -Infinity));
            break;
          case 'count':
            result[newFieldName] = items.length;
            break;
          case 'distinct':
            result[newFieldName] = new Set(items.map(item => item[newFieldName])).size;
            break;
          default:
            throw new Error(`Unsupported aggregation type: ${aggTypeOrFn}`);
        }
      }
      return result;
    });
  }

  /**
   * Adds a new calculated field to each item in the dataset based on a provided calculation function.
   * This enables the derivation of critical proprietary metrics like 'risk-adjusted return' or
   * 'customer lifetime value' without altering source data.
   * @param data The array of data items.
   * @param fieldName The name of the new calculated field.
   * @param calculationFn The function to calculate the new field's value for each item.
   * @returns A new array with items including the calculated field.
   */
  public static addCalculatedField<T extends Record<string, any>>(
    data: T[],
    fieldName: string,
    calculationFn: (item: T) => any
  ): (T & Record<string, any>)[] {
    return deepClone(data).map(item => ({
      ...item,
      [fieldName]: calculationFn(item),
    }));
  }
}

/**
 * Defines the structure for a single validation rule.
 */
export interface ValidationRule {
  field: string;
  type: 'mandatory' | 'range' | 'regex' | 'enum';
  config?: {
    min?: number;
    max?: number;
    pattern?: string;
    values?: any[];
  };
  message?: string;
}

/**
 * Represents the outcome of a validation check for a specific item and field.
 */
export interface ValidationResult {
  item: Record<string, any>;
  field: string;
  isValid: boolean;
  message: string;
}

/**
 * Provides a rigorous framework for validating financial data, ensuring its integrity and accuracy.
 * Business Value: This class is absolutely imperative for maintaining the trustworthiness of financial
 * analyses, reports, and regulatory submissions. It proactively prevents erroneous data from
 * leading to catastrophic financial decisions, non-compliance, and severe reputational damage.
 * By enforcing data quality at the source, it saves millions in potential fines, operational
 * remediation costs, and lost market confidence, aligning with principles like BCBS 239.
 */
export class DataValidationUtility {
  /**
   * Validates a dataset against a set of predefined rules.
   * @param data The array of data items to validate.
   * @param rules An array of ValidationRule objects.
   * @returns An array of ValidationResult objects, indicating which items failed which rules.
   */
  public static validate<T extends Record<string, any>>(data: T[], rules: ValidationRule[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const item of deepClone(data)) {
      for (const rule of rules) {
        let isValid = true;
        let message = rule.message || `Validation failed for field '${rule.field}'`;
        const fieldValue = item[rule.field];

        switch (rule.type) {
          case 'mandatory':
            isValid = fieldValue !== undefined && fieldValue !== null && String(fieldValue).trim() !== '';
            message = isValid ? message : `Field '${rule.field}' is mandatory.`;
            break;
          case 'range':
            if (typeof fieldValue === 'number') {
              isValid = (rule.config?.min === undefined || fieldValue >= rule.config.min) &&
                        (rule.config?.max === undefined || fieldValue <= rule.config.max);
              message = isValid ? message : `Field '${rule.field}' value (${fieldValue}) is out of range [${rule.config?.min ?? '-Infinity'}, ${rule.config?.max ?? 'Infinity'}].`;
            } else {
              isValid = false;
              message = `Field '${rule.field}' is not a number for range validation.`;
            }
            break;
          case 'regex':
            if (typeof fieldValue === 'string' && rule.config?.pattern) {
              const regex = new RegExp(rule.config.pattern);
              isValid = regex.test(fieldValue);
              message = isValid ? message : `Field '${rule.field}' value (${fieldValue}) does not match required pattern '${rule.config.pattern}'.`;
            } else {
              isValid = false;
              message = `Field '${rule.field}' is not a string or pattern is missing for regex validation.`;
            }
            break;
          case 'enum':
            if (rule.config?.values) {
              isValid = rule.config.values.includes(fieldValue);
              message = isValid ? message : `Field '${rule.field}' value (${fieldValue}) is not among allowed values: [${rule.config.values.join(', ')}].`;
            } else {
              isValid = false;
              message = `Allowed values are missing for enum validation on field '${rule.field}'.`;
            }
            break;
          default:
            isValid = false;
            message = `Unsupported validation type '${rule.type}' for field '${rule.field}'.`;
        }

        if (!isValid) {
          results.push({ item: deepClone(item), field: rule.field, isValid: false, message });
        }
      }
    }
    return results;
  }
}

/**
 * Represents a detected anomaly within the dataset.
 */
export interface Anomaly {
  item: Record<string, any>;
  field: string;
  value: any;
  metric?: number; // e.g., Z-score, IQR deviation
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: string; // When the anomaly was detected
}

/**
 * Provides advanced capabilities for detecting deviations and outliers in financial data,
 * acting as an automated early warning system.
 * Business Value: This class offers critical proactive safeguarding against market volatility,
 * fraudulent activities, and operational disruptions. By enabling swift identification of
 * unusual patterns, it empowers financial institutions to move from reactive crisis management
 * to predictive vigilance, saving millions by preventing fraud, mitigating market risks,
 * and maintaining operational stability. This directly enhances the security posture and
 * resilience of the entire financial system.
 */
export class AnomalyDetectionUtility {
  /**
   * Calculates the mean of a numerical array.
   * @param values An array of numbers.
   * @returns The mean.
   */
  private static calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculates the standard deviation of a numerical array.
   * @param values An array of numbers.
   * @param mean The pre-calculated mean of the values.
   * @returns The standard deviation.
   */
  private static calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Detects anomalies in a dataset using the Z-score method.
   * Identifies data points that lie a significant number of standard deviations from the mean.
   * @param data The array of data items.
   * @param field The numerical field to check for anomalies.
   * @param threshold The Z-score threshold for anomaly detection (e.g., 2 for 2 standard deviations).
   * @param defaultSeverity The default severity for detected anomalies.
   * @returns An array of detected Anomaly objects.
   */
  public static zScoreDetect<T extends Record<string, any>>(
    data: T[],
    field: keyof T,
    threshold: number = 2.5,
    defaultSeverity: Anomaly['severity'] = 'medium'
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const numericValues: number[] = data
      .map(item => item[field])
      .filter(value => typeof value === 'number');

    if (numericValues.length < 2) { // Need at least 2 points to calculate std dev
      if (numericValues.length > 0 && numericValues.length < data.length) {
        // Log or handle cases where some values are not numeric for the given field, but others are.
      }
      return anomalies;
    }

    const mean = this.calculateMean(numericValues);
    const stdDev = this.calculateStandardDeviation(numericValues, mean);

    if (stdDev === 0) { // No variance, all numeric values are the same, no Z-score anomalies.
      return anomalies;
    }

    for (const item of deepClone(data)) {
      const value = item[field];
      if (typeof value === 'number') {
        const zScore = (value - mean) / stdDev;
        if (Math.abs(zScore) > threshold) {
          anomalies.push({
            item: deepClone(item),
            field: String(field),
            value: value,
            metric: zScore,
            message: `Anomaly detected: '${String(field)}' value (${value}) has a Z-score of ${zScore.toFixed(2)}, exceeding threshold ${threshold}.`,
            severity: defaultSeverity,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
    return anomalies;
  }
}

/**
 * Represents the results of a linear regression model.
 */
export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared?: number; // Coefficient of determination
  predict: (x: number) => number;
}

/**
 * Provides predictive modeling capabilities to forecast future trends and behaviors
 * based on historical financial data.
 * Business Value: This class transforms historical data into actionable insights about
 * future probabilities, empowering executives to make informed, forward-looking decisions
 * regarding capital allocation, stress testing, product development, and market entry strategies.
 * It moves institutions beyond historical reporting to strategic planning, enabling them to
 * anticipate market shifts and secure a significant competitive advantage worth millions.
 */
export class PredictiveForecastingUtility {
  /**
   * Performs simple linear regression on a dataset to find the best-fit line.
   * @param data An array of objects with 'x' and 'y' numerical properties.
   * @returns An object containing the slope, intercept, and a prediction function.
   * @throws {Error} If the input data is insufficient or invalid.
   */
  public static linearRegression(data: { x: number; y: number }[]): LinearRegressionResult {
    if (data.length < 2) {
      throw new Error("Linear regression requires at least two data points.");
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const point of data) {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    }

    const n = data.length;
    const denominator = (n * sumXX - sumX * sumX);

    if (denominator === 0) {
      throw new Error("Cannot perform linear regression: all x values are identical, resulting in an undefined slope.");
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    let sumOfSquaresTotal = 0; // SST
    let sumOfSquaresResidual = 0; // SSR

    const meanY = sumY / n;

    for (const point of data) {
      const predictedY = slope * point.x + intercept;
      sumOfSquaresTotal += Math.pow(point.y - meanY, 2);
      sumOfSquaresResidual += Math.pow(point.y - predictedY, 2);
    }

    const rSquared = sumOfSquaresTotal === 0 ? 1 : (1 - sumOfSquaresResidual / sumOfSquaresTotal);

    return {
      slope,
      intercept,
      rSquared: isNaN(rSquared) ? 0 : rSquared, // Handle edge case where SST is 0
      predict: (x: number) => slope * x + intercept,
    };
  }
}

/**
 * Provides versatile export functionalities to democratize analytical insights across
 * the organization and external stakeholders.
 * Business Value: This class ensures that profound analytical insights are not confined
 * to a single platform but can be seamlessly communicated, integrated, and reported.
 * It facilitates collaborative decision-making, streamlines regulatory compliance reporting,
 * and enhances transparency. By providing structured and visually rich exports, it accelerates
 * informed collaboration and solidifies trust in data-driven strategies, preventing
 * missed opportunities and costly communication gaps.
 */
export class ExportUtility {
  /**
   * Exports an array of data items to a CSV (Comma Separated Values) string.
   * @param data The array of data items to export.
   * @param headers Optional array of strings to use as CSV headers. If not provided,
   *                headers are inferred from the keys of the first data item.
   * @returns A string containing the CSV formatted data.
   * @throws {Error} If the input data is empty and headers are not provided.
   */
  public static toCSV<T extends Record<string, any>>(data: T[], headers?: string[]): string {
    if (data.length === 0 && !headers) {
      throw new Error("Cannot export empty data to CSV without explicit headers.");
    }

    const effectiveHeaders = headers || (data.length > 0 ? Object.keys(data[0]) : []);
    const csvRows: string[] = [];

    // Add header row
    csvRows.push(effectiveHeaders.map(header => this.escapeCSV(header)).join(','));

    // Add data rows
    for (const item of data) {
      const row = effectiveHeaders.map(header => {
        const value = item[header];
        return this.escapeCSV(value === null || value === undefined ? '' : String(value));
      }).join(',');
      csvRows.push(row);
    }

    return csvRows.join('\n');
  }

  /**
   * Escapes a string for CSV format by enclosing it in double quotes if it contains
   * commas, double quotes, or newlines, and doubling internal double quotes.
   * @param value The string value to escape.
   * @returns The escaped string.
   */
  private static escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Placeholder for exporting data as a PNG image.
   * Note: Generating PNGs in a Node.js environment typically requires external libraries
   * (e.g., `canvas` for server-side rendering or browser APIs for client-side).
   * As per project constraints, external dependencies are avoided. This method serves
   * as an interface definition, illustrating where such functionality would integrate.
   * For a real implementation, consider a dedicated microservice or a client-side library.
   * Business Value: Enables visual communication of complex insights in executive presentations
   * and reports, enhancing clarity and impact.
   * @param data The data (e.g., chart configuration) to render.
   * @param options Rendering options.
   * @returns A promise resolving to a Base64 encoded string of the PNG image.
   */
  public static async toPNG(data: any, options?: any): Promise<string> {
    console.warn("ExportUtility.toPNG: This is a conceptual stub. Real PNG export requires external rendering libraries or browser APIs.");
    return Promise.resolve(`data:image/png;base64,ConceptualPNGOutputForData:${JSON.stringify(data)}`);
  }

  /**
   * Placeholder for exporting data as an SVG image.
   * Note: Similar to PNG, SVG generation in a Node.js environment typically requires
   * specialized libraries or dedicated rendering pipelines. This method defines the
   * interface for future integration.
   * Business Value: Provides scalable, high-fidelity vector graphics for professional
   * publications and adaptable web displays.
   * @param data The data (e.g., chart configuration) to render.
   * @param options Rendering options.
   * @returns A string containing the SVG XML.
   */
  public static toSVG(data: any, options?: any): string {
    console.warn("ExportUtility.toSVG: This is a conceptual stub. Real SVG export requires external rendering libraries or direct SVG construction.");
    // For simplicity, returning a conceptual SVG structure.
    return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
              <text x="50" y="55" font-family="Verdana" font-size="12" text-anchor="middle" fill="white">Conceptual SVG for ${JSON.stringify(data).substring(0, 10)}...</text>
            </svg>`;
  }

  /**
   * Placeholder for exporting data as a PDF document.
   * Note: PDF generation is a complex task usually handled by external libraries
   * (e.g., `pdfkit`, `jsPDF` for client-side, or `puppeteer` to print HTML to PDF).
   * This method outlines the intended functionality.
   * Business Value: Streamlines formal reporting, bundling visualizations and data
   * into easily distributable, professional documents for audit and executive review.
   * @param data The data (e.g., report content, charts) to include in the PDF.
   * @param options PDF generation options.
   * @returns A promise resolving to a Base64 encoded string of the PDF document.
   */
  public static async toPDF(data: any, options?: any): Promise<string> {
    console.warn("ExportUtility.toPDF: This is a conceptual stub. Real PDF export requires external libraries.");
    return Promise.resolve(`data:application/pdf;base64,ConceptualPDFOutputForData:${JSON.stringify(data)}`);
  }
}