import { Request, Response } from 'express';
import User from '../../models/User';
import { UserEntitlement } from '../../models/UserEntitlement';
import { Tier } from '../../types/enums';
import Couple from '../../models/Couple';
import Purchase from '../../models/Purchase';
import { QuestionServiceEngine } from '../../questionServiceEngine';

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with their subscription state
 * @access  Private (Admin)
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      tier,
      subscribed,
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
    if (subscribed !== undefined) {
      filter.subscribed = subscribed === 'true';
    }
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Get users
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshTokens')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Get entitlements for all users
    const userIds = users.map((u) => u._id);
    const entitlements = await UserEntitlement.find({
      userId: { $in: userIds },
    }).lean();

    const entitlementMap = new Map(
      entitlements.map((e) => [e.userId.toString(), e])
    );

    // Get couples for users
    const couples = await Couple.find({
      $or: [{ user1Id: { $in: userIds } }, { user2Id: { $in: userIds } }],
    }).lean();

    const coupleMap = new Map();
    couples.forEach((c) => {
      coupleMap.set(c.user1Id.toString(), c);
      coupleMap.set(c.user2Id.toString(), c);
    });

    // Get active purchases
    const purchases = await Purchase.find({
      userId: { $in: userIds },
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).lean();

    const purchaseMap = new Map<string, any[]>();
    purchases.forEach((p) => {
      const userId = p.userId.toString();
      if (!purchaseMap.has(userId)) {
        purchaseMap.set(userId, []);
      }
      purchaseMap.get(userId)!.push(p);
    });

    // Enrich users with subscription state
    const enrichedUsers = users.map((user) => {
      const entitlement = entitlementMap.get(user._id.toString());
      const couple = coupleMap.get(user._id.toString());
      const userPurchases = purchaseMap.get(user._id.toString()) || [];

      // Determine user state
      let userState: 'free' | 'premium' | 'trial' | 'lifetime' = 'free';
      if (entitlement) {
        const now = new Date();
        if (entitlement.tier === Tier.PREMIUM) {
          if (!entitlement.premiumEnd || entitlement.premiumEnd > now) {
            userState = 'premium';
          } else {
            userState = 'free';
          }
        } else if (entitlement.tier === Tier.TRIAL) {
          if (!entitlement.trialEnd || entitlement.trialEnd > now) {
            userState = 'trial';
          } else {
            userState = 'free';
          }
        } else {
          userState = 'free';
        }
      }

      // Check for lifetime (no expiry date on premium)
      if (
        entitlement?.tier === Tier.PREMIUM &&
        !entitlement.premiumEnd
      ) {
        userState = 'lifetime';
      }

      // Filter by tier if specified
      if (tier) {
        const tierMap: Record<string, string[]> = {
          free: ['free'],
          premium: ['premium', 'lifetime'],
          trial: ['trial'],
          lifetime: ['lifetime'],
        };
        if (!tierMap[tier as string]?.includes(userState)) {
          return null;
        }
      }

      return {
        ...user,
        subscriptionState: userState,
        entitlement: entitlement
          ? {
              tier: entitlement.tier,
              trialEnd: entitlement.trialEnd,
              premiumEnd: entitlement.premiumEnd,
              refreshesDefault: entitlement.refreshesDefault,
              refreshesPermanent: entitlement.refreshesPermanent,
            }
          : null,
        coupleId: couple?._id || null,
        partnerId: couple
          ? user._id.toString() === couple.user1Id.toString()
            ? couple.user2Id
            : couple.user1Id
          : null,
        activePurchases: userPurchases.length,
      };
    });

    // Filter out nulls if tier filter was applied
    const filteredUsers = enrichedUsers.filter((u) => u !== null);

    res.status(200).json({
      users: filteredUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: tier ? filteredUsers.length : total,
        totalPages: Math.ceil((tier ? filteredUsers.length : total) / limitNum),
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
 * @desc    Get single user details
 * @access  Private (Admin)
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -refreshTokens').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const entitlement = await UserEntitlement.findOne({ userId }).lean();
    const couple = await Couple.findOne({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    }).lean();

    const purchases = await Purchase.find({ userId }).sort({ createdAt: -1 }).lean();

    // Determine state
    let userState: 'free' | 'premium' | 'trial' | 'lifetime' = 'free';
    if (entitlement) {
      const now = new Date();
      if (entitlement.tier === Tier.PREMIUM) {
        if (!entitlement.premiumEnd || entitlement.premiumEnd > now) {
          userState = 'premium';
        }
      } else if (entitlement.tier === Tier.TRIAL) {
        if (!entitlement.trialEnd || entitlement.trialEnd > now) {
          userState = 'trial';
        }
      }
    }

    if (
      entitlement?.tier === Tier.PREMIUM &&
      !entitlement.premiumEnd
    ) {
      userState = 'lifetime';
    }

    res.status(200).json({
      user: {
        ...user,
        subscriptionState: userState,
      },
      entitlement,
      couple: couple
        ? {
            _id: couple._id,
            user1Id: couple.user1Id,
            user2Id: couple.user2Id,
            status: couple.status,
          }
        : null,
      purchases,
    });
  } catch (error: any) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      message: 'Server error while fetching user',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/users/:userId/grant-premium
 * @desc    Manually grant premium to a user
 * @access  Private (Admin)
 */
export const grantPremium = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { durationDays, isLifetime } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate expiry
    let premiumEnd: Date | undefined;
    if (!isLifetime && durationDays) {
      premiumEnd = new Date();
      premiumEnd.setDate(premiumEnd.getDate() + parseInt(durationDays));
    } else if (!isLifetime) {
      // Default to 30 days
      premiumEnd = new Date();
      premiumEnd.setDate(premiumEnd.getDate() + 30);
    }

    // Update or create entitlement
    const entitlement = await UserEntitlement.findOneAndUpdate(
      { userId },
      {
        userId,
        tier: Tier.PREMIUM,
        premiumEnd: isLifetime ? undefined : premiumEnd,
        refreshesDefault: 999, // Premium gets unlimited
      },
      { upsert: true, new: true }
    );

    // Update user subscribed flag
    user.subscribed = true;
    await user.save();

    // Update category access if user is in a couple
    if (user.coupleId) {
      await QuestionServiceEngine.updateCategoryAccessForTierChange(
        user.coupleId,
        Tier.PREMIUM
      );
    }

    // Create a purchase record for tracking
    if (!isLifetime) {
      await Purchase.create({
        userId: user._id,
        planType: 'monthly', // Admin grant
        amount: 0,
        currency: 'USD',
        status: 'active',
        startDate: new Date(),
        expiresAt: premiumEnd,
        autoRenew: false,
        purchaseToken: `admin_grant_${Date.now()}`,
        revenueCatStore: 'admin',
      });
    }

    res.status(200).json({
      success: true,
      message: `Premium ${isLifetime ? 'lifetime' : `granted until ${premiumEnd?.toISOString()}`}`,
      entitlement,
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
 * @desc    Manually revoke premium from a user
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

    // Downgrade entitlement to FREE
    const entitlement = await UserEntitlement.findOneAndUpdate(
      { userId },
      {
        tier: Tier.FREE,
        refreshesDefault: 1,
        premiumEnd: undefined,
        trialEnd: undefined,
      },
      { upsert: true, new: true }
    );

    // Update user subscribed flag
    user.subscribed = false;
    await user.save();

    // Cancel active purchases
    await Purchase.updateMany(
      {
        userId: user._id,
        status: 'active',
      },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
      }
    );

    // Update category access if user is in a couple
    if (user.coupleId) {
      await QuestionServiceEngine.updateCategoryAccessForTierChange(
        user.coupleId,
        Tier.FREE
      );
    }

    res.status(200).json({
      success: true,
      message: 'Premium revoked successfully',
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

/**
 * @route   POST /api/admin/users/:userId/refresh-bundle
 * @desc    Add refresh bundles to a user
 * @access  Private (Admin)
 */
export const addRefreshBundle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get couple for permanent refresh balance
    if (!user.coupleId) {
      res.status(400).json({ error: 'User is not in a couple' });
      return;
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      res.status(404).json({ error: 'Couple not found' });
      return;
    }

    // Add to permanent refresh balance
    couple.sharedData.permanentRefreshBalance =
      (couple.sharedData.permanentRefreshBalance || 0) + parseInt(amount);
    await couple.save();

    res.status(200).json({
      success: true,
      message: `Added ${amount} refresh bundles`,
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

