<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="not-found-container">
                <ion-card>
                    <ion-card-header>
                        <ion-card-title class="ion-text-center">404</ion-card-title>
                        <ion-card-subtitle class="ion-text-center">Page Not Found</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content class="ion-text-center">
                        <ion-icon :icon="alertCircle" size="large" color="danger"></ion-icon>
                        <p>The page you're looking for doesn't exist or has been moved.</p>
                        <ion-button expand="block" router-link="/tabs/dashboard" class="ion-margin-top">
                            <ion-icon :icon="home" slot="start"></ion-icon>
                            Return to Dashboard
                        </ion-button>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon
} from '@ionic/vue';
import { alertCircle, home } from 'ionicons/icons';
</script>

<style scoped>
.not-found-container {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

ion-card {
    width: 100%;
    max-width: 400px;
}

ion-card-title {
    font-size: 4rem;
    font-weight: bold;
    color: var(--ion-color-danger);
}

ion-card-subtitle {
    font-size: 1.5rem;
    margin-bottom: 20px;
}

ion-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

p {
    margin-bottom: 24px;
}
</style>
