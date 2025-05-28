import apiClient from './api';
import { User, PaginatedResponse } from '@/types';
import { handleNotFoundPaginated } from '@/utils/apiHelpers';

export const UserService = {
  getUsers: async (skip = 0, take = 10): Promise<PaginatedResponse<User>> => {
    try {
      const response = await apiClient.get(`/users?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<User>(error);
    }
  },

  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    oauth_provider?: string;
    oauth_id?: string;
  }): Promise<User> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  updateUser: async (
    id: string,
    userData: {
      username?: string;
      email?: string;
      password?: string;
      role?: string;
      oauth_provider?: string;
      oauth_id?: string;
      is_active?: boolean;
    }
  ): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Profile-related methods
  getProfileStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/users/profile/statistics');
    return response.data;
  },

  deactivateAccount: async (): Promise<any> => {
    const response = await apiClient.put('/users/profile/deactivate');
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    const response = await apiClient.put('/users/profile/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};
