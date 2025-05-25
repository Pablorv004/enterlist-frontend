<template>
    <ion-page>
        <app-header title="Artist Dashboard"></app-header>

        <ion-content :fullscreen="true" class="dashboard-content">
            <div class="dashboard-container">
                <!-- Welcome Header -->
                <div class="welcome-header">
                    <h1>Welcome Back, {{ user?.username }}</h1>
                    <p>Manage your songs and submissions to playlists</p>
                </div>

                <!-- Stats Cards -->
                <ion-grid class="stats-grid">
                    <ion-row>
                        <ion-col size="12" size-md="3">
                            <ion-card class="stats-card">
                                <ion-card-content>
                                    <div class="stats-icon">
                                        <ion-icon :icon="hourglassIcon"></ion-icon>
                                    </div>
                                    <div class="stats-info">
                                        <div class="stats-value">{{ stats.pending || 0 }}</div>
                                        <div class="stats-label">Pending</div>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>

                        <ion-col size="12" size-md="3">
                            <ion-card class="stats-card">
                                <ion-card-content>
                                    <div class="stats-icon">
                                        <ion-icon :icon="searchIcon"></ion-icon>
                                    </div>
                                    <div class="stats-info">
                                        <div class="stats-value">{{ stats.underReview || 0 }}</div>
                                        <div class="stats-label">Under Review</div>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>

                        <ion-col size="12" size-md="3">
                            <ion-card class="stats-card">
                                <ion-card-content>
                                    <div class="stats-icon">
                                        <ion-icon :icon="checkmarkIcon"></ion-icon>
                                    </div>
                                    <div class="stats-info">
                                        <div class="stats-value">{{ stats.approved || 0 }}</div>
                                        <div class="stats-label">Approved</div>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </ion-col>

                        <ion-col size="12" size-md="3">
                            <ion-card class="stats-card">
                                <ion-card-content>
                                    <div class="stats-icon">
                                        <ion-icon :icon="closeIcon"></ion-icon>
                                    </div>
                                    <div class="stats-info">
                                        <div class="stats-value">{{ stats.rejected || 0 }}</div>
                                        <div class="stats-label">Rejected</div>
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
                                <ion-card button router-link="/artist/submissions/new" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="addIcon"></ion-icon>
                                        <span>Submit New Song</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/artist/submissions" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="documentTextIcon"></ion-icon>
                                        <span>My Submissions</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/artist/songs" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="musicalNotesIcon"></ion-icon>
                                        <span>My Songs</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/artist/profile" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="personIcon"></ion-icon>
                                        <span>My Profile</span>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="6" size-md="3">
                                <ion-card button router-link="/artist/linked-accounts" class="action-card">
                                    <ion-card-content>
                                        <ion-icon :icon="linkIcon"></ion-icon>
                                        <span>Linked Accounts</span>
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
                        <ion-button fill="clear" size="small" router-link="/artist/submissions">
                            View All
                            <ion-icon :icon="arrowForwardIcon" slot="end"></ion-icon>
                        </ion-button>
                    </div>

                    <div v-if="loading.submissions" class="loading-container">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading submissions...</p>
                    </div>                    <empty-state-display
                        v-else-if="submissions.length === 0"
                        :icon="documentTextIcon"
                        title="No Submissions Yet"
                        message="Start submitting your music to playlists"
                        resource-type="submissions">
                        <template #actions>
                            <ion-button router-link="/artist/submissions/new">
                                Submit a Song
                            </ion-button>
                        </template>
                    </empty-state-display>

                    <ion-list v-else class="submissions-list">
                        <ion-item v-for="submission in submissions" :key="submission.submission_id"
                            :router-link="`/artist/submissions/${submission.submission_id}`" :detail="true"
                            class="submission-item">
                            <ion-thumbnail slot="start" class="submission-thumbnail">
                                <img :src="submission.song?.cover_image_url || '/assets/default-album-cover.png'"
                                    :alt="submission.song?.title" />
                            </ion-thumbnail>

                            <ion-label>
                                <h3>{{ submission.song?.title }}</h3>
                                <p>{{ submission.playlist?.name }}</p>
                                <div class="submission-meta">
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

                <!-- Your Songs -->
                <div class="my-songs">
                    <div class="section-header">
                        <h2>Your Songs</h2>
                        <ion-button fill="clear" size="small" router-link="/artist/songs">
                            View All
                            <ion-icon :icon="arrowForwardIcon" slot="end"></ion-icon>
                        </ion-button>
                    </div>

                    <div v-if="loading.songs" class="loading-container">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading songs...</p>
                    </div>                    <empty-state-display
                        v-else-if="songs.length === 0"
                        :icon="musicalNotesIcon"
                        title="No Songs Yet"
                        message="Import songs from your connected platforms"
                        resource-type="songs">
                        <template #actions>
                            <ion-button router-link="/artist/linked-accounts">
                                Connect Platforms
                            </ion-button>
                        </template>
                    </empty-state-display>

                    <ion-grid v-else class="songs-grid">
                        <ion-row>
                            <ion-col size="12" size-sm="6" size-md="4" size-lg="3" v-for="song in songs"
                                :key="song.song_id">
                                <ion-card button :router-link="`/artist/songs/${song.song_id}`" class="song-card">
                                    <div class="song-img-container">
                                        <img :src="song.cover_image_url || '/assets/default-album-cover.png'"
                                            :alt="song.title" class="song-img" />
                                        <div class="song-platform">
                                            <ion-icon :icon="getPlatformIcon(song.platform_id)" class="platform-icon"></ion-icon>
                                        </div>
                                    </div>

                                    <ion-card-content>
                                        <h3 class="song-name">{{ song.title }}</h3>
                                        <p class="song-details">{{ song.album_name || 'Single' }}</p>
                                        <div class="song-platform-name">
                                            <span>{{ getPlatformName(song.platform_id) }}</span>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </div>

                <!-- Help Card -->
                <ion-card class="help-card">
                    <ion-card-content>
                        <div class="help-content">
                            <div class="help-icon-container">
                                <ion-icon :icon="helpCircleIcon" class="help-icon"></ion-icon>
                            </div>
                            <div class="help-text">
                                <h3>Need Help?</h3>
                                <p>Learn how to maximize your chances of playlist placement</p>
                            </div>
                            <ion-button fill="outline" class="help-button">
                                Read Guide
                            </ion-button>
                        </div>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonBadge,
    IonSpinner
} from '@ionic/vue';
import {
    add as addIcon,
    home as homeIcon,
    documentText as documentTextIcon,
    musicalNotes as musicalNotesIcon,
    person as personIcon,
    hourglass as hourglassIcon,
    search as searchIcon,
    checkmarkCircle as checkmarkIcon,
    closeCircle as closeIcon,
    arrowForward as arrowForwardIcon,
    helpCircle as helpCircleIcon,
    calendar as calendarIcon,
    link as linkIcon
} from 'ionicons/icons';
import { useAuthStore, useSongStore, useSubmissionStore } from '@/store';
import { SubmissionStatus, Song, Submission } from '@/types';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import spotifyLogo from '@/assets/spotify.png';
import youtubeLogo from '@/assets/youtube.png';

