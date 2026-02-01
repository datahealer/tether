

// import { Request, Response } from 'express';
// import bcrypt from 'bcryptjs';
// import { verifyGoogleToken, verifyAppleToken, generateAuthToken, verifyGoogleAccessToken } from '../services/auth';
// import { createOrUpdateUser } from '../services/user';
// import { Provider, Platform } from '../types/enums';
// import User from '../models/User';

// /**
//  * POST /api/auth/google
//  * Authenticate with Google
//  */
// export const googleAuth = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { idToken, accessToken, platform = 'ios' } = req.body;

//     if (!idToken && !accessToken) {
//       res.status(400).json({ error: 'ID token or access token is required' });
//       return;
//     }

//     let googleUser;
    
//     try {
//       // Try ID token first (preferred)
//       if (idToken) {
//         console.log('🔐 Attempting Google ID token verification...');
//         googleUser = await verifyGoogleToken(idToken);
//       }
//     } catch (idTokenError) {
//       console.log('⚠️ ID token verification failed, trying access token...');
      
//       // Fallback to access token
//       if (accessToken) {
//         try {
//           googleUser = await verifyGoogleAccessToken(accessToken);
//         } catch (accessTokenError) {
//           console.error('❌ Both token verifications failed');
//           res.status(401).json({ error: 'Invalid Google credentials' });
//           return;
//         }
//       } else {
//         res.status(401).json({ error: 'Invalid Google ID token and no access token provided' });
//         return;
//       }
//     }

//     if (!googleUser) {
//       res.status(401).json({ error: 'Failed to verify Google credentials' });
//       return;
//     }

//     console.log('✅ Google user verified:', googleUser.email);

//     // Create or update user
//     const user = await createOrUpdateUser({
//       email: googleUser.email,
//       name: googleUser.name,
//       provider: Provider.GOOGLE,
//       providerId: googleUser.sub,
//       picture: googleUser.picture,
//       platform,
//     });

//     // Generate JWT
//     const token = generateAuthToken(user._id.toString());

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         provider: user.provider,
//         avatar: user.avatar,
//         onboarded: user.onboarded,
//       },
//     });
//   } catch (error: any) {
//     console.error('❌ Google auth error:', error);
//     res.status(500).json({
//       error: error.message || 'Authentication failed',
//     });
//   }
// };

// /**
//  * POST /api/auth/apple
//  * Authenticate with Apple
//  */
// export const appleAuth = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { identityToken, user: appleUserData, platform = 'ios' } = req.body;

//     if (!identityToken) {
//       res.status(400).json({ error: 'Identity token is required' });
//       return;
//     }

//     const appleUser = await verifyAppleToken(identityToken);

//     const userData = {
//       email: appleUser.email,
//       name: appleUserData?.fullName?.givenName 
//         ? `${appleUserData.fullName.givenName} ${appleUserData.fullName.familyName || ''}`.trim()
//         : appleUser.email.split('@')[0],
//       provider: Provider.APPLE,
//       providerId: appleUser.sub,
//       platform,
//     };

//     const user = await createOrUpdateUser(userData);
//     const token = generateAuthToken(user._id.toString());

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         provider: user.provider,
//         avatar: user.avatar,
//         onboarded: user.onboarded,
//       },
//     });
//   } catch (error: any) {
//     console.error('Apple auth error:', error);
//     res.status(500).json({
//       error: error.message || 'Authentication failed',
//     });
//   }
// };

// /**
//  * POST /api/auth/signup
//  * Email/Password Signup
//  */
// export const emailSignup = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password, name, platform = 'ios' } = req.body;

//     if (!email || !password) {
//       res.status(400).json({ error: 'Email and password are required' });
//       return;
//     }

//     if (password.length < 8) {
//       res.status(400).json({ error: 'Password must be at least 8 characters' });
//       return;
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       res.status(400).json({ error: 'User with this email already exists' });
//       return;
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       email: email.toLowerCase(),
//       name: name || email.split('@')[0],
//       password: hashedPassword,
//       provider: Provider.EMAIL,
//       platform: platform as Platform,
//       onboarded: false,
//       onboardingData: {
//         livingType: [],
//         goals: [],
//         emotionalNeeds: [],
//         packPreferences: [],
//       },
//       fcmTokens: [],
//     });

//     // Generate JWT
//     const token = generateAuthToken(user._id.toString());

//     console.log('✅ Email signup successful:', email);

//     res.status(201).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         provider: user.provider,
//         avatar: user.avatar,
//         onboarded: user.onboarded,
//       },
//     });
//   } catch (error: any) {
//     console.error('❌ Email signup error:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to create account',
//     });
//   }
// };

