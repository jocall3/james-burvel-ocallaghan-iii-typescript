// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from 'react';
import JSZip from 'jszip';
import { getAllFiles } from '../services/index.ts';
import { ArrowDownTrayIcon } from './icons.tsx';
import { LoadingSpinner } from './shared/index.tsx';


export const ActionManager: React.FC = () => {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleDownloadSource = async () => {
        setIsLoading('zip');
        try {
            const zip = new JSZip();
            
            const generatedFiles = await getAllFiles();
            if (generatedFiles.length > 0) {
                const generatedFolder = zip.folder('generated');
                generatedFiles.forEach(file => {
                    generatedFolder?.file(file.filePath, file.content);
                });
            } else {
                alert("No generated files to download.");
                setIsLoading(null);
                return;
            }
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = 'devcore-ai-toolkit-generated-files.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to create ZIP file", error);
            alert(`Error creating ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="absolute top-24 right-6 z-10">
            <button
                onClick={handleDownloadSource}
                disabled={!!isLoading}
                className="w-14 h-14 bg-primary text-background rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:brightness-110 transition-all disabled:bg-surface-hover disabled:text-text-secondary"
                aria-label="Download Generated Files"
                title="Download Generated Files"
            >
                {isLoading === 'zip' ? <LoadingSpinner /> : <ArrowDownTrayIcon />}
            </button>
        </div>
    );
};
