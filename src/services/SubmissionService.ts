import apiClient from './api';
import { Submission, PaginatedResponse, SubmissionStatus } from '@/types';
import { handleNotFoundPaginated } from '@/utils/apiHelpers';

export const SubmissionService = {
  getSubmissions: async (skip = 0, take = 10): Promise<PaginatedResponse<Submission>> => {
    try {
      const response = await apiClient.get(`/submissions?skip=${skip}&take=${take}`);
      return response.data;
    } catch (error: unknown) {
      return handleNotFoundPaginated<Submission>(error);
    }
  },
  
  getSubmissionsByArtist: async (artistId: string, skip = 0, take = 10, status?: SubmissionStatus): Promise<PaginatedResponse<Submission>> => {
    try {
      let url = `/submissions/artist/${artistId}?skip=${skip}&take=${take}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
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
  
  getSubmissionsByCreator: async (creatorId: string, skip = 0, take = 10, status?: SubmissionStatus): Promise<PaginatedResponse<Submission>> => {
    try {
      let url = `/submissions/creator/${creatorId}?skip=${skip}&take=${take}`;
      if (status) {
        url += `&status=${status}`;
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
  }
};
