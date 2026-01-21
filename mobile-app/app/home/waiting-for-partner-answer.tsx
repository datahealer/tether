// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import * as Notifications from 'expo-notifications';
// import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
// import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
// import { useAuth } from '@/context/auth_context';
// import { useTetherStats } from '@/hooks/useTetherStats';
// import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';
// import { getCoupleInfo } from '@/services/onboarding_service';
// import { NotificationData } from '@/services/notification_service';

// export default function WaitingForPartnerAnswerScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const { user } = useAuth();
//   const tetherStats = useTetherStats();
//   const { push: debouncedPush } = useNavigationDebounce();
  
//   const [isChecking, setIsChecking] = useState(false);
//   const [partnerName, setPartnerName] = useState('Partner');
//   const [timeRemaining, setTimeRemaining] = useState('');
  
//   const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const notificationListenerRef = useRef<Notifications.EventSubscription | null>(null);
  
//   const categoryName = (params.categoryName as string) || 'Deeper Connection';
//   const question = (params.question as string) || '';
//   const userAnswer = (params.userAnswer as string) || '';
//   const questionId = (params.questionId as string) || '';
//   const expiresAt = params.expiresAt as string;

//   useEffect(() => {
//     loadPartnerInfo();
    
//     // Listen for push notifications (BOTH_ANSWERED)
//     notificationListenerRef.current = Notifications.addNotificationReceivedListener(notification => {
//       const data = notification.request.content.data as NotificationData;
//       console.log('📬 Waiting screen received notification:', data?.type);
      
//       if (data?.type === 'BOTH_ANSWERED' && data?.questionId === questionId) {
//         handleBothAnswered();
//       }
//     });

//     // Calculate time remaining
//     if (expiresAt) {
//       const interval = setInterval(() => {
//         const remaining = calculateTimeRemaining(new Date(expiresAt));
//         setTimeRemaining(remaining);
//       }, 1000);
      
//       return () => {
//         clearInterval(interval);
//         if (notificationListenerRef.current) {
//           notificationListenerRef.current.remove();
//         }
//         if (pollIntervalRef.current) {
//           clearInterval(pollIntervalRef.current);
//         }
//       };
//     }

//     return () => {
//       if (notificationListenerRef.current) {
//         notificationListenerRef.current.remove();
//       }
//       if (pollIntervalRef.current) {
//         clearInterval(pollIntervalRef.current);
//       }
//     };
//   }, [questionId, expiresAt]);

//   const loadPartnerInfo = async () => {
//     try {
//       const coupleInfo = await getCoupleInfo();
//       if (coupleInfo.partnerName) {
//         setPartnerName(coupleInfo.partnerName);
//       }
//     } catch (error) {
//       console.error('Error loading partner info:', error);
//     }
//   };

//   const calculateTimeRemaining = (expiry: Date): string => {
//     const now = new Date();
//     const diff = expiry.getTime() - now.getTime();
    
//     if (diff <= 0) return 'Expired';
    
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     }
//     return `${minutes}m`;
//   };

//   const handleBothAnswered = async () => {
//     await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
//     // Navigate to tether history to see both answers
//     router.replace('/home/tether-history');
//   };

//   const handleViewHistory = () => {
//     tetherStats.markAsViewed();
//     debouncedPush('/home/tether-history');
//   };

//   return (
//     <OnboardingLayout
//       showBackButton={true}
//       showLogo={true}
//       showHeartLogo={false}
//       showChatIcon={true}
//       chatCount={tetherStats.count}
//       chatIconActive={tetherStats.isActive}
//       onChatPress={handleViewHistory}
//       showSettingsIcon={true}
//     >
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.container}>
//           {/* Waiting Badge */}
//           <View style={styles.waitingBadge}>
//             <ActivityIndicator size="small" color={Colors.darkOrange} />
//             <Text style={styles.waitingBadgeText}>Waiting for Answer</Text>
//           </View>

//           {/* Main Title */}
//           <Text style={styles.title}>
//             Still waiting for {partnerName} to{'\n'}answer the latest tether...
//           </Text>

//           {/* Subtitle */}
//           <Text style={styles.subtitle}>
//             Will {partnerName} meet you in the middle?
//           </Text>

//           {/* Question Card */}
//           <View style={styles.questionCard}>
//             {/* Category Header */}
//             <View style={styles.categoryHeader}>
//               <View style={styles.categoryBadge}>
//                 <Text style={styles.categoryText}>{categoryName}</Text>
//               </View>
//               {timeRemaining && (
//                 <View style={styles.timeContainer}>
//                   <Text style={styles.timeLabel}>Time Left</Text>
//                   <Text style={styles.timeValue}>{timeRemaining}</Text>
//                 </View>
//               )}
//             </View>

//             {/* Question */}
//             <Text style={styles.questionText}>{question}</Text>

//             {/* User's Answer Section */}
//             <View style={styles.answerSection}>
//               <View style={styles.answerLabel}>
//                 <Text style={styles.answerLabelText}>Your Answer</Text>
//               </View>
//               <View style={styles.answerBox}>
//                 <Text style={styles.answerText}>{userAnswer}</Text>
//               </View>
//             </View>

