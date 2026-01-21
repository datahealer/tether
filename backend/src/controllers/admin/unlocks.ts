import { Request, Response } from 'express';
import { CoupleCategoryState } from '../../models/CoupleCategoryState';

/**
 * @route   GET /api/admin/unlocks/expired
 * @desc    Get list of expired temporary unlocks
 * @access  Private (Admin)
 */
export const getExpiredUnlocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const now = new Date();

    // Find expired unlocks
    const [expiredUnlocks, total] = await Promise.all([
      CoupleCategoryState.find({
        unlocked: true,
        unlockExpiry: { $lte: now },
      })
        .populate('coupleId', 'user1Id user2Id status')
        .sort({ unlockExpiry: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CoupleCategoryState.countDocuments({
        unlocked: true,
        unlockExpiry: { $lte: now },
      }),
    ]);

    res.status(200).json({
      expiredUnlocks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get expired unlocks error:', error);
    res.status(500).json({
      message: 'Server error while fetching expired unlocks',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/admin/unlocks/process-expiries
 * @desc    Process temporary unlock expiries (manually trigger expiry job)
 * @access  Private (Admin)
 */
export const processUnlockExpiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // Find and expire all temporary unlocks that have passed their expiry date
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

    console.log(`✅ Processed ${result.modifiedCount} expired temporary unlocks`);

    res.status(200).json({
      success: true,
      message: `Processed ${result.modifiedCount} expired temporary unlocks`,
      expiredCount: result.modifiedCount,
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
 * @route   GET /api/admin/unlocks/pending
 * @desc    Get list of pending temporary unlocks (not yet expired)
 * @access  Private (Admin)
 */
export const getPendingUnlocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const now = new Date();

    // Find pending unlocks (unlocked with future expiry)
    const [pendingUnlocks, total] = await Promise.all([
      CoupleCategoryState.find({
        unlocked: true,
        unlockExpiry: { $gt: now },
      })
        .populate('coupleId', 'user1Id user2Id status')
        .sort({ unlockExpiry: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CoupleCategoryState.countDocuments({
        unlocked: true,
        unlockExpiry: { $gt: now },
      }),
    ]);

    res.status(200).json({
      pendingUnlocks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ Get pending unlocks error:', error);
    res.status(500).json({
      message: 'Server error while fetching pending unlocks',
      error: error.message,
    });
  }
};

