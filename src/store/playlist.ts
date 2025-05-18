import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Playlist } from '@/types';
import { PlaylistService } from '@/services/PlaylistService';

export const usePlaylistStore = defineStore('playlist', () => {
  const playlists = ref<Playlist[]>([]);
  const currentPlaylist = ref<Playlist | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const selectedPlaylistId = ref<string | null>(null);

  // Actions
  const setSelectedPlaylistId = (id: string | null) => {
    selectedPlaylistId.value = id;
  };

  // Actions
  const fetchPlaylists = async (skip = 0, take = 10): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await PlaylistService.getPlaylists(skip, take);
      playlists.value = response.data;
      totalCount.value = response.total;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch playlists';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPlaylistsByCreator = async (creatorId: string, skip = 0, take = 10): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await PlaylistService.getPlaylistsByCreator(creatorId, skip, take);
      playlists.value = response.data;
      totalCount.value = response.total;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch playlists';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPlaylist = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await PlaylistService.getPlaylist(id);
      currentPlaylist.value = response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch playlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const  createPlaylist = async (playlistData: {
    creator_id: string;
    platform_id: number;
    platform_specific_id: string;
    name: string;
    description?: string;
    url?: string;
    cover_image_url?: string;
    is_visible?: boolean;
    genre?: string;
    follower_count?: number;
    submission_fee?: number;
  }): Promise<Playlist> => {
    loading.value = true;
    error.value = null;

    try {
      const playlist = await PlaylistService.createPlaylist(playlistData);
      playlists.value.unshift(playlist);
      return playlist;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create playlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const  updatePlaylist = async (
    id: string,
    playlistData: {
      name?: string;
      description?: string;
      url?: string;
      cover_image_url?: string;
      is_visible?: boolean;
      genre?: string;
      follower_count?: number;
      submission_fee?: number;
    }
  ): Promise<Playlist> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedPlaylist = await PlaylistService.updatePlaylist(id, playlistData);
      
      // Update in array if exists
      const index = playlists.value.findIndex(p => p.playlist_id === id);
      if (index !== -1) {
        playlists.value[index] = updatedPlaylist;
      }
      
      // Update current playlist if it's the one being edited
      if (currentPlaylist.value?.playlist_id === id) {
        currentPlaylist.value = updatedPlaylist;
      }
      
      return updatedPlaylist;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update playlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePlaylist = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await PlaylistService.deletePlaylist(id);
      
      // Remove from array
      playlists.value = playlists.value.filter(p => p.playlist_id !== id);
      
      // Clear current playlist if it's the one being deleted
      if (currentPlaylist.value?.playlist_id === id) {
        currentPlaylist.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete playlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const importPlaylists = async (platformId: number): Promise<Playlist[]> => {
    loading.value = true;
    error.value = null;

    try {
      const importedPlaylists = await PlaylistService.importPlaylists(platformId);
      // Add to existing playlists if not already there
      importedPlaylists.forEach(playlist => {
        if (!playlists.value.some(p => p.playlist_id === playlist.playlist_id)) {
          playlists.value.push(playlist);
        }
      });
      return importedPlaylists;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to import playlists';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const updateSubmissionFee = async (id: string, submissionFee: number): Promise<Playlist> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedPlaylist = await PlaylistService.updateSubmissionFee(id, submissionFee);
      
      // Update in array if exists
      const index = playlists.value.findIndex(p => p.playlist_id === id);
      if (index !== -1) {
        playlists.value[index] = updatedPlaylist;
      }
      
      // Update current playlist if it's the one being edited
      if (currentPlaylist.value?.playlist_id === id) {
        currentPlaylist.value = updatedPlaylist;
      }
      
      return updatedPlaylist;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update submission fee';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const getActivePlaylists = async (skip = 0, take = 10): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await PlaylistService.getActivePlaylists(skip, take);
      playlists.value = response.data;
      totalCount.value = response.total;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch active playlists';
      throw err;
    } finally {
      loading.value = false;
    }
  };  return {
    playlists,
    currentPlaylist,
    loading,
    error,
    totalCount,
    selectedPlaylistId,
    setSelectedPlaylistId,
    fetchPlaylists,
    fetchPlaylistsByCreator,
    fetchPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    importPlaylists,
    updateSubmissionFee,
    getActivePlaylists
  };
});
