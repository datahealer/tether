import { Request, Response } from 'express';
import User from '../../models/User';
import Couple from '../../models/Couple';
import CoupleInvite from '../../models/CoupleInvite';

/**
 * @route   GET /api/admin/partners
 * @desc    Get all couples/partnerships
 * @access  Private (Admin)
 */
export const getPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
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
      filter.status = status;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel
    const [couples, total] = await Promise.all([
      Couple.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Couple.countDocuments(filter),
    ]);

    // Get user details for all couples
    const userIds = new Set<string>();
    couples.forEach(c => {
      userIds.add(c.user1Id.toString());
      userIds.add(c.user2Id.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select('_id email name avatar')
      .lean();

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Enrich couples with user details
    const couplesWithUsers = couples.map(couple => ({
      ...couple,
      user1: userMap.get(couple.user1Id.toString()),
      user2: userMap.get(couple.user2Id.toString()),
    }));

    res.status(200).json({
      couples: couplesWithUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get partners error:', error);
    res.status(500).json({
      message: 'Server error while fetching partners',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/partners/link
 * @desc    Manually link two users as partners
 * @access  Private (Admin)
 */
export const linkPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
      res.status(400).json({ error: 'Both user1Id and user2Id are required' });
      return;
    }

    if (user1Id === user2Id) {
      res.status(400).json({ error: 'Cannot link a user to themselves' });
      return;
    }

    // Check if users exist
    const [user1, user2] = await Promise.all([
      User.findById(user1Id),
      User.findById(user2Id),
    ]);

    if (!user1 || !user2) {
      res.status(404).json({ error: 'One or both users not found' });
      return;
    }

    // Check if either user is already in a couple
    if (user1.coupleId || user2.coupleId) {
      res.status(400).json({ error: 'One or both users are already in a couple' });
      return;
    }

    // Create couple
    const couple = await Couple.create({
      user1Id: user1._id,
      user2Id: user2._id,
      status: 'active',
      sharedData: {
        currentStreak: 0,
        totalTethersCompleted: 0,
        permanentRefreshBalance: 0,
      },
    });

    // Update both users with coupleId
    await Promise.all([
      User.findByIdAndUpdate(user1._id, { coupleId: couple._id }),
      User.findByIdAndUpdate(user2._id, { coupleId: couple._id }),
    ]);

    // Initialize categories for the couple
    try {
      const { QuestionServiceEngine } = await import('../../services/questionService');
      await QuestionServiceEngine.initializeCategoriesForCouple(couple._id);
      await QuestionServiceEngine.dropTethersForCouple(couple._id, true);
    } catch (error: any) {
      console.error('Error initializing couple categories:', error);
    }

    console.log(`✅ Linked users ${user1.email} and ${user2.email} as partners`);

    res.status(200).json({
      success: true,
      message: 'Partners linked successfully',
      couple: {
        id: couple._id,
        user1Id: couple.user1Id,
        user2Id: couple.user2Id,
        status: couple.status,
      },
    });
  } catch (error: any) {
    console.error('❌ Link partners error:', error);
    res.status(500).json({
      message: 'Server error while linking partners',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/partners/unlink/:coupleId
 * @desc    Manually unlink partners (dissolve couple)
 * @access  Private (Admin)
 */
export const unlinkPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coupleId } = req.params;

    const couple = await Couple.findById(coupleId);
    if (!couple) {
      res.status(404).json({ error: 'Couple not found' });
      return;
    }

    // Update couple status to ended
    couple.status = 'ended';
    await couple.save();

    // Remove coupleId from both users
    await Promise.all([
      User.findByIdAndUpdate(couple.user1Id, { $unset: { coupleId: 1 } }),
      User.findByIdAndUpdate(couple.user2Id, { $unset: { coupleId: 1 } }),
    ]);

    // Cancel any pending invites from these users
    await CoupleInvite.updateMany(
      {
        $or: [
          { inviterId: couple.user1Id },
          { inviterId: couple.user2Id },
        ],
        status: 'pending',
      },
      { status: 'expired' }
    );

    console.log(`✅ Unlinked couple ${coupleId}`);

    res.status(200).json({
      success: true,
      message: 'Partners unlinked successfully',
    });
  } catch (error: any) {
    console.error('❌ Unlink partners error:', error);
    res.status(500).json({
      message: 'Server error while unlinking partners',
      error: error.message,
    });
  }
};

