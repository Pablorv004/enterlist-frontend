<template>
    <ion-page>
        <app-header title="Submission Details" :back-button="true" back-url="/artist/submissions"></app-header>

        <ion-content :fullscreen="true" class="submission-detail-content">
            <div v-if="loading" class="loading-container">
                <ion-spinner name="crescent"></ion-spinner>
                <p>Loading submission details...</p>
            </div>

            <div v-else-if="!submission" class="error-container">
                <ion-icon :icon="alertCircleIcon" class="error-icon"></ion-icon>
                <h3>Submission Not Found</h3>
                <p>The submission you're looking for doesn't exist or you don't have permission to view it.</p>
                <ion-button router-link="/artist/submissions" fill="outline">
                    Back to Submissions
                </ion-button>
            </div>

            <div v-else class="submission-detail-container">
                <!-- Status Banner -->
                <div :class="['status-banner', getStatusClass(submission.status)]">
                    <ion-icon :icon="getStatusIcon(submission.status)" class="status-icon"></ion-icon>
                    <div class="status-info">
                        <h3>{{ formatStatus(submission.status) }}</h3>
                        <p v-if="submission.status === 'pending'">Your submission is waiting to be reviewed</p>
                        <p v-if="submission.status === 'approved'">Congratulations! Your song has been approved for the
                            playlist</p>
                        <p v-if="submission.status === 'rejected'">Your submission was not selected for the playlist</p>
                    </div>
                </div>

                <!-- Song & Playlist Info -->
                <ion-card class="main-info-card">
                    <ion-card-content>
                        <div class="song-playlist-container">
                            <!-- Song Info -->
                            <div class="song-info">
                                <h3>Song Details</h3>
                                <div class="song-details">
                                    <ion-thumbnail class="song-thumbnail">
                                        <img :src="submission.song?.cover_image_url || '/assets/default-album-cover.png'"
                                            :alt="submission.song?.title" />
                                    </ion-thumbnail>
                                    <div class="song-text">
                                        <h4>{{ submission.song?.title }}</h4>
                                        <p>{{ submission.song?.album_name || 'Single' }}</p>
                                        <ion-button size="small" fill="clear" color="primary"
                                            @click="openSongModal">
                                            <ion-icon :icon="informationIcon" slot="start"></ion-icon>
                                            View Details
                                        </ion-button>
                                    </div>
                                </div>
                            </div>

                            <!-- Playlist Info -->
                            <div class="playlist-info">
                                <h3>Playlist Details</h3>
                                <div class="playlist-details">
                                    <ion-thumbnail class="playlist-thumbnail">
                                        <img :src="completePlaylistData?.cover_image_url || '/assets/default-playlist-cover.png'"
                                            :alt="completePlaylistData?.name" />
                                    </ion-thumbnail>                                    <div class="playlist-text">
                                        <h4>{{ completePlaylistData?.name }}</h4>
                                        <p v-if="completePlaylistData?.genre">{{ completePlaylistData?.genre }}</p>
                                        <ion-button size="small" fill="clear" color="primary"
                                            @click="openPlaylistModal" v-if="completePlaylistData">
                                            <ion-icon :icon="openIcon" slot="start"></ion-icon>
                                            View Playlist
                                        </ion-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Submission Details -->
                <ion-card class="details-card">
                    <ion-card-header>
                        <ion-card-title>Submission Details</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <div class="detail-item">
                            <ion-label>Submitted On</ion-label>
                            <p>{{ formatDate(submission.submitted_at) }}</p>
                        </div>

                        <div v-if="submission.reviewed_at" class="detail-item">
                            <ion-label>Reviewed On</ion-label>
                            <p>{{ formatDate(submission.reviewed_at) }}</p>
                        </div>

                        <div v-if="submission.transaction" class="detail-item">
                            <ion-label>Payment Status</ion-label>
                            <ion-badge :color="getTransactionStatusColor(submission.transaction.status)">
                                {{ formatTransactionStatus(submission.transaction.status) }}
                            </ion-badge>
                        </div>

                        <div v-if="submission.transaction" class="detail-item">
                            <ion-label>Submission Fee</ion-label>
                            <p>{{ formatCurrency(submission.transaction.amount_total, submission.transaction.currency)
                                }}</p>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Submission Message -->
                <ion-card v-if="submission.submission_message" class="message-card">
                    <ion-card-header>
                        <ion-card-title>Your Message</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <div class="message-content">
                            <p>{{ submission.submission_message }}</p>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Curator Feedback -->
                <ion-card v-if="submission.review_feedback" class="feedback-card">
                    <ion-card-header>
                        <ion-card-title>Curator Feedback</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <div class="feedback-content">
                            <p>{{ submission.review_feedback }}</p>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <ion-button color="medium" router-link="/artist/submissions" fill="outline">
                        Back to Submissions
                    </ion-button>

                    <!-- Show only for rejected submissions to allow resubmission -->
                    <ion-button v-if="submission.status === 'rejected'" color="primary" @click="resubmitSong">
                        <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                        Resubmit to Another Playlist
                    </ion-button>
                </div>
            </div>
        </ion-content>        <!-- Song Details Modal -->
        <ion-modal :is-open="isSongModalOpen" @didDismiss="closeSongModal">
            <song-details-modal
                v-if="submission?.song"
                :song="submission.song"
                :show-edit-buttons="false"
                @close="closeSongModal"
            />
        </ion-modal>        <!-- Playlist Details Modal -->
        <ion-modal :is-open="isPlaylistModalOpen" @didDismiss="closePlaylistModal">
            <playlist-details-modal
                v-if="completePlaylistData"
                :playlist="completePlaylistData"
                :show-edit-buttons="false"
            />
        </ion-modal>

        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="submissions"></bottom-navigation>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    IonPage, IonContent, IonSpinner, IonIcon, IonButton, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonThumbnail, IonLabel, IonBadge,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons
} from '@ionic/vue';
import {
    alertCircle, checkmarkCircle, closeCircle, timerOutline,
    play, open, refreshOutline, informationCircle
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { SubmissionService } from '@/services/SubmissionService';
import { PlaylistService } from '@/services/PlaylistService';
import { Submission, SubmissionStatus, TransactionStatus, Playlist } from '@/types';
import { useSubmissionStore } from '@/store';
import PlaylistDetailsModal from '@/components/PlaylistDetailsModal.vue';
import SongDetailsModal from '@/components/SongDetailsModal.vue';

export default defineComponent({
    name: 'ArtistSubmissionDetail',
    components: {
        IonPage, IonContent, IonSpinner, IonIcon, IonButton, IonCard,
        IonCardHeader, IonCardTitle, IonCardContent, IonThumbnail, IonLabel, IonBadge,
        IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
        AppHeader, BottomNavigation, PlaylistDetailsModal, SongDetailsModal
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const submissionStore = useSubmissionStore();

        const submissionId = computed(() => route.params.id as string);
        const submission = ref<Submission | null>(null);
        const loading = ref(true);
        const error = ref<string | null>(null);

        const fetchSubmission = async () => {
            try {
                loading.value = true;
                submission.value = await SubmissionService.getSubmission(submissionId.value);
                
                // Fetch complete playlist data if available
                if (submission.value?.playlist?.playlist_id) {
                    try {
                        completePlaylistData.value = await PlaylistService.getPlaylist(submission.value.playlist.playlist_id);
                    } catch (err) {
                        console.error('Failed to load complete playlist data:', err);
                        // Fallback to using the limited data if the fetch fails
                        completePlaylistData.value = submission.value.playlist;
                    }
                }
            } catch (err) {
                error.value = 'Failed to load submission details';
                console.error(err);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            fetchSubmission();
        });

        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const formatStatus = (status: SubmissionStatus): string => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return 'Pending Review';
                case SubmissionStatus.APPROVED:
                    return 'Approved';
                case SubmissionStatus.REJECTED:
                    return 'Not Approved';
                default:
                    return 'Unknown Status';
            }
        };

        const getStatusClass = (status: SubmissionStatus): string => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return 'status-pending';
                case SubmissionStatus.APPROVED:
                    return 'status-approved';
                case SubmissionStatus.REJECTED:
                    return 'status-rejected';
                default:
                    return '';
            }
        };

        const getStatusIcon = (status: SubmissionStatus) => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return timerOutline;
                case SubmissionStatus.APPROVED:
                    return checkmarkCircle;
                case SubmissionStatus.REJECTED:
                    return closeCircle;
                default:
                    return alertCircle;
            }
        };        const formatTransactionStatus = (status: TransactionStatus): string => {
            switch (status) {
                case TransactionStatus.PENDING:
                    return 'Pending';
                case TransactionStatus.PROCESSING:
                    return 'Processing';
                case TransactionStatus.SUCCEEDED:
                    return 'Completed';
                case TransactionStatus.FAILED:
                    return 'Failed';
                default:
                    return 'Unknown';
            }
        };

        const getTransactionStatusColor = (status: TransactionStatus): string => {
            switch (status) {
                case TransactionStatus.PENDING:
                    return 'warning';
                case TransactionStatus.PROCESSING:
                    return 'warning';
                case TransactionStatus.SUCCEEDED:
                    return 'success';
                case TransactionStatus.FAILED:
                    return 'danger';
                default:
                    return 'medium';
            }
        };

        const formatCurrency = (amount: number, currency: string): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency || 'USD'
            }).format(amount / 100); // Assuming amount is in cents
        };

        const resubmitSong = () => {
            if (submission.value?.song) {
                // Navigate to new submission page with pre-selected song
                const songId = submission.value.song.song_id;
                router.push({
                    path: '/artist/submissions/new',
                    query: { songId }
                });
            }
        };

        // Modal states
        const isPlaylistModalOpen = ref(false);
        const isSongModalOpen = ref(false);
        const completePlaylistData = ref<Playlist | null>(null);
        const loadingPlaylist = ref(false);

        const openPlaylistModal = async () => {
            if (!completePlaylistData.value) return;
            isPlaylistModalOpen.value = true;
        };

        const closePlaylistModal = () => {
            isPlaylistModalOpen.value = false;
        };

        const openSongModal = () => {
            isSongModalOpen.value = true;
        };

        const closeSongModal = () => {
            isSongModalOpen.value = false;
        };

        return {
            submission,
            loading,
            error,
            formatDate,
            formatStatus,
            formatTransactionStatus,
            getTransactionStatusColor,
            getStatusClass,
            getStatusIcon,
            formatCurrency,
            resubmitSong,
            isPlaylistModalOpen,
            isSongModalOpen,
            openPlaylistModal,
            closePlaylistModal,
            openSongModal,
            closeSongModal,
            alertCircleIcon: alertCircle,
            playIcon: play,
            openIcon: open,
            refreshIcon: refreshOutline,
            informationIcon: informationCircle,
            completePlaylistData,
            loadingPlaylist
        };
    }
});
</script>

