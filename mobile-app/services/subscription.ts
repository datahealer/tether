import { authenticatedFetch } from './auth_service';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

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
 * Start a subscription trial
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
 * Subscribe to a paid plan
 */
export const subscribeToPlan = async (
  planType: 'yearly' | 'monthly',
  purchaseToken?: string
): Promise<{
  success: boolean;
  subscription: SubscriptionStatus;
  user: any;
}> => {
  try {
    console.log('🚀 Subscribing to plan:', planType);
    
    const response = await authenticatedFetch(`${API_URL}/api/subscription/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        planType,
        purchaseToken, // For app store receipt validation
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to subscribe');
    }

    const data = await response.json();
    console.log('✅ Subscription successful');
    
    return data;
  } catch (error) {
    console.error('❌ Subscribe error:', error);
    throw error;
  }
};

/**
 * Get current subscription status
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
 * Get available plans
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
