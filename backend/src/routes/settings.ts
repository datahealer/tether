import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { updatePushToken } from '../controllers/settings';
import {
  exportUserData,
  deleteSpecificAnswers,
  deleteAccount,
  getDeletableAnswers,
} from '../controllers/privacy';

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
 *     responses:
 *       200:
 *         description: Notification settings updated
 *       401:
 *         description: Unauthorized
 */
router.patch('/notifications', authMiddleware, (req, res) => {
  res.json({ message: 'Coming soon' });
});

/**
 * @swagger
 * /api/settings/privacy/export:
 *   get:
 *     summary: Export user data (completed tethers)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data exported successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/privacy/export', authMiddleware, exportUserData);

/**
 * @swagger
 * /api/settings/privacy/deletable-answers:
 *   get:
 *     summary: Get list of deletable answers
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deletable answers
 *       401:
 *         description: Unauthorized
 */
router.get('/privacy/deletable-answers', authMiddleware, getDeletableAnswers);

/**
 * @swagger
 * /api/settings/privacy/delete-answers:
 *   delete:
 *     summary: Delete specific answers
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
 *               - questionStateIds
 *             properties:
 *               questionStateIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Answers deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/privacy/delete-answers', authMiddleware, deleteSpecificAnswers);

/**
 * @swagger
 * /api/settings/privacy/delete-account:
 *   delete:
 *     summary: Delete user account permanently
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/privacy/delete-account', authMiddleware, deleteAccount);

export default router;
