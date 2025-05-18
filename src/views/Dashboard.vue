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
import { defineComponent, onMounted } from 'vue';
import { IonPage, IonContent, IonSpinner } from '@ionic/vue';
import { useRouter } from 'vue-router';
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
        const authStore = useAuthStore();

        onMounted(async () => {
            // Check user role and redirect accordingly
            if (authStore.isArtist) {
                router.replace('/artist/dashboard');
            } else if (authStore.isPlaylistMaker) {
                router.replace('/playlist-maker/dashboard');
            } else if (authStore.isAdmin) {
                router.replace('/admin/dashboard');
            } else {
                // If no valid role, logout and redirect to login
                authStore.logout();
                router.replace('/login');
            }
        });
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
