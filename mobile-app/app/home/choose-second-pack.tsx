import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
 
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

interface CategoryOption {
  id: string;
  title: string;
  isUnlocked?: boolean; // Already unlocked packs are disabled
}

const categoryOptions: CategoryOption[] = [
  {
    id: '1',
    title: 'Better Communication',
    isUnlocked: true,
  },
  {
    id: '2',
    title: 'Deeper Connection',
  },
  {
    id: '3',
    title: 'Keeping the Spark Alive',
  },
  {
    id: '4',
    title: 'More Fun Together',
  },
  {
    id: '5',
    title: 'Adventure Together',
  },
  {
    id: '6',
    title: 'Strengthening Trust',
    isUnlocked: true,
  },
  {
    id: '7',
    title: 'Feel More Appreciated',
  },
  {
    id: '8',
    title: 'Add Some Spice',
  },
  {
    id: '9',
    title: 'Healing & Rebuilding',
  },
  {
    id: '10',
    title: 'Long Distance Support',
  },
];

export default function ChoosePacksScreen() {
  const router = useRouter();
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);

  const handleSelectPack = (packId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPackIds(prev => {
      if (prev.includes(packId)) {
        return prev.filter(id => id !== packId);
      } else if (prev.length < 2) {
        return [...prev, packId];
      } else {
        // Replace the first selected item if already 2 selected
        return [prev[1], packId];
      }
    });
  };

  const handleConfirm = async () => {
    if (selectedPackIds.length !== 2) {
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // TODO: Call backend API to unlock packs
    Alert.alert(
      'Success! 🎉',
      'Your selected packs have been unlocked for 14 days!',
      [
        {
          text: 'Start Answering',
          onPress: () => {
            router.back();
            router.back(); // Go back to category packs
          },
        },
      ]
    );
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true} showHeartLogo={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Choose two new packs for{'\n'}you and your partner
          </Text>
          <Text style={styles.subtitle}>
            You'll have unlimited access to the questions inside{'\n'}these two categories for the next 14 days.
          </Text>
        </View>

        {/* Category List */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoryList}>
            {categoryOptions.map((category, index) => {
              const isSelected = selectedPackIds.includes(category.id);
              const isDisabled = category.isUnlocked;

              return (
                <DebouncedButton
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemSelected,
                    isDisabled && styles.categoryItemDisabled,
                    index === 0 && styles.categoryItemFirst,
                  ]}
                  onPress={() => {
                    if (!isDisabled) {
                      handleSelectPack(category.id);
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={isDisabled}
                >
                  <View style={styles.categoryContent}>
                    <Text style={[
                      styles.categoryTitle,
                      isSelected && styles.categoryTitleSelected,
                      isDisabled && styles.categoryTitleDisabled,
                    ]}>
                      {category.title}
                    </Text>
                    
                    {isDisabled && (
                      <Text style={styles.alreadyUnlockedText}>Already Unlocked</Text>
                    )}
                  </View>

                  {isSelected && (
                    <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
                  )}
                </DebouncedButton>
              );
            })}
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.bottomContainer}>
          <DebouncedButton
            style={[
              styles.confirmButton,
              selectedPackIds.length !== 2 && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedPackIds.length !== 2}
            activeOpacity={0.9}
          >
            <Text style={[
              styles.confirmButtonText,
              selectedPackIds.length !== 2 && styles.confirmButtonTextDisabled,
            ]}>
              Unlock Both Packs
            </Text>
          </DebouncedButton>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontFamily: 'InterTight-Bold',
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categoryList: {
    paddingHorizontal: Spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.mediumGrey,
  },
  categoryItemFirst: {
    marginTop: 0,
  },
  categoryItemSelected: {
    borderColor: Colors.darkOrange,
    borderWidth: 2,
  },
  categoryItemDisabled: {
    backgroundColor: Colors.mediumGrey,
    opacity: 0.6,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.medium,
    color: Colors.black,
  },
  categoryTitleSelected: {
    fontFamily: 'InterTight-Bold',
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  categoryTitleDisabled: {
    color: Colors.inputText,
  },
  alreadyUnlockedText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginTop: Spacing.xs,
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
  confirmButton: {
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
  confirmButtonDisabled: {
    backgroundColor: Colors.mediumGrey,
    shadowOpacity: 0.1,
  },
  confirmButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  confirmButtonTextDisabled: {
    color: Colors.inputText,
  },
});
