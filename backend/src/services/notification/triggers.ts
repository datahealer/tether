import notificationService from './notification.service';
import { NotificationType } from '../../models/Notification';
import {CoupleQuestionState} from '../../models/CoupleQuestionState';
import Question from '../../models/Question';
import Couple from '../../models/Couple';
import User from '../../models/User';
import mongoose from 'mongoose';

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
          question: question.question,
          categoryName: questionState.categoryId,
          partnerAnswer: questionState.answers[0].text,
          expiresAt: questionState.expiryTimestamp?.toISOString(),
          route: '/onboarding/first-tether',
        },
      });

      console.log(`✅ Sent PARTNER_ANSWERED notification to user ${otherUserId}`);
    } catch (error) {
      console.error('❌ Error in onTetherAnswered trigger:', error);
    }
  }

  /**
   * When a new tether is dropped (DEPRECATED - use onCycleDropped instead)
   * @deprecated This method sent per-question notifications which violates the design.
   * Use onCycleDropped for batch cycle notifications.
   */
  static async onTetherCreated(coupleId: string, questionStateId: string): Promise<void> {
    console.warn('[NotificationTriggers] onTetherCreated is deprecated. Use onCycleDropped for batch notifications.');
    // Kept for backward compatibility but should not be called
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
          data: {
            type: 'NEW_TETHER',
            categoryId: questionState.categoryId,
            questionId: questionState.questionId,
            route: '/home/category-question',
          },
        })
      );
    } catch (error) {
      console.error('Error sending new tether notification:', error);
    }
  }

  /**
   * When a new cycle drops (batch of tethers)
   * Sends ONE notification for the cycle drop event, not per-question
   * Aligned with developerhelp.md Section 9: "new tether available" is a cycle event
   */
  static async onCycleDropped(
    coupleId: string,
    tetherCount: number,
    categoryIds: string[]
  ): Promise<void> {
    try {
      const couple = await Couple.findById(coupleId);
      if (!couple) return;

      // Determine notification copy based on count
      const title = tetherCount === 1 
        ? 'Your tether is ready! 💬'
        : `${tetherCount} tethers ready! 💬`;
        
      const body = tetherCount === 1
        ? 'A new question is waiting—pull on the line together!'
        : 'New questions are waiting—time to connect!';

      await notificationService.sendToCouple(
        coupleId,
        NotificationType.NEW_TETHER,
        () => ({
          title,
          body,
          data: {
            type: 'NEW_TETHER',
            tetherCount,
            categoryIds,
            route: '/home/category-packs', // Deep link to category packs, not specific question
          },
        })
      );

      console.log(`✅ Sent cycle notification for ${tetherCount} tethers to couple ${coupleId}`);
    } catch (error) {
      console.error('❌ Error in onCycleDropped trigger:', error);
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

  /**
   * Triggered when a user adds an emoji reaction to a tether
   * @param coupleId - The couple's ID
   * @param userId - The user who added the reaction
   * @param emoji - The emoji that was added
   */
  static async onReactionAdded(
    coupleId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    emoji: string
  ): Promise<void> {
    try {
      const couple = await Couple.findById(coupleId);
      if (!couple) return;

      const user = await User.findById(userId);
      const userName = user?.name || 'Your partner';

      // Find the other partner
      const otherUserId =
        couple.user1Id.toString() === userId.toString()
          ? couple.user2Id
          : couple.user1Id;

      if (!otherUserId) return;

      await notificationService.sendNotification({
        userId: otherUserId.toString(),
        type: NotificationType.REACTION_ADDED,
        title: `${userName} reacted ${emoji}`,
        body: `${userName} added a reaction to your tether!`,
        data: {
          type: 'REACTION_ADDED',
          emoji,
          route: '/home/tether-history',
        },
      });

      console.log(`✅ Sent REACTION_ADDED notification: ${emoji}`);
    } catch (error) {
      console.error('❌ Error in onReactionAdded trigger:', error);
    }
  }

  /**
   * Triggered when a solo mode question expires (partner not linked)
   * @param userId - The solo user's ID
   * @param questionStateId - The question state ID that expired
   */
  static async onSoloQuestionExpired(
    userId: mongoose.Types.ObjectId,
    questionStateId: string
  ): Promise<void> {
    try {
      const questionState = await CoupleQuestionState.findById(questionStateId);
      if (!questionState) return;

      const question = await Question.findOne({ questionId: questionState.questionId });
      if (!question) return;

      await notificationService.sendNotification({
        userId: userId.toString(),
        type: NotificationType.GENTLE_REMINDER,
        title: '⏰ Question Expired - Partner Not Linked',
        body: 'Your question expired because your partner hasn\'t joined yet. Invite them to complete tethers together!',
        data: {
          type: 'SOLO_QUESTION_EXPIRED',
          questionId: questionState.questionId,
          categoryId: question.categoryId,
          route: '/onboarding/partner-invite',
        },
      });

      console.log(`✅ Sent SOLO_QUESTION_EXPIRED notification to user ${userId}`);
    } catch (error) {
      console.error('❌ Error in onSoloQuestionExpired trigger:', error);
    }
  }
}