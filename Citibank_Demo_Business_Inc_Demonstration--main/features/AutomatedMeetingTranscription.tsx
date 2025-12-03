// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useRef } from 'react';
import { transcribeMeeting } from '../../services/api';
import { fileToBase64 } from '../../services/fileUtils';
import { MicrophoneIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AutomatedMeetingTranscription: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTranscribe = useCallback(async () => {
        if (!file) {
            setError('Please select an audio file.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTranscription('');
        try {
            const base64Audio = await fileToBase64(file);
            const stream = transcribeMeeting(base64Audio, file.type);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setTranscription(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [file]);
    
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MicrophoneIcon />
                    <span className="ml-3">AI Meeting Transcription</span>
                </h1>
                <p className="text-text-secondary mt-1">Upload an audio file to transcribe and summarize your meeting.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="flex items-center gap-4 bg-surface p-4 rounded-lg border border-border">
                    <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} accept="audio/*" className="flex-grow text-sm"/>
                    <button onClick={handleTranscribe} disabled={isLoading || !file} className="btn-primary px-6 py-2">
                        {isLoading ? <LoadingSpinner /> : 'Transcribe'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {transcription && <MarkdownRenderer content={transcription} />}
                </div>
            </div>
        </div>
    );
};
