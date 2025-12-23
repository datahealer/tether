// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import Card3DCarousel, { CarouselCard } from '../../components/ui/cards/CardCarousel';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
// import { useAuth } from '@/context/auth_context';

// const mockCategories: CarouselCard[] = [
//   {
//     id: '1',
//     title: 'Improve your Communication',
//     description: 'Figure out what each of you really means beneath the words.',
//     questionsAnswered: 3,
//     totalQuestions: 150,
//     gradient: ['#FF6B6B', '#FF8E53'],
//     isLocked: false,
//   },
//   {
//     id: '2',
//     title: 'Deepen Intimacy',
//     description: 'Explore emotional and physical connection on a deeper level.',
//     questionsAnswered: 0,
//     totalQuestions: 120,
//     gradient: ['#A569BD', '#EC7063'],
//     isLocked: false,
//   },
//   {
//     id: '3',
//     title: 'Navigate Conflict',
//     description: 'Learn healthy ways to disagree and grow stronger together.',
//     questionsAnswered: 0,
//     totalQuestions: 100,
//     gradient: ['#5DADE2', '#48C9B0'],
//     isLocked: true,
//   },
//   {
//     id: '4',
//     title: 'Build Trust',
//     description: 'Strengthen the foundation of your relationship.',
//     questionsAnswered: 0,
//     totalQuestions: 90,
//     gradient: ['#F39C12', '#E74C3C'],
//     isLocked: true,
//   },
//   {
//     id: '5',
//     title: 'Future Planning',
//     description: 'Align your dreams and goals for the life ahead.',
//     questionsAnswered: 0,
//     totalQuestions: 110,
//     gradient: ['#16A085', '#27AE60'],
//     isLocked: true,
//   },
// ];

// export default function CategoryPacksScreen() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [categories, setCategories] = useState<CarouselCard[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [streakCount, setStreakCount] = useState(5);
//   const [chatCount, setChatCount] = useState(6);
//   const [hasNewActivity, setHasNewActivity] = useState(true);
  
//   // Set to false to enable swiping (true blocks swipe when waiting for partner)
//   const [hasWaitingTether, setHasWaitingTether] = useState(false);
//   const [waitingTetherCategoryId, setWaitingTetherCategoryId] = useState('1');

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const loadCategories = async () => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setCategories(mockCategories);
//     } catch (error) {
//       console.error('Failed to load categories:', error);
//       Alert.alert('Error', 'Failed to load category packs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCardPress = async (card: CarouselCard, index: number) => {
//     if (card.isLocked) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//       // Navigate to unlock premium screen
//       router.push({
//         pathname: '/home/unlock-pack',
//         params: {
//           categoryId: card.id,
//           categoryTitle: card.title,
//         },
//       });
//       return;
//     }

//     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
//     if (hasWaitingTether && card.id === waitingTetherCategoryId) {
//       // Navigate to past tethers or waiting answer screen
//       router.push('/');
//     } else {
//       // Navigate to new question
//       router.push({
//         pathname: '/(tabs)',
//         params: {
//           categoryId: card.id,
//           categoryTitle: card.title,
//         },
//       });
//     }
//   };

//   const handleStreakPress = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     Alert.alert(
//       `${streakCount} Day Streak! 🔥`,
//       'Keep it up! Complete a tether every day to maintain your streak.',
//       [{ text: 'Got it!', style: 'default' }]
//     );
//   };

//   const handleChatPress = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setHasNewActivity(false);
//     router.push('/');
//   };

//   const handleBannerPress = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     router.push('/');
//   };

//   if (loading) {
//     return (
//       <OnboardingLayout showBackButton={false} showLogo={false} showHeartLogo={true}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={Colors.darkOrange} />
//           <Text style={styles.loadingText}>Loading category packs...</Text>
//         </View>
//       </OnboardingLayout>
//     );
//   }

