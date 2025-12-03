// types/models/corporate/compliance-rule.ts
export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    action: 'flag_for_review' | 'block';
    active: boolean;
}
