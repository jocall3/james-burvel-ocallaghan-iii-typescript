// components/views/platform/InventionsView.tsx
import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef, FC, memo, createContext, useContext } from 'react';
import Card from '../../Card';

interface Document {
    path: string;
    title: string;
    type: 'Invention' | 'Prototype';
}

// In a real app with a backend, we'd fetch this list from an API.
// Here, we hardcode it to represent the files we are creating.
const DOCUMENT_LIST: Document[] = Array.from({ length: 100 }, (_, i) => ({
    path: `/inventions/${String(i + 1).padStart(3, '0')}_${'invention_name'}.md`,
    title: `Invention #${String(i + 1).padStart(3, '0')}`,
    type: 'Invention'
}));

const PROTOTYPE_LIST: Document[] = Array.from({ length: 100 }, (_, i) => ({
    path: `/prototypes/prototype_${String(i + 1).padStart(3, '0')}.md`,
    title: `Prototype #${String(i + 1).padStart(3, '0')}`,
    type: 'Prototype'
}));

// Manually update the known titles for the files we have full content for.
const updateKnownTitles = (doc: Document) => {
    const knownTitles: Record<string, string> = {
        '/inventions/001_generative_ui_background.md': "Generative UI Backgrounds",
        '/inventions/002_ai_contextual_prompt_suggestion.md': "AI Contextual Prompts",
        '/prototypes/prototype_001.md': "The Sovereign's Key",
        '/prototypes/prototype_002.md': "The Oracle's Lens",
        '/prototypes/prototype_003.md': "The Weaver's Blueprints",
    };
    if (knownTitles[doc.path]) {
        return { ...doc, title: knownTitles[doc.path] };
    }
    return doc;
};

// =================================================================================================
// BEGINNING OF ENHANCEMENT
// The following code represents a significant expansion of the component for a real-world application.
// =================================================================================================

// --------------------------------------------------
// ADVANCED TYPES AND INTERFACES
// --------------------------------------------------

export type DocumentType = 'Invention' | 'Prototype' | 'ResearchPaper' | 'PatentApplication';
export type DocumentStatus = 'Draft' | 'In Review' | 'Approved' | 'Archived' | 'Rejected';
export type UserRole = 'Scientist' | 'Engineer' | 'ProjectManager' | 'Legal' | 'Admin';
export type ViewMode = 'list' | 'grid';
export type SortDirection = 'asc' | 'desc';
export type SortableField = 'title' | 'updatedAt' | 'createdAt' | 'type' | 'status';
export type ModalType = 'newDocument' | 'deleteConfirm' | 'bulkEditTags' | 'shareDocument';

/**
 * Represents a user in the system.
 */
export interface User {
    id: string;
    name: string;
    avatarUrl: string;
    role: UserRole;
    email: string;
}

/**
 * Represents a tag that can be applied to documents.
 */
export interface Tag {
    id: string;
    label: string;
    color: string;
}

/**
 * Represents a comment on a document.
 */
export interface Comment {
    id: string;
    author: User;
    timestamp: string;
    content: string;
    replies: Comment[];
}

/**
 * Represents a specific version of a document in its history.
 */
export interface Version {
    versionNumber: number;
    timestamp: string;
    author: User;
    summary: string;
    contentHash: string; // A fictional hash to represent the content at this version
}

/**
 * Defines access control permissions for a document.
 */
export interface AccessControl {
    view: UserRole[];
    edit: UserRole[];
    comment: UserRole[];
    manage: UserRole[];
}

/**
 * Represents a link to an external project management system.
 */
export interface ProjectLink {
    projectId: string;
    projectName: string;
    status: 'Active' | 'Completed' | 'On Hold';
}

/**
 * Represents a comprehensive document object, extending the original simple one.
 */
export interface EnhancedDocument {
    id: string;
    path: string;
    title: string;
    type: DocumentType;
    status: DocumentStatus;
    createdAt: string;
    updatedAt: string;
    author: User;
    contributors: User[];
    tags: Tag[];
    abstract: string;
    versionHistory: Version[];
    comments: Comment[];
    accessControl: AccessControl;
    relatedDocuments: string[]; // An array of document IDs
    projectLinks: ProjectLink[];
    isFavorite: boolean;
    content?: string; // Full markdown content, loaded on demand
}

