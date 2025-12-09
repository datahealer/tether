import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

type PlanType = 'yearly' | 'monthly' | 'trial';

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  billing: string;
  badge?: string;
  savings?: string;
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const plans: Plan[] = [
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$3.75 per month',
      billing: 'Billed annually at $44.99',
      badge: 'Most Popular',
      savings: 'Save 42%',
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$6.49 per month',
      billing: 'Billed monthly',
    },
    {
      id: 'trial',
      name: '7 Days of Premium',
      price: 'Free',
      billing: '',
    },
  ];

  const handleSelectPlan = (planId: PlanType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const handleStartTrial = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // TODO: Integrate with in-app purchases
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to home or completion screen
      router.replace('/(tabs)');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to start trial');
    }
  };

  return (
    <OnboardingLayout progress={1.0} showBackButton={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Pick your Plan</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Premium gives you access to every category,{'\n'}
          more question refreshes and exclusive features.
        </Text>

        {/* Subscription Info */}
        <Text style={styles.subscriptionInfo}>
          One Subscription for two partners.
        </Text>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isTrial = plan.id === 'trial';
            
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  isTrial && styles.trialCard,
                ]}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.8}
              >
                {/* Badge */}
                {plan.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{plan.badge}</Text>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Plan Name */}
                <Text style={[
                  styles.planName,
                  isTrial && styles.trialName,
                ]}>
                  {plan.name}
                </Text>

                {/* Plan Price */}
                <Text style={[
                  styles.planPrice,
                  isTrial && styles.trialPrice,
                ]}>
                  {plan.price}
                </Text>

                {/* Plan Billing */}
                {plan.billing && (
                  <Text style={[
                    styles.planBilling,
                    isTrial && styles.trialBilling,
                  ]}>
                    {plan.billing}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.lg }} />

        {/* Start Trial Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartTrial}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Start 7 Days Of Free Premium</Text>
        </TouchableOpacity>

        {/* Trial Info */}
        <Text style={styles.trialInfo}>
          Your 7-day Premium Trial will automatically convert to a Monthly{'\n'}
          Subscription unless cancelled at least <Text style={styles.highlight}>24 hours</Text> before renewal.
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
    paddingBottom: Spacing.xl,
  },
  heading: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.heading + 4,
    lineHeight: 40,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    marginBottom: Spacing.sm,
    letterSpacing: 0,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.md,
    letterSpacing: 0,
  },
  subscriptionInfo: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  plansContainer: {
    gap: Spacing.md,
  },
  planCard: {
    backgroundColor: Colors.veryLightOrange,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.darkOrange,
  },
  trialCard: {
    backgroundColor: Colors.mediumGrey,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
    letterSpacing: 0,
  },
  savingsBadge: {
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  savingsText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small - 2,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    letterSpacing: 0,
  },
  planName: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.large + 2,
    lineHeight: 28,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    marginBottom: 4,
    letterSpacing: 0,
  },
  trialName: {
    fontSize: FontSizes.large,
  },
  planPrice: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large,
    lineHeight: 24,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    letterSpacing: 0,
  },
  trialPrice: {
    color: Colors.darkOrange,
  },
  planBilling: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginTop: 4,
    letterSpacing: 0,
  },
  trialBilling: {
    color: Colors.inputText,
  },
  startButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  buttonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  trialInfo: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small - 1,
    lineHeight: 16,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    letterSpacing: 0,
  },
  highlight: {
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
});