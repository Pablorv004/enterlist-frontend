<template>
    <div class="admin-songs">
        <AdminSidePanel />
        <div class="admin-content">
            <div class="admin-header">
                <h1>Song Management</h1>
                <p>Manage all songs in the system</p>
            </div>

            <div class="admin-table-container">
                <div class="table-controls">
                    <ion-searchbar v-model="searchQuery" placeholder="Search songs..." @ionInput="handleSearch"
                        show-clear-button="focus" />
                    <ion-select v-model="genreFilter" placeholder="Filter by genre" @ionChange="handleGenreFilter">
                        <ion-select-option value="">All Genres</ion-select-option>
                        <ion-select-option v-for="genre in genres" :key="genre" :value="genre">
                            {{ genre }}
                        </ion-select-option>
                    </ion-select>
                </div>

                <div class="table-wrapper" v-if="!loading">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th @click="handleSort('id')">
                                    ID
                                    <ion-icon :icon="getArrowIcon('id')" v-if="sortColumn === 'id'" />
                                </th>
                                <th @click="handleSort('title')">
                                    Title
                                    <ion-icon :icon="getArrowIcon('title')" v-if="sortColumn === 'title'" />
                                </th>
                                <th @click="handleSort('artist')">
                                    Artist
                                    <ion-icon :icon="getArrowIcon('artist')" v-if="sortColumn === 'artist'" />
                                </th>
                                <th @click="handleSort('genre')">
                                    Genre
                                    <ion-icon :icon="getArrowIcon('genre')" v-if="sortColumn === 'genre'" />
                                </th>
                                <th @click="handleSort('duration')">
                                    Duration
                                    <ion-icon :icon="getArrowIcon('duration')" v-if="sortColumn === 'duration'" />
                                </th>
                                <th>Creator</th>
                                <th @click="handleSort('createdAt')">
                                    Created At
                                    <ion-icon :icon="getArrowIcon('createdAt')" v-if="sortColumn === 'createdAt'" />
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="song in paginatedSongs" :key="song.id">
                                <td>{{ song.id }}</td>
                                <td>
                                    <div class="song-info">
                                        <img v-if="song.coverImageUrl" :src="song.coverImageUrl" :alt="song.title"
                                            class="song-image" />
                                        <div>
                                            <div class="song-title">{{ song.title }}</div>
                                            <div class="song-artist">{{ song.artist }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ song.artist }}</td>
                                <td>
                                    <span class="genre-tag">{{ song.genre }}</span>
                                </td>
                                <td>{{ formatDuration(song.duration) }}</td>
                                <td>{{ song.user?.firstName }} {{ song.user?.lastName }}</td>
                                <td>{{ formatDate(song.createdAt) }}</td>
                                <td>
                                    <div class="action-buttons">
                                        <ion-button fill="clear" size="small" @click="viewSong(song)" title="View Song">
                                            <ion-icon :icon="eye" />
                                        </ion-button>
                                        <ion-button fill="clear" size="small" @click="editSong(song)" title="Edit Song">
                                            <ion-icon :icon="create" />
                                        </ion-button>
                                        <ion-button fill="clear" size="small" color="danger" @click="deleteSong(song)"
                                            title="Delete Song">
                                            <ion-icon :icon="trash" />
                                        </ion-button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="loading" class="loading-container">
                    <ion-spinner name="circular" />
                    <p>Loading songs...</p>
                </div>

                <div v-if="error" class="error-container">
                    <ion-icon :icon="alertCircle" color="danger" />
                    <p>{{ error }}</p>
                    <ion-button @click="loadSongs" fill="outline">Retry</ion-button>
                </div>

                <!-- Pagination -->
                <div class="pagination" v-if="!loading && filteredSongs.length > 0">
                    <ion-button fill="outline" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                        <ion-icon :icon="chevronBack" />
                        Previous
                    </ion-button>

                    <span class="pagination-info">
                        Page {{ currentPage }} of {{ totalPages }}
                        ({{ filteredSongs.length }} total songs)
                    </span>

                    <ion-button fill="outline" :disabled="currentPage === totalPages"
                        @click="goToPage(currentPage + 1)">
                        Next
                        <ion-icon :icon="chevronForward" />
                    </ion-button>
                </div>
            </div>
        </div>

        <!-- Song Detail Modal -->
        <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>{{ modalMode === 'view' ? 'Song Details' : 'Edit Song' }}</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeModal">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <div v-if="selectedSong">
                    <div class="song-detail-section">
                        <h3>Basic Information</h3>
                        <ion-item>
                            <ion-label position="stacked">Title</ion-label>
                            <ion-input v-model="selectedSong.title" :readonly="modalMode === 'view'" />
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Artist</ion-label>
                            <ion-input v-model="selectedSong.artist" :readonly="modalMode === 'view'" />
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Album</ion-label>
                            <ion-input v-model="selectedSong.album" :readonly="modalMode === 'view'" />
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Genre</ion-label>
                            <ion-input v-model="selectedSong.genre" :readonly="modalMode === 'view'" />
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Duration (seconds)</ion-label>
                            <ion-input v-model="selectedSong.duration" type="number" :readonly="modalMode === 'view'" />
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Spotify URL</ion-label>
                            <ion-input v-model="selectedSong.spotifyUrl" :readonly="modalMode === 'view'" />
                        </ion-item>
                    </div>

                    <div class="song-detail-section" v-if="modalMode === 'edit'">
                        <ion-button expand="block" @click="saveSong" :disabled="saving">
                            <ion-spinner v-if="saving" name="circular" />
                            {{ saving ? 'Saving...' : 'Save Changes' }}
                        </ion-button>
                    </div>
                </div>
            </ion-content>
        </ion-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSpinner,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    alertController
} from '@ionic/vue';
import {
    eye,
    create,
    trash,
    chevronBack,
    chevronForward,
    arrowUp,
    arrowDown,
    alertCircle
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';

interface Song {
    id: number;
    title: string;
    artist: string;
    album?: string;
    genre: string;
    duration: number;
    spotifyUrl?: string;
    coverImageUrl?: string;
    createdAt: string;
    user?: {
        firstName: string;
        lastName: string;
    };
}

// Reactive data
const songs = ref<Song[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const genreFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortColumn = ref('id');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Modal state
const isModalOpen = ref(false);
const modalMode = ref<'view' | 'edit'>('view');
const selectedSong = ref<Song | null>(null);
const saving = ref(false);

// Computed properties
const genres = computed(() => {
    const uniqueGenres = [...new Set(songs.value.map(s => s.genre))];
    return uniqueGenres.sort();
});

const filteredSongs = computed(() => {
    // Ensure songs.value is an array before processing
    if (!Array.isArray(songs.value)) {
        return [];
    }
    
    let filtered = [...songs.value];

    // Apply search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query) ||
            song.album?.toLowerCase().includes(query) ||
            song.genre.toLowerCase().includes(query)
        );
    }

    // Apply genre filter
    if (genreFilter.value) {
        filtered = filtered.filter(song => song.genre === genreFilter.value);
    }

    // Apply sorting
    filtered.sort((a, b) => {
        const aVal = a[sortColumn.value as keyof Song];
        const bVal = b[sortColumn.value as keyof Song];

        let comparison = 0;
        // Handle undefined values in comparison
        if (aVal === undefined && bVal === undefined) comparison = 0;
        else if (aVal === undefined) comparison = -1;
        else if (bVal === undefined) comparison = 1;
        else if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;

        return sortDirection.value === 'desc' ? -comparison : comparison;
    });

    return filtered;
});

