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
                        <ion-card-header class="centered-header">
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
                                    <ion-label class="platform-label">
                                        <h2 class="platform-name">Spotify</h2>
                                        <p v-if="getLinkedAccount('spotify')" class="connection-status">
                                            {{ `Connected as ${getLinkedAccount('spotify')?.external_user_id}` }}
                                        </p>
                                        <p v-else class="connection-status">Not connected</p>
                                    </ion-label>
                                    <ion-button 
                                        v-if="getLinkedAccount('spotify')" 
                                        color="danger" 
                                        fill="outline" 
                                        size="small"
                                        class="action-button"
                                        @click="confirmDisconnect('spotify')"
                                    >
                                        Disconnect
                                    </ion-button>
                                    <ion-button 
                                        v-else 
                                        color="primary"
                                        size="small"
                                        class="action-button"
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
                                    <ion-label class="platform-label">
                                        <h2 class="platform-name">YouTube</h2>
                                        <p v-if="getLinkedAccount('youtube')" class="connection-status">
                                            {{ `Connected as ${getLinkedAccount('youtube')?.external_user_id}`}}
                                        </p>
                                        <p v-else class="connection-status">Not connected</p>
                                    </ion-label>
                                    <ion-button 
                                        v-if="getLinkedAccount('youtube')" 
                                        color="danger" 
                                        fill="outline" 
                                        size="small"
                                        class="action-button"
                                        @click="confirmDisconnect('youtube')"
                                    >
                                        Disconnect
                                    </ion-button>
                                    <ion-button 
                                        v-else 
                                        color="primary"
                                        size="small"
                                        class="action-button"
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
                            <ion-card-title>Account Permissions</ion-card-title>
                            <ion-card-subtitle>Understand what permissions we request</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <div class="permission-item">
                                <ion-icon :icon="musicalNotes" class="permission-icon"></ion-icon>
                                <div class="permission-content">
                                    <h3>Read Your Music Library</h3>
                                    <p>We access your music content to help you import it to your profile</p>
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
                </div>
            </div>
        </ion-content>
        
        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="profile"></bottom-navigation>
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
    musicalNotes, person, lockClosed,
    refreshOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { PlatformService } from '@/services/PlatformService';
import { SongService } from '@/services/SongService';
import { PlaylistService } from '@/services/PlaylistService';
import { useAuthStore } from '@/store';
import { LinkedAccount, Platform } from '@/types';

interface SyncSettings {
    autoSync: boolean;
    autoImportNew: boolean;
}

export default defineComponent({
    name: 'LinkedAccountsComponent',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
        IonCardContent, IonList, IonItem, IonThumbnail, IonLabel, IonButton,
        IonIcon, IonSpinner, IonToggle, AppHeader, BottomNavigation
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

        // Computed property to check if there are linked accounts
        const hasLinkedAccounts = computed(() => {
            return Array.isArray(linkedAccounts.value) && linkedAccounts.value.length > 0;
        });
        // Simplified content - removed user type conditionals
        const title = computed(() => 'Linked Accounts');
        
        const backUrl = computed(() => '/dashboard');

        const accountsTitle = computed(() => 'Music Platform Accounts');

        const accountsSubtitle = computed(() => 'Connect your music platforms to import your content');

        const accountsIntro = computed(() => 
            'Link your music platforms to easily import your content and manage it from a single place. We\'ll never post anything without your permission.'
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
        };        const connectPlatform = async (platformName: string) => {
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
                    // Store current path for redirect after OAuth
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
            
            const alert = await alertController.create({
                header: 'Disconnect Account',
                message: `Are you sure you want to disconnect your ${platform.name} account? This won't delete any content you've already imported.`,
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

                showToast(`Successfully disconnected from ${platform.name}`, 'success');
            } catch (error) {
                console.error('Failed to disconnect platform:', error);
                showToast(`Failed to disconnect from ${platform.name}`, 'danger');
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
            hasLinkedAccounts,
            // Simplified content
            title,
            backUrl,
            accountsTitle,
            accountsSubtitle,
            accountsIntro,
            // Icons
            musicalNotes,
            personIcon: person,
            lockClosedIcon: lockClosed,
            refreshOutlineIcon: refreshOutline,
            // Functions
            getLinkedAccount,
            connectPlatform,
            confirmDisconnect,
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
.permissions-card,

.centered-header {
    text-align: center;
}

.accounts-intro {
    margin-bottom: 1.5rem;
    color: var(--ion-color-medium);
    line-height: 1.5;
    text-align: center;
}

.platform-item {
    --padding-start: 0;
    --inner-padding-end: 0;
    --padding-top: 0.75rem;
    --padding-bottom: 0.75rem;
    display: flex;
    align-items: center;
}

.platform-label {
    flex: 1;
    min-width: 0; /* Allow text to shrink */
    margin-right: 0.5rem;
}

.platform-name {
    font-weight: bold;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 0 0.25rem 0;
}

.connection-status {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
    font-size: 0.875rem;
}

.action-button {
    flex-shrink: 0; /* Prevent buttons from shrinking */
    min-width: 80px;
    --padding-start: 8px;
    --padding-end: 8px;
}

/* Mobile-specific adjustments */
@media (max-width: 480px) {
    .platform-label {
        max-width: calc(100vw - 180px); /* Account for icon + button + padding */
    }
    
    .action-button {
        min-width: 70px;
        font-size: 0.8rem;
    }
    
    .connection-status {
        font-size: 0.8rem;
    }
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
    text-align: left;
    align-items: left;
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
</style>
