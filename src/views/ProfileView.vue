<template>
    <ion-page>
        <page-header title="Profile"></page-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Profile</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="ion-padding">
                <div v-if="loading" class="ion-text-center">
                    <ion-spinner></ion-spinner>
                    <p>Loading profile...</p>
                </div>

                <div v-else-if="error" class="ion-padding ion-text-center error-message">
                    <p>{{ error }}</p>
                    <ion-button @click="loadProfile">Retry</ion-button>
                </div>

                <ion-grid v-else>
                    <ion-row>
                        <!-- Profile Info Card -->
                        <ion-col size="12" size-md="6">
                            <ion-card>
                                <ion-card-header>
                                    <div class="profile-header">
                                        <ion-avatar class="profile-avatar">
                                            <img v-if="user?.avatar_url" :src="user.avatar_url" alt="Avatar" />
                                            <ion-icon v-else :icon="personCircle" size="large"></ion-icon>
                                        </ion-avatar>
                                        <div class="profile-titles">
                                            <ion-card-title>{{ user?.username || 'User' }}</ion-card-title>
                                            <ion-card-subtitle>{{ formatRole(user?.role) }}</ion-card-subtitle>
                                            <ion-badge color="primary" v-if="user?.verified">Verified</ion-badge>
                                        </div>
                                    </div>
                                </ion-card-header>
                                <ion-card-content>
                                    <ion-list lines="full">
                                        <ion-item>
                                            <ion-label>
                                                <h3>Email</h3>
                                                <p>{{ user?.email }}</p>
                                            </ion-label>
                                        </ion-item>
                                        <ion-item>
                                            <ion-label>
                                                <h3>Member Since</h3>
                                                <p>{{ formatDate(user?.created_at) }}</p>
                                            </ion-label>
                                        </ion-item>
                                        <ion-item v-if="isArtist">
                                            <ion-label>
                                                <h3>Songs</h3>
                                                <p>{{ stats.songCount || 0 }} tracks</p>
                                            </ion-label>
                                        </ion-item>
                                        <ion-item v-if="isPlaylistMaker">
                                            <ion-label>
                                                <h3>Playlists</h3>
                                                <p>{{ stats.playlistCount || 0 }} playlists</p>
                                            </ion-label>
                                        </ion-item>
                                        <ion-item>
                                            <ion-label>
                                                <h3>Submissions</h3>
                                                <p>{{ stats.submissionCount || 0 }} submissions</p>
                                            </ion-label>
                                        </ion-item>
                                    </ion-list>

                                    <ion-button expand="block" @click="startEditProfile" class="ion-margin-top">
                                        <ion-icon :icon="create" slot="start"></ion-icon>
                                        Edit Profile
                                    </ion-button>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>

                        <!-- Connected Accounts -->
                        <ion-col size="12" size-md="6">
                            <ion-card>
                                <ion-card-header>
                                    <ion-card-title>Connected Accounts</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <ion-list>
                                        <ion-item>
                                            <ion-icon :icon="musicalNotes" slot="start" color="primary"></ion-icon>
                                            <ion-label>
                                                <h3>Spotify</h3>
                                                <p>{{ connectedAccounts.spotify ? 'Connected' : 'Not connected' }}</p>
                                            </ion-label>
                                            <ion-button slot="end" fill="outline" @click="connectAccount('spotify')"
                                                v-if="!connectedAccounts.spotify">
                                                Connect
                                            </ion-button>
                                            <ion-button slot="end" fill="outline" color="medium"
                                                @click="disconnectAccount('spotify')" v-else>
                                                Disconnect
                                            </ion-button>
                                        </ion-item>

                                        <ion-item>
                                            <ion-icon :icon="logoGoogle" slot="start" color="danger"></ion-icon>
                                            <ion-label>
                                                <h3>Google</h3>
                                                <p>{{ connectedAccounts.google ? 'Connected' : 'Not connected' }}</p>
                                            </ion-label>
                                            <ion-button slot="end" fill="outline" @click="connectAccount('google')"
                                                v-if="!connectedAccounts.google">
                                                Connect
                                            </ion-button>
                                            <ion-button slot="end" fill="outline" color="medium"
                                                @click="disconnectAccount('google')" v-else>
                                                Disconnect
                                            </ion-button>
                                        </ion-item>
                                    </ion-list>
                                </ion-card-content>
                            </ion-card>

                            <!-- Account Settings -->
                            <ion-card>
                                <ion-card-header>
                                    <ion-card-title>Account Settings</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <ion-list>
                                        <ion-item button @click="startChangePassword">
                                            <ion-icon :icon="lockClosed" slot="start"></ion-icon>
                                            <ion-label>Change Password</ion-label>
                                        </ion-item>

                                        <ion-item>
                                            <ion-icon :icon="notifications" slot="start"></ion-icon>
                                            <ion-label>Notifications</ion-label>
                                            <ion-toggle v-model="notificationsEnabled"
                                                @ionChange="toggleNotifications"></ion-toggle>
                                        </ion-item>

                                        <ion-item button @click="logout" class="logout-button">
                                            <ion-icon :icon="logOut" slot="start" color="danger"></ion-icon>
                                            <ion-label color="danger">Logout</ion-label>
                                        </ion-item>
                                    </ion-list>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>

        <!-- Edit Profile Modal -->
        <ion-modal :is-open="showEditModal" @didDismiss="showEditModal = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Edit Profile</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="showEditModal = false">Cancel</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <form @submit.prevent="updateProfile">
                    <ion-list>
                        <ion-item>
                            <ion-label position="floating">Username</ion-label>
                            <ion-input v-model="editForm.username" required></ion-input>
                        </ion-item>
                        <div v-if="errors.username" class="error-message">{{ errors.username }}</div>

                        <ion-item>
                            <ion-label position="floating">Email</ion-label>
                            <ion-input v-model="editForm.email" type="email" required></ion-input>
                        </ion-item>
                        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>

                        <ion-item>
                            <ion-label position="floating">Avatar URL</ion-label>
                            <ion-input v-model="editForm.avatar_url"></ion-input>
                        </ion-item>

                        <div class="preview-section" v-if="editForm.avatar_url">
                            <h4>Avatar Preview</h4>
                            <ion-avatar class="avatar-preview">
                                <img :src="editForm.avatar_url" alt="Avatar Preview" />
                            </ion-avatar>
                        </div>

                        <div v-if="editError" class="ion-padding error-message">
                            {{ editError }}
                        </div>

                        <div class="ion-padding">
                            <ion-button expand="block" type="submit" :disabled="updating">
                                <ion-spinner v-if="updating" name="dots"></ion-spinner>
                                <span v-else>Save Changes</span>
                            </ion-button>
                        </div>
                    </ion-list>
                </form>
            </ion-content>
        </ion-modal>

        <!-- Change Password Modal -->
        <ion-modal :is-open="showPasswordModal" @didDismiss="showPasswordModal = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Change Password</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="showPasswordModal = false">Cancel</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <form @submit.prevent="updatePassword">
                    <ion-list>
                        <ion-item>
                            <ion-label position="floating">Current Password</ion-label>
                            <ion-input v-model="passwordForm.currentPassword" type="password" required></ion-input>
                        </ion-item>
                        <div v-if="errors.currentPassword" class="error-message">{{ errors.currentPassword }}</div>

                        <ion-item>
                            <ion-label position="floating">New Password</ion-label>
                            <ion-input v-model="passwordForm.newPassword" type="password" required></ion-input>
                        </ion-item>
                        <div v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</div>

                        <ion-item>
                            <ion-label position="floating">Confirm New Password</ion-label>
                            <ion-input v-model="passwordForm.confirmPassword" type="password" required></ion-input>
                        </ion-item>
                        <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>

                        <div v-if="passwordError" class="ion-padding error-message">
                            {{ passwordError }}
                        </div>

                        <div class="ion-padding">
                            <ion-button expand="block" type="submit" :disabled="updating">
                                <ion-spinner v-if="updating" name="dots"></ion-spinner>
                                <span v-else>Update Password</span>
                            </ion-button>
                        </div>
                    </ion-list>
                </form>
            </ion-content>
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonAvatar,
    IonBadge,
    IonToggle,
    IonInput,
    IonSpinner,
    IonModal,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    toastController,
    alertController
} from '@ionic/vue';
import {
    personCircle,
    create,
    musicalNotes,
    lockClosed,
    notifications,
    logOut,
    logoGoogle
} from 'ionicons/icons';
import { useAuthStore } from '@/store/auth';
import { useApiStatus, useFormValidation } from '@/composables/useUtils';
import PageHeader from '@/components/layout/PageHeader.vue';
import userService from '@/services/user.service';
import songService from '@/services/song.service';
import playlistService from '@/services/playlist.service';
import submissionService from '@/services/submission.service';
import type { UserUpdate, UserRole, User } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const { loading, error, startLoading, stopLoading, setError, clearError } = useApiStatus();
const { errors, validateEmail, validateRequired, validateMinLength, clearErrors, setError: setFormError } = useFormValidation();

