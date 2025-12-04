import React, { useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { DataContext } from '../../../../context/DataContext';
import type { InsuranceClaim } from '../../../../types';

// --- New Types and Interfaces (Exported) ---

/**
 * Represents a customer in the insurance system.
 * @interface Customer
 * @property {string} id - Unique identifier for the customer.
 * @property {string} name - Full name of the customer.
 * @property {string} email - Email address of the customer.
 * @property {string} phone - Phone number of the customer.
 * @property {string} address - Physical address of the customer.
 * @property {Date} dateOfBirth - Customer's date of birth.
 * @property {string} [maritalStatus] - Marital status (optional).
 * @property {string} [occupation] - Customer's occupation (optional).
 * @property {string} memberSince - Date the customer became a member.
 * @property {boolean} hasActivePolicy - Indicates if the customer currently holds an active policy.
 * @property {number} totalPolicies - Total number of policies ever held by this customer.
 * @property {number} totalClaimsFiled - Total number of claims ever filed by this customer.
 * @property {number} customerLifetimeValue - Estimated lifetime value of the customer.
 */
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: Date;
    maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    occupation?: string;
    memberSince: string;
    hasActivePolicy: boolean;
    totalPolicies: number;
    totalClaimsFiled: number;
    customerLifetimeValue: number;
}

/**
 * Represents a policy held by a customer.
 * @interface InsurancePolicy
 * @property {string} id - Unique policy ID.
 * @property {string} customerId - ID of the customer holding the policy.
 * @property {string} policyHolderName - Name of the policy holder.
 * @property {'Auto' | 'Home' | 'Life' | 'Health' | 'Business'} type - Type of insurance policy.
 * @property {Date} startDate - Policy start date.
 * @property {Date} endDate - Policy end date.
 * @property {number} premiumAmount - Monthly or annual premium amount.
 * @property {number} deductible - Deductible amount.
 * @property {number} coverageAmount - Total coverage amount.
 * @property {'Active' | 'Lapsed' | 'Cancelled' | 'Pending'} status - Current status of the policy.
 * @property {string[]} coveredItems - List of items covered by the policy (e.g., vehicle VIN, property address).
 * @property {Date} lastRenewed - Date of the last renewal.
 * @property {Date | null} nextRenewal - Date of the next renewal (null if lapsed/cancelled).
 * @property {string} [agentId] - ID of the agent managing this policy.
 * @property {string} [underwriterNotes] - Notes from the underwriter.
 * @property {InsuranceCoverage[]} coverages - Detailed breakdown of coverages.
 * @property {string} [applicationId] - ID of the original application, if any.
 * @property {string} [paymentFrequency] - How often premiums are paid.
 */
export interface InsurancePolicy {
    id: string;
    customerId: string;
    policyHolderName: string;
    type: 'Auto' | 'Home' | 'Life' | 'Health' | 'Business';
    startDate: Date;
    endDate: Date;
    premiumAmount: number;
    deductible: number;
    coverageAmount: number;
    status: 'Active' | 'Lapsed' | 'Cancelled' | 'Pending';
    coveredItems: string[];
    lastRenewed: Date;
    nextRenewal: Date | null;
    agentId?: string;
    underwriterNotes?: string;
    coverages: InsuranceCoverage[];
    applicationId?: string;
    paymentFrequency?: 'Monthly' | 'Quarterly' | 'Annually';
}

/**
 * Represents a specific coverage within an insurance policy.
 * @interface InsuranceCoverage
 * @property {string} name - Name of the coverage (e.g., "Collision", "Dwelling").
 * @property {number} limit - Maximum payout for this coverage.
 * @property {number} deductible - Specific deductible for this coverage, if different from policy.
 * @property {boolean} active - Whether this specific coverage is active.
 * @property {string} [description] - A brief description of the coverage.
 * @property {string} [policyTermsRef] - Reference to a section in policy terms.
 */
export interface InsuranceCoverage {
    name: string;
    limit: number;
    deductible?: number;
    active: boolean;
    description?: string;
    policyTermsRef?: string;
}

/**
 * Represents a task for an insurance agent or user.
 * @interface AgentTask
 * @property {string} id - Unique task ID.
 * @property {string} title - Title of the task.
 * @property {string} description - Detailed description of the task.
 * @property {'Pending' | 'In Progress' | 'Completed' | 'Deferred' | 'Cancelled'} status - Current status of the task.
 * @property {string} assignedTo - ID of the user/agent assigned to the task.
 * @property {'High' | 'Medium' | 'Low'} priority - Priority level of the task.
 * @property {Date} dueDate - Due date for the task.
 * @property {Date} createdAt - Date the task was created.
 * @property {string | null} relatedClaimId - Optional ID of a related claim.
 * @property {string | null} relatedPolicyId - Optional ID of a related policy.
 * @property {string | null} relatedCustomerId - Optional ID of a related customer.
 * @property {Date | null} completedAt - Timestamp when the task was completed.
 * @property {string[]} tags - Arbitrary tags for task categorization.
 */
export interface AgentTask {
    id: string;
    title: string;
    description: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Deferred' | 'Cancelled';
    assignedTo: string; // User ID
    priority: 'High' | 'Medium' | 'Low';
    dueDate: Date;
    createdAt: Date;
    relatedClaimId: string | null;
    relatedPolicyId: string | null;
    relatedCustomerId: string | null;
    completedAt: Date | null;
    tags: string[];
}

/**
 * Represents a notification for a user.
 * @interface Notification
 * @property {string} id - Unique notification ID.
 * @property {string} message - The notification message.
 * @property {'info' | 'warning' | 'error' | 'success' | 'alert'} type - Type of notification.
 * @property {Date} timestamp - When the notification occurred.
 * @property {boolean} read - Whether the notification has been read.
 * @property {string | null} link - Optional link to a related resource.
 * @property {string[]} recipients - List of user IDs who should receive this notification.
 */
export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'alert';
    timestamp: Date;
    read: boolean;
    link: string | null;
    recipients: string[];
}

/**
 * Represents a document associated with a claim or policy.
 * @interface Document
 * @property {string} id - Unique document ID.
 * @property {string} fileName - Original file name.
 * @property {string} fileType - MIME type of the file.
 * @property {string} url - URL to access the document (simulated).
 * @property {Date} uploadedAt - Date the document was uploaded.
 * @property {string} uploadedBy - User who uploaded the document.
 * @property {'Claim' | 'Policy' | 'Customer' | 'Underwriting' | 'General' | 'Other'} category - Category of the document.
 * @property {string | null} relatedEntityId - ID of the related claim, policy, or customer.
 * @property {string} [aiSummary] - AI-generated summary of the document content.
 * @property {string[]} [tags] - AI-generated or manual tags.
 * @property {'Pending Review' | 'Reviewed' | 'Needs Attention'} [processingStatus] - Status of document processing.
 */
export interface Document {
    id: string;
    fileName: string;
    fileType: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    category: 'Claim' | 'Policy' | 'Customer' | 'Underwriting' | 'General' | 'Other';
    relatedEntityId: string | null;
    aiSummary?: string;
    tags?: string[];
    processingStatus?: 'Pending Review' | 'Reviewed' | 'Needs Attention';
}

/**
 * Represents a financial transaction related to a claim or policy.
 * @interface FinancialTransaction
 * @property {string} id - Unique transaction ID.
 * @property {string} entityId - ID of the related claim or policy.
 * @property {'Claim' | 'Policy'} entityType - Type of entity the transaction relates to.
 * @property {Date} transactionDate - Date of the transaction.
 * @property {number} amount - Amount of the transaction.
 * @property {'Payout' | 'Premium' | 'Deductible' | 'Refund' | 'Fee' | 'Commission'} type - Type of transaction.
 * @property {'Pending' | 'Completed' | 'Failed' | 'Reversed'} status - Status of the transaction.
 * @property {string} description - Description of the transaction.
 * @property {string | null} referenceId - External reference ID for the transaction.
 */
export interface FinancialTransaction {
    id: string;
    entityId: string;
    entityType: 'Claim' | 'Policy';
    transactionDate: Date;
    amount: number;
    type: 'Payout' | 'Premium' | 'Deductible' | 'Refund' | 'Fee' | 'Commission';
    status: 'Pending' | 'Completed' | 'Failed' | 'Reversed';
    description: string;
    referenceId: string | null;
}

/**
 * Represents a user of the system (e.g., an agent, admin).
 * @interface UserProfile
 * @property {string} id - Unique user ID.
 * @property {string} name - User's name.
 * @property {string} email - User's email.
 * @property {'Agent' | 'Underwriter' | 'Adjuster' | 'Admin' | 'CustomerService' | 'Manager'} role - User's role.
 * @property {string[]} managedPolicyIds - IDs of policies this user manages.
 * @property {string[]} managedClaimIds - IDs of claims this user is assigned to.
 * @property {string[]} skills - List of skills or specializations.
 * @property {Date} lastLogin - Last login timestamp.
 * @property {boolean} isActive - Is the user account currently active.
 * @property {string | null} department - Department the user belongs to.
 */
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'Agent' | 'Underwriter' | 'Adjuster' | 'Admin' | 'CustomerService' | 'Manager';
    managedPolicyIds: string[];
    managedClaimIds: string[];
    skills: string[];
    lastLogin: Date;
    isActive: boolean;
    department: string | null;
}

