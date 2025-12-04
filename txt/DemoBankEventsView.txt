import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Sector } from 'recharts';

// --- ENHANCEMENT: UTILITY FUNCTIONS & CONSTANTS ---

const MOCK_API_LATENCY = 300; // ms

export const UI_COLORS = {
    primary: '#8884d8',
    secondary: '#82ca9d',
    danger: '#ff7300',
    warning: '#ffc658',
    info: '#00C49F',
    text: '#9ca3af',
    textWhite: '#ffffff',
    background: 'rgba(31, 41, 55, 0.8)',
    border: '#4b5563',
    grid: 'rgba(156, 163, 175, 0.2)',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#eab308',
};

export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const formatDate = (date: Date, includeTime: boolean = true) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false;
    }
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// --- ENHANCEMENT: TYPE DEFINITIONS FOR A REAL-WORLD APPLICATION ---

export type EventStatus = 'published' | 'delivered' | 'failed' | 'processing';
export type SubscriptionStatus = 'Active' | 'Paused' | 'Error' | 'Deleting';
export type DestinationType = 'Webhook' | 'Function' | 'LogicApp' | 'EventGrid' | 'ServiceBus';

export interface EventPayload {
    transactionId?: string;
    userId?: string;
    amount?: number;
    currency?: string;
    timestamp?: string;
    status?: 'completed' | 'pending' | 'failed' | 'flagged';
    reason?: string;
    location?: {
        ip: string;
        country: string;
        city: string;
    };
    metadata?: Record<string, any>;
    [key: string]: any;
}

export interface Event {
    id: string;
    topic: string;
    payload: EventPayload;
    publishedAt: Date;
    deliveredAt?: Date;
    status: EventStatus;
    sizeBytes: number;
    correlationId: string;
}

export interface Subscription {
    id: string;
    topic: string;
    destinationType: DestinationType;
    destinationEndpoint: string;
    status: SubscriptionStatus;
    createdAt: Date;
    filter?: Record<string, any>;
    retryPolicy?: {
        count: number;
        intervalSeconds: number;
    };
}

export interface DeliveryError {
    id: string;
    eventId: string;
    subscriptionId: string;
    timestamp: Date;
    statusCode?: number;
    errorMessage: string;
    attempt: number;
}

export interface EventTopic {
    name: string;
    description: string;
    schemaDefinition: Record<string, any>;
    subscriberCount: number;
    avgEventSizeBytes: number;
    eventsPerMinute: number;
    createdAt: Date;
}

export interface OverallMetrics {
    totalTopics: number;
    totalSubscriptions: number;
    avgEventsPerHour: number;
    deliveryFailureRate: number;
    avgLatencyMs: number;
}

// --- ENHANCEMENT: MOCK DATA GENERATION ---

