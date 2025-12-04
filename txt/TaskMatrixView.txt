// components/views/productivity/TaskMatrixView.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Card from '../../Card';
import { Task, TaskPriority } from '../../../types';

// =================================================================================================
// SECTION: EXPANDED TYPES FOR A REAL-WORLD APPLICATION
// =================================================================================================

export type User = {
    id: string;
    name: string;
    avatarUrl?: string;
};

export type Subtask = {
    id: string;
    text: string;
    completed: boolean;
};

export type Comment = {
    id: string;
    taskId: string;
    author: User;
    text: string;
    createdAt: number;
    reactions?: { [emoji: string]: string[] }; // emoji -> array of user IDs
};

export type Attachment = {
    id: string;
    filename: string;
    url: string;
    size: number; // in bytes
    type: 'image' | 'document' | 'other';
    uploadedAt: number;
};

export type HistoryLog = {
    id: string;
    timestamp: number;
    user: User;
    action: string; // e.g., "created task", "changed priority from High to Medium", "completed subtask 'Design mockups'"
    details?: any;
};

export type RecurringRule = {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
    dayOfMonth?: number;
    endDate?: number;
};

// Override the imported Task type with a more detailed one for this module's scope
export type DetailedTask = Omit<Task, 'id'> & {
    id: string;
    subtasks: Subtask[];
    dependencies: string[]; // array of task IDs this task is blocked by
    assignedTo: string[]; // array of user IDs
    tags: string[];
    history: HistoryLog[];
    comments: Comment[];
    attachments: Attachment[];
    recurring?: RecurringRule;
    progress: number; // 0-100, calculated or manually set
    estimatedHours?: number;
    loggedHours?: number;
    project?: string;
};


// =================================================================================================
// SECTION: MOCK DATA & CONSTANTS
// =================================================================================================

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Alice', avatarUrl: '/avatars/alice.png' },
    { id: 'u2', name: 'Bob', avatarUrl: '/avatars/bob.png' },
    { id: 'u3', name: 'Charlie', avatarUrl: '/avatars/charlie.png' },
    { id: 'u4', name: 'Diana' },
];

const MOCK_TASKS_DETAILED: DetailedTask[] = [
    { id: '1', text: 'Finalize Q3 budget report', completed: false, dueDate: '2024-08-15', priority: 'High', category: 'Finance', createdAt: Date.now() - 1000000, subtasks: [{id: 's1', text: 'Review department submissions', completed: true}, {id: 's2', text: 'Consolidate figures', completed: false}], dependencies: ['3'], assignedTo: ['u1'], tags: ['reporting', 'Q3', 'finance'], history: [], comments: [], attachments: [], progress: 50, estimatedHours: 8, loggedHours: 3, project: 'Q3 Financials' },
    { id: '2', text: 'Draft "The First Covenant" document', completed: true, dueDate: '2024-07-30', priority: 'Urgent', category: 'Strategy', createdAt: Date.now() - 2000000, subtasks: [], dependencies: [], assignedTo: ['u2', 'u3'], tags: ['strategy', 'planning', 'top-secret'], history: [], comments: [], attachments: [], progress: 100, estimatedHours: 20, loggedHours: 25, project: 'Project Chimera' },
    { id: '3', text: 'Onboard new AI model to production', completed: false, dueDate: '2024-08-20', priority: 'Medium', category: 'Engineering', createdAt: Date.now() - 500000, subtasks: [{id: 's3', text: 'Deploy to staging', completed: true}, {id: 's4', text: 'Run integration tests', completed: true}, {id: 's5', text: 'Monitor performance', completed: false}], dependencies: [], assignedTo: ['u3'], tags: ['AI', 'deployment', 'infra'], history: [], comments: [], attachments: [], progress: 66, estimatedHours: 40, project: 'AI Core Upgrade' },
    { id: '4', text: 'Schedule team offsite', completed: false, dueDate: null, priority: 'Low', category: 'HR', createdAt: Date.now(), subtasks: [], dependencies: [], assignedTo: ['u4'], tags: ['team', 'culture'], history: [], comments: [], attachments: [], progress: 0, estimatedHours: 4, project: 'Internal' },
    { id: '5', text: 'Design new marketing landing page', completed: false, dueDate: '2024-09-01', priority: 'Medium', category: 'Marketing', createdAt: Date.now() - 300000, subtasks: [], dependencies: ['2'], assignedTo: ['u1', 'u4'], tags: ['design', 'web', 'marketing'], history: [], comments: [], attachments: [], progress: 10, estimatedHours: 12, project: 'Website Redesign' },
    { id: '6', text: 'Fix login authentication bug (PROD-241)', completed: false, dueDate: '2024-08-12', priority: 'Urgent', category: 'Engineering', createdAt: Date.now() - 800000, subtasks: [], dependencies: [], assignedTo: ['u3'], tags: ['bug', 'production', 'auth'], history: [], comments: [], attachments: [], progress: 0, estimatedHours: 6, project: 'Core App' },
    { id: '7', text: 'Weekly social media content plan', completed: false, dueDate: null, priority: 'Low', category: 'Marketing', createdAt: Date.now() - 400000, subtasks: [], dependencies: [], assignedTo: ['u1'], tags: ['social-media', 'content'], history: [], comments: [], attachments: [], progress: 0, recurring: { frequency: 'weekly', interval: 1, daysOfWeek: ['Mon'] }, project: 'Social Engagement' },
];

