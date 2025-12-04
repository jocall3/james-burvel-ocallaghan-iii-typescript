// types/models/reporting/report-parameters.ts
export interface ReportParameters {
    startDate: string;
    endDate: string;
    dimensions: string[];
    metrics: string[];
}
