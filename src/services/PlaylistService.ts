import apiClient from './api';
import { Playlist, PaginatedResponse, TrackResponse } from '@/types';
import { handleNotFoundPaginated } from '@/utils/apiHelpers';

export const PlaylistService = {
  getPlaylists: async (skip = 0, take = 10): Promise<PaginatedResponse<Playlist>> => {
    try {
      const response = await apiClient.get(`/playlists?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<Playlist>(error);
    }
  },
  
  getPlaylistsByCreator: async (creatorId: string, skip = 0, take = 10): Promise<PaginatedResponse<Playlist>> => {
    try {
      const response = await apiClient.get(`/playlists/creator/${creatorId}?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<Playlist>(error);
    }
  },

  getPlaylistsByPlatform: async (platformId: number, skip = 0, take = 50): Promise<PaginatedResponse<Playlist>> => {
    try {
      const response = await apiClient.get(`/playlists/platform/${platformId}?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<Playlist>(error);
    }
  },

  getPlaylist: async (id: string): Promise<Playlist> => {
    try {
      const response = await apiClient.get(`/playlists/${id}`);
      return response.data;
    } catch (error) {
      throw error; // Single resource lookups should throw errors
    }
  },
  
  createPlaylist: async (playlistData: {
    creator_id: string;
    platform_id: number;
    platform_specific_id: string;
    name: string;
    description?: string;
    url?: string;
    cover_image_url?: string;
    is_visible?: boolean;
    genre?: string;
    submission_fee?: number;
  }): Promise<Playlist> => {
    const response = await apiClient.post('/playlists', playlistData);
    return response.data;
  },
  
  updatePlaylist: async (
    id: string,
    playlistData: {
      name?: string;
      description?: string;
      url?: string;
      cover_image_url?: string;
      is_visible?: boolean;
      genre?: string;
      submission_fee?: number;
    }
  ): Promise<Playlist> => {
    const response = await apiClient.put(`/playlists/${id}`, playlistData);
    return response.data;
  },
  deletePlaylist: async (id: string): Promise<Playlist> => {
    const response = await apiClient.put(`/playlists/${id}`, { deleted: true });
    return response.data;
  },
  
  
  // Method to update submission fee for a playlist
  updateSubmissionFee: async (id: string, submissionFee: number): Promise<Playlist> => {
    const response = await apiClient.put(`/playlists/${id}/submission-fee`, { submission_fee: submissionFee });
    return response.data;
  },
  
  // Method to update genre for a playlist
  updateGenre: async (id: string, genre: string): Promise<Playlist> => {
    const response = await apiClient.put(`/playlists/${id}/genre`, { genre: genre });
    return response.data;
  },
  
  // Method to get active playlists (ones marked as visible)
  getActivePlaylists: async (skip = 0, take = 10): Promise<PaginatedResponse<Playlist>> => {
    try {
      const response = await apiClient.get(`/playlists/active?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<Playlist>(error);
    }
  },
  // Method to get tracks for a specific playlist
  getPlaylistTracks: async (playlistId: string): Promise<TrackResponse> => {
    const response = await apiClient.get(`/playlists/${playlistId}/tracks`);
    return response.data;
  }
};
