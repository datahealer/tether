import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { useTetherStats } from '@/hooks/useTetherStats';
import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';
import { getCoupleInfo } from '@/services/onboarding_service';
import { submitAnswer } from '@/services/tether_service';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function WaitingPartnerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const tetherStats = useTetherStats();
  const { push: debouncedPush } = useNavigationDebounce();
  
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerName, setPartnerName] = useState('Partner');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Animation values
  const blurOpacity = useRef(new Animated.Value(1)).current;
  const lockOpacity = useRef(new Animated.Value(1)).current;
  const revealScale = useRef(new Animated.Value(0.9)).current;
  
  const categoryName = (params.categoryName as string) || 'Deeper Connection';
  const question = (params.question as string) || '';
  const questionId = (params.questionId as string) || '';
  const partnerAnswer = (params.partnerAnswer as string) || '';
  const expiresAt = params.expiresAt as string;

  useEffect(() => {
    loadPartnerInfo();
    
    // Calculate time remaining
    if (expiresAt) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(new Date(expiresAt));
        setTimeRemaining(remaining);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  const loadPartnerInfo = async () => {
    try {
      const coupleInfo = await getCoupleInfo();
      if (coupleInfo.partnerName) {
        setPartnerName(coupleInfo.partnerName);
      }
    } catch (error) {
      console.error('Error loading partner info:', error);
    }
  };

  const calculateTimeRemaining = (expiry: Date): string => {
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleSubmitAnswer = async () => {
    if (!response.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Empty Response', 'Please type your response before submitting.');
      return;
    }

    if (!questionId) {
      Alert.alert('Error', 'No active question to answer');
      return;
    }

    try {
      setIsSubmitting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await submitAnswer(questionId, response);

      // Both completed - trigger reveal animation
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Animate the reveal
      setIsRevealed(true);
      
      Animated.parallel([
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(lockOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(revealScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Show success message after animation
      setTimeout(() => {
        Alert.alert(
          'Tether Completed! 🎉',
          `You both answered!\n\nYour partner said: "${result.partnerAnswer || partnerAnswer}"`,
          [
            { 
              text: 'View in History', 
              onPress: () => router.replace('/home/tether-history')
            },
            {
              text: 'Continue',
              onPress: () => router.replace('/home/category-packs'),
              style: 'cancel'
            }
          ]
        );
      }, 1200);

      if (result.milestones && result.milestones.length > 0 && result.milestones[0]?.message) {
        setTimeout(() => {
          Alert.alert('🏆 Milestone Achieved!', result.milestones![0].message, [
            { text: 'Awesome!' },
          ]);
        }, 2000);
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Error submitting answer:', error);
      Alert.alert('Error', error.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout 
      showBackButton={true}
      showLogo={true} 
      showHeartLogo={false}
      showChatIcon={true}
      chatCount={tetherStats.count}
      chatIconActive={tetherStats.isActive}
      onChatPress={() => {
        tetherStats.markAsViewed();
        debouncedPush('/home/tether-history');
      }}
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
              Answer now to reveal{'\n'}your partner's tether...
            </Text>
            <Text style={styles.headerSubtitle}>
              Meet {partnerName} in the middle!
            </Text>
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>
              {timeRemaining && (
                <View style={styles.timeContainer}>
                  <Text style={styles.timeLabel}>Time Left</Text>
                  <Text style={styles.timeValue}>{timeRemaining}</Text>
                </View>
              )}
            </View>

            {/* Question */}
            <Text style={styles.questionText}>{question}</Text>

            {/* Partner's Blurred Answer */}
            <View style={styles.answerSection}>
              <View style={styles.answerLabel}>
                <Text style={styles.answerLabelText}>{partnerName}'s Answer</Text>
              </View>
              
              <Animated.View 
                style={[
                  styles.blurredAnswerContainer,
                  { transform: [{ scale: revealScale }] }
                ]}
              >
                {!isRevealed ? (
                  <>
                    <BlurView intensity={10} tint="light" style={styles.blurredAnswer}>
                      <Text style={styles.partnerAnswerText}>{partnerAnswer}</Text>
                    </BlurView>
                    <Animated.View 
                      style={[
                        styles.lockOverlay,
                        { opacity: lockOpacity }
                      ]}
                    >
                      <Ionicons name="lock-closed" size={32} color={Colors.darkOrange} />
                      <Text style={styles.lockText}>Answer to reveal</Text>
                    </Animated.View>
                  </>
                ) : (
                  <View style={styles.revealedAnswer}>
                    <Text style={styles.partnerAnswerText}>{partnerAnswer}</Text>
                    <View style={styles.revealedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.successGreen} />
                      <Text style={styles.revealedText}>Revealed!</Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            </View>

            {/* Your Response Input */}
            <View style={styles.answerSection}>
              <View style={styles.answerLabel}>
                <Text style={styles.answerLabelText}>Your Answer</Text>
              </View>
              <TextInput
                style={styles.responseInput}
                placeholder="Type your response here..."
                placeholderTextColor={Colors.inputText}
                multiline
                value={response}
                onChangeText={setResponse}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.darkOrange} />
            <Text style={styles.infoBannerText}>
              {partnerName} has already answered! Submit your response to unlock their answer and complete this tether together.
            </Text>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.bottomContainer}>
          <DebouncedButton
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitAnswer}
            disabled={isSubmitting || !response.trim()}
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Submit & Reveal Answer</Text>
            )}
          </DebouncedButton>
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
  scrollContent: {
    paddingBottom: 120,
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
    marginBottom: Spacing.xl,
    lineHeight: 30,
  },
  answerSection: {
    marginBottom: Spacing.lg,
  },
  answerLabel: {
    backgroundColor: Colors.veryLightOrange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  answerLabelText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  blurredAnswerContainer: {
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  blurredAnswer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.mediumGrey,
  },
  partnerAnswerText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.medium,
    color: Colors.black,
    lineHeight: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  lockText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    marginTop: Spacing.xs,
  },
  revealedAnswer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.successGreen,
    backgroundColor: Colors.white,
  },
  revealedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    alignSelf: 'center',
  },
  revealedText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.successGreen,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightOrange,
  },
  infoBannerText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.mediumGrey,
  },
  submitButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.mediumGrey,
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
});



