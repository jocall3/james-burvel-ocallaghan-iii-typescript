// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from 'react';
import { useAppContext } from '../contexts/GlobalStateContext';
import { initializeOctokit, validateToken } from '../services';
import type { User } from '../types';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { GithubIcon } from './icons';

export const LoginView: React.FC = () => {
    const { dispatch } = useAppContext();
    const [tokenInput, setTokenInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleConnect = async () => {
        if (!tokenInput.trim()) {
            setError('Please enter a token.');
            setStatus('error');
            return;
        }
        setStatus('loading');
        setError('');
        try {
            const user: User = await validateToken(tokenInput);
            initializeOctokit(tokenInput);
            dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: tokenInput, user } });
        } catch (err) {
            setError(err instanceof Error ? `Invalid Token: ${err.message}` : 'An unknown error occurred.');
            setStatus('error');
            initializeOctokit('');
            dispatch({ type: 'SET_GITHUB_TOKEN', payload: { token: null, user: null } });
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background text-text-primary font-sans">
            <div className="bg-surface/50 backdrop-blur-xl p-8 sm:p-12 rounded-2xl shadow-2xl text-center border border-border max-w-lg m-4 animate-scale-in">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mx-auto mb-4">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome to DevCore AI</h1>
                <p className="text-text-secondary mb-8">Connect with a GitHub Personal Access Token to continue.</p>

                <div className="mt-4 pt-4 text-left">
                    <label htmlFor="github-pat" className="block text-sm font-medium text-text-secondary mb-1">Personal Access Token (Classic)</label>
                    <div className="flex gap-2">
                        <input
                            id="github-pat"
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                            placeholder="ghp_..."
                            className="flex-grow p-2 bg-background/50 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                         <button onClick={handleConnect} disabled={status === 'loading'} className="btn-primary px-6 py-2 flex items-center justify-center min-w-[120px]">
                            {status === 'loading' ? <LoadingSpinner /> : 'Connect'}
                        </button>
                    </div>
                    {error && <p className="text-danger text-xs mt-2">{error}</p>}
                    <p className="text-xs text-text-secondary mt-2">
                        Your token is stored only in your browser's local storage. Required scopes: `repo`, `read:user`.
                    </p>
                </div>
            </div>
        </div>
    );
};
