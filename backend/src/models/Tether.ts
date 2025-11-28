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

// Create indexes separately
tetherSchema.index({ coupleId: 1, droppedAt: -1 });
tetherSchema.index({ expiresAt: 1 });

export const Tether = model<ITether>('Tether', tetherSchema);