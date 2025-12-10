import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '@/theme/constants';

interface EditableFieldProps {
  label: string;
  value: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  disabled?: boolean;
}

export default function EditableField({
  label,
  value,
  onPress,
  icon,
  placeholder = 'Not set',
  disabled = false,
}: EditableFieldProps) {
  const handlePress = async () => {
    if (!disabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.fieldContainer, disabled && styles.fieldDisabled]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={styles.fieldLeft}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={[styles.fieldValue, !value && styles.fieldPlaceholder]}>
          {value || placeholder}
        </Text>
      </View>
      <View style={styles.fieldRight}>
        {icon && !disabled && (
          <Ionicons name={icon} size={20} color={Colors.darkGrey} />
        )}
        {!disabled && (
          <Ionicons name="chevron-forward" size={20} color={Colors.darkGrey} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  fieldLeft: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: 'SFProDisplay-Regular',
    fontSize: FontSizes.small + 2,
    fontWeight: FontWeights.regular,
    color: Colors.darkGrey,
    marginBottom: Spacing.xs,
  },
  fieldValue: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: FontSizes.input,
    fontWeight: FontWeights.medium,
    color: Colors.black,
  },
  fieldPlaceholder: {
    color: Colors.darkGrey,
    fontStyle: 'italic',
  },
  fieldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});