// /**
//  * POST /api/auth/login
//  * Email/Password Login
//  */
// export const emailLogin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       res.status(400).json({ error: 'Email and password are required' });
//       return;
//     }

//     // Find user
//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       res.status(401).json({ error: 'Invalid email or password' });
//       return;
//     }

//     // Check if user signed up with email
//     if (user.provider !== Provider.EMAIL) {
//       res.status(400).json({
//         error: `This email is associated with ${user.provider} sign-in. Please use ${user.provider} to login.`,
//       });
//       return;
//     }

//     // Verify password
//     if (!user.password) {
//       res.status(500).json({ error: 'Password not set for this account' });
//       return;
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       res.status(401).json({ error: 'Invalid email or password' });
//       return;
//     }

//     // Generate JWT
//     const token = generateAuthToken(user._id.toString());

//     console.log('✅ Email login successful:', email);

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         provider: user.provider,
//         avatar: user.avatar,
//         onboarded: user.onboarded,
//       },
//     });
//   } catch (error: any) {
//     console.error('❌ Email login error:', error);
//     res.status(500).json({
//       error: error.message || 'Failed to login',
//     });
//   }
// };

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { 
  verifyGoogleToken, 
  verifyAppleToken, 
  generateTokenPair, 
  verifyRefreshToken,
  verifyGoogleAccessToken 
} from '../services/auth';
import { createOrUpdateUser } from '../services/user';
import { Provider, Platform } from '../types/enums';
import User from '../models/User';
import Couple from '../models/Couple';

// ✅ Helper function to safely get userId from request
const getUserId = (req: Request): string | undefined => {
  const user = req.user as any;
  return user?.userId || user?.id || user?._id?.toString();
};

// ✅ Helper function to build user response with solo mode data
const buildUserResponse = async (user: any) => {
  const userResponse: any = {
    id: user._id,
    email: user.email,
    name: user.name,
    provider: user.provider,
    avatar: user.avatar,
    onboarded: user.onboarded,
    subscribed: user.subscribed,
    coupleId: user.coupleId,
    onboardingData: user.onboardingData,
  };

  // If user has a couple, fetch solo mode details
  if (user.coupleId) {
    const couple = await Couple.findById(user.coupleId);
    if (couple) {
      userResponse.isSoloMode = couple.isSoloMode || false;
      
      // Check if this user is in solo mode and if a real partner has joined
      if (couple.isSoloMode && couple.soloUserId) {
        const soloUserId = couple.soloUserId.toString();
        const currentUserId = user._id.toString();
        
        // User is the solo mode user
        if (soloUserId === currentUserId) {
          userResponse.linkedToRealPartner = false; // Still in solo mode
        } else {
          // This user joined a solo mode couple as the real partner
          userResponse.linkedToRealPartner = true;
        }
      } else if (!couple.isSoloMode) {
        // Real couple (both users are real)
        userResponse.linkedToRealPartner = true;
      }
    }
  }

  return userResponse;
};

/**
 * POST /api/auth/google
 * Authenticate with Google
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, accessToken, platform = 'ios' } = req.body;

    if (!idToken && !accessToken) {
      res.status(400).json({ error: 'ID token or access token is required' });
      return;
    }

    let googleUser;
    
    try {
      if (idToken) {
        console.log('🔐 Attempting Google ID token verification...');
        googleUser = await verifyGoogleToken(idToken);
      }
    } catch (idTokenError) {
      console.log('⚠️ ID token verification failed, trying access token...');
      
      if (accessToken) {
        try {
          googleUser = await verifyGoogleAccessToken(accessToken);
        } catch (accessTokenError) {
          console.error('❌ Both token verifications failed');
          res.status(401).json({ error: 'Invalid Google credentials' });
          return;
        }
      } else {
        res.status(401).json({ error: 'Invalid Google ID token and no access token provided' });
        return;
      }
    }

    if (!googleUser) {
      res.status(401).json({ error: 'Failed to verify Google credentials' });
      return;
    }

    console.log('✅ Google user verified:', googleUser.email);

    const user = await createOrUpdateUser({
      email: googleUser.email,
      name: googleUser.name,
      provider: Provider.GOOGLE,
      providerId: googleUser.sub,
      picture: googleUser.picture,
      platform,
    });

    // Generate token pair
    const { accessToken: newAccessToken, refreshToken } = generateTokenPair(user._id.toString());
    
    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Build user response with solo mode data
    const userResponse = await buildUserResponse(user);

    console.log('🔑 Google Login - Access Token:', newAccessToken);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({
      error: error.message || 'Authentication failed',
    });
  }
};

/**
 * POST /api/auth/apple
 * Authenticate with Apple
 */
