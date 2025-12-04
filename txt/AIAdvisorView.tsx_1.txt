/*
# The Interrogation Room
*A Guide to the AI Advisor*

---

## The Concept

The `AIAdvisorView.tsx`, nicknamed "Quantum," is the primary command interface for the application. It's the "Interrogation Room," a dedicated space where the sovereign can issue direct queries to their AI instrument and receive definitive answers. It maintains a persistent session and uses your command history to provide smart, context-aware suggestions for your next line of questioning.

---

### A Simple Metaphor: Interrogating an Oracle

Think of this view as having a direct line to an omniscient oracle that is bound to answer you truthfully.

-   **The Interrogation (`messages`)**: The main part of the view is the record of your interrogationâ€”a simple back-and-forth between you and your AI instrument.

-   **Contextual Awareness (`previousView`)**: The oracle knows what you were last focused on. If you come from the "Covenants" (Budgets) view, its first suggestions will be about enforcing your will in that domain. This makes the interrogation efficient and relevant.

-   **Suggested Lines of Questioning (`examplePrompts`)**: To begin the interrogation, the oracle offers a few relevant questions you might want to ask, based on the context of your last command. This eliminates ambiguity and makes it easy to get to the truth.

-   **The Oracle's Oath (`systemInstruction`)**: The instrument has been bound by an oath: "helpful, professional, and slightly futuristic." This ensures its answers are always clear, concise, and serve your will.

---

### How It Works

1.  **Binding the Oracle**: When the component first loads, it creates a `Chat` instance with the Gemini API. This instance is stored in a `useRef`, which is crucial because it ensures the *same interrogation session* persists. This is how the AI remembers your entire line of questioning. The AI's oath is sworn here using the `systemInstruction`.

2.  **Issuing a Query**: When you send a message, the `handleSendMessage` function is called.
    -   It immediately adds your query to the record so the interface feels instant.
    -   It sends the query to the Gemini API using the persistent `chatRef.current.sendMessage`. This method automatically includes the entire previous interrogation, giving the AI full context.
    -   When the AI's definitive answer comes back, it's added to the record.

3.  **Providing Context**: The `App` component keeps track of the `previousView` you were commanding. It passes this information to the `AIAdvisorView`. The component then uses this to look up the most relevant `examplePrompts`, making the initial screen feel intelligent and prepared for your command.

---

### The Philosophy: Definitive Answers

This component is designed to make getting to the truth as easy as asking a direct question. Instead of navigating complex reports, you simply issue a query in plain English. The AI instrument, with its memory of the conversation and context of your recent commands, can provide the clear, concise, and definitive answers required to exercise effective rule.
*/

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
    createContext,
    useContext,
    useReducer,
    Fragment,
    forwardRef,
    useImperativeHandle,
} from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { VegaLite } from 'react-vega';
import { v4 as uuidv4 } from 'uuid';

// --- TYPE DEFINITIONS ---

/**
 * Represents the author of a message.
 * 'user': The end-user interacting with the UI.
 * 'ai': The AI model providing responses.
 * 'system': Internal messages for status, errors, or context.
 * 'tool': Messages related to AI tool calls.
 */
export type MessageAuthor = 'user' | 'ai' | 'system' | 'tool';

/**
 * Represents the status of a message, particularly for AI responses.
 * 'pending': Waiting for a response or for a tool to run.
 * 'streaming': The AI response is actively being streamed.
 * 'complete': The message is fully received and rendered.
 * 'error': An error occurred while generating or processing the message.
 */
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

/**
 * Represents a tool call requested by the AI.
 */
export interface ToolCall {
    id: string;
    name: string;
    args: Record<string, any>;
}

/**
 * Represents the result of a tool execution.
 */
export interface ToolResult {
    callId: string;
    result: any;
    error?: string;
}

/**
 * Represents a piece of rich content that can be displayed in a message.
 * 'markdown': Standard markdown text.
 * 'code': A block of code with a specified language.
 * 'table': Tabular data.
 * 'chart': A data visualization spec (e.g., Vega-Lite).
 */
