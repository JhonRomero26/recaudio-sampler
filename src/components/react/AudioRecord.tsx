import { useRecorderStore } from "@/store/useRecorderStore";
import clsx from "clsx";
import { useRef } from "react";
import { RecordButton } from "./RecordButton";
import { initialRecordingProgress, initialRecordingProps } from "@/utils/recording";


export function AudioRecord() {
  const { isRecording, audioRecorder, audiosRecorded, setIsRecording, setAudiosRecorded } = useRecorderStore();

  const recordingProps = useRef(initialRecordingProps);
  const currentRecording = useRef(initialRecordingProgress);

  const handleToggleRecording = async () => {
    const { duration, labels, recordingPerLabel, totalLabels } =
      recordingProps.current;

    if (isRecording) return
    if (currentRecording.current.timesRecorded >= recordingPerLabel) {
      currentRecording.current.timesRecorded = 0;
      currentRecording.current.labelIdx++;
    }

    if (currentRecording.current.labelIdx >= totalLabels) return;
    
    await audioRecorder.start();
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
       <RecordButton handleClick={handleToggleRecording} />
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
