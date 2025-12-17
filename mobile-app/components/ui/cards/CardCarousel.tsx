// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   Text,
//   Animated,
//   PanResponder,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Haptics from 'expo-haptics';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../../theme/constants';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const CARD_WIDTH = SCREEN_WIDTH * 0.72;
// const CARD_HEIGHT = CARD_WIDTH * 1.4;
// const SPACING = 20;
// const SIDE_CARD_SCALE = 0.9;
// const CARD_PERSPECTIVE = 1200;
// const ROTATION_ANGLE = 20;

// export interface CarouselCard {
//   id: string;
//   title: string;
//   description: string;
//   questionsAnswered: number;
//   totalQuestions: number;
//   gradient: readonly [string, string, ...string[]];
//   isLocked?: boolean;
// }

// interface Card3DCarouselProps {
//   cards: CarouselCard[];
//   onCardPress: (card: CarouselCard, index: number) => void;
//   activeIndex?: number;
//   hasWaitingTether?: boolean;
//   waitingTetherCategoryId?: string;
// }

// export default function Card3DCarousel({ 
//   cards, 
//   onCardPress,
//   activeIndex: controlledIndex,
//   hasWaitingTether = false,
//   waitingTetherCategoryId
// }: Card3DCarouselProps) {
//   const [activeIndex, setActiveIndex] = useState(controlledIndex || 0);
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const panX = useRef(new Animated.Value(0)).current;
  
//   // Debug flag - set to true to see logs
//   const DEBUG = true;
//   const log = (...args: any[]) => {
//     if (DEBUG) console.log('[CardCarousel]', ...args);
//   };

