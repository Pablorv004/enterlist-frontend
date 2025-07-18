// User role enum
export enum UserRole {
  PLAYLIST_MAKER = 'playlist_maker',
  ARTIST = 'artist',
  ADMIN = 'admin'
}

// Submission status enum
export enum SubmissionStatus {
  PROCESSING = 'processing',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

// Payment method type enum
export enum PaymentMethodType {
  PAYPAL = 'paypal'
}

// User interface
export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash?: string;
  oauth_provider?: string;
  oauth_id?: string;
  role: UserRole;
  is_active: boolean;
  email_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

// Platform interface
export interface Platform {
  platform_id: number;
  name: string;
}

// Linked Account interface
export interface LinkedAccount {
  linked_account_id: string;
  user_id: string;
  platform_id: number;
  external_user_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  created_at: string;
  platform?: Platform;
  user?: User;
}

// Playlist interface
export interface Playlist {
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
  submission_fee?: number;
  track_count?: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  platform?: Platform;
}

// Song interface
export interface Song {
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
  created_at: string;
  updated_at: string;
  artist?: User;
  platform?: Platform;
}

// Track interface for playlist tracks from external APIs
export interface Track {
  track_id: string;
  title: string;
  artist: string;
  album?: string;
  duration_ms?: number;
  thumbnail_url?: string;
  url?: string;
  platform_specific_id: string;
  added_at?: string;
  preview_url?: string;
  popularity?: number;
  explicit?: boolean;
  description?: string;
  position?: number;
  type: 'spotify' | 'youtube';
}

// Track response interface for paginated track results
export interface TrackResponse {
  tracks: Track[];
  total: number;
  limit?: number;
  offset?: number;
  next?: string;
  previous?: string;
  nextPageToken?: string;
  prevPageToken?: string;
}

// Submission interface
export interface Submission {
  submission_id: string;
  artist_id: string;
  playlist_id: string;
  song_id: string;
  status: SubmissionStatus;
  submission_message?: string;
  review_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
  artist?: User;
  playlist?: Playlist;
  song?: Song;
  transaction?: Transaction;
}

// Payment Method interface
export interface PaymentMethod {
  payment_method_id: string;
  artist_id: string;
  type: PaymentMethodType;
  provider_token: string;
  details: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  artist?: User;
}

// Transaction interface
export interface Transaction {
  transaction_id: string;
  submission_id: string;
  payment_method_id: string;
  amount_total: number;
  currency: string;
  platform_fee: number;
  creator_payout_amount: number;
  status: TransactionStatus;
  payment_provider_transaction_id?: string;
  created_at: string;
  updated_at: string;
  payment_method?: PaymentMethod;
  submission?: Submission;
}

// Admin Action interface
export interface AdminAction {
  action_id: string;
  admin_user_id: string;
  action_type: string;
  target_user_id?: string;
  target_playlist_id?: string;
  target_song_id?: string;
  reason?: string;
  action_timestamp: string;
  admin?: User;
  target_user?: User;
  target_playlist?: Playlist;
  target_song?: Song;
}

// Authentication response interface
export interface AuthResponse {
  access_token: string;
  user: User;
}

// Pagination response interface
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
}

// Balance response interface
export interface BalanceResponse {
  total: number;
  available: number;
  pending: number;
  currency?: string;
}

// Earnings stats interface
export interface EarningsStats {
  period: string;
  earnings: number;
  transactionCount: number;
  currency: string;
}
