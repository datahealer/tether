// import React, { createContext, useState, useContext, useCallback } from 'react';
// import { updateOnboardingData, completeOnboarding, OnboardingData } from '../services/onboarding_service';

// interface OnboardingContextType {
//   onboardingData: OnboardingData;
//   updateField: (field: keyof OnboardingData, value: any) => void;
//   submitOnboarding: () => Promise<void>;
//   clearOnboarding: () => void;
//   isLoading: boolean;
//   error: string | null;
// }

// const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
//   const [onboardingData, setOnboardingData] = useState<OnboardingData>({
//     relationshipStatus: undefined,
//     relationshipDuration: undefined,
//     livingType: [],
//     goals: [],
//     emotionalNeeds: [],
//     rhythm: undefined,
//     tone: undefined,
//     packPreferences: [],
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const updateField = useCallback((field: keyof OnboardingData, value: any) => {
//     setOnboardingData(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   }, []);

//   const submitOnboarding = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       // Send all data to backend
//       await updateOnboardingData(onboardingData);
//       await completeOnboarding();
      
//       console.log('✅ Onboarding submitted successfully');
//     } catch (err: any) {
//       console.error('❌ Onboarding submission error:', err);
//       setError(err.message || 'Failed to submit onboarding');
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [onboardingData]);

//   const clearOnboarding = useCallback(() => {
//     setOnboardingData({
//       relationshipStatus: undefined,
//       relationshipDuration: undefined,
//       livingType: [],
//       goals: [],
//       emotionalNeeds: [],
//       rhythm: undefined,
//       tone: undefined,
//       packPreferences: [],
//     });
//     setError(null);
//   }, []);

//   return (
//     <OnboardingContext.Provider
//       value={{
//         onboardingData,
//         updateField,
//         submitOnboarding,
//         clearOnboarding,
//         isLoading,
//         error,
//       }}
//     >
//       {children}
//     </OnboardingContext.Provider>
//   );
// };

// export const useOnboarding = () => {
//   const context = useContext(OnboardingContext);
//   if (!context) {
//     throw new Error('useOnboarding must be used within OnboardingProvider');
//   }
//   return context;
// };


import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateOnboardingData, completeOnboarding, OnboardingData } from '../services/onboarding_service';

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateField: (field: keyof OnboardingData, value: any) => void;
  submitOnboarding: () => Promise<any>;
  clearOnboarding: () => void;
  loadUserOnboardingData: (userId: string, userOnboardingData?: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasAuthToken: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY_PREFIX = '@tether_onboarding_data_';

// Helper to get user-specific storage key
const getUserStorageKey = async (): Promise<string> => {
  const userStr = await AsyncStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return `${ONBOARDING_STORAGE_KEY_PREFIX}${user.id}`;
  }
  // Fallback for users not logged in yet (during onboarding)
  return `${ONBOARDING_STORAGE_KEY_PREFIX}temp`;
};

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
  firstName: undefined,
  partnerFirstName: undefined,
  dateOfBirth: undefined,
  gender: undefined,
  relationshipStatus: undefined,
  relationshipDuration: undefined,
  livingType: [],
  hasChildren: undefined, // Add this
  goals: [],
  emotionalNeeds: [],
  rhythm: undefined,
  tone: undefined,
  packPreferences: [],
});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAuthToken, setHasAuthToken] = useState(false);

  // Load onboarding data from AsyncStorage on mount
  useEffect(() => {
    loadOnboardingData();
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setHasAuthToken(!!token);
    } catch (error) {
      console.error('Error checking auth token:', error);
      setHasAuthToken(false);
    }
  };

  const loadOnboardingData = async () => {
    try {
      const storageKey = await getUserStorageKey();
      const storedData = await AsyncStorage.getItem(storageKey);
      if (storedData) {
        setOnboardingData(JSON.parse(storedData));
        console.log('✅ Loaded onboarding data from user-specific storage');
      }
    } catch (error) {
      console.error('❌ Error loading onboarding data:', error);
    }
  };

  // Load user-specific onboarding data (called after login)
  const loadUserOnboardingData = useCallback(async (userId: string, userOnboardingData?: any) => {
    try {
      console.log('📥 Loading user-specific onboarding data for user:', userId);
      
      // If user has onboarding data in their profile, use that
      if (userOnboardingData) {
        setOnboardingData(userOnboardingData);
        console.log('✅ Loaded onboarding data from user profile:', userOnboardingData);
        
        // Also save to user-specific storage
        const storageKey = `${ONBOARDING_STORAGE_KEY_PREFIX}${userId}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(userOnboardingData));
      } else {
        // Try to load from user-specific storage
        const storageKey = `${ONBOARDING_STORAGE_KEY_PREFIX}${userId}`;
        const storedData = await AsyncStorage.getItem(storageKey);
        if (storedData) {
          setOnboardingData(JSON.parse(storedData));
          console.log('✅ Loaded onboarding data from user storage');
        } else {
          // Reset to empty if no data found
          setOnboardingData({
            firstName: undefined,
            partnerFirstName: undefined,
            dateOfBirth: undefined,
            gender: undefined,
            relationshipStatus: undefined,
            relationshipDuration: undefined,
            livingType: [],
            hasChildren: undefined,
            goals: [],
            emotionalNeeds: [],
            rhythm: undefined,
            tone: undefined,
            packPreferences: [],
          });
          console.log('ℹ️ No onboarding data found, starting fresh');
        }
      }
    } catch (error) {
      console.error('❌ Error loading user onboarding data:', error);
    }
  }, []);

  const saveToStorage = async (data: OnboardingData) => {
    try {
      const storageKey = await getUserStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      console.log('✅ Saved onboarding data to user-specific storage');
    } catch (error) {
      console.error('❌ Error saving onboarding data:', error);
    }
  };

  const updateField = useCallback((field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };
      // Save to AsyncStorage immediately
      saveToStorage(newData);
      return newData;
    });
  }, []);

  const submitOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        // If no token, just save locally and wait for account creation
        console.log('⏳ No auth token yet, data saved locally');
        await saveToStorage(onboardingData);
        return null;
      }

      // If authenticated, send all data to backend
      console.log('📤 Sending onboarding data to backend:', onboardingData);
      await updateOnboardingData(onboardingData);
      const updatedUser = await completeOnboarding();
      
      // Keep onboarding data in storage as fallback (don't clear it)
      // The user's profile should include this data from the backend
      console.log('✅ Onboarding submitted successfully (data kept in storage as fallback)');
      
      return updatedUser;
    } catch (err: any) {
      console.error('❌ Onboarding submission error:', err);
      setError(err.message || 'Failed to submit onboarding');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onboardingData]);

  const clearOnboarding = useCallback(async () => {
    setOnboardingData({
      firstName: undefined,
      partnerFirstName: undefined,
      dateOfBirth: undefined,
      gender: undefined,
      relationshipStatus: undefined,
      relationshipDuration: undefined,
      livingType: [],
      hasChildren: undefined,
      goals: [],
      emotionalNeeds: [],
      rhythm: undefined,
      tone: undefined,
      packPreferences: [],
    });
    setError(null);
    
    // Clear user-specific storage
    try {
      const storageKey = await getUserStorageKey();
      await AsyncStorage.removeItem(storageKey);
      console.log('✅ Cleared user-specific onboarding data');
    } catch (error) {
      console.error('❌ Error clearing onboarding data:', error);
    }
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateField,
        submitOnboarding,
        clearOnboarding,
        loadUserOnboardingData,
        isLoading,
        error,
        hasAuthToken,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};