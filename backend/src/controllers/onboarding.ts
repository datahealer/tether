import { Request, Response } from 'express';
import { User } from '../models/User';
import { Couple } from '../models/Couple';
import { CategoryId, SubscriptionTier } from '../types/enums';
import { IOnboardingData, IUser } from '../types/interfaces';
import { CategoryProgress } from '../models/CategoryProgress';

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as IUser | undefined;
    const onboardingData: IOnboardingData = req.body;

    // Validate authentication
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate data
    if (!onboardingData.goals?.length) {
      return res.status(400).json({ error: 'Goals required' });
    }

    user.onboarded = true;
    user.onboardingData = onboardingData;
    await user.save();

    if (user.coupleId) {
      const couple = await Couple.findById(user.coupleId);
      if (couple) {
        couple.rhythm = onboardingData.rhythmPreference;

        if (couple.subscriptionTier === SubscriptionTier.FREE) {
          let unlocked = onboardingData.goals
            .slice(0, 2)
            .map((g) => g.toLowerCase().replace(/ /g, '_') as CategoryId);

          if (unlocked.length < 2) {
            const fallback = onboardingData.relationshipStage
              .toLowerCase()
              .replace('-', '_') as CategoryId;
            unlocked.push(fallback || CategoryId.COMMUNICATION);
          }

          for (const cat of unlocked) {
            await CategoryProgress.findOneAndUpdate(
              { coupleId: couple._id, categoryId: cat },
              { $setOnInsert: { answeredCount: 0 } },
              { upsert: true }
            );
          }
        }
        await couple.save();
      }
    }

    res.json({
      success: true,
      unlockedCategories: user.coupleId
        ? await getUnlockedCategories(user.coupleId.toString())
        : [],
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
};

async function getUnlockedCategories(coupleId: string) {
  const progress = await CategoryProgress.find({ coupleId });
  return progress.map((p) => p.categoryId);
}