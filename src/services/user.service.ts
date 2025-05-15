import apiService from './api.service';
import {
    User,
    PaginatedResponse
} from '../types';
import {
    UserCreate,
    UserUpdate
} from '../types/user.types';

class UserService {
    /**
     * Get all users (paginated)
     */
    async getUsers(skip: number = 0, take: number = 10): Promise<PaginatedResponse<User>> {
        return await apiService.get<PaginatedResponse<User>>(`/users?skip=${skip}&take=${take}`);
    }

    /**
     * Get a single user by ID
     */
    async getUserById(userId: string): Promise<User> {
        return await apiService.get<User>(`/users/${userId}`);
    }

    /**
     * Create a new user
     */
    async createUser(userData: UserCreate): Promise<User> {
        return await apiService.post<User>('/users', userData);
    }

    /**
     * Update an existing user
     */
    async updateUser(userId: string, userData: UserUpdate): Promise<User> {
        return await apiService.put<User>(`/users/${userId}`, userData);
    }

    /**
     * Delete a user
     */
    async deleteUser(userId: string): Promise<void> {
        return await apiService.delete<void>(`/users/${userId}`);
    }
}

export default new UserService();
