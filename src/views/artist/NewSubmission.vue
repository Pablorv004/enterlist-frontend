<template>
    <ion-page>
        <app-header title="Submit Your Music" :back-button="true" back-url="/artist/submissions"></app-header>

        <ion-content :fullscreen="true" class="new-submission-content">
            <div class="new-submission-container">
                <!-- Stepper Header -->
                <div class="stepper-header">
                    <div v-for="(step, index) in steps" :key="index"
                        :class="['step', { 'step-active': currentStep >= index, 'step-complete': currentStep > index }]">
                        <div class="step-indicator">
                            <ion-icon v-if="currentStep > index" :icon="checkmarkIcon" class="step-icon"></ion-icon>
                            <span v-else>{{ index + 1 }}</span>
                        </div>
                        <div class="step-label">{{ step }}</div>
                        <div v-if="index < steps.length - 1" class="step-connector"></div>
                    </div>
                </div>

                <!-- Step 1: Select Song -->
                <div v-if="currentStep === 0" class="step-content">
                    <h2 class="step-title">Select a Song</h2>
                    <p class="step-description">Choose a song from your library to submit to playlist curators</p>

                    <div v-if="loadingSongs" class="loading-container">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading your songs...</p>
                    </div>

                    <div v-else-if="songs.length === 0" class="no-songs-container">
                        <ion-icon :icon="musicalNoteIcon" class="empty-icon"></ion-icon>
                        <h3>No Songs Found</h3>
                        <p>You haven't added any songs to your library yet.</p>
                        <ion-button router-link="/artist/songs" color="primary">
                            Add Songs First
                        </ion-button>
                    </div>

                    <div v-else>
                        <!-- Song Search -->
                        <ion-searchbar v-model="songSearchQuery" placeholder="Search your songs..."
                            @ionInput="searchSongs" class="song-search"></ion-searchbar>

                        <!-- Song List -->
                        <ion-list class="song-list">
                            <ion-radio-group v-model="selectedSongId">
                                <ion-item v-for="song in filteredSongs" :key="song.song_id" class="song-item"
                                    :class="{ 'selected-song': selectedSongId === song.song_id }">
                                    <ion-radio slot="start" :value="song.song_id"></ion-radio>

                                    <ion-thumbnail slot="start" class="song-thumbnail">
                                        <img :src="song.cover_image_url || '/assets/default-album-cover.png'"
                                            :alt="song.title" />
                                    </ion-thumbnail>

                                    <ion-label>
                                        <h2>{{ song.title }}</h2>
                                        <p>{{ song.artist_name_on_platform }}</p>
                                        <p v-if="song.album_name">{{ song.album_name }}</p>
                                    </ion-label>

                                    <ion-button v-if="song.url" fill="clear" slot="end" color="primary"
                                        @click.stop="previewSong(song.url)">
                                        <ion-icon :icon="playIcon" slot="icon-only"></ion-icon>
                                    </ion-button>
                                </ion-item>
                            </ion-radio-group>
                        </ion-list>
                    </div>

                    <div class="step-buttons">
                        <ion-button fill="outline" router-link="/artist/songs">
                            <ion-icon :icon="addIcon" slot="start"></ion-icon>
                            Add More Songs
                        </ion-button>
                        <ion-button @click="goToNextStep" :disabled="!selectedSongId || loadingSongs">
                            Continue
                            <ion-icon :icon="arrowForwardIcon" slot="end"></ion-icon>
                        </ion-button>
                    </div>
                </div>

                <!-- Step 2: Select Playlist -->
                <div v-if="currentStep === 1" class="step-content">
                    <h2 class="step-title">Choose a Playlist</h2>
                    <p class="step-description">Select a playlist that matches your music style</p>

                    <div v-if="loadingPlaylists" class="loading-container">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading available playlists...</p>
                    </div>

                    <div v-else-if="playlists.length === 0" class="no-playlists-container">
                        <ion-icon :icon="albumsOutline" class="empty-icon"></ion-icon>
                        <h3>No Playlists Available</h3>
                        <p>There are no playlists available for submission at the moment.</p>
                    </div>

                    <div v-else>
                        <!-- Playlist Filters -->
                        <div class="playlist-filters">
                            <ion-searchbar v-model="playlistSearchQuery" placeholder="Search playlists..."
                                @ionInput="searchPlaylists" class="playlist-search"></ion-searchbar>

                            <ion-item class="filter-item">
                                <ion-label>Genre</ion-label>
                                <ion-select v-model="selectedGenre" interface="action-sheet" placeholder="All Genres"
                                    @ionChange="filterPlaylists">
                                    <ion-select-option value="">All Genres</ion-select-option>
                                    <ion-select-option v-for="genre in availableGenres" :key="genre" :value="genre">
                                        {{ formatGenre(genre) }}
                                    </ion-select-option>
                                </ion-select>
                            </ion-item>

                            <ion-item class="filter-item">
                                <ion-label>Sort By</ion-label>                                <ion-select v-model="playlistSort" interface="action-sheet"
                                    placeholder="Name (A-Z)" @ionChange="sortPlaylists">
                                    <ion-select-option value="name_asc">Name (A-Z)</ion-select-option>
                                    <ion-select-option value="name_desc">Name (Z-A)</ion-select-option>
                                </ion-select>
                            </ion-item>
                        </div>

                        <!-- Playlist Grid -->
                        <div class="playlist-grid">
                            <ion-card v-for="playlist in filteredPlaylists" :key="playlist.playlist_id"
                                class="playlist-card"
                                :class="{ 'selected-playlist': selectedPlaylistId === playlist.playlist_id }"
                                @click="selectPlaylist(playlist.playlist_id)">
                                <div class="playlist-image-container">
                                    <img :src="playlist.cover_image_url || '/assets/default-playlist-cover.png'"
                                        :alt="playlist.name" class="playlist-image" />
                                    <div class="playlist-overlay">
                                        <ion-button fill="clear" color="light"
                                            @click.stop="showPlaylistDetails(playlist)">
                                            <ion-icon :icon="informationIcon" slot="icon-only"></ion-icon>
                                        </ion-button>
                                    </div>
                                </div>                                <ion-card-header>
                                    <ion-card-title>{{ playlist.name }}</ion-card-title>
                                    <ion-card-subtitle v-if="playlist.genre">
                                        <ion-icon :icon="musicalNotesIcon" class="subtitle-icon"></ion-icon>
                                        {{ formatGenre(playlist.genre) }}
                                    </ion-card-subtitle>
                                </ion-card-header>                                <ion-card-content>
                                    <div class="submission-fee">
                                        <ion-badge color="primary">
                                            ${{ (playlist.submission_fee! / 100).toFixed(2) }} submission fee
                                        </ion-badge>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </div>
                    </div>

                    <div class="step-buttons">
                        <ion-button fill="outline" @click="goToPreviousStep">
                            <ion-icon :icon="arrowBackIcon" slot="start"></ion-icon>
                            Back
                        </ion-button>
                        <ion-button @click="goToNextStep" :disabled="!selectedPlaylistId || loadingPlaylists">
                            Continue
                            <ion-icon :icon="arrowForwardIcon" slot="end"></ion-icon>
                        </ion-button>
                    </div>
                </div>

                <!-- Step 3: Review & Payment -->
                <div v-if="currentStep === 2" class="step-content">
                    <h2 class="step-title">Review & Payment</h2>
                    <p class="step-description">Review your submission details and complete payment</p>

                    <div v-if="loadingDetails" class="loading-container">
                        <ion-spinner name="crescent"></ion-spinner>
                        <p>Loading submission details...</p>
                    </div>

                    <div v-else class="review-container">
                        <!-- Summary Cards -->
                        <div class="summary-cards">
                            <!-- Song Summary -->
                            <ion-card class="summary-card song-summary" v-if="selectedSong">
                                <ion-card-header>
                                    <ion-card-title>Song</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <div class="summary-content">
                                        <ion-thumbnail class="summary-thumbnail">
                                            <img :src="selectedSong.cover_image_url || '/assets/default-album-cover.png'"
                                                :alt="selectedSong.title" />
                                        </ion-thumbnail>
                                        <div class="summary-details">
                                            <h3>{{ selectedSong.title }}</h3>
                                            <p v-if="selectedSong.artist_name_on_platform">{{
                                                selectedSong.artist_name_on_platform }}</p>
                                            <p v-if="selectedSong.album_name">{{ selectedSong.album_name }}</p>
                                            <div class="summary-actions">
                                                <ion-button v-if="selectedSong.url" fill="clear" size="small"
                                                    color="primary" @click="previewSong(selectedSong.url)">
                                                    <ion-icon :icon="playIcon" slot="start"></ion-icon>
                                                    Preview
                                                </ion-button>
                                                <ion-button fill="clear" size="small" color="primary"
                                                    @click="showSongDetails(selectedSong)">
                                                    <ion-icon :icon="informationIcon" slot="start"></ion-icon>
                                                    View Details
                                                </ion-button>
                                            </div>
                                        </div>
                                    </div>
                                </ion-card-content>
                            </ion-card>

                            <!-- Playlist Summary -->
                            <ion-card class="summary-card playlist-summary" v-if="selectedPlaylist">
                                <ion-card-header>
                                    <ion-card-title>Playlist</ion-card-title>
                                </ion-card-header>
                                <ion-card-content>
                                    <div class="summary-content">
                                        <ion-thumbnail class="summary-thumbnail">
                                            <img :src="selectedPlaylist.cover_image_url || '/assets/default-playlist-cover.png'"
                                                :alt="selectedPlaylist.name" />
                                        </ion-thumbnail>
                                        <div class="summary-details">
                                            <h3>{{ selectedPlaylist.name }}</h3>
                                            <p v-if="selectedPlaylist.genre">{{ formatGenre(selectedPlaylist.genre) }}</p>
                                            <div class="summary-actions">
                                                <ion-button fill="clear" size="small" color="primary"
                                                    @click="showPlaylistDetailsInReview(selectedPlaylist)">
                                                    <ion-icon :icon="informationIcon" slot="start"></ion-icon>
                                                    View Details
                                                </ion-button>
                                            </div>
                                        </div>
                                    </div>
                                </ion-card-content>
                            </ion-card>
                        </div>

                        <!-- Submission Message -->
                        <ion-card class="message-card">
                            <ion-card-header>
                                <ion-card-title>Message to Curator (Optional)</ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <ion-textarea v-model="submissionMessage"
                                    placeholder="Add a personal message to the playlist curator about your song..."
                                    :rows="4" class="message-textarea"></ion-textarea>
                                <p class="char-count">{{ submissionMessage.length }}/500 characters</p>
                            </ion-card-content>
                        </ion-card>

                        <!-- Payment Method -->
                        <ion-card class="payment-card">
                            <ion-card-header>
                                <ion-card-title>Payment Method</ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <div v-if="loadingPaymentMethods" class="loading-payment">
                                    <ion-spinner name="dots"></ion-spinner>
                                    <p>Loading payment methods...</p>
                                </div>

                                <div v-else-if="paymentMethods.length === 0" class="no-payment-methods">
                                    <p>You haven't added any payment methods yet.</p>
                                    <ion-button router-link="/artist/payment-methods" fill="outline" size="small">
                                        <ion-icon :icon="addIcon" slot="start"></ion-icon>
                                        Add Payment Method
                                    </ion-button>
                                </div>

                                <ion-radio-group v-else v-model="selectedPaymentMethodId">
                                    <ion-item v-for="method in paymentMethods" :key="method.payment_method_id"
                                        class="payment-method-item">
                                        <ion-radio slot="start" :value="method.payment_method_id"></ion-radio>

                                        <ion-label>
                                            <h3>{{ formatPaymentMethod(method) }}</h3>
                                            <p>{{ formatPaymentDetails(method) }}</p>
                                        </ion-label>

                                        <ion-badge v-if="method.is_default" color="success"
                                            slot="end">Default</ion-badge>
                                    </ion-item>
                                </ion-radio-group>

                                <div class="payment-actions">
                                    <ion-button router-link="/artist/payment-methods" fill="outline" size="small">
                                        <ion-icon :icon="addIcon" slot="start"></ion-icon>
                                        Manage Payment Methods
                                    </ion-button>
                                </div>
                            </ion-card-content>
                        </ion-card>

                        <!-- Payment Summary -->
                        <ion-card v-if="selectedPlaylist" class="summary-card payment-summary">
                            <ion-card-header>
                                <ion-card-title>Payment Summary</ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <div class="summary-item">
                                    <span>Submission Fee</span>
                                    <span>${{ (selectedPlaylist.submission_fee! / 100).toFixed(2) }}</span>
                                </div>

                                <div class="summary-item">
                                    <span>Platform Fee</span>
                                    <span>${{ (calculatePlatformFee(selectedPlaylist.submission_fee!) / 100).toFixed(2)
                                        }}</span>
                                </div>

                                <div class="summary-item total">
                                    <span>Total</span>
                                    <span>${{ (calculateTotal(selectedPlaylist.submission_fee!) / 100).toFixed(2)
                                        }}</span>
                                </div>
                            </ion-card-content>
                        </ion-card>
                    </div>

                    <div class="step-buttons">
                        <ion-button fill="outline" @click="goToPreviousStep">
                            <ion-icon :icon="arrowBackIcon" slot="start"></ion-icon>
                            Back
                        </ion-button>
                        <ion-button color="success" @click="submitSong" :disabled="!canSubmit || isSubmitting">
                            <ion-spinner v-if="isSubmitting" name="dots"></ion-spinner>
                            <span v-else>Submit Song</span>
                        </ion-button>
                    </div>
                </div>

                <!-- Success Step -->
                <div v-if="currentStep === 3" class="step-content success-content">
                    <div class="success-container">
                        <div class="success-icon-container">
                            <ion-icon :icon="checkmarkCircleIcon" class="success-icon"></ion-icon>
                        </div>

                        <h2>Submission Complete!</h2>
                        <p>Your song has been successfully submitted to the playlist curator for review.</p>

                        <div class="success-details">
                            <p><strong>Submission ID:</strong> {{ submissionResult?.submission_id }}</p>
                            <p><strong>Song:</strong> {{ selectedSong?.title }}</p>
                            <p><strong>Playlist:</strong> {{ selectedPlaylist?.name }}</p>
                            <p><strong>Status:</strong> Pending Review</p>
                        </div>

                        <div class="success-buttons">
                            <ion-button router-link="/artist/submissions" fill="outline">
                                View All Submissions
                            </ion-button>
                            <ion-button :router-link="`/artist/submissions/${submissionResult?.submission_id}`"
                                color="primary">
                                View Submission Details
                            </ion-button>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>

        <!-- Song Details Modal -->
        <ion-modal :is-open="showSongModal" @didDismiss="showSongModal = false">
            <song-details-modal
                v-if="selectedModalSong"
                :song="selectedModalSong"
                :show-edit-buttons="false"
            />
        </ion-modal>

        <!-- Playlist Details Modal -->
        <ion-modal :is-open="showPlaylistModal" @didDismiss="showPlaylistModal = false">
            <playlist-details-modal
                v-if="selectedModalPlaylist"
                :playlist="selectedModalPlaylist"
                :show-edit-buttons="false"
            />
        </ion-modal>
        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="submissions"></bottom-navigation>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    IonPage, IonContent, IonSpinner, IonIcon, IonButton, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonSearchbar, IonList, IonItem,
    IonThumbnail, IonLabel, IonBadge, IonRadio, IonRadioGroup, IonSelect, IonSelectOption,
    IonTextarea, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
    toastController, alertController
} from '@ionic/vue';
import {
    checkmark, arrowForward, arrowBack, musicalNote, musicalNotes, play, add,
    checkmarkCircle, person, informationCircle, timer, people, cash, open,
    albumsOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import { SongService } from '@/services/SongService';
import { PlaylistService } from '@/services/PlaylistService';
import { SubmissionService } from '@/services/SubmissionService';
import BottomNavigation from '@/components/BottomNavigation.vue';
import PlaylistDetailsModal from '@/components/PlaylistDetailsModal.vue';
import { PaymentMethodService } from '@/services/PaymentMethodService';
import { Song, Playlist, PaymentMethod, Submission } from '@/types';
import { useAuthStore } from '@/store';
import SongDetailsModal from '@/components/SongDetailsModal.vue';

export default defineComponent({
    name: 'ArtistNewSubmission',
    components: {
        IonPage, IonContent, IonSpinner, IonIcon, IonButton, IonCard, IonCardHeader,
        IonCardTitle, IonCardSubtitle, IonCardContent, IonSearchbar, IonList, IonItem,
        IonThumbnail, IonLabel, IonBadge, IonRadio, IonRadioGroup, IonSelect, IonSelectOption,
        IonTextarea, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons,
        AppHeader, BottomNavigation, PlaylistDetailsModal, SongDetailsModal
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const authStore = useAuthStore();

        // Step Management
        const steps = ['Select Song', 'Choose Playlist', 'Review & Pay'];
        const currentStep = ref(0);

        // Song Selection - Step 1
        const songs = ref<Song[]>([]);
        const filteredSongs = ref<Song[]>([]);
        const loadingSongs = ref(true);
        const selectedSongId = ref<string | null>(null);
        const songSearchQuery = ref('');

        // Playlist Selection - Step 2
        const playlists = ref<Playlist[]>([]);
        const filteredPlaylists = ref<Playlist[]>([]);
        const loadingPlaylists = ref(true);
        const selectedPlaylistId = ref<string | null>(null);        const playlistSearchQuery = ref('');
        const selectedGenre = ref('');
        const playlistSort = ref('name_asc');
        const showPlaylistModal = ref(false);
        const selectedModalPlaylist = ref<Playlist | null>(null);

        // Review & Payment - Step 3
        const loadingDetails = ref(false);
        const submissionMessage = ref('');
        const paymentMethods = ref<PaymentMethod[]>([]);
        const loadingPaymentMethods = ref(true);
        const selectedPaymentMethodId = ref<string | null>(null);
        const isSubmitting = ref(false);

        // Submission Result - Success Step
        const submissionResult = ref<Submission | null>(null);

        // Modal state
        const showSongModal = ref(false);
        const selectedModalSong = ref<Song | null>(null);

        // Initialize with pre-selected song if provided in query
        onMounted(async () => {
            // Check for pre-selected song from query
            const songIdFromQuery = route.query.songId as string;
            if (songIdFromQuery) {
                selectedSongId.value = songIdFromQuery;
            }

            // Load songs
            await loadSongs();

            // Set default payment method if available
            await loadPaymentMethods();
        });

        // Watch for songId changes in query
        watch(() => route.query.songId, (newSongId) => {
            if (newSongId && typeof newSongId === 'string') {
                selectedSongId.value = newSongId;
            }
        });

        // Computed props for selected items
        const selectedSong = computed(() => {
            return songs.value.find(song => song.song_id === selectedSongId.value) || null;
        });

        const selectedPlaylist = computed(() => {
            return playlists.value.find(playlist => playlist.playlist_id === selectedPlaylistId.value) || null;
        });

        const availableGenres = computed(() => {
            const genres = playlists.value
                .map(playlist => playlist.genre)
                .filter((genre): genre is string => !!genre);

            return [...new Set(genres)].sort();
        });

        const canSubmit = computed(() => {
            return (
                selectedSongId.value &&
                selectedPlaylistId.value &&
                selectedPaymentMethodId.value &&
                !isSubmitting.value
            );
        });

        // Load songs from API
        const loadSongs = async () => {
            try {
                loadingSongs.value = true;

                if (!authStore.user?.user_id) {
                    throw new Error('User not authenticated');
                }

                const response = await SongService.getSongsByArtist(authStore.user.user_id);
                songs.value = response.data;
                filteredSongs.value = [...songs.value];

                // Select the first song if none is selected and songs are available
                if (!selectedSongId.value && songs.value.length > 0 && !route.query.songId) {
                    selectedSongId.value = songs.value[0].song_id;
                }
            } catch (err) {
                showToast('Failed to load songs', 'danger');
                console.error(err);
            } finally {
                loadingSongs.value = false;
            }
        };

        // Search songs
        const searchSongs = () => {
            if (!songSearchQuery.value.trim()) {
                filteredSongs.value = [...songs.value];
                return;
            }

            const query = songSearchQuery.value.toLowerCase();
            filteredSongs.value = songs.value.filter(song =>
                song.title.toLowerCase().includes(query) ||
                (song.artist_name_on_platform && song.artist_name_on_platform.toLowerCase().includes(query)) ||
                (song.album_name && song.album_name.toLowerCase().includes(query))
            );
        };

        // Preview song
        const previewSong = (url: string) => {
            window.open(url, '_blank');
        };

        // Load playlists from API
        const loadPlaylists = async () => {
            try {
                loadingPlaylists.value = true;

                const response = await PlaylistService.getPlaylists();
                playlists.value = response.data;

                sortPlaylists();
            } catch (err) {
                showToast('Failed to load playlists', 'danger');
                console.error(err);
            } finally {
                loadingPlaylists.value = false;
            }
        };

        // Search playlists
        const searchPlaylists = () => {
            filterAndSortPlaylists();
        };

        // Filter playlists by genre
        const filterPlaylists = () => {
            filterAndSortPlaylists();
        };

        // Sort playlists
        const sortPlaylists = () => {
            filterAndSortPlaylists();
        };

        // Combined filter and sort function
        const filterAndSortPlaylists = () => {
            // First filter by search query
            let filtered = playlists.value;

            // Apply search filter
            if (playlistSearchQuery.value.trim()) {
                const query = playlistSearchQuery.value.toLowerCase();
                filtered = filtered.filter(playlist =>
                    playlist.name.toLowerCase().includes(query) ||
                    (playlist.description && playlist.description.toLowerCase().includes(query)) ||
                    (playlist.genre && playlist.genre.toLowerCase().includes(query))
                );
            }

            // Apply genre filter
            if (selectedGenre.value) {
                filtered = filtered.filter(playlist =>
                    playlist.genre && playlist.genre.toLowerCase() === selectedGenre.value.toLowerCase()
                );
            }            // Apply sorting
            switch (playlistSort.value) {
                case 'name_asc':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name_desc':
                    filtered.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }

            filteredPlaylists.value = filtered;
        };

        // Select playlist
        const selectPlaylist = (playlistId: string) => {
            selectedPlaylistId.value = playlistId;
        };

        // Show playlist details modal
        const showPlaylistDetails = (playlist: Playlist) => {
            selectedModalPlaylist.value = playlist;
            showPlaylistModal.value = true;
        };

        // Select playlist from modal
        const selectPlaylistFromModal = (playlistId: string) => {
            selectedPlaylistId.value = playlistId;
            showPlaylistModal.value = false;
        };

        // Load payment methods
        const loadPaymentMethods = async () => {
            try {
                loadingPaymentMethods.value = true;

                if (!authStore.user?.user_id) {
                    throw new Error('User not authenticated');
                }

                const methods = await PaymentMethodService.getPaymentMethods(authStore.user.user_id);
                paymentMethods.value = methods;

                // Set default payment method if available
                const defaultMethod = methods.find(method => method.is_default);
                if (defaultMethod) {
                    selectedPaymentMethodId.value = defaultMethod.payment_method_id;
                } else if (methods.length > 0) {
                    selectedPaymentMethodId.value = methods[0].payment_method_id;
                }
            } catch (err) {
                showToast('Failed to load payment methods', 'danger');
                console.error(err);
            } finally {
                loadingPaymentMethods.value = false;
            }
        };

        // Calculate platform fee (5% of submission fee)
        const calculatePlatformFee = (submissionFee: number): number => {
            return Math.round(submissionFee * 0.05);
        };

        // Calculate total payment
        const calculateTotal = (submissionFee: number): number => {
            return submissionFee + calculatePlatformFee(submissionFee);
        };

        // Submit song to playlist
        const submitSong = async () => {
            if (!canSubmit.value) {
                return;
            }

            try {
                isSubmitting.value = true;

                if (!authStore.user?.user_id) {
                    throw new Error('User not authenticated');
                }

                // Create submission
                const submission = await SubmissionService.createSubmission({
                    artist_id: authStore.user.user_id,
                    playlist_id: selectedPlaylistId.value!,
                    song_id: selectedSongId.value!,
                    submission_message: submissionMessage.value.trim()
                });

                submissionResult.value = submission;

                // Move to success step
                currentStep.value = 3;

                showToast('Submission successful!', 'success');
            } catch (err) {
                let errorMessage = 'Failed to submit song';

                if (err instanceof Error) {
                    errorMessage = err.message;
                }

                showErrorAlert('Submission Failed', errorMessage);
                console.error(err);
            } finally {
                isSubmitting.value = false;
            }
        };

        // Navigation
        const goToNextStep = async () => {
            if (currentStep.value === 0) {
                // Going from song selection to playlist selection
                if (!selectedSongId.value) {
                    showToast('Please select a song', 'warning');
                    return;
                }

                // Load playlists for step 2
                await loadPlaylists();
            } else if (currentStep.value === 1) {
                // Going from playlist selection to review & payment
                if (!selectedPlaylistId.value) {
                    showToast('Please select a playlist', 'warning');
                    return;
                }

                loadingDetails.value = true;

                // Load payment methods if not loaded yet
                if (paymentMethods.value.length === 0) {
                    await loadPaymentMethods();
                }

                loadingDetails.value = false;
            }

            currentStep.value += 1;
        };        const goToPreviousStep = () => {
            if (currentStep.value > 0) {
                currentStep.value -= 1;
            }
        };

        // Formatting helpers
        const formatGenre = (genre: string): string => {
            return genre.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        const formatPaymentMethod = (method: PaymentMethod): string => {
            if (method.type === 'paypal') {
                const details = JSON.parse(method.details);
                return `PayPal (${details.email})`;
            }
            return 'Unknown payment method';
        };

        const formatPaymentDetails = (method: PaymentMethod): string => {
            return '';
        };

        // Toast and alerts
        const showToast = async (message: string, color: string) => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                position: 'bottom',
                color
            });

            await toast.present();
        };

        const showErrorAlert = async (header: string, message: string) => {
            const alert = await alertController.create({
                header,
                message,
                buttons: ['OK']
            });

            await alert.present();
        };

        // Show song details modal
        const showSongDetails = (song: Song) => {
            selectedModalSong.value = song;
            showSongModal.value = true;
        };

        // Show playlist details modal in review step
        const showPlaylistDetailsInReview = (playlist: Playlist) => {
            selectedModalPlaylist.value = playlist;
            showPlaylistModal.value = true;
        };

        return {
            // Step management
            steps,
            currentStep,

            // Song selection
            songs,
            filteredSongs,
            loadingSongs,
            selectedSongId,
            songSearchQuery,
            selectedSong,
            searchSongs,

            // Playlist selection
            playlists,
            filteredPlaylists,
            loadingPlaylists,
            selectedPlaylistId,
            playlistSearchQuery,
            selectedGenre,
            playlistSort,
            availableGenres,
            selectedPlaylist,
            showPlaylistModal,
            selectedModalPlaylist,

            // Review & Payment
            loadingDetails,
            submissionMessage,
            paymentMethods,
            loadingPaymentMethods,
            selectedPaymentMethodId,
            isSubmitting,
            canSubmit,

            // Success step
            submissionResult,

            // Modal state
            showSongModal,
            showSongDetails,
            showPlaylistDetailsInReview,
            selectedModalSong,

            // Methods
            searchPlaylists,
            filterPlaylists,
            sortPlaylists,
            selectPlaylist,
            showPlaylistDetails,
            selectPlaylistFromModal,
            previewSong,
            calculatePlatformFee,
            calculateTotal,            submitSong,
            goToNextStep,
            goToPreviousStep,            // Formatting helpers
            formatGenre,
            formatPaymentMethod,
            formatPaymentDetails,

            // Icons
            checkmarkIcon: checkmark,
            arrowForwardIcon: arrowForward,
            arrowBackIcon: arrowBack,
            musicalNoteIcon: musicalNote,
            musicalNotesIcon: musicalNotes,
            playIcon: play,
            addIcon: add,
            checkmarkCircleIcon: checkmarkCircle,
            personIcon: person,
            informationIcon: informationCircle,
            timerIcon: timer,
            peopleIcon: people,
            cashIcon: cash,
            openIcon: open,
            albumsOutline
        };
    }
});
</script>

