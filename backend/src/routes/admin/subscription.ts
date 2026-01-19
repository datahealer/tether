import { Router } from 'express';
import {
  getSubscriptionStats,
  getSubscriptionsList,
  getSubscriptionTrends,
  getChurnAnalysis,
  getUserSubscriptions,
  getRevenueAnalytics,
} from '../../controllers/admin/subscription';
import { adminAuth } from '../../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/subscriptions/stats:
 *   get:
 *     summary: Get subscription statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', getSubscriptionStats);

/**
 * @swagger
 * /api/admin/subscriptions/list:
 *   get:
 *     summary: Get list of all subscriptions with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, cancelled]
 *       - in: query
 *         name: planType
 *         schema:
 *           type: string
 *           enum: [monthly, yearly, trial]
 *       - in: query
 *         name: store
 *         schema:
 *           type: string
 *           enum: [app_store, play_store, stripe, promotional]
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/list', getSubscriptionsList);

/**
 * @swagger
 * /api/admin/subscriptions/trends:
 *   get:
 *     summary: Get subscription trends over time
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, new, cancelled]
 *           default: all
 *     responses:
 *       200:
 *         description: Subscription trends
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionTrends'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/trends', getSubscriptionTrends);

/**
 * @swagger
 * /api/admin/subscriptions/churn:
 *   get:
 *     summary: Get churn analysis
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days
 *     responses:
 *       200:
 *         description: Churn analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChurnAnalysis'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/churn', getChurnAnalysis);

/**
 * @swagger
 * /api/admin/subscriptions/user/:userId:
 *   get:
 *     summary: Get subscription details for a specific user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User subscription details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSubscriptionsResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', getUserSubscriptions);

/**
 * @swagger
 * /api/admin/subscriptions/revenue:
 *   get:
 *     summary: Get detailed revenue analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Revenue analytics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueAnalytics'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/revenue', getRevenueAnalytics);

export default router;

