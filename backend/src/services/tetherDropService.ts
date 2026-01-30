/**
 * Tether Drop Service
 * 
 * Implements the core tether drop logic as per documentation:
 * - Interval-based timing anchored to Last_Tether_Drop
 * - 1 live tether per unlocked category per cycle
 * - Rhythm-based intervals: 24h (daily), 72h (twice weekly), 168h (weekly)
 * - Per-cycle refresh pools (1 for free, 3 for premium)
 * - First answer locks all other tethers in the cycle
 * - Expired tethers go to 14-day cooldown pool
 */

import mongoose from 'mongoose';
import { Tether } from '../models/Tether';
import Couple, { ICouple } from '../models/Couple';
import { UserEntitlement } from '../models/UserEntitlement';
import { CoupleCategoryState } from '../models/CoupleCategoryState';
import { CoupleQuestionState } from '../models/CoupleQuestionState';
import { QuestionServiceEngine } from './questionService';
import { Rhythm, TetherStatus, SubscriptionTier, CategoryId } from '../types/enums';
import { ITether } from '../types/interfaces';

// Rhythm interval mapping (in milliseconds)
export const RHYTHM_INTERVALS: Record<Rhythm, number> = {
  [Rhythm.EVERY_DAY]: 24 * 60 * 60 * 1000, // 24 hours
  [Rhythm.FEW_TIMES_WEEK]: 72 * 60 * 60 * 1000, // 72 hours (twice weekly)
  [Rhythm.ONCE_WEEK]: 168 * 60 * 60 * 1000, // 168 hours (7 days)
  [Rhythm.DECIDE_AS_GO]: 24 * 60 * 60 * 1000, // Default to daily
};

// Refresh allowances per tier
const REFRESH_ALLOWANCES: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 1,
  [SubscriptionTier.TRIAL]: 3,
  [SubscriptionTier.PREMIUM]: 3,
};

// Cooldown period for recycling questions (14 days in ms)
const COOLDOWN_PERIOD = 14 * 24 * 60 * 60 * 1000;

export class TetherDropService {
  /**
   * Main scheduler: Check all active couples and drop tethers if needed
   * Called by cron job every hour
   */
  static async processAllCouples(): Promise<void> {
    console.log('[TetherDropService] Starting tether drop check for all couples...');
    
    try {
      const activeCouples = await Couple.find({ status: 'active' });
      console.log(`[TetherDropService] Found ${activeCouples.length} active couples`);
      
      let droppedCount = 0;
      let skippedCount = 0;
      
      for (const couple of activeCouples) {
        try {
          const dropped = await this.checkAndDropTethers(couple._id);
          if (dropped) {
            droppedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`[TetherDropService] Error processing couple ${couple._id}:`, error);
        }
      }
      
      console.log(`[TetherDropService] Completed: ${droppedCount} dropped, ${skippedCount} skipped`);
    } catch (error) {
      console.error('[TetherDropService] Error in processAllCouples:', error);
      throw error;
    }
  }

  /**
   * Check if a couple needs new tethers and drop them if so
   * Returns true if tethers were dropped, false if not time yet
   */
  static async checkAndDropTethers(coupleId: mongoose.Types.ObjectId): Promise<boolean> {
    const couple = await Couple.findById(coupleId).populate('user1Id user2Id');
    if (!couple) {
      throw new Error(`Couple ${coupleId} not found`);
    }

    const now = new Date();
    const rhythmInterval = RHYTHM_INTERVALS[couple.rhythm || Rhythm.EVERY_DAY];
    
    // Calculate time since last drop
    const lastDrop = couple.lastTetherDrop || couple.createdAt;
    const timeSinceLastDrop = now.getTime() - lastDrop.getTime();
    
    console.log(`[TetherDropService] Couple ${coupleId}:`);
    console.log(`  - Rhythm: ${couple.rhythm} (${rhythmInterval / (60 * 60 * 1000)}h interval)`);
    console.log(`  - Last drop: ${lastDrop.toISOString()}`);
    console.log(`  - Time since: ${(timeSinceLastDrop / (60 * 60 * 1000)).toFixed(1)}h`);
    
    // Check if it's time for new drop (interval-based timing)
    if (timeSinceLastDrop < rhythmInterval) {
      console.log(`[TetherDropService] Not time yet - ${((rhythmInterval - timeSinceLastDrop) / (60 * 60 * 1000)).toFixed(1)}h remaining`);
      return false;
    }
    
    // Time to drop new tethers!
    await this.dropTetherCycle(couple);
    return true;
  }

