import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { getTetherHistory, type TetherHistory } from '@/services/tether_service';
import { useOnboarding } from '@/context/onboarding_context';
import { useTetherStats } from '@/hooks/useTetherStats';

interface TetherAnswer {
  categoryName: string;
  question: string;
  userAnswer: string;
  partnerAnswer: string;
  date: string;
  gradient: readonly [string, string];
}

// Map category names to gradients
const categoryGradients: Record<string, readonly [string, string]> = {
  'Communication': ['#FFB8A0', '#FFA07A'],
  'Intimacy': ['#A569BD', '#EC7063'],
  'Playfulness': ['#5DADE2', '#48C9B0'],
  'Trust': ['#F39C12', '#E74C3C'],
  'Love Languages': ['#16A085', '#27AE60'],
  'Future': ['#E74C3C', '#C0392B'],
  'Vulnerability': ['#8E44AD', '#9B59B6'],
  'Conflict': ['#F1C40F', '#F39C12'],
  'Erotic': ['#3498DB', '#2980B9'],
  'Gratitude': ['#1ABC9C', '#16A085'],
};

const emojis = ['❤️', '😂', '🔥', '👏'];

export default function TetherHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { onboardingData } = useOnboarding();
  const tetherStats = useTetherStats();
  const [selectedEmoji, setSelectedEmoji] = useState<{ [key: number]: string }>({});
  const [tetherHistory, setTetherHistory] = useState<TetherAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get partner name from user's onboarding data
  const partnerName = user?.onboardingData?.partnerFirstName || 
                      onboardingData.partnerFirstName || 
                      'Partner';
  
  const nextQuestionDate = 'Tomorrow at your Tether Time';

  useEffect(() => {
    loadHistory();
    // Mark tethers as viewed when this screen opens
    tetherStats.markAsViewed();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getTetherHistory(50, 0);
      
      // Map API response to TetherAnswer format
      const mappedHistory: TetherAnswer[] = response.history
        .filter((item: TetherHistory) => item.partnerAnswer) // Only show completed tethers
        .map((item: TetherHistory) => ({
          categoryName: item.categoryName,
          question: item.question,
          userAnswer: item.userAnswer,
          partnerAnswer: item.partnerAnswer || 'Waiting for partner...',
          date: new Date(item.answeredAt).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          gradient: categoryGradients[item.categoryName] || ['#FFB8A0', '#FFA07A'],
        }));
      
      setTetherHistory(mappedHistory);
    } catch (error) {
      console.error('Error loading tether history:', error);
      Alert.alert('Error', 'Failed to load your tether history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiPress = async (answerIndex: number, emoji: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEmoji(prev => ({
      ...prev,
      [answerIndex]: prev[answerIndex] === emoji ? '' : emoji,
    }));
    // TODO: Send emoji reaction to backend
  };

  const handleAnswerPress = (answer: TetherAnswer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Could open a detailed view or enable editing
  };

  return (
    <OnboardingLayout 
      showBackButton={true}
      showLogo={true} 
      showHeartLogo={false}
      showChatIcon={false}
      showSettingsIcon={true}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkOrange} />
          <Text style={styles.loadingText}>Loading your tether history...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              A new question will be{'\n'}dropping very soon...
            </Text>
            <Text style={styles.headerSubtitle}>{nextQuestionDate}</Text>
          </View>

          {/* Tether History */}
          {tetherHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No completed tethers yet.{'\n'}Answer your first question together!
              </Text>
            </View>
          ) : (
            <View style={styles.tetherList}>
              {tetherHistory.map((answer, index) => (
                <View key={index}>
                  {/* Answer Card */}
                  <TouchableOpacity
                    style={styles.answerCardWrapper}
                    onPress={() => handleAnswerPress(answer)}
                activeOpacity={0.95}
              >
                <LinearGradient
                  colors={answer.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.answerCard}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{answer.categoryName}</Text>
                    </View>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  </View>

                  {/* Question */}
                  <Text style={styles.questionText}>{answer.question}</Text>

                  {/* Answers */}
                  <View style={styles.answersContainer}>
                    {/* User Answer */}
                    <View style={styles.answerSection}>
                      <View style={styles.answerLabel}>
                        <Text style={styles.answerLabelText}>Your answer</Text>
                      </View>
                      <Text style={styles.answerText}>{answer.userAnswer}</Text>
                    </View>

                    {/* Partner Answer */}
                    <View style={styles.answerSection}>
                      <View style={styles.answerLabel}>
                        <Text style={styles.answerLabelText}>{partnerName}'s Answer</Text>
                      </View>
                      <Text style={styles.answerText}>{answer.partnerAnswer}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Emoji Reactions */}
              <View style={styles.emojiContainer}>
                {emojis.map((emoji, emojiIndex) => (
                  <TouchableOpacity
                    key={emojiIndex}
                    style={[
                      styles.emojiButton,
                      selectedEmoji[index] === emoji && styles.emojiButtonSelected,
                    ]}
                    onPress={() => handleEmojiPress(index, emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Separator */}
              {index < tetherHistory.length - 1 && (
                <View style={styles.dateSeparator}>
                  <Text style={styles.dateText}>{tetherHistory[index + 1].date}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
          )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 3,
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: FontSizes.medium,
    color: Colors.darkGrey,
    fontWeight: FontWeights.medium as any,
  },
  emptyState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: FontSizes.large,
    color: Colors.darkGrey,
    textAlign: 'center',
    fontWeight: FontWeights.medium as any,
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
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  headerSubtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
  },
  tetherList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  answerCardWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  answerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryBadge: {
    backgroundColor: Colors.white,
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
  completedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  completedText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  questionText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 30,
  },
  answersContainer: {
    gap: Spacing.lg,
  },
  answerSection: {
    gap: Spacing.sm,
  },
  answerLabel: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  answerLabelText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  answerText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    lineHeight: 24,
  },
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiButtonSelected: {
    backgroundColor: Colors.veryLightOrange,
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.2,
  },
  emojiText: {
    fontSize: 28,
  },
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  dateText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
  },
  bottomSpacer: {
    height: 40,
  },
});

