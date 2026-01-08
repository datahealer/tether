import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { useTetherStats } from '@/hooks/useTetherStats';
import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';

export default function BothExpiredScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const tetherStats = useTetherStats();
  const { push: debouncedPush} = useNavigationDebounce();
  
  const categoryName = (params.categoryName as string) || 'Deep Connection';
  const question = (params.question as string) || 'What is something small your partner does that makes you smile?';
  const userAnswer = (params.userAnswer as string) || 'She kisses me good night.';
  const partnerName = 'Sarah'; // TODO: Get from user's couple data
  const userAnswered = (params.userAnswered as string) === 'true' || true;

  const handleChooseNew = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Navigate back to category packs
    router.replace('/home/category-packs');
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
        {/* Push Notification Banner */}
        {/* <View style={styles.notificationBanner}>
          <View style={styles.notificationHeader}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>Tether</Text>
            </View>
            <Text style={styles.appName}>The Tether App</Text>
            <Text style={styles.notificationTime}>now</Text>
          </View>
          <Text style={styles.notificationText}>
            Oops, {partnerName} didn't respond to the Tether in time.{' '}
            <Text style={styles.notificationBold}>But, new questions await you both...</Text>
          </Text>
        </View> */}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            This one has just slipped{'\n'}through their fingers...
          </Text>
          <Text style={styles.headerSubtitle}>
            Let this one go. You can both answer a new{'\n'}question from any unlocked category.
          </Text>
        </View>

        {/* Expired Question Card */}
        <View style={styles.expiredCard}>
          {/* Category Header */}
          <View style={styles.categoryHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryName}</Text>
            </View>
            <View style={styles.timeExpired}>
              <Text style={styles.timeLabel}>Time left</Text>
              <Text style={styles.timeExpiredValue}>0 h</Text>
            </View>
          </View>

          {/* Grayed Question */}
          <Text style={styles.expiredQuestionText}>{question}</Text>

          {/* Partner's Missed Answer */}
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>[{partnerName}'s Name] Answer</Text>
            <Text style={styles.slippedAwayText}>This one slipped away...</Text>
          </View>
        </View>

        {/* User's Answer Card (if they answered) */}
        {userAnswered && (
          <View style={styles.userAnswerCard}>
            <View style={styles.userAnswerHeader}>
              <View style={styles.categoryBadgeSmall}>
                <Text style={styles.categoryTextSmall}>{categoryName}</Text>
              </View>
              <Text style={styles.yourAnswerLabel}>Your Answer</Text>
            </View>
            <Text style={styles.userAnswerText}>{userAnswer}</Text>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleChooseNew}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Choose a New Tether</Text>
        </TouchableOpacity>
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
  notificationBanner: {
    backgroundColor: 'rgba(139, 139, 139, 0.9)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  appIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.darkOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 8,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  appName: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    flex: 1,
  },
  notificationTime: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.white,
    opacity: 0.8,
  },
  notificationText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.white,
    lineHeight: 20,
  },
  notificationBold: {
    fontFamily: 'InterTight-Bold',
    fontWeight: FontWeights.bold,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'InterTight-Bold',
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 22,
  },
  expiredCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.darkOrange,
    opacity: 0.7,
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
  timeExpired: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
  timeExpiredValue: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  expiredQuestionText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 20,
    fontWeight: FontWeights.bold,
    color: Colors.inputText,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 28,
    opacity: 0.5,
  },
  answerSection: {
    gap: Spacing.sm,
  },
  answerLabel: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  slippedAwayText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    fontStyle: 'italic',
    opacity: 0.6,
  },
  userAnswerCard: {
    backgroundColor: '#FFB8A0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
  userAnswerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadgeSmall: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  categoryTextSmall: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  yourAnswerLabel: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  userAnswerText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 20,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    lineHeight: 28,
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
});
