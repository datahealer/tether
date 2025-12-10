// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter } from 'expo-router';

// export default function PrivacyScreen() {
//   const router = useRouter();

//   return (
//     <LinearGradient
//       colors={['#F5E6D3', '#E8D4C0', '#F0DDD0']}
//       style={styles.container}
//     >
//       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//         <Text style={styles.backText}>←</Text>
//       </TouchableOpacity>

//       <View style={styles.content}>
//         <View style={styles.iconContainer}>
//           <Text style={styles.icon}>🔒</Text>
//         </View>

//         <Text style={styles.title}>Your privacy comes first</Text>
//         <Text style={styles.subtitle}>
//           We only collect what helps improve your experience.{'\n\n'}
//           You can delete your data anytime
//         </Text>
//       </View>

//       <View style={styles.bottomContainer}>
//         <TouchableOpacity
//           style={styles.primaryButton}
//           onPress={() => router.push('/onboarding/relationship-status')}
//         >
//           <Text style={styles.primaryButtonText}>Got It</Text>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => {}}>
//           <Text style={styles.linkText}>Learn More</Text>
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 60,
//   },
//   backButton: {
//     paddingHorizontal: 24,
//     paddingVertical: 8,
//   },
//   backText: {
//     fontSize: 28,
//     color: '#2C2C2C',
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 32,
//   },
//   iconContainer: {
//     width: 120,
//     height: 120,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   icon: {
//     fontSize: 60,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#2C2C2C',
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   bottomContainer: {
//     paddingHorizontal: 24,
//     paddingBottom: 50,
//     gap: 16,
//   },
//   primaryButton: {
//     backgroundColor: '#FF9B7A',
//     paddingVertical: 18,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   primaryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   linkText: {
//     fontSize: 16,
//     color: '#2C2C2C',
//     textAlign: 'center',
//     fontWeight: '500',
//   },
// });
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, ComponentSizes, BorderRadius } from '@/theme/constants';

export default function PrivacyScreen() {
  const router = useRouter();

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/about-you');
  };

  return (
    <OnboardingLayout progress={0.28} showBackButton={true} showSettingsIcon={true}>
      <View style={styles.content}>
        {/* Heart Icon */}
        <View style={styles.iconContainer}>
          {/* Asset needed: /assets/images/heart-symbol-black.png (80x80) */}
          <Image
            source={require('../../assets/images/heart-symbol-black.png')}
            style={styles.heartIcon}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          We want your Tethers{'\n'}to feel personal
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Everything you share stays private and{'\n'}completely under your control.
        </Text>

        {/* Spacer to push button to bottom */}
        <View style={{ flex: 1 }} />

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  heartIcon: {
    width: 80,
    height: 80,
  },
  title: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    color: Colors.black,
    marginBottom: 20,
    letterSpacing: 0,
  },
  description: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    textAlign: 'center',
    color: Colors.inputText,
    paddingHorizontal: 10,
    letterSpacing: 0,
  },
  continueButton: {
    ...ComponentSizes.buttonLarge,
    backgroundColor: Colors.darkOrange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});