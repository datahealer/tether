import { Platform } from 'react-native';
import { authenticatedFetch } from './auth_service';
import Constants from 'expo-constants';
import {
  initializeRevenueCat as initRevenueCat,
  getOfferings,
  purchasePackage as revenueCatPurchase,
  restorePurchases as revenueCatRestore,
  checkSubscriptionStatus as revenueCatCheckStatus,
  logoutRevenueCat,
} from './revenuecat';
import type { PurchasesPackage } from 'react-native-purchases';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// RevenueCat types
export interface RevenueCatUser {
  subscriber: {
    entitlements: Record<string, any>;
    subscriptions: Record<string, any>;
    original_app_user_id: string;
  };
}

export interface SubscriptionPlan {
  id: 'yearly' | 'monthly' | 'trial';
  name: string;
  price: string;
  priceAmount: number;
  currency: string;
  billing: string;
  duration: number; // in days
  badge?: string;
  savings?: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  planType?: 'yearly' | 'monthly' | 'trial';
  expiresAt?: string;
  autoRenew?: boolean;
}

/**
 * Initialize RevenueCat when user logs in
 */
export const initializeRevenueCat = async (userId: string): Promise<void> => {
  return initRevenueCat(userId);
};

/**
 * Get available subscription packages from RevenueCat
 * Returns packages configured in your RevenueCat dashboard
 */
export const getSubscriptionPackages = async (): Promise<PurchasesPackage[]> => {
  try {
    const offerings = await getOfferings();
    
    if (!offerings || !offerings.availablePackages.length) {
      throw new Error('No subscription packages available');
    }
    
    return offerings.availablePackages;
  } catch (error) {
    console.error('❌ Failed to get packages:', error);
    throw error;
  }
};

/**
 * Manually sync a purchase with the backend
 * This is needed because RevenueCat webhooks don't fire in test/sandbox mode
 */
