import { Router } from 'express';
import { Database } from 'sqlite3';
// FIX: Import mock data from the central data file instead of defining it locally.
import { MOCK_IMPACT_INVESTMENTS, MOCK_SUBSCRIPTIONS, MOCK_UPCOMING_BILLS, MOCK_SAVINGS_GOALS, MOCK_REWARD_POINTS, MOCK_REWARD_ITEMS, MOCK_CREDIT_SCORE, MOCK_CREDIT_FACTORS, MOCK_CRYPTO_ASSETS, MOCK_PAYMENT_OPERATIONS, MOCK_NOTIFICATIONS, MOCK_GAMIFICATION, MOCK_AI_INSIGHTS, MOCK_LINKED_ACCOUNTS } from '../../data';
import { GamificationState, AIInsight, LinkedAccount } from '../../../types';


export default (db: Database) => {
    const router = Router();

    // Combined endpoint for initial data load
    router.get('/data', async (req, res) => {
        try {
            const dataPromises = {
                transactions: new Promise((resolve, reject) => db.all("SELECT * FROM transactions ORDER BY date DESC", (err, rows) => err ? reject(err) : resolve(rows))),
                assets: new Promise((resolve, reject) => db.all("SELECT * FROM assets", (err, rows) => err ? reject(err) : resolve(rows))),
                budgets: new Promise((resolve, reject) => db.all("SELECT * FROM budgets", (err, rows) => err ? reject(err) : resolve(rows))),
                financialGoals: new Promise((resolve, reject) => db.all("SELECT * FROM financial_goals", (err, rows) => err ? reject(err) : resolve(rows))),
                // These are still mocks for now, can be moved to DB later
                impactInvestments: Promise.resolve(MOCK_IMPACT_INVESTMENTS),
                subscriptions: Promise.resolve(MOCK_SUBSCRIPTIONS),
                upcomingBills: Promise.resolve(MOCK_UPCOMING_BILLS),
                savingsGoals: Promise.resolve(MOCK_SAVINGS_GOALS),
                gamification: Promise.resolve(MOCK_GAMIFICATION),
                rewardPoints: Promise.resolve(MOCK_REWARD_POINTS),
                rewardItems: Promise.resolve(MOCK_REWARD_ITEMS),
                creditScore: Promise.resolve(MOCK_CREDIT_SCORE),
                creditFactors: Promise.resolve(MOCK_CREDIT_FACTORS),
                aiInsights: Promise.resolve(MOCK_AI_INSIGHTS),
                cryptoAssets: Promise.resolve(MOCK_CRYPTO_ASSETS),
                nftAssets: Promise.resolve([]),
                paymentOperations: Promise.resolve(MOCK_PAYMENT_OPERATIONS),
                linkedAccounts: Promise.resolve(MOCK_LINKED_ACCOUNTS),
                notifications: Promise.resolve(MOCK_NOTIFICATIONS),
            };

            const data: { [key: string]: any } = {};
            for (const [key, promise] of Object.entries(dataPromises)) {
                data[key] = await promise;
            }
            
            res.json(data);

        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    router.get('/transactions', (req, res) => {
        db.all("SELECT * FROM transactions ORDER BY date DESC", (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
    });

    router.post('/transactions', (req, res) => {
        const { type, category, description, amount, date, carbonFootprint } = req.body;
        const id = `txn_${Date.now()}`;
        
        db.run(
            `INSERT INTO transactions (id, type, category, description, amount, date, carbonFootprint) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, type, category, description, amount, date, carbonFootprint],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json({ id });
            }
        );
    });

    // Add more personal finance routes here (assets, budgets, etc.)

    return router;
};
