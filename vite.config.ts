import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig((configEnv) => ({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    lib: {
      formats: ['es', 'cjs', 'umd'],
      entry: resolve(__dirname, 'src/index.js'),
      name: 'react-to-webcomponent',
      fileName: (format) => `react-to-webcomponent.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'react',
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
}))
