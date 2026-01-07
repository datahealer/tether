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
    const revenueCatUser = await revenueCat.processPurchase({
      app_user_id: userId,
      product_id: productId,
      price: price || 0,
      currency: currency || 'USD',
      store: revenueCatStore,
      transaction_id: transactionId || `manual_${Date.now()}`,
      period,
    });

    // Update user subscription in database
    await User.findByIdAndUpdate(userId, {
      subscribed: true,
      subscriptionType: productId.includes('yearly') ? 'yearly' : 'monthly',
      subscriptionStartDate: new Date(),
    });

    res.json({
      success: true,
      message: 'Purchase processed successfully',
      revenueCatUser,
    });
  } catch (error: any) {
    console.error('Process purchase error:', error);
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
    const revenueCat = getRevenueCatService();
    await revenueCat.handleWebhook(req.body);

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook handling error:', error);
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
