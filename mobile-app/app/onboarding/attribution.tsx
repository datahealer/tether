import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

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
  const { updateField } = useOnboarding();
  const [selectedSource, setSelectedSource] = useState<AttributionSource | null>(null);
  const [otherText, setOtherText] = useState('');
  const [otherTextFocused, setOtherTextFocused] = useState(false);

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

    try {
      // Save attribution data
      const attributionValue = selectedSource === 'Other' ? otherText : selectedSource;
      updateField('emotionalNeeds', [
        ...([] as string[]),
        JSON.stringify({ attribution: attributionValue })
      ]);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/onboarding/first-tether');
    } catch (error) {
      console.error('Error saving attribution:', error);
      Alert.alert('Error', 'Failed to save information');
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
              <TouchableOpacity
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
              </TouchableOpacity>
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
        <TouchableOpacity
          style={[
            styles.finishButton,
            !selectedSource && styles.finishButtonDisabled,
          ]}
          onPress={handleFinishSetup}
          disabled={!selectedSource}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Finish Setup</Text>
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