import { Schema, model } from 'mongoose';
import { ICoupleCategoryState } from '../types/interfaces';
import { CategoryId } from '../types/enums';

const coupleCategoryStateSchema = new Schema<ICoupleCategoryState>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
      index: true,
    },
    categoryId: {
      type: String,
      // enum: Object.values(CategoryId),
      required: true,
      index: true,
    },
    answeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      default: 180,
      required: true,
    },
    skippedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    unlocked: {
      type: Boolean,
      default: false,
      required: true,
    },
    unlockExpiry: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// One document per couple per category
coupleCategoryStateSchema.index({ coupleId: 1, categoryId: 1 }, { unique: true });
coupleCategoryStateSchema.index({ coupleId: 1, unlocked: 1 });
coupleCategoryStateSchema.index({ unlockExpiry: 1 });

export const CoupleCategoryState = model<ICoupleCategoryState>(
  'CoupleCategoryState',
  coupleCategoryStateSchema
);

