<template>
    <ion-page>        <page-header title="My Songs" icon="music">
            <template #end-buttons>
                <ion-button router-link="/tabs/songs/new" class="add-button">
                    <font-awesome-icon icon="plus" />
                    <span class="button-text">Add Song</span>
                </ion-button>
            </template>
        </page-header>

        <ion-content :fullscreen="true" class="bg-artist">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">My Songs</ion-title>                    <ion-buttons slot="end">
                        <ion-button router-link="/tabs/songs/new">
                            <font-awesome-icon icon="plus" />
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <div class="ion-padding">                <!-- Search Bar -->
                <div class="search-container glass-effect">
                    <ion-searchbar v-model="searchTerm" placeholder="Search songs" @ionInput="handleSearch"
                        :debounce="500" class="custom-searchbar" animated>
                        <font-awesome-icon icon="search" slot="start" class="search-icon" />
                    </ion-searchbar>
                </div>

                <div v-if="loading" class="ion-padding ion-text-center">
                    <ion-spinner></ion-spinner>
                    <p>Loading songs...</p>
                </div>

                <div v-else-if="error" class="ion-padding ion-text-center error-message">
                    <p>{{ error }}</p>
                    <ion-button @click="loadSongs">Retry</ion-button>
                </div>                <div v-else-if="songs.length === 0" class="ion-padding ion-text-center empty-container glass-effect">
                    <font-awesome-icon icon="music" size="3x" class="empty-icon pulse-animation" />
                    <h4 class="fade-in-animation">No songs found</h4>
                    <p class="fade-in-animation">You haven't added any songs yet.</p>
                    <ion-button router-link="/tabs/songs/new" class="action-btn fade-in-animation">
                        <font-awesome-icon icon="plus" class="button-icon" />
                        Add Your First Song
                    </ion-button>
                </div>

                <ion-grid v-else>
                    <ion-row>
                        <ion-col v-for="song in songs" :key="song.song_id" size="12" size-md="6" size-lg="4">
                            <song-card :song="song" :showEdit="true" :showDelete="true" :showSubmit="true"
                                @edit="editSong(song)" @delete="confirmDelete(song)"
                                @submit="submitSong(song)"></song-card>
                        </ion-col>
                    </ion-row>
                </ion-grid>

                <!-- Pagination -->                <div class="ion-padding ion-text-center" v-if="totalItems > pageSize">
                    <ion-button fill="clear" size="small" :disabled="currentPage === 1"
                        @click="goToPage(currentPage - 1)">
                        <font-awesome-icon icon="caret-left" />
                    </ion-button>
                    <span>Page {{ currentPage }} of {{ totalPages }}</span>
                    <ion-button fill="clear" size="small" :disabled="currentPage === totalPages"
                        @click="goToPage(currentPage + 1)">
                        <font-awesome-icon icon="caret-right" />
                    </ion-button>
                </div>
            </div>
        </ion-content>

        <!-- Delete Confirmation Modal -->
        <ion-modal :is-open="showDeleteModal" @didDismiss="showDeleteModal = false">
            <div class="ion-padding">
                <h2>Delete Song</h2>
                <p>Are you sure you want to delete "{{ selectedSong?.title }}"? This cannot be undone.</p>
                <div class="ion-text-right">
                    <ion-button fill="clear" @click="showDeleteModal = false">Cancel</ion-button>
                    <ion-button color="danger" @click="deleteSong">Delete</ion-button>
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
import SongCard from '@/components/song/SongCard.vue';
import songService from '@/services/song.service';
import type { Song } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const { loading, error, startLoading, stopLoading, setError, clearError } = useApiStatus();
const { page: currentPage, pageSize, total: totalItems, skip, totalPages, goToPage, setTotal, updateTotalPages } = usePagination(9);

const songs = ref<Song[]>([]);
const searchTerm = ref('');
const showDeleteModal = ref(false);
const selectedSong = ref<Song | null>(null);

onMounted(() => {
    loadSongs();
});

