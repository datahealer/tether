import { Router } from 'express';
import { createInvite, joinCouple } from '../controllers/couple';
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

export default router;