  /**
   * Drop a new cycle of tethers for a couple
   * Creates 1 live tether per unlocked category
   */
  private static async dropTetherCycle(couple: ICouple): Promise<void> {
    const coupleId = couple._id;
    const now = new Date();
    const rhythmInterval = RHYTHM_INTERVALS[couple.rhythm || Rhythm.EVERY_DAY];
    const expiresAt = new Date(now.getTime() + rhythmInterval);
    
    console.log(`[TetherDropService] 🎯 Dropping new tether cycle for couple ${coupleId}`);
    
    // Get unlocked categories for this couple
    const unlockedCategories = await this.getUnlockedCategories(coupleId);
    console.log(`[TetherDropService] Found ${unlockedCategories.length} unlocked categories:`, unlockedCategories);
    
    // Determine refresh allowance based on subscription tier
    const tier = await this.getCoupleSubscriptionTier(couple);
    const defaultRefreshes = REFRESH_ALLOWANCES[tier];
    console.log(`[TetherDropService] Tier: ${tier}, Default refreshes: ${defaultRefreshes}`);
    
    let tetherCount = 0;
    
    for (const categoryId of unlockedCategories) {
      try {
        // Select next question for this category
        const question = await QuestionServiceEngine.selectNextQuestion(coupleId, categoryId);
        
        if (!question) {
          console.log(`[TetherDropService] ⚠️ No available question for category ${categoryId}`);
          continue;
        }
        
        // Create tether record
        const tether = await Tether.create({
          coupleId,
          categoryId,
          questionId: question.questionId,
          question: question,
          status: TetherStatus.ACTIVE,
          droppedAt: now,
          expiresAt,
          answers: [],
          refreshed: false,
          defaultRefreshes, // Per-cycle refresh pool
        });
        
        console.log(`[TetherDropService] ✅ Created tether for ${categoryId}: ${question.questionId}`);
        tetherCount++;
        
        // Send notification to both partners
        try {
          const { NotificationTriggers } = await import('./notification/triggers');
          await NotificationTriggers.onTetherCreated(
            coupleId.toString(),
            tether._id.toString()
          );
        } catch (notifError) {
          console.error('[TetherDropService] Notification error:', notifError);
        }
        
      } catch (error) {
        console.error(`[TetherDropService] Error creating tether for ${categoryId}:`, error);
      }
    }
    
    // Update Last_Tether_Drop timestamp
    couple.lastTetherDrop = now;
    couple.sharedData.lastTetherDate = now;
    await couple.save();
    
    console.log(`[TetherDropService] 🎉 Dropped ${tetherCount} tethers, expires at ${expiresAt.toISOString()}`);
  }

  /**
   * Get unlocked categories for a couple based on their subscription tier
   */
  private static async getUnlockedCategories(coupleId: mongoose.Types.ObjectId): Promise<CategoryId[]> {
    const categoryStates = await CoupleCategoryState.find({
      coupleId,
      unlocked: true,
      $or: [
        { unlockExpiry: { $exists: false } }, // Permanent unlocks
        { unlockExpiry: null },
        { unlockExpiry: { $gt: new Date() } }, // Active temporary unlocks
      ],
    });
    
    return categoryStates.map(cs => cs.categoryId as CategoryId);
  }

  /**
   * Determine the subscription tier for a couple (highest tier between partners)
   */
  private static async getCoupleSubscriptionTier(couple: ICouple): Promise<SubscriptionTier> {
    const user1Entitlement = await UserEntitlement.findOne({ userId: couple.user1Id });
    const user2Entitlement = await UserEntitlement.findOne({ userId: couple.user2Id });
    
    const tier1 = (user1Entitlement?.tier || SubscriptionTier.FREE) as SubscriptionTier;
    const tier2 = (user2Entitlement?.tier || SubscriptionTier.FREE) as SubscriptionTier;
    
    // Return highest tier (Premium > Trial > Free)
    const tierPriority: Record<SubscriptionTier, number> = {
      [SubscriptionTier.PREMIUM]: 3,
      [SubscriptionTier.TRIAL]: 2,
      [SubscriptionTier.FREE]: 1,
    };
    
    return tierPriority[tier1] >= tierPriority[tier2] ? tier1 : tier2;
  }

