<template>
    <ion-page>
        <app-header :title="'Profile'" :back-button="true" :back-url="backUrl"></app-header>

        <ion-content :fullscreen="true" class="profile-content">            <div class="profile-container">
                <!-- Loading State for Profile -->
                <div v-if="profileLoading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading your profile...</p>
                </div>

                <!-- Content -->
                <div v-else>
                    <!-- Basic Profile Information -->
                    <ion-card class="profile-card">
                        <ion-card-header>
                            <ion-card-title>Account Information</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-label>
                                    <h3>Username</h3>
                                    <p>{{ user?.username }}</p>
                                </ion-label>
                            </ion-item>
                            <ion-item>
                                <ion-label>
                                    <h3>Email</h3>
                                    <p>{{ user?.email }}</p>
                                </ion-label>
                            </ion-item>
                            <ion-item>
                                <ion-label>
                                    <h3>Role</h3>
                                    <p class="role-badge" :class="user?.role">{{ formatRole(user?.role) }}</p>
                                </ion-label>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>

                    <!-- Linked Accounts -->
                    <ion-card class="profile-card">
                        <ion-card-header>
                            <ion-card-title>Linked Accounts</ion-card-title>
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
                            <ion-card-title>Payment Methods</ion-card-title>
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
                            <ion-card-title>{{ getStatisticsTitle() }}</ion-card-title>
                        </ion-card-header>
                        <ion-card-content>
                            <!-- Loading State for Statistics -->
                            <div v-if="statisticsLoading" class="loading-container stats-loading">
                                <ion-spinner name="crescent"></ion-spinner>
                                <p>Loading your statistics...</p>
                            </div>                            <!-- Statistics Content -->
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
                                    <div class="chart-wrapper">
                                        <h4>{{ user?.role === 'artist' ? 'Spending' : 'Earnings' }} Over Time</h4>
                                        <canvas ref="timeChart" width="400" height="200"></canvas>
                                    </div>

                                    <!-- Submissions Status Chart -->
                                    <div class="chart-wrapper" v-if="statistics.submissionsByStatus">
                                        <h4>Submissions by Status</h4>
                                        <canvas ref="statusChart" width="400" height="200"></canvas>
                                    </div>

                                    <!-- Genre/Playlist Chart -->
                                    <div class="chart-wrapper" v-if="user?.role === 'artist' && statistics.genreSpending">
                                        <h4>Spending by Genre</h4>
                                        <canvas ref="genreChart" width="400" height="200"></canvas>
                                    </div>
                                    <div class="chart-wrapper" v-if="user?.role === 'playlist_maker' && statistics.submissionsByPlaylist">
                                        <h4>Top Playlists by Submissions</h4>
                                        <canvas ref="playlistChart" width="400" height="200"></canvas>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- No Statistics State -->
                            <div v-else class="no-stats-container">
                                <p>No statistics available. Start using the platform to see your statistics here.</p>
                            </div>
                        </ion-card-content>
                    </ion-card>

                    <!-- Account Management -->
                    <ion-card class="profile-card">
                        <ion-card-header>
                            <ion-card-title>Account Management</ion-card-title>
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
import { defineComponent, ref, onMounted, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonButton, IonIcon, IonSpinner, alertController, toastController
} from '@ionic/vue';
import { linkOutline, cardOutline, keyOutline, warningOutline } from 'ionicons/icons';
import Chart from 'chart.js/auto';
import AppHeader from '@/components/AppHeader.vue';
import { UserService } from '@/services/UserService';

