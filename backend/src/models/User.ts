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
import { Provider, Platform, Tone, Rhythm } from '../types/enums';

export interface IUser extends Document {
  googleSub?: string;
  appleSub?: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  provider: Provider;
  platform: Platform;
  onboarded: boolean;
  subscribed: boolean; // ✅ New field
  onboardingData: {
    firstName?: string;
    partnerFirstName?: string;
    dateOfBirth?: string;
    gender?: string;
    relationshipStatus?: 'single' | 'dating' | 'engaged' | 'married' | 'its-complicated';
    relationshipDuration?: string;
    livingType?: string[];
    hasChildren?: boolean;
    goals?: string[];
    emotionalNeeds?: string[];
    rhythm?: Rhythm;
    tone?: Tone;
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
  refreshTokens: string[];
  refreshTokenVersion: number;
  
  addRefreshToken(token: string): Promise<void>;
  removeRefreshToken(token: string): Promise<void>;
  clearRefreshTokens(): Promise<void>;
}

const UserSchema: Schema = new Schema(
  {
    googleSub: { type: String, sparse: true },
    appleSub: { type: String, sparse: true },
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    password: { type: String },
    avatar: { type: String },
    provider: { 
      type: String, 
      enum: Object.values(Provider),
      required: true 
    },
    platform: { 
      type: String, 
      enum: Object.values(Platform),
      required: true 
    },
    onboarded: { type: Boolean, default: false },
    subscribed: { type: Boolean, default: false }, // ✅ New field
    onboardingData: {
      firstName: { type: String },
      partnerFirstName: { type: String },
      dateOfBirth: { type: String },
      gender: { type: String },
      relationshipStatus: { 
        type: String,
        enum: ['single', 'dating', 'engaged', 'married', 'its-complicated']
      },
      relationshipDuration: { type: String },
      livingType: [{ type: String }],
      hasChildren: { type: Boolean },
      goals: [{ type: String }],
      emotionalNeeds: [{ type: String }],
      rhythm: { 
        type: String,
        enum: Object.values(Rhythm)
      },
      tone: { 
        type: String,
        enum: Object.values(Tone)
      },
      packPreferences: [{ type: String }],
    },
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple' },
    fcmTokens: [{ type: String }],
    apnsToken: { type: String },
    notificationPreferences: {
      gentleReminders: { type: Boolean, default: true },
      milestoneAlerts: { type: Boolean, default: true },
      newTetherAlerts: { type: Boolean, default: true },
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ✅ Methods remain the same
UserSchema.methods.addRefreshToken = async function(this: IUser, token: string): Promise<void> {
  try {
    await User.findByIdAndUpdate(
      this._id,
      {
        $push: {
          refreshTokens: {
            $each: [token],
            $slice: -5,
          },
        },
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error adding refresh token:', error);
    throw error;
  }
};

UserSchema.methods.removeRefreshToken = async function(this: IUser, token: string): Promise<void> {
  try {
    await User.findByIdAndUpdate(
      this._id,
      {
        $pull: { refreshTokens: token },
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw error;
  }
};

UserSchema.methods.clearRefreshTokens = async function(this: IUser): Promise<void> {
  try {
    await User.findByIdAndUpdate(
      this._id,
      {
        $set: { refreshTokens: [] },
        $inc: { refreshTokenVersion: 1 },
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error clearing refresh tokens:', error);
    throw error;
  }
};

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleSub: 1 }, { unique: true, sparse: true });
UserSchema.index({ appleSub: 1 }, { unique: true, sparse: true });
UserSchema.index({ coupleId: 1 });

const User = mongoose.model<IUser>('User', UserSchema);
export default User;