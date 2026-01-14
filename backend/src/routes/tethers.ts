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
} from '../controllers/tether';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

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
