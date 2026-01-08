










import { View, Text, StyleSheet,  ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/context/onboarding_context';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import * as Haptics from 'expo-haptics';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

const relationshipOptions = [
  { id: 'dating', label: 'Dating' },
  { id: 'engaged', label: 'Engaged' },
  { id: 'married', label: 'Married' },
  { id: 'other', label: 'Other' },
];

export default function RelationshipStatusScreen() {
  const router = useRouter();
  const { onboardingData, updateField } = useOnboarding();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [otherText, setOtherText] = useState('');

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    if (id !== 'other') {
      updateField('relationshipStatus', id);
      setOtherText('');
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    if (text.trim()) {
      updateField('relationshipStatus', text);
    }
  };

  const handleContinue = () => {
    if (selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/onboarding/relationship-length');
    }
  };

  return (
    <OnboardingLayout 
      showBackButton={true} 
      showLogo={true}
      // progress={1/8}
      showLogoutAvatar={true}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What best describes your{"\n"}relationship right now?</Text>

        <View style={styles.optionsContainer}>
          {relationshipOptions.map((option) => (
            <View key={option.id}>
              <DebouncedButton
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
              </DebouncedButton>
              
              {option.id === 'other' && selected === 'other' && (
                <View style={styles.otherInputContainer}>
                  <TextInput
                    style={styles.otherInput}
                    placeholder="Type your response..."
                    placeholderTextColor={Colors.darkGrey}
                    value={otherText}
                    onChangeText={handleOtherTextChange}
                    autoFocus
                    multiline={false}
                  />
                  <Text style={styles.editIcon}>✎</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <DebouncedButton
          style={[
            styles.primaryButton,
            (!selected || (selected === 'other' && !otherText.trim())) && styles.buttonDisabled
          ]}
          disabled={!selected || (selected === 'other' && !otherText.trim())}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </DebouncedButton>
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
  otherInputContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.mediumGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  otherInput: {
    flex: 1,
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    color: Colors.black,
    padding: 0,
  },
  editIcon: {
    fontSize: 18,
    color: Colors.darkGrey,
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