export type ContentType = 'markdown' | 'code' | 'table' | 'chart';

export interface ContentPart {
    type: ContentType;
    payload: any;
}

/**
 * The core message structure for the chat interface.
 */
export interface ChatMessage {
    id: string;
    author: MessageAuthor;
    content: string | ContentPart[];
    timestamp: string;
    status: MessageStatus;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
}

/**
 * Represents a full conversation thread.
 */
export interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    messages: ChatMessage[];
    systemInstruction: string;
    contextData?: Record<string, any>;
}

/**
 * Contextual information passed to the AI Advisor.
 */
export type AdvisorContext = 'Covenants' | 'Treasury' | 'Fleet' | 'Intelligence' | 'None';

/**
 * Props for the main AIAdvisorView component.
 */
export interface AIAdvisorViewProps {
    initialContext?: AdvisorContext;
    user: { id: string; name: string; avatarUrl?: string };
    onNewConversation?: (conversationId: string) => void;
    initialConversationId?: string;
}

/**
 * Represents an available tool the AI can use.
 */
export interface AITool {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, { type: string; description: string; enum?: string[] }>;
        required: string[];
    };
    execute: (args: any) => Promise<any>;
}

/**
 * Props for the ChatInput component.
 */
export interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isSending: boolean;
    placeholder?: string;
}

/**

 * Ref handle for the ChatInput component to allow programmatic focus.
 */
export interface ChatInputRef {
    focus: () => void;
}

// --- CONSTANTS & CONFIGURATION ---

export const DEFAULT_SYSTEM_INSTRUCTION = "You are Quantum, a helpful, professional, and slightly futuristic AI advisor. You provide clear, concise, and definitive answers to serve the user's will. You can use available tools to access real-time data and perform actions.";

export const CONTEXTUAL_PROMPTS: Record<AdvisorContext, string[]> = {
    Covenants: [
        "Summarize our current budget adherence.",
        "Which covenants are at risk of being breached this quarter?",
        "Project our spending for the next 6 months.",
        "Generate a report on discretionary spending.",
    ],
    Treasury: [
        "What is our current cash flow situation?",
        "Analyze the performance of our investment portfolio.",
        "Show me a breakdown of assets vs. liabilities.",
        "Forecast treasury balance for the end of the fiscal year.",
    ],
    Fleet: [
        "What is the operational readiness of the fleet?",
        "List all assets currently undergoing maintenance.",
        "Show me a map of all active fleet deployments.",
        "Who is the commander of the starship 'Vanguard'?",
    ],
    Intelligence: [
        "Summarize recent intelligence reports from the outer rim.",
        "Are there any emerging threats we should be aware of?",
        "Cross-reference faction 'Xylos' with recent trade anomalies.",
        "Generate a risk assessment for sector 7.",
    ],
    None: [
        "Give me a high-level summary of the current situation.",
        "What are the most pressing issues I should be aware of?",
        "Who can I talk to about fleet logistics?",
        "Start a new project plan.",
    ],
};

// --- MOCK DATA & API ---

/**
 * A mock function simulating a call to a generative AI API.
 * This simulates streaming and tool calls.
 * @param messages - The history of messages in the conversation.
 * @param tools - The list of available tools.
 * @param onStream - A callback to handle streamed chunks of data.
 */
