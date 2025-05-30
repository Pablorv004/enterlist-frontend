<template>
    <ion-page>
        <div class="admin-layout">
            <!-- Side Panel -->
            <admin-side-panel :active-tab="'songs'"></admin-side-panel>

            <!-- Main Content -->
            <div class="main-content">
                <ion-content :fullscreen="true" class="admin-content">
                    <div class="admin-container">
                        <admin-table title="Song Management" :columns="columns" :rows="songs" :loading="loading"
                            empty-message="No songs found in the system.">
                            <template #actions>
                                <ion-button @click="refreshSongs" fill="outline" size="small">
                                    <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                                    Refresh
                                </ion-button>
                            </template>                            <!-- Custom column templates -->
                            <template #table-row="props">
                                <span v-if="props.column.field === 'is_visible'">
                                    <ion-badge :color="props.row.is_visible ? 'success' : 'warning'">
                                        {{ props.row.is_visible ? 'Visible' : 'Hidden' }}
                                    </ion-badge>
                                </span>
                                <span v-else-if="props.column.field === 'artist'">
                                    {{ props.row.artist?.username || 'Unknown' }}
                                </span>
                                <span v-else-if="props.column.field === 'platform'">
                                    <ion-badge :color="getPlatformColor(props.row.platform?.name)">
                                        {{ props.row.platform?.name || 'Unknown' }}
                                    </ion-badge>
                                </span>
                                <span v-else-if="props.column.field === 'duration_ms'">
                                    {{ formatDuration(Number(props.row.duration_ms || 0)) }}
                                </span>
                                <span v-else-if="props.column.field === 'album_name'">
                                    <ion-badge color="medium">
                                        {{ props.row.album_name || 'Unknown' }}
                                    </ion-badge>
                                </span>
                                <span v-else-if="props.column.field === 'created_at' || props.column.field === 'updated_at'">
                                    {{ formatDate(props.row[props.column.field]) }}
                                </span>
                                <span v-else-if="props.column.field === 'actions'">
                                    <div class="action-buttons">
                                        <ion-button fill="clear" size="small" color="primary"
                                            @click="editSong(props.row)">
                                            <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                                        </ion-button>
                                        <ion-button fill="clear" size="small" color="danger"
                                            @click="confirmDeleteSong(props.row)">
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

        <!-- Edit Song Modal -->
        <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Edit Song</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeEditModal">
                            <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>            <ion-content class="ion-padding">
                <form @submit.prevent="saveSong" v-if="selectedSong">
                    <ion-item>
                        <ion-label position="stacked">Title *</ion-label>
                        <ion-input v-model="selectedSong.title" required></ion-input>
                    </ion-item>
                    
                    <ion-item>
                        <ion-label position="stacked">Artist Name on Platform *</ion-label>
                        <ion-input v-model="selectedSong.artist_name_on_platform" required></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Platform Specific ID *</ion-label>
                        <ion-input v-model="selectedSong.platform_specific_id" required></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Album Name</ion-label>
                        <ion-input v-model="selectedSong.album_name"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Duration (ms)</ion-label>
                        <ion-input v-model.number="selectedSong.duration_ms" type="number" min="1"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">External URL</ion-label>
                        <ion-input v-model="selectedSong.url" type="url"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Cover Image URL</ion-label>
                        <ion-input v-model="selectedSong.cover_image_url" type="url"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-checkbox v-model="selectedSong.is_visible"></ion-checkbox>
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
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput,
    IonCheckbox, IonSpinner, alertController, toastController
} from '@ionic/vue';
import {
    refresh, create, trash, close
} from 'ionicons/icons';
import { AdminSong } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils/date';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
    name: 'AdminSongs',
    components: {
        IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
        IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput,
        IonCheckbox, IonSpinner,
        AdminSidePanel, AdminTable    }, setup() {
        const songs = ref<AdminSong[]>([]);
        const loading = ref(true);
        const saving = ref(false);
        const isEditModalOpen = ref(false);
        const selectedSong = ref<AdminSong | null>(null);
        const authStore = useAuthStore();const columns = [
            {
                label: 'ID',
                field: 'song_id',
                type: 'string',
                sortable: true,
                filterOptions: { enabled: true, placeholder: 'Filter by ID' },
                width: '120px'
            },
            {
                label: 'Title',
                field: 'title',
                sortable: true,
                filterOptions: { enabled: true, placeholder: 'Filter by title' }
            },
            {
                label: 'Artist',
                field: 'artist',
                sortable: true,
                filterOptions: { enabled: true, placeholder: 'Filter by artist' }
            },
            {
                label: 'Artist Name',
                field: 'artist_name_on_platform',
                sortable: true,
                filterOptions: { enabled: true, placeholder: 'Filter by artist name' }
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
                label: 'Album',
                field: 'album_name',
                sortable: true,
                filterOptions: { enabled: true, placeholder: 'Filter by album' }
            },
            {
                label: 'Duration',
                field: 'duration_ms',
                type: 'number',
                sortable: true,
                filterOptions: { enabled: true, placeholder: 'Filter by duration' },
                width: '100px'
            },
            {
                label: 'Visibility',
                field: 'is_visible',
                sortable: true,
                filterOptions: { enabled: true, placeholder: 'Filter by visibility' },
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
        ];const loadSongs = async () => {
            try {
                loading.value = true;
                const response = await AdminService.getSongs();
                songs.value = response.data || response; // Handle both paginated and simple array responses
            } catch (error) {
                console.error('Failed to load songs:', error);
                const toast = await toastController.create({
                    message: 'Failed to load songs',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            } finally {
                loading.value = false;
            }
        };

        const refreshSongs = () => {
            loadSongs();
        };

        const getPlatformColor = (platform: string) => {
            const colors: { [key: string]: string } = {
                'Spotify': 'success',
                'YouTube': 'danger',
                'Apple Music': 'dark'
            };
            return colors[platform] || 'medium';
        };

        const formatDuration = (milliseconds: number) => {
            if (!milliseconds) return '0:00';
            const totalSeconds = Math.floor(milliseconds / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const remainingSeconds = totalSeconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        };

        const editSong = (song: any) => {
            selectedSong.value = { ...song };
            isEditModalOpen.value = true;
        };

        const closeEditModal = () => {
            isEditModalOpen.value = false;
            selectedSong.value = null;
        };

        const saveSong = async () => {
            if (!selectedSong.value) return;

            try {
                saving.value = true;
                await AdminService.updateSong(selectedSong.value.song_id, selectedSong.value);                // Record admin action
                await AdminService.createAdminAction({
                    admin_user_id: authStore.user?.user_id || '',
                    action_type: 'update_song',
                    target_song_id: selectedSong.value.song_id,
                    reason: 'Song details updated via admin panel'
                });

                const toast = await toastController.create({
                    message: 'Song updated successfully',
                    duration: 3000,
                    color: 'success'
                });
                await toast.present();

                closeEditModal();
                loadSongs();
            } catch (error) {
                console.error('Failed to update song:', error);
                const toast = await toastController.create({
                    message: 'Failed to update song',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            } finally {
                saving.value = false;
            }        };

        const confirmDeleteSong = async (song: any) => {
            const alert = await alertController.create({
                header: 'Delete Song',
                message: `Are you sure you want to delete song "${song.title}"? This action cannot be undone.`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Delete',
                        role: 'destructive',
                        handler: () => deleteSong(song)
                    }
                ]
            });
            await alert.present();
        };

        const deleteSong = async (song: any) => {
            try {
                await AdminService.deleteSong(song.song_id);                // Record admin action
                await AdminService.createAdminAction({
                    admin_user_id: authStore.user?.user_id || '',
                    action_type: 'delete_song',
                    target_song_id: song.song_id,
                    reason: 'Song deleted via admin panel'
                });

                const toast = await toastController.create({
                    message: 'Song deleted successfully',
                    duration: 3000,
                    color: 'success'
                });
                await toast.present();

                loadSongs();
            } catch (error) {
                console.error('Failed to delete song:', error);
                const toast = await toastController.create({
                    message: 'Failed to delete song',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            }        };

        onMounted(() => {
            loadSongs();
        });        return {
            songs,
            loading,
            saving,
            columns,
            isEditModalOpen,
            selectedSong,
            loadSongs,
            refreshSongs,
            getPlatformColor,
            formatDate,
            formatDuration,
            editSong,
            closeEditModal,
            saveSong,
            confirmDeleteSong,
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
