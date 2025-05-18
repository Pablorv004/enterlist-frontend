import { AxiosError } from 'axios';
import { PaginatedResponse } from '@/types';

/**
 * Utility to handle API responses with empty data (404 errors)
 * @param error The error object from a catch block
 * @param defaultValue The default value to return if the error is a 404 (empty array, empty object, etc.)
 * @returns The default value if it's a 404 error, otherwise rethrows the error
 */
export const handleEmptyResponse = (error: any, defaultValue: any): any => {
  // If it's a 404 error, return the default value (empty array, object, etc.)
  if (error.response && error.response.status === 404) {
    return defaultValue;
  }
  
  // For other errors, rethrow them to be handled by the caller
  throw error;
};

/**
 * Handle 404 responses for paginated resources by returning an empty result set
 * instead of an error, since a 404 just means there's no data matching the criteria
 */
export function handleNotFoundPaginated<T>(error: unknown): PaginatedResponse<T> {
  const axiosError = error as AxiosError;
  if (axiosError.response && axiosError.response.status === 404) {
    // Return empty pagination data instead of an error
    return {
      data: [],
      total: 0,
      count: 0
    };
  }
  // Re-throw other errors
  throw error;
}

/**
 * Check if an error is a 404 (not found) error, indicating empty data
 * @param error The error to check
 * @returns boolean indicating if this is a 404 error
 */
export const isEmptyDataError = (error: any): boolean => {
  return error.response && error.response.status === 404;
};

/**
 * Get a user-friendly message for empty data errors based on the resource type
 * @param resourceType The type of resource being queried (songs, playlists, etc.)
 * @returns A user-friendly message explaining the empty state
 */
export const getEmptyDataMessage = (resourceType: string): string => {
  const messages: Record<string, string> = {
    songs: "No songs found. Try importing songs from your linked accounts.",
    playlists: "No playlists found. Try importing playlists from your linked accounts.",
    submissions: "No submissions found. You haven't submitted any songs yet.",
    "playlist-submissions": "No submissions found for your playlists.",
    "payment-methods": "No payment methods found. Add a payment method to start submitting songs.",
    "linked-accounts": "No linked accounts found. Connect your music platform accounts to import your content.",
    transactions: "No transactions found.",
    default: "No data found."
  };

  return messages[resourceType] || messages.default;
};
