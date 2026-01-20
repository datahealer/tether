import { useTetherStatsContext } from '@/context/tether_stats_context';

export interface TetherChatState {
  count: number;
  isActive: boolean; // true when there's unseen activity
  loading: boolean;
  error: string | null;
}

/**
 * Hook to access tether stats from global context
 * 
 * This hook now uses a global context that:
 * - Automatically polls every 30 seconds when app is active
 * - Refreshes when app comes to foreground
 * - Can be manually triggered after completing a tether
 * 
 * According to developer guide:
 * - Count represents total completed tethers (lifetime, never decreases)
 * - Chat icon is "active" (orange) when there's unseen activity
 * - Returns to normal (white) after user views tether history
 */
export function useTetherStats() {
  const { state, markAsViewed, refresh, triggerUpdate } = useTetherStatsContext();

  return {
    ...state,
    markAsViewed,
    refresh,
    triggerUpdate, // New: force immediate update after submitting answer
  };
}
