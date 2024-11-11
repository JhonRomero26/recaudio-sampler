import type { AudioBlob } from "@/types/AudioBlob";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { create } from "zustand";


interface UseRecorderStore {
  audioRecorder: AudioRecorder;
  isRecording: boolean;
  audiosRecorded: AudioBlob[];
  setIsRecording: (isRecording: boolean) => void;
  setAudiosRecorded: (audiosRecorded: AudioBlob[]) => void;
}

export const useRecorderStore = create<UseRecorderStore>()((set) => ({
    audioRecorder: new AudioRecorder(),
    audiosRecorded: [],
    isRecording: false,
    setIsRecording: (isRecording) => set({ isRecording }),
    setAudiosRecorded: (audiosRecorded) => set({ audiosRecorded })
  }));
