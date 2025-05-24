import apiClient from './api';
import { AuthResponse, User } from '@/types';

export const AuthService = {  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    oauth_provider?: string;
    oauth_id?: string;
  }): Promise<User> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  updateUserRole: async (roleData: { role: string }): Promise<User> => {
    const response = await apiClient.put('/users/role/update', roleData);
    return response.data;
  },  // OAuth methods
  spotifyAuth: async (code: string): Promise<AuthResponse> => {
    // This endpoint doesn't exist - the server handles the callback directly
    // We just need to check auth status after redirect
    const response = await apiClient.get('/auth/profile');
    return {
      user: response.data,
      access_token: localStorage.getItem('enterlist_token') || ''
    };
  },

  youtubeAuth: async (code: string): Promise<AuthResponse> => {
    // This endpoint doesn't exist - the server handles the callback directly
    // We just need to check auth status after redirect
    const response = await apiClient.get('/auth/profile');
    return {
      user: response.data,
      access_token: localStorage.getItem('enterlist_token') || ''
    };
  }
};
