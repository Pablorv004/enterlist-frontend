<template>
    <ion-page>
        <ion-content :fullscreen="true" class="login-page">
            <div class="login-container">
                <div class="logo-container">
                    <img src="@/assets/logo.png" alt="Enterlist Logo" class="logo" />
                    <h1 class="title gradient-text">ENTERLIST</h1>
                </div>

                <ion-card class="login-card">
                    <ion-card-header>
                        <ion-card-title class="card-title">{{ isLoginMode ? 'Sign In' : 'Create Account'
                            }}</ion-card-title>
                        <ion-card-subtitle>{{ isLoginMode ? 'Welcome back!' : 'Join the network' }}</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                        <form @submit.prevent="submitForm" class="login-form">
                            <!-- Role selection for register mode -->
                            <ion-item v-if="!isLoginMode" class="form-input">
                                <ion-label position="floating">I am a...</ion-label>
                                <ion-select v-model="form.role" interface="popover">
                                    <ion-select-option value="artist">Artist</ion-select-option>
                                    <ion-select-option value="playlist_maker">Playlist Creator</ion-select-option>
                                </ion-select>
                                <ion-note slot="error" v-if="isDirty.role && errors.role">{{ errors.role }}</ion-note>
                            </ion-item>

                            <!-- Username for register mode -->
                            <ion-item v-if="!isLoginMode" class="form-input">
                                <ion-label position="floating">Username</ion-label>
                                <ion-input v-model="form.username" type="text"
                                    @blur="validateField('username', form.username, validationRules.username)"
                                    :class="{ 'ion-invalid': isDirty.username && errors.username }"
                                    :errorText="errors.username"></ion-input>
                                <ion-note slot="error" v-if="isDirty.username && errors.username">{{ errors.username
                                    }}</ion-note>
                            </ion-item>

                            <!-- Email -->
                            <ion-item class="form-input">
                                <ion-label position="floating">Email</ion-label>
                                <ion-input v-model="form.email" type="email"
                                    @blur="validateField('email', form.email, validationRules.email)"
                                    :class="{ 'ion-invalid': isDirty.email && errors.email }"
                                    :errorText="errors.email"></ion-input>
                                <ion-note slot="error" v-if="isDirty.email && errors.email">{{ errors.email
                                    }}</ion-note>
                            </ion-item>

                            <!-- Password -->
                            <ion-item class="form-input">
                                <ion-label position="floating">Password</ion-label>
                                <ion-input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                    @blur="validateField('password', form.password, validationRules.password)"
                                    :class="{ 'ion-invalid': isDirty.password && errors.password }"
                                    :errorText="errors.password"></ion-input>
                                <ion-button fill="clear" slot="end" @click="togglePasswordVisibility"
                                    class="password-toggle">
                                    <ion-icon :icon="showPassword ? 'eye-off' : 'eye'"></ion-icon>
                                </ion-button>
                                <ion-note slot="error" v-if="isDirty.password && errors.password">{{ errors.password
                                    }}</ion-note>
                            </ion-item>

                            <!-- Confirm Password for register mode -->
                            <ion-item v-if="!isLoginMode" class="form-input">
                                <ion-label position="floating">Confirm Password</ion-label>
                                <ion-input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'"
                                    @blur="validateField('confirmPassword', form.confirmPassword, validationRules.confirmPassword)"
                                    :class="{ 'ion-invalid': isDirty.confirmPassword && errors.confirmPassword }"
                                    :errorText="errors.confirmPassword"></ion-input>
                                <ion-note slot="error" v-if="isDirty.confirmPassword && errors.confirmPassword">{{
                                    errors.confirmPassword }}</ion-note>
                            </ion-item>

                            <!-- Error Message -->
                            <div v-if="error" class="error-message">
                                <ion-text color="danger">{{ error }}</ion-text>
                            </div>

                            <!-- Submit Button -->
                            <ion-button type="submit" expand="block" :disabled="loading" class="submit-button">
                                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                                <span v-else>{{ isLoginMode ? 'Sign In' : 'Create Account' }}</span>
                            </ion-button>

                            <!-- Mode Toggle -->
                            <div class="mode-toggle">
                                <ion-text>
                                    {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
                                    <ion-text color="primary" class="toggle-link" @click="toggleMode">
                                        {{ isLoginMode ? 'Create one' : 'Sign in' }}
                                    </ion-text>
                                </ion-text>
                            </div>

                            <!-- OAuth Separators -->
                            <div class="separator">
                                <div class="line"></div>
                                <div class="or-text">OR</div>
                                <div class="line"></div>
                            </div>

                            <!-- OAuth Login Buttons -->
                            <div class="oauth-buttons">
                                <ion-button fill="outline" class="oauth-button spotify" @click="oauthLogin('spotify')">
                                    <ion-icon :icon="spotifyIcon" slot="start"></ion-icon>
                                    Continue with Spotify
                                </ion-button>
                                <ion-button fill="outline" class="oauth-button soundcloud"
                                    @click="oauthLogin('soundcloud')">
                                    <ion-icon :icon="soundcloudIcon" slot="start"></ion-icon>
                                    Continue with SoundCloud
                                </ion-button>
                                <ion-button fill="outline" class="oauth-button youtube" @click="oauthLogin('youtube')">
                                    <ion-icon :icon="youtubeIcon" slot="start"></ion-icon>
                                    Continue with YouTube
                                </ion-button>
                            </div>
                        </form>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonNote,
    alertController,
    toastController
} from '@ionic/vue';
import { eye, eyeOff, playCircleOutline as logoSpotify, logoSoundcloud, logoYoutube } from 'ionicons/icons';
import { useAuthStore } from '@/store';
import { useFormValidation } from '@/composables';
import { PlatformService } from '@/services/PlatformService';

