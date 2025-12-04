import { Router } from 'express';
import { Database } from 'sqlite3';
import { MOCK_MARKET_MOVERS, MOCK_API_STATUS, MOCK_PROJECTS, MOCK_COURSES, MOCK_EMPLOYEES } from '../../data';
import * as MegaDashboardData from '../../data/megadashboard';

export const systemRouter = (db: Database) => {
    const router = Router();
    router.get('/all', (req, res) => {
        res.json({
            marketMovers: MOCK_MARKET_MOVERS,
            apiStatus: MOCK_API_STATUS,
        });
    });
    return router;
};
    
export const megadashboardRouter = (db: Database) => {
    const router = Router();
    router.get('/all', (req, res) => {
        res.json({ ...MegaDashboardData });
    });
    return router;
};

export const platformRouter = (db: Database) => {
    const router = Router();
    router.get('/all', (req, res) => {
        res.json({
            projects: MOCK_PROJECTS,
            courses: MOCK_COURSES,
            employees: MOCK_EMPLOYEES
        });
    });
    return router;
};