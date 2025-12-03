// import * as AppleAuthentication from 'expo-apple-authentication';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import Constants from 'expo-constants';
// import { Platform } from 'react-native';

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

// // Configure Google Sign-In
// GoogleSignin.configure({
//   webClientId: Constants.expoConfig?.extra?.googleWebClientId,
//   iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
//   offlineAccess: true,
//   scopes: ['profile', 'email'],
// });

// // Apple Sign In
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
//       headers: {
//         'Content-Type': 'application/json',
//       },
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

// // Google Sign In
// export const signInWithGoogle = async (): Promise<AuthUser> => {
//   try {
//     await GoogleSignin.hasPlayServices();
//     const userInfo = await GoogleSignin.signIn();
//     const tokens = await GoogleSignin.getTokens();

//     const response = await fetch(`${API_URL}/api/auth/google`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         idToken: tokens.idToken,
//         user: (userInfo as any).user ?? userInfo,
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
//     if (error.code === 'SIGN_IN_CANCELLED') {
//       throw new Error('Sign in was canceled');
//     }
//     throw error;
//   }
// };

// // Check if Apple Sign In is available
// export const isAppleAuthAvailable = async (): Promise<boolean> => {
//   if (Platform.OS !== 'ios') return false;
//   return await AppleAuthentication.isAvailableAsync();
// };




// services/auth_service.ts
// services/auth_service.ts
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// IMPORTANT: This completes the auth session
WebBrowser.maybeCompleteAuthSession();

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'apple' | 'google';
  providerId?: string;
  profilePicture?: string;
  token: string;
}

// ============================================
// APPLE SIGN IN (Keep as is)
// ============================================
export const signInWithApple = async (): Promise<AuthUser> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const response = await fetch(`${API_URL}/api/auth/apple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        platform: Platform.OS,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to authenticate with server');
    }

    const data = await response.json();
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      provider: data.user.provider,
      profilePicture: data.user.avatar,
      token: data.token,
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Sign in was canceled');
    }
    throw error;
  }
};

// ============================================
// GOOGLE SIGN IN (Simplified from Expo docs)
// ============================================

/**
 * Hook for Google Authentication
 * Uses Expo's auth proxy automatically in development
 */
export const useGoogleAuth = () => {
  // Configure based on environment
  const config = {
    // For Expo Go (development)
    clientId: Constants.expoConfig?.extra?.googleWebClientId,
    
    // For standalone apps (production)
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    // request profile and email scopes
    scopes: ['profile', 'email'],
  };

  const [request, response, promptAsync] = Google.useAuthRequest(
    config
  );

  return { request, response, promptAsync };
};

/**
 * Process Google Sign In Response
 */
export const processGoogleSignIn = async (
  response: any
): Promise<AuthUser> => {
  try {
    if (response?.type !== 'success') {
      throw new Error('Sign in was canceled');
    }

    const { authentication } = response;
    
    if (!authentication?.accessToken) {
      throw new Error('No access token received');
    }

    console.log('✅ Got access token');

    // Fetch user info from Google
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

    // Send to your backend
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
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      provider: data.user.provider,
      profilePicture: data.user.avatar,
      token: data.token,
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
