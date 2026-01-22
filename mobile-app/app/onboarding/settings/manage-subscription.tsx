import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import { useAuth } from '@/context/auth_context';
import {
  getSubscriptionStatus,
  cancelSubscription,
  getAvailablePlans,
  initializeRevenueCat,
  getSubscriptionPackages,
  purchaseSubscription,
  checkRevenueCatSubscription,
} from '../../../services/subscription';
import type { PurchasesPackage } from 'react-native-purchases';

type PlanType = 'trial' | 'monthly' | 'yearly' | 'free';

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('trial');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const plans = getAvailablePlans();

  useEffect(() => {
    initializeAndLoadStatus();
  }, []);

  const initializeAndLoadStatus = async () => {
    if (!user?.id) return;

    try {
      // Initialize RevenueCat with optimistic error handling
      const initialized = await initializeRevenueCat(user.id);
      
      if (initialized) {
        const availablePackages = await getSubscriptionPackages();
        setPackages(availablePackages);
        setIsInitialized(true);
        console.log('✅ RevenueCat ready for manage-subscription');
      } else {
        console.warn('⚠️ RevenueCat not available - limited subscription management');
        setIsInitialized(false);
      }

      // Always try to load subscription status from backend
      await loadSubscriptionStatus();
    } catch (error: any) {
      console.error('Failed to initialize:', error?.message || error);
      setIsInitialized(false);
      
      // Still load backend status even if RevenueCat fails
      try {
        await loadSubscriptionStatus();
      } catch (statusError) {
        console.error('Failed to load subscription status:', statusError);
      }
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      // Check RevenueCat status first (if initialized)
      if (isInitialized) {
        const rcStatus = await checkRevenueCatSubscription();
        
        if (rcStatus.isPremium && !rcStatus.error) {
          setCurrentSubscription({
            isSubscribed: true,
            planType: rcStatus.productId?.includes('yearly') ? 'yearly' : 'monthly',
            expiresAt: rcStatus.expirationDate,
            autoRenew: true,
          });
          
          setSelectedPlan(rcStatus.productId?.includes('yearly') ? 'yearly' : 'monthly');
          return;
        }
      }
      
      // Fallback to backend status
      const status = await getSubscriptionStatus();
      setCurrentSubscription(status);
      
      if (status.isSubscribed && status.planType) {
        setSelectedPlan(status.planType as PlanType);
      } else {
        setSelectedPlan('free');
      }
    } catch (error: any) {
      console.error('Failed to load subscription status:', error?.message || error);
      // Set safe defaults
      setCurrentSubscription({ isSubscribed: false });
      setSelectedPlan('free');
    }
  };

  const handleSelectPlan = async (plan: PlanType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  const handleChangePlan = async () => {
    if (!isInitialized && selectedPlan !== 'free') {
      Alert.alert(
        'RevenueCat Not Available', 
        'In-app purchases are not currently available. Please try again later or contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (selectedPlan === 'free') {
      // Show confirmation modal for cancellation
      Alert.alert(
        'Switch to Free Experience?',
        'You will keep Premium access until the end of your current billing period. If you cancel during the 7-day trial you will not be charged.',
        [
          { text: 'Keep Premium', style: 'cancel' },
          {
            text: 'Confirm Cancellation',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                
                // Cancel subscription on backend
                const result = await cancelSubscription();
                console.log('Cancellation result:', result);
                
                // Reload subscription status to get updated state
                await loadSubscriptionStatus();
                
                // Update user context based on new subscription state
                if (user) {
                  const updatedStatus = await getSubscriptionStatus();
                  await signIn({
                    ...user,
                    subscribed: updatedStatus.isSubscribed,
                  });
                  console.log('Updated user subscribed status:', updatedStatus.isSubscribed);
                }
                
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', result.message || 'Your subscription has been cancelled.');
                router.back();
              } catch (error: any) {
                console.error('Cancellation error:', error);
                Alert.alert('Error', error.message || 'Failed to cancel subscription');
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Plan upgrade/change via RevenueCat
      try {
        setIsLoading(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Find the package for selected plan
        const packageToPurchase = packages.find(pkg => {
          const identifier = pkg.product.identifier;
          return selectedPlan === 'yearly' 
            ? identifier.includes('yearly') 
            : selectedPlan === 'monthly'
              ? identifier.includes('monthly')
              : identifier.includes('trial');
        });

        if (packageToPurchase) {
          console.log('📦 Changing plan to:', packageToPurchase.product.identifier);
          
          const result = await purchaseSubscription(packageToPurchase);
          
          // Handle optimistic error responses
          if (result.error || !result.success) {
            throw new Error(result.message || 'Failed to change subscription');
          }
          
          if (result.cancelled) {
            // User cancelled - exit silently
            return;
          }
          
          if (result.success && result.isPremium) {
            // Update user context
            if (user) {
              await signIn({
                ...user,
                subscribed: true,
              });
            }
            
            await loadSubscriptionStatus();
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            Alert.alert(
              'Success!',
              'Your subscription has been updated.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        }

      } catch (error: any) {
        console.error('Plan change error:', error);
        
        if (error.message === 'Purchase cancelled') {
          return; // User cancelled - no alert
        }
        
        Alert.alert('Error', error.message || 'Failed to change plan');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsLoading(false);
      }
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

        {/* Current Subscription Status */}
        {currentSubscription && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusTitle}>
              {currentSubscription.isSubscribed ? '✅ Active Subscription' : '⚠️ No Active Subscription'}
            </Text>
            {currentSubscription.isSubscribed && (
              <>
                <Text style={styles.statusText}>
                  Plan: {currentSubscription.planType?.toUpperCase()}
                </Text>
                {currentSubscription.expiresAt && (
                  <Text style={styles.statusText}>
                    Expires: {new Date(currentSubscription.expiresAt).toLocaleDateString()}
                  </Text>
                )}
                <Text style={styles.statusText}>
                  Auto-renew: {currentSubscription.autoRenew ? 'Yes' : 'No'}
                </Text>
              </>
            )}
          </View>
        )}

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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
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
        {currentSubscription?.isSubscribed && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelPlan}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel Your Premium Plan</Text>
          </TouchableOpacity>
        )}

        {/* Free Experience */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'free' && styles.planCardSelected,
          ]}
          onPress={() => handleSelectPlan('free')}
          activeOpacity={0.8}
          disabled={isLoading}
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
          style={[
            styles.saveButton,
            isLoading && styles.saveButtonDisabled,
          ]}
          onPress={handleChangePlan}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 56,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  statusBanner: {
    backgroundColor: Colors.veryLightOrange,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.darkOrange,
  },
  statusTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    marginBottom: Spacing.sm,
  },
  statusText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small + 2,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
});