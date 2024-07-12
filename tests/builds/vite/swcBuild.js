import { build } from "vite"
import react from "@vitejs/plugin-react-swc"

await build({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "App-WC",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    outDir: "dist-swc",
  },
})
