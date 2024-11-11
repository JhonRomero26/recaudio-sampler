import { useRecorderStore } from "@/store/useRecorderStore";
import { useRef } from "react";
import clsx from "clsx";
import { PlayAudioButton } from "./PlayAudioButton";

interface AudioTileProps {
  name: string;
  url: string;
  className?: string;
}

export const AudioTile = ({ name, url, className }: AudioTileProps) => {
  return (
    <div
      className={clsx(
        "flex px-4 justify-between items-center gap-4 w-full py-2",
        className
      )}
    >
      <span>{name}</span>
      <PlayAudioButton name={name} url={url} />
    </div>
  );
};