export default defineComponent({
    name: 'LoginPage',
    components: {
        IonPage,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardSubtitle,
        IonCardContent,
        IonItem,
        IonLabel,
        IonInput,
        IonButton,
        IonIcon,
        IonText,
        IonSpinner,
        IonSelect,
        IonSelectOption,
        IonNote
    },
    setup() {
        const router = useRouter();
        const authStore = useAuthStore();
        const { errors, isDirty, validateField, validateForm, resetValidation } = useFormValidation();

        // Form state
        const form = reactive({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'artist'
        });

        // UI state
        const isLoginMode = ref(true);
        const showPassword = ref(false);
        const loading = computed(() => authStore.loading);
        const error = computed(() => authStore.error);

        // Validation rules
        const validationRules = reactive({
            username: {
                required: true,
                minLength: 3,
                maxLength: 30
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minLength: 8
            },
            confirmPassword: {
                required: true,
                match: {
                    value: computed(() => form.password),
                    message: 'Passwords do not match'
                }
            },
            role: {
                required: true
            }
        });

        // Icons
        const spotifyIcon = logoSpotify;
        const soundcloudIcon = logoSoundcloud;
        const youtubeIcon = logoYoutube;

        // Toggle login/register mode
        const toggleMode = () => {
            isLoginMode.value = !isLoginMode.value;
            resetValidation();
        };

        // Toggle password visibility
        const togglePasswordVisibility = () => {
            showPassword.value = !showPassword.value;
        };

        // Submit form handler
        const submitForm = async () => {
            if (isLoginMode.value) {
                // Login validation
                if (!validateForm({
                    email: form.email,
                    password: form.password
                }, {
                    email: validationRules.email,
                    password: validationRules.password
                })) {
                    return;
                }

                try {
                    await authStore.login(form.email, form.password);
                    router.push('/dashboard');

                    // Show welcome toast
                    const toast = await toastController.create({
                        message: 'Welcome back!',
                        duration: 2000,
                        position: 'top',
                        color: 'success'
                    });
                    toast.present();
                } catch (err: any) {
                    // Error is handled in the store and displayed in the template
                }
            } else {
                // Register validation
                if (!validateForm({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                    role: form.role
                }, {
                    username: validationRules.username,
                    email: validationRules.email,
                    password: validationRules.password,
                    confirmPassword: validationRules.confirmPassword,
                    role: validationRules.role
                })) {
                    return;
                }

                try {
                    await authStore.register({
                        username: form.username,
                        email: form.email,
                        password: form.password,
                        role: form.role
                    });
                    router.push('/dashboard');

                    // Show welcome toast
                    const toast = await toastController.create({
                        message: 'Account created successfully!',
                        duration: 3000,
                        position: 'top',
                        color: 'success'
                    });
                    toast.present();
                } catch (err: any) {
                    // Error is handled in the store and displayed in the template
                }
            }
        };

        // OAuth login handler
        const oauthLogin = async (provider: string) => {
            try {
                let authUrl = '';

                switch (provider) {
                    case 'spotify':
                        const spotifyResponse = await PlatformService.getSpotifyAuthUrl();
                        authUrl = spotifyResponse.url;
                        break;
                    case 'soundcloud':
                        const soundcloudResponse = await PlatformService.getSoundcloudAuthUrl();
                        authUrl = soundcloudResponse.url;
                        break;
                    case 'youtube':
                        const youtubeResponse = await PlatformService.getYoutubeAuthUrl();
                        authUrl = youtubeResponse.url;
                        break;
                    default:
                        throw new Error('Invalid provider');
                }

                // Open OAuth window
                window.location.href = authUrl;
            } catch (err: any) {
                // Show error alert
                const alert = await alertController.create({
                    header: 'Authentication Error',
                    message: `Failed to authenticate with ${provider}. Please try again.`,
                    buttons: ['OK']
                });
                await alert.present();
            }
        };

        return {
            form,
            isLoginMode,
            showPassword,
            loading,
            error,
            errors,
            isDirty,
            validationRules,
            spotifyIcon,
            soundcloudIcon,
            youtubeIcon,
            toggleMode,
            togglePasswordVisibility,
            submitForm,
            oauthLogin,
            validateField
        };
    }
});
</script>

