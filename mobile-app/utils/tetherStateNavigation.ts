/**
 * Tether State Navigation Utility
 * 
 * Centralizes logic for determining which screen to show based on tether state
 */

export interface TetherStateInfo {
  questionId: string;
  categoryName: string;
  question: string;
  userAnswer?: string;
  partnerAnswer?: string;
  expiresAt?: Date | string;
  state: string;
  hasUserAnswered: boolean;
  hasPartnerAnswered: boolean;
  isExpired: boolean;
}

export type TetherScreenRoute = 
  | { screen: 'category-question'; params: Record<string, any> }
  | { screen: 'waiting-for-partner-answer'; params: Record<string, any> }
  | { screen: 'waiting-partner'; params: Record<string, any> }
  | { screen: 'tether-history'; params: Record<string, any> }
  | { screen: 'question-expired'; params: Record<string, any> }
  | { screen: 'both-expired'; params: Record<string, any> };

/**
 * Determine which screen to navigate to based on tether state
 */
export function getTetherScreenRoute(tether: TetherStateInfo): TetherScreenRoute {
  const { state, hasUserAnswered, hasPartnerAnswered, isExpired } = tether;

  // Case: Both expired (neither answered in time)
  if (state === 'UNANSWERED_EXPIRED' || state === 'BOTH_EXPIRED') {
    return {
      screen: 'both-expired',
      params: {
        questionId: tether.questionId,
        categoryName: tether.categoryName,
        question: tether.question,
      },
    };
  }

  // Case: Question expired with only one answer
  if (isExpired && (hasUserAnswered || hasPartnerAnswered)) {
    return {
      screen: 'question-expired',
      params: {
        questionId: tether.questionId,
        categoryName: tether.categoryName,
        question: tether.question,
        userAnswer: tether.userAnswer,
        partnerAnswer: tether.partnerAnswer,
      },
    };
  }

  // Case: Both completed (show in history)
  if (state === 'COMPLETED' && hasUserAnswered && hasPartnerAnswered) {
    return {
      screen: 'tether-history',
      params: {},
    };
  }

  // Case: User answered, waiting for partner
  if (hasUserAnswered && !hasPartnerAnswered) {
    return {
      screen: 'waiting-for-partner-answer',
      params: {
        questionId: tether.questionId,
        categoryName: tether.categoryName,
        question: tether.question,
        userAnswer: tether.userAnswer || '',
        expiresAt: tether.expiresAt?.toString() || '',
      },
    };
  }

  // Case: Partner answered, user needs to answer (blurred partner answer)
  if (!hasUserAnswered && hasPartnerAnswered) {
    return {
      screen: 'waiting-partner',
      params: {
        questionId: tether.questionId,
        categoryName: tether.categoryName,
        question: tether.question,
        partnerAnswer: tether.partnerAnswer || '',
        expiresAt: tether.expiresAt?.toString() || '',
      },
    };
  }

  // Default: Neither answered yet (normal question screen)
  return {
    screen: 'category-question',
    params: {
      questionId: tether.questionId,
      categoryName: tether.categoryName,
    },
  };
}

/**
 * Get user-friendly state description
 */
export function getTetherStateDescription(state: string): string {
  switch (state) {
    case 'SERVED':
      return 'Active';
    case 'WAITING_FOR_PARTNER':
      return 'Waiting for Partner';
    case 'COMPLETED':
      return 'Completed';
    case 'UNANSWERED_EXPIRED':
    case 'BOTH_EXPIRED':
      return 'Expired';
    default:
      return state;
  }
}

/**
 * Check if tether is expired based on expiry timestamp
 */
export function isTetherExpired(expiresAt?: Date | string): boolean {
  if (!expiresAt) return false;
  
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}
