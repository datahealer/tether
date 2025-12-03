import { Router } from 'express';
import { googleAuth, appleAuth } from '../controllers/auth';

const router = Router();

// OAuth routes
router.post('/google', googleAuth);
router.post('/apple', appleAuth);

// Email/password routes
// router.post('/signup', emailSignup);
// router.post('/login', emailLogin);

export default router;