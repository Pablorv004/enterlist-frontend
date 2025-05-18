<template>
    <ion-page>
        <ion-content :fullscreen="true" class="not-found-content">
            <div class="not-found-container">
                <div class="not-found-icon">
                    <ion-icon :icon="alertCircleIcon"></ion-icon>
                </div>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for doesn't exist or has been moved.</p>

                <div class="not-found-actions">
                    <ion-button router-link="/" class="home-button">
                        <ion-icon :icon="homeIcon" slot="start"></ion-icon>
                        Go Home
                    </ion-button>

                    <ion-button fill="outline" @click="goBack" class="back-button">
                        <ion-icon :icon="arrowBackIcon" slot="start"></ion-icon>
                        Go Back
                    </ion-button>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { alertCircle, home, arrowBack } from 'ionicons/icons';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'NotFound',
    components: {
        IonPage,
        IonContent,
        IonButton,
        IonIcon
    },
    setup() {
        const router = useRouter();

        const goBack = () => {
            router.go(-1);
        };

        return {
            goBack,
            alertCircleIcon: alertCircle,
            homeIcon: home,
            arrowBackIcon: arrowBack
        };
    }
});
</script>

<style scoped>
.not-found-content {
    --background: #f8f9fa;
}

.not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
}

.not-found-icon {
    font-size: 8rem;
    color: var(--ion-color-primary);
    margin-bottom: 1rem;
    animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

h1 {
    font-size: 5rem;
    font-weight: 700;
    margin: 0;
    line-height: 1;
    color: var(--ion-color-dark);
}

h2 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 0.5rem 0 1rem;
    color: var(--ion-color-dark);
}

p {
    font-size: 1.1rem;
    color: var(--ion-color-medium);
    margin-bottom: 2rem;
    line-height: 1.5;
}

.not-found-actions {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    gap: 1rem;
}

@media (min-width: 576px) {
    .not-found-actions {
        flex-direction: row;
        max-width: 400px;
    }

    .home-button,
    .back-button {
        flex: 1;
    }
}
</style>
