import mongoose from 'mongoose';
import Question from '../models/Question';
import { CoupleQuestionState } from '../models/CoupleQuestionState';
import { CoupleCategoryState } from '../models/CoupleCategoryState';
import {Category } from '../models/Category'
import { UserEntitlement } from '../models/UserEntitlement';
import Couple from '../models/Couple';
import User from '../models/User';
import {
  QuestionState,
  CategoryId,
  Rhythm,
  Tier,
  LivingType,
  GoalTag,
  EmotionalNeed,
} from '../types/enums';
import { IQuestion, ICoupleCategoryState } from '../types/interfaces';

import notificationService from './notification/notification.service';
import { NotificationType } from '../models/Notification';

// Rhythm mapping to hours
export const RHYTHM_HOURS: Record<Rhythm, number> = {
  [Rhythm.EVERY_DAY]: 24,
  [Rhythm.FEW_TIMES_WEEK]: 72,
  [Rhythm.ONCE_WEEK]: 168,
  [Rhythm.DECIDE_AS_GO]: 24, // Default to daily
};

// Cooldown period for recycling questions (14 days)
const COOLDOWN_DAYS = 14;

// Milestone thresholds
const MILESTONE_COUNTS = [5, 10, 25, 50, 100];

export class QuestionServiceEngine {
  // static initializeCategoriesForCouple: any;
  // Add this method inside QuestionServiceEngine class
private static determineFreeCategoriesForCouple(couple: any): string[] {
  const user1 = couple.user1Id;
  const user2 = couple.user2Id;

  const allGoals = [
    ...(user1?.onboardingData?.goals || []),
    ...(user2?.onboardingData?.goals || []),
  ];
  const allLiving = [
    ...(user1?.onboardingData?.livingType || []),
    ...(user2?.onboardingData?.livingType || []),
  ];

  const goalCategoryMap: Record<string, string> = {
    [GoalTag.COMMUNICATION]: CategoryId.COMMUNICATION,
    [GoalTag.INTIMACY]: CategoryId.INTIMACY,
    [GoalTag.TRUST]: CategoryId.TRUST,
    [GoalTag.PLAYFULNESS]: CategoryId.PLAYFULNESS,
    [GoalTag.VULNERABILITY]: CategoryId.VULNERABILITY,
    [GoalTag.FUTURE]: CategoryId.FUTURE,
    [GoalTag.GRATITUDE]: CategoryId.GRATITUDE,
    [GoalTag.CONFLICT]: CategoryId.CONFLICT,
    [GoalTag.LOVE_LANGUAGES]: CategoryId.LOVE_LANGUAGES,
  };

  const unlocked: string[] = [];

  // First: unlock based on goals
  for (const goal of allGoals) {
    const catId = goalCategoryMap[goal];
    if (catId && !unlocked.includes(catId)) {
      unlocked.push(catId);
      break;
    }
  }

  // Second: kids → playfulness or gratitude
  if (allLiving.includes(LivingType.KIDS)) {
    if (!unlocked.includes(CategoryId.PLAYFULNESS)) {
      unlocked.push(CategoryId.PLAYFULNESS);
    } else if (!unlocked.includes(CategoryId.GRATITUDE)) {
      unlocked.push(CategoryId.GRATITUDE);
    }
  }

  // Fallback: default to Communication + Intimacy
  if (unlocked.length < 2) {
    if (!unlocked.includes(CategoryId.COMMUNICATION)) unlocked.push(CategoryId.COMMUNICATION);
    if (unlocked.length < 2 && !unlocked.includes(CategoryId.INTIMACY)) unlocked.push(CategoryId.INTIMACY);
  }

  return unlocked.slice(0, 2);
}

/**
 * Initialize categories for a new couple based on their onboarding data
 */
static async initializeCategoriesForCouple(coupleId: mongoose.Types.ObjectId): Promise<void> {
  console.log(`Initializing categories for couple: ${coupleId}`);

  const couple = await Couple.findById(coupleId).populate('user1Id user2Id');
  if (!couple) throw new Error('Couple not found');

  const user1 = await User.findById(couple.user1Id);
  const user2 = await User.findById(couple.user2Id);

  if (!user1 || !user2) throw new Error('One or both users not found');

  // Determine which 2 categories to unlock for free tier
  const unlockedCategoryIds = this.determineFreeCategoriesForCouple(couple);

  // Get all global categories
  const allCategories = await Category.find({});

  const categoryStates = allCategories.map((cat) => ({
    coupleId,
    categoryId: cat.categoryId,
    answeredCount: 0,
    totalQuestions: cat.totalQuestions || 180,
    skippedCount: 0,
    isComplete: false,
    unlocked: unlockedCategoryIds.includes(cat.categoryId),
    lastActivityAt: new Date(),
  }));

  await CoupleCategoryState.insertMany(categoryStates);

  console.log(`Initialized ${allCategories.length} categories for couple ${coupleId}`);
  console.log(`Free unlocked: ${unlockedCategoryIds.join(', ')}`);
}

// Fixed getCategoryProgress method

