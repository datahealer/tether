import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import {
  uploadProfilePhoto,
  updateProfile,
  getProfile,
  deleteProfilePhoto,
} from '../controllers/profile';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Pass error as first argument, not throw
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.') as any);
    }
  },
});

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/', authMiddleware, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', authMiddleware, updateProfile);

/**
 * @route   POST /api/profile/photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post('/photo', authMiddleware, upload.single('photo'), uploadProfilePhoto);

/**
 * @route   DELETE /api/profile/photo
 * @desc    Delete profile photo
 * @access  Private
 */
router.delete('/photo', authMiddleware, deleteProfilePhoto);

export default router;
