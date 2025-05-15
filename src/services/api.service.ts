import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/auth';

const API_URL = 'https://enterlist-api-hydbi.ondigitalocean.app/api';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.api.interceptors.request.use(
            (config) => {
                const authStore = useAuthStore();
                if (authStore.token) {
                    config.headers['Authorization'] = `Bearer ${authStore.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.api.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                const authStore = useAuthStore();

                // If 401 Unauthorized, log the user out
                if (error.response?.status === 401) {
                    authStore.logout();
                    window.location.href = '/login';
                }

                return Promise.reject(error);
            }
        );
    }

    // Generic GET method
    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.get(url, config);
        return response.data;
    }

    // Generic POST method
    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.post(url, data, config);
        return response.data;
    }

    // Generic PUT method
    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.put(url, data, config);
        return response.data;
    }

    // Generic DELETE method
    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.delete(url, config);
        return response.data;
    }
}

export default new ApiService();
