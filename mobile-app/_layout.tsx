import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="relationship-status" options={{ headerShown: false }} />
      <Stack.Screen name="relationship-duration" options={{ headerShown: false }} />
      <Stack.Screen name="goals" options={{ headerShown: false }} />
      <Stack.Screen name="tone" options={{ headerShown: false }} />
      <Stack.Screen name="rhythm" options={{ headerShown: false }} />
      <Stack.Screen name="live-sample" options={{ headerShown: false }} />
      <Stack.Screen name="account-creation" options={{ headerShown: false }} />
      <Stack.Screen name="partner-invite" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="pickpack" options={{ headerShown: false }} />
    </Stack>
  );
}