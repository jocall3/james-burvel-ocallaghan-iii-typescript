/**
 * This module provides a comprehensive suite of utilities for processing, validating, securing, and exporting
 * dashboard chart data. It is a critical component for transforming raw operational data into actionable
 * intelligence, supporting real-time decision-making, and ensuring data integrity and compliance.
 *
 * Business Value: This Chart Utilities module significantly enhances the value proposition by:
 * - **Enabling Advanced Analytics:** Data transformations (filtering, sorting, aggregation, calculated fields) allow business users to derive deeper insights from their data without needing specialized data engineering, accelerating time-to-insight and driving strategic advantage.
 * - **Ensuring Data Quality & Trust:** Robust data validation and anomaly detection mechanisms guarantee that visualizations are based on accurate, reliable data, preventing misinformed decisions and maintaining regulatory compliance. This reduces operational risk and fosters trust in automated systems.
 * - **Facilitating Secure Data Sharing & Governance:** Integrated data anonymization capabilities ensure sensitive information is protected during visualization and export, aligning with stringent data privacy regulations (e.g., GDPR, CCPA) and safeguarding proprietary information. This is critical for maintaining competitive advantage and avoiding costly compliance penalties.
 * - **Automating Reporting & Integration:** Versatile export options (PNG, CSV, SVG, PDF scaffolding) streamline reporting workflows and enable seamless integration with other business intelligence tools, saving countless hours of manual effort and providing a consistent data narrative across the enterprise.
 * - **Supporting Agentic AI Operations:** The anomaly detection and prediction modeling functions are foundational for feeding intelligent agents with insights, allowing for proactive monitoring, automated alerts, and predictive remediation within complex financial ecosystems, reducing human intervention and operational costs.
 *
 * This module empowers enterprises to leverage their data assets more effectively, transforming static reports into dynamic, intelligent dashboards that drive millions in value through optimized operations, risk mitigation, and strategic growth opportunities.
 */
import { DataPoint, TimeSeriesDataPoint, GlobalChartOptions, BaseChartConfig, ChartAnnotation } from '../DashboardChart'; // Relative path adjusted for new file location

// Error handling for ChartDataProcessor
export class ChartDataProcessingError extends Error {
    constructor(message: string, public context?: any) {
        super(message);
        this.name = 'ChartDataProcessingError';
    }
}

// --- Data Processing & Utility Functions ---

