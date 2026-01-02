import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { updatePushToken } from '../controllers/settings';

const router = Router();

/**
 * @swagger
 * /api/settings/push-token:
 *   patch:
 *     summary: Update push notification token
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Push token updated
 *       401:
 *         description: Unauthorized
 */
router.patch('/push-token', authMiddleware, updatePushToken);

/**
 * @swagger
 * /api/settings/notifications:
 *   patch:
 *     summary: Update notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gentleReminders:
 *                 type: boolean
 *               milestoneAlerts:
 *                 type: boolean
 *               newTetherAlerts:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated (coming soon)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/notifications', authMiddleware, (req, res) => {
  res.json({ message: 'Coming soon' });
});

export default router;