export default defineComponent({
    name: 'ArtistDashboard',
    components: {
        AppHeader,
        IonPage,
        IonContent,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonCardContent,
        IonButton,
        IonIcon,
        IonList,
        IonItem,
        IonThumbnail,        IonLabel,
        IonBadge,
        IonSpinner,
        EmptyStateDisplay
    },
    setup() {
        const authStore = useAuthStore();
        const songStore = useSongStore();
        const submissionStore = useSubmissionStore();

        const user = computed(() => authStore.user);
        const submissions = ref<Submission[]>([]);
        const songs = ref<Song[]>([]);
        const stats = ref({
            pending: 0,
            underReview: 0,
            approved: 0,
            rejected: 0
        });

        const loading = ref({
            submissions: true,
            songs: true,
            stats: true
        });

        // Format date to a readable format
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(date);
        };

        // Get status color based on submission status
        const getStatusColor = (status: SubmissionStatus) => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return 'warning';
                case SubmissionStatus.UNDER_REVIEW:
                    return 'tertiary';
                case SubmissionStatus.APPROVED:
                    return 'success';
                case SubmissionStatus.REJECTED:
                    return 'danger';
                default:
                    return 'medium';
            }
        };

        // Format status for display
        const formatStatus = (status: SubmissionStatus) => {
            return status.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
        };        // Get platform icon based on platform ID
        const getPlatformIcon = (platformId: number) => {
            switch (platformId) {
                case 1:
                    return spotifyLogo;
                case 3:
                    return youtubeLogo;
                default:
                    return musicalNotesIcon;
            }
        };

        // Get platform name based on platform ID
        const getPlatformName = (platformId: number) => {
            switch (platformId) {
                case 1:
                    return 'Spotify';
                case 3:
                    return 'YouTube';
                default:
                    return 'Unknown Platform';
            }
        };

        // Load dashboard data
        const loadDashboardData = async () => {
            if (!user.value?.user_id) return;

            // Load submissions
            loading.value.submissions = true;
            try {
                await submissionStore.fetchSubmissionsByArtist(user.value.user_id, 0, 5);
                submissions.value = submissionStore.submissions;

                // Calculate stats
                stats.value = {
                    pending: submissionStore.pendingSubmissions.length,
                    underReview: submissionStore.underReviewSubmissions.length,
                    approved: submissionStore.approvedSubmissions.length,
                    rejected: submissionStore.rejectedSubmissions.length
                };
            } catch (error) {
                console.error('Failed to load submissions:', error);
            } finally {
                loading.value.submissions = false;
                loading.value.stats = false;
            }

            // Load songs
            loading.value.songs = true;
            try {
                await songStore.fetchSongsByArtist(user.value.user_id, 0, 5);
                songs.value = songStore.songs;
            } catch (error) {
                console.error('Failed to load songs:', error);
            } finally {
                loading.value.songs = false;
            }
        };

        onMounted(() => {
            loadDashboardData();
        });

        return {
            user,
            submissions,
            songs,
            stats,
            loading,
            formatDate,
            getStatusColor,
            formatStatus,
            getPlatformIcon,
            getPlatformName,            // Icons
            addIcon,
            homeIcon,
            documentTextIcon,
            musicalNotesIcon,
            personIcon,
            hourglassIcon,
            searchIcon,
            checkmarkIcon,
            closeIcon,
            arrowForwardIcon,
            helpCircleIcon,
            calendarIcon,
            linkIcon
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
    text-align: center;
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
    margin-right: 1rem;
}

