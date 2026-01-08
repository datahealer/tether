import { useRef, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

/**
 * Hook to prevent multiple rapid navigation triggers and button actions
 * 
 * This prevents the common issue where users can tap a button multiple times
 * and stack up navigation events or trigger actions repeatedly.
 * 
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Debounced navigation and action functions
 */
export function useNavigationDebounce(delay: number = 500) {
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const lastActionTime = useRef(0);
  const [isNavigating, setIsNavigating] = useState(false);

  /**
   * Generic debounced action handler for any callback
   */
  const debouncedAction = useCallback(
    async (action: () => void | Promise<void>, haptic: boolean = true) => {
      const now = Date.now();
      
      // Check if we're within the debounce window
      if (isNavigatingRef.current || (now - lastActionTime.current) < delay) {
        console.log('⏸️ Action debounced - too soon');
        return;
      }

      // Set flags
      isNavigatingRef.current = true;
      setIsNavigating(true);
      lastActionTime.current = now;

      // Trigger haptic feedback if requested
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Execute the action
      try {
        await action();
      } catch (error) {
        console.error('❌ Debounced action error:', error);
      }

      // Reset the flags after delay
      setTimeout(() => {
        isNavigatingRef.current = false;
        setIsNavigating(false);
      }, delay);
    },
    [delay]
  );

  /**
   * Navigate with debouncing to prevent multiple rapid pushes
   */
  const debouncedPush = useCallback(
    (path: string, haptic: boolean = true) => {
      const now = Date.now();
      
      // Check if we're within the debounce window
      if (isNavigatingRef.current || (now - lastActionTime.current) < delay) {
        console.log('⏸️ Navigation debounced - too soon');
        return;
      }

      // Set navigation flags
      isNavigatingRef.current = true;
      setIsNavigating(true);
      lastActionTime.current = now;

      // Trigger haptic feedback if requested
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Perform navigation
      router.push(path as any);

      // Reset the navigation flag after delay
      setTimeout(() => {
        isNavigatingRef.current = false;
        setIsNavigating(false);
      }, delay);
    },
    [router, delay]
  );

  /**
   * Navigate back with debouncing
   */
  const debouncedBack = useCallback(
    (haptic: boolean = true) => {
      const now = Date.now();
      
      if (isNavigatingRef.current || (now - lastActionTime.current) < delay) {
        console.log('⏸️ Navigation debounced - too soon');
        return;
      }

      isNavigatingRef.current = true;
      setIsNavigating(true);
      lastActionTime.current = now;

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.back();

      setTimeout(() => {
        isNavigatingRef.current = false;
        setIsNavigating(false);
      }, delay);
    },
    [router, delay]
  );

  /**
   * Replace current screen with debouncing
   */
  const debouncedReplace = useCallback(
    (path: string, haptic: boolean = true) => {
      const now = Date.now();
      
      if (isNavigatingRef.current || (now - lastActionTime.current) < delay) {
        console.log('⏸️ Navigation debounced - too soon');
        return;
      }

      isNavigatingRef.current = true;
      setIsNavigating(true);
      lastActionTime.current = now;

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      router.replace(path as any);

      setTimeout(() => {
        isNavigatingRef.current = false;
        setIsNavigating(false);
      }, delay);
    },
    [router, delay]
  );

  /**
   * Check if currently within navigation debounce window
   */
  const canNavigate = useCallback(() => {
    const now = Date.now();
    return !isNavigatingRef.current && (now - lastActionTime.current) >= delay;
  }, [delay]);

  return {
    debouncedPush,
    debouncedBack,
    debouncedReplace,
    debouncedAction,
    canNavigate,
    isNavigating,
    // Backwards compatibility
    push: debouncedPush,
    back: debouncedBack,
    replace: debouncedReplace,
  };
}
