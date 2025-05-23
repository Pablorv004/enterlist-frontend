<template>
    <ion-page>
        <app-header title="Dashboard"></app-header>

        <ion-content :fullscreen="true" class="dashboard-content">
            <div class="dashboard-container">
                <!-- Welcome Header -->
                <div class="welcome-header">
                    <h1>Welcome Back, {{ user?.username }}</h1>
                    <p>Manage your playlists and review submissions from artists</p>
                </div>

                <!-- Stats Cards -->
                <ion-grid class="stats-grid">
                    <ion-row>
                        <ion-col size="12" size-md="4">
                            <ion-card class="stats-card">
                                <ion-card-content>
                                    <div class="stats-icon">
                                        <ion-icon :icon="mailUnreadIcon"></ion-icon>
                                    </div>
                                    <div class="stats-info">
                                        <div class="stats-value">{{ pendingSubmissionsCount }}</div>
                                        <div class="stats-label">Pending Submissions</div>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>

                        <ion-col size="12" size-md="4">
                            <ion-card class="stats-card">
                                <ion-card-content>
                                    <div class="stats-icon">
                                        <ion-icon :icon="musicalNotesIcon"></ion-icon>
                                    </div>
                                    <div class="stats-info">
                                        <div class="stats-value">{{ playlistsCount }}</div>
                                        <div class="stats-label">Active Playlists</div>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>

                        <ion-col size="12" size-md="4">
                            <ion-card class="stats-card">
                                <ion-card-content>
                                    <div class="stats-icon">
                                        <ion-icon :icon="checkmarkCircleIcon"></ion-icon>
                                    </div>
                                    <div class="stats-info">
                                        <div class="stats-value">{{ totalApprovedCount }}</div>
                                        <div class="stats-label">Approved Tracks</div>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h2>Quick Actions</h2>

                    <ion-grid class="actions-grid">
                        <ion-row>
                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/playlist-maker/submissions" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="mailUnreadIcon"></ion-icon>
                                        <span>Review Submissions</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/playlist-maker/playlists" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="listIcon"></ion-icon>
                                        <span>Manage Playlists</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/playlist-maker/linked-accounts" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="linkIcon"></ion-icon>
                                        <span>Connected Accounts</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/playlist-maker/profile" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="personIcon"></ion-icon>
                                        <span>My Profile</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>

                <!-- Recent Submissions -->
                <div class="recent-submissions">
                    <div class="section-header">
                        <h2>Recent Submissions</h2>
                        <ion-button fill="clear" size="small" router-link="/playlist-maker/submissions">
                            View All
                            <ion-icon :icon="arrowForwardIcon" slot="end"></ion-icon>
                        </ion-button>
                    </div>

                    <div v-if="loadingSubmissions" class="loading-container">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading submissions...</p>
                    </div>                    <empty-state-display 
                        v-else-if="recentSubmissions.length === 0"
                        :icon="mailUnreadIcon"
                        title="No Submissions Yet"
                        message="You don't have any submissions to review."
                        resource-type="playlist-submissions">
                    </empty-state-display>

                    <ion-list v-else class="submissions-list">
                        <ion-item v-for="submission in recentSubmissions" :key="submission.submission_id"
                            :router-link="`/playlist-maker/submissions/${submission.submission_id}`" :detail="true"
                            class="submission-item">
                            <ion-thumbnail slot="start" class="submission-thumbnail">
                                <img :src="submission.song?.cover_image_url || '/assets/default-album-cover.png'"
                                    :alt="submission.song?.title" />
                            </ion-thumbnail>

                            <ion-label>
                                <h3>{{ submission.song?.title }}</h3>
                                <p>{{ submission.song?.artist_name_on_platform }}</p>
                                <div class="submission-meta">
                                    <span class="submission-playlist">
                                        <ion-icon :icon="musicalNotesIcon" class="meta-icon"></ion-icon>
                                        {{ submission.playlist?.name }}
                                    </span>
                                    <span class="submission-date">
                                        <ion-icon :icon="calendarIcon" class="meta-icon"></ion-icon>
                                        {{ formatDate(submission.submitted_at) }}
                                    </span>
                                </div>
                            </ion-label>

                            <ion-badge :color="getStatusColor(submission.status)" slot="end">
                                {{ formatStatus(submission.status) }}
                            </ion-badge>
                        </ion-item>
                    </ion-list>
                </div>

                <!-- My Playlists -->
                <div class="my-playlists">
                    <div class="section-header">
                        <h2>My Playlists</h2>
                        <ion-button fill="clear" size="small" router-link="/playlist-maker/playlists">
                            View All
                            <ion-icon :icon="arrowForwardIcon" slot="end"></ion-icon>
                        </ion-button>
                    </div>

                    <div v-if="loadingPlaylists" class="loading-container">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading playlists...</p>
                    </div>                    <empty-state-display 
                        v-else-if="recentPlaylists.length === 0"
                        :icon="musicalNotesIcon"
                        title="No Playlists Yet"
                        message="Connect your music accounts to import your playlists."
                        resource-type="playlists">
                        <template #actions>
                            <ion-button router-link="/playlist-maker/linked-accounts">
                                Connect Accounts
                            </ion-button>
                        </template>
                    </empty-state-display>

                    <ion-grid v-else class="playlists-grid">
                        <ion-row>
                            <ion-col size="12" size-sm="6" size-md="4" size-lg="3" v-for="playlist in recentPlaylists"
                                :key="playlist.playlist_id">
                                <ion-card button router-link="/playlist-maker/playlists" class="playlist-card">
                                    <div class="playlist-img-container">
                                        <img :src="playlist.cover_image_url || '/assets/default-playlist-cover.png'"
                                            :alt="playlist.name" class="playlist-img" />
                                        <div class="playlist-platform">
                                            <img :src="getPlatformIcon(playlist.platform?.name)"
                                                :alt="playlist.platform?.name" class="platform-icon" />
                                        </div>
                                    </div>

                                    <ion-card-content>
                                        <h3 class="playlist-name">{{ playlist.name }}</h3>
                                        <p class="playlist-details">
                                            <span class="playlist-followers">
                                                {{ formatFollowers(playlist.follower_count) }} followers
                                            </span>
                                            <span v-if="playlist.genre" class="playlist-genre">
                                                • {{ playlist.genre }}
                                            </span>
                                        </p>
                                        <div class="playlist-submissions">
                                            <ion-badge color="light">
                                                {{ getPlaylistSubmissionCount(playlist.playlist_id) }} submissions
                                            </ion-badge>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>

                <!-- Earnings Chart (if they have earnings) -->
                <div v-if="hasEarnings" class="earnings-section">
                    <div class="section-header">
                        <h2>Recent Earnings</h2>
                    </div>

                    <ion-card class="earnings-card">
                        <ion-card-header>
                            <ion-card-title>Earnings Overview</ion-card-title>
                            <ion-card-subtitle>Last 30 days</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <div class="total-earnings">
                                <h3>{{ formatCurrency(totalEarnings) }}</h3>
                                <p>Total Earned</p>
                            </div>

                            <div class="chart-container">
                                <!-- In a real implementation, this would be a chart component -->
                                <div class="placeholder-chart">
                                    <div class="chart-bar" v-for="(value, index) in earningsData" :key="index"
                                        :style="{ height: `${(value / Math.max(...earningsData)) * 100}%` }">
                                    </div>
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
    IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonIcon, IonButton, IonList, IonItem, IonThumbnail, IonLabel, IonBadge,
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner
} from '@ionic/vue';
import {
    mailUnread, musicalNotes, checkmarkCircle, listOutline, linkOutline,
    personOutline, arrowForward, calendarOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import { PlaylistService } from '@/services/PlaylistService';
import { SubmissionService } from '@/services/SubmissionService';
import { useAuthStore } from '@/store';
import { Playlist, Submission, SubmissionStatus } from '@/types';

export default defineComponent({
    name: 'PlaylistMakerDashboard',    components: {
        IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
        IonIcon, IonButton, IonList, IonItem, IonThumbnail, IonLabel, IonBadge,
        IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner,
        AppHeader, EmptyStateDisplay
    },
    setup() {
        const authStore = useAuthStore();
        const user = computed(() => authStore.user);

        const playlistsCount = ref(0);
        const pendingSubmissionsCount = ref(0);
        const totalApprovedCount = ref(0);

        const recentSubmissions = ref<Submission[]>([]);
        const recentPlaylists = ref<Playlist[]>([]);
        const loadingSubmissions = ref(true);
        const loadingPlaylists = ref(true);

        // Mock earnings data for demo purposes
        const hasEarnings = ref(true);
        const totalEarnings = ref(243.50);
        const earningsData = ref([12, 15, 8, 22, 30, 25, 18, 12, 10, 15, 22, 28, 32, 25]);

        // Submissions per playlist (for badge counts)
        const playlistSubmissions = ref<Record<string, number>>({});

        onMounted(async () => {
            await Promise.all([
                fetchStats(),
                fetchRecentSubmissions(),
                fetchPlaylists()
            ]);
        });

        const fetchStats = async () => {
            try {
                if (!user.value) return;
                
                const pendingResponse = await SubmissionService.getSubmissionsByCreator(
                    user.value.user_id,
                    0,
                    1,
                    SubmissionStatus.PENDING
                );
                pendingSubmissionsCount.value = pendingResponse.total;

                const approvedResponse = await SubmissionService.getSubmissionsByCreator(
                    user.value.user_id,
                    0,
                    1,
                    SubmissionStatus.APPROVED
                );
                totalApprovedCount.value = approvedResponse.total;
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        };

        const fetchRecentSubmissions = async () => {
            try {
                loadingSubmissions.value = true;

                if (!user.value) return;

                const response = await SubmissionService.getSubmissionsByArtist(user.value.user_id, 0, 5);
                recentSubmissions.value = response.data;

                // Count submissions per playlist
                response.data.forEach((submission: { playlist_id: string | number; }) => {
                    if (submission.playlist_id) {
                        playlistSubmissions.value[submission.playlist_id] =
                            (playlistSubmissions.value[submission.playlist_id] || 0) + 1;
                    }
                });
            } catch (error) {
                console.error('Failed to fetch recent submissions:', error);
            } finally {
                loadingSubmissions.value = false;
            }
        };

        const fetchPlaylists = async () => {
            try {
                loadingPlaylists.value = true;

                if (!user.value) return;

                const response = await PlaylistService.getPlaylistsByCreator(user.value.user_id, 0, 4);
                recentPlaylists.value = response.data;
            } catch (error) {
                console.error('Failed to fetch playlists:', error);
            } finally {
                loadingPlaylists.value = false;
            }
        };

        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        };

        const formatStatus = (status: SubmissionStatus): string => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return 'Pending';
                case SubmissionStatus.UNDER_REVIEW:
                    return 'In Review';
                case SubmissionStatus.APPROVED:
                    return 'Approved';
                case SubmissionStatus.REJECTED:
                    return 'Rejected';
                default:
                    return 'Unknown';
            }
        };

        const getStatusColor = (status: SubmissionStatus): string => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return 'warning';
                case SubmissionStatus.UNDER_REVIEW:
                    return 'secondary';
                case SubmissionStatus.APPROVED:
                    return 'success';
                case SubmissionStatus.REJECTED:
                    return 'medium';
                default:
                    return 'medium';
            }
        };

        const formatFollowers = (count?: number): string => {
            if (!count) return '0';
            return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();
        };

        const formatCurrency = (amount: number): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        };        const getPlatformIcon = (platformName?: string): string => {
            if (!platformName) return '@/assets/logo.png';

            const platform = platformName.toLowerCase();
            if (platform.includes('spotify')) {
                return '@/assets/logo.png';
            } else if (platform.includes('apple')) {
                return '@/assets/logo.png';
            } else if (platform.includes('youtube')) {
                return '@/assets/logo.png';
            }

            return '@/assets/logo.png';
        };

        const getPlaylistSubmissionCount = (playlistId: string): number => {
            return playlistSubmissions.value[playlistId] || 0;
        };

        return {
            user,
            playlistsCount,
            pendingSubmissionsCount,
            totalApprovedCount,
            recentSubmissions,
            recentPlaylists,
            loadingSubmissions,
            loadingPlaylists,
            hasEarnings,
            totalEarnings,
            earningsData,
            mailUnreadIcon: mailUnread,
            musicalNotesIcon: musicalNotes,
            checkmarkCircleIcon: checkmarkCircle,
            listIcon: listOutline,
            linkIcon: linkOutline,
            personIcon: personOutline,
            arrowForwardIcon: arrowForward,
            calendarIcon: calendarOutline,
            formatDate,
            formatStatus,
            getStatusColor,
            formatFollowers,
            formatCurrency,
            getPlatformIcon,
            getPlaylistSubmissionCount
        };
    }
});
</script>

