// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useRef } from 'react';
import { generateImageCaption } from '../../services/api';
import { fileToBase64, blobToDataURL } from '../../services/fileUtils';
import { ImageGeneratorIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const AutomatedImageCaptioning: React.FC = () => {
    const [image, setImage] = useState<{ base64: string; dataUrl: string; mimeType: string } | null>(null);
    const [caption, setCaption] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = useCallback(async (img: { base64: string; mimeType: string }) => {
        setIsLoading(true);
        setError('');
        setCaption('');
        try {
            const result = await generateImageCaption(img.base64, img.mimeType);
            setCaption(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processImage = async (file: File) => {
        const [dataUrl, base64] = await Promise.all([blobToDataURL(file), fileToBase64(file)]);
        const imgData = { dataUrl, base64, mimeType: file.type };
        setImage(imgData);
        handleGenerate(imgData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processImage(file);
    };

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ImageGeneratorIcon />
                    <span className="ml-3">AI Image Captioning</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate descriptive captions and alt-text for your images.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col items-center justify-center bg-surface p-6 rounded-lg border-2 border-dashed border-border">
                    {image ? (
                        <img src={image.dataUrl} alt="Uploaded" className="max-w-full max-h-full object-contain rounded-md" />
                    ) : (
                        <div className="text-center">
                            <p className="mb-4">Upload an image to get started.</p>
                            <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                                Select Image
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Caption & Alt-Text</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {caption && <p>{caption}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
