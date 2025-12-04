import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// --- CORE ETHICAL GOVERNANCE INTERFACES ---

/**
 * Represents a request for an action by an AI system, requiring ethical governor approval.
 */
export interface ActionRequest {
  id: string; // Unique ID for the request
  timestamp: Date;
  sourceAI: string; // e.g., "LoanApprovalModel", "ContentModerationBot"
  action: string;   // e.g., "DENY_LOAN", "FLAG_CONTENT", "RECOMMEND_PRODUCT"
  subjectId: string; // e.g., "user-123", "post-456"
  subjectType: 'USER' | 'CONTENT' | 'SYSTEM' | 'DEVICE';
  payload: Record<string, any>; // Detailed data associated with the action (e.g., loan application details, content text)
  rationale: string; // AI's self-reported reason for the action
  context: Record<string, any>; // Additional contextual data (e.g., geographic info, demographic proxies, time of day)
  riskScore: number; // AI's self-assessed risk score (0-100)
}

/**
 * Represents the Ethical Governor's decision on an ActionRequest.
 */
export interface GovernanceResponse {
  decision: 'APPROVE' | 'VETO' | 'FLAG_FOR_REVIEW';
  governorVersion: string; // Version of the governor logic used
  reason?: string;
  violatesPrinciple?: string[]; // e.g., ["Fairness and Non-Discrimination", "Transparency"]
  vetoDetails?: {
    policyId: string; // The specific policy rule that triggered the veto
    policyName: string;
    thresholdValue?: number;
    actualValue?: number;
  };
  suggestedRemediation?: string[]; // Actionable steps suggested by the governor
  reviewRequired?: boolean; // Indicates if human review is explicitly needed
  humanReviewerId?: string; // ID of the reviewer if assigned
  reviewOutcome?: 'APPROVED' | 'OVERRIDDEN' | 'MODIFIED';
  reviewNotes?: string;
  reviewTimestamp?: Date;
}

/**
 * Combines an ActionRequest with its GovernanceResponse for logging and display.
 */
export type GovernedActionLogEntry = ActionRequest & {
  response?: GovernanceResponse;
  status: 'PENDING' | 'GOVERNED' | 'HUMAN_REVIEW' | 'COMPLETED';
};

/**
 * Defines a core ethical principle guiding AI behavior.
 */
export interface EthicalPrinciple {
  id: string;
  name: string; // e.g., "Fairness and Non-Discrimination"
  description: string;
  guidance: string[]; // High-level guidance statements
  category: 'SOCIAL' | 'TECHNICAL' | 'LEGAL' | 'HUMAN_CENTERED';
  priority: number; // 1 (highest) to 5 (lowest)
  keywords: string[];
  isActive: boolean;
  version: number;
  lastUpdated: Date;
}

/**
 * Defines a specific rule derived from an ethical principle, applied to AI actions.
 */
export interface EthicalPolicyRule {
  id: string;
  name: string;
  description: string;
  principleId: string; // Links to an EthicalPrinciple
  sourceAIModels: string[]; // Applies to which AI models (e.g., ["LoanApprovalModel"])
  actionTypes: string[]; // Applies to which action types (e.g., ["DENY_LOAN"])
  conditionType: 'CONTEXT_MATCH' | 'PAYLOAD_EVAL' | 'RISK_THRESHOLD' | 'EXTERNAL_DATA_CHECK';
  condition: Record<string, any>; // JSON defining the condition (e.g., { "field": "demographic.zipCode", "operator": "IN", "value": ["90210", "10001"] })
  evaluationScript?: string; // Optional JS/Python script for complex conditions
  decisionEffect: 'VETO' | 'FLAG_FOR_REVIEW' | 'APPROVE_WITH_WARNING';
  violationSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedRemediationTemplate?: string[]; // Template for remediation based on this rule
  isActive: boolean;
  version: number;
  lastUpdated: Date;
  creationDate: Date;
  enforcementThreshold?: number; // e.g., for risk score policies
}

/**
 * Represents a registered AI model or system under ethical governance.
 */
export interface AIModelProfile {
  id: string;
  name: string; // e.g., "LoanApprovalModel"
  description: string;
  developerTeam: string;
  deploymentEnvironment: string; // e.g., "production", "staging"
  dataSources: string[];
  inputFeatures: string[];
  outputActions: string[];
  ethicalRiskCategory: 'HIGH' | 'MEDIUM' | 'LOW'; // Self-declared or assessed risk
  governorIntegrationStatus: 'INTEGRATED' | 'PENDING' | 'DISABLED';
  lastUpdated: Date;
  registeredDate: Date;
  contactPerson: string;
}

/**
 * Represents an entry in the detailed audit log of the governor's operations.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: 'GOVERNANCE_DECISION' | 'POLICY_UPDATE' | 'AI_MODEL_REGISTER' | 'HUMAN_REVIEW_ACTION' | 'SYSTEM_ALERT';
  entityId: string; // ID of the related entity (request, policy, model, etc.)
  entityType: 'ACTION_REQUEST' | 'POLICY_RULE' | 'AI_MODEL' | 'HUMAN_REVIEW' | 'GOVERNOR_SYSTEM';
  details: Record<string, any>; // Detailed log data specific to the event type
  userId?: string; // User who initiated the action (if applicable)
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

/**
 * Represents a task requiring human intervention or review.
 */
export interface HumanReviewTask {
  id: string;
  actionRequestId: string; // Link to the original action request
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'ESCALATED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo?: string; // User ID of the reviewer
  reviewDeadline: Date;
  reviewType: 'VETO_OVERRIDE' | 'FLAGGED_ACTION' | 'POLICY_VIOLATION_REVIEW' | 'COMPLAINT_RESOLUTION';
  contextSummary: string;
  decisionOptions: string[]; // e.g., ["Approve", "Override Veto", "Modify Action", "Escalate"]
  reviewerNotes?: string;
  reviewTimestamp?: Date;
  resolution?: 'APPROVED' | 'OVERRIDDEN' | 'MODIFIED' | 'REJECTED_REMEDIATION';
  resolvedBy?: string;
}

/**
 * Represents a proposed or executed remediation action.
 */
export interface RemediationAction {
  id: string;
  actionRequestId: string; // Link to the original action request
  status: 'PENDING' | 'SUGGESTED' | 'EXECUTED' | 'FAILED' | 'REVIEWED';
  type: 'MODIFY_AI_INPUT' | 'REJECT_ACTION' | 'REQUEST_MORE_INFO' | 'HUMAN_OVERRIDE' | 'RETRAIN_MODEL';
  description: string;
  proposedBy: 'GOVERNOR' | 'HUMAN';
  executionDetails?: Record<string, any>;
  executionTimestamp?: Date;
  feedback?: string; // Outcome or feedback on remediation success
  triggeredByPolicyId?: string;
}

/**
 * Represents a report generated for compliance and ethical performance.
 */
export interface ComplianceReport {
  id: string;
  reportName: string;
  generationDate: Date;
  startDate: Date;
  endDate: Date;
  status: 'GENERATED' | 'DRAFT' | 'ARCHIVED';
  metrics: {
    totalRequests: number;
    vetoedRequests: number;
    humanReviewedRequests: number;
    principlesViolated: Record<string, number>; // Principle ID -> count
    topViolatingModels: Record<string, number>; // Model ID -> count
    averageReviewTimeMs: number;
    vetoOverrideRate: number;
  };
  summary: string;
  filePath?: string; // Path to a generated PDF/CSV report
  createdBy: string;
}

/**
 * Represents feedback submitted by a user affected by an AI decision.
 */
export interface UserFeedback {
  id: string;
  timestamp: Date;
  userId: string; // The user who submitted feedback
  actionRequestId: string; // The AI action that prompted feedback
  feedbackType: 'COMPLAINT' | 'SUGGESTION' | 'INQUIRY' | 'PRAISE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  contactEmail?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  resolutionNotes?: string;
  resolvedBy?: string;
}

/**
 * Represents an anomaly detected in AI behavior or governance outcomes.
 */
export interface AnomalyAlert {
  id: string;
  timestamp: Date;
  type: 'UNEXPECTED_VETO_RATE' | 'MODEL_BEHAVIOR_DRIFT' | 'POLICY_CIRCUMVENTION' | 'HIGH_RISK_ACCUMULATION';
  severity: 'CRITICAL' | 'WARNING';
  description: string;
  detectedBy: 'GOVERNOR' | 'EXTERNAL_MONITORING';
  relatedEntityId?: string; // e.g., AI model ID, policy ID
  relatedEntityType?: 'AI_MODEL' | 'POLICY_RULE';
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  resolutionNotes?: string;
}

/**
 * Represents the current status and health of the Ethical Governor system.
 */
export interface SystemStatus {
  id: string;
  timestamp: Date;
  component: string; // e.g., "PolicyEngine", "AuditLogger", "HumanReviewQueue"
  health: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  message: string;
  metrics?: Record<string, any>; // e.g., queue size, processing latency
}

/**
 * Represents a historical version of an ethical policy rule.
 */
export interface PolicyVersionHistory {
  id: string;
  policyId: string;
  version: number;
  timestamp: Date;
  changes: string; // Description of changes made
  changedBy: string; // User ID of the person who made the changes
  policySnapshot: EthicalPolicyRule; // Full policy rule object at this version
}

// --- MOCK DATA GENERATORS ---
let idCounter = 0;
const generateId = (prefix: string = 'id') => `${prefix}-${idCounter++}-${Date.now().toString().slice(-5)}`;

const mockAIModels: AIModelProfile[] = [
  {
    id: 'ai-loan-1', name: 'LoanApprovalModel', description: 'Approves or denies personal loan applications.',
    developerTeam: 'Fintech Innovations', deploymentEnvironment: 'production', dataSources: ['credit_bureaus', 'applicant_data'],
    inputFeatures: ['credit_score', 'income', 'debt_to_income_ratio', 'employment_status', 'demographic_zip_code'],
    outputActions: ['APPROVE_LOAN', 'DENY_LOAN'], ethicalRiskCategory: 'HIGH', governorIntegrationStatus: 'INTEGRATED',
    lastUpdated: new Date(), registeredDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), contactPerson: 'alice@example.com'
  },
  {
    id: 'ai-content-2', name: 'ContentModerationBot', description: 'Flags inappropriate user-generated content.',
    developerTeam: 'SocialGuard', deploymentEnvironment: 'production', dataSources: ['user_posts', 'community_guidelines'],
    inputFeatures: ['text_content', 'image_metadata', 'user_reputation'], outputActions: ['FLAG_CONTENT', 'REMOVE_CONTENT', 'WARN_USER'],
    ethicalRiskCategory: 'MEDIUM', governorIntegrationStatus: 'INTEGRATED', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), contactPerson: 'bob@example.com'
  },
  {
    id: 'ai-recom-3', name: 'ProductRecommendationEngine', description: 'Recommends products to users based on browsing history.',
    developerTeam: 'E-commerce Growth', deploymentEnvironment: 'production', dataSources: ['browsing_history', 'purchase_data'],
    inputFeatures: ['user_id', 'product_category', 'view_history', 'purchase_history'], outputActions: ['RECOMMEND_PRODUCT'],
    ethicalRiskCategory: 'LOW', governorIntegrationStatus: 'INTEGRATED', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), contactPerson: 'charlie@example.com'
  },
  {
    id: 'ai-recruitment-4', name: 'TalentScoutAI', description: 'Assists HR in filtering job applications.',
    developerTeam: 'HR Tech', deploymentEnvironment: 'production', dataSources: ['resumes', 'job_descriptions', 'performance_data'],
    inputFeatures: ['education_level', 'experience_years', 'keywords_matched', 'previous_roles'], outputActions: ['SHORTLIST_CANDIDATE', 'REJECT_CANDIDATE'],
    ethicalRiskCategory: 'HIGH', governorIntegrationStatus: 'INTEGRATED', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), contactPerson: 'diana@example.com'
  },
  {
    id: 'ai-medical-5', name: 'DiagnosticAssistant', description: 'Provides preliminary diagnostic suggestions to medical professionals.',
    developerTeam: 'Health AI', deploymentEnvironment: 'production', dataSources: ['patient_records', 'medical_literature', 'imaging_data'],
    inputFeatures: ['symptoms', 'medical_history', 'test_results'], outputActions: ['SUGGEST_DIAGNOSIS', 'RECOMMEND_TESTS'],
    ethicalRiskCategory: 'CRITICAL', governorIntegrationStatus: 'PENDING', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), contactPerson: 'eve@example.com'
  },
];

