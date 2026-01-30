import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  planType: 'yearly' | 'monthly' | 'trial' | 'refresh_bundle' | 'pack_unlock';
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled' | 'completed';
  startDate: Date;
  expiresAt?: Date;
  autoRenew: boolean;
  purchaseToken?: string;
  revenueCatTransactionId?: string;
  revenueCatOriginalTransactionId?: string;
  revenueCatProductId?: string;
  revenueCatStore?: string;
  cancelledAt?: Date;
  metadata?: {
    refreshCount?: number;
    categoryId?: string;
    unlockDuration?: number;
    type?: 'permanent_refresh' | 'temporary_pack_unlock';
  };
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: ['yearly', 'monthly', 'trial', 'refresh_bundle', 'pack_unlock'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'completed'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    purchaseToken: {
      type: String,
    },
    revenueCatTransactionId: {
      type: String,
    },
    revenueCatOriginalTransactionId: {
      type: String,
    },
    revenueCatProductId: {
      type: String,
    },
    revenueCatStore: {
      type: String,
      enum: ['app_store', 'play_store', 'stripe', 'promotional'],
    },
    cancelledAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying active subscriptions
PurchaseSchema.index({ userId: 1, status: 1, expiresAt: 1 });
PurchaseSchema.index({ revenueCatTransactionId: 1 }); // For transaction lookups

// Indexes for analytics queries
PurchaseSchema.index({ createdAt: -1 }); // For trends and revenue analytics
PurchaseSchema.index({ status: 1, expiresAt: 1 }); // For active subscriptions
PurchaseSchema.index({ planType: 1, status: 1 }); // For plan type analytics
PurchaseSchema.index({ revenueCatStore: 1 }); // For store analytics
PurchaseSchema.index({ cancelledAt: 1 }); // For churn analysis
PurchaseSchema.index({ createdAt: 1, planType: 1 }); // For revenue by plan type

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);