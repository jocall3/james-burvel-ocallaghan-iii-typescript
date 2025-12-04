// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useRef } from 'react';
import type { StoryDocument, AppState, RobotState, EditorActions, PageHandlers } from '../../types';
import * as gemini from '../../services/geminiService_story';
import { createPdf } from '../../services/pdfService';
import { APP_TITLE } from '../../constants.ts';
import { BookOpenIcon, DownloadIcon, BackArrowIcon } from '../icons.tsx';
import Loader from './story-scaffolding/Loader';
import DataInput from './story-scaffolding/DataInput';
import StoryEditor from './story-scaffolding/StoryViewer';
import Robot from './story-scaffolding/Robot';

const PAGE_CHUNK_SIZE = 3200; // ~3200 tokens per page as per blueprint

export const AiStoryScaffolding: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('INPUT');
    const [storyDocument, setStoryDocument] = useState<StoryDocument | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState({ active: false, completed: 0, total: 0 });
    const generationController = useRef<AbortController | null>(null);

    // Robot State
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [robotState, setRobotState] = useState<RobotState>('idle');

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleReset = () => {
        if (generationController.current) generationController.current.abort();
        setAppState('INPUT');
        setStoryDocument(null);
        setError(null);
        setIsLoading(false);
        setGenerationStatus({ active: false, completed: 0, total: 0 });
        setRobotState('idle');
    };

    const handleScaffoldGeneration = async (data: string, mood: string) => {
        setIsLoading(true);
        setLoadingMessage('Analyzing document...');
        setError(null);
        setRobotState('thinking');

        try {
            const chunks: string[] = [];
            for (let i = 0; i < data.length; i += PAGE_CHUNK_SIZE) {
                chunks.push(data.substring(i, i + PAGE_CHUNK_SIZE));
            }
            if (chunks.length === 0) throw new Error("No text data to process.");

            setLoadingMessage('Generating story title...');
            const title = await gemini.generateStoryTitle(chunks[0]);
            
            const doc: StoryDocument = { id: crypto.randomUUID(), title, mood, chapters: [] };
            const chapterChunks = chunks.reduce((acc, chunk, i) => {
                const chapterIndex = Math.floor(i / 5); // Group chunks into chapters of ~5 pages
                if (!acc[chapterIndex]) acc[chapterIndex] = [];
                acc[chapterIndex].push(chunk);
                return acc;
            }, [] as string[][]);

            doc.chapters = chapterChunks.map((_, i) => ({
                id: crypto.randomUUID(),
                title: `Chapter ${i + 1} (pending...)`,
                summary: 'AI summary will appear here.',
                pages: [],
            }));

            setStoryDocument(doc);
            setGenerationStatus({ active: true, completed: 0, total: chapterChunks.length });
            setAppState('EDITING');
            setIsLoading(false);
            
            startChapterGeneration(doc.id, chapterChunks);

        } catch (err) {
            console.error(err);
            setError('Failed to generate a story scaffold. Please try again.');
            handleReset();
        }
    };
    
    const startChapterGeneration = async (docId: string, chapterChunks: string[][]) => {
        generationController.current = new AbortController();
        const { signal } = generationController.current;
        setRobotState('writing');

        for (let i = 0; i < chapterChunks.length; i++) {
            if (signal.aborted) {
                setGenerationStatus(s => ({ ...s, active: false }));
                setRobotState('idle');
                return;
            }
            try {
                const chapter = await gemini.generateChapterFromChunk(chapterChunks[i], i + 1, chapterChunks.length, storyDocument?.title || 'Untitled');
                setStoryDocument(doc => {
                    if (!doc || doc.id !== docId) return doc;
                    const newChapters = [...doc.chapters];
                    newChapters[i] = chapter;
                    return { ...doc, chapters: newChapters };
                });
                setGenerationStatus(s => ({ ...s, completed: i + 1 }));
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') return;
                console.error(`Failed to generate chapter ${i + 1}`, err);
                setStoryDocument(doc => {
                    if (!doc) return null;
                    doc.chapters[i].title = `Chapter ${i+1} (Failed)`;
                    return { ...doc };
                });
            }
        }
        setGenerationStatus({ active: false, completed: chapterChunks.length, total: chapterChunks.length });
        setRobotState('idle');
    };

    const handleStopGeneration = () => generationController.current?.abort();

    const handleContinueGeneration = () => {
        alert("Resuming generation is a complex feature! For now, you can manually complete the story.");
    };

    const runPageAction = async <T,>(originalRobotState: RobotState, action: () => Promise<T>) => {
        setRobotState(originalRobotState);
        try {
            await action();
        } catch (err) {
            console.error("Page action failed", err);
            setError("An AI action failed. Please try again.");
        } finally {
            setRobotState('idle');
        }
    };
    
    const pageHandlers: PageHandlers = {
        onUpdatePage: (chapterId, pageId, updates) => {
            setStoryDocument(doc => {
                if (!doc) return null;
                return {
                    ...doc,
                    chapters: doc.chapters.map(c => c.id === chapterId ? {
                        ...c,
                        pages: c.pages.map(p => p.id === pageId ? { ...p, ...updates } : p)
                    } : c)
                };
            });
        },
        onExpandTextStream: async (chapterId, pageId) => {
             await runPageAction('writing', async () => {
                 const chapter = storyDocument?.chapters.find(c => c.id === chapterId);
                 const page = chapter?.pages.find(p => p.id === pageId);
                 if (!page) return;
                 const stream = gemini.expandPageTextStream(page.page_text);
                 for await (const chunk of stream) {
                     setStoryDocument(doc => {
                        if (!doc) return null;
                        return {
                            ...doc,
                            chapters: doc.chapters.map(c => c.id === chapterId ? {
                                ...c,
                                pages: c.pages.map(p => p.id === pageId ? { ...p, page_text: p.page_text + chunk } : p)
                            } : c)
                        };
                     });
                 }
            });
        },
        onGenerateImage: async (chapterId, pageId) => {
            await runPageAction('illustrating', async () => {
                const chapter = storyDocument?.chapters.find(c => c.id === chapterId);
                const page = chapter?.pages.find(p => p.id === pageId);
                if (!page || !storyDocument) return;
                const imageUrl = await gemini.generatePageImage(page.page_text || page.ai_suggestions[0] || "A fantasy landscape", storyDocument.mood);
                if (imageUrl) {
                    pageHandlers.onUpdatePage(chapterId, pageId, { images: [...page.images, imageUrl] });
                }
            });
        },
        onAutoWritePageStream: async (chapterId, pageId) => {
            await runPageAction('writing', async () => {
                 pageHandlers.onUpdatePage(chapterId, pageId, { page_text: '' }); // Clear text first
                 const stream = gemini.autoWritePageStream(storyDocument?.title || '', storyDocument?.chapters.find(c=>c.id === chapterId)?.title || '', storyDocument?.chapters.find(c => c.id === chapterId)?.pages.find(p => p.id === pageId)?.ai_suggestions.join(' ') || '');
                 for await (const chunk of stream) {
                     setStoryDocument(doc => {
                        if (!doc) return null;
                        return {
                            ...doc,
                            chapters: doc.chapters.map(c => c.id === chapterId ? {
                                ...c,
                                pages: c.pages.map(p => p.id === pageId ? { ...p, page_text: p.page_text + chunk } : p)
                            } : c)
                        };
                     });
                 }
            });
        }
    };

    const editorActions: EditorActions = {
       onAutoDraftAll: async () => {
            if (!storyDocument) return;
            setRobotState('writing');
            try {
                for (const chapter of storyDocument.chapters) {
                    for (const page of chapter.pages) {
                        if (!page.page_text.trim()) {
                            await pageHandlers.onAutoWritePageStream(chapter.id, page.id);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Auto-drafting failed.");
            } finally {
                setRobotState('idle');
            }
        },
        onSuggestTitles: async () => {
            if (!storyDocument) return;
            await runPageAction('thinking', async () => {
                const newTitles = await gemini.suggestNewChapterTitles(storyDocument);
                setStoryDocument(doc => {
                    if (!doc) return null;
                    return {
                        ...doc,
                        chapters: doc.chapters.map((c, i) => ({ ...c, title: newTitles[i] || c.title }))
                    };
                });
            });
        },
        onSummarizeChapters: async () => {
             if (!storyDocument) return;
             await runPageAction('thinking', async () => {
                const summaries = await gemini.generateChapterSummaries(storyDocument);
                 setStoryDocument(doc => {
                    if (!doc) return null;
                    return {
                        ...doc,
                        chapters: doc.chapters.map((c, i) => ({ ...c, summary: summaries[i] || c.summary }))
                    };
                });
            });
        }
    };

    const handlePdfDownload = () => {
        if (!storyDocument) return;
        setIsLoading(true);
        setLoadingMessage('Generating PDF...');
        setRobotState('thinking');
        try {
            createPdf(storyDocument);
        } catch (err) {
            console.error(err);
            setError('Failed to create PDF.');
        } finally {
            setIsLoading(false);
            setRobotState('idle');
        }
    };
    
    const renderContent = () => {
        if (isLoading) return <Loader message={loadingMessage} />;
        switch (appState) {
            case 'INPUT': return <DataInput onProcess={handleScaffoldGeneration} />;
            case 'EDITING': return storyDocument ? (
                 <StoryEditor
                    doc={storyDocument} 
                    setDoc={setStoryDocument}
                    pageHandlers={pageHandlers}
                    editorActions={editorActions}
                    generationStatus={generationStatus}
                    onStopGeneration={handleStopGeneration}
                    onContinueGeneration={handleContinueGeneration}
                 />
            ) : <Loader message="Loading editor..." />;
            default: return <DataInput onProcess={handleScaffoldGeneration} />;
        }
    };

    return (
        <div className="text-gray-100 font-sans h-full bg-gray-900">
            <Robot robotState={robotState} mousePosition={mousePosition} />
            <div className="min-h-full p-4 sm:p-6 lg:p-8">
                <div className="max-w-[120rem] mx-auto">
                    <header className="flex justify-between items-center mb-6">
                        <div className="flex items-center space-x-3">
                            <BookOpenIcon className="w-8 h-8 text-violet-400" />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                                {APP_TITLE}
                            </h1>
                        </div>
                         {appState !== 'INPUT' && (
                             <div className="flex items-center gap-4">
                                <button onClick={handlePdfDownload} className="flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-semibold transition-colors"><DownloadIcon className="w-4 h-4"/><span>Export PDF</span></button>
                                <button onClick={handleReset} className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"><BackArrowIcon className="w-4 h-4"/><span>Start Over</span></button>
                             </div>
                        )}
                    </header>
                    <main className="bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700/50 min-h-[calc(100vh-12rem)] overflow-hidden">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg m-6 relative" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">&times;</button>
                            </div>
                        )}
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};
