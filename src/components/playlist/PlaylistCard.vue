<template>
    <ion-card>
        <ion-img v-if="playlist.cover_image_url" :src="playlist.cover_image_url" />
        <ion-card-header>
            <ion-card-subtitle>{{ playlist.platform ? platformName : 'Unknown Platform' }}</ion-card-subtitle>
            <ion-card-title>{{ playlist.name }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <p v-if="playlist.description">{{ playlist.description }}</p>
            <div class="playlist-stats">
                <ion-chip>
                    <ion-icon :icon="people"></ion-icon>
                    <ion-label>{{ formatFollowers(playlist.follower_count) }}</ion-label>
                </ion-chip>
                <ion-chip v-if="playlist.genre">
                    <ion-icon :icon="musicalNote"></ion-icon>
                    <ion-label>{{ playlist.genre }}</ion-label>
                </ion-chip>
            </div>
        </ion-card-content>
        <ion-item lines="none">
            <ion-button v-if="showView" fill="clear" size="small" @click="$emit('view', playlist)">
                <ion-icon slot="start" :icon="eye"></ion-icon>
                View
            </ion-button>
            <ion-button v-if="showEdit" fill="clear" size="small" @click="$emit('edit', playlist)">
                <ion-icon slot="start" :icon="create"></ion-icon>
                Edit
            </ion-button>
            <ion-button v-if="showSubmit" fill="clear" size="small" color="success" @click="$emit('submit', playlist)">
                <ion-icon slot="start" :icon="add"></ion-icon>
                Submit
            </ion-button>
            <ion-button v-if="showDelete" fill="clear" size="small" color="danger" @click="$emit('delete', playlist)">
                <ion-icon slot="start" :icon="trash"></ion-icon>
                Delete
            </ion-button>
        </ion-item>
    </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonItem,
    IonImg
} from '@ionic/vue';
import { eye, create, add, trash, people, musicalNote } from 'ionicons/icons';
import { Playlist, Platform } from '@/types';

const props = defineProps({
    playlist: {
        type: Object as () => Playlist,
        required: true
    },
    platforms: {
        type: Array as () => Platform[],
        default: () => []
    },
    showView: {
        type: Boolean,
        default: true
    },
    showEdit: {
        type: Boolean,
        default: false
    },
    showSubmit: {
        type: Boolean,
        default: false
    },
    showDelete: {
        type: Boolean,
        default: false
    }
});

defineEmits(['view', 'edit', 'delete', 'submit']);

const platformName = computed(() => {
    const platform = props.platforms.find(p => p.platform_id === props.playlist.platform_id);
    return platform ? platform.name : '';
});

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
.playlist-stats {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}
</style>
