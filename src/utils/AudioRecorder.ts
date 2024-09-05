import { BrowserAPIError } from "@/errors/BrowserAPIError";

export class AudioRecorder {
  #sampleRate: number = 16000;
  #blobs: Blob[] = [];
  #mediaRecorder: MediaRecorder | null = null;
  #streamCaptured: MediaStream | null = null;

  constructor({ sampleRate = 16000 }: { sampleRate?: number } = {}) {
    this.#sampleRate = sampleRate;
  }

  getBlobs = () => this.#blobs;

  async start() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia))
      throw new Error("Browser not support getUserMedia.");

    const stream = await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch((err) => {
        if (err instanceof Error) {
          if (
            err.message.includes(
              "mediaDevices API or getuserMedia method is not supported in this browser"
            )
          ) {
            throw new BrowserAPIError("Browser not support getUserMedia.");
          }
        }
      });

    if (!stream) throw new BrowserAPIError("Browser not support getUserMedia.");

    this.#mediaRecorder = new MediaRecorder(stream);

    this.#streamCaptured = stream;
    this.#blobs = [];
    this.#mediaRecorder.addEventListener(
      "dataavailable",
      this.#dataAvailableHandler
    );

    this.#mediaRecorder.start();
  }

  async stop(): Promise<Blob> {
    if (!this.#mediaRecorder) throw new BrowserAPIError("Not recording.");

    return new Promise((resolve) => {
      const mimeType = this.#mediaRecorder?.mimeType;

      this.#mediaRecorder?.addEventListener("stop", () => {
        const audioBlob = new Blob(this.getBlobs(), { type: mimeType });
        resolve(audioBlob);
      });

      this.#mediaRecorder?.stop();
      this.#stopStream();
      this.#resetRecordingProps();
    });
  }

  cancel() {
    this.#mediaRecorder?.stop();
    this.#stopStream();
    this.#resetRecordingProps();
  }

  #dataAvailableHandler = (event: BlobEvent) => {
    this.#blobs.push(event.data);
  };

  #stopStream() {
    this.#streamCaptured?.getTracks().forEach((track) => track.stop());
  }

  #resetRecordingProps() {
    this.#mediaRecorder = null;
    this.#streamCaptured = null;
  }
}
