import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// --- Core Data Interfaces ---

export interface Person {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  relationship?: string;
  tags?: string[];
}

export interface Location {
  id: string;
  name: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
  type?: 'city' | 'country' | 'landmark' | 'home' | 'work' | 'event_venue';
  tags?: string[];
}

export interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
}

export interface AIModelUsage {
  modelName: string;
  version: string;
  timestamp: string;
  confidenceScore?: number;
  outputSummary?: string;
  processedDataChunks?: number;
}

export type AssetType = 'PHOTO' | 'VIDEO' | 'AUDIO' | 'EMAIL' | 'DOCUMENT' | 'SOCIAL_POST' | 'WEBPAGE_ARCHIVE' | 'OTHER';

export interface Asset {
  id: string;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp?: string;
  sourceApp?: string; // e.g., 'Google Photos', 'Outlook', 'Slack'
  metadata?: { [key: string]: any }; // EXIF data, email headers, etc.
  transcription?: string; // For audio/video
  aiAnalyzed?: boolean;
}

export interface Memory {
  id: string;
  title: string;
  summary: string;
  description?: string; // More detailed narrative
  timestamp: string; // ISO 8601 string
  endDate?: string; // For events spanning multiple days
  locationId?: string; // Link to Location interface
  peopleIds?: string[]; // Links to Person interface
  tagIds?: string[]; // Links to Tag interface
  assets: Asset[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  sourceAIModels?: AIModelUsage[];
  linkedMemoryIds?: string[]; // Other related memories
  originalSources?: { type: string; url: string; identifier: string }[]; // Original digital source locations
  notes?: string;
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'private' | 'shared' | 'public';
  vrExperienceUrl?: string;
  aiGeneratedInsights?: string[]; // AI-driven deeper analyses
  relevanceScore?: number; // For search ranking
}

export interface TimelineEvent {
  id: string;
  type: 'memory' | 'milestone' | 'period_summary' | 'ai_insight';
  timestamp: string;
  title: string;
  description: string;
  relatedMemoryId?: string;
  tags?: string[];
  imageUrl?: string;
  detailUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  defaultView: 'timeline' | 'dashboard' | 'map';
  notificationSettings: {
    memoryAnniversaries: boolean;
    newInsights: boolean;
    aiProcessingComplete: boolean;
  };
  privacySettings: {
    dataRetentionDays: number;
    anonymizeInsights: boolean;
  };
  language: string;
  defaultTimezone: string;
}

export interface AISettings {
  enableAutoTagging: boolean;
  enableSentimentAnalysis: boolean;
  enableVRSceneGeneration: boolean;
  preferredTranscriptionModel: string;
  preferredImageAnalysisModel: string;
  aiModelAccessKeys: { [modelName: string]: string };
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface Recommendation {
  id: string;
  type: 'related_memory' | 'insight' | 'action_item' | 'anniversary';
  title: string;
  description: string;
  relatedMemoryId?: string;
  actionUrl?: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high';
}

// --- Mock Data Store & API Simulation ---

const mockMemories: Memory[] = Array.from({ length: 500 }).map((_, i) => ({
  id: `mem-${i}`,
  title: `Memory Title ${i + 1}: ${i % 3 === 0 ? 'Travel' : i % 3 === 1 ? 'Family' : 'Work Event'}`,
  summary: `A brief summary of Memory ${i + 1}. This memory highlights key events and emotions from the period.`,
  description: `A more detailed narrative for Memory ${i + 1}. This section could contain a rich text account, including specific anecdotes, challenges faced, and lessons learned. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
  timestamp: new Date(Date.now() - (500 - i) * 86400000 * 5).toISOString(), // Spread over 5 years
  endDate: (i % 7 === 0) ? new Date(Date.now() - (500 - i) * 86400000 * 5 + 86400000).toISOString() : undefined,
  locationId: `loc-${i % 10}`,
  peopleIds: i % 5 === 0 ? [`person-${i % 20}`, `person-${(i + 1) % 20}`] : [`person-${i % 20}`],
  tagIds: i % 4 === 0 ? [`tag-${i % 5}`, `tag-${(i + 1) % 5}`] : [`tag-${i % 5}`],
  assets: Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map((_, assetIdx) => ({
    id: `asset-${i}-${assetIdx}`,
    type: ['PHOTO', 'VIDEO', 'DOCUMENT', 'EMAIL'][Math.floor(Math.random() * 4)] as AssetType,
    url: `#asset-url-${i}-${assetIdx}`,
    thumbnailUrl: `#thumb-url-${i}-${assetIdx}`,
    caption: `Asset ${assetIdx + 1} for Memory ${i + 1}`,
    timestamp: new Date(Date.now() - (500 - i) * 86400000 * 5 + assetIdx * 3600000).toISOString(),
    aiAnalyzed: Math.random() > 0.3,
  })),
  sentiment: ['positive', 'neutral', 'negative', 'mixed'][Math.floor(Math.random() * 4)] as any,
  sourceAIModels: i % 2 === 0 ? [{ modelName: 'GPT-4', version: '4.0', timestamp: new Date().toISOString(), confidenceScore: 0.95 }] : [],
  linkedMemoryIds: i % 10 === 0 && i < 490 ? [`mem-${i + 10}`] : [],
  originalSources: [{ type: 'Google Drive', url: '#google-drive', identifier: `doc-${i}` }],
  notes: i % 6 === 0 ? `AI suggests this memory is highly significant due to its emotional valence.` : undefined,
  status: 'published',
  visibility: 'private',
  vrExperienceUrl: `#vr-exp-${i}`,
  aiGeneratedInsights: i % 3 === 0 ? [`Potential link to early career decisions.`, `Shows recurring themes of innovation.`] : [],
  relevanceScore: Math.random() * 100,
}));

const mockPeople: Person[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `person-${i}`,
  name: `Person Name ${i + 1}`,
  avatarUrl: `https://api.lorem.space/image/face?w=100&h=100&r=${i}`,
  bio: `A close acquaintance. Interested in ${i % 2 === 0 ? 'tech' : 'art'}.`,
  relationship: i % 3 === 0 ? 'Family' : i % 3 === 1 ? 'Friend' : 'Colleague',
  tags: i % 2 === 0 ? ['Close', 'Supportive'] : ['Distant'],
}));

const mockLocations: Location[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `loc-${i}`,
  name: `Location ${i + 1}`,
  coordinates: { lat: 34 + i * 0.1, lng: -118 + i * 0.1 },
  description: `A significant place in my history.`,
  type: ['city', 'country', 'landmark', 'home'][i % 4] as any,
  tags: ['Visited', 'Lived'],
}));

