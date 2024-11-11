import { create } from "zustand";

interface CurrentAudio {
  name: string | null;
  url: string | null;
}

interface PlayerStore {
  isPlaying: boolean;
  currentAudio: CurrentAudio;
  setCurrentAudio: (currentAudio: CurrentAudio) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}


export const usePlayerStore = create<PlayerStore>()((set) => ({
  isPlaying: false,
  currentAudio: {
    name: null,
    url: null,
  },
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentAudio: (currentAudio) => set({ currentAudio }),
}));