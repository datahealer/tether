import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
 
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { useAuth } from '@/context/auth_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

type AttributionSource = 
  | 'TikTok'
  | 'Instagram'
  | 'Partner'
  | 'Friend or family'
  | 'App Store'
  | 'Facebook'
  | 'Other';

export default function AttributionScreen() {
  const router = useRouter();
  const { updateField, submitOnboarding } = useOnboarding();
  const { refreshSession } = useAuth();
  const [selectedSource, setSelectedSource] = useState<AttributionSource | null>(null);
  const [otherText, setOtherText] = useState('');
  const [otherTextFocused, setOtherTextFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const sources: AttributionSource[] = [
    'TikTok',
    'Instagram',
    'Partner',
    'Friend or family',
    'App Store',
    'Facebook',
    'Other',
  ];

  const handleSelect = (source: AttributionSource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSource(source);
  };

  const handleFinishSetup = async () => {
    if (!selectedSource) {
      Alert.alert('Required', 'Please select how you heard about Tether');
      return;
    }

    if (selectedSource === 'Other' && !otherText.trim()) {
      Alert.alert('Required', 'Please specify how you heard about us');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    try {
      // Save attribution data to context (will be included in submission)
      const attributionValue = selectedSource === 'Other' ? otherText : selectedSource;
      updateField('emotionalNeeds', [
        ...([] as string[]),
        JSON.stringify({ attribution: attributionValue })
      ]);

      console.log('✅ Attribution saved, submitting all onboarding data...');
      
      // Submit all onboarding data + complete onboarding
      // This calls updateOnboardingData() AND completeOnboarding()
      await submitOnboarding();
      
      // Refresh user session to get updated onboarded flag
      await refreshSession();
      
      console.log('✅ Onboarding completed! User is now onboarded with all data saved.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to waiting screen
      router.push('/home/waiting-for-partner');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout 
      progress={0.95} 
      showBackButton={true}
      rightAction={{
        icon: 'close',
        onPress: () => router.push('/onboarding/first-tether'),
      }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Just before we begin</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          How did you first hear about Tether? It helps us{'\n'}
          understand how couples find us.
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {sources.map((source) => {
            const isSelected = selectedSource === source;
            
            return (
              <DebouncedButton
                key={source}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelect(source)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {source}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
                )}
              </DebouncedButton>
            );
          })}
        </View>

        {/* Other Input */}
        {selectedSource === 'Other' && (
          <View
            style={[
              styles.inputContainer,
              otherTextFocused && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Type your response..."
              placeholderTextColor={Colors.darkGrey}
              value={otherText}
              onChangeText={setOtherText}
              onFocus={() => setOtherTextFocused(true)}
              onBlur={() => setOtherTextFocused(false)}
            />
            <Ionicons name="create-outline" size={20} color={Colors.inputText} />
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Finish Setup Button */}
        <DebouncedButton
          style={[
            styles.finishButton,
            (!selectedSource || loading) && styles.finishButtonDisabled,
          ]}
          onPress={handleFinishSetup}
          disabled={!selectedSource || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Completing Setup...' : 'Finish Setup'}
          </Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputFill,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: Colors.lightOrange,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    letterSpacing: 0,
  },
  finishButton: {
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
  finishButtonDisabled: {
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