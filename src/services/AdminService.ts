import apiClient from './api';
import { AdminAction, PaginatedResponse } from '@/types';

export const AdminService = {
  getAdminActions: async (skip = 0, take = 10): Promise<PaginatedResponse<AdminAction>> => {
    const response = await apiClient.get(`/admin/actions?skip=${skip}&take=${take}`);
    return response.data;
  },

  getAdminAction: async (id: string): Promise<AdminAction> => {
    const response = await apiClient.get(`/admin/actions/${id}`);
    return response.data;
  },

  createAdminAction: async (actionData: {
    admin_user_id: string;
    action_type: string;
    target_user_id?: string;
    target_playlist_id?: string;
    target_song_id?: string;
    reason?: string;
  }): Promise<AdminAction> => {
    const response = await apiClient.post('/admin/actions', actionData);
    return response.data;
  },
  // Admin dashboard stats
  getDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get('/admin/dashboard-stats');
    return response.data;
  },

  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/admin/statistics');
    return response.data;
  },
  getWithdrawals: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/withdrawals');
    return response.data;
  },
  processWithdrawal: async (withdrawalId: number): Promise<any> => {
    const response = await apiClient.put(`/admin/withdrawals/${withdrawalId}/process`);
    return response.data;
  },

  // User management
  getUsers: async (): Promise<any[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  updateUser: async (userId: number, userData: any): Promise<any> => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  // Playlist management
  getPlaylists: async (): Promise<any[]> => {
    const response = await apiClient.get('/playlists');
    return response.data;
  },

  updatePlaylist: async (playlistId: number, playlistData: any): Promise<any> => {
    const response = await apiClient.put(`/playlists/${playlistId}`, playlistData);
    return response.data;
  },

  deletePlaylist: async (playlistId: number): Promise<void> => {
    await apiClient.delete(`/playlists/${playlistId}`);
  },

  // Song management
  getSongs: async (): Promise<any[]> => {
    const response = await apiClient.get('/songs');
    return response.data;
  },

  updateSong: async (songId: number, songData: any): Promise<any> => {
    const response = await apiClient.put(`/songs/${songId}`, songData);
    return response.data;
  },

  deleteSong: async (songId: number): Promise<void> => {
    await apiClient.delete(`/songs/${songId}`);
  },

  // Submission management
  getSubmissions: async (): Promise<any[]> => {
    const response = await apiClient.get('/submissions');
    return response.data;
  },

  updateSubmission: async (submissionId: number, submissionData: any): Promise<any> => {
    const response = await apiClient.put(`/submissions/${submissionId}`, submissionData);
    return response.data;
  },

  deleteSubmission: async (submissionId: number): Promise<void> => {
    await apiClient.delete(`/submissions/${submissionId}`);
  },

  // Transaction management
  getTransactions: async (): Promise<any[]> => {
    const response = await apiClient.get('/transactions');
    return response.data;
  },
  // Platform management
  getPlatforms: async (): Promise<any[]> => {
    const response = await apiClient.get('/platforms');
    return response.data;
  },

  createPlatform: async (platformData: any): Promise<any> => {
    const response = await apiClient.post('/platforms', platformData);
    return response.data;
  },

  updatePlatform: async (platformId: number, platformData: any): Promise<any> => {
    const response = await apiClient.put(`/platforms/${platformId}`, platformData);
    return response.data;
  },

  deletePlatform: async (platformId: number): Promise<void> => {
    await apiClient.delete(`/platforms/${platformId}`);
  },

  // Admin user management methods
  suspendUser: async (userId: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
  },

  reactivateUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/reactivate`);
  },

  // Admin content moderation methods
  flagContent: async (contentType: 'playlist' | 'song', contentId: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/${contentType}s/${contentId}/flag`, { reason });
  },

  unflagContent: async (contentType: 'playlist' | 'song', contentId: string): Promise<void> => {
    await apiClient.post(`/admin/${contentType}s/${contentId}/unflag`);
  }
};