<style scoped>
.new-submission-content {
    --background: #f8f9fa;
}

.new-submission-container {
    padding: 1rem;
    max-width: 1100px;
    margin: 0 auto;
}

/* Stepper Header */
.stepper-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    position: relative;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
}

.step-indicator {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--ion-color-light);
    color: var(--ion-color-medium);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
    border: 2px solid var(--ion-color-light);
    transition: all 0.3s ease;
}

.step-active .step-indicator {
    background: var(--ion-color-primary);
    color: white;
    border-color: var(--ion-color-primary);
}

.step-complete .step-indicator {
    background: var(--ion-color-success);
    color: white;
    border-color: var(--ion-color-success);
}

.step-label {
    font-size: 0.85rem;
    font-weight: 500;
    text-align: center;
    color: var(--ion-color-medium);
    transition: all 0.3s ease;
}

.step-active .step-label,
.step-complete .step-label {
    color: var(--ion-color-dark);
    font-weight: 600;
}

.step-connector {
    position: absolute;
    top: 18px;
    left: 50%;
    width: 100%;
    height: 2px;
    background-color: var(--ion-color-light);
    z-index: -1;
}

.step-active .step-connector,
.step-complete .step-connector {
    background-color: var(--ion-color-primary);
}

.step-icon {
    font-size: 1.25rem;
}