const totalPages = computed(() => Math.ceil(filteredSongs.value.length / itemsPerPage));

const paginatedSongs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredSongs.value.slice(start, end);
});

// Methods
const loadSongs = async () => {
    try {
        loading.value = true;
        error.value = '';
        songs.value = await AdminService.getSongs();
    } catch (err) {
        error.value = 'Failed to load songs';
        console.error('Error loading songs:', err);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    currentPage.value = 1;
};

const handleGenreFilter = () => {
    currentPage.value = 1;
};

const handleSort = (column: string) => {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
    }
    currentPage.value = 1;
};

const getArrowIcon = (column: string): string | undefined => {
    if (sortColumn.value === column) {
        return sortDirection.value === 'asc' ? arrowUp : arrowDown;
    }
    return undefined;
};

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const viewSong = (song: Song) => {
    selectedSong.value = { ...song };
    modalMode.value = 'view';
    isModalOpen.value = true;
};

const editSong = (song: Song) => {
    selectedSong.value = { ...song };
    modalMode.value = 'edit';
    isModalOpen.value = true;
};

const saveSong = async () => {
    if (!selectedSong.value) return;

    try {
        saving.value = true;
        await AdminService.updateSong(selectedSong.value.id, {
            title: selectedSong.value.title,
            artist: selectedSong.value.artist,
            album: selectedSong.value.album,
            genre: selectedSong.value.genre,
            duration: selectedSong.value.duration,
            spotifyUrl: selectedSong.value.spotifyUrl
        });

        // Update local data
        const index = songs.value.findIndex(s => s.id === selectedSong.value!.id);
        if (index !== -1) {
            songs.value[index] = { ...selectedSong.value };
        }

        closeModal();
    } catch (err) {
        console.error('Error saving song:', err);
    } finally {
        saving.value = false;
    }
};

