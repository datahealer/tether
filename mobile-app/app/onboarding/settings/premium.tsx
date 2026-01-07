import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import {
  getSubscriptionStatus,
  subscribeToPlan,
  getAvailablePlans,
} from '../../../services/subscription';

type PlanType = 'yearly' | 'monthly';

export default function PremiumScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const plans = getAvailablePlans().filter(p => p.id !== 'trial');

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await getSubscriptionStatus();
      setCurrentSubscription(status);
      if (status.planType) {
        setSelectedPlan(status.planType as PlanType);
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const handleSelectPlan = async (plan: PlanType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleUpdatePlan = async () => {
    // Check if user is trying to select the same plan they already have
    if (currentSubscription?.planType === selectedPlan) {
      Alert.alert(
        'Same Plan',
        `You're already subscribed to the ${selectedPlan} plan.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Show confirmation for plan change
      Alert.alert(
        'Change Plan',
        `Switch to ${selectedPlan} plan?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsLoading(false),
          },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                // TODO: Integrate with in-app purchases for plan upgrade
                Alert.alert(
                  'Plan Update',
                  'In-app purchase integration coming soon! For now, use the test screen to simulate purchases.',
                  [{ text: 'OK' }]
                );

                // When actual IAP is integrated:
                // const purchaseToken = await requestPurchase(selectedPlan);
                // await subscribeToPlan(selectedPlan, purchaseToken);
                // await loadSubscriptionStatus();

                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (error: any) {
                console.error('Plan update error:', error);
                Alert.alert('Error', error.message || 'Failed to update plan');
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
    }
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

        {/* Current Plan Info */}
        {currentSubscription?.isSubscribed && (
          <View style={styles.currentPlanBanner}>
            <Text style={styles.currentPlanText}>
              Current Plan: {currentSubscription.planType?.toUpperCase()}
            </Text>
            {currentSubscription.expiresAt && (
              <Text style={styles.currentPlanSubtext}>
                Expires: {new Date(currentSubscription.expiresAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Yearly Plan */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('yearly')}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Yearly</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 40%</Text>
            </View>
          </View>
          <Text style={styles.planSubtitle}>Billed annually at $44.99</Text>
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
          disabled={isLoading}
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
          style={[
            styles.updateButton,
            isLoading && styles.updateButtonDisabled,
          ]}
          onPress={handleUpdatePlan}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.updateButtonText}>
              {currentSubscription?.planType === selectedPlan ? 'Current Plan' : 'Update plan'}
            </Text>
          )}
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
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.md,
    minHeight: 56,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  currentPlanBanner: {
    backgroundColor: Colors.veryLightOrange,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.darkOrange,
  },
  currentPlanText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    marginBottom: Spacing.xs,
  },
  currentPlanSubtext: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small,
    color: Colors.inputText,
  },
  footerText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small + 2,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 18,
  },
});