/**
 * Represents an AI model configuration.
 * @interface AIModelConfig
 * @property {string} id - Unique config ID.
 * @property {string} name - Name of the AI model.
 * @property {string} description - Description of its purpose.
 * @property {'Claim Assessment' | 'Underwriting' | 'Fraud Detection' | 'Document OCR' | 'Sentiment Analysis' | 'Chatbot'} type - Type of AI application.
 * @property {string} modelId - Actual identifier for the AI model (e.g., 'gemini-2.5-flash').
 * @property {number} temperature - Model temperature setting. (0.0 - 1.0)
 * @property {number} topP - Top P setting. (0.0 - 1.0)
 * @property {number} maxOutputTokens - Max output tokens.
 * @property {boolean} enabled - Whether the model is active.
 * @property {Date} lastUpdated - Last update timestamp.
 * @property {string} updatedBy - User who last updated it.
 * @property {number} [confidenceThreshold] - Minimum confidence score for auto-action (e.g., for fraud detection).
 */
export interface AIModelConfig {
    id: string;
    name: string;
    description: string;
    type: 'Claim Assessment' | 'Underwriting' | 'Fraud Detection' | 'Document OCR' | 'Sentiment Analysis' | 'Chatbot';
    modelId: string;
    temperature: number;
    topP: number;
    maxOutputTokens: number;
    enabled: boolean;
    lastUpdated: Date;
    updatedBy: string;
    confidenceThreshold?: number;
}

/**
 * Represents an audit log entry for system actions.
 * @interface AuditLogEntry
 * @property {string} id - Unique log entry ID.
 * @property {Date} timestamp - When the action occurred.
 * @property {string} userId - ID of the user who performed the action.
 * @property {string} userName - Name of the user.
 * @property {string} action - Description of the action (e.g., "Updated Claim Status").
 * @property {string} entityType - Type of entity affected (e.g., 'Claim', 'Policy').
 * @property {string} entityId - ID of the affected entity.
 * @property {string | null} oldValue - Previous value of the changed field (JSON string or simple value).
 * @property {string | null} newValue - New value of the changed field (JSON string or simple value).
 * @property {string | null} ipAddress - IP address from which the action originated.
 */
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    action: string;
    entityType: 'Claim' | 'Policy' | 'Customer' | 'Task' | 'Document' | 'AIConfig' | 'User';
    entityId: string;
    oldValue: string | null;
    newValue: string | null;
    ipAddress: string | null;
}

/**
 * Represents a simulated message in a communication thread for a customer.
 * @interface CommunicationMessage
 * @property {string} id - Unique message ID.
 * @property {string} customerId - ID of the customer involved.
 * @property {string} senderId - ID of the sender (user or customer).
 * @property {string} senderType - 'User' or 'Customer'.
 * @property {Date} timestamp - When the message was sent.
 * @property {string} content - The message content.
 * @property {'Email' | 'Chat' | 'Call Log' | 'Internal Note'} channel - Communication channel.
 * @property {string | null} relatedClaimId - Optional related claim.
 * @property {string | null} relatedPolicyId - Optional related policy.
 * @property {string} [aiSentiment] - AI-derived sentiment ('Positive', 'Neutral', 'Negative').
 */
export interface CommunicationMessage {
    id: string;
    customerId: string;
    senderId: string;
    senderType: 'User' | 'Customer';
    timestamp: Date;
    content: string;
    channel: 'Email' | 'Chat' | 'Call Log' | 'Internal Note';
    relatedClaimId: string | null;
    relatedPolicyId: string | null;
    aiSentiment?: 'Positive' | 'Neutral' | 'Negative';
}


// --- Mock Data Generation (Exported) ---

/**
 * Generates a random UUID.
 * @returns {string} A UUID string.
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Generates a random date within a given range.
 * @param {Date} start - Start date.
 * @param {Date} end - End date.
 * @returns {Date} A random Date object.
 */
export const getRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generates mock customer data.
 * @param {number} count - Number of customers to generate.
 * @returns {Customer[]} Array of mock customers.
 */