<style scoped>
.dashboard-content {
    --background: #f8f9fa;
}

.dashboard-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
}

.welcome-header {
    margin-bottom: 1.5rem;
    text-align: center;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.welcome-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    text-align: center;
}

.welcome-header p {
    font-size: 1.1rem;
    color: var(--ion-color-medium);
    margin: 0;
}

/* Stats Cards */
.stats-grid {
    margin-bottom: 2rem;
}

.stats-card {
    margin: 0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats-card ion-card-content {
    padding: 1.25rem;
    display: flex;
    align-items: center;
}

.stats-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--ion-color-primary);
    color: white;
    margin-right: 1rem;
}

.stats-icon ion-icon {
    font-size: 1.75rem;
}

.stats-info {
    flex: 1;
}

.stats-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.25rem;
}

.stats-label {
    font-size: 0.9rem;
    color: var(--ion-color-medium);
}

/* Quick Actions */
.quick-actions {
    margin-bottom: 2.5rem;
}

.quick-actions h2,
.section-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem;
    text-align: center;
}

.actions-grid {
    --ion-grid-padding: 0;
}

.action-card {
    margin: 0;
    border-radius: 12px;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s;
}

.action-card:hover {
    transform: translateY(-4px);
}

.action-card ion-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 1.5rem 1rem;
}

