import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { colors } from '../theme';
import { useSync } from '../context/SyncContext';

export default function SyncBanner() {
  const { online, syncing, pendingCount, syncNow } = useSync();

  if (online && pendingCount === 0 && !syncing) return null;

  const message = !online
    ? pendingCount > 0
      ? `Sin conexión — ${pendingCount} cambio(s) por sincronizar`
      : 'Sin conexión — trabajando en modo offline'
    : syncing
    ? 'Sincronizando...'
    : `${pendingCount} cambio(s) pendientes por sincronizar`;

  return (
    <View style={[styles.banner, { backgroundColor: online ? '#FEF3C7' : '#FEE2E2' }]}>
      {syncing ? <ActivityIndicator size="small" color={colors.text} /> : null}
      <Text style={styles.text}>{message}</Text>
      {online && !syncing ? (
        <Pressable onPress={syncNow} hitSlop={8}>
          <Text style={styles.link}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: { flex: 1, fontSize: 12.5, color: colors.text, fontWeight: '600' },
  link: { fontSize: 12.5, color: colors.primary, fontWeight: '700' },
});
