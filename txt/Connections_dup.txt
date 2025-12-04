```typescript
// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import React, { useState, useEffect } from 'react';
import { GithubIcon } from '../icons.tsx';
// FIX: Renamed useGlobalState to useAppContext
import { useAppContext } from '../../contexts/GlobalStateContext.tsx';
import { initializeOctokit, validateToken } from '../../services/index.ts';
import { LoadingSpinner } from '../shared/LoadingSpinner.tsx';
import type { User } from '../../types.ts';

// Placeholder Jira Icon for demonstration
export const JiraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
    </svg>
);

const GitHubConnection: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { githubToken, isGithubConnected, githubUser } = state;
    const [tokenInput, setTokenInput] = useState(githubToken || '');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        // When the component loads, if there's a token in the global state,
        // try to initialize octokit with it.
        if (githubToken && !isGithubConnected) {
             handleConnect(githubToken);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [githubToken]);

    const handleConnect = async (tokenToConnect: string) => {
        if (!tokenToConnect.trim()) {
            setError('Please enter a token.');
            setStatus('error');
            return;
        }
        setStatus('loading');
        setError('');
        try {
            const user: User = await validateToken(tokenToConnect);
            initializeOctokit(tokenToConnect);
            dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: tokenToConnect, user } });
            setStatus('success');
        } catch (err) {
            setError(err instanceof Error ? `Invalid Token: ${err.message}` : 'An unknown error occurred.');
            setStatus('error');
            initializeOctokit('');
            dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: null, user: null } });
        }
    };
    
    const handleDisconnect = () => {
        setTokenInput('');
        initializeOctokit('');
        dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: null, user: null } });
        setStatus('idle');
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10"><GithubIcon /></div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">GitHub</h3>
                        {isGithubConnected && githubUser ? (
                             <p className="text-sm text-green-600">Connected as {githubUser.login}</p>
                        ) : (
                             <p className="text-sm text-text-secondary">Not Connected</p>
                        )}
                    </div>
                </div> {/* CLOSES: flex items-center gap-4 */}
                {isGithubConnected && (
                    <button onClick={handleDisconnect} className="px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20">
                        Disconnect
                    </button>
                )}
            </div> {/* CLOSES: flex items-center justify-between */}
            
            {!isGithubConnected && (
                <div className="mt-4 pt-4 border-t border-border">
                    <label htmlFor="github-pat" className="block text-sm font-medium text-text-secondary mb-1">Personal Access Token (Classic)</label>
                    <div className="flex gap-2">
                        <input
                            id="github-pat"
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="ghp_..."
                            className="flex-grow p-2 bg-background border border-border rounded-md text-sm"
                        />
                         <button onClick={() => handleConnect(tokenInput)} disabled={status === 'loading'} className="btn-primary px-6 py-2 flex items-center justify-center min-w-[100px]">
                            {status === 'loading' ? <LoadingSpinner /> : 'Connect'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <p className="text-xs text-text-secondary mt-2">
                        Your token is stored only in your browser's local storage. Required scopes: `repo`, `read:user`.
                    </p>
                </div>
            )}
        </div>
    );
};

// New: Jira Connection Component
export const JiraConnection: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [jiraDomain, setJiraDomain] = useState('');
    const [isJiraConnected, setIsJiraConnected] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [jiraUser, setJiraUser] = useState<string | null>(null);

    // Mimic connection persistence with localStorage (for demonstration)
    useEffect(() => {
        const storedApiKey = localStorage.getItem('jiraApiKey');
        const storedJiraDomain = localStorage.getItem('jiraDomain');
        const storedJiraUser = localStorage.getItem('jiraUser');

        if (storedApiKey && storedJiraDomain && storedJiraUser) {
            setApiKey(storedApiKey);
            setJiraDomain(storedJiraDomain);
            setJiraUser(storedJiraUser);
            setIsJiraConnected(true);
            setStatus('success');
        }
    }, []);

    const handleConnectJira = async () => {
        if (!jiraDomain.trim() || !apiKey.trim()) {
            setError('Please enter both Jira Domain and API Key.');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setError('');

        try {
            // Simulate API call to validate Jira credentials
            // In a real application, this would involve a secure backend service
            // to interact with Jira's API.
            const response = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (apiKey === 'test_jira_key' && jiraDomain === 'example.atlassian.net') {
                        resolve({ user: 'jirauser@example.com' }); // Simulate successful connection
                    } else {
                        reject(new Error('Invalid Jira Domain or API Key.')); // Simulate failure
                    }
                }, 1500); // Simulate network delay
            });

            const user = (response as any).user;
            setJiraUser(user);
            setIsJiraConnected(true);
            localStorage.setItem('jiraApiKey', apiKey);
            localStorage.setItem('jiraDomain', jiraDomain);
            localStorage.setItem('jiraUser', user);
            setStatus('success');
        } catch (err) {
            setError(err instanceof Error ? `Connection failed: ${err.message}` : 'An unknown error occurred.');
            setStatus('error');
            setIsJiraConnected(false);
            setJiraUser(null);
            localStorage.removeItem('jiraApiKey');
            localStorage.removeItem('jiraDomain');
            localStorage.removeItem('jiraUser');
        }
    };

    const handleDisconnectJira = () => {
        setApiKey('');
        setJiraDomain('');
        setIsJiraConnected(false);
        setJiraUser(null);
        setStatus('idle');
        setError('');
        localStorage.removeItem('jiraApiKey');
        localStorage.removeItem('jiraDomain');
        localStorage.removeItem('jiraUser');
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 text-blue-500"><JiraIcon /></div>
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">Jira</h3>
                        {isJiraConnected && jiraUser ? (
                             <p className="text-sm text-green-600">Connected as {jiraUser}</p>
                        ) : (
                             <p className="text-sm text-text-secondary">Not Connected</p>
                        )}
                    </div>
                </div>
                {isJiraConnected && (
                    <button onClick={handleDisconnectJira} className="px-4 py-2 bg-red-500/10 text-red-600 font-semibold rounded-lg hover:bg-red-500/20">
                        Disconnect
                    </button>
                )}
            </div>
            
            {!isJiraConnected && (
                <div className="mt-4 pt-4 border-t border-border">
                    <label htmlFor="jira-domain" className="block text-sm font-medium text-text-secondary mb-1">Jira Domain (e.g., yourcompany.atlassian.net)</label>
                    <input
                        id="jira-domain"
                        type="text"
                        value={jiraDomain}
                        onChange={(e) => setJiraDomain(e.target.value)}
                        placeholder="yourcompany.atlassian.net"
                        className="w-full p-2 bg-background border border-border rounded-md text-sm mb-3"
                    />

                    <label htmlFor="jira-api-key" className="block text-sm font-medium text-text-secondary mb-1">Jira API Token</label>
                    <div className="flex gap-2">
                        <input
                            id="jira-api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="ATATT3x..."
                            className="flex-grow p-2 bg-background border border-border rounded-md text-sm"
                        />
                         <button onClick={handleConnectJira} disabled={status === 'loading'} className="btn-primary px-6 py-2 flex items-center justify-center min-w-[100px]">
                            {status === 'loading' ? <LoadingSpinner /> : 'Connect'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <p className="text-xs text-text-secondary mt-2">
                        Generate your Jira API token from your Atlassian account settings. Required permissions: `Read` access for projects.
                    </p>
                </div>
            )}
        </div>
    );
};

// New: Connection Summary Component
export const ConnectionSummary: React.FC = () => {
    const { state } = useAppContext();
    const { isGithubConnected, githubUser } = state;

    // For Jira, we'll check localStorage as JiraConnection component does
    const [isJiraConnectedSummary, setIsJiraConnectedSummary] = useState(false);
    const [jiraUserSummary, setJiraUserSummary] = useState<string | null>(null);

    useEffect(() => {
        const storedApiKey = localStorage.getItem('jiraApiKey');
        const storedJiraUser = localStorage.getItem('jiraUser');
        if (storedApiKey && storedJiraUser) {
            setIsJiraConnectedSummary(true);
            setJiraUserSummary(storedJiraUser);
        } else {
            setIsJiraConnectedSummary(false);
            setJiraUserSummary(null);
        }
    }, [isGithubConnected]); // Re-evaluate if GitHub status changes, or more ideally, listen to localStorage changes

    return (
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">Connection Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6"><GithubIcon /></div>
                    <div>
                        <p className="text-text-primary">GitHub: {isGithubConnected ? <span className="text-green-600 font-semibold">Connected {githubUser?.login && `(${githubUser.login})`}</span> : <span className="text-red-600">Not Connected</span>}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 text-blue-500"><JiraIcon /></div>
                    <div>
                        <p className="text-text-primary">Jira: {isJiraConnectedSummary ? <span className="text-green-600 font-semibold">Connected {jiraUserSummary && `(${jiraUserSummary})`}</span> : <span className="text-red-600">Not Connected</span>}</p>
                    </div>
                </div>
                {/* Add more connection summaries here */}
            </div>
            {(!isGithubConnected || !isJiraConnectedSummary) && (
                <p className="text-sm text-text-secondary mt-4">
                    Some connections are pending. Please configure them below to unlock full functionality.
                </p>
            )}
        </div>
    );
};


export const Connections: React.FC = () => {
    return (
        <div className="h-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">Connections</h1>
                    <p className="mt-2 text-lg text-text-secondary">Manage your external service connections to enhance your workflow.</p>
                </header>

                <ConnectionSummary />

                <div className="space-y-6">
                    <GitHubConnection />
                    <JiraConnection />
                    {/* Additional connection components can be added here */}
                </div>
            </div>
        </div>
    );
};
```