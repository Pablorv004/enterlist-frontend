import apiClient from './api';
import { Platform, LinkedAccount } from '@/types';

export const PlatformService = {  getPlatforms: async (): Promise<Platform[]> => {
    const response = await apiClient.get('/platforms');
    // Handle nested data structure if present
    return response.data && response.data.data ? response.data.data : response.data;
  },

  getPlatform: async (id: number): Promise<Platform> => {
    const response = await apiClient.get(`/platforms/${id}`);
    return response.data;
  },
  // Linked accounts methods
  getLinkedAccounts: async (userId: string): Promise<LinkedAccount[]> => {
    const response = await apiClient.get(`/linked-accounts/user/${userId}`);
    // Handle nested data structure if present
    return response.data && response.data.data ? response.data.data : response.data;
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
    try {
      // First try to get the URL from the API
      const response = await apiClient.get('/auth/spotify/login-url');
      if (response.data && response.data.url) {
        return { url: response.data.url };
      }
    } catch (error) {
      console.warn('Failed to get Spotify auth URL from API, using direct URL fallback', error);
    }
    
    // Use register-or-login endpoint which doesn't require authentication
    return { url: `${apiClient.defaults.baseURL}/auth/spotify/register-or-login` };
  },

  getYoutubeAuthUrl: async (): Promise<{ url: string }> => {
    try {
      // First try to get the URL from the API
      const response = await apiClient.get('/auth/youtube/login-url');
      if (response.data && response.data.url) {
        return { url: response.data.url };
      }
    } catch (error) {
      console.warn('Failed to get YouTube auth URL from API, using direct URL fallback', error);
    }
      
    // Use register-or-login endpoint which doesn't require authentication
    return { url: `${apiClient.defaults.baseURL}/auth/youtube/register-or-login` };
  },

  handleOAuthCallback: async (code: string, state: string, platform: string): Promise<LinkedAccount> => {
    const response = await apiClient.post(`/platforms/${platform}/oauth-callback`, { code, state });
    return response.data;
  }
};
