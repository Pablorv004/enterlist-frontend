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
              </template>              <!-- Custom column templates -->
              <template #table-row="props">
                <span v-if="props.column.field === 'status'">
                  <ion-badge :color="getStatusColor(props.row.status)">
                    {{ formatStatus(props.row.status) }}
                  </ion-badge>
                </span>                <span v-else-if="props.column.field === 'amount'">
                  ${{ Number(props.row.amount_total || 0).toFixed(2) }}
                </span>
                <span v-else-if="props.column.field === 'submission.id'">
                  {{ props.row.submission?.submission_id || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'submission.song_title'">
                  {{ props.row.submission?.song?.title || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'payment_method_id'">
                  {{ props.row.payment_method_id || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'created_at' || props.column.field === 'updated_at'">
                  {{ props.row[props.column.field] ? formatDate(props.row[props.column.field]) : 'N/A' }}
                </span>                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="viewTransaction(props.row)"
                    >
                      <ion-icon :icon="eyeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </span>
                <span v-else>{{ props.formattedRow[props.column.field] }}</span>
              </template>
            </admin-table>
          </div>
        </ion-content>
      </div>
    </div>    <!-- View Transaction Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>View Transaction</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header><ion-content class="ion-padding">
        <form @submit.prevent="saveTransaction" v-if="selectedTransaction">
          <ion-item>
            <ion-label position="stacked">Submission ID</ion-label>
            <ion-input v-model="selectedTransaction.submission_id" readonly></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Payment Method ID</ion-label>
            <ion-input v-model="selectedTransaction.payment_method_id" readonly></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Amount ($)</ion-label>
            <ion-input 
              v-model="selectedTransaction.amount_total" 
              type="number"
              step="0.01"
              readonly
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Currency</ion-label>
            <ion-input v-model="selectedTransaction.currency" readonly></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Status</ion-label>
            <ion-input v-model="selectedTransaction.status" readonly></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Payment Provider Transaction ID</ion-label>
            <ion-input v-model="selectedTransaction.payment_provider_transaction_id" readonly></ion-input>
          </ion-item>
          
          <div class="modal-actions">
            <ion-button @click="closeEditModal" fill="outline" color="medium">
              Close
            </ion-button>
          </div>
        </form>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import {
  IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonTextarea,
  IonSpinner, IonSelect, IonSelectOption, toastController, alertController
} from '@ionic/vue';
import {
  refresh, create, trash, close, eye
} from 'ionicons/icons';
import { AdminTransaction } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils';

export default defineComponent({
  name: 'AdminTransactions',  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonTextarea,
    IonSpinner, IonSelect, IonSelectOption,
    AdminSidePanel, AdminTable
  },  setup() {
    const transactions = ref<AdminTransaction[]>([]);
    const loading = ref(true);
    const saving = ref(false);
    const isEditModalOpen = ref(false);
    const selectedTransaction = ref<AdminTransaction | null>(null);const columns = [
      {
        label: 'ID',
        field: 'transaction_id',
        type: 'string',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by ID' },
        width: '120px'
      },
      {
        label: 'Submission ID',
        field: 'submission.id',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by submission' },
        width: '150px'
      },
      {
        label: 'Song',
        field: 'submission.song_title',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by song' }
      },
      {
        label: 'Amount',
        field: 'amount',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by amount' },
        width: '120px'
      },
      {
        label: 'Currency',
        field: 'currency',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by currency' },
        width: '100px'
      },
      {
        label: 'Status',
        field: 'status',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by status' },
        width: '120px'
      },
      {
        label: 'Payment Method',
        field: 'payment_method_id',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by payment method' },
        width: '150px'
      },
      {
        label: 'Created',
        field: 'created_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by date' },
        width: '120px'
      },
      {
        label: 'Updated',
        field: 'updated_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by date' },
        width: '120px'
      },      {
        label: 'Actions',
        field: 'actions',
        sortable: false,
        width: '80px'
      }
    ];const loadTransactions = async () => {
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
    };    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'primary';
        case 'succeeded': return 'success';
        case 'failed': return 'danger';
        case 'cancelled': return 'medium';
        default: return 'tertiary';
      }
    };

    const formatStatus = (status: string) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };    const viewTransaction = (transaction: any) => {
      selectedTransaction.value = { ...transaction };
      isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
      isEditModalOpen.value = false;
      selectedTransaction.value = null;
    };    const saveTransaction = async () => {
      if (!selectedTransaction.value) return;

      try {
        saving.value = true;
        
        // Note: Transaction updates are typically not allowed for financial integrity
        // This modal is for viewing transaction details with read-only fields
        
        const toast = await toastController.create({
          message: 'Transaction details reviewed',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        closeEditModal();
      } catch (error) {
        console.error('Failed to process request:', error);
        const toast = await toastController.create({
          message: 'Failed to process request',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        saving.value = false;
      }
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
      selectedTransaction,
      loadTransactions,      refreshTransactions,
      getStatusColor,
      formatStatus,
      viewTransaction,
      closeEditModal,
      saveTransaction,
      formatDate,
      // Icons
      refreshIcon: refresh,
      eyeIcon: eye,
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
