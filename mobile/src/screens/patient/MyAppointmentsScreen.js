import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as appointmentsRepo from '../../db/appointmentsRepo';
import { useSync } from '../../context/SyncContext';
import AppButton from '../../components/AppButton';
import StatusBadge from '../../components/StatusBadge';
import SyncBanner from '../../components/SyncBanner';
import { colors } from '../../theme';
import { formatDisplayDate } from '../../utils/date';

export default function MyAppointmentsScreen() {
  const { syncNow, refreshPendingCount } = useSync();
  const [appointments, setAppointments] = useState([]);
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

  function handleCancel(item) {
    Alert.alert('Cancelar cita', '¿Seguro que quieres cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          await appointmentsRepo.setStatusLocal(item.localId, 'cancelled');
          await loadLocal();
          await refreshPendingCount();
          syncNow();
        },
      },
    ]);
  }

  return (
    <View style={styles.flex}>
      <SyncBanner />
      <FlatList
        data={appointments}
        keyExtractor={(item) => String(item.localId)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Todavía no tienes citas. Agenda una desde la otra pestaña.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.doctor}>{item.doctorName}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.specialty}>{item.doctorSpecialty}</Text>
            <Text style={styles.date}>{formatDisplayDate(item.date, item.time)}</Text>
            {item.reason ? <Text style={styles.reason}>Motivo: {item.reason}</Text> : null}
            {item.needsCreate || item.needsStatusPush ? (
              <Text style={styles.pendingTag}>Pendiente de sincronizar</Text>
            ) : null}
            {item.status !== 'cancelled' && (
              <AppButton title="Cancelar cita" variant="danger" onPress={() => handleCancel(item)} />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doctor: { fontSize: 16, fontWeight: '700', color: colors.text },
  specialty: { fontSize: 13, color: colors.muted },
  date: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },
  reason: { fontSize: 13, color: colors.muted },
  pendingTag: { fontSize: 11.5, color: colors.warning, fontWeight: '700' },
});
