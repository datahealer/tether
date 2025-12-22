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
  submitOnboarding: () => Promise<void>;
  clearOnboarding: () => void;
  isLoading: boolean;
  error: string | null;
  hasAuthToken: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = '@tether_onboarding_data';

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
      const storedData = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (storedData) {
        setOnboardingData(JSON.parse(storedData));
        console.log('✅ Loaded onboarding data from storage');
      }
    } catch (error) {
      console.error('❌ Error loading onboarding data:', error);
    }
  };

  const saveToStorage = async (data: OnboardingData) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
      console.log('✅ Saved onboarding data to storage');
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
        return;
      }

      // If authenticated, send all data to backend
      console.log('📤 Sending onboarding data to backend:', onboardingData);
      await updateOnboardingData(onboardingData);
      await completeOnboarding();
      
      // Clear local storage after successful submission
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      console.log('✅ Onboarding submitted successfully');
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
      relationshipStatus: undefined,
      relationshipDuration: undefined,
      livingType: [],
      goals: [],
      emotionalNeeds: [],
      rhythm: undefined,
      tone: undefined,
      packPreferences: [],
    });
    setError(null);
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateField,
        submitOnboarding,
        clearOnboarding,
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