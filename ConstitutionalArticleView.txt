// components/views/platform/ConstitutionalArticleView.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import Card from '../../Card';
import { CONSTITUTIONAL_ARTICLES } from '../../../data';
import { View } from '../../../types';

// --- ENHANCED TYPE DEFINITIONS FOR A REAL-WORLD APPLICATION ---

/**
 * Represents a user in the system.
 */
export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'moderator' | 'scholar' | 'user';
  bio: string;
  joinedDate: string;
};

/**
 * Represents a user's preferences for the application.
 */
export type UserPreferences = {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'dark' | 'light' | 'sepia';
  showAnnotations: 'all' | 'scholar' | 'none';
  enableTextToSpeech: boolean;
};

/**
 * Represents a cross-reference link within an article section.
 */
export type CrossReference = {
  text: string;
  targetArticleId: number;
  targetSectionId?: string;
};

/**
 * Represents a structured section of a constitutional article.
 * This allows for rich rendering, annotations, and cross-references.
 */
export type ArticleSection = {
  id: string;
  tag: 'h3' | 'h4' | 'p' | 'ol' | 'ul' | 'blockquote';
  content: string | ArticleSection[]; // Content can be a string or nested sections for lists
  crossReferences?: CrossReference[];
};

/**
 * Represents a historical version of an article, crucial for legal and historical analysis.
 */
export type HistoricalVersion = {
  versionId: string;
  dateEnacted: string;
  summaryOfChanges: string;
  ratifiedBy: string[];
  fullText: ArticleSection[];
};

/**
 * Represents a single constitutional article with rich metadata and structured content.
 */
export type ConstitutionalArticle = {
  id: number;
  romanNumeral: string;
  title: string;
  summary: string;
  content: ArticleSection[]; // Changed from string to structured content
  currentVersionId: string;
  history: HistoricalVersion[];
  tags: string[];
  relatedCaseLaw: { caseName: string; citation: string; url: string; summary: string }[];
};

/**
 * Represents a user-created annotation on a piece of text.
 */
export type Annotation = {
  id: string;
  articleId: number;
  sectionId: string;
  range: [number, number]; // Start and end character index within the section content
  text: string;
  author: User;
  createdAt: string; // ISO 8601 date string
  replies: Comment[];
  type: 'historical' | 'legal' | 'linguistic' | 'personal';
  visibility: 'public' | 'private' | 'group';
  upvotes: number;
};

/**
 * Represents a comment in a discussion thread or on an annotation.
 */
export type Comment = {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies: Comment[];
  currentUserVote?: 'up' | 'down' | null;
};

// --- MOCK API AND DATABASE LAYER ---

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Eleanor Vance', avatarUrl: '/avatars/vance.png', role: 'scholar', bio: 'Constitutional Law Professor at Harvard.', joinedDate: '2020-01-15T09:00:00Z' },
  { id: 'u2', name: 'John Public', avatarUrl: '/avatars/public.png', role: 'user', bio: 'Civics enthusiast.', joinedDate: '2021-03-22T14:30:00Z' },
  { id: 'u3', name: 'Admin', avatarUrl: '/avatars/admin.png', role: 'admin', bio: 'Site Administrator.', joinedDate: '2019-01-01T00:00:00Z' },
  { id: 'u4', name: 'LegalEagleMod', avatarUrl: '/avatars/mod.png', role: 'moderator', bio: 'Moderator and paralegal.', joinedDate: '2022-06-10T18:00:00Z' },
];

