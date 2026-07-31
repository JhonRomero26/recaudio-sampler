import { useRecorderStore } from "@/store/useRecorderStore";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { AudioTile } from "./AudioTile";

export const AudioList = () => {
  const { audiosRecorded } = useRecorderStore((store) => store);
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [audiosRecorded.length]);

  const items = [...audiosRecorded].reverse();

  return (
    <ul
      className="w-full flex overflow-y-auto flex-col h-80 rounded-xl border-dawn-pink-300 border border-solid bg-white/60 mb-8"
      aria-label="Grabaciones"
    >
      {items.length > 0 ? (
        items.map(({ name, url, path }, i) => (
          <li key={path} ref={i === 0 ? endRef : undefined}>
            <AudioTile
              name={name}
              url={url}
              path={path}
              className={clsx(i % 2 === 0 && "bg-dawn-pink-100/80")}
            />
          </li>
        ))
      ) : (
        <li className="w-full flex-1 min-h-40 flex items-center justify-center text-dawn-pink-700 text-sm px-4 text-center">
          No hay grabaciones aún.
        </li>
      )}
    </ul>
  );
};
