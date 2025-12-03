// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { AuthProvider } from '../context/auth_context';

// export const unstable_settings = {
//   initialRouteName: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <AuthProvider>
      // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      //   <Stack>
      //     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/privacy" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/relationship-status" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/relationship-duration" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/goals" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/tone" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/rhythm" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/live-sample" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/account-creation" options={{ headerShown: false }} />
      //     <Stack.Screen name="onboarding/partner-invite" options={{ headerShown: false }} />
      //     <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      //   </Stack>
      //   <StatusBar style="auto" />
      // </ThemeProvider>
//     </AuthProvider>
//   );
// }

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
import { View } from 'react-native';
import SplashScreenComponent from '../components/splash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [loaded] = useFonts({
   SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    SFProDisplay : require('../assets/fonts/SF-Pro-Display-Regular.ttf'),
    Smi : require('../assets/fonts/SF-Pro-Text-Semibold.ttf')
    
    // SF-Pro-Display: require('../assets/fonts/SF-Pro-Display-Regular.otf'),
    // SF-Pro-Display-Bold: require('../../assets/fonts/SF-Pro-Display-Bold.otf'),
    // Inter: require('../../assets/fonts/Inter-Regular.ttf'),

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
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
          <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/privacy" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/relationship-status" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/relationship-duration" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/goals" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/tone" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/rhythm" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/live-sample" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/account-creation" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding/partner-invite" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}