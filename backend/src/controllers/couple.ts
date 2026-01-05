// import { Request, Response } from 'express';
// import CoupleInvite from '../models/CoupleInvite';
// import Couple from '../models/Couple';
// import User from '../models/User';
// import { IUser } from '../types/interfaces';

// // Generate a random 6-character invite code
// const generateInviteCode = (): string => {
//   return Math.random().toString(36).substring(2, 8).toUpperCase();
// };

// export const createInvite = async (req: Request, res: Response) => {
//   try {
//     const user = (req as any).user as IUser | undefined;

//     if (!user) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     // Check if user is already in a couple
//     if (user.coupleId) {
//       return res.status(400).json({ error: 'You are already in a couple' });
//     }

//     // Check if user already has a pending invite
//     const existingInvite = await CoupleInvite.findOne({
//       inviterId: user._id,
//       status: 'pending',
//       expiresAt: { $gt: new Date() },
//     });

//     if (existingInvite) {
//       return res.json({
//         code: existingInvite.inviteCode,
//         expiresAt: existingInvite.expiresAt,
//       });
//     }

//     // Generate unique invite code
//     let inviteCode: string;
//     let isUnique = false;

//     while (!isUnique) {
//       inviteCode = generateInviteCode();
//       const existing = await CoupleInvite.findOne({ inviteCode });
//       if (!existing) {
//         isUnique = true;
//       }
//     }

//     // Create new invite
//     const invite = await CoupleInvite.create({
//       inviterId: user._id,
//       inviteCode: inviteCode!,
//       status: 'pending',
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//     });

//     res.json({
//       code: invite.inviteCode,
//       expiresAt: invite.expiresAt,
//     });
//   } catch (error) {
//     console.error('Create invite error:', error);
//     res.status(500).json({ error: 'Failed to create invite' });
//   }
// };

// export const joinCouple = async (req: Request, res: Response) => {
//   try {
//     const { code } = req.body;
//     const user = (req as any).user as IUser | undefined;

//     if (!user) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     if (!code || typeof code !== 'string') {
//       return res.status(400).json({ error: 'Invite code is required' });
//     }

//     // Check if user is already in a couple
//     if (user.coupleId) {
//       return res.status(400).json({ error: 'You are already in a couple' });
//     }

//     // Find the invite
//     const invite = await CoupleInvite.findOne({
//       inviteCode: code.toUpperCase(),
//       status: 'pending',
//       expiresAt: { $gt: new Date() },
//     });

//     if (!invite) {
//       return res.status(400).json({ error: 'Invalid or expired invite code' });
//     }

//     // Check if user is trying to accept their own invite
//     if (invite.inviterId.toString() === user._id.toString()) {
//       return res.status(400).json({ error: 'You cannot accept your own invite' });
//     }

//     // Check if inviter is still available
//     const inviter = await User.findById(invite.inviterId);
//     if (!inviter) {
//       return res.status(400).json({ error: 'Inviter not found' });
//     }

//     if (inviter.coupleId) {
//       return res.status(400).json({ error: 'Inviter is already in a couple' });
//     }

//     // Create the couple
//     const couple = await Couple.create({
//       user1Id: invite.inviterId,
//       user2Id: user._id,
//       status: 'active',
//       sharedData: {
//         currentStreak: 0,
//         totalTethersCompleted: 0,
//       },
//     });

//     // Update both users with the coupleId
//     await User.updateMany(
//       { _id: { $in: [invite.inviterId, user._id] } },
//       { $set: { coupleId: couple._id } }
//     );

//     // Mark invite as accepted
//     invite.status = 'accepted';
//     invite.acceptedById = user._id;
//     invite.acceptedAt = new Date();
//     await invite.save();

//     // Invalidate other pending invites from both users
//     await CoupleInvite.updateMany(
//       {
//         $or: [
//           { inviterId: invite.inviterId },
//           { inviterId: user._id },
//         ],
//         status: 'pending',
//         _id: { $ne: invite._id },
//       },
//       { $set: { status: 'expired' } }
//     );

