import apiService from './api.service';
import {
    Platform,
    PaginatedResponse
} from '../types';

class PlatformService {
    /**
     * Get all platforms (paginated)
     */
    async getPlatforms(skip: number = 0, take: number = 10): Promise<PaginatedResponse<Platform>> {
        return await apiService.get<PaginatedResponse<Platform>>(`/platforms?skip=${skip}&take=${take}`);
    }

    /**
     * Get a single platform by ID
     */
    async getPlatformById(platformId: number): Promise<Platform> {
        return await apiService.get<Platform>(`/platforms/${platformId}`);
    }

    /**
     * Create a new platform (admin only)
     */
    async createPlatform(name: string): Promise<Platform> {
        return await apiService.post<Platform>('/platforms', { name });
    }

    /**
     * Update an existing platform (admin only)
     */
    async updatePlatform(platformId: number, name: string): Promise<Platform> {
        return await apiService.put<Platform>(`/platforms/${platformId}`, { name });
    }

    /**
     * Delete a platform (admin only)
     */
    async deletePlatform(platformId: number): Promise<void> {
        return await apiService.delete<void>(`/platforms/${platformId}`);
    }
}

export default new PlatformService();
