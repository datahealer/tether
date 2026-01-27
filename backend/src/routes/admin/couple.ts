import express from 'express';
import {
  getCouples,
  unlinkPartners,
  linkPartners,
} from '../../controllers/admin/couple';
import { adminAuth } from '../../middleware/auth';

const router = express.Router();

router.use(adminAuth);

router.get('/', getCouples);
router.post('/:coupleId/unlink', unlinkPartners);
router.post('/users/:userId/link-partner', linkPartners);

export default router;

