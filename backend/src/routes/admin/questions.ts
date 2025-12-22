import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
} from '../../controllers/admin/question';
import { adminAuth } from '../../middleware/auth';

const router = express.Router();

// All routes are protected with admin authentication
router.use(adminAuth);

// Question routes
router.get('/', getAllQuestions);
router.get('/stats', getQuestionStats);
router.get('/:id', getQuestionById);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;