const mockEthicalPrinciples: EthicalPrinciple[] = [
  {
    id: 'ep-fairness', name: 'Fairness and Non-Discrimination', description: 'AI systems should treat all individuals and groups fairly, avoiding unjust or discriminatory outcomes.',
    guidance: ['Avoid bias in data and algorithms', 'Ensure equitable access and outcomes', 'Protect vulnerable groups'], category: 'SOCIAL', priority: 1,
    keywords: ['bias', 'discrimination', 'equity', 'equality'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-transparency', name: 'Transparency and Explainability', description: 'AI systems should be understandable, and their decisions should be explainable to relevant stakeholders.',
    guidance: ['Provide clear rationales for decisions', 'Document model architectures and data sources', 'Make limitations clear'], category: 'TECHNICAL', priority: 2,
    keywords: ['explainability', 'interpretability', 'auditability'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-accountability', name: 'Accountability and Responsibility', description: 'Mechanisms should be in place to ensure accountability for the outcomes of AI systems, with clear lines of responsibility.',
    guidance: ['Define human oversight points', 'Establish clear roles for AI development and deployment', 'Implement robust audit trails'], category: 'LEGAL', priority: 1,
    keywords: ['governance', 'liability', 'oversight'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-safety', name: 'Safety and Reliability', description: 'AI systems should be robust, secure, and operate safely and reliably as intended.',
    guidance: ['Rigorous testing and validation', 'Mitigate risks of unintended harm', 'Implement security measures'], category: 'TECHNICAL', priority: 1,
    keywords: ['robustness', 'security', 'safety', 'reliability'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-privacy', name: 'Privacy and Data Governance', description: 'AI systems should respect privacy and handle data responsibly and securely.',
    guidance: ['Adhere to data protection regulations', 'Implement strong data anonymization/encryption', 'Ensure data minimization'], category: 'LEGAL', priority: 1,
    keywords: ['GDPR', 'data protection', 'anonymization'], isActive: true, version: 1, lastUpdated: new Date()
  },
];

const mockEthicalPolicyRules: EthicalPolicyRule[] = [
  {
    id: 'pr-loan-zip-code', name: 'Loan Denial Zip Code Disparity', description: 'Prevents automatic loan denials if the applicant resides in a zip code identified as economically vulnerable, to avoid indirect discrimination.',
    principleId: 'ep-fairness', sourceAIModels: ['LoanApprovalModel'], actionTypes: ['DENY_LOAN'],
    conditionType: 'CONTEXT_MATCH', condition: { field: 'context.demographic.zipCode', operator: 'IN', value: ['90210', '10001', '75001', '30303'] },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'HIGH', suggestedRemediationTemplate: ['Review manually for alternative loan products', 'Require additional human assessment for financial hardship'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 0
  },
  {
    id: 'pr-content-hate-speech', name: 'Hate Speech Detection Override', description: 'Automatically vetoes content flagging if AI confidence is below 80% for hate speech, requiring human review for nuance.',
    principleId: 'ep-safety', sourceAIModels: ['ContentModerationBot'], actionTypes: ['FLAG_CONTENT', 'REMOVE_CONTENT'],
    conditionType: 'PAYLOAD_EVAL', condition: { field: 'payload.confidenceScore', operator: '<', value: 0.8, actionField: 'payload.flagType', actionValue: 'HATE_SPEECH' },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'MEDIUM', suggestedRemediationTemplate: ['Escalate to human moderator for contextual review', 'Provide user with appeal options'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 0.8
  },
  {
    id: 'pr-loan-risk-threshold', name: 'High Risk Loan Denial Review', description: 'All loan denials where the AI-assessed risk score is above 90 must be reviewed by a human.',
    principleId: 'ep-accountability', sourceAIModels: ['LoanApprovalModel'], actionTypes: ['DENY_LOAN'],
    conditionType: 'RISK_THRESHOLD', condition: { field: 'riskScore', operator: '>', value: 90 },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'HIGH', suggestedRemediationTemplate: ['Human review of all application details', 'Verify rationale with compliance officer'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 90
  },
  {
    id: 'pr-recruitment-gender-bias', name: 'Recruitment Gender Bias Check', description: 'Monitor for disproportionate rejection rates of specific genders in initial candidate screening.',
    principleId: 'ep-fairness', sourceAIModels: ['TalentScoutAI'], actionTypes: ['REJECT_CANDIDATE'],
    conditionType: 'EXTERNAL_DATA_CHECK', condition: { api: '/demographic-data', field: 'subjectId', operator: 'CHECK_FOR_DISPROPORTIONATE_IMPACT', demographicField: 'gender' },
    evaluationScript: 'function(action, demographics) { /* complex logic to check for statistical disparity */ return false; }', // Placeholder for a real script
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'CRITICAL', suggestedRemediationTemplate: ['Review rejected candidate pool for bias', 'Adjust model parameters or training data'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date()
  },
  {
    id: 'pr-medical-critical-diagnosis-review', name: 'Critical Diagnosis Human Override', description: 'Any critical diagnosis suggestions by AI must be approved by a human medical professional.',
    principleId: 'ep-safety', sourceAIModels: ['DiagnosticAssistant'], actionTypes: ['SUGGEST_DIAGNOSIS'],
    conditionType: 'PAYLOAD_EVAL', condition: { field: 'payload.diagnosisSeverity', operator: '==', value: 'CRITICAL' },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'CRITICAL', suggestedRemediationTemplate: ['Require human clinician sign-off', 'Escalate to a medical review board'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 0
  },
];

const mockUsers = [
  { id: 'user-admin-1', name: 'System Admin', role: 'ADMIN' },
  { id: 'user-reviewer-1', name: 'Sarah Connor', role: 'ETHICS_REVIEWER' },
  { id: 'user-reviewer-2', name: 'John Doe', role: 'ETHICS_REVIEWER' },
  { id: 'user-developer-1', name: 'Jane Smith', role: 'AI_DEVELOPER' },
];

const generateMockActionRequest = (): ActionRequest => {
  const model = mockAIModels[Math.floor(Math.random() * mockAIModels.length)];
  const action = model.outputActions[Math.floor(Math.random() * model.outputActions.length)];
  const subjectType = model.name.includes('Loan') ? 'USER' : model.name.includes('Content') ? 'CONTENT' : 'USER';

  let rationale = "Default rationale.";
  let payload: Record<string, any> = {};
  let context: Record<string, any> = {};
  let riskScore = Math.floor(Math.random() * 60) + 30; // 30-90

  switch (model.id) {
    case 'ai-loan-1':
      const creditScore = Math.floor(Math.random() * 350) + 300; // 300-650
      const income = Math.floor(Math.random() * 100000) + 30000;
      const dti = parseFloat((Math.random() * 0.5 + 0.2).toFixed(2)); // 0.20-0.70
      const zipCodes = ['90210', '10001', '75001', '30303', '60601', '94105'];
      const randomZip = zipCodes[Math.floor(Math.random() * zipCodes.length)];

      payload = { creditScore, income, debtToIncomeRatio: dti };
      context = { demographic: { zipCode: randomZip } };
      rationale = `Credit score is ${creditScore}, income is $${income}, DTI is ${dti}. Zip: ${randomZip}.`;
      riskScore = creditScore < 600 ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50) + 30;
      break;
    case 'ai-content-2':
      const contentConfidence = parseFloat(Math.random().toFixed(2));
      const flagTypes = ['HATE_SPEECH', 'VIOLENCE', 'SPAM', 'ADULT_CONTENT'];
      const randomFlagType = flagTypes[Math.floor(Math.random() * flagTypes.length)];
      payload = { contentText: `User post about ${Math.random() > 0.5 ? 'controversial topic' : 'cat memes'}.`, confidenceScore: contentConfidence, flagType: randomFlagType };
      rationale = `Content flagged as ${randomFlagType} with confidence ${contentConfidence}.`;
      riskScore = contentConfidence < 0.8 ? Math.floor(Math.random() * 30) + 30 : Math.floor(Math.random() * 30) + 70;
      break;
    case 'ai-recruitment-4':
      const educationLevels = ['High School', 'Bachelors', 'Masters', 'PhD'];
      const experienceYears = Math.floor(Math.random() * 15) + 1;
      const randomEducation = educationLevels[Math.floor(Math.random() * educationLevels.length)];
      const candidateGender = Math.random() > 0.5 ? 'male' : 'female';
      payload = { education: randomEducation, experience: experienceYears, candidateGender };
      context = { demographic: { gender: candidateGender } };
      rationale = `Candidate with ${randomEducation} and ${experienceYears} years experience.`;
      riskScore = experienceYears < 3 ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 50) + 30;
      break;
    case 'ai-medical-5':
      const diagnosisSeverities = ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'];
      const randomSeverity = diagnosisSeverities[Math.floor(Math.random() * diagnosisSeverities.length)];
      payload = { symptoms: ['fever', 'cough'], diagnosis: 'pneumonia', diagnosisSeverity: randomSeverity, confidence: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)) };
      rationale = `Suggested diagnosis: pneumonia, severity: ${randomSeverity}.`;
      riskScore = randomSeverity === 'CRITICAL' ? 95 : Math.floor(Math.random() * 30) + 30;
      break;
  }

  return {
    id: generateId('req'),
    timestamp: new Date(),
    sourceAI: model.name,
    action: action,
    subjectId: `${subjectType.toLowerCase()}-${Math.floor(Math.random() * 10000)}`,
    subjectType: subjectType,
    payload: payload,
    rationale: rationale,
    context: context,
    riskScore: riskScore,
  };
};

const simulateGovernorDecision = (request: ActionRequest, policies: EthicalPolicyRule[]): GovernanceResponse => {
  const applicablePolicies = policies.filter(p =>
    p.isActive &&
    p.sourceAIModels.includes(request.sourceAI) &&
    p.actionTypes.includes(request.action)
  );

  let decision: GovernanceResponse['decision'] = 'APPROVE';
  let reason: string = 'Compliant with ethical constitution.';
  let violatesPrinciple: string[] = [];
  let vetoDetails: GovernanceResponse['vetoDetails'];
  let suggestedRemediation: string[] = [];
  let reviewRequired = false;

  for (const policy of applicablePolicies) {
    let conditionMet = false;
    let actualValue;
    let thresholdValue;

    try {
      if (policy.conditionType === 'CONTEXT_MATCH' && request.context) {
        const field = policy.condition.field as string;
        const operator = policy.condition.operator as string;
        const value = policy.condition.value;
        const contextValue = (request.context as any)[field.split('.')[1]]; // Simple path for now

        if (operator === 'IN' && Array.isArray(value) && contextValue && value.includes(contextValue)) {
          conditionMet = true;
          actualValue = contextValue;
          thresholdValue = value.join(', ');
        }
      } else if (policy.conditionType === 'PAYLOAD_EVAL' && request.payload) {
        const field = policy.condition.field as string;
        const operator = policy.condition.operator as string;
        const value = policy.condition.value;
        const actionField = policy.condition.actionField as string;
        const actionValue = policy.condition.actionValue;
        const payloadValue = (request.payload as any)[field.split('.')[0]]; // Simple path for now

        if (payloadValue !== undefined && (actionField === undefined || (request.payload as any)[actionField.split('.')[0]] === actionValue)) {
          if (operator === '<' && payloadValue < value) { conditionMet = true; }
          if (operator === '>' && payloadValue > value) { conditionMet = true; }
          if (operator === '==' && payloadValue === value) { conditionMet = true; }
          actualValue = payloadValue;
          thresholdValue = value;
        }
      } else if (policy.conditionType === 'RISK_THRESHOLD') {
        const field = policy.condition.field as string;
        const operator = policy.condition.operator as string;
        const value = policy.condition.value;
        const riskValue = (request as any)[field];

        if (riskValue !== undefined) {
          if (operator === '>' && riskValue > value) { conditionMet = true; }
          if (operator === '<' && riskValue < value) { conditionMet = true; }
          actualValue = riskValue;
          thresholdValue = value;
        }
      } else if (policy.conditionType === 'EXTERNAL_DATA_CHECK' && policy.evaluationScript) {
        // In a real system, this would execute the script, e.g., in a sandbox
        // For mock, we'll just simulate a random outcome for this complex rule
        if (Math.random() < 0.3) { // 30% chance to trigger complex rule
          conditionMet = true;
          actualValue = 'Simulated Disparity';
          thresholdValue = 'No Disparity';
        }
      }
    } catch (e) {
      console.error(`Error evaluating policy ${policy.id}:`, e);
      continue; // Skip to next policy if evaluation fails
    }

    if (conditionMet) {
      violatesPrinciple.push(mockEthicalPrinciples.find(p => p.id === policy.principleId)?.name || policy.principleId);
      suggestedRemediation.push(...(policy.suggestedRemediationTemplate || []));

      if (policy.decisionEffect === 'VETO') {
        decision = 'VETO';
        reason = `Policy violation: ${policy.name}. ${policy.description}`;
        vetoDetails = {
          policyId: policy.id,
          policyName: policy.name,
          actualValue: actualValue,
          thresholdValue: thresholdValue,
        };
        reviewRequired = true; // Vetoes usually imply review
        break; // A critical veto stops further processing
      } else if (policy.decisionEffect === 'FLAG_FOR_REVIEW') {
        if (decision !== 'VETO') { // Don't downgrade from VETO to FLAG
          decision = 'FLAG_FOR_REVIEW';
          reason = `Flagged for human review by policy: ${policy.name}. ${policy.description}`;
          reviewRequired = true;
          vetoDetails = { // Still capture details for review
            policyId: policy.id,
            policyName: policy.name,
            actualValue: actualValue,
            thresholdValue: thresholdValue,
          };
        }
      } else if (policy.decisionEffect === 'APPROVE_WITH_WARNING' && decision === 'APPROVE') {
        // Only set warning if not already vetoed or flagged
        reason = `Approved with warning due to policy: ${policy.name}. ${policy.description}`;
      }
    }
  }

  return {
    governorVersion: '1.0.2',
    decision,
    reason,
    violatesPrinciple: violatesPrinciple.length > 0 ? Array.from(new Set(violatesPrinciple)) : undefined,
    vetoDetails,
    suggestedRemediation: suggestedRemediation.length > 0 ? suggestedRemediation : undefined,
    reviewRequired: reviewRequired,
    humanReviewerId: reviewRequired ? mockUsers[Math.floor(Math.random() * mockUsers.length)].id : undefined,
  };
};

const generateMockAuditLog = (entryType: AuditLogEntry['eventType'], entityId: string, entityType: AuditLogEntry['entityType'], details: Record<string, any>, severity: AuditLogEntry['severity'] = 'INFO'): AuditLogEntry => ({
  id: generateId('audit'),
  timestamp: new Date(),
  eventType: entryType,
  entityId: entityId,
  entityType: entityType,
  details: details,
  severity: severity,
  userId: mockUsers[Math.floor(Math.random() * mockUsers.length)].id, // Random user for mock
});

const generateMockAnomalyAlert = (): AnomalyAlert => {
  const types: AnomalyAlert['type'][] = ['UNEXPECTED_VETO_RATE', 'MODEL_BEHAVIOR_DRIFT', 'POLICY_CIRCUMVENTION', 'HIGH_RISK_ACCUMULATION'];
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = Math.random() > 0.7 ? 'CRITICAL' : 'WARNING';
  const model = mockAIModels[Math.floor(Math.random() * mockAIModels.length)];

  let description = '';
  switch (type) {
    case 'UNEXPECTED_VETO_RATE': description = `Veto rate for ${model.name} is ${Math.floor(Math.random() * 10) + 15}% above baseline.`; break;
    case 'MODEL_BEHAVIOR_DRIFT': description = `Detected behavior drift in ${model.name} related to 'demographic_zip_code' feature.`; break;
    case 'POLICY_CIRCUMVENTION': description = `Possible circumvention of 'pr-loan-zip-code' policy by ${model.name}.`; break;
    case 'HIGH_RISK_ACCUMULATION': description = `Accumulation of high-risk actions by ${model.name} without sufficient human review.`; break;
  }

  return {
    id: generateId('anomaly'),
    timestamp: new Date(),
    type,
    severity,
    description,
    detectedBy: 'GOVERNOR',
    relatedEntityId: model.id,
    relatedEntityType: 'AI_MODEL',
    status: 'ACTIVE',
  };
};

const generateMockUserFeedback = (): UserFeedback => {
  const actionRequests = initialRequests.filter(r => r.response?.decision === 'VETO' || r.response?.reviewRequired);
  const relevantRequest = actionRequests.length > 0 ? actionRequests[Math.floor(Math.random() * actionRequests.length)] : null;
  const feedbackTypes: UserFeedback['feedbackType'][] = ['COMPLAINT', 'INQUIRY', 'SUGGESTION'];
  const severity: UserFeedback['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM'];
  const messages = [
    "I was denied a loan unfairly.",
    "Why was my content flagged? It wasn't hate speech.",
    "The AI recommendation was completely irrelevant.",
    "I believe there's a bias in the recruitment system.",
    "Need more transparency about this decision.",
  ];
  return {
    id: generateId('feedback'),
    timestamp: new Date(),
    userId: `enduser-${Math.floor(Math.random() * 5000)}`,
    actionRequestId: relevantRequest ? relevantRequest.id : generateId('req'),
    feedbackType: feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)],
    severity: severity[Math.floor(Math.random() * severity.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    status: 'PENDING',
  };
};

// --- MOCK SERVICE LAYER ---
// This would typically be a backend API client, but for a single file, it's in-memory.
export const governanceService = {
  // Data stores
  _requests: new Map<string, GovernedActionLogEntry>(),
  _principles: new Map<string, EthicalPrinciple>(mockEthicalPrinciples.map(p => [p.id, p])),
  _policies: new Map<string, EthicalPolicyRule>(mockEthicalPolicyRules.map(p => [p.id, p])),
  _aiModels: new Map<string, AIModelProfile>(mockAIModels.map(m => [m.id, m])),
  _auditLogs: new Map<string, AuditLogEntry>(),
  _humanReviewTasks: new Map<string, HumanReviewTask>(),
  _remediationActions: new Map<string, RemediationAction>(),
  _complianceReports: new Map<string, ComplianceReport>(),
  _userFeedback: new Map<string, UserFeedback>(),
  _anomalyAlerts: new Map<string, AnomalyAlert>(),
  _systemStatus: new Map<string, SystemStatus>(),
  _policyVersions: new Map<string, PolicyVersionHistory[]>(), // policyId -> array of versions

  // Initialize with some mock data
  initMockData: () => {
    // Generate some initial requests for display
    for (let i = 0; i < 50; i++) {
      const request = generateMockActionRequest();
      const response = simulateGovernorDecision(request, Array.from(governanceService._policies.values()));
      const logEntry: GovernedActionLogEntry = {
        ...request,
        response,
        status: response.reviewRequired ? 'HUMAN_REVIEW' : 'GOVERNED'
      };
      governanceService._requests.set(logEntry.id, logEntry);

      governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog(
        'GOVERNANCE_DECISION', logEntry.id, 'ACTION_REQUEST',
        { decision: response.decision, reason: response.reason, violatedPrinciples: response.violatesPrinciple },
        response.decision === 'VETO' ? 'WARNING' : 'INFO'
      ));

      if (response.reviewRequired) {
        const reviewTask: HumanReviewTask = {
          id: generateId('hr'),
          actionRequestId: logEntry.id,
          status: 'PENDING',
          priority: response.decision === 'VETO' ? 'CRITICAL' : 'HIGH',
          assignedTo: response.humanReviewerId,
          reviewDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          reviewType: response.decision === 'VETO' ? 'VETO_OVERRIDE' : 'FLAGGED_ACTION',
          contextSummary: `Review AI decision for ${logEntry.sourceAI} action '${logEntry.action}' on subject ${logEntry.subjectId}. Reason: ${response.reason}`,
          decisionOptions: ['Approve AI Decision', 'Override AI Decision', 'Request More Info'],
        };
        governanceService._humanReviewTasks.set(reviewTask.id, reviewTask);
        governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog(
          'HUMAN_REVIEW_ACTION', reviewTask.id, 'HUMAN_REVIEW', { status: 'CREATED', priority: reviewTask.priority }, 'INFO'
        ));
      }
    }

    // Add some initial anomaly alerts
    for (let i = 0; i < 5; i++) {
      const alert = generateMockAnomalyAlert();
      governanceService._anomalyAlerts.set(alert.id, alert);
      governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog(
        'SYSTEM_ALERT', alert.id, 'GOVERNOR_SYSTEM', { type: alert.type, severity: alert.severity, description: alert.description }, alert.severity === 'CRITICAL' ? 'ERROR' : 'WARNING'
      ));
    }

    // Add some initial system statuses
    ['PolicyEngine', 'AuditLogger', 'HumanReviewQueue', 'DataIntegrityMonitor'].forEach(comp => {
      governanceService._systemStatus.set(comp, {
        id: generateId('sys-stat'),
        timestamp: new Date(),
        component: comp,
        health: 'OPERATIONAL',
        message: 'Running normally.',
      });
    });

    // Initial policy versions
    mockEthicalPolicyRules.forEach(policy => {
      governanceService._policyVersions.set(policy.id, [{
        id: generateId('pv'),
        policyId: policy.id,
        version: 1,
        timestamp: policy.creationDate,
        changes: 'Initial version created.',
        changedBy: mockUsers[0].id,
        policySnapshot: policy,
      }]);
    });
  },

  // --- API Methods for Action Requests ---
  fetchGovernedActions: async (limit: number = 100): Promise<GovernedActionLogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call latency
    return Array.from(governanceService._requests.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  },

  // --- API Methods for Ethical Principles ---
  fetchEthicalPrinciples: async (): Promise<EthicalPrinciple[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._principles.values());
  },
  createEthicalPrinciple: async (principle: Omit<EthicalPrinciple, 'id' | 'version' | 'lastUpdated' | 'isActive'>): Promise<EthicalPrinciple> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newPrinciple: EthicalPrinciple = {
      ...principle,
      id: generateId('ep'),
      version: 1,
      lastUpdated: new Date(),
      isActive: true,
    };
    governanceService._principles.set(newPrinciple.id, newPrinciple);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('POLICY_UPDATE', newPrinciple.id, 'POLICY_RULE', { action: 'CREATED', name: newPrinciple.name }));
    return newPrinciple;
  },
  updateEthicalPrinciple: async (id: string, updates: Partial<EthicalPrinciple>): Promise<EthicalPrinciple | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._principles.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    governanceService._principles.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('POLICY_UPDATE', updated.id, 'POLICY_RULE', { action: 'UPDATED', name: updated.name, changes: Object.keys(updates) }));
    return updated;
  },

  // --- API Methods for Ethical Policy Rules ---
  fetchEthicalPolicyRules: async (): Promise<EthicalPolicyRule[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._policies.values());
  },
  createEthicalPolicyRule: async (rule: Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>): Promise<EthicalPolicyRule> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newRule: EthicalPolicyRule = {
      ...rule,
      id: generateId('pr'),
      version: 1,
      lastUpdated: new Date(),
      creationDate: new Date(),
      isActive: true,
    };
    governanceService._policies.set(newRule.id, newRule);
    governanceService._policyVersions.set(newRule.id, [{
      id: generateId('pv'),
      policyId: newRule.id,
      version: 1,
      timestamp: newRule.creationDate,
      changes: 'Initial version created.',
      changedBy: mockUsers[0].id,
      policySnapshot: newRule,
    }]);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('POLICY_UPDATE', newRule.id, 'POLICY_RULE', { action: 'CREATED', name: newRule.name }));
    return newRule;
  },
  updateEthicalPolicyRule: async (id: string, updates: Partial<EthicalPolicyRule>): Promise<EthicalPolicyRule | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._policies.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, lastUpdated: new Date(), version: existing.version + 1 };
    governanceService._policies.set(id, updated);
    const policyVersions = governanceService._policyVersions.get(id) || [];
    policyVersions.push({
      id: generateId('pv'),
      policyId: updated.id,
      version: updated.version,
      timestamp: updated.lastUpdated,
      changes: `Updated fields: ${Object.keys(updates).join(', ')}`,
      changedBy: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
      policySnapshot: { ...updated }, // Store a copy of the updated state
    });
    governanceService._policyVersions.set(id, policyVersions);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('POLICY_UPDATE', updated.id, 'POLICY_RULE', { action: 'UPDATED', name: updated.name, changes: Object.keys(updates) }, 'INFO', mockUsers[Math.floor(Math.random() * mockUsers.length)].id));
    return updated;
  },
  fetchPolicyVersionHistory: async (policyId: string): Promise<PolicyVersionHistory[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return governanceService._policyVersions.get(policyId) || [];
  },

  // --- API Methods for AI Models ---
  fetchAIModelProfiles: async (): Promise<AIModelProfile[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._aiModels.values());
  },
  registerAIModel: async (model: Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>): Promise<AIModelProfile> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newModel: AIModelProfile = {
      ...model,
      id: generateId('ai'),
      lastUpdated: new Date(),
      registeredDate: new Date(),
      governorIntegrationStatus: 'PENDING', // Needs review
    };
    governanceService._aiModels.set(newModel.id, newModel);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('AI_MODEL_REGISTER', newModel.id, 'AI_MODEL', { action: 'REGISTERED', name: newModel.name }));
    return newModel;
  },
  updateAIModelProfile: async (id: string, updates: Partial<AIModelProfile>): Promise<AIModelProfile | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._aiModels.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    governanceService._aiModels.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('AI_MODEL_REGISTER', updated.id, 'AI_MODEL', { action: 'UPDATED_PROFILE', name: updated.name, changes: Object.keys(updates) }));
    return updated;
  },

  // --- API Methods for Audit Logs ---
  fetchAuditLogs: async (limit: number = 200): Promise<AuditLogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return Array.from(governanceService._auditLogs.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  },

  // --- API Methods for Human Review Tasks ---
  fetchHumanReviewTasks: async (status?: HumanReviewTask['status']): Promise<HumanReviewTask[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._humanReviewTasks.values()).filter(task => !status || task.status === status)
      .sort((a, b) => b.reviewDeadline.getTime() - a.reviewDeadline.getTime());
  },
  updateHumanReviewTask: async (id: string, updates: Partial<HumanReviewTask>): Promise<HumanReviewTask | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._humanReviewTasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, reviewTimestamp: new Date() };
    governanceService._humanReviewTasks.set(id, updated);

    // Update the original governed action log entry
    if (updated.actionRequestId && updated.status === 'COMPLETED') {
      const relatedAction = governanceService._requests.get(updated.actionRequestId);
      if (relatedAction) {
        relatedAction.response = {
          ...relatedAction.response!,
          reviewOutcome: updated.resolution,
          reviewNotes: updated.reviewerNotes,
          reviewTimestamp: updated.reviewTimestamp,
          humanReviewerId: updated.resolvedBy || updated.assignedTo,
        };
        relatedAction.status = 'COMPLETED';
        if (updated.resolution === 'OVERRIDDEN') {
          relatedAction.response.decision = 'APPROVE'; // Or whatever the override implies
          relatedAction.response.reason = `Veto overridden by human reviewer: ${updated.reviewerNotes}`;
        }
        governanceService._requests.set(relatedAction.id, relatedAction);
      }
    }

    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('HUMAN_REVIEW_ACTION', updated.id, 'HUMAN_REVIEW', { action: 'UPDATED', status: updated.status, resolution: updated.resolution }, 'INFO', updated.resolvedBy || updated.assignedTo));
    return updated;
  },

  // --- API Methods for Remediation Actions ---
  fetchRemediationActions: async (): Promise<RemediationAction[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._remediationActions.values());
  },
  createRemediationAction: async (action: Omit<RemediationAction, 'id' | 'status'>): Promise<RemediationAction> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newAction: RemediationAction = {
      ...action,
      id: generateId('rem'),
      status: 'PENDING',
    };
    governanceService._remediationActions.set(newAction.id, newAction);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('GOVERNANCE_DECISION', newAction.id, 'ACTION_REQUEST', { action: 'REMEDIATION_CREATED', type: newAction.type }));
    return newAction;
  },
  updateRemediationAction: async (id: string, updates: Partial<RemediationAction>): Promise<RemediationAction | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._remediationActions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    governanceService._remediationActions.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('GOVERNANCE_DECISION', updated.id, 'ACTION_REQUEST', { action: 'REMEDIATION_UPDATED', status: updated.status }));
    return updated;
  },

  // --- API Methods for Compliance Reports ---
  fetchComplianceReports: async (): Promise<ComplianceReport[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return Array.from(governanceService._complianceReports.values());
  },
  generateComplianceReport: async (name: string, startDate: Date, endDate: Date, createdBy: string): Promise<ComplianceReport> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Longer for generation
    const relevantRequests = Array.from(governanceService._requests.values()).filter(req => req.timestamp >= startDate && req.timestamp <= endDate);

    const metrics = {
      totalRequests: relevantRequests.length,
      vetoedRequests: relevantRequests.filter(req => req.response?.decision === 'VETO').length,
      humanReviewedRequests: relevantRequests.filter(req => req.status === 'HUMAN_REVIEW' || req.status === 'COMPLETED' && req.response?.reviewRequired).length,
      principlesViolated: relevantRequests.reduce((acc, req) => {
        if (req.response?.violatesPrinciple) {
          req.response.violatesPrinciple.forEach(p => acc[p] = (acc[p] || 0) + 1);
        }
        return acc;
      }, {} as Record<string, number>),
      topViolatingModels: relevantRequests.reduce((acc, req) => {
        if (req.response?.decision === 'VETO' || req.response?.violatesPrinciple) {
          acc[req.sourceAI] = (acc[req.sourceAI] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      averageReviewTimeMs: relevantRequests
        .filter(req => req.response?.reviewTimestamp && req.response?.reviewRequired)
        .map(req => req.response!.reviewTimestamp!.getTime() - req.timestamp.getTime())
        .reduce((sum, time, _, arr) => sum + time / arr.length, 0),
      vetoOverrideRate: relevantRequests.filter(req => req.response?.reviewOutcome === 'OVERRIDDEN').length / Math.max(1, relevantRequests.filter(req => req.response?.decision === 'VETO').length),
    };

    const newReport: ComplianceReport = {
      id: generateId('report'),
      reportName: name,
      generationDate: new Date(),
      startDate,
      endDate,
      status: 'GENERATED',
      metrics,
      summary: `Report generated for period ${startDate.toDateString()} to ${endDate.toDateString()}. Total requests: ${metrics.totalRequests}, Vetoed: ${metrics.vetoedRequests}.`,
      createdBy,
    };
    governanceService._complianceReports.set(newReport.id, newReport);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('SYSTEM_ALERT', newReport.id, 'GOVERNOR_SYSTEM', { action: 'REPORT_GENERATED', name: newReport.reportName }, 'INFO', createdBy));
    return newReport;
  },

  // --- API Methods for User Feedback ---
  fetchUserFeedback: async (status?: UserFeedback['status']): Promise<UserFeedback[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._userFeedback.values()).filter(fb => !status || fb.status === status);
  },
  submitUserFeedback: async (feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>): Promise<UserFeedback> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newFeedback: UserFeedback = {
      ...feedback,
      id: generateId('feedback'),
      timestamp: new Date(),
      status: 'PENDING',
    };
    governanceService._userFeedback.set(newFeedback.id, newFeedback);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('SYSTEM_ALERT', newFeedback.id, 'GOVERNOR_SYSTEM', { action: 'USER_FEEDBACK_SUBMITTED', userId: newFeedback.userId, type: newFeedback.feedbackType }, 'INFO'));
    return newFeedback;
  },
  updateUserFeedback: async (id: string, updates: Partial<UserFeedback>): Promise<UserFeedback | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._userFeedback.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    governanceService._userFeedback.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('SYSTEM_ALERT', updated.id, 'GOVERNOR_SYSTEM', { action: 'USER_FEEDBACK_UPDATED', status: updated.status }, 'INFO', updated.resolvedBy));
    return updated;
  },

  // --- API Methods for Anomaly Alerts ---
  fetchAnomalyAlerts: async (status?: AnomalyAlert['status']): Promise<AnomalyAlert[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._anomalyAlerts.values()).filter(alert => !status || alert.status === status);
  },
  updateAnomalyAlert: async (id: string, updates: Partial<AnomalyAlert>): Promise<AnomalyAlert | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._anomalyAlerts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    governanceService._anomalyAlerts.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('SYSTEM_ALERT', updated.id, 'GOVERNOR_SYSTEM', { action: 'ANOMALY_ALERT_UPDATED', status: updated.status }, 'WARNING', mockUsers[0].id));
    return updated;
  },

  // --- API Methods for System Status ---
  fetchSystemStatus: async (): Promise<SystemStatus[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return Array.from(governanceService._systemStatus.values());
  },
  updateSystemStatus: async (component: string, updates: Partial<SystemStatus>): Promise<SystemStatus | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const existing = Array.from(governanceService._systemStatus.values()).find(s => s.component === component);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, timestamp: new Date() };
    governanceService._systemStatus.set(existing.id, updated);
    governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog('SYSTEM_ALERT', updated.id, 'GOVERNOR_SYSTEM', { action: 'SYSTEM_STATUS_UPDATE', component: updated.component, health: updated.health }, updated.health === 'DEGRADED' ? 'WARNING' : updated.health === 'OFFLINE' ? 'ERROR' : 'INFO'));
    return updated;
  },
};

