import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/asr-streaming-js-demo",
  plugins: [react()],
  publicDir: resolve(__dirname, "../public"),
  resolve: {
    alias: {
      "@": resolve(__dirname),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        tts: resolve(__dirname, "tts/index.html"),
        asr: resolve(__dirname, "asr/index.html"),
      },
    },
  },
});