  /**
   * Get personalization weight for a question based on couple's profile
   */
  private static calculatePersonalizationScore(
    question: IQuestion,
    coupleProfile: {
      livingType: string[];
      goals: string[];
      emotionalNeeds: string[];
      relationshipStage?: string;
    }
  ): number {
    let score = 0;

    // Living type match
    const livingTypeMatches = question.livingType.filter((lt) =>
      coupleProfile.livingType.includes(lt)
    );
    score += livingTypeMatches.length * 3;

    // Goal tag match
    const goalMatches = question.goalTag.filter((g) =>
      coupleProfile.goals.includes(g)
    );
    score += goalMatches.length * 2;

    // Emotional need match
    const emotionalMatches = question.emotionalNeed.filter((en) =>
      coupleProfile.emotionalNeeds.includes(en)
    );
    score += emotionalMatches.length * 2;

    // Relationship stage match
    if (
      coupleProfile.relationshipStage &&
      question.relationshipStage.includes(coupleProfile.relationshipStage as any)
    ) {
      score += 1;
    }

    return score;
  }

  /**
   * Select next question for a couple from a specific category
   */
  static async selectNextQuestion(
    coupleId: mongoose.Types.ObjectId,
    categoryId: CategoryId
  ): Promise<IQuestion | null> {
    console.log(`  🔍 Selecting question for category: ${categoryId}`);
    
    // Check if category is unlocked
    const categoryState = await CoupleCategoryState.findOne({
      coupleId,
      categoryId,
    });

    if (!categoryState?.unlocked) {
      console.log(`  ⛔ Category ${categoryId} not unlocked`);
      throw new Error('Category not unlocked');
    }

    // Get couple profile for personalization
    const couple = await Couple.findById(coupleId).populate('user1Id user2Id');
    if (!couple) throw new Error('Couple not found');

    const user1 = await User.findById(couple.user1Id);
    const user2 = await User.findById(couple.user2Id);

    const coupleProfile = {
      livingType: [
        ...(user1?.onboardingData?.livingType || []),
        ...(user2?.onboardingData?.livingType || []),
      ],
      goals: [
        ...(user1?.onboardingData?.goals || []),
        ...(user2?.onboardingData?.goals || []),
      ],
      emotionalNeeds: [
        ...(user1?.onboardingData?.emotionalNeeds || []),
        ...(user2?.onboardingData?.emotionalNeeds || []),
      ],
      relationshipStage:
        user1?.onboardingData?.relationshipStatus ||
        user2?.onboardingData?.relationshipStatus,
    };

    // Get all questions in category
    const allQuestions = await Question.find({
      categoryId,
      status: 'Published',
    }).lean();

    console.log(`  📚 Found ${allQuestions.length} published questions in ${categoryId}`);

    // Get already served/completed questions
    const questionStates = await CoupleQuestionState.find({
      coupleId,
      categoryId,
    });

    const questionStateMap = new Map(
      questionStates.map((qs) => [qs.questionId, qs])
    );

    // Filter out questions still in cooldown
    const now = new Date();
    const availableQuestions = allQuestions.filter((q) => {
      const state = questionStateMap.get(q.questionId);
      if (!state) return true; // Unseen

      // Skip if still in cooldown
      if (state.cooldownEnd && state.cooldownEnd > now) {
        return false;
      }

      // Only include unseen or past-cooldown questions
      return (
        state.state === QuestionState.UNSEEN ||
        (state.cooldownEnd && state.cooldownEnd <= now)
      );
    });

    console.log(`  ✨ ${availableQuestions.length} available questions after filtering`);

    if (availableQuestions.length === 0) {
      console.log(`  ⚠️  No questions available for ${categoryId}`);
      return null; // No questions available
    }

    // Score and sort questions by personalization
    const scoredQuestions = availableQuestions.map((q) => ({
      question: q,
      score: this.calculatePersonalizationScore(q as unknown as IQuestion, coupleProfile),
    }));

    scoredQuestions.sort((a, b) => b.score - a.score);

    // Return top personalized question (convert to plain object)
    const topQuestion = await Question.findById(scoredQuestions[0].question._id);
    return topQuestion;
  }

