import apiClient, { createCancelableRequest, cleanupRequest } from './api';
import { Submission, PaginatedResponse, SubmissionStatus } from '@/types';
import { handleNotFoundPaginated } from '@/utils/apiHelpers';

export const SubmissionService = {
  getSubmissions: async (skip = 0, take = 10, cancelKey?: string): Promise<PaginatedResponse<Submission>> => {
    try {
      const config: any = {};
      if (cancelKey) {
        const controller = createCancelableRequest(cancelKey);
        config.signal = controller.signal;
      }
      
      const response = await apiClient.get(`/submissions?skip=${skip}&take=${take}`, config);
      
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      
      return response.data;
    } catch (error: unknown) {
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      return handleNotFoundPaginated<Submission>(error);
    }
  },
  
  getSubmissionsByArtist: async (artistId: string, skip = 0, take = 10, status?: SubmissionStatus, cancelKey?: string): Promise<PaginatedResponse<Submission>> => {
    try {
      const config: any = {};
      if (cancelKey) {
        const controller = createCancelableRequest(cancelKey);
        config.signal = controller.signal;
      }
      
      let url = `/submissions/artist/${artistId}?skip=${skip}&take=${take}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await apiClient.get(url, config);
      
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      
      return response.data;
    } catch (error: unknown) {
      if (cancelKey) {
        cleanupRequest(cancelKey);
      }
      return handleNotFoundPaginated<Submission>(error);
    }
  },
  
  getSubmissionsByPlaylist: async (playlistId: string, skip = 0, take = 10, status?: SubmissionStatus): Promise<PaginatedResponse<Submission>> => {
    try {
      let url = `/submissions/playlist/${playlistId}?skip=${skip}&take=${take}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<Submission>(error);
    }
  },
  
  getSubmissionsByCreator: async (creatorId: string, skip = 0, take = 10, status?: SubmissionStatus, playlistId?: string): Promise<PaginatedResponse<Submission>> => {
    try {
        let url = `/submissions/creator/${creatorId}?skip=${skip}&take=${take}`;
        if (status) {
            url += `&status=${status}`;
        }
        if (playlistId) {
            url += `&playlistId=${playlistId}`;
        }
        const response = await apiClient.get(url);
        return response.data;
    } catch (error: unknown) {
        return handleNotFoundPaginated<Submission>(error);
    }
  },

  getSubmissionsBySong: async (songId: string, skip = 0, take = 10): Promise<PaginatedResponse<Submission>> => {
    try {
      const response = await apiClient.get(`/submissions/song/${songId}?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<Submission>(error);
    }
  },

  getSubmission: async (id: string): Promise<Submission> => {
    try {
      const response = await apiClient.get(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      throw error; // Individual resource lookups should throw errors
    }
  },
  
  createSubmission: async (submissionData: {
    artist_id: string;
    playlist_id: string;
    song_id: string;
    submission_message?: string;
    payment_method_id?: string;
  }): Promise<Submission> => {
    const response = await apiClient.post('/submissions', submissionData);
    return response.data;
  },

  updateSubmissionStatus: async (
    id: string,
    status: SubmissionStatus,
    review_feedback?: string
  ): Promise<Submission> => {
    const response = await apiClient.put(`/submissions/${id}/status`, { 
      status, 
      review_feedback 
    });
    return response.data;
  },

  deleteSubmission: async (id: string): Promise<void> => {
    await apiClient.delete(`/submissions/${id}`);
  },

  getSubmissionStatsByCreator: async (creatorId: string): Promise<Record<string, any>> => {
    try {
      const response = await apiClient.get(`/submissions/stats/creator/${creatorId}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get submission stats:', error);
      return {};
    }
  },  getEarningsStatsByCreator: async (creatorId: string): Promise<Array<{month: string, amount: number}>> => {
    try {
      console.log(`Getting earnings stats for creator ${creatorId}`);
      const response = await apiClient.get(`/submissions/earnings/creator/${creatorId}`);
      console.log('Earnings API raw response:', response);
      console.log('Earnings API response data:', response.data);
      
      // Validate response data
      if (!Array.isArray(response.data)) {
        console.error('Earnings API returned invalid data format:', response.data);
        return [];
      }
      
      // Validate each item in the array
      const validData = response.data.every(item => 
        item && typeof item === 'object' && 'month' in item && 'amount' in item);
      
      if (!validData) {
        console.error('Earnings API returned items with invalid structure:', response.data);
        return [];
      }
      
      // Make sure amounts are numbers
      const processedData = response.data.map(item => ({
        month: item.month,
        amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount)
      }));
      
      return processedData;
    } catch (error: unknown) {
      console.error('Failed to get earnings stats:', error);
      return [];
    }
  },
};
