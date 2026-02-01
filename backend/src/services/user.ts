import User from '../models/User';
import { Provider } from '../types/enums';

export interface CreateUserData {
  email: string;
  name: string;
  provider: Provider;
  providerId: string;
  picture?: string;
  platform: string;
}

/**
 * Find user by provider and providerId
 */
export const findUserByProvider = async (
  provider: Provider,
  providerId: string
): Promise<any | null> => {
  try {
    const query: any = {};
    
    if (provider === Provider.GOOGLE) {
      query.googleSub = providerId;
    } else if (provider === Provider.APPLE) {
      query.appleSub = providerId;
    }
    
    const user = await User.findOne(query);
    return user;
  } catch (error) {
    console.error('Error finding user by provider:', error);
    throw error;
  }
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<any | null> => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

/**
 * Create or update user from OAuth
 */
export const createOrUpdateUser = async (data: CreateUserData): Promise<any> => {
  try {
    // Check if user exists with this provider
    let user = await findUserByProvider(data.provider, data.providerId);

    if (user) {
      // Update existing user
      user.name = data.name;
      if (data.picture) {
        user.avatar = data.picture;
      }
      await user.save();
      return user;
    }

    // Check if user exists with this email but different provider
    user = await findUserByEmail(data.email);
    
    if (user) {
      // Link new provider to existing account
      if (data.provider === Provider.GOOGLE) {
        user.googleSub = data.providerId;
      } else if (data.provider === Provider.APPLE) {
        user.appleSub = data.providerId;
      }
      
      if (data.picture) {
        user.avatar = data.picture;
      }
      await user.save();
      return user;
    }

    // Create new user
    const userData: any = {
      email: data.email.toLowerCase(),
      name: data.name,
      provider: data.provider,
      platform: data.platform,
      avatar: data.picture,
      onboarded: false,
    };

    // Set the appropriate sub field
    if (data.provider === Provider.GOOGLE) {
      userData.googleSub = data.providerId;
    } else if (data.provider === Provider.APPLE) {
      userData.appleSub = data.providerId;
    }

    user = await User.create(userData);
    
    // ✅ Create default FREE entitlement for new user
    const { UserEntitlement } = await import('../models/UserEntitlement');
    const { Tier } = await import('../types/enums');
    await UserEntitlement.create({
      userId: user._id,
      tier: Tier.FREE,
      refreshesDefault: 1,
      refreshesBonus: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Created default FREE entitlement for OAuth user:', user.email);
    
    return user;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};