import React, { useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { FlowMatrixTransaction } from '../../types';

/**
 * @description Represents an automation rule for transaction processing.
 */
export interface AutomationRule {
    id: string;
    name: string;
    type: 'categorization' | 'tagging' | 'flagging' | 'reconciliation' | 'review';
    condition: {
        field: 'description' | 'merchantDetails.name' | 'amount' | 'category' | 'date' | 'tags' | 'isReconciled' | 'isReviewed';
        operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'isTrue' | 'isFalse' | 'notContains' | 'isLessThanOrEqual' | 'isGreaterThanOrEqual';
        value: string | number | boolean;
    };
    action: {
        type: 'setCategory' | 'addTag' | 'removeTag' | 'markReconciled' | 'setReviewed';
        value: string | boolean; // category name, tag name, reconciled status, reviewed status
    };
    isEnabled: boolean;
    priority: number; // Lower number = higher priority (e.g., 10 is higher than 100)
}

// Helper arrays for UI selectors
const ruleConditionsOptions = [
    { label: 'Description', value: 'description', type: 'string' },
    { label: 'Merchant Name', value: 'merchantDetails.name', type: 'string' },
    { label: 'Amount', value: 'amount', type: 'number' },
    { label: 'Category', value: 'category', type: 'string' },
    { label: 'Tags', value: 'tags', type: 'string' }, // Special handling needed for array
    { label: 'Is Reconciled', value: 'isReconciled', type: 'boolean' },
    { label: 'Is Reviewed', value: 'isReviewed', type: 'boolean' },
];

const ruleOperators = {
    'string': [
        { label: 'Contains', value: 'contains' },
        { label: 'Equals', value: 'equals' },
        { label: 'Starts With', value: 'startsWith' },
        { label: 'Ends With', value: 'endsWith' },
        { label: 'Does Not Contain', value: 'notContains' },
    ],
    'number': [
        { label: 'Greater Than (>)', value: 'greaterThan' },
        { label: 'Less Than (<)', value: 'lessThan' },
        { label: 'Equals (=)', value: 'equals' },
        { label: 'Greater Than or Equal (>=)', value: 'isGreaterThanOrEqual' },
        { label: 'Less Than or Equal (<=)', value: 'isLessThanOrEqual' },
    ],
    'boolean': [
        { label: 'Is True', value: 'isTrue' },
        { label: 'Is False', value: 'isFalse' },
    ]
};

const ruleTypeToActionMap = {
    'categorization': [{ label: 'Set Category To', value: 'setCategory' }],
    'tagging': [{ label: 'Add Tag', value: 'addTag' }, { label: 'Remove Tag', value: 'removeTag' }],
    'flagging': [{ label: 'Add Flag Tag (e.g., "FLAG:Fraud")', value: 'addTag' }], // Use addTag for flagging
    'reconciliation': [{ label: 'Mark Reconciled As', value: 'markReconciled' }],
    'review': [{ label: 'Mark Reviewed As', value: 'setReviewed' }],
};

export const TransactionAutomation: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("TransactionAutomation must be within a DataProvider");
    }
    const { transactions, updateTransaction } = context;

    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
        isEnabled: true,
        type: 'categorization',
        priority: 50,
        condition: { field: 'description', operator: 'contains', value: '' },
        action: { type: 'setCategory', value: '' }
    });
    const [editRuleId, setEditRuleId] = useState<string | null>(null);
    const [previewChanges, setPreviewChanges] = useState<FlowMatrixTransaction[]>([]);
    const [isApplyingRules, setIsApplyingRules] = useState(false);

    // Mock initial rules for demonstration
    useEffect(() => {
        setRules([
            {
                id: 'rule-1',
                name: 'Auto-categorize Starbucks',
                type: 'categorization',
                isEnabled: true,
                priority: 10,
                condition: { field: 'description', operator: 'contains', value: 'STARBUCKS' },
                action: { type: 'setCategory', value: 'Coffee' }
            },
            {
                id: 'rule-2',
                name: 'Flag large expenses (> $500)',
                type: 'flagging',
                isEnabled: true,
                priority: 20,
                condition: { field: 'amount', operator: 'greaterThan', value: 500 },
                action: { type: 'addTag', value: 'FLAG:LargeExpense' }
            },
            {
                id: 'rule-3',
                name: 'Mark Netflix as subscription',
                type: 'tagging',
                isEnabled: true,
                priority: 15,
                condition: { field: 'description', operator: 'contains', value: 'NETFLIX' },
                action: { type: 'addTag', value: 'Subscription' }
            },
            {
                id: 'rule-4',
                name: 'Mark income as reviewed',
                type: 'review',
                isEnabled: true,
                priority: 30,
                condition: { field: 'category', operator: 'equals', value: 'Income' },
                action: { type: 'setReviewed', value: true }
            }
        ]);
    }, []);

    const getConditionFieldType = useMemo(() => {
        return ruleConditionsOptions.find(opt => opt.value === newRule.condition?.field)?.type || 'string';
    }, [newRule.condition?.field]);

    const getActionTypeOptions = useMemo(() => {
        // Ensure that newRule.type is a valid key for ruleTypeToActionMap
        const selectedType = newRule.type as keyof typeof ruleTypeToActionMap;
        return ruleTypeToActionMap[selectedType] || [];
    }, [newRule.type]);

    useEffect(() => {
        // Reset action type if the selected type becomes invalid for the current rule type
        if (newRule.action && newRule.type && !getActionTypeOptions.some(opt => opt.value === newRule.action?.type)) {
            setNewRule(prev => ({
                ...prev,
                action: {
                    type: getActionTypeOptions[0]?.value || '',
                    value: '' // Reset action value too
                }
            }));
        } else if (!newRule.action?.type && getActionTypeOptions.length > 0) {
            // Set a default action type if none is selected
             setNewRule(prev => ({
                ...prev,
                action: {
                    type: getActionTypeOptions[0].value,
                    value: ''
                }
            }));
        }
    }, [newRule.type, newRule.action, getActionTypeOptions]);


    const handleNewRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setNewRule(prev => {
            const updatedRule = { ...prev };

            if (name.startsWith('condition.')) {
                const fieldName = name.split('.')[1];
                if (!updatedRule.condition) updatedRule.condition = { field: '', operator: 'contains', value: '' };

                if (fieldName === 'field') {
                    updatedRule.condition.field = value as AutomationRule['condition']['field'];
                    const newFieldType = ruleConditionsOptions.find(opt => opt.value === value)?.type || 'string';
                    // Reset operator and value based on new field type
                    if (newFieldType === 'string') updatedRule.condition.operator = 'contains';
                    else if (newFieldType === 'number') updatedRule.condition.operator = 'greaterThan';
                    else if (newFieldType === 'boolean') updatedRule.condition.operator = 'isTrue';
                    updatedRule.condition.value = '';
                } else if (fieldName === 'operator') {
                    updatedRule.condition.operator = value as AutomationRule['condition']['operator'];
                } else if (fieldName === 'value') {
                    if (getConditionFieldType === 'number') {
                        updatedRule.condition.value = parseFloat(value) || 0;
                    } else if (getConditionFieldType === 'boolean') {
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
                    } else {
                        updatedRule.action.value = '';
                    }
                } else if (fieldName === 'value') {
                     if (updatedRule.action.type === 'markReconciled' || updatedRule.action.type === 'setReviewed') {
                        updatedRule.action.value = value === 'true';
                    } else {
                        updatedRule.action.value = value;
                    }
                }
            } else if (name === 'isEnabled') {
                updatedRule.isEnabled = checked;
            } else if (name === 'priority') {
                updatedRule.priority = parseInt(value, 10) || 50;
            } else {
                (updatedRule as any)[name] = value;
            }
            return updatedRule;
        });
    };


    const handleAddUpdateRule = useCallback(() => {
        if (!newRule.name || !newRule.condition?.field || !newRule.action?.type) {
            alert('Please fill all required rule fields.');
            return;
        }
        const ruleToSave: AutomationRule = {
            id: editRuleId || `rule-${Date.now()}`,
            name: newRule.name,
            type: newRule.type || 'categorization',
            isEnabled: newRule.isEnabled ?? true,
            priority: newRule.priority ?? 50,
            condition: newRule.condition,
            action: newRule.action,
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
            action: { type: 'setCategory', value: '' }
        }); // Reset form
    }, [editRuleId, newRule]);

    const handleDeleteRule = useCallback((id: string) => {
        setRules(prev => prev.filter(rule => rule.id !== id));
    }, []);

    const handleEditRule = useCallback((rule: AutomationRule) => {
        setNewRule(rule);
        setEditRuleId(rule.id);
    }, []);

    const evaluateCondition = (tx: FlowMatrixTransaction, condition: AutomationRule['condition']): boolean => {
        let fieldValue: any;
        if (condition.field.includes('.')) { // Handle nested fields like 'merchantDetails.name'
            const [parent, child] = condition.field.split('.');
            fieldValue = (tx as any)[parent]?.[child];
        } else {
            fieldValue = (tx as any)[condition.field];
        }

        const value = condition.value;

        // Special handling for tags field (which is an array)
        if (condition.field === 'tags' && Array.isArray(fieldValue)) {
            const tagValue = String(value).toLowerCase();
            switch (condition.operator) {
                case 'contains':
                    return fieldValue.some(tag => String(tag).toLowerCase().includes(tagValue));
                case 'equals':
                    return fieldValue.some(tag => String(tag).toLowerCase() === tagValue);
                case 'notContains':
                    return !fieldValue.some(tag => String(tag).toLowerCase().includes(tagValue));
            }
        }

        switch (condition.operator) {
            case 'contains':
                return typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.toLowerCase().includes(value.toLowerCase());
            case 'equals':
                return fieldValue === value;
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
                return false;
        }
    };

    const applyRuleToAction = (tx: FlowMatrixTransaction, rule: AutomationRule): FlowMatrixTransaction => {
        const newTx = { ...tx };
        const { action } = rule;

        const addAuditEntry = (actionType: string, details: string) => {
            newTx.auditLog = [...(newTx.auditLog || []), {
                timestamp: new Date().toISOString(),
                userId: 'Automation Engine',
                action: `${actionType} by rule: "${rule.name}"`,
                details: details
            }];
        };

        switch (action.type) {
            case 'setCategory':
                if (typeof action.value === 'string' && newTx.category !== action.value) {
                    addAuditEntry('Categorized', `Category changed from ${newTx.category} to ${action.value}`);
                    newTx.category = action.value;
                }
                break;
            case 'addTag':
                if (typeof action.value === 'string') {
                    newTx.tags = [...(newTx.tags || []), action.value];
                    newTx.tags = Array.from(new Set(newTx.tags)); // Ensure unique tags
                    addAuditEntry('Tagged', `Added tag: ${action.value}`);
                }
                break;
            case 'removeTag':
                if (typeof action.value === 'string' && newTx.tags) {
                    const initialTags = newTx.tags.length;
                    newTx.tags = newTx.tags.filter(tag => tag !== action.value);
                    if (newTx.tags.length < initialTags) {
                         addAuditEntry('Tagged', `Removed tag: ${action.value}`);
                    }
                }
                break;
            case 'markReconciled':
                if (typeof action.value === 'boolean' && newTx.isReconciled !== action.value) {
                    addAuditEntry('Reconciled', `Set reconciled status to ${action.value}`);
                    newTx.isReconciled = action.value;
                }
                break;
            case 'setReviewed':
                if (typeof action.value === 'boolean' && newTx.isReviewed !== action.value) {
                    addAuditEntry('Reviewed', `Set reviewed status to ${action.value}`);
                    newTx.isReviewed = action.value;
                }
                break;
            default:
                console.warn(`Unknown action type: ${action.type}`);
        }
        return newTx;
    };


    const previewAutomatedChanges = useCallback(() => {
        let changedTransactions: FlowMatrixTransaction[] = [];
        const sortedRules = [...rules].filter(r => r.isEnabled).sort((a, b) => (a.priority || 50) - (b.priority || 50));

        transactions.forEach(originalTx => {
            let tempTx = { ...originalTx }; // Deep copy enough for preview comparison
            let hasChanged = false;
            const originalTxString = JSON.stringify({ ...originalTx, auditLog: undefined }); // Ignore audit log for initial comparison

            sortedRules.forEach(rule => {
                if (evaluateCondition(tempTx, rule.condition)) {
                    tempTx = applyRuleToAction(tempTx, rule);
                }
            });

            // Compare after all rules applied
            if (JSON.stringify({ ...tempTx, auditLog: undefined }) !== originalTxString) {
                changedTransactions.push({ ...tempTx, id: originalTx.id + '-preview' }); // Add a distinct ID for preview
            }
        });
        setPreviewChanges(changedTransactions);
    }, [rules, transactions]);


    const applyAutomatedRules = useCallback(async () => {
        setIsApplyingRules(true);
        const sortedRules = [...rules].filter(r => r.isEnabled).sort((a, b) => (a.priority || 50) - (b.priority || 50));
        const transactionsToUpdate: FlowMatrixTransaction[] = [];
        let totalChanges = 0;

        for (const originalTx of transactions) {
            let tempTx = { ...originalTx };
            let hasChanged = false;
            const originalTxComparisonString = JSON.stringify({ ...originalTx, auditLog: undefined }); // Ignore audit log for comparison

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
            // updateTransaction is assumed to merge partial changes or replace
            await updateTransaction(tx.id, tx);
            totalChanges++;
        }
        setPreviewChanges([]); // Clear preview after applying
        setIsApplyingRules(false);
        alert(`${totalChanges} transactions updated by automation rules.`);
    }, [rules, transactions, updateTransaction]);


    return (
        <div className="space-y-6 p-4">
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-8 drop-shadow-lg">Transaction Automation Engine</h2>

            {/* Rule Configuration */}
            <Card title="Automation Rule Management">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">{editRuleId ? 'Edit Automation Rule' : 'Create New Automation Rule'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Rule Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={newRule.name || ''}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="e.g., Categorize Groceries"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Rule Type:</label>
                            <select
                                name="type"
                                value={newRule.type || 'categorization'}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {Object.keys(ruleTypeToActionMap).map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Condition Field:</label>
                            <select
                                name="condition.field"
                                value={newRule.condition?.field || 'description'}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {ruleConditionsOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Condition Operator:</label>
                            <select
                                name="condition.operator"
                                value={newRule.condition?.operator || (getConditionFieldType === 'string' ? 'contains' : getConditionFieldType === 'number' ? 'greaterThan' : 'isTrue')}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {ruleOperators[getConditionFieldType as keyof typeof ruleOperators].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Condition Value:</label>
                            {getConditionFieldType === 'boolean' ? (
                                <select
                                    name="condition.value"
                                    value={String(newRule.condition?.value ?? '')}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : (
                                <input
                                    type={getConditionFieldType === 'number' ? 'number' : 'text'}
                                    name="condition.value"
                                    value={String(newRule.condition?.value ?? '')}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    placeholder="e.g., Whole Foods / 500"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Action Type:</label>
                            <select
                                name="action.type"
                                value={newRule.action?.type || getActionTypeOptions[0]?.value || ''}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {getActionTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Action Value:</label>
                            {(newRule.action?.type === 'markReconciled' || newRule.action?.type === 'setReviewed') ? (
                                <select
                                    name="action.value"
                                    value={String(newRule.action?.value ?? true)}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="action.value"
                                    value={String(newRule.action?.value ?? '')}
                                    onChange={handleNewRuleChange}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    placeholder="e.g., Groceries / Subscription / FLAG:Fraud"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-1">Priority (lower is higher):</label>
                            <input
                                type="number"
                                name="priority"
                                value={newRule.priority || ''}
                                onChange={handleNewRuleChange}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                placeholder="e.g., 10"
                            />
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
                    </div>
                    <div className="mt-6 flex gap-3">
                        {editRuleId ? (
                            <button onClick={handleAddUpdateRule} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200">Update Rule</button>
                        ) : (
                            <button onClick={handleAddUpdateRule} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200">Add Rule</button>
                        )}
                         {editRuleId && (
                            <button onClick={() => {
                                setEditRuleId(null);
                                setNewRule({ isEnabled: true, type: 'categorization', priority: 50, condition: { field: 'description', operator: 'contains', value: '' }, action: { type: 'setCategory', value: '' } });
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
                                    <h5 className={`font-semibold text-sm ${rule.isEnabled ? 'text-cyan-300' : 'text-gray-500 line-through'}`}>{rule.name}</h5>
                                    <span className={`px-2 py-0.5 rounded-full text-xxs ${rule.isEnabled ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>{rule.isEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <p className="text-gray-400 text-xs">
                                    Type: <span className="font-mono">{rule.type}</span> | Priority: <span className="font-mono">{rule.priority}</span>
                                </p>
                                <p className="text-gray-500 text-xs">
                                    IF <span className="font-mono text-cyan-400">{ruleConditionsOptions.find(o => o.value === rule.condition.field)?.label || rule.condition.field}</span> {rule.condition.operator} <span className="font-mono text-white">"{String(rule.condition.value)}"</span>
                                </p>
                                <p className="text-gray-500 text-xs">
                                    THEN <span className="font-mono text-green-400">{getActionTypeOptions.find(o => o.value === rule.action.type)?.label || rule.action.type}</span> <span className="font-mono text-white">"{String(rule.action.value)}"</span>
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

            {/* Rule Application & Preview */}
            <Card title="Apply Automation Rules">
                <p className="text-gray-400 text-sm mb-4">
                    Review and apply your configured rules to all eligible transactions. This will update transaction categories, tags, and reconciliation statuses based on your criteria.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={previewAutomatedChanges}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Preview Changes ({rules.filter(r => r.isEnabled).length} rules active)
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
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th className="px-4 py-2">Transaction</th>
                                        <th className="px-4 py-2">Category</th>
                                        <th className="px-4 py-2">Tags</th>
                                        <th className="px-4 py-2">Reconciled</th>
                                        <th className="px-4 py-2">Reviewed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewChanges.map(tx => {
                                        const originalTx = transactions.find(t => t.id === tx.id.replace('-preview', ''));
                                        if (!originalTx) return null; // Should not happen

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
                                                        {tx.category}
                                                    </span>
                                                    {originalTx.category !== tx.category && <span className="block text-xxs text-gray-500 line-through">{originalTx.category}</span>}
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
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>

            {/* AI-Powered Rule Suggestions (Conceptual Integration) */}
            <Card title="Plato AI: Smart Rule Suggestions" isCollapsible>
                <p className="text-gray-400 text-sm mb-4">
                    Plato AI can analyze your uncategorized transactions and historical patterns to suggest new automation rules, helping you streamline your financial management.
                </p>
                <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                    <p className="text-gray-500 text-center text-xs">
                        {/* AITransactionWidget could be used here. For simplicity, we'll keep it as a placeholder. */}
                        [ Placeholder for AI Rule Suggestion Widget ] <br/>
                        <button className="mt-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors">
                            Ask Plato for Rule Suggestions
                        </button>
                    </p>
                    <div className="mt-4 text-xs text-gray-400">
                        Example Suggestion: "You frequently spend at 'Groceries R Us' and manually categorize it as 'Groceries'. Would you like to create a rule to automate this?"
                    </div>
                </div>
            </Card>

            {/* Bulk Reconciliation / Other Workflows (Conceptual) */}
            <Card title="Bulk Workflows & Reconciliation">
                <p className="text-gray-400 text-sm mb-4">
                    Automate common bulk tasks like marking multiple transactions as reconciled, or applying specific tags across a filtered set.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <h4 className="font-semibold text-gray-200 text-sm mb-2">Bulk Mark as Reconciled</h4>
                        <p className="text-gray-400 text-xs mb-3">
                            Mark all transactions within a selected date range or filter as reconciled.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                            Select & Reconcile
                        </button>
                    </div>
                    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <h4 className="font-semibold text-gray-200 text-sm mb-2">Automated Statement Matching</h4>
                        <p className="text-gray-400 text-xs mb-3">
                            Upload a bank statement (CSV/OFX) and let the engine intelligently match and reconcile transactions.
                        </p>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                            Upload Statement
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};