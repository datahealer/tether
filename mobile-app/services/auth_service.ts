



// // services/auth_service.ts
// // services/auth_service.ts
// import * as AppleAuthentication from 'expo-apple-authentication';
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';
// import Constants from 'expo-constants';
// import { Platform } from 'react-native';

// // IMPORTANT: This completes the auth session
// WebBrowser.maybeCompleteAuthSession();

// const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// export interface AuthUser {
//   id: string;
//   email: string;
//   name: string;
//   provider: 'apple' | 'google';
//   providerId?: string;
//   profilePicture?: string;
//   token: string;
// }

// // ============================================
// // APPLE SIGN IN (Keep as is)
// // ============================================
// export const signInWithApple = async (): Promise<AuthUser> => {
//   try {
//     const credential = await AppleAuthentication.signInAsync({
//       requestedScopes: [
//         AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//         AppleAuthentication.AppleAuthenticationScope.EMAIL,
//       ],
//     });

//     const response = await fetch(`${API_URL}/api/auth/apple`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         identityToken: credential.identityToken,
//         user: credential.user,
//         email: credential.email,
//         fullName: credential.fullName,
//         platform: Platform.OS,
//       }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || 'Failed to authenticate with server');
//     }

//     const data = await response.json();
//     return {
//       id: data.user.id,
//       email: data.user.email,
//       name: data.user.name,
//       provider: data.user.provider,
//       profilePicture: data.user.avatar,
//       token: data.token,
//     };
//   } catch (error: any) {
//     if (error.code === 'ERR_REQUEST_CANCELED') {
//       throw new Error('Sign in was canceled');
//     }
//     throw error;
//   }
// };

// // ============================================
// // GOOGLE SIGN IN (Simplified from Expo docs)
// // ============================================

// /**
//  * Hook for Google Authentication
//  * Uses Expo's auth proxy automatically in development
//  */
// export const useGoogleAuth = () => {
//   // Configure based on environment
//   const config = {
//     // For Expo Go (development)
//     clientId: Constants.expoConfig?.extra?.googleWebClientId,
    
//     // For standalone apps (production)
//     iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
//     androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
//     // request profile and email scopes
//     scopes: ['profile', 'email'],
//   };

//   const [request, response, promptAsync] = Google.useAuthRequest(
//     config
//   );

//   return { request, response, promptAsync };
// };

// /**
//  * Process Google Sign In Response
//  */
// export const processGoogleSignIn = async (
//   response: any
// ): Promise<AuthUser> => {
//   try {
//     if (response?.type !== 'success') {
//       throw new Error('Sign in was canceled');
//     }

//     const { authentication } = response;
    
//     if (!authentication?.accessToken) {
//       throw new Error('No access token received');
//     }

//     console.log('✅ Got access token');

//     // Fetch user info from Google
//     const userInfoResponse = await fetch(
//       'https://www.googleapis.com/oauth2/v3/userinfo',
//       {
//         headers: { Authorization: `Bearer ${authentication.accessToken}` },
//       }
//     );

//     if (!userInfoResponse.ok) {
//       throw new Error('Failed to get user info from Google');
//     }

//     const userInfo = await userInfoResponse.json();
//     console.log('👤 User Info:', { email: userInfo.email, name: userInfo.name });

//     // Send to your backend
//     const apiResponse = await fetch(`${API_URL}/api/auth/google`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         accessToken: authentication.accessToken,
//         user: {
//           email: userInfo.email,
//           name: userInfo.name,
//           photo: userInfo.picture,
//           id: userInfo.sub,
//         },
//         platform: Platform.OS,
//       }),
//     });

//     if (!apiResponse.ok) {
//       const error = await apiResponse.json();
//       throw new Error(error.error || 'Failed to authenticate with server');
//     }

//     const data = await apiResponse.json();
//     return {
//       id: data.user.id,
//       email: data.user.email,
//       name: data.user.name,
//       provider: data.user.provider,
//       profilePicture: data.user.avatar,
//       token: data.token,
//     };
//   } catch (error: any) {
//     console.error('❌ Google sign in error:', error);
//     throw error;
//   }
// };

// export const isAppleAuthAvailable = async (): Promise<boolean> => {
//   if (Platform.OS !== 'ios') return false;
//   return await AppleAuthentication.isAvailableAsync();
// };

import * as AppleAuthentication from 'expo-apple-authentication';
// import * as Google from 'expo-auth-session/providers/google';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// WebBrowser.maybeCompleteAuthSession();

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
console.log("API",API_URL);


