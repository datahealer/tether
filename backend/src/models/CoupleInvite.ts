import { Schema, model } from 'mongoose';
import { ICoupleInvite } from '../types/interfaces';

const coupleInviteSchema = new Schema<ICoupleInvite>(
  {
    inviterUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: '30d' },
    },
    usedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    usedAt: Date,
  },
  { timestamps: true }
);

coupleInviteSchema.index({ code: 1 });
coupleInviteSchema.index({ inviterUserId: 1, usedAt: 1 });

export const CoupleInvite = model<ICoupleInvite>('CoupleInvite', coupleInviteSchema);