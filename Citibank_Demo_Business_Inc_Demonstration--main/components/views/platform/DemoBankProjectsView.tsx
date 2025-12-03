```typescript
// components/views/platform/DemoBankProjectsView.tsx

// --- Original Imports (Unaltered) ---
import React, { useState, useMemo, useContext, useReducer, useCallback, useEffect, createContext } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { DataContext } from '../../../context/DataContext';
import { ProjectTask, ProjectStatus } from '../../../types';

// --- New Imports for Enhanced Functionality ---
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, CheckSquare, ChevronDown, Clock, Flag, Hash, MessageSquare, Plus, Search, Tag, Users, X, Activity, GripVertical, Paperclip, ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';


// =================================================================================================
// 1. EXPANDED TYPE DEFINITIONS
// In a real app, these would be in a shared types folder.
// =================================================================================================

export type User = {
    id: string;
    name: string;
    avatarUrl: string;
};

export type Comment = {
    id: string;
    author: User;
    content: string;
    timestamp: string;
};

export type Subtask = {
    id: string;
    title: string;
    completed: boolean;
};

export type Attachment = {
    id: string;
    fileName: string;
    url: string;
    type: 'image' | 'pdf' | 'document';
    size: number; // in bytes
};

export type Label = {
    id: string;
    text: string;
    color: string; // hex code
};

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

// Extend the original ProjectTask to be more comprehensive
export interface EnhancedProjectTask extends ProjectTask {
    description?: string;
    priority: Priority;
    dueDate?: string;
    assignee?: User; // Overriding to be a User object
    comments: Comment[];
    subtasks: Subtask[];
    attachments: Attachment[];
    labels: Label[];
    createdAt: string;
    updatedAt: string;
    storyPoints?: number;
}

export type ViewMode = 'board' | 'gantt' | 'analytics';

// =================================================================================================
// 2. MOCK DATA & UTILITIES
// Simulating a more realistic data environment.
// =================================================================================================

export const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
    { id: 'user-2', name: 'Bob Williams', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
    { id: 'user-3', name: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
    { id: 'user-4', name: 'Diana Prince', avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
];

export const MOCK_LABELS: Label[] = [
    { id: 'label-1', text: 'Bug', color: '#ef4444' },
    { id: 'label-2', text: 'Feature', color: '#3b82f6' },
    { id: 'label-3', text: 'Design', color: '#a855f7' },
    { id: 'label-4', text: 'Documentation', color: '#22c55e' },
    { id: 'label-5', text: 'Refactor', color: '#f97316' },
];

const generateInitialTasks = (initialTasks: ProjectTask[]): EnhancedProjectTask[] => {
    return initialTasks.map((task, index) => ({
        ...task,
        assignee: MOCK_USERS[index % MOCK_USERS.length],
        description: `This is a detailed description for the task: "${task.title}". It should outline the objectives, requirements, and acceptance criteria. We need to ensure that the final implementation is robust, scalable, and well-documented.`,
        priority: (['Low', 'Medium', 'High', 'Urgent'] as Priority[])[index % 4],
        dueDate: new Date(Date.now() + (index - 5) * 24 * 60 * 60 * 1000).toISOString(),
        comments: [
            { id: `comment-${index}-1`, author: MOCK_USERS[0], content: 'Initial thoughts on this task.', timestamp: new Date().toISOString() }
        ],
        subtasks: [
            { id: `subtask-${index}-1`, title: 'Initial research', completed: true },
            { id: `subtask-${index}-2`, title: 'Develop prototype', completed: false },
            { id: `subtask-${index}-3`, title: 'Gather feedback', completed: false },
        ],
        attachments: [],
        labels: [MOCK_LABELS[index % MOCK_LABELS.length]],
        createdAt: new Date(Date.now() - (10 - index) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        storyPoints: [1, 2, 3, 5, 8][index % 5],
    }));
};

export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

export const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
        case 'Urgent': return 'border-red-500';
        case 'High': return 'border-orange-500';
        case 'Medium': return 'border-yellow-500';
        case 'Low': return 'border-blue-500';
        default: return 'border-gray-500';
    }
};

const PRIORITY_ICON_MAP: Record<Priority, React.ReactNode> = {
    'Low': <Flag className="w-4 h-4 text-blue-500" />,
    'Medium': <Flag className="w-4 h-4 text-yellow-500" />,
    'High': <Flag className="w-4 h-4 text-orange-500" />,
    'Urgent': <Flag className="w-4 h-4 text-red-500" />,
}


// =================================================================================================
// 3. STATE MANAGEMENT (useReducer for complexity)
// =================================================================================================

type ProjectState = {
    tasks: EnhancedProjectTask[];
    columns: Map<ProjectStatus, EnhancedProjectTask[]>;
    filters: {
        searchTerm: string;
        assigneeIds: string[];
        priorities: Priority[];
    };
    viewMode: ViewMode;
    isTaskModalOpen: boolean;
    isAIGeneratorOpen: boolean;
    selectedTask: EnhancedProjectTask | null;
    isLoading: boolean;
    isLoadingAI: boolean;
};

type ProjectAction =
    | { type: 'SET_TASKS'; payload: EnhancedProjectTask[] }
    | { type: 'ADD_TASKS'; payload: EnhancedProjectTask[] }
    | { type: 'UPDATE_TASK'; payload: EnhancedProjectTask }
    | { type: 'MOVE_TASK'; payload: { taskId: string; fromColumn: ProjectStatus; toColumn: ProjectStatus; newIndex: number } }
    | { type: 'REORDER_TASK_IN_COLUMN'; payload: { columnId: ProjectStatus; oldIndex: number; newIndex: number } }
    | { type: 'SET_FILTER'; payload: { filterType: keyof ProjectState['filters']; value: any } }
    | { type: 'SET_VIEW_MODE'; payload: ViewMode }
    | { type: 'OPEN_TASK_MODAL'; payload: EnhancedProjectTask | null }
    | { type: 'CLOSE_TASK_MODAL' }
    | { type: 'OPEN_AI_GENERATOR' }
    | { type: 'CLOSE_AI_GENERATOR' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_AI_LOADING'; payload: boolean };


const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
    switch (action.type) {
        case 'SET_TASKS': {
            const columns = new Map<ProjectStatus, EnhancedProjectTask[]>();
            COLUMNS.forEach(status => columns.set(status, []));
            action.payload.forEach(task => {
                const columnTasks = columns.get(task.status) || [];
                columnTasks.push(task);
            });
            return { ...state, tasks: action.payload, columns };
        }
        case 'ADD_TASKS': {
             const newTasks = [...state.tasks, ...action.payload];
             // Rebuild columns map
             const columns = new Map<ProjectStatus, EnhancedProjectTask[]>();
             COLUMNS.forEach(status => columns.set(status, []));
             newTasks.forEach(task => {
                 const columnTasks = columns.get(task.status) || [];
                 columnTasks.push(task);
             });
             return { ...state, tasks: newTasks, columns, isLoadingAI: false, isAIGeneratorOpen: false };
        }
        case 'UPDATE_TASK': {
            const updatedTasks = state.tasks.map(t => t.id === action.payload.id ? action.payload : t);
             // Rebuild columns map after update, as status might have changed
             const columns = new Map<ProjectStatus, EnhancedProjectTask[]>();
             COLUMNS.forEach(status => columns.set(status, []));
             updatedTasks.forEach(task => {
                 const columnTasks = columns.get(task.status) || [];
                 columnTasks.push(task);
             });
            return { ...state, tasks: updatedTasks, columns, selectedTask: action.payload };
        }
        case 'MOVE_TASK': {
            const { taskId, fromColumn, toColumn, newIndex } = action.payload;
            const newColumns = new Map(state.columns);
            
            const sourceColumnTasks = Array.from(newColumns.get(fromColumn) || []);
            const [movedTask] = sourceColumnTasks.splice(sourceColumnTasks.findIndex(t => t.id === taskId), 1);
            
            if (!movedTask) return state;

            movedTask.status = toColumn;
            movedTask.updatedAt = new Date().toISOString();
            
            newColumns.set(fromColumn, sourceColumnTasks);

            const destinationColumnTasks = Array.from(newColumns.get(toColumn) || []);
            destinationColumnTasks.splice(newIndex, 0, movedTask);
            newColumns.set(toColumn, destinationColumnTasks);

            return { ...state, columns: newColumns };
        }
        case 'REORDER_TASK_IN_COLUMN': {
            const { columnId, oldIndex, newIndex } = action.payload;
            const newColumns = new Map(state.columns);
            const columnTasks = Array.from(newColumns.get(columnId) || []);

            newColumns.set(columnId, arrayMove(columnTasks, oldIndex, newIndex));
            return { ...state, columns: newColumns };
        }
        case 'SET_FILTER':
            return { ...state, filters: { ...state.filters, [action.payload.filterType]: action.payload.value } };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'OPEN_TASK_MODAL':
            return { ...state, isTaskModalOpen: true, selectedTask: action.payload };
        case 'CLOSE_TASK_MODAL':
            return { ...state, isTaskModalOpen: false, selectedTask: null };
        case 'OPEN_AI_GENERATOR':
            return { ...state, isAIGeneratorOpen: true };
        case 'CLOSE_AI_GENERATOR':
            return { ...state, isAIGeneratorOpen: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_AI_LOADING':
            return { ...state, isLoadingAI: action.payload };
        default:
            return state;
    }
};

const COLUMNS: ProjectStatus[] = ['Backlog', 'In Progress', 'Review', 'Done'];


// =================================================================================================
// 4. ADVANCED COMPONENTS
// Breaking the UI into smaller, manageable, and feature-rich components.
// =================================================================================================

// --- Task Card Component ---
export const TaskCard: React.FC<{ task: EnhancedProjectTask; onCardClick: (task: EnhancedProjectTask) => void; }> = ({ task, onCardClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        borderLeft: `4px solid ${MOCK_LABELS.find(l => l.id === task.labels[0]?.id)?.color || '#4b5563'}`,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            onClick={() => onCardClick(task)}
            className="p-3 bg-gray-800/80 rounded-lg border border-gray-700 hover:border-cyan-500 cursor-pointer shadow-md hover:shadow-cyan-500/20"
        >
            <div className="flex justify-between items-start">
                <p className="text-sm text-gray-200 pr-4 flex-1">{task.title}</p>
                <div {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                    <GripVertical size={16} />
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    {PRIORITY_ICON_MAP[task.priority]}
                    <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{task.comments.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckSquare size={14} />
                        <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                    </div>
                </div>
                {task.assignee && (
                    <img src={task.assignee.avatarUrl} alt={task.assignee.name} className="w-6 h-6 rounded-full" title={task.assignee.name} />
                )}
            </div>
        </div>
    );
};


// --- Board Column Component ---
export const BoardColumn: React.FC<{ status: ProjectStatus; tasks: EnhancedProjectTask[]; onCardClick: (task: EnhancedProjectTask) => void; }> = ({ status, tasks, onCardClick }) => {
    const { setNodeRef } = useSortable({ id: status });
    return (
        <div ref={setNodeRef} className="w-80 flex-shrink-0 bg-gray-900/50 rounded-lg p-3">
            <h3 className="font-semibold text-white mb-4 px-2 flex items-center justify-between">
                <span>{status}</span>
                <span className="text-sm font-normal text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">{tasks.length}</span>
            </h3>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {tasks.map(task => <TaskCard key={task.id} task={task} onCardClick={onCardClick}/>)}
                </div>
            </SortableContext>
        </div>
    );
};

// --- Project Board Component ---
export const ProjectBoard: React.FC<{ 
    columns: Map<ProjectStatus, EnhancedProjectTask[]>;
    onCardClick: (task: EnhancedProjectTask) => void;
    dispatch: React.Dispatch<ProjectAction>;
}> = ({ columns, onCardClick, dispatch }) => {
    const [activeTask, setActiveTask] = useState<EnhancedProjectTask | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const findColumnForTask = (taskId: string) => {
        for (const [status, tasks] of columns.entries()) {
            if (tasks.some(task => task.id === taskId)) {
                return status;
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = Array.from(columns.values()).flat().find(t => t.id === active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeColumn = findColumnForTask(activeId);
        let overColumn = findColumnForTask(overId);
        
        if (!overColumn) {
            // It means we dropped on a column, not a task
            if (COLUMNS.includes(overId as ProjectStatus)) {
                overColumn = overId as ProjectStatus;
            }
        }
        
        if (!activeColumn || !overColumn) return;

        if (activeColumn === overColumn) {
            // Reordering within the same column
            const tasksInColumn = columns.get(activeColumn) || [];
            const oldIndex = tasksInColumn.findIndex(t => t.id === activeId);
            const newIndex = tasksInColumn.findIndex(t => t.id === overId);
            if (oldIndex !== newIndex) {
                 dispatch({ type: 'REORDER_TASK_IN_COLUMN', payload: { columnId: activeColumn, oldIndex, newIndex } });
            }
        } else {
            // Moving to a different column
            const tasksInOverColumn = columns.get(overColumn) || [];
            const newIndex = tasksInOverColumn.findIndex(t => t.id === overId);
            const insertIndex = newIndex >= 0 ? newIndex : tasksInOverColumn.length;
            dispatch({ type: 'MOVE_TASK', payload: { taskId: activeId, fromColumn: activeColumn, toColumn: overColumn, newIndex: insertIndex } });
        }
    };
    
    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto p-2">
                {Array.from(columns.entries()).map(([status, tasks]) => (
                    <BoardColumn key={status} status={status} tasks={tasks} onCardClick={onCardClick}/>
                ))}
            </div>
            {createPortal(
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} onCardClick={() => {}} /> : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};

// --- Task Details Modal Component ---
export const TaskDetailsModal: React.FC<{
    task: EnhancedProjectTask;
    onClose: () => void;
    onUpdate: (updatedTask: EnhancedProjectTask) => void;
}> = ({ task, onClose, onUpdate }) => {
    const [editedTask, setEditedTask] = useState(task);
    const [newComment, setNewComment] = useState('');
    const [aiSubtaskPrompt, setAiSubtaskPrompt] = useState('');
    const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

    const handleUpdate = <K extends keyof EnhancedProjectTask>(key: K, value: EnhancedProjectTask[K]) => {
        setEditedTask(prev => ({...prev, [key]: value, updatedAt: new Date().toISOString()}));
    };
    
    const handleSaveChanges = () => {
        onUpdate(editedTask);
        onClose();
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment: Comment = {
            id: `comment-${Date.now()}`,
            author: MOCK_USERS[0], // Simulate logged in user
            content: newComment,
            timestamp: new Date().toISOString()
        };
        handleUpdate('comments', [...editedTask.comments, comment]);
        setNewComment('');
    };
    
    const handleGenerateSubtasks = async () => {
        if(!aiSubtaskPrompt.trim()) return;
        setIsGeneratingSubtasks(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = { type: Type.OBJECT, properties: { subtasks: { type: Type.ARRAY, items: { type: Type.STRING } } } };
            const fullPrompt = `You are a project manager. Based on the main task "${task.title}" and the goal "${aiSubtaskPrompt}", break it down into a list of 3-5 small, actionable subtasks.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            const result = JSON.parse(response.text);
            const newSubtasks: Subtask[] = result.subtasks.map((title: string) => ({
                id: `subtask-${Date.now()}-${Math.random()}`,
                title,
                completed: false,
            }));
            handleUpdate('subtasks', [...editedTask.subtasks, ...newSubtasks]);
            setAiSubtaskPrompt('');
        } catch(error) {
            console.error("AI Subtask generation failed:", error);
            // In a real app, show a toast notification to the user
        } finally {
            setIsGeneratingSubtasks(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] border border-gray-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white">Task Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 grid grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="col-span-2 space-y-6">
                        {/* Title */}
                        <input type="text" value={editedTask.title} onChange={e => handleUpdate('title', e.target.value)} className="w-full bg-transparent text-2xl font-bold text-white p-2 -m-2 rounded hover:bg-gray-700/50 focus:bg-gray-700/50 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        
                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Description</label>
                            <textarea value={editedTask.description} onChange={e => handleUpdate('description', e.target.value)} rows={5} className="w-full bg-gray-700/50 p-2 rounded text-gray-300 custom-scrollbar focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Add a more detailed description..."></textarea>
                        </div>
                        
                        {/* Subtasks */}
                        <div className="space-y-2">
                             <label className="text-sm font-medium text-gray-400 mb-2 block">Checklist</label>
                            {editedTask.subtasks.map((sub, index) => (
                                <div key={sub.id} className="flex items-center gap-2 group">
                                    <input type="checkbox" checked={sub.completed} onChange={() => {
                                        const newSubtasks = [...editedTask.subtasks];
                                        newSubtasks[index].completed = !newSubtasks[index].completed;
                                        handleUpdate('subtasks', newSubtasks);
                                    }} className="w-4 h-4 bg-gray-600 border-gray-500 rounded text-cyan-500 focus:ring-cyan-600" />
                                    <input type="text" value={sub.title} onChange={e => {
                                        const newSubtasks = [...editedTask.subtasks];
                                        newSubtasks[index].title = e.target.value;
                                        handleUpdate('subtasks', newSubtasks);
                                    }} className={`w-full bg-transparent p-1 rounded ${sub.completed ? 'line-through text-gray-500' : 'text-gray-300'} hover:bg-gray-700/50`} />
                                </div>
                            ))}
                             <div className="flex gap-2 mt-2">
                                <input type="text" value={aiSubtaskPrompt} onChange={e => setAiSubtaskPrompt(e.target.value)} placeholder="Goal for AI to generate subtasks..." className="flex-grow bg-gray-700/50 p-2 rounded text-white text-sm" />
                                <button onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                                    <Sparkles size={16}/> {isGeneratingSubtasks ? 'Generating...' : 'AI'}
                                </button>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><Activity size={16}/> Activity</label>
                            <div className="flex gap-3">
                                <img src={MOCK_USERS[0].avatarUrl} alt="current user" className="w-8 h-8 rounded-full" />
                                <div className="flex-grow">
                                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2} className="w-full bg-gray-700/50 p-2 rounded text-gray-300 custom-scrollbar focus:ring-2 focus:ring-cyan-500 outline-none"></textarea>
                                    <button onClick={handleAddComment} className="mt-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium">Save</button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {editedTask.comments.slice().reverse().map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{comment.author.name} <span className="text-xs text-gray-400 ml-2">{formatDate(comment.timestamp)}</span></p>
                                            <p className="text-sm text-gray-300">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="col-span-1 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 block">Status</label>
                            <select value={editedTask.status} onChange={e => handleUpdate('status', e.target.value as ProjectStatus)} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 block">Assignee</label>
                            <select value={editedTask.assignee?.id || ''} onChange={e => handleUpdate('assignee', MOCK_USERS.find(u=>u.id === e.target.value))} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                <option value="">Unassigned</option>
                                {MOCK_USERS.map(u => <option key={u.id} value={u.