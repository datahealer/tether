// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
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
//           <TouchableOpacity
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
//           </TouchableOpacity>
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
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import QuestionCard from '../../components/ui/cards/QuestionCard';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { useOnboarding } from '@/context/onboarding_context';
import {
  getActiveTethers,
  submitAnswer,
  skipTether,
  type TetherQuestion,
  type TetherStats,
} from '@/services/tether_service';

export default function CategoryQuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { onboardingData } = useOnboarding();

  const categoryId = params.categoryId as string;
  const categoryTitle = params.categoryTitle as string;

  const partnerName =
    user?.onboardingData?.partnerFirstName ||
    onboardingData.partnerFirstName ||
    'your partner';

  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<TetherQuestion | null>(null);
  const [response, setResponse] = useState('');
  const [refreshesRemaining, setRefreshesRemaining] = useState(1);
  const [stats, setStats] = useState<TetherStats | null>(null);
  const [timeLeft] = useState('6 h'); // TODO: Calculate real time left
  const [refreshing, setRefreshing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

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
        if (categoryTether.userAnswer) {
          setResponse(categoryTether.userAnswer);
        }
      } else {
        Alert.alert('No Tethers Available', 'Check back later for new questions!');
      }

      setStats(data.stats);
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
        setRefreshesRemaining(result.refreshesRemaining);
        Alert.alert('New Question!', result.message || 'Here\'s a fresh question!');
      } else {
        Alert.alert('No More Refreshes', result.message);
        if (result.refreshesRemaining === 0) {
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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await submitAnswer(currentQuestion.questionId, response);

      if (result.state === 'COMPLETED' && result.partnerAnswer) {
        Alert.alert(
          'Tether Completed! 🎉',
          `You both answered!\n\nYour partner said: "${result.partnerAnswer}"`,
          [
            { text: 'View History', onPress: () => router.push('/home/tether-history') },
            { text: 'Continue', onPress: () => router.back(), style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(
          'Tether Shared! 🎉',
          'Your response has been sent to your partner. They have 24 hours to respond!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }

      if (result.milestones && result.milestones.length > 0 && result.milestones[0]?.message) {
        setTimeout(() => {
          Alert.alert('🏆 Milestone Achieved!', result.milestones![0].message, [
            { text: 'Awesome!' },
          ]);
        }, 1000);
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Handle 'already answered' error gracefully
      if (error.response?.data?.error === 'ALREADY_ANSWERED') {
        const data = error.response.data.data;
        const previousAnswer = data?.userAnswer || 'your previous response';
        const partnerStatus = data?.partnerAnswer 
          ? `\n\nYour partner said: "${data.partnerAnswer}"`
          : '\n\nWaiting for your partner to respond...';
        
        Alert.alert(
          'Already Answered',
          `You already answered this question.\n\nYour answer: "${previousAnswer}"${partnerStatus}`,
          [
            { text: 'View History', onPress: () => router.push('/home/tether-history') },
            { text: 'OK', onPress: () => router.back(), style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to submit answer');
      }
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

          {currentQuestion && (
            <QuestionCard
              categoryName={currentQuestion.categoryName || categoryTitle}
              question={currentQuestion.question}
              timeLeft={timeLeft}
              response={response}
              onResponseChange={setResponse}
              onDrawAnother={handleDrawAnother}
              isSkipping={isSkipping}
              refreshesRemaining={refreshesRemaining}
            />
          )}

          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              You have{' '}
              <Text style={styles.infoBannerHighlight}>{refreshesRemaining}</Text>{' '}
              refresh{refreshesRemaining === 1 ? '' : 'es'} remaining today.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

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
            <Text
              style={[
                styles.shareButtonText,
                !response.trim() && styles.shareButtonTextDisabled,
              ]}
            >
              Share My Tether
            </Text>
          </TouchableOpacity>
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
});