//   return (
//     <OnboardingLayout 
//       showBackButton={false}
//       showHeartLogo={true}
//       showLogo={false}
//       rightButton={
//         <View style={styles.headerRight}>
//           {/* Chat Icon */}
//           <TouchableOpacity 
//             style={[
//               styles.chatButton,
//               hasNewActivity && styles.chatButtonActive
//             ]}
//             onPress={handleChatPress}
//           >
//             <Ionicons 
//               name="chatbubble" 
//               size={20} 
//               color={hasNewActivity ? Colors.white : Colors.black} 
//             />
//             {chatCount > 0 && (
//               <View style={styles.chatBadge}>
//                 <Text style={styles.chatBadgeText}>{chatCount}</Text>
//               </View>
//             )}
//           </TouchableOpacity>

//           {/* Streak Counter */}
//           <TouchableOpacity 
//             style={styles.streakButton}
//             onPress={handleStreakPress}
//           >
//             <Text style={styles.streakIcon}>🔥</Text>
//             <Text style={styles.streakCount}>{streakCount}</Text>
//           </TouchableOpacity>

//           {/* Settings */}
//           <TouchableOpacity 
//             style={styles.settingsButton}
//             onPress={() => router.push('/onboarding/settings/settings')}
//           >
//             <Ionicons name="settings-outline" size={24} color={Colors.black} />
//           </TouchableOpacity>
//         </View>
//       }
//     >
//       <View style={styles.container}>
//         {/* Waiting Tether Banner */}
//         {hasWaitingTether && (
//           <TouchableOpacity 
//             style={styles.bannerContainer}
//             onPress={handleBannerPress}
//             activeOpacity={0.9}
//           >
//             <View style={styles.banner}>
//               <Text style={styles.bannerTitle}>
//                 You have an answer{'\n'}waiting for you...
//               </Text>
//               <Text style={styles.bannerSubtitle}>
//                 Check your Tether history!
//               </Text>
//             </View>
//           </TouchableOpacity>
//         )}

//         {/* 3D Card Carousel */}
//         <View style={styles.carouselWrapper}>
//           <Card3DCarousel
//             cards={categories}
//             onCardPress={handleCardPress}
//             activeIndex={activeIndex}
//             hasWaitingTether={hasWaitingTether}
//             waitingTetherCategoryId={waitingTetherCategoryId}
//           />
//         </View>

//         {/* Instructions - only show when no waiting tether */}
//         {!hasWaitingTether && (
//           <View style={styles.instructionsCard}>
//             <View style={styles.instructionRow}>
//               <Ionicons name="swap-horizontal" size={20} color={Colors.darkOrange} />
//               <Text style={styles.instructionText}>Swipe to explore packs</Text>
//             </View>
//             <View style={styles.instructionRow}>
//               <Ionicons name="finger-print" size={20} color={Colors.darkOrange} />
//               <Text style={styles.instructionText}>Tap to answer questions</Text>
//             </View>
//             <View style={styles.instructionRow}>
//               <Ionicons name="lock-closed" size={20} color={Colors.mediumGrey} />
//               <Text style={styles.instructionText}>Complete packs to unlock more</Text>
//             </View>
//           </View>
//         )}
//       </View>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: Spacing.md,
//   },
//   loadingText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.medium,
//     color: Colors.inputText,
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },
//   chatButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   chatButtonActive: {
//     backgroundColor: Colors.darkOrange,
//   },
//   chatBadge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     backgroundColor: Colors.darkOrange,
//     borderRadius: 10,
//     minWidth: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 6,
//     borderWidth: 2,
//     borderColor: Colors.cream,
//   },
//   chatBadgeText: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: 11,
//     fontWeight: FontWeights.bold,
//     color: Colors.white,
//   },
//   streakButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: Colors.veryLightOrange,
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: Spacing.xs,
//     borderRadius: 20,
//     gap: 4,
//   },
//   streakIcon: {
//     fontSize: 16,
//   },
//   streakCount: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.bold,
//     color: Colors.darkOrange,
//   },
//   settingsButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   bannerContainer: {
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.md,
//     paddingBottom: Spacing.sm,
//   },
//   banner: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.lg,
//     alignItems: 'center',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   bannerTitle: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.heading,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     textAlign: 'center',
//     marginBottom: Spacing.xs,
//     lineHeight: 34,
//   },
//   bannerSubtitle: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.description,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     textAlign: 'center',
//   },
//   carouselWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   instructionsCard: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.lg,
//     marginHorizontal: Spacing.md,
//     marginBottom: Spacing.xl,
//     gap: Spacing.md,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   instructionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },
//   instructionText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.medium,
//     color: Colors.black,
//     flex: 1,
//   },
// });


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import Card3DCarousel, { CarouselCard } from '../../components/ui/cards/CardCarousel';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
// import { useAuth } from '@/context/auth_context';

