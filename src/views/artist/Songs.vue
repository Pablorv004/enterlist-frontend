<template>
    <ion-page>
        <app-header title="My Songs" :back-button="true" back-url="/artist/dashboard"></app-header>

        <ion-content :fullscreen="true" class="songs-content">
            <div class="songs-container">
                <!-- Actions Header -->
                <div class="actions-header">
                    <ion-searchbar v-model="searchQuery" placeholder="Search your songs..." @ionInput="handleSearch"
                        class="song-search"></ion-searchbar>

                    <div class="filter-segment-container">
                        <ion-segment v-model="selectedVisibilityFilter" @ionChange="handleVisibilityFilterChange"
                            class="visibility-filter-segment">
                            <ion-segment-button value="all">All</ion-segment-button>
                            <ion-segment-button value="visible">Visible</ion-segment-button>
                            <ion-segment-button value="hidden">Hidden</ion-segment-button>
                        </ion-segment>
                    </div>

                    <div class="action-buttons">
                        <ion-button @click="syncSongs" class="sync-btn" :disabled="syncing">
                            <ion-spinner v-if="syncing" name="crescent" slot="start"></ion-spinner>
                            <ion-icon v-else :icon="syncIcon" slot="start"></ion-icon>
                            {{ syncing ? 'Syncing...' : 'Sync' }}
                        </ion-button>

                        <ion-button @click="importSongsModal" class="import-btn">
                            <ion-icon :icon="cloudDownloadIcon" slot="start"></ion-icon>
                            Import Songs
                        </ion-button>
                    </div>
                </div>

                <!-- Content -->
                <div v-if="loading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading your songs...</p>
                </div>

                <empty-state-display v-else-if="filteredSongs.length === 0 && !searchQuery" :icon="musicalNotesIcon"
                    title="No songs yet" message="Import your songs from connected platforms or add them manually"
                    resource-type="songs">
                    <template #actions>
                        <ion-button @click="importSongsModal">
                            Import Songs
                        </ion-button>
                    </template>
                </empty-state-display>

                <empty-state-display v-else-if="filteredSongs.length === 0 && searchQuery" :icon="searchIcon"
                    title="No results found" :message="`No songs matching '${searchQuery}'`">
                    <template #actions>
                        <ion-button @click="clearSearch" fill="outline">
                            Clear Search
                        </ion-button>
                    </template>
                </empty-state-display>

                <div v-else class="songs-grid-container">
                    <!-- Desktop Grid View -->
                    <ion-grid class="songs-grid desktop-only">
                        <ion-row>
                            <ion-col size="12" size-sm="6" size-md="4" size-lg="3" v-for="song in filteredSongs"
                                :key="song.song_id">
                                <ion-card class="song-card vertical" @click="showSongDetails(song)">
                                    <div class="song-img-container">
                                        <img :src="song.cover_image_url || '/assets/default-album-cover.png'"
                                            :alt="song.title" class="song-img" />
                                        <div class="song-platform">
                                            <img :src="getPlatformIcon(song.platform_id)"
                                                :alt="getPlatformName(song.platform_id)" class="platform-icon" />
                                        </div>
                                        <div class="song-status" :class="{ 'status-hidden': !song.is_visible }">
                                            {{ song.is_visible ? 'Visible' : 'Hidden' }}
                                        </div>
                                    </div>

                                    <ion-card-content>
                                        <h3 class="song-title">{{ song.title }}</h3>
                                        <div class="song-details">
                                            <div class="song-album">
                                                <ion-icon :icon="musicalNotesIcon" class="details-icon"></ion-icon>
                                                {{ song.album_name || 'Single' }}
                                            </div>

                                            <div class="song-platform-name">
                                                <img :src="getPlatformIcon(song.platform_id)" class="details-icon"
                                                    :alt="getPlatformName(song.platform_id)" />
                                                {{ getPlatformName(song.platform_id) }}
                                            </div>
                                        </div>
                                    </ion-card-content>

                                    <div class="card-actions">
                                        <ion-button fill="clear" size="small" @click.stop="toggleSongVisibility(song)">
                                            <ion-icon :icon="song.is_visible ? eyeOffIcon : eyeIcon"
                                                slot="icon-only"></ion-icon>
                                        </ion-button>

                                        <ion-button fill="clear" size="small" @click.stop="submitToPlaylist(song)">
                                            <ion-icon :icon="shareIcon" slot="icon-only"></ion-icon>
                                        </ion-button>

                                        <ion-button fill="clear" size="small" @click.stop="openInPlatform(song)"
                                            :disabled="!song.url">
                                            <ion-icon :icon="openExternalIcon" slot="icon-only"></ion-icon>
                                        </ion-button>

                                        <ion-button fill="clear" size="small" color="danger"
                                            @click.stop="confirmDeleteSong(song)">
                                            <ion-icon :icon="deleteIcon" slot="icon-only"></ion-icon>
                                        </ion-button>
                                    </div>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                    <!-- Mobile List View -->
                    <ion-list class="songs-list mobile-only">
                        <ion-item v-for="song in filteredSongs" :key="song.song_id" class="song-item"
                            @click="showSongDetails(song)">
                            <ion-thumbnail slot="start" class="song-thumbnail">
                                <img :src="song.cover_image_url || '/assets/default-album-cover.png'"
                                    :alt="song.title" />
                                <div class="song-platform-overlay">
                                    <img :src="getPlatformIcon(song.platform_id)"
                                        :alt="getPlatformName(song.platform_id)" class="platform-icon-small" />
                                </div>
                            </ion-thumbnail>
                            <ion-label>
                                <h3 class="song-title">{{ song.title }}</h3>
                                <div class="song-meta">
                                    <span class="song-album">
                                        <ion-icon :icon="musicalNotesIcon" class="meta-icon"></ion-icon>
                                        {{ song.album_name || 'Single' }}
                                    </span>
                                </div>
                            </ion-label>

                            <div slot="end" class="song-end-slot">
                                <ion-badge :color="song.is_visible ? 'success' : 'medium'" class="status-badge">
                                    {{ song.is_visible ? 'Visible' : 'Hidden' }}
                                </ion-badge>
                                <ion-button fill="clear" @click.stop="showOptions(song)">
                                    <ion-icon :icon="ellipsisVerticalIcon" slot="icon-only"></ion-icon>
                                </ion-button>
                            </div>
                        </ion-item>
                    </ion-list>
                </div>
            </div>
        </ion-content>

        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="content"></bottom-navigation>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, computed, watch } from 'vue';
