<template>
    <ion-page>
        <app-header :title="'Profile'" :back-button="true" :back-url="backUrl"></app-header>

        <ion-content :fullscreen="true" class="profile-content">
            <div class="profile-container">
                <!-- Loading State for Profile -->
                <div v-if="profileLoading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading your profile...</p>
                </div>

                <!-- Content -->
                <div v-else>                    <!-- Basic Profile Information -->
                    <ion-card class="profile-card">
                        <ion-card-header class="centered-header">
                            <div class="user-icon-container">
                                <ion-icon :icon="personCircleOutline" class="user-icon"></ion-icon>
                            </div>
                            <ion-card-title class="centered-title">Account Information</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item class="profile-item">
                                <ion-label class="centered-label">
                                    <h3>Username</h3>
                                    <p>{{ user?.username }}</p>
                                </ion-label>
                            </ion-item>
                            <ion-item class="profile-item">
                                <ion-label class="centered-label">
                                    <h3>Email</h3>
                                    <p>{{ user?.email }}</p>
                                </ion-label>
                            </ion-item>
                            <ion-item class="profile-item">
                                <ion-label class="centered-label">
                                    <h3>Role</h3>
                                    <p class="role-badge" :class="user?.role">{{ formatRole(user?.role) }}</p>
                                </ion-label>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>                    <!-- Linked Accounts -->
                    <ion-card class="profile-card">
                        <ion-card-header>
                            <ion-card-title class="centered-title">Linked Accounts</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-button expand="block" fill="outline" @click="openLinkedAccounts">
                                <ion-icon :icon="linkOutline" slot="start"></ion-icon>
                                Manage Linked Accounts
                            </ion-button>
                        </ion-card-content>
                    </ion-card>

                    <!-- Payment Methods -->
                    <ion-card class="profile-card">
                        <ion-card-header>
                            <ion-card-title class="centered-title">Payment Methods</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-button expand="block" fill="outline" @click="openPaymentMethods">
                                <ion-icon :icon="cardOutline" slot="start"></ion-icon>
                                Configure Payment Methods
                            </ion-button>
                        </ion-card-content>
                    </ion-card>                    <!-- Statistics Chart (Role-specific) -->
                    <ion-card class="profile-card">
                        <ion-card-header>
                            <ion-card-title class="centered-title">{{ getStatisticsTitle() }}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <!-- Loading State for Statistics -->
                            <div v-if="statisticsLoading" class="loading-container stats-loading">
                                <ion-spinner name="crescent"></ion-spinner>
                                <p>Loading your statistics...</p>
                            </div>

                            <!-- Statistics Content -->
                            <div v-else-if="statistics">
                                <!-- Statistics Summary -->
                                <div class="stats-summary">
                                    <div v-if="user?.role === 'artist'" class="artist-stats">
                                        <div class="stat-item">
                                            <h3>{{ statistics.totalSubmissions }}</h3>
                                            <p>Total Submissions</p>
                                        </div>
                                        <div class="stat-item">
                                            <h3>{{ statistics.approvalRate }}%</h3>
                                            <p>Approval Rate</p>
                                        </div>
                                        <div class="stat-item">
                                            <h3>${{ formatCurrency(statistics.totalSpent) }}</h3>
                                            <p>Total Spent</p>
                                        </div>
                                    </div>
                                    <div v-else-if="user?.role === 'playlist_maker'" class="playlist-maker-stats">
                                        <div class="stat-item">
                                            <h3>{{ statistics.totalPlaylists }}</h3>
                                            <p>Total Playlists</p>
                                        </div>
                                        <div class="stat-item">
                                            <h3>{{ statistics.totalTracks }}</h3>
                                            <p>Total Tracks</p>
                                        </div>
                                        <div class="stat-item">
                                            <h3>${{ formatCurrency(statistics.totalEarnings) }}</h3>
                                            <p>Total Earnings</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Charts -->
                                <div class="charts-container">
                                    <!-- Spending/Earnings Over Time Chart -->
                                    <div class="chart-wrapper" v-if="timeChartData">
                                        <h4>{{ user?.role === 'artist' ? 'Spending' : 'Earnings' }} Over Time</h4>
                                        <div class="chart-container">
                                            <Bar :data="timeChartData" :options="chartOptions" />
                                        </div>
                                    </div>

                                    <!-- Submissions Status Chart -->
                                    <div class="chart-wrapper" v-if="statusChartData">
                                        <h4>Submissions by Status</h4>
                                        <div class="chart-container">
                                            <Doughnut :data="statusChartData" :options="doughnutOptions" />
                                        </div>
                                    </div>

                                    <!-- Genre Chart for Artists -->
                                    <div class="chart-wrapper" v-if="user?.role === 'artist' && genreChartData">
                                        <h4>Spending by Genre</h4>
                                        <div class="chart-container">
                                            <Bar :data="genreChartData" :options="chartOptions" />
                                        </div>
                                    </div>

                                    <!-- Playlist Chart for Playlist Makers -->
                                    <div class="chart-wrapper" v-if="user?.role === 'playlist_maker' && playlistChartData">
                                        <h4>Top Playlists by Submissions</h4>
                                        <div class="chart-container">
                                            <Bar :data="playlistChartData" :options="playlistSubmissionOptions" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- No Statistics State -->
                            <div v-else class="no-stats-container">
                                <p>No statistics available. Start using the platform to see your statistics here.</p>
                            </div>
                        </ion-card-content>
                    </ion-card>                    <!-- Account Management -->
                    <ion-card class="profile-card">
                        <ion-card-header>
                            <ion-card-title class="centered-title">Account Management</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-button expand="block" fill="outline" @click="openPasswordReset">
                                <ion-icon :icon="keyOutline" slot="start"></ion-icon>
                                Change Password
                            </ion-button>
                            <ion-button expand="block" color="danger" fill="outline" @click="confirmDeactivateAccount">
                                <ion-icon :icon="warningOutline" slot="start"></ion-icon>
                                Deactivate Account
                            </ion-button>
                        </ion-card-content>
                    </ion-card>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store';
