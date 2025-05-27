<template>
    <ion-page>
        <app-header title="Balance & Payments" :back-url="backUrl"></app-header>

        <ion-content :fullscreen="true" class="balance-page">
            <div class="balance-container">
                <!-- Balance Overview -->
                <div class="balance-section">
                    <h2>Your Balance</h2>

                    <ion-grid class="balance-grid">
                        <ion-row>
                            <ion-col size="12" size-md="4">
                                <ion-card class="balance-card available">
                                    <ion-card-content>
                                        <div class="balance-icon">
                                            <ion-icon :icon="walletIcon"></ion-icon>
                                        </div>
                                        <div class="balance-info">
                                            <div class="balance-amount">{{ formatCurrency(balance.available) }}</div>
                                            <div class="balance-label">Available</div>
                                            <div class="balance-description">Ready to withdraw</div>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="12" size-md="4">
                                <ion-card class="balance-card pending">
                                    <ion-card-content>
                                        <div class="balance-icon">
                                            <ion-icon :icon="timeIcon"></ion-icon>
                                        </div>
                                        <div class="balance-info">
                                            <div class="balance-amount">{{ formatCurrency(balance.pending) }}</div>
                                            <div class="balance-label">Pending</div>
                                            <div class="balance-description">Processing payments</div>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>

                            <ion-col size="12" size-md="4">
                                <ion-card class="balance-card total">
                                    <ion-card-content>
                                        <div class="balance-icon">
                                            <ion-icon :icon="cashIcon"></ion-icon>
                                        </div>
                                        <div class="balance-info">
                                            <div class="balance-amount">{{ formatCurrency(balance.total) }}</div>
                                            <div class="balance-label">Total Earned</div>
                                            <div class="balance-description">All-time earnings</div>
                                        </div>
                                    </ion-card-content>
                                </ion-card>
                            </ion-col>
                        </ion-row>
                    </ion-grid>

                    <!-- Action Buttons -->
                    <div class="balance-actions">
                        <ion-button 
                            v-if="balance.available > 0" 
                            color="primary" 
                            @click="withdrawBalance"
                            :disabled="loading"
                        >
                            <ion-icon :icon="downloadIcon" slot="start"></ion-icon>
                            Withdraw Funds
                        </ion-button>
                        
                        <ion-button 
                            fill="outline" 
                            color="secondary" 
                            router-link="/payment-methods"
                        >
                            <ion-icon :icon="cardIcon" slot="start"></ion-icon>
                            Manage Payment Methods
                        </ion-button>
                    </div>
                </div>

                <!-- Transaction History -->
                <div class="transactions-section">
                    <div class="section-header">
                        <h2>Recent Transactions</h2>
                        <ion-button fill="clear" size="small" @click="loadTransactions">
                            <ion-icon :icon="refreshIcon"></ion-icon>
                        </ion-button>
                    </div>

                    <div v-if="loadingTransactions" class="loading-container">
                        <ion-spinner></ion-spinner>
                        <p>Loading transactions...</p>
                    </div>

                    <div v-else-if="transactions.length === 0" class="empty-state">
                        <empty-state-display
                            icon="receipt-outline"
                            title="No Transactions Yet"
                            description="Your transaction history will appear here once you start earning."
                        />
                    </div>

                    <ion-list v-else class="transactions-list">
                        <ion-item v-for="transaction in transactions" :key="transaction.transaction_id">
                            <ion-icon 
                                :icon="getTransactionIcon(transaction)" 
                                :color="getTransactionColor(transaction)" 
                                slot="start"
                            ></ion-icon>
                            
                            <ion-label>
                                <h3>{{ getTransactionTitle(transaction) }}</h3>
                                <p>{{ formatDate(transaction.created_at) }}</p>
                                <ion-note>{{ transaction.status }}</ion-note>
                            </ion-label>
                            
                            <ion-note slot="end" :color="getTransactionColor(transaction)">
                                {{ getTransactionAmount(transaction) }}
                            </ion-note>
                        </ion-item>
                    </ion-list>
                </div>
            </div>
        </ion-content>

        <bottom-navigation></bottom-navigation>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import {
    IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonSpinner,
    alertController, toastController
} from '@ionic/vue';
import {
    wallet, time, cash, download, card, refresh, receipt,
    trendingUp, trendingDown, checkmarkCircle, timeOutline
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import { useAuthStore } from '@/store';
import { TransactionService } from '@/services/TransactionService';
import { Transaction, TransactionStatus } from '@/types';

export default defineComponent({
    name: 'BalancePage',
    components: {
        IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
        IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonSpinner,
        AppHeader, BottomNavigation, EmptyStateDisplay
    },
    setup() {
        const authStore = useAuthStore();
        
        const balance = ref({
            available: 0,
            pending: 0,
            total: 0
        });
        
        const transactions = ref<Transaction[]>([]);
        const loading = ref(false);
        const loadingTransactions = ref(true);

        const backUrl = computed(() => {
            if (authStore.isArtist) {
                return '/artist/dashboard';
            } else if (authStore.isPlaylistMaker) {
                return '/playlist-maker/dashboard';
            }
            return '/dashboard';
        });

        const formatCurrency = (amount: number): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        };

        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getTransactionIcon = (transaction: Transaction) => {
            if (transaction.amount_total > 0) {
                return trendingUp;
            }
            return trendingDown;
        };

        const getTransactionColor = (transaction: Transaction) => {
            switch (transaction.status) {
                case TransactionStatus.SUCCEEDED:
                    return 'success';
                case TransactionStatus.PENDING:
                    return 'warning';
                case TransactionStatus.FAILED:
                    return 'danger';
                default:
                    return 'medium';
            }
        };

        const getTransactionTitle = (transaction: Transaction): string => {
            if (transaction.amount_total > 0) {
                return 'Payment Received';
            }
            return 'Withdrawal';
        };

        const getTransactionAmount = (transaction: Transaction): string => {
            const prefix = transaction.amount_total > 0 ? '+' : '';
            return prefix + formatCurrency(Math.abs(transaction.amount_total));
        };

        const loadBalance = async () => {
            try {
                // TODO: Implement balance API call
                // const balanceData = await TransactionService.getBalance(authStore.user?.user_id);
                // balance.value = balanceData;
                
                // Mock data for now
                balance.value = {
                    available: 150.75,
                    pending: 25.50,
                    total: 1250.25
                };
            } catch (error) {
                console.error('Failed to load balance:', error);
                showToast('Failed to load balance', 'danger');
            }
        };

        const loadTransactions = async () => {
            try {
                loadingTransactions.value = true;
                // TODO: Implement transaction API call
                // transactions.value = await TransactionService.getTransactions(authStore.user?.user_id);
                
                // Mock data for now
                transactions.value = [];
            } catch (error) {
                console.error('Failed to load transactions:', error);
                showToast('Failed to load transactions', 'danger');
            } finally {
                loadingTransactions.value = false;
            }
        };

        const withdrawBalance = async () => {
            if (balance.value.available <= 0) {
                showToast('No funds available for withdrawal', 'warning');
                return;
            }

            const alert = await alertController.create({
                header: 'Withdraw Funds',
                message: `Are you sure you want to withdraw ${formatCurrency(balance.value.available)}?`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Withdraw',
                        handler: async () => {
                            try {
                                loading.value = true;
                                // TODO: Implement withdrawal API call
                                // await TransactionService.withdrawFunds(authStore.user?.user_id, balance.value.available);
                                
                                showToast('Withdrawal initiated successfully', 'success');
                                await loadBalance();
                                await loadTransactions();
                            } catch (error) {
                                console.error('Withdrawal failed:', error);
                                showToast('Failed to initiate withdrawal', 'danger');
                            } finally {
                                loading.value = false;
                            }
                        }
                    }
                ]
            });

            await alert.present();
        };

        const showToast = async (message: string, color: string) => {
            const toast = await toastController.create({
                message,
                duration: 3000,
                color,
                position: 'bottom'
            });
            await toast.present();
        };

        onMounted(() => {
            loadBalance();
            loadTransactions();
        });

        return {
            balance,
            transactions,
            loading,
            loadingTransactions,
            backUrl,
            formatCurrency,
            formatDate,
            getTransactionIcon,
            getTransactionColor,
            getTransactionTitle,
            getTransactionAmount,
            loadTransactions,
            withdrawBalance,
            // Icons
            walletIcon: wallet,
            timeIcon: time,
            cashIcon: cash,
            downloadIcon: download,
            cardIcon: card,
            refreshIcon: refresh,
            receiptIcon: receipt
        };
    }
});
</script>

