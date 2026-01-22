
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
import { NotificationProvider } from '@/context/notification_context';
import { TetherStatsProvider } from '@/context/tether_stats_context';
import SplashScreenComponent from '../components/splash';
import { NavigationHandler } from '../components/NavigationHandler';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

// ✅ Configure Google Sign-In once at app startup
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
  scopes: ['profile', 'email'],
  offlineAccess: false,
});

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
    <ErrorBoundary>
      <AuthProvider>
        <OnboardingProvider>
          <NotificationProvider>
            <TetherStatsProvider>
              <NavigationHandler/>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/account-creation" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/login" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/settings" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/profile-details" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/rhythm-settings" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/premium" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/privacy-control" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/delete-answers" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/manage-subscription" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/feedback" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/settings/send-message" options={{ headerShown: false }} />
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
                  <Stack.Screen name="onboarding/subscription" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding/partner-invite" options={{ headerShown: false }} />
                  <Stack.Screen name="home/category-packs" options={{ headerShown: false }} />
                  <Stack.Screen name="home/waiting-partner" options={{ headerShown: false }} />
                  <Stack.Screen name="home/waiting-for-partner-answer" options={{ headerShown: false }} />
                  <Stack.Screen name="home/tether-history" options={{ headerShown: false }} />
                  <Stack.Screen name="home/question-expired" options={{ headerShown: false }} />
                  <Stack.Screen name="home/both-expired" options={{ headerShown: false }} />
                  <Stack.Screen name="home/unlock-pack" options={{ headerShown: false }} />
                  <Stack.Screen name="home/choose-second-pack" options={{ headerShown: false }} />
                  <Stack.Screen name="home/category-question" options={{ headerShown: false }} />
                  <Stack.Screen name="home/draw-locked-upsell" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </TetherStatsProvider>
          </NotificationProvider>
        </OnboardingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