/**
 * Represents the state of filters applied to the document list.
 */
export interface FilterState {
    searchTerm: string;
    types: DocumentType[];
    stati: DocumentStatus[];
    tags: string[]; // Tag IDs
    authorIds: string[];
    isFavorite: boolean | null;
}

/**
 * Represents the sorting configuration for the document list.
 */
export interface SortState {
    field: SortableField;
    direction: SortDirection;
}

/**
 * Props for the main application state reducer.
 */
export interface AppState {
    documents: EnhancedDocument[];
    allUsers: User[];
    allTags: Tag[];
    selectedDocId: string | null;
    isLoadingList: boolean;
    isLoadingContent: boolean;
    error: string | null;
    filters: FilterState;
    sorting: SortState;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
    };
    viewMode: ViewMode;
    selectedDocumentIdsForBulkAction: Set<string>;
    activeModal: ModalType | null;
}

/**
 * Represents actions for the application state reducer.
 */
export type AppAction =
    | { type: 'FETCH_INIT' }
    | { type: 'FETCH_SUCCESS'; payload: { documents: EnhancedDocument[], allUsers: User[], allTags: Tag[] } }
    | { type: 'FETCH_FAILURE'; payload: string }
    | { type: 'SELECT_DOCUMENT'; payload: string | null }
    | { type: 'LOAD_CONTENT_START' }
    | { type: 'LOAD_CONTENT_SUCCESS'; payload: { docId: string, content: string } }
    | { type: 'LOAD_CONTENT_FAILURE'; payload: string }
    | { type: 'UPDATE_FILTERS'; payload: Partial<FilterState> }
    | { type: 'UPDATE_SORTING'; payload: SortState }
    | { type: 'SET_VIEW_MODE'; payload: ViewMode }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'TOGGLE_BULK_SELECT'; payload: string }
    | { type: 'CLEAR_BULK_SELECT' }
    | { type: 'SELECT_ALL_VISIBLE' }
    | { type: 'OPEN_MODAL'; payload: ModalType }
    | { type: 'CLOSE_MODAL' }
    | { type: 'UPDATE_DOCUMENT'; payload: Partial<EnhancedDocument> & { id: string } };

// --------------------------------------------------
// MOCK DATA GENERATION AND API SERVICE
// --------------------------------------------------

const LOREM_IPSUM_ABSTRACT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.";
const LOREM_IPSUM_CONTENT = `# ${'Title'}\n\n## Overview\n\n${LOREM_IPSUM_ABSTRACT}\n\n### Key Features\n\n- Feature A: Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.\n- Feature B: Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.\n- Feature C: In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.\n\n## Technical Specification\n\n\`\`\`json\n{\n  "version": "1.0.0",\n  "spec": {\n    "power_requirement": "5V",\n    "operating_temperature": "-20C to 85C"\n  }\n}\n\`\`\`\n\n## Conclusion\n\nNullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.`;

const MOCK_USERS: User[] = [
    { id: 'user_1', name: 'Dr. Evelyn Reed', avatarUrl: '/avatars/1.png', role: 'Scientist', email: 'e.reed@example.com' },
    { id: 'user_2', name: 'Kenji Tanaka', avatarUrl: '/avatars/2.png', role: 'Engineer', email: 'k.tanaka@example.com' },
    { id: 'user_3', name: 'Maria Garcia', avatarUrl: '/avatars/3.png', role: 'ProjectManager', email: 'm.garcia@example.com' },
    { id: 'user_4', name: 'David Chen', avatarUrl: '/avatars/4.png', role: 'Legal', email: 'd.chen@example.com' },
    { id: 'user_5', name: 'Aisha Khan', avatarUrl: '/avatars/5.png', role: 'Admin', email: 'a.khan@example.com' },
];

const MOCK_TAGS: Tag[] = [
    { id: 'tag_1', label: 'Quantum Computing', color: '#4A90E2' },
    { id: 'tag_2', label: 'AI/ML', color: '#D0021B' },
    { id: 'tag_3', label: 'Biotechnology', color: '#50E3C2' },
    { id: 'tag_4', label: 'Robotics', color: '#F5A623' },
    { id: 'tag_5', label: 'Materials Science', color: '#BD10E0' },
    { id: 'tag_6', label: 'Energy', color: '#F8E71C' },
    { id: 'tag_7', label: 'Core Tech', color: '#7ED321' },
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = <T>(arr: T[], maxCount: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * (maxCount + 1)));
};