export const PRIORITY_STYLES: Record<TaskPriority, { icon: React.ReactNode, color: string, badgeColor: string }> = {
    'Low': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>, color: 'text-gray-400', badgeColor: 'bg-gray-700' },
    'Medium': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>, color: 'text-cyan-400', badgeColor: 'bg-cyan-900/50 text-cyan-300' },
    'High': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>, color: 'text-yellow-400', badgeColor: 'bg-yellow-900/50 text-yellow-300' },
    'Urgent': { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-red-400', badgeColor: 'bg-red-900/50 text-red-300' }
};

export const PRIORITY_ORDER: Record<TaskPriority, number> = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };


// =================================================================================================
// SECTION: UTILITY FUNCTIONS
// =================================================================================================

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const formatDate = (date: Date | string | number | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

export const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
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

// =================================================================================================
// SECTION: MOCK API SERVICE
// =================================================================================================

export class TaskAPIService {
    static latency = 500; // ms

    static async getTasks(): Promise<DetailedTask[]> {
        console.log("API: Fetching tasks...");
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("API: Fetched tasks successfully.");
                resolve(JSON.parse(localStorage.getItem('tasks') || JSON.stringify(MOCK_TASKS_DETAILED)));
            }, this.latency);
        });
    }

    static async updateTask(updatedTask: DetailedTask): Promise<DetailedTask> {
        console.log(`API: Updating task ${updatedTask.id}...`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.05) { // 5% chance of failure
                    console.error(`API: Failed to update task ${updatedTask.id}.`);
                    reject(new Error("A server error occurred."));
                    return;
                }
                const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                const newTasks = tasks.map((t: DetailedTask) => t.id === updatedTask.id ? updatedTask : t);
                localStorage.setItem('tasks', JSON.stringify(newTasks));
                console.log(`API: Updated task ${updatedTask.id} successfully.`);
                resolve(updatedTask);
            }, this.latency);
        });
    }
    
    static async createTask(newTaskData: Omit<DetailedTask, 'id' | 'createdAt' | 'history' | 'comments' | 'attachments' | 'progress'>): Promise<DetailedTask> {
        console.log("API: Creating new task...");
        return new Promise(resolve => {
            setTimeout(() => {
                const currentUser = MOCK_USERS[0];
                const newTask: DetailedTask = {
                    ...newTaskData,
                    id: generateId(),
                    createdAt: Date.now(),
                    history: [{ id: generateId(), timestamp: Date.now(), user: currentUser, action: 'created the task' }],
                    comments: [],
                    attachments: [],
                    progress: 0,
                };
                const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                const newTasks = [newTask, ...tasks];
                localStorage.setItem('tasks', JSON.stringify(newTasks));
                console.log(`API: Created new task ${newTask.id} successfully.`);
                resolve(newTask);
            }, this.latency);
        });
    }

    static async deleteTask(taskId: string): Promise<{ success: boolean }> {
         console.log(`API: Deleting task ${taskId}...`);
         return new Promise(resolve => {
            setTimeout(() => {
                const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                const newTasks = tasks.filter((t: DetailedTask) => t.id !== taskId);
                localStorage.setItem('tasks', JSON.stringify(newTasks));
                console.log(`API: Deleted task ${taskId} successfully.`);
                resolve({ success: true });
            }, this.latency);
         });
    }
}


// =================================================================================================
// SECTION: CUSTOM HOOKS
// =================================================================================================