// User data
const user = ref<User | null>(null);

// Stats
const stats = ref({
    songCount: 0,
    playlistCount: 0,
    submissionCount: 0
});

// Connected accounts
const connectedAccounts = ref({
    spotify: false,
    google: false
});

// Edit profile
const showEditModal = ref(false);
const updating = ref(false);
const editError = ref('');
const editForm = ref<UserUpdate>({
    username: '',
    email: '',
    avatar_url: ''
});

// Change password
const showPasswordModal = ref(false);
const passwordError = ref('');
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Notifications
const notificationsEnabled = ref(false);

// Role based displays
const isArtist = computed(() => authStore.isArtist);
const isPlaylistMaker = computed(() => authStore.isPlaylistMaker);
const isAdmin = computed(() => authStore.isAdmin);

onMounted(() => {
    loadProfile();
});

async function loadProfile() {
    try {
        startLoading();
        clearError();

        const userId = authStore.user?.user_id;
        if (!userId) {
            setError('User not authenticated');
            return;
        }

        // Load user data
        const userData = await userService.getUserById(userId);
        user.value = userData;

        // Update form data
        editForm.value.username = userData.username;
        editForm.value.email = userData.email;
        editForm.value.avatar_url = userData.avatar_url || '';

        // Load connected accounts
        // In a real app, you would call an API to get this information
        connectedAccounts.value.spotify = !!userData.spotify_id;
        connectedAccounts.value.google = !!userData.google_id;

        // Load user statistics
        loadUserStats(userId);

        // Load notification preferences
        // In a real app, you would call an API to get this information
        notificationsEnabled.value = userData.notifications_enabled || false;

    } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        console.error('Error loading profile:', err);
    } finally {
        stopLoading();
    }
}

