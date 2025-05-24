<template>
    <ion-page>
        <app-header title="Linked Accounts" :back-button="true" back-url="/playlist-maker/dashboard"></app-header>

        <ion-content :fullscreen="true" class="linked-accounts-content">
            <div class="linked-accounts-container">
                <!-- Loading State -->
                <div v-if="loading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading your linked accounts...</p>
                </div>

                <!-- Content -->
                <div v-else>
                    <ion-card class="accounts-card">
                        <ion-card-header>
                            <ion-card-title>Music Platform Accounts</ion-card-title>
                            <ion-card-subtitle>Connect your music accounts to import playlists</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <p class="accounts-intro">
                                Connect your accounts from music platforms to easily import your playlists for artist
                                submissions.
                                We'll never post anything without your permission.
                            </p>

                            <ion-list class="platforms-list">
                                <!-- Spotify -->
                                <ion-item class="platform-item">
                                    <ion-thumbnail slot="start" class="platform-icon">
                                        <img src="@/assets/spotify.png" alt="Spotify">
                                    </ion-thumbnail>

                                    <ion-label>
                                        <h3>Spotify</h3>
                                        <p v-if="getLinkedAccount('spotify')">
                                            Connected as {{ getLinkedAccount('spotify')?.external_user_id }}
                                        </p>
                                        <p v-else>Connect to import your Spotify playlists</p>
                                    </ion-label>

                                    <ion-button v-if="getLinkedAccount('spotify')" fill="outline" color="danger"
                                        slot="end" @click="confirmDisconnect('spotify')">
                                        Disconnect
                                    </ion-button>

                                    <ion-button v-else color="success" slot="end" @click="connectPlatform('spotify')">
                                        Connect
                                    </ion-button>
                                </ion-item>

                                <!-- YouTube -->
                                <ion-item class="platform-item">
                                    <ion-thumbnail slot="start" class="platform-icon">
                                        <img src="@/assets/youtube.png" alt="YouTube">
                                    </ion-thumbnail>

                                    <ion-label>
                                        <h3>YouTube Music</h3>
                                        <p v-if="getLinkedAccount('youtube')">
                                            Connected as {{ getLinkedAccount('youtube')?.external_user_id }}
                                        </p>
                                        <p v-else>Connect to import your YouTube Music playlists</p>
                                    </ion-label>

                                    <ion-button v-if="getLinkedAccount('youtube')" fill="outline" color="danger"
                                        slot="end" @click="confirmDisconnect('youtube')">
                                        Disconnect
                                    </ion-button>

                                    <ion-button v-else color="success" slot="end" @click="connectPlatform('youtube')">
                                        Connect
                                    </ion-button>
                                </ion-item>
                            </ion-list>
                        </ion-card-content>
                    </ion-card>

                    <!-- Playlist Sync Settings Card -->
                    <ion-card v-if="hasLinkedAccounts" class="sync-settings-card">
                        <ion-card-header>
                            <ion-card-title>Playlist Sync Settings</ion-card-title>
                            <ion-card-subtitle>Manage how your playlists sync with platforms</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-list>
                                <ion-item class="toggle-item">
                                    <ion-label>
                                        <h3>Auto-Sync Playlists</h3>
                                        <p>Automatically sync playlists daily from your connected platforms</p>
                                    </ion-label>
                                    <ion-toggle v-model="syncSettings.autoSync"></ion-toggle>
                                </ion-item>

                                <ion-item class="toggle-item">
                                    <ion-label>
                                        <h3>Auto-Import New Playlists</h3>
                                        <p>Automatically import new playlists when detected on your connected platforms
                                        </p>
                                    </ion-label>
                                    <ion-toggle v-model="syncSettings.autoImportNew"></ion-toggle>
                                </ion-item>

                                <ion-item>
                                    <ion-label>
                                        <h3>Last Sync</h3>
                                        <p v-if="lastSyncDate">{{ formatDate(lastSyncDate) }}</p>
                                        <p v-else>Never synced</p>
                                    </ion-label>
                                    <ion-button size="small" fill="outline" slot="end" @click="syncPlaylists">
                                        <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                                        Sync Now
                                    </ion-button>
                                </ion-item>
                            </ion-list>
                        </ion-card-content>
                    </ion-card>

                    <!-- Permissions Card -->
                    <ion-card class="permissions-card">
                        <ion-card-header>
                            <ion-card-title>Account Permissions</ion-card-title>
                            <ion-card-subtitle>Understand what permissions we request</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <div class="permission-item">
                                <ion-icon :icon="listIcon" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>Read Your Playlists</h3>
                                    <p>We access your playlists to help you import them for artist submissions</p>
                                </div>
                            </div>

                            <div class="permission-item">
                                <ion-icon :icon="personIcon" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>Basic Profile Information</h3>
                                    <p>We access your username and profile details to identify your account</p>
                                </div>
                            </div>

                            <div class="permission-item">
                                <ion-icon :icon="lockClosedIcon" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>No Posting Access</h3>
                                    <p>We will never post or modify anything on your accounts without explicit
                                        permission</p>
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>

                    <!-- Activity Card (only show if they have linked accounts) -->
                    <ion-card v-if="hasLinkedAccounts && recentActivity.length > 0" class="activity-card">
                        <ion-card-header>
                            <ion-card-title>Recent Activity</ion-card-title>
                            <ion-card-subtitle>Recent actions with your linked accounts</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-list class="activity-list">
                                <ion-item v-for="(activity, index) in recentActivity" :key="index"
                                    class="activity-item">
                                    <ion-icon :icon="getActivityIcon(activity.type)" slot="start"
                                        class="activity-icon"></ion-icon>
                                    <ion-label>
                                        <h3>{{ activity.title }}</h3>
                                        <p>{{ activity.description }}</p>
                                        <p class="activity-time">{{ formatDate(activity.timestamp) }}</p>
                                    </ion-label>
                                </ion-item>
                            </ion-list>
                        </ion-card-content>
                    </ion-card>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonSpinner, IonList, IonItem, IonThumbnail, IonLabel,
    IonButton, IonIcon, IonToggle, alertController, toastController
} from '@ionic/vue';
import {
    musicalNotes, lockClosed, person, refreshCircle, list,
    informationCircle, cloudDownload, sync, warning, checkmarkCircle
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { PlatformService } from '@/services/PlatformService';
import { PlaylistService } from '@/services/PlaylistService';
import { useAuthStore } from '@/store';
import { LinkedAccount, Platform } from '@/types';

interface SyncSettings {
    autoSync: boolean;
    autoImportNew: boolean;
}

interface ActivityItem {
    type: 'import' | 'sync' | 'connect' | 'error';
    title: string;
    description: string;
    timestamp: string;
}

export default defineComponent({
    name: 'PlaylistMakerLinkedAccounts',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
        IonCardContent, IonSpinner, IonList, IonItem, IonThumbnail, IonLabel,
        IonButton, IonIcon, IonToggle, AppHeader
    },
    setup() {
        const authStore = useAuthStore();
        const userId = computed(() => authStore.user?.user_id);

        const linkedAccounts = ref<LinkedAccount[]>([]);
        const platforms = ref<Platform[]>([]);
        const loading = ref(true);
        const lastSyncDate = ref<string | null>(null);

        const syncSettings = reactive<SyncSettings>({
            autoSync: false,
            autoImportNew: true
        });

        const recentActivity = ref<ActivityItem[]>([]);

        const hasLinkedAccounts = computed(() => {
            return linkedAccounts.value.length > 0;
        });

        // Fetch user's linked accounts and available platforms
        onMounted(async () => {
            if (userId.value) {
                try {
                    loading.value = true;

                    // Fetch linked accounts
                    const accounts = await PlatformService.getLinkedAccounts(userId.value);
                    linkedAccounts.value = accounts;

                    // Fetch available platforms
                    const availablePlatforms = await PlatformService.getPlatforms();
                    platforms.value = availablePlatforms;

                    // Fetch sync settings
                    //TODO: Replace with actual API call
                    // const settings = await PlaylistService.getSyncSettings(userId.value);
                    // syncSettings.autoSync = settings.auto_sync;
                    // syncSettings.autoImportNew = settings.auto_import_new;
                    // lastSyncDate.value = settings.last_sync_date;

                    // Fetch recent activity
                    //TODO: Replace with actual API call
                    // const activity = await PlatformService.getAccountActivity(userId.value);
                    // recentActivity.value = activity.map((item: { activity_type: any; title: any; description: any; created_at: any; }) => ({
                    //     type: item.activity_type as any,
                    //     title: item.title,
                    //     description: item.description,
                    //     timestamp: item.created_at
                    // }));

                } catch (err) {
                    showToast('Failed to load linked accounts', 'danger');
                    console.error(err);
                } finally {
                    loading.value = false;
                }
            }
        });

        // Get linked account for a specific platform
        const getLinkedAccount = (platformName: string): LinkedAccount | undefined => {
            const platform = platforms.value.find(p => p.name.toLowerCase() === platformName.toLowerCase());

            if (platform) {
                return linkedAccounts.value.find(account => account.platform_id === platform.platform_id);
            }

            return undefined;
        };
        const connectPlatform = async (platformName: string) => {
            try {
                if (!userId.value) {
                    showToast('You need to be logged in to connect an account', 'danger');
                    return;
                }
                
                const platform = platforms.value.find(p =>
                    p.name.toLowerCase().includes(platformName.toLowerCase())
                );

                if (!platform) {
                    showToast('Platform not available', 'warning');
                    return;
                }
                
                let authUrl;
                // Get the appropriate auth URL based on the platform
                if (platformName.toLowerCase() === 'spotify') {
                    authUrl = await PlatformService.getSpotifyAuthUrl();
                } else if (platformName.toLowerCase() === 'youtube') {
                    authUrl = await PlatformService.getYoutubeAuthUrl();
                } else {
                    showToast('Unsupported platform', 'danger');
                    return;
                }
                
                // Redirect to the authentication page
                if (authUrl && authUrl.url) {
                    window.location.href = authUrl.url;
                } else {
                    throw new Error('Failed to get authentication URL');
                }
            } catch (err) {
                console.error('OAuth error:', err);
                showToast('Failed to connect to platform', 'danger');
            }
        };

        // Confirm disconnect from a platform
        const confirmDisconnect = async (platformName: string) => {
            const platform = platforms.value.find(p => p.name.toLowerCase() === platformName.toLowerCase());

            if (!platform) return;

            const account = getLinkedAccount(platformName);

            if (!account) return;

            const alert = await alertController.create({
                header: 'Disconnect Account',
                message: `Are you sure you want to disconnect your ${platform.name} account? Your imported playlists will not be deleted, but you won't be able to update them automatically.`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Disconnect',
                        role: 'destructive',
                        handler: () => disconnectPlatform(account.linked_account_id)
                    }
                ]
            });

            await alert.present();
        };

        // Disconnect from a platform
        const disconnectPlatform = async (linkedAccountId: string) => {
            try {
                await PlatformService.unlinkAccount(linkedAccountId);

                // Remove from local state
                linkedAccounts.value = linkedAccounts.value.filter(
                    account => account.linked_account_id !== linkedAccountId
                );

                showToast('Account disconnected successfully', 'success');
            } catch (err) {
                showToast('Failed to disconnect account', 'danger');
                console.error(err);
            }
        };

        // Sync playlists from all platforms
        const syncPlaylists = async () => {
            if (!userId.value || linkedAccounts.value.length === 0) return;

            try {
                const toast = await toastController.create({
                    message: 'Syncing your playlists... This may take a moment.',
                    duration: 2000,
                    position: 'bottom',
                    color: 'primary'
                });

                await toast.present();
                //TODO: Implement sync logic
                // sawait PlaylistService.syncPlaylists(userId.value);

                lastSyncDate.value = new Date().toISOString();

                showToast('Playlists synced successfully', 'success');
            } catch (err) {
                showToast('Failed to sync playlists', 'danger');
                console.error(err);
            }
        };

        // Get icon for activity type
        const getActivityIcon = (type: string) => {
            switch (type) {
                case 'import':
                    return cloudDownload;
                case 'sync':
                    return sync;
                case 'connect':
                    return checkmarkCircle;
                case 'error':
                    return warning;
                default:
                    return informationCircle;
            }
        };

        // Format date
        const formatDate = (dateString: string | null): string => {
            if (!dateString) return 'Never';

            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.round(diffMs / 60000);

            if (diffMins < 60) {
                return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
            }

            const diffHours = Math.round(diffMins / 60);

            if (diffHours < 24) {
                return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
            }

            const diffDays = Math.round(diffHours / 24);

            if (diffDays < 7) {
                return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        // Show toast message
        const showToast = async (message: string, color: string) => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                position: 'bottom',
                color
            });

            await toast.present();
        };

        return {
            linkedAccounts,
            platforms,
            loading,
            syncSettings,
            lastSyncDate,
            recentActivity,
            hasLinkedAccounts,
            getLinkedAccount,
            connectPlatform,
            confirmDisconnect,
            syncPlaylists,
            getActivityIcon,
            formatDate,
            // Icons
            musicIcon: musicalNotes,
            lockClosedIcon: lockClosed,
            personIcon: person,
            refreshIcon: refreshCircle,
            listIcon: list
        };
    }
});
</script>

