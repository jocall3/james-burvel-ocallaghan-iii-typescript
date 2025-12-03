import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// Define comprehensive interfaces for the application's data models
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    bio: string;
    memberSince: string;
    preferredGenre: string;
    preferredInstruments: string[];
    allowPublicGenerations: boolean;
    storageUsedGB: number;
    maxStorageGB: number;
    subscriptionLevel: 'Free' | 'Pro' | 'Enterprise';
    lastLogin: string;
}

export interface Composition {
    id: string;
    userId: string;
    title: string;
    description: string;
    instrumentation: string[];
    genre: string;
    mood: string;
    tempo: number; // BPM
    keySignature: string; // e.g., "C Major", "A Minor"
    durationSeconds: number; // Simulated duration
    audioUrl: string; // Simulated audio URL (local path or external URL)
    waveformJson: string; // Simulated waveform data (JSON string for peaks)
    midiData?: string; // Simulated MIDI data (Base64 or URL)
    createdAt: string;
    lastModifiedAt: string;
    isPublic: boolean;
    tags: string[];
    versionHistory: CompositionVersion[];
    remixSourceId?: string; // If this composition is a remix of another
    likes: number;
    comments: Comment[];
    playCount: number;
    downloadCount: number;
    modelUsed: string; // Which AI model generated this
    originalPrompt: string; // The exact prompt used for generation
    generationParameters: GenerationParameters; // Detailed parameters used
}

export interface CompositionVersion {
    versionId: string;
    promptUsed: string;
    parameters: GenerationParameters;
    generatedAt: string;
    audioUrl: string; // Specific audio for this version
    midiUrl?: string;
    notes?: string; // e.g., "Adjusted tempo, added reverb"
}

export interface Comment {
    id: string;
    userId: string;
    username: string;
    text: string;
    createdAt: string;
    avatarUrl: string;
}

export interface GenerationParameters {
    genre: string;
    mood: string;
    tempoRange: [number, number]; // min, max BPM
    instrumentationPreference: string[];
    durationPreference: [number, number]; // min, max seconds
    keySignaturePreference: string;
    creativityTemperature: number; // 0.1 to 1.0, higher means more adventurous
    diversityPenalty: number; // 0.0 to 2.0, higher means less repetitive
    model: string;
    outputFormat: 'audio' | 'midi' | 'description'; // New: control output type
    styleReferenceId?: string; // ID of a composition to use as a style reference
}

export interface Project {
    id: string;
    userId: string;
    name: string;
    description: string;
    compositionIds: string[];
    createdAt: string;
    lastModifiedAt: string;
    isShared: boolean; // Can this project be shared?
    sharedWithUserIds?: string[];
}

export interface AppSettings {
    theme: 'dark' | 'light';
    defaultGenre: string;
    defaultInstrumentation: string[];
    autoSave: boolean;
    notificationsEnabled: boolean;
    audioQuality: 'low' | 'medium' | 'high';
    defaultOutputFormat: 'audio' | 'midi' | 'description';
    onboardingComplete: boolean;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'new_like' | 'new_comment' | 'system' | 'update_available';
    message: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
    icon?: string; // e.g., SVG path or emoji
}

export interface PlaybackState {
    currentCompositionId: string | null;
    isPlaying: boolean;
    currentTime: number; // in seconds
    duration: number; // in seconds
    volume: number; // 0.0 to 1.0
    isMuted: boolean;
    loop: boolean;
    shuffle: boolean;
    playbackSpeed: number; // 0.5x, 1x, 1.5x, 2x
    reverbAmount: number; // Simulated effect
    delayAmount: number; // Simulated effect
}

export interface UserStats {
    totalCompositions: number;
    publicCompositions: number;
    totalPlaybacks: number;
    totalLikesReceived: number;
    last7DaysGenerations: number[]; // Array of daily counts
    mostUsedGenre: string;
    mostUsedInstrument: string;
}