async function loadUserStats(userId: string) {
    try {
        if (isArtist.value) {
            const songsResponse = await songService.getSongsByArtist(userId);
            stats.value.songCount = songsResponse.total;
        }

        if (isPlaylistMaker.value) {
            const playlistsResponse = await playlistService.getPlaylistsByCreator(userId);
            stats.value.playlistCount = playlistsResponse.total;
        }

        const submissionsResponse = await submissionService.getSubmissionsByArtist(userId);
        stats.value.submissionCount = submissionsResponse.total;

    } catch (err: any) {
        console.error('Error loading user stats:', err);
    }
}

function startEditProfile() {
    showEditModal.value = true;
    editError.value = '';
    clearErrors();
}

function startChangePassword() {
    showPasswordModal.value = true;
    passwordError.value = '';
    clearErrors();
    passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
}

async function updateProfile() {
    clearErrors();
    editError.value = '';

    // Form validation
    let isValid = true;

    if (!validateRequired(editForm.value.username, 'username')) {
        isValid = false;
    } else if (!validateMinLength(editForm.value.username, 'username', 3)) {
        isValid = false;
    }

    if (!validateRequired(editForm.value.email, 'email')) {
        isValid = false;
    } else if (!validateEmail(editForm.value.email, 'email')) {
        isValid = false;
    }

    if (!isValid) return;

    updating.value = true;

    try {
        if (!user.value?.user_id) throw new Error('User ID not found');

        await userService.updateUser(user.value.user_id, editForm.value);

        // Update local user data
        if (user.value) {
            user.value.username = editForm.value.username;
            user.value.email = editForm.value.email;
            user.value.avatar_url = editForm.value.avatar_url;
        }

        // Update auth store
        authStore.updateUserInfo({
            username: editForm.value.username,
            email: editForm.value.email,
            avatar_url: editForm.value.avatar_url
        });

        // Close modal
        showEditModal.value = false;

        // Show success toast
        const toast = await toastController.create({
            message: 'Profile updated successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

    } catch (err: any) {
        editError.value = err.message || 'Failed to update profile';
        console.error('Error updating profile:', err);

        const toast = await toastController.create({
            message: 'Failed to update profile',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        updating.value = false;
    }
}

async function updatePassword() {
    clearErrors();
    passwordError.value = '';

    // Form validation
    let isValid = true;

    if (!validateRequired(passwordForm.value.currentPassword, 'currentPassword')) {
        isValid = false;
    }

    if (!validateRequired(passwordForm.value.newPassword, 'newPassword')) {
        isValid = false;
    } else if (!validateMinLength(passwordForm.value.newPassword, 'newPassword', 8)) {
        setFormError('newPassword', 'Password must be at least 8 characters long');
        isValid = false;
    }

    if (!validateRequired(passwordForm.value.confirmPassword, 'confirmPassword')) {
        isValid = false;
    } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        setFormError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }

    if (!isValid) return;

    updating.value = true;

    try {
        if (!user.value?.user_id) throw new Error('User ID not found');

        await userService.updatePassword(
            user.value.user_id,
            passwordForm.value.currentPassword,
            passwordForm.value.newPassword
        );

        // Close modal
        showPasswordModal.value = false;

        // Show success toast
        const toast = await toastController.create({
            message: 'Password updated successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

    } catch (err: any) {
        passwordError.value = err.message || 'Failed to update password';
        console.error('Error updating password:', err);

        const toast = await toastController.create({
            message: 'Failed to update password',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        updating.value = false;
    }
}

async function toggleNotifications() {
    try {
        if (!user.value?.user_id) throw new Error('User ID not found');

        await userService.updateNotificationPreferences(
            user.value.user_id,
            notificationsEnabled.value
        );

        // Show success toast
        const toast = await toastController.create({
            message: `Notifications ${notificationsEnabled.value ? 'enabled' : 'disabled'}`,
            duration: 2000,
            color: 'success'
        });
        await toast.present();

    } catch (err: any) {
        // Revert toggle if failed
        notificationsEnabled.value = !notificationsEnabled.value;

        console.error('Error updating notification preferences:', err);

        const toast = await toastController.create({
            message: 'Failed to update notification preferences',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    }
}

async function connectAccount(provider: 'spotify' | 'google') {
    try {
        // In a real app, you would redirect to the OAuth flow
        // For now, let's simulate it

        // Show loading toast
        const loadingToast = await toastController.create({
            message: `Connecting to ${provider}...`,
            duration: 2000,
        });
        await loadingToast.present();

        // Simulate API call
        setTimeout(async () => {
            connectedAccounts.value[provider] = true;

            const successToast = await toastController.create({
                message: `Connected to ${provider} successfully`,
                duration: 2000,
                color: 'success'
            });
            await successToast.present();
        }, 2000);

    } catch (err: any) {
        console.error(`Error connecting to ${provider}:`, err);

        const toast = await toastController.create({
            message: `Failed to connect to ${provider}`,
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    }
}

async function disconnectAccount(provider: 'spotify' | 'google') {
    // Show confirmation dialog
    const alert = await alertController.create({
        header: 'Disconnect Account',
        message: `Are you sure you want to disconnect your ${provider} account?`,
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Disconnect',
                role: 'confirm',
                handler: async () => {
                    try {
                        // In a real app, you would call an API to disconnect
                        // For now, let's simulate it

                        // Show loading toast
                        const loadingToast = await toastController.create({
                            message: `Disconnecting from ${provider}...`,
                            duration: 2000,
                        });
                        await loadingToast.present();

                        // Simulate API call
                        setTimeout(async () => {
                            connectedAccounts.value[provider] = false;

                            const successToast = await toastController.create({
                                message: `Disconnected from ${provider} successfully`,
                                duration: 2000,
                                color: 'success'
                            });
                            await successToast.present();
                        }, 2000);

                    } catch (err: any) {
                        console.error(`Error disconnecting from ${provider}:`, err);

                        const toast = await toastController.create({
                            message: `Failed to disconnect from ${provider}`,
                            duration: 2000,
                            color: 'danger'
                        });
                        await toast.present();
                    }
                }
            }
        ]
    });

    await alert.present();
}

async function logout() {
    // Show confirmation dialog
    const alert = await alertController.create({
        header: 'Logout',
        message: 'Are you sure you want to logout?',
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Logout',
                role: 'confirm',
                handler: async () => {
                    await authStore.logout();
                    router.push('/login');
                }
            }
        ]
    });

    await alert.present();
}

function formatRole(role?: UserRole): string {
    if (!role) return 'User';

    switch (role) {
        case 'artist': return 'Music Artist';
        case 'playlist_maker': return 'Playlist Curator';
        case 'admin': return 'Administrator';
        default: return 'User';
    }
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return 'Unknown';

    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}
</script>

<style scoped>
.error-message {
    color: var(--ion-color-danger);
    font-size: 12px;
    margin: 4px 16px;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
}

.profile-avatar {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
}

.profile-titles {
    flex: 1;
}

ion-card-subtitle {
    margin-top: 4px;
}

ion-badge {
    margin-top: 8px;
}

.logout-button {
    margin-top: 16px;
}

.preview-section {
    margin: 16px;
    text-align: center;
}

.avatar-preview {
    width: 100px;
    height: 100px;
    margin: 0 auto;
}

ion-toggle {
    --track-background: var(--ion-color-medium);
    --track-background-checked: var(--ion-color-success);
}
</style>
