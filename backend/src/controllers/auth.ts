

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
import { verifyGoogleToken, verifyGoogleAccessToken, verifyAppleToken, generateAuthToken } from '../services/auth';
import { createOrUpdateUser } from '../services/user';
import { Provider, Platform } from '../types/enums';

/**
 * POST /auth/google
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📨 Received Google auth request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { idToken, accessToken, user } = req.body;

    if (!idToken && !accessToken) {
      console.error('❌ No tokens provided');
      res.status(400).json({ error: 'ID token or access token is required' });
      return;
    }

    let googleUser;

    // Try ID token first (more secure)
    if (idToken) {
      try {
        console.log('🔍 Verifying Google ID token...');
        googleUser = await verifyGoogleToken(idToken);
        console.log('✅ ID Token verified:', googleUser);
      } catch (error) {
        console.log('⚠️ ID token verification failed, trying access token...');
        if (accessToken) {
          googleUser = await verifyGoogleAccessToken(accessToken);
        } else {
          throw error;
        }
      }
    } else if (accessToken) {
      console.log('🔍 Verifying Google access token...');
      googleUser = await verifyGoogleAccessToken(accessToken);
      console.log('✅ Access Token verified:', googleUser);
    }

    if (!googleUser) {
      throw new Error('Failed to verify Google token');
    }

    // Determine platform
    const platform = req.body.platform || Platform.IOS;

    console.log('💾 Creating/updating user...');
    // Create or update user
    const dbUser = await createOrUpdateUser({
      email: googleUser.email,
      name: googleUser.name || user?.name || 'User',
      provider: Provider.GOOGLE,
      providerId: googleUser.sub,
      picture: googleUser.picture || user?.photo,
      platform,
    });
    console.log('✅ User created/updated:', dbUser._id);

    // Generate JWT
    const token = generateAuthToken(dbUser._id.toString());

    console.log('✅ Auth successful, sending response');
    res.status(200).json({
      success: true,
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        provider: dbUser.provider,
        avatar: dbUser.avatar,
        onboarded: dbUser.onboarded,
      },
      token,
    });
  } catch (error: any) {
    console.error('❌ Google auth error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
};

/**
 * POST /auth/apple
 */
export const appleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identityToken, user, email, fullName } = req.body;

    if (!identityToken) {
      res.status(400).json({ error: 'Identity token is required' });
      return;
    }

    // Verify Apple token
    const appleUser = await verifyAppleToken(identityToken);

    // Apple only provides name on first sign-in
    const userName = fullName
      ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
      : 'User';

    // Determine platform
    const platform = req.body.platform || Platform.IOS;

    // Create or update user
    const dbUser = await createOrUpdateUser({
      email: email || appleUser.email,
      name: userName,
      provider: Provider.APPLE,
      providerId: appleUser.sub,
      platform,
    });

    // Generate JWT
    const token = generateAuthToken(dbUser._id.toString());

    res.status(200).json({
      success: true,
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        provider: dbUser.provider,
        avatar: dbUser.avatar,
        onboarded: dbUser.onboarded,
      },
      token,
    });
  } catch (error: any) {
    console.error('Apple auth error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
};