export class ChartDataProcessor {
    /**
     * Applies a series of transformations to the input data points based on the provided configuration.
     * This method enables dynamic data manipulation within the dashboard, crucial for deriving
     * specific insights without backend re-processing.
     * @param data The array of DataPoint objects to transform.
     * @param transformations Configuration object detailing the transformations to apply.
     * @returns A new array of DataPoint objects after transformations.
     * @throws {ChartDataProcessingError} If a transformation operation encounters an unrecoverable error.
     */
    static applyTransformations(data: DataPoint[], transformations: GlobalChartOptions['dataTransformation']): DataPoint[] {
        if (!transformations?.enabled || !transformations.operations || transformations.operations.length === 0) return data;

        let processedData = [...data];

        for (const operation of transformations.operations) {
            try {
                switch (operation.type) {
                    case 'filter':
                        processedData = processedData.filter(item => {
                            const value = item[operation.field];
                            switch (operation.operator) {
                                case 'eq': return value === operation.value;
                                case 'neq': return value !== operation.value;
                                case 'gt': return typeof value === 'number' && typeof operation.value === 'number' && value > operation.value;
                                case 'lt': return typeof value === 'number' && typeof operation.value === 'number' && value < operation.value;
                                case 'gte': return typeof value === 'number' && typeof operation.value === 'number' && value >= operation.value;
                                case 'lte': return typeof value === 'number' && typeof operation.value === 'number' && value <= operation.value;
                                case 'in': return Array.isArray(operation.value) && operation.value.includes(value);
                                case 'nin': return Array.isArray(operation.value) && !operation.value.includes(value);
                                case 'contains': return typeof value === 'string' && value.includes(operation.value as string);
                                case 'startsWith': return typeof value === 'string' && value.startsWith(operation.value as string);
                                case 'endsWith': return typeof value === 'string' && value.endsWith(operation.value as string);
                                default: return true;
                            }
                        });
                        break;
                    case 'sort':
                        processedData.sort((a, b) => {
                            const valA = a[operation.field];
                            const valB = b[operation.field];
                            if (typeof valA === 'number' && typeof valB === 'number') {
                                return operation.order === 'asc' ? valA - valB : valB - valA;
                            }
                            if (typeof valA === 'string' && typeof valB === 'string') {
                                return operation.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                            }
                            // Fallback for mixed types or non-comparable types
                            if (valA < valB) return operation.order === 'asc' ? -1 : 1;
                            if (valA > valB) return operation.order === 'asc' ? 1 : -1;
                            return 0;
                        });
                        break;
                    case 'group_by':
                        const grouped: { [key: string]: DataPoint & { _count: number; _rawValues: { [key: string]: any[] }; [aggField: string]: any } } = {};
                        processedData.forEach(item => {
                            const groupKey = operation.fields.map(f => item[f]).join('|');
                            if (!grouped[groupKey]) {
                                grouped[groupKey] = operation.fields.reduce((acc, f) => ({ ...acc, [f]: item[f] }), { _count: 0, _rawValues: {} }) as any;
                                operation.aggregate.forEach(agg => {
                                    if (agg.fn === 'sum' || agg.fn === 'avg') grouped[groupKey][agg.field] = 0;
                                    if (agg.fn === 'min') grouped[groupKey][agg.field] = Infinity;
                                    if (agg.fn === 'max') grouped[groupKey][agg.field] = -Infinity;
                                    if (agg.fn === 'distinct_count') grouped[groupKey][agg.field] = new Set();
                                    if (agg.fn === 'first') grouped[groupKey][agg.field] = undefined;
                                    if (agg.fn === 'last') grouped[groupKey][agg.field] = undefined;
                                    if (['median', 'stddev'].includes(agg.fn)) {
                                        grouped[groupKey]._rawValues[agg.field] = [];
                                    }
                                });
                            }

                            grouped[groupKey]._count++;

                            operation.aggregate.forEach(agg => {
                                const val = item[agg.field];
                                if (typeof val === 'number') {
                                    switch (agg.fn) {
                                        case 'sum': grouped[groupKey][agg.field] += val; break;
                                        case 'avg': grouped[groupKey][agg.field] += val; break;
                                        case 'min': grouped[groupKey][agg.field] = Math.min(grouped[groupKey][agg.field], val); break;
                                        case 'max': grouped[groupKey][agg.field] = Math.max(grouped[groupKey][agg.field], val); break;
                                        case 'count': grouped[groupKey][agg.field] = (grouped[groupKey][agg.field] || 0) + 1; break;
                                        case 'median':
                                        case 'stddev':
                                            grouped[groupKey]._rawValues[agg.field].push(val); break;
                                    }
                                } else if (agg.fn === 'count') {
                                    grouped[groupKey][agg.field] = (grouped[groupKey][agg.field] || 0) + 1;
                                } else if (agg.fn === 'distinct_count') {
                                    grouped[groupKey][agg.field].add(val);
                                } else if (agg.fn === 'first' && grouped[groupKey][agg.field] === undefined) {
                                    grouped[groupKey][agg.field] = val;
                                } else if (agg.fn === 'last') {
                                    grouped[groupKey][agg.field] = val;
                                }
                            });
                        });

                        processedData = Object.values(grouped).map(item => {
                            operation.aggregate.forEach(agg => {
                                if (agg.fn === 'avg' && item._count > 0) {
                                    item[agg.field] /= item._count;
                                } else if (agg.fn === 'distinct_count') {
                                    item[agg.field] = (item[agg.field] as Set<any>).size;
                                } else if (agg.fn === 'median') {
                                    const sortedValues = (item._rawValues[agg.field] || []).sort((a: number, b: number) => a - b);
                                    if (sortedValues.length > 0) {
                                        const mid = Math.floor(sortedValues.length / 2);
                                        item[agg.field] = sortedValues.length % 2 === 0
                                            ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
                                            : sortedValues[mid];
                                    } else {
                                        item[agg.field] = null;
                                    }
                                } else if (agg.fn === 'stddev') {
                                    const values = item._rawValues[agg.field] || [];
                                    if (values.length > 1) {
                                        const mean = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
                                        const stdDev = Math.sqrt(values.map((val: number) => (val - mean) ** 2).reduce((sum: number, sqDiff: number) => sum + sqDiff, 0) / (values.length - 1));
                                        item[agg.field] = stdDev;
                                    } else {
                                        item[agg.field] = 0; // Standard deviation of a single point or no points is 0
                                    }
                                }
                            });
                            const { _count, _rawValues, ...rest } = item; // Remove internal count and rawValues fields
                            return rest;
                        });
                        break;
                    case 'calculate_field':
                        processedData = processedData.map(item => {
                            try {
                                const scope = { data: item }; // Provide `data` context for formula
                                // Using a Function constructor allows for a restricted scope compared to direct eval,
                                // but still carries security risks if formula input is not sanitized.
                                // In a commercial-grade system, this would be replaced by a dedicated, safe expression parser.
                                // eslint-disable-next-line no-new-func
                                const formulaFn = new Function('scope', `with(scope) { return ${operation.formula} }`);
                                item[operation.newField] = formulaFn(scope);
                            } catch (e: any) {
                                throw new ChartDataProcessingError(`Error calculating field ${operation.newField}: ${e.message}`, { item, formula: operation.formula });
                            }
                            return item;
                        });
                        break;
                    case 'fill_missing':
                        processedData = ChartDataProcessor.fillMissingTimeSeriesData(processedData as TimeSeriesDataPoint[], operation.options);
                        break;
                    case 'window_function':
                        processedData = ChartDataProcessor.applyWindowFunction(processedData, operation.options);
                        break;
                    case 'pivot':
                        // Placeholder for a complex operation that often requires specific schema knowledge.
                        // A full implementation would involve defining rows, columns, and aggregation methods.
                        throw new ChartDataProcessingError(`Data transformation 'pivot' is a complex feature that requires a dedicated implementation.`);
                    default:
                        throw new ChartDataProcessingError(`Unsupported data transformation type: ${(operation as any).type}`);
                }
            } catch (error: any) {
                // Centralized error handling for transformations
                console.error(`Error during data transformation '${operation.type}':`, error.message, error.context || operation);
                throw new ChartDataProcessingError(`Failed during transformation '${operation.type}': ${error.message}`, error.context || operation);
            }
        }
        return processedData;
    }

