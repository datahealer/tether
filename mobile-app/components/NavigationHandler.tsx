import { useEffect, useRef } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/context/auth_context';
import { useOnboardingSync } from '@/hooks/useOnboardingSync';

export function NavigationHandler() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  
  // Sync onboarding data when user changes
  useOnboardingSync();
  
  const hasNavigated = useRef(false);
  const lastRoute = useRef(pathname);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (pathname === lastRoute.current && hasNavigated.current) {
      return;
    }

    lastRoute.current = pathname;

    const inAuth = segments[0] === 'onboarding';
    const inHome = segments[0] === 'home';
    const currentRoute = pathname;

    // ✅ Allow navigation to settings screens and home screens
    const isSettingsScreen = currentRoute.includes('/settings');
    const isHomeScreen = currentRoute.includes('/home/');

    console.log('🔍 Navigation Check:', {
      user: user?.email,
      onboarded: user?.onboarded,
      subscribed: user?.subscribed,
      currentRoute,
      inAuth,
      inHome,
      isSettingsScreen,
      isHomeScreen
    });

    if (!user) {
      // Not logged in - redirect to account creation
      if (currentRoute !== '/onboarding/account-creation' && 
          currentRoute !== '/onboarding/login' &&
          currentRoute !== '/onboarding/welcome') {
        console.log('➡️ Redirecting to account creation');
        hasNavigated.current = true;
        router.replace('/onboarding/account-creation');
      }
    } else {
      // Logged in - determine where to go based on status
      if (!user.onboarded) {
        // Not onboarded - should be in onboarding flow
        if (!inAuth && currentRoute !== '/onboarding/privacy' && !isSettingsScreen && !isHomeScreen) {
          console.log('➡️ Redirecting to privacy (start of onboarding)');
          hasNavigated.current = true;
          router.replace('/onboarding/privacy');
        }
      } else if (!user.subscribed) {
        // Onboarded but not subscribed - go to subscription
        if (currentRoute !== '/onboarding/subscription' && !isSettingsScreen && !isHomeScreen) {
          console.log('➡️ Redirecting to subscription');
          hasNavigated.current = true;
          router.replace('/onboarding/subscription');
        }
      } else {
        // Fully onboarded + subscribed → home
        // But allow invite screen access (e.g., reshare link)
        const allowedPostSubscription = [
          '/home/category-packs',
          '/onboarding/partner-invite', // ← Explicitly allow invite even after subscription
        ];

        if (
          !inHome &&
          !allowedPostSubscription.some(route => currentRoute.startsWith(route)) &&
          !isSettingsScreen
        ) {
          console.log('➡️ Redirecting fully ready user to category packs');
          hasNavigated.current = true;
          router.replace('/home/category-packs');
        }
      }
    }
  }, [user?.id, user?.onboarded, user?.subscribed, loading, pathname, router]);

  return null;
}