<style scoped>
.balance-page {
    --background: var(--ion-color-light);
}

.balance-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
}

.balance-section {
    margin-bottom: 2rem;
}

.balance-grid {
    margin-bottom: 1.5rem;
}

.balance-card {
    margin: 0.5rem 0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.balance-card.available {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.balance-card.pending {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

.balance-card.total {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
}

.balance-card ion-card-content {
    display: flex;
    align-items: center;
    padding: 1.5rem;
}

.balance-icon {
    margin-right: 1rem;
    font-size: 2rem;
}

.balance-info {
    flex: 1;
}

.balance-amount {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.balance-label {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
}

.balance-description {
    font-size: 0.8rem;
    opacity: 0.7;
}

.balance-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.balance-actions ion-button {
    flex: 1;
    min-width: 200px;
}

.transactions-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.section-header h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    color: var(--ion-color-medium);
}

.loading-container ion-spinner {
    margin-bottom: 1rem;
}

.empty-state {
    padding: 2rem;
}

.transactions-list {
    background: transparent;
}

.transactions-list ion-item {
    --padding-start: 0;
    --inner-padding-end: 0;
    margin-bottom: 0.5rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .balance-container {
        padding: 0.5rem;
    }
    
    .balance-actions {
        flex-direction: column;
    }
    
    .balance-actions ion-button {
        min-width: auto;
    }
    
    .balance-amount {
        font-size: 1.5rem;
    }
}
</style>
