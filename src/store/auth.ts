import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, UserRole, AuthResponse } from '@/types';
import { AuthService } from '@/services/AuthService';
import { Capacitor } from '@capacitor/core';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
    // Initialize from storage (mobile-aware)
  const initializeFromStorage = async () => {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Preferences for mobile
      const { Preferences } = await import('@capacitor/preferences');
      
      const { value: tokenValue } = await Preferences.get({ key: 'enterlist_token' });
      const { value: userValue } = await Preferences.get({ key: 'enterlist_user' });
      
      if (tokenValue) {
        token.value = tokenValue;
      }
      if (userValue) {
        user.value = JSON.parse(userValue);
      }
    } else {
      // Web platform - use localStorage only
      const storedUser = localStorage.getItem('enterlist_user');
      const storedToken = localStorage.getItem('enterlist_token');

      if (storedUser) {
        user.value = JSON.parse(storedUser);
      }

      if (storedToken) {
        token.value = storedToken;
      }
    }
  };
  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const isArtist = computed(() => user.value?.role === UserRole.ARTIST);
  const isPlaylistMaker = computed(() => user.value?.role === UserRole.PLAYLIST_MAKER);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);
  const hasRole = computed(() => !!user.value?.role);
  // Actions
  const login = async (email: string, password: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response: AuthResponse = await AuthService.login(email, password);
      user.value = response.user;
      token.value = response.access_token;

      // Store in appropriate storage
      await storeAuthData(response.user, response.access_token);
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

  const logout = async (): Promise<void> => {
    user.value = null;
    token.value = null;
    
    if (Capacitor.isNativePlatform()) {
      // Clear mobile storage
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: 'enterlist_user' });
      await Preferences.remove({ key: 'enterlist_token' });
    } else {
      // Clear web storage
      localStorage.removeItem('enterlist_user');
      localStorage.removeItem('enterlist_token');
    }
  };

  const updateProfile = async (updatedUser: User): Promise<void> => {
    user.value = updatedUser;
    await storeUserData(updatedUser);
  };

  // Helper function to store auth data
  const storeAuthData = async (userData: User, authToken: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: 'enterlist_user',
        value: JSON.stringify(userData)
      });
      await Preferences.set({
        key: 'enterlist_token',
        value: authToken
      });
    } else {
      localStorage.setItem('enterlist_user', JSON.stringify(userData));
      localStorage.setItem('enterlist_token', authToken);
    }
  };

  // Helper function to store user data only
  const storeUserData = async (userData: User): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: 'enterlist_user',
        value: JSON.stringify(userData)
      });
    } else {
      localStorage.setItem('enterlist_user', JSON.stringify(userData));
    }
  };
  const checkAuth = async (): Promise<void> => {
    if (!token.value) return;

    loading.value = true;
    
    try {
      const userData = await AuthService.getProfile();
      user.value = userData;
      await storeUserData(userData);
    } catch (err) {
      // If token is invalid, logout
      await logout();
    } finally {
      loading.value = false;
    }
  };

  // Helper method to set auth data (for OAuth flow)
  const setAuthData = async (authToken: string, userData: User): Promise<void> => {
    user.value = userData;
    token.value = authToken;
    await storeAuthData(userData, authToken);
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
    hasRole,
    initializeFromStorage,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    setAuthData
  };
});