  /**
   * Drop tethers for all unlocked categories based on rhythm
   */
  static async dropTethersForCouple(
  coupleId: mongoose.Types.ObjectId,
  force: boolean = false // ✅ Add force parameter
): Promise<void> {
  console.log(`🎯 Starting tether drop for couple: ${coupleId}`);
  
  const couple = await Couple.findById(coupleId);
  if (!couple) {
    throw new Error('Couple not found');
  }

  // Check rhythm interval (skip if force = true)
  if (!force) {
    const rhythmHours = RHYTHM_HOURS[couple.rhythm || Rhythm.EVERY_DAY];
    const hoursSinceLastDrop = couple.lastTetherDrop
      ? (Date.now() - couple.lastTetherDrop.getTime()) / (1000 * 60 * 60)
      : Infinity;

    console.log(`⏰ Hours since last drop: ${hoursSinceLastDrop}, Rhythm: ${rhythmHours}`);

    if (hoursSinceLastDrop < rhythmHours) {
      console.log('⏸️  Not time to drop yet');
      return;
    }
  } else {
    console.log('⚡ FORCE MODE: Bypassing rhythm check');
  }
    // Get unlocked categories
    const unlockedCategories = await CoupleCategoryState.find({
      coupleId,
      unlocked: true,
    });

    console.log(`🔓 Found ${unlockedCategories.length} unlocked categories:`, 
      unlockedCategories.map(c => c.categoryId));

    // Drop one tether per unlocked category
    let droppedCount = 0;
    for (const catState of unlockedCategories) {
      console.log(`\n📦 Processing category: ${catState.categoryId}`);
      
      const question = await this.selectNextQuestion(coupleId, catState.categoryId);
      
      if (!question) {
        console.log(`❌ No question available for ${catState.categoryId}`);
        continue;
      }

      console.log(`✅ Selected question: ${question.questionId} - "${question.question}"`);

      const rhythmHours = RHYTHM_HOURS[couple.rhythm || Rhythm.EVERY_DAY];
      const expiryTimestamp = new Date(Date.now() + rhythmHours * 60 * 60 * 1000);

      // Create/update question state
      const createdState = await CoupleQuestionState.findOneAndUpdate(
        { coupleId, questionId: question.questionId },
        {
          categoryId: catState.categoryId,
          state: QuestionState.SERVED,
          servedDate: new Date(),
          expiryTimestamp,
          poolOrder: Date.now(),
        },
        { upsert: true, new: true }
      );
      
      console.log(`💾 Created/updated state for ${question.questionId}:`, {
        state: createdState.state,
        categoryId: createdState.categoryId,
        servedDate: createdState.servedDate,
      });
      
      // Send notification to both partners
      try {
        const { NotificationTriggers } = await import('./notification/triggers');
        await NotificationTriggers.onTetherCreated(
          coupleId.toString(),
          createdState._id.toString()
        );
        console.log(`📲 Sent NEW_TETHER notification for ${question.questionId}`);
      } catch (notifError) {
        console.error('Error sending new tether notification:', notifError);
      }
      
      droppedCount++;
    }

    console.log(`\n🎉 Successfully dropped ${droppedCount} tethers`);

    // Update lastTetherDrop
    await Couple.findByIdAndUpdate(coupleId, { lastTetherDrop: new Date() });
  }

