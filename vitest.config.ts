import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
    test: {
      environment: "jsdom",
      globals: true,
    }
})