//   // Auto-scroll to waiting tether on mount if needed
//   useEffect(() => {
//     if (hasWaitingTether && waitingTetherCategoryId) {
//       const tetherIndex = cards.findIndex(card => card.id === waitingTetherCategoryId);
//       if (tetherIndex !== -1 && tetherIndex !== activeIndex) {
//         setTimeout(() => {
//           goToIndex(tetherIndex, true);
//         }, 300);
//       }
//     }
//   }, [hasWaitingTether, waitingTetherCategoryId]);

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: (_, gestureState) => {
//         log('onStartShouldSetPanResponder', { dx: gestureState.dx, dy: gestureState.dy });
//         return false;
//       },
//       onStartShouldSetPanResponderCapture: (_, gestureState) => {
//         log('onStartShouldSetPanResponderCapture', { dx: gestureState.dx, dy: gestureState.dy });
//         return false;
//       },
//       onMoveShouldSetPanResponder: (_, gestureState) => {
//         const shouldSet = Math.abs(gestureState.dx) > 2 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
//         log('onMoveShouldSetPanResponder', { 
//           dx: gestureState.dx, 
//           dy: gestureState.dy, 
//           shouldSet,
//           hasWaitingTether 
//         });
//         return shouldSet;
//       },
//       onMoveShouldSetPanResponderCapture: (_, gestureState) => {
//         const shouldCapture = Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
//         log('onMoveShouldSetPanResponderCapture', { 
//           dx: gestureState.dx, 
//           dy: gestureState.dy, 
//           shouldCapture 
//         });
//         return shouldCapture;
//       },
//       onPanResponderTerminationRequest: () => {
//         log('onPanResponderTerminationRequest - returning false to keep control');
//         return false;
//       },
//       onPanResponderGrant: (_, gestureState) => {
//         log('✅ PAN RESPONDER GRANTED!', { dx: gestureState.dx, dy: gestureState.dy });
//         if (!hasWaitingTether) {
//           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         }
//         panX.stopAnimation();
//         panX.setOffset(0);
//         panX.setValue(0);
//       },
//       onPanResponderMove: (_, gestureState) => {
//         log('onPanResponderMove', { 
//           dx: gestureState.dx, 
//           vx: gestureState.vx,
//           hasWaitingTether 
//         });
//         if (!hasWaitingTether) {
//           panX.setValue(gestureState.dx);
//         }
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         log('onPanResponderRelease', { 
//           dx: gestureState.dx, 
//           vx: gestureState.vx,
//           activeIndex,
//           cardsLength: cards.length
//         });
        
//         if (hasWaitingTether) {
//           log('Has waiting tether - resetting position');
//           Animated.spring(panX, {
//             toValue: 0,
//             useNativeDriver: true,
//             tension: 100,
//             friction: 10,
//           }).start();
//           return;
//         }

//         panX.flattenOffset();
//         const threshold = CARD_WIDTH / 8; // Super sensitive threshold (~36px)
//         const velocity = gestureState.vx;
        
//         log('Checking swipe', { threshold, velocity, dx: gestureState.dx });
        
//         // Prioritize distance first, then velocity
//         // Right swipe (going to previous card)
//         if (gestureState.dx > threshold && activeIndex > 0) {
//           log('Swipe RIGHT detected (distance) - going to index', activeIndex - 1);
//           goToIndex(activeIndex - 1);
//           return;
//         }
        
//         // Left swipe (going to next card)
//         if (gestureState.dx < -threshold && activeIndex < cards.length - 1) {
//           log('Swipe LEFT detected (distance) - going to index', activeIndex + 1);
//           goToIndex(activeIndex + 1);
//           return;
//         }
        
//         // Check velocity for quick swipes (backup check)
//         if (Math.abs(velocity) > 0.15) {
//           if (velocity > 0 && activeIndex > 0) {
//             log('Quick swipe RIGHT (velocity) - going to index', activeIndex - 1);
//             goToIndex(activeIndex - 1);
//             return;
//           } else if (velocity < 0 && activeIndex < cards.length - 1) {
//             log('Quick swipe LEFT (velocity) - going to index', activeIndex + 1);
//             goToIndex(activeIndex + 1);
//             return;
//           }
//         }
        
//         // If no conditions met, snap back
//         log('Swipe not enough - snapping back');
//         Animated.spring(panX, {
//           toValue: 0,
//           useNativeDriver: true,
//           tension: 100,
//           friction: 10,
//         }).start();
//       },
//       onPanResponderTerminate: (_, gestureState) => {
//         log('❌ PAN RESPONDER TERMINATED!', { dx: gestureState.dx, dy: gestureState.dy });
//         Animated.spring(panX, {
//           toValue: 0,
//           useNativeDriver: true,
//           tension: 100,
//           friction: 10,
//         }).start();
//       },
//     })
//   ).current;

//   const goToIndex = (index: number, isSystemDriven = false) => {
//     log('goToIndex called', { index, isSystemDriven, hasWaitingTether });
//     if (!hasWaitingTether || isSystemDriven) {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
    
//     setActiveIndex(index);
    
//     Animated.parallel([
//       Animated.spring(panX, {
//         toValue: 0,
//         useNativeDriver: true,
//         tension: 90,
//         friction: 7,
//       }),
//       Animated.spring(scrollX, {
//         toValue: index * (CARD_WIDTH + SPACING),
//         useNativeDriver: true,
//         tension: 90,
//         friction: 7,
//       }),
//     ]).start(() => {
//       log('Animation complete - now at index', index);
//     });
//   };

//   const handleCardPress = (card: CarouselCard, index: number) => {
//     log('handleCardPress', { cardId: card.id, index, activeIndex, hasWaitingTether });
//     if (hasWaitingTether && card.id !== waitingTetherCategoryId) {
//       // Non-active card tap when waiting tether exists
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//       return;
//     }

//     if (index === activeIndex) {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
//       onCardPress(card, index);
//     } else if (!hasWaitingTether) {
//       goToIndex(index);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View 
//         style={styles.cardsContainer} 
//         {...panResponder.panHandlers}
//         // pointerEvents="box-none"
//       >
//         {cards.map((card, index) => {
//           const position = index - activeIndex;
//           const inputRange = [
//             (index - 1) * (CARD_WIDTH + SPACING),
//             index * (CARD_WIDTH + SPACING),
//             (index + 1) * (CARD_WIDTH + SPACING),
//           ];

//           const combinedValue = Animated.add(scrollX, panX);

//           const scale = combinedValue.interpolate({
//             inputRange,
//             outputRange: [SIDE_CARD_SCALE, 1, SIDE_CARD_SCALE],
//             extrapolate: 'clamp',
//           });

//           const translateX = combinedValue.interpolate({
//             inputRange,
//             outputRange: [
//               -CARD_WIDTH * 0.35,
//               0,
//               CARD_WIDTH * 0.35,
//             ],
//             extrapolate: 'clamp',
//           });

//           const rotateY = combinedValue.interpolate({
//             inputRange,
//             outputRange: [`${ROTATION_ANGLE}deg`, '0deg', `-${ROTATION_ANGLE}deg`],
//             extrapolate: 'clamp',
//           });

//           const opacity = combinedValue.interpolate({
//             inputRange,
//             outputRange: [0.4, 1, 0.4],
//             extrapolate: 'clamp',
//           });

//           const isActive = index === activeIndex;
//           const shouldShowStroke = isActive && (!hasWaitingTether || card.id === waitingTetherCategoryId);
//           const isDisabled = hasWaitingTether && card.id !== waitingTetherCategoryId;

//           return (
//             <Animated.View
//               key={card.id}
//               style={[
//                 styles.cardWrapper,
//                 {
//                   transform: [
//                     { translateX },
//                     { scale },
//                     { perspective: CARD_PERSPECTIVE },
//                     { rotateY },
//                   ],
//                   opacity,
//                   zIndex: isActive ? 100 : 50 - Math.abs(position),
//                 },
//               ]}
//               pointerEvents="box-none" // ADD HERE instead
//             >
//               <TouchableOpacity
//                 activeOpacity={0.95}
//                 onPress={() => handleCardPress(card, index)}
//                 disabled={isDisabled}
//                 style={styles.touchableCard}
//                 delayPressIn={50} // ADD: Small delay to allow swipe to start
//               >
//                 <View style={[
//                   styles.cardBorder,
//                   shouldShowStroke && styles.cardBorderActive,
//                 ]}>
//                   <LinearGradient
//                     colors={card.gradient}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 1 }}
//                     style={styles.card}
//                   >
//                     <View style={styles.cardContent}>
//                       {/* Top Badge */}
//                       <View style={styles.badge}>
//                         <Text style={styles.badgeText}>
//                           {card.isLocked ? '🔒 Locked' : '✨ Unlocked'}
//                         </Text>
//                       </View>

//                       {/* Center Content */}
//                       <View style={styles.centerContent}>
//                         <Text style={styles.cardTitle}>{card.title}</Text>
//                         <Text style={styles.cardDescription}>{card.description}</Text>
//                       </View>

//                       {/* Bottom Progress */}
//                       <View style={styles.progressSection}>
//                         <View style={styles.progressBar}>
//                           <View 
//                             style={[
//                               styles.progressFill, 
//                               { 
//                                 width: `${(card.questionsAnswered / card.totalQuestions) * 100}%` 
//                               }
//                             ]} 
//                           />
//                         </View>
//                         <Text style={styles.progressText}>
//                           {card.questionsAnswered}/{card.totalQuestions} answered
//                         </Text>
//                       </View>
//                     </View>

//                     {/* Decorative Elements */}
//                     <View style={styles.decorativeCircle1} />
//                     <View style={styles.decorativeCircle2} />
//                   </LinearGradient>
//                 </View>
//               </TouchableOpacity>
//             </Animated.View>
//           );
//         })}
//       </View>

//       {/* Navigation Dots */}
//       {!hasWaitingTether && (
//         <View style={styles.dotsContainer}>
//           {cards.map((_, index) => (
//             <TouchableOpacity
//               key={index}
//               onPress={() => goToIndex(index)}
//               style={styles.dotWrapper}
//             >
//               <View
//                 style={[
//                   styles.dot,
//                   index === activeIndex && styles.dotActive,
//                 ]}
//               />
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cardsContainer: {
//     height: CARD_HEIGHT + 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: SCREEN_WIDTH,
//   },
//   cardWrapper: {
//     position: 'absolute',
//     width: CARD_WIDTH,
//     height: CARD_HEIGHT,
//   },
//   touchableCard: {
//     width: '100%',
//     height: '100%',
//   },
//   cardBorder: {
//     width: CARD_WIDTH,
//     height: CARD_HEIGHT,
//     borderRadius: BorderRadius.xl,
//     padding: 0,
//     backgroundColor: 'transparent',
//   },
//   cardBorderActive: {
//     padding: 2,
//     backgroundColor: Colors.darkOrange,
//   },
//   card: {
//     width: '100%',
//     height: '100%',
//     borderRadius: BorderRadius.xl,
//     overflow: 'hidden',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.25,
//     shadowRadius: 24,
//     elevation: 12,
//   },
//   cardContent: {
//     flex: 1,
//     padding: Spacing.xl,
//     justifyContent: 'space-between',
//   },
//   badge: {
//     alignSelf: 'flex-start',
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.xs,
//     borderRadius: BorderRadius.lg,
//   },
//   badgeText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.semibold,
//     color: Colors.white,
//   },
//   centerContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: Spacing.md,
//   },
//   cardTitle: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: 28,
//     fontWeight: FontWeights.bold,
//     color: Colors.white,
//     textAlign: 'center',
//     marginBottom: Spacing.sm,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//     lineHeight: 34,
//   },
//   cardDescription: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.description,
//     fontWeight: FontWeights.regular,
//     color: Colors.white,
//     textAlign: 'center',
//     opacity: 0.95,
//     lineHeight: 22,
//   },
//   progressSection: {
//     gap: Spacing.xs,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: Colors.white,
//     borderRadius: 3,
//   },
//   progressText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.medium,
//     color: Colors.white,
//     textAlign: 'center',
//     opacity: 0.9,
//   },
//   decorativeCircle1: {
//     position: 'absolute',
//     top: -50,
//     right: -50,
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     backgroundColor: 'rgba(255, 255, 255, 0.08)',
//   },
//   decorativeCircle2: {
//     position: 'absolute',
//     bottom: -30,
//     left: -30,
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: 'rgba(255, 255, 255, 0.06)',
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: Spacing.xl,
//     gap: Spacing.sm,
//   },
//   dotWrapper: {
//     padding: Spacing.xs,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: Colors.mediumGrey,
//   },
//   dotActive: {
//     width: 24,
//     backgroundColor: Colors.darkOrange,
//   },
// });
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
const SIDE_CARD_SCALE = 0.98;
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
  isTemporary?: boolean;
  daysLeft?: number;
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
  
  // Debug flag - set to true to see logs
  const DEBUG = false;
  const log = (...args: any[]) => {
    if (DEBUG) console.log('[CardCarousel]', ...args);
  };

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        log('onStartShouldSetPanResponder', { dx: gestureState.dx, dy: gestureState.dy });
        return false;
      },
      onStartShouldSetPanResponderCapture: (_, gestureState) => {
        log('onStartShouldSetPanResponderCapture', { dx: gestureState.dx, dy: gestureState.dy });
        return false;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const shouldSet = Math.abs(gestureState.dx) > 2 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
        log('onMoveShouldSetPanResponder', { 
          dx: gestureState.dx, 
          dy: gestureState.dy, 
          shouldSet,
          hasWaitingTether 
        });
        return shouldSet;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const shouldCapture = Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
        log('onMoveShouldSetPanResponderCapture', { 
          dx: gestureState.dx, 
          dy: gestureState.dy, 
          shouldCapture 
        });
        return shouldCapture;
      },
      onPanResponderTerminationRequest: () => {
        log('onPanResponderTerminationRequest - returning false to keep control');
        return false;
      },
      onPanResponderGrant: (_, gestureState) => {
        log('✅ PAN RESPONDER GRANTED!', { dx: gestureState.dx, dy: gestureState.dy });
        if (!hasWaitingTether) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        panX.stopAnimation();
        panX.setOffset(0);
        panX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        log('onPanResponderMove', { 
          dx: gestureState.dx, 
          vx: gestureState.vx,
          hasWaitingTether 
        });
        if (!hasWaitingTether) {
          panX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        log('onPanResponderRelease', { 
          dx: gestureState.dx, 
          vx: gestureState.vx,
          activeIndex,
          cardsLength: cards.length
        });
        
        if (hasWaitingTether) {
          log('Has waiting tether - resetting position');
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
          return;
        }

        panX.flattenOffset();
        const threshold = CARD_WIDTH / 8; // Super sensitive threshold (~36px)
        const velocity = gestureState.vx;
        
        log('Checking swipe', { threshold, velocity, dx: gestureState.dx });
        
        // Prioritize distance first, then velocity
        // Right swipe (going to previous card)
        if (gestureState.dx > threshold && activeIndex > 0) {
          log('Swipe RIGHT detected (distance) - going to index', activeIndex - 1);
          goToIndex(activeIndex - 1);
          return;
        }
        
        // Left swipe (going to next card)
        if (gestureState.dx < -threshold && activeIndex < cards.length - 1) {
          log('Swipe LEFT detected (distance) - going to index', activeIndex + 1);
          goToIndex(activeIndex + 1);
          return;
        }
        
        // Check velocity for quick swipes (backup check)
        if (Math.abs(velocity) > 0.15) {
          if (velocity > 0 && activeIndex > 0) {
            log('Quick swipe RIGHT (velocity) - going to index', activeIndex - 1);
            goToIndex(activeIndex - 1);
            return;
          } else if (velocity < 0 && activeIndex < cards.length - 1) {
            log('Quick swipe LEFT (velocity) - going to index', activeIndex + 1);
            goToIndex(activeIndex + 1);
            return;
          }
        }
        
        // If no conditions met, snap back
        log('Swipe not enough - snapping back');
        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      },
      onPanResponderTerminate: (_, gestureState) => {
        log('❌ PAN RESPONDER TERMINATED!', { dx: gestureState.dx, dy: gestureState.dy });
        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }).start();
      },
    })
  ).current;

  const goToIndex = (index: number, isSystemDriven = false) => {
    log('goToIndex called', { index, isSystemDriven, hasWaitingTether });
    if (!hasWaitingTether || isSystemDriven) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setActiveIndex(index);
    
    Animated.parallel([
      Animated.spring(panX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 90,
        friction: 7,
      }),
      Animated.spring(scrollX, {
        toValue: index * (CARD_WIDTH + SPACING),
        useNativeDriver: true,
        tension: 90,
        friction: 7,
      }),
    ]).start(() => {
      log('Animation complete - now at index', index);
    });
  };

  const handleCardPress = (card: CarouselCard, index: number) => {
    log('handleCardPress', { cardId: card.id, index, activeIndex, hasWaitingTether });
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

          const shadowOpacityValue = combinedValue.interpolate({
            inputRange,
            outputRange: [0.1, 0.25, 0.1],
            extrapolate: 'clamp',
          });

          const shadowRadiusValue = combinedValue.interpolate({
            inputRange,
            outputRange: [12, 24, 12],
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
              pointerEvents="box-none"
            >
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => handleCardPress(card, index)}
                disabled={isDisabled}
                style={styles.touchableCard}
                delayPressIn={50}
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
                      <View style={styles.badgeContainer}>
                        {card.isTemporary && card.daysLeft !== undefined ? (
                          <View style={styles.expiryPill}>
                            <Text style={styles.badgeText}>
                              {card.daysLeft} days left
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {card.isLocked ? '🔒 Locked' : '✨ Unlocked'}
                            </Text>
                          </View>
                        )}
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
    elevation: 12,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  expiryPill: {
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