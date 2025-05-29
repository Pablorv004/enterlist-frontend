import apiClient from './api';
import { AdminAction, PaginatedResponse } from '@/types';

export const AdminService = {  getAdminActions: async (skip = 0, take = 100): Promise<PaginatedResponse<AdminAction>> => {
    const response = await apiClient.get(`/admin-actions?skip=${skip}&take=${take}`);
    return response.data;
  },

  getAdminAction: async (id: string): Promise<AdminAction> => {
    const response = await apiClient.get(`/admin-actions/${id}`);
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
    const response = await apiClient.post('/admin-actions', actionData);
    return response.data;
  },

  deleteAdminAction: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin-actions/${id}`);
  },// Admin dashboard stats
  getDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get('/admin/dashboard-stats');
    return response.data;
  },

  getStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/admin/statistics');
    return response.data;
  },

  getWithdrawals: async (skip = 0, take = 10, status?: string): Promise<any> => {
    let url = `/admin/withdrawals?skip=${skip}&take=${take}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  processWithdrawal: async (withdrawalId: string, status: 'completed' | 'failed', notes?: string): Promise<any> => {
    const response = await apiClient.put(`/admin/withdrawals/${withdrawalId}/process`, { status, notes });
    return response.data;
  },

  // User management
  getUsers: async (skip = 0, take = 10): Promise<any> => {
    const response = await apiClient.get(`/admin/users?skip=${skip}&take=${take}`);
    return response.data;
  },

  getUser: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, userData: any): Promise<any> => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  suspendUser: async (userId: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
  },

  reactivateUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/reactivate`);
  },

  // Playlist management
  getPlaylists: async (skip = 0, take = 10): Promise<any> => {
    const response = await apiClient.get(`/admin/playlists?skip=${skip}&take=${take}`);
    return response.data;
  },

  getPlaylist: async (playlistId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/playlists/${playlistId}`);
    return response.data;
  },

  updatePlaylist: async (playlistId: string, playlistData: any): Promise<any> => {
    const response = await apiClient.put(`/admin/playlists/${playlistId}`, playlistData);
    return response.data;
  },

  deletePlaylist: async (playlistId: string): Promise<void> => {
    await apiClient.delete(`/admin/playlists/${playlistId}`);
  },

  flagPlaylist: async (playlistId: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/playlists/${playlistId}/flag`, { reason });
  },

  unflagPlaylist: async (playlistId: string): Promise<void> => {
    await apiClient.post(`/admin/playlists/${playlistId}/unflag`);
  },

  // Song management
  getSongs: async (skip = 0, take = 10): Promise<any> => {
    const response = await apiClient.get(`/admin/songs?skip=${skip}&take=${take}`);
    return response.data;
  },

  getSong: async (songId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/songs/${songId}`);
    return response.data;
  },

  updateSong: async (songId: string, songData: any): Promise<any> => {
    const response = await apiClient.put(`/admin/songs/${songId}`, songData);
    return response.data;
  },

  deleteSong: async (songId: string): Promise<void> => {
    await apiClient.delete(`/admin/songs/${songId}`);
  },

  flagSong: async (songId: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/songs/${songId}/flag`, { reason });
  },

  unflagSong: async (songId: string): Promise<void> => {
    await apiClient.post(`/admin/songs/${songId}/unflag`);
  },

  // Submission management
  getSubmissions: async (skip = 0, take = 10, status?: string): Promise<any> => {
    let url = `/admin/submissions?skip=${skip}&take=${take}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getSubmission: async (submissionId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/submissions/${submissionId}`);
    return response.data;
  },

  updateSubmission: async (submissionId: string, submissionData: any): Promise<any> => {
    const response = await apiClient.put(`/admin/submissions/${submissionId}`, submissionData);
    return response.data;
  },

  deleteSubmission: async (submissionId: string): Promise<void> => {
    await apiClient.delete(`/admin/submissions/${submissionId}`);
  },

  // Transaction management
  getTransactions: async (skip = 0, take = 10, status?: string): Promise<any> => {
    let url = `/admin/transactions?skip=${skip}&take=${take}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getTransaction: async (transactionId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/transactions/${transactionId}`);
    return response.data;
  },

  // Platform management
  getPlatforms: async (): Promise<any[]> => {
    const response = await apiClient.get('/admin/platforms');
    return response.data;
  },

  getPlatform: async (platformId: number): Promise<any> => {
    const response = await apiClient.get(`/admin/platforms/${platformId}`);
    return response.data;
  },

  createPlatform: async (platformData: any): Promise<any> => {
    const response = await apiClient.post('/admin/platforms', platformData);
    return response.data;
  },

  updatePlatform: async (platformId: number, platformData: any): Promise<any> => {
    const response = await apiClient.put(`/admin/platforms/${platformId}`, platformData);
    return response.data;
  },

  deletePlatform: async (platformId: number): Promise<void> => {
    await apiClient.delete(`/admin/platforms/${platformId}`);
  },

  // Admin content moderation methods (kept for backward compatibility)
  flagContent: async (contentType: 'playlist' | 'song', contentId: string, reason: string): Promise<void> => {
    if (contentType === 'playlist') {
      await AdminService.flagPlaylist(contentId, reason);
    } else if (contentType === 'song') {
      await AdminService.flagSong(contentId, reason);
    }
  },

  unflagContent: async (contentType: 'playlist' | 'song', contentId: string): Promise<void> => {
    if (contentType === 'playlist') {
      await AdminService.unflagPlaylist(contentId);
    } else if (contentType === 'song') {
      await AdminService.unflagSong(contentId);
    }
  }
};