// Utility functions (exported for potential external use)
export const generateUniqueId = (): string => `sa_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
export const formatDuration = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Mock Data (to simulate a backend)
export const MOCK_USER: UserProfile = {
    id: 'user-123',
    username: 'SonicAlchemist',
    email: 'user@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    bio: 'Explorer of soundscapes and AI-driven melodies. Passionate about ambient and electronic music.',
    memberSince: '2023-01-15T10:00:00Z',
    preferredGenre: 'Ambient',
    preferredInstruments: ['Synthesizer', 'Pad', 'Drums'],
    allowPublicGenerations: true,
    storageUsedGB: 1.2,
    maxStorageGB: 10,
    subscriptionLevel: 'Pro',
    lastLogin: new Date().toISOString(),
};

export const MOCK_COMPOSITIONS_DATA: Composition[] = [
    {
        id: 'comp-001',
        userId: MOCK_USER.id,
        title: 'Echoes of a Forgotten Star',
        description: 'A deep space ambient piece with shimmering synthesizers, a slow, evolving bassline, and subtle percussive textures.',
        instrumentation: ['Synthesizer', 'Pad', 'Drums (light percussion)', 'Bass'],
        genre: 'Ambient',
        mood: 'Ethereal',
        tempo: 80,
        keySignature: 'C Minor',
        durationSeconds: 180,
        audioUrl: '/audio/echoes.mp3', // Placeholder, in real app this would be a URL to actual generated audio
        waveformJson: '{"peaks": [0.1, 0.3, 0.5, 0.4, 0.2, 0.1, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1], "sampleRate": 44100}',
        midiData: 'data:audio/midi;base64,TVRoZAAAA... (truncated)',
        createdAt: '2023-03-10T14:30:00Z',
        lastModifiedAt: '2023-03-10T14:30:00Z',
        isPublic: true,
        tags: ['ambient', 'space', 'cinematic', 'meditative'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 15,
        comments: [
            { id: generateUniqueId(), userId: 'user-other-1', username: 'SoundExplorer', text: 'Absolutely love the pads on this one! So atmospheric.', createdAt: '2023-03-11T10:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
            { id: generateUniqueId(), userId: MOCK_USER.id, username: MOCK_USER.username, text: 'Thanks! Tried to capture the vastness of space.', createdAt: '2023-03-11T10:30:00Z', avatarUrl: MOCK_USER.avatarUrl },
        ],
        playCount: 120,
        downloadCount: 5,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A deep space ambient piece with shimmering synthesizers and a slow, evolving bassline.',
        generationParameters: {
            genre: 'Ambient', mood: 'Ethereal', tempoRange: [70, 90], instrumentationPreference: ['Synthesizer', 'Pad', 'Drums', 'Bass'],
            durationPreference: [150, 210], keySignaturePreference: 'C Minor', creativityTemperature: 0.7, diversityPenalty: 0.5,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-002',
        userId: MOCK_USER.id,
        title: 'Rainy Day Reverie',
        description: 'A melancholic but hopeful piano piece for a rainy day, with subtle string accompaniment. Perfect for introspection.',
        instrumentation: ['Piano', 'Violin', 'Cello'],
        genre: 'Classical Crossover',
        mood: 'Melancholic, Hopeful',
        tempo: 65,
        keySignature: 'G Minor',
        durationSeconds: 120,
        audioUrl: '/audio/rainy_reverie.mp3', // Placeholder
        waveformJson: '{"peaks": [0.2, 0.4, 0.6, 0.5, 0.3, 0.2, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2], "sampleRate": 44100}',
        midiData: 'data:audio/midi;base64,TVRoZAAAA... (truncated)',
        createdAt: '2023-03-12T09:15:00Z',
        lastModifiedAt: '2023-03-12T09:15:00Z',
        isPublic: false,
        tags: ['piano', 'sad', 'hopeful', 'emotional'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 8,
        comments: [],
        playCount: 80,
        downloadCount: 2,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A melancholic but hopeful piano piece for a rainy day.',
        generationParameters: {
            genre: 'Classical Crossover', mood: 'Melancholic', tempoRange: [60, 70], instrumentationPreference: ['Piano', 'Violin', 'Cello'],
            durationPreference: [90, 150], keySignaturePreference: 'G Minor', creativityTemperature: 0.6, diversityPenalty: 0.7,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-003',
        userId: MOCK_USER.id,
        title: 'Cyberpunk Alley Groove',
        description: 'A gritty, futuristic electronic track with heavy synth bass, driving beats, and atmospheric textures. Evokes neon-lit streets.',
        instrumentation: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine', 'Sampler'],
        genre: 'Electronic',
        mood: 'Gritty, Energetic',
        tempo: 128,
        keySignature: 'E Minor',
        durationSeconds: 210,
        audioUrl: '/audio/cyberpunk.mp3', // Placeholder
        waveformJson: '{"peaks": [0.3, 0.6, 0.8, 0.7, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4], "sampleRate": 44100}',
        midiData: 'data:audio/midi;base64,TVRoZAAAA... (truncated)',
        createdAt: '2023-03-15T18:00:00Z',
        lastModifiedAt: '2023-03-15T18:00:00Z',
        isPublic: true,
        tags: ['electronic', 'synthwave', 'cyberpunk', 'dance', 'futuristic'],
        versionHistory: [
            {
                versionId: generateUniqueId(),
                promptUsed: 'Original prompt for Cyberpunk Alley Groove.',
                parameters: {
                    genre: 'Electronic', mood: 'Gritty', tempoRange: [120, 130], instrumentationPreference: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine'],
                    durationPreference: [180, 240], keySignaturePreference: 'E Minor', creativityTemperature: 0.8, diversityPenalty: 0.4,
                    model: 'music-model-beta', outputFormat: 'audio'
                },
                generatedAt: '2023-03-15T18:00:00Z',
                audioUrl: '/audio/cyberpunk_v1.mp3',
                notes: 'Initial generation, slightly too chaotic.'
            },
            {
                versionId: generateUniqueId(),
                promptUsed: 'Remix Cyberpunk Alley Groove, add more atmospheric sampler textures and refine the bassline.',
                parameters: {
                    genre: 'Electronic', mood: 'Gritty', tempoRange: [125, 130], instrumentationPreference: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine', 'Sampler'],
                    durationPreference: [180, 240], keySignaturePreference: 'E Minor', creativityTemperature: 0.75, diversityPenalty: 0.5,
                    model: 'music-model-beta', outputFormat: 'audio'
                },
                generatedAt: '2023-03-16T10:00:00Z',
                audioUrl: '/audio/cyberpunk.mp3',
                notes: 'Second version, improved texture and bass clarity.'
            }
        ],
        remixSourceId: undefined,
        likes: 25,
        comments: [
            { id: generateUniqueId(), userId: 'user-other-2', username: 'BeatMaster', text: 'This slaps! Instant playlist add.', createdAt: '2023-03-16T12:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
            { id: generateUniqueId(), userId: 'user-other-3', username: 'NightRider', text: 'Perfect for driving through a neon city.', createdAt: '2023-03-16T14:30:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
        ],
        playCount: 250,
        downloadCount: 12,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A gritty, futuristic electronic track with heavy synth bass, driving beats, and atmospheric textures.',
        generationParameters: {
            genre: 'Electronic', mood: 'Gritty, Energetic', tempoRange: [120, 130], instrumentationPreference: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine', 'Sampler'],
            durationPreference: [180, 240], keySignaturePreference: 'E Minor', creativityTemperature: 0.8, diversityPenalty: 0.4,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    // Add more mock compositions for variety and line count
    {
        id: 'comp-004',
        userId: MOCK_USER.id,
        title: 'Forest Whispers',
        description: 'A tranquil acoustic guitar piece, evoking images of a peaceful forest at dawn with subtle bird sounds.',
        instrumentation: ['Acoustic Guitar', 'Flute (light)', 'Field Recordings (birds, wind)'],
        genre: 'Folk Ambient',
        mood: 'Peaceful, Natural',
        tempo: 70,
        keySignature: 'D Major',
        durationSeconds: 150,
        audioUrl: '/audio/forest.mp3',
        waveformJson: '{"peaks": [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.1, 0.2, 0.1, 0.05], "sampleRate": 44100}',
        createdAt: '2023-03-20T11:00:00Z',
        lastModifiedAt: '2023-03-20T11:00:00Z',
        isPublic: true,
        tags: ['acoustic', 'nature', 'meditative', 'folk'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 10,
        comments: [],
        playCount: 90,
        downloadCount: 3,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A tranquil acoustic guitar piece, evoking images of a peaceful forest at dawn.',
        generationParameters: {
            genre: 'Folk Ambient', mood: 'Peaceful', tempoRange: [65, 75], instrumentationPreference: ['Acoustic Guitar', 'Flute', 'Field Recordings'],
            durationPreference: [120, 180], keySignaturePreference: 'D Major', creativityTemperature: 0.6, diversityPenalty: 0.8,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-005',
        userId: MOCK_USER.id,
        title: 'Urban Sunset',
        description: 'A chill-hop track with laid-back drums, warm Rhodes chords, and a soulful bassline, perfect for unwinding after a long day.',
        instrumentation: ['Drums (Hip-Hop)', 'Rhodes Piano', 'Electric Bass', 'Synthesizer (Pad)'],
        genre: 'Lo-Fi Hip-Hop',
        mood: 'Relaxed, Groovy',
        tempo: 90,
        keySignature: 'F Minor',
        durationSeconds: 165,
        audioUrl: '/audio/sunset.mp3',
        waveformJson: '{"peaks": [0.2, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05], "sampleRate": 44100}',
        createdAt: '2023-03-25T17:45:00Z',
        lastModifiedAt: '2023-03-25T17:45:00Z',
        isPublic: false,
        tags: ['lofi', 'chillhop', 'hiphop', 'jazzy', 'relaxing'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 18,
        comments: [],
        playCount: 150,
        downloadCount: 7,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A chill-hop track with laid-back drums, warm Rhodes chords, and a soulful bassline, perfect for unwinding.',
        generationParameters: {
            genre: 'Lo-Fi Hip-Hop', mood: 'Relaxed', tempoRange: [85, 95], instrumentationPreference: ['Drums', 'Rhodes Piano', 'Electric Bass', 'Synthesizer'],
            durationPreference: [150, 180], keySignaturePreference: 'F Minor', creativityTemperature: 0.7, diversityPenalty: 0.6,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-006',
        userId: MOCK_USER.id,
        title: 'Ancient Echoes',
        description: 'A powerful cinematic orchestral piece, featuring epic strings, brass, and percussion, building to a dramatic climax.',
        instrumentation: ['Orchestral Strings', 'Brass Ensemble', 'Percussion (Timpani, Taiko)', 'Choir (Subtle)'],
        genre: 'Cinematic',
        mood: 'Epic, Dramatic',
        tempo: 100,
        keySignature: 'D Minor',
        durationSeconds: 300,
        audioUrl: '/audio/ancient.mp3',
        waveformJson: '{"peaks": [0.1, 0.3, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3, 0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3], "sampleRate": 44100}',
        createdAt: '2023-03-28T08:00:00Z',
        lastModifiedAt: '2023-03-28T08:00:00Z',
        isPublic: true,
        tags: ['orchestral', 'film score', 'epic', 'soundtrack', 'fantasy'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 30,
        comments: [
            { id: generateUniqueId(), userId: 'user-other-4', username: 'FilmScorer', text: 'This would be perfect for a fantasy movie trailer!', createdAt: '2023-03-29T10:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
        ],
        playCount: 300,
        downloadCount: 20,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A powerful cinematic orchestral piece, featuring epic strings, brass, and percussion, building to a dramatic climax.',
        generationParameters: {
            genre: 'Cinematic', mood: 'Epic, Dramatic', tempoRange: [90, 110], instrumentationPreference: ['Orchestral Strings', 'Brass Ensemble', 'Percussion', 'Choir'],
            durationPreference: [270, 330], keySignaturePreference: 'D Minor', creativityTemperature: 0.9, diversityPenalty: 0.3,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    // Adding more public compositions from other users for community feed simulation
    {
        id: 'comp-007',
        userId: 'user-other-1',
        title: 'Sunset Drive',
        description: 'Retro synthwave track, perfect for an evening cruise down a virtual highway.',
        instrumentation: ['Analog Synth', 'Drum Machine (80s)', 'Synth Bass'],
        genre: 'Electronic',
        mood: 'Retro, Energetic',
        tempo: 120,
        keySignature: 'C Major',
        durationSeconds: 240,
        audioUrl: '/audio/sunset_drive.mp3', // Placeholder
        waveformJson: '{"peaks": [0.4, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2], "sampleRate": 44100}',
        createdAt: '2023-04-01T10:00:00Z',
        lastModifiedAt: '2023-04-01T10:00:00Z',
        isPublic: true,
        tags: ['synthwave', '80s', 'electronic', 'driving'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 45,
        comments: [],
        playCount: 400,
        downloadCount: 15,
        modelUsed: 'music-model-beta',
        originalPrompt: 'Retro synthwave track, perfect for an evening cruise down a virtual highway.',
        generationParameters: {
            genre: 'Electronic', mood: 'Retro, Energetic', tempoRange: [115, 125], instrumentationPreference: ['Analog Synth', 'Drum Machine', 'Synth Bass'],
            durationPreference: [200, 280], keySignaturePreference: 'C Major', creativityTemperature: 0.8, diversityPenalty: 0.4,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-008',
        userId: 'user-other-2',
        title: 'Morning Dew Drops',
        description: 'A delicate and serene piano solo, reminiscent of a calm morning with dew drops on leaves.',
        instrumentation: ['Piano'],
        genre: 'Classical',
        mood: 'Serene, Delicate',
        tempo: 55,
        keySignature: 'F Major',
        durationSeconds: 90,
        audioUrl: '/audio/morning_dew.mp3', // Placeholder
        waveformJson: '{"peaks": [0.05, 0.1, 0.15, 0.1, 0.08, 0.05, 0.02, 0.05, 0.08, 0.1, 0.15, 0.1, 0.08, 0.05, 0.02, 0.01], "sampleRate": 44100}',
        createdAt: '2023-04-05T14:30:00Z',
        lastModifiedAt: '2023-04-05T14:30:00Z',
        isPublic: true,
        tags: ['piano', 'solo', 'calm', 'meditative'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 20,
        comments: [],
        playCount: 180,
        downloadCount: 8,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A delicate and serene piano solo, reminiscent of a calm morning with dew drops on leaves.',
        generationParameters: {
            genre: 'Classical', mood: 'Serene', tempoRange: [50, 60], instrumentationPreference: ['Piano'],
            durationPreference: [80, 100], keySignaturePreference: 'F Major', creativityTemperature: 0.5, diversityPenalty: 0.9,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-009',
        userId: 'user-other-3',
        title: 'The Great Journey',
        description: 'An uplifting orchestral piece with powerful swells and soaring melodies, ideal for adventure themes.',
        instrumentation: ['Strings', 'Brass', 'Woodwinds', 'Percussion', 'Choir'],
        genre: 'Cinematic',
        mood: 'Uplifting, Adventurous',
        tempo: 110,
        keySignature: 'A Major',
        durationSeconds: 270,
        audioUrl: '/audio/journey.mp3', // Placeholder
        waveformJson: '{"peaks": [0.2, 0.4, 0.6, 0.8, 0.9, 0.8, 0.7, 0.5, 0.3, 0.5, 0.7, 0.9, 0.8, 0.6, 0.4, 0.2], "sampleRate": 44100}',
        createdAt: '2023-04-10T11:00:00Z',
        lastModifiedAt: '2023-04-10T11:00:00Z',
        isPublic: true,
        tags: ['orchestral', 'adventure', 'epic', 'soundtrack'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 55,
        comments: [],
        playCount: 500,
        downloadCount: 25,
        modelUsed: 'music-model-beta',
        originalPrompt: 'An uplifting orchestral piece with powerful swells and soaring melodies, ideal for adventure themes.',
        generationParameters: {
            genre: 'Cinematic', mood: 'Uplifting', tempoRange: [100, 120], instrumentationPreference: ['Strings', 'Brass', 'Woodwinds', 'Percussion', 'Choir'],
            durationPreference: [240, 300], keySignaturePreference: 'A Major', creativityTemperature: 0.85, diversityPenalty: 0.35,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
];

export const MOCK_PROJECTS_DATA: Project[] = [
    {
        id: 'proj-001',
        userId: MOCK_USER.id,
        name: 'Ambient Explorations',
        description: 'A collection of ambient and atmospheric soundscapes, focusing on pads and evolving textures.',
        compositionIds: ['comp-001', 'comp-004'],
        createdAt: '2023-03-01T10:00:00Z',
        lastModifiedAt: '2023-03-20T11:00:00Z',
        isShared: false,
    },
    {
        id: 'proj-002',
        userId: MOCK_USER.id,
        name: 'Daily Compositions',
        description: 'Quick ideas and daily musical sketches. Experimental and varied genres.',
        compositionIds: ['comp-002', 'comp-005'],
        createdAt: '2023-03-05T14:00:00Z',
        lastModifiedAt: '2023-03-25T17:45:00Z',
        isShared: true,
        sharedWithUserIds: ['user-other-1'],
    },
    {
        id: 'proj-003',
        userId: MOCK_USER.id,
        name: 'Game Soundtrack Ideas',
        description: 'Working on themes for a sci-fi game. Focus on electronic and cinematic tracks.',
        compositionIds: ['comp-003', 'comp-006'],
        createdAt: '2023-03-10T09:00:00Z',
        lastModifiedAt: '2023-03-28T08:00:00Z',
        isShared: false,
    },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: generateUniqueId(), type: 'success', message: 'Composition "Rainy Day Reverie" saved successfully!', timestamp: '2023-04-01T10:00:00Z', isRead: false },
    { id: generateUniqueId(), type: 'new_like', message: 'Someone liked "Echoes of a Forgotten Star".', timestamp: '2023-04-01T11:30:00Z', isRead: false, link: '/composition/comp-001', icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>` },
    { id: generateUniqueId(), type: 'system', message: 'New update available: improved music generation models!', timestamp: '2023-04-01T12:00:00Z', isRead: true, icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>` },
    { id: generateUniqueId(), type: 'error', message: 'Failed to generate music: API rate limit exceeded.', timestamp: '2023-04-01T12:05:00Z', isRead: false },
    { id: generateUniqueId(), type: 'new_comment', message: 'New comment on "Cyberpunk Alley Groove".', timestamp: '2023-04-01T13:00:00Z', isRead: false, link: '/composition/comp-003', icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path></svg>` },
    { id: generateUniqueId(), type: 'update_available', message: 'Sonic Alchemy v2.0 is live! Check out new features!', timestamp: '2023-04-02T09:00:00Z', isRead: false, icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9H9V7h2v2z"></path></svg>` },
];

