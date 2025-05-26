<template>
    <ion-header>
        <ion-toolbar>
            <ion-title>Playlist Details</ion-title>
            <ion-buttons slot="end">
                <ion-button @click="dismiss">
                    <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                </ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
        <div v-if="playlist" class="playlist-details-content">
            <div class="playlist-header">
                <ion-thumbnail class="playlist-thumbnail">
                    <img :src="playlist.cover_image_url || '/assets/default-playlist-cover.png'"
                        :alt="playlist.name" />
                </ion-thumbnail>

                <div class="playlist-title-info">
                    <h1>{{ playlist.name }}</h1>
                    <div class="platform-badge">
                        <img :src="getPlatformIcon(playlist.platform?.name)"
                            :alt="playlist.platform?.name" class="platform-icon-small" />
                        <span>{{ playlist.platform?.name }}</span>
                    </div>
                </div>
            </div>

            <ion-item lines="none" class="playlist-visibility-toggle" v-if="showEditButtons">
                <ion-label>Active for Submissions</ion-label>
                <ion-toggle v-model="playlist.is_visible"
                    @ionChange="updatePlaylistVisibility"></ion-toggle>
            </ion-item>

            <ion-card>
                <ion-card-header>
                    <ion-card-title>Playlist Information</ion-card-title>
                </ion-card-header>
                
                <ion-card-content>
                    <div class="detail-row">
                        <div class="detail-label">Genre</div>
                        <div class="detail-value genre-edit">
                            <span>{{ playlist.genre || 'Not specified' }}</span>
                            <ion-button v-if="showEditButtons" fill="clear" size="small" @click="showGenreEditModal">
                                <ion-icon :icon="pencilIcon" slot="icon-only"></ion-icon>
                            </ion-button>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">Description</div>
                        <div class="detail-value description">{{ playlist.description || 'No description' }}</div>
                    </div>
                    
                    <div class="detail-row">
                        <div class="detail-label">Submission Fee</div>
                        <div class="detail-value fee-edit">
                            <span>{{ playlist.submission_fee ? formatCurrency(playlist.submission_fee) : 'Free' }}</span>
                            <ion-button v-if="showEditButtons" fill="clear" size="small" @click="showFeeEditModal">
                                <ion-icon :icon="pencilIcon" slot="icon-only"></ion-icon>
                            </ion-button>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">Imported</div>
                        <div class="detail-value">{{ formatDate(playlist.created_at) }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">Last Updated</div>
                        <div class="detail-value">{{ formatDate(playlist.updated_at) }}</div>
                    </div>

                    <div class="playlist-ext-link">
                        <ion-button fill="outline" :href="playlist.url" target="_blank">
                            <ion-icon :icon="openIcon" slot="start"></ion-icon>
                            Open in {{ playlist.platform?.name }}
                        </ion-button>
                    </div>
                </ion-card-content>
            </ion-card>

            <!-- Playlist Tracks Section -->
            <ion-card>
                <ion-card-header>
                    <ion-card-title>Playlist Tracks ({{ getTrackCount() }})</ion-card-title>
                </ion-card-header>
                
                <ion-card-content>
                    <!-- Loading State -->
                    <div v-if="tracksLoading" class="tracks-loading">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading tracks...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="tracksError" class="tracks-error">
                        <ion-icon :icon="musicalNotesIcon" size="large"></ion-icon>
                        <div class="tracks-error-content">
                            <h4>Failed to Load Tracks</h4>
                            <p>{{ tracksError }}</p>
                            <ion-button 
                                fill="outline" 
                                size="small"
                                @click="fetchPlaylistTracks(playlist.playlist_id)"
                            >
                                Try Again
                            </ion-button>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="!hasTrackData()" class="tracks-empty">
                        <ion-icon :icon="musicalNotesIcon" size="large"></ion-icon>
                        <div class="tracks-empty-content">
                            <h4>No Tracks Found</h4>
                            <p>
                                This playlist appears to be empty or tracks could not be loaded.
                                You can view the playlist directly on {{ playlist.platform?.name }}.
                            </p>
                            <ion-button 
                                fill="outline" 
                                size="small"
                                :href="playlist.url" 
                                target="_blank"
                            >
                                <ion-icon :icon="openIcon" slot="start"></ion-icon>
                                View on {{ playlist.platform?.name }}
                            </ion-button>
                        </div>
                    </div>

                    <!-- Tracks List -->
                    <div v-else class="tracks-list">
                        <div 
                            v-for="(track, index) in playlistTracks" 
                            :key="track.track_id || index"
                            class="track-item"
                        >
                            <div class="track-thumbnail">
                                <img 
                                    v-if="track.thumbnail_url" 
                                    :src="track.thumbnail_url" 
                                    :alt="track.title"
                                    @error="onImageError"
                                />
                                <ion-icon v-else :icon="musicalNotesIcon" class="track-placeholder"></ion-icon>
                            </div>
                            
                            <div class="track-info">
                                <div class="track-title">{{ track.title }}</div>
                                <div class="track-artist">{{ track.artist }}</div>
                                <div v-if="track.album" class="track-album">{{ track.album }}</div>
                            </div>
                            
                            <div class="track-actions">
                                <div v-if="track.duration_ms" class="track-duration">
                                    {{ formatDuration(track.duration_ms) }}
                                </div>
                                
                                <ion-button 
                                    v-if="track.url" 
                                    fill="clear" 
                                    size="small"
                                    :href="track.url" 
                                    target="_blank"
                                >
                                    <ion-icon :icon="openIcon" slot="icon-only"></ion-icon>
                                </ion-button>
                            </div>
                        </div>
                    </div>
                </ion-card-content>
            </ion-card>

            <ion-card>
                <ion-card-header>
                    <ion-card-title>Submission Stats</ion-card-title>
                </ion-card-header>

                <ion-card-content>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-box-value">
                                {{ getSubmissionCount(playlist.playlist_id) }}
                            </div>
                            <div class="stat-box-label">Total Submissions</div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-box-value pending">
                                {{ getPendingCount(playlist.playlist_id) }}
                            </div>
                            <div class="stat-box-label">Pending Review</div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-box-value approved">
                                {{ getApprovedCount(playlist.playlist_id) }}
                            </div>
                            <div class="stat-box-label">Approved</div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-box-value rejected">
                                {{ getRejectedCount(playlist.playlist_id) }}
                            </div>
                            <div class="stat-box-label">Rejected</div>
                        </div>
                    </div>

                    <div class="earnings-info">
                        <div class="earnings-label">Total Earnings</div>
                        <div class="earnings-value">{{ formatCurrency(getEarnings(playlist.playlist_id)) }}</div>
                    </div>

                    <div class="submissions-link" v-if="showEditButtons">
                        <ion-button expand="block" @click="viewSubmissions(playlist)">
                            <ion-icon :icon="mailUnreadIcon" slot="start"></ion-icon>
                            View Submissions
                        </ion-button>
                    </div>
                </ion-card-content>
            </ion-card>
        </div>
    </ion-content>

    <!-- Submission Fee Edit Modal -->
    <ion-modal v-if="showEditButtons" :is-open="isFeeModalOpen" @didDismiss="closeFeeModal" class="fee-edit-modal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Edit Submission Fee</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeFeeModal">
                        <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="fee-edit-content">
                <p>Set a submission fee for artists who want to submit their music to this playlist.</p>
                
                <ion-item class="fee-input">
                    <ion-label position="stacked">Submission Fee (USD)</ion-label>
                    <ion-input 
                        type="number" 
                        v-model="submissionFee" 
                        min="0" 
                        max="100"
                        placeholder="Enter amount (0 for free submissions)"
                    ></ion-input>
                </ion-item>

                <ion-note>Fee will be charged to artists when submitting to this playlist. You'll receive 85% of the fee after platform charges.</ion-note>

                <div class="fee-actions">
                    <ion-button expand="block" @click="updateFee">Save Fee</ion-button>
                </div>
            </div>
        </ion-content>
    </ion-modal>

    <!-- Genre Edit Modal -->
    <ion-modal v-if="showEditButtons" :is-open="isGenreModalOpen" @didDismiss="closeGenreModal" class="genre-edit-modal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Edit Genre</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeGenreModal">
                        <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <div class="genre-edit-content">
                <p>Select a genre that best describes this playlist's music style.</p>
                
                <ion-item class="genre-select">
                    <ion-label position="stacked">Genre</ion-label>
                    <ion-select 
                        v-model="selectedGenre" 
                        placeholder="Select a genre"
                        interface="popover"
                    >
                        <ion-select-option 
                            v-for="genre in genreOptions" 
                            :key="genre" 
                            :value="genre"
                        >
                            {{ genre }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-note>Choose the genre that best represents the majority of tracks in this playlist.</ion-note>

                <div class="genre-actions">
                    <ion-button expand="block" @click="updateGenre">Save Genre</ion-button>
                </div>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonThumbnail, IonItem, IonLabel, IonToggle, IonSpinner, IonModal,
    IonSelect, IonSelectOption, IonNote, IonInput, toastController,
    modalController
} from '@ionic/vue';
import {
    close as closeIcon,
    open as openIcon,
    pencil as pencilIcon,
    musicalNotes as musicalNotesIcon,
    mailUnread as mailUnreadIcon
} from 'ionicons/icons';
import { Playlist, Track } from '@/types';
import { PlaylistService } from '@/services/PlaylistService';
import { usePlaylistStore } from '@/store';
import spotifyLogo from '@/assets/spotify.png';
import youtubeLogo from '@/assets/youtube.png';

interface PlaylistStats {
    submissions: number;
    pending: number;
    approved: number;
    rejected: number;
    earnings: number;
}

export default defineComponent({
    name: 'PlaylistDetailsModal',
    components: {
        IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
        IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
        IonThumbnail, IonItem, IonLabel, IonToggle, IonSpinner, IonModal,
        IonSelect, IonSelectOption, IonNote, IonInput
    },
    props: {
        playlist: {
            type: Object as () => Playlist,
            required: true
        },
        playlistStats: {
            type: Object as () => Record<string, PlaylistStats>,
            required: true
        },
        showEditButtons: {
            type: Boolean,
            default: true
        }
    },
    emits: ['playlistUpdated', 'viewSubmissions'],
    setup(props, { emit }) {
        const router = useRouter();
        const playlistStore = usePlaylistStore();

        // Tracks
        const playlistTracks = ref<Track[]>([]);
        const tracksLoading = ref(false);
        const tracksError = ref<string | null>(null);

        // Fee Edit Modal
        const isFeeModalOpen = ref(false);
        const submissionFee = ref(0);

        // Genre Edit Modal
        const isGenreModalOpen = ref(false);
        const selectedGenre = ref('');
        const genreOptions = [
            'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Blues',
            'Country', 'Folk', 'Classical', 'Reggae', 'Punk', 'Metal',
            'Alternative', 'Indie', 'Funk', 'Soul', 'Gospel', 'World Music',
            'Latin', 'Reggaeton', 'Trap', 'House', 'Techno', 'Dubstep',
            'Ambient', 'Lo-fi', 'Acoustic', 'Singer-Songwriter', 'Other'
        ];

        onMounted(() => {
            if (props.playlist?.playlist_id) {
                fetchPlaylistTracks(props.playlist.playlist_id);
            }
        });

        const dismiss = async () => {
            await modalController.dismiss();
        };

        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const formatCurrency = (amount: number): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        };

        const getPlatformIcon = (platformName?: string): string => {
            if (!platformName) return '@/assets/logo.png';

            const platform = platformName.toLowerCase();
            if (platform.includes('spotify')) {
                return spotifyLogo;
            } else if (platform.includes('youtube')) {
                return youtubeLogo;
            }

            return '@/assets/logo.png';
        };

        const onImageError = (event: Event) => {
            const img = event.target as HTMLImageElement;
            img.style.display = 'none';
        };

        const formatDuration = (duration?: number): string => {
            if (!duration) return '';
            
            // Handle both milliseconds and seconds
            const totalSeconds = duration > 10000 ? Math.floor(duration / 1000) : duration;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        const getTrackCount = (): number => {
            return playlistTracks.value.length;
        };

        const hasTrackData = (): boolean => {
            return playlistTracks.value.length > 0;
        };

        const fetchPlaylistTracks = async (playlistId: string) => {
            try {
                tracksLoading.value = true;
                tracksError.value = null;
                playlistTracks.value = [];

                const response = await PlaylistService.getPlaylistTracks(playlistId);
                playlistTracks.value = response.tracks;
            } catch (error) {
                console.error('Failed to fetch playlist tracks:', error);
                tracksError.value = 'Failed to load tracks. Please try again.';
            } finally {
                tracksLoading.value = false;
            }
        };

        const updatePlaylistVisibility = async () => {
            if (!props.playlist) return;

            try {
                const updatedPlaylist = await PlaylistService.updatePlaylist(
                    props.playlist.playlist_id,
                    { is_visible: props.playlist.is_visible }
                );

                emit('playlistUpdated', updatedPlaylist);

                showToast(
                    `Playlist is now ${updatedPlaylist.is_visible ? 'active' : 'inactive'} for submissions`,
                    'success'
                );
            } catch (error) {
                // Revert the toggle in the UI
                if (props.playlist) {
                    props.playlist.is_visible = !props.playlist.is_visible;
                }

                showToast('Failed to update playlist visibility', 'danger');
            }
        };

        const viewSubmissions = (playlist: Playlist) => {
            emit('viewSubmissions', playlist);
        };

        const getSubmissionCount = (playlistId: string): number => {
            return props.playlistStats[playlistId]?.submissions || 0;
        };

        const getPendingCount = (playlistId: string): number => {
            return props.playlistStats[playlistId]?.pending || 0;
        };

        const getApprovedCount = (playlistId: string): number => {
            return props.playlistStats[playlistId]?.approved || 0;
        };

        const getRejectedCount = (playlistId: string): number => {
            return props.playlistStats[playlistId]?.rejected || 0;
        };

        const getEarnings = (playlistId: string): number => {
            return props.playlistStats[playlistId]?.earnings || 0;
        };

        const showFeeEditModal = () => {
            if (props.playlist) {
                submissionFee.value = props.playlist.submission_fee || 0;
                isFeeModalOpen.value = true;
            }
        };

        const closeFeeModal = () => {
            isFeeModalOpen.value = false;
        };

        const updateFee = async () => {
            if (!props.playlist) return;

            try {
                const updatedPlaylist = await PlaylistService.updatePlaylist(
                    props.playlist.playlist_id,
                    { submission_fee: submissionFee.value }
                );
                
                emit('playlistUpdated', updatedPlaylist);
                closeFeeModal();
                showToast('Submission fee updated successfully', 'success');
            } catch (error) {
                showToast('Failed to update submission fee', 'danger');
            }
        };

        const showGenreEditModal = () => {
            if (props.playlist) {
                selectedGenre.value = props.playlist.genre || '';
                isGenreModalOpen.value = true;
            }
        };

        const closeGenreModal = () => {
            isGenreModalOpen.value = false;
        };

        const updateGenre = async () => {
            if (!props.playlist) return;

            try {
                const updatedPlaylist = await PlaylistService.updatePlaylist(
                    props.playlist.playlist_id,
                    { genre: selectedGenre.value }
                );
                
                emit('playlistUpdated', updatedPlaylist);
                closeGenreModal();
                showToast('Genre updated successfully', 'success');
            } catch (error) {
                showToast('Failed to update genre', 'danger');
            }
        };

        const showToast = async (message: string, color: string = 'primary') => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                color
            });

            await toast.present();
        };

        return {
            playlistTracks,
            tracksLoading,
            tracksError,
            isFeeModalOpen,
            submissionFee,
            isGenreModalOpen,
            selectedGenre,
            genreOptions,
            dismiss,
            formatDate,
            formatCurrency,
            getPlatformIcon,
            onImageError,
            formatDuration,
            getTrackCount,
            hasTrackData,
            fetchPlaylistTracks,
            updatePlaylistVisibility,
            viewSubmissions,
            getSubmissionCount,
            getPendingCount,
            getApprovedCount,
            getRejectedCount,
            getEarnings,
            showFeeEditModal,
            closeFeeModal,
            updateFee,
            showGenreEditModal,
            closeGenreModal,
            updateGenre,
            // Icons
            closeIcon,
            openIcon,
            pencilIcon,
            musicalNotesIcon,
            mailUnreadIcon
        };
    }
});
</script>

