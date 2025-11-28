import {
  Rhythm,
  SubscriptionTier,
  TetherStatus,
  Tone,
  GenderFocus,
  RelationshipStage,
  LivingType,
  GoalTag,
  EmotionalNeed,
  CategoryId,
  Provider,
   Platform,
  PurchaseType,
} from './enums';
import { Document, Types } from 'mongoose';

export interface IOnboardingData {
  relationshipStage: RelationshipStage;
  livingType: LivingType[];
  hasKids: boolean;
  goals: GoalTag[];
  emotionalNeeds: EmotionalNeed[];
  rhythmPreference: Rhythm;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  appleSub?: string;
  googleSub?: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: Provider;
  platform: Platform;
  onboarded: boolean;
  onboardingData?: IOnboardingData;
  coupleId?: Types.ObjectId;
  inviteCodeUsed?: string;
  fcmTokens: string[];
  apnsToken?: string;
  notificationPreferences: {
    gentleReminders: boolean;
    milestoneAlerts: boolean;
    newTetherAlerts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICouple extends Document {
  users: [Types.ObjectId, Types.ObjectId];
  rhythm: Rhythm;
  subscriptionTier: SubscriptionTier;
  trialEndsAt?: Date;
  premiumExpiresAt?: Date;
  sharedRefreshesRemaining: number;
  shufflePacksRemaining: number;
  streak: number;
  longestStreak: number;
  totalTethersCompleted: number;
  currentMilestone: number;
  lastTetherDropAt?: Date;
  createdAt: Date;
}

export interface IQuestion extends Document {
  questionId: string; // e.g., "BC001"
  question: string;
  tone: Tone;
  genderFocus: GenderFocus;
  relationshipStage: RelationshipStage[];
  livingType: LivingType[];
  goalTag: GoalTag[];
  emotionalNeed: EmotionalNeed[];
  categoryId: CategoryId;
  formatType?: string;
  contextTag?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: 'Draft' | 'Published';
  writerNotes?: string;
}

export interface ITetherAnswer {
  userId: Types.ObjectId;
  answer: string;
  answeredAt: Date;
}

export interface ITether extends Document {
  
  coupleId: Types.ObjectId;
  questionId: string;
  question: IQuestion;
  status: TetherStatus;
  droppedAt: Date;
  expiresAt: Date;
  answers: ITetherAnswer[];
  skippedBy?: Types.ObjectId[];
  refreshed: boolean;
  firstResponderUserId?: Types.ObjectId;
  createdAt: Date;
}

export interface ICoupleInvite extends Document {
  inviterUserId: Types.ObjectId;
  code: string;
  email?: string;
  expiresAt: Date;
  usedByUserId?: Types.ObjectId;
  usedAt?: Date;
  createdAt: Date;
}

export interface IPurchase extends Document {
  userId: Types.ObjectId;
  coupleId?: Types.ObjectId;
  type: PurchaseType;
  productId: string;
  receipt: string;
  platform: 'ios' | 'android';
  grantedRefreshes?: number;
  grantedShuffles?: number;
  grantedPremiumUntil?: Date;
  status: 'pending' | 'validated' | 'failed';
  validationError?: string;
  createdAt: Date;
}

export interface ICategoryProgress extends Document {
  coupleId: Types.ObjectId;
  categoryId: CategoryId;
  answeredCount: number;
  totalQuestions: number;
   servedQuestionIds: string[];
  lastServedAt?: Date;
}

