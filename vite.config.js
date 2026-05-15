import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true,          // listen on all network interfaces
    allowedHosts:[
      'dietary-week-cole-asp.trycloudflare.com'
    ], // allow host
    port: 5173,          // your dev port
    strictPort: true,
  },
})