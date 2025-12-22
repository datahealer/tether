import express from 'express';
import { 
  appleAuth, 
  googleAuth, 
  emailSignup, 
  emailLogin,
  refreshAccessToken,
  logout 
} from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Social Auth
router.post('/apple', appleAuth);
router.post('/google', googleAuth);

// Email Auth
router.post('/signup', emailSignup);
router.post('/login', emailLogin);

// Token Management
router.post('/refresh', refreshAccessToken);
router.post('/logout', authMiddleware, logout);

export default router;