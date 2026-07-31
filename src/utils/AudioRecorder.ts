import { BrowserAPIError } from "@/errors/BrowserAPIError";
import {
  TARGET_SAMPLE_RATE,
  encodeWavPcm16,
  fitLength,
  resampleLinear,
} from "@/utils/wav";

/** Capture mono PCM via Web Audio, export 16 kHz PCM16 WAV for command-voice. */
export class AudioRecorder {
  #sampleRate: number;
  #chunks: Float32Array[] = [];
  #context: AudioContext | null = null;
  #stream: MediaStream | null = null;
  #processor: ScriptProcessorNode | null = null;
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
    const source = context.createMediaStreamSource(stream);
    // ponytail: ScriptProcessor deprecated; fine for short fixed-length clips
    const processor = context.createScriptProcessor(4096, 1, 1);
    const mute = context.createGain();
    mute.gain.value = 0;

    this.#chunks = [];
    processor.onaudioprocess = (event) => {
      this.#chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };

    source.connect(processor);
    processor.connect(mute);
    mute.connect(context.destination);

    this.#stream = stream;
    this.#context = context;
    this.#source = source;
    this.#processor = processor;
    this.#mute = mute;
  }

  /** Timed capture with exact sample count (2.0s @ 16 kHz → 32000). */
  async recordExact(durationMs: number): Promise<Blob> {
    await this.start();
    await sleep(durationMs);

    if (!this.#context || !this.#processor) {
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
    this.#processor?.disconnect();
    this.#source?.disconnect();
    this.#mute?.disconnect();
    this.#stream?.getTracks().forEach((t) => t.stop());
    void this.#context?.close();
    this.#processor = null;
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
