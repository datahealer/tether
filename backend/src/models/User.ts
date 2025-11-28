import { Schema, model } from 'mongoose';
import { IUser } from '../types/interfaces';
import { Provider, Platform } from '../types/enums';

const userSchema = new Schema<IUser>({
  appleSub: { type: String, sparse: true, unique: true },
  googleSub: { type: String, sparse: true, unique: true },
  email: { type: String, required: true, lowercase: true },
  name: String,
  avatar: String,
  provider: { type: String, enum: Object.values(Provider), required: true },
  platform: { type: String, enum: Object.values(Platform), required: true },
  onboarded: { type: Boolean, default: false },
  onboardingData: {
    relationshipStage: String,
    livingType: [String],
    hasKids: Boolean,
    goals: [String],
    emotionalNeeds: [String],
    rhythmPreference: String,
  },
  coupleId: { type: Schema.Types.ObjectId, ref: 'Couple' },
  inviteCodeUsed: String,
  fcmTokens: [String],
  apnsToken: String,
  notificationPreferences: {
    gentleReminders: { type: Boolean, default: true },
    milestoneAlerts: { type: Boolean, default: true },
    newTetherAlerts: { type: Boolean, default: true },
  },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ appleSub: 1 });
userSchema.index({ googleSub: 1 });

export const User = model<IUser>('User', userSchema);