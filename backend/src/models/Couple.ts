import mongoose, { Schema, Document } from 'mongoose';

export interface ICouple extends Document {
  user1Id: mongoose.Types.ObjectId;
  user2Id: mongoose.Types.ObjectId;
  status: 'active' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;
  sharedData: {
    currentStreak: number;
    totalTethersCompleted: number;
    lastTetherDate?: Date;
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
    sharedData: {
      currentStreak: { type: Number, default: 0 },
      totalTethersCompleted: { type: Number, default: 0 },
      lastTetherDate: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each user can only be in one active couple
CoupleSchema.index({ user1Id: 1, status: 1 });
CoupleSchema.index({ user2Id: 1, status: 1 });

export default mongoose.model<ICouple>('Couple', CoupleSchema);