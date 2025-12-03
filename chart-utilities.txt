import { DataPoint, TimeSeriesDataPoint, GlobalChartOptions, BaseChartConfig, ChartAnnotation } from '../DashboardChart'; // Relative path adjusted for new file location

// --- Data Processing & Utility Functions ---

export class ChartDataProcessor {
    static applyTransformations(data: DataPoint[], transformations: GlobalChartOptions['dataTransformation']): DataPoint[] {
        if (!transformations?.enabled || !transformations.operations) return data;

        let processedData = [...data];

        for (const operation of transformations.operations) {
            switch (operation.type) {
                case 'filter':
                    processedData = processedData.filter(item => {
                        const value = item[operation.field];
                        switch (operation.operator) {
                            case 'eq': return value === operation.value;
                            case 'neq': return value !== operation.value;
                            case 'gt': return value > operation.value;
                            case 'lt': return value < operation.value;
                            case 'gte': return value >= operation.value;
                            case 'lte': return value <= operation.value;
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
                        if (valA < valB) return operation.order === 'asc' ? -1 : 1;
                        if (valA > valB) return operation.order === 'asc' ? 1 : -1;
                        return 0;
                    });
                    break;
                case 'group_by':
                    const grouped: { [key: string]: DataPoint & { _count: number; [aggField: string]: any } } = {};
                    processedData.forEach(item => {
                        const groupKey = operation.fields.map(f => item[f]).join('|');
                        if (!grouped[groupKey]) {
                            grouped[groupKey] = operation.fields.reduce((acc, f) => ({ ...acc, [f]: item[f] }), { _count: 0 }) as any;
                            operation.aggregate.forEach(agg => {
                                if (agg.fn === 'sum' || agg.fn === 'avg') grouped[groupKey][agg.field] = 0;
                                if (agg.fn === 'min') grouped[groupKey][agg.field] = Infinity;
                                if (agg.fn === 'max') grouped[groupKey][agg.field] = -Infinity;
                                if (agg.fn === 'distinct_count') grouped[groupKey][agg.field] = new Set();
                                if (agg.fn === 'first') grouped[groupKey][agg.field] = undefined;
                                if (agg.fn === 'last') grouped[groupKey][agg.field] = undefined;
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
                                    case 'median': /* Needs storing all values, then calculating median */ break;
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
                            }
                            // Median would require a more complex implementation to collect all values for the group
                        });
                        const { _count, ...rest } = item; // Remove internal count field
                        return rest;
                    });
                    break;
                case 'calculate_field':
                    processedData = processedData.map(item => {
                        try {
                            const data = item; // Provide `data` context for formula
                            // eslint-disable-next-line no-eval
                            item[operation.newField] = eval(operation.formula); // Dangerous but demonstrates intent
                        } catch (e) {
                            console.error(`Error calculating field ${operation.newField}:`, e);
                        }
                        return item;
                    });
                    break;
                case 'fill_missing':
                    // This is a complex operation depending on groupBy, method, and data structure
                    console.warn(`Data transformation 'fill_missing' is conceptual and not fully implemented.`);
                    break;
                case 'window_function':
                    console.warn(`Data transformation 'window_function' is conceptual and not fully implemented.`);
                    break;
                case 'pivot':
                    console.warn(`Data transformation 'pivot' is highly complex and not fully implemented.`);
                    break;
                default:
                    console.warn(`Unsupported data transformation type: ${(operation as any).type}`);
            }
        }
        return processedData;
    }

    static validateData(data: DataPoint[], rulesConfig: GlobalChartOptions['dataValidationRules']): { validData: DataPoint[], invalidRecords: DataPoint[] } {
        if (!rulesConfig?.enabled || !rulesConfig.rules) return { validData: data, invalidRecords: [] };

        const validData: DataPoint[] = [];
        const invalidRecords: DataPoint[] = [];

        for (const item of data) {
            let isValid = true;
            for (const rule of rulesConfig.rules) {
                const value = item[rule.field];

                if (rule.validator === 'required' && (value === undefined || value === null || value === '')) {
                    isValid = false;
                    break;
                }
                if (value === undefined || value === null) continue; // Skip other checks if value is missing and not required

                switch (rule.validator) {
                    case 'min': if (typeof value !== 'number' || value < (rule.value as number)) isValid = false; break;
                    case 'max': if (typeof value !== 'number' || value > (rule.value as number)) isValid = false; break;
                    case 'type': if (typeof value !== rule.value) isValid = false; break;
                    case 'regex': if (typeof value !== 'string' || !(new RegExp(rule.value as string)).test(value)) isValid = false; break;
                    case 'enum': if (!Array.isArray(rule.enumValues) || !rule.enumValues.includes(value)) isValid = false; break;
                }
                if (!isValid) {
                    console.warn(`Data validation failed for record: ${JSON.stringify(item)}. Rule for '${rule.field}': ${rule.message}`);
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

    static detectAnomalies(data: TimeSeriesDataPoint[], anomalyConfig: GlobalChartOptions['anomalyDetection']): DataPoint[] {
        if (!anomalyConfig?.enabled || data.length < 3) return [];

        const anomalies: DataPoint[] = [];
        const inputKey = anomalyConfig.inputDataKey || Object.keys(data[0]).find(k => k !== 'timestamp') || 'value'; // Heuristic for input key

        if (anomalyConfig.method === 'z_score') {
            const values = data.map(d => d[inputKey] as number);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const stdDev = Math.sqrt(values.map(val => (val - mean) ** 2).reduce((sum, sqDiff) => sum + sqDiff, 0) / values.length);

            if (stdDev === 0) return [];

            data.forEach((dp, index) => {
                const value = dp[inputKey] as number;
                const zScore = Math.abs((value - mean) / stdDev);
                if (zScore > (anomalyConfig.threshold || 2.5)) {
                    anomalies.push({ ...dp, isAnomaly: true, anomalyScore: zScore, anomalyKey: inputKey });
                }
            });
        }
        // Other methods (IQR, DBSCAN, Isolation Forest, LOF) would need more complex implementations or external libraries.
        else {
            console.warn(`Anomaly detection method '${anomalyConfig.method}' is conceptual and not fully implemented.`);
        }

        if (anomalies.length > 0 && anomalyConfig.onAnomalyDetected) {
            anomalyConfig.onAnomalyDetected(anomalies);
        }
        return anomalies;
    }

    static forecastData(data: TimeSeriesDataPoint[], predictionConfig: GlobalChartOptions['predictionModeling']): TimeSeriesDataPoint[] {
        if (!predictionConfig?.enabled || data.length < 2) return [];

        const forecast: TimeSeriesDataPoint[] = [];
        const horizon = predictionConfig.forecastHorizon || 5;
        const inputKey = predictionConfig.inputDataKey || 'value';
        const outputKey = predictionConfig.outputDataKey || 'predictedValue';

        // Simplified Linear Regression Forecast
        if (predictionConfig.modelType === 'linear_regression') {
            const values = data.map(d => d[inputKey] as number);
            const indices = data.map((_, i) => i);

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

            const lastTimestampValue = data[n - 1].timestamp;
            const lastTimestamp = typeof lastTimestampValue === 'string'
                ? new Date(lastTimestampValue).getTime()
                : (lastTimestampValue as number);
            
            // Assume a constant interval for simplicity, calculating from first two points
            const timeInterval = n > 1
                ? (typeof data[1].timestamp === 'string' ? new Date(data[1].timestamp).getTime() : data[1].timestamp as number) - 
                  (typeof data[0].timestamp === 'string' ? new Date(data[0].timestamp).getTime() : data[0].timestamp as number)
                : (1000 * 60 * 60 * 24); // Default to 1 day if only one point

            for (let i = 1; i <= horizon; i++) {
                const nextIndex = n + i - 1;
                const predictedValue = m * nextIndex + b;
                const nextTimestamp = lastTimestamp + (i * timeInterval);
                
                forecast.push({
                    timestamp: typeof lastTimestampValue === 'string' ? new Date(nextTimestamp).toISOString() : nextTimestamp,
                    [outputKey]: predictedValue,
                    isForecast: true
                });
            }
        }
        // ARIMA, Exponential Smoothing, Holt-Winters would be much more complex and require external libraries.
        else {
            console.warn(`Prediction model '${predictionConfig.modelType}' is conceptual and not fully implemented.`);
        }

        return forecast;
    }
}

// --- Chart Exporter ---
export class ChartExporter {
    static exportToPNG(svgElement: SVGElement, fileName: string = 'chart.png', quality: number = 0.9): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!svgElement) return reject('SVG element not found for export.');
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);
            // Add XML namespace to SVG string for proper rendering in canvas
            if (!svgString.includes('xmlns')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            // Fix for external images (if any) or complex styles
            // For general Recharts, this should be sufficient.
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas context not available.');

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
                        reject('Failed to create Blob for PNG export.');
                    }
                }, `image/${fileName.split('.').pop() || 'png'}`, quality); // Dynamically set type based on filename
            };
            img.onerror = (error) => reject(`Error loading SVG into image: ${error.type} - ${error.message}`);
            // Use encodeURIComponent to handle special characters, then btoa for base64
            img.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode(parseInt(p1, 16));
                }));
        });
    }

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
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
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

    static exportToPDF(svgElement: SVGElement, data: DataPoint[], fileName: string = 'chart.pdf'): Promise<void> {
        console.warn("PDF export requires a dedicated library (e.g., jsPDF, html2pdf) and is a complex feature not fully implemented here.");
        return Promise.resolve(); // Placeholder for conceptual implementation
    }

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