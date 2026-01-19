import { Request, Response } from 'express';
import User from '../models/User';
import CoupleInvite from '../models/CoupleInvite';
import Couple from '../models/Couple';
import { UserEntitlement } from '../models/UserEntitlement';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Tier } from '../questionServiceEngine';

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
    const userId = (req.user as any)?.userId || (req.user as any)?.id || req.user?._id?.toString();
    console.log('🔍 User ID from request:', userId);
    console.log('🔍 Request user object:', req.user);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      firstName,
      partnerFirstName,
      dateOfBirth,
      gender,
      relationshipStatus,
      relationshipDuration,
      livingType,
      hasChildren,
      goals,
      emotionalNeeds,
      rhythm,
      tone,
      packPreferences,
    } = req.body;

    // Optimized: Build update object and use findByIdAndUpdate for atomic update
    const updateData: any = {};
    if (firstName) updateData['onboardingData.firstName'] = firstName;
    if (partnerFirstName) updateData['onboardingData.partnerFirstName'] = partnerFirstName;
    if (dateOfBirth) updateData['onboardingData.dateOfBirth'] = dateOfBirth;
    if (gender) updateData['onboardingData.gender'] = gender;
    if (relationshipStatus) updateData['onboardingData.relationshipStatus'] = relationshipStatus;
    if (relationshipDuration) updateData['onboardingData.relationshipDuration'] = relationshipDuration;
    if (livingType) updateData['onboardingData.livingType'] = livingType;
    if (hasChildren !== undefined) updateData['onboardingData.hasChildren'] = hasChildren;
    if (goals) updateData['onboardingData.goals'] = goals;
    if (emotionalNeeds) updateData['onboardingData.emotionalNeeds'] = emotionalNeeds;
    if (rhythm) updateData['onboardingData.rhythm'] = rhythm;
    if (tone) updateData['onboardingData.tone'] = tone;
    if (packPreferences) updateData['onboardingData.packPreferences'] = packPreferences;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

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
    const userId = ((req.user as any)?.userId) ?? ((req.user as any)?.id || req.user?._id?.toString());

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
        subscribed: user.subscribed,
        onboardingData: user.onboardingData,
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
    const userId = ((req.user as any)?.userId) ?? ((req.user as any)?.id || req.user?._id?.toString());

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
          // link: existingInvite.inviteLink,
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
        // link: invite.inviteLink,
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
    const userId = ((req.user as any)?.userId) ?? ((req.user as any)?.id || req.user?._id?.toString());
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

    // Fetch both users - DO NOT use lean() because we need to call .save()
    const [inviter, accepter] = await Promise.all([
      User.findById(invite.inviterId).select('coupleId subscribed name avatar onboarded'),
      User.findById(userId).select('coupleId subscribed name avatar onboarded'),
    ]);

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
    await Promise.all([
      inviter.save(),
      accepter.save(),
    ]);

    // ✅ CREATE USER ENTITLEMENTS FOR BOTH PARTNERS
    // Both partners should have the same tier (highest tier wins)
    // Priority: PREMIUM > TRIAL > FREE
    
    // Fetch existing entitlements first to check actual tier
    const [inviterEntitlement, accepterEntitlement] = await Promise.all([
      UserEntitlement.findOne({ userId: invite.inviterId }),
      UserEntitlement.findOne({ userId }),
    ]);
    
    // Determine couple tier: PREMIUM > TRIAL > FREE
    let coupleTier: Tier;
    let coupleRefreshes: number;
    let trialEnd: Date | undefined;
    
    if (inviterEntitlement?.tier === Tier.PREMIUM || accepterEntitlement?.tier === Tier.PREMIUM) {
      coupleTier = Tier.PREMIUM;
      coupleRefreshes = 3;
    } else if (inviterEntitlement?.tier === Tier.TRIAL || accepterEntitlement?.tier === Tier.TRIAL) {
      coupleTier = Tier.TRIAL;
      coupleRefreshes = 3;
      // Use the existing trial's trialEnd date
      trialEnd = inviterEntitlement?.trialEnd || accepterEntitlement?.trialEnd;
    } else {
      coupleTier = Tier.FREE;
      coupleRefreshes = 1;
    }
    
    console.log(`🎯 Couple tier determined: ${coupleTier} (inviter: ${inviterEntitlement?.tier || 'none'}, accepter: ${accepterEntitlement?.tier || 'none'})`);

    // Optimized: Create/update entitlements in parallel
    await Promise.all([
      inviterEntitlement
        ? (async () => {
            inviterEntitlement.tier = coupleTier;
            inviterEntitlement.refreshesDefault = coupleRefreshes;
            if (trialEnd) inviterEntitlement.trialEnd = trialEnd; // Preserve trial expiry
            await inviterEntitlement.save();
            console.log(`✅ Updated UserEntitlement for user ${invite.inviterId} to tier: ${coupleTier}`);
          })()
        : UserEntitlement.create({
            userId: invite.inviterId,
            tier: coupleTier,
            refreshesDefault: coupleRefreshes,
            refreshesPermanent: 0,
            trialEnd: trialEnd, // Set trial expiry if applicable
          }).then(() => console.log(`✅ Created UserEntitlement for user ${invite.inviterId} (tier: ${coupleTier})`)),
      accepterEntitlement
        ? (async () => {
            accepterEntitlement.tier = coupleTier;
            accepterEntitlement.refreshesDefault = coupleRefreshes;
            if (trialEnd) accepterEntitlement.trialEnd = trialEnd; // Preserve trial expiry
            await accepterEntitlement.save();
            console.log(`✅ Updated UserEntitlement for user ${userId} to tier: ${coupleTier}`);
          })()
        : UserEntitlement.create({
            userId,
            tier: coupleTier,
            refreshesDefault: coupleRefreshes,
            refreshesPermanent: 0,
            trialEnd: trialEnd, // Set trial expiry if applicable
          }).then(() => console.log(`✅ Created UserEntitlement for user ${userId} (tier: ${coupleTier})`)),
    ]);

    // Mark invite as accepted
    invite.status = 'accepted';
    invite.acceptedById = new mongoose.Types.ObjectId(userId);
    invite.acceptedAt = new Date();
    await invite.save();

    // Initialize categories for the new couple
    console.log('📚 Initializing categories for new couple:', couple._id);
    const { QuestionServiceEngine } = await import('../services/questionService');
    await QuestionServiceEngine.initializeCategoriesForCouple(couple._id);

    // Drop initial tethers for the couple
    console.log('🎯 Dropping initial tethers for new couple');
    await QuestionServiceEngine.dropTethersForCouple(couple._id, true); // force = true
    console.log('✅ New couple setup complete!');
    
    // Send couple creation notifications
    try {
      const { NotificationTriggers } = await import('../services/notification/triggers');
      await NotificationTriggers.onCoupleCreated(couple._id.toString());
      console.log('📲 Sent couple creation notifications');
    } catch (notifError) {
      console.error('Error sending couple creation notifications:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully linked with partner',
      couple: {
        _id: couple._id,
        id: couple._id,
        partner1Id: inviter._id,
        partner2Id: accepter._id,
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
      user: {
        id: accepter._id,
        email: accepter.email,
        name: accepter.name,
        coupleId: couple._id,
        onboarded: accepter.onboarded,
        subscribed: accepter.subscribed,
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
    const userId = ((req.user as any)?.userId) ?? ((req.user as any)?.id || req.user?._id?.toString());

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Optimized: Use lean() and select only coupleId first
    const user = await User.findById(userId).select('coupleId').lean();

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

    // Optimized: Fetch couple first to get user IDs, then fetch users in parallel
    const couple = await Couple.findById(user.coupleId)
      .select('user1Id user2Id status createdAt sharedData')
      .lean();

    if (!couple) {
      res.status(404).json({ error: 'Couple not found' });
      return;
    }

    // Optimized: Fetch both users in parallel with lean()
    const [user1, user2] = await Promise.all([
      User.findById(couple.user1Id).select('name email avatar').lean(),
      User.findById(couple.user2Id).select('name email avatar').lean(),
    ]);

    // Determine which user is the partner
    const partner = couple.user1Id.toString() === userId ? user2 : user1;

    if (!partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    res.status(200).json({
      success: true,
      coupled: true,
      coupleId: couple._id,
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
