import axios from 'axios';
import { authService } from './auth';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3000';

export interface Category {
  _id: string;
  categoryId: string;
  name: string;
  totalQuestions: number;
  colorCode: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const getAuthHeader = () => {
  const token = authService.getToken();
  console.log('🔑 [Category Service] Getting auth token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

class CategoriesService {
  async getAll(): Promise<Category[]> {
    const response = await axios.get(`${API_URL}/api/admin/categories`, getAuthHeader());
    return response.data.categories || [];
  }

  async getById(id: string): Promise<Category> {
    const response = await axios.get(`${API_URL}/api/admin/categories/${id}`, getAuthHeader());
    return response.data;
  }

  async create(category: Partial<Category>): Promise<Category> {
    const response = await axios.post(`${API_URL}/api/admin/categories`, category, getAuthHeader());
    return response.data;
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const response = await axios.put(`${API_URL}/api/admin/categories/${id}`, category, getAuthHeader());
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/admin/categories/${id}`, getAuthHeader());
  }
}

export const categoriesService = new CategoriesService();