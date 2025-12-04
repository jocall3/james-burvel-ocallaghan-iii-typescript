/**
 * This module implements a sophisticated Transaction Automation Engine, providing a user interface
 * for defining, managing, and applying business-critical rules to financial transactions.
 * Business value: This engine transforms manual, error-prone, and time-consuming transaction processing
 * into an automated, highly efficient, and auditable workflow. It enables enterprises to achieve
 * significant cost reductions by minimizing human intervention in categorization, tagging, and reconciliation,
 * while accelerating financial closing cycles. By introducing real-time processing capabilities,
 * it unlocks new revenue opportunities through faster capital deployment and improved liquidity management.
 * The integrated AI suggestions further enhance operational velocity and reduce setup friction,
 * making this component a foundational pillar for intelligent financial operations and regulatory compliance.
 * This system provides a programmable layer for financial operations, crucial for agentic AI and
 * real-time payment orchestration within a commercial-grade infrastructure.
 */
import React, { useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { FlowMatrixTransaction } from '../../types';

/**
 * @description Represents an automation rule for transaction processing.
 * This rule engine is central to applying business logic across various financial operations,
 * supporting advanced use cases from simple categorization to complex fraud flagging and multi-rail
 * payment routing decisions. It defines conditions and actions that can be applied to transactions
 * to automate workflows, ensure compliance, and enhance operational efficiency.
 */
export interface AutomationRule {
    id: string;
    name: string;
    description?: string;
    type: 'categorization' | 'tagging' | 'flagging' | 'reconciliation' | 'review' | 'routing' | 'risk_scoring';
    condition: {
        field: 'description' | 'merchantDetails.name' | 'amount' | 'category' | 'date' | 'tags' | 'isReconciled' | 'isReviewed' | 'tokenRail' | 'riskScore' | 'type';
        operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'isTrue' | 'isFalse' | 'notContains' | 'isLessThanOrEqual' | 'isGreaterThanOrEqual' | 'exists' | 'doesNotExist' | 'notEquals' | 'isEmpty' | 'isNotEmpty' | 'containsAny' | 'containsAll';
        value: string | number | boolean | null;
    };
    action: {
        type: 'setCategory' | 'addTag' | 'removeTag' | 'markReconciled' | 'setReviewed' | 'setRiskScore' | 'addFlag' | 'routeToRail';
        value: string | boolean | number;
    };
    isEnabled: boolean;
    priority: number; // Lower number = higher priority (e.g., 10 is higher than 100)
    creatorId: string; // Identifier of the user or agent who created the rule, for governance and auditability
    createdAt: string; // ISO timestamp of rule creation
    updatedAt: string; // ISO timestamp of last rule modification
    status: 'active' | 'draft' | 'archived'; // Lifecycle status for rule management
    scope: 'personal' | 'team' | 'organization'; // Access control and applicability scope
}

/**
 * @description Represents an AI-generated suggestion for an automation rule.
 * These suggestions are provided by an agentic AI system, analyzing transactional data
 * to identify patterns and propose new rules to optimize operations.
 */
export interface AISuggestion {
    id: string;
    suggestedRule: Partial<AutomationRule>;
    confidence: number; // A score indicating the AI's certainty in the suggestion (0.0 - 1.0)
    reason: string; // Explanation from the AI for the suggestion
    timestamp: string;
    status: 'pending' | 'accepted' | 'rejected';
}

/**
 * @description Options for condition fields available in the rule builder.
 * This array maps internal field names to user-friendly labels and specifies their data type,
 * guiding the UI for appropriate operator and value inputs.
 */
const ruleConditionsOptions = [
    { label: 'Description', value: 'description', type: 'string' },
    { label: 'Merchant Name', value: 'merchantDetails.name', type: 'string' },
    { label: 'Amount', value: 'amount', type: 'number' },
    { label: 'Category', value: 'category', type: 'string' },
    { label: 'Tags', value: 'tags', type: 'string_array' },
    { label: 'Is Reconciled', value: 'isReconciled', type: 'boolean' },
    { label: 'Is Reviewed', value: 'isReviewed', type: 'boolean' },
    { label: 'Token Rail', value: 'tokenRail', type: 'string' },
    { label: 'Risk Score', value: 'riskScore', type: 'number' },
    { label: 'Transaction Type', value: 'type', type: 'string' },
];

/**
 * @description Operators dynamically provided based on the selected condition field's data type.
 * This object ensures that only relevant operators are presented to the user,
 * improving usability and preventing the creation of invalid rules.
 */
const ruleOperators = {
    'string': [
        { label: 'Contains', value: 'contains' },
        { label: 'Equals (case-insensitive)', value: 'equals' },
        { label: 'Not Equals (case-insensitive)', value: 'notEquals' },
        { label: 'Starts With', value: 'startsWith' },
        { label: 'Ends With', value: 'endsWith' },
        { label: 'Does Not Contain', value: 'notContains' },
        { label: 'Is Empty', value: 'equals', specialValue: '' },
        { label: 'Is Not Empty', value: 'notEquals', specialValue: '' },
        { label: 'Exists', value: 'exists' },
        { label: 'Does Not Exist', value: 'doesNotExist' },
    ],
    'number': [
        { label: 'Greater Than (>)', value: 'greaterThan' },
        { label: 'Less Than (<)', value: 'lessThan' },
        { label: 'Equals (=)', value: 'equals' },
        { label: 'Greater Than or Equal (>=)', value: 'isGreaterThanOrEqual' },
        { label: 'Less Than or Equal (<=)', value: 'isLessThanOrEqual' },
        { label: 'Exists', value: 'exists' },
        { label: 'Does Not Exist', value: 'doesNotExist' },
    ],
    'boolean': [
        { label: 'Is True', value: 'isTrue' },
        { label: 'Is False', value: 'isFalse' },
        { label: 'Exists', value: 'exists' },
        { label: 'Does Not Exist', value: 'doesNotExist' },
    ],
    'string_array': [
        { label: 'Contains Any Of (comma-separated)', value: 'containsAny' },
        { label: 'Contains All Of (comma-separated)', value: 'containsAll' },
        { label: 'Does Not Contain Any Of', value: 'notContains' },
        { label: 'Is Empty', value: 'isEmpty' },
        { label: 'Is Not Empty', value: 'isNotEmpty' },
        { label: 'Exists', value: 'exists' },
        { label: 'Does Not Exist', value: 'doesNotExist' },
    ]
};

/**
 * @description Mapping of rule types to available action options.
 * This ensures that actions are semantically consistent with the rule's primary purpose,
 * streamlining the rule creation process and enforcing business logic constraints.
 */
const ruleTypeToActionMap = {
    'categorization': [{ label: 'Set Category To', value: 'setCategory' }],
    'tagging': [{ label: 'Add Tag', value: 'addTag' }, { label: 'Remove Tag', value: 'removeTag' }],
    'flagging': [{ label: 'Add Flag (e.g., "Fraud")', value: 'addFlag' }],
    'reconciliation': [{ label: 'Mark Reconciled As', value: 'markReconciled' }],
    'review': [{ label: 'Mark Reviewed As', value: 'setReviewed' }],
    'risk_scoring': [{ label: 'Set Risk Score To', value: 'setRiskScore' }],
    'routing': [{ label: 'Route Transaction To Rail', value: 'routeToRail' }],
};

/**
 * @description The TransactionAutomation component provides a robust interface for defining
 * and managing business-critical automation rules for financial transactions.
 * It enables enterprises to streamline operations, enforce governance policies,
 * and integrate agentic AI capabilities for predictive financial management. This component
 * is essential for orchestrating complex financial workflows, enhancing fraud detection,
 * and optimizing transaction routing across various token rails, all contributing to
 * operational excellence and competitive advantage.
 */
export const TransactionAutomation: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("TransactionAutomation must be within a DataProvider");
    }
    // Assuming DataContext now provides userId for governance and auditability
    const { transactions, updateTransaction, userId } = context;

    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
        isEnabled: true,
        type: 'categorization',
        priority: 50,
        condition: { field: 'description', operator: 'contains', value: '' },
        action: { type: 'setCategory', value: '' },
        creatorId: userId || 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        scope: 'personal'
    });
    const [editRuleId, setEditRuleId] = useState<string | null>(null);
    const [previewChanges, setPreviewChanges] = useState<FlowMatrixTransaction[]>([]);
    const [isApplyingRules, setIsApplyingRules] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);


    useEffect(() => {
        const now = new Date().toISOString();
        const initialCreator = userId || 'system';
        setRules([
            {
                id: 'rule-1',
                name: 'Auto-categorize Starbucks',
                description: 'Categorizes all Starbucks transactions as Coffee.',
                type: 'categorization',
                isEnabled: true,
                priority: 10,
                condition: { field: 'description', operator: 'contains', value: 'STARBUCKS' },
                action: { type: 'setCategory', value: 'Coffee' },
                creatorId: initialCreator,
                createdAt: now,
                updatedAt: now,
                status: 'active',
                scope: 'personal'
            },
            {
                id: 'rule-2',
                name: 'Flag large expenses (> $500)',
                description: 'Flags transactions over $500 for review.',
                type: 'flagging',
                isEnabled: true,
                priority: 20,
                condition: { field: 'amount', operator: 'greaterThan', value: 500 },
                action: { type: 'addFlag', value: 'LargeExpense' },
                creatorId: initialCreator,
                createdAt: now,
                updatedAt: now,
                status: 'active',
                scope: 'personal'
            },
            {
                id: 'rule-3',
                name: 'Mark Netflix as subscription',
                description: 'Adds "Subscription" tag to Netflix transactions.',
                type: 'tagging',
                isEnabled: true,
                priority: 15,
                condition: { field: 'description', operator: 'contains', value: 'NETFLIX' },
                action: { type: 'addTag', value: 'Subscription' },
                creatorId: initialCreator,
                createdAt: now,
                updatedAt: now,
                status: 'active',
                scope: 'personal'
            },
            {
                id: 'rule-4',
                name: 'Mark income as reviewed',
                description: 'Automatically marks all incoming transactions as reviewed.',
                type: 'review',
                isEnabled: true,
                priority: 30,
                condition: { field: 'type', operator: 'equals', value: 'income' },
                action: { type: 'setReviewed', value: true },
                creatorId: initialCreator,
                createdAt: now,
                updatedAt: now,
                status: 'active',
                scope: 'personal'
            },
            {
                id: 'rule-5',
                name: 'Route high-value payments to Fast Rail',
                description: 'Directs payments over $1000 to the "rail_fast" token rail.',
                type: 'routing',
                isEnabled: true,
                priority: 5,
                condition: { field: 'amount', operator: 'greaterThan', value: 1000 },
                action: { type: 'routeToRail', value: 'rail_fast' },
                creatorId: initialCreator,
                createdAt: now,
                updatedAt: now,
                status: 'active',
                scope: 'organization'
            },
        ]);
    }, [userId]);

    /**
     * @description Memoized getter for the currently selected condition field's metadata.
     * This ensures the UI accurately reflects the expected input types for operators and values.
     */
    const getConditionFieldInfo = useMemo(() => {
        return ruleConditionsOptions.find(opt => opt.value === newRule.condition?.field) || { label: '', value: '', type: 'string' };
    }, [newRule.condition?.field]);

    /**
     * @description Memoized getter for action options based on the selected rule type.
     * This dynamically adjusts the available actions in the UI, ensuring logical consistency.
     */
    const getActionTypeOptions = useMemo(() => {
        const selectedType = newRule.type as keyof typeof ruleTypeToActionMap;
        return ruleTypeToActionMap[selectedType] || [];
    }, [newRule.type]);

    useEffect(() => {
        if (newRule.action && newRule.type && !getActionTypeOptions.some(opt => opt.value === newRule.action?.type)) {
            setNewRule(prev => ({
                ...prev,
                action: {
                    type: getActionTypeOptions[0]?.value || '',
                    value: ''
                }
            }));
        } else if (!newRule.action?.type && getActionTypeOptions.length > 0) {
            setNewRule(prev => ({
                ...prev,
                action: {
                    type: getActionTypeOptions[0].value,
                    value: ''
                }
            }));
        }
    }, [newRule.type, newRule.action, getActionTypeOptions]);

    /**
     * @description Handles changes to the new rule form fields.
     * This function updates the `newRule` state, dynamically adjusting related fields
     * like operators and action values based on user selections to maintain rule validity.
     * It also ensures timestamps are updated for auditability.
     */
    const handleNewRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setNewRule(prev => {
            const updatedRule = { ...prev, updatedAt: new Date().toISOString() };

            if (name.startsWith('condition.')) {
                const fieldName = name.split('.')[1];
                if (!updatedRule.condition) updatedRule.condition = { field: 'description', operator: 'contains', value: '' };

                if (fieldName === 'field') {
                    updatedRule.condition.field = value as AutomationRule['condition']['field'];
                    const newFieldType = ruleConditionsOptions.find(opt => opt.value === value)?.type || 'string';
                    // Reset operator and value based on new field type
                    if (newFieldType === 'string') updatedRule.condition.operator = 'contains';
                    else if (newFieldType === 'number') updatedRule.condition.operator = 'greaterThan';
                    else if (newFieldType === 'boolean') updatedRule.condition.operator = 'isTrue';
                    else if (newFieldType === 'string_array') updatedRule.condition.operator = 'containsAny';
                    updatedRule.condition.value = '';
                } else if (fieldName === 'operator') {
                    updatedRule.condition.operator = value as AutomationRule['condition']['operator'];
                    // If operator implies null value (e.g., 'exists', 'isEmpty'), set value to null
                    if (['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(value)) {
                        updatedRule.condition.value = null;
                    } else if (ruleOperators[getConditionFieldInfo.type as keyof typeof ruleOperators]?.find(op => op.value === value)?.specialValue !== undefined) {
                        updatedRule.condition.value = ruleOperators[getConditionFieldInfo.type as keyof typeof ruleOperators]?.find(op => op.value === value)?.specialValue;
                    } else if (updatedRule.condition.value === null) {
                        updatedRule.condition.value = getConditionFieldInfo.type === 'number' ? 0 : '';
                    }
                } else if (fieldName === 'value') {
                    if (getConditionFieldInfo.type === 'number') {
                        updatedRule.condition.value = parseFloat(value) || 0;
                    } else if (getConditionFieldInfo.type === 'boolean') {
                        updatedRule.condition.value = value === 'true';
                    } else {
                        updatedRule.condition.value = value;
                    }
                }
            } else if (name.startsWith('action.')) {
                const fieldName = name.split('.')[1];
                if (!updatedRule.action) updatedRule.action = { type: 'setCategory', value: '' };

                if (fieldName === 'type') {
                    updatedRule.action.type = value as AutomationRule['action']['type'];
                    // Reset action value default based on new action type
                    if (value === 'markReconciled' || value === 'setReviewed') {
                        updatedRule.action.value = true;
                    } else if (value === 'setRiskScore') {
                        updatedRule.action.value = 0;
                    } else {
                        updatedRule.action.value = '';
                    }
                } else if (fieldName === 'value') {
                     if (updatedRule.action.type === 'markReconciled' || updatedRule.action.type === 'setReviewed') {
                        updatedRule.action.value = value === 'true';
                    } else if (updatedRule.action.type === 'setRiskScore') {
                        updatedRule.action.value = parseFloat(value) || 0;
                    } else {
                        updatedRule.action.value = value;
                    }
                }
            } else if (name === 'isEnabled') {
                updatedRule.isEnabled = checked;
            } else if (name === 'priority') {
                updatedRule.priority = parseInt(value, 10) || 50;
            } else if (name === 'status') {
                updatedRule.status = value as AutomationRule['status'];
            } else if (name === 'scope') {
                updatedRule.scope = value as AutomationRule['scope'];
            } else {
                (updatedRule as any)[name] = value;
            }
            return updatedRule;
        });
    };

    /**
     * @description Adds a new rule or updates an existing rule in the system.
     * This function performs input validation and updates the state of `rules`,
     * ensuring proper lifecycle management of automation policies.
     */
    const handleAddUpdateRule = useCallback(() => {
        if (!newRule.name || !newRule.condition?.field || !newRule.action?.type) {
            alert('Please fill all required rule fields.');
            return;
        }

        const now = new Date().toISOString();
        const ruleToSave: AutomationRule = {
            id: editRuleId || `rule-${Date.now()}`,
            name: newRule.name,
            description: newRule.description || '',
            type: newRule.type || 'categorization',
            isEnabled: newRule.isEnabled ?? true,
            priority: newRule.priority ?? 50,
            condition: newRule.condition as AutomationRule['condition'],
            action: newRule.action as AutomationRule['action'],
            creatorId: newRule.creatorId || userId || 'system',
            createdAt: newRule.createdAt || now,
            updatedAt: now,
            status: newRule.status || 'active',
            scope: newRule.scope || 'personal'
        };

        if (editRuleId) {
            setRules(prev => prev.map(r => r.id === editRuleId ? ruleToSave : r));
        } else {
            setRules(prev => [...prev, ruleToSave]);
        }
        setEditRuleId(null);
        setNewRule({
            isEnabled: true,
            type: 'categorization',
            priority: 50,
            condition: { field: 'description', operator: 'contains', value: '' },
            action: { type: 'setCategory', value: '' },
            creatorId: userId || 'system',
            createdAt: now,
            updatedAt: now,
            status: 'active',
            scope: 'personal'
        });
    }, [editRuleId, newRule, userId]);

    /**
     * @description Deletes an automation rule from the system.
     * This function ensures that outdated or incorrect rules can be promptly removed,
     * maintaining the integrity of the automated processes.
     * @param id The ID of the rule to delete.
     */
    const handleDeleteRule = useCallback((id: string) => {
        setRules(prev => prev.filter(rule => rule.id !== id));
    }, []);

    /**
     * @description Sets the selected rule for editing.
     * This facilitates modifications to existing rules, allowing for continuous refinement
     * of automation logic without recreating rules from scratch.
     * @param rule The automation rule to edit.
     */
    const handleEditRule = useCallback((rule: AutomationRule) => {
        setNewRule(rule);
        setEditRuleId(rule.id);
    }, []);

    /**
     * @description Evaluates if a transaction meets the specified condition.
     * This core function enables the rule engine to intelligently filter and target transactions
     * for automated actions, supporting various data types and operators for flexible matching.
     * It's critical for precise application of business logic and preventing unintended operations.
     * @param tx The transaction to evaluate.
     * @param condition The automation rule condition.
     * @returns True if the transaction meets the condition, false otherwise.
     */
    const evaluateCondition = (tx: FlowMatrixTransaction, condition: AutomationRule['condition']): boolean => {
        let fieldValue: any;
        if (condition.field.includes('.')) {
            const [parent, child] = condition.field.split('.');
            fieldValue = (tx as any)[parent]?.[child];
        } else {
            fieldValue = (tx as any)[condition.field];
        }

        const value = condition.value;
        const conditionOperator = condition.operator;
        const conditionFieldType = getConditionFieldInfo.type;

        // Handle existence checks first, regardless of field type
        if (conditionOperator === 'exists') {
            return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
        }
        if (conditionOperator === 'doesNotExist') {
            return fieldValue === undefined || fieldValue === null || fieldValue === '';
        }

        // Special handling for array fields (e.g., 'tags')
        if (conditionFieldType === 'string_array') {
            const arrayValue = Array.isArray(fieldValue) ? fieldValue : [];

            if (conditionOperator === 'isEmpty') {
                return arrayValue.length === 0;
            }
            if (conditionOperator === 'isNotEmpty') {
                return arrayValue.length > 0;
            }

            const searchValues = String(value).toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
            if (searchValues.length === 0 && ['containsAny', 'containsAll', 'notContains'].includes(conditionOperator)) return false; // Edge case for empty search

            switch (conditionOperator) {
                case 'containsAny':
                    return searchValues.some(sv => arrayValue.some(tag => String(tag).toLowerCase().includes(sv)));
                case 'containsAll':
                    return searchValues.every(sv => arrayValue.some(tag => String(tag).toLowerCase() === sv));
                case 'notContains':
                    return searchValues.every(sv => !arrayValue.some(tag => String(tag).toLowerCase().includes(sv)));
                default:
                    return false;
            }
        }

        // Handle primitive types
        switch (conditionOperator) {
            case 'contains':
                return typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.toLowerCase().includes(value.toLowerCase());
            case 'equals':
                if (typeof fieldValue === 'string' && typeof value === 'string') {
                    return fieldValue.toLowerCase() === value.toLowerCase();
                }
                return fieldValue === value;
            case 'notEquals':
                if (typeof fieldValue === 'string' && typeof value === 'string') {
                    return fieldValue.toLowerCase() !== value.toLowerCase();
                }
                return fieldValue !== value;
            case 'startsWith':
                return typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.toLowerCase().startsWith(value.toLowerCase());
            case 'endsWith':
                return typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.toLowerCase().endsWith(value.toLowerCase());
            case 'notContains':
                return typeof fieldValue === 'string' && typeof value === 'string' && !fieldValue.toLowerCase().includes(value.toLowerCase());
            case 'greaterThan':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value;
            case 'lessThan':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value;
            case 'isGreaterThanOrEqual':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue >= value;
            case 'isLessThanOrEqual':
                return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue <= value;
            case 'isTrue':
                return fieldValue === true;
            case 'isFalse':
                return fieldValue === false;
            default:
                console.warn(`Unknown or unsupported operator: ${conditionOperator}`);
                return false;
        }
    };

    /**
     * @description Applies a specific automation rule action to a transaction.
     * This function mutates a transaction based on the rule's action, ensuring atomicity
     * for each update and creating a comprehensive audit trail for traceability and compliance.
     * It handles various action types, from simple data modifications to complex flagging and routing indicators,
     * directly supporting the token rails and digital identity architecture.
     * @param tx The transaction to apply the action to.
     * @param rule The automation rule defining the action.
     * @returns A new transaction object with the applied action.
     */
    const applyRuleToAction = (tx: FlowMatrixTransaction, rule: AutomationRule): FlowMatrixTransaction => {
        const newTx = { ...tx };
        const { action } = rule;

        const addAuditEntry = (actionType: string, details: string) => {
            newTx.auditLog = [...(newTx.auditLog || []), {
                timestamp: new Date().toISOString(),
                userId: `Automation Engine (Rule: ${rule.name})`, // Attributing changes to the rule for granular audit
                action: actionType,
                details: details
            }];
        };

        switch (action.type) {
            case 'setCategory':
                if (typeof action.value === 'string' && newTx.category !== action.value) {
                    addAuditEntry('Categorized', `Category changed from '${newTx.category || 'N/A'}' to '${action.value}'`);
                    newTx.category = action.value;
                }
                break;
            case 'addTag':
                if (typeof action.value === 'string') {
                    newTx.tags = newTx.tags ? [...newTx.tags] : []; // Ensure mutable copy
                    if (!newTx.tags.includes(action.value)) {
                        newTx.tags.push(action.value);
                        addAuditEntry('Tagged', `Added tag: '${action.value}'`);
                    }
                }
                break;
            case 'removeTag':
                if (typeof action.value === 'string' && newTx.tags) {
                    const initialTagsLength = newTx.tags.length;
                    newTx.tags = newTx.tags.filter(tag => tag !== action.value);
                    if (newTx.tags.length < initialTagsLength) {
                         addAuditEntry('Tagged', `Removed tag: '${action.value}'`);
                    }
                }
                break;
            case 'addFlag':
                if (typeof action.value === 'string') {
                    const flagTag = `FLAG:${action.value}`;
                    newTx.tags = newTx.tags ? [...newTx.tags] : [];
                    if (!newTx.tags.includes(flagTag)) {
                        newTx.tags.push(flagTag);
                        addAuditEntry('Flagged', `Added flag: '${action.value}'`);
                    }
                }
                break;
            case 'markReconciled':
                if (typeof action.value === 'boolean' && newTx.isReconciled !== action.value) {
                    addAuditEntry('Reconciled', `Set reconciled status to '${action.value}'`);
                    newTx.isReconciled = action.value;
                }
                break;
            case 'setReviewed':
                if (typeof action.value === 'boolean' && newTx.isReviewed !== action.value) {
                    addAuditEntry('Reviewed', `Set reviewed status to '${action.value}'`);
                    newTx.isReviewed = action.value;
                }
                break;
            case 'setRiskScore':
                if (typeof action.value === 'number' && newTx.riskScore !== action.value) {
                    addAuditEntry('Risk Scored', `Set risk score to '${action.value}' (Previous: ${newTx.riskScore || 'N/A'})`);
                    newTx.riskScore = action.value;
                }
                break;
            case 'routeToRail':
                if (typeof action.value === 'string' && newTx.tokenRail !== action.value) {
                    addAuditEntry('Routing', `Suggested routing to rail: '${action.value}' (Previous: ${newTx.tokenRail || 'N/A'})`);
                    newTx.tokenRail = action.value;
                }
                break;
            default:
                console.warn(`Unhandled action type: ${action.type}`);
        }
        return newTx;
    };

    /**
     * @description Generates a preview of how applying all active automation rules would impact transactions.
     * This function provides a critical 'what-if' analysis, enabling users to visualize changes
     * before committing them, thereby preventing unintended modifications and ensuring confidence
     * in automated processes. This visual feedback is crucial for governance and risk management.
     */
    const previewAutomatedChanges = useCallback(() => {
        let changedTransactions: FlowMatrixTransaction[] = [];
        const sortedRules = [...rules].filter(r => r.isEnabled && r.status === 'active').sort((a, b) => (a.priority || 50) - (b.priority || 50));

        transactions.forEach(originalTx => {
            let tempTx: FlowMatrixTransaction = { ...originalTx };
            if (originalTx.tags) tempTx.tags = [...originalTx.tags];
            if (originalTx.auditLog) tempTx.auditLog = [...originalTx.auditLog];

            const originalTxForComparison = JSON.stringify({ ...originalTx, auditLog: undefined });

            for (const rule of sortedRules) {
                if (evaluateCondition(tempTx, rule.condition)) {
                    tempTx = applyRuleToAction(tempTx, rule);
                }
            }

            if (JSON.stringify({ ...tempTx, auditLog: undefined }) !== originalTxForComparison) {
                changedTransactions.push({ ...tempTx, id: originalTx.id + '-preview' });
            }
        });
        setPreviewChanges(changedTransactions);
    }, [rules, transactions]);

    /**
     * @description Applies all active automation rules to the entire set of transactions.
     * This function orchestrates the mass application of business logic, ensuring transactional
     * integrity by updating each eligible transaction and logging the changes. It's a key
     * operational component for maintaining data consistency and automating repetitive tasks,
     * directly influencing the efficiency and auditability of the payments infrastructure.
     */
    const applyAutomatedRules = useCallback(async () => {
        setIsApplyingRules(true);
        const sortedRules = [...rules].filter(r => r.isEnabled && r.status === 'active').sort((a, b) => (a.priority || 50) - (b.priority || 50));
        const transactionsToUpdate: FlowMatrixTransaction[] = [];
        let totalChanges = 0;

        for (const originalTx of transactions) {
            let tempTx: FlowMatrixTransaction = { ...originalTx };
            if (originalTx.tags) tempTx.tags = [...originalTx.tags];
            if (originalTx.auditLog) tempTx.auditLog = [...originalTx.auditLog];

            let hasChanged = false;
            const originalTxComparisonString = JSON.stringify({ ...originalTx, auditLog: undefined });

            for (const rule of sortedRules) {
                if (evaluateCondition(tempTx, rule.condition)) {
                    const beforeRuleApplication = JSON.stringify(tempTx);
                    tempTx = applyRuleToAction(tempTx, rule);
                    if (JSON.stringify(tempTx) !== beforeRuleApplication) {
                        hasChanged = true;
                    }
                }
            }

            if (hasChanged && JSON.stringify({ ...tempTx, auditLog: undefined }) !== originalTxComparisonString) {
                transactionsToUpdate.push(tempTx);
            }
        }

        console.log(`Applying rules to ${transactionsToUpdate.length} transactions...`);
        for (const tx of transactionsToUpdate) {
            try {
                await updateTransaction(tx.id, tx);
                totalChanges++;
            } catch (error) {
                console.error(`Error updating transaction ${tx.id}:`, error);
            }
        }
        setPreviewChanges([]);
        setIsApplyingRules(false);
        alert(`${totalChanges} transactions updated by automation rules.`);
    }, [rules, transactions, updateTransaction]);

    /**
     * @description Simulates an agentic AI system generating rule suggestions based on transaction data.
     * This function represents a crucial integration point for AI-driven financial intelligence,
     * allowing the system to proactively identify patterns and propose optimizations for human review.
     * In a production environment, this would involve calling a dedicated AI service, potentially
     * a separate microservice acting as a "Plato AI" agent with advanced analytical capabilities.
     */
    const fetchAISuggestions = useCallback(async () => {
        setIsFetchingSuggestions(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const uncategorizedTransactions = transactions.filter(tx => !tx.category || tx.category === 'Uncategorized');
        const commonDescriptions = uncategorizedTransactions.map(tx => tx.description).filter(Boolean);
        const suggestionCandidates: { [key: string]: number } = {};

        commonDescriptions.forEach(desc => {
            const normalizedDesc = desc.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase().trim();
            if (normalizedDesc.length > 5) {
                suggestionCandidates[normalizedDesc] = (suggestionCandidates[normalizedDesc] || 0) + 1;
            }
        });

        const newSuggestions: AISuggestion[] = [];
        let suggestionIdCounter = aiSuggestions.length + 1;

        for (const [desc, count] of Object.entries(suggestionCandidates)) {
            if (count > 2 && newSuggestions.length < 3) {
                const suggestedCategory = desc.split(' ')[0] || 'Miscellaneous';
                newSuggestions.push({
                    id: `ai-suggest-${suggestionIdCounter++}`,
                    suggestedRule: {
                        name: `AI: Categorize "${desc}"`,
                        description: `Automatically categorizes transactions matching "${desc}".`,
                        type: 'categorization',
                        isEnabled: false,
                        priority: 75,
                        condition: { field: 'description', operator: 'contains', value: desc },
                        action: { type: 'setCategory', value: suggestedCategory },
                        creatorId: 'AI Agent: Plato',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        status: 'draft',
                        scope: 'personal'
                    },
                    confidence: Math.min(1.0, count / 5),
                    reason: `Identified ${count} uncategorized transactions containing "${desc}".`,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                });
            }
        }
        setAiSuggestions(prev => [...prev.filter(s => s.status === 'pending'), ...newSuggestions]);
        setIsFetchingSuggestions(false);
    }, [transactions, aiSuggestions.length]);

    /**
     * @description Handles accepting an AI-generated rule suggestion, promoting it to an active rule.
     * This workflow bridges the gap between AI intelligence and human control, allowing for
     * seamless adoption of automated insights into operational practices, thereby augmenting
     * human decision-making with agentic AI capabilities.
     * @param suggestionId The ID of the suggestion to accept.
     */
    const acceptAISuggestion = useCallback((suggestionId: string) => {
        setAiSuggestions(prev => prev.map(s => {
            if (s.id === suggestionId) {
                const newRuleId = `rule-${Date.now()}`;
                const now = new Date().toISOString();
                const acceptedRule: AutomationRule = {
                    ...s.suggestedRule as AutomationRule,
                    id: newRuleId,
                    isEnabled: true,
                    status: 'active',
                    createdAt: now,
                    updatedAt: now,
                    creatorId: userId || 'user_accepted_ai'
                };
                setRules(currentRules => [...currentRules, acceptedRule]);
                return { ...s, status: 'accepted' };
            }
            return s;
        }));
        alert('AI rule suggestion accepted and added to active rules.');
    }, [userId]);

    /**
     * @description Handles rejecting an AI-generated rule suggestion.
     * This allows users to dismiss irrelevant or incorrect suggestions, refining the
     * feedback loop for the AI system over time and ensuring human oversight in automated processes.
     * @param suggestionId The ID of the suggestion to reject.
     */
    const rejectAISuggestion = useCallback((suggestionId: string) => {
        setAiSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'rejected' } : s));
        alert('AI rule suggestion rejected.');
    }, []);

    /**
     * @description Helper function to render boolean or null values consistently for display.
     * @param value The value to render.
     * @returns A string representation of the value.
     */
    const renderBooleanValue = (value: boolean | string | number | null | undefined) => {
        if (typeof value === 'boolean') {
            return value ? 'True' : 'False';
        }
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return String(value);
    }

    return (
        <div className="space-y-6 p-4">
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-8 drop-shadow-lg">Transaction Automation Engine</h2>

            <Card title="Automation Rule Management">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">{editRuleId ? 'Edit Automation Rule' : 'Create New Automation Rule'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="ruleName" className="block text-gray-400 text-sm font-bold mb-1">Rule Name:</label>
                            <input
                                id="ruleName"
                                type="text"
                                name="name"
                                value={newRule.name || ''}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="e.g., Categorize Groceries"
                            />
                        </div>
                        <div>
                            <label htmlFor="ruleType" className="block text-gray-400 text-sm font-bold mb-1">Rule Type:</label>
                            <select
                                id="ruleType"
                                name="type"
                                value={newRule.type || 'categorization'}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {Object.keys(ruleTypeToActionMap).map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="rulePriority" className="block text-gray-400 text-sm font-bold mb-1">Priority (lower is higher):</label>
                            <input
                                id="rulePriority"
                                type="number"
                                name="priority"
                                value={newRule.priority || ''}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="e.g., 10"
                            />
                        </div>
                        <div>
                            <label htmlFor="conditionField" className="block text-gray-400 text-sm font-bold mb-1">Condition Field:</label>
                            <select
                                id="conditionField"
                                name="condition.field"
                                value={newRule.condition?.field || 'description'}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {ruleConditionsOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="conditionOperator" className="block text-gray-400 text-sm font-bold mb-1">Condition Operator:</label>
                            <select
                                id="conditionOperator"
                                name="condition.operator"
                                value={newRule.condition?.operator || (getConditionFieldInfo.type === 'string' ? 'contains' : getConditionFieldInfo.type === 'number' ? 'greaterThan' : getConditionFieldInfo.type === 'boolean' ? 'isTrue' : 'containsAny')}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {ruleOperators[getConditionFieldInfo.type as keyof typeof ruleOperators]?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="conditionValue" className="block text-gray-400 text-sm font-bold mb-1">Condition Value:</label>
                            {getConditionFieldInfo.type === 'boolean' ? (
                                <select
                                    id="conditionValue"
                                    name="condition.value"
                                    value={String(newRule.condition?.value ?? '')}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    disabled={['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(newRule.condition?.operator || '')}
                                >
                                    <option value="">Select...</option>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : (
                                <input
                                    id="conditionValue"
                                    type={getConditionFieldInfo.type === 'number' ? 'number' : 'text'}
                                    name="condition.value"
                                    value={String(newRule.condition?.value ?? '')}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    placeholder="e.g., Whole Foods / 500 / rail_fast"
                                    disabled={['exists', 'doesNotExist', 'isEmpty', 'isNotEmpty'].includes(newRule.condition?.operator || '') || (ruleOperators[getConditionFieldInfo.type as keyof typeof ruleOperators]?.find(op => op.value === newRule.condition?.operator)?.specialValue !== undefined)}
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="actionType" className="block text-gray-400 text-sm font-bold mb-1">Action Type:</label>
                            <select
                                id="actionType"
                                name="action.type"
                                value={newRule.action?.type || getActionTypeOptions[0]?.value || ''}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {getActionTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="actionValue" className="block text-gray-400 text-sm font-bold mb-1">Action Value:</label>
                            {(newRule.action?.type === 'markReconciled' || newRule.action?.type === 'setReviewed') ? (
                                <select
                                    id="actionValue"
                                    name="action.value"
                                    value={String(newRule.action?.value ?? true)}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : newRule.action?.type === 'setRiskScore' ? (
                                <input
                                    id="actionValue"
                                    type="number"
                                    name="action.value"
                                    value={String(newRule.action?.value ?? 0)}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    placeholder="e.g., 0.8 (for high risk)"
                                />
                            ) : (
                                <input
                                    id="actionValue"
                                    type="text"
                                    name="action.value"
                                    value={String(newRule.action?.value ?? '')}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    placeholder="e.g., Groceries / Subscription / Fraud / rail_batch"
                                />
                            )}
                        </div>
                         <div>
                            <label htmlFor="ruleStatus" className="block text-gray-400 text-sm font-bold mb-1">Status:</label>
                            <select
                                id="ruleStatus"
                                name="status"
                                value={newRule.status || 'active'}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="ruleScope" className="block text-gray-400 text-sm font-bold mb-1">Scope:</label>
                            <select
                                id="ruleScope"
                                name="scope"
                                value={newRule.scope || 'personal'}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="personal">Personal</option>
                                <option value="team">Team</option>
                                <option value="organization">Organization</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                name="isEnabled"
                                checked={newRule.isEnabled || false}
                                onChange={handleNewRuleChange}
                                id="isEnabledCheckbox"
                                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor="isEnabledCheckbox" className="ml-2 text-sm font-medium text-gray-300">Enabled</label>
                        </div>
                        <div>
                            <label htmlFor="ruleDescription" className="block text-gray-400 text-sm font-bold mb-1">Description (Optional):</label>
                            <textarea
                                id="ruleDescription"
                                name="description"
                                value={newRule.description || ''}
                                onChange={handleNewRuleChange}
                                rows={2}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="Explain the purpose of this rule."
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        {editRuleId ? (
                            <button onClick={handleAddUpdateRule} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200">Update Rule</button>
                        ) : (
                            <button onClick={handleAddUpdateRule} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200">Add Rule</button>
                        )}
                         {editRuleId && (
                            <button onClick={() => {
                                const now = new Date().toISOString();
                                setEditRuleId(null);
                                setNewRule({ isEnabled: true, type: 'categorization', priority: 50, condition: { field: 'description', operator: 'contains', value: '' }, action: { type: 'setCategory', value: '' }, creatorId: userId || 'system', createdAt: now, updatedAt: now, status: 'active', scope: 'personal' });
                            }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200">Cancel Edit</button>
                        )}
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-200 mb-4">Existing Automation Rules ({rules.length})</h3>
                <div className="max-h-96 overflow-y-auto space-y-3 p-2 bg-gray-800 rounded-md border border-gray-700">
                    {rules.length === 0 ? (
                        <p className="text-gray-500 text-center text-xs">No automation rules configured.</p>
                    ) : (
                        rules.sort((a,b) => a.priority - b.priority).map(rule => (
                            <div key={rule.id} className="bg-gray-900 border border-gray-700 rounded-md p-3 space-y-1">
                                <div className="flex justify-between items-center">
                                    <h5 className={`font-semibold text-sm ${rule.isEnabled && rule.status === 'active' ? 'text-cyan-300' : 'text-gray-500 line-through'}`}>
                                        {rule.name}
                                        {rule.description && <span className="block text-gray-500 text-xxs font-normal italic">{rule.description}</span>}
                                    </h5>
                                    <div className="flex gap-2 items-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xxs ${rule.isEnabled ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>{rule.isEnabled ? 'Enabled' : 'Disabled'}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xxs ${rule.status === 'active' ? 'bg-blue-700 text-white' : rule.status === 'draft' ? 'bg-yellow-700 text-white' : 'bg-gray-700 text-white'}`}>{rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}</span>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs">
                                    Type: <span className="font-mono">{rule.type.replace('_', ' ')}</span> | Priority: <span className="font-mono">{rule.priority}</span> | Scope: <span className="font-mono">{rule.scope}</span>
                                </p>
                                <p className="text-gray-500 text-xs">
                                    IF <span className="font-mono text-cyan-400">{ruleConditionsOptions.find(o => o.value === rule.condition.field)?.label || rule.condition.field}</span> {rule.condition.operator} <span className="font-mono text-white">"{String(renderBooleanValue(rule.condition.value))}"</span>
                                </p>
                                <p className="text-gray-500 text-xs">
                                    THEN <span className="font-mono text-green-400">{ruleTypeToActionMap[rule.type as keyof typeof ruleTypeToActionMap]?.find(o => o.value === rule.action.type)?.label || rule.action.type}</span> <span className="font-mono text-white">"{String(renderBooleanValue(rule.action.value))}"</span>
                                </p>
                                <p className="text-gray-600 text-xxs mt-1">
                                    Created by: {rule.creatorId} on {new Date(rule.createdAt).toLocaleString()} (Last updated: {new Date(rule.updatedAt).toLocaleString()})
                                </p>
                                <div className="flex justify-end gap-2 text-xs mt-2">
                                    <button onClick={() => handleEditRule(rule)} className="text-cyan-400 hover:text-white transition-colors">Edit</button>
                                    <button onClick={() => handleDeleteRule(rule.id)} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Card title="Apply Automation Rules">
                <p className="text-gray-400 text-sm mb-4">
                    Review and apply your configured rules to all eligible transactions. This will update transaction categories, tags, reconciliation statuses, risk scores, and suggest routing based on your criteria. This module is critical for maintaining real-time data accuracy and enabling dynamic financial operations.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={previewAutomatedChanges}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Preview Changes ({rules.filter(r => r.isEnabled && r.status === 'active').length} rules active)
                    </button>
                    <button
                        onClick={applyAutomatedRules}
                        disabled={previewChanges.length === 0 || isApplyingRules}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isApplyingRules ? 'Applying...' : `Apply ${previewChanges.length} Changes`}
                    </button>
                </div>

                {previewChanges.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">Previewed Changes ({previewChanges.length} transactions)</h3>
                        <div className="max-h-60 overflow-y-auto bg-gray-800 rounded-md border border-gray-700">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Transaction</th>
                                        <th className="px-4 py-2">Category</th>
                                        <th className="px-4 py-2">Tags / Flags</th>
                                        <th className="px-4 py-2">Reconciled</th>
                                        <th className="px-4 py-2">Reviewed</th>
                                        <th className="px-4 py-2">Risk Score</th>
                                        <th className="px-4 py-2">Token Rail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewChanges.map(tx => {
                                        const originalTx = transactions.find(t => t.id === tx.id.replace('-preview', ''));
                                        if (!originalTx) return null;

                                        return (
                                            <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="px-4 py-2 font-medium text-white text-xs whitespace-nowrap">
                                                    {tx.description}<br/>
                                                    <span className={`font-mono text-xxs ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {tx.type === 'income' ? '+' : '-'}{tx.currency}{tx.amount.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    <span className={`${originalTx.category !== tx.category ? 'text-yellow-400' : 'text-white'}`}>
                                                        {tx.category || 'N/A'}
                                                    </span>
                                                    {originalTx.category !== tx.category && originalTx.category && <span className="block text-xxs text-gray-500 line-through">{originalTx.category}</span>}
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(tx.tags || []).map((tag, idx) => (
                                                            <span key={idx} className={`inline-block px-2 py-0.5 rounded-full text-xxs ${originalTx.tags?.includes(tag) ? 'bg-gray-700 text-cyan-300' : 'bg-green-700 text-white'}`}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {(originalTx.tags || []).filter(tag => !tx.tags?.includes(tag)).map((tag, idx) => (
                                                            <span key={idx} className="inline-block px-2 py-0.5 rounded-full text-xxs bg-red-700 text-white line-through">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    <span className={`${originalTx.isReconciled !== tx.isReconciled ? 'text-yellow-400' : 'text-white'}`}>
                                                        {tx.isReconciled ? 'Yes' : 'No'}
                                                    </span>
                                                    {originalTx.isReconciled !== tx.isReconciled && <span className="block text-xxs text-gray-500 line-through">{originalTx.isReconciled ? 'Yes' : 'No'}</span>}
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                     <span className={`${originalTx.isReviewed !== tx.isReviewed ? 'text-yellow-400' : 'text-white'}`}>
                                                        {tx.isReviewed ? 'Yes' : 'No'}
                                                    </span>
                                                    {originalTx.isReviewed !== tx.isReviewed && <span className="block text-xxs text-gray-500 line-through">{originalTx.isReviewed ? 'Yes' : 'No'}</span>}
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    <span className={`${originalTx.riskScore !== tx.riskScore ? 'text-yellow-400' : 'text-white'}`}>
                                                        {tx.riskScore != null ? tx.riskScore.toFixed(2) : 'N/A'}
                                                    </span>
                                                    {originalTx.riskScore !== tx.riskScore && originalTx.riskScore != null && <span className="block text-xxs text-gray-500 line-through">{originalTx.riskScore.toFixed(2)}</span>}
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    <span className={`${originalTx.tokenRail !== tx.tokenRail ? 'text-yellow-400' : 'text-white'}`}>
                                                        {tx.tokenRail || 'Default'}
                                                    </span>
                                                    {originalTx.tokenRail !== tx.tokenRail && originalTx.tokenRail && <span className="block text-xxs text-gray-500 line-through">{originalTx.tokenRail}</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>

            <Card title="Plato AI: Smart Rule Suggestions" isCollapsible>
                <p className="text-gray-400 text-sm mb-4">
                    The Plato AI agent continually analyzes your transaction history, identifying patterns and anomalies to proactively suggest new automation rules. These suggestions streamline your financial operations, enhance fraud detection, and optimize routing without manual configuration, thus accelerating business intelligence and operational agility.
                </p>
                <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                    <button
                        onClick={fetchAISuggestions}
                        disabled={isFetchingSuggestions}
                        className="mt-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isFetchingSuggestions ? 'Plato is thinking...' : 'Ask Plato for Rule Suggestions'}
                    </button>
                    {aiSuggestions.filter(s => s.status === 'pending').length > 0 && (
                        <div className="mt-4 space-y-3">
                            <h4 className="text-gray-300 text-sm font-semibold">Pending Suggestions:</h4>
                            {aiSuggestions.filter(s => s.status === 'pending').map(suggestion => (
                                <div key={suggestion.id} className="bg-gray-700/50 p-3 rounded-md border border-gray-600">
                                    <p className="text-white text-xs font-semibold">{suggestion.suggestedRule.name}</p>
                                    <p className="text-gray-400 text-xxs italic">Confidence: {(suggestion.confidence * 100).toFixed(0)}% | Reason: {suggestion.reason}</p>
                                    <p className="text-gray-500 text-xxs">
                                        Suggested Rule: IF <span className="font-mono text-cyan-400">{ruleConditionsOptions.find(o => o.value === suggestion.suggestedRule.condition?.field)?.label || suggestion.suggestedRule.condition?.field}</span> {suggestion.suggestedRule.condition?.operator} <span className="font-mono text-white">"{String(renderBooleanValue(suggestion.suggestedRule.condition?.value))}"</span>
                                        THEN <span className="font-mono text-green-400">{ruleTypeToActionMap[suggestion.suggestedRule.type as keyof typeof ruleTypeToActionMap]?.find(o => o.value === suggestion.suggestedRule.action?.type)?.label || suggestion.suggestedRule.action?.type}</span> <span className="font-mono text-white">"{String(renderBooleanValue(suggestion.suggestedRule.action?.value))}"</span>
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => acceptAISuggestion(suggestion.id)} className="text-green-400 hover:text-green-300 transition-colors text-xxs font-medium">Accept</button>
                                        <button onClick={() => rejectAISuggestion(suggestion.id)} className="text-red-400 hover:text-red-300 transition-colors text-xxs font-medium">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {aiSuggestions.filter(s => s.status === 'pending').length === 0 && !isFetchingSuggestions && (
                         <p className="text-gray-500 text-center text-xs mt-4">
                            No new AI rule suggestions at this time. Plato is always learning and will provide suggestions as new patterns emerge.
                        </p>
                    )}
                </div>
            </Card>

            <Card title="Bulk Workflows & Reconciliation" isCollapsible>
                <p className="text-gray-400 text-sm mb-4">
                    This section provides advanced tools for orchestrating bulk financial operations, significantly reducing manual effort for reconciliation, compliance checks, and large-scale data management. It leverages the underlying payment infrastructure to ensure robust and auditable processing, maximizing operational efficiency and reducing financial risk.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <h4 className="font-semibold text-gray-200 text-sm mb-2">Bulk Mark as Reconciled</h4>
                        <p className="text-gray-400 text-xs mb-3">
                            Mark all transactions matching custom filters (e.g., date range, specific merchant, amount threshold) as reconciled. This is critical for accelerating month-end close processes and maintaining ledger accuracy across high-volume transaction streams, thereby enhancing financial governance and reducing operational costs.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                            Select & Reconcile (Coming Soon)
                        </button>
                    </div>
                    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <h4 className="font-semibold text-gray-200 text-sm mb-2">Automated Statement Matching</h4>
                        <p className="text-gray-400 text-xs mb-3">
                            Integrate external bank statements (CSV/OFX/CAMT.053) for intelligent, automated matching against internal transaction records. This module reduces reconciliation discrepancies, enhances fraud detection by identifying unmatched items, and ensures real-time visibility into cash positions. It provides a configurable simulator for various banking partners, future-proofing connectivity.
                        </p>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                            Upload Statement (Simulator)
                        </button>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                    <h4 className="font-semibold text-gray-200 text-sm mb-2">Bulk Tagging & Flagging</h4>
                    <p className="text-gray-400 text-xs mb-3">
                        Apply or remove specific tags/flags across a batch of transactions using advanced filtering capabilities. This supports dynamic classification for tax purposes, cost center allocation, or flagging transactions for further compliance review, enhancing governance, audit readiness, and accelerating reporting accuracy.
                    </p>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        Apply Bulk Tags/Flags (Coming Soon)
                    </button>
                </div>
            </Card>
        </div>
    );
};