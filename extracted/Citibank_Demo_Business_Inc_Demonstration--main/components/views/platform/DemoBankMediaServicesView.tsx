// components/views/platform/DemoBankMediaServicesView.tsx
import React, { useState, useEffect, useReducer, useCallback, useMemo } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// SECTION: Type Definitions for a Real-World Media Services Application

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type AssetType = 'video' | 'audio' | 'image' | 'subtitle';
export type ModerationLabel = 'adult' | 'violence' | 'hate_speech' | 'self_harm';
export type ProcessingStage = 'uploading' | 'queued_for_analysis' | 'analyzing' | 'analyzed' | 'failed_analysis';

export interface EncodingProfile {
    id: string;
    name: string;
    description: string;
    codec: string;
    container: 'mp4' | 'webm' | 'mov';
    bitratesKbps: number[];
    framerate: number;
    resolution: { width: number; height: number };
    audioCodec: string;
    audioBitrateKbps: number;
    isDefault?: boolean;
    createdAt: string;
}

export interface Rendition {
    id: string;
    url: string;
    resolution: string;
    bitrateKbps: number;
    fileSizeMb: number;
}

export interface AISceneDetection {
    startTime: number; // in seconds
    endTime: number; // in seconds
    description: string;
}

export interface AITranscriptItem {
    startTime: number;
    endTime: number;
    text: string;
    confidence: number;
}

export interface AIModerationResult {
    label: ModerationLabel;
    confidence: number;
    timestamps: number[];
}

export interface AIMetadata {
    tags: string[];
    scenes: AISceneDetection[];
    transcript: AITranscriptItem[];
    moderation: AIModerationResult[];
}

export interface MediaAsset {
    id: string;
    name: string;
    type: AssetType;
    sizeMb: number;
    durationSeconds: number;
    uploadedAt: string;
    status: ProcessingStage;
    thumbnailUrl: string;
    renditions: Rendition[];
    metadata?: Partial<AIMetadata>;
}

