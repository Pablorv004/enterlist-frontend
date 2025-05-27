// filepath: src/components/ImportSongsModal.vue
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Import Songs</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="dismiss">
          <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
    <ion-toolbar>
      <ion-segment v-model="selectedPlatform" @ionChange="handlePlatformChange">
        <ion-segment-button v-if="hasSpotifyAccount" value="spotify">
          <ion-label>Spotify</ion-label>
        </ion-segment-button>
        <ion-segment-button v-if="hasYouTubeAccount" value="youtube">
          <ion-label>YouTube</ion-label>
        </ion-segment-button>
      </ion-segment>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ion-spinner name="crescent"></ion-spinner>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- Connect Account Message -->
    <div v-else-if="!hasSpotifyAccount && !hasYouTubeAccount" class="connect-prompt">
      <ion-icon :icon="linkIcon" class="connect-icon"></ion-icon>
      <h2>Connect an Account First</h2>
      <p>Please connect a Spotify or YouTube account to import songs.</p>
      <ion-button expand="block" router-link="/artist/linked-accounts" @click="dismiss">
        Connect Accounts
      </ion-button>
    </div>

    <!-- Spotify Content -->
    <div v-else-if="selectedPlatform === 'spotify'">
      <!-- Spotify Tracks -->
      <div v-if="spotifyTracks.length > 0" class="tracks-container">
        <ion-list>
          <ion-list-header>
            <ion-label>Select Tracks to Import</ion-label>
            <ion-button fill="clear" size="small" @click="toggleSelectAllTracks">
              {{ allTracksSelected ? 'Deselect All' : 'Select All' }}
            </ion-button>
          </ion-list-header>

          <ion-item v-for="track in spotifyTracks" :key="track.id" class="track-item">
            <ion-checkbox slot="start" v-model="selectedTracks[track.id]"></ion-checkbox>
            <ion-thumbnail slot="start">
              <img :src="track.album.images[0]?.url || ''" alt="Album cover" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ track.name }}</h2>
              <p>{{ track.artists.map(artist => artist.name).join(', ') }}</p>
              <p>{{ track.album.name }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- No Spotify Tracks Message -->
      <div v-else-if="!loading" class="empty-state">
        <ion-icon :icon="musicalNotesIcon" class="empty-icon"></ion-icon>
        <h2>No Tracks Found</h2>
        <p>We couldn't find any tracks in your Spotify account.</p>
      </div>
    </div>

    <!-- YouTube Content -->
    <div v-else-if="selectedPlatform === 'youtube'">
      <!-- YouTube Videos -->
      <div v-if="youtubeVideos.length > 0" class="videos-container">
        <ion-list>
          <ion-list-header>
            <ion-label>Select Videos to Import</ion-label>
            <ion-button fill="clear" size="small" @click="toggleSelectAllVideos">
              {{ allVideosSelected ? 'Deselect All' : 'Select All' }}
            </ion-button>
          </ion-list-header>

          <ion-item v-for="video in youtubeVideos" :key="video.id" class="video-item">
            <ion-checkbox slot="start" v-model="selectedVideos[video.id]"></ion-checkbox>
            <ion-thumbnail slot="start">
              <img :src="video.snippet.thumbnails.medium.url || ''" alt="Video thumbnail" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ video.snippet.title }}</h2>
              <p>{{ video.snippet.channelTitle }}</p>
              <p>{{ formatDate(video.snippet.publishedAt) }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- No YouTube Videos Message -->
      <div v-else-if="!loading" class="empty-state">
        <ion-icon :icon="videocamIcon" class="empty-icon"></ion-icon>
        <h2>No Videos Found</h2>
        <p>We couldn't find any videos in your YouTube account.</p>
      </div>
    </div>
  </ion-content>

  <ion-footer>
    <ion-toolbar>
      <div class="footer-content">
        <div class="selected-count">
          <span v-if="selectedPlatform === 'spotify'">
            {{ selectedTrackCount }} tracks selected
          </span>
          <span v-else-if="selectedPlatform === 'youtube'">
            {{ selectedVideoCount }} videos selected
          </span>
        </div>

        <ion-button expand="block" :disabled="!canImport" @click="importSelected">
          Import Selected
        </ion-button>
      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonListHeader,
  IonItem,
  IonThumbnail,
  IonCheckbox,
  IonSpinner,
  IonFooter,
  modalController,
  toastController
} from '@ionic/vue';
import {
  closeOutline as closeIcon,
  link as linkIcon,
  musicalNotes as musicalNotesIcon,
  videocam as videocamIcon
} from 'ionicons/icons';
import { SpotifyService, SpotifyTrack } from '@/services/SpotifyService';
import { YouTubeService, YouTubeVideo } from '@/services/YouTubeService';
import { PlatformService } from '@/services/PlatformService';
import { useAuthStore } from '@/store';
import { formatDate } from '@/utils';
import { LinkedAccount, Platform } from '@/types';

