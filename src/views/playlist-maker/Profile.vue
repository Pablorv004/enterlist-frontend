<template>
    <ion-page>
        <app-header title="My Profile" :back-button="true" back-url="/playlist-maker/dashboard"></app-header>

        <ion-content :fullscreen="true" class="profile-content">
            <div class="profile-container">
                <!-- Profile Header -->
                <div class="profile-header">
                    <div class="profile-avatar">
                        <ion-avatar>
                            <ion-icon :icon="personCircleOutline" class="avatar-icon"></ion-icon>
                        </ion-avatar>
                    </div>
                    <div class="profile-info">
                        <h2>{{ user?.username }}</h2>
                        <p>{{ user?.email }}</p>
                        <ion-badge color="primary">Playlist Curator</ion-badge>
                    </div>
                </div>

                <!-- Profile Form -->
                <form @submit.prevent="updateProfile" class="profile-form">
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Personal Information</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-label position="stacked">Username</ion-label>
                                <ion-input v-model="profileForm.username" required></ion-input>
                                <ion-note slot="error" v-if="errors.username">{{ errors.username }}</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Email</ion-label>
                                <ion-input v-model="profileForm.email" type="email" required></ion-input>
                                <ion-note slot="error" v-if="errors.email">{{ errors.email }}</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Full Name</ion-label>
                                <ion-input v-model="profileForm.fullName"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Bio</ion-label>
                                <ion-textarea v-model="profileForm.bio" :rows="4"></ion-textarea>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Curator Information</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-label position="stacked">Curator Name</ion-label>
                                <ion-input v-model="profileForm.curatorName"></ion-input>
                                <ion-note>This is the name displayed to artists</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Preferred Genres</ion-label>
                                <ion-select v-model="profileForm.preferredGenres" :multiple="true"
                                    interface="action-sheet">
                                    <ion-select-option value="pop">Pop</ion-select-option>
                                    <ion-select-option value="rock">Rock</ion-select-option>
                                    <ion-select-option value="hip-hop">Hip-Hop/Rap</ion-select-option>
                                    <ion-select-option value="electronic">Electronic</ion-select-option>
                                    <ion-select-option value="rb">R&B</ion-select-option>
                                    <ion-select-option value="indie">Indie</ion-select-option>
                                    <ion-select-option value="alternative">Alternative</ion-select-option>
                                    <ion-select-option value="jazz">Jazz</ion-select-option>
                                    <ion-select-option value="country">Country</ion-select-option>
                                    <ion-select-option value="folk">Folk</ion-select-option>
                                    <ion-select-option value="classical">Classical</ion-select-option>
                                    <ion-select-option value="other">Other</ion-select-option>
                                </ion-select>
                                <ion-note>Select the genres you typically curate</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Review Time</ion-label>
                                <ion-select v-model="profileForm.reviewTime" interface="action-sheet">
                                    <ion-select-option value="1-3">1-3 days</ion-select-option>
                                    <ion-select-option value="3-7">3-7 days</ion-select-option>
                                    <ion-select-option value="7-14">1-2 weeks</ion-select-option>
                                    <ion-select-option value="14+">2+ weeks</ion-select-option>
                                </ion-select>
                                <ion-note>Average time to review submissions</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Website</ion-label>
                                <ion-input v-model="profileForm.website" type="url"></ion-input>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Payout Information</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-label position="stacked">Payout Email</ion-label>
                                <ion-input v-model="profileForm.payoutEmail" type="email"></ion-input>
                                <ion-note>Email for receiving payments</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Preferred Payment Method</ion-label>
                                <ion-select v-model="profileForm.paymentMethod" interface="action-sheet">
                                    <ion-select-option value="paypal">PayPal</ion-select-option>
                                    <ion-select-option value="bank">Bank Transfer</ion-select-option>
                                    <ion-select-option value="venmo">Venmo</ion-select-option>
                                </ion-select>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Social Media</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-label position="stacked">Instagram</ion-label>
                                <ion-input v-model="profileForm.instagram"></ion-input>
                                <ion-note>Your Instagram username (without @)</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Twitter</ion-label>
                                <ion-input v-model="profileForm.twitter"></ion-input>
                                <ion-note>Your Twitter username (without @)</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">TikTok</ion-label>
                                <ion-input v-model="profileForm.tiktok"></ion-input>
                                <ion-note>Your TikTok username (without @)</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Facebook</ion-label>
                                <ion-input v-model="profileForm.facebook"></ion-input>
                                <ion-note>Your Facebook page username</ion-note>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Submission Preferences</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item lines="none" class="toggle-item">
                                <ion-label>Auto-accept new submissions</ion-label>
                                <ion-toggle v-model="profileForm.autoAcceptSubmissions"></ion-toggle>
                                <ion-note class="toggle-note">Automatically accept new submissions from
                                    artists</ion-note>
                            </ion-item>

                            <ion-item lines="none" class="toggle-item">
                                <ion-label>Make playlists public</ion-label>
                                <ion-toggle v-model="profileForm.playlistsPublic"></ion-toggle>
                                <ion-note class="toggle-note">Show your playlists to all artists</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Default Submission Message</ion-label>
                                <ion-textarea v-model="profileForm.defaultSubmissionMessage" :rows="4"
                                    placeholder="Thanks for your submission! I'll review it as soon as possible."></ion-textarea>
                                <ion-note>Automatically sent to artists when they submit a song</ion-note>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Account Settings</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-label position="stacked">Change Password</ion-label>
                                <ion-input v-model="passwordForm.currentPassword" type="password"
                                    placeholder="Current Password"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input v-model="passwordForm.newPassword" type="password"
                                    placeholder="New Password"></ion-input>
                                <ion-note slot="error" v-if="errors.newPassword">{{ errors.newPassword }}</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-input v-model="passwordForm.confirmPassword" type="password"
                                    placeholder="Confirm Password"></ion-input>
                                <ion-note slot="error" v-if="errors.confirmPassword">{{ errors.confirmPassword
                                    }}</ion-note>
                            </ion-item>

                            <div class="password-button">
                                <ion-button size="small" @click="updatePassword"
                                    :disabled="!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword"
                                    fill="outline">
                                    Update Password
                                </ion-button>
                            </div>

                            <ion-item lines="none" class="toggle-item">
                                <ion-label>Email Notifications</ion-label>
                                <ion-toggle v-model="profileForm.emailNotifications"></ion-toggle>
                            </ion-item>

                            <ion-item lines="none" class="toggle-item">
                                <ion-label>New Submission Alerts</ion-label>
                                <ion-toggle v-model="profileForm.newSubmissionAlerts"></ion-toggle>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <div class="submit-buttons">
                        <ion-button type="button" fill="outline" @click="resetForm">
                            Cancel
                        </ion-button>
                        <ion-button type="submit" :disabled="updateLoading">
                            <ion-spinner v-if="updateLoading" name="crescent"></ion-spinner>
                            <span v-else>Save Changes</span>
                        </ion-button>
                    </div>
                </form>

                <!-- Profile Actions -->
                <div class="profile-actions">
                    <ion-button fill="clear" color="danger" @click="showDeactivateAlert">
                        Deactivate Account
                    </ion-button>
                </div>
            </div>
        </ion-content>
        
        <!-- Bottom Navigation -->
        <bottom-navigation active-tab="profile"></bottom-navigation>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonButton, IonNote, IonAvatar, IonIcon, IonBadge, IonToggle, IonSpinner,
    alertController, toastController
} from '@ionic/vue';
import { camera, personCircleOutline } from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { UserService } from '@/services/UserService';
import { useAuthStore } from '@/store';
import { useFileUpload, useFormValidation } from '@/composables';
import { User } from '@/types';

