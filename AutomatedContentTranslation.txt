// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { translateContent } from '../../services/api';
import { CodeMigratorIcon } from '../icons';
import { LoadingSpinner } from '../shared';

const languages = ['Spanish', 'French', 'German', 'Japanese', 'Mandarin', 'Russian', 'Arabic'];

export const AutomatedContentTranslation: React.FC = () => {
    const [text, setText] = useState<string>('Hello, world! This is a test of the translation feature.');
    const [targetLang, setTargetLang] = useState('Spanish');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleTranslate = useCallback(async () => {
        if (!text.trim()) {
            setError('Please enter text to translate.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTranslatedText('');
        try {
            const result = await translateContent(text, targetLang);
            setTranslatedText(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [text, targetLang]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeMigratorIcon />
                    <span className="ml-3">AI Content Translation</span>
                </h1>
                <p className="text-text-secondary mt-1">Translate text between languages.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Text to Translate</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-4 mb-2">
                        <label htmlFor="lang-select" className="text-sm font-medium text-text-secondary">Translate to:</label>
                        <select id="lang-select" value={targetLang} onChange={e => setTargetLang(e.target.value)} className="p-2 rounded bg-surface border border-border">
                            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {translatedText && <p>{translatedText}</p>}
                    </div>
                </div>
            </div>
             <button onClick={handleTranslate} disabled={isLoading} className="btn-primary mt-4 w-full max-w-sm mx-auto">
                {isLoading ? <LoadingSpinner /> : 'Translate'}
            </button>
        </div>
    );
};