export default defineComponent({
  name: 'ImportSongsModal',
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonListHeader,
    IonItem,
    IonThumbnail,
    IonCheckbox,
    IonSpinner,
    IonFooter
  },  setup() {
    const authStore = useAuthStore();
    const userId = computed(() => authStore.user?.user_id || '');

    const loading = ref(false);
    const loadingMessage = ref('Loading your content...');
    
    const selectedPlatform = ref('');
    const platforms = ref<Platform[]>([]);
    const linkedAccounts = ref<LinkedAccount[]>([]);
    
    // Component state tracking
    const isComponentMounted = ref(false);
    
    // Spotify data
    const spotifyTracks = ref<SpotifyTrack[]>([]);
    const selectedTracks = ref<Record<string, boolean>>({});

    // YouTube data
    const youtubeVideos = ref<YouTubeVideo[]>([]);
    const selectedVideos = ref<Record<string, boolean>>({});

    // Computed properties for platform availability
    const hasSpotifyAccount = computed(() => {
      return linkedAccounts.value.some(account => 
        platforms.value.some(p => 
          p.platform_id === account.platform_id && 
          p.name.toLowerCase().includes('spotify')
        )
      );
    });

    const hasYouTubeAccount = computed(() => {
      return linkedAccounts.value.some(account => 
        platforms.value.some(p => 
          p.platform_id === account.platform_id && 
          p.name.toLowerCase().includes('youtube')
        )
      );
    });    // Set default platform based on available accounts
    const stopWatcher = watch([hasSpotifyAccount, hasYouTubeAccount], () => {
      if (!isComponentMounted.value) return;
      
      if (selectedPlatform.value === '') {
        if (hasSpotifyAccount.value) {
          selectedPlatform.value = 'spotify';
          // Auto-load content for the default platform
          loadSpotifyContent();
        } else if (hasYouTubeAccount.value) {
          selectedPlatform.value = 'youtube';
          // Auto-load content for the default platform
          loadYoutubeContent();
        }
      }
    });

    // Computed properties for selection counts
    const selectedTrackCount = computed(() => {
      return Object.values(selectedTracks.value).filter(selected => selected).length;
    });

    const selectedVideoCount = computed(() => {
      return Object.values(selectedVideos.value).filter(selected => selected).length;
    });

    const allTracksSelected = computed(() => {
      return spotifyTracks.value.length > 0 && 
        spotifyTracks.value.every(track => selectedTracks.value[track.id]);
    });

    const allVideosSelected = computed(() => {
      return youtubeVideos.value.length > 0 && 
        youtubeVideos.value.every(video => selectedVideos.value[video.id]);
    });

    const canImport = computed(() => {
      return (selectedPlatform.value === 'spotify' && selectedTrackCount.value > 0) ||
        (selectedPlatform.value === 'youtube' && selectedVideoCount.value > 0);
    });

    // Handle platform change
    const handlePlatformChange = () => {
      if (selectedPlatform.value === 'spotify' && spotifyTracks.value.length === 0) {
        loadSpotifyContent();
      } else if (selectedPlatform.value === 'youtube' && youtubeVideos.value.length === 0) {
        loadYoutubeContent();
      }
    };

    // Toggle selection helpers
    const toggleSelectAllTracks = () => {
      const newValue = !allTracksSelected.value;
      spotifyTracks.value.forEach(track => {
        selectedTracks.value[track.id] = newValue;
      });
    };

    const toggleSelectAllVideos = () => {
      const newValue = !allVideosSelected.value;
      youtubeVideos.value.forEach(video => {
        selectedVideos.value[video.id] = newValue;
      });
    };    // Load platform data
    const loadPlatforms = async () => {
      if (!isComponentMounted.value) return;
      
      try {
        platforms.value = await PlatformService.getPlatforms();
      } catch (error) {
        if (isComponentMounted.value) {
          showToast('Failed to load platforms', 'danger');
        }
      }
    };

    const loadLinkedAccounts = async () => {
      if (!isComponentMounted.value) return;
      
      try {
        linkedAccounts.value = await PlatformService.getLinkedAccounts(userId.value);
      } catch (error) {
        if (isComponentMounted.value) {
          showToast('Failed to load linked accounts', 'danger');
        }
      }
    };const loadSpotifyContent = async () => {
      if (!isComponentMounted.value) return;
      
      loading.value = true;
      loadingMessage.value = 'Loading your Spotify content...';

      try {
        const tracks = await SpotifyService.getTracks();

        if (!isComponentMounted.value) return; // Check again after async operation

        spotifyTracks.value = tracks;

        // Initialize selection objects
        spotifyTracks.value.forEach(track => {
          selectedTracks.value[track.id] = false;
        });
      } catch (error) {
        if (!isComponentMounted.value) return;
        
        console.error('Error loading Spotify content:', error);
        showToast('Failed to load your Spotify content', 'danger');
      } finally {
        if (isComponentMounted.value) {
          loading.value = false;
        }
      }
    };

    const loadYoutubeContent = async () => {
      if (!isComponentMounted.value) return;
      
      loading.value = true;
      loadingMessage.value = 'Loading your YouTube content...';

      try {
        const videos = await YouTubeService.getVideos();
        
        if (!isComponentMounted.value) return; // Check again after async operation
        
        youtubeVideos.value = videos;

        // Initialize selection object
        youtubeVideos.value.forEach(video => {
          selectedVideos.value[video.id] = false;
        });
      } catch (error) {
        if (!isComponentMounted.value) return;
        
        console.error('Error loading YouTube content:', error);
        showToast('Failed to load your YouTube videos', 'danger');
      } finally {
        if (isComponentMounted.value) {
          loading.value = false;
        }
      }
    };    // Import selected content
    const importSelected = async () => {
      if (!isComponentMounted.value) return;
      
      loading.value = true;
      
      try {
        if (selectedPlatform.value === 'spotify') {
          loadingMessage.value = 'Importing your Spotify content...';
          
          const selectedTrackIds = Object.keys(selectedTracks.value)
            .filter(id => selectedTracks.value[id])
            .map(id => id.toString());
          
          if (selectedTrackIds.length > 0) {
            await SpotifyService.importTracks(selectedTrackIds);
          }
          
          if (isComponentMounted.value) {
            showToast(`Successfully imported ${selectedTrackIds.length} tracks from Spotify`, 'success');
          }
        } 
        else if (selectedPlatform.value === 'youtube') {
          loadingMessage.value = 'Importing your YouTube content...';
          
          const selectedVideoIds = Object.keys(selectedVideos.value)
            .filter(id => selectedVideos.value[id])
            .map(id => id.toString());
          
          if (selectedVideoIds.length > 0) {
            await YouTubeService.importVideos(selectedVideoIds);
          }
          
          if (isComponentMounted.value) {
            showToast(`Successfully imported ${selectedVideoIds.length} videos from YouTube`, 'success');
          }
        }
        
        // Close modal after successful import
        if (isComponentMounted.value) {
          dismiss(true);
        }
      } catch (error) {
        if (isComponentMounted.value) {
          console.error('Error importing content:', error);
          showToast('Failed to import content', 'danger');
        }
      } finally {
        if (isComponentMounted.value) {
          loading.value = false;
        }
      }
    };

    // Toast helper
    const showToast = async (message: string, color: string = 'primary') => {
      const toast = await toastController.create({
        message,
        duration: 3000,
        color
      });

      await toast.present();
    };

    // Dismiss modal
    const dismiss = (dataRefreshed = false) => {
      modalController.dismiss({
        dismissed: true,
        dataRefreshed
      });
    };    onMounted(async () => {
      isComponentMounted.value = true;
      loading.value = true;
      
      try {
        await Promise.all([
          loadPlatforms(),
          loadLinkedAccounts()
        ]);
      } finally {
        if (isComponentMounted.value) {
          loading.value = false;
        }
      }
    });

    onUnmounted(() => {
      isComponentMounted.value = false;
      // Stop the watcher
      if (stopWatcher) {
        stopWatcher();
      }
    });

    return {
      loading,
      loadingMessage,
      selectedPlatform,
      spotifyTracks,
      youtubeVideos,
      selectedTracks,
      selectedVideos,
      hasSpotifyAccount,
      hasYouTubeAccount,
      selectedTrackCount,
      selectedVideoCount,
      allTracksSelected,
      allVideosSelected,
      canImport,
      // Methods
      handlePlatformChange,
      toggleSelectAllTracks,
      toggleSelectAllVideos,
      importSelected,
      dismiss,
      formatDate,
      // Icons
      closeIcon,
      linkIcon,
      musicalNotesIcon,
      videocamIcon
    };
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.connect-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 2rem;
}

.connect-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--ion-color-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--ion-color-medium);
}

.tracks-container,
.videos-container {
  margin-bottom: 1rem;
}

.track-item,
.video-item {
  --padding-start: 0;
}

ion-thumbnail {
  --size: 60px;
  margin: 0 16px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
}

.selected-count {
  text-align: center;
  margin-bottom: 8px;
  color: var(--ion-color-medium);
}

ion-segment-button {
  --background-checked: var(--ion-color-primary);
  --color-checked: white;
  --indicator-color: var(--ion-color-primary);
}

ion-label h2 {
  text-align: left;
}

ion-label p {
  text-align: left;
}
</style>
