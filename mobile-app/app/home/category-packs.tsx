

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
// import { getCategoryProgress, type CategoryProgress } from '@/services/tether_service';

// // Map category names to gradients
// const categoryGradients: Record<string, string[]> = {
//   'Communication': ['#FF6B6B', '#FF8E53'],
//   'Intimacy': ['#A569BD', '#EC7063'],
//   'Playfulness': ['#5DADE2', '#48C9B0'],
//   'Trust': ['#F39C12', '#E74C3C'],
//   'Love Languages': ['#16A085', '#27AE60'],
//   'Future': ['#E74C3C', '#C0392B'],
//   'Vulnerability': ['#8E44AD', '#9B59B6'],
//   'Conflict': ['#F1C40F', '#F39C12'],
//   'Erotic': ['#3498DB', '#2980B9'],
//   'Gratitude': ['#1ABC9C', '#16A085'],
// };

// export default function CategoryPacksScreen() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [categories, setCategories] = useState<CarouselCard[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [chatCount, setChatCount] = useState(6);
//   const [hasNewActivity, setHasNewActivity] = useState(true);
  
//   const [hasWaitingTether, setHasWaitingTether] = useState(false);
//   const [waitingTetherCategoryId, setWaitingTetherCategoryId] = useState('1');

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const loadCategories = async () => {
//     try {
//       const response = await getCategoryProgress();
      
//       console.log('Category progress response:', response);
      
//       // Backend returns { success: true, progress: [...] }
//       const categoryData = response.progress || [];
      
//       if (!Array.isArray(categoryData) || categoryData.length === 0) {
//         console.warn('No categories found in response, may need to initialize');
//         Alert.alert(
//           'Setup Required',
//           'Setting up your category packs. Please try again in a moment.'
//         );
//         setCategories([]);
//         return;
//       }
      
//       // Map backend CoupleCategoryState to CarouselCard format
//       // Backend returns: { coupleId, categoryId, answeredCount, totalQuestions, skippedCount, unlocked, ... }
//       const mappedCategories: CarouselCard[] = categoryData.map((cat: any) => {
//         const categoryNames: Record<string, string> = { ... }
//         // Get category name from categoryId
//         // const categoryNames: Record<string, string> = {
//         //   'COMMUNICATION': 'Communication',
//         //   'INTIMACY': 'Intimacy',
//         //   'PLAYFULNESS': 'Playfulness',
//         //   'TRUST': 'Trust',
//         //   'LOVE_LANGUAGES': 'Love Languages',
//         //   'FUTURE': 'Future',
//         //   'VULNERABILITY': 'Vulnerability',
//         //   'CONFLICT': 'Conflict',
//         //   'EROTIC': 'Erotic',
//         //   'GRATITUDE': 'Gratitude',
//          //};
        
       
       
//         return {
//           id: cat.categoryId,
//           title: cat.categoryName || cat.categoryId,
//           description: `Explore ${cat.description.toLowerCase()} together`,
//           questionsAnswered: cat.answeredCount || 0,
//           totalQuestions: cat.totalQuestions || 180,
//           // gradient: gradient as unknown as readonly [string, string],
//           isLocked: !cat.unlocked,
//         };
//       });
      
//       setCategories(mappedCategories);
//     } catch (error) {
//       console.error('Failed to load categories:', error);
//       Alert.alert('Error', 'Failed to load category packs. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCardPress = async (card: CarouselCard, index: number) => {
//     if (card.isLocked) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
//       router.push('/');
//     } else {
//       router.push({
//         pathname: '/home/category-question',
//         params: {
//           categoryId: card.id,
//           categoryTitle: card.title,
//         },
//       });
//     }
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
//       showSettingsIcon={true}
//       showChatIcon={true}
//       chatCount={chatCount}
//     >
//       <View style={styles.container}>
//         {/* Header Section */}
//         <View style={styles.headerSection}>
//           <Text style={styles.mainTitle}>Category Packs</Text>
//           <Text style={styles.subtitle}>
//             Choose an unlocked category to answer a Tether...
//           </Text>
//         </View>

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
//   headerSection: {
//     paddingHorizontal: Spacing.xl,
//     paddingTop: Spacing.sm,
//     paddingBottom: Spacing.lg,
//     alignItems: 'center',
//   },
//   mainTitle: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: 32,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     marginBottom: Spacing.sm,
//   },
//   subtitle: {
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
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import Card3DCarousel, { CarouselCard } from '../../components/ui/cards/CardCarousel';
import { Colors, Spacing, FontSizes, FontWeights } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { getCategoryProgress } from '@/services/tether_service';
import { useTetherStats } from '@/hooks/useTetherStats';

export default function CategoryPacksScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CarouselCard[]>([]);
  const [loading, setLoading] = useState(true);
  const tetherStats = useTetherStats();

  // Dummy values — replace with real logic later
  const [hasWaitingTether] = useState(false);
  const [waitingTetherCategoryId] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoryProgress();

      console.log('Category progress response:', response);

      const categoryData = response.progress || [];

      if (!Array.isArray(categoryData) || categoryData.length === 0) {
        Alert.alert(
          'No Categories',
          'No category packs available yet. Please contact support.'
        );
        setCategories([]);
        return;
      }

      const mappedCategories: CarouselCard[] = categoryData.map((cat: any) => {
        // Use name and color from backend (populated in controller)
        const categoryName = cat.categoryName || cat.categoryId;
        const baseColor = cat.colorCode || '#FF9E6D'; // fallback orange

        return {
          id: cat.categoryId,
          title: categoryName,
          description: `Explore ${categoryName.toLowerCase()} together`,
          questionsAnswered: cat.answeredCount || 0,
          totalQuestions: cat.totalQuestions || 180,
          gradient: [baseColor, `${baseColor}CC`] as [string, string], // Add transparency for gradient
          isLocked: !cat.unlocked,
        };
      });

      setCategories(mappedCategories);
    } catch (error: any) {
  console.error('Failed to load categories:', error);

  if (error.message === 'WAITING_FOR_PARTNER') {
    router.push('/home/waiting-for-partner'); // ← Navigate to new screen
  } else {
    Alert.alert('Error', error.message || 'Failed to load category packs.');
  }
} finally {
      setLoading(false);
    }
  };

  const handleCardPress = async (card: CarouselCard) => {
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
      chatCount={tetherStats.count}
      chatIconActive={tetherStats.isActive}
      onChatPress={() => {
        tetherStats.markAsViewed();
        router.push('/home/tether-history');
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Category Packs</Text>
          <Text style={styles.subtitle}>
            Choose an unlocked category to answer a Tether...
          </Text>
        </View>

        {/* Carousel */}
        <View style={styles.carouselWrapper}>
          <Card3DCarousel
            cards={categories}
            onCardPress={handleCardPress}
            activeIndex={0}
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
    marginTop: Spacing.md,
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
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 24,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});