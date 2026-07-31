import clsx from "clsx";
import { MicrophoneIcon, SquareIcon } from "../icons";
import { useRecorderStore } from "@/store/useRecorderStore";

export type RecordButtonProps = {
  handleClick: () => void;
  disabled?: boolean;
};

export function RecordButton({ handleClick, disabled }: RecordButtonProps) {
  const { isRecording } = useRecorderStore((store) => store);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title="Grabar (Espacio)"
      aria-label={isRecording ? "Grabando" : "Grabar"}
      className={clsx(
        "btn btn-icon relative p-10 text-7xl shadow-md",
        isRecording && "border-red-500 text-red-600",
        !disabled && !isRecording && "hover:scale-105"
      )}
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
  );
}
