import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

type PlanType = 'yearly' | 'monthly';

export default function PremiumScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const handleSelectPlan = async (plan: PlanType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleUpdatePlan = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Test out Premium</Text>
        <Text style={styles.subtitle}>
          Premium gives you access to every category,{'\n'}
          more question varieties and exclusive features.
        </Text>
        <Text style={styles.badge}>One Subscription for two partners.</Text>

        {/* Yearly Plan */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('yearly')}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Yearly</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 40%</Text>
            </View>
          </View>
          <Text style={styles.planSubtitle}>14-day trial (then billed yearly)</Text>
          <Text style={styles.planPrice}>$3.75 per month</Text>
        </TouchableOpacity>

        {/* Monthly Plan */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('monthly')}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Monthly</Text>
          </View>
          <Text style={styles.planPrice}>$6.49 per month</Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl * 2 }} />

        {/* Update Plan Button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdatePlan}
          activeOpacity={0.8}
        >
          <Text style={styles.updateButtonText}>Update plan</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          Billing is handled securely through the App Store. You can cancel anytime.
        </Text>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.xl * 2,
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.sm,
    letterSpacing: 0,
  },
  subtitle: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.md,
    letterSpacing: 0,
  },
  badge: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.darkOrange,
    marginBottom: Spacing.xl,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  planCardSelected: {
    borderColor: Colors.darkOrange,
    backgroundColor: Colors.veryLightOrange,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  planTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  saveBadge: {
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.white,
  },
  planSubtitle: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small + 2,
    color: Colors.inputText,
    marginBottom: Spacing.xs,
  },
  planPrice: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large + 2,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  updateButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  updateButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  footerText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small + 2,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 18,
  },
});