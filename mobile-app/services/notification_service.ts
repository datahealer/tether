import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authenticatedFetch } from './auth_service';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// Configure how notifications should be displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type?: string;
  tetherId?: string;
  coupleId?: string;
  categoryId?: string;
  streak?: number;
  hoursRemaining?: number;
  [key: string]: any;
}

class NotificationService {
  private expoPushToken: string | null = null;
 

  /**
   * Initialize notification service and register device token
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if it's a physical device
      if (!Device.isDevice) {
        console.log('⚠️ Push notifications only work on physical devices');
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('⚠️ Push notification permission denied');
        return null;
      }

      // Get Expo push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      console.log('✅ Expo Push Token:', this.expoPushToken);

      // Register token with backend
      await this.registerDeviceToken(this.expoPushToken);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tether_notifications', {
          name: 'Tether Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
          sound: 'default',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return null;
    }
  }

  /**
   * Register device token with backend
   */
  private async registerDeviceToken(token: string): Promise<void> {
    try {
      await authenticatedFetch(`${API_URL}/api/profile/fcm-token`, {
        method: 'POST',
        body: JSON.stringify({
          token,
          platform: Platform.OS,
        }),
      });
      console.log('✅ Device token registered with backend');
    } catch (error) {
      console.error('❌ Error registering device token:', error);
    }
  }

  /**
   * Unregister device token (call on logout)
   */
  async unregisterDeviceToken(): Promise<void> {
    try {
      if (!this.expoPushToken) return;

      await authenticatedFetch(`${API_URL}/api/profile/fcm-token`, {
        method: 'DELETE',
        body: JSON.stringify({
          token: this.expoPushToken,
        }),
      });
      console.log('✅ Device token unregistered');
      this.expoPushToken = null;
    } catch (error) {
      console.error('❌ Error unregistering device token:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error checking notification status:', error);
      return false;
    }
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    delaySeconds: number = 0
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          badge: 1,
        },
        trigger: delaySeconds > 0 ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds } : null,
      });
      return identifier;
    } catch (error) {
      console.error('❌ Error scheduling local notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('❌ Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Error canceling all notifications:', error);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('❌ Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ Error setting badge count:', error);
    }
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('❌ Error clearing badge:', error);
    }
  }

  /**
   * Get Expo push token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }
}

export default new NotificationService();
