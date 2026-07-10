import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward any request starting with /api to the backend server,
    // so the frontend can call the API without CORS issues in dev.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
