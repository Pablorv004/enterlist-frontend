<template>
    <ion-page>
        <app-header title="Linked Accounts" :back-button="true" back-url="/artist/dashboard"></app-header>

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
                            <ion-card-title>Linked Music Platforms</ion-card-title>
                            <ion-card-subtitle>Connect your music platforms to import your content</ion-card-subtitle>
                        </ion-card-header>
                        
                        <ion-card-content>
                            <p class="accounts-intro">
                                Link your music platforms to easily import your songs and manage your catalog from a single place.
                            </p>
                            
                            <ion-list>
                                <!-- Spotify -->
                                <ion-item class="platform-item">
                                    <ion-thumbnail slot="start" class="platform-icon">
                                        <img src="@/assets/spotify.png" alt="Spotify" />
                                    </ion-thumbnail>
                                    <ion-label>
                                        <h2>Spotify</h2>
                                        <p v-if="getLinkedAccount('spotify')">Connected</p>
                                        <p v-else>Not connected</p>
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
                                        color="primary" 
                                        @click="connectPlatform('spotify')"
                                    >
                                        Connect
                                    </ion-button>
                                </ion-item>
                                
                                <!-- YouTube (can be added if supported) -->
                                <ion-item class="platform-item">
                                    <ion-thumbnail slot="start" class="platform-icon">
                                        <img src="@/assets/youtube.png" alt="YouTube" />
                                    </ion-thumbnail>
                                    <ion-label>
                                        <h2>YouTube</h2>
                                        <p v-if="getLinkedAccount('youtube')">Connected</p>
                                        <p v-else>Not connected</p>
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
                                        color="primary" 
                                        @click="connectPlatform('youtube')"
                                    >
                                        Connect
                                    </ion-button>
                                </ion-item>
                            </ion-list>
                        </ion-card-content>
                    </ion-card>

                    <!-- Permissions Card -->
                    <ion-card class="permissions-card">
                        <ion-card-header>
                            <ion-card-title>Data Access & Permissions</ion-card-title>
                            <ion-card-subtitle>What we access when you connect platforms</ion-card-subtitle>
                        </ion-card-header>
                        
                        <ion-card-content>
                            <div class="permission-item">
                                <ion-icon :icon="musicIcon" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>Music Content</h3>
                                    <p>We access your songs, albums, and playlists for importing into your Enterlist catalog.</p>
                                </div>
                            </div>
                            
                            <div class="permission-item">
                                <ion-icon :icon="personIcon" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>Profile Information</h3>
                                    <p>We retrieve your profile details to help set up and manage your account.</p>
                                </div>
                            </div>
                            
                            <div class="permission-item">
                                <ion-icon :icon="lockClosedIcon" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>Privacy & Security</h3>
                                    <p>We never post or share your content without permission. Your passwords are never stored.</p>
                                </div>
                            </div>
                        </ion-card-content>
                    </ion-card>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton,
    IonIcon, IonSpinner, alertController, toastController
} from '@ionic/vue';
import {
    musicalNotes, person, lockClosed, cloudDownloadOutline,
    linkOutline, closeCircleOutline, refreshOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { PlatformService } from '@/services/PlatformService';
import { useAuthStore } from '@/store';
import { LinkedAccount, Platform } from '@/types';

interface ActivityItem {
    action: string;
    description: string;
    timestamp: Date;
}

export default defineComponent({
    name: 'ArtistLinkedAccounts',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
        IonCardContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton,
        IonIcon, IonSpinner, AppHeader
    },
    setup() {
        const authStore = useAuthStore();
        const userId = computed(() => authStore.user?.user_id || '');

        const loading = ref(true);
        const platforms = ref<Platform[]>([]);
        const linkedAccounts = ref<LinkedAccount[]>([]);

        // Mock recent activity data
        const recentActivity = ref<ActivityItem[]>([
            {
                action: 'import',
                description: 'Imported 3 songs from Spotify',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                action: 'connect',
                description: 'Connected Spotify account',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                action: 'disconnect',
                description: 'Disconnected Youtube account',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            }
        ]);

        onMounted(async () => {
            if (userId.value) {
                await Promise.all([
                    fetchPlatforms(),
                    fetchLinkedAccounts()
                ]);
            }
        });        const fetchPlatforms = async () => {
            try {
                const response = await PlatformService.getPlatforms();
                // Ensure we're dealing with an array
                platforms.value = Array.isArray(response) ? response : [];
            } catch (error) {
                showToast('Failed to load platforms', 'danger');
                platforms.value = []; // Initialize as empty array on error
            }
        };        const fetchLinkedAccounts = async () => {
            try {
                loading.value = true;
                const response = await PlatformService.getLinkedAccounts(userId.value);
                // Ensure we're dealing with an array
                linkedAccounts.value = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error('Failed to load linked accounts:', error);
                showToast('Failed to load linked accounts', 'danger');
                linkedAccounts.value = []; // Initialize as empty array on error
            } finally {
                loading.value = false;
            }
        };const getLinkedAccount = (platformName: string): LinkedAccount | undefined => {
            // Safeguard against platforms.value not being an array
            if (!Array.isArray(platforms.value)) {
                console.error('Platforms is not an array:', platforms.value);
                return undefined;
            }

            const platform = platforms.value.find(p =>
                p.name.toLowerCase().includes(platformName.toLowerCase())
            );

            if (!platform) return undefined;

            // Safeguard against linkedAccounts.value not being an array
            if (!Array.isArray(linkedAccounts.value)) {
                console.error('LinkedAccounts is not an array:', linkedAccounts.value);
                return undefined;
            }

            return linkedAccounts.value.find(account =>
                account.platform_id === platform.platform_id
            );
        };        const connectPlatform = async (platformName: string) => {
            // Safeguard against platforms.value not being an array
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
            }            try {
                let redirectUrl;
                
                // Get the auth URL from our own API instead of directly constructing URLs
                if (platformName.toLowerCase() === 'spotify') {
                    const response = await PlatformService.getSpotifyAuthUrl();
                    redirectUrl = response.url;
                    console.log('Spotify auth URL:', redirectUrl);
                } else if (platformName.toLowerCase() === 'youtube') {
                    const response = await PlatformService.getYoutubeAuthUrl();
                    redirectUrl = response.url;
                    console.log('YouTube auth URL:', redirectUrl);
                } else {
                    showToast('Platform not supported for OAuth', 'warning');
                    return;
                }                // Redirect to the authentication endpoint
                if (redirectUrl) {
                    // Store current state in localStorage to help with navigation after auth
                    localStorage.setItem('preAuthPath', window.location.pathname);
                    
                    // Use window.location.href to navigate directly to the auth URL
                    // This avoids CORS issues with form submissions
                    window.location.href = redirectUrl;
                } else {
                    throw new Error('Failed to get authentication URL');
                }
            } catch (error) {
                console.error('OAuth error:', error);
                showToast(`Failed to connect to ${platformName}`, 'danger');
            }
        };const confirmDisconnect = async (platformName: string) => {
            // Safeguard against platforms.value not being an array
            if (!Array.isArray(platforms.value)) {
                console.error('Platforms is not an array:', platforms.value);
                showToast('Platform data not loaded correctly', 'danger');
                return;
            }

            const platform = platforms.value.find(p =>
                p.name.toLowerCase().includes(platformName.toLowerCase())
            );

            if (!platform) return;

            const alert = await alertController.create({
                header: 'Disconnect Account',
                message: `Are you sure you want to disconnect your ${platform.name} account? This won't delete any songs you've already imported.`,
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
        }; const disconnectPlatform = async (platform: Platform) => {
            // Safeguard against linkedAccounts.value not being an array
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
                // Call the real API to unlink the account
                await PlatformService.unlinkAccount(linkedAccount.linked_account_id);

                // Remove from linked accounts
                linkedAccounts.value = linkedAccounts.value.filter(account =>
                    account.platform_id !== platform.platform_id
                );

                // Add to recent activity
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

        const getActivityIcon = (action: string) => {
            switch (action) {
                case 'import':
                    return cloudDownloadOutline;
                case 'connect':
                    return linkOutline;
                case 'disconnect':
                    return closeCircleOutline;
                default:
                    return refreshOutline;
            }
        };

        const formatActivityTime = (date: Date): string => {
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));

            if (diffDays > 0) {
                return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
            } else if (diffHours > 0) {
                return `${diffHours} hours ago`;
            } else if (diffMinutes > 0) {
                return `${diffMinutes} minutes ago`;
            } else {
                return 'Just now';
            }
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
            musicIcon: musicalNotes,
            personIcon: person,
            lockClosedIcon: lockClosed,
            getLinkedAccount,
            connectPlatform,
            confirmDisconnect,
            getActivityIcon,
            formatActivityTime
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
}

.platform-icon {
    width: 40px;
    height: 40px;
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

.activity-icon {
    color: var(--ion-color-primary);
    font-size: 1.5rem;
}

.activity-text {
    font-size: 0.95rem;
}

.activity-time {
    font-size: 0.8rem;
    color: var(--ion-color-medium);
    margin-top: 0.25rem;
}
</style>
