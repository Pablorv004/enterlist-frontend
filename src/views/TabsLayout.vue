<template>
    <ion-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom" class="glass-tab-bar">
                <ion-tab-button tab="dashboard" href="/tabs/dashboard" class="tab-button">
                    <font-awesome-icon icon="home" class="tab-icon" />
                    <ion-label>Dashboard</ion-label>
                </ion-tab-button>

                <ion-tab-button v-if="isArtist" tab="songs" href="/tabs/songs" class="tab-button">
                    <font-awesome-icon icon="music" class="tab-icon" />
                    <ion-label>My Songs</ion-label>
                </ion-tab-button>

                <ion-tab-button v-if="isPlaylistMaker" tab="playlists" href="/tabs/playlists" class="tab-button">
                    <font-awesome-icon icon="list" class="tab-icon" />
                    <ion-label>My Playlists</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="submissions" href="/tabs/submissions" class="tab-button">
                    <font-awesome-icon icon="paper-plane" class="tab-icon" />
                    <ion-label>Submissions</ion-label>
                </ion-tab-button>

                <ion-tab-button v-if="isAdmin" tab="admin" href="/tabs/admin" class="tab-button">
                    <font-awesome-icon icon="cog" class="tab-icon" />
                    <ion-label>Admin</ion-label>
                </ion-tab-button>

                <ion-tab-button tab="profile" href="/tabs/profile" class="tab-button">
                    <font-awesome-icon icon="user" class="tab-icon" />
                    <ion-label>Profile</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonRouterOutlet
} from '@ionic/vue';
import { FontAwesomeIcon } from '@/plugins/fontawesome';
import { useAuthStore } from '@/store/auth';
import { computed } from 'vue';

const authStore = useAuthStore();

const isArtist = computed(() => authStore.isArtist);
const isPlaylistMaker = computed(() => authStore.isPlaylistMaker);
const isAdmin = computed(() => authStore.isAdmin);
</script>

<style lang="scss" scoped>
@import '../assets/styles/variables';

.glass-tab-bar {
    --background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    padding-bottom: env(safe-area-inset-bottom);
    padding-top: 8px;
    
    &::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 10px;
    }
}

.tab-button {
    --color: rgba(255, 255, 255, 0.6);
    --color-selected: $primary-color;
    position: relative;
    transition: all 0.3s ease;
    
    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%) scaleX(0);
        width: 24px;
        height: 3px;
        background: $primary-color;
        border-radius: 3px 3px 0 0;
        transition: transform 0.3s ease;
        opacity: 0;
    }
    
    &.tab-selected {
        --color: $primary-color;
        
        &::before {
            transform: translateX(-50%) scaleX(1);
            opacity: 1;
        }
        
        .tab-icon {
            transform: translateY(-4px) scale(1.15);
        }
    }
    
    .tab-icon {
        font-size: 1.2rem;
        margin-bottom: 4px;
        transition: transform 0.3s ease;
    }
      ion-label {
        font-size: 12px;
        font-weight: 500; /* Use direct value instead of variable */
        text-transform: capitalize;
        letter-spacing: 0.3px;
    }
}
</style>