  /**
   * Handle answer submission
   */
  static async submitAnswer(
    coupleId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    questionId: string,
    answerText: string
  ): Promise<{
    state: string;
    userAnswer?: string;
    partnerAnswer?: string;
    milestones?: any[];
  }> {
    const questionState = await CoupleQuestionState.findOne({
      coupleId,
      questionId,
    });

    if (!questionState) {
      throw new Error('Question not found for this couple');
    }

    // Check if already answered by this user
    const alreadyAnswered = questionState.answers.some(
      (a) => a.userId.toString() === userId.toString()
    );
    if (alreadyAnswered) {
      throw new Error('Already answered this question');
    }

    // Add answer
    questionState.answers.push({
      userId,
      text: answerText,
      timestamp: new Date(),
    });

    let milestones: any[] = [];

    // Update state
    if (questionState.answers.length === 2) {
      // Both answered
      questionState.state = QuestionState.COMPLETED;
      questionState.cooldownEnd = new Date(
        Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000
      );

      // Update category progress
      await CoupleCategoryState.findOneAndUpdate(
        { coupleId, categoryId: questionState.categoryId },
        {
          $inc: { answeredCount: 1 },
          lastActivityAt: new Date(),
        }
      );

      // Update couple stats and check for streak/milestone
      milestones = await this.updateCoupleStats(coupleId, questionState.expiryTimestamp!);
    } else {
      questionState.state = QuestionState.WAITING_FOR_PARTNER;
    }

    await questionState.save();

    // Return state information
    const userAnswer = questionState.answers.find(
      (a) => a.userId.toString() === userId.toString()
    );
    const partnerAnswer = questionState.answers.find(
      (a) => a.userId.toString() !== userId.toString()
    );

    return {
      state: questionState.state,
      userAnswer: userAnswer?.text,
      partnerAnswer: partnerAnswer?.text,
      milestones: milestones.length > 0 ? milestones : undefined,
    };
  }

  /**
   * Update couple stats (streak, milestones, total completed)
   */
  private static async updateCoupleStats(
    coupleId: mongoose.Types.ObjectId,
    expiryTimestamp: Date
  ): Promise<any[]> {
    const couple = await Couple.findById(coupleId);
    if (!couple) return [];

    const now = new Date();
    const bothAnsweredBeforeExpiry = now <= expiryTimestamp;

    // Update total completed
    couple.sharedData.totalTethersCompleted += 1;

    // Update streak
    if (bothAnsweredBeforeExpiry) {
      couple.sharedData.currentStreak += 1;
    } else {
      couple.sharedData.currentStreak = 1; // Reset but count this one
    }

    couple.sharedData.lastTetherDate = now;

    const achievedMilestones: any[] = [];

    // Check milestones
    const totalCompleted = couple.sharedData.totalTethersCompleted;
    for (const milestoneCount of MILESTONE_COUNTS) {
      if (totalCompleted === milestoneCount) {
        const existing = couple.sharedData.milestoneRecords.find(
          (m) => m.count === milestoneCount
        );
        if (!existing) {
          const milestone = {
            count: milestoneCount,
            achievedAt: now,
            message: `Amazing! You've completed ${milestoneCount} tethers together! 🎉`,
            notified: false,
          };
          couple.sharedData.milestoneRecords.push(milestone);
          achievedMilestones.push(milestone);
        }
      }
    }

    await couple.save();
    
    // Send milestone notifications
    if (achievedMilestones.length > 0) {
      try {
        const { NotificationTriggers } = await import('./notification/triggers');
        const user1 = couple.user1Id;
        const user2 = couple.user2Id;
        
        for (const milestone of achievedMilestones) {
          if (user1) {
            await NotificationTriggers.onMilestone(
              user1.toString(),
              milestone.message,
              { count: milestone.count, type: 'tether_milestone' }
            );
          }
          if (user2) {
            await NotificationTriggers.onMilestone(
              user2.toString(),
              milestone.message,
              { count: milestone.count, type: 'tether_milestone' }
            );
          }
          console.log(`🏆 Sent milestone notification for ${milestone.count} tethers`);
        }
      } catch (notifError) {
        console.error('Error sending milestone notifications:', notifError);
      }
    }
    
    return achievedMilestones;
  }

