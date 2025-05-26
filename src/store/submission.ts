import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Submission, SubmissionStatus } from '@/types';
import { SubmissionService } from '@/services/SubmissionService';
import { cancelRequests } from '@/services/api';

export const useSubmissionStore = defineStore('submission', () => {
  const submissions = ref<Submission[]>([]);
  const currentSubmission = ref<Submission | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);

  // Actions
  const fetchSubmissions = async (skip = 0, take = 10): Promise<void> => {
    const cancelKey = 'fetchSubmissions';
    loading.value = true;
    error.value = null;

    try {
      const response = await SubmissionService.getSubmissions(skip, take, cancelKey);
      submissions.value = response.data;
      totalCount.value = response.total;
    } catch (err: any) {
      // Don't show error for cancelled requests
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        error.value = err.response?.data?.message || 'Failed to fetch submissions';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchSubmissionsByArtist = async (artistId: string, skip = 0, take = 10, status?: SubmissionStatus): Promise<void> => {
    const cancelKey = 'fetchSubmissionsByArtist';
    loading.value = true;
    error.value = null;

    try {
      const response = await SubmissionService.getSubmissionsByArtist(artistId, skip, take, status, cancelKey);
      submissions.value = response.data;
      totalCount.value = response.total;
    } catch (err: any) {
      // Don't show error for cancelled requests
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        error.value = err.response?.data?.message || 'Failed to fetch submissions';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };const fetchSubmissionsByCreator = async (creatorId: string, skip = 0, take = 10, status?: SubmissionStatus, playlistId?: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const response = await SubmissionService.getSubmissionsByCreator(creatorId, skip, take, status, playlistId);
        submissions.value = response.data;
        totalCount.value = response.total;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch submissions';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSubmissionsByPlaylist = async (playlistId: string, skip = 0, take = 10, status?: SubmissionStatus): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await SubmissionService.getSubmissionsByPlaylist(playlistId, skip, take, status);
      submissions.value = response.data;
      totalCount.value = response.total;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch submissions';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSubmissionsBySong = async (songId: string, skip = 0, take = 10): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await SubmissionService.getSubmissionsBySong(songId, skip, take);
      submissions.value = response.data;
      totalCount.value = response.total;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch submissions';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSubmission = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await SubmissionService.getSubmission(id);
      currentSubmission.value = response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch submission';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const createSubmission = async (submissionData: {
    artist_id: string;
    playlist_id: string;
    song_id: string;
    submission_message?: string;
    payment_method_id?: string;
  }): Promise<Submission> => {
    loading.value = true;
    error.value = null;

    try {
      const submission = await SubmissionService.createSubmission(submissionData);
      submissions.value.unshift(submission);
      return submission;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create submission';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSubmissionStatus = async (
    id: string,
    status: SubmissionStatus,
    review_feedback?: string
  ): Promise<Submission> => {
    loading.value = true;
    error.value = null;

    try {
      const updatedSubmission = await SubmissionService.updateSubmissionStatus(id, status, review_feedback);
      
      // Update in array if exists
      const index = submissions.value.findIndex(s => s.submission_id === id);
      if (index !== -1) {
        submissions.value[index] = updatedSubmission;
      }
      
      // Update current submission if it's the one being edited
      if (currentSubmission.value?.submission_id === id) {
        currentSubmission.value = updatedSubmission;
      }
      
      return updatedSubmission;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update submission status';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSubmission = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await SubmissionService.deleteSubmission(id);
      
      // Remove from array
      submissions.value = submissions.value.filter(s => s.submission_id !== id);
      
      // Clear current submission if it's the one being deleted
      if (currentSubmission.value?.submission_id === id) {
        currentSubmission.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete submission';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Computed getters for filtering submissions by status
  const pendingSubmissions = computed(() => {
    return submissions.value.filter(s => s.status === SubmissionStatus.PENDING);
  });

  const underReviewSubmissions = computed(() => {
    return submissions.value.filter(s => s.status === SubmissionStatus.UNDER_REVIEW);
  });

  const approvedSubmissions = computed(() => {
    return submissions.value.filter(s => s.status === SubmissionStatus.APPROVED);
  });
  const rejectedSubmissions = computed(() => {
    return submissions.value.filter(s => s.status === SubmissionStatus.REJECTED);
  });

  const cancelAllRequests = () => {
    cancelRequests('fetchSubmissions');
    cancelRequests('fetchSubmissionsByArtist');
  };

  return {
    submissions,
    currentSubmission,
    loading,
    error,
    totalCount,
    pendingSubmissions,
    underReviewSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    fetchSubmissions,
    fetchSubmissionsByArtist,
    fetchSubmissionsByPlaylist,
    fetchSubmissionsByCreator,
    fetchSubmissionsBySong,
    fetchSubmission,
    createSubmission,
    updateSubmissionStatus,
    deleteSubmission,
    cancelAllRequests
  };
});