.action-card ion-icon {
    font-size: 2rem;
    color: var(--ion-color-primary);
    margin-bottom: 0.75rem;
}

.action-card span {
    font-weight: 500;
}

/* Section Headers */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.section-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem;
    text-align: center;
}

/* Loading and Empty States */
.loading-container,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
}

.empty-icon {
    font-size: 3rem;
    color: var(--ion-color-medium);
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin: 0 0 0.5rem;
    font-weight: 600;
}

.empty-state p {
    color: var(--ion-color-medium);
    margin: 0 0 1.5rem;
}

/* Submissions List */
.submissions-list {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 2rem;
}

.submission-item {
    --padding-start: 1rem;
    --inner-padding-end: 1rem;
}

.submission-thumbnail {
    --border-radius: 8px;
    width: 50px;
    height: 50px;
}

.submission-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.meta-icon {
    vertical-align: middle;
    margin-right: 0.25rem;
}

/* Playlists Grid */
.playlists-grid {
    --ion-grid-padding: 0;
    margin-bottom: 2rem;
}

.playlist-card {
    margin: 0;
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s;
}

.playlist-card:hover {
    transform: translateY(-4px);
}

.playlist-img-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
}

.playlist-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.playlist-platform {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.platform-icon {
    width: 16px;
    height: 16px;
}

.playlist-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-details {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-submissions {
    margin-top: auto;
}

/* Earnings Section */
.earnings-section {
    margin-bottom: 2rem;
}

.earnings-card {
    border-radius: 12px;
    overflow: hidden;
    margin: 0;
}

.total-earnings {
    text-align: center;
    margin-bottom: 1.5rem;
}

.total-earnings h3 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--ion-color-success);
    margin: 0 0 0.25rem;
}

.total-earnings p {
    font-size: 1rem;
    color: var(--ion-color-medium);
    margin: 0;
}

.chart-container {
    height: 200px;
    margin-top: 1.5rem;
}

.placeholder-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 100%;
}

.chart-bar {
    width: 6%;
    background: var(--ion-color-primary);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
}
</style>
