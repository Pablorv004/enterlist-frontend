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
                </span>
                <span v-else-if="props.column.field === 'amount'">
                  ${{ props.row.amount.toFixed(2) }}
                </span>
                <span v-else-if="props.column.field === 'user.username'">
                  {{ props.row.user?.username || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'created_at'">
                  {{ formatDate(props.row.created_at) }}
                </span>
                <span v-else-if="props.column.field === 'processed_at'">
                  {{ props.row.processed_at ? formatDate(props.row.processed_at) : 'Not processed' }}
                </span>
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      v-if="props.row.status === 'pending'"
                      fill="clear" 
                      size="small" 
                      color="success"
                      @click="processWithdrawal(props.row, 'completed')"
                      :disabled="processing"
                    >
                      <ion-icon :icon="checkmarkIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      v-if="props.row.status === 'pending'"
                      fill="clear" 
                      size="small" 
                      color="danger"
                      @click="processWithdrawal(props.row, 'failed')"
                      :disabled="processing"
                    >
                      <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="viewWithdrawalDetails(props.row)"
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
    </div>

    <!-- View Details Modal -->
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
              <p>${{ selectedWithdrawal.amount?.toFixed(2) }}</p>
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
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Payment Method</h4>
              <p>{{ selectedWithdrawal.payment_method || 'Not specified' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Account Details</h4>
              <p>{{ selectedWithdrawal.account_details || 'Not specified' }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section">
          <h3>Timestamps</h3>
          <ion-item>
            <ion-label>
              <h4>Created</h4>
              <p>{{ formatDate(selectedWithdrawal.created_at) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Processed</h4>
              <p>{{ selectedWithdrawal.processed_at ? formatDate(selectedWithdrawal.processed_at) : 'Not processed' }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section" v-if="selectedWithdrawal.notes">
          <h3>Notes</h3>
          <ion-item>
            <ion-label>
              <p>{{ selectedWithdrawal.notes }}</p>
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
  IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, toastController, alertController
} from '@ionic/vue';
import {
  refresh, checkmark, close, eye
} from 'ionicons/icons';
import { AdminWithdrawal } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils';

export default defineComponent({
  name: 'AdminWithdrawals',
  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel,
    AdminSidePanel, AdminTable
  },  setup() {
    const withdrawals = ref<AdminWithdrawal[]>([]);
    const loading = ref(true);
    const processing = ref(false);
    const isDetailsModalOpen = ref(false);
    const selectedWithdrawal = ref<AdminWithdrawal | null>(null);

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
      },
      {
        label: 'Payment Method',
        field: 'payment_method',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by method' }
      },
      {
        label: 'Created',
        field: 'created_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by date' }
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
    ];

    const loadWithdrawals = async () => {
      try {
        loading.value = true;
        withdrawals.value = await AdminService.getWithdrawals();
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
    };

    const formatStatus = (status: string) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const processWithdrawal = async (withdrawal: any, status: 'completed' | 'failed') => {
      const actionText = status === 'completed' ? 'approve' : 'reject';
      
      const alert = await alertController.create({
        header: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Withdrawal`,
        message: `Are you sure you want to ${actionText} this withdrawal of $${withdrawal.amount.toFixed(2)} for ${withdrawal.user?.username}?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
            role: status === 'completed' ? 'confirm' : 'destructive',
            handler: () => confirmProcessWithdrawal(withdrawal, status)
          }
        ]
      });
      await alert.present();
    };

    const confirmProcessWithdrawal = async (withdrawal: any, status: 'completed' | 'failed') => {
      try {
        processing.value = true;
        await AdminService.processWithdrawal(withdrawal.withdrawal_id, status);
        
        // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: 'current_admin_id',
          action_type: `${status}_withdrawal`,
          target_user_id: withdrawal.user_id,
          reason: `Withdrawal ${status} via admin panel`
        });

        const toast = await toastController.create({
          message: `Withdrawal ${status} successfully`,
          duration: 3000,
          color: status === 'completed' ? 'success' : 'warning'
        });
        await toast.present();
        
        loadWithdrawals();
      } catch (error) {
        console.error(`Failed to ${status} withdrawal:`, error);
        const toast = await toastController.create({
          message: `Failed to ${status} withdrawal`,
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
    });

    return {
      withdrawals,
      loading,
      processing,
      columns,
      isDetailsModalOpen,
      selectedWithdrawal,
      loadWithdrawals,
      refreshWithdrawals,
      getStatusColor,
      formatStatus,
      processWithdrawal,
      viewWithdrawalDetails,
      closeDetailsModal,
      formatDate,
      // Icons
      refreshIcon: refresh,
      checkmarkIcon: checkmark,
      closeIcon: close,
      eyeIcon: eye
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

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-container {
    padding: 16px;
  }
}
</style>
