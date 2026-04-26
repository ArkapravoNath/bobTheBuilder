import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function BuddyInput({ label, error, rightIcon, onRightIconPress, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused && styles.inputRowFocused, !!error && styles.inputRowError]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#C4C0BA"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconBtn} accessibilityRole="button">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4744',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E2D7',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowFocused: {
    borderColor: '#1E6FD9',
    shadowColor: '#1E6FD9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRowError: {
    borderColor: '#E74C3C',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2A2825',
    paddingVertical: 0,
  },
  iconBtn: {
    paddingLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
});