const mockTags: Tag[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `tag-${i}`,
  name: `tag_${i + 1}`,
  category: ['Event', 'Emotion', 'Topic', 'People'][i % 4],
  color: ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1'][i % 5],
}));

const mockUserProfile: UserProfile = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://api.lorem.space/image/face?w=100&h=100&r=20',
  bio: 'Avid memory collector and AI enthusiast.',
  preferences: {
    theme: 'dark',
    defaultView: 'dashboard',
    notificationSettings: {
      memoryAnniversaries: true,
      newInsights: true,
      aiProcessingComplete: false,
    },
    privacySettings: {
      dataRetentionDays: 3650,
      anonymizeInsights: false,
    },
    language: 'en-US',
    defaultTimezone: 'America/Los_Angeles',
  },
};

const mockAISettings: AISettings = {
  enableAutoTagging: true,
  enableSentimentAnalysis: true,
  enableVRSceneGeneration: false,
  preferredTranscriptionModel: 'WhisperV3',
  preferredImageAnalysisModel: 'VisionPro',
  aiModelAccessKeys: {
    'GPT-4': 'sk-...',
    'WhisperV3': 'sk-...',
  },
};

const mockNotifications: Notification[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `notif-${i}`,
  type: ['info', 'warning', 'success'][i % 3] as any,
  message: `Notification ${i + 1}: ${i % 2 === 0 ? 'New insight available!' : 'Memory processing complete.'}`,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  read: i < 2,
  actionUrl: i % 2 === 0 ? `#insight-${i}` : undefined,
}));

const mockSearchHistory: SearchHistoryEntry[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `sh-${i}`,
  query: i % 3 === 0 ? 'vacation in europe' : i % 3 === 1 ? 'my first job' : 'family reunion',
  timestamp: new Date(Date.now() - i * 7200000).toISOString(),
  resultCount: Math.floor(Math.random() * 10) + 1,
}));

