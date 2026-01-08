
// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, DebouncedButton, Image, Alert, Dimensions } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as AppleAuthentication from 'expo-apple-authentication';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import { useAuth } from '@/context/auth_context';
// import { Canvas, Path, Skia, Blur } from '@shopify/react-native-skia';
// import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';

// const { width, height } = Dimensions.get('window');

// export default function WelcomeScreen() {
//   const router = useRouter();
//   const { signIn } = useAuth();

//   const handleAppleSignIn = async () => {
//     try {
//       const credential = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//       });
      
//       const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/apple`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           identityToken: credential.identityToken,
//           user: credential.user,
//           email: credential.email,
//           fullName: credential.fullName,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to authenticate');
//       }

//       const data = await response.json();
//       await signIn({
//         id: data.user.id,
//         email: data.user.email,
//         name: data.user.name,
//         provider: 'apple',
//         token: data.token,
//       });
      
//       router.push('/onboarding/privacy');
//     } catch (e: any) {
//       if (e.code === 'ERR_CANCELED') {
//         return;
//       }
//       Alert.alert('Error', 'Failed to sign in with Apple');
//       console.error(e);
//     }
//   };

//   // Animated flowing line component
//   const AnimatedFlowingLine = () => {
//     // Animation value
//     const progress = useSharedValue(0);

//     // Opacity animation for subtle pulsing effect
//     const opacity = useDerivedValue(() => {
//       return 0.4 + Math.sin(progress.value * Math.PI * 2) * 0.15;
//     });

//     useEffect(() => {
//       progress.value = withRepeat(
//         withTiming(1, {
//           duration: 4000,
//           easing: Easing.inOut(Easing.ease),
//         }),
//         -1,
//         true
//       );
//     }, []);

//     // Create elegant flowing path matching the reference image
//     // The line flows from top-left, makes a gentle loop near the logo, and continues down
//     const pathString = `
//       M ${width * 0.15},${height * 0.08}
//       C ${width * 0.2},${height * 0.11} ${width * 0.22},${height * 0.14} ${width * 0.18},${height * 0.16}
//       Q ${width * 0.16},${height * 0.17} ${width * 0.155},${height * 0.175}
//       Q ${width * 0.15},${height * 0.18} ${width * 0.158},${height * 0.185}
//       Q ${width * 0.166},${height * 0.19} ${width * 0.175},${height * 0.188}
//       C ${width * 0.20},${height * 0.184} ${width * 0.23},${height * 0.175} ${width * 0.25},${height * 0.18}
//       C ${width * 0.30},${height * 0.195} ${width * 0.35},${height * 0.22} ${width * 0.38},${height * 0.26}
//       C ${width * 0.42},${height * 0.31} ${width * 0.45},${height * 0.38} ${width * 0.50},${height * 0.45}
//       C ${width * 0.55},${height * 0.52} ${width * 0.58},${height * 0.58} ${width * 0.63},${height * 0.63}
//       Q ${width * 0.655},${height * 0.655} ${width * 0.665},${height * 0.675}
//       Q ${width * 0.675},${height * 0.695} ${width * 0.66},${height * 0.71}
//       Q ${width * 0.645},${height * 0.725} ${width * 0.635},${height * 0.715}
//       Q ${width * 0.625},${height * 0.705} ${width * 0.632},${height * 0.69}
//       Q ${width * 0.639},${height * 0.675} ${width * 0.655},${height * 0.67}
//       C ${width * 0.70},${height * 0.685} ${width * 0.75},${height * 0.72} ${width * 0.78},${height * 0.76}
//       C ${width * 0.82},${height * 0.81} ${width * 0.85},${height * 0.87} ${width * 0.87},${height * 0.92}
//     `;

//     const path = Skia.Path.MakeFromSVGString(pathString);

//     if (!path) return null;

//     return (
//       <Canvas style={styles.canvas}>
//         {/* Soft glow layer - very subtle */}
//         <Path
//           path={path}
//           color="rgba(217, 126, 90, 0.85)"
//           style="stroke"
//           strokeWidth={16}
//           strokeCap="round"
//           strokeJoin="round"
//         >
//           <Blur blur={8} />
//         </Path>
        
//         {/* Medium glow */}
//         <Path
//           path={path}
//           color="rgba(255, 255, 255, 0.2)"
//           style="stroke"
//           strokeWidth={8}
//           strokeCap="round"
//           strokeJoin="round"
//         >
//           <Blur blur={4} />
//         </Path>
        
//         {/* Main delicate line */}
//         <Path
//           path={path}
//           color="rgba(255, 255, 255, 0.85)"
//           style="stroke"
//           strokeWidth={1.8}
//           strokeCap="round"
//           strokeJoin="round"
//           opacity={opacity}
//         >
//           <Blur blur={0.5} />
//         </Path>
//       </Canvas>
//     );
//   };

