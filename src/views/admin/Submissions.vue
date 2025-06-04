<template>
  <ion-page>
    <div class="admin-layout">
      <!-- Side Panel -->
      <admin-side-panel :active-tab="'submissions'"></admin-side-panel>
      
      <!-- Main Content -->
      <div class="main-content">
        <ion-content :fullscreen="true" class="admin-content">
          <div class="admin-container">
            <admin-table
              title="Submission Management"
              :columns="columns"
              :rows="submissions"
              :loading="loading"
              empty-message="No submissions found in the system."
            >
              <template #actions>
                <ion-button @click="refreshSubmissions" fill="outline" size="small">
                  <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                  Refresh
                </ion-button>
              </template>              <!-- Custom column templates -->
              <template #table-row="props">
                <span v-if="props.column.field === 'status'">
                  <ion-badge :color="getStatusColor(props.row.status)">
                    {{ formatStatus(props.row.status) }}
                  </ion-badge>
                </span>
                <span v-else-if="props.column.field === 'artist.username'">
                  {{ props.row.artist?.username || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'playlist.name'">
                  {{ props.row.playlist?.name || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'song.title'">
                  {{ props.row.song?.title || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'song.artist_name'">
                  {{ props.row.song?.artist_name_on_platform || 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'submission_message'">
                  {{ props.row.submission_message ? (props.row.submission_message.length > 50 ? props.row.submission_message.substring(0, 50) + '...' : props.row.submission_message) : 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'review_feedback'">
                  {{ props.row.review_feedback ? (props.row.review_feedback.length > 50 ? props.row.review_feedback.substring(0, 50) + '...' : props.row.review_feedback) : 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'submitted_at' || props.column.field === 'reviewed_at'">
                  {{ props.row[props.column.field] ? formatDate(props.row[props.column.field]) : 'N/A' }}
                </span>
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="primary"
                      @click="editSubmission(props.row)"
                    >
                      <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                    </ion-button>
                    <ion-button 
                      fill="clear" 
                      size="small" 
                      color="danger"
                      @click="confirmDeleteSubmission(props.row)"
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

    <!-- Edit Submission Modal -->
    <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Edit Submission</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>      <ion-content class="ion-padding">
        <form @submit.prevent="saveSubmission" v-if="selectedSubmission">
          <ion-item>
            <ion-label position="stacked">Status *</ion-label>            <ion-select v-model="selectedSubmission.status" interface="popover">
              <ion-select-option value="pending">Pending</ion-select-option>
              <ion-select-option value="processing">Processing</ion-select-option>
              <ion-select-option value="approved">Approved</ion-select-option>
              <ion-select-option value="rejected">Rejected</ion-select-option>
            </ion-select>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Submission Message</ion-label>
            <ion-textarea 
              v-model="selectedSubmission.submission_message"
              placeholder="Message from artist..."
              readonly
            ></ion-textarea>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Review Feedback</ion-label>
            <ion-textarea 
              v-model="selectedSubmission.review_feedback"
              placeholder="Add feedback for this submission..."
            ></ion-textarea>
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
          <ion-title>Submission Details</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeDetailsModal">
              <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" v-if="selectedSubmission">
        <div class="detail-section">
          <h3>Submission Information</h3>
          <ion-item>
            <ion-label>
              <h4>ID</h4>
              <p>{{ selectedSubmission.submission_id }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Status</h4>
              <p>
                <ion-badge :color="getStatusColor(selectedSubmission.status)">
                  {{ formatStatus(selectedSubmission.status) }}
                </ion-badge>
              </p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Submitted</h4>
              <p>{{ formatDate(selectedSubmission.submitted_at) }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Reviewed</h4>
              <p>{{ selectedSubmission.reviewed_at ? formatDate(selectedSubmission.reviewed_at) : 'Not reviewed' }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section">
          <h3>Artist Information</h3>
          <ion-item>
            <ion-label>
              <h4>Username</h4>
              <p>{{ selectedSubmission.artist?.username }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Email</h4>
              <p>{{ selectedSubmission.artist?.email }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section">
          <h3>Song Information</h3>
          <ion-item>
            <ion-label>
              <h4>Title</h4>
              <p>{{ selectedSubmission.song?.title }}</p>
            </ion-label>
          </ion-item>          <ion-item>
            <ion-label>
              <h4>Artist Name</h4>
              <p>{{ selectedSubmission.song?.artist_name_on_platform }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Album</h4>
              <p>{{ selectedSubmission.song?.album_name }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Duration</h4>
              <p>{{ formatDuration(selectedSubmission.song?.duration_ms) }}</p>
            </ion-label>
          </ion-item>          <ion-item v-if="selectedSubmission.song?.url">
            <ion-label>
              <h4>Audio File</h4>
              <p>
                <ion-button 
                  fill="outline" 
                  size="small" 
                  @click="playAudio(selectedSubmission.song.url)"
                >
                  Play
                </ion-button>
              </p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section">
          <h3>Playlist Information</h3>
          <ion-item>
            <ion-label>
              <h4>Name</h4>
              <p>{{ selectedSubmission.playlist?.name }}</p>
            </ion-label>
          </ion-item>          <ion-item>
            <ion-label>
              <h4>Platform</h4>
              <p>{{ selectedSubmission.playlist?.platform?.name }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h4>Fee</h4>
              <p>${{ selectedSubmission.playlist?.submission_fee?.toFixed(2) }}</p>
            </ion-label>
          </ion-item>
        </div>        <div class="detail-section" v-if="selectedSubmission.review_feedback">
          <h3>Review Feedback</h3>
          <ion-item>
            <ion-label>
              <p>{{ selectedSubmission.review_feedback }}</p>
            </ion-label>
          </ion-item>
        </div>

        <div class="detail-section" v-if="selectedSubmission.submission_message">
          <h3>Submission Message</h3>
          <ion-item>
            <ion-label>
              <p>{{ selectedSubmission.submission_message }}</p>
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
  IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonSelect, IonSelectOption,
  IonTextarea, IonSpinner, toastController, alertController
} from '@ionic/vue';
import {
  refresh, create, trash, close
} from 'ionicons/icons';
import { AdminSubmission } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils/date';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
  name: 'AdminSubmissions',
  components: {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonTextarea, IonSpinner,
    AdminSidePanel, AdminTable  },  setup() {
    const authStore = useAuthStore();
    const submissions = ref<AdminSubmission[]>([]);
    const loading = ref(true);
    const saving = ref(false);
    const isEditModalOpen = ref(false);
    const isDetailsModalOpen = ref(false);
    const selectedSubmission = ref<AdminSubmission | null>(null);const columns = [
      {
        label: 'ID',
        field: 'submission_id',
        type: 'string',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by ID' },
        width: '120px'
      },
      {
        label: 'Artist',
        field: 'artist.username',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by artist' }
      },
      {
        label: 'Song',
        field: 'song.title',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by song' }
      },
      {
        label: 'Artist Name',
        field: 'song.artist_name',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by artist name' }
      },
      {
        label: 'Playlist',
        field: 'playlist.name',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by playlist' }
      },
      {
        label: 'Status',
        field: 'status',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by status' },
        width: '100px'
      },
      {
        label: 'Message',
        field: 'submission_message',
        sortable: false,
        filterOptions: { enabled: true, placeholder: 'Filter by message' },
        width: '150px'
      },
      {
        label: 'Feedback',
        field: 'review_feedback',
        sortable: false,
        filterOptions: { enabled: true, placeholder: 'Filter by feedback' },
        width: '150px'
      },
      {
        label: 'Submitted',
        field: 'submitted_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by date' },
        width: '120px'
      },
      {
        label: 'Reviewed',
        field: 'reviewed_at',
        type: 'date',
        sortable: true,
        filterOptions: { enabled: true, placeholder: 'Filter by reviewed date' },
        width: '120px'
      },
      {
        label: 'Actions',
        field: 'actions',
        sortable: false,
        width: '120px'
      }
    ];const loadSubmissions = async () => {
      try {
        loading.value = true;
        const response = await AdminService.getSubmissions();
        submissions.value = response.data || response; // Handle both paginated and simple array responses
      } catch (error) {
        console.error('Failed to load submissions:', error);
        const toast = await toastController.create({
          message: 'Failed to load submissions',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        loading.value = false;
      }
    };

    const refreshSubmissions = () => {
      loadSubmissions();
    };    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'secondary';
        case 'approved': return 'success';
        case 'rejected': return 'danger';
        case 'removed': return 'medium';
        default: return 'tertiary';
      }
    };

    const formatStatus = (status: string) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };    const formatDuration = (milliseconds?: number) => {
      if (!milliseconds) return '0:00';
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const editSubmission = (submission: any) => {
      selectedSubmission.value = { ...submission };
      isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
      isEditModalOpen.value = false;
      selectedSubmission.value = null;
    };

    const saveSubmission = async () => {
      if (!selectedSubmission.value) return;

      try {
        saving.value = true;
        await AdminService.updateSubmission(selectedSubmission.value.submission_id, selectedSubmission.value);
          // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: authStore.user?.user_id || '',
          action_type: 'update_submission',
          target_user_id: selectedSubmission.value.artist_id,
          reason: 'Submission details updated via admin panel'
        });

        const toast = await toastController.create({
          message: 'Submission updated successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        closeEditModal();
        loadSubmissions();
      } catch (error) {
        console.error('Failed to update submission:', error);
        const toast = await toastController.create({
          message: 'Failed to update submission',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      } finally {
        saving.value = false;
      }
    };

    const viewSubmissionDetails = (submission: any) => {
      selectedSubmission.value = { ...submission };
      isDetailsModalOpen.value = true;
    };

    const closeDetailsModal = () => {
      isDetailsModalOpen.value = false;
      selectedSubmission.value = null;
    };

    const confirmDeleteSubmission = async (submission: any) => {
      const alert = await alertController.create({
        header: 'Delete Submission',
        message: `Are you sure you want to delete submission "${submission.song?.title}" by ${submission.artist?.username}? This action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => deleteSubmission(submission)
          }
        ]
      });
      await alert.present();
    };

    const deleteSubmission = async (submission: any) => {
      try {
        await AdminService.deleteSubmission(submission.submission_id);
          // Record admin action
        await AdminService.createAdminAction({
          admin_user_id: authStore.user?.user_id || '',
          action_type: 'delete_submission',
          target_user_id: submission.artist_id,
          reason: 'Submission deleted via admin panel'
        });

        const toast = await toastController.create({
          message: 'Submission deleted successfully',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
        
        loadSubmissions();
      } catch (error) {
        console.error('Failed to delete submission:', error);
        const toast = await toastController.create({
          message: 'Failed to delete submission',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    };

    const playAudio = (url: string) => {
      window.open(url, '_blank');
    };

    onMounted(() => {
      loadSubmissions();
    });

    return {
      submissions,
      loading,
      saving,
      columns,
      isEditModalOpen,
      isDetailsModalOpen,
      selectedSubmission,
      loadSubmissions,
      refreshSubmissions,
      getStatusColor,
      formatStatus,
      formatDuration,
      editSubmission,
      closeEditModal,
      saveSubmission,
      viewSubmissionDetails,
      closeDetailsModal,
      confirmDeleteSubmission,
      playAudio,
      formatDate,      // Icons
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
