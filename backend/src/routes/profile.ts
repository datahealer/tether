import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import {
  uploadProfilePhoto,
  updateProfile,
  getProfile,
  deleteProfilePhoto,
  registerFCMToken,
  unregisterFCMToken,
} from '../controllers/profile';
import notificationService from '../services/notification/notification.service';

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
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);

/**
 * @swagger
 * /api/profile/photo:
 *   post:
 *     summary: Upload profile photo
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete profile photo
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Photo deleted
 *       401:
 *         description: Unauthorized
 */
router.post('/photo', authMiddleware, upload.single('photo'), uploadProfilePhoto);
router.delete('/photo', authMiddleware, deleteProfilePhoto);

// FCM Token routes for push notifications
router.post('/fcm-token', authMiddleware, registerFCMToken);
router.delete('/fcm-token', authMiddleware, unregisterFCMToken);

router.post('/test-notification', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    await notificationService.sendNotification({
      userId,
      type: 'new_tether' as any,
      title: 'New Tether Question!',
      body: "You've got a new Intimacy question to answer",
      data: {
        categoryId: 'intimacy',
        tetherQuestion: 'test_question_id',
      },
    });

    res.json({ message: 'Test notification sent' });
  } catch (error) {
    console.error('Test notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;

