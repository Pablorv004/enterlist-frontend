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
