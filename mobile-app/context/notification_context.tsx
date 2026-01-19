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

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
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
      case 'PARTNER_ANSWERED':
      case 'BOTH_ANSWERED':
      case 'QUESTION_EXPIRING':
        // Use questionId (new format) or tetherId (legacy) and categoryId
        const questionId = data.questionId || data.tetherId;
        
        if (questionId && data.categoryId) {
          console.log(`➡️ Navigating to question ${questionId} in category ${data.categoryId}`);
          router.push({
            pathname: '/home/category-question',
            params: {
              categoryId: data.categoryId,
              tetherQuestion: questionId,
            },
          });
        } else if (data.categoryId) {
          // Has category but no specific question - go to category view
          console.log(`➡️ Navigating to category ${data.categoryId}`);
          router.push({
            pathname: '/home/category-packs',
            params: { selectedCategory: data.categoryId },
          });
        } else {
          // No specific data - go to category packs
          console.log('➡️ No specific data, navigating to category packs');
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
        // Navigate to subscription/paywall screen
        router.push('/home/draw-locked-upsell'); // or wherever subscription screen is
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
