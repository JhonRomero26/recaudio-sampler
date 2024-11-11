import clsx from "clsx";
import { MicrophoneIcon, SquareIcon } from "../icons";
import { useRecorderStore } from "@/store/useRecorderStore";


export type RecordButtonProps = {
  handleClick: () => void
}


export function RecordButton({handleClick}: RecordButtonProps) {
  const { isRecording } = useRecorderStore((store) => store);

  return (
    <button
    onClick={handleClick}
    title="Grabar"
    className="btn btn-icon p-10 text-7xl"
  >
    <MicrophoneIcon
      className={clsx(
        "motion-safe:transition-transform",
        isRecording ? "-rotate-90 opacity-0" : "opacity-100"
      )}
    />
    <SquareIcon
      className={clsx(
        "absolute motion-safe:transition-transform",
        isRecording ? "rotate-0 opacity-100" : "opacity-0 rotate-90"
      )}
    />
  </button>
  )
}