const eventTopicsList: EventTopic[] = [
    { name: 'db.transactions.created', description: 'Fired when a new financial transaction is initiated.', schemaDefinition: { type: 'object', properties: { transactionId: { type: 'string' }, amount: { type: 'number' } } }, subscriberCount: 5, avgEventSizeBytes: 512, eventsPerMinute: 133, createdAt: new Date('2023-01-10T10:00:00Z') },
    { name: 'db.transactions.completed', description: 'Fired when a transaction is successfully completed.', schemaDefinition: { type: 'object', properties: { transactionId: { type: 'string' }, status: { type: 'string' } } }, subscriberCount: 3, avgEventSizeBytes: 384, eventsPerMinute: 130, createdAt: new Date('2023-01-10T10:01:00Z') },
    { name: 'db.transactions.failed', description: 'Fired when a transaction fails.', schemaDefinition: { type: 'object', properties: { transactionId: { type: 'string' }, reason: { type: 'string' } } }, subscriberCount: 2, avgEventSizeBytes: 420, eventsPerMinute: 3, createdAt: new Date('2023-01-10T10:02:00Z') },
    { name: 'db.anomalies.detected', description: 'Fired when the fraud detection system flags a transaction.', schemaDefinition: { type: 'object', properties: { transactionId: { type: 'string' }, score: { type: 'number' } } }, subscriberCount: 1, avgEventSizeBytes: 896, eventsPerMinute: 1, createdAt: new Date('2023-01-15T14:30:00Z') },
    { name: 'db.payments.status_changed', description: 'Fired for any status change in the payment lifecycle.', schemaDefinition: { type: 'object', properties: { paymentId: { type: 'string' }, oldStatus: { type: 'string' }, newStatus: { type: 'string' } } }, subscriberCount: 4, avgEventSizeBytes: 300, eventsPerMinute: 90, createdAt: new Date('2023-02-01T09:00:00Z') },
    { name: 'db.users.created', description: 'A new user has signed up.', schemaDefinition: { type: 'object', properties: { userId: { type: 'string' }, email: { type: 'string' } } }, subscriberCount: 2, avgEventSizeBytes: 256, eventsPerMinute: 10, createdAt: new Date('2023-02-05T11:00:00Z') },
    { name: 'db.users.updated', description: 'A user has updated their profile.', schemaDefinition: { type: 'object', properties: { userId: { type: 'string' }, updatedFields: { type: 'array' } } }, subscriberCount: 1, avgEventSizeBytes: 1024, eventsPerMinute: 5, createdAt: new Date('2023-02-05T11:05:00Z') },
    { name: 'db.users.login_success', description: 'Successful user login event.', schemaDefinition: { type: 'object', properties: { userId: { type: 'string' }, ip: { type: 'string' } } }, subscriberCount: 1, avgEventSizeBytes: 128, eventsPerMinute: 200, createdAt: new Date('2023-03-12T00:00:00Z') },
    { name: 'db.users.login_failed', description: 'Failed user login attempt.', schemaDefinition: { type: 'object', properties: { username: { type: 'string' }, ip: { type: 'string' } } }, subscriberCount: 1, avgEventSizeBytes: 150, eventsPerMinute: 8, createdAt: new Date('2023-03-12T00:01:00Z') },
    { name: 'db.accounts.opened', description: 'A new bank account has been opened.', schemaDefinition: { type: 'object', properties: { accountId: { type: 'string' }, userId: { type: 'string' }, type: { type: 'string' } } }, subscriberCount: 3, avgEventSizeBytes: 450, eventsPerMinute: 2, createdAt: new Date('2023-04-01T16:00:00Z') },
    { name: 'db.cards.issued', description: 'A new credit/debit card has been issued.', schemaDefinition: { type: 'object', properties: { cardId: { type: 'string' }, accountId: { type: 'string' } } }, subscriberCount: 2, avgEventSizeBytes: 320, eventsPerMinute: 1, createdAt: new Date('2023-04-02T18:00:00Z') },
    { name: 'sys.audits.access', description: 'System access audit log.', schemaDefinition: { type: 'object', properties: { principalId: { type: 'string' }, resource: { type: 'string' }, action: { type: 'string' } } }, subscriberCount: 1, avgEventSizeBytes: 600, eventsPerMinute: 50, createdAt: new Date('2023-05-20T00:00:00Z') },
];


export const generateRandomEvent = (topicName?: string): Event => {
    const topic = topicName ? eventTopicsList.find(t => t.name === topicName) || eventTopicsList[Math.floor(Math.random() * eventTopicsList.length)] : eventTopicsList[Math.floor(Math.random() * eventTopicsList.length)];
    const publishedAt = new Date(Date.now() - Math.random() * 1000 * 60 * 5); // in the last 5 minutes
    const hasDelivered = Math.random() > 0.01;
    const isFailed = !hasDelivered;
    const deliveredAt = hasDelivered ? new Date(publishedAt.getTime() + 50 + Math.random() * 200) : undefined;
    const status: EventStatus = isFailed ? 'failed' : (deliveredAt ? 'delivered' : 'processing');
    const payload: EventPayload = {
        metadata: {
            source: 'core-banking-api',
            version: 'v1.2.3',
        }
    };

    if (topic.name.includes('transaction')) {
        payload.transactionId = generateUUID();
        payload.userId = `user-${Math.floor(Math.random() * 1000)}`;
        payload.amount = parseFloat((Math.random() * 5000).toFixed(2));
        payload.currency = 'USD';
        payload.timestamp = publishedAt.toISOString();
        payload.status = 'completed';
        payload.location = {
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            country: 'USA',
            city: 'New York'
        };
    } else if (topic.name.includes('user')) {
        payload.userId = `user-${Math.floor(Math.random() * 10000)}`;
        payload.timestamp = publishedAt.toISOString();
    }

    const payloadString = JSON.stringify(payload);

    return {
        id: generateUUID(),
        topic: topic.name,
        payload,
        publishedAt,
        deliveredAt,
        status,
        sizeBytes: new TextEncoder().encode(payloadString).length,
        correlationId: generateUUID(),
    };
};

