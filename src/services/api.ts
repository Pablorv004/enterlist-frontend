import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// Create Axios instance
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
  // Cancel any existing request with the same key
  if (activeRequests.has(key)) {
    activeRequests.get(key)?.abort();
  }
  
  // Create new AbortController
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

// Request interceptor to add bearer token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('enterlist_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // If the URL contains 'undefined' as a user ID parameter, cancel the request
      // This prevents requests with invalid IDs that would cause UUID errors
      const url = config.url || '';
      if (url.includes('/undefined') || url.includes('=undefined')) {
        // Create an abort controller and cancel the request
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
  (error) => {
    // Don't handle aborted requests as errors
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      console.warn('Request was cancelled:', error.message);
      return Promise.reject(error);
    }
    
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('enterlist_token');
      localStorage.removeItem('enterlist_user');
      
      // Only redirect if we're not already on the login page
      if (!window.location.href.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
