<template>
  <ion-page>
    <div class="admin-layout">
      <!-- Side Panel -->
      <admin-side-panel :active-tab="'platforms'"></admin-side-panel>
      
      <!-- Main Content -->
      <div class="main-content">
        <ion-content :fullscreen="true" class="admin-content">
          <div class="admin-container">
            <admin-table
              title="Platform Management"
              :columns="columns"
              :rows="platforms"
              :loading="loading"
              empty-message="No platforms found in the system."
            >
              <template #actions>
                <ion-button @click="refreshPlatforms" fill="outline" size="small">
                  <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                  Refresh
                </ion-button>
              </template>

              <!-- Custom column templates -->
              <template #table-row="props">
                <span v-if="props.column.field === 'is_active'">
                  <ion-badge :color="props.row.is_active ? 'success' : 'danger'">
                    {{ props.row.is_active ? 'Active' : 'Inactive' }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'base_fee'">
                  ${{ props.row.base_fee?.toFixed(2) || '0.00' }}
                </span>
                <span v-else-if="props.column.field === 'commission_rate'">
                  {{ (props.row.commission_rate * 100)?.toFixed(1) || '0.0' }}%
                </span>
                <span v-else-if="props.column.field === 'logo_url'">
                  <img 
                    v-if="props.row.logo_url" 
                    :src="props.row.logo_url" 
                    :alt="props.row.name"
                    class="platform-logo"
                    @error="onImageError"
                  />
                  <span v-else class="no-logo">No Logo</span>
                </span>
                <span v-else-if="props.column.field === 'website_url'">
                  <ion-button 
                    v-if="props.row.website_url"
                    fill="clear" 
                    size="small" 
                    @click="openExternalUrl(props.row.website_url)"
                  >
                    <ion-icon :icon="linkIcon" slot="icon-only"></ion-icon>
                  </ion-button>
                  <span v-else>N/A</span>
                </span>
                <span v-else-if="props.column.field === 'created_at'">
                  {{ formatDate(props.row.created_at) }}
                </span>
                <span v-else-if="props.column.field === 'updated_at'">
                  {{ formatDate(props.row.updated_at) }}
                </span>
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="editPlatform(props.row)"
                    >
                      <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      :color="props.row.is_active ? 'warning' : 'success'"
                      @click="togglePlatformStatus(props.row)"
                    >
                      <ion-icon :icon="props.row.is_active ? eyeOffIcon : eyeIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="danger"
                      @click="confirmDeletePlatform(props.row)"
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
    </div>

    <!-- Edit Platform Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Edit Platform</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="savePlatform" v-if="selectedPlatform">
          <ion-item>
            <ion-label position="stacked">Platform Name</ion-label>
            <ion-input v-model="selectedPlatform.name" required></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <ion-textarea v-model="selectedPlatform.description"></ion-textarea>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Base Fee ($)</ion-label>
            <ion-input 
              v-model="selectedPlatform.base_fee" 
              type="number" 
              step="0.01"
              required
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Commission Rate (0-1)</ion-label>
            <ion-input 
              v-model="selectedPlatform.commission_rate" 
              type="number" 
              step="0.001"
              min="0"
              max="1"
              required
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Website URL</ion-label>
            <ion-input 
              v-model="selectedPlatform.website_url" 
              type="url"
              placeholder="https://example.com"
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Logo URL</ion-label>
            <ion-input 
              v-model="selectedPlatform.logo_url" 
              type="url"
              placeholder="https://example.com/logo.png"
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Contact Email</ion-label>
            <ion-input 
              v-model="selectedPlatform.contact_email" 
              type="email"
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-checkbox v-model="selectedPlatform.is_active"></ion-checkbox>
            <ion-label class="ion-margin-start">Active Platform</ion-label>
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
  IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonTextarea,
  IonCheckbox, IonSpinner, toastController, alertController
} from '@ionic/vue';
import {
  refresh, create, eye, eyeOff, trash, close, link
} from 'ionicons/icons';
import { AdminPlatform } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils';

