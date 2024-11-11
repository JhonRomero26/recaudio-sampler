import { PauseIcon, PlayIcon } from "@/components/icons";
import { usePlayerStore } from "@/store/usePlayerStore";
import clsx from "clsx";

export type PlayAudioButtonProps = {
  name: string
  url: string
}

export function PlayAudioButton({ url }: PlayAudioButtonProps) {
  const { setCurrentAudio, setIsPlaying, isPlaying, currentAudio } = usePlayerStore(
    (store) => store
  );
  const playButton = isPlaying && currentAudio.url === url

  
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying)

    if (currentAudio.url !== url) {
      setCurrentAudio({ name: currentAudio.name, url })
    }
  }
  
  return (
    <button
      onClick={() => handleTogglePlay()}
      className="btn btn-icon text-sm p-2 ${playButton}"
    >
      <PlayIcon
        className={clsx(
          "motion-safe:transition-transform",
          playButton ? "-rotate-90 opacity-0" : "opacity-100"
        )}
      />
      <PauseIcon
        className={clsx(
          "absolute motion-safe:transition-transform",
          playButton ? "rotate-0 opacity-100" : "opacity-0 rotate-90"
        )}
      />
    </button>
  )
}