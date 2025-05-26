<template>
    <ion-page>
        <app-header title="Dashboard"></app-header>
        <ion-content :fullscreen="true">
            <div class="redirect-container">
                <ion-spinner name="crescent" color="primary"></ion-spinner>
                <p>Redirecting to your dashboard...</p>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { IonPage, IonContent, IonSpinner } from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store';
import AppHeader from '@/components/AppHeader.vue';

export default defineComponent({
    name: 'DashboardPage',
    components: {
        IonPage,
        IonContent,
        IonSpinner,
        AppHeader
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        const authStore = useAuthStore();
        const loading = ref(true);
        const error = ref('');

        onMounted(async () => {
            let shouldProceedWithRedirect = true;
            
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
                        name: 'Dashboard',
                        query: {} 
                    });
                    
                } catch (err) {
                    console.error('OAuth authentication failed:', err);
                    error.value = 'Authentication failed. Please try again.';
                    // Redirect to login on error
                    await router.push({ name: 'Login', query: { error: 'Authentication failed' } });
                    shouldProceedWithRedirect = false;
                }
                finally {
                    loading.value = false;
                }
            }
            
            // Only proceed with role-based redirection if OAuth handling was successful or not needed
            if (shouldProceedWithRedirect) {
                // Check user role and redirect accordingly
                if (authStore.isArtist) {
                    await router.replace('/artist/dashboard');
                } else if (authStore.isPlaylistMaker) {
                    await router.replace('/playlist-maker/dashboard');
                } else if (authStore.isAdmin) {
                    await router.replace('/admin/dashboard');
                } else if (!authStore.hasRole) {
                    // If user has no role, redirect to role selection
                    await router.replace('/role-selection');
                } else {
                    // If no valid role, logout and redirect to login
                    await authStore.logout();
                    await router.replace('/login');
                }
            }
        });

        return {
            loading,
            error
        };
    }
});
</script>

<style scoped>
.redirect-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 20px;
}

ion-spinner {
    width: 48px;
    height: 48px;
}

p {
    font-size: 18px;
    color: var(--ion-color-medium);
    text-align: center;
}
</style>
