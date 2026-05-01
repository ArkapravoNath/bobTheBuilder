import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { C } from '../theme/colors';

export type BuddyButtonVariant = 'primary' | 'secondary' | 'teak' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: BuddyButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  uppercase?: boolean;
}

export function BuddyButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  uppercase = false,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary'   && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'teak'      && styles.teak,
        variant === 'ghost'     && styles.ghost,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ].filter(Boolean)}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'teak' ? '#FFFFFF' : C.ink}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary'   && styles.labelPrimary,
            variant === 'secondary' && styles.labelSecondary,
            variant === 'teak'      && styles.labelTeak,
            variant === 'ghost'     && styles.labelGhost,
            uppercase && styles.labelUpper,
            isDisabled && styles.labelDisabled,
          ].filter(Boolean)}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minWidth: 100,
  },
  primary: { backgroundColor: C.cta },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.border,
  },
  teak: { backgroundColor: C.teak },
  ghost: { backgroundColor: 'transparent' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.38 },

  label: { fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  labelPrimary:   { color: '#FFFFFF' },
  labelSecondary: { color: C.ink },
  labelTeak:      { color: '#FFFFFF' },
  labelGhost:     { color: C.teak },
  labelUpper:     { textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 13 },
  labelDisabled:  { color: C.muted },
});
