<template>
    <ion-page>
        <ion-content :fullscreen="true" class="payment-success-content">
            <div class="payment-container">
                <div v-if="loading" class="loading-state">
                    <ion-spinner name="crescent" class="spinner"></ion-spinner>
                    <h2>Processing Payment</h2>
                    <p>Please wait while we confirm your payment...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <ion-icon :icon="alertCircleIcon" class="error-icon"></ion-icon>
                    <h2>Payment Failed</h2>
                    <p>{{ errorMessage }}</p>
                    <div class="error-actions">
                        <ion-button @click="retryPayment" fill="outline">
                            Try Again
                        </ion-button>
                        <ion-button router-link="/artist/submissions/new">
                            Back to Submission
                        </ion-button>
                    </div>
                </div>

                <div v-else class="success-state">
                    <ion-icon :icon="checkmarkCircleIcon" class="success-icon"></ion-icon>
                    <h2>Payment Successful!</h2>
                    <p>Your song submission has been successfully processed and sent for review.</p>

                    <div v-if="submissionDetails" class="submission-details">
                        <ion-card>
                            <ion-card-header>
                                <ion-card-title>Submission Details</ion-card-title>
                            </ion-card-header>
                            <ion-card-content>
                                <div class="detail-row">
                                    <span class="label">Song:</span>
                                    <span class="value">{{ submissionDetails.songTitle }}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Playlist:</span>
                                    <span class="value">{{ submissionDetails.playlistName }}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Amount Paid:</span>
                                    <span class="value">${{ submissionDetails.amount }}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Transaction ID:</span>
                                    <span class="value">{{ submissionDetails.transactionId.substring(0, 16) }}...</span>
                                </div>
                            </ion-card-content>
                        </ion-card>
                    </div>                    <div class="success-actions">
                        <ion-button @click="viewSubmission" expand="block">
                            View Submission
                        </ion-button>
                        <ion-button router-link="/artist/dashboard" fill="outline" expand="block">
                            Back to Dashboard
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, toastController } from '@ionic/vue';
import { alertCircle, checkmarkCircle } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TransactionService } from '@/services/TransactionService';
import { SubmissionService } from '@/services/SubmissionService';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const submissionDetails = ref<{
    songTitle: string;
    playlistName: string;
    amount: string;
    transactionId: string;
    submissionId: string;
} | null>(null);