    /**
     * Fills missing data points in a time series using specified methods.
     * Essential for maintaining data continuity in visualizations and analytics.
     * @param data The time series data points.
     * @param options Configuration for filling missing data (e.g., 'forward_fill', 'linear_interpolate').
     * @returns The data points with missing values filled.
     */
    static fillMissingTimeSeriesData(data: TimeSeriesDataPoint[], options: GlobalChartOptions['dataTransformation']['operations'][0]['options']): TimeSeriesDataPoint[] {
        if (!options || !options.fillMethod || data.length === 0) return data;

        const timestampKey = options.timestampKey || 'timestamp';
        const valueKey = options.valueKey || 'value';
        const intervalMs = options.intervalMs; // Expected interval in milliseconds

        if (!intervalMs) {
            console.warn("Fill missing: intervalMs not provided. Cannot accurately fill missing timestamps.");
            return data;
        }

        const sortedData = [...data].sort((a, b) => {
            const timeA = typeof a[timestampKey] === 'string' ? new Date(a[timestampKey] as string).getTime() : a[timestampKey] as number;
            const timeB = typeof b[timestampKey] === 'string' ? new Date(b[timestampKey] as string).getTime() : b[timestampKey] as number;
            return timeA - timeB;
        });

        const filledData: TimeSeriesDataPoint[] = [];
        let lastKnownPoint: TimeSeriesDataPoint | null = null;

        for (let i = 0; i < sortedData.length; i++) {
            const currentPoint = sortedData[i];
            const currentTime = typeof currentPoint[timestampKey] === 'string' ? new Date(currentPoint[timestampKey] as string).getTime() : currentPoint[timestampKey] as number;

            if (lastKnownPoint) {
                const lastKnownTime = typeof lastKnownPoint[timestampKey] === 'string' ? new Date(lastKnownPoint[timestampKey] as string).getTime() : lastKnownPoint[timestampKey] as number;
                let expectedNextTime = lastKnownTime + intervalMs;

                while (expectedNextTime < currentTime) {
                    const newTimestamp = (typeof lastKnownPoint[timestampKey] === 'string') ? new Date(expectedNextTime).toISOString() : expectedNextTime;
                    let filledValue: any = null;

                    if (options.fillMethod === 'forward_fill') {
                        filledValue = lastKnownPoint[valueKey];
                    } else if (options.fillMethod === 'linear_interpolate') {
                        // Find the next actual point for interpolation
                        let nextActualPoint = sortedData.find(p => (typeof p[timestampKey] === 'string' ? new Date(p[timestampKey] as string).getTime() : p[timestampKey] as number) >= expectedNextTime);

                        // If currentPoint is the next actual point, use it. Otherwise, find the one after the gap.
                        if (!nextActualPoint || (typeof nextActualPoint[timestampKey] === 'string' ? new Date(nextActualPoint[timestampKey] as string).getTime() : nextActualPoint[timestampKey] as number) > currentTime) {
                            nextActualPoint = currentPoint;
                        }

                        const nextActualTime = typeof nextActualPoint[timestampKey] === 'string' ? new Date(nextActualPoint[timestampKey] as string).getTime() : nextActualPoint[timestampKey] as number;
                        const lastValue = lastKnownPoint[valueKey] as number;
                        const nextValue = nextActualPoint[valueKey] as number;

                        if (typeof lastValue === 'number' && typeof nextValue === 'number' && (nextActualTime - lastKnownTime) > 0) {
                            filledValue = lastValue + (nextValue - lastValue) * ((expectedNextTime - lastKnownTime) / (nextActualTime - lastKnownTime));
                        } else {
                            filledValue = lastValue; // Fallback to forward fill if interpolation not possible
                        }
                    } else if (options.fillMethod === 'zero_fill') {
                        filledValue = 0;
                    }

                    filledData.push({
                        [timestampKey]: newTimestamp,
                        [valueKey]: filledValue,
                        isFilled: true,
                        ...options.additionalFieldsForFilled || {}
                    } as TimeSeriesDataPoint);
                    expectedNextTime += intervalMs;
                }
            }

            filledData.push(currentPoint);
            lastKnownPoint = currentPoint;
        }

        return filledData;
    }

    /**
     * Applies a window function, such as a moving average, to time series data.
     * Useful for smoothing out noise and highlighting trends.
     * @param data The array of DataPoint objects.
     * @param options Configuration for the window function (e.g., window size, type).
     * @returns A new array of DataPoint objects with the window function applied.
     */
    static applyWindowFunction(data: DataPoint[], options: GlobalChartOptions['dataTransformation']['operations'][0]['options']): DataPoint[] {
        if (!options || !options.windowFunctionType || data.length === 0) return data;

        const valueKey = options.valueKey || 'value';
        const newField = options.newField || `${valueKey}_${options.windowFunctionType}_${options.windowSize}`;
        const windowSize = options.windowSize || 3;

        if (options.windowFunctionType === 'moving_average') {
            return data.map((item, index) => {
                const startIndex = Math.max(0, index - Math.floor(windowSize / 2));
                const endIndex = Math.min(data.length - 1, index + Math.ceil(windowSize / 2) - 1);
                const window = data.slice(startIndex, endIndex + 1);

                const sum = window.reduce((acc, current) => {
                    const value = current[valueKey];
                    return acc + (typeof value === 'number' ? value : 0);
                }, 0);

                return {
                    ...item,
                    [newField]: sum / window.length
                };
            });
        }
        // Other window functions (e.g., exponential moving average, cumulative sum) can be added here.
        throw new ChartDataProcessingError(`Unsupported window function type: ${options.windowFunctionType}`);
    }