export interface TranscodingJob {
    id: string;
    assetId: string;
    assetName: string;
    profileId: string;
    profileName: string;
    status: JobStatus;
    progress: number; // 0-100
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

// SECTION: SVG Icons (to avoid external dependencies)

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// SECTION: Mock Data and API Service

const MOCK_PROFILES: EncodingProfile[] = [
    { id: 'prof_default_4k', name: 'Default 4K Web Streaming', description: 'High-quality adaptive bitrate for 4K streaming.', codec: 'H.264', container: 'mp4', bitratesKbps: [8000, 5000, 2500], framerate: 30, resolution: { width: 3840, height: 2160 }, audioCodec: 'AAC', audioBitrateKbps: 192, isDefault: true, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'prof_default_1080p', name: 'Default 1080p Web Streaming', description: 'Standard profile for full HD content delivery.', codec: 'H.264', container: 'mp4', bitratesKbps: [4000, 2000, 1000], framerate: 30, resolution: { width: 1920, height: 1080 }, audioCodec: 'AAC', audioBitrateKbps: 128, isDefault: true, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'prof_vp9_hdr', name: 'VP9 HDR for Premium Content', description: 'High dynamic range profile using VP9 codec.', codec: 'VP9', container: 'webm', bitratesKbps: [10000, 6000, 3000], framerate: 60, resolution: { width: 3840, height: 2160 }, audioCodec: 'Opus', audioBitrateKbps: 256, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

const MOCK_ASSETS: MediaAsset[] = [
    { id: 'asset_1', name: 'Corporate_Town_Hall_Q2.mp4', type: 'video', sizeMb: 780.5, durationSeconds: 5420, uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'analyzed', thumbnailUrl: 'https://picsum.photos/seed/asset1/400/225', renditions: [{id: 'rend_1', url: '#', resolution: '1080p', bitrateKbps: 4000, fileSizeMb: 250}], metadata: { tags: ['corporate', 'town hall', 'finance', 'Q2'], transcript: [{ startTime: 0, endTime: 3, text: "Good morning everyone and welcome...", confidence: 0.98 }] } },
    { id: 'asset_2', name: 'Product_Launch_Sizzle_Reel.mov', type: 'video', sizeMb: 120.2, durationSeconds: 185, uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'analyzed', thumbnailUrl: 'https://picsum.photos/seed/asset2/400/225', renditions: [], metadata: { tags: ['product launch', 'marketing', 'technology'], moderation: [{ label: 'violence', confidence: 0.12, timestamps: [45, 92] }] } },
    { id: 'asset_3', name: 'Onboarding_Tutorial_Chapter_1.mp4', type: 'video', sizeMb: 45.8, durationSeconds: 610, uploadedAt: new Date().toISOString(), status: 'analyzing', thumbnailUrl: 'https://picsum.photos/seed/asset3/400/225', renditions: [] },
    { id: 'asset_4', name: 'Podcast_Episode_12_Audio.mp3', type: 'audio', sizeMb: 32.1, durationSeconds: 2700, uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'analyzed', thumbnailUrl: 'https://picsum.photos/seed/asset4/400/225', renditions: [], metadata: { tags: ['podcast', 'interview', 'tech leadership'] } },
];

const MOCK_JOBS: TranscodingJob[] = [
    { id: 'job_1', assetId: 'asset_1', assetName: 'Corporate_Town_Hall_Q2.mp4', profileId: 'prof_default_1080p', profileName: 'Default 1080p Web Streaming', status: 'completed', progress: 100, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), startedAt: new Date(Date.now() - 2 * 24 * 60 * 59 * 1000).toISOString(), completedAt: new Date(Date.now() - 2 * 24 * 50 * 59 * 1000).toISOString() },
    { id: 'job_2', assetId: 'asset_2', assetName: 'Product_Launch_Sizzle_Reel.mov', profileId: 'prof_default_4k', profileName: 'Default 4K Web Streaming', status: 'failed', progress: 45, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), startedAt: new Date(Date.now() - 1 * 24 * 60 * 59 * 1000).toISOString(), error: 'Incompatible source codec (ProRes 4444).' },
    { id: 'job_3', assetId: 'asset_2', assetName: 'Product_Launch_Sizzle_Reel.mov', profileId: 'prof_vp9_hdr', profileName: 'VP9 HDR for Premium Content', status: 'processing', progress: 78, createdAt: new Date().toISOString(), startedAt: new Date().toISOString() },
];

// This simulates a backend API
export const mockApiService = {
    fetchAssets: async (): Promise<MediaAsset[]> => {
        console.log("API: Fetching assets...");
        return new Promise(resolve => setTimeout(() => resolve(MOCK_ASSETS), 500));
    },
    fetchJobs: async (): Promise<TranscodingJob[]> => {
        console.log("API: Fetching jobs...");
        return new Promise(resolve => setTimeout(() => resolve(MOCK_JOBS), 500));
    },
    fetchProfiles: async (): Promise<EncodingProfile[]> => {
        console.log("API: Fetching profiles...");
        return new Promise(resolve => setTimeout(() => resolve(MOCK_PROFILES), 300));
    },
    startTranscodingJob: async (assetId: string, profileId: string): Promise<TranscodingJob> => {
        console.log(`API: Starting job for asset ${assetId} with profile ${profileId}`);
        const asset = MOCK_ASSETS.find(a => a.id === assetId)!;
        const profile = MOCK_PROFILES.find(p => p.id === profileId)!;
        const newJob: TranscodingJob = {
            id: `job_${Date.now()}`,
            assetId,
            assetName: asset.name,
            profileId,
            profileName: profile.name,
            status: 'queued',
            progress: 0,
            createdAt: new Date().toISOString(),
        };
        MOCK_JOBS.unshift(newJob); // Add to the top of the list
        return new Promise(resolve => setTimeout(() => resolve(newJob), 700));
    },
};

// SECTION: State Management using useReducer

interface MediaServiceState {
    assets: MediaAsset[];
    jobs: TranscodingJob[];
    profiles: EncodingProfile[];
    isLoading: boolean;
    error: string | null;
    activeTab: 'assets' | 'jobs' | 'profiles' | 'ai_studio';
    selectedAssetId: string | null;
}

type MediaServiceAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: { assets: MediaAsset[]; jobs: TranscodingJob[]; profiles: EncodingProfile[] } }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'SET_ACTIVE_TAB'; payload: MediaServiceState['activeTab'] }
    | { type: 'SELECT_ASSET'; payload: string | null }
    | { type: 'ADD_JOB'; payload: TranscodingJob }
    | { type: 'UPDATE_JOB_PROGRESS'; payload: { jobId: string; progress: number; status: JobStatus } }
    | { type: 'ADD_PROFILE'; payload: EncodingProfile };