//     res.json({
//       success: true,
//       coupleId: couple._id,
//       message: 'Successfully linked with your partner!',
//     });
//   } catch (error) {
//     console.error('Join couple error:', error);
//     res.status(500).json({ error: 'Failed to join couple' });
//   }
// };
import { Request, Response } from 'express';
import CoupleInvite from '../models/CoupleInvite';
import Couple from '../models/Couple';
import User from '../models/User';
import { UserEntitlement } from '../models/UserEntitlement'; // ← Add this import
import { Tier } from '../types/enums'; // ← Make sure Tier is imported
import { IUser } from '../types/interfaces';

// Generate a random 6-character invite code
const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createInvite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as IUser | undefined;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user is already in a couple
    if (user.coupleId) {
      return res.status(400).json({ error: 'You are already in a couple' });
    }

    // Check if user already has a pending invite
    const existingInvite = await CoupleInvite.findOne({
      inviterId: user._id,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return res.json({
        code: existingInvite.inviteCode,
        expiresAt: existingInvite.expiresAt,
      });
    }

    // Generate unique invite code
    let inviteCode: string;
    let isUnique = false;

    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await CoupleInvite.findOne({ inviteCode });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create new invite
    const invite = await CoupleInvite.create({
      inviterId: user._id,
      inviteCode: inviteCode!,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.json({
      code: invite.inviteCode,
      expiresAt: invite.expiresAt,
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

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    // Check if user is already in a couple
    if (user.coupleId) {
      return res.status(400).json({ error: 'You are already in a couple' });
    }

    // Find the invite
    const invite = await CoupleInvite.findOne({
      inviteCode: code.toUpperCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return res.status(400).json({ error: 'Invalid or expired invite code' });
    }

    // Check if user is trying to accept their own invite
    if (invite.inviterId.toString() === user._id.toString()) {
      return res.status(400).json({ error: 'You cannot accept your own invite' });
    }

    // Check if inviter is still available
    const inviter = await User.findById(invite.inviterId);
    if (!inviter) {
      return res.status(400).json({ error: 'Inviter not found' });
    }

    if (inviter.coupleId) {
      return res.status(400).json({ error: 'Inviter is already in a couple' });
    }

    // Create the couple
    const couple = await Couple.create({
      user1Id: invite.inviterId,
      user2Id: user._id,
      status: 'active',
      sharedData: {
        currentStreak: 0,
        totalTethersCompleted: 0,
      },
    });

    // Update both users with the coupleId
    await User.updateMany(
      { _id: { $in: [invite.inviterId, user._id] } },
      { $set: { coupleId: couple._id } }
    );

    // ✅ AUTO-CREATE USER ENTITLEMENTS FOR BOTH PARTNERS
    for (const userId of [invite.inviterId, user._id]) {
      let entitlement = await UserEntitlement.findOne({ userId });

      if (!entitlement) {
        const currentUser = await User.findById(userId);

        await UserEntitlement.create({
          userId,
          tier: currentUser?.subscribed ? Tier.PREMIUM : Tier.FREE,
          refreshesDefault: currentUser?.subscribed ? 3 : 1,
          refreshesPermanent: 0,
        });

        console.log(`Created UserEntitlement for user ${userId} (tier: ${currentUser?.subscribed ? 'PREMIUM' : 'FREE'})`);
      }
    }

    // Mark invite as accepted
    invite.status = 'accepted';
    invite.acceptedById = user._id;
    invite.acceptedAt = new Date();
    await invite.save();

    // Invalidate other pending invites from both users
    await CoupleInvite.updateMany(
      {
        $or: [
          { inviterId: invite.inviterId },
          { inviterId: user._id },
        ],
        status: 'pending',
        _id: { $ne: invite._id },
      },
      { $set: { status: 'expired' } }
    );
    
    // Send couple creation notifications
    try {
      const { NotificationTriggers } = await import('../services/notification/triggers');
      await NotificationTriggers.onCoupleCreated(couple._id.toString());
      console.log('📲 Sent couple creation notifications');
    } catch (notifError) {
      console.error('Error sending couple creation notifications:', notifError);
    }

    res.json({
      success: true,
      coupleId: couple._id,
      message: 'Successfully linked with your partner!',
    });
  } catch (error) {
    console.error('Join couple error:', error);
    res.status(500).json({ error: 'Failed to join couple' });
  }
};