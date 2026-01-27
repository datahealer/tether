import { Request, Response } from 'express';
import { CoupleCategoryState } from '../../models/CoupleCategoryState';

/**
 * @route   POST /api/admin/unlocks/process-expiries
 * @desc    Manually process temporary unlock expiries
 * @access  Private (Admin)
 */
export const processUnlockExpiries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('🔄 Processing unlock expiries...');

    const now = new Date();

    // Find all unlocked categories that have expired
    const expiredUnlocks = await CoupleCategoryState.find({
      unlocked: true,
      unlockExpiry: { $lte: now },
    });

    console.log(`Found ${expiredUnlocks.length} expired unlocks to process`);

    // Update all expired unlocks
    const result = await CoupleCategoryState.updateMany(
      {
        unlocked: true,
        unlockExpiry: { $lte: now },
      },
      {
        $set: { unlocked: false },
        $unset: { unlockExpiry: 1 },
      }
    );

    console.log(`✅ Processed ${result.modifiedCount} expired unlocks`);

    res.status(200).json({
      success: true,
      message: `Processed ${result.modifiedCount} expired unlocks`,
      processed: result.modifiedCount,
      found: expiredUnlocks.length,
    });
  } catch (error: any) {
    console.error('❌ Process unlock expiries error:', error);
    res.status(500).json({
      message: 'Server error while processing unlock expiries',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/unlocks/expiring
 * @desc    Get unlocks that are expiring soon
 * @access  Private (Admin)
 */
export const getExpiringUnlocks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { days = '7' } = req.query;
    const daysNum = parseInt(days as string, 10);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysNum);

    const expiringUnlocks = await CoupleCategoryState.find({
      unlocked: true,
      unlockExpiry: { $lte: futureDate, $gt: new Date() },
    })
      .populate('coupleId', 'user1Id user2Id')
      .lean();

    res.status(200).json({
      unlocks: expiringUnlocks,
      count: expiringUnlocks.length,
    });
  } catch (error: any) {
    console.error('❌ Get expiring unlocks error:', error);
    res.status(500).json({
      message: 'Server error while fetching expiring unlocks',
      error: error.message,
    });
  }
};

