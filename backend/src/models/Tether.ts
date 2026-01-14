import { Schema, model } from 'mongoose';
import { ITether } from '../types/interfaces';
import { TetherStatus } from '../types/enums';

const tetherSchema = new Schema<ITether>({
  coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
  questionId: { type: String, required: true },
  question: { type: Schema.Types.Mixed, required: true }, // embedded full question
  status: {
    type: String,
    enum: Object.values(TetherStatus),
    default: TetherStatus.ACTIVE,
  },
  droppedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  answers: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    answer: { type: String, required: true },
    answeredAt: { type: Date, default: Date.now },
  }],
  skippedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  refreshed: { type: Boolean, default: false },
  firstResponderUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
 
});

// Performance indexes for common queries
tetherSchema.index({ coupleId: 1, droppedAt: -1 });
tetherSchema.index({ coupleId: 1, status: 1 }); // For filtering active tethers by couple
tetherSchema.index({ expiresAt: 1 });
tetherSchema.index({ status: 1, expiresAt: 1 }); // For finding expired tethers
tetherSchema.index({ questionId: 1 }); // For question lookups

export const Tether = model<ITether>('Tether', tetherSchema);