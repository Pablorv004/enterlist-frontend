<template>
    <ion-page>
        <page-header title="Dashboard" icon="home"></page-header>

        <ion-content :fullscreen="true" class="bg-dashboard">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Dashboard</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="dashboard-container ion-padding">                <ion-card class="welcome-card glass-effect animate__animated animate__fadeInDown">
                    <ion-card-header>
                        <ion-card-title>
                            <font-awesome-icon icon="home" class="welcome-icon pulse-animation" /> 
                            Welcome, {{ authStore.user?.username }}!
                        </ion-card-title>
                        <ion-card-subtitle class="role-label">{{ roleLabel }}</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                        <p class="overview-text">Here's your activity overview:</p>
                    </ion-card-content>
                </ion-card>

                <!-- Artist specific content -->                <div v-if="isArtist">
                    <ion-grid>
                        <ion-row>
                            <ion-col size="12" size-md="6">
                                <ion-card class="stats-card glass-effect animate__animated animate__fadeInLeft">
                                    <ion-card-header>
                                        <font-awesome-icon icon="music" class="card-icon" />
                                        <ion-card-title>Your Songs</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <div v-if="loading.songs" class="loading-container">
                                            <ion-spinner name="dots"></ion-spinner>
                                        </div>
                                        <div v-else-if="songCount > 0" class="stats-container">
                                            <div class="stat-item">
                                                <div class="stat-number">{{ songCount }}</div>
                                                <div class="stat-label">Total Songs</div>
                                            </div>
                                            <ion-button router-link="/tabs/songs" fill="clear" class="view-all-btn">
                                                <font-awesome-icon icon="arrow-right" /> View All
                                            </ion-button>
                                        </div>
                                        <div v-else class="empty-state">
                                            <font-awesome-icon icon="plus-circle" class="empty-icon" />
                                            <p>You haven't added any songs yet.</p>
                                            <ion-button router-link="/tabs/songs/new" class="action-btn">
                                                <font-awesome-icon icon="plus" /> Add Your First Song
                                            </ion-button>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="12" size-md="6">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>Your Submissions</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <div v-if="loading.submissions">
                                            <ion-spinner></ion-spinner>
                                        </div>
                                        <div v-else-if="submissionsCount > 0" class="stats-container">
                                            <div class="stat-item">
                                                <div class="stat-number">{{ pendingCount }}</div>
                                                <div class="stat-label">Pending</div>
                                            </div>
                                            <div class="stat-item">
                                                <div class="stat-number">{{ approvedCount }}</div>
                                                <div class="stat-label">Approved</div>
                                            </div>
                                            <ion-button router-link="/tabs/submissions" fill="clear">View
                                                All</ion-button>
                                        </div>
                                        <div v-else>
                                            <p>You haven't submitted any songs yet.</p>
                                            <ion-button router-link="/tabs/submissions" fill="clear">Submit a
                                                Song</ion-button>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>

                <!-- Playlist maker specific content -->
                <div v-if="isPlaylistMaker">
                    <ion-grid>
                        <ion-row>
                            <ion-col size="12" size-md="6">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>Your Playlists</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <div v-if="loading.playlists">
                                            <ion-spinner></ion-spinner>
                                        </div>
                                        <div v-else-if="playlistCount > 0" class="stats-container">
                                            <div class="stat-item">
                                                <div class="stat-number">{{ playlistCount }}</div>
                                                <div class="stat-label">Total Playlists</div>
                                            </div>
                                            <ion-button router-link="/tabs/playlists" fill="clear">View All</ion-button>
                                        </div>
                                        <div v-else>
                                            <p>You haven't added any playlists yet.</p>
                                            <ion-button router-link="/tabs/playlists/new">Add Your First
                                                Playlist</ion-button>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="12" size-md="6">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>Pending Submissions</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <div v-if="loading.submissions">
                                            <ion-spinner></ion-spinner>
                                        </div>
                                        <div v-else-if="pendingSubmissionsCount > 0" class="stats-container">
                                            <div class="stat-item">
                                                <div class="stat-number">{{ pendingSubmissionsCount }}</div>
                                                <div class="stat-label">Submissions to Review</div>
                                            </div>
                                            <ion-button router-link="/tabs/submissions" fill="clear">Review
                                                Now</ion-button>
                                        </div>
                                        <div v-else>
                                            <p>No pending submissions to review.</p>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>

                <!-- Admin specific content -->
                <div v-if="isAdmin">
                    <ion-grid>
                        <ion-row>
                            <ion-col size="12" size-md="4">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>Users</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <div v-if="loading.users">
                                            <ion-spinner></ion-spinner>
                                        </div>
                                        <div v-else class="stats-container">
                                            <div class="stat-item">
                                                <div class="stat-number">{{ userCount }}</div>
                                                <div class="stat-label">Total Users</div>
                                            </div>
                                            <ion-button router-link="/tabs/admin/users" fill="clear">Manage</ion-button>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="12" size-md="4">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>Playlists</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <div v-if="loading.playlists">
                                            <ion-spinner></ion-spinner>
                                        </div>
                                        <div v-else class="stats-container">
                                            <div class="stat-item">
                                                <div class="stat-number">{{ adminPlaylistCount }}</div>
                                                <div class="stat-label">Total Playlists</div>
                                            </div>
                                            <ion-button router-link="/tabs/playlists" fill="clear">View</ion-button>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="12" size-md="4">
                                <ion-card>
                                    <ion-card-header>
                                        <ion-card-title>Submissions</ion-card-title>
                                    </ion-card-header>
                                    <ion-card-content>
                                        <div v-if="loading.submissions">
                                            <ion-spinner></ion-spinner>
                                        </div>
                                        <div v-else class="stats-container">
                                            <div class="stat-item">
                                                <div class="stat-number">{{ adminSubmissionCount }}</div>
                                                <div class="stat-label">Total Submissions</div>
                                            </div>
                                            <ion-button router-link="/tabs/submissions" fill="clear">View</ion-button>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>

                <!-- Recent activity section -->
                <ion-card class="ion-margin-top">
                    <ion-card-header>
                        <ion-card-title>Recent Activity</ion-card-title>
                    </ion-card-header>

                    <ion-card-content>
                        <ion-list v-if="loading.activity">
                            <ion-item>
                                <ion-spinner></ion-spinner>
                                <ion-label>Loading recent activity...</ion-label>
                            </ion-item>
                        </ion-list>
                        <ion-list v-else-if="recentActivity.length > 0">
                            <ion-item v-for="(activity, index) in recentActivity" :key="index">
                                <ion-icon :icon="getActivityIcon(activity.type)" slot="start"></ion-icon>
                                <ion-label>
                                    <h2>{{ activity.title }}</h2>
                                    <p>{{ activity.description }}</p>
                                    <p>{{ formatDate(activity.timestamp) }}</p>
                                </ion-label>
                            </ion-item>
                        </ion-list>
                        <p v-else>No recent activity to display.</p>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonIcon
} from '@ionic/vue';
import {
    musicalNote,
    checkmark,
    time,
    listCircle,
    personCircle,
    documentText
} from 'ionicons/icons';
import { useAuthStore } from '@/store/auth';
import PageHeader from '@/components/layout/PageHeader.vue';
import songService from '@/services/song.service';
import playlistService from '@/services/playlist.service';
import submissionService from '@/services/submission.service';
import userService from '@/services/user.service';
import { useApiStatus } from '@/composables/useUtils';