export interface AuthUser {
  coupleId: any;
  subscribed?: boolean;
  onboarded?: boolean;
  id: string;
  email: string;
  name: string;
  provider: 'apple' | 'google' | 'email';
  providerId?: string;
  avatar?: string;
  token: string; // Access token
  refreshToken?: string;
  onboardingData?: {
    firstName?: string;
    partnerFirstName?: string;
    dateOfBirth?: string;
    gender?: string;
    relationshipStatus?: 'single' | 'dating' | 'engaged' | 'married' | 'its-complicated';
    relationshipDuration?: string;
    livingType?: string[];
    hasChildren?: boolean;
    goals?: string[];
    emotionalNeeds?: string[];
    rhythm?: string;
    tone?: string;
    packPreferences?: string[];
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Store tokens securely
 */

export const refreshAccessToken = async (retryCount = 0): Promise<string | null> => {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000; // 1 second
  
  try {
    const tokens = await getStoredTokens();
    
    if (!tokens || !tokens.refreshToken) {
      console.log('⚠️ No refresh token available');
      return null;
    }

    console.log('🔄 Refreshing access token...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token refresh failed:', response.status, errorText);
        
        // Don't clear tokens on server errors that might be temporary
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          console.log(`🔄 Retrying token refresh (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return refreshAccessToken(retryCount + 1);
        }
        
        // Only clear tokens on 401 (invalid token)
        if (response.status === 401) {
          await clearTokens();
        }
        return null;
      }

      const data = await response.json();
      
      if (!data.accessToken || !data.refreshToken) {
        console.error('❌ Invalid response from refresh endpoint');
        await clearTokens();
        return null;
      }
      
      await storeTokens(data.accessToken, data.refreshToken);
      
      // Update stored user data with refreshed user object (including coupleId)
      if (data.user) {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedUser = {
            ...parsedUser,
            ...data.user,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('✅ User data updated with coupleId:', data.user.coupleId);
        }
      }
      
      console.log('✅ Access token refreshed successfully');
      
      return data.accessToken;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Network errors - retry if we haven't exceeded max retries
      if (fetchError.name === 'AbortError') {
        console.error('❌ Token refresh timeout');
      } else if (fetchError.message?.includes('Network request failed')) {
        console.error('❌ Network error during token refresh');
      }
      
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying token refresh due to network error (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return refreshAccessToken(retryCount + 1);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    // Don't clear tokens on network errors - user might just have temporary connectivity issue
    return null;
  }
};

export const storeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    console.log('🔐 Storing access token:', accessToken);
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw error;
  }
};

/**
 * Get stored tokens
 */
export const getStoredTokens = async (): Promise<TokenPair | null> => {
  try {
    const [[, accessToken], [, refreshToken]] = await AsyncStorage.multiGet([
      'accessToken',
      'refreshToken',
    ]);

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }

    return null;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return null;
  }
};

/**
 * Clear all tokens
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

/**
 * Check if access token is expired
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Token is considered expired if less than 1 minute remaining
    return expiryTime - currentTime < 60000;
  } catch (error) {
    return true;
  }
};

/**
 * Refresh access token
 */

/**
 * Get valid access token (auto-refresh if needed)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    const tokens = await getStoredTokens();
    
    if (!tokens || !tokens.accessToken) {
      return null;
    }

    // Check if token is expired or about to expire
    if (isTokenExpired(tokens.accessToken)) {
      console.log('🔄 Token expired, refreshing...');
      return await refreshAccessToken();
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting valid token:', error);
    return null;
  }
};

/**
 * Make authenticated API request with auto-refresh
 */
/**
 * Refresh access token
 */


/**
 * Make authenticated API request with auto-refresh
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const token = await getValidAccessToken();
    
    if (!token) {
      throw new Error('No valid token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // If 401, try to refresh token once
    if (response.status === 401) {
      console.log('⚠️ 401 error, attempting token refresh...');
      
      const newToken = await refreshAccessToken();
      
      if (!newToken) {
        throw new Error('Failed to refresh token');
      }

      // Retry request with new token
      return await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Authenticated fetch error:', error);
    throw error;
  }
};

// ============================================
// APPLE SIGN IN
// ============================================
export const signInWithApple = async (): Promise<AuthUser> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('🍎 Apple credential received:', {
      user: credential.user,
      email: credential.email,
      hasFullName: !!credential.fullName,
      hasIdentityToken: !!credential.identityToken,
    });

    const response = await fetch(`${API_URL}/api/auth/apple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        user: credential.user,
        email: credential.email, // Explicitly pass email
        fullName: credential.fullName, // Pass fullName object directly
        platform: Platform.OS,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Apple auth API error:', response.status, errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to authenticate with server');
      } catch (e) {
        throw new Error('Failed to authenticate with server');
      }
    }

    const data = await response.json();
    
    console.log('✅ Apple auth successful:', data.user.email);
    
    // Store tokens
    await storeTokens(data.accessToken, data.refreshToken);

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      provider: data.user.provider,
      avatar: data.user.avatar,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      onboarded: data.user.onboarded,
      subscribed: data.user.subscribed,
      coupleId: data.user.coupleId,
      onboardingData: data.user.onboardingData,
    };
  } catch (error: any) {
    console.error('❌ Apple sign-in error:', error);
    
    if (error.code === 'ERR_REQUEST_CANCELED' || error.code === 'ERR_CANCELED') {
      throw new Error('Sign in was canceled');
    }
    
    throw error;
  }
};