export default defineComponent({
    name: 'PlaylistMakerProfile',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
        IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
        IonButton, IonNote, IonAvatar, IonIcon, IonBadge, IonToggle, IonSpinner,
        AppHeader, BottomNavigation
    },
    setup() {
        const authStore = useAuthStore();
        const user = computed(() => authStore.user);
        const { uploadFile } = useFileUpload();
        const { errors: formErrors, validateForm } = useFormValidation();
        
        // Custom email validation function
        const validateEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };
        
        // Custom password validation function
        const validatePassword = (password: string): boolean => {
            const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            return regex.test(password);
        };

        const profileImage = ref<string | null>(null);
        const updateLoading = ref(false);

        // Form state
        const profileForm = reactive({
            username: '',
            email: '',
            fullName: '',
            bio: '',
            curatorName: '',
            preferredGenres: [] as string[],
            reviewTime: '',
            website: '',
            payoutEmail: '',
            paymentMethod: '',
            instagram: '',
            twitter: '',
            tiktok: '',
            facebook: '',
            autoAcceptSubmissions: false,
            playlistsPublic: true,
            defaultSubmissionMessage: '',
            emailNotifications: true,
            newSubmissionAlerts: true
        });

        const passwordForm = reactive({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        const errors = reactive({
            username: '',
            email: '',
            newPassword: '',
            confirmPassword: ''
        });

        // Load user profile data
        onMounted(async () => {
            if (user.value) {
                try {
                    //TODO: Fetch user profile data
                    // const userProfile = await UserService.getUserProfile(user.value.user_id);

                    // // Populate profile form with user data
                    // profileForm.username = userProfile.username || '';
                    // profileForm.email = userProfile.email || '';
                    // profileForm.fullName = userProfile.full_name || '';
                    // profileForm.bio = userProfile.bio || '';
                    // profileForm.curatorName = userProfile.curator_name || '';
                    // profileForm.preferredGenres = userProfile.preferred_genres || [];
                    // profileForm.reviewTime = userProfile.review_time || '';
                    // profileForm.website = userProfile.website || '';
                    // profileForm.payoutEmail = userProfile.payout_email || '';
                    // profileForm.paymentMethod = userProfile.payment_method || '';
                    // profileForm.instagram = userProfile.instagram || '';
                    // profileForm.twitter = userProfile.twitter || '';
                    // profileForm.tiktok = userProfile.tiktok || '';
                    // profileForm.facebook = userProfile.facebook || '';
                    // profileForm.autoAcceptSubmissions = userProfile.auto_accept_submissions || false;
                    // profileForm.playlistsPublic = userProfile.playlists_public || true;
                    // profileForm.defaultSubmissionMessage = userProfile.default_submission_message || '';
                    // profileForm.emailNotifications = userProfile.email_notifications || true;
                    // profileForm.newSubmissionAlerts = userProfile.new_submission_alerts || true;

                    // profileImage.value = userProfile.profile_image || null;
                } catch (err) {
                    showToast('Failed to load profile information', 'danger');
                    console.error(err);
                }
            }
        });

        // Update profile method
        const updateProfile = async () => {
            // Validate form data
            errors.username = '';
            errors.email = '';

            if (!profileForm.username.trim()) {
                errors.username = 'Username is required';
                return;
            }

            if (!profileForm.email.trim()) {
                errors.email = 'Email is required';
                return;
            }

            if (!validateEmail(profileForm.email)) {
                errors.email = 'Invalid email format';
                return;
            }

            try {
                //TODO: Implement profile update logic
                // updateLoading.value = true;

                // await UserService.updateProfile({
                //     user_id: user.value!.user_id,
                //     username: profileForm.username,
                //     email: profileForm.email,
                //     full_name: profileForm.fullName,
                //     bio: profileForm.bio,
                //     curator_name: profileForm.curatorName,
                //     preferred_genres: profileForm.preferredGenres,
                //     review_time: profileForm.reviewTime,
                //     website: profileForm.website,
                //     payout_email: profileForm.payoutEmail,
                //     payment_method: profileForm.paymentMethod,
                //     instagram: profileForm.instagram,
                //     twitter: profileForm.twitter,
                //     tiktok: profileForm.tiktok,
                //     facebook: profileForm.facebook,
                //     auto_accept_submissions: profileForm.autoAcceptSubmissions,
                //     playlists_public: profileForm.playlistsPublic,
                //     default_submission_message: profileForm.defaultSubmissionMessage,
                //     email_notifications: profileForm.emailNotifications,
                //     new_submission_alerts: profileForm.newSubmissionAlerts
                // });

                //Update local auth store
                //await authStore.refreshUser();

                showToast('Profile updated successfully', 'success');
            } catch (err) {
                showToast('Failed to update profile', 'danger');
                console.error(err);
            } finally {
                updateLoading.value = false;
            }
        };

        // Update password method
        const updatePassword = async () => {
            // Validate password data
            errors.newPassword = '';
            errors.confirmPassword = '';

            if (!passwordForm.currentPassword) {
                errors.newPassword = 'Current password is required';
                return;
            }

            if (!validatePassword(passwordForm.newPassword)) {
                errors.newPassword = 'Password must be at least 8 characters with letters and numbers';
                return;
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
                return;
            }

            try {
                //TODO: Implement password update logic
                // await UserService.updatePassword(
                //     user.value!.user_id,
                //     passwordForm.currentPassword,
                //     passwordForm.newPassword
                // );

                // Reset password form
                passwordForm.currentPassword = '';
                passwordForm.newPassword = '';
                passwordForm.confirmPassword = '';

                showToast('Password updated successfully', 'success');
            } catch (err) {
                showToast('Failed to update password', 'danger');
                console.error(err);
            }
        };

        // Upload profile image
        const uploadProfileImage = async () => {
            try {
                //TODO: Implement file upload logic
                // const fileData = await uploadFile({
                //     accept: 'image/*',
                //     maxSizeMB: 5
                // });

                // if (fileData) {
                //     const imageUrl = await UserService.uploadProfileImage(user.value!.user_id, fileData);
                //     profileImage.value = imageUrl;
                //     showToast('Profile image updated', 'success');
                // }
            } catch (err) {
                showToast('Failed to upload image', 'danger');
                console.error(err);
            }
        };

        // Reset form to original values
        const resetForm = async () => {
            try {
                //TODO: Implement reset logic
                // const userProfile = await UserService.getUserProfile(user.value!.user_id);

                // profileForm.username = userProfile.username || '';
                // profileForm.email = userProfile.email || '';
                // profileForm.fullName = userProfile.full_name || '';
                // profileForm.bio = userProfile.bio || '';
                // profileForm.curatorName = userProfile.curator_name || '';
                // profileForm.preferredGenres = userProfile.preferred_genres || [];
                // profileForm.reviewTime = userProfile.review_time || '';
                // profileForm.website = userProfile.website || '';
                // profileForm.payoutEmail = userProfile.payout_email || '';
                // profileForm.paymentMethod = userProfile.payment_method || '';
                // profileForm.instagram = userProfile.instagram || '';
                // profileForm.twitter = userProfile.twitter || '';
                // profileForm.tiktok = userProfile.tiktok || '';
                // profileForm.facebook = userProfile.facebook || '';
                // profileForm.autoAcceptSubmissions = userProfile.auto_accept_submissions || false;
                // profileForm.playlistsPublic = userProfile.playlists_public || true;
                // profileForm.defaultSubmissionMessage = userProfile.default_submission_message || '';
                // profileForm.emailNotifications = userProfile.email_notifications || true;
                // profileForm.newSubmissionAlerts = userProfile.new_submission_alerts || true;

                showToast('Form reset', 'medium');
            } catch (err) {
                showToast('Failed to reset form', 'danger');
                console.error(err);
            }
        };

        // Show alert for account deactivation
        const showDeactivateAlert = async () => {
            const alert = await alertController.create({
                header: 'Deactivate Account',
                message: 'Are you sure you want to deactivate your account? This will hide your profile and playlists from artists. You can reactivate later by logging in again.',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Deactivate',
                        role: 'destructive',
                        handler: () => deactivateAccount()
                    }
                ]
            });

            await alert.present();
        };

        // Deactivate account
        const deactivateAccount = async () => {
            try {
                //TODO: Implement account deactivation logic
                // await UserService.deactivateAccount(user.value!.user_id);
                await authStore.logout();
                window.location.href = '/login';
            } catch (err) {
                showToast('Failed to deactivate account', 'danger');
                console.error(err);
            }
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
            user,
            profileForm,
            passwordForm,
            errors,
            profileImage,
            updateLoading,
            updateProfile,
            updatePassword,
            uploadProfileImage,
            resetForm,
            showDeactivateAlert,
            cameraIcon: camera,
            personCircleOutline
        };
    }
});
</script>