// const mockCategories: CarouselCard[] = [
//   {
//     id: '1',
//     title: 'Improve your Communication',
//     description: 'Figure out what each of you really means beneath the words.',
//     questionsAnswered: 3,
//     totalQuestions: 150,
//     gradient: ['#FF6B6B', '#FF8E53'],
//     isLocked: false,
//   },
//   {
//     id: '2',
//     title: 'Deepen Intimacy',
//     description: 'Explore emotional and physical connection on a deeper level.',
//     questionsAnswered: 0,
//     totalQuestions: 120,
//     gradient: ['#A569BD', '#EC7063'],
//     isLocked: false,
//     isTemporary: true,
//     daysLeft: 5,
//   },
//   {
//     id: '3',
//     title: 'Navigate Conflict',
//     description: 'Learn healthy ways to disagree and grow stronger together.',
//     questionsAnswered: 0,
//     totalQuestions: 100,
//     gradient: ['#5DADE2', '#48C9B0'],
//     isLocked: true,
//   },
//   {
//     id: '4',
//     title: 'Build Trust',
//     description: 'Strengthen the foundation of your relationship.',
//     questionsAnswered: 0,
//     totalQuestions: 90,
//     gradient: ['#F39C12', '#E74C3C'],
//     isLocked: true,
//   },
//   {
//     id: '5',
//     title: 'Future Planning',
//     description: 'Align your dreams and goals for the life ahead.',
//     questionsAnswered: 0,
//     totalQuestions: 110,
//     gradient: ['#16A085', '#27AE60'],
//     isLocked: true,
//   },
// ];

// export default function CategoryPacksScreen() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [categories, setCategories] = useState<CarouselCard[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [chatCount, setChatCount] = useState(6);
//   const [hasNewActivity, setHasNewActivity] = useState(true);
  
