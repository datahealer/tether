import mongoose from 'mongoose';
import Couple from '../models/Couple';
import User from '../models/User';
import { UserEntitlement } from '../models/UserEntitlement';
import { CoupleCategoryState } from '../models/CoupleCategoryState';
import { QuestionServiceEngine } from '../services/questionService';
import { Tier, Rhythm } from '../types/enums';

/**
 * Migration script to set up Question Service Engine data for existing couples
 * Run this once to migrate existing data to the new system
 */
export const migrateExistingCouples = async () => {
  try {
    console.log('Starting migration for existing couples...');

    // 1. Add default rhythm to couples without it
    const couplesWithoutRhythm = await Couple.find({
      $or: [{ rhythm: { $exists: false } }, { rhythm: null }],
    });

    console.log(`Found ${couplesWithoutRhythm.length} couples without rhythm`);

    for (const couple of couplesWithoutRhythm) {
      couple.rhythm = Rhythm.EVERY_DAY; // Default to daily
      if (!couple.sharedData.milestoneRecords) {
        couple.sharedData.milestoneRecords = [];
      }
      await couple.save();
    }

    console.log('✓ Updated couples with default rhythm');

    // 2. Create user entitlements for all users
    const allUsers = await User.find();
    console.log(`Found ${allUsers.length} users to create entitlements for`);

    for (const user of allUsers) {
      const existingEntitlement = await UserEntitlement.findOne({
        userId: user._id,
      });

      if (!existingEntitlement) {
        await UserEntitlement.create({
          userId: user._id,
          tier: user.subscribed ? Tier.PREMIUM : Tier.FREE,
          refreshesDefault: user.subscribed ? 3 : 1,
          refreshesPermanent: 0,
        });
      }
    }

    console.log('✓ Created user entitlements');

    // 3. Initialize categories for all active couples
    const activeCouples = await Couple.find({ status: 'active' });
    console.log(`Found ${activeCouples.length} active couples to initialize`);

    for (const couple of activeCouples) {
      // Check if already initialized
      const existingCategoryStates = await CoupleCategoryState.findOne({
        coupleId: couple._id,
      });

      if (!existingCategoryStates) {
        try {
          await QuestionServiceEngine.initializeCategoriesForCouple(couple._id);
          console.log(`✓ Initialized categories for couple ${couple._id}`);
        } catch (error) {
          console.error(`✗ Error initializing couple ${couple._id}:`, error);
        }
      } else {
        console.log(`⊙ Couple ${couple._id} already initialized`);
      }
    }

    console.log('✓ Category initialization complete');

    // 4. Summary
    const stats = {
      totalCouples: await Couple.countDocuments(),
      activeCouples: await Couple.countDocuments({ status: 'active' }),
      totalUsers: await User.countDocuments(),
      entitlements: await UserEntitlement.countDocuments(),
      categoryStates: await CoupleCategoryState.countDocuments(),
    };

    console.log('\n=== Migration Complete ===');
    console.log('Statistics:');
    console.log(`  Total Couples: ${stats.totalCouples}`);
    console.log(`  Active Couples: ${stats.activeCouples}`);
    console.log(`  Total Users: ${stats.totalUsers}`);
    console.log(`  User Entitlements: ${stats.entitlements}`);
    console.log(`  Category States: ${stats.categoryStates}`);
    console.log('=========================\n');

    return stats;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Standalone migration script
 * Run with: ts-node src/utils/migrations.ts
 */
if (require.main === module) {
  const runMigration = async () => {
    try {
      // Connect to MongoDB
      const mongoUri =
        process.env.DATABASE_URL || 'mongodb://localhost:27017/tether';
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');

      // Run migration
      await migrateExistingCouples();

      // Disconnect
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');

      process.exit(0);
    } catch (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }
  };

  runMigration();
}