const MOCK_ARTICLES: ConstitutionalArticle[] = CONSTITUTIONAL_ARTICLES.map(article => ({
  ...article,
  summary: `This article establishes the fundamental principles and structure of the ${article.title.toLowerCase()}. It outlines key powers, responsibilities, and limitations, forming the bedrock of the governing framework.`,
  content: [
    {
      id: `${article.id}-s1`,
      tag: 'h3',
      content: 'Section 1: General Principles'
    },
    {
      id: `${article.id}-s2`,
      tag: 'p',
      content: article.content, // Using original content for one section
      crossReferences: article.id === 1 ? [{ text: 'Article V', targetArticleId: 5 }] : [],
    },
    {
      id: `${article.id}-s3`,
      tag: 'h3',
      content: 'Section 2: Operational Mandates'
    },
    {
      id: `${article.id}-s4`,
      tag: 'ol',
      content: [
        { id: `${article.id}-s4-li1`, tag: 'p', content: 'The body shall convene no less than twice per standard year.' },
        { id: `${article.id}-s4-li2`, tag: 'p', content: 'All proceedings must be recorded and made available for public review within thirty standard days.' },
      ]
    }
  ],
  currentVersionId: 'v2.0',
  history: [
    {
      versionId: 'v1.0',
      dateEnacted: '2250-01-01T00:00:00Z',
      summaryOfChanges: 'Initial ratification of the founding constitution.',
      ratifiedBy: ['Founding Members Council'],
      fullText: [{ id: `${article.id}-v1-s1`, tag: 'p', content: 'The original, much simpler text of the article.' }]
    },
    {
      versionId: 'v2.0',
      dateEnacted: '2285-07-04T12:00:00Z',
      summaryOfChanges: 'The "Modernization Act" amendment expanded the scope and clarified ambiguities present in the original text.',
      ratifiedBy: ['Galactic Senate', 'Citizen Plebiscite'],
      fullText: [
        { id: `${article.id}-v2-s1`, tag: 'h3', content: 'Section 1: General Principles' },
        { id: `${article.id}-v2-s2`, tag: 'p', content: article.content },
        { id: `${article.id}-v2-s3`, tag: 'h3', content: 'Section 2: Operational Mandates' },
        { id: `${article.id}-v2-s4`, tag: 'ol', content: [
          { id: `${article.id}-v2-s4-li1`, tag: 'p', content: 'The body shall convene no less than twice per standard year.' },
          { id: `${article.id}-v2-s4-li2`, tag: 'p', content: 'All proceedings must be recorded and made available for public review within thirty standard days.' },
        ]}
      ]
    }
  ],
  tags: ['governance', 'core-principle', 'legislation'],
  relatedCaseLaw: [
    { caseName: 'United Systems v. Hawthorne', citation: 'G.S.C. 2290 34.1', url: '/case/USvHawthorne', summary: 'Landmark case clarifying the interpretation of "public review" in Section 2.' },
  ]
}));

let MOCK_ANNOTATIONS: Annotation[] = [
  { id: 'anno1', articleId: 1, sectionId: '1-s2', range: [29, 44], text: "The term 'sovereign body' was intentionally chosen to echo pre-unification legal doctrines. See *The Federalist Papers, Vol. 3*. Fascinating linguistic choice.", author: MOCK_USERS[0], createdAt: '2023-01-20T15:00:00Z', replies: [], type: 'linguistic', visibility: 'public', upvotes: 15 },
  { id: 'anno2', articleId: 1, sectionId: '1-s2', range: [100, 120], text: "I think this part is too vague. Who defines what's 'just and equitable'?", author: MOCK_USERS[1], createdAt: '2023-05-11T10:00:00Z', replies: [], type: 'personal', visibility: 'public', upvotes: 3 },
];

let MOCK_COMMENTS: Comment[] = [
  { id: 'comm1', author: MOCK_USERS[0], content: "This entire article is a masterpiece of political philosophy. Its balance of power is exquisite.", createdAt: '2023-02-01T11:30:00Z', upvotes: 25, downvotes: 2, replies: [
    { id: 'comm2', author: MOCK_USERS[1], content: "I disagree. I think it gives too much power to the executive branch. History has shown that's a mistake.", createdAt: '2023-02-02T09:00:00Z', upvotes: 10, downvotes: 5, replies: [], currentUserVote: null },
  ], currentUserVote: 'up' },
  { id: 'comm3', author: MOCK_USERS[3], content: "A reminder to all participants: please keep the discussion civil and focused on the text. Personal attacks will not be tolerated. (Rule 2.1)", createdAt: '2023-02-03T10:00:00Z', upvotes: 50, downvotes: 0, replies: [], currentUserVote: null },
];

