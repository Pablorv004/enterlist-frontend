import apiClient from './api';
import { PaymentMethod, PaymentMethodType } from '@/types';
import { handleEmptyResponse } from '@/utils/apiHelpers';

export const PaymentMethodService = {  getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
    try {
      const response = await apiClient.get(`/payment-methods/user/${userId}`);
      return response.data.data || [];
    } catch (error) {
      return handleEmptyResponse(error, []);
    }
  },

  getPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    try {
      const response = await apiClient.get(`/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      return handleEmptyResponse(error, null);
    }
  },

  createPaymentMethod: async (paymentMethodData: {
    user_id: string;
    type: PaymentMethodType;
    provider_token: string;
    details: string;
    is_default?: boolean;
  }): Promise<PaymentMethod> => {
    const response = await apiClient.post('/payment-methods', paymentMethodData);
    return response.data;
  },

  updatePaymentMethod: async (
    id: string,
    paymentMethodData: {
      provider_token?: string;
      details?: string;
      is_default?: boolean;
    }
  ): Promise<PaymentMethod> => {
    const response = await apiClient.put(`/payment-methods/${id}`, paymentMethodData);
    return response.data;
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await apiClient.delete(`/payment-methods/${id}`);
  },
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.put(`/payment-methods/${id}`, { is_default: true });
    return response.data;
  }
};
