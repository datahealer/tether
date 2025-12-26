import axios, { AxiosInstance } from 'axios';
import User from '../../models/User';
import Purchase from '../../models/Purchase';
import { Platform } from '../../types/enums';

interface RevenueCatConfig {
  apiKey: string;
  baseURL?: string;
  sandbox?: boolean;
}

interface RevenueCatUser {
  request_id: string;
  subscriber: {
    entitlements: Record<string, any>;
    first_seen: string;
    last_seen: string;
    management_url?: string;
    non_subscriptions: Record<string, any>;
    original_app_user_id: string;
    original_application_version?: string;
    other_purchases: Record<string, any>;
    subscriptions: Record<string, any>;
  };
}

interface RevenueCatPurchase {
  app_user_id: string;
  product_id: string;
  price: number;
  currency: string;
  period?: string;
  is_restore?: boolean;
  presented_offering_id?: string;
  store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
  transaction_id?: string;
}

interface RevenueCatWebhookEvent {
  event: {
    id: string;
    app_id: string;
    app_user_id: string;
    aliases: string[];
    original_app_user_id: string;
    product_id: string;
    period_type: 'NORMAL' | 'TRIAL' | 'INTRO';
    purchased_at_ms: number;
    expiration_at_ms?: number;
    environment: 'SANDBOX' | 'PRODUCTION';
    entitlement_ids?: string[];
    presented_offering_id?: string;
    store: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTICAL';
    transaction_id: string;
    original_transaction_id: string;
    is_family_share?: boolean;
    currency: string;
    price: number;
    price_in_purchased_currency: number;
    subscriber_attributes?: Record<string, any>;
    takehome_percentage?: number;
    commission_percentage?: number;
    event_timestamp_ms: number;
  };
  api_version: string;
}

class RevenueCatService {
  private client: AxiosInstance;
  private apiKey: string;
  private sandbox: boolean;

