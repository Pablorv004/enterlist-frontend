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
}

export const YouTubeService = {
  // Get user channels
  getChannels: async (): Promise<YouTubeChannel[]> => {
    const response = await apiClient.get('/api/auth/youtube/channels');
    return response.data;
  },

  // Get user playlists
  getPlaylists: async (): Promise<YouTubePlaylist[]> => {
    const response = await apiClient.get('/api/auth/youtube/playlists');
    return response.data;
  },

  // Get user videos
  getVideos: async (): Promise<YouTubeVideo[]> => {
    const response = await apiClient.get('/api/auth/youtube/videos');
    return response.data;
  },

  // Get videos from a specific playlist
  getPlaylistVideos: async (playlistId: string): Promise<YouTubeVideo[]> => {
    const response = await apiClient.get(`/api/auth/youtube/playlists/${playlistId}/videos`);
    return response.data;
  },

  // Import playlists to the platform
  importPlaylists: async (playlistIds: string[]): Promise<any> => {
    const response = await apiClient.post('/api/auth/youtube/import/playlists', { playlistIds });
    return response.data;
  },

  // Import videos to the platform
  importVideos: async (videoIds: string[]): Promise<any> => {
    const response = await apiClient.post('/api/auth/youtube/import/videos', { videoIds });
    return response.data;
  }
};

export default YouTubeService;
