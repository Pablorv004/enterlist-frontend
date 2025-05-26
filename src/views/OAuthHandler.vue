<template>
    <ion-page>
        <ion-content>
            <div class="oauth-handler">
                <div class="loading-container">
                    <ion-spinner color="primary"></ion-spinner>
                    <p>{{ loadingMessage }}</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonSpinner } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { OAuthService } from '@/services/OAuthService';

const route = useRoute();
const router = useRouter();
const loadingMessage = ref('Processing authentication...');

onMounted(async () => {
    try {
        const oauthService = new OAuthService(router);

        // Check for error in query params
        if (route.query.error) {
            loadingMessage.value = 'Authentication failed...';
            await oauthService.handleOAuthError(route.query.error as string);
            return;
        }

        // Handle OAuth callback
        await oauthService.handleOAuthCallback(new URLSearchParams(window.location.search));
    } catch (error) {
        console.error('OAuth Handler Error:', error);
        loadingMessage.value = 'Authentication failed...';
        const oauthService = new OAuthService(router);
        await oauthService.handleOAuthError('Authentication process failed');
    }
});
</script>

<style scoped>
.oauth-handler {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.loading-container {
    text-align: center;
}

.loading-container p {
    margin-top: 16px;
    color: var(--ion-color-medium);
}
</style>
