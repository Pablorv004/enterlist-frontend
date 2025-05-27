<template>
    <div class="balance-container">
        <!-- Header -->
        <div class="balance-header">
            <div class="header-info">
                <h2>{{ title }}</h2>
                <p class="subtitle">{{ subtitle }}</p>
            </div>
            <ion-button 
                v-if="showPayoutButton" 
                @click="requestPayout"
                :disabled="!canRequestPayout"
                fill="outline"
                color="primary"
            >
                <ion-icon :icon="cashOutline" slot="start"></ion-icon>
                Request Payout
            </ion-button>
        </div>

        <!-- Balance Cards -->
        <div class="balance-cards">
            <ion-card class="balance-card total">
                <ion-card-content>
                    <div class="balance-amount">
                        <ion-icon :icon="trendingUpOutline" class="balance-icon"></ion-icon>
                        <div class="amount-info">
                            <h3>${{ totalBalance.toFixed(2) }}</h3>
                            <p>Total Earned</p>
                        </div>
                    </div>
                </ion-card-content>
            </ion-card>

            <ion-card class="balance-card available">
                <ion-card-content>
                    <div class="balance-amount">
                        <ion-icon :icon="walletOutline" class="balance-icon"></ion-icon>
                        <div class="amount-info">
                            <h3>${{ availableBalance.toFixed(2) }}</h3>
                            <p>Available</p>
                        </div>
                    </div>
                </ion-card-content>
            </ion-card>

            <ion-card class="balance-card pending">
                <ion-card-content>
                    <div class="balance-amount">
                        <ion-icon :icon="timeOutline" class="balance-icon"></ion-icon>
                        <div class="amount-info">
                            <h3>${{ pendingBalance.toFixed(2) }}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                </ion-card-content>
            </ion-card>
        </div>

        <!-- Earnings Chart -->
        <ion-card v-if="showChart" class="chart-card">
            <ion-card-header>
                <ion-card-title>Earnings Overview</ion-card-title>
                <div class="chart-controls">
                    <ion-segment v-model="selectedPeriod" @ionChange="onPeriodChange">
                        <ion-segment-button value="week">
                            <ion-label>Week</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="month">
                            <ion-label>Month</ion-label>
                        </ion-segment-button>
                        <ion-segment-button value="year">
                            <ion-label>Year</ion-label>
                        </ion-segment-button>
                    </ion-segment>
                </div>
            </ion-card-header>
            <ion-card-content>
                <div class="chart-container">
                    <canvas ref="chartCanvas" width="400" height="200"></canvas>
                </div>
            </ion-card-content>
        </ion-card>

        <!-- Recent Transactions -->
        <ion-card class="transactions-card">
            <ion-card-header>
                <ion-card-title>Recent Transactions</ion-card-title>
            </ion-card-header>
            <ion-card-content>
                <div v-if="loading" class="loading-container">
                    <ion-spinner></ion-spinner>
                    <p>Loading transactions...</p>
                </div>
                <div v-else-if="transactions.length === 0" class="empty-state">
                    <ion-icon :icon="receiptOutline" size="large"></ion-icon>
                    <p>No transactions yet</p>
                </div>
                <div v-else>
                    <div 
                        v-for="transaction in transactions" 
                        :key="transaction.transaction_id"
                        class="transaction-item"
                    >                        <div class="transaction-info">
                            <div class="transaction-main">
                                <h4>{{ getTransactionDescription(transaction) }}</h4>
                                <p class="transaction-date">
                                    {{ formatDate(transaction.created_at) }}
                                </p>
                            </div>
                            <div class="transaction-details">
                                <span class="transaction-id">#{{ transaction.transaction_id.slice(-8) }}</span>
                                <ion-badge 
                                    :color="getStatusColor(transaction.status)"
                                    class="status-badge"
                                >
                                    {{ formatStatus(transaction.status) }}
                                </ion-badge>
                            </div>
                        </div>
                        <div class="transaction-amount">
                            <span class="amount" :class="getAmountClass(transaction, props.userType)">
                                {{ getFormattedAmount(transaction, props.userType) }}
                            </span>
                        </div>
                    </div>
                    <ion-button 
                        v-if="hasMoreTransactions"
                        @click="loadMoreTransactions"
                        fill="clear"
                        expand="block"
                        class="load-more-btn"
                    >
                        Load More
                    </ion-button>
                </div>
            </ion-card-content>
        </ion-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonSpinner,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    toastController,
    alertController,
} from '@ionic/vue';
import {
    cashOutline,
    trendingUpOutline,
    walletOutline,
    timeOutline,
    receiptOutline,
} from 'ionicons/icons';
import { TransactionService } from '@/services/TransactionService';
import type { PaymentMethodType, SubmissionStatus, Transaction, UserRole } from '@/types';
import { TransactionStatus } from '@/types';

