import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,

  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function ConnectTethersScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  const partnerName = onboardingData.partnerFirstName || 'Partner';

  useEffect(() => {
    // Auto-haptic when screen loads
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleTetherUs = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // TODO: Call backend API to complete tethering
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/onboarding/partner-invite');
  };

  return (
    <OnboardingLayout progress={0.56} showBackButton={true} showLogoutAvatar={true}>
      <View style={styles.container}>
        {/* Heart Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/images/heart-symbol-black.png')}
            style={styles.heartIcon}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Time to connect{'\n'}your Tethers</Text>

        {/* Description */}
        <Text style={styles.description}>
          You'll now link with {partnerName} so that each{'\n'}
          answer can pull you closer together.
        </Text>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Tether Us Button */}
        <DebouncedButton
          style={styles.tetherButton}
          onPress={handleTetherUs}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Tether Us</Text>
        </DebouncedButton>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xxl,
  },
  heartIcon: {
    width: 120,
    height: 120,
  },
  heading: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0,
  },
  description: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 22,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    letterSpacing: 0,
  },
  tetherButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    paddingHorizontal: Spacing.xxl * 2,
    width: '100%',
    alignItems: 'center',
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