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
 *                   type: object
 *                   properties:
 *                     totalAnswered:
 *                       type: number
 *                     currentStreak:
 *                       type: number
 *                     lastAnsweredDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
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
 *                 description: The ID of the question being answered
 *               answer:
 *                 type: string
 *                 description: The user's answer to the question
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
 *                 state:
 *                   type: string
 *                   enum: [active, waiting_for_partner, both_answered, expired]
 *                 partnerAnswer:
 *                   type: string
 *                   nullable: true
 *                   description: Partner's answer if both have answered
 *                 milestones:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid request (missing questionId or answer)
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
 *         description: User not in a couple
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
 *     summary: Skip/refresh a tether to get a new question
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
 *                 description: The ID of the question to skip
 *     responses:
 *       200:
 *         description: Tether skipped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 newQuestion:
 *                   $ref: '#/components/schemas/Question'
 *                   nullable: true
 *                   description: New question if available
 *                 refreshesRemaining:
 *                   type: number
 *                   description: Number of refreshes remaining
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request (missing questionId)
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
 *         description: User not in a couple
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *                     type: object
 *                     properties:
 *                       coupleId:
 *                         type: string
 *                       categoryId:
 *                         type: string
 *                       categoryName:
 *                         type: string
 *                       colorCode:
 *                         type: string
 *                       answeredCount:
 *                         type: number
 *                       totalQuestions:
 *                         type: number
 *                       skippedCount:
 *                         type: number
 *                       isComplete:
 *                         type: boolean
 *                       unlocked:
 *                         type: boolean
 *                       unlockExpiry:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       lastActivityAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
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
router.get('/categories/progress', getCategoryProgress);

/**
 * @swagger
 * /api/tethers/categories/unlock:
 *   post:
 *     summary: Unlock a category (requires premium subscription unless temporary)
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
 *                 enum: [communication, intimacy, playfulness, trust, love_languages, future, vulnerability, conflict, erotic, gratitude]
 *                 description: The category ID to unlock
 *               temporary:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this is a temporary unlock
 *               durationDays:
 *                 type: number
 *                 description: Duration in days for temporary unlock (required if temporary is true)
 *     responses:
 *       200:
 *         description: Category unlocked successfully
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
 *         description: Invalid categoryId
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
 *       403:
 *         description: Premium subscription required or no entitlement found
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
router.post('/categories/unlock', unlockCategory);

/**
 * @swagger
 * /api/tethers/drop:
 *   post:
 *     summary: Manually trigger tether drop (for testing/admin use)
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force drop even if tethers already exist
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force:
 *                 type: boolean
 *                 default: false
 *                 description: Force drop even if tethers already exist
 *     responses:
 *       200:
 *         description: Tethers dropped successfully
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
 *         description: User not in a couple
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
 */
router.post('/drop', triggerTetherDrop);

/**
 * @swagger
 * /api/tethers/stats:
 *   get:
 *     summary: Get couple statistics (streak, milestones, total completed)
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
 *                   type: object
 *                   properties:
 *                     currentStreak:
 *                       type: number
 *                       description: Current consecutive days streak
 *                     totalCompleted:
 *                       type: number
 *                       description: Total tethers completed by the couple
 *                     lastTetherDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     milestones:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Milestone records
 *                     rhythm:
 *                       type: string
 *                       enum: ['Every day', 'A few times a week', 'Once a week', "We'll decide as we go"]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not in a couple or couple not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', getCoupleStats);

/**
 * @swagger
 * /api/tethers/initialize:
 *   post:
 *     summary: Initialize categories for a new couple (manual initialization)
 *     tags: [Tethers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
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
router.post('/initialize', initializeCoupleCategories);

export default router;
