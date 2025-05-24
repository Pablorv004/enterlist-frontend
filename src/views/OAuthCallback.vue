<template>
    <ion-page>
        <ion-content :fullscreen="true" class="oauth-callback-content">
            <div class="callback-container">
                <div v-if="loading" class="loading-state">
                    <ion-spinner name="crescent" class="spinner"></ion-spinner>
                    <h2>Connecting Account</h2>
                    <p>Please wait while we securely connect your account...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <ion-icon :icon="alertCircleIcon" class="error-icon"></ion-icon>
                    <h2>Connection Failed</h2>
                    <p>{{ errorMessage }}</p>
                    <ion-button router-link="/artist/linked-accounts">
                        Try Again
                    </ion-button>
                </div>

                <div v-else class="success-state">
                    <ion-icon :icon="checkmarkCircleIcon" class="success-icon"></ion-icon>
                    <h2>Successfully Connected!</h2>
                    <p>Your account has been successfully connected.</p>
                    <ion-button router-link="/artist/linked-accounts" class="continue-btn">
                        Continue
                    </ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { alertCircle, checkmarkCircle } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import { PlatformService } from '@/services/PlatformService';
import { useAuthStore } from '@/store';

export default defineComponent({
    name: 'OAuthCallback',
    components: {
        IonPage,
        IonContent,
        IonButton,
        IonIcon,
        IonSpinner
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const authStore = useAuthStore();

        const loading = ref(true);
        const error = ref(false);
        const errorMessage = ref('');        onMounted(async () => {
            // Get parameters from URL
            const code = route.query.code as string;
            const state = route.query.state as string;
            const platform = route.params.platform as string || route.query.platform as string;
            
            console.log('OAuth callback parameters:', { code, state, platform });

            // Error handling
            const errorParam = route.query.error as string;

            if (errorParam) {
                loading.value = false;
                error.value = true;
                errorMessage.value = route.query.error_description as string || 'Authentication failed';
                return;
            }

            if (!code) {
                loading.value = false;
                error.value = true;
                errorMessage.value = 'Missing authorization code';
                return;
            }
            
            try {
                // The backend has already processed the OAuth callback and created/updated the user
                // We just need to fetch the updated user info
                await authStore.checkAuth();
                console.log('Auth check completed successfully');

                // Success - wait a bit to show success message
                setTimeout(() => {
                    loading.value = false;
                }, 1000);

                // Redirect after a delay
                setTimeout(() => {
                    // Check if we have a stored path from before auth
                    const preAuthPath = localStorage.getItem('preAuthPath');
                    
                    if (preAuthPath) {
                        localStorage.removeItem('preAuthPath');
                        router.push(preAuthPath);
                    } else {
                        // Default redirect based on user role
                        if (authStore.user?.role === 'artist') {
                            router.push('/artist/linked-accounts');
                        } else if (authStore.user?.role === 'playlist_maker') {
                            router.push('/playlist-maker/linked-accounts');
                        } else {
                            router.push('/dashboard');
                        }
                    }
                }, 2000);
            } catch (err) {
                loading.value = false;
                error.value = true;
                errorMessage.value = 'Failed to connect your account. Please try again.';
                console.error('OAuth error:', err);
            }
        });

        return {
            loading,
            error,
            errorMessage,
            alertCircleIcon: alertCircle,
            checkmarkCircleIcon: checkmarkCircle
        };
    }
});
</script>

<style scoped>
.oauth-callback-content {
    --background: #f8f9fa;
}

.callback-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    padding: 2rem;
}

.loading-state,
.error-state,
.success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 400px;
}

.spinner {
    width: 60px;
    height: 60px;
    margin-bottom: 2rem;
}

.error-icon,
.success-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
}

.error-icon {
    color: var(--ion-color-danger);
}

.success-icon {
    color: var(--ion-color-success);
    animation: pulse 2s 1 ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    25% {
        transform: scale(1.1);
        opacity: 1;
    }

    50% {
        transform: scale(0.95);
    }

    75% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

h2 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0 0 1rem;
}

p {
    font-size: 1.1rem;
    color: var(--ion-color-medium);
    margin-bottom: 2rem;
    line-height: 1.5;
}

.continue-btn {
    margin-top: 1rem;
}
</style>
