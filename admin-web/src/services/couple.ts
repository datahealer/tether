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

export interface Couple {
  _id: string;
  user1Id: any;
  user2Id: any;
  status: 'active' | 'paused' | 'ended';
  createdAt: string;
}

class CoupleService {
  async getAll(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ couples: Couple[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await axios.get(
      `${API_URL}/api/admin/couples?${queryParams.toString()}`,
      getAuthHeader()
    );
    return response.data;
  }

  async unlinkPartners(coupleId: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/couples/${coupleId}/unlink`,
      {},
      getAuthHeader()
    );
    return response.data;
  }

  async linkPartners(userId: string, partnerEmail: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/couples/users/${userId}/link-partner`,
      { partnerEmail },
      getAuthHeader()
    );
    return response.data;
  }
}

export const coupleService = new CoupleService();

