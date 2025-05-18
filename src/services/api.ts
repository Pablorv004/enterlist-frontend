import axios, { AxiosInstance, AxiosError } from 'axios';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://enterlist-api-hydbi.ondigitalocean.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add bearer token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('enterlist_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('enterlist_token');
      localStorage.removeItem('enterlist_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
