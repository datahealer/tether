import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/admin/category';
import { adminAuth } from '../../middleware/auth';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllCategories);
router.post('/', createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;