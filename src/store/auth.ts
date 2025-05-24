import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, UserRole, AuthResponse } from '@/types';
import { AuthService } from '@/services/AuthService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Initialize from local storage
  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('enterlist_user');
    const storedToken = localStorage.getItem('enterlist_token');

    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }

    if (storedToken) {
      token.value = storedToken;
    }
  };

  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const isArtist = computed(() => user.value?.role === UserRole.ARTIST);
  const isPlaylistMaker = computed(() => user.value?.role === UserRole.PLAYLIST_MAKER);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);

  // Actions
  const login = async (email: string, password: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response: AuthResponse = await AuthService.login(email, password);
      user.value = response.user;
      token.value = response.access_token;

      // Store in localStorage
      localStorage.setItem('enterlist_user', JSON.stringify(response.user));
      localStorage.setItem('enterlist_token', response.access_token);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to login';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await AuthService.register(userData);
      // After registration, login the user
      await login(userData.email, userData.password);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to register';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = (): void => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('enterlist_user');
    localStorage.removeItem('enterlist_token');
  };

  const updateProfile = (updatedUser: User): void => {
    user.value = updatedUser;
    localStorage.setItem('enterlist_user', JSON.stringify(updatedUser));
  };

  const checkAuth = async (): Promise<void> => {
    if (!token.value) return;

    loading.value = true;
    
    try {
      const userData = await AuthService.getProfile();
      user.value = userData;
      localStorage.setItem('enterlist_user', JSON.stringify(userData));
    } catch (err) {
      // If token is invalid, logout
      logout();
    } finally {
      loading.value = false;
    }  };

  // OAuth login methods
  const spotifyAuth = async (code: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await AuthService.spotifyAuth(code);
      user.value = response.user;
      token.value = response.access_token;

      localStorage.setItem('enterlist_user', JSON.stringify(response.user));
      localStorage.setItem('enterlist_token', response.access_token);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to authenticate with Spotify';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const youtubeAuth = async (code: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await AuthService.youtubeAuth(code);
      user.value = response.user;
      token.value = response.access_token;

      localStorage.setItem('enterlist_user', JSON.stringify(response.user));
      localStorage.setItem('enterlist_token', response.access_token);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to authenticate with YouTube';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isArtist,
    isPlaylistMaker,
    isAdmin,
    initializeFromStorage,
    login,
    register,    logout,
    updateProfile,
    checkAuth,
    spotifyAuth,
    youtubeAuth
  };
});
