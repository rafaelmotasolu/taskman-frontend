import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT || env.PORT || 5173)
  const apiUrl = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port,
      proxy: {
        '/auth': apiUrl,
        '/tasks': apiUrl,
        '/ai': apiUrl,
        '/swagger-ui': apiUrl,
        '/swagger-ui.html': apiUrl,
        '/v3/api-docs': apiUrl,
      },
    },
  }
})

