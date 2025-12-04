// data/platform/mlModels.ts
import { MLModel } from '../../types';

export const MOCK_ML_MODELS: MLModel[] = [
    {
        id: 'model-fraud-1',
        name: 'fraud-detection',
        version: 3,
        accuracy: 98.5,
        status: 'Production',
        lastTrained: '2024-07-15',
        performanceHistory: [
            { date: '2024-05-01', accuracy: 98.2 },
            { date: '2024-06-01', accuracy: 98.4 },
            { date: '2024-07-01', accuracy: 98.5 },
        ],
    },
    {
        id: 'model-churn-2',
        name: 'churn-predictor',
        version: 2,
        accuracy: 92.1,
        status: 'Production',
        lastTrained: '2024-06-20',
        performanceHistory: [
            { date: '2024-05-01', accuracy: 92.5 },
            { date: '2024-06-01', accuracy: 92.3 },
            { date: '2024-07-01', accuracy: 92.1 },
        ],
    },
    {
        id: 'model-fraud-2',
        name: 'fraud-detection',
        version: 4,
        accuracy: 99.1,
        status: 'Staging',
        lastTrained: '2024-07-22',
        performanceHistory: [
            { date: '2024-07-22', accuracy: 99.1 },
        ],
    },
    {
        id: 'model-reco-1',
        name: 'product-recommender',
        version: 1,
        accuracy: 88.5,
        status: 'Archived',
        lastTrained: '2023-12-10',
        performanceHistory: [],
    },
];