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
import { getRevenueCatService } from '../services/revenuecat/revenuecat.service';
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
 * /api/revenuecat/webhook/test:
 *   post:
 *     summary: Test webhook processing (development only)
 *     tags: [RevenueCat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 default: monthly
 *     responses:
 *       200:
 *         description: Test webhook processed
 */
router.post('/webhook/test', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any)?.userId || (req.user as any)?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { productId = 'monthly' } = req.body;

    // Create a mock webhook event
    const mockWebhook = {
      type: 'INITIAL_PURCHASE',
      event: {
        id: `test_${Date.now()}`,
        type: 'INITIAL_PURCHASE',
        app_id: 'test',
        app_user_id: userId,
        aliases: [userId],
        original_app_user_id: userId,
        product_id: productId,
        period_type: 'NORMAL' as const,
        purchased_at_ms: Date.now(),
        expiration_at_ms: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        environment: 'SANDBOX' as const,
        store: 'APP_STORE' as const,
        transaction_id: `test_txn_${Date.now()}`,
        original_transaction_id: `test_txn_${Date.now()}`,
        currency: 'USD',
        price: 999,
        price_in_purchased_currency: 999,
        event_timestamp_ms: Date.now(),
      },
      api_version: '1.0',
    };

    const revenueCat = getRevenueCatService();
    await revenueCat.handleWebhook(mockWebhook);

    res.json({
      success: true,
      message: 'Test webhook processed successfully',
      mockWebhook,
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process test webhook',
    });
  }
});

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
