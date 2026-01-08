import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useTetherStats } from '@/hooks/useTetherStats';
import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';

interface PricingOption {
  id: string;
  refreshes: number;
  price: string;
  popular?: boolean;
}

const pricingOptions: PricingOption[] = [
  {
    id: '3',
    refreshes: 3,
    price: '$1.29',
  },
  {
    id: '6',
    refreshes: 6,
    price: '$2.79',
    popular: true,
  },
  {
    id: '10',
    refreshes: 10,
    price: '$3.99',
  },
];

export default function DrawLockedUpsellScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('6');
  const tetherStats = useTetherStats();
  const { push: debouncedPush} = useNavigationDebounce();

  const handleSelectOption = async (optionId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(optionId);
  };

  const handlePurchase = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TODO: Implement actual payment processing
    console.log('Purchase option:', selectedOption);
    // For now, just go back
    router.back();
  };

  return (
    <OnboardingLayout 
      showBackButton={true}
      showLogo={false} 
      showHeartLogo={false}
      showChatIcon={true}
      chatCount={tetherStats.count}
      chatIconActive={tetherStats.isActive}
      onChatPress={() => {
        tetherStats.markAsViewed();
        debouncedPush('/home/tether-history');
      }}
      showSettingsIcon={true}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            You're all out of{'\n'}shared refreshes
          </Text>
          <Text style={styles.headerSubtitle}>
            Buy more to draw new questions
          </Text>
        </View>

        {/* Lock Icon */}
        <View style={styles.lockIconContainer}>
          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed" size={32} color={Colors.darkOrange} />
          </View>
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          {pricingOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.pricingCard,
                selectedOption === option.id && styles.pricingCardSelected,
              ]}
              onPress={() => handleSelectOption(option.id)}
              activeOpacity={0.8}
            >
              {option.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.pricingContent}>
                <View style={styles.pricingLeft}>
                  <View style={styles.radioButton}>
                    {selectedOption === option.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.pricingText}>
                    {option.refreshes} x Shared question refreshes
                  </Text>
                </View>
                
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{option.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.infoHighlight}>Refreshes</Text>
            {' are shared between you both'}
          </Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
          activeOpacity={0.9}
        >
          <Text style={styles.purchaseButtonText}>
            Unlock More Questions
          </Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'InterTight-Bold',
    fontSize: 28,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
  },
  lockIconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.veryLightOrange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.lightOrange,
  },
  pricingContainer: {
    marginHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  pricingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.mediumGrey,
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: Colors.darkOrange,
    borderWidth: 2,
    shadowColor: Colors.darkOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -55,
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  popularBadgeText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  pricingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.darkOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.darkOrange,
  },
  pricingText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.black,
    flex: 1,
  },
  priceTag: {
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  priceText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.lightOrange,
  },
  infoText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    textAlign: 'center',
  },
  infoHighlight: {
    fontFamily: 'InterTight-Bold',
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  bottomSpacer: {
    height: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.mediumGrey,
  },
  purchaseButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  purchaseButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
});

