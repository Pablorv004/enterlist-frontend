<template>
    <ion-page>
        <ion-content :fullscreen="true" class="role-selection-page">
            <div class="role-selection-container">
                <div class="logo-container">
                    <img src="@/assets/logo.png" alt="Enterlist Logo" class="logo" />
                    <h1 class="title gradient-text">ENTERLIST</h1>
                </div>

                <ion-card class="role-card">
                    <ion-card-header>
                        <ion-card-title class="card-title">Choose Your Role</ion-card-title>
                        <ion-card-subtitle>
                            Welcome to Enterlist! Select your primary role to continue.
                        </ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                        <div class="roles-container">
                            <ion-card button class="role-option" :class="{ 'selected': selectedRole === 'artist' }"
                                @click="selectRole('artist')">
                                <ion-card-content>
                                    <div class="role-icon">
                                        <ion-icon :icon="musicalNotesIcon" size="large"></ion-icon>
                                    </div>
                                    <h2>Artist</h2>
                                    <p>Submit your music to playlist creators and grow your audience</p>
                                </ion-card-content>
                            </ion-card>

                            <ion-card button class="role-option"
                                :class="{ 'selected': selectedRole === 'playlist_maker' }"
                                @click="selectRole('playlist_maker')">
                                <ion-card-content>
                                    <div class="role-icon">
                                        <ion-icon :icon="listIcon" size="large"></ion-icon>
                                    </div>
                                    <h2>Playlist Creator</h2>
                                    <p>Discover new music and manage submissions to your playlists</p>
                                </ion-card-content>
                            </ion-card>
                        </div>

                        <ion-button expand="block" class="continue-button" :disabled="!selectedRole || loading"
                            @click="confirmRole">
                            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                            <span v-else>Continue to Dashboard</span>
                        </ion-button>

                        <div v-if="error" class="error-message">
                            <ion-text color="danger">{{ error }}</ion-text>
                        </div>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    toastController
} from '@ionic/vue';
import { musicalNotes, list } from 'ionicons/icons';
import { useAuthStore } from '@/store';
import { AuthService } from '@/services/AuthService';

export default defineComponent({
    name: 'RoleSelection',
    components: {
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonButton,
        IonIcon,
        IonText,
        IonSpinner
    },    setup() {
        const router = useRouter();
        const route = useRoute();
        const authStore = useAuthStore();        const selectedRole = ref('');
        const loading = ref(false);
        const error = ref('');
        const provider = ref(route.query.provider as string || '');onMounted(async () => {
            let shouldProceedWithRoleCheck = true;
            
            // Handle OAuth authentication if we have OAuth parameters
            if (route.query.access_token && route.query.user && route.query.status === 'success') {
                try {
                    loading.value = true;
                    
                    // Parse user data from query parameters
                    const accessToken = route.query.access_token as string;
                    const userDataStr = route.query.user as string;
                    const userData = JSON.parse(decodeURIComponent(userDataStr));
                    
                    // Set authentication data in the store
                    await authStore.setAuthData(accessToken, userData);
                    
                    // Clear the URL parameters
                    await router.replace({ 
                        name: 'RoleSelection',
                        query: {} 
                    });
                    
                } catch (err) {
                    console.error('OAuth authentication failed:', err);
                    error.value = 'Authentication failed. Please try again.';
                    // Redirect to login on error
                    await router.push({ name: 'Login', query: { error: 'Authentication failed' } });
                    shouldProceedWithRoleCheck = false;
                }
                finally {
                    loading.value = false;
                }
            }
            
            // Only proceed with role checking if OAuth handling was successful or not needed
            if (shouldProceedWithRoleCheck) {
                // Check if user is already authenticated and has a role
                if (authStore.isAuthenticated && authStore.user?.role && 
                    (authStore.isArtist || authStore.isPlaylistMaker)) {
                    await router.push('/dashboard');
                }
            }
        });

        const selectRole = (role: string) => {
            selectedRole.value = role;
        };

        const confirmRole = async () => {
            if (!selectedRole.value) {
                error.value = 'Please select a role to continue';
                return;
            }

            loading.value = true;
            error.value = '';

            try {
                // Update the user's role
                await AuthService.updateUserRole({
                    role: selectedRole.value
                });

                // Refresh user data in store
                await authStore.checkAuth();

                // Show success message
                const toast = await toastController.create({
                    message: `You're now registered as a ${selectedRole.value === 'artist' ? 'Artist' : 'Playlist Creator'}!`,
                    duration: 3000,
                    position: 'top',
                    color: 'success'
                });
                await toast.present();

                // Redirect to appropriate dashboard
                if (selectedRole.value === 'artist') {
                    router.push('/artist/dashboard');
                } else {
                    router.push('/playlist-maker/dashboard');
                }
            } catch (err: any) {
                error.value = err.response?.data?.message || 'Failed to set role';
            } finally {
                loading.value = false;
            }
        };

        return {
            selectedRole,
            loading,
            error,
            provider,
            selectRole,
            confirmRole,
            musicalNotesIcon: musicalNotes,
            listIcon: list
        };
    }
});
</script>

<style scoped>
.role-selection-page {
    --background: url('@/assets/blurred-blue-purple-bg.jpg') no-repeat center center / cover;
}

.role-selection-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 16px;
    text-align: center;
}

.logo-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
}

.logo {
    width: 80px;
    height: 80px;
}

.title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 2px;
    margin: 0;
}

.role-card {
    width: 100%;
    max-width: 600px;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.95);
}

.card-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--ion-color-primary);
    text-align: center;
}

.roles-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 16px 0 24px;
}

@media (min-width: 576px) {
    .roles-container {
        flex-direction: row;
    }
}

.role-option {
    flex: 1;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.role-option.selected {
    border-color: var(--ion-color-primary);
    background-color: rgba(var(--ion-color-primary-rgb), 0.05);
    transform: translateY(-4px);
}

.role-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    color: var(--ion-color-primary);
}

.role-option h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
}

.role-option p {
    color: var(--ion-color-medium);
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
}

.continue-button {
    margin-top: 16px;
    height: 48px;
    font-size: 16px;
    --background: var(--ion-color-primary);
}

.error-message {
    margin-top: 16px;
    background: rgba(var(--ion-color-danger-rgb), 0.1);
    border-radius: 8px;
    padding: 12px;
}
</style>
