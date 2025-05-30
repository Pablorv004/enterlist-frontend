// Admin entity interfaces for TypeScript
export interface AdminUser {
    user_id: string;
    username: string;
    email: string;
    role: string;
    oauth_provider?: string;
    oauth_id?: string;
    is_active: boolean;
    email_confirmed?: boolean;
    email_confirmation_token?: string;
    balance: number;
    deleted?: boolean;
    created_at: string;
    updated_at: string;
    last_login?: string;
}

export interface AdminPlaylist {
    playlist_id: string;
    creator_id: string;
    platform_id: number;
    platform_specific_id: string;
    name: string;
    description?: string;
    url?: string;
    cover_image_url?: string;
    is_visible: boolean;
    genre?: string;
    submission_fee: number;
    track_count?: number;
    deleted?: boolean;
    created_at: string;
    updated_at: string;
    platform?: {
        name: string;
    };
    creator?: {
        username: string;
        email: string;
    };
}

export interface AdminSong {
    song_id: string;
    artist_id: string;
    platform_id: number;
    platform_specific_id: string;
    title: string;
    artist_name_on_platform: string;
    album_name?: string;
    url?: string;
    cover_image_url?: string;
    duration_ms?: number;
    is_visible: boolean;
    deleted?: boolean;
    created_at: string;
    updated_at: string;
    platform?: {
        name: string;
    };
    artist?: {
        username: string;
        email: string;
    };
}

export interface AdminSubmission {
    submission_id: string;
    artist_id: string;
    playlist_id: string;
    song_id: string;
    status: string;
    submission_message?: string;
    review_feedback?: string;
    deleted?: boolean;
    submitted_at: string;
    reviewed_at?: string;
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
    submission_id: string;
    payment_method_id: string;
    amount_total: number;
    currency: string;
    platform_fee: number;
    creator_payout_amount: number;
    status: string;
    payment_provider_transaction_id?: string;
    deleted?: boolean;
    created_at: string;
    updated_at: string;
    submission?: {
        artist?: {
            username: string;
        };
        playlist?: {
            name: string;
        };
    };
}

export interface AdminWithdrawal {
    withdrawal_id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    paypal_payout_id?: string;
    paypal_batch_id?: string;
    payout_response?: string;
    error_message?: string;
    deleted?: boolean;
    requested_at: string;
    processed_at?: string;
    created_at: string;
    updated_at: string;
    user?: {
        user_id: string;
        username: string;
        email: string;
    };
}

export interface AdminAction {
    action_id: string;
    admin_user_id: string;
    action_type: string;
    target_user_id?: string;
    target_playlist_id?: string;
    target_song_id?: string;
    reason?: string;
    deleted?: boolean;
    action_timestamp: string;
    admin?: {
        username: string;
        email: string;
    };
    target_user?: {
        username: string;
        email: string;
    };
    target_playlist?: {
        name: string;
    };
    target_song?: {
        title: string;
        artist_name_on_platform: string;
    };
}

export interface AdminLinkedAccount {
    linked_account_id: string;
    user_id: string;
    platform_id: number;
    external_user_id: string;
    token_expires_at?: string;
    deleted?: boolean;
    created_at: string;
    platform?: {
        name: string;
    };
    user?: {
        username: string;
        email: string;
    };
}

export interface AdminPaymentMethod {
    payment_method_id: string;
    user_id: string;
    type: 'paypal';
    details: string;
    is_default?: boolean;
    deleted?: boolean;
    created_at: string;
    updated_at: string;
    users?: {
        username: string;
        email: string;
    };
}

// AdminTable Column interface
export interface Column {
    label: string;
    field: string;
    type?: string;
    sortable?: boolean;
    filterable?: boolean;
    filterOptions?: {
        enabled: boolean;
        placeholder?: string;
    };
    width?: string;
    tdClass?: string;
    thClass?: string;
}
