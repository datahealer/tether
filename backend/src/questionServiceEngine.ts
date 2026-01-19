/**
 * Question Service Engine - Central Exports
 * 
 * Main entry point for all Question Service Engine functionality
 */

// Models
export { Category } from './models/Category';
export { CoupleQuestionState } from './models/CoupleQuestionState';
export { CoupleCategoryState } from './models/CoupleCategoryState';
export { UserEntitlement } from './models/UserEntitlement';

// Services
export { QuestionServiceEngine } from './services/questionService';
export { 
  initializeScheduledJobs,
  scheduleTetherDropJob,
  scheduleExpiryHandlerJob,
  scheduleReminderJob,
  scheduleUnlockExpiryJob,
  scheduleTrialExpiryJob,
} from './services/scheduledJobs';

// Controllers
export {
  getActiveTethers,
  submitAnswer,
  skipTether,
  getCategoryProgress,
  unlockCategory,
  triggerTetherDrop,
  getCoupleStats,
  initializeCoupleCategories,
} from './controllers/tether';

// Utilities
export {
  MILESTONE_THRESHOLDS,
  checkMilestone,
  recordMilestone,
  getUnnotifiedMilestones,
  markMilestonesNotified,
  getStreakStatus,
  sendCoupleNotification,
  notifyMilestone,
  notifyNewTether,
  sendGentleReminder,
  notifyPartnerAnswered,
  getNextMilestone,
  getMilestoneProgress,
} from './utils/milestoneHelpers';

export { migrateExistingCouples } from './utils/migrations';

// Scripts
export { default as seedCategories } from './scripts/seedCategories';

// Routes
export { default as tetherRoutes } from './routes/tethers';

// Enums (re-export for convenience)
export { QuestionState, Tier, RefreshType } from './types/enums';

/**
 * Usage Example:
 * 
 * import { QuestionServiceEngine, initializeScheduledJobs } from './questionServiceEngine';
 * 
 * // Initialize for new couple
 * await QuestionServiceEngine.initializeCategoriesForCouple(coupleId);
 * 
 * // Start scheduled jobs
 * initializeScheduledJobs();
 */
