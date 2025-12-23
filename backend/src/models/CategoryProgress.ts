import { Schema, model } from 'mongoose';
import { ICategoryProgress } from '../types/interfaces';
import { CategoryId } from '../types/enums';

const categoryProgressSchema = new Schema<ICategoryProgress>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    categoryId: {
      type: String,
      enum: Object.values(CategoryId),
      required: true,
    },
    answeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      default: 18,
    },
    servedQuestionIds: [
      {
        type: String,
      },
    ],
    lastServedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// One document per couple per category
categoryProgressSchema.index({ coupleId: 1, categoryId: 1 }, { unique: true });
categoryProgressSchema.index({ coupleId: 1 });

export const CategoryProgress = model<ICategoryProgress>('CategoryProgress', categoryProgressSchema);

