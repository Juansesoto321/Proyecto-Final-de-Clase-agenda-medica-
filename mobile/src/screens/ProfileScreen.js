import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import AppButton from '../components/AppButton';
import { colors } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { online, lastSyncedAt, pendingCount } = useSync();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role === 'admin' ? 'Administrador' : 'Paciente'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.rowLabel}>Conexión</Text>
        <Text style={styles.rowValue}>{online ? 'En línea' : 'Sin conexión'}</Text>
        <Text style={styles.rowLabel}>Cambios pendientes por sincronizar</Text>
        <Text style={styles.rowValue}>{pendingCount}</Text>
        <Text style={styles.rowLabel}>Última sincronización</Text>
        <Text style={styles.rowValue}>{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString('es-CO') : '—'}</Text>
      </View>

      <AppButton title="Cerrar sesión" variant="danger" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, gap: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  email: { fontSize: 14, color: colors.muted },
  role: { fontSize: 13, color: colors.primary, fontWeight: '700', marginTop: 4 },
  rowLabel: { fontSize: 12, color: colors.muted, marginTop: 8 },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '600' },
});
