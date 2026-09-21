import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Alert } from 'react-native';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import * as doctorsRepo from '../../db/doctorsRepo';
import * as appointmentsRepo from '../../db/appointmentsRepo';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import AppButton from '../../components/AppButton';
import AppTextInput from '../../components/AppTextInput';
import { colors } from '../../theme';
import { toDateString, toTimeString, formatDisplayDate } from '../../utils/date';

export default function BookAppointmentScreen({ navigation }) {
  const { user } = useAuth();
  const { syncNow, online } = useSync();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [time, setTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [tempValue, setTempValue] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      doctorsRepo.listDoctors().then((rows) => {
        setDoctors(rows);
        setSelectedDoctor((current) => current || rows[0] || null);
      });
    }, [])
  );

  function openPicker(mode) {
    setPickerMode(mode);
    setTempValue(mode === 'date' ? date : time);
    setPickerVisible(true);
  }

  function onPickerChange(event, value) {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
      if (event.type === 'set' && value) {
        if (pickerMode === 'date') setDate(value);
        else setTime(value);
      }
      return;
    }
    if (value) setTempValue(value);
  }

  function confirmIosPicker() {
    if (pickerMode === 'date') setDate(tempValue);
    else setTime(tempValue);
    setPickerVisible(false);
  }

  async function handleSubmit() {
    if (!selectedDoctor) {
      Alert.alert('Selecciona un doctor', 'Debes elegir un doctor para agendar la cita');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentsRepo.createLocalAppointment({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        patientId: user.id,
        patientName: user.name,
        patientEmail: user.email,
        date: toDateString(date),
        time: toTimeString(time),
        reason,
      });

      setReason('');
      Alert.alert(
        online ? 'Cita agendada' : 'Cita guardada offline',
        online
          ? 'Tu cita quedó registrada y en proceso de confirmación.'
          : 'No hay conexión ahora mismo. La cita se guardó en tu celular y se enviará al servidor apenas vuelva el internet.'
      );
      syncNow();
      navigation.navigate('Mis citas');
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la cita. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Elige un doctor</Text>
      {doctors.length === 0 ? (
        <Text style={styles.muted}>
          No hay doctores en caché todavía. Conéctate a internet una vez para descargar el listado.
        </Text>
      ) : (
        <View style={styles.doctorList}>
          {doctors.map((doc) => {
            const active = selectedDoctor?.id === doc.id;
            return (
              <Pressable
                key={doc.id}
                onPress={() => setSelectedDoctor(doc)}
                style={[styles.doctorCard, active && styles.doctorCardActive]}
              >
                <Text style={[styles.doctorName, active && styles.doctorTextActive]}>{doc.name}</Text>
                <Text style={[styles.doctorSpecialty, active && styles.doctorTextActive]}>{doc.specialty}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>Fecha y hora</Text>
      <View style={styles.row}>
        <Pressable style={styles.pickerButton} onPress={() => openPicker('date')}>
          <Text style={styles.pickerLabel}>Fecha</Text>
          <Text style={styles.pickerValue}>{toDateString(date)}</Text>
        </Pressable>
        <Pressable style={styles.pickerButton} onPress={() => openPicker('time')}>
          <Text style={styles.pickerLabel}>Hora</Text>
          <Text style={styles.pickerValue}>{toTimeString(time)}</Text>
        </Pressable>
      </View>
      <Text style={styles.preview}>{formatDisplayDate(toDateString(date), toTimeString(time))}</Text>

      <AppTextInput
        label="Motivo de la consulta (opcional)"
        value={reason}
        onChangeText={setReason}
        placeholder="Ej: dolor de cabeza recurrente"
        multiline
        numberOfLines={3}
      />

      <AppButton title="Agendar cita" onPress={handleSubmit} loading={submitting} />

      {Platform.OS === 'android' && pickerVisible ? (
        <DateTimePicker
          value={pickerMode === 'date' ? date : time}
          mode={pickerMode}
          display="default"
          minimumDate={pickerMode === 'date' ? new Date() : undefined}
          onChange={onPickerChange}
        />
      ) : null}

      <Modal visible={Platform.OS === 'ios' && pickerVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <DateTimePicker
              value={tempValue}
              mode={pickerMode}
              display="spinner"
              minimumDate={pickerMode === 'date' ? new Date() : undefined}
              onChange={onPickerChange}
            />
            <AppButton title="Listo" onPress={confirmIosPicker} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 8 },
  muted: { color: colors.muted, fontSize: 13.5 },
  doctorList: { gap: 8 },
  doctorCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
  },
  doctorCardActive: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  doctorName: { fontSize: 15, fontWeight: '700', color: colors.text },
  doctorSpecialty: { fontSize: 13, color: colors.muted, marginTop: 2 },
  doctorTextActive: { color: colors.primaryDark },
  row: { flexDirection: 'row', gap: 10 },
  pickerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
  },
  pickerLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  pickerValue: { fontSize: 16, color: colors.text, fontWeight: '700', marginTop: 4 },
  preview: { fontSize: 13, color: colors.muted, marginBottom: 8, fontStyle: 'italic' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.card, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 12 },
});
