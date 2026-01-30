import axios, { AxiosInstance } from 'axios';
import User from '../../models/User';
import Purchase from '../../models/Purchase';
import { UserEntitlement } from '../../models/UserEntitlement';
import { Platform, Tier } from '../../types/enums';
import { QuestionServiceEngine } from '../../questionServiceEngine';

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
  store: 'app_store' | 'play_store' | 'stripe' | 'promotional';
  transaction_id?: string;
}

interface RevenueCatWebhookEvent {
  type: string;
  event: {
    id: string;
    type: string;
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
    entitlement_id?: string;
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
      // First try to get the user, which will create them if they don't exist
      const response = await this.client.get(`/subscribers/${userId}`);
      return response.data;
    } catch (error: any) {
      // If 404, user doesn't exist yet - this is normal, just return empty user structure
      if (error.response?.status === 404) {
        console.log(`User ${userId} not found in RevenueCat, will be created on first purchase`);
        return {
          request_id: '',
          subscriber: {
            entitlements: {},
            first_seen: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            management_url: undefined,
            non_subscriptions: {},
            original_app_user_id: userId,
            original_application_version: undefined,
            other_purchases: {},
            subscriptions: {},
          },
        };
      }
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
      console.log('🔔 RevenueCat webhook received:', {
        type: event.type,
        eventType: event.event?.type,
        userId: event.event?.app_user_id,
        productId: event.event?.product_id,
      });

      const { event: webhookEvent } = event;
      const userId = webhookEvent.app_user_id || webhookEvent.original_app_user_id;

      if (!userId) {
        console.error('❌ User ID not found in webhook event');
        throw new Error('User ID not found in webhook event');
      }

      const user = await User.findById(userId);
      if (!user) {
        console.warn(`⚠️ User not found for RevenueCat webhook: ${userId}`);
        return;
      }

      // RevenueCat webhook type is at the top level
      const eventType = event.type || webhookEvent.type;
      console.log('📋 Processing webhook event type:', eventType);
      
      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'PRODUCT_CHANGE':
        case 'NON_RENEWING_PURCHASE':
          await this.handleSubscriptionActivated(webhookEvent, user);
          break;
        
        case 'CANCELLATION':
          await this.handleSubscriptionCancelled(webhookEvent, user);
          break;
        
        case 'EXPIRATION':
        case 'BILLING_ISSUE':
          await this.handleSubscriptionExpired(webhookEvent, user);
          break;
        
        case 'UNCANCELLATION':
          await this.handleSubscriptionUncancelled(webhookEvent, user);
          break;
        
        default:
          console.log(`ℹ️ Unhandled RevenueCat event type: ${eventType}`);
      }
    } catch (error: any) {
      console.error('❌ RevenueCat webhook handling error:', error);
      throw error;
    }
  }

  private getEventType(event: RevenueCatWebhookEvent): string {
    // RevenueCat sends the type at the top level of the webhook
    return event.type || event.event?.type || 'UNKNOWN';
  }

  private async handleSubscriptionActivated(event: any, user: any): Promise<void> {
    try {
      console.log('🎉 Activating subscription for user:', user.email);
      
      const expiresAt = event.expiration_at_ms 
        ? new Date(event.expiration_at_ms) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const planType = this.getPlanTypeFromProductId(event.product_id);
      console.log('📦 Plan type:', planType, 'Product ID:', event.product_id);

      // Update or create Purchase record
      await Purchase.findOneAndUpdate(
        {
          userId: user._id,
          purchaseToken: event.transaction_id,
        },
        {
          userId: user._id,
          planType,
          amount: event.price ? event.price / 100 : 0,
          currency: event.currency || 'USD',
          status: 'active',
          startDate: new Date(event.purchased_at_ms || Date.now()),
          expiresAt,
          autoRenew: true,
          purchaseToken: event.transaction_id,
          revenueCatProductId: event.product_id,
          revenueCatStore: event.store?.toLowerCase() || 'unknown',
        },
        { upsert: true, new: true }
      );

      // Update User subscription flag
      user.subscribed = true;
      await user.save();

      // Determine tier based on plan type
      const tier = planType === 'trial' ? Tier.TRIAL : Tier.PREMIUM;
      console.log('🎯 Setting tier to:', tier);

      // 🔄 ONE PLAN PER COUPLE: Get partner if user is in a couple
      let partnerIds = [user._id];
      if (user.coupleId) {
        const Couple = (await import('../../models/Couple')).default;
        const couple = await Couple.findById(user.coupleId).select('user1Id user2Id');
        if (couple) {
          partnerIds = [couple.user1Id, couple.user2Id];
          console.log('👥 Applying subscription to both partners in couple');
        }
      }

      // Update or create UserEntitlement for BOTH partners
      await Promise.all(
        partnerIds.map(async (partnerId) => {
          const isOriginalUser = partnerId.toString() === user._id.toString();
          
          await UserEntitlement.findOneAndUpdate(
            { userId: partnerId },
            {
              userId: partnerId,
              tier,
              ...(planType === 'trial' && { 
                trialEnd: expiresAt,
                refreshesDefault: 3,
              }),
              ...(planType !== 'trial' && { 
                premiumEnd: expiresAt,
                refreshesDefault: 3, // Premium gets 3 refreshes per cycle
              }),
            },
            { upsert: true, new: true }
          );
          
          // Update subscribed flag for both partners
          await User.findByIdAndUpdate(partnerId, { subscribed: true });
          
          console.log(`✅ ${isOriginalUser ? 'Subscriber' : 'Partner'} tier updated to ${tier}:`, partnerId);
        })
      );

      console.log('✅ Subscription activated:', {
        userId: user._id,
        email: user.email,
        tier,
        planType,
        expiresAt,
        partnersAffected: partnerIds.length,
      });

      // Update category access for the new tier
      if (user.coupleId) {
        await QuestionServiceEngine.updateCategoryAccessForTierChange(user.coupleId, tier);
        console.log('✅ Category access updated for couple:', user.coupleId);
      } else {
        console.log('⚠️ User has no couple, skipping category access update');
      }
    } catch (error: any) {
      console.error('❌ Error activating subscription:', error);
      throw error;
    }
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
    try {
      console.log('⏰ Handling subscription expiration for user:', user.email);
      
      const purchase = await Purchase.findOne({
        userId: user._id,
        purchaseToken: event.transaction_id,
      });

      if (purchase) {
        purchase.status = 'expired';
        await purchase.save();
        console.log('✅ Purchase marked as expired');
      }

      // Check if user has any other active subscriptions
      const activeSubscription = await Purchase.findOne({
        userId: user._id,
        status: 'active',
        expiresAt: { $gt: new Date() },
      });

      if (!activeSubscription) {
        user.subscribed = false;
        await user.save();
        
        // 🔄 ONE PLAN PER COUPLE: Check if partner has active subscription
        let newTier = Tier.FREE;
        let partnerIds = [user._id];
        
        if (user.coupleId) {
          const Couple = (await import('../../models/Couple')).default;
          const couple = await Couple.findById(user.coupleId).select('user1Id user2Id');
          
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
                // Partner still has subscription - couple stays on that tier
                const planType = partnerSubscription.planType;
                newTier = planType === 'trial' ? Tier.TRIAL : Tier.PREMIUM;
                console.log(`✅ Partner has active ${planType} - couple remains on ${newTier} tier`);
              } else {
                console.log('⬇️ Partner also has no subscription - couple downgrading to FREE');
              }
            }
          }
        }
        
        // Update tier for all partners in couple (or just user if solo)
        await Promise.all(
          partnerIds.map(async (partnerId) => {
            const isExpiredUser = partnerId.toString() === user._id.toString();
            
            await UserEntitlement.findOneAndUpdate(
              { userId: partnerId },
              {
                tier: newTier,
                ...(newTier === Tier.FREE && {
                  trialEnd: undefined,
                  premiumEnd: undefined,
                  refreshesDefault: 1,
                }),
              },
              { new: true }
            );
            
            // Only mark expired user as unsubscribed if going to FREE
            if (isExpiredUser && newTier === Tier.FREE) {
              await User.findByIdAndUpdate(partnerId, { subscribed: false });
            }
            
            console.log(`${isExpiredUser ? '⏰ Expired user' : '👥 Partner'} tier set to ${newTier}:`, partnerId);
          })
        );

        // Update category access
        if (user.coupleId) {
          await QuestionServiceEngine.updateCategoryAccessForTierChange(user.coupleId, newTier);
          console.log(`✅ Category access updated for couple - tier: ${newTier}`);
        }
      } else {
        console.log('ℹ️ User still has active subscription, not downgrading');
      }

      console.log('✅ Subscription expired for user:', user.email);
    } catch (error: any) {
      console.error('❌ Error handling subscription expiration:', error);
      throw error;
    }
  }

  private async handleBillingIssue(event: any, user: any): Promise<void> {
    console.warn(`⚠️ Billing issue for user: ${user.email}`);
    // Treat billing issues like expiration for now
    await this.handleSubscriptionExpired(event, user);
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
