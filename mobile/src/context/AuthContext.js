import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginRequest, registerRequest } from '../api/auth';
import * as appointmentsRepo from '../db/appointmentsRepo';
import * as doctorsRepo from '../db/doctorsRepo';
import * as metaRepo from '../db/metaRepo';
import { runSync } from '../sync/syncService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem('user');
      const storedToken = await AsyncStorage.getItem('token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    })();
  }, []);

  async function persistSession({ token, user: sessionUser }) {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  }

  // Requiere conexión (no se puede crear una sesión nueva sin contactar al
  // servidor). Una vez logueado, la sesión queda guardada y funciona offline.
  async function login(email, password) {
    const data = await loginRequest({ email, password });
    await persistSession(data);
  }

  async function register(payload) {
    const data = await registerRequest(payload);
    await persistSession(data);
  }

  async function logout() {
    // Antes de borrar la copia local, intenta subir lo pendiente. Si sigue
    // habiendo cambios sin sincronizar (p. ej. por seguir offline), NO se
    // borra nada — se perdería una cita creada sin conexión. Se sincroniza
    // y se limpia la próxima vez que alguien entre con internet.
    await runSync().catch(() => null);
    const stillPending = await appointmentsRepo.getPendingCount();

    await AsyncStorage.multiRemove(['token', 'user']);
    if (stillPending === 0) {
      await appointmentsRepo.clearAll();
      await doctorsRepo.clearAll();
      await metaRepo.clearAll();
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
