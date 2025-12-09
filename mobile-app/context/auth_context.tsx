// import React, { createContext, useState, useEffect, useContext } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AuthUser } from '../services/auth_service';

// interface AuthContextType {
//   user: AuthUser | null;
//   loading: boolean;
//   signIn: (user: AuthUser) => Promise<void>;
//   signOut: () => Promise<void>;
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

//   return (
//     <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../services/auth_service';
import { Platform } from 'react-native';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  login:(email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (userData: AuthUser) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('authToken', userData.token);
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

 const signUp = async (email: string, password: string) => {
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
      provider: data.user.provider, // Use provider from backend
      token: data.token,
    };
    
    await signIn(userData);
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
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
        provider: 'google',
        token: data.token,
      };
      
      await signIn(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp ,login}}>
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