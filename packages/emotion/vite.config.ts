/// <reference types="vitest" />
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/emotion.tsx",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "@emotion/cache",
        "@emotion/react",
        "react/jsx-runtime",
      ],
    },
  },
  plugins: [dts(), react()],
  test: {
    environment: "jsdom",
    restoreMocks: true,
    mockReset: true,
  },
})
