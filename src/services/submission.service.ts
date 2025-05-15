import apiService from './api.service';
import {
    Submission,
    SubmissionStatus,
    PaginatedResponse
} from '../types';
import {
    SubmissionCreate,
    SubmissionUpdate
} from '../types/submission.types';

class SubmissionService {
    /**
     * Get all submissions (paginated)
     */
    async getSubmissions(skip: number = 0, take: number = 10, status?: SubmissionStatus): Promise<PaginatedResponse<Submission>> {
        let url = `/submissions?skip=${skip}&take=${take}`;
        if (status) {
            url += `&status=${status}`;
        }
        return await apiService.get<PaginatedResponse<Submission>>(url);
    }

    /**
     * Get submissions by artist
     */
    async getSubmissionsByArtist(artistId: string, skip: number = 0, take: number = 10): Promise<PaginatedResponse<Submission>> {
        return await apiService.get<PaginatedResponse<Submission>>(`/submissions/artist/${artistId}?skip=${skip}&take=${take}`);
    }

    /**
     * Get submissions by playlist
     */
    async getSubmissionsByPlaylist(playlistId: string, skip: number = 0, take: number = 10): Promise<PaginatedResponse<Submission>> {
        return await apiService.get<PaginatedResponse<Submission>>(`/submissions/playlist/${playlistId}?skip=${skip}&take=${take}`);
    }

    /**
     * Get a single submission by ID
     */
    async getSubmissionById(submissionId: string): Promise<Submission> {
        return await apiService.get<Submission>(`/submissions/${submissionId}`);
    }

    /**
     * Create a new submission
     */
    async createSubmission(submissionData: SubmissionCreate): Promise<Submission> {
        return await apiService.post<Submission>('/submissions', submissionData);
    }

    /**
     * Update a submission (typically for reviewing)
     */
    async updateSubmission(submissionId: string, submissionData: SubmissionUpdate): Promise<Submission> {
        return await apiService.put<Submission>(`/submissions/${submissionId}`, submissionData);
    }

    /**
     * Delete a submission
     */
    async deleteSubmission(submissionId: string): Promise<void> {
        return await apiService.delete<void>(`/submissions/${submissionId}`);
    }
}

export default new SubmissionService();