export const mockGenerativeAIAPI = async (
    messages: ChatMessage[],
    tools: AITool[],
    onStream: (chunk: string) => void
): Promise<{ fullResponse: string; toolCalls?: ToolCall[] }> => {
    const lastUserMessage = messages[messages.length - 1]?.content.toString().toLowerCase() || '';

    // Simulate API delay
    await new Promise(res => setTimeout(res, 500));

    // Tool Call Simulation
    if (lastUserMessage.includes("fleet readiness")) {
        const toolCallId = `tool_${uuidv4()}`;
        return {
            fullResponse: "",
            toolCalls: [{
                id: toolCallId,
                name: "get_fleet_readiness",
                args: { status: "all" }
            }],
        };
    }
    
    if (lastUserMessage.includes("sales report")) {
        const toolCallId = `tool_${uuidv4()}`;
        return {
            fullResponse: "",
            toolCalls: [{
                id: toolCallId,
                name: "generate_sales_report",
                args: { quarter: "Q3", year: 2024 }
            }],
        };
    }

    // Streaming Text Simulation
    let response = "I am processing your query. Stand by for a definitive answer.";
    if (lastUserMessage.includes("hello")) {
        response = "Greetings. I am Quantum, your AI advisor. How may I be of service?";
    } else if (lastUserMessage.includes("covenants")) {
        response = "Analyzing covenant compliance data... All budgets are currently within designated parameters. The 'Project Chimera' R&D fund is at 87% of its quarterly allocation, which is the highest utilization rate.";
    }

    const chunks = response.match(/.{1,10}/g) || [];
    for (const chunk of chunks) {
        await new Promise(res => setTimeout(res, 50));
        onStream(chunk);
    }

    return { fullResponse: response };
};

/**
 * A collection of mock tools for demonstration purposes.
 */
export const MOCK_TOOLS: AITool[] = [
    {
        name: "get_fleet_readiness",
        description: "Retrieves the current operational readiness status of the entire fleet or a specific ship.",
        parameters: {
            type: "object",
            properties: {
                status: { type: "string", description: "The status to filter by", enum: ["all", "active", "maintenance", "standby"] },
                ship_name: { type: "string", description: "The name of a specific ship to query." },
            },
            required: ["status"],
        },
        execute: async (args: { status: string; ship_name?: string }) => {
            await new Promise(res => setTimeout(res, 1000)); // Simulate async work
            const readinessData = [
                { ship: "Vanguard", class: "Dreadnought", status: "active", crew: 5000 },
                { ship: "Odyssey", class: "Explorer", status: "active", crew: 800 },
                { ship: "Aegis", class: "Cruiser", status: "maintenance", crew: 1200 },
                { ship: "Pathfinder", class: "Scout", status: "standby", crew: 50 },
            ];
            let filteredData = readinessData;
            if (args.status !== "all") {
                filteredData = readinessData.filter(ship => ship.status === args.status);
            }
            if (args.ship_name) {
                filteredData = filteredData.filter(ship => ship.ship.toLowerCase() === args.ship_name.toLowerCase());
            }
            return {
                type: 'table',
                payload: {
                    headers: ["Ship", "Class", "Status", "Crew Complement"],
                    rows: filteredData.map(s => [s.ship, s.class, s.status, s.crew]),
                }
            };
        },
    },
    {
        name: "generate_sales_report",
        description: "Generates a sales report for a specific quarter and year, returning data suitable for a chart.",
        parameters: {
            type: "object",
            properties: {
                quarter: { type: "string", description: "The quarter (e.g., 'Q1', 'Q2')", required: true },
                year: { type: "number", description: "The year (e.g., 2024)", required: true },
            },
            required: ["quarter", "year"],
        },
        execute: async (args: { quarter: string; year: number }) => {
            await new Promise(res => setTimeout(res, 1500));
            // Mock data for a Vega-Lite chart
            const salesData = [
                { "month": "July", "revenue": 2870, "category": "Hardware" },
                { "month": "July", "revenue": 1940, "category": "Software" },
                { "month": "August", "revenue": 4320, "category": "Hardware" },
                { "month": "August", "revenue": 2500, "category": "Software" },
                { "month": "September", "revenue": 5550, "category": "Hardware" },
                { "month": "September", "revenue": 3100, "category": "Software" },
            ];
            return {
                type: 'chart',
                payload: {
                    spec: {
                        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
                        "description": `Monthly Sales for ${args.quarter} ${args.year}`,
                        "data": { "values": salesData },
                        "mark": "bar",
                        "encoding": {
                            "x": { "field": "month", "type": "ordinal", "sort": ["July", "August", "September"] },
                            "y": { "field": "revenue", "type": "quantitative" },
                            "color": { "field": "category" }
                        }
                    }
                }
            };
        },
    }
];

// --- UTILITY FUNCTIONS ---

/**
 * Generates a unique identifier.
 * @returns A new UUID string.
 */
