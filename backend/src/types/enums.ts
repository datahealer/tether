export enum Provider {
  GOOGLE = 'google',
  APPLE = 'apple',
  EMAIL = 'email', // Add this
}

export enum AuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  EMAIL = 'email', // Add this
}

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

export enum Rhythm {
  EVERY_DAY = 'Every day',
  FEW_TIMES_WEEK = 'A few times a week',
  ONCE_WEEK = 'Once a week',
  DECIDE_AS_GO = "We'll decide as we go",
}

export enum SubscriptionTier {
  FREE = 'free',
  TRIAL = 'trial',
  PREMIUM = 'premium',
}

export enum TetherStatus {
  ACTIVE = 'active',
  WAITING_FOR_PARTNER = 'waiting_for_partner',
  BOTH_ANSWERED = 'both_answered',
  EXPIRED = 'expired',
  SKIPPED = 'skipped',
  REFRESHED = 'refreshed',
  UNANSWERED_EXPIRED = 'unanswered_expired', // first responder answered, second didn't
}

export enum QuestionState {
  UNSEEN = 'unseen',
  SERVED = 'served',
  SKIPPED_REFRESH = 'skipped_refresh',
  CLEARED_BY_FIRST_ANSWER = 'cleared_by_first_answer', // Other questions cleared when first answer submitted
  UNANSWERED_EXPIRED = 'unanswered_expired', // Questions that expired without both answers (cycle timeout)
  WAITING_FOR_PARTNER = 'waiting_for_partner',
  COMPLETED = 'completed',
  answers = "answers",
  _id = "_id",
}

export enum Tier {
  FREE = 'free',
  PREMIUM = 'premium',
  TRIAL = 'trial',
}

export enum RefreshType {
  DEFAULT = 'default',
  PERMANENT = 'permanent',
}

// ...existing code...
export enum Tone {
  PLAYFUL = 'playful',
  REFLECTIVE = 'reflective',
  ROMANTIC = 'romantic',
  DEEP = 'deep',
}
// ...existing code...

export enum GenderFocus {
  MALE = 'Male',
  FEMALE = 'Female',
  NEUTRAL = 'Neutral',
}

export enum RelationshipStage {
  EARLY = 'Early',
  ESTABLISHED = 'Established',
  LONG_TERM = 'Long-term',
  REBUILDING = 'Rebuilding',
}

export enum LivingType {
  TOGETHER = 'Together',
  APART_LONG_DISTANCE = 'Apart, Long Distance',
  KIDS = 'Kids',
  NO_KIDS = 'No Kids',
}

export enum GoalTag {
  COMMUNICATION = 'Communication',
  TRUST = 'Trust',
  SPARK = 'Spark',
  INTIMACY = 'Intimacy',
  CONFLICT = 'Conflict',
  GRATITUDE = 'Gratitude',
  FUTURE = 'Future',
  VULNERABILITY = 'Vulnerability',
  PLAYFULNESS = 'Playfulness',
  LOVE_LANGUAGES = 'Love Languages',
}

export enum EmotionalNeed {
  LOVE_SECURITY = 'Love & Security',
  RECOGNITION = 'Recognition',
  AUTONOMY = 'Autonomy',
  GROWTH = 'Growth',
  PLAY = 'Play',
  BELONGING = 'Belonging',
}

export enum CategoryId {
  COMMUNICATION = 'communication',
  INTIMACY = 'intimacy',
  PLAYFULNESS = 'playfulness',
  TRUST = 'trust',
  LOVE_LANGUAGES = 'love_languages',
  FUTURE = 'future',
  VULNERABILITY = 'vulnerability',
  CONFLICT = 'conflict',
  EROTIC = 'erotic',
  GRATITUDE = 'gratitude',
}

export enum PurchaseType {
  REFRESH_PACK = 'refresh_pack',
  SHUFFLE_PACK = 'shuffle_pack',
  PREMIUM_MONTHLY = 'premium_monthly',
  PREMIUM_YEARLY = 'premium_yearly',
  TRIAL = 'trial',
}