/**
 * Simulates a network request with a delay.
 * @param data The data to return.
 * @param delay The delay in milliseconds.
 * @returns A promise that resolves with the data.
 */
export const mockApiCall = <T,>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

/**
 * A mock API service for fetching and manipulating constitutional data.
 */
export const ConstitutionalApi = {
  fetchArticle: (id: number) => mockApiCall(MOCK_ARTICLES.find(a => a.id === id)),
  fetchAnnotations: (articleId: number) => mockApiCall(MOCK_ANNOTATIONS.filter(a => a.articleId === articleId)),
  postAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'author'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `anno${Date.now()}`,
      createdAt: new Date().toISOString(),
      author: MOCK_USERS[1], // Assume current user is John Public
      replies: [],
      upvotes: 0,
    };
    MOCK_ANNOTATIONS.push(newAnnotation);
    return mockApiCall(newAnnotation);
  },
  fetchComments: (articleId: number) => mockApiCall(MOCK_COMMENTS),
  postComment: (articleId: number, content: string, parentId: string | null = null) => {
    const newComment: Comment = {
      id: `comm${Date.now()}`,
      author: MOCK_USERS[1], // Assume current user is John Public
      content,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      downvotes: 0,
      replies: [],
      currentUserVote: 'up',
    };

    const findAndAddReply = (comments: Comment[]): boolean => {
      for (const comment of comments) {
        if (comment.id === parentId) {
          comment.replies.unshift(newComment);
          return true;
        }
        if (comment.replies && findAndAddReply(comment.replies)) {
          return true;
        }
      }
      return false;
    };

    if (parentId) {
      findAndAddReply(MOCK_COMMENTS);
    } else {
      MOCK_COMMENTS.unshift(newComment);
    }
    return mockApiCall(newComment);
  },
  voteOnComment: (commentId: string, vote: 'up' | 'down') => {
    // This is a simplified search and update for the mock data
    // In a real app, this would be a single API call
    return mockApiCall(true);
  },
};


// --- UTILITY FUNCTIONS ---

/**
 * Formats an ISO date string into a readable format.
 * @param isoString The date string to format.
 * @returns A formatted date string (e.g., "January 1, 2023").
 */
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * A simple text diffing function to compare two strings.
 * This is a naive implementation for demonstration. A real app would use a more robust library.
 * @param oldText The original text.
 * @param newText The new text.
 * @returns An array of objects representing the diff.
 */
export const diffText = (oldText: string, newText: string) => {
    // A more complex diffing algorithm (e.g., Myers diff) would be used in a real app.
    // This is a simplified placeholder.
    if (oldText === newText) {
        return [{ type: 'equal', value: oldText }];
    }
    return [
        { type: 'deleted', value: oldText },
        { type: 'added', value: newText },
    ];
};

/**
 * Debounces a function, ensuring it's not called too frequently.
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced version of the function.
 */
export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
};


// --- CONTEXT & PROVIDERS FOR GLOBAL STATE ---

export const UserPreferencesContext = createContext<[UserPreferences, React.Dispatch<React.SetStateAction<UserPreferences>>] | null>(null);

/**
 * Provides user preferences to the component tree.
 */
export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [preferences, setPreferences] = useState<UserPreferences>({
        fontSize: 'medium',
        theme: 'dark',
        showAnnotations: 'all',
        enableTextToSpeech: false,
    });
    return (
        <UserPreferencesContext.Provider value={[preferences, setPreferences]}>
            {children}
        </UserPreferencesContext.Provider>
    );
};

/**
 * Custom hook to access user preferences.
 */
export const useUserPreferences = () => {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
    }
    return context;
};

// --- CUSTOM HOOKS FOR DATA FETCHING AND MANAGEMENT ---

/**
 * Fetches and manages all data related to a specific constitutional article.
 * @param articleNumber The ID of the article to fetch.
 * @returns An object containing the article data, annotations, comments, and loading/error states.
 */