/**
 * Generates a large set of mock documents for the application.
 * @param count - The number of documents to generate.
 * @returns An array of EnhancedDocument objects.
 */
export const generateMockDocuments = (count: number): EnhancedDocument[] => {
    const documents: EnhancedDocument[] = [];
    const originalDocs = [...DOCUMENT_LIST, ...PROTOTYPE_LIST].map(updateKnownTitles);

    for (let i = 0; i < count; i++) {
        const originalDoc = i < originalDocs.length ? originalDocs[i] : null;
        const creationDate = new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 365);
        const updateDate = new Date(creationDate.getTime() + Math.random() * (Date.now() - creationDate.getTime()));
        const author = getRandomElement(MOCK_USERS);
        const type = originalDoc ? (originalDoc.type as DocumentType) : getRandomElement(['Invention', 'Prototype', 'ResearchPaper', 'PatentApplication']);

        documents.push({
            id: `doc_${i + 1}`,
            path: originalDoc ? originalDoc.path : `/generated/${type.toLowerCase()}_${String(i + 1).padStart(3, '0')}.md`,
            title: originalDoc ? originalDoc.title : `${type} #${String(i + 1).padStart(3, '0')}`,
            type,
            status: getRandomElement(['Draft', 'In Review', 'Approved', 'Archived', 'Rejected']),
            createdAt: creationDate.toISOString(),
            updatedAt: updateDate.toISOString(),
            author,
            contributors: getRandomSubset(MOCK_USERS.filter(u => u.id !== author.id), 3),
            tags: getRandomSubset(MOCK_TAGS, 4),
            abstract: LOREM_IPSUM_ABSTRACT,
            versionHistory: Array.from({ length: Math.ceil(Math.random() * 5) }, (_, v) => ({
                versionNumber: v + 1,
                timestamp: new Date(creationDate.getTime() + (updateDate.getTime() - creationDate.getTime()) * (v / 5)).toISOString(),
                author: getRandomElement([author, ...MOCK_USERS]),
                summary: `Version ${v + 1} changes.`,
                contentHash: `hash_${i}_${v}`
            })),
            comments: [],
            accessControl: {
                view: ['Scientist', 'Engineer', 'ProjectManager', 'Legal', 'Admin'],
                edit: ['Scientist', 'Engineer'],
                comment: ['Scientist', 'Engineer', 'ProjectManager'],
                manage: ['Admin']
            },
            relatedDocuments: [],
            projectLinks: Math.random() > 0.7 ? [{
                projectId: `PROJ-${Math.floor(Math.random() * 100)}`,
                projectName: 'Project Phoenix',
                status: 'Active'
            }] : [],
            isFavorite: Math.random() > 0.8,
        });
    }

    // Add some known content for demonstration
    const contentMap: Record<string, string> = {
        '/prototypes/prototype_001.md': `# The Sovereign's Key\n\nThis is the detailed markdown for The Sovereign's Key. It unlocks...`,
        '/inventions/001_generative_ui_background.md': `# Generative UI Backgrounds\n\nThis document details the algorithm for creating dynamic, generative backgrounds...`
    };
    documents.forEach(doc => {
        if (contentMap[doc.path]) {
            doc.content = contentMap[doc.path];
        }
    });

    return documents;
};

let MOCK_DB: { documents: EnhancedDocument[], users: User[], tags: Tag[] } = {
    documents: [],
    users: [],
    tags: []
};
const initializeDb = () => {
    if (MOCK_DB.documents.length === 0) {
        MOCK_DB.documents = generateMockDocuments(250);
        MOCK_DB.users = MOCK_USERS;
        MOCK_DB.tags = MOCK_TAGS;
    }
};

/**
 * A mock API service to simulate backend interactions.
 */