async function loadSongs() {
    try {
        startLoading();
        clearError();

        const userId = authStore.user?.user_id;
        if (!userId) {
            setError('User not authenticated');
            return;
        }

        const response = await songService.getSongsByArtist(
            userId,
            skip.value,
            pageSize.value
        );

        songs.value = response.data;
        setTotal(response.total);
        updateTotalPages();
    } catch (err: any) {
        setError(err.message || 'Failed to load songs');
        console.error('Error loading songs:', err);
    } finally {
        stopLoading();
    }
}

function handleSearch() {
    // You can implement search logic here
    // For now, just reload the songs
    goToPage(1);
    loadSongs();
}

function editSong(song: Song) {
    router.push(`/tabs/songs/${song.song_id}`);
}

function submitSong(song: Song) {
    router.push({
        path: '/tabs/submissions',
        query: { song_id: song.song_id }
    });
}

function confirmDelete(song: Song) {
    selectedSong.value = song;
    showDeleteModal.value = true;
}

async function deleteSong() {
    if (!selectedSong.value) return;

    try {
        startLoading();
        await songService.deleteSong(selectedSong.value.song_id);

        // Remove from local array
        songs.value = songs.value.filter(s => s.song_id !== selectedSong.value?.song_id);

        // Close modal
        showDeleteModal.value = false;
        selectedSong.value = null;

        // Show toast message
        const toast = await toastController.create({
            message: 'Song deleted successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

        // Reload data if the page is now empty
        if (songs.value.length === 0 && currentPage.value > 1) {
            goToPage(currentPage.value - 1);
            await loadSongs();
        }
    } catch (err: any) {
        const toast = await toastController.create({
            message: 'Failed to delete song',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
        console.error('Error deleting song:', err);
    } finally {
        stopLoading();
    }
}
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables';
@import '../../assets/styles/mixins';

.bg-artist {
    --ion-background-color: transparent;
    position: relative;
    
    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7) url('@/assets/music-artist-bg.jpg') no-repeat center center / cover;
        background-blend-mode: darken;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: -1;
    }
}

.ion-padding {
    padding-bottom: 80px;
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

.error-message {
    color: $danger-color;
    background: rgba($danger-color, 0.1);
    border-radius: $border-radius-md;
    padding: 16px;
    border: 1px solid rgba($danger-color, 0.3);
}

ion-grid {
    padding: 0;
}

ion-col {
    padding: 8px;
}

ion-modal {
    --height: auto;
    --width: 90%;
    --max-width: 400px;
    --border-radius: $border-radius-md;
    --backdrop-opacity: 0.8;
    
    .ion-padding {
        padding-bottom: 24px;
        
        h2 {
            margin-top: 0;
            color: $dark-color;
            font-weight: $font-weight-bold;
        }
    }
}

// Empty state styling
.empty-container {
    padding: 40px 20px !important;
    margin: 40px auto;
    max-width: 500px;
    border-radius: $border-radius-lg !important;
    
    .empty-icon {
        color: $primary-color;
        margin-bottom: 20px;
        filter: drop-shadow(0 0 10px rgba($primary-color, 0.7));
    }
    
    h4 {
        color: white;
        font-size: 1.5rem;
        font-weight: 600; /* Using direct value */
        margin-bottom: 10px;
    }
    
    p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.1rem;
        margin-bottom: 25px;
    }
    
    .action-btn {
        --background: $primary-color;
        --color: white;
        --border-radius: $border-radius-md;
        --padding-top: 10px;
        --padding-bottom: 10px;
        --padding-start: 20px;
        --padding-end: 20px;
        
        .button-icon {
            margin-right: 8px;
        }
    }
}

.search-container {
    margin-bottom: 20px;
    padding: 5px;
    border-radius: $border-radius-lg;
    
    .custom-searchbar {
        --background: transparent;
        --color: white;
        --placeholder-color: rgba(255, 255, 255, 0.6);
        --icon-color: $primary-color;
        --clear-button-color: $primary-color;
        
        --border-radius: $border-radius-md;
        --box-shadow: none;
        
        &::part(search-icon) {
            color: $primary-color;
        }
    }
}

.pulse-animation {
    animation: pulse 2s infinite;
}

.fade-in-animation {
    animation: fadeIn 1.5s ease-in-out;
    animation-fill-mode: both;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }
    50% {
        transform: scale(1.05);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 0.8;
    }
}

@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
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
