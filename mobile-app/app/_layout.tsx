
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/auth_context';
import { OnboardingProvider } from '@/context/onboarding_context';
import SplashScreenComponent from '../components/splash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  
  const [loaded] = useFonts({
    // Existing fonts
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    
    // Inter Tight fonts for onboarding (Headings, Descriptions, Buttons)
    'InterTight-Regular' : require('../assets/fonts/InterTight-Regular.ttf'),
    'InterTight-Medium': require('../assets/fonts/InterTight-Medium.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    // 'InterTight-Bold': require('../assets/fonts/InterTight-Bold.ttf'),
    
    // SF Pro Display fonts (Input fields, Body text)
    'SFProDisplay-Regular': require('../assets/fonts/SF-Pro-Display-Regular.ttf'),
    'SFProDisplay-Medium': require('../assets/fonts/SFProDisplay-Medium.ttf'),
    // 'SFProDisplay-Semibold': require('../assets/fonts/SF-Pro-Display-Semibold.ttf'),
    // 'SFProDisplay-Bold': require('../assets/fonts/SF-Pro-Display-Bold.ttf'),
    
    // // SF Pro Text fonts (Alternative for smaller text)
    // 'SFProText-Regular': require('../assets/fonts/SF-Pro-Text-Regular.ttf'),
    // 'SFProText-Medium': require('../assets/fonts/SF-Pro-Text-Medium.ttf'),
    // 'SFProText-Semibold': require('../assets/fonts/SF-Pro-Text-Semibold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      // Show splash for 2 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded || showSplash) {
    return <SplashScreenComponent />;
  }

  return (
    <AuthProvider>
      <OnboardingProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/account-creation" options={{ headerShown: false }} />
            
            <Stack.Screen name="onboarding/privacy" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/about-you" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/understanding" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/relationship-stage" options={{ headerShown: false }} />
            
            <Stack.Screen name="onboarding/relationship-length" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/living-situation" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/children" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/goals" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/tone" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/rhythm" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/live-sample" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/first-tether" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/attribution" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/connect-tether-screen" options={{ headerShown: false }} />
            
            <Stack.Screen name="onboarding/notification-permission" options={{headerShown: false}}/>
            <Stack.Screen name="onboarding/partner-invite" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}

