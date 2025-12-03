// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useMemo } from 'react';
import type { OmniStructFormData } from '../../../services/omniStructService';

// Define expanded OmniStructFormData interface for comprehensive creation
// Assuming OmniStructFormData type from omniStructService can accept additional fields.
// If it cannot, this would imply a need to update the service contract.
// For the purpose of this file, we enhance the local data structure to capture more detail.
export interface ExpandedOmniStructFormData extends OmniStructFormData {
    name: string; // A concise name for the OmniStruct
    category: string; // e.g., 'Customer Support', 'IT Automation', 'Financial Process'
    priority: 'low' | 'medium' | 'high' | 'urgent'; // Urgency level
    expectedOutcome: string; // What specific outcome is expected upon completion
    dependencies: string; // Other OmniStructs or external systems this depends on (comma-separated)
    stakeholders: string; // Key individuals or teams involved/affected (comma-separated)
    tags: string; // Searchable keywords (comma-separated)
    versionNotes: string; // Notes for this specific version or iteration of the OmniStruct
    securityConsiderations: string; // Brief description of security aspects to consider
    performanceMetrics: string; // How performance will be measured
    complianceRequirements: string; // Regulatory or internal compliance needs
}

// Reusable Form Field Group Component
interface FormGroupProps {
    label: string;
    htmlFor: string;
    children: React.ReactNode;
    helpText?: string;
    error?: string;
    required?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({ label, htmlFor, children, helpText, error, required }) => (
    <div className="mb-4">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {helpText && <p className="text-xs text-text-tertiary mt-1">{helpText}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

// Reusable Select Input Component
interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
}

export const SelectInput: React.FC<SelectInputProps> = ({ options, ...props }) => (
    <select
        {...props}
        className="w-full mt-1 p-2 bg-background border border-border rounded-md text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
    >
        {options.map(option => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);

// Reusable TextInput component for consistency and future extensibility
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TextInput: React.FC<TextInputProps> = (props) => (
    <input
        type="text"
        {...props}
        className="w-full mt-1 p-2 bg-background border border-border rounded-md text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
    />
);

// Reusable TextAreaInput component
interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextAreaInput: React.FC<TextAreaInputProps> = (props) => (
    <textarea
        {...props}
        className="w-full mt-1 p-2 bg-background border border-border rounded-md text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
    />
);

interface OmniStructCreatorProps {
    onGenerate: (formData: OmniStructFormData) => Promise<void>; // Added Promise<void> for async operations
    isLoading?: boolean; // Optional prop to indicate if the generation process is ongoing externally
    initialData?: Partial<ExpandedOmniStructFormData>; // Optional initial data for editing existing or pre-filling
    onCancel?: () => void; // Optional cancel action
}

export const OmniStructCreator: React.FC<OmniStructCreatorProps> = ({ onGenerate, isLoading = false, initialData, onCancel }) => {
    const [formData, setFormData] = useState<ExpandedOmniStructFormData>(() => ({
        name: initialData?.name || 'New AI Customer Support Agent',
        purposeDesc: initialData?.purposeDesc || 'To build a scalable, AI-driven customer support chatbot capable of resolving common customer queries and escalating complex issues.',
        planMilestones: initialData?.planMilestones || 'phase1:Data Collection & Annotation; phase2:Model Training & Evaluation; phase3:Integration & Beta Launch; phase4:Production Deployment & Monitoring',
        instructionsSteps: initialData?.instructionsSteps || '1. Define NLU intents and entities.\n2. Collect and label conversational data.\n3. Choose and configure a suitable transformer-based model.\n4. Train the model with annotated data.\n5. Integrate with existing CRM and messaging platforms.\n6. Conduct UAT and A/B testing.\n7. Deploy the agent to production.',
        useCasesScenarios: initialData?.useCasesScenarios || '1. User asks for order status (resolved by querying fulfillment system).\n2. User requests a refund (agent initiates refund process or guides user).\n3. User has a technical question (agent provides documented solution or escalates to human support).\n4. User wants to change subscription plan (agent guides through options).',
        logicDesc: initialData?.logicDesc || 'The core logic employs a fine-tuned BERT model for natural language understanding (NLU) to interpret user intent and extract entities. Response generation leverages a combination of predefined responses for common intents and a generative model for more nuanced queries, backed by a knowledge base and integration APIs.',
        category: initialData?.category || 'Customer Support',
        priority: initialData?.priority || 'medium',
        expectedOutcome: initialData?.expectedOutcome || 'Reduce average customer response time by 50% and decrease human agent workload by 30% within 6 months of deployment.',
        dependencies: initialData?.dependencies || 'CRM System; Inventory Management API; Payment Gateway API; Internal Knowledge Base Service',
        stakeholders: initialData?.stakeholders || 'Customer Service Dept.; IT Operations; Product Management; Legal & Compliance',
        tags: initialData?.tags || 'AI; Chatbot; Automation; Customer Experience; NLU',
        versionNotes: initialData?.versionNotes || 'Initial prototype definition. Focus on core functionality and common use cases.',
        securityConsiderations: initialData?.securityConsiderations || 'Ensure PII is encrypted at rest and in transit. Implement robust access controls. Adhere to data retention policies.',
        performanceMetrics: initialData?.performanceMetrics || 'NLU accuracy; Average resolution time; Escalation rate; Customer satisfaction (CSAT) score.',
        complianceRequirements: initialData?.complianceRequirements || 'GDPR; CCPA; Internal data privacy policies; Industry-specific regulations (e.g., PCI DSS if handling payments directly).'
    }));

    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ExpandedOmniStructFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name as keyof ExpandedOmniStructFormData]) {
            setValidationErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [validationErrors]);

    const validateForm = useCallback((data: ExpandedOmniStructFormData): Partial<Record<keyof ExpandedOmniStructFormData, string>> => {
        const errors: Partial<Record<keyof ExpandedOmniStructFormData, string>> = {};
        if (!data.name.trim()) errors.name = 'OmniStruct Name is required.';
        if (!data.purposeDesc.trim()) errors.purposeDesc = 'Purpose description is required.';
        if (!data.planMilestones.trim()) errors.planMilestones = 'At least one milestone is required.';
        if (!data.instructionsSteps.trim()) errors.instructionsSteps = 'At least one instruction step is required.';
        if (!data.useCasesScenarios.trim()) errors.useCasesScenarios = 'At least one use case scenario is required.';
        if (!data.logicDesc.trim()) errors.logicDesc = 'Logic description is required.';
        if (!data.category.trim()) errors.category = 'Category is required.';
        if (!data.priority.trim()) errors.priority = 'Priority is required.';
        if (!data.expectedOutcome.trim()) errors.expectedOutcome = 'Expected outcome is required.';
        // Add more validation rules as needed for other fields
        return errors;
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            alert('Please correct the highlighted errors before generating.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Only send fields that match the OmniStructFormData from the service.
            // This ensures compatibility even if ExpandedOmniStructFormData has more fields.
            const dataToSend: OmniStructFormData = {
                purposeDesc: formData.purposeDesc,
                planMilestones: formData.planMilestones,
                instructionsSteps: formData.instructionsSteps,
                useCasesScenarios: formData.useCasesScenarios,
                logicDesc: formData.logicDesc,
                // If the service expects 'name', 'category', etc., those would be added here
                // For now, based on initial type, these are the core fields.
            };
            await onGenerate(dataToSend);
            // Optionally clear form or show success message
        } catch (error) {
            console.error("Failed to generate OmniStruct:", error);
            // Handle error (e.g., show error toast)
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onGenerate, validateForm]);

    const priorityOptions = useMemo(() => [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
    ], []);

    const categoryOptions = useMemo(() => [
        { value: '', label: 'Select a category...' },
        { value: 'Customer Support', label: 'Customer Support' },
        { value: 'IT Automation', label: 'IT Automation' },
        { value: 'Financial Process', label: 'Financial Process' },
        { value: 'Marketing Automation', label: 'Marketing Automation' },
        { value: 'Data Analysis', label: 'Data Analysis' },
        { value: 'Human Resources', label: 'Human Resources' },
        { value: 'Legal & Compliance', label: 'Legal & Compliance' },
        { value: 'Supply Chain', label: 'Supply Chain' },
        { value: 'Other', label: 'Other' },
    ], []);

    return (
        <div className="w-full max-w-5xl mx-auto bg-surface p-8 rounded-lg border border-border shadow-lg">
            <h2 className="text-3xl font-extrabold mb-8 text-text-primary text-center">Design Your Enterprise OmniStruct</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="bg-background p-6 rounded-md border border-border-light">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                        <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-semibold">1</span> Core Definition
                    </h3>
                    <FormGroup label="OmniStruct Name" htmlFor="name" helpText="A concise, descriptive name for your OmniStruct (e.g., 'Automated Invoice Processing Bot')." error={validationErrors.name} required>
                        <TextInput id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Automated Customer Onboarding Flow"/>
                    </FormGroup>
                    <FormGroup label="Category" htmlFor="category" helpText="Classify your OmniStruct for better organization and searchability." error={validationErrors.category} required>
                        <SelectInput id="category" name="category" value={formData.category} onChange={handleChange} options={categoryOptions}/>
                    </FormGroup>
                    <FormGroup label="Priority" htmlFor="priority" helpText="Indicate the urgency or importance of this OmniStruct's development." error={validationErrors.priority} required>
                        <SelectInput id="priority" name="priority" value={formData.priority} onChange={handleChange} options={priorityOptions}/>
                    </FormGroup>
                    <FormGroup label="Purpose Description" htmlFor="purposeDesc" helpText="Clearly articulate the primary goal and scope of this OmniStruct." error={validationErrors.purposeDesc} required>
                        <TextAreaInput id="purposeDesc" name="purposeDesc" value={formData.purposeDesc} onChange={handleChange} rows={3} placeholder="Describe what this OmniStruct aims to achieve."/>
                    </FormGroup>
                    <FormGroup label="Expected Outcome" htmlFor="expectedOutcome" helpText="What measurable results do you expect to see after implementing this OmniStruct?" error={validationErrors.expectedOutcome} required>
                        <TextAreaInput id="expectedOutcome" name="expectedOutcome" value={formData.expectedOutcome} onChange={handleChange} rows={2} placeholder="e.g., Reduce X by Y%, improve Z by N points."/>
                    </FormGroup>
                </section>

                <section className="bg-background p-6 rounded-md border border-border-light">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                        <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-semibold">2</span> Execution & Strategy
                    </h3>
                    <FormGroup label="Plan Milestones" htmlFor="planMilestones" helpText="Outline key stages or deliverables. Separate with semicolons." error={validationErrors.planMilestones} required>
                        <TextAreaInput id="planMilestones" name="planMilestones" value={formData.planMilestones} onChange={handleChange} rows={3} placeholder="e.g., Phase 1: Requirement Gathering; Phase 2: System Design; Phase 3: Development; Phase 4: Testing; Phase 5: Deployment."/>
                    </FormGroup>
                    <FormGroup label="Instructions/Steps" htmlFor="instructionsSteps" helpText="Provide a detailed, step-by-step guide for implementation. One step per line." error={validationErrors.instructionsSteps} required>
                        <TextAreaInput id="instructionsSteps" name="instructionsSteps" value={formData.instructionsSteps} onChange={handleChange} rows={6} placeholder="1. Initialize project repository.\n2. Configure API endpoints.\n3. Develop business logic modules.\n4. Write comprehensive unit tests."/>
                    </FormGroup>
                    <FormGroup label="Logic Description" htmlFor="logicDesc" helpText="Explain the underlying architectural design and how key components interact." error={validationErrors.logicDesc} required>
                        <TextAreaInput id="logicDesc" name="logicDesc" value={formData.logicDesc} onChange={handleChange} rows={4} placeholder="e.g., Employs a microservices architecture. Data flows from X to Y, processed by Z, and stored in A."/>
                    </FormGroup>
                    <FormGroup label="Dependencies" htmlFor="dependencies" helpText="List any other systems, services, or OmniStructs this one relies on. Separate with semicolons." error={validationErrors.dependencies}>
                        <TextInput id="dependencies" name="dependencies" value={formData.dependencies} onChange={handleChange} placeholder="e.g., User Authentication Service; Payment Gateway; Data Warehouse API"/>
                    </FormGroup>
                </section>

                <section className="bg-background p-6 rounded-md border border-border-light">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                        <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-semibold">3</span> Context & Compliance
                    </h3>
                    <FormGroup label="Use Cases/Scenarios" htmlFor="useCasesScenarios" helpText="Describe typical user interactions or operational scenarios this OmniStruct will handle. One scenario per line." error={validationErrors.useCasesScenarios} required>
                        <TextAreaInput id="useCasesScenarios" name="useCasesScenarios" value={formData.useCasesScenarios} onChange={handleChange} rows={5} placeholder="1. User submits a new expense report.\n2. System detects a fraudulent transaction.\n3. Weekly sales report generation."/>
                    </FormGroup>
                    <FormGroup label="Stakeholders" htmlFor="stakeholders" helpText="Identify key individuals, teams, or departments affected by or involved in this OmniStruct. Separate with semicolons." error={validationErrors.stakeholders}>
                        <TextInput id="stakeholders" name="stakeholders" value={formData.stakeholders} onChange={handleChange} placeholder="e.g., Finance Team; IT Security; Regional Managers"/>
                    </FormGroup>
                    <FormGroup label="Security Considerations" htmlFor="securityConsiderations" helpText="Highlight any crucial security measures, data privacy, or access control requirements." error={validationErrors.securityConsiderations}>
                        <TextAreaInput id="securityConsiderations" name="securityConsiderations" value={formData.securityConsiderations} onChange={handleChange} rows={3} placeholder="e.g., Data encryption; Role-based access; Regular security audits."/>
                    </FormGroup>
                    <FormGroup label="Performance Metrics" htmlFor="performanceMetrics" helpText="Define how the success and efficiency of this OmniStruct will be measured." error={validationErrors.performanceMetrics}>
                        <TextAreaInput id="performanceMetrics" name="performanceMetrics" value={formData.performanceMetrics} onChange={handleChange} rows={2} placeholder="e.g., Latency; Throughput; Error rate; Resource utilization."/>
                    </FormGroup>
                    <FormGroup label="Compliance Requirements" htmlFor="complianceRequirements" helpText="List any relevant regulatory, legal, or internal compliance standards." error={validationErrors.complianceRequirements}>
                        <TextAreaInput id="complianceRequirements" name="complianceRequirements" value={formData.complianceRequirements} onChange={handleChange} rows={2} placeholder="e.g., GDPR; HIPAA; SOX; ISO 27001."/>
                    </FormGroup>
                </section>

                <section className="bg-background p-6 rounded-md border border-border-light">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                        <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-semibold">4</span> Metadata & Versioning
                    </h3>
                    <FormGroup label="Tags" htmlFor="tags" helpText="Add keywords to make this OmniStruct easily discoverable. Separate with semicolons." error={validationErrors.tags}>
                        <TextInput id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., AI; Automation; Finance; Workflow"/>
                    </FormGroup>
                    <FormGroup label="Version Notes" htmlFor="versionNotes" helpText="Brief notes for this version or any specific context about this creation instance." error={validationErrors.versionNotes}>
                        <TextAreaInput id="versionNotes" name="versionNotes" value={formData.versionNotes} onChange={handleChange} rows={2} placeholder="e.g., Initial draft for stakeholder review. Focus on core automation."/>
                    </FormGroup>
                </section>

                <div className="pt-4 flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary px-6 py-3 text-lg font-semibold w-full sm:w-auto"
                            disabled={isSubmitting || isLoading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="btn-tertiary px-6 py-3 text-lg font-semibold w-full sm:w-auto"
                        disabled={isSubmitting || isLoading}
                    >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <button
                        type="submit"
                        className="btn-primary px-8 py-3 text-lg font-bold w-full sm:w-auto flex items-center justify-center"
                        disabled={isSubmitting || isLoading}
                    >
                        {(isSubmitting || isLoading) && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSubmitting ? 'Generating...' : 'Generate OmniStruct'}
                    </button>
                </div>
            </form>

            {showPreview && (
                <div className="mt-10 bg-background p-8 rounded-lg border border-border shadow-inner">
                    <h3 className="text-2xl font-bold text-text-primary mb-6 border-b border-border-light pb-3">OmniStruct Preview</h3>
                    <div className="space-y-4 text-text-secondary">
                        <p><strong>Name:</strong> <span className="text-text-primary">{formData.name || 'N/A'}</span></p>
                        <p><strong>Category:</strong> <span className="text-text-primary">{formData.category || 'N/A'}</span></p>
                        <p><strong>Priority:</strong> <span className="text-text-primary">{formData.priority || 'N/A'}</span></p>
                        <p><strong>Purpose:</strong> <span className="text-text-primary">{formData.purposeDesc || 'N/A'}</span></p>
                        <p><strong>Expected Outcome:</strong> <span className="text-text-primary">{formData.expectedOutcome || 'N/A'}</span></p>
                        <div>
                            <strong className="block mb-1">Plan Milestones:</strong>
                            <ul className="list-disc list-inside ml-4 text-text-primary">
                                {(formData.planMilestones?.split(';') || []).filter(s => s.trim()).map((milestone, i) => (
                                    <li key={i}>{milestone.trim()}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <strong className="block mb-1">Instructions:</strong>
                            <ol className="list-decimal list-inside ml-4 text-text-primary">
                                {(formData.instructionsSteps?.split('\n') || []).filter(s => s.trim()).map((step, i) => (
                                    <li key={i}>{step.trim()}</li>
                                ))}
                            </ol>
                        </div>
                        <div>
                            <strong className="block mb-1">Use Cases/Scenarios:</strong>
                            <ul className="list-disc list-inside ml-4 text-text-primary">
                                {(formData.useCasesScenarios?.split('\n') || []).filter(s => s.trim()).map((scenario, i) => (
                                    <li key={i}>{scenario.trim()}</li>
                                ))}
                            </ul>
                        </div>
                        <p><strong>Logic Description:</strong> <span className="text-text-primary">{formData.logicDesc || 'N/A'}</span></p>
                        <p><strong>Dependencies:</strong> <span className="text-text-primary">{formData.dependencies || 'N/A'}</span></p>
                        <p><strong>Stakeholders:</strong> <span className="text-text-primary">{formData.stakeholders || 'N/A'}</span></p>
                        <p><strong>Tags:</strong> <span className="text-text-primary">{formData.tags || 'N/A'}</span></p>
                        <p><strong>Version Notes:</strong> <span className="text-text-primary">{formData.versionNotes || 'N/A'}</span></p>
                        <p><strong>Security Considerations:</strong> <span className="text-text-primary">{formData.securityConsiderations || 'N/A'}</span></p>
                        <p><strong>Performance Metrics:</strong> <span className="text-text-primary">{formData.performanceMetrics || 'N/A'}</span></p>
                        <p><strong>Compliance Requirements:</strong> <span className="text-text-primary">{formData.complianceRequirements || 'N/A'}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OmniStructCreator;