onMounted(async () => {
    try {
        // Check if this is a free submission
        const isFreeSubmission = route.query.freeSubmission === 'true';
        const submissionId = route.query.submissionId as string;

        if (isFreeSubmission && submissionId) {
            // Handle free submission
            const submissionResult = await SubmissionService.getSubmission(submissionId);
            submissionDetails.value = {
                songTitle: submissionResult.song?.title || 'Unknown Song',
                playlistName: submissionResult.playlist?.name || 'Unknown Playlist',
                amount: '0.00',
                transactionId: submissionResult.transaction?.transaction_id || 'FREE_SUBMISSION',
                submissionId: submissionId
            };

            // Clear stored submission data
            sessionStorage.removeItem('enterlist_submission_data');

            // Show success toast
            const toast = await toastController.create({
                message: 'Submission successful! Your song has been sent for review.',
                duration: 3000,
                color: 'success',
                position: 'top'
            });
            await toast.present();
        } else {
            // Check for standard web PayPal parameters
            const paymentId = route.query.paymentId as string;
            const payerId = route.query.PayerID as string;

            if (paymentId && payerId) {
                // Handle web PayPal payment execution
                const submissionDataStr = sessionStorage.getItem('enterlist_submission_data');
                if (!submissionDataStr) {
                    throw new Error('Submission data not found. Please try submitting again.');
                }

                const submissionData = JSON.parse(submissionDataStr);
                
                // Execute PayPal payment
                const result = await TransactionService.executePayPalPayment(paymentId, payerId);

                if (result.status === 'succeeded') {
                    const submissionResult = await SubmissionService.getSubmission(submissionData.submissionId);
                    submissionDetails.value = {
                        songTitle: submissionResult.song?.title || 'Unknown Song',
                        playlistName: submissionResult.playlist?.name || 'Unknown Playlist',
                        amount: ((result.amount_total || 0)).toString(),
                        transactionId: result.transaction_id,
                        submissionId: submissionData.submissionId
                    };

                    // Clear stored submission data
                    sessionStorage.removeItem('enterlist_submission_data');

                    // Show success toast
                    const toast = await toastController.create({
                        message: 'Payment successful! Your submission has been sent for review.',
                        duration: 3000,
                        color: 'success',
                        position: 'top'
                    });
                    await toast.present();
                } else {
                    throw new Error('Payment execution failed');
                }            } else {
                // Handle mobile payment success (no PayPal parameters)
                // This means PayPal redirected back to the app successfully
                const submissionDataStr = sessionStorage.getItem('enterlist_submission_data');
                if (!submissionDataStr) {
                    throw new Error('Submission data not found. Please try submitting again.');
                }

                const submissionData = JSON.parse(submissionDataStr);
                
                // Complete the mobile PayPal payment on the backend
                const completionResult = await TransactionService.completeMobilePayPalPayment(submissionData.submissionId);
                
                if (completionResult.success) {
                    // Get the updated submission details
                    const submissionResult = await SubmissionService.getSubmission(submissionData.submissionId);
                    
                    submissionDetails.value = {
                        songTitle: submissionResult.song?.title || 'Unknown Song',
                        playlistName: submissionResult.playlist?.name || 'Unknown Playlist',
                        amount: ((completionResult.transaction.amount_total || 0)).toString(),
                        transactionId: completionResult.transaction.transaction_id,
                        submissionId: submissionData.submissionId
                    };

                    // Clear stored submission data
                    sessionStorage.removeItem('enterlist_submission_data');

                    // Show success toast
                    const toast = await toastController.create({
                        message: 'Payment successful! Your submission has been sent for review.',
                        duration: 3000,
                        color: 'success',
                        position: 'top'
                    });
                    await toast.present();
                } else {
                    throw new Error('Mobile payment completion failed');
                }
            }
        }
    } catch (err) {
        console.error('Payment processing error:', err);
        error.value = true;
        errorMessage.value = err instanceof Error ? err.message : 'Payment processing failed';
    } finally {
        loading.value = false;
    }
});

const retryPayment = () => {
    // Clear any stored data and redirect back to submission page
    sessionStorage.removeItem('enterlist_submission_data');
    router.push('/artist/submissions/new');
};

const viewSubmission = () => {
    if (submissionDetails.value?.submissionId) {
        router.push(`/artist/submissions/${submissionDetails.value.submissionId}`);
    } else {
        router.push('/artist/submissions');
    }
};

const alertCircleIcon = alertCircle;
const checkmarkCircleIcon = checkmarkCircle;
</script>

<style scoped>
.payment-success-content {
    --background: #f8f9fa;
}

.payment-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
}

.loading-state,
.error-state,
.success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 500px;
    text-align: center;
}

.spinner {
    width: 60px;
    height: 60px;
    margin-bottom: 2rem;
}

.error-icon,
.success-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
}

.error-icon {
    color: var(--ion-color-danger);
}

.success-icon {
    color: var(--ion-color-success);
    animation: pulse 2s 1 ease-in-out;
}

@keyframes pulse {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    25% {
        transform: scale(1.1);
        opacity: 1;
    }

    50% {
        transform: scale(0.95);
    }

    75% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

h2 {
    margin: 0 0 1rem 0;
    color: var(--ion-color-dark);
}

p {
    color: var(--ion-color-medium);
    margin-bottom: 2rem;
    line-height: 1.5;
}

.submission-details {
    width: 100%;
    margin: 2rem 0;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--ion-color-light);
}

.detail-row:last-child {
    border-bottom: none;
}

.label {
    font-weight: 600;
    color: var(--ion-color-dark);
}

.value {
    color: var(--ion-color-medium);
    text-align: right;
}

.success-actions,
.error-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.error-actions {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
}

@media (max-width: 768px) {
    .payment-container {
        padding: 1rem;
    }

    .error-actions {
        flex-direction: column;
    }
}
</style>
