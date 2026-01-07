import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * RevenueCat SDK Configuration
 * 
 * IMPORTANT: Get your API keys from RevenueCat Dashboard
 * - iOS: Project Settings → API Keys → Public app-specific API keys
 * - Android: Project Settings → API Keys → Public app-specific API keys
 * 
 * These are PUBLIC keys safe to include in the app
 */

// TODO: Replace with your actual RevenueCat API keys from the dashboard
const REVENUECAT_APPLE_API_KEY = 'appl_YOUR_KEY_HERE';  // iOS public key
const REVENUECAT_GOOGLE_API_KEY = 'goog_YOUR_KEY_HERE'; // Android public key

/**
 * Initialize RevenueCat SDK
 * Call this when user logs in or app starts
 */
export const initializeRevenueCat = async (userId: string): Promise<void> => {
  try {
    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_APPLE_API_KEY 
      : REVENUECAT_GOOGLE_API_KEY;

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
 */
export const checkSubscriptionStatus = async (): Promise<{
  isPremium: boolean;
  expirationDate?: string;
  productId?: string;
}> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    
    // Check if user has active 'premium' entitlement
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    if (isPremium) {
      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      return {
        isPremium: true,
        expirationDate: premiumEntitlement.expirationDate || undefined,
        productId: premiumEntitlement.productIdentifier,
      };
    }
    
    return { isPremium: false };
  } catch (error) {
    console.error('❌ Failed to check subscription status:', error);
    throw error;
  }
};

/**
 * Purchase a subscription package
 */
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    console.log('💳 Initiating purchase for:', packageToPurchase.identifier);
    
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Check if user now has premium
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
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
