import { Router } from 'express';
import {
  identifyUser,
  getUser,
  processPurchase,
  restorePurchases,
  handleWebhook,
  getOffering,
} from '../controllers/revenuecat';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/revenuecat/identify:
 *   post:
 *     summary: Identify user in RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User identified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 revenueCatUser:
 *                   $ref: '#/components/schemas/RevenueCatUser'
 *       401:
 *         description: Unauthorized
 */
router.post('/identify', authMiddleware, identifyUser);

/**
 * @swagger
 * /api/revenuecat/user:
 *   get:
 *     summary: Get user from RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data from RevenueCat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 revenueCatUser:
 *                   $ref: '#/components/schemas/RevenueCatUser'
 *       401:
 *         description: Unauthorized
 */
router.get('/user', authMiddleware, getUser);

/**
 * @swagger
 * /api/revenuecat/purchase:
 *   post:
 *     summary: Process a purchase through RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - transactionId
 *               - store
 *             properties:
 *               productId:
 *                 type: string
 *               transactionId:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: USD
 *               store:
 *                 type: string
 *                 enum: [ios, android]
 *               period:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 revenueCatUser:
 *                   $ref: '#/components/schemas/RevenueCatUser'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/purchase', authMiddleware, processPurchase);

/**
 * @swagger
 * /api/revenuecat/restore:
 *   post:
 *     summary: Restore purchases from RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchases restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 revenueCatUser:
 *                   $ref: '#/components/schemas/RevenueCatUser'
 *       401:
 *         description: Unauthorized
 */
router.post('/restore', authMiddleware, restorePurchases);

/**
 * @swagger
 * /api/revenuecat/offering:
 *   get:
 *     summary: Get offering from RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: offeringId
 *         schema:
 *           type: string
 *         description: Optional offering ID
 *     responses:
 *       200:
 *         description: Offering data
 *       401:
 *         description: Unauthorized
 */
router.get('/offering', authMiddleware, getOffering);

/**
 * @swagger
 * /api/revenuecat/webhook:
 *   post:
 *     summary: RevenueCat webhook endpoint
 *     tags: [RevenueCat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', handleWebhook);

export default router;
