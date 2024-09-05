import { useRecorderStore } from "@/store/useRecorderStore";
import { DownloadIcon, PlayIcon } from "../icons";
import { useRef } from "react";
import clsx from "clsx";

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
    <div className="container">
      <audio ref={audio} hidden />
      <div className="flex justify-end">
        <button className="btn mb-4">
          <DownloadIcon /> Descargar
        </button>
      </div>
      <ul className="w-full flex overflow-hidden flex-col min-h-64 rounded-xl border-dawn-pink-300 border-dashed border-2 mb-32">
        {audiosRecorded.length > 0 ? (
          audiosRecorded.map(({ name, url }, i) => (
            <li
              key={url}
              className={clsx(
                "flex px-4 justify-between items-center gap-4 w-full py-2",
                {
                  "bg-dawn-pink-300": i % 2 === 0,
                }
              )}
            >
              <span>{name}</span>
              <div>
                <button className="btn btn-icon text-sm p-2">
                  <PlayIcon onClick={() => handlePlayAudio({ name, url })} />
                </button>
              </div>
            </li>
          ))
        ) : (
          <div className="w-full flex-1 h-full flex items-center justify-center">
            <span>¡Aún no has grabado audios!</span>
          </div>
        )}
      </ul>
    </div>
  );
};
