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
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { questionId, answer } = req.body;
    if (!questionId || !answer) return res.status(400).json({ message: 'questionId and answer required' });

    const user = await User.findById(userId);
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    const result = await QuestionServiceEngine.submitAnswer(
      user.coupleId,
      userId,
      questionId,
      answer
    );

    // Find the updated question state to get _id
    const questionState = await CoupleQuestionState.findOne({
      coupleId: user.coupleId,
      questionId,
    });

    if (questionState && questionState.answers.length === 2) {
      // Trigger notification when both have answered
      NotificationTriggers.onTetherAnswered(questionState._id.toString()).catch(err => {
        console.error('Failed to trigger answer notification:', err);
      });
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
    res.status(500).json({ success: false, message: error.message || 'Failed to submit answer' });
  }
};

/**
 * Skip/refresh a tether
 */
export const skipTether = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { questionId } = req.body;
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
    res.status(500).json({ message: error.message || 'Failed to skip tether' });
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

    res.json({
      success: true,
      stats: {
        currentStreak: couple.sharedData.currentStreak,
        totalCompleted: couple.sharedData.totalTethersCompleted,
        lastTetherDate: couple.sharedData.lastTetherDate,
        milestones: couple.sharedData.milestoneRecords,
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
    if (!user?.coupleId) return res.status(404).json({ message: 'Not in a couple' });

    await QuestionServiceEngine.initializeCategoriesForCouple(user.coupleId);

    res.json({ success: true, message: 'Categories initialized successfully' });
  } catch (error: any) {
    console.error('Error initializing categories:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize categories' });
  }
};