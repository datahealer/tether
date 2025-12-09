

// import { Request, Response } from 'express';
// import { verifyGoogleToken, verifyAppleToken, generateAuthToken } from '../services/auth';
// import { createOrUpdateUser, findUserByEmail } from '../services/user';
// import { Provider, Platform } from '../types/enums';
// import bcrypt from 'bcryptjs';

// /**
//  * POST /auth/google
//  * Sign in or sign up with Google
//  */
// export const googleAuth = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { idToken, user } = req.body;

//     if (!idToken) {
//       res.status(400).json({ error: 'ID token is required' });
//       return;
//     }

//     // Verify Google token
//     const googleUser = await verifyGoogleToken(idToken);

//     // Determine platform from user agent or body
//     const platform = req.body.platform || Platform.IOS;

//     // Create or update user
//     const dbUser = await createOrUpdateUser({
//       email: googleUser.email,
//       name: googleUser.name || user?.name || 'User',
//       provider: Provider.GOOGLE,
//       providerId: googleUser.sub,
//       picture: googleUser.picture || user?.photo,
//       platform,
//     });

//     // Generate JWT
//     const token = generateAuthToken(dbUser._id.toString());

//     res.status(200).json({
//       success: true,
//       user: {
//         id: dbUser._id,
//         email: dbUser.email,
//         name: dbUser.name,
//         provider: dbUser.provider,
//         avatar: dbUser.avatar,
//         onboarded: dbUser.onboarded,
//       },
//       token,
//     });
//   } catch (error: any) {
//     console.error('Google auth error:', error);
//     res.status(401).json({
//       success: false,
//       error: error.message || 'Authentication failed',
//     });
//   }
// };

// /**
//  * POST /auth/apple
//  * Sign in or sign up with Apple
//  */
// export const appleAuth = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { identityToken, user, email, fullName } = req.body;

//     if (!identityToken) {
//       res.status(400).json({ error: 'Identity token is required' });
//       return;
//     }

//     // Verify Apple token
//     const appleUser = await verifyAppleToken(identityToken);

//     // Apple only provides name on first sign-in
//     const userName = fullName
//       ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
//       : 'User';

//     // Determine platform
//     const platform = req.body.platform || Platform.IOS;

//     // Create or update user
//     const dbUser = await createOrUpdateUser({
//       email: email || appleUser.email,
//       name: userName,
//       provider: Provider.APPLE,
//       providerId: appleUser.sub,
//       platform,
//     });

//     // Generate JWT
//     const token = generateAuthToken(dbUser._id.toString());

//     res.status(200).json({
//       success: true,
//       user: {
//         id: dbUser._id,
//         email: dbUser.email,
//         name: dbUser.name,
//         provider: dbUser.provider,
//         avatar: dbUser.avatar,
//         onboarded: dbUser.onboarded,
//       },
//       token,
//     });
//   } catch (error: any) {
//     console.error('Apple auth error:', error);
//     res.status(401).json({
//       success: false,
//       error: error.message || 'Authentication failed',
//     });
//   }
// };

// /**
//  * POST /auth/signup
//  * Sign up with email and password (if you want to support this)
//  */
// export const emailSignup = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       res.status(400).json({ error: 'Name, email, and password are required' });
//       return;
//     }

//     // Check if user already exists
//     const existingUser = await findUserByEmail(email);
//     if (existingUser) {
//       res.status(409).json({ error: 'User with this email already exists' });
//       return;
//     }

//     // For email auth, you'd need to add password hashing
//     // Since your schema doesn't have password field, I'll skip this
//     res.status(501).json({ error: 'Email signup not implemented yet' });
//   } catch (error: any) {
//     console.error('Email signup error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Signup failed',
//     });
//   }
// };

// /**
//  * POST /auth/login
//  * Login with email and password
//  */
// export const emailLogin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       res.status(400).json({ error: 'Email and password are required' });
//       return;
//     }

//     // Find user
//     const user = await findUserByEmail(email);
//     if (!user || !user.passwordHash) {
//       res.status(401).json({ error: 'Invalid credentials' });
//       return;
//     }

//     // Verify password
//     const isValidPassword = await bcrypt.compare(password, user.passwordHash);
//     if (!isValidPassword) {
//       res.status(401).json({ error: 'Invalid credentials' });
//       return;
//     }

//     // Update last login
//     user.lastLoginAt = new Date();
//     await user.save();

//     // Generate JWT
//     const token = generateAuthToken(user.id);

//     res.status(200).json({
//       success: true,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         provider: user.provider,
//       },
//       token,
//     });
//   } catch (error: any) {
//     console.error('Email login error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Login failed',
//     });
//   }
// };

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { verifyGoogleToken, verifyAppleToken, generateAuthToken, verifyGoogleAccessToken } from '../services/auth';
import { createOrUpdateUser } from '../services/user';
import { Provider, Platform } from '../types/enums';
import User from '../models/User';

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
      // Try ID token first (preferred)
      if (idToken) {
        console.log('🔐 Attempting Google ID token verification...');
        googleUser = await verifyGoogleToken(idToken);
      }
    } catch (idTokenError) {
      console.log('⚠️ ID token verification failed, trying access token...');
      
      // Fallback to access token
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

    // Create or update user
    const user = await createOrUpdateUser({
      email: googleUser.email,
      name: googleUser.name,
      provider: Provider.GOOGLE,
      providerId: googleUser.sub,
      picture: googleUser.picture,
      platform,
    });

    // Generate JWT
    const token = generateAuthToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        onboarded: user.onboarded,
      },
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
    const { identityToken, user: appleUserData, platform = 'ios' } = req.body;

    if (!identityToken) {
      res.status(400).json({ error: 'Identity token is required' });
      return;
    }

    const appleUser = await verifyAppleToken(identityToken);

    const userData = {
      email: appleUser.email,
      name: appleUserData?.fullName?.givenName 
        ? `${appleUserData.fullName.givenName} ${appleUserData.fullName.familyName || ''}`.trim()
        : appleUser.email.split('@')[0],
      provider: Provider.APPLE,
      providerId: appleUser.sub,
      platform,
    };

    const user = await createOrUpdateUser(userData);
    const token = generateAuthToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        onboarded: user.onboarded,
      },
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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
    });

    // Generate JWT
    const token = generateAuthToken(user._id.toString());

    console.log('✅ Email signup successful:', email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        onboarded: user.onboarded,
      },
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

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if user signed up with email
    if (user.provider !== Provider.EMAIL) {
      res.status(400).json({
        error: `This email is associated with ${user.provider} sign-in. Please use ${user.provider} to login.`,
      });
      return;
    }

    // Verify password
    if (!user.password) {
      res.status(500).json({ error: 'Password not set for this account' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT
    const token = generateAuthToken(user._id.toString());

    console.log('✅ Email login successful:', email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        avatar: user.avatar,
        onboarded: user.onboarded,
      },
    });
  } catch (error: any) {
    console.error('❌ Email login error:', error);
    res.status(500).json({
      error: error.message || 'Failed to login',
    });
  }
};