const deleteSong = async (song: Song) => {
    const alert = await alertController.create({
        header: 'Confirm Deletion',
        message: `Are you sure you want to delete song "${song.title}" by ${song.artist}? This action cannot be undone.`,
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel'
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: async () => {
                    try {
                        await AdminService.deleteSong(song.id);
                        songs.value = songs.value.filter(s => s.id !== song.id);
                    } catch (err) {
                        console.error('Error deleting song:', err);
                    }
                }
            }
        ]
    });

    await alert.present();
};

const closeModal = () => {
    isModalOpen.value = false;
    selectedSong.value = null;
    modalMode.value = 'view';
    saving.value = false;
};

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
    loadSongs();
});
</script>

<style scoped>
.admin-songs {
    display: flex;
    height: 100vh;
}

.admin-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.admin-header {
    margin-bottom: 30px;
}

.admin-header h1 {
    margin: 0 0 5px 0;
    color: var(--ion-color-primary);
}

.admin-header p {
    margin: 0;
    color: var(--ion-color-medium);
}

.admin-table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.table-controls {
    display: flex;
    gap: 16px;
    padding: 20px;
    border-bottom: 1px solid var(--ion-color-light);
}

.table-controls ion-searchbar {
    flex: 1;
}

.table-controls ion-select {
    min-width: 150px;
}

.table-wrapper {
    overflow-x: auto;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
}

.admin-table th {
    background-color: var(--ion-color-light);
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
}

.admin-table th:hover {
    background-color: var(--ion-color-light-shade);
}

.admin-table td {
    padding: 16px 12px;
    border-bottom: 1px solid var(--ion-color-light);
}

.song-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.song-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
}

.song-title {
    font-weight: 600;
    margin-bottom: 2px;
}

.song-artist {
    font-size: 0.9em;
    color: var(--ion-color-medium);
}

.genre-tag {
    padding: 4px 8px;
    border-radius: 12px;
    background-color: var(--ion-color-light);
    color: var(--ion-color-dark);
    font-size: 0.8em;
    font-weight: 500;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.loading-container,
.error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    color: var(--ion-color-medium);
}

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-top: 1px solid var(--ion-color-light);
}

.pagination-info {
    color: var(--ion-color-medium);
    font-size: 0.9em;
}

.song-detail-section {
    margin-bottom: 24px;
}

.song-detail-section h3 {
    margin: 0 0 16px 0;
    color: var(--ion-color-primary);
}
</style>
