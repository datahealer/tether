import { Router } from 'express';
import { completeOnboarding } from '../controllers/onboarding';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/complete', authMiddleware, completeOnboarding);

export default router;