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

export default function FirstTetherScreen() {
  const router = useRouter();
  const { onboardingData, submitOnboarding } = useOnboarding();
  const [response, setResponse] = useState('');
  const [responseFocused, setResponseFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const partnerName = onboardingData.partnerFirstName || 'Partner';
  const question = "What's your favourite body part of mine?";
  const timeLeft = '6 h';

  const handleDrawAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement draw another question
    Alert.alert('Coming soon', 'Draw another question feature');
  };

  const handleShareTether = async () => {
    if (!response.trim()) {
      Alert.alert('Required', 'Please type your response');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      // Complete onboarding
      await submitOnboarding();
      
      // TODO: Submit first tether response to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to subscription screen
      router.push('/onboarding/subscription');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to share tether');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout 
    progress={0.98} 
    showBackButton={true}
    rightAction={{
      icon: 'close',
      onPress: () => router.push('/onboarding/subscription'),
    }}
  >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Answer your first Tether</Text>

        {/* Question Card */}
        <View style={styles.questionCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Add Some Spice</Text>
            <Text style={styles.timeLeft}>Time left {timeLeft}</Text>
          </View>

          {/* Question */}
          <Text style={styles.question}>{question}</Text>

          {/* Response Input */}
          <View
            style={[
              styles.responseContainer,
              responseFocused && styles.responseFocused,
            ]}
          >
            <TextInput
              style={styles.responseInput}
              placeholder="Type your response..."
              placeholderTextColor={Colors.darkGrey}
              value={response}
              onChangeText={setResponse}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setResponseFocused(true)}
              onBlur={() => setResponseFocused(false)}
            />
          </View>

          {/* Draw Another Button */}
          <TouchableOpacity
            style={styles.drawAnotherButton}
            onPress={handleDrawAnother}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color={Colors.darkOrange} />
            <Text style={styles.drawAnotherText}>Draw Another</Text>
          </TouchableOpacity>

          {/* Refresh Info */}
          <Text style={styles.refreshInfo}>0 Shared refresh remaining</Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Share Button */}
        <TouchableOpacity
          style={[
            styles.shareButton,
            (!response.trim() || loading) && styles.shareButtonDisabled,
          ]}
          onPress={handleShareTether}
          disabled={!response.trim() || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sharing...' : 'Share My First Tether'}
          </Text>
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
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardHeaderText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    letterSpacing: 0,
  },
  timeLeft: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.darkOrange,
    letterSpacing: 0,
  },
  question: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large + 2,
    lineHeight: 32,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.lg,
    letterSpacing: 0,
  },
  responseContainer: {
    backgroundColor: Colors.inputFill,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  responseFocused: {
    borderColor: Colors.lightOrange,
    backgroundColor: Colors.white,
  },
  responseInput: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    lineHeight: 24,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    letterSpacing: 0,
  },
  drawAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.veryLightOrange,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  drawAnotherText: {
    fontFamily: 'InterTight-Semibold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    letterSpacing: 0,
  },
  refreshInfo: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    letterSpacing: 0,
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
    marginTop: Spacing.lg,
  },
  shareButtonDisabled: {
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