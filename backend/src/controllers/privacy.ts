import { Request, Response } from 'express';
import { CoupleQuestionState } from '../models/CoupleQuestionState';
import User from '../models/User';
import Couple from '../models/Couple';
import Question from '../models/Question';
import { QuestionState } from '../types/enums';
import { CategoryProgress } from '../models/CategoryProgress';
import CoupleInvite from '../models/CoupleInvite';
import Purchase from '../models/Purchase';
import Notification from '../models/Notification';
import { UserEntitlement } from '../models/UserEntitlement';
import { Types } from 'mongoose';

// Simple console logger
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error || ''),
};

/**
 * Export user data - generates file with all completed tethers
 * Both partners must have answered for tether to be included
 */
export const exportUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get user's couple
    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      res.status(404).json({ error: 'No couple found for this user' });
      return;
    }

    // Get all completed tethers where both partners answered
    const completedTethers = await CoupleQuestionState.find({
      coupleId: couple._id,
      state: QuestionState.COMPLETED,
      'answers.1': { $exists: true }, // Ensure both partners answered
    })
      .populate('answers.userId', 'name email')
      .sort({ 'answers.timestamp': -1 });

    // Get question details for each tether
    const questionIds = completedTethers.map((t) => t.questionId);
    const questions = await Question.find({ questionId: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [q.questionId, q]));

    // Format the export data
    const exportData = completedTethers.map((tether) => {
      const question = questionMap.get(tether.questionId);
      const partner1Answer = tether.answers[0];
      const partner2Answer = tether.answers[1];

      return {
        questionId: tether.questionId,
        questionText: question?.question || 'Question not found',
        category: question?.categoryId || 'Unknown',
        completedDate: tether.answers[1]?.timestamp || tether.updatedAt,
        partner1: {
          name: (partner1Answer.userId as any)?.name || 'Unknown',
          answer: partner1Answer.text,
          answeredAt: partner1Answer.timestamp,
        },
        partner2: {
          name: (partner2Answer.userId as any)?.name || 'Unknown',
          answer: partner2Answer.text,
          answeredAt: partner2Answer.timestamp,
        },
      };
    });

    // Log export event for compliance (non-identifiable metadata)
    logger.info('Data export requested', {
      userId: user._id.toString(),
      coupleId: couple._id.toString(),
      recordCount: exportData.length,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: exportData,
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: exportData.length,
        coupleCreatedAt: couple.createdAt,
      },
    });
  } catch (error) {
    logger.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};

/**
 * Delete specific answers - permanently removes selected tether records
 * Cannot be recovered once deleted
 */
export const deleteSpecificAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { questionStateIds } = req.body;

    if (!user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!questionStateIds || !Array.isArray(questionStateIds) || questionStateIds.length === 0) {
      res.status(400).json({ error: 'Question state IDs required' });
      return;
    }

    // Validate user has a couple
    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      res.status(404).json({ error: 'No couple found for this user' });
      return;
    }

    // Convert string IDs to ObjectIds
    const objectIds = questionStateIds.map((id) => new Types.ObjectId(id));

    // Verify all question states belong to this couple and are completed
    const questionStates = await CoupleQuestionState.find({
      _id: { $in: objectIds },
      coupleId: couple._id,
      state: QuestionState.COMPLETED,
    });

    if (questionStates.length !== questionStateIds.length) {
      res.status(400).json({
        error: 'Some question states not found or do not belong to this couple',
      });
      return;
    }

    // Log deletion event for compliance (non-identifiable metadata)
    logger.info('Specific answers deletion requested', {
      userId: user._id.toString(),
      coupleId: couple._id.toString(),
      recordCount: questionStates.length,
      questionStateIds: questionStateIds,
      timestamp: new Date().toISOString(),
    });

    // Delete the question states
    const deleteResult = await CoupleQuestionState.deleteMany({
      _id: { $in: objectIds },
      coupleId: couple._id,
    });

    res.json({
      success: true,
      message: `${deleteResult.deletedCount} answer(s) permanently deleted`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    logger.error('Delete specific answers error:', error);
    res.status(500).json({ error: 'Failed to delete answers' });
  }
};

/**
 * Delete account - permanently removes user account and all associated data
 * De-links from partner and anonymizes or deletes all records
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Log deletion event for compliance (non-identifiable metadata)
    logger.info('Account deletion requested', {
      userId: user._id.toString(),
      coupleId: user.coupleId?.toString() || 'none',
      timestamp: new Date().toISOString(),
    });

    // If user is part of a couple, de-link and handle partner
    if (user.coupleId) {
      const couple = await Couple.findById(user.coupleId);
      
      if (couple) {
        // Get partner user - use user1Id and user2Id
        const partnerId = couple.user1Id.equals(user._id) ? couple.user2Id : couple.user1Id;
        
        if (partnerId) {
          const partner = await User.findById(partnerId);
          if (partner) {
            // De-link partner from couple
            partner.coupleId = undefined;
            await partner.save();
          }
        }

        // Delete all couple-related data
        await Promise.all([
          // Delete all question states for this couple
          CoupleQuestionState.deleteMany({ coupleId: couple._id }),
          // Delete category progress
          CategoryProgress.deleteMany({ coupleId: couple._id }),
          // Delete couple invites
          CoupleInvite.deleteMany({
            $or: [{ inviterUserId: user._id }, { usedByUserId: user._id }],
          }),
          // Delete the couple record
          Couple.findByIdAndDelete(couple._id),
        ]);
      }
    }

    // Delete user-specific data
    await Promise.all([
      // Delete purchases
      Purchase.deleteMany({ userId: user._id }),
      // Delete notifications
      Notification.deleteMany({ userId: user._id }),
      // Delete user entitlements
      UserEntitlement.deleteMany({ userId: user._id }),
      // Delete any pending invites created by this user
      CoupleInvite.deleteMany({ inviterUserId: user._id }),
    ]);

    // Finally, delete the user account
    await User.findByIdAndDelete(user._id);

    logger.info('Account deletion completed', {
      userId: user._id.toString(),
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Account and all associated data permanently deleted',
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

/**
 * Get list of deletable answers for user's couple
 * Returns completed tethers with question text and date
 */
export const getDeletableAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      res.status(404).json({ error: 'No couple found for this user' });
      return;
    }

    // Get all completed tethers
    const completedTethers = await CoupleQuestionState.find({
      coupleId: couple._id,
      state: QuestionState.COMPLETED,
      'answers.1': { $exists: true }, // Both partners answered
    }).sort({ 'answers.timestamp': -1 });

    // Get question details
    const questionIds = completedTethers.map((t) => t.questionId);
    const questions = await Question.find({ questionId: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [q.questionId, q]));

    // Format for UI
    const deletableAnswers = completedTethers.map((tether) => {
      const question = questionMap.get(tether.questionId);
      const completedDate = tether.answers[1]?.timestamp || tether.updatedAt;

      return {
        id: tether._id.toString(),
        questionId: tether.questionId,
        question: question?.question || '[Question not found]',
        category: question?.categoryId || 'Unknown',
        date: completedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        completedAt: completedDate,
      };
    });

    res.json({
      success: true,
      answers: deletableAnswers,
    });
  } catch (error) {
    logger.error('Get deletable answers error:', error);
    res.status(500).json({ error: 'Failed to retrieve answers' });
  }
};
