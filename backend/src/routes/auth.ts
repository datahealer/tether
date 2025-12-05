import { Router } from 'express';
import { googleAuth, appleAuth } from '../controllers/auth';

const router = Router();

// OAuth routes for mobile app
router.post('/google', googleAuth);
router.post('/apple', appleAuth);

// If you want email/password for mobile app, add here:
// router.post('/signup', mobileSignup);
// router.post('/login', mobileLogin);

export default router;