import { Router } from 'express';
import { createInvite, joinCouple } from '../controllers/couple';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/invite', authMiddleware, createInvite);
router.post('/join', authMiddleware, joinCouple);

export default router;