import {
    IonPage,
    IonContent,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonThumbnail,
    IonSpinner,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonList,
    IonItem,
    IonBadge,
    actionSheetController,
    modalController,
    alertController,
    toastController
} from '@ionic/vue';
import {
    add as addIcon,
    cloudDownload as cloudDownloadIcon,
    home as homeIcon,
    documentText as documentTextIcon,
    musicalNotes as musicalNotesIcon,
    person as personIcon,
    eye as eyeIcon,
    eyeOff as eyeOffIcon,
    search as searchIcon,
    chevronBack as chevronBackIcon,
    chevronForward as chevronForwardIcon,
    ellipsisVertical as ellipsisVerticalIcon,
    playCircleOutline as logoSpotify,
    logoYoutube,
    pencil as editIcon,
    trash as deleteIcon,
    open as openExternalIcon,
    share as shareIcon,
    sync as syncIcon
} from 'ionicons/icons';
import { useAuthStore, useSongStore } from '@/store';
import { Song, Platform } from '@/types';
import { usePagination } from '@/composables';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import ImportSongsModal from '@/components/ImportSongsModal.vue';
import SongDetailsModal from '@/components/SongDetailsModal.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { PlatformService } from '@/services/PlatformService';
import { SongService } from '@/services/SongService';
import router from '@/router';
import spotifyLogo from '@/assets/spotify.png';
import youtubeLogo from '@/assets/youtube.png';

