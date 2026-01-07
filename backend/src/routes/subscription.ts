import express from 'express';
import { 
  startTrial, 
  subscribeToPlan, 
  getSubscriptionStatus, 
  cancelSubscription 
} from '../controllers/subscription';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/subscription/trial/start:
 *   post:
 *     summary: Start free trial
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trial started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/trial/start', startTrial);

/**
 * @swagger
 * /api/subscription/subscribe:
 *   post:
 *     deprecated: true
 *     summary: [DEPRECATED] Subscribe to a plan - Use RevenueCat SDK in mobile app
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       410:
 *         description: Endpoint deprecated - Use in-app purchases via RevenueCat SDK
 */
// DISABLED: Users must use RevenueCat SDK for real payments
// router.post('/subscribe', subscribeToPlan);

/**
 * @swagger
 * /api/subscription/status:
 *   get:
 *     summary: Get subscription status
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', getSubscriptionStatus);

/**
 * @swagger
 * /api/subscription/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       401:
 *         description: Unauthorized
 */
router.post('/cancel', cancelSubscription);

export default router;