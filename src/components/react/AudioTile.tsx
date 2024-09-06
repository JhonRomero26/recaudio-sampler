import { useRecorderStore } from "@/store/useRecorderStore";
import { PlayIcon } from "@/components/icons";
import { useRef } from "react";
import clsx from "clsx";
import { DownloadAudiosButton } from "@/components/react/DownloadAudiosButton";

interface AudioTileProps {
  name: string;
  url: string;
  className?: string;
}

export const AudioTile = ({ name, url, className }: AudioTileProps) => {
  const { setCurrentAudio } = useRecorderStore((store) => store);
  const audio = useRef<HTMLAudioElement>(null);

  const handlePlayAudio = ({ name, url }: { name: string; url: string }) => {
    setCurrentAudio({ name, url });
  };

  return (
    <div
      className={clsx(
        "flex px-4 justify-between items-center gap-4 w-full py-2",
        className
      )}
    >
      <span>{name}</span>
      <div>
        <button className="btn btn-icon text-sm p-2">
          <PlayIcon onClick={() => handlePlayAudio({ name, url })} />
        </button>
      </div>
    </div>
  );
};
