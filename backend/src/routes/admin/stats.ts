import express from 'express';
import { getBasicStats } from '../../controllers/admin/stats';
import { adminAuth } from '../../middleware/auth';

const router = express.Router();

router.use(adminAuth);

router.get('/', getBasicStats);

export default router;