import { useFormValidation } from '@/composables/useFormValidation';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonButton, IonIcon, IonSpinner, alertController, toastController
} from '@ionic/vue';
import { linkOutline, cardOutline, keyOutline, warningOutline, personCircleOutline } from 'ionicons/icons';
import { Bar, Doughnut } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import AppHeader from '@/components/AppHeader.vue';
import { UserService } from '@/services/UserService';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default defineComponent({
    name: 'ProfileComponent',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
        IonItem, IonLabel, IonButton, IonIcon, IonSpinner,
        AppHeader, Bar, Doughnut
    },
    setup() {
        const router = useRouter();
        const authStore = useAuthStore();
        const { errors, validateField, validateForm, resetValidation } = useFormValidation();

        const profileLoading = ref(true);
        const statisticsLoading = ref(true);
        const user = ref<any>(null);
        const statistics = ref<any>(null);
        
        const backUrl = ref('/');

        // Watch for user changes and reload profile data
        watch(() => authStore.user, async (newUser, oldUser) => {
            if (newUser && (!oldUser || newUser.user_id !== oldUser.user_id)) {
                // Reset statistics when user changes
                statistics.value = null;
                await loadProfileData();
            }
        }, { immediate: false });

        // Chart data computed properties
        const timeChartData = computed(() => {
            if (!statistics.value) return null;
            
            const data = user.value?.role === 'artist' 
                ? statistics.value.spendingOverTime 
                : statistics.value.earningsOverTime;
                
            if (!data || data.length === 0) return null;
            
            return {
                labels: data.map((item: any) => {
                    const date = new Date(item.month);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: user.value?.role === 'artist' ? 'Spending ($)' : 'Earnings ($)',
                    data: data.map((item: any) => 
                        user.value?.role === 'artist' ? item.total_spent || 0 : item.total_earned || 0
                    ),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };
        });

        const statusChartData = computed(() => {
            if (!statistics.value?.submissionsByStatus) return null;
            
            return {
                labels: statistics.value.submissionsByStatus.map((item: any) => 
                    item.status.charAt(0).toUpperCase() + item.status.slice(1)
                ),
                datasets: [{
                    data: statistics.value.submissionsByStatus.map((item: any) => item.count),
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 205, 86, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ]
                }]
            };
        });

        const genreChartData = computed(() => {
            if (user.value?.role !== 'artist' || !statistics.value?.genreSpending) return null;
            
            return {
                labels: statistics.value.genreSpending.map((item: any) => item.genre),
                datasets: [{
                    label: 'Spending by Genre ($)',
                    data: statistics.value.genreSpending.map((item: any) => item.total_spent || 0),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            };
        });

        const playlistChartData = computed(() => {
            if (user.value?.role !== 'playlist_maker' || !statistics.value?.submissionsByPlaylist) return null;
            
            return {
                labels: statistics.value.submissionsByPlaylist.map((item: any) => item.name),
                datasets: [{
                    label: 'Submissions per Playlist',
                    data: statistics.value.submissionsByPlaylist.map((item: any) => item.submissionCount),
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            };
        });

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value: any) {
                            return '$' + value;
                        }
                    }
                }
            }
        };

        const playlistSubmissionOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        const doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom' as const,
                },
            }
        };

        onMounted(async () => {
            await loadProfileData();
            
            // Set back URL based on user role
            const userRole = user.value?.role;
            if (userRole === 'artist') {
                backUrl.value = '/artist/dashboard';
            } else if (userRole === 'playlist_maker') {
                backUrl.value = '/playlist-maker/dashboard';
            }
        });

        const loadProfileData = async () => {
            try {
                profileLoading.value = true;
                
                // Get user data from store or fetch
                user.value = authStore.user;
                if (!user.value) {
                    // Redirect to login if no user
                    router.push('/login');
                    return;
                }
                
                // Basic profile data loaded
                profileLoading.value = false;
                
                // Load statistics separately and reset previous data
                statisticsLoading.value = true;
                statistics.value = null; // Clear previous statistics
                
                try {
                    statistics.value = await UserService.getProfileStatistics();
                } catch (error) {
                    console.error('Error loading statistics:', error);
                    statistics.value = null;
                    showToast('Could not load statistics. Please try again later.', 'warning');
                } finally {
                    statisticsLoading.value = false;
                }
                
            } catch (error) {
                console.error('Error loading profile data:', error);
            } finally {
                profileLoading.value = false;
            }
        };

        const formatRole = (role: string) => {
            if (!role) return '';
            return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        const formatCurrency = (amount: any) => {
            return Number(amount || 0).toFixed(2);
        };

        const getStatisticsTitle = () => {
            return user.value?.role === 'artist' ? 'Artist Statistics' : 'Playlist Maker Statistics';
        };

        const openLinkedAccounts = () => {
            const userRole = user.value?.role;
            if (userRole === 'artist') {
                router.push('/artist/linked-accounts');
            } else if (userRole === 'playlist_maker') {
                router.push('/playlist-maker/linked-accounts');
            }
        };

        const openPaymentMethods = () => {
            const userRole = user.value?.role;
            if (userRole === 'artist') {
                router.push('/artist/payment-methods');
            } else if (userRole === 'playlist_maker') {
                router.push('/playlist-maker/payment-methods');
            }
        };        const openPasswordReset = async () => {
            resetValidation();
            
            const alert = await alertController.create({
                header: 'Change Password',
                inputs: [
                    {
                        name: 'currentPassword',
                        type: 'password',
                        placeholder: 'Current Password'
                    },
                    {
                        name: 'newPassword',
                        type: 'password',
                        placeholder: 'New Password (min 8 chars, 1 letter, 1 number)'
                    },
                    {
                        name: 'confirmPassword',
                        type: 'password',
                        placeholder: 'Confirm New Password'
                    }
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Change Password',
                        handler: async (data) => {
                            // Validate form data
                            const isValid = validateForm(data, {
                                currentPassword: { required: true },
                                newPassword: { required: true, password: true },
                                confirmPassword: { required: true }
                            });
                            
                            if (!isValid) {
                                const errorMessages = Object.values(errors.value).join('\n');
                                showToast(errorMessages, 'danger');
                                return false;
                            }
                            
                            if (data.newPassword !== data.confirmPassword) {
                                showToast('Passwords do not match', 'danger');
                                return false;
                            }
                            
                            if (data.currentPassword === data.newPassword) {
                                showToast('New password must be different from current password', 'danger');
                                return false;
                            }
                            
                            try {
                                await UserService.updatePassword(data.currentPassword, data.newPassword);
                                showToast('Password updated successfully', 'success');
                                resetValidation();
                                return true;
                            } catch (error: any) {
                                if (error.response && error.response.status === 409) {
                                    showToast('Current password is incorrect', 'danger');
                                } else {
                                    showToast('Error updating password. Please try again.', 'danger');
                                }
                                console.error('Error updating password:', error);
                                return false;
                            }
                        }
                    }
                ]
            });
            
            await alert.present();
        };

        const confirmDeactivateAccount = async () => {
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
                        handler: async () => {
                            try {
                                await UserService.deactivateAccount();
                                showToast('Your account has been deactivated', 'success');
                                // Logout and redirect
                                await authStore.logout();
                                router.push('/login');
                            } catch (error: any) {
                                console.error('Error deactivating account:', error);
                                if (error.response && error.response.status === 401) {
                                    showToast('Authentication failed. Please log in again.', 'danger');
                                    await authStore.logout();
                                    router.push('/login');
                                } else {
                                    showToast('Failed to deactivate account. Please try again.', 'danger');
                                }
                            }
                        }
                    }
                ]
            });
            
            await alert.present();
        };

        const showToast = async (message: string, color: string = 'primary') => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                color
            });

            await toast.present();
        };        return {
            profileLoading,
            statisticsLoading,
            user,
            statistics,
            backUrl,
            timeChartData,
            statusChartData,
            genreChartData,
            playlistChartData,
            chartOptions,
            playlistSubmissionOptions,
            doughnutOptions,
            formatRole,
            formatCurrency,
            getStatisticsTitle,
            openLinkedAccounts,
            openPaymentMethods,
            openPasswordReset,
            confirmDeactivateAccount,
            linkOutline,
            cardOutline,
            keyOutline,
            warningOutline,
            personCircleOutline,
            errors,
            resetValidation
        };
    }
});
</script>

