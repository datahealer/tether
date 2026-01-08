import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import { useNavigationDebounce } from '@/hooks/useNavigationDebounce';

interface DebouncedButtonProps extends Omit<TouchableOpacityProps, 'onPress' | 'disabled'> {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  // If true, shows visual feedback (reduced opacity) when debouncing
  showDebounceState?: boolean;
}

/**
 * DebouncedButton - A TouchableOpacity wrapper that prevents rapid repeated presses
 * 
 * Features:
 * - 500ms cooldown between presses
 * - Automatic disabled state during cooldown
 * - Optional visual feedback (opacity) during debounce
 * - Haptic feedback on press
 * - Supports all TouchableOpacity props
 * 
 * Usage:
 * ```tsx
 * <DebouncedButton
 *   onPress={handleContinue}
 *   style={styles.button}
 *   showDebounceState={true}
 * >
 *   <Text>Continue</Text>
 * </DebouncedButton>
 * ```
 */
export default function DebouncedButton({
  onPress,
  disabled = false,
  children,
  style,
  activeOpacity = 0.7,
  showDebounceState = true,
  ...rest
}: DebouncedButtonProps) {
  const { isNavigating, debouncedAction } = useNavigationDebounce();

  const handlePress = () => {
    debouncedAction(onPress);
  };

  const isDisabled = disabled || isNavigating;
  
  const combinedStyle = [
    style,
    showDebounceState && isNavigating && { opacity: 0.5 }
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      style={combinedStyle}
      activeOpacity={activeOpacity}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}
