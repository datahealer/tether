import { Router } from 'express';
import {
  getRefreshBundles,
  addRefreshBundle,
  removeRefreshBundle,
} from '../../controllers/admin/refresh';
import { adminAuth } from '../../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/refresh/bundles:
 *   get:
 *     summary: Get all couples with refresh bundle information
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
 *       - in: query
 *         name: minBalance
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of refresh bundles
 *       401:
 *         description: Unauthorized
 */
router.get('/bundles', getRefreshBundles);

/**
 * @swagger
 * /api/admin/refresh/add-bundle:
 *   post:
 *     summary: Add refresh bundle to a couple
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
 *               - coupleId
 *               - amount
 *             properties:
 *               coupleId:
 *                 type: string
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Refresh bundle added successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Couple not found
 *       401:
 *         description: Unauthorized
 */
router.post('/add-bundle', addRefreshBundle);

/**
 * @swagger
 * /api/admin/refresh/remove-bundle:
 *   post:
 *     summary: Remove refresh bundle from a couple
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
 *               - coupleId
 *               - amount
 *             properties:
 *               coupleId:
 *                 type: string
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Refresh bundle removed successfully
 *       400:
 *         description: Invalid request or insufficient balance
 *       404:
 *         description: Couple not found
 *       401:
 *         description: Unauthorized
 */
router.post('/remove-bundle', removeRefreshBundle);

export default router;

