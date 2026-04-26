import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function BuddyButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.label,
    variant === 'primary' && styles.labelPrimary,
    variant === 'secondary' && styles.labelSecondary,
    variant === 'ghost' && styles.labelGhost,
    isDisabled && styles.labelDisabled,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#1E6FD9'}
        />
      ) : (
        <Text style={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minWidth: 120,
  },
  primary: {
    backgroundColor: '#1E6FD9',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1E6FD9',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelPrimary: {
    color: '#FFFFFF',
  },
  labelSecondary: {
    color: '#1E6FD9',
  },
  labelGhost: {
    color: '#1E6FD9',
  },
  labelDisabled: {
    color: '#8A857C',
  },
});