// Initialize mock data when the service is first accessed
governanceService.initMockData();
const initialRequests = Array.from(governanceService._requests.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

// --- React Components for the Ethical Governor Dashboard ---

// --- UTILITY COMPONENTS ---

export const Tag: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'bg-blue-600', className }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} text-white ${className}`}>
    {children}
  </span>
);

export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-gray-700 p-4 rounded-lg shadow-md ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>}
    {children}
  </div>
);

export const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info'; disabled?: boolean }> = ({ onClick, children, className, variant = 'primary', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  let variantStyle = "";
  switch (variant) {
    case 'primary': variantStyle = "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500"; break;
    case 'secondary': variantStyle = "bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500"; break;
    case 'danger': variantStyle = "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"; break;
    case 'success': variantStyle = "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"; break;
    case 'info': variantStyle = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"; break;
  }
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

export const InputField: React.FC<{ label: string; id: string; type?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; className?: string; placeholder?: string; textarea?: boolean }> = ({ label, id, type = 'text', value, onChange, className, placeholder, textarea = false }) => (
  <div className={`mb-3 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    {textarea ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        rows={4}
      />
    ) : (
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    )}
  </div>
);

export const SelectField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; className?: string; multiple?: boolean }> = ({ label, id, value, onChange, options, className, multiple = false }) => (
  <div className={`mb-3 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      multiple={multiple}
      className="block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {!multiple && <option value="">Select an option</option>}
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export const CheckboxField: React.FC<{ label: string; id: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ label, id, checked, onChange, className }) => (
  <div className={`flex items-center mb-3 ${className}`}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500 bg-gray-600"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-gray-300">{label}</label>
  </div>
);

// --- DASHBOARD SECTIONS ---

export const ActionLogTable: React.FC<{ requests: GovernedActionLogEntry[] }> = ({ requests }) => (
  <Card title="Latest Governed Actions" className="col-span-2">
    <div className="overflow-auto h-[60vh]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-800/50 sticky top-0 z-10">
          <tr>
            <th className="p-2 border-b border-gray-600">Timestamp</th>
            <th className="p-2 border-b border-gray-600">Source AI</th>
            <th className="p-2 border-b border-gray-600">Action</th>
            <th className="p-2 border-b border-gray-600">Subject</th>
            <th className="p-2 border-b border-gray-600">Decision</th>
            <th className="p-2 border-b border-gray-600">Reason</th>
            <th className="p-2 border-b border-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className={`border-b border-gray-700 ${r.response?.decision === 'VETO' ? 'bg-red-500/10' : r.response?.decision === 'FLAG_FOR_REVIEW' ? 'bg-yellow-500/10' : ''}`}>
              <td className="p-2 text-xs">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="p-2">{r.sourceAI}</td>
              <td className="p-2">{r.action}</td>
              <td className="p-2 font-mono text-xs text-gray-300">{r.subjectId}</td>
              <td className={`p-2 font-bold ${r.response?.decision === 'VETO' ? 'text-red-400' : r.response?.decision === 'FLAG_FOR_REVIEW' ? 'text-yellow-400' : 'text-green-400'}`}>
                {r.response?.decision}
              </td>
              <td className="p-2 text-xs text-gray-400 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{r.response?.reason || 'Compliant with ethical constitution.'}</td>
              <td className="p-2">
                <Tag color={r.status === 'PENDING' ? 'bg-blue-600' : r.status === 'HUMAN_REVIEW' ? 'bg-yellow-600' : 'bg-green-600'}>{r.status}</Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export const SystemHealthDashboard: React.FC<{ statusEntries: SystemStatus[] }> = ({ statusEntries }) => (
  <Card title="System Health Overview" className="col-span-1">
    <div className="space-y-3 h-[60vh] overflow-y-auto">
      {statusEntries.map(s => (
        <div key={s.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
          <div className="flex-1">
            <h4 className="font-semibold text-white">{s.component}</h4>
            <p className="text-xs text-gray-400">{s.message}</p>
          </div>
          <Tag color={s.health === 'OPERATIONAL' ? 'bg-green-600' : s.health === 'DEGRADED' ? 'bg-yellow-600' : 'bg-red-600'}>
            {s.health}
          </Tag>
        </div>
      ))}
    </div>
  </Card>
);

export const AnomalyAlertsViewer: React.FC<{ alerts: AnomalyAlert[]; onResolve: (id: string) => void }> = ({ alerts, onResolve }) => (
  <Card title="Active Anomaly Alerts" className="col-span-1">
    <div className="space-y-3 h-[60vh] overflow-y-auto">
      {alerts.length === 0 ? (
        <p className="text-gray-400">No active anomaly alerts.</p>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} className={`p-3 rounded-md ${alert.severity === 'CRITICAL' ? 'bg-red-700/30 border border-red-600' : 'bg-yellow-700/30 border border-yellow-600'}`}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-white">{alert.type}</h4>
              <Tag color={alert.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-yellow-600'}>{alert.severity}</Tag>
            </div>
            <p className="text-xs text-gray-300 mb-2">{alert.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Model: {mockAIModels.find(m => m.id === alert.relatedEntityId)?.name || 'N/A'}</span>
              <Button onClick={() => onResolve(alert.id)} variant="secondary" className="px-3 py-1 text-xs">Resolve</Button>
            </div>
          </div>
        ))
      )}
    </div>
  </Card>
);

export const HumanReviewDashboard: React.FC<{ tasks: HumanReviewTask[]; onUpdateTask: (id: string, updates: Partial<HumanReviewTask>) => void }> = ({ tasks, onUpdateTask }) => {
  const [selectedTask, setSelectedTask] = useState<HumanReviewTask | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    if (selectedTask) {
      setReviewerNotes(selectedTask.reviewerNotes || '');
      setResolution(selectedTask.resolution || '');
    }
  }, [selectedTask]);

  const handleResolve = () => {
    if (selectedTask && resolution) {
      onUpdateTask(selectedTask.id, {
        status: 'COMPLETED',
        resolution: resolution as any, // Type coercion for mock
        reviewerNotes,
        resolvedBy: mockUsers.find(u => u.role === 'ETHICS_REVIEWER')?.id || 'reviewer-mock',
      });
      setSelectedTask(null);
      setReviewerNotes('');
      setResolution('');
    }
  };

  const getActionRequest = (id: string) => governanceService._requests.get(id);
  const getPolicyRule = (id: string) => governanceService._policies.get(id);

  return (
    <Card title="Human Review Queue" className="col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-hidden">
        <div className="overflow-y-auto pr-2">
          {tasks.length === 0 ? (
            <p className="text-gray-400">No pending human review tasks.</p>
          ) : (
            tasks.map(task => {
              const request = getActionRequest(task.actionRequestId);
              const policy = request?.response?.vetoDetails?.policyId ? getPolicyRule(request.response.vetoDetails.policyId) : null;
              return (
                <div
                  key={task.id}
                  className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedTask?.id === task.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-white">{task.reviewType}</h4>
                    <Tag color={task.priority === 'CRITICAL' ? 'bg-red-600' : task.priority === 'HIGH' ? 'bg-yellow-600' : 'bg-blue-600'}>
                      {task.priority}
                    </Tag>
                  </div>
                  <p className="text-xs text-gray-300">{task.contextSummary}</p>
                  <p className="text-xs text-gray-500 mt-1">Due: {task.reviewDeadline.toLocaleDateString()}</p>
                  {task.assignedTo && <p className="text-xs text-gray-500">Assigned: {mockUsers.find(u => u.id === task.assignedTo)?.name}</p>}
                </div>
              );
            })
          )}
        </div>

        {selectedTask && (
          <div className="p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">Review Task Details: {selectedTask.reviewType}</h3>
            <p className="text-gray-400 text-sm mb-4">{selectedTask.contextSummary}</p>

            <div className="mb-4">
              <h4 className="font-semibold text-white mb-2">Original AI Action:</h4>
              <p className="text-xs text-gray-300"><strong>Source AI:</strong> {getActionRequest(selectedTask.actionRequestId)?.sourceAI}</p>
              <p className="text-xs text-gray-300"><strong>Action:</strong> {getActionRequest(selectedTask.actionRequestId)?.action}</p>
              <p className="text-xs text-gray-300"><strong>Subject:</strong> {getActionRequest(selectedTask.actionRequestId)?.subjectId}</p>
              <p className="text-xs text-gray-300"><strong>AI Rationale:</strong> {getActionRequest(selectedTask.actionRequestId)?.rationale}</p>
              {getActionRequest(selectedTask.actionRequestId)?.response && (
                <>
                  <p className="text-xs text-gray-300"><strong>Governor Decision:</strong> <Tag color={getActionRequest(selectedTask.actionRequestId)?.response?.decision === 'VETO' ? 'bg-red-600' : 'bg-yellow-600'}>{getActionRequest(selectedTask.actionRequestId)?.response?.decision}</Tag></p>
                  <p className="text-xs text-gray-300"><strong>Governor Reason:</strong> {getActionRequest(selectedTask.actionRequestId)?.response?.reason}</p>
                  {getActionRequest(selectedTask.actionRequestId)?.response?.violatesPrinciple && (
                    <p className="text-xs text-gray-300"><strong>Violated Principles:</strong> {getActionRequest(selectedTask.actionRequestId)?.response?.violatesPrinciple?.join(', ')}</p>
                  )}
                  {getActionRequest(selectedTask.actionRequestId)?.response?.vetoDetails && (
                    <p className="text-xs text-gray-300"><strong>Triggering Policy:</strong> {getActionRequest(selectedTask.actionRequestId)?.response?.vetoDetails?.policyName} (ID: {getActionRequest(selectedTask.actionRequestId)?.response?.vetoDetails?.policyId})</p>
                  )}
                </>
              )}
            </div>

            <InputField
              id="reviewer-notes"
              label="Reviewer Notes"
              textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Add your review notes here..."
            />
            <SelectField
              id="resolution-decision"
              label="Resolution Decision"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              options={selectedTask.decisionOptions.map(opt => ({ value: opt.toUpperCase().replace(/\s/g, '_'), label: opt }))}
            />
            <Button onClick={handleResolve} variant="success" className="w-full mt-4" disabled={!resolution}>
              Complete Review
            </Button>
            <Button onClick={() => setSelectedTask(null)} variant="secondary" className="w-full mt-2">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export const EthicalPrinciplesManager: React.FC<{ principles: EthicalPrinciple[]; onUpdate: (id: string, updates: Partial<EthicalPrinciple>) => void }> = ({ principles, onUpdate }) => {
  const [selectedPrinciple, setSelectedPrinciple] = useState<EthicalPrinciple | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EthicalPrinciple>>({});

  useEffect(() => {
    if (selectedPrinciple) {
      setEditForm(selectedPrinciple);
    }
  }, [selectedPrinciple]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setEditForm(prev => ({ ...prev, [id]: id === 'priority' ? parseInt(value) : value }));
  };

  const handleUpdatePrinciple = async () => {
    if (selectedPrinciple && editForm.id) {
      await onUpdate(selectedPrinciple.id, editForm);
      setSelectedPrinciple(prev => ({ ...prev!, ...editForm })); // Update local state for display
      setIsEditing(false);
    }
  };

  return (
    <Card title="Ethical Principles Management" className="col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-hidden">
        <div className="overflow-y-auto pr-2">
          {principles.map(principle => (
            <div
              key={principle.id}
              className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedPrinciple?.id === principle.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
              onClick={() => setSelectedPrinciple(principle)}
            >
              <h4 className="font-semibold text-white">{principle.name}</h4>
              <p className="text-xs text-gray-400 truncate">{principle.description}</p>
              <Tag color={principle.isActive ? 'bg-green-600' : 'bg-red-600'} className="mt-1">{principle.isActive ? 'Active' : 'Inactive'}</Tag>
            </div>
          ))}
        </div>

        {selectedPrinciple && (
          <div className="p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">Principle Details: {selectedPrinciple.name}</h3>
            {isEditing ? (
              <>
                <InputField id="name" label="Name" value={editForm.name || ''} onChange={handleFormChange} />
                <InputField id="description" label="Description" textarea value={editForm.description || ''} onChange={handleFormChange} />
                <InputField id="guidance" label="Guidance (comma-separated)" textarea value={(editForm.guidance || []).join(', ')} onChange={(e) => setEditForm(prev => ({ ...prev, guidance: e.target.value.split(',').map(s => s.trim()) }))} />
                <SelectField
                  id="category"
                  label="Category"
                  value={editForm.category || ''}
                  onChange={handleFormChange}
                  options={['SOCIAL', 'TECHNICAL', 'LEGAL', 'HUMAN_CENTERED'].map(c => ({ value: c, label: c }))}
                />
                <InputField id="priority" label="Priority" type="number" value={editForm.priority || 0} onChange={handleFormChange} />
                <CheckboxField id="isActive" label="Is Active" checked={editForm.isActive || false} onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))} />
                <Button onClick={handleUpdatePrinciple} variant="success" className="w-full mt-4">Save Changes</Button>
                <Button onClick={() => setIsEditing(false)} variant="secondary" className="w-full mt-2">Cancel</Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong> {selectedPrinciple.description}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Guidance:</strong> {selectedPrinciple.guidance.join('; ')}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Category:</strong> {selectedPrinciple.category}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Priority:</strong> {selectedPrinciple.priority}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Status:</strong> <Tag color={selectedPrinciple.isActive ? 'bg-green-600' : 'bg-red-600'}>{selectedPrinciple.isActive ? 'Active' : 'Inactive'}</Tag></p>
                <p className="text-sm text-gray-300 mb-2"><strong>Last Updated:</strong> {new Date(selectedPrinciple.lastUpdated).toLocaleString()}</p>
                <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full mt-4">Edit Principle</Button>
                <Button onClick={() => setSelectedPrinciple(null)} variant="secondary" className="w-full mt-2">Close</Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export const PolicyRuleEditor: React.FC<{
  policies: EthicalPolicyRule[];
  principles: EthicalPrinciple[];
  aiModels: AIModelProfile[];
  onUpdate: (id: string, updates: Partial<EthicalPolicyRule>) => void;
  onCreate: (newRule: Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>) => void;
  onViewHistory: (policyId: string) => void;
}> = ({ policies, principles, aiModels, onUpdate, onCreate, onViewHistory }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<EthicalPolicyRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formState, setFormState] = useState<Partial<EthicalPolicyRule>>({});

  useEffect(() => {
    if (selectedPolicy) {
      setFormState(selectedPolicy);
    } else {
      setFormState({}); // Clear form when no policy is selected
    }
  }, [selectedPolicy]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'sourceAIModels' || id === 'actionTypes' || id === 'violatesPrinciple') {
      const options = (e.target as HTMLSelectElement).options;
      const selectedValues: string[] = [];
      for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      setFormState(prev => ({ ...prev, [id]: selectedValues }));
    } else if (id === 'condition') {
      try {
        setFormState(prev => ({ ...prev, [id]: JSON.parse(value) }));
      } catch {
        // Handle invalid JSON input
        console.error("Invalid JSON for condition");
      }
    } else if (id === 'enforcementThreshold') {
      setFormState(prev => ({ ...prev, [id]: parseFloat(value) }));
    }
    else {
      setFormState(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSavePolicy = async () => {
    if (isCreating) {
      await onCreate(formState as Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>);
      setIsCreating(false);
      setFormState({});
    } else if (selectedPolicy && formState.id) {
      await onUpdate(selectedPolicy.id, formState);
      setSelectedPolicy(prev => ({ ...prev!, ...formState }));
      setIsEditing(false);
    }
  };

  const modelOptions = aiModels.map(model => ({ value: model.name, label: model.name }));
  const principleOptions = principles.map(p => ({ value: p.id, label: p.name }));
  const decisionEffectOptions = ['VETO', 'FLAG_FOR_REVIEW', 'APPROVE_WITH_WARNING'].map(d => ({ value: d, label: d }));
  const conditionTypeOptions = ['CONTEXT_MATCH', 'PAYLOAD_EVAL', 'RISK_THRESHOLD', 'EXTERNAL_DATA_CHECK'].map(c => ({ value: c, label: c }));
  const violationSeverityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => ({ value: s, label: s }));

  return (
    <Card title="Ethical Policy Rules Editor" className="col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] overflow-hidden">
        <div className="md:col-span-1 overflow-y-auto pr-2">
          <Button onClick={() => { setIsCreating(true); setIsEditing(true); setSelectedPolicy(null); setFormState({}); }} variant="primary" className="w-full mb-4">
            + Create New Policy
          </Button>
          {policies.map(policy => (
            <div
              key={policy.id}
              className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedPolicy?.id === policy.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
              onClick={() => { setSelectedPolicy(policy); setIsEditing(false); setIsCreating(false); }}
            >
              <h4 className="font-semibold text-white">{policy.name}</h4>
              <p className="text-xs text-gray-400 truncate">{policy.description}</p>
              <div className="flex justify-between items-center mt-1">
                <Tag color={policy.isActive ? 'bg-green-600' : 'bg-red-600'}>{policy.isActive ? 'Active' : 'Inactive'}</Tag>
                <Tag color="bg-gray-500">v{policy.version}</Tag>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 p-4 bg-gray-800 rounded-md overflow-y-auto">
          {(!selectedPolicy && !isCreating) ? (
            <p className="text-gray-400 text-center py-10">Select a policy to view/edit or create a new one.</p>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-3 text-white">{isCreating ? 'Create New Policy Rule' : `Policy Details: ${selectedPolicy?.name}`}</h3>
              {(!isEditing && selectedPolicy) ? (
                // View Mode
                <>
                  <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong> {selectedPolicy.description}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Principle:</strong> {principles.find(p => p.id === selectedPolicy.principleId)?.name}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Applies to Models:</strong> {selectedPolicy.sourceAIModels.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Applies to Actions:</strong> {selectedPolicy.actionTypes.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Condition Type:</strong> {selectedPolicy.conditionType}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Condition:</strong> <pre className="text-xs bg-gray-700 p-2 rounded">{JSON.stringify(selectedPolicy.condition, null, 2)}</pre></p>
                  {selectedPolicy.evaluationScript && <p className="text-sm text-gray-300 mb-2"><strong>Evaluation Script:</strong> <pre className="text-xs bg-gray-700 p-2 rounded max-h-40 overflow-auto">{selectedPolicy.evaluationScript}</pre></p>}
                  <p className="text-sm text-gray-300 mb-2"><strong>Decision Effect:</strong> <Tag color={selectedPolicy.decisionEffect === 'VETO' ? 'bg-red-600' : selectedPolicy.decisionEffect === 'FLAG_FOR_REVIEW' ? 'bg-yellow-600' : 'bg-green-600'}>{selectedPolicy.decisionEffect}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Violation Severity:</strong> <Tag color={selectedPolicy.violationSeverity === 'CRITICAL' ? 'bg-red-600' : selectedPolicy.violationSeverity === 'HIGH' ? 'bg-orange-600' : 'bg-blue-600'}>{selectedPolicy.violationSeverity}</Tag></p>
                  {selectedPolicy.suggestedRemediationTemplate && <p className="text-sm text-gray-300 mb-2"><strong>Suggested Remediation:</strong> {selectedPolicy.suggestedRemediationTemplate.join('; ')}</p>}
                  <p className="text-sm text-gray-300 mb-2"><strong>Status:</strong> <Tag color={selectedPolicy.isActive ? 'bg-green-600' : 'bg-red-600'}>{selectedPolicy.isActive ? 'Active' : 'Inactive'}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Version:</strong> {selectedPolicy.version}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Last Updated:</strong> {new Date(selectedPolicy.lastUpdated).toLocaleString()}</p>
                  <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full mt-4">Edit Policy</Button>
                  <Button onClick={() => onViewHistory(selectedPolicy.id)} variant="info" className="w-full mt-2">View History</Button>
                  <Button onClick={() => setSelectedPolicy(null)} variant="secondary" className="w-full mt-2">Close</Button>
                </>
              ) : (
                // Edit/Create Mode
                <>
                  <InputField id="name" label="Policy Name" value={formState.name || ''} onChange={handleFormChange} />
                  <InputField id="description" label="Description" textarea value={formState.description || ''} onChange={handleFormChange} />
                  <SelectField
                    id="principleId"
                    label="Governing Principle"
                    value={formState.principleId || ''}
                    onChange={handleFormChange}
                    options={principleOptions}
                  />
                  <SelectField
                    id="sourceAIModels"
                    label="Applies to AI Models"
                    value={Array.isArray(formState.sourceAIModels) ? formState.sourceAIModels[0] || '' : ''} // For multiple select, need to handle differently
                    onChange={handleFormChange}
                    options={modelOptions}
                    multiple
                  />
                  <InputField id="actionTypes" label="Applies to Action Types (comma-separated)" value={Array.isArray(formState.actionTypes) ? formState.actionTypes.join(', ') : ''} onChange={(e) => setFormState(prev => ({ ...prev, actionTypes: e.target.value.split(',').map(s => s.trim()) }))} />
                  <SelectField
                    id="conditionType"
                    label="Condition Type"
                    value={formState.conditionType || ''}
                    onChange={handleFormChange}
                    options={conditionTypeOptions}
                  />
                  <InputField id="condition" label="Condition (JSON)" textarea value={JSON.stringify(formState.condition || {}, null, 2)} onChange={handleFormChange} />
                  <InputField id="evaluationScript" label="Evaluation Script (Optional)" textarea value={formState.evaluationScript || ''} onChange={handleFormChange} />
                  <SelectField
                    id="decisionEffect"
                    label="Decision Effect"
                    value={formState.decisionEffect || ''}
                    onChange={handleFormChange}
                    options={decisionEffectOptions}
                  />
                  <SelectField
                    id="violationSeverity"
                    label="Violation Severity"
                    value={formState.violationSeverity || ''}
                    onChange={handleFormChange}
                    options={violationSeverityOptions}
                  />
                  <InputField id="suggestedRemediationTemplate" label="Suggested Remediation (comma-separated)" textarea value={Array.isArray(formState.suggestedRemediationTemplate) ? formState.suggestedRemediationTemplate.join(', ') : ''} onChange={(e) => setFormState(prev => ({ ...prev, suggestedRemediationTemplate: e.target.value.split(',').map(s => s.trim()) }))} />
                  <InputField id="enforcementThreshold" label="Enforcement Threshold (Optional, numeric)" type="number" value={formState.enforcementThreshold || ''} onChange={handleFormChange} />
                  <CheckboxField id="isActive" label="Is Active" checked={formState.isActive || false} onChange={(e) => setFormState(prev => ({ ...prev, isActive: e.target.checked }))} />

                  <Button onClick={handleSavePolicy} variant="success" className="w-full mt-4">
                    {isCreating ? 'Create Policy' : 'Save Changes'}
                  </Button>
                  <Button onClick={() => { setIsEditing(false); if (isCreating) setSelectedPolicy(null); setIsCreating(false); }} variant="secondary" className="w-full mt-2">
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export const AIModelProfileManager: React.FC<{ models: AIModelProfile[]; onUpdate: (id: string, updates: Partial<AIModelProfile>) => void; onCreate: (newModel: Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>) => void }> = ({ models, onUpdate, onCreate }) => {
  const [selectedModel, setSelectedModel] = useState<AIModelProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formState, setFormState] = useState<Partial<AIModelProfile>>({});

  useEffect(() => {
    if (selectedModel) {
      setFormState(selectedModel);
    } else {
      setFormState({});
    }
  }, [selectedModel]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'dataSources' || id === 'inputFeatures' || id === 'outputActions') {
      setFormState(prev => ({ ...prev, [id]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else {
      setFormState(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSaveModel = async () => {
    if (isCreating) {
      await onCreate(formState as Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>);
      setIsCreating(false);
      setFormState({});
    } else if (selectedModel && formState.id) {
      await onUpdate(selectedModel.id, formState);
      setSelectedModel(prev => ({ ...prev!, ...formState }));
      setIsEditing(false);
    }
  };

  const riskCategoryOptions = ['HIGH', 'MEDIUM', 'LOW', 'CRITICAL'].map(c => ({ value: c, label: c }));
  const integrationStatusOptions = ['INTEGRATED', 'PENDING', 'DISABLED'].map(s => ({ value: s, label: s }));

  return (
    <Card title="AI Model Profile Manager" className="col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] overflow-hidden">
        <div className="md:col-span-1 overflow-y-auto pr-2">
          <Button onClick={() => { setIsCreating(true); setIsEditing(true); setSelectedModel(null); setFormState({}); }} variant="primary" className="w-full mb-4">
            + Register New AI Model
          </Button>
          {models.map(model => (
            <div
              key={model.id}
              className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedModel?.id === model.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
              onClick={() => { setSelectedModel(model); setIsEditing(false); setIsCreating(false); }}
            >
              <h4 className="font-semibold text-white">{model.name}</h4>
              <p className="text-xs text-gray-400 truncate">{model.description}</p>
              <Tag color={model.governorIntegrationStatus === 'INTEGRATED' ? 'bg-green-600' : model.governorIntegrationStatus === 'PENDING' ? 'bg-yellow-600' : 'bg-red-600'} className="mt-1">
                {model.governorIntegrationStatus}
              </Tag>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 p-4 bg-gray-800 rounded-md overflow-y-auto">
          {(!selectedModel && !isCreating) ? (
            <p className="text-gray-400 text-center py-10">Select an AI model to view/edit or register a new one.</p>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-3 text-white">{isCreating ? 'Register New AI Model' : `Model Details: ${selectedModel?.name}`}</h3>
              {(!isEditing && selectedModel) ? (
                // View Mode
                <>
                  <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong> {selectedModel.description}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Developer Team:</strong> {selectedModel.developerTeam}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Environment:</strong> {selectedModel.deploymentEnvironment}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Data Sources:</strong> {selectedModel.dataSources.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Input Features:</strong> {selectedModel.inputFeatures.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Output Actions:</strong> {selectedModel.outputActions.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Ethical Risk:</strong> <Tag color={selectedModel.ethicalRiskCategory === 'HIGH' || selectedModel.ethicalRiskCategory === 'CRITICAL' ? 'bg-red-600' : 'bg-yellow-600'}>{selectedModel.ethicalRiskCategory}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Governor Status:</strong> <Tag color={selectedModel.governorIntegrationStatus === 'INTEGRATED' ? 'bg-green-600' : selectedModel.governorIntegrationStatus === 'PENDING' ? 'bg-yellow-600' : 'bg-red-600'}>{selectedModel.governorIntegrationStatus}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Contact:</strong> {selectedModel.contactPerson}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Registered:</strong> {new Date(selectedModel.registeredDate).toLocaleString()}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Last Updated:</strong> {new Date(selectedModel.lastUpdated).toLocaleString()}</p>
                  <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full mt-4">Edit Profile</Button>
                  <Button onClick={() => setSelectedModel(null)} variant="secondary" className="w-full mt-2">Close</Button>
                </>
              ) : (
                // Edit/Create Mode
                <>
                  <InputField id="name" label="Model Name" value={formState.name || ''} onChange={handleFormChange} />
                  <InputField id="description" label="Description" textarea value={formState.description || ''} onChange={handleFormChange} />
                  <InputField id="developerTeam" label="Developer Team" value={formState.developerTeam || ''} onChange={handleFormChange} />
                  <InputField id="deploymentEnvironment" label="Deployment Environment" value={formState.deploymentEnvironment || ''} onChange={handleFormChange} />
                  <InputField id="dataSources" label="Data Sources (comma-separated)" value={Array.isArray(formState.dataSources) ? formState.dataSources.join(', ') : ''} onChange={handleFormChange} />
                  <InputField id="inputFeatures" label="Input Features (comma-separated)" value={Array.isArray(formState.inputFeatures) ? formState.inputFeatures.join(', ') : ''} onChange={handleFormChange} />
                  <InputField id="outputActions" label="Output Actions (comma-separated)" value={Array.isArray(formState.outputActions) ? formState.outputActions.join(', ') : ''} onChange={handleFormChange} />
                  <SelectField
                    id="ethicalRiskCategory"
                    label="Ethical Risk Category"
                    value={formState.ethicalRiskCategory || ''}
                    onChange={handleFormChange}
                    options={riskCategoryOptions}
                  />
                  {!isCreating && (
                    <SelectField
                      id="governorIntegrationStatus"
                      label="Governor Integration Status"
                      value={formState.governorIntegrationStatus || ''}
                      onChange={handleFormChange}
                      options={integrationStatusOptions}
                    />
                  )}
                  <InputField id="contactPerson" label="Contact Person Email" type="email" value={formState.contactPerson || ''} onChange={handleFormChange} />

                  <Button onClick={handleSaveModel} variant="success" className="w-full mt-4">
                    {isCreating ? 'Register Model' : 'Save Changes'}
                  </Button>
                  <Button onClick={() => { setIsEditing(false); if (isCreating) setSelectedModel(null); setIsCreating(false); }} variant="secondary" className="w-full mt-2">
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export const AuditLogViewer: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => (
  <Card title="Full Audit Trail" className="col-span-3">
    <div className="overflow-auto h-[70vh]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-800/50 sticky top-0 z-10">
          <tr>
            <th className="p-2 border-b border-gray-600">Timestamp</th>
            <th className="p-2 border-b border-gray-600">Event Type</th>
            <th className="p-2 border-b border-gray-600">Entity Type</th>
            <th className="p-2 border-b border-gray-600">Entity ID</th>
            <th className="p-2 border-b border-gray-600">Details</th>
            <th className="p-2 border-b border-gray-600">User ID</th>
            <th className="p-2 border-b border-gray-600">Severity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className={`border-b border-gray-700 ${log.severity === 'ERROR' ? 'bg-red-500/10' : log.severity === 'WARNING' ? 'bg-yellow-500/10' : ''}`}>
              <td className="p-2 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-2 text-xs">{log.eventType}</td>
              <td className="p-2 text-xs">{log.entityType}</td>
              <td className="p-2 font-mono text-xs text-gray-300">{log.entityId}</td>
              <td className="p-2 text-xs text-gray-400 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{JSON.stringify(log.details)}</td>
              <td className="p-2 text-xs">{log.userId || 'System'}</td>
              <td className="p-2">
                <Tag color={log.severity === 'CRITICAL' || log.severity === 'ERROR' ? 'bg-red-600' : log.severity === 'WARNING' ? 'bg-yellow-600' : 'bg-green-600'}>{log.severity}</Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export const ComplianceReportGenerator: React.FC<{ reports: ComplianceReport[]; onGenerate: (name: string, start: Date, end: Date, creator: string) => void }> = ({ reports, onGenerate }) => {
  const [reportName, setReportName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerate = () => {
    if (reportName && startDate && endDate) {
      onGenerate(reportName, new Date(startDate), new Date(endDate), mockUsers[0].id); // Mock user
      setReportName('');
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <Card title="Compliance Reports" className="col-span-2">
      <div className="mb-4 p-4 bg-gray-800 rounded-md">
        <h4 className="font-semibold text-white mb-2">Generate New Report</h4>
        <InputField id="reportName" label="Report Name" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="e.g., Q4 Ethical Compliance Report" />
        <InputField id="startDate" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <InputField id="endDate" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={handleGenerate} variant="primary" className="w-full mt-3">Generate Report</Button>
      </div>

      <h4 className="font-semibold text-white mb-2">Generated Reports</h4>
      <div className="overflow-y-auto h-[40vh] pr-2">
        {reports.length === 0 ? (
          <p className="text-gray-400">No reports generated yet.</p>
        ) : (
          reports.map(report => (
            <div key={report.id} className="p-3 mb-2 bg-gray-800 rounded-md border border-gray-700">
              <h5 className="font-semibold text-white">{report.reportName}</h5>
              <p className="text-xs text-gray-400">Period: {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-400">Generated: {new Date(report.generationDate).toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Requests: {report.metrics.totalRequests}, Vetoed: {report.metrics.vetoedRequests}</p>
              <Button onClick={() => alert(`Viewing report: ${report.summary}`)} variant="info" className="px-3 py-1 text-xs mt-2">View Summary</Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export const UserFeedbackViewer: React.FC<{ feedback: UserFeedback[]; onResolve: (id: string, notes: string) => void }> = ({ feedback, onResolve }) => {
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (selectedFeedback) {
      setResolutionNotes(selectedFeedback.resolutionNotes || '');
    }
  }, [selectedFeedback]);

  const handleResolve = () => {
    if (selectedFeedback) {
      onResolve(selectedFeedback.id, resolutionNotes);
      setSelectedFeedback(null);
      setResolutionNotes('');
    }
  };

  const getActionRequest = (id: string) => governanceService._requests.get(id);

  return (
    <Card title="User Feedback & Complaints" className="col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-hidden">
        <div className="overflow-y-auto pr-2">
          {feedback.length === 0 ? (
            <p className="text-gray-400">No user feedback to display.</p>
          ) : (
            feedback.map(fb => (
              <div
                key={fb.id}
                className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedFeedback?.id === fb.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
                onClick={() => setSelectedFeedback(fb)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-white">{fb.feedbackType} from {fb.userId}</h4>
                  <Tag color={fb.severity === 'CRITICAL' ? 'bg-red-600' : fb.severity === 'HIGH' ? 'bg-yellow-600' : 'bg-blue-600'}>
                    {fb.severity}
                  </Tag>
                </div>
                <p className="text-xs text-gray-300 truncate">{fb.message}</p>
                <p className="text-xs text-gray-500 mt-1">Status: {fb.status}</p>
              </div>
            ))
          )}
        </div>

        {selectedFeedback && (
          <div className="p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">Feedback Details: {selectedFeedback.feedbackType}</h3>
            <p className="text-gray-400 text-sm mb-4"><strong>User:</strong> {selectedFeedback.userId} ({selectedFeedback.contactEmail || 'N/A'})</p>
            <p className="text-gray-400 text-sm mb-4"><strong>Message:</strong> {selectedFeedback.message}</p>
            <p className="text-gray-400 text-sm mb-4"><strong>Related AI Action:</strong> {selectedFeedback.actionRequestId}</p>
            {getActionRequest(selectedFeedback.actionRequestId) && (
              <div className="mb-4 text-xs text-gray-300">
                <p><strong>Source AI:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.sourceAI}</p>
                <p><strong>Action:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.action}</p>
                <p><strong>Subject:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.subjectId}</p>
                <p><strong>AI Rationale:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.rationale}</p>
              </div>
            )}

            <InputField
              id="resolution-notes"
              label="Resolution Notes"
              textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Document the resolution steps taken..."
            />
            <Button onClick={handleResolve} variant="success" className="w-full mt-4" disabled={selectedFeedback.status === 'RESOLVED'}>
              Resolve Feedback
            </Button>
            <Button onClick={() => setSelectedFeedback(null)} variant="secondary" className="w-full mt-2">
              Close
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export const PolicyVersionHistoryViewer: React.FC<{ policyId: string; onClose: () => void }> = ({ policyId, onClose }) => {
  const [history, setHistory] = useState<PolicyVersionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = await governanceService.fetchPolicyVersionHistory(policyId);
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [policyId]);

  if (loading) return <Card title="Policy History">Loading...</Card>;

  return (
    <Card title={`Version History for Policy: ${governanceService._policies.get(policyId)?.name}`} className="col-span-3">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {history.length === 0 ? (
          <p className="text-gray-400">No version history available for this policy.</p>
        ) : (
          history.map((version, index) => (
            <div key={version.id} className={`p-3 mb-3 rounded-md ${index === history.length - 1 ? 'bg-indigo-800/50' : 'bg-gray-800'} border border-gray-700`}>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-white">Version {version.version}</h4>
                <Tag color="bg-gray-600">{new Date(version.timestamp).toLocaleString()}</Tag>
              </div>
              <p className="text-xs text-gray-300 mb-1"><strong>Changes:</strong> {version.changes}</p>
              <p className="text-xs text-gray-400 mb-2"><strong>Changed By:</strong> {mockUsers.find(u => u.id === version.changedBy)?.name || version.changedBy}</p>
              <div className="text-xs text-gray-500">
                <p><strong>Condition Type:</strong> {version.policySnapshot.conditionType}</p>
                <p><strong>Decision Effect:</strong> {version.policySnapshot.decisionEffect}</p>
                <p><strong>Is Active:</strong> {version.policySnapshot.isActive ? 'Yes' : 'No'}</p>
                <pre className="mt-2 p-2 bg-gray-700 rounded max-h-24 overflow-auto text-white text-xs">
                  {JSON.stringify(version.policySnapshot.condition, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
      <Button onClick={onClose} variant="secondary" className="w-full mt-4">Close History</Button>
    </Card>
  );
};


// --- MAIN ETHICAL GOVERNOR VIEW ---
const EthicalGovernorView: React.FC = () => {
  const [requests, setRequests] = useState<GovernedActionLogEntry[]>(initialRequests);
  const [ethicalPrinciples, setEthicalPrinciples] = useState<EthicalPrinciple[]>([]);
  const [ethicalPolicies, setEthicalPolicies] = useState<EthicalPolicyRule[]>([]);
  const [aiModels, setAiModels] = useState<AIModelProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [humanReviewTasks, setHumanReviewTasks] = useState<HumanReviewTask[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'principles' | 'policies' | 'models' | 'review' | 'audit' | 'reports' | 'feedback' | 'alerts' | 'settings'>('dashboard');
  const [viewingPolicyHistoryFor, setViewingPolicyHistoryFor] = useState<string | null>(null);

  // --- Data Fetching Hooks ---
  const fetchData = useCallback(async () => {
    setEthicalPrinciples(await governanceService.fetchEthicalPrinciples());
    setEthicalPolicies(await governanceService.fetchEthicalPolicyRules());
    setAiModels(await governanceService.fetchAIModelProfiles());
    setAuditLogs(await governanceService.fetchAuditLogs());
    setHumanReviewTasks(await governanceService.fetchHumanReviewTasks('PENDING'));
    setComplianceReports(await governanceService.fetchComplianceReports());
    setUserFeedback(await governanceService.fetchUserFeedback('PENDING'));
    setAnomalyAlerts(await governanceService.fetchAnomalyAlerts('ACTIVE'));
    setSystemStatus(await governanceService.fetchSystemStatus());
  }, []);

  useEffect(() => {
    fetchData(); // Initial load

    const interval = setInterval(async () => {
      // MOCK INCOMING REQUESTS
      const newRequest: ActionRequest = generateMockActionRequest();
      const currentPolicies = await governanceService.fetchEthicalPolicyRules(); // Get latest policies
      const response: GovernanceResponse = simulateGovernorDecision(newRequest, currentPolicies);

      const logEntry: GovernedActionLogEntry = {
        ...newRequest,
        response,
        status: response.reviewRequired ? 'HUMAN_REVIEW' : 'GOVERNED'
      };

      governanceService._requests.set(logEntry.id, logEntry);

      governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog(
        'GOVERNANCE_DECISION', logEntry.id, 'ACTION_REQUEST',
        { decision: response.decision, reason: response.reason, violatedPrinciples: response.violatesPrinciple },
        response.decision === 'VETO' ? 'WARNING' : 'INFO'
      ));

      if (response.reviewRequired) {
        const reviewTask: HumanReviewTask = {
          id: generateId('hr'),
          actionRequestId: logEntry.id,
          status: 'PENDING',
          priority: response.decision === 'VETO' ? 'CRITICAL' : 'HIGH',
          assignedTo: response.humanReviewerId,
          reviewDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          reviewType: response.decision === 'VETO' ? 'VETO_OVERRIDE' : 'FLAGGED_ACTION',
          contextSummary: `Review AI decision for ${logEntry.sourceAI} action '${logEntry.action}' on subject ${logEntry.subjectId}. Reason: ${response.reason}`,
          decisionOptions: ['Approve AI Decision', 'Override AI Decision', 'Request More Info'],
        };
        governanceService._humanReviewTasks.set(reviewTask.id, reviewTask);
        governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog(
          'HUMAN_REVIEW_ACTION', reviewTask.id, 'HUMAN_REVIEW', { status: 'CREATED', priority: reviewTask.priority }, 'INFO'
        ));
      }

      setRequests(prev => [{ ...logEntry }, ...prev.slice(0, 50)]); // Keep log size manageable in UI
      fetchData(); // Refresh other data
    }, 3000); // New request every 3 seconds

    const anomalyInterval = setInterval(async () => {
      if (Math.random() < 0.2) { // 20% chance to generate an anomaly
        const alert = generateMockAnomalyAlert();
        governanceService._anomalyAlerts.set(alert.id, alert);
        governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog(
          'SYSTEM_ALERT', alert.id, 'GOVERNOR_SYSTEM', { type: alert.type, severity: alert.severity, description: alert.description }, alert.severity === 'CRITICAL' ? 'ERROR' : 'WARNING'
        ));
        setAnomalyAlerts(prev => [alert, ...prev.filter(a => a.status === 'ACTIVE').slice(0, 10)]); // Keep active alerts visible
      }
      if (Math.random() < 0.1) { // 10% chance to generate user feedback
        const feedback = generateMockUserFeedback();
        governanceService._userFeedback.set(feedback.id, feedback);
        governanceService._auditLogs.set(generateId('audit'), generateMockAuditLog(
          'SYSTEM_ALERT', feedback.id, 'GOVERNOR_SYSTEM', { action: 'USER_FEEDBACK_SUBMITTED', userId: feedback.userId, type: feedback.feedbackType }, 'INFO'
        ));
        setUserFeedback(prev => [feedback, ...prev.filter(fb => fb.status === 'PENDING').slice(0, 10)]);
      }
      fetchData(); // Refresh other data
    }, 10000); // Anomaly check every 10 seconds

    return () => {
      clearInterval(interval);
      clearInterval(anomalyInterval);
    };
  }, [fetchData]);

  // --- Handlers for Child Components ---
  const handleUpdatePrinciple = useCallback(async (id: string, updates: Partial<EthicalPrinciple>) => {
    const updated = await governanceService.updateEthicalPrinciple(id, updates);
    if (updated) {
      setEthicalPrinciples(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const handleCreatePolicy = useCallback(async (newRule: Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>) => {
    const created = await governanceService.createEthicalPolicyRule(newRule);
    if (created) {
      setEthicalPolicies(prev => [created, ...prev]);
    }
  }, []);

  const handleUpdatePolicy = useCallback(async (id: string, updates: Partial<EthicalPolicyRule>) => {
    const updated = await governanceService.updateEthicalPolicyRule(id, updates);
    if (updated) {
      setEthicalPolicies(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const handleCreateModel = useCallback(async (newModel: Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>) => {
    const created = await governanceService.registerAIModel(newModel);
    if (created) {
      setAiModels(prev => [created, ...prev]);
    }
  }, []);

  const handleUpdateModel = useCallback(async (id: string, updates: Partial<AIModelProfile>) => {
    const updated = await governanceService.updateAIModelProfile(id, updates);
    if (updated) {
      setAiModels(prev => prev.map(m => m.id === id ? updated : m));
    }
  }, []);

  const handleUpdateHumanReviewTask = useCallback(async (id: string, updates: Partial<HumanReviewTask>) => {
    const updated = await governanceService.updateHumanReviewTask(id, updates);
    if (updated) {
      setHumanReviewTasks(prev => prev.map(task => task.id === id ? updated : task).filter(task => task.status === 'PENDING'));
      setRequests(prev => prev.map(req => req.id === updated.actionRequestId ? { ...req, status: 'COMPLETED', response: { ...req.response!, reviewOutcome: updated.resolution, reviewNotes: updated.reviewerNotes } } : req));
    }
  }, []);

  const handleGenerateComplianceReport = useCallback(async (name: string, startDate: Date, endDate: Date, createdBy: string) => {
    const report = await governanceService.generateComplianceReport(name, startDate, endDate, createdBy);
    if (report) {
      setComplianceReports(prev => [report, ...prev]);
    }
  }, []);

  const handleResolveUserFeedback = useCallback(async (id: string, notes: string) => {
    const updated = await governanceService.updateUserFeedback(id, { status: 'RESOLVED', resolutionNotes: notes, resolvedBy: mockUsers[0].id });
    if (updated) {
      setUserFeedback(prev => prev.map(fb => fb.id === id ? updated : fb).filter(fb => fb.status === 'PENDING'));
    }
  }, []);

  const handleResolveAnomalyAlert = useCallback(async (id: string) => {
    const updated = await governanceService.updateAnomalyAlert(id, { status: 'RESOLVED', resolutionNotes: 'Manually reviewed and resolved.' });
    if (updated) {
      setAnomalyAlerts(prev => prev.map(alert => alert.id === id ? updated : alert).filter(alert => alert.status === 'ACTIVE'));
    }
  }, []);

  const filteredHumanReviewTasks = useMemo(() => humanReviewTasks.filter(task => task.status === 'PENDING'), [humanReviewTasks]);
  const activeAnomalyAlerts = useMemo(() => anomalyAlerts.filter(alert => alert.status === 'ACTIVE'), [anomalyAlerts]);
  const pendingUserFeedback = useMemo(() => userFeedback.filter(fb => fb.status === 'PENDING'), [userFeedback]);

  // Tab navigation for a rich application
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActionLogTable requests={requests} />
            <SystemHealthDashboard statusEntries={systemStatus} />
            <AnomalyAlertsViewer alerts={activeAnomalyAlerts} onResolve={handleResolveAnomalyAlert} />
            <HumanReviewDashboard tasks={filteredHumanReviewTasks} onUpdateTask={handleUpdateHumanReviewTask} />
          </div>
        );
      case 'principles':
        return <EthicalPrinciplesManager principles={ethicalPrinciples} onUpdate={handleUpdatePrinciple} />;
      case 'policies':
        return viewingPolicyHistoryFor ? (
          <PolicyVersionHistoryViewer policyId={viewingPolicyHistoryFor} onClose={() => setViewingPolicyHistoryFor(null)} />
        ) : (
          <PolicyRuleEditor
            policies={ethicalPolicies}
            principles={ethicalPrinciples}
            aiModels={aiModels}
            onUpdate={handleUpdatePolicy}
            onCreate={handleCreatePolicy}
            onViewHistory={setViewingPolicyHistoryFor}
          />
        );
      case 'models':
        return <AIModelProfileManager models={aiModels} onUpdate={handleUpdateModel} onCreate={handleCreateModel} />;
      case 'review':
        return <HumanReviewDashboard tasks={humanReviewTasks.filter(task => task.status === 'PENDING' || task.status === 'IN_REVIEW')} onUpdateTask={handleUpdateHumanReviewTask} />;
      case 'audit':
        return <AuditLogViewer logs={auditLogs} />;
      case 'reports':
        return <ComplianceReportGenerator reports={complianceReports} onGenerate={handleGenerateComplianceReport} />;
      case 'feedback':
        return <UserFeedbackViewer feedback={userFeedback} onResolve={handleResolveUserFeedback} />;
      case 'alerts':
        return <AnomalyAlertsViewer alerts={anomalyAlerts} onResolve={handleResolveAnomalyAlert} />;
      case 'settings':
        return <Card title="Settings">
          <p className="text-gray-400">Settings for Governor configuration, user management, and integrations would go here.</p>
          <InputField id="governorVersion" label="Governor Version" value="1.0.2-production" onChange={() => {}} disabled />
          <InputField id="lastUpdate" label="Last Policy Sync" value={new Date().toLocaleString()} onChange={() => {}} disabled />
        </Card>;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'principles', label: 'Principles', icon: '⚖️' },
    { id: 'policies', label: 'Policies', icon: '📜' },
    { id: 'models', label: 'AI Models', icon: '🤖' },
    { id: 'review', label: 'Human Review', icon: '👨‍⚖️', count: filteredHumanReviewTasks.length },
    { id: 'audit', label: 'Audit Trail', icon: '📝' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'feedback', label: 'User Feedback', icon: '💬', count: pendingUserFeedback.length },
    { id: 'alerts', label: 'Anomaly Alerts', icon: '🚨', count: activeAnomalyAlerts.length },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 p-4 shadow-lg flex flex-col">
        <h1 className="text-3xl font-bold mb-8 text-indigo-400">Ethical Governor</h1>
        <nav className="flex-grow">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // Reset history view when switching tabs
                if (item.id !== 'policies') setViewingPolicyHistoryFor(null);
              }}
              className={`flex items-center w-full px-4 py-2 my-2 rounded-md text-left text-lg font-medium transition-colors duration-200 ${activeTab === item.id ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {item.label}
              {item.count && item.count > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>&copy; 2023 Ethical AI Corp.</p>
          <p>Governor Version: 1.0.2</p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 capitalize text-white">{activeTab.replace('-', ' ')}</h2>
        {renderContent()}
      </main>
    </div>
  );
};

export default EthicalGovernorView;