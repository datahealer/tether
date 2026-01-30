import { authenticatedFetch } from './auth_service';
import Constants from 'expo-constants';

/**
 * Tether Service - Integrates with backend Question Service Engine
 * Handles all tether-related API calls for the mobile app
 */

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// ==================== TYPES ====================

export interface TetherQuestion {
  questionId: string;
  question: string;
  categoryId: string;
  categoryName?: string;
  difficulty: number;
  tone: string;
  state?: string;
  servedAt?: string;
  expiresAt?: string;
  userAnswer?: string;
  partnerAnswer?: string;
  answeredAt?: string;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  colorCode: string;
  totalQuestions: number;
  answeredCount: number;
  skippedCount: number;
  isUnlocked: boolean;
  progress: number;
  canUnlock?: boolean;
  unlockCost?: number;
}

export interface TetherStats {
  totalAnswered: number;
  currentStreak: number;
  longestStreak: number;
  lastAnsweredDate?: string;
}

export interface RefreshInfo {
  cycleRefreshesRemaining: number; // FREE: 1, PREMIUM: 3 (resets daily)
  permanentRefreshBalance: number; // Never expires, purchased bundles
  maxCycleRefreshes: number; // User's tier max (1 or 3)
}

export interface MilestoneData {
  type: string;
  milestone: number;
  message: string;
  achievedAt: string;
}

export interface TetherHistory {
  questionId: string;
  question: string;
  categoryName: string;
  categoryId: string;
  userAnswer: string;
  partnerAnswer?: string;
  answeredAt: string;
  partnerAnsweredAt?: string;
  reactions?: Array<{
    userId: string;
    emoji: string;
    timestamp: string;
  }>;
}

// ==================== API CALLS ====================

/**
 * Get active tethers for the couple
 * Returns questions in SERVED or WAITING_FOR_PARTNER state + refresh availability
 */
export async function getActiveTethers(): Promise<{
  tethers: TetherQuestion[];
  stats: TetherStats;
  refreshes: RefreshInfo;
}> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/v2/active`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to fetch active tethers');
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching active tethers:', error);
    throw error;
  }
}

/**
 * Submit an answer to a tether
 */
// export async function submitAnswer(
//   questionId: string,
//   answer: string
// ): Promise<{
//   state: string;
//   partnerAnswer?: string;
//   milestones?: MilestoneData[];
//   notification?: string;
// }> {
//   try {
//     const response = await authenticatedFetch(`${API_URL}/api/tethers/v2/answer`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ questionId, answer }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('API Error:', response.status, errorText);
//       try {
//         const errorData = JSON.parse(errorText);
        
//         // Create error object with response data for special handling
//         const error: any = new Error(errorData.message || 'Failed to submit answer');
//         error.response = {
//           status: response.status,
//           data: errorData,
//         };
//         throw error;
//       } catch (parseError: any) {
//         // If we already threw above, re-throw it
//         if (parseError.response) throw parseError;
//         // Otherwise generic error
//         throw new Error(`Server error: ${response.status}`);
//       }
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error submitting answer:', error);
//     throw error;
//   }
// }
export async function submitAnswer(
  questionId: string,
  answer: string
): Promise<{
  state: string;
  partnerAnswer?: string;
  milestones?: MilestoneData[];
  notification?: string;
}> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/v2/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionId, answer }), // ✅ Uses questionId
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const errorData = JSON.parse(errorText);
        
        const error: any = new Error(errorData.message || 'Failed to submit answer');
        error.response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      } catch (parseError: any) {
        if (parseError.response) throw parseError;
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
}

/**
 * Skip/refresh a tether ("Draw Another" in UI)
 * Uses cycle refreshes first (FREE: 1, PREMIUM: 3), then permanent refresh balance
 */
// export async function skipTether(
//   questionId: string
// ): Promise<{
//   newQuestion?: TetherQuestion;
//   message: string;
//   cycleRefreshesRemaining: number;
//   permanentRefreshesRemaining: number;
//   usedPermanent: boolean;
// }> {
//   try {
//     const response = await authenticatedFetch(`${API_URL}/api/tethers/v2/refresh`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ questionId }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('API Error:', response.status, errorText);
//       try {
//         const errorData = JSON.parse(errorText);
        
//         // Create error object with response data for special handling
//         const error: any = new Error(errorData.message || 'Failed to skip tether');
//         error.response = {
//           status: response.status,
//           data: errorData,
//         };
//         throw error;
//       } catch (parseError: any) {
//         // If we already threw above, re-throw it
//         if (parseError.response) throw parseError;
//         // Otherwise generic error
//         throw new Error(`Server error: ${response.status}`);
//       }
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error skipping tether:', error);
//     throw error;
//   }
// }
 
export async function skipTether(
  questionId: string
): Promise<{
  newQuestion?: TetherQuestion;
  message: string;
  cycleRefreshesRemaining: number;
  permanentRefreshesRemaining: number;
  usedPermanent: boolean;
}> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/v2/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionId }), // ✅ Uses questionId
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const errorData = JSON.parse(errorText);
        
        const error: any = new Error(errorData.message || 'Failed to skip tether');
        error.response = {
          status: response.status,
          data: errorData,
        };
        throw error;
      } catch (parseError: any) {
        if (parseError.response) throw parseError;
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error skipping tether:', error);
    throw error;
  }
}

/**
 * Get category progress for the couple
 * Shows unlocked categories and available categories to unlock
 */
// In getCategoryProgress() function
export async function getCategoryProgress(): Promise<{
  progress: CategoryProgress[];
  categories: CategoryProgress[];
  unlockedCount: number;
  tier: string;
}> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/categories/progress`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to fetch category progress';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // fallback
      }

      // Special handling for "not in a couple"
      if (response.status === 404 && errorMessage.includes('Not in a couple')) {
        throw new Error('WAITING_FOR_PARTNER');
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching category progress:', error);
    
    // Re-throw custom error so UI can handle it
    if (error.message === 'WAITING_FOR_PARTNER') {
      throw error;
    }
    
    throw new Error(error.message || 'Failed to load category packs');
  }
}
/**
 * Unlock a new category
 * FREE tier: Can unlock 2 categories, PREMIUM: Can unlock all 10
 */