export const MOCK_USER_STATS: UserStats = {
    totalCompositions: 6,
    publicCompositions: 4,
    totalPlaybacks: 840,
    totalLikesReceived: 88,
    last7DaysGenerations: [2, 1, 3, 0, 2, 1, 4], // Example: Mon-Sun
    mostUsedGenre: 'Electronic',
    mostUsedInstrument: 'Synthesizer',
};

// Reusable UI components (exported, to adhere to instruction "All new top-level functions...MUST be exported")
// These will be simple wrapper components to avoid creating new files but add structure.

export const ExportedSectionHeader: React.FC<{ title: string; subtitle?: string; className?: string }> = React.memo(({ title, subtitle, className }) => (
    <div className={`mb-4 ${className}`}>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
    </div>
));

export const ExportedInput: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; placeholder?: string; rows?: number; name?: string; disabled?: boolean; className?: string; }> = React.memo(({ label, value, onChange, type = 'text', placeholder, rows, name, disabled, className }) => (
    <div className="mb-4">
        {label && <label htmlFor={name} className="block text-gray-300 text-sm font-bold mb-2">{label}</label>}
        {rows ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700/50 text-white leading-tight focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700/50 text-white leading-tight focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
            />
        )}
    </div>
));

export const ExportedSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; name?: string; disabled?: boolean; }> = React.memo(({ label, value, onChange, options, name, disabled }) => (
    <div className="mb-4">
        {label && <label htmlFor={name} className="block text-gray-300 text-sm font-bold mb-2">{label}</label>}
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700/50 text-white leading-tight focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
));

