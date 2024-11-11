import { AudioList } from "@/components/react/AudioList";
import { DownloadAudiosButton } from "@/components/react/DownloadAudiosButton";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useRef, useEffect } from "react";

export function RecorderedListAudios() {
  const { currentAudio, isPlaying, setIsPlaying } = usePlayerStore((state) => state);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleEndAudio = () => {
      setIsPlaying(false)
    }

    audio.current?.addEventListener("ended", handleEndAudio)

    return () => {
      audio.current?.removeEventListener("ended", handleEndAudio)
    }
  }, [])

  useEffect(() => {
    if (audio.current) {
      const { url } = currentAudio;
      audio.current.src = url || "";

      isPlaying
        ? audio.current.play()
        : audio.current.pause()
    }
  }, [currentAudio, isPlaying]);

  return (
    <div className="container">
      <audio ref={audio} hidden />
      <div className="flex justify-end">
        <DownloadAudiosButton />
      </div>
      <AudioList />
    </div>
  );
}
