import apiClient from './api';
import { Transaction, PaginatedResponse } from '@/types';

export const TransactionService = {
  getTransactions: async (skip = 0, take = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions?skip=${skip}&take=${take}`);
    return response.data;
  },

  getTransactionsByArtist: async (artistId: string, skip = 0, take = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions/artist/${artistId}?skip=${skip}&take=${take}`);
    return response.data;
  },

  getTransactionsByPlaylistOwner: async (ownerId: string, skip = 0, take = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions/playlist-owner/${ownerId}?skip=${skip}&take=${take}`);
    return response.data;
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (transactionData: {
    submission_id: string;
    payment_method_id: string;
    amount_total: number;
    currency: string;
  }): Promise<Transaction> => {
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  },

  updateTransactionStatus: async (
    id: string,
    status: string,
    payment_provider_transaction_id?: string
  ): Promise<Transaction> => {
    const response = await apiClient.put(`/transactions/${id}/status`, { 
      status, 
      payment_provider_transaction_id 
    });
    return response.data;
  },
  // Method to get transaction summary stats
  getTransactionStats: async (userId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<any> => {
    const response = await apiClient.get(`/transactions/stats/${userId}?period=${period}`);
    return response.data;
  },

  // Playlist maker specific methods
  getPlaylistMakerTransactions: async (skip = 0, take = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions/playlist-maker/transactions?skip=${skip}&take=${take}`);
    return response.data;
  },

  getPlaylistMakerBalance: async (): Promise<{ total: number; available: number; pending: number }> => {
    const response = await apiClient.get('/transactions/playlist-maker/balance');
    return {
      total: response.data.totalEarnings || 0,
      available: response.data.availableBalance || 0,
      pending: response.data.pendingEarnings || 0
    };
  },
  getEarningsStats: async (period?: 'week' | 'month' | 'year'): Promise<any> => {
    const params = period ? `?period=${period}` : '';
    const response = await apiClient.get(`/transactions/playlist-maker/earnings-stats${params}`);
    return response.data;
  },

  // Withdrawal methods
  withdrawFunds: async (amount: number): Promise<any> => {
    const response = await apiClient.post('/transactions/playlist-maker/withdraw', { amount });
    return response.data;
  },

  getWithdrawals: async (skip = 0, take = 10): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get(`/transactions/playlist-maker/withdrawals?skip=${skip}&take=${take}`);
    return response.data;
  },

  // Artist specific methods
  getArtistTransactions: async (skip = 0, take = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions/artist/transactions?skip=${skip}&take=${take}`);
    return response.data;
  },
  // PayPal payment methods
  createPayPalPayment: async (submissionId: string, paymentMethodId: string): Promise<{ paymentId: string; approvalUrl: string }> => {
    const response = await apiClient.post('/transactions/paypal/create-payment', {
      submissionId,
      paymentMethodId,
    });
    return response.data;
  },  
  
  executePayPalPayment: async (paymentId: string, payerId: string): Promise<Transaction> => {
    const response = await apiClient.post('/transactions/paypal/execute-payment', {
      paymentId,
      payerId,
    });
    return response.data;
  }
};
