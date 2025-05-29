<template>
    <ion-page>
        <div class="admin-layout">
            <!-- Side Panel -->
            <admin-side-panel :active-tab="'dashboard'"></admin-side-panel>
            
            <!-- Main Content -->
            <div class="main-content">
                <app-header title="Admin Dashboard" :show-user-menu="true"></app-header>
                
                <ion-content :fullscreen="true" class="dashboard-content">
                    <div class="dashboard-container">
                        <!-- Welcome Header -->
                        <div class="welcome-header">
                            <h1>Administrator Dashboard</h1>
                            <p>Platform statistics and analytics</p>
                        </div>

                        <!-- Loading State -->
                        <div v-if="loading" class="loading-container">
                            <ion-spinner name="crescent"></ion-spinner>
                            <p>Loading dashboard statistics...</p>
                        </div>

                        <!-- Statistics Content -->
                        <div v-else-if="statistics">
                            <!-- Total Stats Cards -->
                            <ion-grid class="stats-grid">
                                <ion-row>
                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="peopleIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">{{ statistics.totals?.users || 0 }}</div>
                                                    <div class="stats-label">Total Users</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>
                                    
                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="listIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">{{ statistics.totals?.playlists || 0 }}</div>
                                                    <div class="stats-label">Total Playlists</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>

                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="musicalNotesIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">{{ statistics.totals?.songs || 0 }}</div>
                                                    <div class="stats-label">Total Songs</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>

                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="documentTextIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">{{ statistics.totals?.submissions || 0 }}</div>
                                                    <div class="stats-label">Total Submissions</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>
                                </ion-row>

                                <ion-row>
                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="cardIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">{{ statistics.totals?.transactions || 0 }}</div>
                                                    <div class="stats-label">Total Transactions</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>

                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card warning">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="timeIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">{{ statistics.totals?.pendingWithdrawals || 0 }}</div>
                                                    <div class="stats-label">Pending Withdrawals</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>

                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card success">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="cashIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">${{ formatCurrency(statistics.revenue?.totalRevenue || 0) }}</div>
                                                    <div class="stats-label">Total Revenue</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>

                                    <ion-col size="12" size-md="6" size-lg="3">
                                        <ion-card class="stats-card info">
                                            <ion-card-content>
                                                <div class="stats-icon">
                                                    <ion-icon :icon="trendingUpIcon"></ion-icon>
                                                </div>
                                                <div class="stats-info">
                                                    <div class="stats-value">${{ formatCurrency(statistics.revenue?.totalPayouts || 0) }}</div>
                                                    <div class="stats-label">Total Payouts</div>
                                                </div>
                                            </ion-card-content>
                                        </ion-card>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>

                            <!-- Charts Section -->
                            <div class="charts-section">
                                <ion-grid>
                                    <ion-row>
                                        <!-- Users Registered Per Month -->
                                        <ion-col size="12" size-lg="6">
                                            <ion-card class="chart-card">
                                                <ion-card-header>
                                                    <ion-card-title>Users Registered Per Month</ion-card-title>
                                                </ion-card-header>
                                                <ion-card-content>
                                                    <div v-if="chartLoading.users" class="chart-loading">
                                                        <ion-spinner name="crescent"></ion-spinner>
                                                    </div>
                                                    <div v-else-if="usersChartData" class="chart-container">
                                                        <Bar :data="usersChartData" :options="chartOptions" />
                                                    </div>
                                                    <div v-else class="no-data">No data available</div>
                                                </ion-card-content>
                                            </ion-card>
                                        </ion-col>

                                        <!-- Playlists by Genre -->
                                        <ion-col size="12" size-lg="6">
                                            <ion-card class="chart-card">
                                                <ion-card-header>
                                                    <ion-card-title>Playlists by Genre</ion-card-title>
                                                </ion-card-header>
                                                <ion-card-content>
                                                    <div v-if="chartLoading.genres" class="chart-loading">
                                                        <ion-spinner name="crescent"></ion-spinner>
                                                    </div>
                                                    <div v-else-if="genresChartData" class="chart-container">
                                                        <Doughnut :data="genresChartData" :options="doughnutOptions" />
                                                    </div>
                                                    <div v-else class="no-data">No data available</div>
                                                </ion-card-content>
                                            </ion-card>
                                        </ion-col>
                                    </ion-row>

                                    <ion-row>
                                        <!-- Users by Role -->
                                        <ion-col size="12" size-lg="6">
                                            <ion-card class="chart-card">
                                                <ion-card-header>
                                                    <ion-card-title>Users by Role</ion-card-title>
                                                </ion-card-header>
                                                <ion-card-content>
                                                    <div v-if="chartLoading.roles" class="chart-loading">
                                                        <ion-spinner name="crescent"></ion-spinner>
                                                    </div>
                                                    <div v-else-if="rolesChartData" class="chart-container">
                                                        <Doughnut :data="rolesChartData" :options="doughnutOptions" />
                                                    </div>
                                                    <div v-else class="no-data">No data available</div>
                                                </ion-card-content>
                                            </ion-card>
                                        </ion-col>

                                        <!-- Submissions Per Month -->
                                        <ion-col size="12" size-lg="6">
                                            <ion-card class="chart-card">
                                                <ion-card-header>
                                                    <ion-card-title>Submissions Per Month</ion-card-title>
                                                </ion-card-header>
                                                <ion-card-content>
                                                    <div v-if="chartLoading.submissions" class="chart-loading">
                                                        <ion-spinner name="crescent"></ion-spinner>
                                                    </div>
                                                    <div v-else-if="submissionsChartData" class="chart-container">
                                                        <Bar :data="submissionsChartData" :options="chartOptions" />
                                                    </div>
                                                    <div v-else class="no-data">No data available</div>
                                                </ion-card-content>
                                            </ion-card>
                                        </ion-col>
                                    </ion-row>

                                    <ion-row>
                                        <!-- Playlists Created Per Month -->
                                        <ion-col size="12" size-lg="6">
                                            <ion-card class="chart-card">
                                                <ion-card-header>
                                                    <ion-card-title>Playlists Created Per Month</ion-card-title>
                                                </ion-card-header>
                                                <ion-card-content>
                                                    <div v-if="chartLoading.playlists" class="chart-loading">
                                                        <ion-spinner name="crescent"></ion-spinner>
                                                    </div>
                                                    <div v-else-if="playlistsChartData" class="chart-container">
                                                        <Bar :data="playlistsChartData" :options="chartOptions" />
                                                    </div>
                                                    <div v-else class="no-data">No data available</div>
                                                </ion-card-content>
                                            </ion-card>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </div>
                        </div>

                        <!-- Error State -->
                        <div v-else-if="error" class="error-container">
                            <ion-icon :icon="alertCircleIcon" class="error-icon"></ion-icon>
                            <h3>Failed to load dashboard</h3>
                            <p>{{ error }}</p>
                            <ion-button @click="loadStatistics" fill="outline">Retry</ion-button>
                        </div>
                    </div>
                </ion-content>
            </div>
        </div>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonSpinner, IonIcon, IonButton
} from '@ionic/vue';
import {
    people, list, musicalNotes, documentText, card, time, cash, trendingUp, alertCircle
} from 'ionicons/icons';
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
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default defineComponent({
    name: 'AdminDashboard',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
        IonGrid, IonRow, IonCol, IonSpinner, IonIcon, IonButton,
        AppHeader, AdminSidePanel, Bar, Doughnut
    },
    setup() {
        const loading = ref(true);
        const error = ref<string | null>(null);
        const statistics = ref<any>(null);
        const chartLoading = ref({
            users: true,
            genres: true,
            roles: true,
            submissions: true,
            playlists: true
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

        // Chart data computed properties
        const usersChartData = computed(() => {
            if (!statistics.value?.charts?.usersPerMonth) return null;
            
            const data = statistics.value.charts.usersPerMonth;
            return {
                labels: data.map((item: any) => {
                    const date = new Date(item.month);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Users Registered',
                    data: data.map((item: any) => parseInt(item.count)),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };
        });

        const genresChartData = computed(() => {
            if (!statistics.value?.charts?.playlistsByGenre) return null;
            
            const data = statistics.value.charts.playlistsByGenre;
            return {
                labels: data.map((item: any) => item.genre),
                datasets: [{
                    data: data.map((item: any) => item.count),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                    ]
                }]
            };
        });        const rolesChartData = computed(() => {
            if (!statistics.value?.charts?.usersByRole) return null;
            
            const data = statistics.value.charts.usersByRole;
            
            const colors = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'];
            
            return {
                labels: data.map((item: any) => {
                    switch(item.role) {
                        case 'playlist_maker':
                            return 'Playlist Maker';
                        case 'artist':
                            return 'Artist';
                        default:
                            return item.role;
                    }
                }),
                datasets: [{
                    data: data.map((item: any) => item.count),
                    backgroundColor: colors.slice(0, data.length)
                }]
            };
        });

        const submissionsChartData = computed(() => {
            if (!statistics.value?.charts?.submissionsPerMonth) return null;
            
            const data = statistics.value.charts.submissionsPerMonth;
            return {
                labels: data.map((item: any) => {
                    const date = new Date(item.month);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Submissions',
                    data: data.map((item: any) => parseInt(item.count)),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };
        });

        const playlistsChartData = computed(() => {
            if (!statistics.value?.charts?.playlistsPerMonth) return null;
            
            const data = statistics.value.charts.playlistsPerMonth;
            return {
                labels: data.map((item: any) => {
                    const date = new Date(item.month);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: 'Playlists Created',
                    data: data.map((item: any) => parseInt(item.count)),
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            };
        });

        const formatCurrency = (amount: number) => {
            return amount.toFixed(2);
        };

        const loadStatistics = async () => {
            try {
                loading.value = true;
                error.value = null;
                statistics.value = await AdminService.getStatistics();
                
                // Set chart loading states to false after a brief delay for better UX
                setTimeout(() => {
                    chartLoading.value = {
                        users: false,
                        genres: false,
                        roles: false,
                        submissions: false,
                        playlists: false
                    };
                }, 500);
            } catch (err: any) {
                console.error('Failed to load statistics:', err);
                error.value = err.response?.data?.message || 'Failed to load dashboard statistics';
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            loadStatistics();
        });

        return {
            loading,
            error,
            statistics,
            chartLoading,
            usersChartData,
            genresChartData,
            rolesChartData,
            submissionsChartData,
            playlistsChartData,
            chartOptions,
            doughnutOptions,
            formatCurrency,
            loadStatistics,
            // Icons
            peopleIcon: people,
            listIcon: list,
            musicalNotesIcon: musicalNotes,
            documentTextIcon: documentText,
            cardIcon: card,
            timeIcon: time,
            cashIcon: cash,
            trendingUpIcon: trendingUp,
            alertCircleIcon: alertCircle
        };
    }
});
</script>

<style scoped>
.admin-layout {
    display: flex;
    height: 100vh;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.dashboard-content {
    --background: #f8f9fa;
}

.dashboard-container {
    padding: 16px;
    max-width: 1400px;
    margin: 0 auto;
}

.welcome-header {
    text-align: center;
    margin-bottom: 24px;
}

.welcome-header h1 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 2rem;
    font-weight: 600;
}

.welcome-header p {
    margin: 0;
    color: #666;
    font-size: 1.1rem;
}

.loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
}

.error-icon {
    font-size: 48px;
    color: #ff4444;
    margin-bottom: 16px;
}

.stats-grid {
    margin-bottom: 32px;
}

.stats-card {
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-card.warning {
    border-left: 4px solid #ff9500;
}

.stats-card.success {
    border-left: 4px solid #28a745;
}

.stats-card.info {
    border-left: 4px solid #17a2b8;
}

.stats-card ion-card-content {
    display: flex;
    align-items: center;
    padding: 16px;
}

.stats-icon {
    margin-right: 16px;
}

.stats-icon ion-icon {
    font-size: 2.5rem;
    color: #3880ff;
}

.stats-info {
    flex: 1;
}

.stats-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 4px;
    color: #333;
}

.stats-label {
    font-size: 0.9rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.charts-section {
    margin-top: 32px;
}

.chart-card {
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
    height: 300px;
    position: relative;
}

.chart-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
}

.no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #666;
    font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
    .admin-layout {
        flex-direction: column;
    }
    
    .dashboard-container {
        padding: 12px;
    }
    
    .welcome-header h1 {
        font-size: 1.5rem;
    }
    
    .stats-value {
        font-size: 1.5rem;
    }
    
    .chart-container {
        height: 250px;
    }
}
</style>
