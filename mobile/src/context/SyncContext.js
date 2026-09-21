import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { runSync } from '../sync/syncService';
import * as appointmentsRepo from '../db/appointmentsRepo';
import * as metaRepo from '../db/metaRepo';
import { useAuth } from './AuthContext';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const { user } = useAuth();
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const wasOffline = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await appointmentsRepo.getPendingCount();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    if (!user) return { ok: false };
    setSyncing(true);
    try {
      const result = await runSync();
      await refreshPendingCount();
      setLastSyncedAt(await metaRepo.getLastSyncedAt());
      return result;
    } finally {
      setSyncing(false);
    }
  }, [user, refreshPendingCount]);

  // Reconexión: si estábamos offline y volvemos a tener internet, sincroniza.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Solo la interfaz de red (WiFi/datos), no `isInternetReachable`: da
      // falso negativo cuando el celular es a la vez el hotspot del PC.
      const isConnected = Boolean(state.isConnected);
      setOnline(isConnected);
      if (isConnected && wasOffline.current && user) {
        syncNow();
      }
      wasOffline.current = !isConnected;
    });
    return unsubscribe;
  }, [user, syncNow]);

  // Al volver la app a primer plano, intenta sincronizar (por si algo cambió
  // en el servidor mientras estaba en segundo plano).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && user) syncNow();
    });
    return () => sub.remove();
  }, [user, syncNow]);

  // Al iniciar sesión: primera sincronización para poblar la base local.
  useEffect(() => {
    if (user) {
      syncNow();
    } else {
      setPendingCount(0);
      setLastSyncedAt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <SyncContext.Provider value={{ online, syncing, pendingCount, lastSyncedAt, syncNow, refreshPendingCount }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync debe usarse dentro de SyncProvider');
  return ctx;
}
