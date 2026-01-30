import cron from 'node-cron';
import Couple from '../models/Couple';
import { QuestionServiceEngine } from './questionService';
import { TetherDropService } from './tetherDropService';
import { sendGentleReminder } from '../utils/milestoneHelpers';
import { CoupleQuestionState } from '../models/CoupleQuestionState';
import { QuestionState } from '../types/enums';
import { SoloQuestionExpiryService } from './soloQuestionExpiry.service';
import { VirtualPartnerService } from './virtualPartner.service';

/**
 * Scheduled job to drop tethers based on couples' rhythms
 * Runs every hour
 * Uses interval-based timing: 24h (daily), 72h (twice weekly), 168h (weekly)
 */
export const scheduleTetherDropJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[ScheduledJobs] Running tether drop job...');
    
    try {
      await TetherDropService.processAllCouples();
      console.log('[ScheduledJobs] Tether drop job completed');
    } catch (error) {
      console.error('[ScheduledJobs] Error in tether drop job:', error);
    }
  });
  
  console.log('[ScheduledJobs] Tether drop job scheduled (runs every hour)');
};

/**
 * Scheduled job to handle expired questions
 * Runs every hour
 * Transitions unanswered/partially-answered tethers to 14-day cooldown
 */
export const scheduleExpiryHandlerJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[ScheduledJobs] Running expiry handler job...');
    
    try {
      await TetherDropService.handleExpiredTethers();
      console.log('[ScheduledJobs] Expiry handler job completed');
    } catch (error) {
      console.error('[ScheduledJobs] Error in expiry handler job:', error);
    }
  });
  
  console.log('[ScheduledJobs] Expiry handler job scheduled (runs every hour)');
};

/**
 * Scheduled job to send gentle reminders for expiring tethers
 * Runs every 6 hours
 */
export const scheduleReminderJob = () => {
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running reminder job...');
    
    try {
      const now = new Date();
      const reminderThreshold = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now
      
      const expiringStates = await CoupleQuestionState.find({
        state: { $in: [QuestionState.SERVED, QuestionState.WAITING_FOR_PARTNER] },
        expiryTimestamp: { $lte: reminderThreshold, $gt: now },
      });
      
      const couplesSent = new Set<string>();
      
      for (const state of expiringStates) {
        const coupleIdStr = state.coupleId.toString();
        if (couplesSent.has(coupleIdStr)) continue;
        
        const hoursRemaining = Math.floor(
          (state.expiryTimestamp!.getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        
        try {
          await sendGentleReminder(state.coupleId, hoursRemaining);
          couplesSent.add(coupleIdStr);
        } catch (error) {
          console.error(`Error sending reminder for couple ${coupleIdStr}:`, error);
        }
      }
      
      console.log(`Reminder job completed, sent to ${couplesSent.size} couples`);
    } catch (error) {
      console.error('Error in reminder job:', error);
    }
  });
  
  console.log('Reminder job scheduled (runs every 6 hours)');
};

/**
 * Scheduled job to check and expire temporary category unlocks
 * Runs daily at midnight
 */
export const scheduleUnlockExpiryJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running unlock expiry job...');
    
    try {
      const { CoupleCategoryState } = await import('../models/CoupleCategoryState');
      const now = new Date();
      
      const result = await CoupleCategoryState.updateMany(
        {
          unlocked: true,
          unlockExpiry: { $lte: now },
        },
        {
          $set: { unlocked: false },
          $unset: { unlockExpiry: 1 },
        }
      );
      
      console.log(`Unlock expiry job completed, expired ${result.modifiedCount} categories`);
    } catch (error) {
      console.error('Error in unlock expiry job:', error);
    }
  });
  
  console.log('Unlock expiry job scheduled (runs daily at midnight)');
};

/**
 * Scheduled job to handle expired trials
 * Runs every 6 hours to check and downgrade expired trials
 */
