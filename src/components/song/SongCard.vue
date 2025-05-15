<template>    <ion-card class="song-card glass-effect animate__animated animate__fadeIn">
        <div class="cover-container">
            <ion-img v-if="song.cover_image_url" :src="song.cover_image_url" class="song-cover" />
            <div v-else class="song-cover placeholder-cover">
                <font-awesome-icon icon="music" size="lg" class="pulse-animation" />
            </div>
            <div class="play-overlay" v-if="showPlay && song.url" @click="playSong">
                <font-awesome-icon icon="play" class="play-icon" />
            </div>
            <div class="cover-gradient"></div>
        </div>
        <ion-card-header>
            <ion-card-subtitle class="artist-name">{{ song.artist_name_on_platform }}</ion-card-subtitle>
            <ion-card-title class="song-title">{{ song.title }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <p v-if="song.album_name" class="album-name">
                <font-awesome-icon icon="headphones" /> {{ song.album_name }}
            </p>
            <div class="song-stats">
                <div class="stat-chip">
                    <font-awesome-icon icon="music" />
                    <span>{{ formatDuration(song.duration_ms) }}</span>
                </div>
                <div class="stat-chip" :class="song.is_visible ? 'visible' : 'hidden'">
                    <font-awesome-icon :icon="song.is_visible ? 'eye' : 'eye-slash'" />
                    <span>{{ song.is_visible ? 'Visible' : 'Hidden' }}</span>
                </div>
            </div>
        </ion-card-content>
        <div class="song-actions">
            <ion-button v-if="showEdit" fill="clear" size="small" @click="$emit('edit', song)" class="edit-button">
                <font-awesome-icon icon="edit" /> <span>Edit</span>
            </ion-button>
            <ion-button v-if="showSubmit" fill="clear" size="small" color="success" @click="$emit('submit', song)" class="submit-button">
                <font-awesome-icon icon="paper-plane" /> <span>Submit</span>
            </ion-button>
            <ion-button v-if="showDelete" fill="clear" size="small" color="danger" @click="$emit('delete', song)" class="delete-button">
                <font-awesome-icon icon="trash" /> <span>Delete</span>
            </ion-button>
        </div>
    </ion-card>
</template>

<script setup lang="ts">
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonImg
} from '@ionic/vue';
import { FontAwesomeIcon } from '@/plugins/fontawesome';
import { Song } from '@/types';

const props = defineProps({
    song: {
        type: Object as () => Song,
        required: true
    },
    showPlay: {
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

defineEmits(['edit', 'delete', 'submit']);

function formatDuration(durationMs?: number): string {
    if (!durationMs) return '0:00';

    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function playSong() {
    if (props.song.url) {
        window.open(props.song.url, '_blank');
    }
}
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables';
@import '../../assets/styles/mixins';

// Add animations for the song card
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }
    50% {
        transform: scale(1.05);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 0.8;
    }
}

.song-card {
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin: 10px 0;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 3px solid $primary-color;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        
        .cover-container::after {
            opacity: 0.5;
        }
        
        .play-overlay {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .song-title {
            color: $primary-color;
        }
    }
}

// Add new styles for cover gradient
.cover-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba($primary-color, 0.6), rgba($accent-color, 0.6));
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 5;
    pointer-events: none;
}

.cover-container {
    position: relative;
    overflow: hidden;
    height: 180px;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6));
        opacity: 0.3;
        transition: opacity 0.3s ease;
    }
}

.song-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $primary-color, $accent-color);
    color: white;
    font-size: 2rem;
}

.play-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba($primary-color, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    opacity: 0;
    transition: all 0.3s ease;
    
    .play-icon {
        color: white;
        font-size: 1.2rem;
        margin-left: 3px; // centering the icon
    }
}

.artist-name {
    font-size: 0.9rem;
    color: $light-color;
    opacity: 0.8;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
}

.song-title {
    font-size: 1.3rem;
    font-weight: $font-weight-bold;
    color: $light-color;
    line-height: 1.3;
    margin-top: 0;
}

.album-name {
    font-size: 0.9rem;
    color: $light-color;
    opacity: 0.7;
    margin-bottom: 10px;
    
    svg {
        margin-right: 5px;
        opacity: 0.8;
    }
}

.song-stats {
    display: flex;
    gap: 10px;
    margin-top: 15px;
    flex-wrap: wrap;
}

.stat-chip {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    font-size: 0.8rem;
    color: $light-color;
    
    svg {
        margin-right: 5px;
        font-size: 0.9rem;
    }
    
    &.visible {
        background: rgba($success-color, 0.2);
    }
    
    &.hidden {
        background: rgba($medium-color, 0.2);
    }
}

.song-actions {
    display: flex;
    padding: 10px;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    ion-button {
        margin: 0 3px;
        --color: $light-color;
        
        &.edit-button {
            --color: $primary-color;
        }
        
        &.submit-button {
            --color: $success-color;
        }
        
        &.delete-button {
            --color: $danger-color;
        }
        
        span {
            margin-left: 5px;
        }
        
        &:hover {
            --background: rgba(255, 255, 255, 0.1);
        }
    }
}

.animate__animated {
    animation-duration: 0.8s;
}

.animate__fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
}

.pulse-animation {
    animation: pulse 2s infinite;
}
</style>
