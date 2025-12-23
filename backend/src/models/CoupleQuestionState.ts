import { Schema, model } from 'mongoose';
import { ICoupleQuestionState } from '../types/interfaces';
import { CategoryId, QuestionState } from '../types/enums';

const coupleQuestionStateSchema = new Schema<ICoupleQuestionState>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    categoryId: {
      type: String,
      enum: Object.values(CategoryId),
      required: true,
      index: true,
    },
    state: {
      type: String,
      enum: Object.values(QuestionState),
      default: QuestionState.UNSEEN,
      required: true,
    },
    poolOrder: {
      type: Number,
      default: 0,
    },
    servedDate: {
      type: Date,
    },
    expiryTimestamp: {
      type: Date,
    },
    answers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cooldownEnd: {
      type: Date,
    },
    skippedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
coupleQuestionStateSchema.index({ coupleId: 1, questionId: 1 }, { unique: true });
coupleQuestionStateSchema.index({ coupleId: 1, categoryId: 1, state: 1 });
coupleQuestionStateSchema.index({ coupleId: 1, state: 1, poolOrder: 1 });
coupleQuestionStateSchema.index({ expiryTimestamp: 1 });
coupleQuestionStateSchema.index({ cooldownEnd: 1 });

export const CoupleQuestionState = model<ICoupleQuestionState>(
  'CoupleQuestionState',
  coupleQuestionStateSchema
);
