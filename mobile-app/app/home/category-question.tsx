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

interface Question {
  id: string;
  text: string;
  categoryId: string;
  categoryName: string;
}

// Mock questions - will be replaced with backend API
const mockQuestions: Record<string, Question[]> = {
  '1': [
    {
      id: 'q1',
      text: 'When do you feel proud to be with me?',
      categoryId: '1',
      categoryName: 'Deeper Connection',
    },
    {
      id: 'q2',
      text: 'What helps you feel that I have your back?',
      categoryId: '1',
      categoryName: 'Deeper Connection',
    },
    {
      id: 'q3',
      text: 'What makes you feel most understood by me?',
      categoryId: '1',
      categoryName: 'Deeper Connection',
    },
  ],
  '2': [
    {
      id: 'q4',
      text: 'What moment made you feel closest to me recently?',
      categoryId: '2',
      categoryName: 'Deepen Intimacy',
    },
    {
      id: 'q5',
      text: 'How do you like to be comforted when you\'re upset?',
      categoryId: '2',
      categoryName: 'Deepen Intimacy',
    },
  ],
};

export default function CategoryQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const categoryId = params.categoryId as string;
  const categoryTitle = params.categoryTitle as string;

  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState('');
  const [sharedRefreshesRemaining, setSharedRefreshesRemaining] = useState(2);
  const [usedRefreshes, setUsedRefreshes] = useState(0);
  const [timeLeft, setTimeLeft] = useState('6 h');
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const questions = mockQuestions[categoryId] || [];
      setAvailableQuestions(questions);
      
      if (questions.length > 0) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        setCurrentQuestion(randomQuestion);
        setUsedQuestionIds([randomQuestion.id]);
      }
    } catch (error) {
      console.error('Error loading question:', error);
      Alert.alert('Error', 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawAnother = async () => {
    if (sharedRefreshesRemaining <= 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('No Refreshes Left', 'You\'ve used all your shared refreshes for this question.');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Get unused questions
    const unusedQuestions = availableQuestions.filter(q => !usedQuestionIds.includes(q.id));
    
    if (unusedQuestions.length === 0) {
      Alert.alert('No More Questions', 'You\'ve seen all available questions in this category.');
      return;
    }

    const newQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
    setCurrentQuestion(newQuestion);
    setUsedQuestionIds([...usedQuestionIds, newQuestion.id]);
    
    // Check if this is the last refresh (1 remaining, will become 0)
    if (sharedRefreshesRemaining === 1) {
      setSharedRefreshesRemaining(0);
      setUsedRefreshes(prev => prev + 1);
      setResponse(''); // Clear previous response
      
      // Navigate to upsell screen after a short delay to show the new question
      setTimeout(() => {
        router.push('/home/draw-locked-upsell');
      }, 500);
    } else {
      setSharedRefreshesRemaining(prev => prev - 1);
      setUsedRefreshes(prev => prev + 1);
      setResponse(''); // Clear previous response
    }
  };

  const handleShareTether = async () => {
    if (!response.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Empty Response', 'Please type your response before sharing.');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // TODO: Send response to backend
    Alert.alert(
      'Tether Shared! 🎉',
      'Your response has been sent to your partner.',
      [
        {
          text: 'Back to Categories',
          onPress: () => router.back(),
        },
      ]
    );
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
              categoryName={currentQuestion.categoryName}
              question={currentQuestion.text}
              timeLeft={timeLeft}
              response={response}
              onResponseChange={setResponse}
              onDrawAnother={handleDrawAnother}
              sharedRefreshesRemaining={sharedRefreshesRemaining}
            />
          )}

          {/* Refresh Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              {usedRefreshes > 0 ? (
                <>
                  <Text style={styles.infoBannerHighlight}>{usedRefreshes}</Text>
                  {' Shared question refresh used!'}
                </>
              ) : (
                <>
                  <Text style={styles.infoBannerHighlight}>Refreshes</Text>
                  {' are shared between you both'}
                </>
              )}
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