const initialState: MediaServiceState = {
    assets: [],
    jobs: [],
    profiles: [],
    isLoading: true,
    error: null,
    activeTab: 'assets',
    selectedAssetId: null,
};

function mediaServiceReducer(state: MediaServiceState, action: MediaServiceAction): MediaServiceState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                assets: action.payload.assets,
                jobs: action.payload.jobs,
                profiles: action.payload.profiles,
                selectedAssetId: state.selectedAssetId ?? (action.payload.assets.length > 0 ? action.payload.assets[0].id : null),
            };
        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.payload };
        case 'SELECT_ASSET':
            return { ...state, selectedAssetId: action.payload };
        case 'ADD_JOB':
            return { ...state, jobs: [action.payload, ...state.jobs] };
        case 'UPDATE_JOB_PROGRESS':
            return {
                ...state,
                jobs: state.jobs.map(job =>
                    job.id === action.payload.jobId
                        ? { ...job, progress: action.payload.progress, status: action.payload.status, ...(action.payload.status === 'completed' && { completedAt: new Date().toISOString() }) }
                        : job
                ),
            };
        case 'ADD_PROFILE':
            return { ...state, profiles: [...state.profiles, action.payload] };
        default:
            return state;
    }
}

// SECTION: Utility Functions
export const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return [h > 0 ? h : null, m, s]
        .filter(x => x !== null)
        .map(x => String(x).padStart(2, '0'))
        .join(':');
};

export const formatBytes = (mb: number): string => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
};

export const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

// SECTION: Reusable UI Components

export const StatusBadge: React.FC<{ status: JobStatus | ProcessingStage }> = ({ status }) => {
    const statusMap: Record<JobStatus | ProcessingStage, { text: string; color: string; icon: React.ReactNode }> = {
        queued: { text: 'Queued', color: 'bg-yellow-500/20 text-yellow-300', icon: <ClockIcon className="h-4 w-4" /> },
        processing: { text: 'Processing', color: 'bg-blue-500/20 text-blue-300', icon: <CogIcon className="h-4 w-4 animate-spin" /> },
        analyzing: { text: 'Analyzing', color: 'bg-blue-500/20 text-blue-300', icon: <CogIcon className="h-4 w-4 animate-spin" /> },
        completed: { text: 'Completed', color: 'bg-green-500/20 text-green-300', icon: <CheckCircleIcon className="h-4 w-4" /> },
        analyzed: { text: 'Ready', color: 'bg-green-500/20 text-green-300', icon: <CheckCircleIcon className="h-4 w-4" /> },
        failed: { text: 'Failed', color: 'bg-red-500/20 text-red-300', icon: <XCircleIcon className="h-4 w-4" /> },
        failed_analysis: { text: 'Failed', color: 'bg-red-500/20 text-red-300', icon: <XCircleIcon className="h-4 w-4" /> },
        cancelled: { text: 'Cancelled', color: 'bg-gray-500/20 text-gray-300', icon: <XCircleIcon className="h-4 w-4" /> },
        uploading: { text: 'Uploading', color: 'bg-gray-500/20 text-gray-300', icon: <CogIcon className="h-4 w-4 animate-spin" /> },
        queued_for_analysis: { text: 'Queued', color: 'bg-yellow-500/20 text-yellow-300', icon: <ClockIcon className="h-4 w-4" /> }
    };

    const { text, color, icon } = statusMap[status] || { text: 'Unknown', color: 'bg-gray-700', icon: null };

    return (
        <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
            {icon}
            {text}
        </span>
    );
};

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
    </div>
);

