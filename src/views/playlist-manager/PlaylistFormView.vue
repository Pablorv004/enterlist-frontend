<template>
    <ion-page>
        <page-header :title="isEdit ? 'Edit Playlist' : 'Add New Playlist'" :showBackButton="true"
            backHref="/tabs/playlists"></page-header>

        <ion-content :fullscreen="true" class="bg-playlist">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">{{ isEdit ? 'Edit Playlist' : 'Add New Playlist' }}</ion-title>
                </ion-toolbar>
            </ion-header>

            <div class="ion-padding">
                <div v-if="loading" class="ion-text-center">
                    <ion-spinner></ion-spinner>
                    <p>{{ isEdit ? 'Loading playlist...' : 'Preparing form...' }}</p>
                </div>

                <form v-else @submit.prevent="savePlaylist">
                    <ion-list lines="full">
                        <ion-item>
                            <ion-label position="floating">Playlist Name *</ion-label>
                            <ion-input v-model="form.name" required></ion-input>
                        </ion-item>
                        <div v-if="errors.name" class="error-message">{{ errors.name }}</div>

                        <ion-item>
                            <ion-label position="floating">Description</ion-label>
                            <ion-textarea v-model="form.description" rows="3"></ion-textarea>
                        </ion-item>

                        <ion-item>
                            <ion-label position="floating">Playlist URL *</ion-label>
                            <ion-input v-model="form.url" required></ion-input>
                        </ion-item>
                        <div v-if="errors.url" class="error-message">{{ errors.url }}</div>

                        <ion-item>
                            <ion-label position="floating">Cover Image URL</ion-label>
                            <ion-input v-model="form.cover_image_url"></ion-input>
                        </ion-item>

                        <ion-item>
                            <ion-label position="floating">Genre</ion-label>
                            <ion-input v-model="form.genre"></ion-input>
                        </ion-item>

                        <ion-item>
                            <ion-label position="floating">Follower Count</ion-label>
                            <ion-input v-model="form.follower_count" type="number"></ion-input>
                        </ion-item>

                        <ion-item>
                            <ion-label>Music Platform *</ion-label>
                            <ion-select v-model="form.platform_id" interface="action-sheet" required>
                                <ion-select-option v-for="platform in platforms" :key="platform.platform_id"
                                    :value="platform.platform_id">
                                    {{ platform.name }}
                                </ion-select-option>
                            </ion-select>
                        </ion-item>
                        <div v-if="errors.platform_id" class="error-message">{{ errors.platform_id }}</div>

                        <ion-item>
                            <ion-label position="floating">Platform Specific ID *</ion-label>
                            <ion-input v-model="form.platform_specific_id" required></ion-input>
                        </ion-item>
                        <div v-if="errors.platform_specific_id" class="error-message">
                            {{ errors.platform_specific_id }}
                        </div>

                        <ion-item>
                            <ion-label>Visibility</ion-label>
                            <ion-toggle v-model="form.is_visible"></ion-toggle>
                        </ion-item>

                        <!-- Preview Section -->
                        <div class="preview-section">
                            <h4>Preview</h4>
                            <div v-if="form.cover_image_url" class="cover-preview">
                                <img :src="form.cover_image_url" alt="Playlist Cover Preview" />
                            </div>
                            <p><strong>Name:</strong> {{ form.name || 'Not set' }}</p>
                            <p><strong>Description:</strong> {{ form.description || 'Not set' }}</p>
                            <p><strong>Genre:</strong> {{ form.genre || 'Not set' }}</p>
                            <p><strong>Followers:</strong> {{ formatFollowers(form.follower_count) }}</p>
                            <p><strong>Status:</strong> {{ form.is_visible ? 'Visible' : 'Hidden' }}</p>
                        </div>

                        <div v-if="error" class="ion-padding error-message">
                            {{ error }}
                        </div>

                        <div class="form-buttons">
                            <ion-button expand="block" type="submit" :disabled="saving">
                                <ion-spinner v-if="saving" name="dots"></ion-spinner>
                                <span v-else>{{ isEdit ? 'Save Changes' : 'Add Playlist' }}</span>
                            </ion-button>
                            <ion-button expand="block" fill="outline" router-link="/tabs/playlists" :disabled="saving">
                                Cancel
                            </ion-button>
                        </div>
                    </ion-list>
                </form>
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
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonSpinner,
    toastController
} from '@ionic/vue';
import { useAuthStore } from '@/store/auth';
import { useApiStatus, useFormValidation } from '@/composables/useUtils';
import PageHeader from '@/components/layout/PageHeader.vue';
import playlistService from '@/services/playlist.service';
import platformService from '@/services/platform.service';
import type { PlaylistCreate, PlaylistUpdate, Platform } from '@/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { loading, error, startLoading, stopLoading, setError, clearError } = useApiStatus();
const { errors, validateRequired, clearErrors, setError: setFormError } = useFormValidation();

