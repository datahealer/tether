import User from '../../models/User';
import Couple from '../../models/Couple';
import Notification, { NotificationType, NotificationStatus, INotification } from '../../models/Notification';
import { Platform, Rhythm } from '../../types/enums';
import fcmProvider from './providers/fcm.provider';
import expoProvider from './providers/expo.provider';

interface SendNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  coupleId?: string;
  tetherId?: string;
  scheduledFor?: Date;
  respectPreferences?: boolean;
}

interface NotificationTemplate {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  async sendNotification(options: SendNotificationOptions): Promise<INotification[]> {
    const {
      userId,
      type,
      title,
      body,
      data,
      coupleId,
      tetherId,
      scheduledFor,
      respectPreferences = true,
    } = options;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (respectPreferences && !this.shouldSendNotification(user, type)) {
      return [];
    }

    const notifications: INotification[] = [];
    const tokens: { token: string; platform: 'ios' | 'android' }[] = [];

    if (user.platform === Platform.IOS && user.fcmTokens.length > 0) {
      user.fcmTokens.forEach(token => {
        tokens.push({ token, platform: 'ios' as 'ios' | 'android' });
      });
    } else if (user.platform === Platform.ANDROID && user.fcmTokens.length > 0) {
      user.fcmTokens.forEach(token => {
        tokens.push({ token, platform: 'android' as 'ios' | 'android' });
      });
    }

    if (tokens.length === 0) {
      return [];
    }

    for (const { token, platform } of tokens) {
      const notification = new Notification({
        userId: user._id,
        coupleId: coupleId ? coupleId : user.coupleId,
        tetherId,
        type,
        title,
        body,
        data,
        status: scheduledFor ? NotificationStatus.PENDING : NotificationStatus.PENDING,
        platform,
        deviceToken: token,
        scheduledFor,
      });

      if (!scheduledFor) {
        const result = await this.deliverNotification(notification, token, platform);
        if (result.success) {
          notification.status = NotificationStatus.SENT;
          notification.sentAt = new Date();
        } else {
          notification.status = NotificationStatus.FAILED;
          notification.errorMessage = result.error;
          notification.retryCount = 1;
        }
      }

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  }

  async sendToCouple(
    coupleId: string,
    type: NotificationType,
    template: (partnerName: string) => NotificationTemplate,
    excludeUserId?: string,
    data?: Record<string, any>
  ): Promise<void> {
    const couple = await Couple.findById(coupleId).populate('user1Id user2Id');
    if (!couple) {
      throw new Error('Couple not found');
    }

    const users = [couple.user1Id, couple.user2Id].filter(
      (user: any) => user && user._id.toString() !== excludeUserId
    ) as any[];

    for (const user of users) {
      const partner = users.find((u: any) => u._id.toString() !== user._id.toString());
      const partnerName = partner?.name || 'Your partner';
      const notificationContent = template(partnerName);

      await this.sendNotification({
        userId: user._id.toString(),
        type,
        title: notificationContent.title,
        body: notificationContent.body,
        data: { ...notificationContent.data, ...data },
        coupleId,
        respectPreferences: true,
      });
    }
  }

  async sendNewTetherNotification(coupleId: string, tetherId: string, questionText: string): Promise<void> {
    await this.sendToCouple(
      coupleId,
      NotificationType.NEW_TETHER,
      () => ({
        title: 'New Tether Available',
        body: questionText.substring(0, 100) + (questionText.length > 100 ? '...' : ''),
        data: { tetherId, type: NotificationType.NEW_TETHER },
      }),
      undefined,
      { tetherId }
    );
  }

  async sendPartnerAnsweredNotification(
    coupleId: string,
    tetherId: string,
    responderName: string
  ): Promise<void> {
    await this.sendToCouple(
      coupleId,
      NotificationType.PARTNER_ANSWERED,
      () => ({
        title: `${responderName} answered`,
        body: 'Your partner has responded to the tether!',
        data: { tetherId, type: NotificationType.PARTNER_ANSWERED },
      }),
      undefined,
      { tetherId }
    );
  }

  async sendQuestionExpiringNotification(
    coupleId: string,
    tetherId: string,
    hoursRemaining: number
  ): Promise<void> {
    await this.sendToCouple(
      coupleId,
      NotificationType.QUESTION_EXPIRING,
      () => ({
        title: 'Tether Expiring Soon',
        body: `You have ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} left to answer`,
        data: { tetherId, type: NotificationType.QUESTION_EXPIRING, hoursRemaining },
      }),
      undefined,
      { tetherId }
    );
  }

