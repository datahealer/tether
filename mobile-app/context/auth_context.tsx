
// import React, { createContext, useState, useEffect, useContext } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AuthUser } from '../services/auth_service';
// import { Platform } from 'react-native';

// interface AuthContextType {
//   user: AuthUser | null;
//   loading: boolean;
//   signIn: (user: AuthUser) => Promise<void>;
//   signOut: () => Promise<void>;
//   signUp: (email: string, password: string) => Promise<void>;
//   login:(email: string, password: string) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadUser();
//   }, []);

//   const loadUser = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       const token = await AsyncStorage.getItem('authToken');
      
//       if (userData && token) {
//         setUser(JSON.parse(userData));
//       }
//     } catch (error) {
//       console.error('Error loading user:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signIn = async (userData: AuthUser) => {
//     try {
//       await AsyncStorage.setItem('user', JSON.stringify(userData));
//       await AsyncStorage.setItem('authToken', userData.token);
//       setUser(userData);
//     } catch (error) {
//       console.error('Error saving user:', error);
//       throw error;
//     }
//   };

//  const signUp = async (email: string, password: string) => {
//   try {
//     const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
//     const response = await fetch(`${API_URL}/api/auth/signup`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ 
//         email, 
//         password, 
//         platform: Platform.OS 
//       }),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || 'Signup failed');
//     }

//     const data = await response.json();
    
//     const userData: AuthUser = {
//       id: data.user.id,
//       email: data.user.email,
//       name: data.user.name,
//       provider: data.user.provider, // Use provider from backend
//       token: data.token,
//     };
    
//     await signIn(userData);
//   } catch (error) {
//     console.error('Signup error:', error);
//     throw error;
//   }
// };
//   const signOut = async () => {
//     try {
//       await AsyncStorage.removeItem('user');
//       await AsyncStorage.removeItem('authToken');
//       setUser(null);
//     } catch (error) {
//       console.error('Error signing out:', error);
//       throw error;
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
//       const response = await fetch(`${API_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Login failed');
//       }

//       const data = await response.json();
      
//       const userData: AuthUser = {
//         id: data.user.id,
//         email: data.user.email,
//         name: data.user.name,
//         provider: data.user.provider || 'email',
//         token: data.token,
//       };
      
//       await signIn(userData);
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };
//   return (
//     <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp ,login}}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthUser, 
  getStoredTokens, 
  storeTokens, 
  clearTokens,
  getValidAccessToken,
  logout as logoutService 
} from '../services/auth_service';
import { Platform } from 'react-native';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user only once on mount
  useEffect(() => {
    loadUser();
  }, []); // Empty dependency array - runs only once

  // ✅ Setup auto-refresh interval separately
  useEffect(() => {
    if (!user) return; // Don't setup interval if no user

    const interval = setInterval(async () => {
      await refreshSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id]); // Only re-run if user ID changes

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const tokens = await getStoredTokens();
      
      if (userData && tokens) {
        const parsedUser = JSON.parse(userData);
        const loadedUser = {
          ...parsedUser,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
        
        console.log('✅ Loaded user:', {
          email: loadedUser.email,
          onboarded: loadedUser.onboarded,
          subscribed: loadedUser.subscribed,
        });
        
        setUser(loadedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await getValidAccessToken();
      
      if (!newToken) {
        console.log('⚠️ Failed to refresh session, logging out...');
        await signOut();
        return false;
      }

      // Update user with new token without triggering re-render loop
      setUser(prevUser => {
        if (!prevUser) return null;
        
        const updatedUser = { ...prevUser, token: newToken };
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });

      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }, []); // No dependencies - stable function

  const signIn = useCallback(async (userData: AuthUser) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      if (userData.token && userData.refreshToken) {
        await storeTokens(userData.token, userData.refreshToken);
        await AsyncStorage.setItem('authToken', userData.token);
      }
      
      console.log('✅ Signed in user:', {
        email: userData.email,
        onboarded: userData.onboarded,
        subscribed: userData.subscribed,
      });
      
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          platform: Platform.OS 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      const userData: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        provider: data.user.provider,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        onboarded: data.user.onboarded,
        subscribed: data.user.subscribed,
      };
      
      await signIn(userData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, [signIn]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      const userData: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        provider: data.user.provider || 'email',
        token: data.accessToken,
        refreshToken: data.refreshToken,
        onboarded: data.user.onboarded,
        subscribed: data.user.subscribed,
      };
      
      await signIn(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [signIn]);

  const signOut = useCallback(async () => {
    try {
      console.log('🚪 Signing out...');
      setUser(null);
      await logoutService();
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error signing out:', error);
      setUser(null);
      await clearTokens();
      await AsyncStorage.multiRemove(['user', 'authToken']);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      signUp, 
      login,
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};