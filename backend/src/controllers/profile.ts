import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config({ path: `./config/env/${process.env.NODE_ENV || 'development'}.env` });

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'us-east-1',
  // ✅ Remove explicit credentials - Lambda uses IAM role automatically
  // Only provide credentials if running locally
  ...(process.env.AWS_LAMBDA_FUNCTION_NAME ? {} : {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  })
});

// ✅ Helper to get userId consistently
const getUserId = (req: Request): string => {
  const user = req.user as any;
  return user?.userId || user?.id || user?._id?.toString();
};

/**
 * Upload profile photo to S3
 */
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }

    const userId = getUserId(req); // ✅ Use helper
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const bucketName = process.env.S3_BUCKET!;
    const region = process.env.AWS_REGION || 'us-east-1';

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `profile-photos/${userId}/${timestamp}-${sanitizedFilename}`;
    
    console.log(`📤 Uploading to S3: ${bucketName}/${key}`);

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        userId: userId,
        uploadedAt: new Date().toISOString(),
      },
    }));

    // Generate CDN URL
    const photoUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    console.log(`✅ Upload successful: ${photoUrl}`);

    // Update user's profile picture in database
    await User.findByIdAndUpdate(userId, {
      avatar: photoUrl,
    });

    res.status(200).json({ 
      photoUrl,
      message: 'Profile photo uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req); // ✅ Use helper
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, dateOfBirth, gender, profilePicture } = req.body;

    console.log('📝 Update profile request:', { userId, name, dateOfBirth, gender, profilePicture });

    // Build update object
    const updateData: any = {};

    // Only validate and update name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      updateData.name = name.trim();
    }

    if (dateOfBirth) {
      updateData['onboardingData.dateOfBirth'] = dateOfBirth;
    }

    if (gender) {
      updateData['onboardingData.gender'] = gender;
    }

    // Handle profile picture (allow null to remove)
    if (profilePicture !== undefined) {
      updateData.avatar = profilePicture;
    }

    console.log('🔄 Updating user with data:', updateData);

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        runValidators: true,
      }
    ).select('-password -refreshTokens -__v');

    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Profile updated successfully:', user.email);

    res.status(200).json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        onboarded: user.onboarded,
        subscribed: user.subscribed,
        onboardingData: user.onboardingData,
      },
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req); // ✅ Use helper
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(userId)
      .select('-password -refreshTokens -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        onboarded: user.onboarded,
        subscribed: user.subscribed,
        onboardingData: user.onboardingData,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Delete profile photo
 */
export const deleteProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req); // ✅ Use helper
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { avatar: 1 } },
      { new: true }
    ).select('-password -refreshTokens -__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Profile photo deleted successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        onboarded: user.onboarded,
        subscribed: user.subscribed,
      }
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete profile photo' });
  }
};

/**
 * Register FCM token for push notifications
 */
export const registerFCMToken = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    if (!platform || !['ios', 'android'].includes(platform)) {
      return res.status(400).json({ error: 'Valid platform (ios/android) is required' });
    }

    // Optimized: Use findOneAndUpdate for atomic update
    const user = await User.findOneAndUpdate(
      { _id: userId, fcmTokens: { $ne: token } },
      { 
        $addToSet: { fcmTokens: token },
        $set: { platform }
      },
      { new: true }
    );

    if (!user) {
      // Check if user exists but token already present
      const existingUser = await User.findById(userId).select('email').lean();
      if (existingUser) {
        console.log(`ℹ️ FCM token already registered for user ${existingUser.email}`);
        return res.status(200).json({
          success: true,
          message: 'FCM token already registered',
        });
      }
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
    });
  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({ error: 'Failed to register FCM token' });
  }
};

/**
 * Unregister FCM token (on logout)
 */
export const unregisterFCMToken = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    // Optimized: Use findOneAndUpdate for atomic update
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { fcmTokens: token } },
      { new: true }
    ).select('email').lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ FCM token unregistered for user ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'FCM token unregistered successfully',
    });
  } catch (error) {
    console.error('Unregister FCM token error:', error);
    res.status(500).json({ error: 'Failed to unregister FCM token' });
  }
};