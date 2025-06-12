import axios, { AxiosInstance } from 'axios';
import { Capacitor } from '@capacitor/core';

const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://enterlist-api-hydbi.ondigitalocean.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Map to track active requests by component/route
const activeRequests = new Map<string, AbortController>();

// Helper to create cancelable request
export const createCancelableRequest = (key: string) => {
  if (activeRequests.has(key)) {
    activeRequests.get(key)?.abort();
  }
  
  const controller = new AbortController();
  activeRequests.set(key, controller);
  
  return controller;
};

// Helper to cleanup request
export const cleanupRequest = (key: string) => {
  activeRequests.delete(key);
};

// Helper to cancel all requests for a key
export const cancelRequests = (key: string) => {
  if (activeRequests.has(key)) {
    activeRequests.get(key)?.abort();
    activeRequests.delete(key);
  }
};

// Helper function to get token from appropriate storage
const getStoredToken = async (): Promise<string | null> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: 'enterlist_token' });
      return value;
    } catch (error) {
      console.error('Failed to get token from Capacitor Preferences:', error);
      return null;
    }
  } else {
    return localStorage.getItem('enterlist_token');
  }
};

// Helper function to remove token from appropriate storage
const removeStoredToken = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: 'enterlist_token' });
      await Preferences.remove({ key: 'enterlist_user' });
    } catch (error) {
      console.error('Failed to remove token from Capacitor Preferences:', error);
    }
  } else {
    localStorage.removeItem('enterlist_token');
    localStorage.removeItem('enterlist_user');
  }
};

// Request interceptor to add bearer token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getStoredToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // If the URL contains 'undefined' as a user ID parameter, cancel the request
      // This prevents requests with invalid IDs that would cause UUID errors
      const url = config.url || '';
      if (url.includes('/undefined') || url.includes('=undefined')) {
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort('Prevented request with undefined ID');
        console.warn('Prevented API request with undefined ID:', url);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      console.warn('Request was cancelled:', error.message);
      return Promise.reject(error);
    }
    
    if (error.response && error.response.status === 401) {
      await removeStoredToken();
      
      if (!window.location.href.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