interface Props {
    userType: 'artist' | 'playlist_maker';
    title?: string;
    subtitle?: string;
    showChart?: boolean;
    showPayoutButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Balance',
    subtitle: 'Track your earnings and transactions',
    showChart: true,
    showPayoutButton: true,
});

// Data
const loading = ref(true);
const transactions = ref<Transaction[]>([]);
const totalBalance = ref(0);
const availableBalance = ref(0);
const pendingBalance = ref(0);
const selectedPeriod = ref<'week' | 'month' | 'year'>('month');
const hasMoreTransactions = ref(false);
const currentPage = ref(0);
const chartCanvas = ref<HTMLCanvasElement>();

// Computed
const canRequestPayout = computed(() => availableBalance.value >= 10); // Minimum $10 for payout

// Methods
const loadBalanceData = async () => {
    try {
        if (props.userType === 'playlist_maker') {
            const balanceData = await TransactionService.getPlaylistMakerBalance();
            totalBalance.value = balanceData.total || 0;
            availableBalance.value = balanceData.available || 0;
            pendingBalance.value = balanceData.pending || 0;        } else {
            // For artists, calculate from transactions
            const artistTransactions = await TransactionService.getArtistTransactions();
            
            // For artists, we sum the total amounts of successful transactions
            totalBalance.value = artistTransactions.data
                .filter(t => t.status === TransactionStatus.SUCCEEDED)
                .reduce((sum, t) => sum + t.amount_total, 0);
            
            // Available balance is the same as total for artists (they already paid)
            availableBalance.value = totalBalance.value;
            
            // Pending transactions
            pendingBalance.value = artistTransactions.data
                .filter(t => t.status === TransactionStatus.PENDING || t.status === TransactionStatus.PROCESSING)
                .reduce((sum, t) => sum + t.amount_total, 0);
        }
    } catch (error) {
        console.error('Failed to load balance data:', error);
        showToast('Failed to load balance data', 'danger');
    }
};

const loadTransactions = async (reset = false) => {
    try {
        loading.value = reset;
        const skip = reset ? 0 : transactions.value.length;
        
        let response;
        if (props.userType === 'playlist_maker') {
            response = await TransactionService.getPlaylistMakerTransactions(skip, 10);
        } else {
            response = await TransactionService.getArtistTransactions(skip, 10);
        }

        if (reset) {
            transactions.value = response.data;
        } else {
            transactions.value.push(...response.data);
        }
        
        hasMoreTransactions.value = response.data.length === 10;
        currentPage.value = reset ? 1 : currentPage.value + 1;
    } catch (error) {
        console.error('Failed to load transactions:', error);
        showToast('Failed to load transactions', 'danger');
    } finally {
        loading.value = false;
    }
};

const loadMoreTransactions = () => {
    loadTransactions(false);
};

const loadEarningsChart = async () => {
    if (!props.showChart || !chartCanvas.value) return;

    try {
        if (props.userType === 'playlist_maker') {
            const stats = await TransactionService.getEarningsStats(selectedPeriod.value);
            drawChart(stats);
        }
    } catch (error) {
        console.error('Failed to load chart data:', error);
    }
};

