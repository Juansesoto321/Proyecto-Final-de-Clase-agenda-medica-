import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const message =
        err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo (iniciar sesión requiere internet).'
          : err.response?.data?.message || 'No se pudo iniciar sesión';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Agenda Médica</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <AppTextInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="tu@correo.com"
        />
        <AppTextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <AppButton title="Ingresar" onPress={handleLogin} loading={loading} />

        <AppButton
          title="Crear una cuenta"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
        />

        <Text style={styles.hint}>Admin de prueba: admin@clinica.com / admin123</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: 24 },
  hint: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 16 },
});
