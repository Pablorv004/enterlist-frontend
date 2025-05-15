import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole, LoginRequest, LoginResponse, RegisterRequest } from '../types';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'));
    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const isAuthenticated = computed(() => !!token.value);
    const userRole = computed(() => user.value?.role || null);

    const isAdmin = computed(() => userRole.value === 'admin');
    const isArtist = computed(() => userRole.value === 'artist');
    const isPlaylistMaker = computed(() => userRole.value === 'playlist_maker');

    // Check if JWT token exists and is valid
    async function checkAuth() {
        if (!token.value) return;

        try {
            // Check if token is expired
            const decoded = jwtDecode<JwtPayload>(token.value);
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                // Token expired, log out
                logout();
                return;
            }

            // Try to get user profile
            await fetchUserProfile();
        } catch (err) {
            console.error('Authentication error:', err);
            logout();
        }
    }

    // Login user
    async function login(credentials: LoginRequest) {
        loading.value = true;
        error.value = null;

        try {
            const response = await authService.login(credentials);
            token.value = response.access_token;
            user.value = response.user;

            // Store token in localStorage
            localStorage.setItem('token', response.access_token);

            return response.user;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Login failed';
            throw error.value;
        } finally {
            loading.value = false;
        }
    }

    // Fetch current user profile
    async function fetchUserProfile() {
        loading.value = true;
        error.value = null;

        try {
            const userData = await authService.getProfile();
            user.value = userData;
            return userData;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch user profile';
            throw error.value;
        } finally {
            loading.value = false;
        }
    }
    // Register new user
    async function register(userData: RegisterRequest) {
        loading.value = true;
        error.value = null;

        try {
            const newUser = await authService.register(userData);
            return newUser;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Registration failed';
            throw error.value;
        } finally {
            loading.value = false;
        }
    }

    // Log out user
    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
    }

    return {
        token,
        user,
        loading,
        error,
        isAuthenticated,
        userRole,
        isAdmin,
        isArtist,
        isPlaylistMaker,
        login,
        register,
        logout,
        checkAuth,
        fetchUserProfile
    };
});
