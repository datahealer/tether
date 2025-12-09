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
import { Provider, Platform,Tone,Rhythm } from '../types/enums';

export interface IUser extends Document {
  googleSub?: string;
  appleSub?: string;
  email: string;
  name: string;
  password?: string; // Add password field for email auth
  avatar?: string;
  provider: Provider;
  platform: Platform;
  onboarded: boolean;
  onboardingData: {
    // Personal Info
    firstName?: string;
    partnerFirstName?: string;
    dateOfBirth?: string;
    gender?: string;
    
    // Relationship Info
    relationshipStatus?: 'single' | 'dating' | 'engaged' | 'married' | 'its-complicated';
    relationshipDuration?: string;
    livingType?: string[];
    hasChildren?: boolean;
    
    // Preferences
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
}

const UserSchema: Schema = new Schema(
  {
    googleSub: { type: String, unique: true, sparse: true },
    appleSub: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    password: { type: String }, // Add password field
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
    onboardingData: {
      // Personal Info
      firstName: { type: String },
      partnerFirstName: { type: String },
      dateOfBirth: { type: String },
      gender: { type: String },
      
      // Relationship Info
      relationshipStatus: { 
        type: String,
        enum: ['single', 'dating', 'engaged', 'married', 'its-complicated']
      },
      relationshipDuration: { type: String },
      livingType: [{ type: String }],
      hasChildren: { type: Boolean },
      
      // Preferences
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














































