import { BrowserAPIError } from "@/errors/BrowserAPIError";
import {
  TARGET_SAMPLE_RATE,
  encodeWavPcm16,
  fitLength,
  resampleLinear,
} from "@/utils/wav";

// Vite resolves this to a fingerprinted static asset URL at build time.
const workletUrl = new URL("./pcmRecorderWorklet.js", import.meta.url);

/** Capture mono PCM via Web Audio (AudioWorklet), export 16 kHz PCM16 WAV. */
export class AudioRecorder {
  #sampleRate: number;
  #chunks: Float32Array[] = [];
  #context: AudioContext | null = null;
  #stream: MediaStream | null = null;
  #node: AudioWorkletNode | null = null;
  #source: MediaStreamAudioSourceNode | null = null;
  #mute: GainNode | null = null;

  constructor({ sampleRate = TARGET_SAMPLE_RATE }: { sampleRate?: number } = {}) {
    this.#sampleRate = sampleRate;
  }

  async start() {
    if (!(navigator.mediaDevices?.getUserMedia)) {
      throw new BrowserAPIError("Browser not support getUserMedia.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const context = new AudioContext();
    await context.audioWorklet.addModule(workletUrl);

    const source = context.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(context, "pcm-recorder", {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      channelCount: 1,
      channelCountMode: "explicit",
    });
    const mute = context.createGain();
    mute.gain.value = 0;

    this.#chunks = [];
    node.port.onmessage = (event: MessageEvent<Float32Array>) => {
      this.#chunks.push(event.data);
    };

    source.connect(node);
    node.connect(mute);
    mute.connect(context.destination);

    this.#stream = stream;
    this.#context = context;
    this.#source = source;
    this.#node = node;
    this.#mute = mute;
  }

  /** Timed capture with exact sample count (2.0s @ 16 kHz → 32000). */
  async recordExact(durationMs: number): Promise<Blob> {
    await this.start();
    await sleep(durationMs);

    if (!this.#context || !this.#node) {
      throw new BrowserAPIError("Not recording.");
    }

    const nativeRate = this.#context.sampleRate;
    this.#teardownGraph();

    const merged = mergeChunks(this.#chunks);
    this.#chunks = [];
    const resampled = resampleLinear(merged, nativeRate, this.#sampleRate);
    const target = Math.round((durationMs / 1000) * this.#sampleRate);
    return encodeWavPcm16(fitLength(resampled, target), this.#sampleRate);
  }

  cancel() {
    this.#teardownGraph();
    this.#chunks = [];
  }

  #teardownGraph() {
    if (this.#node) this.#node.port.onmessage = null;
    this.#node?.disconnect();
    this.#source?.disconnect();
    this.#mute?.disconnect();
    this.#stream?.getTracks().forEach((t) => t.stop());
    void this.#context?.close();
    this.#node = null;
    this.#source = null;
    this.#mute = null;
    this.#stream = null;
    this.#context = null;
  }
}

function mergeChunks(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