  /**
   * Handle first answer submission - locks all other tethers in the cycle
   */
  static async handleFirstAnswer(
    tetherId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    answer: string
  ): Promise<void> {
    const tether = await Tether.findById(tetherId);
    if (!tether) {
      throw new Error('Tether not found');
    }
    
    if (tether.status !== TetherStatus.ACTIVE) {
      throw new Error('Tether is not active');
    }
    
    if (tether.answers.length > 0) {
      throw new Error('First answer already submitted');
    }
    
    console.log(`[TetherDropService] 🔒 First answer submitted for tether ${tetherId}`);
    
    // Record the answer
    tether.answers.push({
      userId,
      answer,
      answeredAt: new Date(),
    });
    tether.status = TetherStatus.WAITING_FOR_PARTNER;
    tether.firstResponderUserId = userId;
    tether.defaultRefreshes = 0; // Lock refreshes - can't refresh after first answer
    await tether.save();
    
    // CRITICAL: Clear all other active tethers for this couple in this cycle
    const clearedResult = await Tether.updateMany(
      {
        coupleId: tether.coupleId,
        status: TetherStatus.ACTIVE,
        _id: { $ne: tetherId }, // Don't touch the current tether
      },
      {
        $set: {
          status: TetherStatus.EXPIRED,
          clearedBy: 'first_answer',
        },
      }
    );
    
    console.log(`[TetherDropService] ✅ Cleared ${clearedResult.modifiedCount} other active tethers`);
    
    // Send notification to partner
    try {
      const { NotificationTriggers } = await import('./notification/triggers');
      // Use tether ID as the notification trigger
      await NotificationTriggers.onTetherAnswered(tetherId.toString());
    } catch (notifError) {
      console.error('[TetherDropService] Notification error:', notifError);
    }
  }

  /**
   * Handle second answer submission - completes the tether
   */
  static async handleSecondAnswer(
    tetherId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    answer: string
  ): Promise<{ milestones?: any[] }> {
    const tether = await Tether.findById(tetherId);
    if (!tether) {
      throw new Error('Tether not found');
    }
    
    if (tether.status !== TetherStatus.WAITING_FOR_PARTNER) {
      throw new Error('Invalid tether status for second answer');
    }
    
    if (tether.answers.length !== 1) {
      throw new Error('Invalid answer state');
    }
    
    // Check if this user already answered
    if (tether.answers[0].userId.toString() === userId.toString()) {
      throw new Error('You already answered this tether');
    }
    
    console.log(`[TetherDropService] ✨ Second answer submitted for tether ${tetherId}`);
    
    // Record the answer
    tether.answers.push({
      userId,
      answer,
      answeredAt: new Date(),
    });
    tether.status = TetherStatus.BOTH_ANSWERED;
    await tether.save();
    
    // Update couple stats and check for milestones
    const milestones = await this.updateCoupleStats(tether.coupleId, tether.expiresAt);
    
    // Update category progress
    await CoupleCategoryState.findOneAndUpdate(
      { coupleId: tether.coupleId, categoryId: tether.categoryId },
      {
        $inc: { answeredCount: 1 },
        lastActivityAt: new Date(),
      }
    );
    
    console.log(`[TetherDropService] 🎉 Tether completed! Milestones: ${milestones.length}`);
    
    return { milestones: milestones.length > 0 ? milestones : undefined };
  }

  /**
   * Update couple statistics when a tether is completed
   */
  private static async updateCoupleStats(
    coupleId: mongoose.Types.ObjectId,
    expiryTimestamp: Date
  ): Promise<any[]> {
    const couple = await Couple.findById(coupleId);
    if (!couple) return [];

    // Ensure sharedData exists
    if (!couple.sharedData) {
      couple.sharedData = {
        currentStreak: 0,
        totalTethersCompleted: 0,
        milestoneRecords: [],
        permanentRefreshBalance: 0,
        refreshesUsedThisCycle: 0,
        lastRefreshCycleReset: new Date(),
      };
    }

    // Increment total completed
    couple.sharedData.totalTethersCompleted += 1;

    // Update streak (only if answered before expiry)
    const now = new Date();
    if (now <= expiryTimestamp) {
      couple.sharedData.currentStreak += 1;
    }

    // Check for milestone achievements
    const milestones: any[] = [];
    const totalCompleted = couple.sharedData.totalTethersCompleted;
    const MILESTONE_COUNTS = [5, 10, 25, 50, 100];

    for (const count of MILESTONE_COUNTS) {
      if (totalCompleted === count) {
        const existing = couple.sharedData.milestoneRecords.find(m => m.count === count);
        if (!existing) {
          couple.sharedData.milestoneRecords.push({
            count,
            achievedAt: new Date(),
            notified: false,
          });
          milestones.push({ count, achievedAt: new Date() });
          console.log(`[TetherDropService] 🏆 Milestone achieved: ${count} tethers!`);
        }
      }
    }

    await couple.save();
    return milestones;
  }

