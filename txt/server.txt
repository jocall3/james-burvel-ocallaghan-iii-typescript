import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import personalRoutes from './api/personal';
import { dashboardRouter, payrollRouter } from './api/corporate';
import aiRoutes from './api/ai';
import { systemRouter, megadashboardRouter, platformRouter } from './api/other';


// Load environment variables
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 3001; // Using a different port from a potential dev frontend

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
initDb().then(db => {
    console.log('Database initialized.');
    
    // Pass db instance to routes
    // --- Register most specific routes FIRST ---

    app.use('/api/personal', personalRoutes(db));
    app.use('/api/corporate/dashboard', dashboardRouter(db));
    app.use('/api/corporate/payroll', payrollRouter(db));
    app.use('/api/system', systemRouter(db));
    app.use('/api/megadashboard', megadashboardRouter(db));
    app.use('/api/platform', platformRouter(db));
    app.use('/api/ai', aiRoutes(db));

    // General welcome message for /api
    app.get('/api', (req, res) => {
        res.send('Welcome to the Demo Bank API!');
    });


    // Start server
    app.listen(port, () => {
        console.log(`Demo Bank server listening at http://localhost:${port}`);
    });

}).catch(err => {
    console.error('Failed to initialize database:', err);
    (process as any).exit(1);
});