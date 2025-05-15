import apiService from './api.service';
import {
    Song,
    PaginatedResponse
} from '../types';
import {
    SongCreate,
    SongUpdate
} from '../types/song.types';

class SongService {
    /**
     * Get all songs (paginated)
     */
    async getSongs(skip: number = 0, take: number = 10): Promise<PaginatedResponse<Song>> {
        return await apiService.get<PaginatedResponse<Song>>(`/songs?skip=${skip}&take=${take}`);
    }

    /**
     * Get songs by artist
     */
    async getSongsByArtist(artistId: string, skip: number = 0, take: number = 10): Promise<PaginatedResponse<Song>> {
        return await apiService.get<PaginatedResponse<Song>>(`/songs/artist/${artistId}?skip=${skip}&take=${take}`);
    }

    /**
     * Get a single song by ID
     */
    async getSongById(songId: string): Promise<Song> {
        return await apiService.get<Song>(`/songs/${songId}`);
    }

    /**
     * Create a new song
     */
    async createSong(songData: SongCreate): Promise<Song> {
        return await apiService.post<Song>('/songs', songData);
    }

    /**
     * Update an existing song
     */
    async updateSong(songId: string, songData: SongUpdate): Promise<Song> {
        return await apiService.put<Song>(`/songs/${songId}`, songData);
    }

    /**
     * Delete a song
     */
    async deleteSong(songId: string): Promise<void> {
        return await apiService.delete<void>(`/songs/${songId}`);
    }
}

export default new SongService();
