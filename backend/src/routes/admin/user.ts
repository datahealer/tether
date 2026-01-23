import express from 'express';
import {
  getUsers,
  getUserById,
  grantPremium,
  revokePremium,
  addRefreshBundle,
} from '../../controllers/admin/user';
import { adminAuth } from '../../middleware/auth';

const router = express.Router();

router.use(adminAuth);

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.post('/:userId/grant-premium', grantPremium);
router.post('/:userId/revoke-premium', revokePremium);
router.post('/:userId/refresh-bundle', addRefreshBundle);

export default router;

