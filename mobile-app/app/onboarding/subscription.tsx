// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   DebouncedButton,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import * as Haptics from 'expo-haptics';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

// type PlanType = 'yearly' | 'monthly' | 'trial';

// interface Plan {
//   id: PlanType;
//   name: string;
//   price: string;
//   billing: string;
//   badge?: string;
//   savings?: string;
// }

// export default function SubscriptionScreen() {
//   const router = useRouter();
//   const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

//   const plans: Plan[] = [
//     {
//       id: 'yearly',
//       name: 'Yearly',
//       price: '$3.75 per month',
//       billing: 'Billed annually at $44.99',
//       badge: 'Most Popular',
//       savings: 'Save 42%',
//     },
//     {
//       id: 'monthly',
//       name: 'Monthly',
//       price: '$6.49 per month',
//       billing: 'Billed monthly',
//     },
//     {
//       id: 'trial',
//       name: '7 Days of Premium',
//       price: 'Free',
//       billing: '',
//     },
//   ];

//   const handleSelectPlan = (planId: PlanType) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setSelectedPlan(planId);
//   };

//   const handleStartTrial = async () => {
//       await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       router.push('/home/category-packs');
//     };

//   //   try {
//   //     // TODO: Integrate with in-app purchases
//   //     await new Promise(resolve => setTimeout(resolve, 1000));
      
//   //     await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
//   //     // Navigate to home or completion screen
//   //     router.push('/home/category-packs');
//   //   } catch (error: any) {
//   //     await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//   //     Alert.alert('Error', error.message || 'Failed to start trial');
//   //   }
//   // };

//   return (
//     <OnboardingLayout progress={1.0} showBackButton={true} showLogoutAvatar={true}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Heading */}
//         <Text style={styles.heading}>Pick your Plan</Text>

//         {/* Subtitle */}
//         <Text style={styles.subtitle}>
//           Premium gives you access to every category,{'\n'}
//           more question refreshes and exclusive features.
//         </Text>

//         {/* Subscription Info */}
//         <Text style={styles.subscriptionInfo}>
//           One Subscription for two partners.
//         </Text>

//         {/* Plans */}
//         <View style={styles.plansContainer}>
//           {plans.map((plan) => {
//             const isSelected = selectedPlan === plan.id;
//             const isTrial = plan.id === 'trial';
            
//             return (
//               <DebouncedButton
//                 key={plan.id}
//                 style={[
//                   styles.planCard,
//                   isSelected && styles.planCardSelected,
//                   isTrial && styles.trialCard,
//                 ]}
//                 onPress={() => handleSelectPlan(plan.id)}
//                 activeOpacity={0.8}
//               >
//                 {/* Badge */}
//                 {plan.badge && (
//                   <View style={styles.badgeContainer}>
//                     <Text style={styles.badgeText}>{plan.badge}</Text>
//                     {plan.savings && (
//                       <View style={styles.savingsBadge}>
//                         <Text style={styles.savingsText}>{plan.savings}</Text>
//                       </View>
//                     )}
//                   </View>
//                 )}

//                 {/* Plan Name */}
//                 <Text style={[
//                   styles.planName,
//                   isTrial && styles.trialName,
//                 ]}>
//                   {plan.name}
//                 </Text>

//                 {/* Plan Price */}
//                 <Text style={[
//                   styles.planPrice,
//                   isTrial && styles.trialPrice,
//                 ]}>
//                   {plan.price}
//                 </Text>

//                 {/* Plan Billing */}
//                 {plan.billing && (
//                   <Text style={[
//                     styles.planBilling,
//                     isTrial && styles.trialBilling,
//                   ]}>
//                     {plan.billing}
//                   </Text>
//                 )}
//               </DebouncedButton>
//             );
//           })}
//         </View>

//         {/* Spacer */}
//         <View style={{ flex: 1, minHeight: Spacing.lg }} />

//         {/* Start Trial Button */}
//         <DebouncedButton
//           style={styles.startButton}
//           onPress={handleStartTrial}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.buttonText}>Start 7 Days Of Free Premium</Text>
//         </DebouncedButton>

