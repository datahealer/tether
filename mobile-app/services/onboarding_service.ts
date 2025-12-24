import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export interface OnboardingData {
  // Personal Info (new fields)
  firstName?: string;
  partnerFirstName?: string;
  dateOfBirth?: string;
  gender?: string;
  
  // Existing fields
  relationshipStatus?: string;
  relationshipDuration?: string;
  livingType?: string[];
  hasChildren?: boolean; // Add this field
  goals?: string[];
  emotionalNeeds?: string[];
  rhythm?: string;
  tone?: string;
  packPreferences?: string[];
}

export interface CoupleInvite {
  code: string;
  link: string;
  expiresAt: string;
}

/**
 * Get auth token from storage
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Update onboarding data
 */
// ...existing code...

export const updateOnboardingData = async (data: any) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    console.log('🔑 Token available:', !!token);
    console.log('📤 Sending onboarding data to backend:', data);

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/api/onboarding/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ Error response:', error);
      throw new Error(error.error || 'Failed to update onboarding data');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Onboarding submission error:', error);
    throw error;
  }
};


/**
 * Complete onboarding
 */
export const completeOnboarding = async (): Promise<any> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/api/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete onboarding');
    }

    const result = await response.json();
    console.log('✅ Onboarding completed, user data:', result.user);
    return result.user;
  } catch (error: any) {
    console.error('❌ Complete onboarding error:', error);
    throw error;
  }
};

/**
 * Generate couple invite
 */
export const generateCoupleInvite = async (): Promise<CoupleInvite> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/api/onboarding/invite/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate invite');
    }

    const result = await response.json();
    return result.invite;
  } catch (error: any) {
    console.error('❌ Generate invite error:', error);
    throw error;
  }
};

/**
 * Accept couple invite
 */
export const acceptCoupleInvite = async (inviteCode: string): Promise<void> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/api/onboarding/invite/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ inviteCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept invite');
    }

    console.log('✅ Invite accepted successfully');
  } catch (error: any) {
    console.error('❌ Accept invite error:', error);
    throw error;
  }
};

/**
 * Get couple information
 */
export const getCoupleInfo = async (): Promise<any> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    const response = await fetch(`${API_URL}/api/onboarding/couple`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get couple info');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('❌ Get couple info error:', error);
    throw error;
  }
};
