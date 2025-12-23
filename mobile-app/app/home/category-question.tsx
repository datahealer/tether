import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import QuestionCard from '../../components/ui/cards/QuestionCard';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import {
  getActiveTethers,
  submitAnswer,
  skipTether,
  type TetherQuestion,
  type TetherStats,
} from '@/services/tether_service';

interface Question {
  id: string;
  text: string;
  categoryId: string;
  categoryName: string;
}

export default function CategoryQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const categoryId = params.categoryId as string;
  const categoryTitle = params.categoryTitle as string;

  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<TetherQuestion | null>(null);
  const [response, setResponse] = useState('');
  const [refreshesRemaining, setRefreshesRemaining] = useState(1);
  const [stats, setStats] = useState<TetherStats | null>(null);
  const [timeLeft, setTimeLeft] = useState('6 h');

  useEffect(() => {
    loadActiveTethers();
  }, []);

  const loadActiveTethers = async () => {
    try {
      setLoading(true);
      const data = await getActiveTethers();
      
      console.log('Active tethers response:', JSON.stringify(data, null, 2));
      console.log('Looking for categoryId:', categoryId);
      
      // Filter tethers for current category (case-insensitive comparison)
      const categoryTether = data.tethers.find(
        (t) => t.categoryId?.toLowerCase() === categoryId?.toLowerCase()
      );
      
      if (categoryTether) {
        console.log('Found tether for category:', categoryTether);
        setCurrentQuestion(categoryTether);
        // Pre-fill if user already answered
        if (categoryTether.userAnswer) {
          setResponse(categoryTether.userAnswer);
        }
      } else {
        console.log('No tether found for category. Available tethers:', data.tethers.map(t => ({ id: t.categoryId, name: t.categoryName })));
        Alert.alert(
          'No Tethers Available',
          'Check back later for new questions, or unlock more categories!'
        );
      }
      
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading tethers:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawAnother = async () => {
    if (!currentQuestion) return;

    if (refreshesRemaining <= 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'No Refreshes Left',
        'You\'ve used all your refreshes for today. Upgrade to Premium for more refreshes!'
      );
      router.push('/home/draw-locked-upsell');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await skipTether(currentQuestion.questionId);
      
      if (result.newQuestion) {
        setCurrentQuestion(result.newQuestion);
        setResponse(''); // Clear previous response
        setRefreshesRemaining(result.refreshesRemaining);
        
        Alert.alert(
          'New Question',
          result.message || 'Here\'s a new question for you!'
        );
      } else {
        Alert.alert('Notice', result.message);
        
        // If no refreshes left, show upsell
        if (result.refreshesRemaining === 0) {
          setTimeout(() => {
            router.push('/home/draw-locked-upsell');
          }, 1500);
        }
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to draw another question');
    }
  };

  const handleShareTether = async () => {
    if (!response.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Empty Response', 'Please type your response before sharing.');
      return;
    }

    if (!currentQuestion) {
      Alert.alert('Error', 'No active question to answer');
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      const result = await submitAnswer(currentQuestion.questionId, response);
      
      // Check if partner already answered
      if (result.state === 'COMPLETED' && result.partnerAnswer) {
        Alert.alert(
          'Tether Completed! 🎉',
          `You both answered!\n\nYour partner said: "${result.partnerAnswer}"`,
          [
            {
              text: 'View History',
              onPress: () => router.push('/home/tether-history'),
            },
            {
              text: 'Continue',
              onPress: () => router.back(),
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          'Tether Shared! 🎉',
          'Your response has been sent to your partner. They have 24 hours to respond!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }

      // Show milestones if achieved
      if (result.milestones && result.milestones.length > 0) {
        setTimeout(() => {
          const milestone = result.milestones![0];
          Alert.alert(
            '🏆 Milestone Achieved!',
            milestone.message,
            [{ text: 'Awesome!', style: 'default' }]
          );
        }, 1000);
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit answer',
        [
          {
            text: 'Back to Categories',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <OnboardingLayout 
        showBackButton={false} 
        showLogo={false} 
        showHeartLogo={false}
        showChatIcon={true}
        chatCount={5}
        onChatPress={() => router.push('/')}
        showSettingsIcon={true}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkOrange} />
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      showBackButton={true}
      showLogo={false} 
      showHeartLogo={false}
      showChatIcon={true}
      chatCount={5}
      onChatPress={() => router.push('/')}
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
              Answer a question before{'\n'}[partner] beats you to it
            </Text>
            <Text style={styles.headerSubtitle}>Pull each other closer...</Text>
          </View>

          {/* Question Card */}
          {currentQuestion && (
            <QuestionCard
              categoryName={currentQuestion.categoryName || categoryTitle}
              question={currentQuestion.question}
              timeLeft={timeLeft}
              response={response}
              onResponseChange={setResponse}
              onDrawAnother={handleDrawAnother}
              sharedRefreshesRemaining={refreshesRemaining}
            />
          )}

          {/* Refresh Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              You have <Text style={styles.infoBannerHighlight}>{refreshesRemaining}</Text> refresh{refreshesRemaining === 1 ? '' : 'es'} remaining today.
            </Text>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.shareButton,
              !response.trim() && styles.shareButtonDisabled,
            ]}
            onPress={handleShareTether}
            disabled={!response.trim()}
            activeOpacity={0.9}
          >
            <Text style={[
              styles.shareButtonText,
              !response.trim() && styles.shareButtonTextDisabled,
            ]}>
              Share My Tether
            </Text>
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
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
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
  infoBanner: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.lightOrange,
  },
  infoBannerText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    textAlign: 'center',
  },
  infoBannerHighlight: {
    fontFamily: 'InterTight-Bold',
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
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
  shareButton: {
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
  shareButtonDisabled: {
    backgroundColor: Colors.mediumGrey,
    shadowOpacity: 0.1,
  },
  shareButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  shareButtonTextDisabled: {
    color: Colors.inputText,
  },
});

