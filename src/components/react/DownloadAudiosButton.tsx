import JSZip from "jszip";
import { useRecorderStore } from "@/store/useRecorderStore";
import { DownloadIcon } from "@/components/icons";
import { useState } from "react";
import clsx from "clsx";

export function DownloadAudiosButton() {
  const { audiosRecorded, speaker } = useRecorderStore();
  const [zipping, setZipping] = useState(false);
  const empty = audiosRecorded.length === 0;

  const handleDownload = async () => {
    if (empty || zipping) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      for (const { path, blob } of audiosRecorded) {
        zip.file(path, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dataset_real_${speaker || "voice"}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  };

  return (
    <button
      type="button"
      disabled={empty || zipping}
      onClick={() => void handleDownload()}
      className={clsx("btn text-sm gap-2")}
    >
      <DownloadIcon />
      {zipping ? "Comprimiendo…" : "Descargar dataset"}
    </button>
  );
}