    /**
     * Validates data points against a set of predefined rules.
     * Ensures data quality and consistency before visualization, critical for reliable analytics.
     * @param data The array of DataPoint objects to validate.
     * @param rulesConfig Configuration object defining validation rules.
     * @returns An object containing `validData` and `invalidRecords`.
     */
    static validateData(data: DataPoint[], rulesConfig: GlobalChartOptions['dataValidationRules']): { validData: DataPoint[], invalidRecords: DataPoint[] } {
        if (!rulesConfig?.enabled || !rulesConfig.rules || rulesConfig.rules.length === 0) return { validData: data, invalidRecords: [] };

        const validData: DataPoint[] = [];
        const invalidRecords: DataPoint[] = [];

        for (const item of data) {
            let isValid = true;
            const validationErrors: string[] = [];
            for (const rule of rulesConfig.rules) {
                const value = item[rule.field];

                if (rule.validator === 'required' && (value === undefined || value === null || value === '')) {
                    isValid = false;
                    validationErrors.push(`Field '${rule.field}' is required.`);
                    break;
                }
                if (value === undefined || value === null) continue; // Skip other checks if value is missing and not required

                switch (rule.validator) {
                    case 'min': if (typeof value !== 'number' || value < (rule.value as number)) isValid = false; validationErrors.push(`Field '${rule.field}' must be at least ${rule.value}.`); break;
                    case 'max': if (typeof value !== 'number' || value > (rule.value as number)) isValid = false; validationErrors.push(`Field '${rule.field}' must be at most ${rule.value}.`); break;
                    case 'type': if (typeof value !== rule.value) isValid = false; validationErrors.push(`Field '${rule.field}' must be of type '${rule.value}'.`); break;
                    case 'regex': if (typeof value !== 'string' || !(new RegExp(rule.value as string)).test(value)) isValid = false; validationErrors.push(`Field '${rule.field}' does not match regex '${rule.value}'.`); break;
                    case 'enum': if (!Array.isArray(rule.enumValues) || !rule.enumValues.includes(value)) isValid = false; validationErrors.push(`Field '${rule.field}' must be one of [${rule.enumValues.join(', ')}].`); break;
                }
                if (!isValid) {
                    console.warn(`Data validation failed for record: ${JSON.stringify(item)}. Rule for '${rule.field}': ${rule.message || validationErrors[validationErrors.length - 1]}`);
                    break;
                }
            }
            if (isValid) {
                validData.push(item);
            } else {
                invalidRecords.push(item);
            }
        }
        if (invalidRecords.length > 0 && rulesConfig.onInvalidData) {
            rulesConfig.onInvalidData(invalidRecords);
        }

        if (rulesConfig.displayInvalidAs === 'filter_out') {
            return { validData, invalidRecords };
        }
        return { validData: data, invalidRecords }; // If not filtered out, return original data but warn
    }

    /**
     * Detects anomalies in time series data using statistical methods.
     * This functionality is key for real-time monitoring and alerting, enabling agentic AI systems
     * to identify and respond to unusual patterns in financial transactions or system performance.
     * @param data The array of TimeSeriesDataPoint objects.
     * @param anomalyConfig Configuration for anomaly detection.
     * @returns An array of DataPoint objects identified as anomalies.
     */
    static detectAnomalies(data: TimeSeriesDataPoint[], anomalyConfig: GlobalChartOptions['anomalyDetection']): DataPoint[] {
        if (!anomalyConfig?.enabled || data.length < 3) return [];

        const anomalies: DataPoint[] = [];
        const inputKey = anomalyConfig.inputDataKey || Object.keys(data[0]).find(k => k !== 'timestamp') || 'value'; // Heuristic for input key

        const values = data.map(d => d[inputKey] as number).filter(v => typeof v === 'number');
        if (values.length < 3) return []; // Need at least 3 points for meaningful statistics

        if (anomalyConfig.method === 'z_score') {
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const stdDev = Math.sqrt(values.map(val => (val - mean) ** 2).reduce((sum, sqDiff) => sum + sqDiff, 0) / (values.length > 1 ? values.length - 1 : 1)); // Sample std dev

            if (stdDev === 0) return []; // No variance, no anomalies by z-score

            data.forEach((dp, index) => {
                const value = dp[inputKey] as number;
                if (typeof value === 'number') {
                    const zScore = Math.abs((value - mean) / stdDev);
                    if (zScore > (anomalyConfig.threshold || 2.5)) {
                        anomalies.push({ ...dp, isAnomaly: true, anomalyScore: zScore, anomalyKey: inputKey, anomalyMethod: 'z_score' });
                    }
                }
            });
        } else if (anomalyConfig.method === 'iqr') {
            // Interquartile Range (IQR) method for outlier detection
            const sortedValues = [...values].sort((a, b) => a - b);
            const q1Index = Math.floor(sortedValues.length / 4);
            const q3Index = Math.floor(sortedValues.length * 3 / 4);
            const Q1 = sortedValues[q1Index];
            const Q3 = sortedValues[q3Index];
            const IQR = Q3 - Q1;
            const lowerBound = Q1 - (anomalyConfig.threshold || 1.5) * IQR;
            const upperBound = Q3 + (anomalyConfig.threshold || 1.5) * IQR;

            data.forEach((dp, index) => {
                const value = dp[inputKey] as number;
                if (typeof value === 'number' && (value < lowerBound || value > upperBound)) {
                    anomalies.push({ ...dp, isAnomaly: true, anomalyScore: Math.min(Math.abs(value - lowerBound), Math.abs(value - upperBound)), anomalyKey: inputKey, anomalyMethod: 'iqr' });
                }
            });
        } else {
            console.warn(`Anomaly detection method '${anomalyConfig.method}' is conceptual or not fully implemented.`);
        }

        if (anomalies.length > 0 && anomalyConfig.onAnomalyDetected) {
            anomalyConfig.onAnomalyDetected(anomalies);
        }
        return anomalies;
    }