const drawChart = (data: any) => {
    if (!chartCanvas.value) return;

    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;

    // Simple chart drawing (you might want to use Chart.js for more sophisticated charts)
    ctx.clearRect(0, 0, chartCanvas.value.width, chartCanvas.value.height);
    
    // Basic line chart implementation
    ctx.strokeStyle = '#3880ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const maxValue = Math.max(...data.map((d: any) => d.amount), 1);
    const stepX = chartCanvas.value.width / (data.length - 1);
    const stepY = chartCanvas.value.height / maxValue;
    
    data.forEach((point: any, index: number) => {
        const x = index * stepX;
        const y = chartCanvas.value!.height - (point.amount * stepY);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
};

const requestPayout = async () => {
    if (!canRequestPayout.value) {
        showToast('Minimum payout amount is $10', 'warning');
        return;
    }

    const alert = await alertController.create({
        header: 'Request Payout',
        message: `Request payout of $${availableBalance.value.toFixed(2)}?`,
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Request',
                role: 'confirm',
                handler: async () => {
                    try {
                        // TODO: Implement payout request
                        showToast('Payout request submitted successfully', 'success');
                        await loadBalanceData();
                    } catch (error) {
                        showToast('Failed to request payout', 'danger');
                    }
                },
            },
        ],
    });

    await alert.present();
};

const onPeriodChange = (event: any) => {
    selectedPeriod.value = event.detail.value;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'failed':
            return 'danger';
        default:
            return 'medium';
    }
};

const getAmountClass = (transaction: { transaction_id: string; submission_id: string; payment_method_id: string; amount_total: number; currency: string; platform_fee: number; creator_payout_amount: number; status: TransactionStatus; payment_provider_transaction_id?: string | undefined; created_at: string; updated_at: string; payment_method?: { payment_method_id: string; artist_id: string; type: PaymentMethodType; provider_token: string; details: string; is_default: boolean; created_at: string; updated_at: string; artist?: { user_id: string; username: string; email: string; password_hash?: string | undefined; oauth_provider?: string | undefined; oauth_id?: string | undefined; role: UserRole; is_active: boolean; created_at: string; updated_at: string; } | undefined; } | undefined; submission?: { submission_id: string; artist_id: string; playlist_id: string; song_id: string; status: SubmissionStatus; submission_message?: string | undefined; review_feedback?: string | undefined; submitted_at: string; reviewed_at?: string | undefined; artist?: { user_id: string; username: string; email: string; password_hash?: string | undefined; oauth_provider?: string | undefined; oauth_id?: string | undefined; role: UserRole; is_active: boolean; created_at: string; updated_at: string; } | undefined; playlist?: { playlist_id: string; creator_id: string; platform_id: number; platform_specific_id: string; name: string; description?: string | undefined; url?: string | undefined; cover_image_url?: string | undefined; is_visible: boolean; genre?: string | undefined; submission_fee?: number | undefined; track_count?: number | undefined; created_at: string; updated_at: string; creator?: { user_id: string; username: string; email: string; password_hash?: string | undefined; oauth_provider?: string | undefined; oauth_id?: string | undefined; role: UserRole; is_active: boolean; created_at: string; updated_at: string; } | undefined; platform?: { platform_id: number; name: string; } | undefined; } | undefined; song?: { song_id: string; artist_id: string; platform_id: number; platform_specific_id: string; title: string; artist_name_on_platform: string; album_name?: string | undefined; url?: string | undefined; cover_image_url?: string | undefined; duration_ms?: number | undefined; is_visible: boolean; created_at: string; updated_at: string; artist?: { user_id: string; username: string; email: string; password_hash?: string | undefined; oauth_provider?: string | undefined; oauth_id?: string | undefined; role: UserRole; is_active: boolean; created_at: string; updated_at: string; } | undefined; platform?: { platform_id: number; name: string; } | undefined; } | undefined; transaction?: /*elided*/ any | undefined; } | undefined; }, type: string) => {
    return type === 'earning' ? 'positive' : 'negative';
};

