import { useEffect } from 'react';
import { useAuth } from '@/context/auth_context';
import { useOnboarding } from '@/context/onboarding_context';

/**
 * Hook to synchronize onboarding data when user changes
 * This ensures each user sees their own onboarding data
 */
export function useOnboardingSync() {
  const { user } = useAuth();
  const { loadUserOnboardingData, clearOnboarding } = useOnboarding();

  useEffect(() => {
    if (user?.id) {
      // Load user-specific onboarding data
      console.log('🔄 Syncing onboarding data for user:', user.id);
      loadUserOnboardingData(user.id, user.onboardingData);
    } else {
      // Clear onboarding data when user logs out
      console.log('🧹 Clearing onboarding data (user logged out)');
      clearOnboarding();
    }
  }, [user?.id]); // Re-run when user ID changes

  return null;
}