export const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

export const useTaskManager = () => {
    const [tasks, setTasks] = useState<DetailedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize local storage if it's empty
        if (!localStorage.getItem('tasks')) {
            localStorage.setItem('tasks', JSON.stringify(MOCK_TASKS_DETAILED));
        }
        
        TaskAPIService.getTasks()
            .then(data => {
                setTasks(data);
                setLoading(false);
            })
            .catch(err => {
                setError("Failed to load tasks.");
                setLoading(false);
            });
    }, []);

    const updateTask = useCallback(async (updatedTask: DetailedTask) => {
        // Optimistic update
        const originalTasks = tasks;
        setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));

        try {
            await TaskAPIService.updateTask(updatedTask);
        } catch (e) {
            setError((e as Error).message || "Failed to update task.");
            // Rollback on failure
            setTasks(originalTasks);
        }
    }, [tasks]);

    const addTask = useCallback(async (newTaskData: Omit<DetailedTask, 'id' | 'createdAt' | 'history' | 'comments' | 'attachments' | 'progress'>) => {
        try {
            const newTask = await TaskAPIService.createTask(newTaskData);
            setTasks(prevTasks => [newTask, ...prevTasks]);
        } catch (e) {
            setError((e as Error).message || "Failed to add task.");
        }
    }, []);

    const deleteTask = useCallback(async (taskId: string) => {
        const originalTasks = tasks;
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
        try {
            await TaskAPIService.deleteTask(taskId);
        } catch (e) {
            setError((e as Error).message || "Failed to delete task.");
            setTasks(originalTasks);
        }
    }, [tasks]);
    
    const toggleTaskCompleted = useCallback((taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const isCompleted = !task.completed;
            const progress = isCompleted ? 100 : (task.subtasks.length > 0 ? Math.round(task.subtasks.filter(st => st.completed).length / task.subtasks.length * 100) : 0);
            updateTask({ ...task, completed: isCompleted, progress });
        }
    }, [tasks, updateTask]);

    return { tasks, loading, error, addTask, updateTask, deleteTask, toggleTaskCompleted, setTasks };
};


// =================================================================================================
// SECTION: UI HELPER COMPONENTS
// =================================================================================================

export const Spinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

export const UserAvatar: React.FC<{ userId: string; size?: 'sm' | 'md' }> = ({ userId, size = 'sm' }) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    const sizeClasses = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
    if (!user) return null;
    
    return (
        <div title={user.name} className={`flex-shrink-0 ${sizeClasses} rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-800`}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="rounded-full" /> : user.name.charAt(0)}
        </div>
    );
};

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
    </div>
);

export const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">{children}</span>
);

// =================================================================================================
// SECTION: MAJOR SUB-COMPONENTS
// =================================================================================================

export const AddTaskForm: React.FC<{onAddTask: Function, categories: string[], projects: string[]}> = ({ onAddTask, categories, projects }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('Medium');
    const [category, setCategory] = useState('General');
    const [project, setProject] = useState('Internal');
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        const newTaskData: Omit<DetailedTask, 'id' | 'createdAt' | 'history' | 'comments' | 'attachments' | 'progress'> = {
            text,
            dueDate: dueDate || null,
            priority,
            category,
            project,
            completed: false,
            subtasks: [],
            dependencies: [],
            assignedTo: [],
            tags: [],
            estimatedHours: 0,
        };
        onAddTask(newTaskData);
        setText(''); setDueDate(''); setPriority('Medium');
        setIsExpanded(false);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                    type="text" 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    onFocus={() => setIsExpanded(true)}
                    placeholder="Add a new sovereign objective..." 
                    className="flex-grow bg-gray-700/50 border-gray-600 rounded-lg p-3 text-white w-full text-base"
                />
                {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-down">
                        <div>
                            <label className="text-xs text-gray-400">Due Date</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white mt-1"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white mt-1">
                                {Object.keys(PRIORITY_STYLES).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Category</label>
                             <input list="categories" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white mt-1"/>
                            <datalist id="categories">
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Project</label>
                             <input list="projects" value={project} onChange={e => setProject(e.target.value)} placeholder="Project" className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white mt-1"/>
                            <datalist id="projects">
                                {projects.map(p => <option key={p} value={p} />)}
                            </datalist>
                        </div>
                        <div className="lg:col-span-4 flex justify-end gap-3 mt-2">
                             <button type="button" onClick={() => setIsExpanded(false)} className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Task</button>
                        </div>
                    </div>
                )}
            </form>
        </Card>
    );
};

