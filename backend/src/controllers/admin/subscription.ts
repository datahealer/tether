import { Request, Response } from 'express';
import Purchase from '../../models/Purchase';
import User from '../../models/User';
import { getRevenueCatService } from '../../services/revenuecat/revenuecat.service';

/**
 * @route   GET /api/admin/subscriptions/stats
 * @desc    Get subscription statistics
 * @access  Private (Admin)
 */
export const getSubscriptionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Fetching subscription stats...');

    // Execute all counts in parallel
    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      monthlySubscriptions,
      yearlySubscriptions,
      trialSubscriptions,
      totalUsers,
      subscribedUsers,
    ] = await Promise.all([
      Purchase.countDocuments(),
      Purchase.countDocuments({ status: 'active', expiresAt: { $gt: new Date() } }),
      Purchase.countDocuments({ status: 'expired' }),
      Purchase.countDocuments({ cancelledAt: { $exists: true } }),
      Purchase.countDocuments({ planType: 'monthly', status: 'active', expiresAt: { $gt: new Date() } }),
      Purchase.countDocuments({ planType: 'yearly', status: 'active', expiresAt: { $gt: new Date() } }),
      Purchase.countDocuments({ planType: 'trial' }),
      User.countDocuments(),
      User.countDocuments({ subscribed: true }),
    ]);

    // Calculate revenue metrics
    const revenueStats = await Purchase.aggregate([
      {
        $match: {
          status: 'active',
          expiresAt: { $gt: new Date() },
          planType: { $in: ['monthly', 'yearly'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          monthlyRevenue: {
            $sum: {
              $cond: [{ $eq: ['$planType', 'monthly'] }, '$amount', 0],
            },
          },
          yearlyRevenue: {
            $sum: {
              $cond: [{ $eq: ['$planType', 'yearly'] }, '$amount', 0],
            },
          },
          avgMonthlyPrice: {
            $avg: {
              $cond: [{ $eq: ['$planType', 'monthly'] }, '$amount', null],
            },
          },
          avgYearlyPrice: {
            $avg: {
              $cond: [{ $eq: ['$planType', 'yearly'] }, '$amount', null],
            },
          },
        },
      },
    ]);

    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      avgMonthlyPrice: 0,
      avgYearlyPrice: 0,
    };

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = revenue.monthlyRevenue + revenue.yearlyRevenue / 12;
    const arr = mrr * 12; // Annual Recurring Revenue

    // Store breakdown
    const storeStats = await Purchase.aggregate([
      {
        $match: {
          status: 'active',
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: '$revenueCatStore',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
    ]);

    console.log('✅ Stats fetched successfully');

    res.status(200).json({
      overview: {
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        totalUsers,
        subscribedUsers,
        subscriptionRate: totalUsers > 0 ? ((subscribedUsers / totalUsers) * 100).toFixed(2) : 0,
      },
      byPlanType: {
        monthly: monthlySubscriptions,
        yearly: yearlySubscriptions,
        trial: trialSubscriptions,
      },
      revenue: {
        totalRevenue: revenue.totalRevenue,
        monthlyRevenue: revenue.monthlyRevenue,
        yearlyRevenue: revenue.yearlyRevenue,
        mrr: parseFloat(mrr.toFixed(2)),
        arr: parseFloat(arr.toFixed(2)),
        avgMonthlyPrice: revenue.avgMonthlyPrice || 0,
        avgYearlyPrice: revenue.avgYearlyPrice || 0,
      },
      byStore: storeStats,
    });
  } catch (error: any) {
    console.error('❌ Get subscription stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching subscription statistics',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/subscriptions/list
 * @desc    Get list of all subscriptions with filters
 * @access  Private (Admin)
 */
export const getSubscriptionsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      planType,
      store,
      page = '1',
      limit = '50',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (status) {
      if (status === 'active') {
        filter.status = 'active';
        filter.expiresAt = { $gt: new Date() };
      } else {
        filter.status = status;
      }
    }
    if (planType) filter.planType = planType;
    if (store) filter.revenueCatStore = store;

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel
    const [purchases, total] = await Promise.all([
      Purchase.find(filter)
        .populate('userId', 'email name platform')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Purchase.countDocuments(filter),
    ]);

    res.status(200).json({
      subscriptions: purchases,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get subscriptions list error:', error);
    res.status(500).json({
      message: 'Server error while fetching subscriptions',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/subscriptions/trends
 * @desc    Get subscription trends over time
 * @access  Private (Admin)
 */
export const getSubscriptionTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30', type = 'all' } = req.query;
    const days = parseInt(period as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let matchFilter: any = {
      createdAt: { $gte: startDate },
    };

    if (type === 'new') {
      matchFilter.status = 'active';
    } else if (type === 'cancelled') {
      matchFilter.cancelledAt = { $exists: true };
    }

    // Daily trends
    const dailyTrends = await Purchase.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Weekly trends
    const weeklyTrends = await Purchase.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    // Monthly trends
    const monthlyTrends = await Purchase.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Plan type trends
    const planTypeTrends = await Purchase.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$planType',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      daily: dailyTrends,
      weekly: weeklyTrends,
      monthly: monthlyTrends,
      byPlanType: planTypeTrends,
    });
  } catch (error: any) {
    console.error('❌ Get subscription trends error:', error);
    res.status(500).json({
      message: 'Server error while fetching subscription trends',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/subscriptions/churn
 * @desc    Get churn analysis
 * @access  Private (Admin)
 */
export const getChurnAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Cancelled subscriptions
    const cancelled = await Purchase.countDocuments({
      cancelledAt: { $gte: startDate },
    });

    // Expired subscriptions
    const expired = await Purchase.countDocuments({
      status: 'expired',
      expiresAt: { $gte: startDate },
    });

    // New subscriptions in the same period
    const newSubscriptions = await Purchase.countDocuments({
      createdAt: { $gte: startDate },
      status: 'active',
    });

    // Active subscriptions at start of period
    const activeAtStart = await Purchase.countDocuments({
      createdAt: { $lt: startDate },
      status: 'active',
      expiresAt: { $gt: startDate },
    });

    // Calculate churn rate
    const totalChurned = cancelled + expired;
    const churnRate =
      activeAtStart > 0 ? ((totalChurned / activeAtStart) * 100).toFixed(2) : '0.00';

    // Cancellation reasons (if we had this data)
    const cancellationTiming = await Purchase.aggregate([
      {
        $match: {
          cancelledAt: { $gte: startDate },
        },
      },
      {
        $project: {
          daysActive: {
            $divide: [
              { $subtract: ['$cancelledAt', '$startDate'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      {
        $bucket: {
          groupBy: '$daysActive',
          boundaries: [0, 7, 30, 90, 180, 365, Infinity],
          default: '365+',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    res.status(200).json({
      period: `${days} days`,
      churned: {
        cancelled,
        expired,
        total: totalChurned,
      },
      newSubscriptions,
      activeAtStart,
      churnRate: parseFloat(churnRate),
      cancellationTiming,
    });
  } catch (error: any) {
    console.error('❌ Get churn analysis error:', error);
    res.status(500).json({
      message: 'Server error while fetching churn analysis',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/subscriptions/user/:userId
 * @desc    Get subscription details for a specific user
 * @access  Private (Admin)
 */
export const getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('email name platform subscribed');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const purchases = await Purchase.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get RevenueCat data
    let revenueCatUser = null;
    try {
      const revenueCat = getRevenueCatService();
      revenueCatUser = await revenueCat.getUser(userId);
    } catch (error: any) {
      console.warn(`Could not fetch RevenueCat data for user ${userId}:`, error.message);
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        platform: user.platform,
        subscribed: user.subscribed,
      },
      purchases,
      revenueCat: revenueCatUser,
    });
  } catch (error: any) {
    console.error('❌ Get user subscriptions error:', error);
    res.status(500).json({
      message: 'Server error while fetching user subscriptions',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/subscriptions/revenue
 * @desc    Get detailed revenue analytics
 * @access  Private (Admin)
 */
export const getRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30', groupBy = 'day' } = req.query;
    const days = parseInt(period as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') {
      dateFormat = '%Y-W%V';
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    }

    // Revenue by date
    const revenueByDate = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          planType: { $in: ['monthly', 'yearly'] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
          monthlyRevenue: {
            $sum: {
              $cond: [{ $eq: ['$planType', 'monthly'] }, '$amount', 0],
            },
          },
          yearlyRevenue: {
            $sum: {
              $cond: [{ $eq: ['$planType', 'yearly'] }, '$amount', 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by plan type
    const revenueByPlan = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          planType: { $in: ['monthly', 'yearly'] },
        },
      },
      {
        $group: {
          _id: '$planType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
          avgPrice: { $avg: '$amount' },
        },
      },
    ]);

    // Revenue by store
    const revenueByStore = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          planType: { $in: ['monthly', 'yearly'] },
        },
      },
      {
        $group: {
          _id: '$revenueCatStore',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Total revenue
    const totalRevenue = revenueByDate.reduce((sum, item) => sum + item.revenue, 0);

    res.status(200).json({
      period: `${days} days`,
      groupBy,
      totalRevenue,
      byDate: revenueByDate,
      byPlan: revenueByPlan,
      byStore: revenueByStore,
    });
  } catch (error: any) {
    console.error('❌ Get revenue analytics error:', error);
    res.status(500).json({
      message: 'Server error while fetching revenue analytics',
      error: error.message,
    });
  }
};

