/**
 * Category Service - Migrated to use Tether API
 * Now uses /api/tethers/categories/* endpoints
 * Kept for backward compatibility, but use tether_service.ts for new features
 */
import { getCategoryProgress as getTetherCategoryProgress } from './tether_service';
import type { CategoryProgress } from './tether_service';

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
 * @deprecated Use getCategoryProgress from tether_service.ts instead
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await getTetherCategoryProgress();
    
    // Map new API response to legacy Category format
    return response.categories.map((cat: CategoryProgress) => ({
      id: cat.categoryId,
      title: cat.categoryName,
      description: `Explore ${cat.categoryName.toLowerCase()} together`,
      questionsAnswered: cat.answeredCount,
      totalQuestions: cat.totalQuestions,
      gradient: [cat.colorCode, cat.colorCode], // Use category color
      isLocked: !cat.isUnlocked,
      unlockRequirement: cat.canUnlock ? undefined : {
        categoryId: cat.categoryId,
        requiredAnswers: 0,
      },
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get user progress for a specific category
 * @deprecated Use getCategoryProgress from tether_service.ts instead
 */
export const getCategoryProgress = async (categoryId: string): Promise<{
  questionsAnswered: number;
  totalQuestions: number;
  percentage: number;
}> => {
  try {
    const response = await getTetherCategoryProgress();
    
    // Find the specific category
    const category = response.categories.find((cat: CategoryProgress) => cat.categoryId === categoryId);
    
    if (!category) {
      throw new Error(`Category ${categoryId} not found`);
    }

    return {
      questionsAnswered: category.answeredCount,
      totalQuestions: category.totalQuestions,
      percentage: category.progress,
    };
  } catch (error) {
    console.error('Error fetching category progress:', error);
    throw error;
  }
};

/**
 * Check if category is unlocked for user
 * @deprecated Use getCategoryProgress from tether_service.ts instead
 */
export const checkCategoryUnlock = async (categoryId: string): Promise<boolean> => {
  try {
    const response = await getTetherCategoryProgress();
    
    // Find the specific category
    const category = response.categories.find((cat: CategoryProgress) => cat.categoryId === categoryId);
    
    if (!category) {
      throw new Error(`Category ${categoryId} not found`);
    }

    return category.isUnlocked;
  } catch (error) {
    console.error('Error checking unlock status:', error);
    throw error;
  }
};