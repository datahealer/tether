import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { QuestionServiceEngine } from '../services/questionService';
import { CategoryId, QuestionState, Rhythm } from '../types/enums';
import { UserEntitlement } from '../models/UserEntitlement';
import Couple from '../models/Couple';
import User from '../models/User';
import { Category } from '../models/Category';
import { NotificationTriggers } from '../services/notification/triggers';
import { CoupleQuestionState } from '../models/CoupleQuestionState';
import { RHYTHM_HOURS } from '../services/questionService';

/**
 * Get active tethers for the logged-in user's couple
 */
export const getActiveTethers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user?.coupleId) {
      return res.status(404).json({ message: 'Not in a couple' });
    }

    // Ensure categories are initialized
    let progress = await QuestionServiceEngine.getCategoryProgress(user.coupleId);
    if (!progress || progress.length === 0) {
      console.log('📚 Initializing categories for couple:', user.coupleId);
      await QuestionServiceEngine.initializeCategoriesForCouple(user.coupleId);
    }

    let tethers = await QuestionServiceEngine.getActiveTethers(user.coupleId);

    // Drop new tethers if none active
    if (tethers.length === 0) {
      console.log('🎯 No active tethers, dropping new ones');
      await QuestionServiceEngine.dropTethersForCouple(user.coupleId, true);
      tethers = await QuestionServiceEngine.getActiveTethers(user.coupleId);
    }

    const couple = await Couple.findById(user.coupleId);
    const stats = {
      totalAnswered: couple?.sharedData?.totalTethersCompleted || 0,
      currentStreak: couple?.sharedData?.currentStreak || 0,
      lastAnsweredDate: couple?.sharedData?.lastTetherDate?.toISOString(),
    };

    res.json({ success: true, tethers, stats });
  } catch (error: any) {
    console.error('Error getting active tethers:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get active tethers' });
  }
};

/**
 * Submit an answer
 */
/**
 * Submit an answer
 */
