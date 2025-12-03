// import { Schema, model } from 'mongoose';
// import { IUser } from '../types/interfaces';
// import { Provider, Platform } from '../types/enums';

// const userSchema = new Schema<IUser>({
//   appleSub: { type: String, sparse: true, unique: true },
//   googleSub: { type: String, sparse: true, unique: true },
//   email: { type: String, required: true, lowercase: true },
//   name: String,
//   avatar: String,
//   provider: { type: String, enum: Object.values(Provider), required: true },
//   platform: { type: String, enum: Object.values(Platform), required: true },
//   onboarded: { type: Boolean, default: false },
//   onboardingData: {
//     relationshipStage: String,
//     livingType: [String],
//     hasKids: Boolean,
//     goals: [String],
//     emotionalNeeds: [String],
//     rhythmPreference: String,
//   },
//   coupleId: { type: Schema.Types.ObjectId, ref: 'Couple' },
//   inviteCodeUsed: String,
//   fcmTokens: [String],
//   apnsToken: String,
//   notificationPreferences: {
//     gentleReminders: { type: Boolean, default: true },
//     milestoneAlerts: { type: Boolean, default: true },
//     newTetherAlerts: { type: Boolean, default: true },
//   },
// }, { timestamps: true });

// userSchema.index({ email: 1 });
// userSchema.index({ appleSub: 1 });
// userSchema.index({ googleSub: 1 });

// export const User = model<IUser>('User', userSchema);



import mongoose, { Schema, Document } from 'mongoose';
import { Provider, Platform } from '../types/enums';

export interface IUser extends Document {
  googleSub?: string;
  appleSub?: string;
  email: string;
  name: string;
  avatar?: string;
  provider: Provider;
  platform: Platform;
  onboarded: boolean;
  onboardingData: {
    relationshipStatus?: 'single' | 'dating' | 'engaged' | 'married' | 'its-complicated';
    relationshipDuration?: string;
    livingType?: string[];
    goals?: string[];
    emotionalNeeds?: string[];
    rhythm?: 'Every day'| 'A few times a week'| 'Once a week' | "We'll decide as we go";
    tone?: 'playful'| 'romantic'| 'reflective'|'deep';
    packPreferences?: string[];
  };
  coupleId?: mongoose.Types.ObjectId;
  fcmTokens: string[];
  notificationPreferences: {
    gentleReminders: boolean;
    milestoneAlerts: boolean;
    newTetherAlerts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    googleSub: { type: String, unique: true, sparse: true },
    appleSub: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    avatar: { type: String },
    provider: { type: String, enum: Object.values(Provider), required: true },
    platform: { type: String, enum: Object.values(Platform), required: true },
    onboarded: { type: Boolean, default: false },
    onboardingData: {
      relationshipStatus: {
        type: String,
        enum: ['single', 'dating', 'engaged', 'married', 'its-complicated'],
      },
      relationshipDuration: { type: String },
      livingType: [{ type: String }],
      goals: [{ type: String }],
      emotionalNeeds: [{ type: String }],
      rhythm: {
        type: String,
        enum: ['Every day', 'A few times a week', 'Once a week', "We'll decide as we go"],
      },
      tone: {
        type: String,
        enum: ['playful', 'romantic', 'reflective','deep'],
      },
      packPreferences: [{ type: String }],
    },
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple' },
    fcmTokens: [{ type: String }],
    notificationPreferences: {
      gentleReminders: { type: Boolean, default: true },
      milestoneAlerts: { type: Boolean, default: true },
      newTetherAlerts: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleSub: 1 });
UserSchema.index({ appleSub: 1 });
UserSchema.index({ coupleId: 1 });

export default mongoose.model<IUser>('User', UserSchema);














































