// filepath: src/components/ImportPlaylistsModal.vue
<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Import Playlists</ion-title>
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
      <p>Please connect a Spotify or YouTube account to import playlists.</p>
      <ion-button expand="block" router-link="/playlist-maker/linked-accounts" @click="dismiss">
        Connect Accounts
      </ion-button>
    </div>

    <!-- Spotify Content -->
    <div v-else-if="selectedPlatform === 'spotify'">
      <!-- Spotify Playlists -->
      <div v-if="spotifyPlaylists.length > 0" class="playlists-container">
        <ion-list>
          <ion-list-header>
            <ion-label>Select Playlists to Import</ion-label>
            <ion-button fill="clear" size="small" @click="toggleSelectAllSpotifyPlaylists">
              {{ allSpotifyPlaylistsSelected ? 'Deselect All' : 'Select All' }}
            </ion-button>
          </ion-list-header>

          <ion-item v-for="playlist in spotifyPlaylists" :key="playlist.id" class="playlist-item">
            <ion-checkbox slot="start" v-model="selectedSpotifyPlaylists[playlist.id]"></ion-checkbox>
            <ion-thumbnail slot="start">
              <img :src="playlist.images[0]?.url || ''" alt="Playlist cover" />
            </ion-thumbnail>            <ion-label>
              <h2>{{ playlist.name }}</h2>
              <p>{{ playlist.tracks.total }} tracks</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- No Spotify Playlists Message -->
      <div v-else-if="!loading" class="empty-state">
        <ion-icon :icon="musicalNotesIcon" class="empty-icon"></ion-icon>
        <h2>No Playlists Found</h2>
        <p>We couldn't find any playlists in your Spotify account.</p>
      </div>
    </div>

    <!-- YouTube Content -->
    <div v-else-if="selectedPlatform === 'youtube'">
      <!-- YouTube Playlists -->
      <div v-if="youtubePlaylists.length > 0" class="playlists-container">
        <ion-list>
          <ion-list-header>
            <ion-label>Select Playlists to Import</ion-label>
            <ion-button fill="clear" size="small" @click="toggleSelectAllYoutubePlaylists">
              {{ allYoutubePlaylistsSelected ? 'Deselect All' : 'Select All' }}
            </ion-button>
          </ion-list-header>

          <ion-item v-for="playlist in youtubePlaylists" :key="playlist.id" class="playlist-item">
            <ion-checkbox slot="start" v-model="selectedYoutubePlaylists[playlist.id]"></ion-checkbox>
            <ion-thumbnail slot="start">
              <img :src="playlist.snippet.thumbnails.medium.url || ''" alt="Playlist thumbnail" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ playlist.snippet.title }}</h2>
              <p>{{ playlist.contentDetails.itemCount }} videos</p>
              <p>by {{ playlist.snippet.channelTitle }}</p>
              <p>{{ formatDate(playlist.snippet.publishedAt) }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- No YouTube Playlists Message -->
      <div v-else-if="!loading" class="empty-state">
        <ion-icon :icon="videocamIcon" class="empty-icon"></ion-icon>
        <h2>No Playlists Found</h2>
        <p>We couldn't find any playlists in your YouTube account.</p>
      </div>
    </div>
  </ion-content>

  <ion-footer>
    <ion-toolbar>
      <div class="footer-content">
        <div class="selected-count">
          <span v-if="selectedPlatform === 'spotify'">
            {{ selectedSpotifyPlaylistCount }} playlists selected
          </span>
          <span v-else-if="selectedPlatform === 'youtube'">
            {{ selectedYoutubePlaylistCount }} playlists selected
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
import { SpotifyService, SpotifyPlaylist } from '@/services/SpotifyService';
import { YouTubeService, YouTubePlaylist } from '@/services/YouTubeService';
import { PlatformService } from '@/services/PlatformService';
import { useAuthStore } from '@/store';
import { formatDate } from '@/utils';
import { LinkedAccount, Platform } from '@/types';

export default defineComponent({
  name: 'ImportPlaylistsModal',
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
    const dataLoaded = ref(false);
    const spotifyDataLoaded = ref(false);
    const youtubeDataLoaded = ref(false);
    
    // Spotify data
    const spotifyPlaylists = ref<SpotifyPlaylist[]>([]);
    const selectedSpotifyPlaylists = ref<Record<string, boolean>>({});

    // YouTube data
    const youtubePlaylists = ref<YouTubePlaylist[]>([]);
    const selectedYoutubePlaylists = ref<Record<string, boolean>>({});

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
    });

    // Computed property to determine if we should show loading
    const shouldShowLoading = computed(() => {
      // Always show loading if initial data isn't loaded
      if (!dataLoaded.value) return true;
      
      // Show loading if platform is selected but data isn't loaded for that platform
      if (selectedPlatform.value === 'spotify' && !spotifyDataLoaded.value) return true;
      if (selectedPlatform.value === 'youtube' && !youtubeDataLoaded.value) return true;
      
      // Show loading during import process
      return loading.value;
    });

    // Set default platform based on available accounts
    const stopWatcher = watch([hasSpotifyAccount, hasYouTubeAccount, dataLoaded], () => {
      if (!isComponentMounted.value || !dataLoaded.value) return;
      
      if (selectedPlatform.value === '') {
        if (hasSpotifyAccount.value) {
          selectedPlatform.value = 'spotify';
          loadSpotifyPlaylists();
        } else if (hasYouTubeAccount.value) {
          selectedPlatform.value = 'youtube';
          loadYoutubePlaylists();
        }
      }
    }, { immediate: true });

    // Computed properties for selection counts
    const selectedSpotifyPlaylistCount = computed(() => {
      return Object.values(selectedSpotifyPlaylists.value).filter(selected => selected).length;
    });

    const selectedYoutubePlaylistCount = computed(() => {
      return Object.values(selectedYoutubePlaylists.value).filter(selected => selected).length;
    });

    const allSpotifyPlaylistsSelected = computed(() => {
      return spotifyPlaylists.value.length > 0 && 
        spotifyPlaylists.value.every(playlist => selectedSpotifyPlaylists.value[playlist.id]);
    });

    const allYoutubePlaylistsSelected = computed(() => {
      return youtubePlaylists.value.length > 0 && 
        youtubePlaylists.value.every(playlist => selectedYoutubePlaylists.value[playlist.id]);
    });

    const canImport = computed(() => {
      return (selectedPlatform.value === 'spotify' && selectedSpotifyPlaylistCount.value > 0) ||
        (selectedPlatform.value === 'youtube' && selectedYoutubePlaylistCount.value > 0);
    });

    // Handle platform change
    const handlePlatformChange = () => {
      if (selectedPlatform.value === 'spotify' && !spotifyDataLoaded.value) {
        loadSpotifyPlaylists();
      } else if (selectedPlatform.value === 'youtube' && !youtubeDataLoaded.value) {
        loadYoutubePlaylists();
      }
    };

    // Toggle selection helpers
    const toggleSelectAllSpotifyPlaylists = () => {
      const newValue = !allSpotifyPlaylistsSelected.value;
      spotifyPlaylists.value.forEach(playlist => {
        selectedSpotifyPlaylists.value[playlist.id] = newValue;
      });
    };

    const toggleSelectAllYoutubePlaylists = () => {
      const newValue = !allYoutubePlaylistsSelected.value;
      youtubePlaylists.value.forEach(playlist => {
        selectedYoutubePlaylists.value[playlist.id] = newValue;
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
    };const loadSpotifyPlaylists = async () => {
      if (!isComponentMounted.value) return;
      
      loadingMessage.value = 'Loading your Spotify playlists...';

      try {
        const playlists = await SpotifyService.getPlaylists();
        
        if (!isComponentMounted.value) return;
        
        spotifyPlaylists.value = playlists;

        // Initialize selection object
        spotifyPlaylists.value.forEach(playlist => {
          selectedSpotifyPlaylists.value[playlist.id] = false;
        });
        
        spotifyDataLoaded.value = true;
      } catch (error) {
        if (!isComponentMounted.value) return;
        
        console.error('Error loading Spotify playlists:', error);
        showToast('Failed to load your Spotify playlists', 'danger');
      }
    };

    const loadYoutubePlaylists = async () => {
      if (!isComponentMounted.value) return;
      
      loadingMessage.value = 'Loading your YouTube playlists...';

      try {
        const playlists = await YouTubeService.getPlaylists();
        
        if (!isComponentMounted.value) return;
        
        youtubePlaylists.value = playlists;

        // Initialize selection object
        youtubePlaylists.value.forEach(playlist => {
          selectedYoutubePlaylists.value[playlist.id] = false;
        });
        
        youtubeDataLoaded.value = true;
      } catch (error) {
        if (!isComponentMounted.value) return;
        
        console.error('Error loading YouTube playlists:', error);
        showToast('Failed to load your YouTube playlists', 'danger');
      }
    };    // Import selected content
    const importSelected = async () => {
      if (!isComponentMounted.value) return;
      
      loading.value = true;
      
      try {
        if (selectedPlatform.value === 'spotify') {
          loadingMessage.value = 'Importing your Spotify playlists...';
          
          const selectedPlaylistIds = Object.keys(selectedSpotifyPlaylists.value)
            .filter(id => selectedSpotifyPlaylists.value[id]);
            if (selectedPlaylistIds.length > 0) {
            const result = await SpotifyService.importPlaylists(selectedPlaylistIds);
            
            if (isComponentMounted.value) {
              // Show detailed results
              let message = '';
              let color = 'success';
              
              if (result.imported && result.imported.length > 0) {
                message += `Successfully imported ${result.imported.length} new playlist(s). `;
              }
              
              if (result.updated && result.updated.length > 0) {
                message += `Updated ${result.updated.length} existing playlist(s). `;
              }
              
              if (result.failed && result.failed.length > 0) {
                color = 'warning';
                message += `${result.failed.length} playlist(s) failed to import. `;
                
                // Show details about failed imports
                const failedDetails = result.failed.map((f: any) => `${f.name || f.id}: ${f.reason || 'Unknown error'}`).join('\n');
                console.warn('Failed playlist imports:', failedDetails);
                
                // Show detailed error for conflict issues
                if (result.failed.some((f: any) => f.reason && f.reason.includes('already registered'))) {
                  showToast('Some playlists are already owned by other users. Check console for details.', 'danger');
                  return;
                }
              }
              
              if (!message) {
                message = 'No playlists were processed.';
                color = 'warning';
              }
              
              showToast(message.trim(), color);
            }
          }
        } 
        else if (selectedPlatform.value === 'youtube') {
          loadingMessage.value = 'Importing your YouTube playlists...';
          
          const selectedPlaylistIds = Object.keys(selectedYoutubePlaylists.value)
            .filter(id => selectedYoutubePlaylists.value[id]);
            if (selectedPlaylistIds.length > 0) {
            const result = await YouTubeService.importPlaylists(selectedPlaylistIds);
            
            if (isComponentMounted.value) {
              // Show detailed results
              let message = '';
              let color = 'success';
              
              if (result.imported && result.imported.length > 0) {
                message += `Successfully imported ${result.imported.length} new playlist(s). `;
              }
              
              if (result.updated && result.updated.length > 0) {
                message += `Updated ${result.updated.length} existing playlist(s). `;
              }
              
              if (result.failed && result.failed.length > 0) {
                color = 'warning';
                message += `${result.failed.length} playlist(s) failed to import. `;
                
                // Show details about failed imports
                const failedDetails = result.failed.map((f: any) => `${f.name || f.id}: ${f.reason || 'Unknown error'}`).join('\n');
                console.warn('Failed playlist imports:', failedDetails);
                
                // Show detailed error for conflict issues
                if (result.failed.some((f: any) => f.reason && f.reason.includes('already registered'))) {
                  showToast('Some playlists are already owned by other users. Check console for details.', 'danger');
                  return;
                }
              }
              
              if (!message) {
                message = 'No playlists were processed.';
                color = 'warning';
              }
              
              showToast(message.trim(), color);
            }
          }
        }
        
        // Close modal after successful import
        if (isComponentMounted.value) {
          dismiss(true);
        }
      } catch (error: any) {
        if (isComponentMounted.value) {
          console.error('Error importing playlists:', error);
          
          // Handle specific error types
          if (error.response?.status === 409) {
            // Conflict error - show the detailed message from backend
            const errorMessage = error.response.data?.message || 'Content already exists and belongs to another user.';
            showToast(errorMessage, 'danger');
          } else {
            showToast('Failed to import playlists. Please try again.', 'danger');
          }
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
      loadingMessage.value = 'Loading your content...';
      
      try {
        await Promise.all([
          loadPlatforms(),
          loadLinkedAccounts()
        ]);
        
        dataLoaded.value = true;
        
        // Trigger platform selection immediately after data is loaded
        if (selectedPlatform.value === '') {
          if (hasSpotifyAccount.value) {
            selectedPlatform.value = 'spotify';
            loadSpotifyPlaylists();
          } else if (hasYouTubeAccount.value) {
            selectedPlatform.value = 'youtube';
            loadYoutubePlaylists();
          }
        }
      } finally {
        // Don't set loading to false here - let shouldShowLoading handle it
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
      loading: shouldShowLoading,
      loadingMessage,
      selectedPlatform,
      spotifyPlaylists,
      youtubePlaylists,
      selectedSpotifyPlaylists,
      selectedYoutubePlaylists,
      hasSpotifyAccount,
      hasYouTubeAccount,
      selectedSpotifyPlaylistCount,
      selectedYoutubePlaylistCount,
      allSpotifyPlaylistsSelected,
      allYoutubePlaylistsSelected,
      canImport,
      // Methods
      handlePlatformChange,
      toggleSelectAllSpotifyPlaylists,
      toggleSelectAllYoutubePlaylists,
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

.playlists-container {
  margin-bottom: 1rem;
}

.playlist-item {
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
