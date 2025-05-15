<template>
    <ion-page>
        <page-header title="Admin Dashboard"></page-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Admin Dashboard</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="ion-padding">
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Admin Control Panel</ion-card-title>
                        <ion-card-subtitle>System Overview</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                        <p>Welcome to the admin control panel where you can manage users, monitor system performance,
                            and configure application settings.</p>
                    </ion-card-content>
                </ion-card>

                <!-- Stats Overview -->
                <ion-grid>
                    <ion-row>
                        <ion-col size="12" size-md="4">
                            <ion-card class="stat-card">
                                <ion-card-content>
                                    <div class="stat-icon">
                                        <ion-icon :icon="people" color="primary"></ion-icon>
                                    </div>
                                    <div class="stat-info">
                                        <div v-if="loading.users">
                                            <ion-spinner name="dots"></ion-spinner>
                                        </div>
                                        <div v-else>
                                            <div class="stat-number">{{ stats.totalUsers }}</div>
                                            <div class="stat-label">Total Users</div>
                                        </div>
                                    </div>
                                </ion-card-content>
                                <ion-button fill="clear" expand="full" router-link="/tabs/admin/users">
                                    Manage Users
                                </ion-button>
                            </ion-card>
                        </ion-col>

                        <ion-col size="12" size-md="4">
                            <ion-card class="stat-card">
                                <ion-card-content>
                                    <div class="stat-icon">
                                        <ion-icon :icon="musicalNotes" color="success"></ion-icon>
                                    </div>
                                    <div class="stat-info">
                                        <div v-if="loading.songs">
                                            <ion-spinner name="dots"></ion-spinner>
                                        </div>
                                        <div v-else>
                                            <div class="stat-number">{{ stats.totalSongs }}</div>
                                            <div class="stat-label">Total Songs</div>
                                        </div>
                                    </div>
                                </ion-card-content>
                                <ion-button fill="clear" expand="full" href="/tabs/admin/songs">
                                    View Songs
                                </ion-button>
                            </ion-card>
                        </ion-col>

                        <ion-col size="12" size-md="4">
                            <ion-card class="stat-card">
                                <ion-card-content>
                                    <div class="stat-icon">
                                        <ion-icon :icon="list" color="tertiary"></ion-icon>
                                    </div>
                                    <div class="stat-info">
                                        <div v-if="loading.playlists">
                                            <ion-spinner name="dots"></ion-spinner>
                                        </div>
                                        <div v-else>
                                            <div class="stat-number">{{ stats.totalPlaylists }}</div>
                                            <div class="stat-label">Total Playlists</div>
                                        </div>
                                    </div>
                                </ion-card-content>
                                <ion-button fill="clear" expand="full" href="/tabs/admin/playlists">
                                    View Playlists
                                </ion-button>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>

                <!-- Submissions Stats -->
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Submissions</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <div v-if="loading.submissions">
                            <ion-spinner></ion-spinner>
                            <p>Loading submissions data...</p>
                        </div>
                        <div v-else class="submissions-stats">
                            <div class="stat-block">
                                <div class="stat-number">{{ stats.totalSubmissions }}</div>
                                <div class="stat-label">Total</div>
                            </div>
                            <div class="stat-block">
                                <div class="stat-number">{{ stats.pendingSubmissions }}</div>
                                <div class="stat-label">Pending</div>
                            </div>
                            <div class="stat-block">
                                <div class="stat-number">{{ stats.approvedSubmissions }}</div>
                                <div class="stat-label">Approved</div>
                            </div>
                            <div class="stat-block">
                                <div class="stat-number">{{ stats.rejectedSubmissions }}</div>
                                <div class="stat-label">Rejected</div>
                            </div>
                        </div>

                        <ion-button expand="block" href="/tabs/submissions">
                            <ion-icon :icon="send" slot="start"></ion-icon>
                            View All Submissions
                        </ion-button>
                    </ion-card-content>
                </ion-card>

                <!-- Recent Activity -->
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Recent Activity</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <div v-if="loading.activity">
                            <ion-spinner></ion-spinner>
                            <p>Loading activity data...</p>
                        </div>
                        <div v-else>
                            <ion-list v-if="activities.length > 0">
                                <ion-item v-for="(activity, index) in activities" :key="index">
                                    <ion-icon :icon="getActivityIcon(activity.type)" slot="start"
                                        :color="getActivityColor(activity.type)"></ion-icon>
                                    <ion-label>
                                        <h2>{{ activity.title }}</h2>
                                        <p>{{ activity.description }}</p>
                                        <p>{{ formatDate(activity.timestamp) }}</p>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                            <p v-else class="ion-text-center">No recent activity to display</p>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Quick Actions -->
                <ion-card>
                    <ion-card-header>
                        <ion-card-title>Quick Actions</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <ion-grid>
                            <ion-row>
                                <ion-col size="6" size-md="3">
                                    <ion-button expand="block" fill="outline" @click="showUserModal">
                                        <ion-icon :icon="personAdd" slot="start"></ion-icon>
                                        Add User
                                    </ion-button>
                                </ion-col>
                                <ion-col size="6" size-md="3">
                                    <ion-button expand="block" fill="outline" color="tertiary" @click="goPlatforms">
                                        <ion-icon :icon="apps" slot="start"></ion-icon>
                                        Platforms
                                    </ion-button>
                                </ion-col>
                                <ion-col size="6" size-md="3">
                                    <ion-button expand="block" fill="outline" color="success" @click="goSystemLogs">
                                        <ion-icon :icon="document" slot="start"></ion-icon>
                                        System Logs
                                    </ion-button>
                                </ion-col>
                                <ion-col size="6" size-md="3">
                                    <ion-button expand="block" fill="outline" color="warning" @click="goSettings">
                                        <ion-icon :icon="settings" slot="start"></ion-icon>
                                        Settings
                                    </ion-button>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>

        <!-- Add User Modal -->
        <ion-modal :is-open="showAddUserModal" @didDismiss="showAddUserModal = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Add New User</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="showAddUserModal = false">Cancel</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <form @submit.prevent="addNewUser">
                    <ion-list>
                        <ion-item>
                            <ion-label position="floating">Username</ion-label>
                            <ion-input v-model="newUser.username" required></ion-input>
                        </ion-item>
                        <div v-if="errors.username" class="error-message">{{ errors.username }}</div>

                        <ion-item>
                            <ion-label position="floating">Email</ion-label>
                            <ion-input v-model="newUser.email" type="email" required></ion-input>
                        </ion-item>
                        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>

                        <ion-item>
                            <ion-label position="floating">Password</ion-label>
                            <ion-input v-model="newUser.password" type="password" required></ion-input>
                        </ion-item>
                        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>

                        <ion-item>
                            <ion-label>Role</ion-label>
                            <ion-select v-model="newUser.role">
                                <ion-select-option value="artist">Artist</ion-select-option>
                                <ion-select-option value="playlist_maker">Playlist Maker</ion-select-option>
                                <ion-select-option value="admin">Admin</ion-select-option>
                            </ion-select>
                        </ion-item>
                        <div v-if="errors.role" class="error-message">{{ errors.role }}</div>

                        <div v-if="userError" class="ion-padding error-message">
                            {{ userError }}
                        </div>

                        <div class="ion-padding ion-margin-top">
                            <ion-button expand="block" type="submit" :disabled="addingUser">
                                <ion-spinner v-if="addingUser" name="dots"></ion-spinner>
                                <span v-else>Create User</span>
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
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
    IonButtons,
    IonInput,
    IonSelect,
    IonSelectOption,
    toastController
} from '@ionic/vue';
import {
    people,
    musicalNotes,
    list,
    send,
    personAdd,
    apps,
    document,
    settings,
    personCircle,
    checkmark,
    close,
    time,
    listCircle
} from 'ionicons/icons';
import { useAuthStore } from '@/store/auth';
import { useApiStatus, useFormValidation } from '@/composables/useUtils';
import PageHeader from '@/components/layout/PageHeader.vue';
import userService from '@/services/user.service';
import songService from '@/services/song.service';
import playlistService from '@/services/playlist.service';
import submissionService from '@/services/submission.service';
import type { UserRole } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const { errors, validateEmail, validateRequired, validateMinLength, clearErrors, setError: setFormError } = useFormValidation();