export default defineComponent({
    name: 'ArtistSongs',
    components: {
        AppHeader,
        EmptyStateDisplay,
        BottomNavigation,
        IonPage,
        IonContent,
        IonSearchbar,
        IonButton,
        IonIcon,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonCardContent,
        IonThumbnail,
        IonSpinner,
        IonLabel,
        IonSegment,
        IonSegmentButton,
        IonList,
        IonItem,
        IonBadge
    },
    setup() {
        const authStore = useAuthStore();
        const songStore = useSongStore();
        const loading = ref(true);
        const syncing = ref(false);
        const searchQuery = ref('');
        const selectedVisibilityFilter = ref('all');
        const totalSongs = ref(0);
        const platforms = ref<Platform[]>([]);

        // Pagination
        const { currentPage, itemsPerPage, totalPages, skip, changePage, prevPage, nextPage } = usePagination(totalSongs, 12);

        // Get current user
        const user = computed(() => authStore.user);        // Filtered songs
        const filteredSongs = computed(() => {
            let result = [...songStore.songs];

            // Apply search filter
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase();
                result = result.filter(song =>
                    song.title.toLowerCase().includes(query) ||
                    (song.album_name && song.album_name.toLowerCase().includes(query)) ||
                    song.artist_name_on_platform.toLowerCase().includes(query)
                );
            }

            // Apply visibility filter
            if (selectedVisibilityFilter.value !== 'all') {
                const isVisible = selectedVisibilityFilter.value === 'visible';
                result = result.filter(song => song.is_visible === isVisible);
            }

            return result;
        });

        // Get platform icon based on platform ID
        const getPlatformIcon = (platformId: number): string => {
            const platform = platforms.value.find(p => p.platform_id === platformId);
            const platformName = platform?.name?.toLowerCase() || '';

            if (platformName.includes('spotify')) {
                return spotifyLogo;
            } else if (platformName.includes('youtube')) {
                return youtubeLogo;
            } else {
                return '@/assets/logo.png';
            }
        };

        // Get platform name based on platform ID
        const getPlatformName = (platformId: number) => {
            const platform = platforms.value.find(p => p.platform_id === platformId);
            return platform?.name || 'Unknown Platform';
        };

        // Handle search input
        const handleSearch = (event: CustomEvent) => {
            searchQuery.value = event.detail.value;
        };        // Clear search
        const clearSearch = () => {
            searchQuery.value = '';
        };

        // Handle visibility filter change
        const handleVisibilityFilterChange = () => {
            // Reset to first page when filter changes
            changePage(1);
        };// Show song details
        const showSongDetails = async (song: Song) => {
            const modal = await modalController.create({
                component: SongDetailsModal,
                componentProps: {
                    song: song
                }
            });

            await modal.present();

            // Refresh songs list if data was updated
            const { data } = await modal.onDidDismiss();
            if (data && data.dataRefreshed) {
                loadSongs();
            }
        };

        // Show options menu for a song
        const showOptions = async (song: Song) => {
            const actionSheet = await actionSheetController.create({
                header: song.title,
                buttons: [
                    {
                        text: 'Submit to Playlist',
                        icon: shareIcon,
                        handler: () => {
                            // Navigate to submission form with pre-selected song
                            // This will be implemented in a separate view
                            console.log('Submit song to playlist', song);
                        },
                    },
                    {
                        text: song.is_visible ? 'Hide Song' : 'Show Song',
                        icon: song.is_visible ? eyeOffIcon : eyeIcon,
                        handler: () => {
                            toggleSongVisibility(song);
                        },
                    },
                    {
                        text: 'Open in Platform',
                        icon: openExternalIcon,
                        handler: () => {
                            if (song.url) {
                                window.open(song.url, '_blank');
                            } else {
                                showToast('No external URL available for this song');
                            }
                        },
                    },
                    {
                        text: 'Delete',
                        role: 'destructive',
                        icon: deleteIcon,
                        handler: () => {
                            confirmDeleteSong(song);
                        },
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                    },
                ],
            });

            await actionSheet.present();
        };        // Show toast message
        const showToast = async (message: string, color: string = 'medium') => {
            const toast = await toastController.create({
                message,
                duration: 2000,
                position: 'bottom',
                color
            });

            await toast.present();
        };

        // Sync songs with platform data
        const syncSongs = async () => {
            if (!user.value?.user_id || syncing.value) return;

            try {
                syncing.value = true;

                await SongService.syncSongs(user.value.user_id);

                // Show success toast
                await showToast('Sync complete!', 'success');

                // Refresh songs to show updated data
                await loadSongs();

            } catch (error: any) {
                console.error('Sync failed:', error);
                await showToast('Failed to sync songs', 'danger');
            } finally {
                syncing.value = false;
            }
        };

        // Open import songs modal
        const importSongsModal = async () => {
            const modal = await modalController.create({
                component: ImportSongsModal,
                componentProps: {
                    userId: user.value?.user_id
                }
            });

            await modal.present();

            // Refresh songs list if data was imported
            const { data } = await modal.onDidDismiss();
            if (data && data.dataRefreshed) {
                loadSongs();
            }
        };

        // Toggle song visibility
        const toggleSongVisibility = async (song: Song) => {
            try {
                await songStore.updateSong(song.song_id, {
                    is_visible: !song.is_visible
                });

                showToast(
                    `Song "${song.title}" is now ${song.is_visible ? 'hidden' : 'visible'}`,
                    'success'
                );
            } catch (error) {
                console.error('Failed to update song visibility:', error);
                showToast('Failed to update song visibility', 'danger');
            }
        };

        // Confirm song deletion
        const confirmDeleteSong = async (song: Song) => {
            const alert = await alertController.create({
                header: 'Confirm Delete',
                message: `Are you sure you want to delete "${song.title}"? This action cannot be undone.`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                    },
                    {
                        text: 'Delete',
                        role: 'destructive',
                        handler: () => deleteSong(song),
                    },
                ],
            });

            await alert.present();
        };

        // Delete song
        const deleteSong = async (song: Song) => {
            try {
                await songStore.deleteSong(song.song_id);
                showToast(`Song "${song.title}" deleted successfully`, 'success');
            } catch (error) {
                console.error('Failed to delete song:', error);
                showToast('Failed to delete song', 'danger');
            }
        };

        // Load platforms data
        const loadPlatforms = async () => {
            try {
                platforms.value = await PlatformService.getPlatforms();
            } catch (error) {
                console.error('Failed to load platforms:', error);
                showToast('Failed to load platforms', 'danger');
            }
        };

        // Load songs data
        const loadSongs = async () => {
            if (!user.value?.user_id) return;

            loading.value = true;

            try {
                await songStore.fetchSongsByArtist(user.value.user_id, skip.value, itemsPerPage.value);
                totalSongs.value = songStore.totalCount;
            } catch (error) {
                console.error('Failed to load songs:', error);
                showToast('Failed to load songs', 'danger');
            } finally {
                loading.value = false;
            }
        };

        // Add methods for desktop card actions
        const submitToPlaylist = (song: Song) => {
            // Navigate to submission form with pre-selected song
            router.push({
                path: '/artist/submissions/new',
                query: { songId: song.song_id }
            });
        };

        const openInPlatform = (song: Song) => {
            if (song.url) {
                window.open(song.url, '_blank');
            } else {
                showToast('No external URL available for this song');
            }
        };

        // Watch for pagination changes
        watch([currentPage, itemsPerPage], () => {
            loadSongs();
        }); onMounted(() => {
            loadPlatforms();
            loadSongs();
        });

        onUnmounted(() => {
            // Cancel any pending requests when component is unmounted
            songStore.cancelAllRequests();
        }); return {
            loading,
            syncing,
            searchQuery,
            selectedVisibilityFilter,
            filteredSongs,
            currentPage,
            totalPages,
            platforms,
            getPlatformIcon,
            getPlatformName,
            handleSearch,
            clearSearch,
            handleVisibilityFilterChange,
            showSongDetails,
            showOptions,
            importSongsModal,
            syncSongs,
            prevPage,
            nextPage,
            submitToPlaylist,
            openInPlatform,
            toggleSongVisibility,
            confirmDeleteSong,
            deleteSong,
            // Icons
            addIcon,
            cloudDownloadIcon,
            homeIcon,
            documentTextIcon,
            musicalNotesIcon,
            personIcon,
            eyeIcon,
            eyeOffIcon,
            searchIcon,
            chevronBackIcon,
            chevronForwardIcon,
            ellipsisVerticalIcon,
            shareIcon,
            openExternalIcon,
            deleteIcon,
            syncIcon
        };
    }
});
</script>

