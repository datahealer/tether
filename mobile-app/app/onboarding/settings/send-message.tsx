import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';
export default function SupportMessageScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleShareFeedback = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // TODO: Send message to support team
    Alert.alert(
      'Message Sent!',
      'We\'ve received your message and will get back to you as soon as we can.',
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
            Contact the Tether Support{'\n'}Team for assistance
          </Text>
          <Text style={styles.subtitle}>
            Tell us what's going wrong or feels off and we will help{'\n'}
            you fix it as soon as we can.
          </Text>

          {/* Message Input */}
          <View style={[
            styles.textAreaContainer,
            isFocused && styles.textAreaFocused
          ]}>
            <TextInput
              style={styles.textArea}
              placeholder="Type your message..."
              placeholderTextColor={Colors.darkGrey}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={1000}
            />
          </View>

          {/* Character Count */}
          <Text style={styles.characterCount}>{message.length}/1000</Text>

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: Spacing.xl }} />
        </ScrollView>

        {/* Share Feedback Button - Fixed at bottom */}
        <DebouncedButton
          style={styles.shareButton}
          onPress={handleShareFeedback}
          activeOpacity={0.8}
        >
          <Text style={styles.shareButtonText}>Share Feedback</Text>
        </DebouncedButton>
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
    textAlign:'center'
  },
  subtitle: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
    textAlign:'center'
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
    marginTop: Spacing.xl,
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