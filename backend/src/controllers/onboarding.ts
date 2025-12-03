import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import CoupleInvite from '../models/CoupleInvite';
import Couple from '../models/Couple';
import crypto from 'crypto';
import mongoose from 'mongoose';

/**
 * Generate a 6-digit invite code
 */
const generateInviteCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * POST /api/onboarding/update
 * Update user's onboarding data
 */
export const updateOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ((req.user as any)?.userId) ?? ((req.user as IUser)?._id?.toString());
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      relationshipStatus,
      relationshipDuration,
      livingType,
      goals,
      emotionalNeeds,
      rhythm,
      tone,
      packPreferences,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update onboarding data
    user.onboardingData = {
      ...user.onboardingData,
      ...(relationshipStatus && { relationshipStatus }),
      ...(relationshipDuration && { relationshipDuration }),
      ...(livingType && { livingType }),
      ...(goals && { goals }),
      ...(emotionalNeeds && { emotionalNeeds }),
      ...(rhythm && { rhythm }),
      ...(tone && { tone }),
      ...(packPreferences && { packPreferences }),
    };

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboardingData: user.onboardingData,
      },
    });
  } catch (error: any) {
    console.error('Update onboarding error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update onboarding data',
    });
  }
};

/**
 * POST /api/onboarding/complete
 * Mark onboarding as complete
 */
export const completeOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ((req.user as any)?.userId) ?? ((req.user as IUser)?._id?.toString());

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.onboarded = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        onboarded: user.onboarded,
      },
    });
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      error: error.message || 'Failed to complete onboarding',
    });
  }
};

/**
 * POST /api/onboarding/invite/generate
 * Generate a couple invite link and code
 */
export const generateInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ((req.user as any)?.userId) ?? ((req.user as IUser)?._id?.toString());

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if user already has a pending invite
    const existingInvite = await CoupleInvite.findOne({
      inviterId: userId,
      status: 'pending',
    });

    if (existingInvite) {
      res.status(200).json({
        success: true,
        invite: {
          code: existingInvite.inviteCode,
          link: existingInvite.inviteLink,
          expiresAt: existingInvite.expiresAt,
        },
      });
      return;
    }

    // Generate new invite
    const inviteCode = generateInviteCode();
    const inviteLink = `tether://invite/${inviteCode}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invite = await CoupleInvite.create({
      inviterId: userId,
      inviteCode,
      inviteLink,
      expiresAt,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      invite: {
        code: invite.inviteCode,
        link: invite.inviteLink,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Generate invite error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate invite',
    });
  }
};

/**
 * POST /api/onboarding/invite/accept
 * Accept a couple invite using code
 */
export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ((req.user as any)?.userId) ?? ((req.user as IUser)?._id?.toString());
    const { inviteCode } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!inviteCode) {
      res.status(400).json({ error: 'Invite code is required' });
      return;
    }

    // Find the invite
    const invite = await CoupleInvite.findOne({
      inviteCode,
      status: 'pending',
    });

    if (!invite) {
      res.status(404).json({ error: 'Invalid or expired invite code' });
      return;
    }

    // Check if invite has expired
    if (invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      res.status(400).json({ error: 'Invite code has expired' });
      return;
    }

    // Check if user is trying to accept their own invite
    if (invite.inviterId.toString() === userId) {
      res.status(400).json({ error: 'You cannot accept your own invite' });
      return;
    }

    // Check if either user is already in a couple
    const inviter = await User.findById(invite.inviterId);
    const accepter = await User.findById(userId);

    if (!inviter || !accepter) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (inviter.coupleId || accepter.coupleId) {
      res.status(400).json({ error: 'One or both users are already in a couple' });
      return;
    }

    // Create the couple
    const couple = await Couple.create({
      user1Id: invite.inviterId,
      user2Id: userId,
      status: 'active',
      sharedData: {
        currentStreak: 0,
        totalTethersCompleted: 0,
      },
    });

    // Update both users with coupleId
    inviter.coupleId = couple._id;
    accepter.coupleId = couple._id;
    
    await inviter.save();
    await accepter.save();

    // Mark invite as accepted
    invite.status = 'accepted';
    invite.acceptedById = new mongoose.Types.ObjectId(userId);
    invite.acceptedAt = new Date();
    await invite.save();

    res.status(200).json({
      success: true,
      message: 'Successfully linked with partner',
      couple: {
        id: couple._id,
        user1: {
          id: inviter._id,
          name: inviter.name,
          avatar: inviter.avatar,
        },
        user2: {
          id: accepter._id,
          name: accepter.name,
          avatar: accepter.avatar,
        },
      },
    });
  } catch (error: any) {
    console.error('Accept invite error:', error);
    res.status(500).json({
      error: error.message || 'Failed to accept invite',
    });
  }
};

/**
 * GET /api/onboarding/couple
 * Get user's couple information
 */
export const getCoupleInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = ((req.user as any)?.userId) ?? ((req.user as IUser)?._id?.toString());

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).populate('coupleId');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.coupleId) {
      res.status(200).json({
        success: true,
        coupled: false,
      });
      return;
    }

    const couple = await Couple.findById(user.coupleId)
      .populate<{ user1Id: IUser; user2Id: IUser }>('user1Id', 'name email avatar')
      .populate<{ user1Id: IUser; user2Id: IUser }>('user2Id', 'name email avatar');

    if (!couple) {
      res.status(404).json({ error: 'Couple not found' });
      return;
    }

    // Type assertion to help TypeScript understand the populated fields
    const populatedCouple = couple as any;
    const partner = populatedCouple.user1Id._id.toString() === userId 
      ? populatedCouple.user2Id 
      : populatedCouple.user1Id;

    res.status(200).json({
      success: true,
      coupled: true,
      couple: {
        id: couple._id,
        status: couple.status,
        createdAt: couple.createdAt,
        sharedData: couple.sharedData,
        partner: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
          avatar: partner.avatar,
        },
      },
    });
  } catch (error: any) {
    console.error('Get couple info error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get couple information',
    });
  }
};