//         {/* Trial Info */}
//         <Text style={styles.trialInfo}>
//           Your 7-day Premium Trial will automatically convert to a Monthly{'\n'}
//           Subscription unless cancelled at least <Text style={styles.highlight}>24 hours</Text> before renewal.
//         </Text>
//       </ScrollView>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   scrollView: {
//     flex: 1,
//   },
//   content: {
//     flexGrow: 1,
//     paddingBottom: Spacing.xl,
//   },
//   heading: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.heading + 4,
//     lineHeight: 40,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     marginBottom: Spacing.sm,
//     letterSpacing: 0,
//   },
//   subtitle: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.medium,
//     lineHeight: 20,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     marginBottom: Spacing.md,
//     letterSpacing: 0,
//   },
//   subscriptionInfo: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.medium,
//     lineHeight: 20,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     marginBottom: Spacing.xl,
//     letterSpacing: 0,
//   },
//   plansContainer: {
//     gap: Spacing.md,
//   },
//   planCard: {
//     backgroundColor: Colors.veryLightOrange,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.lg,
//     borderWidth: 2,
//     borderColor: 'transparent',
//     position: 'relative',
//   },
//   planCardSelected: {
//     backgroundColor: Colors.white,
//     borderColor: Colors.darkOrange,
//   },
//   trialCard: {
//     backgroundColor: Colors.mediumGrey,
//   },
//   badgeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     marginBottom: Spacing.sm,
//   },
//   badgeText: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.bold,
//     color: Colors.darkOrange,
//     letterSpacing: 0,
//   },
//   savingsBadge: {
//     backgroundColor: Colors.darkOrange,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: BorderRadius.sm,
//   },
//   savingsText: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.small - 2,
//     fontWeight: FontWeights.bold,
//     color: Colors.white,
//     letterSpacing: 0,
//   },
//   planName: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.large + 2,
//     lineHeight: 28,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     marginBottom: 4,
//     letterSpacing: 0,
//   },
//   trialName: {
//     fontSize: FontSizes.large,
//   },
//   planPrice: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.large,
//     lineHeight: 24,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//     letterSpacing: 0,
//   },
//   trialPrice: {
//     color: Colors.darkOrange,
//   },
//   planBilling: {
//     fontFamily: 'SFProDisplay-Regular',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     marginTop: 4,
//     letterSpacing: 0,
//   },
//   trialBilling: {
//     color: Colors.inputText,
//   },
//   startButton: {
//     backgroundColor: Colors.darkOrange,
//     borderRadius: BorderRadius.xl,
//     paddingVertical: 18,
//     alignItems: 'center',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//     marginTop: Spacing.lg,
//     marginBottom: Spacing.md,
//   },
//   buttonText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.buttonLarge,
//     lineHeight: 28,
//     fontWeight: FontWeights.semibold,
//     color: Colors.white,
//     letterSpacing: 0.45,
//   },
//   trialInfo: {
//     fontFamily: 'SFProDisplay-Regular',
//     fontSize: FontSizes.small - 1,
//     lineHeight: 16,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     textAlign: 'center',
//     letterSpacing: 0,
//   },
//   highlight: {
//     fontFamily: 'SFProDisplay-Bold',
//     fontWeight: FontWeights.bold,
//     color: Colors.darkOrange,
//   },
// });
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import { useAuth } from '@/context/auth_context';
import {
  initializeRevenueCat,
  getSubscriptionPackages,
  purchaseSubscription,
  startTrial,
  getAvailablePlans,
  checkRevenueCatSubscription,
} from '../../services/subscription';
import type { PurchasesPackage } from 'react-native-purchases';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

