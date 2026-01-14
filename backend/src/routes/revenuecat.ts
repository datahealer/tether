import { Router } from 'express';
import {
  identifyUser,
  getUser,
  processPurchase,
  restorePurchases,
  handleWebhook,
  getOffering,
  cancelSubscription,
  grantEntitlement,
  revokeEntitlement,
  getSubscriptionHistory,
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

/**
 * @swagger
 * /api/revenuecat/subscription/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancellation processed
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
 *         description: No active subscription found
 *       401:
 *         description: Unauthorized
 */
router.post('/subscription/cancel', authMiddleware, cancelSubscription);

/**
 * @swagger
 * /api/revenuecat/entitlement/grant:
 *   post:
 *     summary: Grant entitlement to user
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
 *               - entitlementId
 *               - duration
 *             properties:
 *               entitlementId:
 *                 type: string
 *               duration:
 *                 type: number
 *                 description: Duration in seconds
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entitlement granted
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
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/entitlement/grant', authMiddleware, grantEntitlement);

/**
 * @swagger
 * /api/revenuecat/entitlement/revoke:
 *   post:
 *     summary: Revoke entitlement from user
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
 *               - entitlementId
 *             properties:
 *               entitlementId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entitlement revoked
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
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/entitlement/revoke', authMiddleware, revokeEntitlement);

/**
 * @swagger
 * /api/revenuecat/subscription/history:
 *   get:
 *     summary: Get subscription history for current user
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionHistoryResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/subscription/history', authMiddleware, getSubscriptionHistory);

export default router;
