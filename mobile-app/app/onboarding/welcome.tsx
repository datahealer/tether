
// // import React from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ImageBackground,
// //   Dimensions,
// //   StatusBar,
// // } from 'react-native';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import { useRouter } from 'expo-router';

// // const { width, height } = Dimensions.get('window');

// // export default function HomeScreen() {
// //   const router = useRouter();

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" />
      
// //       {/* Background Image */}
// //       <ImageBackground
// //         source={require('../../assets/images/home-background.png')}
// //         style={styles.backgroundImage}
// //         resizeMode="cover"
// //       >
// //         {/* Gradient Overlay */}
// //         <LinearGradient
// //           colors={['rgba(44, 62, 80, 0.65)', 'rgba(52, 73, 94, 0.75)', 'rgba(44, 62, 80, 0.85)']}
// //           style={styles.overlay}
// //         >
// //           {/* Logo at top */}
// //           <View style={styles.logoContainer}>
// //             <Text style={styles.logoText}>LOGO</Text>
// //           </View>

// //           {/* Main content */}
// //           <View style={styles.content}>
// //             <Text style={styles.title}>A better way to stay{'\n'}connected</Text>
// //             <Text style={styles.subtitle}>
// //               Short daily questions that bring you closer
// //             </Text>

// //             {/* Let's Start Button */}
// //             <TouchableOpacity 
// //               style={styles.button} 
// //               activeOpacity={0.8}
// //               onPress={() => router.push('/onboarding/privacy')}
// //             >
// //               <Text style={styles.buttonText}>Let's Start</Text>
// //             </TouchableOpacity>

// //             {/* Privacy Policy Text */}
// //             <View style={styles.privacyContainer}>
// //               <Text style={styles.privacyText}>
// //                 You're in control of what you share.{'\n'}
// //                 By continuing, you agree to our{' '}
// //                 <Text style={styles.privacyLink}>Privacy Policy</Text>.
// //               </Text>
// //             </View>
// //           </View>
// //         </LinearGradient>
// //       </ImageBackground>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#000',
// //   },
// //   backgroundImage: {
// //     flex: 1,
// //     width: '100%',
// //     height: '100%',
// //   },
// //   overlay: {
// //     flex: 1,
// //     justifyContent: 'space-between',
// //   },
// //   logoContainer: {
// //     alignItems: 'center',
// //     paddingTop: 80,
// //   },
// //   logoText: {
// //     fontSize: 32,
// //     fontWeight: '700',
// //     color: '#FFFFFF',
// //     letterSpacing: 8,
// //   },
// //   content: {
// //     flex: 1,
// //     justifyContent: 'flex-end',
// //     alignItems: 'center',
// //     paddingHorizontal: 30,
// //     paddingBottom: 60,
// //   },
// //   title: {
// //     fontSize: 36,
// //     fontWeight: '700',
// //     color: '#FFFFFF',
// //     textAlign: 'center',
// //     marginBottom: 15,
// //     lineHeight: 42,
// //   },
// //   subtitle: {
// //     fontSize: 16,
// //     color: '#FFFFFF',
// //     textAlign: 'center',
// //     marginBottom: 50,
// //     opacity: 0.9,
// //     lineHeight: 22,
// //   },
// //   button: {
// //     backgroundColor: '#FF9B7A',
// //     paddingVertical: 18,
// //     borderRadius: 30,
// //     marginBottom: 30,
// //     width: width - 60,
// //     alignItems: 'center',
// //     shadowColor: '#FF9B7A',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.4,
// //     shadowRadius: 20,
// //     elevation: 8,
// //   },
// //   buttonText: {
// //     color: '#FFFFFF',
// //     fontSize: 18,
// //     fontWeight: '600',
// //   },
// //   privacyContainer: {
// //     marginBottom: 20,
// //   },
// //   privacyText: {
// //     fontSize: 12,
// //     color: '#FFFFFF',
// //     textAlign: 'center',
// //     lineHeight: 18,
// //     opacity: 0.7,
// //   },
// //   privacyLink: {
// //     textDecorationLine: 'underline',
// //     fontWeight: '600',
// //   },
// // });
// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';

// export default function WelcomeScreen() {
//   const router = useRouter();

//   return (
//     <OnboardingLayout showBackButton={false}>
//       <View style={styles.content}>
//         {/* Logo Section */}
//         <View style={styles.logoContainer}>
//           {/* Heart Icon */}
//           <Image
//             source={require('../../assets/images/group.png')}
//             style={styles.heartLogo}
//             resizeMode="contain"
//           />
          
//           {/* Tether Text Logo */}
//           <Image
//             source={require('../../assets/images/vector.png')}
//             style={styles.tetherLogo}
//             resizeMode="contain"
//           />
//         </View>

//         {/* Title */}
//         <Text style={styles.title}>Welcome to the app{'\n'}that pulls couples closer</Text>
        
//         {/* Subtitle */}
//         <Text style={styles.subtitle}>
//           A moment you can both share before life{'\n'}does its best to pull you apart.
//         </Text>