let mockSubscriptions: Subscription[] = [
    { id: generateUUID(), topic: 'db.transactions.created', destinationType: 'Webhook', destinationEndpoint: 'https://api.transaction-processor.com/v1/hooks', status: 'Active', createdAt: new Date('2023-01-11T12:00:00Z'), retryPolicy: { count: 3, intervalSeconds: 60 } },
    { id: generateUUID(), topic: 'db.anomalies.detected', destinationType: 'Function', destinationEndpoint: 'fn-notify-security-team', status: 'Active', createdAt: new Date('2023-01-16T10:30:00Z'), retryPolicy: { count: 5, intervalSeconds: 300 } },
    { id: generateUUID(), topic: 'db.payments.status_changed', destinationType: 'LogicApp', destinationEndpoint: 'la-update-erp-system', status: 'Active', createdAt: new Date('2023-02-02T08:00:00Z'), filter: { 'field': 'payload.status', 'value': 'completed' }, retryPolicy: { count: 3, intervalSeconds: 120 } },
    { id: generateUUID(), topic: 'db.users.created', destinationType: 'Webhook', destinationEndpoint: 'https://api.crm-sync.com/v2/users', status: 'Error', createdAt: new Date('2023-02-06T11:00:00Z'), retryPolicy: { count: 2, intervalSeconds: 30 } },
    { id: generateUUID(), topic: 'db.transactions.created', destinationType: 'EventGrid', destinationEndpoint: 'eg-topic-finance-analytics', status: 'Paused', createdAt: new Date('2023-06-01T15:00:00Z'), filter: { 'field': 'payload.amount', 'operator': '>', 'value': 1000 }, retryPolicy: { count: 3, intervalSeconds: 60 } },
];

let mockErrors: DeliveryError[] = [
    { id: generateUUID(), eventId: generateUUID(), subscriptionId: mockSubscriptions[3].id, timestamp: new Date(Date.now() - 3600000), statusCode: 503, errorMessage: "Service Unavailable: CRM endpoint timed out.", attempt: 3 },
    { id: generateUUID(), eventId: generateUUID(), subscriptionId: mockSubscriptions[3].id, timestamp: new Date(Date.now() - 7200000), statusCode: 503, errorMessage: "Service Unavailable: CRM endpoint timed out.", attempt: 3 },
    { id: generateUUID(), eventId: generateUUID(), subscriptionId: mockSubscriptions[3].id, timestamp: new Date(Date.now() - 10800000), statusCode: 401, errorMessage: "Unauthorized: Invalid API key.", attempt: 1 },
];


// --- ENHANCEMENT: MOCK API SERVICE ---

export const MockApiService = {
    fetchOverallMetrics: async (): Promise<OverallMetrics> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    totalTopics: eventTopicsList.length,
                    totalSubscriptions: mockSubscriptions.length,
                    avgEventsPerHour: 8123,
                    deliveryFailureRate: 0.1,
                    avgLatencyMs: 128,
                });
            }, MOCK_API_LATENCY);
        });
    },

    fetchTimeSeriesData: async (timeRange: '1h' | '24h' | '7d'): Promise<any[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                let dataPoints = 0;
                let interval = 0;
                let format: any = {};
                if (timeRange === '1h') {
                    dataPoints = 12; // 5-min intervals
                    interval = 5 * 60 * 1000;
                    format = { hour: '2-digit', minute: '2-digit', hour12: false };
                } else if (timeRange === '24h') {
                    dataPoints = 24; // 1-hour intervals
                    interval = 60 * 60 * 1000;
                    format = { hour: '2-digit', hour12: false };
                } else {
                    dataPoints = 7; // 1-day intervals
                    interval = 24 * 60 * 60 * 1000;
                    format = { weekday: 'short' };
                }
                const data = [];
                const now = Date.now();
                for (let i = dataPoints - 1; i >= 0; i--) {
                    const time = new Date(now - i * interval);
                    const baseTraffic = timeRange === '1h' ? 2000 : 50000;
                    const variation = Math.random() * 0.4 - 0.2; // -20% to +20%
                    const published = Math.round(baseTraffic * (1 + variation));
                    const delivered = Math.round(published * (1 - Math.random() * 0.002));
                    data.push({
                        name: new Intl.DateTimeFormat('en-US', format).format(time),
                        Published: published,
                        Delivered: delivered,
                        Failed: published - delivered,
                    });
                }
                resolve(data);
            }, MOCK_API_LATENCY);
        });
    },
    
    fetchSubscriptions: async (): Promise<Subscription[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve([...mockSubscriptions]), MOCK_API_LATENCY);
        });
    },
    
    updateSubscription: async (subId: string, updates: Partial<Subscription>): Promise<Subscription> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockSubscriptions.findIndex(s => s.id === subId);
                if (index > -1) {
                    mockSubscriptions[index] = { ...mockSubscriptions[index], ...updates };
                    if (updates.status === 'Active' && mockSubscriptions[index].topic === 'db.users.created') {
                        // Clear errors for this subscription when reactivated
                        mockErrors = mockErrors.filter(e => e.subscriptionId !== subId);
                    }
                    resolve(mockSubscriptions[index]);
                } else {
                    reject(new Error("Subscription not found"));
                }
            }, MOCK_API_LATENCY * 2);
        });
    },

    createSubscription: async (newSub: Omit<Subscription, 'id' | 'createdAt' | 'status'>): Promise<Subscription> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const created: Subscription = {
                    ...newSub,
                    id: generateUUID(),
                    createdAt: new Date(),
                    status: 'Active'
                };
                mockSubscriptions.push(created);
                resolve(created);
            }, MOCK_API_LATENCY * 2);
        });
    },

    deleteSubscription: async (subId: string): Promise<{ success: boolean }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                mockSubscriptions = mockSubscriptions.filter(s => s.id !== subId);
                resolve({ success: true });
            }, MOCK_API_LATENCY * 2);
        });
    },

    fetchErrors: async (): Promise<DeliveryError[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve([...mockErrors]), MOCK_API_LATENCY);
        });
    },

    retryFailedEvent: async (errorId: string): Promise<{ success: true }> => {
         return new Promise(resolve => {
            setTimeout(() => {
                mockErrors = mockErrors.filter(e => e.id !== errorId);
                resolve({ success: true });
            }, MOCK_API_LATENCY * 1.5);
        });
    },

    fetchTopics: async (): Promise<EventTopic[]> => {
         return new Promise(resolve => {
            setTimeout(() => resolve([...eventTopicsList]), MOCK_API_LATENCY);
        });
    },

    fetchRecentEvents: async (count: number = 50): Promise<Event[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const events = Array.from({ length: count }, () => generateRandomEvent());
                events.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
                resolve(events);
            }, MOCK_API_LATENCY);
        });
    },
};

