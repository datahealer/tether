import { useEffect, useRef } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/context/auth_context';

export function NavigationHandler() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  
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

    // ✅ Allow navigation to settings screens
    const isSettingsScreen = currentRoute.includes('/settings');

    console.log('🔍 Navigation Check:', {
      user: user?.email,
      onboarded: user?.onboarded,
      subscribed: user?.subscribed,
      currentRoute,
      inAuth,
      inHome,
      isSettingsScreen
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
        if (!inAuth && currentRoute !== '/onboarding/privacy' && !isSettingsScreen) {
          console.log('➡️ Redirecting to privacy (start of onboarding)');
          hasNavigated.current = true;
          router.replace('/onboarding/privacy');
        }
      } else if (!user.subscribed) {
        // Onboarded but not subscribed - go to subscription
        if (currentRoute !== '/onboarding/subscription' && !isSettingsScreen) {
          console.log('➡️ Redirecting to subscription');
          hasNavigated.current = true;
          router.replace('/onboarding/subscription');
        }
      } else {
        // Both onboarded and subscribed - go to home (but allow settings)
        console.log('✅ User fully onboarded and subscribed');
        if (!inHome && currentRoute !== '/home/category-packs' && !isSettingsScreen) {
          console.log('➡️ Redirecting to home');
          hasNavigated.current = true;
          router.replace('/home/category-packs');
        }
      }
    }
  }, [user?.id, user?.onboarded, user?.subscribed, loading, pathname]);

  return null;
}