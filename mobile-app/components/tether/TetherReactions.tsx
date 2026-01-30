import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

interface TetherReactionsProps {
  reactions: Reaction[];
  currentUserId: string;
  partnerName: string;
  onReactionPress: (emoji: string) => void;
}


const EMOJIS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '🔥', label: 'Fire' },
//   { emoji: '💯', label: 'Perfect' },
  { emoji: '👏', label: 'Applause' },
//   { emoji: '💪', label: 'Strong' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TetherReactions({
  reactions,
  currentUserId,
  partnerName,
  onReactionPress,
}: TetherReactionsProps) {
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: string; emoji: string }>>([]);

  const handleReactionPress = async (emoji: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Add floating emoji
    const id = Date.now().toString();
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    
    // Remove after animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== id));
    }, 2000);
    
    onReactionPress(emoji);
  };

  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowAllReactions(true);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.reactionsRow}>
          {EMOJIS.map((item, index) => (
            <ReactionButton
              key={item.emoji}
              emoji={item.emoji}
              label={item.label}
              index={index}
              userReacted={reactions.some(r => r.userId === currentUserId && r.emoji === item.emoji)}
              partnerReacted={reactions.some(r => r.userId !== currentUserId && r.emoji === item.emoji)}
              onPress={() => handleReactionPress(item.emoji)}
              onLongPress={handleLongPress}
            />
          ))}
        </View>

        {/* Summary text */}
        {reactions.length > 0 && (
          <Pressable onPress={handleLongPress} style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {reactions.filter(r => r.userId === currentUserId).length > 0 && 'You'}
              {reactions.filter(r => r.userId === currentUserId).length > 0 && 
               reactions.filter(r => r.userId !== currentUserId).length > 0 && ' and '}
              {reactions.filter(r => r.userId !== currentUserId).length > 0 && partnerName}
              {' reacted'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.inputText} />
          </Pressable>
        )}
      </View>

      {/* Floating emojis */}
      {floatingEmojis.map(item => (
        <FloatingEmoji key={item.id} emoji={item.emoji} />
      ))}

      {/* All Reactions Modal */}
      <Modal
        visible={showAllReactions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllReactions(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowAllReactions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reactions</Text>
              <Pressable onPress={() => setShowAllReactions(false)}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </Pressable>
            </View>

            <View style={styles.reactionsList}>
              {EMOJIS.map(item => {
                const userReacted = reactions.some(r => r.userId === currentUserId && r.emoji === item.emoji);
                const partnerReacted = reactions.some(r => r.userId !== currentUserId && r.emoji === item.emoji);
                
                if (!userReacted && !partnerReacted) return null;

                return (
                  <View key={item.emoji} style={styles.reactionRow}>
                    <Text style={styles.reactionEmoji}>{item.emoji}</Text>
                    <View style={styles.reactionInfo}>
                      <Text style={styles.reactionLabel}>{item.label}</Text>
                      <View style={styles.reactorsList}>
                        {userReacted && (
                          <View style={styles.reactorBadge}>
                            <Text style={styles.reactorText}>You</Text>
                          </View>
                        )}
                        {partnerReacted && (
                          <View style={[styles.reactorBadge, styles.partnerBadge]}>
                            <Text style={styles.reactorText}>{partnerName}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

interface ReactionButtonProps {
  emoji: string;
  label: string;
  index: number;
  userReacted: boolean;
  partnerReacted: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function ReactionButton({
  emoji,
  label,
  index,
  userReacted,
  partnerReacted,
  onPress,
  onLongPress,
}: ReactionButtonProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.15, { damping: 10 }),
      withSpring(1, { damping: 8 })
    );
    
    rotation.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.reactionButton,
        (userReacted || partnerReacted) && styles.reactionButtonActive,
        animatedStyle,
      ]}
    >
      <Text style={styles.reactionButtonEmoji}>{emoji}</Text>
      
      {/* Indicator badges */}
      {(userReacted || partnerReacted) && (
        <View style={styles.indicatorContainer}>
          {userReacted && (
            <View style={[styles.indicator, styles.userIndicator]} />
          )}
          {partnerReacted && (
            <View style={[styles.indicator, styles.partnerIndicator]} />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

function FloatingEmoji({ emoji }: { emoji: string }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue((Math.random() - 0.5) * 30);

  useEffect(() => {
    translateY.value = withTiming(-150, { duration: 2000 });
    opacity.value = withSequence(
      withDelay(500, withTiming(1, { duration: 500 })),
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingEmoji, animatedStyle]} pointerEvents="none">
      <Text style={styles.floatingEmojiText}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  reactionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reactionButtonActive: {
    borderColor: Colors.darkOrange,
    backgroundColor: Colors.veryLightOrange,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  reactionButtonEmoji: {
    fontSize: 26,
  },
  indicatorContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    flexDirection: 'row',
    gap: 2,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userIndicator: {
    backgroundColor: Colors.darkOrange,
  },
  partnerIndicator: {
    backgroundColor: '#5DADE2',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  summaryText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
  },
  floatingEmoji: {
    position: 'absolute',
    bottom: 100,
    left: SCREEN_WIDTH / 2 - 20,
    zIndex: 1000,
  },
  floatingEmojiText: {
    fontSize: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl * 2,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGrey,
  },
  modalTitle: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.heading,
    fontWeight: FontWeights.bold,
    color: Colors.black,
  },
  reactionsList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  reactionEmoji: {
    fontSize: 32,
    width: 48,
    textAlign: 'center',
  },
  reactionInfo: {
    flex: 1,
  },
  reactionLabel: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  reactorsList: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  reactorBadge: {
    backgroundColor: Colors.veryLightOrange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.darkOrange,
  },
  partnerBadge: {
    backgroundColor: '#E3F2FD',
    borderColor: '#5DADE2',
  },
  reactorText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.black,
  },
});


