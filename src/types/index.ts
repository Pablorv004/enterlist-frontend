// src/types/index.ts
export interface User {
    user_id: string;
    username: string;
    role: UserRole;
    oauth_id?: string;
    created_at: Date;
    updated_at: Date;
    is_active: boolean;
}

export enum UserRole {
    ARTIST = 'artist',
    PLAYLIST_MAKER = 'playlist_maker',
    ADMIN = 'admin',
}

export interface Playlist {
    playlist_id: string;
    name: string;
    description?: string;
    creator_id: string;
    platform_id?: number;
    external_url?: string;
    follower_count?: number;
    image_url?: string;
    genres?: string[];
    created_at: Date;
    updated_at: Date;
}

export interface Song {
    song_id: string;
    title: string;
    artist_id: string;
    platform_id: number;
    platform_specific_id: string;
    artist_name_on_platform: string;
    album_name: string;
    url: string;
    cover_image_url: string;
    genre?: string;
    preview_url?: string;
    duration_ms?: number;
    is_visible: boolean;
    created_at: Date;
    updated_at: Date;
}

export enum SubmissionStatus {
    PENDING = 'pending',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface Submission {
    submission_id: string;
    song_id: string;
    playlist_id: string;
    artist_id: string;
    status: SubmissionStatus;
    submission_message?: string;
    reviewer_notes?: string;
    submitted_at: Date;
    reviewed_at?: Date;
}

export interface Platform {
    platform_id: number;
    name: string;
    logo_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface LinkedAccount {
    linked_account_id: string;
    user_id: string;
    platform_id: number;
    external_user_id: string;
    auth_token?: string;
    token_expires_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface PaymentMethod {
    payment_method_id: string;
    artist_id: string;
    type: string;
    display_name: string;
    is_default: boolean;
    last_four?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Transaction {
    transaction_id: string;
    artist_id: string;
    amount: number;
    currency: string;
    status: string;
    external_transaction_id?: string;
    created_at: Date;
    updated_at: Date;
}

export interface AuthResponse {
    access_token: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

// Export types from other type files
export * from './song.types';
export * from './auth.types';
export * from './user.types';
export * from './submission.types';
export * from './playlist.types';
