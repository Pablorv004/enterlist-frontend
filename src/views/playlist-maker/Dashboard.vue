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

                    <!-- Desktop Grid View -->
                    <ion-grid v-else class="playlists-grid desktop-only">
                        <ion-row>
                            <ion-col size="12" size-sm="6" size-md="4" size-lg="3" v-for="playlist in recentPlaylists"
                                :key="playlist.playlist_id">
                                <ion-card button @click="openPlaylistModal(playlist)" class="playlist-card">
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

                    <!-- Mobile List View -->
                    <ion-list v-else class="playlists-list mobile-only">
                        <ion-item v-for="playlist in recentPlaylists" :key="playlist.playlist_id"
                            class="playlist-item" @click="openPlaylistModal(playlist)">
                            <ion-thumbnail slot="start" class="playlist-thumbnail">
                                <img :src="playlist.cover_image_url || '/assets/default-playlist-cover.png'"
                                    :alt="playlist.name" />
                                <div class="playlist-platform-overlay">
                                    <img :src="getPlatformIcon(playlist.platform?.name)"
                                        :alt="playlist.platform?.name" class="platform-icon-small" />
                                </div>
                            </ion-thumbnail>

                            <ion-label>
                                <h3 class="playlist-name">{{ playlist.name }}</h3>
                                <p v-if="playlist.genre" class="playlist-genre">{{ playlist.genre }}</p>
                                <div class="playlist-meta">
                                    <span class="playlist-submissions-count">
                                        {{ getPlaylistSubmissionCount(playlist.playlist_id) }} submissions
                                    </span>
                                </div>
                            </ion-label>

                            <ion-button fill="clear" slot="end" @click.stop="openPlaylistModal(playlist)">
                                <ion-icon :icon="chevronForwardIcon" slot="icon-only"></ion-icon>
                            </ion-button>
                        </ion-item>
                    </ion-list>
                </div>

                <!-- Earnings Chart (if they have earnings) -->
                <div v-if="!loadingEarnings && earningsStats.length > 0" class="earnings-section">
                    <div class="section-header">
                        <h2>Recent Earnings</h2>
                    </div>
                    
                    <ion-card class="earnings-card">
                        <ion-card-header>
                            <ion-card-title>Earnings Overview</ion-card-title>
                            <ion-card-subtitle>Last 12 months</ion-card-subtitle>
                        </ion-card-header>
                        <ion-card-content>
                            <div class="total-earnings">
                                <h3>{{ formatCurrency(totalEarnings) }}</h3>
                                <p>Total Earned</p>
                            </div>
                            
                            <div class="chart-container">
                                <div v-if="loadingEarnings" class="loading-container">
                                    <ion-spinner name="crescent"></ion-spinner>
                                    <p>Loading earnings data...</p>
                                </div>
                                <div v-else-if="!chartData" class="no-earnings-message">
                                    <p>No earnings data available for the last 12 months</p>
                                </div>
                                <div v-else class="chart-wrapper">
                                    <Bar 
                                        :data="chartData" 
                                        :options="chartOptions" 
                                    />
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </div>
            </div>
        </ion-content>
        
        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="dashboard"></bottom-navigation>

        <!-- Playlist Details Modal -->
        <ion-modal :is-open="isPlaylistModalOpen" @didDismiss="closePlaylistModal">
            <playlist-details-modal
                v-if="selectedPlaylist"
                :playlist="selectedPlaylist"
                :playlist-stats="playlistStatsMap"
                @playlist-updated="onPlaylistUpdated"
                @view-submissions="onViewSubmissions"
            />
        </ion-modal>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import {
    IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonIcon, IonButton, IonList, IonItem, IonThumbnail, IonLabel, IonBadge,
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner
} from '@ionic/vue';
import {
    mailUnread, musicalNotes, checkmarkCircle, listOutline, linkOutline,
    personOutline, arrowForward, calendarOutline, chevronForward
} from 'ionicons/icons';
import { Bar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import PlaylistDetailsModal from '@/components/PlaylistDetailsModal.vue';
import { PlaylistService } from '@/services/PlaylistService';
import { SubmissionService } from '@/services/SubmissionService';
import { useAuthStore } from '@/store';
import { Playlist, Submission, SubmissionStatus } from '@/types';
import spotifyLogo from '@/assets/spotify.png';
import youtubeLogo from '@/assets/youtube.png';
import { useRouter } from 'vue-router';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default defineComponent({
    name: 'PlaylistMakerDashboard',
    components: {
        IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
        IonIcon, IonButton, IonList, IonItem, IonThumbnail, IonLabel, IonBadge,
        IonCardHeader, IonCardTitle, IonCardSubtitle, IonSpinner,
        AppHeader, EmptyStateDisplay, BottomNavigation, Bar, PlaylistDetailsModal
    },
    setup() {
        const authStore = useAuthStore();
        const user = computed(() => authStore.user);
        const router = useRouter();

        const playlistsCount = ref(0);
        const pendingSubmissionsCount = ref(0);
        const totalApprovedCount = ref(0);        const recentSubmissions = ref<Submission[]>([]);
        const recentPlaylists = ref<Playlist[]>([]);
        const loadingSubmissions = ref(true);
        const loadingPlaylists = ref(true);

        // Earnings data
        const hasEarnings = ref(false);
        const totalEarnings = ref(0);
        const earningsStats = ref<Array<{month: string, amount: number}>>([]);
        const loadingEarnings = ref(true);        // Chart data and options
        const chartData = computed(() => {
            console.log("Computing chart data with earnings stats:", earningsStats.value);
            
            // Check if earnings stats exist and have length
            if (!earningsStats.value) {
                console.log("Earnings stats is undefined/null");
                return null;
            }
            
            if (!Array.isArray(earningsStats.value)) {
                console.log("Earnings stats is not an array:", typeof earningsStats.value);
                return null;
            }
            
            if (earningsStats.value.length === 0) {
                console.log("Earnings stats array is empty");
                return null;
            }
            
            // Create chart data structure
            const data = {
                labels: earningsStats.value.map(stat => stat.month),
                datasets: [
                    {
                        label: 'Earnings ($)',
                        data: earningsStats.value.map(stat => stat.amount),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                    }
                ]
            };
            
            console.log("Generated chart data:", data);
            return data;
        });const chartOptions = ref({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: (context: any) => `$${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value: any) => `$${value}`
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        });

        // Submissions per playlist (for badge counts)
        const playlistSubmissions = ref<Record<string, number>>({});        onMounted(async () => {
            await Promise.all([
                fetchStats(),
                fetchRecentSubmissions(),
                fetchPlaylists(),
                fetchEarningsStats()
            ]);

            // Add a delayed check to debug chart data
            setTimeout(() => {
                console.log("DELAYED CHECK - Chart data:", chartData.value);
                console.log("DELAYED CHECK - Earnings stats:", earningsStats.value);
                console.log("DELAYED CHECK - Has earnings:", hasEarnings.value);
            }, 2000);
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

                // Get submissions to playlists owned by this playlist maker
                const response = await SubmissionService.getSubmissionsByCreator(user.value.user_id, 0, 5);
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
        };        const fetchPlaylists = async () => {
            try {
                loadingPlaylists.value = true;

                if (!user.value) return;

                const response = await PlaylistService.getPlaylistsByCreator(user.value.user_id, 0, 4);
                recentPlaylists.value = response.data;
                playlistsCount.value = response.total;
            } catch (error) {
                console.error('Failed to fetch playlists:', error);
            } finally {
                loadingPlaylists.value = false;
            }
        };        const fetchEarningsStats = async () => {
            try {
                loadingEarnings.value = true;

                if (!user.value) return;

                console.log("Fetching earnings stats for user:", user.value.user_id);
                const response = await SubmissionService.getEarningsStatsByCreator(user.value.user_id);
                console.log("Earnings API response:", JSON.stringify(response));
                
                if (Array.isArray(response)) {
                    earningsStats.value = response;
                    
                    // Calculate total earnings
                    totalEarnings.value = response.reduce((sum, stat) => sum + stat.amount, 0);
                    console.log("Total earnings calculated:", totalEarnings.value);
                    hasEarnings.value = totalEarnings.value > 0;
                } else {
                    console.error("Response is not an array:", response);
                    earningsStats.value = [];
                    hasEarnings.value = false;
                }
                
                console.log("Has earnings:", hasEarnings.value);
                console.log("Chart data computed:", chartData.value);
            } catch (error) {
                console.error('Failed to fetch earnings stats:', error);
                hasEarnings.value = false;
                earningsStats.value = [];
            } finally {
                loadingEarnings.value = false;
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
                case SubmissionStatus.APPROVED:
                    return 'success';
                case SubmissionStatus.REJECTED:
                    return 'medium';
                default:
                    return 'medium';
            }
        };        const formatCurrency = (amount: number): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        };const getPlatformIcon = (platformName?: string): string => {
            if (!platformName) return '@/assets/logo.png';

            const platform = platformName.toLowerCase();
            if (platform.includes('spotify')) {
                return spotifyLogo;
            } else if (platform.includes('youtube')) {
                return youtubeLogo;
            }

            return '@/assets/logo.png';
        };        const getPlaylistSubmissionCount = (playlistId: string): number => {
            return playlistSubmissions.value[playlistId] || 0;
        };

        // Add a watcher for earnings stats to debug when it changes
        watch(earningsStats, (newValue) => {
            console.log("Earnings stats changed:", newValue);
            console.log("Chart data is now:", chartData.value);
        });

        // Playlist modal state
        const isPlaylistModalOpen = ref(false);
        const selectedPlaylist = ref<Playlist | null>(null);

        // Convert playlist submissions to stats format for the modal
        const playlistStatsMap = computed(() => {
            const statsMap: Record<string, any> = {};
            recentPlaylists.value.forEach(playlist => {
                const submissionCount = getPlaylistSubmissionCount(playlist.playlist_id);
                statsMap[playlist.playlist_id] = {
                    submissions: submissionCount,
                    pending: 0, // Would need to fetch this data
                    approved: 0,
                    rejected: 0,
                    earnings: 0
                };
            });
            return statsMap;
        });

        const openPlaylistModal = (playlist: Playlist) => {
            selectedPlaylist.value = playlist;
            isPlaylistModalOpen.value = true;
        };

        const closePlaylistModal = () => {
            isPlaylistModalOpen.value = false;
            selectedPlaylist.value = null;
        };

        const onPlaylistUpdated = (updatedPlaylist: Playlist) => {
            // Update the playlist in the local array
            const index = recentPlaylists.value.findIndex(p => p.playlist_id === updatedPlaylist.playlist_id);
            if (index !== -1) {
                recentPlaylists.value[index] = updatedPlaylist;
            }
        };

        const onViewSubmissions = (playlist: Playlist) => {
            closePlaylistModal();
            router.push({
                path: '/playlist-maker/submissions',
                query: { playlistId: playlist.playlist_id }
            });
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
            earningsStats,
            loadingEarnings,
            chartData,
            chartOptions,
            mailUnreadIcon: mailUnread,
            musicalNotesIcon: musicalNotes,
            checkmarkCircleIcon: checkmarkCircle,
            listIcon: listOutline,
            linkIcon: linkOutline,
            personIcon: personOutline,
            arrowForwardIcon: arrowForward,
            calendarIcon: calendarOutline,
            chevronForwardIcon: chevronForward,
            formatDate,
            formatStatus,
            getStatusColor,
            formatCurrency,
            getPlatformIcon,
            getPlaylistSubmissionCount,
            isPlaylistModalOpen,
            selectedPlaylist,
            playlistStatsMap,
            openPlaylistModal,
            closePlaylistModal,
            onPlaylistUpdated,
            onViewSubmissions
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

.submission-item ion-label h3 {
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    text-align: center;
}

.playlist-genre {
    display: inline-block;
    width: 100%;
    text-align: center;
}

.playlist-submissions {
    margin-top: auto;
    display: flex;
    justify-content: center;
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

.chart-wrapper {
    height: 100%;
    width: 100%;
    position: relative;
}

.no-earnings-message {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ion-color-medium);
}

.placeholder-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 100%;
}

.chart-bar {
    color: var(--ion-color-medium);
    font-size: 0.75rem;
}

.playlist-submissions-count {
    color: var(--ion-color-medium);
    font-size: 0.8rem;
    margin-top: 0.25rem;
}

.playlist-meta {
    height: 12px;
    width: 12px;
}

.platform-icon-small {
    justify-content: center;
    align-items: center;
    display: flex;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    right: 4px;
    top: 4px;
    position: absolute;
}

.playlist-platform-overlay {
    position: relative;
    height: 60px;
    width: 60px;
    --border-radius: 8px;
}

.playlist-thumbnail {
    --border-width: 0;
}

.playlist-item:last-child {
    --border-color: var(--ion-color-light);
    --inner-padding-end: 1rem;
    --padding-start: 1rem;
}

.playlist-item {
    margin-bottom: 2rem;
    overflow: hidden;
    border-radius: 12px;
    background: white;
}

/* Mobile Playlists List */
.mobile-only {
    display: block;
}

.desktop-only {
    display: none;
}

@media (max-width: 767px) {
    .desktop-only {
        display: none;
    }

    .mobile-only {
        display: block;
    }
}

.playlist-item {
    pointer-events: none;
    font-size: 0.75rem;
    white-space: nowrap;
    border-radius: 4px;
    padding: 0.5rem;
    color: white;
    background: rgba(0, 0, 0, 0.8);
    transform: translateX(-50%);
    left: 50%;
    bottom: 100%;
    position: absolute;
}

.chart-bar .chart-tooltip {
    filter: brightness(1.1);
}

.chart-bar:hover {
    overflow: hidden;
    border-radius: 4px;
    margin: 0 2px;
    flex: 1;
    position: relative;
    height: 100%;
    display: block;
    width: 6%;
    background: var(--ion-color-primary);
    border-radius: 4px 4px 0 0;
    min-height: 4px;
}
</style>
