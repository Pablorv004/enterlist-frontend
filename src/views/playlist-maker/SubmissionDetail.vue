<template>
    <ion-page>
        <app-header title="Submission Details" :back-button="true" back-url="/playlist-maker/submissions"></app-header>

        <ion-content :fullscreen="true" class="submission-detail-content">
            <div v-if="loading" class="loading-container">
                <ion-spinner name="crescent"></ion-spinner>
                <p>Loading submission details...</p>
            </div>

            <div v-else-if="!submission" class="error-container">
                <ion-icon :icon="alertCircleIcon" class="error-icon"></ion-icon>
                <h3>Submission Not Found</h3>
                <p>The submission you're looking for doesn't exist or you don't have permission to view it.</p>
                <ion-button router-link="/playlist-maker/submissions" fill="outline">
                    Back to Submissions
                </ion-button>
            </div>

            <div v-else class="submission-detail-container">
                <!-- Status Banner -->
                <div :class="['status-banner', getStatusClass(submission.status)]">
                    <ion-icon :icon="getStatusIcon(submission.status)" class="status-icon"></ion-icon>
                    <div class="status-info">
                        <h3>{{ formatStatus(submission.status) }}</h3>
                        <p v-if="submission.status === 'pending'">This submission is waiting for your review</p>
                        <p v-if="submission.status === 'under_review'">You're currently reviewing this submission</p>
                        <p v-if="submission.status === 'approved'">You've approved this song for your playlist</p>
                        <p v-if="submission.status === 'rejected'">You've decided not to add this song to your playlist
                        </p>
                    </div>
                </div>

                <!-- Action Buttons for Curator -->
                <div v-if="submission.status === 'pending' || submission.status === 'under_review'"
                    class="curator-actions">
                    <ion-button color="success" @click="openApproveModal">
                        <ion-icon :icon="checkmarkIcon" slot="start"></ion-icon>
                        Approve Submission
                    </ion-button>
                    <ion-button color="danger" @click="openRejectModal">
                        <ion-icon :icon="closeIcon" slot="start"></ion-icon>
                        Decline Submission
                    </ion-button>
                    <ion-button color="warning" @click="markAsUnderReview" v-if="submission.status === 'pending'">
                        <ion-icon :icon="timerIcon" slot="start"></ion-icon>
                        Mark as "In Review"
                    </ion-button>
                </div>

                <!-- Song & Artist Info -->
                <ion-card class="main-info-card">
                    <ion-card-content>
                        <div class="song-artist-container">
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
                                            :href="submission.song?.url" target="_blank">
                                            <ion-icon :icon="playIcon" slot="start"></ion-icon>
                                            Listen on {{ submission.song?.platform?.name }}
                                        </ion-button>
                                    </div>
                                </div>
                            </div>

                            <!-- Artist Info -->
                            <div class="artist-info">
                                <h3>Artist Details</h3>
                                <div class="artist-details">
                                    <div class="artist-text">
                                        <h4>{{ submission.artist?.username }}</h4>
                                        <p v-if="submission.artist?.email">{{ submission.artist?.email }}</p>
                                        <ion-button v-if="submission.artist?.user_id" size="small" fill="clear"
                                            color="tertiary" @click="showArtistHistory">
                                            <ion-icon :icon="personIcon" slot="start"></ion-icon>
                                            View Artist History
                                        </ion-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Playlist Info -->
                <ion-card class="playlist-card">
                    <ion-card-header>
                        <ion-card-title>Playlist</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <div class="playlist-info">
                            <ion-thumbnail class="playlist-thumbnail">
                                <img :src="submission.playlist?.cover_image_url || '/assets/default-playlist-cover.png'"
                                    :alt="submission.playlist?.name" />
                            </ion-thumbnail>
                            <div class="playlist-details">
                                <h4>{{ submission.playlist?.name }}</h4>
                                <p v-if="submission.playlist?.genre">{{ submission.playlist?.genre }}</p>
                                <p>{{ formatFollowers(submission.playlist?.follower_count) }} Followers</p>
                                <ion-button size="small" fill="clear" color="primary" :href="submission.playlist?.url"
                                    target="_blank">
                                    <ion-icon :icon="openIcon" slot="start"></ion-icon>
                                    View Playlist
                                </ion-button>
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

                        <div v-if="submission.transaction" class="detail-item">
                            <ion-label>Your Payout</ion-label>
                            <p>{{ formatCurrency(submission.transaction.creator_payout_amount,
                                submission.transaction.currency) }}</p>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Artist's Message -->
                <ion-card v-if="submission.submission_message" class="message-card">
                    <ion-card-header>
                        <ion-card-title>Artist's Message</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <div class="message-content">
                            <p>{{ submission.submission_message }}</p>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Your Feedback -->
                <ion-card v-if="submission.review_feedback" class="feedback-card">
                    <ion-card-header>
                        <ion-card-title>Your Feedback</ion-card-title>
                        <ion-button v-if="submission.status === 'approved' || submission.status === 'rejected'"
                            size="small" fill="clear" color="primary" slot="end" @click="openEditFeedbackModal">
                            Edit Feedback
                        </ion-button>
                    </ion-card-header>
                    <ion-card-content>
                        <div class="feedback-content">
                            <p>{{ submission.review_feedback }}</p>
                        </div>
                    </ion-card-content>
                </ion-card>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <ion-button color="medium" router-link="/playlist-maker/submissions" fill="outline">
                        Back to Submissions
                    </ion-button>
                </div>
            </div>
        </ion-content>

        <!-- Approve Modal -->
        <ion-modal :is-open="approveModalOpen" @didDismiss="approveModalOpen = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Approve Submission</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="approveModalOpen = false">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <h3>Approve "{{ submission?.song?.title }}"</h3>
                <p>This will notify the artist that their song has been approved for your playlist.</p>

                <ion-item>
                    <ion-label position="stacked">Feedback to Artist (optional)</ion-label>
                    <ion-textarea v-model="approvalFeedback"
                        placeholder="Tell the artist why you approved their song or any other feedback..."
                        :rows="4"></ion-textarea>
                </ion-item>

                <div class="modal-actions">
                    <ion-button color="medium" @click="approveModalOpen = false" fill="outline">Cancel</ion-button>
                    <ion-button color="success" @click="approveSubmission">
                        Approve Submission
                    </ion-button>
                </div>
            </ion-content>
        </ion-modal>

        <!-- Reject Modal -->
        <ion-modal :is-open="rejectModalOpen" @didDismiss="rejectModalOpen = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Decline Submission</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="rejectModalOpen = false">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <h3>Decline "{{ submission?.song?.title }}"</h3>
                <p>Please provide feedback to the artist about why their submission was not approved.</p>

                <ion-item>
                    <ion-label position="stacked">Feedback to Artist *</ion-label>
                    <ion-textarea v-model="rejectionFeedback"
                        placeholder="Explain why this song wasn't a good fit for your playlist..." :rows="4"
                        required></ion-textarea>
                </ion-item>
                <ion-note color="danger" v-if="showFeedbackError">Feedback is required when declining a
                    submission</ion-note>

                <div class="modal-actions">
                    <ion-button color="medium" @click="rejectModalOpen = false" fill="outline">Cancel</ion-button>
                    <ion-button color="danger" @click="rejectSubmission">
                        Decline Submission
                    </ion-button>
                </div>
            </ion-content>
        </ion-modal>

        <!-- Edit Feedback Modal -->
        <ion-modal :is-open="editFeedbackModalOpen" @didDismiss="editFeedbackModalOpen = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Edit Feedback</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="editFeedbackModalOpen = false">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <h3>Edit Feedback for "{{ submission?.song?.title }}"</h3>
                <p>Update your feedback to the artist.</p>

                <ion-item>
                    <ion-label position="stacked">Feedback to Artist</ion-label>
                    <ion-textarea v-model="editedFeedback" placeholder="Your feedback to the artist..."
                        :rows="4"></ion-textarea>
                </ion-item>

                <div class="modal-actions">
                    <ion-button color="medium" @click="editFeedbackModalOpen = false" fill="outline">Cancel</ion-button>
                    <ion-button color="primary" @click="updateFeedback">
                        Update Feedback
                    </ion-button>
                </div>
            </ion-content>
        </ion-modal>

        <!-- Artist History Modal -->
        <ion-modal :is-open="artistHistoryModalOpen" @didDismiss="artistHistoryModalOpen = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Artist Submission History</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="artistHistoryModalOpen = false">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <h3>{{ submission?.artist?.username }}'s Submission History</h3>

                <div v-if="loadingHistory" class="loading-history">
                    <ion-spinner name="dots"></ion-spinner>
                    <p>Loading artist's history...</p>
                </div>

                <div v-else-if="artistHistory.length === 0" class="empty-history">
                    <p>This artist has no other submissions with you.</p>
                </div>

                <ion-list v-else>
                    <ion-item v-for="historyItem in artistHistory" :key="historyItem.submission_id"
                        :class="{ 'current-submission': historyItem.submission_id === submission?.submission_id }">
                        <ion-label>
                            <h2>{{ historyItem.song?.title }}</h2>
                            <p>Submitted to: {{ historyItem.playlist?.name }}</p>
                            <div class="history-meta">
                                <ion-badge :color="getStatusColor(historyItem.status)">
                                    {{ formatStatus(historyItem.status) }}
                                </ion-badge>
                                <span>{{ formatDate(historyItem.submitted_at) }}</span>
                            </div>
                        </ion-label>
                        <ion-button v-if="historyItem.submission_id !== submission?.submission_id" slot="end"
                            fill="clear" :router-link="`/playlist-maker/submissions/${historyItem.submission_id}`"
                            @click="artistHistoryModalOpen = false">
                            View
                        </ion-button>
                    </ion-item>
                </ion-list>
            </ion-content>
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
    IonCardHeader, IonCardTitle, IonCardContent, IonThumbnail, IonLabel,
    IonBadge, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonItem, IonTextarea, IonNote, IonList
} from '@ionic/vue';
import {
    alertCircle, checkmarkCircle, closeCircle, timerOutline,
    play, open, checkmark, close, timer, person
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { SubmissionService } from '@/services/SubmissionService';
import { Submission, SubmissionStatus, TransactionStatus } from '@/types';
import { useToast } from '@/composables/useToast';

export default defineComponent({
    name: 'PlaylistMakerSubmissionDetail',
    components: {
        IonPage, IonContent, IonSpinner, IonIcon, IonButton, IonCard,
        IonCardHeader, IonCardTitle, IonCardContent, IonThumbnail, IonLabel,        IonBadge, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
        IonItem, IonTextarea, IonNote, IonList,
        AppHeader, BottomNavigation
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const { showToast } = useToast();

        const submissionId = computed(() => route.params.id as string);
        const submission = ref<Submission | null>(null);
        const loading = ref(true);
        const error = ref<string | null>(null);

        // Modal states
        const approveModalOpen = ref(false);
        const rejectModalOpen = ref(false);
        const editFeedbackModalOpen = ref(false);
        const artistHistoryModalOpen = ref(false);

        // Form data
        const approvalFeedback = ref('');
        const rejectionFeedback = ref('');
        const editedFeedback = ref('');
        const showFeedbackError = ref(false);

        // Artist history
        const artistHistory = ref<Submission[]>([]);
        const loadingHistory = ref(false);

        const fetchSubmission = async () => {
            try {
                loading.value = true;
                submission.value = await SubmissionService.getSubmission(submissionId.value);
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
                case SubmissionStatus.UNDER_REVIEW:
                    return 'In Review';
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
                case SubmissionStatus.UNDER_REVIEW:
                    return 'status-review';
                case SubmissionStatus.APPROVED:
                    return 'status-approved';
                case SubmissionStatus.REJECTED:
                    return 'status-rejected';
                default:
                    return '';
            }
        };

        const getStatusColor = (status: SubmissionStatus): string => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return 'warning';
                case SubmissionStatus.UNDER_REVIEW:
                    return 'tertiary';
                case SubmissionStatus.APPROVED:
                    return 'success';
                case SubmissionStatus.REJECTED:
                    return 'medium';
                default:
                    return 'medium';
            }
        };

        const getStatusIcon = (status: SubmissionStatus) => {
            switch (status) {
                case SubmissionStatus.PENDING:
                    return timerOutline;
                case SubmissionStatus.UNDER_REVIEW:
                    return timerOutline;
                case SubmissionStatus.APPROVED:
                    return checkmarkCircle;
                case SubmissionStatus.REJECTED:
                    return closeCircle;
                default:
                    return alertCircle;
            }
        };

        const formatFollowers = (count?: number): string => {
            if (!count) return '0';
            return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();
        };

        const formatTransactionStatus = (status: TransactionStatus): string => {
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

        // Action handlers
        const openApproveModal = () => {
            approvalFeedback.value = submission.value?.review_feedback || '';
            approveModalOpen.value = true;
        };

        const openRejectModal = () => {
            rejectionFeedback.value = submission.value?.review_feedback || '';
            rejectModalOpen.value = true;
        };

        const openEditFeedbackModal = () => {
            editedFeedback.value = submission.value?.review_feedback || '';
            editFeedbackModalOpen.value = true;
        };

        const markAsUnderReview = async () => {
            if (!submission.value) return;

            try {
                const updatedSubmission = await SubmissionService.updateSubmissionStatus(
                    submission.value.submission_id,
                    SubmissionStatus.UNDER_REVIEW
                );

                submission.value = updatedSubmission;
                showToast('Submission marked as "In Review"', 'success');
            } catch (err) {
                showToast('Failed to update submission status', 'danger');
                console.error(err);
            }
        };

        const approveSubmission = async () => {
            if (!submission.value) return;

            try {
                const updatedSubmission = await SubmissionService.updateSubmissionStatus(
                    submission.value.submission_id,
                    SubmissionStatus.APPROVED,
                    approvalFeedback.value
                );

                submission.value = updatedSubmission;
                approveModalOpen.value = false;
                showToast('Submission approved successfully', 'success');
            } catch (err) {
                showToast('Failed to approve submission', 'danger');
                console.error(err);
            }
        };

        const rejectSubmission = async () => {
            if (!submission.value) return;

            if (!rejectionFeedback.value.trim()) {
                showFeedbackError.value = true;
                return;
            }

            try {
                const updatedSubmission = await SubmissionService.updateSubmissionStatus(
                    submission.value.submission_id,
                    SubmissionStatus.REJECTED,
                    rejectionFeedback.value
                );

                submission.value = updatedSubmission;
                rejectModalOpen.value = false;
                showFeedbackError.value = false;
                showToast('Submission declined', 'success');
            } catch (err) {
                showToast('Failed to decline submission', 'danger');
                console.error(err);
            }
        };

        const updateFeedback = async () => {
            if (!submission.value) return;

            try {
                // Re-update the status with the new feedback
                const updatedSubmission = await SubmissionService.updateSubmissionStatus(
                    submission.value.submission_id,
                    submission.value.status,
                    editedFeedback.value
                );

                submission.value = updatedSubmission;
                editFeedbackModalOpen.value = false;
                showToast('Feedback updated successfully', 'success');
            } catch (err) {
                showToast('Failed to update feedback', 'danger');
                console.error(err);
            }
        };

        const showArtistHistory = async () => {
            if (!submission.value?.artist?.user_id) return;

            artistHistoryModalOpen.value = true;
            loadingHistory.value = true;

            try {
                const response = await SubmissionService.getSubmissionsByArtist(submission.value.artist.user_id);
                artistHistory.value = response.data;
            } catch (err) {
                console.error('Failed to load artist history:', err);
            } finally {
                loadingHistory.value = false;
            }
        };

        return {
            submission,
            loading,
            error,
            // Format helpers
            formatDate,
            formatStatus,
            formatFollowers,
            formatTransactionStatus,
            getTransactionStatusColor,
            getStatusClass,
            getStatusColor,
            getStatusIcon,
            formatCurrency,
            // Modal states
            approveModalOpen,
            rejectModalOpen,
            editFeedbackModalOpen,
            artistHistoryModalOpen,
            // Form data
            approvalFeedback,
            rejectionFeedback,
            editedFeedback,
            showFeedbackError,
            // Artist history
            artistHistory,
            loadingHistory,
            // Action handlers
            openApproveModal,
            openRejectModal,
            openEditFeedbackModal,
            markAsUnderReview,
            approveSubmission,
            rejectSubmission,
            updateFeedback,
            showArtistHistory,
            // Icons
            alertCircleIcon: alertCircle,
            checkmarkIcon: checkmark,
            closeIcon: close,
            timerIcon: timer,
            playIcon: play,
            openIcon: open,
            personIcon: person
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
.error-container,
.loading-history,
.empty-history {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    text-align: center;
}

.loading-history,
.empty-history {
    height: auto;
    min-height: 150px;
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

.curator-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.main-info-card,
.playlist-card,
.details-card,
.message-card,
.feedback-card {
    margin-bottom: 1rem;
}

.song-artist-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

@media (min-width: 768px) {
    .song-artist-container {
        flex-direction: row;
        gap: 2rem;
    }

    .song-info,
    .artist-info {
        flex: 1;
    }
}

.song-info h3,
.artist-info h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--ion-color-medium);
}

.song-details,
.artist-details {
    display: flex;
    align-items: flex-start;
}

.song-thumbnail,
.playlist-thumbnail {
    --border-radius: 8px;
    width: 80px;
    height: 80px;
    margin-right: 1rem;
}

.song-text h4,
.artist-text h4,
.playlist-details h4 {
    margin: 0 0 0.25rem;
    font-weight: 600;
}

.song-text p,
.artist-text p,
.playlist-details p {
    margin: 0 0 0.25rem;
    color: var(--ion-color-medium);
}

.playlist-info {
    display: flex;
    align-items: flex-start;
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

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
}

.history-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.current-submission {
    --background: rgba(var(--ion-color-primary-rgb), 0.05);
    font-weight: 500;
}
</style>
