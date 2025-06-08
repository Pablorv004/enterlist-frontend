<template>
    <ion-page>
        <app-header title="My Submissions" :back-button="true" back-url="/artist/dashboard"></app-header>

        <ion-content :fullscreen="true" class="submissions-content">
            <div class="submissions-container">                <!-- Actions Header -->
                <div class="actions-header">
                    <ion-segment v-model="selectedFilter" @ionChange="handleFilterChange" class="filter-segment">
                        <ion-segment-button value="all">All</ion-segment-button>
                        <ion-segment-button value="pending">Pending</ion-segment-button>
                        <ion-segment-button value="approved">Approved</ion-segment-button>
                        <ion-segment-button value="rejected">Rejected</ion-segment-button>
                    </ion-segment>

                    <ion-button router-link="/artist/submissions/new" class="new-btn">
                        <ion-icon :icon="addIcon" slot="start"></ion-icon>
                        New Submission
                    </ion-button>
                </div>

                <!-- Search Bar -->
                <div class="search-container">
                    <ion-searchbar 
                        v-model="searchQuery"
                        @ionInput="handleSearch"
                        placeholder="Search by song title, album, or playlist..."
                        class="submission-search">
                    </ion-searchbar>
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
                    resource-type="submissions">
                    <template #actions>
                        <ion-button router-link="/artist/submissions/new" color="primary">
                            Submit a Song
                        </ion-button>
                    </template>
                </empty-state-display>

                <div v-else class="submissions-list-container">
                    <ion-list class="submissions-list">
                        <ion-item v-for="submission in filteredSubmissions" :key="submission.submission_id"
                            :router-link="`/artist/submissions/${submission.submission_id}`" :detail="true"
                            class="submission-item">
                            <div class="submission-content">
                                <div class="submission-left">
                                    <ion-thumbnail class="submission-thumbnail">
                                        <img :src="submission.song?.cover_image_url || '/assets/default-album-cover.png'"
                                            :alt="submission.song?.title" />
                                    </ion-thumbnail>
                                </div>

                                <div class="submission-middle">
                                    <div class="submission-song-details">
                                        <h3 class="submission-title">{{ submission.song?.title }}</h3>
                                        <p class="submission-album">{{ submission.song?.album_name || 'Single' }}</p>
                                    </div>

                                    <div class="submission-playlist-details">                                        <p class="submission-playlist">
                                            <ion-icon :icon="musicalNotesIcon" class="details-icon"></ion-icon>
                                            {{ submission.playlist?.name }}
                                            <ion-chip v-if="submission.playlist?.submission_fee" size="small" color="primary" class="fee-chip">
                                                ${{ submission.playlist?.submission_fee }}
                                            </ion-chip>
                                        </p>
                                        <p class="submission-date">
                                            <ion-icon :icon="calendarIcon" class="details-icon"></ion-icon>
                                            {{ formatDate(submission.submitted_at) }}
                                        </p>
                                    </div>
                                </div>

                                <div class="submission-right">
                                    <ion-badge :color="getStatusColor(submission.status)" class="status-badge">
                                        {{ formatStatus(submission.status) }}
                                    </ion-badge>
                                </div>
                            </div>
                        </ion-item>
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
            </div>        </ion-content>
        
        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="submissions" />
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, computed, watch } from 'vue';
import {
    IonPage,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonThumbnail,
    IonBadge,
    IonSpinner,
    IonLabel,
    IonSearchbar
} from '@ionic/vue';
import {
    add as addIcon,
    home as homeIcon,
    documentText as documentTextIcon,
    musicalNotes as musicalNotesIcon,
    person as personIcon,
    calendar as calendarIcon,
    checkmarkCircle as checkmarkIcon,
    closeCircle as closeIcon,
    chevronBack as chevronBackIcon,
    chevronForward as chevronForwardIcon
} from 'ionicons/icons';
import { useAuthStore, useSubmissionStore } from '@/store';
import { SubmissionStatus, Submission } from '@/types';
import { usePagination } from '@/composables';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';