const authStore = useAuthStore();
const { loading: songsLoading, error: songsError } = useApiStatus();
const { loading: playlistsLoading, error: playlistsError } = useApiStatus();
const { loading: submissionsLoading, error: submissionsError } = useApiStatus();
const { loading: usersLoading, error: usersError } = useApiStatus();

const loading = ref({
    songs: false,
    playlists: false,
    submissions: false,
    users: false,
    activity: false
});

// Dummy data for demonstration
const songCount = ref(0);
const playlistCount = ref(0);
const submissionsCount = ref(0);
const pendingCount = ref(0);
const approvedCount = ref(0);
const pendingSubmissionsCount = ref(0);
const userCount = ref(0);
const adminPlaylistCount = ref(0);
const adminSubmissionCount = ref(0);

// Role based displays
const isArtist = computed(() => authStore.isArtist);
const isPlaylistMaker = computed(() => authStore.isPlaylistMaker);
const isAdmin = computed(() => authStore.isAdmin);

const roleLabel = computed(() => {
    if (isArtist.value) return 'Music Artist';
    if (isPlaylistMaker.value) return 'Playlist Curator';
    if (isAdmin.value) return 'Administrator';
    return 'User';
});

// Mock activity data
const recentActivity = ref([
    {
        type: 'submission',
        title: 'New submission',
        description: 'Your song "Summer Vibes" was submitted to "Chill Beats"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
        type: 'approval',
        title: 'Submission approved',
        description: 'Your song "Night Drive" was approved for "Late Night Drives"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
        type: 'playlist',
        title: 'New playlist',
        description: 'You created the playlist "Morning Coffee"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72) // 3 days ago
    }
]);

onMounted(async () => {
    if (isArtist.value) {
        await fetchArtistData();
    } else if (isPlaylistMaker.value) {
        await fetchPlaylistMakerData();
    } else if (isAdmin.value) {
        await fetchAdminData();
    }
});

async function fetchArtistData() {
    try {
        loading.value.songs = true;
        loading.value.submissions = true;
        const userId = authStore.user?.user_id;

        if (userId) {
            const songsResponse = await songService.getSongsByArtist(userId);
            songCount.value = songsResponse.total;

            const submissionsResponse = await submissionService.getSubmissionsByArtist(userId);
            submissionsCount.value = submissionsResponse.total;

            // Count pending and approved submissions
            pendingCount.value = submissionsResponse.data.filter(s => s.status === 'pending').length;
            approvedCount.value = submissionsResponse.data.filter(s => s.status === 'approved').length;
        }
    } catch (error) {
        console.error('Error fetching artist data:', error);
    } finally {
        loading.value.songs = false;
        loading.value.submissions = false;
    }
}

