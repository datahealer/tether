import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,

  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../theme/constants';
import { useAuth } from '@/context/auth_context';
import { getCoupleInfo } from '@/services/onboarding_service';
import { NotificationData } from '@/services/notification_service';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function WaitingForPartnerScreen() {
  const router = useRouter();
  const { user, refreshSession } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationListenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Listen for push notifications (COUPLE_CREATED)
    notificationListenerRef.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as NotificationData;
      console.log('📬 Waiting screen received notification:', data?.type);
      
      if (data?.type === 'COUPLE_CREATED') {
        handlePartnerJoined();
      }
    });

    // Start polling every 10 seconds for couple status
    pollIntervalRef.current = setInterval(checkCoupleStatus, 10000);
    
    // Check immediately on mount
    checkCoupleStatus();

    return () => {
      if (notificationListenerRef.current) {
        notificationListenerRef.current.remove();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const checkCoupleStatus = async () => {
    try {
      setIsChecking(true);
      const coupleInfo = await getCoupleInfo();
      
      if (coupleInfo.coupled || coupleInfo.coupleId) {
        console.log('✅ Partner has joined! Couple ID:', coupleInfo.coupleId);
        handlePartnerJoined(coupleInfo.coupleId);
      }
    } catch (err) {
      console.error('❌ Poll error:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePartnerJoined = async (coupleId?: string) => {
    // Stop polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // If we have coupleId from polling, update user data immediately
    if (coupleId && user) {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = { ...parsedUser, coupleId };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ Updated stored user with coupleId:', coupleId);
      }
    }
    
    // Refresh user session to get updated coupleId
    await refreshSession();
    
    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate to first tether (now dynamic)
    console.log('🚀 Navigating to first tether...');
    router.replace('/onboarding/first-tether');
  };

  const handleShareInvite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/onboarding/partner-invite');
  };

  return (
    <OnboardingLayout
      showBackButton={false}
      showLogo={true}
      showHeartLogo={false}
      showChatIcon={false}
      showSettingsIcon={false}
      showTetherLine={true} // Animated tether line
      showProgress={false}
      showLogoutAvatar={true}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Heart Symbol – Centered */}
          <View style={styles.heartContainer}>
            <Image
              source={require('../../assets/images/heart-symbol-black.png')}
              style={styles.heartImage}
              resizeMode="contain"
            />
          </View>

          {/* Main Title */}
          <Text style={styles.title}>Waiting for Your Partner 💕</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            We're all set on your end! We can only move forward when your partner joins. You'll be notified as soon as they do.
          </Text>

          {/* Status Indicator */}
          {isChecking && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={Colors.darkOrange} />
              <Text style={styles.statusText}>Checking for partner...</Text>
            </View>
          )}

          {/* Hint */}
          <Text style={styles.hint}>
            Share your invite link with them to get started!
          </Text>

          {/* Share Invite Button */}
          <DebouncedButton
            style={styles.shareButton}
            onPress={handleShareInvite}
            activeOpacity={0.9}
          >
            <Text style={styles.shareButtonText}>Share Invite Link</Text>
            <Ionicons name="share-outline" size={20} color={Colors.white} style={styles.shareIcon} />
          </DebouncedButton>

          {/* Fun Illustration / Animation Space */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/images/icon.png')} // Add your custom image
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  heartContainer: {
    marginBottom: Spacing.lg,
  },
  heartImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.heading,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  hint: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkOrange,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  shareIcon: {
    marginLeft: Spacing.sm,
  },
  illustrationContainer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
  },
  illustration: {
    width: 200,
    height: 200,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  statusText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
});