export const generateId = (): string => uuidv4();

/**
 * Formats a date string into a more readable time format.
 * @param dateString - The ISO date string to format.
 * @returns A formatted time string (e.g., "14:30").
 */
export const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// --- CORE LOGIC HOOKS ---

/**
 * Reducer for managing the conversation state.
 */
type ChatAction =
    | { type: 'ADD_MESSAGE'; payload: ChatMessage }
    | { type: 'UPDATE_LAST_MESSAGE'; payload: Partial<ChatMessage> }
    | { type: 'STREAM_TO_LAST_MESSAGE'; payload: string }
    | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
    | { type: 'SET_STATUS'; payload: { messageId: string; status: MessageStatus } };

export const chatReducer = (state: ChatMessage[], action: ChatAction): ChatMessage[] => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return [...state, action.payload];
        case 'UPDATE_LAST_MESSAGE':
            if (state.length === 0) return state;
            const lastMessage = state[state.length - 1];
            const updatedMessage = { ...lastMessage, ...action.payload };
            return [...state.slice(0, -1), updatedMessage];
        case 'STREAM_TO_LAST_MESSAGE':
             if (state.length === 0 || typeof state[state.length - 1].content !== 'string') {
                 return state;
             }
            const currentContent = state[state.length - 1].content as string;
            return [
                ...state.slice(0, -1),
                { ...state[state.length - 1], content: currentContent + action.payload, status: 'streaming' as MessageStatus },
            ];
        case 'SET_MESSAGES':
            return action.payload;
        case 'SET_STATUS':
            return state.map(msg =>
                msg.id === action.payload.messageId ? { ...msg, status: action.payload.status } : msg
            );
        default:
            return state;
    }
};

/**
 * Manages the state and logic of a single chat session.
 * @param availableTools - A list of tools the AI can use.
 */
export const useChatSession = (availableTools: AITool[]) => {
    const [messages, dispatch] = useReducer(chatReducer, []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const toolExecutor = useMemo(() => new Map(availableTools.map(tool => [tool.name, tool.execute])), [availableTools]);

    const processStreamAndTools = useCallback(async (history: ChatMessage[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const aiMessageId = generateId();
            dispatch({
                type: 'ADD_MESSAGE', payload: {
                    id: aiMessageId,
                    author: 'ai',
                    content: '',
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                }
            });

            const { fullResponse, toolCalls } = await mockGenerativeAIAPI(
                history,
                availableTools,
                (chunk) => {
                    dispatch({ type: 'STREAM_TO_LAST_MESSAGE', payload: chunk });
                }
            );

            if (toolCalls && toolCalls.length > 0) {
                 dispatch({
                    type: 'UPDATE_LAST_MESSAGE', payload: {
                        content: `Requesting to use ${toolCalls.length} tool(s)...`,
                        status: 'complete',
                        toolCalls,
                    }
                });
                // Execute tools
                await executeToolCalls(toolCalls);
            } else {
                 dispatch({
                    type: 'UPDATE_LAST_MESSAGE', payload: {
                        content: fullResponse,
                        status: 'complete'
                    }
                });
            }

        } catch (e: any) {
            setError(e);
            dispatch({
                type: 'UPDATE_LAST_MESSAGE', payload: {
                    content: "An error occurred while processing your request.",
                    status: 'error'
                }
            });
        } finally {
            setIsLoading(false);
        }
    }, [availableTools, toolExecutor]);
    
    const executeToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
        const toolResults: ToolResult[] = [];
        
        for (const call of toolCalls) {
            const toolMessageId = generateId();
            dispatch({
                type: 'ADD_MESSAGE', payload: {
                    id: toolMessageId,
                    author: 'tool',
                    content: `Executing tool: \`${call.name}\` with arguments: \`${JSON.stringify(call.args)}\``,
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                }
            });

            const executor = toolExecutor.get(call.name);
            if (executor) {
                try {
                    const result = await executor(call.args);
                    toolResults.push({ callId: call.id, result });
                    
                    // Parse result for rich content
                    if (result.type && (result.type === 'table' || result.type === 'chart')) {
                         dispatch({
                            type: 'ADD_MESSAGE', payload: {
                                id: generateId(),
                                author: 'tool',
                                content: [result], // Array of content parts
                                timestamp: new Date().toISOString(),
                                status: 'complete',
                            }
                        });
                    } else {
                        // Fallback for simple string/JSON results
                        dispatch({
                            type: 'ADD_MESSAGE', payload: {
                                id: generateId(),
                                author: 'tool',
                                content: `Tool \`${call.name}\` executed successfully. Result: \`${JSON.stringify(result)}\``,
                                timestamp: new Date().toISOString(),
                                status: 'complete',
                            }
                        });
                    }

                } catch (e: any) {
                     toolResults.push({ callId: call.id, result: null, error: e.message });
                     dispatch({
                        type: 'ADD_MESSAGE', payload: {
                            id: generateId(),
                            author: 'tool',
                            content: `Error executing tool \`${call.name}\`: ${e.message}`,
                            timestamp: new Date().toISOString(),
                            status: 'error',
                        }
                    });
                }
            } else {
                toolResults.push({ callId: call.id, result: null, error: `Tool '${call.name}' not found.` });
            }
        }
        
        // After executing tools, we might want to send results back to the AI for a final summary.
        // For this mock, we'll just stop here. In a real implementation, you'd make another API call.
        
    }, [toolExecutor]);

    const sendMessage = useCallback(async (text: string) => {
        const userMessage: ChatMessage = {
            id: generateId(),
            author: 'user',
            content: text,
            timestamp: new Date().toISOString(),
            status: 'complete',
        };
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

        // Use a function to get the latest state for the async call
        const updatedMessages = [...messages, userMessage];
        await processStreamAndTools(updatedMessages);

    }, [messages, processStreamAndTools]);

    return { messages, isLoading, error, sendMessage, setMessages: (msgs: ChatMessage[]) => dispatch({ type: 'SET_MESSAGES', payload: msgs }) };
};

