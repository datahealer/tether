import notificationService from './notification.service';
import { NotificationType } from '../../models/Notification';
import { Tether } from '../../models/Tether';
import Couple from '../../models/Couple';
import User from '../../models/User';
import { TetherStatus } from '../../types/enums';

export class NotificationTriggers {
  static async onTetherCreated(coupleId: string, tetherId: string): Promise<void> {
    try {
      const tether = await Tether.findById(tetherId).populate('question');
      if (!tether) return;

      const questionText = (tether.question as any)?.question || 'New tether available';
      await notificationService.sendNewTetherNotification(
        coupleId,
        tetherId,
        questionText
      );
    } catch (error) {
      console.error('Error sending new tether notification:', error);
    }
  }

  static async onTetherAnswered(
    tetherId: string,
    userId: string,
    coupleId: string
  ): Promise<void> {
    try {
      const tether = await Tether.findById(tetherId);
      if (!tether) return;

      const user = await User.findById(userId);
      if (!user) return;

      const responderName = user.name || 'Your partner';

      if (tether.status === TetherStatus.WAITING_FOR_PARTNER) {
        await notificationService.sendPartnerAnsweredNotification(
          coupleId,
          tetherId,
          responderName
        );
      } else if (tether.status === TetherStatus.BOTH_ANSWERED) {
        const couple = await Couple.findById(coupleId);
        if (couple) {
          const user1 = await User.findById(couple.user1Id);
          const user2 = await User.findById(couple.user2Id);

          if (user1 && user1._id.toString() !== userId) {
            await notificationService.sendNotification({
              userId: user1._id.toString(),
              type: NotificationType.BOTH_ANSWERED,
              title: 'Both Answered!',
              body: 'You both completed the tether!',
              data: { tetherId, type: NotificationType.BOTH_ANSWERED },
              coupleId,
              tetherId,
            });
          }

          if (user2 && user2._id.toString() !== userId) {
            await notificationService.sendNotification({
              userId: user2._id.toString(),
              type: NotificationType.BOTH_ANSWERED,
              title: 'Both Answered!',
              body: 'You both completed the tether!',
              data: { tetherId, type: NotificationType.BOTH_ANSWERED },
              coupleId,
              tetherId,
            });
          }

          const newStreak = (couple.sharedData?.currentStreak || 0) + 1;
          if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
            if (user1) {
              await notificationService.sendMilestoneNotification(
                user1._id.toString(),
                `${newStreak} Day Streak! 🎉`,
                { streak: newStreak, tetherId }
              );
            }
            if (user2) {
              await notificationService.sendMilestoneNotification(
                user2._id.toString(),
                `${newStreak} Day Streak! 🎉`,
                { streak: newStreak, tetherId }
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending answer notification:', error);
    }
  }

  static async onCoupleCreated(coupleId: string): Promise<void> {
    try {
      const couple = await Couple.findById(coupleId).populate('user1Id user2Id');
      if (!couple) return;

      const user1 = couple.user1Id as any;
      const user2 = couple.user2Id as any;

      if (user1) {
        await notificationService.sendNotification({
          userId: user1._id.toString(),
          type: NotificationType.COUPLE_INVITE,
          title: 'Couple Connected!',
          body: `You're now connected with ${user2?.name || 'your partner'}!`,
          data: { coupleId, type: NotificationType.COUPLE_INVITE },
          coupleId,
        });
      }

      if (user2) {
        await notificationService.sendNotification({
          userId: user2._id.toString(),
          type: NotificationType.COUPLE_INVITE,
          title: 'Couple Connected!',
          body: `You're now connected with ${user1?.name || 'your partner'}!`,
          data: { coupleId, type: NotificationType.COUPLE_INVITE },
          coupleId,
        });
      }
    } catch (error) {
      console.error('Error sending couple created notification:', error);
    }
  }

  static async onMilestone(userId: string, milestone: string, data?: Record<string, any>): Promise<void> {
    try {
      await notificationService.sendMilestoneNotification(userId, milestone, data);
    } catch (error) {
      console.error('Error sending milestone notification:', error);
    }
  }
}