<style scoped>
.linked-accounts-content {
    --background: #f8f9fa;
}

.linked-accounts-container {
    padding: 1rem;
    max-width: 768px;
    margin: 0 auto;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
    text-align: center;
}

.accounts-card,
.sync-settings-card,
.permissions-card,
.activity-card {
    margin-bottom: 1.5rem;
}

.accounts-intro {
    margin-bottom: 1.5rem;
    line-height: 1.5;
    color: var(--ion-color-medium);
}

.platform-icon {
    width: 40px;
    height: 40px;
    --border-radius: 8px;
}

.platform-item {
    --padding-top: 0.75rem;
    --padding-bottom: 0.75rem;
}

.permission-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.25rem;
}

.permission-item:last-child {
    margin-bottom: 0;
}

.permission-icon {
    font-size: 1.75rem;
    color: var(--ion-color-primary);
    margin-right: 1rem;
    margin-top: 0.25rem;
}

.permission-content h3 {
    margin: 0 0 0.25rem;
    font-weight: 600;
}

.permission-content p {
    margin: 0;
    color: var(--ion-color-medium);
    line-height: 1.4;
}

.toggle-item {
    --padding-top: 0.75rem;
    --padding-bottom: 0.75rem;
}

.activity-icon {
    color: var(--ion-color-primary);
    font-size: 1.5rem;
}

.activity-time {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    margin-top: 0.25rem;
}
</style>
