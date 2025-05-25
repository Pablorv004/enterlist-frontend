import apiClient, { createCancelableRequest, cleanupRequest } from './api';
import { Song, PaginatedResponse } from '@/types';
import { handleNotFoundPaginated } from '@/utils/apiHelpers';

export const SongService = {
  getSongs: async (skip = 0, take = 10, cancelKey?: string): Promise<PaginatedResponse<Song>> => {
    try {
      const config: any = {};
      if (cancelKey) {
        const controller = createCancelableRequest(cancelKey);
        config.signal = controller.signal;
      }
      
      const response = await apiClient.get(`/songs?skip=${skip}&take=${take}`, config);
      
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      
      return response.data;
    } catch (error: unknown) {
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      return handleNotFoundPaginated<Song>(error);
    }
  },

  getSongsByArtist: async (artistId: string, skip = 0, take = 10, cancelKey?: string): Promise<PaginatedResponse<Song>> => {
    try {
      const config: any = {};
      if (cancelKey) {
        const controller = createCancelableRequest(cancelKey);
        config.signal = controller.signal;
      }
      
      const response = await apiClient.get(`/songs/artist/${artistId}?skip=${skip}&take=${take}`, config);
      
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      
      return response.data;
    } catch (error: unknown) {
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      return handleNotFoundPaginated<Song>(error);
    }
  },

  getSong: async (id: string): Promise<Song> => {
    try {
      const response = await apiClient.get(`/songs/${id}`);
      return response.data;
    } catch (error) {
      throw error; // Single resource lookups should still throw errors
    }
  },

  createSong: async (songData: {
    artist_id: string;
    platform_id: number;
    platform_specific_id: string;
    title: string;
    artist_name_on_platform: string;
    album_name?: string;
    url?: string;
    cover_image_url?: string;
    duration_ms?: number;
    is_visible?: boolean;
  }): Promise<Song> => {
    const response = await apiClient.post('/songs', songData);
    return response.data;
  },

  updateSong: async (
    id: string,
    songData: {
      title?: string;
      artist_name_on_platform?: string;
      album_name?: string;
      url?: string;
      cover_image_url?: string;
      duration_ms?: number;
      is_visible?: boolean;
    }
  ): Promise<Song> => {
    const response = await apiClient.put(`/songs/${id}`, songData);
    return response.data;
  },

  deleteSong: async (id: string): Promise<void> => {
    await apiClient.delete(`/songs/${id}`);
  },
  // Method to import songs from connected platform
  importSongs: async (platformId: number): Promise<Song[]> => {
    try {
      const response = await apiClient.post('/songs/import', { platformId });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return []; // Return empty array for import if no songs found
      }
      throw error;
    }
  }
};
