import sqlite3 from 'sqlite3';
import { MOCK_TRANSACTIONS, MOCK_ASSETS, MOCK_BUDGETS, MOCK_FINANCIAL_GOALS } from '../data'; // Use existing data to seed

const DB_PATH = './demobank.db';

let db: sqlite3.Database;

export const initDb = (): Promise<sqlite3.Database> => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error(err.message);
                return reject(err);
            }
            console.log('Connected to the SQLite database.');
            
            // Create tables and seed data
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    category TEXT NOT NULL,
                    description TEXT NOT NULL,
                    amount REAL NOT NULL,
                    date TEXT NOT NULL,
                    carbonFootprint REAL
                )`, (err) => {
                    if (err) return reject(err);
                    // Seed only if table is empty
                    db.get("SELECT COUNT(*) as count FROM transactions", (err, row: any) => {
                        if (row.count === 0) {
                             const stmt = db.prepare("INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?)");
                             MOCK_TRANSACTIONS.forEach(tx => stmt.run(tx.id, tx.type, tx.category, tx.description, tx.amount, tx.date, tx.carbonFootprint));
                             stmt.finalize();
                             console.log("Seeded transactions.");
                        }
                    });
                });
                
                // Add more tables for other data types (assets, budgets, etc.)
                db.run(`CREATE TABLE IF NOT EXISTS assets (
                    name TEXT PRIMARY KEY,
                    value REAL NOT NULL,
                    color TEXT NOT NULL,
                    performanceYTD REAL
                )`, (err) => {
                    if (err) return reject(err);
                     db.get("SELECT COUNT(*) as count FROM assets", (err, row: any) => {
                        if (row.count === 0) {
                             const stmt = db.prepare("INSERT INTO assets VALUES (?, ?, ?, ?)");
                             MOCK_ASSETS.forEach(a => stmt.run(a.name, a.value, a.color, a.performanceYTD));
                             stmt.finalize();
                             console.log("Seeded assets.");
                        }
                    });
                });

                db.run(`CREATE TABLE IF NOT EXISTS budgets (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    limit_val REAL NOT NULL,
                    spent REAL NOT NULL,
                    color TEXT NOT NULL
                )`, (err) => {
                    if (err) return reject(err);
                     db.get("SELECT COUNT(*) as count FROM budgets", (err, row: any) => {
                        if (row.count === 0) {
                             const stmt = db.prepare("INSERT INTO budgets VALUES (?, ?, ?, ?, ?)");
                             MOCK_BUDGETS.forEach(b => stmt.run(b.id, b.name, b.limit, b.spent, b.color));
                             stmt.finalize();
                              console.log("Seeded budgets.");
                        }
                    });
                });

                db.run(`CREATE TABLE IF NOT EXISTS financial_goals (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    targetAmount REAL NOT NULL,
                    currentAmount REAL NOT NULL,
                    targetDate TEXT NOT NULL,
                    iconName TEXT NOT NULL
                )`, (err) => {
                    if (err) return reject(err);
                     db.get("SELECT COUNT(*) as count FROM financial_goals", (err, row: any) => {
                        if (row.count === 0) {
                             const stmt = db.prepare("INSERT INTO financial_goals VALUES (?, ?, ?, ?, ?, ?)");
                             MOCK_FINANCIAL_GOALS.forEach(g => stmt.run(g.id, g.name, g.targetAmount, g.currentAmount, g.targetDate, g.iconName));
                             stmt.finalize();
                              console.log("Seeded financial goals.");
                        }
                    });
                });

                resolve(db);
            });
        });
    });
};

export const getDb = () => {
    if (!db) {
        throw new Error("Database not initialized. Call initDb first.");
    }
    return db;
};