export const mockApiService = {
    fetchInitialData: (): Promise<{ documents: EnhancedDocument[], allUsers: User[], allTags: Tag[] }> => {
        initializeDb();
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ documents: MOCK_DB.documents, allUsers: MOCK_DB.users, allTags: MOCK_DB.tags });
            }, 1000);
        });
    },
    fetchDocumentContent: (docId: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const doc = MOCK_DB.documents.find(d => d.id === docId);
                if (doc) {
                    if (doc.content) {
                        resolve(doc.content);
                    } else if (doc.path.startsWith('/')) {
                         fetch(doc.path)
                            .then(response => {
                                if (!response.ok) throw new Error('Document not found on server');
                                return response.text();
                            })
                            .then(text => {
                                MOCK_DB.documents.find(d => d.id === docId)!.content = text;
                                resolve(text);
                            })
                            .catch(() => {
                                const generatedContent = LOREM_IPSUM_CONTENT.replace('Title', doc.title);
                                MOCK_DB.documents.find(d => d.id === docId)!.content = generatedContent;
                                resolve(generatedContent);
                            });
                    } else {
                        const generatedContent = LOREM_IPSUM_CONTENT.replace('Title', doc.title);
                        MOCK_DB.documents.find(d => d.id === docId)!.content = generatedContent;
                        resolve(generatedContent);
                    }
                } else {
                    reject(new Error("Document not found in mock DB."));
                }
            }, 500);
        });
    },
    updateDocument: (docUpdate: Partial<EnhancedDocument> & { id: string }): Promise<EnhancedDocument> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const docIndex = MOCK_DB.documents.findIndex(d => d.id === docUpdate.id);
                if (docIndex > -1) {
                    MOCK_DB.documents[docIndex] = { ...MOCK_DB.documents[docIndex], ...docUpdate, updatedAt: new Date().toISOString() };
                    resolve(MOCK_DB.documents[docIndex]);
                } else {
                    reject(new Error("Document not found."));
                }
            }, 300);
        });
    }
};

// --------------------------------------------------
// UTILITY FUNCTIONS & CUSTOM HOOKS
// --------------------------------------------------

/**
 * Custom hook for debouncing a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

/**
 * Formats an ISO date string into a more readable format.
 * @param isoString The ISO date string.
 * @returns A formatted date string (e.g., "Jan 1, 2023").
 */
export const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// --------------------------------------------------
// STATE MANAGEMENT (Reducer and Context)
// --------------------------------------------------

const initialState: AppState = {
    documents: [],
    allUsers: [],
    allTags: [],
    selectedDocId: null,
    isLoadingList: true,
    isLoadingContent: false,
    error: null,
    filters: {
        searchTerm: '',
        types: [],
        stati: [],
        tags: [],
        authorIds: [],
        isFavorite: null,
    },
    sorting: {
        field: 'updatedAt',
        direction: 'desc',
    },
    pagination: {
        currentPage: 1,
        pageSize: 25,
        totalCount: 0,
    },
    viewMode: 'list',
    selectedDocumentIdsForBulkAction: new Set(),
    activeModal: null,
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, isLoadingList: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoadingList: false,
                documents: action.payload.documents,
                allUsers: action.payload.allUsers,
                allTags: action.payload.allTags
            };
        case 'FETCH_FAILURE':
            return { ...state, isLoadingList: false, error: action.payload };
        case 'SELECT_DOCUMENT':
            return { ...state, selectedDocId: action.payload, isLoadingContent: !!action.payload };
        case 'LOAD_CONTENT_START':
            return { ...state, isLoadingContent: true };
        case 'LOAD_CONTENT_SUCCESS':
            const newDocs = state.documents.map(doc =>
                doc.id === action.payload.docId ? { ...doc, content: action.payload.content } : doc
            );
            return { ...state, isLoadingContent: false, documents: newDocs };
        case 'LOAD_CONTENT_FAILURE':
            return { ...state, isLoadingContent: false, error: action.payload };
        case 'UPDATE_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload }, pagination: {...state.pagination, currentPage: 1} };
        case 'UPDATE_SORTING':
            return { ...state, sorting: action.payload };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'SET_PAGE':
            return { ...state, pagination: { ...state.pagination, currentPage: action.payload } };
        case 'TOGGLE_BULK_SELECT':
            const newSelectionSet = new Set(state.selectedDocumentIdsForBulkAction);
            if (newSelectionSet.has(action.payload)) {
                newSelectionSet.delete(action.payload);
            } else {
                newSelectionSet.add(action.payload);
            }
            return { ...state, selectedDocumentIdsForBulkAction: newSelectionSet };
        case 'CLEAR_BULK_SELECT':
            return { ...state, selectedDocumentIdsForBulkAction: new Set() };
        case 'SELECT_ALL_VISIBLE': // Placeholder logic
            return { ...state, selectedDocumentIdsForBulkAction: new Set(state.documents.map(d => d.id)) };
        case 'OPEN_MODAL':
            return { ...state, activeModal: action.payload };
        case 'CLOSE_MODAL':
            return { ...state, activeModal: null };
        case 'UPDATE_DOCUMENT':
            return {
                ...state,
                documents: state.documents.map(doc =>
                    doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
                ),
            };
        default:
            return state;
    }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | null>(null);