export const ExportedSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; displayValue?: string | number; name?: string; disabled?: boolean; }> = React.memo(({ label, value, onChange, min, max, step, displayValue, name, disabled }) => (
    <div className="mb-4">
        {label && <label htmlFor={name} className="block text-gray-300 text-sm font-bold mb-2">{label}: <span className="text-cyan-300">{displayValue ?? value}</span></label>}
        <input
            id={name}
            name={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
    </div>
));

export const ExportedCheckbox: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name?: string; disabled?: boolean; }> = React.memo(({ label, checked, onChange, name, disabled }) => (
    <div className="flex items-center mb-4">
        <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        {label && <label htmlFor={name} className="ml-2 text-gray-300 text-sm cursor-pointer">{label}</label>}
    </div>
));

export const ExportedButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string; type?: 'button' | 'submit' | 'reset'; }> = React.memo(({ onClick, disabled, children, className, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center whitespace-nowrap ${disabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'} ${className}`}
    >
        {children}
    </button>
));

export const ExportedIconButton: React.FC<{ onClick: () => void; disabled?: boolean; icon: React.ReactNode; label?: string; className?: string; tooltip?: string; }> = React.memo(({ onClick, disabled, icon, label, className, tooltip }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center ${disabled ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300'} ${className}`}
        title={tooltip || label}
    >
        {icon}
        {label && <span className="ml-2 text-sm hidden sm:inline">{label}</span>}
    </button>
));

export const ExportedModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = React.memo(({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <ExportedIconButton
                        onClick={onClose}
                        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
                        className="!bg-transparent hover:!bg-gray-700 !text-gray-400"
                        tooltip="Close"
                    />
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
});

export const ExportedLoadingSpinner: React.FC<{ className?: string; message?: string }> = React.memo(({ className, message }) => (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        {message && <p className="mt-4 text-gray-400">{message}</p>}
    </div>
));

// Notification context and provider for global notifications
interface NotificationContextType {
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    removeNotification: (id: string) => void;
    markNotificationAsRead: (id: string) => void;
    notifications: Notification[];
}

export const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const ExportedNotificationProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            ...notification,
            id: generateUniqueId(),
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, markNotificationAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
});

export const useNotifications = () => {
    const context = React.useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within an ExportedNotificationProvider');
    }
    return context;
};

export const ExportedNotificationToast: React.FC<{ notification: Notification }> = React.memo(({ notification }) => {
    const { removeNotification, markNotificationAsRead } = useNotifications();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => removeNotification(notification.id), 500); // Fade out then remove
        }, 8000); // Notifications disappear after 8 seconds
        return () => clearTimeout(timer);
    }, [notification.id, removeNotification]);

    const getColors = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'bg-green-600 border-green-700';
            case 'error': return 'bg-red-600 border-red-700';
            case 'info': return 'bg-blue-600 border-blue-700';
            case 'warning': return 'bg-orange-600 border-orange-700';
            case 'new_like':
            case 'new_comment':
            case 'system':
            case 'update_available':
            default: return 'bg-cyan-600 border-cyan-700';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`relative p-4 mb-2 rounded shadow-lg text-white transition-all duration-300 ease-out ${getColors(notification.type)} ${notification.isRead ? 'opacity-60' : 'opacity-100'} ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
            role="alert"
        >
            <div className="flex items-center">
                {notification.icon && <span className="mr-2" dangerouslySetInnerHTML={{ __html: notification.icon }}></span>}
                <p className="font-semibold">{notification.message}</p>
            </div>
            <p className="text-xs text-gray-200 mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
            {!notification.isRead && (
                <ExportedButton
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="mt-2 text-xs bg-white/20 hover:bg-white/30 !py-1 !px-2"
                >
                    Mark as Read
                </ExportedButton>
            )}
            <ExportedIconButton
                onClick={() => removeNotification(notification.id)}
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
                className="absolute top-2 right-2 !bg-transparent hover:!bg-white/20 !text-white !p-1"
                tooltip="Dismiss"
            />
        </div>
    );
});

export const ExportedNotificationTray: React.FC = React.memo(() => {
    const { notifications } = useNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="fixed bottom-20 right-4 z-50 w-full max-w-xs"> {/* Adjusted bottom for player */}
            {notifications.slice(-3).reverse().map(n => ( // Show last 3 notifications
                <ExportedNotificationToast key={n.id} notification={n} />
            ))}
            {unreadCount > 0 && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                </div>
            )}
        </div>
    );
});


// Main SonicAlchemyView component begins here.
// All major features will be implemented as sections or conditional renders within this component.
// State management will become significantly more complex.

const SonicAlchemyView: React.FC = () => {
    // Core application states
    const [prompt, setPrompt] = useState('a melancholic but hopeful piano piece for a rainy day');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<Composition | null>(null);
    const [isPlaying, setIsPlaying] = useState(false); // Global playback state

    // Advanced Prompt Parameters
    const [currentGenre, setCurrentGenre] = useState<string>('Ambient');
    const [currentMood, setCurrentMood] = useState<string>('Ethereal');
    const [currentTempo, setCurrentTempo] = useState<number>(100); // BPM
    const [currentDuration, setCurrentDuration] = useState<number>(180); // seconds
    const [currentKey, setCurrentKey] = useState<string>('C Major');
    const [currentInstruments, setCurrentInstruments] = useState<string[]>(['Synthesizer', 'Pad']);
    const [creativityTemperature, setCreativityTemperature] = useState<number>(0.7);
    const [diversityPenalty, setDiversityPenalty] = useState<number>(0.5);
    const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash'); // Placeholder for multiple models
    const [selectedOutputFormat, setSelectedOutputFormat] = useState<GenerationParameters['outputFormat']>('description');
    const [styleReferenceId, setStyleReferenceId] = useState<string | undefined>(undefined);

    // User and data management states
    const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USER);
    const [compositions, setCompositions] = useState<Composition[]>(MOCK_COMPOSITIONS_DATA);
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS_DATA);
    const [appSettings, setAppSettings] = useState<AppSettings>({
        theme: 'dark',
        defaultGenre: 'Ambient',
        defaultInstrumentation: ['Piano'],
        autoSave: true,
        notificationsEnabled: true,
        audioQuality: 'medium',
        defaultOutputFormat: 'audio',
        onboardingComplete: false,
    });
    const [playbackState, setPlaybackState] = useState<PlaybackState>({
        currentCompositionId: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        isMuted: false,
        loop: false,
        shuffle: false,
        playbackSpeed: 1.0,
        reverbAmount: 0.0,
        delayAmount: 0.0,
    });
    const [userStats, setUserStats] = useState<UserStats>(MOCK_USER_STATS);

    // UI State for modals/panels
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProjectsModal, setShowProjectsModal] = useState(false); // Not used currently, using activeTab 'projects'
    const [showUserProfileModal, setShowUserProfileModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [compositionToShare, setCompositionToShare] = useState<Composition | null>(null);
    const [activeTab, setActiveTab] = useState<'generate' | 'my_compositions' | 'community_feed' | 'projects'>('generate');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenre, setFilterGenre] = useState('All');
    const [filterMood, setFilterMood] = useState('All');
    const [projectFilterId, setProjectFilterId] = useState<string | null>(null); // For filtering compositions by project

    // Generation progress states
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [generateProgress, setGenerateProgress] = useState(0); // 0-100
    const [generationStatusMessage, setGenerationStatusMessage] = useState('');

    // Notification hook
    const { addNotification } = useNotifications();

    // Available options for dropdowns/sliders (exported for potential external use)
    export const GENRES = ['Ambient', 'Electronic', 'Classical Crossover', 'Lo-Fi Hip-Hop', 'Cinematic', 'Jazz', 'Rock', 'Pop', 'Folk Ambient', 'Experimental'];
    export const MOODS = ['Ethereal', 'Melancholic', 'Hopeful', 'Gritty', 'Energetic', 'Peaceful', 'Relaxed', 'Dramatic', 'Uplifting', 'Calm', 'Mysterious', 'Tense'];
    export const INSTRUMENTS = ['Piano', 'Synthesizer', 'Pad', 'Drums', 'Bass', 'Violin', 'Cello', 'Acoustic Guitar', 'Electric Guitar', 'Flute', 'Brass Ensemble', 'Percussion', 'Rhodes Piano', 'Drum Machine', 'Sampler', 'Choir', 'Woodwinds'];
    export const KEY_SIGNATURES = ['C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F# Major', 'Db Major', 'Ab Major', 'Eb Major', 'Bb Major', 'F Major', 'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor', 'D# Minor', 'Bb Minor', 'F Minor', 'C Minor', 'G Minor', 'D Minor'];
    export const GENERATION_MODELS = [
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Text Description)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Advanced Text Description)' },
        { value: 'sonic-synth-v1', label: 'SonicSynth v1 (Audio Gen - Beta)' }, // Simulated audio generation model
        { value: 'midi-composer-alpha', label: 'MIDI Composer Alpha (MIDI Output)' }, // Simulated MIDI generation model
    ];
    export const OUTPUT_FORMATS = [
        { value: 'description', label: 'Text Description Only' },
        { value: 'audio', label: 'Audio File (MP3/WAV)' },
        { value: 'midi', label: 'MIDI File' },
    ];
    export const PLAYBACK_SPEED_OPTIONS = [
        { value: 0.5, label: '0.5x' },
        { value: 0.75, label: '0.75x' },
        { value: 1.0, label: '1.0x (Normal)' },
        { value: 1.25, label: '1.25x' },
        { value: 1.5, label: '1.5x' },
    ];


    // --- Data Management Functions (CRUD for Compositions and Projects) ---

    export const handleSaveComposition = useCallback(async (composition: Composition, isNew: boolean = false) => {
        setIsLoading(true);
        try {
            await delay(1000); // Simulate API call
            setCompositions(prev => {
                const existingIndex = prev.findIndex(c => c.id === composition.id);
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...composition, lastModifiedAt: new Date().toISOString() };
                    addNotification({ type: 'success', message: `Composition "${composition.title}" updated.` });
                    return updated;
                } else {
                    addNotification({ type: 'success', message: `Composition "${composition.title}" saved to your library.` });
                    return [...prev, { ...composition, id: generateUniqueId(), userId: currentUser.id, createdAt: new Date().toISOString(), lastModifiedAt: new Date().toISOString() }];
                }
            });
            setUserStats(prev => ({ ...prev, totalCompositions: prev.totalCompositions + (isNew ? 1 : 0) }));
            return true;
        } catch (error) {
            console.error('Failed to save composition:', error);
            addNotification({ type: 'error', message: `Failed to save "${composition.title}".` });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, currentUser.id]);

    export const handleDeleteComposition = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            await delay(500); // Simulate API call
            setCompositions(prev => prev.filter(c => c.id !== id));
            setProjects(prevProjects => prevProjects.map(p => ({
                ...p,
                compositionIds: p.compositionIds.filter(comp_id => comp_id !== id)
            })));
            if (playbackState.currentCompositionId === id) {
                setPlaybackState(prev => ({ ...prev, currentCompositionId: null, isPlaying: false, currentTime: 0, duration: 0 }));
            }
            addNotification({ type: 'info', message: 'Composition deleted.' });
            setUserStats(prev => ({ ...prev, totalCompositions: prev.totalCompositions - 1 }));
            return true;
        } catch (error) {
            console.error('Failed to delete composition:', error);
            addNotification({ type: 'error', message: 'Failed to delete composition.' });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, playbackState.currentCompositionId]);

    export const handleCreateProject = useCallback(async (name: string, description: string) => {
        setIsLoading(true);
        try {
            await delay(800);
            const newProject: Project = {
                id: generateUniqueId(),
                userId: currentUser.id,
                name,
                description,
                compositionIds: [],
                createdAt: new Date().toISOString(),
                lastModifiedAt: new Date().toISOString(),
                isShared: false,
            };
            setProjects(prev => [...prev, newProject]);
            addNotification({ type: 'success', message: `Project "${name}" created.` });
            return true;
        } catch (error) {
            console.error('Failed to create project:', error);
            addNotification({ type: 'error', message: `Failed to create project "${name}".` });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, currentUser.id]);

    export const handleUpdateProject = useCallback(async (updatedProject: Project) => {
        setIsLoading(true);
        try {
            await delay(800);
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? { ...updatedProject, lastModifiedAt: new Date().toISOString() } : p));
            addNotification({ type: 'success', message: `Project "${updatedProject.name}" updated.` });
            return true;
        } catch (error) {
            console.error('Failed to update project:', error);
            addNotification({ type: 'error', message: `Failed to update project "${updatedProject.name}".` });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    export const handleDeleteProject = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            await delay(500);
            setProjects(prev => prev.filter(p => p.id !== id));
            addNotification({ type: 'info', message: 'Project deleted.' });
            return true;
        } catch (error) {
            console.error('Failed to delete project:', error);
            addNotification({ type: 'error', message: 'Failed to delete project.' });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    export const handleAddRemoveCompToProject = useCallback(async (projectId: string, compId: string, add: boolean) => {
        setIsLoading(true);
        try {
            await delay(300);
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    const newCompIds = add
                        ? [...new Set([...p.compositionIds, compId])] // Add unique
                        : p.compositionIds.filter(id => id !== compId); // Remove
                    return { ...p, compositionIds: newCompIds, lastModifiedAt: new Date().toISOString() };
                }
                return p;
            }));
            addNotification({ type: 'success', message: `Composition ${add ? 'added to' : 'removed from'} project.` });
            return true;
        } catch (error) {
            console.error('Failed to update project compositions:', error);
            addNotification({ type: 'error', message: `Failed to ${add ? 'add' : 'remove'} composition.` });
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    // --- AI Generation Logic ---

    export const handleGenerate = async () => {
        if (prompt.trim().length === 0) {
            addNotification({ type: 'warning', message: 'Please enter a prompt to generate music.' });
            return;
        }

        setIsLoading(true);
        setGenerateProgress(0);
        setGenerationStatusMessage('Initializing AI composer...');
        setResult(null); // Clear previous result

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const generationParameters: GenerationParameters = {
                genre: currentGenre,
                mood: currentMood,
                tempoRange: [currentTempo - 20, currentTempo + 20], // Example range
                instrumentationPreference: currentInstruments,
                durationPreference: [currentDuration - 30, currentDuration + 30],
                keySignaturePreference: currentKey,
                creativityTemperature: creativityTemperature,
                diversityPenalty: diversityPenalty,
                model: selectedModel,
                outputFormat: selectedOutputFormat,
                styleReferenceId: styleReferenceId,
            };

            const fullPrompt = `You are a music composer AI named Sonic Alchemy. A user wants a piece of music. Based on their prompt, and the following detailed parameters, generate a title, a short description of the piece, and list the primary instrumentation. Also suggest a specific tempo, key, and duration.
            User Prompt: "${prompt}"
            Desired Genre: "${generationParameters.genre}"
            Desired Mood: "${generationParameters.mood}"
            Preferred Instruments: "${generationParameters.instrumentationPreference.join(', ')}"
            Target Tempo: Around ${generationParameters.tempoRange[0]}-${generationParameters.tempoRange[1]} BPM
            Target Duration: Around ${formatDuration(generationParameters.durationPreference[0])}-${formatDuration(generationParameters.durationPreference[1])}
            Key Preference: "${generationParameters.keySignaturePreference}"
            Creativity Level: ${generationParameters.creativityTemperature.toFixed(2)} (higher means more adventurous, range 0.1-1.0)
            Diversity Penalty: ${generationParameters.diversityPenalty.toFixed(2)} (higher means less repetitive, range 0.0-2.0)
            Output Type: ${capitalize(generationParameters.outputFormat)}
            ${generationParameters.styleReferenceId ? `Style Reference Composition ID: ${generationParameters.styleReferenceId}` : ''}
            
            Format your response as a JSON object with properties: 'title' (string), 'description' (string), 'instrumentation' (array of strings), 'suggestedTempo' (number), 'suggestedKey' (string), 'suggestedDurationSeconds' (number). Ensure instrumentation includes actual instruments. If the output type is 'audio' or 'midi', also include 'simulatedAudioUrl' (string) and/or 'simulatedMidiData' (string, base64 encoded dummy).`;

            // Simulate text generation progress
            const textGenerationDuration = selectedModel.includes('gemini') ? 2000 : 1000;
            const textGenerationInterval = setInterval(() => {
                setGenerateProgress(prev => Math.min(prev + (100 / (textGenerationDuration / 100)), 30));
                setGenerationStatusMessage('Analyzing prompt and parameters...');
            }, 100);
            await delay(textGenerationDuration);
            clearInterval(textGenerationInterval);
            setGenerateProgress(30);
            setGenerationStatusMessage('Drafting musical ideas...');

            const response = await ai.models.generateContent({
                model: selectedModel.includes('gemini') ? selectedModel : 'gemini-2.5-flash', // Use text model for description, regardless of selected model
                contents: fullPrompt,
                config: { responseMimeType: "application/json" }
            });

            const parsedResponse = JSON.parse(response.text);

            let newComposition: Composition;
            const baseAudioUrl = `/api/generate-audio?id=${generateUniqueId()}`;
            const baseMidiData = `data:audio/midi;base64,TVRoZAAAA${generateUniqueId()}...`; // Dummy Base64 MIDI

            // Update progress and status based on output format
            if (generationParameters.outputFormat === 'audio' && selectedModel.includes('sonic-synth')) {
                setIsGeneratingAudio(true);
                setGenerateProgress(30); // Start audio generation from 30%
                setGenerationStatusMessage('Synthesizing high-fidelity audio...');
                const audioGenerationDuration = 10000; // 10 seconds for audio
                const audioGenerationInterval = setInterval(() => {
                    setGenerateProgress(prev => Math.min(prev + (70 / (audioGenerationDuration / 100)), 100)); // Remaining 70% for audio
                }, 100);
                await delay(audioGenerationDuration);
                clearInterval(audioGenerationInterval);
                setGenerateProgress(100);
                setIsGeneratingAudio(false);
                setGenerationStatusMessage('Audio synthesis complete!');

                newComposition = {
                    id: generateUniqueId(),
                    userId: currentUser.id,
                    title: parsedResponse.title || 'Untitled Composition',
                    description: parsedResponse.description || 'A new soundscape.',
                    instrumentation: parsedResponse.instrumentation || [],
                    genre: currentGenre,
                    mood: currentMood,
                    tempo: parsedResponse.suggestedTempo || currentTempo,
                    keySignature: parsedResponse.suggestedKey || currentKey,
                    durationSeconds: parsedResponse.suggestedDurationSeconds || currentDuration,
                    audioUrl: baseAudioUrl,
                    waveformJson: JSON.stringify({ peaks: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.1), sampleRate: 44100 }), // More detailed random waveform
                    midiData: baseMidiData, // Simulate MIDI also generated
                    createdAt: new Date().toISOString(),
                    lastModifiedAt: new Date().toISOString(),
                    isPublic: currentUser.allowPublicGenerations,
                    tags: [],
                    versionHistory: [{
                        versionId: generateUniqueId(),
                        promptUsed: fullPrompt,
                        parameters: generationParameters,
                        generatedAt: new Date().toISOString(),
                        audioUrl: baseAudioUrl,
                        midiUrl: `/api/midi?id=${generateUniqueId()}`, // Simulated MIDI URL
                        notes: 'Initial audio generation from prompt.'
                    }],
                    likes: 0,
                    comments: [],
                    playCount: 0,
                    downloadCount: 0,
                    modelUsed: selectedModel,
                    originalPrompt: prompt,
                    generationParameters: generationParameters,
                };
            } else if (generationParameters.outputFormat === 'midi' && selectedModel.includes('midi-composer')) {
                setIsGeneratingAudio(true); // Re-using for general generation
                setGenerateProgress(30);
                setGenerationStatusMessage('Composing MIDI sequences...');
                await delay(5000); // 5 seconds for MIDI generation
                setGenerateProgress(100);
                setIsGeneratingAudio(false);
                setGenerationStatusMessage('MIDI composition complete!');

                newComposition = {
                    id: generateUniqueId(),
                    userId: currentUser.id,
                    title: parsedResponse.title || 'Untitled MIDI Composition',
                    description: parsedResponse.description || 'A new MIDI sequence.',
                    instrumentation: parsedResponse.instrumentation || [],
                    genre: currentGenre,
                    mood: currentMood,
                    tempo: parsedResponse.suggestedTempo || currentTempo,
                    keySignature: parsedResponse.suggestedKey || currentKey,
                    durationSeconds: parsedResponse.suggestedDurationSeconds || currentDuration,
                    audioUrl: '', // No direct audio, could synthesize later
                    waveformJson: '{"peaks": [], "sampleRate": 0}',
                    midiData: baseMidiData,
                    createdAt: new Date().toISOString(),
                    lastModifiedAt: new Date().toISOString(),
                    isPublic: currentUser.allowPublicGenerations,
                    tags: ['midi', 'experimental'],
                    versionHistory: [{
                        versionId: generateUniqueId(),
                        promptUsed: fullPrompt,
                        parameters: generationParameters,
                        generatedAt: new Date().toISOString(),
                        audioUrl: '',
                        midiUrl: `/api/midi?id=${generateUniqueId()}`,
                        notes: 'Initial MIDI generation from prompt.'
                    }],
                    likes: 0,
                    comments: [],
                    playCount: 0,
                    downloadCount: 0,
                    modelUsed: selectedModel,
                    originalPrompt: prompt,
                    generationParameters: generationParameters,
                };
            }
            else {
                // For text-only or unsupported audio/midi models
                setGenerateProgress(100);
                setGenerationStatusMessage('Music description generated.');
                newComposition = {
                    id: generateUniqueId(),
                    userId: currentUser.id,
                    title: parsedResponse.title || 'Untitled Description',
                    description: parsedResponse.description || 'A new soundscape description.',
                    instrumentation: parsedResponse.instrumentation || [],
                    genre: currentGenre,
                    mood: currentMood,
                    tempo: parsedResponse.suggestedTempo || currentTempo,
                    keySignature: parsedResponse.suggestedKey || currentKey,
                    durationSeconds: parsedResponse.suggestedDurationSeconds || currentDuration,
                    audioUrl: '',
                    waveformJson: '{"peaks": [], "sampleRate": 0}',
                    midiData: '',
                    createdAt: new Date().toISOString(),
                    lastModifiedAt: new Date().toISOString(),
                    isPublic: false,
                    tags: ['description'],
                    versionHistory: [{
                        versionId: generateUniqueId(),
                        promptUsed: fullPrompt,
                        parameters: generationParameters,
                        generatedAt: new Date().toISOString(),
                        audioUrl: '',
                        notes: 'Text description only.'
                    }],
                    likes: 0,
                    comments: [],
                    playCount: 0,
                    downloadCount: 0,
                    modelUsed: selectedModel,
                    originalPrompt: prompt,
                    generationParameters: generationParameters,
                };
                addNotification({ type: 'info', message: 'Music description generated. Select an audio/MIDI model to generate sound/MIDI output.' });
            }

            setResult(newComposition);
            if (appSettings.autoSave && (newComposition.audioUrl || newComposition.midiData)) {
                await handleSaveComposition(newComposition, true); // Auto-save if it's an audio/MIDI composition
            }
            setUserStats(prev => ({ ...prev, last7DaysGenerations: [...prev.last7DaysGenerations.slice(0, 6), prev.last7DaysGenerations[6] + 1] }));

        } catch (error: any) {
            console.error('Generation Error:', error);
            addNotification({ type: 'error', message: `Generation failed: ${error.message || 'Unknown error'}` });
            setGenerationStatusMessage('Generation failed.');
        } finally {
            setIsLoading(false);
            setIsGeneratingAudio(false);
            setGenerateProgress(0);
        }
    };

    // --- Playback Controls ---

    export const handlePlayComposition = useCallback((comp: Composition) => {
        setPlaybackState(prev => ({
            ...prev,
            currentCompositionId: comp.id,
            isPlaying: true,
            duration: comp.durationSeconds,
            currentTime: 0,
            loop: false, // Reset loop on new play
            volume: prev.volume, // Keep current volume
        }));
        setIsPlaying(true); // Control for the main player UI
        setCompositions(prev => prev.map(c => c.id === comp.id ? { ...c, playCount: c.playCount + 1 } : c));
        setUserStats(prev => ({ ...prev, totalPlaybacks: prev.totalPlaybacks + 1 }));
        addNotification({ type: 'info', message: `Now playing: "${comp.title}"` });
    }, [addNotification]);

    export const handlePauseComposition = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, isPlaying: false }));
        setIsPlaying(false);
    }, []);

    export const handleStopComposition = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, currentCompositionId: null, isPlaying: false, currentTime: 0, duration: 0 }));
        setIsPlaying(false);
    }, []);

    export const handleTogglePlayPause = useCallback(() => {
        if (playbackState.currentCompositionId) {
            setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
            setIsPlaying(prev => !prev);
        } else if (result && result.audioUrl) {
            // If no current composition, but a result is available and has audio, play that
            handlePlayComposition(result as Composition);
        }
    }, [playbackState.currentCompositionId, playbackState.isPlaying, result, handlePlayComposition]);

    export const handleSeek = useCallback((time: number) => {
        setPlaybackState(prev => ({ ...prev, currentTime: Math.min(Math.max(0, time), prev.duration) }));
        // Simulate audio element seek
    }, []);

    export const handleSetVolume = useCallback((volume: number) => {
        setPlaybackState(prev => ({ ...prev, volume: Math.min(Math.max(0, volume), 1.0), isMuted: volume === 0 ? true : prev.isMuted }));
    }, []);

    export const handleToggleMute = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }, []);

    export const handleToggleLoop = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, loop: !prev.loop }));
    }, []);

    export const handleSetPlaybackSpeed = useCallback((speed: number) => {
        setPlaybackState(prev => ({ ...prev, playbackSpeed: speed }));
    }, []);

    export const handleSetReverb = useCallback((amount: number) => {
        setPlaybackState(prev => ({ ...prev, reverbAmount: amount }));
        addNotification({ type: 'info', message: `Reverb set to ${amount.toFixed(2)} (Simulated).` });
    }, [addNotification]);

    export const handleSetDelay = useCallback((amount: number) => {
        setPlaybackState(prev => ({ ...prev, delayAmount: amount }));
        addNotification({ type: 'info', message: `Delay set to ${amount.toFixed(2)} (Simulated).` });
    }, [addNotification]);

    // Simulate playback progress
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (playbackState.isPlaying && playbackState.currentCompositionId && playbackState.duration > 0) {
            interval = setInterval(() => {
                setPlaybackState(prev => {
                    let newTime = prev.currentTime + (1 * prev.playbackSpeed); // Adjust time by speed
                    if (newTime >= prev.duration) {
                        if (prev.loop) {
                            newTime = 0; // Loop back
                        } else {
                            // Stop playback if not looping and reached end
                            clearInterval(interval!);
                            return { ...prev, isPlaying: false, currentTime: 0, currentCompositionId: null };
                        }
                    }
                    return { ...prev, currentTime: newTime };
                });
            }, 1000 / playbackState.playbackSpeed); // Update interval based on speed
        } else if (interval) {
            clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [playbackState.isPlaying, playbackState.currentCompositionId, playbackState.duration, playbackState.loop, playbackState.playbackSpeed]);


    // --- UI Component Definitions (exported for clarity, but defined within this file) ---

    export const ExportedGenreSelector: React.FC<{
        selectedGenre: string;
        onChange: (genre: string) => void;
        genres: string[];
        disabled?: boolean;
    }> = React.memo(({ selectedGenre, onChange, genres, disabled }) => (
        <ExportedSelect
            label="Genre"
            value={selectedGenre}
            onChange={e => onChange(e.target.value)}
            options={[{ value: 'Any', label: 'Any' }, ...genres.map(g => ({ value: g, label: g }))]}
            disabled={disabled}
        />
    ));

    export const ExportedMoodSelector: React.FC<{
        selectedMood: string;
        onChange: (mood: string) => void;
        moods: string[];
        disabled?: boolean;
    }> = React.memo(({ selectedMood, onChange, moods, disabled }) => (
        <ExportedSelect
            label="Mood"
            value={selectedMood}
            onChange={e => onChange(e.target.value)}
            options={[{ value: 'Any', label: 'Any' }, ...moods.map(m => ({ value: m, label: m }))]}
            disabled={disabled}
        />
    ));

    export const ExportedInstrumentationSelector: React.FC<{
        selectedInstruments: string[];
        onChange: (instruments: string[]) => void;
        availableInstruments: string[];
        disabled?: boolean;
    }> = React.memo(({ selectedInstruments, onChange, availableInstruments, disabled }) => {
        const handleInstrumentChange = (instrument: string) => {
            if (disabled) return;
            if (selectedInstruments.includes(instrument)) {
                onChange(selectedInstruments.filter(i => i !== instrument));
            } else {
                onChange([...selectedInstruments, instrument]);
            }
        };

        return (
            <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">Instruments ({selectedInstruments.length} selected)</label>
                <div className={`flex flex-wrap gap-2 p-2 bg-gray-700/50 rounded max-h-48 overflow-y-auto ${disabled ? 'opacity-60' : ''}`}>
                    {availableInstruments.map(instrument => (
                        <span
                            key={instrument}
                            onClick={() => handleInstrumentChange(instrument)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedInstruments.includes(instrument) ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {instrument}
                        </span>
                    ))}
                </div>
                {selectedInstruments.length === 0 && !disabled && (
                    <p className="text-red-400 text-xs mt-1">Select at least one instrument for better generation.</p>
                )}
            </div>
        );
    });

    export const ExportedGenerationParametersForm: React.FC<{
        prompt: string;
        setPrompt: (p: string) => void;
        currentGenre: string;
        setCurrentGenre: (g: string) => void;
        currentMood: string;
        setCurrentMood: (m: string) => void;
        currentTempo: number;
        setCurrentTempo: (t: number) => void;
        currentDuration: number;
        setCurrentDuration: (d: number) => void;
        currentKey: string;
        setCurrentKey: (k: string) => void;
        currentInstruments: string[];
        setCurrentInstruments: (i: string[]) => void;
        creativityTemperature: number;
        setCreativityTemperature: (t: number) => void;
        diversityPenalty: number;
        setDiversityPenalty: (d: number) => void;
        selectedModel: string;
        setSelectedModel: (m: string) => void;
        selectedOutputFormat: GenerationParameters['outputFormat'];
        setSelectedOutputFormat: (f: GenerationParameters['outputFormat']) => void;
        styleReferenceId: string | undefined;
        setStyleReferenceId: (id: string | undefined) => void;
        compositions: Composition[]; // To select style reference
        isLoading: boolean;
        handleGenerate: () => void;
        generateProgress: number;
        isGeneratingAudio: boolean;
        generationStatusMessage: string;
    }> = React.memo(({
        prompt, setPrompt, currentGenre, setCurrentGenre, currentMood, setCurrentMood,
        currentTempo, setCurrentTempo, currentDuration, setCurrentDuration, currentKey, setCurrentKey,
        currentInstruments, setCurrentInstruments, creativityTemperature, setCreativityTemperature,
        diversityPenalty, setDiversityPenalty, selectedModel, setSelectedModel,
        selectedOutputFormat, setSelectedOutputFormat, styleReferenceId, setStyleReferenceId, compositions,
        isLoading, handleGenerate, generateProgress, isGeneratingAudio, generationStatusMessage
    }) => {
        const isAdvancedModel = selectedModel.includes('sonic-synth') || selectedModel.includes('midi-composer');
        const isGenerating = isLoading || isGeneratingAudio;

        const availableStyleReferences = compositions.filter(c => c.audioUrl || c.midiData);

        return (
            <div className="space-y-4">
                <ExportedInput label="Prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Describe the music you want..." disabled={isGenerating} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedGenreSelector selectedGenre={currentGenre} onChange={setCurrentGenre} genres={GENRES} disabled={isGenerating} />
                    <ExportedMoodSelector selectedMood={currentMood} onChange={setCurrentMood} moods={MOODS} disabled={isGenerating} />
                </div>

                <ExportedInstrumentationSelector selectedInstruments={currentInstruments} onChange={setCurrentInstruments} availableInstruments={INSTRUMENTS} disabled={isGenerating} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ExportedSlider label="Tempo (BPM)" value={currentTempo} onChange={e => setCurrentTempo(Number(e.target.value))} min={40} max={200} step={1} disabled={isGenerating} />
                    <ExportedSlider label="Duration (seconds)" value={currentDuration} onChange={e => setCurrentDuration(Number(e.target.value))} min={30} max={600} step={10} displayValue={formatDuration(currentDuration)} disabled={isGenerating} />
                    <ExportedSelect label="Key Signature" value={currentKey} onChange={e => setCurrentKey(e.target.value)} options={KEY_SIGNATURES.map(k => ({ value: k, label: k }))} disabled={isGenerating} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedSlider label="Creativity (Temperature)" value={creativityTemperature} onChange={e => setCreativityTemperature(Number(e.target.value))} min={0.1} max={1.0} step={0.05} disabled={isGenerating} tooltip="Higher values lead to more varied and surprising outputs." />
                    <ExportedSlider label="Diversity (Penalty)" value={diversityPenalty} onChange={e => setDiversityPenalty(Number(e.target.value))} min={0.0} max={2.0} step={0.1} disabled={isGenerating} tooltip="Controls the repetition of musical elements. Higher values reduce repetition." />
                </div>

                <ExportedSelect label="Generation Model" value={selectedModel} onChange={e => { setSelectedModel(e.target.value); setSelectedOutputFormat(e.target.value.includes('midi') ? 'midi' : (e.target.value.includes('sonic-synth') ? 'audio' : 'description')); }} options={GENERATION_MODELS} disabled={isGenerating} />
                <ExportedSelect label="Output Format" value={selectedOutputFormat} onChange={e => setSelectedOutputFormat(e.target.value as GenerationParameters['outputFormat'])} options={OUTPUT_FORMATS} disabled={isGenerating || selectedModel.includes('midi') || selectedModel.includes('sonic-synth')} tooltip="Output format is locked for certain models." />

                {availableStyleReferences.length > 0 && (
                    <ExportedSelect
                        label="Style Reference (Optional)"
                        value={styleReferenceId || ''}
                        onChange={e => setStyleReferenceId(e.target.value || undefined)}
                        options={[{ value: '', label: 'None' }, ...availableStyleReferences.map(c => ({ value: c.id, label: c.title }))]}
                        disabled={isGenerating}
                        tooltip="Select an existing composition to influence the style of the new generation."
                    />
                )}
                {styleReferenceId && (
                    <p className="text-sm text-gray-500">
                        Using "<span className="text-cyan-400 font-medium">{compositions.find(c => c.id === styleReferenceId)?.title}</span>" as style reference.
                    </p>
                )}


                <ExportedButton onClick={handleGenerate} disabled={isGenerating || prompt.trim().length === 0 || currentInstruments.length === 0} className="w-full mt-4 py-3 text-lg font-semibold">
                    {isGenerating ? (isGeneratingAudio ? `Synthesizing Audio (${Math.round(generateProgress)}%)` : `Composing (${Math.round(generateProgress)}%)`) : 'Generate New Composition'}
                </ExportedButton>
                {(isGenerating) && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2 flex items-center">
                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${generateProgress}%`, transition: 'width 0.1s linear' }}></div>
                        <span className="ml-3 text-xs text-gray-400">{generationStatusMessage}</span>
                    </div>
                )}
            </div>
        );
    });

    export const ExportedCompositionDetailCard: React.FC<{
        composition: Composition;
        onPlay: (comp: Composition) => void;
        onSave: (comp: Composition, isNew?: boolean) => Promise<boolean>;
        onDelete: (id: string) => Promise<boolean>;
        onRemix: (comp: Composition) => void;
        onShare: (comp: Composition) => void;
        playbackState: PlaybackState;
        isPlayingGlobally: boolean;
        handleTogglePlayPauseGlobally: () => void;
        currentUser: UserProfile;
        projects: Project[];
        onAddRemoveCompToProject: (projectId: string, compId: string, add: boolean) => Promise<boolean>;
    }> = React.memo(({
        composition, onPlay, onSave, onDelete, onRemix, onShare,
        playbackState, isPlayingGlobally, handleTogglePlayPauseGlobally, currentUser, projects, onAddRemoveCompToProject
    }) => {
        const isCurrentPlaying = playbackState.currentCompositionId === composition.id;
        const [isSaving, setIsSaving] = useState(false);
        const [showComments, setShowComments] = useState(false);
        const [newCommentText, setNewCommentText] = useState('');
        const [showProjectPicker, setShowProjectPicker] = useState(false);
        const { addNotification } = useNotifications();

        const handleSave = async () => {
            setIsSaving(true);
            await onSave(composition, false); // Not a new composition
            setIsSaving(false);
        };

        const handleLike = async () => {
            // Simulate like toggle
            const isLiked = composition.likes > 0; // Simple check, in real app, track user likes
            const updatedComposition = { ...composition, likes: isLiked ? composition.likes - 1 : composition.likes + 1 };
            await onSave(updatedComposition);
            addNotification({ type: 'info', message: isLiked ? `Unliked "${composition.title}".` : `Liked "${composition.title}"!` });
            setUserStats(prev => ({ ...prev, totalLikesReceived: isLiked ? prev.totalLikesReceived - 1