<style scoped>
.playlist-details-content {
    max-width: 800px;
    margin: 0 auto;
}

.playlist-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.playlist-thumbnail {
    width: 80px;
    height: 80px;
    --border-radius: 8px;
    margin-right: 1rem;
}

.playlist-title-info h1 {
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

.playlist-visibility-toggle {
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

.detail-value.description {
    white-space: pre-line;
    text-align: left;
    margin-top: 0.5rem;
    width: 100%;
    color: var(--ion-color-dark);
}

.detail-row:has(.description) {
    flex-direction: column;
    align-items: flex-start;
}

.detail-row:has(.description) .detail-label {
    margin-bottom: 0.5rem;
}

.detail-row:has(.description) .detail-value {
    text-align: left;
    width: 100%;
}

.playlist-ext-link {
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

.earnings-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1.5rem 0;
    padding: 1rem;
    background: var(--ion-color-success-tint);
    border-radius: 8px;
}

.earnings-label {
    font-weight: 500;
}

.earnings-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ion-color-success);
}

.submissions-link {
    margin-top: 1.5rem;
}

/* Tracks Section */
.tracks-loading, .tracks-error, .tracks-empty {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--ion-color-light);
    border-radius: 8px;
    border: 1px solid var(--ion-color-light-shade);
    text-align: left;
}

