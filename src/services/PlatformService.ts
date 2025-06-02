import apiClient from './api';
import { Platform, LinkedAccount } from '@/types';
import { Capacitor } from '@capacitor/core';

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
  },  // OAuth endpoints for specific platforms
  getSpotifyAuthUrl: async (): Promise<{ url: string }> => {
    const isMobile = Capacitor.isNativePlatform();
    const mobileParam = isMobile ? '?mobile=true' : '';
    
    try {
      // Try to get the URL from the authenticated API endpoint for account linking
      const response = await apiClient.get(`/auth/spotify/login-url${mobileParam}`);
      if (response.data && response.data.url) {
        return { url: response.data.url };
      }
      // If response doesn't have url, throw error to be handled below
      throw new Error('No URL returned from authenticated endpoint');
    } catch (error: any) {
      // Only fall back to register-or-login if user is not authenticated (401)
      if (error.response && error.response.status === 401) {
        console.warn('User not authenticated, using register-or-login endpoint for Spotify');
        return { url: `${apiClient.defaults.baseURL}/auth/spotify/register-or-login${mobileParam}` };
      }
      
      // For other errors (network, server errors, etc.), throw the error
      // This ensures we don't silently fall back when the user IS authenticated
      // but there's a server/network issue
      console.error('Failed to get Spotify auth URL:', error);
      throw new Error(`Failed to get Spotify authentication URL: ${error.message || 'Unknown error'}`);
    }
  },  
  getYoutubeAuthUrl: async (): Promise<{ url: string }> => {
    const isMobile = Capacitor.isNativePlatform();
    const mobileParam = isMobile ? '?mobile=true' : '';
    
    try {
      // Try to get the URL from the authenticated API endpoint for account linking
      const response = await apiClient.get(`/auth/youtube/login-url${mobileParam}`);
      if (response.data && response.data.url) {
        return { url: response.data.url };
      }
      // If response doesn't have url, throw error to be handled below
      throw new Error('No URL returned from authenticated endpoint');
    } catch (error: any) {
      // Only fall back to register-or-login if user is not authenticated (401)
      if (error.response && error.response.status === 401) {
        console.warn('User not authenticated, using register-or-login endpoint for YouTube');
        return { url: `${apiClient.defaults.baseURL}/auth/youtube/register-or-login${mobileParam}` };
      }
      
      // For other errors (network, server errors, etc.), throw the error
      // This ensures we don't silently fall back when the user IS authenticated
      // but there's a server/network issue
      console.error('Failed to get YouTube auth URL:', error);
      throw new Error(`Failed to get YouTube authentication URL: ${error.message || 'Unknown error'}`);
    }
  },

  handleOAuthCallback: async (code: string, state: string, platform: string): Promise<LinkedAccount> => {
    const response = await apiClient.post(`/platforms/${platform}/oauth-callback`, { code, state });
    return response.data;
  }
};
