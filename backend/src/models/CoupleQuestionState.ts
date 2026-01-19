import { Schema, model } from 'mongoose';
import { ICoupleQuestionState } from '../types/interfaces';
import { CategoryId, QuestionState } from '../types/enums';

const coupleQuestionStateSchema = new Schema<ICoupleQuestionState>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      enum: Object.values(CategoryId),
      required: true,
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
    reactions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
coupleQuestionStateSchema.index({ coupleId: 1, questionId: 1 }, { unique: true });
coupleQuestionStateSchema.index({ coupleId: 1, categoryId: 1, state: 1 });
coupleQuestionStateSchema.index({ coupleId: 1, state: 1 }); // For getting active/completed tethers
coupleQuestionStateSchema.index({ coupleId: 1, state: 1, 'answers.timestamp': -1 }); // For history queries
coupleQuestionStateSchema.index({ expiresAt: 1, state: 1 }); // For finding expired questions
coupleQuestionStateSchema.index({ coupleId: 1, state: 1, poolOrder: 1 });
coupleQuestionStateSchema.index({ expiryTimestamp: 1 });
coupleQuestionStateSchema.index({ cooldownEnd: 1 });

export const CoupleQuestionState = model<ICoupleQuestionState>(
  'CoupleQuestionState',
  coupleQuestionStateSchema
);
