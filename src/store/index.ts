// Re-export all store modules
export { useAuthStore } from './auth';
export { usePlaylistStore } from './playlist';
export { useSongStore } from './song';
export { useSubmissionStore } from './submission';

// Import and create Pinia store
import { createPinia } from 'pinia';
export const pinia = createPinia();
