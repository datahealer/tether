import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '../../components/ui/onboarding/Onboarding_layout';
import { useOnboarding } from '@/context/onboarding_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import * as Clipboard from 'expo-clipboard';
import { generateCoupleInvite, acceptCoupleInvite } from '@/services/onboarding_service';
import DebouncedButton from '@/components/ui/buttons/DebouncedButton';

export default function PartnerInviteScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const [inviteCode, setInviteCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerCodeFocused, setPartnerCodeFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false); // New state for connection loading

  const partnerName = onboardingData.partnerFirstName || 'Partner';

  useEffect(() => {
    generateInviteCode();
  }, []);

  const generateInviteCode = async () => {
    try {
      setLoading(true);
      const invite = await generateCoupleInvite();
      setInviteCode(invite.code);
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', error.message || 'Failed to generate invite code');
      // Fallback to local code if API fails
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
      await acceptCoupleInvite(partnerCode.trim());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', 'You are now connected with your partner!');
      router.push('/onboarding/attribution');
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

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/attribution');
  };

  // Show initial loading state
  if (loading) {
    return (
      <OnboardingLayout progress={0.84} showBackButton={true} showLogoutAvatar={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.darkOrange} />
          <Text style={styles.loadingText}>Generating your invite code...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout progress={0.84} showBackButton={true} showLogoutAvatar={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Tether yourselves together</Text>

        {/* Invite Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            I want to invite {partnerName}
          </Text>

          {/* Invite Code Display */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <DebouncedButton onPress={handleCopyCode} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color={Colors.inputText} />
            </DebouncedButton>
          </View>

          {/* Share Button */}
          <DebouncedButton
            style={styles.shareButton}
            onPress={handleShareCode}
            activeOpacity={0.8}
          >
            <Text style={styles.shareButtonText}>Share Your Tether Code</Text>
          </DebouncedButton>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Partner Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            I have a code from {partnerName}
          </Text>

          {/* Partner Code Input */}
          <View
            style={[
              styles.inputContainer,
              partnerCodeFocused && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter partner code"
              placeholderTextColor={Colors.darkGrey}
              value={partnerCode}
              onChangeText={setPartnerCode}
              autoCapitalize="characters"
              maxLength={6}
              onFocus={() => setPartnerCodeFocused(true)}
              onBlur={() => setPartnerCodeFocused(false)}
              editable={!connecting}
            />
          </View>

          {/* Tether Together Button */}
          <DebouncedButton
            style={[
              styles.tetherButton,
              (!partnerCode.trim() || connecting) && styles.tetherButtonDisabled,
            ]}
            onPress={handleTetherTogether}
            disabled={!partnerCode.trim() || connecting}
            activeOpacity={0.8}
          >
            {connecting ? (
              <View style={styles.buttonLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.inputText} />
                <Text style={styles.tetherButtonText}>Connecting...</Text>
              </View>
            ) : (
              <Text style={styles.tetherButtonText}>Tether Us Together</Text>
            )}
          </DebouncedButton>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: Spacing.xl }} />

        {/* Continue Button */}
        <DebouncedButton
          style={[
            styles.continueButton,
            (connecting || partnerCode.trim()) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={connecting || partnerCode.trim().length > 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </DebouncedButton>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    marginTop: Spacing.sm,
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.large,
    lineHeight: 24,
    fontWeight: FontWeights.medium,
    color: Colors.black,
    marginBottom: Spacing.md,
    letterSpacing: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.mediumGrey,
    marginBottom: Spacing.md,
  },
  codeText: {
    fontFamily: 'SFProDisplay-Semibold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.mediumGrey,
    marginVertical: Spacing.xl,
  },
  inputContainer: {
    backgroundColor: Colors.inputFill,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: Colors.lightOrange,
    backgroundColor: Colors.white,
  },
  input: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    letterSpacing: 1,
  },
  tetherButton: {
    backgroundColor: Colors.mediumGrey,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
  },
  tetherButtonDisabled: {
    opacity: 0.5,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tetherButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.inputText,
    letterSpacing: 0.45,
  },
  continueButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});
