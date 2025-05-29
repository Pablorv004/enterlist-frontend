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
  external_url?: string;
  is_active: boolean;
  platform?: string;
}

export interface AdminSong {
  song_id: string;
  title: string;
  artist_name: string;
  genre?: string;
  duration: number;
  external_url?: string;
  is_visible: boolean;
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
    artist_name: string;
    genre?: string;
    duration_seconds?: number;
    file_url?: string;
  };
  playlist?: {
    name: string;
    platform: string;
    fee: number;
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

export interface AdminPlatform {
  platform_id: number;
  name: string;
  description?: string;
  base_fee: number;
  commission_rate: number;
  website_url?: string;
  logo_url?: string;
  contact_email?: string;
  is_active: boolean;
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
