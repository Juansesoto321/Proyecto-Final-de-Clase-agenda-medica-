import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function AppTextInput({ label, ...props }) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.muted} style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
  },
});