export default defineComponent({
    name: 'ArtistSubmissions',    components: {
        AppHeader,
        EmptyStateDisplay,
        BottomNavigation,
        IonPage,
        IonContent,
        IonSegment,
        IonSegmentButton,
        IonButton,
        IonIcon,
        IonList,
        IonItem,
        IonThumbnail,
        IonBadge,
        IonSpinner,
        IonLabel,
        IonSearchbar
    },
    setup() {
        const authStore = useAuthStore();
        const submissionStore = useSubmissionStore();        const loading = ref(true);
        const selectedFilter = ref('all');
        const searchQuery = ref('');
        const totalSubmissions = ref(0);

        // Pagination
        const { currentPage, itemsPerPage, totalPages, skip, changePage, prevPage, nextPage } = usePagination(totalSubmissions, 10);

        // Get current user
        const user = computed(() => authStore.user);        // Filtered submissions
        const filteredSubmissions = computed(() => {
            let result = submissionStore.submissions;
            
            // Apply status filter
            if (selectedFilter.value !== 'all') {
                result = result.filter((s: { status: string; }) => s.status === selectedFilter.value);
            }
            
            // Apply search filter
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase();
                result = result.filter((submission: any) => {
                    return (
                        submission.song?.title?.toLowerCase().includes(query) ||
                        submission.song?.album_name?.toLowerCase().includes(query) ||
                        submission.playlist?.name?.toLowerCase().includes(query)
                    );
                });
            }
            
            return result;
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
        };        // Format filter label
        const formatFilter = (filter: string) => {
            return filter.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
        };

        // Get empty state message based on current filters
        const getEmptyStateMessage = (): string => {
            if (searchQuery.value) {
                return `No submissions found matching "${searchQuery.value}"`;
            }
            
            if (selectedFilter.value === 'all') {
                return 'You haven\'t submitted any songs yet';
            } else {
                return `No submissions with status: ${formatFilter(selectedFilter.value)}`;
            }
        };// Handle filter change
        const handleFilterChange = () => {
            // Reset pagination when filter changes
            changePage(1);
            loadSubmissions();
        };

        // Handle search input
        const handleSearch = (event: CustomEvent) => {
            searchQuery.value = event.detail.value || '';
        };

        // Load submissions data
        const loadSubmissions = async () => {
            if (!user.value?.user_id) return;

            loading.value = true;

            try {
                await submissionStore.fetchSubmissionsByArtist(user.value.user_id, skip.value, itemsPerPage.value);
                totalSubmissions.value = submissionStore.totalCount;
            } catch (error) {
                console.error('Failed to load submissions:', error);
            } finally {
                loading.value = false;
            }
        };

        // Watch for pagination changes
        watch([currentPage, itemsPerPage], () => {
            loadSubmissions();
        });        onMounted(() => {
            loadSubmissions();
        });

        onUnmounted(() => {
            // Cancel any pending requests when component is unmounted
            submissionStore.cancelAllRequests();
        });        return {
            loading,
            selectedFilter,
            searchQuery,
            filteredSubmissions,
            currentPage,
            totalPages,            formatDate,
            getStatusColor,
            formatStatus,
            formatFilter,
            getEmptyStateMessage,
            handleFilterChange,
            handleSearch,
            prevPage,
            nextPage,
            // Icons
            addIcon,
            homeIcon,
            documentTextIcon,
            musicalNotesIcon,
            personIcon,
            calendarIcon,
            checkmarkIcon,
            closeIcon,
            chevronBackIcon,
            chevronForwardIcon
        };
    }
});
</script>

<style scoped>
.submissions-content {
    --background: #f8f9fa;
}

.submissions-container {
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
}

.actions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.filter-segment {
    --background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    flex-grow: 1;
}

.new-btn {
    --background: var(--ion-color-primary);
    --border-radius: 8px;
    font-weight: 500;
}

.search-container {
    margin-bottom: 16px;
}

.submission-search {
    --background: white;
    --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    --border-radius: 8px;
    margin: 0;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 0;
}

.loading-container p {
    margin-top: 16px;
    color: var(--ion-color-medium);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 0;
    text-align: center;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
    font-size: 48px;
    color: var(--ion-color-medium);
    margin-bottom: 16px;
}

.submissions-list-container {
    margin-bottom: 24px;
}

.submissions-list {
    background: transparent;
    padding: 0;
    margin-bottom: 16px;
}

.submission-item {
    --background: white;
    --border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    --padding-start: 0;
    --inner-padding-end: 0;
}

.submission-content {
    display: flex;
    width: 100%;
    padding: 12px;
    align-items: center;
}

.submission-left {
    margin-right: 16px;
}

.submission-thumbnail {
    --border-radius: 8px;
    width: 64px;
    height: 64px;
}

.submission-middle {
    flex: 1;
    min-width: 0;
}

.submission-song-details {
    margin-bottom: 8px;
}

.submission-title {
    font-weight: 600;
    font-size: 16px;
    margin: 0;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
}

.submission-album {
    font-size: 14px;
    color: var(--ion-color-medium);
    margin: 0;
}

.submission-playlist-details {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.submission-playlist,
.submission-date {
    font-size: 13px;
    display: flex;
    align-items: center;
    margin: 0;
    color: var(--ion-color-medium);
}

.details-icon {
    font-size: 16px;
    margin-right: 4px;
}

.submission-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-left: 16px;
}

.status-badge {
    text-transform: capitalize;
    font-weight: 500;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 6px;
}

.review-feedback {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-top: 8px;
}

.review-feedback ion-icon {
    margin-right: 4px;
}

.success {
    color: var(--ion-color-success);
}

.error {
    color: var(--ion-color-danger);
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
}

.page-info {
    margin: 0 16px;
    font-size: 14px;
    color: var(--ion-color-medium);
}

.fee-chip {
    margin-left: 5px;
    font-size: 10px;
    height: 18px;
    vertical-align: middle;
}

/* Media queries */
@media (max-width: 767px) {
    .actions-header {
        flex-direction: column;
        align-items: stretch;
    }

    .new-btn {
        width: 100%;
    }

    .submission-content {
        flex-direction: column;
        align-items: flex-start;
    }

    .submission-left {
        margin-right: 0;
        margin-bottom: 12px;
    }

    .submission-right {
        margin-left: 0;
        margin-top: 12px;
        align-items: flex-start;
    }

    .submission-playlist-details {
        flex-direction: column;
        gap: 4px;
    }
}
</style>
