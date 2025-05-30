<template>
  <ion-page>
    <div class="admin-layout">
      <!-- Side Panel -->
      <admin-side-panel :active-tab="'playlists'"></admin-side-panel>
      
      <!-- Main Content -->
      <div class="main-content">
        <ion-content :fullscreen="true" class="admin-content">
          <div class="admin-container">
            <admin-table
              title="Playlist Management"
              :columns="columns"
              :rows="playlists"
              :loading="loading"
              empty-message="No playlists found in the system."
            >
              <template #actions>
                <ion-button @click="refreshPlaylists" fill="outline" size="small">
                  <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                  Refresh
                </ion-button>
              </template>              <!-- Custom column templates -->
              <template #table-row="props">
                <span v-if="props.column.field === 'is_visible'">
                  <ion-badge :color="props.row.is_visible ? 'success' : 'danger'">
                    {{ props.row.is_visible ? 'Visible' : 'Hidden' }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'platform'">
                  <ion-badge :color="getPlatformColor(props.row.platform?.name)">
                    {{ props.row.platform?.name || 'Unknown' }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'submission_fee'">
                  ${{ Number(props.row.submission_fee || 0).toFixed(2) }}
                </span>
                <span v-else-if="props.column.field === 'track_count'">
                  {{ Number(props.row.track_count || 0) }}
                </span>
                <span v-else-if="props.column.field === 'created_at' || props.column.field === 'updated_at'">
                  {{ formatDate(props.row[props.column.field]) }}
                </span>
                <span v-else-if="props.column.field === 'playlist_maker'">
                  {{ props.row.creator?.username || 'Unknown' }}
                </span>
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="editPlaylist(props.row)"
                    >
                      <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="danger"
                      @click="confirmDeletePlaylist(props.row)"
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

    <!-- Edit Playlist Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Edit Playlist</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>      <ion-content class="ion-padding">
        <form @submit.prevent="savePlaylist" v-if="selectedPlaylist">
          <ion-item>
            <ion-label position="stacked">Name *</ion-label>
            <ion-input v-model="selectedPlaylist.name" required></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <ion-textarea v-model="selectedPlaylist.description" auto-grow></ion-textarea>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Platform Specific ID *</ion-label>
            <ion-input v-model="selectedPlaylist.platform_specific_id" required></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Submission Fee ($) *</ion-label>
            <ion-input 
              v-model.number="selectedPlaylist.submission_fee" 
              type="number" 
              step="0.01"
              min="0"
              required
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Track Count</ion-label>
            <ion-input 
              v-model.number="selectedPlaylist.track_count" 
              type="number" 
              min="0"
            ></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Genre</ion-label>
            <ion-input v-model="selectedPlaylist.genre"></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">External URL</ion-label>
            <ion-input v-model="selectedPlaylist.url" type="url"></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Cover Image URL</ion-label>
            <ion-input v-model="selectedPlaylist.cover_image_url" type="url"></ion-input>
          </ion-item>
          
          <ion-item>
            <ion-checkbox v-model="selectedPlaylist.is_visible"></ion-checkbox>
            <ion-label class="ion-margin-start">Visible to Public</ion-label>
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
  IonCheckbox, IonSpinner, alertController, toastController
} from '@ionic/vue';
import {
  refresh, create, trash, close
} from 'ionicons/icons';
import { AdminPlaylist } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils/date';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
  name: 'AdminPlaylists',
  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonTextarea,
    IonCheckbox, IonSpinner,
    AdminSidePanel, AdminTable  },  setup() {
    const playlists = ref<AdminPlaylist[]>([]);
    const loading = ref(true);
    const saving = ref(false);
    const isEditModalOpen = ref(false);
    const selectedPlaylist = ref<AdminPlaylist | null>(null);
    const authStore = useAuthStore();const columns = [
      {
        label: 'ID',
        field: 'playlist_id',
        type: 'string',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by ID' },
        width: '120px'
      },
      {
        label: 'Name',
        field: 'name',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by name' }
      },
      {
        label: 'Creator',
        field: 'playlist_maker',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by creator' }
      },
      {
        label: 'Platform',
        field: 'platform',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by platform' }
      },
      {
        label: 'Platform ID',
        field: 'platform_specific_id',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by platform ID' },
        width: '120px'
      },
      {
        label: 'Fee ($)',
        field: 'submission_fee',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by fee' },
        width: '100px'
      },
      {
        label: 'Tracks',
        field: 'track_count',
        type: 'number',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by track count' },
        width: '80px'
      },
      {
        label: 'Genre',
        field: 'genre',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by genre' },
        width: '100px'
      },
      {
        label: 'Status',
        field: 'is_visible',
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
        filterOptions: { enabled: true, placeholder: 'Filter by update date' },
        width: '120px'
      },
      {
        label: 'Actions',
        field: 'actions',
        sortable: false,
        width: '120px'
      }
    ];const loadPlaylists = async () => {
      try {
        loading.value = true;
        const response = await AdminService.getPlaylists();
        playlists.value = response.data || response; // Handle both paginated and simple array responses
      } catch (error) {
        console.error('Failed to load playlists:', error);
        const toast = await toastController.create({
          message: 'Failed to load playlists',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        loading.value = false;
      }
    };

    const refreshPlaylists = () => {
      loadPlaylists();
    };    const getPlatformColor = (platform: string) => {
      const colors: { [key: string]: string } = {
        'Spotify': 'success',
        'YouTube': 'danger',
        'Apple Music': 'dark'
      };
      return colors[platform] || 'medium';
    };

    const editPlaylist = (playlist: any) => {
      selectedPlaylist.value = { ...playlist };
      isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
      isEditModalOpen.value = false;
      selectedPlaylist.value = null;
    };

    const savePlaylist = async () => {
      if (!selectedPlaylist.value) return;

      try {
        saving.value = true;
        await AdminService.updatePlaylist(selectedPlaylist.value.playlist_id, selectedPlaylist.value);
          // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: authStore.user?.user_id || '',
          action_type: 'update_playlist',
          target_playlist_id: selectedPlaylist.value.playlist_id,
          reason: 'Playlist details updated via admin panel'
        });

        const toast = await toastController.create({
          message: 'Playlist updated successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        closeEditModal();
        loadPlaylists();
      } catch (error) {
        console.error('Failed to update playlist:', error);
        const toast = await toastController.create({
          message: 'Failed to update playlist',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        saving.value = false;
      }    };

    const confirmDeletePlaylist = async (playlist: any) => {
      const alert = await alertController.create({
        header: 'Delete Playlist',
        message: `Are you sure you want to delete playlist "${playlist.name}"? This action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => deletePlaylist(playlist)
          }
        ]
      });
      await alert.present();
    };

    const deletePlaylist = async (playlist: any) => {
      try {
        await AdminService.deletePlaylist(playlist.playlist_id);
          // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: authStore.user?.user_id || '',
          action_type: 'delete_playlist',
          target_playlist_id: playlist.playlist_id,
          reason: 'Playlist deleted via admin panel'
        });

        const toast = await toastController.create({
          message: 'Playlist deleted successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        loadPlaylists();
      } catch (error) {
        console.error('Failed to delete playlist:', error);
        const toast = await toastController.create({
          message: 'Failed to delete playlist',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }    };

    onMounted(() => {
      loadPlaylists();
    });    return {
      playlists,
      loading,
      saving,
      columns,
      isEditModalOpen,
      selectedPlaylist,
      loadPlaylists,
      refreshPlaylists,
      getPlatformColor,
      formatDate,
      editPlaylist,
      closeEditModal,
      savePlaylist,
      confirmDeletePlaylist,
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
