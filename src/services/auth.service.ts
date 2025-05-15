import apiService from './api.service';
import { User } from '../types';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest
} from '../types/auth.types';

class AuthService {
    /**
     * Login with email and password
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        return await apiService.post<LoginResponse>('/auth/login', credentials);
    }

    /**
     * Register a new user
     */
    async register(userData: RegisterRequest): Promise<User> {
        return await apiService.post<User>('/auth/register', userData);
    }

    /**
     * Get the current user's profile
     */
    async getProfile(): Promise<User> {
        return await apiService.get<User>('/auth/profile');
    }
}

export default new AuthService();
