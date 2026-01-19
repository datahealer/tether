import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * RevenueCat SDK Configuration
 * 
 * IMPORTANT: Get your PUBLIC API keys from RevenueCat Dashboard:
 * 1. Go to RevenueCat Dashboard → Your Project
 * 2. Click on "API Keys" in the left sidebar
 * 3. Under "Public app-specific API keys":
 *    - iOS: Copy the key starting with "appl_"
 *    - Android: Copy the key starting with "goog_"
 * 
 * Add them to your .env file as:
 * EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_xxxxx
 * EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_xxxxx
 * 
 * DO NOT use Secret API keys (sk_xxx) - they are for backend only!
 */

// Get PUBLIC API keys directly from environment variables
const REVENUECAT_APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
const REVENUECAT_GOOGLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';

/**
 * Initialize RevenueCat SDK
 * Call this when user logs in or app starts
 */
export const initializeRevenueCat = async (userId: string): Promise<void> => {
  try {
    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_APPLE_API_KEY 
      : REVENUECAT_GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error(
        `RevenueCat ${Platform.OS === 'ios' ? 'Apple' : 'Google'} API key not configured. ` +
        `Please add EXPO_PUBLIC_REVENUECAT_${Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE'}_KEY to your .env file`
      );
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    // Enable debug logs in development
    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      console.log('✅ RevenueCat initialized in DEBUG mode for user:', userId);
    } else {
      await Purchases.setLogLevel(LOG_LEVEL.INFO);
      console.log('✅ RevenueCat initialized for user:', userId);
    }

    // Set user attributes for analytics
    await Purchases.setAttributes({
      platform: Platform.OS,
      environment: __DEV__ ? 'development' : 'production',
    });

  } catch (error) {
    console.error('❌ RevenueCat initialization failed:', error);
    throw error;
  }
};

/**
 * Get available subscription offerings from RevenueCat
 * This fetches the products you configured in the RevenueCat dashboard
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current && offerings.current.availablePackages.length > 0) {
      console.log('📦 Available packages:', offerings.current.availablePackages.length);
      return offerings.current;
    }
    
    console.warn('⚠️ No offerings available from RevenueCat');
    return null;
  } catch (error) {
    console.error('❌ Failed to get offerings:', error);
    throw error;
  }
};

/**
 * Check if user has active premium subscription
 * Checks both entitlements AND active subscriptions for maximum compatibility
 */
export const checkSubscriptionStatus = async (): Promise<{
  isPremium: boolean;
  expirationDate?: string;
  productId?: string;
}> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    
    // Method 1: Check if user has active 'premium' entitlement (if configured in RevenueCat)
    const hasPremiumEntitlement = customerInfo.entitlements.active['premium'] !== undefined;
    
    if (hasPremiumEntitlement) {
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      console.log('✅ Premium entitlement found:', premiumEntitlement.productIdentifier);
      return {
        isPremium: true,
        expirationDate: premiumEntitlement.expirationDate || undefined,
        productId: premiumEntitlement.productIdentifier,
      };
    }
    
    // Method 2: Check active subscriptions directly (fallback for test mode)
    const activeSubscriptions = customerInfo.activeSubscriptions;
    if (activeSubscriptions && activeSubscriptions.length > 0) {
      console.log('✅ Active subscriptions found:', activeSubscriptions);
      
      // Get the first active subscription
      const subscriptionKey = activeSubscriptions[0];
      const subscription = customerInfo.allPurchasedProductIdentifiers.includes(subscriptionKey);
      
      if (subscription) {
        return {
          isPremium: true,
          productId: subscriptionKey,
        };
      }
    }
    
    console.log('ℹ️ No premium access found');
    return { isPremium: false };
  } catch (error) {
    console.error('❌ Failed to check subscription status:', error);
    throw error;
  }
};

/**
 * Purchase a subscription package
 * Checks both entitlements AND active subscriptions to determine premium status
 */
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    console.log('💳 Initiating purchase for:', packageToPurchase.identifier);
    
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Method 1: Check if user has premium entitlement
    let isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    // Method 2: If no entitlement, check active subscriptions (for test mode & non-configured entitlements)
    if (!isPremium) {
      const activeSubscriptions = customerInfo.activeSubscriptions;
      isPremium = activeSubscriptions && activeSubscriptions.length > 0;
      
      if (isPremium) {
        console.log('✅ Purchase successful - Active subscriptions:', activeSubscriptions);
      }
    } else {
      console.log('✅ Purchase successful - Premium entitlement active');
    }
    
    console.log('✅ Purchase successful, isPremium:', isPremium);
    
    return {
      success: true,
      isPremium,
      customerInfo,
    };
  } catch (error: any) {
    // Handle user cancellation
    if (error.userCancelled) {
      console.log('ℹ️ User cancelled purchase');
      throw new Error('Purchase cancelled');
    }
    
    console.error('❌ Purchase failed:', error);
    throw error;
  }
};

/**
 * Restore previous purchases
 * Call this when user taps "Restore Purchases"
 */
export const restorePurchases = async () => {
  try {
    console.log('🔄 Restoring purchases...');
    
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    console.log('✅ Purchases restored, isPremium:', isPremium);
    
    return {
      success: true,
      isPremium,
      customerInfo,
    };
  } catch (error) {
    console.error('❌ Failed to restore purchases:', error);
    throw error;
  }
};

/**
 * Get customer info (subscription details)
 */
export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('❌ Failed to get customer info:', error);
    throw error;
  }
};

/**
 * Logout from RevenueCat (call when user logs out)
 */
export const logoutRevenueCat = async () => {
  try {
    await Purchases.logOut();
    console.log('👋 Logged out from RevenueCat');
  } catch (error) {
    console.error('❌ Failed to logout from RevenueCat:', error);
  }
};

export default {
  initializeRevenueCat,
  getOfferings,
  checkSubscriptionStatus,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  logoutRevenueCat,
};
