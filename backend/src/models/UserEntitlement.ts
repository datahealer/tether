import { Schema, model } from 'mongoose';
import { IUserEntitlement } from '../types/interfaces';
import { Tier } from '../types/enums';

const userEntitlementSchema = new Schema<IUserEntitlement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    tier: {
      type: String,
      enum: Object.values(Tier),
      default: Tier.FREE,
      required: true,
    },
    refreshesDefault: {
      type: Number,
      default: 1, // Free tier gets 1 refresh per cycle
      min: 0,
    },
    refreshesPermanent: {
      type: Number,
      default: 0,
      min: 0,
    },
    trialEnd: {
      type: Date,
    },
    premiumEnd: {
      type: Date,
    },
  },
  { timestamps: true }
);

// userId index is automatically created by unique: true constraint
userEntitlementSchema.index({ tier: 1 });
userEntitlementSchema.index({ trialEnd: 1 });
userEntitlementSchema.index({ premiumEnd: 1 });

// Method to check if user has premium access
userEntitlementSchema.methods.hasPremiumAccess = function (): boolean {
  const now = new Date();
  
  if (this.tier === Tier.PREMIUM) {
    return !this.premiumEnd || this.premiumEnd > now;
  }
  
  if (this.tier === Tier.TRIAL) {
    return !this.trialEnd || this.trialEnd > now;
  }
  
  return false;
};

// Method to get available refreshes for a cycle
userEntitlementSchema.methods.getRefreshesForCycle = function (): number {
  if (this.hasPremiumAccess()) {
    return 3; // Premium/Trial get 3 refreshes per cycle
  }
  return this.refreshesDefault; // Free tier: 1
};

export const UserEntitlement = model<IUserEntitlement>(
  'UserEntitlement',
  userEntitlementSchema
);
