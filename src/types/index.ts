export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  subtaskCount: number;
  completedSubtaskCount: number;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  parentId: string | null;
  subtasks: TaskSummary[];
  createdAt: string;
  updatedAt: string | null;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface TaskUpdatePayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface TaskDashboardMetrics {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
}

// IA Types
export interface TaskImprovementResponse {
  title: string;
  description: string;
}

export interface TaskAnalysisResponse {
  priority: string;
  complexity: string;
  estimatedHours: number;
  reason: string;
}

export interface SubtaskItem {
  title: string;
  description: string;
}

export interface TaskDecompositionResponse {
  subtasks: SubtaskItem[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  createdTasks?: TaskResponse[];
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  timestamp: string;
  createdTasks?: TaskResponse[];
}