//   return (
//     <OnboardingLayout showBackButton={false} showLogo={false}>
//       {/* Animated Flowing Line */}
//       <AnimatedFlowingLine />

//       <View style={styles.content}>
//         {/* Logo Section */}
//         <View style={styles.logoContainer}>
//           <Image
//             source={require('../../assets/images/group.png')}
//             style={styles.heartLogo}
//             resizeMode="contain"
//           />
          
//           <Image
//             source={require('../../assets/images/vector.png')}
//             style={styles.tetherLogo}
//             resizeMode="contain"
//           />
//         </View>

//         <Text style={styles.title}>Welcome to the app{'\n'}that pulls couples closer</Text>
        
//         <Text style={styles.subtitle}>
//           A moment you can both share before life{'\n'}does its best to pull you apart.
//         </Text>

//         <View style={styles.buttonContainer}>
//           <DebouncedButton 
//             style={styles.emailButton}
//             onPress={() => router.push('/onboarding/account-creation')}
//           >
//             <Ionicons name="mail-outline" size={20} color="#FFF" style={styles.buttonIcon} />
//             <Text style={styles.emailButtonText}>Sign up with E-Mail</Text>
//           </DebouncedButton>

//           <DebouncedButton 
//             style={styles.appleButton}
//             onPress={handleAppleSignIn}
//           >
//             <Ionicons name="logo-apple" size={20} color="#FFF" style={styles.buttonIcon} />
//             <Text style={styles.appleButtonText}>Sign Up with Apple</Text>
//           </DebouncedButton>
//         </View>