export const TaskToolbar: React.FC<{
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    filters: any;
    setFilters: (f: any) => void;
    categories: string[];
    projects: string[];
    users: User[];
    viewMode: 'list' | 'kanban';
    setViewMode: (v: 'list' | 'kanban') => void;
}> = ({ searchTerm, setSearchTerm, filters, setFilters, categories, projects, users, viewMode, setViewMode }) => {
    return (
        <Card>
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-grow min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search tasks by name or tag..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                     <select onChange={e => setFilters((f: any) => ({ ...f, status: e.target.value }))} value={filters.status} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm text-white">
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                     <select onChange={e => setFilters((f: any) => ({ ...f, priority: e.target.value }))} value={filters.priority} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm text-white">
                        <option value="all">All Priorities</option>
                        {Object.keys(PRIORITY_STYLES).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select onChange={e => setFilters((f: any) => ({ ...f, category: e.target.value }))} value={filters.category} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm text-white">
                        {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                    </select>
                     <select onChange={e => setFilters((f: any) => ({ ...f, project: e.target.value }))} value={filters.project} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm text-white">
                        {projects.map(p => <option key={p} value={p}>{p === 'all' ? 'All Projects' : p}</option>)}
                    </select>
                     <select onChange={e => setFilters((f: any) => ({ ...f, assignedTo: e.target.value }))} value={filters.assignedTo} className="bg-gray-700/50 border-gray-600 rounded-lg p-2 text-sm text-white">
                        <option value="all">All Users</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center bg-gray-700/50 border-gray-600 rounded-lg p-1">
                    <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`}>List</button>
                    <button onClick={() => setViewMode('kanban')} className={`px-3 py-1 text-sm rounded ${viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`}>Kanban</button>
                </div>
            </div>
        </Card>
    );
};

export const TaskItem: React.FC<{
    task: DetailedTask,
    onToggle: (id: string) => void,
    onDelete: (task: DetailedTask) => void,
    onSelect: (task: DetailedTask) => void,
}> = ({ task, onToggle, onDelete, onSelect }) => {
    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
    
    return (
        <div className={`flex items-start justify-between p-3 bg-gray-800/50 rounded-lg transition-all duration-300 hover:bg-gray-800/80 cursor-pointer group ${task.completed ? 'task-completed opacity-60' : ''}`} onClick={() => onSelect(task)}>
            <div className="flex items-start gap-4 flex-grow">
                <input type="checkbox" checked={task.completed} onChange={(e) => { e.stopPropagation(); onToggle(task.id); }} className="checkbox checkbox-cyan checkbox-sm checkbox-anim mt-1" />
                <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-center gap-2">
                       <div className={`${PRIORITY_STYLES[task.priority].color}`}>{PRIORITY_STYLES[task.priority].icon}</div>
                       <span className="flex-grow">{task.text}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        {task.project && <span className="font-semibold">{task.project}</span>}
                        {task.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                    </div>
                    {task.subtasks.length > 0 && (
                        <div className="mt-1 w-full pr-4">
                           <ProgressBar progress={task.progress} />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 text-xs flex-shrink-0 ml-4">
                <span className={`px-2 py-1 ${PRIORITY_STYLES[task.priority].badgeColor} rounded-full hidden sm:inline-block`}>{task.category}</span>
                <div className="flex -space-x-2">
                    {task.assignedTo.map(userId => <UserAvatar key={userId} userId={userId} />)}
                </div>
                {task.dueDate && <span className={`font-mono ${isOverdue ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{formatDate(task.dueDate)}</span>}
                <button onClick={(e) => { e.stopPropagation(); onDelete(task); }} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    );
};

export const ListView: React.FC<{
    tasks: DetailedTask[],
    onToggle: (id: string) => void,
    onDelete: (task: DetailedTask) => void,
    onSelect: (task: DetailedTask) => void,
}> = ({ tasks, onToggle, onDelete, onSelect }) => {
    return (
        <div className="space-y-3">
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onSelect={onSelect} />
            ))}
            {tasks.length === 0 && <p className="text-center text-gray-500 py-8">No tasks match your criteria.</p>}
        </div>
    );
};

