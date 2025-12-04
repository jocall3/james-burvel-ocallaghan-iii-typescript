// types/models/personal/task.ts
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null;
  priority: TaskPriority;
  category: string;
  createdAt: number;
}
