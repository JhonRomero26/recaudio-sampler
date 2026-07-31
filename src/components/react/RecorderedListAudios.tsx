import { AudioList } from "@/components/react/AudioList";
import { DownloadAudiosButton } from "@/components/react/DownloadAudiosButton";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useRecorderStore } from "@/store/useRecorderStore";
import { useEffect, useRef } from "react";

export function RecorderedListAudios() {
  const { currentAudio, isPlaying, setIsPlaying } = usePlayerStore();
  const count = useRecorderStore((s) => s.audiosRecorded.length);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    const onEnd = () => setIsPlaying(false);
    el.addEventListener("ended", onEnd);
    return () => el.removeEventListener("ended", onEnd);
  }, [setIsPlaying]);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    if (!currentAudio.url) {
      el.pause();
      return;
    }
    if (el.src !== currentAudio.url) {
      el.src = currentAudio.url;
    }
    if (isPlaying) {
      void el.play().catch(() => setIsPlaying(false));
    } else {
      el.pause();
    }
  }, [currentAudio, isPlaying, setIsPlaying]);

  return (
    <div className="container pb-16">
      <audio ref={audio} preload="auto" className="hidden" />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-dawn-pink-900 m-0">
          Tomas ({count})
        </h2>
        <DownloadAudiosButton />
      </div>
      <AudioList />
    </div>
  );
}
