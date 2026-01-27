import { Request, Response } from 'express';
import User from '../../models/User';
import Purchase from '../../models/Purchase';
import { UserEntitlement } from '../../models/UserEntitlement';
import { Tier } from '../../types/enums';
import Couple from '../../models/Couple';
import { QuestionServiceEngine } from '../../services/questionService';

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with subscription states (free/premium/trial/lifetime)
 * @access  Private (Admin)
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      state,
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
    
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('email name platform provider onboarded subscribed coupleId createdAt')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Get subscription states for all users
    const userIds = users.map(u => u._id);
    const [entitlements, purchases, couples] = await Promise.all([
      UserEntitlement.find({ userId: { $in: userIds } }).lean(),
      Purchase.find({
        userId: { $in: userIds },
        status: 'active',
        expiresAt: { $gt: new Date() },
      }).lean(),
      Couple.find({
        $or: [
          { user1Id: { $in: userIds } },
          { user2Id: { $in: userIds } },
        ],
      }).lean(),
    ]);

    // Create maps for quick lookup
    const entitlementMap = new Map(entitlements.map(e => [e.userId.toString(), e]));
    const purchaseMap = new Map<string, any[]>();
    purchases.forEach(p => {
      const userId = p.userId.toString();
      if (!purchaseMap.has(userId)) {
        purchaseMap.set(userId, []);
      }
      purchaseMap.get(userId)!.push(p);
    });
    const coupleMap = new Map<string, any>();
    couples.forEach(c => {
      coupleMap.set(c.user1Id.toString(), c);
      coupleMap.set(c.user2Id.toString(), c);
    });

    // Enrich users with subscription state
    const usersWithState = users.map(user => {
      const userId = user._id.toString();
      const entitlement = entitlementMap.get(userId);
      const userPurchases = purchaseMap.get(userId) || [];
      const couple = coupleMap.get(userId);

      // Determine subscription state
      let subscriptionState: 'free' | 'premium' | 'trial' | 'lifetime' = 'free';
      if (entitlement) {
        if (entitlement.tier === Tier.PREMIUM) {
          // Check if it's lifetime (no expiry or very far future)
          const activePurchase = userPurchases.find(
            p => p.expiresAt && new Date(p.expiresAt) > new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
          );
          subscriptionState = activePurchase ? 'lifetime' : 'premium';
        } else if (entitlement.tier === Tier.TRIAL) {
          subscriptionState = 'trial';
        }
      }

      return {
        ...user,
        subscriptionState,
        tier: entitlement?.tier || Tier.FREE,
        hasActiveSubscription: userPurchases.length > 0,
        activePurchases: userPurchases.length,
        isInCouple: !!couple,
        coupleId: couple?._id || null,
      };
    });

    // Filter by state if provided
    let filteredUsers = usersWithState;
    if (state) {
      filteredUsers = usersWithState.filter(u => u.subscriptionState === state);
    }

    res.status(200).json({
      users: filteredUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: state ? filteredUsers.length : total,
        totalPages: Math.ceil((state ? filteredUsers.length : total) / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      message: 'Server error while fetching users',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details with full subscription information
 * @access  Private (Admin)
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('email name platform provider onboarded subscribed coupleId createdAt onboardingData')
      .lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const [entitlement, purchases, couple] = await Promise.all([
      UserEntitlement.findOne({ userId }).lean(),
      Purchase.find({ userId }).sort({ createdAt: -1 }).lean(),
      user.coupleId ? Couple.findById(user.coupleId).lean() : null,
    ]);

    const activePurchases = purchases.filter(
      p => p.status === 'active' && p.expiresAt && new Date(p.expiresAt) > new Date()
    );

    let subscriptionState: 'free' | 'premium' | 'trial' | 'lifetime' = 'free';
    if (entitlement) {
      if (entitlement.tier === Tier.PREMIUM) {
        const hasLifetime = activePurchases.some(
          p => p.expiresAt && new Date(p.expiresAt) > new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
        );
        subscriptionState = hasLifetime ? 'lifetime' : 'premium';
      } else if (entitlement.tier === Tier.TRIAL) {
        subscriptionState = 'trial';
      }
    }

    res.status(200).json({
      user: {
        ...user,
        subscriptionState,
        tier: entitlement?.tier || Tier.FREE,
        entitlement,
        purchases,
        activePurchases,
        couple: couple ? {
          id: couple._id,
          user1Id: couple.user1Id,
          user2Id: couple.user2Id,
          status: couple.status,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('❌ Get user by ID error:', error);
    res.status(500).json({
      message: 'Server error while fetching user',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/users/:userId/grant-premium
 * @desc    Manually grant premium subscription to a user
 * @access  Private (Admin)
 */
export const grantPremium = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { durationDays = 30, planType = 'monthly' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Create purchase record
    const purchase = await Purchase.create({
      userId: user._id,
      planType,
      amount: 0, // Admin grant is free
      currency: 'USD',
      status: 'active',
      startDate: new Date(),
      expiresAt,
      autoRenew: false,
      revenueCatStore: 'promotional',
    });

    // Update user subscription flag
    user.subscribed = true;
    await user.save();

    // Update or create UserEntitlement
    const entitlement = await UserEntitlement.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        tier: Tier.PREMIUM,
        premiumEnd: expiresAt,
        refreshesDefault: 3, // Premium gets 3 refreshes per cycle
      },
      { upsert: true, new: true }
    );

    // Update category access for couple if exists
    if (user.coupleId) {
      await QuestionServiceEngine.updateCategoryAccessForTierChange(
        user.coupleId,
        Tier.PREMIUM
      );
    }

    console.log(`✅ Premium granted to user ${user.email} until ${expiresAt}`);

    res.status(200).json({
      success: true,
      message: 'Premium subscription granted successfully',
      purchase,
      entitlement,
      expiresAt,
    });
  } catch (error: any) {
    console.error('❌ Grant premium error:', error);
    res.status(500).json({
      message: 'Server error while granting premium',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/users/:userId/revoke-premium
 * @desc    Manually revoke premium subscription from a user
 * @access  Private (Admin)
 */
export const revokePremium = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Cancel all active purchases
    await Purchase.updateMany(
      {
        userId: user._id,
        status: 'active',
        expiresAt: { $gt: new Date() },
      },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        expiresAt: new Date(), // Expire immediately
      }
    );

    // Update user subscription flag
    user.subscribed = false;
    await user.save();

    // Downgrade entitlement to FREE tier
    const entitlement = await UserEntitlement.findOneAndUpdate(
      { userId: user._id },
      {
        tier: Tier.FREE,
        refreshesDefault: 1, // Free tier: 1 refresh
        premiumEnd: undefined,
      },
      { upsert: true, new: true }
    );

    // Update category access for couple if exists
    if (user.coupleId) {
      await QuestionServiceEngine.updateCategoryAccessForTierChange(
        user.coupleId,
        Tier.FREE
      );
    }

    console.log(`✅ Premium revoked from user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Premium subscription revoked successfully',
      entitlement,
    });
  } catch (error: any) {
    console.error('❌ Revoke premium error:', error);
    res.status(500).json({
      message: 'Server error while revoking premium',
      error: error.message,
    });
  }
};

