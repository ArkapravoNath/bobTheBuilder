import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps,
} from 'react-native';
import { C } from '../theme/colors';

type InputVariant = 'underline' | 'box';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: InputVariant;
}

export function BuddyInput({
  label,
  error,
  rightIcon,
  onRightIconPress,
  style,
  variant = 'underline',
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  const isUnderline = variant === 'underline';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={[
        isUnderline ? styles.underlineRow : styles.boxRow,
        focused && (isUnderline ? styles.underlineFocused : styles.boxFocused),
        !!error  && (isUnderline ? styles.underlineError   : styles.boxError),
      ]}>
        <TextInput
          style={[isUnderline ? styles.underlineInput : styles.boxInput, style]}
          placeholderTextColor={C.placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconBtn}
            accessibilityRole="button"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // ── Underline variant (matches references) ──────────────────────────────
  underlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 10,
  },
  underlineFocused: { borderBottomColor: C.ink },
  underlineError:   { borderBottomColor: C.error },
  underlineInput: {
    flex: 1,
    fontSize: 16,
    color: C.ink,
    paddingVertical: 0,
  },

  // ── Box variant (used in admin / settings) ──────────────────────────────
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 52,
  },
  boxFocused: { borderColor: C.ink },
  boxError:   { borderColor: C.error },
  boxInput: {
    flex: 1,
    fontSize: 16,
    color: C.ink,
    paddingVertical: 0,
  },

  iconBtn: {
    paddingLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  error: { fontSize: 12, color: C.error, marginTop: 4 },
});
