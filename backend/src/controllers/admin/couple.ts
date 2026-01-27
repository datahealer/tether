import { Request, Response } from 'express';
import User from '../../models/User';
import Couple from '../../models/Couple';
import { UserEntitlement } from '../../models/UserEntitlement';
import { Tier } from '../../types/enums';
import { QuestionServiceEngine } from '../../questionServiceEngine';

/**
 * @route   GET /api/admin/couples
 * @desc    Get all couples
 * @access  Private (Admin)
 */
export const getCouples = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      search,
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

    // Get couples
    const [couples, total] = await Promise.all([
      Couple.find(filter)
        .populate('user1Id', 'email name avatar')
        .populate('user2Id', 'email name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Couple.countDocuments(filter),
    ]);

    // If search provided, filter by user email/name
    let filteredCouples = couples;
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredCouples = couples.filter(
        (c: any) =>
          c.user1Id?.email?.toLowerCase().includes(searchLower) ||
          c.user1Id?.name?.toLowerCase().includes(searchLower) ||
          c.user2Id?.email?.toLowerCase().includes(searchLower) ||
          c.user2Id?.name?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      couples: filteredCouples,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: search ? filteredCouples.length : total,
        totalPages: Math.ceil((search ? filteredCouples.length : total) / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get couples error:', error);
    res.status(500).json({
      message: 'Server error while fetching couples',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/couples/:coupleId/unlink
 * @desc    Unlink partners (break up a couple)
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

    // Get both users
    const user1 = await User.findById(couple.user1Id);
    const user2 = await User.findById(couple.user2Id);

    if (!user1 || !user2) {
      res.status(404).json({ error: 'One or both users not found' });
      return;
    }

    // Remove coupleId from both users
    user1.coupleId = undefined;
    user2.coupleId = undefined;
    await Promise.all([user1.save(), user2.save()]);

    // Mark couple as ended
    couple.status = 'ended';
    await couple.save();

    res.status(200).json({
      success: true,
      message: 'Partners unlinked successfully',
      couple: {
        _id: couple._id,
        status: couple.status,
      },
    });
  } catch (error: any) {
    console.error('❌ Unlink partners error:', error);
    res.status(500).json({
      message: 'Server error while unlinking partners',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/users/:userId/link-partner
 * @desc    Link two users as partners (create a couple)
 * @access  Private (Admin)
 */
export const linkPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { partnerEmail } = req.body;

    if (!partnerEmail) {
      res.status(400).json({ error: 'Partner email is required' });
      return;
    }

    const user1 = await User.findById(userId);
    if (!user1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user1.coupleId) {
      res.status(400).json({ error: 'User is already in a couple' });
      return;
    }

    const user2 = await User.findOne({ email: partnerEmail.toLowerCase() });
    if (!user2) {
      res.status(404).json({ error: 'Partner user not found' });
      return;
    }

    if (user2.coupleId) {
      res.status(400).json({ error: 'Partner is already in a couple' });
      return;
    }

    // Get entitlements to determine couple tier
    const [entitlement1, entitlement2] = await Promise.all([
      UserEntitlement.findOne({ userId: user1._id }),
      UserEntitlement.findOne({ userId: user2._id }),
    ]);

    // Determine couple tier: PREMIUM > TRIAL > FREE
    let coupleTier: Tier;
    if (
      entitlement1?.tier === Tier.PREMIUM ||
      entitlement2?.tier === Tier.PREMIUM
    ) {
      coupleTier = Tier.PREMIUM;
    } else if (
      entitlement1?.tier === Tier.TRIAL ||
      entitlement2?.tier === Tier.TRIAL
    ) {
      coupleTier = Tier.TRIAL;
    } else {
      coupleTier = Tier.FREE;
    }

    // Create couple
    const couple = await Couple.create({
      user1Id: user1._id,
      user2Id: user2._id,
      status: 'active',
    });

    // Update users with coupleId
    user1.coupleId = couple._id;
    user2.coupleId = couple._id;
    await Promise.all([user1.save(), user2.save()]);

    // Update entitlements to match couple tier
    if (entitlement1) {
      entitlement1.tier = coupleTier;
      await entitlement1.save();
    } else {
      await UserEntitlement.create({
        userId: user1._id,
        tier: coupleTier,
      });
    }

    if (entitlement2) {
      entitlement2.tier = coupleTier;
      await entitlement2.save();
    } else {
      await UserEntitlement.create({
        userId: user2._id,
        tier: coupleTier,
      });
    }

    // Initialize categories for couple
    await QuestionServiceEngine.initializeCategoriesForCouple(couple._id);
    await QuestionServiceEngine.updateCategoryAccessForTierChange(
      couple._id,
      coupleTier
    );

    res.status(200).json({
      success: true,
      message: 'Partners linked successfully',
      couple: {
        _id: couple._id,
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

