import express from 'express';
import {
  processUnlockExpiries,
  getExpiringUnlocks,
} from '../../controllers/admin/unlock';
import { adminAuth } from '../../middleware/auth';

const router = express.Router();

router.use(adminAuth);

router.post('/process-expiries', processUnlockExpiries);
router.get('/expiring', getExpiringUnlocks);

export default router;

