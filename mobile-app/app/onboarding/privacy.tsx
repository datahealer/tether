
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, ComponentSizes, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function PrivacyScreen() {
  const router = useRouter();

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/about-you');
  };

  return (
    <OnboardingLayout progress={0.28} showBackButton={true} showLogoutAvatar={true}>
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
        <DebouncedButton
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </DebouncedButton>
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
