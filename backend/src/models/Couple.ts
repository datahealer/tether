import { Schema, model } from 'mongoose';
import { ICouple } from '../types/interfaces';
import { Rhythm, SubscriptionTier } from '../types/enums';

const coupleSchema = new Schema<ICouple>({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  rhythm: { type: String, enum: Object.values(Rhythm), required: true },
  subscriptionTier: {
    type: String,
    enum: Object.values(SubscriptionTier),
    default: SubscriptionTier.FREE,
  },
  trialEndsAt: Date,
  premiumExpiresAt: Date,
  sharedRefreshesRemaining: { type: Number, default: 0 },
  shufflePacksRemaining: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalTethersCompleted: { type: Number, default: 0 },
  currentMilestone: { type: Number, default: 0 },
  lastTetherDropAt: Date,
}, { timestamps: true });

coupleSchema.index({ users: 1 });

export const Couple = model<ICouple>('Couple', coupleSchema);