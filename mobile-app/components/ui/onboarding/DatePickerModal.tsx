import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (date: Date) => void;
  initialDate?: Date;
}

const { height } = Dimensions.get('window');

export default function DatePickerModal({
  visible,
  onClose,
  onSave,
  initialDate = new Date(1990, 0, 1),
}: DatePickerModalProps) {
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSave = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(date);
    onClose();
  };

  const renderScrollPicker = (
    items: (string | number)[],
    selectedValue: string | number,
    onSelect: (value: any) => void,
    isMonth = false
  ) => (
    <ScrollView
      style={styles.pickerColumn}
      contentContainerStyle={styles.pickerContent}
      showsVerticalScrollIndicator={false}
    >
      {items.map((item, index) => {
        const value = isMonth ? index : item;
        const isSelected = selectedValue === value;
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.pickerItem,
              isSelected && styles.pickerItemSelected,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(value);
            }}
          >
            <Text
              style={[
                styles.pickerItemText,
                isSelected && styles.pickerItemTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

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
          <Text style={styles.modalTitle}>Select your date of birth</Text>

          {/* Date Picker Columns */}
          <View style={styles.pickerRow}>
            {renderScrollPicker(days, selectedDay, setSelectedDay)}
            {renderScrollPicker(months, selectedMonth, setSelectedMonth, true)}
            {renderScrollPicker(years, selectedYear, setSelectedYear)}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
    maxHeight: height * 0.7,
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
  pickerRow: {
    flexDirection: 'row',
    height: 200,
    marginBottom: Spacing.xl,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: Spacing.xl,
  },
  pickerItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: 4,
    borderRadius: BorderRadius.lg,
  },
  pickerItemSelected: {
    backgroundColor: Colors.veryLightOrange,
    borderWidth: 1,
    borderColor: Colors.darkOrange,
  },
  pickerItemText: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.regular,
    color: Colors.darkGrey,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
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
  saveButtonText: {
    fontFamily: 'InterTight-SemiBold',
    fontSize: FontSizes.buttonLarge,
    lineHeight: 28,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
    letterSpacing: 0.45,
  },
});