export default defineComponent({
  name: 'AdminPlatforms',
  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonTextarea,
    IonCheckbox, IonSpinner,
    AdminSidePanel, AdminTable
  },  setup() {
    const platforms = ref<AdminPlatform[]>([]);
    const loading = ref(true);
    const saving = ref(false);
    const isEditModalOpen = ref(false);
    const selectedPlatform = ref<AdminPlatform | null>(null);

    const columns = [
      {
        label: 'ID',
        field: 'platform_id',
        type: 'string',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by ID' },
        width: '80px'
      },
      {
        label: 'Logo',
        field: 'logo_url',
        sortable: false,
        width: '80px'
      },
      {
        label: 'Name',
        field: 'name',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by name' }
      },
      {
        label: 'Description',
        field: 'description',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by description' }
      },
      {
        label: 'Base Fee',
        field: 'base_fee',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by fee' }
      },
      {
        label: 'Commission',
        field: 'commission_rate',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by commission' }
      },
      {
        label: 'Website',
        field: 'website_url',
        sortable: false,
        width: '80px'
      },
      {
        label: 'Status',
        field: 'is_active',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by status' }
      },
      {
        label: 'Created',
        field: 'created_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by date' }
      },
      {
        label: 'Updated',
        field: 'updated_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by updated' }
      },
      {
        label: 'Actions',
        field: 'actions',
        sortable: false,
        width: '150px'
      }
    ];

    const loadPlatforms = async () => {
      try {
        loading.value = true;
        platforms.value = await AdminService.getPlatforms();
      } catch (error) {
        console.error('Failed to load platforms:', error);
        const toast = await toastController.create({
          message: 'Failed to load platforms',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        loading.value = false;
      }
    };

    const refreshPlatforms = () => {
      loadPlatforms();
    };

    const editPlatform = (platform: any) => {
      selectedPlatform.value = { ...platform };
      isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
      isEditModalOpen.value = false;
      selectedPlatform.value = null;
    };

    const savePlatform = async () => {
      if (!selectedPlatform.value) return;

      try {
        saving.value = true;
        await AdminService.updatePlatform(selectedPlatform.value.platform_id, selectedPlatform.value);
        
        // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: 'current_admin_id',
          action_type: 'update_platform',
          reason: 'Platform details updated via admin panel'
        });

        const toast = await toastController.create({
          message: 'Platform updated successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        closeEditModal();
        loadPlatforms();
      } catch (error) {
        console.error('Failed to update platform:', error);
        const toast = await toastController.create({
          message: 'Failed to update platform',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        saving.value = false;
      }
    };

    const togglePlatformStatus = async (platform: any) => {
      const action = platform.is_active ? 'deactivate' : 'activate';
      
      try {
        await AdminService.updatePlatform(platform.platform_id, {
          ...platform,
          is_active: !platform.is_active
        });

        // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: 'current_admin_id',
          action_type: action === 'deactivate' ? 'deactivate_platform' : 'activate_platform',
          reason: `Platform ${action}d via admin panel`
        });

        const toast = await toastController.create({
          message: `Platform ${action}d successfully`,
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        loadPlatforms();
      } catch (error) {
        console.error(`Failed to ${action} platform:`, error);
        const toast = await toastController.create({
          message: `Failed to ${action} platform`,
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    };

    const confirmDeletePlatform = async (platform: any) => {
      const alert = await alertController.create({
        header: 'Delete Platform',
        message: `Are you sure you want to delete platform "${platform.name}"? This action cannot be undone and may affect existing playlists.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => deletePlatform(platform)
          }
        ]
      });
      await alert.present();
    };

    const deletePlatform = async (platform: any) => {
      try {
        await AdminService.deletePlatform(platform.platform_id);
        
        // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: 'current_admin_id',
          action_type: 'delete_platform',
          reason: 'Platform deleted via admin panel'
        });

        const toast = await toastController.create({
          message: 'Platform deleted successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        loadPlatforms();
      } catch (error) {
        console.error('Failed to delete platform:', error);
        const toast = await toastController.create({
          message: 'Failed to delete platform',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    };

    const openExternalUrl = (url: string) => {
      window.open(url, '_blank');
    };

    const onImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;
      img.style.display = 'none';
      img.parentElement!.innerHTML = '<span class="no-logo">No Logo</span>';
    };

    onMounted(() => {
      loadPlatforms();
    });

    return {
      platforms,
      loading,
      saving,
      columns,
      isEditModalOpen,
      selectedPlatform,
      loadPlatforms,
      refreshPlatforms,
      editPlatform,
      closeEditModal,
      savePlatform,
      togglePlatformStatus,
      confirmDeletePlatform,
      openExternalUrl,
      onImageError,
      formatDate,
      // Icons
      refreshIcon: refresh,
      editIcon: create,
      eyeIcon: eye,
      eyeOffIcon: eyeOff,
      trashIcon: trash,
      closeIcon: close,
      linkIcon: link
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

.platform-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 4px;
}

.no-logo {
  color: #666;
  font-style: italic;
  font-size: 0.8rem;
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
