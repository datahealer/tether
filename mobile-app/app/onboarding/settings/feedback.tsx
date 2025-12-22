import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleShareFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Required', 'Please enter your feedback before sharing');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // TODO: Send feedback to backend
    Alert.alert(
      'Thank You!',
      'Your feedback has been shared with the Tether team. We appreciate your input!',
      [
        {
          text: 'OK',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.heading}>
            Help us strengthen the{'\n'}Tether Experience
          </Text>
          <Text style={styles.subtitle}>
            Share what feels good, what feels off, or what would{'\n'}
            make Tether better for you and your partner.
          </Text>

          {/* Feedback Input */}
          <View style={[
            styles.textAreaContainer,
            isFocused && styles.textAreaFocused
          ]}>
            <TextInput
              style={styles.textArea}
              placeholder="Share your thoughts..."
              placeholderTextColor={Colors.darkGrey}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={1000}
            />
          </View>

          {/* Character Count */}
          <Text style={styles.characterCount}>{feedback.length}/1000</Text>

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: Spacing.xl }} />
        </ScrollView>

        {/* Share Feedback Button - Fixed at bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.shareButton,
              !feedback.trim() && styles.shareButtonDisabled
            ]}
            onPress={handleShareFeedback}
            activeOpacity={0.8}
            disabled={!feedback.trim()}
          >
            <Text style={styles.shareButtonText}>Share Feedback</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  textAreaContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minHeight: 200,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textAreaFocused: {
    borderColor: Colors.darkOrange,
  },
  textArea: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    flex: 1,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  characterCount: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small,
    color: Colors.darkGrey,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  bottomContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.cream,
  },
  shareButton: {
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
  shareButtonDisabled: {
    backgroundColor: Colors.mediumGrey,
    opacity: 0.5,
  },
  shareButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});