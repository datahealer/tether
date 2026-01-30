// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   DebouncedButton,
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   RefreshControl,
// } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import QuestionCard from '../../components/ui/cards/QuestionCard';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
// import { useAuth } from '@/context/auth_context';
// import { useOnboarding } from '@/context/onboarding_context';
// import {
//   getActiveTethers,
//   submitAnswer,
//   skipTether,
//   type TetherQuestion,
//   type TetherStats,
// } from '@/services/tether_service';

// interface Question {
//   id: string;
//   text: string;
//   categoryId: string;
//   categoryName: string;
// }

// export default function CategoryQuestionScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const { user } = useAuth();
//   const { onboardingData } = useOnboarding();
  
//   const categoryId = params.categoryId as string;
//   const categoryTitle = params.categoryTitle as string;

//   // Get partner name from user profile first, then onboarding context, then fallback
//   const partnerName = user?.onboardingData?.partnerFirstName || 
//                       onboardingData.partnerFirstName || 
//                       'your partner';
  
//   console.log('🔍 Partner name sources:', {
//     fromUser: user?.onboardingData?.partnerFirstName,
//     fromOnboarding: onboardingData.partnerFirstName,
//     final: partnerName
//   });
//   console.log('ob',onboardingData);
  

//   const [loading, setLoading] = useState(true);
//   const [currentQuestion, setCurrentQuestion] = useState<TetherQuestion | null>(null);
//   const [response, setResponse] = useState('');
//   const [refreshesRemaining, setRefreshesRemaining] = useState(1);
//   const [stats, setStats] = useState<TetherStats | null>(null);
//   const [timeLeft, setTimeLeft] = useState('6 h');
//   const [refreshing, setRefreshing] = useState(false);
//   const [isSkipping, setIsSkipping] = useState(false); // ← Add this

//   useEffect(() => {
//     loadActiveTethers();
//   }, []);

//   const loadActiveTethers = useCallback(async (isPullToRefresh = false) => {
//     try {
//       if (isPullToRefresh) setRefreshing(true);
//       else setLoading(true);

//       const data = await getActiveTethers();

//       const categoryTether = data.tethers.find(
//         (t: any) => t.categoryId?.toLowerCase() === categoryId?.toLowerCase()
//       );

//       if (categoryTether) {
//         setCurrentQuestion(categoryTether);
//         if (categoryTether.userAnswer) {
//           setResponse(categoryTether.userAnswer);
//         }
//       } else {
//         Alert.alert('No Tethers Available', 'Check back later for new questions!');
//       }

//       setStats(data.stats);
//     } catch (error) {
//       console.error('Error loading tethers:', error);
//       Alert.alert('Error', 'Failed to load questions. Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [categoryId]);

//   useEffect(() => {
//     loadActiveTethers();
//   }, [loadActiveTethers]);

//   const onRefresh = useCallback(() => {
//     loadActiveTethers(true); // true = pull-to-refresh
//   }, [loadActiveTethers]);


//   const handleDrawAnother = async () => {
//   if (!currentQuestion || isSkipping) return;

//   setIsSkipping(true);

//   try {
//     await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

//     const result = await skipTether(currentQuestion.questionId);

//     if (result.newQuestion) {
//       setCurrentQuestion(result.newQuestion);
//       setResponse('');
//       setRefreshesRemaining(result.refreshesRemaining);
//       Alert.alert('New Question!', result.message || 'Here\'s a fresh question!');
//     } else {
//       Alert.alert('No More Refreshes', result.message);
//       if (result.refreshesRemaining === 0) {
//         setTimeout(() => router.push('/home/draw-locked-upsell'), 1000);
//       }
//     }
//   } catch (error: any) {
//     await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//     Alert.alert('Error', error.message || 'Failed to draw new question');
//   } finally {
//     setIsSkipping(false);
//   }
// };

//   const handleShareTether = async () => {
//     if (!response.trim()) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//       Alert.alert('Empty Response', 'Please type your response before sharing.');
//       return;
//     }

//     if (!currentQuestion) {
//       Alert.alert('Error', 'No active question to answer');
//       return;
//     }

//     try {
//       await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
//       const result = await submitAnswer(currentQuestion.questionId, response);
      
