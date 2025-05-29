<template>
  <div class="admin-actions">
    <AdminSidePanel />
    <div class="admin-content">
      <div class="admin-header">
        <h1>Admin Actions Management</h1>
        <p>Manage all admin actions in the system</p>
      </div>

      <div class="admin-table-container">
        <div class="table-controls">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search actions..."
            @ionInput="handleSearch"
            show-clear-button="focus"
          />
          <ion-select
            v-model="actionTypeFilter"
            placeholder="Filter by action type"
            @ionChange="handleActionTypeFilter"
          >
            <ion-select-option value="">All Action Types</ion-select-option>
            <ion-select-option value="user_suspend">User Suspend</ion-select-option>
            <ion-select-option value="user_reactivate">User Reactivate</ion-select-option>
            <ion-select-option value="content_flag">Content Flag</ion-select-option>
            <ion-select-option value="content_unflag">Content Unflag</ion-select-option>
            <ion-select-option value="withdrawal_process">Withdrawal Process</ion-select-option>
            <ion-select-option value="content_delete">Content Delete</ion-select-option>
          </ion-select>
        </div>

        <div class="table-wrapper" v-if="!loading">
          <table class="admin-table">
            <thead>
              <tr>
                <th @click="handleSort('action_id')">
                  ID
                  <ion-icon :icon="getArrowIcon('action_id')" v-if="sortColumn === 'action_id'" />
                </th>
                <th @click="handleSort('action_type')">
                  Action Type
                  <ion-icon :icon="getArrowIcon('action_type')" v-if="sortColumn === 'action_type'" />
                </th>
                <th>Admin</th>
                <th>Target</th>
                <th>Reason</th>
                <th @click="handleSort('action_timestamp')">
                  Date
                  <ion-icon :icon="getArrowIcon('action_timestamp')" v-if="sortColumn === 'action_timestamp'" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="action in paginatedActions" :key="action.action_id">
                <td>{{ action.action_id }}</td>
                <td>
                  <span class="type-badge" :class="getActionTypeColor(action.action_type)">
                    {{ formatActionType(action.action_type) }}
                  </span>
                </td>
                <td>{{ action.admin?.username || 'Unknown' }}</td>
                <td>
                  <div class="target-info">
                    <span v-if="action.target_user_id">
                      User: {{ action.target_user?.username || action.target_user_id }}
                    </span>
                    <span v-else-if="action.target_playlist_id">
                      Playlist: {{ action.target_playlist?.name || action.target_playlist_id }}
                    </span>
                    <span v-else-if="action.target_song_id">
                      Song: {{ action.target_song?.title || action.target_song_id }}
                    </span>
                    <span v-else>No target</span>
                  </div>
                </td>
                <td>{{ action.reason || 'No reason provided' }}</td>
                <td>{{ formatDate(action.action_timestamp) }}</td>
                <td>
                  <div class="action-buttons">
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="viewAction(action)"
                      title="View Action"
                    >
                      <ion-icon :icon="eye" />
                    </ion-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="loading-container" v-if="loading">
          <ion-spinner />
          <p>Loading actions...</p>
        </div>

        <div class="error-container" v-if="error && !loading">
          <ion-icon :icon="alertCircle" />
          <p>{{ error }}</p>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && !error">
          <div class="pagination-info">
            Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredActions.length) }} of {{ filteredActions.length }}
          </div>
          <div class="pagination-controls">
            <ion-button 
              fill="outline" 
              size="small" 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1"
            >
              <ion-icon :icon="chevronBack" />
              Previous
            </ion-button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
            <ion-button 
              fill="outline" 
              size="small" 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
            >
              Next
              <ion-icon :icon="chevronForward" />
            </ion-button>
          </div>
        </div>
      </div>

      <!-- View Modal -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Action Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon :icon="close" />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="action-detail-section" v-if="selectedAction">
            <h3>Action Information</h3>
            <ion-item>
              <ion-label>
                <h4>Action ID</h4>
                <p>{{ selectedAction.action_id }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Action Type</h4>
                <p>{{ formatActionType(selectedAction.action_type) }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Admin</h4>
                <p>{{ selectedAction.admin?.username || 'Unknown' }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Reason</h4>
                <p>{{ selectedAction.reason || 'No reason provided' }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Date</h4>
                <p>{{ formatDate(selectedAction.action_timestamp) }}</p>
              </ion-label>
            </ion-item>
          </div>
        </ion-content>
      </ion-modal>
    </div>
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
  alertController
} from '@ionic/vue';
import {
  eye,
  chevronBack,
  chevronForward,
  arrowUp,
  arrowDown,
  alertCircle,
  close
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';

interface AdminAction {
  action_id: string;
  action_type: string;
  admin_user_id: string;
  target_user_id?: string;
  target_playlist_id?: string;
  target_song_id?: string;
  reason?: string;
  action_timestamp: string;
  admin?: {
    username: string;
    email: string;
  };
  target_user?: {
    username: string;
    email: string;
  };
  target_playlist?: {
    name: string;
  };
  target_song?: {
    title: string;
  };
}

// Reactive data
const actions = ref<AdminAction[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const actionTypeFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortColumn = ref('action_timestamp');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Modal state
const isModalOpen = ref(false);
const selectedAction = ref<AdminAction | null>(null);

// Computed properties
const filteredActions = computed(() => {
  // Ensure actions.value is an array before processing
  if (!Array.isArray(actions.value)) {
    return [];
  }
  
  let filtered = [...actions.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(action =>
      action.action_type.toLowerCase().includes(query) ||
      action.admin?.username?.toLowerCase().includes(query) ||
      action.target_user?.username?.toLowerCase().includes(query) ||
      action.target_playlist?.name?.toLowerCase().includes(query) ||
      action.target_song?.title?.toLowerCase().includes(query) ||
      action.reason?.toLowerCase().includes(query)
    );
  }

  // Apply action type filter
  if (actionTypeFilter.value) {
    filtered = filtered.filter(action => action.action_type === actionTypeFilter.value);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortColumn.value as keyof AdminAction] ?? '';
    const bVal = b[sortColumn.value as keyof AdminAction] ?? '';
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection.value === 'desc' ? -comparison : comparison;
  });

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredActions.value.length / itemsPerPage));

const paginatedActions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredActions.value.slice(start, end);
});

// Methods
const loadActions = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await AdminService.getAdminActions();
    console.log('Admin Actions Response:', response);
    actions.value = response.data || [];
  } catch (err: any) {
    error.value = err.message || 'Failed to load admin actions';
    console.error('Error loading admin actions:', err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page when searching
};

const handleActionTypeFilter = () => {
  currentPage.value = 1; // Reset to first page when filtering
};

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1; // Reset to first page when sorting
};

