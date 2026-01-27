import axios from 'axios';
import { authService } from './auth';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3000';

const getAuthHeader = () => {
  const token = authService.getToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  platform: string;
  subscribed: boolean;
  subscriptionState: 'free' | 'premium' | 'trial' | 'lifetime';
  entitlement?: {
    tier: string;
    trialEnd?: string;
    premiumEnd?: string;
    refreshesDefault: number;
    refreshesPermanent: number;
  };
  coupleId?: string;
  partnerId?: string;
  activePurchases: number;
  createdAt: string;
}

class UserService {
  async getAll(params?: {
    tier?: string;
    subscribed?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: User[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.tier) queryParams.append('tier', params.tier);
    if (params?.subscribed !== undefined)
      queryParams.append('subscribed', params.subscribed.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(
      `${API_URL}/api/admin/users?${queryParams.toString()}`,
      getAuthHeader()
    );
    return response.data;
  }

  async getById(userId: string): Promise<any> {
    const response = await axios.get(
      `${API_URL}/api/admin/users/${userId}`,
      getAuthHeader()
    );
    return response.data;
  }

  async grantPremium(
    userId: string,
    durationDays?: number,
    isLifetime?: boolean
  ): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/users/${userId}/grant-premium`,
      { durationDays, isLifetime },
      getAuthHeader()
    );
    return response.data;
  }

  async revokePremium(userId: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/users/${userId}/revoke-premium`,
      {},
      getAuthHeader()
    );
    return response.data;
  }

  async addRefreshBundle(userId: string, amount: number): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/users/${userId}/refresh-bundle`,
      { amount },
      getAuthHeader()
    );
    return response.data;
  }
}

export const userService = new UserService();