//         <Text style={styles.terms}>
//           By continuing, you agree to our{' '}
//           <Text style={styles.link}>Terms of Service</Text> and{' '}
//           <Text style={styles.link}>Privacy Policy</Text>.
//         </Text>
//       </View>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   canvas: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 0,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     zIndex: 1,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   heartLogo: {
//     width: 50,
//     height: 50,
//     marginBottom: 10,
//   },
//   tetherLogo: {
//     width: 200,
//     height: 80,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '600',
//     textAlign: 'center',
//     color: '#000',
//     marginBottom: 15,
//     lineHeight: 32,
//   },
//   subtitle: {
//     fontSize: 14,
//     textAlign: 'center',
//     color: '#666',
//     marginBottom: 50,
//     lineHeight: 20,
//   },
//   buttonContainer: {
//     width: '100%',
//     gap: 15,
//     marginBottom: 20,
//   },
//   emailButton: {
//     backgroundColor: '#D97E5A',
//     borderRadius: 25,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonIcon: {
//     marginRight: 8,
//   },
//   emailButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   appleButton: {
//     backgroundColor: '#000',
//     borderRadius: 25,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   appleButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   terms: {
//     fontSize: 12,
//     textAlign: 'center',
//     color: '#666',
//     marginTop: 20,
//     paddingHorizontal: 20,
//   },
//   link: {
//     color: '#D97E5A',
//     textDecorationLine: 'underline',
//   },
// });
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import {  signInWithGoogle,processGoogleSignIn } from '@/services/auth_service';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useAuth } from '@/context/auth_context';
import { Canvas, Path, Skia, Blur } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, FontWeights, ComponentSizes } from '../../theme/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // const { request, response, promptAsync } = useGoogleAuth();

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     handleGoogleResponse(response);
  //   }
  // }, [response]);




  const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const user = await signInWithGoogle();
    await signIn(user);  // Your auth context
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/onboarding/privacy');
  } catch (error: any) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert('Error', error.message || 'Failed to sign in with Google');
  } finally {
    setIsLoading(false);
  }
};

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          user: credential.user,
          email: credential.email,
          fullName: credential.fullName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }

      const data = await response.json();
      await signIn({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        provider: 'apple',
        token: data.token,
        onboarded:data.user.onboarded,
        subscribed:data.user.subscribed,
      });
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/onboarding/privacy');
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        setIsLoading(false);
        return;
      }
      Alert.alert('Error', 'Failed to sign in with Apple');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/account-creation');
  };

  // Animated Flowing Line Component
  const AnimatedFlowingLine = () => {
    const progress = useSharedValue(0);

    const opacity = useDerivedValue(() => {
      return 0.4 + Math.sin(progress.value * Math.PI * 2) * 0.15;
    });

    useEffect(() => {
      progress.value = withRepeat(
        withTiming(1, {
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, []);

    // Flowing tether line path - subtle and elegant
    const pathString = `
      M 50,80
      C 80,100 100,130 90,160
      Q 85,175 90,190
      Q 95,205 110,210
      C 150,220 200,250 250,300
      C 300,350 320,400 310,450
      Q 305,475 315,490
      Q 325,505 340,500
      C 380,490 420,520 450,580
    `;

    const path = Skia.Path.MakeFromSVGString(pathString);
    if (!path) return null;

    return (
      <Canvas style={styles.canvas}>
        {/* Soft glow */}
        <Path
          path={path}
          color={Colors.white}
          style="stroke"
          strokeWidth={12}
          strokeCap="round"
          strokeJoin="round"
        >
          <Blur blur={6} />
        </Path>
        
        {/* Main line */}
        <Path
          path={path}
          color={Colors.white}
          style="stroke"
          strokeWidth={2}
          strokeCap="round"
          strokeJoin="round"
          opacity={opacity}
        />
      </Canvas>
    );
  };

  // Show loading overlay
  if (isLoading) {
    return (
      <OnboardingLayout showBackButton={false} showLogo={false} showTetherLine={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkOrange} />
          <Text style={styles.loadingText}>Signing in...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    
    <OnboardingLayout showBackButton={false} showLogo={false} showTetherLine={false}>
      {/* Animated Flowing Line */}
      <AnimatedFlowingLine />

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          {/* Asset needed: /assets/images/heart-symbol-black.png (50x50) */}
          <Image
            source={require('../../assets/images/heart-symbol-black.png')}
            style={styles.heartLogo}
            resizeMode="contain"
          />
          
          {/* Asset needed: /assets/images/tether-wordmark-black-large.png (200x80) */}
          <Image
            source={require('../../assets/images/tether-wordmark-black-large.png')}
            style={styles.tetherLogo}
            resizeMode="contain"
          />
        </View>

        {/* Heading - Inter Tight Semi Bold, 28pt, Centered */}
        <Text style={styles.heading}>
          Welcome to the app{'\n'}that pulls couples closer
        </Text>
        
        {/* Description - Inter Tight Regular, 16pt, Centered */}
        <Text style={styles.description}>
          A moment you can both share before life{'\n'}does its best to pull you apart.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Email Button - 358x65, Dark Orange */}
          <DebouncedButton 
            style={styles.emailButton}
            onPress={handleEmailSignUp}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={20} color={Colors.white} style={styles.buttonIcon} />
            <Text style={styles.emailButtonText}>Sign up with E-Mail</Text>
          </DebouncedButton>

          {/* Apple Button - 358x60, Black */}
         {Platform.OS === 'ios' ? (
  <DebouncedButton 
    style={styles.appleButton}
    onPress={handleAppleSignIn}
    activeOpacity={0.8}
  >
    <Ionicons name="logo-apple" size={20} color={Colors.white} style={styles.buttonIcon} />
    <Text style={styles.appleButtonText}>Sign Up with Apple</Text>
  </DebouncedButton>
) : (
  <DebouncedButton 
    style={styles.appleButton}
    onPress={handleGoogleSignIn}
    activeOpacity={0.8}
  >
    <Ionicons name="logo-google" size={20} color={Colors.white} style={styles.buttonIcon} />
    <Text style={styles.appleButtonText}>Sign Up with Google</Text>
  </DebouncedButton>
)}
        </View>

        {/* Disclaimer - Inter Tight Regular, 12pt, Centered */}
        <Text style={styles.disclaimer}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>
    </OnboardingLayout>

  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heartLogo: {
    width: 50,
    height: 50,
    marginBottom: Spacing.sm,
  },
  tetherLogo: {
    width: 200,
    height: 80,
  },
  // Heading: Inter Tight Semi Bold, 28, Line Height 36, Centered
  heading: {
    fontFamily: 'InterTight-SemiBold', // Asset needed: Add Inter Tight font family
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
    color: Colors.black,
    marginBottom: Spacing.sm,
    letterSpacing: 0,
  },
  // Description: Inter Tight Regular, 16, Line Height 24, Centered
  description: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
    color: Colors.inputText,
    marginBottom: Spacing.xxl + Spacing.md, // 56pt spacing
    letterSpacing: 0,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  // Email Button: 358x65, Corner Radius 32, Dark Orange
  emailButton: {
    ...ComponentSizes.buttonLarge,
    backgroundColor: Colors.darkOrange,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  // Button CTA: Inter Tight Semi Bold, 18, Line Height 28, Letter Spacing 2.5%, Centered
  emailButtonText: {
    fontFamily: 'InterTight-SemiBold',
    color: Colors.white,
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.45, // 2.5% of 18
    textAlign: 'center',
  },
  // Apple Button: 358x60, Corner Radius 32, Black
  appleButton: {
    ...ComponentSizes.appleButton,
    backgroundColor: Colors.black,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  appleButtonText: {
    fontFamily: 'InterTight-SemiBold',
    color: Colors.white,
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.45,
    textAlign: 'center',
  },
  // Disclaimer: Inter Tight Regular, 12, Line Height 18, Letter Spacing -1%, Centered
  disclaimer: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.disclaimer,
    lineHeight: 18,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
    color: Colors.inputText,
    paddingHorizontal: Spacing.lg,
    letterSpacing: -0.12, // -1% of 12
  },
  // Links: Dark Orange, Underlined
  link: {
    color: Colors.darkOrange,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    color: Colors.inputText,
    marginTop: Spacing.md,
  },
});