import React, { useState } from 'react';
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

interface GenderPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (gender: string) => void;
  initialGender?: string;
}

const { height } = Dimensions.get('window');

const GENDER_OPTIONS = ['Male', 'Female', 'Non-Binary'];

export default function GenderPickerModal({
  visible,
  onClose,
  onSave,
  initialGender,
}: GenderPickerModalProps) {
  const [selectedGender, setSelectedGender] = useState(initialGender || '');

  const handleSave = () => {
    if (selectedGender) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave(selectedGender);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.modalTitle}>Select your gender</Text>

          {/* Gender Options */}
          <View style={styles.optionsContainer}>
            {GENDER_OPTIONS.map((gender) => {
              const isSelected = selectedGender === gender;
              
              return (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedGender(gender);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {gender}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={Colors.darkOrange} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              !selectedGender && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!selectedGender}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.mediumGrey,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
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
    fontSize: FontSizes.heading - 4,
    lineHeight: 32,
    fontWeight: FontWeights.semibold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.veryLightOrange,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: Colors.darkOrange,
    backgroundColor: Colors.white,
  },
  optionText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.inputText,
  },
  optionTextSelected: {
    fontFamily: 'SFProDisplay-Semibold',
    fontWeight: FontWeights.semibold,
    color: Colors.black,
  },
  saveButton: {
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});