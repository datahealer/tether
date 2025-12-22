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

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (language: string) => void;
  currentLanguage: string;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
];

export default function LanguageModal({
  visible,
  onClose,
  onSave,
  currentLanguage,
}: LanguageModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSelect = async (code: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguage(code);
  };

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(selectedLanguage);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <Text style={styles.modalTitle}>Language</Text>

          {/* Language Options */}
          <View style={styles.languageList}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  index === languages.length - 1 && styles.languageItemLast,
                ]}
                onPress={() => handleSelect(language.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageLabel}>{language.label}</Text>
                {selectedLanguage === language.code && (
                  <Ionicons name="checkmark" size={24} color={Colors.darkOrange} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
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
    paddingTop: Spacing.lg,
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
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  languageList: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGrey,
  },
  languageItemLast: {
    borderBottomWidth: 0,
  },
  languageLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.black,
  },
  saveButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: BorderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});