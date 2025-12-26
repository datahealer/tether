// import { Schema, model } from 'mongoose';
// import { IPurchase } from '../types/interfaces';
// import { PurchaseType } from '../types/enums';

// const purchaseSchema = new Schema<IPurchase>(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     coupleId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Couple',
//     },
//     type: {
//       type: String,
//       enum: Object.values(PurchaseType),
//       required: true,
//     },
//     productId: {
//       type: String,
//       required: true, // e.g. "refresh_pack_1", "premium_monthly"
//     },
//     receipt: {
//       type: String,
//       required: true, // raw Apple/Google receipt
//     },
//     platform: {
//       type: String,
//       enum: ['ios', 'android'],
//       required: true,
//     },
//     // Granted benefits
//     grantedRefreshes: { type: Number, min: 0 },
//     grantedShuffles: { type: Number, min: 0 },
//     grantedPremiumUntil: Date,
//     // Validation
//     status: {
//       type: String,
//       enum: ['pending', 'validated', 'failed', 'refunded'],
//       default: 'pending',
//     },
//      validationError: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// purchaseSchema.index({ userId: 1, createdAt: -1 });
// purchaseSchema.index({ coupleId: 1 });
// purchaseSchema.index({ receipt: 1 }); // prevent duplicate receipts

// export const Purchase = model<IPurchase>('Purchase', purchaseSchema);


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
      enum: ['APP_STORE', 'PLAY_STORE', 'STRIPE', 'PROMOTICAL'],
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


// export interface IPurchase {
//   userId: string;
//   coupleId?: string;
//   type: PurchaseType;
//   productId: string;
//   receipt: string;
//   platform: 'ios' | 'android';
//   grantedRefreshes?: number;
//   grantedShuffles?: number;
//   grantedPremiumUntil?: Date;
//   status?: 'pending' | 'validated' | 'failed' | 'refunded';
//   validationError?: string;
// }