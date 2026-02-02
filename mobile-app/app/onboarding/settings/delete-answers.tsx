import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';
import {
  getDeletableAnswers,
  deleteSpecificAnswers,
  DeletableAnswer,
} from '@/services/privacy_service';

export default function DeleteAnswersScreen() {
  const router = useRouter();
  
  const [answers, setAnswers] = useState<(DeletableAnswer & { selected: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAnswers();
  }, []);

  const loadAnswers = async () => {
    try {
      setLoading(true);
      const data = await getDeletableAnswers();
      setAnswers(data.map(answer => ({ ...answer, selected: false })));
    } catch (error) {
      Alert.alert('Error', 'Failed to load answers. Please try again.');
      console.error('Load answers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers(prev =>
      prev.map(answer =>
        answer.id === id ? { ...answer, selected: !answer.selected } : answer
      )
    );
  };

  const handleDeleteSelected = async () => {
    const selectedCount = answers.filter(a => a.selected).length;
    
    if (selectedCount === 0) {
      Alert.alert('No Selection', 'Please select at least one answer to delete');
      return;
    }

    Alert.alert(
      'Delete Answers',
      `Are you sure you want to delete ${selectedCount} answer${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const selectedIds = answers.filter(a => a.selected).map(a => a.id);
              const deletedCount = await deleteSpecificAnswers(selectedIds);
              
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', `${deletedCount} answer(s) have been permanently deleted`);
              
              // Reload the list
              await loadAnswers();
            } catch (error) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete answers. Please try again.');
              console.error('Delete error:', error);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.heading}>Delete your answers</Text>
          <Text style={styles.subtitle}>
            Select any completed Tethers to delete. Remember,{'\n'}
            any responses deleted cannot be recovered.
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.darkOrange} />
              <Text style={styles.loadingText}>Loading your answers...</Text>
            </View>
          ) : answers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={Colors.darkGrey} />
              <Text style={styles.emptyText}>No completed answers to delete</Text>
            </View>
          ) : (
            <>
              {/* Answers List */}
              <View style={styles.answersList}>
                {answers.map((answer, index) => (
                  <DebouncedButton
                    key={answer.id}
                    style={[
                      styles.answerItem,
                      index === answers.length - 1 && styles.answerItemLast,
                    ]}
                    onPress={() => toggleAnswer(answer.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.answerLeft}>
                      <Text style={styles.answerQuestion} numberOfLines={2}>
                        {answer.question}
                      </Text>
                      <Text style={styles.answerDate}>{answer.date}</Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      answer.selected && styles.checkboxSelected,
                    ]}>
                      {answer.selected && (
                        <Ionicons name="checkmark" size={18} color={Colors.white} />
                      )}
                    </View>
                  </DebouncedButton>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* Delete Button - Fixed at bottom */}
        {!loading && answers.length > 0 && (
          <View style={styles.bottomContainer}>
            <DebouncedButton
              style={[styles.deleteButton, deleting && styles.buttonDisabled]}
              onPress={handleDeleteSelected}
              activeOpacity={0.8}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Selected Answers</Text>
              )}
            </DebouncedButton>
          </View>
        )}
      </View>
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
  answersList: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  answerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGrey,
  },
  answerItemLast: {
    borderBottomWidth: 0,
  },
  answerLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  answerQuestion: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.medium,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  answerDate: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small + 2,
    color: Colors.darkOrange,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.mediumGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.darkOrange,
    borderColor: Colors.darkOrange,
  },
  bottomContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.cream,
  },
  deleteButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deleteButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    color: Colors.darkGrey,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    color: Colors.darkGrey,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});