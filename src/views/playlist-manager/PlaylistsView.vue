<template>
    <ion-page>
        <page-header title="My Playlists">
            <template #end-buttons>
                <ion-button router-link="/tabs/playlists/new" class="add-button">
                    <font-awesome-icon icon="plus" />
                    <span class="button-text">Add Playlist</span>
                </ion-button>
            </template>
        </page-header>

        <ion-content :fullscreen="true" class="bg-playlist">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">My Playlists</ion-title>                    <ion-buttons slot="end">
                        <ion-button router-link="/tabs/playlists/new">
                            <font-awesome-icon icon="plus" />
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <div class="ion-padding">
                <!-- Search Bar -->
                <ion-searchbar v-model="searchTerm" placeholder="Search playlists" @ionInput="handleSearch"
                    :debounce="500"></ion-searchbar>

                <!-- Platform Filter -->
                <ion-item>
                    <ion-label>Platform Filter</ion-label>
                    <ion-select v-model="platformFilter" @ionChange="handleFilterChange">
                        <ion-select-option value="0">All Platforms</ion-select-option>
                        <ion-select-option v-for="platform in platforms" :key="platform.platform_id"
                            :value="platform.platform_id">
                            {{ platform.name }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>

                <div v-if="loading" class="ion-padding ion-text-center">
                    <ion-spinner></ion-spinner>
                    <p>Loading playlists...</p>
                </div>

                <div v-else-if="error" class="ion-padding ion-text-center error-message">
                    <p>{{ error }}</p>
                    <ion-button @click="loadPlaylists">Retry</ion-button>
                </div>

                <div v-else-if="playlists.length === 0" class="ion-padding ion-text-center">
                    <ion-icon :icon="list" size="large" color="medium"></ion-icon>
                    <h4>No playlists found</h4>
                    <p v-if="!searchTerm && !platformFilter">You haven't added any playlists yet.</p>
                    <p v-else>Try adjusting your search or filters.</p>
                    <ion-button v-if="!searchTerm && !platformFilter" router-link="/tabs/playlists/new">Add Your First
                        Playlist</ion-button>
                </div>

                <ion-grid v-else>
                    <ion-row>
                        <ion-col v-for="playlist in playlists" :key="playlist.playlist_id" size="12" size-md="6"
                            size-lg="4">
                            <playlist-card :playlist="playlist" :platforms="platforms" :showEdit="true"
                                :showDelete="true" @edit="editPlaylist(playlist)" @delete="confirmDelete(playlist)"
                                @view="viewPlaylist(playlist)"></playlist-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>

                <!-- Pagination -->
                <div class="ion-padding ion-text-center" v-if="totalItems > pageSize">
                    <ion-button fill="clear" size="small" :disabled="currentPage === 1"
                        @click="goToPage(currentPage - 1)">
                        <ion-icon :icon="chevronBack" slot="icon-only"></ion-icon>
                    </ion-button>
                    <span>Page {{ currentPage }} of {{ totalPages }}</span>
                    <ion-button fill="clear" size="small" :disabled="currentPage === totalPages"
                        @click="goToPage(currentPage + 1)">
                        <ion-icon :icon="chevronForward" slot="icon-only"></ion-icon>
                    </ion-button>
                </div>
            </div>
        </ion-content>

        <!-- Delete Confirmation Modal -->
        <ion-modal :is-open="showDeleteModal" @didDismiss="showDeleteModal = false">
            <div class="ion-padding">
                <h2>Delete Playlist</h2>
                <p>Are you sure you want to delete "{{ selectedPlaylist?.name }}"? This cannot be undone.</p>
                <div class="ion-text-right">
                    <ion-button fill="clear" @click="showDeleteModal = false">Cancel</ion-button>
                    <ion-button color="danger" @click="deletePlaylist">Delete</ion-button>
                </div>
            </div>
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonSearchbar,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
    toastController
} from '@ionic/vue';
import { FontAwesomeIcon } from '@/plugins/fontawesome';
import { useAuthStore } from '@/store/auth';
import { useApiStatus, usePagination } from '@/composables/useUtils';
import PageHeader from '@/components/layout/PageHeader.vue';
import PlaylistCard from '@/components/playlist/PlaylistCard.vue';
import playlistService from '@/services/playlist.service';
import platformService from '@/services/platform.service';
import type { Playlist, Platform } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const { loading, error, startLoading, stopLoading, setError, clearError } = useApiStatus();
const { page: currentPage, pageSize, total: totalItems, skip, totalPages, goToPage, setTotal, updateTotalPages } = usePagination(9);

const playlists = ref<Playlist[]>([]);
const platforms = ref<Platform[]>([]);
const searchTerm = ref('');
const platformFilter = ref<number>(0);
const showDeleteModal = ref(false);
const selectedPlaylist = ref<Playlist | null>(null);

