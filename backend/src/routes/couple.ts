import { Router } from 'express';
import { createInvite, joinCouple, getCoupleStats } from '../controllers/couple';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/couple/invite:
 *   post:
 *     summary: Create couple invite
 *     tags: [Couple]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invite created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/invite', authMiddleware, createInvite);

/**
 * @swagger
 * /api/couple/join:
 *   post:
 *     summary: Join couple
 *     tags: [Couple]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined couple successfully
 *       400:
 *         description: Invalid invite code
 *       401:
 *         description: Unauthorized
 */
router.post('/join', authMiddleware, joinCouple);

/**
 * @swagger
 * /api/couple/stats:
 *   get:
 *     summary: Get couple statistics (streak, milestones, total completed)
 *     tags: [Couple]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Couple statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentStreak:
 *                   type: number
 *                 totalTethersCompleted:
 *                   type: number
 *                 lastTetherDate:
 *                   type: string
 *                   format: date-time
 *                 milestoneRecords:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       count:
 *                         type: number
 *                       achievedAt:
 *                         type: string
 *                         format: date-time
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not in a couple
 */
router.get('/stats', authMiddleware, getCoupleStats);

export default router;