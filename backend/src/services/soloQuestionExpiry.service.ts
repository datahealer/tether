/**
 * Solo Question Expiry Service
 * Handles automatic expiration of questions answered only by solo mode users
 */

import Couple from '../models/Couple';
import {CoupleQuestionState} from '../models/CoupleQuestionState';

export class SoloQuestionExpiryService {
  /**
   * Expire questions answered solo after 24 hours
   * Run this as a cron job every hour
   */
  static async expireSoloQuestions(): Promise<void> {
    console.log('🧹 Checking for expired solo questions...');

    try {
      const now = new Date();

      // Find all active solo mode couples
      const soloCouples = await Couple.find({
        isSoloMode: true,
        status: 'active',
      }).lean();

      console.log(`Found ${soloCouples.length} active solo couples`);

      let totalExpired = 0;

      for (const couple of soloCouples) {
        // Find questions with:
        // - Only 1 answer (solo user answered)
        // - State is SERVED (still active)
        // - Expired (past expiresAt date)
        const expiredQuestions = await CoupleQuestionState.find({
          coupleId: couple._id,
          state: 'SERVED',
          expiresAt: { $lt: now },
        });

        for (const question of expiredQuestions) {
          // Check if only 1 answer exists
          if (question.answers.length === 1) {
            console.log(
              `⏰ Expiring solo question ${question.questionId} for couple ${couple._id}`
            );

            // Mark as expired
            question.state = 'UNANSWERED_EXPIRED';
            await question.save();

            totalExpired++;

            // Send notification to solo user
            try {
              const { NotificationTriggers } = await import('./notification/triggers');
              await NotificationTriggers.onSoloQuestionExpired(
                couple.soloUserId!,
                question._id.toString()
              );
            } catch (notifError) {
              console.error('Failed to send solo expiry notification:', notifError);
            }
          } else if (question.answers.length === 0) {
            // No answers at all - mark as unanswered expired
            console.log(
              `⏰ Expiring unanswered question ${question.questionId} for couple ${couple._id}`
            );
            question.state = 'UNANSWERED_EXPIRED';
            await question.save();
            totalExpired++;
          }
        }
      }

      console.log(`✅ Expired ${totalExpired} solo questions`);
    } catch (error) {
      console.error('❌ Error in solo question expiry service:', error);
      throw error;
    }
  }
}
