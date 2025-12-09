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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

type LivingSituation = 'Together' | 'Apart but nearby' | 'Long distance';

export default function LivingSituationScreen() {
  const router = useRouter();
  const { updateField } = useOnboarding();
  const [selectedSituation, setSelectedSituation] = useState<LivingSituation | null>(null);

  const situations: LivingSituation[] = [
    'Together',
    'Apart but nearby',
    'Long distance',
  ];

  const handleSelect = (situation: LivingSituation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSituation(situation);
  };

  const handleContinue = async () => {
    if (!selectedSituation) {
      Alert.alert('Required', 'Please select your living situation');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Store as array to match backend schema (livingType is string[])
      updateField('livingType', [selectedSituation]);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/onboarding/children');
    } catch (error) {
      console.error('Error saving living situation:', error);
      Alert.alert('Error', 'Failed to save living situation');
    }
  };

  return (
    <OnboardingLayout progress={0.56} showBackButton={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Tell us how you live</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {situations.map((situation) => {
            const isSelected = selectedSituation === situation;
            
            return (
              <TouchableOpacity
                key={situation}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelect(situation)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {situation}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xxl * 2 }} />

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedSituation && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedSituation}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
    paddingBottom: Spacing.xl,
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.xl + Spacing.md,
    letterSpacing: 0,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.veryLightOrange,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.darkOrange,
  },
  optionText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    letterSpacing: 0,
  },
  optionTextSelected: {
    fontFamily: 'SFProDisplay-Semibold',
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
  },
  continueButton: {
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
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});