// Loading states
const loading = ref({
    users: false,
    songs: false,
    playlists: false,
    submissions: false,
    activity: false
});

// Statistics
const stats = ref({
    totalUsers: 0,
    totalSongs: 0,
    totalPlaylists: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0
});

// Modal states
const showAddUserModal = ref(false);
const addingUser = ref(false);
const userError = ref('');
const newUser = ref({
    username: '',
    email: '',
    password: '',
    role: 'artist' as UserRole
});

// Activities
const activities = ref<{
    type: string;
    title: string;
    description: string;
    timestamp: Date;
}[]>([]);

onMounted(() => {
    loadDashboardData();
    loadRecentActivity();
});

async function loadDashboardData() {
    // Load user stats
    await loadUserStats();

    // Load song stats
    await loadSongStats();

    // Load playlist stats
    await loadPlaylistStats();

    // Load submission stats
    await loadSubmissionStats();
}

async function loadUserStats() {
    loading.value.users = true;
    try {
        const response = await userService.getUsers();
        stats.value.totalUsers = response.total;
    } catch (err: any) {
        console.error('Error loading user stats:', err);
    } finally {
        loading.value.users = false;
    }
}

async function loadSongStats() {
    loading.value.songs = true;
    try {
        const response = await songService.getSongs();
        stats.value.totalSongs = response.total;
    } catch (err: any) {
        console.error('Error loading song stats:', err);
    } finally {
        loading.value.songs = false;
    }
}

