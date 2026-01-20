import { Request, Response } from 'express';
import Couple from '../../models/Couple';
import User from '../../models/User';

/**
 * @route   GET /api/admin/refresh/bundles
 * @desc    Get all couples with refresh bundle information
 * @access  Private (Admin)
 */
export const getRefreshBundles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', minBalance } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (minBalance) {
      filter['sharedData.permanentRefreshBalance'] = { $gte: parseInt(minBalance as string, 10) };
    }

    // Execute queries in parallel
    const [couples, total] = await Promise.all([
      Couple.find(filter)
        .select('user1Id user2Id sharedData.permanentRefreshBalance status createdAt')
        .sort({ 'sharedData.permanentRefreshBalance': -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Couple.countDocuments(filter),
    ]);

    // Get user details
    const userIds = new Set<string>();
    couples.forEach(c => {
      userIds.add(c.user1Id.toString());
      userIds.add(c.user2Id.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select('_id email name')
      .lean();

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Enrich couples with user details
    const couplesWithUsers = couples.map(couple => ({
      coupleId: couple._id,
      user1: userMap.get(couple.user1Id.toString()),
      user2: userMap.get(couple.user2Id.toString()),
      permanentRefreshBalance: couple.sharedData?.permanentRefreshBalance || 0,
      status: couple.status,
      createdAt: couple.createdAt,
    }));

    // Calculate total refresh balance across all couples
    const totalBalance = await Couple.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$sharedData.permanentRefreshBalance' },
        },
      },
    ]);

    res.status(200).json({
      refreshBundles: couplesWithUsers,
      summary: {
        totalBalance: totalBalance[0]?.total || 0,
        totalCouples: total,
        couplesWithBalance: couplesWithUsers.filter(c => c.permanentRefreshBalance > 0).length,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get refresh bundles error:', error);
    res.status(500).json({
      message: 'Server error while fetching refresh bundles',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/refresh/add-bundle
 * @desc    Add refresh bundle to a couple
 * @access  Private (Admin)
 */
export const addRefreshBundle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coupleId, amount } = req.body;

    if (!coupleId || !amount || amount <= 0) {
      res.status(400).json({ error: 'coupleId and positive amount are required' });
      return;
    }

    const couple = await Couple.findById(coupleId);
    if (!couple) {
      res.status(404).json({ error: 'Couple not found' });
      return;
    }

    // Add to permanent refresh balance
    const currentBalance = couple.sharedData?.permanentRefreshBalance || 0;
    couple.sharedData = couple.sharedData || {
      currentStreak: 0,
      totalTethersCompleted: 0,
      permanentRefreshBalance: 0,
    };
    couple.sharedData.permanentRefreshBalance = currentBalance + amount;
    await couple.save();

    console.log(`✅ Added ${amount} refresh bundle to couple ${coupleId}. New balance: ${couple.sharedData.permanentRefreshBalance}`);

    res.status(200).json({
      success: true,
      message: `Added ${amount} refresh bundle successfully`,
      coupleId: couple._id,
      newBalance: couple.sharedData.permanentRefreshBalance,
    });
  } catch (error: any) {
    console.error('❌ Add refresh bundle error:', error);
    res.status(500).json({
      message: 'Server error while adding refresh bundle',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/refresh/remove-bundle
 * @desc    Remove refresh bundle from a couple
 * @access  Private (Admin)
 */
export const removeRefreshBundle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coupleId, amount } = req.body;

    if (!coupleId || !amount || amount <= 0) {
      res.status(400).json({ error: 'coupleId and positive amount are required' });
      return;
    }

    const couple = await Couple.findById(coupleId);
    if (!couple) {
      res.status(404).json({ error: 'Couple not found' });
      return;
    }

    const currentBalance = couple.sharedData?.permanentRefreshBalance || 0;
    if (currentBalance < amount) {
      res.status(400).json({ error: 'Insufficient refresh balance' });
      return;
    }

    // Remove from permanent refresh balance
    couple.sharedData = couple.sharedData || {
      currentStreak: 0,
      totalTethersCompleted: 0,
      permanentRefreshBalance: 0,
    };
    couple.sharedData.permanentRefreshBalance = currentBalance - amount;
    await couple.save();

    console.log(`✅ Removed ${amount} refresh bundle from couple ${coupleId}. New balance: ${couple.sharedData.permanentRefreshBalance}`);

    res.status(200).json({
      success: true,
      message: `Removed ${amount} refresh bundle successfully`,
      coupleId: couple._id,
      newBalance: couple.sharedData.permanentRefreshBalance,
    });
  } catch (error: any) {
    console.error('❌ Remove refresh bundle error:', error);
    res.status(500).json({
      message: 'Server error while removing refresh bundle',
      error: error.message,
    });
  }
};