/**
 * Custom hook to use the app context.
 */
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// --------------------------------------------------
// SUB-COMPONENTS
// --------------------------------------------------

/**
 * A generic loading spinner component.
 */
export const Spinner: FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    </div>
);

/**
 * A component to display an error message.
 */
export const ErrorDisplay: FC<{ message: string }> = ({ message }) => (
    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
        <p className="font-bold">An Error Occurred</p>
        <p className="text-sm">{message}</p>
    </div>
);

/**
 * Displays user avatar and name.
 */
export const UserAvatar: FC<{ user: User }> = ({ user }) => (
    <div className="flex items-center space-x-2">
        <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full" />
        <span className="text-sm text-gray-300">{user.name}</span>
    </div>
);

/**
 * Renders a single tag.
 */
export const TagChip: FC<{ tag: Tag }> = ({ tag }) => (
    <span
        className="px-2 py-0.5 text-xs font-semibold rounded-full"
        style={{ backgroundColor: `${tag.color}30`, color: tag.color, border: `1px solid ${tag.color}80` }}
    >
        {tag.label}
    </span>
);


/**
 * Toolbar with view mode switch, actions, etc.
 */
export const CodexToolbar: FC<{
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onNewDocument: () => void;
}> = memo(({ viewMode, onViewModeChange, onNewDocument }) => (
    <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
            <button
                onClick={onNewDocument}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
                New Invention
            </button>
            {/* More actions could go here */}
        </div>
        <div className="flex items-center space-x-1 p-1 bg-gray-900/50 rounded-lg">
            <button
                onClick={() => onViewModeChange('list')}
                className={`px-2.5 py-1 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-cyan-500/30 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
            >
                List
            </button>
            <button
                onClick={() => onViewModeChange('grid')}
                className={`px-2.5 py-1 text-sm rounded-md transition-colors ${viewMode === 'grid' ? 'bg-cyan-500/30 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
            >
                Grid
            </button>
        </div>
    </div>
));
CodexToolbar.displayName = 'CodexToolbar';

/**
 * Filter panel for searching, sorting, and filtering documents.
 */
export const FilterPanel: FC = () => {
    const { state, dispatch } = useAppContext();
    const { filters, sorting, allTags, allUsers } = state;
    const [localSearch, setLocalSearch] = useState(filters.searchTerm);
    const debouncedSearchTerm = useDebounce(localSearch, 300);

    useEffect(() => {
        dispatch({ type: 'UPDATE_FILTERS', payload: { searchTerm: debouncedSearchTerm } });
    }, [debouncedSearchTerm, dispatch]);

    const handleSortChange = (field: SortableField) => {
        const direction = sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
        dispatch({ type: 'UPDATE_SORTING', payload: { field, direction } });
    };

    return (
        <Card title="Registry Filters" className="h-full flex flex-col" padding="none">
            <div className="p-4 border-b border-gray-700/60">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Sort By</h4>
                    {/* Add sorting controls */}
                    <select
                        value={sorting.field}
                        onChange={(e) => handleSortChange(e.target.value as SortableField)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white"
                    >
                       <option value="updatedAt">Last Updated</option>
                       <option value="createdAt">Date Created</option>
                       <option value="title">Title</option>
                       <option value="type">Type</option>
                    </select>
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Status</h4>
                    {/* Add status filters */}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Tags</h4>
                    {/* Add tag filters */}
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Misc</h4>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox bg-gray-700 border-gray-600 text-cyan-500"
                            checked={filters.isFavorite || false}
                            onChange={(e) => dispatch({ type: 'UPDATE_FILTERS', payload: { isFavorite: e.target.checked ? true : null } })}
                        />
                         <span>Favorites Only</span>
                    </label>
                </div>
            </div>
        </Card>
    );
};
FilterPanel.displayName = 'FilterPanel';


/**
 * A single item in the document list view.
 */
export const DocumentListItem: FC<{
    doc: EnhancedDocument;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onToggleFavorite: (id:string, isFavorite: boolean) => void;
}> = memo(({ doc, isSelected, onSelect, onToggleFavorite }) => {
    return (
        <div
            onClick={() => onSelect(doc.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer border ${isSelected ? 'bg-cyan-500/20 border-cyan-500/40' : 'text-gray-300 hover:bg-gray-700/50 border-transparent'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <span className={`text-xs font-bold ${doc.type === 'Prototype' ? 'text-indigo-300' : 'text-cyan-300'}`}>{doc.type}</span>
                    <p className="truncate font-semibold text-white">{doc.title}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(doc.id, !doc.isFavorite); }} className="text-gray-400 hover:text-yellow-400">
                    {doc.isFavorite ? '★' : '☆'}
                </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 truncate">{doc.abstract}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <UserAvatar user={doc.author} />
                <span>{formatDate(doc.updatedAt)}</span>
            </div>
        </div>
    );
});
DocumentListItem.displayName = 'DocumentListItem';


/**
 * List of documents with pagination.
 */
export const DocumentList: FC<{
    documents: EnhancedDocument[];
}> = ({ documents }) => {
    const { state, dispatch } = useAppContext();
    const { selectedDocId } = state;
    
    const handleSelectDocument = useCallback((id: string) => {
        dispatch({ type: 'SELECT_DOCUMENT', payload: id });
    }, [dispatch]);
    
    const handleToggleFavorite = useCallback((id: string, isFavorite: boolean) => {
        mockApiService.updateDocument({ id, isFavorite }).then(updatedDoc => {
            dispatch({ type: 'UPDATE_DOCUMENT', payload: updatedDoc });
        });
    }, [dispatch]);

    return (
        <Card title="Registry" className="h-full flex flex-col" padding="none">
            <div className="p-4 border-b border-gray-700/60">
                 {/* This could contain bulk actions in the future */}
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                {documents.map(doc => (
                    <DocumentListItem
                        key={doc.id}
                        doc={doc}
                        isSelected={selectedDocId === doc.id}
                        onSelect={handleSelectDocument}
                        onToggleFavorite={handleToggleFavorite}
                    />
                ))}
            </div>
             <PaginationControls />
        </Card>
    );
};
DocumentList.displayName = 'DocumentList';

/**
 * Pagination controls for the document list.
 */
export const PaginationControls: FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentPage, pageSize, totalCount } = state.pagination;
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages <= 1) return null;

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch({ type: 'SET_PAGE', payload: newPage });
        }
    };

    return (
        <div className="p-2 border-t border-gray-700/60 flex justify-between items-center text-sm">
            <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
            <div className="flex space-x-1">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                >
                    Prev
                </button>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};
