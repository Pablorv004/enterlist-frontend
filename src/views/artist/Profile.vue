<template>
    <ion-page>
        <app-header title="My Profile" :back-button="true" back-url="/artist/dashboard"></app-header>

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
                        <ion-badge color="primary">Artist</ion-badge>
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
                            <ion-card-title>Artist Information</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-label position="stacked">Artist Name</ion-label>
                                <ion-input v-model="profileForm.artistName"></ion-input>
                                <ion-note>This is the name displayed on your submissions</ion-note>
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Primary Genre</ion-label>
                                <ion-select v-model="profileForm.genre" interface="action-sheet">
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
                            </ion-item>

                            <ion-item>
                                <ion-label position="stacked">Website</ion-label>
                                <ion-input v-model="profileForm.website" type="url"></ion-input>
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

                            <ion-item lines="none" class="notifications-toggle">
                                <ion-label>Email Notifications</ion-label>
                                <ion-toggle v-model="profileForm.emailNotifications"></ion-toggle>
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
    name: 'ArtistProfile',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
        IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
        IonButton, IonNote, IonAvatar, IonIcon, IonBadge, IonToggle, IonSpinner,
        AppHeader, BottomNavigation
    },
    setup() {
        const authStore = useAuthStore();
        const { uploadFile } = useFileUpload();
        const { validateForm: validate, errors } = useFormValidation();

        const user = computed<User | null>(() => authStore.user);
        const profileImage = ref<string | null>(null);
        const updateLoading = ref(false);
        const passwordUpdateLoading = ref(false);

        const profileForm = reactive({
            username: '',
            email: '',
            fullName: '',
            bio: '',
            artistName: '',
            genre: '',
            website: '',
            instagram: '',
            twitter: '',
            tiktok: '',
            facebook: '',
            emailNotifications: true
        });

        const passwordForm = reactive({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        onMounted(() => {
            if (user.value) {
                loadUserProfile();
            }
        });

        const loadUserProfile = async () => {
            if (!user.value) return;

            // try {
            //     //TODO: Fetch user details from the backend
            //     const userDetails = await UserService.getUserDetails(user.value.user_id);

            //     profileForm.username = userDetails.username;
            //     profileForm.email = userDetails.email;

            //     // These would come from user_profile table in a real implementation
            //     profileForm.fullName = userDetails.profile?.full_name || '';
            //     profileForm.bio = userDetails.profile?.bio || '';
            //     profileForm.artistName = userDetails.profile?.artist_name || '';
            //     profileForm.genre = userDetails.profile?.genre || '';
            //     profileForm.website = userDetails.profile?.website || '';
            //     profileForm.instagram = userDetails.profile?.social_instagram || '';
            //     profileForm.twitter = userDetails.profile?.social_twitter || '';
            //     profileForm.tiktok = userDetails.profile?.social_tiktok || '';
            //     profileForm.facebook = userDetails.profile?.social_facebook || '';
            //     profileForm.emailNotifications = userDetails.profile?.email_notifications !== false;

            //     profileImage.value = userDetails.profile?.profile_image_url || null;
            // } catch (error) {
            //     showToast('Failed to load profile. Please try again.', 'danger');
            // }
        };

        const updateProfile = async () => {
            // Validate form
            const isValid = validate({
                username: [{ required: true, message: 'Username is required' }],
                email: [
                    { required: true, message: 'Email is required' },
                    { email: true, message: 'Please enter a valid email' }
                ]
            }, profileForm);

            if (!isValid) return;

            try {
                updateLoading.value = true;

                // TODO: Handle file upload and get the URL
                // const updatedUser = await UserService.updateUser(user.value!.user_id, {
                //     username: profileForm.username,
                //     email: profileForm.email,
                //     profile: {
                //         full_name: profileForm.fullName,
                //         bio: profileForm.bio,
                //         artist_name: profileForm.artistName,
                //         genre: profileForm.genre,
                //         website: profileForm.website,
                //         social_instagram: profileForm.instagram,
                //         social_twitter: profileForm.twitter,
                //         social_tiktok: profileForm.tiktok,
                //         social_facebook: profileForm.facebook,
                //         email_notifications: profileForm.emailNotifications,
                //         profile_image_url: profileImage.value
                //     }
                // });

                // Update auth store with new user details
                // authStore.setUser(updatedUser);

                showToast('Profile updated successfully', 'success');
            } catch (error) {
                showToast('Failed to update profile. Please try again.', 'danger');
            } finally {
                updateLoading.value = false;
            }
        };

        const updatePassword = async () => {
            // Validate password form
            const isValid = validate({
                newPassword: [
                    { required: true, message: 'New password is required' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                ],
                confirmPassword: [
                    { required: true, message: 'Please confirm your password' },
                    {
                        validator: () => passwordForm.newPassword === passwordForm.confirmPassword,
                        message: 'Passwords do not match'
                    }
                ]
            }, passwordForm);

            if (!isValid) return;

            try {
                passwordUpdateLoading.value = true;

                //TODO: Update password in the backend
                // await UserService.updatePassword(user.value!.user_id, {
                //     current_password: passwordForm.currentPassword,
                //     new_password: passwordForm.newPassword
                // });

                // Clear password form
                passwordForm.currentPassword = '';
                passwordForm.newPassword = '';
                passwordForm.confirmPassword = '';

                showToast('Password updated successfully', 'success');
            } catch (error) {
                showToast('Failed to update password. Please check your current password.', 'danger');
            } finally {
                passwordUpdateLoading.value = false;
            }
        };

        const uploadProfileImage = async () => {
            try {

                //TODO: Image upload logic
                // const file = await uploadFile({
                //     accept: 'image/*',
                //     maxSize: 5 * 1024 * 1024 // 5MB
                // });

                // if (file) {
                //     // In a real implementation, we would upload the file to a server
                //     // and get back a URL
                //     const formData = new FormData();
                //     formData.append('file', file);

                //     const uploadResult = await UserService.uploadProfileImage(user.value!.user_id, formData);
                //     profileImage.value = uploadResult.url;

                //     showToast('Profile image updated', 'success');
                // }
            } catch (error) {
                showToast('Failed to upload image. Please try again.', 'danger');
            }
        };

        const resetForm = () => {
            // Reset form to original values
            loadUserProfile();
        };

        const showDeactivateAlert = async () => {
            const alert = await alertController.create({
                header: 'Deactivate Account',
                message: 'Are you sure you want to deactivate your account? This action cannot be undone.',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Deactivate',
                        role: 'destructive',
                        handler: () => {
                            deactivateAccount();
                        }
                    }
                ]
            });

            await alert.present();
        };

        const deactivateAccount = async () => {
            try {
                //TODO: Deactivate account in the backend
                // await UserService.deactivateUser(user.value!.user_id);

                // Log out the user
                authStore.logout();

                showToast('Your account has been deactivated', 'success');

                // Redirect to home page
                window.location.href = '/';
            } catch (error) {
                showToast('Failed to deactivate account. Please try again.', 'danger');
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
            user,
            profileImage,
            profileForm,
            passwordForm,
            errors,
            updateLoading,
            cameraIcon: camera,
            personCircleOutline,
            updateProfile,
            updatePassword,
            uploadProfileImage,
            resetForm,
            showDeactivateAlert
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
    max-width: 800px;
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
    }
}

.avatar-icon {
    width: 100%;
    height: 100%;
}

.profile-avatar {
    position: relative;
    margin-bottom: 1rem;
}

@media (min-width: 576px) {
    .profile-avatar {
        margin-right: 2rem;
        margin-bottom: 0;
    }
}

.profile-avatar ion-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto;
}

.profile-info {
    flex: 1;
}

.profile-info h2 {
    margin-top: 0;
    margin-bottom: 0.5rem;
}

.profile-info p {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: var(--ion-color-medium);
}

.profile-form {
    margin-bottom: 2rem;
}

ion-card {
    margin-bottom: 1.5rem;
}

ion-note {
    font-size: 0.8rem;
}

.password-button {
    margin-top: 1rem;
    margin-bottom: 1rem;
}

.notifications-toggle {
    margin-top: 1rem;
}

.submit-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.profile-actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--ion-color-light);
}
</style>
