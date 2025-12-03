import { Request, Response } from 'express';
import  CoupleInvite  from '../models/CoupleInvite';
import  Couple  from '../models/Couple';
import User  from '../models/User';
import { SubscriptionTier } from '../types/enums';
import { IUser } from '../types/interfaces';

export const createInvite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as IUser | undefined;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (user.coupleId) {
      return res.status(400).json({ error: 'Already in couple' });
    }

    // Check existing active invite
    let invite = await CoupleInvite.findOne({ inviterUserId: user._id, usedAt: null });
    if (!invite) {
      const code = Math.random().toString(36).slice(-6).toUpperCase();
      invite = await CoupleInvite.create({ inviterUserId: user._id, code, email: req.body.email });
    }

    res.json({
      code: invite.get('code'),
      shareUrl: `tether://join/${invite.get('code')}`,
      expiresAt: invite.get('expiresAt'),
    });
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({ error: 'Failed to create invite' });
  }
};

export const joinCouple = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const user = (req as any).user as IUser | undefined;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (user.coupleId) {
      return res.status(400).json({ error: 'Already in couple' });
    }

    const invite = await CoupleInvite.findOne({
      code: code.toUpperCase(),
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!invite || invite.inviterId.toString() === user._id.toString()) {
      return res.status(400).json({ error: 'Invalid or expired invite' });
    }

    const couple = await Couple.create({
      users: [invite.inviterId, user._id],
      rhythm: 'daily',
      subscriptionTier: SubscriptionTier.FREE,
    });

    await User.updateMany({ _id: { $in: couple.get('users') } }, { coupleId: couple._id });
    invite.set({ usedByUserId: user._id, usedAt: new Date() });
    await invite.save();

    // Sync entitlements if one is Premium
    const users = await User.find({ _id: { $in: couple.get('users') } });
    const hasPremium = users.some((u) => u.onboardingData);
    if (hasPremium) {
      couple.set('subscriptionTier', SubscriptionTier.PREMIUM);
    }
    await couple.save();

    res.json({ success: true, coupleId: couple._id });
  } catch (error) {
    console.error('Join couple error:', error);
    res.status(500).json({ error: 'Failed to join couple' });
  }
};