  /**
   * Skip/refresh a question
   */
static async skipQuestion(
  coupleId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  questionId: string
): Promise<{ newQuestion?: any; refreshesRemaining: number }> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find current question state
    const questionState = await CoupleQuestionState.findOne({
      coupleId,
      questionId,
    }).session(session);

    if (!questionState) {
      throw new Error('Question not found');
    }

    // Check if already skipped or answered
    if (questionState.state !== QuestionState.SERVED) {
      throw new Error('Cannot skip this question');
    }

    // Get user's entitlement
    const entitlement = await UserEntitlement.findOne({ userId }).session(session);
    if (!entitlement) {
      throw new Error('No entitlement found');
    }

    // Calculate max refreshes
    const maxRefreshes = entitlement.getRefreshesForCycle();

    // Count user's skips today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const skipsToday = await CoupleQuestionState.countDocuments({
      coupleId,
      skippedBy: userId,
      updatedAt: { $gte: today },
    }).session(session);

    if (skipsToday >= maxRefreshes) {
      throw new Error('No refreshes remaining today');
    }

    // Mark as skipped by this user
    if (!questionState.skippedBy) questionState.skippedBy = [];
    if (!questionState.skippedBy.includes(userId)) {
      questionState.skippedBy.push(userId);
    }

    // Set to skipped_refresh (even on single skip)
    questionState.state = QuestionState.SKIPPED_REFRESH;
    questionState.cooldownEnd = new Date(Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    await questionState.save({ session });

    // Increment skippedCount for category
    await CoupleCategoryState.findOneAndUpdate(
      { coupleId, categoryId: questionState.categoryId },
      { $inc: { skippedCount: 1 } },
      { session }
    );

    // Drop new question in same category
    const newQuestion = await this.selectNextQuestion(coupleId, questionState.categoryId as CategoryId);
    
    let newQuestionData: any | undefined;
    if (newQuestion) {
      const couple = await Couple.findById(coupleId).session(session);
      const rhythmHours = RHYTHM_HOURS[couple?.rhythm || Rhythm.EVERY_DAY];
      const expiry = new Date(Date.now() + rhythmHours * 60 * 60 * 1000);

      const newState = await CoupleQuestionState.findOneAndUpdate(
        { coupleId, questionId: newQuestion.questionId },
        {
          categoryId: questionState.categoryId,
          state: QuestionState.SERVED,
          servedDate: new Date(),
          expiryTimestamp: expiry,
          poolOrder: Date.now(),
        },
        { upsert: true, new: true, session }
      );

      newQuestionData = {
        questionId: newQuestion.questionId,
        question: newQuestion.question,
        categoryId: questionState.categoryId,
        categoryName: (await Category.findOne({ categoryId: questionState.categoryId }))?.name,
        difficulty: newQuestion.difficulty,
        tone: newQuestion.tone,
        state: newState.state,
        servedAt: newState.servedDate?.toISOString(),
        expiresAt: newState.expiryTimestamp?.toISOString(),
      };
    }

    await session.commitTransaction();

    return {
      newQuestion: newQuestionData,
      refreshesRemaining: maxRefreshes - (skipsToday + 1),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
  /**
   * Handle expired questions
   */
  static async handleExpiredQuestions(): Promise<void> {
    const now = new Date();

    const expiredStates = await CoupleQuestionState.find({
      state: { $in: [QuestionState.SERVED, QuestionState.WAITING_FOR_PARTNER] },
      expiryTimestamp: { $lte: now },
    });

    for (const state of expiredStates) {
      if (state.answers.length === 1) {
        state.state = QuestionState.UNANSWERED_EXPIRED;
      } else {
        state.state = QuestionState.UNANSWERED_EXPIRED;
      }

      state.cooldownEnd = new Date(
        Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000
      );

      await state.save();
    }
  }

  /**
   * Unlock a category (premium feature or temporary pack)
   */
  static async unlockCategory(
    coupleId: mongoose.Types.ObjectId,
    categoryId: CategoryId,
    temporary: boolean = false,
    durationDays?: number
  ): Promise<void> {
    const updateData: any = {
      unlocked: true,
      lastActivityAt: new Date(),
    };

    if (temporary && durationDays) {
      updateData.unlockExpiry = new Date(
        Date.now() + durationDays * 24 * 60 * 60 * 1000
      );
    }

    await CoupleCategoryState.findOneAndUpdate(
      { coupleId, categoryId },
      updateData,
      { upsert: true }
    );
  }

  /**
   * Get current active tethers for a couple
   */
  /**
 * Get current active tethers for a couple
 */
static async getActiveTethers(coupleId: mongoose.Types.ObjectId) {
  const activeStates = await CoupleQuestionState.find({
    coupleId,
    state: { $in: [QuestionState.SERVED, QuestionState.WAITING_FOR_PARTNER] },
  })
    .sort({ servedDate: -1 })
    .populate('categoryId');

  // Dedup: keep only latest per category
  const categoryMap = new Map<string, any>();
  for (const state of activeStates) {
    const catId = state.categoryId?.toString() || state.categoryId;
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, state);
    }
  }

  const tethers = [];
  for (const state of categoryMap.values()) {
    const question = await Question.findOne({ questionId: state.questionId });
    if (!question) continue;

    const categoryDoc = state.categoryId as any;
    const categoryName = categoryDoc?.name || state.categoryId;

    const firstAnswer = state.answers[0];
    const secondAnswer = state.answers[1];

    tethers.push({
      questionId: question.questionId,
      question: question.question,
      categoryId: state.categoryId.toString(),
      categoryName,
      difficulty: question.difficulty,
      tone: question.tone,
      state: state.state,
      servedAt: state.servedDate?.toISOString(),
      expiresAt: state.expiryTimestamp?.toISOString(),
      userAnswer: firstAnswer?.text,
      partnerAnswer: secondAnswer?.text,
      answeredAt: firstAnswer?.timestamp?.toISOString() || secondAnswer?.timestamp?.toISOString(),
    });
  }

  return tethers;
}
  /**
   * Get category progress for a couple
   */
  // In QuestionServiceEngine.ts

