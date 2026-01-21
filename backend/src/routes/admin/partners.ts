import { Router } from 'express';
import {
  getPartners,
  linkPartners,
  unlinkPartners,
} from '../../controllers/admin/partners';
import { adminAuth } from '../../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/partners:
 *   get:
 *     summary: Get all couples/partnerships
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, ended]
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
 *         description: List of couples
 *       401:
 *         description: Unauthorized
 */
router.get('/', getPartners);

/**
 * @swagger
 * /api/admin/partners/link:
 *   post:
 *     summary: Manually link two users as partners
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user1Id
 *               - user2Id
 *             properties:
 *               user1Id:
 *                 type: string
 *               user2Id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Partners linked successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.post('/link', linkPartners);

/**
 * @swagger
 * /api/admin/partners/unlink/{coupleId}:
 *   post:
 *     summary: Manually unlink partners (dissolve couple)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coupleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partners unlinked successfully
 *       404:
 *         description: Couple not found
 *       401:
 *         description: Unauthorized
 */
router.post('/unlink/:coupleId', unlinkPartners);

export default router;

