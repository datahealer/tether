import { Schema, model } from 'mongoose';
import { ICategory } from '../types/interfaces';
import { CategoryId } from '../types/enums';

const categorySchema = new Schema<ICategory>(
  {
    categoryId: {
      type: String,
      // enum: Object.values(CategoryId),
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 180,
      required: true,
    },
    colorCode: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// categoryId index is automatically created by unique: true constraint

export const Category = model<ICategory>('Category', categorySchema);