const mockRecommendations: Recommendation[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `rec-${i}`,
  type: ['related_memory', 'insight', 'action_item', 'anniversary'][i % 4] as any,
  title: `Recommendation ${i + 1}: ${i % 2 === 0 ? 'Memory Anniversary!' : 'Deep Insight Uncovered'}`,
  description: `This is a detailed description of recommendation ${i + 1}. AI analysis suggests you might find this relevant.`,
  relatedMemoryId: i % 2 === 0 ? `mem-${i * 10}` : undefined,
  actionUrl: `#rec-action-${i}`,
  timestamp: new Date(Date.now() - i * 1800000).toISOString(),
  priority: ['low', 'medium', 'high'][i % 3] as any,
}));

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  getMemories: async (params?: { query?: string; tagIds?: string[]; peopleIds?: string[]; locationId?: string; startDate?: string; endDate?: string; sentiment?: string; limit?: number; offset?: number; }) => {
    await delay(500 + Math.random() * 1000);
    let filtered = [...mockMemories];

    if (params?.query) {
      const lowerQuery = params.query.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.summary.toLowerCase().includes(lowerQuery) ||
        m.description?.toLowerCase().includes(lowerQuery) ||
        m.notes?.toLowerCase().includes(lowerQuery)
      );
    }
    if (params?.tagIds && params.tagIds.length > 0) {
      filtered = filtered.filter(m => m.tagIds?.some(tid => params.tagIds!.includes(tid)));
    }
    if (params?.peopleIds && params.peopleIds.length > 0) {
      filtered = filtered.filter(m => m.peopleIds?.some(pid => params.peopleIds!.includes(pid)));
    }
    if (params?.locationId) {
      filtered = filtered.filter(m => m.locationId === params.locationId);
    }
    if (params?.startDate) {
      filtered = filtered.filter(m => m.timestamp >= params.startDate!);
    }
    if (params?.endDate) {
      filtered = filtered.filter(m => m.timestamp <= params.endDate!);
    }
    if (params?.sentiment) {
      filtered = filtered.filter(m => m.sentiment === params.sentiment);
    }

    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    const paginated = filtered.slice(offset, offset + limit);

    return { data: paginated, total };
  },
  getMemoryById: async (id: string): Promise<Memory | null> => {
    await delay(300 + Math.random() * 700);
    return mockMemories.find(m => m.id === id) || null;
  },
  createMemory: async (memory: Partial<Memory>): Promise<Memory> => {
    await delay(1000 + Math.random() * 500);
    const newMemory: Memory = {
      ...memory as Memory,
      id: `mem-${mockMemories.length + 1}`,
      timestamp: memory.timestamp || new Date().toISOString(),
      assets: memory.assets || [],
      summary: memory.summary || memory.title || 'Untitled Memory',
      status: 'draft',
      visibility: 'private',
    };
    mockMemories.unshift(newMemory); // Add to beginning for freshness
    return newMemory;
  },
  updateMemory: async (id: string, updates: Partial<Memory>): Promise<Memory | null> => {
    await delay(800 + Math.random() * 400);
    const index = mockMemories.findIndex(m => m.id === id);
    if (index === -1) return null;
    const updatedMemory = { ...mockMemories[index], ...updates };
    mockMemories[index] = updatedMemory;
    return updatedMemory;
  },
  deleteMemory: async (id: string): Promise<boolean> => {
    await delay(600 + Math.random() * 300);
    const initialLength = mockMemories.length;
    mockMemories.splice(mockMemories.findIndex(m => m.id === id), 1);
    return mockMemories.length < initialLength;
  },
  getPeople: async () => {
    await delay(200);
    return mockPeople;
  },
  getLocations: async () => {
    await delay(200);
    return mockLocations;
  },
  getTags: async () => {
    await delay(200);
    return mockTags;
  },
  getUserProfile: async (): Promise<UserProfile> => {
    await delay(300);
    return mockUserProfile;
  },
  updateUserProfile: async (profile: UserProfile): Promise<UserProfile> => {
    await delay(500);
    Object.assign(mockUserProfile, profile);
    return mockUserProfile;
  },
  getAISettings: async (): Promise<AISettings> => {
    await delay(300);
    return mockAISettings;
  },
  updateAISettings: async (settings: AISettings): Promise<AISettings> => {
    await delay(500);
    Object.assign(mockAISettings, settings);
    return mockAISettings;
  },
  getNotifications: async (): Promise<Notification[]> => {
    await delay(300);
    return mockNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  markNotificationAsRead: async (id: string): Promise<Notification | null> => {
    await delay(200);
    const notif = mockNotifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif || null;
  },
  getSearchHistory: async (): Promise<SearchHistoryEntry[]> => {
    await delay(300);
    return mockSearchHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addSearchHistoryEntry: async (query: string, resultCount: number): Promise<SearchHistoryEntry> => {
    await delay(100);
    const newEntry: SearchHistoryEntry = {
      id: `sh-${mockSearchHistory.length + 1}`,
      query,
      timestamp: new Date().toISOString(),
      resultCount,
    };
    mockSearchHistory.unshift(newEntry);
    return newEntry;
  },
  getRecommendations: async (): Promise<Recommendation[]> => {
    await delay(400);
    return mockRecommendations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  uploadAsset: async (file: File): Promise<Asset> => {
    await delay(1500 + Math.random() * 1000);
    console.log('Uploading file:', file.name);
    return {
      id: `asset-${Date.now()}`,
      type: file.type.startsWith('image/') ? 'PHOTO' : file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT',
      url: `https://mockstorage.com/assets/${file.name}`,
      thumbnailUrl: `https://mockstorage.com/thumbnails/${file.name}`,
      caption: file.name,
      timestamp: new Date().toISOString(),
      sourceApp: 'PersonalHistorianUploader',
      aiAnalyzed: false,
    };
  },
};

// --- Context for Global State (Simplified for single file) ---
interface GlobalState {
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  aiSettings: AISettings | null;
  setAiSettings: React.Dispatch<React.SetStateAction<AISettings | null>>;
  allPeople: Person[];
  allLocations: Location[];
  allTags: Tag[];
  fetchStaticData: () => Promise<void>;
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AppContext = createContext<GlobalState | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- Reusable UI Components (internal to this file, but exported for the prompt's requirement) ---

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    <p className="ml-3 text-gray-400">Loading...</p>
  </div>
);

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded mt-4">
    <p>Error: {message}</p>
  </div>
);

export const AssetPreview: React.FC<{ asset: Asset }> = ({ asset }) => {
  const renderAsset = () => {
    if (asset.type === 'PHOTO' || asset.type === 'VIDEO') {
      return (
        <img src={asset.thumbnailUrl || asset.url} alt={asset.caption || asset.type} className="w-full h-32 object-cover rounded" />
      );
    } else if (asset.type === 'AUDIO') {
      return <audio controls src={asset.url} className="w-full" />;
    }
    return (
      <div className="bg-gray-700 p-2 rounded flex items-center justify-center h-32">
        <span className="text-sm text-gray-400">{asset.type} Preview</span>
      </div>
    );
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden flex-shrink-0 w-48">
      {renderAsset()}
      <div className="p-2 text-sm">
        <p className="font-semibold text-cyan-400 truncate">{asset.caption || asset.type}</p>
        <p className="text-gray-500 text-xs">{new Date(asset.timestamp || '').toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export const TagPill: React.FC<{ tagId: string }> = ({ tagId }) => {
  const { allTags } = useAppContext();
  const tag = allTags.find(t => t.id === tagId);
  if (!tag) return null;
  return (
    <span style={{ backgroundColor: tag.color || '#6B7280' }} className="inline-block text-white text-xs px-2 py-1 rounded-full mr-2 mb-2 opacity-90">
      {tag.name}
    </span>
  );
};

export const PersonAvatar: React.FC<{ personId: string }> = ({ personId }) => {
  const { allPeople } = useAppContext();
  const person = allPeople.find(p => p.id === personId);
  if (!person) return null;
  return (
    <div className="flex items-center space-x-2 mr-4">
      <img src={person.avatarUrl || 'https://api.lorem.space/image/face?w=40&h=40&r=0'} alt={person.name} className="w-8 h-8 rounded-full object-cover" />
      <span className="text-sm text-cyan-400">{person.name}</span>
    </div>
  );
};

export const LocationBadge: React.FC<{ locationId: string }> = ({ locationId }) => {
  const { allLocations } = useAppContext();
  const location = allLocations.find(l => l.id === locationId);
  if (!location) return null;
  return (
    <span className="inline-flex items-center bg-gray-700 text-gray-300 text-xs px-2.5 py-0.5 rounded-full mr-2 mb-2">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
      {location.name}
    </span>
  );
};

// --- Feature-Specific Components (exported as per requirement) ---

export const MemoryDetailComponent: React.FC<{ memory: Memory; onEdit?: (id: string) => void; onDelete?: (id: string) => void }> = ({ memory, onEdit, onDelete }) => {
  const { allPeople, allLocations } = useAppContext();
  const location = memory.locationId ? allLocations.find(l => l.id === memory.locationId) : null;
  const people = memory.peopleIds?.map(pId => allPeople.find(p => p.id === pId)).filter(Boolean) as Person[];

  return (
    <div className="bg-gray-900 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-cyan-400">{memory.title}</h2>
        <div className="flex space-x-2">
          {onEdit && (
            <button onClick={() => onEdit(memory.id)} className="p-2 bg-blue-600 rounded hover:bg-blue-700 text-sm">Edit</button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(memory.id)} className="p-2 bg-red-600 rounded hover:bg-red-700 text-sm">Delete</button>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-lg mb-4">{memory.summary}</p>

      {memory.description && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Full Narrative</h3>
          <p className="text-gray-400 whitespace-pre-wrap">{memory.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="font-semibold text-gray-300">Date</h4>
          <p className="text-gray-400">{new Date(memory.timestamp).toLocaleDateString()} {memory.endDate && ` - ${new Date(memory.endDate).toLocaleDateString()}`}</p>
        </div>
        {location && (
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="font-semibold text-gray-300">Location</h4>
            <LocationBadge locationId={location.id} />
            <p className="text-gray-400 text-sm">{location.description}</p>
          </div>
        )}
        {memory.sentiment && (
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="font-semibold text-gray-300">Sentiment</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              memory.sentiment === 'positive' ? 'bg-green-600' :
              memory.sentiment === 'negative' ? 'bg-red-600' :
              memory.sentiment === 'mixed' ? 'bg-yellow-600' : 'bg-gray-600'
            }`}>{memory.sentiment}</span>
          </div>
        )}
      </div>

      {people && people.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">People Involved</h3>
          <div className="flex flex-wrap">
            {people.map(person => <PersonAvatar key={person.id} personId={person.id} />)}
          </div>
        </div>
      )}

      {memory.tagIds && memory.tagIds.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Tags</h3>
          <div className="flex flex-wrap">
            {memory.tagIds.map(tagId => <TagPill key={tagId} tagId={tagId} />)}
          </div>
        </div>
      )}

      {memory.assets.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Digital Assets</h3>
          <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
            {memory.assets.map(asset => (
              <a href={asset.url} target="_blank" rel="noopener noreferrer" key={asset.id} className="block hover:opacity-80">
                <AssetPreview asset={asset} />
              </a>
            ))}
          </div>
        </div>
      )}

      {memory.aiGeneratedInsights && memory.aiGeneratedInsights.length > 0 && (
        <div className="mb-4 bg-cyan-900 bg-opacity-30 p-4 rounded-lg border border-cyan-700">
          <h3 className="text-xl font-semibold text-cyan-200 mb-2">AI Insights</h3>
          <ul className="list-disc list-inside text-cyan-300">
            {memory.aiGeneratedInsights.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      {memory.vrExperienceUrl && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Experience this Memory in VR</h3>
          <a href={memory.vrExperienceUrl} target="_blank" rel="noopener noreferrer" className="inline-block p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors text-white">
            Launch VR Memory Palace Experience
          </a>
        </div>
      )}
    </div>
  );
};

export const MemoryCard: React.FC<{ memory: Memory; onClick: (memory: Memory) => void }> = ({ memory, onClick }) => (
  <div
    className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer relative"
    onClick={() => onClick(memory)}
  >
    <div className="absolute top-2 right-2 flex space-x-1">
      {memory.sentiment && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          memory.sentiment === 'positive' ? 'bg-green-700' :
          memory.sentiment === 'negative' ? 'bg-red-700' :
          memory.sentiment === 'mixed' ? 'bg-yellow-700' : 'bg-gray-700'
        }`}>{memory.sentiment.charAt(0).toUpperCase()}</span>
      )}
      {memory.vrExperienceUrl && (
        <span className="text-xs px-2 py-1 rounded-full bg-indigo-700">VR</span>
      )}
    </div>

    <h3 className="text-xl font-semibold text-white mb-2 pr-10">{memory.title}</h3>
    <p className="text-gray-400 text-sm mb-3 line-clamp-3">{memory.summary}</p>
    <div className="flex flex-wrap items-center text-xs text-gray-500 mb-2">
      <span className="mr-3">{new Date(memory.timestamp).toLocaleDateString()}</span>
      {memory.locationId && <LocationBadge locationId={memory.locationId} />}
    </div>
    <div className="flex flex-wrap mb-2">
      {memory.tagIds?.slice(0, 3).map(tagId => <TagPill key={tagId} tagId={tagId} />)}
      {memory.tagIds && memory.tagIds.length > 3 && (
        <span className="inline-block text-gray-400 text-xs px-2 py-1 rounded-full mr-2 mb-2 bg-gray-700">+{memory.tagIds.length - 3}</span>
      )}
    </div>
    {memory.assets.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {memory.assets.slice(0, 3).map(asset => (
          <img
            key={asset.id}
            src={asset.thumbnailUrl || asset.url}
            alt={asset.caption || 'Asset'}
            className="w-12 h-12 object-cover rounded-md border border-gray-700"
          />
        ))}
        {memory.assets.length > 3 && (
          <div className="w-12 h-12 flex items-center justify-center bg-gray-700 text-gray-400 rounded-md border border-gray-600 text-xs">
            +{memory.assets.length - 3}
          </div>
        )}
      </div>
    )}
  </div>
);

export const AdvancedSearchForm: React.FC<{
  onSearch: (params: any) => void;
  isLoading: boolean;
}> = ({ onSearch, isLoading }) => {
  const { allPeople, allLocations, allTags } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | 'mixed' | ''>('');

  const handleSearch = useCallback(() => {
    onSearch({
      query: searchTerm,
      tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      peopleIds: selectedPeople.length > 0 ? selectedPeople : undefined,
      locationId: selectedLocation || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sentiment: sentiment || undefined,
    });
  }, [searchTerm, selectedTags, selectedPeople, selectedLocation, startDate, endDate, sentiment, onSearch]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-white">Advanced Memory Search</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="search-term" className="block text-gray-300 text-sm font-bold mb-2">Keywords</label>
          <input
            id="search-term"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search titles, summaries, descriptions..."
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="tags-select" className="block text-gray-300 text-sm font-bold mb-2">Tags</label>
          <select
            id="tags-select"
            multiple
            value={selectedTags}
            onChange={e => setSelectedTags(Array.from(e.target.options).filter(o => o.selected).map(o => o.value))}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white h-24 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {allTags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="people-select" className="block text-gray-300 text-sm font-bold mb-2">People</label>
          <select
            id="people-select"
            multiple
            value={selectedPeople}
            onChange={e => setSelectedPeople(Array.from(e.target.options).filter(o => o.selected).map(o => o.value))}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white h-24 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {allPeople.map(person => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location-select" className="block text-gray-300 text-sm font-bold mb-2">Location</label>
          <select
            id="location-select"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="">Any Location</option>
            {allLocations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="start-date" className="block text-gray-300 text-sm font-bold mb-2">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-gray-300 text-sm font-bold mb-2">End Date</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="sentiment-select" className="block text-gray-300 text-sm font-bold mb-2">Sentiment</label>
          <select
            id="sentiment-select"
            value={sentiment}
            onChange={e => setSentiment(e.target.value as any)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="">Any Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold w-full disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Searching...' : 'Search Memories'}
      </button>
    </div>
  );
};

export const MemoryEditorComponent: React.FC<{
  memory?: Memory;
  onSave: (memory: Partial<Memory>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ memory, onSave, onCancel, isLoading }) => {
  const { allPeople, allLocations, allTags } = useAppContext();
  const [formData, setFormData] = useState<Partial<Memory>>(() => memory || {
    title: '',
    summary: '',
    description: '',
    timestamp: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
    assets: [],
    peopleIds: [],
    tagIds: [],
    sentiment: 'neutral',
    locationId: '',
    vrExperienceUrl: '',
    notes: '',
  });
  const [newAssetFile, setNewAssetFile] = useState<File | null>(null);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);

  useEffect(() => {
    if (memory) {
      setFormData({
        ...memory,
        timestamp: new Date(memory.timestamp).toISOString().slice(0, 16),
        endDate: memory.endDate ? new Date(memory.endDate).toISOString().slice(0, 16) : undefined,
      });
    }
  }, [memory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value ? new Date(value).toISOString() : undefined }));
  };

  const handleMultiSelectChange = (name: keyof Memory, options: HTMLOptionElement[]) => {
    const selectedValues = Array.from(options).filter(o => o.selected).map(o => o.value);
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAssetFile(file);
      setIsUploadingAsset(true);
      try {
        const uploadedAsset = await api.uploadAsset(file);
        setFormData(prev => ({ ...prev, assets: [...(prev.assets || []), uploadedAsset] }));
        setNewAssetFile(null);
      } catch (error) {
        console.error('Asset upload failed:', error);
        alert('Failed to upload asset.');
      } finally {
        setIsUploadingAsset(false);
      }
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    setFormData(prev => ({ ...prev, assets: prev.assets?.filter(a => a.id !== assetId) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reformat dates for API if they were modified by input type="datetime-local"
    const dataToSave = { ...formData };
    if (dataToSave.timestamp && !dataToSave.timestamp.endsWith('Z')) {
      dataToSave.timestamp = new Date(dataToSave.timestamp).toISOString();
    }
    if (dataToSave.endDate && !dataToSave.endDate.endsWith('Z')) {
      dataToSave.endDate = new Date(dataToSave.endDate).toISOString();
    }
    await onSave(dataToSave);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-white">{memory ? 'Edit Memory' : 'Create New Memory'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-1">Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500" />
        </div>
        <div>
          <label htmlFor="summary" className="block text-gray-300 text-sm font-bold mb-1">Summary</label>
          <textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} required rows={3}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-1">Full Narrative</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timestamp" className="block text-gray-300 text-sm font-bold mb-1">Start Date/Time</label>
            <input type="datetime-local" id="timestamp" name="timestamp" value={formData.timestamp ? new Date(formData.timestamp).toISOString().slice(0, 16) : ''} onChange={e => handleDateChange('timestamp', e.target.value)} required
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-300 text-sm font-bold mb-1">End Date/Time (Optional)</label>
            <input type="datetime-local" id="endDate" name="endDate" value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''} onChange={e => handleDateChange('endDate', e.target.value)}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500" />
          </div>
        </div>
        <div>
          <label htmlFor="locationId" className="block text-gray-300 text-sm font-bold mb-1">Location</label>
          <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500">
            <option value="">Select Location</option>
            {allLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="peopleIds" className="block text-gray-300 text-sm font-bold mb-1">People Involved</label>
          <select multiple id="peopleIds" name="peopleIds" value={formData.peopleIds} onChange={e => handleMultiSelectChange('peopleIds', Array.from(e.target.options))}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white h-24 focus:ring-cyan-500 focus:border-cyan-500">
            {allPeople.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tagIds" className="block text-gray-300 text-sm font-bold mb-1">Tags</label>
          <select multiple id="tagIds" name="tagIds" value={formData.tagIds} onChange={e => handleMultiSelectChange('tagIds', Array.from(e.target.options))}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white h-24 focus:ring-cyan-500 focus:border-cyan-500">
            {allTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sentiment" className="block text-gray-300 text-sm font-bold mb-1">Sentiment</label>
          <select id="sentiment" name="sentiment" value={formData.sentiment} onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500">
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div>
          <label htmlFor="vrExperienceUrl" className="block text-gray-300 text-sm font-bold mb-1">VR Experience URL</label>
          <input type="url" id="vrExperienceUrl" name="vrExperienceUrl" value={formData.vrExperienceUrl} onChange={handleChange}
            placeholder="e.g., https://my-vr-palace.com/experience/123"
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500" />
        </div>
        <div>
          <label htmlFor="notes" className="block text-gray-300 text-sm font-bold mb-1">Private Notes</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-lg font-semibold text-gray-200 mb-2">Assets</h4>
          <div className="flex flex-wrap gap-4 mb-4">
            {formData.assets?.map(asset => (
              <div key={asset.id} className="relative group">
                <AssetPreview asset={asset} />
                <button
                  type="button"
                  onClick={() => handleRemoveAsset(asset.id)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove asset"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <label className="block text-gray-300 text-sm font-bold mb-1">Upload New Asset</label>
          <input type="file" onChange={handleAssetUpload} disabled={isUploadingAsset}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 disabled:opacity-50" />
          {isUploadingAsset && <p className="text-cyan-400 text-sm mt-2">Uploading asset...</p>}
        </div>

        <div className="flex justify-end space-x-4 border-t border-gray-700 pt-6 mt-6">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-bold">Cancel</button>
          <button type="submit" disabled={isLoading || isUploadingAsset} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Memory'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const DashboardInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<{ totalMemories: number; avgSentiment: string; mostFrequentTag: string; } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [recs, recents, allMemsResponse] = await Promise.all([
          api.getRecommendations(),
          api.getMemories({ limit: 5 }),
          api.getMemories({ limit: 9999 }) // Fetch all for stats
        ]);
        setRecommendations(recs);
        setRecentMemories(recents.data);

        // Mock stats calculation
        const allMemories = allMemsResponse.data;
        const totalMemories = allMemories.length;
        const sentimentCounts = allMemories.reduce((acc, mem) => {
          if (mem.sentiment) acc[mem.sentiment] = (acc[mem.sentiment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const avgSentiment = Object.keys(sentimentCounts).length > 0
          ? Object.keys(sentimentCounts).reduce((a, b) => sentimentCounts[a] > sentimentCounts[b] ? a : b)
          : 'neutral';

        const tagCounts: Record<string, number> = {};
        allMemories.forEach(mem => mem.tagIds?.forEach(tagId => {
          tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
        }));
        const mostFrequentTagId = Object.keys(tagCounts).length > 0
          ? Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b)
          : '';
        const mostFrequentTag = useAppContext().allTags.find(t => t.id === mostFrequentTagId)?.name || 'N/A';

        setStats({ totalMemories, avgSentiment, mostFrequentTag });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Your Personal Historian Dashboard</h2>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <p className="text-gray-400 text-sm">Total Memories</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.totalMemories}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <p className="text-gray-400 text-sm">Overall Sentiment</p>
            <p className={`text-3xl font-bold ${
              stats.avgSentiment === 'positive' ? 'text-green-400' :
              stats.avgSentiment === 'negative' ? 'text-red-400' :
              stats.avgSentiment === 'mixed' ? 'text-yellow-400' : 'text-gray-400'
            }`}>{stats.avgSentiment.charAt(0).toUpperCase() + stats.avgSentiment.slice(1)}</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <p className="text-gray-400 text-sm">Most Frequent Tag</p>
            <p className="text-3xl font-bold text-indigo-400">{stats.mostFrequentTag}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations & Insights</h3>
          {recommendations.length > 0 ? (
            <ul className="space-y-4">
              {recommendations.map(rec => (
                <li key={rec.id} className="border-b border-gray-700 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-cyan-300 text-lg">{rec.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      rec.priority === 'high' ? 'bg-red-800 text-red-100' :
                      rec.priority === 'medium' ? 'bg-yellow-800 text-yellow-100' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {rec.priority || 'medium'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{rec.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    {rec.actionUrl && (
                      <a href={rec.actionUrl} className="text-cyan-500 hover:underline mr-4">View Details</a>
                    )}
                    <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No new recommendations at the moment.</p>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Memories</h3>
          {recentMemories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentMemories.map(memory => (
                <MemoryCard key={memory.id} memory={memory} onClick={() => console.log('View memory', memory.id)} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent memories found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const { notifications, fetchNotifications, markNotificationRead } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchNotifications();
      } catch (err) {
        setError('Failed to load notifications.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [fetchNotifications]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6 flex justify-between items-center">
        Notification Center
        {unreadCount > 0 && <span className="bg-red-600 text-white text-sm px-3 py-1 rounded-full">{unreadCount} Unread</span>}
      </h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map(notif => (
            <li
              key={notif.id}
              className={`bg-gray-800 p-4 rounded-lg shadow-md flex items-start ${!notif.read ? 'border-l-4 border-cyan-500' : 'border-l-4 border-gray-700'}`}
            >
              <div className="flex-shrink-0 mr-4">
                {notif.type === 'info' && <span className="text-blue-400 text-2xl">i</span>}
                {notif.type === 'warning' && <span className="text-yellow-400 text-2xl">!</span>}
                {notif.type === 'error' && <span className="text-red-400 text-2xl">✕</span>}
                {notif.type === 'success' && <span className="text-green-400 text-2xl">✓</span>}
              </div>
              <div className="flex-grow">
                <p className={`font-semibold text-lg ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.message}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(notif.timestamp).toLocaleString()}
                </p>
                <div className="mt-3 flex space-x-3">
                  {notif.actionUrl && (
                    <a href={notif.actionUrl} className="text-cyan-500 hover:underline text-sm">View Details</a>
                  )}
                  {!notif.read && (
                    <button onClick={() => markNotificationRead(notif.id)} className="text-gray-400 hover:text-white text-sm">Mark as Read</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const UserProfileSettings: React.FC = () => {
  const { userProfile, setUserProfile, aiSettings, setAiSettings } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileFormData, setProfileFormData] = useState<UserProfile | null>(userProfile);
  const [aiSettingsFormData, setAiSettingsFormData] = useState<AISettings | null>(aiSettings);

  useEffect(() => {
    setProfileFormData(userProfile);
    setAiSettingsFormData(aiSettings);
  }, [userProfile, aiSettings]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (profileFormData) {
      if (name.startsWith('preferences.')) {
        const prefName = name.split('.')[1] as keyof UserPreferences;
        setProfileFormData({
          ...profileFormData,
          preferences: {
            ...profileFormData.preferences,
            [prefName]: type === 'checkbox' ? checked : value,
          },
        });
      } else if (name.startsWith('notificationSettings.')) {
        const notifSettingName = name.split('.')[1] as keyof UserPreferences['notificationSettings'];
        setProfileFormData({
          ...profileFormData,
          preferences: {
            ...profileFormData.preferences,
            notificationSettings: {
              ...profileFormData.preferences.notificationSettings,
              [notifSettingName]: checked,
            },
          },
        });
      } else if (name.startsWith('privacySettings.')) {
        const privacySettingName = name.split('.')[1] as keyof UserPreferences['privacySettings'];
        setProfileFormData({
          ...profileFormData,
          preferences: {
            ...profileFormData.preferences,
            privacySettings: {
              ...profileFormData.preferences.privacySettings,
              [privacySettingName]: type === 'checkbox' ? checked : value,
            },
          },
        });
      } else {
        setProfileFormData({ ...profileFormData, [name]: value });
      }
    }
  };

  const handleAISettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (aiSettingsFormData) {
      if (name.startsWith('aiModelAccessKeys.')) {
        const modelName = name.split('.')[1];
        setAiSettingsFormData({
          ...aiSettingsFormData,
          aiModelAccessKeys: {
            ...aiSettingsFormData.aiModelAccessKeys,
            [modelName]: value,
          },
        });
      } else {
        setAiSettingsFormData({ ...aiSettingsFormData, [name]: type === 'checkbox' ? checked : value });
      }
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFormData) return;
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await api.updateUserProfile(profileFormData);
      setUserProfile(updatedProfile);
      alert('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAISettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSettingsFormData) return;
    setLoading(true);
    setError(null);
    try {
      const updatedAISettings = await api.updateAISettings(aiSettingsFormData);
      setAiSettings(updatedAISettings);
      alert('AI Settings updated successfully!');
    } catch (err) {
      setError('Failed to update AI settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profileFormData || !aiSettingsFormData) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">User Profile & Settings</h2>

      {error && <ErrorMessage message={error} />}

      {/* User Profile Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">User Profile</h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-1">Name</label>
            <input type="text" id="name" name="name" value={profileFormData.name} onChange={handleProfileChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-1">Email</label>
            <input type="email" id="email" name="email" value={profileFormData.email} onChange={handleProfileChange} disabled
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white opacity-70 cursor-not-allowed" />
          </div>
          <div>
            <label htmlFor="avatarUrl" className="block text-gray-300 text-sm font-bold mb-1">Avatar URL</label>
            <input type="url" id="avatarUrl" name="avatarUrl" value={profileFormData.avatarUrl || ''} onChange={handleProfileChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-gray-300 text-sm font-bold mb-1">Bio</label>
            <textarea id="bio" name="bio" value={profileFormData.bio || ''} onChange={handleProfileChange} rows={3}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"></textarea>
          </div>

          <h4 className="text-lg font-semibold text-gray-200 mt-6 mb-2">Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="theme" className="block text-gray-300 text-sm font-bold mb-1">Theme</label>
              <select id="theme" name="preferences.theme" value={profileFormData.preferences.theme} onChange={handleProfileChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div>
              <label htmlFor="defaultView" className="block text-gray-300 text-sm font-bold mb-1">Default View</label>
              <select id="defaultView" name="preferences.defaultView" value={profileFormData.preferences.defaultView} onChange={handleProfileChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white">
                <option value="dashboard">Dashboard</option>
                <option value="timeline">Timeline</option>
                <option value="map">Map</option>
              </select>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-gray-200 mt-6 mb-2">Notification Settings</h4>
          <div className="space-y-2">
            <label className="flex items-center text-gray-300">
              <input type="checkbox" name="notificationSettings.memoryAnniversaries" checked={profileFormData.preferences.notificationSettings.memoryAnniversaries} onChange={handleProfileChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2">Memory Anniversaries</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" name="notificationSettings.newInsights" checked={profileFormData.preferences.notificationSettings.newInsights} onChange={handleProfileChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2">New AI Insights</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" name="notificationSettings.aiProcessingComplete" checked={profileFormData.preferences.notificationSettings.aiProcessingComplete} onChange={handleProfileChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2">AI Processing Complete</span>
            </label>
          </div>

          <h4 className="text-lg font-semibold text-gray-200 mt-6 mb-2">Privacy Settings</h4>
          <div className="space-y-2">
            <div>
              <label htmlFor="dataRetentionDays" className="block text-gray-300 text-sm font-bold mb-1">Data Retention (Days)</label>
              <input type="number" id="dataRetentionDays" name="privacySettings.dataRetentionDays" value={profileFormData.preferences.privacySettings.dataRetentionDays} onChange={handleProfileChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white" />
            </div>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" name="privacySettings.anonymizeInsights" checked={profileFormData.preferences.privacySettings.anonymizeInsights} onChange={handleProfileChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2">Anonymize Insights for AI Training</span>
            </label>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold disabled:opacity-50">
              {loading ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Settings Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-white mb-4">AI Service Settings</h3>
        <form onSubmit={handleAISettingsSave} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-gray-300">
              <input type="checkbox" name="enableAutoTagging" checked={aiSettingsFormData.enableAutoTagging} onChange={handleAISettingsChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2">Enable Auto-Tagging for New Memories</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" name="enableSentimentAnalysis" checked={aiSettingsFormData.enableSentimentAnalysis} onChange={handleAISettingsChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2">Enable Sentiment Analysis</span>
            </label>
            <label className="flex items-center text-gray-300">
              <input type="checkbox" name="enableVRSceneGeneration" checked={aiSettingsFormData.enableVRSceneGeneration} onChange={handleAISettingsChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
              <span className="ml-2">Enable VR Scene Generation (Experimental)</span>
            </label>
          </div>

          <div>
            <label htmlFor="preferredTranscriptionModel" className="block text-gray-300 text-sm font-bold mb-1">Preferred Transcription Model</label>
            <select id="preferredTranscriptionModel" name="preferredTranscriptionModel" value={aiSettingsFormData.preferredTranscriptionModel} onChange={handleAISettingsChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white">
              <option value="WhisperV3">Whisper V3 (High Accuracy)</option>
              <option value="BasicASR">Basic ASR (Faster, Lower Cost)</option>
            </select>
          </div>
          <div>
            <label htmlFor="preferredImageAnalysisModel" className="block text-gray-300 text-sm font-bold mb-1">Preferred Image Analysis Model</label>
            <select id="preferredImageAnalysisModel" name="preferredImageAnalysisModel" value={aiSettingsFormData.preferredImageAnalysisModel} onChange={handleAISettingsChange}
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white">
              <option value="VisionPro">VisionPro (Advanced)</option>
              <option value="BasicVision">BasicVision (Standard)</option>
            </select>
          </div>

          <h4 className="text-lg font-semibold text-gray-200 mt-6 mb-2">AI Model Access Keys</h4>
          <p className="text-gray-400 text-sm mb-2">Enter your API keys for third-party AI services. These are stored securely.</p>
          <div className="space-y-2">
            {Object.keys(aiSettingsFormData.aiModelAccessKeys).map(modelName => (
              <div key={modelName}>
                <label htmlFor={`key-${modelName}`} className="block text-gray-300 text-sm font-bold mb-1">{modelName} API Key</label>
                <input
                  type="password"
                  id={`key-${modelName}`}
                  name={`aiModelAccessKeys.${modelName}`}
                  value={aiSettingsFormData.aiModelAccessKeys[modelName]}
                  onChange={handleAISettingsChange}
                  placeholder={`Enter ${modelName} API Key`}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                />
              </div>
            ))}
            {/* Add more key inputs if new models are added */}
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold disabled:opacity-50">
              {loading ? 'Saving AI Settings...' : 'Save AI Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchStaticData = useCallback(async () => {
    try {
      const [profile, settings, people, locations, tags] = await Promise.all([
        api.getUserProfile(),
        api.getAISettings(),
        api.getPeople(),
        api.getLocations(),
        api.getTags(),
      ]);
      setUserProfile(profile);
      setAiSettings(settings);
      setAllPeople(people);
      setAllLocations(locations);
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to load initial app data:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      const updatedNotif = await api.markNotificationAsRead(id);
      if (updatedNotif) {
        setNotifications(prev => prev.map(n => n.id === id ? updatedNotif : n));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  useEffect(() => {
    fetchStaticData();
    fetchNotifications();
  }, [fetchStaticData, fetchNotifications]);

  const contextValue = {
    userProfile, setUserProfile,
    aiSettings, setAiSettings,
    allPeople, allLocations, allTags,
    fetchStaticData,
    notifications, fetchNotifications, markNotificationRead,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// --- Main Application Component (Enhanced) ---

export const PersonalHistorianAIView: React.FC = () => {
  const { userProfile, notifications, fetchNotifications } = useAppContext();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'search' | 'create' | 'edit' | 'settings' | 'notifications' | 'timeline'>('dashboard');
  const [memoryToEdit, setMemoryToEdit] = useState<Memory | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const memoriesPerPage = 20;

  useEffect(() => {
    if (userProfile?.preferences.defaultView) {
      setCurrentView(userProfile.preferences.defaultView);
    }
  }, [userProfile]);

  const handleRecall = useCallback(async (params?: { query?: string; tagIds?: string[]; peopleIds?: string[]; locationId?: string; startDate?: string; endDate?: string; sentiment?: string; reset?: boolean }) => {
    setIsLoading(true);
    setError(null);
    const currentPage = params?.reset ? 0 : page;
    try {
      const response = await api.getMemories({
        ...params,
        query: params?.query || query,
        limit: memoriesPerPage,
        offset: currentPage * memoriesPerPage,
      });
      if (params?.reset) {
        setSearchResults(response.data);
      } else {
        setSearchResults(prev => [...prev, ...response.data]);
      }
      setTotalResults(response.total);
      setHasMore(response.data.length === memoriesPerPage);
      setPage(currentPage + 1);
      if (response.data.length > 0) {
        // For the original query, still show the first result directly if nothing else is specified.
        // For general search, we show a list.
        if (!params?.tagIds && !params?.peopleIds && !params?.locationId && !params?.startDate && !params?.endDate && !params?.sentiment && response.data.length === 1) {
             setSelectedMemory(response.data[0]);
        }
        await api.addSearchHistoryEntry(params?.query || query, response.data.length);
      }
    } catch (err) {
      setError('Failed to recall memory. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, page, memoriesPerPage]);

  const handleInitialRecall = async () => {
    // This is for the simple search box at the top, like the original component
    if (!query.trim()) return;
    setSearchResults([]);
    setSelectedMemory(null);
    setPage(0);
    setHasMore(true);
    await handleRecall({ query: query, reset: true });
  };

  const handleAdvancedSearch = async (params: any) => {
    setCurrentView('search');
    setSearchResults([]);
    setSelectedMemory(null);
    setPage(0);
    setHasMore(true);
    await handleRecall({ ...params, reset: true });
  };

  const handleViewMemory = useCallback(async (memoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const memory = await api.getMemoryById(memoryId);
      if (memory) {
        setSelectedMemory(memory);
        setCurrentView('search'); // Stay on search view, but show detail
      } else {
        setError('Memory not found.');
      }
    } catch (err) {
      setError('Failed to fetch memory details.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateMemory = () => {
    setMemoryToEdit(null);
    setCurrentView('create');
  };

  const handleEditMemory = (id: string) => {
    const memory = searchResults.find(m => m.id === id) || mockMemories.find(m => m.id === id); // Also check mock data
    if (memory) {
      setMemoryToEdit(memory);
      setCurrentView('edit');
    } else {
      setError('Memory not found for editing.');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteMemory(id);
      setSearchResults(prev => prev.filter(m => m.id !== id));
      setSelectedMemory(null);
      alert('Memory deleted successfully!');
    } catch (err) {
      setError('Failed to delete memory.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMemory = async (memoryData: Partial<Memory>) => {
    setIsLoading(true);
    setError(null);
    try {
      let savedMemory: Memory;
      if (memoryData.id) {
        savedMemory = (await api.updateMemory(memoryData.id, memoryData)) as Memory;
        setSearchResults(prev => prev.map(m => m.id === savedMemory.id ? savedMemory : m));
        if (selectedMemory?.id === savedMemory.id) setSelectedMemory(savedMemory);
      } else {
        savedMemory = await api.createMemory(memoryData);
        setSearchResults(prev => [savedMemory, ...prev]);
      }
      setCurrentView('search'); // Go back to search or dashboard after save
      setSelectedMemory(savedMemory); // Show the newly created/edited memory
      alert('Memory saved successfully!');
    } catch (err) {
      setError('Failed to save memory.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setMemoryToEdit(null);
    setCurrentView('search'); // Or dashboard, depending on context
  };

  // Simplified navigation
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-gray-800 p-6 flex flex-col shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-cyan-400">Historian AI</h1>
        <div className="flex flex-col space-y-4 flex-grow">
          <button onClick={() => setCurrentView('dashboard')} className={`p-3 text-left rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}>Dashboard</button>
          <button onClick={() => setCurrentView('search')} className={`p-3 text-left rounded-lg transition-colors ${currentView === 'search' ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}>Search Memories</button>
          <button onClick={handleCreateMemory} className={`p-3 text-left rounded-lg transition-colors ${currentView === 'create' ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}>Add New Memory</button>
          <button onClick={() => setCurrentView('timeline')} className={`p-3 text-left rounded-lg transition-colors ${currentView === 'timeline' ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}>Timeline View</button>
          <button onClick={() => setCurrentView('settings')} className={`p-3 text-left rounded-lg transition-colors ${currentView === 'settings' ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}>Settings</button>
          <button onClick={() => setCurrentView('notifications')} className={`p-3 text-left rounded-lg transition-colors flex items-center justify-between ${currentView === 'notifications' ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}>
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{unreadNotificationsCount}</span>}
          </button>
        </div>
        {userProfile && (
          <div className="mt-8 pt-4 border-t border-gray-700 flex items-center">
            <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-10 h-10 rounded-full object-cover mr-3" />
            <div>
              <p className="font-semibold">{userProfile.name}</p>
              <p className="text-sm text-gray-400">{userProfile.email}</p>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Search Bar - always visible */}
        <div className="flex gap-2 mb-6 bg-gray-800 p-4 rounded-lg shadow-md sticky top-0 z-10">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={e => { if (e.key === 'Enter') handleInitialRecall(); }}
            placeholder="Quick recall: 'Trip to Italy', 'My first marathon', 'Meeting with Sarah'"
            className="flex-grow p-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500"
          />
          <button onClick={handleInitialRecall} disabled={isLoading} className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold disabled:opacity-50 transition-colors">Recall</button>
          <button onClick={() => setCurrentView('search')} className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold disabled:opacity-50 transition-colors">Advanced Search</button>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Dynamic View Rendering */}
        {currentView === 'dashboard' && <DashboardInsights />}

        {currentView === 'search' && (
          <>
            <AdvancedSearchForm onSearch={handleAdvancedSearch} isLoading={isLoading} />
            <h2 className="text-3xl font-bold mb-6 text-white">Search Results</h2>
            {isLoading && searchResults.length === 0 && <LoadingSpinner />}
            {searchResults.length === 0 && !isLoading && !error && <p className="text-gray-500">No memories found for your query. Try a different search!</p>}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map(mem => (
                  <MemoryCard key={mem.id} memory={mem} onClick={() => handleViewMemory(mem.id)} />
                ))}
              </div>
            )}
            {hasMore && searchResults.length > 0 && !isLoading && (
              <div className="text-center mt-8">
                <button onClick={() => handleRecall({ query: query, reset: false })} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold disabled:opacity-50">Load More Memories</button>
              </div>
            )}
            {isLoading && searchResults.length > 0 && <LoadingSpinner />}
            {selectedMemory && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-4xl">&times;</button>
                  <MemoryDetailComponent memory={selectedMemory} onEdit={handleEditMemory} onDelete={handleDeleteMemory} />
                </div>
              </div>
            )}
          </>
        )}

        {currentView === 'create' && (
          <MemoryEditorComponent onSave={handleSaveMemory} onCancel={() => setCurrentView('dashboard')} isLoading={isLoading} />
        )}

        {currentView === 'edit' && memoryToEdit && (
          <MemoryEditorComponent memory={memoryToEdit} onSave={handleSaveMemory} onCancel={handleCancelEdit} isLoading={isLoading} />
        )}

        {currentView === 'timeline' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-3xl font-bold mb-6 text-white">Memory Timeline (Coming Soon)</h2>
            <p className="text-gray-500">This section will display your memories in a chronological, interactive timeline view. Stay tuned for updates!</p>
            <div className="mt-4 border-t border-gray-700 pt-4">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Mock Timeline Data Preview</h3>
              {mockMemories.slice(0, 5).map((memory, index) => (
                <div key={memory.id} className="relative pl-6 pb-8 border-l-2 border-gray-700 last:border-l-0">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-cyan-600 rounded-full"></div>
                  <p className="text-gray-400 text-sm">{new Date(memory.timestamp).toLocaleDateString()}</p>
                  <p className="text-white font-semibold text-lg">{memory.title}</p>
                  <p className="text-gray-500 text-sm">{memory.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'settings' && <UserProfileSettings />}

        {currentView === 'notifications' && <NotificationCenter />}
      </main>
    </div>
  );
};

// Root component that provides the context. This will wrap the main view.
const PersonalHistorianAIApp: React.FC = () => (
  <AppProvider>
    <PersonalHistorianAIView />
  </AppProvider>
);

export default PersonalHistorianAIApp;
```