const playlistId = computed(() => route.params.id as string);
const isEdit = computed(() => !!playlistId.value);
const saving = ref(false);
const platforms = ref<Platform[]>([]);

// Form structure
const form = ref<PlaylistCreate | PlaylistUpdate>({
    creator_id: '',
    platform_id: 0,
    platform_specific_id: '',
    name: '',
    description: '',
    url: '',
    cover_image_url: '',
    is_visible: true,
    genre: '',
    follower_count: 0
});

onMounted(async () => {
    startLoading();
    try {
        // Set creator ID from current user
        if (authStore.user) {
            form.value.creator_id = authStore.user.user_id;
        }

        // Load platforms
        const platformsResponse = await platformService.getPlatforms();
        platforms.value = platformsResponse.data;

        // If editing, load playlist data
        if (isEdit.value) {
            const playlist = await playlistService.getPlaylistById(playlistId.value);
            form.value = { ...playlist };
        }
    } catch (err: any) {
        setError(err.message || 'Failed to load form data');
        console.error('Error loading form data:', err);
    } finally {
        stopLoading();
    }
});

async function savePlaylist() {
    clearErrors();
    clearError();

    // Form validation
    let isValid = true;

    if (!validateRequired(form.value.name, 'name')) isValid = false;
    if (!validateRequired(form.value.url, 'url')) isValid = false;
    if (!form.value.platform_id) {
        setFormError('platform_id', 'Please select a platform');
        isValid = false;
    }
    if (!validateRequired(form.value.platform_specific_id, 'platform_specific_id')) isValid = false;

    if (!isValid) return;

    saving.value = true;

    try {
        if (isEdit.value) {
            // Update existing playlist
            const { creator_id, platform_id, platform_specific_id, ...updateData } = form.value as PlaylistUpdate;
            await playlistService.updatePlaylist(playlistId.value, updateData);

            const toast = await toastController.create({
                message: 'Playlist updated successfully',
                duration: 2000,
                color: 'success'
            });
            await toast.present();
        } else {
            // Create new playlist
            await playlistService.createPlaylist(form.value as PlaylistCreate);

            const toast = await toastController.create({
                message: 'Playlist added successfully',
                duration: 2000,
                color: 'success'
            });
            await toast.present();
        }

        // Navigate back to playlists list
        router.push('/tabs/playlists');
    } catch (err: any) {
        setError(err.message || 'Failed to save playlist');
        console.error('Error saving playlist:', err);

        const toast = await toastController.create({
            message: 'Failed to save playlist',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        saving.value = false;
    }
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

<style lang="scss" scoped>
@import '../../assets/styles/variables';
@import '../../assets/styles/mixins';

.bg-playlist {
    --ion-background-color: transparent;
    position: relative;
    
    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5) url('@/assets/blurred-blue-light-purple-bg.jpg') no-repeat center center / cover;
        background-blend-mode: darken;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: -1;
    }
}

.error-message {
    color: $danger-color;
    font-size: 0.85rem;
    margin: 4px 16px;
    font-weight: 500; /* Use direct value instead of variable */
}

ion-list {
    margin-bottom: 20px;
    background: transparent !important;
    padding: 0;
    
    ion-item {
        --background: rgba(255, 255, 255, 0.15);
        --border-color: rgba(255, 255, 255, 0.2);
        --border-radius: $border-radius-md;
        margin-bottom: 12px;
        --backdrop-filter: blur(10px);
        --webkit-backdrop-filter: blur(10px);
        
        ion-label {
            --color: $light-color;
            opacity: 0.9;
        }
        
        ion-input, ion-textarea, ion-select {
            --color: $light-color;
            --placeholder-color: rgba(255, 255, 255, 0.6);
        }
        
        &::part(native) {
            border-radius: $border-radius-md;
        }
    }
}

.preview-section {
    margin: 25px 16px;
    padding: 20px;
    border-radius: $border-radius-md;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    h4 {
        margin-top: 0;
        color: $light-color;
        font-size: 1.2rem;
        font-weight: $font-weight-bold;
        margin-bottom: 16px;
    }
    
    p {
        color: $light-color;
        margin: 8px 0;
        
        strong {
            opacity: 0.8;
        }
    }
}

.cover-preview {
    text-align: center;
    margin: 20px 0;
    
    img {
        max-width: 180px;
        max-height: 180px;
        border-radius: $border-radius-md;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
        border: 2px solid rgba(255, 255, 255, 0.2);
    }
}

.form-buttons {
    margin: 30px 0;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    
    ion-button {
        --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          &[type="submit"] {
            --background: $primary-color;
            --background-activated: #3069dd; /* Manually darkened primary color */
            --background-hover: #3575ea; /* Slightly darkened primary color */
            font-weight: 700; /* Direct value instead of variable */
        }
    }
}

// Form wrapper with glass effect
.ion-padding {
    form {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: $border-radius-lg;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        margin-bottom: 40px;
    }
}
</style>
