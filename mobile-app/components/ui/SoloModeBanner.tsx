import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth_context';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import * as Haptics from 'expo-haptics';

/**
 * Solo Mode Banner
 * Shows when user is in solo mode (has virtual partner)
 * Prompts them to invite their real partner
 */
export function SoloModeBanner() {
  const router = useRouter();
  const { user } = useAuth();

  // Only show for solo mode users
  if (!user?.isSoloMode || user?.linkedToRealPartner) {
    return null;
  }

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/partner-invite');
  };

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="person-outline" size={20} color={Colors.darkOrange} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>Solo Mode</Text>
        <Text style={styles.subtitle}>
          Invite your partner to unlock full experience
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.darkOrange} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightOrange,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.lightOrange,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
});