/* Step Content */
.step-content {
    padding: 1rem 0;
}

.step-title {
    margin: 0 0 0.5rem;
    font-weight: 600;
    color: var(--ion-color-dark);
}

.step-description {
    margin: 0 0 2rem;
    color: var(--ion-color-medium);
}

/* Loading State */
.loading-container,
.no-songs-container,
.no-playlists-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 2rem;
    text-align: center;
}

.empty-icon {
    font-size: 3rem;
    color: var(--ion-color-medium);
    margin-bottom: 1rem;
}

/* Song Selection */
.song-search {
    margin-bottom: 1rem;
}

.song-list {
    margin-bottom: 2rem;
}

.song-item {
    --padding-start: 0;
    --padding-end: 0;
    --inner-padding-end: 0;
}

.song-thumbnail {
    width: 60px;
    height: 60px;
    --border-radius: 6px;
    margin-right: 1rem;
}

.selected-song {
    --background: rgba(var(--ion-color-primary-rgb), 0.1);
}

/* Playlist Selection */
.playlist-filters {
    margin-bottom: 1.5rem;
}

.filter-item {
    margin-bottom: 0.5rem;
}

.playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.playlist-card {
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
}

.playlist-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.selected-playlist {
    border: 2px solid var(--ion-color-primary);
}

