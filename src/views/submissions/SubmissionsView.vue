<template>
  <ion-page>
    <page-header title="Submissions">
      <template #end-buttons>
        <ion-button v-if="isArtist" @click="openSubmissionModal">
          <ion-icon :icon="add" slot="icon-only"></ion-icon>
        </ion-button>
      </template>
    </page-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Submissions</ion-title>
          <ion-buttons slot="end" v-if="isArtist">
            <ion-button @click="openSubmissionModal">
              <ion-icon :icon="add" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <div class="ion-padding">
        <!-- Filter tabs -->
        <ion-segment v-model="statusFilter" @ionChange="handleFilterChange">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="pending">
            <ion-label>Pending</ion-label>
          </ion-segment-button>
          <ion-segment-button value="under_review">
            <ion-label>In Review</ion-label>
          </ion-segment-button>
          <ion-segment-button value="approved">
            <ion-label>Approved</ion-label>
          </ion-segment-button>
          <ion-segment-button value="rejected">
            <ion-label>Rejected</ion-label>
          </ion-segment-button>
        </ion-segment>
        
        <div v-if="loading" class="ion-padding ion-text-center">
          <ion-spinner></ion-spinner>
          <p>Loading submissions...</p>
        </div>
        
        <div v-else-if="error" class="ion-padding ion-text-center error-message">
          <p>{{ error }}</p>
          <ion-button @click="loadSubmissions">Retry</ion-button>
        </div>
        
        <div v-else-if="submissions.length === 0" class="ion-padding ion-text-center">
          <ion-icon :icon="document" size="large" color="medium"></ion-icon>
          <h4>No submissions found</h4>
          <p v-if="isArtist && statusFilter === 'all'">You haven't submitted any songs yet.</p>
          <p v-else-if="isPlaylistMaker && statusFilter === 'all'">There are no submissions to your playlists yet.</p>
          <p v-else>No submissions matching the current filter.</p>
          <ion-button v-if="isArtist" @click="openSubmissionModal">Submit a Song</ion-button>
        </div>
        
        <div v-else>
          <!-- Artist view of submissions -->
          <div v-if="isArtist">
            <ion-list>
              <ion-item-sliding v-for="submission in submissions" :key="submission.submission_id">
                <ion-item button @click="viewSubmissionDetails(submission)">
                  <ion-avatar slot="start">
                    <img v-if="submission.playlist?.cover_image_url" :src="submission.playlist.cover_image_url" alt="Playlist" />
                    <ion-icon v-else :icon="musicalNotes" size="large"></ion-icon>
                  </ion-avatar>
                  <ion-label>
                    <h2>{{ submission.playlist?.name || 'Unnamed Playlist' }}</h2>
                    <h3>{{ submission.song?.title || 'Unknown Song' }}</h3>
                    <p>Submitted: {{ formatDate(submission.submitted_at) }}</p>
                  </ion-label>
                  <ion-badge :color="getStatusColor(submission.status)">
                    {{ formatStatus(submission.status) }}
                  </ion-badge>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="danger" @click="confirmDeleteSubmission(submission)">
                    Delete
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-list>
          </div>
          
          <!-- Playlist maker view of submissions -->
          <div v-else-if="isPlaylistMaker">
            <ion-list>
              <ion-item-sliding v-for="submission in submissions" :key="submission.submission_id">
                <ion-item button @click="viewSubmissionDetails(submission)">
                  <ion-avatar slot="start">
                    <img v-if="submission.song?.cover_image_url" :src="submission.song.cover_image_url" alt="Song" />
                    <ion-icon v-else :icon="musicalNote" size="large"></ion-icon>
                  </ion-avatar>
                  <ion-label>
                    <h2>{{ submission.song?.title || 'Unknown Song' }}</h2>
                    <h3>By: {{ submission.song?.artist_name_on_platform || submission.artist?.username || 'Unknown Artist' }}</h3>
                    <p>Submitted: {{ formatDate(submission.submitted_at) }}</p>
                  </ion-label>
                  <ion-badge :color="getStatusColor(submission.status)">
                    {{ formatStatus(submission.status) }}
                  </ion-badge>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="primary" @click="reviewSubmission(submission)">
                    Review
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-list>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="ion-padding ion-text-center" v-if="totalItems > pageSize">
          <ion-button 
            fill="clear" 
            size="small"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <ion-icon :icon="chevronBack" slot="icon-only"></ion-icon>
          </ion-button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <ion-button 
            fill="clear" 
            size="small"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <ion-icon :icon="chevronForward" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
      </div>
    </ion-content>
    
    <!-- New Submission Modal -->
    <ion-modal :is-open="showSubmissionModal" @didDismiss="showSubmissionModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Submit a Song</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showSubmissionModal = false">Cancel</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <form @submit.prevent="submitSong">
          <ion-list>
            <ion-item>
              <ion-label>Select Song</ion-label>
              <ion-select v-model="newSubmission.song_id" placeholder="Choose a song">
                <ion-select-option v-for="song in artistSongs" :key="song.song_id" :value="song.song_id">
                  {{ song.title }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <div v-if="errors.song_id" class="error-message">{{ errors.song_id }}</div>
            
            <ion-item>
              <ion-label>Select Playlist</ion-label>
              <ion-select v-model="newSubmission.playlist_id" placeholder="Choose a playlist">
                <ion-select-option v-for="playlist in availablePlaylists" :key="playlist.playlist_id" :value="playlist.playlist_id">
                  {{ playlist.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <div v-if="errors.playlist_id" class="error-message">{{ errors.playlist_id }}</div>
            
            <ion-item>
              <ion-label position="floating">Message (Optional)</ion-label>
              <ion-textarea v-model="newSubmission.submission_message" rows="3" placeholder="Add a message to the playlist curator"></ion-textarea>
            </ion-item>
            
            <div v-if="submissionError" class="ion-padding error-message">
              {{ submissionError }}
            </div>
            
            <div class="ion-padding">
              <ion-button expand="block" type="submit" :disabled="submitting">
                <ion-spinner v-if="submitting" name="dots"></ion-spinner>
                <span v-else>Submit Song</span>
              </ion-button>
            </div>
          </ion-list>
        </form>
      </ion-content>
    </ion-modal>
    
    <!-- Delete Confirmation Modal -->
    <ion-modal :is-open="showDeleteModal" @didDismiss="showDeleteModal = false">
      <div class="ion-padding">
        <h2>Delete Submission</h2>
        <p>Are you sure you want to delete this submission? This cannot be undone.</p>
        <div class="ion-text-right">
          <ion-button fill="clear" @click="showDeleteModal = false">Cancel</ion-button>
          <ion-button color="danger" @click="deleteSubmission">Delete</ion-button>
        </div>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonAvatar,
  IonBadge,
  IonSpinner,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  toastController
} from '@ionic/vue';
import { 
  add, 
  document, 
  musicalNote,
  musicalNotes,
  chevronBack, 
  chevronForward 
} from 'ionicons/icons';
import { useAuthStore } from '@/store/auth';
import { useApiStatus, usePagination, useFormValidation } from '@/composables/useUtils';
import PageHeader from '@/components/layout/PageHeader.vue';
import submissionService from '@/services/submission.service';
import songService from '@/services/song.service';
import playlistService from '@/services/playlist.service';
import type { Submission, SubmissionCreate, SubmissionStatus, Song, Playlist } from '@/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { loading, error, startLoading, stopLoading, setError, clearError } = useApiStatus();
const { page: currentPage, pageSize, total: totalItems, skip, totalPages, goToPage, setTotal, updateTotalPages } = usePagination(10);
const { errors, validateRequired, clearErrors, setError: setFormError } = useFormValidation();

const submissions = ref<Submission[]>([]);
const statusFilter = ref<string>('all');

// For new submission modal
const showSubmissionModal = ref(false);
const artistSongs = ref<Song[]>([]);
const availablePlaylists = ref<Playlist[]>([]);
const newSubmission = ref<SubmissionCreate>({
  artist_id: '',
  playlist_id: '',
  song_id: '',
  submission_message: ''
});
const submitting = ref(false);
const submissionError = ref('');

// For delete confirmation
const showDeleteModal = ref(false);
const selectedSubmission = ref<Submission | null>(null);

// Role based displays
const isArtist = computed(() => authStore.isArtist);
const isPlaylistMaker = computed(() => authStore.isPlaylistMaker);
const isAdmin = computed(() => authStore.isAdmin);

onMounted(() => {
  // Check for query parameters
  const songId = route.query.song_id as string;
  if (songId) {
    newSubmission.value.song_id = songId;
    openSubmissionModal();
  }
  
  loadSubmissions();
});

async function loadSubmissions() {
  try {
    startLoading();
    clearError();
    
    const userId = authStore.user?.user_id;
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    
    let response;
    
    if (isArtist.value) {
      response = await submissionService.getSubmissionsByArtist(
        userId,
        skip.value,
        pageSize.value
      );
    } else if (isPlaylistMaker.value) {
      // First get all playlists for the current playlist maker
      const playlistsResponse = await playlistService.getPlaylistsByCreator(userId);
      
      // For each playlist, fetch submissions and combine them
      let allSubmissions = [];
      for (const playlist of playlistsResponse.data) {
        const playlistSubmissionsResponse = await submissionService.getSubmissionsByPlaylist(playlist.playlist_id);
        allSubmissions.push(...playlistSubmissionsResponse.data);
      }
      
      // Simulate the full response structure
      response = {
        data: allSubmissions,
        count: allSubmissions.length,
        total: allSubmissions.length
      };
    } else {
      // Admin can see all submissions
      response = await submissionService.getSubmissions(
        skip.value,
        pageSize.value
      );
    }
    
    // Apply status filter if not "all"
    if (statusFilter.value !== 'all') {
      response.data = response.data.filter(s => s.status === statusFilter.value);
    }
    
    submissions.value = response.data;
    setTotal(response.total);
    updateTotalPages();
  } catch (err: any) {
    setError(err.message || 'Failed to load submissions');
    console.error('Error loading submissions:', err);
  } finally {
    stopLoading();
  }
}

async function openSubmissionModal() {
  showSubmissionModal.value = true;
  
  try {
    // Reset form
    submissionError.value = '';
    clearErrors();
    newSubmission.value.artist_id = authStore.user?.user_id || '';
    
    // Load artist's songs
    const songsResponse = await songService.getSongsByArtist(
      authStore.user?.user_id || '',
      0,
      100
    );
    artistSongs.value = songsResponse.data;
    
    // Load available playlists
    const playlistsResponse = await playlistService.getPlaylists(0, 100);
    availablePlaylists.value = playlistsResponse.data.filter(p => p.is_visible);
  } catch (err: any) {
    submissionError.value = 'Failed to load data for submission';
    console.error('Error preparing submission form:', err);
  }
}

async function submitSong() {
  clearErrors();
  submissionError.value = '';
  
  // Form validation
  let isValid = true;
  
  if (!validateRequired(newSubmission.value.song_id, 'song_id')) {
    setFormError('song_id', 'Please select a song');
    isValid = false;
  }
  
  if (!validateRequired(newSubmission.value.playlist_id, 'playlist_id')) {
    setFormError('playlist_id', 'Please select a playlist');
    isValid = false;
  }
  
  if (!isValid) return;
  
  submitting.value = true;
  
  try {
    await submissionService.createSubmission(newSubmission.value);
    
    // Close modal
    showSubmissionModal.value = false;
    
    // Show success toast
    const toast = await toastController.create({
      message: 'Song submitted successfully!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    
    // Refresh submissions list
    await loadSubmissions();
  } catch (err: any) {
    submissionError.value = err.message || 'Failed to submit song';
    console.error('Error submitting song:', err);
    
    const toast = await toastController.create({
      message: 'Failed to submit song',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    submitting.value = false;
  }
}

function viewSubmissionDetails(submission: Submission) {
  router.push(`/tabs/submissions/${submission.submission_id}`);
}

function reviewSubmission(submission: Submission) {
  router.push(`/tabs/submissions/${submission.submission_id}?review=true`);
}

function confirmDeleteSubmission(submission: Submission) {
  selectedSubmission.value = submission;
  showDeleteModal.value = true;
}

async function deleteSubmission() {
  if (!selectedSubmission.value) return;
  
  try {
    startLoading();
    await submissionService.deleteSubmission(selectedSubmission.value.submission_id);
    
    // Remove from local array
    submissions.value = submissions.value.filter(s => s.submission_id !== selectedSubmission.value?.submission_id);
    
    // Close modal
    showDeleteModal.value = false;
    selectedSubmission.value = null;
    
    // Show toast message
    const toast = await toastController.create({
      message: 'Submission deleted successfully',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    
    // Reload data if the page is now empty
    if (submissions.value.length === 0 && currentPage.value > 1) {
      goToPage(currentPage.value - 1);
      await loadSubmissions();
    }
  } catch (err: any) {
    const toast = await toastController.create({
      message: 'Failed to delete submission',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    console.error('Error deleting submission:', err);
  } finally {
    stopLoading();
  }
}

function handleFilterChange() {
  goToPage(1);
  loadSubmissions();
}

function formatStatus(status: SubmissionStatus): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'under_review': return 'In Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return 'Unknown';
  }
}

function getStatusColor(status: SubmissionStatus): string {
  switch (status) {
    case 'pending': return 'warning';
    case 'under_review': return 'medium';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    default: return 'medium';
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
</script>

<style scoped>
.error-message {
  color: var(--ion-color-danger);
  font-size: 12px;
  margin: 4px 16px;
}

ion-avatar {
  width: 48px;
  height: 48px;
}

ion-segment {
  margin-bottom: 16px;
}
</style>