export const generateMockCustomers = (count: number): Customer[] => {
    const customers: Customer[] = [];
    const names = ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank White', 'Grace Hopper', 'Harry Potter', 'Ivy Queen', 'Jack Ryan', 'Karen Lee', 'Liam Miller', 'Mia Davis', 'Noah Wilson', 'Olivia Taylor', 'Peter Clark', 'Quinn Lewis', 'Rachel Hall', 'Sam White', 'Tina Green'];
    const domains = ['example.com', 'test.org', 'mail.net', 'company.io'];
    const addresses = ['123 Main St', '456 Oak Ave', '789 Pine Ln', '101 Elm Rd', '202 Birch Blvd', '303 Cedar Dr', '404 Maple Ct', '505 Willow Way'];
    const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
    const occupations = ['Engineer', 'Doctor', 'Teacher', 'Artist', 'Programmer', 'Manager', 'Analyst', 'Consultant', 'Chef', 'Pilot', 'Nurse', 'Student'];

    for (let i = 0; i < count; i++) {
        const name = names[Math.floor(Math.random() * names.length)] + (Math.random() > 0.5 ? ` #${Math.floor(Math.random() * 100)}` : '');
        const firstName = name.split(' ')[0].toLowerCase();
        const lastName = name.split(' ')[1]?.toLowerCase() || 'user';
        const email = `${firstName}.${lastName}@${domains[Math.floor(Math.random() * domains.length)]}`;
        const phone = `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const dob = getRandomDate(new Date('1950-01-01'), new Date('2000-01-01'));
        const memberSince = getRandomDate(new Date('2010-01-01'), new Date()).toISOString().split('T')[0];

        customers.push({
            id: generateUUID(),
            name: name,
            email: email,
            phone: phone,
            address: `${Math.floor(100 + Math.random() * 900)} ${addresses[Math.floor(Math.random() * addresses.length)]}`,
            dateOfBirth: dob,
            maritalStatus: maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)],
            occupation: occupations[Math.floor(Math.random() * occupations.length)],
            memberSince: memberSince,
            hasActivePolicy: Math.random() > 0.2, // 80% have active policy
            totalPolicies: Math.floor(1 + Math.random() * 5),
            totalClaimsFiled: Math.floor(Math.random() * 4), // 0-3 claims
            customerLifetimeValue: Math.floor(1000 + Math.random() * 100000)
        });
    }
    return customers;
};

/**
 * Generates mock insurance policy data.
 * @param {number} count - Number of policies to generate.
 * @param {Customer[]} customers - List of existing customers to link policies to.
 * @returns {InsurancePolicy[]} Array of mock policies.
 */
export const generateMockPolicies = (count: number, customers: Customer[]): InsurancePolicy[] => {
    const policies: InsurancePolicy[] = [];
    const policyTypes = ['Auto', 'Home', 'Life', 'Health', 'Business'];
    const policyStatuses = ['Active', 'Lapsed', 'Cancelled', 'Pending'];
    const paymentFrequencies = ['Monthly', 'Quarterly', 'Annually'];

    for (let i = 0; i < count; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const type = policyTypes[Math.floor(Math.random() * policyTypes.length)];
        const startDate = getRandomDate(new Date('2015-01-01'), new Date());
        const endDate = new Date(startDate.getFullYear() + Math.floor(1 + Math.random() * 5), startDate.getMonth(), startDate.getDate());
        const status = policyStatuses[Math.floor(Math.random() * policyStatuses.length)];
        const premium = Math.floor(100 + Math.random() * 1000);
        const deductible = Math.floor(500 + Math.random() * 2000);
        const coverage = Math.floor(50000 + Math.random() * 500000);
        const lastRenewed = getRandomDate(new Date(startDate.getTime()), new Date());
        const nextRenewal = status === 'Active' ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

        const generateCoverages = (): InsuranceCoverage[] => {
            if (type === 'Auto') {
                return [
                    { name: 'Collision', limit: coverage * 0.5, deductible: deductible, active: true, description: 'Covers damage from collision with another vehicle or object.' },
                    { name: 'Comprehensive', limit: coverage * 0.3, active: true, description: 'Covers damage from non-collision events like theft, vandalism, fire.' },
                    { name: 'Liability', limit: coverage * 0.2, active: true, description: 'Covers damages to other parties in an at-fault accident.' },
                    { name: 'Roadside Assistance', limit: 200, active: Math.random() > 0.5, description: 'Towing, jump starts, flat tire changes.' }
                ];
            } else if (type === 'Home') {
                return [
                    { name: 'Dwelling', limit: coverage * 0.7, deductible: deductible, active: true, description: 'Covers the physical structure of your home.' },
                    { name: 'Personal Property', limit: coverage * 0.2, active: true, description: 'Covers your personal belongings inside the home.' },
                    { name: 'Liability', limit: coverage * 0.1, active: true, description: 'Covers costs if someone is injured on your property.' },
                    { name: 'Water Backup', limit: 10000, active: Math.random() > 0.4, description: 'Covers damage from sewer or drain backup.' }
                ];
            } else if (type === 'Life') {
                return [
                    { name: 'Term Life', limit: coverage, active: true, description: 'Coverage for a specific period of time.' },
                    { name: 'Accidental Death', limit: coverage * 0.2, active: Math.random() > 0.3, description: 'Additional payout for accidental death.' }
                ];
            }
            return [{ name: `${type} Basic`, limit: coverage, active: true, description: `Standard coverage for ${type.toLowerCase()} insurance.` }];
        };

        policies.push({
            id: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
            customerId: customer.id,
            policyHolderName: customer.name,
            type: type as any,
            startDate: startDate,
            endDate: endDate,
            premiumAmount: premium,
            deductible: deductible,
            coverageAmount: coverage,
            status: status as any,
            coveredItems: type === 'Auto' ? [`VIN: ${Math.random().toString(36).substring(2, 12).toUpperCase()}`] : [`Property Address: ${customer.address}`],
            lastRenewed: lastRenewed,
            nextRenewal: nextRenewal,
            agentId: Math.random() > 0.5 ? `USR-${Math.floor(100 + Math.random() * 900)}` : undefined,
            underwriterNotes: Math.random() > 0.7 ? `Standard risk assessment. Policy approved on ${startDate.toLocaleDateString()}.` : undefined,
            coverages: generateCoverages(),
            applicationId: `APP-${Math.floor(10000 + Math.random() * 90000)}`,
            paymentFrequency: paymentFrequencies[Math.floor(Math.random() * paymentFrequencies.length)] as any,
        });
    }
    return policies;
};

/**
 * Generates mock insurance claim data.
 * This is based on the original `InsuranceClaim` type from `types.ts`, extended with more detail.
 * @param {number} count - Number of claims to generate.
 * @param {Customer[]} customers - List of existing customers.
 * @param {InsurancePolicy[]} policies - List of existing policies.
 * @returns {InsuranceClaim[]} Array of mock claims.
 */
export const generateMockClaims = (count: number, customers: Customer[], policies: InsurancePolicy[]): InsuranceClaim[] => {
    const claims: InsuranceClaim[] = [];
    const claimDescriptions = [
        'Minor fender bender on Main Street, rear-end collision.',
        'Tree fell on roof during storm, significant damage to attic.',
        'Lost engagement ring during vacation, value $15,000.',
        'Kitchen fire due to faulty appliance, extensive smoke damage.',
        'Car stolen from driveway overnight, reported to police.',
        'Medical emergency requiring urgent care, ambulance fees and hospital stay.',
        'Business property damage due to burst pipe, inventory affected.',
        'Slip and fall injury at home, broken arm.',
        'Hail damage to vehicle windshield and hood.',
        'Water damage in basement from heavy rain, furniture ruined.'
    ];
    const claimStatuses = ['New', 'Under Review', 'Approved', 'Denied'];

    for (let i = 0; i < count; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const customerPolicies = policies.filter(p => p.customerId === customer.id && p.status === 'Active');
        const policy = customerPolicies.length > 0 ? customerPolicies[Math.floor(Math.random() * customerPolicies.length)] : null;

        const dateFiled = getRandomDate(new Date('2023-01-01'), new Date());
        const amount = Math.floor(500 + Math.random() * 25000); // Claim amount
        const status = claimStatuses[Math.floor(Math.random() * claimStatuses.length)];

        claims.push({
            id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
            policyId: policy ? policy.id : `POL-NONE-${i}`, // Link to a real policy or a dummy one
            policyholder: customer.name,
            description: claimDescriptions[Math.floor(Math.random() * claimDescriptions.length)],
            amount: amount,
            dateFiled: dateFiled.toISOString(),
            status: status as any,
            fraudDetected: Math.random() < 0.15, // 15% chance of fraud detection
            assignedTo: Math.random() > 0.6 ? `USR-${Math.floor(100 + Math.random() * 900)}` : undefined,
            notes: Math.random() > 0.5 ? `Initial assessment suggests claim is ${status.toLowerCase()}.` : undefined,
            payoutAmount: status === 'Approved' ? Math.round(amount * (0.5 + Math.random() * 0.5)) : 0, // Payout if approved
            dateOfLoss: getRandomDate(new Date(dateFiled.getTime() - 30 * 24 * 60 * 60 * 1000), dateFiled).toISOString(), // Loss happened recently before filing
            incidentLocation: customer.address,
            incidentType: policy?.type === 'Auto' ? 'Vehicle Accident' : policy?.type === 'Home' ? 'Property Damage' : 'Other',
        });
    }
    return claims;
};

/**
 * Generates mock agent tasks.
 * @param {number} count - Number of tasks to generate.
 * @param {UserProfile[]} users - List of user profiles to assign tasks to.
 * @param {InsuranceClaim[]} claims - List of existing claims.
 * @param {InsurancePolicy[]} policies - List of existing policies.
 * @param {Customer[]} customers - List of existing customers.
 * @returns {AgentTask[]} Array of mock tasks.
 */
export const generateMockTasks = (
    count: number,
    users: UserProfile[],
    claims: InsuranceClaim[],
    policies: InsurancePolicy[],
    customers: Customer[]
): AgentTask[] => {
    const tasks: AgentTask[] = [];
    const titles = [
        'Review New Claim Submission', 'Follow Up on Policy Renewal', 'Process Policy Endorsement', 'Customer Inquiry - Update Contact Info',
        'Fraud Flag Review Required', 'Underwriting Assessment - New Application', 'Verify Document Uploads', 'Approve Claim Payout', 'Assign Subrogation Case',
        'Customer Service Call Back', 'Policy Cancellation Request', 'Premium Adjustment Review', 'Compliance Check on Policyholder',
        'Gather additional info for claim', 'Schedule adjuster visit', 'Prepare renewal offer'
    ];
    const statuses = ['Pending', 'In Progress', 'Completed', 'Deferred', 'Cancelled'];
    const priorities = ['High', 'Medium', 'Low'];
    const tags = ['Urgent', 'Follow-up', 'Investigation', 'Client-facing', 'Internal', 'Compliance'];

    for (let i = 0; i < count; i++) {
        const assignedTo = users.length > 0 ? users[Math.floor(Math.random() * users.length)].id : 'USR-DEFAULT';
        const createdAt = getRandomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()); // Last 60 days
        const dueDate = getRandomDate(createdAt, new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)); // Next 60 days
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const completedAt = status === 'Completed' ? getRandomDate(createdAt, new Date()) : null;

        let relatedClaimId: string | null = null;
        let relatedPolicyId: string | null = null;
        let relatedCustomerId: string | null = null;

        const relatedEntityType = Math.random();
        if (relatedEntityType < 0.3 && claims.length > 0) {
            relatedClaimId = claims[Math.floor(Math.random() * claims.length)].id;
        } else if (relatedEntityType < 0.6 && policies.length > 0) {
            relatedPolicyId = policies[Math.floor(Math.random() * policies.length)].id;
            const policy = policies.find(p => p.id === relatedPolicyId);
            if (policy) relatedCustomerId = policy.customerId;
        } else if (relatedEntityType < 0.9 && customers.length > 0) {
            relatedCustomerId = customers[Math.floor(Math.random() * customers.length)].id;
        }

        const taskTags = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => tags[Math.floor(Math.random() * tags.length)]);

        tasks.push({
            id: generateUUID(),
            title: titles[Math.floor(Math.random() * titles.length)],
            description: `Detailed description for task ID ${i+1}. This task requires attention to ${relatedClaimId || relatedPolicyId || relatedCustomerId || 'a general insurance operation'}. Ensure all documentation is accurate and follow up with relevant parties.`,
            status: status as any,
            assignedTo: assignedTo,
            priority: priorities[Math.floor(Math.random() * priorities.length)] as any,
            dueDate: dueDate,
            createdAt: createdAt,
            relatedClaimId: relatedClaimId,
            relatedPolicyId: relatedPolicyId,
            relatedCustomerId: relatedCustomerId,
            completedAt: completedAt,
            tags: Array.from(new Set(taskTags)), // Remove duplicates
        });
    }
    return tasks;
};

/**
 * Generates mock notifications.
 * @param {number} count - Number of notifications to generate.
 * @param {UserProfile[]} users - List of user profiles to assign notifications to.
 * @returns {Notification[]} Array of mock notifications.
 */
export const generateMockNotifications = (count: number, users: UserProfile[]): Notification[] => {
    const notifications: Notification[] = [];
    const messages = [
        'New claim filed by [PolicyholderName]. Review required.',
        'Policy #POL-ID due for renewal in 30 days. Action needed.',
        'Urgent: Fraud flag detected on claim #CLM-ID. Immediate review.',
        'Task "[TaskTitle]" assigned to you. Due by [DueDate].',
        'System update completed successfully. New features available.',
        'Customer support inquiry from [CustomerName]. Respond within 24 hours.',
        'New document uploaded for policy #POL-ID. Verify content.',
        'Claim #CLM-ID approved for payout. Process payment.',
        'High priority task added: Underwriting for new business policy application.',
        'Manager approval required for claim #CLM-ID over $50,000.',
        'New customer [CustomerName] enrolled. Welcome email sent.'
    ];
    const types = ['info', 'warning', 'error', 'success', 'alert'];

    for (let i = 0; i < count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const messageTemplate = messages[Math.floor(Math.random() * messages.length)];
        const message = messageTemplate
            .replace('[PolicyholderName]', `Customer ${Math.floor(Math.random() * 100)}`)
            .replace('[PolicyName]', `Policy #${Math.floor(1000 + Math.random() * 9000)}`)
            .replace('[PolicyID]', `POL-${Math.floor(100000 + Math.random() * 900000)}`)
            .replace('[ClaimID]', `CLM-${Math.floor(1000 + Math.random() * 9000)}`)
            .replace('[TaskTitle]', `Review Claim ${Math.floor(1000 + Math.random() * 9000)}`)
            .replace('[DueDate]', getRandomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).toLocaleDateString())
            .replace('[CustomerName]', `Cust ${Math.floor(Math.random() * 100)}`);

        notifications.push({
            id: generateUUID(),
            message: message,
            type: types[Math.floor(Math.random() * types.length)] as any,
            timestamp: getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()), // Last 7 days
            read: Math.random() > 0.6, // 40% are unread
            link: Math.random() > 0.7 ? `/dashboard/details/${Math.floor(1000 + Math.random() * 9000)}` : null,
            recipients: [user.id],
        });
    }
    return notifications;
};

