/// <reference types="vitest" />
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/pubsub.tsx",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
    },
  },
  plugins: [
    dts({
      exclude: ["src/**/*.test.*"],
      rollupTypes: true,
    }),
    react(),
  ],
  test: {
    environment: "jsdom",
    restoreMocks: true,
    mockReset: true,
  },
})
