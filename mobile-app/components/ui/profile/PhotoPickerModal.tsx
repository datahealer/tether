import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseGallery: () => void;
  onRemovePhoto?: () => void;
  hasPhoto?: boolean;
}

const { height } = Dimensions.get('window');

export default function PhotoPickerModal({
  visible,
  onClose,
  onTakePhoto,
  onChooseGallery,
  onRemovePhoto,
  hasPhoto = false,
}: PhotoPickerModalProps) {
  const handleOption = async (callback: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback();
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
          <Text style={styles.modalTitle}>Change photo</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOption(onTakePhoto)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="camera-outline" size={24} color={Colors.darkOrange} />
              </View>
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOption(onChooseGallery)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="images-outline" size={24} color={Colors.darkOrange} />
              </View>
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>

            {hasPhoto && onRemovePhoto && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleOption(onRemovePhoto)}
              >
                <View style={[styles.optionIcon, styles.removeIcon]}>
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </View>
                <Text style={[styles.optionText, styles.removeText]}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    width: '85%',
    maxWidth: 350,
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
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  optionButton: {
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.veryLightOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  removeIcon: {
    backgroundColor: '#FFE5E5',
  },
  optionText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.medium,
    fontWeight: FontWeights.regular,
    color: Colors.black,
    textAlign: 'center',
  },
  removeText: {
    color: '#FF3B30',
  },
});