import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';

interface PricingOption {
  id: string;
  title: string;
  duration: string;
  price: string;
  pricePerDay?: string;
  isPopular?: boolean;
  savings?: string;
}

const pricingOptions: PricingOption[] = [
  {
    id: '1',
    title: 'Unlock 1 Pack for 7 days',
    duration: '7 days',
    price: '$2.49',
    pricePerDay: '$0.36/day',
  },
  {
    id: '2',
    title: 'Unlock 2 Packs for 14 days',
    duration: '14 days',
    price: '$3.49',
    pricePerDay: '$0.25/day',
    isPopular: true,
    savings: 'Save 30%',
  },
];

export default function UnlockPackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState('2');

  const handleSelectOption = (optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(optionId);
  };

  const handleUnlockPack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedOption === '1') {
      // Simulate unlock single pack
      Alert.alert('Success', `Unlocked ${params.categoryTitle} for 7 days!`);
      router.back();
    } else {
      // Navigate to choose packs for two
      router.push('/home/choose-second-pack');
    }
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={false} showHeartLogo={true}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="lock-open" size={48} color={Colors.darkOrange} />
          <Text style={styles.title}>Unlock more questions{'\n'}across new categories</Text>
          <Text style={styles.subtitle}>
            Gain access to all the questions inside a{'\n'}locked Category Pack with Premium.
          </Text>
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
              {option.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.pricingContent}>
                <View style={styles.pricingLeft}>
                  <Text style={styles.pricingTitle}>{option.title}</Text>
                  {option.pricePerDay && (
                    <Text style={styles.pricingPerDay}>{option.pricePerDay}</Text>
                  )}
                </View>
                
                <View style={styles.pricingRight}>
                  <Text style={styles.pricingPrice}>{option.price}</Text>
                  {option.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{option.savings}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Radio button */}
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  selectedOption === option.id && styles.radioOuterSelected
                ]}>
                  {selectedOption === option.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlockPack}
          activeOpacity={0.9}
        >
          <Text style={styles.unlockButtonText}>Unlock Pack</Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: 'InterTight-Bold',
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 22,
  },
  pricingContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  pricingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pricingCardSelected: {
    borderColor: Colors.darkOrange,
    shadowOpacity: 0.15,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.md,
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  pricingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  pricingLeft: {
    flex: 1,
  },
  pricingTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: 4,
  },
  pricingPerDay: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
  pricingRight: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  pricingPrice: {
    fontFamily: 'InterTight-Bold',
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  savingsBadge: {
    backgroundColor: Colors.veryLightOrange,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  savingsText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: 10,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
  radioContainer: {
    alignItems: 'flex-end',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.mediumGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.darkOrange,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.darkOrange,
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
  unlockButton: {
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
  unlockButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
});