//   // Set to false to enable swiping (true blocks swipe when waiting for partner)
//   const [hasWaitingTether, setHasWaitingTether] = useState(false);
//   const [waitingTetherCategoryId, setWaitingTetherCategoryId] = useState('1');

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const loadCategories = async () => {
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setCategories(mockCategories);
//     } catch (error) {
//       console.error('Failed to load categories:', error);
//       Alert.alert('Error', 'Failed to load category packs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCardPress = async (card: CarouselCard, index: number) => {
//     if (card.isLocked) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//       // Navigate to unlock premium screen
//       router.push({
//         pathname: '/home/unlock-pack',
//         params: {
//           categoryId: card.id,
//           categoryTitle: card.title,
//         },
//       });
//       return;
//     }

//     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
//     if (hasWaitingTether && card.id === waitingTetherCategoryId) {
//       // Navigate to past tethers or waiting answer screen
//       router.push('/');
//     } else {
//       // Navigate to category question screen
//       router.push({
//         pathname: '/home/category-question',
//         params: {
//           categoryId: card.id,
//           categoryTitle: card.title,
//         },
//       });
//     }
//   };

//   // const handleChatPress = () => {
//   //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//   //   setHasNewActivity(false);
//   //   router.push('/');
//   // };

//   const handleBannerPress = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     router.push('/');
//   };

//   if (loading) {
//     return (
//       <OnboardingLayout showBackButton={false} showLogo={false} showHeartLogo={true}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={Colors.darkOrange} />
//           <Text style={styles.loadingText}>Loading category packs...</Text>
//         </View>
//       </OnboardingLayout>
//     );
//   }

//   return (
//     <OnboardingLayout 
//       showBackButton={false}
//       showHeartLogo={true}
//       showLogo={false}
//       showSettingsIcon={true}
//       showChatIcon={true}
//       chatCount={chatCount}
      
//     >
//       <View style={styles.container}>
//         {/* Waiting Tether Banner */}
//         {hasWaitingTether && (
//           <TouchableOpacity 
//             style={styles.bannerContainer}
//             onPress={handleBannerPress}
//             activeOpacity={0.9}
//           >
//             <View style={styles.banner}>
//               <Text style={styles.bannerTitle}>
//                 You have an answer{'\n'}waiting for you...
//               </Text>
//               <Text style={styles.bannerSubtitle}>
//                 Check your Tether history!
//               </Text>
//             </View>
//           </TouchableOpacity>
//         )}

//         {/* 3D Card Carousel */}
//         <View style={styles.carouselWrapper}>
//           <Card3DCarousel
//             cards={categories}
//             onCardPress={handleCardPress}
//             activeIndex={activeIndex}
//             hasWaitingTether={hasWaitingTether}
//             waitingTetherCategoryId={waitingTetherCategoryId}
//           />
//         </View>

//         {/* Instructions - only show when no waiting tether */}
//         {!hasWaitingTether && (
//           <View style={styles.instructionsCard}>
//             <View style={styles.instructionRow}>
//               <Ionicons name="swap-horizontal" size={20} color={Colors.darkOrange} />
//               <Text style={styles.instructionText}>Swipe to explore packs</Text>
//             </View>
//             <View style={styles.instructionRow}>
//               <Ionicons name="finger-print" size={20} color={Colors.darkOrange} />
//               <Text style={styles.instructionText}>Tap to answer questions</Text>
//             </View>
//             <View style={styles.instructionRow}>
//               <Ionicons name="lock-closed" size={20} color={Colors.mediumGrey} />
//               <Text style={styles.instructionText}>Complete packs to unlock more</Text>
//             </View>
//           </View>
//         )}
//       </View>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: Spacing.md,
//   },
//   loadingText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.medium,
//     color: Colors.inputText,
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },
//   chatButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   chatButtonActive: {
//     backgroundColor: Colors.darkOrange,
//   },
//   chatBadge: {
//     position: 'absolute',
//     top: -4,
//     right: -4,
//     backgroundColor: Colors.darkOrange,
//     borderRadius: 10,
//     minWidth: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 6,
//     borderWidth: 2,
//     borderColor: Colors.cream,
//   },
//   chatBadgeText: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: 11,
//     fontWeight: FontWeights.bold,
//     color: Colors.white,
//   },
//   settingsButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   bannerContainer: {
//     paddingHorizontal: Spacing.md,
//     paddingTop: Spacing.md,
//     paddingBottom: Spacing.sm,
//   },
//   banner: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.lg,
//     alignItems: 'center',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   bannerTitle: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.heading,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     textAlign: 'center',
//     marginBottom: Spacing.xs,
//     lineHeight: 34,
//   },
//   bannerSubtitle: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.description,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     textAlign: 'center',
//   },
//   carouselWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   instructionsCard: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.lg,
//     marginHorizontal: Spacing.md,
//     marginBottom: Spacing.xl,
//     gap: Spacing.md,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   instructionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//   },
//   instructionText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.medium,
//     color: Colors.black,
//     flex: 1,
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import Card3DCarousel, { CarouselCard } from '../../components/ui/cards/CardCarousel';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { getCategoryProgress, type CategoryProgress } from '@/services/tether_service';

