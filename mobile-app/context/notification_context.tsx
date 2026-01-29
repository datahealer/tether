import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import notificationService, { NotificationData } from '../services/notification_service';
import { useAuth } from './auth_context';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isEnabled: boolean;
  requestPermissions: () => Promise<boolean>;
  clearBadge: () => Promise<void>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    if (user) {
      initializeNotifications();
    } else {
      cleanupNotifications();
    }

    return () => {
      cleanupNotifications();
    };
  }, [user]);

  const initializeNotifications = async () => {
    try {
      // Check if already enabled
      const enabled = await notificationService.areNotificationsEnabled();
      setIsEnabled(enabled);

      if (enabled) {
        const token = await notificationService.initialize();
        setExpoPushToken(token);

        // Get initial badge count
        const count = await notificationService.getBadgeCount();
        setUnreadCount(count);
      }

      // Listen for notifications received while app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('📬 Notification received:', notification);
          setNotification(notification);
          setUnreadCount((prev) => prev + 1);
        }
      );

      // Listen for user interaction with notifications
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log('👆 Notification tapped:', response);
          handleNotificationResponse(response);
        }
      );
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
    }
  };

  const cleanupNotifications = () => {
    if (notificationListener.current) {
      notificationListener.current.remove();
    }
    if (responseListener.current) {
      responseListener.current.remove();
    }
    notificationService.unregisterDeviceToken();
    setExpoPushToken(null);
    setIsEnabled(false);
  };

  const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;

    console.log('🔔 Notification tapped - Type:', data.type);
    console.log('📍 Navigation data:', {
      questionId: data.questionId || data.tetherId,
      categoryId: data.categoryId,
      route: data.route,
    });

    // Handle different notification types
    switch (data.type) {
      case 'NEW_TETHER':
        // New tether available - go to category packs
        console.log('➡️ New tether available - navigating to category packs');
        router.push('/home/category-packs');
        break;

      case 'PARTNER_ANSWERED':
      case 'BOTH_ANSWERED':
        // Partner answered or both answered - fetch tether state and route accordingly
        const questionId = data.questionId || data.tetherId;
        
        if (questionId) {
          try {
            console.log('➡️ Fetching tether state for:', questionId);
            // TODO: Create a getTetherById service function that returns full state
            // For now, determine route based on notification type
            
            if (data.type === 'BOTH_ANSWERED') {
              // Both answered - go to history
              console.log('➡️ Both answered - navigating to tether history');
              router.push('/home/tether-history');
            } else {
              // Partner answered - user needs to answer (show waiting-partner screen)
              console.log('➡️ Partner answered - navigating to waiting-partner');
              router.push({
                pathname: '/home/waiting-partner',
                params: {
                  questionId: questionId,
                  categoryName: data.categoryName || '',
                  question: data.question || '',
                  partnerAnswer: data.partnerAnswer || '',
                  expiresAt: data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
              });
            }
          } catch (error) {
            console.error('❌ Error fetching tether state:', error);
            // Fallback to category packs
            router.push('/home/category-packs');
          }
        } else {
          console.log('➡️ No questionId, navigating to category packs');
          router.push('/home/category-packs');
        }
        break;

      case 'QUESTION_EXPIRING':
        // Question expiring soon - navigate to the specific question
        const expiringQuestionId = data.questionId || data.tetherId;
        
        if (expiringQuestionId && data.categoryId) {
          console.log(`➡️ Question expiring - navigating to question ${expiringQuestionId}`);
          router.push({
            pathname: '/home/category-question',
            params: {
              categoryId: data.categoryId,
              tetherQuestion: expiringQuestionId,
            },
          });
        } else {
          router.push('/home/category-packs');
        }
        break;

      case 'GENTLE_REMINDER':
        console.log('➡️ Reminder notification - navigating to category packs');
        router.push('/home/category-packs');
        break;

      case 'MILESTONE':
        console.log('➡️ Milestone notification - navigating to tether history');
        router.push('/home/tether-history');
        break;

      case 'COUPLE_INVITE':
        console.log('➡️ Couple invite - navigating to partner invite');
        router.push('/onboarding/partner-invite');
        break;
        
      case 'PARTNER_REFRESHED':
        console.log('➡️ Partner refreshed - navigating to category question');
        router.push({
          pathname: data.route || '/home/category-question',
          params: {
            categoryId: data.categoryId,
            tetherQuestion: data.questionId || data.tetherId,
          },
        });
        break;

      case 'TRIAL_EXPIRED':
        console.log('➡️ Trial expired - navigating to subscription screen');
        router.push('/home/draw-locked-upsell');
        break;

      case 'REACTION_ADDED':
        console.log('➡️ Reaction added - navigating to tether history');
        router.push('/home/tether-history');
        break;

      case 'REFRESH_PURCHASED':
        console.log('➡️ Partner purchased refreshes - navigating to category packs');
        // Navigate to category packs so partner can see the new refreshes
        router.push('/home/category-packs');
        break;

      default:
        console.log('➡️ Unknown notification type, navigating to category packs');
        router.push('/home/category-packs');
    }

    // Clear badge
    clearBadge();
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setIsEnabled(granted);

      if (granted) {
        const token = await notificationService.initialize();
        setExpoPushToken(token);
      }

      return granted;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  };

  const clearBadge = async () => {
    try {
      await notificationService.clearBadge();
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error clearing badge:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        isEnabled,
        requestPermissions,
        clearBadge,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