.playlist-image-container {
    position: relative;
    height: 150px;
    overflow: hidden;
}

.playlist-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.playlist-overlay {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.playlist-card:hover .playlist-overlay {
    opacity: 1;
}

.subtitle-icon,
.genre-icon {
    vertical-align: middle;
    margin-right: 0.3rem;
    font-size: 0.9rem;
}

.playlist-genre {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    color: var(--ion-color-medium);
}

.submission-fee {
    margin-top: 0.5rem;
}

/* Review & Payment */
.review-container {
    margin-bottom: 2rem;
}

.summary-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
    .summary-cards {
        grid-template-columns: 1fr 1fr;
    }
}

.summary-card,
.message-card,
.payment-card {
    margin-bottom: 1.5rem;
}

.summary-content {
    display: flex;
    align-items: flex-start;
}

.summary-thumbnail {
    width: 70px;
    height: 70px;
    --border-radius: 6px;
    margin-right: 1rem;
}

.summary-details h3 {
    margin: 0 0 0.25rem;
    font-weight: 600;
}

.summary-details p {
    margin: 0 0 0.25rem;
    color: var(--ion-color-medium);
}

.message-textarea {
    border: 1px solid var(--ion-color-light);
    border-radius: 6px;
    margin-bottom: 0.5rem;
}

