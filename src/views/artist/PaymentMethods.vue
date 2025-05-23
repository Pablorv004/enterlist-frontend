<template>
    <ion-page>
        <app-header title="Payment Methods" :back-button="true" back-url="/artist/dashboard"></app-header>

        <ion-content :fullscreen="true" class="payment-methods-content">
            <div class="payment-methods-container">
                <!-- Loading State -->
                <div v-if="loading" class="loading-container">
                    <ion-spinner name="crescent"></ion-spinner>
                    <p>Loading payment methods...</p>
                </div>                <!-- Empty State -->
                <empty-state-display 
                    v-else-if="paymentMethods.length === 0"
                    :icon="cardIcon"
                    title="No Payment Methods"
                    message="Add a payment method to submit your songs to playlists"
                    resource-type="payment-methods">
                    <template #actions>
                        <ion-button @click="showAddPaymentMethodModal">
                            <ion-icon :icon="addIcon" slot="start"></ion-icon>
                            Add Payment Method
                        </ion-button>
                    </template>
                </empty-state-display>

                <!-- Payment Methods List -->
                <div v-else>
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Your Payment Methods</ion-card-title>
                            <ion-card-subtitle>Manage your payment options for song submissions</ion-card-subtitle>
                        </ion-card-header>

                        <ion-card-content>
                            <ion-list>
                                <ion-item-sliding v-for="method in paymentMethods" :key="method.payment_method_id">
                                    <ion-item class="payment-method-item">
                                        <ion-thumbnail slot="start" class="payment-method-icon">
                                            <img :src="getPaymentMethodIcon(method.type)" :alt="method.type">
                                        </ion-thumbnail>

                                        <ion-label>
                                            <h3>{{ formatPaymentMethodName(method) }}</h3>
                                            <p>{{ formatPaymentMethodDetails(method) }}</p>
                                        </ion-label>

                                        <ion-badge v-if="method.is_default" color="success"
                                            slot="end">Default</ion-badge>
                                    </ion-item>

                                    <ion-item-options side="end">
                                        <ion-item-option v-if="!method.is_default" color="success"
                                            @click="setDefaultPaymentMethod(method.payment_method_id)">
                                            <ion-icon :icon="checkmarkIcon" slot="icon-only"></ion-icon>
                                            Set Default
                                        </ion-item-option>

                                        <ion-item-option color="danger"
                                            @click="confirmDeletePaymentMethod(method.payment_method_id)">
                                            <ion-icon :icon="trashIcon" slot="icon-only"></ion-icon>
                                            Delete
                                        </ion-item-option>
                                    </ion-item-options>
                                </ion-item-sliding>
                            </ion-list>
                        </ion-card-content>
                    </ion-card>

                    <div class="add-payment-method-btn">
                        <ion-button @click="showAddPaymentMethodModal" expand="block">
                            <ion-icon :icon="addIcon" slot="start"></ion-icon>
                            Add New Payment Method
                        </ion-button>
                    </div>
                </div>

                <!-- Payment History -->
                <ion-card class="payment-history-card">
                    <ion-card-header>
                        <ion-card-title>Payment History</ion-card-title>
                        <ion-card-subtitle>View your recent transactions</ion-card-subtitle>
                    </ion-card-header>

                    <ion-card-content>
                        <div v-if="loadingTransactions" class="loading-transactions">
                            <ion-spinner name="crescent"></ion-spinner>
                            <p>Loading transactions...</p>
                        </div>

                        <div v-else-if="transactions.length === 0" class="empty-transactions">
                            <p>No transactions yet</p>
                        </div>

                        <ion-list v-else>
                            <ion-item v-for="transaction in transactions" :key="transaction.transaction_id"
                                class="transaction-item">
                                <ion-thumbnail slot="start" class="transaction-icon">
                                    <div class="transaction-status-icon"
                                        :class="getTransactionStatusClass(transaction.status)">
                                        <ion-icon :icon="getTransactionStatusIcon(transaction.status)"></ion-icon>
                                    </div>
                                </ion-thumbnail>

                                <ion-label>
                                    <h3>{{ formatTransactionTitle(transaction) }}</h3>
                                    <p>{{ formatDate(transaction.created_at) }}</p>
                                </ion-label>

                                <div slot="end" class="transaction-amount"
                                    :class="getTransactionStatusClass(transaction.status)">
                                    {{ formatCurrency(transaction.amount_total, transaction.currency) }}
                                </div>
                            </ion-item>
                        </ion-list>

                        <div v-if="transactions.length > 0" class="view-all-transactions">
                            <ion-button fill="clear" size="small">
                                View All Transactions
                                <ion-icon :icon="arrowForwardIcon" slot="end"></ion-icon>
                            </ion-button>
                        </div>
                    </ion-card-content>
                </ion-card>
            </div>
        </ion-content>

        <!-- Add Payment Method Modal -->
        <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Add Payment Method</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeModal">
                            <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding">
                <ion-list>
                    <ion-radio-group v-model="newPaymentMethod.type">
                        <ion-list-header>
                            <ion-label>Payment Type</ion-label>
                        </ion-list-header>

                        <ion-item>
                            <ion-thumbnail slot="start" class="payment-method-icon">
                                <img src="@/assets/logo.png" alt="Credit Card">
                            </ion-thumbnail>
                            <ion-label>Credit Card</ion-label>
                            <ion-radio slot="end" value="card"></ion-radio>
                        </ion-item>

                        <ion-item>
                            <ion-thumbnail slot="start" class="payment-method-icon">
                                <img src="@/assets/logo.png" alt="PayPal">
                            </ion-thumbnail>
                            <ion-label>PayPal</ion-label>
                            <ion-radio slot="end" value="paypal"></ion-radio>
                        </ion-item>
                    </ion-radio-group>
                </ion-list>

                <div v-if="newPaymentMethod.type === 'card'" class="card-form">
                    <ion-item>
                        <ion-label position="stacked">Card Number</ion-label>
                        <ion-input v-model="newPaymentMethod.cardNumber" placeholder="XXXX XXXX XXXX XXXX"
                            type="text"></ion-input>
                    </ion-item>

                    <div class="card-row">
                        <ion-item class="expiry-item">
                            <ion-label position="stacked">Expiry Date</ion-label>
                            <ion-input v-model="newPaymentMethod.expiryDate" placeholder="MM/YY"
                                type="text"></ion-input>
                        </ion-item>

                        <ion-item class="cvv-item">
                            <ion-label position="stacked">CVV</ion-label>
                            <ion-input v-model="newPaymentMethod.cvv" placeholder="XXX" type="text"></ion-input>
                        </ion-item>
                    </div>

                    <ion-item>
                        <ion-label position="stacked">Name on Card</ion-label>
                        <ion-input v-model="newPaymentMethod.cardholderName" placeholder="John Doe"
                            type="text"></ion-input>
                    </ion-item>
                </div>

                <div v-if="newPaymentMethod.type === 'paypal'" class="paypal-form">
                    <ion-item>
                        <ion-label position="stacked">PayPal Email</ion-label>
                        <ion-input v-model="newPaymentMethod.paypalEmail" placeholder="email@example.com"
                            type="email"></ion-input>
                    </ion-item>
                </div>

                <ion-item lines="none">
                    <ion-checkbox v-model="newPaymentMethod.setAsDefault">Set as default payment method</ion-checkbox>
                </ion-item>

                <div class="submit-button">
                    <ion-button expand="block" @click="addPaymentMethod" :disabled="addingPaymentMethod">
                        <ion-spinner v-if="addingPaymentMethod" name="crescent"></ion-spinner>
                        <span v-else>Add Payment Method</span>
                    </ion-button>
                </div>
            </ion-content>
        </ion-modal>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import {
    IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonList, IonItem, IonItemSliding, IonItemOption, IonItemOptions,
    IonThumbnail, IonLabel, IonBadge, IonButton, IonIcon, IonSpinner, IonModal,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonRadioGroup, IonRadio, IonListHeader,
    IonInput, IonCheckbox, alertController, toastController
} from '@ionic/vue';
import {
    cardOutline, addOutline, checkmarkOutline, trashOutline, closeOutline,
    checkmarkCircle, closeCircle, timeOutline, arrowForward
} from 'ionicons/icons';
import AppHeader from '@/components/AppHeader.vue';
import EmptyStateDisplay from '@/components/EmptyStateDisplay.vue';
import { PaymentMethodService } from '@/services/PaymentMethodService';
import { TransactionService } from '@/services/TransactionService';
import { useAuthStore } from '@/store';
import { PaymentMethod, Transaction, PaymentMethodType, TransactionStatus } from '@/types';

