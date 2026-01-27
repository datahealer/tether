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

class UnlockService {
  async processExpiries(): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/admin/unlocks/process-expiries`,
      {},
      getAuthHeader()
    );
    return response.data;
  }

  async getExpiringUnlocks(days: number = 7): Promise<any> {
    const response = await axios.get(
      `${API_URL}/api/admin/unlocks/expired?days=${days}`,
      getAuthHeader()
    );
    return response.data;
  }
}

export const unlockService = new UnlockService();

