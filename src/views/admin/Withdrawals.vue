<template>
  <ion-page>
    <div class="admin-layout">
      <!-- Side Panel -->
      <admin-side-panel :active-tab="'withdrawals'"></admin-side-panel>
      
      <!-- Main Content -->
      <div class="main-content">
        <ion-content :fullscreen="true" class="admin-content">
          <div class="admin-container">
            <admin-table
              title="Withdrawal Management"
              :columns="columns"
              :rows="withdrawals"
              :loading="loading"
              empty-message="No withdrawals found in the system."
            >
              <template #actions>
                <ion-button @click="refreshWithdrawals" fill="outline" size="small">
                  <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                  Refresh
                </ion-button>
              </template>

              <!-- Custom column templates -->
              <template #table-row="props">
                <span v-if="props.column.field === 'status'">
                  <ion-badge :color="getStatusColor(props.row.status)">
                    {{ formatStatus(props.row.status) }}
                  </ion-badge>
                </span>                <span v-else-if="props.column.field === 'amount'">
                  ${{ Number(props.row.amount || 0).toFixed(2) }}
                </span>                <span v-else-if="props.column.field === 'user.username'">
                  {{ props.row.user?.username || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'paypal_payout_id'">
                  {{ props.row.paypal_payout_id || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'requested_at' || props.column.field === 'created_at' || props.column.field === 'processed_at'">
                  {{ props.row[props.column.field] ? formatDate(props.row[props.column.field]) : 'N/A' }}
                </span>                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="editWithdrawal(props.row)"
                    >
                      <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="danger"
                      @click="confirmDeleteWithdrawal(props.row)"
                    >
                      <ion-icon :icon="trashIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </span>
                <span v-else>{{ props.formattedRow[props.column.field] }}</span>
              </template>
            </admin-table>
          </div>
        </ion-content>
      </div>
    </div>    <!-- View Details Modal -->
    <ion-modal :is-open="isDetailsModalOpen" @didDismiss="closeDetailsModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Withdrawal Details</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeDetailsModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" v-if="selectedWithdrawal">
        <div class="detail-section">
          <h3>User Information</h3>
          <ion-item>
            <ion-label>
              <h4>Username</h4>
              <p>{{ selectedWithdrawal.user?.username }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Email</h4>
              <p>{{ selectedWithdrawal.user?.email }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section">
          <h3>Withdrawal Information</h3>
          <ion-item>
            <ion-label>
              <h4>Amount</h4>
              <p>${{ Number(selectedWithdrawal.amount || 0).toFixed(2) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Status</h4>
              <p>
                <ion-badge :color="getStatusColor(selectedWithdrawal.status)">
                  {{ formatStatus(selectedWithdrawal.status) }}
                </ion-badge>
              </p>
            </ion-label>
          </ion-item>          <ion-item>
            <ion-label>
              <h4>PayPal Payout ID</h4>
              <p>{{ selectedWithdrawal.paypal_payout_id || 'Not specified' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>PayPal Batch ID</h4>
              <p>{{ selectedWithdrawal.paypal_batch_id || 'Not specified' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Currency</h4>
              <p>{{ selectedWithdrawal.currency || 'USD' }}</p>
            </ion-label>
          </ion-item>
        </div>        <div class="detail-section">
          <h3>Timestamps</h3>
          <ion-item>
            <ion-label>
              <h4>Requested</h4>
              <p>{{ formatDate(selectedWithdrawal.requested_at) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Created</h4>
              <p>{{ formatDate(selectedWithdrawal.created_at) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Updated</h4>
              <p>{{ formatDate(selectedWithdrawal.updated_at) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Processed</h4>
              <p>{{ selectedWithdrawal.processed_at ? formatDate(selectedWithdrawal.processed_at) : 'Not processed' }}</p>
            </ion-label>
          </ion-item>
        </div><div class="detail-section" v-if="selectedWithdrawal.error_message">
          <h3>Error Message</h3>
          <ion-item>
            <ion-label>
              <p>{{ selectedWithdrawal.error_message }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section" v-if="selectedWithdrawal.payout_response">
          <h3>Payout Response</h3>
          <ion-item>
            <ion-label>
              <p>{{ selectedWithdrawal.payout_response }}</p>
            </ion-label>
          </ion-item>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Edit Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Edit Withdrawal</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" v-if="editingWithdrawal">
        <form @submit.prevent="saveWithdrawal">
          <ion-item>
            <ion-label position="stacked">Amount</ion-label>
            <ion-input
              v-model="editingWithdrawal.amount"
              type="number"
              step="0.01"
              min="0"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Currency</ion-label>
            <ion-select v-model="editingWithdrawal.currency" interface="popover">
              <ion-select-option value="USD">USD</ion-select-option>
              <ion-select-option value="EUR">EUR</ion-select-option>
              <ion-select-option value="GBP">GBP</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Status</ion-label>
            <ion-select v-model="editingWithdrawal.status" interface="popover">
              <ion-select-option value="pending">Pending</ion-select-option>
              <ion-select-option value="processing">Processing</ion-select-option>
              <ion-select-option value="completed">Completed</ion-select-option>
              <ion-select-option value="failed">Failed</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">PayPal Payout ID</ion-label>
            <ion-input
              v-model="editingWithdrawal.paypal_payout_id"
              type="text"
              placeholder="Enter PayPal payout ID"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">PayPal Batch ID</ion-label>
            <ion-input
              v-model="editingWithdrawal.paypal_batch_id"
              type="text"
              placeholder="Enter PayPal batch ID"
            ></ion-input>
          </ion-item>          <ion-item>
            <ion-label position="stacked">Error Message</ion-label>
            <ion-textarea
              v-model="editingWithdrawal.error_message"
              placeholder="Enter error message if any"
              :rows="3"
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Payout Response</ion-label>
            <ion-textarea
              v-model="editingWithdrawal.payout_response"
              placeholder="Enter payout response data"
              :rows="3"
            ></ion-textarea>
          </ion-item>

          <div class="form-actions">
            <ion-button expand="block" type="submit" :disabled="processing">
              {{ processing ? 'Saving...' : 'Save Changes' }}
            </ion-button>
            <ion-button expand="block" fill="outline" @click="closeEditModal">
              Cancel
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
  IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonSelect, 
  IonSelectOption, IonTextarea, toastController, alertController
} from '@ionic/vue';
import {
  refresh, checkmark, close, eye, create, trash
} from 'ionicons/icons';
import { AdminWithdrawal } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils/date';

export default defineComponent({
  name: 'AdminWithdrawals',  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonTextarea,
    AdminSidePanel, AdminTable
  },  setup() {
    const withdrawals = ref<AdminWithdrawal[]>([]);
    const loading = ref(true);
    const processing = ref(false);
    const isDetailsModalOpen = ref(false);
    const isEditModalOpen = ref(false);
    const selectedWithdrawal = ref<AdminWithdrawal | null>(null);
    const editingWithdrawal = ref<AdminWithdrawal | null>(null);

    const columns = [
      {
        label: 'ID',
        field: 'withdrawal_id',
        type: 'string',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by ID' },
        width: '100px'
      },
      {
        label: 'User',
        field: 'user.username',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by user' }
      },
      {
        label: 'Amount',
        field: 'amount',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by amount' }
      },
      {
        label: 'Status',
        field: 'status',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by status' }
      },      {
        label: 'Currency',
        field: 'currency',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by currency' },
        width: '100px'
      },
      {
        label: 'PayPal Payout ID',
        field: 'paypal_payout_id',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by payout ID' },
        width: '150px'
      },
      {
        label: 'Requested',
        field: 'requested_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by requested date' },
        width: '120px'
      },
      {
        label: 'Processed',
        field: 'processed_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by processed date' }
      },
      {
        label: 'Actions',
        field: 'actions',
        sortable: false,
        width: '150px'
      }
    ];    const loadWithdrawals = async () => {
      try {
        loading.value = true;
        const response = await AdminService.getWithdrawals();
        withdrawals.value = response.data || response; // Handle both paginated and simple array responses
      } catch (error) {
        console.error('Failed to load withdrawals:', error);
        const toast = await toastController.create({
          message: 'Failed to load withdrawals',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        loading.value = false;
      }
    };

    const refreshWithdrawals = () => {
      loadWithdrawals();
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'tertiary';
        case 'completed': return 'success';
        case 'failed': return 'danger';
        default: return 'medium';
      }
    };    const formatStatus = (status: string) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const editWithdrawal = (withdrawal: AdminWithdrawal) => {
      editingWithdrawal.value = { ...withdrawal };
      isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
      isEditModalOpen.value = false;
      editingWithdrawal.value = null;
    };

    const saveWithdrawal = async () => {
      if (!editingWithdrawal.value) return;
      
      try {
        processing.value = true;
        await AdminService.updateWithdrawal(editingWithdrawal.value.withdrawal_id, editingWithdrawal.value);
        
        const toast = await toastController.create({
          message: 'Withdrawal updated successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        closeEditModal();
        loadWithdrawals();
      } catch (error) {
        console.error('Failed to update withdrawal:', error);
        const toast = await toastController.create({
          message: 'Failed to update withdrawal',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        processing.value = false;
      }
    };

    const confirmDeleteWithdrawal = async (withdrawal: AdminWithdrawal) => {
      const alert = await alertController.create({
        header: 'Delete Withdrawal',
        message: `Are you sure you want to delete this withdrawal of $${Number(withdrawal.amount || 0).toFixed(2)} for ${withdrawal.user?.username}?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => deleteWithdrawal(withdrawal)
          }
        ]
      });
      await alert.present();
    };

    const deleteWithdrawal = async (withdrawal: AdminWithdrawal) => {
      try {
        processing.value = true;
        await AdminService.deleteWithdrawal(withdrawal.withdrawal_id);
        
        const toast = await toastController.create({
          message: 'Withdrawal deleted successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        loadWithdrawals();
      } catch (error) {
        console.error('Failed to delete withdrawal:', error);
        const toast = await toastController.create({
          message: 'Failed to delete withdrawal',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        processing.value = false;
      }
    };

    const viewWithdrawalDetails = (withdrawal: any) => {
      selectedWithdrawal.value = { ...withdrawal };
      isDetailsModalOpen.value = true;
    };

    const closeDetailsModal = () => {
      isDetailsModalOpen.value = false;
      selectedWithdrawal.value = null;
    };

    onMounted(() => {
      loadWithdrawals();
    });    return {
      withdrawals,
      loading,
      processing,
      columns,
      isDetailsModalOpen,
      isEditModalOpen,
      selectedWithdrawal,
      editingWithdrawal,
      loadWithdrawals,
      refreshWithdrawals,
      getStatusColor,
      formatStatus,
      editWithdrawal,
      closeEditModal,
      saveWithdrawal,
      confirmDeleteWithdrawal,
      viewWithdrawalDetails,
      closeDetailsModal,
      formatDate,
      // Icons
      refreshIcon: refresh,
      checkmarkIcon: checkmark,
      closeIcon: close,
      eyeIcon: eye,
      editIcon: create,
      trashIcon: trash
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

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