/**
 * Generates mock documents.
 * @param {number} count - Number of documents to generate.
 * @param {InsuranceClaim[]} claims - List of existing claims.
 * @param {InsurancePolicy[]} policies - List of existing policies.
 * @param {Customer[]} customers - List of existing customers.
 * @param {UserProfile[]} users - List of system users for 'uploadedBy'.
 * @returns {Document[]} Array of mock documents.
 */
export const generateMockDocuments = (
    count: number,
    claims: InsuranceClaim[],
    policies: InsurancePolicy[],
    customers: Customer[],
    users: UserProfile[]
): Document[] => {
    const documents: Document[] = [];
    const fileNamesTemplates = [
        'accident_report_[ID].pdf', 'policy_terms_[ID].docx', 'drivers_license_[ID].jpg', 'medical_bill_[ID].pdf',
        'invoice_[ID].png', 'property_deed_[ID].pdf', 'claim_photos_[ID].zip', 'underwriting_report_[ID].xlsx',
        'customer_correspondence_[ID].eml', 'signed_agreement_[ID].pdf'
    ];
    const fileTypes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png', 'application/zip', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'message/rfc822'];
    const categories: Document['category'][] = ['Claim', 'Policy', 'Customer', 'Underwriting', 'General', 'Other'];
    const processingStatuses: Document['processingStatus'][] = ['Pending Review', 'Reviewed', 'Needs Attention'];
    const tags = ['AI_GENERATED', 'URGENT_REVIEW', 'CONFIDENTIAL', 'EXTERNAL_SOURCE', 'INTERNAL_MEMO', 'FINANCIAL'];

    for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        let relatedEntityId: string | null = null;
        let entityNamePart: string = '';

        if (category === 'Claim' && claims.length > 0) {
            const claim = claims[Math.floor(Math.random() * claims.length)];
            relatedEntityId = claim.id;
            entityNamePart = claim.policyholder;
        } else if (category === 'Policy' && policies.length > 0) {
            const policy = policies[Math.floor(Math.random() * policies.length)];
            relatedEntityId = policy.id;
            entityNamePart = policy.policyHolderName;
        } else if (category === 'Customer' && customers.length > 0) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            relatedEntityId = customer.id;
            entityNamePart = customer.name;
        } else if (category === 'Underwriting' && policies.length > 0) {
             const policy = policies[Math.floor(Math.random() * policies.length)];
             relatedEntityId = policy.applicationId || policy.id; // Link to application or policy
             entityNamePart = policy.policyHolderName;
        }

        const fileNameTemplate = fileNamesTemplates[Math.floor(Math.random() * fileNamesTemplates.length)];
        const uniqueId = Math.floor(1000 + Math.random() * 9000);
        const fileName = fileNameTemplate.replace('[ID]', `${relatedEntityId || uniqueId}`);
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        const uploadedBy = users.length > 0 ? users[Math.floor(Math.random() * users.length)].id : 'System_Admin';
        const docTags = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => tags[Math.floor(Math.random() * tags.length)]);


        documents.push({
            id: generateUUID(),
            fileName: fileName,
            fileType: fileType,
            url: `https://example.com/docs/${generateUUID()}.${fileType.split('/').pop()}`,
            uploadedAt: getRandomDate(new Date('2022-01-01'), new Date()),
            uploadedBy: uploadedBy,
            category: category,
            relatedEntityId: relatedEntityId,
            aiSummary: Math.random() > 0.6 ? `AI summary: Key details extracted from ${fileName} relate to ${category.toLowerCase()} ${relatedEntityId || 'N/A'} for ${entityNamePart || 'an unknown entity'} and indicate [some relevant detail, e.g., damage assessment, policy terms review, contact info].` : undefined,
            tags: Array.from(new Set(docTags)),
            processingStatus: processingStatuses[Math.floor(Math.random() * processingStatuses.length)],
        });
    }
    return documents;
};

/**
 * Generates mock financial transactions.
 * @param {number} count - Number of transactions to generate.
 * @param {InsuranceClaim[]} claims - List of existing claims.
 * @param {InsurancePolicy[]} policies - List of existing policies.
 * @returns {FinancialTransaction[]} Array of mock transactions.
 */
export const generateMockFinancialTransactions = (
    count: number,
    claims: InsuranceClaim[],
    policies: InsurancePolicy[]
): FinancialTransaction[] => {
    const transactions: FinancialTransaction[] = [];
    const types = ['Payout', 'Premium', 'Deductible', 'Refund', 'Fee', 'Commission'];
    const statuses = ['Pending', 'Completed', 'Failed', 'Reversed'];

    for (let i = 0; i < count; i++) {
        const entityType = Math.random() > 0.5 ? 'Claim' : 'Policy';
        let entityId: string = '';
        if (entityType === 'Claim' && claims.length > 0) {
            entityId = claims[Math.floor(Math.random() * claims.length)].id;
        } else if (entityType === 'Policy' && policies.length > 0) {
            entityId = policies[Math.floor(Math.random() * policies.length)].id;
        } else {
            // Fallback if no claims/policies exist, or just skip this iteration
            continue;
        }

        const type = types[Math.floor(Math.random() * types.length)];
        let amount = 0;
        if (type === 'Payout') amount = Math.floor(1000 + Math.random() * 50000);
        else if (type === 'Premium') amount = Math.floor(50 + Math.random() * 500);
        else if (type === 'Deductible') amount = Math.floor(250 + Math.random() * 1000);
        else if (type === 'Refund') amount = Math.floor(50 + Math.random() * 1000);
        else if (type === 'Fee') amount = Math.floor(10 + Math.random() * 200);
        else if (type === 'Commission') amount = Math.floor(20 + Math.random() * 1000);


        transactions.push({
            id: generateUUID(),
            entityId: entityId,
            entityType: entityType,
            transactionDate: getRandomDate(new Date('2023-01-01'), new Date()),
            amount: amount,
            type: type as any,
            status: statuses[Math.floor(Math.random() * statuses.length)] as any,
            description: `${type} transaction for ${entityType} ${entityId}. Initiated by system.`,
            referenceId: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
        });
    }
    return transactions;
};

/**
 * Generates mock user profiles.
 * @param {number} count - Number of users to generate.
 * @returns {UserProfile[]} Array of mock user profiles.
 */
export const generateMockUserProfiles = (count: number): UserProfile[] => {
    const users: UserProfile[] = [];
    const roles = ['Agent', 'Underwriter', 'Adjuster', 'Admin', 'CustomerService', 'Manager'];
    const names = ['John Doe', 'Jane Smith', 'Peter Jones', 'Susan White', 'Mike Green', 'Emily Clark', 'David Wilson', 'Sarah Davis', 'Chris Taylor', 'Laura Brown'];
    const skills = ['Auto Insurance', 'Home Insurance', 'Life Insurance', 'Fraud Investigation', 'Customer Support', 'Risk Assessment', 'Commercial Policies', 'Claims Adjudication', 'Policy Sales'];
    const departments = ['Claims', 'Underwriting', 'Sales', 'Customer Service', 'Administration', 'IT'];

    for (let i = 0; i < count; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const userSkills = Array.from({ length: Math.floor(1 + Math.random() * 3) }, () => skills[Math.floor(Math.random() * skills.length)]);

        users.push({
            id: `USR-${Math.floor(100 + Math.random() * 900)}`,
            name: name,
            email: `${name.toLowerCase().replace(' ', '.')}@insurancecorp.com`,
            role: role as any,
            managedPolicyIds: [], // Will be populated later
            managedClaimIds: [], // Will be populated later
            skills: Array.from(new Set(userSkills)), // Remove duplicates
            lastLogin: getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
            isActive: Math.random() > 0.05, // 95% active
            department: departments[Math.floor(Math.random() * departments.length)],
        });
    }
    return users;
};

/**
 * Generates mock AI model configurations.
 * @returns {AIModelConfig[]} Array of mock AI model configurations.
 */
export const generateMockAIConfigs = (): AIModelConfig[] => {
    const configs: AIModelConfig[] = [];
    const aiTypes: AIModelConfig['type'][] = ['Claim Assessment', 'Underwriting', 'Fraud Detection', 'Document OCR', 'Sentiment Analysis', 'Chatbot'];
    const modelIds = ['gemini-2.5-flash', 'gemini-1.5-pro', 'claude-3-opus', 'gpt-4o', 'llama-3-8b'];

    aiTypes.forEach((type, index) => {
        configs.push({
            id: `AI-CFG-${index + 1}`,
            name: `${type} Model`,
            description: `Configuration for the ${type.toLowerCase()} AI model. This model assists with ${type.toLowerCase()} tasks, improving efficiency and accuracy across the platform.`,
            type: type as any,
            modelId: modelIds[Math.floor(Math.random() * modelIds.length)],
            temperature: parseFloat((0.2 + Math.random() * 0.7).toFixed(1)),
            topP: parseFloat((0.5 + Math.random() * 0.4).toFixed(1)),
            maxOutputTokens: Math.floor(256 + Math.random() * 768),
            enabled: Math.random() > 0.1, // 90% enabled
            lastUpdated: getRandomDate(new Date('2023-06-01'), new Date()),
            updatedBy: 'admin_user',
            confidenceThreshold: type === 'Fraud Detection' ? parseFloat((0.7 + Math.random() * 0.2).toFixed(2)) : undefined,
        });
    });
    return configs;
};

