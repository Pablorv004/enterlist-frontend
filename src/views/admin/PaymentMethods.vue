<template>
  <ion-page>
    <div class="admin-layout">
      <!-- Side Panel -->
      <admin-side-panel :active-tab="'payment-methods'"></admin-side-panel>
      
      <!-- Main Content -->
      <div class="main-content">
        <ion-content :fullscreen="true" class="admin-content">
          <div class="admin-container">
            <admin-table
              title="Payment Methods Management"
              :columns="columns"
              :rows="paymentMethods"
              :loading="loading"
              empty-message="No payment methods found in the system."
            >
              <template #actions>
                <ion-button @click="refreshPaymentMethods" fill="outline" size="small">
                  <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                  Refresh
                </ion-button>
              </template>
              
              <!-- Custom column templates -->
              <template #table-row="props">
                <span v-if="props.column.field === 'type'">
                  <ion-badge :color="getTypeColor(props.row.type)">
                    {{ props.row.type }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'is_default'">
                  <ion-badge :color="props.row.is_default ? 'success' : 'medium'">
                    {{ props.row.is_default ? 'Default' : 'Not Default' }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'deleted'">
                  <ion-badge :color="props.row.deleted ? 'danger' : 'success'">
                    {{ props.row.deleted ? 'Deleted' : 'Active' }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'created_at' || props.column.field === 'updated_at'">
                  {{ formatDate(props.row[props.column.field]) }}
                </span>
                <span v-else-if="props.column.field === 'users'">
                  {{ props.row.users?.username || 'Unknown' }}
                </span>
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="editPaymentMethod(props.row)"
                    >
                      <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="danger"
                      @click="deletePaymentMethod(props.row)"
                    >
                      <ion-icon :icon="trashIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </span>
                <span v-else>
                  {{ props.row[props.column.field] || '-' }}
                </span>
              </template>
            </admin-table>
          </div>
        </ion-content>
      </div>
    </div>

    <!-- Edit Payment Method Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Edit Payment Method</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="savePaymentMethod" v-if="selectedPaymentMethod">
          <ion-item>
            <ion-label position="stacked">Payment Method ID</ion-label>
            <ion-input :value="selectedPaymentMethod.payment_method_id" readonly></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Type</ion-label>
            <ion-select v-model="selectedPaymentMethod.type" placeholder="Select payment method type">
              <ion-select-option value="paypal">PayPal</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Details</ion-label>
            <ion-textarea 
              v-model="selectedPaymentMethod.details" 
              placeholder="Payment method details"
              :auto-grow="true"
              :rows="3"
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-checkbox v-model="selectedPaymentMethod.is_default"></ion-checkbox>
            <ion-label class="ion-margin-start">Default Payment Method</ion-label>
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
  </ion-page>
</template>


<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import {
  IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonSelect,
  IonSelectOption, IonTextarea, IonCheckbox, IonSpinner, alertController, toastController
} from '@ionic/vue';
import {
  refresh, create, trash, close
} from 'ionicons/icons';
import { AdminPaymentMethod } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils/date';

export default defineComponent({
  name: 'AdminPaymentMethods',
  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonTextarea, IonCheckbox, IonSpinner,
    AdminSidePanel, AdminTable
  },
  setup() {
    const paymentMethods = ref<AdminPaymentMethod[]>([]);
    const loading = ref(true);
    const saving = ref(false);
    const isEditModalOpen = ref(false);
    const selectedPaymentMethod = ref<AdminPaymentMethod | null>(null);

    const columns = [
      {
        label: 'ID',
        field: 'payment_method_id',
        type: 'string',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by ID' },
        width: '120px'
      },
      {
        label: 'User',
        field: 'users',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by user' }
      },
      {
        label: 'Type',
        field: 'type',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by type' },
        width: '100px'
      },
      {
        label: 'Details',
        field: 'details',
        sortable: false,
        filterOptions: { enabled: true, placeholder: 'Filter by details' }
      },
      {
        label: 'Default',
        field: 'is_default',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by default' },
        width: '100px'
      },
      {
        label: 'Status',
        field: 'deleted',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by status' },
        width: '100px'
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
      },
      {
        label: 'Actions',
        field: 'actions',
        sortable: false,
        width: '100px'
      }
    ];

    const getTypeColor = (type: string): string => {
      const colorMap: { [key: string]: string } = {
        'stripe': 'primary',
        'paypal': 'secondary',
        'bank_transfer': 'success',
        'crypto': 'warning'
      };
      return colorMap[type] || 'medium';
    };

    const loadPaymentMethods = async () => {
      try {
        loading.value = true;
        const response = await AdminService.getPaymentMethods();
        paymentMethods.value = response.data || [];
      } catch (error) {
        console.error('Failed to load payment methods:', error);
        const toast = await toastController.create({
          message: 'Failed to load payment methods',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        loading.value = false;
      }
    };

    const refreshPaymentMethods = () => {
      loadPaymentMethods();
    };

    const editPaymentMethod = (paymentMethod: AdminPaymentMethod) => {
      selectedPaymentMethod.value = { ...paymentMethod };
      isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
      isEditModalOpen.value = false;
      selectedPaymentMethod.value = null;
    };

    const savePaymentMethod = async () => {
      if (!selectedPaymentMethod.value) return;

      try {
        saving.value = true;
        await AdminService.updatePaymentMethod(selectedPaymentMethod.value.payment_method_id, {
          type: selectedPaymentMethod.value.type,
          details: selectedPaymentMethod.value.details,
          is_default: selectedPaymentMethod.value.is_default
        });
        
        const toast = await toastController.create({
          message: 'Payment method updated successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        closeEditModal();
        loadPaymentMethods();
      } catch (error) {
        console.error('Failed to update payment method:', error);
        const toast = await toastController.create({
          message: 'Failed to update payment method',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        saving.value = false;
      }
    };

    const deletePaymentMethod = async (paymentMethod: AdminPaymentMethod) => {
      const alert = await alertController.create({
        header: 'Delete Payment Method',
        message: `Are you sure you want to delete this payment method? This action cannot be undone.`,
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
                await AdminService.deletePaymentMethod(paymentMethod.payment_method_id);
                
                const toast = await toastController.create({
                  message: 'Payment method deleted successfully',
                  duration: 3000,
                  color: 'success'
                });
                await toast.present();
                
                loadPaymentMethods();
              } catch (error) {
                console.error('Error deleting payment method:', error);
                const toast = await toastController.create({
                  message: 'Failed to delete payment method',
                  duration: 3000,
                  color: 'danger'
                });
                await toast.present();
              }
            }
          }
        ]
      });
      
      await alert.present();
    };

    onMounted(() => {
      loadPaymentMethods();
    });

    return {
      paymentMethods,
      loading,
      saving,
      columns,
      isEditModalOpen,
      selectedPaymentMethod,
      loadPaymentMethods,
      refreshPaymentMethods,
      getTypeColor,
      editPaymentMethod,
      closeEditModal,
      savePaymentMethod,
      deletePaymentMethod,
      formatDate,
      // Icons
      refreshIcon: refresh,
      editIcon: create,
      trashIcon: trash,
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

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-container {
    padding: 16px;
  }
}
</style>
