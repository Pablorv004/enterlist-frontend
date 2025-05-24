<template>
    <ion-page>
        <app-header title="Enterlist"></app-header>
        <ion-content :fullscreen="true" class="home-page">
            <div class="hero-section">
                <div class="hero-content">
                    <img src="@/assets/logo.png" alt="Enterlist Logo" class="logo" />
                    <h1 class="title gradient-text">ENTERLIST</h1>
                    <p class="subtitle">The platform connecting artists with playlist creators</p>

                    <div class="cta-buttons">
                        <ion-button v-if="!isAuthenticated" router-link="/login" shape="round" size="large"
                            class="login-button">
                            Sign In
                        </ion-button>
                        <ion-button v-if="!isAuthenticated" router-link="/register" shape="round" size="large"
                            fill="outline" class="register-button">
                            Create Account
                        </ion-button>
                        <ion-button v-if="isAuthenticated" router-link="/dashboard" shape="round" size="large"
                            class="dashboard-button">
                            Go to Dashboard
                        </ion-button>
                    </div>
                </div>
            </div>

            <div class="features-section">
                <h2 class="section-title">How It Works</h2>

                <div class="features-grid">
                    <ion-card class="feature-card">
                        <ion-card-header>
                            <ion-icon :icon="personIcon" class="feature-icon" color="primary"></ion-icon>
                            <ion-card-title>For Artists</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ol class="feature-list">
                                <li>Create an account as an Artist</li>
                                <li>Connect your music platforms</li>
                                <li>Browse and discover relevant playlists</li>
                                <li>Submit your tracks with personalized messages</li>
                                <li>Track the status of your submissions</li>
                            </ol>
                        </ion-card-content>
                    </ion-card>

                    <ion-card class="feature-card">
                        <ion-card-header>
                            <ion-icon :icon="musicIcon" class="feature-icon" color="primary"></ion-icon>
                            <ion-card-title>For Playlist Creators</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ol class="feature-list">
                                <li>Create an account as a Playlist Creator</li>
                                <li>Connect your playlist platforms</li>
                                <li>Set up your playlists with submission requirements</li>
                                <li>Review and manage song submissions</li>
                                <li>Discover fresh talents and tracks</li>
                            </ol>
                        </ion-card-content>
                    </ion-card>
                </div>
            </div>

            <div class="platforms-section">
                <h2 class="section-title">Supported Platforms</h2>

                <div class="platforms-grid">
                    <div class="platform-item">
                        <ion-icon :icon="spotifyIcon" class="platform-icon spotify"></ion-icon>
                        <span class="platform-name">Spotify</span>
                    </div>
                    <div class="platform-item">
                        <ion-icon :icon="youtubeIcon" class="platform-icon youtube"></ion-icon>
                        <span class="platform-name">YouTube</span>
                    </div>
                </div>
            </div>

            <footer class="page-footer">
                <p>&copy; 2025 Enterlist. All rights reserved.</p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Terms of Service</a>
                    <a href="#" class="footer-link">Privacy Policy</a>
                    <a href="#" class="footer-link">Contact Us</a>
                </div>
            </footer>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import {
    IonPage,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon
} from '@ionic/vue';
import { person, musicalNotes, playCircleOutline as logoSpotify, logoYoutube } from 'ionicons/icons';
import { useAuthStore } from '@/store';
import AppHeader from '@/components/AppHeader.vue';

export default defineComponent({
    name: 'HomePage',
    components: {
        IonPage,
        IonContent,
        IonButton,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonIcon,
        AppHeader
    },
    setup() {
        const authStore = useAuthStore();
        const isAuthenticated = computed(() => authStore.isAuthenticated);

        // Icons
        const personIcon = person;
        const musicIcon = musicalNotes;
        const spotifyIcon = logoSpotify;
        const youtubeIcon = logoYoutube;

        return {
            isAuthenticated,
            personIcon,
            musicIcon,
            spotifyIcon,
            youtubeIcon
        };
    }
});
</script>

<style scoped>
.home-page {
    --background: #f9f9f9;
}

.hero-section {
    background: url('@/assets/blurred-blue-red-purple-bg.webp') no-repeat center center;
    background-size: cover;
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

.logo {
    width: 150px;
    height: auto;
    margin-bottom: 1rem;
    margin-left: auto;
    margin-right: auto;
}

.title {
    font-size: 4rem;
    font-weight: 900;
    letter-spacing: 0.2rem;
    margin-bottom: 1rem;
    text-align: center;
}

.subtitle {
    font-size: 1.5rem;
    color: white;
    margin-bottom: 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.login-button,
.dashboard-button {
    --background: var(--background-gradient);
    font-weight: 600;
    min-width: 140px;
}

.register-button {
    --border-color: white;
    --color: white;
    font-weight: 600;
    min-width: 140px;
}

.features-section {
    padding: 5rem 2rem;
    background-color: white;
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--ion-color-primary);
    font-weight: 800;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

ion-card-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--ion-color-primary);
}

.feature-list {
    padding-left: 1.5rem;
    margin-top: 1rem;
}

.feature-list li {
    margin-bottom: 0.8rem;
    line-height: 1.6;
}

.platforms-section {
    padding: 5rem 2rem;
    background-color: #f2f2f2;
}

.platforms-grid {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
    max-width: 1200px;
    margin: 0 auto;
}

.platform-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.platform-icon {
    font-size: 4rem;
}

.platform-name {
    font-size: 1.2rem;
    font-weight: 500;
}

.spotify {
    color: #1DB954;
}

.youtube {
    color: #FF0000;
}

.page-footer {
    background-color: var(--ion-color-dark);
    color: white;
    text-align: center;
    padding: 2rem;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
}

.footer-link {
    color: var(--ion-color-medium);
    text-decoration: none;
    transition: color 0.2s ease;
}

.footer-link:hover {
    color: white;
}

/* Media Queries */
@media (max-width: 768px) {
    .title {
        font-size: 2.5rem;
    }

    .subtitle {
        font-size: 1.2rem;
    }

    .cta-buttons {
        flex-direction: column;
        gap: 1rem;
    }

    .section-title {
        font-size: 2rem;
    }

    .platforms-grid {
        gap: 1.5rem;
    }
}
</style>