// ============================================
// GOOGLE SIGN IN
// ============================================
// export const useGoogleAuth = () => {
//   const config = {
//     clientId: Constants.expoConfig?.extra?.googleWebClientId,
//     iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
//     androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
//     scopes: ['profile', 'email'],
//   };

//   const [request, response, promptAsync] = Google.useAuthRequest(config);

//   return { request, response, promptAsync };
// };
// ============================================
// GOOGLE SIGN IN (Native)
// ============================================
// Note: GoogleSignin.configure() is called once at app startup in _layout.tsx

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    await GoogleSignin.hasPlayServices();

    const signInResult = await GoogleSignin.signIn();
    
    // Check if sign-in was successful
    if (signInResult.type !== 'success') {
      throw new Error('Sign in was cancelled');
    }

    const userInfo = signInResult.data;
    
    console.log('✅ Google native sign-in success', { email: userInfo.user.email, name: userInfo.user.name });

    // Get tokens
    const tokens = await GoogleSignin.getTokens();
    
    if (!tokens.idToken) {
      throw new Error('No ID token received from Google');
    }

    // Send ID token to your backend (more secure than access token)
    const apiResponse = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: tokens.idToken,
        platform: Platform.OS,
      }),
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      throw new Error(error.error || 'Failed to authenticate with server');
    }

    const data = await apiResponse.json();

    // Store tokens
    await storeTokens(data.accessToken, data.refreshToken);
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      provider: data.user.provider,
      avatar: data.user.avatar,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      onboarded: data.user.onboarded,
      subscribed: data.user.subscribed,
      coupleId: data.user.coupleId,
      onboardingData: data.user.onboardingData,
    };
  } catch (error: any) {
    console.error('❌ Native Google sign-in error:', error);
    console.error('❌ Native Google sign-in error:', error);
    throw new Error(error.message || 'Google sign-in failed');
  }
};

export const processGoogleSignIn = async (response: any): Promise<AuthUser> => {
  try {
    if (response?.type !== 'success') {
      throw new Error('Sign in was canceled');
    }

    const { authentication } = response;
    
    if (!authentication?.accessToken) {
      throw new Error('No access token received');
    }

    console.log('✅ Got access token');

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userInfo = await userInfoResponse.json();
    console.log('👤 User Info:', { email: userInfo.email, name: userInfo.name });

    const apiResponse = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: authentication.accessToken,
        user: {
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture,
          id: userInfo.sub,
        },
        platform: Platform.OS,
      }),
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      throw new Error(error.error || 'Failed to authenticate with server');
    }

    const data = await apiResponse.json();
    
    // Store tokens
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      provider: data.user.provider,
      avatar: data.user.avatar,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      onboarded: data.user.onboarded,
      subscribed: data.user.subscribed,
      coupleId: data.user.coupleId,
      onboardingData: data.user.onboardingData,
    };
  } catch (error: any) {
    console.error('❌ Google sign in error:', error);
    throw error;
  }
};

export const isAppleAuthAvailable = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;
  return await AppleAuthentication.isAvailableAsync();
};

/**
 * Logout from current device
 */
/**
 * Logout from current device (instant - clears tokens first)
 */
export const logout = async (): Promise<void> => {
  try {
    // Get tokens before clearing
    const tokens = await getStoredTokens();
    
    // ✅ Clear tokens FIRST for instant logout
    await clearTokens();
    console.log('✅ Tokens cleared locally');
    
    // ✅ Then call API in background (don't await - fire and forget)
    if (tokens && tokens.accessToken && tokens.refreshToken) {
      // Fire and forget - don't block UI
      fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      }).catch(error => {
        console.log('⚠️ Background logout API call failed (ignored):', error.message);
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Still try to clear tokens even if there's an error
    await clearTokens();
  }
};

/**
 * Logout from all devices (still waits for API)
 */
export const logoutAllDevices = async (): Promise<void> => {
  try {
    const tokens = await getStoredTokens();
    
    // Clear tokens first
    await clearTokens();
    console.log('✅ Tokens cleared locally');
    
    // Try to invalidate on server
    if (tokens && tokens.accessToken) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
          // Don't send refreshToken to logout from ALL devices
        });
        console.log('✅ Logged out from all devices on server');
      } catch (error) {
        console.log('⚠️ Server logout failed (tokens already cleared):', error);
      }
    }
  } catch (error) {
    console.error('Error during logout all devices:', error);
    await clearTokens();
  }
};


