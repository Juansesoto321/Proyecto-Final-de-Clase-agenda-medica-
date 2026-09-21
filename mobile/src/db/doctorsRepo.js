import { getDb } from './database';

export async function listDoctors() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM doctors ORDER BY name ASC');
}

export async function replaceAllDoctors(doctors) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM doctors');
    for (const doc of doctors) {
      await db.runAsync('INSERT INTO doctors (id, name, specialty) VALUES (?, ?, ?)', [
        doc.id,
        doc.name,
        doc.specialty,
      ]);
    }
  });
}

export async function clearAll() {
  const db = await getDb();
  await db.runAsync('DELETE FROM doctors');
}