export const submitAnswer = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { questionId, answer } = req.body;
  
  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!questionId || !answer) return res.status(400).json({ message: 'questionId and answer required' });

    const user = await User.findById(userId);
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    // Get question state BEFORE submitting to know how many answers existed
    const questionStateBefore = await CoupleQuestionState.findOne({
      coupleId: user.coupleId,
      questionId,
    });

    if (!questionStateBefore) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answerCountBefore = questionStateBefore.answers.length;

    // Submit the answer
    const result = await QuestionServiceEngine.submitAnswer(
      user.coupleId,
      userId,
      questionId,
      answer
    );

    // Get the updated question state
    const questionStateAfter = await CoupleQuestionState.findOne({
      coupleId: user.coupleId,
      questionId,
    });

    if (!questionStateAfter) {
      return res.status(500).json({ message: 'Failed to retrieve updated question state' });
    }

    // Fire appropriate notification based on transition
    try {
      if (answerCountBefore === 0) {
        // First answer → notify the partner that you answered
        await NotificationTriggers.onTetherAnswered(questionStateAfter._id.toString());
        console.log('Triggered PARTNER_ANSWERED notification');
      } else if (answerCountBefore === 1) {
        // Second answer → both completed → notify both
        await NotificationTriggers.onBothAnswered(questionStateAfter._id.toString());
        console.log('Triggered BOTH_ANSWERED notification');
      }
    } catch (notificationError) {
      console.error('Failed to send answer notification:', notificationError);
      // Don't fail the whole request if notification fails
    }

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      state: result.state,
      partnerAnswer: result.partnerAnswer,
      milestones: result.milestones,
    });
  } catch (error: any) {
    console.error('Error submitting answer:', error);
    
    // Handle 'already answered' case gracefully
    if (error.message === 'Already answered this question') {
      try {
        // Fetch the existing answer to return to the user
        const user = await User.findById(userId);
        if (!user?.coupleId) {
          return res.status(404).json({ message: 'Not in a couple' });
        }
        
        const questionState = await CoupleQuestionState.findOne({
          coupleId: user.coupleId,
          questionId,
        });
        
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
        const userAnswer = questionState?.answers.find(
          (a) => a.userId.toString() === userId.toString()
        );
        
        const partnerAnswer = questionState?.answers.find(
          (a) => a.userId.toString() !== userId.toString()
        );
        
        return res.status(409).json({
          success: false,
          error: 'ALREADY_ANSWERED',
          message: 'You have already answered this question',
          data: {
            state: questionState?.state,
            userAnswer: userAnswer?.text,
            partnerAnswer: partnerAnswer?.text,
            answeredAt: userAnswer?.timestamp,
          },
        });
      } catch (fetchError) {
        console.error('Error fetching answer details:', fetchError);
        return res.status(409).json({
          success: false,
          error: 'ALREADY_ANSWERED',
          message: 'You have already answered this question',
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit answer',
    });
  }
};

/**
 * Skip/refresh a tether
 */
export const skipTether = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { questionId } = req.body;
  
  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!questionId) return res.status(400).json({ message: 'questionId required' });

    const user = await User.findById(userId);
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    const result = await QuestionServiceEngine.skipQuestion(user.coupleId, userId, questionId);

    if (result.newQuestion) {
      res.json({
        success: true,
        newQuestion: result.newQuestion,
        refreshesRemaining: result.refreshesRemaining,
        message: 'New question drawn!',
      });
    } else {
      res.json({
        success: true,
        refreshesRemaining: result.refreshesRemaining,
        message: 'No more questions available',
      });
    }
  } catch (error: any) {
    console.error('Skip tether error:', error);
    
    // Handle specific skip errors gracefully
    if (error.message === 'Cannot skip this question') {
      try {
        const user = await User.findById(userId);
        if (!user?.coupleId) {
          return res.status(404).json({ message: 'Not in a couple' });
        }
        
        // Get the question state to provide context
        const questionState = await CoupleQuestionState.findOne({
          coupleId: user.coupleId,
          questionId,
        });
        
        if (!questionState) {
          return res.status(404).json({
            success: false,
            error: 'QUESTION_NOT_FOUND',
            message: 'This question is no longer available',
          });
        }
        
        // Provide specific feedback based on state
        if (questionState.state === QuestionState.COMPLETED) {
          return res.status(409).json({
            success: false,
            error: 'ALREADY_COMPLETED',
            message: 'This question has already been answered by both of you',
            data: {
              state: questionState.state,
            },
          });
        } else if (questionState.state === QuestionState.WAITING_FOR_PARTNER) {
          return res.status(409).json({
            success: false,
            error: 'ALREADY_ANSWERED',
            message: 'You\'ve already answered this question. Waiting for your partner to respond.',
            data: {
              state: questionState.state,
            },
          });
        } else if (questionState.state === QuestionState.SKIPPED_REFRESH) {
          return res.status(409).json({
            success: false,
            error: 'ALREADY_SKIPPED',
            message: 'This question has already been skipped',
            data: {
              state: questionState.state,
            },
          });
        }
        
        // Generic fallback
        return res.status(409).json({
          success: false,
          error: 'CANNOT_SKIP',
          message: 'This question cannot be skipped at this time',
          data: {
            state: questionState.state,
          },
        });
      } catch (fetchError) {
        console.error('Error fetching skip details:', fetchError);
        return res.status(409).json({
          success: false,
          error: 'CANNOT_SKIP',
          message: 'This question cannot be skipped at this time',
        });
      }
    }
    
    // Handle no refreshes remaining
    if (error.message === 'No refreshes remaining today') {
      return res.status(429).json({
        success: false,
        error: 'NO_REFRESHES',
        message: 'You\'ve used all your refreshes for today',
        data: {
          refreshesRemaining: 0,
        },
      });
    }
    
    // Handle question not found
    if (error.message === 'Question not found') {
      return res.status(404).json({
        success: false,
        error: 'QUESTION_NOT_FOUND',
        message: 'This question is no longer available',
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to skip tether'
    });
  }
};

/**
 * Get category progress
 */
export const getCategoryProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    const coupleStates = await QuestionServiceEngine.getCategoryProgress(user.coupleId);

    const progressWithDetails = await Promise.all(
      coupleStates.map(async (state) => {
        const category = await Category.findOne({ categoryId: state.categoryId });
        return {
          coupleId: state.coupleId,
          categoryId: state.categoryId,
          categoryName: category?.name || state.categoryId,
          colorCode: category?.colorCode || '#CCCCCC',
          answeredCount: state.answeredCount,
          totalQuestions: state.totalQuestions,
          skippedCount: state.skippedCount,
          isComplete: state.isComplete,
          unlocked: state.unlocked,
          unlockExpiry: state.unlockExpiry,
          lastActivityAt: state.lastActivityAt,
        };
      })
    );

    res.json({ success: true, progress: progressWithDetails });
  } catch (error: any) {
    console.error('Error getting category progress:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get category progress' });
  }
};

/**
 * Unlock a category
 */