  /**
   * Refresh a question before any answer is submitted
   * Uses per-cycle refreshes first, then permanent pool
   */
  static async refreshQuestion(
    tetherId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<{
    newQuestion: any;
    cycleRefreshesRemaining: number;
    permanentRefreshesRemaining: number;
    usedPermanent: boolean;
  }> {
    const tether = await Tether.findById(tetherId).populate('coupleId');
    if (!tether) {
      throw new Error('Tether not found');
    }
    
    if (tether.status !== TetherStatus.ACTIVE) {
      throw new Error('Can only refresh active tethers');
    }
    
    if (tether.answers.length > 0) {
      throw new Error('Cannot refresh after first answer');
    }
    
    const couple = tether.coupleId as any;
    let usedPermanent = false;
    
    // Check refresh availability
    if (tether.defaultRefreshes > 0) {
      // Use per-cycle refresh
      tether.defaultRefreshes--;
      console.log(`[TetherDropService] Used cycle refresh. Remaining: ${tether.defaultRefreshes}`);
    } else if (couple.sharedData.permanentRefreshBalance > 0) {
      // Use permanent refresh
      couple.sharedData.permanentRefreshBalance--;
      usedPermanent = true;
      await couple.save();
      console.log(`[TetherDropService] Used permanent refresh. Balance: ${couple.sharedData.permanentRefreshBalance}`);
    } else {
      throw new Error('No refreshes remaining');
    }
    
    // Mark old question as skipped (14-day cooldown)
    await CoupleQuestionState.findOneAndUpdate(
      { coupleId: couple._id, questionId: tether.questionId },
      {
        $set: {
          skippedViaRefresh: true,
          cooldownEnd: new Date(Date.now() + COOLDOWN_PERIOD),
        },
      },
      { upsert: true }
    );
    
    // Select new question
    const newQuestion = await QuestionServiceEngine.selectNextQuestion(
      couple._id,
      tether.categoryId as CategoryId
    );
    
    if (!newQuestion) {
      throw new Error('No available questions for refresh');
    }
    
    // Update tether with new question
    tether.questionId = newQuestion.questionId;
    tether.question = newQuestion as any;
    tether.refreshed = true;
    await tether.save();
    
    console.log(`[TetherDropService] 🔄 Refreshed to new question: ${newQuestion.questionId}`);
    
    return {
      newQuestion,
      cycleRefreshesRemaining: tether.defaultRefreshes,
      permanentRefreshesRemaining: couple.sharedData.permanentRefreshBalance,
      usedPermanent,
    };
  }

  /**
   * Handle expired tethers (cron job)
   * Moves unanswered/partially-answered tethers to cooldown
   */
  static async handleExpiredTethers(): Promise<void> {
    const now = new Date();
    
    const expiredTethers = await Tether.find({
      status: { $in: [TetherStatus.ACTIVE, TetherStatus.WAITING_FOR_PARTNER] },
      expiresAt: { $lte: now },
    });
    
    console.log(`[TetherDropService] Found ${expiredTethers.length} expired tethers`);
    
    for (const tether of expiredTethers) {
      if (tether.answers.length === 1) {
        // First responder answered, second didn't
        tether.status = TetherStatus.UNANSWERED_EXPIRED;
        tether.clearedBy = 'expiry';
      } else if (tether.answers.length === 0) {
        // Nobody answered
        tether.status = TetherStatus.EXPIRED;
        tether.clearedBy = 'expiry';
      }
      
      await tether.save();
      
      // Add to cooldown pool
      await CoupleQuestionState.findOneAndUpdate(
        { coupleId: tether.coupleId, questionId: tether.questionId },
        {
          $set: {
            expiredWithoutBothAnswers: true,
            cooldownEnd: new Date(now.getTime() + COOLDOWN_PERIOD),
          },
        },
        { upsert: true }
      );
    }
    
    console.log(`[TetherDropService] ✅ Processed ${expiredTethers.length} expired tethers`);
  }

  /**
   * Get active tethers for a couple with refresh info
   */
  static async getActiveTethers(
    coupleId: mongoose.Types.ObjectId
  ): Promise<{
    tethers: ITether[];
    refreshes: {
      cycleRefreshesRemaining: number;
      permanentRefreshBalance: number;
    };
  }> {
    const tethers = await Tether.find({
      coupleId,
      status: { $in: [TetherStatus.ACTIVE, TetherStatus.WAITING_FOR_PARTNER] },
    }).sort({ droppedAt: -1 });
    
    const couple = await Couple.findById(coupleId);
    const permanentBalance = couple?.sharedData?.permanentRefreshBalance || 0;
    
    // Calculate cycle refreshes (sum of all active tethers' defaultRefreshes)
    const cycleRefreshes = tethers.reduce((sum, t) => sum + (t.defaultRefreshes || 0), 0);
    
    return {
      tethers,
      refreshes: {
        cycleRefreshesRemaining: cycleRefreshes,
        permanentRefreshBalance: permanentBalance,
      },
    };
  }

  /**
   * Add permanent refreshes to a couple (from purchase)
   */
  static async addPermanentRefreshes(
    coupleId: mongoose.Types.ObjectId,
    count: number
  ): Promise<void> {
    await Couple.findByIdAndUpdate(coupleId, {
      $inc: { 'sharedData.permanentRefreshBalance': count },
    });
    
    console.log(`[TetherDropService] Added ${count} permanent refreshes to couple ${coupleId}`);
  }
}
