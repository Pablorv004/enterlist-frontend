// Admin entity interfaces for TypeScript
export interface AdminUser {
    user_id: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
}

export interface AdminPlaylist {
    playlist_id: string;
    name: string;
    description?: string;
    submission_fee: number;
    url?: string;
    is_visible: boolean;
    platform?: {
        name: string;
    };
    creator?: {
        username: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

export interface AdminSong {
    song_id: string;
    title: string;
    artist_name_on_platform: string;
    artist_name?: string;
    album_name?: string;
    genre?: string;
    duration_ms?: number;
    url?: string;
    is_visible: boolean;
    platform?: {
        name: string;
    };
    artist?: {
        username: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

export interface AdminSubmission {
    submission_id: string;
    status: string;
    submitted_at: string;
    reviewed_at?: string;
    rejection_reason?: string;
    admin_notes?: string;
    artist_id: string;
    artist?: {
        username: string;
        email: string;
    };
    song?: {
        title: string;
        artist_name_on_platform: string;
        album_name?: string;
        duration_ms?: number;
        url?: string;
    };
    playlist?: {
        name: string;
        platform?: {
            name: string;
        };
        submission_fee: number;
    };
}

export interface AdminTransaction {
    transaction_id: string;
    transaction_type: string;
    amount_total: number;
    platform_fee: number;
    creator_payout_amount: number;
    created_at: string;
    notes?: string;
    user?: {
        username: string;
    };
    playlist?: {
        name: string;
    };
}

export interface AdminWithdrawal {
    withdrawal_id: string;
    user_id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    payment_method?: string;
    account_details?: string;
    created_at: string;
    processed_at?: string;
    notes?: string;
    user?: {
        user_id: string;
        username: string;
        email: string;
    };
}