.char-count {
    text-align: right;
    color: var(--ion-color-medium);
    font-size: 0.85rem;
}

.loading-payment,
.no-payment-methods {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    text-align: center;
}

.payment-method-item {
    --padding-start: 0;
}

.payment-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--ion-color-light);
}

.summary-item:last-child {
    border-bottom: none;
}

.summary-item.total {
    font-weight: 600;
    color: var(--ion-color-dark);
    border-top: 1px solid var(--ion-color-medium);
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-bottom: none;
}

/* Success Step */
.success-content {
    padding: 3rem 0;
}

.success-container {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
}

.success-icon-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.success-icon {
    font-size: 5rem;
    color: var(--ion-color-success);
}

.success-details {
    margin: 2rem 0;
    padding: 1.5rem;
    background: rgba(var(--ion-color-light-rgb), 0.7);
    border-radius: 8px;
    text-align: left;
}

.success-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
}

@media (min-width: 576px) {
    .success-buttons {
        flex-direction: row;
        justify-content: center;
    }
}

/* Step Buttons */
.step-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
}

/* Modal Content */
.playlist-modal-content {
    padding: 1rem 0;
}

.playlist-modal-header {
    display: flex;
    margin-bottom: 1.5rem;
}

.playlist-modal-thumbnail {
    width: 90px;
    height: 90px;
    --border-radius: 8px;
    margin-right: 1.25rem;
}

.playlist-modal-info h2 {
    margin: 0 0 0.5rem;
    font-weight: 600;
}

.playlist-modal-info p {
    margin: 0 0 0.5rem;
    color: var(--ion-color-medium);
}

.playlist-modal-description,
.playlist-modal-curator,
.playlist-modal-stats {
    margin-bottom: 1.5rem;
}

.playlist-modal-description h3,
.playlist-modal-curator h3,
.playlist-modal-stats h3 {
    margin: 0 0 0.75rem;
    font-weight: 600;
    font-size: 1.1rem;
    border-bottom: 1px solid var(--ion-color-light);
    padding-bottom: 0.5rem;
}

.stat-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.stat-icon {
    font-size: 1.5rem;
    color: var(--ion-color-primary);
    margin-right: 1rem;
}

.stat-info {
    flex: 1;
}

.stat-label {
    margin: 0 0 0.25rem;
    color: var(--ion-color-medium);
}

.stat-value {
    margin: 0;
    font-weight: 600;
}

.playlist-modal-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
}

.summary-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.summary-actions ion-button {
    flex: 1;
    min-width: 100px;
}

@media (min-width: 576px) {
    .summary-actions ion-button {
        flex: initial;
    }
}
</style>
