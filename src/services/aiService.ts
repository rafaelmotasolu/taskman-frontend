import api from './api';
import type {
  ChatMessage,
  ChatResponse,
  SubtaskItem,
  TaskAnalysisResponse,
  TaskDecompositionResponse,
  TaskImprovementResponse,
  TaskResponse,
} from '../types';

export const aiService = {
  async improveTask(data: { title: string; description?: string }): Promise<TaskImprovementResponse> {
    const response = await api.post<TaskImprovementResponse>('/ai/tasks/improve', data);
    return response.data;
  },

  async analyzeTask(taskId: string): Promise<TaskAnalysisResponse> {
    const response = await api.post<TaskAnalysisResponse>(`/ai/tasks/${taskId}/analyze`);
    return response.data;
  },

  async decomposeTask(taskId: string): Promise<TaskDecompositionResponse> {
    const response = await api.post<TaskDecompositionResponse>(`/ai/tasks/${taskId}/decompose`);
    return response.data;
  },

  async applySubtasks(taskId: string): Promise<TaskResponse[]> {
    const response = await api.post<TaskResponse[]>(`/ai/tasks/${taskId}/apply-subtasks`);
    return response.data;
  },

  async applyApprovedSubtasks(taskId: string, subtasks: SubtaskItem[]): Promise<TaskResponse[]> {
    const response = await api.post<TaskResponse[]>(`/ai/tasks/${taskId}/decompose/apply`, subtasks);
    return response.data;
  },

  async chat(sessionId: string, message: string): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/ai/chat', { sessionId, message });
    return response.data;
  },

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get<ChatMessage[]>(`/ai/chat/${sessionId}/history`);
    return response.data;
  },
};
