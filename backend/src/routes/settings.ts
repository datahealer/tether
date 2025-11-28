import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { updatePushToken } from '../controllers/settings';

const router = Router();

// Update FCM / APNs token when device changes
router.patch('/push-token', authMiddleware, updatePushToken);

// Optional: Toggle gentle reminders, milestone alerts, etc.
router.patch('/notifications', authMiddleware, (req, res) => {
  // Coming next
});

export default router;