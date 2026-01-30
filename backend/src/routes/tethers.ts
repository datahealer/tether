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
  getTetherHistory,
  addReaction,
  getActiveTethersV2,
  submitAnswerV2,
  refreshQuestionV2,
  forceDropTethers,
} from '../controllers/tether';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============================================
// V2 ROUTES FIRST (More specific paths must come before generic ones)
// ============================================

/**
 * @swagger
 * /api/tethers/v2/active:
 *   get:
 *     summary: Get active tethers from current cycle (NEW)
 *     description: Returns live tethers with refresh pool info (per-cycle + permanent)
 *     tags: [Tethers V2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active tethers with refresh info
 */
router.get('/v2/active', getActiveTethersV2);

/**
 * @swagger
 * /api/tethers/v2/answer:
 *   post:
 *     summary: Submit answer with first-answer locking (NEW)
 *     description: First answer locks all other tethers in cycle
 *     tags: [Tethers V2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tetherId
 *               - answer
 *             properties:
 *               tetherId:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 */
router.post('/v2/answer', submitAnswerV2);

/**
 * @swagger
 * /api/tethers/v2/refresh:
 *   post:
 *     summary: Refresh question with dual-pool logic (NEW)
 *     description: Uses per-cycle refreshes first, then permanent pool
 *     tags: [Tethers V2]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tetherId
 *             properties:
 *               tetherId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question refreshed successfully
 */
router.post('/v2/refresh', refreshQuestionV2);

/**
 * @swagger
 * /api/tethers/v2/force-drop:
 *   post:
 *     summary: Force drop new tethers (testing/admin)
 *     description: Bypasses rhythm interval check
 *     tags: [Tethers V2]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tethers dropped successfully
 */
router.post('/v2/force-drop', forceDropTethers);

// ============================================
// V1 ROUTES (Original endpoints)
// ============================================

/**
 * @swagger
 * /api/tethers/active:
 *   get:
 *     summary: Get all active tethers for the user's couple
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active tethers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tethers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tether'
 *                 stats:
 *                   $ref: '#/components/schemas/CoupleStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not in a couple
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/active', getActiveTethers);

/**
 * @swagger
 * /api/tethers/answer:
 *   post:
 *     summary: Submit an answer to a tether
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - answer
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: The question ID to answer
 *               answer:
 *                 type: string
 *                 description: The user's answer text
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/answer', submitAnswer);

/**
 * @swagger
 * /api/tethers/skip:
 *   post:
 *     summary: Skip/refresh a tether
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: The question ID to skip
 *     responses:
 *       200:
 *         description: Tether skipped successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 */
router.post('/skip', skipTether);

/**
 * @swagger
 * /api/tethers/categories/progress:
 *   get:
 *     summary: Get category progress for the couple
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 progress:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryProgress'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not in a couple
 */
router.get('/categories/progress', getCategoryProgress);

/**
 * @swagger
 * /api/tethers/categories/unlock:
 *   post:
 *     summary: Unlock a category
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *             properties:
 *               categoryId:
 *                 type: string
 *                 enum: ['communication', 'intimacy', 'playfulness', 'trust', 'love_languages', 'future', 'vulnerability', 'conflict', 'erotic', 'gratitude']
 *               temporary:
 *                 type: boolean
 *                 default: false
 *               durationDays:
 *                 type: number
 *                 description: Duration in days if temporary unlock
 *     responses:
 *       200:
 *         description: Category unlocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/categories/unlock', unlockCategory);

/**
 * @swagger
 * /api/tethers/drop:
 *   post:
 *     summary: Manually trigger tether drop (for testing)
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tethers dropped successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
router.post('/drop', triggerTetherDrop);

/**
 * @swagger
 * /api/tethers/stats:
 *   get:
 *     summary: Get couple stats (streak, milestones, total completed)
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Couple stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   $ref: '#/components/schemas/CoupleStats'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not in a couple
 */
router.get('/stats', getCoupleStats);

/**
 * @swagger
 * /api/tethers/history:
 *   get:
 *     summary: Get tether history (completed tethers)
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of tethers to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of tethers to skip
 *     responses:
 *       200:
 *         description: Tether history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TetherHistory'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not in a couple
 */
router.get('/history', getTetherHistory);

/**
 * @swagger
 * /api/tethers/:questionId/react:
 *   post:
 *     summary: Add emoji reaction to a completed tether
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *                 example: "❤️"
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tether not found
 */
router.post('/:questionId/react', addReaction);

/**
 * @swagger
 * /api/tethers/initialize:
 *   post:
 *     summary: Initialize categories for a new couple
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not in a couple
 */
router.post('/initialize', initializeCoupleCategories);

export default router;
