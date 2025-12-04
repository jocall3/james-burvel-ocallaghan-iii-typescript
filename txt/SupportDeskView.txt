import React, { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// ================================================================================================
// GLOBAL UTILITIES & CONTEXTS (New section to support enterprise features)
// ================================================================================================

// Mock API Call Utility
export const mockApiCall = <T,>(data: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

// Date Formatting Utility
export const formatDate = (dateString: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', options || { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

// Simple UUID Generator (for mock data)
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Notification Context for global alerts/messages
interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface NotificationContextType {
    addNotification: (message: string, type?: Notification['type'], duration?: number) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: Notification['type'] = 'info', duration: number = 3000) => {
        const id = generateUUID();
        const newNotification = { id, message, type, duration };
        setNotifications((prev) => [...prev, newNotification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const notificationColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`${notificationColors[n.type]} text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between min-w-[250px]`}
                        role="alert"
                    >
                        <span>{n.message}</span>
                        <button onClick={() => removeNotification(n.id)} className="ml-4 text-white hover:text-gray-200">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// Mock Auth Context (for agent roles, permissions)
type UserRole = 'Admin' | 'Agent' | 'Manager';
interface AuthContextType {
    currentUser: { id: string; name: string; email: string; role: UserRole; };
    isAuthenticated: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: UserRole; } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Mock auto-login for demonstration
        setCurrentUser({ id: 'agent_007', name: 'James Bond', email: 'jbond@demobank.com', role: 'Agent' });
        setIsAuthenticated(true);
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        // Mock authentication
        if (username === 'agent' && password === 'password') {
            await mockApiCall({}, 500); // Simulate network delay
            setCurrentUser({ id: 'agent_007', name: 'James Bond', email: 'jbond@demobank.com', role: 'Agent' });
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setIsAuthenticated(false);
    }, []);

    const value = useMemo(() => ({ currentUser, isAuthenticated, login, logout }), [currentUser, isAuthenticated, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ================================================================================================
// TYPE DEFINITIONS & MOCK DATA EXPANSION
// ================================================================================================

type TicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed' | 'On-Hold' | 'Reopened';
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
type TicketCategory = 'Billing' | 'Technical' | 'Account' | 'Feature Request' | 'General Inquiry' | 'Fraud';
type CommunicationChannel = 'Email' | 'Chat' | 'Phone' | 'Social Media';
type AttachmentType = 'image' | 'document' | 'other';
type Sentiment = 'Positive' | 'Neutral' | 'Negative' | 'Mixed';

interface Agent {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'Online' | 'Offline' | 'Busy';
    team: string;
    avatarUrl: string;
    lastActive: string;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    registrationDate: string;
    lastLogin: string;
    totalTickets: number;
    openTickets: number;
    status: 'Active' | 'Inactive' | 'VIP';
    notes: string[];
    associatedAccounts?: string[]; // e.g., corporate accounts
}

interface TicketMessage {
    id: string;
    senderId: string; // user or agent id
    senderName: string;
    timestamp: string;
    content: string;
    isInternal: boolean; // true if agent note, false if customer/public reply
    attachments?: Attachment[];
}

interface Attachment {
    id: string;
    filename: string;
    url: string;
    type: AttachmentType;
    uploadedBy: string;
    uploadDate: string;
    sizeKB: number;
}

interface SLA {
    id: string;
    name: string;
    priority: TicketPriority;
    firstResponseTimeHours: number;
    resolutionTimeHours: number;
    breached: boolean;
    timeRemainingFirstResponse: string; // e.g., '2h 30m'
    timeRemainingResolution: string;
    status: 'Met' | 'Breached' | 'Warning';
}

interface SupportTicket {
    id: string;
    subject: string;
    userId: string;
    userName: string; // Denormalized for quick access
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    assignedAgentId: string | null;
    assignedAgentName: string | null; // Denormalized
    lastUpdate: string;
    createdDate: string;
    description: string;
    messages: TicketMessage[];
    attachments: Attachment[];
    internalNotes: TicketMessage[]; // Separate for internal comms
    sla: SLA;
    tags: string[];
    sentiment?: Sentiment;
    channel: CommunicationChannel;
    linkedTickets?: string[]; // IDs of related tickets
    customFields?: { [key: string]: string };
}

interface CannedResponse {
    id: string;
    title: string;
    content: string;
    category: string;
    keywords: string[];
    createdBy: string;
    lastModified: string;
}

interface SLARule {
    id: string;
    name: string;
    conditions: { field: keyof SupportTicket; operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'; value: string | number | boolean; }[];
    firstResponseTimeHours: number;
    resolutionTimeHours: number;
    priority: TicketPriority;
    isActive: boolean;
    description?: string;
}

// ================================================================================================
// MOCK DATA GENERATION UTILITIES
// ================================================================================================

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateMockTicket = (index: number): SupportTicket => {
    const statuses: TicketStatus[] = ['Open', 'Pending', 'Resolved', 'Closed', 'On-Hold', 'Reopened'];
    const priorities: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
    const categories: TicketCategory[] = ['Billing', 'Technical', 'Account', 'Feature Request', 'General Inquiry', 'Fraud'];
    const channels: CommunicationChannel[] = ['Email', 'Chat', 'Phone', 'Social Media'];
    const agents: Agent[] = MOCK_AGENTS;
    const customers: Customer[] = MOCK_CUSTOMERS;

    const customer = getRandom(customers);
    const status = getRandom(statuses);
    const priority = getRandom(priorities);
    const agent = status === 'Open' || status === 'Reopened' ? null : getRandom(agents);
    const createdDate = getRandomDate(new Date(2023, 0, 1), new Date());
    const lastUpdate = getRandomDate(createdDate, new Date());

    const slaStatus: SLA['status'] = getRandom(['Met', 'Breached', 'Warning']);
    const firstResponseTime = getRandomInt(1, 48);
    const resolutionTime = getRandomInt(2, 72);
    const breached = slaStatus === 'Breached';
    const timeRemainingFirstResponse = breached ? 'Breached' : `${getRandomInt(1, 24)}h ${getRandomInt(0, 59)}m`;
    const timeRemainingResolution = breached ? 'Breached' : `${getRandomInt(1, 72)}h ${getRandomInt(0, 59)}m`;

    const descriptionContent = [
        "I can't log into my account. I've tried resetting my password multiple times, but it says my email isn't recognized.",
        "My recent transaction for $150 was debited twice. Please investigate and reverse the duplicate charge.",
        "The mobile app is crashing whenever I try to access my statements. I'm using an iPhone 14 Pro, iOS 17.2.",
        "I need to update my personal information, specifically my mailing address. How can I do this securely?",
        "There's a strange charge on my credit card for an unknown merchant. I suspect it might be fraudulent.",
        "When will the new dark mode feature be released for the web interface? I'm excited about it!",
        "I received an email stating my account was locked, but I didn't try to log in. Is my account secure?",
        "I want to close my account. What is the procedure for this?",
        "My direct deposit didn't show up this week. It usually arrives on Thursdays.",
        "I'm experiencing issues with linking my external bank account. It gives an error 'Connection Failed'."
    ];

    const messages: TicketMessage[] = [
        {
            id: generateUUID(), senderId: customer.id, senderName: customer.name, timestamp: createdDate.toISOString(),
            content: `Initial query: ${getRandom(descriptionContent)}`, isInternal: false
        },
    ];

    if (agent && status !== 'Open') {
        const agentReplyDate = new Date(createdDate.getTime() + getRandomInt(1, 12) * 3600 * 1000); // 1 to 12 hours later
        messages.push({
            id: generateUUID(), senderId: agent.id, senderName: agent.name, timestamp: agentReplyDate.toISOString(),
            content: `Thank you for reaching out. We are looking into this for you. Your ticket ID is ${index}.`, isInternal: false
        });
    }

    const sentiments: Sentiment[] = ['Positive', 'Neutral', 'Negative', 'Mixed'];

    return {
        id: `TKT-${String(100 + index).padStart(3, '0')}`,
        subject: `Issue with ${getRandom(categories)}: ${getRandom(descriptionContent).substring(0, 40)}...`,
        userId: customer.id,
        userName: customer.name,
        status: status,
        priority: priority,
        category: getRandom(categories),
        assignedAgentId: agent?.id || null,
        assignedAgentName: agent?.name || null,
        lastUpdate: lastUpdate.toISOString(),
        createdDate: createdDate.toISOString(),
        description: getRandom(descriptionContent),
        messages: messages,
        attachments: [],
        internalNotes: [],
        sla: {
            id: generateUUID(),
            name: `${priority} Priority SLA`,
            priority: priority,
            firstResponseTimeHours: firstResponseTime,
            resolutionTimeHours: resolutionTime,
            breached: breached,
            timeRemainingFirstResponse: timeRemainingFirstResponse,
            timeRemainingResolution: timeRemainingResolution,
            status: slaStatus,
        },
        tags: [getRandom(['billing', 'urgent', 'bug', 'feature']), getRandom(['mobile', 'web', 'api'])],
        sentiment: getRandom(sentiments),
        channel: getRandom(channels),
        linkedTickets: index % 5 === 0 ? [`TKT-${String(100 + (index - 1 > 0 ? index - 1 : index + 1)).padStart(3, '0')}`] : [],
        customFields: {
            'Account Type': getRandom(['Personal', 'Business']),
            'Device OS': getRandom(['iOS', 'Android', 'Windows', 'MacOS', 'Linux']),
        }
    };
};

export const MOCK_AGENTS: Agent[] = [
    { id: 'agent_001', name: 'Alice Smith', email: 'alice.s@demobank.com', role: 'Agent', status: 'Online', team: 'Level 1 Support', avatarUrl: 'https://i.pravatar.cc/40?img=1', lastActive: '2m ago' },
    { id: 'agent_002', name: 'Bob Johnson', email: 'bob.j@demobank.com', role: 'Agent', status: 'Busy', team: 'Level 1 Support', avatarUrl: 'https://i.pravatar.cc/40?img=2', lastActive: '15m ago' },
    { id: 'agent_003', name: 'Charlie Brown', email: 'charlie.b@demobank.com', role: 'Agent', status: 'Offline', team: 'Technical Support', avatarUrl: 'https://i.pravatar.cc/40?img=3', lastActive: '2h ago' },
    { id: 'agent_004', name: 'Diana Prince', email: 'diana.p@demobank.com', role: 'Manager', status: 'Online', team: 'Management', avatarUrl: 'https://i.pravatar.cc/40?img=4', lastActive: '5m ago' },
    { id: 'agent_005', name: 'Eve Adams', email: 'eve.a@demobank.com', role: 'Agent', status: 'Online', team: 'Billing & Fraud', avatarUrl: 'https://i.pravatar.cc/40?img=5', lastActive: '1m ago' },
    { id: 'agent_006', name: 'Frank White', email: 'frank.w@demobank.com', role: 'Agent', status: 'Offline', team: 'Technical Support', avatarUrl: 'https://i.pravatar.cc/40?img=6', lastActive: '1d ago' },
    { id: 'agent_007', name: 'James Bond', email: 'jbond@demobank.com', role: 'Agent', status: 'Online', team: 'VIP Support', avatarUrl: 'https://i.pravatar.cc/40?img=7', lastActive: '0m ago' },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'user123', name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234', registrationDate: '2022-01-15', lastLogin: '2024-07-20', totalTickets: 5, openTickets: 1, status: 'Active', notes: ['VIP customer, quick resolution needed.'] },
    { id: 'user456', name: 'Jane Smith', email: 'jane.s@example.com', phone: '555-5678', registrationDate: '2023-03-01', lastLogin: '2024-07-18', totalTickets: 2, openTickets: 0, status: 'Active', notes: [] },
    { id: 'corp_user_1', name: 'ACME Corp.', email: 'support@acme.com', phone: '555-9000', registrationDate: '2021-11-20', lastLogin: '2024-07-20', totalTickets: 12, openTickets: 3, status: 'VIP', notes: ['Key business partner.', 'Requires dedicated agent.'] },
    { id: 'user789', name: 'Robert Paulson', email: 'rob.p@example.com', phone: '555-1122', registrationDate: '2024-01-01', lastLogin: '2024-07-19', totalTickets: 1, openTickets: 1, status: 'Active', notes: [] },
    { id: 'corp_user_2', name: 'Globex Inc.', email: 'admin@globex.net', phone: '555-3344', registrationDate: '2022-06-01', lastLogin: '2024-07-17', totalTickets: 8, openTickets: 0, status: 'Active', notes: [] },
    { id: 'user_999', name: 'Alice Wonderland', email: 'alice.w@example.com', phone: '555-8888', registrationDate: '2023-10-10', lastLogin: '2024-07-20', totalTickets: 3, openTickets: 2, status: 'Active', notes: [] },
];

export const MOCK_CANNED_RESPONSES: CannedResponse[] = [
    { id: 'CR-001', title: 'Welcome & Thanks', content: 'Thank you for contacting Demo Bank Support! We have received your request and will get back to you shortly.', category: 'General', keywords: ['welcome', 'thanks', 'received'], createdBy: 'admin', lastModified: '2023-01-01' },
    { id: 'CR-002', title: 'Password Reset', content: 'To reset your password, please visit our password reset page at [LINK_TO_RESET_PAGE] or use the "Forgot Password" link on the login screen. Ensure you use a strong, unique password.', category: 'Account', keywords: ['password', 'reset', 'login'], createdBy: 'admin', lastModified: '2023-03-15' },
    { id: 'CR-003', title: 'Missing Transaction', content: 'We apologize for the inconvenience. Please provide the transaction ID, date, amount, and recipient\'s details so we can investigate further.', category: 'Billing', keywords: ['transaction', 'missing', 'charge'], createdBy: 'admin', lastModified: '2023-06-20' },
    { id: 'CR-004', title: 'Troubleshooting App Crash', content: 'Please try the following steps to resolve the app crashing issue: 1. Ensure your app is updated to the latest version. 2. Clear your app cache. 3. Reinstall the application. If the issue persists, please provide your device model and OS version.', category: 'Technical', keywords: ['app', 'crash', 'troubleshoot'], createdBy: 'admin', lastModified: '2023-09-10' },
    { id: 'CR-005', title: 'Fraudulent Activity Report', content: 'We take fraudulent activity very seriously. Please confirm if you have already reported this to your bank. We will initiate an investigation on our end. For immediate security, please change your password and review recent account activity.', category: 'Fraud', keywords: ['fraud', 'security', 'report'], createdBy: 'agent_004', lastModified: '2024-01-05' },
];

export const MOCK_SLA_RULES: SLARule[] = [
    {
        id: 'SLA-001', name: 'Urgent Priority SLA',
        conditions: [{ field: 'priority', operator: 'equals', value: 'Urgent' }],
        firstResponseTimeHours: 1, resolutionTimeHours: 4, priority: 'Urgent', isActive: true,
        description: 'All urgent tickets must be responded to within 1 hour and resolved within 4 hours.'
    },
    {
        id: 'SLA-002', name: 'High Priority SLA',
        conditions: [{ field: 'priority', operator: 'equals', value: 'High' }],
        firstResponseTimeHours: 2, resolutionTimeHours: 8, priority: 'High', isActive: true,
        description: 'High priority tickets must be responded to within 2 hours and resolved within 8 hours.'
    },
    {
        id: 'SLA-003', name: 'Billing Category SLA',
        conditions: [{ field: 'category', operator: 'equals', value: 'Billing' }],
        firstResponseTimeHours: 4, resolutionTimeHours: 24, priority: 'Medium', isActive: true,
        description: 'Billing related tickets have a slightly relaxed response time.'
    },
];

const NUM_MOCK_TICKETS = 150; // Significantly increased
export const MOCK_ALL_TICKETS: SupportTicket[] = Array.from({ length: NUM_MOCK_TICKETS }, (_, i) => generateMockTicket(i + 1));

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

// Re-export existing PriorityBadge
export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
    const colors = {
        'Low': 'bg-gray-500/20 text-gray-300', 'Medium': 'bg-cyan-500/20 text-cyan-300',
        'High': 'bg-yellow-500/20 text-yellow-300', 'Urgent': 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>{priority}</span>;
};

// New: Status Badge
export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
    const colors = {
        'Open': 'bg-blue-500/20 text-blue-300', 'Pending': 'bg-yellow-500/20 text-yellow-300',
        'Resolved': 'bg-green-500/20 text-green-300', 'Closed': 'bg-gray-500/20 text-gray-300',
        'On-Hold': 'bg-purple-500/20 text-purple-300', 'Reopened': 'bg-orange-500/20 text-orange-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
};

// New: Agent Selector
export const AgentSelector: React.FC<{
    selectedAgentId: string | null;
    onSelectAgent: (agentId: string | null) => void;
    agents: Agent[];
}> = ({ selectedAgentId, onSelectAgent, agents }) => {
    return (
        <select
            value={selectedAgentId || ''}
            onChange={(e) => onSelectAgent(e.target.value === '' ? null : e.target.value)}
            className="p-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
        >
            <option value="">Unassigned</option>
            {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name} ({agent.status})</option>
            ))}
        </select>
    );
};

// New: Ticket History / Messages Display
export const TicketMessagesDisplay: React.FC<{ messages: TicketMessage[]; agents: Agent[]; customers: Customer[]; }> = ({ messages, agents, customers }) => {
    const getSenderInfo = (senderId: string) => {
        const agent = agents.find(a => a.id === senderId);
        if (agent) return { name: agent.name, role: 'Agent', avatar: agent.avatarUrl, color: 'text-cyan-400' };
        const customer = customers.find(c => c.id === senderId);
        if (customer) return { name: customer.name, role: 'Customer', avatar: 'https://i.pravatar.cc/40?img=customer', color: 'text-yellow-400' };
        return { name: 'System', role: 'System', avatar: 'https://i.pravatar.cc/40?img=system', color: 'text-gray-400' };
    };

    return (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(msg => {
                const sender = getSenderInfo(msg.senderId);
                return (
                    <div key={msg.id} className={`p-3 rounded-lg ${msg.isInternal ? 'bg-gray-900 border-l-4 border-gray-600' : 'bg-gray-700/50'}`}>
                        <div className="flex items-center mb-1">
                            <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full mr-2" />
                            <strong className={`${sender.color} text-sm`}>{sender.name}</strong>
                            <span className="text-xs text-gray-500 ml-2">({sender.role})</span>
                            <span className="text-xs text-gray-500 ml-auto">{formatDate(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-300 ml-10">{msg.content}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                            <div className="ml-10 mt-2 text-xs text-gray-400">
                                Attachments: {msg.attachments.map(att => (
                                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline mr-2">{att.filename}</a>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// New: Attachments Viewer/Uploader (simplified)
export const AttachmentsSection: React.FC<{ attachments: Attachment[]; onUpload?: (files: FileList) => void; onDelete?: (id: string) => void; editable?: boolean; }> = ({ attachments, onUpload, onDelete, editable = false }) => {
    const { addNotification } = useNotifications();
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && onUpload) {
            addNotification(`Uploading ${e.target.files.length} files...`, 'info');
            onUpload(e.target.files);
            e.target.value = ''; // Clear input
        }
    };

    return (
        <Card title="Attachments">
            <div className="space-y-2">
                {attachments.length === 0 ? (
                    <p className="text-sm text-gray-400">No attachments.</p>
                ) : (
                    attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md text-sm">
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                {att.filename} ({att.sizeKB}KB)
                            </a>
                            {editable && onDelete && (
                                <button onClick={() => onDelete(att.id)} className="ml-4 text-red-400 hover:text-red-500">
                                    &times;
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
            {editable && onUpload && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Upload new attachments:</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                    />
                </div>
            )}
        </Card>
    );
};

// New: Customer Details Card
export const CustomerDetailCard: React.FC<{ customer: Customer; }> = ({ customer }) => {
    return (
        <Card title="Customer Details">
            <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Name:</strong> {customer.name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Phone:</strong> {customer.phone}</p>
                <p><strong>Status:</strong> <span className={`font-semibold ${customer.status === 'VIP' ? 'text-yellow-400' : 'text-gray-300'}`}>{customer.status}</span></p>
                <p><strong>Total Tickets:</strong> {customer.totalTickets}</p>
                <p><strong>Open Tickets:</strong> {customer.openTickets}</p>
                <p><strong>Registration Date:</strong> {formatDate(customer.registrationDate, { dateStyle: 'medium' })}</p>
                {customer.notes.length > 0 && (
                    <div>
                        <p className="font-semibold text-gray-400">Notes:</p>
                        <ul className="list-disc list-inside ml-2 text-xs">
                            {customer.notes.map((note, i) => <li key={i}>{note}</li>)}
                        </ul>
                    </div>
                )}
                {customer.associatedAccounts && customer.associatedAccounts.length > 0 && (
                    <div>
                        <p className="font-semibold text-gray-400">Associated Accounts:</p>
                        <ul className="list-disc list-inside ml-2 text-xs">
                            {customer.associatedAccounts.map((account, i) => <li key={i}>{account}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
};

// New: SLA Tracker Card
export const SLATrackerCard: React.FC<{ sla: SLA; }> = ({ sla }) => {
    const getSLAStatusClass = (status: SLA['status']) => {
        switch (status) {
            case 'Met': return 'text-green-400 bg-green-500/10';
            case 'Breached': return 'text-red-400 bg-red-500/10';
            case 'Warning': return 'text-yellow-400 bg-yellow-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    return (
        <Card title="SLA Status">
            <div className="space-y-3 text-sm">
                <p className="text-gray-300"><strong>Policy:</strong> {sla.name}</p>
                <p className="text-gray-300"><strong>Priority:</strong> <PriorityBadge priority={sla.priority} /></p>
                <p className="text-gray-300"><strong>First Response Target:</strong> {sla.firstResponseTimeHours} hours</p>
                <p className="text-gray-300"><strong>Resolution Target:</strong> {sla.resolutionTimeHours} hours</p>
                <div className={`p-2 rounded-md ${getSLAStatusClass(sla.status)} flex items-center justify-between`}>
                    <span className="font-semibold">Overall Status:</span>
                    <span className="font-bold">{sla.status} {sla.breached && '(Breached)'}</span>
                </div>
                {sla.status !== 'Breached' && (
                    <div className="text-xs text-gray-400">
                        <p>Time for First Response: <strong className="text-white">{sla.timeRemainingFirstResponse}</strong></p>
                        <p>Time for Resolution: <strong className="text-white">{sla.timeRemainingResolution}</strong></p>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Expanded TicketDetailModal
export const TicketDetailModal: React.FC<{ ticket: SupportTicket | null; onClose: () => void; onUpdateTicket: (updatedTicket: SupportTicket) => void; }> = (
    { ticket, onClose, onUpdateTicket }
) => {
    const [suggestedReply, setSuggestedReply] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [currentReply, setCurrentReply] = useState('');
    const [newInternalNote, setNewInternalNote] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [tempAttachments, setTempAttachments] = useState<File[]>([]);
    const [selectedCannedResponse, setSelectedCannedResponse] = useState<string>('');

    const { addNotification } = useNotifications();
    const { currentUser } = useAuth();

    // Find full customer and agent details
    const customer = useMemo(() => MOCK_CUSTOMERS.find(c => c.id === ticket?.userId), [ticket]);
    const agents = MOCK_AGENTS; // All available agents for assignment

    useEffect(() => {
        if (!ticket) {
            setSuggestedReply('');
            setCurrentReply('');
            setNewInternalNote('');
            setSelectedCannedResponse('');
            setTempAttachments([]);
        } else {
            setCurrentReply(`Hi ${customer?.name || 'there'}, \n\n`);
        }
    }, [ticket, customer]);

    if (!ticket) return null;

    const generateReply = async () => {
        setIsLoadingAI(true);
        setSuggestedReply('');
        try {
            if (!process.env.NEXT_PUBLIC_API_KEY_GOOGLE_GENAI) { // Corrected env variable name
                throw new Error("Google GenAI API Key is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY_GOOGLE_GENAI as string });
            const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }); // Using a more recent model
            const chat = model.startChat({
                history: ticket.messages.filter(m => !m.isInternal).map(m => ({
                    role: m.senderId === ticket.userId ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))
            });

            const prompt = `Based on the conversation and the last user message, act as an empathetic and professional customer support agent for Demo Bank. Generate a concise, helpful, and actionable reply. Keep it to 3-5 sentences. Start with a greeting to the customer. The ticket subject is "${ticket.subject}". The current status is "${ticket.status}". The customer's initial description was: "${ticket.description}".`;
            const result = await chat.sendMessage(prompt);
            const responseText = result.response.text();
            setSuggestedReply(responseText);
            addNotification('AI suggested reply generated!', 'success');
        } catch (err: any) {
            console.error("Error generating AI reply:", err);
            setSuggestedReply(`Error generating AI reply: ${err.message || 'Please check API key or network.'}`);
            addNotification(`Failed to generate AI reply: ${err.message || 'Unknown error'}`, 'error');
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleCannedResponseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setSelectedCannedResponse(selectedId);
        if (selectedId) {
            const cr = MOCK_CANNED_RESPONSES.find(r => r.id === selectedId);
            if (cr) {
                setCurrentReply(prev => (prev.endsWith('\n\n') ? prev : prev + '\n\n') + cr.content + '\n\n');
            }
        }
    };

    const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentReply(e.target.value);
    };

    const handleInternalNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewInternalNote(e.target.value);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as TicketStatus;
        onUpdateTicket({ ...ticket, status: newStatus });
        addNotification(`Ticket status updated to ${newStatus}.`, 'info');
    };

    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPriority = e.target.value as TicketPriority;
        onUpdateTicket({ ...ticket, priority: newPriority });
        addNotification(`Ticket priority updated to ${newPriority}.`, 'info');
    };

    const handleAgentAssign = (agentId: string | null) => {
        const agent = agents.find(a => a.id === agentId);
        onUpdateTicket({ ...ticket, assignedAgentId: agentId, assignedAgentName: agent?.name || null });
        addNotification(`Ticket assigned to ${agent?.name || 'Unassigned'}.`, 'info');
    };

    const handleAddTempAttachments = (files: FileList) => {
        setTempAttachments(prev => [...prev, ...Array.from(files)]);
    };

    const handleRemoveTempAttachment = (index: number) => {
        setTempAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendReply = async () => {
        if (!currentReply.trim() && tempAttachments.length === 0) {
            addNotification('Reply content or attachments are required to send a reply.', 'warning');
            return;
        }
        setIsSendingReply(true);
        try {
            await mockApiCall({}, 1000); // Simulate API call for sending reply and updating ticket

            const newAttachments: Attachment[] = tempAttachments.map(file => ({
                id: generateUUID(),
                filename: file.name,
                url: URL.createObjectURL(file), // Using blob URL for display, in real app would be S3 URL etc.
                type: file.type.startsWith('image/') ? 'image' : (file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other'),
                uploadedBy: currentUser?.name || 'Agent',
                uploadDate: new Date().toISOString(),
                sizeKB: Math.round(file.size / 1024),
            }));

            const newPublicMessage: TicketMessage = {
                id: generateUUID(),
                senderId: currentUser?.id || 'agent_system',
                senderName: currentUser?.name || 'Support Agent',
                timestamp: new Date().toISOString(),
                content: currentReply,
                isInternal: false,
                attachments: newAttachments,
            };

            const updatedTicket: SupportTicket = {
                ...ticket,
                messages: [...ticket.messages, newPublicMessage],
                attachments: [...ticket.attachments, ...newAttachments], // Add to global ticket attachments
                lastUpdate: new Date().toISOString(),
                status: ticket.status === 'Open' ? 'Pending' : ticket.status, // Often, an agent reply makes it 'Pending'
            };

            onUpdateTicket(updatedTicket);
            setCurrentReply('');
            setTempAttachments([]);
            addNotification('Reply sent and ticket updated!', 'success');
        } catch (error) {
            addNotification('Failed to send reply.', 'error');
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleAddInternalNote = async () => {
        if (!newInternalNote.trim()) {
            addNotification('Internal note content is required.', 'warning');
            return;
        }
        setIsSendingReply(true); // Re-using this state for any submit action
        try {
            await mockApiCall({}, 500);

            const note: TicketMessage = {
                id: generateUUID(),
                senderId: currentUser?.id || 'agent_system',
                senderName: currentUser?.name || 'Support Agent',
                timestamp: new Date().toISOString(),
                content: newInternalNote,
                isInternal: true,
            };

            const updatedTicket = {
                ...ticket,
                internalNotes: [...ticket.internalNotes, note],
                lastUpdate: new Date().toISOString(),
            };
            onUpdateTicket(updatedTicket);
            setNewInternalNote('');
            addNotification('Internal note added.', 'success');
        } catch (error) {
            addNotification('Failed to add internal note.', 'error');
        } finally {
            setIsSendingReply(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full border border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{ticket.subject} (Ticket {ticket.id})</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 custom-scrollbar">
                    <div className="lg:col-span-3 xl:col-span-3 space-y-6">
                        <Card title="Ticket Overview">
                            <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg mb-4">{ticket.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                                <p><strong>User:</strong> {ticket.userName}</p>
                                <p><strong>Category:</strong> <span className="text-cyan-400">{ticket.category}</span></p>
                                <p><strong>Created:</strong> {formatDate(ticket.createdDate)}</p>
                                <p><strong>Last Update:</strong> {formatDate(ticket.lastUpdate)}</p>
                                <p><strong>Channel:</strong> {ticket.channel}</p>
                                <p><strong>Sentiment:</strong> <span className={`font-semibold ${ticket.sentiment === 'Negative' ? 'text-red-400' : ticket.sentiment === 'Positive' ? 'text-green-400' : 'text-gray-400'}`}>{ticket.sentiment}</span></p>
                                {ticket.tags.length > 0 && <p className="col-span-2"><strong>Tags:</strong> {ticket.tags.map(tag => <span key={tag} className="inline-block bg-cyan-600/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full mr-2">{tag}</span>)}</p>}
                                {ticket.linkedTickets && ticket.linkedTickets.length > 0 && <p className="col-span-2"><strong>Linked Tickets:</strong> {ticket.linkedTickets.map(lt => <a key={lt} href="#" className="text-cyan-400 hover:underline mr-2">{lt}</a>)}</p>}
                                {ticket.customFields && Object.keys(ticket.customFields).length > 0 && (
                                    <div className="col-span-2">
                                        <p className="font-semibold text-gray-400 mb-1">Custom Fields:</p>
                                        <ul className="list-disc list-inside ml-2 text-xs">
                                            {Object.entries(ticket.customFields).map(([key, value]) => (
                                                <li key={key}><strong className="text-gray-500">{key}:</strong> {value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card title="Communication History">
                            <TicketMessagesDisplay messages={ticket.messages} agents={MOCK_AGENTS} customers={MOCK_CUSTOMERS} />
                        </Card>

                        <Card title="Internal Agent Notes">
                            <TicketMessagesDisplay messages={ticket.internalNotes} agents={MOCK_AGENTS} customers={MOCK_CUSTOMERS} />
                            <div className="mt-4 border-t border-gray-700 pt-4">
                                <textarea
                                    className="w-full min-h-[6rem] p-3 text-sm bg-gray-900/50 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="Add an internal note..."
                                    value={newInternalNote}
                                    onChange={handleInternalNoteChange}
                                ></textarea>
                                <button
                                    onClick={handleAddInternalNote}
                                    disabled={isSendingReply || !newInternalNote.trim()}
                                    className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSendingReply ? 'Adding Note...' : 'Add Internal Note'}
                                </button>
                            </div>
                        </Card>

                        <AttachmentsSection attachments={ticket.attachments} />

                    </div>

                    <div className="lg:col-span-1 xl:col-span-2 space-y-6">
                        <Card title="Ticket Actions & Details">
                            <div className="space-y-4 text-sm">
                                <p>
                                    <strong className="text-gray-400">Status:</strong>
                                    <select
                                        value={ticket.status}
                                        onChange={handleStatusChange}
                                        className="ml-2 p-1 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        {(['Open', 'Pending', 'Resolved', 'Closed', 'On-Hold', 'Reopened'] as TicketStatus[]).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </p>
                                <p>
                                    <strong className="text-gray-400">Priority:</strong>
                                    <select
                                        value={ticket.priority}
                                        onChange={handlePriorityChange}
                                        className="ml-2 p-1 bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        {(['Low', 'Medium', 'High', 'Urgent'] as TicketPriority[]).map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </p>
                                <p>
                                    <strong className="text-gray-400">Agent:</strong>
                                    <AgentSelector
                                        selectedAgentId={ticket.assignedAgentId}
                                        onSelectAgent={handleAgentAssign}
                                        agents={MOCK_AGENTS}
                                    />
                                </p>
                            </div>
                        </Card>

                        {customer && <CustomerDetailCard customer={customer} />}

                        <SLATrackerCard sla={ticket.sla} />

                        <Card title="Agent Reply">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <label htmlFor="canned-response-select" className="text-sm text-gray-400">Canned Response:</label>
                                    <select
                                        id="canned-response-select"
                                        value={selectedCannedResponse}
                                        onChange={handleCannedResponseSelect}
                                        className="flex-grow p-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        <option value="">Select a canned response</option>
                                        {MOCK_CANNED_RESPONSES.map(cr => (
                                            <option key={cr.id} value={cr.id}>{cr.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <textarea
                                    value={currentReply}
                                    onChange={handleReplyChange}
                                    className="w-full min-h-[10rem] p-3 text-sm bg-gray-900/50 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="Type your reply here..."
                                ></textarea>

                                <div className="border-t border-gray-700 pt-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Add Files to Reply:</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleAddTempAttachments(e.target.files!)}
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                    />
                                    {tempAttachments.length > 0 && (
                                        <div className="mt-2 space-y-1 text-xs text-gray-400">
                                            <p>Selected for upload:</p>
                                            {tempAttachments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-700/50 p-1 rounded-md">
                                                    <span>{file.name} ({Math.round(file.size / 1024)}KB)</span>
                                                    <button onClick={() => handleRemoveTempAttachment(index)} className="ml-2 text-red-400 hover:text-red-500">&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <h4 className="font-semibold text-gray-200 mt-6 mb-2">AI Suggested Reply</h4>
                                <div className="min-h-[10rem] bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                    {isLoadingAI && <p className="text-sm text-gray-400">Generating reply...</p>}
                                    {suggestedReply && <textarea value={suggestedReply} readOnly className="w-full h-40 text-sm bg-transparent border-none text-gray-300 focus:ring-0 resize-none"></textarea>}
                                    {!suggestedReply && !isLoadingAI && <button onClick={generateReply} className="text-sm text-cyan-400 hover:underline">Generate AI Suggested Reply</button>}
                                    {suggestedReply && !isLoadingAI && (
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <button onClick={() => setCurrentReply(prev => (prev.endsWith('\n\n') ? prev : prev + '\n\n') + suggestedReply + '\n\n')} className="text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md">
                                                Insert into Reply
                                            </button>
                                            <button onClick={() => setSuggestedReply('')} className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md">
                                                Clear AI Suggestion
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
                <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end space-x-3">
                    <button
                        onClick={handleSendReply}
                        disabled={isSendingReply || (!currentReply.trim() && tempAttachments.length === 0)}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSendingReply ? 'Sending...' : 'Send Reply & Update'}
                    </button>
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white text-base rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// NEW: DASHBOARD WIDGETS
// ================================================================================================

export const AgentPerformanceWidget: React.FC<{ agent: Agent }> = ({ agent }) => {
    const agentTickets = useMemo(() => MOCK_ALL_TICKETS.filter(t => t.assignedAgentId === agent.id), [agent]);
    const resolvedTickets = agentTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    const openTickets = agentTickets.filter(t => t.status === 'Open' || t.status === 'Reopened').length;
    const avgResolutionTimeHours = agentTickets.length > 0
        ? agentTickets.reduce((sum, t) => {
            if (t.createdDate && (t.status === 'Resolved' || t.status === 'Closed')) {
                const created = new Date(t.createdDate).getTime();
                const resolved = new Date(t.lastUpdate).getTime();
                return sum + (resolved - created) / (1000 * 60 * 60);
            }
            return sum;
        }, 0) / resolvedTickets
        : 0;

    return (
        <Card className="text-sm">
            <div className="flex items-center mb-3">
                <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <h4 className="font-semibold text-white">{agent.name}</h4>
                    <p className="text-xs text-gray-400">{agent.role} - {agent.team}</p>
                </div>
                <span className={`ml-auto px-2 py-1 text-xs rounded-full ${agent.status === 'Online' ? 'bg-green-500/20 text-green-300' : agent.status === 'Busy' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                    {agent.status}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-gray-300">
                <div>Open: <span className="font-semibold text-red-400">{openTickets}</span></div>
                <div>Resolved: <span className="font-semibold text-green-400">{resolvedTickets}</span></div>
                <div className="col-span-2">Avg. Resolution: <span className="font-semibold">{avgResolutionTimeHours > 0 ? `${avgResolutionTimeHours.toFixed(1)}h` : 'N/A'}</span></div>
                <div className="col-span-2 text-xs text-gray-500">Last Active: {agent.lastActive}</div>
            </div>
        </Card>
    );
};

export const RecentActivitiesWidget: React.FC = () => {
    const recentEvents = useMemo(() => {
        // Mock recent events from all tickets
        const events: { timestamp: string; description: string; type: 'ticket' | 'agent' | 'sla'; icon: string; }[] = [];
        MOCK_ALL_TICKETS.forEach(ticket => {
            events.push({
                timestamp: ticket.lastUpdate,
                description: `Ticket ${ticket.id} (${ticket.subject}) updated to ${ticket.status}.`,
                type: 'ticket',
                icon: '📝'
            });
            if (ticket.status === 'Open' && Math.random() < 0.3) { // Simulate some SLA warnings
                events.push({
                    timestamp: new Date(new Date(ticket.createdDate).getTime() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour after creation
                    description: `SLA warning for Ticket ${ticket.id} (First Response due soon).`,
                    type: 'sla',
                    icon: '⚠️'
                });
            }
        });
        MOCK_AGENTS.forEach(agent => {
            if (agent.status === 'Online' && agent.lastActive === '0m ago') {
                events.push({
                    timestamp: new Date().toISOString(),
                    description: `${agent.name} is now online.`,
                    type: 'agent',
                    icon: '🟢'
                });
            }
        });

        return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    }, []);

    return (
        <Card title="Recent Activities">
            <ul className="space-y-3">
                {recentEvents.map((event, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-300">
                        <span className="mr-2 text-lg flex-shrink-0">{event.icon}</span>
                        <div>
                            <p>{event.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(event.timestamp, { dateStyle: 'short', timeStyle: 'short' })}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export const TicketTrendChartWidget: React.FC = () => {
    // This would typically involve a charting library like Chart.js or Recharts
    // For this exercise, we'll use a placeholder div.
    const chartData = useMemo(() => {
        const data: { [date: string]: { created: number; resolved: number; } } = {};
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            data[dateStr] = { created: 0, resolved: 0 };
        }

        MOCK_ALL_TICKETS.forEach(ticket => {
            const createdDate = new Date(ticket.createdDate).toISOString().split('T')[0];
            if (data[createdDate]) {
                data[createdDate].created++;
            }
            if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
                const resolvedDate = new Date(ticket.lastUpdate).toISOString().split('T')[0];
                if (data[resolvedDate]) {
                    data[resolvedDate].resolved++;
                }
            }
        });

        // Simple mock for chart visualization
        return Object.entries(data).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
    }, []);

    return (
        <Card title="Ticket Volume Trend (Last 30 Days)">
            <div className="h-48 bg-gray-900 rounded-md flex items-center justify-center text-gray-500 text-sm">
                [Placeholder for a Chart.js/Recharts component]
                <p>Showing {chartData.length} days of data.</p>
            </div>
            <div className="mt-4 text-xs text-gray-400">
                <p>New Tickets: <span className="text-cyan-400">{chartData.reduce((sum, [, d]) => sum + d.created, 0)}</span></p>
                <p>Resolved Tickets: <span className="text-green-400">{chartData.reduce((sum, [, d]) => sum + d.resolved, 0)}</span></p>
            </div>
        </Card>
    );
};

// ================================================================================================
// NEW: NAVIGATION COMPONENTS
// ================================================================================================

export type MainView = 'Dashboard' | 'Tickets' | 'Agents' | 'Customers' | 'CannedResponses' | 'SLARules' | 'Reports' | 'Settings' | 'KnowledgeBase';

interface NavItemProps {
    label: string;
    icon: string;
    view: MainView;
    currentView: MainView;
    onClick: (view: MainView) => void;
}

export const SidebarNavItem: React.FC<NavItemProps> = ({ label, icon, view, currentView, onClick }) => {
    const isActive = currentView === view;
    return (
        <button
            onClick={() => onClick(view)}
            className={`flex items-center p-3 rounded-lg w-full text-left transition-colors duration-200
                        ${isActive ? 'bg-cyan-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
        >
            <span className="text-xl mr-3">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
};

export const MainSidebar: React.FC<{ currentView: MainView; onSelectView: (view: MainView) => void; }> = ({ currentView, onSelectView }) => {
    return (
        <div className="w-64 bg-gray-800 p-4 border-r border-gray-700 flex flex-col shadow-lg">
            <div className="flex items-center mb-6">
                <span className="text-3xl mr-2">🚀</span>
                <h1 className="text-xl font-bold text-white">MegaDesk</h1>
            </div>
            <nav className="space-y-2">
                <SidebarNavItem label="Dashboard" icon="📊" view="Dashboard" currentView={currentView} onClick={onSelectView} />
                <SidebarNavItem label="Tickets" icon="🎫" view="Tickets" currentView={currentView} onClick={onSelectView} />
                <SidebarNavItem label="Agents" icon="🧑‍💻" view="Agents" currentView={currentView} onClick={onSelectView} />
                <SidebarNavItem label="Customers" icon="👤" view="Customers" currentView={currentView} onClick={onSelectView} />
                <SidebarNavItem label="Canned Responses" icon="💬" view="CannedResponses" currentView={currentView} onClick={onSelectView} />
                <SidebarNavItem label="SLA Rules" icon="⏱️" view="SLARules" currentView={currentView} onClick={onSelectView} />
                <SidebarNavItem label="Reports" icon="📈" view="Reports" currentView={currentView} onClick={onSelectView} />
                <SidebarNavItem label="Knowledge Base" icon="📚" view="KnowledgeBase" currentView={currentView} onClick={onSelectView} />
                <div className="border-t border-gray-700 my-4 pt-4"></div>
                <SidebarNavItem label="Settings" icon="⚙️" view="Settings" currentView={currentView} onClick={onSelectView} />
            </nav>
            <div className="mt-auto pt-4 text-xs text-gray-500">
                <p>&copy; 2024 Demo Bank. All rights reserved.</p>
                <p>Version 1.5.0-beta</p>
            </div>
        </div>
    );
};

// ================================================================================================
// NEW: MANAGEMENT VIEWS
// ================================================================================================

export const AgentsManagementView: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'Online' | 'Offline' | 'Busy'>('all');
    const { addNotification } = useNotifications();

    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.team.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [agents, searchTerm, filterStatus]);

    const handleUpdateAgentStatus = useCallback(async (agentId: string, newStatus: Agent['status']) => {
        const updatedAgents = agents.map(agent =>
            agent.id === agentId ? { ...agent, status: newStatus, lastActive: new Date().toLocaleTimeString('en-US') } : agent
        );
        // Simulate API call
        await mockApiCall(updatedAgents, 300);
        setAgents(updatedAgents);
        addNotification(`Agent ${agents.find(a => a.id === agentId)?.name} status updated to ${newStatus}.`, 'success');
    }, [agents, addNotification]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Agent Management</h2>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search agents..."
                        className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 w-64 focus:ring-cyan-500 focus:border-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex space-x-2">
                        {(['all', 'Online', 'Offline', 'Busy'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 text-sm rounded-md ${filterStatus === status ? 'bg-cyan-600' : 'text-gray-300 bg-gray-900/50'}`}
                            >
                                {status === 'all' ? 'All Statuses' : status}
                            </button>
                        ))}
                    </div>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">Add New Agent</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">Agent Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Team</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Last Active</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgents.map(agent => (
                                <tr key={agent.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white flex items-center">
                                        <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full mr-3" />
                                        {agent.name}
                                    </td>
                                    <td className="px-6 py-4">{agent.email}</td>
                                    <td className="px-6 py-4">{agent.role}</td>
                                    <td className="px-6 py-4">{agent.team}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${agent.status === 'Online' ? 'bg-green-500/20 text-green-300' : agent.status === 'Busy' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{agent.lastActive}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button className="text-cyan-400 hover:text-cyan-300 text-sm">Edit</button>
                                            <select
                                                value={agent.status}
                                                onChange={(e) => handleUpdateAgentStatus(agent.id, e.target.value as Agent['status'])}
                                                className="p-1 text-xs bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                                            >
                                                <option value="Online">Online</option>
                                                <option value="Offline">Offline</option>
                                                <option value="Busy">Busy</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const CustomersManagementView: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive' | 'VIP'>('all');
    const { addNotification } = useNotifications();

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, filterStatus]);

    const handleUpdateCustomer = useCallback(async (updatedCustomer: Customer) => {
        const updatedList = customers.map(cust => cust.id === updatedCustomer.id ? updatedCustomer : cust);
        await mockApiCall(updatedList, 300);
        setCustomers(updatedList);
        addNotification(`Customer ${updatedCustomer.name} updated.`, 'success');
    }, [customers, addNotification]);

    // Simple inline editor for status
    const CustomerRow: React.FC<{ customer: Customer; onUpdate: (c: Customer) => void }> = ({ customer, onUpdate }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [currentStatus, setCurrentStatus] = useState(customer.status);

        const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newStatus = e.target.value as Customer['status'];
            setCurrentStatus(newStatus);
            await onUpdate({ ...customer, status: newStatus });
            setIsEditing(false); // Optionally close after selection
        };

        return (
            <tr key={customer.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                <td className="px-6 py-4">{customer.email}</td>
                <td className="px-6 py-4">{customer.phone}</td>
                <td className="px-6 py-4">{customer.totalTickets} / {customer.openTickets}</td>
                <td className="px-6 py-4">
                    {isEditing ? (
                        <select value={currentStatus} onChange={handleStatusChange} onBlur={() => setIsEditing(false)} className="p-1 text-xs bg-gray-700 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="VIP">VIP</option>
                        </select>
                    ) : (
                        <span onClick={() => setIsEditing(true)} className={`cursor-pointer px-2 py-1 text-xs rounded-full ${customer.status === 'VIP' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                            {customer.status}
                        </span>
                    )}
                </td>
                <td className="px-6 py-4">
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm mr-2">View History</button>
                    <button className="text-purple-400 hover:text-purple-300 text-sm">Edit Notes</button>
                </td>
            </tr>
        );
    };


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Customer Management</h2>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 w-64 focus:ring-cyan-500 focus:border-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex space-x-2">
                        {(['all', 'Active', 'Inactive', 'VIP'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1 text-sm rounded-md ${filterStatus === status ? 'bg-cyan-600' : 'text-gray-300 bg-gray-900/50'}`}
                            >
                                {status === 'all' ? 'All Statuses' : status}
                            </button>
                        ))}
                    </div>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">Add New Customer</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">Tickets (Total/Open)</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <CustomerRow key={customer.id} customer={customer} onUpdate={handleUpdateCustomer} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const CannedResponsesManagementView: React.FC = () => {
    const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>(MOCK_CANNED_RESPONSES);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
    const { addNotification } = useNotifications();

    const filteredResponses = useMemo(() => {
        return cannedResponses.filter(response =>
            response.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            response.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            response.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [cannedResponses, searchTerm]);

    const handleSaveResponse = async (response: CannedResponse) => {
        if (editingResponse) {
            const updatedResponses = cannedResponses.map(cr => cr.id === response.id ? response : cr);
            await mockApiCall(updatedResponses, 300);
            setCannedResponses(updatedResponses);
            addNotification(`Canned response "${response.title}" updated.`, 'success');
        } else {
            const newResponse = { ...response, id: `CR-${generateUUID().substring(0, 4).toUpperCase()}`, createdBy: 'agent_007', lastModified: new Date().toISOString() };
            await mockApiCall([...cannedResponses, newResponse], 300);
            setCannedResponses(prev => [...prev, newResponse]);
            addNotification(`Canned response "${newResponse.title}" added.`, 'success');
        }
        setIsModalOpen(false);
        setEditingResponse(null);
    };

    const handleDeleteResponse = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this canned response?')) {
            const updatedResponses = cannedResponses.filter(cr => cr.id !== id);
            await mockApiCall(updatedResponses, 300);
            setCannedResponses(updatedResponses);
            addNotification('Canned response deleted.', 'success');
        }
    };

    const CannedResponseModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        response: CannedResponse | null;
        onSave: (response: CannedResponse) => void;
    }> = ({ isOpen, onClose, response, onSave }) => {
        const [formData, setFormData] = useState<CannedResponse>(response || {
            id: '', title: '', content: '', category: 'General', keywords: [], createdBy: '', lastModified: ''
        });

        useEffect(() => {
            setFormData(response || {
                id: '', title: '', content: '', category: 'General', keywords: [], createdBy: '', lastModified: ''
            });
        }, [response]);

        if (!isOpen) return null;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            if (name === 'keywords') {
                setFormData({ ...formData, keywords: value.split(',').map(k => k.trim()).filter(k => k) });
            } else {
                setFormData({ ...formData, [name]: value });
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">{response ? 'Edit Canned Response' : 'Create New Canned Response'}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                                <textarea name="content" value={formData.content} onChange={handleChange} required rows={6} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
                                    {(['General', 'Account', 'Billing', 'Technical', 'Fraud'] as TicketCategory[]).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Keywords (comma-separated)</label>
                                <input type="text" name="keywords" value={formData.keywords.join(', ')} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">Save Response</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Canned Responses Management</h2>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search responses..."
                        className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 w-64 focus:ring-cyan-500 focus:border-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={() => { setEditingResponse(null); setIsModalOpen(true); }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                    >
                        Add New Response
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Content Snippet</th>
                                <th className="px-6 py-3">Keywords</th>
                                <th className="px-6 py-3">Last Modified</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResponses.map(response => (
                                <tr key={response.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{response.title}</td>
                                    <td className="px-6 py-4">{response.category}</td>
                                    <td className="px-6 py-4 text-xs max-w-xs truncate">{response.content.substring(0, 100)}...</td>
                                    <td className="px-6 py-4 text-xs">{response.keywords.join(', ')}</td>
                                    <td className="px-6 py-4 text-xs">{formatDate(response.lastModified, { dateStyle: 'short' })}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => { setEditingResponse(response); setIsModalOpen(true); }}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteResponse(response.id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <CannedResponseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                response={editingResponse}
                onSave={handleSaveResponse}
            />
        </div>
    );
};

export const SLARulesManagementView: React.FC = () => {
    const [slaRules, setSlaRules] = useState<SLARule[]>(MOCK_SLA_RULES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<SLARule | null>(null);
    const { addNotification } = useNotifications();

    const handleSaveRule = async (rule: SLARule) => {
        if (editingRule) {
            const updatedRules = slaRules.map(sr => sr.id === rule.id ? rule : sr);
            await mockApiCall(updatedRules, 300);
            setSlaRules(updatedRules);
            addNotification(`SLA Rule "${rule.name}" updated.`, 'success');
        } else {
            const newRule = { ...rule, id: `SLA-${generateUUID().substring(0, 4).toUpperCase()}` };
            await mockApiCall([...slaRules, newRule], 300);
            setSlaRules(prev => [...prev, newRule]);
            addNotification(`SLA Rule "${newRule.name}" added.`, 'success');
        }
        setIsModalOpen(false);
        setEditingRule(null);
    };

    const handleDeleteRule = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this SLA rule?')) {
            const updatedRules = slaRules.filter(sr => sr.id !== id);
            await mockApiCall(updatedRules, 300);
            setSlaRules(updatedRules);
            addNotification('SLA rule deleted.', 'success');
        }
    };

    const SLARuleModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        rule: SLARule | null;
        onSave: (rule: SLARule) => void;
    }> = ({ isOpen, onClose, rule, onSave }) => {
        const [formData, setFormData] = useState<SLARule>(rule || {
            id: '', name: '', conditions: [], firstResponseTimeHours: 1, resolutionTimeHours: 4, priority: 'Medium', isActive: true, description: ''
        });

        useEffect(() => {
            setFormData(rule || {
                id: '', name: '', conditions: [], firstResponseTimeHours: 1, resolutionTimeHours: 4, priority: 'Medium', isActive: true, description: ''
            });
        }, [rule]);

        if (!isOpen) return null;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value, type, checked } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
            }));
        };

        const handleConditionChange = (index: number, field: string, value: string | number | boolean) => {
            const newConditions = [...formData.conditions];
            newConditions[index] = { ...newConditions[index], [field]: value };
            setFormData({ ...formData, conditions: newConditions });
        };

        const addCondition = () => {
            setFormData(prev => ({
                ...prev,
                conditions: [...prev.conditions, { field: 'status', operator: 'equals', value: 'Open' }]
            }));
        };

        const removeCondition = (index: number) => {
            setFormData(prev => ({
                ...prev,
                conditions: prev.conditions.filter((_, i) => i !== index)
            }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        const availableTicketFields: { label: string; value: keyof SupportTicket; type: 'string' | 'number' | 'boolean' | 'enum'; enumOptions?: string[]; }[] = [
            { label: 'Status', value: 'status', type: 'enum', enumOptions: ['Open', 'Pending', 'Resolved', 'Closed', 'On-Hold', 'Reopened'] },
            { label: 'Priority', value: 'priority', type: 'enum', enumOptions: ['Low', 'Medium', 'High', 'Urgent'] },
            { label: 'Category', value: 'category', type: 'enum', enumOptions: ['Billing', 'Technical', 'Account', 'Feature Request', 'General Inquiry', 'Fraud'] },
            { label: 'Sentiment', value: 'sentiment', type: 'enum', enumOptions: ['Positive', 'Neutral', 'Negative', 'Mixed'] },
            // Add more fields as needed for a real application
        ];

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">{rule ? 'Edit SLA Rule' : 'Create New SLA Rule'}</h3>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Rule Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">First Response Time (hours)</label>
                                    <input type="number" name="firstResponseTimeHours" value={formData.firstResponseTimeHours} onChange={handleChange} required min="1" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Resolution Time (hours)</label>
                                    <input type="number" name="resolutionTimeHours" value={formData.resolutionTimeHours} onChange={handleChange} required min="1" className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Default Priority for this SLA</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
                                    {(['Low', 'Medium', 'High', 'Urgent'] as TicketPriority[]).map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded" />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
                            </div>

                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <h4 className="text-md font-semibold text-gray-200 mb-2">Conditions</h4>
                                {formData.conditions.map((condition, index) => {
                                    const fieldMeta = availableTicketFields.find(f => f.value === condition.field);
                                    return (
                                        <div key={index} className="flex items-center space-x-2 mb-2 p-2 bg-gray-900/50 rounded-md">
                                            <select
                                                value={condition.field}
                                                onChange={(e) => handleConditionChange(index, 'field', e.target.value as keyof SupportTicket)}
                                                className="p-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                                            >
                                                {availableTicketFields.map(field => (
                                                    <option key={field.value} value={field.value}>{field.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={condition.operator}
                                                onChange={(e) => handleConditionChange(index, 'operator', e.target.value as any)}
                                                className="p-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                                            >
                                                <option value="equals">equals</option>
                                                <option value="contains">contains</option>
                                                {/* Add more operators as relevant to field type */}
                                            </select>
                                            {fieldMeta?.type === 'enum' ? (
                                                <select
                                                    value={condition.value as string}
                                                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                                    className="p-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                                                >
                                                    {fieldMeta.enumOptions?.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={fieldMeta?.type === 'number' ? 'number' : 'text'}
                                                    value={condition.value as string}
                                                    onChange={(e) => handleConditionChange(index, 'value', fieldMeta?.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                                    className="flex-grow p-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                                                />
                                            )}
                                            <button type="button" onClick={() => removeCondition(index)} className="text-red-400 hover:text-red-300">
                                                &times;
                                            </button>
                                        </div>
                                    );
                                })}
                                <button type="button" onClick={addCondition} className="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg">
                                    Add Condition
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">Save Rule</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">SLA Rules Management</h2>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Defined SLA Rules</h3>
                    <button
                        onClick={() => { setEditingRule(null); setIsModalOpen(true); }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                    >
                        Add New Rule
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">Rule Name</th>
                                <th className="px-6 py-3">Conditions</th>
                                <th className="px-6 py-3">Response Time</th>
                                <th className="px-6 py-3">Resolution Time</th>
                                <th className="px-6 py-3">Priority</th>
                                <th className="px-6 py-3">Active</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slaRules.map(rule => (
                                <tr key={rule.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{rule.name}</td>
                                    <td className="px-6 py-4 text-xs">
                                        {rule.conditions.map((cond, i) => (
                                            <span key={i} className="block text-gray-500">{cond.field} {cond.operator} {String(cond.value)}</span>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4">{rule.firstResponseTimeHours}h</td>
                                    <td className="px-6 py-4">{rule.resolutionTimeHours}h</td>
                                    <td className="px-6 py-4"><PriorityBadge priority={rule.priority} /></td>
                                    <td className="px-6 py-4">{rule.isActive ? 'Yes' : 'No'}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => { setEditingRule(rule); setIsModalOpen(true); }}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <SLARuleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                rule={editingRule}
                onSave={handleSaveRule}
            />
        </div>
    );
};

export const ReportsView: React.FC = () => {
    const { addNotification } = useNotifications();
    const [reportType, setReportType] = useState('ticketVolume');
    const [timeRange, setTimeRange] = useState('last30days');
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null); // Placeholder for actual report data structure

    const generateReport = useCallback(async () => {
        setLoadingReport(true);
        setReportData(null);
        try {
            // Simulate fetching complex report data
            await mockApiCall({}, 1500);

            let data: any = {};
            if (reportType === 'ticketVolume') {
                const dates: string[] = [];
                const created: number[] = [];
                const resolved: number[] = [];
                const today = new Date();
                for (let i = 0; i < 30; i++) {
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    dates.unshift(d.toISOString().split('T')[0]);
                    created.unshift(getRandomInt(5, 20));
                    resolved.unshift(getRandomInt(3, 15));
                }
                data = {
                    title: `Ticket Volume Report (${timeRange})`,
                    chartType: 'line',
                    labels: dates,
                    datasets: [
                        { label: 'Tickets Created', data: created, borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.2)' },
                        { label: 'Tickets Resolved', data: resolved, borderColor: '#60a5fa', backgroundColor: 'rgba(96, 165, 250, 0.2)' }
                    ],
                    summary: `Total Created: ${created.reduce((a, b) => a + b, 0)}, Total Resolved: ${resolved.reduce((a, b) => a + b, 0)}`
                };
            } else if (reportType === 'agentPerformance') {
                const agents = MOCK_AGENTS.filter(a => a.role === 'Agent');
                const agentNames = agents.map(a => a.name);
                const resolvedCounts = agents.map(() => getRandomInt(20, 100));
                const avgResponseTimes = agents.map(() => getRandomInt(1, 10) + Math.random().toFixed(1));
                data = {
                    title: `Agent Performance Report (${timeRange})`,
                    chartType: 'bar',
                    labels: agentNames,
                    datasets: [
                        { label: 'Tickets Resolved', data: resolvedCounts, backgroundColor: '#818cf8' },
                        { label: 'Avg. Response Time (h)', data: avgResponseTimes, backgroundColor: '#fbbf24' }
                    ],
                    summary: `Total Agents: ${agents.length}, Avg. Resolved per Agent: ${(resolvedCounts.reduce((a, b) => a + b, 0) / agents.length).toFixed(1)}`
                };
            }
            setReportData(data);
            addNotification('Report generated successfully!', 'success');
        } catch (error) {
            addNotification('Failed to generate report.', 'error');
        } finally {
            setLoadingReport(false);
        }
    }, [reportType, timeRange, addNotification]);

    useEffect(() => {
        generateReport(); // Generate initial report on load
    }, [generateReport]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Reports & Analytics</h2>
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-3">
                        <label htmlFor="reportType" className="text-gray-300 text-sm">Report Type:</label>
                        <select
                            id="reportType"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="ticketVolume">Ticket Volume</option>
                            <option value="agentPerformance">Agent Performance</option>
                            <option value="slaCompliance">SLA Compliance</option>
                            <option value="customerSatisfaction">Customer Satisfaction</option>
                            {/* Add more report types */}
                        </select>
                    </div>
                    <div className="flex items-center space-x-3">
                        <label htmlFor="timeRange" className="text-gray-300 text-sm">Time Range:</label>
                        <select
                            id="timeRange"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="today">Today</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={loadingReport}
                        className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingReport ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>

                <div className="border-t border-gray-700 pt-6 mt-6">
                    {loadingReport && (
                        <div className="flex items-center justify-center p-8 text-cyan-400">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"> {/* Spinner */}
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading report data...
                        </div>
                    )}
                    {!loadingReport && reportData && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">{reportData.title}</h3>
                            <div className="bg-gray-900 rounded-md p-4 mb-4">
                                <p className="text-sm text-gray-300">{reportData.summary}</p>
                            </div>
                            <div className="h-80 bg-gray-900 rounded-md flex items-center justify-center text-gray-500 text-sm">
                                [Placeholder for a {reportData.chartType} chart visualization, e.g., using Chart.js]
                                <p>Chart data for {reportData.title} available.</p>
                            </div>
                            {/* Example of displaying raw data (for debug/testing) */}
                            <div className="mt-4 p-3 bg-gray-900/50 rounded-md max-h-48 overflow-y-auto text-xs text-gray-400">
                                <pre>{JSON.stringify(reportData, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                    {!loadingReport && !reportData && (
                        <div className="p-8 text-center text-gray-500">
                            Select report type and time range, then click "Generate Report".
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export const KnowledgeBaseView: React.FC = () => {
    interface Article {
        id: string;
        title: string;
        content: string;
        category: string;
        tags: string[];
        lastUpdated: string;
        author: string;
        views: number;
    }

    const MOCK_KB_ARTICLES: Article[] = [
        { id: 'KB-001', title: 'How to Reset Your Password', content: 'Detailed steps on how users can securely reset their forgotten passwords through the web portal or mobile app. Includes screenshots.', category: 'Account Management', tags: ['password', 'reset', 'login'], lastUpdated: '2024-06-15', author: 'KB Admin', views: 1250 },
        { id: 'KB-002', title: 'Understanding Transaction Fees', content: 'An explanation of different transaction fees, including withdrawal fees, transfer fees, and foreign exchange fees. Provides a table of rates.', category: 'Billing & Fees', tags: ['fees', 'transactions', 'charges'], lastUpdated: '2024-07-01', author: 'Finance Team', views: 980 },
        { id: 'KB-003', title: 'Troubleshooting Mobile App Issues', content: 'Common fixes for mobile app problems like crashing, freezing, or slow performance. Covers iOS and Android specific steps.', category: 'Technical Support', tags: ['mobile', 'app', 'crash', 'bug'], lastUpdated: '2024-07-10', author: 'Tech Support', views: 1500 },
        { id: 'KB-004', title: 'Setting Up Direct Deposit', content: 'Step-by-step guide to setting up direct deposit with your employer. Includes required bank information and forms.', category: 'Account Management', tags: ['direct deposit', 'payroll'], lastUpdated: '2024-05-20', author: 'Payroll Dept', views: 720 },
        { id: 'KB-005', title: 'Reporting Fraudulent Activity', content: 'Instructions on what to do if you suspect fraudulent activity on your account, including contact information for fraud department and necessary documentation.', category: 'Security & Fraud', tags: ['fraud', 'security', 'report'], lastUpdated: '2024-07-18', author: 'Security Team', views: 1100 },
        { id: 'KB-006', title: 'Contacting Support', content: 'Overview of all available channels to contact customer support: phone, email, chat, and in-app messaging. Includes operating hours.', category: 'General Information', tags: ['contact', 'support'], lastUpdated: '2024-04-01', author: 'Support Ops', views: 200 },
        { id: 'KB-007', title: 'Understanding Your Monthly Statement', content: 'A guide to help customers interpret their monthly bank statements, explaining each section and common terms.', category: 'Billing & Fees', tags: ['statement', 'billing', 'finance'], lastUpdated: '2024-06-01', author: 'Finance Team', views: 600 },
        { id: 'KB-008', title: 'Managing Your Debit Card', content: 'How to activate, block, or reorder your debit card. Information on ATM withdrawals and daily limits.', category: 'Account Management', tags: ['debit card', 'ATM', 'card management'], lastUpdated: '2024-07-05', author: 'Operations', views: 850 },
    ];

    const [articles, setArticles] = useState<Article[]>(MOCK_KB_ARTICLES);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const { addNotification } = useNotifications();

    const uniqueCategories = useMemo(() => {
        const categories = new Set(MOCK_KB_ARTICLES.map(a => a.category));
        return ['all', ...Array.from(categories)];
    }, []);

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [articles, searchTerm, filterCategory]);

    const handleSaveArticle = async (article: Article) => {
        if (selectedArticle) {
            const updatedArticles = articles.map(a => a.id === article.id ? article : a);
            await mockApiCall(updatedArticles, 300);
            setArticles(updatedArticles);
            addNotification(`Article "${article.title}" updated.`, 'success');
        } else {
            const newArticle = { ...article, id: `KB-${generateUUID().substring(0, 4).toUpperCase()}`, author: 'Current Agent', lastUpdated: new Date().toISOString(), views: 0 };
            await mockApiCall([...articles, newArticle], 300);
            setArticles(prev => [...prev, newArticle]);
            addNotification(`Article "${newArticle.title}" added.`, 'success');
        }
        setSelectedArticle(null);
    };

    const handleDeleteArticle = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            const updatedArticles = articles.filter(a => a.id !== id);
            await mockApiCall(updatedArticles, 300);
            setArticles(updatedArticles);
            addNotification('Article deleted.', 'success');
        }
    };

    const ArticleModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        article: Article | null;
        onSave: (article: Article) => void;
    }> = ({ isOpen, onClose, article, onSave }) => {
        const [formData, setFormData] = useState<Article>(article || {
            id: '', title: '', content: '', category: '', tags: [], lastUpdated: '', author: '', views: 0
        });

        useEffect(() => {
            setFormData(article || {
                id: '', title: '', content: '', category: uniqueCategories[1] as string, tags: [], lastUpdated: '', author: '', views: 0
            });
        }, [article, uniqueCategories]);

        if (!isOpen) return null;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            if (name === 'tags') {
                setFormData({ ...formData, tags: value.split(',').map(k => k.trim()).filter(k => k) });
            } else {
                setFormData({ ...formData, [name]: value });
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">{article ? 'Edit Knowledge Base Article' : 'Create New Article'}</h3>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                                <textarea name="content" value={formData.content} onChange={handleChange} required rows={10} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
                                    {uniqueCategories.filter(cat => cat !== 'all').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
                                <input type="text" name="tags" value={formData.tags.join(', ')} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">Save Article</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Knowledge Base Management</h2>
            <Card>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 w-full md:w-64 focus:ring-cyan-500 focus:border-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex space-x-2">
                        <label htmlFor="kb-category" className="sr-only">Filter by Category</label>
                        <select
                            id="kb-category"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => { setSelectedArticle(null); setSelectedArticle(null); }} // Clear selection to create new
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                    >
                        Add New Article
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Tags</th>
                                <th className="px-6 py-3">Last Updated</th>
                                <th className="px-6 py-3">Views</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArticles.map(article => (
                                <tr key={article.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelectedArticle(article)}>
                                    <td className="px-6 py-4 font-medium text-white">{article.title}</td>
                                    <td className="px-6 py-4">{article.category}</td>
                                    <td className="px-6 py-4 text-xs">{article.tags.join(', ')}</td>
                                    <td className="px-6 py-4 text-xs">{formatDate(article.lastUpdated, { dateStyle: 'short' })}</td>
                                    <td className="px-6 py-4">{article.views}</td>
                                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}> {/* Prevent row click from triggering modal */}
                                        <button
                                            onClick={() => setSelectedArticle(article)}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm mr-2"
                                        >
                                            View/Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteArticle(article.id)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {selectedArticle && (
                <ArticleModal
                    isOpen={!!selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                    article={selectedArticle}
                    onSave={handleSaveArticle}
                />
            )}
        </div>
    );
};

export const SettingsView: React.FC = () => {
    const { addNotification } = useNotifications();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        darkMode: true,
        autoAssignNewTickets: false,
        defaultSLA: 'SLA-002', // Default to High Priority SLA
        replyTemplateHeader: "Dear [CUSTOMER_NAME],\n\n",
        replyTemplateFooter: "\n\nBest regards,\n[AGENT_NAME] - Demo Bank Support"
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await mockApiCall(settings, 1000); // Simulate API call
            addNotification('Settings saved successfully!', 'success');
        } catch (error) {
            addNotification('Failed to save settings.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">System Settings</h2>
            <Card title="General Settings">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="emailNotifications" className="text-sm text-gray-300">Email Notifications</label>
                        <input
                            type="checkbox"
                            name="emailNotifications"
                            id="emailNotifications"
                            checked={settings.emailNotifications}
                            onChange={handleSettingChange}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="darkMode" className="text-sm text-gray-300">Dark Mode (UI Preference)</label>
                        <input
                            type="checkbox"
                            name="darkMode"
                            id="darkMode"
                            checked={settings.darkMode}
                            onChange={handleSettingChange}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="autoAssignNewTickets" className="text-sm text-gray-300">Auto-assign New Tickets</label>
                        <input
                            type="checkbox"
                            name="autoAssignNewTickets"
                            id="autoAssignNewTickets"
                            checked={settings.autoAssignNewTickets}
                            onChange={handleSettingChange}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="defaultSLA" className="block text-sm font-medium text-gray-300 mb-1">Default SLA for Uncategorized Tickets</label>
                        <select
                            name="defaultSLA"
                            id="defaultSLA"
                            value={settings.defaultSLA}
                            onChange={handleSettingChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            {MOCK_SLA_RULES.map(rule => (
                                <option key={rule.id} value={rule.id}>{rule.name} ({rule.priority})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            <Card title="Email Reply Templates">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="replyTemplateHeader" className="block text-sm font-medium text-gray-300 mb-1">Reply Template Header</label>
                        <textarea
                            name="replyTemplateHeader"
                            id="replyTemplateHeader"
                            value={settings.replyTemplateHeader}
                            onChange={handleSettingChange}
                            rows={4}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">Use [CUSTOMER_NAME] and [AGENT_NAME] for placeholders.</p>
                    </div>
                    <div>
                        <label htmlFor="replyTemplateFooter" className="block text-sm font-medium text-gray-300 mb-1">Reply Template Footer</label>
                        <textarea
                            name="replyTemplateFooter"
                            id="replyTemplateFooter"
                            value={settings.replyTemplateFooter}
                            onChange={handleSettingChange}
                            rows={4}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                        ></textarea>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT
// ================================================================================================

export const SupportDeskView: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_ALL_TICKETS);
    const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('Open');
    const [filterPriority, setFilterPriority] = useState<TicketPriority | 'all'>('all');
    const [filterAgent, setFilterAgent] = useState<string | 'all'>('all'); // Agent ID or 'all'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ticketsPerPage] = useState(15);

    const [currentMainView, setCurrentMainView] = useState<MainView>('Dashboard');

    const { addNotification } = useNotifications();
    const { currentUser } = useAuth();

    const handleUpdateTicket = useCallback((updatedTicket: SupportTicket) => {
        setTickets(prevTickets =>
            prevTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
        );
        addNotification(`Ticket ${updatedTicket.id} updated.`, 'info');
    }, [addNotification]);

    const filteredAndSortedTickets = useMemo(() => {
        let currentTickets = tickets;

        // Apply search term
        if (searchTerm) {
            currentTickets = currentTickets.filter(t =>
                t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.userName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            currentTickets = currentTickets.filter(t => t.status === filterStatus);
        }

        // Apply priority filter
        if (filterPriority !== 'all') {
            currentTickets = currentTickets.filter(t => t.priority === filterPriority);
        }

        // Apply agent filter
        if (filterAgent !== 'all') {
            currentTickets = currentTickets.filter(t => t.assignedAgentId === filterAgent);
        }

        // Sort (e.g., by last update, newest first)
        currentTickets.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());

        return currentTickets;
    }, [tickets, searchTerm, filterStatus, filterPriority, filterAgent]);

    // Pagination logic
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    const currentTicketsPaginated = filteredAndSortedTickets.slice(indexOfFirstTicket, indexOfLastTicket);
    const totalPages = Math.ceil(filteredAndSortedTickets.length / ticketsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const kpiData = useMemo(() => ({
        openTickets: tickets.filter(t => t.status === 'Open').length,
        pendingTickets: tickets.filter(t => t.status === 'Pending').length,
        resolvedToday: tickets.filter(t => (t.status === 'Resolved' || t.status === 'Closed') && new Date(t.lastUpdate).toDateString() === new Date().toDateString()).length,
        avgResponseTime: '2.5h', // Mocked, would be calculated from real data
        satisfaction: '95%', // Mocked
        slaBreaches: tickets.filter(t => t.sla.breached).length,
    }), [tickets]);

    const renderMainContent = () => {
        switch (currentMainView) {
            case 'Dashboard':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white tracking-wider">Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <Card className="text-center"><p className="text-3xl font-bold text-red-400">{kpiData.openTickets}</p><p className="text-sm text-gray-400 mt-1">Open Tickets</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-yellow-400">{kpiData.pendingTickets}</p><p className="text-sm text-gray-400 mt-1">Pending Customer</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-green-400">{kpiData.resolvedToday}</p><p className="text-sm text-gray-400 mt-1">Resolved Today</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.avgResponseTime}</p><p className="text-sm text-gray-400 mt-1">Avg. First Response</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-red-500">{kpiData.slaBreaches}</p><p className="text-sm text-gray-400 mt-1">SLA Breaches</p></Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 xl:col-span-1">
                                <RecentActivitiesWidget />
                            </div>
                            <div className="lg:col-span-1 xl:col-span-2">
                                <TicketTrendChartWidget />
                            </div>
                        </div>

                        <Card title="Agent Activity Snapshot">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {MOCK_AGENTS.slice(0, 4).map(agent => (
                                    <AgentPerformanceWidget key={agent.id} agent={agent} />
                                ))}
                            </div>
                            <div className="text-right mt-4">
                                <button onClick={() => setCurrentMainView('Agents')} className="text-cyan-400 hover:underline text-sm">View All Agents & Performance</button>
                            </div>
                        </Card>
                    </div>
                );
            case 'Tickets':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white tracking-wider">Ticket Queue</h2>
                        <Card>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 w-full md:w-64 focus:ring-cyan-500 focus:border-cyan-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-lg">
                                    {(['all', 'Open', 'Pending', 'Resolved', 'Closed', 'On-Hold'] as const).map(status => (
                                        <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1 text-sm rounded-md ${filterStatus === status ? 'bg-cyan-600' : 'text-gray-300'}`}>{status}</button>
                                    ))}
                                </div>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value as TicketPriority | 'all')}
                                    className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="all">All Priorities</option>
                                    {(['Low', 'Medium', 'High', 'Urgent'] as TicketPriority[]).map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterAgent}
                                    onChange={(e) => setFilterAgent(e.target.value)}
                                    className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="all">All Agents</option>
                                    <option value="">Unassigned</option>
                                    {MOCK_AGENTS.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                        <tr>
                                            <th className="px-6 py-3">Subject</th>
                                            <th className="px-6 py-3">User</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Priority</th>
                                            <th className="px-6 py-3">Last Update</th>
                                            <th className="px-6 py-3">Agent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTicketsPaginated.length > 0 ? (
                                            currentTicketsPaginated.map(t => (
                                                <tr key={t.id} onClick={() => setSelectedTicket(t)} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                                    <td className="px-6 py-4 font-medium text-white max-w-sm truncate">{t.subject}</td>
                                                    <td className="px-6 py-4">{t.userName}</td>
                                                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                                                    <td className="px-6 py-4"><PriorityBadge priority={t.priority} /></td>
                                                    <td className="px-6 py-4">{formatDate(t.lastUpdate, { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                    <td className="px-6 py-4">{t.assignedAgentName || 'Unassigned'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No tickets matching your criteria.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination controls */}
                            {filteredAndSortedTickets.length > ticketsPerPage && (
                                <div className="flex justify-center mt-4 space-x-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={`px-3 py-1 rounded-md text-sm ${currentPage === number ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </Card>
                    </div>
                );
            case 'Agents':
                return <AgentsManagementView />;
            case 'Customers':
                return <CustomersManagementView />;
            case 'CannedResponses':
                return <CannedResponsesManagementView />;
            case 'SLARules':
                return <SLARulesManagementView />;
            case 'Reports':
                return <ReportsView />;
            case 'KnowledgeBase':
                return <KnowledgeBaseView />;
            case 'Settings':
                return <SettingsView />;
            default:
                return <p className="text-white">Select a view from the sidebar.</p>;
        }
    };

    return (
        <NotificationProvider>
            <AuthProvider>
                <div className="flex min-h-screen bg-gray-900 text-gray-100">
                    <MainSidebar currentView={currentMainView} onSelectView={setCurrentMainView} />
                    <main className="flex-grow p-6 overflow-y-auto">
                        {renderMainContent()}
                    </main>
                </div>
                <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdateTicket={handleUpdateTicket} />
            </AuthProvider>
        </NotificationProvider>
    );
};

export default SupportDeskView;