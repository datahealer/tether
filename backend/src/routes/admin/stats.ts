import { Router } from 'express';
import { getBasicStats } from '../../controllers/admin/stats';
import { adminAuth } from '../../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get basic statistics for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Basic statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     onboarded:
 *                       type: integer
 *                     subscribed:
 *                       type: integer
 *                     byTier:
 *                       type: object
 *                 couples:
 *                   type: object
 *                 questions:
 *                   type: object
 *                 tethers:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */






router.get('/', getBasicStats);

export default router;