/**
 * Generates mock audit log entries.
 * @param {number} count - Number of log entries to generate.
 * @param {UserProfile[]} users - List of users for logging.
 * @param {InsuranceClaim[]} claims - List of claims.
 * @param {InsurancePolicy[]} policies - List of policies.
 * @param {Customer[]} customers - List of customers.
 * @returns {AuditLogEntry[]} Array of mock audit log entries.
 */
export const generateMockAuditLogs = (
    count: number,
    users: UserProfile[],
    claims: InsuranceClaim[],
    policies: InsurancePolicy[],
    customers: Customer[]
): AuditLogEntry[] => {
    const logs: AuditLogEntry[] = [];
    const actions = ['Created', 'Updated Status', 'Modified Details', 'Approved', 'Denied', 'Viewed', 'Uploaded Document', 'Assigned Task', 'Deleted'];
    const entityTypes: AuditLogEntry['entityType'][] = ['Claim', 'Policy', 'Customer', 'Task', 'Document', 'AIConfig', 'User'];
    const ipAddresses = ['192.168.1.1', '10.0.0.5', '172.16.0.10', null];

    for (let i = 0; i < count; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        let entityId = '';

        if (entityType === 'Claim' && claims.length > 0) {
            entityId = claims[Math.floor(Math.random() * claims.length)].id;
        } else if (entityType === 'Policy' && policies.length > 0) {
            entityId = policies[Math.floor(Math.random() * policies.length)].id;
        } else if (entityType === 'Customer' && customers.length > 0) {
            entityId = customers[Math.floor(Math.random() * customers.length)].id;
        } else if (entityType === 'Task' && users.length > 0) { // Using users as a proxy for tasks, just for ID
            entityId = generateUUID();
        } else if (entityType === 'Document' && users.length > 0) {
            entityId = generateUUID();
        } else if (entityType === 'AIConfig' && users.length > 0) {
            entityId = `AI-CFG-${Math.floor(Math.random() * 5) + 1}`;
        } else if (entityType === 'User') {
            entityId = user.id;
        } else {
            entityId = 'N/A';
        }

        const oldValue = Math.random() > 0.5 ? JSON.stringify({ status: 'OldStatus' }) : null;
        const newValue = Math.random() > 0.5 ? JSON.stringify({ status: 'NewStatus' }) : null;

        logs.push({
            id: generateUUID(),
            timestamp: getRandomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()), // Last 90 days
            userId: user.id,
            userName: user.name,
            action: `${action} ${entityType.toLowerCase()}`,
            entityType: entityType,
            entityId: entityId,
            oldValue: oldValue,
            newValue: newValue,
            ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        });
    }
    return logs;
};

/**
 * Generates mock communication messages.
 * @param {number} count - Number of messages to generate.
 * @param {Customer[]} customers - List of customers.
 * @param {UserProfile[]} users - List of users.
 * @param {InsuranceClaim[]} claims - List of claims.
 * @param {InsurancePolicy[]} policies - List of policies.
 * @returns {CommunicationMessage[]} Array of mock messages.
 */
export const generateMockCommunicationMessages = (
    count: number,
    customers: Customer[],
    users: UserProfile[],
    claims: InsuranceClaim[],
    policies: InsurancePolicy[]
): CommunicationMessage[] => {
    const messages: CommunicationMessage[] = [];
    const contents = [
        'Called customer to confirm claim details. Left voicemail.',
        'Customer emailed asking for policy renewal options.',
        'Internal note: Underwriter needs to review additional documents.',
        'Chat with customer about billing discrepancy. Resolved.',
        'Follow-up email sent regarding outstanding claim documents for CLM-ID.',
        'Customer called regarding the status of their Auto policy POL-ID.',
        'Received photos of vehicle damage for claim CLM-ID.'
    ];
    const channels = ['Email', 'Chat', 'Call Log', 'Internal Note'];
    const sentiments = ['Positive', 'Neutral', 'Negative'];

    for (let i = 0; i < count; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const senderType = Math.random() > 0.7 ? 'Customer' : 'User';
        const senderId = senderType === 'User' ? users[Math.floor(Math.random() * users.length)].id : customer.id;
        const timestamp = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
        const contentTemplate = contents[Math.floor(Math.random() * contents.length)];
        const channel = channels[Math.floor(Math.random() * channels.length)] as any;
        const aiSentiment = sentiments[Math.floor(Math.random() * sentiments.length)] as any;

        let relatedClaimId: string | null = null;
        let relatedPolicyId: string | null = null;

        if (Math.random() > 0.5 && claims.length > 0) {
            relatedClaimId = claims[Math.floor(Math.random() * claims.length)].id;
        } else if (Math.random() > 0.5 && policies.length > 0) {
            relatedPolicyId = policies[Math.floor(Math.random() * policies.length)].id;
        }

        const content = contentTemplate
            .replace('CLM-ID', relatedClaimId || `CLM-${Math.floor(1000 + Math.random() * 9000)}`)
            .replace('POL-ID', relatedPolicyId || `POL-${Math.floor(100000 + Math.random() * 900000)}`);

        messages.push({
            id: generateUUID(),
            customerId: customer.id,
            senderId: senderId,
            senderType: senderType,
            timestamp: timestamp,
            content: content,
            channel: channel,
            relatedClaimId: relatedClaimId,
            relatedPolicyId: relatedPolicyId,
            aiSentiment: Math.random() > 0.3 ? aiSentiment : undefined,
        });
    }
    return messages;
};


// --- Extended Data Context State Interface ---
/**
 * Interface for the extended data context state, including new entities.
 * @interface ExtendedDataContextState
 * @property {InsuranceClaim[]} insuranceClaims - Existing insurance claims.
 * @property {Customer[]} customers - List of customers.
 * @property {InsurancePolicy[]} insurancePolicies - List of insurance policies.
 * @property {AgentTask[]} agentTasks - List of agent tasks.
 * @property {Notification[]} notifications - List of user notifications.
 * @property {Document[]} documents - List of uploaded documents.
 * @property {FinancialTransaction[]} financialTransactions - List of financial transactions.
 * @property {UserProfile[]} userProfiles - List of system user profiles.
 * @property {AIModelConfig[]} aiConfigs - List of AI model configurations.
 * @property {AuditLogEntry[]} auditLogs - List of system audit log entries.
 * @property {CommunicationMessage[]} communicationMessages - List of communication messages.
 * @property {function(InsuranceClaim): void} updateClaimStatus - Function to update claim status (simulated).
 * @property {function(AgentTask): void} updateTask - Function to update task (simulated).
 * @property {function(Notification): void} markNotificationAsRead - Function to mark notification as read (simulated).
 * @property {function(InsurancePolicy): void} updatePolicyStatus - Function to update policy status (simulated).
 * @property {function(Document): void} addDocument - Function to add a new document (simulated).
 * @property {function(AIModelConfig): void} updateAIConfig - Function to update an AI model configuration (simulated).
 * @property {function(Customer): void} updateCustomer - Function to update a customer profile (simulated).
 * @property {function(UserProfile): void} updateUserProfile - Function to update a user profile (simulated).
 * @property {function(FinancialTransaction): void} addTransaction - Function to add a new financial transaction (simulated).
 * @property {function(AgentTask): void} addTask - Function to add a new task (simulated).
 */
export interface ExtendedDataContextState {
    insuranceClaims: InsuranceClaim[];
    customers: Customer[];
    insurancePolicies: InsurancePolicy[];
    agentTasks: AgentTask[];
    notifications: Notification[];
    documents: Document[];
    financialTransactions: FinancialTransaction[];
    userProfiles: UserProfile[];
    aiConfigs: AIModelConfig[];
    auditLogs: AuditLogEntry[];
    communicationMessages: CommunicationMessage[];

    updateClaimStatus: (claim: InsuranceClaim) => void;
    updateTask: (task: AgentTask) => void;
    markNotificationAsRead: (notification: Notification) => void;
    updatePolicyStatus: (policy: InsurancePolicy) => void;
    addDocument: (document: Document) => void;
    updateAIConfig: (config: AIModelConfig) => void;
    updateCustomer: (customer: Customer) => void; // Placeholder
    updateUserProfile: (user: UserProfile) => void; // Placeholder
    addTransaction: (transaction: FinancialTransaction) => void; // Placeholder
    addTask: (task: AgentTask) => void;
}

// --- Helper Components & Hooks (Exported) ---

/**
 * Custom hook for debouncing a value.
 * @param {T} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} The debounced value.
 * @template T
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * A basic search input component with debounce.
 * @param {object} props - Component props.
 * @param {string} props.placeholder - Placeholder text for the input.
 * @param {function(string): void} props.onSearch - Callback function on search term change.
 * @param {string} [props.initialValue] - Initial value for the input.
 * @returns {React.FC} SearchInput component.
 */
export const SearchInput: React.FC<{ placeholder: string; onSearch: (term: string) => void; initialValue?: string }> = ({ placeholder, onSearch, initialValue = '' }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        onSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, onSearch]);

    return (
        <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full md:w-auto"
        />
    );
};

/**
 * Pagination controls component.
 * @param {object} props - Component props.
 * @param {number} props.currentPage - The current page number (1-indexed).
 * @param {number} props.totalPages - Total number of pages.
 * @param {function(number): void} props.onPageChange - Callback function when page changes.
 * @returns {React.FC} Pagination component.
 */
