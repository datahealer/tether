/**
 * Virtual Partner Service
 * Handles solo mode couple creation and upgrade to real couples
 */

import mongoose from 'mongoose';
import User from '../models/User';
import Couple from '../models/Couple';
import { ICouple } from '../models/Couple';
import { Provider, Platform, Rhythm } from '../types/enums';

export class VirtualPartnerService {
  /**
   * Create a virtual partner and solo couple for a user
   * This allows single users to explore the app before their partner joins
   */
  static async createSoloCouple(
    userId: mongoose.Types.ObjectId,
    rhythm: Rhythm = Rhythm.EVERY_DAY
  ): Promise<ICouple> {
    console.log(`🚶 Creating solo couple for user ${userId}`);

    // Check if user already has a couple
    const existingUser = await User.findById(userId);
    if (existingUser?.coupleId) {
      throw new Error('User already has a couple');
    }

    // Create virtual partner user
    const virtualPartner = await User.create({
      email: `virtual-${userId}@tether.internal`,
      name: 'Virtual Partner',
      provider: Provider.GOOGLE, // Use a valid provider
      platform: Platform.IOS, // Use a valid platform
      onboarded: true,
      subscribed: false,
      isVirtualPartner: true, // Mark as virtual
      linkedToRealPartner: false,
    });

    console.log(`✅ Created virtual partner: ${virtualPartner._id}`);

    // Create solo-mode couple
    const couple = await Couple.create({
      user1Id: userId,
      user2Id: virtualPartner._id,
      status: 'active',
      isSoloMode: true,
      soloUserId: userId,
      rhythm,
      sharedData: {
        currentStreak: 0,
        totalTethersCompleted: 0,
        permanentRefreshBalance: 0,
        milestoneRecords: [],
      },
    });

    console.log(`✅ Created solo couple: ${couple._id}`);

    // Link user to couple
    await User.findByIdAndUpdate(userId, { coupleId: couple._id });

    console.log(`✅ Solo mode setup complete for user ${userId}`);

    return couple;
  }

  /**
   * Upgrade a solo couple to a real couple when partner joins
   * Replaces the virtual partner with the real partner
   */
  static async upgradeSoloCouple(
    soloUserId: mongoose.Types.ObjectId,
    partnerUserId: mongoose.Types.ObjectId
  ): Promise<ICouple> {
    console.log(`🔄 Upgrading solo couple: ${soloUserId} + ${partnerUserId}`);

    const soloUser = await User.findById(soloUserId);
    if (!soloUser?.coupleId) {
      throw new Error('Solo user is not in a couple');
    }

    const couple = await Couple.findById(soloUser.coupleId);
    if (!couple) {
      throw new Error('Couple not found');
    }

    if (!couple.isSoloMode) {
      throw new Error('Not a solo mode couple');
    }

    // Get virtual partner ID before replacing
    const virtualPartnerId = couple.user2Id;

    // Verify it's actually a virtual partner
    const virtualPartner = await User.findById(virtualPartnerId);
    if (!virtualPartner?.isVirtualPartner) {
      throw new Error('Cannot upgrade - partner is not virtual');
    }

    console.log(`🗑️  Removing virtual partner: ${virtualPartnerId}`);

    // Update couple with real partner
    couple.user2Id = partnerUserId;
    couple.isSoloMode = false;
    couple.soloUserId = undefined;
    await couple.save();

    console.log(`✅ Couple upgraded to real couple: ${couple._id}`);

    // Update both users - BOTH should have linkedToRealPartner = true
    await User.findByIdAndUpdate(soloUserId, {
      coupleId: couple._id,
      linkedToRealPartner: true,
    });

    await User.findByIdAndUpdate(partnerUserId, {
      coupleId: couple._id,
      linkedToRealPartner: true, // ✅ FIX: Set to true for partner as well
    });

    console.log(`✅ Both users linked to couple with linkedToRealPartner=true`);

    // Delete virtual partner
    await User.findByIdAndDelete(virtualPartnerId);
    console.log(`✅ Virtual partner deleted`);

    return couple;
  }

  /**
   * Check if a couple is in solo mode
   */
  static isSoloCouple(couple: ICouple): boolean {
    return couple.isSoloMode === true;
  }

  /**
   * Get the real user ID from a solo couple
   */
  static getSoloUserId(couple: ICouple): mongoose.Types.ObjectId | null {
    if (!couple.isSoloMode) return null;
    return couple.soloUserId || null;
  }

  /**
   * Cleanup orphaned virtual partners (background job)
   * Removes virtual partners not linked to any couple
   */
  static async cleanupOrphanedVirtualPartners(): Promise<number> {
    console.log('🧹 Cleaning up orphaned virtual partners...');

    // Find virtual partners
    const virtualPartners = await User.find({ isVirtualPartner: true });

    let deletedCount = 0;

    for (const vp of virtualPartners) {
      // Check if they're part of any couple
      const inCouple = await Couple.findOne({
        $or: [{ user1Id: vp._id }, { user2Id: vp._id }],
      });

      if (!inCouple) {
        // Orphaned - delete
        await User.findByIdAndDelete(vp._id);
        deletedCount++;
        console.log(`Deleted orphaned virtual partner: ${vp._id}`);
      }
    }

    console.log(`✅ Cleaned up ${deletedCount} orphaned virtual partners`);
    return deletedCount;
  }

  /**
   * Handle case where both users are in solo mode and want to connect
   * This can happen if both skip partner invite initially
   */
  static async mergeSoloCouples(
    user1Id: mongoose.Types.ObjectId,
    user2Id: mongoose.Types.ObjectId
  ): Promise<ICouple> {
    console.log(`🔀 Merging solo couples for ${user1Id} + ${user2Id}`);

    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    if (!user1?.coupleId || !user2?.coupleId) {
      throw new Error('Both users must be in solo couples');
    }

    const couple1 = await Couple.findById(user1.coupleId);
    const couple2 = await Couple.findById(user2.coupleId);

    if (!couple1?.isSoloMode || !couple2?.isSoloMode) {
      throw new Error('Both couples must be in solo mode');
    }

    // Keep the older couple, delete the newer one
    const keepCouple = couple1.createdAt < couple2.createdAt ? couple1 : couple2;
    const deleteCouple = keepCouple === couple1 ? couple2 : couple1;

    console.log(`Keeping couple: ${keepCouple._id}, deleting: ${deleteCouple._id}`);

    // Get virtual partners
    const virtual1 = await User.findById(couple1.user2Id);
    const virtual2 = await User.findById(couple2.user2Id);

    // Update kept couple with real users
    keepCouple.user1Id = user1Id;
    keepCouple.user2Id = user2Id;
    keepCouple.isSoloMode = false;
    keepCouple.soloUserId = undefined;
    await keepCouple.save();

    // Update both users to point to kept couple
    await User.findByIdAndUpdate(user1Id, {
      coupleId: keepCouple._id,
      linkedToRealPartner: true,
    });
    await User.findByIdAndUpdate(user2Id, {
      coupleId: keepCouple._id,
      linkedToRealPartner: true,
    });

    // Delete the other couple and both virtual partners
    await Couple.findByIdAndDelete(deleteCouple._id);
    if (virtual1?.isVirtualPartner) await User.findByIdAndDelete(virtual1._id);
    if (virtual2?.isVirtualPartner) await User.findByIdAndDelete(virtual2._id);

    console.log(`✅ Solo couples merged successfully`);

    return keepCouple;
  }
}
