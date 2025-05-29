<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Email Confirmation</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="confirmation-container">
        <!-- Loading State -->
        <div v-if="confirmationState === 'loading'" class="confirmation-content">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <h2>Confirming your email...</h2>
          <p>Please wait while we verify your email address.</p>
        </div>
        
        <!-- Success State -->
        <div v-else-if="confirmationState === 'success'" class="confirmation-content">
          <div class="success-icon">
            <ion-icon :icon="checkmarkCircleOutline" color="success" size="large"></ion-icon>
          </div>
          <h2>Email Confirmed!</h2>
          <p>Your email has been successfully confirmed. You can now access all features of your account.</p>
          <ion-button expand="block" @click="redirectToDashboard">
            Continue to Dashboard
          </ion-button>
        </div>
        
        <!-- Error State -->
        <div v-else-if="confirmationState === 'error'" class="confirmation-content">
          <div class="error-icon">
            <ion-icon :icon="closeCircleOutline" color="danger" size="large"></ion-icon>
          </div>
          <h2>Confirmation Failed</h2>
          <p>{{ errorMessage }}</p>
          
          <div v-if="!showResendForm" class="action-buttons">
            <ion-button expand="block" @click="showResendForm = true">
              Request New Confirmation Email
            </ion-button>
            <ion-button expand="block" fill="outline" @click="goToLogin">
              Back to Login
            </ion-button>
          </div>
          
          <!-- Resend Form -->
          <div v-if="showResendForm" class="resend-form">
            <h3>Request New Confirmation Email</h3>
            <ion-item>
              <ion-label position="stacked">Email Address</ion-label>
              <ion-input 
                v-model="resendEmail" 
                type="email" 
                placeholder="Enter your email address"
              />
            </ion-item>
            
            <div class="resend-buttons">
              <ion-button 
                expand="block" 
                @click="resendConfirmation"
                :disabled="resendLoading || !resendEmail"
              >
                <ion-spinner v-if="resendLoading" name="crescent" slot="start"></ion-spinner>
                {{ resendLoading ? 'Sending...' : 'Send Confirmation Email' }}
              </ion-button>
              
              <ion-button 
                expand="block" 
                fill="outline" 
                @click="showResendForm = false"
              >
                Cancel
              </ion-button>
            </div>
            
            <div v-if="resendMessage" class="resend-message">
              <ion-text :color="resendSuccess ? 'success' : 'danger'">
                {{ resendMessage }}
              </ion-text>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  toastController,
} from '@ionic/vue';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '@/services/AuthService';

const route = useRoute();
const router = useRouter();

const confirmationState = ref<'loading' | 'success' | 'error'>('loading');
const errorMessage = ref('');
const showResendForm = ref(false);
const resendEmail = ref('');
const resendLoading = ref(false);
const resendMessage = ref('');
const resendSuccess = ref(false);

onMounted(async () => {
  const token = route.query.token as string;
  
  if (!token) {
    confirmationState.value = 'error';
    errorMessage.value = 'No confirmation token provided';
    return;
  }
  
  try {
    await AuthService.confirmEmail(token);
    confirmationState.value = 'success';
    
    // Show success toast
    const toast = await toastController.create({
      message: 'Email confirmed successfully!',
      duration: 3000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
    
  } catch (error: any) {
    confirmationState.value = 'error';
    errorMessage.value = error.response?.data?.message || 'Email confirmation failed';
  }
});

const redirectToDashboard = () => {
  router.push('/dashboard');
};

const goToLogin = () => {
  router.push('/login');
};

const resendConfirmation = async () => {
  if (!resendEmail.value) return;
  
  resendLoading.value = true;
  resendMessage.value = '';
  
  try {
    // Note: The new email API uses JWT token to get user info, 
    // but we still allow manual email entry for error cases
    await AuthService.resendEmailConfirmation();
    resendSuccess.value = true;
    resendMessage.value = 'Confirmation email sent successfully! Please check your inbox.';
    
    // Show success toast
    const toast = await toastController.create({
      message: 'Confirmation email sent!',
      duration: 3000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
    
    // Hide form after success
    setTimeout(() => {
      showResendForm.value = false;
    }, 2000);
    
  } catch (error: any) {
    resendSuccess.value = false;
    resendMessage.value = error.response?.data?.message || 'Failed to send confirmation email';
  } finally {
    resendLoading.value = false;
  }
};
</script>

<style scoped>
.confirmation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.confirmation-content {
  max-width: 400px;
  width: 100%;
}

.success-icon,
.error-icon {
  margin-bottom: 1rem;
}

.confirmation-content h2 {
  margin: 1rem 0;
  color: var(--ion-color-dark);
}

.confirmation-content p {
  margin-bottom: 2rem;
  color: var(--ion-color-medium);
  line-height: 1.5;
}

.action-buttons {
  margin-top: 1rem;
}

.action-buttons ion-button {
  margin-bottom: 1rem;
}

.resend-form {
  margin-top: 2rem;
  max-width: 400px;
  width: 100%;
}

.resend-form h3 {
  margin-bottom: 1rem;
  color: var(--ion-color-dark);
}

.resend-buttons {
  margin-top: 1rem;
}

.resend-buttons ion-button {
  margin-bottom: 0.5rem;
}

.resend-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  background: var(--ion-color-light);
}

ion-spinner {
  margin-bottom: 1rem;
}
</style>