export const appleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identityToken, user: appleUserData, email: clientEmail, fullName, platform = 'ios' } = req.body;

    if (!identityToken) {
      res.status(400).json({ error: 'Identity token is required' });
      return;
    }

    const appleUser = await verifyAppleToken(identityToken);

    // Apple only provides email on FIRST sign-in
    // On subsequent sign-ins, we need to use the client-provided email or fetch from DB
    const email = appleUser.email || clientEmail || '';

    if (!email) {
      // Try to find existing user by providerId
      const existingUser = await User.findOne({ providerId: appleUser.sub, provider: Provider.APPLE });
      if (existingUser) {
        // User exists, use their stored email
        const { accessToken, refreshToken } = generateTokenPair(existingUser._id.toString());
        await existingUser.addRefreshToken(refreshToken);

        // Build user response with solo mode data
        const userResponse = await buildUserResponse(existingUser);

        console.log('🔑 Apple Login (Existing User) - Access Token:', accessToken);

        res.status(200).json({
          success: true,
          accessToken,
          refreshToken,
          user: userResponse,
        });
        return;
      } else {
        // New user but no email provided
        res.status(400).json({ 
          error: 'Email is required for first-time Apple sign-in',
          code: 'APPLE_EMAIL_REQUIRED'
        });
        return;
      }
    }

    const userData = {
      email: email,
      name: fullName?.givenName 
        ? `${fullName.givenName} ${fullName.familyName || ''}`.trim()
        : appleUserData?.fullName?.givenName 
          ? `${appleUserData.fullName.givenName} ${appleUserData.fullName.familyName || ''}`.trim()
          : email.split('@')[0],
      provider: Provider.APPLE,
      providerId: appleUser.sub,
      platform,
    };

    const user = await createOrUpdateUser(userData);
    
    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
    
    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Build user response with solo mode data
    const userResponse = await buildUserResponse(user);

    console.log('🔑 Apple Login - Access Token:', accessToken);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Apple auth error:', error);
    res.status(500).json({
      error: error.message || 'Authentication failed',
    });
  }
};

/**
 * POST /api/auth/signup
 * Email/Password Signup
 */
export const emailSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, platform = 'ios' } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Optimized: Use lean() and select only _id for existence check
    const existingUser = await User.findOne({ email: email.toLowerCase() }).select('_id').lean();
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      password: hashedPassword,
      provider: Provider.EMAIL,
      platform: platform as Platform,
      onboarded: false,
      onboardingData: {
        livingType: [],
        goals: [],
        emotionalNeeds: [],
        packPreferences: [],
      },
      fcmTokens: [],
      refreshTokens: [],
      refreshTokenVersion: 0,
    });

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
    console.log('✅ Created default FREE entitlement for user:', user.email);

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
    
    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Build user response with solo mode data
    const userResponse = await buildUserResponse(user);

    console.log('✅ Email signup successful:', email);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('❌ Email signup error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create account',
    });
  }
};

/**
 * POST /api/auth/login
 * Email/Password Login
 */
export const emailLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Optimized: Select password field explicitly for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.provider !== Provider.EMAIL) {
      res.status(400).json({
        error: `This email is associated with ${user.provider} sign-in. Please use ${user.provider} to login.`,
      });
      return;
    }

    if (!user.password) {
      res.status(500).json({ error: 'Password not set for this account' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user._id.toString());
    
    // Store refresh token
    await user.addRefreshToken(refreshToken);

    // Build user response with solo mode data
    const userResponse = await buildUserResponse(user);

    console.log('✅ Email login successful:', email);
    console.log('🔑 Login - Access Token:', accessToken);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('❌ Email login error:', error);
    res.status(500).json({
      error: error.message || 'Failed to login',
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh Access Token
 */
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and check if token is valid
    const user = await User.findById(decoded.userId).select('+refreshTokens +refreshTokenVersion');
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if refresh token exists in user's tokens
    if (!user.refreshTokens.includes(refreshToken)) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new token pair
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id.toString());
    
    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    // Build user response with solo mode data
    const userResponse = await buildUserResponse(user);

    console.log('✅ Token refreshed for user:', user.email);
    console.log('🔑 Refreshed - Access Token:', newAccessToken);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('❌ Token refresh error:', error);
    res.status(401).json({
      error: error.message || 'Failed to refresh token',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout (invalidate refresh token)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const userId = getUserId(req); // ✅ Use helper function

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    

    const user = await User.findById(userId).select('+refreshTokens');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (refreshToken) {
      // Logout from current device
      await user.removeRefreshToken(refreshToken);
      console.log('✅ User logged out from current device:', user.email);
    } else {
      // Logout from all devices
      await user.clearRefreshTokens();
      console.log('✅ User logged out from all devices:', user.email);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      error: error.message || 'Failed to logout',
    });
  }
};