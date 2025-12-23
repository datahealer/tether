import express from 'express';
import {
  updateOnboarding,
  completeOnboarding,
  generateInvite,
  acceptInvite,
  getCoupleInfo,
} from '../controllers/onboarding';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/onboarding/update:
 *   post:
 *     summary: Update onboarding data
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               livingType:
 *                 type: array
 *                 items:
 *                   type: string
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *               emotionalNeeds:
 *                 type: array
 *                 items:
 *                   type: string
 *               packPreferences:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Onboarding data updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/update', updateOnboarding);

/**
 * @swagger
 * /api/onboarding/complete:
 *   post:
 *     summary: Complete onboarding
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding completed
 *       401:
 *         description: Unauthorized
 */
router.post('/complete', completeOnboarding);

/**
 * @swagger
 * /api/onboarding/invite/generate:
 *   post:
 *     summary: Generate couple invite
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invite generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 inviteCode:
 *                   type: string
 *                 invite:
 *                   $ref: '#/components/schemas/CoupleInvite'
 *       401:
 *         description: Unauthorized
 */
router.post('/invite/generate', generateInvite);

/**
 * @swagger
 * /api/onboarding/invite/accept:
 *   post:
 *     summary: Accept couple invite
 *     tags: [Onboarding]
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
 *         description: Invite accepted successfully
 *       400:
 *         description: Invalid invite code
 *       401:
 *         description: Unauthorized
 */
router.post('/invite/accept', acceptInvite);

/**
 * @swagger
 * /api/onboarding/couple:
 *   get:
 *     summary: Get couple information
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Couple information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Couple'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/couple', getCoupleInfo);

export default router;