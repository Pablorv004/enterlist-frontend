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
    
    try {
      // First try to get the URL from the authenticated API endpoint (for linking existing accounts)
      const response = await apiClient.get('/auth/paypal/login-url');
      if (response.data && response.data.url) {
        return { url: response.data.url + mobileParam };
      }
    } catch (error) {
      console.warn('Failed to get PayPal auth URL from authenticated API, user may not be logged in. Using register-or-login endpoint', error);
      // If the authenticated endpoint fails (user not logged in), 
      // use register-or-login endpoint which doesn't require authentication
      return { url: `${apiClient.defaults.baseURL}/auth/paypal/register-or-login${mobileParam}` };
    }
      
    // Use register-or-login endpoint as fallback
    return { url: `${apiClient.defaults.baseURL}/auth/paypal/register-or-login${mobileParam}` };
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
  createPaymentMethodToken: async (email: string): Promise<{ token: string }> => {
    const response = await apiClient.post('/payment-methods/create-paypal-token', {
      email
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
    return payment.state === 'failed' || payment.state === 'cancelled';
  },

  // Error handling
  getPaymentErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }    if (error.message) {
      return error.message;
    }
    return 'An error occurred while processing the PayPal payment';
  }
};

export default PayPalService;
