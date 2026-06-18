import { openDB } from 'idb';

const DB = 'journal-db';
const STORE = 'entries';

function db() {
  return openDB(DB, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'id' });
    },
  });
}

export async function saveEntry(entry) {
  return (await db()).put(STORE, entry);
}

export async function getEntry(id) {
  return (await db()).get(STORE, id);
}

export async function getAllEntries() {
  const entries = await (await db()).getAll(STORE);
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteEntry(id) {
  await (await db()).delete(STORE, id);
  await deleteAudio(id);
}

export async function saveAudio(id, blob) {
  const root = await navigator.storage.getDirectory();
  const fh = await root.getFileHandle(`${id}.webm`, { create: true });
  const writable = await fh.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function getAudio(id) {
  try {
    const root = await navigator.storage.getDirectory();
    const fh = await root.getFileHandle(`${id}.webm`);
    return await fh.getFile();
  } catch {
    return null;
  }
}

export async function deleteAudio(id) {
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(`${id}.webm`);
  } catch {}
}
