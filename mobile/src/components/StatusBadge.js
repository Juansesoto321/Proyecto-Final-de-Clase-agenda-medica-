import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusStyles } from '../theme';

export default function StatusBadge({ status }) {
  const info = statusStyles[status] || { label: status, color: '#64748B' };
  return (
    <View style={[styles.badge, { backgroundColor: `${info.color}20` }]}>
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700' },
});