// Map category names to gradients
const categoryGradients: Record<string, string[]> = {
  'Communication': ['#FF6B6B', '#FF8E53'],
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

export default function CategoryPacksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CarouselCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chatCount, setChatCount] = useState(6);
  const [hasNewActivity, setHasNewActivity] = useState(true);
  
  const [hasWaitingTether, setHasWaitingTether] = useState(false);
  const [waitingTetherCategoryId, setWaitingTetherCategoryId] = useState('1');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getCategoryProgress();
      
      console.log('Category progress response:', response);
      
      // Backend returns { success: true, progress: [...] }
      const categoryData = response.progress || [];
      
      if (!Array.isArray(categoryData) || categoryData.length === 0) {
        console.warn('No categories found in response, may need to initialize');
        Alert.alert(
          'Setup Required',
          'Setting up your category packs. Please try again in a moment.'
        );
        setCategories([]);
        return;
      }
      
      // Map backend CoupleCategoryState to CarouselCard format
      // Backend returns: { coupleId, categoryId, answeredCount, totalQuestions, skippedCount, unlocked, ... }
      const mappedCategories: CarouselCard[] = categoryData.map((cat: any) => {
        // Get category name from categoryId
        const categoryNames: Record<string, string> = {
          'COMMUNICATION': 'Communication',
          'INTIMACY': 'Intimacy',
          'PLAYFULNESS': 'Playfulness',
          'TRUST': 'Trust',
          'LOVE_LANGUAGES': 'Love Languages',
          'FUTURE': 'Future',
          'VULNERABILITY': 'Vulnerability',
          'CONFLICT': 'Conflict',
          'EROTIC': 'Erotic',
          'GRATITUDE': 'Gratitude',
        };
        
        const categoryName = categoryNames[cat.categoryId] || cat.categoryId;
        const colorCode = categoryGradients[categoryName] ? categoryGradients[categoryName][0] : '#FFB8A0';
        const gradient = categoryGradients[categoryName] || ['#FFB8A0', '#FFA07A'];
        
        return {
          id: cat.categoryId,
          title: categoryName,
          description: `Explore ${categoryName.toLowerCase()} together`,
          questionsAnswered: cat.answeredCount || 0,
          totalQuestions: cat.totalQuestions || 180,
          gradient: gradient as unknown as readonly [string, string],
          isLocked: !cat.unlocked,
        };
      });
      
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load category packs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = async (card: CarouselCard, index: number) => {
    if (card.isLocked) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push({
        pathname: '/home/unlock-pack',
        params: {
          categoryId: card.id,
          categoryTitle: card.title,
        },
      });
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (hasWaitingTether && card.id === waitingTetherCategoryId) {
      router.push('/');
    } else {
      router.push({
        pathname: '/home/category-question',
        params: {
          categoryId: card.id,
          categoryTitle: card.title,
        },
      });
    }
  };

  const handleBannerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/');
  };

  if (loading) {
    return (
      <OnboardingLayout showBackButton={false} showLogo={false} showHeartLogo={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkOrange} />
          <Text style={styles.loadingText}>Loading category packs...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      showBackButton={false}
      showHeartLogo={true}
      showLogo={false}
      showSettingsIcon={true}
      showChatIcon={true}
      chatCount={chatCount}
    >
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Category Packs</Text>
          <Text style={styles.subtitle}>
            Choose an unlocked category to answer a Tether...
          </Text>
        </View>

        {/* 3D Card Carousel */}
        <View style={styles.carouselWrapper}>
          <Card3DCarousel
            cards={categories}
            onCardPress={handleCardPress}
            activeIndex={activeIndex}
            hasWaitingTether={hasWaitingTether}
            waitingTetherCategoryId={waitingTetherCategoryId}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  mainTitle: {
    fontFamily: 'InterTight-Bold',
    fontSize: 32,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});