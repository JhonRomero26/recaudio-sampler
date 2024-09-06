import { useRecorderStore } from "@/store/useRecorderStore";
import { PlayIcon } from "@/components/icons";
import { useRef } from "react";
import clsx from "clsx";
import { DownloadAudiosButton } from "@/components/react/DownloadAudiosButton";
import { AudioTile } from "./AudioTile";

export const AudioList = () => {
  const { audiosRecorded, setCurrentAudio } = useRecorderStore(
    (store) => store
  );
  const audio = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = ({ name, url }: { name: string; url: string }) => {
    setCurrentAudio({ name, url });
    if (audio.current) {
      audio.current.src = url;
      audio.current.play();
    }
  };

  return (
    <ul className="w-full flex overflow-hidden flex-col min-h-64 rounded-xl border-dawn-pink-300 border-dashed border-2 mb-32">
      {audiosRecorded.length > 0 ? (
        audiosRecorded.map(({ name, url }, i) => (
          <li>
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
