import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const handleDelete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onConfirm();
    onClose();
  };

  const handleKeep = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.modalTitle}>Delete Account</Text>

          {/* Description */}
          <Text style={styles.modalDescription}>
            This will permanently remove your account{'\n'}
            and all data. This action cannot be undone.
          </Text>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          </TouchableOpacity>

          {/* Keep Button */}
          <TouchableOpacity
            style={styles.keepButton}
            onPress={handleKeep}
            activeOpacity={0.8}
          >
            <Text style={styles.keepButtonText}>Keep My Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
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
  modalTitle: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.large + 2,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  modalDescription: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    color: Colors.inputText,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  deleteButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
  keepButton: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  keepButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.semibold,
    color: Colors.darkOrange,
    letterSpacing: 0.45,
  },
});