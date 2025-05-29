<template>
  <div class="admin-playlists">
    <AdminSidePanel />
    <div class="admin-content">
      <div class="admin-header">
        <h1>Playlist Management</h1>
        <p>Manage all playlists in the system</p>
      </div>

      <div class="admin-table-container">
        <div class="table-controls">          <ion-searchbar
            v-model="globalFilter"
            placeholder="Search playlists..."
            @ionInput="() => {}"
            show-clear-button="focus"
          />          <ion-select
            v-model="genreFilter"
            placeholder="Filter by genre"
            @ionChange="() => {}"
          >
            <ion-select-option value="">All Genres</ion-select-option>
            <ion-select-option v-for="genre in genres" :key="genre" :value="genre">
              {{ genre }}
            </ion-select-option>
          </ion-select>
          <ion-select
            v-model="statusFilter"
            placeholder="Filter by status"
            @ionChange="() => {}"
          >
            <ion-select-option value="">All Status</ion-select-option>
            <ion-select-option value="active">Active</ion-select-option>
            <ion-select-option value="inactive">Inactive</ion-select-option>
          </ion-select>
        </div>        <div class="table-wrapper" v-if="!loading && table">
          <table class="admin-table">
            <thead>
              <tr>
                <th v-for="header in table.getFlatHeaders()" :key="header.id">
                  <div 
                    v-if="header.column.getCanSort()"
                    @click="header.column.getToggleSortingHandler()?.($event)"
                    class="sortable-header"
                  >
                    {{ header.column.columnDef.header }}
                    <ion-icon 
                      v-if="header.column.getIsSorted() === 'asc'" 
                      :icon="arrowUp" 
                    />
                    <ion-icon 
                      v-else-if="header.column.getIsSorted() === 'desc'" 
                      :icon="arrowDown" 
                    />
                  </div>
                  <div v-else>
                    {{ header.column.columnDef.header }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in table.getRowModel().rows" :key="row.id">
                <td v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <div v-if="cell.column.columnDef.cell && typeof cell.column.columnDef.cell === 'function'">
                    <component :is="(cell.column.columnDef.cell as any)(cell)" />
                  </div>
                  <span v-else>{{ cell.getValue() }}</span>
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
        </div>        <!-- Pagination -->
        <div class="pagination" v-if="!loading && !error && table">
          <div class="pagination-info">
            Showing {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }}-{{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }} of {{ table.getFilteredRowModel().rows.length }}
          </div>
          <div class="pagination-controls">
            <ion-button 
              fill="outline" 
              size="small" 
              @click="table.previousPage()" 
              :disabled="!table.getCanPreviousPage()"
            >
              <ion-icon :icon="chevronBack" />
              Previous
            </ion-button>
            <span class="page-info">
              Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() }}
            </span>
            <ion-button
              fill="outline" 
              size="small" 
              @click="table.nextPage()" 
              :disabled="!table.getCanNextPage()"
            >
              Next
              <ion-icon :icon="chevronForward" />
            </ion-button>
          </div>
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
import { ref, computed, onMounted, h } from 'vue';
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
import {
  useVueTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper
} from '@tanstack/vue-table';

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
const globalFilter = ref('');
const genreFilter = ref('');
const statusFilter = ref('');

// Modal state
const isModalOpen = ref(false);
const modalMode = ref<'view' | 'edit'>('view');
const selectedPlaylist = ref<Playlist | null>(null);
const saving = ref(false);

// Column helper
const columnHelper = createColumnHelper<Playlist>();

// Define columns
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => {
      const playlist = info.row.original;
      return h('div', { class: 'playlist-info' }, [
        playlist.imageUrl ? h('img', {
          src: playlist.imageUrl,
          alt: playlist.name,
          class: 'playlist-image'
        }) : null,
        h('span', playlist.name)
      ]);
    },
    enableSorting: true,
  }),
  columnHelper.accessor('genre', {
    header: 'Genre',
    cell: info => h('span', { class: 'genre-tag' }, info.getValue()),
    enableSorting: true,
  }),
  columnHelper.accessor('platform.name', {
    header: 'Platform',
    cell: info => h('span', {
      class: `platform-badge ${info.getValue()?.toLowerCase()}`
    }, info.getValue() || 'N/A'),
    enableSorting: false,
  }),
  columnHelper.accessor('followerCount', {
    header: 'Followers',
    cell: info => formatNumber(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.display({
    header: 'Creator',
    cell: info => {
      const user = info.row.original.user;
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A';
    },
  }),
  columnHelper.accessor('isActive', {
    header: 'Status',
    cell: info => h(IonIcon, {
      icon: info.getValue() ? checkmarkCircle : closeCircle,
      color: info.getValue() ? 'success' : 'danger'
    }),
    enableSorting: true,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created At',
    cell: info => formatDate(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.display({
    header: 'Actions',
    cell: info => h('div', { class: 'action-buttons' }, [
      h(IonButton, {
        fill: 'clear',
        size: 'small',
        title: 'View Playlist',
        onClick: () => viewPlaylist(info.row.original)
      }, () => h(IonIcon, { icon: eye })),
      h(IonButton, {
        fill: 'clear',
        size: 'small',
        title: 'Edit Playlist',
        onClick: () => editPlaylist(info.row.original)
      }, () => h(IonIcon, { icon: create })),
      h(IonButton, {
        fill: 'clear',
        size: 'small',
        color: 'danger',
        title: 'Delete Playlist',
        onClick: () => deletePlaylist(info.row.original)
      }, () => h(IonIcon, { icon: trash }))
    ]),
  }),
];

// Custom filter functions
const genreFilterFn = (row: any, columnId: string, filterValue: string) => {
  if (!filterValue) return true;
  return row.original.genre === filterValue;
};

const statusFilterFn = (row: any, columnId: string, filterValue: string) => {
  if (!filterValue) return true;
  const isActive = filterValue === 'active';
  return row.original.isActive === isActive;
};

// Create table
const table = useVueTable({
  get data() { return playlists.value; },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get globalFilter() { return globalFilter.value; },
    get columnFilters() { 
      const filters = [];
      if (genreFilter.value) {
        filters.push({ id: 'genre', value: genreFilter.value });
      }
      if (statusFilter.value) {
        filters.push({ id: 'isActive', value: statusFilter.value });
      }
      return filters;
    },
  },
  onGlobalFilterChange: (value) => {
    globalFilter.value = value;
  },
  globalFilterFn: 'includesString',
  filterFns: {
    genre: genreFilterFn,
    status: statusFilterFn,
  },
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
});

// Computed properties
const genres = computed(() => {
  if (!Array.isArray(playlists.value)) {
    return [];
  }
  const uniqueGenres = [...new Set(playlists.value.map(p => p.genre))];
  return uniqueGenres.sort();
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
