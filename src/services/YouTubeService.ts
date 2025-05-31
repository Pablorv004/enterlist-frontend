// filepath: src/services/YouTubeService.ts
import apiClient from './api';

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

export interface YouTubeVideo {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string, width: number, height: number };
      medium: { url: string, width: number, height: number };
      high: { url: string, width: number, height: number };
    };
  };
  contentDetails?: {
    duration: string; // ISO 8601 duration format
    dimension: string;
    definition: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  status?: {
    privacyStatus: string;
  };
}

export interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string, width: number, height: number };
      medium: { url: string, width: number, height: number };
      high: { url: string, width: number, height: number };
    };
  };
  contentDetails: {
    itemCount: number;
  };
  // Add channel statistics if available
  channelInfo?: {
    subscriberCount?: string;
    viewCount?: string;
  };
}

export const YouTubeService = {  // Get user channels
  getChannels: async (limit = 50, offset = 0): Promise<YouTubeChannel[]> => {
    const response = await apiClient.get(`/auth/youtube/channels?limit=${limit}&offset=${offset}`);
    // Handle both direct array and nested object responses
    return Array.isArray(response.data) ? response.data : (response.data?.items || []);
  },
  // Get user playlists
  getPlaylists: async (limit = 50, offset = 0): Promise<YouTubePlaylist[]> => {
    const response = await apiClient.get(`/auth/youtube/playlists?limit=${limit}&offset=${offset}`);
    // Handle both direct array and nested object responses
    return Array.isArray(response.data) ? response.data : (response.data?.items || []);
  },
  // Get user videos
  getVideos: async (limit = 50, offset = 0, musicOnly = false): Promise<YouTubeVideo[]> => {
    const response = await apiClient.get(`/auth/youtube/videos?limit=${limit}&offset=${offset}&musicOnly=${musicOnly}`);
    // Handle both direct array and nested object responses
    return Array.isArray(response.data) ? response.data : (response.data?.items || []);
  },

  // Get user songs (music videos only)
  getSongs: async (limit = 50, offset = 0): Promise<YouTubeVideo[]> => {
    const response = await apiClient.get(`/auth/youtube/songs?limit=${limit}&offset=${offset}`);
    // Handle both direct array and nested object responses
    return Array.isArray(response.data) ? response.data : (response.data?.items || []);
  },
  // Get YouTube login URL
  getLoginUrl: async (): Promise<{ url: string }> => {
    // Detect if running on mobile (Capacitor/Cordova)
    const isMobile = window.location.protocol === 'capacitor:' || 
                     window.location.protocol === 'ionic:' ||
                     /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) ||
                     (window as any).Capacitor;
    
    const response = await apiClient.get(`/auth/youtube/login-url${isMobile ? '?mobile=true' : ''}`);
    return response.data;
  },

  // Import playlists to the platform
  importPlaylists: async (playlistIds: string[]): Promise<any> => {
    const response = await apiClient.post('/auth/youtube/import/playlists', { playlistIds });
    return response.data;
  },

  // Import videos to the platform
  importVideos: async (videoIds: string[]): Promise<any> => {
    const response = await apiClient.post('/auth/youtube/import/videos', { videoIds });
    return response.data;
  }
};

export default YouTubeService;
