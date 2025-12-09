// import { OAuth2Client } from 'google-auth-library';
// import jwt, { Secret } from 'jsonwebtoken';

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export interface GoogleTokenPayload {
//   sub: string; // Google user ID
//   email: string;
//   name: string;
//   picture?: string;
//   email_verified: boolean;
// }

// export interface AppleTokenPayload {
//   sub: string; // Apple user ID
//   email: string;
//   email_verified: boolean;
// }

// /**
//  * Verify Google ID Token
//  */
// export const verifyGoogleToken = async (idToken: string): Promise<GoogleTokenPayload> => {
//   try {
//     const ticket = await googleClient.verifyIdToken({
//       idToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
    
//     if (!payload) {
//       throw new Error('Invalid token payload');
//     }

//     return {
//       sub: payload.sub,
//       email: payload.email || '',
//       name: payload.name || '',
//       picture: payload.picture,
//       email_verified: payload.email_verified || false,
//     };
//   } catch (error) {
//     console.error('Google token verification failed:', error);
//     throw new Error('Invalid Google token');
//   }
// };

// /**
//  * Verify Apple ID Token (basic JWT verification)
//  * For production, you should verify with Apple's public keys
//  */
// export const verifyAppleToken = async (identityToken: string): Promise<AppleTokenPayload> => {
//   try {
//     // Decode without verification for now (Apple tokens are already verified by the client)
//     const decoded: any = jwt.decode(identityToken);
    
//     if (!decoded || !decoded.sub || !decoded.email) {
//       throw new Error('Invalid Apple token payload');
//     }

//     return {
//       sub: decoded.sub,
//       email: decoded.email,
//       email_verified: decoded.email_verified === 'true',
//     };
//   } catch (error) {
//     console.error('Apple token verification failed:', error);
//     throw new Error('Invalid Apple token');
//   }
// };

// /**
//  * Generate JWT for authenticated user
//  */
// export const generateAuthToken = (userId: string): string => {
//   const secret: Secret = process.env.JWT_SECRET || 'fallback_secret_key';
//   const options: jwt.SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as unknown as any };
//   return jwt.sign({ userId }, secret, options);
// };

// /**
//  * Verify JWT token
//  */
// export const verifyAuthToken = (token: string): { userId: string } => {
//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || 'fallback_secret_key'
//     ) as { userId: string };
//     return decoded;
//   } catch (error) {
//     throw new Error('Invalid or expired token');
//   }
// };






import { OAuth2Client } from 'google-auth-library';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export interface AppleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
}

/**
 * Verify Google ID Token (preferred method)
 */
export const verifyGoogleToken = async (idToken: string): Promise<GoogleTokenPayload> => {
  try {
    console.log('🔐 Verifying Google ID token...');
    
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    console.log('✅ Google ID token verified:', payload.email);

    return {
      sub: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
      email_verified: payload.email_verified || false,
    };
  } catch (error) {
    console.error('❌ Google ID token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Verify Google Access Token (fallback method)
 */
export const verifyGoogleAccessToken = async (accessToken: string): Promise<GoogleTokenPayload> => {
  try {
    console.log('🔐 Verifying Google access token...');
    
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = response.data;
    console.log('✅ Google access token verified:', userInfo.email);

    return {
      sub: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      email_verified: userInfo.verified_email || false,
    };
  } catch (error) {
    console.error('❌ Google access token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

/**
 * Verify Apple ID Token
 */
export const verifyAppleToken = async (identityToken: string): Promise<AppleTokenPayload> => {
  try {
    const decoded = jwt.decode(identityToken) as {
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
    } | null;
    
    if (!decoded || !decoded.sub || !decoded.email) {
      throw new Error('Invalid Apple token payload');
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      email_verified: decoded.email_verified === 'true' || decoded.email_verified === true,
    };
  } catch (error) {
    console.error('Apple token verification failed:', error);
    throw new Error('Invalid Apple token');
  }
};

/**
 * Generate JWT for authenticated user
 */
// ...existing code...

/**
 * Generate JWT for authenticated user
 */
export const generateAuthToken = (userId: string, type: 'user' | 'admin' = 'user'): string => {
  const secret: Secret = process.env.JWT_SECRET || 'fallback_secret_key';
  const expiresInEnv = process.env.JWT_EXPIRES_IN;
  const expiresIn: SignOptions['expiresIn'] = expiresInEnv
    ? (expiresInEnv as unknown as SignOptions['expiresIn'])
    : '7d';
  
  const options: SignOptions = {
    expiresIn: expiresIn
  };
  
  // Include type in payload for consistency
  return jwt.sign({ userId, type }, secret, options);
};

// ...existing code...
/**
 * Verify JWT token
 */
export const verifyAuthToken = (token: string): { userId: string } => {
  try {
    const secret: Secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};