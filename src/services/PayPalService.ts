import apiClient from './api';
import { Capacitor } from '@capacitor/core';

interface PayPalPayment {
  id: string;
  intent: string;
  state: string;
  payer: {
    payment_method: string;
    status: string;
    payer_info: {
      email: string;
      first_name: string;
      last_name: string;
      payer_id: string;
    };
  };
  transactions: Array<{
    amount: {
      total: string;
      currency: string;
    };
    description: string;
    payee: {
      email: string;
    };
  }>;
  redirect_urls: {
    return_url: string;
    cancel_url: string;
  };
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  create_time: string;
}

interface PayPalPayout {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
    time_created: string;
    time_completed?: string;
  };
  items: Array<{
    payout_item_id: string;
    transaction_status: string;
    payout_item_fee: {
      currency: string;
      value: string;
    };
    payout_batch_id: string;
    sender_batch_id: string;
    links: Array<{
      href: string;
      rel: string;
      method: string;
    }>;
  }>;
}

export const PayPalService = {
  // OAuth Methods
  getAuthUrl: async (): Promise<{ url: string }> => {
    const isMobile = Capacitor.isNativePlatform();
    const mobileParam = isMobile ? '?mobile=true' : '';
    
    // Get the URL from the authenticated API endpoint (requires user to be logged in)
    const response = await apiClient.get('/auth/paypal/login-url');
    if (response.data && response.data.url) {
      return { url: response.data.url + mobileParam };
    }
    
    throw new Error('Failed to get PayPal authentication URL');
  },

  openAuthPopup: async (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const { url } = await PayPalService.getAuthUrl();
        
        // Add popup parameter to the URL
        const authUrl = new URL(url);
        authUrl.searchParams.set('popup', 'true');
        
        // Open popup window
        const popup = window.open(
          authUrl.toString(),
          'paypal-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes,status=1'
        );

        if (!popup) {
          reject(new Error('Popup was blocked. Please allow popups for this site.'));
          return;
        }        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          console.log('PayPal popup message received:', event.data);
          
          // Ensure the message is from our domain
          if (event.origin !== window.location.origin) {
            console.log('Message origin mismatch:', event.origin, 'vs', window.location.origin);
            return;
          }          if (event.data.type === 'PAYPAL_OAUTH_SUCCESS' && event.data.provider === 'paypal') {
            console.log('PayPal OAuth success detected');
            window.removeEventListener('message', messageListener);
            clearInterval(checkClosed);
            popup.close();
            resolve(true);
          } else if (event.data.type === 'PAYPAL_OAUTH_ERROR' && event.data.provider === 'paypal') {
            console.log('PayPal OAuth error detected:', event.data.error);
            window.removeEventListener('message', messageListener);
            clearInterval(checkClosed);
            popup.close();
            reject(new Error(event.data.error || 'PayPal authentication failed'));
          }
        };

        window.addEventListener('message', messageListener);

        // Handle popup being closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            reject(new Error('Authentication was cancelled'));
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  },

  getUserPayPalEmail: async (): Promise<{ email: string }> => {
    const response = await apiClient.get('/auth/paypal/user-email');
    return response.data;
  },

  // Payment Processing Methods
  createPayment: async (
    amount: number,
    currency: string = 'USD',
    description: string,
    returnUrl: string,
    cancelUrl: string
  ): Promise<PayPalPayment> => {
    const response = await apiClient.post('/auth/paypal/create-payment', {
      amount,
      currency,
      description,
      returnUrl,
      cancelUrl
    });
    return response.data;
  },

  executePayment: async (paymentId: string, payerId: string): Promise<PayPalPayment> => {
    const response = await apiClient.post('/auth/paypal/execute-payment', {
      paymentId,
      payerId
    });
    return response.data;
  },

  getPayment: async (paymentId: string): Promise<PayPalPayment> => {
    const response = await apiClient.get(`/auth/paypal/payment/${paymentId}`);
    return response.data;
  },

  createPayout: async (
    recipientEmail: string,
    amount: number,
    currency: string = 'USD',
    note: string
  ): Promise<PayPalPayout> => {
    const response = await apiClient.post('/auth/paypal/create-payout', {
      recipientEmail,
      amount,
      currency,
      note
    });
    return response.data;
  },

  // High-level payment flow methods
  initiatePlaylistSubmissionPayment: async (
    playlistId: string,
    amount: number,
    description: string
  ): Promise<{ approvalUrl: string; paymentId: string }> => {
    const baseUrl = window.location.origin;
    const returnUrl = `${baseUrl}/payment/success?playlist=${playlistId}`;
    const cancelUrl = `${baseUrl}/payment/cancel?playlist=${playlistId}`;

    const payment = await PayPalService.createPayment(
      amount,
      'USD',
      description,
      returnUrl,
      cancelUrl
    );

    // Find the approval URL from the links
    const approvalLink = payment.links.find(link => link.rel === 'approval_url');
    if (!approvalLink) {
      throw new Error('PayPal approval URL not found');
    }

    return {
      approvalUrl: approvalLink.href,
      paymentId: payment.id
    };
  },

  completePlaylistSubmissionPayment: async (
    paymentId: string,
    payerId: string
  ): Promise<PayPalPayment> => {
    return await PayPalService.executePayment(paymentId, payerId);
  },

  initiateWithdrawalPayout: async (
    amount: number,
    note: string = 'Enterlist balance withdrawal'
  ): Promise<PayPalPayout> => {
    // Get user's PayPal email
    const { email } = await PayPalService.getUserPayPalEmail();
    
    return await PayPalService.createPayout(
      email,
      amount,
      'USD',
      note
    );
  },
  // Payment method token creation (for saved payment methods)
  createPaymentMethodToken: async (paymentMethodData: any): Promise<any> => {
    const response = await apiClient.post('/auth/paypal/create-payment-method-token', {
      ...paymentMethodData
    });
    return response.data;
  },

  // Utility methods
  formatAmount: (amountInCents: number): string => {
    return (amountInCents / 100).toFixed(2);
  },

  parseAmount: (amountString: string): number => {
    return Math.round(parseFloat(amountString) * 100);
  },

  // Payment status checking
  isPaymentCompleted: (payment: PayPalPayment): boolean => {
    return payment.state === 'approved';
  },

  isPaymentPending: (payment: PayPalPayment): boolean => {
    return payment.state === 'created';
  },

  isPaymentFailed: (payment: PayPalPayment): boolean => {
    return payment.state === 'failed' || payment.state === 'canceled';
  },

  // Error handling
  getPaymentErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred with PayPal payment processing';
  }
};

export default PayPalService;