const showToast = async (message: string, color: string = 'primary') => {
    const toast = await toastController.create({
        message,
        duration: 3000,
        color,
    });
    await toast.present();
};

// Add missing helper functions after the loadEarningsChart function
const getTransactionDescription = (transaction: Transaction): string => {
    if (props.userType === 'playlist_maker') {
        return `Payment from ${transaction.submission?.artist?.username || 'Unknown'} for "${transaction.submission?.song?.title || 'Unknown Song'}"`;
    } else {
        return `Payment to ${transaction.submission?.playlist?.creator?.username || 'Unknown'} for "${transaction.submission?.playlist?.name || 'Unknown Playlist'}"`;
    }
};

const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const getFormattedAmount = (transaction: Transaction, userType: string): string => {
    const amount = userType === 'playlist_maker' 
        ? transaction.creator_payout_amount 
        : transaction.amount_total;
    const sign = userType === 'playlist_maker' ? '+' : '-';
    return `${sign}$${amount.toFixed(2)}`;
};

// Watchers
watch(selectedPeriod, () => {
    loadEarningsChart();
});

// Lifecycle
onMounted(async () => {
    await Promise.all([
        loadBalanceData(),
        loadTransactions(true),
    ]);
    
    await nextTick();
    loadEarningsChart();
});
</script>

<style scoped>
.balance-container {
    padding: 16px;
    max-width: 1200px;
    margin: 0 auto;
}

.balance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header-info h2 {
    margin: 0;
    color: var(--ion-color-primary);
}

.header-info .subtitle {
    margin: 4px 0 0 0;
    color: var(--ion-color-medium);
    font-size: 0.9rem;
}

.balance-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.balance-card {
    margin: 0;
}

.balance-card.total {
    --ion-color-primary: #28a745;
}

.balance-card.available {
    --ion-color-primary: #007bff;
}

.balance-card.pending {
    --ion-color-primary: #ffc107;
}

.balance-amount {
    display: flex;
    align-items: center;
    gap: 12px;
}

.balance-icon {
    font-size: 2rem;
    color: var(--ion-color-primary);
}

.amount-info h3 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--ion-text-color);
}

.amount-info p {
    margin: 4px 0 0 0;
    color: var(--ion-color-medium);
    font-size: 0.9rem;
}

.chart-card {
    margin-bottom: 24px;
}

.chart-controls {
    margin-top: 12px;
}

.chart-container {
    padding: 16px 0;
}

.transactions-card {
    margin-bottom: 0;
}

.loading-container {
    text-align: center;
    padding: 40px;
}

.loading-container p {
    margin-top: 16px;
    color: var(--ion-color-medium);
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: var(--ion-color-medium);
}

.empty-state ion-icon {
    margin-bottom: 16px;
    opacity: 0.5;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--ion-color-light);
}

.transaction-item:last-child {
    border-bottom: none;
}

.transaction-info {
    flex: 1;
}

.transaction-main h4 {
    margin: 0 0 4px 0;
    color: var(--ion-text-color);
}

.transaction-date {
    margin: 0;
    color: var(--ion-color-medium);
    font-size: 0.85rem;
}

.transaction-details {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
}

.transaction-id {
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--ion-color-medium);
}

.status-badge {
    font-size: 0.75rem;
}

.transaction-amount {
    text-align: right;
}

.amount {
    font-size: 1.1rem;
    font-weight: bold;
}

.amount.positive {
    color: var(--ion-color-success);
}

.amount.negative {
    color: var(--ion-color-danger);
}

.load-more-btn {
    margin-top: 16px;
}

@media (max-width: 768px) {
    .balance-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .balance-cards {
        grid-template-columns: 1fr;
    }

    .transaction-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .transaction-amount {
        align-self: flex-end;
    }
}
</style>
