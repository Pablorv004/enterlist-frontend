<template>
    <ion-header>
        <ion-toolbar>
            <ion-title>Song Details</ion-title>
            <ion-buttons slot="end">
                <ion-button @click="dismiss">
                    <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <div v-if="song" class="song-details-content">
            <!-- Song Header -->
            <div class="song-header">
                <ion-thumbnail class="song-thumbnail">
                    <img :src="song.cover_image_url || '/assets/default-album-cover.png'" :alt="song.title" />
                </ion-thumbnail>
                
                <div class="song-title-info">
                    <h1>{{ song.title }}</h1>
                    <div class="platform-badge">
                        <img :src="getPlatformIcon(song.platform_id)" :alt="getPlatformName(song.platform_id)" class="platform-icon-small" />
                        <span>{{ getPlatformName(song.platform_id) }}</span>
                    </div>
                </div>
            </div>

            <!-- Song Visibility Toggle -->
            <ion-item lines="none" class="song-visibility-toggle">
                <ion-label>Visible to Playlist Makers</ion-label>
                <ion-toggle v-model="song.is_visible" @ionChange="updateSongVisibility"></ion-toggle>
            </ion-item>

            <!-- Song Information Card -->
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Song Information</ion-card-title>
                </ion-card-header>

                <ion-card-content>
                    <div class="detail-row">
                        <div class="detail-label">Artist</div>
                        <div class="detail-value">{{ song.artist_name_on_platform || 'Unknown Artist' }}</div>
                    </div>                    <div class="detail-row">
                        <div class="detail-label">Album</div>
                        <div class="detail-value">{{ song.album_name || 'Single' }}</div>
                    </div>

                    <div class="detail-row" v-if="song.duration_ms">
                        <div class="detail-label">Duration</div>
                        <div class="detail-value">{{ formatDuration(song.duration_ms) }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">Added</div>
                        <div class="detail-value">{{ formatDate(song.created_at) }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">Last Updated</div>
                        <div class="detail-value">{{ formatDate(song.updated_at) }}</div>
                    </div>

                    <div class="song-ext-link">
                        <ion-button fill="outline" :href="song.url" target="_blank" v-if="song.url">
                            <ion-icon :icon="openIcon" slot="start"></ion-icon>
                            Open in {{ getPlatformName(song.platform_id) }}
                        </ion-button>
                    </div>
                </ion-card-content>
            </ion-card>

            <!-- Submission Stats Card -->
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Submission Stats</ion-card-title>
                </ion-card-header>

                <ion-card-content>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-box-value">
                                {{ songStats.totalSubmissions }}
                            </div>
                            <div class="stat-box-label">Total Submissions</div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-box-value pending">
                                {{ songStats.pending }}
                            </div>
                            <div class="stat-box-label">Pending Review</div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-box-value approved">
                                {{ songStats.approved }}
                            </div>
                            <div class="stat-box-label">Approved</div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-box-value rejected">
                                {{ songStats.rejected }}
                            </div>
                            <div class="stat-box-label">Rejected</div>
                        </div>
                    </div>

                    <div class="submissions-link">
                        <ion-button expand="block" @click="viewSubmissions">
                            <ion-icon :icon="documentTextIcon" slot="start"></ion-icon>
                            View Submissions for this Song
                        </ion-button>
                    </div>
                </ion-card-content>
            </ion-card>
        </div>
    </ion-content>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonThumbnail, IonLabel, IonItem, IonToggle, toastController,
    modalController
} from '@ionic/vue';
import {
    close as closeIcon,
    open as openIcon,
    documentText as documentTextIcon
} from 'ionicons/icons';
import { Song, Platform } from '@/types';
import { SongService } from '@/services/SongService';
import { SubmissionService } from '@/services/SubmissionService';
import { PlatformService } from '@/services/PlatformService';
import { useRouter } from 'vue-router';
import spotifyLogo from '@/assets/spotify.png';
import youtubeLogo from '@/assets/youtube.png';

interface SongStats {
    totalSubmissions: number;
    pending: number;
    approved: number;
    rejected: number;
}

export default defineComponent({
    name: 'SongDetailsModal',
    components: {
        IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
        IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
        IonThumbnail, IonLabel, IonItem, IonToggle
    },
    props: {
        song: {
            type: Object as () => Song,
            required: true
        }
    },
    setup(props) {
        const router = useRouter();
        const songStats = ref<SongStats>({
            totalSubmissions: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        });
        const platforms = ref<Platform[]>([]);

        onMounted(() => {
            fetchSongStats();
            fetchPlatforms();
        });

        const fetchSongStats = async () => {
            try {
                // In a real implementation, we would have a dedicated endpoint for song submission stats
                // For now, we'll mock the data
                const mockStats: SongStats = {
                    totalSubmissions: Math.floor(Math.random() * 20) + 1,
                    pending: Math.floor(Math.random() * 5),
                    approved: Math.floor(Math.random() * 8),
                    rejected: Math.floor(Math.random() * 7)
                };
                songStats.value = mockStats;
            } catch (error) {
                console.error('Failed to fetch song stats:', error);
            }
        };

        const fetchPlatforms = async () => {
            try {
                platforms.value = await PlatformService.getPlatforms();
            } catch (error) {
                console.error('Failed to fetch platforms:', error);
            }
        };

        const dismiss = async () => {
            await modalController.dismiss();
        };

        const formatDate = (dateString?: string): string => {
            if (!dateString) return 'Unknown';
            return new Date(dateString).toLocaleDateString();
        };

        const formatDuration = (duration?: number): string => {
            if (!duration) return '';
            
            // Handle both milliseconds and seconds
            const totalSeconds = duration > 10000 ? Math.floor(duration / 1000) : duration;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        const getPlatformIcon = (platformId: number) => {
            const platform = platforms.value.find(p => p.platform_id === platformId);
            const platformName = platform?.name?.toLowerCase() || '';
            
            if (platformName.includes('spotify')) {
                return spotifyLogo;
            } else if (platformName.includes('youtube')) {
                return youtubeLogo;
            } else {
                return '/assets/default-platform.png';
            }
        };

        const getPlatformName = (platformId: number) => {
            const platform = platforms.value.find(p => p.platform_id === platformId);
            return platform?.name || 'Unknown Platform';
        };

        const updateSongVisibility = async () => {
            if (!props.song) return;

            try {
                await SongService.updateSong(props.song.song_id, {
                    is_visible: props.song.is_visible
                });

                const toast = await toastController.create({
                    message: `Song is now ${props.song.is_visible ? 'visible' : 'hidden'} to playlist makers`,
                    duration: 3000,
                    color: 'success'
                });
                await toast.present();
            } catch (error) {
                // Revert the toggle in the UI
                props.song.is_visible = !props.song.is_visible;

                const toast = await toastController.create({
                    message: 'Failed to update song visibility',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            }
        };

        const viewSubmissions = async () => {
            await dismiss();
            router.push(`/artist/submissions?song=${props.song.song_id}`);
        };

        return {
            songStats,
            platforms,
            dismiss,
            formatDate,
            formatDuration,
            getPlatformIcon,
            getPlatformName,
            updateSongVisibility,
            viewSubmissions,
            // Icons
            closeIcon,
            openIcon,
            documentTextIcon
        };
    }
});
</script>

<style scoped>
.song-details-content {
    max-width: 600px;
    margin: 0 auto;
}

.song-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.song-thumbnail {
    width: 80px;
    height: 80px;
    --border-radius: 8px;
    margin-right: 1rem;
}

.song-title-info h1 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
}

.platform-badge {
    display: inline-flex;
    align-items: center;
    background: var(--ion-color-light);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
}

.platform-icon-small {
    width: 16px;
    height: 16px;
    margin-right: 6px;
}

.song-visibility-toggle {
    margin-bottom: 1rem;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--ion-color-light);
}

.detail-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.detail-label {
    font-weight: 500;
    color: var(--ion-color-medium);
}

.detail-value {
    text-align: right;
}

.song-ext-link {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-box {
    background: var(--ion-color-light);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
}

.stat-box-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat-box-value.pending {
    color: var(--ion-color-warning);
}

.stat-box-value.approved {
    color: var(--ion-color-success);
}

.stat-box-value.rejected {
    color: var(--ion-color-danger);
}

.stat-box-label {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.submissions-link {
    margin-top: 1.5rem;
}
</style>
