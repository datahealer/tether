import { Request, Response } from 'express';
import User from '../models/User';
import Purchase from '../models/Purchase';
import { getRevenueCatService } from '../services/revenuecat/revenuecat.service';

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

    // Get user document (not lean) so we can update subscription status
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Import UserEntitlement early
    const { UserEntitlement } = await import('../models/UserEntitlement');
    const { Tier } = await import('../questionServiceEngine');

    // Check if user has already used trial by checking trialEnd field
    const entitlement = await UserEntitlement.findOne({ userId: user._id });
    
    if (entitlement?.trialEnd) {
      // User has already used their trial (trialEnd exists means trial was activated before)
      res.status(400).json({ 
        error: 'Trial already used. Please choose a paid plan.',
        details: {
          trialUsedAt: entitlement.trialEnd,
          currentTier: entitlement.tier,
        }
      });
      return;
    }

    // Check if user already has premium subscription
    if (user.subscribed && entitlement?.tier === Tier.PREMIUM) {
      res.status(400).json({ 
        error: 'You already have an active premium subscription',
        subscription: {
          isSubscribed: true,
          planType: 'premium',
        }
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

    // Update UserEntitlement to TRIAL tier for both partners in the couple
    const Couple = (await import('../models/Couple')).default;
    const { QuestionServiceEngine } = await import('../questionServiceEngine');

    if (user.coupleId) {
      // Optimized: Use lean() for read-only query
      const couple = await Couple.findById(user.coupleId).select('user1Id user2Id').lean();
      if (couple) {
        const partnerIds = [couple.user1Id, couple.user2Id];
        
        // Optimized: Fetch all entitlements in parallel
        const entitlements = await Promise.all(
          partnerIds.map(partnerId => UserEntitlement.findOne({ userId: partnerId }))
        );
        
        // Optimized: Update/create entitlements in parallel with trialEnd date
        await Promise.all(
          entitlements.map((entitlement, index) => {
            const partnerId = partnerIds[index];
            if (entitlement) {
              entitlement.tier = Tier.TRIAL;
              entitlement.refreshesDefault = 3;
              entitlement.trialEnd = expiresAt; // Set trial expiration
              return entitlement.save().then(() => 
                console.log(`✅ Updated entitlement to TRIAL for user ${partnerId}, expires: ${expiresAt}`)
              );
            } else {
              return UserEntitlement.create({
                userId: partnerId,
                tier: Tier.TRIAL,
                refreshesDefault: 3,
                refreshesPermanent: 0,
                trialEnd: expiresAt, // Set trial expiration
              }).then(() => 
                console.log(`✅ Created TRIAL entitlement for user ${partnerId}, expires: ${expiresAt}`)
              );
            }
          })
        );
        
        // Update partner users' subscribed flag
        await Promise.all(
          partnerIds.map(partnerId => 
            User.findByIdAndUpdate(partnerId, { subscribed: true })
              .then(() => console.log(`✅ Set subscribed=true for user ${partnerId}`))
          )
        );
        
        // 🌟 UNLOCK ALL 10 CATEGORIES for trial
        await QuestionServiceEngine.updateCategoryAccessForTierChange(
          user.coupleId,
          Tier.TRIAL
        );
        console.log('🔓 Unlocked all categories for trial couple');
      }
    } else {
      // Single user (no couple yet) - update their entitlement
      if (entitlement) {
        entitlement.tier = Tier.TRIAL;
        entitlement.refreshesDefault = 3;
        entitlement.trialEnd = expiresAt; // Set trial expiration
        await entitlement.save();
      } else {
        await UserEntitlement.create({
          userId: user._id,
          tier: Tier.TRIAL,
          refreshesDefault: 3,
          refreshesPermanent: 0,
          trialEnd: expiresAt, // Set trial expiration
        });
      }
      console.log(`✅ Updated/created TRIAL entitlement for user ${user._id}, expires: ${expiresAt}`);
      console.log('ℹ️  Single user - categories will unlock when couple is formed');
    }

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
 * [DEPRECATED] Subscribe to a paid plan
 * 
 * ⚠️ THIS ENDPOINT IS DEPRECATED
 * Users must subscribe through the mobile app using RevenueCat SDK.
 * Real payments are processed through App Store/Google Play.
 * Backend receives webhook notifications from RevenueCat.
 */
export const subscribeToPlan = async (req: Request, res: Response): Promise<void> => {
  // Return 410 Gone - Endpoint deprecated
  res.status(410).json({
    error: 'This endpoint is deprecated',
    message: 'Please use in-app purchases through the mobile app. Subscriptions are now handled via RevenueCat SDK.',
    documentation: 'See PAYMENT_INTEGRATION_ACTION_PLAN.md for implementation details',
  });
  return;
  
  /* ORIGINAL IMPLEMENTATION DISABLED FOR SECURITY
  // This allowed users to subscribe without actual payment - SECURITY RISK
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

    // Optimized: Use lean() and select only needed fields
    const user = await User.findById(userId).select('coupleId _id').lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate plan details
    const planDetails = {
      yearly: {
        amount: 44.99,
        duration: 365,
        productId: 'premium_yearly',
      },
      monthly: {
        amount: 6.49,
        duration: 30,
        productId: 'premium_monthly',
      },
    };

    const plan = planDetails[planType as 'yearly' | 'monthly'];
    
    // Process through RevenueCat if purchaseToken provided
    let revenueCatData = null;
    if (purchaseToken) {
      try {
        const revenueCat = getRevenueCatService();
        revenueCatData = await revenueCat.processPurchase({
          app_user_id: userId,
          product_id: plan.productId,
          price: plan.amount * 100,
          currency: 'USD',
          store: user.platform === 'ios' ? 'app_store' : 'play_store',
          transaction_id: purchaseToken,
          period: planType === 'yearly' ? 'P1Y' : 'P1M',
        });
      } catch (error: any) {
        console.error('RevenueCat purchase processing error:', error);
        res.status(400).json({
          error: 'Failed to validate purchase with RevenueCat',
          details: error.message,
        });
        return;
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

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
      ...(revenueCatData && {
        revenueCatTransactionId: purchaseToken,
        revenueCatProductId: plan.productId,
        revenueCatStore: user.platform === 'ios' ? 'app_store' : 'play_store',
      }),
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
  */
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

    // Optimized: Use lean() and select only needed fields
    const user = await User.findById(userId).select('_id').lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Optimized: Use lean() for read-only query and select only needed fields
    const subscription = await Purchase.findOne({
      userId: user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .select('planType expiresAt autoRenew')
      .sort({ createdAt: -1 })
      .lean();

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
 * 
 * Behavior:
 * - For TRIAL: Immediately revokes access, sets tier to FREE, locks categories
 * - For PAID (monthly/yearly): Marks for cancellation at end of billing period (RevenueCat handles this)
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get user with coupleId (need it for partner updates)
    const user = await User.findById(userId).select('_id email coupleId subscribed').lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Find active subscription (need full document for save)
    const subscription = await Purchase.findOne({
      userId: user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (!subscription) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    // Import required models
    const { UserEntitlement } = await import('../models/UserEntitlement');
    const { Tier } = await import('../questionServiceEngine');
    const Couple = (await import('../models/Couple')).default;
    const { QuestionServiceEngine } = await import('../questionServiceEngine');

    const isTrial = subscription.planType === 'trial';
    
    // Mark subscription as cancelled
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    
    if (isTrial) {
      // TRIAL CANCELLATION: Immediate effect - check partner's subscription first
      subscription.status = 'cancelled';
      subscription.expiresAt = new Date(); // Expire immediately
      console.log(`🚫 Trial cancelled immediately for user: ${user.email}`);

      // 🔄 ONE PLAN PER COUPLE: Get partner IDs and check their subscriptions
      let partnerIds = [user._id];
      let newTier = Tier.FREE;
      
      if (user.coupleId) {
        const couple = await Couple.findById(user.coupleId).select('user1Id user2Id').lean();
        if (couple) {
          partnerIds = [couple.user1Id, couple.user2Id];
          const partnerId = partnerIds.find(id => id.toString() !== user._id.toString());
          
          if (partnerId) {
            // Check if partner has active subscription
            const partnerSubscription = await Purchase.findOne({
              userId: partnerId,
              status: 'active',
              expiresAt: { $gt: new Date() },
            });
            
            if (partnerSubscription) {
              // Partner has subscription - couple stays on that tier
              const planType = partnerSubscription.planType;
              newTier = planType === 'trial' ? Tier.TRIAL : Tier.PREMIUM;
              console.log(`✅ Partner has active ${planType} - couple remains on ${newTier} tier`);
            } else {
              console.log('⬇️ Partner also has no subscription - couple downgrading to FREE');
            }
          }
        }
      }

      // Update tier for all partners based on highest tier available
      await Promise.all(
        partnerIds.map(async (partnerId) => {
          const isCancellingUser = partnerId.toString() === user._id.toString();
          const entitlement = await UserEntitlement.findOne({ userId: partnerId });
          
          if (entitlement) {
            entitlement.tier = newTier;
            if (newTier === Tier.FREE) {
              entitlement.refreshesDefault = 1;
              entitlement.trialEnd = new Date();
            }
            await entitlement.save();
            console.log(`${isCancellingUser ? '🚫 Cancelling user' : '👥 Partner'} tier set to ${newTier}:`, partnerId);
          }
        })
      );

      // Update User.subscribed flag (only set to false if going to FREE tier)
      if (newTier === Tier.FREE) {
        await Promise.all(
          partnerIds.map(partnerId => 
            User.findByIdAndUpdate(partnerId, { subscribed: false })
              .then(() => console.log(`✅ Set subscribed=false for user ${partnerId}`))
          )
        );
      }

      // 🔒 Update category access based on new tier
      if (user.coupleId) {
        await QuestionServiceEngine.updateCategoryAccessForTierChange(
          user.coupleId,
          newTier
        );
        console.log(`🔒 Category access updated to ${newTier} tier`);
      }

      await subscription.save();

      res.status(200).json({
        success: true,
        message: newTier === Tier.FREE 
          ? 'Trial cancelled. You have been returned to the Free experience.'
          : `Trial cancelled. Your partner's subscription keeps you both on ${newTier} tier.`,
        subscription: {
          isSubscribed: newTier !== Tier.FREE,
          planType: newTier === Tier.FREE ? 'free' : newTier === Tier.TRIAL ? 'trial' : 'premium',
          expiresAt: new Date(),
          autoRenew: false,
        },
      });

    } else {
      // PAID PLAN CANCELLATION: Takes effect at end of billing period
      await subscription.save();
      
      console.log(`📅 Paid subscription (${subscription.planType}) marked for cancellation at end of period for user: ${user.email}`);
      console.log(`   Expires at: ${subscription.expiresAt}`);

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled. You will keep Premium access until the end of your current billing period.',
        subscription: {
          isSubscribed: true,
          planType: subscription.planType,
          expiresAt: subscription.expiresAt,
          autoRenew: false,
        },
      });
    }

  } catch (error: any) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({
      error: error.message || 'Failed to cancel subscription',
    });
  }
};
