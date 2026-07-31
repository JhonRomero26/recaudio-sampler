/** Mirrors command-voice/scripts/record_real_voice.py COMMANDS + defaults. */
export const COMMANDS = [
  "adelante",
  "atras",
  "derecha",
  "frena",
  "izquierda",
  "lento",
  "moderado",
  "rapido",
  "reversa",
] as const;

export type CommandLabel = (typeof COMMANDS)[number];

export const initialRecordingProps = {
  /** ms per take — command-voice default 2.0s */
  duration: 2000,
  /** takes per command (user-editable batch = --n) */
  batch: 15,
  labels: [...COMMANDS] as string[],
  countdownMs: 1500,
};

export const initialRecordingProgress = {
  labelIdx: 0,
  timesRecorded: 0,
};