<style scoped>
.submission-detail-content {
    --background: #f8f9fa;
}

.submission-detail-container {
    padding: 1rem;
    max-width: 900px;
    margin: 0 auto;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    text-align: center;
}

.error-icon {
    font-size: 4rem;
    color: var(--ion-color-danger);
    margin-bottom: 1rem;
}

.status-banner {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    color: white;
    text-align: left;
}

.status-pending {
    background-color: var(--ion-color-warning);
}

.status-review {
    background-color: var(--ion-color-secondary);
}

.status-approved {
    background-color: var(--ion-color-success);
}

.status-rejected {
    background-color: var(--ion-color-medium);
}

.status-icon {
    font-size: 2.5rem;
    margin-right: 1rem;
}

.status-info h3 {
    margin: 0 0 0.25rem;
    font-weight: 600;
}

.status-info p {
    margin: 0;
}

.main-info-card {
    margin-bottom: 1rem;
}

.song-playlist-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

@media (min-width: 768px) {
    .song-playlist-container {
        flex-direction: row;
        gap: 2rem;
    }

    .song-info,
    .playlist-info {
        flex: 1;
    }
}

.song-info h3,
.playlist-info h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--ion-color-medium);
}

.song-details,
.playlist-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.song-thumbnail,
.playlist-thumbnail {
    --border-radius: 8px;
    width: 80px;
    height: 80px;
    margin: 0 0 1rem 0;
}

.song-text,
.playlist-text {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.song-text h4,
.playlist-text h4 {
    margin: 0 0 0.25rem;
    font-weight: 600;
}

.song-text p,
.playlist-text p {
    margin: 0 0 0.25rem;
    color: var(--ion-color-medium);
}

.details-card,
.message-card,
.feedback-card {
    margin-bottom: 1rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--ion-color-light);
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-item ion-label {
    font-weight: 500;
    color: var(--ion-color-medium);
}

.message-content,
.feedback-content {
    white-space: pre-line;
    line-height: 1.5;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
}

@media (min-width: 576px) {
    .action-buttons {
        flex-direction: row;
        justify-content: flex-end;
    }
}
</style>
