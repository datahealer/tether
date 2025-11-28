import { Schema, model } from 'mongoose';
import { IPurchase } from '../types/interfaces';
import { PurchaseType } from '../types/enums';

const purchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',
    },
    type: {
      type: String,
      enum: Object.values(PurchaseType),
      required: true,
    },
    productId: {
      type: String,
      required: true, // e.g. "refresh_pack_1", "premium_monthly"
    },
    receipt: {
      type: String,
      required: true, // raw Apple/Google receipt
    },
    platform: {
      type: String,
      enum: ['ios', 'android'],
      required: true,
    },
    // Granted benefits
    grantedRefreshes: { type: Number, min: 0 },
    grantedShuffles: { type: Number, min: 0 },
    grantedPremiumUntil: Date,
    // Validation
    status: {
      type: String,
      enum: ['pending', 'validated', 'failed', 'refunded'],
      default: 'pending',
    },
     validationError: {
      type: String,
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ coupleId: 1 });
purchaseSchema.index({ receipt: 1 }); // prevent duplicate receipts

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);


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