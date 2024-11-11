import { useRecorderStore } from "@/store/useRecorderStore";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { AudioTile } from "./AudioTile";
import { usePlayerStore } from "@/store/usePlayerStore";

export const AudioList = () => {
  const { currentAudio } = usePlayerStore((store) => store)
  const { audiosRecorded } = useRecorderStore((store) => store);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audio.current) {
      audio.current.src = currentAudio.url || "";
      audio.current.play();
    }
  }, [currentAudio])

  return (
    <ul className="w-full flex overflow-hidden flex-col min-h-64 rounded-xl border-dawn-pink-300 border-dashed border-2 mb-32">
      {audiosRecorded.length > 0 ? (
        audiosRecorded.map(({ name, url }, i) => (
          <li key={url}>
            <AudioTile
              name={name}
              url={url}
              className={clsx({
                "bg-dawn-pink-300": i % 2 === 0,
              })}
            />
          </li>
        ))
      ) : (
        <div className="w-full flex-1 h-full flex items-center justify-center">
          <span>¡Aún no has grabado audios!</span>
        </div>
      )}
    </ul>
  );
};
