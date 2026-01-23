import { Request, Response } from 'express';
import User from '../../models/User';
import { UserEntitlement } from '../../models/UserEntitlement';
import Couple from '../../models/Couple';
import Purchase from '../../models/Purchase';
import Question from '../../models/Question';
import { Category } from '../../models/Category';
import { Tier } from '../../types/enums';
import { CoupleCategoryState } from '../../models/CoupleCategoryState';

/**
 * @route   GET /api/admin/stats
 * @desc    Get basic admin statistics
 * @access  Private (Admin)
 */
export const getBasicStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Fetching basic admin stats...');

    // Execute all counts in parallel
    const [
      totalUsers,
      freeUsers,
      premiumUsers,
      trialUsers,
      lifetimeUsers,
      totalCouples,
      activeCouples,
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      totalCategories,
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
    ] = await Promise.all([
      User.countDocuments(),
      UserEntitlement.countDocuments({ tier: Tier.FREE }),
      UserEntitlement.countDocuments({
        tier: Tier.PREMIUM,
        $or: [
          { premiumEnd: { $gt: new Date() } },
          { premiumEnd: { $exists: false } },
        ],
      }),
      UserEntitlement.countDocuments({
        tier: Tier.TRIAL,
        trialEnd: { $gt: new Date() },
      }),
      UserEntitlement.countDocuments({
        tier: Tier.PREMIUM,
        premiumEnd: { $exists: false },
      }),
      Couple.countDocuments(),
      Couple.countDocuments({ status: 'active' }),
      Question.countDocuments(),
      Question.countDocuments({ status: 'Published' }),
      Question.countDocuments({ status: 'Draft' }),
      Category.countDocuments(),
      Purchase.countDocuments(),
      Purchase.countDocuments({ status: 'active', expiresAt: { $gt: new Date() } }),
      Purchase.countDocuments({ status: 'expired' }),
    ]);

    // Get users with partners
    const usersWithPartners = await User.countDocuments({
      coupleId: { $exists: true, $ne: null },
    });

    // Get temporary unlocks that are expiring soon (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringUnlocks = await CoupleCategoryState.countDocuments({
      unlocked: true,
      unlockExpiry: { $lte: sevenDaysFromNow, $gt: new Date() },
    });

    // Get total refresh bundles (permanent refresh balance across all couples)
    const refreshBundlesResult = await Couple.aggregate([
      {
        $group: {
          _id: null,
          totalRefreshBundles: {
            $sum: { $ifNull: ['$sharedData.permanentRefreshBalance', 0] },
          },
        },
      },
    ]);
    const totalRefreshBundles =
      refreshBundlesResult[0]?.totalRefreshBundles || 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [
      newUsersLast7Days,
      newCouplesLast7Days,
      newSubscriptionsLast7Days,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Couple.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Purchase.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    console.log('✅ Stats fetched successfully');

    res.status(200).json({
      users: {
        total: totalUsers,
        free: freeUsers,
        premium: premiumUsers,
        trial: trialUsers,
        lifetime: lifetimeUsers,
        withPartners: usersWithPartners,
        newLast7Days: newUsersLast7Days,
      },
      couples: {
        total: totalCouples,
        active: activeCouples,
        newLast7Days: newCouplesLast7Days,
      },
      questions: {
        total: totalQuestions,
        published: publishedQuestions,
        draft: draftQuestions,
      },
      categories: {
        total: totalCategories,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        newLast7Days: newSubscriptionsLast7Days,
      },
      unlocks: {
        expiringNext7Days: expiringUnlocks,
      },
      refreshBundles: {
        total: totalRefreshBundles,
      },
    });
  } catch (error: any) {
    console.error('❌ Get basic stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching stats',
      error: error.message,
    });
  }
};

