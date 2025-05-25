import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Song } from '@/types';
import { SongService } from '@/services/SongService';
import { cancelRequests } from '@/services/api';

export const useSongStore = defineStore('song', () => {
  const songs = ref<Song[]>([]);
  const currentSong = ref<Song | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);  const totalCount = ref(0);

  // Actions
  const fetchSongs = async (skip = 0, take = 10): Promise<void> => {
    const cancelKey = 'fetchSongs';
    loading.value = true;
    error.value = null;

    try {
      const response = await SongService.getSongs(skip, take, cancelKey);
      songs.value = response.data;
      totalCount.value = response.total;
      // No error handling needed here since the service now handles 404s by returning empty data
    } catch (err: any) {
      // Don't show error for cancelled requests
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        error.value = err.response?.data?.message || 'Failed to fetch songs';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSongsByArtist = async (artistId: string, skip = 0, take = 10): Promise<void> => {
    const cancelKey = 'fetchSongsByArtist';
    loading.value = true;
    error.value = null;

    try {
      const response = await SongService.getSongsByArtist(artistId, skip, take, cancelKey);
      songs.value = response.data;
      totalCount.value = response.total;
      // No error handling needed here since the service now handles 404s by returning empty data
    } catch (err: any) {
      // Don't show error for cancelled requests
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        error.value = err.response?.data?.message || 'Failed to fetch songs';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSong = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await SongService.getSong(id);
      currentSong.value = response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch song';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSong = async (songData: {
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
    loading.value = true;
    error.value = null;

    try {
      const song = await SongService.createSong(songData);
      songs.value.unshift(song);
      return song;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create song';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSong = async (
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
    loading.value = true;
    error.value = null;

    try {
      const updatedSong = await SongService.updateSong(id, songData);
      
      // Update in array if exists
      const index = songs.value.findIndex(s => s.song_id === id);
      if (index !== -1) {
        songs.value[index] = updatedSong;
      }
      
      // Update current song if it's the one being edited
      if (currentSong.value?.song_id === id) {
        currentSong.value = updatedSong;
      }
      
      return updatedSong;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update song';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSong = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await SongService.deleteSong(id);
      
      // Remove from array
      songs.value = songs.value.filter(s => s.song_id !== id);
      
      // Clear current song if it's the one being deleted
      if (currentSong.value?.song_id === id) {
        currentSong.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete song';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const importSongs = async (platformId: number): Promise<Song[]> => {
    loading.value = true;
    error.value = null;

    try {
      const importedSongs = await SongService.importSongs(platformId);
      // Add to existing songs if not already there
      importedSongs.forEach(song => {
        if (!songs.value.some(s => s.song_id === song.song_id)) {
          songs.value.push(song);
        }
      });
      return importedSongs;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to import songs';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cancelAllRequests = () => {
    cancelRequests('fetchSongs');
    cancelRequests('fetchSongsByArtist');
  };

  return {
    songs,
    currentSong,
    loading,
    error,
    totalCount,
    fetchSongs,
    fetchSongsByArtist,
    fetchSong,
    createSong,
    updateSong,
    deleteSong,
    importSongs,
    cancelAllRequests
  };
});
