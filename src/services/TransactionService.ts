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
  }
};
