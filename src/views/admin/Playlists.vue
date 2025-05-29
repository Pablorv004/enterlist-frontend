<template>
  <div class="admin-playlists">
    <AdminSidePanel />
    <div class="admin-content">
      <div class="admin-header">
        <h1>Playlist Management</h1>
        <p>Manage all playlists in the system</p>
      </div>

      <div class="admin-table-container">
        <div class="table-controls">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search playlists..."
            @ionInput="handleSearch"
            show-clear-button="focus"
          />
          <ion-select
            v-model="genreFilter"
            placeholder="Filter by genre"
            @ionChange="handleGenreFilter"
          >
            <ion-select-option value="">All Genres</ion-select-option>
            <ion-select-option v-for="genre in genres" :key="genre" :value="genre">
              {{ genre }}
            </ion-select-option>
          </ion-select>
          <ion-select
            v-model="statusFilter"
            placeholder="Filter by status"
            @ionChange="handleStatusFilter"
          >
            <ion-select-option value="">All Status</ion-select-option>
            <ion-select-option value="active">Active</ion-select-option>
            <ion-select-option value="inactive">Inactive</ion-select-option>
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
                <th @click="handleSort('name')">
                  Name
                  <ion-icon :icon="getArrowIcon('name')" v-if="sortColumn === 'name'" />
                </th>
                <th @click="handleSort('genre')">
                  Genre
                  <ion-icon :icon="getArrowIcon('genre')" v-if="sortColumn === 'genre'" />
                </th>
                <th>Platform</th>
                <th @click="handleSort('followerCount')">
                  Followers
                  <ion-icon :icon="getArrowIcon('followerCount')" v-if="sortColumn === 'followerCount'" />
                </th>
                <th>Creator</th>
                <th @click="handleSort('isActive')">
                  Status
                  <ion-icon :icon="getArrowIcon('isActive')" v-if="sortColumn === 'isActive'" />
                </th>
                <th @click="handleSort('createdAt')">
                  Created At
                  <ion-icon :icon="getArrowIcon('createdAt')" v-if="sortColumn === 'createdAt'" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="playlist in paginatedPlaylists" :key="playlist.id">
                <td>{{ playlist.id }}</td>
                <td>
                  <div class="playlist-info">
                    <img 
                      v-if="playlist.imageUrl" 
                      :src="playlist.imageUrl" 
                      :alt="playlist.name"
                      class="playlist-image"
                    />
                    <span>{{ playlist.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="genre-tag">{{ playlist.genre }}</span>
                </td>
                <td>
                  <span class="platform-badge" :class="playlist.platform?.name">
                    {{ playlist.platform?.name }}
                  </span>
                </td>
                <td>{{ formatNumber(playlist.followerCount) }}</td>
                <td>{{ playlist.user?.firstName }} {{ playlist.user?.lastName }}</td>
                <td>
                  <ion-icon 
                    :icon="playlist.isActive ? checkmarkCircle : closeCircle"
                    :color="playlist.isActive ? 'success' : 'danger'"
                  />
                </td>
                <td>{{ formatDate(playlist.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="viewPlaylist(playlist)"
                      title="View Playlist"
                    >
                      <ion-icon :icon="eye" />
                    </ion-button>
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="editPlaylist(playlist)"
                      title="Edit Playlist"
                    >
                      <ion-icon :icon="create" />
                    </ion-button>
                    <ion-button
                      fill="clear"
                      size="small"
                      color="danger"
                      @click="deletePlaylist(playlist)"
                      title="Delete Playlist"
                    >
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
          <p>Loading playlists...</p>
        </div>

        <div v-if="error" class="error-container">
          <ion-icon :icon="alertCircle" color="danger" />
          <p>{{ error }}</p>
          <ion-button @click="loadPlaylists" fill="outline">Retry</ion-button>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && filteredPlaylists.length > 0">
          <ion-button
            fill="outline"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <ion-icon :icon="chevronBack" />
            Previous
          </ion-button>
          
          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }} 
            ({{ filteredPlaylists.length }} total playlists)
          </span>
          
          <ion-button
            fill="outline"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Next
            <ion-icon :icon="chevronForward" />
          </ion-button>
        </div>
      </div>
    </div>

    <!-- Playlist Detail Modal -->
    <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ modalMode === 'view' ? 'Playlist Details' : 'Edit Playlist' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-if="selectedPlaylist">
          <div class="playlist-detail-section">
            <h3>Basic Information</h3>
            <ion-item>
              <ion-label position="stacked">Name</ion-label>
              <ion-input
                v-model="selectedPlaylist.name"
                :readonly="modalMode === 'view'"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Description</ion-label>
              <ion-textarea
                v-model="selectedPlaylist.description"
                :readonly="modalMode === 'view'"
                :rows="3"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Genre</ion-label>
              <ion-input
                v-model="selectedPlaylist.genre"
                :readonly="modalMode === 'view'"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Follower Count</ion-label>
              <ion-input
                v-model="selectedPlaylist.followerCount"
                type="number"
                :readonly="modalMode === 'view'"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Status</ion-label>
              <ion-toggle
                v-model="selectedPlaylist.isActive"
                :disabled="modalMode === 'view'"
              />
            </ion-item>
          </div>

          <div class="playlist-detail-section" v-if="modalMode === 'edit'">
            <ion-button
              expand="block"
              @click="savePlaylist"
              :disabled="saving"
            >
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
  IonTextarea,
  IonToggle,
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
  checkmarkCircle,
  closeCircle,
  alertCircle
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';

interface Playlist {
  id: number;
  name: string;
  description: string;
  genre: string;
  followerCount: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  platform?: {
    name: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
}

// Reactive data
const playlists = ref<Playlist[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const genreFilter = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortColumn = ref('id');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Modal state
const isModalOpen = ref(false);
const modalMode = ref<'view' | 'edit'>('view');
const selectedPlaylist = ref<Playlist | null>(null);
const saving = ref(false);

// Computed properties
const genres = computed(() => {
  // Ensure playlists.value is an array before processing
  if (!Array.isArray(playlists.value)) {
    return [];
  }
  const uniqueGenres = [...new Set(playlists.value.map(p => p.genre))];
  return uniqueGenres.sort();
});

const filteredPlaylists = computed(() => {
  // Ensure playlists.value is an array before processing
  if (!Array.isArray(playlists.value)) {
    return [];
  }
  
  let filtered = [...playlists.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(playlist =>
      playlist.name.toLowerCase().includes(query) ||
      playlist.genre.toLowerCase().includes(query) ||
      playlist.description.toLowerCase().includes(query)
    );
  }

  // Apply genre filter
  if (genreFilter.value) {
    filtered = filtered.filter(playlist => playlist.genre === genreFilter.value);
  }

  // Apply status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active';
    filtered = filtered.filter(playlist => playlist.isActive === isActive);
  }
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortColumn.value as keyof Playlist] ?? '';
    const bVal = b[sortColumn.value as keyof Playlist] ?? '';
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection.value === 'desc' ? -comparison : comparison;
  });

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredPlaylists.value.length / itemsPerPage));

const paginatedPlaylists = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPlaylists.value.slice(start, end);
});