async function loadPlaylistStats() {
    loading.value.playlists = true;
    try {
        const response = await playlistService.getPlaylists();
        stats.value.totalPlaylists = response.total;
    } catch (err: any) {
        console.error('Error loading playlist stats:', err);
    } finally {
        loading.value.playlists = false;
    }
}

async function loadSubmissionStats() {
    loading.value.submissions = true;
    try {
        const response = await submissionService.getSubmissions();
        stats.value.totalSubmissions = response.total;

        // Count submissions by status
        stats.value.pendingSubmissions = response.data.filter(s => s.status === 'pending').length;
        stats.value.approvedSubmissions = response.data.filter(s => s.status === 'approved').length;
        stats.value.rejectedSubmissions = response.data.filter(s => s.status === 'rejected').length;
    } catch (err: any) {
        console.error('Error loading submission stats:', err);
    } finally {
        loading.value.submissions = false;
    }
}

function loadRecentActivity() {
    loading.value.activity = true;

    // In a real app, you would fetch this from an API
    // For now, let's use some mock data
    setTimeout(() => {
        activities.value = [
            {
                type: 'user',
                title: 'New User Registration',
                description: 'User "johndoe" registered as an Artist',
                timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
            },
            {
                type: 'submission',
                title: 'New Submission',
                description: 'Song "Summer Vibes" was submitted to "Chill Beats"',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                type: 'approval',
                title: 'Submission Approved',
                description: 'Song "Night Drive" was approved for "Late Night Drives"',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
            },
            {
                type: 'playlist',
                title: 'New Playlist',
                description: 'Playlist "Morning Coffee" was created',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
                type: 'rejection',
                title: 'Submission Rejected',
                description: 'Song "Party Time" was rejected from "Chill Vibes"',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28) // 28 hours ago
            }
        ];

        loading.value.activity = false;
    }, 1000);
}

function getActivityIcon(type: string) {
    switch (type) {
        case 'user': return personCircle;
        case 'submission': return send;
        case 'approval': return checkmark;
        case 'rejection': return close;
        case 'playlist': return listCircle;
        default: return document;
    }
}

function getActivityColor(type: string) {
    switch (type) {
        case 'user': return 'primary';
        case 'submission': return 'tertiary';
        case 'approval': return 'success';
        case 'rejection': return 'danger';
        case 'playlist': return 'secondary';
        default: return 'medium';
    }
}

function formatDate(date: Date) {
    // Format the date to a readable string
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

function showUserModal() {
    showAddUserModal.value = true;
    userError.value = '';
    clearErrors();
    newUser.value = {
        username: '',
        email: '',
        password: '',
        role: 'artist'
    };
}

async function addNewUser() {
    clearErrors();
    userError.value = '';

    // Form validation
    let isValid = true;

    if (!validateRequired(newUser.value.username, 'username')) {
        isValid = false;
    } else if (!validateMinLength(newUser.value.username, 'username', 3)) {
        isValid = false;
    }

    if (!validateRequired(newUser.value.email, 'email')) {
        isValid = false;
    } else if (!validateEmail(newUser.value.email, 'email')) {
        isValid = false;
    }

    if (!validateRequired(newUser.value.password, 'password')) {
        isValid = false;
    } else if (!validateMinLength(newUser.value.password, 'password', 8)) {
        setFormError('password', 'Password must be at least 8 characters long');
        isValid = false;
    }

    if (!isValid) return;

    addingUser.value = true;

    try {
        // In a real app, you would create the user through an API call
        await userService.createUser({
            username: newUser.value.username,
            email: newUser.value.email,
            password: newUser.value.password,
            role: newUser.value.role
        });

        // Close modal
        showAddUserModal.value = false;

        // Show success toast
        const toast = await toastController.create({
            message: 'User created successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

        // Refresh user stats
        await loadUserStats();
    } catch (err: any) {
        userError.value = err.message || 'Failed to create user';
        console.error('Error creating user:', err);

        const toast = await toastController.create({
            message: 'Failed to create user',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        addingUser.value = false;
    }
}

function goPlatforms() {
    router.push('/tabs/admin/platforms');
}

function goSystemLogs() {
    router.push('/tabs/admin/logs');
}

function goSettings() {
    router.push('/tabs/admin/settings');
}
</script>

<style scoped>
.error-message {
    color: var(--ion-color-danger);
    font-size: 12px;
    margin: 4px 16px;
}

.stat-card ion-card-content {
    display: flex;
    align-items: center;
    padding: 16px;
}

.stat-icon {
    font-size: 48px;
    margin-right: 16px;
}

.stat-info {
    flex: 1;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--ion-color-dark);
}

.stat-label {
    color: var(--ion-color-medium);
    font-size: 0.9rem;
}

.submissions-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.stat-block {
    text-align: center;
    flex: 1;
    padding: 8px;
}

ion-button[expand="block"] {
    margin-top: 16px;
}
</style>
