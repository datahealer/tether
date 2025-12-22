import express from 'express';
import { 
  startTrial, 
  subscribeToPlan, 
  getSubscriptionStatus, 
  cancelSubscription 
} from '../controllers/subscription';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Start trial
router.post('/trial/start', startTrial);

// Subscribe to plan
router.post('/subscribe', subscribeToPlan);

// Get subscription status
router.get('/status', getSubscriptionStatus);

// Cancel subscription
router.post('/cancel', cancelSubscription);

export default router;