import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * RevenueCat SDK Configuration with Optimistic Error Handling
 * 
 * This service wraps RevenueCat SDK calls with error handling to prevent app crashes
 * on physical devices when using test API keys or when network is unavailable.
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
 * 
 * OPTIMISTIC ERROR HANDLING:
 * - Returns boolean (true = success, false = failure)
 * - Catches all errors gracefully
 * - Allows app to continue even if RevenueCat fails
 * - Works on physical devices with test API keys
 * 
 * @param userId - Unique identifier for the user
 * @returns Promise<boolean> - true if initialized successfully, false otherwise
 */
export const initializeRevenueCat = async (userId: string): Promise<boolean> => {
  try {
    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_APPLE_API_KEY 
      : REVENUECAT_GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn(
        `⚠️ RevenueCat ${Platform.OS === 'ios' ? 'Apple' : 'Google'} API key not configured. ` +
        `Subscription features will be limited.`
      );
      return false;
    }

    // Skip RevenueCat in production builds with test API keys
    // RevenueCat forces app closure when test keys are used in release builds
    if (!__DEV__ && apiKey.startsWith('test_')) {
      console.warn(
        `⚠️ Test API key detected in production build. ` +
        `RevenueCat will be disabled to prevent app crashes. ` +
        `Use production API keys for real subscriptions.`
      );
      return false;
    }

    // Check if already configured to prevent re-initialization errors
    try {
      await Purchases.getCustomerInfo();
      console.log('ℹ️ RevenueCat already initialized');
      return true;
    } catch (e) {
      // Not configured yet, proceed with initialization
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

    // Set user attributes for analytics (non-critical, catch errors)
    try {
      await Purchases.setAttributes({
        platform: Platform.OS,
        environment: __DEV__ ? 'development' : 'production',
      });
    } catch (attrError) {
      console.warn('⚠️ Failed to set RevenueCat attributes:', attrError);
    }

    return true;
  } catch (error: any) {
    console.error('❌ RevenueCat initialization failed:', error?.message || error);
    
    // Log specific error details for debugging
    if (error?.code) {
      console.error('Error code:', error.code);
    }
    
    // Return false instead of throwing - allow app to continue
    return false;
  }
};

/**
 * Get available subscription offerings from RevenueCat
 * This fetches the products you configured in the RevenueCat dashboard
 * 
 * OPTIMISTIC ERROR HANDLING:
 * - Returns null instead of throwing on errors
 * - Works gracefully on physical devices with test API
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
  } catch (error: any) {
    console.error('❌ Failed to get offerings:', error?.message || error);
    return null;
  }
};

/**
 * Check if user has active premium subscription
 * Checks both entitlements AND active subscriptions for maximum compatibility
 * 
 * OPTIMISTIC ERROR HANDLING:
 * - Returns safe defaults instead of throwing
 * - Works on physical devices with test API
 * - Prevents app crashes from subscription checks
 */
export const checkSubscriptionStatus = async (): Promise<{
  isPremium: boolean;
  expirationDate?: string;
  productId?: string;
  error?: boolean;
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
  } catch (error: any) {
    console.error('❌ Failed to check subscription status:', error?.message || error);
    
    // CRITICAL: Return safe default instead of throwing
    // This prevents app crashes on physical devices with test API
    return { 
      isPremium: false, 
      error: true 
    };
  }
};

/**
 * Purchase a subscription package
 * Checks both entitlements AND active subscriptions to determine premium status
 * 
 * OPTIMISTIC ERROR HANDLING:
 * - Returns structured response instead of throwing
 * - Differentiates between user cancellation and real errors
 * - Works with test API on physical devices
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
    // Handle user cancellation gracefully
    if (error.userCancelled) {
      console.log('ℹ️ User cancelled purchase');
      return {
        success: false,
        cancelled: true,
        message: 'Purchase cancelled',
      };
    }
    
    console.error('❌ Purchase failed:', error?.message || error);
    return {
      success: false,
      error: true,
      message: error?.message || 'Purchase failed',
    };
  }
};

/**
 * Restore previous purchases
 * Call this when user taps "Restore Purchases"
 * 
 * OPTIMISTIC ERROR HANDLING:
 * - Returns structured response instead of throwing
 * - Works with test API on physical devices
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
  } catch (error: any) {
    console.error('❌ Failed to restore purchases:', error?.message || error);
    
    // Return safe error response
    return {
      success: false,
      error: true,
      message: error?.message || 'Failed to restore purchases',
    };
  }
};

/**
 * Get customer info (subscription details)
 * 
 * OPTIMISTIC ERROR HANDLING:
 * - Returns null on error instead of throwing
 * - Prevents crashes from customer info fetches
 */
