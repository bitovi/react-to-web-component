import { resolve } from "path"
import { defineConfig } from "vite"
import typescript from "@rollup/plugin-typescript"
import dts from "vite-plugin-dts"

export default defineConfig((configEnv) => ({
  plugins: [
    typescript(),
    dts({
      insertTypesEntry: true,
      outputDir: "dist",
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        root: resolve(__dirname, "src/root/root.ts"),
        render: resolve(__dirname, "src/render/render.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "react",
          "react-dom": "react-dom",
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
}))
