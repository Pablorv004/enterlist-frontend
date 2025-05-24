// filepath: src/services/SpotifyService.ts
import apiClient from './api';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
  followers: {
    total: number;
  };
  tracks: {
    total: number;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
  release_date: string;
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  uri: string;
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export const SpotifyService = {
  // Get user playlists with tracks
  getPlaylists: async (limit = 50, offset = 0): Promise<any> => {
    const response = await apiClient.get(`/auth/spotify/playlists?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get user tracks (for artists - includes album tracks and saved tracks)
  getTracks: async (limit = 50, offset = 0): Promise<any> => {
    const response = await apiClient.get(`/auth/spotify/tracks?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // Get Spotify login URL
  getLoginUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get('/auth/spotify/login-url');
    return response.data;
  },

  // Import playlists to the platform
  importPlaylists: async (playlistIds: string[]): Promise<any> => {
    const response = await apiClient.post('/auth/spotify/import/playlists', { playlistIds });
    return response.data;
  },

  // Import tracks to the platform
  importTracks: async (trackIds: string[]): Promise<any> => {
    const response = await apiClient.post('/auth/spotify/import/tracks', { trackIds });
    return response.data;
  }
};

export default SpotifyService;