// --- ENHANCEMENT: REUSABLE UI COMPONENTS ---

export const Icon: React.FC<{ path: string; className?: string }> = ({ path, className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

export const ICONS = {
    EDIT: 'M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z',
    DELETE: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z',
    PAUSE: 'M15.75 5.25v13.5m-7.5-13.5v13.5',
    PLAY: 'M5.25 5.653c0-.856.917-1.398 1.657-.936l11.54 6.348a1.125 1.125 0 010 1.871l-11.54 6.347a1.125 1.125 0 01-1.657-.936V5.653z',
    REFRESH: 'M16.023 9.348h4.992v-.001a.75.75 0 01.75.75v3.496a.75.75 0 01-1.5 0v-2.24l-3.555 3.554a3 3 0 11-4.242-4.242l.001-.001 3.554-3.555h-2.24a.75.75 0 010-1.5z M3.003 12a9 9 0 1117.228 3.46.75.75 0 11-1.06 1.06A7.5 7.5 0 105.46 6.78l.001-.001a.75.75 0 011.06-1.06 9 9 0 01-3.518 6.28z',
    PLUS: 'M12 4.5v15m7.5-7.5h-15',
    CHEVRON_DOWN: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
};

export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

export const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            active
                ? 'bg-indigo-500 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
        {children}
    </button>
);

export const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'bg-red-600 hover:bg-red-700' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`px-4 py-2 rounded-md ${confirmColor} text-white font-semibold transition-colors`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div className={`${bgColor} text-white font-bold rounded-lg shadow-lg py-3 px-5 flex items-center`}>
                <span className="mr-3">{message}</span>
                <button onClick={onDismiss} className="text-xl font-semibold leading-none">&times;</button>
            </div>
        </div>
    );
};

// --- ENHANCEMENT: DASHBOARD COMPONENTS ---

type TimeRange = '1h' | '24h' | '7d';

