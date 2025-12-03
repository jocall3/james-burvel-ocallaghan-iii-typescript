import { Router } from 'express';
import { Database } from 'sqlite3';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { Transaction, DetectedSubscription } from '../../../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const chatSessions: { [key: string]: Chat } = {}; // In-memory session store

export default (db: Database) => {
    const router = Router();

    router.post('/chat', async (req, res) => {
        const { history, message, sessionId = 'default' } = req.body;
        
        if (!chatSessions[sessionId]) {
            chatSessions[sessionId] = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: "You are Quantum, an advanced AI financial advisor for Demo Bank. Be helpful, professional, and concise." }
            });
        }
        
        try {
            const result = await chatSessions[sessionId].sendMessage({ message });
            res.json({ text: result.text });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/transaction-insight', async (req, res) => {
        const { type } = req.body;

        db.all("SELECT * FROM transactions ORDER BY date DESC LIMIT 20", async (err, rows: Transaction[]) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const transactionSummary = rows.map(t => `${t.date} - ${t.description}: $${t.amount.toFixed(2)} (${t.type})`).join('\n');
            let prompt = '';
            let responseSchema: any = { type: Type.OBJECT, properties: { text: { type: Type.STRING } } };

            switch(type) {
                case 'subscriptions':
                    prompt = "Analyze these transactions to find potential recurring subscriptions. Look for repeated payments to the same merchant around the same time each month.";
                    responseSchema = { type: Type.OBJECT, properties: { subscriptions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, estimatedAmount: { type: Type.NUMBER }, lastCharged: { type: Type.STRING } } } } } };
                    break;
                case 'anomaly':
                    prompt = "Analyze these transactions and identify one transaction that seems most unusual or out of place. Briefly explain why.";
                    break;
                // Add cases for 'tax' and 'savings'
                default:
                    return res.status(400).json({ error: 'Invalid insight type' });
            }

            const fullPrompt = `${prompt}\n\nHere are the most recent transactions for context:\n${transactionSummary}`;
            
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: fullPrompt,
                    config: { responseMimeType: "application/json", responseSchema },
                });
                res.json(JSON.parse(response.text));
            } catch (error: any) {
                 res.status(500).json({ error: error.message });
            }
        });
    });

    // Add weaver and other AI endpoints
    router.post('/weaver/pitch', async (req, res) => {
        const { businessPlan } = req.body;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze this business plan and provide brief initial feedback (2-3 sentences) and 3 insightful follow-up questions. Plan: "${businessPlan}"`,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { feedback: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: {type: Type.STRING}, question: { type: Type.STRING }, category: { type: Type.STRING } } } } } } }
            });
            res.json(JSON.parse(response.text));
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/weaver/finalize', async (req, res) => {
         const { businessPlan } = req.body;
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `This business plan has been approved. Determine a seed funding amount (between $50k-$250k) and create a 4-step coaching plan. Plan: "${businessPlan}"`,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { loanAmount: { type: Type.NUMBER }, coachingPlan: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, timeline: { type: Type.STRING } } } } } } } } }
            });
            res.json(JSON.parse(response.text));
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });


    return router;
};
