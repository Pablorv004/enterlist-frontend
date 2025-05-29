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
            v-model="globalFilter"
            placeholder="Search actions..."
            @ionInput="updateGlobalFilter"
            show-clear-button="focus"
          />
          <ion-select
            v-model="actionTypeFilter"
            placeholder="Filter by action type"
            @ionChange="updateActionTypeFilter"
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
              <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <th 
                  v-for="header in headerGroup.headers" 
                  :key="header.id"
                  @click="header.column.getToggleSortingHandler()?.($event)"
                  :class="{ 'sortable': header.column.getCanSort() }"
                >
                  <div class="header-content">
                    <span>{{ header.isPlaceholder ? '' : header.column.columnDef.header }}</span>
                    <ion-icon 
                      v-if="header.column.getIsSorted()"
                      :icon="header.column.getIsSorted() === 'desc' ? arrowDown : arrowUp"
                      class="sort-icon"
                    />
                  </div>
                </th>
              </tr>
            </thead>            <tbody>
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

        <div class="loading-container" v-if="loading">
          <ion-spinner />
          <p>Loading actions...</p>
        </div>

        <div class="error-container" v-if="error && !loading">
          <ion-icon :icon="alertCircle" />
          <p>{{ error }}</p>
        </div>

        <!-- Pagination -->
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
import {
  useVueTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper
} from '@tanstack/vue-table';

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
const globalFilter = ref('');
const actionTypeFilter = ref('');

// Modal state
const isModalOpen = ref(false);
const selectedAction = ref<AdminAction | null>(null);

// Column helper
const columnHelper = createColumnHelper<AdminAction>();

// Define columns
const columns = [
  columnHelper.accessor('action_id', {
    header: 'ID',
    cell: info => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('action_type', {
    header: 'Action Type',
    cell: info => h('span', {
      class: `type-badge ${getActionTypeColor(info.getValue())}`
    }, formatActionType(info.getValue())),
    enableSorting: true,
  }),
  columnHelper.accessor('admin.username', {
    header: 'Admin',
    cell: info => info.getValue() || 'Unknown',
    enableSorting: true,
  }),
  columnHelper.display({
    header: 'Target',
    cell: info => {
      const action = info.row.original;
      if (action.target_user_id) {
        return h('div', { class: 'target-info' }, [
          h('span', `User: ${action.target_user?.username || action.target_user_id}`)
        ]);
      } else if (action.target_playlist_id) {
        return h('div', { class: 'target-info' }, [
          h('span', `Playlist: ${action.target_playlist?.name || action.target_playlist_id}`)
        ]);
      } else if (action.target_song_id) {
        return h('div', { class: 'target-info' }, [
          h('span', `Song: ${action.target_song?.title || action.target_song_id}`)
        ]);
      } else {
        return h('span', 'No target');
      }
    },
  }),
  columnHelper.accessor('reason', {
    header: 'Reason',
    cell: info => info.getValue() || 'No reason provided',
    enableSorting: false,
  }),
  columnHelper.accessor('action_timestamp', {
    header: 'Date',
    cell: info => formatDate(info.getValue()),
    enableSorting: true,
  }),
  columnHelper.display({
    header: 'Actions',
    cell: info => h('div', { class: 'action-buttons' }, [
      h(IonButton, {
        fill: 'clear',
        size: 'small',
        title: 'View Action',
        onClick: () => viewAction(info.row.original)
      }, () => h(IonIcon, { icon: eye }))
    ]),
  }),
];

// Custom filter function for action type
const actionTypeFilterFn = (row: any, columnId: string, filterValue: string) => {
  if (!filterValue) return true;
  return row.original.action_type === filterValue;
};

// Create table
const table = useVueTable({
  get data() { return actions.value; },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get globalFilter() { return globalFilter.value; },
    get columnFilters() { 
      return actionTypeFilter.value 
        ? [{ id: 'action_type', value: actionTypeFilter.value }]
        : [];
    },
  },
  onGlobalFilterChange: (value) => {
    globalFilter.value = value;
  },
  globalFilterFn: 'includesString',
  filterFns: {
    actionType: actionTypeFilterFn,
  },
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
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

const updateGlobalFilter = () => {
  // Filter is automatically updated via the reactive getter
};

const updateActionTypeFilter = () => {
  // Filter is automatically updated via the reactive getter
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

.admin-table th.sortable:hover {
  background-color: var(--ion-color-medium-tint);
}

.admin-table tr:hover {
  background-color: var(--ion-color-light-tint);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sort-icon {
  font-size: 14px;
  opacity: 0.7;
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