export const KanbanCard: React.FC<{
    task: DetailedTask,
    onSelect: (task: DetailedTask) => void,
}> = ({ task, onSelect }) => (
    <div onClick={() => onSelect(task)} className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700/80 space-y-2">
        <p className="text-white font-medium text-sm">{task.text}</p>
        <div className="flex flex-wrap gap-1">
            {task.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
         <div className="flex justify-between items-center pt-2">
            <div className="flex -space-x-2">
                {task.assignedTo.map(userId => <UserAvatar key={userId} userId={userId} />)}
            </div>
            <span className="text-xs text-gray-400">{task.project}</span>
         </div>
    </div>
);

export const KanbanView: React.FC<{
    tasks: DetailedTask[],
    onSelect: (task: DetailedTask) => void,
}> = ({ tasks, onSelect }) => {
    const columns = useMemo(() => {
        const urgent = tasks.filter(t => t.priority === 'Urgent' && !t.completed);
        const high = tasks.filter(t => t.priority === 'High' && !t.completed);
        const medium = tasks.filter(t => t.priority === 'Medium' && !t.completed);
        const low = tasks.filter(t => t.priority === 'Low' && !t.completed);
        return { urgent, high, medium, low };
    }, [tasks]);

    const KanbanColumn: React.FC<{ title: string, tasks: DetailedTask[], color: string }> = ({ title, tasks, color }) => (
        <div className="flex-1 min-w-[280px] bg-gray-900/50 rounded-lg p-3">
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${color}`}>
                {title} <span className="text-sm font-normal text-gray-400">{tasks.length}</span>
            </h3>
            <div className="space-y-3 h-[60vh] overflow-y-auto pr-1">
                {tasks.map(task => <KanbanCard key={task.id} task={task} onSelect={onSelect} />)}
            </div>
        </div>
    );

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn title="Urgent" tasks={columns.urgent} color="text-red-400" />
            <KanbanColumn title="High" tasks={columns.high} color="text-yellow-400" />
            <KanbanColumn title="Medium" tasks={columns.medium} color="text-cyan-400" />
            <KanbanColumn title="Low" tasks={columns.low} color="text-gray-400" />
        </div>
    );
};

export const TaskDetailModal: React.FC<{
    task: DetailedTask,
    onClose: () => void,
    onUpdate: (task: DetailedTask) => void,
}> = ({ task, onClose, onUpdate }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useClickOutside(modalRef, onClose);
    const [editedTask, setEditedTask] = useState(task);

    const handleFieldChange = (field: keyof DetailedTask, value: any) => {
        setEditedTask(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(editedTask);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div ref={modalRef} className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Task Details</h2>
                    <div className="flex items-center gap-4">
                         <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">Save & Close</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </header>
                <div className="flex-grow p-6 overflow-y-auto grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        <input 
                            type="text" 
                            value={editedTask.text} 
                            onChange={(e) => handleFieldChange('text', e.target.value)} 
                            className="w-full bg-transparent text-2xl font-semibold text-white border-none focus:ring-0 p-0" 
                        />
                        {/* Subtasks Section */}
                        <div className="space-y-2">
                           <h4 className="font-semibold text-gray-300">Subtasks</h4>
                           {/* Add subtask form */}
                           {/* List subtasks */}
                        </div>
                        {/* Comments Section */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-300">Comments</h4>
                            {/* Add comment form */}
                            {/* List comments */}
                        </div>
                        {/* Attachments Section */}
                         <div className="space-y-2">
                            <h4 className="font-semibold text-gray-300">Attachments</h4>
                            {/* File upload simulation */}
                        </div>
                    </div>
                    {/* Sidebar */}
                    <aside className="col-span-1 space-y-4 text-sm">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Status</label>
                            <select value={editedTask.completed ? 'completed' : 'active'} onChange={e => handleFieldChange('completed', e.target.value === 'completed')} className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white">
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Priority</label>
                             <select value={editedTask.priority} onChange={e => handleFieldChange('priority', e.target.value as TaskPriority)} className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white">
                                {Object.keys(PRIORITY_STYLES).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Assignees</label>
                            {/* Multi-select for users */}
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Due Date</label>
                             <input type="date" value={formatDate(editedTask.dueDate)} onChange={e => handleFieldChange('dueDate', e.target.value)} className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Project</label>
                            <input type="text" value={editedTask.project} onChange={e => handleFieldChange('project', e.target.value)} className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"/>
                        </div>
                         <div>
                            <label className="text-xs text-gray-400 block mb-1">Tags</label>
                            {/* Tag input component */}
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                           <p className="text-xs text-gray-500">Created: {timeAgo(editedTask.createdAt)}</p>
                           {/* Add more metadata */}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    confirmColor?: string;
}> = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmColor = 'bg-red-600 hover:bg-red-700' }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full p-6 text-center">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-gray-400 my-4">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="w-full py-2 bg-gray-600/50 hover:bg-gray-600 rounded">Cancel</button>
                    <button onClick={onConfirm} className={`w-full py-2 ${confirmColor} rounded`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

// =================================================================================================
// SECTION: MAIN VIEW COMPONENT
// =================================================================================================

const TaskMatrixView: React.FC = () => {
    const { tasks, loading, error, addTask, updateTask, deleteTask, toggleTaskCompleted, setTasks } = useTaskManager();
    const [taskToModify, setTaskToModify] = useState<{ type: 'delete' | 'edit', task: DetailedTask } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', project: 'all', assignedTo: 'all' });

    const uniqueData = useMemo(() => {
        const categories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];
        const projects = ['all', ...Array.from(new Set(tasks.map(t => t.project).filter(Boolean))) as string[]];
        return { categories, projects };
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                 const searchLower = searchTerm.toLowerCase();
                 return searchLower === '' || 
                        task.text.toLowerCase().includes(searchLower) ||
                        task.tags.some(tag => tag.toLowerCase().includes(searchLower));
            })
            .filter(task => filters.status === 'all' || (filters.status === 'completed' ? task.completed : !task.completed))
            .filter(task => filters.priority === 'all' || task.priority === filters.priority)
            .filter(task => filters.category === 'all' || task.category === filters.category)
            .filter(task => filters.project === 'all' || task.project === filters.project)
            .filter(task => filters.assignedTo === 'all' || task.assignedTo.includes(filters.assignedTo));
    }, [tasks, searchTerm, filters]);
    
    // Simple sort for demonstration
    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        });
    }, [filteredTasks]);

    const handleDelete = (id: string) => {
        deleteTask(id);
        setTaskToModify(null);
    };
    
    const handleSelectTask = (task: DetailedTask) => {
        setTaskToModify({ type: 'edit', task });
    };

    const handleUpdateTask = (updatedTask: DetailedTask) => {
        updateTask(updatedTask);
    }
    
    return (
        <div className="space-y-6">
            <style>{`
                .task-item-enter { opacity: 0; transform: translateY(-10px); }
                .task-item-enter-active { opacity: 1; transform: translateY(0); transition: opacity 300ms, transform 300ms; }
                .task-completed { text-decoration-color: #6b7280; }
                .task-completed span { text-decoration: line-through; color: #6b7280; transition: all 0.3s ease-in-out; }
                .task-completed .checkbox-anim { transform: scale(1.2); transition: transform 0.2s ease-out; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <h2 className="text-3xl font-bold text-white tracking-wider">Task Matrix</h2>
            
            <AddTaskForm onAddTask={addTask} categories={uniqueData.categories.filter(c => c !== 'all')} projects={uniqueData.projects.filter(p => p !== 'all')} />

            <TaskToolbar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                filters={filters}
                setFilters={setFilters}
                categories={uniqueData.categories}
                projects={uniqueData.projects}
                users={MOCK_USERS}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            <Card>
                {loading && <Spinner />}
                {error && <p className="text-center text-red-400 py-8">{error}</p>}
                {!loading && !error && (
                    viewMode === 'list' ? (
                        <ListView 
                            tasks={sortedTasks}
                            onToggle={toggleTaskCompleted}
                            onDelete={(task) => setTaskToModify({ type: 'delete', task })}
                            onSelect={handleSelectTask}
                        />
                    ) : (
                        <KanbanView 
                            tasks={sortedTasks}
                            onSelect={handleSelectTask}
                        />
                    )
                )}
            </Card>

            {taskToModify?.type === 'delete' && (
                <ConfirmationModal
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete this task? "${taskToModify.task.text}"`}
                    onConfirm={() => handleDelete(taskToModify.task.id)}
                    onCancel={() => setTaskToModify(null)}
                />
            )}
            
            {taskToModify?.type === 'edit' && (
                <TaskDetailModal
                    task={taskToModify.task}
                    onClose={() => setTaskToModify(null)}
                    onUpdate={handleUpdateTask}
                />
            )}
        </div>
    );
};

export default TaskMatrixView;