// Methods
const loadPlaylists = async () => {
  try {
    loading.value = true;
    error.value = '';
    playlists.value = await AdminService.getPlaylists();
  } catch (err) {
    error.value = 'Failed to load playlists';
    console.error('Error loading playlists:', err);
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

const handleStatusFilter = () => {
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

const viewPlaylist = (playlist: Playlist) => {
  selectedPlaylist.value = { ...playlist };
  modalMode.value = 'view';
  isModalOpen.value = true;
};

const editPlaylist = (playlist: Playlist) => {
  selectedPlaylist.value = { ...playlist };
  modalMode.value = 'edit';
  isModalOpen.value = true;
};

const savePlaylist = async () => {
  if (!selectedPlaylist.value) return;

  try {
    saving.value = true;
    await AdminService.updatePlaylist(selectedPlaylist.value.id, {
      name: selectedPlaylist.value.name,
      description: selectedPlaylist.value.description,
      genre: selectedPlaylist.value.genre,
      followerCount: selectedPlaylist.value.followerCount,
      isActive: selectedPlaylist.value.isActive
    });
    
    // Update local data
    const index = playlists.value.findIndex(p => p.id === selectedPlaylist.value!.id);
    if (index !== -1) {
      playlists.value[index] = { ...selectedPlaylist.value };
    }
    
    closeModal();
  } catch (err) {
    console.error('Error saving playlist:', err);
  } finally {
    saving.value = false;
  }
};

const deletePlaylist = async (playlist: Playlist) => {
  const alert = await alertController.create({
    header: 'Confirm Deletion',
    message: `Are you sure you want to delete playlist "${playlist.name}"? This action cannot be undone.`,
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
            await AdminService.deletePlaylist(playlist.id);
            playlists.value = playlists.value.filter(p => p.id !== playlist.id);
          } catch (err) {
            console.error('Error deleting playlist:', err);
          }
        }
      }
    ]
  });

  await alert.present();
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedPlaylist.value = null;
  modalMode.value = 'view';
  saving.value = false;
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadPlaylists();
});
</script>

<style scoped>
.admin-playlists {
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

.playlist-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playlist-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
}

.genre-tag {
  padding: 4px 8px;
  border-radius: 12px;
  background-color: var(--ion-color-light);
  color: var(--ion-color-dark);
  font-size: 0.8em;
  font-weight: 500;
}

.platform-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.platform-badge.spotify {
  background-color: #1DB954;
  color: white;
}

.platform-badge.youtube {
  background-color: #FF0000;
  color: white;
}

.platform-badge.apple {
  background-color: #000000;
  color: white;
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

.playlist-detail-section {
  margin-bottom: 24px;
}

.playlist-detail-section h3 {
  margin: 0 0 16px 0;
  color: var(--ion-color-primary);
}
</style>
