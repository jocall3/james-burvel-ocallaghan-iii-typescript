// data/corporateCards.ts

// This is the armory, a comprehensive registry of the tools of corporate expenditure.
// Each entry is a `CorporateCard` issued to an employee, complete with its own set of
// permissions, limits, and statuses. This is not a small list; it is a robust and
// extensive catalog designed to simulate a real, thriving enterprise. This rich dataset
// is the absolute bedrock of the Corporate Command Center, allowing for complex
// demonstrations of card management, control, and oversight. It is the source of
// the finance manager's power.

import type { CorporateCard } from '../types';

/**
 * @description An extensive list of mock corporate cards issued to various employees.
 * This data is central to the `CorporateCommandView` and its sub-views for card
 * management. Each card has a unique ID, holder name, status, and a detailed set
 * of controls (e.g., spending limits, feature toggles), allowing for a rich and
* realistic simulation of a corporate card program.
 */
export const MOCK_CORPORATE_CARDS: CorporateCard[] = [
    { 
        id: 'corp1', 
        holderName: 'Alex Chen (Engineer)', 
        cardNumberMask: '8431', 
        status: 'Active', 
        frozen: false, 
        balance: 1250.75,
        limit: 5000,
        transactions: [
            { id: 'ctx1', description: 'Cloud Services Inc.', amount: 199.99, timestamp: '2m ago' },
            { id: 'ctx4', description: 'CodeEditor Pro', amount: 49.00, timestamp: '1h ago' },
            { id: 'ctx11', description: 'Server Hosting', amount: 75.00, timestamp: '2d ago' },
        ],
        controls: { atm: true, contactless: true, online: true, monthlyLimit: 5000 } 
    },
    { 
        id: 'corp2', 
        holderName: 'Brenda Rodriguez (Sales)', 
        cardNumberMask: '5549', 
        status: 'Active', 
        frozen: false, 
        balance: 4580.10,
        limit: 10000,
        transactions: [
            { id: 'ctx2', description: 'Steakhouse Prime', amount: 345.50, timestamp: '5m ago' },
            { id: 'ctx5', description: 'Airport Taxi', amount: 75.00, timestamp: '3h ago' },
            { id: 'ctx10', description: 'Client Lunch', amount: 125.30, timestamp: '2d ago' },
        ],
        controls: { atm: false, contactless: true, online: true, monthlyLimit: 10000 } 
    },
    { 
        id: 'corp3', 
        holderName: 'Charles Davis (Marketing)', 
        cardNumberMask: '1127', 
        status: 'Suspended', 
        frozen: true,
        balance: 500.00,
        limit: 2500,
        transactions: [], 
        controls: { atm: false, contactless: false, online: false, monthlyLimit: 2500 } 
    },
    { 
        id: 'corp9', 
        holderName: 'Ian Washington (Executive)', 
        cardNumberMask: '1558', 
        status: 'Active', 
        frozen: false,
        balance: 15200.00,
        limit: 20000,
        transactions: [
             { id: 'ctx8', description: 'Airline Tickets', amount: 1250.80, timestamp: '1d ago' },
        ], 
        controls: { atm: true, contactless: true, online: true, monthlyLimit: 20000 } 
    },
];