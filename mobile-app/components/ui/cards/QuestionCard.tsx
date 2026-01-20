import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../../theme/constants';
import DebouncedButton from '../buttons/DebouncedButton';

interface QuestionCardProps {
  categoryName: string;
  question: string;
  timeLeft: string;
  response: string;
  onResponseChange: (text: string) => void;
  onDrawAnother: () => void;
  isSkipping: boolean;                    // ← Controlled by parent
  refreshesRemaining: number;             // ← For display only
  disabled?: boolean;                     // ← Make card inactive when answered
}

export default function QuestionCard({
  categoryName,
  question,
  timeLeft,
  response,
  onResponseChange,
  onDrawAnother,
  isSkipping,
  refreshesRemaining,
  disabled = false,
}: QuestionCardProps) {
  const isDrawDisabled = isSkipping || refreshesRemaining <= 0 || disabled;

  return (
    <View style={styles.container}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{categoryName}</Text>
        <Text style={styles.timeLeft}>
          Time left <Text style={styles.timeBold}>{timeLeft}</Text>
        </Text>
      </View>

      {/* Question */}
      <Text style={styles.question}>{question}</Text>

      {/* Response Input */}
      <TextInput
        style={[styles.responseInput, disabled && styles.responseInputDisabled]}
        placeholder={disabled ? "Waiting for partner..." : "Type your response..."}
        placeholderTextColor={Colors.inputText}
        value={response}
        onChangeText={onResponseChange}
        multiline
        textAlignVertical="top"
        editable={!disabled}
      />

      {/* Draw Another Button */}
      <DebouncedButton
        style={[
          styles.drawButton,
          isDrawDisabled && styles.drawButtonDisabled,
        ]}
        onPress={onDrawAnother}
        disabled={isDrawDisabled}
        activeOpacity={0.8}
      >
        <Ionicons
          name="refresh"
          size={18}
          color={Colors.white}
          style={styles.refreshIcon}
        />
        <Text style={styles.drawButtonText}>
          {isSkipping ? 'Drawing...' : 'Draw Another'}
        </Text>
      </DebouncedButton>

      {/* Refreshes Remaining */}
      <Text style={styles.refreshesText}>
        {refreshesRemaining} refresh{refreshesRemaining === 1 ? '' : 'es'} remaining today
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryName: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  timeLeft: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
  timeBold: {
    fontFamily: 'InterTight-Bold',
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  question: {
    fontFamily: 'InterTight-Bold',
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 30,
  },
  responseInput: {
    backgroundColor: Colors.inputFill,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.mediumGrey,
    padding: Spacing.md,
    minHeight: 120,
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  drawButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  drawButtonDisabled: {
    backgroundColor: Colors.mediumGrey,
    opacity: 0.7,
  },
  refreshIcon: {
    marginRight: Spacing.xs,
  },
  drawButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  refreshesText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
  },
  responseInputDisabled: {
    backgroundColor: Colors.inputFill,
    opacity: 0.7,
  },
});