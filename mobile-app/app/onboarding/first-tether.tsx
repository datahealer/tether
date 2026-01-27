import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { useAuth } from '@/context/auth_context';
import { SoloModeBanner } from '@/components/ui/SoloModeBanner';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';
import { getActiveTethers, submitAnswer, skipTether, type TetherQuestion, type RefreshInfo } from '@/services/tether_service';

export default function FirstTetherScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const { user } = useAuth();
  const [response, setResponse] = useState('');
  const [responseFocused, setResponseFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestion, setFetchingQuestion] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<TetherQuestion | null>(null);
  const [refreshInfo, setRefreshInfo] = useState<RefreshInfo>({
    cycleRefreshesRemaining: 0,
    permanentRefreshBalance: 0,
    maxCycleRefreshes: 1,
  });
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [freeTethersRemaining, setFreeTethersRemaining] = useState(80); // Free tier: 2 categories × 40 questions

  const partnerName = onboardingData.partnerFirstName || 'Partner';

  // Calculate total refreshes available
  const totalRefreshesAvailable = refreshInfo.cycleRefreshesRemaining + refreshInfo.permanentRefreshBalance;

  // Custom back handler for solo mode users
  const handleBackPress = () => {
    if (user?.isSoloMode && !user?.linkedToRealPartner) {
      // Solo mode user - go back to partner-invite
      router.replace('/onboarding/partner-invite');
    } else if (router.canGoBack()) {
      // Regular coupled user - use default back
      router.back();
    } else {
      // Fallback
      router.replace('/onboarding/partner-invite');
    }
  };

  // Fetch dynamic question from backend on mount
  useEffect(() => {
    fetchFirstTether();
  }, []);

  const fetchFirstTether = async () => {
    try {
      setFetchingQuestion(true);
      console.log('🎯 Fetching first tether from backend...');
      
      const data = await getActiveTethers();
      
      if (data.tethers && data.tethers.length > 0) {
        const firstTether = data.tethers[0];
        setCurrentQuestion(firstTether);
        console.log('✅ First tether loaded:', firstTether.question);
        
        // Update refresh info from backend
        if (data.refreshes) {
          setRefreshInfo(data.refreshes);
          console.log('🔄 Refresh info:', {
            cycle: data.refreshes.cycleRefreshesRemaining,
            permanent: data.refreshes.permanentRefreshBalance,
            max: data.refreshes.maxCycleRefreshes,
          });
        }
        
        // Check if user already answered this tether
        if (firstTether.userAnswer) {
          setAlreadyAnswered(true);
          setResponse(firstTether.userAnswer);
          console.log('ℹ️ User already answered this tether, waiting for partner');
        } else {
          setAlreadyAnswered(false);
          setResponse('');
        }
        
        // Track free tethers remaining from stats
        if (data.stats) {
          const remaining = 80 - (data.stats.totalAnswered || 0);
          setFreeTethersRemaining(Math.max(0, remaining));
        }
      } else {
        console.warn('⚠️ No active tethers found');
        // Show upgrade prompt for free users
        if (!user?.subscribed) {
          Alert.alert(
            'No Tethers Available',
            'No active questions right now. Come back soon for more!',
            [
              { text: 'OK', onPress: () => router.push('/onboarding/subscription') }
            ]
          );
        } else {
          Alert.alert('No Questions', 'No tethers available. Check back soon!');
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching first tether:', error);
      Alert.alert('Error', 'Failed to load question. Please try again.');
    } finally {
      setFetchingQuestion(false);
    }
  };

  const handleDrawAnother = async () => {
    if (totalRefreshesAvailable <= 0) {
      Alert.alert(
        'No Refreshes Available',
        'You have no refreshes remaining. Try Premium for 3 refreshes per tether!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'View Premium', onPress: () => router.push('/onboarding/subscription') }
        ]
      );
      return;
    }

    if (!currentQuestion) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      setFetchingQuestion(true);
      console.log('🔄 Skipping current tether...');
      
      const result = await skipTether(currentQuestion.questionId);
      
      // Update refresh info from backend response
      setRefreshInfo({
        cycleRefreshesRemaining: result.cycleRefreshesRemaining,
        permanentRefreshBalance: result.permanentRefreshesRemaining,
        maxCycleRefreshes: refreshInfo.maxCycleRefreshes,
      });

      if (result.usedPermanent) {
        console.log('💰 Used 1 permanent refresh');
      }
      
      if (result.newQuestion) {
        setCurrentQuestion(result.newQuestion);
        setResponse(''); // Clear current response
        setAlreadyAnswered(false);
        console.log('✅ New tether drawn:', result.newQuestion.question);
        
        Alert.alert(
          'New Question!',
          result.usedPermanent 
            ? 'Used 1 permanent refresh. Here\'s a fresh question!' 
            : 'Here\'s a fresh question!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No More Questions', 'No more questions available to draw from.');
      }
    } catch (error: any) {
      console.error('❌ Error drawing another:', error);
      
      if (error.message?.includes('No refreshes')) {
        Alert.alert(
          'No Refreshes',
          'You\'ve used all your refreshes. Upgrade to Premium for more!',
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'View Premium', onPress: () => router.push('/onboarding/subscription') }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to draw another question');
      }
    } finally {
      setFetchingQuestion(false);
    }
  };

  const handleShareTether = async () => {
    if (alreadyAnswered) {
      Alert.alert(
        'Already Answered',
        'You\'ve already answered this tether. Waiting for your partner to respond!',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!response.trim()) {
      Alert.alert('Required', 'Please type your response');
      return;
    }

    if (!currentQuestion) {
      Alert.alert('Error', 'No question loaded');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      console.log('📤 Submitting first tether answer...');
      
      const result = await submitAnswer(currentQuestion.questionId, response.trim());
      
      console.log('✅ Answer submitted successfully:', result.state);
      setAlreadyAnswered(true);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Check if both answered (tether completed)
      if (result.state === 'COMPLETED' && result.partnerAnswer) {
        // BOTH COMPLETED: Backend automatically dropped new tethers
        // Refresh to show the new question
        console.log('🎉 Both answered! Fetching new tether automatically...');
        await fetchFirstTether(); // Auto-refresh to get new question
        
        Alert.alert(
          'Tether Completed! 🎉',
          `You both answered!\n\nYour partner said: "${result.partnerAnswer}"\n\nA new question is ready!`,
          [
            { text: 'View New Question', onPress: () => {/* User can see new question already loaded */} }
          ]
        );
      } else {
        // Waiting for partner
        Alert.alert(
          'Tether Shared! ✨',
          'Your answer has been sent! Your partner has 24 hours to respond.',
          [
            { text: 'Continue', onPress: () => router.push('/onboarding/subscription') }
          ]
        );
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('❌ Submit error:', error);
      
      // Handle specific error for already answered
      if (error.message?.includes('already answered') || error.message?.includes('Cannot submit')) {
        setAlreadyAnswered(true);
        Alert.alert(
          'Already Answered',
          'You\'ve already answered this tether. Waiting for your partner!',
          [{ text: 'Continue', onPress: () => router.push('/onboarding/subscription') }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to share tether');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching question
  if (fetchingQuestion && !currentQuestion) {
    return (
      <OnboardingLayout 
        progress={0.77} 
        showBackButton={true}
        onBackPress={handleBackPress}
        rightAction={{
          icon: 'close',
          onPress: () => router.push('/onboarding/subscription'),
        }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkOrange} />
          <Text style={styles.loadingText}>Loading your first tether...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  // If no question available
  if (!currentQuestion) {
    return (
      <OnboardingLayout 
        progress={0.77} 
        showBackButton={true}
        onBackPress={handleBackPress}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.darkOrange} />
          <Text style={styles.errorText}>No question available</Text>
          <DebouncedButton style={styles.retryButton} onPress={fetchFirstTether}>
            <Text style={styles.buttonText}>Try Again</Text>
          </DebouncedButton>
        </View>
      </OnboardingLayout>
    );
  }

  const question = currentQuestion.question;
  const categoryName = currentQuestion.categoryName || 'Tether';
  
  // Calculate time remaining (expiresAt - now)
  const getTimeLeft = () => {
    if (!currentQuestion.expiresAt) return '24 h';
    const now = new Date();
    const expiresAt = new Date(currentQuestion.expiresAt);
    const hoursLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
    return `${hoursLeft} h`;
  };
  const timeLeft = getTimeLeft();

  return (
    <OnboardingLayout 
    progress={0.77} 
    showBackButton={true}
    onBackPress={handleBackPress}
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
        {/* Solo Mode Banner */}
        {user?.isSoloMode && !user?.linkedToRealPartner && (
          <SoloModeBanner />
        )}

        {/* Upgrade Banner for Free Users */}
        {!user?.subscribed && (
          <DebouncedButton
            style={styles.upgradeBanner}
            onPress={() => router.push('/onboarding/subscription')}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={16} color={Colors.darkOrange} />
            <Text style={styles.upgradeBannerText}>
              {freeTethersRemaining} free tethers left • Upgrade to Premium
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.darkOrange} />
          </DebouncedButton>
        )}

        {/* Heading */}
        <Text style={styles.heading}>
          {alreadyAnswered ? 'Waiting for your partner' : 'Answer your first Tether'}
        </Text>

        {/* Already Answered Message */}
        {alreadyAnswered && (
          <View style={styles.waitingMessage}>
            <Ionicons name="time-outline" size={24} color={Colors.darkOrange} />
            <Text style={styles.waitingText}>
              You've already answered! Your partner has {timeLeft} to respond.
            </Text>
          </View>
        )}

        {/* Question Card */}
        <View style={styles.questionCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{categoryName}</Text>
            <Text style={styles.timeLeft}>Time left {timeLeft}</Text>
          </View>

          {/* Question */}
          <Text style={styles.question}>{question}</Text>

          {/* Response Input */}
          <View
            style={[
              styles.responseContainer,
              responseFocused && styles.responseFocused,
              alreadyAnswered && styles.responseDisabled,
            ]}
          >
            <TextInput
              style={styles.responseInput}
              placeholder={alreadyAnswered ? "Waiting for partner..." : "Type your response..."}
              placeholderTextColor={Colors.darkGrey}
              value={response}
              onChangeText={setResponse}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setResponseFocused(true)}
              onBlur={() => setResponseFocused(false)}
              editable={!alreadyAnswered}
            />
          </View>

          {/* Draw Another Button */}
          <DebouncedButton
            style={[
              styles.drawAnotherButton,
              (totalRefreshesAvailable <= 0 || fetchingQuestion || alreadyAnswered) && styles.drawAnotherButtonDisabled,
            ]}
            onPress={handleDrawAnother}
            disabled={totalRefreshesAvailable <= 0 || fetchingQuestion || alreadyAnswered}
            activeOpacity={0.8}
          >
            {fetchingQuestion ? (
              <>
                <ActivityIndicator size="small" color={Colors.darkOrange} />
                <Text style={styles.drawAnotherText}>Drawing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="refresh" size={16} color={Colors.darkOrange} />
                <Text style={styles.drawAnotherText}>Draw Another</Text>
              </>
            )}
          </DebouncedButton>

          {/* Refresh Info */}
          <Text style={styles.refreshInfo}>
            {refreshInfo.cycleRefreshesRemaining > 0 ? (
              `${refreshInfo.cycleRefreshesRemaining}/${refreshInfo.maxCycleRefreshes} daily refresh${refreshInfo.cycleRefreshesRemaining === 1 ? '' : 'es'}`
            ) : refreshInfo.permanentRefreshBalance > 0 ? (
              `${refreshInfo.permanentRefreshBalance} permanent refresh${refreshInfo.permanentRefreshBalance === 1 ? '' : 'es'} available`
            ) : (
              'No refreshes remaining'
            )}
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Share Button or Continue Button */}
        {alreadyAnswered ? (
          <DebouncedButton
            style={styles.continueButton}
            onPress={() => router.push('/onboarding/subscription')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue to Subscription</Text>
          </DebouncedButton>
        ) : (
          <DebouncedButton
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
          </DebouncedButton>
        )}
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
    textAlign:'center'
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.veryLightOrange,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  upgradeBannerText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    flex: 1,
    textAlign: 'center',
  },
  waitingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightOrange,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  waitingText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    flex: 1,
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
  responseDisabled: {
    backgroundColor: Colors.inputFill,
    opacity: 0.7,
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
  drawAnotherButtonDisabled: {
    opacity: 0.5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loadingText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  errorText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
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
  continueButton: {
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
  buttonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});