export default defineComponent({
    name: 'ProfileComponent',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
        IonItem, IonLabel, IonButton, IonIcon, IonSpinner,
        AppHeader
    },
    setup() {        const router = useRouter();
        const authStore = useAuthStore();        const profileLoading = ref(true);
        const statisticsLoading = ref(true);
        const user = ref<any>(null);
        const statistics = ref<any>(null);
        
        // Chart refs
        const timeChart = ref<HTMLCanvasElement>();
        const statusChart = ref<HTMLCanvasElement>();
        const genreChart = ref<HTMLCanvasElement>();
        const playlistChart = ref<HTMLCanvasElement>();
        
        // Chart instances
        let timeChartInstance: Chart | null = null;
        let statusChartInstance: Chart | null = null;
        let genreChartInstance: Chart | null = null;
        let playlistChartInstance: Chart | null = null;

        const backUrl = ref('/');

        onMounted(async () => {
            await loadProfileData();
            
            // Set back URL based on user role
            const userRole = user.value?.role;
            if (userRole === 'artist') {
                backUrl.value = '/artist/dashboard';
            } else if (userRole === 'playlist_maker') {
                backUrl.value = '/playlist-maker/dashboard';
            }
        });        const loadProfileData = async () => {
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
                  // Load statistics separately
                statisticsLoading.value = true;
                try {
                    statistics.value = await UserService.getProfileStatistics();
                    
                    // Create charts after data is loaded
                    await nextTick();
                    createCharts();
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
                statisticsLoading.value = false;
            }
        };

        const createCharts = () => {
            if (!statistics.value) return;

            createTimeChart();
            createStatusChart();
            
            if (user.value?.role === 'artist') {
                createGenreChart();
            } else if (user.value?.role === 'playlist_maker') {
                createPlaylistChart();
            }
        };

        const createTimeChart = () => {
            if (!timeChart.value || !statistics.value) return;

            const data = user.value?.role === 'artist' 
                ? statistics.value.spendingOverTime 
                : statistics.value.earningsOverTime;

            if (!data || data.length === 0) return;

            const labels = data.map((item: any) => 
                new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            );
            const values = data.map((item: any) => 
                Number(item.total_spent || item.total_earned || 0)
            );

            timeChartInstance = new Chart(timeChart.value, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: user.value?.role === 'artist' ? 'Spending' : 'Earnings',
                        data: values,
                        borderColor: user.value?.role === 'artist' ? '#f56565' : '#48bb78',
                        backgroundColor: user.value?.role === 'artist' ? '#f5656520' : '#48bb7820',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + Number(value).toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        };

        const createStatusChart = () => {
            if (!statusChart.value || !statistics.value?.submissionsByStatus) return;

            const data = statistics.value.submissionsByStatus;
            const labels = data.map((item: any) => item.status.charAt(0).toUpperCase() + item.status.slice(1));
            const values = data.map((item: any) => item.count);
            const colors = ['#48bb78', '#f56565', '#fbb947']; // green, red, yellow

            statusChartInstance = new Chart(statusChart.value, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors.slice(0, labels.length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        };

        const createGenreChart = () => {
            if (!genreChart.value || !statistics.value?.genreSpending) return;

            const data = statistics.value.genreSpending.slice(0, 5); // Top 5
            const labels = data.map((item: any) => item.genre);
            const values = data.map((item: any) => Number(item.total_spent || 0));

            genreChartInstance = new Chart(genreChart.value, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Spending',
                        data: values,
                        backgroundColor: '#4299e1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + Number(value).toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
        };

        const createPlaylistChart = () => {
            if (!playlistChart.value || !statistics.value?.submissionsByPlaylist) return;

            const data = statistics.value.submissionsByPlaylist.slice(0, 5); // Top 5
            const labels = data.map((item: any) => item.name);
            const values = data.map((item: any) => item.submissionCount);

            playlistChartInstance = new Chart(playlistChart.value, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Submissions',
                        data: values,
                        backgroundColor: '#9f7aea'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
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
        };        const openLinkedAccounts = () => {
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
        };const openPasswordReset = async () => {
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
                        placeholder: 'New Password'
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
                            if (data.newPassword !== data.confirmPassword) {
                                showToast('Passwords do not match', 'danger');
                                return false;
                            }
                              try {
                                await UserService.updatePassword(data.currentPassword, data.newPassword);
                                showToast('Password updated successfully', 'success');
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
        };        const confirmDeactivateAccount = async () => {
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
                        role: 'destructive',                        handler: async () => {                            
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
        };const showToast = async (message: string, color: string = 'primary') => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                color
            });

            await toast.present();
        };

        // Cleanup chart instances on component unmount
        const cleanupCharts = () => {
            if (timeChartInstance) {
                timeChartInstance.destroy();
                timeChartInstance = null;
            }
            if (statusChartInstance) {
                statusChartInstance.destroy();
                statusChartInstance = null;
            }
            if (genreChartInstance) {
                genreChartInstance.destroy();
                genreChartInstance = null;
            }
            if (playlistChartInstance) {
                playlistChartInstance.destroy();
                playlistChartInstance = null;
            }
        };

        // Cleanup on component unmount
        onUnmounted(cleanupCharts);

        return {
            profileLoading,
            statisticsLoading,
            user,
            statistics,
            backUrl,
            timeChart,
            statusChart,
            genreChart,
            playlistChart,
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
            warningOutline
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

.chart-wrapper canvas {
    max-height: 300px;
}

.no-stats-container {
    text-align: center;
    padding: 24px;
    background: #f5f5f5;
    border-radius: 8px;
    color: #666;
}

@media (min-width: 768px) {
    .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 24px;
    }
}
</style>
