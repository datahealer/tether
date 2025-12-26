

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/context/onboarding_context';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import * as Haptics from 'expo-haptics';

const durationOptions = [
  { id: 'just-started', label: 'Just started' },
  { id: '6-12-months', label: '6 to 12 months' },
  { id: '1-3-years', label: '1 to 3 years' },
  { id: '3-5-years', label: '3 to 5 years' },
  { id: '5-10-years', label: '5 to 10 years' },
  { id: '10-plus', label: '10+ years' },
];

export default function RelationshipDurationScreen() {
  const router = useRouter();
  const { onboardingData, updateField } = useOnboarding();
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    updateField('relationshipDuration', id);
  };

  const handleContinue = () => {
    if (selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/onboarding/living-situation');
    }
  };

  return (
    <OnboardingLayout 
      showBackButton={true} 
      showLogo={true}
      // progress={2/8}
      showLogoutAvatar={true}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How long have you two{"\n"}been together?</Text>

        <View style={styles.optionsContainer}>
          {durationOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                selected === option.id && styles.optionItemSelected,
              ]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionLabel,
                selected === option.id && styles.optionLabelSelected
              ]}>
                {option.label}
              </Text>
              {selected === option.id && (
                <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !selected && styles.buttonDisabled
          ]}
          disabled={!selected}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    paddingVertical: 20,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    borderColor: Colors.darkOrange,
  },
  optionLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.black,
  },
  optionLabelSelected: {
    color: Colors.darkOrange,
    fontWeight: FontWeights.medium,
  },
  bottomContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
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
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});