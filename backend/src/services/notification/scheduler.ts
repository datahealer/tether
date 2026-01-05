import { schedule } from 'node-cron';
import {CoupleQuestionState} from '../../models/CoupleQuestionState';
import Question from '../../models/Question';
import Couple from '../../models/Couple';
import User from '../../models/User';
import { Rhythm } from '../../types/enums';
import notificationService from './notification.service';

class NotificationScheduler {
  private jobs: any[] = [];

  start(): void {
    this.scheduleExpiringReminders();
    this.scheduleGentleReminders();
    this.scheduleRetryFailed();
    console.log('Notification scheduler started');
  }

  stop(): void {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('Notification scheduler stopped');
  }

  /**
   * Send reminders 1-2 hours before tether expires
   */
  private scheduleExpiringReminders(): void {
    const job = schedule('0 * * * *', async () => {
      try {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const expiringStates = await CoupleQuestionState.find({
          state: { $in: ['served', 'waiting_for_partner'] },
          expiryTimestamp: {
            $gte: oneHourFromNow,
            $lte: twoHoursFromNow,
          },
        }).populate('coupleId');

        for (const state of expiringStates) {
          const couple = state.coupleId as any;
          if (!couple?._id) continue;

          if (!state.expiryTimestamp) continue;
          const hoursRemaining = Math.ceil(
            (state.expiryTimestamp.getTime() - now.getTime()) / (60 * 60 * 1000)
          );

          // Avoid duplicate notifications
          // (You can add a flag in state if needed, or just send once per expiry window)
          await notificationService.sendQuestionExpiringNotification(
            couple._id.toString(),
            state._id.toString(),
            hoursRemaining
          );
        }
      } catch (error) {
        console.error('Error in expiring reminders scheduler:', error);
      }
    });

    this.jobs.push(job);
  }

  /**
   * Gentle reminders based on rhythm and inactivity
   */
  private scheduleGentleReminders(): void {
    const job = schedule('0 9,18 * * *', async () => {
      try {
        const couples = await Couple.find({ status: 'active' })
          .populate('user1Id user2Id');

        for (const couple of couples) {
          const user1 = couple.user1Id as any;
          const user2 = couple.user2Id as any;

          if (!user1 || !user2) continue;

          const rhythm = user1.onboardingData?.rhythm || user2.onboardingData?.rhythm || Rhythm.EVERY_DAY;

          const shouldSend = this.shouldSendGentleReminder(rhythm, new Date());
          if (!shouldSend) continue;

          // Find last completed tether
          const lastCompleted = await CoupleQuestionState.findOne({
            coupleId: couple._id,
            state: 'completed',
          })
            .sort({ updatedAt: -1 });

          if (lastCompleted) {
            const daysSince = Math.floor(
              (Date.now() - lastCompleted.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
            );

            if (this.shouldRemindBasedOnRhythm(rhythm, daysSince)) {
              await notificationService.sendGentleReminder(couple._id.toString(), rhythm);
            }
          } else {
            // No completed tethers yet — maybe send a welcome nudge?
            await notificationService.sendGentleReminder(couple._id.toString(), rhythm);
          }
        }
      } catch (error) {
        console.error('Error in gentle reminders scheduler:', error);
      }
    });

    this.jobs.push(job);
  }

  /**
   * Retry failed notifications every 6 hours
   */
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
