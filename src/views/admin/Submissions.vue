<template>
  <div class="admin-submissions">
    <AdminSidePanel />
    <div class="admin-content">
      <div class="admin-header">
        <h1>Submission Management</h1>
        <p>Manage all submissions in the system</p>
      </div>

      <div class="admin-table-container">
        <div class="table-controls">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search submissions..."
            @ionInput="handleSearch"
            show-clear-button="focus"
          />
          <ion-select
            v-model="statusFilter"
            placeholder="Filter by status"
            @ionChange="handleStatusFilter"
          >
            <ion-select-option value="">All Status</ion-select-option>
            <ion-select-option value="pending">Pending</ion-select-option>
            <ion-select-option value="approved">Approved</ion-select-option>
            <ion-select-option value="rejected">Rejected</ion-select-option>
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
                <th>Song</th>
                <th>Playlist</th>
                <th>Artist</th>
                <th @click="handleSort('status')">
                  Status
                  <ion-icon :icon="getArrowIcon('status')" v-if="sortColumn === 'status'" />
                </th>
                <th @click="handleSort('amount')">
                  Amount
                  <ion-icon :icon="getArrowIcon('amount')" v-if="sortColumn === 'amount'" />
                </th>
                <th @click="handleSort('createdAt')">
                  Submitted At
                  <ion-icon :icon="getArrowIcon('createdAt')" v-if="sortColumn === 'createdAt'" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="submission in paginatedSubmissions" :key="submission.id">
                <td>{{ submission.id }}</td>
                <td>
                  <div class="song-info">
                    <div class="song-title">{{ submission.song?.title }}</div>
                    <div class="song-artist">{{ submission.song?.artist }}</div>
                  </div>
                </td>
                <td>
                  <div class="playlist-info">
                    <div class="playlist-name">{{ submission.playlist?.name }}</div>
                    <div class="playlist-genre">{{ submission.playlist?.genre }}</div>
                  </div>
                </td>
                <td>{{ submission.user?.firstName }} {{ submission.user?.lastName }}</td>
                <td>
                  <span class="status-badge" :class="submission.status">
                    {{ formatStatus(submission.status) }}
                  </span>
                </td>
                <td class="amount-cell">
                  <span class="amount">${{ formatAmount(submission.amount) }}</span>
                </td>
                <td>{{ formatDate(submission.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="viewSubmission(submission)"
                      title="View Submission"
                    >
                      <ion-icon :icon="eye" />
                    </ion-button>
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="editSubmission(submission)"
                      title="Edit Submission"
                    >
                      <ion-icon :icon="create" />
                    </ion-button>
                    <ion-button
                      fill="clear"
                      size="small"
                      color="danger"
                      @click="deleteSubmission(submission)"
                      title="Delete Submission"
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
          <p>Loading submissions...</p>
        </div>

        <div v-if="error" class="error-container">
          <ion-icon :icon="alertCircle" color="danger" />
          <p>{{ error }}</p>
          <ion-button @click="loadSubmissions" fill="outline">Retry</ion-button>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && filteredSubmissions.length > 0">
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
            ({{ filteredSubmissions.length }} total submissions)
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

    <!-- Submission Detail Modal -->
    <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ modalMode === 'view' ? 'Submission Details' : 'Edit Submission' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-if="selectedSubmission">
          <div class="submission-detail-section">
            <h3>Submission Information</h3>
            <ion-item>
              <ion-label position="stacked">Status</ion-label>
              <ion-select
                v-model="selectedSubmission.status"
                :disabled="modalMode === 'view'"
              >
                <ion-select-option value="pending">Pending</ion-select-option>
                <ion-select-option value="approved">Approved</ion-select-option>
                <ion-select-option value="rejected">Rejected</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Amount</ion-label>
              <ion-input
                v-model="selectedSubmission.amount"
                type="number"
                step="0.01"
                :readonly="modalMode === 'view'"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Notes</ion-label>              <ion-textarea
                v-model="selectedSubmission.notes"
                :readonly="modalMode === 'view'"
                :rows="3"
              />
            </ion-item>
          </div>

          <div class="submission-detail-section">
            <h3>Song Details</h3>
            <ion-item>
              <ion-label>
                <h4>Title</h4>
                <p>{{ selectedSubmission.song?.title }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Artist</h4>
                <p>{{ selectedSubmission.song?.artist }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Genre</h4>
                <p>{{ selectedSubmission.song?.genre }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="submission-detail-section">
            <h3>Playlist Details</h3>
            <ion-item>
              <ion-label>
                <h4>Name</h4>
                <p>{{ selectedSubmission.playlist?.name }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Genre</h4>
                <p>{{ selectedSubmission.playlist?.genre }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Followers</h4>
                <p>{{ formatNumber(selectedSubmission.playlist?.followerCount || 0) }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="submission-detail-section" v-if="modalMode === 'edit'">
            <ion-button
              expand="block"
              @click="saveSubmission"
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

interface Submission {
  id: number;
  status: string;
  amount: number;
  notes?: string;
  createdAt: string;
  song?: {
    title: string;
    artist: string;
    genre: string;
  };
  playlist?: {
    name: string;
    genre: string;
    followerCount: number;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
}

// Reactive data
const submissions = ref<Submission[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortColumn = ref('id');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Modal state
const isModalOpen = ref(false);
const modalMode = ref<'view' | 'edit'>('view');
const selectedSubmission = ref<Submission | null>(null);
const saving = ref(false);

// Computed properties
const filteredSubmissions = computed(() => {
  // Ensure submissions.value is an array before processing
  if (!Array.isArray(submissions.value)) {
    return [];
  }
  
  let filtered = [...submissions.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(submission =>
      submission.song?.title?.toLowerCase().includes(query) ||
      submission.song?.artist?.toLowerCase().includes(query) ||
      submission.playlist?.name?.toLowerCase().includes(query) ||
      submission.user?.firstName?.toLowerCase().includes(query) ||
      submission.user?.lastName?.toLowerCase().includes(query)
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(submission => submission.status === statusFilter.value);
  }
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortColumn.value as keyof Submission] ?? '';
    const bVal = b[sortColumn.value as keyof Submission] ?? '';
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection.value === 'desc' ? -comparison : comparison;
  });

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredSubmissions.value.length / itemsPerPage));

const paginatedSubmissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredSubmissions.value.slice(start, end);
});

// Methods
const loadSubmissions = async () => {
  try {
    loading.value = true;
    error.value = '';
    submissions.value = await AdminService.getSubmissions();
  } catch (err) {
    error.value = 'Failed to load submissions';
    console.error('Error loading submissions:', err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
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

const viewSubmission = (submission: Submission) => {
  selectedSubmission.value = { ...submission };
  modalMode.value = 'view';
  isModalOpen.value = true;
};

const editSubmission = (submission: Submission) => {
  selectedSubmission.value = { ...submission };
  modalMode.value = 'edit';
  isModalOpen.value = true;
};

const saveSubmission = async () => {
  if (!selectedSubmission.value) return;

  try {
    saving.value = true;
    await AdminService.updateSubmission(selectedSubmission.value.id, {
      status: selectedSubmission.value.status,
      amount: selectedSubmission.value.amount,
      notes: selectedSubmission.value.notes
    });
    
    // Update local data
    const index = submissions.value.findIndex(s => s.id === selectedSubmission.value!.id);
    if (index !== -1) {
      submissions.value[index] = { ...selectedSubmission.value };
    }
    
    closeModal();
  } catch (err) {
    console.error('Error saving submission:', err);
  } finally {
    saving.value = false;
  }
};

const deleteSubmission = async (submission: Submission) => {
  const alert = await alertController.create({
    header: 'Confirm Deletion',
    message: `Are you sure you want to delete submission #${submission.id}? This action cannot be undone.`,
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
            await AdminService.deleteSubmission(submission.id);
            submissions.value = submissions.value.filter(s => s.id !== submission.id);
          } catch (err) {
            console.error('Error deleting submission:', err);
          }
        }
      }
    ]
  });

  await alert.present();
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedSubmission.value = null;
  modalMode.value = 'view';
  saving.value = false;
};

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };
  return statuses[status] || status;
};

const formatAmount = (amount: number) => {
  return amount.toFixed(2);
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadSubmissions();
});
</script>

<style scoped>
.admin-submissions {
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

.song-info,
.playlist-info {
  display: flex;
  flex-direction: column;
}

.song-title,
.playlist-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.song-artist,
.playlist-genre {
  font-size: 0.9em;
  color: var(--ion-color-medium);
}

.amount-cell {
  text-align: right;
}

.amount {
  font-weight: 600;
  font-size: 1.1em;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: var(--ion-color-warning-tint);
  color: var(--ion-color-warning);
}

.status-badge.approved {
  background-color: var(--ion-color-success-tint);
  color: var(--ion-color-success);
}

.status-badge.rejected {
  background-color: var(--ion-color-danger-tint);
  color: var(--ion-color-danger);
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

.submission-detail-section {
  margin-bottom: 24px;
}

.submission-detail-section h3 {
  margin: 0 0 16px 0;
  color: var(--ion-color-primary);
}
</style>
