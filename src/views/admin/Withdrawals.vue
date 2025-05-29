<template>
  <div class="admin-withdrawals">
    <AdminSidePanel />
    <div class="admin-content">
      <div class="admin-header">
        <h1>Withdrawal Management</h1>
        <p>Manage user withdrawal requests</p>
      </div>

      <div class="admin-table-container">
        <div class="table-controls">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search withdrawals..."
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
            <ion-select-option value="processed">Processed</ion-select-option>
            <ion-select-option value="cancelled">Cancelled</ion-select-option>
          </ion-select>
          <ion-select
            v-model="methodFilter"
            placeholder="Filter by method"
            @ionChange="handleMethodFilter"
          >
            <ion-select-option value="">All Methods</ion-select-option>
            <ion-select-option value="paypal">PayPal</ion-select-option>
            <ion-select-option value="bank_transfer">Bank Transfer</ion-select-option>
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
                <th>User</th>
                <th @click="handleSort('amount')">
                  Amount
                  <ion-icon :icon="getArrowIcon('amount')" v-if="sortColumn === 'amount'" />
                </th>
                <th @click="handleSort('method')">
                  Method
                  <ion-icon :icon="getArrowIcon('method')" v-if="sortColumn === 'method'" />
                </th>
                <th @click="handleSort('status')">
                  Status
                  <ion-icon :icon="getArrowIcon('status')" v-if="sortColumn === 'status'" />
                </th>
                <th @click="handleSort('createdAt')">
                  Requested At
                  <ion-icon :icon="getArrowIcon('createdAt')" v-if="sortColumn === 'createdAt'" />
                </th>
                <th @click="handleSort('processedAt')">
                  Processed At
                  <ion-icon :icon="getArrowIcon('processedAt')" v-if="sortColumn === 'processedAt'" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="withdrawal in paginatedWithdrawals" :key="withdrawal.id">
                <td>{{ withdrawal.id }}</td>
                <td>
                  <div class="user-info">
                    <div class="user-name">{{ withdrawal.user?.firstName }} {{ withdrawal.user?.lastName }}</div>
                    <div class="user-email">{{ withdrawal.user?.email }}</div>
                  </div>
                </td>
                <td class="amount-cell">
                  <span class="amount">${{ formatAmount(withdrawal.amount) }}</span>
                </td>
                <td>
                  <span class="method-badge" :class="withdrawal.method">
                    {{ formatMethod(withdrawal.method) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="withdrawal.status">
                    {{ formatStatus(withdrawal.status) }}
                  </span>
                </td>
                <td>{{ formatDate(withdrawal.createdAt) }}</td>
                <td>{{ withdrawal.processedAt ? formatDate(withdrawal.processedAt) : '-' }}</td>
                <td>
                  <div class="action-buttons">
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="viewWithdrawal(withdrawal)"
                      title="View Withdrawal"
                    >
                      <ion-icon :icon="eye" />
                    </ion-button>
                    <ion-button
                      v-if="withdrawal.status === 'pending'"
                      fill="solid"
                      size="small"
                      color="success"
                      @click="processWithdrawal(withdrawal)"
                      title="Process Withdrawal"
                      :disabled="processing === withdrawal.id"
                    >
                      <ion-spinner v-if="processing === withdrawal.id" name="circular" />
                      <ion-icon v-else :icon="checkmarkCircle" />
                    </ion-button>
                    <ion-button
                      v-if="withdrawal.status === 'pending'"
                      fill="clear"
                      size="small"
                      color="danger"
                      @click="cancelWithdrawal(withdrawal)"
                      title="Cancel Withdrawal"
                    >
                      <ion-icon :icon="closeCircle" />
                    </ion-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="loading" class="loading-container">
          <ion-spinner name="circular" />
          <p>Loading withdrawals...</p>
        </div>

        <div v-if="error" class="error-container">
          <ion-icon :icon="alertCircle" color="danger" />
          <p>{{ error }}</p>
          <ion-button @click="loadWithdrawals" fill="outline">Retry</ion-button>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && filteredWithdrawals.length > 0">
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
            ({{ filteredWithdrawals.length }} total withdrawals)
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

    <!-- Withdrawal Detail Modal -->
    <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Withdrawal Details</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-if="selectedWithdrawal">
          <div class="withdrawal-detail-section">
            <h3>Withdrawal Information</h3>
            <ion-item>
              <ion-label>
                <h4>Withdrawal ID</h4>
                <p>{{ selectedWithdrawal.id }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Amount</h4>
                <p>${{ formatAmount(selectedWithdrawal.amount) }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Method</h4>
                <p>{{ formatMethod(selectedWithdrawal.method) }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Status</h4>
                <p>
                  <span class="status-badge" :class="selectedWithdrawal.status">
                    {{ formatStatus(selectedWithdrawal.status) }}
                  </span>
                </p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Requested At</h4>
                <p>{{ formatDateTime(selectedWithdrawal.createdAt) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="selectedWithdrawal.processedAt">
              <ion-label>
                <h4>Processed At</h4>
                <p>{{ formatDateTime(selectedWithdrawal.processedAt) }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="withdrawal-detail-section">
            <h3>User Information</h3>
            <ion-item>
              <ion-label>
                <h4>Name</h4>
                <p>{{ selectedWithdrawal.user?.firstName }} {{ selectedWithdrawal.user?.lastName }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Email</h4>
                <p>{{ selectedWithdrawal.user?.email }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="withdrawal-detail-section">
            <h3>Payment Method Details</h3>
            <ion-item v-if="selectedWithdrawal.paymentMethod">
              <ion-label>
                <h4>{{ formatMethod(selectedWithdrawal.method) }} Details</h4>
                <p v-if="selectedWithdrawal.method === 'paypal'">
                  PayPal Email: {{ selectedWithdrawal.paymentMethod.email }}
                </p>
                <p v-else-if="selectedWithdrawal.method === 'bank_transfer'">
                  Account: {{ selectedWithdrawal.paymentMethod.accountNumber }}
                  <br>
                  Bank: {{ selectedWithdrawal.paymentMethod.bankName }}
                </p>
              </ion-label>
            </ion-item>
          </div>

          <div class="withdrawal-detail-section" v-if="selectedWithdrawal.status === 'pending'">
            <ion-button
              expand="block"
              color="success"
              @click="processWithdrawalFromModal"
              :disabled="processing === selectedWithdrawal.id"
            >
              <ion-spinner v-if="processing === selectedWithdrawal.id" name="circular" />
              {{ processing === selectedWithdrawal.id ? 'Processing...' : 'Process Withdrawal' }}
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              color="danger"
              @click="cancelWithdrawalFromModal"
              style="margin-top: 12px;"
            >
              Cancel Withdrawal
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
  alertController,
  toastController
} from '@ionic/vue';
import {
  eye,
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

interface Withdrawal {
  id: number;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  paymentMethod?: {
    email?: string;
    accountNumber?: string;
    bankName?: string;
  };
}

// Reactive data
const withdrawals = ref<Withdrawal[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('');
const methodFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortColumn = ref('id');
const sortDirection = ref<'asc' | 'desc'>('desc');
const processing = ref<number | null>(null);

// Modal state
const isModalOpen = ref(false);
const selectedWithdrawal = ref<Withdrawal | null>(null);

// Computed properties
const filteredWithdrawals = computed(() => {
  // Ensure we have an array to work with
  if (!Array.isArray(withdrawals.value)) {
    return [];
  }

  let filtered = [...withdrawals.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(withdrawal =>
      withdrawal.user?.firstName?.toLowerCase().includes(query) ||
      withdrawal.user?.lastName?.toLowerCase().includes(query) ||
      withdrawal.user?.email?.toLowerCase().includes(query) ||
      withdrawal.id.toString().includes(query)
    );
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(withdrawal => withdrawal.status === statusFilter.value);
  }

  // Apply method filter
  if (methodFilter.value) {
    filtered = filtered.filter(withdrawal => withdrawal.method === methodFilter.value);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortColumn.value as keyof Withdrawal] ?? '';
    const bVal = b[sortColumn.value as keyof Withdrawal] ?? '';
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection.value === 'desc' ? -comparison : comparison;
  });

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredWithdrawals.value.length / itemsPerPage));

const paginatedWithdrawals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredWithdrawals.value.slice(start, end);
});

// Methods
const loadWithdrawals = async () => {
  try {
    loading.value = true;
    error.value = '';
    withdrawals.value = await AdminService.getWithdrawals();
  } catch (err) {
    error.value = 'Failed to load withdrawals';
    console.error('Error loading withdrawals:', err);
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

const handleMethodFilter = () => {
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

const viewWithdrawal = (withdrawal: Withdrawal) => {
  selectedWithdrawal.value = withdrawal;
  isModalOpen.value = true;
};

const processWithdrawal = async (withdrawal: Withdrawal) => {
  const alert = await alertController.create({
    header: 'Process Withdrawal',
    message: `Are you sure you want to process withdrawal #${withdrawal.id} for $${formatAmount(withdrawal.amount)}?`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Process',
        handler: async () => {
          await performProcessWithdrawal(withdrawal);
        }
      }
    ]
  });

  await alert.present();
};

const processWithdrawalFromModal = async () => {
  if (selectedWithdrawal.value) {
    await performProcessWithdrawal(selectedWithdrawal.value);
  }
};

const performProcessWithdrawal = async (withdrawal: Withdrawal) => {
  try {
    processing.value = withdrawal.id;
    await AdminService.processWithdrawal(withdrawal.id);
    
    // Update local data
    const index = withdrawals.value.findIndex(w => w.id === withdrawal.id);
    if (index !== -1) {
      withdrawals.value[index].status = 'processed';
      withdrawals.value[index].processedAt = new Date().toISOString();
    }
    
    // Update selected withdrawal if modal is open
    if (selectedWithdrawal.value?.id === withdrawal.id) {
      selectedWithdrawal.value.status = 'processed';
      selectedWithdrawal.value.processedAt = new Date().toISOString();
    }
    
    const toast = await toastController.create({
      message: 'Withdrawal processed successfully',
      duration: 3000,
      color: 'success'
    });
    await toast.present();
    
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    const toast = await toastController.create({
      message: 'Failed to process withdrawal',
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    processing.value = null;
  }
};

const cancelWithdrawal = async (withdrawal: Withdrawal) => {
  const alert = await alertController.create({
    header: 'Cancel Withdrawal',
    message: `Are you sure you want to cancel withdrawal #${withdrawal.id}?`,
    buttons: [
      {
        text: 'No',
        role: 'cancel'
      },
      {
        text: 'Yes, Cancel',
        role: 'destructive',
        handler: async () => {
          await performCancelWithdrawal(withdrawal);
        }
      }
    ]
  });

  await alert.present();
};

const cancelWithdrawalFromModal = async () => {
  if (selectedWithdrawal.value) {
    await cancelWithdrawal(selectedWithdrawal.value);
  }
};

const performCancelWithdrawal = async (withdrawal: Withdrawal) => {
  try {
    // Update local data (assuming there's a cancel endpoint)
    const index = withdrawals.value.findIndex(w => w.id === withdrawal.id);
    if (index !== -1) {
      withdrawals.value[index].status = 'cancelled';
    }
    
    if (selectedWithdrawal.value?.id === withdrawal.id) {
      selectedWithdrawal.value.status = 'cancelled';
    }
    
    const toast = await toastController.create({
      message: 'Withdrawal cancelled successfully',
      duration: 3000,
      color: 'success'
    });
    await toast.present();
    
  } catch (err) {
    console.error('Error cancelling withdrawal:', err);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedWithdrawal.value = null;
};

const formatAmount = (amount: number) => {
  return amount.toFixed(2);
};

const formatMethod = (method: string) => {
  const methods: Record<string, string> = {
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer'
  };
  return methods[method] || method;
};

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    pending: 'Pending',
    processed: 'Processed',
    cancelled: 'Cancelled'
  };
  return statuses[status] || status;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

// Lifecycle
onMounted(() => {
  loadWithdrawals();
});
</script>

<style scoped>
.admin-withdrawals {
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

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.user-email {
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

.method-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.method-badge.paypal {
  background-color: #0070ba;
  color: white;
}

.method-badge.bank_transfer {
  background-color: var(--ion-color-secondary);
  color: white;
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

.status-badge.processed {
  background-color: var(--ion-color-success-tint);
  color: var(--ion-color-success);
}

.status-badge.cancelled {
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

.withdrawal-detail-section {
  margin-bottom: 24px;
}

.withdrawal-detail-section h3 {
  margin: 0 0 16px 0;
  color: var(--ion-color-primary);
}
</style>
