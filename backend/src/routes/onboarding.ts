import express from 'express';
import {
  updateOnboarding,
  completeOnboarding,
  generateInvite,
  acceptInvite,
  getCoupleInfo,
} from '../controllers/onboarding';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Update onboarding data
router.post('/update', updateOnboarding);

// Complete onboarding
router.post('/complete', completeOnboarding);

// Generate couple invite
router.post('/invite/generate', generateInvite);

// Accept couple invite
router.post('/invite/accept', acceptInvite);

// Get couple information
router.get('/couple', getCoupleInfo);

export default router;