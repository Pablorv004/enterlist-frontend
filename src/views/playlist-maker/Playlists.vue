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
                </div>                <empty-state-display 
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
                </empty-state-display>                <empty-state-display 
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
                                        <h3 class="playlist-name">{{ playlist.name }}</h3>                                        <div class="playlist-details">
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
                                        </div>                                        <div class="playlist-actions">
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
        </ion-content>

        <!-- Playlist Details Modal -->
        <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="playlist-details-modal">
            <playlist-details-modal 
                v-if="selectedPlaylist"
                :playlist="selectedPlaylist"
                :playlist-stats="playlistStats"
                @playlist-updated="handlePlaylistUpdated"
                @view-submissions="handleViewSubmissions"
            />
        </ion-modal>

        <!-- Import Playlists Modal -->
        <ion-modal :is-open="isImportModalOpen" @didDismiss="closeImportModal" class="import-modal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Import Playlists</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeImportModal">
                            <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding">
                <div v-if="!connectedAccounts.length" class="no-accounts">
                    <ion-icon :icon="linkIcon" class="no-accounts-icon"></ion-icon>
                    <h3>No Connected Accounts</h3>
                    <p>Connect your music platform accounts to import playlists</p>
                    <ion-button router-link="/playlist-maker/linked-accounts" @click="closeImportModal">
                        Connect Accounts
                    </ion-button>
                </div>

                <div v-else>
                    <h3 class="accounts-title">Select Platform</h3>
                    <ion-list class="platforms-list">
                        <ion-radio-group v-model="selectedPlatform">
                            <ion-item v-for="account in connectedAccounts" :key="account.linked_account_id">
                                <ion-thumbnail slot="start" class="platform-thumbnail">
                                    <img :src="getPlatformIcon(account.platform?.name)" :alt="account.platform?.name" />
                                </ion-thumbnail>
                                <ion-label>
                                    <h2>{{ account.platform?.name }}</h2>
                                    <p>{{ account.external_user_id }}</p>
                                </ion-label>
                                <ion-radio slot="end" :value="account.platform_id"></ion-radio>
                            </ion-item>
                        </ion-radio-group>
                    </ion-list>

                    <div v-if="importingPlaylists" class="importing-spinner">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading playlists from {{ getSelectedPlatformName() }}...</p>
                    </div>

                    <div v-else-if="availablePlaylists.length > 0" class="available-playlists">
                        <h3 class="playlists-title">Available Playlists</h3>
                        <p class="selection-help">Select the playlists you want to import</p>

                        <ion-list class="playlists-selection-list">
                            <ion-item v-for="playlist in availablePlaylists" :key="playlist.id">
                                <ion-thumbnail slot="start" class="playlist-selection-thumbnail">
                                    <img :src="playlist.cover_image_url || '/assets/default-playlist-cover.png'"
                                        :alt="playlist.name" />
                                </ion-thumbnail>                                <ion-label>
                                    <h2>{{ playlist.name }}</h2>
                                    <p>{{ playlist.track_count || 'Unknown' }} tracks</p>
                                </ion-label>
                                <ion-checkbox slot="end" v-model="playlist.selected"></ion-checkbox>
                            </ion-item>
                        </ion-list>
                    </div>

                    <div class="import-actions">
                        <ion-button v-if="!importingPlaylists && selectedPlatform && !availablePlaylists.length"
                            expand="block" @click="fetchAvailablePlaylists">
                            Load Playlists
                        </ion-button>

                        <ion-button v-if="availablePlaylists.length && getSelectedPlaylists().length > 0" expand="block"
                            @click="importSelectedPlaylists" :disabled="importingSelected">
                            <ion-spinner v-if="importingSelected" name="crescent"></ion-spinner>
                            <span v-else>
                                Import {{ getSelectedPlaylists().length }} Playlist{{ getSelectedPlaylists().length !==
                                1 ? 's' : '' }}
                            </span>
                        </ion-button>
                    </div>
                </div>
            </ion-content>
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
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonThumbnail,
    IonItem, IonLabel, IonToggle, IonRadioGroup, IonRadio, IonCheckbox,
    IonList, IonSelect, IonSelectOption, IonNote, IonInput, toastController
} from '@ionic/vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import PlaylistDetailsModal from '@/components/PlaylistDetailsModal.vue';
import {
    cloudDownload, musicalNotes, search, people, pricetag, mailUnread,
    open, chevronBack, chevronForward, closeOutline, linkOutline,
    pencil, eyeOutline, eyeOffOutline, person
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import ImportPlaylistsModal from '@/components/ImportPlaylistsModal.vue';
import { modalController } from '@ionic/vue';
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

interface ImportablePlaylist {
    id: string;
    name: string;
    cover_image_url?: string;
    track_count?: number;
    selected: boolean;
}

export default defineComponent({
    name: 'PlaylistMakerPlaylists',
    components: {
        IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonGrid,
        IonRow, IonCol, IonCard, IonCardContent, IonButton, IonIcon, IonSpinner,
        IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonThumbnail,
        IonItem, IonLabel, IonToggle, IonRadioGroup, IonRadio, IonCheckbox,
        IonList, IonSelect, IonSelectOption, IonNote, IonInput, AppHeader, EmptyStateDisplay, BottomNavigation,
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

        // Import Modal
        const isImportModalOpen = ref(false);
        const connectedAccounts = ref<LinkedAccount[]>([]);
        const selectedPlatform = ref<number | null>(null);
        const availablePlaylists = ref<ImportablePlaylist[]>([]);
        const importingPlaylists = ref(false);
        const importingSelected = ref(false);

        onMounted(async () => {
            if (userId.value) {
                fetchPlaylists();
                fetchPlaylistStats();
                fetchConnectedAccounts();
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
        };        const fetchPlaylistStats = async () => {
            try {
                if (!userId.value) return;
                
                const stats = await SubmissionService.getSubmissionStatsByCreator(userId.value);
                playlistStats.value = stats;
            } catch (error) {
                console.error('Failed to load playlist stats:', error);
            }
        };

        const fetchConnectedAccounts = async () => {
            try {
                connectedAccounts.value = await PlatformService.getLinkedAccounts(userId.value);
            } catch (error) {
                console.error('Failed to load connected accounts:', error);
            }
        };

        const fetchAvailablePlaylists = async () => {
            if (!selectedPlatform.value) return;

            try {
                importingPlaylists.value = true;
                availablePlaylists.value = [];

                // In a real implementation, we would call an API
                // For this demo, we'll simulate it
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Create mock data
                const mockPlaylists: ImportablePlaylist[] = [];
                const count = Math.floor(Math.random() * 10) + 5;

                for (let i = 0; i < count; i++) {
                    mockPlaylists.push({
                        id: `playlist_${Date.now()}_${i}`,                        name: `Playlist ${i + 1} - ${Math.random().toString(36).substring(2, 10)}`,
                        cover_image_url: Math.random() > 0.3 ?
                            `/assets/mock-playlist-${Math.floor(Math.random() * 5) + 1}.jpg` : undefined,
                        track_count: Math.floor(Math.random() * 100) + 5, // Random track count between 5-105
                        selected: false
                    });
                }

                availablePlaylists.value = mockPlaylists;
            } catch (error) {
                showToast('Failed to load available playlists', 'danger');
            } finally {
                importingPlaylists.value = false;
            }
        };

        const importSelectedPlaylists = async () => {
            const selected = getSelectedPlaylists();

            if (selected.length === 0) {
                showToast('Please select at least one playlist to import', 'warning');
                return;
            }

            try {
                importingSelected.value = true;

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Close modal and refresh playlists
                closeImportModal();
                fetchPlaylists();

                showToast(`Successfully imported ${selected.length} playlist(s)`, 'success');
            } catch (error) {
                showToast('Failed to import playlists', 'danger');
            } finally {
                importingSelected.value = false;
            }
        };

        const getSelectedPlaylists = (): ImportablePlaylist[] => {
            return availablePlaylists.value.filter(p => p.selected);
        };

        const getSelectedPlatformName = (): string => {
            if (!selectedPlatform.value) return '';

            const account = connectedAccounts.value.find(a => a.platform_id === selectedPlatform.value);
            return account?.platform?.name || '';
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
        };        const formatDate = (dateString: string): string => {
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
        };        const getPlatformIcon = (platformName?: string): string => {
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
        };        const showPlaylistDetails = async (playlist: Playlist) => {
            selectedPlaylist.value = { ...playlist };
            isModalOpen.value = true;
        };        const closeModal = () => {
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
        };        const viewSubmissions = (playlist: Playlist) => {
            // Store the playlist ID to filter submissions
            playlistStore.setSelectedPlaylistId(playlist.playlist_id);

            // Navigate to submissions page
            router.push('/playlist-maker/submissions');

            // Close modal if open
            if (isModalOpen.value) {
                closeModal();
            }
        };

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
        };

        const getEarnings = (playlistId: string): number => {
            return playlistStats.value[playlistId]?.earnings || 0;
        };

        const importPlaylistsModal = async () => {
            isImportModalOpen.value = true;
        };

        const closeImportModal = () => {
            isImportModalOpen.value = false;
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
            searchQuery,
            selectedFilter,
            loading,
            playlists,
            filteredPlaylists,
            currentPage,
            totalPages,
            isModalOpen,
            selectedPlaylist,
            isImportModalOpen,
            connectedAccounts,
            selectedPlatform,
            availablePlaylists,
            importingPlaylists,
            importingSelected,
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
            linkIcon: linkOutline,
            pencilIcon: pencil,
            eyeOutlineIcon: eyeOutline,
            eyeOffOutlineIcon: eyeOffOutline,
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
            getRejectedCount,
            getEarnings,
            prevPage,
            nextPage,
            importPlaylistsModal,
            closeImportModal,
            fetchAvailablePlaylists,
            importSelectedPlaylists,
            getSelectedPlaylists,
            getSelectedPlatformName
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

/* Modal Styles */
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

/* Update detail-row for description to stack vertically */
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

/* Import Modal Styles */
.no-accounts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
}

.no-accounts-icon {
    font-size: 4rem;
    color: var(--ion-color-medium);
    margin-bottom: 1rem;
}

.accounts-title,
.playlists-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 1rem;
}

.platforms-list {
    margin-bottom: 2rem;
}

.platform-thumbnail {
    --border-radius: 8px;
    width: 44px;
    height: 44px;
}

.importing-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
}

.selection-help {
    color: var(--ion-color-medium);
    margin-bottom: 1rem;
}

.playlist-selection-thumbnail {
    --border-radius: 4px;
}

.import-actions {
    margin-top: 2rem;
}

/* Fee Edit Modal Styles */
.fee-edit-modal {
    --width: 90%;
    --max-width: 400px;
}

.fee-edit-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.fee-input {
    --margin-top: 0;
}

ion-note {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    margin-top: -0.5rem;
}

/* Playlist Tracks Styles */
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

.tracks-list {
    max-height: 300px;
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
}

.track-item:last-child {
    border-bottom: none;
}

.track-item:hover {
    background-color: var(--ion-color-light);
}

.track-number {
    width: 30px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--ion-color-medium);
    text-align: center;
    flex-shrink: 0;
}

.track-thumbnail {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
    margin: 0 0.75rem;
    flex-shrink: 0;
    background: var(--ion-color-light);
}

.track-info {
    flex: 1;
    min-width: 0;
    margin-right: 0.75rem;
}

.track-title {
    font-weight: 500;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 0 0.25rem 0;
}

.track-artist {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
}

.track-duration {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.track-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.track-link {
    --padding-start: 8px;
    --padding-end: 8px;
    --padding-top: 6px;
    --padding-bottom: 6px;
    margin: 0;
    --border-radius: 6px;
}

.no-tracks {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    color: var(--ion-color-medium);
}

.no-tracks-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.no-tracks p {
    margin: 0;
    font-size: 0.9rem;
}

/* Responsive adjustments for tracks */
@media (max-width: 768px) {
    .track-item {
        padding: 0.5rem;
    }
    
    .track-number {
        width: 25px;
        font-size: 0.8rem;
    }
    
    .track-thumbnail {
        width: 35px;
        height: 35px;
        margin: 0 0.5rem;
    }
    
    .track-title {
        font-size: 0.85rem;
    }
    
    .track-artist, .track-duration {
        font-size: 0.75rem;
    }
    
    .track-duration {
        margin-right: 0.5rem;
    }
      .track-info {
        margin-right: 0.5rem;
    }
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
