import { Request, Response } from 'express';
import notificationService from '../services/notification/notification.service';
import { NotificationType } from '../models/Notification';
import User from '../models/User';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId || (req.user as any)?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = parseInt(req.query.skip as string, 10) || 0;

    const result = await notificationService.getNotifications(userId, limit, skip);

    res.json({
      success: true,
      notifications: result.notifications,
      total: result.total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message || 'Failed to get notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId || (req.user as any)?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { notificationId } = req.params;
    await notificationService.markAsRead(notificationId, userId);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId || (req.user as any)?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await notificationService.markAllAsRead(userId);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: error.message || 'Failed to mark all notifications as read' });
  }
};

export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId || (req.user as any)?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { gentleReminders, milestoneAlerts, newTetherAlerts } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (gentleReminders !== undefined) {
      user.notificationPreferences.gentleReminders = gentleReminders;
    }
    if (milestoneAlerts !== undefined) {
      user.notificationPreferences.milestoneAlerts = milestoneAlerts;
    }
    if (newTetherAlerts !== undefined) {
      user.notificationPreferences.newTetherAlerts = newTetherAlerts;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: user.notificationPreferences,
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: error.message || 'Failed to update preferences' });
  }
};

export const getPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId || (req.user as any)?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('notificationPreferences');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      preferences: user.notificationPreferences,
    });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: error.message || 'Failed to get preferences' });
  }
};

export const sendTestNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId || (req.user as any)?._id?.toString();
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifications = await notificationService.sendNotification({
      userId,
      type: NotificationType.SYSTEM,
      title: 'Test Notification',
      body: 'This is a test notification from Tether',
      data: { test: true },
      respectPreferences: false,
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      notifications,
    });
  } catch (error: any) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send test notification' });
  }
};