    /**
     * Forecasts future data points based on historical time series data.
     * Predictive modeling is essential for strategic planning, resource allocation, and
     * risk assessment, offering invaluable foresight for financial operations.
     * @param data The array of TimeSeriesDataPoint objects.
     * @param predictionConfig Configuration for the prediction model.
     * @returns An array of TimeSeriesDataPoint objects representing the forecast.
     */
    static forecastData(data: TimeSeriesDataPoint[], predictionConfig: GlobalChartOptions['predictionModeling']): TimeSeriesDataPoint[] {
        if (!predictionConfig?.enabled || data.length < 2) return [];

        const forecast: TimeSeriesDataPoint[] = [];
        const horizon = predictionConfig.forecastHorizon || 5;
        const inputKey = predictionConfig.inputDataKey || 'value';
        const outputKey = predictionConfig.outputDataKey || 'predictedValue';

        // Filter out non-numeric values for calculation
        const cleanData = data.filter(d => typeof d[inputKey] === 'number') as TimeSeriesDataPoint[];
        if (cleanData.length < 2) return [];

        if (predictionConfig.modelType === 'linear_regression') {
            const values = cleanData.map(d => d[inputKey] as number);
            const indices = cleanData.map((_, i) => i);

            const n = values.length;
            if (n < 2) return [];

            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (let i = 0; i < n; i++) {
                sumX += indices[i];
                sumY += values[i];
                sumXY += indices[i] * values[i];
                sumX2 += indices[i] * indices[i];
            }

            const denominator = (n * sumX2 - sumX * sumX);
            if (denominator === 0) return []; // Avoid division by zero for vertical line

            const m = (n * sumXY - sumX * sumY) / denominator;
            const b = (sumY - m * sumX) / n;

            const lastTimestampValue = cleanData[n - 1].timestamp;
            const lastTimestamp = typeof lastTimestampValue === 'string'
                ? new Date(lastTimestampValue).getTime()
                : (lastTimestampValue as number);

            // Assume a constant interval for simplicity, calculating from first two points
            const timeInterval = n > 1
                ? (typeof cleanData[1].timestamp === 'string' ? new Date(cleanData[1].timestamp).getTime() : cleanData[1].timestamp as number) -
                  (typeof cleanData[0].timestamp === 'string' ? new Date(cleanData[0].timestamp).getTime() : cleanData[0].timestamp as number)
                : (1000 * 60 * 60 * 24); // Default to 1 day if only one point

            for (let i = 1; i <= horizon; i++) {
                const nextIndex = n + i - 1;
                const predictedValue = m * nextIndex + b;
                const nextTimestamp = lastTimestamp + (i * timeInterval);

                forecast.push({
                    timestamp: typeof lastTimestampValue === 'string' ? new Date(nextTimestamp).toISOString() : nextTimestamp,
                    [outputKey]: predictedValue,
                    isForecast: true,
                    forecastMethod: 'linear_regression'
                });
            }
        } else if (predictionConfig.modelType === 'exponential_smoothing') {
            // Single Exponential Smoothing (SES)
            // SES is a simple yet effective forecasting method for data with no clear trend or seasonality.
            const alpha = predictionConfig.smoothingFactor || 0.2; // Smoothing factor, typically between 0 and 1
            const values = cleanData.map(d => d[inputKey] as number);

            if (values.length === 0) return [];

            // Initialize smoothed value with the first observation
            let smoothedValue = values[0];

            // Apply smoothing to historical data to get the last smoothed value
            for (let i = 1; i < values.length; i++) {
                smoothedValue = alpha * values[i] + (1 - alpha) * smoothedValue;
            }

            const lastTimestampValue = cleanData[cleanData.length - 1].timestamp;
            const lastTimestamp = typeof lastTimestampValue === 'string'
                ? new Date(lastTimestampValue).getTime()
                : (lastTimestampValue as number);

            const timeInterval = cleanData.length > 1
                ? (typeof cleanData[1].timestamp === 'string' ? new Date(cleanData[1].timestamp).getTime() : cleanData[1].timestamp as number) -
                  (typeof cleanData[0].timestamp === 'string' ? new Date(cleanData[0].timestamp).getTime() : cleanData[0].timestamp as number)
                : (1000 * 60 * 60 * 24); // Default to 1 day

            // Forecast future points using the last smoothed value
            for (let i = 1; i <= horizon; i++) {
                const nextTimestamp = lastTimestamp + (i * timeInterval);
                forecast.push({
                    timestamp: typeof lastTimestampValue === 'string' ? new Date(nextTimestamp).toISOString() : nextTimestamp,
                    [outputKey]: smoothedValue, // SES forecast is flat based on the last smoothed value
                    isForecast: true,
                    forecastMethod: 'exponential_smoothing'
                });
            }
        } else {
            console.warn(`Prediction model '${predictionConfig.modelType}' is conceptual or not fully implemented.`);
        }

        return forecast;
    }
}

