import { Router } from 'express';
import {
  getExpiredUnlocks,
  processUnlockExpiries,
  getPendingUnlocks,
} from '../../controllers/admin/unlocks';
import { adminAuth } from '../../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/unlocks/expired:
 *   get:
 *     summary: Get list of expired temporary unlocks
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of expired unlocks
 *       401:
 *         description: Unauthorized
 */
router.get('/expired', getExpiredUnlocks);

/**
 * @swagger
 * /api/admin/unlocks/pending:
 *   get:
 *     summary: Get list of pending temporary unlocks (not yet expired)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of pending unlocks
 *       401:
 *         description: Unauthorized
 */
router.get('/pending', getPendingUnlocks);

/**
 * @swagger
 * /api/admin/unlocks/process-expiries:
 *   post:
 *     summary: Process temporary unlock expiries (manually trigger expiry job)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unlock expiries processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 expiredCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/process-expiries', processUnlockExpiries);

export default router;