//       // Check if partner already answered
//       if (result.state === 'COMPLETED' && result.partnerAnswer) {
//         Alert.alert(
//           'Tether Completed! 🎉',
//           `You both answered!\n\nYour partner said: "${result.partnerAnswer}"`,
//           [
//             {
//               text: 'View History',
//               onPress: () => router.push('/home/tether-history'),
//             },
//             {
//               text: 'Continue',
//               onPress: () => router.back(),
//               style: 'cancel',
//             },
//           ]
//         );
//       } else {
//         Alert.alert(
//           'Tether Shared! 🎉',
//           'Your response has been sent to your partner. They have 24 hours to respond!',
//           [
//             {
//               text: 'OK',
//               onPress: () => router.back(),
//             },
//           ]
//         );
//       }

//       // Show milestones if achieved
//       if (result.milestones && result.milestones.length > 0) {
//         setTimeout(() => {
//           const milestone = result.milestones![0];
//           Alert.alert(
//             '🏆 Milestone Achieved!',
//             milestone.message,
//             [{ text: 'Awesome!', style: 'default' }]
//           );
//         }, 1000);
//       }
//     } catch (error: any) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       Alert.alert(
//         'Error',
//         error.message || 'Failed to submit answer',
//         [
//           {
//             text: 'Back to Categories',
//             onPress: () => router.back(),
//           },
//         ]
//       );
//     }
//   };

//   if (loading) {
//     return (
//       <OnboardingLayout 
//         showBackButton={false} 
//         showLogo={false} 
//         showHeartLogo={false}
//         showChatIcon={true}
//         chatCount={5}
//         onChatPress={() => router.push('/')}
//         showSettingsIcon={true}
//       >
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={Colors.darkOrange} />
//           <Text style={styles.loadingText}>Loading question...</Text>
//         </View>
//       </OnboardingLayout>
//     );
//   }