/**
 * This class provides robust capabilities for exporting chart visualizations and underlying data
 * into various formats. This functionality is crucial for reporting, data sharing, and archival,
 * directly contributing to operational efficiency and regulatory compliance.
 *
 * Business Value: The ChartExporter is worth millions because it:
 * - **Streamlines Reporting & Compliance:** Enables one-click generation of audit-ready reports in multiple formats (CSV for data, PNG/SVG/PDF for visualizations), drastically reducing manual effort and ensuring consistent, timely data dissemination required by stakeholders and regulators.
 * - **Enhances Collaboration & Communication:** Facilitates easy sharing of critical financial insights across teams, with partners, and with regulatory bodies, improving decision-making speed and accuracy.
 * - **Ensures Data Integrity for Archival:** Provides reliable methods to archive visual and raw data, supporting long-term data governance strategies and historical analysis requirements.
 * - **Extends Data Reach:** Allows integration of dashboard insights into other business applications and documents, maximizing the utility of visualized data beyond the dashboard interface itself.
 *
 * By automating and standardizing the export process, this component saves significant operational costs, mitigates reporting risks, and unlocks greater value from visualized financial data.
 */
export class ChartExporter {
    /**
     * Exports an SVG element (representing a chart) to a PNG image file.
     * This provides a convenient way to capture high-quality chart snapshots for reports and presentations.
     * @param svgElement The SVGElement to export.
     * @param fileName The name of the output PNG file.
     * @param quality The quality of the PNG image (0.0 to 1.0).
     * @returns A Promise that resolves when the export is complete.
     */
    static exportToPNG(svgElement: SVGElement, fileName: string = 'chart.png', quality: number = 0.9): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!svgElement) return reject(new Error('SVG element not found for export.'));
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);
            // Add XML namespace to SVG string for proper rendering in canvas
            if (!svgString.includes('xmlns')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not available.'));

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve();
                    } else {
                        reject(new Error('Failed to create Blob for PNG export.'));
                    }
                }, `image/${fileName.split('.').pop() || 'png'}`, quality);
            };
            img.onerror = (error) => reject(new Error(`Error loading SVG into image: ${error.type || 'Unknown'} - ${error.message || ''}`));
            // Use encodeURIComponent to handle special characters, then btoa for base64
            img.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode(parseInt(p1, 16));
                }));
        });
    }

    /**
     * Exports raw chart data to a CSV (Comma Separated Values) file.
     * This is vital for data analysis, auditing, and integration with other data processing systems.
     * @param data The array of DataPoint objects to export.
     * @param fileName The name of the output CSV file.
     */
    static exportToCSV(data: DataPoint[], fileName: string = 'chart_data.csv'): void {
        if (!data || data.length === 0) {
            console.warn('No data to export to CSV.');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`; // Escape double quotes and wrap in quotes
                }
                return String(value);
            }).join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Exports a chart visualization (SVG) and its associated data to a PDF document.
     * This provides a polished, printable format for official reports and archival.
     *
     * Note: Full PDF generation in a browser environment without an external library is highly complex.
     * This implementation provides robust scaffolding and explains how a minimal, vendored client-side
     * PDF library (e.g., jsPDF) would be integrated to achieve commercial-grade functionality.
     *
     * To fully enable this:
     * 1. Vendor a minimal, self-contained `jsPDF` (or similar) library into the `/vendor` directory.
     * 2. Replace the placeholder comment with the actual `jsPDF` import and usage.
     *    Example: `import { jsPDF } from '../../vendor/jsPDF/jspdf.min.js';`
     *
     * @param svgElement The SVG element to render in the PDF.
     * @param data The raw data to potentially include in the PDF (e.g., as a table).
     * @param fileName The name of the output PDF file.
     * @returns A Promise that resolves when the export is complete.
     */
    static async exportToPDF(svgElement: SVGElement, data: DataPoint[], fileName: string = 'chart.pdf'): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (!svgElement) {
                return reject(new Error('SVG element not found for PDF export.'));
            }

            // --- BEGIN VENDORED LIBRARY INTEGRATION POINT (jsPDF example) ---
            // To make this functional, you would vendor a library like jsPDF.
            // Example of how it would be used if jsPDF was vendored:
            // import { jsPDF } from '../../vendor/jspdf/jspdf.min.js'; // Assuming vendored location
            //
            // const doc = new jsPDF({
            //     orientation: 'landscape',
            //     unit: 'pt',
            //     format: 'a4'
            // });
            //
            // // 1. Convert SVG to PNG/Canvas for PDF embedding
            // try {
            //     const imgData = await ChartExporter.exportSvgToPngDataUrl(svgElement);
            //     doc.addImage(imgData, 'PNG', 10, 10, 500, 300); // Adjust dimensions as needed
            // } catch (error) {
            //     console.error("Error converting SVG to image for PDF:", error);
            //     // Continue without image or re-throw
            // }
            //
            // // 2. Add data as a table (requires jspdf-autotable plugin or manual table generation)
            // if (data && data.length > 0) {
            //     // Example with jspdf-autotable (would also need to be vendored)
            //     // doc.autoTable({
            //     //     startY: 320,
            //     //     head: [Object.keys(data[0])],
            //     //     body: data.map(row => Object.values(row))
            //     // });
            //     // For simplicity and no external plugin: just add a text description
            //     doc.text("Chart Data (first 10 rows):", 10, 320);
            //     data.slice(0, 10).forEach((row, index) => {
            //         doc.text(JSON.stringify(row), 20, 330 + (index * 10));
            //     });
            // }
            //
            // doc.save(fileName);
            // resolve();
            // --- END VENDORED LIBRARY INTEGRATION POINT ---

            console.warn("PDF export is a complex feature requiring a dedicated client-side library (e.g., jsPDF) to be vendored and integrated. This is currently a functional placeholder.");
            console.info("To implement PDF export, integrate a library like jsPDF within the provided `exportToPDF` method, converting the SVG to an image and optionally formatting the raw data into tables.");
            reject(new Error("PDF export requires a vendored library and is not fully implemented in this placeholder."));
        });
    }

    /**
     * Utility function to convert SVG to a Data URL (PNG). Used internally for PDF export.
     * @param svgElement The SVGElement to convert.
     * @returns A Promise resolving with the PNG Data URL.
     */
    static exportSvgToPngDataUrl(svgElement: SVGElement): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!svgElement) return reject(new Error('SVG element not found.'));

            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);
            if (!svgString.includes('xmlns')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not available.'));

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (error) => reject(new Error(`Error loading SVG into image for PNG data URL: ${error.type || 'Unknown'} - ${error.message || ''}`));
            img.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode(parseInt(p1, 16));
                }));
        });
    }

    /**
     * Exports an SVG element (representing a chart) to an SVG file.
     * This preserves the vector quality of the chart, ideal for high-resolution printing or further graphic design.
     * @param svgElement The SVGElement to export.
     * @param fileName The name of the output SVG file.
     */
    static exportToSVG(svgElement: SVGElement, fileName: string = 'chart.svg'): void {
        if (!svgElement) {
            console.warn('SVG element not found for export.');
            return;
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

/**
 * This class provides essential utilities for enhancing the security posture and auditability
 * of chart data, particularly for sensitive financial information.
 *
 * Business Value: ChartSecurityUtils is an invaluable asset, ensuring:
 * - **Data Privacy Compliance:** By enabling anonymization and masking of sensitive fields, it helps organizations comply with stringent data privacy regulations (e.g., GDPR, CCPA, HIPAA), avoiding massive fines and reputational damage.
 * - **Reduced Risk of Data Exposure:** Prevents accidental or malicious exposure of personally identifiable information (PII) or confidential business data in visualizations, a critical safeguard for enterprise-grade financial systems.
 * - **Enhanced Auditability & Governance:** Provides tools for tracking changes to chart configurations, offering a transparent audit trail crucial for internal governance and external regulatory scrutiny. This builds trust and accountability.
 *
 * This component reinforces the overall security framework, making the dashboard not just informative but also a trusted and compliant platform for handling sensitive financial data, leading to increased client confidence and market leadership.
 */
export class ChartSecurityUtils {
    /**
     * Anonymizes or masks sensitive fields within a dataset.
     * Essential for protecting PII or confidential business data when visualizing or sharing.
     * @param data The array of DataPoint objects to anonymize.
     * @param sensitiveFields An array of field names to mask.
     * @param maskChar The character to use for masking (default: '*').
     * @param maskLength The number of characters to mask (default: full length).
     * @returns A new array of DataPoint objects with sensitive fields masked.
     */
    static maskSensitiveFields(data: DataPoint[], sensitiveFields: string[], maskChar: string = '*', maskLength?: number): DataPoint[] {
        if (!sensitiveFields || sensitiveFields.length === 0) return data;

        return data.map(item => {
            const newItem = { ...item };
            for (const field of sensitiveFields) {
                if (newItem[field] !== undefined && newItem[field] !== null) {
                    const originalValue = String(newItem[field]);
                    const actualMaskLength = maskLength === undefined ? originalValue.length : Math.min(maskLength, originalValue.length);
                    newItem[field] = maskChar.repeat(actualMaskLength);
                }
            }
            return newItem;
        });
    }

    /**
     * Generates a hash of a chart configuration to detect unauthorized changes or ensure integrity.
     * This forms a basis for tamper-evident audit logs related to chart definitions.
     * @param config The chart configuration object (BaseChartConfig or GlobalChartOptions).
     * @returns A cryptographic hash of the configuration as a string.
     */
    static async generateConfigHash(config: BaseChartConfig | GlobalChartOptions): Promise<string> {
        const configString = JSON.stringify(config);
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(configString);
        // Using Web Crypto API for SHA-256 hashing (standard browser API)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hexHash;
    }

    /**
     * Simulates logging a chart configuration change to an audit log.
     * In a real system, this would interact with a secure, tamper-evident audit log service.
     * @param configId The ID of the chart configuration being audited.
     * @param previousConfigHash The hash of the previous configuration state.
     * @param newConfig The new configuration object.
     * @param userId The ID of the user or agent initiating the change.
     * @returns A Promise resolving with the new hash, mimicking a successful audit log entry.
     */
    static async auditChartConfigChange(
        configId: string,
        previousConfigHash: string | null,
        newConfig: BaseChartConfig | GlobalChartOptions,
        userId: string
    ): Promise<string> {
        const newHash = await ChartSecurityUtils.generateConfigHash(newConfig);
        const timestamp = new Date().toISOString();

        console.log(`[AUDIT LOG] ChartConfigChange:
  ID: ${configId}
  User: ${userId}
  Timestamp: ${timestamp}
  Previous Hash: ${previousConfigHash || 'N/A (initial config)'}
  New Hash: ${newHash}
  Config Details: ${JSON.stringify(newConfig, null, 2).substring(0, 500)}...`); // Log partial config for context

        // In a real system, this would write to a persistent, immutable log.
        // For simulation, we just return the new hash as if the log was updated.
        return newHash;
    }
}

/**
 * This class provides a conceptual framework for integrating real-time data streams
 * into dashboard charts. It simulates the processing and alerting capabilities
 * necessary for dynamic, agentic AI-driven monitoring of financial transactions and system health.
 *
 * Business Value: The ChartRealtimeDataStream component is instrumental for:
 * - **Real-time Operational Awareness:** Enables dashboards to reflect live data, providing immediate insights into transaction flows, system performance, and emerging anomalies, which is crucial for instant payments and fraud detection.
 * - **Proactive Anomaly Detection & Remediation:** By continuously processing incoming data, it can trigger alerts and engage agentic AI systems for automated analysis and even remediation, minimizing financial losses and operational downtime.
 * - **Enhanced Decision Velocity:** Equips human operators and AI agents with the freshest data, accelerating decision-making in fast-paced financial environments where milliseconds matter.
 * - **Scalable Monitoring Infrastructure:** Provides a structured approach to integrate high-volume data streams, laying the groundwork for a robust and scalable monitoring solution.
 *
 * This component transforms static reporting into a dynamic, intelligent monitoring platform, directly supporting the "real-time payments infrastructure" and "agentic AI" directives, driving operational excellence and significant competitive advantage.
 */
export class ChartRealtimeDataStream {
    private isStreaming: boolean = false;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private dataBuffer: DataPoint[] = [];
    private maxBufferSize: number;
    private callback: (newData: DataPoint[]) => void;
    private anomalyDetector: typeof ChartDataProcessor.detectAnomalies;
    private predictionModeler: typeof ChartDataProcessor.forecastData;
    private anomalyConfig: GlobalChartOptions['anomalyDetection'] | undefined;
    private predictionConfig: GlobalChartOptions['predictionModeling'] | undefined;

    /**
     * Initializes the real-time data stream simulator.
     * @param initialData An array of initial data points to seed the buffer.
     * @param callback A function to call with new processed data.
     * @param maxBufferSize The maximum number of data points to keep in the buffer (default: 1000).
     * @param anomalyConfig Optional anomaly detection configuration.
     * @param predictionConfig Optional prediction modeling configuration.
     */
    constructor(
        initialData: DataPoint[],
        callback: (newData: DataPoint[], anomalies?: DataPoint[], forecast?: TimeSeriesDataPoint[]) => void,
        maxBufferSize: number = 1000,
        anomalyConfig?: GlobalChartOptions['anomalyDetection'],
        predictionConfig?: GlobalChartOptions['predictionModeling']
    ) {
        this.dataBuffer = initialData;
        this.callback = callback;
        this.maxBufferSize = maxBufferSize;
        this.anomalyDetector = ChartDataProcessor.detectAnomalies;
        this.predictionModeler = ChartDataProcessor.forecastData;
        this.anomalyConfig = anomalyConfig;
        this.predictionConfig = predictionConfig;
    }

    /**
     * Starts simulating an incoming stream of data.
     * @param simulationIntervalMs The interval at which to generate new data points (in milliseconds).
     * @param dataGenerator A function that generates a new DataPoint.
     */
    startStreaming(simulationIntervalMs: number, dataGenerator: () => DataPoint): void {
        if (this.isStreaming) {
            console.warn('Real-time data stream is already active.');
            return;
        }

        this.isStreaming = true;
        this.intervalId = setInterval(() => {
            const newDataPoint = dataGenerator();
            this.processIncomingData(newDataPoint);
        }, simulationIntervalMs);

        console.log(`Real-time data streaming started with interval ${simulationIntervalMs}ms.`);
    }

    /**
     * Stops the simulated data stream.
     */
    stopStreaming(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isStreaming = false;
        console.log('Real-time data streaming stopped.');
    }

    /**
     * Processes a new incoming data point, updates the buffer, and triggers callbacks for
     * chart updates, anomaly detection, and prediction.
     * @param newDataPoint The new DataPoint to process.
     */
    processIncomingData(newDataPoint: DataPoint): void {
        this.dataBuffer.push(newDataPoint);
        if (this.dataBuffer.length > this.maxBufferSize) {
            this.dataBuffer.shift(); // Remove the oldest data point
        }

        let anomalies: DataPoint[] = [];
        let forecast: TimeSeriesDataPoint[] = [];

        // Apply anomaly detection if configured
        if (this.anomalyConfig?.enabled) {
            anomalies = this.anomalyDetector(this.dataBuffer as TimeSeriesDataPoint[], this.anomalyConfig);
        }

        // Apply prediction modeling if configured (typically needs more historical data than just the buffer)
        if (this.predictionConfig?.enabled) {
            forecast = this.predictionModeler(this.dataBuffer as TimeSeriesDataPoint[], this.predictionConfig);
        }

        // Notify the callback with the updated data, any detected anomalies, and forecast
        this.callback([...this.dataBuffer], anomalies, forecast);
    }

    /**
     * Retrieves the current data buffer.
     * @returns The current array of DataPoint objects in the buffer.
     */
    getCurrentBuffer(): DataPoint[] {
        return [...this.dataBuffer];
    }
}