onMounted(() => {
    loadPlatforms();
    loadPlaylists();
});

async function loadPlatforms() {
    try {
        const response = await platformService.getPlatforms();
        platforms.value = response.data;
    } catch (err: any) {
        console.error('Error loading platforms:', err);
    }
}

async function loadPlaylists() {
    try {
        startLoading();
        clearError();

        const userId = authStore.user?.user_id;
        if (!userId) {
            setError('User not authenticated');
            return;
        }

        const response = await playlistService.getPlaylistsByCreator(
            userId,
            skip.value,
            pageSize.value
        );

        playlists.value = response.data;

        // Apply platform filter if selected
        if (platformFilter.value > 0) {
            playlists.value = playlists.value.filter(p => p.platform_id === platformFilter.value);
        }

        setTotal(response.total);
        updateTotalPages();
    } catch (err: any) {
        setError(err.message || 'Failed to load playlists');
        console.error('Error loading playlists:', err);
    } finally {
        stopLoading();
    }
}

function handleSearch() {
    // You can implement search logic here
    // For now, just reload the playlists
    goToPage(1);
    loadPlaylists();
}

function handleFilterChange() {
    goToPage(1);
    loadPlaylists();
}

function editPlaylist(playlist: Playlist) {
    router.push(`/tabs/playlists/${playlist.playlist_id}`);
}

function viewPlaylist(playlist: Playlist) {
    // Open the playlist URL in a new tab
    if (playlist.url) {
        window.open(playlist.url, '_blank');
    } else {
        // If no URL, show a message
        toastController.create({
            message: 'No external URL available for this playlist',
            duration: 2000,
            color: 'warning'
        }).then(toast => toast.present());
    }
}

function confirmDelete(playlist: Playlist) {
    selectedPlaylist.value = playlist;
    showDeleteModal.value = true;
}

async function deletePlaylist() {
    if (!selectedPlaylist.value) return;

    try {
        startLoading();
        await playlistService.deletePlaylist(selectedPlaylist.value.playlist_id);

        // Remove from local array
        playlists.value = playlists.value.filter(p => p.playlist_id !== selectedPlaylist.value?.playlist_id);

        // Close modal
        showDeleteModal.value = false;
        selectedPlaylist.value = null;

        // Show toast message
        const toast = await toastController.create({
            message: 'Playlist deleted successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

        // Reload data if the page is now empty
        if (playlists.value.length === 0 && currentPage.value > 1) {
            goToPage(currentPage.value - 1);
            await loadPlaylists();
        }
    } catch (err: any) {
        const toast = await toastController.create({
            message: 'Failed to delete playlist',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
        console.error('Error deleting playlist:', err);
    } finally {
        stopLoading();
    }
}
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables';
@import '../../assets/styles/mixins';

.error-message {
    color: $danger-color;
    background: rgba($danger-color, 0.1);
    border-radius: $border-radius-md;
    padding: 16px;
    border: 1px solid rgba($danger-color, 0.3);
}

.bg-playlist {
    --ion-background-color: transparent;
    position: relative;
    
    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5) url('@/assets/blurred-blue-light-purple-bg.jpg') no-repeat center center / cover;
        background-blend-mode: darken;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: -1;
    }
}

.add-button {
    --background: $accent-color;
    --background-hover: #e05555; /* Manually darkened instead of using darken() */
    --box-shadow: 0 4px 12px rgba($accent-color, 0.3);
    transition: transform 0.2s ease;
    
    &:hover {
        transform: translateY(-2px);
    }
    
    .button-text {
        margin-left: 5px;
        font-weight: 500; /* Use direct value instead of variable */
    }
}

ion-searchbar {
    --background: rgba(255, 255, 255, 0.15);
    --color: $light-color;
    --placeholder-color: rgba(255, 255, 255, 0.6);
    --icon-color: rgba(255, 255, 255, 0.6);
    --cancel-button-color: $primary-color;
    --border-radius: $border-radius-md;
    padding: 5px;
    margin-bottom: 20px;
}

ion-grid {
    padding: 0;
}

ion-col {
    padding: 8px;
}

// Empty state styling
.ion-text-center {
    padding: 40px 16px;
    
    ion-icon {
        font-size: 48px;
        color: rgba(255, 255, 255, 0.5);
    }
    
    h4 {
        margin-top: 16px;
        color: $light-color;
        font-weight: $font-weight-bold;
    }
    
    p {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 20px;
    }
}

// Pagination styling
.ion-text-center {
    span {
        color: $light-color;
        margin: 0 8px;
    }
    
    ion-button {
        --color: $light-color;
        --background-hover: rgba(255, 255, 255, 0.1);
        --ripple-color: rgba(255, 255, 255, 0.2);
    }
}
</style>