const getArrowIcon = (column: string) => {
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

const viewAction = (action: AdminAction) => {
  selectedAction.value = { ...action };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedAction.value = null;
};

const getActionTypeColor = (actionType?: string) => {
  switch (actionType) {
    case 'user_suspend':
      return 'danger';
    case 'user_reactivate':
      return 'success';
    case 'content_flag':
      return 'warning';
    case 'content_unflag':
      return 'success';
    case 'withdrawal_process':
      return 'primary';
    case 'content_delete':
      return 'danger';
    default:
      return 'medium';
  }
};

const formatActionType = (actionType?: string) => {
  if (!actionType) return 'Unknown';
  return actionType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  loadActions();
});
</script>

<style scoped>
.admin-actions {
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
  min-width: 200px;
}

.table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--ion-color-light);
}

.admin-table th {
  background-color: var(--ion-color-light);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.admin-table th:hover {
  background-color: var(--ion-color-medium-tint);
}

.admin-table tr:hover {
  background-color: var(--ion-color-light-tint);
}

.type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.type-badge.primary {
  background-color: var(--ion-color-primary-tint);
  color: var(--ion-color-primary);
}

.type-badge.success {
  background-color: var(--ion-color-success-tint);
  color: var(--ion-color-success);
}

.type-badge.warning {
  background-color: var(--ion-color-warning-tint);
  color: var(--ion-color-warning);
}

.type-badge.danger {
  background-color: var(--ion-color-danger-tint);
  color: var(--ion-color-danger);
}

.type-badge.medium {
  background-color: var(--ion-color-medium-tint);
  color: var(--ion-color-medium);
}

.target-info {
  font-size: 0.9em;
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
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-container ion-spinner {
  margin-bottom: 16px;
}

.error-container ion-icon {
  font-size: 48px;
  margin-bottom: 16px;
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
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-info {
  color: var(--ion-color-medium);
  font-size: 14px;
}

.action-detail-section {
  margin-bottom: 20px;
}

.action-detail-section h3 {
  margin-bottom: 16px;
  color: var(--ion-color-primary);
}

.action-detail-section ion-item {
  --border-width: 0 0 1px 0;
  --border-color: var(--ion-color-light);
}

.action-detail-section ion-item:last-child {
  --border-width: 0;
}

@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }

  .admin-header h1 {
    font-size: 24px;
  }

  .table-controls {
    flex-direction: column;
  }

  .table-controls ion-select {
    min-width: unset;
  }

  .admin-table {
    font-size: 14px;
  }

  .admin-table th,
  .admin-table td {
    padding: 8px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