// --- UI THEME & STYLES CONTEXT ---

export const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const THEMES = {
    dark: {
        background: '#1a1a1b',
        surface: '#2d2d2f',
        text: '#e6e6e6',
        primary: '#8a63d2',
        secondary: '#555',
        border: '#444',
        userMessageBg: '#3a3a3c',
        aiMessageBg: '#2d2d2f',
    },
    light: {
        background: '#f4f4f5',
        surface: '#ffffff',
        text: '#1a1a1b',
        primary: '#6d28d9',
        secondary: '#ccc',
        border: '#e0e0e0',
        userMessageBg: '#eef2ff',
        aiMessageBg: '#ffffff',
    },
};

// --- UI HELPER/SUB-COMPONENTS ---

/**
 * A loading spinner component.
 */
export const LoadingSpinner = React.memo(() => (
    <div style={styles.spinnerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: useTheme().theme === 'dark' ? THEMES.dark.text : THEMES.light.text }}>Thinking...</p>
    </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * A component to display error messages.
 */
export const ErrorDisplay = React.memo(({ error }: { error: Error }) => (
    <div style={styles.errorContainer}>
        <strong>Error:</strong> {error.message}
    </div>
));
ErrorDisplay.displayName = 'ErrorDisplay';

/**
 * Displays a block of code with syntax highlighting.
 */
export const CodeBlock = React.memo(({ language, code }: { language: string; code: string }) => {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    return (
        <div style={{...styles.codeBlockContainer, backgroundColor: '#2d2d2f'}}>
            <div style={styles.codeBlockHeader}>
                <span style={{color: '#ccc'}}>{language}</span>
                <button onClick={handleCopy} style={styles.copyButton}>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: '0 0 4px 4px' }}>
                {code}
            </SyntaxHighlighter>
        </div>
    );
});
CodeBlock.displayName = 'CodeBlock';

/**
 * Renders tabular data in a styled HTML table.
 */
