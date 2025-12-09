import express from 'express';
import { appleAuth, googleAuth, emailSignup, emailLogin } from '../controllers/auth';

const router = express.Router();

// Social Auth
router.post('/apple', appleAuth);
router.post('/google', googleAuth);

// Email Auth
router.post('/signup', emailSignup);
router.post('/login', emailLogin);

export default router;