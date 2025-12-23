import cron from 'node-cron';
import Couple from '../models/Couple';
import { QuestionServiceEngine } from './questionService';
import { sendGentleReminder } from '../utils/milestoneHelpers';
import { CoupleQuestionState } from '../models/CoupleQuestionState';
import { QuestionState } from '../types/enums';

/**
 * Scheduled job to drop tethers based on couples' rhythms
 * Runs every hour
 */
export const scheduleTetherDropJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running tether drop job...');
    
    try {
      const activeCouples = await Couple.find({ status: 'active' });
      
      for (const couple of activeCouples) {
        try {
          await QuestionServiceEngine.dropTethersForCouple(couple._id);
        } catch (error) {
          console.error(`Error dropping tethers for couple ${couple._id}:`, error);
        }
      }
      
      console.log(`Tether drop job completed for ${activeCouples.length} couples`);
    } catch (error) {
      console.error('Error in tether drop job:', error);
    }
  });
  
  console.log('Tether drop job scheduled (runs every hour)');
};

/**
 * Scheduled job to handle expired questions
 * Runs every hour
 */
export const scheduleExpiryHandlerJob = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running expiry handler job...');
    
    try {
      await QuestionServiceEngine.handleExpiredQuestions();
      console.log('Expiry handler job completed');
    } catch (error) {
      console.error('Error in expiry handler job:', error);
    }
  });
  
  console.log('Expiry handler job scheduled (runs every hour)');
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
 * Initialize all scheduled jobs
 */
export const initializeScheduledJobs = () => {
  console.log('Initializing scheduled jobs...');
  
  scheduleTetherDropJob();
  scheduleExpiryHandlerJob();
  scheduleReminderJob();
  scheduleUnlockExpiryJob();
  
  console.log('All scheduled jobs initialized');
};