//         {/* Buttons */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity 
//             style={styles.emailButton}
//             onPress={() => router.push('/onboarding/account-creation')}
//           >
//             <Ionicons name="mail-outline" size={20} color="#FFF" style={styles.buttonIcon} />
//             <Text style={styles.emailButtonText}>Sign up with E-Mail</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.appleButton}
//             onPress={() => {/* Handle Apple Sign In */}}
//           >
//             <Ionicons name="logo-apple" size={20} color="#FFF" style={styles.buttonIcon} />
//             <Text style={styles.appleButtonText}>Sign Up with Apple</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Terms */}
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
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
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
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useAuth } from '@/context/auth_context';
import { Canvas, Path, Skia, Blur } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const handleAppleSignIn = async () => {
    try {
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
      });
      
      router.push('/onboarding/privacy');
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        return;
      }
      Alert.alert('Error', 'Failed to sign in with Apple');
      console.error(e);
    }
  };

  // Animated flowing line component
  const AnimatedFlowingLine = () => {
    // Animation value
    const progress = useSharedValue(0);

    // Opacity animation for subtle pulsing effect
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

    // Create elegant flowing path matching the reference image
    // The line flows from top-left, makes a gentle loop near the logo, and continues down
    const pathString = `
      M ${width * 0.15},${height * 0.08}
      C ${width * 0.2},${height * 0.11} ${width * 0.22},${height * 0.14} ${width * 0.18},${height * 0.16}
      Q ${width * 0.16},${height * 0.17} ${width * 0.155},${height * 0.175}
      Q ${width * 0.15},${height * 0.18} ${width * 0.158},${height * 0.185}
      Q ${width * 0.166},${height * 0.19} ${width * 0.175},${height * 0.188}
      C ${width * 0.20},${height * 0.184} ${width * 0.23},${height * 0.175} ${width * 0.25},${height * 0.18}
      C ${width * 0.30},${height * 0.195} ${width * 0.35},${height * 0.22} ${width * 0.38},${height * 0.26}
      C ${width * 0.42},${height * 0.31} ${width * 0.45},${height * 0.38} ${width * 0.50},${height * 0.45}
      C ${width * 0.55},${height * 0.52} ${width * 0.58},${height * 0.58} ${width * 0.63},${height * 0.63}
      Q ${width * 0.655},${height * 0.655} ${width * 0.665},${height * 0.675}
      Q ${width * 0.675},${height * 0.695} ${width * 0.66},${height * 0.71}
      Q ${width * 0.645},${height * 0.725} ${width * 0.635},${height * 0.715}
      Q ${width * 0.625},${height * 0.705} ${width * 0.632},${height * 0.69}
      Q ${width * 0.639},${height * 0.675} ${width * 0.655},${height * 0.67}
      C ${width * 0.70},${height * 0.685} ${width * 0.75},${height * 0.72} ${width * 0.78},${height * 0.76}
      C ${width * 0.82},${height * 0.81} ${width * 0.85},${height * 0.87} ${width * 0.87},${height * 0.92}
    `;

    const path = Skia.Path.MakeFromSVGString(pathString);

    if (!path) return null;

    return (
      <Canvas style={styles.canvas}>
        {/* Soft glow layer - very subtle */}
        <Path
          path={path}
          color="rgba(217, 126, 90, 0.85)"
          style="stroke"
          strokeWidth={16}
          strokeCap="round"
          strokeJoin="round"
        >
          <Blur blur={8} />
        </Path>
        
        {/* Medium glow */}
        <Path
          path={path}
          color="rgba(255, 255, 255, 0.2)"
          style="stroke"
          strokeWidth={8}
          strokeCap="round"
          strokeJoin="round"
        >
          <Blur blur={4} />
        </Path>
        
        {/* Main delicate line */}
        <Path
          path={path}
          color="rgba(255, 255, 255, 0.85)"
          style="stroke"
          strokeWidth={1.8}
          strokeCap="round"
          strokeJoin="round"
          opacity={opacity}
        >
          <Blur blur={0.5} />
        </Path>
      </Canvas>
    );
  };

  return (
    <OnboardingLayout showBackButton={false} showLogo={false}>
      {/* Animated Flowing Line */}
      <AnimatedFlowingLine />

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/group.png')}
            style={styles.heartLogo}
            resizeMode="contain"
          />
          
          <Image
            source={require('../../assets/images/vector.png')}
            style={styles.tetherLogo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome to the app{'\n'}that pulls couples closer</Text>
        
        <Text style={styles.subtitle}>
          A moment you can both share before life{'\n'}does its best to pull you apart.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.emailButton}
            onPress={() => router.push('/onboarding/account-creation')}
          >
            <Ionicons name="mail-outline" size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.emailButtonText}>Sign up with E-Mail</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          >
            <Ionicons name="logo-apple" size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.appleButtonText}>Sign Up with Apple</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
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
    paddingHorizontal: 20,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heartLogo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  tetherLogo: {
    width: 200,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginBottom: 15,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 50,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 20,
  },
  emailButton: {
    backgroundColor: '#D97E5A',
    borderRadius: 25,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  emailButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  link: {
    color: '#D97E5A',
    textDecorationLine: 'underline',
  },
});