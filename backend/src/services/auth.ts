





// import { OAuth2Client } from 'google-auth-library';
// import jwt, { Secret, SignOptions } from 'jsonwebtoken';
// import axios from 'axios';

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export interface GoogleTokenPayload {
//   sub: string;
//   email: string;
//   name: string;
//   picture?: string;
//   email_verified: boolean;
// }

// export interface AppleTokenPayload {
//   sub: string;
//   email: string;
//   email_verified: boolean;
// }

// /**
//  * Verify Google ID Token (preferred method)
//  */
// export const verifyGoogleToken = async (idToken: string): Promise<GoogleTokenPayload> => {
//   try {
//     console.log('🔐 Verifying Google ID token...');
    
//     const ticket = await googleClient.verifyIdToken({
//       idToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
    
//     if (!payload) {
//       throw new Error('Invalid token payload');
//     }

//     console.log('✅ Google ID token verified:', payload.email);

//     return {
//       sub: payload.sub,
//       email: payload.email || '',
//       name: payload.name || '',
//       picture: payload.picture,
//       email_verified: payload.email_verified || false,
//     };
//   } catch (error) {
//     console.error('❌ Google ID token verification failed:', error);
//     throw new Error('Invalid Google token');
//   }
// };

// /**
//  * Verify Google Access Token (fallback method)
//  */
// export const verifyGoogleAccessToken = async (accessToken: string): Promise<GoogleTokenPayload> => {
//   try {
//     console.log('🔐 Verifying Google access token...');
    
//     const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     const userInfo = response.data;
//     console.log('✅ Google access token verified:', userInfo.email);

//     return {
//       sub: userInfo.id,
//       email: userInfo.email,
//       name: userInfo.name,
//       picture: userInfo.picture,
//       email_verified: userInfo.verified_email || false,
//     };
//   } catch (error) {
//     console.error('❌ Google access token verification failed:', error);
//     throw new Error('Invalid Google token');
//   }
// };

// /**
//  * Verify Apple ID Token
//  */
// export const verifyAppleToken = async (identityToken: string): Promise<AppleTokenPayload> => {
//   try {
//     const decoded = jwt.decode(identityToken) as {
//       sub?: string;
//       email?: string;
//       email_verified?: string | boolean;
//     } | null;
    
//     if (!decoded || !decoded.sub || !decoded.email) {
//       throw new Error('Invalid Apple token payload');
//     }

//     return {
//       sub: decoded.sub,
//       email: decoded.email,
//       email_verified: decoded.email_verified === 'true' || decoded.email_verified === true,
//     };
//   } catch (error) {
//     console.error('Apple token verification failed:', error);
//     throw new Error('Invalid Apple token');
//   }
// };

// /**
//  * Generate JWT for authenticated user
//  */
// // ...existing code...

// /**
//  * Generate JWT for authenticated user
//  */
// export const generateAuthToken = (userId: string, type: 'user' | 'admin' = 'user'): string => {
//   const secret: Secret = process.env.JWT_SECRET || 'fallback_secret_key';
//   const expiresInEnv = process.env.JWT_EXPIRES_IN;
//   const expiresIn: SignOptions['expiresIn'] = expiresInEnv
//     ? (expiresInEnv as unknown as SignOptions['expiresIn'])
//     : '7d';
  
//   const options: SignOptions = {
//     expiresIn: expiresIn
//   };
  
//   // Include type in payload for consistency
//   return jwt.sign({ userId, type }, secret, options);
// };

// // ...existing code...
// /**
//  * Verify JWT token
//  */
// export const verifyAuthToken = (token: string): { userId: string } => {
//   try {
//     const secret: Secret = process.env.JWT_SECRET || 'fallback_secret_key';
//     const decoded = jwt.verify(token, secret) as { userId: string };
//     return decoded;
//   } catch (error) {
//     throw new Error('Invalid or expired token');
//   }
// };
import { OAuth2Client } from 'google-auth-library';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Use consistent JWT secrets
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key';

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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

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
 * Generate Access Token (short-lived: 15 minutes)
 */
export const generateAccessToken = (userId: string, type: 'user' | 'admin' = 'user'): string => {
  const options: SignOptions = {
    expiresIn: '15m',
  };
  
  return jwt.sign({ userId, type, tokenType: 'access' }, JWT_SECRET, options);
};

/**
 * Generate Refresh Token (long-lived: 30 days)
 */
export const generateRefreshToken = (userId: string, type: 'user' | 'admin' = 'user'): string => {
  const options: SignOptions = {
    expiresIn: '30d',
  };
  
  return jwt.sign({ userId, type, tokenType: 'refresh' }, JWT_REFRESH_SECRET, options);
};

/**
 * Generate Token Pair (Access + Refresh)
 */
export const generateTokenPair = (userId: string, type: 'user' | 'admin' = 'user'): TokenPair => {
  return {
    accessToken: generateAccessToken(userId, type),
    refreshToken: generateRefreshToken(userId, type),
  };
};

/**
 * Legacy method for backward compatibility
 */
export const generateAuthToken = (userId: string, type: 'user' | 'admin' = 'user'): string => {
  return generateAccessToken(userId, type);
};

/**
 * Verify Access Token
 */
export const verifyAuthToken = (token: string): { userId: string; type: string; tokenType: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      type: string; 
      tokenType: string;
    };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): { userId: string; type: string; tokenType: string } => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { 
      userId: string; 
      type: string; 
      tokenType: string;
    };
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Decode token without verification (for checking expiry)
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};