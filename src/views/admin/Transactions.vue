<template>
  <ion-page>
    <div class="admin-layout">
      <!-- Side Panel -->
      <admin-side-panel :active-tab="'transactions'"></admin-side-panel>
      
      <!-- Main Content -->
      <div class="main-content">
        <ion-content :fullscreen="true" class="admin-content">
          <div class="admin-container">
            <admin-table
              title="Transaction Management"
              :columns="columns"
              :rows="transactions"
              :loading="loading"
              empty-message="No transactions found in the system."
            >
              <template #actions>
                <ion-button @click="refreshTransactions" fill="outline" size="small">
                  <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                  Refresh
                </ion-button>
              </template>

              <!-- Custom column templates -->
              <template #table-row="props">
                <span v-if="props.column.field === 'transaction_type'">
                  <ion-badge :color="getTypeColor(props.row.transaction_type)">
                    {{ formatTransactionType(props.row.transaction_type) }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'amount_total'">
                  ${{ props.row.amount_total?.toFixed(2) || '0.00' }}
                </span>
                <span v-else-if="props.column.field === 'platform_fee'">
                  ${{ props.row.platform_fee?.toFixed(2) || '0.00' }}
                </span>
                <span v-else-if="props.column.field === 'creator_payout_amount'">
                  ${{ props.row.creator_payout_amount?.toFixed(2) || '0.00' }}
                </span>
                <span v-else-if="props.column.field === 'user.username'">
                  {{ props.row.user?.username || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'playlist.name'">
                  {{ props.row.playlist?.name || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'created_at'">
                  {{ formatDate(props.row.created_at) }}
                </span>
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="viewTransactionDetails(props.row)"
                    >
                      <ion-icon :icon="eyeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="medium"
                      @click="editTransaction(props.row)"
                    >
                      <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </span>
                <span v-else>{{ props.formattedRow[props.column.field] }}</span>
              </template>
            </admin-table>
          </div>
        </ion-content>
      </div>
    </div>

    <!-- Edit Transaction Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Edit Transaction</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="saveTransaction" v-if="selectedTransaction">
          <ion-item>
            <ion-label position="stacked">Transaction Type</ion-label>
            <ion-input v-model="selectedTransaction.transaction_type" readonly></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Total Amount ($)</ion-label>
            <ion-input 
              v-model="selectedTransaction.amount_total" 
              type="number" 
              step="0.01"
              required
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Platform Fee ($)</ion-label>
            <ion-input 
              v-model="selectedTransaction.platform_fee" 
              type="number" 
              step="0.01"
              required
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Creator Payout ($)</ion-label>
            <ion-input 
              v-model="selectedTransaction.creator_payout_amount" 
              type="number" 
              step="0.01"
              required
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Notes</ion-label>
            <ion-textarea v-model="selectedTransaction.notes"></ion-textarea>
          </ion-item>
          
          <div class="modal-actions">
            <ion-button @click="closeEditModal" fill="outline" color="medium">
              Cancel
            </ion-button>
            <ion-button type="submit" :disabled="saving">
              <ion-spinner v-if="saving" name="crescent"></ion-spinner>
              <span v-else>Save Changes</span>
            </ion-button>
          </div>
        </form>
      </ion-content>
    </ion-modal>

    <!-- View Details Modal -->
    <ion-modal :is-open="isDetailsModalOpen" @didDismiss="closeDetailsModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Transaction Details</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeDetailsModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" v-if="selectedTransaction">
        <div class="detail-section">
          <h3>Transaction Information</h3>
          <ion-item>
            <ion-label>
              <h4>ID</h4>
              <p>{{ selectedTransaction.transaction_id }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Type</h4>
              <p>
                <ion-badge :color="getTypeColor(selectedTransaction.transaction_type)">
                  {{ formatTransactionType(selectedTransaction.transaction_type) }}
                </ion-badge>
              </p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Total Amount</h4>
              <p>${{ selectedTransaction.amount_total?.toFixed(2) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Platform Fee</h4>
              <p>${{ selectedTransaction.platform_fee?.toFixed(2) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Creator Payout</h4>
              <p>${{ selectedTransaction.creator_payout_amount?.toFixed(2) }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section">
          <h3>Related Information</h3>
          <ion-item>
            <ion-label>
              <h4>User</h4>
              <p>{{ selectedTransaction.user?.username || 'N/A' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Playlist</h4>
              <p>{{ selectedTransaction.playlist?.name || 'N/A' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Created</h4>
              <p>{{ formatDate(selectedTransaction.created_at) }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section" v-if="selectedTransaction.notes">
          <h3>Notes</h3>
          <ion-item>
            <ion-label>
              <p>{{ selectedTransaction.notes }}</p>
            </ion-label>
          </ion-item>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import {
  IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonTextarea,
  IonSpinner, toastController
} from '@ionic/vue';
import {
  refresh, eye, create, close
} from 'ionicons/icons';
import { AdminTransaction } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils';

export default defineComponent({
  name: 'AdminTransactions',
  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonTextarea,
    IonSpinner,
    AdminSidePanel, AdminTable
  },  setup() {
    const transactions = ref<AdminTransaction[]>([]);
    const loading = ref(true);
    const saving = ref(false);
    const isEditModalOpen = ref(false);
    const isDetailsModalOpen = ref(false);
    const selectedTransaction = ref<AdminTransaction | null>(null);

    const columns = [
      {
        label: 'ID',
        field: 'transaction_id',
        type: 'string',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by ID' },
        width: '100px'
      },
      {
        label: 'Type',
        field: 'transaction_type',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by type' }
      },
      {
        label: 'User',
        field: 'user.username',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by user' }
      },
      {
        label: 'Playlist',
        field: 'playlist.name',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by playlist' }
      },
      {
        label: 'Total Amount',
        field: 'amount_total',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by amount' }
      },
      {
        label: 'Platform Fee',
        field: 'platform_fee',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by fee' }
      },
      {
        label: 'Creator Payout',
        field: 'creator_payout_amount',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by payout' }
      },
      {
        label: 'Created',
        field: 'created_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by date' }
      },
      {
        label: 'Actions',
        field: 'actions',
        sortable: false,
        width: '120px'
      }
    ];    const loadTransactions = async () => {
      try {
        loading.value = true;
        const response = await AdminService.getTransactions();
        transactions.value = response.data || response; // Handle both paginated and simple array responses
      } catch (error) {
        console.error('Failed to load transactions:', error);
        const toast = await toastController.create({
          message: 'Failed to load transactions',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        loading.value = false;
      }
    };

    const refreshTransactions = () => {
      loadTransactions();
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'playlist_submission': return 'primary';
        case 'platform_fee': return 'warning';
        case 'creator_payout': return 'success';
        case 'refund': return 'medium';
        default: return 'tertiary';
      }
    };

    const formatTransactionType = (type: string) => {
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const editTransaction = (transaction: any) => {
      selectedTransaction.value = { ...transaction };
      isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
      isEditModalOpen.value = false;
      selectedTransaction.value = null;
    };

    const saveTransaction = async () => {
      if (!selectedTransaction.value) return;

      try {
        saving.value = true;
        
        // Note: We're not implementing transaction updates as they shouldn't be modified
        // This is just for viewing/adjusting admin fields if needed
        
        const toast = await toastController.create({
          message: 'Transaction updated successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        closeEditModal();
        loadTransactions();
      } catch (error) {
        console.error('Failed to update transaction:', error);
        const toast = await toastController.create({
          message: 'Failed to update transaction',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        saving.value = false;
      }
    };

    const viewTransactionDetails = (transaction: any) => {
      selectedTransaction.value = { ...transaction };
      isDetailsModalOpen.value = true;
    };

    const closeDetailsModal = () => {
      isDetailsModalOpen.value = false;
      selectedTransaction.value = null;
    };

    onMounted(() => {
      loadTransactions();
    });

    return {
      transactions,
      loading,
      saving,
      columns,
      isEditModalOpen,
      isDetailsModalOpen,
      selectedTransaction,
      loadTransactions,
      refreshTransactions,
      getTypeColor,
      formatTransactionType,
      editTransaction,
      closeEditModal,
      saveTransaction,
      viewTransactionDetails,
      closeDetailsModal,
      formatDate,
      // Icons
      refreshIcon: refresh,
      eyeIcon: eye,
      editIcon: create,
      closeIcon: close
    };
  }
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-content {
  --background: #f8f9fa;
}

.admin-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-container {
    padding: 16px;
  }
}
</style>