async function fetchPlaylistMakerData() {
    try {
        loading.value.playlists = true;
        loading.value.submissions = true;
        const userId = authStore.user?.user_id;

        if (userId) {
            const playlistsResponse = await playlistService.getPlaylistsByCreator(userId);
            playlistCount.value = playlistsResponse.total;

            // For each playlist, fetch pending submissions
            let totalPending = 0;
            for (const playlist of playlistsResponse.data) {
                const submissionsResponse = await submissionService.getSubmissionsByPlaylist(playlist.playlist_id);
                totalPending += submissionsResponse.data.filter(s => s.status === 'pending').length;
            }
            pendingSubmissionsCount.value = totalPending;
        }
    } catch (error) {
        console.error('Error fetching playlist maker data:', error);
    } finally {
        loading.value.playlists = false;
        loading.value.submissions = false;
    }
}

async function fetchAdminData() {
    try {
        loading.value.users = true;
        loading.value.playlists = true;
        loading.value.submissions = true;

        const usersResponse = await userService.getUsers();
        userCount.value = usersResponse.total;

        const playlistsResponse = await playlistService.getPlaylists();
        adminPlaylistCount.value = playlistsResponse.total;

        const submissionsResponse = await submissionService.getSubmissions();
        adminSubmissionCount.value = submissionsResponse.total;
    } catch (error) {
        console.error('Error fetching admin data:', error);
    } finally {
        loading.value.users = false;
        loading.value.playlists = false;
        loading.value.submissions = false;
    }
}

function getActivityIcon(type: string) {
    switch (type) {
        case 'submission':
            return musicalNote;
        case 'approval':
            return checkmark;
        case 'playlist':
            return listCircle;
        default:
            return documentText;
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
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables';
@import '../assets/styles/mixins';

.bg-dashboard {
    --ion-background-color: transparent;
    position: relative;
    
    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5) url('@/assets/blurred-blue-purple-bg.jpg') no-repeat center center / cover;
        background-blend-mode: darken;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: -1;
    }
}

.dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
    
    ion-card {
        margin: 16px 0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
    }
}

.welcome-card {
    border-left: 4px solid $primary-color;
    overflow: visible;
    
    ion-card-title {
        font-size: 1.6rem;
        display: flex;
        align-items: center;
        gap: 12px;
        color: white; /* Changed to white for better visibility */
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    
    .welcome-icon {
        color: $primary-color;
        filter: drop-shadow(0 0 5px rgba($primary-color, 0.7));
    }
    
    .role-label {
        margin-top: 8px;
        font-weight: 600; /* Using direct value */
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.8);
    }
    
    .overview-text {
        font-size: 1.1rem;
        color: white;
        margin-bottom: 0;
    }
}

.stats-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 16px;
}

.stat-item {
    text-align: center;
    padding: 16px;
    border-radius: $border-radius-md;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    flex: 1;
    transition: transform 0.3s ease;
    
    &:hover {
        transform: scale(1.05);
    }
}

.stat-number {
    font-size: 2.2rem;
    font-weight: $font-weight-bold;
    color: $primary-color;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.stat-label {
    font-size: 1rem;
    color: $dark-color;
    margin-top: 8px;
}

.stats-card {
    position: relative;
    overflow: visible;
    
    .card-icon {
        position: absolute;
        top: -15px;
        right: 20px;
        font-size: 1.2rem;
        background: $primary-color;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    ion-card-title {
        margin-top: 10px;
        font-size: 1.3rem;
        color: white;
    }
}

.loading-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    
    ion-spinner {
        --color: $primary-color;
        width: 40px;
        height: 40px;
    }
}

.empty-state {
    text-align: center;
    padding: 20px 10px;
    
    .empty-icon {
        font-size: 2.5rem;
        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 15px;
    }
    
    p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin-bottom: 20px;
    }
    
    .action-btn {
        --background: $primary-color;
        --border-radius: $border-radius-md;
        font-weight: 500; /* Using direct value */
    }
}

.view-all-btn {
    --color: $primary-color;
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 500; /* Using direct value */
    
    &:hover {
        --color: lighten($primary-color, 10%);
    }
}

// Animation classes
.animate__animated {
    animation-duration: 0.8s;
}

.animate__fadeInDown {
    animation: fadeInDown 0.8s ease forwards;
}

.animate__fadeInLeft {
    animation: fadeInLeft 0.8s ease forwards;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translate3d(0, -30px, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translate3d(-30px, 0, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

ion-segment {
    margin: 16px 0;
    --background: rgba(255, 255, 255, 0.1);
    border-radius: $border-radius-md;
    padding: 4px;
}

.activity-list {
    ion-item {
        --background: rgba(255, 255, 255, 0.1);
        margin-bottom: 8px;
        border-radius: $border-radius-md;
        --border-color: rgba(255, 255, 255, 0.2);
    }
}

@media (max-width: 768px) {
    .stats-container {
        flex-direction: column;
        align-items: stretch;
    }

    .stat-item {
        margin-bottom: 12px;
        text-align: center;
    }
}
</style>
