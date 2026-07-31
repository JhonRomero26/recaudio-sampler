import { PauseIcon, PlayIcon } from "@/components/icons";
import { usePlayerStore } from "@/store/usePlayerStore";
import clsx from "clsx";

export type PlayAudioButtonProps = {
  name: string;
  url: string;
};

export function PlayAudioButton({ name, url }: PlayAudioButtonProps) {
  const { setCurrentAudio, setIsPlaying, isPlaying, currentAudio } =
    usePlayerStore((store) => store);
  const active = isPlaying && currentAudio.url === url;

  const handleTogglePlay = () => {
    if (currentAudio.url === url) {
      setIsPlaying(!isPlaying);
      return;
    }
    setCurrentAudio({ name, url });
    setIsPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      aria-label={active ? `Pausar ${name}` : `Reproducir ${name}`}
      className="btn btn-icon text-sm p-2 relative"
    >
      <PlayIcon
        className={clsx(
          "motion-safe:transition-transform",
          active ? "-rotate-90 opacity-0" : "opacity-100"
        )}
      />
      <PauseIcon
        className={clsx(
          "absolute motion-safe:transition-transform",
          active ? "rotate-0 opacity-100" : "opacity-0 rotate-90"
        )}
      />
    </button>
  );
}