export const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxPageButtons = 5; // Max buttons to show
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) return null; // Don't show pagination if only one page

    return (
        <div className="flex justify-center items-center space-x-2 mt-4 text-white">
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
                First
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
                Prev
            </button>
            {pageNumbers.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-md text-xs ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
                Next
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
                Last
            </button>
        </div>
    );
};

/**
 * A reusable modal component.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function(): void} props.onClose - Callback to close the modal.
 * @param {string} props.title - Title of the modal.
 * @param {React.ReactNode} props.children - Content of the modal.
 * @param {string} [props.maxWidth] - Max width CSS class (e.g., 'max-w-xl').
 * @returns {React.FC} Modal component.
 */
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string }> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    const modalRef = useRef<HTMLDivElement>(null);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm p-4" onClick={handleBackdropClick}>
            <div ref={modalRef} className={`bg-gray-800 rounded-lg shadow-2xl ${maxWidth} w-full border border-gray-700 max-h-[90vh] flex flex-col`}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Pill component for displaying tags or categories.
 * @param {object} props - Component props.
 * @param {string} props.text - Text to display.
 * @param {string} [props.colorClass] - Tailwind CSS classes for background and text color.
 * @returns {React.FC} Pill component.
 */
export const Pill: React.FC<{ text: string; colorClass?: string }> = ({ text, colorClass = 'bg-blue-500/20 text-blue-300' }) => {
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {text}
        </span>
    );
};

/**
 * Dropdown select component.
 * @param {object} props - Component props.
 * @param {string} props.label - Label for the select input.
 * @param {string} props.name - Name attribute for the select input.
 * @param {string} props.value - Current selected value.
 * @param {function(React.ChangeEvent<HTMLSelectElement>): void} props.onChange - Handler for change event.
 * @param {{value: string; label: string}[]} props.options - Array of options to display.
 * @param {boolean} [props.required] - Whether the field is required.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.FC} Select component.
 */
export const Select: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    className?: string;
}> = ({ label, name, value, onChange, options, required = false, className = '' }) => {
    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

/**
 * Text input component.
 * @param {object} props - Component props.
 * @param {string} props.label - Label for the input.
 * @param {string} props.name - Name attribute for the input.
 * @param {string | number} props.value - Current value.
 * @param {function(React.ChangeEvent<HTMLInputElement>): void} props.onChange - Handler for change event.
 * @param {string} [props.type] - Input type (default 'text').
 * @param {boolean} [props.required] - Whether the field is required.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.readOnly] - Whether the input is read-only.
 * @returns {React.FC} TextInput component.
 */
export const TextInput: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    className?: string;
    readOnly?: boolean;
}> = ({ label, name, value, onChange, type = 'text', required = false, className = '', readOnly = false }) => {
    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                className={`block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${readOnly ? 'bg-gray-700 cursor-not-allowed' : ''}`}
            />
        </div>
    );
};

/**
 * Date input component.
 * @param {object} props - Component props.
 * @param {string} props.label - Label for the input.
 * @param {string} props.name - Name attribute for the input.
 * @param {string} props.value - Current value (ISO date string, e.g., 'YYYY-MM-DD').
 * @param {function(React.ChangeEvent<HTMLInputElement>): void} props.onChange - Handler for change event.
 * @param {boolean} [props.required] - Whether the field is required.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.FC} DateInput component.
 */
export const DateInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    className?: string;
}> = ({ label, name, value, onChange, required = false, className = '' }) => {
    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
            <input
                type="date"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
        </div>
    );
};

/**
 * Textarea input component.
 * @param {object} props - Component props.
 * @param {string} props.label - Label for the textarea.
 * @param {string} props.name - Name attribute for the textarea.
 * @param {string} props.value - Current value.
 * @param {function(React.ChangeEvent<HTMLTextAreaElement>): void} props.onChange - Handler for change event.
 * @param {boolean} [props.required] - Whether the field is required.
 * @param {number} [props.rows] - Number of rows for the textarea.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.FC} TextareaInput component.
 */
export const TextareaInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
    rows?: number;
    className?: string;
}> = ({ label, name, value, onChange, required = false, rows = 3, className = '' }) => {
    return (
        <div className={`mb-4 ${className}`}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                rows={rows}
                className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            />
        </div>
    );
};

/**
 * File input component.
 * @param {object} props - Component props.
 * @param {string} props.label - Label for the file input.
 * @param {string} props.name - Name attribute for the file input.
 * @param {function(React.ChangeEvent<HTMLInputElement>): void} props.onChange - Handler for change event.
 * @param {boolean} [props.required] - Whether the field is required.
 * @param {string} [props.accept] - Accepted file types.
 * @param {React.RefObject<HTMLInputElement>} [props.ref] - Ref for the input element.
 * @returns {React.FC} FileInput component.
 */
export const FileInput: React.FC<{
    label: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    accept?: string;
    ref?: React.RefObject<HTMLInputElement>;
}> = ({ label, name, onChange, required = false, accept = '*/*', ref }) => {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
            <input
                type="file"
                id={name}
                name={name}
                onChange={onChange}
                required={required}
                accept={accept}
                ref={ref}
                className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-cyan-600 file:text-white
                hover:file:bg-cyan-700"
            />
        </div>
    );
};

/**
 * Toggle switch component.
 * @param {object} props - Component props.
 * @param {string} props.label - Label for the toggle.
 * @param {boolean} props.checked - Current state of the toggle.
 * @param {function(React.ChangeEvent<HTMLInputElement>): void} props.onChange - Handler for change event.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.FC} Toggle component.
 */
