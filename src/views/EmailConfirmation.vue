<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Email Confirmation Required</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="confirmation-container">
        <!-- Main Unconfirmed State -->
        <div class="confirmation-content">
          <div class="warning-icon">
            <ion-icon :icon="mailOutline" color="warning" size="large"></ion-icon>
          </div>
          <h1>Check Your Email</h1>
          <p>
            We've sent a confirmation link to your email address. 
            Please click the link in your email to verify your account and access all features.
          </p>
          <p>
            <strong>Didn't receive the email?</strong> Check your spam folder or click below to send a new one.
          </p>
          
          <div class="action-buttons">
            <ion-button 
              expand="block" 
              @click="resendConfirmation"
              :disabled="resendLoading"
            >
              <ion-spinner v-if="resendLoading" name="crescent" slot="start"></ion-spinner>
              {{ resendLoading ? 'Sending...' : 'Resend Confirmation Email' }}
            </ion-button>
            
            <ion-button 
              expand="block" 
              fill="outline" 
              @click="logout"
            >
              Use Different Email
            </ion-button>
          </div>
          
          <div v-if="resendMessage" class="resend-message">
            <ion-text :color="resendSuccess ? 'success' : 'danger'">
              {{ resendMessage }}
            </ion-text>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  toastController,
} from '@ionic/vue';
import { mailOutline } from 'ionicons/icons';
import { AuthService } from '@/services/AuthService';
import { useAuthStore } from '@/store';

const router = useRouter();
const authStore = useAuthStore();

const resendLoading = ref(false);
const resendMessage = ref('');
const resendSuccess = ref(false);

// Get current user's email from the store
const userEmail = computed(() => authStore.user?.email || '');

const resendConfirmation = async () => {
  if (!userEmail.value) {
    resendMessage.value = 'No email address found. Please log in again.';
    resendSuccess.value = false;
    return;
  }
  
  resendLoading.value = true;
  resendMessage.value = '';
  
  try {
    await AuthService.resendEmailConfirmation(userEmail.value);
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
    
  } catch (error: any) {
    resendSuccess.value = false;
    resendMessage.value = error.response?.data?.message || 'Failed to send confirmation email';
  } finally {
    resendLoading.value = false;
  }
};

const logout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even if logout fails
    router.push('/login');
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

.warning-icon {
  margin-bottom: 1rem;
}

.confirmation-content h1 {
  margin: 1rem 0;
  color: var(--ion-color-dark);
  font-size: 1.8rem;
}

.confirmation-content p {
  margin-bottom: 1.5rem;
  color: var(--ion-color-medium);
  line-height: 1.5;
}

.action-buttons {
  margin-top: 2rem;
}

.action-buttons ion-button {
  margin-bottom: 1rem;
}

.resend-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  background: var(--ion-color-light);
}

ion-spinner {
  margin-right: 0.5rem;
}
</style>
