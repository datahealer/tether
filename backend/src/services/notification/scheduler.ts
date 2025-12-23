import { schedule } from 'node-cron';
import Notification, { NotificationStatus } from '../../models/Notification';
import { Tether } from '../../models/Tether';
import Couple from '../../models/Couple';
import User from '../../models/User';
import { Rhythm, TetherStatus } from '../../types/enums';
import notificationService from './notification.service';

class NotificationScheduler {
  private jobs: any[] = [];

  start(): void {
    this.scheduleExpiringReminders();
    this.scheduleGentleReminders();
    this.schedulePendingNotifications();
    this.scheduleRetryFailed();
    console.log('Notification scheduler started');
  }

  stop(): void {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('Notification scheduler stopped');
  }

  private scheduleExpiringReminders(): void {
    const job = schedule('0 * * * *', async () => {
      try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const expiringTethers = await Tether.find({
          status: { $in: [TetherStatus.ACTIVE, TetherStatus.WAITING_FOR_PARTNER] },
          expiresAt: {
            $gte: oneHourFromNow,
            $lte: twoHoursFromNow,
          },
        }).populate('coupleId');

        for (const tether of expiringTethers) {
          const couple = tether.coupleId as any;
          if (!couple) continue;

          const hoursRemaining = Math.ceil(
            (tether.expiresAt.getTime() - now.getTime()) / (60 * 60 * 1000)
          );

          const existingNotification = await Notification.findOne({
            tetherId: tether._id,
            type: 'question_expiring',
            status: { $in: [NotificationStatus.SENT, NotificationStatus.PENDING] },
          }).lean();

          if (!existingNotification && couple._id) {
            await notificationService.sendQuestionExpiringNotification(
              couple._id.toString(),
              tether._id.toString(),
              hoursRemaining
            );
          }
        }
      } catch (error) {
        console.error('Error in expiring reminders scheduler:', error);
      }
    });

    this.jobs.push(job);
  }

  private scheduleGentleReminders(): void {
    const job = schedule('0 9,18 * * *', async () => {
      try {
        const couples = await Couple.find({ status: 'active' })
          .populate('user1Id user2Id')
          .lean();

        for (const couple of couples) {
          const user1 = couple.user1Id as any;
          const user2 = couple.user2Id as any;

          if (!user1 || !user2) continue;

          const rhythm = user1.onboardingData?.rhythm || user2.onboardingData?.rhythm;
          if (!rhythm) continue;

          const shouldSend = this.shouldSendGentleReminder(rhythm, new Date());
          if (!shouldSend) continue;

          const lastTether = await Tether.findOne({
            coupleId: couple._id,
            status: TetherStatus.BOTH_ANSWERED,
          })
          .sort({ droppedAt: -1 })
          .lean();

          if (lastTether) {
            const daysSinceLastTether = Math.floor(
              (Date.now() - new Date(lastTether.droppedAt).getTime()) / (24 * 60 * 60 * 1000)
            );

            if (this.shouldRemindBasedOnRhythm(rhythm, daysSinceLastTether)) {
              await notificationService.sendGentleReminder(
                couple._id.toString(),
                rhythm
              );
            }
          }
        }
      } catch (error) {
        console.error('Error in gentle reminders scheduler:', error);
      }
    });

    this.jobs.push(job);
  }

  private schedulePendingNotifications(): void {
    const job = schedule('*/5 * * * *', async () => {
      try {
        const now = new Date();
        const pendingNotifications = await Notification.find({
          status: NotificationStatus.PENDING,
          scheduledFor: { $lte: now },
        }).limit(50);

        for (const notification of pendingNotifications) {
          if (!notification.deviceToken) continue;
          if (notification.platform === 'web') continue;

          const result = await notificationService['deliverNotification'](
            notification,
            notification.deviceToken,
            notification.platform as 'ios' | 'android'
          );

          if (result.success) {
            notification.status = NotificationStatus.SENT;
            notification.sentAt = new Date();
          } else {
            notification.status = NotificationStatus.FAILED;
            notification.errorMessage = result.error;
            notification.retryCount = 1;
          }

          await notification.save();
        }
      } catch (error) {
        console.error('Error in pending notifications scheduler:', error);
      }
    });

    this.jobs.push(job);
  }

  private scheduleRetryFailed(): void {
    const job = schedule('0 */6 * * *', async () => {
      try {
        await notificationService.retryFailedNotifications();
      } catch (error) {
        console.error('Error in retry failed scheduler:', error);
      }
    });

    this.jobs.push(job);
  }

  private shouldSendGentleReminder(rhythm: Rhythm, date: Date): boolean {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    switch (rhythm) {
      case Rhythm.EVERY_DAY:
        return hour === 9 || hour === 18;
      case Rhythm.FEW_TIMES_WEEK:
        return (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) && hour === 18;
      case Rhythm.ONCE_WEEK:
        return dayOfWeek === 0 && hour === 18;
      case Rhythm.DECIDE_AS_GO:
        return false;
      default:
        return false;
    }
  }

  private shouldRemindBasedOnRhythm(rhythm: Rhythm, daysSince: number): boolean {
    switch (rhythm) {
      case Rhythm.EVERY_DAY:
        return daysSince >= 1;
      case Rhythm.FEW_TIMES_WEEK:
        return daysSince >= 2;
      case Rhythm.ONCE_WEEK:
        return daysSince >= 6;
      default:
        return false;
    }
  }
}

export default new NotificationScheduler();