static async getCategoryProgress(coupleId: mongoose.Types.ObjectId) {
  // Get all global categories
  const allCategories = await Category.find({});

  // Get current couple's category states
  let coupleStates = await CoupleCategoryState.find({ coupleId });

  const existingIds = new Set(coupleStates.map(s => s.categoryId));

  const missingCategories = allCategories.filter(cat => !existingIds.has(cat.categoryId));

  if (missingCategories.length > 0) {
    console.log(`Syncing ${missingCategories.length} missing categories for couple ${coupleId}`);

    const couple = await Couple.findById(coupleId).populate('user1Id user2Id');
    if (!couple) throw new Error('Couple not found');

    const unlockedIds = this.determineFreeCategoriesForCouple(couple);

    for (const cat of missingCategories) {
      await CoupleCategoryState.findOneAndUpdate(
        { coupleId, categoryId: cat.categoryId },
        {
          $setOnInsert: {
            answeredCount: 0,
            totalQuestions: cat.totalQuestions || 180,
            skippedCount: 0,
            isComplete: false,
            unlocked: unlockedIds.includes(cat.categoryId),
            lastActivityAt: new Date(),
          }
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    

    // Refresh coupleStates
    coupleStates = await CoupleCategoryState.find({ coupleId });
  }

  return coupleStates;
}
}
