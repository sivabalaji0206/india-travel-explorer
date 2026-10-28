import { apiClient } from './client';
import { TokenResponse, User } from './types';

export const authApi = {
  register: async (payload: { name: string; email: string; password: string }): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/register', payload);
    return response.data;
  },

  login: async (payload: { email: string; password: string }): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', payload);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

