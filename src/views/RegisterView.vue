<template>
    <ion-page>
        <ion-content :fullscreen="true">
            <div class="register-container">
                <div class="logo-container">
                    <img src="@/assets/logo.png" alt="Enterlist Logo" class="logo" />
                    <h1>Enterlist</h1>
                </div>

                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Register</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <form @submit.prevent="handleRegister">
                            <ion-list lines="full">
                                <ion-item>
                                    <ion-label position="floating">Username</ion-label>
                                    <ion-input v-model="username" type="text" required :readonly="loading"></ion-input>
                                </ion-item>
                                <div v-if="errors.username" class="error-message">{{ errors.username }}</div>

                                <ion-item>
                                    <ion-label position="floating">Email</ion-label>
                                    <ion-input v-model="email" type="email" required autocomplete="email"
                                        :readonly="loading"></ion-input>
                                </ion-item>
                                <div v-if="errors.email" class="error-message">{{ errors.email }}</div>

                                <ion-item>
                                    <ion-label position="floating">Password</ion-label>
                                    <ion-input v-model="password" type="password" required
                                        :readonly="loading"></ion-input>
                                </ion-item>
                                <div v-if="errors.password" class="error-message">{{ errors.password }}</div>

                                <ion-item>
                                    <ion-label position="floating">Confirm Password</ion-label>
                                    <ion-input v-model="confirmPassword" type="password" required
                                        :readonly="loading"></ion-input>
                                </ion-item>
                                <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}
                                </div>

                                <ion-item>
                                    <ion-label>I am a:</ion-label>
                                    <ion-select v-model="role" :readonly="loading">
                                        <ion-select-option value="artist">Music Artist</ion-select-option>
                                        <ion-select-option value="playlist_maker">Playlist Curator</ion-select-option>
                                    </ion-select>
                                </ion-item>
                                <div v-if="errors.role" class="error-message">{{ errors.role }}</div>

                                <div v-if="errorMessage" class="ion-padding error-message">
                                    {{ errorMessage }}
                                </div>

                                <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="loading">
                                    <ion-spinner v-if="loading" name="dots"></ion-spinner>
                                    <span v-else>Register</span>
                                </ion-button>

                                <div class="ion-text-center ion-padding-top">
                                    <ion-text color="medium">Or register with</ion-text>
                                </div>

                                <div class="social-buttons">
                                    <ion-button fill="outline" color="dark" @click="registerWithGoogle">
                                        <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
                                        Google
                                    </ion-button>
                                    <ion-button fill="outline" color="dark" @click="registerWithSpotify">
                                        <ion-icon :icon="musicalNotes" slot="start"></ion-icon>
                                        Spotify
                                    </ion-button>
                                </div>

                                <div class="ion-text-center ion-padding-top">
                                    <ion-text>Already have an account? </ion-text>
                                    <ion-router-link href="/login">Login</ion-router-link>
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
    IonSelect,
    IonSelectOption,
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
import { UserRole } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const { errors, validateEmail, validateRequired, validateMinLength, clearErrors, setError } = useFormValidation();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const role = ref<UserRole>('artist');
const loading = ref(false);
const errorMessage = ref('');

async function handleRegister() {
    clearErrors();
    errorMessage.value = '';

    // Validate form
    let isValid = true;

    if (!validateRequired(username.value, 'username')) {
        isValid = false;
    } else if (!validateMinLength(username.value, 'username', 3)) {
        isValid = false;
    }

    if (!validateRequired(email.value, 'email')) {
        isValid = false;
    } else if (!validateEmail(email.value)) {
        errors.value.email = 'Please enter a valid email address';
        isValid = false;
    }

    if (!validateRequired(password.value, 'password')) {
        isValid = false;
    } else if (!validateMinLength(password.value, 'password', 6)) {
        isValid = false;
    }

    if (!validateRequired(confirmPassword.value, 'confirmPassword')) {
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        setError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }

    if (!validateRequired(role.value, 'role')) {
        isValid = false;
    }

    if (!isValid) return;

    // Perform registration
    loading.value = true;

    try {
        await authStore.register({
            username: username.value,
            email: email.value,
            password: password.value,
            role: role.value
        });

        const toast = await toastController.create({
            message: 'Registration successful! Please log in.',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

        router.push('/login');
    } catch (err: any) {
        errorMessage.value = err.toString();

        const toast = await toastController.create({
            message: 'Registration failed. Please try again.',
            duration: 3000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        loading.value = false;
    }
}

function registerWithGoogle() {
    // Implement OAuth registration with Google
    alert('Google OAuth registration not implemented yet');
}

function registerWithSpotify() {
    // Implement OAuth registration with Spotify
    alert('Spotify OAuth registration not implemented yet');
}
</script>

<style scoped>
.register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.logo {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
}

.error-message {
    color: var(--ion-color-danger);
    font-size: 12px;
    margin: 4px 16px;
}

.social-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 16px;
}
</style>