.tracks-error-content, .tracks-empty-content {
    flex: 1;
}

.tracks-loading {
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 0.5rem;
}

.tracks-loading p {
    margin: 0;
    color: var(--ion-color-medium);
    font-size: 0.9rem;
}

.tracks-error-content h4, .tracks-empty-content h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--ion-color-dark);
}

.tracks-error-content p, .tracks-empty-content p {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: var(--ion-color-medium);
    line-height: 1.4;
}

.tracks-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--ion-color-light);
    border-radius: 8px;
    background: white;
}

.track-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid var(--ion-color-light);
    transition: background-color 0.2s;
    gap: 0.75rem;
}

.track-item:last-child {
    border-bottom: none;
}

.track-item:hover {
    background-color: var(--ion-color-light);
}

.track-thumbnail {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--ion-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.track-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.track-placeholder {
    font-size: 1.5rem;
    color: var(--ion-color-medium);
}

.track-info {
    flex: 1;
    min-width: 0;
}

.track-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--ion-color-dark);
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.track-artist {
    font-size: 0.85rem;
    color: var(--ion-color-medium);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.track-album {
    font-size: 0.8rem;
    color: var(--ion-color-medium-shade);
    margin-top: 0.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.track-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

.track-duration {
    font-size: 0.85rem;
    color: var(--ion-color-medium);
    font-weight: 500;
    min-width: 35px;
    text-align: right;
}

/* Genre and Fee Edit Styles */
.genre-edit, .fee-edit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.genre-edit ion-button, .fee-edit ion-button {
    --color: var(--ion-color-medium);
    min-width: auto;
}

.genre-edit ion-button:hover, .fee-edit ion-button:hover {
    --color: var(--ion-color-primary);
}

.genre-edit-modal .genre-edit-content,
.fee-edit-modal .fee-edit-content {
    max-width: 500px;
    margin: 0 auto;
}

.genre-select, .fee-input {
    margin: 1rem 0;
}

.genre-actions, .fee-actions {
    margin-top: 2rem;
}
</style>
