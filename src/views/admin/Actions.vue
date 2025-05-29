<template>
  <ion-page>
    <div class="admin-layout">
      <!-- Side Panel -->
      <admin-side-panel :active-tab="'actions'"></admin-side-panel>
      
      <!-- Main Content -->
      <div class="main-content">
        <ion-content :fullscreen="true" class="admin-content">
          <div class="admin-container">
            <admin-table
              title="Admin Actions Management"
              :columns="columns"
              :rows="actions"
              :loading="loading"
              empty-message="No admin actions found in the system."
            >
              <template #actions>
                <ion-button @click="refreshActions" fill="outline" size="small">
                  <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                  Refresh
                </ion-button>
              </template>              <!-- Custom columns -->
              <template #table-row="props">
                <span v-if="props.column.field === 'action_type'">
                  <ion-badge :color="getActionTypeColor(props.row.action_type)">
                    {{ formatActionType(props.row.action_type) }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'admin'">
                  {{ props.row.admin?.username || 'Unknown' }}
                </span>
                <span v-else-if="props.column.field === 'target_user'">
                  {{ props.row.target_user?.username || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'action_timestamp'">
                  {{ formatDate(props.row.action_timestamp) }}
                </span>
                <span v-else-if="props.column.field === 'reason'">
                  <div class="description-cell">
                    {{ truncateDescription(props.row.reason) }}
                    <ion-button 
                      v-if="props.row.reason && props.row.reason.length > 50"
                      fill="clear" 
                      size="small" 
                      @click="viewActionDetails(props.row)"
                    >
                      <ion-icon :icon="eyeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </span>
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="viewActionDetails(props.row)"
                    >
                      <ion-icon :icon="eyeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="danger"
                      @click="deleteAction(props.row)"
                    >
                      <ion-icon :icon="trashIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                  </div>
                </span>
                <span v-else>
                  {{ props.value }}
                </span>
              </template>
            </admin-table>

            <!-- Action Details Modal -->
            <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
              <ion-header>
                <ion-toolbar>
                  <ion-title>Admin Action Details</ion-title>
                  <ion-buttons slot="end">
                    <ion-button @click="closeModal">Close</ion-button>
                  </ion-buttons>
                </ion-toolbar>
              </ion-header>              <ion-content class="modal-content">
                <div v-if="selectedAction" class="action-details">
                  <div class="detail-group">
                    <label>Action ID:</label>
                    <span>{{ selectedAction.action_id }}</span>
                  </div>
                  
                  <div class="detail-group">
                    <label>Action Type:</label>
                    <ion-badge :color="getActionTypeColor(selectedAction.action_type)">
                      {{ formatActionType(selectedAction.action_type) }}
                    </ion-badge>
                  </div>
                  
                  <div class="detail-group">
                    <label>Admin User:</label>
                    <span>{{ selectedAction.admin?.username || 'Unknown' }}</span>
                  </div>
                  
                  <div class="detail-group" v-if="selectedAction.target_user">
                    <label>Target User:</label>
                    <span>{{ selectedAction.target_user?.username }}</span>
                  </div>
                  
                  <div class="detail-group" v-if="selectedAction.target_user_id">
                    <label>Target User ID:</label>
                    <span>{{ selectedAction.target_user_id }}</span>
                  </div>
                  
                  <div class="detail-group" v-if="selectedAction.target_playlist_id">
                    <label>Target Playlist ID:</label>
                    <span>{{ selectedAction.target_playlist_id }}</span>
                  </div>
                  
                  <div class="detail-group" v-if="selectedAction.target_song_id">
                    <label>Target Song ID:</label>
                    <span>{{ selectedAction.target_song_id }}</span>
                  </div>
                  
                  <div class="detail-group">
                    <label>Reason:</label>
                    <p class="description">{{ selectedAction.reason || 'No reason provided' }}</p>
                  </div>
                  
                  <div class="detail-group">
                    <label>Created At:</label>
                    <span>{{ formatDate(selectedAction.action_timestamp) }}</span>
                  </div>
                </div>
              </ion-content>
            </ion-modal>
          </div>
        </ion-content>
      </div>
    </div>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
  IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, 
  IonHeader, IonToolbar, IonTitle, IonButtons, alertController
} from '@ionic/vue';
import { refresh, eye, trash } from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { AdminAction } from '@/types';

export default defineComponent({
  name: 'AdminActions',
  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    AdminSidePanel, AdminTable
  },
  setup() {
    const actions = ref<AdminAction[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const selectedAction = ref<AdminAction | null>(null);
    const isModalOpen = ref(false);    const columns = [
      { label: 'ID', field: 'action_id', sortable: true, width: '80px' },
      { label: 'Action Type', field: 'action_type', sortable: true },
      { label: 'Admin User', field: 'admin', sortable: true },
      { label: 'Target User', field: 'target_user', sortable: true },
      { label: 'Reason', field: 'reason', sortable: false },
      { label: 'Created At', field: 'action_timestamp', sortable: true, type: 'datetime' },
      { label: 'Actions', field: 'actions', sortable: false, width: '100px' }
    ];

    const loadActions = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await AdminService.getAdminActions();
        actions.value = response.data || [];
      } catch (err: any) {
        error.value = err.message || 'Failed to load admin actions';
        console.error('Error loading admin actions:', err);
      } finally {
        loading.value = false;
      }
    };

    const refreshActions = async () => {
      await loadActions();
    };

    const viewActionDetails = (action: AdminAction) => {
      selectedAction.value = action;
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
      selectedAction.value = null;
    };

    const deleteAction = async (action: AdminAction) => {
      const alert = await alertController.create({
        header: 'Delete Admin Action',
        message: `Are you sure you want to delete this admin action? This action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',            handler: async () => {
              try {
                loading.value = true;
                await AdminService.deleteAdminAction(action.action_id);
                await loadActions();
              } catch (err: any) {
                console.error('Error deleting admin action:', err);
                error.value = err.message || 'Failed to delete admin action';
              } finally {
                loading.value = false;
              }
            }
          }
        ]
      });
      await alert.present();
    };

    const getActionTypeColor = (actionType: string): string => {
      const colorMap: { [key: string]: string } = {
        'create': 'success',
        'update': 'warning',
        'delete': 'danger',
        'login': 'primary',
        'logout': 'medium',
        'view': 'tertiary'
      };
      return colorMap[actionType] || 'medium';
    };

    const formatActionType = (actionType: string): string => {
      return actionType.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleString();
    };    const truncateDescription = (reason: string | null): string => {
      if (!reason) return 'No reason';
      return reason.length > 50 
        ? reason.substring(0, 50) + '...' 
        : reason;
    };

    onMounted(() => {
      loadActions();
    });

    return {
      actions,
      loading,
      error,
      columns,
      selectedAction,
      isModalOpen,
      loadActions,
      refreshActions,
      viewActionDetails,
      closeModal,
      deleteAction,
      getActionTypeColor,
      formatActionType,
      formatDate,
      truncateDescription,
      // Icons
      refreshIcon: refresh,
      eyeIcon: eye,
      trashIcon: trash
    };
  }
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  --padding-start: 0;
  --padding-end: 0;
}

.admin-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.description-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-content {
  --padding-start: 20px;
  --padding-end: 20px;
}

.action-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-group span {
  color: #6b7280;
  font-size: 0.95rem;
}

.description {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.metadata {
  background: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-container {
    padding: 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
