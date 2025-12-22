import { Router } from 'express';
import { signup, login, getMe, changePassword } from '../../controllers/admin/auth';
import { adminAuth } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', adminAuth, getMe);
router.put('/change-password', adminAuth, changePassword);

export default router;