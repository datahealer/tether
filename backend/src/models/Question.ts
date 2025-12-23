import { Schema, model } from 'mongoose';
import { IQuestion } from '../types/interfaces';

import {
  Tone,
  GenderFocus,
  RelationshipStage,
  LivingType,
  GoalTag,
  EmotionalNeed,
  CategoryId,
} from '../types/enums';

const questionSchema = new Schema<IQuestion>({
  questionId: { type: String, required: true },
  question: { type: String, required: true },
  tone: { type: String, enum: Object.values(Tone), required: true },
  genderFocus: { type: String, enum: Object.values(GenderFocus), required: true },
  relationshipStage: [{ type: String, enum: Object.values(RelationshipStage) }],
  livingType: [{ type: String, enum: Object.values(LivingType) }],
  goalTag: [{ type: String, enum: Object.values(GoalTag) }],
  emotionalNeed: [{ type: String, enum: Object.values(EmotionalNeed) }],
  categoryId: { type: String, enum: Object.values(CategoryId), required: true },
  formatType: String,
  contextTag: String,
  difficulty: { type: Number, min: 1, max: 5, required: true },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
  writerNotes: String,
}, { timestamps: true });

questionSchema.index({ questionId: 1 }, { unique: true });
questionSchema.index({ categoryId: 1 });
questionSchema.index({ status: 1 });
const Question = model<IQuestion>('Question', questionSchema);
export default Question;