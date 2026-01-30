import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { useAuth } from '@/context/auth_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import * as Clipboard from 'expo-clipboard';
import { generateCoupleInvite, acceptCoupleInvite } from '@/services/onboarding_service';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function PartnerInviteScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const { user, refreshSession } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const partnerName = onboardingData.partnerFirstName || 'Partner';

  useEffect(() => {
    generateInviteCode();
  }, []);

  // Poll for couple connection every 5 seconds
  // This allows User A to auto-navigate when User B connects
  useEffect(() => {
    // Don't poll if user is already in a real couple
    if (!user || (user.coupleId && !user.isSoloMode)) return;

    const pollInterval = setInterval(async () => {
      console.log('🔄 Checking for partner connection...');
      await refreshSession();
      
      // Note: The navigation will happen via NavigationHandler when user state updates
      // No need to manually navigate here
    }, 5000); // Check every 5 seconds

    return () => clearInterval(pollInterval);
  }, [user?.id, user?.coupleId, user?.isSoloMode]);

  const generateInviteCode = async () => {
    try {
      setLoading(true);
      const invite = await generateCoupleInvite();
      setInviteCode(invite.code);
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', error.message || 'Failed to generate invite code');
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(code);
    } finally {
      setLoading(false);
    }
  };

  const handleTetherTogether = async () => {
    if (!partnerCode.trim()) {
      Alert.alert('Required', 'Please enter your partner\'s code');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConnecting(true);

    try {
      // Accept the invite - this creates the couple connection (becomes real couple, isSoloMode = false)
      await acceptCoupleInvite(partnerCode.trim());
      
      // Refresh user session to get updated coupleId and user data
      await refreshSession();
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', 'You are now connected with your partner!');
      
      // Check if user has already completed onboarding
      if (user && user.onboarded) {
        // Already onboarded → go directly to first-tether
        console.log('✅ User already onboarded, navigating to first-tether');
        router.replace('/onboarding/first-tether');
      } else {
        // Not onboarded yet → continue through attribution → finish → first-tether
        console.log('⏳ User not onboarded, continuing to attribution');
        router.replace('/onboarding/attribution');
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to connect with partner');
    } finally {
      setConnecting(false);
    }
  };

  const handleCopyCode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleShareCode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const message = `Connect with me on the Tether App...\n\nUse my code: ${inviteCode}\n\nDownload Tether: https://tether.app`;
      
      await Share.share({
        message,
        title: 'Join me on Tether',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSkip = async () => {
    // Disable skip if user has entered a partner code
    if (partnerCode.trim()) {
      Alert.alert('Code Entered', 'Please connect with your partner or clear the code to skip');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // User pressed skip while in solo mode
    // Check if they've already completed onboarding
    if (user && user.onboarded) {
      // Already onboarded → go directly to first-tether
      console.log('✅ Solo user already onboarded, navigating to first-tether');
      router.replace('/onboarding/first-tether');
    } else {
      // Not onboarded yet → continue through attribution → finish → first-tether
      console.log('⏳ Solo user not onboarded, continuing to attribution');
      router.replace('/onboarding/attribution');
    }
  };

  if (loading) {
    return (
      <OnboardingLayout showBackButton={true} showLogo={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkOrange} />
          <Text style={styles.loadingText}>Generating your invite code...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout showBackButton={true} showLogo={true} showLogoutAvatar={true}>
      <View style={styles.container}>
        {/* Solo Mode Indicator */}
        {user?.isSoloMode && !user?.linkedToRealPartner && (
          <View style={styles.soloModeIndicator}>
            <Ionicons name="person-outline" size={20} color={Colors.darkOrange} />
            <Text style={styles.soloModeText}>
              You're exploring in Solo Mode. Connect with your partner to unlock the full experience!
            </Text>
          </View>
        )}

        {/* Heading */}
        <Text style={styles.heading}>Tether yourselves together</Text>

        {/* Invite Section */}
        <Text style={styles.sectionLabel}>I want to invite {partnerName}</Text>
        
        <TouchableOpacity 
          style={styles.codeBox} 
          onPress={handleCopyCode}
          activeOpacity={0.7}
        >
          <Text style={styles.codeText}>{inviteCode}</Text>
          <Ionicons name="copy-outline" size={24} color={Colors.darkOrange} />
        </TouchableOpacity>

        <DebouncedButton
          style={styles.shareButton}
          onPress={handleShareCode}
          activeOpacity={0.8}
        >
          <Text style={styles.shareButtonText}>Share Your Tether Code</Text>
        </DebouncedButton>

        {/* Partner Code Section */}
        <Text style={styles.sectionLabel}>I have a code from {partnerName}</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter partner code"
          placeholderTextColor={Colors.darkGrey}
          value={partnerCode}
          onChangeText={setPartnerCode}
          autoCapitalize="characters"
          maxLength={6}
          editable={!connecting}
        />

        <DebouncedButton
          style={[
            styles.tetherButton,
            (!partnerCode.trim() || connecting) && styles.buttonDisabled,
          ]}
          onPress={handleTetherTogether}
          disabled={!partnerCode.trim() || connecting}
          activeOpacity={0.8}
        >
          {connecting ? (
            <ActivityIndicator size="small" color={Colors.inputText} />
          ) : (
            <Text style={styles.tetherButtonText}>Tether Us Together</Text>
          )}
        </DebouncedButton>

        {/* Skip Link */}
        <TouchableOpacity 
          onPress={handleSkip} 
          style={[styles.skipButton, partnerCode.trim() && styles.skipButtonDisabled]}
          disabled={partnerCode.trim().length > 0}
        >
          <Text style={[styles.skipText, partnerCode.trim() && styles.skipTextDisabled]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    marginTop: Spacing.md,
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.darkOrange,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  codeText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: 20,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    letterSpacing: 3,
  },
  shareButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.mediumGrey,
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    color: Colors.inputText,
    marginBottom: Spacing.md,
    textAlign: 'center',
    letterSpacing: 2,
  },
  tetherButton: {
    backgroundColor: Colors.mediumGrey,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  tetherButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.semibold,
    color: Colors.inputText,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.md,
    marginTop: 'auto',
  },
  skipButtonDisabled: {
    opacity: 0.4,
  },
  skipText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.description,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    textDecorationLine: 'underline',
  },
  skipTextDisabled: {
    color: Colors.darkGrey,
  },
  soloModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightOrange,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.lightOrange,
  },
  soloModeText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    flex: 1,
  },
});
