<template>
    <ion-page>
        <app-header title="Submissions" :back-button="true" back-url="/playlist-maker/dashboard"></app-header>

        <ion-content :fullscreen="true" class="submissions-content">
            <div class="submissions-container">
                <!-- Filters Header -->
                <div class="filters-header">
                    <div class="search-filter">
                        <ion-searchbar v-model="searchQuery" placeholder="Search submissions..."
                            @ionInput="handleSearch" class="submission-search"></ion-searchbar>
                    </div>

                    <div class="status-filter">
                        <ion-segment v-model="selectedStatus" @ionChange="handleStatusChange" class="status-segment">
                            <ion-segment-button value="all">All</ion-segment-button>
                            <ion-segment-button value="pending">Pending</ion-segment-button>
                            <ion-segment-button value="approved">Approved</ion-segment-button>
                            <ion-segment-button value="rejected">Rejected</ion-segment-button>
                        </ion-segment>
                    </div>

                    <div class="playlist-filter">
                        <ion-item class="playlist-select-item">
                            <ion-label>Playlist</ion-label>
                            <ion-select v-model="selectedPlaylist" interface="action-sheet" placeholder="All Playlists"
                                @ionChange="handlePlaylistChange">
                                <ion-select-option value="all">All Playlists</ion-select-option>
                                <ion-select-option v-for="playlist in playlists" :key="playlist.playlist_id"
                                    :value="playlist.playlist_id">
                                    {{ playlist.name }}
                                </ion-select-option>
                            </ion-select>
                        </ion-item>
                    </div>
                </div>

                <!-- Content -->
                <div v-if="loading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading submissions...</p>
                </div>                <empty-state-display 
                    v-else-if="filteredSubmissions.length === 0"
                    :icon="documentTextIcon"
                    title="No submissions found"
                    :message="getEmptyStateMessage()"
                    resource-type="playlist-submissions">
                    <template #actions>
                        <ion-button fill="outline" @click="resetFilters">
                            Reset Filters
                        </ion-button>
                    </template>
                </empty-state-display>                <div v-else class="submissions-list-container">
                    <div class="submissions-count">
                        <span>{{ filteredSubmissions.length }} submission{{ filteredSubmissions.length !== 1 ? 's' : ''
                        }}</span>
                    </div>

                    <ion-list class="submissions-list">
                        <ion-item-sliding v-for="submission in filteredSubmissions" :key="submission.submission_id">
                            <ion-item :detail="true" class="submission-item"
                                :router-link="`/playlist-maker/submissions/${submission.submission_id}`">
                                <ion-thumbnail slot="start" class="submission-thumbnail">
                                    <img :src="submission.song?.cover_image_url || '@/assets/logo.png'"
                                        :alt="submission.song?.title" />
                                </ion-thumbnail>

                                <ion-label>
                                    <h2>{{ submission.song?.title }}</h2>
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
                        </ion-item-sliding>
                    </ion-list>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="pagination">
                        <ion-button fill="clear" :disabled="currentPage === 1" @click="prevPage">
                            <ion-icon :icon="chevronBackIcon" slot="icon-only"></ion-icon>
                        </ion-button>

                        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>

                        <ion-button fill="clear" :disabled="currentPage === totalPages" @click="nextPage">
                            <ion-icon :icon="chevronForwardIcon" slot="icon-only"></ion-icon>
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>

        <!-- Feedback Modal -->
        <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="feedback-modal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>{{ getFeedbackModalTitle() }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeModal">
                            <ion-icon :icon="closeCircleIcon" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding">
                <div v-if="currentSubmission" class="feedback-form">
                    <div class="submission-preview">
                        <ion-thumbnail class="preview-thumbnail">
                            <img :src="currentSubmission.song?.cover_image_url || '/assets/default-album-cover.png'"
                                :alt="currentSubmission.song?.title" />
                        </ion-thumbnail>

                        <div class="preview-details">
                            <h3>{{ currentSubmission.song?.title }}</h3>
                            <p>{{ currentSubmission.song?.artist_name_on_platform }}</p>
                            <p>For: {{ currentSubmission.playlist?.name }}</p>
                        </div>
                    </div>

                    <div class="feedback-section">
                        <ion-item>
                            <ion-label position="stacked">Feedback to Artist (optional)</ion-label>
                            <ion-textarea v-model="feedbackText" placeholder="Add a note about your decision..."
                                :rows="4"></ion-textarea>
                        </ion-item>

                        <div class="feedback-template-buttons">
                            <ion-button size="small" fill="outline" @click="useTemplate('Great song!')"
                                class="template-btn">
                                Great song!
                            </ion-button>
                            <ion-button size="small" fill="outline" @click="useTemplate('Good production quality')"
                                class="template-btn">
                                Good production
                            </ion-button>
                            <ion-button size="small" fill="outline" @click="useTemplate('Not a fit for this playlist')"
                                class="template-btn">
                                Not a fit
                            </ion-button>
                            <ion-button size="small" fill="outline" @click="useTemplate('Need better mixing')"
                                class="template-btn">
                                Need better mixing
                            </ion-button>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <ion-button fill="outline" @click="closeModal">
                            Cancel
                        </ion-button>

                        <ion-button @click="submitFeedback" :color="feedbackActionColor" :disabled="processingFeedback">
                            <ion-spinner v-if="processingFeedback" name="crescent"></ion-spinner>
                            <span v-else>{{ feedbackActionText }}</span>
                        </ion-button>
                    </div>
                </div>
            </ion-content>
        </ion-modal>
        
        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="submissions"></bottom-navigation>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import {
    IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonList,
    IonItem, IonItemSliding, IonItemOption, IonItemOptions, IonThumbnail,
    IonLabel, IonButton, IonIcon, IonBadge, IonSpinner, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonTextarea, IonSelect, IonSelectOption,
    IonRadioGroup, IonRadio, IonCheckbox, toastController
} from '@ionic/vue';
import {
    documentText, musicalNotes, calendar, eye, checkmark, close, chevronBack,
    chevronForward, closeCircle
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { SubmissionService } from '@/services/SubmissionService';
import { PlaylistService } from '@/services/PlaylistService';
import { usePagination } from '@/composables';
import { useAuthStore, usePlaylistStore } from '@/store';
import { Submission, Playlist, SubmissionStatus } from '@/types';

interface SelectableSubmission extends Submission {
    selected: boolean;
}

export default defineComponent({
    name: 'PlaylistMakerSubmissions',    components: {
        IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonList,
        IonItem, IonItemSliding, IonItemOption, IonItemOptions, IonThumbnail,
        IonLabel, IonButton, IonIcon, IonBadge, IonSpinner, IonModal, IonHeader,
        IonToolbar, IonTitle, IonButtons, IonTextarea, IonSelect, IonSelectOption,
        IonRadioGroup, IonRadio, IonCheckbox, AppHeader, EmptyStateDisplay, BottomNavigation
    },
    setup() {
        const authStore = useAuthStore();
        const playlistStore = usePlaylistStore();
        const userId = computed(() => authStore.user?.user_id || '');

        const searchQuery = ref('');
        const selectedStatus = ref('all');
        const selectedPlaylist = ref('all');
        const loading = ref(true);
        const submissions = ref<Submission[]>([]);
        const playlists = ref<Playlist[]>([]);

        // Pagination
        const {
            currentPage, totalPages,
            itemsPerPage, changePage, prevPage, nextPage
        } = usePagination();
        const totalItems = ref(0);
        
        // Alias for consistency with the rest of the code
        const goToPage = changePage;        // Feedback Modal
        const isModalOpen = ref(false);
        const feedbackText = ref('');
        const currentSubmission = ref<Submission | null>(null);
        const feedbackAction = ref<SubmissionStatus | null>(null);
        const processingFeedback = ref(false);

        onMounted(async () => {
            if (userId.value) {
                // Check if we have a selected playlist from the store
                if (playlistStore.selectedPlaylistId) {
                    selectedPlaylist.value = playlistStore.selectedPlaylistId;
                    // Clear the store value after using it
                    playlistStore.setSelectedPlaylistId(null);
                }

                await Promise.all([
                    fetchSubmissions(),
                    fetchPlaylists()
                ]);
            }
        });

        const fetchSubmissions = async () => {
            try {
                loading.value = true;

                const skip = (currentPage.value - 1) * itemsPerPage.value;
                let statusFilter = selectedStatus.value !== 'all' ? selectedStatus.value as SubmissionStatus : undefined;
                let playlistFilter = selectedPlaylist.value !== 'all' ? selectedPlaylist.value : undefined;

                const response = await SubmissionService.getSubmissionsByCreator(
                    userId.value,
                    skip,
                    itemsPerPage.value,
                    statusFilter,
                    playlistFilter
                );

                submissions.value = response.data;
                totalItems.value = response.total;
            } catch (error) {
                showToast('Failed to load submissions', 'danger');
            } finally {
                loading.value = false;
            }
        };

        const fetchPlaylists = async () => {
            try {
                // Get all playlists for the filter dropdown
                const response = await PlaylistService.getPlaylistsByCreator(userId.value, 0, 100);
                playlists.value = response.data;
            } catch (error) {
                console.error('Failed to load playlists:', error);
            }
        };

        watch(currentPage, () => {
            fetchSubmissions();
        });

        const filteredSubmissions = computed(() => {
            let result = [...submissions.value];

            // Apply search filter
            if (searchQuery.value) {
                const searchLower = searchQuery.value.toLowerCase();
                result = result.filter(submission =>
                    (submission.song?.title.toLowerCase().includes(searchLower)) ||
                    (submission.song?.artist_name_on_platform.toLowerCase().includes(searchLower)) ||
                    (submission.playlist?.name.toLowerCase().includes(searchLower))
                );
            }

            return result;
        });

        const handleSearch = (event: CustomEvent) => {
            searchQuery.value = event.detail.value || '';
        };

        const handleStatusChange = () => {
            // Reset to first page when status changes
            goToPage(1);
            fetchSubmissions();
        };

        const handlePlaylistChange = () => {
            // Reset to first page when playlist changes
            goToPage(1);
            fetchSubmissions();
        };

        const resetFilters = () => {
            searchQuery.value = '';
            selectedStatus.value = 'all';
            selectedPlaylist.value = 'all';
            goToPage(1);
            fetchSubmissions();
        };

        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };        const formatStatus = (status: string): string => {
            switch (status) {
                case 'pending':
                    return 'Pending';
                case 'approved':
                    return 'Approved';
                case 'rejected':
                    return 'Rejected';
                default:
                    return 'Unknown';
            }
        };

        const getEmptyStateMessage = (): string => {
            if (selectedStatus.value === 'all' && selectedPlaylist.value === 'all') {
                return 'You don\'t have any submissions yet';
            } else if (selectedStatus.value !== 'all' && selectedPlaylist.value === 'all') {
                return `No submissions with status: ${formatStatus(selectedStatus.value)}`;
            } else if (selectedStatus.value === 'all' && selectedPlaylist.value !== 'all') {
                return 'No submissions for the selected playlist';
            } else {
                return `No ${formatStatus(selectedStatus.value)} submissions for the selected playlist`;
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
        };

        const approveSubmission = (submission: Submission) => {
            openFeedbackModal(submission, SubmissionStatus.APPROVED);
        };

        const rejectSubmission = (submission: Submission) => {
            openFeedbackModal(submission, SubmissionStatus.REJECTED);
        };

        const openFeedbackModal = (submission: Submission, action: SubmissionStatus) => {
            currentSubmission.value = submission;
            feedbackAction.value = action;
            feedbackText.value = '';
            isModalOpen.value = true;
        };

        const closeModal = () => {
            isModalOpen.value = false;
            currentSubmission.value = null;
            feedbackAction.value = null;
            feedbackText.value = '';
        };

        const getFeedbackModalTitle = (): string => {
            if (!feedbackAction.value) return 'Review Submission';

            switch (feedbackAction.value) {
                case SubmissionStatus.APPROVED:
                    return 'Approve Submission';
                case SubmissionStatus.REJECTED:
                    return 'Reject Submission';
                default:
                    return 'Review Submission';
            }
        };

        const feedbackActionColor = computed((): string => {
            if (!feedbackAction.value) return 'primary';

            switch (feedbackAction.value) {
                case SubmissionStatus.APPROVED:
                    return 'success';
                case SubmissionStatus.REJECTED:
                    return 'medium';
                default:
                    return 'primary';
            }
        });

        const feedbackActionText = computed((): string => {
            if (!feedbackAction.value) return 'Submit';

            switch (feedbackAction.value) {
                case SubmissionStatus.APPROVED:
                    return 'Approve';
                case SubmissionStatus.REJECTED:
                    return 'Reject';
                default:
                    return 'Submit';
            }
        });

        const submitFeedback = async () => {
            if (!currentSubmission.value || !feedbackAction.value) return;

            try {
                processingFeedback.value = true;

                const updatedSubmission = await SubmissionService.updateSubmissionStatus(
                    currentSubmission.value.submission_id,
                    feedbackAction.value,
                    feedbackText.value || undefined
                );

                // Update the submission in the list
                const index = submissions.value.findIndex(s => s.submission_id === updatedSubmission.submission_id);
                if (index !== -1) {
                    submissions.value[index] = updatedSubmission;
                }

                closeModal();

                showToast(`Submission successfully ${formatAction(feedbackAction.value)}`, 'success');
            } catch (error) {
                showToast('Failed to update submission status', 'danger');
            } finally {
                processingFeedback.value = false;
            }
        };

        const formatAction = (action: SubmissionStatus): string => {
            switch (action) {
                case SubmissionStatus.APPROVED:
                    return 'approved';
                case SubmissionStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'updated';
            }
        };        const useTemplate = (template: string) => {
            feedbackText.value = template;
        };

        const showToast = async (message: string, color: string = 'primary') => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                color
            });

            await toast.present();
        };        return {
            searchQuery,
            selectedStatus,
            selectedPlaylist,
            loading,
            submissions,
            playlists,
            filteredSubmissions,
            currentPage,
            totalPages,
            isModalOpen,
            feedbackText,
            currentSubmission,
            feedbackAction,
            processingFeedback,
            documentTextIcon: documentText,
            musicalNotesIcon: musicalNotes,
            calendarIcon: calendar,
            eyeIcon: eye,
            checkmarkIcon: checkmark,
            closeIcon: close,
            chevronBackIcon: chevronBack,
            chevronForwardIcon: chevronForward,
            closeCircleIcon: closeCircle,
            handleSearch,
            handleStatusChange,
            handlePlaylistChange,
            resetFilters,
            formatDate,
            formatStatus,
            getEmptyStateMessage,
            getStatusColor,
            approveSubmission,
            rejectSubmission,
            closeModal,
            getFeedbackModalTitle,
            feedbackActionColor,
            feedbackActionText,
            submitFeedback,
            useTemplate,
            prevPage,
            nextPage
        };
    }
});
</script>

