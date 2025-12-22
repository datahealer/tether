import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const token = await AsyncStorage.getItem('authToken');
      const userStr = await AsyncStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        
        // Check if user has completed onboarding
        if (user.onboarded) {
          router.replace('/onboarding/home');
        } else {
          // User is authenticated but hasn't completed onboarding
          router.replace('/onboarding/welcome');
        }
      } else {
        // No auth, start onboarding from privacy screen
        router.replace('/onboarding/welcome');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/onboarding/welcome');
    }
  };

  return (
    <LinearGradient
      colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
      style={styles.container}
    >
      <ActivityIndicator size="large" color="#8B4513" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
