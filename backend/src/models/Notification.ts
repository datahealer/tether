import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  NEW_TETHER = 'new_tether',
  PARTNER_ANSWERED = 'partner_answered',
  QUESTION_EXPIRING = 'question_expiring',
  GENTLE_REMINDER = 'gentle_reminder',
  MILESTONE = 'milestone',
  BOTH_ANSWERED = 'both_answered',
  COUPLE_INVITE = 'couple_invite',
  SYSTEM = 'system',

  PARTNER_REFRESHED='partner_refreshed'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  READ = 'read',
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  coupleId?: mongoose.Types.ObjectId;
  tetherId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  status: NotificationStatus;
  platform: 'ios' | 'android' | 'web';
  deviceToken?: string;
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',
    },
    tetherId: {
      type: Schema.Types.ObjectId,
      ref: 'Tether',
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
    },
    deviceToken: {
      type: String,
    },
    scheduledFor: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ scheduledFor: 1, status: 1 });
NotificationSchema.index({ coupleId: 1, type: 1 });
NotificationSchema.index({ tetherId: 1 }); // For tether-related notifications

export default mongoose.model<INotification>('Notification', NotificationSchema);