  async sendGentleReminder(coupleId: string, rhythm: Rhythm): Promise<void> {
    const reminderMessages: Record<Rhythm, string> = {
      [Rhythm.EVERY_DAY]: "Time for your daily tether connection",
      [Rhythm.FEW_TIMES_WEEK]: "Ready for another tether?",
      [Rhythm.ONCE_WEEK]: "Weekly tether time!",
      [Rhythm.DECIDE_AS_GO]: "Ready to connect?",
    };

    await this.sendToCouple(
      coupleId,
      NotificationType.GENTLE_REMINDER,
      () => ({
        title: 'Tether Reminder',
        body: reminderMessages[rhythm] || reminderMessages[Rhythm.DECIDE_AS_GO],
        data: { type: NotificationType.GENTLE_REMINDER },
      })
    );
  }

  async sendMilestoneNotification(
    userId: string,
    milestone: string,
    data?: Record<string, any>
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.MILESTONE,
      title: 'Milestone Achieved!',
      body: milestone,
      data: { ...data, type: NotificationType.MILESTONE },
      respectPreferences: true,
    });
  }

  private shouldSendNotification(user: any, type: NotificationType): boolean {
    const prefs = user.notificationPreferences || {};

    switch (type) {
      case NotificationType.GENTLE_REMINDER:
        return prefs.gentleReminders !== false;
      case NotificationType.MILESTONE:
        return prefs.milestoneAlerts !== false;
      case NotificationType.NEW_TETHER:
      case NotificationType.PARTNER_ANSWERED:
      case NotificationType.QUESTION_EXPIRING:
        return prefs.newTetherAlerts !== false;
      default:
        return true;
    }
  }

  private async deliverNotification(
    notification: INotification,
    token: string,
    platform: 'ios' | 'android'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Detect if token is an Expo Push Token
      const isExpoToken = /^Expo(nent)?PushToken\[.+\]$/.test(token);
      
      let result: { success: boolean; messageId?: string; error?: string };
      
      if (isExpoToken) {
        console.log(`📱 Sending via Expo Push: ${token.substring(0, 30)}...`);
        result = await expoProvider.sendNotification(
          token,
          notification.title,
          notification.body,
          notification.data
        );
      } else {
        console.log(`🔥 Sending via FCM: ${token.substring(0, 30)}...`);
        result = await fcmProvider.sendNotification(
          token,
          notification.title,
          notification.body,
          notification.data
        );
      }

      if (!result.success) {
        if (result.error === 'INVALID_TOKEN' || result.error?.includes('INVALID_TOKEN')) {
          await this.removeInvalidToken(notification.userId.toString(), token, platform);
        }
        return { success: false, error: result.error };
      }

      console.log(`✅ Notification sent successfully: ${result.messageId}`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Notification delivery error:', error);
      return { success: false, error: error.message };
    }
  }

  private async removeInvalidToken(userId: string, token: string, platform: 'ios' | 'android'): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    if (platform === 'android') {
      user.fcmTokens = user.fcmTokens.filter(t => t !== token);
    }

    await user.save();
  }

  async retryFailedNotifications(maxRetries = 3): Promise<void> {
    const failedNotifications = await Notification.find({
      status: NotificationStatus.FAILED,
      retryCount: { $lt: maxRetries },
    }).limit(100);

    for (const notification of failedNotifications) {
      if (!notification.deviceToken) continue;
      if (notification.platform === 'web') continue;

      const result = await this.deliverNotification(
        notification,
        notification.deviceToken,
        notification.platform as 'ios' | 'android'
      );

      notification.retryCount += 1;

      if (result.success) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        notification.errorMessage = undefined;
      } else {
        if (notification.retryCount >= maxRetries) {
          notification.status = NotificationStatus.FAILED;
        }
        notification.errorMessage = result.error;
      }

      await notification.save();
    }
  }

  async getNotifications(
    userId: string,
    limit = 50,
    skip = 0
  ): Promise<{ notifications: INotification[]; total: number }> {
    const [notifications, total] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('tetherId', 'questionId question'),
      Notification.countDocuments({ userId }),
    ]);

    return { notifications, total };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.updateOne(
      { _id: notificationId, userId },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, status: { $ne: NotificationStatus.READ } },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }
}

export default new NotificationService();