//   return (
//     <OnboardingLayout 
//       showBackButton={true}
//       showLogo={false} 
//       showHeartLogo={false}
//       showChatIcon={true}
//       chatCount={5}
//       onChatPress={() => router.push('/')}
//       showSettingsIcon={true}
//     >
//       <KeyboardAvoidingView 
//         style={styles.container}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={100}
//       >
//         <ScrollView 
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={ // ← Add RefreshControl here
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={Colors.darkOrange}
//               colors={[Colors.darkOrange]}
//             />
//           }
//         >
//           {/* Header */}
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>
//               Answer a question before{'\n'}{partnerName} beats you to it
//             </Text>
//             <Text style={styles.headerSubtitle}>Pull each other closer...</Text>
//           </View>

//           {/* Question Card */}
//           {currentQuestion && (
//             <QuestionCard
//               categoryName={currentQuestion.categoryName || categoryTitle}
//               question={currentQuestion.question}
//               timeLeft={timeLeft}
//               response={response}
//               onResponseChange={setResponse}
//               onDrawAnother={handleDrawAnother}
//               sharedRefreshesRemaining={refreshesRemaining}
//             />
//           )}

//           {/* Refresh Info Banner */}
//           <View style={styles.infoBanner}>
//             <Text style={styles.infoBannerText}>
//               You have <Text style={styles.infoBannerHighlight}>{refreshesRemaining}</Text> refresh{refreshesRemaining === 1 ? '' : 'es'} remaining today.
//             </Text>
//           </View>

//           {/* Bottom Spacer */}
//           <View style={styles.bottomSpacer} />
//         </ScrollView>

//         {/* Fixed Bottom Button */}
//         <View style={styles.bottomContainer}>
//           <DebouncedButton
//             style={[
//               styles.shareButton,
//               !response.trim() && styles.shareButtonDisabled,
//             ]}
//             onPress={handleShareTether}
//             disabled={!response.trim()}
//             activeOpacity={0.9}
//           >
//             <Text style={[
//               styles.shareButtonText,
//               !response.trim() && styles.shareButtonTextDisabled,
//             ]}>
//               Share My Tether
//             </Text>
//           </DebouncedButton>
//         </View>
//       </KeyboardAvoidingView>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 100,
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
//   header: {
//     alignItems: 'center',
//     marginTop: Spacing.lg,
//     marginBottom: Spacing.xl,
//     paddingHorizontal: Spacing.md,
//   },
//   headerTitle: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: 24,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     textAlign: 'center',
//     marginBottom: Spacing.xs,
//     lineHeight: 32,
//   },
//   headerSubtitle: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.description,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     textAlign: 'center',
//   },
//   infoBanner: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.md,
//     marginHorizontal: Spacing.md,
//     marginTop: Spacing.lg,
//     borderWidth: 1,
//     borderColor: Colors.lightOrange,
//   },
//   infoBannerText: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.regular,
//     color: Colors.black,
//     textAlign: 'center',
//   },
//   infoBannerHighlight: {
//     fontFamily: 'InterTight-Bold',
//     fontWeight: FontWeights.bold,
//     color: Colors.darkOrange,
//   },
//   bottomSpacer: {
//     height: 20,
//   },
//   bottomContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: Colors.cream,
//     paddingHorizontal: Spacing.md,
//     paddingBottom: Spacing.xl,
//     paddingTop: Spacing.md,
//     borderTopWidth: 1,
//     borderTopColor: Colors.mediumGrey,
//   },
//   shareButton: {
//     backgroundColor: Colors.darkOrange,
//     borderRadius: BorderRadius.xl,
//     paddingVertical: Spacing.lg,
//     alignItems: 'center',
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   shareButtonDisabled: {
//     backgroundColor: Colors.mediumGrey,
//     shadowOpacity: 0.1,
//   },
//   shareButtonText: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.buttonLarge,
//     fontWeight: FontWeights.bold,
//     color: Colors.white,
//   },
//   shareButtonTextDisabled: {
//     color: Colors.inputText,
//   },
// });


import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,

} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import QuestionCard from '../../components/ui/cards/QuestionCard';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { useOnboarding } from '@/context/onboarding_context';
import { Ionicons } from '@expo/vector-icons';
import {
  getActiveTethers,
  submitAnswer,
  skipTether,
  type TetherQuestion,
  type TetherStats,
} from '@/services/tether_service';
import { useTetherStats } from '@/hooks/useTetherStats';
import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function CategoryQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { onboardingData } = useOnboarding();
  const tetherStats = useTetherStats();
  const { push: debouncedPush} = useNavigationDebounce();

  const categoryId = params.categoryId as string;
  const categoryTitle = params.categoryTitle as string;

  const partnerName =
    user?.onboardingData?.partnerFirstName ||
    onboardingData.partnerFirstName ||
    'your partner';

  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<TetherQuestion | null>(null);
  const [response, setResponse] = useState('');
  const [cycleRefreshes, setCycleRefreshes] = useState(0);
  const [permanentRefreshes, setPermanentRefreshes] = useState(0);
  const [stats, setStats] = useState<TetherStats | null>(null);
  const [timeLeft] = useState('6 h'); // TODO: Calculate real time left
  const [refreshing, setRefreshing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadActiveTethers = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getActiveTethers();

      const categoryTether = data.tethers.find(
        (t: any) => t.categoryId?.toLowerCase() === categoryId?.toLowerCase()
      );

      if (categoryTether) {
        setCurrentQuestion(categoryTether);
        
        // Check if partner already answered (but user hasn't)
        if (categoryTether.partnerAnswer && !categoryTether.userAnswer) {
          console.log('🎯 Partner answered first! Navigating to reveal screen...');
          
          // Navigate to the reveal screen showing blurred partner answer
          router.replace({
            pathname: '/home/waiting-partner',
            params: {
              questionId: categoryTether.questionId,
              categoryId: categoryTether.categoryId,
              categoryName: categoryTether.categoryName || categoryTitle,
              question: categoryTether.question,
              partnerAnswer: categoryTether.partnerAnswer,
              expiresAt: categoryTether.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          });
          return; // Stop further processing
        }
        
        // Check if user already answered this tether
        if (categoryTether.userAnswer) {
          setResponse(categoryTether.userAnswer);
          setAlreadyAnswered(true);
          console.log('ℹ️ User already answered this tether, showing waiting state');
        } else {
          setAlreadyAnswered(false);
          setResponse('');
        }
        
        // Auto-detect if tether was completed (both answered)
        // This handles Partner B seeing completed state after Partner A finished
        if (categoryTether.state === 'COMPLETED' && categoryTether.partnerAnswer && !isPullToRefresh) {
          console.log('⚡ Detected completed tether - auto-refreshing to get new question');
          setTimeout(() => {
            Alert.alert(
              'Tether Completed! 🎉',
              `You both answered this tether!\n\nYour partner said: "${categoryTether.partnerAnswer}"\n\nLoading new questions...`,
              [{ text: 'Continue', onPress: () => loadActiveTethers(true) }]
            );
          }, 500);
        }
      } else {
        Alert.alert('No Tethers Available', 'Check back later for new questions!');
      }

      setStats(data.stats);
      
      // Update refresh counts from backend
      if (data.refreshes) {
        console.log('📊 Refresh data from backend:', data.refreshes);
        setCycleRefreshes(data.refreshes.cycleRefreshesRemaining || 0);
        setPermanentRefreshes(data.refreshes.permanentRefreshBalance || 0);
      }
    } catch (error) {
      console.error('Error loading tethers:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadActiveTethers();
  }, [loadActiveTethers]);

  const onRefresh = useCallback(() => {
    loadActiveTethers(true);
  }, [loadActiveTethers]);

  const handleDrawAnother = async () => {
    if (!currentQuestion || isSkipping) return;

    setIsSkipping(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await skipTether(currentQuestion.questionId);

      if (result.newQuestion) {
        setCurrentQuestion(result.newQuestion);
        setResponse('');
        setCycleRefreshes(result.cycleRefreshesRemaining || 0);
        setPermanentRefreshes(result.permanentRefreshesRemaining || 0);
        
        const usedType = result.usedPermanent ? 'permanent' : 'cycle';
        Alert.alert(
          'New Question!',
          result.message || `Here's a fresh question! Used 1 ${usedType} refresh.`
        );
      } else {
        Alert.alert('No More Refreshes', result.message);
        if (result.cycleRefreshesRemaining === 0 && result.permanentRefreshesRemaining === 0) {
          setTimeout(() => router.push('/home/draw-locked-upsell'), 1000);
        }
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Handle specific skip errors gracefully
      const errorCode = error.response?.data?.error;
      
      if (errorCode === 'ALREADY_ANSWERED') {
        Alert.alert(
          'Already Answered',
          'You\'ve already answered this question. Waiting for your partner to respond.',
          [
            { text: 'View History', onPress: () => router.push('/home/tether-history') },
            { text: 'OK', onPress: () => router.back(), style: 'cancel' },
          ]
        );
      } else if (errorCode === 'ALREADY_COMPLETED') {
        Alert.alert(
          'Already Completed',
          'This question has been answered by both of you!',
          [
            { text: 'View History', onPress: () => router.push('/home/tether-history') },
            { text: 'OK', onPress: () => router.back(), style: 'cancel' },
          ]
        );
      } else if (errorCode === 'ALREADY_SKIPPED') {
        Alert.alert(
          'Already Skipped',
          'You\'ve already skipped this question. A new one should be available.',
          [{ text: 'Refresh', onPress: () => loadActiveTethers(true) }]
        );
      } else if (errorCode === 'NO_REFRESHES') {
        Alert.alert(
          'No Refreshes Left',
          'You\'ve used all your refreshes for today. Upgrade to Premium for more!',
          [
            { text: 'Upgrade', onPress: () => router.push('/home/draw-locked-upsell') },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else if (errorCode === 'QUESTION_NOT_FOUND') {
        Alert.alert(
          'Question Unavailable',
          'This question is no longer available. Let\'s get you a fresh one!',
          [{ text: 'OK', onPress: () => loadActiveTethers(true) }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to draw new question');
      }
    } finally {
      setIsSkipping(false);
    }
  };

  const handleShareTether = async () => {
    if (alreadyAnswered) {
      Alert.alert(
        'Already Answered',
        'You\'ve already answered this tether. Waiting for your partner to respond!',
        [{ text: 'OK' }]
      );
      return;
    }

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
      setIsSubmitting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await submitAnswer(currentQuestion.questionId, response);

      // Mark as answered immediately to prevent re-submission
      setAlreadyAnswered(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // ✅ Trigger immediate tether stats update
      tetherStats.triggerUpdate();

      if (result.state === 'COMPLETED' && result.partnerAnswer) {
        // BOTH COMPLETED: Backend automatically dropped new tethers
        console.log('🎉 Both answered! Fetching new tethers automatically...');
        await loadActiveTethers(false); // Auto-refresh to get new question
        
        Alert.alert(
          'Tether Completed! 🎉',
          `You both answered!\n\nYour partner said: "${result.partnerAnswer}"\n\nNew questions are ready!`,
          [
            { text: 'View History', onPress: () => router.replace('/home/tether-history') },
            { text: 'Continue', style: 'cancel' },
          ]
        );
      } else if (result.state === 'WAITING_FOR_PARTNER') {
        // FIRST ANSWER: Navigate to waiting screen
        console.log('⏳ Waiting for partner to answer...');
        
        setTimeout(() => {
          router.replace({
            pathname: '/home/waiting-for-partner-answer',
            params: {
              questionId: currentQuestion.questionId,
              categoryName: categoryTitle || currentQuestion.categoryName || 'Deeper Connection',
              question: currentQuestion.question,
              userAnswer: response,
              expiresAt: currentQuestion.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          });
        }, 500);
      } else {
        // Fallback - navigate to waiting screen
        console.log('⏳ Fallback: Navigating to waiting screen...');
        
        setTimeout(() => {
          router.replace({
            pathname: '/home/waiting-for-partner-answer',
            params: {
              questionId: currentQuestion.questionId,
              categoryName: categoryTitle || currentQuestion.categoryName || 'Deeper Connection',
              question: currentQuestion.question,
              userAnswer: response,
              expiresAt: currentQuestion.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          });
        }, 500);
      }

      if (result.milestones && result.milestones.length > 0 && result.milestones[0]?.message) {
        setTimeout(() => {
          Alert.alert('🏆 Milestone Achieved!', result.milestones![0].message, [
            { text: 'Awesome!' },
          ]);
        }, 1500);
      }
    } catch (error: any) {
      setAlreadyAnswered(false); // Reset on error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Handle 'already answered' error gracefully
      if (error.response?.data?.error === 'ALREADY_ANSWERED') {
        const data = error.response.data.data;
        const previousAnswer = data?.userAnswer || response;
        
        setAlreadyAnswered(true);
        setResponse(previousAnswer);
        
        // Navigate to waiting screen
        setTimeout(() => {
          router.replace({
            pathname: '/home/waiting-for-partner-answer',
            params: {
              questionId: currentQuestion.questionId,
              categoryName: categoryTitle || currentQuestion.categoryName || 'Deeper Connection',
              question: currentQuestion.question,
              userAnswer: previousAnswer,
              expiresAt: currentQuestion.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          });
        }, 500);
      } else {
        Alert.alert('Error', error.message || 'Failed to submit answer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <OnboardingLayout showBackButton={false} showLogo={false} showHeartLogo={false}>
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
      chatCount={tetherStats.count}
      chatIconActive={tetherStats.isActive}
      onChatPress={() => {
        tetherStats.markAsViewed();
        debouncedPush('/home/tether-history');
      }}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.darkOrange}
              colors={[Colors.darkOrange]}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Answer a question before{'\n'}{partnerName} beats you to it
            </Text>
            <Text style={styles.headerSubtitle}>Pull each other closer...</Text>
          </View>

          {/* Already Answered Message */}
          {alreadyAnswered && (
            <View style={styles.waitingMessage}>
              <Ionicons name="time-outline" size={24} color={Colors.darkOrange} />
              <Text style={styles.waitingText}>
                You've already answered! Waiting for {partnerName} to respond.
              </Text>
            </View>
          )}

          {currentQuestion && (
            <QuestionCard
              categoryName={currentQuestion.categoryName || categoryTitle}
              question={currentQuestion.question}
              timeLeft={timeLeft}
              response={response}
              onResponseChange={setResponse}
              onDrawAnother={handleDrawAnother}
              isSkipping={isSkipping}
              refreshesRemaining={cycleRefreshes + permanentRefreshes}
              disabled={alreadyAnswered}
            />
          )}

          {/* Refresh Info or Purchase Options */}
          {cycleRefreshes + permanentRefreshes > 0 ? (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                {cycleRefreshes > 0 && permanentRefreshes > 0 ? (
                  <>
                    You have <Text style={styles.infoBannerHighlight}>{cycleRefreshes}</Text> cycle +{' '}
                    <Text style={styles.infoBannerHighlight}>{permanentRefreshes}</Text> permanent ={' '}
                    <Text style={styles.infoBannerHighlight}>{cycleRefreshes + permanentRefreshes}</Text>{' '}
                    total refreshes
                  </>
                ) : (
                  <>
                    You have <Text style={styles.infoBannerHighlight}>{cycleRefreshes + permanentRefreshes}</Text>{' '}
                    {cycleRefreshes > 0 ? 'cycle' : 'permanent'} refresh{cycleRefreshes + permanentRefreshes === 1 ? '' : 'es'} remaining
                  </>
                )}
              </Text>
            </View>
          ) : (
            <View style={styles.purchaseSection}>
              <View style={styles.purchaseHeader}>
                <Ionicons name="lock-closed" size={24} color={Colors.darkOrange} />
                <Text style={styles.purchaseHeaderText}>0 Shared refreshes remaining</Text>
              </View>
              
              <Text style={styles.purchaseSubtitle}>Buy more to draw new questions</Text>
              
              <View style={styles.pricingOptions}>
                <DebouncedButton
                  style={styles.pricingOption}
                  onPress={() => router.push('/home/draw-locked-upsell')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pricingText}>3 x Shared question refreshes</Text>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>$1.29</Text>
                  </View>
                </DebouncedButton>
                
                <DebouncedButton
                  style={[styles.pricingOption, styles.pricingOptionPopular]}
                  onPress={() => router.push('/home/draw-locked-upsell')}
                  activeOpacity={0.8}
                >
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                  <Text style={styles.pricingText}>6 x Shared question refreshes</Text>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>$2.79</Text>
                  </View>
                </DebouncedButton>
                
                <DebouncedButton
                  style={styles.pricingOption}
                  onPress={() => router.push('/home/draw-locked-upsell')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pricingText}>10 x Shared question refreshes</Text>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>$3.99</Text>
                  </View>
                </DebouncedButton>
              </View>
              
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseInfoText}>
                  <Text style={styles.purchaseInfoHighlight}>Refreshes</Text> are shared between you both
                </Text>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          {alreadyAnswered ? (
            <DebouncedButton
              style={styles.continueButton}
              onPress={() => {
                console.log('🔄 Navigating to waiting screen with params:', {
                  questionId: currentQuestion?.questionId,
                  categoryName: categoryTitle || currentQuestion?.categoryName,
                  question: currentQuestion?.question,
                  userAnswer: response,
                });
                router.replace({
                  pathname: '/home/waiting-for-partner-answer',
                  params: {
                    questionId: currentQuestion?.questionId || '',
                    categoryName: categoryTitle || currentQuestion?.categoryName || 'Deeper Connection',
                    question: currentQuestion?.question || '',
                    userAnswer: response,
                    expiresAt: currentQuestion?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  },
                });
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>View Waiting Screen</Text>
            </DebouncedButton>
          ) : (
            <DebouncedButton
              style={[
                styles.shareButton,
                (!response.trim() || isSubmitting) && styles.shareButtonDisabled,
              ]}
              onPress={handleShareTether}
              disabled={!response.trim() || isSubmitting}
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.shareButtonText,
                  (!response.trim() || isSubmitting) && styles.shareButtonTextDisabled,
                ]}
              >
                {isSubmitting ? 'Sharing...' : 'Share My Tether'}
              </Text>
            </DebouncedButton>
          )}
        </View>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
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
  purchaseSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.darkOrange,
  },
  purchaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  purchaseHeaderText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  purchaseSubtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  pricingOptions: {
    gap: Spacing.md,
  },
  pricingOption: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.mediumGrey,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  pricingOptionPopular: {
    borderColor: Colors.darkOrange,
    backgroundColor: Colors.veryLightOrange,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -50,
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  popularText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 10,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  pricingText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.black,
    flex: 1,
  },
  priceTag: {
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  priceText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  purchaseInfo: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.veryLightOrange,
    borderRadius: BorderRadius.md,
  },
  purchaseInfoText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    textAlign: 'center',
  },
  purchaseInfoHighlight: {
    fontFamily: 'InterTight-Bold',
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  bottomSpacer: { height: 20 },
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
  waitingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightOrange,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 12,
  },
  waitingText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    flex: 1,
  },
  continueButton: {
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
  buttonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
});