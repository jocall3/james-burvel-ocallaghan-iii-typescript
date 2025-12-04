// data/corporateTransactions.ts

// This is the live feed from the corporate front lines, a real-time ticker tape of
// every transaction made on behalf of the enterprise. Each entry is a data point,
// a clue to spending patterns, a potential policy violation, or a routine business
// expense. This stream of data is what gives the Corporate Command Center its
// immediacy and power, allowing for real-time analysis, charting, and the detection
// of financial anomalies. It is the pulse of the corporate body.

import type { CorporateTransaction } from '../types';

/**
 * @description A stream of recent corporate transactions made with the issued cards.
 * This data is used for real-time monitoring in the `CorporateCommandView`, populating
 * the transaction feed and the spending analysis charts. Each transaction links back
 * to a cardholder and includes merchant details, amount, and status.
 */
export const MOCK_CORPORATE_TRANSACTIONS: CorporateTransaction[] = [
    { id: 'ctx1', cardId: 'corp1', holderName: 'Alex Chen', merchant: 'Cloud Services Inc.', amount: 199.99, status: 'Approved', timestamp: '2m ago' },
    { id: 'ctx2', cardId: 'corp2', holderName: 'Brenda Rodriguez', merchant: 'Steakhouse Prime', amount: 345.50, status: 'Approved', timestamp: '5m ago' },
    { id: 'ctx3', cardId: 'corp4', holderName: 'Diana Wells', merchant: 'Office Supplies Co.', amount: 89.20, status: 'Pending', timestamp: '8m ago' },
    { id: 'ctx4', cardId: 'corp1', holderName: 'Alex Chen', merchant: 'CodeEditor Pro', amount: 49.00, status: 'Approved', timestamp: '1h ago' },
    { id: 'ctx5', cardId: 'corp2', holderName: 'Brenda Rodriguez', merchant: 'Airport Taxi', amount: 75.00, status: 'Approved', timestamp: '3h ago' },
    { id: 'ctx6', cardId: 'corp5', holderName: 'Ethan Gonzalez', merchant: 'HR Software Subscription', amount: 150.00, status: 'Approved', timestamp: '5h ago' },
    { id: 'ctx7', cardId: 'corp6', holderName: 'Fiona Kim', merchant: 'UserTesting Platform', amount: 250.00, status: 'Approved', timestamp: '8h ago' },
    { id: 'ctx8', cardId: 'corp9', holderName: 'Ian Washington', merchant: 'Airline Tickets', amount: 1250.80, status: 'Approved', timestamp: '1d ago' },
    { id: 'ctx9', cardId: 'corp10', holderName: 'Jasmine Lee', merchant: 'Data Processing Unit', amount: 500.00, status: 'Pending', timestamp: '1d ago' },
    { id: 'ctx10', cardId: 'corp2', holderName: 'Brenda Rodriguez', merchant: 'Client Lunch', amount: 125.30, status: 'Approved', timestamp: '2d ago' },
    { id: 'ctx11', cardId: 'corp1', holderName: 'Alex Chen', merchant: 'Server Hosting', amount: 75.00, status: 'Approved', timestamp: '2d ago' },
];
