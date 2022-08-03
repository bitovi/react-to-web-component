import { resolve } from "path"
import { defineConfig } from "vite"
import typescript from "@rollup/plugin-typescript"

export default defineConfig((configEnv) => ({
  plugins: [typescript()],
  build: {
    lib: {
      formats: ["es", "umd"],
      entry: resolve(__dirname, "src/react-to-webcomponent.js"),
      name: "react-to-webcomponent",
      fileName: (format) => `react-to-webcomponent.${format}.js`,
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "react",
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
}))
