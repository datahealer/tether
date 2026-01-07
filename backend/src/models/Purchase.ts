import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  planType: 'yearly' | 'monthly' | 'trial';
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  expiresAt: Date;
  autoRenew: boolean;
  purchaseToken?: string;
  revenueCatTransactionId?: string;
  revenueCatOriginalTransactionId?: string;
  revenueCatProductId?: string;
  revenueCatStore?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ['yearly', 'monthly', 'trial'],
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
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
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
      index: true,
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
  },
  {
    timestamps: true,
  }
);

// Index for querying active subscriptions
PurchaseSchema.index({ userId: 1, status: 1, expiresAt: 1 });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);