<style scoped>
.login-page {
    --background: url('@/assets/blurred-blue-purple-bg.jpg') no-repeat center center / cover;
}

.login-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 16px;
    text-align: center;
    overflow-y: auto;
    padding-top: 32px;
}

.logo-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
    text-align: center;
    gap: 16px;
}

.logo {
    width: 80px;
    height: 80px;
    margin-bottom: 0;
}

.title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 2px;
    margin: 0;
    text-align: center;
}

.login-card {
    width: 100%;
    max-width: 450px;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.95);
    margin-bottom: 32px;
}

.card-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--ion-color-primary);
    text-align: center;
}

ion-card-subtitle {
    text-align: center;
}

.login-form {
    margin-top: 16px;
}

.form-input {
    margin-bottom: 16px;
    --border-color: var(--ion-color-medium);
    --border-radius: 8px;
    --background: rgba(255, 255, 255, 0.7);
}

.submit-button {
    margin-top: 24px;
    height: 48px;
    font-size: 16px;
    --background: var(--background-gradient);
}

.password-toggle {
    margin: 0;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
}

.mode-toggle {
    margin: 24px 0;
    text-align: center;
}

.toggle-link {
    cursor: pointer;
    font-weight: 600;
    margin-left: 8px;
}

.error-message {
    background: rgba(var(--ion-color-danger-rgb), 0.1);
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
}

.separator {
    display: flex;
    align-items: center;
    margin: 16px 0;
}

.line {
    flex: 1;
    height: 1px;
    background-color: var(--ion-color-medium);
}

.or-text {
    padding: 0 16px;
    color: var(--ion-color-medium);
    font-size: 14px;
}

.oauth-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.oauth-button {
    width: 100%;
    --border-radius: 8px;
    height: 48px;
}

.spotify {
    --border-color: #1DB954;
    --color: #1DB954;
}

.soundcloud {
    --border-color: #FF5500;
    --color: #FF5500;
}

.youtube {
    --border-color: #FF0000;
    --color: #FF0000;
}

/* Media Queries */
@media (max-width: 576px) {
    .logo-container {
        flex-direction: column;
        gap: 8px;
    }
    
    .logo {
        width: 90px;
        height: 90px;
    }

    .title {
        font-size: 28px;
    }

    .card-title {
        font-size: 20px;
    }
    
    .login-container {
        padding-top: 16px;
    }
}
</style>