export const useArticleData = (articleNumber: number) => {
  const [article, setArticle] = useState<ConstitutionalArticle | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [articleData, annotationsData, commentsData] = await Promise.all([
        ConstitutionalApi.fetchArticle(articleNumber),
        ConstitutionalApi.fetchAnnotations(articleNumber),
        ConstitutionalApi.fetchComments(articleNumber),
      ]);

      if (!articleData) {
        throw new Error('Article not found.');
      }

      setArticle(articleData);
      setAnnotations(annotationsData);
      setComments(commentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [articleNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { article, annotations, comments, isLoading, error, setComments, setAnnotations, refreshData: fetchData };
};


// --- UI HELPER & ATOMIC COMPONENTS ---

/**
 * A reusable loading spinner component.
 */
export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-16 h-16 border-4 border-teal-400 border-dashed rounded-full animate-spin"></div>
  </div>
);

/**
 * A reusable error message component.
 */
export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <Card title="Error">
    <p className="text-red-400">{message}</p>
  </Card>
);

/**
 * A component to render SVG icons.
 */
export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-6 h-6" }) => {
    const icons: { [key: string]: JSX.Element } = {
        comment: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
        upvote: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />,
        downvote: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />,
        close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
        add: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[name]}
        </svg>
    );
};

/**
 * A user avatar component with fallback.
 */
export const UserAvatar: React.FC<{ user: User; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };
    return (
        <div className={`relative ${sizeClasses[size]}`}>
            {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="rounded-full object-cover w-full h-full" />
            ) : (
                <div className="rounded-full bg-gray-700 flex items-center justify-center w-full h-full">
                    <span className="text-white font-bold">{user.name.charAt(0)}</span>
                </div>
            )}
            {user.role === 'scholar' && <span title="Verified Scholar" className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-blue-500 ring-2 ring-gray-800" />}
        </div>
    );
};


// --- COMPLEX FEATURE COMPONENTS ---

/**
 * Renders the structured content of an article, handling sections, highlights, and annotations.
 */
export const ArticleContentRenderer: React.FC<{
  sections: ArticleSection[];
  annotations: Annotation[];
  onTextSelect: (sectionId: string, range: [number, number], text: string) => void;
}> = ({ sections, annotations, onTextSelect }) => {
    
    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const sectionEl = range.startContainer.parentElement?.closest('[data-section-id]');
        if (sectionEl) {
            const sectionId = sectionEl.getAttribute('data-section-id')!;
            const selectedText = selection.toString();
            // This is a simplified range calculation. A real app would need a more robust method.
            const start = range.startOffset;
            const end = start + selectedText.length;
            onTextSelect(sectionId, [start, end], selectedText);
        }
    };

    const renderSection = (section: ArticleSection): JSX.Element => {
        const { id, tag, content, crossReferences } = section;
        const Tag = tag as keyof JSX.IntrinsicElements;
        
        if (typeof content === 'string') {
            // Very complex logic would go here to inject annotation highlights without breaking the DOM
            // For now, we'll just render the text.
            return (
                <Tag key={id} data-section-id={id} className="mb-4 leading-relaxed text-lg">
                    {content}
                    {crossReferences && crossReferences.map((ref, i) => (
                        <a key={i} href={`/constitution/${ref.targetArticleId}`} className="text-teal-400 hover:underline ml-2">
                            ({ref.text})
                        </a>
                    ))}
                </Tag>
            );
        }

        return (
            <Tag key={id} data-section-id={id} className="list-decimal pl-6 space-y-2">
                {content.map(child => <li key={child.id}>{renderSection(child)}</li>)}
            </Tag>
        );
    };

    return (
        <div onMouseUp={handleMouseUp} className="prose prose-invert max-w-none text-gray-300">
            {sections.map(renderSection)}
        </div>
    );
};

/**
 * A modal component for creating a new annotation.
 */
