import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://recaudio.vercel.app",
  compressHTML: true,
  vite: {
    build: {
      cssMinify: "lightningcss",
    },
  },
  integrations: [react()],
});