  constructor(config: RevenueCatConfig) {
    this.apiKey = config.apiKey;
    this.sandbox = config.sandbox ?? false;
    
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.revenuecat.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Platform': 'server',
      },
    });
  }

  async identifyUser(userId: string, email?: string, platform?: Platform): Promise<RevenueCatUser> {
    try {
      const response = await this.client.post(`/subscribers/${userId}`, {
        app_user_id: userId,
        ...(email && { email }),
        ...(platform && { platform: platform.toUpperCase() }),
      });

      return response.data;
    } catch (error: any) {
      console.error('RevenueCat identify user error:', error.response?.data || error.message);
      throw new Error(`Failed to identify user in RevenueCat: ${error.response?.data?.message || error.message}`);
    }
  }

  async getUser(userId: string): Promise<RevenueCatUser> {
    try {
      const response = await this.client.get(`/subscribers/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return this.identifyUser(userId);
      }
      console.error('RevenueCat get user error:', error.response?.data || error.message);
      throw new Error(`Failed to get user from RevenueCat: ${error.response?.data?.message || error.message}`);
    }
  }

  async grantEntitlement(
    userId: string,
    entitlementId: string,
    duration: number,
    productId?: string
  ): Promise<RevenueCatUser> {
    try {
      const response = await this.client.post(`/subscribers/${userId}/entitlements/${entitlementId}`, {
        duration: `${duration}s`,
        ...(productId && { product_id: productId }),
      });

      return response.data;
    } catch (error: any) {
      console.error('RevenueCat grant entitlement error:', error.response?.data || error.message);
      throw new Error(`Failed to grant entitlement: ${error.response?.data?.message || error.message}`);
    }
  }

  async revokeEntitlement(userId: string, entitlementId: string): Promise<RevenueCatUser> {
    try {
      const response = await this.client.delete(`/subscribers/${userId}/entitlements/${entitlementId}`);
      return response.data;
    } catch (error: any) {
      console.error('RevenueCat revoke entitlement error:', error.response?.data || error.message);
      throw new Error(`Failed to revoke entitlement: ${error.response?.data?.message || error.message}`);
    }
  }

  async processPurchase(purchase: RevenueCatPurchase): Promise<RevenueCatUser> {
    try {
      const response = await this.client.post(`/receipts`, {
        app_user_id: purchase.app_user_id,
        fetch_token: purchase.transaction_id || '',
        product_id: purchase.product_id,
        price: purchase.price,
        currency: purchase.currency,
        ...(purchase.period && { period: purchase.period }),
        ...(purchase.is_restore && { is_restore: purchase.is_restore }),
        ...(purchase.presented_offering_id && { presented_offering_id: purchase.presented_offering_id }),
        store: purchase.store,
      });

      return response.data;
    } catch (error: any) {
      console.error('RevenueCat process purchase error:', error.response?.data || error.message);
      throw new Error(`Failed to process purchase: ${error.response?.data?.message || error.message}`);
    }
  }

  async handleWebhook(event: RevenueCatWebhookEvent): Promise<void> {
    try {
      const { event: webhookEvent } = event;
      const userId = webhookEvent.app_user_id || webhookEvent.original_app_user_id;

      if (!userId) {
        throw new Error('User ID not found in webhook event');
      }

      const user = await User.findById(userId);
      if (!user) {
        console.warn(`User not found for RevenueCat webhook: ${userId}`);
        return;
      }

      const eventType = this.getEventType(event);
      
      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'PRODUCT_CHANGE':
          await this.handleSubscriptionActivated(webhookEvent, user);
          break;
        
        case 'CANCELLATION':
          await this.handleSubscriptionCancelled(webhookEvent, user);
          break;
        
        case 'EXPIRATION':
          await this.handleSubscriptionExpired(webhookEvent, user);
          break;
        
        case 'BILLING_ISSUE':
          await this.handleBillingIssue(webhookEvent, user);
          break;
        
        case 'UNCANCELLATION':
          await this.handleSubscriptionUncancelled(webhookEvent, user);
          break;
        
        default:
          console.log(`Unhandled RevenueCat event type: ${eventType}`);
      }
    } catch (error: any) {
      console.error('RevenueCat webhook handling error:', error);
      throw error;
    }
  }

  private getEventType(event: RevenueCatWebhookEvent): string {
    const eventId = event.event.id;
    
    if (eventId.includes('INITIAL_PURCHASE')) return 'INITIAL_PURCHASE';
    if (eventId.includes('RENEWAL')) return 'RENEWAL';
    if (eventId.includes('CANCELLATION')) return 'CANCELLATION';
    if (eventId.includes('EXPIRATION')) return 'EXPIRATION';
    if (eventId.includes('BILLING_ISSUE')) return 'BILLING_ISSUE';
    if (eventId.includes('UNCANCELLATION')) return 'UNCANCELLATION';
    if (eventId.includes('PRODUCT_CHANGE')) return 'PRODUCT_CHANGE';
    
    return 'UNKNOWN';
  }

  private async handleSubscriptionActivated(event: any, user: any): Promise<void> {
    const expiresAt = event.expiration_at_ms 
      ? new Date(event.expiration_at_ms) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const planType = this.getPlanTypeFromProductId(event.product_id);

    await Purchase.findOneAndUpdate(
      {
        userId: user._id,
        purchaseToken: event.transaction_id,
      },
      {
        userId: user._id,
        planType,
        amount: event.price / 100,
        currency: event.currency,
        status: 'active',
        startDate: new Date(event.purchased_at_ms),
        expiresAt,
        autoRenew: true,
        purchaseToken: event.transaction_id,
      },
      { upsert: true, new: true }
    );

    user.subscribed = true;
    await user.save();

    console.log(`✅ Subscription activated for user: ${user.email}`);
  }

  private async handleSubscriptionCancelled(event: any, user: any): Promise<void> {
    const purchase = await Purchase.findOne({
      userId: user._id,
      purchaseToken: event.transaction_id,
    });

    if (purchase) {
      purchase.autoRenew = false;
      purchase.cancelledAt = new Date();
      await purchase.save();
    }

    console.log(`✅ Subscription cancelled for user: ${user.email}`);
  }

  private async handleSubscriptionExpired(event: any, user: any): Promise<void> {
    const purchase = await Purchase.findOne({
      userId: user._id,
      purchaseToken: event.transaction_id,
    });

    if (purchase) {
      purchase.status = 'expired';
      await purchase.save();
    }

    const activeSubscription = await Purchase.findOne({
      userId: user._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (!activeSubscription) {
      user.subscribed = false;
      await user.save();
    }

    console.log(`✅ Subscription expired for user: ${user.email}`);
  }

  private async handleBillingIssue(event: any, user: any): Promise<void> {
    console.warn(`⚠️ Billing issue for user: ${user.email}`);
  }

  private async handleSubscriptionUncancelled(event: any, user: any): Promise<void> {
    const purchase = await Purchase.findOne({
      userId: user._id,
      purchaseToken: event.transaction_id,
    });

    if (purchase) {
      purchase.autoRenew = true;
      purchase.cancelledAt = undefined;
      await purchase.save();
    }

    console.log(`✅ Subscription uncancelled for user: ${user.email}`);
  }

  private getPlanTypeFromProductId(productId: string): 'yearly' | 'monthly' | 'trial' {
    if (productId.includes('yearly') || productId.includes('annual')) {
      return 'yearly';
    }
    if (productId.includes('monthly')) {
      return 'monthly';
    }
    return 'trial';
  }

  async getOffering(userId: string, offeringId?: string): Promise<any> {
    try {
      const user = await this.getUser(userId);
      const offerings = user.subscriber?.subscriptions || {};
      
      if (offeringId) {
        return offerings[offeringId];
      }
      
      return offerings;
    } catch (error: any) {
      console.error('RevenueCat get offering error:', error);
      throw error;
    }
  }

  async restorePurchases(userId: string): Promise<RevenueCatUser> {
    try {
      const user = await this.getUser(userId);
      
      if (user.subscriber?.entitlements) {
        const hasActiveEntitlement = Object.values(user.subscriber.entitlements).some(
          (entitlement: any) => entitlement.expires_date && new Date(entitlement.expires_date) > new Date()
        );

        if (hasActiveEntitlement) {
          const activeUser = await User.findById(userId);
          if (activeUser) {
            activeUser.subscribed = true;
            await activeUser.save();
          }
        }
      }

      return user;
    } catch (error: any) {
      console.error('RevenueCat restore purchases error:', error);
      throw error;
    }
  }
}

let revenueCatService: RevenueCatService | null = null;

export const initializeRevenueCat = (config: RevenueCatConfig): RevenueCatService => {
  revenueCatService = new RevenueCatService(config);
  return revenueCatService;
};

export const getRevenueCatService = (): RevenueCatService => {
  if (!revenueCatService) {
    throw new Error('RevenueCat service not initialized. Call initializeRevenueCat first.');
  }
  return revenueCatService;
};

export default RevenueCatService;