export const unlockCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { categoryId, temporary, durationDays } = req.body;
    if (!categoryId || !Object.values(CategoryId).includes(categoryId)) {
      return res.status(400).json({ message: 'Invalid categoryId' });
    }

    const user = await User.findById(userId);
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    const entitlement = await UserEntitlement.findOne({ userId });
    if (!entitlement) return res.status(403).json({ message: 'No entitlement found' });

    if (entitlement.tier !== 'PREMIUM' && !temporary) {
      return res.status(403).json({ message: 'Premium subscription required' });
    }

    await QuestionServiceEngine.unlockCategory(user.coupleId, categoryId, temporary, durationDays);

    res.json({ success: true, message: 'Category unlocked successfully' });
  } catch (error: any) {
    console.error('Error unlocking category:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to unlock category' });
  }
};

/**
 * Manual tether drop
 */
export const triggerTetherDrop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user || !user.coupleId) return res.status(400).json({ success: false, message: 'Not in a couple' });

    const force = req.query.force === 'true' || req.body.force === true;
    await QuestionServiceEngine.dropTethersForCouple(user.coupleId, force);

    res.json({
      success: true,
      message: force ? 'Tethers force-dropped successfully' : 'Tethers dropped successfully',
    });
  } catch (error: any) {
    console.error('Error triggering tether drop:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get couple stats
 */
export const getCoupleStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    const couple = await Couple.findById(user.coupleId);
    if (!couple) return res.status(404).json({ message: 'Couple not found' });

    // Ensure sharedData is initialized
    if (!couple.sharedData) {
      couple.sharedData = {
        currentStreak: 0,
        totalTethersCompleted: 0,
        milestoneRecords: [],
      };
      await couple.save();
      console.log('⚠️ Initialized missing sharedData for couple:', couple._id);
    }

    console.log('📊 Couple stats:', {
      coupleId: couple._id,
      totalCompleted: couple.sharedData.totalTethersCompleted,
      currentStreak: couple.sharedData.currentStreak,
    });

    res.json({
      success: true,
      stats: {
        currentStreak: couple.sharedData.currentStreak || 0,
        totalCompleted: couple.sharedData.totalTethersCompleted || 0,
        lastTetherDate: couple.sharedData.lastTetherDate,
        milestones: couple.sharedData.milestoneRecords || [],
        rhythm: couple.rhythm,
      },
    });
  } catch (error: any) {
    console.error('Error getting couple stats:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get couple stats' });
  }
};

/**
 * Initialize categories (manual)
 */
export const initializeCoupleCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user || !user.coupleId) return res.status(400).json({ message: 'Not in a couple' });

    await QuestionServiceEngine.initializeCategoriesForCouple(user.coupleId);

    res.json({ success: true, message: 'Categories initialized successfully' });
  } catch (error: any) {
    console.error('Error initializing categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get tether history (completed and expired tethers)
 */
export const getTetherHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    // Get completed tethers (where both partners answered)
    const completedTethers = await CoupleQuestionState.find({
      coupleId: user.coupleId,
      state: QuestionState.COMPLETED,
    })
      .sort({ 'answers.1.timestamp': -1 }) // Sort by when second partner answered (most recent first)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CoupleQuestionState.countDocuments({
      coupleId: user.coupleId,
      state: QuestionState.COMPLETED,
    });

    // Get question details and map to response format
    const history = await Promise.all(
      completedTethers.map(async (tether) => {
        const question = await mongoose.model('Question').findOne({ questionId: tether.questionId });
        const category = await Category.findOne({ categoryId: tether.categoryId });

        // Find user's answer and partner's answer
        const userAnswer = tether.answers.find(
          (a) => a.userId.toString() === userId.toString()
        );
        const partnerAnswer = tether.answers.find(
          (a) => a.userId.toString() !== userId.toString()
        );

        return {
          questionId: tether.questionId,
          question: question?.question || 'Question not found',
          categoryId: tether.categoryId,
          categoryName: category?.name || tether.categoryId,
          userAnswer: userAnswer?.text || '',
          partnerAnswer: partnerAnswer?.text || '',
          answeredAt: userAnswer?.timestamp?.toISOString() || new Date().toISOString(),
          partnerAnsweredAt: partnerAnswer?.timestamp?.toISOString() || new Date().toISOString(),
          completedAt: (tether.answers[1]?.timestamp || tether.updatedAt).toISOString(),
        };
      })
    );

    res.json({
      success: true,
      history,
      total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error('Error getting tether history:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get tether history' });
  }
};