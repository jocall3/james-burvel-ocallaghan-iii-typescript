import { Router } from 'express';

export default () => {
    const router = Router();

    /**
     * @description Generates and returns a static API key for the user.
     * In a real production app, this would generate a unique key, store its hash
     * in the database, and associate it with the user's account. For this demo,
     * it returns a single, hardcoded key to enable the live API functionality.
     */
    router.post('/generate-key', (req, res) => {
        const apiKey = process.env.DEMO_API_KEY_STATIC || 'db_sk_live_XXXXXXXXXXXXXXXXXXXX';
        res.json({ apiKey });
    });

    return router;
};
