import { Request, Response } from 'express';
import User from '../../models/User';
import Couple from '../../models/Couple';
import Question from '../../models/Question';
import { Tether } from '../../models/Tether';
import { UserEntitlement } from '../../models/UserEntitlement';
import { Tier } from '../../types/enums';

/**
 * @route   GET /api/admin/stats
 * @desc    Get basic statistics for admin dashboard
 * @access  Private (Admin)
 */
export const getBasicStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Execute all counts in parallel
    const [
      totalUsers,
      onboardedUsers,
      subscribedUsers,
      totalCouples,
      activeCouples,
      totalQuestions,
      publishedQuestions,
      totalTethers,
      activeTethers,
      completedTethers,
      freeUsers,
      premiumUsers,
      trialUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ onboarded: true }),
      User.countDocuments({ subscribed: true }),
      Couple.countDocuments(),
      Couple.countDocuments({ status: 'active' }),
      Question.countDocuments(),
      Question.countDocuments({ status: 'Published' }),
      Tether.countDocuments(),
      Tether.countDocuments({ status: 'active' }),
      Tether.countDocuments({ status: 'completed' }),
      UserEntitlement.countDocuments({ tier: Tier.FREE }),
      UserEntitlement.countDocuments({ tier: Tier.PREMIUM }),
      UserEntitlement.countDocuments({ tier: Tier.TRIAL }),
    ]);

    // Calculate additional metrics
    const usersByPlatform = await User.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
        },
      },
    ]);

    const usersByProvider = await User.aggregate([
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
        },
      },
    ]);

    const questionsByCategory = await Question.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'Published'] }, 1, 0] },
          },
        },
      },
    ]);

    const tethersByStatus = await Tether.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      users: {
        total: totalUsers,
        onboarded: onboardedUsers,
        subscribed: subscribedUsers,
        byTier: {
          free: freeUsers,
          premium: premiumUsers,
          trial: trialUsers,
        },
        byPlatform: usersByPlatform,
        byProvider: usersByProvider,
      },
      couples: {
        total: totalCouples,
        active: activeCouples,
        ended: totalCouples - activeCouples,
      },
      questions: {
        total: totalQuestions,
        published: publishedQuestions,
        draft: totalQuestions - publishedQuestions,
        byCategory: questionsByCategory,
      },
      tethers: {
        total: totalTethers,
        active: activeTethers,
        completed: completedTethers,
        byStatus: tethersByStatus,
      },
    });
  } catch (error: any) {
    console.error('❌ Get basic stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching statistics',
      error: error.message,
    });
  }
};

