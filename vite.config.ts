import { resolve } from "path"
import { defineConfig } from "vite"
import typescript from "@rollup/plugin-typescript"

const testPathsToExclude = [
  "./src/core/core.test.tsx",
  "./src/root/root.test.tsx",
  "./src/tests/**/*",
]

export default defineConfig((configEnv) => ({
  plugins: [
    typescript({
      exclude: testPathsToExclude,
      include: ["./src/**/*"]
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        root: resolve(__dirname, "src/root/root.ts"),
        render: resolve(__dirname, "src/render/render.ts"),
        legacy: resolve(__dirname, "src/legacy/index.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "./src/tests"],
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
