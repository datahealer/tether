import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,

  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function WaitingPartnerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const categoryName = (params.categoryName as string) || 'Deeper Connection';
  const question = (params.question as string) || 'What is something small your partner does that makes you smile?';
  const userAnswer = (params.userAnswer as string) || '';
  const timeLeft = '1h';
  const partnerName = 'Sarah'; // TODO: Get from user's couple data

  return (
    <OnboardingLayout 
      showBackButton={true}
      showLogo={true} 
      showHeartLogo={false}
      showChatIcon={false}
      showSettingsIcon={true}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Answer now to reveal the{'\n'}your partners tether...
            </Text>
            <Text style={styles.headerSubtitle}>
              Meet {partnerName} down the line...
            </Text>
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>vv
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Time left</Text>
                <Text style={styles.timeValue}>{timeLeft}</Text>
              </View>
            </View>

            {/* Question */}
            <Text style={styles.questionText}>{question}</Text>

            {/* Response Input */}
            <TextInput
              style={styles.responseInput}
              placeholder="Type your response here..."
              placeholderTextColor={Colors.inputText}
              multiline
              value={userAnswer}
              editable={true}
            />
          </View>

          {/* Blurred Bottom Section */}
          <View style={styles.blurredSection}>
            <BlurView intensity={20} tint="light" style={styles.blurContainer}>
              <View style={styles.blurredContent}>
                <View style={styles.blurredButton}>
                  <Text style={styles.blurredButtonText}>Share My Tether</Text>
                </View>
                
                <View style={styles.completedBadge}>
                  <Text style={styles.categorySmall}>{categoryName}</Text>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'InterTight-Bold',
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryBadge: {
    backgroundColor: Colors.veryLightOrange,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  categoryText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
  timeValue: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  questionText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 30,
  },
  responseInput: {
    backgroundColor: Colors.inputFill,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.mediumGrey,
    padding: Spacing.md,
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  blurredSection: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  blurContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  blurredContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  blurredButton: {
    backgroundColor: 'rgba(255, 126, 61, 0.3)',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  blurredButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  completedBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  categorySmall: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  completedText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  bottomSpacer: {
    height: 40,
  },
});



