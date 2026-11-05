import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // binds to 0.0.0.0 (accessible via localhost, 127.0.0.1, and local IP)
    port: 5173,
  },
})
