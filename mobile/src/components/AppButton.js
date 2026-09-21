import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme';

export default function AppButton({ title, onPress, variant = 'primary', disabled, loading }) {
  const backgroundColor = {
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    outline: 'transparent',
  }[variant];

  const textColor = variant === 'outline' ? colors.primary : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed || disabled ? 0.7 : 1 },
        variant === 'outline' && styles.outline,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
