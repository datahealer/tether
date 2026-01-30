import { Request, Response } from 'express';
import { getRevenueCatService } from '../services/revenuecat/revenuecat.service';
import User from '../models/User';
import { Platform } from '../types/enums';

const getUserId = (req: Request): string | undefined => {
  const user = req.user as any;
  return user?.userId || user?.id || user?._id?.toString();
};

export const identifyUser = async (req: Request, res: Response): Promise<void> => {
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

    const revenueCat = getRevenueCatService();
    const revenueCatUser = await revenueCat.identifyUser(
      userId,
      user.email,
      user.platform
    );

    res.json({
      success: true,
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Identify user error:', error);
    res.status(500).json({
      error: error.message || 'Failed to identify user in RevenueCat',
    });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const revenueCat = getRevenueCatService();
    const revenueCatUser = await revenueCat.getUser(userId);

    res.json({
      success: true,
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get user from RevenueCat',
    });
  }
};

export const processPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId, transactionId, price, currency, store, period } = req.body;

    if (!productId || !store) {
      res.status(400).json({ error: 'Missing required fields: productId, store' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log('🛒 Processing manual purchase:', { userId, productId, store });

    // Map store parameter to RevenueCat format (lowercase required by API)
    let revenueCatStore: 'app_store' | 'play_store' | 'stripe' | 'promotional';
    const storeNormalized = store.toLowerCase();
    
    if (storeNormalized === 'ios' || storeNormalized === 'app_store') {
      revenueCatStore = 'app_store';
    } else if (storeNormalized === 'android' || storeNormalized === 'play_store') {
      revenueCatStore = 'play_store';
    } else if (storeNormalized === 'stripe') {
      revenueCatStore = 'stripe';
    } else if (storeNormalized === 'promotional') {
      revenueCatStore = 'promotional';
    } else {
      res.status(400).json({ 
        error: `Invalid store parameter: ${store}. Must be one of: ios, android, app_store, play_store, stripe, promotional` 
      });
      return;
    }

    const revenueCat = getRevenueCatService();
    
    // Process through RevenueCat API (optional - may not work in sandbox)
    try {
      await revenueCat.processPurchase({
        app_user_id: userId,
        product_id: productId,
        price: price || 0,
        currency: currency || 'USD',
        store: revenueCatStore,
        transaction_id: transactionId || `manual_${Date.now()}`,
        period,
      });
    } catch (rcError: any) {
      console.warn('⚠️ RevenueCat API call failed (expected in sandbox):', rcError.message);
    }

    // Manually trigger the same subscription activation logic used by webhooks
    // This ensures Purchase, UserEntitlement, and category access are all updated
    const mockWebhookEvent = {
      product_id: productId,
      transaction_id: transactionId || `manual_${Date.now()}`,
      purchased_at_ms: Date.now(),
      expiration_at_ms: Date.now() + (productId.includes('monthly') ? 30 : 365) * 24 * 60 * 60 * 1000,
      price: (price || 0) * 100, // Convert to cents
      currency: currency || 'USD',
      store: revenueCatStore.toUpperCase(),
    };

    console.log('🔄 Activating subscription via manual webhook simulation...');
    await (revenueCat as any).handleSubscriptionActivated(mockWebhookEvent, user);

    res.json({
      success: true,
      message: 'Purchase processed successfully',
      subscription: {
        isSubscribed: true,
        productId,
      },
    });
  } catch (error: any) {
    console.error('❌ Process purchase error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process purchase',
    });
  }
};

export const restorePurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const revenueCat = getRevenueCatService();
    const revenueCatUser = await revenueCat.restorePurchases(userId);

    res.json({
      success: true,
      message: 'Purchases restored',
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Restore purchases error:', error);
    res.status(500).json({
      error: error.message || 'Failed to restore purchases',
    });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔔 RevenueCat webhook received - Raw payload:', JSON.stringify(req.body, null, 2));
    
    const revenueCat = getRevenueCatService();
    await revenueCat.handleWebhook(req.body);

    console.log('✅ Webhook processed successfully');
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook handling error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: error.message || 'Failed to process webhook',
    });
  }
};