// SECTION: Main Views & Components

const AIStudioView: React.FC<{ profiles: EncodingProfile[]; onProfileAdd: (p: EncodingProfile) => void }> = ({ profiles, onProfileAdd }) => {
    const [prompt, setPrompt] = useState("a high-quality preset for 4K streaming with adaptive bitrate for web");
    const [generatedProfile, setGeneratedProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedProfile(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    profileName: { type: Type.STRING, description: "A descriptive name for the profile, e.g., '4K Web Streaming'." },
                    description: { type: Type.STRING, description: "A short summary of the profile's purpose." },
                    codec: { type: Type.STRING, enum: ['H.264', 'H.265', 'VP9', 'AV1'], description: "The video codec to use." },
                    container: { type: Type.STRING, enum: ['mp4', 'webm', 'mov'], description: "The container format." },
                    bitratesKbps: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "An array of 3 video bitrates in kilobits per second, from highest to lowest quality." },
                    framerate: { type: Type.NUMBER, description: "The target video frame rate." },
                    resolution: { type: Type.OBJECT, properties: { width: {type: Type.NUMBER }, height: {type: Type.NUMBER} }, description: "The target resolution for the highest quality rendition." },
                    audioCodec: { type: Type.STRING, enum: ['AAC', 'Opus', 'MP3'], description: "The audio codec." },
                    audioBitrateKbps: { type: Type.NUMBER, description: "The target audio bitrate in kilobits per second." }
                },
                required: ["profileName", "description", "codec", "container", "bitratesKbps", "framerate", "resolution", "audioCodec", "audioBitrateKbps"]
            };
            const fullPrompt = `Generate a video encoding profile in JSON format based on this requirement: "${prompt}". Provide a complete profile matching the schema.`;
            const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedProfile(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
            setGeneratedProfile({ error: "Failed to generate profile. Please check your API key and prompt." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = () => {
        if (!generatedProfile || generatedProfile.error) return;
        const newProfile: EncodingProfile = {
            ...generatedProfile,
            id: `prof_custom_${Date.now()}`,
            createdAt: new Date().toISOString(),
            name: generatedProfile.profileName,
        };
        onProfileAdd(newProfile);
        setGeneratedProfile(null); // Clear after saving
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="AI Encoding Profile Generator">
                <p className="text-gray-400 mb-4">Describe the encoding requirements for your video, and our AI will generate a technical profile. Be specific about use case, quality, and platform (e.g., "archival quality for a museum display", "low-latency live streaming for mobile").</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., a high-quality preset for 4K streaming with adaptive bitrate for web"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Profile...' : 'Generate Profile'}
                </button>

                {(isLoading || generatedProfile) && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Generated Encoding Profile</h3>
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                            {isLoading ? 'Generating...' : JSON.stringify(generatedProfile, null, 2)}
                        </pre>
                        {generatedProfile && !generatedProfile.error && (
                            <button onClick={handleSaveProfile} className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors">
                                Save Profile
                            </button>
                        )}
                    </div>
                )}
            </Card>
            <Card title="Saved Encoding Profiles">
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {profiles.map(p => (
                        <div key={p.id} className="bg-gray-800/50 p-4 rounded-lg">
                            <h4 className="font-bold text-cyan-400">{p.name} {p.isDefault && <span className="text-xs text-gray-400 font-normal">(Default)</span>}</h4>
                            <p className="text-sm text-gray-300 mt-1">{p.description}</p>
                            <div className="text-xs text-gray-400 mt-2 font-mono grid grid-cols-2 gap-1">
                                <span>Codec: {p.codec}/{p.audioCodec}</span>
                                <span>Container: .{p.container}</span>
                                <span>Bitrates: {p.bitratesKbps.join('/')} kbps</span>
                                <span>Framerate: {p.framerate}fps</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};


const AssetDetailsPane: React.FC<{ asset: MediaAsset | undefined }> = ({ asset }) => {
    if (!asset) {
        return <Card title="Asset Details"><p className="text-gray-400">Select an asset to see its details.</p></Card>;
    }

    const [activeTab, setActiveTab] = useState<'metadata' | 'renditions' | 'ai_analysis'>('metadata');

    return (
        <Card title="Asset Details" className="h-full">
            <div className="flex flex-col h-full">
                <div className="flex-shrink-0">
                    <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-48 object-cover rounded-md mb-4" />
                    <h3 className="text-xl font-bold text-white truncate">{asset.name}</h3>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                        <StatusBadge status={asset.status} />
                        <span>{formatDuration(asset.durationSeconds)}</span>
                        <span>{formatBytes(asset.sizeMb)}</span>
                    </div>
                </div>

                <div className="border-b border-gray-700 mt-4">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('metadata')} className={`${activeTab === 'metadata' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Metadata</button>
                        <button onClick={() => setActiveTab('renditions')} className={`${activeTab === 'renditions' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Renditions</button>
                        <button onClick={() => setActiveTab('ai_analysis')} className={`${activeTab === 'ai_analysis' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>AI Analysis</button>
                    </nav>
                </div>

                <div className="flex-grow overflow-y-auto mt-4 pr-2">
                    {activeTab === 'metadata' && (
                        <dl className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-2"><dt className="text-gray-400">Asset ID</dt><dd className="col-span-2 font-mono text-gray-300">{asset.id}</dd></div>
                            <div className="grid grid-cols-3 gap-2"><dt className="text-gray-400">Type</dt><dd className="col-span-2 text-gray-300 capitalize">{asset.type}</dd></div>
                            <div className="grid grid-cols-3 gap-2"><dt className="text-gray-400">Uploaded</dt><dd className="col-span-2 text-gray-300">{new Date(asset.uploadedAt).toLocaleString()}</dd></div>
                        </dl>
                    )}
                    {activeTab === 'renditions' && (
                        asset.renditions.length > 0 ? (
                            <ul className="space-y-2">
                                {asset.renditions.map(r => (
                                    <li key={r.id} className="bg-gray-800/50 p-2 rounded-md flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-white">{r.resolution}</p>
                                            <p className="text-xs text-gray-400">{r.bitrateKbps} kbps - {r.fileSizeMb} MB</p>
                                        </div>
                                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-sm">Preview</a>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-400 text-sm">No renditions have been created for this asset yet.</p>
                    )}
                    {activeTab === 'ai_analysis' && (
                        asset.metadata ? (
                            <div className="space-y-4">
                                {asset.metadata.tags && (
                                    <div>
                                        <h4 className="font-semibold text-white mb-2">AI Generated Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {asset.metadata.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-200 text-xs font-medium px-2 py-1 rounded-full">{tag}</span>)}
                                        </div>
                                    </div>
                                )}
                                {asset.metadata.transcript && (
                                    <div>
                                        <h4 className="font-semibold text-white mb-2">Transcript</h4>
                                        <div className="max-h-60 overflow-y-auto bg-gray-900/50 p-2 rounded-md space-y-2">
                                            {asset.metadata.transcript.map((item, i) => (
                                                <p key={i} className="text-sm text-gray-300"><span className="font-mono text-cyan-400">{formatDuration(item.startTime)}:</span> {item.text}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {asset.metadata.moderation && (
                                    <div>
                                        <h4 className="font-semibold text-white mb-2">Content Moderation</h4>
                                        {asset.metadata.moderation.map((mod, i) => (
                                            <div key={i} className={`p-2 rounded-md border ${mod.confidence > 0.8 ? 'border-red-500/50 bg-red-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}>
                                                <p className="capitalize text-sm"><span className="font-bold">{mod.label.replace('_', ' ')}</span> detected with {(mod.confidence * 100).toFixed(1)}% confidence.</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : <p className="text-gray-400 text-sm">AI analysis is not available or still in progress for this asset.</p>
                    )}
                </div>
            </div>
        </Card>
    );
};


const AssetLibraryView: React.FC<{ assets: MediaAsset[]; selectedAssetId: string | null; onSelect: (id: string) => void; onNewJob: (assetId: string) => void }> = ({ assets, selectedAssetId, onSelect, onNewJob }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            <div className="lg:col-span-2 h-full flex flex-col">
                <Card title="Asset Library" className="h-full flex flex-col">
                    <div className="flex-grow overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800 sticky top-0">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Duration</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Size</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Uploaded</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 bg-gray-900/50">
                                {assets.map(asset => (
                                    <tr key={asset.id} onClick={() => onSelect(asset.id)} className={`cursor-pointer ${selectedAssetId === asset.id ? 'bg-cyan-900/30' : 'hover:bg-gray-700/50'}`}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6 flex items-center gap-3">
                                            <VideoIcon className="h-5 w-5 text-gray-400" />
                                            <span className="truncate w-48">{asset.name}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300"><StatusBadge status={asset.status} /></td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 font-mono">{formatDuration(asset.durationSeconds)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 font-mono">{formatBytes(asset.sizeMb)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{timeAgo(asset.uploadedAt)}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <button onClick={(e) => { e.stopPropagation(); onNewJob(asset.id); }} className="text-cyan-400 hover:text-cyan-300">New Job</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <div className="h-full">
                <AssetDetailsPane asset={assets.find(a => a.id === selectedAssetId)} />
            </div>
        </div>
    );
};


const JobMonitorView: React.FC<{ jobs: TranscodingJob[] }> = ({ jobs }) => {
    const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'queued');
    const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled');

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title={`Active Jobs (${activeJobs.length})`}>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {activeJobs.length > 0 ? activeJobs.map(job => (
                        <div key={job.id} className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-white truncate w-2/3">{job.assetName}</p>
                                <StatusBadge status={job.status} />
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{job.profileName}</p>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-300 mb-1">
                                    <span>Progress</span>
                                    <span>{job.progress}%</span>
                                </div>
                                <ProgressBar progress={job.progress} />
                            </div>
                        </div>
                    )) : <p className="text-gray-400">No active jobs.</p>}
                </div>
            </Card>
            <Card title="Job History">
                <div className="max-h-[600px] overflow-y-auto pr-2">
                    <table className="min-w-full divide-y divide-gray-700">
                        <tbody className="divide-y divide-gray-800">
                            {completedJobs.map(job => (
                                <tr key={job.id}>
                                    <td className="py-3 pl-1">
                                        <p className="font-medium text-white truncate w-48">{job.assetName}</p>
                                        <p className="text-xs text-gray-400 truncate w-48">{job.profileName}</p>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-300"><StatusBadge status={job.status} /></td>
                                    <td className="px-3 py-3 text-sm text-gray-300 text-right">{timeAgo(job.completedAt || job.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const CreateJobModal: React.FC<{
    asset: MediaAsset | undefined;
    profiles: EncodingProfile[];
    onClose: () => void;
    onSubmit: (assetId: string, profileId: string) => void;
    isSubmitting: boolean;
}> = ({ asset, profiles, onClose, onSubmit, isSubmitting }) => {
    const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles.find(p => p.isDefault)?.id || profiles[0]?.id || '');

    if (!asset) return null;

    const handleSubmit = () => {
        if (asset.id && selectedProfileId) {
            onSubmit(asset.id, selectedProfileId);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
                <h2 className="text-2xl font-bold text-white mb-2">Create New Transcoding Job</h2>
                <p className="text-gray-400 mb-6">Asset: <span className="font-semibold text-gray-200">{asset.name}</span></p>

                <div className="space-y-4">
                    <label htmlFor="profile" className="block text-sm font-medium text-gray-300">Select an Encoding Profile</label>
                    <select
                        id="profile"
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        className="w-full bg-gray-700/50 p-3 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {profiles.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    {selectedProfileId && (
                        <div className="bg-gray-900/50 p-3 rounded-md text-xs text-gray-400">
                            <p>{profiles.find(p => p.id === selectedProfileId)?.description}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded transition-colors text-white">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting || !selectedProfileId} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors text-white">
                        {isSubmitting ? 'Starting Job...' : 'Start Job'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const DemoBankMediaServicesView: React.FC = () => {
    const [state, dispatch] = useReducer(mediaServiceReducer, initialState);
    const { assets, jobs, profiles, isLoading, error, activeTab, selectedAssetId } = state;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobToCreateForAssetId, setJobToCreateForAssetId] = useState<string | null>(null);
    const [isSubmittingJob, setIsSubmittingJob] = useState(false);
    
    useEffect(() => {
        const loadData = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                const [assetsData, jobsData, profilesData] = await Promise.all([
                    mockApiService.fetchAssets(),
                    mockApiService.fetchJobs(),
                    mockApiService.fetchProfiles(),
                ]);
                dispatch({ type: 'FETCH_SUCCESS', payload: { assets: assetsData, jobs: jobsData, profiles: profilesData } });
            } catch (e) {
                dispatch({ type: 'FETCH_ERROR', payload: 'Failed to load media service data.' });
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        // Simulate real-time job progress updates
        const interval = setInterval(() => {
            const processingJob = state.jobs.find(j => j.status === 'processing');
            if (processingJob && processingJob.progress < 100) {
                const newProgress = Math.min(100, processingJob.progress + Math.floor(Math.random() * 10) + 5);
                dispatch({
                    type: 'UPDATE_JOB_PROGRESS',
                    payload: {
                        jobId: processingJob.id,
                        progress: newProgress,
                        status: newProgress === 100 ? 'completed' : 'processing',
                    }
                });
            } else {
                const queuedJob = state.jobs.find(j => j.status === 'queued');
                if (queuedJob) {
                    dispatch({
                        type: 'UPDATE_JOB_PROGRESS',
                        payload: {
                            jobId: queuedJob.id,
                            progress: 0,
                            status: 'processing',
                        }
                    });
                }
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [state.jobs]);

    const handleTabClick = (tab: MediaServiceState['activeTab']) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    };

    const handleSelectAsset = useCallback((id: string) => {
        dispatch({ type: 'SELECT_ASSET', payload: id });
    }, []);

    const handleNewJobClick = useCallback((assetId: string) => {
        setJobToCreateForAssetId(assetId);
        setIsModalOpen(true);
    }, []);
    
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setJobToCreateForAssetId(null);
    }, []);

    const handleSubmitJob = useCallback(async (assetId: string, profileId: string) => {
        setIsSubmittingJob(true);
        try {
            const newJob = await mockApiService.startTranscodingJob(assetId, profileId);
            dispatch({ type: 'ADD_JOB', payload: newJob });
        } catch (err) {
            console.error("Failed to submit job", err);
        } finally {
            setIsSubmittingJob(false);
            handleCloseModal();
        }
    }, [handleCloseModal]);
    
    const handleAddProfile = useCallback((profile: EncodingProfile) => {
        dispatch({type: 'ADD_PROFILE', payload: profile });
    }, []);

    const TABS: { id: MediaServiceState['activeTab']; name: string }[] = [
        { id: 'assets', name: 'Asset Library' },
        { id: 'jobs', name: 'Job Monitor' },
        { id: 'ai_studio', name: 'AI Studio' },
    ];

    const selectedAssetForModal = useMemo(() => assets.find(a => a.id === jobToCreateForAssetId), [assets, jobToCreateForAssetId]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Media Services</h2>
                {activeTab === 'assets' && <button className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors text-white">Upload New Asset</button>}
            </div>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => handleTabClick(tab.id)} className={`${activeTab === tab.id ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {isLoading && <p className="text-white text-center">Loading Media Services...</p>}
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {!isLoading && !error && (
                <div>
                    {activeTab === 'assets' && <AssetLibraryView assets={assets} selectedAssetId={selectedAssetId} onSelect={handleSelectAsset} onNewJob={handleNewJobClick} />}
                    {activeTab === 'jobs' && <JobMonitorView jobs={jobs} />}
                    {activeTab === 'ai_studio' && <AIStudioView profiles={profiles} onProfileAdd={handleAddProfile} />}
                </div>
            )}
            
            {isModalOpen && (
                <CreateJobModal
                    asset={selectedAssetForModal}
                    profiles={profiles}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitJob}
                    isSubmitting={isSubmittingJob}
                />
            )}
        </div>
    );
};

export default DemoBankMediaServicesView;