export const Toggle: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ label, checked, onChange, className = '' }) => {
    return (
        <label htmlFor={`toggle-${label.replace(/\s+/g, '-')}`} className={`flex items-center cursor-pointer mb-4 ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    id={`toggle-${label.replace(/\s+/g, '-')}`}
                    className="sr-only"
                    checked={checked}
                    onChange={onChange}
                />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'translate-x-full bg-cyan-500' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-300 font-medium text-sm">{label}</div>
        </label>
    );
};

/**
 * Tab Navigation Component for the main view.
 * @param {object} props - Component props.
 * @param {string} props.activeTab - Currently active tab.
 * @param {function(string): void} props.onTabChange - Callback when tab changes.
 * @param {{id: string; label: string; notificationCount?: number}[]} props.tabs - Array of tab objects with optional notification count.
 * @returns {React.FC} Tabs component.
 */
export const Tabs: React.FC<{ activeTab: string; onTabChange: (tabId: string) => void; tabs: { id: string; label: string; notificationCount?: number }[] }> = ({ activeTab, onTabChange, tabs }) => {
    return (
        <div className="border-b border-gray-700 mb-6 sticky top-0 bg-gray-900 z-10 -mx-6 px-6"> {/* Added sticky header */}
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`${activeTab === tab.id
                            ? 'border-cyan-500 text-cyan-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none flex items-center`}
                    >
                        {tab.label}
                        {tab.notificationCount && tab.notificationCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                {tab.notificationCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

// --- Data Provider Extension (Simulated) ---
/**
 * Extends the DataContext with mock data and simulated update functions.
 * This function should be called within the original DataProvider to provide extended context.
 * For the purpose of this exercise, we'll manually instantiate this data within InsuranceHubView.
 * @param {InsuranceClaim[]} initialClaims - Initial claims data from the original DataContext.
 * @returns {ExtendedDataContextState} The extended data context state.
 */
export const useExtendedDataContext = (initialClaims: InsuranceClaim[]): ExtendedDataContextState => {
    const [customers, setCustomers] = useState<Customer[]>(() => generateMockCustomers(100));
    const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => generateMockUserProfiles(15));
    const [policies, setPolicies] = useState<InsurancePolicy[]>(() => generateMockPolicies(200, customers));
    const [claims, setClaims] = useState<InsuranceClaim[]>(initialClaims.length > 0 ? initialClaims : generateMockClaims(50, customers, policies));
    const [tasks, setTasks] = useState<AgentTask[]>(() => generateMockTasks(150, userProfiles, claims, policies, customers));
    const [notifications, setNotifications] = useState<Notification[]>(() => generateMockNotifications(50, userProfiles));
    const [documents, setDocuments] = useState<Document[]>(() => generateMockDocuments(300, claims, policies, customers, userProfiles));
    const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => generateMockFinancialTransactions(500, claims, policies));
    const [aiConfigs, setAiConfigs] = useState<AIModelConfig[]>(() => generateMockAIConfigs());
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => generateMockAuditLogs(200, userProfiles, claims, policies, customers));
    const [communicationMessages, setCommunicationMessages] = useState<CommunicationMessage[]>(() => generateMockCommunicationMessages(400, customers, userProfiles, claims, policies));


    // Link policies/claims to users (simulated assignment)
    useEffect(() => {
        // This effect runs only once to initialize user's managed items
        // In a real app, this would be handled server-side or with more sophisticated state updates.
        const updatedUsers = userProfiles.map(user => {
            const userPolicies = policies.filter(p => p.agentId === user.id).map(p => p.id);
            const userClaims = claims.filter(c => c.assignedTo === user.id).map(c => c.id);
            return { ...user, managedPolicyIds: userPolicies, managedClaimIds: userClaims };
        });
        setUserProfiles(updatedUsers);
    }, [userProfiles.length, policies.length, claims.length]); // eslint-disable-line react-hooks/exhaustive-deps
    // Only re-run if underlying data array lengths change drastically, mimicking a "load once" behavior.

    const recordAuditLog = useCallback((action: string, entityType: AuditLogEntry['entityType'], entityId: string, userId: string, userName: string, oldValue: any = null, newValue: any = null) => {
        const newLog: AuditLogEntry = {
            id: generateUUID(),
            timestamp: new Date(),
            userId: userId,
            userName: userName,
            action: action,
            entityType: entityType,
            entityId: entityId,
            oldValue: oldValue ? JSON.stringify(oldValue) : null,
            newValue: newValue ? JSON.stringify(newValue) : null,
            ipAddress: '127.0.0.1', // Simulate local IP
        };
        setAuditLogs(prev => [newLog, ...prev]);
        console.log("Audit Logged:", newLog);
    }, []);

    const sendNotification = useCallback((message: string, type: Notification['type'], recipients: string[], link: string | null = null) => {
        const newNotification: Notification = {
            id: generateUUID(),
            message,
            type,
            timestamp: new Date(),
            read: false,
            link,
            recipients,
        };
        setNotifications(prev => [newNotification, ...prev]);
        console.log("Notification Sent:", newNotification);
    }, []);


    const updateClaimStatus = useCallback((updatedClaim: InsuranceClaim) => {
        const oldClaim = claims.find(c => c.id === updatedClaim.id);
        if (oldClaim?.status !== updatedClaim.status) {
            setClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
            recordAuditLog('Updated Claim Status', 'Claim', updatedClaim.id, 'current_user_id', 'Current User', { status: oldClaim?.status }, { status: updatedClaim.status });
            sendNotification(`Claim ${updatedClaim.id} status updated to ${updatedClaim.status}.`, 'info', ['current_user_id', 'assigned_agent_id']);
        }
    }, [claims, recordAuditLog, sendNotification]);

    const updateTask = useCallback((updatedTask: AgentTask) => {
        const oldTask = tasks.find(t => t.id === updatedTask.id);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        recordAuditLog(
            oldTask ? 'Updated Task' : 'Created Task',
            'Task', updatedTask.id, 'current_user_id', 'Current User',
            oldTask, updatedTask
        );
        sendNotification(`Task "${updatedTask.title}" updated to ${updatedTask.status}.`, 'info', [updatedTask.assignedTo]);
    }, [tasks, recordAuditLog, sendNotification]);

    const addTask = useCallback((newTask: AgentTask) => {
        setTasks(prev => [newTask, ...prev]);
        recordAuditLog('Created Task', 'Task', newTask.id, 'current_user_id', 'Current User', null, newTask);
        sendNotification(`New task "${newTask.title}" assigned to you.`, 'info', [newTask.assignedTo]);
    }, [recordAuditLog, sendNotification]);

    const markNotificationAsRead = useCallback((notificationToMark: Notification) => {
        setNotifications(prev => prev.map(n => n.id === notificationToMark.id ? { ...n, read: true } : n));
        recordAuditLog('Marked Notification as Read', 'Notification', notificationToMark.id, 'current_user_id', 'Current User', { read: false }, { read: true });
    }, [recordAuditLog]);

    const updatePolicyStatus = useCallback((updatedPolicy: InsurancePolicy) => {
        const oldPolicy = policies.find(p => p.id === updatedPolicy.id);
        if (oldPolicy?.status !== updatedPolicy.status) {
            setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
            recordAuditLog('Updated Policy Status', 'Policy', updatedPolicy.id, 'current_user_id', 'Current User', { status: oldPolicy?.status }, { status: updatedPolicy.status });
            sendNotification(`Policy ${updatedPolicy.id} status updated to ${updatedPolicy.status}.`, 'info', ['current_user_id', oldPolicy?.agentId || '']);
        }
    }, [policies, recordAuditLog, sendNotification]);

    const addDocument = useCallback((newDoc: Document) => {
        setDocuments(prev => [newDoc, ...prev]);
        recordAuditLog('Uploaded Document', 'Document', newDoc.id, newDoc.uploadedBy, 'Current User', null, newDoc);
        sendNotification(`New document "${newDoc.fileName}" uploaded.`, 'info', ['current_user_id']);
    }, [recordAuditLog, sendNotification]);

    const updateAIConfig = useCallback((updatedConfig: AIModelConfig) => {
        const oldConfig = aiConfigs.find(c => c.id === updatedConfig.id);
        setAiConfigs(prev => prev.map(c => c.id === updatedConfig.id ? updatedConfig : c));
        recordAuditLog('Updated AI Configuration', 'AIConfig', updatedConfig.id, 'current_user_id', updatedConfig.updatedBy, oldConfig, updatedConfig);
        sendNotification(`AI Model configuration "${updatedConfig.name}" updated.`, 'warning', ['admin_user_id']);
    }, [aiConfigs, recordAuditLog, sendNotification]);

    const updateCustomer = useCallback((updatedCustomer: Customer) => {
        const oldCustomer = customers.find(c => c.id === updatedCustomer.id);
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        recordAuditLog('Updated Customer Profile', 'Customer', updatedCustomer.id, 'current_user_id', 'Current User', oldCustomer, updatedCustomer);
        sendNotification(`Customer profile for ${updatedCustomer.name} updated.`, 'info', ['current_user_id']);
    }, [customers, recordAuditLog, sendNotification]);

    const updateUserProfile = useCallback((updatedUser: UserProfile) => {
        const oldUser = userProfiles.find(u => u.id === updatedUser.id);
        setUserProfiles(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        recordAuditLog('Updated User Profile', 'User', updatedUser.id, 'current_user_id', 'Current User', oldUser, updatedUser);
        sendNotification(`User profile for ${updatedUser.name} updated by admin.`, 'info', [updatedUser.id]);
    }, [userProfiles, recordAuditLog, sendNotification]);

    const addTransaction = useCallback((newTransaction: FinancialTransaction) => {
        setTransactions(prev => [newTransaction, ...prev]);
        recordAuditLog('Added Financial Transaction', 'FinancialTransaction', newTransaction.id, 'system', 'System', null, newTransaction);
        sendNotification(`New financial transaction: ${newTransaction.type} for $${newTransaction.amount}.`, 'success', ['finance_dept_id']);
    }, [recordAuditLog, sendNotification]);


    return {
        insuranceClaims: claims,
        customers: customers,
        insurancePolicies: policies,
        agentTasks: tasks,
        notifications: notifications,
        documents: documents,
        financialTransactions: transactions,
        userProfiles: userProfiles,
        aiConfigs: aiConfigs,
        auditLogs: auditLogs,
        communicationMessages: communicationMessages,

        updateClaimStatus: updateClaimStatus,
        updateTask: updateTask,
        markNotificationAsRead: markNotificationAsRead,
        updatePolicyStatus: updatePolicyStatus,
        addDocument: addDocument,
        updateAIConfig: updateAIConfig,
        updateCustomer: updateCustomer,
        updateUserProfile: updateUserProfile,
        addTransaction: addTransaction,
        addTask: addTask,
    };
};

/**
 * Claim Detail Modal (Original, but potentially extended if needed)
 */
const ClaimDetailModal: React.FC<{ claim: InsuranceClaim | null; onClose: () => void; }> = ({ claim, onClose }) => {
    const [aiAssessment, setAiAssessment] = useState<any>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const extendedContext = useContext(DataContext) as ExtendedDataContextState; // Cast to extended type
    const { updateClaimStatus } = extendedContext;

    if (!claim) return null;

    const generateAssessment = async () => {
        setIsLoadingAI(true);
        setAiAssessment(null);
        try {
            // Use NEXT_PUBLIC_ for client-side environment variables in Next.js
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string });
            const prompt = `You are an expert insurance claims adjudication AI. Based on the claim description "${claim.description}", provide a structured damage assessment and a recommended payout amount. Also, identify any potential red flags for fraud. Output should be JSON with properties: assessment (string), recommendedPayout (number), fraudFlags (string[]), requiredDocuments (string[]), AI_confidence (number, 0-1).`;
            const schema = { type: Type.OBJECT, properties: { assessment: { type: Type.STRING }, recommendedPayout: { type: Type.NUMBER }, fraudFlags: { type: Type.ARRAY, items: { type: Type.STRING } }, requiredDocuments: { type: Type.ARRAY, items: { type: Type.STRING } }, AI_confidence: { type: Type.NUMBER } } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setAiAssessment(JSON.parse(response.text));
        } catch (err) {
            console.error("AI assessment error:", err);
            setAiAssessment({ assessment: 'Error generating assessment.', recommendedPayout: 0, fraudFlags: ['Error in AI analysis'], requiredDocuments: [], AI_confidence: 0 });
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as InsuranceClaim['status'];
        if (claim) {
            updateClaimStatus({ ...claim, status: newStatus });
        }
    };

    const getPolicyholderName = useMemo(() => {
        return extendedContext.customers.find(c =>
            extendedContext.insurancePolicies.find(p => p.id === claim.policyId && p.customerId === c.id)
        )?.name || claim.policyholder;
    }, [claim, extendedContext.customers, extendedContext.insurancePolicies]);

    const getAssignedAgentName = useMemo(() => {
        if (!claim.assignedTo) return 'N/A';
        return extendedContext.userProfiles.find(u => u.id === claim.assignedTo)?.name || 'Unknown Agent';
    }, [claim.assignedTo, extendedContext.userProfiles]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white">Claim Details: {claim.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-gray-300"><strong className="text-gray-200">Policyholder:</strong> {getPolicyholderName}</p>
                        <p className="text-gray-300"><strong className="text-gray-200">Policy ID:</strong> <span className="font-mono text-cyan-300">{claim.policyId}</span></p>
                        <p className="text-gray-300"><strong className="text-gray-200">Date Filed:</strong> {new Date(claim.dateFiled).toLocaleDateString()}</p>
                        <p className="text-gray-300"><strong className="text-gray-200">Date of Loss:</strong> {new Date(claim.dateOfLoss).toLocaleDateString()}</p>
                        <p className="text-gray-300"><strong className="text-gray-200">Incident Type:</strong> {claim.incidentType}</p>
                        <p className="text-gray-300"><strong className="text-gray-200">Incident Location:</strong> {claim.incidentLocation}</p>
                        <p className="text-gray-300"><strong className="text-gray-200">Amount Claimed:</strong> <span className="font-mono text-white">${claim.amount.toLocaleString()}</span></p>
                        <p className="text-gray-300"><strong className="text-gray-200">Payout Amount:</strong> <span className="font-mono text-green-400">${(claim.payoutAmount || 0).toLocaleString()}</span></p>
                        <p className="text-gray-300"><strong className="text-gray-200">Assigned To:</strong> {getAssignedAgentName}</p>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="claimStatus" className="text-sm text-gray-200">Status:</label>
                            <select
                                id="claimStatus"
                                value={claim.status}
                                onChange={handleStatusChange}
                                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                <option value="New">New</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Approved">Approved</option>
                                <option value="Denied">Denied</option>
                            </select>
                        </div>
                    </div>

                    <Card title="Claim Description">
                        <p className="text-sm text-gray-300">{claim.description}</p>
                        {claim.notes && <p className="text-xs italic text-gray-400 mt-2">Internal notes: {claim.notes}</p>}
                    </Card>

                    <Card title="AI Claims Adjudicator">
                        {isLoadingAI && <p className="text-cyan-400">Analyzing claim with AI, please wait...</p>}
                        {aiAssessment && (
                            <div className="text-sm space-y-3">
                                <p><strong className="text-cyan-300">Assessment:</strong> {aiAssessment.assessment}</p>
                                <p><strong className="text-cyan-300">Recommended Payout:</strong> ${aiAssessment.recommendedPayout.toLocaleString()}</p>
                                {aiAssessment.fraudFlags && aiAssessment.fraudFlags.length > 0 && (
                                    <p className="text-red-400"><strong className="text-red-300">Fraud Flags:</strong> {aiAssessment.fraudFlags.join(', ')}</p>
                                )}
                                {aiAssessment.requiredDocuments && aiAssessment.requiredDocuments.length > 0 && (
                                    <p className="text-yellow-400"><strong className="text-yellow-300">Suggested Documents:</strong> {aiAssessment.requiredDocuments.join(', ')}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-2">AI Confidence: {(aiAssessment.AI_confidence * 100).toFixed(1)}%</p>
                            </div>
                        )}
                        {!aiAssessment && !isLoadingAI && <button onClick={generateAssessment} className="text-sm text-cyan-400 hover:underline">Generate AI Assessment</button>}
                        {aiAssessment && !isLoadingAI && <button onClick={() => setAiAssessment(null)} className="ml-4 text-sm text-gray-400 hover:underline">Clear AI Assessment</button>}
                    </Card>

                    <Card title="Related Documents">
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {extendedContext.documents
                                .filter(doc => doc.relatedEntityId === claim.id)
                                .map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                        <span>📄 {doc.fileName} <Pill text={doc.category} /> {doc.tags?.map((tag, idx) => <Pill key={idx} text={tag} colorClass="bg-gray-600/20 text-gray-400" />)}</span>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-xs ml-2 flex-shrink-0">View Document</a>
                                    </li>
                                ))}
                            {extendedContext.documents.filter(doc => doc.relatedEntityId === claim.id).length === 0 && (
                                <p className="text-sm text-gray-500">No documents found for this claim.</p>
                            )}
                        </ul>
                        <button className="mt-4 text-sm text-cyan-400 hover:underline" onClick={() => {/* Trigger document upload modal */}}>Upload New Document</button>
                    </Card>

                    <Card title="Financial Transactions">
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {extendedContext.financialTransactions
                                .filter(tx => tx.entityId === claim.id && tx.entityType === 'Claim')
                                .map(tx => (
                                    <li key={tx.id} className="flex items-center justify-between text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                        <span>{tx.type}: <span className={`font-mono ${tx.type === 'Payout' ? 'text-green-400' : 'text-white'}`}>${tx.amount.toLocaleString()}</span> (<Pill text={tx.status} colorClass={
                                            tx.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                                            tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-red-500/20 text-red-300'
                                        } />)</span>
                                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{new Date(tx.transactionDate).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            {extendedContext.financialTransactions.filter(tx => tx.entityId === claim.id && tx.entityType === 'Claim').length === 0 && (
                                <p className="text-sm text-gray-500">No transactions for this claim.</p>
                            )}
                        </ul>
                    </Card>

                    <Card title="Communication Log">
                        <div className="space-y-3 text-sm max-h-48 overflow-y-auto">
                            {extendedContext.communicationMessages
                                .filter(msg => msg.relatedClaimId === claim.id)
                                .sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime())
                                .map(msg => (
                                    <p key={msg.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                        <strong className="text-cyan-300">{msg.senderType === 'User' ? extendedContext.userProfiles.find(u => u.id === msg.senderId)?.name || 'Agent' : extendedContext.customers.find(c => c.id === msg.senderId)?.name || 'Customer'}:</strong> {msg.content}
                                        <span className="block text-xs text-gray-500 mt-1">[{new Date(msg.timestamp).toLocaleString()}] Channel: {msg.channel} {msg.aiSentiment && <Pill text={`AI Sentiment: ${msg.aiSentiment}`} colorClass={
                                            msg.aiSentiment === 'Positive' ? 'bg-green-500/20 text-green-300' :
                                            msg.aiSentiment === 'Negative' ? 'bg-red-500/20 text-red-300' :
                                            'bg-blue-500/20 text-blue-300'
                                        } />}</span>
                                    </p>
                                ))}
                            {extendedContext.communicationMessages.filter(msg => msg.relatedClaimId === claim.id).length === 0 && (
                                <p className="text-sm text-gray-500">No communication logs for this claim.</p>
                            )}
                        </div>
                        <button className="mt-4 text-sm text-cyan-400 hover:underline">Add New Log Entry</button>
                    </Card>
                </div>
            </div>
        </div>
    );
};


/**
 * Policy Detail Modal component.
 * @param {object} props - Component props.
 * @param {InsurancePolicy | null} props.policy - The policy to display.
 * @param {function(): void} props.onClose - Callback to close the modal.
 * @returns {React.FC} PolicyDetailModal component.
 */
export const PolicyDetailModal: React.FC<{ policy: InsurancePolicy | null; onClose: () => void; }> = ({ policy, onClose }) => {
    const extendedContext = useContext(DataContext) as ExtendedDataContextState;
    const { updatePolicyStatus } = extendedContext;

    if (!policy) return null;

    const customer = extendedContext.customers.find(c => c.id === policy.customerId);
    const agent = extendedContext.userProfiles.find(u => u.id === policy.agentId);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as InsurancePolicy['status'];
        if (policy) {
            updatePolicyStatus({ ...policy, status: newStatus });
        }
    };

    return (
        <Modal isOpen={!!policy} onClose={onClose} title={`Policy Details: ${policy.id}`} maxWidth="max-w-4xl">
            <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-gray-300"><strong className="text-gray-200">Policy Holder:</strong> {policy.policyHolderName}</p>
                    <p className="text-gray-300"><strong className="text-gray-200">Customer ID:</strong> <span className="font-mono text-white">{customer?.id || 'N/A'}</span></p>
                    <p className="text-gray-300"><strong className="text-gray-200">Customer Email:</strong> {customer?.email || 'N/A'}</p>
                    <p className="text-gray-300"><strong className="text-gray-200">Policy Type:</strong> <Pill text={policy.type} colorClass="bg-purple-500/20 text-purple-300" /></p>
                    <p className="text-gray-300"><strong className="text-gray-200">Start Date:</strong> {policy.startDate.toLocaleDateString()}</p>
                    <p className="text-gray-300"><strong className="text-gray-200">End Date:</strong> {policy.endDate.toLocaleDateString()}</p>
                    <p className="text-gray-300"><strong className="text-gray-200">Premium:</strong> <span className="font-mono text-white">${policy.premiumAmount.toLocaleString()}{policy.paymentFrequency ? `/${policy.paymentFrequency}` : ''}</span></p>
                    <p className="text-gray-300"><strong className="text-gray-200">Deductible:</strong> <span className="font-mono text-white">${policy.deductible.toLocaleString()}</span></p>
                    <p className="text-gray-300"><strong className="text-gray-200">Coverage Amount:</strong> <span className="font-mono text-white">${policy.coverageAmount.toLocaleString()}</span></p>
                    <p className="text-gray-300"><strong className="text-gray-200">Last Renewed:</strong> {policy.lastRenewed.toLocaleDateString()}</p>
                    {policy.nextRenewal && <p className="text-gray-300"><strong className="text-gray-200">Next Renewal:</strong> {policy.nextRenewal.toLocaleDateString()}</p>}
                    {agent && <p className="text-gray-300"><strong className="text-gray-200">Assigned Agent:</strong> {agent.name}</p>}
                    <div className="flex items-center space-x-2 col-span-full lg:col-span-1">
                        <label htmlFor="policyStatus" className="text-gray-200">Status:</label>
                        <select
                            id="policyStatus"
                            value={policy.status}
                            onChange={handleStatusChange}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Lapsed">Lapsed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Pending">Pending</option>
                        </select