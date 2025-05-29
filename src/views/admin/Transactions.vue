<template>
  <div class="admin-transactions">
    <AdminSidePanel />
    <div class="admin-content">
      <div class="admin-header">
        <h1>Transaction Management</h1>
        <p>View all transactions in the system</p>
      </div>

      <div class="admin-table-container">
        <div class="table-controls">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search transactions..."
            @ionInput="handleSearch"
            show-clear-button="focus"
          />
          <ion-select
            v-model="typeFilter"
            placeholder="Filter by type"
            @ionChange="handleTypeFilter"
          >
            <ion-select-option value="">All Types</ion-select-option>
            <ion-select-option value="payment">Payment</ion-select-option>
            <ion-select-option value="withdrawal">Withdrawal</ion-select-option>
            <ion-select-option value="refund">Refund</ion-select-option>
          </ion-select>
          <ion-select
            v-model="statusFilter"
            placeholder="Filter by status"
            @ionChange="handleStatusFilter"
          >
            <ion-select-option value="">All Status</ion-select-option>
            <ion-select-option value="pending">Pending</ion-select-option>
            <ion-select-option value="completed">Completed</ion-select-option>
            <ion-select-option value="failed">Failed</ion-select-option>
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
                <th @click="handleSort('type')">
                  Type
                  <ion-icon :icon="getArrowIcon('type')" v-if="sortColumn === 'type'" />
                </th>
                <th @click="handleSort('amount')">
                  Amount
                  <ion-icon :icon="getArrowIcon('amount')" v-if="sortColumn === 'amount'" />
                </th>
                <th @click="handleSort('status')">
                  Status
                  <ion-icon :icon="getArrowIcon('status')" v-if="sortColumn === 'status'" />
                </th>
                <th>Payment Method</th>
                <th @click="handleSort('createdAt')">
                  Date
                  <ion-icon :icon="getArrowIcon('createdAt')" v-if="sortColumn === 'createdAt'" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
                <td>{{ transaction.id }}</td>
                <td>
                  <div class="user-info">
                    <div class="user-name">{{ transaction.user?.firstName }} {{ transaction.user?.lastName }}</div>
                    <div class="user-email">{{ transaction.user?.email }}</div>
                  </div>
                </td>
                <td>
                  <span class="type-badge" :class="transaction.type">
                    {{ formatType(transaction.type) }}
                  </span>
                </td>
                <td class="amount-cell">
                  <span class="amount" :class="{ negative: transaction.type === 'withdrawal' }">
                    {{ transaction.type === 'withdrawal' ? '-' : '+' }}${{ formatAmount(transaction.amount) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="transaction.status">
                    {{ formatStatus(transaction.status) }}
                  </span>
                </td>
                <td>
                  <span class="method-badge" v-if="transaction.paymentMethod">
                    {{ formatPaymentMethod(transaction.paymentMethod) }}
                  </span>
                  <span v-else class="no-method">-</span>
                </td>
                <td>{{ formatDate(transaction.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="viewTransaction(transaction)"
                      title="View Transaction"
                    >
                      <ion-icon :icon="eye" />
                    </ion-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="loading" class="loading-container">
          <ion-spinner name="circular" />
          <p>Loading transactions...</p>
        </div>

        <div v-if="error" class="error-container">
          <ion-icon :icon="alertCircle" color="danger" />
          <p>{{ error }}</p>
          <ion-button @click="loadTransactions" fill="outline">Retry</ion-button>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && filteredTransactions.length > 0">
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
            ({{ filteredTransactions.length }} total transactions)
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

    <!-- Transaction Detail Modal -->
    <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Transaction Details</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-if="selectedTransaction">
          <div class="transaction-detail-section">
            <h3>Transaction Information</h3>
            <ion-item>
              <ion-label>
                <h4>Transaction ID</h4>
                <p>{{ selectedTransaction.id }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Type</h4>
                <p>
                  <span class="type-badge" :class="selectedTransaction.type">
                    {{ formatType(selectedTransaction.type) }}
                  </span>
                </p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Amount</h4>
                <p class="amount-display">
                  <span class="amount" :class="{ negative: selectedTransaction.type === 'withdrawal' }">
                    {{ selectedTransaction.type === 'withdrawal' ? '-' : '+' }}${{ formatAmount(selectedTransaction.amount) }}
                  </span>
                </p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Status</h4>
                <p>
                  <span class="status-badge" :class="selectedTransaction.status">
                    {{ formatStatus(selectedTransaction.status) }}
                  </span>
                </p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Date</h4>
                <p>{{ formatDateTime(selectedTransaction.createdAt) }}</p>
              </ion-label>
            </ion-item>
            <ion-item v-if="selectedTransaction.description">
              <ion-label>
                <h4>Description</h4>
                <p>{{ selectedTransaction.description }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="transaction-detail-section">
            <h3>User Information</h3>
            <ion-item>
              <ion-label>
                <h4>Name</h4>
                <p>{{ selectedTransaction.user?.firstName }} {{ selectedTransaction.user?.lastName }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h4>Email</h4>
                <p>{{ selectedTransaction.user?.email }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="transaction-detail-section" v-if="selectedTransaction.paymentMethod">
            <h3>Payment Method</h3>
            <ion-item>
              <ion-label>
                <h4>Method</h4>
                <p>{{ formatPaymentMethod(selectedTransaction.paymentMethod) }}</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="transaction-detail-section" v-if="selectedTransaction.externalId">
            <h3>External Information</h3>
            <ion-item>
              <ion-label>
                <h4>External ID</h4>
                <p>{{ selectedTransaction.externalId }}</p>
              </ion-label>
            </ion-item>
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
  IonLabel
} from '@ionic/vue';
import {
  eye,
  chevronBack,
  chevronForward,
  arrowUp,
  arrowDown,
  alertCircle
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  description?: string;
  externalId?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Reactive data
const transactions = ref<Transaction[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortColumn = ref('id');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Modal state
const isModalOpen = ref(false);
const selectedTransaction = ref<Transaction | null>(null);

// Computed properties
const filteredTransactions = computed(() => {
  let filtered = transactions.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(transaction =>
      transaction.user?.firstName?.toLowerCase().includes(query) ||
      transaction.user?.lastName?.toLowerCase().includes(query) ||
      transaction.user?.email?.toLowerCase().includes(query) ||
      transaction.id.toString().includes(query) ||
      transaction.description?.toLowerCase().includes(query)
    );
  }

  // Apply type filter
  if (typeFilter.value) {
    filtered = filtered.filter(transaction => transaction.type === typeFilter.value);
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(transaction => transaction.status === statusFilter.value);
  }
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortColumn.value as keyof Transaction] ?? '';
    const bVal = b[sortColumn.value as keyof Transaction] ?? '';
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection.value === 'desc' ? -comparison : comparison;
  });

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage));

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransactions.value.slice(start, end);
});

// Methods
const loadTransactions = async () => {
  try {
    loading.value = true;
    error.value = '';
    transactions.value = await AdminService.getTransactions();
  } catch (err) {
    error.value = 'Failed to load transactions';
    console.error('Error loading transactions:', err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleTypeFilter = () => {
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

const viewTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedTransaction.value = null;
};

const formatType = (type: string) => {
  const types: Record<string, string> = {
    payment: 'Payment',
    withdrawal: 'Withdrawal',
    refund: 'Refund'
  };
  return types[type] || type;
};

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed'
  };
  return statuses[status] || status;
};

const formatPaymentMethod = (method: string) => {
  const methods: Record<string, string> = {
    paypal: 'PayPal',
    stripe: 'Stripe',
    bank_transfer: 'Bank Transfer'
  };
  return methods[method] || method;
};

const formatAmount = (amount: number) => {
  return amount.toFixed(2);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

// Lifecycle
onMounted(() => {
  loadTransactions();
});
</script>

<style scoped>
.admin-transactions {
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
  color: var(--ion-color-success);
}

.amount.negative {
  color: var(--ion-color-danger);
}

.amount-display .amount {
  font-size: 1.2em;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.type-badge.payment {
  background-color: var(--ion-color-success-tint);
  color: var(--ion-color-success);
}

.type-badge.withdrawal {
  background-color: var(--ion-color-warning-tint);
  color: var(--ion-color-warning);
}

.type-badge.refund {
  background-color: var(--ion-color-secondary-tint);
  color: var(--ion-color-secondary);
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

.status-badge.completed {
  background-color: var(--ion-color-success-tint);
  color: var(--ion-color-success);
}

.status-badge.failed {
  background-color: var(--ion-color-danger-tint);
  color: var(--ion-color-danger);
}

.method-badge {
  padding: 4px 8px;
  border-radius: 12px;
  background-color: var(--ion-color-light);
  color: var(--ion-color-dark);
  font-size: 0.8em;
  font-weight: 500;
}

.no-method {
  color: var(--ion-color-medium);
  font-style: italic;
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

.transaction-detail-section {
  margin-bottom: 24px;
}

.transaction-detail-section h3 {
  margin: 0 0 16px 0;
  color: var(--ion-color-primary);
}
</style>