export const AdvancedLineChart: React.FC<{data: any[], timeRange: TimeRange, onTimeRangeChange: (range: TimeRange) => void, isLoading: boolean }> = ({ data, timeRange, onTimeRangeChange, isLoading }) => {
    return (
        <Card title="Event Traffic Analysis">
            <div className="flex justify-end mb-4">
                <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-md">
                    {(['1h', '24h', '7d'] as TimeRange[]).map(range => (
                        <button key={range} onClick={() => onTimeRangeChange(range)} className={`px-3 py-1 text-xs font-semibold rounded ${timeRange === range ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            {isLoading ? <div className="h-[300px] flex items-center justify-center"><LoadingSpinner /></div> : (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={UI_COLORS.primary} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={UI_COLORS.primary} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={UI_COLORS.secondary} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={UI_COLORS.secondary} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke={UI_COLORS.text} fontSize={12} />
                        <YAxis stroke={UI_COLORS.text} fontSize={12} />
                        <CartesianGrid stroke={UI_COLORS.grid} strokeDasharray="3 3" />
                        <Tooltip contentStyle={{ backgroundColor: UI_COLORS.background, borderColor: UI_COLORS.border }}/>
                        <Legend />
                        <Area type="monotone" dataKey="Published" stroke={UI_COLORS.primary} fillOpacity={1} fill="url(#colorPublished)" />
                        <Area type="monotone" dataKey="Delivered" stroke={UI_COLORS.secondary} fillOpacity={1} fill="url(#colorDelivered)" />
                        <Line type="monotone" dataKey="Failed" stroke={UI_COLORS.danger} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export const SubscriptionTableRow: React.FC<{
    sub: Subscription;
    onAction: (action: 'edit' | 'delete' | 'toggle', sub: Subscription) => void;
}> = ({ sub, onAction }) => {
    const statusColor = {
        Active: 'text-green-400',
        Paused: 'text-yellow-400',
        Error: 'text-red-400',
        Deleting: 'text-gray-500',
    }[sub.status];

    return (
        <tr className="border-b border-gray-800 hover:bg-gray-800/50">
            <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{sub.topic}</td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-300">{sub.destinationType}</span>
                    <span className="font-mono text-xs">{sub.destinationEndpoint}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`font-semibold ${statusColor}`}>{sub.status}</span>
            </td>
            <td className="px-6 py-4 text-xs text-gray-400">{formatDate(sub.createdAt)}</td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-3">
                    <button onClick={() => onAction('toggle', sub)} className="text-gray-400 hover:text-white transition-colors" title={sub.status === 'Active' ? 'Pause' : 'Resume'}>
                        <Icon path={sub.status === 'Active' ? ICONS.PAUSE : ICONS.PLAY} />
                    </button>
                    <button onClick={() => onAction('edit', sub)} className="text-gray-400 hover:text-white transition-colors" title="Edit">
                        <Icon path={ICONS.EDIT} />
                    </button>
                    <button onClick={() => onAction('delete', sub)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Icon path={ICONS.DELETE} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export const SubscriptionTable: React.FC<{
    subscriptions: Subscription[];
    isLoading: boolean;
    onAction: (action: 'edit' | 'delete' | 'toggle', sub: Subscription) => void;
    onAdd: () => void;
}> = ({ subscriptions, isLoading, onAction, onAdd }) => {
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Event Subscriptions</h3>
                <button onClick={onAdd} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-sm transition-colors">
                    <Icon path={ICONS.PLUS} className="w-4 h-4 mr-2" />
                    New Subscription
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Topic</th>
                            <th scope="col" className="px-6 py-3">Destination</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Created At</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && Array.from({ length: 4 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-800">
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-full"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-2/3"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-1/4"></div></td>
                            </tr>
                        ))}
                        {!isLoading && subscriptions.map(sub => (
                           <SubscriptionTableRow key={sub.id} sub={sub} onAction={onAction} />
                        ))}
                    </tbody>
                </table>
                {!isLoading && subscriptions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No subscriptions found.</div>
                )}
            </div>
        </Card>
    );
};

export const LiveEventStream: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) {
                setEvents(prevEvents => {
                    const newEvent = generateRandomEvent();
                    const newEvents = [newEvent, ...prevEvents];
                    return newEvents.slice(0, 50); // Keep the list from growing indefinitely
                });
            }
        }, 2000); // Add a new event every 2 seconds

        return () => clearInterval(interval);
    }, [isPaused]);

    const getStatusIndicatorColor = (status: EventStatus) => {
        switch (status) {
            case 'delivered': return 'bg-green-500';
            case 'failed': return 'bg-red-500';
            case 'processing': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };
    
    return (
        <Card>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Live Event Stream</h3>
                <button onClick={() => setIsPaused(!isPaused)} className="text-gray-400 hover:text-white transition-colors" title={isPaused ? 'Resume Stream' : 'Pause Stream'}>
                    <Icon path={isPaused ? ICONS.PLAY : ICONS.PAUSE} />
                </button>
            </div>
            <div className="h-96 overflow-y-auto pr-2">
                {events.map(event => (
                    <div key={event.id} className="font-mono text-xs p-2 border-b border-gray-800/50 flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getStatusIndicatorColor(event.status)}`}></div>
                        <div>
                            <span className="text-gray-500 mr-2">{formatDate(event.publishedAt).split(', ')[1]}</span>
                            <span className="text-purple-400">{event.topic}</span>
                            <span className="text-gray-400"> -> </span>
                            <span className="text-cyan-400">{`${formatBytes(event.sizeBytes)}`}</span>
                        </div>
                    </div>
                ))}
                 {events.length === 0 && (
                    <div className="text-center py-8 text-gray-500">Waiting for events...</div>
                )}
            </div>
        </Card>
    );
};