<style scoped>
.profile-content {
    --background: #f8f9fa;
}

.profile-container {
    padding: 16px;
    max-width: 800px;
    margin: 0 auto;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
}

.loading-container.stats-loading {
    height: 200px;
}

.profile-card {
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.role-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
    text-transform: uppercase;
}

.role-badge.artist {
    background-color: #e3f2fd;
    color: #1976d2;
}

.role-badge.playlist_maker {
    background-color: #f3e5f5;
    color: #7b1fa2;
}

.stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-item {
    text-align: center;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 8px;
}

.stat-item h3 {
    margin: 0;
    font-size: 1.5em;
    color: #333;
}

.stat-item p {
    margin: 4px 0 0 0;
    font-size: 0.9em;
    color: #666;
}

.charts-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.chart-wrapper {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-wrapper h4 {
    margin: 0 0 16px 0;
    color: #333;
    text-align: center;
}

.chart-container {
    height: 300px;
    position: relative;
}

.no-stats-container {
    text-align: center;
    padding: 24px;
    background: #f5f5f5;
    border-radius: 8px;
    color: #666;
}

/* New styles for centered elements and user icon */
.centered-header {
    text-align: center;
    padding-bottom: 20px;
}

.user-icon-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
}

.user-icon {
    font-size: 80px;
    color: #3880ff;
    opacity: 0.8;
}

.centered-title {
    text-align: center;
    font-weight: 600;
    color: #333;
}

.profile-item {
    --inner-padding: 12px 16px;
}

.centered-label {
    text-align: center;
    width: 100%;
}

.centered-label h3 {
    margin: 0 0 4px 0;
    font-size: 0.9em;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.centered-label p {
    margin: 0;
    font-size: 1.1em;
    font-weight: 500;
    color: #333;
}

.role-badge {
    display: inline-block;
    margin: 0 auto;
}

@media (min-width: 768px) {
    .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
    }
}
</style>
