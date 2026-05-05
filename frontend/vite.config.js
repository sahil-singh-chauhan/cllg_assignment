import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // In dev: proxy /api to local backend.
  // VITE_API_URL should be the full URL incl. /api in production;
  // for the proxy we just need the origin (protocol + host + port).
  const backendOrigin = env.VITE_API_URL
    ? new URL(env.VITE_API_URL).origin
    : 'http://localhost:8000'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
        },
      },
    },
  }
})
