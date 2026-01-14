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
  /**
   * Calculate category relevance score based on union of both partners' onboarding data
   * Uses weighted scoring algorithm to determine best fit categories
   */
  private static calculateCategoryScore(
    categoryId: CategoryId,
    coupleProfile: {
      goals: string[];
      livingType: string[];
      emotionalNeeds: string[];
      relationshipStage?: string;
    }
  ): number {
    let score = 0;

    // Goal-to-Category mapping with weights (use normalized lowercase keys)
    const goalCategoryMap: Record<string, { categoryId: CategoryId; weight: number }[]> = {
      'communication': [
        { categoryId: CategoryId.COMMUNICATION, weight: 10 },
        { categoryId: CategoryId.CONFLICT, weight: 3 },
      ],
      'intimacy': [
        { categoryId: CategoryId.INTIMACY, weight: 10 },
        { categoryId: CategoryId.EROTIC, weight: 5 },
        { categoryId: CategoryId.VULNERABILITY, weight: 4 },
      ],
      'trust': [
        { categoryId: CategoryId.TRUST, weight: 10 },
        { categoryId: CategoryId.VULNERABILITY, weight: 5 },
      ],
      'playfulness': [
        { categoryId: CategoryId.PLAYFULNESS, weight: 10 },
        { categoryId: CategoryId.GRATITUDE, weight: 3 },
      ],
      'vulnerability': [
        { categoryId: CategoryId.VULNERABILITY, weight: 10 },
        { categoryId: CategoryId.INTIMACY, weight: 4 },
      ],
      'future': [
        { categoryId: CategoryId.FUTURE, weight: 10 },
        { categoryId: CategoryId.TRUST, weight: 3 },
      ],
      'gratitude': [
        { categoryId: CategoryId.GRATITUDE, weight: 10 },
        { categoryId: CategoryId.PLAYFULNESS, weight: 3 },
      ],
      'conflict': [
        { categoryId: CategoryId.CONFLICT, weight: 10 },
        { categoryId: CategoryId.COMMUNICATION, weight: 5 },
      ],
      'love_languages': [
        { categoryId: CategoryId.LOVE_LANGUAGES, weight: 10 },
        { categoryId: CategoryId.INTIMACY, weight: 3 },
      ],
      'spark': [
        { categoryId: CategoryId.PLAYFULNESS, weight: 8 },
        { categoryId: CategoryId.EROTIC, weight: 6 },
        { categoryId: CategoryId.INTIMACY, weight: 4 },
      ],
    };

    // Emotional Need-to-Category mapping (use normalized lowercase keys)
    const emotionalNeedCategoryMap: Record<string, { categoryId: CategoryId; weight: number }[]> = {
      'love_security': [
        { categoryId: CategoryId.TRUST, weight: 6 },
        { categoryId: CategoryId.INTIMACY, weight: 5 },
      ],
      'recognition': [
        { categoryId: CategoryId.GRATITUDE, weight: 7 },
        { categoryId: CategoryId.COMMUNICATION, weight: 4 },
      ],
      'autonomy': [
        { categoryId: CategoryId.TRUST, weight: 5 },
        { categoryId: CategoryId.CONFLICT, weight: 4 },
      ],
      'growth': [
        { categoryId: CategoryId.FUTURE, weight: 7 },
        { categoryId: CategoryId.VULNERABILITY, weight: 4 },
      ],
      'play': [
        { categoryId: CategoryId.PLAYFULNESS, weight: 8 },
        { categoryId: CategoryId.GRATITUDE, weight: 3 },
      ],
      'belonging': [
        { categoryId: CategoryId.INTIMACY, weight: 6 },
        { categoryId: CategoryId.LOVE_LANGUAGES, weight: 5 },
      ],
    };

    // LivingType-to-Category mapping (use normalized lowercase keys)
    const livingTypeCategoryMap: Record<string, { categoryId: CategoryId; weight: number }[]> = {
      'apart_long_distance': [
        { categoryId: CategoryId.COMMUNICATION, weight: 5 },
        { categoryId: CategoryId.TRUST, weight: 4 },
      ],
      'together': [
        { categoryId: CategoryId.PLAYFULNESS, weight: 3 },
        { categoryId: CategoryId.INTIMACY, weight: 3 },
      ],
      'kids': [
        { categoryId: CategoryId.PLAYFULNESS, weight: 6 },
        { categoryId: CategoryId.GRATITUDE, weight: 5 },
        { categoryId: CategoryId.COMMUNICATION, weight: 4 },
      ],
      'no_kids': [
        { categoryId: CategoryId.FUTURE, weight: 3 },
      ],
    };

    // Calculate score from goals (highest weight)
    for (const goal of coupleProfile.goals) {
      const normalizedGoal = goal.toLowerCase().replace(/\s+/g, '_');
      const mappings = goalCategoryMap[normalizedGoal];
      if (mappings) {
        for (const mapping of mappings) {
          if (mapping.categoryId === categoryId) {
            score += mapping.weight;
          }
        }
      }
    }

    // Calculate score from emotional needs
    for (const need of coupleProfile.emotionalNeeds) {
      const normalizedNeed = need.toLowerCase().replace(/\s+/g, '_');
      const mappings = emotionalNeedCategoryMap[normalizedNeed];
      if (mappings) {
        for (const mapping of mappings) {
          if (mapping.categoryId === categoryId) {
            score += mapping.weight;
          }
        }
      }
    }

    // Calculate score from living type
    for (const living of coupleProfile.livingType) {
      const normalizedLiving = living.toLowerCase().replace(/\s+/g, '_').replace(/,/g, '');
      const mappings = livingTypeCategoryMap[normalizedLiving];
      if (mappings) {
        for (const mapping of mappings) {
          if (mapping.categoryId === categoryId) {
            score += mapping.weight;
          }
        }
      }
    }

    return score;
  }

  /**
   * Normalize onboarding data values to match enum keys
   */
  private static normalizeOnboardingData(data: string[]): string[] {
    return data
      .map(item => {
        // Remove JSON wrapper if present
        if (item.startsWith('{')) {
          try {
            const parsed = JSON.parse(item);
            return parsed.attribution || parsed.value || item;
          } catch {
            return item;
          }
        }
        return item;
      })
      .map(item => {
        // Normalize to lowercase with underscores
        const normalized = item.toLowerCase().trim();
        
        // Map common UI values to enum values
        const mappings: Record<string, string> = {
          'spark': 'spark',
          'connection': 'communication',
          'communication': 'communication',
          'fun': 'playfulness',
          'playfulness': 'playfulness',
          'intimacy': 'intimacy',
          'trust': 'trust',
          'vulnerability': 'vulnerability',
          'future': 'future',
          'gratitude': 'gratitude',
          'conflict': 'conflict',
          'love languages': 'love_languages',
          'love_languages': 'love_languages',
          // Living types
          'long distance': 'apart_long_distance',
          'apart, long distance': 'apart_long_distance',
          'together': 'together',
          'kids': 'kids',
          'no kids': 'no_kids',
          // Emotional needs
          'love & security': 'love_security',
          'love and security': 'love_security',
          'recognition': 'recognition',
          'autonomy': 'autonomy',
          'growth': 'growth',
          'play': 'play',
          'belonging': 'belonging',
        };
        
        return mappings[normalized] || normalized;
      })
      .filter(item => item && item.length > 0);
  }

  /**
   * Determine which 2 categories to unlock for free tier based on scoring algorithm
   */
  private static determineFreeCategoriesForCouple(couple: any): string[] {
    const user1 = couple.user1Id;
    const user2 = couple.user2Id;

    // Create union of all onboarding data from both partners
    const rawGoals = [
      ...(user1?.onboardingData?.goals || []),
      ...(user2?.onboardingData?.goals || []),
    ];
    const rawLivingTypes = [
      ...(user1?.onboardingData?.livingType || []),
      ...(user2?.onboardingData?.livingType || []),
    ];
    const rawEmotionalNeeds = [
      ...(user1?.onboardingData?.emotionalNeeds || []),
      ...(user2?.onboardingData?.emotionalNeeds || []),
    ];

    // Normalize and remove duplicates
    const uniqueGoals = [...new Set(this.normalizeOnboardingData(rawGoals))];
    const uniqueLivingTypes = [...new Set(this.normalizeOnboardingData(rawLivingTypes))];
    const uniqueEmotionalNeeds = [...new Set(this.normalizeOnboardingData(rawEmotionalNeeds))];

    const coupleProfile = {
      goals: uniqueGoals,
      livingType: uniqueLivingTypes,
      emotionalNeeds: uniqueEmotionalNeeds,
      relationshipStage: user1?.onboardingData?.relationshipStatus || user2?.onboardingData?.relationshipStatus,
    };

    console.log('Couple Profile for Category Selection:', JSON.stringify(coupleProfile, null, 2));

    // Calculate scores for all categories
    const categoryScores: Array<{ categoryId: CategoryId; score: number }> = [];

    for (const categoryId of Object.values(CategoryId)) {
      const score = this.calculateCategoryScore(categoryId, coupleProfile);
      categoryScores.push({ categoryId, score });
    }

    // Sort by score descending
    categoryScores.sort((a, b) => b.score - a.score);

    console.log('Category Scores:', JSON.stringify(categoryScores, null, 2));

    // Select top 2 categories
    const topCategories = categoryScores.slice(0, 2).map(cs => cs.categoryId);

    // Fallback to Communication + Intimacy if no scores
    if (categoryScores[0].score === 0 && categoryScores[1].score === 0) {
      console.log('No onboarding data matched - defaulting to Communication + Intimacy');
      return [CategoryId.COMMUNICATION, CategoryId.INTIMACY];
    }

    console.log(`Top 2 categories selected: ${topCategories.join(', ')}`);
    return topCategories;
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
   * Uses comprehensive scoring across all onboarding dimensions
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

    // Living type match (Weight: 5 points per match)
    const livingTypeMatches = question.livingType.filter((lt) =>
      coupleProfile.livingType.includes(lt)
    );
    score += livingTypeMatches.length * 5;

    // Goal tag match (Weight: 8 points per match - highest priority)
    const goalMatches = question.goalTag.filter((g) =>
      coupleProfile.goals.includes(g)
    );
    score += goalMatches.length * 8;

    // Emotional need match (Weight: 6 points per match)
    const emotionalMatches = question.emotionalNeed.filter((en) =>
      coupleProfile.emotionalNeeds.includes(en)
    );
    score += emotionalMatches.length * 6;

    // Relationship stage match (Weight: 4 points)
    if (
      coupleProfile.relationshipStage &&
      question.relationshipStage.includes(coupleProfile.relationshipStage as any)
    ) {
      score += 4;
    }

    // Bonus: Questions that match multiple dimensions get an extra boost
    const dimensionsMatched = 
      (livingTypeMatches.length > 0 ? 1 : 0) +
      (goalMatches.length > 0 ? 1 : 0) +
      (emotionalMatches.length > 0 ? 1 : 0) +
      (coupleProfile.relationshipStage && question.relationshipStage.includes(coupleProfile.relationshipStage as any) ? 1 : 0);
    
    if (dimensionsMatched >= 3) {
      score += 5; // Multi-dimensional match bonus
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

    // Log top 5 scored questions for debugging
    console.log(`  📊 Top 5 scored questions for ${categoryId}:`);
    scoredQuestions.slice(0, 5).forEach((sq, idx) => {
      console.log(`     ${idx + 1}. Score: ${sq.score} - Q: ${sq.question.questionId}`);
    });

    // Return top personalized question (convert to plain object)
    const topQuestion = await Question.findById(scoredQuestions[0].question._id);
    console.log(`  ✅ Selected question ${topQuestion?.questionId} with score ${scoredQuestions[0].score}`);
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
    const isFirstAnswer = questionState.answers.length === 1;
    const isBothAnswered = questionState.answers.length === 2;

    // FIRST ANSWER: Clear all other live tethers for this cycle
    if (isFirstAnswer) {
      console.log(`🔒 First answer submitted - clearing other live tethers for couple ${coupleId}`);
      await CoupleQuestionState.updateMany(
        {
          coupleId,
          state: QuestionState.SERVED,
          questionId: { $ne: questionId }, // Don't touch the current question
        },
        {
          $set: {
            state: QuestionState.UNANSWERED_EXPIRED,
            cooldownEnd: new Date(Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000),
          },
        }
      );
      console.log('✅ Cleared other live tethers - locked into current question');
    }

    // Update state
    if (isBothAnswered) {
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

      // BOTH ANSWERED: Immediately drop new tethers (UX optimization)
      console.log('🎉 Both partners answered - immediately dropping new tethers');
      try {
        await this.dropTethersForCouple(coupleId, true); // force = true bypasses rhythm check
        console.log('✅ New tethers dropped successfully');
      } catch (dropError) {
        console.error('⚠️ Failed to drop new tethers after completion:', dropError);
        // Don't fail the whole request if tether drop fails
      }
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

    // Ensure sharedData is initialized
    if (!couple.sharedData) {
      couple.sharedData = {
        currentStreak: 0,
        totalTethersCompleted: 0,
        milestoneRecords: [],
        permanentRefreshBalance: 0,
      };
      console.log('⚠️ Initialized missing sharedData for couple:', coupleId);
    }

    const now = new Date();
    const bothAnsweredBeforeExpiry = now <= expiryTimestamp;

    // Update total completed
    couple.sharedData.totalTethersCompleted += 1;
    
    // Update streak (per documentation: streak only increments if answered before expiry)
    // "If either partner does not answer before expiry, the tether is marked as missed 
    // and the streak remains unchanged. The streak is not reset to zero by missed tethers."
    if (bothAnsweredBeforeExpiry) {
      couple.sharedData.currentStreak += 1;
      console.log('✅ Streak incremented:', {
        coupleId,
        currentStreak: couple.sharedData.currentStreak,
        totalCompleted: couple.sharedData.totalTethersCompleted,
      });
    } else {
      console.log('⏰ Completed after expiry - streak unchanged:', {
        coupleId,
        currentStreak: couple.sharedData.currentStreak,
        totalCompleted: couple.sharedData.totalTethersCompleted,
      });
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
   * Uses cycle refreshes first (FREE: 1, PREMIUM: 3), then permanent refresh balance
   */
static async skipQuestion(
  coupleId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  questionId: string
): Promise<{ 
  newQuestion?: any; 
  cycleRefreshesRemaining: number;
  permanentRefreshesRemaining: number;
  usedPermanent: boolean;
}> {
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

    // Get couple and entitlement
    const couple = await Couple.findById(coupleId).session(session);
    if (!couple) {
      throw new Error('Couple not found');
    }

    const entitlement = await UserEntitlement.findOne({ userId }).session(session);
    if (!entitlement) {
      throw new Error('No entitlement found');
    }

    // Calculate max cycle refreshes (FREE: 1, PREMIUM/TRIAL: 3)
    const maxCycleRefreshes = entitlement.getRefreshesForCycle();

    // Count couple's skips today (shared refreshes)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const skipsToday = await CoupleQuestionState.countDocuments({
      coupleId,
      state: QuestionState.SKIPPED_REFRESH,
      updatedAt: { $gte: today },
    }).session(session);

    const cycleRefreshesRemaining = Math.max(0, maxCycleRefreshes - skipsToday);
    const permanentRefreshBalance = couple.sharedData?.permanentRefreshBalance || 0;
    let usedPermanent = false;

    // Check if we have any refreshes available
    if (cycleRefreshesRemaining === 0 && permanentRefreshBalance === 0) {
      throw new Error('No refreshes remaining');
    }

    // Use cycle refresh first, then permanent if needed
    if (cycleRefreshesRemaining === 0 && permanentRefreshBalance > 0) {
      // Decrement permanent refresh balance
      couple.sharedData.permanentRefreshBalance -= 1;
      await couple.save({ session });
      usedPermanent = true;
    }

    // Mark as skipped
    if (!questionState.skippedBy) questionState.skippedBy = [];
    if (!questionState.skippedBy.includes(userId)) {
      questionState.skippedBy.push(userId);
    }

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
      const rhythmHours = RHYTHM_HOURS[couple.rhythm || Rhythm.EVERY_DAY];
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

    // Calculate remaining refreshes after this skip
    const finalCycleRemaining = usedPermanent 
      ? 0 
      : Math.max(0, maxCycleRefreshes - (skipsToday + 1));
    const finalPermanentRemaining = usedPermanent 
      ? permanentRefreshBalance - 1 
      : permanentRefreshBalance;

    return {
      newQuestion: newQuestionData,
      cycleRefreshesRemaining: finalCycleRemaining,
      permanentRefreshesRemaining: finalPermanentRemaining,
      usedPermanent,
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
   * Returns tethers + refresh availability (cycle + permanent)
   */
static async getActiveTethers(
  coupleId: mongoose.Types.ObjectId, 
  userId?: mongoose.Types.ObjectId
): Promise<{
  tethers: any[];
  refreshes: {
    cycleRefreshesRemaining: number;
    permanentRefreshBalance: number;
    maxCycleRefreshes: number;
  };
}> {
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

    // Determine which answer belongs to the current user vs partner
    let userAnswer = null;
    let partnerAnswer = null;
    let answeredAt = null;

    if (userId) {
      const userIdStr = userId.toString();
      const userAnswerObj = state.answers.find((a: any) => a.userId.toString() === userIdStr);
      const partnerAnswerObj = state.answers.find((a: any) => a.userId.toString() !== userIdStr);
      
      userAnswer = userAnswerObj?.text || null;
      partnerAnswer = partnerAnswerObj?.text || null;
      answeredAt = userAnswerObj?.timestamp?.toISOString() || partnerAnswerObj?.timestamp?.toISOString();
    } else {
      // Fallback to old behavior if userId not provided
      const firstAnswer = state.answers[0];
      const secondAnswer = state.answers[1];
      userAnswer = firstAnswer?.text;
      partnerAnswer = secondAnswer?.text;
      answeredAt = firstAnswer?.timestamp?.toISOString() || secondAnswer?.timestamp?.toISOString();
    }

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
      userAnswer,
      partnerAnswer,
      answeredAt,
    });
  }

  // Calculate refresh availability
  const couple = await Couple.findById(coupleId);
  const permanentRefreshBalance = couple?.sharedData?.permanentRefreshBalance || 0;

  let maxCycleRefreshes = 1; // Default for free users
  let cycleRefreshesRemaining = 0;

  if (userId) {
    const entitlement = await UserEntitlement.findOne({ userId });
    if (entitlement) {
      maxCycleRefreshes = entitlement.getRefreshesForCycle(); // FREE: 1, PREMIUM: 3
    }

    // Count couple's skips today (shared between both partners)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const skipsToday = await CoupleQuestionState.countDocuments({
      coupleId,
      state: QuestionState.SKIPPED_REFRESH,
      updatedAt: { $gte: today },
    });

    cycleRefreshesRemaining = Math.max(0, maxCycleRefreshes - skipsToday);
  }

  return {
    tethers,
    refreshes: {
      cycleRefreshesRemaining,
      permanentRefreshBalance,
      maxCycleRefreshes,
    },
  };
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