export const scheduleTrialExpiryJob = () => {
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running trial expiry job...');
    
    try {
      const { UserEntitlement } = await import('../models/UserEntitlement');
      const { Tier } = await import('../types/enums');
      const User = (await import('../models/User')).default;
      const now = new Date();
      
      // Find all trial entitlements that have expired
      const expiredTrials = await UserEntitlement.find({
        tier: Tier.TRIAL,
        trialEnd: { $lte: now },
      });
      
      if (expiredTrials.length === 0) {
        console.log('No expired trials found');
        return;
      }
      
      console.log(`Found ${expiredTrials.length} expired trials to downgrade`);
      
      // Downgrade each expired trial to FREE tier
      for (const entitlement of expiredTrials) {
        try {
          // Get user to find their couple
          const user = await User.findById(entitlement.userId);
          
          // Downgrade entitlement to FREE
          entitlement.tier = Tier.FREE;
          entitlement.refreshesDefault = 1;
          // Keep trialEnd so user can't use trial again
          await entitlement.save();
          
          // Update user's subscribed flag to false
          await User.findByIdAndUpdate(entitlement.userId, { subscribed: false });
          
          // 🔒 LOCK DOWN CATEGORIES: Only keep top 2 unlocked
          if (user?.coupleId) {
            const { QuestionServiceEngine } = await import('../questionServiceEngine');
            await QuestionServiceEngine.updateCategoryAccessForTierChange(
              user.coupleId,
              Tier.FREE
            );
            console.log(`🔒 Locked 8 categories for couple ${user.coupleId} (trial expired)`);
            
            // 📲 Send notification to both partners
            try {
              const notificationService = (await import('./notification/notification.service')).default;
              await notificationService.sendTrialExpiredNotification(
                user.coupleId.toString()
              );
              console.log(`📧 Sent trial expiry notification to couple ${user.coupleId}`);
            } catch (notifError) {
              console.error('Failed to send trial expiry notification:', notifError);
            }
          }
          
          console.log(`✅ Downgraded expired trial for user ${entitlement.userId}`);
        } catch (error) {
          console.error(`❌ Error downgrading trial for user ${entitlement.userId}:`, error);
        }
      }
      
      console.log(`Trial expiry job completed, downgraded ${expiredTrials.length} users`);
    } catch (error) {
      console.error('Error in trial expiry job:', error);
    }
  });
  
  console.log('Trial expiry job scheduled (runs every 6 hours)');
};

/**
 * Scheduled job to expire solo mode questions (24 hour expiry)
 * Runs every hour
 */
export const scheduleSoloQuestionExpiryJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[ScheduledJobs] Running solo question expiry job...');
    
    try {
      await SoloQuestionExpiryService.expireSoloQuestions();
      console.log('[ScheduledJobs] Solo question expiry job completed');
    } catch (error) {
      console.error('[ScheduledJobs] Error in solo question expiry job:', error);
    }
  });
  
  console.log('[ScheduledJobs] Solo question expiry job scheduled (runs every hour)');
};

/**
 * Scheduled job to cleanup orphaned virtual partners
 * Runs once daily at 2 AM
 */
export const scheduleVirtualPartnerCleanupJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('[ScheduledJobs] Running virtual partner cleanup job...');
    
    try {
      await VirtualPartnerService.cleanupOrphanedVirtualPartners();
      console.log('[ScheduledJobs] Virtual partner cleanup job completed');
    } catch (error) {
      console.error('[ScheduledJobs] Error in virtual partner cleanup job:', error);
    }
  });
  
  console.log('[ScheduledJobs] Virtual partner cleanup job scheduled (runs daily at 2 AM)');
};

/**
 * Initialize all scheduled jobs
 */
export const initializeScheduledJobs = () => {
  console.log('Initializing scheduled jobs...');
  
  scheduleTetherDropJob();
  scheduleExpiryHandlerJob();
  scheduleReminderJob();
  scheduleUnlockExpiryJob();
  scheduleTrialExpiryJob();
  scheduleSoloQuestionExpiryJob(); // 🆕 Solo mode
  scheduleVirtualPartnerCleanupJob(); // 🆕 Solo mode
  
  console.log('All scheduled jobs initialized');
};

