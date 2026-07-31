import clsx from "clsx";
import { TrashIcon } from "@/components/icons";
import { PlayAudioButton } from "./PlayAudioButton";
import { useRecorderStore } from "@/store/useRecorderStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useState } from "react";

interface AudioTileProps {
  name: string;
  url: string;
  path: string;
  className?: string;
}

export const AudioTile = ({ name, url, path, className }: AudioTileProps) => {
  const removeAudio = useRecorderStore((s) => s.removeAudio);
  const isRecording = useRecorderStore((s) => s.isRecording);
  const { currentAudio, setIsPlaying, setCurrentAudio } = usePlayerStore();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (busy || isRecording) return;
    setBusy(true);
    try {
      if (currentAudio.url === url) {
        setIsPlaying(false);
        setCurrentAudio({ name: null, url: null });
      }
      await removeAudio(path);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={clsx(
        "flex px-4 justify-between items-center gap-3 w-full py-2",
        className
      )}
    >
      <span className="truncate text-sm min-w-0 flex-1">{name}</span>
      <div className="flex items-center gap-1 shrink-0">
        <PlayAudioButton name={name} url={url} />
        <button
          type="button"
          className="btn btn-icon text-sm p-2 text-red-700 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600"
          onClick={() => void handleDelete()}
          disabled={busy || isRecording}
          aria-label={`Borrar ${name}`}
          title="Borrar"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};