PaginationControls.displayName = 'PaginationControls';

/**
 * Main viewer for document content, history, comments, etc.
 */
export const DocumentViewer: FC = () => {
    const { state } = useAppContext();
    const { documents, selectedDocId, isLoadingContent } = state;

    const selectedDoc = useMemo(() => documents.find(d => d.id === selectedDocId), [documents, selectedDocId]);

    if (!selectedDocId) {
        return (
            <Card className="h-full">
                <div className="flex flex-col justify-center items-center h-full text-gray-400">
                    <p className="text-lg">Select a document from the registry.</p>
                    <p className="text-sm">The codex contains all known inventions and prototypes.</p>
                </div>
            </Card>
        );
    }
    
    if (isLoadingContent) {
         return <Card className="h-full"><Spinner /></Card>;
    }

    if (!selectedDoc) {
        return <Card className="h-full"><ErrorDisplay message={`Document with ID ${selectedDocId} not found.`} /></Card>;
    }
    
    const docContent = selectedDoc.content || `Content for ${selectedDoc.title} is not loaded yet.`;

    return (
        <Card className="h-full flex flex-col" padding="none">
             <div className="p-4 border-b border-gray-700/60">
                 <h3 className="text-2xl font-bold text-white tracking-wider">{selectedDoc.title}</h3>
                 <div className="flex space-x-4 text-xs text-gray-400 mt-1">
                    <span>By {selectedDoc.author.name}</span>
                    <span>Updated: {formatDate(selectedDoc.updatedAt)}</span>
                 </div>
             </div>
             <div className="flex-grow overflow-y-auto prose prose-invert max-w-none prose-pre:bg-gray-900/50 prose-pre:p-4 prose-pre:rounded-lg p-6">
                <pre className="font-sans whitespace-pre-wrap">{docContent}</pre>
             </div>
        </Card>
    );
};
DocumentViewer.displayName = 'DocumentViewer';