export const DataTable = React.memo(({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) => {
    const { theme } = useTheme();
    const currentTheme = THEMES[theme];

    return (
        <div style={{...styles.tableContainer, borderColor: currentTheme.border}}>
            <table style={{...styles.table, color: currentTheme.text}}>
                <thead style={{backgroundColor: currentTheme.surface}}>
                    <tr>
                        {headers.map((header, index) => <th key={index} style={{...styles.tableHeader, borderBottomColor: currentTheme.border}}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} style={{backgroundColor: rowIndex % 2 === 0 ? currentTheme.surface : 'transparent'}}>
                           {row.map((cell, cellIndex) => <td key={cellIndex} style={{...styles.tableCell, borderBottomColor: currentTheme.border}}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
});
DataTable.displayName = 'DataTable';

/**
 * Renders a chart using Vega-Lite.
 */
export const VegaChart = React.memo(({ spec }: { spec: any }) => {
    const { theme } = useTheme();
    return (
        <div style={styles.chartContainer}>
            <VegaLite spec={spec} actions={false} theme={theme === 'dark' ? 'dark' : 'default'} />
        </div>
    );
});
VegaChart.displayName = 'VegaChart';

/**
 * Renders a single part of a message's content.
 */
export const MessageContentPart = React.memo(({ part }: { part: ContentPart }) => {
    switch (part.type) {
        case 'markdown':
            return <ReactMarkdown>{part.payload}</ReactMarkdown>;
        case 'code':
            return <CodeBlock language={part.payload.language} code={part.payload.code} />;
        case 'table':
            return <DataTable headers={part.payload.headers} rows={part.payload.rows} />;
        case 'chart':
            return <VegaChart spec={part.payload.spec} />;
        default:
            return <div>Unsupported content type</div>;
    }
});
MessageContentPart.displayName = 'MessageContentPart';

/**
 * Renders a single chat message with appropriate styling.
 */
export const ChatMessageBubble = React.memo(({ message }: { message: ChatMessage }) => {
    const { theme } = useTheme();
    const currentTheme = THEMES[theme];
    const isUser = message.author === 'user';
    const isTool = message.author === 'tool';
    const bubbleStyle = isUser
        ? { ...styles.messageBubble, ...styles.userMessage, backgroundColor: currentTheme.userMessageBg }
        : isTool
        ? { ...styles.messageBubble, ...styles.toolMessage, backgroundColor: currentTheme.surface, borderColor: currentTheme.primary }
        : { ...styles.messageBubble, ...styles.aiMessage, backgroundColor: currentTheme.aiMessageBg };

    const renderContent = () => {
        if (Array.isArray(message.content)) {
            return message.content.map((part, index) => <MessageContentPart key={index} part={part} />);
        }
        return (
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {message.content}
            </ReactMarkdown>
        );
    };

    return (
        <div style={{ ...styles.messageRow, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            <div style={{...bubbleStyle, borderColor: currentTheme.border}}>
                <div style={styles.messageAuthor}>
                    <strong>{message.author.toUpperCase()}</strong>
                    <span style={{...styles.messageTimestamp, color: currentTheme.secondary}}>{formatTimestamp(message.timestamp)}</span>
                </div>
                <div style={{...styles.messageContent, color: currentTheme.text}}>
                    {renderContent()}
                    {message.status === 'streaming' && <span style={{...styles.streamingCursor, backgroundColor: currentTheme.primary}}></span>}
                </div>
            </div>
        </div>
    );
});
ChatMessageBubble.displayName = 'ChatMessageBubble';

/**
 * A panel for suggesting initial prompts to the user.
 */
export const ExamplePrompts = React.memo(({ prompts, onSelectPrompt }: { prompts: string[]; onSelectPrompt: (prompt: string) => void }) => {
    const { theme } = useTheme();
    const currentTheme = THEMES[theme];
    return (
        <div style={styles.promptsContainer}>
            <h3 style={{...styles.promptsHeader, color: currentTheme.text}}>Suggested Lines of Questioning</h3>
            <div style={styles.promptsGrid}>
                {prompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectPrompt(prompt)}
                        style={{ ...styles.promptButton, backgroundColor: currentTheme.surface, color: currentTheme.text, borderColor: currentTheme.border }}
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
});
ExamplePrompts.displayName = 'ExamplePrompts';

/**
 * The text input area for the user to type messages.
 */
export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({ onSendMessage, isSending, placeholder }, ref) => {
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { theme } = useTheme();
    const currentTheme = THEMES[theme];

    useImperativeHandle(ref, () => ({
        focus: () => {
            textareaRef.current?.focus();
        },
    }));

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [inputValue]);

    const handleSend = () => {
        if (inputValue.trim() && !isSending) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ ...styles.chatInputContainer, backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
            <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                placeholder={placeholder || 'Issue your command...'}
                rows={1}
                style={{ ...styles.chatTextarea, backgroundColor: 'transparent', color: currentTheme.text }}
            />
            <button onClick={handleSend} disabled={isSending} style={{ ...styles.sendButton, backgroundColor: isSending ? currentTheme.secondary : currentTheme.primary }}>
                {isSending ? '...' : 'Send'}
            </button>
        </div>
    );
});
ChatInput.displayName = 'ChatInput';

/**
 * The header of the chat interface.
 */
export const ChatHeader = React.memo(({ title, onNewConversation, onToggleTheme }: { title: string; onNewConversation: () => void; onToggleTheme: () => void }) => {
    const { theme } = useTheme();
    const currentTheme = THEMES[theme];

    return (
        <div style={{...styles.chatHeader, backgroundColor: currentTheme.surface, borderBottomColor: currentTheme.border }}>
            <h2 style={{...styles.chatHeaderTitle, color: currentTheme.text}}>{title}</h2>
            <div>
                <button onClick={onToggleTheme} style={styles.headerButton}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={onNewConversation} style={styles.headerButton}>
                    New Interrogation
                </button>
            </div>
        </div>
    );
});
ChatHeader.displayName = 'ChatHeader';

// --- MAIN COMPONENT ---

export const AIAdvisorView = ({
    initialContext = 'None',
    user,
    onNewConversation,
    initialConversationId,
}: AIAdvisorViewProps) => {
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
    const { messages, isLoading, error, sendMessage, setMessages } = useChatSession(MOCK_TOOLS);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const chatInputRef = useRef<ChatInputRef>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const themeProviderValue = useMemo(() => ({
        theme: currentTheme,
        toggleTheme: () => setCurrentTheme(t => (t === 'light' ? 'dark' : 'light')),
    }), [currentTheme]);

    // Effect to scroll to the bottom of the messages list
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Effect for loading/creating conversations
    useEffect(() => {
        if (initialConversationId) {
            // In a real app, you would fetch this from a DB/API
            console.log(`Loading conversation ${initialConversationId}...`);
        } else {
            // Start a new conversation
            handleNewConversation();
        }
    }, [initialConversationId]);
    
    const handleNewConversation = useCallback(() => {
        const newConvId = generateId();
        const newConversation: Conversation = {
            id: newConvId,
            title: `Interrogation ${new Date().toLocaleString()}`,
            createdAt: new Date().toISOString(),
            messages: [],
            systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
            contextData: { initialContext },
        };
        setActiveConversation(newConversation);
        setMessages([]);
        chatInputRef.current?.focus();
        if (onNewConversation) {
            onNewConversation(newConvId);
        }
    }, [initialContext, onNewConversation, setMessages]);


    const handleSelectPrompt = (prompt: string) => {
        sendMessage(prompt);
        chatInputRef.current?.focus();
    };
    
    const themeStyles = THEMES[currentTheme];

    return (
        <ThemeContext.Provider value={themeProviderValue}>
            <div style={{ ...styles.advisorContainer, backgroundColor: themeStyles.background }}>
                <ChatHeader 
                    title={activeConversation?.title || "Quantum Advisor"}
                    onNewConversation={handleNewConversation}
                    onToggleTheme={themeProviderValue.toggleTheme}
                />
                <div style={styles.chatArea}>
                    <div style={styles.messagesContainer}>
                        {messages.length === 0 && !isLoading && (
                            <ExamplePrompts
                                prompts={CONTEXTUAL_PROMPTS[initialContext]}
                                onSelectPrompt={handleSelectPrompt}
                            />
                        )}
                        {messages.map((msg) => (
                           <ChatMessageBubble key={msg.id} message={msg} />
                        ))}
                        {isLoading && messages[messages.length-1]?.author !== 'ai' && <LoadingSpinner />}
                        {error && <ErrorDisplay error={error} />}
                        <div ref={messagesEndRef} />
                    </div>
                    <div style={styles.inputWrapper}>
                        <ChatInput
                            ref={chatInputRef}
                            onSendMessage={sendMessage}
                            isSending={isLoading}
                        />
                    </div>
                </div>
            </div>
        </ThemeContext.Provider>
    );
};

// --- STYLES ---

type StyleDictionary = { [key: string]: React.CSSProperties };

export const styles: StyleDictionary = {
    advisorContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        overflow: 'hidden',
    },
    chatHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid',
        flexShrink: 0,
    },
    chatHeaderTitle: {
        margin: 0,
        fontSize: '1.2rem',
    },
    headerButton: {
        marginLeft: '10px',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    chatArea: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    messagesContainer: {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '20px',
    },
    inputWrapper: {
        padding: '10px 20px 20px 20px',
        flexShrink: 0,
    },
    messageRow: {
        display: 'flex',
        marginBottom: '15px',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: '10px 15px',
        borderRadius: '12px',
        border: '1px solid',
    },
    userMessage: {
        borderBottomRightRadius: '2px',
        color: '#fff',
    },
    aiMessage: {
        borderBottomLeftRadius: '2px',
    },
    toolMessage: {
        borderStyle: 'dashed',
        borderWidth: '2px',
        width: '100%',
        maxWidth: '80%',
    },
    messageAuthor: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    messageTimestamp: {
        marginLeft: '10px',
        fontSize: '0.75rem',
    },
    messageContent: {
        wordWrap: 'break-word',
    },
    streamingCursor: {
        display: 'inline-block',
        width: '10px',
        height: '1em',
        animation: 'blink 1s step-end infinite',
        marginLeft: '4px',
        verticalAlign: 'text-bottom',
    },
    chatInputContainer: {
        display: 'flex',
        alignItems: 'center',
        padding: '5px',
        borderRadius: '8px',
        border: '1px solid',
    },
    chatTextarea: {
        flexGrow: 1,
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontSize: '1rem',
        maxHeight: '200px',
        padding: '10px',
        fontFamily: 'inherit',
    },
    sendButton: {
        border: 'none',
        borderRadius: '5px',
        color: '#fff',
        padding: '10px 15px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #8a63d2',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        animation: 'spin 1s linear infinite',
        marginRight: '10px',
    },
    errorContainer: {
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#ffdddd',
        color: '#d8000c',
        borderRadius: '5px',
        border: '1px solid #d8000c',
    },
    promptsContainer: {
        textAlign: 'center',
        padding: '40px 20px',
    },
    promptsHeader: {
        marginBottom: '20px',
    },
    promptsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    promptButton: {
        padding: '15px',
        border: '1px solid',
        borderRadius: '8px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        fontSize: '0.9rem',
    },
    codeBlockContainer: {
        margin: '10px 0',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    codeBlockHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 10px',
        backgroundColor: '#1e1e1e',
        fontSize: '0.8rem',
    },
    copyButton: {
        background: 'none',
        border: '1px solid #555',
        color: '#ccc',
        padding: '3px 8px',
        borderRadius: '3px',
        cursor: 'pointer',
    },
    tableContainer: {
        margin: '10px 0',
        border: '1px solid',
        borderRadius: '4px',
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        padding: '10px',
        textAlign: 'left',
        borderBottom: '2px solid',
    },
    tableCell: {
        padding: '10px',
        borderBottom: '1px solid',
    },
    chartContainer: {
        padding: '10px',
        margin: '10px 0',
    },
};

// CSS Keyframes for animations
const keyframes = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@keyframes blink {
    from, to { background-color: transparent; }
    50% { background-color: #8a63d2; }
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = keyframes;
document.head.appendChild(styleSheet);


export default AIAdvisorView;