import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

type PlanType = 'trial' | 'monthly' | 'yearly' | 'free';

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('trial');

  const handleSelectPlan = async (plan: PlanType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleSaveChanges = async () => {
    if (selectedPlan === 'free') {
      // Show confirmation modal
      Alert.alert(
        'Switch to Free Experience?',
        'You will keep Premium access until the end of your current billing period. If you cancel during the 7-day trial you will not be charged.',
        [
          { text: 'Keep Premium', style: 'cancel' },
          {
            text: 'Confirm Cancellation',
            style: 'destructive',
            onPress: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            },
          },
        ]
      );
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }
  };

  const handleCancelPlan = () => {
    handleSelectPlan('free');
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Manage your Tether{'\n'}Subscription</Text>
        <Text style={styles.subtitle}>
          View your plan, change it or cancel at any time.
        </Text>

        {/* Choose Your Plan Section */}
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>

        {/* 7 Day Premium Trial */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'trial' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('trial')}
          activeOpacity={0.8}
        >
          <View style={styles.planContent}>
            <View style={styles.planLeft}>
              <Text style={styles.planTitle}>7 Day Premium Trial</Text>
              <Text style={styles.planSubtitle}>Cancel anytime (free)</Text>
            </View>
            {selectedPlan === 'trial' && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.darkOrange} />
            )}
          </View>
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
          <View style={styles.planContent}>
            <View style={styles.planLeft}>
              <Text style={styles.planTitle}>Monthly</Text>
              <Text style={styles.planPrice}>$6.49 per month</Text>
            </View>
            {selectedPlan === 'monthly' && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.darkOrange} />
            )}
          </View>
        </TouchableOpacity>

        {/* Yearly Plan */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('yearly')}
          activeOpacity={0.8}
        >
          <View style={styles.planContent}>
            <View style={styles.planLeft}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Yearly</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 40%</Text>
                </View>
              </View>
              <Text style={styles.planPrice}>$45.00 per year</Text>
            </View>
            {selectedPlan === 'yearly' && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.darkOrange} />
            )}
          </View>
        </TouchableOpacity>

        {/* Cancel Your Premium Plan */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelPlan}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel Your Premium Plan</Text>
        </TouchableOpacity>

        {/* Free Experience */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'free' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('free')}
          activeOpacity={0.8}
        >
          <View style={styles.planContent}>
            <View style={styles.planLeft}>
              <Text style={styles.planTitle}>Free Experience</Text>
              <Text style={styles.planSubtitle}>Free</Text>
            </View>
            {selectedPlan === 'free' && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.darkOrange} />
            )}
          </View>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Save Changes Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveChanges}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  sectionTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.md,
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
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLeft: {
    flex: 1,
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
    marginBottom: Spacing.xs,
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
  },
  planPrice: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.medium + 2,
    fontWeight: FontWeights.medium,
    color: Colors.black,
  },
  cancelButton: {
    marginBottom: Spacing.md,
  },
  cancelButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});