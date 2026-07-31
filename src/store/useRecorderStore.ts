import type { AudioBlob } from "@/types/AudioBlob";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { COMMANDS } from "@/utils/recording";
import {
  appendClip,
  clearSession,
  defaultMeta,
  deleteClipByPath,
  emptyNextIdx,
  loadSession,
  saveMeta,
  type SessionMeta,
} from "@/utils/sessionPersist";
import { create } from "zustand";

type SessionFields = Pick<
  SessionMeta,
  | "speaker"
  | "batch"
  | "durationMs"
  | "labelIdx"
  | "timesRecorded"
  | "nextIdx"
  | "sessionStarted"
>;

interface UseRecorderStore extends SessionFields {
  ready: boolean;
  restored: boolean;
  audioRecorder: AudioRecorder;
  isRecording: boolean;
  audiosRecorded: AudioBlob[];
  setIsRecording: (isRecording: boolean) => void;
  setSpeaker: (speaker: string) => void;
  setBatch: (batch: number) => void;
  selectCommand: (labelIdx: number) => Promise<void>;
  lockSession: (speaker: string, batch: number) => Promise<void>;
  addAudio: (audio: AudioBlob) => Promise<void>;
  removeAudio: (path: string) => Promise<AudioBlob | null>;
  removeLast: () => Promise<AudioBlob | null>;
  resetSession: () => Promise<void>;
  hydrate: () => Promise<void>;
  persistMeta: () => Promise<void>;
}

function revokeAll(audios: AudioBlob[]) {
  for (const a of audios) URL.revokeObjectURL(a.url);
}

function countLabel(audios: AudioBlob[], label: string): number {
  let n = 0;
  for (const a of audios) if (a.label === label) n += 1;
  return n;
}

function metaFrom(s: SessionFields): SessionMeta {
  return {
    speaker: s.speaker,
    batch: s.batch,
    durationMs: s.durationMs,
    labelIdx: s.labelIdx,
    timesRecorded: s.timesRecorded,
    nextIdx: s.nextIdx,
    sessionStarted: s.sessionStarted,
    updatedAt: Date.now(),
  };
}

export const useRecorderStore = create<UseRecorderStore>()((set, get) => ({
  ready: false,
  restored: false,
  ...defaultMeta(),
  audioRecorder: new AudioRecorder(),
  audiosRecorded: [],
  isRecording: false,

  setIsRecording: (isRecording) => set({ isRecording }),

  setSpeaker: (speaker) => set({ speaker }),

  setBatch: (batch) => set({ batch: Math.max(1, batch) }),

  selectCommand: async (labelIdx) => {
    if (labelIdx < 0 || labelIdx >= COMMANDS.length) return;
    const s = get();
    if (s.isRecording) return;
    const cmd = COMMANDS[labelIdx]!;
    const timesRecorded = countLabel(s.audiosRecorded, cmd);
    set({ labelIdx, timesRecorded, sessionStarted: true });
    await saveMeta(metaFrom(get()));
  },

  lockSession: async (speaker, batch) => {
    set({ speaker, batch, sessionStarted: true });
    await saveMeta(metaFrom(get()));
  },

  persistMeta: async () => {
    await saveMeta(metaFrom(get()));
  },

  addAudio: async (audio) => {
    const data = await audio.blob.arrayBuffer();
    await appendClip({
      path: audio.path,
      name: audio.name,
      label: audio.label,
      data,
    });

    const s = get();
    const cmd = audio.label;
    const nextIdx = { ...s.nextIdx, [cmd]: (s.nextIdx[cmd] ?? 0) + 1 };
    const audiosRecorded = [...s.audiosRecorded, audio];
    const selected = COMMANDS[s.labelIdx];
    const timesRecorded =
      selected === cmd ? countLabel(audiosRecorded, cmd) : s.timesRecorded;

    set({
      audiosRecorded,
      nextIdx,
      timesRecorded,
      sessionStarted: true,
    });
    await saveMeta(metaFrom(get()));
  },

  removeAudio: async (path) => {
    const s = get();
    if (s.isRecording) return null;
    const idx = s.audiosRecorded.findIndex((a) => a.path === path);
    if (idx < 0) return null;

    await deleteClipByPath(path);
    const removed = s.audiosRecorded[idx]!;
    URL.revokeObjectURL(removed.url);
    const audios = s.audiosRecorded.filter((a) => a.path !== path);

    // keep nextIdx (avoid filename collisions); only refresh take count
    const selected = COMMANDS[s.labelIdx];
    const timesRecorded = selected
      ? countLabel(audios, selected)
      : s.timesRecorded;

    set({ audiosRecorded: audios, timesRecorded });
    await saveMeta(metaFrom(get()));
    return removed;
  },

  removeLast: async () => {
    const s = get();
    if (s.audiosRecorded.length === 0) return null;
    const last = s.audiosRecorded[s.audiosRecorded.length - 1]!;
    return get().removeAudio(last.path);
  },

  resetSession: async () => {
    const { audiosRecorded } = get();
    revokeAll(audiosRecorded);
    await clearSession();
    set({
      ...defaultMeta(),
      nextIdx: emptyNextIdx(),
      audiosRecorded: [],
      isRecording: false,
      restored: false,
      ready: true,
    });
  },

  hydrate: async () => {
    try {
      const { meta, clips } = await loadSession();
      if (!meta) {
        set({ ready: true, restored: false });
        return;
      }

      const audios: AudioBlob[] = clips.map((c) => {
        const blob = new Blob([c.data], { type: "audio/wav" });
        return {
          name: c.name,
          label: c.label,
          path: c.path,
          blob,
          url: URL.createObjectURL(blob),
        };
      });

      const labelIdx = Math.min(
        Math.max(0, meta.labelIdx),
        COMMANDS.length - 1
      );
      const selected = COMMANDS[labelIdx]!;
      const timesRecorded = countLabel(audios, selected);

      set({
        speaker: meta.speaker,
        batch: meta.batch,
        durationMs: meta.durationMs,
        labelIdx,
        timesRecorded,
        nextIdx: meta.nextIdx ?? emptyNextIdx(),
        sessionStarted: meta.sessionStarted || audios.length > 0,
        audiosRecorded: audios,
        ready: true,
        restored: audios.length > 0 || meta.sessionStarted,
      });
    } catch {
      set({ ready: true, restored: false });
    }
  },
}));
