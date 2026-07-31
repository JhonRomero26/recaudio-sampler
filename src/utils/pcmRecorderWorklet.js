// AudioWorkletProcessor — runs on the audio rendering thread.
// Plain .js on purpose: not part of the TS program, avoids needing
// AudioWorkletGlobalScope ambient types just for this one file.
class PcmRecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel && channel.length > 0) {
      // input buffer is reused by the engine — must copy before posting
      this.port.postMessage(channel.slice());
    }
    return true;
  }
}

registerProcessor("pcm-recorder", PcmRecorderProcessor);