export default defineComponent({
    name: 'ArtistPaymentMethods',
    components: {
        IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
        IonCardContent, IonList, IonItem, IonItemSliding, IonItemOption, IonItemOptions,        IonThumbnail, IonLabel, IonBadge, IonButton, IonIcon, IonSpinner, IonModal,
        IonHeader, IonToolbar, IonTitle, IonButtons, IonRadioGroup, IonRadio, IonListHeader,
        IonInput, IonCheckbox, AppHeader, EmptyStateDisplay
    },
    setup() {
        const authStore = useAuthStore();
        const userId = computed(() => authStore.user?.user_id || '');

        const paymentMethods = ref<PaymentMethod[]>([]);
        const transactions = ref<Transaction[]>([]);
        const loading = ref(true);
        const loadingTransactions = ref(true);

        const isModalOpen = ref(false);
        const addingPaymentMethod = ref(false);

        const newPaymentMethod = reactive({
            type: 'card' as PaymentMethodType,
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: '',
            paypalEmail: '',
            setAsDefault: false
        });

        onMounted(async () => {
            if (userId.value) {
                await Promise.all([
                    fetchPaymentMethods(),
                    fetchTransactions()
                ]);
            }
        });

        const fetchPaymentMethods = async () => {
            try {
                loading.value = true;
                //TODO: Fetch payment methods based on userId
                // paymentMethods.value = await PaymentMethodService.getPaymentMethodsByArtist(userId.value);
            } catch (error) {
                showToast('Failed to load payment methods', 'danger');
            } finally {
                loading.value = false;
            }
        };

        const fetchTransactions = async () => {
            try {
                loadingTransactions.value = true;
                //TODO: Fetch transactions based on userId
                // const response = await TransactionService.getTransactionsByUser(userId.value, 0, 5);
                // transactions.value = response.data;
            } catch (error) {
                showToast('Failed to load transactions', 'danger');
            } finally {
                loadingTransactions.value = false;
            }
        };        const getPaymentMethodIcon = (type: PaymentMethodType): string => {
            if (type === PaymentMethodType.CARD) {
                return '../assets/logo.png'; // Using an existing image
            } else if (type === PaymentMethodType.PAYPAL) {
                return '../assets/logo.png'; // Using an existing image
            }
            return '../assets/logo.png'; // Using an existing image
        };

        const formatPaymentMethodName = (method: PaymentMethod): string => {
            if (method.type === PaymentMethodType.CARD) {
                // Parse details (would be JSON in a real implementation)
                const details = typeof method.details === 'string'
                    ? JSON.parse(method.details)
                    : method.details;

                return `${details.brand || 'Card'} •••• ${details.last4 || '****'}`;
            } else if (method.type === PaymentMethodType.PAYPAL) {
                const details = typeof method.details === 'string'
                    ? JSON.parse(method.details)
                    : method.details;

                return `PayPal: ${details.email || 'Connected Account'}`;
            }

            return 'Unknown Payment Method';
        };

        const formatPaymentMethodDetails = (method: PaymentMethod): string => {
            if (method.type === PaymentMethodType.CARD) {
                const details = typeof method.details === 'string'
                    ? JSON.parse(method.details)
                    : method.details;

                return `Expires ${details.exp_month || 'MM'}/${details.exp_year || 'YY'}`;
            } else if (method.type === PaymentMethodType.PAYPAL) {
                return 'PayPal Account';
            }

            return '';
        };

        const showAddPaymentMethodModal = () => {
            isModalOpen.value = true;
        };

        const closeModal = () => {
            isModalOpen.value = false;
            // Reset form
            Object.assign(newPaymentMethod, {
                type: 'card',
                cardNumber: '',
                expiryDate: '',
                cvv: '',
                cardholderName: '',
                paypalEmail: '',
                setAsDefault: false
            });
        };

        const addPaymentMethod = async () => {
            try {
                addingPaymentMethod.value = true;

                // In a real implementation, we would use a payment processor SDK
                // Here we're just mocking the data format

                if (newPaymentMethod.type === PaymentMethodType.CARD) {
                    if (!newPaymentMethod.cardNumber || !newPaymentMethod.expiryDate ||
                        !newPaymentMethod.cvv || !newPaymentMethod.cardholderName) {
                        showToast('Please fill in all card details', 'warning');
                        return;
                    }

                    // Format expiry date
                    const [expMonth, expYear] = newPaymentMethod.expiryDate.split('/');

                    // Mock token from payment processor
                    const mockToken = 'card_tok_' + Math.random().toString(36).substring(2, 10);

                    await PaymentMethodService.createPaymentMethod({
                        artist_id: userId.value,
                        type: PaymentMethodType.CARD,
                        provider_token: mockToken,
                        details: JSON.stringify({
                            brand: 'Visa', // Mock
                            last4: newPaymentMethod.cardNumber.slice(-4),
                            exp_month: expMonth,
                            exp_year: expYear
                        }),
                        is_default: newPaymentMethod.setAsDefault
                    });
                } else if (newPaymentMethod.type === PaymentMethodType.PAYPAL) {
                    if (!newPaymentMethod.paypalEmail) {
                        showToast('Please enter your PayPal email', 'warning');
                        return;
                    }

                    // Mock token from PayPal
                    const mockToken = 'pp_tok_' + Math.random().toString(36).substring(2, 10);

                    await PaymentMethodService.createPaymentMethod({
                        artist_id: userId.value,
                        type: PaymentMethodType.PAYPAL,
                        provider_token: mockToken,
                        details: JSON.stringify({
                            email: newPaymentMethod.paypalEmail
                        }),
                        is_default: newPaymentMethod.setAsDefault
                    });
                }

                // Refresh data
                await fetchPaymentMethods();

                // Close modal
                closeModal();

                showToast('Payment method added successfully', 'success');
            } catch (error) {
                showToast('Failed to add payment method', 'danger');
            } finally {
                addingPaymentMethod.value = false;
            }
        };

        const setDefaultPaymentMethod = async (paymentMethodId: string) => {
            try {
                await PaymentMethodService.setDefaultPaymentMethod(userId.value, paymentMethodId);

                // Update local data
                paymentMethods.value = paymentMethods.value.map(method => ({
                    ...method,
                    is_default: method.payment_method_id === paymentMethodId
                }));

                showToast('Default payment method updated', 'success');
            } catch (error) {
                showToast('Failed to update default payment method', 'danger');
            }
        };

        const confirmDeletePaymentMethod = async (paymentMethodId: string) => {
            const alert = await alertController.create({
                header: 'Delete Payment Method',
                message: 'Are you sure you want to delete this payment method?',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Delete',
                        role: 'destructive',
                        handler: () => {
                            deletePaymentMethod(paymentMethodId);
                        }
                    }
                ]
            });

            await alert.present();
        };

        const deletePaymentMethod = async (paymentMethodId: string) => {
            try {
                await PaymentMethodService.deletePaymentMethod(paymentMethodId);

                // Update local data
                paymentMethods.value = paymentMethods.value.filter(
                    method => method.payment_method_id !== paymentMethodId
                );

                showToast('Payment method deleted', 'success');
            } catch (error) {
                showToast('Failed to delete payment method', 'danger');
            }
        };

        const getTransactionStatusClass = (status: TransactionStatus): string => {
            switch (status) {
                case TransactionStatus.SUCCEEDED:
                    return 'status-success';
                case TransactionStatus.FAILED:
                    return 'status-error';
                case TransactionStatus.PENDING:
                case TransactionStatus.PROCESSING:
                default:
                    return 'status-pending';
            }
        };

        const getTransactionStatusIcon = (status: TransactionStatus) => {
            switch (status) {
                case TransactionStatus.SUCCEEDED:
                    return checkmarkCircle;
                case TransactionStatus.FAILED:
                    return closeCircle;
                case TransactionStatus.PENDING:
                case TransactionStatus.PROCESSING:
                default:
                    return timeOutline;
            }
        };

        const formatTransactionTitle = (transaction: Transaction): string => {
            if (transaction.submission) {
                return `Submission to "${transaction.submission.playlist?.name || 'Playlist'}"`;
            }
            return `Transaction #${transaction.transaction_id.substring(0, 8)}`;
        };

        const formatDate = (dateString: string): string => {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        const formatCurrency = (amount: number, currency: string): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency || 'USD'
            }).format(amount / 100); // Assuming amount is in cents
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
            paymentMethods,
            transactions,
            loading,
            loadingTransactions,
            isModalOpen,
            addingPaymentMethod,
            newPaymentMethod,
            cardIcon: cardOutline,
            addIcon: addOutline,
            checkmarkIcon: checkmarkOutline,
            trashIcon: trashOutline,
            closeIcon: closeOutline,
            arrowForwardIcon: arrowForward,
            getPaymentMethodIcon,
            formatPaymentMethodName,
            formatPaymentMethodDetails,
            showAddPaymentMethodModal,
            closeModal,
            addPaymentMethod,
            setDefaultPaymentMethod,
            confirmDeletePaymentMethod,
            getTransactionStatusClass,
            getTransactionStatusIcon,
            formatTransactionTitle,
            formatDate,
            formatCurrency
        };
    }
});
</script>

