import { Router } from 'express';
import {
  getUsers,
  getUserById,
  grantPremium,
  revokePremium,
} from '../../controllers/admin/users';
import { adminAuth } from '../../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with subscription states
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum: [free, premium, trial, lifetime]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of users with subscription states
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user details with full subscription information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:userId', getUserById);

/**
 * @swagger
 * /api/admin/users/{userId}/grant-premium:
 *   post:
 *     summary: Manually grant premium subscription to a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               durationDays:
 *                 type: integer
 *                 default: 30
 *               planType:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 default: monthly
 *     responses:
 *       200:
 *         description: Premium granted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:userId/grant-premium', grantPremium);

/**
 * @swagger
 * /api/admin/users/{userId}/revoke-premium:
 *   post:
 *     summary: Manually revoke premium subscription from a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Premium revoked successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:userId/revoke-premium', revokePremium);

export default router;

