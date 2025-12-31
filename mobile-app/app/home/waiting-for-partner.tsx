import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';

export default function WaitingForPartnerScreen() {
  const router = useRouter();

  const handleShareInvite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/partner-invite'); // Or your invite screen path
  };

  return (
    <OnboardingLayout
      showBackButton={false}
      showLogo={true}
      showHeartLogo={false}
      showChatIcon={false}
      showSettingsIcon={false}
      showTetherLine={true} // Animated tether line
      showProgress={false}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Heart Symbol – Centered */}
          <View style={styles.heartContainer}>
            <Image
              source={require('../../assets/images/heart-symbol-black.png')}
              style={styles.heartImage}
              resizeMode="contain"
            />
          </View>

          {/* Main Title */}
          <Text style={styles.title}>Waiting for Your Partner 💕</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            You've completed setup! Now just waiting for your partner to join so you can start exploring together.
          </Text>

          {/* Hint */}
          <Text style={styles.hint}>
            Share your invite link with them to get started!
          </Text>

          {/* Share Invite Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareInvite}
            activeOpacity={0.9}
          >
            <Text style={styles.shareButtonText}>Share Invite Link</Text>
            <Ionicons name="share-outline" size={20} color={Colors.white} style={styles.shareIcon} />
          </TouchableOpacity>

          {/* Fun Illustration / Animation Space */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/images/icon.png')} // Add your custom image
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  heartContainer: {
    marginBottom: Spacing.lg,
  },
  heartImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.heading,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  hint: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  shareIcon: {
    marginLeft: Spacing.sm,
  },
  illustrationContainer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  illustration: {
    width: 200,
    height: 200,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});