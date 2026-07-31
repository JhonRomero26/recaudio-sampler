/** IndexedDB session so a closed tab can resume mid-batch. */

import { COMMANDS } from "@/utils/recording";

const DB_NAME = "recaudio-sampler";
const DB_VERSION = 1;
const META_KEY = "session";

export type SessionMeta = {
  speaker: string;
  batch: number;
  durationMs: number;
  labelIdx: number;
  timesRecorded: number;
  nextIdx: Record<string, number>;
  sessionStarted: boolean;
  updatedAt: number;
};

export type StoredClip = {
  id?: number;
  path: string;
  name: string;
  label: string;
  data: ArrayBuffer;
};

export function emptyNextIdx(): Record<string, number> {
  return Object.fromEntries(COMMANDS.map((c) => [c, 0]));
}

export function defaultMeta(partial?: Partial<SessionMeta>): SessionMeta {
  return {
    speaker: "John Doe",
    batch: 15,
    durationMs: 2000,
    labelIdx: 0,
    timesRecorded: 0,
    nextIdx: emptyNextIdx(),
    sessionStarted: false,
    updatedAt: Date.now(),
    ...partial,
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta");
      }
      if (!db.objectStoreNames.contains("clips")) {
        db.createObjectStore("clips", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb open failed"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb tx failed"));
    tx.onabort = () => reject(tx.error ?? new Error("idb tx aborted"));
  });
}

export async function loadSession(): Promise<{
  meta: SessionMeta | null;
  clips: StoredClip[];
}> {
  const db = await openDb();
  try {
    const meta = await new Promise<SessionMeta | null>((resolve, reject) => {
      const req = db.transaction("meta", "readonly").objectStore("meta").get(META_KEY);
      req.onsuccess = () => resolve((req.result as SessionMeta) ?? null);
      req.onerror = () => reject(req.error);
    });
    const clips = await new Promise<StoredClip[]>((resolve, reject) => {
      const req = db.transaction("clips", "readonly").objectStore("clips").getAll();
      req.onsuccess = () => resolve((req.result as StoredClip[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    // insertion order by auto-id
    clips.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    return { meta, clips };
  } finally {
    db.close();
  }
}

export async function saveMeta(meta: SessionMeta): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction("meta", "readwrite");
    tx.objectStore("meta").put({ ...meta, updatedAt: Date.now() }, META_KEY);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function appendClip(
  clip: Omit<StoredClip, "id">
): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction("clips", "readwrite");
    tx.objectStore("clips").add(clip);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function popLastClip(): Promise<StoredClip | null> {
  const db = await openDb();
  try {
    const clips = await new Promise<StoredClip[]>((resolve, reject) => {
      const req = db.transaction("clips", "readonly").objectStore("clips").getAll();
      req.onsuccess = () => resolve((req.result as StoredClip[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    if (clips.length === 0) return null;
    clips.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const last = clips[clips.length - 1]!;
    const tx = db.transaction("clips", "readwrite");
    tx.objectStore("clips").delete(last.id!);
    await txDone(tx);
    return last;
  } finally {
    db.close();
  }
}

export async function deleteClipByPath(path: string): Promise<StoredClip | null> {
  const db = await openDb();
  try {
    const clips = await new Promise<StoredClip[]>((resolve, reject) => {
      const req = db.transaction("clips", "readonly").objectStore("clips").getAll();
      req.onsuccess = () => resolve((req.result as StoredClip[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    const hit = clips.find((c) => c.path === path) ?? null;
    if (!hit?.id) return null;
    const tx = db.transaction("clips", "readwrite");
    tx.objectStore("clips").delete(hit.id);
    await txDone(tx);
    return hit;
  } finally {
    db.close();
  }
}

export async function clearSession(): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(["meta", "clips"], "readwrite");
    tx.objectStore("meta").delete(META_KEY);
    tx.objectStore("clips").clear();
    await txDone(tx);
  } finally {
    db.close();
  }
}
