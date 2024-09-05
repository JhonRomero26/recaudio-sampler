// import type { AudioBlob } from "@/types/AudioBlob"
// import { AudioRecorder } from "@/utils/AudioRecorder"
// import { useRef } from "react"
// import { create } from "zustand"

// interface UseRecorderStore {
//   recorder: AudioRecorder
//   isRecording: boolean
//   blobs: Omit<AudioBlob, "blob">[]
//   player: React.RefObject<HTMLAudioElement> // useRef
//   setCurrentAudio: (currentAudio: Omit<AudioBlob, "blob">) => void
//   startRecording: () => void
//   stopRecording: ({ name }: { name?: string }) => void
//   cancelRecording: () => void
// }

// export const useRecorderStore = create<UseRecorderStore>()((set) => ({
//   recorder: new AudioRecorder(),
//   blobs: [],
//   isRecording: false,
//   currentAudio: {
//     name: null,
//     url: null
//   },
//   setCurrentAudio: (currentAudio) => set({ currentAudio }),
//   player: useRef<HTMLAudioElement>(null),
//   const ext = blob.type.split("/")[1]
//   playAudio: (url) => set((store) => {
//     if (store.player.current) {
//       store.player.current.src = url
//       store.player.current.play()
//     }
//   }),
//   startRecording: () => set((store) => {
//     store.recorder.start()
//     return { isRecording: true }
//   }),
//   stopRecording: ({ name }) => set((store) => {
//     store.recorder.stop()
//       .then((blob) => {
//         const audioBlob: AudioBlob = {
//           name: name || new Date().getTime().toString(),
//           blob,
//           url: URL.createObjectURL(blob)
//         }
//         store.blobs.push(audioBlob)
//       })
//     return { isRecording: false }
//   }),
//   cancelRecording: () => set((store) => {
//     store.recorder.cancel()
//     return { isRecording: false }
//   })
// }))

import type { AudioBlob } from "@/types/AudioBlob";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { create } from "zustand";

interface CurrentAudio {
  name: string | null;
  url: string | null;
}

interface UseRecorderStore {
  audioRecorder: AudioRecorder;
  isRecording: boolean;
  audiosRecorded: AudioBlob[];
  currentAudio: CurrentAudio;
  setCurrentAudio: (currentAudio: CurrentAudio) => void;
  setIsRecording: (isRecording: boolean) => void;
  setAudiosRecorded: (audiosRecorded: AudioBlob[]) => void;
}

export const useRecorderStore = create<UseRecorderStore>()((set) => ({
  audioRecorder: new AudioRecorder(),
  audiosRecorded: [],
  isRecording: false,
  currentAudio: {
    name: null,
    url: null,
  },
  setIsRecording: (isRecording) => set({ isRecording }),
  setCurrentAudio: (currentAudio) => set({ currentAudio }),
  setAudiosRecorded: (audiosRecorded) => set({ audiosRecorded }),
}));