export const getOffering = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { offeringId } = req.query;
    const revenueCat = getRevenueCatService();
    const offering = await revenueCat.getOffering(userId, offeringId as string);

    res.json({
      success: true,
      offering,
    });
  } catch (error: any) {
    console.error('Get offering error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get offering',
    });
  }
};

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const revenueCat = getRevenueCatService();
    const revenueCatUser = await revenueCat.getUser(userId);

    // Get active subscription
    const subscriptions = revenueCatUser.subscriber?.subscriptions || {};
    const activeSubscription = Object.values(subscriptions).find(
      (sub: any) => sub.expires_date && new Date(sub.expires_date) > new Date()
    );

    if (!activeSubscription) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    // Note: RevenueCat doesn't have a direct cancel API endpoint
    // Cancellation is typically handled through the store (App Store/Play Store)
    // This endpoint updates our local database to mark cancellation
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Import Purchase model
    const Purchase = (await import('../models/Purchase')).default;
    const purchase = await Purchase.findOne({
      userId: user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (purchase) {
      purchase.autoRenew = false;
      purchase.cancelledAt = new Date();
      await purchase.save();
    }

    res.json({
      success: true,
      message: 'Subscription cancellation processed. Please cancel through your device settings.',
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: error.message || 'Failed to cancel subscription',
    });
  }
};

export const grantEntitlement = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { entitlementId, duration, productId } = req.body;

    if (!entitlementId || !duration) {
      res.status(400).json({ error: 'Missing required fields: entitlementId, duration (in seconds)' });
      return;
    }

    const revenueCat = getRevenueCatService();
    const revenueCatUser = await revenueCat.grantEntitlement(
      userId,
      entitlementId,
      duration,
      productId
    );

    res.json({
      success: true,
      message: 'Entitlement granted successfully',
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Grant entitlement error:', error);
    res.status(500).json({
      error: error.message || 'Failed to grant entitlement',
    });
  }
};

export const revokeEntitlement = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { entitlementId } = req.body;

    if (!entitlementId) {
      res.status(400).json({ error: 'Missing required field: entitlementId' });
      return;
    }

    const revenueCat = getRevenueCatService();
    const revenueCatUser = await revenueCat.revokeEntitlement(userId, entitlementId);

    res.json({
      success: true,
      message: 'Entitlement revoked successfully',
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Revoke entitlement error:', error);
    res.status(500).json({
      error: error.message || 'Failed to revoke entitlement',
    });
  }
};

export const getSubscriptionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const Purchase = (await import('../models/Purchase')).default;
    const purchases = await Purchase.find({ userId })
      .sort({ createdAt: -1 })
      .select('planType amount currency status startDate expiresAt autoRenew cancelledAt revenueCatProductId revenueCatStore createdAt')
      .lean();

    const revenueCat = getRevenueCatService();
    const revenueCatUser = await revenueCat.getUser(userId);

    res.json({
      success: true,
      purchases,
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get subscription history',
    });
  }
};

/**
 * POST /api/revenuecat/purchase-refreshes
 * Purchase permanent refresh bundle (non-consumable)
 */
export const purchaseRefreshes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId, transactionId, refreshCount, price, currency, store } = req.body;

    if (!productId || !refreshCount || !store) {
      res.status(400).json({ 
        error: 'Missing required fields: productId, refreshCount, store' 
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log('🔄 Processing refresh bundle purchase:', { 
      userId, 
      productId, 
      refreshCount,
      price,
      store 
    });

    // Get or create UserEntitlement
    const { UserEntitlement } = await import('../models/UserEntitlement');
    const entitlement = await UserEntitlement.findOne({ userId: user._id });

    if (!entitlement) {
      res.status(404).json({ error: 'User entitlement not found' });
      return;
    }

    // Add permanent refreshes
    entitlement.refreshesPermanent += refreshCount;
    await entitlement.save();

    console.log(`✅ Added ${refreshCount} permanent refreshes. New total: ${entitlement.refreshesPermanent}`);

    // Log the purchase in Purchase model
    const Purchase = (await import('../models/Purchase')).default;
    await Purchase.create({
      userId: user._id,
      planType: 'refresh_bundle',
      amount: price || 0,
      currency: currency || 'USD',
      status: 'completed',
      startDate: new Date(),
      purchaseToken: transactionId || `refresh_${Date.now()}`,
      revenueCatProductId: productId,
      revenueCatStore: store.toLowerCase(),
      metadata: {
        refreshCount,
        type: 'permanent_refresh',
      },
    });

    res.json({
      success: true,
      message: `Successfully added ${refreshCount} permanent refreshes`,
      refreshes: {
        default: entitlement.refreshesDefault,
        permanent: entitlement.refreshesPermanent,
        total: entitlement.refreshesDefault + entitlement.refreshesPermanent,
      },
    });
  } catch (error: any) {
    console.error('❌ Purchase refreshes error:', error);
    res.status(500).json({
      error: error.message || 'Failed to purchase refreshes',
    });
  }
};