<style scoped>
.songs-content {
    --background: #f8f9fa;
}

.songs-container {
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

    .song-search {
        flex: 2;
    }

    .filter-segment-container {
        flex: 2;
    }

    .action-buttons {
        flex: 1;
    }
}

.song-search {
    --box-shadow: none;
    --border-radius: 8px;
}

.visibility-filter-segment {
    --background: var(--ion-color-light);
    border-radius: 8px;
    overflow: hidden;
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

.sync-btn {
    --background: var(--ion-color-secondary);
    --border-radius: 8px;
    font-weight: 500;
}

.import-btn {
    --background: var(--ion-color-primary);
    --border-radius: 8px;
    font-weight: 500;
}

/* Loading and Empty States */
.loading-container {
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

.loading-container p {
    margin-top: 1rem;
    color: var(--ion-color-medium);
}

/* Responsive Layout */
.desktop-only {
    display: block;
}

.mobile-only {
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

/* Desktop Grid Styles */
.songs-grid {
    --ion-grid-padding: 0;
}

.song-card.vertical {
    margin: 0;
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s;
}

.song-card.vertical:hover {
    transform: translateY(-4px);
}

.song-img-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
    /* 1:1 Aspect Ratio */
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

.song-status {
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

.status-hidden {
    background: var(--ion-color-medium);
}

.song-card.vertical ion-card-content {
    padding: 1rem;
}

.song-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    white-space: nowrap;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-details {
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
    width: 12px;
    height: 12px;
}

.song-album .details-icon {
    width: 12px;
    height: 12px;
}

.song-platform-name .details-icon {
    width: 12px;
    height: 12px;
}

.card-actions {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-top: 1px solid var(--ion-color-light);
}

/* Mobile List Styles */
.songs-list {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.song-item {
    --padding-start: 1rem;
    --inner-padding-end: 1rem;
    --border-color: var(--ion-color-light);
}

.song-item:last-child {
    --border-width: 0;
}

.song-thumbnail {
    --border-radius: 8px;
    width: 60px;
    height: 60px;
    position: relative;
}

.song-platform-overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.platform-icon-small {
    width: 12px;
    height: 12px;
}

.meta-icon {
    vertical-align: middle;
    margin-right: 0.25rem;
    font-size: 0.9rem;
    width: 12px;
    height: 12px;
}

.song-album .meta-icon {
    width: 12px;
    height: 12px;
}

.song-platform .meta-icon {
    width: 12px;
    height: 12px;
}

/* Remove platform overlay on mobile */
/* .song-platform-overlay {
    display: none;
} */
</style>
