import { AudioList } from "@/components/react/AudioList";
import { DownloadAudiosButton } from "@/components/react/DownloadAudiosButton";
import { useRecorderStore } from "@/store/useRecorderStore";
import { useRef, useEffect } from "react";

export function RecorderedListAudios() {
  const { currentAudio } = useRecorderStore((state) => state);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audio.current) {
      const { url } = currentAudio;
      audio.current.src = url || "";
      audio.current.play();
    }
  }, [currentAudio]);

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
