import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
 
  ScrollView,
  Alert,
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
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function QuestionExpiredScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const tetherStats = useTetherStats();
  const {push: debouncedPush } = useNavigationDebounce();
  
  const [isRevealed, setIsRevealed] = useState(false);
  
  const categoryName = (params.categoryName as string) || 'Deeper Connection';
  const question = (params.question as string) || 'What is something small your partner does that makes you smile?';
  const partnerAnswer = (params.partnerAnswer as string) || 'He sucks my toes.';
  const partnerName = 'Sarah'; // TODO: Get from user's couple data
  const expiredDate = 'Wednesday, 12th January 2025';

  const handleRevealAnswer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRevealed(true);
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate back to category packs or tether history
    router.back();
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.expiredBadge}>
            <Ionicons name="time-outline" size={20} color={Colors.darkOrange} />
            <Text style={styles.expiredText}>Question Expired</Text>
          </View>
          
          <Text style={styles.headerTitle}>
            Time ran out, but {partnerName}{'\n'}answered this one...
          </Text>
          <Text style={styles.headerSubtitle}>
            See what {partnerName} said below
          </Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          {/* Category Header */}
          <View style={styles.categoryHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryName}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Expired</Text>
            </View>
          </View>

          {/* Question */}
          <Text style={styles.questionText}>{question}</Text>

          {/* Your Answer Section */}
          <View style={styles.answerSection}>
            <View style={styles.answerLabel}>
              <Text style={styles.answerLabelText}>Your answer</Text>
            </View>
            <View style={styles.missedAnswerBox}>
              <Ionicons name="close-circle" size={24} color={Colors.inputText} />
              <Text style={styles.missedAnswerText}>You didn't answer in time</Text>
            </View>
          </View>

          {/* Partner Answer Section */}
          <View style={styles.answerSection}>
            <View style={styles.answerLabel}>
              <Text style={styles.answerLabelText}>{partnerName}'s Answer</Text>
            </View>
            
            {!isRevealed ? (
              // Blurred Answer
              <View style={styles.blurredAnswerContainer}>
                <BlurView intensity={10} tint="light" style={styles.blurredAnswer}>
                  <Text style={styles.partnerAnswerText}>{partnerAnswer}</Text>
                </BlurView>
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={32} color={Colors.darkOrange} />
                </View>
              </View>
            ) : (
              // Revealed Answer
              <View style={styles.revealedAnswerBox}>
                <Text style={styles.partnerAnswerText}>{partnerAnswer}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Date Info */}
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{expiredDate}</Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={Colors.darkOrange} />
          <Text style={styles.infoBannerText}>
            Don't worry! A new question is waiting for you in the category packs.
          </Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        {!isRevealed ? (
          <DebouncedButton
            style={styles.primaryButton}
            onPress={handleRevealAnswer}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Reveal Partner's Answer</Text>
          </DebouncedButton>
        ) : (
          <DebouncedButton
            style={styles.secondaryButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryButtonText}>Continue</Text>
          </DebouncedButton>
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.veryLightOrange,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  expiredText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
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
  statusBadge: {
    backgroundColor: Colors.mediumGrey,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  statusText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.inputText,
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
  missedAnswerBox: {
    backgroundColor: Colors.mediumGrey,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  missedAnswerText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  revealedAnswerBox: {
    backgroundColor: Colors.inputFill,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.darkOrange,
    padding: Spacing.lg,
  },
  dateInfo: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dateText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
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
  primaryButton: {
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
  primaryButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.darkOrange,
  },
  secondaryButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
});

