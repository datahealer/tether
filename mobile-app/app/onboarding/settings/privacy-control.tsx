import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from '@/components/ui/onboarding/Onboarding_layout';
import ExportDataModal from '@/components/ui/profile/ExportDataModal';
import DeleteAccountModal from '@/components/ui/profile/DeleteAccountModal';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyItemProps {
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

const PrivacyItem: React.FC<PrivacyItemProps> = ({ label, onPress, isDanger }) => (
  <TouchableOpacity
    style={styles.privacyItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.privacyItemLabel, isDanger && styles.dangerText]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color={isDanger ? '#FF3B30' : Colors.darkGrey} />
  </TouchableOpacity>
);

export default function PrivacyControlScreen() {
  const router = useRouter();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const handleExportData = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowExportModal(true);
  };

  const handleDeleteAnswers = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/settings/delete-answers');
  };

  const handleDeleteAccount = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDeleteAccountModal(true);
  };

  const handleConfirmExport = async () => {
    // Simulate export
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Your data has been exported and sent to your email');
  };

  const handleConfirmDeleteAccount = async () => {
    // Handle account deletion
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Account Deleted', 'Your account has been permanently deleted', [
      {
        text: 'OK',
        onPress: () => router.replace('/onboarding/welcome'),
      },
    ]);
  };

  return (
    <OnboardingLayout showBackButton={true} showLogo={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Manage your data</Text>
        <Text style={styles.subtitle}>
          Manage how your information is stored{'\n'}and used inside the Tether App.
        </Text>

        {/* Privacy Options */}
        <View style={styles.optionsContainer}>
          <PrivacyItem
            label="Export My Data"
            onPress={handleExportData}
          />
          <PrivacyItem
            label="Delete Specific Answers"
            onPress={handleDeleteAnswers}
          />
          <PrivacyItem
            label="Delete Account"
            onPress={handleDeleteAccount}
            isDanger
          />
        </View>
      </ScrollView>

      {/* Export Data Modal */}
      <ExportDataModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleConfirmExport}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleConfirmDeleteAccount}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.xl * 2,
  },
  heading: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.heading,
    lineHeight: 36,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    marginBottom: Spacing.sm,
    letterSpacing: 0,
  },
  subtitle: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  privacyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGrey,
  },
  privacyItemLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.black,
  },
  dangerText: {
    color: '#FF3B30',
  },
});