<template>
    <ion-page>
        <ion-content :fullscreen="true" class="bg-login">
            <div class="login-container">
                <div class="logo-container">
                    <div class="logo-wrapper">
                        <img src="@/assets/logo.png" alt="Enterlist Logo" class="logo pulse-animation" />
                    </div>
                    <h1 class="fade-in-animation">Enterlist</h1>
                </div>

                <ion-card class="glass-effect">
                    <ion-card-header>
                        <ion-card-title>
                            <font-awesome-icon icon="user" /> Login
                        </ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <form @submit.prevent="handleLogin">
                            <ion-list lines="full">
                                <ion-item>
                                    <ion-label position="floating">Email</ion-label>
                                    <ion-input v-model="email" type="email" required autocomplete="email"
                                        :readonly="loading"></ion-input>
                                </ion-item>
                                <div v-if="errors.email" class="error-message">{{ errors.email }}</div>

                                <ion-item>
                                    <ion-label position="floating">Password</ion-label>
                                    <ion-input v-model="password" type="password" required
                                        autocomplete="current-password" :readonly="loading"></ion-input>
                                </ion-item>
                                <div v-if="errors.password" class="error-message">{{ errors.password }}</div>

                                <div v-if="errorMessage" class="ion-padding error-message">
                                    {{ errorMessage }}
                                </div>

                                <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="loading">
                                    <ion-spinner v-if="loading" name="dots"></ion-spinner>
                                    <span v-else>Login</span>
                                </ion-button>

                                <div class="ion-text-center ion-padding-top">
                                    <ion-text color="medium">Or login with</ion-text>
                                </div>

                                <div class="social-buttons">
                                    <ion-button fill="outline" color="dark" @click="loginWithGoogle">
                                        <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
                                        Google
                                    </ion-button>
                                    <ion-button fill="outline" color="dark" @click="loginWithSpotify">
                                        <ion-icon :icon="musicalNotes" slot="start"></ion-icon>
                                        Spotify
                                    </ion-button>
                                </div>

                                <div class="ion-text-center ion-padding-top">
                                    <ion-text>Don't have an account? </ion-text>
                                    <ion-router-link href="/register">Register</ion-router-link>
                                </div>
                            </ion-list>
                        </form>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonSpinner,
    IonText,
    IonIcon,
    IonRouterLink,
    toastController
} from '@ionic/vue';
import { logoGoogle, musicalNotes } from 'ionicons/icons';
import { useAuthStore } from '@/store/auth';
import { useFormValidation } from '@/composables/useUtils';

const router = useRouter();
const authStore = useAuthStore();
const { errors, validateEmail, validateRequired, clearErrors } = useFormValidation();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
    clearErrors();
    errorMessage.value = '';

    // Validate form
    let isValid = true;

    if (!validateRequired(email.value, 'email')) {
        isValid = false;
    } else if (!validateEmail(email.value)) {
        errors.value.email = 'Please enter a valid email address';
        isValid = false;
    }

    if (!validateRequired(password.value, 'password')) {
        isValid = false;
    }

    if (!isValid) return;

    // Perform login
    loading.value = true;

    try {
        await authStore.login({
            email: email.value,
            password: password.value
        });

        const toast = await toastController.create({
            message: 'Login successful!',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

        router.push('/tabs/dashboard');
    } catch (err: any) {
        errorMessage.value = err.toString();

        const toast = await toastController.create({
            message: 'Login failed. Please check your credentials.',
            duration: 3000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        loading.value = false;
    }
}

function loginWithGoogle() {
    // Implement OAuth login with Google
    alert('Google OAuth login not implemented yet');
}

function loginWithSpotify() {
    // Implement OAuth login with Spotify
    alert('Spotify OAuth login not implemented yet');
}
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables';
@import '../assets/styles/mixins';

.bg-login {
    --ion-background-color: transparent;
    position: relative;
    
    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5) url('@/assets/bg-login.jpg') no-repeat center center / cover;
        background-blend-mode: darken;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: -1;
    }
}

.login-container {
    max-width: 450px;
    margin: 2rem auto;
    padding: 20px;
    @include flex-column;
    align-items: center;
    height: 100%;
    justify-content: center;
}

.logo-container {
    @include flex-column;
    align-items: center;
    margin-bottom: 40px;
    
    h1 {
        color: white;
        font-size: 2.5rem;
        font-weight: $font-weight-bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
        margin-top: 15px;
    }
}

.logo-wrapper {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    padding: 10px;
    width: 160px;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.logo {
    width: 140px;
    height: 140px;
    margin-bottom: 15px;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)); /* Stronger glow */
    background-color: rgba(0, 0, 0, 0.1); /* Subtle background to make logo stand out */
    padding: 10px;
    border-radius: 50%; /* Circular background */
    object-fit: contain; /* Ensure proper scaling */
}

.error-message {
    color: var(--ion-color-danger);
    font-size: 12px;
    margin: 4px 16px;
    font-weight: $font-weight-bold;
}

.social-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 24px;
    width: 100%;
    
    ion-button::part(native) {
        padding: 10px 15px;
        border-radius: $border-radius-md;
    }
}

ion-card {
    width: 100%;
    margin: 0;
    border-radius: $border-radius-md;
}

ion-card-title {
    font-size: 1.5rem;
    text-align: center;
    width: 100%;
}

ion-button {
    margin-top: 15px;
    font-weight: $font-weight-bold;
    --border-radius: $border-radius-md;
}

// Animations
.pulse-animation {
    animation: pulse 2s infinite;
}

.fade-in-animation {
    animation: fadeIn 1.5s ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9));
    }
    50% {
        transform: scale(1.05);
        filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1));
    }
    100% {
        transform: scale(1);
        filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9));
    }
}

@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
