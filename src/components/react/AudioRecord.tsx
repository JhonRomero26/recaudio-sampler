import { MicrophoneIcon, SquareIcon } from "@/components/icons";
import { useRecorderStore } from "@/store/useRecorderStore";
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

  const recordingProps = useRef({
    duration: 2000,
    recordingPerLabel: 100,
    batch: 25,
    labels: [
      "avanza",
      "adelante",
      "atras",
      "frena",
      "izquierda",
      "derecha",
      "reversa",
    ],
    totalLabels: 7,
  });

  const currentRecording = useRef({
    labelIdx: 0,
    timesRecorded: 0,
    nearPause: 25,
  });

  const handleToggleRecording = () => {
    const { duration, batch, labels, recordingPerLabel, totalLabels } =
      recordingProps.current;
    let interval = 0;

    if (!isRecording) {
      if (currentRecording.current.timesRecorded >= recordingPerLabel) {
        currentRecording.current.timesRecorded = 0;
        currentRecording.current.labelIdx++;
      }

      if (currentRecording.current.labelIdx >= totalLabels) return;

      audioRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        audioRecorder.stop().then((blob) => {
          currentRecording.current.timesRecorded++;
          setAudiosRecorded(
            audiosRecorded.concat({
              name: `${labels[currentRecording.current.labelIdx]}-${String(
                currentRecording.current.timesRecorded
              ).padStart(4, "0")}`,
              url: URL.createObjectURL(blob),
              blob,
            })
          );
          setIsRecording(false);
        });
      }, duration);
    }
  };

  return (
    <div
      className="flex flex-col py-12 px-6 gap-6 justify-center
    items-center"
    >
      <div className="flex flex-col gap-2 items-center">
        <div className="flex gap-4">
          <span className="text-center">
            Total: {currentRecording.current.timesRecorded}/
            {recordingProps.current.recordingPerLabel}
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
      <span className="text-2xl">
        {isRecording ? (
          <>
            Diga:{" "}
            <span className="font-bold">
              {recordingProps.current.labels[currentRecording.current.labelIdx]}
            </span>
          </>
        ) : (
          <span>
            Proxima:{" "}
            <span className="font-bold">
              {
                recordingProps.current.labels[
                  currentRecording.current.timesRecorded ===
                  recordingProps.current.recordingPerLabel
                    ? currentRecording.current.labelIdx + 1
                    : currentRecording.current.labelIdx
                ]
              }
            </span>
          </span>
        )}
      </span>
    </div>
  );
}