<style scoped>
.payment-methods-content {
    --background: #f8f9fa;
}

.payment-methods-container {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
}

.loading-container,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1rem;
}

.empty-icon {
    font-size: 4rem;
    color: var(--ion-color-medium);
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
}

.empty-state p {
    margin-bottom: 1.5rem;
    color: var(--ion-color-medium);
}

.payment-method-item {
    --padding-start: 0;
}

.payment-method-icon {
    width: 40px;
    height: 40px;
}

.add-payment-method-btn {
    margin: 1.5rem 0;
}

.payment-history-card {
    margin-top: 2rem;
}

.loading-transactions,
.empty-transactions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    text-align: center;
    color: var(--ion-color-medium);
}

.transaction-item {
    --padding-start: 0;
}

.transaction-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
}

.transaction-status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: white;
}

.status-success {
    background-color: var(--ion-color-success);
    color: white;
}

.status-error {
    background-color: var(--ion-color-danger);
    color: white;
}

.status-pending {
    background-color: var(--ion-color-warning);
    color: white;
}

.transaction-amount {
    font-weight: 600;
}

.view-all-transactions {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

/* Modal Styles */
.card-row {
    display: flex;
    gap: 1rem;
}

.expiry-item {
    flex: 2;
}

.cvv-item {
    flex: 1;
}

.submit-button {
    margin-top: 2rem;
}
</style>