export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error: any) {
    console.error('❌ Failed to get customer info:', error?.message || error);
    return null;
  }
};

/**
 * Logout from RevenueCat (call when user logs out)
 * 
 * OPTIMISTIC ERROR HANDLING:
 * - Never throws, always completes silently
 * - Allows logout to proceed even if RevenueCat fails
 */
export const logoutRevenueCat = async (): Promise<void> => {
  try {
    await Purchases.logOut();
    console.log('👋 Logged out from RevenueCat');
  } catch (error: any) {
    console.warn('⚠️ Failed to logout from RevenueCat:', error?.message || error);
    // Silently continue - logout should never fail
  }
};

/**
 * Purchase a refresh bundle (non-consumable in-app purchase)
 * These are permanent refreshes that never expire
 * 
 * Product IDs must match RevenueCat configuration:
 * - refresh_3_shared: 3 permanent refreshes for $1.29
 * - refresh_6_shared: 6 permanent refreshes for $2.79
 * - refresh_10_shared: 10 permanent refreshes for $3.99
 * 
 * @param refreshCount - Number of refreshes (3, 6, or 10)
 * @returns Promise with purchase result and updated refresh balance
 */
export const purchaseRefreshBundle = async (refreshCount: 3 | 6 | 10) => {
  try {
    const productId = `refresh_${refreshCount}_shared`;
    console.log('💳 Purchasing refresh bundle:', productId);
    
    // Get the refresh bundles offering
    const offerings = await Purchases.getOfferings();
    const refreshOffering = offerings.all['refresh_bundles'];
    
    if (!refreshOffering) {
      console.error('❌ Refresh bundles offering not found in RevenueCat');
      return {
        success: false,
        error: true,
        message: 'Refresh bundles not available. Please try again later.',
      };
    }
    
    // Find the specific package
    const packageToPurchase = refreshOffering.availablePackages.find(
      pkg => pkg.product.identifier === productId
    );
    
    if (!packageToPurchase) {
      console.error(`❌ Package ${productId} not found`);
      return {
        success: false,
        error: true,
        message: 'Selected refresh bundle not available.',
      };
    }
    
    // Make the purchase
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    console.log('✅ Refresh bundle purchase successful from RevenueCat');
    console.log('📞 Calling backend to update permanent refresh balance...');
    
    // Call backend to add permanent refreshes
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const token = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('accessToken'));
      
      const response = await fetch(`${API_URL}/api/revenuecat/purchase-refreshes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          refreshCount,
          transactionId: customerInfo.originalAppUserId,
          price: packageToPurchase.product.price,
          currency: packageToPurchase.product.currencyCode,
          store: Platform.OS === 'ios' ? 'app_store' : 'play_store',
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Backend failed to update refreshes:', error);
        throw new Error(error.error || 'Failed to update refresh balance');
      }
      
      const data = await response.json();
      console.log('✅ Backend updated permanent refreshes:', data);
      
      return {
        success: true,
        refreshCount,
        productId,
        customerInfo,
        refreshData: data.refreshes,
      };
    } catch (backendError: any) {
      console.error('❌ Backend update failed:', backendError);
      // Purchase succeeded in RevenueCat but backend failed
      // Return partial success - user got the purchase but UI might not update immediately
      return {
        success: true,
        refreshCount,
        productId,
        customerInfo,
        backendError: backendError.message,
        message: 'Purchase successful, but refresh count may take a moment to update',
      };
    }
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.userCancelled) {
      console.log('ℹ️ User cancelled refresh bundle purchase');
      return {
        success: false,
        cancelled: true,
        message: 'Purchase cancelled',
      };
    }
    
    console.error('❌ Refresh bundle purchase failed:', error?.message || error);
    return {
      success: false,
      error: true,
      message: error?.message || 'Purchase failed',
    };
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
  purchaseRefreshBundle,
};
