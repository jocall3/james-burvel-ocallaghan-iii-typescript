import { Router } from 'express';
import { Database } from 'sqlite3';
import { MOCK_CORPORATE_CARDS, MOCK_CORPORATE_TRANSACTIONS, MOCK_PAYMENT_ORDERS, MOCK_INVOICES, MOCK_COMPLIANCE_CASES, MOCK_ANOMALIES, MOCK_COUNTERPARTIES, MOCK_PAY_RUNS } from '../../data';

export const dashboardRouter = (db: Database) => {
    const router = Router();
    router.get('/', (req, res) => {
        res.json({
            corporateCards: MOCK_CORPORATE_CARDS,
            corporateTransactions: MOCK_CORPORATE_TRANSACTIONS,
            paymentOrders: MOCK_PAYMENT_ORDERS,
            invoices: MOCK_INVOICES,
            complianceCases: MOCK_COMPLIANCE_CASES,
            financialAnomalies: MOCK_ANOMALIES,
            counterparties: MOCK_COUNTERPARTIES,
        });
    });
    return router;
};

export const payrollRouter = (db: Database) => {
    const router = Router();
    // FIX: The '.get' method should be called on the 'router' instance, not on the 'payrollRouter' function itself.
    router.get('/', (req, res) => {
        res.json({
            payRuns: MOCK_PAY_RUNS,
        });
    });
    return router;
};