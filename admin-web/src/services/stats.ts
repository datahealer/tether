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

class StatsService {
  async getBasicStats(): Promise<any> {
    const response = await axios.get(
      `${API_URL}/api/admin/stats`,
      getAuthHeader()
    );
    return response.data;
  }
}

export const statsService = new StatsService();

