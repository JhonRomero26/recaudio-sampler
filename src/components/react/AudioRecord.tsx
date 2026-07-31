import { useRecorderStore } from "@/store/useRecorderStore";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RecordButton } from "./RecordButton";
import { COMMANDS } from "@/utils/recording";
import { sanitizeSpeaker } from "@/utils/wav";

export function AudioRecord() {
  const {
    ready,
    restored,
    isRecording,
    audioRecorder,
    audiosRecorded,
    speaker,
    batch,
    durationMs,
    sessionStarted,
    labelIdx,
    timesRecorded,
    setIsRecording,
    setSpeaker,
    setBatch,
    selectCommand,
    lockSession,
    addAudio,
    removeLast,
    resetSession,
  } = useRecorderStore();

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const restoredBannerShown = useRef(false);

  useEffect(() => {
    if (restored && ready && !restoredBannerShown.current) {
      restoredBannerShown.current = true;
      const n = useRecorderStore.getState().audiosRecorded.length;
      setBanner(
        `Sesión restaurada · ${n} toma${n === 1 ? "" : "s"} en este dispositivo`
      );
    }
  }, [restored, ready]);

  const currentLabel = COMMANDS[labelIdx] ?? COMMANDS[0]!;
  const totalTarget = COMMANDS.length * batch;
  const allDone = audiosRecorded.length >= totalTarget && totalTarget > 0;
  const currentFull = timesRecorded >= batch;
  const progressPct =
    totalTarget > 0
      ? Math.min(100, Math.round((audiosRecorded.length / totalTarget) * 100))
      : 0;

  const commandStats = useMemo(() => {
    const counts: Record<string, number> = Object.fromEntries(
      COMMANDS.map((c) => [c, 0])
    );
    for (const a of audiosRecorded) {
      counts[a.label] = (counts[a.label] ?? 0) + 1;
    }
    return COMMANDS.map((cmd, i) => {
      const n = counts[cmd] ?? 0;
      const status =
        n >= batch ? "done" : i === labelIdx ? "current" : "todo";
      return { cmd, n, i, status };
    });
  }, [audiosRecorded, batch, labelIdx]);

  const canRecord =
    ready && !isRecording && !busy && !currentFull && Boolean(currentLabel);
  const controlsLocked = !ready || isRecording || busy;

  const handleSelect = async (i: number) => {
    if (isRecording || busy) return;
    setError(null);
    await selectCommand(i);
  };

  const handleRecord = useCallback(async () => {
    const s = useRecorderStore.getState();
    if (!s.ready || s.isRecording || busy) return;

    const cmd = COMMANDS[s.labelIdx];
    if (!cmd) return;

    const already = s.audiosRecorded.filter((a) => a.label === cmd).length;
    if (already >= s.batch) {
      setError(`Batch completo para “${cmd}”. Elegí otro comando.`);
      return;
    }

    const spk = sanitizeSpeaker(s.speaker);
    if (!spk) {
      setError("Speaker inválido (letras/números).");
      return;
    }
    if (s.batch < 1) {
      setError("Batch debe ser ≥ 1.");
      return;
    }

    if (!s.sessionStarted) {
      await lockSession(spk, s.batch);
      setSpeaker(spk);
    }

    const { nextIdx: ni, durationMs: dur } = useRecorderStore.getState();

    setBusy(true);
    try {
      setError(null);
      setIsRecording(true);

      const blob = await audioRecorder.recordExact(dur);
      const idx = ni[cmd] ?? 0;
      const stem = `${cmd}_real_${spk}_${String(idx).padStart(4, "0")}`;
      const path = `dataset/${cmd}/${stem}.wav`;

      await addAudio({
        name: stem,
        label: cmd,
        path,
        url: URL.createObjectURL(blob),
        blob,
      });
      setBanner(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al grabar");
      audioRecorder.cancel();
    } finally {
      setIsRecording(false);
      setBusy(false);
    }
  }, [addAudio, audioRecorder, busy, lockSession, setIsRecording, setSpeaker]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code !== "Space") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "BUTTON" ||
          t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      void handleRecord();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRecord]);

  // 1–9 pick command
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const st = useRecorderStore.getState();
      if (st.isRecording) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      ) {
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= COMMANDS.length) {
        e.preventDefault();
        void st.selectCommand(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleUndo = async () => {
    if (isRecording || busy || audiosRecorded.length === 0) return;
    setBusy(true);
    try {
      const removed = await removeLast();
      if (removed) setBanner(`Eliminada: ${removed.name}`);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (isRecording || busy) return;
    if (
      audiosRecorded.length > 0 &&
      !window.confirm("¿Borrar toda la sesión guardada en este dispositivo?")
    ) {
      return;
    }
    await resetSession();
    setBanner(null);
    setError(null);
  };

  // Always the same shell (SSR + first paint) — no loader swap that jumps layout.
  return (
    <div className="flex flex-col gap-6 items-center px-4 pb-8">
      {/* Reserved slot so restore banner never shoves content down */}
      <div className="w-full max-w-lg min-h-12 flex items-stretch">
        {banner ? (
          <div
            role="status"
            className="w-full rounded-lg border border-dawn-pink-400 bg-dawn-pink-50 px-4 py-3 text-sm text-dawn-pink-900 flex justify-between gap-3 items-start"
          >
            <span>{banner}</span>
            <button
              type="button"
              className="text-dawn-pink-600 hover:text-dawn-pink-950 shrink-0"
              onClick={() => setBanner(null)}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-full" aria-hidden />
        )}
      </div>

      <div className="w-full max-w-lg rounded-2xl border border-dawn-pink-300 bg-dawn-pink-50/80 p-5 flex flex-col gap-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold text-dawn-pink-900">Speaker</span>
            <input
              className="field"
              value={speaker}
              disabled={!ready || (sessionStarted && audiosRecorded.length > 0)}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder="yo"
              autoComplete="username"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-semibold text-dawn-pink-900">
              Batch (por comando)
            </span>
            <input
              type="number"
              min={1}
              max={500}
              className="field"
              value={batch}
              disabled={!ready || (sessionStarted && audiosRecorded.length > 0)}
              onChange={(e) =>
                setBatch(Math.max(1, Number(e.target.value) || 1))
              }
            />
          </label>
        </div>
        <p className="text-xs text-dawn-pink-700">
          Tocá un comando · Espacio graba ya · {durationMs / 1000}s · 16 kHz WAV
          · teclas 1–{COMMANDS.length}
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-medium text-dawn-pink-800">
            <span>
              {audiosRecorded.length}/{totalTarget} tomas
            </span>
            <span>{progressPct}%</span>
          </div>
          <div
            className="h-2.5 rounded-full bg-dawn-pink-200 overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-dawn-pink-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div
          className="flex flex-wrap gap-1.5"
          role="listbox"
          aria-label="Elegir comando"
          aria-activedescendant={`cmd-${currentLabel}`}
        >
          {commandStats.map(({ cmd, n, i, status }) => (
            <button
              key={cmd}
              id={`cmd-${cmd}`}
              type="button"
              role="option"
              aria-selected={status === "current"}
              disabled={controlsLocked}
              onClick={() => void handleSelect(i)}
              className={clsx(
                "text-xs px-2.5 py-1.5 rounded-full border font-medium tabular-nums transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn-pink-500",
                status === "done" &&
                  "bg-emerald-100 border-emerald-400 text-emerald-900",
                status === "current" &&
                  "bg-dawn-pink-700 border-dawn-pink-800 text-white ring-2 ring-dawn-pink-400 ring-offset-1",
                status === "todo" &&
                  "bg-white border-dawn-pink-300 text-dawn-pink-700 hover:border-dawn-pink-500 hover:bg-dawn-pink-100",
                controlsLocked && "opacity-60 cursor-not-allowed"
              )}
              title={`${i + 1}: ${cmd} (${n}/${batch})`}
            >
              <span className="opacity-50 mr-1">{i + 1}</span>
              {status === "done" ? "✓ " : ""}
              {cmd}
              <span className="opacity-70 ml-1">
                {n}/{batch}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        <div
          className={clsx(
            "w-full rounded-2xl border-2 px-6 py-8 text-center transition-colors",
            isRecording
              ? "border-red-500 bg-red-50"
              : allDone
                ? "border-emerald-400 bg-emerald-50"
                : currentFull
                  ? "border-amber-400 bg-amber-50"
                  : "border-dawn-pink-300 bg-white"
          )}
        >
          {allDone ? (
            <>
              <p className="text-sm font-medium text-emerald-800 mb-2">
                Sesión completa
              </p>
              <p className="text-2xl font-bold text-emerald-950">
                Descargá el zip abajo
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-dawn-pink-700 mb-2">
                {isRecording
                  ? "Grabando… decí"
                  : currentFull
                    ? "Batch completo — elegí otro"
                    : "Comando seleccionado"}
              </p>
              <p
                className={clsx(
                  "font-black tracking-wide uppercase text-dawn-pink-950",
                  isRecording ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"
                )}
              >
                {currentLabel}
              </p>
              <p className="mt-3 text-sm text-dawn-pink-700 tabular-nums">
                Toma {Math.min(timesRecorded, batch)}/{batch}
                {currentFull ? " · listo" : ""}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "block w-3 h-3 rounded-full bg-red-500",
              isRecording ? "animate-pulse" : "opacity-0"
            )}
            aria-hidden
          />
          <span className="text-sm text-dawn-pink-800">
            {!ready
              ? "Cargando sesión…"
              : isRecording
                ? "Grabando…"
                : canRecord
                  ? "Espacio o clic → graba ya"
                  : allDone
                    ? "Listo"
                    : currentFull
                      ? "Elegí otro comando"
                      : "…"}
          </span>
        </div>

        {/* Fixed-height error slot — no layout jump when messages appear */}
        <div className="w-full min-h-10">
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 w-full text-center">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 min-h-28">
          <RecordButton
            handleClick={() => void handleRecord()}
            disabled={!canRecord}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            className="btn text-sm"
            disabled={
              !ready || audiosRecorded.length === 0 || isRecording || busy
            }
            onClick={() => void handleUndo()}
          >
            Deshacer última
          </button>
          <button
            type="button"
            className="btn text-sm"
            disabled={!ready || isRecording || busy}
            onClick={() => void handleReset()}
          >
            Nueva sesión
          </button>
        </div>
      </div>
    </div>
  );
}
