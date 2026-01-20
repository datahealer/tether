import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTetherStats } from '@/services/tether_service';
import { AppState, AppStateStatus } from 'react-native';

const LAST_VIEWED_TETHER_KEY = '@tether_last_viewed_count';
const POLLING_INTERVAL = 30000; // 30 seconds - production-grade polling

export interface TetherChatState {
  count: number;
  isActive: boolean;
  loading: boolean;
  error: string | null;
}

interface TetherStatsContextType {
  state: TetherChatState;
  markAsViewed: () => Promise<void>;
  refresh: () => Promise<void>;
  triggerUpdate: () => void; // Force immediate update after completing a tether
}

const TetherStatsContext = createContext<TetherStatsContextType | undefined>(undefined);

export const TetherStatsProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<TetherChatState>({
    count: 0,
    isActive: false,
    loading: true,
    error: null,
  });

  const [lastViewedCount, setLastViewedCount] = useState<number>(0);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);

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
      const stats = await getTetherStats();
      console.log('📊 Fetched tether stats:', stats);
      
      const totalCompleted = stats.totalAnswered || 0;
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
      console.error('❌ Error fetching tether stats:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load tether stats',
      }));
    }
  }, [lastViewedCount]);

  // Mark tethers as viewed
  const markAsViewed = useCallback(async () => {
    try {
      await AsyncStorage.setItem(LAST_VIEWED_TETHER_KEY, state.count.toString());
      setLastViewedCount(state.count);
      setState(prev => ({ ...prev, isActive: false }));
      console.log('✅ Marked tethers as viewed:', state.count);
    } catch (error) {
      console.error('Error marking tethers as viewed:', error);
    }
  }, [state.count]);

  // Refresh stats (public API)
  const refresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchStats();
  }, [fetchStats]);

  // Trigger immediate update (called after completing a tether)
  const triggerUpdate = useCallback(() => {
    console.log('⚡ Immediate update triggered');
    fetchStats();
  }, [fetchStats]);

  // Setup polling when app is active
  useEffect(() => {
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      console.log('🔁 Starting tether stats polling (every 30s)');
      pollingIntervalRef.current = setInterval(() => {
        console.log('⏰ Polling tether stats...');
        fetchStats();
      }, POLLING_INTERVAL);
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        console.log('⏸️ Stopping tether stats polling');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 App came to foreground - refreshing stats');
        fetchStats();
        startPolling();
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('📱 App went to background - stopping polling');
        stopPolling();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial fetch and start polling
    fetchStats();
    startPolling();

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [fetchStats]);

  const value: TetherStatsContextType = {
    state,
    markAsViewed,
    refresh,
    triggerUpdate,
  };

  return (
    <TetherStatsContext.Provider value={value}>
      {children}
    </TetherStatsContext.Provider>
  );
};

export const useTetherStatsContext = () => {
  const context = useContext(TetherStatsContext);
  if (context === undefined) {
    throw new Error('useTetherStatsContext must be used within TetherStatsProvider');
  }
  return context;
};
