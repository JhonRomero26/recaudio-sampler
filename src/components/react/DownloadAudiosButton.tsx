import JSZip from "jszip";
import { useRecorderStore } from "@/store/useRecorderStore";
import { DownloadIcon } from "@/components/icons";
import clsx from "clsx";

export function DownloadAudiosButton() {
  const { audiosRecorded } = useRecorderStore((store) => store);
  const existAudios = audiosRecorded.length === 0;

  const handleDownload = () => {
    const zip = new JSZip();
    audiosRecorded.forEach(({ name, blob }) => {
      zip.file(`${name}.weba`, blob);
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audios.zip";
      a.click();
    });
  };

  return (
    <button
      disabled={existAudios}
      onClick={handleDownload}
      className={clsx("btn  mb-4")}
    >
      <DownloadIcon /> Descargar
    </button>
  );
}
