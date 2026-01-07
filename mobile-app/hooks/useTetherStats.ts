import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTetherStats } from '@/services/tether_service';

const LAST_VIEWED_TETHER_KEY = '@tether_last_viewed_count';

export interface TetherChatState {
  count: number;
  isActive: boolean; // true when there's unseen activity
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage tether completion count and chat icon state
 * 
 * According to developer guide:
 * - Count represents total completed tethers (lifetime, never decreases)
 * - Chat icon is "active" (orange) when there's unseen activity
 * - Returns to normal (white) after user views tether history
 */
export function useTetherStats() {
  const [state, setState] = useState<TetherChatState>({
    count: 0,
    isActive: false,
    loading: true,
    error: null,
  });

  const [lastViewedCount, setLastViewedCount] = useState<number>(0);

  // Load last viewed count from storage
  useEffect(() => {
    const loadLastViewedCount = async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_VIEWED_TETHER_KEY);
        if (stored) {
          setLastViewedCount(parseInt(stored, 10));
        }
      } catch (error) {
        console.error('Error loading last viewed count:', error);
      }
    };
    loadLastViewedCount();
  }, []);

  // Fetch tether stats
  const fetchStats = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const stats = await getTetherStats();
      console.log('📊 Fetched tether stats:', stats);
      
      const totalCompleted = stats.totalAnswered || 0;
      
      // Chat icon is active if there are new completions since last view
      const hasNewActivity = totalCompleted > lastViewedCount;
      
      console.log('🔔 Chat icon state:', {
        totalCompleted,
        lastViewedCount,
        hasNewActivity,
      });
      
      setState({
        count: totalCompleted,
        isActive: hasNewActivity,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error fetching tether stats:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load tether stats',
      }));
    }
  }, [lastViewedCount]);

  // Mark tethers as viewed (call this when user opens tether history)
  const markAsViewed = useCallback(async () => {
    try {
      await AsyncStorage.setItem(LAST_VIEWED_TETHER_KEY, state.count.toString());
      setLastViewedCount(state.count);
      setState(prev => ({ ...prev, isActive: false }));
    } catch (error) {
      console.error('Error marking tethers as viewed:', error);
    }
  }, [state.count]);

  // Refresh stats
  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    markAsViewed,
    refresh,
  };
}
