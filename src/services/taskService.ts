import api from './api';
import type {
  TaskCreatePayload,
  TaskDashboardMetrics,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  TaskSummary,
  TaskUpdatePayload,
} from '../types';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const taskService = {
  async getDashboard(): Promise<TaskDashboardMetrics> {
    const response = await api.get<TaskDashboardMetrics>('/tasks/dashboard');
    return response.data;
  },

  async listTasks(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    rootOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<Page<TaskSummary>> {
    const response = await api.get<Page<TaskSummary>>('/tasks', { params });
    return response.data;
  },

  async getTaskById(id: string): Promise<TaskResponse> {
    const response = await api.get<TaskResponse>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: TaskCreatePayload): Promise<TaskResponse> {
    const response = await api.post<TaskResponse>('/tasks', data);
    return response.data;
  },

  async createSubtask(parentId: string, data: TaskCreatePayload): Promise<TaskResponse> {
    const response = await api.post<TaskResponse>(`/tasks/${parentId}/subtasks`, data);
    return response.data;
  },

  async updateTask(id: string, data: TaskUpdatePayload & { completeSubtasks?: boolean }): Promise<TaskResponse> {
    const response = await api.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: TaskStatus, completeSubtasks?: boolean): Promise<TaskResponse> {
    const response = await api.patch<TaskResponse>(`/tasks/${id}/status`, { status, completeSubtasks });
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