// =================================================================================================
// REFACTORED MAIN COMPONENT
// This is the main view, now acting as a controller for the complex UI.
// =================================================================================================

const InventionsView: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { filters, sorting, pagination } = state;

    // --- Data Fetching Effect ---
    useEffect(() => {
        dispatch({ type: 'FETCH_INIT' });
        mockApiService.fetchInitialData()
            .then(data => {
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
                // Auto-select the first "known" document
                const initialDoc = data.documents.find(d => d.path === '/prototypes/prototype_001.md');
                if (initialDoc) {
                    dispatch({ type: 'SELECT_DOCUMENT', payload: initialDoc.id });
                }
            })
            .catch(error => dispatch({ type: 'FETCH_FAILURE', payload: error.message }));
    }, []);

    // --- Content Loading Effect ---
    useEffect(() => {
        if (state.selectedDocId) {
            const doc = state.documents.find(d => d.id === state.selectedDocId);
            if (doc && !doc.content) {
                dispatch({ type: 'LOAD_CONTENT_START' });
                mockApiService.fetchDocumentContent(doc.id)
                    .then(content => dispatch({ type: 'LOAD_CONTENT_SUCCESS', payload: { docId: doc.id, content } }))
                    .catch(error => dispatch({ type: 'LOAD_CONTENT_FAILURE', payload: error.message }));
            }
        }
    }, [state.selectedDocId, state.documents]);
    
    // --- Memoized Filtering and Sorting ---
    const processedDocuments = useMemo(() => {
        let filtered = [...state.documents];

        // Filtering logic
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(doc => doc.title.toLowerCase().includes(term) || doc.abstract.toLowerCase().includes(term));
        }
        if (filters.isFavorite) {
            filtered = filtered.filter(doc => doc.isFavorite);
        }
        // Add other filters here...

        // Sorting logic
        filtered.sort((a, b) => {
            const field = sorting.field;
            const valA = a[field];
            const valB = b[field];

            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }
            return sorting.direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [state.documents, filters, sorting]);

    // --- Memoized Pagination ---
    const paginatedDocuments = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        return processedDocuments.slice(start, end);
    }, [processedDocuments, pagination.currentPage, pagination.pageSize]);
    
    // Update total count for pagination when filters change
    useEffect(() => {
      state.pagination.totalCount = processedDocuments.length;
    }, [processedDocuments, state.pagination]);


    if (state.isLoadingList) {
        return (
            <div className="h-screen flex justify-center items-center">
                <Spinner />
            </div>
        );
    }
    
    if (state.error) {
        return <ErrorDisplay message={state.error} />
    }

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Invention & Prototype Codex</h2>
                <CodexToolbar 
                    viewMode={state.viewMode} 
                    onViewModeChange={(mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode })}
                    onNewDocument={() => dispatch({ type: 'OPEN_MODAL', payload: 'newDocument' })}
                />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
                    <div className="lg:col-span-1">
                        {/* The original search input is now part of the more complex FilterPanel */}
                        {/* <FilterPanel /> */}
                        {/* For this exercise, we keep the simpler list for now */}
                        <DocumentList documents={paginatedDocuments} />
                    </div>
                    <div className="lg:col-span-3">
                       <DocumentViewer />
                    </div>
                </div>
            </div>
        </AppContext.Provider>
    );
};

export default InventionsView;
// =================================================================================================
// END OF ENHANCEMENT
// =================================================================================================
