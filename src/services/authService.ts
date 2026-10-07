import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};
