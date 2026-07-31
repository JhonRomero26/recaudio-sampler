/** One-shot check: node src/utils/wav.selfcheck.mjs */
function encodeWavPcm16(samples, sampleRate = 16000) {
  const n = samples.length;
  const dataSize = n * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (o, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Uint8Array(buffer);
}

function sanitizeSpeaker(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

const samples = new Float32Array(32000);
for (let i = 0; i < samples.length; i++) samples[i] = 0.25 * Math.sin((2 * Math.PI * 440 * i) / 16000);
const wav = encodeWavPcm16(samples, 16000);
console.assert(wav.byteLength === 44 + 32000 * 2, "wav size");
console.assert(String.fromCharCode(...wav.slice(0, 4)) === "RIFF", "riff");
console.assert(new DataView(wav.buffer).getUint32(24, true) === 16000, "sr");
console.assert(sanitizeSpeaker("Yo Usuario!") === "yo_usuario", "speaker");
console.log("OK wav.selfcheck");
