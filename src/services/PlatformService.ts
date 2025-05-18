import apiClient from './api';
import { Platform, LinkedAccount } from '@/types';

export const PlatformService = {
  getPlatforms: async (): Promise<Platform[]> => {
    const response = await apiClient.get('/platforms');
    return response.data;
  },

  getPlatform: async (id: number): Promise<Platform> => {
    const response = await apiClient.get(`/platforms/${id}`);
    return response.data;
  },

  // Linked accounts methods
  getLinkedAccounts: async (userId: string): Promise<LinkedAccount[]> => {
    const response = await apiClient.get(`/linked-accounts/user/${userId}`);
    return response.data;
  },

  getLinkedAccount: async (id: string): Promise<LinkedAccount> => {
    const response = await apiClient.get(`/linked-accounts/${id}`);
    return response.data;
  },

  linkAccount: async (linkData: {
    user_id: string;
    platform_id: number;
    external_user_id: string;
    access_token: string;
    refresh_token?: string;
    token_expires_at?: string;
  }): Promise<LinkedAccount> => {
    const response = await apiClient.post('/linked-accounts', linkData);
    return response.data;
  },

  unlinkAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/linked-accounts/${id}`);
  },

  // OAuth endpoints for specific platforms
  getSpotifyAuthUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get('/platforms/spotify/auth-url');
    return response.data;
  },

  getSoundcloudAuthUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get('/platforms/soundcloud/auth-url');
    return response.data;
  },

  getYoutubeAuthUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get('/platforms/youtube/auth-url');
    return response.data;
  },

  handleOAuthCallback: async (code: string, state: string, platform: string): Promise<LinkedAccount> => {
    const response = await apiClient.post(`/platforms/${platform}/oauth-callback`, { code, state });
    return response.data;
  }
};