export const SubscriptionFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (sub: Omit<Subscription, 'id' | 'createdAt' | 'status'> | (Partial<Subscription> & { id: string })) => void;
    initialData?: Subscription | null;
    topics: EventTopic[];
}> = ({ isOpen, onClose, onSave, initialData, topics }) => {
    const [formData, setFormData] = useState({
        topic: '',
        destinationType: 'Webhook' as DestinationType,
        destinationEndpoint: '',
        filterField: '',
        filterValue: '',
        retryCount: '3',
        retryInterval: '60',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                topic: initialData.topic,
                destinationType: initialData.destinationType,
                destinationEndpoint: initialData.destinationEndpoint,
                filterField: initialData.filter?.field || '',
                filterValue: initialData.filter?.value || '',
                retryCount: String(initialData.retryPolicy?.count || 3),
                retryInterval: String(initialData.retryPolicy?.intervalSeconds || 60),
            });
        } else {
            // Reset form for new subscription
            setFormData({
                topic: topics.length > 0 ? topics[0].name : '',
                destinationType: 'Webhook',
                destinationEndpoint: '',
                filterField: '',
                filterValue: '',
                retryCount: '3',
                retryInterval: '60',
            });
        }
    }, [initialData, isOpen, topics]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submission: any = {
            topic: formData.topic,
            destinationType: formData.destinationType,
            destinationEndpoint: formData.destinationEndpoint,
            retryPolicy: {
                count: parseInt(formData.retryCount, 10),
                intervalSeconds: parseInt(formData.retryInterval, 10),
            }
        };

        if (formData.filterField && formData.filterValue) {
            submission.filter = { field: formData.filterField, value: formData.filterValue };
        }
        
        if (initialData) {
            submission.id = initialData.id;
        }

        onSave(submission);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold text-white mb-6">{initialData ? 'Edit Subscription' : 'Create New Subscription'}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Topic */}
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">Topic</label>
                            <select id="topic" name="topic" value={formData.topic} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>

                        {/* Destination Type */}
                        <div>
                            <label htmlFor="destinationType" className="block text-sm font-medium text-gray-300 mb-1">Destination Type</label>
                            <select id="destinationType" name="destinationType" value={formData.destinationType} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
                                <option>Webhook</option>
                                <option>Function</option>
                                <option>LogicApp</option>
                                <option>EventGrid</option>
                                <option>ServiceBus</option>
                            </select>
                        </div>
                    </div>

                    {/* Destination Endpoint */}
                    <div className="mt-4">
                        <label htmlFor="destinationEndpoint" className="block text-sm font-medium text-gray-300 mb-1">Destination Endpoint</label>
                        <input type="text" id="destinationEndpoint" name="destinationEndpoint" value={formData.destinationEndpoint} onChange={handleChange} required className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono" placeholder={formData.destinationType === 'Webhook' ? 'https://...' : 'resource-name'}/>
                    </div>

                    <div className="mt-6 border-t border-gray-700 pt-6">
                         <h4 className="text-lg font-semibold text-white mb-4">Advanced Configuration</h4>
                         {/* Filtering */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="filterField" className="block text-sm font-medium text-gray-300 mb-1">Filter Field (Optional)</label>
                                <input type="text" id="filterField" name="filterField" value={formData.filterField} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2 font-mono" placeholder="payload.amount" />
                            </div>
                             <div>
                                <label htmlFor="filterValue" className="block text-sm font-medium text-gray-300 mb-1">Filter Value</label>
                                <input type="text" id="filterValue" name="filterValue" value={formData.filterValue} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2" placeholder="> 1000"/>
                            </div>
                        </div>
                         {/* Retry Policy */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label htmlFor="retryCount" className="block text-sm font-medium text-gray-300 mb-1">Retry Count</label>
                                <input type="number" id="retryCount" name="retryCount" min="0" max="10" value={formData.retryCount} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2" />
                            </div>
                             <div>
                                <label htmlFor="retryInterval" className="block text-sm font-medium text-gray-300 mb-1">Retry Interval (seconds)</label>
                                <input type="number" id="retryInterval" name="retryInterval" min="1" max="3600" value={formData.retryInterval} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">
                            Save Subscription
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ErrorLogView: React.FC<{
    errors: DeliveryError[];
    subscriptions: Subscription[];
    isLoading: boolean;
    onRetry: (errorId: string) => void;
}> = ({ errors, subscriptions, isLoading, onRetry }) => {
    const getSubscriptionTopic = (subId: string) => {
        return subscriptions.find(s => s.id === subId)?.topic || 'Unknown Topic';
    };

    return (
        <Card title="Failed Delivery Log">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">Subscription Topic</th>
                            <th scope="col" className="px-6 py-3">Error</th>
                            <th scope="col" className="px-6 py-3">Status Code</th>
                            <th scope="col" className="px-6 py-3">Attempt</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                         {isLoading && Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-800">
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-2/3"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-full"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-1/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-1/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div></td>
                            </tr>
                        ))}
                        {!isLoading && errors.map(err => (
                            <tr key={err.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 whitespace-nowrap">{formatDate(err.timestamp)}</td>
                                <td className="px-6 py-4 font-mono text-white">{getSubscriptionTopic(err.subscriptionId)}</td>
                                <td className="px-6 py-4 text-red-400">{err.errorMessage}</td>
                                <td className="px-6 py-4">{err.statusCode || 'N/A'}</td>
                                <td className="px-6 py-4">{err.attempt}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onRetry(err.id)} className="flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                                        <Icon path={ICONS.REFRESH} className="w-4 h-4 mr-1"/>
                                        Retry
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {!isLoading && errors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No delivery errors logged.</div>
                )}
            </div>
        </Card>
    );
};

// --- MAIN VIEW COMPONENT ---

type ActiveTab = 'overview' | 'subscriptions' | 'errors' | 'topics' | 'explorer';

const DemoBankEventsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    
    // State for data
    const [metrics, setMetrics] = useState<OverallMetrics | null>(null);
    const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [errors, setErrors] = useState<DeliveryError[]>([]);
    const [topics, setTopics] = useState<EventTopic[]>([]);
    const [recentEvents, setRecentEvents] = useState<Event[]>([]);

    // State for UI
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
        metrics: true,
        timeSeries: true,
        subscriptions: true,
        errors: true,
        topics: true,
        events: true,
    });
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // State for Modals
    const [isSubFormOpen, setIsSubFormOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ action: () => void; title: string; message: string } | null>(null);

    const setLoading = (key: string, value: boolean) => setIsLoading(prev => ({ ...prev, [key]: value }));

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // Data fetching logic
    const fetchData = useCallback(async () => {
        setLoading('metrics', true);
        MockApiService.fetchOverallMetrics().then(data => {
            setMetrics(data);
            setLoading('metrics', false);
        });

        setLoading('subscriptions', true);
        MockApiService.fetchSubscriptions().then(data => {
            setSubscriptions(data);
            setLoading('subscriptions', false);
        });

        setLoading('errors', true);
        MockApiService.fetchErrors().then(data => {
            setErrors(data);
            setLoading('errors', false);
        });

        setLoading('topics', true);
        MockApiService.fetchTopics().then(data => {
            setTopics(data);
            setLoading('topics', false);
        });
        
        setLoading('events', true);
        MockApiService.fetchRecentEvents().then(data => {
            setRecentEvents(data);
            setLoading('events', false);
        });

    }, []);

    const fetchChartData = useCallback(async (range: TimeRange) => {
        setLoading('timeSeries', true);
        MockApiService.fetchTimeSeriesData(range).then(data => {
            setTimeSeriesData(data);
            setLoading('timeSeries', false);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchChartData(timeRange);
    }, [timeRange, fetchChartData]);

    // Handlers for subscription actions
    const handleAddSubscription = () => {
        setEditingSub(null);
        setIsSubFormOpen(true);
    };

    const handleEditSubscription = (sub: Subscription) => {
        setEditingSub(sub);
        setIsSubFormOpen(true);
    };
    
    const handleSaveSubscription = async (subData: Omit<Subscription, 'id' | 'createdAt' | 'status'> | (Partial<Subscription> & { id: string })) => {
        setIsSubFormOpen(false);
        try {
            if ('id' in subData) {
                // Updating
                const updatedSub = await MockApiService.updateSubscription(subData.id, subData);
                setSubscriptions(subs => subs.map(s => s.id === updatedSub.id ? updatedSub : s));
                showToast('Subscription updated successfully!', 'success');
            } else {
                // Creating
                const newSub = await MockApiService.createSubscription(subData);
                setSubscriptions(subs => [...subs, newSub]);
                showToast('Subscription created successfully!', 'success');
            }
        } catch (error) {
            showToast('Failed to save subscription.', 'error');
        }
    };
    
    const handleToggleSubscription = async (sub: Subscription) => {
        const newStatus = sub.status === 'Active' ? 'Paused' : 'Active';
        try {
            const updatedSub = await MockApiService.updateSubscription(sub.id, { status: newStatus });
            setSubscriptions(subs => subs.map(s => s.id === updatedSub.id ? updatedSub : s));
            showToast(`Subscription ${newStatus.toLowerCase()}.`, 'success');
        } catch (error) {
            showToast('Failed to update subscription status.', 'error');
        }
    };
    
    const handleDeleteSubscription = (sub: Subscription) => {
        setConfirmAction({
            action: async () => {
                try {
                    await MockApiService.deleteSubscription(sub.id);
                    setSubscriptions(subs => subs.filter(s => s.id !== sub.id));
                    showToast('Subscription deleted.', 'success');
                } catch (error) {
                    showToast('Failed to delete subscription.', 'error');
                }
                setIsConfirmModalOpen(false);
            },
            title: 'Delete Subscription',
            message: `Are you sure you want to delete the subscription for topic "${sub.topic}"? This action cannot be undone.`
        });
        setIsConfirmModalOpen(true);
    };

    const handleRetryError = async (errorId: string) => {
        try {
            await MockApiService.retryFailedEvent(errorId);
            setErrors(errs => errs.filter(e => e.id !== errorId));
            showToast('Event retry initiated.', 'success');
        } catch (error) {
            showToast('Failed to retry event.', 'error');
        }
    };


    const originalEventTrafficData = [
        { name: '12:00', Published: 1200, Delivered: 1198 },
        { name: '13:00', Published: 1500, Delivered: 1500 },
        { name: '14:00', Published: 1300, Delivered: 1299 },
        { name: '15:00', Published: 1800, Delivered: 1800 },
        { name: '16:00', Published: 2200, Delivered: 2195 },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                             <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading.metrics ? '...' : metrics?.totalTopics}</p><p className="text-sm text-gray-400 mt-1">Event Topics</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading.metrics ? '...' : metrics?.totalSubscriptions}</p><p className="text-sm text-gray-400 mt-1">Subscriptions</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading.metrics ? '...' : `${(metrics?.avgEventsPerHour || 0) / 1000}k`}</p><p className="text-sm text-gray-400 mt-1">Events/hr (avg)</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading.metrics ? '...' : metrics?.deliveryFailureRate}%</p><p className="text-sm text-gray-400 mt-1">Failure Rate</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{isLoading.metrics ? '...' : metrics?.avgLatencyMs}ms</p><p className="text-sm text-gray-400 mt-1">Avg. Latency</p></Card>
                        </div>
                        <AdvancedLineChart data={timeSeriesData} timeRange={timeRange} onTimeRangeChange={setTimeRange} isLoading={isLoading.timeSeries} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SubscriptionTable
                                subscriptions={subscriptions.slice(0, 5)} // Show a preview
                                isLoading={isLoading.subscriptions}
                                onAction={(action, sub) => {
                                    if (action === 'edit') handleEditSubscription(sub);
                                    if (action === 'delete') handleDeleteSubscription(sub);
                                    if (action === 'toggle') handleToggleSubscription(sub);
                                }}
                                onAdd={handleAddSubscription}
                            />
                            <LiveEventStream />
                        </div>
                    </div>
                );
            case 'subscriptions':
                return <SubscriptionTable 
                            subscriptions={subscriptions} 
                            isLoading={isLoading.subscriptions} 
                            onAction={(action, sub) => {
                                if (action === 'edit') handleEditSubscription(sub);
                                if (action === 'delete') handleDeleteSubscription(sub);
                                if (action === 'toggle') handleToggleSubscription(sub);
                            }}
                            onAdd={handleAddSubscription}
                        />;
            case 'errors':
                return <ErrorLogView errors={errors} subscriptions={subscriptions} isLoading={isLoading.errors} onRetry={handleRetryError} />;
            case 'topics':
                return (
                    <Card title="Available Event Topics">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading.topics && Array.from({length: 6}).map((_, i) => <div key={i} className="bg-gray-900/30 p-4 rounded-lg animate-pulse h-40"></div>)}
                            {!isLoading.topics && topics.map(topic => (
                                <div key={topic.name} className="bg-gray-900/30 p-4 rounded-lg flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-mono text-lg text-purple-400">{topic.name}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{topic.description}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-4 flex justify-between">
                                        <span>{topic.subscriberCount} Subscribers</span>
                                        <span>~{topic.eventsPerMinute}/min</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                );
             case 'explorer':
                // A full-featured event explorer would be a very large component.
                // This is a simplified version for demonstration.
                return (
                    <Card title="Event Explorer">
                        <div className="text-gray-400 p-4">
                            <p className="mb-4">This feature allows developers and support staff to inspect individual event payloads, trace event journeys, and debug issues. A real-world implementation would include advanced filtering by correlation ID, timestamp, payload content, and status.</p>
                            <div className="bg-gray-900/50 p-4 rounded-lg h-96 overflow-y-auto">
                                {isLoading.events && <LoadingSpinner />}
                                {!isLoading.events && recentEvents.map(event => (
                                    <div key={event.id} className="font-mono text-xs p-2 border-b border-gray-800/50">
                                         <details>
                                            <summary className="cursor-pointer">
                                                <span className="text-gray-500 mr-2">{formatDate(event.publishedAt).split(', ')[1]}</span>
                                                <span className="text-purple-400">{event.topic}</span>
                                            </summary>
                                            <pre className="text-cyan-300 bg-black/30 p-3 mt-2 rounded overflow-x-auto">
                                                {JSON.stringify(event.payload, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };
    

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Events</h2>
                <div className="flex items-center space-x-2">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                    <TabButton active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')}>Subscriptions</TabButton>
                    <TabButton active={activeTab === 'errors'} onClick={() => setActiveTab('errors')}>Error Log</TabButton>
                    <TabButton active={activeTab === 'topics'} onClick={() => setActiveTab('topics')}>Topics</TabButton>
                    <TabButton active={activeTab === 'explorer'} onClick={() => setActiveTab('explorer')}>Explorer</TabButton>
                </div>
            </div>

            {renderContent()}

            {/* Modals and Toasts */}
            <SubscriptionFormModal
                isOpen={isSubFormOpen}
                onClose={() => setIsSubFormOpen(false)}
                onSave={handleSaveSubscription}
                initialData={editingSub}
                topics={topics}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => confirmAction?.action()}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
            />
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default DemoBankEventsView;