export async function unlockCategory(categoryId: string): Promise<{
  success: boolean;
  message: string;
  category: CategoryProgress;
}> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/categories/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to unlock category');
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error unlocking category:', error);
    throw error;
  }
}

/**
 * Get tether statistics (streak, total answered, etc.)
 */
export async function getTetherStats(): Promise<TetherStats> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/stats`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to fetch tether stats');
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('📥 Raw stats response:', data);
    
    // Backend returns { success: true, stats: { totalCompleted, currentStreak, ... } }
    return {
      totalAnswered: data.stats?.totalCompleted || 0,
      currentStreak: data.stats?.currentStreak || 0,
      longestStreak: data.stats?.longestStreak || 0,
      lastAnsweredDate: data.stats?.lastTetherDate,
    };
  } catch (error) {
    console.error('Error fetching tether stats:', error);
    throw error;
  }
}

/**
 * Get tether history (completed questions)
 */
export async function getTetherHistory(
  limit: number = 50,
  skip: number = 0
): Promise<{
  history: TetherHistory[];
  total: number;
}> {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/api/tethers/history?limit=${limit}&skip=${skip}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to fetch tether history');
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('📜 Tether history response:', data);
    
    // Backend returns { success: true, history: [...], total: N }
    return {
      history: data.history || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Error fetching tether history:', error);
    throw error;
  }
}

/**
 * Add emoji reaction to a completed tether
 */
export async function addReaction(
  questionId: string,
  emoji: string
): Promise<{
  success: boolean;
  reactions: Array<{
    userId: string;
    emoji: string;
    timestamp: string;
  }>;
}> {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/api/tethers/${questionId}/react`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to add reaction');
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();
    return {
      success: data.success,
      reactions: data.reactions || [],
    };
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
}

/**
 * Check if user can unlock more categories based on their tier
 */
export async function checkCategoryUnlockEligibility(): Promise<{
  canUnlock: boolean;
  unlockedCount: number;
  maxCategories: number;
  tier: string;
}> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/categories/unlock-eligibility`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to check unlock eligibility');
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking unlock eligibility:', error);
    throw error;
  }
}

/**
 * Manually trigger tether drop (for testing/admin purposes)
 * In production, this happens automatically via scheduled job
 */
export async function manualTetherDrop(): Promise<{
  success: boolean;
  message: string;
  tethersDropped: number;
}> {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/tethers/drop`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Failed to manually drop tethers');
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error manually dropping tethers:', error);
    throw error;
  }
}
