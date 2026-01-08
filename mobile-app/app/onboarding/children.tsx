import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,

  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

type ChildrenAnswer = 'Yes' | 'No';

export default function ChildrenScreen() {
  const router = useRouter();
  const { updateField } = useOnboarding();
  const [selectedAnswer, setSelectedAnswer] = useState<ChildrenAnswer | null>(null);

  const answers: ChildrenAnswer[] = ['Yes', 'No'];

  const handleSelect = (answer: ChildrenAnswer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAnswer(answer);
  };

  const handleContinue = async () => {
  if (!selectedAnswer) {
    Alert.alert('Required', 'Please select an answer');
    return;
  }

  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  try {
    // Now we can use hasChildren field directly
    updateField('hasChildren', selectedAnswer === 'Yes');

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/onboarding/goals');
  } catch (error) {
    console.error('Error saving children info:', error);
    Alert.alert('Error', 'Failed to save information');
  }
};

  return (
    <OnboardingLayout progress={0.63} showBackButton={true} showLogoutAvatar={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Do either of you have kids?</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Be it together or from previous relationships.
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {answers.map((answer) => {
            const isSelected = selectedAnswer === answer;
            
            return (
              <DebouncedButton
                key={answer}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelect(answer)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {answer}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
                )}
              </DebouncedButton>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xxl * 2 }} />

        {/* Continue Button */}
        <DebouncedButton
          style={[
            styles.continueButton,
            !selectedAnswer && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedAnswer}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
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
    marginBottom: Spacing.xl,
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