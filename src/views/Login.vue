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
                    </ion-card-header> <ion-card-content>
                        <form @submit.prevent="submitForm" class="login-form">
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
                                    :errorText="errors.password"></ion-input> <ion-button fill="clear" slot="end"
                                    @click="togglePasswordVisibility" class="password-toggle">
                                    <ion-icon :icon="showPassword ? eyeOff : eye"></ion-icon>
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
                                <ion-button fill="clear" slot="end" @click="togglePasswordVisibility"
                                    class="password-toggle">
                                    <ion-icon :icon="showPassword ? eyeOff : eye"></ion-icon>
                                </ion-button>
                                <ion-note slot="error" v-if="isDirty.confirmPassword && errors.confirmPassword">{{
                                    errors.confirmPassword }}</ion-note>
                            </ion-item>

                            <!-- Error Message -->
                            <div v-if="displayError || hasValidationErrors" class="error-message">
                                <ion-text color="danger">{{ displayError || firstValidationError }}</ion-text>
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
import { defineComponent, ref, computed, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
import { eye, eyeOff, playCircleOutline as logoSpotify, logoYoutube } from 'ionicons/icons';
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
    }, setup() {
        const router = useRouter();
        const route = useRoute();
        const authStore = useAuthStore();
        const { errors, isDirty, validateField, validateForm, resetValidation } = useFormValidation();        // Form state
        const form = reactive({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });        // UI state
        const isLoginMode = ref(true);
        const showPassword = ref(false);
        const loading = computed(() => authStore.loading);
        const error = computed(() => authStore.error || '');
        const localError = ref('');

        // Check for OAuth error in query parameters on mount
        onMounted(() => {
            if (route.query.error) {
                const errorMessage = decodeURIComponent(route.query.error as string);
                localError.value = errorMessage;
                // Clear the error from URL without triggering navigation
                router.replace({ query: {} });
            }
        });

        // Computed error that combines both auth store errors and local errors
        const displayError = computed(() => {
            return authStore.error || localError.value;
        });

        // Computed validation errors
        const hasValidationErrors = computed(() => {
            return Object.keys(errors.value).some(key => isDirty.value[key] && errors.value[key]);
        });

        const firstValidationError = computed(() => {
            const errorKeys = Object.keys(errors.value).filter(key => isDirty.value[key] && errors.value[key]);
            return errorKeys.length > 0 ? errors.value[errorKeys[0]] : '';
        });        // Validation rules
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
            }, confirmPassword: {
                required: true,
                password: true,
                match: {
                    value: computed(() => form.password),
                    message: 'Passwords do not match'
                }
            }
        });

        // Icons
        const spotifyIcon = logoSpotify;
        const youtubeIcon = logoYoutube;        // Toggle login/register mode
        const toggleMode = () => {
            isLoginMode.value = !isLoginMode.value;
            resetValidation();
            // Clear any OAuth error when switching modes
            localError.value = '';
            authStore.clearError();
        };

        // Toggle password visibility
        const togglePasswordVisibility = () => {
            showPassword.value = !showPassword.value;
        };        // Submit form handler
        const submitForm = async () => {
            // Clear any previous errors
            localError.value = '';
            authStore.clearError();

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
                    console.error('Login error:', err);
                    // Error will be handled by the watcher from auth store
                }
            } else {
                // Register validation
                if (!validateForm({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    confirmPassword: form.confirmPassword
                }, {
                    username: validationRules.username,
                    email: validationRules.email,
                    password: validationRules.password,
                    confirmPassword: validationRules.confirmPassword
                })) {
                    return;
                } try {
                    await authStore.register({
                        username: form.username,
                        email: form.email,
                        password: form.password
                    });
                    // Redirect to role selection after successful registration
                    router.push('/role-selection');                    // Show welcome toast
                    const toast = await toastController.create({
                        message: 'Account created successfully! Please select your role.',
                        duration: 3000,
                        position: 'top',
                        color: 'success'
                    });
                    toast.present();
                } catch (err: any) {
                    console.error('Registration error:', err);
                    // Error will be handled by the watcher from auth store
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
        }; return {
            form,
            isLoginMode,
            showPassword,
            loading,
            displayError,
            hasValidationErrors,
            firstValidationError,
            errors,
            isDirty,
            validationRules,
            spotifyIcon,
            youtubeIcon,
            eye,
            eyeOff,
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
    min-height: 100vh;
}

.logo-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
    text-align: center;
    gap: 16px;
    flex-shrink: 0;
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
    flex-shrink: 0;
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
    min-width: auto;
    min-height: auto;
    --padding-start: 8px;
    --padding-end: 8px;
    --color: var(--ion-color-medium);
    z-index: 10;
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.password-toggle ion-icon {
    font-size: 20px;
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
    margin-bottom: 16px;
}

.oauth-button {
    width: 100%;
    --border-radius: 8px;
    height: 48px;
    font-size: 14px;
    text-transform: none;
}

.oauth-button ion-icon {
    margin-right: 8px;
}

.spotify {
    --border-color: #1DB954;
    --color: #1DB954;
}

.youtube {
    --border-color: #FF0000;
    --color: #FF0000;
}

/* Media Queries */
@media (max-width: 576px) {
    .login-container {
        padding: 12px;
        padding-top: 16px;
        min-height: calc(100vh - 20px);
    }

    .logo-container {
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
    }

    .logo {
        width: 70px;
        height: 70px;
    }

    .title {
        font-size: 24px;
        letter-spacing: 1px;
    }

    .card-title {
        font-size: 20px;
    }

    .login-card {
        margin-bottom: 20px;
    }

    .form-input {
        margin-bottom: 12px;
    }

    .oauth-buttons {
        gap: 10px;
        margin-bottom: 12px;
    }

    .oauth-button {
        height: 44px;
        font-size: 13px;
    }

    .separator {
        margin: 12px 0;
    }

    .mode-toggle {
        margin: 16px 0;
    }
}

@media (max-width: 380px) {
    .login-container {
        padding: 8px;
    }

    .logo {
        width: 60px;
        height: 60px;
    }

    .title {
        font-size: 20px;
    }

    .oauth-button {
        height: 40px;
        font-size: 12px;
    }

    .oauth-button ion-icon {
        margin-right: 6px;
    }
}
</style>