//             {/* Partner's Answer Section - Placeholder */}
//             <View style={styles.answerSection}>
//               <View style={styles.answerLabel}>
//                 <Text style={styles.answerLabelText}>{partnerName}'s Answer</Text>
//               </View>
//               <View style={styles.waitingAnswerBox}>
//                 <Ionicons name="time-outline" size={24} color={Colors.inputText} />
//                 <Text style={styles.waitingAnswerText}>Waiting for their response...</Text>
//               </View>
//             </View>
//           </View>

//           {/* Info Banner */}
//           <View style={styles.infoBanner}>
//             <Ionicons name="information-circle" size={20} color={Colors.darkOrange} />
//             <Text style={styles.infoBannerText}>
//               You'll be notified as soon as {partnerName} answers. In the meantime, all other category cards are dimmed to keep you focused on this tether.
//             </Text>
//           </View>

//           {/* Bottom Spacer */}
//           <View style={styles.bottomSpacer} />
//         </View>
//       </ScrollView>
//     </OnboardingLayout>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContent: {
//     paddingBottom: 40,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: Spacing.md,
//   },
//   waitingBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.xs,
//     backgroundColor: Colors.veryLightOrange,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.xs,
//     borderRadius: BorderRadius.lg,
//     alignSelf: 'center',
//     marginTop: Spacing.lg,
//     marginBottom: Spacing.md,
//   },
//   waitingBadgeText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.semibold,
//     color: Colors.darkOrange,
//   },
//   title: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: 24,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     textAlign: 'center',
//     marginBottom: Spacing.xs,
//     lineHeight: 32,
//   },
//   subtitle: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.description,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//     textAlign: 'center',
//     marginBottom: Spacing.xl,
//   },
//   questionCard: {
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.lg,
//     marginBottom: Spacing.lg,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   categoryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: Spacing.lg,
//   },
//   categoryBadge: {
//     backgroundColor: Colors.veryLightOrange,
//     paddingHorizontal: Spacing.md,
//     paddingVertical: Spacing.xs,
//     borderRadius: BorderRadius.lg,
//   },
//   categoryText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//   },
//   timeContainer: {
//     alignItems: 'flex-end',
//   },
//   timeLabel: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.regular,
//     color: Colors.inputText,
//   },
//   timeValue: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.bold,
//     color: Colors.darkOrange,
//   },
//   questionText: {
//     fontFamily: 'InterTight-Bold',
//     fontSize: 22,
//     fontWeight: FontWeights.bold,
//     color: Colors.black,
//     textAlign: 'center',
//     marginBottom: Spacing.xl,
//     lineHeight: 30,
//   },
//   answerSection: {
//     marginBottom: Spacing.lg,
//   },
//   answerLabel: {
//     backgroundColor: Colors.veryLightOrange,
//     paddingHorizontal: Spacing.sm,
//     paddingVertical: Spacing.xs,
//     borderRadius: BorderRadius.sm,
//     alignSelf: 'flex-start',
//     marginBottom: Spacing.sm,
//   },
//   answerLabelText: {
//     fontFamily: 'InterTight-SemiBold',
//     fontSize: FontSizes.small,
//     fontWeight: FontWeights.semibold,
//     color: Colors.black,
//   },
//   answerBox: {
//     backgroundColor: Colors.inputFill,
//     borderRadius: BorderRadius.md,
//     borderWidth: 1,
//     borderColor: Colors.darkOrange,
//     padding: Spacing.lg,
//   },
//   answerText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.large,
//     fontWeight: FontWeights.medium,
//     color: Colors.black,
//     lineHeight: 24,
//   },
//   waitingAnswerBox: {
//     backgroundColor: Colors.mediumGrey,
//     borderRadius: BorderRadius.md,
//     padding: Spacing.lg,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: Spacing.sm,
//     justifyContent: 'center',
//   },
//   waitingAnswerText: {
//     fontFamily: 'InterTight-Medium',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.medium,
//     color: Colors.inputText,
//   },
//   infoBanner: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: Spacing.sm,
//     backgroundColor: Colors.white,
//     borderRadius: BorderRadius.lg,
//     padding: Spacing.md,
//     borderWidth: 1,
//     borderColor: Colors.lightOrange,
//   },
//   infoBannerText: {
//     fontFamily: 'InterTight-Regular',
//     fontSize: FontSizes.medium,
//     fontWeight: FontWeights.regular,
//     color: Colors.black,
//     flex: 1,
//     lineHeight: 20,
//   },
//   bottomSpacer: {
//     height: 40,
//   },
// });

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { useTetherStats } from '@/hooks/useTetherStats';
import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';
import { getCoupleInfo } from '@/services/onboarding_service';
import { NotificationData } from '@/services/notification_service';

export default function WaitingForPartnerAnswerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const tetherStats = useTetherStats();
  const { push: debouncedPush } = useNavigationDebounce();
  
  const [isChecking, setIsChecking] = useState(false);
  const [partnerName, setPartnerName] = useState('Partner');
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationListenerRef = useRef<Notifications.EventSubscription | null>(null);
  
  const categoryName = (params.categoryName as string) || 'Deeper Connection';
  const question = (params.question as string) || '';
  const userAnswer = (params.userAnswer as string) || '';
  const questionId = (params.questionId as string) || '';
  const expiresAt = params.expiresAt as string;

  // Debug logging
  useEffect(() => {
    console.log('📋 Waiting screen params:', { categoryName, question, userAnswer, questionId, expiresAt });
  }, []);

  useEffect(() => {
    loadPartnerInfo();
    
    // Listen for push notifications (BOTH_ANSWERED)
    notificationListenerRef.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as NotificationData;
      console.log('📬 Waiting screen received notification:', data?.type);
      
      if (data?.type === 'BOTH_ANSWERED' && data?.questionId === questionId) {
        handleBothAnswered();
      }
    });

    // Calculate time remaining
    if (expiresAt) {
      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining(new Date(expiresAt));
        setTimeRemaining(remaining);
      }, 1000);
      
      return () => {
        clearInterval(interval);
        if (notificationListenerRef.current) {
          notificationListenerRef.current.remove();
        }
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }

    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current.remove();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [questionId, expiresAt]);

  const loadPartnerInfo = async () => {
    try {
      const coupleInfo = await getCoupleInfo();
      if (coupleInfo.partnerName) {
        setPartnerName(coupleInfo.partnerName);
      }
    } catch (error) {
      console.error('Error loading partner info:', error);
    }
  };

  const calculateTimeRemaining = (expiry: Date): string => {
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handleBothAnswered = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate to tether history to see both answers
    router.replace('/home/tether-history');
  };

  const handleViewHistory = () => {
    tetherStats.markAsViewed();
    debouncedPush('/home/tether-history');
  };

  return (
    <OnboardingLayout
      showBackButton={true}
      showLogo={true}
      showHeartLogo={false}
      showChatIcon={true}
      chatCount={tetherStats.count}
      chatIconActive={tetherStats.isActive}
      onChatPress={handleViewHistory}
      showSettingsIcon={true}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Main Title */}
          <Text style={styles.title}>
            Still waiting for {partnerName} to{'\n'}answer the latest tether...
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Will {partnerName} meet you in the middle?
          </Text>

          {/* Question Card - Partner's Answer (Top) */}
          <View style={styles.questionCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>
              {timeRemaining && (
                <View style={styles.timeContainer}>
                  <Text style={styles.timeLabel}>Time Left</Text>
                  <Text style={styles.timeValue}>{timeRemaining}</Text>
                </View>
              )}
            </View>

            <Text style={styles.questionText}>{question}</Text>

            {/* Partner's Answer Section - Locked */}
            <View style={styles.answerSection}>
              <View style={styles.answerLabel}>
                <Text style={styles.answerLabelText}>{partnerName}'s Answer</Text>
              </View>
              <View style={styles.lockedAnswerBox}>
                <Ionicons name="lock-closed" size={24} color={Colors.inputText} />
                <Text style={styles.lockedAnswerText}>Waiting for their response...</Text>
              </View>
            </View>
          </View>

          {/* Your Answer Card (Bottom) */}
          <View style={styles.yourAnswerCard}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryName}</Text>
            </View>

            <View style={styles.answerSection}>
              <View style={styles.answerLabel}>
                <Text style={styles.answerLabelText}>Your Answer</Text>
              </View>
              <Text style={styles.yourAnswerText}>{userAnswer}</Text>
            </View>
          </View>

          {/* Date Display */}
          {/* <Text style={styles.dateText}>Wednesday, 12th January 2025</Text> */}

          {/* Upcoming Cards Preview */}
          {/* <View style={styles.upcomingSection}>
            <View style={styles.upcomingCard}>
              <View style={styles.upcomingContent}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>Add Some Spice</Text>
                </View>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              </View>
            </View>
          </View> */}

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontFamily: 'InterTight-Bold',
    fontSize: 24,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    marginTop: Spacing.lg,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  categoryBadge: {
    backgroundColor: Colors.veryLightOrange,
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
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
  timeValue: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.bold,
    color: Colors.darkOrange,
  },
  questionText: {
    fontFamily: 'InterTight-Bold',
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 30,
  },
  answerSection: {
    marginBottom: 0,
  },
  answerLabel: {
    backgroundColor: Colors.veryLightOrange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  answerLabelText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    padding:Spacing.sm
  },
  lockedAnswerBox: {
    backgroundColor: Colors.mediumGrey,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
    minHeight: 80,
  },
  lockedAnswerText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
  },
  yourAnswerCard: {
    backgroundColor: Colors.lightOrange,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  yourAnswerText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    lineHeight: 36,
  },
  dateText: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  upcomingSection: {
    marginTop: Spacing.sm,
  },
  upcomingCard: {
    backgroundColor: Colors.lightOrange,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    opacity: 0.6,
  },
  upcomingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  completedText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  bottomSpacer: {
    height: 40,
  },
});