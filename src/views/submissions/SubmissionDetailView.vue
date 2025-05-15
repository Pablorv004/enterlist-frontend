<template>
  <ion-page>
    <page-header 
      title="Submission Details" 
      :showBackButton="true"
      backHref="/tabs/submissions"
    ></page-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Submission Details</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <div class="ion-padding">
        <div v-if="loading" class="ion-text-center">
          <ion-spinner></ion-spinner>
          <p>Loading submission details...</p>
        </div>
        
        <div v-else-if="error" class="ion-padding ion-text-center error-message">
          <p>{{ error }}</p>
          <ion-button @click="loadSubmission">Retry</ion-button>
        </div>
        
        <div v-else-if="!submission" class="ion-padding ion-text-center">
          <p>Submission not found</p>
          <ion-button router-link="/tabs/submissions">Back to Submissions</ion-button>
        </div>
        
        <div v-else>
          <ion-card>
            <ion-card-header>
              <ion-badge :color="getStatusColor(submission.status)" class="status-badge">
                {{ formatStatus(submission.status) }}
              </ion-badge>
              <ion-card-title>Submission Overview</ion-card-title>
              <ion-card-subtitle>Submitted on {{ formatDate(submission.submitted_at) }}</ion-card-subtitle>
            </ion-card-header>
            
            <ion-card-content>
              <div v-if="submission.submission_message" class="message-container">
                <h4>Message from Artist</h4>
                <p>{{ submission.submission_message }}</p>
              </div>
              
              <div v-if="submission.review_feedback" class="message-container">
                <h4>Curator Feedback</h4>
                <p>{{ submission.review_feedback }}</p>
                <p v-if="submission.reviewed_at" class="reviewed-date">
                  Reviewed on {{ formatDate(submission.reviewed_at) }}
                </p>
              </div>
            </ion-card-content>
          </ion-card>
          
          <!-- Song Info -->
          <ion-card v-if="submission.song">
            <ion-img v-if="submission.song.cover_image_url" :src="submission.song.cover_image_url"></ion-img>
            <ion-card-header>
              <ion-card-subtitle>Song</ion-card-subtitle>
              <ion-card-title>{{ submission.song.title }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Artist:</strong> {{ submission.song.artist_name_on_platform }}</p>
              <p v-if="submission.song.album_name"><strong>Album:</strong> {{ submission.song.album_name }}</p>
              <p v-if="submission.song.duration_ms"><strong>Duration:</strong> {{ formatDuration(submission.song.duration_ms) }}</p>
              
              <ion-button v-if="submission.song.url" expand="block" fill="outline" @click="openSongUrl(submission.song.url)">
                <ion-icon :icon="musicalNotes" slot="start"></ion-icon>
                Listen to Song
              </ion-button>
            </ion-card-content>
          </ion-card>
          
          <!-- Playlist Info -->
          <ion-card v-if="submission.playlist">
            <ion-img v-if="submission.playlist.cover_image_url" :src="submission.playlist.cover_image_url"></ion-img>
            <ion-card-header>
              <ion-card-subtitle>Playlist</ion-card-subtitle>
              <ion-card-title>{{ submission.playlist.name }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p v-if="submission.playlist.description">{{ submission.playlist.description }}</p>
              <p v-if="submission.playlist.genre"><strong>Genre:</strong> {{ submission.playlist.genre }}</p>
              <p v-if="submission.playlist.follower_count"><strong>Followers:</strong> {{ formatFollowers(submission.playlist.follower_count) }}</p>
              
              <ion-button v-if="submission.playlist.url" expand="block" fill="outline" @click="openPlaylistUrl(submission.playlist.url)">
                <ion-icon :icon="list" slot="start"></ion-icon>
                View Playlist
              </ion-button>
            </ion-card-content>
          </ion-card>
          
          <!-- Review Actions for Playlist Curators -->
          <ion-card v-if="isPlaylistMaker || isAdmin">
            <ion-card-header>
              <ion-card-title>Review This Submission</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item>
                <ion-label>Status</ion-label>
                <ion-select v-model="reviewForm.status" interface="action-sheet">
                  <ion-select-option value="pending">Pending</ion-select-option>
                  <ion-select-option value="under_review">Under Review</ion-select-option>
                  <ion-select-option value="approved">Approved</ion-select-option>
                  <ion-select-option value="rejected">Rejected</ion-select-option>
                </ion-select>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">Feedback (Optional)</ion-label>
                <ion-textarea v-model="reviewForm.review_feedback" rows="3" placeholder="Add feedback for the artist"></ion-textarea>
              </ion-item>
              
              <div class="ion-padding">
                <ion-button expand="block" @click="submitReview" :disabled="saving">
                  <ion-spinner v-if="saving" name="dots"></ion-spinner>
                  <span v-else>Submit Review</span>
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
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
  IonCard,
  IonImg,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonSpinner,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  toastController
} from '@ionic/vue';
import { 
  musicalNotes, 
  list
} from 'ionicons/icons';
import { useAuthStore } from '@/store/auth';
import { useApiStatus } from '@/composables/useUtils';
import PageHeader from '@/components/layout/PageHeader.vue';
import submissionService from '@/services/submission.service';
import type { Submission, SubmissionUpdate, SubmissionStatus } from '@/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { loading, error, startLoading, stopLoading, setError, clearError } = useApiStatus();

const submissionId = computed(() => route.params.id as string);
const submission = ref<Submission | null>(null);
const saving = ref(false);

// Review form for playlist makers
const reviewForm = ref<SubmissionUpdate>({
  status: 'pending',
  review_feedback: '',
  reviewed_at: new Date().toISOString()
});

// Role based displays
const isArtist = computed(() => authStore.isArtist);
const isPlaylistMaker = computed(() => authStore.isPlaylistMaker);
const isAdmin = computed(() => authStore.isAdmin);

onMounted(() => {
  loadSubmission();
  
  // If review query param is set, scroll to review section
  if (route.query.review === 'true') {
    setTimeout(() => {
      document.querySelector('.review-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }
});

async function loadSubmission() {
  if (!submissionId.value) return;
  
  try {
    startLoading();
    clearError();
    
    const response = await submissionService.getSubmissionById(submissionId.value);
    submission.value = response;
    
    // Set review form to current values
    if (response) {
      reviewForm.value.status = response.status;
      reviewForm.value.review_feedback = response.review_feedback || '';
    }
  } catch (err: any) {
    setError(err.message || 'Failed to load submission');
    console.error('Error loading submission:', err);
  } finally {
    stopLoading();
  }
}

async function submitReview() {
  if (!submission.value) return;
  
  saving.value = true;
  
  try {
    // Update the review date
    reviewForm.value.reviewed_at = new Date().toISOString();
    
    await submissionService.updateSubmission(
      submissionId.value,
      reviewForm.value
    );
    
    // Update local submission
    if (submission.value) {
      submission.value.status = reviewForm.value.status;
      submission.value.review_feedback = reviewForm.value.review_feedback;
      submission.value.reviewed_at = reviewForm.value.reviewed_at;
    }
    
    // Show success toast
    const toast = await toastController.create({
      message: 'Review submitted successfully',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  } catch (err: any) {
    const toast = await toastController.create({
      message: 'Failed to submit review',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    console.error('Error submitting review:', err);
  } finally {
    saving.value = false;
  }
}

function openSongUrl(url: string) {
  window.open(url, '_blank');
}

function openPlaylistUrl(url: string) {
  window.open(url, '_blank');
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDuration(durationMs?: number): string {
  if (!durationMs) return '0:00';
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatFollowers(count?: number): string {
  if (!count) return '0 followers';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M followers`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K followers`;
  }
  return `${count} followers`;
}
</script>

<style scoped>
.error-message {
  color: var(--ion-color-danger);
}

.status-badge {
  margin-bottom: 10px;
  font-size: 1rem;
  padding: 8px 12px;
}

.message-container {
  border-left: 3px solid var(--ion-color-medium);
  padding: 8px 16px;
  margin: 12px 0;
  background-color: var(--ion-color-light);
}

.reviewed-date {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  text-align: right;
  margin-top: 8px;
}
</style>
