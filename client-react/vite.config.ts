/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
  },
  server: {
    // host: true,
    host: "0.0.0.0",
    watch: {
      usePolling: true,
    },
    proxy: {
      "^/api/*": {
        target: "http://api-golang:3000",
        changeOrigin: true,
        secure: false,
      },
      "^/channel/*": {
        target: "ws://api-golang:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
