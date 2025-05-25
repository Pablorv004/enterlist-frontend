<template>
    <ion-page>
        <app-header :title="title" :back-button="true" :back-url="backUrl"></app-header>

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
                            <ion-card-title>{{ accountsTitle }}</ion-card-title>
                            <ion-card-subtitle>{{ accountsSubtitle }}</ion-card-subtitle>
                        </ion-card-header>
                        
                        <ion-card-content>
                            <p class="accounts-intro">{{ accountsIntro }}</p>
                            
                            <ion-list>
                                <!-- Spotify -->
                                <ion-item class="platform-item">
                                    <ion-thumbnail slot="start" class="platform-icon">
                                        <img src="@/assets/spotify.png" alt="Spotify" />
                                    </ion-thumbnail>
                                    <ion-label>
                                        <h2>Spotify</h2>
                                        <p v-if="getLinkedAccount('spotify')">
                                            {{ userType === 'playlist_maker' ? `Connected as ${getLinkedAccount('spotify')?.external_user_id}` : 'Connected' }}
                                        </p>
                                        <p v-else>{{ spotifyDescription }}</p>
                                    </ion-label>
                                    <ion-button 
                                        v-if="getLinkedAccount('spotify')" 
                                        color="danger" 
                                        fill="outline" 
                                        @click="confirmDisconnect('spotify')"
                                    >
                                        Disconnect
                                    </ion-button>
                                    <ion-button 
                                        v-else 
                                        :color="userType === 'playlist_maker' ? 'success' : 'primary'"
                                        @click="connectPlatform('spotify')"
                                    >
                                        Connect
                                    </ion-button>
                                </ion-item>
                                
                                <!-- YouTube -->
                                <ion-item class="platform-item">
                                    <ion-thumbnail slot="start" class="platform-icon">
                                        <img src="@/assets/youtube.png" alt="YouTube" />
                                    </ion-thumbnail>
                                    <ion-label>
                                        <h2>{{ userType === 'playlist_maker' ? 'YouTube Music' : 'YouTube' }}</h2>
                                        <p v-if="getLinkedAccount('youtube')">
                                            {{ userType === 'playlist_maker' ? `Connected as ${getLinkedAccount('youtube')?.external_user_id}` : 'Connected' }}
                                        </p>
                                        <p v-else>{{ youtubeDescription }}</p>
                                    </ion-label>
                                    <ion-button 
                                        v-if="getLinkedAccount('youtube')" 
                                        color="danger" 
                                        fill="outline" 
                                        @click="confirmDisconnect('youtube')"
                                    >
                                        Disconnect
                                    </ion-button>
                                    <ion-button 
                                        v-else 
                                        :color="userType === 'playlist_maker' ? 'success' : 'primary'"
                                        @click="connectPlatform('youtube')"
                                    >
                                        Connect
                                    </ion-button>
                                </ion-item>
                            </ion-list>
                        </ion-card-content>
                    </ion-card>

                    <!-- Sync Settings Card -->
                    <ion-card v-if="hasLinkedAccounts" class="sync-settings-card">
                        <ion-card-header>
                            <ion-card-title>{{ syncTitle }}</ion-card-title>
                            <ion-card-subtitle>{{ syncSubtitle }}</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-list>
                                <ion-item class="toggle-item">
                                    <ion-label>
                                        <h3>{{ autoSyncTitle }}</h3>
                                        <p>{{ autoSyncDescription }}</p>
                                    </ion-label>
                                    <ion-toggle v-model="syncSettings.autoSync"></ion-toggle>
                                </ion-item>

                                <ion-item class="toggle-item">
                                    <ion-label>
                                        <h3>{{ autoImportTitle }}</h3>
                                        <p>{{ autoImportDescription }}</p>
                                    </ion-label>
                                    <ion-toggle v-model="syncSettings.autoImportNew"></ion-toggle>
                                </ion-item>

                                <ion-item>
                                    <ion-label>
                                        <h3>Last Sync</h3>
                                        <p v-if="lastSyncDate">{{ formatDate(lastSyncDate) }}</p>
                                        <p v-else>Never synced</p>
                                    </ion-label>
                                    <ion-button size="small" fill="outline" slot="end" @click="handleSync">
                                        <ion-icon :icon="refreshOutlineIcon" slot="start"></ion-icon>
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
                                <ion-icon :icon="permissionIcon" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>{{ permissionTitle }}</h3>
                                    <p>{{ permissionDescription }}</p>
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
                                    <p>We will never post or modify anything on your accounts without explicit permission</p>
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>

                    <!-- Activity Card -->
                    <ion-card v-if="hasLinkedAccounts && recentActivity.length > 0" class="activity-card">
                        <ion-card-header>
                            <ion-card-title>Recent Activity</ion-card-title>
                            <ion-card-subtitle>Recent actions with your linked accounts</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-list class="activity-list">                                <ion-item v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
                                    <ion-icon :icon="getActivityIcon(activity.action || activity.type || 'default')" slot="start" class="activity-icon"></ion-icon>
                                    <ion-label>
                                        <h3>{{ activity.action || activity.title }}</h3>
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
import { defineComponent, ref, reactive, computed, onMounted, PropType } from 'vue';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton,
    IonIcon, IonSpinner, IonToggle, alertController, toastController
} from '@ionic/vue';
import {
    musicalNotes, person, lockClosed, list,
    cloudDownloadOutline, linkOutline, closeCircleOutline, 
    refreshOutline, checkmarkCircle, warning, informationCircle
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { PlatformService } from '@/services/PlatformService';
import { SongService } from '@/services/SongService';
import { PlaylistService } from '@/services/PlaylistService';
import { useAuthStore } from '@/store';
import { LinkedAccount, Platform } from '@/types';

interface SyncSettings {
    autoSync: boolean;
    autoImportNew: boolean;
}

interface ActivityItem {
    action?: string;
    type?: string;
    title?: string;
    description: string;
    timestamp: Date | string;
}

export default defineComponent({
    name: 'LinkedAccountsComponent',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
        IonCardContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton,
        IonIcon, IonSpinner, IonToggle, AppHeader
    },
    props: {
        userType: {
            type: String as PropType<'artist' | 'playlist_maker'>,
            required: true
        }
    },
    setup(props) {
        const authStore = useAuthStore();
        const userId = computed(() => authStore.user?.user_id || '');

        const loading = ref(true);
        const platforms = ref<Platform[]>([]);
        const linkedAccounts = ref<LinkedAccount[]>([]);

        // Sync settings
        const syncSettings = reactive<SyncSettings>({
            autoSync: props.userType === 'artist',
            autoImportNew: props.userType === 'playlist_maker'
        });

        // Last sync date
        const lastSyncDate = ref<Date | string | null>(null);

        // Computed property to check if there are linked accounts
        const hasLinkedAccounts = computed(() => {
            return Array.isArray(linkedAccounts.value) && linkedAccounts.value.length > 0;
        });

        // Mock recent activity data
        const recentActivity = ref<ActivityItem[]>([]);

        // Computed properties for user type specific content
        const title = computed(() => 'Linked Accounts');
        
        const backUrl = computed(() => 
            props.userType === 'artist' ? '/artist/dashboard' : '/playlist-maker/dashboard'
        );

        const accountsTitle = computed(() => 
            props.userType === 'artist' ? 'Linked Music Platforms' : 'Music Platform Accounts'
        );

        const accountsSubtitle = computed(() => 
            props.userType === 'artist' 
                ? 'Connect your music platforms to import your content'
                : 'Connect your music accounts to import playlists'
        );

        const accountsIntro = computed(() => 
            props.userType === 'artist'
                ? 'Link your music platforms to easily import your songs and manage your catalog from a single place.'
                : 'Connect your accounts from music platforms to easily import your playlists for artist submissions. We\'ll never post anything without your permission.'
        );

        const spotifyDescription = computed(() => 
            props.userType === 'artist' ? 'Not connected' : 'Connect to import your Spotify playlists'
        );

        const youtubeDescription = computed(() => 
            props.userType === 'artist' ? 'Not connected' : 'Connect to import your YouTube Music playlists'
        );

        const syncTitle = computed(() => 
            props.userType === 'artist' ? 'Song Sync Settings' : 'Playlist Sync Settings'
        );

        const syncSubtitle = computed(() => 
            props.userType === 'artist' 
                ? 'Manage how your songs sync with platforms'
                : 'Manage how your playlists sync with platforms'
        );

        const autoSyncTitle = computed(() => 
            props.userType === 'artist' ? 'Auto-Sync Songs' : 'Auto-Sync Playlists'
        );

        const autoSyncDescription = computed(() => 
            props.userType === 'artist'
                ? 'Automatically sync songs daily from your connected platforms'
                : 'Automatically sync playlists daily from your connected platforms'
        );

        const autoImportTitle = computed(() => 
            props.userType === 'artist' ? 'Auto-Import New Songs' : 'Auto-Import New Playlists'
        );

        const autoImportDescription = computed(() => 
            props.userType === 'artist'
                ? 'Automatically import new songs when detected on your connected platforms'
                : 'Automatically import new playlists when detected on your connected platforms'
        );

        const permissionIcon = computed(() => 
            props.userType === 'artist' ? musicalNotes : list
        );

        const permissionTitle = computed(() => 
            props.userType === 'artist' ? 'Read Your Music Library' : 'Read Your Playlists'
        );

        const permissionDescription = computed(() => 
            props.userType === 'artist'
                ? 'We access your songs and albums to help you import them for playlist submissions'
                : 'We access your playlists to help you import them for artist submissions'
        );

        onMounted(async () => {
            if (userId.value) {
                await Promise.all([
                    fetchPlatforms(),
                    fetchLinkedAccounts()
                ]);
            }
        });

        const fetchPlatforms = async () => {
            try {
                const response = await PlatformService.getPlatforms();
                platforms.value = Array.isArray(response) ? response : [];
            } catch (error) {
                showToast('Failed to load platforms', 'danger');
                platforms.value = [];
            }
        };

        const fetchLinkedAccounts = async () => {
            try {
                loading.value = true;
                const response = await PlatformService.getLinkedAccounts(userId.value);
                linkedAccounts.value = Array.isArray(response) ? response : [];
                
                // Mock activity based on user type
                if (props.userType === 'artist') {
                    recentActivity.value = [
                        {
                            action: 'import',
                            description: 'Imported 3 songs from Spotify',
                            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        },
                        {
                            action: 'connect',
                            description: 'Connected Spotify account',
                            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                        }
                    ];
                } else {
                    recentActivity.value = [
                        {
                            type: 'import',
                            title: 'Playlist Import',
                            description: 'Imported 5 playlists from Spotify',
                            timestamp: new Date().toISOString()
                        }
                    ];
                }
            } catch (error) {
                console.error('Failed to load linked accounts:', error);
                showToast('Failed to load linked accounts', 'danger');
                linkedAccounts.value = [];
            } finally {
                loading.value = false;
            }
        };

        const getLinkedAccount = (platformName: string): LinkedAccount | undefined => {
            if (!Array.isArray(platforms.value)) {
                console.error('Platforms is not an array:', platforms.value);
                return undefined;
            }

            const platform = platforms.value.find(p =>
                p.name.toLowerCase().includes(platformName.toLowerCase())
            );

            if (!platform) return undefined;

            if (!Array.isArray(linkedAccounts.value)) {
                console.error('LinkedAccounts is not an array:', linkedAccounts.value);
                return undefined;
            }

            return linkedAccounts.value.find(account =>
                account.platform_id === platform.platform_id
            );
        };

        const connectPlatform = async (platformName: string) => {
            if (!Array.isArray(platforms.value)) {
                console.error('Platforms is not an array:', platforms.value);
                showToast('Platform data not loaded correctly', 'danger');
                return;
            }

            const platform = platforms.value.find(p =>
                p.name.toLowerCase().includes(platformName.toLowerCase())
            );

            if (!platform) {
                showToast('Platform not available', 'warning');
                return;
            }

            try {
                let redirectUrl;
                
                if (platformName.toLowerCase() === 'spotify') {
                    const response = await PlatformService.getSpotifyAuthUrl();
                    redirectUrl = response.url;
                } else if (platformName.toLowerCase() === 'youtube') {
                    const response = await PlatformService.getYoutubeAuthUrl();
                    redirectUrl = response.url;
                } else {
                    showToast('Platform not supported for OAuth', 'warning');
                    return;
                }

                if (redirectUrl) {
                    localStorage.setItem('preAuthPath', window.location.pathname);
                    window.location.href = redirectUrl;
                } else {
                    throw new Error('Failed to get authentication URL');
                }
            } catch (error) {
                console.error('OAuth error:', error);
                showToast(`Failed to connect to ${platformName}`, 'danger');
            }
        };

        const confirmDisconnect = async (platformName: string) => {
            if (!Array.isArray(platforms.value)) {
                console.error('Platforms is not an array:', platforms.value);
                showToast('Platform data not loaded correctly', 'danger');
                return;
            }

            const platform = platforms.value.find(p =>
                p.name.toLowerCase().includes(platformName.toLowerCase())
            );

            if (!platform) return;

            const resource = props.userType === 'artist' ? 'songs' : 'playlists';
            
            const alert = await alertController.create({
                header: 'Disconnect Account',
                message: `Are you sure you want to disconnect your ${platform.name} account? This won't delete any ${resource} you've already imported.`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Disconnect',
                        role: 'destructive',
                        handler: () => {
                            disconnectPlatform(platform);
                        }
                    }
                ]
            });

            await alert.present();
        };

        const disconnectPlatform = async (platform: Platform) => {
            if (!Array.isArray(linkedAccounts.value)) {
                console.error('LinkedAccounts is not an array:', linkedAccounts.value);
                showToast('Account data not loaded correctly', 'danger');
                return;
            }

            const linkedAccount = linkedAccounts.value.find(account =>
                account.platform_id === platform.platform_id
            );

            if (!linkedAccount) return;

            try {
                await PlatformService.unlinkAccount(linkedAccount.linked_account_id);

                linkedAccounts.value = linkedAccounts.value.filter(account =>
                    account.platform_id !== platform.platform_id
                );

                recentActivity.value.unshift({
                    action: 'disconnect',
                    description: `Disconnected ${platform.name} account`,
                    timestamp: new Date()
                });

                showToast(`Successfully disconnected from ${platform.name}`, 'success');
            } catch (error) {
                console.error('Failed to disconnect platform:', error);
                showToast(`Failed to disconnect from ${platform.name}`, 'danger');
            }
        };

        const handleSync = async () => {
            try {
                const toast = await toastController.create({
                    message: 'Starting sync...',
                    duration: 2000,
                    color: 'primary'
                });
                await toast.present();

                // Simulate sync process
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Update last sync date
                lastSyncDate.value = new Date();

                const resource = props.userType === 'artist' ? 'songs' : 'playlists';
                
                // Add to recent activity
                recentActivity.value.unshift({
                    action: 'import',
                    description: `Synced ${resource} from connected platforms`,
                    timestamp: new Date()
                });

                showToast(`${resource.charAt(0).toUpperCase() + resource.slice(1)} synced successfully!`, 'success');
            } catch (error) {
                console.error('Failed to sync:', error);
                const resource = props.userType === 'artist' ? 'songs' : 'playlists';
                showToast(`Failed to sync ${resource}`, 'danger');
            }
        };

        const getActivityIcon = (action: string) => {
            switch (action) {
                case 'import':
                    return cloudDownloadOutline;
                case 'connect':
                    return linkOutline;
                case 'disconnect':
                    return closeCircleOutline;
                case 'sync':
                    return refreshOutline;
                case 'error':
                    return warning;
                default:
                    return informationCircle;
            }
        };

        const formatDate = (date: Date | string): string => {
            const d = typeof date === 'string' ? new Date(date) : date;
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const showToast = async (message: string, color: string = 'primary') => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                color
            });

            await toast.present();
        };

        return {
            loading,
            platforms,
            linkedAccounts,
            recentActivity,
            syncSettings,
            lastSyncDate,
            hasLinkedAccounts,
            // Computed content
            title,
            backUrl,
            accountsTitle,
            accountsSubtitle,
            accountsIntro,
            spotifyDescription,
            youtubeDescription,
            syncTitle,
            syncSubtitle,
            autoSyncTitle,
            autoSyncDescription,
            autoImportTitle,
            autoImportDescription,
            permissionIcon,
            permissionTitle,
            permissionDescription,
            // Icons
            musicIcon: musicalNotes,
            personIcon: person,
            lockClosedIcon: lockClosed,
            refreshOutlineIcon: refreshOutline,
            // Functions
            getLinkedAccount,
            connectPlatform,
            confirmDisconnect,
            handleSync,
            getActivityIcon,
            formatDate
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
    max-width: 800px;
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
    color: var(--ion-color-medium);
    line-height: 1.5;
}

.platform-item {
    --padding-start: 0;
    --inner-padding-end: 0;
    --padding-top: 0.75rem;
    --padding-bottom: 0.75rem;
}

.platform-icon {
    width: 40px;
    height: 40px;
    --border-radius: 8px;
}

.permission-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.permission-item:last-child {
    margin-bottom: 0;
}

.permission-icon {
    font-size: 1.8rem;
    color: var(--ion-color-primary);
    margin-right: 1rem;
    margin-top: 0.2rem;
}

.permission-content h3 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
}

.permission-content p {
    margin: 0;
    color: var(--ion-color-medium);
    font-size: 0.9rem;
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