.stats-icon ion-icon {
    font-size: 1.75rem;
    color: white;
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

/* Use existing colors for the stats icons */
.stats-icon:nth-child(1) {
    background-color: var(--ion-color-warning);
}

.stats-icon:nth-child(2) {
    background-color: var(--ion-color-tertiary);
}

.stats-icon:nth-child(3) {
    background-color: var(--ion-color-success);
}

.stats-icon:nth-child(4) {
    background-color: var(--ion-color-danger);
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
    margin: 0;
    text-align: left;
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
.recent-submissions {
    margin-bottom: 2.5rem;
}

.submissions-list {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;
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

/* Songs Grid */
.my-songs {
    margin-bottom: 2.5rem;
}

.songs-grid {
    --ion-grid-padding: 0;
}

.song-card {
    margin: 0;
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s;
}

.song-card:hover {
    transform: translateY(-4px);
}

.song-img-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
}

.song-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.song-platform {
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
    font-size: 16px;
    color: white;
}

.song-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-details {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-platform-name {
    font-size: 0.75rem;
    color: var(--ion-color-medium);
}

/* Help Card */
.help-card {
    border-radius: 12px;
    overflow: hidden;
    margin: 0 0 2rem;
    background-color: #f0f7ff;
}

.help-content {
    display: flex;
    align-items: center;
    padding: 1rem;
}

.help-icon-container {
    margin-right: 1rem;
}

.help-icon {
    font-size: 2.5rem;
    color: var(--ion-color-primary);
}

.help-text {
    flex: 1;
}

.help-text h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
}

.help-text p {
    font-size: 0.9rem;
    color: var(--ion-color-medium);
    margin: 0;
}

.help-button {
    margin-left: 1rem;
}
</style>
