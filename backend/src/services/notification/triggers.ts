import notificationService from './notification.service';
import { NotificationType } from '../../models/Notification';
import {CoupleQuestionState} from '../../models/CoupleQuestionState';
import Question from '../../models/Question';
import Couple from '../../models/Couple';
import User from '../../models/User';

export class NotificationTriggers {
  /**
   * Triggered when a user answers a tether
   * @param questionStateId - The _id of the CoupleQuestionState document
   */
  static async onTetherAnswered(questionStateId: string): Promise<void> {
    try {
      const questionState = await CoupleQuestionState.findById(questionStateId)
        .populate<{ coupleId: any }>('coupleId');

      if (!questionState || questionState.answers.length < 1) return;

      // Only notify when FIRST answer is submitted (so partner knows to answer)
      if (questionState.answers.length !== 1) return;

      const question = await Question.findOne({ questionId: questionState.questionId });
      if (!question) return;

      const couple = questionState.coupleId;
      if (!couple) return;

      // Find who just answered (first in answers array)
      const answererUserId = questionState.answers[0].userId;
      const answerer = await User.findById(answererUserId);
      const responderName = answerer?.name || 'Your partner';

      // Find the other partner (who hasn't answered yet)
      const otherUserId =
        couple.user1Id.toString() === answererUserId.toString()
          ? couple.user2Id
          : couple.user1Id;

      if (!otherUserId) return;

      await notificationService.sendNotification({
        userId: otherUserId.toString(),
        type: NotificationType.PARTNER_ANSWERED,
        title: `${responderName} answered! 💬`,
        body: 'Your partner has responded to the tether. Share your thoughts too!',
        data: {
          type: 'PARTNER_ANSWERED',
          categoryId: questionState.categoryId,
          questionId: questionState.questionId,
          route: '/home/category-question',
        },
      });

      console.log(`✅ Sent PARTNER_ANSWERED notification to user ${otherUserId}`);
    } catch (error) {
      console.error('❌ Error in onTetherAnswered trigger:', error);
    }
  }

  /**
   * When a new tether is dropped
   */
  static async onTetherCreated(coupleId: string, questionStateId: string): Promise<void> {
    try {
      const questionState = await CoupleQuestionState.findById(questionStateId);
      if (!questionState) return;

      const question = await Question.findOne({ questionId: questionState.questionId });
      if (!question) return;

      await notificationService.sendToCouple(
        coupleId,
        NotificationType.NEW_TETHER,
        () => ({
          title: 'New Tether Available! 💬',
          body: question.question.substring(0, 100) + (question.question.length > 100 ? '...' : ''),
          data: { categoryId: questionState.categoryId },
        })
      );
    } catch (error) {
      console.error('Error sending new tether notification:', error);
    }
  }

  /**
   * When couple is formed
   */
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

  /**
   * Milestone achieved
   */
  static async onMilestone(userId: string, milestone: string, data?: Record<string, any>): Promise<void> {
    try {
      await notificationService.sendMilestoneNotification(userId, milestone, data);
    } catch (error) {
      console.error('Error sending milestone notification:', error);
    }
  }

  /**
   * When both partners have answered a tether
   */
  static async onBothAnswered(questionStateId: string): Promise<void> {
    try {
      const questionState = await CoupleQuestionState.findById(questionStateId)
        .populate<{ coupleId: any }>('coupleId');

      if (!questionState || questionState.answers.length !== 2) return;

      const couple = questionState.coupleId;
      if (!couple) return;

      const question = await Question.findOne({ questionId: questionState.questionId });
      if (!question) return;

      // Notify both partners that they've both completed the tether
      await notificationService.sendToCouple(
        couple._id.toString(),
        NotificationType.BOTH_ANSWERED,
        () => ({
          title: 'Tether Complete! 🎉',
          body: 'You both answered! Tap to see what your partner said.',
          data: {
            type: 'BOTH_ANSWERED',
            categoryId: questionState.categoryId,
            questionId: questionState.questionId,
            route: '/home/category-question',
          },
        })
      );

      console.log(`✅ Sent BOTH_ANSWERED notification for question ${questionState.questionId}`);
    } catch (error) {
      console.error('❌ Error in onBothAnswered trigger:', error);
    }
  }
}