import { authenticatedFetch } from './auth_service';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export interface Category {
  id: string;
  title: string;
  description: string;
  questionsAnswered: number;
  totalQuestions: number;
  gradient: string[];
  isLocked: boolean;
  unlockRequirement?: {
    categoryId: string;
    requiredAnswers: number;
  };
}

/**
 * Fetch all category packs for user
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get user progress for a specific category
 */
export const getCategoryProgress = async (categoryId: string): Promise<{
  questionsAnswered: number;
  totalQuestions: number;
  percentage: number;
}> => {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/api/categories/${categoryId}/progress`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch category progress');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching category progress:', error);
    throw error;
  }
};

/**
 * Check if category is unlocked for user
 */
export const checkCategoryUnlock = async (categoryId: string): Promise<boolean> => {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/api/categories/${categoryId}/unlock-status`
    );
    
    if (!response.ok) {
      throw new Error('Failed to check unlock status');
    }

    const data = await response.json();
    return data.isUnlocked;
  } catch (error) {
    console.error('Error checking unlock status:', error);
    throw error;
  }
};