import {
  MicrophoneIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
} from "@/components/icons";
import { useRecorderStore } from "@/store/useRecorderStore";
import { AudioRecorder } from "@/utils/AudioRecorder";
import clsx from "clsx";
import { useRef } from "react";

export function AudioRecord() {
  const {
    isRecording,
    audioRecorder,
    audiosRecorded,
    setAudiosRecorded,
    setIsRecording,
  } = useRecorderStore((store) => store);
  const duration = useRef<number>(2000);
  const recordingTimes = useRef<number>(100);
  const batchs = useRef<number>(25);
  const names = useRef<string[]>([
    "avanza",
    "adelante",
    "atras",
    "frena",
    "izquierda",
    "derecha",
    "reversa",
  ]);
  const times = useRef<number>(0);

  const handleToggleRecording = () => {
    if (!isRecording) {
      audioRecorder.start();
      setIsRecording(true);
    } else {
      times.current++;
      setIsRecording(false);
      audioRecorder.stop().then((blob) => {
        setAudiosRecorded(
          audiosRecorded.concat({
            name: `${names.current[0]}-${String(times.current).padStart(
              4,
              "0"
            )}`,
            url: URL.createObjectURL(blob),
            blob,
          })
        );
      });
    }
  };

  return (
    <div
      className="flex flex-col py-12 px-6 gap-6 justify-center
    items-center"
    >
      <div className="flex flex-col gap-2 items-center">
        <div>
          <span className="text-center">
            Total: {times.current}/{recordingTimes.current}
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <span
            className={clsx(
              "block bg-red-500 w-4 h-4 animate-pulse rounded-full",
              !isRecording && "hidden"
            )}
          />
          <span className="">
            {isRecording ? "Grabando..." : "Pulsa para grabar"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={handleToggleRecording}
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
      </div>
    </div>
  );
}
