export const initialRecordingProps = {
  duration: 2000,
  recordingPerLabel: 100,
  batch: 25,
  // labels: [
  //   "avanza",
  //   "adelante",
  //   "atras",
  //   "frena",
  //   "izquierda",
  //   "derecha",
  //   "reversa",
  // ],
  labels: [
      "escucha",
      "desactivar",
    ],
  totalLabels: 2,
}

export const initialRecordingProgress = {
  labelIdx: 0,
  timesRecorded: 0,
  nearPause: 25,
}