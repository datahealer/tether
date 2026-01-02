import { Router } from 'express';
import { createInvite, joinCouple } from '../controllers/couple';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/couple/invite:
 *   post:
 *     summary: Create a couple invite code
 *     tags: [Couple]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invite created successfully or existing invite returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: 6-character invite code
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Expiration date of the invite
 *       400:
 *         description: User is already in a couple
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/invite', authMiddleware, createInvite);

/**
 * @swagger
 * /api/couple/join:
 *   post:
 *     summary: Join a couple using an invite code
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
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: 6-character invite code from partner
 *     responses:
 *       200:
 *         description: Successfully joined couple
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 coupleId:
 *                   type: string
 *                   description: ID of the created couple
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid invite code, expired invite, user already in couple, or cannot accept own invite
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/join', authMiddleware, joinCouple);

export default router;