import mongoose, { Schema, Document } from 'mongoose';
import { Rhythm } from '../types/enums';

export interface IMilestoneRecord {
  count: number;
  achievedAt: Date;
  notified: boolean;
}

export interface ICouple extends Document {
  user1Id: mongoose.Types.ObjectId;
  user2Id: mongoose.Types.ObjectId;
  status: 'active' | 'paused' | 'ended';
  rhythm: Rhythm;
  lastTetherDrop?: Date;
  createdAt: Date;
  updatedAt: Date;
  sharedData: {
    currentStreak: number;
    totalTethersCompleted: number;
    lastTetherDate?: Date;
    milestoneRecords: IMilestoneRecord[];
    permanentRefreshBalance: number; // Never-expiring refresh purchases
  };
}

const CoupleSchema: Schema = new Schema(
  {
    user1Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['active', 'paused', 'ended'], 
      default: 'active' 
    },
    rhythm: {
      type: String,
      enum: Object.values(Rhythm),
      default: Rhythm.EVERY_DAY,
    },
    lastTetherDrop: {
      type: Date,
    },
    sharedData: {
      currentStreak: { type: Number, default: 0 },
      totalTethersCompleted: { type: Number, default: 0 },
      lastTetherDate: { type: Date },
      milestoneRecords: [
        {
          count: { type: Number, required: true },
          achievedAt: { type: Date, default: Date.now },
          notified: { type: Boolean, default: false },
        },
      ],
      permanentRefreshBalance: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes for common queries
CoupleSchema.index({ user1Id: 1, status: 1 });
CoupleSchema.index({ user2Id: 1, status: 1 });
CoupleSchema.index({ user1Id: 1, user2Id: 1 }); // Compound index for couple lookups
CoupleSchema.index({ lastTetherDrop: 1 });
CoupleSchema.index({ status: 1, lastTetherDrop: 1 }); // For active couples needing tether drops

export default mongoose.model<ICouple>('Couple', CoupleSchema);