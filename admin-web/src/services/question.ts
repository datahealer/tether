import axios from 'axios';
import { authService } from './auth';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3000';

export interface Question {
  isPremium(isPremium: any): unknown;
  _id: string;
  questionId: string;
  question: string; // Changed from 'text'
  categoryId: string;
  genderFocus: string;
  tone: string; // Changed from string[] to string
  difficulty: number; // Added
  relationshipStage: string[];
  livingType: string[];
  goalTag: string[]; // Changed from 'goals'
  emotionalNeed: string[]; // Changed from 'emotionalNeeds'
  formatType?: string;
  contextTag?: string;
  status: 'Draft' | 'Published'; // Changed from isPremium
  writerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const getAuthHeader = () => {
  const token = authService.getToken();
  console.log('🔑 [Questions Service] Getting auth token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

class QuestionsService {
  async getAll(limit: number = 1000): Promise<Question[]> {
    const response = await axios.get(`${API_URL}/api/admin/questions?limit=${limit}`, getAuthHeader());
    return response.data.questions || response.data;
  }

  async getById(id: string): Promise<Question> {
    const response = await axios.get(`${API_URL}/api/admin/questions/${id}`, getAuthHeader());
    return response.data;
  }

  async create(question: Partial<Question>): Promise<Question> {
    const response = await axios.post(`${API_URL}/api/admin/questions`, question, getAuthHeader());
    return response.data.question || response.data;
  }

  async update(id: string, question: Partial<Question>): Promise<Question> {
    const response = await axios.put(`${API_URL}/api/admin/questions/${id}`, question, getAuthHeader());
    return response.data.question || response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/admin/questions/${id}`, getAuthHeader());
  }

  async getStats(): Promise<any> {
    const response = await axios.get(`${API_URL}/api/admin/questions/stats`, getAuthHeader());
    return response.data;
  }
}

export const questionsService = new QuestionsService();
