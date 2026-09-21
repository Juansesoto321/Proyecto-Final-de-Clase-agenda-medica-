import { getDb } from './database';

const LAST_SYNCED_KEY = 'lastSyncedAt';

export async function getLastSyncedAt() {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT value FROM meta WHERE key = ?', [LAST_SYNCED_KEY]);
  return row ? row.value : new Date(0).toISOString();
}

export async function setLastSyncedAt(isoString) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [LAST_SYNCED_KEY, isoString]);
}

export async function clearAll() {
  const db = await getDb();
  await db.runAsync('DELETE FROM meta');
}