<style scoped>
.profile-content {
    --background: #f8f9fa;
}

.profile-container {
    padding: 1rem;
    max-width: 768px;
    margin: 0 auto;
}

.profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 2rem;
}

@media (min-width: 576px) {
    .profile-header {
        flex-direction: row;
        text-align: left;
        align-items: center;
    }
}

.profile-avatar {
    position: relative;
    margin-bottom: 1rem;
}

.avatar-icon {
    width: 100%;
    height: 100%;
}

@media (min-width: 576px) {
    .profile-avatar {
        margin-right: 1.5rem;
        margin-bottom: 0;
    }
}

.profile-avatar ion-avatar {
    width: 100px;
    height: 100px;
    border: 3px solid var(--ion-color-primary);
}

.profile-info h2 {
    margin: 0 0 0.25rem;
    font-weight: 600;
}

.profile-info p {
    margin: 0 0 0.5rem;
    color: var(--ion-color-medium);
}

.profile-form ion-card {
    margin-bottom: 1.5rem;
}

.toggle-item {
    --padding-start: 0;
}

.toggle-note {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.85rem;
}

.password-button {
    margin: 1rem 0 0;
    display: flex;
    justify-content: flex-end;
}

.submit-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-bottom: 2rem;
}

.profile-actions {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
    border-top: 1px solid var(--ion-color-light);
}
</style>
