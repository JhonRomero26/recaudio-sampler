export interface AudioBlob {
  /** Filename stem: adelante_real_yo_0000 */
  name: string;
  /** Command label folder: adelante */
  label: string;
  /** Zip path relative to root: dataset/adelante/adelante_real_yo_0000.wav */
  path: string;
  url: string;
  blob: Blob;
}
