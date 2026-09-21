import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as appointmentsRepo from '../../db/appointmentsRepo';
import { useSync } from '../../context/SyncContext';
import AppButton from '../../components/AppButton';
import StatusBadge from '../../components/StatusBadge';
import SyncBanner from '../../components/SyncBanner';
import { colors } from '../../theme';
import { formatDisplayDate } from '../../utils/date';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'cancelled', label: 'Canceladas' },
];

export default function AdminAppointmentsScreen() {
  const { syncNow, refreshPendingCount } = useSync();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadLocal = useCallback(async () => {
    const rows = await appointmentsRepo.listAppointments();
    setAppointments(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocal();
    }, [loadLocal])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await syncNow();
    await loadLocal();
    setRefreshing(false);
  }

  async function updateStatus(item, status) {
    await appointmentsRepo.setStatusLocal(item.localId, status);
    await loadLocal();
    await refreshPendingCount();
    syncNow();
  }

  const filtered = useMemo(
    () => (filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)),
    [appointments, filter]
  );

  return (
    <View style={styles.flex}>
      <SyncBanner />
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.localId)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay citas en esta categoría.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.doctor}>{item.doctorName}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.specialty}>{item.doctorSpecialty}</Text>
            <Text style={styles.date}>{formatDisplayDate(item.date, item.time)}</Text>
            <Text style={styles.patient}>Paciente: {item.patientName || 'Desconocido'}</Text>
            {item.patientEmail ? <Text style={styles.patientEmail}>{item.patientEmail}</Text> : null}
            {item.reason ? <Text style={styles.reason}>Motivo: {item.reason}</Text> : null}
            {item.needsCreate || item.needsStatusPush ? (
              <Text style={styles.pendingTag}>Pendiente de sincronizar</Text>
            ) : null}

            <View style={styles.actions}>
              {item.status !== 'confirmed' && (
                <View style={styles.actionButton}>
                  <AppButton title="Confirmar" variant="success" onPress={() => updateStatus(item, 'confirmed')} />
                </View>
              )}
              {item.status !== 'cancelled' && (
                <View style={styles.actionButton}>
                  <AppButton title="Cancelar" variant="danger" onPress={() => updateStatus(item, 'cancelled')} />
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doctor: { fontSize: 16, fontWeight: '700', color: colors.text },
  specialty: { fontSize: 13, color: colors.muted },
  date: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },
  patient: { fontSize: 13.5, color: colors.text, marginTop: 4, fontWeight: '600' },
  patientEmail: { fontSize: 12.5, color: colors.muted },
  reason: { fontSize: 13, color: colors.muted },
  pendingTag: { fontSize: 11.5, color: colors.warning, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionButton: { flex: 1 },
});
