import mongoose from 'mongoose';
import Couple from '../models/Couple';
import User from '../models/User';

/**
 * Milestone thresholds for tether completion
 */
export const MILESTONE_THRESHOLDS = [5, 10, 25, 50, 100];

/**
 * Check if a new milestone was achieved
 */
export const checkMilestone = async (
  coupleId: mongoose.Types.ObjectId,
  totalCompleted: number
): Promise<{ achieved: boolean; milestone?: number }> => {
  const couple = await Couple.findById(coupleId);
  if (!couple) {
    return { achieved: false };
  }

  // Check if this total matches a milestone
  if (MILESTONE_THRESHOLDS.includes(totalCompleted)) {
    // Check if already recorded
    const existing = couple.sharedData.milestoneRecords.find(
      (m) => m.count === totalCompleted
    );

    if (!existing) {
      // New milestone achieved!
      return { achieved: true, milestone: totalCompleted };
    }
  }

  return { achieved: false };
};

/**
 * Record a milestone achievement
 */
export const recordMilestone = async (
  coupleId: mongoose.Types.ObjectId,
  milestoneCount: number
): Promise<void> => {
  await Couple.findByIdAndUpdate(coupleId, {
    $push: {
      'sharedData.milestoneRecords': {
        count: milestoneCount,
        achievedAt: new Date(),
        notified: false,
      },
    },
  });
};

/**
 * Get unnotified milestones for a couple
 */
export const getUnnotifiedMilestones = async (
  coupleId: mongoose.Types.ObjectId
): Promise<Array<{ count: number; achievedAt: Date }>> => {
  const couple = await Couple.findById(coupleId);
  if (!couple) return [];

  return couple.sharedData.milestoneRecords
    .filter((m) => !m.notified)
    .map((m) => ({ count: m.count, achievedAt: m.achievedAt }));
};

/**
 * Mark milestones as notified
 */
export const markMilestonesNotified = async (
  coupleId: mongoose.Types.ObjectId,
  milestoneCounts: number[]
): Promise<void> => {
  const couple = await Couple.findById(coupleId);
  if (!couple) return;

  couple.sharedData.milestoneRecords.forEach((m) => {
    if (milestoneCounts.includes(m.count)) {
      m.notified = true;
    }
  });

  await couple.save();
};

/**
 * Calculate streak status
 */
export const getStreakStatus = async (
  coupleId: mongoose.Types.ObjectId
): Promise<{
  currentStreak: number;
  isActive: boolean;
  lastTetherDate?: Date;
}> => {
  const couple = await Couple.findById(coupleId);
  if (!couple) {
    return { currentStreak: 0, isActive: false };
  }

  const now = new Date();
  const lastTetherDate = couple.sharedData.lastTetherDate;

  if (!lastTetherDate) {
    return { currentStreak: 0, isActive: false };
  }

  // Check if streak is still active (within rhythm window)
  const rhythmHours = getRhythmHours(couple.rhythm);
  const hoursSinceLastTether =
    (now.getTime() - lastTetherDate.getTime()) / (1000 * 60 * 60);

  const isActive = hoursSinceLastTether <= rhythmHours * 2; // 2x grace period

  return {
    currentStreak: couple.sharedData.currentStreak,
    isActive,
    lastTetherDate,
  };
};

/**
 * Get rhythm hours mapping
 */
const getRhythmHours = (rhythm: string): number => {
  const rhythmMap: Record<string, number> = {
    'Every day': 24,
    'A few times a week': 72,
    'Once a week': 168,
    "We'll decide as we go": 24,
  };
  return rhythmMap[rhythm] || 24;
};

/**
 * Send push notification to couple
 */
export const sendCoupleNotification = async (
  coupleId: mongoose.Types.ObjectId,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    // Use the proper notification service
    const notificationService = (await import('../services/notification/notification.service')).default;
    const { NotificationType } = await import('../models/Notification');
    
    // Determine notification type
    let notificationType = NotificationType.SYSTEM;
    if (data?.type === 'milestone') {
      notificationType = NotificationType.MILESTONE;
    } else if (data?.type === 'new_tether') {
      notificationType = NotificationType.NEW_TETHER;
    } else if (data?.type === 'reminder') {
      notificationType = NotificationType.GENTLE_REMINDER;
    }
    
    await notificationService.sendToCouple(
      coupleId.toString(),
      notificationType,
      () => ({ title, body, data }),
      undefined,
      data
    );
    
    console.log(`✅ Sent couple notification: ${title}`);
  } catch (error) {
    console.error('Error sending couple notification:', error);
  }
};

/**
 * Notify about milestone achievement
 */
export const notifyMilestone = async (
  coupleId: mongoose.Types.ObjectId,
  milestoneCount: number
): Promise<void> => {
  const title = `🎉 Milestone Achieved!`;
  const body = `You've completed ${milestoneCount} tethers together! Amazing work! 💪`;

  await sendCoupleNotification(coupleId, title, body, {
    type: 'milestone',
    milestoneCount,
  });
};

/**
 * Notify about new tether drop
 */
export const notifyNewTether = async (
  coupleId: mongoose.Types.ObjectId,
  categoryName: string
): Promise<void> => {
  const title = `New Tether Available! 💬`;
  const body = `A new ${categoryName} question is ready for you both.`;

  await sendCoupleNotification(coupleId, title, body, {
    type: 'new_tether',
    category: categoryName,
  });
};

/**
 * Send gentle reminder to complete pending tether
 */
export const sendGentleReminder = async (
  coupleId: mongoose.Types.ObjectId,
  hoursRemaining: number
): Promise<void> => {
  const title = `Don't forget your tether! ⏰`;
  const body = `Your current tether expires in ${hoursRemaining} hours. Take a moment to answer together!`;

  await sendCoupleNotification(coupleId, title, body, {
    type: 'reminder',
    hoursRemaining,
  });
};

/**
 * Notify when partner answers
 */
export const notifyPartnerAnswered = async (
  userId: mongoose.Types.ObjectId,
  partnerName: string
): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.notificationPreferences.newTetherAlerts) return;

    const title = `${partnerName} answered! 💬`;
    const body = `See what ${partnerName} said and share your thoughts.`;

    if (user.fcmTokens && user.fcmTokens.length > 0) {
      // TODO: Implement actual FCM sending
      console.log(`Sending partner answered notification to ${user.email}:`, {
        title,
        body,
        tokens: user.fcmTokens,
      });
    }
  } catch (error) {
    console.error('Error sending partner answered notification:', error);
  }
};

/**
 * Get next milestone for a couple
 */
export const getNextMilestone = (currentTotal: number): number | null => {
  for (const milestone of MILESTONE_THRESHOLDS) {
    if (currentTotal < milestone) {
      return milestone;
    }
  }
  return null; // All milestones achieved
};

/**
 * Get milestone progress percentage
 */
export const getMilestoneProgress = (currentTotal: number): {
  nextMilestone: number | null;
  progress: number;
  remaining: number;
} => {
  const nextMilestone = getNextMilestone(currentTotal);
  
  if (!nextMilestone) {
    return {
      nextMilestone: null,
      progress: 100,
      remaining: 0,
    };
  }

  // Find the previous milestone
  let previousMilestone = 0;
  for (const milestone of MILESTONE_THRESHOLDS) {
    if (milestone >= nextMilestone) break;
    previousMilestone = milestone;
  }

  const range = nextMilestone - previousMilestone;
  const current = currentTotal - previousMilestone;
  const progress = Math.min(100, (current / range) * 100);

  return {
    nextMilestone,
    progress: Math.round(progress),
    remaining: nextMilestone - currentTotal,
  };
};
