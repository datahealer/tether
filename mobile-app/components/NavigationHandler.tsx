import { useEffect, useRef, useState } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/context/auth_context';
import { useOnboardingSync } from '@/hooks/useOnboardingSync';
import { getActiveTethers } from '@/services/tether_service';

export function NavigationHandler() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [checkingTethers, setCheckingTethers] = useState(false);
  
  // Sync onboarding data when user changes
  useOnboardingSync();
  
  const hasNavigated = useRef(false);
  const lastRoute = useRef(pathname);
  const isInitialSession = useRef(true);
  const hasRedirectedThisSession = useRef(false);

  // Reset navigation flags on logout
  useEffect(() => {
    if (!user) {
      // Reset on logout / unauthenticated state
      isInitialSession.current = true;
      hasRedirectedThisSession.current = false;
      hasNavigated.current = false;
      console.log('🔄 Reset navigation flags on logout/user null');
    }
  }, [user]);

  useEffect(() => {
  // ✅ Wait for auth to finish loading before any navigation
  if (loading) {
    console.log('⏳ Auth still loading, skipping navigation');
    return;
  }

  // ✅ Skip if already navigated to this route
  if (pathname === lastRoute.current && hasNavigated.current) {
    return;
  }

  lastRoute.current = pathname;

  const inAuth = segments[0] === 'onboarding';
  const inHome = segments[0] === 'home';
  const currentRoute = pathname;

  const isSettingsScreen = currentRoute.includes('/settings');
  const isHomeScreen = currentRoute.includes('/home/');
  const isWaitingScreen = currentRoute.includes('/waiting-for-partner-answer') || currentRoute.includes('/waiting-partner') || currentRoute.includes('/waiting-for-partner');

  console.log('🔍 Navigation Check:', {
    user: user?.email,
    onboarded: user?.onboarded,
    subscribed: user?.subscribed,
    coupleId: user?.coupleId,
    currentRoute,
  });

  if (!user) {
    // ✅ Only redirect if NOT already on welcome/login/account-creation
    const allowedUnauthRoutes = [
      '/onboarding/welcome',
      '/onboarding/login',
      '/onboarding/account-creation'
    ];
    
    if (!allowedUnauthRoutes.some(route => currentRoute.startsWith(route))) {
      console.log('➡️ Redirecting to welcome (unauthenticated)');
      hasNavigated.current = true;
      router.replace('/onboarding/welcome');
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
      } else if (!user.coupleId) {
        // Onboarded but no couple at all - go to partner-invite
        if (currentRoute !== '/onboarding/partner-invite' && currentRoute !== '/onboarding/attribution' && !isSettingsScreen && !isWaitingScreen) {
          console.log('➡️ Redirecting to partner-invite (no couple yet - must connect)');
          hasNavigated.current = true;
          router.replace('/onboarding/partner-invite');
        }
      } else if (user.isSoloMode && !user.linkedToRealPartner) {
        // 🆕 SOLO MODE: User has virtual partner, exploring the app
        console.log('👤 Solo mode detected - user can explore app fully', {
          isInitialSession: isInitialSession.current,
          hasRedirectedThisSession: hasRedirectedThisSession.current,
          currentRoute,
        });
        
        // Solo mode: Force partner-invite as the "home" screen on fresh login/session start
        if (
          user.onboarded &&
          isInitialSession.current &&
          !hasRedirectedThisSession.current &&
          currentRoute !== '/onboarding/partner-invite' // Avoid loop if already there
        ) {
          console.log('➡️ Fresh solo login/session - forcing to partner-invite first');
          hasRedirectedThisSession.current = true;
          isInitialSession.current = false;
          hasNavigated.current = true;
          router.replace('/onboarding/partner-invite');
          return;
        }
        
        // Mark initial session as complete once we're past the first redirect
        if (isInitialSession.current && currentRoute === '/onboarding/partner-invite') {
          isInitialSession.current = false;
          console.log('✅ Initial session complete - user on partner-invite');
        }
        
        // Allow navigation within solo mode routes
        const allowedSoloRoutes = [
          '/onboarding/partner-invite',
          '/onboarding/first-tether',
          '/onboarding/attribution',
          '/onboarding/subscription',
          '/home/',
          '/settings',
        ];
        
        const isInAllowedRoute = allowedSoloRoutes.some(route => currentRoute.startsWith(route));
        
        // If already on partner-invite or actively navigating, allow it
        if (currentRoute === '/onboarding/partner-invite' || isSettingsScreen || isHomeScreen || isWaitingScreen) {
          console.log('👤 Solo user on partner-invite or navigating - no redirect');
          return;
        }
        
        // If on other allowed routes and has navigated before, allow free navigation
        if (isInAllowedRoute && hasNavigated.current) {
          console.log('👤 Solo user navigating freely within allowed routes');
          return;
        }
        
        // If they're lost or at root, send to partner-invite as the solo mode home
        if (!inAuth && !inHome && !isSettingsScreen) {
          console.log('➡️ Solo user at entry point - sending to partner-invite');
          hasNavigated.current = true;
          router.replace('/onboarding/partner-invite');
        }
      } else if (!user.subscribed) {
        // Onboarded + coupled but not subscribed
        // Allow access to subscription screen, first-tether, and settings
        const allowedFreeRoutes = [
          '/onboarding/first-tether',
          '/onboarding/subscription',
          '/settings',
        ];
        
        if (allowedFreeRoutes.some(route => currentRoute.startsWith(route)) || isSettingsScreen || isHomeScreen || isWaitingScreen) {
          // User is on an allowed route, don't redirect
          return;
        }
        
        // Check if they have active tethers (free tier: 2 categories × 40 questions)
        const checkActiveTethers = async () => {
          if (checkingTethers) return;
          
          try {
            setCheckingTethers(true);
            console.log('🔍 Checking for active tethers...');
            const { tethers } = await getActiveTethers();
            
            if (tethers && tethers.length > 0) {
              // User has active tethers - send to first-tether screen
              if (currentRoute !== '/onboarding/first-tether' && !isSettingsScreen && !isHomeScreen && !isWaitingScreen) {
                console.log('➡️ Redirecting to first-tether (active tethers available)');
                hasNavigated.current = true;
                router.replace('/onboarding/first-tether');
              }
            } else {
              // No active tethers - send to subscription
              if (currentRoute !== '/onboarding/subscription' && !isSettingsScreen && !isHomeScreen && !isWaitingScreen) {
                console.log('➡️ Redirecting to subscription (no active tethers)');
                hasNavigated.current = true;
                router.replace('/onboarding/subscription');
              }
            }
          } catch (error) {
            console.error('❌ Error checking active tethers:', error);
            // On error, default to subscription screen
            if (currentRoute !== '/onboarding/subscription' && !isSettingsScreen && !isHomeScreen && !isWaitingScreen) {
              console.log('➡️ Redirecting to subscription (error checking tethers)');
              hasNavigated.current = true;
              router.replace('/onboarding/subscription');
            }
          } finally {
            setCheckingTethers(false);
          }
        };

        checkActiveTethers();
      } else {
        // Fully onboarded + subscribed → home
        // But allow invite screen access (e.g., reshare link)
        const allowedPostSubscription = [
          '/home/category-packs',
          '/onboarding/partner-invite', // ← Explicitly allow invite even after subscription
          '/onboarding/subscription', // ← Allow users to view/manage subscription anytime
          '/home/first-tether', // ← Allow access to first tether if they have active tethers
        ];

        if (
          !inHome &&
          !allowedPostSubscription.some(route => currentRoute.startsWith(route)) &&
          !isSettingsScreen &&
          !isWaitingScreen
        ) {
          console.log('➡️ Redirecting fully ready user to category packs');
          hasNavigated.current = true;
          router.replace('/home/category-packs');
        }
      }
    }
  }, [user?.id, user?.onboarded, user?.subscribed, user?.coupleId, loading, pathname, router, checkingTethers]);

  return null;
}