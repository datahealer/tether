import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getActiveTethers,
  submitAnswer,
  skipTether,
  getCategoryProgress,
  unlockCategory,
  triggerTetherDrop,
  getCoupleStats,
  initializeCoupleCategories,
} from '../controllers/tether';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/tethers/active
 * Get all active tethers for the user's couple
 */
router.get('/active', getActiveTethers);

/**
 * POST /api/tethers/answer
 * Submit an answer to a tether
 * Body: { questionId: string, answer: string }
 */
router.post('/answer', submitAnswer);

/**
 * POST /api/tethers/skip
 * Skip/refresh a tether
 * Body: { questionId: string }
 */
router.post('/skip', skipTether);

/**
 * GET /api/tethers/categories/progress
 * Get category progress for the couple
 */
router.get('/categories/progress', getCategoryProgress);

/**
 * POST /api/tethers/categories/unlock
 * Unlock a category
 * Body: { categoryId: string, temporary?: boolean, durationDays?: number }
 */
router.post('/categories/unlock', unlockCategory);

/**
 * POST /api/tethers/drop
 * Manually trigger tether drop (for testing)
 */
router.post('/drop', triggerTetherDrop);

/**
 * GET /api/tethers/stats
 * Get couple stats (streak, milestones, total completed)
 */
router.get('/stats', getCoupleStats);

/**
 * POST /api/tethers/initialize
 * Initialize categories for a new couple
 */
router.post('/initialize', initializeCoupleCategories);

export default router;