<style scoped>
.submissions-content {
    --background: #f8f9fa;
}

.submissions-container {
    padding: 1rem;
    max-width: 1000px;
    margin: 0 auto;
}

/* Filters Header */
.filters-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

@media (min-width: 576px) {
    .filters-header {
        flex-direction: row;
        flex-wrap: wrap;
    }

    .search-filter,
    .status-filter,
    .playlist-filter {
        flex: 1 1 100%;
    }
}

@media (min-width: 992px) {
    .search-filter {
        flex: 1 1 30%;
    }

    .status-filter {
        flex: 1 1 40%;
    }

    .playlist-filter {
        flex: 1 1 30%;
    }
}

.submission-search {
    --box-shadow: none;
    --border-radius: 8px;
    margin: 0;
}

.status-segment {
    --background: var(--ion-color-light);
    border-radius: 8px;
    overflow: hidden;
}

.playlist-select-item {
    --padding-start: 0;
    --border-radius: 8px;
    --background: var(--ion-color-light);
}

/* Loading and Empty States */
.loading-container,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
    font-size: 4rem;
    color: var(--ion-color-medium);
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.empty-state p {
    margin-bottom: 1.5rem;
    color: var(--ion-color-medium);
}

/* Submissions List */
.submissions-count {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    color: var(--ion-color-medium);
    font-size: 0.9rem;
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

.submission-item ion-label h2 {
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.submission-thumbnail {
    --border-radius: 8px;
    width: 56px;
    height: 56px;
}

.submission-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.meta-icon {
    vertical-align: middle;
    margin-right: 0.25rem;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1.5rem;
}

.page-info {
    margin: 0 1rem;
    font-size: 0.9rem;
    color: var(--ion-color-medium);
}

/* Feedback Modal */
.submission-preview {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--ion-color-light);
}

.preview-thumbnail {
    width: 64px;
    height: 64px;
    --border-radius: 8px;
    margin-right: 1rem;
}

.preview-details h3 {
    margin: 0 0 0.25rem;
    font-weight: 600;
}

.preview-details p {
    margin: 0 0 0.25rem;
    color: var(--ion-color-medium);
}

.feedback-section {
    margin-bottom: 1.5rem;
}

.feedback-template-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.template-btn {
    --padding-start: 0.75rem;
    --padding-end: 0.75rem;
    height: 2rem;
    font-size: 0.8rem;
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

/* Batch Modal */
.batch-subtitle {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 1.5rem 0 1rem;
}

.batch-thumbnail {
    width: 40px;
    height: 40px;
    --border-radius: 4px;
    margin-right: 1rem;
}

.batch-playlist-name {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.no-pending-submissions {
    text-align: center;
    color: var(--ion-color-medium);
    padding: 2rem;
}

.batch-feedback-item {
    margin-top: 1.5rem;
}

.batch-actions {
    margin-top: 2rem;
}
</style>
