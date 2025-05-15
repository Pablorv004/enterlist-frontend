// src/types/submission.types.ts
import { SubmissionStatus } from './index';

// Type for creating a new submission
export interface SubmissionCreate {
    song_id: string;
    playlist_id: string;
    artist_id: string;
    submission_message?: string;
}

// Type for updating a submission (for reviewing)
export interface SubmissionUpdate {
    status: SubmissionStatus;
    reviewer_notes?: string;
}