export const AnnotationCreator: React.FC<{
  selection: { sectionId: string; range: [number, number]; text: string };
  onClose: () => void;
  onSave: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'author'>) => void;
}> = ({ selection, onClose, onSave }) => {
    const [text, setText] = useState('');
    const [type, setType] = useState<'historical' | 'legal' | 'linguistic' | 'personal'>('legal');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');

    const handleSave = () => {
        onSave({
            articleId: 0, // This would be passed in a real scenario
            sectionId: selection.sectionId,
            range: selection.range,
            text,
            type,
            visibility,
            replies: [],
            upvotes: 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-4">Create Annotation</h3>
                <p className="text-gray-400 mb-4 italic border-l-4 border-teal-500 pl-4">"{selection.text}"</p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-gray-900 text-white p-2 rounded-md h-32"
                    placeholder="Your analysis or comment..."
                ></textarea>
                <div className="flex justify-between items-center mt-4">
                    <select value={type} onChange={e => setType(e.target.value as any)} className="bg-gray-900 text-white p-2 rounded-md">
                        <option value="legal">Legal Analysis</option>
                        <option value="historical">Historical Context</option>
                        <option value="linguistic">Linguistic Note</option>
                        <option value="personal">Personal Reflection</option>
                    </select>
                    <select value={visibility} onChange={e => setVisibility(e.target.value as any)} className="bg-gray-900 text-white p-2 rounded-md">
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50" disabled={!text}>Save</button>
                </div>
            </div>
        </div>
    );
};

/**
 * A sidebar to display and manage annotations.
 */
export const AnnotationsSidebar: React.FC<{
    annotations: Annotation[];
    onClose: () => void;
}> = ({ annotations, onClose }) => {
    return (
        <div className="fixed top-0 right-0 h-full w-96 bg-gray-900 shadow-lg p-6 space-y-4 overflow-y-auto z-40 transform animate-slide-in-left">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Annotations</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><Icon name="close" /></button>
            </div>
            {annotations.length === 0 ? (
                <p className="text-gray-400">No annotations for this article yet.</p>
            ) : (
                annotations.map(anno => (
                    <div key={anno.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <UserAvatar user={anno.author} size="sm" />
                            <div>
                                <p className="font-bold text-white">{anno.author.name}</p>
                                <p className="text-xs text-gray-400">{formatDate(anno.createdAt)}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-gray-300">{anno.text}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                           <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full">{anno.type}</span>
                           <span>{anno.upvotes} upvotes</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

/**
 * A single comment component, capable of rendering replies recursively.
 */
export const CommentComponent: React.FC<{ comment: Comment; onReply: (id: string) => void }> = ({ comment, onReply }) => {
    return (
        <div className="flex space-x-4">
            <UserAvatar user={comment.author} />
            <div className="flex-1">
                <div className="bg-gray-800 p-4 rounded-lg rounded-tl-none">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-teal-300">{comment.author.name}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 mt-2">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <button className="flex items-center space-x-1 hover:text-white"><Icon name="upvote" className="w-4 h-4" /> <span>{comment.upvotes}</span></button>
                    <button className="flex items-center space-x-1 hover:text-white"><Icon name="downvote" className="w-4 h-4" /> <span>{comment.downvotes}</span></button>
                    <button onClick={() => onReply(comment.id)} className="hover:text-white">Reply</button>
                </div>
                <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-700">
                    {comment.replies.map(reply => <CommentComponent key={reply.id} comment={reply} onReply={onReply} />)}
                </div>
            </div>
        </div>
    );
};

/**
 * A full-featured discussion forum component.
 */
export const DiscussionForum: React.FC<{
    articleId: number;
    comments: Comment[];
    onCommentsChange: React.Dispatch<React.SetStateAction<Comment[]>>;
}> = ({ articleId, comments, onCommentsChange }) => {
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        const postedComment = await ConstitutionalApi.postComment(articleId, newComment, replyingTo);
        
        const addComment = (list: Comment[], parentId: string | null): Comment[] => {
            if (!parentId) {
                return [postedComment, ...list];
            }
            return list.map(c => {
                if (c.id === parentId) {
                    return { ...c, replies: [postedComment, ...c.replies] };
                }
                return { ...c, replies: addComment(c.replies, parentId) };
            });
        };
        
        onCommentsChange(prev => addComment(prev, replyingTo));
        setNewComment("");
        setReplyingTo(null);
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Discussion</h3>
            <div className="bg-gray-800 p-4 rounded-lg">
                <textarea
                    className="w-full bg-gray-900 text-white p-2 rounded-md h-24"
                    placeholder="Share your thoughts on this article..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                    <button 
                        onClick={handlePostComment}
                        className="px-4 py-2 rounded-md text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50"
                        disabled={!newComment.trim()}
                    >
                        Post Comment
                    </button>
                </div>
            </div>
            <div className="mt-6 space-y-6">
                {comments.map(comment => (
                    <CommentComponent key={comment.id} comment={comment} onReply={setReplyingTo} />
                ))}
            </div>
        </div>
    );
};

/**
 * Component to compare two versions of an article.
 */
export const VersionComparisonView: React.FC<{
    versionA: HistoricalVersion;
    versionB: HistoricalVersion;
}> = ({ versionA, versionB }) => {
    // In a real app, we'd diff the structured content. Here we'll just stringify and diff.
    const textA = versionA.fullText.map(s => typeof s.content === 'string' ? s.content : '').join('\n');
    const textB = versionB.fullText.map(s => typeof s.content === 'string' ? s.content : '').join('\n');
    const diffResult = diffText(textA, textB);

    return (
        <Card title={`Comparing Version ${versionA.versionId} and ${versionB.versionId}`}>
            <pre className="whitespace-pre-wrap font-mono text-sm">
                {diffResult.map((part, index) => {
                    if (part.type === 'added') {
                        return <span key={index} className="bg-green-900 text-green-200">{part.value}</span>;
                    }
                    if (part.type === 'deleted') {
                        return <span key={index} className="bg-red-900 text-red-200 line-through">{part.value}</span>;
                    }
                    return <span key={index}>{part.value}</span>;
                })}
            </pre>
        </Card>
    );
};

// --- MAIN VIEW COMPONENT (REFACTORED AND EXPANDED) ---

interface ConstitutionalArticleViewProps {
  articleNumber: number;
}

const ConstitutionalArticleViewInternal: React.FC<ConstitutionalArticleViewProps> = ({ articleNumber }) => {
  const { article, annotations, comments, isLoading, error, setComments, setAnnotations } = useArticleData(articleNumber);
  const [preferences] = useUserPreferences();

  const [activeTab, setActiveTab] = useState<'content' | 'history' | 'cases'>('content');
  const [activeSidePanel, setActiveSidePanel] = useState<'none' | 'annotations' | 'discussion'>('none');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectionForAnnotation, setSelectionForAnnotation] = useState<{ sectionId: string, range: [number, number], text: string } | null>(null);

  const handleTextSelect = useCallback((sectionId: string, range: [number, number], text: string) => {
      // Open annotation creator on text selection
      setSelectionForAnnotation({ sectionId, range, text });
  }, []);

  const handleSaveAnnotation = useCallback(async (newAnnotationData: Omit<Annotation, 'id' | 'createdAt' | 'author'>) => {
      if (!article) return;
      const newAnnotation = await ConstitutionalApi.postAnnotation({ ...newAnnotationData, articleId: article.id });
      setAnnotations(prev => [newAnnotation, ...prev]);
  }, [article, setAnnotations]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !article) {
    return <ErrorMessage message={error || 'Article not found.'} />;
  }
  
  const currentVersion = article.history.find(v => v.versionId === (selectedVersion || article.currentVersionId)) || article.history[article.history.length-1];

  const fontSizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
  }[preferences.fontSize];

  return (
    <div className={`space-y-6 font-serif animate-fade-in ${fontSizeClass}`}>
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-wider">
                Article {article.romanNumeral} — {article.title}
            </h2>
            <p className="text-gray-400 mt-2 max-w-3xl">{article.summary}</p>
            <div className="mt-3 flex space-x-2">
                {article.tags.map(tag => <span key={tag} className="px-2 py-1 text-xs bg-gray-700 text-teal-300 rounded-full">{tag}</span>)}
            </div>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => setActiveSidePanel(p => p === 'annotations' ? 'none' : 'annotations')} className={`px-3 py-2 rounded-md ${activeSidePanel === 'annotations' ? 'bg-teal-600' : 'bg-gray-700'} text-white`}>Annotations ({annotations.length})</button>
            <button onClick={() => setActiveSidePanel(p => p === 'discussion' ? 'none' : 'discussion')} className={`px-3 py-2 rounded-md ${activeSidePanel === 'discussion' ? 'bg-teal-600' : 'bg-gray-700'} text-white`}>Discussion</button>
        </div>
      </div>

      <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('content')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'content' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                  Article Text
              </button>
              <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                  Version History
              </button>
               <button onClick={() => setActiveTab('cases')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cases' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                  Related Case Law
              </button>
          </nav>
      </div>
      
      {activeTab === 'content' && (
          <Card>
              <ArticleContentRenderer 
                  sections={currentVersion.fullText} 
                  annotations={annotations} 
                  onTextSelect={handleTextSelect}
              />
          </Card>
      )}

      {activeTab === 'history' && (
          <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Version History</h3>
              <select onChange={(e) => setSelectedVersion(e.target.value)} value={selectedVersion || article.currentVersionId} className="bg-gray-800 text-white p-2 rounded-md">
                  {article.history.map(v => <option key={v.versionId} value={v.versionId}>{v.versionId} - Enacted {formatDate(v.dateEnacted)}</option>)}
              </select>
              {article.history.map(v => (
                  <Card key={v.versionId}>
                      <h4 className="font-bold text-xl text-teal-300">Version {v.versionId} ({formatDate(v.dateEnacted)})</h4>
                      <p className="text-gray-400 mt-1"><strong>Summary of Changes:</strong> {v.summaryOfChanges}</p>
                      <p className="text-gray-500 text-sm mt-2">Ratified by: {v.ratifiedBy.join(', ')}</p>
                  </Card>
              ))}
          </div>
      )}

      {activeTab === 'cases' && (
          <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Related Case Law</h3>
              {article.relatedCaseLaw.map(c => (
                  <Card key={c.citation}>
                      <h4 className="font-bold text-xl text-teal-300">{c.caseName}</h4>
                      <p className="text-gray-400 font-mono text-sm">{c.citation}</p>
                      <p className="mt-2 text-gray-300">{c.summary}</p>
                      <a href={c.url} className="text-teal-400 hover:underline mt-2 inline-block">Read full case →</a>
                  </Card>
              ))}
          </div>
      )}

      {activeSidePanel === 'annotations' && <AnnotationsSidebar annotations={annotations} onClose={() => setActiveSidePanel('none')} />}
      
      {activeSidePanel === 'discussion' && (
          <div className="fixed top-0 right-0 h-full w-1/2 max-w-2xl bg-gray-900 shadow-lg p-6 space-y-4 overflow-y-auto z-40 transform animate-slide-in-left">
              <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Discussion</h3>
                  <button onClick={() => setActiveSidePanel('none')} className="text-gray-400 hover:text-white"><Icon name="close" /></button>
              </div>
              <DiscussionForum articleId={article.id} comments={comments} onCommentsChange={setComments} />
          </div>
      )}

      {selectionForAnnotation && (
          <AnnotationCreator
              selection={selectionForAnnotation}
              onClose={() => setSelectionForAnnotation(null)}
              onSave={handleSaveAnnotation}
          />
      )}

      <style>{`
        .prose strong { color: #81e6d9; }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.3s ease-out forwards; }
        ::selection { background-color: #81e6d9; color: #1a202c; }
      `}</style>
    </div>
  );
};


const ConstitutionalArticleView: React.FC<ConstitutionalArticleViewProps> = (props) => (
    <UserPreferencesProvider>
        <ConstitutionalArticleViewInternal {...props} />
    </UserPreferencesProvider>
);


export default ConstitutionalArticleView;