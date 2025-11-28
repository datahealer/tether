import { Request, Response } from 'express';
import { User } from '../models/User';
import { Platform } from '../types/enums';

export const updatePushToken = async (req: Request, res: Response) => {
  try {
    const { deviceToken, platform } = req.body;
    const user = req.user;

    // Validate authentication
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate input
    if (!deviceToken || !platform) {
      return res.status(400).json({ error: 'Device token and platform required' });
    }

    if (platform === Platform.ANDROID) {
      if (!user.fcmTokens.includes(deviceToken)) {
        user.fcmTokens.push(deviceToken);
      }
    } else if (platform === Platform.IOS) {
      user.apnsToken = deviceToken;
    } else {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    await user.save();
    res.json({ success: true, message: 'Push token updated' });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
};