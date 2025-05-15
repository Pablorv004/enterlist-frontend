import apiService from './api.service';
import {
    Playlist,
    PaginatedResponse
} from '../types';
import {
    PlaylistCreate,
    PlaylistUpdate
} from '../types/playlist.types';

class PlaylistService {
    /**
     * Get all playlists (paginated)
     */
    async getPlaylists(skip: number = 0, take: number = 10): Promise<PaginatedResponse<Playlist>> {
        return await apiService.get<PaginatedResponse<Playlist>>(`/playlists?skip=${skip}&take=${take}`);
    }

    /**
     * Get playlists by creator
     */
    async getPlaylistsByCreator(creatorId: string, skip: number = 0, take: number = 10): Promise<PaginatedResponse<Playlist>> {
        return await apiService.get<PaginatedResponse<Playlist>>(`/playlists/creator/${creatorId}?skip=${skip}&take=${take}`);
    }

    /**
     * Get a single playlist by ID
     */
    async getPlaylistById(playlistId: string): Promise<Playlist> {
        return await apiService.get<Playlist>(`/playlists/${playlistId}`);
    }

    /**
     * Create a new playlist
     */
    async createPlaylist(playlistData: PlaylistCreate): Promise<Playlist> {
        return await apiService.post<Playlist>('/playlists', playlistData);
    }

    /**
     * Update an existing playlist
     */
    async updatePlaylist(playlistId: string, playlistData: PlaylistUpdate): Promise<Playlist> {
        return await apiService.put<Playlist>(`/playlists/${playlistId}`, playlistData);
    }

    /**
     * Delete a playlist
     */
    async deletePlaylist(playlistId: string): Promise<void> {
        return await apiService.delete<void>(`/playlists/${playlistId}`);
    }
}

export default new PlaylistService();
