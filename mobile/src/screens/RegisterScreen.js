import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { colors } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Faltan datos', 'Nombre, correo y contraseña son obligatorios');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
    } catch (err) {
      const message =
        err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo (registrarte requiere internet).'
          : err.response?.data?.message || 'No se pudo crear la cuenta';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate como paciente</Text>

        <AppTextInput label="Nombre completo" value={name} onChangeText={setName} placeholder="Juan Pérez" />
        <AppTextInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="tu@correo.com"
        />
        <AppTextInput
          label="Teléfono (opcional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="3001234567"
        />
        <AppTextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <AppButton title="Registrarme" onPress={handleRegister} loading={loading} />
        <AppButton title="Ya tengo cuenta" onPress={() => navigation.goBack()} variant="outline" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: 24 },
});
