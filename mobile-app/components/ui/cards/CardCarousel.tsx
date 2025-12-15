import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../../theme/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const SPACING = 20;
const SIDE_CARD_SCALE = 0.9;
const CARD_PERSPECTIVE = 1200;
const ROTATION_ANGLE = 20;

export interface CarouselCard {
  id: string;
  title: string;
  description: string;
  questionsAnswered: number;
  totalQuestions: number;
  gradient: readonly [string, string, ...string[]];
  isLocked?: boolean;
}

interface Card3DCarouselProps {
  cards: CarouselCard[];
  onCardPress: (card: CarouselCard, index: number) => void;
  activeIndex?: number;
  hasWaitingTether?: boolean;
  waitingTetherCategoryId?: string;
}

export default function Card3DCarousel({ 
  cards, 
  onCardPress,
  activeIndex: controlledIndex,
  hasWaitingTether = false,
  waitingTetherCategoryId
}: Card3DCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(controlledIndex || 0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const panX = useRef(new Animated.Value(0)).current;

  // Auto-scroll to waiting tether on mount if needed
  useEffect(() => {
    if (hasWaitingTether && waitingTetherCategoryId) {
      const tetherIndex = cards.findIndex(card => card.id === waitingTetherCategoryId);
      if (tetherIndex !== -1 && tetherIndex !== activeIndex) {
        setTimeout(() => {
          goToIndex(tetherIndex, true);
        }, 300);
      }
    }
  }, [hasWaitingTether, waitingTetherCategoryId]);

  // ...existing code...

const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Changed from true
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // More lenient threshold
        return Math.abs(gestureState.dx) > 3; // Changed from 5
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 3; // Changed from 5
      },
      onPanResponderTerminationRequest: () => true, // Changed to true
      onPanResponderGrant: () => {
        if (!hasWaitingTether) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        panX.setOffset(0);
        panX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (!hasWaitingTether) {
          panX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (hasWaitingTether) {
          // Reset position
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
          return;
        }

        panX.flattenOffset();
        const threshold = CARD_WIDTH / 4; // More sensitive - changed from /3
        const velocity = gestureState.vx;
        
        // Check velocity for quick swipes
        if (Math.abs(velocity) > 0.3) { // More sensitive - changed from 0.5
          if (velocity > 0 && activeIndex > 0) {
            goToIndex(activeIndex - 1);
            return;
          } else if (velocity < 0 && activeIndex < cards.length - 1) {
            goToIndex(activeIndex + 1);
            return;
          }
        }
        
        // Check distance for slow swipes
        if (gestureState.dx > threshold && activeIndex > 0) {
          goToIndex(activeIndex - 1);
        } else if (gestureState.dx < -threshold && activeIndex < cards.length - 1) {
          goToIndex(activeIndex + 1);
        } else {
          // Snap back
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

// ...existing code...


  // ...existing code...

const goToIndex = (index: number, isSystemDriven = false) => {
    if (!hasWaitingTether || isSystemDriven) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setActiveIndex(index);
    
    Animated.parallel([
      Animated.spring(panX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65, // Smoother - changed from 80
        friction: 9, // Smoother - changed from 10
        velocity: 2, // ADD: Initial velocity for smoother transition
      }),
      Animated.spring(scrollX, {
        toValue: index * (CARD_WIDTH + SPACING),
        useNativeDriver: true,
        tension: 65, // Smoother - changed from 70
        friction: 9, // Smoother - changed from 11
        velocity: 2, // ADD: Initial velocity
      }),
    ]).start();
  };

// ...existing code...

  const handleCardPress = (card: CarouselCard, index: number) => {
    if (hasWaitingTether && card.id !== waitingTetherCategoryId) {
      // Non-active card tap when waiting tether exists
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (index === activeIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onCardPress(card, index);
    } else if (!hasWaitingTether) {
      goToIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <View 
        style={styles.cardsContainer} 
        {...panResponder.panHandlers}
        // pointerEvents="box-none"
      >
        {cards.map((card, index) => {
          const position = index - activeIndex;
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];

          const combinedValue = Animated.add(scrollX, panX);

          const scale = combinedValue.interpolate({
            inputRange,
            outputRange: [SIDE_CARD_SCALE, 1, SIDE_CARD_SCALE],
            extrapolate: 'clamp',
          });

          const translateX = combinedValue.interpolate({
            inputRange,
            outputRange: [
              -CARD_WIDTH * 0.35,
              0,
              CARD_WIDTH * 0.35,
            ],
            extrapolate: 'clamp',
          });

          const rotateY = combinedValue.interpolate({
            inputRange,
            outputRange: [`${ROTATION_ANGLE}deg`, '0deg', `-${ROTATION_ANGLE}deg`],
            extrapolate: 'clamp',
          });

          const opacity = combinedValue.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          const isActive = index === activeIndex;
          const shouldShowStroke = isActive && (!hasWaitingTether || card.id === waitingTetherCategoryId);
          const isDisabled = hasWaitingTether && card.id !== waitingTetherCategoryId;

          return (
            <Animated.View
              key={card.id}
              style={[
                styles.cardWrapper,
                {
                  transform: [
                    { translateX },
                    { scale },
                    { perspective: CARD_PERSPECTIVE },
                    { rotateY },
                  ],
                  opacity,
                  zIndex: isActive ? 100 : 50 - Math.abs(position),
                },
              ]}
              pointerEvents="box-none" // ADD HERE instead
            >
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => handleCardPress(card, index)}
                disabled={isDisabled}
                style={styles.touchableCard}
                delayPressIn={50} // ADD: Small delay to allow swipe to start
              >
                <View style={[
                  styles.cardBorder,
                  shouldShowStroke && styles.cardBorderActive,
                ]}>
                  <LinearGradient
                    colors={card.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <View style={styles.cardContent}>
                      {/* Top Badge */}
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {card.isLocked ? '🔒 Locked' : '✨ Unlocked'}
                        </Text>
                      </View>

                      {/* Center Content */}
                      <View style={styles.centerContent}>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                        <Text style={styles.cardDescription}>{card.description}</Text>
                      </View>

                      {/* Bottom Progress */}
                      <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${(card.questionsAnswered / card.totalQuestions) * 100}%` 
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {card.questionsAnswered}/{card.totalQuestions} answered
                        </Text>
                      </View>
                    </View>

                    {/* Decorative Elements */}
                    <View style={styles.decorativeCircle1} />
                    <View style={styles.decorativeCircle2} />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Navigation Dots */}
      {!hasWaitingTether && (
        <View style={styles.dotsContainer}>
          {cards.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToIndex(index)}
              style={styles.dotWrapper}
            >
              <View
                style={[
                  styles.dot,
                  index === activeIndex && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    height: CARD_HEIGHT + 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  touchableCard: {
    width: '100%',
    height: '100%',
  },
  cardBorder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    padding: 0,
    backgroundColor: 'transparent',
  },
  cardBorderActive: {
    padding: 2,
    backgroundColor: Colors.darkOrange,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  badgeText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  cardTitle: {
    fontFamily: 'InterTight-Bold',
    fontSize: 28,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 34,
  },
  cardDescription: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 22,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  dotWrapper: {
    padding: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mediumGrey,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.darkOrange,
  },
});