<template>
    <ion-page>
        <app-header title="My Playlists" :back-button="true" back-url="/playlist-maker/dashboard"></app-header>

        <ion-content :fullscreen="true" class="playlists-content">
            <div class="playlists-container">
                <!-- Actions Header -->
                <div class="actions-header">
                    <ion-searchbar v-model="searchQuery" placeholder="Search playlists..." @ionInput="handleSearch"
                        class="playlist-search"></ion-searchbar>

                    <div class="filter-segment-container">
                        <ion-segment v-model="selectedFilter" @ionChange="handleFilterChange" class="filter-segment">
                            <ion-segment-button value="all">All</ion-segment-button>
                            <ion-segment-button value="active">Active</ion-segment-button>
                            <ion-segment-button value="inactive">Inactive</ion-segment-button>
                        </ion-segment>
                    </div>

                    <ion-button @click="importPlaylistsModal" class="import-btn">
                        <ion-icon :icon="cloudDownloadIcon" slot="start"></ion-icon>
                        Import Playlists
                    </ion-button>
                </div>

                <!-- Content -->
                <div v-if="loading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading your playlists...</p>
                </div>
                
                <empty-state-display 
                    v-else-if="filteredPlaylists.length === 0 && !searchQuery"
                    :icon="musicalNotesIcon"
                    title="No playlists yet"
                    message="Import your playlists from connected music platforms"
                    resource-type="playlists">
                    <template #actions>
                        <ion-button @click="importPlaylistsModal">
                            Import Playlists
                        </ion-button>
                        <ion-button fill="outline" router-link="/playlist-maker/linked-accounts">
                            Connect Accounts
                        </ion-button>
                    </template>
                </empty-state-display>
                
                <empty-state-display 
                    v-else-if="filteredPlaylists.length === 0 && searchQuery"
                    :icon="searchIcon"
                    title="No results found"
                    :message="`No playlists matching &quot;${searchQuery}&quot;`">
                    <template #actions>
                        <ion-button @click="clearSearch" fill="outline">
                            Clear Search
                        </ion-button>
                    </template>
                </empty-state-display>

                <div v-else class="playlists-grid-container">
                    <ion-grid class="playlists-grid">
                        <ion-row>
                            <ion-col size="12" size-sm="6" size-md="4" size-lg="3" v-for="playlist in filteredPlaylists"
                                :key="playlist.playlist_id">
                                <ion-card class="playlist-card" @click="showPlaylistDetails(playlist)">
                                    <div class="playlist-img-container">
                                        <img :src="playlist.cover_image_url || '/assets/default-playlist-cover.png'"
                                            :alt="playlist.name" class="playlist-img" />
                                        <div class="playlist-platform">
                                            <img :src="getPlatformIcon(playlist.platform?.name)"
                                                :alt="playlist.platform?.name" class="platform-icon" />
                                        </div>
                                        <div class="playlist-status"
                                            :class="{ 'status-inactive': !playlist.is_visible }">
                                            {{ playlist.is_visible ? 'Active' : 'Inactive' }}
                                        </div>
                                    </div>

                                    <ion-card-content>
                                        <h3 class="playlist-name">{{ playlist.name }}</h3>
                                        <div class="playlist-details">
                                            <div class="playlist-tracks">
                                                <ion-icon :icon="musicalNotesIcon" class="details-icon"></ion-icon>
                                                {{playlist.track_count || 'Unknown'}} Tracks
                                            </div>

                                            <div v-if="playlist.genre" class="playlist-genre">
                                                <ion-icon :icon="pricetagIcon" class="details-icon"></ion-icon>
                                                {{ playlist.genre }}
                                            </div>

                                            <div v-if="playlist.submission_fee" class="playlist-fee">
                                                <ion-icon :icon="pricetagIcon" class="details-icon"></ion-icon>
                                                ${{ playlist.submission_fee }}
                                            </div>
                                        </div>

                                        <div class="playlist-stats">
                                            <div class="stat-item">
                                                <span class="stat-value">{{ getSubmissionCount(playlist.playlist_id)
                                                    }}</span>
                                                <span class="stat-label">Submissions</span>
                                            </div>

                                            <div class="stat-item">
                                                <span class="stat-value">{{ getApprovedCount(playlist.playlist_id)
                                                    }}</span>
                                                <span class="stat-label">Approved</span>
                                            </div>

                                            <div class="stat-item">
                                                <span class="stat-value">{{
                                                    formatCurrency(getEarnings(playlist.playlist_id)) }}</span>
                                                <span class="stat-label">Earned</span>
                                            </div>
                                        </div>
                                          <div class="playlist-actions">
                                            <ion-button fill="clear" size="small"
                                                @click.stop="toggleVisibility(playlist)">
                                                <ion-icon
                                                    :icon="playlist.is_visible ? eyeOffOutlineIcon : eyeOutlineIcon"
                                                    slot="icon-only"></ion-icon>
                                            </ion-button>

                                            <ion-button fill="clear" size="small"
                                                @click.stop="viewSubmissions(playlist)">
                                                <ion-icon :icon="mailUnreadIcon" slot="icon-only"></ion-icon>
                                            </ion-button>

                                            <ion-button fill="clear" size="small" :href="playlist.url" target="_blank"
                                                @click.stop>
                                                <ion-icon :icon="openIcon" slot="icon-only"></ion-icon>
                                            </ion-button>

                                            <ion-button fill="clear" size="small" color="danger"
                                                @click.stop="confirmDeletePlaylist(playlist)">
                                                <ion-icon :icon="trashIcon" slot="icon-only"></ion-icon>
                                            </ion-button>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

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
        </ion-content>        <!-- Playlist Details Modal -->
        <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="playlist-details-modal">
            <playlist-details-modal 
                v-if="selectedPlaylist"
                :playlist="selectedPlaylist"
                @playlist-updated="handlePlaylistUpdated"
                @view-submissions="handleViewSubmissions"
            />
        </ion-modal>

        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="content"></bottom-navigation>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonGrid,
    IonRow, IonCol, IonCard, IonCardContent, IonButton, IonIcon, IonSpinner,
    IonModal, toastController, modalController, alertController
} from '@ionic/vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import PlaylistDetailsModal from '@/components/PlaylistDetailsModal.vue';
import ImportPlaylistsModal from '@/components/ImportPlaylistsModal.vue';
import {
    cloudDownload, musicalNotes, search, people, pricetag, mailUnread,
    open, chevronBack, chevronForward, closeOutline, linkOutline,
    pencil, eyeOutline, eyeOffOutline, person, trash
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import { PlaylistService } from '@/services/PlaylistService';
import { SubmissionService } from '@/services/SubmissionService';
import { PlatformService } from '@/services/PlatformService';
import { usePagination } from '@/composables';
import { useAuthStore, usePlaylistStore } from '@/store';
import { Playlist, LinkedAccount, SubmissionStatus, Track } from '@/types';
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
    name: 'PlaylistMakerPlaylists',    components: {
        IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonGrid,
        IonRow, IonCol, IonCard, IonCardContent, IonButton, IonIcon, IonSpinner,
        IonModal, AppHeader, EmptyStateDisplay, BottomNavigation,
        PlaylistDetailsModal
    },
    setup() {
        const router = useRouter();
        const authStore = useAuthStore();
        const playlistStore = usePlaylistStore();
        const userId = computed(() => authStore.user?.user_id || '');

        const searchQuery = ref('');
        const selectedFilter = ref('all');
        const loading = ref(true);
        const playlists = ref<Playlist[]>([]);
        const playlistStats = ref<Record<string, PlaylistStats>>({});

        // Pagination
        const {
            currentPage, totalPages,
            itemsPerPage, changePage, prevPage, nextPage
        } = usePagination();
        const totalItems = ref(0);
        
        // Modal
        const isModalOpen = ref(false);
        const selectedPlaylist = ref<Playlist | null>(null);

        onMounted(async () => {
            if (userId.value) {
                fetchPlaylists();
                fetchPlaylistStats();
            }
        });

        const fetchPlaylists = async () => {
            try {
                loading.value = true;

                const skip = (currentPage.value - 1) * itemsPerPage.value;
                const response = await PlaylistService.getPlaylistsByCreator(
                    userId.value,
                    skip,
                    itemsPerPage.value
                );

                playlists.value = response.data;
                totalItems.value = response.total;
            } catch (error) {
                showToast('Failed to load playlists', 'danger');
            } finally {
                loading.value = false;
            }
        };

        const fetchPlaylistStats = async () => {
            try {
                if (!userId.value) return;
                
                const stats = await SubmissionService.getSubmissionStatsByCreator(userId.value);
                playlistStats.value = stats;
            } catch (error) {
                console.error('Failed to load playlist stats:', error);
            }
        };

        watch(currentPage, () => {
            fetchPlaylists();
        });

        const filteredPlaylists = computed(() => {
            let result = [...playlists.value];

            // Apply search filter
            if (searchQuery.value) {
                const searchLower = searchQuery.value.toLowerCase();
                result = result.filter(playlist =>
                    playlist.name.toLowerCase().includes(searchLower) ||
                    (playlist.description && playlist.description.toLowerCase().includes(searchLower)) ||
                    (playlist.genre && playlist.genre.toLowerCase().includes(searchLower))
                );
            }

            // Apply status filter
            if (selectedFilter.value !== 'all') {
                const isActive = selectedFilter.value === 'active';
                result = result.filter(playlist => playlist.is_visible === isActive);
            }

            return result;
        });

        const handleSearch = (event: CustomEvent) => {
            searchQuery.value = event.detail.value || '';
        };

        const clearSearch = () => {
            searchQuery.value = '';
        };

        const handleFilterChange = () => {
            // Reset to first page when filter changes
            changePage(1);
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

        const showPlaylistDetails = async (playlist: Playlist) => {
            selectedPlaylist.value = { ...playlist };
            isModalOpen.value = true;
        };

        const closeModal = () => {
            isModalOpen.value = false;
            selectedPlaylist.value = null;
        };

        const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
            // Update in local playlists array
            const index = playlists.value.findIndex(p => p.playlist_id === updatedPlaylist.playlist_id);
            if (index !== -1) {
                playlists.value[index] = updatedPlaylist;
            }
            
            // Update selected playlist
            selectedPlaylist.value = updatedPlaylist;
        };

        const handleViewSubmissions = (playlist: Playlist) => {
            // Store the playlist ID to filter submissions
            playlistStore.setSelectedPlaylistId(playlist.playlist_id);

            // Navigate to submissions page
            router.push('/playlist-maker/submissions');

            // Close modal
            closeModal();
        };

        const toggleVisibility = async (playlist: Playlist) => {
            try {
                const updatedPlaylist = await PlaylistService.updatePlaylist(
                    playlist.playlist_id,
                    { is_visible: !playlist.is_visible }
                );

                // Update in local state
                const index = playlists.value.findIndex(p => p.playlist_id === playlist.playlist_id);
                if (index !== -1) {
                    playlists.value[index] = updatedPlaylist;
                }

                showToast(
                    `Playlist is now ${updatedPlaylist.is_visible ? 'active' : 'inactive'} for submissions`,
                    'success'
                );
            } catch (error) {
                showToast('Failed to update playlist visibility', 'danger');
            }
        };

        const viewSubmissions = (playlist: Playlist) => {
            // Store the playlist ID to filter submissions
            playlistStore.setSelectedPlaylistId(playlist.playlist_id);            // Navigate to submissions page
            router.push('/playlist-maker/submissions');

            // Close modal if open
            if (isModalOpen.value) {
                closeModal();
            }
        };

        const importPlaylistsModal = async () => {
            const modal = await modalController.create({
                component: ImportPlaylistsModal,
                componentProps: {
                    userId: userId.value
                }
            });

            await modal.present();

            // Refresh playlists list if data was imported
            const { data } = await modal.onDidDismiss();
            if (data && data.dataRefreshed) {
                fetchPlaylists();
            }
        };        const showToast = async (message: string, color: string = 'primary') => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                color
            });

            await toast.present();
        };

        // Playlist stats getter methods
        const getSubmissionCount = (playlistId: string): number => {
            return playlistStats.value[playlistId]?.submissions || 0;
        };

        const getPendingCount = (playlistId: string): number => {
            return playlistStats.value[playlistId]?.pending || 0;
        };

        const getApprovedCount = (playlistId: string): number => {
            return playlistStats.value[playlistId]?.approved || 0;
        };

        const getRejectedCount = (playlistId: string): number => {
            return playlistStats.value[playlistId]?.rejected || 0;
        };        const getEarnings = (playlistId: string): number => {
            return playlistStats.value[playlistId]?.earnings || 0;
        };        // Confirm playlist deletion
        const confirmDeletePlaylist = async (playlist: Playlist) => {
            const alert = await alertController.create({
                header: 'Confirm Delete',
                message: `Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                    },
                    {
                        text: 'Delete',
                        role: 'destructive',
                        handler: () => deletePlaylist(playlist),
                    },
                ],
            });

            await alert.present();
        };

        // Delete playlist
        const deletePlaylist = async (playlist: Playlist) => {
            try {
                await PlaylistService.deletePlaylist(playlist.playlist_id);
                
                // Remove from local playlists array
                playlists.value = playlists.value.filter(p => p.playlist_id !== playlist.playlist_id);
                
                showToast(`Playlist "${playlist.name}" deleted successfully`, 'success');
            } catch (error) {
                console.error('Failed to delete playlist:', error);
                showToast('Failed to delete playlist', 'danger');
            }
        };

        return {
            searchQuery,
            selectedFilter,
            loading,
            playlists,
            filteredPlaylists,
            currentPage,
            totalPages,
            isModalOpen,
            selectedPlaylist,
            playlistStats,
            cloudDownloadIcon: cloudDownload,
            musicalNotesIcon: musicalNotes,
            searchIcon: search,
            peopleIcon: people,
            personIcon: person,
            pricetagIcon: pricetag,
            mailUnreadIcon: mailUnread,
            openIcon: open,
            chevronBackIcon: chevronBack,
            chevronForwardIcon: chevronForward,
            closeIcon: closeOutline,
            linkIcon: linkOutline,            pencilIcon: pencil,
            eyeOutlineIcon: eyeOutline,
            eyeOffOutlineIcon: eyeOffOutline,
            trashIcon: trash,
            handleSearch,
            clearSearch,
            handleFilterChange,
            formatDate,
            formatCurrency,
            getPlatformIcon,
            onImageError,
            showPlaylistDetails,
            closeModal,
            handlePlaylistUpdated,
            handleViewSubmissions,
            toggleVisibility,
            viewSubmissions,
            getSubmissionCount,
            getPendingCount,
            getApprovedCount,
            getRejectedCount,            getEarnings,
            confirmDeletePlaylist,
            deletePlaylist,
            prevPage,
            nextPage,
            importPlaylistsModal
        };
    }
});
</script>

<style scoped>
.playlists-content {
    --background: #f8f9fa;
}

.playlists-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
}

/* Actions Header */
.actions-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
    .actions-header {
        flex-direction: row;
        align-items: center;
    }

    .playlist-search {
        flex: 2;
    }

    .filter-segment-container {
        flex: 2;
    }

    .import-btn {
        flex: 1;
    }
}

.playlist-search {
    --box-shadow: none;
    --border-radius: 8px;
}

.filter-segment {
    --background: var(--ion-color-light);
    border-radius: 8px;
    overflow: hidden;
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

.empty-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
}

/* Playlists Grid */
.playlists-grid {
    --ion-grid-padding: 0;
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
    /* 1:1 Aspect Ratio */
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
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.platform-icon {
    width: 18px;
    height: 18px;
}

.playlist-status {
    position: absolute;
    top: 8px;
    left: 8px;
    background: var(--ion-color-success);
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 4px;
}

.status-inactive {
    background: var(--ion-color-medium);
}

.playlist-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.playlist-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    justify-content: center;
}

.details-icon {
    vertical-align: middle;
    margin-right: 0.25rem;
}

.playlist-stats {
    display: flex;
    justify-content: space-between;
    margin: 0.75rem 0;
    padding: 0.75rem 0;
    border-top: 1px solid var(--ion-color-light);
    border-bottom: 1px solid var(--ion-color-light);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.stat-value {
    font-weight: 600;
    font-size: 0.9rem;
}

.stat-label {
    font-size: 0.7rem;
    color: var(--ion-color-medium);
}

.playlist-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
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
</style>
