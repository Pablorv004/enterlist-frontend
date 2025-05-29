<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Admin Actions</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="admin-content">
        <AdminSidePanel />
        
        <div class="main-content">
          <div class="page-header">
            <h1>Admin Actions Log</h1>
            <ion-button @click="openCreateModal" color="primary">
              <ion-icon :icon="addIcon" slot="start"></ion-icon>
              Log Action
            </ion-button>
          </div>

          <!-- Search and filters -->
          <div class="filters-section">
            <ion-searchbar
              v-model="searchTerm"
              placeholder="Search actions..."
              @ionInput="handleSearch"
              show-clear-button="focus"
            ></ion-searchbar>
            
            <div class="filter-row">
              <ion-select v-model="actionTypeFilter" placeholder="All Action Types" @ionChange="handleSearch">
                <ion-select-option value="">All Action Types</ion-select-option>
                <ion-select-option value="user_suspend">User Suspend</ion-select-option>
                <ion-select-option value="user_reactivate">User Reactivate</ion-select-option>
                <ion-select-option value="content_flag">Content Flag</ion-select-option>
                <ion-select-option value="content_unflag">Content Unflag</ion-select-option>
                <ion-select-option value="withdrawal_process">Withdrawal Process</ion-select-option>
                <ion-select-option value="content_delete">Content Delete</ion-select-option>
              </ion-select>
            </div>
          </div>

          <!-- Actions table -->
          <div class="table-container">
            <ion-card>
              <ion-card-content>
                <div v-if="loading" class="loading-container">
                  <ion-spinner></ion-spinner>
                  <p>Loading admin actions...</p>
                </div>

                <div v-else-if="error" class="error-container">
                  <ion-icon :icon="alertCircleIcon" color="danger"></ion-icon>
                  <p>{{ error }}</p>
                  <ion-button @click="loadActions" fill="outline">Retry</ion-button>
                </div>

                <div v-else>
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th @click="sort('action_id')" class="sortable">
                          ID
                          <ion-icon :icon="getSortIcon('action_id')" class="sort-icon"></ion-icon>
                        </th>
                        <th @click="sort('action_type')" class="sortable">
                          Action Type
                          <ion-icon :icon="getSortIcon('action_type')" class="sort-icon"></ion-icon>
                        </th>
                        <th @click="sort('admin_user_id')" class="sortable">
                          Admin
                          <ion-icon :icon="getSortIcon('admin_user_id')" class="sort-icon"></ion-icon>
                        </th>
                        <th>Target</th>
                        <th @click="sort('reason')" class="sortable">
                          Reason
                          <ion-icon :icon="getSortIcon('reason')" class="sort-icon"></ion-icon>
                        </th>
                <th @click="sort('action_timestamp')" class="sortable">
                          Date
                          <ion-icon :icon="getSortIcon('action_timestamp')" class="sort-icon"></ion-icon>
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="action in paginatedActions" :key="action.action_id">
                        <td>{{ action.action_id }}</td>
                        <td>
                          <ion-badge :color="getActionTypeColor(action.action_type)">
                            {{ formatActionType(action.action_type) }}
                          </ion-badge>
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
                            <ion-button fill="clear" size="small" @click="viewAction(action)" color="primary">
                              <ion-icon :icon="eyeIcon"></ion-icon>
                            </ion-button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Pagination -->
                  <div class="pagination-container">
                    <div class="pagination-info">
                      Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredActions.length) }} of {{ filteredActions.length }} actions
                    </div>
                    <div class="pagination-controls">
                      <ion-button 
                        fill="outline" 
                        size="small" 
                        @click="currentPage--" 
                        :disabled="currentPage === 1"
                      >
                        Previous
                      </ion-button>
                      <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
                      <ion-button 
                        fill="outline" 
                        size="small" 
                        @click="currentPage++" 
                        :disabled="currentPage === totalPages"
                      >
                        Next
                      </ion-button>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>

      <!-- View/Create Modal -->
      <ion-modal :is-open="modalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ modalMode === 'create' ? 'Log Admin Action' : 'Action Details' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon :icon="closeIcon"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form @submit.prevent="saveAction" v-if="modalMode === 'create'">
            <ion-item>
              <ion-label position="stacked">Action Type *</ion-label>
              <ion-select v-model="actionForm.action_type" placeholder="Select action type" required>
                <ion-select-option value="user_suspend">User Suspend</ion-select-option>
                <ion-select-option value="user_reactivate">User Reactivate</ion-select-option>
                <ion-select-option value="content_flag">Content Flag</ion-select-option>
                <ion-select-option value="content_unflag">Content Unflag</ion-select-option>
                <ion-select-option value="withdrawal_process">Withdrawal Process</ion-select-option>
                <ion-select-option value="content_delete">Content Delete</ion-select-option>
              </ion-select>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Target User ID</ion-label>
              <ion-input v-model="actionForm.target_user_id" placeholder="User ID (optional)"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Target Playlist ID</ion-label>
              <ion-input v-model="actionForm.target_playlist_id" placeholder="Playlist ID (optional)"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Target Song ID</ion-label>
              <ion-input v-model="actionForm.target_song_id" placeholder="Song ID (optional)"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Reason</ion-label>
              <ion-textarea v-model="actionForm.reason" placeholder="Reason for this action" :rows="3"></ion-textarea>
            </ion-item>

            <div class="form-actions">
              <ion-button type="submit" color="primary" :disabled="saving">
                <ion-spinner v-if="saving" slot="start"></ion-spinner>
                Log Action
              </ion-button>
              <ion-button fill="outline" @click="closeModal">Cancel</ion-button>
            </div>
          </form>

          <!-- View mode -->
          <div v-else class="action-details">
            <ion-item>
              <ion-label>
                <h3>Action ID</h3>
                <p>{{ selectedAction?.action_id }}</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Action Type</h3>
                <ion-badge :color="getActionTypeColor(selectedAction?.action_type)">
                  {{ formatActionType(selectedAction?.action_type) }}
                </ion-badge>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Admin User</h3>
                <p>{{ selectedAction?.admin?.username || 'Unknown' }} ({{ selectedAction?.admin_user_id }})</p>
              </ion-label>
            </ion-item>
            
            <ion-item v-if="selectedAction?.target_user_id">
              <ion-label>
                <h3>Target User</h3>
                <p>{{ selectedAction?.target_user?.username || 'Unknown' }} ({{ selectedAction?.target_user_id }})</p>
              </ion-label>
            </ion-item>
            
            <ion-item v-if="selectedAction?.target_playlist_id">
              <ion-label>
                <h3>Target Playlist</h3>
                <p>{{ selectedAction?.target_playlist?.name || 'Unknown' }} ({{ selectedAction?.target_playlist_id }})</p>
              </ion-label>
            </ion-item>
            
            <ion-item v-if="selectedAction?.target_song_id">
              <ion-label>
                <h3>Target Song</h3>
                <p>{{ selectedAction?.target_song?.title || 'Unknown' }} ({{ selectedAction?.target_song_id }})</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Reason</h3>
                <p>{{ selectedAction?.reason || 'No reason provided' }}</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Date</h3>
                <p>{{ formatDate(selectedAction?.action_timestamp || '') }}</p>
              </ion-label>
            </ion-item>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSearchbar,
  IonBadge,
  IonModal,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption
} from '@ionic/vue';
import {
  add,
  eye,
  close,
  alertCircle,
  chevronUp,
  chevronDown,
  remove
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';
import { AdminAction } from '@/types';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
  name: 'AdminActions',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSearchbar,
    IonBadge,
    IonModal,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    AdminSidePanel
  },
  setup() {
    const authStore = useAuthStore();
    const actions = ref<AdminAction[]>([]);
    const loading = ref(true);
    const error = ref('');
    const searchTerm = ref('');
    const actionTypeFilter = ref('');
    const sortField = ref('action_timestamp');
    const sortDirection = ref<'asc' | 'desc'>('desc');
    const currentPage = ref(1);
    const itemsPerPage = 10;

    // Modal state
    const modalOpen = ref(false);
    const modalMode = ref<'view' | 'create'>('view');
    const selectedAction = ref<AdminAction | null>(null);
    const saving = ref(false);

    // Form state
    const actionForm = ref({
      action_type: '',
      target_user_id: '',
      target_playlist_id: '',
      target_song_id: '',
      reason: ''
    });    const filteredActions = computed(() => {
      // Ensure actions.value is an array before processing
      if (!Array.isArray(actions.value)) {
        return [];
      }
      
      let result = [...actions.value];      // Apply search filter
      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase();
        result = result.filter(action =>
          action.action_type.toLowerCase().includes(search) ||
          action.admin?.username?.toLowerCase().includes(search) ||
          action.target_user?.username?.toLowerCase().includes(search) ||
          action.target_playlist?.name?.toLowerCase().includes(search) ||
          action.target_song?.title?.toLowerCase().includes(search) ||
          action.reason?.toLowerCase().includes(search)
        );
      }

      // Apply action type filter
      if (actionTypeFilter.value) {
        result = result.filter(action => action.action_type === actionTypeFilter.value);
      }      // Apply sorting
      result.sort((a, b) => {
        const aVal = a[sortField.value as keyof AdminAction] ?? '';
        const bVal = b[sortField.value as keyof AdminAction] ?? '';
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
        
        return sortDirection.value === 'desc' ? -comparison : comparison;
      });

      return result;
    });

    const paginatedActions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredActions.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredActions.value.length / itemsPerPage);
    });

    const loadActions = async () => {
      try {
        loading.value = true;
        error.value = '';
        const response = await AdminService.getAdminActions();
        actions.value = response.data || [];
      } catch (err: any) {
        error.value = err.message || 'Failed to load admin actions';
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      currentPage.value = 1; // Reset to first page when searching/filtering
    };

    const sort = (field: string) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    const getSortIcon = (field: string) => {
      if (sortField.value !== field) return remove;
      return sortDirection.value === 'asc' ? chevronUp : chevronDown;
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

    const viewAction = (action: AdminAction) => {
      selectedAction.value = action;
      modalMode.value = 'view';
      modalOpen.value = true;
    };

    const openCreateModal = () => {
      selectedAction.value = null;
      modalMode.value = 'create';
      actionForm.value = {
        action_type: '',
        target_user_id: '',
        target_playlist_id: '',
        target_song_id: '',
        reason: ''
      };
      modalOpen.value = true;
    };

    const closeModal = () => {
      modalOpen.value = false;
      selectedAction.value = null;
      actionForm.value = {
        action_type: '',
        target_user_id: '',
        target_playlist_id: '',
        target_song_id: '',
        reason: ''
      };
    };

    const saveAction = async () => {
      try {
        saving.value = true;
        
        const actionData = {
          admin_user_id: authStore.user?.user_id || '',
          action_type: actionForm.value.action_type,
          target_user_id: actionForm.value.target_user_id || undefined,
          target_playlist_id: actionForm.value.target_playlist_id || undefined,
          target_song_id: actionForm.value.target_song_id || undefined,
          reason: actionForm.value.reason || undefined
        };
        
        await AdminService.createAdminAction(actionData);
        await loadActions();
        closeModal();
      } catch (err: any) {
        error.value = err.message || 'Failed to log action';
      } finally {
        saving.value = false;
      }
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

    onMounted(() => {
      loadActions();
    });

    return {
      actions,
      loading,
      error,
      searchTerm,
      actionTypeFilter,
      currentPage,
      itemsPerPage,
      filteredActions,
      paginatedActions,
      totalPages,
      modalOpen,
      modalMode,
      selectedAction,
      actionForm,
      saving,
      loadActions,
      handleSearch,
      sort,
      getSortIcon,
      getActionTypeColor,
      formatActionType,
      viewAction,
      openCreateModal,
      closeModal,
      saveAction,
      formatDate,
      // Icons
      addIcon: add,
      eyeIcon: eye,
      closeIcon: close,
      alertCircleIcon: alertCircle
    };
  }
});
</script>

<style scoped>
.admin-content {
  display: flex;
  height: 100%;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.filters-section {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.filter-row ion-select {
  min-width: 200px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--ion-color-light);
}

.data-table th {
  background-color: var(--ion-color-light);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.data-table th.sortable:hover {
  background-color: var(--ion-color-medium);
}

.sort-icon {
  margin-left: 4px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.target-info {
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--ion-color-light);
  margin-top: 16px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-indicator {
  font-size: 14px;
  color: var(--ion-color-medium);
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

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-details {
  max-width: 500px;
}

@media (max-width: 768px) {
  .admin-content {
    flex-direction: column;
  }

  .main-content {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-row ion-select {
    min-width: auto;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .data-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>
