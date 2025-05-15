// src/types/playlist.types.ts
import { Playlist } from './index';

// Type for creating a new playlist
export interface PlaylistCreate {
    name: string;
    description?: string;
    creator_id: string;
    platform_id?: number;
    external_url?: string;
    follower_count?: number;
    image_url?: string;
    genres?: string[];
}

// Type for updating an existing playlist
export interface PlaylistUpdate {
    name?: string;
    description?: string;
    platform_id?: number;
    external_url?: string;
    follower_count?: number;
    image_url?: string;
    genres?: string[];
}