export const manuallyProcessPurchase = async (
  customerInfo: any,
  packageToPurchase: any
): Promise<boolean> => {
  try {
    console.log('📤 Manually processing purchase with backend...');
    
    // Extract purchase details from customerInfo
    const activeSubscriptions = customerInfo.activeSubscriptions || [];
    const productId = packageToPurchase.product.identifier || packageToPurchase.identifier;
    
    // Get the latest transaction (non-subscription purchases)
    const latestTransaction = customerInfo.nonSubscriptionTransactions?.[0] ||
                             customerInfo.latestExpirationDate;
    
    const store = Platform.OS === 'ios' ? 'app_store' : 'play_store';
    
    console.log('📋 Purchase details:', {
      productId,
      store,
      activeSubscriptions,
    });
    
    // Call backend to process purchase
    const response = await authenticatedFetch(`${API_URL}/api/revenuecat/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        store,
        transactionId: `test_${Date.now()}_${productId}`,
        price: packageToPurchase.product?.price || 0,
        currency: packageToPurchase.product?.currencyCode || 'USD',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Backend purchase processing failed:', error);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Backend purchase processed successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Failed to manually process purchase:', error);
    return false;
  }
};

/**
 * Sync subscription status with backend (poll until webhook completes)
 * Waits for RevenueCat webhook to update backend database
 */
export const syncSubscriptionWithBackend = async (
  maxAttempts: number = 10,
  delayMs: number = 1500
): Promise<boolean> => {
  console.log('🔄 Syncing subscription with backend...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔍 Sync attempt ${attempt}/${maxAttempts}`);
      
      const status = await getSubscriptionStatus();
      
      if (status.isSubscribed) {
        console.log('✅ Backend sync complete - user is now subscribed!');
        return true;
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting ${delayMs}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`❌ Sync attempt ${attempt} failed:`, error);
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  console.log('⚠️ Backend sync timed out - webhook may still be processing');
  return false;
};

/**
 * Purchase a subscription package through RevenueCat
 * This triggers the native App Store/Play Store payment flow
 * IMPORTANT: Also syncs with backend to ensure database is updated
 */
export const purchaseSubscription = async (
  packageToPurchase: PurchasesPackage
): Promise<{
  success: boolean;
  isPremium: boolean;
  backendSynced: boolean;
}> => {
  try {
    const result = await revenueCatPurchase(packageToPurchase);
    
    if (!result.success || !result.isPremium) {
      return { ...result, backendSynced: false };
    }
    
    // Manually process purchase with backend (webhooks don't fire in test mode)
    console.log('⏳ Manually processing purchase with backend...');
    await manuallyProcessPurchase(result.customerInfo, packageToPurchase);
    
    // Wait a moment for database to update, then verify
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify backend has updated
    const backendSynced = await syncSubscriptionWithBackend(5, 1000);
    
    return { ...result, backendSynced };
  } catch (error: any) {
    console.error('❌ Purchase error:', error);
    throw error;
  }
};

/**
 * Start trial through backend (for testing/backwards compatibility)
 * Note: In production, trials should also go through RevenueCat
 */
export const startTrial = async (): Promise<{
  success: boolean;
  subscription: SubscriptionStatus;
  user: any;
}> => {
  try {
    console.log('🚀 Starting trial subscription...');
    
    const response = await authenticatedFetch(`${API_URL}/api/subscription/trial/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start trial');
    }

    const data = await response.json();
    console.log('✅ Trial started successfully');
    
    return data;
  } catch (error) {
    console.error('❌ Start trial error:', error);
    throw error;
  }
};

/**
 * [DEPRECATED] Subscribe to a paid plan via backend
 * This function is deprecated - use purchaseSubscription() with RevenueCat instead
 */
export const subscribeToPlan = async (
  planType: 'yearly' | 'monthly',
  purchaseToken?: string
): Promise<{
  success: boolean;
  subscription: SubscriptionStatus;
  user: any;
}> => {
  throw new Error(
    'This method is deprecated. Use purchaseSubscription() with RevenueCat SDK for real payments.'
  );
};

/**
 * Restore previous purchases through RevenueCat
 */
export const restoreSubscriptionPurchases = async (): Promise<{
  success: boolean;
  isPremium: boolean;
}> => {
  try {
    const result = await revenueCatRestore();
    
    // Wait for backend to sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return result;
  } catch (error) {
    console.error('❌ Restore purchases error:', error);
    throw error;
  }
};

/**
 * Check subscription status from RevenueCat
 */
export const checkRevenueCatSubscription = async (): Promise<{
  isPremium: boolean;
  expirationDate?: string;
  productId?: string;
}> => {
  try {
    return await revenueCatCheckStatus();
  } catch (error) {
    console.error('❌ Check subscription error:', error);
    throw error;
  }
};

/**
 * Get current subscription status from backend
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/subscription/status`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get subscription status');
    }

    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('❌ Get subscription status error:', error);
    throw error;
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/api/subscription/cancel`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    throw error;
  }
};

/**
 * Get available plans (static data for display)
 * Actual products come from RevenueCat, but use this for UI display
 */
export const getAvailablePlans = (): SubscriptionPlan[] => {
  return [
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$3.75 per month',
      priceAmount: 44.99,
      currency: 'USD',
      billing: 'Billed annually at $44.99',
      duration: 365,
      badge: 'Most Popular',
      savings: 'Save 42%',
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$6.49 per month',
      priceAmount: 6.49,
      currency: 'USD',
      billing: 'Billed monthly',
      duration: 30,
    },
    {
      id: 'trial',
      name: '7 Days of Premium',
      price: 'Free',
      priceAmount: 0,
      currency: 'USD',
      billing: '',
      duration: 7,
    },
  ];
};

/**
 * Map plan type to RevenueCat package identifier
 */
export const getPlanIdentifier = (planType: 'yearly' | 'monthly'): string => {
  // These must match your RevenueCat product identifiers
  return planType === 'yearly' ? 'tether_yearly' : 'tether_monthly';
};

/**
 * Logout from RevenueCat
 */
export const logoutFromRevenueCat = async (): Promise<void> => {
  return logoutRevenueCat();
};