type PlanType = 'yearly' | 'monthly' | 'trial';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const plans = getAvailablePlans();

  // Initialize RevenueCat on mount
  useEffect(() => {
    initializeRevenueCatSDK();
  }, []);

  const initializeRevenueCatSDK = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Initializing RevenueCat...');
      const initialized = await initializeRevenueCat(user.id);
      
      if (!initialized) {
        console.warn('⚠️ RevenueCat initialization failed - using fallback mode');
        setIsInitialized(false);
        // Don't show error - allow trial flow to work
        return;
      }
      
      // Load available packages
      const availablePackages = await getSubscriptionPackages();
      setPackages(availablePackages);
      setIsInitialized(true);
      
      console.log('✅ RevenueCat initialized with', availablePackages.length, 'packages');
    } catch (error: any) {
      console.error('Failed to initialize RevenueCat:', error?.message || error);
      setIsInitialized(false);
      
      // Don't block the user - they can still use trial mode
      console.log('ℹ️ Continuing without RevenueCat - trial mode available');
    }
  };

  const handleSelectPlan = (planId: PlanType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(planId);
  };

  const handleContinueAsFree = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('✅ User chose to continue with free tier (2 categories)');
      
      // Navigate directly to category-packs
      // Backend already has user's entitlement set to FREE tier by default
      // Category selection algorithm will show their 2 best-fit categories
      router.replace('/home/category-packs');
      
    } catch (error: any) {
      console.error('❌ Error navigating to free tier:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleStartTrial = async () => {
    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('🚀 Starting trial...');
      
      const response = await startTrial();
      
      // Update user context with new subscription status
      if (user) {
        await signIn({
          ...user,
          subscribed: true,
        });
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      console.log('✅ Trial started successfully');
      
      // Navigate to category packs
      router.replace('/home/category-packs');
      
    } catch (error: any) {
      console.error('❌ Trial start error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Error',
        error.message || 'Failed to start trial. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (selectedPlan === 'trial') {
      handleStartTrial();
      return;
    }

    if (!isInitialized) {
      Alert.alert(
        'RevenueCat Not Available',
        'In-app purchases are not available right now. Would you like to start with a free trial instead?',
        [
          {
            text: 'Start Trial',
            onPress: handleStartTrial,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log(`🚀 Subscribing to ${selectedPlan} plan...`);
      
      // Find the corresponding package from RevenueCat
      const packageToPurchase = packages.find(pkg => {
        const identifier = pkg.product.identifier.toLowerCase();
        return selectedPlan === 'yearly'
          ? identifier.includes('annual') || identifier.includes('yearly')
          : identifier.includes('monthly');
      });

      if (!packageToPurchase) {
        throw new Error(`No ${selectedPlan} package available. Please contact support.`);
      }

      console.log('📦 Purchasing package:', packageToPurchase.product.identifier);
      
      // Purchase through App Store/Play Store via RevenueCat SDK
      const result = await purchaseSubscription(packageToPurchase);
      
      // Handle error responses from optimistic error handling
      if (result.error || !result.success) {
        throw new Error(result.message || 'Purchase failed');
      }
      
      if (result.cancelled) {
        // User cancelled - exit silently
        return;
      }
      
      if (result.success && result.isPremium) {
        console.log('✅ Purchase successful!');
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        if (result.backendSynced) {
          // Backend updated successfully - safe to navigate
          console.log('✅ Backend synced - navigating to category packs');
          
          // Update user context with synced data
          if (user) {
            await signIn({
              ...user,
              subscribed: true,
            });
          }
          
          Alert.alert(
            'Welcome to Premium! 🎉',
            'You now have access to all premium features!',
            [
              {
                text: 'Get Started',
                onPress: () => router.replace('/home/category-packs'),
              },
            ]
          );
        } else {
          // Purchase succeeded but backend sync timed out
          console.log('⚠️ Backend sync pending - showing delayed confirmation');
          
          Alert.alert(
            'Purchase Successful! ⏳',
            'Your purchase is complete! It may take a few moments for all features to unlock. Please check back shortly.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Still navigate - categories will unlock when webhook completes
                  if (user) {
                    signIn({ ...user, subscribed: true });
                  }
                  router.replace('/home/category-packs');
                },
              },
            ]
          );
        }
      }

    } catch (error: any) {
      console.error('❌ Subscribe error:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Check if user cancelled
      if (error.message === 'Purchase cancelled') {
        // User cancelled - no alert needed
        return;
      }
      
      Alert.alert(
        'Purchase Failed',
        error.message || 'Failed to complete purchase. Please try again.',
        [
          {
            text: 'Try Trial Instead',
            onPress: handleStartTrial,
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout progress={1.0} showBackButton={true} showLogoutAvatar={true}>
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
              <DebouncedButton
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  isTrial && styles.trialCard,
                ]}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.8}
                disabled={isLoading}
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
              </DebouncedButton>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.lg }} />

        {/* Start Button */}
        <DebouncedButton
          style={[
            styles.startButton,
            isLoading && styles.startButtonDisabled,
          ]}
          onPress={selectedPlan === 'trial' ? handleStartTrial : handleSubscribe}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {selectedPlan === 'trial' 
                ? 'Start 7 Days Of Free Premium' 
                : `Subscribe to ${plans.find(p => p.id === selectedPlan)?.name}`
              }
            </Text>
          )}
        </DebouncedButton>

        {/* Trial Info */}
        <Text style={styles.trialInfo}>
          Your 7-day Premium Trial will automatically convert to a Monthly{'\n'}
          Subscription unless cancelled at least <Text style={styles.highlight}>24 hours</Text> before renewal.
        </Text>

        {/* Continue as Free Button */}
        <DebouncedButton
          style={styles.continueFreeButton}
          onPress={handleContinueAsFree}
          activeOpacity={0.8}
        >
          <Text style={styles.continueFreeText}>Continue with 2 Free Categories</Text>
        </DebouncedButton>
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
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    minHeight: 56,
  },
  startButtonDisabled: {
    opacity: 0.6,
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
  continueFreeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.inputText,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    minHeight: 52,
  },
  continueFreeText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.inputText,
    letterSpacing: 0.3,
  },
});