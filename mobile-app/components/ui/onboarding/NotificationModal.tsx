import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

interface NotificationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  partnerName?: string;
}

export default function NotificationPermissionModal({
  visible,
  onClose,
  onContinue,
  partnerName = 'Partner',
}: NotificationPermissionModalProps) {
  
  const requestNotificationPermission = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onContinue();
      } else {
        Alert.alert(
          'Notifications Disabled',
          'You can enable notifications later in settings.',
          [{ text: 'OK', onPress: onContinue }]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      onContinue();
    }
  };

  const handleMaybeLater = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleMaybeLater}
          >
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>

          {/* Bell Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.bellBackground}>
              <Ionicons name="notifications" size={40} color={Colors.darkOrange} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Stay in rhythm{'\n'}with {partnerName}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            Let Tether gently pull on the line with{'\n'}
            notifications that match the rhythm you chose.
          </Text>

          {/* Allow Notifications Button */}
          <TouchableOpacity
            style={styles.allowButton}
            onPress={requestNotificationPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.allowButtonText}>Allow Notifications</Text>
          </TouchableOpacity>

          {/* Maybe Later Button */}
          <TouchableOpacity
            style={styles.maybeLaterButton}
            onPress={handleMaybeLater}
            activeOpacity={0.8}
          >
            <Text style={styles.maybeLaterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  bellBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.darkOrange,
  },
  title: {
    fontFamily: 'InterTight-Bold',
    fontSize: FontSizes.heading - 2,
    lineHeight: 32,
    fontWeight: FontWeights.bold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0,
  },
  description: {
    fontFamily: 'InterTight-Regular',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    letterSpacing: 0,
  },
  allowButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  allowButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  maybeLaterButton: {
    paddingVertical: Spacing.sm,
  },
  maybeLaterText: {
    fontFamily: 'InterTight-Medium',
    fontSize: FontSizes.medium,
    lineHeight: 20,
    fontWeight: FontWeights.medium,
    color: Colors.inputText,
    letterSpacing: 0,
  },
});