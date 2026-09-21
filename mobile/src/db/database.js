import * as SQLite from 'expo-sqlite';

let dbPromise = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('agenda_medica.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS doctors (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          specialty TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS appointments (
          localId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          serverId INTEGER,
          clientUuid TEXT UNIQUE NOT NULL,
          doctorId INTEGER NOT NULL,
          doctorName TEXT,
          doctorSpecialty TEXT,
          patientId INTEGER,
          patientName TEXT,
          patientEmail TEXT,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          needsCreate INTEGER NOT NULL DEFAULT 0,
          needsStatusPush INTEGER NOT NULL DEFAULT 0,
          updatedAt TEXT
        );

        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT
        );
      `);
      return db;
    });
  }
  return dbPromise;
}
