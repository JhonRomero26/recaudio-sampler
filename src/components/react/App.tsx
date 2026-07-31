import { AudioRecord } from "@/components/react/AudioRecord";
import { RecorderedListAudios } from "@/components/react/RecorderedListAudios";
import { useRecorderStore } from "@/store/useRecorderStore";
import { useEffect } from "react";

/** Single island — one hydrate, one mount, no stacked layout jumps. */
export function App() {
  const hydrate = useRecorderStore((s) => s.hydrate);
  const ready = useRecorderStore((s) => s.ready);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div
      className={ready ? undefined : "pointer-events-none select-none"}
      aria-busy={!ready}
    >
      <AudioRecord />
      <RecorderedListAudios />
    </div>
  );
}
