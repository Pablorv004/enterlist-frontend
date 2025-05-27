<template>
    <ion-page>
        <app-header title="My Songs" :back-button="true" back-url="/artist/dashboard"></app-header>

        <ion-content :fullscreen="true" class="songs-content">
            <div class="songs-container">                <!-- Actions Header -->
                <div class="actions-header">
                    <ion-searchbar v-model="searchQuery" placeholder="Search your songs..." @ionInput="handleSearch"
                        class="song-search"></ion-searchbar>

                    <div class="filter-segment-container">
                        <ion-segment v-model="selectedVisibilityFilter" @ionChange="handleVisibilityFilterChange" class="visibility-filter-segment">
                            <ion-segment-button value="all">All</ion-segment-button>
                            <ion-segment-button value="visible">Visible</ion-segment-button>
                            <ion-segment-button value="hidden">Hidden</ion-segment-button>
                        </ion-segment>
                    </div>                    <div class="actions-buttons">
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
                </div><!-- Content -->
                <div v-if="loading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading your songs...</p>
                </div>

                <empty-state-display 
                    v-else-if="filteredSongs.length === 0 && !searchQuery"
                    :icon="musicalNotesIcon"
                    title="No songs yet"
                    message="Import your songs from connected platforms or add them manually"
                    resource-type="songs">
                    <template #actions>
                        <ion-button @click="importSongsModal" fill="outline">
                            Import Songs
                        </ion-button>
                    </template>
                </empty-state-display>

                <empty-state-display 
                    v-else-if="filteredSongs.length === 0 && searchQuery"
                    :icon="searchIcon"
                    title="No results found"
                    :message="`No songs matching '${searchQuery}'`">
                    <template #actions>
                        <ion-button @click="clearSearch" fill="outline">
                            Clear Search
                        </ion-button>
                    </template>
                </empty-state-display>

                <div v-else class="songs-list-container">
                    <!-- Desktop Grid View -->
                    <ion-grid class="songs-grid desktop-only">
                        <ion-row>
                            <ion-col size="12" size-md="6" size-lg="4" v-for="song in filteredSongs"
                                :key="song.song_id">
                                <ion-card class="song-card vertical" @click="showSongDetails(song)">
                                    <div class="song-img-container">
                                        <img :src="song.cover_image_url || '/assets/default-album-cover.png'"
                                            :alt="song.title" class="song-img" />
                                        <div class="song-platform">
                                            <ion-icon :icon="getPlatformIcon(song.platform_id)"
                                                class="platform-icon"></ion-icon>
                                        </div>
                                        <div class="song-visibility-overlay">
                                            <ion-icon :icon="song.is_visible ? eyeIcon : eyeOffIcon"
                                                :class="song.is_visible ? 'visible' : 'hidden'"></ion-icon>
                                        </div>
                                    </div>

                                    <ion-card-content>
                                        <h3 class="song-title">{{ song.title }}</h3>
                                        <p class="song-album">{{ song.album_name || 'Single' }}</p>
                                        <div class="song-platform-name">
                                            <span>{{ getPlatformName(song.platform_id) }}</span>
                                        </div>
                                    </ion-card-content>

                                    <div class="card-actions">
                                        <ion-button fill="clear" size="small" @click.stop="toggleSongVisibility(song)">
                                            <ion-icon :icon="song.is_visible ? eyeOffIcon : eyeIcon" slot="icon-only"></ion-icon>
                                        </ion-button>

                                        <ion-button fill="clear" size="small" @click.stop="submitToPlaylist(song)">
                                            <ion-icon :icon="shareIcon" slot="icon-only"></ion-icon>
                                        </ion-button>

                                        <ion-button fill="clear" size="small" @click.stop="openInPlatform(song)" :disabled="!song.url">
                                            <ion-icon :icon="openExternalIcon" slot="icon-only"></ion-icon>
                                        </ion-button>

                                        <ion-button fill="clear" size="small" color="danger" @click.stop="confirmDeleteSong(song)">
                                            <ion-icon :icon="deleteIcon" slot="icon-only"></ion-icon>
                                        </ion-button>
                                    </div>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                    <!-- Mobile List View -->
                    <ion-list class="songs-list mobile-only">
                        <ion-item v-for="song in filteredSongs" :key="song.song_id"
                            class="song-item" @click="showSongDetails(song)">
                            <ion-thumbnail slot="start" class="song-thumbnail">
                                <img :src="song.cover_image_url || '/assets/default-album-cover.png'"
                                    :alt="song.title" />
                            </ion-thumbnail>

                            <ion-label>
                                <h3 class="song-title">{{ song.title }}</h3>
                                <p class="song-album">{{ song.album_name || 'Single' }}</p>
                                <div class="song-meta">
                                    <span class="song-platform">
                                        <ion-icon :icon="getPlatformIcon(song.platform_id)" class="meta-icon"></ion-icon>
                                        {{ getPlatformName(song.platform_id) }}
                                    </span>
                                    <span class="song-visibility">
                                        <ion-icon :icon="song.is_visible ? eyeIcon : eyeOffIcon"
                                            :class="song.is_visible ? 'visible' : 'hidden'" class="meta-icon"></ion-icon>
                                        {{ song.is_visible ? 'Visible' : 'Hidden' }}
                                    </span>
                                </div>
                            </ion-label>

                            <ion-button fill="clear" slot="end" @click.stop="showOptions(song)">
                                <ion-icon :icon="ellipsisVerticalIcon" slot="icon-only"></ion-icon>
                            </ion-button>
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
    IonThumbnail,
    IonSpinner,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonList,
    IonItem,
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
        IonThumbnail,
        IonSpinner,
        IonLabel,
        IonSegment,
        IonSegmentButton
    },
    setup() {        const authStore = useAuthStore();
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
        const getPlatformIcon = (platformId: number) => {
            const platform = platforms.value.find(p => p.platform_id === platformId);
            const platformName = platform?.name?.toLowerCase() || '';
            
            if (platformName.includes('spotify')) {
                return logoSpotify;
            } else if (platformName.includes('youtube')) {
                return logoYoutube;
            } else {
                return musicalNotesIcon;
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
        });        onMounted(() => {
            loadPlatforms();
            loadSongs();
        });

        onUnmounted(() => {
            // Cancel any pending requests when component is unmounted
            songStore.cancelAllRequests();
        });        return {
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

.song-search {
    flex-grow: 1;
    --background: white;
    --border-radius: 8px;
    --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-segment-container {
    flex-shrink: 0;
}

.visibility-filter-segment {
    --background: var(--ion-color-light);
    border-radius: 8px;
    overflow: hidden;
}

.actions-buttons {
    display: flex;
    gap: 12px;
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

.add-btn {
    --border-radius: 8px;
    font-weight: 500;
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

.empty-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}

.songs-list-container {
    margin-bottom: 24px;
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
    padding: 0;
}

.song-card.vertical {
    margin: 0;
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.song-card.vertical:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.song-img-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
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
    background: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.platform-icon {
    width: 16px;
    height: 16px;
    color: white;
}

.platform-icon img {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

.song-card.vertical ion-card-content {
    padding: 1rem;
}

.song-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-album {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    margin: 0 0 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

.song-platform-name {
    font-size: 0.75rem;
    color: var(--ion-color-medium);
    text-align: center;
}

.card-actions {
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: center;
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
}

.song-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.meta-icon {
    vertical-align: middle;
    margin-right: 0.25rem;
    font-size: 0.9rem;
}

.visible {
    color: var(--ion-color-success);
}

.hidden {
    color: var(--ion-color-medium);
}

/* Remove old card styles */
.song-card-content {
    display: none;
}
</style>
