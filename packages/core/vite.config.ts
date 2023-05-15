/// <reference types="vitest" />
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/core.ts",
      formats: ["es", "cjs"],
    },
  },
  plugins: [dts()],
  test: {
    environment: "jsdom",
    restoreMocks: true,
    mockReset: true,
  },
})
