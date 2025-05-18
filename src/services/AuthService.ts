import apiClient from './api';
import { AuthResponse, User } from '@/types';

export const AuthService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
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

  // OAuth methods
  spotifyAuth: async (code: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/oauth/spotify', { code });
    return response.data;
  },

  soundcloudAuth: async (code: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/oauth/soundcloud', { code });
    return response.data;
  },

  youtubeAuth: async (code: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/oauth/youtube', { code });
    return response.data;
  }
};
