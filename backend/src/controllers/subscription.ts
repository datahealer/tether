import { Request, Response } from 'express';
import User from '../models/User';
import Purchase from '../models/Purchase';

// Helper function to get userId
const getUserId = (req: Request): string | undefined => {
  const user = req.user as any;
  return user?.userId || user?.id || user?._id?.toString();
};

/**
 * POST /api/subscription/trial/start
 * Start a 7-day trial subscription
 */
export const startTrial = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user already has an active subscription
    if (user.subscribed) {
      res.status(400).json({ 
        error: 'You already have an active subscription',
        subscription: {
          isSubscribed: true,
          planType: 'trial',
        }
      });
      return;
    }

    // Check if user has already used trial
    const existingTrial = await Purchase.findOne({
      userId: user._id,
      planType: 'trial',
    });

    if (existingTrial) {
      res.status(400).json({ 
        error: 'Trial already used. Please choose a paid plan.' 
      });
      return;
    }

    // Calculate trial expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create trial purchase record
    const purchase = await Purchase.create({
      userId: user._id,
      planType: 'trial',
      amount: 0,
      currency: 'USD',
      status: 'active',
      startDate: new Date(),
      expiresAt,
      autoRenew: false,
    });

    // Update user subscription status
    user.subscribed = true;
    await user.save();

    console.log('✅ Trial started for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Trial started successfully',
      subscription: {
        isSubscribed: true,
        planType: 'trial',
        expiresAt: purchase.expiresAt,
        autoRenew: false,
      },
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboarded: user.onboarded,
        subscribed: user.subscribed,
      },
    });
  } catch (error: any) {
    console.error('❌ Start trial error:', error);
    res.status(500).json({
      error: error.message || 'Failed to start trial',
    });
  }
};

/**
 * POST /api/subscription/subscribe
 * Subscribe to a paid plan
 */
export const subscribeToPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { planType, purchaseToken } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!planType || !['yearly', 'monthly'].includes(planType)) {
      res.status(400).json({ error: 'Invalid plan type' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate plan details
    const planDetails = {
      yearly: {
        amount: 44.99,
        duration: 365,
      },
      monthly: {
        amount: 6.49,
        duration: 30,
      },
    };

    const plan = planDetails[planType as 'yearly' | 'monthly'];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // TODO: Validate purchaseToken with app store/play store
    // For now, we'll assume validation is successful

    // Create purchase record
    const purchase = await Purchase.create({
      userId: user._id,
      planType,
      amount: plan.amount,
      currency: 'USD',
      status: 'active',
      startDate: new Date(),
      expiresAt,
      autoRenew: true,
      purchaseToken,
    });

    // Update user subscription status
    user.subscribed = true;
    await user.save();

    console.log('✅ Subscription created for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Subscription successful',
      subscription: {
        isSubscribed: true,
        planType,
        expiresAt: purchase.expiresAt,
        autoRenew: true,
      },
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboarded: user.onboarded,
        subscribed: user.subscribed,
      },
    });
  } catch (error: any) {
    console.error('❌ Subscribe error:', error);
    res.status(500).json({
      error: error.message || 'Failed to subscribe',
    });
  }
};

/**
 * GET /api/subscription/status
 * Get current subscription status
 */
export const getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get active subscription
    const subscription = await Purchase.findOne({
      userId: user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!subscription) {
      res.status(200).json({
        success: true,
        subscription: {
          isSubscribed: false,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      subscription: {
        isSubscribed: true,
        planType: subscription.planType,
        expiresAt: subscription.expiresAt,
        autoRenew: subscription.autoRenew,
      },
    });
  } catch (error: any) {
    console.error('❌ Get subscription status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get subscription status',
    });
  }
};

/**
 * POST /api/subscription/cancel
 * Cancel active subscription
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Find active subscription
    const subscription = await Purchase.findOne({
      userId: user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (!subscription) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    // Disable auto-renewal
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    await subscription.save();

    console.log('✅ Subscription cancelled for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Subscription will not auto-renew after expiration',
      subscription: {
        isSubscribed: true,
        planType: subscription.planType,
        expiresAt: subscription.expiresAt,
        autoRenew: false,
      },
    });
  } catch (error: any) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({
      error: error.message || 'Failed to cancel subscription',
    });
  }
};
